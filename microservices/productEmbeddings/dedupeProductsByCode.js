/**
 * Deduplicate products that share the same `code`.
 *
 * Usage:
 *   node dedupeProductsByCode.js           # dry-run (default)
 *   node dedupeProductsByCode.js --apply   # perform updates and deletes
 *   node dedupeProductsByCode.js --merge-fields --apply  # fill missing fields on survivor from losers
 *
 * Env: MONGO_URI + DB_NAME, or MONGODB_URI + DATABASE_NAME (Next app style).
 */

const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config({ path: require("path").join(__dirname, ".env"), override: true });
dotenv.config({ path: require("path").join(__dirname, "../../.env.local"), override: false });

const CONFIG = {
  mongoUri: process.env.MONGO_URI || process.env.MONGODB_URI,
  dbName: process.env.DB_NAME || process.env.DATABASE_NAME || "leafy_popup_store",
  productsCol: process.env.COL_NAME || "products",
};

function parseArgs(argv) {
  const apply = argv.includes("--apply");
  const mergeFields = argv.includes("--merge-fields");
  const dryRun = !apply;
  return { apply, dryRun, mergeFields };
}

function idKey(id) {
  if (id instanceof ObjectId) return id.toHexString();
  if (id && typeof id.toString === "function") return String(id);
  return String(id);
}

function toObjectId(id) {
  if (id instanceof ObjectId) return id;
  try {
    return new ObjectId(String(id));
  } catch {
    return null;
  }
}

/** Match product id stored as ObjectId or hex string in nested docs */
function idElemMatch(field) {
  return (oid) => {
    const s = oid.toHexString();
    return { $or: [{ [field]: oid }, { [field]: s }] };
  };
}

function getPriceAmount(doc) {
  if (!doc) return Number.POSITIVE_INFINITY;
  const p = doc.price;
  if (p && typeof p === "object" && typeof p.amount === "number" && !Number.isNaN(p.amount)) {
    return p.amount;
  }
  if (typeof p === "string") {
    const n = parseFloat(p);
    return Number.isNaN(n) ? Number.POSITIVE_INFINITY : n;
  }
  if (typeof p === "number" && !Number.isNaN(p)) return p;
  return Number.POSITIVE_INFINITY;
}

async function findDuplicateGroups(productsCol) {
  const pipeline = [
    {
      $match: {
        code: { $exists: true, $type: "string", $ne: "" },
      },
    },
    { $addFields: { _codeTrim: { $trim: { input: "$code" } } } },
    { $match: { _codeTrim: { $ne: "" } } },
    {
      $group: {
        _id: "$_codeTrim",
        ids: { $push: "$_id" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $sort: { _id: 1 } },
  ];
  return productsCol.aggregate(pipeline).toArray();
}

async function countRefsForProduct(db, oid) {
  const s = oid.toHexString();
  const usersCol = db.collection("users");
  const ordersCol = db.collection("orders");
  const cartsCol = db.collection("carts");
  const nbaCol = db.collection("next_best_actions");

  const u = await usersCol.countDocuments({
    lastRecommendations: {
      $elemMatch: { $or: [{ productId: oid }, { productId: s }] },
    },
  });

  const o = await ordersCol.countDocuments({
    products: { $elemMatch: { $or: [{ _id: oid }, { _id: s }] } },
  });

  const c = await cartsCol.countDocuments({
    products: { $elemMatch: { $or: [{ _id: oid }, { _id: s }] } },
  });

  const n = await nbaCol.countDocuments({
    $or: [
      { "embedInProduct.productId": oid },
      { "embedInProduct.productId": s },
      { "actionMetadata.productRecommendation.productId": oid },
      { "actionMetadata.productRecommendation.productId": s },
    ],
  });

  return u + o + c + n;
}

function pickCanonical(ids, refCounts, docsByKey) {
  const withRefs = ids.filter((id) => (refCounts.get(idKey(id)) || 0) > 0);

  const score = (id) => {
    const k = idKey(id);
    const refs = refCounts.get(k) || 0;
    const price = getPriceAmount(docsByKey.get(k));
    return { refs, price, idStr: k };
  };

  /** Higher refs first; tie → lower price; tie → lexicographic _id */
  const compare = (a, b) => {
    const sa = score(a);
    const sb = score(b);
    if (sb.refs !== sa.refs) return sb.refs - sa.refs;
    if (sa.price !== sb.price) return sa.price - sb.price;
    return sa.idStr.localeCompare(sb.idStr);
  };

  if (withRefs.length === 1) return withRefs[0];
  if (withRefs.length >= 2) {
    return [...withRefs].sort(compare)[0];
  }

  return [...ids].sort(compare)[0];
}

function lineItemPatchFromProduct(productDoc, canonicalOid) {
  const price = productDoc.price;
  let priceObj;
  if (price && typeof price === "object" && price.amount != null) {
    priceObj = {
      amount: Number(price.amount) || 0,
      currency: price.currency || "USD",
    };
  } else if (typeof price === "string" || typeof price === "number") {
    const amount = parseFloat(price);
    priceObj = {
      amount: Number.isNaN(amount) ? 0 : amount,
      currency: "USD",
    };
  } else {
    priceObj = { amount: 0, currency: "USD" };
  }

  return {
    _id: canonicalOid,
    amount: 1,
    brand: productDoc.brand,
    code: productDoc.code,
    description: productDoc.description,
    image: productDoc.image?.url
      ? { url: productDoc.image.url }
      : productDoc.image || { url: "" },
    name: productDoc.name,
    price: priceObj,
  };
}

function recPatchFromProduct(productDoc, canonicalOid) {
  const amount = getPriceAmount(productDoc);
  const safePrice = Number.isFinite(amount) && amount !== Number.POSITIVE_INFINITY ? amount : 0;
  const image =
    typeof productDoc.image === "string"
      ? productDoc.image
      : productDoc.image?.url || "";

  return {
    productId: canonicalOid,
    name: productDoc.name,
    brand: productDoc.brand,
    price: safePrice,
    image,
    masterCategory: productDoc.masterCategory,
    subCategory: productDoc.subCategory,
    articleType: productDoc.articleType,
    gender: productDoc.gender,
  };
}

async function rewriteUserRecommendations(usersCol, oldOid, canonicalOid, canonicalDoc, dryRun) {
  const oldS = oldOid.toHexString();
  const filter = {
    lastRecommendations: {
      $elemMatch: { $or: [{ productId: oldOid }, { productId: oldS }] },
    },
  };
  if (dryRun) {
    const n = await usersCol.countDocuments(filter);
    return { collection: "users", matched: n, modified: 0 };
  }

  const users = await usersCol.find(filter).project({ _id: 1 }).toArray();
  let modified = 0;
  const patch = recPatchFromProduct(canonicalDoc, canonicalOid);

  for (const u of users) {
    const doc = await usersCol.findOne({ _id: u._id });
    const lr = doc.lastRecommendations || [];
    const next = lr.map((rec) => {
      const pid = rec.productId;
      const match =
        (pid instanceof ObjectId && pid.equals(oldOid)) || String(pid) === oldS;
      if (!match) return rec;
      return { ...rec, ...patch };
    });
    const r = await usersCol.updateOne({ _id: u._id }, { $set: { lastRecommendations: next } });
    modified += r.modifiedCount;
  }
  return { collection: "users", matched: users.length, modified };
}

async function rewriteOrderLines(ordersCol, oldOid, canonicalOid, canonicalDoc, dryRun) {
  const oldS = oldOid.toHexString();
  const filter = {
    products: { $elemMatch: { $or: [{ _id: oldOid }, { _id: oldS }] } },
  };
  if (dryRun) {
    const n = await ordersCol.countDocuments(filter);
    return { collection: "orders", matched: n, modified: 0 };
  }

  const orders = await ordersCol.find(filter).project({ _id: 1 }).toArray();
  let modified = 0;
  const snap = lineItemPatchFromProduct(canonicalDoc, canonicalOid);

  for (const o of orders) {
    const doc = await ordersCol.findOne({ _id: o._id });
    const prods = (doc.products || []).map((line) => {
      const lid = line._id;
      const match =
        (lid instanceof ObjectId && lid.equals(oldOid)) || String(lid) === oldS;
      if (!match) return line;
      return { ...line, ...snap };
    });
    const r = await ordersCol.updateOne({ _id: o._id }, { $set: { products: prods } });
    modified += r.modifiedCount;
  }
  return { collection: "orders", matched: orders.length, modified };
}

async function rewriteCartLines(cartsCol, oldOid, canonicalOid, canonicalDoc, dryRun) {
  const oldS = oldOid.toHexString();
  const filter = {
    products: { $elemMatch: { $or: [{ _id: oldOid }, { _id: oldS }] } },
  };
  if (dryRun) {
    const n = await cartsCol.countDocuments(filter);
    return { collection: "carts", matched: n, modified: 0 };
  }

  const carts = await cartsCol.find(filter).project({ _id: 1 }).toArray();
  let modified = 0;
  const snap = lineItemPatchFromProduct(canonicalDoc, canonicalOid);

  for (const c of carts) {
    const doc = await cartsCol.findOne({ _id: c._id });
    const prods = (doc.products || []).map((line) => {
      const lid = line._id;
      const match =
        (lid instanceof ObjectId && lid.equals(oldOid)) || String(lid) === oldS;
      if (!match) return line;
      return { ...line, ...snap };
    });
    const r = await cartsCol.updateOne({ _id: c._id }, { $set: { products: prods } });
    modified += r.modifiedCount;
  }
  return { collection: "carts", matched: carts.length, modified };
}

async function rewriteNextBestActions(nbaCol, oldOid, canonicalOid, dryRun) {
  const oldS = oldOid.toHexString();
  const filter = {
    $or: [
      { "embedInProduct.productId": oldOid },
      { "embedInProduct.productId": oldS },
      { "actionMetadata.productRecommendation.productId": oldOid },
      { "actionMetadata.productRecommendation.productId": oldS },
    ],
  };

  if (dryRun) {
    const n = await nbaCol.countDocuments(filter);
    return { collection: "next_best_actions", matched: n, modified: 0 };
  }

  const r1 = await nbaCol.updateMany(
    { $or: [{ "embedInProduct.productId": oldOid }, { "embedInProduct.productId": oldS }] },
    { $set: { "embedInProduct.productId": canonicalOid } }
  );
  const r2 = await nbaCol.updateMany(
    {
      $or: [
        { "actionMetadata.productRecommendation.productId": oldOid },
        { "actionMetadata.productRecommendation.productId": oldS },
      ],
    },
    { $set: { "actionMetadata.productRecommendation.productId": canonicalOid } }
  );

  return {
    collection: "next_best_actions",
    matched: r1.matchedCount + r2.matchedCount,
    modified: r1.modifiedCount + r2.modifiedCount,
  };
}

function dedupeLastRecommendationsArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return arr;
  const seen = new Set();
  const out = [];
  for (const rec of arr) {
    const pid = rec.productId;
    const k = idKey(pid);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(rec);
  }
  return out;
}

function dedupeCartProductsArray(products) {
  if (!Array.isArray(products) || products.length === 0) return products;
  const byId = new Map();
  for (const line of products) {
    const k = idKey(line._id);
    if (!byId.has(k)) {
      byId.set(k, { ...line, amount: Number(line.amount) || 1 });
    } else {
      const cur = byId.get(k);
      cur.amount = (Number(cur.amount) || 1) + (Number(line.amount) || 1);
    }
  }
  return Array.from(byId.values());
}

function recommendationsNeedDedupe(lr) {
  if (!Array.isArray(lr) || lr.length < 2) return false;
  const keys = lr.map((r) => idKey(r.productId));
  return new Set(keys).size !== keys.length;
}

async function dedupeAllUserRecommendations(usersCol, dryRun) {
  if (dryRun) return { scanned: 0, updated: 0 };
  const cursor = usersCol.find({
    lastRecommendations: { $exists: true, $ne: [] },
  });
  let scanned = 0;
  let updated = 0;
  for await (const doc of cursor) {
    scanned++;
    const lr = doc.lastRecommendations || [];
    if (!recommendationsNeedDedupe(lr)) continue;
    const next = dedupeLastRecommendationsArray(lr);
    await usersCol.updateOne({ _id: doc._id }, { $set: { lastRecommendations: next } });
    updated++;
  }
  return { scanned, updated };
}

function cartNeedsDedupe(prods) {
  if (!Array.isArray(prods) || prods.length < 2) return false;
  const keys = prods.map((p) => idKey(p._id));
  return new Set(keys).size !== keys.length;
}

async function dedupeAllCarts(cartsCol, dryRun) {
  if (dryRun) return { scanned: 0, updated: 0 };
  const cursor = cartsCol.find({ products: { $exists: true, $ne: [] } });
  let scanned = 0;
  let updated = 0;
  for await (const doc of cursor) {
    scanned++;
    const prods = doc.products || [];
    if (!cartNeedsDedupe(prods)) continue;
    const next = dedupeCartProductsArray(prods);
    await cartsCol.updateOne({ _id: doc._id }, { $set: { products: next } });
    updated++;
  }
  return { scanned, updated };
}

function mergeMissingFields(survivor, loser) {
  const out = { ...survivor };
  for (const [key, val] of Object.entries(loser)) {
    if (key === "_id") continue;
    const cur = out[key];
    const empty =
      cur === undefined ||
      cur === null ||
      (typeof cur === "string" && cur.trim() === "") ||
      (typeof cur === "object" && cur !== null && !Array.isArray(cur) && Object.keys(cur).length === 0);
    if (empty && val !== undefined && val !== null) {
      out[key] = val;
    }
  }
  return out;
}

async function main() {
  const { apply, dryRun, mergeFields } = parseArgs(process.argv.slice(2));

  console.log("═".repeat(60));
  console.log(`Deduplicate products by code — ${dryRun ? "DRY-RUN" : "APPLY"}`);
  console.log("═".repeat(60));
  console.log(`DB: ${CONFIG.dbName} | collection: ${CONFIG.productsCol}`);

  if (!CONFIG.mongoUri) {
    throw new Error("MONGO_URI or MONGODB_URI is required");
  }

  const client = new MongoClient(CONFIG.mongoUri);
  await client.connect();
  const db = client.db(CONFIG.dbName);
  const productsCol = db.collection(CONFIG.productsCol);

  const groups = await findDuplicateGroups(productsCol);
  console.log(`\nFound ${groups.length} duplicate code group(s).\n`);

  const report = {
    mode: dryRun ? "dry-run" : "apply",
    groups: [],
    summary: { groups: groups.length, productsToDelete: 0, refRewritesPlanned: 0 },
    postDedupe: null,
    deletes: null,
  };

  const allLosers = [];

  for (const g of groups) {
    const code = g._id;
    const ids = g.ids.map((id) => toObjectId(id)).filter(Boolean);
    if (ids.length < 2) continue;

    const docs = await productsCol.find({ _id: { $in: ids } }).toArray();
    const docsByKey = new Map(docs.map((d) => [idKey(d._id), d]));

    const refCounts = new Map();
    for (const id of ids) {
      const n = await countRefsForProduct(db, id);
      refCounts.set(idKey(id), n);
    }

    const survivor = pickCanonical(ids, refCounts, docsByKey);
    const survivorKey = idKey(survivor);
    const losers = ids.filter((id) => !id.equals(survivor));

    let survivorDoc = docsByKey.get(survivorKey);
    if (mergeFields && !dryRun) {
      for (const loser of losers) {
        const loserDoc = docsByKey.get(idKey(loser));
        if (loserDoc) survivorDoc = mergeMissingFields(survivorDoc, loserDoc);
      }
      await productsCol.replaceOne({ _id: survivor }, survivorDoc);
    }

    const groupReport = {
      code,
      ids: ids.map((id) => id.toHexString()),
      refCounts: Object.fromEntries(
        ids.map((id) => [id.toHexString(), refCounts.get(idKey(id))])
      ),
      prices: Object.fromEntries(
        ids.map((id) => [id.toHexString(), getPriceAmount(docsByKey.get(idKey(id)))])
      ),
      survivor: survivor.toHexString(),
      losers: losers.map((id) => id.toHexString()),
      operations: [],
    };

    let refRewrites = 0;
    for (const loser of losers) {
      refRewrites += await countRefsForProduct(db, loser);
    }
    report.summary.refRewritesPlanned += refRewrites;
    report.summary.productsToDelete += losers.length;

    if (dryRun) {
      for (const loser of losers) {
        const o = await rewriteUserRecommendations(
          db.collection("users"),
          loser,
          survivor,
          survivorDoc,
          true
        );
        const o2 = await rewriteOrderLines(db.collection("orders"), loser, survivor, survivorDoc, true);
        const o3 = await rewriteCartLines(db.collection("carts"), loser, survivor, survivorDoc, true);
        const o4 = await rewriteNextBestActions(db.collection("next_best_actions"), loser, survivor, true);
        groupReport.operations.push({ loser: loser.toHexString(), counts: [o, o2, o3, o4] });
      }
      report.groups.push(groupReport);
      allLosers.push(...losers);
      continue;
    }

    for (const loser of losers) {
      const canonicalDoc = (await productsCol.findOne({ _id: survivor })) || survivorDoc;
      const ops = [
        await rewriteUserRecommendations(
          db.collection("users"),
          loser,
          survivor,
          canonicalDoc,
          false
        ),
        await rewriteOrderLines(db.collection("orders"), loser, survivor, canonicalDoc, false),
        await rewriteCartLines(db.collection("carts"), loser, survivor, canonicalDoc, false),
        await rewriteNextBestActions(db.collection("next_best_actions"), loser, survivor, false),
      ];
      groupReport.operations.push({ loser: loser.toHexString(), ops });
    }

    const del = await productsCol.deleteMany({ _id: { $in: losers } });
    groupReport.deletedCount = del.deletedCount;
    report.groups.push(groupReport);
    allLosers.push(...losers);
  }

  if (!dryRun && groups.length > 0) {
    console.log("\nPost-pass: dedupe lastRecommendations + cart lines...");
    const usersDedupe = await dedupeAllUserRecommendations(db.collection("users"), false);
    const cartsDedupe = await dedupeAllCarts(db.collection("carts"), false);
    report.postDedupe = { users: usersDedupe, carts: cartsDedupe };
  } else {
    report.postDedupe = dryRun
      ? { note: "Skipped in dry-run (would dedupe recommendation + cart arrays after apply)" }
      : null;
  }

  if (!dryRun && allLosers.length > 0) {
    report.deletes = { loserIds: [...new Set(allLosers.map((id) => id.toHexString()))] };
  }

  console.log("\n" + "─".repeat(60));
  console.log(JSON.stringify(report, null, 2));
  console.log("─".repeat(60));

  await client.close();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
