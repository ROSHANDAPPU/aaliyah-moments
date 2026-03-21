import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import TreasureBox from "@/pages/TreasureBox";
import GetPhotos from "@/pages/GetPhotos";
import LeaveReview from "@/pages/LeaveReview";
import About from "@/pages/About";
import Auth from "@/pages/Auth";
import PhotographerApp from "@/pages/PhotographerApp";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requiredRoles }: { children: React.ReactNode; requiredRoles?: string[] }) => {
  const { user, loading, roles } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (requiredRoles && !requiredRoles.some((r) => roles.includes(r as any))) {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
};

const AppRouter = () => {
  const { user, isAdmin, isManager } = useAuth();

  return (
    <>
      <Navigation />
      <Routes>
        {/* Public marketing site */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/treasure-box" element={<TreasureBox />} />
        <Route path="/get-photos" element={<GetPhotos />} />
        <Route path="/reviews" element={<LeaveReview />} />
        <Route path="/about" element={<About />} />

        {/* Auth */}
        <Route path="/auth" element={<Auth />} />

        {/* Operations */}
        <Route path="/app" element={
          <ProtectedRoute>
            <PhotographerApp />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute requiredRoles={["admin", "manager"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
