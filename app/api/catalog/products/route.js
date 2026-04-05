import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getOwnerContext } from "@/lib/requireStoreOwner";

const LIST_PROJECTION = { vai_4_embedding: 0, vai_text_embedding: 0 };

function serializeDoc(doc) {
  if (!doc) return null;
  return { ...doc, _id: doc._id.toString() };
}

/**
 * POST { actingUserId, productId? }
 * - Without productId: list products (no large embedding fields).
 * - With productId: single product for editing (embeddings omitted).
 */
export async function POST(request) {
  try {
    const { actingUserId, productId } = await request.json();
    const ctx = await getOwnerContext(actingUserId);
    if (ctx.error) return ctx.error;

    const col = ctx.db.collection("products");

    if (productId) {
      if (typeof productId !== "string" || !/^[a-fA-F0-9]{24}$/.test(productId)) {
        return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
      }
      const doc = await col.findOne(
        { _id: new ObjectId(productId) },
        { projection: LIST_PROJECTION }
      );
      if (!doc) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ product: serializeDoc(doc) }, { status: 200 });
    }

    const products = await col.find({}, { projection: LIST_PROJECTION }).toArray();
    return NextResponse.json(
      { products: products.map(serializeDoc) },
      { status: 200 }
    );
  } catch (e) {
    console.error("[catalog/products]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
