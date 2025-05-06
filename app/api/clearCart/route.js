import { clientPromise, dbName } from "@/lib/mongodb";
import { NextResponse } from "next/server";
const { ObjectId } = require('mongodb');

export async function POST(request) {
    try {
        let userId  = await request.json();
        const client = await clientPromise
        const db = client.db(dbName);
        const cartsCollection = db.collection('carts');

        await cartsCollection.updateOne(
            { user: new ObjectId(userId) }, // match the user by ID
            { $set: { products: [] } } // set products field to an empty array
          );
    
        return NextResponse.json({ products: [] }, { status: 200 });
    }  catch (error) {
        console.error('Error clearing cart:', error);
        return new Response('Error clearing cart', { status: 500 });
      } finally {
        //await closeDatabase (); // Close the MongoDB client connection
      }
}