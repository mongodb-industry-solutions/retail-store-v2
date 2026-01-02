import { NextRequest, NextResponse } from 'next/server';

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

    // TODO:
    // 1. Store the event in your database
    // 2. Process the event data
    // 3. Trigger any necessary business logic

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