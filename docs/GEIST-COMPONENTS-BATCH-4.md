# Geist Components Reference - Batch 4

This document provides comprehensive documentation for Geist Design System components: Progress, Radio, Scroller, Select, Skeleton, Slider, Spinner, and Split Button.

---

## Table of Contents

1. [Progress](#progress)
2. [Radio](#radio)
3. [Scroller](#scroller)
4. [Select](#select)
5. [Skeleton](#skeleton)
6. [Slider](#slider)
7. [Spinner](#spinner)
8. [Split Button](#split-button)

---

## Progress

**Description:** Display progress relative to a limit or related to a task. A visual indicator showing completion status or resource usage.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard progress bar with percentage |
| Custom Max | Progress bar with custom maximum value |
| Dynamic Colors | Progress bar that changes color based on value |
| Themed | Progress bar with custom theme colors |
| With Stops | Progress bar with marker stops/milestones |

### States

| State | Description |
|-------|-------------|
| Default | Normal progress display |
| Empty | 0% progress |
| Partial | Between 0-100% progress |
| Complete | 100% progress |
| Indeterminate | Unknown progress (animated) |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number` | Current progress value |
| `max` | `number` | Maximum value (default: 100) |
| `color` | `string` | Progress bar color |
| `backgroundColor` | `string` | Track background color |
| `size` | `'small' \| 'medium' \| 'large'` | Size variant |
| `showValue` | `boolean` | Display percentage text |
| `stops` | `number[]` | Array of stop/milestone positions |
| `dynamicColor` | `boolean` | Enable automatic color based on value |

### Key CSS Patterns

```css
/* Progress container */
.geist-progress {
  height: var(--geist-progress-height, 4px);
  background: var(--ds-gray-alpha-400);
  border-radius: var(--geist-radius);
  overflow: hidden;
}

/* Progress bar fill */
.geist-progress-bar {
  height: 100%;
  background: var(--ds-blue-900);
  transition: width 0.3s ease;
  border-radius: inherit;
}

/* Dynamic color thresholds */
.geist-progress-bar[data-value="low"] { background: var(--ds-red-900); }
.geist-progress-bar[data-value="medium"] { background: var(--ds-amber-900); }
.geist-progress-bar[data-value="high"] { background: var(--ds-green-900); }

/* Stop markers */
.geist-progress-stop {
  position: absolute;
  width: 2px;
  height: 100%;
  background: var(--ds-background-100);
}
```

### Implementation Notes

- Use `max` prop for custom scales (e.g., max={500} for file upload bytes)
- Dynamic colors automatically apply red/amber/green based on thresholds
- Stops create visual milestones on the progress track
- Consider using with labels for accessibility
- Animate width transitions for smooth progress updates

### Usage Guidelines

- Use for showing completion of tasks or resource usage
- Dynamic colors work well for capacity indicators
- Add stops for milestone-based progress (e.g., multi-step forms)
- Always provide accessible labels describing what the progress represents
- Consider indeterminate state when progress cannot be calculated

---

## Radio

**Description:** A control for selecting a single option from a group of mutually exclusive choices. Radio buttons are typically used within a RadioGroup.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard radio button with label within a RadioGroup |
| Disabled | Non-interactive radio button |
| Required | Radio group that requires a selection |
| Headless | RadioGroup without RadioGroup.Item for custom implementations |
| Standalone | Unlabelled radio input for use in custom UI |

### States

| State | Description |
|-------|-------------|
| Default | Unselected radio button |
| Selected | Radio button in selected state |
| Disabled | Non-interactive radio button |
| Disabled Selected | Disabled radio in selected state |
| Focus | Radio button with keyboard focus |
| Hover | Radio button on mouse hover |

### Props/Features

**RadioGroup Props:**

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | The value of the selected option |
| `defaultValue` | `string` | Initial selected value (uncontrolled) |
| `disabled` | `boolean` | Disables the entire radio group |
| `required` | `boolean` | Makes selection required |
| `onChange` | `(value: string) => void` | Callback when selection changes |
| `name` | `string` | Name attribute for form submission |
| `orientation` | `'horizontal' \| 'vertical'` | Layout direction |

**RadioGroup.Item Props:**

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Value for this option |
| `disabled` | `boolean` | Disable this specific item |
| `label` | `string` | Label text for the radio |

### Key CSS Patterns

```css
/* Radio container */
.geist-radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--geist-space-3);
}

/* Horizontal layout */
.geist-radio-group[data-orientation="horizontal"] {
  flex-direction: row;
  gap: var(--geist-space-4);
}

/* Radio item wrapper */
.geist-radio-item {
  display: flex;
  align-items: center;
  gap: var(--geist-space-2);
  cursor: pointer;
}

/* Radio circle */
.geist-radio-circle {
  width: 16px;
  height: 16px;
  border: 1px solid var(--ds-gray-alpha-600);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.15s ease;
}

/* Selected state */
.geist-radio-circle[data-state="checked"] {
  border-color: var(--ds-blue-900);
}

/* Inner dot */
.geist-radio-circle[data-state="checked"]::after {
  content: '';
  width: 8px;
  height: 8px;
  background: var(--ds-blue-900);
  border-radius: 50%;
}

/* Disabled state */
.geist-radio-item[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Focus ring */
.geist-radio-circle:focus-visible {
  outline: 2px solid var(--ds-blue-700);
  outline-offset: 2px;
}

/* Hover state */
.geist-radio-item:hover .geist-radio-circle {
  border-color: var(--ds-gray-alpha-800);
}
```

### Implementation Notes

- Always use RadioGroup to wrap related Radio items
- Use `headless` variant when building custom radio-like interfaces
- Standalone variant is for custom UI where you manage the visual presentation
- Required prop adds form validation
- Support keyboard navigation (arrow keys to move between options)

### Usage Guidelines

- Use radio buttons when users must select exactly one option from a list
- Always group related radio buttons together using RadioGroup
- Provide clear, concise labels for each option
- Consider using Choicebox for more prominent single-select scenarios
- Use headless variant when building custom radio-like interfaces
- Ensure proper keyboard navigation between options

---

## Scroller

**Description:** Display an overflowing list of items with optional navigation buttons. Useful for horizontal scrolling content like tabs, cards, or image galleries.

### Variants

| Variant | Description |
|---------|-------------|
| Vertical | Vertical scrolling list |
| Horizontal | Horizontal scrolling list |
| Free | Free-form scrolling (both directions) |
| Vertical with Buttons | Vertical with navigation buttons |
| Horizontal with Buttons | Horizontal with navigation buttons |

### States

| State | Description |
|-------|-------------|
| Default | Normal scrollable state |
| At Start | Scrolled to beginning (hide prev button) |
| At End | Scrolled to end (hide next button) |
| Scrolling | Currently being scrolled |
| Overflow | Content overflows container |
| No Overflow | Content fits without scrolling |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `direction` | `'vertical' \| 'horizontal' \| 'free'` | Scroll direction |
| `showButtons` | `boolean` | Show navigation buttons |
| `buttonPosition` | `'inside' \| 'outside'` | Button placement |
| `scrollBehavior` | `'smooth' \| 'auto'` | Scroll animation |
| `hideScrollbar` | `boolean` | Hide native scrollbar |
| `children` | `ReactNode` | Scrollable content |
| `onScroll` | `(event: ScrollEvent) => void` | Scroll event callback |
| `scrollToChild` | `number` | Index of child to scroll to |

### Key CSS Patterns

```css
/* Scroller container */
.geist-scroller {
  position: relative;
  overflow: hidden;
}

/* Scrollable content area */
.geist-scroller-content {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

/* Hide webkit scrollbar */
.geist-scroller-content::-webkit-scrollbar {
  display: none;
}

/* Vertical variant */
.geist-scroller[data-direction="vertical"] .geist-scroller-content {
  overflow-x: hidden;
  overflow-y: auto;
}

/* Free scroll variant */
.geist-scroller[data-direction="free"] .geist-scroller-content {
  overflow: auto;
}

/* Navigation buttons */
.geist-scroller-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.geist-scroller-button-prev {
  left: 8px;
}

.geist-scroller-button-next {
  right: 8px;
}

/* Hide button when at boundary */
.geist-scroller-button[data-hidden="true"] {
  opacity: 0;
  pointer-events: none;
}

/* Gradient fade edges */
.geist-scroller::before,
.geist-scroller::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40px;
  pointer-events: none;
  z-index: 5;
}

.geist-scroller::before {
  left: 0;
  background: linear-gradient(to right, var(--ds-background-100), transparent);
}

.geist-scroller::after {
  right: 0;
  background: linear-gradient(to left, var(--ds-background-100), transparent);
}
```

### Implementation Notes

- Buttons automatically scroll to a given direct child element
- Use `scrollToChild` prop to programmatically scroll to specific items
- Gradient fades indicate more content is available
- Hide scrollbar for cleaner appearance while maintaining scroll functionality
- Consider touch/swipe gestures for mobile devices

### Usage Guidelines

- Use for overflowing content that needs navigation
- Horizontal variant works well for tab-like interfaces
- Buttons provide accessible navigation alternative to scrolling
- Consider showing gradient fades to indicate overflow
- Ensure keyboard accessibility for navigation buttons

---

## Select

**Description:** Display a dropdown list of items for single selection. A form control for choosing one option from a predefined list.

### Sizes

| Size | Description |
|------|-------------|
| Small | Compact select for dense UIs (height: 32px) |
| Medium | Default select size (height: 40px) |
| Large | Larger select for emphasis (height: 48px) |

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard select dropdown |
| With Prefix | Select with icon/content before text |
| With Suffix | Select with icon/content after text |
| With Label | Select with associated label |
| Disabled | Non-interactive select |
| Error | Select with error state and message |

### States

| State | Description |
|-------|-------------|
| Default | Normal select appearance |
| Hover | Mouse hover state |
| Focus | Keyboard focus state |
| Open | Dropdown is expanded |
| Disabled | Non-interactive state |
| Error | Shows error styling and message |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Selected value (controlled) |
| `defaultValue` | `string` | Initial value (uncontrolled) |
| `options` | `Option[]` | List of options |
| `placeholder` | `string` | Placeholder text when no selection |
| `disabled` | `boolean` | Disable select |
| `error` | `string` | Error message to display |
| `label` | `string` | Associated label text |
| `size` | `'small' \| 'medium' \| 'large'` | Size variant |
| `prefix` | `ReactNode` | Content before select text |
| `suffix` | `ReactNode` | Content after select text |
| `onChange` | `(value: string) => void` | Selection change callback |
| `name` | `string` | Form field name |
| `required` | `boolean` | Mark as required field |

**Option Type:**

```typescript
interface Option {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
}
```

### Key CSS Patterns

```css
/* Select trigger button */
.geist-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  height: var(--geist-select-height, 40px);
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  border-radius: var(--geist-radius);
  cursor: pointer;
  transition: border-color 0.15s ease;
}

/* Size variants */
.geist-select[data-size="small"] { height: 32px; font-size: 13px; }
.geist-select[data-size="medium"] { height: 40px; font-size: 14px; }
.geist-select[data-size="large"] { height: 48px; font-size: 16px; }

/* Hover state */
.geist-select:hover {
  border-color: var(--ds-gray-alpha-600);
}

/* Focus state */
.geist-select:focus-visible {
  outline: 2px solid var(--ds-blue-700);
  outline-offset: 2px;
}

/* Open state */
.geist-select[data-state="open"] {
  border-color: var(--ds-gray-alpha-800);
}

/* Disabled state */
.geist-select[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--ds-gray-alpha-100);
}

/* Error state */
.geist-select[data-error] {
  border-color: var(--ds-red-700);
}

/* Dropdown content */
.geist-select-content {
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  border-radius: var(--geist-radius-lg);
  box-shadow: var(--ds-shadow-menu);
  padding: 4px;
  max-height: 300px;
  overflow-y: auto;
}

/* Option item */
.geist-select-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--geist-radius);
  cursor: pointer;
  transition: background 0.1s ease;
}

.geist-select-item:hover {
  background: var(--ds-gray-alpha-200);
}

.geist-select-item[data-highlighted] {
  background: var(--ds-gray-alpha-300);
}

.geist-select-item[data-selected] {
  background: var(--ds-blue-100);
}

/* Error message */
.geist-select-error {
  color: var(--ds-red-900);
  font-size: 13px;
  margin-top: 4px;
}

/* Chevron icon */
.geist-select-chevron {
  transition: transform 0.2s ease;
}

.geist-select[data-state="open"] .geist-select-chevron {
  transform: rotate(180deg);
}
```

### Implementation Notes

- Use prefix for icons that provide context (e.g., country flag)
- Error messages appear below the select
- Dropdown auto-positions based on available space
- Support keyboard navigation (arrow keys, enter, escape)
- Consider Combobox for searchable selections with many options

### Usage Guidelines

- Use for selecting from a predefined list of options
- Provide clear placeholder text when no selection
- Show error messages for validation failures
- Use appropriate size based on context
- Consider Combobox for lists with many options (searchable)
- Always provide accessible labels

---

## Skeleton

**Description:** A placeholder component that indicates loading content. Displays animated placeholder shapes while content is loading to maintain layout stability.

### Variants

| Variant | Description |
|---------|-------------|
| Default with set width | Skeleton with explicit width |
| Default with box height | Skeleton with explicit height |
| Wrapping children | Auto-calculates size based on children |
| Wrapping children with fixed size | Hides when children load, retains size |
| Pill | Rounded pill-shaped skeleton |
| Rounded | Skeleton with rounded corners |
| Squared | Skeleton with square corners |
| No animation | Static skeleton without shimmer effect |

### Shapes

| Shape | Description |
|-------|-------------|
| Rectangle | Default rectangular shape |
| Pill | Fully rounded ends (border-radius: 9999px) |
| Rounded | Rounded corners (border-radius: 6px) |
| Squared | Sharp corners (border-radius: 0) |
| Circle | Circular shape for avatars |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `width` | `string \| number` | Width of the skeleton |
| `height` | `string \| number` | Height of the skeleton |
| `shape` | `'rectangle' \| 'pill' \| 'rounded' \| 'squared' \| 'circle'` | Shape variant |
| `animated` | `boolean` | Enable/disable shimmer animation (default: true) |
| `children` | `ReactNode` | Content to wrap (skeleton hides when children render) |
| `show` | `boolean` | Force show/hide skeleton |
| `boxHeight` | `number` | Height when using box sizing |

### Key CSS Patterns

```css
/* Base skeleton */
.geist-skeleton {
  background: var(--ds-gray-alpha-200);
  border-radius: var(--geist-radius);
  position: relative;
  overflow: hidden;
}

/* Shape variants */
.geist-skeleton[data-shape="pill"] {
  border-radius: 9999px;
}

.geist-skeleton[data-shape="rounded"] {
  border-radius: 6px;
}

.geist-skeleton[data-shape="squared"] {
  border-radius: 0;
}

.geist-skeleton[data-shape="circle"] {
  border-radius: 50%;
}

/* Shimmer animation */
.geist-skeleton[data-animated="true"]::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    var(--ds-gray-alpha-300),
    transparent
  );
  animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* No animation variant */
.geist-skeleton[data-animated="false"]::after {
  display: none;
}

/* Wrapping children mode */
.geist-skeleton-wrapper {
  position: relative;
}

.geist-skeleton-wrapper[data-loaded="true"] .geist-skeleton {
  display: none;
}

.geist-skeleton-wrapper[data-loaded="false"] > *:not(.geist-skeleton) {
  visibility: hidden;
}

/* Fixed size wrapper - retains dimensions */
.geist-skeleton-wrapper[data-fixed-size="true"] {
  min-width: var(--skeleton-width);
  min-height: var(--skeleton-height);
}
```

### Implementation Notes

- Wrapping children mode automatically shows content when loaded
- Fixed size mode retains dimensions even after content loads
- Match skeleton shapes to the content they represent (circles for avatars)
- Disable animation for reduced motion preferences
- Use consistent skeleton patterns across your application

### Usage Guidelines

- Use skeletons to indicate loading states and maintain layout stability
- Match skeleton shapes to the content they represent
- Wrapping children mode automatically shows content when loaded
- Disable animation for static placeholders or reduced motion preferences
- Use consistent skeleton patterns across your application
- Consider using multiple skeletons to represent complex layouts

---

## Slider

**Description:** Input to select a value from a given range. A draggable control for selecting numeric values within a defined minimum and maximum.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard single-value slider |
| Range | Dual-thumb slider for selecting a range |
| With Steps | Slider with discrete step values |
| With Marks | Slider with labeled tick marks |
| Vertical | Vertically oriented slider |

### States

| State | Description |
|-------|-------------|
| Default | Normal slider appearance |
| Hover | Mouse hover on track or thumb |
| Active | Thumb is being dragged |
| Focus | Keyboard focus on thumb |
| Disabled | Non-interactive state |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `value` | `number \| [number, number]` | Current value(s) |
| `defaultValue` | `number \| [number, number]` | Initial value(s) |
| `min` | `number` | Minimum value (default: 0) |
| `max` | `number` | Maximum value (default: 100) |
| `step` | `number` | Step increment (default: 1) |
| `disabled` | `boolean` | Disable slider |
| `orientation` | `'horizontal' \| 'vertical'` | Slider orientation |
| `marks` | `Mark[]` | Tick marks with labels |
| `showValue` | `boolean` | Display current value |
| `onChange` | `(value: number \| [number, number]) => void` | Value change callback |
| `onChangeEnd` | `(value: number \| [number, number]) => void` | Callback when drag ends |

**Mark Type:**

```typescript
interface Mark {
  value: number;
  label?: string;
}
```

### Key CSS Patterns

```css
/* Slider container */
.geist-slider {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 20px;
  touch-action: none;
  user-select: none;
}

/* Vertical orientation */
.geist-slider[data-orientation="vertical"] {
  flex-direction: column;
  width: 20px;
  height: 200px;
}

/* Track */
.geist-slider-track {
  position: relative;
  flex-grow: 1;
  height: 4px;
  background: var(--ds-gray-alpha-400);
  border-radius: 9999px;
}

/* Filled range */
.geist-slider-range {
  position: absolute;
  height: 100%;
  background: var(--ds-blue-900);
  border-radius: 9999px;
}

/* Thumb */
.geist-slider-thumb {
  position: absolute;
  width: 16px;
  height: 16px;
  background: var(--ds-background-100);
  border: 2px solid var(--ds-blue-900);
  border-radius: 50%;
  cursor: grab;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.geist-slider-thumb:hover {
  transform: scale(1.1);
}

.geist-slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.15);
}

.geist-slider-thumb:focus-visible {
  outline: 2px solid var(--ds-blue-700);
  outline-offset: 2px;
}

/* Disabled state */
.geist-slider[data-disabled] {
  opacity: 0.5;
  pointer-events: none;
}

.geist-slider[data-disabled] .geist-slider-thumb {
  cursor: not-allowed;
}

/* Marks */
.geist-slider-marks {
  position: absolute;
  width: 100%;
  top: 100%;
  margin-top: 8px;
}

.geist-slider-mark {
  position: absolute;
  transform: translateX(-50%);
  font-size: 12px;
  color: var(--ds-gray-900);
}

/* Value tooltip */
.geist-slider-value {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  padding: 4px 8px;
  background: var(--ds-gray-1000);
  color: var(--ds-background-100);
  border-radius: var(--geist-radius);
  font-size: 12px;
  white-space: nowrap;
}
```

### Implementation Notes

- Support both mouse and touch interactions
- Use `step` prop for discrete value selection
- Range slider uses two thumbs for min/max selection
- Marks provide visual reference points
- Consider showing value tooltip during drag
- Support keyboard navigation (arrow keys)

### Usage Guidelines

- Use for selecting values within a continuous range
- Add marks for important reference points
- Use step for discrete value selection
- Consider showing current value for precision
- Ensure sufficient touch target size on mobile
- Support keyboard navigation for accessibility

---

## Spinner

**Description:** Indicate an action running in the background. Unlike loading dots, this should generally be used to indicate loading feedback in response to a user action, like for buttons, pagination, etc.

### Sizes

| Size | Dimensions | Use Case |
|------|------------|----------|
| Default | 20px | Standard loading indicator |
| Small | 16px | Inline or button loading |
| Large | 24px | Prominent loading states |
| Custom | Variable | Specific size requirements |

### Variants

| Variant | Description |
|---------|-------------|
| Default | Standard spinning indicator |
| With Label | Spinner with text label |
| Inverted | Light spinner for dark backgrounds |

### States

| State | Description |
|-------|-------------|
| Spinning | Default animated state |
| Static | Non-animated (for reduced motion) |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `size` | `number \| 'small' \| 'default' \| 'large'` | Spinner size |
| `color` | `string` | Spinner color |
| `label` | `string` | Accessible label text |
| `inverted` | `boolean` | Use light color for dark backgrounds |

### Key CSS Patterns

```css
/* Spinner container */
.geist-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Spinner SVG */
.geist-spinner-svg {
  animation: spinner-rotate 0.8s linear infinite;
}

@keyframes spinner-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Size variants */
.geist-spinner[data-size="small"] .geist-spinner-svg {
  width: 16px;
  height: 16px;
}

.geist-spinner[data-size="default"] .geist-spinner-svg {
  width: 20px;
  height: 20px;
}

.geist-spinner[data-size="large"] .geist-spinner-svg {
  width: 24px;
  height: 24px;
}

/* Spinner circle */
.geist-spinner-circle {
  stroke: currentColor;
  stroke-linecap: round;
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: spinner-dash 1.5s ease-in-out infinite;
}

@keyframes spinner-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* Inverted (light) variant */
.geist-spinner[data-inverted="true"] {
  color: var(--ds-background-100);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .geist-spinner-svg {
    animation: none;
  }
  .geist-spinner-circle {
    animation: none;
    stroke-dasharray: 90, 150;
  }
}
```

### Implementation Notes

- Use for user-initiated loading states (button clicks, form submissions)
- Different from Loading Dots which is for background processes
- Always provide accessible label for screen readers
- Respect reduced motion preferences
- Consider using inside buttons during form submission

### Usage Guidelines

- Use for loading feedback in response to user actions
- Place inside buttons during form submission
- Use Loading Dots for background/passive loading states
- Always provide accessible labels
- Respect user's reduced motion preferences
- Use inverted variant on dark backgrounds

---

## Split Button

**Description:** A button that offers a primary interaction coupled with a dropdown menu offering additional actions. Combines a main action button with a dropdown for related secondary actions.

### Variants

| Variant | Description |
|---------|-------------|
| Default | Primary action button with dropdown menu |
| Menu Alignment | Control dropdown alignment (left/right) |
| Icon | Icon-only split button variant |
| Disabled | Non-interactive split button |

### States

| State | Description |
|-------|-------------|
| Default | Normal split button appearance |
| Hover (Primary) | Mouse hover on primary action |
| Hover (Dropdown) | Mouse hover on dropdown trigger |
| Active | Button is pressed |
| Menu Open | Dropdown menu is expanded |
| Disabled | Non-interactive state |
| Loading | Primary action is loading |

### Props/Features

| Prop | Type | Description |
|------|------|-------------|
| `primaryAction` | `Action` | Main button action configuration |
| `menuItems` | `MenuItem[]` | Dropdown menu items |
| `menuAlignment` | `'left' \| 'right'` | Dropdown alignment |
| `size` | `'small' \| 'medium' \| 'large'` | Button size |
| `disabled` | `boolean` | Disable entire split button |
| `loading` | `boolean` | Show loading state on primary |
| `icon` | `ReactNode` | Icon for icon-only variant |

**Action Type:**

```typescript
interface Action {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
}
```

**MenuItem Type:**

```typescript
interface MenuItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}
```

### Key CSS Patterns

```css
/* Split button container */
.geist-split-button {
  display: inline-flex;
  border-radius: var(--geist-radius);
  overflow: hidden;
}

/* Primary action button */
.geist-split-button-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  height: 40px;
  background: var(--ds-gray-1000);
  color: var(--ds-background-100);
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.geist-split-button-primary:hover {
  background: var(--ds-gray-900);
}

/* Divider between buttons */
.geist-split-button-divider {
  width: 1px;
  background: var(--ds-gray-800);
}

/* Dropdown trigger */
.geist-split-button-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 40px;
  background: var(--ds-gray-1000);
  color: var(--ds-background-100);
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

.geist-split-button-trigger:hover {
  background: var(--ds-gray-900);
}

/* Chevron icon */
.geist-split-button-chevron {
  transition: transform 0.2s ease;
}

.geist-split-button-trigger[data-state="open"] .geist-split-button-chevron {
  transform: rotate(180deg);
}

/* Size variants */
.geist-split-button[data-size="small"] .geist-split-button-primary {
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
}

.geist-split-button[data-size="small"] .geist-split-button-trigger {
  width: 28px;
  height: 32px;
}

.geist-split-button[data-size="large"] .geist-split-button-primary {
  height: 48px;
  padding: 0 20px;
  font-size: 16px;
}

.geist-split-button[data-size="large"] .geist-split-button-trigger {
  width: 44px;
  height: 48px;
}

/* Disabled state */
.geist-split-button[data-disabled] {
  opacity: 0.5;
  pointer-events: none;
}

/* Loading state */
.geist-split-button-primary[data-loading] {
  pointer-events: none;
}

/* Dropdown menu */
.geist-split-button-menu {
  background: var(--ds-background-100);
  border: 1px solid var(--ds-gray-alpha-400);
  border-radius: var(--geist-radius-lg);
  box-shadow: var(--ds-shadow-menu);
  padding: 4px;
  min-width: 160px;
}

/* Menu item */
.geist-split-button-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--geist-radius);
  cursor: pointer;
  transition: background 0.1s ease;
}

.geist-split-button-menu-item:hover {
  background: var(--ds-gray-alpha-200);
}

/* Destructive item */
.geist-split-button-menu-item[data-destructive] {
  color: var(--ds-red-900);
}

.geist-split-button-menu-item[data-destructive]:hover {
  background: var(--ds-red-100);
}
```

### Implementation Notes

- Primary action should be the first item in the dropdown menu
- Use for actions with multiple related options
- Menu alignment adapts based on available space
- Support keyboard navigation in dropdown
- Consider loading state for async primary actions

### Usage Guidelines

- Primary action should be the most common/important action
- Keep menu items related to the primary action
- Use destructive styling for dangerous actions
- Consider icon variant for compact UIs
- Ensure keyboard accessibility for both button and menu
- Primary action should also appear as first menu item for discoverability

---

## Summary

This batch covers 8 essential Geist components for building interactive interfaces:

| Component | Primary Use Case |
|-----------|-----------------|
| **Progress** | Display task completion or resource usage |
| **Radio** | Single selection from mutually exclusive options |
| **Scroller** | Navigate overflowing content with buttons |
| **Select** | Choose one option from a dropdown list |
| **Skeleton** | Loading placeholders for content |
| **Slider** | Select numeric values from a range |
| **Spinner** | Loading feedback for user actions |
| **Split Button** | Primary action with dropdown alternatives |

---

## Accessibility Checklist

All components in this batch follow accessibility best practices:

- ✅ Proper ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus management and visible focus indicators
- ✅ Color contrast compliance (WCAG AA)
- ✅ Screen reader compatibility
- ✅ Reduced motion support

---

## Related Resources

- [Geist Design System](https://vercel.com/geist)
- [Geist Components Reference - Part 1](./GEIST-COMPONENTS-REFERENCE.md)
- [Geist Components Reference - Part 2](./GEIST-COMPONENTS-REFERENCE-2.md)
- [Geist Components Reference - Part 3](./GEIST-COMPONENTS-REFERENCE-3.md)
- [Vercel Geist Design System Overview](./VERCEL-GEIST-DESIGN-SYSTEM.md)
- [Geist CSS Patterns](./GEIST-CSS-PATTERNS.md)

---

*Documentation extracted from [Vercel Geist Design System](https://vercel.com/geist)*
