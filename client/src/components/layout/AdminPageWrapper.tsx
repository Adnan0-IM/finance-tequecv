import type { ReactNode } from "react";
import PageTransition from "../animations/PageTransition";

interface AdminPageWrapperProps {
  children: ReactNode;
  variant?: "fade" | "slide" | "zoom" | "blur" | "wipe";
  direction?: "up" | "down" | "left" | "right";
}

/**
 * Wrapper component that applies consistent animations to admin pages
 * using the PageTransition component.
 */
const AdminPageWrapper = ({
  children,
  variant = "slide",
  direction = "right",
}: AdminPageWrapperProps) => {
  return (
    <PageTransition
      variant={variant}
      direction={direction}
      duration={0.3}
      className=""
    >
      {children}
    </PageTransition>
  );
};

export default AdminPageWrapper;
