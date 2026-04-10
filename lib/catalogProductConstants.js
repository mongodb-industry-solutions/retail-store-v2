/** Fields managed by dedicated form controls (not the extra-attributes editor). */
export const CATALOG_CORE_FIELD_KEYS = new Set([
  "name",
  "description",
  "brand",
  "masterCategory",
  "subCategory",
  "articleType",
  "price",
  "image",
]);

/** Must never be written from the catalog editor. */
export const CATALOG_FORBIDDEN_UPDATE_KEYS = new Set([
  "_id",
  "vai_4_embedding",
  "vai_text_embedding",
  "score",
]);

/** Hidden from the extra-attributes editor (system / derived). */
export const CATALOG_SYSTEM_FIELD_KEYS = new Set([
  ...CATALOG_FORBIDDEN_UPDATE_KEYS,
  "id",
]);

/**
 * @param {Record<string, unknown>} raw
 * @returns {Record<string, unknown>}
 */
export function sanitizeProductUpdatePayload(raw) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [k, v] of Object.entries(raw)) {
    if (CATALOG_FORBIDDEN_UPDATE_KEYS.has(k)) continue;
    out[k] = v;
  }
  return out;
}
