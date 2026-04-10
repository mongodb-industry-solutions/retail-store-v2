import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { clientPromise, dbName } from "@/lib/mongodb";

/**
 * Public read: current quantity for shop / fetchproduct merge.
 * Missing inventory doc → { quantity: null }
 */
export async function GET(_request, context) {
  try {
    const { productId } = await context.params;
    if (
      typeof productId !== "string" ||
      !/^[a-fA-F0-9]{24}$/.test(productId)
    ) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const oid = new ObjectId(productId);
    const doc = await db.collection("product_inventory").findOne({ _id: oid });

    return NextResponse.json(
      { quantity: doc ? doc.quantity : null },
      { status: 200 }
    );
  } catch (e) {
    console.error("[inventory/[productId]]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
