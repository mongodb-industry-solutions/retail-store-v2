import { clientPromise, dbName } from "@/lib/mongodb";
import { flattenAmazonAttributesOntoDocument } from "@/lib/amazonImportShape";
import Anthropic from "@anthropic-ai/sdk";
import axios from "axios";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ─── Configuration (reuse same env vars as productEmbeddings/script.js) ──────

const VOYAGE_API_KEY = process.env.VOYAGE_AI_API_KEY;
const VOYAGE_API_URL = process.env.VOYAGE_API_URL || "https://ai.mongodb.com/v1/embeddings";
const VOYAGE_MODEL = process.env.VOYAGE_EMBEDDING_MODEL || "voyage-4";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const HAIKU_MODEL = process.env.HAIKU_MODEL || "claude-haiku-4-5-20251001";

// ─── CORS preflight ──────────────────────────────────────────────────────────

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ─── Image download helper ───────────────────────────────────────────────────

async function downloadImageAsBase64(url) {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      timeout: 10000,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ProductEnhancer/1.0)" },
    });
    const contentType = response.headers["content-type"] || "image/jpeg";
    const mediaType = contentType.split(";")[0].trim();
    const base64 = Buffer.from(response.data).toString("base64");
    return { base64, mediaType };
  } catch (error) {
    console.warn(`   ⚠️  Failed to download image: ${url} — ${error.message}`);
    return null;
  }
}

// ─── Seed category cache from existing products ─────────────────────────────

async function getCategoryCache(collection) {
  const masterCats = await collection.distinct("masterCategory");
  const subCats = await collection.distinct("subCategory");
  return {
    masterCategories: masterCats.filter(Boolean).map((c) => c.toLowerCase()),
    subCategories: subCats.filter(Boolean).map((c) => c.toLowerCase()),
  };
}

// ─── Anthropic LLM: Generate description + categories + attributes ──────────

function buildPrompt(product, categoryCache) {
  return `You are a product catalog specialist for an online retail store. Based on the product information and image provided, generate a comprehensive JSON response.

PRODUCT INFORMATION:
- Name: ${product.name}
- Brand: ${product.brand || "Unknown"}
- Amazon Category: ${product.amazonImports?.amazonCategory ?? product.amazonCategory ?? "Unknown"}
- Color: ${product.color || "Unknown"}
- Price: $${product.price?.amount || "Unknown"}
- Amazon Description Snippet: ${product.descriptionSnippet || "None available"}

EXISTING CATEGORIES ALREADY IN USE IN OUR CATALOG (prefer reusing these to maintain consistency):
Master Categories: ${categoryCache.masterCategories.join(", ") || "none yet"}
Sub-Categories: ${categoryCache.subCategories.join(", ") || "none yet"}

INSTRUCTIONS:

1. DESCRIPTION (100-200 words): Write a detailed, engaging product description that would help customers find this product through search. Describe the style, design, visible materials, color(s), patterns, use cases, and any notable features visible in the image. Write as if for a product listing page.

2. CATEGORIES: Choose the most appropriate masterCategory and subCategory for this product.
   - STRONGLY prefer reusing categories from the existing lists above to maintain catalog consistency.
   - Only create a new category if absolutely none of the existing ones are suitable.
   - All category values must be lowercase.

3. ARTICLE TYPE: Provide a specific article type (e.g. "jacket", "sneakers", "backpack", "watch", "t-shirt").

4. GENDER: Determine the target gender: "men", "women", "unisex", or "boys"/"girls" for kids.

5. BASE COLOUR: The primary/dominant color of the product.

6. ATTRIBUTES: Add category-specific attributes as appropriate:
   - For shoes/footwear: include "heelHeight" (one of: "flat", "low", "medium", "high") and "sizes" (array of UK sizes, e.g. ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"])
   - For bags/luggage: include "bagType" (one of: "backpack", "shoulder bag", "handbag", "tote", "crossbody", "clutch", "duffel", "messenger", "wallet", "pouch")
   - For clothing/apparel: include "material" (e.g. "cotton", "polyester", "wool", "silk", "denim", "leather", "linen", "synthetic blend") and "sizes" (array, e.g. ["XS", "S", "M", "L", "XL", "XXL"])
   - For accessories (watches, jewelry, sunglasses, etc.): include relevant attributes like "material" or specific type
   - For home/bath/lifestyle products: include relevant attributes like "material", "dimensions", or usage notes
   - Add any other attributes that seem genuinely relevant for the product category

RESPOND WITH ONLY VALID JSON (no markdown, no code fences):
{
  "description": "Your 100-200 word description here...",
  "masterCategory": "lowercase category",
  "subCategory": "lowercase sub-category",
  "articleType": "specific type",
  "gender": "men/women/unisex",
  "baseColour": "primary color",
  "attributes": {
    "key": "value or array"
  }
}`;
}

async function enhanceProductWithAI(product, anthropicClient, categoryCache) {
  const prompt = buildPrompt(product, categoryCache);
  const content = [];

  // Include the product image for vision analysis
  if (product.image?.url) {
    const imageData = await downloadImageAsBase64(product.image.url);
    if (imageData) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: imageData.mediaType,
          data: imageData.base64,
        },
      });
    }
  }

  content.push({ type: "text", text: prompt });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await anthropicClient.messages.create({
        model: HAIKU_MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content }],
      });

      let text = response.content[0].text.trim();
      if (text.startsWith("```")) {
        text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }

      const result = JSON.parse(text);

      if (!result.description || !result.masterCategory || !result.subCategory) {
        throw new Error("Missing required fields in LLM response");
      }

      result.masterCategory = result.masterCategory.toLowerCase();
      result.subCategory = result.subCategory.toLowerCase();

      return result;
    } catch (error) {
      const isRateLimit = error.status === 429;
      if (isRateLimit && attempt < 3) {
        const waitMs = Math.min(30000, 5000 * Math.pow(2, attempt - 1));
        console.warn(`   ⏳ Rate limited, retrying in ${waitMs / 1000}s...`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      console.error(`   ❌ LLM error for "${product.name}": ${error.message}`);
      return null;
    }
  }
  return null;
}

// ─── Voyage AI: Generate embedding ───────────────────────────────────────────

async function generateEmbeddings(texts) {
  try {
    const response = await axios.post(
      VOYAGE_API_URL,
      { model: VOYAGE_MODEL, input: texts },
      {
        headers: {
          Authorization: `Bearer ${VOYAGE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );
    return response.data.data.map((d) => d.embedding);
  } catch (error) {
    console.error(`❌ Voyage API error: ${error.response?.data?.detail || error.message}`);
    return null;
  }
}

// ─── Raw import: Amazon text only, no vision / no embeddings (pass 2 enriches) ─

function normalizeStringArray(v) {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x).trim()).filter(Boolean);
}

function buildRawSeedDescription(p) {
  const bullets = normalizeStringArray(p.amazonFeatureBullets);
  const desc = (p.amazonDescription || "").trim();
  const attrObj = p.amazonAttributes && typeof p.amazonAttributes === "object" && !Array.isArray(p.amazonAttributes) ? p.amazonAttributes : {};
  const attrLines = Object.entries(attrObj).map(([k, v]) => `${k}: ${v}`);
  const parts = [];
  if (bullets.length) parts.push("Features:\n- " + bullets.join("\n- "));
  if (desc) parts.push(desc);
  if (attrLines.length) parts.push("Details:\n" + attrLines.join("\n"));
  const combined = parts.join("\n\n").trim();
  return combined || (p.descriptionSnippet || "").trim() || "";
}

function buildRawImportDocuments(newProducts) {
  return newProducts.map((p) => {
    const bullets = normalizeStringArray(p.amazonFeatureBullets);
    const attrObj =
      p.amazonAttributes && typeof p.amazonAttributes === "object" && !Array.isArray(p.amazonAttributes) ? { ...p.amazonAttributes } : {};
    const breadcrumbs = normalizeStringArray(p.amazonBreadcrumbs);
    const seedDesc = buildRawSeedDescription(p);

    const amazonImports = {
      amazonAsin: p.asin,
      amazonRating: p.rating ?? null,
      amazonReviewCount: p.reviewCount ?? null,
      amazonUrl: p.productUrl || "",
      amazonCategory: p.category || "",
      amazonBreadcrumbs: breadcrumbs,
      amazonBreadcrumbPath: breadcrumbs.join(" > "),
      amazonAttributes: attrObj,
      amazonFeatureBullets: bullets,
      rawAmazonDescription: (p.amazonDescription || "").trim(),
      ...(p.pdpScrapeError ? { amazonPdpScrapeError: String(p.pdpScrapeError).slice(0, 500) } : {}),
    };

    const doc = {
      _id: new ObjectId(),
      name: (p.pdpTitle || p.title || "Untitled Product").trim(),
      brand: p.brand || "Unknown",
      price: {
        amount: p.price != null ? p.price : 0,
        currency: "USD",
      },
      image: {
        url: (p.pdpImageUrl || p.imageUrl || "").trim(),
      },
      masterCategory: "imported",
      subCategory: "amazon",
      articleType: "",
      description: seedDesc.slice(0, 50000),
      gender: "unisex",
      baseColour: p.color || "",
      color: p.color || "",
      amazonImports,
      enrichmentStatus: "pending_text_enrich",
      source: "amazon",
      importedAt: new Date(),
    };

    flattenAmazonAttributesOntoDocument(doc, attrObj);

    return doc;
  });
}

// ─── POST /api/amazon/import ─────────────────────────────────────────────────

export async function POST(request) {
  try {
    const body = await request.json();
    const { products, mode } = body;
    const isRaw = mode === "raw";

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "No products provided" }, { status: 400, headers: CORS_HEADERS });
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection("products");

    // ── Dedup by ASIN ──
    const asins = products.map((p) => p.asin).filter(Boolean);
    const existing = await collection
      .find(
        {
          $or: [{ amazonAsin: { $in: asins } }, { "amazonImports.amazonAsin": { $in: asins } }],
        },
        { projection: { amazonAsin: 1, "amazonImports.amazonAsin": 1 } }
      )
      .toArray();
    const existingAsins = new Set();
    for (const row of existing) {
      if (row.amazonAsin) existingAsins.add(row.amazonAsin);
      if (row.amazonImports?.amazonAsin) existingAsins.add(row.amazonImports.amazonAsin);
    }
    const newProducts = products.filter((p) => !existingAsins.has(p.asin));
    const skipped = products.length - newProducts.length;

    if (newProducts.length === 0) {
      return NextResponse.json(
        { imported: 0, skipped, total: products.length, importedProducts: [], message: "All products already exist in store", mode: isRaw ? "raw" : "full" },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // ── Raw two-pass import: no Anthropic; optional Voyage seed embeddings (same text formula as full import) ──
    if (isRaw) {
      const hasVoyageKey = !!VOYAGE_API_KEY;
      console.log(`\n${"═".repeat(60)}`);
      console.log(`[Amazon Import RAW] ${new Date().toISOString()} — ${newProducts.length} new (${skipped} skipped)`);
      const documents = buildRawImportDocuments(newProducts);
      const result = await collection.insertMany(documents);
      console.log(`   Inserted: ${result.insertedCount}`);

      let rawEmbeddingsOk = false;
      if (hasVoyageKey && documents.length > 0) {
        console.log(`   🔢 Seed embeddings (Voyage) for ${documents.length} product(s)...`);
        const batchSize = 20;
        for (let i = 0; i < documents.length; i += batchSize) {
          const batchDocs = documents.slice(i, i + batchSize);
          const texts = batchDocs.map((d) => {
            return `${d.name}. ${d.description} Brand: ${d.brand}. Category: ${d.masterCategory}/${d.subCategory}. Type: ${d.articleType || "Unknown"}.`;
          });
          const embeddings = await generateEmbeddings(texts);
          if (embeddings) {
            const ops = batchDocs.map((doc, idx) => ({
              updateOne: {
                filter: { _id: doc._id },
                update: { $set: { vai_4_embedding: embeddings[idx] } },
              },
            }));
            await collection.bulkWrite(ops);
            batchDocs.forEach((doc, idx) => {
              doc.vai_4_embedding = embeddings[idx];
            });
            rawEmbeddingsOk = true;
            console.log(`      ✅ Batch ${Math.floor(i / batchSize) + 1} (${batchDocs.length} vectors)`);
          } else {
            console.log(`      ❌ Embedding batch failed`);
          }
          if (i + batchSize < documents.length) {
            await new Promise((r) => setTimeout(r, 500));
          }
        }
      } else if (!hasVoyageKey) {
        console.log(`   ⚠️  No VOYAGE_AI_API_KEY — seed embeddings skipped (add key or run embed:amazon-raw)`);
      }

      console.log(`${"═".repeat(60)}\n`);

      const importedProducts = documents.map((d) => {
        const { vai_4_embedding, ...rest } = d;
        return {
          ...rest,
          _id: d._id.toString(),
          hasEmbedding: !!vai_4_embedding,
          embeddingDimensions: vai_4_embedding?.length || null,
        };
      });

      const embeddingsDone = rawEmbeddingsOk && documents.some((d) => d.vai_4_embedding);

      return NextResponse.json(
        {
          imported: newProducts.length,
          skipped,
          total: products.length,
          importedProducts,
          mode: "raw",
          enrichment: {
            aiDescriptions: false,
            embeddings: embeddingsDone,
            note: embeddingsDone
              ? "Seed embeddings saved. Run npm run enrich:amazon-text in microservices/productEmbeddings for Haiku categories (re-embeds after)."
              : hasVoyageKey
                ? "Embeddings failed or empty descriptions. Run npm run embed:amazon-raw to backfill, or enrich:amazon-text for pass 2."
                : "Add VOYAGE_AI_API_KEY for seed embeddings during import, or run npm run embed:amazon-raw / enrich:amazon-text.",
          },
        },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // ── Seed category cache ──
    const categoryCache = await getCategoryCache(collection);
    console.log(`\n${"═".repeat(60)}`);
    console.log(`[Amazon Import] ${new Date().toISOString()}`);
    console.log(`  Submitted: ${products.length} | New: ${newProducts.length} | Skipped (dedup): ${skipped}`);
    console.log(`  Category cache: ${categoryCache.masterCategories.length} master, ${categoryCache.subCategories.length} sub`);

    // ── Check if we have API keys for enrichment ──
    const hasAnthropicKey = !!ANTHROPIC_API_KEY;
    const hasVoyageKey = !!VOYAGE_API_KEY;

    let anthropicClient = null;
    if (hasAnthropicKey) {
      anthropicClient = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
      console.log(`  ✅ Anthropic API key found — will generate AI descriptions`);
    } else {
      console.log(`  ⚠️  No ANTHROPIC_API_KEY — descriptions will be basic`);
    }
    if (hasVoyageKey) {
      console.log(`  ✅ Voyage AI API key found — will generate embeddings`);
    } else {
      console.log(`  ⚠️  No VOYAGE_AI_API_KEY — embeddings will be skipped`);
    }
    console.log(`${"─".repeat(60)}`);

    // ── Phase 1: Build base documents + AI enhancement ──
    const documents = [];

    for (let i = 0; i < newProducts.length; i++) {
      const p = newProducts[i];
      const progress = `[${i + 1}/${newProducts.length}]`;

      const attrObj =
        p.amazonAttributes && typeof p.amazonAttributes === "object" && !Array.isArray(p.amazonAttributes) ? { ...p.amazonAttributes } : {};
      const breadcrumbs = normalizeStringArray(p.amazonBreadcrumbs);
      const amazonImports = {
        amazonAsin: p.asin,
        amazonRating: p.rating ?? null,
        amazonReviewCount: p.reviewCount ?? null,
        amazonUrl: p.productUrl || "",
        amazonCategory: p.category || "",
        amazonBreadcrumbs: breadcrumbs,
        amazonBreadcrumbPath: breadcrumbs.join(" > "),
        amazonAttributes: attrObj,
        amazonFeatureBullets: normalizeStringArray(p.amazonFeatureBullets),
        rawAmazonDescription: (p.amazonDescription || "").trim(),
      };

      // Build base document
      const doc = {
        _id: new ObjectId(),
        name: p.title || "Untitled Product",
        brand: p.brand || "Unknown",
        price: {
          amount: p.price != null ? p.price : 0,
          currency: "USD",
        },
        image: {
          url: p.imageUrl || "",
        },
        masterCategory: "imported",
        subCategory: "amazon",
        articleType: "",
        description: p.descriptionSnippet || "",
        gender: "unisex",
        baseColour: p.color || "",
        color: p.color || "",
        amazonImports,
        source: "amazon",
        importedAt: new Date(),
      };

      flattenAmazonAttributesOntoDocument(doc, attrObj);

      // AI enhancement with Anthropic (if available)
      if (anthropicClient) {
        console.log(`${progress} 🤖 Enhancing: "${p.title?.substring(0, 60)}..."`);
        const enhancement = await enhanceProductWithAI(doc, anthropicClient, categoryCache);

        if (enhancement) {
          doc.description = enhancement.description;
          doc.masterCategory = enhancement.masterCategory;
          doc.subCategory = enhancement.subCategory;
          doc.articleType = enhancement.articleType || "";
          doc.gender = enhancement.gender || "unisex";
          doc.baseColour = enhancement.baseColour || doc.baseColour;

          // Add category-specific attributes
          if (enhancement.attributes && typeof enhancement.attributes === "object") {
            for (const [key, value] of Object.entries(enhancement.attributes)) {
              doc[key] = value;
            }
          }

          // Update category cache for subsequent products
          if (enhancement.masterCategory) {
            const mc = enhancement.masterCategory.toLowerCase();
            if (!categoryCache.masterCategories.includes(mc)) {
              categoryCache.masterCategories.push(mc);
            }
          }
          if (enhancement.subCategory) {
            const sc = enhancement.subCategory.toLowerCase();
            if (!categoryCache.subCategories.includes(sc)) {
              categoryCache.subCategories.push(sc);
            }
          }

          doc.lastUpdatedAt = new Date();
          console.log(`   ✅ ${doc.masterCategory}/${doc.subCategory} — ${doc.description.substring(0, 60)}...`);
        } else {
          console.log(`   ⚠️  AI enhancement failed, using basic data`);
        }
      } else {
        console.log(`${progress} 📦 Basic import: "${p.title?.substring(0, 60)}..."`);
      }

      documents.push(doc);
    }

    // ── Phase 2: Generate embeddings (Voyage AI) ──
    if (hasVoyageKey && documents.length > 0) {
      console.log(`\n🔢 Generating embeddings for ${documents.length} products...`);

      // Build embedding text (same format as productEmbeddings/script.js)
      const texts = documents.map((d) => {
        return `${d.name}. ${d.description} Brand: ${d.brand}. Category: ${d.masterCategory}/${d.subCategory}. Type: ${d.articleType || "Unknown"}.`;
      });

      // Process in batches of 20
      const batchSize = 20;
      for (let i = 0; i < texts.length; i += batchSize) {
        const batchTexts = texts.slice(i, i + batchSize);
        const batchDocs = documents.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(texts.length / batchSize);

        console.log(`   📦 Embedding batch ${batchNum}/${totalBatches} (${batchTexts.length} products)`);

        const embeddings = await generateEmbeddings(batchTexts);
        if (embeddings) {
          batchDocs.forEach((doc, idx) => {
            doc.vai_4_embedding = embeddings[idx];
          });
          console.log(`   ✅ Saved ${batchTexts.length} embeddings (${embeddings[0]?.length} dimensions)`);
        } else {
          console.log(`   ❌ Embedding batch failed`);
        }

        // Small delay between batches
        if (i + batchSize < texts.length) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }

    // ── Phase 3: Insert into MongoDB ──
    const result = await collection.insertMany(documents);

    // ── Detailed logging ──
    console.log(`\n${"─".repeat(60)}`);
    console.log(`📊 IMPORT COMPLETE`);
    console.log(`   Inserted: ${result.insertedCount} | Skipped: ${skipped} | Total: ${products.length}`);
    documents.forEach((d, i) => {
      console.log(`  [${i + 1}] _id: ${d._id}`);
      console.log(`       name: ${d.name}`);
      console.log(`       brand: ${d.brand} | price: $${d.price.amount} ${d.price.currency}`);
      console.log(`       category: ${d.masterCategory} > ${d.subCategory} | type: ${d.articleType}`);
      console.log(`       gender: ${d.gender} | color: ${d.baseColour || "N/A"}`);
      console.log(`       asin: ${d.amazonImports?.amazonAsin ?? d.amazonAsin}`);
      console.log(`       description: ${d.description?.substring(0, 80)}...`);
      console.log(`       embedding: ${d.vai_4_embedding ? `✅ ${d.vai_4_embedding.length} dims` : "❌ none"}`);
      // Log any extra attributes
      const extraKeys = Object.keys(d).filter(
        (k) =>
          ![
            "_id", "name", "brand", "price", "image", "masterCategory", "subCategory",
            "articleType", "description", "gender", "baseColour", "color", "amazonImports",
            "amazonAsin", "amazonRating", "amazonReviewCount", "amazonUrl", "amazonCategory", "source",
            "importedAt", "lastUpdatedAt", "vai_4_embedding",
          ].includes(k)
      );
      if (extraKeys.length > 0) {
        console.log(`       attributes: ${extraKeys.map((k) => `${k}=${JSON.stringify(d[k])}`).join(", ")}`);
      }
    });
    console.log(`${"═".repeat(60)}\n`);

    // Build response with full product details (excluding embedding for transfer size)
    const importedProducts = documents.map((d) => {
      const { vai_4_embedding, ...rest } = d;
      return {
        ...rest,
        _id: d._id.toString(),
        hasEmbedding: !!vai_4_embedding,
        embeddingDimensions: vai_4_embedding?.length || null,
      };
    });

    return NextResponse.json(
      {
        imported: newProducts.length,
        skipped,
        total: products.length,
        importedProducts,
        mode: "full",
        enrichment: {
          aiDescriptions: hasAnthropicKey,
          embeddings: hasVoyageKey,
        },
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("[Amazon Import] Error:", error);
    return NextResponse.json(
      { error: "Failed to import products: " + error.message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
