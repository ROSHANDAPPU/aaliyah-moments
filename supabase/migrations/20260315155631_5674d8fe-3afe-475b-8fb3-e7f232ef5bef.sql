
-- 1. Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'photographer', 'assistant', 'logistics');
CREATE TYPE public.shift_status AS ENUM ('pending', 'active', 'closed', 'held', 'disputed');
CREATE TYPE public.equipment_status AS ENUM ('operational', 'needs_maintenance', 'broken');

-- 2. Timestamp utility
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. user_roles table FIRST (before has_role function)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Now create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- 5. RLS for user_roles
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL, phone TEXT, email TEXT,
  hourly_rate NUMERIC(8,2) NOT NULL DEFAULT 15.00,
  face_hash TEXT, avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Managers read profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'), NEW.email);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'photographer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. venues
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, latitude NUMERIC(10,7), longitude NUMERIC(10,7),
  geofence_radius_meters INTEGER NOT NULL DEFAULT 100,
  manager_id UUID REFERENCES auth.users(id),
  is_business_trip BOOLEAN NOT NULL DEFAULT false,
  frame_stock INTEGER NOT NULL DEFAULT 0, paper_stock INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  hosting_fee NUMERIC(8,2) DEFAULT 0, hosting_fee_recipient TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read venues" ON public.venues FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage venues" ON public.venues FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_venues_updated_at BEFORE UPDATE ON public.venues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. shifts
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id),
  photographer_id UUID NOT NULL REFERENCES auth.users(id),
  assistant_id UUID REFERENCES auth.users(id),
  status shift_status NOT NULL DEFAULT 'pending',
  start_time TIMESTAMPTZ, end_time TIMESTAMPTZ,
  hours_worked NUMERIC(5,2), helper_ratio NUMERIC(5,2) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  commission_rate NUMERIC(5,2), commission_pay NUMERIC(8,2),
  hourly_pay NUMERIC(8,2), final_pay NUMERIC(8,2), overage_tip NUMERIC(8,2) DEFAULT 0,
  is_business_trip BOOLEAN NOT NULL DEFAULT false,
  selfie_url TEXT, gps_lat NUMERIC(10,7), gps_lng NUMERIC(10,7),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers see own" ON public.shifts FOR SELECT USING (auth.uid() = photographer_id OR auth.uid() = assistant_id);
CREATE POLICY "Admins see all" ON public.shifts FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Managers see venue" ON public.shifts FOR SELECT USING (EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_id AND v.manager_id = auth.uid()));
CREATE POLICY "Photographers create" ON public.shifts FOR INSERT WITH CHECK (auth.uid() = photographer_id);
CREATE POLICY "Photographers update own" ON public.shifts FOR UPDATE USING (auth.uid() = photographer_id);
CREATE POLICY "Admins manage shifts" ON public.shifts FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON public.shifts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. inventory_start
CREATE TABLE public.inventory_start (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL UNIQUE REFERENCES public.shifts(id) ON DELETE CASCADE,
  total_frames INTEGER NOT NULL, broken_frames INTEGER NOT NULL DEFAULT 0,
  total_paper_sets INTEGER NOT NULL, broken_paper_sets INTEGER NOT NULL DEFAULT 0,
  dnp_prints_remaining INTEGER NOT NULL,
  has_discrepancy BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_start ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photo see own inv_s" ON public.inventory_start FOR SELECT USING (EXISTS (SELECT 1 FROM public.shifts s WHERE s.id = shift_id AND s.photographer_id = auth.uid()));
CREATE POLICY "Photo insert inv_s" ON public.inventory_start FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.shifts s WHERE s.id = shift_id AND s.photographer_id = auth.uid()));
CREATE POLICY "Admin inv_s" ON public.inventory_start FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Manager read inv_s" ON public.inventory_start FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- 10. inventory_end
CREATE TABLE public.inventory_end (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL UNIQUE REFERENCES public.shifts(id) ON DELETE CASCADE,
  total_frames INTEGER NOT NULL, broken_frames INTEGER NOT NULL DEFAULT 0,
  total_paper_sets INTEGER NOT NULL, broken_paper_sets INTEGER NOT NULL DEFAULT 0,
  dnp_prints_remaining INTEGER NOT NULL,
  total_sales INTEGER NOT NULL, frames_sold_calculated INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_end ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photo see own inv_e" ON public.inventory_end FOR SELECT USING (EXISTS (SELECT 1 FROM public.shifts s WHERE s.id = shift_id AND s.photographer_id = auth.uid()));
CREATE POLICY "Photo insert inv_e" ON public.inventory_end FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.shifts s WHERE s.id = shift_id AND s.photographer_id = auth.uid()));
CREATE POLICY "Admin inv_e" ON public.inventory_end FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Manager read inv_e" ON public.inventory_end FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- 11. interval_logs
CREATE TABLE public.interval_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  cumulative_sales INTEGER, was_dismissed BOOLEAN NOT NULL DEFAULT false,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interval_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photo see own logs" ON public.interval_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.shifts s WHERE s.id = shift_id AND s.photographer_id = auth.uid()));
CREATE POLICY "Photo insert logs" ON public.interval_logs FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.shifts s WHERE s.id = shift_id AND s.photographer_id = auth.uid()));
CREATE POLICY "Admin logs" ON public.interval_logs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Manager read logs" ON public.interval_logs FOR SELECT USING (public.has_role(auth.uid(), 'manager'));

-- 12. discrepancy_tickets
CREATE TABLE public.discrepancy_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id),
  shift_id UUID NOT NULL REFERENCES public.shifts(id),
  photographer_id UUID NOT NULL REFERENCES auth.users(id),
  delta_summary JSONB NOT NULL,
  prior_end_snapshot JSONB, blind_start_snapshot JSONB,
  assigned_to UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'escalated')),
  resolution_notes TEXT, resolved_at TIMESTAMPTZ, resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.discrepancy_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin tickets" ON public.discrepancy_tickets FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Manager read tickets" ON public.discrepancy_tickets FOR SELECT USING (public.has_role(auth.uid(), 'manager') AND EXISTS (SELECT 1 FROM public.venues v WHERE v.id = venue_id AND v.manager_id = auth.uid()));
CREATE POLICY "Manager update assigned" ON public.discrepancy_tickets FOR UPDATE USING (public.has_role(auth.uid(), 'manager') AND assigned_to = auth.uid());
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.discrepancy_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. payments_ledger
CREATE TABLE public.payments_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  shift_id UUID REFERENCES public.shifts(id),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('commission', 'hourly', 'bonus', 'adjustment', 'hosting_fee', 'expense')),
  amount NUMERIC(10,2) NOT NULL, description TEXT,
  week_number INTEGER NOT NULL, year INTEGER NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT false, paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.payments_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own ledger" ON public.payments_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins ledger" ON public.payments_ledger FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 14. deposits
CREATE TABLE public.deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES public.shifts(id),
  photographer_id UUID NOT NULL REFERENCES auth.users(id),
  image_url TEXT NOT NULL, amount NUMERIC(10,2),
  is_confirmed BOOLEAN NOT NULL DEFAULT false,
  confirmed_by UUID REFERENCES auth.users(id), confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photo see own dep" ON public.deposits FOR SELECT USING (auth.uid() = photographer_id);
CREATE POLICY "Photo create dep" ON public.deposits FOR INSERT WITH CHECK (auth.uid() = photographer_id);
CREATE POLICY "Admin dep" ON public.deposits FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 15. Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('shift-photos', 'shift-photos', false);
CREATE POLICY "Upload shift photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shift-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "View own photos" ON storage.objects FOR SELECT USING (bucket_id = 'shift-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admin view photos" ON storage.objects FOR SELECT USING (bucket_id = 'shift-photos' AND public.has_role(auth.uid(), 'admin'));

-- 16. Indexes
CREATE INDEX idx_shifts_venue ON public.shifts(venue_id);
CREATE INDEX idx_shifts_photographer ON public.shifts(photographer_id);
CREATE INDEX idx_shifts_status ON public.shifts(status);
CREATE INDEX idx_shifts_date ON public.shifts(start_time);
CREATE INDEX idx_interval_logs_shift ON public.interval_logs(shift_id);
CREATE INDEX idx_payments_user_week ON public.payments_ledger(user_id, year, week_number);
CREATE INDEX idx_discrepancy_status ON public.discrepancy_tickets(status);
