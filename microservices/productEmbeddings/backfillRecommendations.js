/**
 * Backfill Recommended Products
 * 
 * This script:
 * 1. Reads all users from the users collection
 * 2. Iterates through each user's lastRecommendations array
 * 3. For each recommendation, upserts a product document into the products collection
 *    using the productId, name, brand, price, and image from the recommendation
 * 4. Skips products that already exist in the catalog
 * 
 * After running this script, run the main productEmbeddings script.js to generate
 * descriptions, categories, attributes, and embeddings for the new products.
 */

const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config({ override: true });

const CONFIG = {
  mongoUri: process.env.MONGO_URI,
  dbName: process.env.DB_NAME || 'leafy_popup_store',
  productsCol: process.env.COL_NAME || 'products',
  usersCol: 'users',
};

async function main() {
  console.log('🚀 Backfill Recommended Products into Catalog');
  console.log('─'.repeat(60));
  console.log(`MongoDB: ${CONFIG.dbName}`);
  console.log(`Products collection: ${CONFIG.productsCol}`);
  console.log(`Users collection: ${CONFIG.usersCol}`);
  console.log('─'.repeat(60));

  if (!CONFIG.mongoUri) throw new Error('MONGO_URI is required');

  const client = new MongoClient(CONFIG.mongoUri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(CONFIG.dbName);
    const usersCol = db.collection(CONFIG.usersCol);
    const productsCol = db.collection(CONFIG.productsCol);

    // Get all users with lastRecommendations
    const users = await usersCol.find({
      lastRecommendations: { $exists: true, $ne: [] }
    }).toArray();

    console.log(`\n👥 Found ${users.length} users with lastRecommendations`);

    // Also check lastBoughtProducts on users (used for "Buy again" section)
    let totalInserted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const seenProductIds = new Set();

    for (const user of users) {
      const recommendations = user.lastRecommendations || [];
      console.log(`\n👤 User "${user.name} ${user.surname || ''}" — ${recommendations.length} recommendations`);

      for (const rec of recommendations) {
        const productId = rec.productId;
        
        if (!productId) {
          console.log(`   ⚠️  Skipping recommendation with no productId`);
          continue;
        }

        // Skip duplicates within this run
        if (seenProductIds.has(String(productId))) {
          continue;
        }
        seenProductIds.add(String(productId));

        // Check if product already exists
        const existing = await productsCol.findOne({ _id: productId });
        if (existing) {
          totalSkipped++;
          continue;
        }

        // Build the product document from the recommendation data
        const productDoc = {
          _id: productId,
          name: rec.name || 'Unknown Product',
          brand: rec.brand || 'Unknown',
          price: {
            amount: typeof rec.price === 'number' ? rec.price : parseFloat(rec.price) || 0,
            currency: 'USD',
          },
          image: typeof rec.image === 'string' ? { url: rec.image } : (rec.image || null),
          // These will be filled in by the productEmbeddings script
          masterCategory: rec.masterCategory || 'uncategorized',
          subCategory: rec.subCategory || 'uncategorized',
          articleType: rec.articleType || 'Unknown',
          gender: rec.gender || 'Unisex',
        };

        try {
          await productsCol.insertOne(productDoc);
          totalInserted++;
          console.log(`   ✅ Inserted: "${productDoc.name}" (${productId})`);
        } catch (err) {
          if (err.code === 11000) {
            // Duplicate key — race condition, skip
            totalSkipped++;
          } else {
            totalErrors++;
            console.error(`   ❌ Error inserting ${productId}: ${err.message}`);
          }
        }
      }
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📊 BACKFILL COMPLETE');
    console.log('═'.repeat(60));
    console.log(`Inserted: ${totalInserted} new products`);
    console.log(`Skipped (already exist): ${totalSkipped}`);
    console.log(`Errors: ${totalErrors}`);
    console.log(`\n💡 Now run "npm start" (script.js) to generate descriptions, categories, and embeddings for the new products.`);

  } finally {
    await client.close();
    console.log('\n🔌 MongoDB connection closed.');
  }
}

main().catch(console.error);
