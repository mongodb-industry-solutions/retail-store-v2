const { MongoClient, ObjectId } = require('mongodb');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COL_NAME;
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL;

let client;
async function getDbClient() {
    if (!client) {
        client = new MongoClient(MONGO_URI);
        await client.connect();
    }
    return client.db(DB_NAME);
}

async function fetchProducts() {
    try {
        const db = await getDbClient();
        const collection = db.collection(COLLECTION_NAME);
        
        const filter = {"vai_text_embedding": {$exists: false}} ;        
        const products = await collection.find(filter).toArray();
        console.log(`Fetched ${products.length} products to embed.`);
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

async function generateEmbeddings(products) {
    for (const product of products) {
        const textToEmbed = `${product.name} ${product.description} ${product.brand} ${product.articleType} ${product.subCategory}`;
        console.log('textToEmbed: ', textToEmbed);
        
        try {
            const response = await axios.post(VOYAGE_API_URL, {
                model: EMBEDDING_MODEL,
                input: textToEmbed
            }, {
                headers: {
                    'Authorization': `Bearer ${VOYAGE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const embedding = response.data.data[0].embedding;
            await saveEmbedding(product._id, embedding);
        } catch (error) {
            console.error(`Error generating embedding for product ${product._id}:`, error.response?.data || error.message);
        }
    }
}

async function saveEmbedding(productId, embedding) {
    try {
        const db = await getDbClient();
        const collection = db.collection(COLLECTION_NAME);
        
        await collection.updateOne(
            { _id: productId },
            { $set: { 'vai_text_embedding': embedding } }
        );
        console.log(`Saved embedding for product ${productId}`);
    } catch (error) {
        console.error(`Error saving embedding for product ${productId}:`, error);
    }
}

(async () => {
    const products = await fetchProducts();
    if (products && products.length > 0) {
        await generateEmbeddings(products);
    }
    if (client) {
        await client.close();
        console.log('MongoDB connection closed.');
    }
})();
