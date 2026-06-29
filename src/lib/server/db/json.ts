/** JSON-as-text helpers for columns that store structured values as TEXT. */

export function jsonStringify(value: unknown): string {
  return JSON.stringify(value);
}

/** Parse a JSON TEXT column. Returns `fallback` when null or invalid. */
export function jsonParse<T>(text: string | null | undefined, fallback: T): T {
  if (!text) return fallback;
  try {
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}
