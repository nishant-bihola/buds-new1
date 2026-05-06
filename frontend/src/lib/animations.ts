/**
 * (c) 2024-2026 Nishant Bihola & Aura Labs. All Rights Reserved.
 * Premium Animation Configuration System
 */

export const TRANSITIONS = {
  // Ultra-refined bezier easing for industry-level feel
  PREMIUM: [0.16, 1, 0.3, 1],
  SMOOTH: [0.22, 1, 0.36, 1],
  SPRING_LIGHT: { type: "spring", stiffness: 300, damping: 30 },
  SPRING_BOUNCY: { type: "spring", stiffness: 400, damping: 20 },
};

export const VARIANTS = {
  FADE_UP: {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: TRANSITIONS.PREMIUM,
        delay: custom * 0.1,
      },
    }),
  },
  SCALE_IN: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: TRANSITIONS.PREMIUM,
      },
    },
  },
};
