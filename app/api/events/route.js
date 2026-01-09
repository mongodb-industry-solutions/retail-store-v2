import { NextRequest, NextResponse } from 'next/server';
import { clientPromise, dbName } from '@/lib/mongodb';

const eventsTimeSeriesCollection = 'events_ingest_ts'
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
    try {
      const client = await clientPromise;
      const db = client.db(dbName);
      const collection = db.collection(eventsTimeSeriesCollection);
      
      const eventDocument = {
        ...eventData,
        // Convert timestamp string to Date object for MongoDB time series
        timestamp: new Date(eventData.timestamp)
      };
      
      const result = await collection.insertOne(eventDocument);
      console.log('Event stored in MongoDB:', result.insertedId);
      
    } catch (dbError) {
      console.error('Error storing event in MongoDB:', dbError);
      // Don't return error here, just log it - we still want to return success
    }


    // For now, just return a success response
    const response = {
      id: Date.now().toString(),
      status: 'received',
      timestamp: new Date().toISOString(),
      event: eventData
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