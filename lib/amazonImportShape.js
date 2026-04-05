/**
 * Canonical shape for Amazon-sourced products:
 * - `amazonImports` holds the full scrape payload (nested).
 * - Each key in `amazonImports.amazonAttributes` is also copied to the document root (Amazon labels, e.g. "Compatible Devices").
 */

/** Keys we never overwrite when flattening Amazon attribute labels onto the root. */
const PRODUCT_DOCUMENT_CORE_KEYS = new Set([
  "_id",
  "id",
  "name",
  "brand",
  "price",
  "image",
  "photo",
  "masterCategory",
  "subCategory",
  "articleType",
  "description",
  "gender",
  "baseColour",
  "color",
  "source",
  "importedAt",
  "enrichmentStatus",
  "amazonImports",
  "vai_4_embedding",
  "vai_text_embedding",
  "lastUpdatedAt",
  "amazonTextEnrichedAt",
  "stockQuantity",
  "score",
]);

/**
 * @param {unknown} v
 * @returns {string|number|boolean|null}
 */
function flattenAttrValue(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === "boolean" || typeof v === "number") return v;
  if (typeof v === "string") return v.trim();
  if (Array.isArray(v)) {
    const parts = v.map((x) => String(x).trim()).filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  }
  return null;
}

/**
 * Copy Amazon PDP attribute map onto document root using original label keys.
 * Skips keys that collide with core catalog fields or already-set properties.
 * @param {Record<string, unknown>} doc
 * @param {Record<string, unknown> | null | undefined} amazonAttributes
 */
function flattenAmazonAttributesOntoDocument(doc, amazonAttributes) {
  if (!amazonAttributes || typeof amazonAttributes !== "object" || Array.isArray(amazonAttributes)) return;
  for (const [k, v] of Object.entries(amazonAttributes)) {
    if (!k || PRODUCT_DOCUMENT_CORE_KEYS.has(k)) continue;
    if (Object.prototype.hasOwnProperty.call(doc, k)) continue;
    const flat = flattenAttrValue(v);
    if (flat === null || flat === "") continue;
    doc[k] = flat;
  }
}

/**
 * @param {Record<string, unknown>} product
 * @returns {Record<string, unknown>}
 */
function getAmazonImports(product) {
  const ai = product.amazonImports;
  if (ai && typeof ai === "object" && !Array.isArray(ai)) return ai;
  return {};
}

module.exports = {
  PRODUCT_DOCUMENT_CORE_KEYS,
  flattenAmazonAttributesOntoDocument,
  getAmazonImports,
};
