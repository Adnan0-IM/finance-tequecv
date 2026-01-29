import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useSwipeable } from "react-swipeable";
import {
  User,
  Home,
  Menu,
  X,
  LogOut,
  Bell,
  User2,
  RectangleHorizontal,
  Verified,
  Banknote
} from "lucide-react";
import SwipeableLayout from "./SwipeableLayout";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import MobileMenuMotion from "../animations/MobileDashboardMemuMotion";

const DashboardNavigation = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = window.location;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Keep the swipe navigation for page transitions
  const [enableSwipe] = useLocalStorage("enableSwipeNavigation", false);

  // Configure swipe handlers for mobile menu
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (!isMobileMenuOpen) setIsMobileMenuOpen(true);
    },
    onSwipedLeft: () => {
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    },
    trackMouse: false,
    swipeDuration: 500,
    preventScrollOnSwipe: false,
    trackTouch: true,
    delta: 50, // Sensitivity threshold
    rotationAngle: 0,
  });

  const navLinksAdmin = [
    { title: "Dashboard", path: "/admin", icon: Home },
    { title: "Verification", path: "/admin/verification", icon: Verified },
    { title: "Manage Users", path: "/admin/users", icon: User2 },
    {
      title: "Manage Carousel",
      path: "/admin/carousel",
      icon: RectangleHorizontal,
    },
    { title: "Manage SubAdmins", path: "/admin/sub-admins", icon: User },
    { title: "Profile", path: "/dashboard/profile", icon: User },
  ];

  const navLinksSubAdmin = [
    { title: "Dashboard", path: "/admin", icon: Home },
    { title: "Verification", path: "/admin/verification", icon: Verified },
    { title: "Manage Users", path: "/admin/users", icon: User2 },
    {
      title: "Manage Carousel",
      path: "/admin/carousel",
      icon: RectangleHorizontal,
    },
    { title: "Profile", path: "/dashboard/profile", icon: User },
  ];

  const navLinksInvestor = [
    { title: "Dashboard", path: "/dashboard", icon: Home },
    {title : "Funds Redemption", path: "/dashboard/funds-redemption", icon: Banknote },
    { title: "Profile", path: "/dashboard/profile", icon: User },
  ];

  const navLinksFundRaiser = [
    { title: "Dashboard", path: "/dashboard", icon: Home },
    {title: "Profile", path: "/dashboard/profile", icon: User },
  ];

  // Prefer path-based disabling (more robust than title comparisons)
  const DISABLED_PATHS = new Set<string>([
    "/dashboard/investments",
    "/dashboard/transactions",
    "/dashboard/settings",
    "/dashboard/applications",
  ]);
  const isDisabledPath = (path: string) => DISABLED_PATHS.has(path);

  let navLinks = navLinksAdmin; // Default to admin links
  if (user?.role === "admin" && !user?.isSuper) {
    navLinks = navLinksSubAdmin;
  }

  if (user?.role === "startup") {
    navLinks = navLinksFundRaiser;
  } else if (user?.role === "investor") {
    navLinks = navLinksInvestor;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user || !user.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div {...swipeHandlers} className="min-h-screen bg-background">
      {/* Sidebar Navigation (desktop) and Mobile Navigation */}
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-card border-r

        `}
      >
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <div className="flex gap-4 items-center p-2 border-b-2">
            <img
              src={logo}
              alt="Finance Teque Logo"
              className="h-9 w-auto md:h-10 lg:h-11 object-contain"
            />

            <span className="text-lg md:text-xl font-bold text-brand-dark group-hover:opacity-80 transition-opacity">
              Finance Teque Nigeria Limited
            </span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const disabled = isDisabledPath(item.path);
              return (
                <NavLink
                  key={item.title}
                  to={item.path}
                  onClick={(e) => {
                    if (disabled) {
                      e.preventDefault();
                      toast.info("This feature is coming soon.");
                    }
                  }}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors
                    ${
                      disabled
                        ? "opacity-50 cursor-not-allowed pointer-events-auto"
                        : ""
                    }
                    ${
                      isActive && location.pathname === item.path
                        ? "bg-primary text-white"
                        : "text-gray-700 hover:bg-brand-light"
                    }`
                  }
                  aria-disabled={disabled}
                  tabIndex={disabled ? -1 : 0}
                >
                  <Icon
                    className={`mr-3 size-5 ${
                      location.pathname === item.path
                        ? "text-white"
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                  />
                  {item.title}
                </NavLink>
              );
            })}
          </nav>
          {/* Logout Button in Sidebar */}
          <div className="px-2 py-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-base cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Log out
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <MobileMenuMotion>
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-xl  overflow-hidden"
            >
              {/* Header with Logo */}
              <div className="h-20 px-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex gap-2 items-center">
                  <img
                    src={logo}
                    alt="Finance Teque Logo"
                    className="h-10 w-auto object-contain"
                  />
                  <span className="text-base font-bold text-brand-dark line-clamp-2">
                    Finance Teque Nigeria Limited
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-500 cursor-pointer hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* User Profile Section */}
              <div className="py-4 px-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <Avatar className="size-12 border-2 border-primary/10 shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <button
                      onClick={() => {
                        navigate("/dashboard/profile");
                        setIsMobileMenuOpen(false);
                      }}
                      className="font-medium text-lg text-left truncate max-w-[170px] hover:text-primary transition-colors"
                    >
                      {user?.name}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      {user?.role === "admin"
                        ? user?.isSuper
                          ? "Super Admin"
                          : "Administrator"
                        : user?.role === "investor"
                        ? "Investor"
                        : "Startup"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav
                className="mt-2 px-2 space-y-1.5 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 200px)" }}
              >
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const disabled = isDisabledPath(item.path);
                  return (
                    <NavLink
                      key={item.title}
                      to={item.path}
                      onClick={(e) => {
                        if (disabled) {
                          e.preventDefault();
                          toast.info("This feature is coming soon.");
                          return;
                        }
                        setIsMobileMenuOpen(false);
                      }}
                      className={() =>
                        `group flex items-center px-3 py-2.5 text-lg font-medium rounded-md transition-all
                        ${
                          disabled
                            ? "opacity-50 cursor-not-allowed pointer-events-auto"
                            : ""
                        }
                        ${
                          isActive
                            ? "bg-primary text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-50"
                        }`
                      }
                      aria-disabled={disabled}
                      tabIndex={disabled ? -1 : 0}
                    >
                      <div className="mr-3 p-1.5 rounded-md bg-primary/5">
                        <Icon
                          className={`h-5 w-5 ${
                            disabled
                              ? "text-gray-400"
                              : isActive
                              ? "text-white"
                              : "text-primary group-hover:text-primary/80"
                          }`}
                        />
                      </div>
                      {item.title}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Mobile Logout Button */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-center text-base items-center text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Log out</span>
                </Button>
              </div>
            </div>
          </div>
        </MobileMenuMotion>
      )}

      <div className="md:pl-64">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-40 w-full py-1 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            {/* Logo and Brand */}

            <div className="flex items-center space-x-3 ">
              <img
                src={logo}
                alt="Finance Teque Logo"
                className="h-9 w-auto md:h-10 md:hidden lg:h-11"
              />
              <NavLink
                to="/"
                aria-label="Finance Teque home"
                className="group flex flex-col leading-tight "
              >
                <span className="text-lg md:hidden md:text-xl font-bold text-brand-dark group-hover:opacity-80 transition-opacity">
                  Finance Teque Nigeria Limited
                </span>
                <span className="hidden sm:block text-[10px] md:text-sm text-muted-foreground font-bold">
                  (Venture Capital Manager) <br /> Licensed by Securities and
                  Exchange Commission (SEC), Nigeria
                </span>
              </NavLink>
            </div>

            {/* Mobile Menu Button with swipe hint */}
            <div className="md:hidden flex items-center space-x-1">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Right Navigation Items */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 hover:bg-brand-primary"
                  >
                    <Avatar className="size-8">
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-base hidden lg:block">
                      {user?.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-base">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate("/dashboard/profile")}
                    className="cursor-pointer"
                  >
                    <User className="mr-2 size-5 hover:text-white" />
                    <span className="text-base">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 size-5 hover:text-white" />
                    <span className="text-base">Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <main className="p-4 sm:p-6">
          {enableSwipe ? (
            <>
              <SwipeableLayout
                navLinks={navLinks.map((link) => ({
                  title: link.title,
                  path: link.path,
                }))}
                pageTransitionProps={{
                  variant: "slide",
                  direction: "left",
                  duration: 0.35,
                }}
                swipeThreshold={75}
              >
                {children}
              </SwipeableLayout>
            </>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardNavigation;
