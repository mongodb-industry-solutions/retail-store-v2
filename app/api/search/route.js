import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";
import { PAGINATION_PER_PAGE } from "@/lib/constants";

export async function POST(request) {
  const { query, facets, pagination_page } = await request.json();

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection("products");

    // Build the aggregation pipeline
    const pipeline = [];

    // Conditionally add the $search stage if query is not empty
    if (query) {
      pipeline.push({
        $search: {
          index: process.env.SEARCH_INDEX_NAME,
          text: {
            query: query,
            path: ["name", "articleType", "subCategory", "brand"],
          },
        },
      });
    }

    // Add facet filtering stages if facets are provided
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

    // Add the $addFields and $limit stages
    pipeline.push(
      {
        $addFields: {
          score: { $meta: "searchScore" },
        },
      },
      {
        $project: {
          vai_text_embedding: 0, // Exclude the embedding field from the results
        },
      },
      {
        $limit: 3000, // Limit the number of results
      }
    );

    // Get total count of matching documents
    const totalCount = await collection
      .aggregate(pipeline.concat([{ $count: "total" }]))
      .toArray();
    const totalItems = totalCount.length > 0 ? totalCount[0].total : 0;

    // Perform the aggregation query
    const products = await collection
      .aggregate(pipeline)
      .skip(PAGINATION_PER_PAGE * pagination_page)
      .limit(PAGINATION_PER_PAGE)
      .toArray();

    console.log("RESULTS LENGTH: ", products.length);
    return NextResponse.json(
      { products: products, totalItems: totalItems },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
