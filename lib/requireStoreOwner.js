import { clientPromise, dbName } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

/**
 * Resolves DB + verifies actingUserId is a users document with type "owner".
 * @param {unknown} actingUserId
 * @returns {Promise<{ error: NextResponse } | { db: import('mongodb').Db, user: object }>}
 */
export async function getOwnerContext(actingUserId) {
  if (
    !actingUserId ||
    typeof actingUserId !== "string" ||
    !/^[a-fA-F0-9]{24}$/.test(actingUserId)
  ) {
    return {
      error: NextResponse.json(
        { error: "actingUserId must be a valid 24-char hex user id" },
        { status: 400 }
      ),
    };
  }

  const client = await clientPromise;
  const db = client.db(dbName);
  let oid;
  try {
    oid = new ObjectId(actingUserId);
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid actingUserId" }, { status: 400 }),
    };
  }

  const user = await db.collection("users").findOne({ _id: oid });
  if (!user || user.type !== "owner") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { db, user };
}
