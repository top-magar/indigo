# Storefront Block System Specification

## Overview

A constrained, modular block system that allows merchants to customize their storefront by selecting pre-designed block variants. Unlike free-form page builders, this system offers curated design options that ensure professional results without requiring design skills.

**Design Philosophy:**
- Selection over creation — merchants pick from variants, not design from scratch
- Smart defaults — every variant looks good out-of-the-box
- Data-driven — blocks pull from store data (products, reviews, etc.)
- Mobile-first — all variants are responsive by default
- Brand-aware — variants adapt to store's color scheme and typography

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Page Structure                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Header Block (fixed position)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Content Blocks (stackable, reorderable)            │   │
│  │  • Hero                                              │   │
│  │  • Featured Products                                 │   │
│  │  • Product Grid                                      │   │
│  │  • Promotional Banner                                │   │
│  │  • Testimonials                                      │   │
│  │  • Trust Signals                                     │   │
│  │  • Newsletter                                        │   │
│  │  • Custom Content                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Footer Block (fixed position)                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Block Specifications

---

## 1. Header / Navigation Block

**Purpose:** Primary navigation and brand identity. Always visible, builds trust and enables wayfinding.

**When to Use:** Required on all pages. First impression of the store.

### Core Elements (all variants)
- Store logo (image or text)
- Primary navigation links
- Search functionality
- Cart icon with item count
- Mobile hamburger menu
- Optional: Account link, currency selector

### Variants

#### 1.1 Classic Header
- **Layout:** Logo left, navigation center, cart/search right
- **Primary Goal:** Familiarity, ease of use
- **Best For:** General stores, wide product catalogs
- **Mobile:** Logo + hamburger + cart

#### 1.2 Centered Logo
- **Layout:** Navigation left, centered logo, cart/search right
- **Primary Goal:** Brand emphasis, premium feel
- **Best For:** Fashion, lifestyle, luxury brands
- **Mobile:** Centered logo, hamburger left, cart right

#### 1.3 Minimal Header
- **Layout:** Logo left, minimal nav (hamburger always), cart right
- **Primary Goal:** Maximum content focus, clean aesthetic
- **Best For:** Single-product stores, landing pages
- **Mobile:** Same as desktop (already minimal)

#### 1.4 Mega Menu Header
- **Layout:** Logo left, navigation with dropdown mega menus, cart right
- **Primary Goal:** Large catalog navigation, category discovery
- **Best For:** Stores with 50+ products, multiple categories
- **Mobile:** Accordion-style category navigation

#### 1.5 Announcement Bar Header
- **Layout:** Top announcement bar + Classic header below
- **Primary Goal:** Promotions, shipping info, urgency
- **Best For:** Sales events, free shipping thresholds
- **Mobile:** Scrolling announcement text

### Configurable Settings
| Setting | Type | Options |
|---------|------|---------|
| Logo | Image/Text | Upload or store name |
| Navigation Links | List | Up to 6 primary links |
| Show Search | Toggle | Yes/No |
| Show Account | Toggle | Yes/No |
| Sticky Header | Toggle | Yes/No |
| Announcement Text | Text | Free text (for variant 1.5) |
| Announcement Link | URL | Optional CTA |
| Background | Color | Solid or transparent |

---

## 2. Hero Section Block

**Purpose:** First content block visitors see. Sets tone, communicates value proposition, drives primary action.

**When to Use:** Homepage (required), landing pages, campaign pages.

### Core Elements (all variants)
- Headline (H1)
- Subheadline/description
- Primary CTA button
- Optional: Secondary CTA
- Background (image, video, or color)

### Variants

#### 2.1 Full-Width Image Hero
- **Layout:** Full-viewport background image, centered text overlay
- **Primary Goal:** Visual impact, emotional connection
- **Best For:** Lifestyle brands, fashion, travel products
- **Mobile:** 70vh height, larger text for readability

#### 2.2 Split Hero (Image + Content)
- **Layout:** 50/50 split — image left, content right (reversible)
- **Primary Goal:** Balance of visual and messaging
- **Best For:** Product launches, feature highlights
- **Mobile:** Stacked — image top, content bottom

#### 2.3 Video Background Hero
- **Layout:** Looping video background, centered text overlay
- **Primary Goal:** Dynamic engagement, brand storytelling
- **Best For:** Premium brands, experiential products
- **Mobile:** Falls back to poster image (performance)

#### 2.4 Minimal Text Hero
- **Layout:** Large typography on solid/gradient background, no image
- **Primary Goal:** Message clarity, fast loading
- **Best For:** Service-based, B2B, minimalist brands
- **Mobile:** Same layout, responsive typography

#### 2.5 Product Showcase Hero
- **Layout:** Hero with featured product image, floating product card
- **Primary Goal:** Immediate product focus, conversion
- **Best For:** Single-product stores, new arrivals, bestsellers
- **Mobile:** Product card below hero content

### Configurable Settings
| Setting | Type | Options |
|---------|------|---------|
| Headline | Text | Max 60 characters |
| Subheadline | Text | Max 150 characters |
| Primary CTA Text | Text | e.g., "Shop Now" |
| Primary CTA Link | URL | Product, collection, or page |
| Secondary CTA | Text + URL | Optional |
| Background Image | Image | Recommended 1920x1080 |
| Background Video | URL | MP4, max 15 seconds |
| Overlay Opacity | Slider | 0-80% dark overlay |
| Text Alignment | Select | Left, Center, Right |
| Height | Select | Full viewport, 80vh, 60vh |
| Featured Product | Product Picker | For variant 2.5 |

---

## 3. Featured Product Block

**Purpose:** Highlight a single product with rich detail. Drive conversion for hero products.

**When to Use:** Homepage, product launches, bestseller promotion.

### Core Elements (all variants)
- Product image(s)
- Product title
- Price (with sale price if applicable)
- Short description
- Add to Cart button
- Optional: Variant selector, reviews snippet

### Variants

#### 3.1 Large Image Focus
- **Layout:** 60% image, 40% content side-by-side
- **Primary Goal:** Visual product appeal
- **Best For:** Visually-driven products (fashion, art, decor)
- **Mobile:** Full-width image, content below

#### 3.2 Gallery Showcase
- **Layout:** Main image + thumbnail gallery, content right
- **Primary Goal:** Show product from multiple angles
- **Best For:** Products needing detail views (electronics, jewelry)
- **Mobile:** Swipeable gallery, content below

#### 3.3 Lifestyle Context
- **Layout:** Product in lifestyle setting, floating product card overlay
- **Primary Goal:** Aspirational, show product in use
- **Best For:** Home goods, outdoor gear, fashion
- **Mobile:** Lifestyle image top, product card below

#### 3.4 Comparison Highlight
- **Layout:** Featured product center, "why choose this" benefits around it
- **Primary Goal:** Differentiation, value communication
- **Best For:** Competitive markets, premium products
- **Mobile:** Product top, benefits list below

#### 3.5 Limited Edition / Urgency
- **Layout:** Product with countdown timer, stock indicator, badges
- **Primary Goal:** Urgency, scarcity, conversion
- **Best For:** Drops, limited stock, flash sales
- **Mobile:** Compact timer, prominent CTA

### Configurable Settings
| Setting | Type | Options |
|---------|------|---------|
| Product | Product Picker | Select from catalog |
| Show Price | Toggle | Yes/No |
| Show Reviews | Toggle | Yes/No (if reviews exist) |
| Custom Headline | Text | Override product title |
| Custom Description | Text | Override product description |
| Badge Text | Text | e.g., "Bestseller", "New" |
| Show Countdown | Toggle | For variant 3.5 |
| Countdown End | DateTime | For variant 3.5 |
| Background | Color | Section background |

---

## 4. Product Grid / Collection Block

**Purpose:** Display multiple products for browsing. Primary shopping interface.

**When to Use:** Homepage, collection pages, search results.

### Core Elements (all variants)
- Product cards (image, title, price)
- Grid layout
- Optional: Quick view, add to cart, filters
- "View All" link to full collection

### Variants

#### 4.1 Standard Grid
- **Layout:** 4-column grid (desktop), 2-column (mobile)
- **Primary Goal:** Maximum products visible, efficient browsing
- **Best For:** Large catalogs, general browsing
- **Mobile:** 2 columns, infinite scroll option

#### 4.2 Featured + Grid
- **Layout:** 1 large featured product + 4 smaller grid items
- **Primary Goal:** Highlight hero product within collection
- **Best For:** New arrivals, curated collections
- **Mobile:** Featured full-width, then 2-column grid

#### 4.3 Carousel / Slider
- **Layout:** Horizontal scrolling product carousel
- **Primary Goal:** Space efficiency, discovery
- **Best For:** Related products, "You may also like"
- **Mobile:** Swipeable cards, peek next item

#### 4.4 List View
- **Layout:** Horizontal product cards with more detail
- **Primary Goal:** Information density, comparison
- **Best For:** Technical products, B2B, specs-heavy items
- **Mobile:** Compact cards, expandable details

#### 4.5 Masonry Grid
- **Layout:** Pinterest-style varied height grid
- **Primary Goal:** Visual interest, lifestyle feel
- **Best For:** Fashion, art, varied product imagery
- **Mobile:** 2-column masonry

### Configurable Settings
| Setting | Type | Options |
|---------|------|---------|
| Collection | Collection Picker | Select collection |
| Products to Show | Number | 4, 8, 12, 16 |
| Columns (Desktop) | Select | 3, 4, 5 |
| Show Prices | Toggle | Yes/No |
| Show Quick Add | Toggle | Yes/No |
| Show Reviews | Toggle | Yes/No |
| Section Title | Text | e.g., "New Arrivals" |
| View All Link | Toggle | Yes/No |
| Sort Order | Select | Newest, Price, Bestselling |

---

## 5. Promotional / Offer Banner Block

**Purpose:** Communicate offers, sales, or important messages. Drive urgency and action.

**When to Use:** During sales, promotions, announcements. Can appear multiple times on page.

### Core Elements (all variants)
- Headline/offer text
- Optional: Subtext, terms
- CTA button
- Optional: Countdown timer, discount code

### Variants

#### 5.1 Full-Width Banner
- **Layout:** Edge-to-edge colored banner with centered text
- **Primary Goal:** Maximum visibility, can't miss it
- **Best For:** Site-wide sales, major announcements
- **Mobile:** Same, text may wrap

#### 5.2 Split Image Banner
- **Layout:** 50/50 image and offer content
- **Primary Goal:** Visual appeal + clear offer
- **Best For:** Seasonal campaigns, lifestyle promotions
- **Mobile:** Stacked, image top

#### 5.3 Countdown Banner
- **Layout:** Offer text with prominent countdown timer
- **Primary Goal:** Urgency, time-limited offers
- **Best For:** Flash sales, launch countdowns, end-of-sale
- **Mobile:** Compact timer format

#### 5.4 Discount Code Banner
- **Layout:** Offer with copy-to-clipboard discount code
- **Primary Goal:** Code distribution, trackable promotions
- **Best For:** Email signup rewards, influencer codes
- **Mobile:** Tap to copy interaction

#### 5.5 Multi-Offer Banner
- **Layout:** 2-3 offers side by side in cards
- **Primary Goal:** Multiple promotions, category-specific deals
- **Best For:** Different deals for different categories
- **Mobile:** Horizontal scroll or stacked

### Configurable Settings
| Setting | Type | Options |
|---------|------|---------|
| Headline | Text | e.g., "Summer Sale" |
| Subtext | Text | e.g., "Up to 50% off" |
| CTA Text | Text | e.g., "Shop Sale" |
| CTA Link | URL | Destination page |
| Background Color | Color | Brand colors |
| Background Image | Image | Optional |
| Discount Code | Text | For variant 5.4 |
| Countdown End | DateTime | For variant 5.3 |
| Offers | List | For variant 5.5 (up to 3) |

---

## 6. Testimonials / Reviews Block

**Purpose:** Social proof. Build trust through customer voices.

**When to Use:** Homepage, product pages, landing pages. Critical for conversion.

### Core Elements (all variants)
- Customer quote/review
- Customer name
- Optional: Photo, rating, product purchased, date

### Variants

#### 6.1 Carousel Testimonials
- **Layout:** Single testimonial with navigation arrows/dots
- **Primary Goal:** Focus on one story at a time
- **Best For:** Detailed testimonials, story-driven
- **Mobile:** Swipeable cards

#### 6.2 Grid Testimonials
- **Layout:** 3-column grid of testimonial cards
- **Primary Goal:** Volume of social proof
- **Best For:** Showing breadth of happy customers
- **Mobile:** Single column, show 3-4

#### 6.3 Featured Review
- **Layout:** Large single review with customer photo, prominent rating
- **Primary Goal:** Highlight best review, personal connection
- **Best For:** Hero social proof, above the fold
- **Mobile:** Full-width card

#### 6.4 Video Testimonials
- **Layout:** Video thumbnails that play customer testimonials
- **Primary Goal:** Authenticity, emotional connection
- **Best For:** High-consideration purchases, services
- **Mobile:** Full-width video player

#### 6.5 Review Aggregate
- **Layout:** Overall rating + review count + sample reviews
- **Primary Goal:** Quick trust signal, data-driven proof
- **Best For:** Products with many reviews, comparison shoppers
- **Mobile:** Compact aggregate, expandable reviews

### Configurable Settings
| Setting | Type | Options |
|---------|------|---------|
| Data Source | Select | Manual, Product Reviews, All Reviews |
| Reviews to Show | Number | 1, 3, 6, 9 |
| Show Ratings | Toggle | Yes/No |
| Show Photos | Toggle | Yes/No |
| Show Product | Toggle | Yes/No |
| Section Title | Text | e.g., "What Customers Say" |
| Manual Reviews | List | For manual entry |
| Video URLs | List | For variant 6.4 |

---

## 7. Trust Signals Block

**Purpose:** Reduce purchase anxiety. Communicate reliability, security, and policies.

**When to Use:** Homepage (near footer), checkout flow, product pages.

### Core Elements (all variants)
- Trust icons/badges
- Short descriptive text
- Optional: Links to policy pages

### Variants

#### 7.1 Icon Row
- **Layout:** Horizontal row of icons with labels (shipping, returns, secure)
- **Primary Goal:** Quick visual trust signals
- **Best For:** Universal use, compact spaces
- **Mobile:** 2x2 grid or horizontal scroll

#### 7.2 Feature Cards
- **Layout:** 3-4 cards with icon, title, and description
- **Primary Goal:** Detailed policy communication
- **Best For:** When policies are a differentiator
- **Mobile:** Stacked cards

#### 7.3 Logo Cloud
- **Layout:** "As seen in" or payment provider logos
- **Primary Goal:** Authority through association
- **Best For:** Press mentions, certifications, partnerships
- **Mobile:** Scrolling logo bar

#### 7.4 Guarantee Banner
- **Layout:** Prominent guarantee statement with badge
- **Primary Goal:** Risk reversal, confidence boost
- **Best For:** High-ticket items, new brands
- **Mobile:** Full-width banner

#### 7.5 Stats & Numbers
- **Layout:** Key metrics (customers served, years in business, etc.)
- **Primary Goal:** Credibility through data
- **Best For:** Established brands, B2B
- **Mobile:** 2x2 grid of stats

### Configurable Settings
| Setting | Type | Options |
|---------|------|---------|
| Trust Items | List | Icon + Title + Description |
| Icons | Icon Picker | Shipping, Returns, Secure, Support, etc. |
| Logos | Image List | For variant 7.3 |
| Guarantee Text | Text | For variant 7.4 |
| Stats | List | Number + Label (for variant 7.5) |
| Background | Color | Section background |
| Link to Policies | Toggle | Yes/No |

---

## 8. Newsletter / Lead Capture Block

**Purpose:** Collect email addresses. Build marketing list, offer incentives.

**When to Use:** Homepage (often near footer), exit intent, dedicated landing pages.

### Core Elements (all variants)
- Headline
- Email input field
- Submit button
- Optional: Incentive text, privacy note

### Variants

#### 8.1 Inline Simple
- **Layout:** Single row — text, input, button
- **Primary Goal:** Minimal friction, quick signup
- **Best For:** Footer placement, subtle capture
- **Mobile:** Stacked input and button

#### 8.2 Card with Incentive
- **Layout:** Card with headline, incentive offer, email form
- **Primary Goal:** Value exchange (discount for email)
- **Best For:** First-time visitor conversion
- **Mobile:** Full-width card

#### 8.3 Split Image
- **Layout:** 50/50 image and signup form
- **Primary Goal:** Visual appeal, lifestyle connection
- **Best For:** Brand-building, aspirational content
- **Mobile:** Image top, form below

#### 8.4 Full-Width Banner
- **Layout:** Colored banner with centered form
- **Primary Goal:** High visibility, can't miss
- **Best For:** Aggressive list building
- **Mobile:** Stacked layout

#### 8.5 Multi-Field Form
- **Layout:** Email + name + preferences (checkboxes)
- **Primary Goal:** Segmented list building
- **Best For:** Personalized marketing, multiple product lines
- **Mobile:** Single column form

### Configurable Settings
| Setting | Type | Options |
|---------|------|---------|
| Headline | Text | e.g., "Join Our Newsletter" |
| Subtext | Text | e.g., "Get 10% off your first order" |
| Button Text | Text | e.g., "Subscribe" |
| Incentive Code | Text | Auto-sent discount code |
| Background Color | Color | Section background |
| Background Image | Image | For variant 8.3 |
| Collect Name | Toggle | Yes/No |
| Privacy Text | Text | e.g., "We respect your privacy" |
| Success Message | Text | Post-signup confirmation |

---

## 9. Footer Block

**Purpose:** Secondary navigation, legal links, contact info, social proof. Closes the page.

**When to Use:** Required on all pages. Consistent across site.

### Core Elements (all variants)
- Logo or store name
- Navigation links (organized by category)
- Contact information
- Social media links
- Copyright and legal links
- Optional: Newsletter signup, payment icons

### Variants

#### 9.1 Multi-Column Classic
- **Layout:** 4 columns — About, Shop, Support, Contact
- **Primary Goal:** Comprehensive navigation
- **Best For:** Large stores, many pages
- **Mobile:** Accordion sections

#### 9.2 Centered Minimal
- **Layout:** Centered logo, single row of links, social icons
- **Primary Goal:** Clean, simple, brand-focused
- **Best For:** Small stores, minimal aesthetic
- **Mobile:** Stacked, centered

#### 9.3 Newsletter Footer
- **Layout:** Newsletter signup prominent, links below
- **Primary Goal:** List building priority
- **Best For:** Content-driven brands, community building
- **Mobile:** Newsletter top, accordion links below

#### 9.4 Contact-Focused
- **Layout:** Contact info prominent, map or hours, links secondary
- **Primary Goal:** Drive contact, local business
- **Best For:** Service businesses, local stores
- **Mobile:** Contact card top, links below

#### 9.5 Rich Footer
- **Layout:** Multi-column + trust badges + payment icons + social
- **Primary Goal:** Maximum information, trust signals
- **Best For:** Established brands, international stores
- **Mobile:** Sectioned accordion

### Configurable Settings
| Setting | Type | Options |
|---------|------|---------|
| Logo | Image/Text | Upload or store name |
| Link Columns | List | Column title + links |
| Contact Email | Email | Support email |
| Contact Phone | Phone | Support phone |
| Address | Text | Physical address |
| Social Links | List | Platform + URL |
| Show Payment Icons | Toggle | Yes/No |
| Show Newsletter | Toggle | Yes/No |
| Copyright Text | Text | Auto-generated or custom |
| Legal Links | List | Privacy, Terms, etc. |

---


## Global Design System

### Color Application
All blocks inherit from the store's brand settings:
- **Primary Color:** CTAs, links, accents
- **Secondary Color:** Backgrounds, hover states
- **Text Colors:** Automatically calculated for contrast
- **Background:** Light/dark mode support

### Typography Scale
Consistent across all blocks:
- **H1:** Hero headlines (48-72px)
- **H2:** Section titles (32-40px)
- **H3:** Card titles (24-28px)
- **Body:** Descriptions (16-18px)
- **Small:** Labels, captions (14px)

### Spacing System
8px base unit:
- **Section padding:** 64-96px vertical
- **Content max-width:** 1280px
- **Grid gaps:** 24-32px
- **Card padding:** 24px

### Responsive Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640-1024px
- **Desktop:** > 1024px

---

## Recommended Block Combinations

### Store Homepage
A balanced homepage that builds trust and drives exploration.

```
1. Header (Classic or Announcement Bar)
2. Hero (Full-Width Image or Split)
3. Trust Signals (Icon Row) — optional, above fold
4. Featured Product (Large Image Focus)
5. Product Grid (Standard Grid) — "New Arrivals" or "Bestsellers"
6. Promotional Banner (Full-Width) — if running a sale
7. Testimonials (Carousel or Grid)
8. Product Grid (Carousel) — "You May Also Like"
9. Newsletter (Card with Incentive)
10. Footer (Multi-Column Classic)
```

**Key Principles:**
- Hero sets the tone immediately
- Trust signals early reduce bounce
- Mix of featured and grid keeps interest
- Social proof before newsletter
- Newsletter captures those not ready to buy

---

### Product-Focused Landing Page
For product launches, hero products, or single-product stores.

```
1. Header (Minimal)
2. Hero (Product Showcase)
3. Featured Product (Gallery Showcase) — detailed view
4. Trust Signals (Feature Cards) — product-specific benefits
5. Testimonials (Featured Review) — product reviews
6. Product Grid (Carousel) — "Complete the Look" or related
7. Promotional Banner (Discount Code) — if applicable
8. Newsletter (Inline Simple)
9. Footer (Centered Minimal)
```

**Key Principles:**
- Minimal header keeps focus on product
- Hero immediately shows the product
- Deep product info before social proof
- Related products for upsell
- Streamlined footer

---

### Promotional / Sale Page
For Black Friday, seasonal sales, or clearance events.

```
1. Header (Announcement Bar) — sale messaging
2. Hero (Full-Width Image) — sale branding
3. Promotional Banner (Countdown) — urgency
4. Product Grid (Featured + Grid) — top deals
5. Promotional Banner (Multi-Offer) — category deals
6. Product Grid (Standard Grid) — more sale items
7. Trust Signals (Guarantee Banner) — returns policy
8. Testimonials (Review Aggregate) — quick trust
9. Newsletter (Full-Width Banner) — "Get notified of future sales"
10. Footer (Multi-Column Classic)
```

**Key Principles:**
- Urgency throughout (countdown, announcement)
- Multiple product grids for volume
- Category-specific offers
- Strong guarantee to reduce hesitation
- Newsletter for future sales

---

### Collection Page
For category or collection browsing.

```
1. Header (Mega Menu) — easy category switching
2. Hero (Minimal Text) — collection title + description
3. Product Grid (Standard Grid) — main collection
4. Promotional Banner (Split Image) — mid-page break
5. Product Grid (Standard Grid) — continued
6. Trust Signals (Icon Row)
7. Footer (Multi-Column Classic)
```

**Key Principles:**
- Mega menu for navigation between collections
- Minimal hero — products are the focus
- Large grid for browsing
- Banner breaks up long grids
- Trust signals before leaving

---

## Implementation Notes

### Data Sources
Blocks should pull from existing store data:
- **Products:** From product catalog
- **Collections:** From collection definitions
- **Reviews:** From review system (if integrated)
- **Store Info:** From store settings

### Performance Considerations
- Lazy load images below the fold
- Video backgrounds: poster image fallback, autoplay muted
- Limit product grids to 12-16 items with "View All"
- Optimize images on upload (WebP, responsive sizes)

### Accessibility Requirements
- All images require alt text
- Color contrast minimum 4.5:1
- Keyboard navigation for carousels
- Focus states on all interactive elements
- Screen reader announcements for dynamic content

### SEO Considerations
- Hero H1 is the page's primary heading
- Section titles use H2
- Product titles use H3
- Structured data for products and reviews

---

## Block Selection UI

### User Flow
1. User enters "Customize Storefront" from dashboard
2. Sees current page layout with blocks
3. Clicks "Add Block" to see block type selector
4. Selects block type (e.g., "Hero")
5. Sees variant gallery with visual previews
6. Selects variant
7. Block added with smart defaults
8. Opens settings panel to customize
9. Drag to reorder blocks
10. Preview and publish

### Variant Selection Interface
Each variant should show:
- Visual thumbnail preview
- Variant name
- One-line description
- "Best for" tag

### Settings Panel
- Grouped by category (Content, Style, Behavior)
- Live preview as settings change
- Reset to defaults option
- Mobile preview toggle

---

## Future Considerations

### Phase 2 Enhancements
- Custom CSS overrides for advanced users
- A/B testing between variants
- Analytics per block (engagement, conversion)
- Seasonal variant suggestions

### Additional Blocks (Future)
- Instagram Feed Block
- Blog Posts Block
- FAQ Accordion Block
- Contact Form Block
- Store Locator Block
- Countdown to Launch Block

---

## Summary

This block system provides:
- **9 essential blocks** covering all storefront needs
- **5 variants per block** (45 total) for design flexibility
- **Constrained customization** that ensures professional results
- **Data-driven blocks** that pull from store catalog
- **Mobile-first design** with responsive behavior built-in
- **Brand consistency** through inherited design tokens

The system balances merchant flexibility with design quality, avoiding the complexity of free-form page builders while still allowing meaningful customization.
