/**
 * Pass 2 for Amazon raw imports: text-only Haiku (no images) maps categories and
 * normalizes description from Amazon breadcrumbs, bullets, attributes, and PDP text.
 * Then batches Voyage embeddings (same text formula as script.js).
 *
 * Prerequisite: products inserted with enrichmentStatus: "pending_text_enrich" (mode: raw import).
 *
 * Usage (from this directory, with .env):
 *   node enrichAmazonText.js
 *
 * Env (see EXAMPLE.env): MONGO_URI, DB_NAME, COL_NAME, ANTHROPIC_API_KEY, VOYAGE_AI_API_KEY,
 * HAIKU_MODEL, EMBEDDING_MODEL, VOYAGE_API_URL, CONCURRENCY, VOYAGE_BATCH_SIZE
 * Optional: AMAZON_TEXT_ENRICH_LIMIT=n to process only n products
 * Optional: --text-only  Haiku only (no Voyage; skips embedding phases)
 *
 * Seed embeddings only (no Haiku; for raw-imported rows still pending_text_enrich):
 *   node enrichAmazonText.js --seed-embed-only
 *   Requires: MONGO_URI, DB_NAME, COL_NAME, VOYAGE_AI_API_KEY
 */

const path = require('path');
const { MongoClient } = require('mongodb');
const Anthropic = require('@anthropic-ai/sdk').default;
const axios = require('axios');
const dotenv = require('dotenv');
const { getAmazonImports } = require(path.join(__dirname, '../../lib/amazonImportShape.js'));

dotenv.config({ override: true });

const CONFIG = {
  mongoUri: process.env.MONGO_URI,
  dbName: process.env.DB_NAME,
  colName: process.env.COL_NAME,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  voyageApiKey: process.env.VOYAGE_AI_API_KEY,
  voyageApiUrl: process.env.VOYAGE_API_URL || 'https://ai.mongodb.com/v1/embeddings',
  embeddingModel: process.env.EMBEDDING_MODEL || 'voyage-4',
  haikuModel: process.env.HAIKU_MODEL || 'claude-3-5-haiku-20241022',
  concurrency: parseInt(process.env.CONCURRENCY || '2', 10),
  voyageBatchSize: parseInt(process.env.VOYAGE_BATCH_SIZE || '20', 10),
  limit: process.env.AMAZON_TEXT_ENRICH_LIMIT
    ? parseInt(process.env.AMAZON_TEXT_ENRICH_LIMIT, 10)
    : null,
};

let mongoClient;
let anthropic;
let embeddingDimensions = null;

const categoryCache = {
  masterCategories: new Set(),
  subCategories: new Set(),
};

async function getCollection() {
  if (!mongoClient) {
    mongoClient = new MongoClient(CONFIG.mongoUri);
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB');
  }
  return mongoClient.db(CONFIG.dbName).collection(CONFIG.colName);
}

async function seedCategoryCache() {
  const collection = await getCollection();
  const masterCats = await collection.distinct('masterCategory');
  const subCats = await collection.distinct('subCategory');
  masterCats.forEach((c) => {
    if (c) categoryCache.masterCategories.add(c.toLowerCase());
  });
  subCats.forEach((c) => {
    if (c) categoryCache.subCategories.add(c.toLowerCase());
  });
  console.log(
    `📂 Category cache: ${categoryCache.masterCategories.size} master, ${categoryCache.subCategories.size} sub`
  );
}

function updateCategoryCache(masterCategory, subCategory) {
  if (masterCategory) categoryCache.masterCategories.add(masterCategory.toLowerCase());
  if (subCategory) categoryCache.subCategories.add(subCategory.toLowerCase());
}

function buildAmazonTextPrompt(product) {
  const ai = getAmazonImports(product);
  const crumbs =
    ai.amazonBreadcrumbPath ||
    product.amazonBreadcrumbPath ||
    (Array.isArray(ai.amazonBreadcrumbs) ? ai.amazonBreadcrumbs.join(' > ') : '') ||
    (Array.isArray(product.amazonBreadcrumbs) ? product.amazonBreadcrumbs.join(' > ') : '') ||
    'Unknown';
  const attrs = JSON.stringify(ai.amazonAttributes || product.amazonAttributes || {});
  const bullets = (ai.amazonFeatureBullets || product.amazonFeatureBullets || [])
    .map((b) => String(b).trim())
    .filter(Boolean);
  const bulletBlock = bullets.length ? bullets.map((b) => `- ${b}`).join('\n') : '(none)';
  const raw = String(ai.rawAmazonDescription || product.rawAmazonDescription || '').slice(0, 8000);
  const currentDesc = String(product.description || '').slice(0, 8000);

  return `You are a catalog specialist. Map this Amazon-sourced product into our store schema using ONLY the text below (no images).

PRODUCT:
- Name: ${product.name}
- Brand: ${product.brand || 'Unknown'}
- Search department (weak signal): ${ai.amazonCategory || product.amazonCategory || 'Unknown'}
- Amazon breadcrumb path: ${crumbs}
- Amazon feature bullets:
${bulletBlock}
- Amazon product description excerpt:
${raw || '(none)'}
- Current combined description in DB:
${currentDesc || '(none)'}
- Amazon attributes (JSON): ${attrs}

EXISTING CATEGORIES IN OUR CATALOG (reuse when possible; all lowercase):
Master: ${[...categoryCache.masterCategories].join(', ') || 'none yet'}
Sub: ${[...categoryCache.subCategories].join(', ') || 'none yet'}

TASK:
1. Write a clear 100-200 word store description for customers (synthesize from Amazon text; do not invent specifications not implied by the text).
2. Pick masterCategory and subCategory from the lists when possible; only create new lowercase categories if nothing fits.
3. articleType: specific noun (e.g. keyboard, jacket, kettle).
4. gender: one of men, women, unisex, boys, girls.
5. baseColour: primary color, or "multicolor", or "unknown".
6. attributes: extra category-specific fields when relevant (e.g. sizes, heelHeight, bagType). Amazon PDP labels are already stored on the product document root — do not duplicate them here unless you are normalizing into lowercase catalog keys (material, color, etc.).

RESPOND WITH ONLY VALID JSON (no markdown):
{
  "description": "...",
  "masterCategory": "...",
  "subCategory": "...",
  "articleType": "...",
  "gender": "...",
  "baseColour": "...",
  "attributes": {}
}`;
}

async function enhanceAmazonProductText(product, maxRetries = 3) {
  const prompt = buildAmazonTextPrompt(product);
  const content = [{ type: 'text', text: prompt }];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: CONFIG.haikuModel,
        max_tokens: 1200,
        messages: [{ role: 'user', content }],
      });

      let text = response.content[0].text.trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      const result = JSON.parse(text);

      if (!result.description || !result.masterCategory || !result.subCategory) {
        throw new Error('Missing required fields in LLM response');
      }

      result.masterCategory = result.masterCategory.toLowerCase();
      result.subCategory = result.subCategory.toLowerCase();

      return result;
    } catch (error) {
      const isRateLimit = error.status === 429 || error.message?.includes('rate_limit');
      if (isRateLimit && attempt < maxRetries) {
        const retryAfterMs =
          (error.headers?.['retry-after'] ? parseInt(error.headers['retry-after'], 10) * 1000 : null) ||
          Math.min(30000, 5000 * 2 ** (attempt - 1));
        console.warn(`   ⏳ Rate limited, retrying in ${retryAfterMs / 1000}s...`);
        await new Promise((r) => setTimeout(r, retryAfterMs));
        continue;
      }
      console.error(`   ❌ LLM error for "${product.name}": ${error.message}`);
      return null;
    }
  }
  return null;
}

async function processWithConcurrency(items, fn, concurrency) {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const i = index++;
      await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
}

async function generateEmbeddingsBatch(texts) {
  try {
    const response = await axios.post(
      CONFIG.voyageApiUrl,
      { model: CONFIG.embeddingModel, input: texts },
      {
        headers: {
          Authorization: `Bearer ${CONFIG.voyageApiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
    const embeddings = response.data.data.map((d) => d.embedding);
    if (!embeddingDimensions && embeddings.length > 0) {
      embeddingDimensions = embeddings[0].length;
      console.log(`📐 Embedding dimensions: ${embeddingDimensions}`);
    }
    return embeddings;
  } catch (error) {
    console.error(`❌ Voyage API error: ${error.response?.data?.detail || error.message}`);
    return null;
  }
}

async function batchEmbedProducts(products, phaseLabel) {
  if (!products.length) {
    return { success: 0, fail: 0 };
  }

  const collection = await getCollection();
  const batchSize = CONFIG.voyageBatchSize;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(products.length / batchSize);
    console.log(`📦 ${phaseLabel} batch ${batchNum}/${totalBatches} (${batch.length})`);

    const texts = batch.map(embeddingTextForProduct);
    const embeddings = await generateEmbeddingsBatch(texts);
    if (embeddings) {
      const bulkOps = batch.map((product, idx) => ({
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { vai_4_embedding: embeddings[idx] } },
        },
      }));
      await collection.bulkWrite(bulkOps);
      successCount += batch.length;
      console.log(`   ✅ Saved ${batch.length} embeddings`);
    } else {
      failCount += batch.length;
      console.log('   ❌ Batch failed');
    }

    if (i + batchSize < products.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`\n📊 ${phaseLabel}: ${successCount} ok, ${failCount} failed`);
  return { success: successCount, fail: failCount };
}

/** Re-load products by _id and embed (covers this run’s Haiku updates immediately). */
async function embedProductsByIds(ids, phaseLabel) {
  if (!ids.length) return { success: 0, fail: 0 };
  const collection = await getCollection();
  const unique = [...new Map(ids.map((id) => [id.toString(), id])).values()];
  const products = await collection
    .find({
      _id: { $in: unique },
      description: { $exists: true, $ne: '' },
    })
    .toArray();
  if (!products.length) {
    console.log(`\n⚠️  ${phaseLabel}: no documents to embed (missing descriptions?)`);
    return { success: 0, fail: 0 };
  }
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🔢 ${phaseLabel} (${products.length} product(s))`);
  console.log('═'.repeat(60));
  return batchEmbedProducts(products, phaseLabel);
}

async function phaseTextEnrich() {
  console.log('\n' + '═'.repeat(60));
  console.log('📝 Amazon text enrich (Haiku, no images)');
  console.log('═'.repeat(60));

  const collection = await getCollection();
  let cursor = collection.find({ enrichmentStatus: 'pending_text_enrich' });
  let products = await cursor.toArray();
  if (CONFIG.limit != null && CONFIG.limit > 0) {
    products = products.slice(0, CONFIG.limit);
  }

  if (products.length === 0) {
    console.log('✅ No products with enrichmentStatus: pending_text_enrich');
    return [];
  }

  console.log(`📦 Processing ${products.length} product(s)\n`);

  let ok = 0;
  let fail = 0;
  const enrichedThisRun = [];

  await processWithConcurrency(
    products,
    async (product, idx) => {
      const progress = `[${idx + 1}/${products.length}]`;
      console.log(`${progress} "${product.name}" (${product._id})`);

      const enhancement = await enhanceAmazonProductText(product);
      if (!enhancement) {
        fail++;
        return;
      }

      const update = {
        $set: {
          description: enhancement.description,
          masterCategory: enhancement.masterCategory,
          subCategory: enhancement.subCategory,
          articleType: enhancement.articleType || '',
          gender: enhancement.gender || product.gender || 'unisex',
          baseColour: enhancement.baseColour || product.baseColour || '',
          lastUpdatedAt: new Date(),
          amazonTextEnrichedAt: new Date(),
        },
        $unset: { enrichmentStatus: '', vai_4_embedding: '' },
      };

      if (enhancement.attributes && typeof enhancement.attributes === 'object') {
        for (const [key, value] of Object.entries(enhancement.attributes)) {
          update.$set[key] = value;
        }
      }

      await collection.updateOne({ _id: product._id }, update);
      enrichedThisRun.push(product._id);
      updateCategoryCache(enhancement.masterCategory, enhancement.subCategory);
      ok++;
      console.log(`   ✅ ${enhancement.masterCategory}/${enhancement.subCategory}`);
    },
    CONFIG.concurrency
  );

  console.log(`\n📊 Text enrich: ${ok} ok, ${fail} failed`);
  return enrichedThisRun;
}

/** Backfill: any amazon-text-enriched row still missing a vector (e.g. prior interrupted run). */
async function phaseEmbeddingsForUpdated() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔢 Embeddings backfill (amazonTextEnrichedAt, no vector yet)');
  console.log('═'.repeat(60));

  const collection = await getCollection();
  const products = await collection
    .find({
      amazonTextEnrichedAt: { $exists: true },
      vai_4_embedding: { $exists: false },
      description: { $exists: true, $ne: '' },
    })
    .toArray();

  if (products.length === 0) {
    console.log('✅ Nothing pending for backfill');
    return;
  }

  console.log(`📦 ${products.length} product(s)\n`);
  await batchEmbedProducts(products, 'Backfill');
}

function embeddingTextForProduct(p) {
  return `${p.name}. ${p.description} Brand: ${p.brand || 'Unknown'}. Category: ${p.masterCategory}/${p.subCategory}. Type: ${p.articleType || 'Unknown'}.`;
}

/** Raw bulk rows: pending Haiku but missing vectors — Voyage only (no ANTHROPIC_API_KEY). */
async function phaseSeedEmbeddingsForRawPending() {
  if (!CONFIG.voyageApiKey) throw new Error('VOYAGE_AI_API_KEY is required for --seed-embed-only');

  console.log('\n' + '═'.repeat(60));
  console.log('🔢 Seed embeddings for raw Amazon imports (pending_text_enrich, no vector yet)');
  console.log('═'.repeat(60));

  const collection = await getCollection();
  let products = await collection
    .find({
      enrichmentStatus: 'pending_text_enrich',
      vai_4_embedding: { $exists: false },
      description: { $exists: true, $ne: '' },
    })
    .toArray();

  if (CONFIG.limit != null && CONFIG.limit > 0) {
    products = products.slice(0, CONFIG.limit);
  }

  if (products.length === 0) {
    console.log('✅ No matching products (all have embeddings or empty description)');
    return;
  }

  console.log(`📦 ${products.length} product(s)\n`);
  await batchEmbedProducts(products, 'Seed embed');
}

async function main() {
  const seedEmbedOnly = process.argv.includes('--seed-embed-only');
  const textOnly = process.argv.includes('--text-only');

  console.log('🚀 enrichAmazonText.js — Amazon pass 2');
  console.log('─'.repeat(60));
  console.log(`DB: ${CONFIG.dbName}.${CONFIG.colName}`);
  if (!seedEmbedOnly) console.log(`Model: ${CONFIG.haikuModel}`);
  if (CONFIG.limit) console.log(`Limit: ${CONFIG.limit}`);
  if (!seedEmbedOnly && !textOnly) {
    console.log('Embeddings: Voyage (after each Haiku batch + backfill)');
  } else if (textOnly) {
    console.log('Embeddings: skipped (--text-only)');
  }
  console.log('─'.repeat(60));

  if (!CONFIG.mongoUri) throw new Error('MONGO_URI is required');
  if (!CONFIG.dbName) throw new Error('DB_NAME is required');
  if (!CONFIG.colName) throw new Error('COL_NAME is required');

  if (seedEmbedOnly) {
    try {
      await phaseSeedEmbeddingsForRawPending();
      console.log('\n✅ --seed-embed-only finished');
    } finally {
      if (mongoClient) {
        await mongoClient.close();
        console.log('🔌 MongoDB closed');
      }
    }
    return;
  }

  if (!CONFIG.anthropicApiKey) throw new Error('ANTHROPIC_API_KEY is required');
  if (!textOnly && !CONFIG.voyageApiKey) {
    throw new Error(
      'VOYAGE_AI_API_KEY is required to generate embeddings after Haiku. Set the key, or pass --text-only to run Haiku only.'
    );
  }

  anthropic = new Anthropic({ apiKey: CONFIG.anthropicApiKey });

  try {
    await seedCategoryCache();
    const enrichedIds = await phaseTextEnrich();

    if (!textOnly && CONFIG.voyageApiKey) {
      await embedProductsByIds(enrichedIds, 'Embeddings for this run (Haiku batch)');
      await phaseEmbeddingsForUpdated();
    }

    console.log('\n✅ enrichAmazonText.js finished');
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('🔌 MongoDB closed');
    }
  }
}

main().catch(console.error);
