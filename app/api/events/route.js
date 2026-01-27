import { NextResponse } from 'next/server';
import { clientPromise, dbName } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/constants';

export async function POST(request) {
  try {
    const eventData = await request.json();
    
    // Basic validation
    if (!eventData.tags || !eventData.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: tags and timestamp' },
        { status: 400 }
      );
    }

    // Log the event (you can replace this with actual database storage)
    console.log('Event received:', {
      ...eventData,
      receivedAt: new Date().toISOString()
    });
    
    // Store the event in MongoDB time series collection
    let insertedDocument = null;
    try {
      const client = await clientPromise;
      const db = client.db(dbName);
      const collection = db.collection(COLLECTIONS.EVENTS_INGEST);
      
      const eventDocument = {
        ...eventData,
        // Convert timestamp string to Date object for MongoDB time series
        timestamp: new Date(eventData.timestamp)
      };
      
      const result = await collection.insertOne(eventDocument);
      
      if (result.insertedId) {
        insertedDocument = {
          ...eventDocument,
          _id: result.insertedId
        };
        console.log('Event stored in MongoDB with _id:', result.insertedId);
      }
      
    } catch (dbError) {
      console.error('Error storing event in MongoDB:', dbError);
    }

    // Only return success if document was actually inserted
    if (!insertedDocument) {
      return NextResponse.json(
        { error: 'Failed to store event in database' },
        { status: 500 }
      );
    }

    // Return response with the stored document
    const response = {
      status: 'received',
      timestamp: new Date().toISOString(),
      event: insertedDocument
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error processing event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return NextResponse.json(
    { message: 'Events API is running' },
    { status: 200 }
  );
}