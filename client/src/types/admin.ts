import type { User } from "./users";

// Admin pagination and query options
export type optionsType = {
  page: number;
  limit: number;
  status?: "pending" | "approved" | "rejected" | "all" | "";
  q?: string;
  role?: "investor" | "startup" | "admin";
  excludeAdmin?: boolean;
  onlySubmitted?: boolean;
};

export type paginationType = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type userRolePropType = {
  userId: string;
  role: "admin" | "investor" | "startup";
};

export type verifyUserPropTypes = {
  userId: string;
  statusObject: { status: "approved" | "rejected"; rejectionReason?: string };
};

export type verificationStatustypes = {
  status: "approved" | "rejected" | "pending";
  isVerified: true;
  rejectionReason: string;
  verifiedAt: Date;
  reviewedAt: Date;
  reviewedBy: string;
  submittedAt: Date;
};

// Admin user types
export type AdminUser = User & {
  isSuper: boolean;
  permissions: AdminPermissions;
  recentActivity?: AdminActivity[];
  createdBy?: string; // ID of admin who created this admin (for sub-admins)
  lastLogin?: string;
};

export type AdminPermissions = {
  manageUsers: boolean;
  manageSubAdmins: boolean; // Only for super admins
  manageVerifications: boolean;
  manageContent: boolean;
  manageSettings: boolean;
  viewReports: boolean;
  viewLogs: boolean;
};

export type AdminActivity = {
  id: string;
  action: string;
  timestamp: string;
  details: string;
  targetId?: string;
  targetType?:
    | "user"
    | "verification"
    | "content"
    | "setting"
    | "admin"
    | "other";
};

// Form for creating a new sub-admin
export type SubAdminCreateForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  permissions: Omit<AdminPermissions, "manageSubAdmins">;
};

// Form for updating a sub-admin
export type SubAdminUpdateForm = {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  permissions?: Omit<AdminPermissions, "manageSubAdmins">;
  isActive?: boolean;
};

// Dashboard stats for admins
export type AdminDashboardStats = {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  totalInvestors: {
    personal: number;
    corporate: number;
  };
  totalStartups: number;
  recentVerifications: Array<{
    userId: string;
    userName: string;
    submittedAt: string;
    status: "pending" | "approved" | "rejected";
  }>;
};

// Admin action log entry
export type AdminActionLog = {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
  ip?: string;
  targetId?: string;
  targetType?:
    | "user"
    | "verification"
    | "content"
    | "setting"
    | "admin"
    | "other";
};
