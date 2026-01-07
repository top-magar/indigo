/**
 * Animation System Type Definitions
 * Block-level animation configuration for entrance, scroll, and hover effects
 */

// Entrance animation types
export type EntranceAnimationType =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "zoom-in"
  | "zoom-out"
  | "flip"
  | "bounce"
  | "rotate";

// Scroll animation types
export type ScrollAnimationType =
  | "none"
  | "parallax"
  | "fade-on-scroll"
  | "scale-on-scroll"
  | "blur-on-scroll"
  | "rotate-on-scroll";

// Hover animation types
export type HoverAnimationType =
  | "none"
  | "lift"
  | "glow"
  | "scale"
  | "tilt"
  | "shake"
  | "pulse";

// Easing functions
export type EasingType =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "spring"
  | "bounce";

// Entrance animation configuration
export interface EntranceAnimation {
  type: EntranceAnimationType;
  duration: number; // milliseconds
  delay: number; // milliseconds
  easing: EasingType;
  // Advanced options
  distance?: number; // pixels for slide animations
  scale?: number; // scale factor for zoom animations
  rotation?: number; // degrees for rotate animations
  stagger?: number; // delay between child elements (ms)
}

// Scroll animation configuration
export interface ScrollAnimation {
  type: ScrollAnimationType;
  intensity: number; // 0-100
  direction?: "up" | "down" | "both";
  // Trigger points
  triggerStart?: number; // viewport percentage (0-100)
  triggerEnd?: number; // viewport percentage (0-100)
}

// Hover animation configuration
export interface HoverAnimation {
  type: HoverAnimationType;
  intensity: number; // 0-100
  duration: number; // milliseconds
  // Advanced options
  scale?: number;
  rotation?: number;
  shadowColor?: string;
}

// Complete block animation configuration
export interface BlockAnimation {
  entrance?: EntranceAnimation;
  scroll?: ScrollAnimation;
  hover?: HoverAnimation;
  // Reduced motion support
  respectReducedMotion: boolean;
}

// Default animation values
export const DEFAULT_ENTRANCE_ANIMATION: EntranceAnimation = {
  type: "none",
  duration: 500,
  delay: 0,
  easing: "ease-out",
  distance: 20,
  scale: 0.95,
  rotation: 0,
  stagger: 100,
};

export const DEFAULT_SCROLL_ANIMATION: ScrollAnimation = {
  type: "none",
  intensity: 50,
  direction: "both",
  triggerStart: 20,
  triggerEnd: 80,
};

export const DEFAULT_HOVER_ANIMATION: HoverAnimation = {
  type: "none",
  intensity: 50,
  duration: 200,
  scale: 1.02,
  rotation: 0,
};

export const DEFAULT_BLOCK_ANIMATION: BlockAnimation = {
  entrance: DEFAULT_ENTRANCE_ANIMATION,
  scroll: DEFAULT_SCROLL_ANIMATION,
  hover: DEFAULT_HOVER_ANIMATION,
  respectReducedMotion: true,
};

// Animation presets for quick selection
export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  animation: Partial<BlockAnimation>;
}

export const ANIMATION_PRESETS: AnimationPreset[] = [
  {
    id: "subtle-fade",
    name: "Subtle Fade",
    description: "Gentle fade-in effect",
    animation: {
      entrance: { ...DEFAULT_ENTRANCE_ANIMATION, type: "fade", duration: 600 },
    },
  },
  {
    id: "slide-up",
    name: "Slide Up",
    description: "Slide up from below",
    animation: {
      entrance: { ...DEFAULT_ENTRANCE_ANIMATION, type: "slide-up", duration: 500, distance: 30 },
    },
  },
  {
    id: "zoom-in",
    name: "Zoom In",
    description: "Scale up from smaller size",
    animation: {
      entrance: { ...DEFAULT_ENTRANCE_ANIMATION, type: "zoom-in", duration: 400, scale: 0.9 },
    },
  },
  {
    id: "parallax-slow",
    name: "Slow Parallax",
    description: "Subtle parallax scrolling effect",
    animation: {
      scroll: { ...DEFAULT_SCROLL_ANIMATION, type: "parallax", intensity: 30 },
    },
  },
  {
    id: "hover-lift",
    name: "Hover Lift",
    description: "Lift up on hover with shadow",
    animation: {
      hover: { ...DEFAULT_HOVER_ANIMATION, type: "lift", intensity: 60 },
    },
  },
  {
    id: "interactive",
    name: "Interactive",
    description: "Fade in + hover lift combo",
    animation: {
      entrance: { ...DEFAULT_ENTRANCE_ANIMATION, type: "fade", duration: 500 },
      hover: { ...DEFAULT_HOVER_ANIMATION, type: "lift", intensity: 50 },
    },
  },
];

// Framer Motion variant generators
export function getEntranceVariants(animation: EntranceAnimation) {
  const { type, duration, delay, easing, distance = 20, scale = 0.95, rotation = 0 } = animation;

  const easingMap: Record<EasingType, number[]> = {
    linear: [0, 0, 1, 1],
    ease: [0.25, 0.1, 0.25, 1],
    "ease-in": [0.42, 0, 1, 1],
    "ease-out": [0, 0, 0.58, 1],
    "ease-in-out": [0.42, 0, 0.58, 1],
    spring: [0.175, 0.885, 0.32, 1.275],
    bounce: [0.68, -0.55, 0.265, 1.55],
  };

  const baseTransition = {
    duration: duration / 1000,
    delay: delay / 1000,
    ease: easingMap[easing],
  };

  switch (type) {
    case "fade":
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: baseTransition },
      };
    case "slide-up":
      return {
        hidden: { opacity: 0, y: distance },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      };
    case "slide-down":
      return {
        hidden: { opacity: 0, y: -distance },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      };
    case "slide-left":
      return {
        hidden: { opacity: 0, x: distance },
        visible: { opacity: 1, x: 0, transition: baseTransition },
      };
    case "slide-right":
      return {
        hidden: { opacity: 0, x: -distance },
        visible: { opacity: 1, x: 0, transition: baseTransition },
      };
    case "zoom-in":
      return {
        hidden: { opacity: 0, scale },
        visible: { opacity: 1, scale: 1, transition: baseTransition },
      };
    case "zoom-out":
      return {
        hidden: { opacity: 0, scale: 2 - scale },
        visible: { opacity: 1, scale: 1, transition: baseTransition },
      };
    case "flip":
      return {
        hidden: { opacity: 0, rotateX: 90 },
        visible: { opacity: 1, rotateX: 0, transition: baseTransition },
      };
    case "bounce":
      return {
        hidden: { opacity: 0, y: -distance },
        visible: { opacity: 1, y: 0, transition: { ...baseTransition, type: "spring", bounce: 0.5 } },
      };
    case "rotate":
      return {
        hidden: { opacity: 0, rotate: rotation || 180 },
        visible: { opacity: 1, rotate: 0, transition: baseTransition },
      };
    default:
      return {
        hidden: {},
        visible: {},
      };
  }
}
