import { describe, it, expect } from "vitest";
import {
  generateSlug,
  generateVariantsFromOptions,
  initialFormData,
} from "@/app/dashboard/products/new/types";
import { sanitizeSearch } from "@/shared/utils/sanitize";

// ── generateSlug ────────────────────────────────────────────────────────────

describe("generateSlug", () => {
  it("converts name to lowercase kebab-case", () => {
    expect(generateSlug("My Cool Product")).toBe("my-cool-product");
  });

  it("strips special characters", () => {
    expect(generateSlug("Product #1 (New!)")).toBe("product-1-new");
  });

  it("collapses multiple hyphens", () => {
    expect(generateSlug("a   b   c")).toBe("a-b-c");
  });

  it("trims leading/trailing hyphens", () => {
    expect(generateSlug("--hello--")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("handles Nepali product names (transliterated)", () => {
    expect(generateSlug("Dhaka Topi - Traditional")).toBe("dhaka-topi-traditional");
  });
});

// ── generateVariantsFromOptions ─────────────────────────────────────────────

describe("generateVariantsFromOptions", () => {
  it("returns default variant when no options", () => {
    const variants = generateVariantsFromOptions([]);
    expect(variants).toHaveLength(1);
    expect(variants[0].title).toBe("Default");
    expect(variants[0].enabled).toBe(true);
  });

  it("generates variants for single option", () => {
    const variants = generateVariantsFromOptions([
      { id: "1", title: "Size", values: ["S", "M", "L"] },
    ]);
    expect(variants).toHaveLength(3);
    expect(variants.map(v => v.title)).toEqual(["S", "M", "L"]);
    expect(variants[0].options).toEqual({ Size: "S" });
  });

  it("generates cartesian product for multiple options", () => {
    const variants = generateVariantsFromOptions([
      { id: "1", title: "Size", values: ["S", "M"] },
      { id: "2", title: "Color", values: ["Red", "Blue"] },
    ]);
    expect(variants).toHaveLength(4);
    expect(variants.map(v => v.title)).toEqual([
      "S / Red", "S / Blue", "M / Red", "M / Blue",
    ]);
  });

  it("skips options with empty title", () => {
    const variants = generateVariantsFromOptions([
      { id: "1", title: "", values: ["S", "M"] },
      { id: "2", title: "Color", values: ["Red"] },
    ]);
    expect(variants).toHaveLength(1);
    expect(variants[0].title).toBe("Red");
  });

  it("skips options with no values", () => {
    const variants = generateVariantsFromOptions([
      { id: "1", title: "Size", values: [] },
    ]);
    expect(variants).toHaveLength(1);
    expect(variants[0].title).toBe("Default");
  });

  it("sets default variant fields correctly", () => {
    const [v] = generateVariantsFromOptions([]);
    expect(v.price).toBe("");
    expect(v.quantity).toBe("0");
    expect(v.manageInventory).toBe(true);
    expect(v.allowBackorder).toBe(false);
  });
});

// ── initialFormData ─────────────────────────────────────────────────────────

describe("initialFormData", () => {
  it("has one default variant", () => {
    expect(initialFormData.variants).toHaveLength(1);
    expect(initialFormData.variants[0].title).toBe("Default");
  });

  it("defaults to draft status", () => {
    expect(initialFormData.status).toBe("draft");
  });

  it("defaults to publishNow true", () => {
    expect(initialFormData.publishNow).toBe(true);
  });

  it("has empty arrays for collections and tags", () => {
    expect(initialFormData.collectionIds).toEqual([]);
    expect(initialFormData.tags).toEqual([]);
  });
});

// ── sanitizeSearch ──────────────────────────────────────────────────────────

describe("sanitizeSearch", () => {
  it("passes through normal text", () => {
    expect(sanitizeSearch("hello world")).toBe("hello world");
  });

  it("strips SQL wildcards", () => {
    expect(sanitizeSearch("%admin%")).toBe("admin");
  });

  it("strips PostgREST operators", () => {
    expect(sanitizeSearch("name.eq.admin")).toBe("nameeqadmin");
  });

  it("strips parentheses", () => {
    expect(sanitizeSearch("test(or)")).toBe("testor");
  });

  it("strips backslashes", () => {
    expect(sanitizeSearch("test\\injection")).toBe("testinjection");
  });

  it("trims whitespace", () => {
    expect(sanitizeSearch("  hello  ")).toBe("hello");
  });

  it("truncates to 200 chars", () => {
    const long = "a".repeat(300);
    expect(sanitizeSearch(long)).toHaveLength(200);
  });

  it("preserves hyphens and @", () => {
    expect(sanitizeSearch("user@email-test")).toBe("user@email-test");
  });

  it("handles empty string", () => {
    expect(sanitizeSearch("")).toBe("");
  });
});
