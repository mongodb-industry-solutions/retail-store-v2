import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getOwnerContext } from "@/lib/requireStoreOwner";
import {
  CATALOG_CORE_FIELD_KEYS,
  CATALOG_FORBIDDEN_UPDATE_KEYS,
  sanitizeProductUpdatePayload,
} from "@/lib/catalogProductConstants";

const DEFAULT_NEW_PRODUCT = {
  brand: "Unknown",
  price: { amount: 0, currency: "USD" },
  image: { url: "" },
  description: "",
  masterCategory: "uncategorized",
  subCategory: "general",
  articleType: "",
  gender: "unisex",
  baseColour: "",
};

function serializeDoc(doc) {
  return { ...doc, _id: doc._id.toString() };
}

/** POST — create product */
export async function POST(request) {
  try {
    const { actingUserId, product } = await request.json();
    const ctx = await getOwnerContext(actingUserId);
    if (ctx.error) return ctx.error;

    const incoming =
      product && typeof product === "object" ? { ...product } : {};
    delete incoming._id;

    for (const k of CATALOG_FORBIDDEN_UPDATE_KEYS) {
      delete incoming[k];
    }

    const _id = new ObjectId();
    const doc = {
      ...DEFAULT_NEW_PRODUCT,
      ...incoming,
      _id,
      name: typeof incoming.name === "string" ? incoming.name : "New product",
    };

    // Ensure nested defaults if partially provided
    if (!doc.price || typeof doc.price !== "object") {
      doc.price = { ...DEFAULT_NEW_PRODUCT.price };
    } else {
      doc.price = {
        amount: Number(doc.price.amount) || 0,
        currency: doc.price.currency || "USD",
      };
    }
    if (!doc.image || typeof doc.image !== "object") {
      doc.image = { ...DEFAULT_NEW_PRODUCT.image };
    } else {
      doc.image = { url: String(doc.image.url ?? "") };
    }

    await ctx.db.collection("products").insertOne(doc);
    return NextResponse.json({ product: serializeDoc(doc) }, { status: 200 });
  } catch (e) {
    console.error("[catalog/product POST]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** PATCH — partial update */
export async function PATCH(request) {
  try {
    const { actingUserId, productId, fields, unsetKeys } = await request.json();
    const ctx = await getOwnerContext(actingUserId);
    if (ctx.error) return ctx.error;

    if (
      typeof productId !== "string" ||
      !/^[a-fA-F0-9]{24}$/.test(productId)
    ) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const $set = sanitizeProductUpdatePayload(fields);
    const $unset = {};
    if (Array.isArray(unsetKeys)) {
      for (const k of unsetKeys) {
        if (typeof k !== "string" || !k) continue;
        if (CATALOG_FORBIDDEN_UPDATE_KEYS.has(k)) continue;
        if (CATALOG_CORE_FIELD_KEYS.has(k)) continue;
        $unset[k] = "";
      }
    }

    if (Object.keys($set).length === 0 && Object.keys($unset).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update or unset" },
        { status: 400 }
      );
    }

    const updateOp = {};
    if (Object.keys($set).length > 0) updateOp.$set = $set;
    if (Object.keys($unset).length > 0) updateOp.$unset = $unset;

    const result = await ctx.db
      .collection("products")
      .updateOne({ _id: new ObjectId(productId) }, updateOp);

    return NextResponse.json(
      {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        acknowledged: result.acknowledged,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("[catalog/product PATCH]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** DELETE — remove product */
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { actingUserId, productId } = body;
    const ctx = await getOwnerContext(actingUserId);
    if (ctx.error) return ctx.error;

    if (
      typeof productId !== "string" ||
      !/^[a-fA-F0-9]{24}$/.test(productId)
    ) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const result = await ctx.db
      .collection("products")
      .deleteOne({ _id: new ObjectId(productId) });

    return NextResponse.json({ deletedCount: result.deletedCount }, { status: 200 });
  } catch (e) {
    console.error("[catalog/product DELETE]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
