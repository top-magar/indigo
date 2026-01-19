# Vercel Geist Component-Specific Styling Patterns

> Comprehensive CSS patterns for implementing Vercel's Geist Design System components

## Table of Contents
1. [Button Styles](#1-button-styles)
2. [Input/Form Field Styling](#2-inputform-field-styling)
3. [Card Styling](#3-card-styling)
4. [Modal/Dialog Styling](#4-modaldialog-styling)
5. [Table Styling](#5-table-styling)
6. [Navigation Styling](#6-navigation-styling)
7. [Badge/Tag Styling](#7-badgetag-styling)
8. [Tooltip Styling](#8-tooltip-styling)
9. [Select/Dropdown Styling](#9-selectdropdown-styling)
10. [Tabs Styling](#10-tabs-styling)

---

## 1. Button Styles

### Base Button Pattern
```css
/* Core button styles */
.button {
  transition-property: color, background-color, border-color;
  transition-duration: 150ms;
  user-select: none;
  font-weight: 500;
  border: 1px solid transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2px;
  max-width: 100%;
}
```

### Button Variants

#### Default (Primary) Button
```css
.button-default {
  background-color: var(--gray-1000); /* #0a0a0a in light, #fafafa in dark */
  color: var(--background-100);
}
.button-default:hover {
  background-color: #ccc;
}
```

#### Secondary Button
```css
.button-secondary {
  background-color: var(--background-100);
  border-color: var(--gray-alpha-400);
  color: var(--gray-1000);
}
.button-secondary:hover {
  background-color: var(--gray-alpha-200);
}
```

#### Tertiary Button
```css
.button-tertiary {
  background-color: transparent;
  border-color: transparent;
  color: var(--gray-1000);
}
.button-tertiary:hover {
  background-color: var(--gray-alpha-200);
}
```

#### Error Button
```css
.button-error {
  background-color: var(--red-800);
  border-color: var(--red-800);
}
.button-error:hover {
  background-color: var(--red-900);
  border-color: var(--red-900);
}
```

#### Warning Button
```css
.button-warning {
  color: #0a0a0a;
  background-color: var(--amber-800);
  border-color: var(--amber-800);
}
.button-warning:hover {
  background-color: #d27504;
  border-color: #d27504;
}
```

### Button Sizes
```css
/* Tiny - 24px height */
.button-tiny {
  height: 24px;
  padding: 0 2px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 16px;
}

/* Small - 32px height */
.button-small {
  height: 32px;
  padding: 0 6px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 20px;
}

/* Medium (Default) - 40px height */
.button-medium {
  height: 40px;
  padding: 0 10px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 20px;
}

/* Large - 48px height */
.button-large {
  height: 48px;
  padding: 0 14px;
  border-radius: 8px;
  font-size: 16px;
  line-height: 24px;
}
```

### Button States
```css
/* Disabled state */
.button:disabled {
  background-color: var(--gray-100);
  color: var(--gray-700);
  border-color: var(--gray-400);
  cursor: not-allowed;
}

/* Loading state - uses spinner */
.button-loading {
  pointer-events: none;
}

/* Shape variants */
.button-square { aspect-ratio: 1; }
.button-circle { aspect-ratio: 1; border-radius: 9999px; }
.button-rounded { border-radius: 9999px; }

/* With shadow */
.button-shadow { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
```

### Typography for Buttons
```css
/* Button 16 - Largest button */
.text-button-16 { font-size: 16px; font-weight: 500; }

/* Button 14 - Default button */
.text-button-14 { font-size: 14px; font-weight: 500; }

/* Button 12 - Tiny button inside input fields */
.text-button-12 { font-size: 12px; font-weight: 500; }
```

---

## 2. Input/Form Field Styling

### Base Input Pattern
```css
.input-wrapper {
  border: 1px solid var(--gray-alpha-400);
  display: flex;
  overflow: hidden;
  background-color: var(--background-100);
  position: relative;
  transition: box-shadow 150ms;
}

.input-wrapper:focus-within {
  box-shadow: 0 0 0 2px var(--focus-ring-color);
}
```

### Input Sizes
```css
/* Small - 32px height */
.input-small {
  height: 32px;
  font-size: 14px;
  border-radius: 6px;
  --icon-size: 14px;
}

/* Medium (Default) - 40px height */
.input-medium {
  height: 40px;
  font-size: 14px;
  border-radius: 6px;
  --icon-size: 16px;
}

/* Large - 48px height */
.input-large {
  height: 48px;
  font-size: 16px;
  border-radius: 8px;
  --icon-size: 18px;
}
```

### Input Field Styles
```css
.input {
  background-color: transparent;
  outline: none;
  flex: 1;
}

.input::placeholder {
  color: var(--gray-700);
}

/* Disabled state */
.input:disabled {
  cursor: not-allowed;
  background-color: var(--background-200);
  color: var(--gray-700);
}

.input:disabled::placeholder {
  color: var(--gray-500);
}
```

### Prefix/Suffix Styling
```css
.input-prefix,
.input-suffix {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  padding: 0 12px;
  color: var(--gray-700);
}

/* Icon sizing within prefix/suffix */
.input-prefix svg,
.input-suffix svg {
  width: var(--icon-size);
  height: var(--icon-size);
}

/* With background styling */
.input-prefix-styled,
.input-suffix-styled {
  background-color: var(--background-200);
}
```

### Input Label
```css
.input-label {
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--gray-900);
}
```

### Focus Ring Pattern
```css
/* Geist focus ring */
.focus-ring:focus-within {
  box-shadow: 
    0 0 0 1px var(--background-100),
    0 0 0 3px var(--blue-700);
}
```

---

## 3. Card Styling

### Base Card Pattern
```css
.card {
  border-radius: 8px;
  border: 1px solid var(--gray-alpha-400);
  background-color: var(--card-background);
  color: var(--card-foreground);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
```

### Card Sections
```css
.card-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 24px;
}

.card-title {
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.025em;
}

.card-description {
  font-size: 14px;
  color: var(--muted-foreground);
}

.card-content {
  padding: 24px;
  padding-top: 0;
}

.card-footer {
  display: flex;
  align-items: center;
  padding: 24px;
  padding-top: 0;
}
```

### Material System (Geist Surfaces)
```css
/* Base surface - everyday use */
.material-base {
  background-color: var(--background-100);
  border-radius: 6px;
}

/* Small - slightly raised */
.material-small {
  background-color: var(--background-100);
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

/* Medium - further raised */
.material-medium {
  background-color: var(--background-100);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

/* Large - further raised */
.material-large {
  background-color: var(--background-100);
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}
```

### Card Hover Effects
```css
.card-interactive {
  transition: box-shadow 150ms, border-color 150ms;
}

.card-interactive:hover {
  border-color: var(--gray-alpha-600);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

---

## 4. Modal/Dialog Styling

### Backdrop/Overlay
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.75);
}

/* Animation */
.modal-overlay[data-state="open"] {
  animation: fadeIn 150ms ease-out;
}

.modal-overlay[data-state="closed"] {
  animation: fadeOut 150ms ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

### Modal Container
```css
.modal-content {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 50;
  width: 100%;
  max-width: 540px;
  transform: translate(-50%, -50%);
}

.modal-inner {
  border-radius: 12px;
  background-color: var(--background-100);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px var(--gray-alpha-200);
}
```

### Modal Animation
```css
/* Slide in from top animation */
.modal-inner[data-state="open"] {
  animation: slideInFromTop 350ms ease-out;
}

.modal-inner[data-state="closed"] {
  animation: slideOutToTop 350ms ease-in;
}

@keyframes slideInFromTop {
  from {
    opacity: 0;
    transform: translateY(-40px);
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
    transform: translateY(-40px);
  }
}
```

### Modal Sections
```css
.modal-body {
  padding: 24px;
}

.modal-body > * + * {
  margin-top: 24px;
}

.modal-header {
  text-align: left;
}

.modal-title {
  margin-bottom: 24px;
  text-align: left;
  font-size: 24px;
  font-weight: 600;
  color: var(--gray-1000);
}

.modal-description {
  font-size: 16px;
  font-weight: 400;
  color: var(--gray-1000);
}

.modal-actions {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  border-radius: 0 0 12px 12px;
  background-color: var(--background-200);
  padding: 16px;
  box-shadow: 0 -1px 0 0 var(--gray-alpha-400);
}
```

### Floating Material System
```css
/* Tooltip material - lightest shadow, 6px radius */
.material-tooltip {
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

/* Menu material - lift from page, 12px radius */
.material-menu {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
}

/* Modal material - further lift, 12px radius */
.material-modal {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.24);
}

/* Fullscreen material - biggest lift, 16px radius */
.material-fullscreen {
  border-radius: 16px;
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.32);
}
```

---

## 5. Table Styling

### Base Table Pattern
```css
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid var(--gray-alpha-400);
  border-radius: 8px;
}
```

### Table Header
```css
.table-header {
  background-color: var(--background-200);
}

.table-header-cell {
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  font-size: 13px;
  color: var(--gray-900);
  border-bottom: 1px solid var(--gray-alpha-400);
  white-space: nowrap;
}

/* Sortable header */
.table-header-cell-sortable {
  cursor: pointer;
  user-select: none;
}

.table-header-cell-sortable:hover {
  background-color: var(--gray-alpha-100);
}
```

### Table Rows
```css
.table-row {
  border-bottom: 1px solid var(--gray-alpha-200);
  transition: background-color 150ms;
}

.table-row:last-child {
  border-bottom: none;
}

/* Hover state */
.table-row:hover {
  background-color: var(--gray-alpha-100);
}

/* Selected state */
.table-row-selected {
  background-color: var(--blue-100);
}

.table-row-selected:hover {
  background-color: var(--blue-200);
}
```

### Table Cells
```css
.table-cell {
  padding: 12px 16px;
  color: var(--gray-1000);
  vertical-align: middle;
}

/* Compact variant */
.table-cell-compact {
  padding: 8px 12px;
}

/* Numeric/mono cells */
.table-cell-mono {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
```

### Empty State
```css
.table-empty {
  padding: 48px 24px;
  text-align: center;
  color: var(--gray-700);
}
```

---

## 6. Navigation Styling

### Sidebar Navigation
```css
.sidebar {
  width: 240px;
  height: 100vh;
  background-color: var(--background-100);
  border-right: 1px solid var(--gray-alpha-400);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--gray-alpha-200);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--gray-alpha-200);
}
```

### Nav Item
```css
.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--gray-900);
  text-decoration: none;
  transition: background-color 150ms, color 150ms;
}

.nav-item:hover {
  background-color: var(--gray-alpha-100);
  color: var(--gray-1000);
}

.nav-item-active {
  background-color: var(--gray-alpha-200);
  color: var(--gray-1000);
  font-weight: 500;
}

.nav-item-icon {
  width: 16px;
  height: 16px;
  color: var(--gray-700);
}

.nav-item-active .nav-item-icon {
  color: var(--gray-1000);
}
```

### Tabs Navigation (Vercel Style)
```css
.tabs-list {
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
  align-items: baseline;
  overflow-x: auto;
  padding-bottom: 1px;
  box-shadow: 0 -1px 0 var(--gray-alpha-400) inset;
}

.tabs-trigger {
  padding-right: 24px;
  color: var(--gray-900);
  cursor: pointer;
  transition: color 150ms;
}

.tabs-trigger:last-child {
  padding-right: 0;
}

.tabs-trigger:hover {
  color: var(--gray-1000);
}

.tabs-trigger[data-state="active"] {
  color: var(--gray-1000);
}

.tabs-trigger-inner {
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  padding: 12px 0;
  font-size: 14px;
  line-height: 20px;
}

.tabs-trigger[data-state="active"] .tabs-trigger-inner {
  border-bottom-color: var(--gray-1000);
}
```

### Animated Tab Hover (Vercel Dashboard Style)
```css
/* Hover background that follows cursor */
.tabs-hover-bg {
  position: absolute;
  z-index: 10;
  top: 0;
  left: 0;
  border-radius: 6px;
  background-color: var(--gray-200);
  transition: transform 150ms, width 150ms, opacity 150ms;
}

/* Selection underline */
.tabs-selection-indicator {
  position: absolute;
  z-index: 10;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: var(--gray-1000);
  transition: transform 150ms, width 150ms;
}
```

### Breadcrumbs
```css
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-item {
  color: var(--gray-700);
  text-decoration: none;
}

.breadcrumb-item:hover {
  color: var(--gray-1000);
}

.breadcrumb-item-current {
  color: var(--gray-1000);
  font-weight: 500;
}

/* Vercel uses slashes as separators */
.breadcrumb-separator {
  color: var(--gray-500);
}

.breadcrumb-separator::before {
  content: "/";
}
```

---

## 7. Badge/Tag Styling

### Base Badge Pattern
```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  text-transform: capitalize;
  white-space: nowrap;
  font-weight: 500;
}
```

### Badge Sizes
```css
/* Small */
.badge-sm {
  padding: 0 6px;
  height: 20px;
  font-size: 11px;
  gap: 2px;
}

.badge-sm svg {
  width: 11px;
  height: 11px;
}

/* Medium (Default) */
.badge-md {
  padding: 0 10px;
  height: 24px;
  font-size: 12px;
  gap: 4px;
}

.badge-md svg {
  width: 14px;
  height: 14px;
}

/* Large */
.badge-lg {
  padding: 0 12px;
  height: 32px;
  font-size: 14px;
  gap: 6px;
}

.badge-lg svg {
  width: 16px;
  height: 16px;
}
```

### Badge Color Variants
```css
/* Solid variants */
.badge-gray { background-color: var(--gray-700); color: white; }
.badge-blue { background-color: var(--blue-700); color: white; }
.badge-purple { background-color: var(--purple-700); color: white; }
.badge-amber { background-color: var(--amber-700); color: black; }
.badge-red { background-color: var(--red-700); color: white; }
.badge-pink { background-color: var(--pink-700); color: white; }
.badge-green { background-color: var(--green-700); color: white; }
.badge-teal { background-color: var(--teal-700); color: white; }

/* Subtle variants */
.badge-gray-subtle { background-color: var(--gray-200); color: var(--gray-1000); }
.badge-blue-subtle { background-color: var(--blue-200); color: var(--blue-900); }
.badge-purple-subtle { background-color: var(--purple-200); color: var(--purple-900); }
.badge-amber-subtle { background-color: var(--amber-200); color: var(--amber-900); }
.badge-red-subtle { background-color: var(--red-200); color: var(--red-900); }
.badge-pink-subtle { background-color: var(--pink-300); color: var(--pink-900); }
.badge-green-subtle { background-color: var(--green-200); color: var(--green-900); }
.badge-teal-subtle { background-color: var(--teal-300); color: var(--teal-900); }

/* Special gradient variants */
.badge-trial {
  background: linear-gradient(to bottom right, var(--blue-700), #f81be6);
  color: white;
}

.badge-turbo {
  background: linear-gradient(to bottom right, #ff1e56, #0096ff);
  color: white;
}
```

---

## 8. Tooltip Styling

### Base Tooltip Pattern
```css
.tooltip {
  z-index: 50;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid var(--contrast);
  background-color: var(--contrast);
  padding: 8px 12px;
  font-size: 13px;
  color: var(--gray-100);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

### Tooltip Animation
```css
/* Enter animation */
.tooltip[data-state="delayed-open"],
.tooltip[data-state="instant-open"] {
  animation: tooltipIn 150ms ease-out;
}

.tooltip[data-state="closed"] {
  animation: tooltipOut 150ms ease-in;
}

@keyframes tooltipIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes tooltipOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
```

### Tooltip Position Animations
```css
/* Slide in based on position */
.tooltip[data-side="top"] {
  animation-name: slideInFromBottom;
}

.tooltip[data-side="bottom"] {
  animation-name: slideInFromTop;
}

.tooltip[data-side="left"] {
  animation-name: slideInFromRight;
}

.tooltip[data-side="right"] {
  animation-name: slideInFromLeft;
}

@keyframes slideInFromTop {
  from { transform: translateY(-8px); }
  to { transform: translateY(0); }
}

@keyframes slideInFromBottom {
  from { transform: translateY(8px); }
  to { transform: translateY(0); }
}

@keyframes slideInFromLeft {
  from { transform: translateX(-8px); }
  to { transform: translateX(0); }
}

@keyframes slideInFromRight {
  from { transform: translateX(8px); }
  to { transform: translateX(0); }
}
```

### Tooltip Arrow
```css
.tooltip-arrow {
  fill: var(--contrast);
}
```

---

## 9. Select/Dropdown Styling

### Select Trigger
```css
.select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--gray-alpha-400);
  border-radius: 6px;
  background-color: var(--background-100);
  padding: 0 12px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 150ms, box-shadow 150ms;
}

.select-trigger:hover {
  border-color: var(--gray-alpha-600);
}

.select-trigger:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--focus-ring-color);
}

/* Sizes */
.select-trigger-sm { height: 32px; }
.select-trigger-md { height: 40px; }
.select-trigger-lg { height: 48px; }

/* Disabled */
.select-trigger:disabled {
  background-color: var(--background-200);
  color: var(--gray-700);
  cursor: not-allowed;
}

/* Error state */
.select-trigger-error {
  border-color: var(--red-700);
}
```

### Select Content (Dropdown)
```css
.select-content {
  z-index: 50;
  min-width: 160px;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--gray-alpha-400);
  background-color: var(--background-100);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.16);
  padding: 4px;
}
```

### Select Item
```css
.select-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: background-color 150ms;
}

.select-item:hover,
.select-item:focus {
  background-color: var(--gray-alpha-100);
}

.select-item[data-state="checked"] {
  background-color: var(--gray-alpha-200);
  font-weight: 500;
}
```

---

## 10. Tabs Styling

### Tabs Container
```css
.tabs-root {
  display: flex;
  flex-direction: column;
}
```

### Tabs List
```css
.tabs-list {
  display: flex;
  width: 100%;
  flex-wrap: nowrap;
  align-items: baseline;
  overflow-x: auto;
  padding-bottom: 1px;
  box-shadow: 0 -1px 0 var(--gray-alpha-400) inset;
}
```

### Tab Trigger
```css
.tab-trigger {
  position: relative;
  padding-right: 24px;
  color: var(--gray-900);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  line-height: 20px;
  transition: color 150ms;
}

.tab-trigger:last-child {
  padding-right: 0;
}

.tab-trigger:hover:not(:disabled) {
  color: var(--gray-1000);
}

.tab-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.tab-trigger[data-state="active"] {
  color: var(--gray-1000);
}
```

### Tab Trigger Inner (with underline)
```css
.tab-trigger-inner {
  margin-bottom: -1px;
  border-bottom: 2px solid transparent;
  padding: 12px 0;
}

.tab-trigger[data-state="active"] .tab-trigger-inner {
  border-bottom-color: var(--gray-1000);
}
```

### Tab Content
```css
.tab-content {
  padding-top: 16px;
}

/* Content transition */
.tab-content[data-state="active"] {
  animation: tabContentIn 200ms ease-out;
}

@keyframes tabContentIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## CSS Variables Reference

### Core Color Variables
```css
:root {
  /* Backgrounds */
  --background-100: #ffffff;
  --background-200: #fafafa;
  
  /* Gray scale */
  --gray-100: #f5f5f5;
  --gray-200: #ebebeb;
  --gray-400: #999999;
  --gray-500: #888888;
  --gray-700: #666666;
  --gray-900: #333333;
  --gray-1000: #0a0a0a;
  
  /* Alpha grays */
  --gray-alpha-100: rgba(0, 0, 0, 0.04);
  --gray-alpha-200: rgba(0, 0, 0, 0.08);
  --gray-alpha-400: rgba(0, 0, 0, 0.16);
  --gray-alpha-600: rgba(0, 0, 0, 0.32);
  
  /* Semantic colors */
  --blue-200: #d3e5ff;
  --blue-700: #0070f3;
  --blue-900: #0050b3;
  
  --red-200: #ffd6d9;
  --red-700: #e00;
  --red-800: #c00;
  --red-900: #a00;
  
  --green-200: #d3f9d8;
  --green-700: #0a0;
  --green-900: #070;
  
  --amber-200: #fff3cd;
  --amber-700: #f5a623;
  --amber-800: #d27504;
  
  /* Contrast (for tooltips, dark surfaces) */
  --contrast: #0a0a0a;
}

/* Dark mode overrides */
.dark {
  --background-100: #0a0a0a;
  --background-200: #111111;
  
  --gray-100: #1a1a1a;
  --gray-200: #2a2a2a;
  --gray-400: #666666;
  --gray-500: #777777;
  --gray-700: #999999;
  --gray-900: #cccccc;
  --gray-1000: #fafafa;
  
  --gray-alpha-100: rgba(255, 255, 255, 0.04);
  --gray-alpha-200: rgba(255, 255, 255, 0.08);
  --gray-alpha-400: rgba(255, 255, 255, 0.16);
  --gray-alpha-600: rgba(255, 255, 255, 0.32);
  
  --contrast: #fafafa;
}
```

### Spacing & Sizing
```css
:root {
  /* Border radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-2xl: 16px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.2);
  
  /* Transitions */
  --transition-fast: 150ms;
  --transition-normal: 200ms;
  --transition-slow: 350ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## Tailwind CSS Class Mappings

For projects using Tailwind CSS, here are the equivalent utility classes:

### Button Classes
```
Default: bg-gray-1000 text-background-100 hover:bg-[#ccc]
Secondary: bg-background-100 border-gray-alpha-400 text-gray-1000 hover:bg-gray-alpha-200
Tertiary: bg-transparent border-transparent text-gray-1000 hover:bg-gray-alpha-200
```

### Size Classes
```
Tiny: h-6 px-0.5 rounded-[4px] text-xs
Small: h-8 px-1.5 rounded-md text-sm
Medium: h-10 px-2.5 rounded-md text-sm
Large: h-12 px-[14px] rounded-lg text-base
```

### Input Classes
```
Base: border border-gray-alpha-400 bg-background-100 focus-within:shadow-input-ring
Small: h-8 text-sm rounded-md
Medium: h-10 text-sm rounded-md
Large: h-12 text-base rounded-lg
```

### Badge Classes
```
Base: inline-flex items-center justify-center rounded-full capitalize whitespace-nowrap
Small: px-1.5 h-5 text-[11px] gap-0.5
Medium: px-2.5 h-6 text-xs gap-1
Large: px-3 h-8 text-sm gap-1.5
```

---

## Implementation Notes

### Animation Best Practices
1. Use `150ms` for micro-interactions (hover, focus)
2. Use `200-250ms` for content transitions
3. Use `350ms` for modal/dialog animations
4. Prefer `ease-out` for enter animations
5. Prefer `ease-in` for exit animations

### Accessibility Considerations
1. Always maintain focus ring visibility
2. Use sufficient color contrast (WCAG AA minimum)
3. Ensure disabled states are clearly distinguishable
4. Support keyboard navigation for all interactive elements

### Performance Tips
1. Use `transform` and `opacity` for animations (GPU-accelerated)
2. Avoid animating `width`, `height`, `margin`, `padding` directly
3. Use `will-change` sparingly for complex animations
4. Prefer CSS transitions over JavaScript animations when possible

---

*Sources: Vercel Geist Design System, vercel-ui-phi.vercel.app, vercel.com/geist*
*Content was rephrased for compliance with licensing restrictions*
