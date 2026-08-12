/**
 * Prepare a value for an explicit PostgreSQL json/jsonb parameter.
 * Objects and arrays are serialized; null remains SQL NULL; primitives pass through.
 */
export function toJsonb(value: unknown): string | number | boolean | null {
  if (value === null) return null;
  if (typeof value === "object") {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new TypeError("Value cannot be serialized as JSON");
    return serialized;
  }
  if (["string", "number", "boolean"].includes(typeof value)) {
    return value as string | number | boolean;
  }
  throw new TypeError("Value is not a supported JSON primitive");
}
