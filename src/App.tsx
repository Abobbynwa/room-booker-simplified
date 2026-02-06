import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Rooms from "./pages/Rooms";
import BookRoom from "./pages/BookRoom";
import BookingConfirmation from "./pages/BookingConfirmation";
import BookingStatus from "./pages/BookingStatus";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminApp from "./pages/AdminApp";
import AdminAppLogin from "./pages/AdminAppLogin";
import ERPDashboard from "./pages/ERPDashboard";
import ERPLogin from "./pages/ERPLogin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/book/:roomId" element={<BookRoom />} />
            <Route path="/booking-confirmation/:reference" element={<BookingConfirmation />} />
            <Route path="/booking-status" element={<BookingStatus />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/erp/login" element={<ERPLogin />} />
            <Route path="/erp" element={<ERPDashboard />} />
            <Route path="/admin-app/login" element={<AdminAppLogin />} />
            <Route 
              path="/admin-app" 
              element={
                <ProtectedRoute requireAdmin redirectTo="/admin-app/login">
                  <AdminApp />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
