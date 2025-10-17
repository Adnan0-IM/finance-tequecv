import DashboardNavigation from "@/components/layout/DashboardLayout";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { optionsType } from "@/types/admin";
import { useUsers, useVerifyUser } from "../api/adminQueries";
import VerificationToolbar, {
  type RoleFilter,
} from "../components/verification/Toolbar";
import VerificationTable from "../components/verification/Table";
import Pagination from "../components/verification/Pagination";
import RejectDialog from "../components/verification/RejectDialog";
import { useLocation, useNavigate } from "react-router";

import AdminPageWrapper from "@/components/layout/AdminPageWrapper";
import { getAdminAnimation } from "@/utils/adminAnimations";

const Verification = () => {
  // Filters and pagination
  const [status, setStatus] = useState<optionsType["status"]>("pending");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [q, setQ] = useState<string | undefined>(undefined);
  // Use the RoleFilter type imported from Toolbar component
  const [role, setRole] = useState<RoleFilter>("investor");

  // Rejection dialog state
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectUserId, setRejectUserId] = useState<string | null>(null);

  const navigate = useNavigate();

  const location = useLocation();
  const value = location.search.replace("?", "").replace("role=", "");
  useEffect(() => {
    if (
      value &&
      (value === "investor" || value === "startup" || value === "all")
    ) {
      setRole(value as RoleFilter);
    }
  }, [value]);
  // Debounce search -> q
  useEffect(() => {
    const id = setTimeout(() => {
      const val = search.trim();
      setQ(val.length ? val : undefined);
      setPage(1);
    }, 400);
    return () => clearTimeout(id);
  }, [search]);

  // Build query options
  const options = useMemo(() => {
    // Create the base options object
    const opts: optionsType = {
      page,
      limit,
      excludeAdmin: true, // Always exclude admin users
      onlySubmitted: true, // Always show only submitted verification docs
    };

    // Only add status to query if it's defined
    if (status) {
      opts.status = status;
    }

    // Add search query if defined
    if (q) {
      opts.q = q;
    }

    // Add role filter if not "all"
    if (role !== "all") {
      opts.role = role as "investor" | "startup" | "admin";
    }

    return opts;
  }, [page, limit, status, q, role]);

  // Data + actions
  const { data, isPending, isFetching, isError, error } = useUsers(options);
  const { mutate: verifyUser, isPending: verifying } = useVerifyUser();

  // Users come pre-filtered from the API now
  const filteredSubmittedVerificationUsers = data?.users ?? [];
  const pagination = data?.pagination;

  // Fetch all users with different statuses to populate the stats
  const allStatusOptions = useMemo(
    () => ({
      ...options,
      status: undefined,
      page: 1,
      limit: 1, // We only need the count, not the actual users
    }),
    [options]
  );

  const pendingOptions = useMemo(
    () => ({
      ...options,
      status: "pending" as const,
      page: 1,
      limit: 1,
    }),
    [options]
  );

  const approvedOptions = useMemo(
    () => ({
      ...options,
      status: "approved" as const,
      page: 1,
      limit: 1,
    }),
    [options]
  );

  const rejectedOptions = useMemo(
    () => ({
      ...options,
      status: "rejected" as const,
      page: 1,
      limit: 1,
    }),
    [options]
  );

  const { data: allUsersData } = useUsers(allStatusOptions);
  const { data: pendingUsersData } = useUsers(pendingOptions);
  const { data: approvedUsersData } = useUsers(approvedOptions);
  const { data: rejectedUsersData } = useUsers(rejectedOptions);

  // Handlers
  const onApprove = useCallback(
    (userId: string) => {
      verifyUser({ userId, statusObject: { status: "approved" } });
    },
    [verifyUser]
  );

  const onReject = useCallback((userId: string) => {
    setRejectUserId(userId);
    setRejectOpen(true);
  }, []);

  const onConfirmReject = useCallback(
    (reason: string) => {
      if (!rejectUserId) return;
      verifyUser({
        userId: rejectUserId,
        statusObject: { status: "rejected", rejectionReason: reason },
      });
      setRejectOpen(false);
      setRejectUserId(null);
    },
    [rejectUserId, verifyUser]
  );

  const onViewDetails = useCallback(
    (userId: string) => navigate(`/admin/verification/${userId}`),
    [navigate]
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [status, limit, role]);

  return (
    <DashboardNavigation>
      <AdminPageWrapper {...getAdminAnimation("users")}>
        <div className="flex flex-col sm:flex-row flex-wrap justify-between  mb-6">
          <h1 className="text-xl md:text-2xl font-semibold">Verification</h1>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4  gap-3 items-center mt-2 md:mt-0">
            <div className="bg-brand-primary/70 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
              <div className="text-xs text-brand-accent">Total</div>
              <div className="text-base text-brand-accent font-semibold">
                {allUsersData?.pagination?.total || 0}
              </div>
            </div>

            <div className="bg-yellow-100 text-yellow-800 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
              <div className="text-xs">Pending</div>
              <div className="text-base font-semibold">
                {pendingUsersData?.pagination?.total || 0}
              </div>
            </div>

            <div className="bg-green-100 text-green-800 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
              <div className="text-xs">Approved</div>
              <div className="text-base font-semibold">
                {approvedUsersData?.pagination?.total || 0}
              </div>
            </div>

            <div className="bg-red-100 text-red-800 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
              <div className="text-xs">Rejected</div>
              <div className="text-base font-semibold">
                {rejectedUsersData?.pagination?.total || 0}
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <VerificationToolbar
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
          role={role}
          setRole={setRole}
        />

        {/* Table */}
        <VerificationTable
          users={filteredSubmittedVerificationUsers}
          error={error as Error | null}
          isError={isError}
          isFetching={isFetching}
          isPending={isPending}
          verifying={verifying}
          onApprove={onApprove}
          onReject={onReject}
          onViewDetails={onViewDetails}
        />

        {/* Pagination */}
        {pagination?.pages && pagination.pages > 0 ? (
          <Pagination
            isFetching={isFetching}
            limit={limit}
            page={page}
            pagination={pagination}
            setLimit={setLimit}
            setPage={setPage}
            showingUsers={filteredSubmittedVerificationUsers.length || 0}
            totalUsers={pagination?.total || 0}
          />
        ) : null}

        {/* Reject dialog */}
        <RejectDialog
          open={rejectOpen}
          onOpenChange={(o) => {
            setRejectOpen(o);
            if (!o) setRejectUserId(null);
          }}
          onConfirm={onConfirmReject}
          loading={verifying}
        />
      </AdminPageWrapper>
    </DashboardNavigation>
  );
};

export default Verification;
