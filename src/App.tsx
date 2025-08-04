import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Records from "./pages/Records";
import Students from "./pages/Students";
import Schedule from "./pages/Schedule";
import Accounts from "./pages/Accounts";
import ExcuseApplications from "./pages/ExcuseApplications";
import TakeAttendance from "./pages/TakeAttendance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/records" element={<Records />} />
            <Route path="/excuse-applications" element={<ExcuseApplications />} />
            <Route path="/students" element={<Students />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/take-attendance" element={<TakeAttendance />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
