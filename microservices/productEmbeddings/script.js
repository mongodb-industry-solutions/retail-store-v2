/**
 * Product Enhancement Pipeline
 * 
 * This script enhances product documents in MongoDB with:
 * 1. AI-generated descriptions (Anthropic Claude Haiku + vision)
 * 2. Corrected masterCategory / subCategory using a shared category cache
 * 3. Category-specific attributes (sizes, material, heelHeight, bagType, etc.)
 * 4. Vector embeddings for semantic search (Voyage AI)
 * 5. Atlas Search indexes (vector + text)
 * 
 * Resumable: processes only documents missing `lastUpdatedAt` (phase 1) or `vai_4_embedding` (phase 2).
 * Run periodically to process new/updated products.
 */

const { MongoClient } = require('mongodb');
const Anthropic = require('@anthropic-ai/sdk').default;
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ override: true });

// ─── Configuration ───────────────────────────────────────────────────────────

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
  vectorIndexName: process.env.VECTOR_INDEX_NAME || 'vector_index',
  textIndexName: process.env.TEXT_INDEX_NAME || 'text_search_index',
};

// ─── Globals ─────────────────────────────────────────────────────────────────

let mongoClient;
let anthropic;
const categoryCache = {
  masterCategories: new Set(),
  subCategories: new Set(),
};
let embeddingDimensions = null; // will be inferred from first response

// ─── MongoDB ─────────────────────────────────────────────────────────────────

async function getDb() {
  if (!mongoClient) {
    mongoClient = new MongoClient(CONFIG.mongoUri);
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB');
  }
  return mongoClient.db(CONFIG.dbName);
}

async function getCollection() {
  const db = await getDb();
  return db.collection(CONFIG.colName);
}

// ─── Category Cache ──────────────────────────────────────────────────────────

async function seedCategoryCache() {
  const collection = await getCollection();
  
  const masterCats = await collection.distinct('masterCategory');
  const subCats = await collection.distinct('subCategory');
  
  masterCats.forEach(c => {
    if (c) categoryCache.masterCategories.add(c.toLowerCase());
  });
  subCats.forEach(c => {
    if (c) categoryCache.subCategories.add(c.toLowerCase());
  });
  
  console.log(`📂 Category cache seeded: ${categoryCache.masterCategories.size} master, ${categoryCache.subCategories.size} sub`);
  console.log(`   Master: ${[...categoryCache.masterCategories].join(', ')}`);
  console.log(`   Sub: ${[...categoryCache.subCategories].join(', ')}`);
}

function updateCategoryCache(masterCategory, subCategory) {
  if (masterCategory) categoryCache.masterCategories.add(masterCategory.toLowerCase());
  if (subCategory) categoryCache.subCategories.add(subCategory.toLowerCase());
}

// ─── Image Processing ────────────────────────────────────────────────────────

async function downloadImageAsBase64(url, timeoutMs = 10000) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProductEnhancer/1.0)',
      },
    });
    
    const contentType = response.headers['content-type'] || 'image/jpeg';
    const mediaType = contentType.split(';')[0].trim();
    const base64 = Buffer.from(response.data).toString('base64');
    
    return { base64, mediaType };
  } catch (error) {
    console.warn(`   ⚠️  Failed to download image: ${url} — ${error.message}`);
    return null;
  }
}

// ─── Anthropic LLM Call ──────────────────────────────────────────────────────

function buildPrompt(product) {
  return `You are a product catalog specialist for an online retail store. Based on the product information and image provided, generate a comprehensive JSON response.

PRODUCT INFORMATION:
- Name: ${product.name}
- Brand: ${product.brand || 'Unknown'}
- Gender: ${product.gender || 'Unisex'}
- Current Master Category: "${product.masterCategory}" (this may be inaccurate — use it only as a loose reference)
- Current Sub-Category: "${product.subCategory}" (this may be inaccurate — use it only as a loose reference)
- Article Type: ${product.articleType || 'Unknown'}

EXISTING CATEGORIES ALREADY IN USE IN OUR CATALOG (prefer reusing these to maintain consistency):
Master Categories: ${[...categoryCache.masterCategories].join(', ') || 'none yet'}
Sub-Categories: ${[...categoryCache.subCategories].join(', ') || 'none yet'}

INSTRUCTIONS:

1. DESCRIPTION (100-200 words): Write a detailed, engaging product description that would help customers find this product through search. Describe the style, design, visible materials, color(s), patterns, use cases, and any notable features visible in the image. Write as if for a product listing page.

2. CATEGORIES: Choose the most appropriate masterCategory and subCategory for this product.
   - STRONGLY prefer reusing categories from the existing lists above to maintain catalog consistency.
   - Only create a new category if absolutely none of the existing ones are suitable.
   - All category values must be lowercase.

3. ATTRIBUTES: Add category-specific attributes as appropriate:
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
  "attributes": {
    "key": "value or array"
  }
}`;
}

async function generateProductEnhancement(product, maxRetries = 3) {
  const prompt = buildPrompt(product);
  
  // Build message content
  const content = [];
  
  // Try to include the product image
  if (product.image?.url) {
    const imageData = await downloadImageAsBase64(product.image.url);
    if (imageData) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageData.mediaType,
          data: imageData.base64,
        },
      });
    }
  }
  
  content.push({ type: 'text', text: prompt });
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: CONFIG.haikuModel,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
      });
      
      const text = response.content[0].text.trim();
      
      // Parse JSON — handle potential markdown code fences
      let jsonText = text;
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      
      const result = JSON.parse(jsonText);
      
      // Validate required fields
      if (!result.description || !result.masterCategory || !result.subCategory) {
        throw new Error('Missing required fields in LLM response');
      }
      
      // Normalize categories to lowercase
      result.masterCategory = result.masterCategory.toLowerCase();
      result.subCategory = result.subCategory.toLowerCase();
      
      return result;
    } catch (error) {
      const isRateLimit = error.status === 429 || error.message?.includes('rate_limit');
      
      if (isRateLimit && attempt < maxRetries) {
        // Extract retry-after header or use exponential backoff
        const retryAfterMs = (error.headers?.['retry-after'] ? parseInt(error.headers['retry-after']) * 1000 : null)
          || Math.min(30000, 5000 * Math.pow(2, attempt - 1));
        console.warn(`   ⏳ Rate limited, retrying in ${retryAfterMs / 1000}s (attempt ${attempt}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryAfterMs));
        continue;
      }
      
      console.error(`   ❌ LLM error for "${product.name}": ${error.status || ''} ${error.message}`);
      return null;
    }
  }
  return null;
}

// ─── Voyage AI Embeddings ────────────────────────────────────────────────────

async function generateEmbeddingsBatch(texts) {
  try {
    const response = await axios.post(CONFIG.voyageApiUrl, {
      model: CONFIG.embeddingModel,
      input: texts,
    }, {
      headers: {
        'Authorization': `Bearer ${CONFIG.voyageApiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    
    const embeddings = response.data.data.map(d => d.embedding);
    
    // Infer dimensions from first response
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

// ─── Concurrency Helper ──────────────────────────────────────────────────────

async function processWithConcurrency(items, fn, concurrency) {
  const results = [];
  let index = 0;
  
  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await fn(items[currentIndex], currentIndex);
    }
  }
  
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

// ─── Phase 1: Description Generation + Category Fixes + Attributes ──────────

async function phase1_enhanceProducts() {
  console.log('\n' + '═'.repeat(60));
  console.log('📝 PHASE 1: Generate Descriptions + Fix Categories + Add Attributes');
  console.log('═'.repeat(60));
  
  const collection = await getCollection();
  
  // Find products that haven't been enhanced yet
  const products = await collection.find({
    lastUpdatedAt: { $exists: false },
  }).toArray();
  
  if (products.length === 0) {
    console.log('✅ All products already have descriptions. Skipping Phase 1.');
    return;
  }
  
  console.log(`📦 Found ${products.length} products to enhance.\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  await processWithConcurrency(products, async (product, idx) => {
    const progress = `[${idx + 1}/${products.length}]`;
    console.log(`${progress} Processing: "${product.name}" (${product._id})`);
    
    const enhancement = await generateProductEnhancement(product);
    
    if (enhancement) {
      // Build the update
      const update = {
        $set: {
          description: enhancement.description,
          masterCategory: enhancement.masterCategory,
          subCategory: enhancement.subCategory,
          lastUpdatedAt: new Date(),
        },
      };
      
      // Add attributes if present
      if (enhancement.attributes && Object.keys(enhancement.attributes).length > 0) {
        for (const [key, value] of Object.entries(enhancement.attributes)) {
          update.$set[key] = value;
        }
      }
      
      // Remove the old embedding since description changed
      update.$unset = { vai_4_embedding: '' };
      
      await collection.updateOne({ _id: product._id }, update);
      
      // Update category cache
      updateCategoryCache(enhancement.masterCategory, enhancement.subCategory);
      
      successCount++;
      console.log(`   ✅ Done — cat: ${enhancement.masterCategory}/${enhancement.subCategory}, desc: ${enhancement.description.substring(0, 60)}...`);
    } else {
      failCount++;
    }
  }, CONFIG.concurrency);
  
  console.log(`\n📊 Phase 1 Results: ${successCount} success, ${failCount} failed out of ${products.length} total`);
}

// ─── Phase 2: Embedding Generation ──────────────────────────────────────────

async function phase2_generateEmbeddings() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔢 PHASE 2: Generate Vector Embeddings (Voyage AI)');
  console.log('═'.repeat(60));
  
  const collection = await getCollection();
  
  // Find products with descriptions but no embeddings
  const products = await collection.find({
    description: { $exists: true, $ne: '' },
    vai_4_embedding: { $exists: false },
  }).toArray();
  
  if (products.length === 0) {
    console.log('✅ All products already have embeddings. Skipping Phase 2.');
    return;
  }
  
  console.log(`📦 Found ${products.length} products needing embeddings.\n`);
  
  // Process in batches
  const batchSize = CONFIG.voyageBatchSize;
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(products.length / batchSize);
    
    console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} products)`);
    
    // Build text to embed: description + name + category info
    const texts = batch.map(p => {
      return `${p.name}. ${p.description} Brand: ${p.brand || 'Unknown'}. Category: ${p.masterCategory}/${p.subCategory}. Type: ${p.articleType || 'Unknown'}.`;
    });
    
    const embeddings = await generateEmbeddingsBatch(texts);
    
    if (embeddings) {
      // Update each product with its embedding
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
      console.log(`   ❌ Failed batch`);
    }
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < products.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`\n📊 Phase 2 Results: ${successCount} success, ${failCount} failed out of ${products.length} total`);
}

// ─── Phase 3: Create Search Indexes ─────────────────────────────────────────

async function phase3_createIndexes() {
  console.log('\n' + '═'.repeat(60));
  console.log('🔍 PHASE 3: Create Atlas Search Indexes');
  console.log('═'.repeat(60));
  
  const collection = await getCollection();
  
  // Get existing search indexes
  let existingIndexes = [];
  try {
    existingIndexes = await collection.listSearchIndexes().toArray();
  } catch (error) {
    console.warn('⚠️  Could not list search indexes:', error.message);
  }
  
  const existingNames = existingIndexes.map(idx => idx.name);
  console.log(`📋 Existing search indexes: ${existingNames.join(', ') || 'none'}`);
  
  // Determine embedding dimensions
  const dims = embeddingDimensions || 1024; // fallback to 1024
  
  // Create Vector Search Index
  if (!existingNames.includes(CONFIG.vectorIndexName)) {
    console.log(`\n🔨 Creating vector search index "${CONFIG.vectorIndexName}" (${dims} dimensions)...`);
    try {
      await collection.createSearchIndex({
        name: CONFIG.vectorIndexName,
        type: 'vectorSearch',
        definition: {
          fields: [
            {
              type: 'vector',
              path: 'vai_4_embedding',
              numDimensions: dims,
              similarity: 'cosine',
            },
            {
              type: 'filter',
              path: 'masterCategory',
            },
            {
              type: 'filter',
              path: 'subCategory',
            },
            {
              type: 'filter',
              path: 'brand',
            },
          ],
        },
      });
      console.log(`   ✅ Vector search index created`);
    } catch (error) {
      console.error(`   ❌ Failed to create vector index: ${error.message}`);
    }
  } else {
    console.log(`✅ Vector search index "${CONFIG.vectorIndexName}" already exists`);
  }
  
  // Create Text Search Index
  if (!existingNames.includes(CONFIG.textIndexName)) {
    console.log(`\n🔨 Creating text search index "${CONFIG.textIndexName}"...`);
    try {
      await collection.createSearchIndex({
        name: CONFIG.textIndexName,
        type: 'search',
        definition: {
          mappings: {
            dynamic: false,
            fields: {
              name: { type: 'string' },
              description: { type: 'string' },
              brand: { type: 'string' },
              articleType: { type: 'string' },
              masterCategory: { type: 'string' },
              subCategory: { type: 'string' },
            },
          },
        },
      });
      console.log(`   ✅ Text search index created`);
    } catch (error) {
      console.error(`   ❌ Failed to create text index: ${error.message}`);
    }
  } else {
    console.log(`✅ Text search index "${CONFIG.textIndexName}" already exists`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Product Enhancement Pipeline');
  console.log('─'.repeat(60));
  console.log(`MongoDB: ${CONFIG.dbName}.${CONFIG.colName}`);
  console.log(`LLM Model: ${CONFIG.haikuModel}`);
  console.log(`Embedding Model: ${CONFIG.embeddingModel}`);
  console.log(`Concurrency: ${CONFIG.concurrency}`);
  console.log(`Voyage Batch Size: ${CONFIG.voyageBatchSize}`);
  console.log('─'.repeat(60));
  
  // Validate config
  if (!CONFIG.mongoUri) throw new Error('MONGO_URI is required');
  if (!CONFIG.anthropicApiKey) throw new Error('ANTHROPIC_API_KEY is required');
  if (!CONFIG.voyageApiKey) throw new Error('VOYAGE_AI_API_KEY is required');
  
  // Initialize Anthropic client
  anthropic = new Anthropic({ apiKey: CONFIG.anthropicApiKey });
  
  try {
    // Seed category cache from existing data
    await seedCategoryCache();
    
    // Phase 1: Descriptions + Categories + Attributes
    await phase1_enhanceProducts();
    
    // Phase 2: Embeddings
    await phase2_generateEmbeddings();
    
    // Phase 3: Search Indexes
    await phase3_createIndexes();
    
    // Summary
    const collection = await getCollection();
    const totalProducts = await collection.countDocuments();
    const withDescription = await collection.countDocuments({ lastUpdatedAt: { $exists: true } });
    const withEmbedding = await collection.countDocuments({ vai_4_embedding: { $exists: true } });
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 PIPELINE COMPLETE');
    console.log('═'.repeat(60));
    console.log(`Total products: ${totalProducts}`);
    console.log(`With enhanced descriptions: ${withDescription}`);
    console.log(`With vector embeddings: ${withEmbedding}`);
    console.log(`Categories: ${categoryCache.masterCategories.size} master, ${categoryCache.subCategories.size} sub`);
    
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('\n🔌 MongoDB connection closed.');
    }
  }
}

main().catch(console.error);
