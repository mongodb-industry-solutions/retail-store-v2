/**
 * One-time: backfill users.type = "customer" where missing, insert Store Owner (type "owner").
 *
 * Usage (from repo root):
 *   node scripts/seed-store-owner.js
 *
 * Reads MONGODB_URI and DATABASE_NAME from the environment (export or .env.local).
 */

const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

// 1x1 transparent PNG — valid file for /rsc/users/<id>.png
const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  try {
    const raw = fs.readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env.local optional if vars are already exported
  }
}

async function main() {
  loadEnvLocal();
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DATABASE_NAME;
  if (!uri || !dbName) {
    console.error("Missing MONGODB_URI or DATABASE_NAME in environment or .env.local");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection("users");

  const backfill = await users.updateMany(
    { type: { $exists: false } },
    { $set: { type: "customer" } }
  );
  console.log(`Backfill type=customer for users missing type: modified ${backfill.modifiedCount}`);

  const existingOwner = await users.findOne({ type: "owner" });
  if (existingOwner) {
    console.log("Owner user already exists:", existingOwner._id.toString(), existingOwner.name);
    await ensureAvatarFile(existingOwner._id.toString());
    await client.close();
    return;
  }

  const sample = await users.findOne({});
  const ownerDoc = {
    name: "Store Owner",
    type: "owner",
    version: sample?.version ?? 2,
    lastRecommendations: sample?.lastRecommendations ?? [],
  };
  if (sample && "surname" in sample) {
    ownerDoc.surname = "";
  }

  const { insertedId } = await users.insertOne(ownerDoc);
  const idStr = insertedId.toString();
  console.log("Inserted Store Owner user _id:", idStr);

  await ensureAvatarFile(idStr);
  await client.close();
}

function ensureAvatarFile(userId) {
  const dir = path.join(__dirname, "..", "public", "rsc", "users");
  fs.mkdirSync(dir, { recursive: true });
  const dest = path.join(dir, `${userId}.png`);
  if (fs.existsSync(dest)) {
    console.log("Avatar already present:", dest);
    return;
  }
  const logo = path.join(__dirname, "..", "public", "leafyLogo.png");
  if (fs.existsSync(logo)) {
    fs.copyFileSync(logo, dest);
    console.log("Copied leafyLogo.png to", dest);
  } else {
    fs.writeFileSync(dest, TINY_PNG);
    console.log("Wrote placeholder PNG to", dest);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
