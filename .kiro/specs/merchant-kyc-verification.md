# Merchant KYC/Verification System

## 1. Metadata

| Field | Value |
|-------|-------|
| **Author** | Backend Engineer (spec session) |
| **Date** | 2026-04-26 |
| **Status** | Draft |
| **Reviewers** | Platform team |
| **Role** | backend-engineer |

---

## 2. Context

Indigo is a multi-tenant e-commerce SaaS platform for Nepal. Currently, any merchant who signs up can immediately publish a storefront. This creates risk: unverified merchants can sell products without identity verification, exposing the platform to fraud, regulatory non-compliance, and customer trust issues.

Nepal's e-commerce regulations require businesses to be identifiable. Merchants must provide citizenship or PAN documentation before operating a public store. Without a KYC gate, Indigo cannot enforce this requirement and risks platform-level liability.

The system introduces a verification workflow: merchants submit identity details (full name, phone, citizenship/PAN number), an admin reviews and approves or rejects, and only verified merchants can have their store publicly accessible. Unverified merchants can still access the dashboard and set up their store (products, settings, editor) — they just cannot publish or have their `/store/[slug]` route serve traffic.

This is a platform-level concern. The `tenants` table is the natural place for verification state since it is the entity being verified. Admin actions use the existing `/admin/merchants` infrastructure.

---

## 3. Functional Requirements

| ID | Requirement |
|----|-------------|
| **FR-1** | The system MUST track a verification status for each tenant with values: `unverified`, `pending`, `verified`, `rejected`. Default MUST be `unverified`. |
| **FR-2** | The system MUST store KYC data per tenant: `kyc_full_name` (text, required), `kyc_phone` (text, required), `kyc_document_number` (text, required — citizenship or PAN number). |
| **FR-3** | A merchant (owner role) MUST be able to submit KYC details via a server action from the dashboard. Submission MUST transition status from `unverified` or `rejected` to `pending`. |
| **FR-4** | A merchant MUST NOT be able to submit KYC if their status is already `pending` or `verified`. |
| **FR-5** | An admin with `manage_merchants` permission MUST be able to approve a merchant, transitioning status from `pending` to `verified`. |
| **FR-6** | An admin with `manage_merchants` permission MUST be able to reject a merchant, transitioning status from `pending` to `rejected`. Rejection MUST include a `kyc_rejection_reason` (text). |
| **FR-7** | A rejected merchant MUST be able to re-submit KYC (updating their details), which transitions status back to `pending`. |
| **FR-8** | The proxy (`src/proxy.ts`) MUST block public access to `/store/[slug]` for tenants whose `verification_status` is NOT `verified`. Blocked requests MUST be redirected or shown a "store not available" page. |
| **FR-9** | The store layout (`src/app/store/[slug]/layout.tsx`) MUST return `notFound()` for unverified tenants as a defense-in-depth check. |
| **FR-10** | The dashboard MUST display the merchant's current verification status and, if rejected, the rejection reason. |
| **FR-11** | The admin merchants list (`/admin/merchants`) MUST display each merchant's verification status. |
| **FR-12** | The admin MUST have a detail/action view to review KYC details and approve or reject. |
| **FR-13** | All KYC state transitions MUST be logged via `logAdminAction` (admin actions) or tenant audit logs (merchant submissions). |
| **FR-14** | Custom domain routing MUST also block unverified tenants (same logic as `/store/[slug]`). |

---

## 4. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| **NFR-1** | Proxy verification check MUST add < 5ms latency. The `verification_status` column MUST be indexed or the tenant lookup query (already cached) MUST include it. |
| **NFR-2** | KYC data (`kyc_document_number`) MUST NOT be exposed in client-side payloads outside the admin panel and the merchant's own dashboard settings. |
| **NFR-3** | All server actions MUST validate input with Zod schemas. |
| **NFR-4** | All admin actions MUST require `manage_merchants` permission (existing RBAC). |
| **NFR-5** | The migration MUST be backward-compatible: existing tenants get `verification_status = 'unverified'` by default. A follow-up decision is needed on whether to auto-verify existing tenants (see EC-7). |

---

## 5. Acceptance Criteria

| ID | Refs | Criterion |
|----|------|-----------|
| **AC-1** | FR-1 | **Given** a new tenant is created, **When** I query the tenants table, **Then** `verification_status` is `'unverified'`. |
| **AC-2** | FR-2, FR-3 | **Given** a merchant with status `unverified`, **When** they submit valid KYC details (full name, phone, document number), **Then** status transitions to `pending` and KYC fields are stored. |
| **AC-3** | FR-4 | **Given** a merchant with status `pending`, **When** they attempt to submit KYC, **Then** the action returns an error and status remains `pending`. |
| **AC-4** | FR-4 | **Given** a merchant with status `verified`, **When** they attempt to submit KYC, **Then** the action returns an error and status remains `verified`. |
| **AC-5** | FR-5 | **Given** an admin with `manage_merchants` permission and a merchant with status `pending`, **When** the admin approves, **Then** status transitions to `verified` and the action is audit-logged. |
| **AC-6** | FR-6 | **Given** an admin with `manage_merchants` permission and a merchant with status `pending`, **When** the admin rejects with a reason, **Then** status transitions to `rejected`, `kyc_rejection_reason` is stored, and the action is audit-logged. |
| **AC-7** | FR-7 | **Given** a merchant with status `rejected`, **When** they re-submit KYC with updated details, **Then** status transitions to `pending`, KYC fields are updated, and `kyc_rejection_reason` is cleared. |
| **AC-8** | FR-8 | **Given** a tenant with `verification_status != 'verified'`, **When** a visitor requests `/store/[slug]`, **Then** the proxy redirects to a "store not available" page (HTTP 302 or rewrite to `/store-unavailable`). |
| **AC-9** | FR-9 | **Given** a tenant with `verification_status != 'verified'`, **When** the store layout server component runs, **Then** `notFound()` is called. |
| **AC-10** | FR-10 | **Given** a merchant on the dashboard, **When** they view their settings/verification section, **Then** they see their current status and, if rejected, the rejection reason. |
| **AC-11** | FR-11 | **Given** an admin on `/admin/merchants`, **When** the page loads, **Then** each merchant row shows a verification status badge. |
| **AC-12** | FR-12 | **Given** an admin viewing a merchant's KYC details, **When** the merchant is `pending`, **Then** approve and reject buttons are available. |
| **AC-13** | FR-13 | **Given** any KYC state transition, **When** the transition completes, **Then** an audit log entry exists with the action, actor, and target tenant. |
| **AC-14** | FR-14 | **Given** a tenant with a custom domain and `verification_status != 'verified'`, **When** a visitor requests the custom domain, **Then** they are shown the "store not available" page. |
| **AC-15** | FR-8 | **Given** a tenant with `verification_status = 'verified'`, **When** a visitor requests `/store/[slug]`, **Then** the store renders normally. |

---

## 6. Edge Cases

| ID | Scenario |
|----|----------|
| **EC-1** | **Concurrent approval/rejection.** Two admins attempt to approve and reject the same merchant simultaneously. The system MUST use optimistic locking or a WHERE clause on current status to prevent conflicting transitions. Only one transition succeeds; the other returns an error. |
| **EC-2** | **Suspended + unverified.** A merchant is both suspended and unverified. The proxy MUST block for either reason. Suspension check already exists; verification check is additive. |
| **EC-3** | **Soft-deleted tenant.** A deleted tenant (`deleted_at IS NOT NULL`) should not be verifiable. KYC submission MUST check `deleted_at IS NULL`. |
| **EC-4** | **Empty/whitespace KYC fields.** Submission with empty strings or whitespace-only values MUST be rejected by Zod validation. |
| **EC-5** | **Document number format.** Nepal citizenship numbers and PAN numbers have different formats. The system SHOULD accept both without strict format validation (store as text), since format rules vary by district/issuing authority. |
| **EC-6** | **Re-submission after rejection clears old reason.** When a rejected merchant re-submits, `kyc_rejection_reason` MUST be set to `null`. |
| **EC-7** | **Migration for existing tenants.** Existing tenants default to `unverified`. The platform team MUST decide whether to run a one-time migration to set existing active tenants to `verified` (to avoid breaking live stores). Recommendation: set existing tenants with at least one order to `verified`; others remain `unverified`. |
| **EC-8** | **Staff/admin role submitting KYC.** Only the `owner` role for a tenant SHOULD be able to submit KYC. Staff members MUST NOT be able to submit on behalf of the owner. |
| **EC-9** | **Proxy cache invalidation.** The store tenant lookup is cached for 300s (`unstable_cache`). After verification status changes, the cache tag `store-tenant` MUST be revalidated so the store becomes accessible/blocked promptly. |
| **EC-10** | **API store routes.** `/api/store/` prefixed routes are also public. These MUST also be blocked for unverified tenants to prevent API-level access to store data. |

---

## 7. API Contracts

### 7.1 Merchant Server Action: Submit KYC

**Location:** `src/app/dashboard/settings/actions.ts` (or new `src/app/dashboard/verification/actions.ts`)

```typescript
// Input
interface SubmitKycInput {
  fullName: string;    // min 2 chars, max 255
  phone: string;       // min 10 chars, max 15, Nepal phone format
  documentNumber: string; // min 5 chars, max 50, citizenship or PAN
}

// Zod schema
const submitKycSchema = z.object({
  fullName: z.string().trim().min(2).max(255),
  phone: z.string().trim().min(10).max(15),
  documentNumber: z.string().trim().min(5).max(50),
});

// Server action signature
export async function submitKyc(input: SubmitKycInput): Promise<{ error?: string }>
```

**Success:** Updates tenant row, returns `{}`.
**Errors:**
- `{ error: "Invalid input" }` — validation failure
- `{ error: "KYC already submitted and pending review" }` — status is `pending`
- `{ error: "Already verified" }` — status is `verified`
- `{ error: "Only the store owner can submit KYC" }` — non-owner role

### 7.2 Admin Server Action: Approve Merchant

**Location:** `src/app/admin/merchants/actions.ts`

```typescript
export async function approveMerchantKyc(tenantId: string): Promise<{ error?: string }>
```

**Success:** Sets `verification_status = 'verified'`, revalidates cache, returns `{}`.
**Errors:**
- `{ error: "Invalid merchant ID" }` — UUID validation failure
- `{ error: "Merchant not found" }` — no tenant with that ID
- `{ error: "Merchant is not pending verification" }` — status is not `pending`

### 7.3 Admin Server Action: Reject Merchant

**Location:** `src/app/admin/merchants/actions.ts`

```typescript
interface RejectKycInput {
  tenantId: string;
  reason: string; // min 5 chars, max 500
}

export async function rejectMerchantKyc(input: RejectKycInput): Promise<{ error?: string }>
```

**Success:** Sets `verification_status = 'rejected'`, stores reason, revalidates cache, returns `{}`.
**Errors:**
- `{ error: "Invalid input" }` — validation failure
- `{ error: "Merchant not found" }`
- `{ error: "Merchant is not pending verification" }`

### 7.4 Admin Query: Get Merchant KYC Details

**Location:** `src/app/admin/merchants/page.tsx` (extended query) or new `src/app/admin/merchants/[id]/page.tsx`

```typescript
// Added to merchant list query result
interface MerchantWithKyc {
  id: string;
  name: string;
  slug: string;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  kycFullName: string | null;
  kycPhone: string | null;
  kycDocumentNumber: string | null; // Only visible in admin detail view
  kycRejectionReason: string | null;
  kycSubmittedAt: string | null;
  kycReviewedAt: string | null;
}
```

---

## 8. Data Models

### 8.1 Schema Changes to `tenants` Table

New columns added to `src/db/schema/tenants.ts`:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `verification_status` | `text` | NOT NULL, DEFAULT `'unverified'`, CHECK IN (`unverified`, `pending`, `verified`, `rejected`) | Current KYC verification state |
| `kyc_full_name` | `text` | nullable | Merchant's legal full name |
| `kyc_phone` | `text` | nullable | Merchant's phone number |
| `kyc_document_number` | `text` | nullable | Citizenship or PAN number |
| `kyc_rejection_reason` | `text` | nullable | Reason for rejection (set by admin) |
| `kyc_submitted_at` | `timestamp with time zone` | nullable | When KYC was last submitted |
| `kyc_reviewed_at` | `timestamp with time zone` | nullable | When KYC was last reviewed by admin |

### 8.2 Drizzle Schema Addition

```typescript
// Added to src/db/schema/tenants.ts
export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified", "pending", "verified", "rejected"
]);

// New columns in tenants table:
verificationStatus: verificationStatusEnum("verification_status").default("unverified").notNull(),
kycFullName: text("kyc_full_name"),
kycPhone: text("kyc_phone"),
kycDocumentNumber: text("kyc_document_number"),
kycRejectionReason: text("kyc_rejection_reason"),
kycSubmittedAt: timestamp("kyc_submitted_at", { withTimezone: true }),
kycReviewedAt: timestamp("kyc_reviewed_at", { withTimezone: true }),
```

### 8.3 Migration

**File:** `supabase/migrations/YYYYMMDDHHMMSS_add_merchant_kyc.sql`

```sql
-- Create enum type
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');

-- Add KYC columns to tenants
ALTER TABLE tenants
  ADD COLUMN verification_status verification_status NOT NULL DEFAULT 'unverified',
  ADD COLUMN kyc_full_name text,
  ADD COLUMN kyc_phone text,
  ADD COLUMN kyc_document_number text,
  ADD COLUMN kyc_rejection_reason text,
  ADD COLUMN kyc_submitted_at timestamptz,
  ADD COLUMN kyc_reviewed_at timestamptz;

-- Index for proxy lookups (slug + verification_status)
CREATE INDEX idx_tenants_verification_status ON tenants (verification_status);

-- Optional: auto-verify existing tenants with orders (see EC-7)
-- UPDATE tenants SET verification_status = 'verified'
-- WHERE id IN (SELECT DISTINCT tenant_id FROM orders) AND deleted_at IS NULL;
```

---

## 9. Page List (What to Build)

| # | Route / File | Type | Description |
|---|-------------|------|-------------|
| 1 | `src/db/schema/tenants.ts` | Schema change | Add KYC columns and verification_status |
| 2 | `supabase/migrations/..._add_merchant_kyc.sql` | Migration | Database migration |
| 3 | `src/app/dashboard/settings/verification/page.tsx` | New page (server) | Merchant-facing KYC submission form and status display |
| 4 | `src/app/dashboard/settings/verification/actions.ts` | New server actions | `submitKyc` action |
| 5 | `src/app/dashboard/settings/verification/verification-form.tsx` | New client component | KYC form with react-hook-form + zod |
| 6 | `src/app/admin/merchants/actions.ts` | Modified | Add `approveMerchantKyc`, `rejectMerchantKyc` actions |
| 7 | `src/app/admin/merchants/page.tsx` | Modified | Add `verification_status` to merchant list query and display |
| 8 | `src/app/admin/merchants/[id]/page.tsx` | New page (server) | Merchant KYC detail view with approve/reject controls |
| 9 | `src/app/admin/merchants/[id]/kyc-review.tsx` | New client component | Approve/reject UI with reason input |
| 10 | `src/proxy.ts` | Modified | Add verification check for `/store/[slug]` and custom domain routes |
| 11 | `src/app/store/[slug]/layout.tsx` | Modified | Defense-in-depth: check `verification_status` in tenant lookup |
| 12 | `src/app/store-unavailable/page.tsx` | New page | Static page shown when store is blocked due to verification |
| 13 | `src/app/admin/_lib/types.ts` | Modified | Add `verify_merchants` permission (or reuse `manage_merchants`) |

---

## 10. Out of Scope

| ID | Exclusion | Reason |
|----|-----------|--------|
| **OS-1** | Document upload (photo of citizenship/PAN). | Phase 1 uses text-based document numbers only. File upload KYC can be added later. |
| **OS-2** | Automated verification (OCR, third-party KYC API). | No Nepal-specific KYC API integration exists yet. Manual admin review is sufficient for launch. |
| **OS-3** | Email/SMS notifications on status change. | Can be added as a follow-up. Merchants see status on dashboard. |
| **OS-4** | Verification expiry/renewal. | Not needed for initial launch. Verification is permanent once granted. |
| **OS-5** | Tiered verification levels (basic, enhanced). | Single verification level is sufficient. Tiering adds complexity without clear value now. |
| **OS-6** | Public-facing "verified merchant" badge on storefront. | Nice-to-have, not required for the gate functionality. |

---

## 11. Implementation Notes

### Proxy Change Strategy

The proxy already queries the `users` table for role checks. For store routes, it does NOT currently query the tenant. The verification check needs to happen for unauthenticated `/store/[slug]` requests. Two options:

**Option A (Recommended):** Add a tenant lookup in the proxy for store routes only. Query `tenants` by slug, check `verification_status`. This adds one DB query for store routes but is simple and correct.

**Option B:** Rely solely on the store layout's `getTenant` cached lookup (defense-in-depth). This avoids proxy changes but means the check happens after Next.js routing, not at the edge. The 300s cache means a newly verified store could take up to 5 minutes to go live (acceptable) but a newly unverified store could remain accessible for 5 minutes (less acceptable).

**Recommendation:** Option A for the proxy (authoritative gate) + Option B as defense-in-depth. The proxy query can use Supabase client (already instantiated) with a simple `SELECT verification_status FROM tenants WHERE slug = $1 AND deleted_at IS NULL` query.

### Cache Invalidation

When an admin approves/rejects, call `revalidateTag('store-tenant')` to bust the `unstable_cache` in the store layout. This ensures the store becomes accessible/blocked within seconds rather than waiting for the 300s TTL.

### Tenant Isolation

KYC submission uses `requireUser()` which returns `tenantId`. The update is scoped: `WHERE id = tenantId`. No cross-tenant access is possible. Admin actions use `requirePermission('manage_merchants')` and operate on the platform-level `tenants` table (which has no `tenant_id` column on itself — it IS the tenant).
