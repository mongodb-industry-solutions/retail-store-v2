import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";
import { PAGINATION_PER_PAGE } from "@/lib/constants";
import axios from "axios";

// ─── Voyage AI Embedding Helper ──────────────────────────────────────────────

async function generateQueryEmbedding(query) {
  const response = await axios.post(
    process.env.VOYAGE_API_URL || "https://ai.mongodb.com/v1/embeddings",
    {
      model: process.env.VOYAGE_EMBEDDING_MODEL || "voyage-4",
      input: query,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.VOYAGE_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  return response.data.data[0].embedding;
}

// ─── Build Vector Search Pipeline ────────────────────────────────────────────

function buildVectorSearchPipeline(queryEmbedding, facets, paginationPage) {
  const pipeline = [];

  // Build pre-filter for vector search
  const filter = {};
  if (facets) {
    const { selectedBrands, selectedCategories } = facets;
    if (selectedBrands && selectedBrands.length > 0) {
      filter.brand = { $in: selectedBrands };
    }
    if (selectedCategories && selectedCategories.length > 0) {
      filter.masterCategory = { $in: selectedCategories };
    }
  }

  pipeline.push({
    $vectorSearch: {
      index: process.env.VECTOR_INDEX_NAME || "vector_index",
      path: "vai_4_embedding",
      queryVector: queryEmbedding,
      numCandidates: 3000,
      limit: 3000,
      ...(Object.keys(filter).length > 0 && { filter }),
    },
  });

  pipeline.push(
    {
      $addFields: {
        score: { $meta: "vectorSearchScore" },
      },
    },
    {
      $project: {
        vai_4_embedding: 0,
        vai_text_embedding: 0,
      },
    }
  );

  // Use $facet for pagination + total count in a single query
  pipeline.push({
    $facet: {
      results: [
        { $skip: PAGINATION_PER_PAGE * paginationPage },
        { $limit: PAGINATION_PER_PAGE },
      ],
      totalCount: [{ $count: "total" }],
    },
  });

  return pipeline;
}

// ─── Build Text Search Pipeline ──────────────────────────────────────────────

function buildTextSearchPipeline(query, facets, paginationPage) {
  const pipeline = [];

  pipeline.push({
    $search: {
      index: process.env.TEXT_INDEX_NAME || "text_search_index",
      text: {
        query: query,
        path: [
          "name",
          "description",
          "articleType",
          "subCategory",
          "masterCategory",
          "brand",
        ],
      },
    },
  });

  // Add facet filtering
  if (facets) {
    const { selectedBrands, selectedCategories } = facets;

    if (selectedBrands && selectedBrands.length > 0) {
      pipeline.push({
        $match: {
          brand: { $in: selectedBrands },
        },
      });
    }

    if (selectedCategories && selectedCategories.length > 0) {
      pipeline.push({
        $match: {
          masterCategory: { $in: selectedCategories },
        },
      });
    }
  }

  pipeline.push(
    {
      $addFields: {
        score: { $meta: "searchScore" },
      },
    },
    {
      $project: {
        vai_4_embedding: 0,
        vai_text_embedding: 0,
      },
    },
    {
      $limit: 3000,
    }
  );

  // Use $facet for pagination + total count in a single query
  pipeline.push({
    $facet: {
      results: [
        { $skip: PAGINATION_PER_PAGE * paginationPage },
        { $limit: PAGINATION_PER_PAGE },
      ],
      totalCount: [{ $count: "total" }],
    },
  });

  return pipeline;
}

// ─── Build Browse Pipeline (no query) ────────────────────────────────────────

function buildBrowsePipeline(facets, paginationPage) {
  const pipeline = [];

  if (facets) {
    const { selectedBrands, selectedCategories } = facets;

    if (selectedBrands && selectedBrands.length > 0) {
      pipeline.push({
        $match: {
          brand: { $in: selectedBrands },
        },
      });
    }

    if (selectedCategories && selectedCategories.length > 0) {
      pipeline.push({
        $match: {
          masterCategory: { $in: selectedCategories },
        },
      });
    }
  }

  pipeline.push({
    $project: {
      vai_4_embedding: 0,
      vai_text_embedding: 0,
    },
  });

  pipeline.push({
    $facet: {
      results: [
        { $skip: PAGINATION_PER_PAGE * paginationPage },
        { $limit: PAGINATION_PER_PAGE },
      ],
      totalCount: [{ $count: "total" }],
    },
  });

  return pipeline;
}

// ─── POST Handler ────────────────────────────────────────────────────────────

export async function POST(request) {
  const { query, facets, pagination_page, searchType } = await request.json();

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection("products");

    let pipeline;

    if (!query) {
      // No query — just browse products
      pipeline = buildBrowsePipeline(facets, pagination_page);
    } else if (searchType === "text") {
      // Text/keyword search using Atlas Search
      pipeline = buildTextSearchPipeline(query, facets, pagination_page);
    } else {
      // Default: semantic/vector search
      const queryEmbedding = await generateQueryEmbedding(query);
      pipeline = buildVectorSearchPipeline(
        queryEmbedding,
        facets,
        pagination_page
      );
    }

    const [facetResult] = await collection.aggregate(pipeline).toArray();
    const products = facetResult.results;
    const totalItems =
      facetResult.totalCount.length > 0 ? facetResult.totalCount[0].total : 0;

    console.log(
      `Search [${searchType || "vector"}] query="${query || ""}" results=${products.length} total=${totalItems}`
    );

    return NextResponse.json(
      { products: products, totalItems: totalItems },
      { status: 200 }
    );
  } catch (error) {
    console.error("Search error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
