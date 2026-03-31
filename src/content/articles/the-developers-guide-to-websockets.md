---
title: "The Developer's Guide to WebSockets"
description: "Learn when and how to use WebSockets for real-time features, with practical patterns for connection management, scaling, and common pitfalls."
publishDate: "2026-03-31"
author: "gareth-clubb"
category: "backend"
tags: ["websockets", "real-time", "apis", "backend", "javascript"]
featured: false
draft: false
faqs:
  - question: "When should I use WebSockets instead of REST?"
    answer: "Use WebSockets when you need the server to push data to the client without the client requesting it first. Common examples include live chat, multiplayer games, collaborative editing, real-time dashboards, and live notifications. If your data only changes when the user takes an action (submitting a form, clicking a button), REST is simpler and more appropriate."
  - question: "What is the difference between WebSockets and Server-Sent Events?"
    answer: "Server-Sent Events (SSE) provide a one-way channel from server to client over a standard HTTP connection. WebSockets provide a full-duplex, two-way channel. SSE is simpler to implement and works well for notifications, live feeds, and dashboards where the client only needs to receive updates. WebSockets are better when both sides need to send messages, such as in chat applications or collaborative tools."
  - question: "Can WebSockets work behind a load balancer?"
    answer: "Yes, but you need sticky sessions or an external message broker. Because a WebSocket connection is persistent, all messages for a given client must reach the same server process. Sticky sessions route a client to the same backend. Alternatively, a pub/sub system like Redis lets any server broadcast to any connected client regardless of which server holds the connection."
  - question: "How many concurrent WebSocket connections can a server handle?"
    answer: "A single modern server can handle tens of thousands of concurrent WebSocket connections. Each idle connection uses very little memory (roughly 10 to 50 KB depending on the library and buffering). The practical limit depends on your message throughput, payload size, server memory, and the work each message triggers. Load testing your specific workload is the only reliable way to find your ceiling."
  - question: "Do WebSockets work on mobile networks?"
    answer: "Yes, but mobile connections are less reliable. Cellular networks frequently drop connections, switch between Wi-Fi and mobile data, and introduce higher latency. You need robust reconnection logic with exponential backoff, and your protocol should handle missed messages gracefully. A message queue or sequence numbering approach helps ensure clients catch up after a reconnect."
primaryKeyword: "websockets guide developers"
---

Most web applications are built on a request/response cycle: the client asks, the server answers. That model breaks down the moment you need data to flow in both directions without the client constantly polling. WebSockets solve this by establishing a persistent, full-duplex connection between client and server.

This guide covers when WebSockets are the right tool, how to implement them properly, and the pitfalls that catch teams out in production.

## What WebSockets Actually Are

The <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API" target="_blank" rel="noopener noreferrer">WebSocket protocol ↗</a> (defined in <a href="https://datatracker.ietf.org/doc/html/rfc6455" target="_blank" rel="noopener noreferrer">RFC 6455 ↗</a>) upgrades an HTTP connection to a persistent TCP connection. After the initial handshake, both client and server can send messages at any time without the overhead of new HTTP requests.

The key differences from HTTP:

- **Persistent connection:** No repeated handshakes or connection setup
- **Full duplex:** Both sides send and receive simultaneously
- **Low overhead:** Message framing is minimal compared to HTTP headers
- **Event driven:** Messages arrive as they happen, not when polled

A standard HTTP request includes headers that can easily reach 1 to 2 KB per request. A WebSocket frame adds just 2 to 14 bytes of overhead. When you are sending hundreds of small messages per second, that difference matters.

## When to Use WebSockets

WebSockets are not a replacement for REST. They solve a specific set of problems:

| Use Case | Why WebSockets | Alternative |
|----------|---------------|-------------|
| Live chat | Both sides send messages in real time | Long polling (higher latency) |
| Collaborative editing | Changes must propagate instantly to all users | Periodic sync (conflicts likely) |
| Live dashboards | Server pushes metric updates as they happen | SSE (if one-way is sufficient) |
| Multiplayer games | Low latency, bidirectional state updates | None practical at scale |
| Financial tickers | High frequency, server-pushed price updates | SSE or polling (higher latency) |
| Notifications | Server pushes alerts without client polling | SSE (simpler for one-way) |

If your use case only needs server-to-client updates, consider <a href="https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events" target="_blank" rel="noopener noreferrer">Server-Sent Events (SSE) ↗</a> first. SSE is simpler, works over standard HTTP, handles reconnection automatically, and is sufficient for dashboards, notifications, and live feeds.

## A Basic WebSocket Server in Node.js

The <a href="https://github.com/websockets/ws" target="_blank" rel="noopener noreferrer">ws library ↗</a> is the most widely used WebSocket implementation for Node.js. Here is a minimal server:

```javascript
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws, req) => {
  console.log(`Client connected from ${req.socket.remoteAddress}`);

  ws.on('message', (data) => {
    const message = JSON.parse(data);
    // Broadcast to all other connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
```

On the client side, the browser's built-in WebSocket API handles the connection:

```javascript
const ws = new WebSocket('ws://localhost:8080');

ws.addEventListener('open', () => {
  ws.send(JSON.stringify({ type: 'chat', text: 'Hello' }));
});

ws.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
});
```

This gets you running, but production usage requires considerably more thought.

## Connection Management Patterns

The biggest source of WebSocket bugs is poor connection lifecycle management. Connections drop, servers restart, and networks change. Your code needs to handle all of it.

### Heartbeats

TCP connections can silently die without either side knowing. A proxy, firewall, or load balancer might close an idle connection. Heartbeats (ping/pong frames) detect dead connections early:

```javascript
const HEARTBEAT_INTERVAL = 30000;

wss.on('connection', (ws) => {
  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, HEARTBEAT_INTERVAL);
```

Without heartbeats, you accumulate zombie connections that consume memory and file descriptors. This is one of the most common issues teams hit when moving from development to production. If you have not already read it, the [guide to effective error handling](/code-quality/effective-error-handling-patterns-for-cleaner-code) covers patterns that complement this approach well.

### Client-Side Reconnection

Clients must reconnect automatically when connections drop. Exponential backoff prevents thundering herd problems when a server restarts and thousands of clients try to reconnect simultaneously:

```javascript
class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.retryCount = 0;
    this.maxRetries = 10;
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener('open', () => {
      this.retryCount = 0;
    });

    this.ws.addEventListener('close', () => {
      this.reconnect();
    });
  }

  reconnect() {
    if (this.retryCount >= this.maxRetries) return;

    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
    const jitter = delay * 0.2 * Math.random();

    setTimeout(() => {
      this.retryCount++;
      this.connect();
    }, delay + jitter);
  }
}
```

The jitter is important. Without it, all clients back off to the same intervals and create periodic traffic spikes.

### Message Queuing

Messages sent while reconnecting are lost by default. If message delivery matters, queue outbound messages and flush them after reconnection:

```javascript
class WebSocketClient {
  constructor(url) {
    this.queue = [];
    // ... connection setup
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.queue.push(data);
    }
  }

  flushQueue() {
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      this.ws.send(JSON.stringify(message));
    }
  }
}
```

For critical applications, pair this with server-side message acknowledgements so the client knows which messages were actually received.

## Structuring WebSocket Messages

Raw strings are fragile. Define a message protocol early to avoid a tangled mess of `if` statements:

```javascript
// Define message types
const MessageType = {
  CHAT: 'chat',
  TYPING: 'typing',
  PRESENCE: 'presence',
  ERROR: 'error',
};

// Server-side message handler
function handleMessage(ws, raw) {
  const message = JSON.parse(raw);

  const handlers = {
    [MessageType.CHAT]: handleChat,
    [MessageType.TYPING]: handleTyping,
    [MessageType.PRESENCE]: handlePresence,
  };

  const handler = handlers[message.type];

  if (!handler) {
    ws.send(JSON.stringify({
      type: MessageType.ERROR,
      payload: { message: 'Unknown message type' },
    }));
    return;
  }

  handler(ws, message.payload);
}
```

This pattern scales cleanly as you add message types. It also makes it straightforward to add validation, logging, and rate limiting per message type.

## Scaling Beyond a Single Server

A single WebSocket server works fine for prototyping, but production systems need horizontal scaling. The challenge is that a connection lives on one specific server. When user A sends a message that needs to reach user B, and they are connected to different servers, you need a way to route that message.

### The Pub/Sub Pattern

The standard solution is an external message broker. <a href="https://redis.io/docs/latest/develop/interact/pubsub/" target="_blank" rel="noopener noreferrer">Redis Pub/Sub ↗</a> is a common choice:

<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram showing two WebSocket servers connected via Redis pub/sub, each with client connections">
  <style>
    .box { fill: none; stroke: #64748b; stroke-width: 2; rx: 8; }
    .box-highlight { fill: none; stroke: #ec4899; stroke-width: 2; rx: 8; }
    .label { font-family: Inter, system-ui, sans-serif; font-size: 13px; fill: #334155; text-anchor: middle; }
    .arrow { stroke: #94a3b8; stroke-width: 1.5; fill: none; marker-end: url(#arrowhead); }
  </style>
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#94a3b8"/>
    </marker>
  </defs>
  <!-- Clients left -->
  <rect x="20" y="20" width="90" height="35" class="box"/>
  <text x="65" y="42" class="label">Client A</text>
  <rect x="20" y="75" width="90" height="35" class="box"/>
  <text x="65" y="97" class="label">Client B</text>
  <!-- Server 1 -->
  <rect x="160" y="35" width="110" height="50" class="box"/>
  <text x="215" y="65" class="label">WS Server 1</text>
  <!-- Redis -->
  <rect x="320" y="35" width="110" height="50" class="box-highlight"/>
  <text x="375" y="65" class="label">Redis Pub/Sub</text>
  <!-- Server 2 -->
  <rect x="480" y="35" width="110" height="50" class="box"/>
  <text x="535" y="65" class="label">WS Server 2</text>
  <!-- Clients right -->
  <rect x="490" y="120" width="90" height="35" class="box"/>
  <text x="535" y="142" class="label">Client C</text>
  <!-- Arrows -->
  <line x1="110" y1="38" x2="158" y2="52" class="arrow"/>
  <line x1="110" y1="92" x2="158" y2="72" class="arrow"/>
  <line x1="270" y1="60" x2="318" y2="60" class="arrow"/>
  <line x1="430" y1="60" x2="478" y2="60" class="arrow"/>
  <line x1="535" y1="85" x2="535" y2="118" class="arrow"/>
</svg>

Each server subscribes to a Redis channel. When a message arrives on any server, it publishes to Redis. Every server receives the message and forwards it to their locally connected clients.

```javascript
import { createClient } from 'redis';
import { WebSocketServer } from 'ws';

const pub = createClient();
const sub = createClient();
await pub.connect();
await sub.connect();

const wss = new WebSocketServer({ port: 8080 });

// Subscribe to the broadcast channel
await sub.subscribe('chat', (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
});

// When a client sends a message, publish to Redis
wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    pub.publish('chat', data.toString());
  });
});
```

This approach scales horizontally. Add more WebSocket servers behind a load balancer, and Redis ensures messages reach every connected client. For a deeper look at building APIs that handle failure gracefully, see the [guide to retry and circuit breaker patterns](/backend/building-resilient-apis-with-retry-and-circuit-breaker-patterns).

## Security Considerations

WebSocket connections bypass many of the protections built into HTTP frameworks. You need to handle security explicitly.

### Authentication

Authenticate during the HTTP upgrade handshake, not after the connection is established:

```javascript
import { WebSocketServer } from 'ws';
import { verifyToken } from './auth.js';

const wss = new WebSocketServer({
  port: 8080,
  verifyClient: async ({ req }, done) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      done(false, 401, 'Unauthorized');
      return;
    }

    try {
      const user = await verifyToken(token);
      req.user = user;
      done(true);
    } catch {
      done(false, 403, 'Forbidden');
    }
  },
});
```

### Rate Limiting

Without rate limiting, a single client can flood your server. Track message counts per connection and disconnect abusive clients:

```javascript
const RATE_LIMIT = 50; // messages per window
const WINDOW_MS = 10000;

wss.on('connection', (ws) => {
  ws.messageCount = 0;
  ws.windowStart = Date.now();

  ws.on('message', (data) => {
    const now = Date.now();

    if (now - ws.windowStart > WINDOW_MS) {
      ws.messageCount = 0;
      ws.windowStart = now;
    }

    ws.messageCount++;

    if (ws.messageCount > RATE_LIMIT) {
      ws.close(1008, 'Rate limit exceeded');
      return;
    }

    // Process message
  });
});
```

The [API rate limiting guide](/backend/the-developers-guide-to-api-rate-limiting) covers broader rate limiting strategies if you want to go deeper.

### Input Validation

Never trust incoming WebSocket messages. Validate and sanitise everything:

```javascript
function validateChatMessage(data) {
  if (typeof data.text !== 'string') return false;
  if (data.text.length === 0 || data.text.length > 2000) return false;
  if (typeof data.room !== 'string') return false;
  return true;
}
```

This is especially important because WebSocket messages often bypass middleware stacks that handle validation for HTTP routes. For a broader view of authentication approaches that work well with WebSockets, see the [authentication patterns guide](/backend/authentication-patterns-every-developer-should-know).

## Common Pitfalls

### Not Handling Backpressure

If the server sends messages faster than the client can process them, the send buffer grows until the server runs out of memory. Check the `bufferedAmount` property on the client and implement flow control on the server:

```javascript
function safeSend(ws, data) {
  if (ws.bufferedAmount > 1024 * 1024) {
    // 1 MB buffer, skip or queue
    return false;
  }
  ws.send(data);
  return true;
}
```

### Ignoring Close Codes

WebSocket close codes tell you why a connection ended. Use them for debugging and for deciding whether to reconnect:

| Code | Meaning | Reconnect? |
|------|---------|------------|
| 1000 | Normal closure | No |
| 1001 | Going away (page navigation) | No |
| 1006 | Abnormal closure (no close frame) | Yes |
| 1008 | Policy violation | No |
| 1011 | Server error | Yes, with backoff |
| 1012 | Server restarting | Yes, with backoff |

### Forgetting About Proxies

Nginx, Cloudflare, and AWS ALB all require specific configuration to proxy WebSocket connections. Nginx, for example, needs explicit upgrade headers:

```nginx
location /ws {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 86400s;
}
```

The `proxy_read_timeout` is critical. Without it, Nginx closes idle connections after 60 seconds by default, which kills long-lived WebSocket connections.

## Libraries Worth Knowing

Rather than building everything from scratch, consider these options:

- **<a href="https://socket.io/docs/v4/" target="_blank" rel="noopener noreferrer">Socket.IO ↗</a>:** Adds automatic reconnection, rooms, namespaces, and fallback to long polling. Heavier than raw WebSockets, but handles many edge cases out of the box
- **ws (Node.js):** Lightweight, fast, production-ready. Use this when you want full control
- **Cloudflare Durable Objects:** If you are already on Cloudflare, Durable Objects provide WebSocket support with built-in state, no Redis needed

The right choice depends on your requirements. If you need rooms, presence, and reconnection logic immediately, Socket.IO saves significant development time. If you need minimal overhead and full control, raw ws is the better foundation.

## Monitoring WebSocket Connections

WebSocket issues are harder to debug than HTTP issues because connections are long-lived and stateful. Track these metrics:

- **Active connections:** Total count across all servers
- **Connection duration:** How long connections typically live
- **Message throughput:** Messages per second, inbound and outbound
- **Error rate:** Close codes, failed upgrades, authentication failures
- **Latency:** Time between send and acknowledgement

If you are building out your observability stack, the [observability vs monitoring guide](/devops/observability-vs-monitoring-what-developers-need-to-know) covers how these metrics fit into a broader strategy.

## When Not to Use WebSockets

WebSockets add complexity. Before reaching for them, ask whether a simpler approach works:

- **Polling every 30 seconds is fine?** Use REST with `setInterval`
- **Only need server-to-client updates?** Use Server-Sent Events
- **Low frequency updates?** HTTP is simpler and more debuggable
- **Users only need fresh data on page load?** Standard REST with cache headers

WebSockets shine when latency matters and data flows in both directions. For everything else, HTTP is simpler to build, test, deploy, and debug.

## Getting Started

If you want to add real-time features to an existing application:

1. **Start with the simplest transport** that solves your problem (often SSE, not WebSockets)
2. **Add heartbeats and reconnection** from day one, not after your first production outage
3. **Plan for horizontal scaling** early, even if you only run one server today
4. **Define your message protocol** before writing any handler code
5. **Monitor connection counts and message throughput** so you know your baseline before problems arise

WebSockets are a powerful tool when used for the right problems. The key is knowing when they are genuinely needed and building in resilience from the start.
