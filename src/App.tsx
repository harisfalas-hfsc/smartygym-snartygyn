import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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
          <Route path="/workout" element={<ProtectedRoute><WorkoutFlow /></ProtectedRoute>} />
          <Route path="/training-program" element={<ProtectedRoute><TrainingProgramFlow /></ProtectedRoute>} />
          <Route path="/diet-plan" element={<ProtectedRoute><DietPlanFlow /></ProtectedRoute>} />
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
