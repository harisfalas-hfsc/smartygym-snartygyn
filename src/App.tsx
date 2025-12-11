import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthenticatedLayout } from "./components/AuthenticatedLayout";
import { AdminRoute } from "./components/AdminRoute";
import { AccessControlProvider } from "./contexts/AccessControlContext";
import { NavigationHistoryProvider } from "./contexts/NavigationHistoryContext";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { CookieConsent } from "./components/CookieConsent";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useSessionExpiry } from "./hooks/useSessionExpiry";

import { SmartyCoach } from "./components/SmartyCoach";
import { useAdminRole } from "./hooks/useAdminRole";
import { ArticleDetail } from "./pages/ArticleDetail";
import { trackPageVisit } from "./utils/socialMediaTracking";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import WorkoutFlow from "./pages/WorkoutFlow";
import WorkoutDetail from "./pages/WorkoutDetail";
import IndividualWorkout from "./pages/IndividualWorkout";
import SmartyWorkout from "./pages/SmartyWorkout";
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

import Tools from "./pages/Tools";
import FreeContent from "./pages/FreeContent";
import Blog from "./pages/Blog";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import CoachProfile from "./pages/CoachProfile";
import CoachCV from "./pages/CoachCV";
import Contact from "./pages/Contact";
import Shop from "./pages/Shop";
import TableTest from "./pages/TableTest";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Disclaimer from "./pages/Disclaimer";
import NotFound from "./pages/NotFound";
import JoinPremium from "./pages/JoinPremium";
import SmartyCorporate from "./pages/SmartyCorporate";
import PremiumBenefits from "./pages/PremiumBenefits";
import PremiumComparison from "./pages/PremiumComparison";
import TakeTour from "./pages/TakeTour";

import PaymentSuccess from "./pages/PaymentSuccess";
import NewsletterThankYou from "./pages/NewsletterThankYou";
import Unsubscribe from "./pages/Unsubscribe";
import Community from "./pages/Community";
import AdminBackoffice from "./pages/AdminBackoffice";
import MigrateContent from "./pages/MigrateContent";
import ProcessLogo from "./pages/ProcessLogo";
import AppSubmission from "./pages/AppSubmission";
import AppSubmissionPrintable from "./pages/AppSubmissionPrintable";
import BrochureIndividual from "./pages/BrochureIndividual";
import BrochureCorporate from "./pages/BrochureCorporate";
import { AccessGate } from "./components/AccessGate";

import { InstallPWA } from "./components/InstallPWA";
import { PageTransition } from "./components/PageTransition";
import { LoadingBar } from "./components/LoadingBar";
import { AnnouncementManager } from "./components/announcements/AnnouncementManager";

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
      <CookieConsent />
      <InstallPWA />
      <AccessControlProvider>
        <AnnouncementManager />
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <div className="flex-1 pt-24 sm:pt-28 md:pt-32 lg:pt-36">
            <PageTransition>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/joinpremium" element={<JoinPremium />} />
                  <Route path="/premiumbenefits" element={<PremiumBenefits />} />
                  <Route path="/premium-comparison" element={<PremiumComparison />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/faq" element={<FAQ />} />
                
                {/* Public free content page */}
                <Route path="/freecontent" element={<FreeContent />} />
                <Route path="/newsletter-thank-you" element={<NewsletterThankYou />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
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
                <Route path="/smartyworkout" element={<SmartyWorkout />} />
                <Route path="/trainingprogram" element={<TrainingProgramFlow />} />
                <Route path="/trainingprogram/:type" element={<TrainingProgramDetail />} />
                <Route path="/trainingprogram/:type/:id" element={<IndividualTrainingProgram />} />
                
                {/* Corporate page is public */}
                <Route path="/corporate" element={<SmartyCorporate />} />
                <Route path="/corporate-admin" element={<ProtectedRoute><CorporateAdmin /></ProtectedRoute>} />
                
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
                </Route>
                
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
                
                
                {/* Public routes */}
                
                <Route path="/community" element={<Community />} />
                <Route path="/takeatour" element={<TakeTour />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/termsofservice" element={<TermsOfService />} />
                <Route path="/disclaimer" element={<Disclaimer />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/table-test" element={<TableTest />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </div>
          <Footer />
          {/* {!loading && isAdmin && <SmartyCoach />} */}
          
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
          <NavigationHistoryProvider>
            <AppContent />
          </NavigationHistoryProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
