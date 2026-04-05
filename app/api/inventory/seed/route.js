import { NextResponse } from "next/server";
import { getOwnerContext } from "@/lib/requireStoreOwner";

/**
 * Owner-only: set each product's inventory to a random quantity in 0..50 (inclusive)
 * and append an inventory_movements row per product (reason: seed).
 * Re-running replaces quantities and adds another seed movement per product (demo-friendly).
 */
export async function POST(request) {
  try {
    const { actingUserId } = await request.json();
    const ctx = await getOwnerContext(actingUserId);
    if (ctx.error) return ctx.error;

    const { db } = ctx;
    const productsCol = db.collection("products");
    const invCol = db.collection("product_inventory");
    const movCol = db.collection("inventory_movements");

    const ids = await productsCol.find({}, { projection: { _id: 1 } }).toArray();
    const now = new Date();
    let updated = 0;

    for (const { _id } of ids) {
      const quantity = Math.floor(Math.random() * 51);
      await invCol.replaceOne(
        { _id },
        { _id, quantity },
        { upsert: true }
      );
      await movCol.insertOne({
        productId: _id,
        delta: quantity,
        reason: "seed",
        at: now,
      });
      updated += 1;
    }

    return NextResponse.json({ ok: true, productsUpdated: updated }, { status: 200 });
  } catch (e) {
    console.error("[inventory/seed]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
