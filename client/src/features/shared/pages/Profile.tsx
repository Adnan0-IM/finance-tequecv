import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
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
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Trash2,
  Pencil,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DashboardNavigation from "@/components/layout/DashboardLayout";

const updateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(10, "Phone must be at least 10 digits")
    .max(20, "Phone seems too long"),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateMe, deleteMe, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
    values: {
      name: user?.name || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    form.reset({ name: user?.name || "", phone: user?.phone || "" });
  }, [user, form]);

  // Derive verification status more accurately
  const verificationStatus = useMemo(() => {
    if (user?.isVerified) {
      return "approved";
    }

    // If we have specific verification data, use that
    if (user?.verification?.status) {
      return user.verification.status as "approved" | "pending" | "rejected";
    }

    // If user has submitted verification but hasn't been reviewed yet
    if (user?.verification?.submittedAt && !user?.verification?.reviewedAt) {
      return "pending";
    }

    // Default to pending if nothing else applies
    return "pending";
  }, [user?.isVerified, user?.verification]);

  const reviewedAt = user?.verification?.reviewedAt;
  const submittedAt = user?.verification?.submittedAt;
  const rejectionReason =
    user?.verification?.rejectionReason ||
    "Your verification was rejected. Please resubmit with correct information.";

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const onSubmit = async (data: UpdateFormValues) => {
    setIsLoading(true);
    try {
      await updateMe(data);
      toast.success("Profile updated");
      setEditing(false);
    } catch (error) {
      const message = (error as Error)?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMe();
      toast.success("Account deleted");
      await logout?.();
      navigate("/login", { replace: true });
    } catch (e) {
      toast.error((e as Error).message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardNavigation>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar with avatar and actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <Avatar className="h-24 w-24 mb-4 text-2xl">
                  <AvatarFallback className="bg-brand-primary text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <h2 className="font-bold text-xl text-gray-800">
                  {user?.name || "User"}
                </h2>
                <p className="text-gray-500 text-sm mb-2">
                  {user?.email || "No email"}
                </p>
                <Badge
                  variant={
                    verificationStatus === "approved"
                      ? "default"
                      : verificationStatus === "pending"
                      ? "secondary"
                      : "outline"
                  }
                  className="mt-1 font-medium"
                >
                  {verificationStatus === "approved" ? (
                    <span className="flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified
                      Account
                    </span>
                  ) : verificationStatus === "pending" ? (
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" /> Verification
                      Pending
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Unverified
                    </span>
                  )}
                </Badge>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => setEditing(!editing)}
                  className="w-full justify-between border-gray-200 hover:text-gray-900 hover:border-brand-primary hover:bg-brand-light"
                >
                  <span className="flex items-center">
                    <Pencil className="w-4 h-4 mr-2" />
                    {editing ? "Cancel Editing" : "Edit Profile"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>

                {!user?.isVerified && (
                  <Button
                    variant="outline"
                    className="w-full justify-between border-gray-200 hover:text-gray-900 hover:border-brand-primary hover:bg-brand-light"
                    onClick={() => navigate("/investor-verification")}
                  >
                    <span className="flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Complete Verification
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      <span className="flex items-center">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action is permanent and will remove your account
                        and data. You can't undo this.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                      >
                        {isDeleting ? "Deleting..." : "Yes, delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="outline"
                  className="w-full justify-between border-gray-200 hover:text-gray-900 hover:border-brand-primary hover:bg-brand-light"
                  onClick={async () => {
                    await logout?.();
                    navigate("/login", { replace: true });
                  }}
                >
                  <span className="flex items-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Details Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Personal Information
                  </h3>
                  {!editing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditing(true)}
                      className="text-brand-primary hover:text-brand-primary-dark hover:bg-brand-light"
                    >
                      <Pencil className="w-4 h-4 mr-1.5" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {editing ? (
                <div className="p-6">
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-5"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="font-medium text-gray-700">
                              Full name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John Doe"
                                className="h-11 rounded-md border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                                autoComplete="name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-destructive" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="font-medium text-gray-700">
                              Phone
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="08012345678"
                                className="h-11 rounded-md border-gray-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition"
                                autoComplete="tel"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs text-destructive" />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-gray-300"
                          onClick={() => setEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-brand-primary hover:bg-brand-primary-dark text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? "Saving..." : "Save changes"}
                          {!isLoading && (
                            <ArrowRight className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                    <div className="p-4 sm:p-6">
                      <p className="text-sm font-medium text-gray-500">
                        Full Name
                      </p>
                      <p className="mt-1 text-gray-900">
                        {user?.name || "Not set"}
                      </p>
                    </div>
                    <div className="p-4 sm:p-6">
                      <p className="text-sm font-medium text-gray-500">
                        Email Address
                      </p>
                      <p className="mt-1 text-gray-900">
                        {user?.email || "Not set"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                    <div className="p-4 sm:p-6">
                      <p className="text-sm font-medium text-gray-500">
                        Phone Number
                      </p>
                      <p className="mt-1 text-gray-900">
                        {user?.phone || "Not set"}
                      </p>
                    </div>
                    <div className="p-4 sm:p-6 flex gap-16">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Role
                        </p>
                        <p className="mt-1 text-gray-900 capitalize">
                          {user?.role || "User"}
                        </p>
                      </div>
                      {user?.role === "investor" &&
                        user?.investorType !== "none" && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">
                              Type
                            </p>
                            <p className="mt-1 text-gray-900 capitalize">
                              {user?.investorType || "User"}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* KYC Verification data.status */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Verification status
                </h3>
              </div>

              <div className="p-6">
                <div
                  className={cn(
                    "rounded-lg border p-5",
                    verificationStatus === "approved"
                      ? "bg-green-50 border-green-100"
                      : verificationStatus === "pending"
                      ? "bg-yellow-50 border-yellow-100"
                      : "bg-red-50 border-red-100"
                  )}
                >
                  {verificationStatus === "approved" ? (
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-green-100 p-2 mt-1">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-700 mb-1">
                          Account Fully Verified
                        </h4>
                        <p className="text-sm text-green-600 mb-3">
                          Your account has been verified and you have full
                          access to all features.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">
                              Identity verification complete
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">
                              Address verification complete
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">
                              Banking information verified
                            </span>
                          </div>
                        </div>
                        {reviewedAt && (
                          <div className="mt-4 text-xs text-green-600">
                            Verified on:{" "}
                            {new Date(reviewedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : verificationStatus === "pending" ? (
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-yellow-100 p-2 mt-1">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-yellow-700 mb-1">
                          Verification In Progress
                        </h4>
                        <p className="text-sm text-yellow-600 mb-3">
                          {submittedAt
                            ? "We're reviewing your verification documents. This typically takes 1-2 business days."
                            : "Your verification process has been started but not yet completed."}
                        </p>
                        <div className="space-y-2">
                          {submittedAt ? (
                            <>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-yellow-600">
                                  Documents submitted successfully
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-yellow-600">
                                  Verification in review
                                </span>
                              </div>
                              <div className="mt-4 text-xs text-yellow-600">
                                Submitted on:{" "}
                                {new Date(submittedAt).toLocaleDateString()}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-yellow-600">
                                Verification process initiated
                              </span>
                            </div>
                          )}
                        </div>
                        {!submittedAt && (
                          <Button
                            onClick={() =>
                              navigate(
                                user?.role === "investor"
                                  ? "/investor-verification"
                                  : user?.role === "startup"
                                  ? "/startup-verification"
                                  : "/verification"
                              )
                            }
                            className="bg-brand-primary hover:bg-brand-primary-dark text-white mt-4"
                          >
                            Complete Verification
                            <ArrowRight className="ml-1.5 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Rejected state
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-red-100 p-2 mt-1">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-700 mb-1">
                          Verification Rejected
                        </h4>
                        <p className="text-sm text-red-600 mb-3">
                          {rejectionReason}
                        </p>
                        <Button
                          onClick={() =>
                            navigate(
                              user?.role === "investor"
                                ? "/investor-verification"
                                : user?.role === "startup"
                                ? "/startup-verification"
                                : "/verification"
                            )
                          }
                          className="bg-brand-primary hover:bg-brand-primary-dark text-white mt-2"
                        >
                          Try Again
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                        {reviewedAt && (
                          <div className="mt-4 text-xs text-red-600">
                            Reviewed on:{" "}
                            {new Date(reviewedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Settings Card */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">
                  Security
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-gray-500">Last updated: Never</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/reset-password")}
                    className="border-gray-200 hover:text-900 hover:border-brand-primary hover:bg-brand-light"
                  >
                    Change password
                  </Button>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Two-factor Authentication</h4>
                      <p className="text-sm text-gray-500">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      disabled
                      className="border-gray-200"
                    >
                      Coming soon
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardNavigation>
  );
}

export default ProfilePage;
