import { getChangeStream } from "@/lib/mongodb";
import { NextResponse } from "next/server";

const HEARTBEAT_INTERVAL = 5000; // Interval to keep SSE connection alive

const changeStreams = new Map();
const changeListeners = new Map();

export async function GET(req) {
  // Return 404 if request is not for Server-Sent Events
  if (req.headers.get("accept") !== "text/event-stream") {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Create transform streams to communicate SSE data
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Set required headers for SSE
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Parse URL query parameters
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  const colName = url.searchParams.get("colName");
  const _id = url.searchParams.get("_id");

  // Validate required sessionId parameter
  if (!sessionId) {
    return new NextResponse("Missing required parameter: sessionId", { status: 400 });
  }

  const key = sessionId;

  // Send heartbeat every interval to keep connection alive
  const intervalId = setInterval(() => {
    if (writable.locked) {
      writer.write(encoder.encode(": heartbeat\n\n")).catch((error) => {
        console.error("Error writing heartbeat:", error);
      });
    }
  }, HEARTBEAT_INTERVAL);

  // Helper to send JSON-encoded updates to the client
  const sendUpdate = (data) => {
    if (writable.locked) {
      const event = `data: ${JSON.stringify(data)}\n\n`;
      writer.write(encoder.encode(event)).catch((error) => {
        console.error("Error writing update:", error);
      });
    }
  };

  // Build MongoDB Change Stream filter based on parameters
  const filter = {};
  if (colName) filter["ns.coll"] = colName;
  if (_id) filter["documentKey._id"] = { $oid: _id };

  // Get MongoDB Change Stream for filtered events
  const changeStream = await getChangeStream(filter, key);

  // Listener that sends changes to the client
  const changeListener = (change) => {
    sendUpdate(change);
  };

  // Register listener and store references to manage lifecycle
  changeStream.on("change", changeListener);
  changeStreams.set(key, changeStream);
  changeListeners.set(key, changeListener);

  // Clean up resources when client disconnects
  req.signal.addEventListener("abort", () => {
    console.log(`Client disconnected: sessionId=${key}`);

    clearInterval(intervalId);

    if (changeStreams.has(key)) {
      const cs = changeStreams.get(key);
      cs.off("change", changeListeners.get(key));
      cs.close(); // Close Change Stream explicitly to release resources
      changeStreams.delete(key);
      changeListeners.delete(key);
    }

    writer.close().catch((error) => {
      console.error("Error closing writer:", error);
    });
  });

  return new NextResponse(readable, { headers });
}
