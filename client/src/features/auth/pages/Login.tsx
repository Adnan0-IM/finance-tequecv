import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useLocation, Link } from "react-router";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { ArrowRight, EyeIcon, EyeOff } from "lucide-react";
import { MotionButton } from "@/components/animations/MotionizedButton";
import { FadeIn } from "@/components/animations/FadeIn";
import PageTransition from "@/components/animations/PageTransition";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Assume login returns the authenticated user; if not, adjust your auth to do so.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const u: any = await login(data.email, data.password);

      toast.success("Logged in successfully!");

      // Compute post-login destination
      const role = u?.role;
      const kycStatus = u?.verification?.status as
        | "approved"
        | "pending"
        | "rejected"
        | undefined;
      const submitted = Boolean(u?.verification?.submittedAt);
      const from = (location.state)?.from?.pathname as
        | string
        | undefined;

      // Admin first
      if (role === "admin" || data.email.includes("financetequecv.com")) {
        navigate("/admin", { replace: true });
        return;
      }

      // If there's a saved "from" path and it's not an onboarding page, prefer it
      const onboardingPages = new Set([
        "/choose-profile",
        "/investor-verification",
        "/verification-success",
        "/apply-for-funding",
      ]);

      const safeFrom = from && !onboardingPages.has(from) ? from : undefined;

      if (!role || role === "none") {
        navigate("/choose-profile", { replace: true });
        return;
      }

      if (role === "investor") {
        if (kycStatus === "approved" || u?.isVerified) {
          navigate(safeFrom ?? "/dashboard", { replace: true });
          return;
        }
        if (submitted) {
          navigate("/verification-success", { replace: true });
          return;
        }
        navigate("/investor-verification", { replace: true });
        return;
      }

      if (role === "startup") {
        if (u?.isVerified) {
          navigate(safeFrom ?? "/dashboard", { replace: true });
          return;
        }
        navigate("/apply-for-funding", { replace: true });
        return;
      }

      // Fallback
      navigate(safeFrom ?? "/dashboard", { replace: true });
    } catch (error) {
      toast.error(
        <p className="text-base text-red-500">{(error as Error).message}</p>
      );
      if (
        (error as Error).message ===
        "Please verify your email before logging in."
      ) {
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <FadeIn>
        <div className="min-h-screen bg-gray-50">
          {/* <Navigation /> */}

          <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-18">
            <div className="mx-auto max-w-md w-full p-6 sm:p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold text-brand-primary">
                  Welcome back
                </h1>
                <p className="text-muted-foreground">
                  Enter your credentials to access your account
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-base font-semibold text-gray-700">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="name@example.com"
                            className="h-11 rounded-md border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-base font-semibold text-gray-700">
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              autoComplete="current-password"
                              className="h-11 rounded-md border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2 sm:right-5 top-3 sm:size-4 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeIcon /> : <EyeOff />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs text-destructive" />
                      </FormItem>
                    )}
                  />

                  <MotionButton
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.98, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                    type="submit"
                    className="w-full h-11 py-5 text-base bg-brand-primary hover:bg-brand-primary-dark focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </MotionButton>
                </form>
              </Form>

              <div className="text-center text-sm">
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to={`/register${location.search}`}
                    className="text-brand-primary font-medium hover:underline"
                  >
                    Register
                  </Link>
                </p>
                <p className="mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-brand-primary font-medium hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </PageTransition>
  );
}
