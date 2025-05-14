import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";
const { ObjectId } = require('mongodb');

export async function POST(request) {
    const orderId = await request.json();
    const client = await clientPromise
    const db = client.db(dbName);
    const collection = db.collection("orders");

    const order = await collection
        .find({ _id: new ObjectId(String(orderId)) })
        .toArray()

    return NextResponse.json({ order: order[0] || null }, { status: 200 });
}