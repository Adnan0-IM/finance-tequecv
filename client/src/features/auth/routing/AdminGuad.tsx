import { Navigate, useLocation } from "react-router";
import type { PropsWithChildren } from "react";
import { useAuth } from "../contexts/AuthContext";

// Define the props for AdminGuard
type AdminGuardProps = {
  // This could be an array of specific admin permissions or types
  allow: "superadmin" | "all";
};

export default function AdminGuard({
  allow,
  children,
}: PropsWithChildren<AdminGuardProps>) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Check if user is logged in
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  // Check if user is an admin
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // For super admin pages, check if the user has super admin privileges
  if (allow === "superadmin" && !user.isSuper) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
