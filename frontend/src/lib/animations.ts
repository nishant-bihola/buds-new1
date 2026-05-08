/**
 * (c) 2024-2026 Nishant Bihola & Aura Labs. All Rights Reserved.
 * Premium Animation Configuration System
 */

export const TRANSITIONS = {
  PREMIUM: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } as any,
  SMOOTH: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } as any,
  SPRING_LIGHT: { type: "spring", stiffness: 300, damping: 30 } as any,
  SPRING_BOUNCY: { type: "spring", stiffness: 400, damping: 20 } as any,
  SPRING_SLOW: { type: "spring", stiffness: 120, damping: 20, mass: 1.2 } as any,
};

export const VARIANTS = {
  FADE_UP: {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    },
  } as any,

  FADE_DOWN: {
    hidden: { opacity: 0, y: -24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    },
  } as any,

  FADE_LEFT: {
    hidden: { opacity: 0, x: -32 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    },
  } as any,

  FADE_RIGHT: {
    hidden: { opacity: 0, x: 32 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
    },
  } as any,

  SCALE_IN: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  } as any,

  SCALE_UP: {
    hidden: { opacity: 0, scale: 0.85, y: 16 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  } as any,

  // Container that staggers children
  STAGGER_CONTAINER: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  } as any,

  // Use as child of STAGGER_CONTAINER
  STAGGER_ITEM: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  } as any,

  // Clip reveal — text or images sliding in with clip-path
  CLIP_REVEAL: {
    hidden: { clipPath: "inset(0 100% 0 0)", opacity: 0 },
    visible: {
      clipPath: "inset(0 0% 0 0)",
      opacity: 1,
      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
    },
  } as any,

  // For cards — subtle 3D tilt feel on enter
  CARD_ENTER: {
    hidden: { opacity: 0, y: 32, rotateX: 8, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  } as any,

  // Blurs in from a slight distance
  BLUR_IN: {
    hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
    },
  } as any,
};

// Hover animations — spread directly into motion component props
export const HOVER = {
  LIFT: { whileHover: { y: -4, transition: { duration: 0.25, ease: "easeOut" } } },
  SCALE: { whileHover: { scale: 1.03, transition: { duration: 0.2, ease: "easeOut" } } },
  GLOW: { whileHover: { boxShadow: "0 0 40px 0 rgba(197,225,165,0.15)", transition: { duration: 0.3 } } },
  CARD: { whileHover: { y: -6, scale: 1.02, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } },
} as any;
