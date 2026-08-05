/**
 * Stripe webhook tests — order state transitions driven by real webhook events.
 *
 * Mocks the network/DB boundary (stripe SDK, drizzle db, next/server) but
 * exercises the actual route logic: signature rejection, event dispatch,
 * tenant-scoped order updates, and idempotency (no double-paid states).
 */
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";

// ── Shared mocks (hoisted so vi.mock factories can reference them) ────────

const { constructEventMock, dbMock, setMock } = vi.hoisted(() => {
  const setMock = vi.fn<(..._args: unknown[]) => { where: ReturnType<typeof vi.fn> }>(
    () => ({ where: vi.fn(async () => []) }),
  );
  return {
    constructEventMock: vi.fn<(..._args: unknown[]) => unknown>(() => ({
      type: "unhandled",
      data: { object: {} },
    })),
    dbMock: {
      select: vi.fn<(..._args: unknown[]) => unknown>(() => ({})),
      update: vi.fn<(..._args: unknown[]) => { set: typeof setMock }>(() => ({ set: setMock })),
    },
    setMock,
  };
});

vi.mock("stripe", () => ({
  default: class {
    webhooks = { constructEvent: constructEventMock };
  },
}));

vi.mock("@/infrastructure/db", () => ({ db: dbMock }));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

// ── Route import (env must be set before module evaluation) ───────────────

let POST: (request: Request) => Promise<{ body: unknown; status: number }>;

beforeAll(async () => {
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "whsec_dummy");
  const route = await import("@/app/api/webhooks/stripe/route");
  POST = route.POST as unknown as typeof POST;
});

afterEach(() => {
  vi.clearAllMocks();
});

// ── Helpers ───────────────────────────────────────────────────────────────

/** Configure the next db.select().from().where().limit(1) to resolve rows. */
function mockSelectRows(rows: Array<Record<string, unknown>>) {
  dbMock.select.mockReturnValue({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn(async () => rows),
      })),
    })),
  });
}

/** Read the args passed to the Nth db.update().set() call as a typed record. */
function setCallArgs(index: number): Record<string, unknown> {
  const call = setMock.mock.calls[index];
  return (call?.[0] ?? {}) as Record<string, unknown>;
}

function paymentIntentEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: "pi_123",
        metadata: { tenantId: "tenant-1", orderId: "order-1" },
        ...overrides,
      },
    },
  };
}

function post(event: unknown, sig = "t=1,v1=dummy") {
  return POST(
    new Request("https://example.com/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": sig },
      body: JSON.stringify(event),
    }),
  );
}

// ── Signature verification ────────────────────────────────────────────────

describe("Stripe webhook signature verification", () => {
  it("rejects requests without a signature", async () => {
    const res = await POST(
      new Request("https://example.com/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      }),
    );
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Missing signature or secret" });
  });

  it("rejects an invalid signature", async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error("No signatures found matching the expected signature");
    });
    const res = await post({ type: "payment_intent.succeeded" });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid signature" });
    expect(dbMock.select).not.toHaveBeenCalled();
  });
});

// ── payment_intent.succeeded ──────────────────────────────────────────────

describe("payment_intent.succeeded", () => {
  it("marks the tenant-scoped order paid and confirmed", async () => {
    constructEventMock.mockReturnValue(paymentIntentEvent());
    mockSelectRows([{ paymentStatus: "pending" }]);

    const res = await post(paymentIntentEvent());

    expect(res.status).toBe(200);
    expect(setMock).toHaveBeenCalledTimes(1);
    expect(setCallArgs(0).paymentStatus).toBe("paid");
    expect(setCallArgs(0).status).toBe("confirmed");
  });

  it("is idempotent — skips re-update when the order is already paid", async () => {
    constructEventMock.mockReturnValue(paymentIntentEvent());
    mockSelectRows([{ paymentStatus: "paid" }]);

    const res = await post(paymentIntentEvent());

    expect(res.status).toBe(200);
    expect(setMock).not.toHaveBeenCalled();
  });

  it("does not touch any order when metadata lacks tenantId", async () => {
    constructEventMock.mockReturnValue(paymentIntentEvent({ metadata: {} }));
    mockSelectRows([{ paymentStatus: "pending" }]);

    const res = await post(paymentIntentEvent({ metadata: {} }));

    expect(res.status).toBe(200);
    expect(dbMock.select).not.toHaveBeenCalled();
    expect(setMock).not.toHaveBeenCalled();
  });

  it("scopes the lookup by both payment intent id and tenantId", async () => {
    constructEventMock.mockReturnValue(paymentIntentEvent());
    mockSelectRows([{ paymentStatus: "pending" }]);

    await post(paymentIntentEvent());

    // The route must AND at least two conditions (stripePaymentIntentId + tenantId).
    // (drizzle's and() serializes conditions plus an " and " separator chunk.)
    const whereArgs = (dbMock.select.mock.results[0].value.from.mock.results[0]
      .value.where as ReturnType<typeof vi.fn>).mock.calls[0][0] as {
      queryChunks?: unknown[];
    };
    expect(whereArgs?.queryChunks?.length ?? 0).toBeGreaterThanOrEqual(2);
  });
});

// ── payment_intent.payment_failed ─────────────────────────────────────────

describe("payment_intent.payment_failed", () => {
  it("marks the order failed", async () => {
    const event = {
      type: "payment_intent.payment_failed",
      data: { object: { id: "pi_123", metadata: { tenantId: "tenant-1" } } },
    };
    constructEventMock.mockReturnValue(event);
    mockSelectRows([{ paymentStatus: "pending" }]);

    const res = await post(event);

    expect(res.status).toBe(200);
    expect(setMock).toHaveBeenCalledTimes(1);
    expect(setCallArgs(0).paymentStatus).toBe("failed");
  });

  it("is idempotent for already-failed orders", async () => {
    const event = {
      type: "payment_intent.payment_failed",
      data: { object: { id: "pi_123", metadata: { tenantId: "tenant-1" } } },
    };
    constructEventMock.mockReturnValue(event);
    mockSelectRows([{ paymentStatus: "failed" }]);

    await post(event);

    expect(setMock).not.toHaveBeenCalled();
  });
});

// ── charge.refunded ───────────────────────────────────────────────────────

describe("charge.refunded", () => {
  const refundEvent = (amountRefunded: number, amount: number) => ({
    type: "charge.refunded",
    data: {
      object: {
        id: "ch_1",
        payment_intent: "pi_123",
        amount_refunded: amountRefunded,
        amount,
      },
    },
  });

  it("marks a fully refunded order as refunded", async () => {
    constructEventMock.mockReturnValue(refundEvent(1000, 1000));
    mockSelectRows([{ tenantId: "tenant-1", paymentStatus: "paid" }]);

    const res = await post(refundEvent(1000, 1000));

    expect(res.status).toBe(200);
    expect(setCallArgs(0).paymentStatus).toBe("refunded");
    expect(setCallArgs(0).status).toBe("refunded");
  });

  it("marks a partially refunded order as partially_refunded without status change", async () => {
    constructEventMock.mockReturnValue(refundEvent(400, 1000));
    mockSelectRows([{ tenantId: "tenant-1", paymentStatus: "paid" }]);

    await post(refundEvent(400, 1000));

    expect(setCallArgs(0).paymentStatus).toBe("partially_refunded");
    expect(setCallArgs(0).status).toBeUndefined();
  });

  it("handles a payment_intent that is an object (not just a string)", async () => {
    const event = {
      type: "charge.refunded",
      data: {
        object: {
          id: "ch_2",
          payment_intent: { id: "pi_999" },
          amount_refunded: 500,
          amount: 500,
        },
      },
    };
    constructEventMock.mockReturnValue(event);
    mockSelectRows([{ tenantId: "tenant-1", paymentStatus: "paid" }]);

    await post(event);

    expect(setCallArgs(0).paymentStatus).toBe("refunded");
  });

  it("logs and continues when no order exists for the refund", async () => {
    constructEventMock.mockReturnValue(refundEvent(1000, 1000));
    mockSelectRows([]);

    const res = await post(refundEvent(1000, 1000));

    expect(res.status).toBe(200);
    expect(setMock).not.toHaveBeenCalled();
  });
});

// ── Unknown events + error handling ───────────────────────────────────────

describe("event dispatch safety", () => {
  it("acknowledges unhandled event types without touching orders", async () => {
    const event = { type: "invoice.paid", data: { object: {} } };
    constructEventMock.mockReturnValue(event);

    const res = await post(event);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(dbMock.select).not.toHaveBeenCalled();
  });

  it("returns 500 when order processing throws", async () => {
    constructEventMock.mockReturnValue(paymentIntentEvent());
    dbMock.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(async () => {
            throw new Error("connection lost");
          }),
        })),
      })),
    });

    const res = await post(paymentIntentEvent());

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Webhook processing failed" });
  });
});
