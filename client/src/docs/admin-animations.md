# Admin Panel Animations Implementation Guide

## Overview

This document outlines how to implement smooth page transitions in the Finance Teque admin panel using the `PageTransition` component.

## Components Created

- **AdminPageWrapper**: A wrapper component that applies consistent animations to admin pages using the existing `PageTransition` component.

## Implementation Details

### 1. Animation Types Available

The `PageTransition` component supports multiple animation types:

- **fade**: Simple opacity transition (subtle, professional)
- **slide**: Movement transition with direction control
- **zoom**: Scale in/out effect
- **blur**: Blur filter transition
- **wipe**: Clip-path reveal animation

### 2. Pages Already Implemented

The following admin pages now have animations:

- **AdminDashboard**: Slide from right
- **ManageSubAdmin**: Fade transition
- **Users**: Zoom transition
- **Verification**: Wipe from left

### 3. How to Add to More Pages

To add transitions to additional pages:

```tsx
// 1. Import the wrapper
import AdminPageWrapper from "@/components/layout/AdminPageWrapper";

// 2. Use in your component
return (
  <DashboardNavigation>
    <AdminPageWrapper variant="slide" direction="right">
      {/* Your page content */}
    </AdminPageWrapper>
  </DashboardNavigation>
);
```

### 4. Recommended Animation Types for Admin Pages

- **Data-heavy pages**: Use `fade` or `slide` for minimal distraction
- **Detail views**: Consider `zoom` to emphasize focus on details
- **Action pages**: `wipe` for more dramatic transitions
- **Forms/modals**: `blur` for emphasis

### 5. Animation Options

- **variant**: 'fade' | 'slide' | 'zoom' | 'blur' | 'wipe'
- **direction**: 'up' | 'down' | 'left' | 'right' (for slide/wipe)
- **duration**: Animation duration in seconds (default: 0.35)

### 6. Accessibility Considerations

The `PageTransition` component uses Framer Motion's `useReducedMotion` hook, which automatically respects user preferences for reduced motion.

## Best Practices

- Keep animations subtle and brief for professional UI
- Use consistent animations for similar page types
- Consider using different animations for different sections of the admin
- Balance aesthetics with performance
