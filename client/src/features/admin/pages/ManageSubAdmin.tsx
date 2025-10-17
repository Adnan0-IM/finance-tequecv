import { useState } from "react";
import DashboardNavigation from "@/components/layout/DashboardLayout";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Ellipsis,
  Eye,
  Trash2,
  Search,
  PlusCircle,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  useUsers,
  useDeleteUser,
  useCreateSubAdmin,
} from "../api/adminQueries";
import type { User } from "@/types/users";

// Define the Zod schema for admin creation with domain restriction
const adminFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .refine((email) => email.toLowerCase().endsWith("@financetequecv.com"), {
      message: "Email must be a financetequecv.com domain address",
    }),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Infer the TypeScript type from the schema
type AdminFormValues = z.infer<typeof adminFormSchema>;

import AdminPageWrapper from "@/components/layout/AdminPageWrapper";
import { getAdminAnimation } from "@/utils/adminAnimations";

const ManageSubAdmin = () => {
  // State for search and filtering
  const [search, setSearch] = useState("");

  // State for modals
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [viewAdminOpen, setViewAdminOpen] = useState(false);
  const [deleteAdminOpen, setDeleteAdminOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Setup react-hook-form with zod validation
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  // Get only admin users
  const { data, isPending, isError, error } = useUsers({
    page: 1,
    limit: 100,
    q: search,
  });

  const adminUsers = data?.users?.filter((user) => user.role === "admin") || [];

  // Create subadmin mutation
  const createSubAdmin = useCreateSubAdmin();

  // Delete admin mutation
  const deleteUser = useDeleteUser();

  const handleDeleteAdmin = () => {
    if (selectedAdmin?._id) {
      deleteUser.mutate(
        { userId: selectedAdmin._id },
        {
          onSuccess: () => {
            toast.success("Admin deleted successfully");
            setDeleteAdminOpen(false);
          },
          onError: (error) => {
            toast.error(error.message || "Failed to delete admin");
          },
        }
      );
    }
  };

  const onCreateAdmin = (data: AdminFormValues) => {
    createSubAdmin.mutate(data, {
      onSuccess: () => {
        toast.success("Sub-admin created successfully");
        setCreateAdminOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create sub-admin");
      },
    });
  };

  const handleViewAdmin = (admin: User) => {
    setSelectedAdmin(admin);
    setViewAdminOpen(true);
  };

  const handleDeleteDialogOpen = (admin: User) => {
    setSelectedAdmin(admin);
    setDeleteAdminOpen(true);
  };

  return (
    <DashboardNavigation>
      <AdminPageWrapper {...getAdminAnimation("subAdmin")}>
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-semibold">
            Manage Administrators
          </h1>
          <Button
            onClick={() => setCreateAdminOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusCircle className="size-4" />
            Create Admin
          </Button>
        </div>

        <div className="mt-4 mb-6">
          <div className="grid gap-1.5 max-w-md">
            <Label htmlFor="admin-search">Search Administrators</Label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                id="admin-search"
                className="pl-10"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="my-6 w-full overflow-y-auto">
          <Table>
            <TableCaption>
              {isPending ? "Loading..." : "List of system administrators"}
            </TableCaption>
            <TableHeader>
              <TableRow className="even:bg-muted m-0 border-t p-0">
                <TableHead className="border px-4 py-2 text-left font-bold">
                  NAME
                </TableHead>
                <TableHead className="border px-4 py-2 text-left font-bold">
                  EMAIL ADDRESS
                </TableHead>
                <TableHead className="border px-4 py-2 text-left font-bold">
                  PHONE
                </TableHead>
                <TableHead className="border px-4 py-2 text-left font-bold">
                  CREATED
                </TableHead>
                <TableHead className="border px-4 py-2 text-left font-bold">
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending ? (
                <TableRow>
                  <TableCell colSpan={5}>Loading administrators...</TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    {(error as Error)?.message ||
                      "Failed to load administrators"}
                  </TableCell>
                </TableRow>
              ) : adminUsers.length ? (
                adminUsers.map((admin: User) => (
                  <TableRow
                    className="even:bg-brand-light hover:bg-brand-light/50 m-0 border-t p-0"
                    key={admin._id}
                  >
                    <TableCell className="border px-4 py-2 text-left">
                      {admin.name || admin.email}
                    </TableCell>
                    <TableCell className="border px-4 py-2 text-left">
                      {admin.email}
                    </TableCell>
                    <TableCell className="border px-4 py-2 text-left">
                      {admin.phone || "Not provided"}
                    </TableCell>
                    <TableCell className="border px-4 py-2 text-left">
                      {new Date(admin.createdAt ?? "").toLocaleDateString()}
                    </TableCell>
                    <TableCell className="border px-4 py-2">
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
                              onClick={() => handleViewAdmin(admin)}
                            >
                              <Eye className="mr-2 size-5" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-50 focus:bg-red-600"
                              onClick={() => handleDeleteDialogOpen(admin)}
                            >
                              <Trash2 className="mr-2 size-5" />
                              Delete Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>No administrators found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create Admin Dialog with Zod validation */}
        <Dialog
          open={createAdminOpen}
          onOpenChange={(open) => {
            setCreateAdminOpen(open);
            if (!open) form.reset();
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Administrator</DialogTitle>
              <DialogDescription>
                Add a new administrator with system access.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onCreateAdmin)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          className="py-5"
                          placeholder="Enter full name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          className="py-5"
                          type="email"
                          placeholder="name@financetequecv.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Only emails with @financetequecv.com domain are allowed
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          className="py-5"
                          type="tel"
                          placeholder="Enter phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            className="py-5"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute top-2 right-3 text-muted-foreground hover:text-black transform transition"
                          >
                            {showPassword ? <Eye /> : <EyeOff />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCreateAdminOpen(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className=""
                    type="submit"
                    disabled={createSubAdmin.isPending}
                  >
                    {createSubAdmin.isPending ? "Creating..." : "Create Admin"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* View Admin Dialog */}
        <Dialog open={viewAdminOpen} onOpenChange={setViewAdminOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Administrator Details</DialogTitle>
              <DialogDescription>
                Information about {selectedAdmin?.name || selectedAdmin?.email}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedAdmin && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-bold">Full Name:</div>
                    <div className="col-span-2">
                      {selectedAdmin.name || "Not provided"}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-bold">Email:</div>
                    <div className="col-span-2">{selectedAdmin.email}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-bold">Phone:</div>
                    <div className="col-span-2">
                      {selectedAdmin.phone || "Not provided"}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-bold">Role:</div>
                    <div className="col-span-2">
                      <Badge variant="default">Administrator</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-bold">Created:</div>
                    <div className="col-span-2">
                      {selectedAdmin.createdAt
                        ? new Date(selectedAdmin.createdAt).toLocaleString()
                        : "Unknown"}
                    </div>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Admin Dialog */}
        <AlertDialog open={deleteAdminOpen} onOpenChange={setDeleteAdminOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Administrator</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                {selectedAdmin?.name || selectedAdmin?.email}? This action will
                remove their administrator access and cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAdmin}
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

export default ManageSubAdmin;
