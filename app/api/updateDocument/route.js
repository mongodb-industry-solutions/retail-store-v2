import { clientPromise, dbName } from "@/lib/mongodb";
import { NextResponse } from "next/server";
const { ObjectId } = require('mongodb');

export async function POST(request) {
    try {
        let { 
            filter={}, 
            update={},
            document={}, 
            databaseName = dbName, 
            collectionName 
        } = await request.json();        
        console.log(filter, update, document)
        const client = await clientPromise
        const db = client.db(databaseName);
        const collection = db.collection(collectionName);
        
        // Convert _id to ObjectId if it exists and is a string
        if (filter._id && typeof filter._id === 'string') {
            filter._id = new ObjectId(filter._id);
        }
        
        // Use updateOne with filter and update operations
        const updateOperation = update && Object.keys(update).length > 0 ? update : { $set: document };
        const result = await collection.updateOne(filter, updateOperation);
    
        return NextResponse.json({ 
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            upsertedId: result.upsertedId,
            acknowledged: result.acknowledged
        }, { status: 200 });
    }  catch (error) {
        console.error('Error updating document:', error);
        return new Response('Error updating document', { status: 500 });
      } finally {
        //await closeDatabase (); // Close the MongoDB client connection
      }
}
