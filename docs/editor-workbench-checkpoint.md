# Editor Workbench Checkpoint

Branch: `codex/editor-merchant-workbench`

## Implemented

- Product, design, and `/editor` surface contracts.
- `EditorDocumentV2` validation and legacy migration with normalized device names.
- Draft revision metadata, immutable publication snapshots, active-version pointer, reusable components, page visibility, and page leases.
- Tenant-transaction-scoped editor actions with discriminated save, validation, publish, rollback, and lease results.
- Revision acknowledgement autosave that queues edits made during an in-flight save.
- Atomic complete-site publication and V2 live-store dual-read with legacy HTML fallback.
- Shared structured React renderer for authenticated preview and live publication.
- Merchant workbench shell: site/page/section navigator, Add section library, command palette, content-first inspector, compact-mode notice, save status, and publish validation.
- Page presence lease with 30-second heartbeat, 90-second expiry, and explicit takeover.
- Content-free editor analytics events.
- V2 migration and revision acknowledgement unit tests.

## Verified

- `npx tsc --noEmit`
- Six focused Vitest tests.
- Changed editor files pass ESLint with no errors; broader editor lint still reports pre-existing React ref warnings.

## Resume Next

1. Run `pnpm build` again. The previous build was interrupted by the user before completion.
2. Start `pnpm dev` and inspect authenticated `/editor` at 1440px, 1280px, 1024px, 768px, and 390px.
3. Fix visual overflow, compact-mode control availability, focus order, and unnamed controls found during browser inspection.
4. Finish global header/footer in-context editing and publication history/rollback UI.
5. Expand renderer parity for interactive registry blocks and use the shared renderer semantics inside the editable canvas.
6. Add server contract, lease, publication, renderer, and authenticated Playwright coverage.
7. Rehearse the local migration, then apply it only to an approved Supabase development branch and run security/performance advisors.
