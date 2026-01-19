# Vercel Geist Design System Analysis

> Comprehensive documentation of the Vercel Geist Design System extracted from official sources.

---

## Table of Contents

1. [Overview](#overview)
2. [Typography](#typography)
3. [Colors](#colors)
4. [Icons](#icons)
5. [Grid System](#grid-system)
6. [Geist Font Family](#geist-font-family)
7. [Components](#components)
8. [Design Principles](#design-principles)

---

## Overview

Geist is Vercel's design system for building consistent web experiences. It embodies design principles of **simplicity**, **minimalism**, and **speed**, drawing inspiration from the Swiss design movement. The system includes:

- **Brand Assets** - Guidelines for working with Vercel brand assets
- **Icons** - Icon set tailored for developer tools
- **Components** - Building blocks for React applications
- **Colors** - A high contrast, accessible color system
- **Grid** - A core part of the Vercel aesthetic
- **Typeface** - Geist Sans and Geist Mono, specifically designed for developers and designers

---

## Typography

The Geist typography system is organized into four categories: **Headings**, **Buttons**, **Labels**, and **Copy**. Each has specific use cases and corresponding CSS class names.

### Headings

Used to introduce pages or sections.

| Example | Class Name | Size | Usage |
|---------|------------|------|-------|
| Heading 72 | `text-heading-72` | 72px | Marketing heroes |
| Heading 64 | `text-heading-64` | 64px | — |
| Heading 56 | `text-heading-56` | 56px | — |
| Heading 48 | `text-heading-48` | 48px | — |
| Heading 40 | `text-heading-40` | 40px | — |
| Heading 32 | `text-heading-32` | 32px | Marketing subheadings, paragraphs, dashboard headings (supports Subtle variant) |
| Heading 24 | `text-heading-24` | 24px | — (supports Subtle variant) |
| Heading 20 | `text-heading-20` | 20px | — (supports Subtle variant) |
| Heading 16 | `text-heading-16` | 16px | — (supports Subtle variant) |
| Heading 14 | `text-heading-14` | 14px | — |

### Buttons

Only to be used within components that render buttons.

| Example | Class Name | Size | Usage |
|---------|------------|------|-------|
| Button 16 | `text-button-16` | 16px | Largest button |
| Button 14 | `text-button-14` | 14px | Default button |
| Button 12 | `text-button-12` | 12px | Only used when a tiny button is placed inside an input field |

### Labels

Designed for single-lines with ample line-height for highlighting and pairing with icons.

| Example | Class Name | Size | Usage |
|---------|------------|------|-------|
| Label 20 | `text-label-20` | 20px | Marketing text |
| Label 18 | `text-label-18` | 18px | — |
| Label 16 | `text-label-16` | 16px | Used in titles to differentiate from regular text (supports Strong variant) |
| Label 14 | `text-label-14` | 14px | Most common text style. Used in many menus (supports Strong variant) |
| Label 14 Mono | `text-label-14-mono` | 14px | Largest form of mono, to pair with larger (>14) text |
| Label 13 | `text-label-13` | 13px | Secondary line next to other labels. Tabular for numbers (supports Strong, Tabular variants) |
| Label 13 Mono | `text-label-13-mono` | 13px | Used to pair with Label 14, smaller mono size looks better |
| Label 12 | `text-label-12` | 12px | Tertiary level text in busy views (supports Strong, CAPS variants) |
| Label 12 Mono | `text-label-12-mono` | 12px | — |

### Copy

Designed for multiple lines of text with higher line-height than Label.

| Example | Class Name | Size | Usage |
|---------|------------|------|-------|
| Copy 24 | `text-copy-24` | 24px | Hero areas on marketing pages (supports Strong variant) |
| Copy 20 | `text-copy-20` | 20px | Hero areas on marketing pages (supports Strong variant) |
| Copy 18 | `text-copy-18` | 18px | Mainly for marketing, big quotes (supports Strong variant) |
| Copy 16 | `text-copy-16` | 16px | Simpler, larger views like Modals where text can breathe (supports Strong variant) |
| Copy 14 | `text-copy-14` | 14px | Most commonly used text style (supports Strong variant) |
| Copy 13 | `text-copy-13` | 13px | Secondary text and views where space is a premium |
| Copy 13 Mono | `text-copy-13-mono` | 13px | Used for inline code mentions |

### Typography Variants

- **Strong** - Bold weight variant for emphasis
- **Subtle** - Lighter weight variant for de-emphasis
- **Tabular** - Fixed-width numbers for consistent spacing (e.g., `123`)
- **CAPS** - All capitals variant
- **Mono** - Monospace font variant for code

---

## Colors

The Geist color system is designed for high contrast and accessibility. Colors are organized by function.

### Backgrounds

| Token | Name | Usage |
|-------|------|-------|
| Background 1 | Default element background | Primary background for pages and UI components. Use when color is placed on top |
| Background 2 | Secondary background | Use sparingly when subtle background differentiation is needed |

### Component Backgrounds (Colors 1-3)

Designed for UI component backgrounds.

| Token | Name | Usage |
|-------|------|-------|
| Color 1 | Default background | Default component background |
| Color 2 | Hover background | Hover state background |
| Color 3 | Active background | Active/pressed state background |

**Usage Pattern:**
- If component default is Background 1 → use Color 1 for hover, Color 2 for active
- For smaller elements like badges → use Color 2 or Color 3 as background

### Borders (Colors 4-6)

Designed for UI component borders.

| Token | Name | Usage |
|-------|------|-------|
| Color 4 | Default border | Default border color |
| Color 5 | Hover border | Hover state border |
| Color 6 | Active border | Active/pressed state border |

### High Contrast Backgrounds (Colors 7-8)

Designed for high contrast UI component backgrounds.

| Token | Name | Usage |
|-------|------|-------|
| Color 7 | High contrast background | High contrast component background |
| Color 8 | Hover high contrast background | Hover state for high contrast components |

### Text and Icons (Colors 9-10)

Designed for accessible text and icons.

| Token | Name | Usage |
|-------|------|-------|
| Color 9 | Secondary text and icons | Secondary/muted text and icon color |
| Color 10 | Primary text and icons | Primary text and icon color |

### Color System Summary

```
Backgrounds:     Background 1, Background 2
Components:      Color 1 (default) → Color 2 (hover) → Color 3 (active)
Borders:         Color 4 (default) → Color 5 (hover) → Color 6 (active)
High Contrast:   Color 7 (default) → Color 8 (hover)
Text/Icons:      Color 9 (secondary) → Color 10 (primary)
```

---

## Icons

The Geist icon set is tailored for developer tools. Below is the complete icon inventory organized by category.

### Icon Categories

#### Accessibility
- `accessibility`, `accessibility-unread`

#### File Type Acronyms
- `acronym-api`, `acronym-csv`, `acronym-gif`, `acronym-http`, `acronym-isr`
- `acronym-jpg`, `acronym-js`, `acronym-json`, `acronym-markdown`, `acronym-page`
- `acronym-ppr`, `acronym-svg`, `acronym-ts`

#### AI & Agents
- `agent`, `agents`, `bot`, `brain`, `robot`, `vercel-agent`

#### Alignment
- `alignment-center`, `alignment-left`, `alignment-right`

#### Analytics & Charts
- `analytics`, `bar-chart`, `chart-activity`, `chart-bar-middle`, `chart-bar-peak`
- `chart-bar-random`, `chart-pie`, `chart-trending-down`, `chart-trending-up`, `line-chart`

#### Arrows
- `arrow-circle-down`, `arrow-circle-fill-down-right`, `arrow-circle-fill-up-right`
- `arrow-circle-left`, `arrow-circle-right`, `arrow-circle-up`, `arrow-crossed`
- `arrow-down`, `arrow-down-left`, `arrow-down-right`, `arrow-globe`
- `arrow-left`, `arrow-left-right`, `arrow-move`, `arrow-move-unread`
- `arrow-right`, `arrow-up`, `arrow-up-diagonal-scale`, `arrow-up-diagonal-scale-small`
- `arrow-up-down`, `arrow-up-left`, `arrow-up-right`, `arrow-up-right-small`

#### Chevrons
- `chevron-circle-down`, `chevron-circle-down-fill`, `chevron-circle-left`
- `chevron-circle-left-fill`, `chevron-circle-right`, `chevron-circle-right-fill`
- `chevron-circle-up`, `chevron-circle-up-down`, `chevron-circle-up-fill`
- `chevron-double-down`, `chevron-double-left`, `chevron-double-right`, `chevron-double-up`
- `chevron-down`, `chevron-down-small`, `chevron-left`, `chevron-left-small`
- `chevron-right`, `chevron-right-small`, `chevron-up`, `chevron-up-down`, `chevron-up-small`

#### Code & Development
- `code`, `code-block`, `code-bracket`, `code-wrap`, `terminal`, `terminal-window`
- `function`, `function-bun`, `function-bun-monochrome`, `function-edge`, `function-edge-color`
- `function-go`, `function-middleware`, `function-n`, `function-node`, `function-python`
- `function-rectangle`, `function-rectangle-fill`, `function-ruby`, `function-rust`, `function-square`

#### Git & Version Control
- `git-branch`, `git-branch-slash`, `git-commit`, `git-merge`, `git-pull-request`
- `branch-minus`, `branch-plus`

#### Communication
- `email`, `envelope`, `message`, `message-typing`, `paper-airplane`

#### Files & Folders
- `file`, `file-dependency`, `file-dependent`, `file-text`, `file-zip`
- `folder-closed`, `folder-dependency`, `folder-dependent`, `folder-minus`, `folder-open`, `folder-plus`

#### Media
- `camera`, `image`, `image-generation`, `video`, `webcam`, `webcam-off`
- `microphone`, `microphone-off`, `speaker`, `speaker-fill`, `speaker-off`
- `speaker-off-fill`, `speaker-volume-loud`, `speaker-volume-loud-fill`
- `speaker-volume-quiet`, `speaker-volume-quiet-fill`

#### Navigation
- `menu`, `menu-alt`, `menu-alt-unread`, `sidebar-left`, `sidebar-right`
- `home`, `globe`, `globe-box`, `globe-slash`

#### Status & Feedback
- `check`, `check-circle`, `check-circle-fill`, `check-square`, `check-square-fill`
- `cross`, `cross-circle`, `cross-circle-fill`, `cross-small`
- `warning`, `warning-fill`, `information`, `information-fill`, `information-fill-small`
- `question`, `question-fill`

#### User & Account
- `user`, `user-check`, `user-cross`, `user-link`, `user-minus`
- `user-passkey`, `user-passkey-fill`, `user-plus`, `user-screen`, `user-settings`, `users`

#### Security
- `key`, `key-old`, `lock-closed`, `lock-closed-small`, `lock-open`, `lock-open-small`
- `shield`, `shield-check`, `shield-check-fill`, `shield-globe`, `shield-off`, `shield-small`
- `firewall-check`, `firewall-flame`, `firewall-globe`, `secure-connection`

#### Cloud & Infrastructure
- `cloud`, `cloud-download`, `cloud-upload`, `database`, `server`, `serverless`, `servers`
- `cache`, `data-cache`, `edge`, `edge-cache`, `edge-config`

#### Brand Logos
- `logo-amex`, `logo-angular-color`, `logo-apple`, `logo-astro`, `logo-azure`
- `logo-azure-devops`, `logo-bitbucket-color`, `logo-bitbucket-monochrome`
- `logo-bluesky`, `logo-bun`, `logo-bun-monochrome`, `logo-checkly`
- `logo-cloudflare`, `logo-cloudflare-monochrome`, `logo-contentful`
- `logo-data-dog`, `logo-discord`, `logo-ember`, `logo-facebook`
- `logo-facebook-messenger`, `logo-figma`, `logo-gatsby`, `logo-geist`
- `logo-github`, `logo-github-small`, `logo-gitlab`, `logo-gitlab-monochrome`
- `logo-google`, `logo-google-cloud-platform`, `logo-growthbook`
- `logo-growthbook-monochrome`, `logo-hugo`, `logo-hypertune`
- `logo-launchdarkly`, `logo-linear`, `logo-linkedin-small`
- `logo-mastercard`, `logo-meta`, `logo-new-relic`, `logo-next`
- `logo-node`, `logo-nuxt`, `logo-open-ai`, `logo-openfeature`
- `logo-optimizely`, `logo-optimizely-monochrome`, `logo-posthog`
- `logo-posthog-monochrome`, `logo-python`, `logo-python-monochrome`
- `logo-react`, `logo-reddit`, `logo-reflag`, `logo-remix`
- `logo-rust`, `logo-sanity`, `logo-slack`, `logo-slack-color`
- `logo-solid`, `logo-splitbee`, `logo-statsig`, `logo-svelte`
- `logo-turbopack`, `logo-turborepo`, `logo-twitter`, `logo-twitter-x`
- `logo-twitter-x-small`, `logo-v0`, `logo-vercel`, `logo-vercel-api`
- `logo-vercel-circle`, `logo-vercel-fill`, `logo-visa`, `logo-vite`
- `logo-vue`, `logo-whats-app`, `logo-y-combinator`, `logo-youtube-small`

#### UI Controls
- `toggle-off`, `toggle-off-alt`, `toggle-off-alt-unread`, `toggle-on`, `toggle-on-alt`, `toggle-on-alt-unread`
- `plus`, `plus-circle`, `plus-square-small`, `minus`, `minus-circle`, `minus-square-small`

#### Time & Calendar
- `calendar`, `clock`, `clock-dashed`, `clock-rewind`, `clock-small`
- `stopwatch`, `stopwatch-fast`, `stopwatch-unread`

#### Text Formatting
- `text-bold`, `text-format`, `text-heading`, `text-italic`
- `text-strikethrough`, `text-title`, `text-uppercase`

### Icon Naming Convention

- **Base name**: Descriptive action or object (e.g., `arrow`, `check`, `user`)
- **Direction suffix**: `-up`, `-down`, `-left`, `-right`
- **State suffix**: `-fill`, `-off`, `-small`, `-unread`
- **Brand prefix**: `logo-` for brand icons
- **Function prefix**: `function-` for serverless function icons
- **Acronym prefix**: `acronym-` for file type indicators

---

## Grid System

The Geist grid system is a core part of the Vercel aesthetic, providing flexible layout options.

### Grid Types

#### Basic Grid
- Non-responsive grid with no cells
- Auto-flowing cells configuration

#### Solid Cells
- Using the `solid` prop on cells will occlude the guides that the cell overlaps

#### Responsive Grid
- Grid component with responsive `rows` and `columns` props
- Supports all 3 breakpoints

#### Guide Clipping
- Cells can clip guides for visual effect
- Can be applied to specific cells

### Grid Features

| Feature | Description |
|---------|-------------|
| Non-responsive | Basic grid without breakpoint changes |
| Responsive | Adapts rows/columns at breakpoints |
| Solid cells | Cells that occlude underlying guides |
| Guide clipping | Cells that clip grid guides |
| Hidden row guides | Grid with row guides hidden |
| Hidden column guides | Grid with column guides hidden |
| Overlaying cells | Cells that overlay other cells |

### Grid Props

- `rows` - Number of rows (responsive)
- `columns` - Number of columns (responsive)
- `solid` - Boolean to make cells solid
- Guide clipping options for specific cells

---

## Geist Font Family

Geist is a typeface specifically designed for developers and designers, consisting of two variants.

### Geist Sans

- Primary sans-serif typeface
- Designed for readability in UI contexts
- Supports full glyph set
- Includes `font-feature-settings` support

### Geist Mono

- Monospace variant
- Prioritizes readability in coding environments
- Seamlessly integrates into code editors
- Supports full glyph set

### Design Philosophy

Geist embodies:
- **Simplicity** - Clean, uncluttered design
- **Minimalism** - Essential elements only
- **Speed** - Optimized for quick reading
- **Swiss Design Influence** - Precision, clarity, and functionality

### Installation Methods

#### NPM (Recommended for Next.js)

```bash
npm i geist
```

```javascript
// app/layout.js
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
```

**Features:**
- Full glyph support
- `font-feature-settings` support
- Easy Next.js integration
- Automatic updates via npm
- Full customization

#### Google Fonts

```javascript
// app/layout.js
import { Geist, Geist_Mono } from 'next/font/google'
```

**Features:**
- Quick setup for web projects
- Easy Next.js integration
- Limited glyph set
- No `font-feature-settings` support

#### Manual Download (.zip)

- Download OTF, WOFF2, and variable font files
- Full glyph set
- `font-feature-settings` support
- Manual updates required

### Feature Comparison

| Feature | NPM | Google Fonts | .zip Download |
|---------|-----|--------------|---------------|
| font-feature-settings | ✅ Yes | ❌ No | ✅ Yes |
| Easy Next.js integration | ✅ Yes | ✅ Yes | ⚠️ Manual |
| Full glyph support | ✅ Full set | ⚠️ Partial | ✅ Full set |
| Automatic updates | ✅ Via npm | ✅ Via Google | ❌ Manual |
| Customization | ✅ Full | ⚠️ Limited | ✅ Full |

### License

Licensed under **OFL (Open Font License)**. Free to use on sites and projects.

---

## Components

Geist provides building blocks for React applications. The component library is designed to work seamlessly with the color system, typography, and grid.

### Button

| Feature | Description |
|---------|-------------|
| Sizes | Small, Medium (default), Large |
| Shapes | Default, Rounded, Icon-only (with `svgOnly` prop) |
| States | Default, Loading, Disabled |
| Variants | Primary, Secondary, with prefix/suffix icons |
| Special | `ButtonLink` for link-styled buttons, `shadow` prop for marketing |

### Input

| Feature | Description |
|---------|-------------|
| Variants | Default, Search (auto-clears on Escape), with Label |
| States | Default, Disabled, Error (with message) |
| Addons | Prefix and suffix support |
| Special | `⌘K` shortcut indicator, transitions to `Esc` when dirty |

### Select & Combobox

| Feature | Description |
|---------|-------------|
| Sizes | Small, Medium, Large |
| States | Default, Disabled, Error |
| Features | Prefix/suffix, custom width, custom empty message |
| Combobox | Controlled/uncontrolled, works inside Modal |

### Badge

| Variants | Colors |
|----------|--------|
| Solid | gray, blue, purple, amber, red, pink, green, teal, inverted |
| Subtle | gray-subtle, blue-subtle, purple-subtle, amber-subtle, red-subtle, pink-subtle, green-subtle, teal-subtle |
| Sizes | Small, Medium, Large |
| Features | With icons, Pill variant for links |

### Avatar

| Feature | Description |
|---------|-------------|
| Types | User, Team, Git, Custom icon, Placeholder |
| Group | Stacked avatars with overflow indicator (+N) |

### Modal

| Variants | Description |
|----------|-------------|
| Default | Standard modal dialog |
| Sticky | Sticky header/footer |
| Single button | Simplified action |
| Inset | Content inset styling |
| Features | Disabled actions, control initial focus |

### Menu (Dropdown)

| Feature | Description |
|---------|-------------|
| Trigger | Extends Button component, custom trigger support |
| Items | Default, Disabled, Link items |
| Features | Chevron indicator, prefix/suffix, auto-positioning |

### Tabs

| Feature | Description |
|---------|-------------|
| Variants | Default, Secondary |
| States | Default, Disabled (all or specific) |
| Features | With icons |

### Table

| Variants | Description |
|----------|-------------|
| Basic | Simple table layout |
| Striped | Alternating row colors |
| Bordered | With cell borders |
| Interactive | Hover states on rows |
| Full featured | With totals, formatting |
| Virtualized | For large datasets |

### Toast

| Types | Description |
|-------|-------------|
| Default | Standard notification |
| Success | Green success indicator |
| Warning | Amber warning indicator |
| Error | Red error indicator |
| Features | Multi-line, JSX content, links, actions, undo, preserve |

### Tooltip

| Positions | Top, Bottom, Left, Right |
|-----------|--------------------------|
| Alignment | Left, Center, Right for each position |
| Features | No delay option, custom content, custom type, no tip indicator |

### Progress

| Feature | Description |
|---------|-------------|
| Types | Default, Custom max, Dynamic colors, Themed |
| Features | With stops/markers |

### Spinner

| Feature | Description |
|---------|-------------|
| Usage | Loading feedback for user actions (buttons, pagination) |
| Sizes | Default, Custom sizes |

### Switch

| Feature | Description |
|---------|-------------|
| Sizes | Small, Medium, Large |
| States | Default, Disabled |
| Features | Full width, Tooltip, Icon |

### Collapse (Accordion)

| Feature | Description |
|---------|-------------|
| Variants | Default, Expanded, Multiple |
| Sizes | Default, Small |

### Component Design Principles

1. **Consistency** - All components follow the same design language
2. **Accessibility** - High contrast colors and proper ARIA support
3. **Composability** - Components can be combined flexibly
4. **Performance** - Optimized for fast rendering

---

## Design Principles

### Core Values

1. **Simplicity** - Remove unnecessary complexity
2. **Minimalism** - Focus on essential elements
3. **Speed** - Optimize for performance and quick comprehension
4. **Precision** - Exact measurements and consistent spacing
5. **Clarity** - Clear visual hierarchy and communication
6. **Functionality** - Every element serves a purpose

### Swiss Design Influence

The Geist design system draws inspiration from the Swiss design movement (International Typographic Style), characterized by:

- Clean, objective visual communication
- Grid-based layouts
- Sans-serif typography
- Asymmetric layouts with mathematical precision
- Use of white space

### Accessibility

- High contrast color system
- Accessible text colors (Colors 9-10)
- Clear visual hierarchy through typography scale
- Consistent interactive states

---

## CSS Class Reference

### Typography Classes

```css
/* Headings */
.text-heading-72
.text-heading-64
.text-heading-56
.text-heading-48
.text-heading-40
.text-heading-32
.text-heading-24
.text-heading-20
.text-heading-16
.text-heading-14

/* Buttons */
.text-button-16
.text-button-14
.text-button-12

/* Labels */
.text-label-20
.text-label-18
.text-label-16
.text-label-14
.text-label-14-mono
.text-label-13
.text-label-13-mono
.text-label-12
.text-label-12-mono

/* Copy */
.text-copy-24
.text-copy-20
.text-copy-18
.text-copy-16
.text-copy-14
.text-copy-13
.text-copy-13-mono
```

---

## Implementation Guide

### Setting Up Geist in Next.js

```javascript
// app/layout.js
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Using Typography Classes

```jsx
<h1 className="text-heading-48">Page Title</h1>
<p className="text-copy-14">Body text content</p>
<span className="text-label-13-mono">Code reference</span>
<button className="text-button-14">Click me</button>
```

### Color Token Usage Pattern

```jsx
// Background hierarchy
<div className="bg-background-1">
  <div className="bg-background-2">
    {/* Secondary content */}
  </div>
</div>

// Interactive component
<button className="bg-color-1 hover:bg-color-2 active:bg-color-3 border-color-4 hover:border-color-5">
  Button
</button>

// Text hierarchy
<h2 className="text-color-10">Primary heading</h2>
<p className="text-color-9">Secondary text</p>
```

---

## Resources

- **Official Documentation**: [vercel.com/geist](https://vercel.com/geist)
- **Font Package**: [npmjs.com/package/geist](https://npmjs.com/package/geist)
- **Google Fonts**: Available via `next/font/google`
- **License**: Open Font License (OFL)

---

## Complete Component List

Based on comprehensive analysis of the Geist design system documentation at vercel.com/geist, here is the complete component inventory:

### Form Components
| Component | Description | Reference |
|-----------|-------------|-----------|
| `Button` | Primary action trigger with sizes, shapes, loading states | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#button) |
| `ButtonLink` | Link styled as button | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#button) |
| `Input` | Text input with search, ⌘K, prefix/suffix support | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#input) |
| `Select` | Dropdown selection with sizes and error states | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#select) |
| `Combobox` | Searchable dropdown with autocomplete | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#combobox) |
| `Multi Select` | Multiple item selection with keyboard navigation | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#multi-select) |
| `Switch` | Segmented control for mutually exclusive options | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#switch) |
| `Checkbox` | Binary selection control with indeterminate state | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#checkbox) |
| `Radio` | Single selection from group | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#radio) |
| `Toggle` | On/off switch control | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#toggle) |
| `Choicebox` | Card-style selection for prominent choices | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#choicebox) |
| `Textarea` | Multi-line text input | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#textarea) |
| `Calendar` | Date picker with presets and layouts | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#calendar) |

### Feedback Components
| Component | Description | Reference |
|-----------|-------------|-----------|
| `Toast` | Temporary notifications with types | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#toast) |
| `Modal` | Dialog overlays with sticky/inset variants | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#modal) |
| `Drawer` | Mobile slide-in panel | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#drawer) |
| `Spinner` | Loading indicator for user actions | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#spinner) |
| `Loading Dots` | Background action indicator | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#loading-dots) |
| `Progress` | Progress bar with stops | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#progress) |
| `Skeleton` | Loading placeholder shapes | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#skeleton) |
| `Error` | Error message display | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#error) |
| `Note` | Informational messages and alerts | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#note) |
| `Project Banner` | Project-level status banners | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#project-banner) |
| `Empty State` | Empty content area design framework | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#empty-state) |

### Navigation Components
| Component | Description | Reference |
|-----------|-------------|-----------|
| `Menu` | Dropdown menu with typeahead | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#menu) |
| `Split Button` | Button with dropdown actions | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#split-button) |
| `Context Menu` | Right-click menu | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#context-menu) |
| `Scroller` | Overflowing list with navigation | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#scroller) |
| `Pagination` | Page navigation controls | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#pagination) |

### Data Display
| Component | Description | Reference |
|-----------|-------------|-----------|
| `Badge` | Status indicators with colors | Overview above |
| `Pill` | Link badge variant | Overview above |
| `Avatar` | User/team representation | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#avatar) |
| `Tooltip` | Contextual information | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#tooltip) |
| `Collapse` | Accordion sections | Overview above |
| `Code Block` | Syntax-highlighted code | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#code-block) |
| `Snippet` | Terminal command display | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#snippet) |
| `File Tree` | Hierarchical file display | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#file-tree) |
| `Gauge` | Circular progress indicator | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#gauge) |
| `Status Dot` | Deployment status indicator | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#status-dot) |
| `Capacity` | Resource utilization display | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#capacity) |
| `Entity` | User/device information display | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#entity) |
| `Description` | Heading with subheading | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#description) |
| `Relative Time Card` | Local time popover | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#relative-time-card) |
| `Keyboard Input` | Keyboard shortcut display | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#keyboard-input) |
| `Show More` | Expandable content toggle | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#show-more) |

### Layout Components
| Component | Description | Reference |
|-----------|-------------|-----------|
| `Grid` | Grid layout system | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#grid) |
| `Stack` | Vertical/horizontal stacking | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#stack) |
| `Materials` | Surface depth system | [Part 1](./GEIST-COMPONENTS-REFERENCE.md#materials) |

### Utility Components
| Component | Description | Reference |
|-----------|-------------|-----------|
| `Theme Switcher` | Light/dark theme toggle | [Part 3](./GEIST-COMPONENTS-REFERENCE-3.md#theme-switcher) |
| `Feedback` | User feedback collection | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#feedback) |
| `Window` | Desktop window container | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#window) |
| `Text` | Typography system | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#text) |
| `Link` | Interactive text links | [Part 2](./GEIST-COMPONENTS-REFERENCE-2.md#link) |

---

## Component Documentation References

For detailed documentation on each component including variants, sizes, states, props, and usage guidelines, see:

1. **[GEIST-COMPONENTS-REFERENCE.md](./GEIST-COMPONENTS-REFERENCE.md)** - Part 1
   - Checkbox, Radio, Toggle, Choicebox, Textarea
   - Skeleton, Note, Drawer, Pagination
   - Context Menu, Gauge, Multi-Select
   - Code Block, Materials

2. **[GEIST-COMPONENTS-REFERENCE-2.md](./GEIST-COMPONENTS-REFERENCE-2.md)** - Part 2
   - Error, Loading Dots, Status Dot, Capacity
   - Keyboard Input, Snippet, File Tree
   - Description, Entity, Project Banner
   - Feedback, Window, Show More, Text, Link

3. **[GEIST-COMPONENTS-REFERENCE-3.md](./GEIST-COMPONENTS-REFERENCE-3.md)** - Part 3
   - Button, Input, Select, Combobox
   - Modal, Menu, Split Button, Switch
   - Calendar, Toast, Avatar, Tooltip
   - Scroller, Theme Switcher, Relative Time Card
   - Empty State, Grid, Stack

---

## Component Implementation Files

For production-ready React/TypeScript implementations of all 52 components:

**[GEIST-COMPONENT-IMPLEMENTATIONS-COMPLETE.md](./GEIST-COMPONENT-IMPLEMENTATIONS-COMPLETE.md)** - Complete Implementation Guide
   - CSS Variables Setup
   - Tailwind Config Extensions
   - All 52 Component Implementations organized by category
   - Complete Component Summary Table
   - Required Dependencies
   - Usage Examples
   - Accessibility and Dark Mode Notes

---

*Document generated from Vercel Geist Design System official sources.*
*Last updated: January 2026 - Comprehensive analysis of vercel.com/geist*
