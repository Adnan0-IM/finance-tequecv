/**
 * This utility provides consistent animation presets for different sections of the admin panel.
 * It helps maintain a unified look and feel across the application.
 */

export type AnimationPreset = {
  variant: "fade" | "slide" | "zoom" | "blur" | "wipe";
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
};

// Preset animations for different admin sections
export const ADMIN_ANIMATIONS = {
  // Main sections
  dashboard: {
    variant: "slide",
    direction: "right",
    duration: 0.3,
  } as AnimationPreset,
  users: { variant: "zoom", duration: 0.35 } as AnimationPreset,
  verification: {
    variant: "wipe",
    direction: "left",
    duration: 0.4,
  } as AnimationPreset,
  settings: { variant: "fade", duration: 0.25 } as AnimationPreset,

  // Detail views
  detail: { variant: "blur", duration: 0.3 } as AnimationPreset,

  // Form views
  form: {
    variant: "slide",
    direction: "up",
    duration: 0.25,
  } as AnimationPreset,

  // Custom animations for specific features
  carousel: {
    variant: "slide",
    direction: "down",
    duration: 0.35,
  } as AnimationPreset,
  subAdmin: { variant: "fade", duration: 0.3 } as AnimationPreset,
};

/**
 * Returns animation properties for AdminPageWrapper based on admin section
 */
export function getAdminAnimation(
  section: keyof typeof ADMIN_ANIMATIONS | string,
  customAnimation?: AnimationPreset
): AnimationPreset {
  if (section === "custom" && customAnimation) {
    return customAnimation;
  }

  return section in ADMIN_ANIMATIONS
    ? ADMIN_ANIMATIONS[section as keyof typeof ADMIN_ANIMATIONS]
    : ADMIN_ANIMATIONS.dashboard;
}
