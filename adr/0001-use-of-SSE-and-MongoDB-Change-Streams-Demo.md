# ADR: Use of SSE + MongoDB Change Streams in the Demo

## ✅ What This Demo Does Well

- You're using **SSE (Server-Sent Events)**, which is **lightweight and unidirectional**—perfect for receiving push-style updates from the server without the complexity of WebSockets.

- You're leveraging **MongoDB Change Streams** to detect **real-time changes** in the database. This is a powerful feature to build **reactive user experiences** without polling.

- The frontend automatically responds to backend changes, which results in excellent UX for use cases like:
  - Dashboards
  - Notifications
  - Live queues
  - Collaborative interfaces

## ⚠️ What to Improve for Production-Grade Usage

### 1. ❌ Avoid Exposing Change Streams Directly to the Frontend

While it technically works, exposing Change Streams directly from the frontend is **not recommended** in production.

| Risk        | Description                                                                 |
|-------------|-----------------------------------------------------------------------------|
| 🔓 Security | You're exposing potentially sensitive DB events directly to the client.     |
| 🌊 Scalability | Each SSE connection creates a MongoDB cursor → leads to poor scaling if thousands of users are connected. |
| 🤯 Control  | It becomes hard to apply business rules, transform payloads, or audit events. |

---

### 2. ✅ Recommended Production Architecture

[MongoDB Change Stream]
        │
        ▼
[Backend Listener — Microservice or Serverless Function]
        │
        ▼
[Event Broker — Redis Pub/Sub, Kafka, Socket.io, etc.]
        │
        ▼
[Frontend — Subscribes via SSE or WebSocket]


**Benefits of this approach:**

- MongoDB maintains only 1 (or a few) open cursors—not 1 per user.
- You centralize **business logic**, **event filtering**, and **transformation** in the backend.
- The frontend receives only **secure, lightweight events**, customized per use case.

---

### 3. ✅ Add Session Cleanup and Deduplication Controls

- Prevent multiple SSE connections per tab/user/sessionId.
- Always call `changeStream.close()` when disconnecting to avoid cursor leaks.
- Use backoff strategies and TTLs to handle reconnection logic.
- Avoid keeping idle sessions alive without purpose.

---

## 🧪 Demo Context Disclaimer

> ⚠️ **This demo intentionally connects SSE from the frontend directly to MongoDB Change Streams to simplify real-time behavior.**
>
> While this approach works in controlled environments, it is **not recommended for production**. For real-world applications, use a backend intermediary to ensure proper scalability, security, and maintainability.