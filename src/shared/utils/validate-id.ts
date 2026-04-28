const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validate a UUID string. Returns the UUID or throws. */
export function validateId(id: string, label = "ID"): string {
  if (!id || !UUID_RE.test(id)) throw new Error(`Invalid ${label}`);
  return id;
}
