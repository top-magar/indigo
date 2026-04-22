/**
 * Dashboard Transition Components
 * 
 * Subtle, fast animations for page transitions and element appearances.
 * All components respect prefers-reduced-motion and work without animation wrappers.
 * 
 * @example
 * ```tsx
 * import { PageTransition, StaggerChildren, FadeIn } from "@/components/dashboard/transitions";
 * 
 * // Page-level transition
 * <PageTransition>
 *   <DashboardPage />
 * </PageTransition>
 * 
 * // Staggered list animation
 * <StaggerChildren variant="slide-up">
 *   {items.map(item => <Card key={item.id} />)}
 * </StaggerChildren>
 * 
 * // Simple fade for individual elements
 * <FadeIn>
 *   <Widget />
 * </FadeIn>
 * ```
 */

export { PageTransition } from "./page-transition";
export type { PageTransitionProps } from "./page-transition";

export { StaggerChildren, StaggerItem } from "./stagger-children";
export type { StaggerChildrenProps, StaggerItemProps } from "./stagger-children";

export { FadeIn, FadeInOnScroll } from "./fade-in";
export type { FadeInProps, FadeInOnScrollProps } from "./fade-in";
