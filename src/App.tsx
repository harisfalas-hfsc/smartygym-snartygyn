import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthenticatedLayout } from "./components/AuthenticatedLayout";
import Community from "./pages/Community";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import WorkoutFlow from "./pages/WorkoutFlow";
import TrainingProgramFlow from "./pages/TrainingProgramFlow";
import DietPlanFlow from "./pages/DietPlanFlow";
import OneRMCalculator from "./pages/OneRMCalculator";
import BMRCalculator from "./pages/BMRCalculator";
import CalorieCalculator from "./pages/CalorieCalculator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Public workout and plan flows - anyone can explore */}
          <Route path="/workout" element={<WorkoutFlow />} />
          <Route path="/training-program" element={<TrainingProgramFlow />} />
          <Route path="/diet-plan" element={<DietPlanFlow />} />
          
          {/* Authenticated routes with motivational banner */}
          <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/community" element={<Community />} />
          </Route>
          
          {/* Public calculator routes */}
          <Route path="/1rm-calculator" element={<OneRMCalculator />} />
          <Route path="/bmr-calculator" element={<BMRCalculator />} />
          <Route path="/calorie-calculator" element={<CalorieCalculator />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
