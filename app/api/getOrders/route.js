import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";
const { ObjectId } = require('mongodb');

export async function POST(request) {
    const userId = await request.json(); 
    const client = await clientPromise
    const db = client.db(dbName);
    const collection = db.collection("orders");

    const orders = await collection
        .find({user: new ObjectId(String(userId)) })
        .sort({ _id: -1 }) // Sort by _id in descending order for newest first
        .toArray()
    
    return NextResponse.json({ orders: orders || [] }, { status: 200 });
}