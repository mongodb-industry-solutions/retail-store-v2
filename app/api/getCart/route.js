import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";
const { ObjectId } = require('mongodb');

export async function POST(request) {
    const userId = await request.json(); 
        const client = await clientPromise
        const db = client.db(dbName);
        const collection = db.collection("carts");

    const cart = await collection
        .find({user: new ObjectId(String(userId)) })
        .toArray()
    
    return NextResponse.json({ cart: cart[0] || null }, { status: 200 });
}