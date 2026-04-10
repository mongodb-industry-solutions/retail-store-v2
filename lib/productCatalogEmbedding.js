import axios from "axios";

/**
 * Same text formula as microservices/productEmbeddings/script.js and Amazon import.
 * @param {Record<string, unknown>} p
 */
export function catalogProductEmbeddingText(p) {
  const name = typeof p.name === "string" ? p.name : "";
  const desc = typeof p.description === "string" ? p.description : "";
  const brand =
    p.brand != null && String(p.brand).trim() ? String(p.brand) : "Unknown";
  const mc =
    p.masterCategory != null ? String(p.masterCategory) : "uncategorized";
  const sc = p.subCategory != null ? String(p.subCategory) : "general";
  const at =
    p.articleType != null && String(p.articleType).trim()
      ? String(p.articleType)
      : "Unknown";
  return `${name}. ${desc} Brand: ${brand}. Category: ${mc}/${sc}. Type: ${at}.`;
}

/**
 * @param {string[]} texts
 * @returns {Promise<number[][]|null>}
 */
async function voyageEmbedTexts(texts) {
  const key = process.env.VOYAGE_AI_API_KEY;
  if (!key || !texts.length) return null;

  const url =
    process.env.VOYAGE_API_URL || "https://ai.mongodb.com/v1/embeddings";
  const model =
    process.env.VOYAGE_EMBEDDING_MODEL ||
    process.env.EMBEDDING_MODEL ||
    "voyage-4";

  try {
    const response = await axios.post(
      url,
      { model, input: texts },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    return response.data.data.map((d) => d.embedding);
  } catch (e) {
    console.error(
      "[catalog embedding] Voyage error:",
      e.response?.data?.detail || e.message
    );
    return null;
  }
}

/**
 * Writes `vai_4_embedding` from the current document fields (matches vector search pipeline).
 * @param {import("mongodb").Collection} collection
 * @param {import("mongodb").WithId<import("mongodb").Document>|null} doc
 * @returns {Promise<{ ok: true } | { ok: false; reason: string }>}
 */
export async function syncProductEmbeddingFromDoc(collection, doc) {
  if (!doc?._id) {
    return { ok: false, reason: "invalid_doc" };
  }
  if (!process.env.VOYAGE_AI_API_KEY) {
    console.warn(
      "[catalog embedding] VOYAGE_AI_API_KEY not set; vector not updated"
    );
    return { ok: false, reason: "no_api_key" };
  }

  const text = catalogProductEmbeddingText(doc);
  const embeddings = await voyageEmbedTexts([text]);
  if (!embeddings?.[0]) {
    return { ok: false, reason: "voyage_failed" };
  }

  await collection.updateOne(
    { _id: doc._id },
    { $set: { vai_4_embedding: embeddings[0] } }
  );
  return { ok: true };
}
