import { getChangeStream, closeChangeStream } from "@/lib/mongodb";
import { NextResponse } from "next/server";

const HEARTBEAT_INTERVAL = 5000; // Interval to keep SSE connection alive
const STATUS_LOG_INTERVAL = 30000; // Log status every 30s

// Use global to survive Next.js hot reloads in dev
if (!global._sseSessionListeners) {
  global._sseSessionListeners = new Map();
}
const sessionListeners = global._sseSessionListeners;

// Periodic status logger: shows active sessions every 30s (only when sessions exist)
if (!global._sseStatusLogger) {
  global._sseStatusLogger = setInterval(() => {
    if (sessionListeners.size > 0) {
      const now = Date.now();
      const sessions = [];
      for (const [key, session] of sessionListeners.entries()) {
        const ageSeconds = Math.round((now - session.createdAt) / 1000);
        sessions.push(`  ${key} (age: ${ageSeconds}s, col: ${session.colName || '?'})`);
      }
      console.log(`[SSE status] ${sessionListeners.size} active session(s):\n${sessions.join('\n')}`);
    }
  }, STATUS_LOG_INTERVAL);
  // Don't let this interval prevent process exit
  global._sseStatusLogger.unref();
}

/**
 * Clean up all resources for a given session key.
 */
async function cleanupSession(key, reason) {
  if (!sessionListeners.has(key)) return;
  
  const session = sessionListeners.get(key);
  const ageSeconds = Math.round((Date.now() - session.createdAt) / 1000);
  console.log(`[SSE cleanup] sessionId=${key} reason="${reason}" age=${ageSeconds}s col=${session.colName || '?'}`);

  // Stop the heartbeat interval
  if (session.intervalId) {
    clearInterval(session.intervalId);
  }

  // Remove change listener from MongoDB change stream
  try {
    session.changeStream?.off("change", session.listener);
  } catch (_) {}

  // Close the controller/stream
  try {
    session.controller?.close();
  } catch (_) {} // may already be closed

  sessionListeners.delete(key);
  console.log(`[SSE cleanup] sessionId=${key} done. Remaining sessions: ${sessionListeners.size}`);

  // Close the change stream via the centralized manager
  await closeChangeStream(key);
}

export async function GET(req) {
  // Return 404 if request is not for Server-Sent Events
  if (req.headers.get("accept") !== "text/event-stream") {
    return new NextResponse("Not Found", { status: 404 });
  }

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

  console.log(`[SSE connect] sessionId=${key} col=${colName} _id=${_id || 'none'} existingSessions=${sessionListeners.size}`);

  // If there's already a session for this key, clean it up first
  if (sessionListeners.has(key)) {
    console.log(`[SSE connect] Replacing existing session for sessionId=${key}`);
    await cleanupSession(key, "replaced by new connection");
  }

  const encoder = new TextEncoder();
  let isClosed = false;

  // Build MongoDB Change Stream filter based on parameters
  const filter = {};
  if (colName) filter["ns.coll"] = colName;
  if (_id) filter["documentKey._id"] = { $oid: _id };

  // Also support uid/sid query params for customer behaviour / next best actions
  // Note: different collections use different field names:
  //   session_state uses: userId, sessionId
  //   session_signals & next_best_actions use: uid, sid
  // Use $or to match either convention so a single SSE filter works across all collections
  const uid = url.searchParams.get("uid");
  const sid = url.searchParams.get("sid");
  if (uid) {
    filter["$or"] = [
      { "fullDocument.userId": uid },
      { "fullDocument.uid": uid }
    ];
  }
  if (sid && !uid) {
    // If only sid (no uid), use $or for sid alone
    filter["$or"] = [
      { "fullDocument.sessionId": sid },
      { "fullDocument.sid": sid }
    ];
  } else if (sid && uid) {
    // If both uid and sid, combine into a single $or with both field conventions
    filter["$or"] = [
      { "fullDocument.userId": uid, "fullDocument.sessionId": sid },
      { "fullDocument.uid": uid, "fullDocument.sid": sid }
    ];
  }

  console.log(`[SSE connect] sessionId=${key} filter=${JSON.stringify(filter)}`);

  // Use ReadableStream with a controller — the cancel() callback fires reliably
  // when the client disconnects, unlike TransformStream where write failures are silent.
  const stream = new ReadableStream({
    async start(controller) {
      // Get MongoDB Change Stream for filtered events
      console.log(`[SSE stream start] sessionId=${key} getting change stream...`);
      const changeStream = await getChangeStream(filter, key);
      console.log(`[SSE stream start] sessionId=${key} change stream ready`);

      // Helper to safely enqueue data
      const enqueue = (data) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(data));
        } catch (err) {
          console.warn(`[SSE enqueue error] sessionId=${key}: ${err.message || err}`);
          isClosed = true;
          cleanupSession(key, "enqueue error");
        }
      };

      // Listener that sends changes to the client
      const changeListener = (change) => {
        console.log(`[SSE change event] sessionId=${key} col=${colName} opType=${change.operationType}`);
        enqueue(`data: ${JSON.stringify(change)}\n\n`);
      };

      // Register listener
      changeStream.on("change", changeListener);

      // Send heartbeat every interval to keep connection alive
      const intervalId = setInterval(() => {
        enqueue(": heartbeat\n\n");
      }, HEARTBEAT_INTERVAL);

      // Store session references for cleanup
      sessionListeners.set(key, {
        intervalId,
        listener: changeListener,
        changeStream,
        controller,
        colName,
        createdAt: Date.now(),
      });

      console.log(`[SSE stream start] sessionId=${key} fully initialized. Total active sessions: ${sessionListeners.size}`);

      // Also listen for abort signal as a secondary cleanup trigger
      req.signal.addEventListener("abort", () => {
        console.log(`[SSE abort signal] sessionId=${key}`);
        if (!isClosed) {
          isClosed = true;
          cleanupSession(key, "abort signal");
        }
      });
    },
    cancel() {
      // ✅ This fires when the client disconnects and the stream is cancelled.
      // This is the PRIMARY cleanup mechanism.
      console.log(`[SSE cancel] sessionId=${key} — stream cancelled by client disconnect`);
      isClosed = true;
      cleanupSession(key, "stream cancelled (client disconnected)");
    },
  });

  // Set required headers for SSE
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  return new NextResponse(stream, { headers });
}
