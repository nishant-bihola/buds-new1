/**
 * (c) 2024-2026 Nishant Bihola & Aura Labs. All Rights Reserved.
 * Premium Animation Configuration System
 */

export const TRANSITIONS = {
  PREMIUM: { duration: 0.6, type: "tween" } as any,
  SMOOTH: { duration: 0.6, type: "tween" } as any,
  SPRING_LIGHT: { type: "spring", stiffness: 300, damping: 30 } as any,
  SPRING_BOUNCY: { type: "spring", stiffness: 400, damping: 20 } as any,
};

export const VARIANTS = {
  FADE_UP: {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: custom * 0.1,
      },
    }),
  } as any,
  SCALE_IN: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  } as any,
};

export const PERFORMANCE_CONFIG = {
  useGPU: true,
  willChange: true,
  skipAnimationsOnMobile: false,
  useReducedMotion: true,
};
