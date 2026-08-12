export type NormalizedValues = {
  previous_value: { option_id: string; label: string } | null;
  current_value: { option_id: string; label: string } | null;
};

export type NormalizeResult =
  | {
      outcome: "supported";
      field_node_id: string;
      field_name: string;
      field_type: "single_select";
      values: NormalizedValues;
    }
  | { outcome: "unsupported"; reason: string };

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function displayFieldType(fieldValue: unknown): string {
  if (!isObject(fieldValue) || typeof fieldValue.field_type !== "string") {
    return "unknown";
  }

  return fieldValue.field_type;
}

function normalizeOption(
  value: unknown,
  side: "from" | "to",
): { option_id: string; label: string } | null | { error: string } {
  if (value === null || value === undefined) return null;

  if (!isObject(value) || typeof value.id !== "string" || typeof value.name !== "string") {
    return { error: `single_select ${side} value requires id and name` };
  }

  return { option_id: value.id, label: value.name };
}

export function normalizeFieldValue(fieldValue: unknown): NormalizeResult {
  if (!isObject(fieldValue) || fieldValue.field_type !== "single_select") {
    return {
      outcome: "unsupported",
      reason: `field type ${displayFieldType(fieldValue)} not yet supported`,
    };
  }

  if (
    typeof fieldValue.field_node_id !== "string" ||
    typeof fieldValue.field_name !== "string"
  ) {
    return {
      outcome: "unsupported",
      reason: "single_select field requires field_node_id and field_name",
    };
  }

  const previousValue = normalizeOption(fieldValue.from, "from");
  if (previousValue && "error" in previousValue) {
    return { outcome: "unsupported", reason: previousValue.error };
  }

  const currentValue = normalizeOption(fieldValue.to, "to");
  if (currentValue && "error" in currentValue) {
    return { outcome: "unsupported", reason: currentValue.error };
  }

  return {
    outcome: "supported",
    field_node_id: fieldValue.field_node_id,
    field_name: fieldValue.field_name,
    field_type: "single_select",
    values: {
      previous_value: previousValue,
      current_value: currentValue,
    },
  };
}
