import { MongoClient } from "mongodb";
import { EJSON } from "bson";

// Validate required environment variables
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}
if (!process.env.DATABASE_NAME) {
  throw new Error('Invalid/Missing environment variable: "DATABASE_NAME"');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.DATABASE_NAME;

//  Provide a custom appName to identify connections in MongoDB monitoring tools (e.g., Atlas, db.currentOp)
const options = {
  appName: "sse-store-events",
  maxPoolSize: 10,        // Limit connection pool to prevent resource exhaustion
  minPoolSize: 1,
  maxIdleTimeMS: 30000,   // Close idle connections after 30s
  serverSelectionTimeoutMS: 5000,
};

let client;
let clientPromise;

// Use a global Map so change streams survive hot reloads in dev
if (!global._changeStreams) {
  global._changeStreams = new Map();
}
const changeStreams = global._changeStreams;

//  Reuse a single global MongoClient instance to avoid creating new connections on every hot reload
if (!global._mongoClientPromise) {
  console.log("[MongoDB] Creating new MongoClient...");
  client = new MongoClient(uri, options);
  clientPromise = client.connect().then((c) => {
    console.log("[MongoDB] Connected successfully.");
    return c;
  });
  global._mongoClientPromise = clientPromise;
} else {
  console.log("[MongoDB] Reusing existing MongoClient (hot reload).");
  clientPromise = global._mongoClientPromise;
}

/**
 * Open or reuse a MongoDB Change Stream for the given key.
 * This function stores ChangeStreams in memory (Map) to avoid duplicates.
 * NOTE: Callers should attach their own "change" listeners — this function
 * only creates the stream and handles errors internally.
 */
async function getChangeStream(filter, key) {
  if (!changeStreams.has(key)) {
    console.log(`[MongoDB] Opening new change stream for key="${key}" filter=${JSON.stringify(filter)}. Total open: ${changeStreams.size + 1}`);
    const client = await clientPromise;
    const db = client.db(dbName);

    // Convert filter to Extended JSON for compatibility with $match
    const filterEJSON = EJSON.parse(JSON.stringify(filter));

    const csOptions = { fullDocument: "updateLookup" };
    const pipeline = [{ $match: filterEJSON }];

    const changeStream = db.watch(pipeline, csOptions);

    changeStream.on("error", (error) => {
      console.error(`[MongoDB] Change stream error for key="${key}":`, error.message || error);
      // Remove broken stream so a fresh one can be created on next request
      changeStreams.delete(key);
    });

    changeStream.on("close", () => {
      console.log(`[MongoDB] Change stream closed event for key="${key}". Total open: ${changeStreams.size}`);
    });

    changeStreams.set(key, changeStream);
  } else {
    console.log(`[MongoDB] Reusing existing change stream for key="${key}". Total open: ${changeStreams.size}`);
  }
  return changeStreams.get(key);
}

/**
 * Close and remove a specific change stream by key.
 */
async function closeChangeStream(key) {
  if (changeStreams.has(key)) {
    console.log(`[MongoDB] Closing change stream for key="${key}". Total before close: ${changeStreams.size}`);
    const cs = changeStreams.get(key);
    try {
      await cs.close();
    } catch (err) {
      console.error(`[MongoDB] Error closing change stream for key="${key}":`, err.message || err);
    }
    changeStreams.delete(key);
    console.log(`[MongoDB] Change stream removed for key="${key}". Total remaining: ${changeStreams.size}`);
  }
}

/**
 * Graceful shutdown: close all SSE sessions, change streams, and the MongoDB client.
 */
async function gracefulShutdown(signal) {
  console.log(`\n[${signal}] Shutting down gracefully...`);

  // First, clear all SSE session intervals so the event loop can drain
  if (global._sseSessionListeners) {
    console.log(`[Shutdown] Cleaning up ${global._sseSessionListeners.size} SSE session(s)...`);
    for (const [key, session] of global._sseSessionListeners.entries()) {
      try {
        if (session.intervalId) clearInterval(session.intervalId);
        session.changeStream?.off("change", session.listener);
        try { session.controller?.close(); } catch (_) {}
        console.log(`[Shutdown] Cleaned up SSE session: ${key}`);
      } catch (err) {
        console.error(`[Shutdown] Error cleaning up SSE session ${key}:`, err.message || err);
      }
    }
    global._sseSessionListeners.clear();
  }

  // Clear the status logger
  if (global._sseStatusLogger) {
    clearInterval(global._sseStatusLogger);
    global._sseStatusLogger = null;
  }

  // Close all open change streams
  console.log(`[Shutdown] Closing ${changeStreams.size} change stream(s)...`);
  for (const [key, cs] of changeStreams.entries()) {
    try {
      await cs.close();
      console.log(`[Shutdown] Closed change stream: ${key}`);
    } catch (err) {
      console.error(`[Shutdown] Error closing change stream ${key}:`, err.message || err);
    }
  }
  changeStreams.clear();

  // Close the MongoDB client
  try {
    const client = await clientPromise;
    await client.close();
    console.log("[Shutdown] MongoDB client closed.");
  } catch (err) {
    console.error("[Shutdown] Error closing MongoDB client:", err.message || err);
  }

  console.log("[Shutdown] Graceful shutdown complete. Exiting.");

  // Force exit after a timeout in case something is still holding the event loop
  setTimeout(() => {
    console.error("[Shutdown] Forced exit after timeout.");
    process.exit(1);
  }, 5000).unref();

  process.exit(0);
}

// Register shutdown handlers (only once per process)
if (!global._shutdownHandlersRegistered) {
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  global._shutdownHandlersRegistered = true;
  console.log("[MongoDB] Registered SIGTERM/SIGINT shutdown handlers.");
}

export { clientPromise, dbName, getChangeStream, closeChangeStream };
