import { clientPromise, dbName } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

function toObjectId(id) {
  if (id instanceof ObjectId) return id;
  if (typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id)) {
    return new ObjectId(id);
  }
  return null;
}

export async function POST(request) {
  const client = await clientPromise;
  const session = client.startSession();

  try {
    const order = await request.json();
    console.log(order);

    const db = client.db(dbName);
    const ordersCollection = db.collection("orders");
    const invCol = db.collection("product_inventory");
    const movCol = db.collection("inventory_movements");

    const orderId = new ObjectId();
    const orderDocument = {
      _id: orderId,
      products: order.products,
      shipping_address: order.shipping_address,
      status_history: [
        {
          status: "In process",
          timestamp: Date.now(),
        },
      ],
      type: order.type,
      user: new ObjectId(order.userId),
    };

    const lines = order.products || [];
    const normalized = lines.map((p) => {
      const oid = toObjectId(p._id);
      const amount = Number(p.amount);
      return { oid, amount };
    });

    for (const line of normalized) {
      if (!line.oid || !Number.isFinite(line.amount) || line.amount < 1) {
        return NextResponse.json(
          { error: "Invalid product line", code: "INVALID_LINE" },
          { status: 400 }
        );
      }
    }

    await session.withTransaction(async () => {
      for (const line of normalized) {
        const res = await invCol.updateOne(
          { _id: line.oid, quantity: { $gte: line.amount } },
          { $inc: { quantity: -line.amount } },
          { session }
        );
        if (res.matchedCount === 0) {
          const inv = await invCol.findOne({ _id: line.oid }, { session });
          const err = new Error(inv ? "INSUFFICIENT_STOCK" : "NO_INVENTORY");
          err.code = inv ? "INSUFFICIENT_STOCK" : "NO_INVENTORY";
          err.productId = line.oid.toString();
          err.requested = line.amount;
          err.available = inv ? inv.quantity : 0;
          throw err;
        }
      }

      await ordersCollection.insertOne(orderDocument, { session });

      if (normalized.length > 0) {
        const movements = normalized.map((line) => ({
          productId: line.oid,
          delta: -line.amount,
          reason: "sale",
          refOrderId: orderId,
          at: new Date(),
        }));
        await movCol.insertMany(movements, { session });
      }
    });

    return NextResponse.json(
      {
        order: {
          ...orderDocument,
          _id: orderDocument._id.toString(),
          user: orderDocument.user.toString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.code === "INSUFFICIENT_STOCK" || error.code === "NO_INVENTORY") {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          productId: error.productId,
          requested: error.requested,
          available: error.available,
        },
        { status: 409 }
      );
    }
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error creating order", message: error.message },
      { status: 500 }
    );
  } finally {
    await session.endSession();
  }
}
