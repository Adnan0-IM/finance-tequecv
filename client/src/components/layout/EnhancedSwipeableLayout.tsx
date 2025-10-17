import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSwipeable } from "react-swipeable";
import PageTransition from "../animations/PageTransition";
import { motion } from "framer-motion";

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

const EnhancedSwipeableLayout = ({
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
  const [swipeProgress, setSwipeProgress] = useState(0); // Track swipe progress for animation
  const [showSwipeHint, setShowSwipeHint] = useState(false);

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
      setSwipeProgress(0);
    },
    onSwipedRight: () => {
      // Navigate to the previous page if available
      if (currentIndex > 0) {
        setDirection("right");
        navigate(navLinks[currentIndex - 1].path);
      }
      setSwipeProgress(0);
    },
    onSwiping: (event) => {
      // Calculate swipe progress as percentage
      const maxSwipe = swipeThreshold * 1.5;
      const progress = Math.min(Math.abs(event.deltaX) / maxSwipe, 1);
      setSwipeProgress(progress);

      // Show swipe hint if we're swiping and there's a page to navigate to
      if (
        (event.dir === "Left" && currentIndex < navLinks.length - 1) ||
        (event.dir === "Right" && currentIndex > 0)
      ) {
        setShowSwipeHint(true);
      }
    },
    onSwiped: () => {
      // Hide hint when swipe is done
      setShowSwipeHint(false);
      setSwipeProgress(0);
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

  // Show first-time swipe hint
  useEffect(() => {
    const hasSeenHint = localStorage.getItem("hasSeenSwipeHint");
    if (!hasSeenHint) {
      setShowSwipeHint(true);
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
        localStorage.setItem("hasSeenSwipeHint", "true");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div {...handlers} className="h-full w-full touch-pan-y relative">
      <PageTransition
        variant={pageTransitionProps.variant}
        direction={direction}
        duration={pageTransitionProps.duration}
      >
        {children}
      </PageTransition>

      {/* Swipe indicator dots */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center space-x-1.5 pointer-events-none z-10">
        {navLinks.map((item, index) => (
          <motion.div
            key={item.path}
            className={`h-1.5 rounded-full transition-all ${
              location.pathname === item.path
                ? "bg-primary w-6"
                : "bg-gray-300 w-1.5"
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          />
        ))}
      </div>

      {/* Visual swipe hints - left and right */}
      {showSwipeHint && (
        <>
          {currentIndex > 0 && (
            <motion.div
              className="fixed left-0 top-1/2 -translate-y-1/2 bg-primary/20 backdrop-blur-sm h-20 w-12 rounded-r-full flex items-center justify-center pointer-events-none z-10"
              initial={{ x: -50 }}
              animate={{ x: 0 }}
              exit={{ x: -50 }}
              style={{ opacity: direction === "right" ? swipeProgress : 0 }}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </motion.div>
          )}

          {currentIndex < navLinks.length - 1 && (
            <motion.div
              className="fixed right-0 top-1/2 -translate-y-1/2 bg-primary/20 backdrop-blur-sm h-20 w-12 rounded-l-full flex items-center justify-center pointer-events-none z-10"
              initial={{ x: 50 }}
              animate={{ x: 0 }}
              exit={{ x: 50 }}
              style={{ opacity: direction === "left" ? swipeProgress : 0 }}
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedSwipeableLayout;
