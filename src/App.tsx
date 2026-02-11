import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { DeviceThemeDefault } from "./components/DeviceThemeDefault";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthenticatedLayout } from "./components/AuthenticatedLayout";
import { AdminRoute } from "./components/AdminRoute";
import { trackPageVisit } from "./utils/socialMediaTracking";
import { ScrollToTop } from "./components/ScrollToTop";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { useSessionExpiry } from "./hooks/useSessionExpiry";

import { AccessControlProvider } from "./contexts/AccessControlContext";
import { NavigationHistoryProvider } from "./contexts/NavigationHistoryContext";
import { Navigation } from "./components/Navigation";
import { FixedBackButton } from "./components/FixedBackButton";
import { Footer } from "./components/Footer";
import { useAdminRole } from "./hooks/useAdminRole";
import { ArticleDetail } from "./pages/ArticleDetail";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import UserDashboard from "./pages/UserDashboard";
import WorkoutFlow from "./pages/WorkoutFlow";
import WorkoutDetail from "./pages/WorkoutDetail";
import IndividualWorkout from "./pages/IndividualWorkout";
import WODArchive from "./pages/WODArchive";
import DailySmartyRitual from "./pages/DailySmartyRitual";
import WODCategory from "./pages/WODCategory";
import TrainingProgramFlow from "./pages/TrainingProgramFlow";
import TrainingProgramDetail from "./pages/TrainingProgramDetail";
import IndividualTrainingProgram from "./pages/IndividualTrainingProgram";
import OneRMCalculator from "./pages/OneRMCalculator";
import BMRCalculator from "./pages/BMRCalculator";
import MacroTrackingCalculator from "./pages/MacroTrackingCalculator";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import CorporateAdmin from "./pages/CorporateAdmin";
import CalculatorHistory from "./pages/CalculatorHistory";

import Tools from "./pages/Tools";

import Blog from "./pages/Blog";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import CoachProfile from "./pages/CoachProfile";
import CoachCV from "./pages/CoachCV";
import Contact from "./pages/Contact";
import TakeATour from "./pages/TakeATour";
import Shop from "./pages/Shop";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Disclaimer from "./pages/Disclaimer";
import NotFound from "./pages/NotFound";
import JoinPremium from "./pages/JoinPremium";
import SmartyCorporate from "./pages/SmartyCorporate";
import CorporateWellness from "./pages/CorporateWellness";
import HumanPerformance from "./pages/HumanPerformance";
import WhyInvestInSmartyGym from "./pages/WhyInvestInSmartyGym";
import PremiumBenefits from "./pages/PremiumBenefits";
import PremiumComparison from "./pages/PremiumComparison";
import SmartyPlans from "./pages/SmartyPlans";

import PaymentSuccess from "./pages/PaymentSuccess";
import NewsletterThankYou from "./pages/NewsletterThankYou";
import Unsubscribe from "./pages/Unsubscribe";
import UnsubscribeHelp from "./pages/UnsubscribeHelp";
import Community from "./pages/Community";
import AdminBackoffice from "./pages/AdminBackoffice";
import ExportVideoPage from "./pages/admin/ExportVideoPage";
import MigrateContent from "./pages/MigrateContent";
import ProcessLogo from "./pages/ProcessLogo";
import AppSubmission from "./pages/AppSubmission";
import AppSubmissionPrintable from "./pages/AppSubmissionPrintable";
import BrochureIndividual from "./pages/BrochureIndividual";
import BrochureCorporate from "./pages/BrochureCorporate";
import BrochureCronJobs from "./pages/BrochureCronJobs";
import { AccessGate } from "./components/AccessGate";

import { PageTransition } from "./components/PageTransition";
import { LoadingBar } from "./components/LoadingBar";
import { AnnouncementManager } from "./components/announcements/AnnouncementManager";
import { ExitIntentPopup } from "./components/growth/ExitIntentPopup";

import { SocialProofToast } from "./components/growth/SocialProofToast";
import { PromoBanner } from "./components/growth/PromoBanner";

// Redirect component for /dashboard to /userdashboard
const DashboardRedirect = () => {
  const location = useLocation();
  return <Navigate to={`/userdashboard${location.search}`} replace />;
};

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAdmin, loading } = useAdminRole();
  useSessionExpiry();

  useEffect(() => {
    // Track page visit on initial load
    trackPageVisit();
  }, []);

  return (
    <>
      <LoadingBar />
      <AccessControlProvider>
        <AnnouncementManager />
        <ExitIntentPopup />
        <SocialProofToast />
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <FixedBackButton />
            <div className="flex-1" style={{ paddingTop: 'var(--app-header-h, 100px)' }}>
            <PageTransition>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/joinpremium" element={<JoinPremium />} />
                  <Route path="/join-premium" element={<JoinPremium />} />
                  <Route path="/premiumbenefits" element={<PremiumBenefits />} />
                  <Route path="/premium-comparison" element={<PremiumComparison />} />
                  <Route path="/smarty-plans" element={<SmartyPlans />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/faq" element={<FAQ />} />
                
                <Route path="/newsletter-thank-you" element={<NewsletterThankYou />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/unsubscribe-help" element={<UnsubscribeHelp />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/coach-profile" element={<CoachProfile />} />
                <Route path="/coach-cv" element={<CoachCV />} />
                
                {/* Public workout and plan flows - anyone can browse */}
                <Route path="/workout" element={<WorkoutFlow />} />
                <Route path="/workout/wod" element={<WODCategory />} />
                <Route path="/workout/:type" element={<WorkoutDetail />} />
                <Route path="/workout/:type/:id" element={<IndividualWorkout />} />
                <Route path="/wod-archive" element={<WODArchive />} />
                <Route path="/daily-ritual" element={<DailySmartyRitual />} />
                <Route path="/trainingprogram" element={<TrainingProgramFlow />} />
                <Route path="/trainingprogram/:type" element={<TrainingProgramDetail />} />
                <Route path="/trainingprogram/:type/:id" element={<IndividualTrainingProgram />} />
                
                {/* Corporate page is public */}
                <Route path="/corporate" element={<SmartyCorporate />} />
                <Route path="/corporate-wellness" element={<CorporateWellness />} />
                <Route path="/human-performance" element={<HumanPerformance />} />
                <Route path="/why-invest-in-smartygym" element={<WhyInvestInSmartyGym />} />
                <Route path="/corporate-admin" element={<ProtectedRoute><CorporateAdmin /></ProtectedRoute>} />
                
                {/* Exercise library is public */}
                <Route path="/exerciselibrary" element={<ExerciseLibrary />} />
                <Route path="/blog/:slug" element={<ArticleDetail />} />
                
                <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
                  <Route path="/userdashboard" element={<UserDashboard />} />
                  <Route path="/1rmcalculator" element={<OneRMCalculator />} />
                  <Route path="/bmrcalculator" element={<BMRCalculator />} />
                  <Route path="/macrocalculator" element={<MacroTrackingCalculator />} />
                  <Route path="/caloriecalculator" element={<MacroTrackingCalculator />} />
                  <Route path="/calculator-history" element={<CalculatorHistory />} />
                </Route>
                
                {/* Redirect /dashboard to /userdashboard */}
                <Route path="/dashboard" element={<DashboardRedirect />} />
                
                {/* Admin Routes with Role Check */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminBackoffice />
                  </AdminRoute>
                } />
                <Route path="/admin/migrate" element={
                  <AdminRoute>
                    <MigrateContent />
                  </AdminRoute>
                } />
                <Route path="/admin/process-logo" element={
                  <AdminRoute>
                    <ProcessLogo />
                  </AdminRoute>
                } />
                <Route path="/app-submission" element={
                  <AdminRoute>
                    <AppSubmission />
                  </AdminRoute>
                } />
                <Route path="/app-submission-printable" element={
                  <AdminRoute>
                    <AppSubmissionPrintable />
                  </AdminRoute>
                } />
                <Route path="/admin/brochure-individual" element={
                  <AdminRoute>
                    <BrochureIndividual />
                  </AdminRoute>
                } />
                <Route path="/admin/brochure-corporate" element={
                  <AdminRoute>
                    <BrochureCorporate />
                  </AdminRoute>
                } />
                <Route path="/admin/brochure-cron-jobs" element={
                  <AdminRoute>
                    <BrochureCronJobs />
                  </AdminRoute>
                } />
                <Route path="/admin/export-video" element={
                  <AdminRoute>
                    <ExportVideoPage />
                  </AdminRoute>
                } />
                
                
                {/* Public routes */}
                
                <Route path="/community" element={<Community />} />
                <Route path="/takeatour" element={<TakeATour />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/termsofservice" element={<TermsOfService />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/shop" element={<Shop />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </div>
        <Footer />
        
      </div>
    </AccessControlProvider>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      storageKey=""
      enableSystem={false}
    >
      <DeviceThemeDefault />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <NavigationHistoryProvider>
            <AppContent />
          </NavigationHistoryProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
