import { Route, Routes } from "react-router";
import Loader from "../components/feedback/Loader";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense } from "react";
import { Toaster } from "sonner";

import ProtectedRoute from "@/features/auth/routing/ProtectedRoute";
import OnboardingGuard from "@/features/auth/routing/OnboardingGuard";
import RoleGuard from "@/features/auth/routing/RoleGuard";
import AdminGuard from "@/features/auth/routing/AdminGuad";
import {
  HomePage,
  AboutPage,
  AssetFinancingPage,
  InvestmentPlansPage,
  InvestmentPlanDetailPage,
  TeamPage,
  ContactPage,
  ProfileChoicePage,
  InvestorTypePage,
  CorporateVerification,
  InvestorFundsRedemption,
  StartupApplicationPage,
  AdminDashboard,
  Verification,
  UserVerificationDetails,
  Users,
  ManageCarouselPage,
  ManageSubAdmin,
  DashboardPage,
  UpdateProfilePage,
  InvestorVerificationPage,
  VerificationSuccessPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  VerifyEmailPage,
  ResetPasswordPage,
  NotFoundPage,
} from "./routesComponents";

export default function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3 }}
      >
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={
              <Suspense fallback={<Loader />}>
                <HomePage />
              </Suspense>
            }
          />
          <Route
            path="/about"
            element={
              <Suspense fallback={<Loader />}>
                <AboutPage />
              </Suspense>
            }
          />
          <Route
            path="/asset-financing"
            element={
              <Suspense fallback={<Loader />}>
                <AssetFinancingPage />
              </Suspense>
            }
          />
          <Route
            path="/plans"
            element={
              <Suspense fallback={<Loader />}>
                <InvestmentPlansPage />
              </Suspense>
            }
          />
          <Route
            path="/plans/:planId"
            element={
              <Suspense fallback={<Loader />}>
                <InvestmentPlanDetailPage />
              </Suspense>
            }
          />
          <Route
            path="/team"
            element={
              <Suspense fallback={<Loader />}>
                <TeamPage />
              </Suspense>
            }
          />
          <Route
            path="/contact"
            element={
              <Suspense fallback={<Loader />}>
                <ContactPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
          <Route
            path="/login"
            element={
              <Suspense fallback={<Loader />}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<Loader />}>
                <RegisterPage />
              </Suspense>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<Loader />}>
                <ForgotPasswordPage />
              </Suspense>
            }
          />
          <Route
            path="/verify-email"
            element={
              <Suspense fallback={<Loader />}>
                <VerifyEmailPage />
              </Suspense>
            }
          />
          <Route
            path="/reset-password"
            element={
              <Suspense fallback={<Loader />}>
                <ResetPasswordPage />
              </Suspense>
            }
          />

          {/* Protected Routes  */}
          <Route
            path="/choose-profile"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <ProfileChoicePage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor-type"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <InvestorTypePage />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/corporate-verification"
            element={
              <ProtectedRoute>
                <OnboardingGuard>
                  <CorporateVerification />
                </OnboardingGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/investor-verification"
            element={
              // <ProtectedRoute>
              //   <RoleGuard allow={["investor"]}>
              //     <OnboardingGuard>
              <Suspense fallback={<Loader />}>
                <InvestorVerificationPage />
              </Suspense>
              //     </OnboardingGuard>
              //   </RoleGuard>
              // </ProtectedRoute>
            }
          />

          <Route
            path="/verification-success"
            element={
              <ProtectedRoute>
                <RoleGuard allow={["investor", "startup"]}>
                  <OnboardingGuard>
                    <Suspense fallback={<Loader />}>
                      <VerificationSuccessPage />
                    </Suspense>
                  </OnboardingGuard>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/apply-for-funding"
            element={
              <ProtectedRoute>
                <RoleGuard allow={["startup"]}>
                  <OnboardingGuard>
                    <StartupApplicationPage />
                  </OnboardingGuard>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allow={["investor", "startup"]}>
                  <OnboardingGuard>
                    <Suspense fallback={<Loader />}>
                      <DashboardPage />
                    </Suspense>
                  </OnboardingGuard>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/funds-redemption"
            element={
              <ProtectedRoute>
                <RoleGuard allow={["investor"]}>
                  <OnboardingGuard>
                    <Suspense fallback={<Loader />}>
                      <InvestorFundsRedemption />
                    </Suspense>
                  </OnboardingGuard>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <RoleGuard allow={["investor", "startup", "admin"]}>
                  <Suspense fallback={<Loader />}>
                    <UpdateProfilePage />
                  </Suspense>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          {/* Admin-only routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGuard allow={["admin"]}>
                  <AdminDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/verification"
            element={
              <ProtectedRoute>
                <RoleGuard allow={["admin"]}>
                  <Verification />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verification/:userId"
            element={
              <ProtectedRoute>
                <RoleGuard allow={["admin"]}>
                  <UserVerificationDetails />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleGuard allow={["admin"]}>
                  <Users />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/carousel"
            element={
              <ProtectedRoute>
                <RoleGuard allow={["admin"]}>
                  <ManageCarouselPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sub-admins"
            element={
              <ProtectedRoute>
                <RoleGuard allow={["admin"]}>
                  <AdminGuard allow="superadmin">
                    <ManageSubAdmin />
                  </AdminGuard>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
        </Routes>

        <Toaster richColors position="top-right" duration={3000} />
      </motion.div>
    </AnimatePresence>
  );
}
