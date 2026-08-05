/**
 * Payment path tests — REAL coverage of the money code.
 *
 * Unlike critical-paths.test.ts (which re-implements logic inline and tests
 * copies), this file imports the actual payment modules and mocks only the
 * network boundary (global fetch). If the real signature format, amount
 * computation, or verification flow changes, these tests fail.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { createHmac } from "node:crypto";
import {
  initiateEsewaPayment,
  verifyEsewaPayment,
} from "@/infrastructure/payments/esewa";
import {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
} from "@/infrastructure/payments/khalti";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/* ── eSewa: initiate (pure HMAC + form building) ───────────────────────── */

describe("initiateEsewaPayment", () => {
  const base = {
    amount: 1000,
    taxAmount: 130,
    productServiceCharge: 10,
    productDeliveryCharge: 50,
    transactionUuid: "order-123",
    merchantCode: "EPAYTEST",
    merchantSecret: "secret",
    successUrl: "https://example.com/api/store/acme/payment/esewa",
    failureUrl: "https://example.com/store/acme?payment=failed",
  };

  it("computes total_amount as sum of all components", () => {
    const { formData } = initiateEsewaPayment(base);
    expect(formData.total_amount).toBe(String(1000 + 130 + 10 + 50));
  });

  it("signs exactly the three documented fields in order", () => {
    const { formData } = initiateEsewaPayment(base);
    const message = "total_amount=1190,transaction_uuid=order-123,product_code=EPAYTEST";
    const expected = createHmac("sha256", "secret").update(message).digest("base64");
    expect(formData.signed_field_names).toBe("total_amount,transaction_uuid,product_code");
    expect(formData.signature).toBe(expected);
  });

  it("is deterministic for the same inputs", () => {
    const a = initiateEsewaPayment(base);
    const b = initiateEsewaPayment(base);
    expect(a.formData.signature).toBe(b.formData.signature);
  });

  it("defaults missing optional charges to zero", () => {
    const { formData } = initiateEsewaPayment({
      amount: 500,
      transactionUuid: "order-1",
      merchantCode: "EPAYTEST",
      merchantSecret: "s",
      successUrl: "https://x.dev/cb",
      failureUrl: "https://x.dev/fail",
    });
    expect(formData.tax_amount).toBe("0");
    expect(formData.product_service_charge).toBe("0");
    expect(formData.product_delivery_charge).toBe("0");
    expect(formData.total_amount).toBe("500");
  });

  it("points at the sandbox endpoint by default", () => {
    const { redirectUrl } = initiateEsewaPayment(base);
    expect(redirectUrl).toBe("https://rc-epay.esewa.com.np/api/epay/main/v2/form");
  });

  it("points at the production endpoint when ESEWA_ENV=production", async () => {
    vi.resetModules();
    vi.stubEnv("ESEWA_ENV", "production");
    const prod = await import("@/infrastructure/payments/esewa");
    const { redirectUrl } = prod.initiateEsewaPayment(base);
    expect(redirectUrl).toBe("https://epay.esewa.com.np/api/epay/main/v2/form");
  });
});

/* ── eSewa: verify (callback decode + status API, fetch mocked) ─────────── */

describe("verifyEsewaPayment", () => {
  const callback = (overrides: Record<string, unknown> = {}) =>
    Buffer.from(
      JSON.stringify({
        status: "COMPLETE",
        transaction_uuid: "order-123",
        total_amount: "1190",
        transaction_code: "TX-ABC-1",
        ...overrides,
      }),
    ).toString("base64");

  const input = {
    merchantCode: "EPAYTEST",
    merchantSecret: "secret",
    expectedAmount: 1190,
    expectedTransactionUuid: "order-123",
  };

  it("accepts a verified callback that matches order and amount", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "COMPLETE" }),
      }),
    );
    const result = await verifyEsewaPayment({ encodedData: callback(), ...input });
    expect(result).toEqual({ success: true, transactionCode: "TX-ABC-1" });
  });

  it("rejects a non-COMPLETE callback status before any network call", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const result = await verifyEsewaPayment({
      encodedData: callback({ status: "PENDING" }),
      ...input,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Payment status: PENDING");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a transaction UUID mismatch", async () => {
    const result = await verifyEsewaPayment({
      encodedData: callback({ transaction_uuid: "order-OTHER" }),
      ...input,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Transaction UUID mismatch");
  });

  it("rejects an amount mismatch (tampered total)", async () => {
    const result = await verifyEsewaPayment({
      encodedData: callback({ total_amount: "500" }),
      ...input,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Amount mismatch");
  });

  it("fails closed when the eSewa status API is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 502 }),
    );
    const result = await verifyEsewaPayment({ encodedData: callback(), ...input });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Status verification unavailable");
  });

  it("fails when the status API does not confirm COMPLETE", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "PENDING" }),
      }),
    );
    const result = await verifyEsewaPayment({ encodedData: callback(), ...input });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Verification status: PENDING");
  });

  it("fails closed on malformed callback data", async () => {
    const result = await verifyEsewaPayment({
      encodedData: "!!!not-base64!!!",
      ...input,
    });
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("fails closed when the status API throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNRESET")));
    const result = await verifyEsewaPayment({ encodedData: callback(), ...input });
    expect(result.success).toBe(false);
    expect(result.error).toBe("ECONNRESET");
  });
});

/* ── Khalti: initiate (fetch mocked) ────────────────────────────────────── */

describe("initiateKhaltiPayment", () => {
  const base = {
    amount: 119000, // paisa
    purchaseOrderId: "order-123",
    purchaseOrderName: "Order ORD-ABC-123",
    returnUrl: "https://example.com/api/store/acme/payment/khalti",
    websiteUrl: "https://example.com/store/acme",
    secretKey: "test_secret_key",
  };

  it("posts to the sandbox endpoint with paisa amount and returns pidx + url", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ pidx: "pidx-1", payment_url: "https://pay.khalti.com/pidx-1" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await initiateKhaltiPayment(base);
    expect(result).toEqual({ success: true, paymentUrl: "https://pay.khalti.com/pidx-1", pidx: "pidx-1" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://a.khalti.com/api/v2/epayment/initiate/");
    expect(init.method).toBe("POST");
    const body = JSON.parse(init.body);
    expect(body.amount).toBe(119000);
    expect(body.purchase_order_id).toBe("order-123");
    expect(body.return_url).toBe(base.returnUrl);
    expect(body.website_url).toBe(base.websiteUrl);
    expect(body.customer_info).toBeUndefined(); // omitted when no customer name
  });

  it("includes customer_info when a customer name is provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ pidx: "pidx-2", payment_url: "https://pay.khalti.com/pidx-2" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await initiateKhaltiPayment({
      ...base,
      customerName: "Ramesh Shrestha",
      customerEmail: "ramesh@example.com",
      customerPhone: "9800000000",
    });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.customer_info).toEqual({
      name: "Ramesh Shrestha",
      email: "ramesh@example.com",
      phone: "9800000000",
    });
  });

  it("returns the provider error detail on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ detail: "Invalid amount" }),
      }),
    );
    const result = await initiateKhaltiPayment(base);
    expect(result).toEqual({ success: false, error: "Invalid amount" });
  });

  it("fails closed on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    const result = await initiateKhaltiPayment(base);
    expect(result.success).toBe(false);
    expect(result.error).toBe("timeout");
  });

  it("points at production endpoint when KHALTI_ENV=production", async () => {
    vi.resetModules();
    vi.stubEnv("KHALTI_ENV", "production");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ pidx: "p", payment_url: "https://pay.khalti.com/p" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const prod = await import("@/infrastructure/payments/khalti");
    await prod.initiateKhaltiPayment(base);
    expect(fetchMock.mock.calls[0][0]).toBe("https://khalti.com/api/v2/epayment/initiate/");
  });
});

/* ── Khalti: verify (lookup, fetch mocked) ──────────────────────────────── */

describe("verifyKhaltiPayment", () => {
  const input = {
    pidx: "pidx-1",
    secretKey: "test_secret_key",
    expectedAmount: 119000,
    expectedOrderId: "order-123",
  };

  it("accepts a Completed lookup matching the expected amount", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "Completed", total_amount: 119000, transaction_id: "tx-9" }),
      }),
    );
    const result = await verifyKhaltiPayment(input);
    expect(result).toEqual({ success: true, transactionId: "tx-9", status: "Completed" });
  });

  it("rejects a pending payment", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "Pending", total_amount: 119000 }),
      }),
    );
    const result = await verifyKhaltiPayment(input);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Payment status: Pending");
    expect(result.status).toBe("Pending");
  });

  it("rejects an amount mismatch", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: "Completed", total_amount: 500 }),
      }),
    );
    const result = await verifyKhaltiPayment(input);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Amount mismatch");
  });

  it("fails closed on lookup error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    );
    const result = await verifyKhaltiPayment(input);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Lookup failed: 500");
  });

  it("fails closed when lookup throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    const result = await verifyKhaltiPayment(input);
    expect(result.success).toBe(false);
    expect(result.error).toBe("ECONNREFUSED");
  });
});
