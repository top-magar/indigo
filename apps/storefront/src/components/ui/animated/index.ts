/**
 * Playful Animated Components
 * 
 * A collection of delightful micro-animations for UI components and icons.
 * Built on Framer Motion with Vercel/Geist design patterns.
 * 
 * Respects prefers-reduced-motion for accessibility.
 */

// Animated Icons
export {
  AnimatedCheck,
  AnimatedX,
  AnimatedArrow,
  AnimatedPlusMinus,
  AnimatedHamburger,
  AnimatedChevron,
  AnimatedHeart,
  AnimatedStar,
  AnimatedBell,
  AnimatedCopy,
  AnimatedSpinner,
  AnimatedSuccess,
  AnimatedError,
  AnimatedBookmark,
  AnimatedTrash,
} from "./animated-icons"

// Animated Components
export { AnimatedButton, AnimatedIconButton } from "./animated-button"
export { AnimatedCard } from "./animated-card"
export { AnimatedBadge, NotificationDot } from "./animated-badge"
export { AnimatedCheckbox } from "./animated-checkbox"
export { AnimatedToggle } from "./animated-toggle"
export { AnimatedInput } from "./animated-input"

// Animation Wrappers
export { HoverScale } from "./hover-scale"
export { TapBounce } from "./tap-bounce"
export { StaggerList, StaggerItem } from "./stagger-list"
export { Magnetic } from "./magnetic"
export { TiltCard } from "./tilt-card"

// Utility Hooks
export { usePlayfulAnimation, useIconAnimation } from "./use-playful-animation"
