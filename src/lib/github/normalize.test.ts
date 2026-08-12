import { describe, expect, it } from "vitest";

import { normalizeFieldValue } from "./normalize";

const fieldValue = {
  field_node_id: "PVTSSF_lADOBH2n9s4Aje1Izgb1kEs",
  field_type: "single_select",
  field_name: "Status",
  project_number: 18,
  from: { id: "f75ad846", name: "Todo", color: "GREEN", description: "..." },
  to: { id: "47fc9ee4", name: "In Progress", color: "YELLOW", description: "..." },
};

describe("normalizeFieldValue", () => {
  it("maps the verified single-select from/to shape to canonical values", () => {
    expect(normalizeFieldValue(fieldValue)).toEqual({
      outcome: "supported",
      field_node_id: fieldValue.field_node_id,
      field_name: "Status",
      field_type: "single_select",
      values: {
        previous_value: { option_id: "f75ad846", label: "Todo" },
        current_value: { option_id: "47fc9ee4", label: "In Progress" },
      },
    });
  });

  it("represents a newly set value with a null previous value", () => {
    const result = normalizeFieldValue({ ...fieldValue, from: null });
    expect(result.outcome === "supported" && result.values.previous_value).toBeNull();
  });

  it("represents a cleared value with a null current value", () => {
    const result = normalizeFieldValue({ ...fieldValue, to: null });
    expect(result.outcome === "supported" && result.values.current_value).toBeNull();
  });

  it("rejects non-single-select fields", () => {
    expect(normalizeFieldValue({ field_type: "text" })).toEqual({
      outcome: "unsupported",
      reason: "field type text not yet supported",
    });
  });

  it("rejects malformed input", () => {
    expect(normalizeFieldValue(null)).toEqual({
      outcome: "unsupported",
      reason: "field type unknown not yet supported",
    });
    expect(normalizeFieldValue({ ...fieldValue, to: { name: "Done" } })).toEqual({
      outcome: "unsupported",
      reason: "single_select to value requires id and name",
    });
  });
});
