import { NextResponse } from "next/server";
import { connectToDatabase } from "../../_db/connect";
const { ObjectId } = require('mongodb');

export async function POST(request) {
    console.log("POST", request)
    const userId = await request.json(); 
    console.log(userId)
    const db = await connectToDatabase();
    const collection = db.collection("cart");

    const cart = await collection
        .find({user: new ObjectId(String(userId)) })
        .toArray();

    return NextResponse.json({ cart }, { status: 200 });
}