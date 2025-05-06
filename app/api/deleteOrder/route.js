import { NextResponse } from "next/server";
import { clientPromise, dbName } from "@/lib/mongodb";
const { ObjectId } = require('mongodb');

export async function POST(request) {
    try {
        let { orderId } = await request.json();
        const client = await clientPromise
        const db = client.db(dbName);
        const ordersCollection = db.collection('orders');

        console.log('delete orderId', orderId)
        // Use findOneAndUpdate to upsert the cart and return the updated document
        const result = await ordersCollection.deleteOne({ "_id" : new ObjectId(orderId)  } );

        return NextResponse.json({ result: result }, { status: 200 });
    } catch (error) {
        console.error('Error creating or updating cart:', error);
        return new Response('Error creating or updating cart', { status: 500 });
    } finally {
        //await closeDatabase(); // Close the MongoDB client connection
    }
}
