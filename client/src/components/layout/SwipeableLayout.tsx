import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSwipeable } from "react-swipeable";
import PageTransition from "../animations/PageTransition";

type SwipeableLayoutProps = {
  children: ReactNode;
  navLinks: Array<{ path: string; title: string }>;
  swipeThreshold?: number;
  pageTransitionProps?: {
    variant?: "fade" | "slide" | "zoom" | "blur" | "wipe";
    direction?: "left" | "right" | "up" | "down";
    duration?: number;
  };
};

const SwipeableLayout = ({
  children,
  navLinks,
  swipeThreshold = 100,
  pageTransitionProps = {
    variant: "slide",
    direction: "left",
    duration: 0.35,
  },
}: SwipeableLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [direction, setDirection] = useState<"left" | "right">(
    (pageTransitionProps.direction as "left" | "right") || "left"
  );

  // Get the current page index based on the current path
  const currentIndex = navLinks.findIndex(
    (link) => link.path === location.pathname
  );

  // Configure swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      // Navigate to the next page if available
      if (currentIndex < navLinks.length - 1) {
        setDirection("left");
        navigate(navLinks[currentIndex + 1].path);
      }
    },
    onSwipedRight: () => {
      // Navigate to the previous page if available
      if (currentIndex > 0) {
        setDirection("right");
        navigate(navLinks[currentIndex - 1].path);
      }
    },
    trackMouse: false,
    swipeDuration: 500,
    preventScrollOnSwipe: false,
    trackTouch: true,
    delta: swipeThreshold,
    rotationAngle: 0,
  });

  // Update direction based on navigation
  useEffect(() => {
    const handlePopState = () => {
      // Detect browser back/forward navigation and set direction accordingly
      const newIndex = navLinks.findIndex(
        (link) => link.path === location.pathname
      );
      if (newIndex < currentIndex) {
        setDirection("right");
      } else {
        setDirection("left");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentIndex, location.pathname, navLinks]);

  return (
    <div {...handlers} className="h-full w-full touch-pan-y">
      <PageTransition
        variant={pageTransitionProps.variant}
        direction={direction}
        duration={pageTransitionProps.duration}
      >
        {children}
      </PageTransition>
    </div>
  );
};

export default SwipeableLayout;
