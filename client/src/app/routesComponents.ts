import { lazy } from "react";

export const HomePage = lazy(() => import("../pages/HomePage"));

export const AboutPage = lazy(() =>
  import("../pages/About").then((module) => ({ default: module.AboutPage })),
);

export const InvestmentPlansPage = lazy(() =>
  import("../pages/InvestmentPlans").then((module) => ({
    default: module.InvestmentPlansPage,
  })),
);

export const AssetFinancingPage = lazy(
  () => import("../pages/BusinessFinancing"),
);

export const TeamPage = lazy(() => import("../pages/Team"));

export const ContactPage = lazy(() =>
  import("../pages/Contact").then((module) => ({
    default: module.ContactPage,
  })),
);

export const InvestmentPlanDetailPage = lazy(
  () => import("../pages/InvestmentPlanDetails"),
);

export const StartupApplicationPage = lazy(
  () => import("../features/startup/pages/StartupVerification"),
);

export const ProfileChoicePage = lazy(
  () => import("../features/shared/pages/ChooseProfile-Role"),
);

export const InvestorFundsRedemption = lazy(
  () => import("../features/shared/pages/InvestorFundsRedemption"),
);

export const AdminDashboard = lazy(
  () => import("../features/admin/pages/AdminDashboard"),
);

export const Users = lazy(() => import("../features/admin/pages/Users"));

export const Verification = lazy(
  () => import("../features/admin/pages/Verification"),
);

export const UserVerificationDetails = lazy(
  () => import("../features/admin/pages/UserVerificationDetails"),
);

export const ManageCarouselPage = lazy(
  () => import("../features/admin/carousel/pages/ManageCarouselPage"),
);

export const ManageSubAdmin = lazy(
  () => import("../features/admin/pages/ManageSubAdmin"),
);

export const InvestorTypePage = lazy(
  () => import("../features/investors/pages/InvestorTypePage"),
);

export const CorporateVerification = lazy(
  () => import("../features/investors/corporate/pages/CorporateVerification"),
);

export const NotFoundPage = lazy(
  () => import("../components/feedback/NotFound"),
);

export const LoginPage = lazy(() =>
  import("../features/auth/pages/Login").then((module) => ({
    default: module.LoginPage,
  })),
);

export const RegisterPage = lazy(() =>
  import("../features/auth/pages/Register").then((module) => ({
    default: module.RegisterPage,
  })),
);

export const ResetPasswordPage = lazy(() =>
  import("../features/auth/pages/Forget-ResetPassword").then((module) => ({
    default: module.default,
  })),
);

export const UpdateProfilePage = lazy(() =>
  import("../features/shared/pages/Profile").then((module) => ({
    default: module.default,
  })),
);

export const VerifyEmailPage = lazy(() =>
  import("../features/auth/pages/VerifyEmail").then((module) => ({
    default: module.default,
  })),
);

export const ForgotPasswordPage = lazy(() =>
  import("../features/auth/pages/ForgotPassword").then((module) => ({
    default: module.default,
  })),
);

export const InvestorVerificationPage = lazy(() =>
  import("../features/investors/personal/pages/InvestorVerification").then(
    (module) => ({
      default: module.InvestorVerificationPage,
    }),
  ),
);

export const VerificationSuccessPage = lazy(() =>
  import("../features/shared/pages/VerificationSuccess").then((module) => ({
    default: module.VerificationSuccessPage,
  })),
);

export const DashboardPage = lazy(() =>
  import("../features/shared/pages/Dashboard").then((module) => ({
    default: module.DashboardPage,
  })),
);
