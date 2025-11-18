import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthenticatedLayout } from "./components/AuthenticatedLayout";
import { AccessControlProvider } from "./contexts/AccessControlContext";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { CookieConsent } from "./components/CookieConsent";

import { SmartyCoach } from "./components/SmartyCoach";
import { useAdminRole } from "./hooks/useAdminRole";
import { ArticleDetail } from "./pages/ArticleDetail";
import { trackPageVisit } from "./utils/socialMediaTracking";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import WorkoutFlow from "./pages/WorkoutFlow";
import WorkoutDetail from "./pages/WorkoutDetail";
import IndividualWorkout from "./pages/IndividualWorkout";
import TrainingProgramFlow from "./pages/TrainingProgramFlow";
import TrainingProgramDetail from "./pages/TrainingProgramDetail";
import IndividualTrainingProgram from "./pages/IndividualTrainingProgram";
import DietPlanFlow from "./pages/DietPlanFlow";
import OneRMCalculator from "./pages/OneRMCalculator";
import BMRCalculator from "./pages/BMRCalculator";
import MacroTrackingCalculator from "./pages/MacroTrackingCalculator";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import About from "./pages/About";
import Tools from "./pages/Tools";
import FreeContent from "./pages/FreeContent";
import Blog from "./pages/Blog";
import CoachProfile from "./pages/CoachProfile";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Disclaimer from "./pages/Disclaimer";
import NotFound from "./pages/NotFound";
import JoinPremium from "./pages/JoinPremium";
import PremiumBenefits from "./pages/PremiumBenefits";
import PremiumComparison from "./pages/PremiumComparison";
import TakeTour from "./pages/TakeTour";
import PersonalTraining from "./pages/PersonalTraining";
import PaymentSuccess from "./pages/PaymentSuccess";
import NewsletterThankYou from "./pages/NewsletterThankYou";
import Community from "./pages/Community";
import AdminBackoffice from "./pages/AdminBackoffice";
import MigrateContent from "./pages/MigrateContent";
import ProcessLogo from "./pages/ProcessLogo";
import { AccessGate } from "./components/AccessGate";

import { InstallPWA } from "./components/InstallPWA";
import { PageTransition } from "./components/PageTransition";
import { LoadingBar } from "./components/LoadingBar";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAdmin, loading } = useAdminRole();
  
  useEffect(() => {
    // Track page visit on initial load
    trackPageVisit();
  }, []);

  return (
    <>
      <LoadingBar />
      <CookieConsent />
      <InstallPWA />
      <AccessControlProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <div className="flex-1">
            <PageTransition>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/joinpremium" element={<JoinPremium />} />
                  <Route path="/premiumbenefits" element={<PremiumBenefits />} />
                  <Route path="/premium-comparison" element={<PremiumComparison />} />
                
                {/* Public free content page */}
                <Route path="/freecontent" element={<FreeContent />} />
                <Route path="/newsletter-thank-you" element={<NewsletterThankYou />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/coach-profile" element={<CoachProfile />} />
                
                {/* Public workout and plan flows - anyone can browse */}
                <Route path="/workout" element={<WorkoutFlow />} />
                <Route path="/workout/:type" element={<WorkoutDetail />} />
                <Route path="/workout/:type/:id" element={<IndividualWorkout />} />
                <Route path="/trainingprogram" element={<TrainingProgramFlow />} />
                <Route path="/trainingprogram/:type" element={<TrainingProgramDetail />} />
                <Route path="/trainingprogram/:type/:id" element={<IndividualTrainingProgram />} />
                <Route path="/dietplan" element={<DietPlanFlow />} />
                
                {/* Exercise library is public */}
                <Route path="/exerciselibrary" element={<ExerciseLibrary />} />
                <Route path="/blog/:slug" element={<ArticleDetail />} />
                
                {/* Authenticated routes with motivational banner */}
                <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/userdashboard" element={<UserDashboard />} />
                  <Route path="/1rmcalculator" element={<OneRMCalculator />} />
                  <Route path="/bmrcalculator" element={<BMRCalculator />} />
                  <Route path="/macrocalculator" element={<MacroTrackingCalculator />} />
                  <Route path="/caloriecalculator" element={<MacroTrackingCalculator />} />
                  <Route path="/admin" element={<AdminBackoffice />} />
                  <Route path="/admin/migrate" element={<MigrateContent />} />
                  <Route path="/admin/process-logo" element={<ProcessLogo />} />
                </Route>
                
                {/* Public routes */}
                <Route path="/about" element={<About />} />
                <Route path="/community" element={<Community />} />
                <Route path="/takeatour" element={<TakeTour />} />
                <Route path="/contact" element={<Contact />} />
                {/* TEMPORARILY DISABLED - Personal Training */}
                {/* <Route path="/personal-training" element={<PersonalTraining />} /> */}
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/privacypolicy" element={<PrivacyPolicy />} />
                <Route path="/termsofservice" element={<TermsOfService />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/tools" element={<Tools />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </div>
          <Footer />
          {!loading && isAdmin && <SmartyCoach />}
          
        </div>
      </AccessControlProvider>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      storageKey="smartygym-theme"
      enableSystem={false}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
