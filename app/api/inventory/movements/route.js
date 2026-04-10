import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getOwnerContext } from "@/lib/requireStoreOwner";

const DEFAULT_LIMIT = 150;
const DEFAULT_LIMIT_PRODUCT = 100;
const MAX_LIMIT = 500;

function serializeMovement(doc) {
  return {
    _id: doc._id.toString(),
    productId: doc.productId.toString(),
    productName: doc.productName || "",
    delta: doc.delta,
    reason: doc.reason,
    refOrderId: doc.refOrderId ? doc.refOrderId.toString() : null,
    at:
      doc.at instanceof Date
        ? doc.at.toISOString()
        : doc.at != null
          ? String(doc.at)
          : null,
  };
}

/**
 * POST { actingUserId, limit?, productId? }
 * - Without productId: recent rows (newest first), default limit 150.
 * - With productId: movements for that product only, default limit 100.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { actingUserId, limit: rawLimit, productId } = body;
    const ctx = await getOwnerContext(actingUserId);
    if (ctx.error) return ctx.error;

    let match = null;
    if (productId != null && productId !== "") {
      if (
        typeof productId !== "string" ||
        !/^[a-fA-F0-9]{24}$/.test(productId)
      ) {
        return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
      }
      match = { productId: new ObjectId(productId) };
    }

    let limit = Number(rawLimit);
    if (!Number.isFinite(limit) || limit < 1) {
      limit = match ? DEFAULT_LIMIT_PRODUCT : DEFAULT_LIMIT;
    }
    limit = Math.min(Math.floor(limit), MAX_LIMIT);

    const { db } = ctx;
    const pipeline = [];
    if (match) pipeline.push({ $match: match });
    pipeline.push(
      { $sort: { at: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "_p",
        },
      },
      {
        $addFields: {
          productName: {
            $ifNull: [{ $arrayElemAt: ["$_p.name", 0] }, ""],
          },
        },
      },
      { $project: { _p: 0 } }
    );

    const rows = await db
      .collection("inventory_movements")
      .aggregate(pipeline)
      .toArray();

    return NextResponse.json(
      { movements: rows.map(serializeMovement) },
      { status: 200 }
    );
  } catch (e) {
    console.error("[inventory/movements]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
