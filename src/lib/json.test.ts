import { describe, expect, it } from "vitest";

import { toJsonb } from "./json";

describe("toJsonb", () => {
  it("serializes objects and arrays", () => {
    expect(toJsonb({ option_id: "option-1", label: "Todo" })).toBe(
      '{"option_id":"option-1","label":"Todo"}',
    );
    expect(toJsonb(["one", 2])).toBe('["one",2]');
  });

  it("preserves SQL null and primitive parameters", () => {
    expect(toJsonb(null)).toBeNull();
    expect(toJsonb("text")).toBe("text");
    expect(toJsonb(42)).toBe(42);
    expect(toJsonb(true)).toBe(true);
  });
});
