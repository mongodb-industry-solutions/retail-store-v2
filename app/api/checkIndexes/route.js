import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";

// ─── Index Definitions ───────────────────────────────────────────────────────
// These match the definitions in microservices/productEmbeddings/script.js

const REQUIRED_INDEXES = [
  {
    name: process.env.VECTOR_INDEX_NAME || "vector_index",
    type: "vectorSearch",
    definition: {
      fields: [
        {
          type: "vector",
          path: "vai_4_embedding",
          numDimensions: 1024,
          similarity: "cosine",
        },
        { type: "filter", path: "masterCategory" },
        { type: "filter", path: "subCategory" },
        { type: "filter", path: "brand" },
      ],
    },
  },
  {
    name: process.env.TEXT_INDEX_NAME || "text_search_index",
    type: "search",
    definition: {
      mappings: {
        dynamic: false,
        fields: {
          name: { type: "string" },
          description: { type: "string" },
          brand: { type: "string" },
          articleType: { type: "string" },
          masterCategory: { type: "string" },
          subCategory: { type: "string" },
        },
      },
    },
  },
];

// ─── GET: Check which indexes exist ──────────────────────────────────────────

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection("products");

    let existingIndexes = [];
    try {
      existingIndexes = await collection.listSearchIndexes().toArray();
    } catch (error) {
      console.warn("Could not list search indexes:", error.message);
    }

    const existingNames = existingIndexes.map((idx) => idx.name);
    const requiredNames = REQUIRED_INDEXES.map((idx) => idx.name);

    const missing = requiredNames.filter((n) => !existingNames.includes(n));
    const existing = requiredNames.filter((n) => existingNames.includes(n));

    // Also check status of existing indexes (they may still be building)
    const statuses = {};
    for (const idx of existingIndexes) {
      if (requiredNames.includes(idx.name)) {
        statuses[idx.name] = idx.status || "READY";
      }
    }

    return NextResponse.json({ missing, existing, statuses }, { status: 200 });
  } catch (error) {
    console.error("Index check error:", error);
    return NextResponse.json(
      { error: "Failed to check indexes" },
      { status: 500 }
    );
  }
}

// ─── POST: Create missing indexes ───────────────────────────────────────────

export async function POST() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection("products");

    // Get existing indexes to avoid duplicates
    let existingIndexes = [];
    try {
      existingIndexes = await collection.listSearchIndexes().toArray();
    } catch (error) {
      console.warn("Could not list search indexes:", error.message);
    }
    const existingNames = existingIndexes.map((idx) => idx.name);

    const results = [];

    for (const index of REQUIRED_INDEXES) {
      if (existingNames.includes(index.name)) {
        results.push({ name: index.name, status: "already_exists" });
        continue;
      }

      try {
        await collection.createSearchIndex({
          name: index.name,
          type: index.type,
          definition: index.definition,
        });
        results.push({ name: index.name, status: "created" });
      } catch (error) {
        results.push({
          name: index.name,
          status: "error",
          error: error.message,
        });
      }
    }

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("Index creation error:", error);
    return NextResponse.json(
      { error: "Failed to create indexes" },
      { status: 500 }
    );
  }
}
