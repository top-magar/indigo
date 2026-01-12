// Geist Design System Components
// Based on Vercel's Geist Design System
// https://vercel.com/geist

// Capacity - Visual indicator for capacity/usage levels
export { Capacity, capacityVariants, type CapacityProps } from "./capacity";

// Collapse - Expandable/collapsible sections
export {
  Collapse,
  CollapseGroup,
  collapseVariants,
  collapseHeaderVariants,
  collapseContentVariants,
  type CollapseProps,
  type CollapseGroupProps,
} from "./collapse";

// Context Card - Contextual selection card
export {
  ContextCard,
  contextCardVariants,
  contextCardOptionVariants,
  type ContextCardProps,
  type ContextCardOption,
} from "./context-card";

// Description - Title + content pair
export { Description, descriptionVariants, type DescriptionProps } from "./description";

// Entity - User/item display with avatar
export {
  Entity,
  EntityAvatar,
  EntityThumbnail,
  EntityContent,
  EntityName,
  EntityDescription,
  entityVariants,
  type EntityProps,
} from "./entity";

// Error Message - Error message display
export { ErrorMessage, errorMessageVariants, type ErrorMessageProps } from "./error-message";

// Feedback - Thumbs up/down feedback
export {
  Feedback,
  FeedbackButton,
  FeedbackSuccess,
  FeedbackPrompt,
  feedbackVariants,
  feedbackButtonVariants,
  type FeedbackProps,
} from "./feedback";

// File Tree - Hierarchical file display
export {
  FileTree,
  FileTreeItem,
  fileTreeVariants,
  type FileTreeNode,
  type FileTreeProps,
  type FileTreeItemProps,
} from "./file-tree";

// Gauge - Circular progress indicator
export { Gauge, gaugeVariants, type GaugeProps } from "./gauge";

// Geist Link - Styled link component
export { GeistLink, geistLinkVariants, type GeistLinkProps } from "./geist-link";

// Grid - Grid layout
export {
  Grid,
  GridItem,
  gridVariants,
  gridItemVariants,
  type GridProps,
  type GridItemProps,
} from "./grid";

// Keyboard Input - Display keyboard shortcuts
export {
  KeyboardInput,
  keyboardInputVariants,
  type KeyboardInputProps,
} from "./keyboard-input";

// Loading Dots - Animated loading dots
export { LoadingDots, loadingDotsVariants, type LoadingDotsProps } from "./loading-dots";

// Material - Surface component with various shadow depths
export { Material, materialVariants, type MaterialProps } from "./material";

// Progress - Progress bar with dynamic colors
export {
  Progress,
  progressVariants,
  progressBarVariants,
  type ProgressProps,
  type ProgressStop,
} from "./progress";

// Project Banner - Project-level status banner
export {
  ProjectBanner,
  ProjectBannerIcon,
  ProjectBannerContent,
  ProjectBannerTitle,
  ProjectBannerDescription,
  ProjectBannerAction,
  ProjectBannerDismiss,
  projectBannerVariants,
  type ProjectBannerProps,
} from "./project-banner";

// Relative Time Card - Time with popover
export {
  RelativeTimeCard,
  relativeTimeCardVariants,
  type RelativeTimeCardProps,
} from "./relative-time-card";

// Show More - Expandable content toggle
export {
  ShowMore,
  ShowMoreContent,
  ShowMoreGradient,
  ShowMoreButton,
  showMoreVariants,
  showMoreButtonVariants,
  type ShowMoreProps,
} from "./show-more";

// Snippet - Code snippet with copy functionality
export { Snippet, snippetVariants, type SnippetProps } from "./snippet";

// Spinner - Loading spinner indicator
export { Spinner, spinnerVariants, type SpinnerProps } from "./spinner";

// Split Button - Primary action with dropdown menu for additional actions
export {
  SplitButton,
  splitButtonContainerVariants,
  splitButtonPrimaryVariants,
  splitButtonDividerVariants,
  splitButtonTriggerVariants,
  splitButtonMenuContentVariants,
  splitButtonMenuItemVariants,
  type SplitButtonProps,
  type SplitButtonPrimaryAction,
  type SplitButtonMenuItem,
} from "./split-button";

// Stack - Flexbox stack layout
export { Stack, stackVariants, type StackProps } from "./stack";

// Status Dot - Deployment status indicator
export { StatusDot, statusDotVariants, type StatusDotProps } from "./status-dot";

// Text - Typography component
export { Text, textVariants, type TextProps } from "./text";

// Theme Switcher - Light/dark/system toggle
export {
  ThemeSwitcher,
  themeSwitcherVariants,
  type ThemeSwitcherProps,
  type ThemeValue,
} from "./theme-switcher";

// Window - Desktop window frame with macOS-style controls
export {
  Window,
  WindowTitleBar,
  WindowContent,
  TrafficLights,
  windowVariants,
  type WindowProps,
} from "./window";

// Choicebox - Card-style selection (single/multi-select)
export {
  ChoiceboxGroup,
  Choicebox,
  choiceboxGroupVariants,
  choiceboxVariants,
  choiceboxIndicatorVariants,
  type ChoiceboxGroupProps,
  type ChoiceboxProps,
} from "./choicebox";

// Scroller - Horizontal/vertical scroll with navigation buttons
export {
  Scroller,
  scrollerVariants,
  scrollerContentVariants,
  scrollerButtonVariants,
  type ScrollerProps,
} from "./scroller";

// Book - Content card display for articles and documentation
export { Book, bookVariants, type BookProps } from "./book";

// Browser - Browser frame mockup for showcasing websites
export {
  Browser,
  BrowserHeader,
  BrowserContent,
  BrowserTrafficLights,
  browserVariants,
  type BrowserProps,
} from "./browser";

// Note - Informational messages with various types
export {
  Note,
  noteVariants,
  noteLabelVariants,
  noteIconVariants,
  type NoteProps,
  type NoteType,
} from "./note";

// Empty State - Empty content guidance
export {
  EmptyState,
  emptyStateVariants,
  emptyStateTitleVariants,
  emptyStateDescriptionVariants,
  emptyStateIllustrationVariants,
  emptyStateActionsVariants,
  type EmptyStateProps,
  type EmptyStateVariant,
  type EmptyStateAction,
  type EmptyStateLink,
} from "./empty-state";

// Slider - Range selection with single or dual thumbs
export {
  Slider,
  sliderVariants,
  sliderTrackVariants,
  sliderRangeVariants,
  sliderThumbVariants,
  sliderMarkVariants,
  sliderMarkLabelVariants,
  sliderTooltipVariants,
  type SliderProps,
  type SliderMark,
} from "./slider";

// Toggle - Boolean on/off switch control
export {
  Toggle,
  toggleVariants,
  toggleThumbVariants,
  toggleLabelVariants,
  toggleContainerVariants,
  type ToggleProps,
  type ToggleEvent,
} from "./toggle";

// Toast - Temporary feedback messages
export {
  ToastProvider,
  ToastContainer,
  ToastItem,
  useToast,
  toastVariants,
  toastContainerVariants,
  toastIconVariants,
  toastContentVariants,
  toastActionVariants,
  toastDismissVariants,
  type Toast,
  type ToastOptions,
  type ToastAction,
  type ToastType,
  type ToastPlacement,
  type ToastProviderProps,
  type ToastContextValue,
  type ToastItemProps,
  type ToastContainerProps,
} from "./toast";

// Switch - Mutually exclusive option selector (e.g., Source/Output, List/Grid)
export {
  Switch,
  SwitchControl,
  switchVariants,
  switchControlVariants,
  type SwitchProps,
  type SwitchControlProps,
  type SwitchSize,
} from "./switch";
