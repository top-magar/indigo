# Indigo Landing Production Blueprint

## Direction

Indigo keeps the current Payload-inspired blueprint language: black technical surfaces, measured borders, restrained color, interface-first product proof, and typography that behaves like editorial product documentation. Tailwind CSS is a secondary reference for information density, asymmetric technical grids, and showing the system through working examples.

The page does not reproduce either reference. Indigo's own visual signature is a dark commerce chassis interrupted by light drawing sheets, cobalt measurement marks, coral action signals, and a live storefront editor built around a Nepal-first catalog.

## Narrative

1. **Navigation and status**
   - Compact sticky navigation with direct section links, login, and `Start free`.
   - A narrow preview status bar establishes that the product is active without making launch claims.

2. **Interactive storefront hero**
   - The promise is visible in the headline and demonstrated beside it.
   - The editor shows layers, responsive canvas, storefront, and inspector controls.
   - Three material layout variants change the storefront composition: Editorial, Catalog, and Studio.
   - The primary CTA preserves campaign attribution through signup.

3. **Nepal commerce proof**
   - A four-column capability rail covers eSewa/Khalti, NPR, domains, and the connected merchant workspace.
   - It replaces fabricated merchant logos and performance statistics with product-verifiable proof.

4. **Storefront design system**
   - A light drawing-sheet band makes the visual editor's structure inspectable.
   - Custom graphics cover responsive breakpoints, design tokens, commerce blocks, and the page layer tree.
   - Cells share borders and behave as one technical surface rather than independent feature cards.

5. **Catalog-to-publish workflow**
   - Catalog, Compose, Preview, and Publish form the only numbered sequence on the page.
   - A terminal-style publish console shows the conceptual workflow without inventing a public CLI or SDK.

6. **Commerce operations**
   - A routed SVG order lifecycle is the primary motion moment.
   - Payment configuration and inventory tables use patterns already present in the product.
   - Continuous line motion pauses under reduced-motion preferences.

7. **Application architecture**
   - A light system map connects catalog, visual editor, operations, storefront renderer, and domains.
   - Supporting facts use only technology and data boundaries confirmed in the repository.

8. **Offer, FAQ, and final conversion**
   - `Start free` is the commercial statement; unverified monthly prices and plan limits are removed.
   - The offer distinguishes included workspace capabilities from features available as the merchant grows.
   - FAQ answers describe the current product and route the final action to signup.

## Component Contract

- `landing-content.ts`: typed copy, links, proof points, offer, FAQ, and analytics event names.
- `landing-interactions.tsx`: bounded client code for navigation, campaign links, telemetry, hero variants, and FAQ state.
- `production-landing.tsx`: server-rendered page composition and deterministic SVG/HTML technical graphics.
- `landing.css`: brand tokens, responsive constraints, component states, and reduced-motion behavior.

## Motion

- Hero layout changes use grid interpolation and image transforms triggered by explicit user action.
- The order route uses a slow dashed-line traversal to explain lifecycle movement.
- Hover behavior is limited to commands and navigation; technical surfaces remain stable.
- `prefers-reduced-motion` removes continuous animation and transitions while preserving every state.

## Asset Policy

- The woven catalog photograph is synthetic product imagery created specifically for the demo and does not represent a merchant or customer.
- There are no invented customers, testimonials, revenue figures, uptime claims, certifications, prices, or partner logos.
- eSewa, Khalti, cash on delivery, bank transfer, custom domains, visual pages, inventory, orders, and tenant scoping are supported by code in the product repository.
