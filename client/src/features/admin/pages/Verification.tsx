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
  // Filters
  const [status, setStatus] = useState<optionsType["status"]>("pending");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
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
    }, 400);
    return () => clearTimeout(id);
  }, [search]);

  // Build query options for fetching all submitted users (for stats)
  const allSubmittedOptions = useMemo(() => {
    const opts: optionsType = {
      excludeAdmin: true,
      onlySubmitted: true,
    };
    // Add search query if defined
    if (q) {
      opts.q = q;
    }
    // Add role filter if not "all"
    if (role !== "all") {
      opts.role = role as "investor" | "startup" | "admin";
    }
    return opts;
  }, [q, role]);

  // Fetch all submitted users once for stats calculation
  const { data: allData, isPending, isFetching, isError, error } = useUsers(allSubmittedOptions);
  const { mutate: verifyUser, isPending: verifying } = useVerifyUser();

  // Calculate stats client-side from all submitted users
  const allSubmittedUsers = allData?.users ?? [];
  
  const stats = useMemo(() => {
    const total = allSubmittedUsers.length;
    const pending = allSubmittedUsers.filter(u => u.verification?.status === "pending").length;
    const approved = allSubmittedUsers.filter(u => u.verification?.status === "approved").length;
    const rejected = allSubmittedUsers.filter(u => u.verification?.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [allSubmittedUsers]);

  // Filter by selected status
  const filteredSubmittedVerificationUsers = useMemo(() => {
    if (!status) return allSubmittedUsers;
    return allSubmittedUsers.filter(u => u.verification?.status === status);
  }, [allSubmittedUsers, status]);

  const totalUsers = filteredSubmittedVerificationUsers.length;
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredSubmittedVerificationUsers.slice(start, start + limit);
  }, [filteredSubmittedVerificationUsers, page, limit]);

  // Handlers
  const onApprove = useCallback(
    (userId: string) => {
      verifyUser({ userId, statusObject: { status: "approved" } });
    },
    [verifyUser],
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
    [rejectUserId, verifyUser],
  );

  const onViewDetails = useCallback(
    (userId: string) => navigate(`/admin/verification/${userId}`),
    [navigate],
  );

  useEffect(() => {
    setPage(1);
  }, [status, search, role, limit]);

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
                {stats.total}
              </div>
            </div>

            <div className="bg-yellow-100 text-yellow-800 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
              <div className="text-xs">Pending</div>
              <div className="text-base font-semibold">
                {stats.pending}
              </div>
            </div>

            <div className="bg-green-100 text-green-800 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
              <div className="text-xs">Approved</div>
              <div className="text-base font-semibold">
                {stats.approved}
              </div>
            </div>

            <div className="bg-red-100 text-red-800 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
              <div className="text-xs">Rejected</div>
              <div className="text-base font-semibold">
                {stats.rejected}
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
          users={pagedUsers}
          error={error as Error | null}
          isError={isError}
          isFetching={isFetching}
          isPending={isPending}
          verifying={verifying}
          onApprove={onApprove}
          onReject={onReject}
          onViewDetails={onViewDetails}
        />

        {totalUsers > 0 && (
          <Pagination
            isFetching={isFetching}
            limit={limit}
            page={page}
            setLimit={setLimit}
            setPage={setPage}
            showingUsers={pagedUsers.length}
            totalUsers={totalUsers}
          />
        )}

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
