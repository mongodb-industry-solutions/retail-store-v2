import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";
const { ObjectId } = require('mongodb');

export async function POST(request) {
  const { orderId, statusObj } = await request.json();
  console.log(orderId, statusObj)
  const client = await clientPromise
  const db = client.db(dbName);
  const collection = db.collection("orders");

  const filter = { _id: ObjectId.createFromHexString(orderId) };
  const update = {
    $push: {
      status_history: statusObj
    }
  };
  const result = await collection.updateOne(filter, update)
  if (result.matchedCount > 0) {
    console.log(`Successfully updated the order with id: ${orderId}`);
  } else {
    console.log(`No document found with id: ${orderId}`);
  }
  console.log(result)
  return NextResponse.json({ order: result || null }, { status: 200 });
}