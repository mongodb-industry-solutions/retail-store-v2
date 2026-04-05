import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getOwnerContext } from "@/lib/requireStoreOwner";
import { clientPromise } from "@/lib/mongodb";

const LIST_PROJECTION = {
  _id: 1,
  name: 1,
  brand: 1,
};

function serializeRow(doc) {
  const inv = doc.inventory && doc.inventory[0];
  return {
    _id: doc._id.toString(),
    name: doc.name ?? "",
    brand: doc.brand ?? "",
    stockQuantity: inv != null ? inv.quantity : null,
  };
}

/**
 * POST { actingUserId } — list products with optional inventory (for owner UI).
 */
export async function POST(request) {
  try {
    const { actingUserId } = await request.json();
    const ctx = await getOwnerContext(actingUserId);
    if (ctx.error) return ctx.error;

    const { db } = ctx;
    const rows = await db
      .collection("products")
      .aggregate([
        { $project: { ...LIST_PROJECTION } },
        {
          $lookup: {
            from: "product_inventory",
            localField: "_id",
            foreignField: "_id",
            as: "inventory",
          },
        },
        { $sort: { name: 1 } },
      ])
      .toArray();

    return NextResponse.json(
      { products: rows.map(serializeRow) },
      { status: 200 }
    );
  } catch (e) {
    console.error("[inventory POST]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * PATCH { actingUserId, productId, quantity } — set absolute quantity (ACID: inventory + movement).
 */
export async function PATCH(request) {
  const session = (await clientPromise).startSession();
  try {
    const body = await request.json();
    const { actingUserId, productId, quantity } = body;

    const ctx = await getOwnerContext(actingUserId);
    if (ctx.error) return ctx.error;

    if (
      typeof productId !== "string" ||
      !/^[a-fA-F0-9]{24}$/.test(productId)
    ) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const q = Number(quantity);
    if (!Number.isInteger(q) || q < 0) {
      return NextResponse.json(
        { error: "quantity must be a non-negative integer" },
        { status: 400 }
      );
    }

    const { db } = ctx;
    const invCol = db.collection("product_inventory");
    const movCol = db.collection("inventory_movements");
    const oid = new ObjectId(productId);

    const product = await db.collection("products").findOne({ _id: oid });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let newQty = q;

    await session.withTransaction(async () => {
      const before = await invCol.findOne({ _id: oid }, { session });
      const oldQty = before ? before.quantity : 0;
      const delta = newQty - oldQty;

      await invCol.replaceOne(
        { _id: oid },
        { _id: oid, quantity: newQty },
        { upsert: true, session }
      );

      await movCol.insertOne(
        {
          productId: oid,
          delta,
          reason: "admin_adjust",
          at: new Date(),
        },
        { session }
      );
    });

    return NextResponse.json(
      { ok: true, productId, quantity: newQty },
      { status: 200 }
    );
  } catch (e) {
    console.error("[inventory PATCH]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  } finally {
    await session.endSession();
  }
}
