# Indigo Product Truth

## Product

Indigo is a multi-tenant commerce platform for merchants. A merchant can manage a catalog, orders, customers, storefront settings, and pages from one authenticated workspace. The storefront editor is part of that operating system, not a separate design product.

## Storefront Editor Promise

The editor helps a merchant choose a template, add sections, connect the catalog, adjust content and styling, preview the result, validate it, and publish a credible storefront in under 30 minutes.

The product is merchant-first and section-first. Freeform layout controls remain available for advanced work, but they are progressively disclosed and must not dominate the default workflow.

## Confirmed Users

- Store owners creating or updating their own storefront.
- Merchant staff maintaining content, navigation, products, and promotions.
- Advanced operators who need responsive overrides and detailed layout control.

## Confirmed Capabilities

- Multi-page sites with a global header and footer.
- A registry-backed element tree stored as JSON.
- Product, collection, store, cart, and navigation data bindings.
- Responsive desktop, tablet, and mobile storefront output.
- Draft editing, preview, validation, publication history, and rollback.
- Page-level presence leases to prevent silent concurrent overwrite.
- Static HTML export as a secondary, explicitly limited format.

## Product Rules

- Every merchant operation is tenant-scoped at the database transaction boundary.
- Canvas, preview, and live storefront use the same document semantics and renderer.
- Publications are immutable complete-site snapshots and become active atomically.
- A blocked or failed publication never produces a success state.
- Demonstration catalog content is labelled. Indigo does not fabricate testimonials, ratings, discounts, prices, or performance claims.
- Desktop at 1280px or wider is the authoritative layout-authoring environment.
- Smaller viewports support preview, content changes, section ordering, save, and publish. Advanced layout editing is unavailable there.

## Out Of Scope For This Release

- Real-time multi-user co-editing.
- Full phone layout authoring.
- AI content or layout generation.
- A dashboard-wide redesign.
- Replacing the version-controlled launch content with a separate CMS.

## Success Measures

- Five first-time merchants can publish a catalog-connected storefront within 30 minutes without assistance.
- Acknowledged and pending work survives slow networks, retries, reconnects, and edits made during an in-flight save.
- Canvas, preview, and published output remain visually and behaviorally equivalent at 390px, 768px, 1440px, and wide desktop.
- Keyboard users can complete the core authoring and publication workflow without drag gestures.
