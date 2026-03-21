export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      deposits: {
        Row: {
          amount: number | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          id: string
          image_url: string
          is_confirmed: boolean
          photographer_id: string
          shift_id: string
        }
        Insert: {
          amount?: number | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_confirmed?: boolean
          photographer_id: string
          shift_id: string
        }
        Update: {
          amount?: number | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_confirmed?: boolean
          photographer_id?: string
          shift_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deposits_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      discrepancy_tickets: {
        Row: {
          assigned_to: string | null
          blind_start_snapshot: Json | null
          created_at: string
          delta_summary: Json
          id: string
          photographer_id: string
          prior_end_snapshot: Json | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          shift_id: string
          status: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          assigned_to?: string | null
          blind_start_snapshot?: Json | null
          created_at?: string
          delta_summary: Json
          id?: string
          photographer_id: string
          prior_end_snapshot?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          shift_id: string
          status?: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          assigned_to?: string | null
          blind_start_snapshot?: Json | null
          created_at?: string
          delta_summary?: Json
          id?: string
          photographer_id?: string
          prior_end_snapshot?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          shift_id?: string
          status?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discrepancy_tickets_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discrepancy_tickets_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      interval_logs: {
        Row: {
          cumulative_sales: number | null
          id: string
          logged_at: string
          shift_id: string
          was_dismissed: boolean
        }
        Insert: {
          cumulative_sales?: number | null
          id?: string
          logged_at?: string
          shift_id: string
          was_dismissed?: boolean
        }
        Update: {
          cumulative_sales?: number | null
          id?: string
          logged_at?: string
          shift_id?: string
          was_dismissed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "interval_logs_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_end: {
        Row: {
          broken_frames: number
          broken_paper_sets: number
          created_at: string
          dnp_prints_remaining: number
          frames_sold_calculated: number | null
          id: string
          shift_id: string
          total_frames: number
          total_paper_sets: number
          total_sales: number
        }
        Insert: {
          broken_frames?: number
          broken_paper_sets?: number
          created_at?: string
          dnp_prints_remaining: number
          frames_sold_calculated?: number | null
          id?: string
          shift_id: string
          total_frames: number
          total_paper_sets: number
          total_sales: number
        }
        Update: {
          broken_frames?: number
          broken_paper_sets?: number
          created_at?: string
          dnp_prints_remaining?: number
          frames_sold_calculated?: number | null
          id?: string
          shift_id?: string
          total_frames?: number
          total_paper_sets?: number
          total_sales?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_end_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: true
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_start: {
        Row: {
          broken_frames: number
          broken_paper_sets: number
          created_at: string
          dnp_prints_remaining: number
          has_discrepancy: boolean
          id: string
          shift_id: string
          total_frames: number
          total_paper_sets: number
        }
        Insert: {
          broken_frames?: number
          broken_paper_sets?: number
          created_at?: string
          dnp_prints_remaining: number
          has_discrepancy?: boolean
          id?: string
          shift_id: string
          total_frames: number
          total_paper_sets: number
        }
        Update: {
          broken_frames?: number
          broken_paper_sets?: number
          created_at?: string
          dnp_prints_remaining?: number
          has_discrepancy?: boolean
          id?: string
          shift_id?: string
          total_frames?: number
          total_paper_sets?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_start_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: true
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      payments_ledger: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          entry_type: string
          id: string
          is_paid: boolean
          paid_at: string | null
          shift_id: string | null
          user_id: string
          week_number: number
          year: number
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          entry_type: string
          id?: string
          is_paid?: boolean
          paid_at?: string | null
          shift_id?: string | null
          user_id: string
          week_number: number
          year: number
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          entry_type?: string
          id?: string
          is_paid?: boolean
          paid_at?: string | null
          shift_id?: string | null
          user_id?: string
          week_number?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_ledger_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          face_hash: string | null
          full_name: string
          hourly_rate: number
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          face_hash?: string | null
          full_name: string
          hourly_rate?: number
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          face_hash?: string | null
          full_name?: string
          hourly_rate?: number
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          assistant_id: string | null
          commission_pay: number | null
          commission_rate: number | null
          created_at: string
          end_time: string | null
          final_pay: number | null
          gps_lat: number | null
          gps_lng: number | null
          helper_ratio: number | null
          hourly_pay: number | null
          hours_worked: number | null
          id: string
          is_business_trip: boolean
          notes: string | null
          overage_tip: number | null
          photographer_id: string
          selfie_url: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["shift_status"]
          total_sales: number | null
          updated_at: string
          venue_id: string
        }
        Insert: {
          assistant_id?: string | null
          commission_pay?: number | null
          commission_rate?: number | null
          created_at?: string
          end_time?: string | null
          final_pay?: number | null
          gps_lat?: number | null
          gps_lng?: number | null
          helper_ratio?: number | null
          hourly_pay?: number | null
          hours_worked?: number | null
          id?: string
          is_business_trip?: boolean
          notes?: string | null
          overage_tip?: number | null
          photographer_id: string
          selfie_url?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["shift_status"]
          total_sales?: number | null
          updated_at?: string
          venue_id: string
        }
        Update: {
          assistant_id?: string | null
          commission_pay?: number | null
          commission_rate?: number | null
          created_at?: string
          end_time?: string | null
          final_pay?: number | null
          gps_lat?: number | null
          gps_lng?: number | null
          helper_ratio?: number | null
          hourly_pay?: number | null
          hours_worked?: number | null
          id?: string
          is_business_trip?: boolean
          notes?: string | null
          overage_tip?: number | null
          photographer_id?: string
          selfie_url?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["shift_status"]
          total_sales?: number | null
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          created_at: string
          frame_stock: number
          geofence_radius_meters: number
          hosting_fee: number | null
          hosting_fee_recipient: string | null
          id: string
          is_active: boolean
          is_business_trip: boolean
          latitude: number | null
          longitude: number | null
          low_stock_threshold: number
          manager_id: string | null
          name: string
          paper_stock: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          frame_stock?: number
          geofence_radius_meters?: number
          hosting_fee?: number | null
          hosting_fee_recipient?: string | null
          id?: string
          is_active?: boolean
          is_business_trip?: boolean
          latitude?: number | null
          longitude?: number | null
          low_stock_threshold?: number
          manager_id?: string | null
          name: string
          paper_stock?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          frame_stock?: number
          geofence_radius_meters?: number
          hosting_fee?: number | null
          hosting_fee_recipient?: string | null
          id?: string
          is_active?: boolean
          is_business_trip?: boolean
          latitude?: number | null
          longitude?: number | null
          low_stock_threshold?: number
          manager_id?: string | null
          name?: string
          paper_stock?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "photographer" | "assistant" | "logistics"
      equipment_status: "operational" | "needs_maintenance" | "broken"
      shift_status: "pending" | "active" | "closed" | "held" | "disputed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "manager", "photographer", "assistant", "logistics"],
      equipment_status: ["operational", "needs_maintenance", "broken"],
      shift_status: ["pending", "active", "closed", "held", "disputed"],
    },
  },
} as const
