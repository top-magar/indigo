# Geist Design System Integration Guide

This document describes how the Vercel Geist Design System has been integrated into this project, extending the existing shadcn/ui components.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Your Application                      │
├─────────────────────────────────────────────────────────┤
│  Global Styles (Geist-based)                            │
│  └── src/app/globals.css                                │
├─────────────────────────────────────────────────────────┤
│  Geist Design Tokens (CSS Variables)                    │
│  └── src/styles/_geist-tokens.scss                      │
├─────────────────────────────────────────────────────────┤
│  Extended shadcn/ui Components                          │
│  ├── Button (+ geist-* variants)                        │
│  ├── Badge (+ geist-* color variants)                   │
│  └── ... other components                               │
├─────────────────────────────────────────────────────────┤
│  Geist-Only Components                                  │
│  └── src/components/ui/geist/                           │
├─────────────────────────────────────────────────────────┤
│  Radix UI Primitives (shared foundation)               │
└─────────────────────────────────────────────────────────┘
```

## Key Files

- `src/app/globals.css` - Main stylesheet with Geist typography, spacing, materials, and animations
- `src/styles/_geist-tokens.scss` - Geist color scales, shadows, and transitions (9 color scales × 10 steps each)

## File Structure

```
src/
├── styles/
│   └── _geist-tokens.scss      # Geist CSS variables (colors, shadows, transitions)
├── components/ui/
│   ├── button.tsx              # Extended with geist-* variants
│   ├── badge.tsx               # Extended with geist-* color variants
│   ├── input.tsx               # Extended with geist-* variants
│   ├── textarea.tsx            # Extended with geist-* variants
│   ├── avatar.tsx              # Extended with geist-* variants
│   ├── select.tsx              # Extended with geist-* variants
│   ├── tooltip.tsx             # Extended with geist variant
│   └── geist/                  # Geist-only components (38 components)
│       ├── index.ts            # Barrel export
│       │
│       │ # Progress & Status
│       ├── gauge.tsx           # Circular progress indicator
│       ├── capacity.tsx        # Segmented progress bar
│       ├── status-dot.tsx      # Status indicator dot
│       ├── loading-dots.tsx    # Animated loading dots
│       ├── spinner.tsx         # Loading spinner
│       ├── progress.tsx        # Progress bar with dynamic colors
│       │
│       │ # Display
│       ├── snippet.tsx         # Terminal command display
│       ├── keyboard-input.tsx  # Keyboard shortcut display
│       ├── file-tree.tsx       # Hierarchical file display
│       ├── window.tsx          # Desktop window frame
│       ├── browser.tsx         # Browser frame mockup
│       ├── book.tsx            # Content card display
│       ├── entity.tsx          # User/item display with avatar
│       ├── material.tsx        # Surface with shadows
│       │
│       │ # Content
│       ├── show-more.tsx       # Expandable content toggle
│       ├── feedback.tsx        # Thumbs up/down feedback
│       ├── project-banner.tsx  # Project-level status banner
│       ├── error-message.tsx   # Error message display
│       ├── description.tsx     # Title + content pair
│       ├── note.tsx            # Informational messages
│       ├── empty-state.tsx     # Empty content guidance
│       ├── context-card.tsx    # Contextual selection card
│       ├── collapse.tsx        # Expandable/collapsible sections
│       │
│       │ # Typography & Links
│       ├── text.tsx            # Typography component (22 variants)
│       ├── geist-link.tsx      # Styled link component
│       │
│       │ # Layout
│       ├── stack.tsx           # Flexbox stack layout
│       ├── grid.tsx            # Grid layout with GridItem
│       ├── scroller.tsx        # Horizontal/vertical scroll
│       │
│       │ # Form Controls
│       ├── toggle.tsx          # Boolean on/off switch
│       ├── switch.tsx          # Mutually exclusive option selector
│       ├── slider.tsx          # Range value selection
│       ├── choicebox.tsx       # Card-style selection
│       │
│       │ # Buttons
│       ├── split-button.tsx    # Button with dropdown menu
│       │
│       │ # Feedback
│       ├── toast.tsx           # Temporary notification messages
│       │
│       │ # Theme
│       ├── theme-switcher.tsx  # Light/dark/system toggle
│       └── relative-time-card.tsx # Time with popover
```

## Usage

### Extended shadcn/ui Components

#### Button with Geist Variants

```tsx
import { Button } from "@/components/ui/button";

// shadcn/ui variants (unchanged)
<Button variant="default">Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Destructive</Button>

// NEW: Geist variants
<Button variant="geist-primary">Geist Primary</Button>
<Button variant="geist-secondary">Geist Secondary</Button>
<Button variant="geist-tertiary">Geist Tertiary</Button>
<Button variant="geist-error">Geist Error</Button>
<Button variant="geist-warning">Geist Warning</Button>
<Button variant="geist-success">Geist Success</Button>
```

#### Badge with Geist Color Variants

```tsx
import { Badge } from "@/components/ui/badge";

// shadcn/ui variants (unchanged)
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>

// NEW: Geist solid variants
<Badge variant="geist-gray">Gray</Badge>
<Badge variant="geist-blue">Blue</Badge>
<Badge variant="geist-purple">Purple</Badge>
<Badge variant="geist-amber">Amber</Badge>
<Badge variant="geist-red">Red</Badge>
<Badge variant="geist-pink">Pink</Badge>
<Badge variant="geist-green">Green</Badge>
<Badge variant="geist-teal">Teal</Badge>

// NEW: Geist subtle variants
<Badge variant="geist-gray-subtle">Gray Subtle</Badge>
<Badge variant="geist-blue-subtle">Blue Subtle</Badge>
<Badge variant="geist-purple-subtle">Purple Subtle</Badge>
// ... etc
```

### Geist-Only Components

```tsx
import {
  // Progress & Status
  Gauge,
  Capacity,
  StatusDot,
  LoadingDots,
  Spinner,
  Progress,
  
  // Display
  Snippet,
  KeyboardInput,
  FileTree,
  Window,
  Browser,
  Book,
  Entity,
  Material,
  
  // Content
  ShowMore,
  Feedback,
  ProjectBanner,
  ErrorMessage,
  Description,
  Note,
  EmptyState,
  ContextCard,
  Collapse,
  CollapseGroup,
  
  // Typography & Links
  Text,
  GeistLink,
  
  // Layout
  Stack,
  Grid,
  GridItem,
  Scroller,
  
  // Form Controls
  Toggle,
  Switch,
  SwitchControl,
  Slider,
  Choicebox,
  ChoiceboxGroup,
  
  // Buttons
  SplitButton,
  
  // Feedback
  ToastProvider,
  useToast,
  
  // Theme
  ThemeSwitcher,
  RelativeTimeCard,
} from "@/components/ui/geist";
```

#### Gauge - Circular Progress

```tsx
<Gauge value={75} size="md" color="blue" showValue />
```

#### Capacity - Segmented Progress

```tsx
<Capacity value={80} limit={100} size="md" />
```

#### StatusDot - Status Indicator

```tsx
<StatusDot status="success" size="md" />
<StatusDot status="building" pulse />
```

#### Snippet - Terminal Command

```tsx
<Snippet text="npm install @vercel/geist" prompt="$" />
<Snippet text={["npm install", "npm run dev"]} dark />
```

#### KeyboardInput - Keyboard Shortcuts

```tsx
<KeyboardInput keys={["cmd", "K"]} />
<KeyboardInput keys={["Ctrl", "Shift", "P"]} size="sm" />
```

#### FileTree - File Explorer

```tsx
<FileTree
  data={[
    {
      name: "src",
      type: "folder",
      children: [
        { name: "index.ts", type: "file" },
        { name: "utils.ts", type: "file" },
      ],
    },
  ]}
  defaultExpanded
/>
```

#### Window - Desktop Window Frame

```tsx
<Window title="Terminal" dark>
  <div className="p-4">Content here</div>
</Window>
```

#### Entity - User/Item Display

```tsx
<Entity
  name="John Doe"
  description="Software Engineer"
  avatar="https://example.com/avatar.jpg"
  size="md"
/>
```

#### ShowMore - Expandable Content

```tsx
<ShowMore maxHeight={200}>
  <p>Long content that will be truncated...</p>
</ShowMore>
```

#### Feedback - Thumbs Up/Down

```tsx
<Feedback
  onFeedback={(positive) => console.log(positive)}
  prompt="Was this helpful?"
/>
```

#### ProjectBanner - Status Banner

```tsx
<ProjectBanner
  variant="warning"
  title="Deployment in progress"
  description="Your changes are being deployed."
  onDismiss={() => {}}
/>
```

#### LoadingDots - Animated Loading

```tsx
<LoadingDots size="md" label="Loading" />
<LoadingDots size="sm" />
<LoadingDots size="lg" />
```

#### ErrorMessage - Error Display

```tsx
<ErrorMessage message="Something went wrong" size="md" />
<ErrorMessage 
  message="Invalid input" 
  label="Error" 
  action={{ label: "Retry", onClick: () => {} }}
/>
```

#### Description - Title + Content

```tsx
<Description title="Project Name" size="md">
  A brief description of the project.
</Description>
```

#### Text - Typography Component

```tsx
// Heading variants
<Text variant="heading-72">Large Heading</Text>
<Text variant="heading-32">Medium Heading</Text>
<Text variant="heading-16">Small Heading</Text>

// Label variants
<Text variant="label-14">Label Text</Text>
<Text variant="label-12" color="muted">Muted Label</Text>

// Copy variants
<Text variant="copy-16">Body text</Text>
<Text variant="copy-14" color="subtle">Subtle text</Text>

// With options
<Text variant="copy-14" mono>Monospace text</Text>
<Text variant="copy-14" truncate>Truncated long text...</Text>
```

#### GeistLink - Styled Links

```tsx
<GeistLink href="/about">Internal Link</GeistLink>
<GeistLink href="https://vercel.com" external>External Link</GeistLink>
<GeistLink href="/docs" variant="subtle">Subtle Link</GeistLink>
```

#### Stack - Flexbox Layout

```tsx
<Stack direction="horizontal" gap={4} align="center">
  <Avatar name="John" />
  <Text>John Doe</Text>
</Stack>

<Stack direction="vertical" gap={2}>
  <Text variant="label-14">Title</Text>
  <Text variant="copy-14" color="muted">Description</Text>
</Stack>
```

#### Grid - Grid Layout

```tsx
<Grid columns={3} gap={4}>
  <GridItem>Item 1</GridItem>
  <GridItem colSpan={2}>Item 2 (spans 2 columns)</GridItem>
  <GridItem>Item 3</GridItem>
</Grid>

// Responsive grid
<Grid columns={{ sm: 1, md: 2, lg: 3 }} gap={4}>
  {items.map(item => <GridItem key={item.id}>{item.name}</GridItem>)}
</Grid>
```

#### ThemeSwitcher - Theme Toggle

```tsx
<ThemeSwitcher />
<ThemeSwitcher variant="dropdown" />
```

#### RelativeTimeCard - Time Display

```tsx
<RelativeTimeCard date={new Date()} />
<RelativeTimeCard date="2024-01-15T10:30:00Z" />
```

#### Toggle - Boolean Switch

```tsx
// Basic toggle
<Toggle label="Enable notifications" />

// Controlled with types
<Toggle 
  checked={enabled} 
  onChange={(e) => setEnabled(e.target.checked)}
  type="success"
  size="medium"
/>

// With custom color
<Toggle label="Dark mode" color="#7928ca" />
```

#### Switch - Mode Selection

```tsx
// Select between options (different from Toggle)
<Switch defaultValue="source">
  <SwitchControl value="source" label="Source" />
  <SwitchControl value="output" label="Output" />
</Switch>

// With icons
<Switch value={view} onChange={setView} size="small">
  <SwitchControl value="list" icon={<ListIcon />} label="List" />
  <SwitchControl value="grid" icon={<GridIcon />} label="Grid" />
</Switch>
```

#### Slider - Range Selection

```tsx
// Single value
<Slider value={50} onChange={setValue} />

// Range selection (dual thumbs)
<Slider 
  value={[20, 80]} 
  onChange={setRange}
  min={0}
  max={100}
  step={5}
/>

// With marks and value tooltip
<Slider 
  showValue
  marks={[
    { value: 0, label: "0%" },
    { value: 50, label: "50%" },
    { value: 100, label: "100%" },
  ]}
/>
```

#### SplitButton - Button with Dropdown

```tsx
<SplitButton
  primaryAction={{
    label: "Save",
    onClick: () => handleSave(),
    icon: <SaveIcon />,
  }}
  menuItems={[
    { label: "Save as draft", onClick: () => saveDraft() },
    { label: "Save and publish", onClick: () => saveAndPublish() },
    { label: "Delete", onClick: () => handleDelete(), destructive: true },
  ]}
  size="medium"
/>
```

#### Toast - Notifications

```tsx
// Wrap your app with ToastProvider
<ToastProvider defaultPlacement="bottomRight" defaultDelay={3000}>
  <App />
</ToastProvider>

// Use in components
function MyComponent() {
  const { toast, dismiss, dismissAll } = useToast();

  const handleSave = () => {
    toast({ text: "Changes saved", type: "success" });
  };

  const handleError = () => {
    toast({ 
      text: "Failed to save", 
      type: "error",
      delay: 0, // persistent
      actions: [{ name: "Retry", handler: () => retry() }]
    });
  };

  return <Button onClick={handleSave}>Save</Button>;
}
```

#### Note - Informational Messages

```tsx
<Note type="info">This is an informational note.</Note>
<Note type="warning">Warning: This action cannot be undone.</Note>
<Note type="error">Error: Something went wrong.</Note>
<Note type="success">Success! Your changes have been saved.</Note>
<Note type="secondary" label="Tip">You can also use keyboard shortcuts.</Note>
```

#### EmptyState - Empty Content

```tsx
<EmptyState
  variant="default"
  title="No products found"
  description="Try adjusting your search or filters."
  actions={[
    { label: "Clear filters", onClick: () => clearFilters() },
    { label: "Add product", onClick: () => addProduct(), primary: true },
  ]}
/>
```

#### Collapse - Expandable Sections

```tsx
// Single collapse
<Collapse title="Advanced Settings" defaultExpanded={false}>
  <p>Advanced configuration options...</p>
</Collapse>

// Collapse group (accordion)
<CollapseGroup>
  <Collapse title="Section 1">Content 1</Collapse>
  <Collapse title="Section 2">Content 2</Collapse>
  <Collapse title="Section 3">Content 3</Collapse>
</CollapseGroup>
```

#### Browser - Browser Frame

```tsx
<Browser url="https://example.com" dark>
  <img src="/screenshot.png" alt="Website preview" />
</Browser>
```

#### Book - Content Card

```tsx
<Book
  title="Getting Started"
  description="Learn the basics of our platform"
  href="/docs/getting-started"
  icon={<BookIcon />}
/>
```

#### Material - Surface Component

```tsx
<Material elevation="small">Light shadow</Material>
<Material elevation="medium">Medium shadow</Material>
<Material elevation="large">Large shadow</Material>
```

#### Scroller - Scrollable Content

```tsx
<Scroller direction="horizontal" showButtons>
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</Scroller>
```

#### Choicebox - Card Selection

```tsx
<ChoiceboxGroup value={selected} onChange={setSelected}>
  <Choicebox value="option1" title="Option 1" description="First option" />
  <Choicebox value="option2" title="Option 2" description="Second option" />
  <Choicebox value="option3" title="Option 3" description="Third option" />
</ChoiceboxGroup>
```

#### Spinner - Loading Indicator

```tsx
<Spinner size="small" />
<Spinner size="default" label="Loading..." />
<Spinner size="large" inverted /> {/* For dark backgrounds */}
```

#### Progress - Progress Bar

```tsx
<Progress value={75} />
<Progress value={50} max={200} showValue />
<Progress 
  value={90} 
  dynamicColor // Changes color based on value
  stops={[25, 50, 75]} // Milestone markers
/>
```

## CSS Variables

All Geist design tokens are available as CSS variables:

### Colors

```css
/* Gray Scale (10 steps) */
var(--ds-gray-100) through var(--ds-gray-1000)

/* Color Scales */
var(--ds-blue-100) through var(--ds-blue-1000)
var(--ds-red-100) through var(--ds-red-1000)
var(--ds-amber-100) through var(--ds-amber-1000)
var(--ds-green-100) through var(--ds-green-1000)
var(--ds-purple-100) through var(--ds-purple-1000)
var(--ds-pink-100) through var(--ds-pink-1000)
var(--ds-teal-100) through var(--ds-teal-1000)

/* Backgrounds */
var(--ds-background-100)
var(--ds-background-200)
```

### Shadows

```css
var(--shadow-geist-small)
var(--shadow-geist-medium)
var(--shadow-geist-large)
var(--shadow-geist-tooltip)
var(--shadow-geist-menu)
var(--shadow-geist-modal)
```

### Transitions

```css
var(--transition-fast)    /* 100ms ease */
var(--transition-default) /* 150ms ease */
var(--transition-slow)    /* 200ms ease */
```

### Focus Ring

```css
var(--focus-ring-geist)
```

## Dark Mode

All components and CSS variables automatically support dark mode. The dark mode values are defined in the `.dark` selector in `_geist-tokens.scss`.

## Related Documentation

- [GEIST-COMPONENT-IMPLEMENTATIONS-COMPLETE.md](./GEIST-COMPONENT-IMPLEMENTATIONS-COMPLETE.md) - Full component implementation reference
- [VERCEL-GEIST-DESIGN-SYSTEM.md](./VERCEL-GEIST-DESIGN-SYSTEM.md) - Geist design system overview
- [GEIST-CSS-PATTERNS.md](./GEIST-CSS-PATTERNS.md) - CSS patterns and tokens

## Border Radius (Geist Scale)

The project uses the standard Geist border radius scale:

| Token | Value | Tailwind Class | Use Case |
|-------|-------|----------------|----------|
| `sm` | 4px | `rounded-sm` | Small badges, chips |
| `md` | 6px | `rounded-md` | Nested items, hover states |
| `lg` | 8px | `rounded-lg` | Buttons, inputs, tooltips |
| `xl` | 12px | `rounded-xl` | Cards, panels, dropdowns |
| `2xl` | 16px | `rounded-2xl` | Modals, large cards |
| `full` | 9999px | `rounded-full` | Pill shapes, avatars |

### Button Radius Variants

```tsx
<Button radius="default">8px (rounded-lg)</Button>
<Button radius="sm">4px (rounded-sm)</Button>
<Button radius="md">12px (rounded-xl)</Button>
<Button radius="lg">16px (rounded-2xl)</Button>
<Button radius="full">Pill shape</Button>
<Button radius="none">No radius</Button>
```
