import DashboardNavigation from "@/components/layout/DashboardLayout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import type { optionsType } from "@/types/admin";
import type { User } from "@/types/users";
import {
  useUsers,
  useSetUserRole,
  useVerifyUser,
  useDeleteUser,
} from "../api/adminQueries";
import {
  Ellipsis,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Search,
  Trash2,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MotionButton } from "@/components/animations/MotionizedButton";
import { useNavigate } from "react-router";
import Pagination from "../components/verification/Pagination";

import AdminPageWrapper from "@/components/layout/AdminPageWrapper";
import { getAdminAnimation } from "@/utils/adminAnimations";

const Users = () => {
  // State for options and user management
  const [options, setoptions] = useState<optionsType>({
    page: 1,
    limit: 50,
    excludeAdmin: true,
    onlySubmitted: false, // Show all users by default
  });

  function setPage(page: number) {
    setoptions({ ...options, page: page });
  }
  function setLimit(limit: number) {
    setoptions({ ...options, limit: limit });
  }
  // State for modals
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // API hooks
  const { data, isPending, isError, error, isFetching } = useUsers(options);
  const setUserRole = useSetUserRole();
  const verifyUser = useVerifyUser();
  const deleteUser = useDeleteUser();

  // Users come pre-filtered from the API now
  const filteredUsers = data?.users;
  const pagination = data?.pagination;

  // Debug output to check users and their roles
  useEffect(() => {
    if (filteredUsers?.length) {
      console.log(
        "Users by role:",
        filteredUsers.reduce<Record<string, number>>((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {})
      );
    }
  }, [filteredUsers]);

  // Handlers for user actions
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setViewDetailsOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserOpen(true);
  };

  const handleApproveUser = () => {
    if (selectedUser) {
      verifyUser.mutate({
        userId: selectedUser._id,
        statusObject: { status: "approved" },
      });
      setApproveDialogOpen(false);
    }
  };
  const navigate = useNavigate();
  const onViewDetails = useCallback(
    (userId: string) => navigate(`/admin/verification/${userId}`),
    [navigate]
  );
  const handleRejectUser = () => {
    if (selectedUser) {
      verifyUser.mutate({
        userId: selectedUser._id,
        statusObject: {
          status: "rejected",
          rejectionReason: rejectionReason,
        },
      });
      setRejectDialogOpen(false);
      setRejectionReason("");
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUser.mutate({ userId: selectedUser._id });
      setDeleteDialogOpen(false);
    }
  };

  useEffect(() => {
    // Reset to initial state when component mounts
    setoptions({
      page: 1,
      limit: 20,
      excludeAdmin: true,
      onlySubmitted: false, // Show all users by default
    });
  }, []);

  return (
    <DashboardNavigation>
      <AdminPageWrapper {...getAdminAnimation("users")}>
        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl font-semibold">Manage Users</h1>
          {filteredUsers && (
            <div className="flex gap-3 items-center mt-2 sm:mt-0">
              <div className="bg-brand-primary/70 rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
                <div className="text-xs text-brand-accent">Total</div>
                <div className="text-base text-brand-accent font-semibold">
                  {pagination?.total || filteredUsers.length}
                </div>
              </div>
              <div className="bg-brand-secondary/40  text-brand-secondary  rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
                <div className="text-xs">Investors</div>
                <div className="text-base font-semibold">
                  {filteredUsers.filter((u) => u.role === "investor").length}
                </div>
              </div>
              <div className="bg-brand-accent/20  text-brand  rounded-lg px-3 py-2 flex items-center gap-2 shadow-sm">
                <div className="text-xs">Startups</div>
                <div className="text-base font-semibold">
                  {filteredUsers.filter((u) => u.role === "startup").length}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="my-6 p-4   border rounded-lg ">
          <h2 className="font-medium  mb-3">Filter Users</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div className="grid gap-1.5">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-muted-foreground"
              >
                Status
              </Label>
              <Select
                value={options.status || "all"}
                onValueChange={(v) => {
                  const value =
                    v === "all"
                      ? undefined
                      : (v as "pending" | "approved" | "rejected");
                  setoptions({ ...options, status: value, page: 1 });
                }}
              >
                <SelectTrigger id="status" className="w-44">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label
                htmlFor="role"
                className="text-sm font-medium text-muted-foreground"
              >
                Role
              </Label>
              <Select
                value={options.role || "all"}
                onValueChange={(v) => {
                  const value =
                    v === "all" ? undefined : (v as "investor" | "startup");
                  setoptions({ ...options, role: value, page: 1 });
                }}
              >
                <SelectTrigger id="role" className="w-36">
                  <SelectValue placeholder="Filter role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="startup">Startup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5 flex-grow">
              <Label
                htmlFor="search"
                className="text-sm font-medium text-muted-foreground"
              >
                Search
              </Label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  className="pl-10"
                  placeholder="Name, email, phone..."
                  value={options.q || ""}
                  onChange={(e) => {
                    setoptions({ ...options, q: e.target.value, page: 1 });
                  }}
                />
              </div>
            </div>

            <div className="grid gap-1.5 min-w-[250px]">
              <Label
                htmlFor="show-submitted"
                className="text-sm font-medium text-muted-foreground"
              >
                Submission Status
              </Label>
              <div className="flex items-center gap-2 bg-background rounded-md border px-3 py-2">
                <Checkbox
                  id="show-all"
                  checked={options.onlySubmitted === false}
                  onCheckedChange={(checked) => {
                    setoptions({
                      ...options,
                      onlySubmitted: !checked,
                      page: 1,
                    });
                  }}
                />
                <Label
                  htmlFor="show-all"
                  className="text-sm font-medium leading-none cursor-pointer select-none"
                >
                  Show All Users (including unsubmitted)
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="my-6 w-full overflow-y-auto">
          <Table>
            <TableCaption>
              {isFetching
                ? "Loading users..."
                : "A list of Finance Teque Users."}
            </TableCaption>
            <TableHeader>
              <TableRow className="even:bg-muted m-0 border-t p-0">
                <TableHead className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  FULL NAME
                </TableHead>
                <TableHead className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  EMAIL ADDRESS
                </TableHead>
                <TableHead className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  ROLE/TYPE
                </TableHead>
                <TableHead className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  STATUS
                </TableHead>
                <TableHead className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  JOINED
                </TableHead>
                <TableHead className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={5}>Loading...</TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    {(error as Error)?.message || "Failed to load users"}
                  </TableCell>
                </TableRow>
              ) : filteredUsers?.length ? (
                filteredUsers.map((u: User) => (
                  <TableRow
                    className="even:bg-brand-light hover:bg-brand-light/50 m-0 border-t p-0"
                    key={u._id}
                  >
                    <TableCell className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      {u.name || u.email}
                    </TableCell>
                    <TableCell className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      {u.email}
                    </TableCell>
                    <TableCell className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      {u.role === "investor" && u.investorType} {u.role}
                    </TableCell>
                    <TableCell className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      <Badge
                        variant={
                          u.verification?.status === "approved"
                            ? "default"
                            : u.verification?.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {u.verification?.status || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      {new Date(u.createdAt ?? "").toLocaleDateString()}
                    </TableCell>
                    <TableCell className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Open menu</span>
                              <Ellipsis className="size-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-[160px]"
                          >
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(u)}
                            >
                              <Eye className="mr-2 size-5" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(u)}>
                              <Edit className="mr-2 size-5" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {u.verification?.status !== "approved" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(u);
                                  setApproveDialogOpen(true);
                                }}
                              >
                                <CheckCircle className="mr-2 size-5 text-green-500" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {u.verification?.status !== "rejected" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(u);
                                  setRejectDialogOpen(true);
                                }}
                              >
                                <XCircle className="mr-2 size-5 text-red-500" />
                                Reject
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-50 focus:bg-red-600"
                              onClick={() => {
                                setSelectedUser(u);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="mr-2 size-5" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>No users found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {pagination && pagination.pages > 0 && (
            <Pagination
              pagination={pagination}
              isFetching={isFetching}
              limit={options.limit}
              setLimit={setLimit}
              page={options.page}
              setPage={setPage}
              showingUsers={filteredUsers?.length || 0}
              totalUsers={pagination.total || 0}
            />
          )}
        </div>

        {/* User Details Dialog */}
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed information for{" "}
                {selectedUser?.name || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {selectedUser && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-bold">Full Name:</div>
                    <div className="col-span-2">
                      {selectedUser.name || "Not provided"}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-bold">Email:</div>
                    <div className="col-span-2">{selectedUser.email}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-bold">Phone:</div>
                    <div className="col-span-2">
                      {selectedUser.phone || "Not provided"}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-bold">Role/Type:</div>
                    <div className="col-span-2">
                      {selectedUser.role === "investor" &&
                        selectedUser.investorType &&
                        `${selectedUser.investorType} - `}
                      {selectedUser.role}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-bold">Verification Status:</div>
                    <div className="col-span-2">
                      <Badge
                        variant={
                          selectedUser.verification?.status === "approved"
                            ? "default"
                            : selectedUser.verification?.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {selectedUser.verification?.status || "pending"}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-bold">Joined:</div>
                    <div className="col-span-2">
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleString()
                        : "Unknown"}
                    </div>
                  </div>
                  {/* Show verification details if available */}
                  {selectedUser.verification &&
                    selectedUser.investorType === "personal" &&
                    selectedUser.verification.personal && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold mb-2">
                          Personal Information
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="font-bold">First Name:</div>
                          <div className="col-span-2">
                            {selectedUser.verification.personal.firstName}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="font-bold">Surname:</div>
                          <div className="col-span-2">
                            {selectedUser.verification.personal.surname}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="font-bold">Age Bracket:</div>
                          <div className="col-span-2">
                            {selectedUser.verification.personal.ageBracket}
                          </div>
                        </div>
                      </div>
                    )}

                  {selectedUser.verification &&
                    selectedUser.investorType === "corporate" &&
                    selectedUser.verification.corporate && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold mb-2">
                          Company Information
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="font-bold">Company Name:</div>
                          <div className="col-span-2">
                            {selectedUser.verification.corporate.company.name}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="font-bold">Incorporation Number:</div>
                          <div className="col-span-2">
                            {
                              selectedUser.verification.corporate.company
                                .incorporationNumber
                            }
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="font-bold">Email:</div>
                          <div className="col-span-2">
                            {selectedUser.verification.corporate.company.email}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="font-bold">Address:</div>
                          <div className="col-span-2">
                            {
                              selectedUser.verification.corporate.company
                                .address
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  {selectedUser._id && (
                    <div className="flex justify-end">
                      {" "}
                      <MotionButton
                        onClick={() => onViewDetails(selectedUser._id)}
                        className=""
                      >
                        View User <ArrowRight />
                      </MotionButton>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information for{" "}
                {selectedUser?.name || selectedUser?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedUser && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="user-role" className="mb-1 block">
                      Role
                    </Label>
                    <Select
                      defaultValue={selectedUser.role}
                      onValueChange={(value) => {
                        if (selectedUser) {
                          setUserRole.mutate({
                            userId: selectedUser._id,
                            role: value as "investor" | "startup",
                          });
                        }
                      }}
                    >
                      <SelectTrigger id="user-role" className="w-full">
                        <SelectValue placeholder="Select user role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investor">Investor</SelectItem>
                        <SelectItem value="startup">Startup</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Approve User Dialog */}
        <AlertDialog
          open={approveDialogOpen}
          onOpenChange={setApproveDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve{" "}
                {selectedUser?.name || selectedUser?.email}? This will allow
                them full access to the platform.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApproveUser}
                className="bg-primary hover:bg-primary/90"
              >
                Approve
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject User Dialog */}
        <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject User</AlertDialogTitle>
              <AlertDialogDescription>
                Please provide a reason for rejecting{" "}
                {selectedUser?.name || selectedUser?.email}.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-4">
              <Label htmlFor="rejection-reason" className="mb-2 block">
                Rejection Reason
              </Label>
              <textarea
                id="rejection-reason"
                className="w-full h-24 rounded-md border px-3 py-2 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                placeholder="Provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              ></textarea>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRejectUser}
                className="bg-destructive hover:bg-destructive/90"
                disabled={!rejectionReason.trim()}
              >
                Reject
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete User Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                {selectedUser?.name || selectedUser?.email}? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminPageWrapper>
    </DashboardNavigation>
  );
};

export default Users;
