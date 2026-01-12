# Vercel Animation & Transition Patterns

A comprehensive guide to Vercel's animation and transition patterns based on research of their design system, website, and community implementations.

## Table of Contents

1. [Transition Durations](#transition-durations)
2. [Easing Functions](#easing-functions)
3. [Hover Animations](#hover-animations)
4. [Page Transitions](#page-transitions)
5. [Micro-interactions](#micro-interactions)
6. [Skeleton Loading](#skeleton-loading)
7. [CSS Custom Properties](#css-custom-properties)
8. [Implementation Examples](#implementation-examples)

---

## Transition Durations

Vercel uses a consistent set of transition durations across their UI:

### Duration Scale

| Token | Value | Use Case |
|-------|-------|----------|
| `--duration-instant` | `0ms` | No animation |
| `--duration-fast` | `100ms` | Micro-interactions, color changes |
| `--duration-normal` | `150ms` | **Primary duration** - hover states, tabs, buttons |
| `--duration-moderate` | `200ms` | Dropdowns, tooltips |
| `--duration-slow` | `250ms` | Content transitions, page elements |
| `--duration-slower` | `300ms` | Complex animations, modals |
| `--duration-slowest` | `350ms` | Modal dialogs, large overlays |

### Key Findings

- **150ms is the primary transition duration** used across Vercel's UI
- Tab animations use `150ms` for hover, transform, and opacity
- Modal animations use `350ms` for enter/exit
- Loading dots use `1400ms` for the full blink cycle

```css
/* Vercel's primary transition durations */
:root {
  --transition-fast: 100ms;
  --transition-normal: 150ms;
  --transition-slow: 200ms;
  --transition-slower: 300ms;
  --transition-modal: 350ms;
}
```

---

## Easing Functions

### Primary Easing Curves

| Name | CSS Value | Use Case |
|------|-----------|----------|
| `ease-out` | `ease-out` | Default for most UI transitions |
| `ease-out-cubic` | `cubic-bezier(0.33, 1, 0.68, 1)` | Smooth deceleration |
| `ease-in-out` | `ease-in-out` | Symmetric animations |
| `ease-out-expo` | `cubic-bezier(0.19, 1, 0.22, 1)` | Dramatic deceleration |

### Vercel's Preferred Easing

Based on analysis of Vercel's tabs component and other UI elements:

```css
/* Primary easing - used in tabs, buttons, cards */
transition-timing-function: ease-out;

/* For React-Spring / Framer Motion */
config: {
  duration: 150,
  easing: easings.easeOutCubic,
}

/* Cubic-bezier equivalents */
--ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1);
--ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);
```

### Animation Easing for Keyframes

```css
/* Pulse animation (loading states) */
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

/* Ping animation (notifications) */
animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;

/* Spin animation (spinners) */
animation: spin 1s linear infinite;

/* Bounce animation */
animation: bounce 1s infinite;
```

---

## Hover Animations

### Button Hover Effects

```css
/* Primary button hover */
.button {
  transition: all 150ms ease-out;
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.button:active {
  transform: translateY(0);
}
```

### Card Hover Effects

```css
/* Vercel-style card hover */
.card {
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Alternative: scale effect */
.card:hover {
  transform: scale(1.02);
}
```

### Link Hover Effects

```css
/* Text link with underline animation */
.link {
  position: relative;
  transition: color 150ms ease-out;
}

.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: currentColor;
  transition: width 150ms ease-out;
}

.link:hover::after {
  width: 100%;
}
```

### Tab Navigation (Vercel Dashboard Style)

The signature Vercel tabs animation with direction-aware hover backdrop:

```css
/* Tab hover backdrop */
.tab-backdrop {
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  border-radius: 6px;
  background: var(--gray-200);
  transition: transform 150ms ease-out,
              opacity 150ms ease-out,
              width 150ms ease-out;
}

/* Initial hover (fade in only) */
.tab-backdrop.initial {
  transition: opacity 150ms ease-out;
}

/* Tab underline indicator */
.tab-underline {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: var(--gray-900);
  transition: transform 150ms ease-out,
              width 150ms ease-out,
              opacity 150ms ease-out 150ms; /* delayed opacity */
}
```

---

## Page Transitions

### Fade Transitions

```css
/* Page fade in */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.page-enter {
  animation: fadeIn 200ms ease-out;
}

/* With slight movement */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Content Slide Transitions

```css
/* Slide in from direction */
.content-enter {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

.content-enter-active {
  opacity: 1;
  transform: translateX(0) scale(1);
  transition: opacity 250ms ease-out, transform 250ms ease-out;
}

.content-exit {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.content-exit-active {
  opacity: 0;
  transform: translateX(-100px) scale(0.8);
  transition: opacity 250ms ease-out, transform 250ms ease-out;
}
```

### Modal Transitions

Based on Vercel UI modal implementation:

```css
/* Modal overlay */
.modal-overlay {
  background: rgba(0, 0, 0, 0.75);
  animation-duration: 150ms;
}

.modal-overlay[data-state="open"] {
  animation: fadeIn 150ms ease-out;
}

.modal-overlay[data-state="closed"] {
  animation: fadeOut 150ms ease-out;
}

/* Modal content */
.modal-content {
  animation-duration: 350ms; /* Longer for modal content */
}

.modal-content[data-state="open"] {
  animation: slideInFromTop 350ms ease-out;
}

.modal-content[data-state="closed"] {
  animation: slideOutToTop 350ms ease-out;
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideOutToTop {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
```

---

## Micro-interactions

### Toggle Switch

```css
.toggle {
  position: relative;
  width: 44px;
  height: 24px;
  background: var(--gray-400);
  border-radius: 12px;
  transition: background 150ms ease-out;
}

.toggle[data-state="checked"] {
  background: var(--blue-600);
}

.toggle-thumb {
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 150ms ease-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle[data-state="checked"] .toggle-thumb {
  transform: translateX(20px);
}
```

### Checkbox Animation

```css
.checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid var(--gray-400);
  border-radius: 4px;
  transition: background 150ms ease-out, border-color 150ms ease-out;
}

.checkbox[data-state="checked"] {
  background: var(--blue-600);
  border-color: var(--blue-600);
}

.checkbox-icon {
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 100ms ease-out, transform 100ms ease-out;
}

.checkbox[data-state="checked"] .checkbox-icon {
  opacity: 1;
  transform: scale(1);
}
```

### Dropdown Menu

```css
.dropdown-content {
  transform-origin: top center;
  animation-duration: 150ms;
}

.dropdown-content[data-state="open"] {
  animation: dropdownOpen 150ms ease-out;
}

.dropdown-content[data-state="closed"] {
  animation: dropdownClose 100ms ease-in;
}

@keyframes dropdownOpen {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes dropdownClose {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }
}
```

### Toast Notifications

```css
.toast {
  animation: toastEnter 300ms ease-out;
}

.toast.exiting {
  animation: toastExit 200ms ease-in forwards;
}

@keyframes toastEnter {
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes toastExit {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-100%);
  }
}

/* Toast progress bar */
.toast-progress {
  height: 3px;
  background: var(--blue-600);
  animation: toastProgress 5s linear forwards;
}

@keyframes toastProgress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
```

---

## Skeleton Loading

### Shimmer Animation

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-100) 0%,
    var(--gray-200) 50%,
    var(--gray-100) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### Pulse Animation (Alternative)

```css
.skeleton-pulse {
  background: var(--gray-200);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-radius: 4px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### Loading Dots (Vercel Style)

Based on Vercel UI implementation:

```css
.loading-dots {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.loading-dot {
  width: var(--loading-dots-size, 4px);
  height: var(--loading-dots-size, 4px);
  border-radius: 50%;
  background: currentColor;
  animation: loadingDotsBlink 1400ms infinite both;
}

.loading-dot:nth-child(2) {
  animation-delay: 200ms;
}

.loading-dot:nth-child(3) {
  animation-delay: 400ms;
}

@keyframes loadingDotsBlink {
  0%, 100% {
    opacity: 0.2;
  }
  20% {
    opacity: 1;
  }
}
```

### Spinner

```css
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--gray-200);
  border-top-color: var(--gray-900);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

## CSS Custom Properties

### Complete Animation Token System

```css
:root {
  /* Durations */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-moderate: 200ms;
  --duration-slow: 250ms;
  --duration-slower: 300ms;
  --duration-slowest: 350ms;
  --duration-loading: 1400ms;
  
  /* Easing */
  --ease-default: ease-out;
  --ease-in: ease-in;
  --ease-in-out: ease-in-out;
  --ease-linear: linear;
  --ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  /* Common transitions */
  --transition-colors: color var(--duration-normal) var(--ease-default),
                       background-color var(--duration-normal) var(--ease-default),
                       border-color var(--duration-normal) var(--ease-default);
  --transition-opacity: opacity var(--duration-normal) var(--ease-default);
  --transition-transform: transform var(--duration-normal) var(--ease-default);
  --transition-shadow: box-shadow var(--duration-normal) var(--ease-default);
  --transition-all: all var(--duration-normal) var(--ease-default);
}
```

---

## Implementation Examples

### React/Framer Motion Configuration

```tsx
// Vercel-style animation config
const transition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.15, // 150ms
};

// For tabs/navigation
const tabTransition = {
  type: "tween",
  ease: [0.33, 1, 0.68, 1], // easeOutCubic
  duration: 0.15,
};

// For modals
const modalTransition = {
  type: "tween",
  ease: "easeOut",
  duration: 0.35, // 350ms
};

// For content transitions
const contentTransition = {
  type: "tween",
  ease: [0.33, 1, 0.68, 1],
  duration: 0.25,
};
```

### Tailwind CSS Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      transitionDuration: {
        'fast': '100ms',
        'normal': '150ms',
        'moderate': '200ms',
        'slow': '250ms',
        'slower': '300ms',
        'modal': '350ms',
      },
      transitionTimingFunction: {
        'out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)',
        'in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        'shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'loading-dots-blink': {
          '0%, 100%': { opacity: '0.2' },
          '20%': { opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-from-top': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'dropdown-open': {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(-8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'loading-dots-blink': 'loading-dots-blink 1400ms both infinite',
        'fade-in': 'fade-in 150ms ease-out',
        'fade-in-up': 'fade-in-up 200ms ease-out',
        'slide-in-from-top': 'slide-in-from-top 350ms ease-out',
        'dropdown-open': 'dropdown-open 150ms ease-out',
      },
    },
  },
};
```

---

## Summary: Key Animation Values

| Animation Type | Duration | Easing | Notes |
|---------------|----------|--------|-------|
| Button hover | 150ms | ease-out | Transform + shadow |
| Tab navigation | 150ms | easeOutCubic | Direction-aware |
| Dropdown | 150ms | ease-out | Scale + translate |
| Modal enter | 350ms | ease-out | Slide from top |
| Modal exit | 350ms | ease-out | Slide to top |
| Toast | 300ms | ease-out | Slide in |
| Skeleton shimmer | 1500ms | ease-in-out | Infinite loop |
| Loading dots | 1400ms | linear | Staggered 200ms |
| Spinner | 800ms | linear | Infinite rotation |
| Checkbox | 100ms | ease-out | Scale + opacity |
| Toggle | 150ms | ease-out | Transform |

---

## References

- [Vercel Tabs Component Analysis](https://www.joshuawootonn.com/vercel-tabs-component) - Detailed breakdown of Vercel's tab animation
- [Vercel UI Components](https://vercel-ui-phi.vercel.app/) - Community implementation of Vercel UI
- [Framer Motion](https://www.framer.com/motion/) - Animation library used by Vercel
- [React-Spring](https://react-spring.dev/) - Alternative animation library sponsored by Next.js

---

*Content was researched and compiled from multiple sources for compliance with licensing restrictions.*
