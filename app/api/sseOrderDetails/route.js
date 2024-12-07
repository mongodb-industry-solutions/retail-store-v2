import { getOrderDetailsChangeStream } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

const HEARTBEAT_INTERVAL = 5000 // Keep alive interval in milliseconds

export async function GET(req) {
  // Check if the client accepts SSE
  if (req.headers.get('accept') === 'text/event-stream') {
    // Parse the URL to get query parameters
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
        return new Response('Order ID is required', { status: 400 });
    }

    console.log('orderId req: ', orderId)

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    
    // Set SSE headers
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const intervalId = setInterval(() => {
      // Send a heartbeat message to keep the connection alive
      if (writable.locked) {
        writer.write(encoder.encode(': heartbeat\n\n')).catch((error) => {
          console.error('Error writing heartbeat:', error);
        });
      } else {
        console.warn('Writable stream is not locked, skipping heartbeat.');
      }
    }, HEARTBEAT_INTERVAL);

    // Send real-time updates to the client
    const sendUpdate = (data) => {
      if (writable.locked) {
        const event = `data: ${JSON.stringify(data)}\n\n`;
        writer
            .write(encoder.encode(event))
            .catch((error) => {
            console.error('Error writing update:', error);
            });
      } else {
        console.warn('Writable stream is not locked, skipping update.');
      }
    }

    const changeStream = await getOrderDetailsChangeStream(orderId);

    const changeListener = (change) => {
      // Notify the client about the change
      console.log('- changeListener: ', change)
      sendUpdate(change);
    };

    changeStream.on('change', changeListener);

    // Handle client disconnect
    req.signal.addEventListener('abort', () => {
      // Clean up resources and stop sending updates when the client disconnects
      console.log("Client disconnected");
      clearInterval(intervalId);
      changeStream.off('change', changeListener);
      writer.close().catch((error) => {
        console.error('Error closing writer:', error);
      });
    });

    return new NextResponse(readable, { headers });
    
  } else {
    // Return a 404 response for non-SSE requests
    console.log('404');
    return new NextResponse('Not Found', { status: 404 });
  }
}