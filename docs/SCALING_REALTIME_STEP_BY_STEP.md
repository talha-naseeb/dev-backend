# Scaling & real-time hardening — step-by-step guide

This document matches the implementation in this repo. Follow phases in order for production rollouts.

---

## Phase 1 — Environment & CORS (Day 1)

### Step 1.1 — Define allowed browser origins

Socket.IO and Express CORS must list your real front-end URLs (not `*` in production).

1. Copy `.env` and set:

```env
CLIENT_ORIGINS=http://localhost:3000,http://localhost:5173,https://your-app.vercel.app
```

2. Restart the API server after every change.

### Step 1.2 — Verify the health endpoint

1. `GET /api/health` should return `status`, `db`, `uptime`.
2. With MongoDB down, expect HTTP **503** and `db: disconnected` so load balancers can drain traffic.

---

## Phase 2 — Rate limiting (Day 1)

### Step 2.1 — Auth brute-force protection

- **Rule:** `50` requests per **15 minutes** per IP on `/api/auth/*` (increased from overly strict default).
- Implemented in `src/middleware/rateLimit.middleware.js` and mounted in `src/routes/index.js`.
- For authenticated users, use claims-based or API-key quotas in addition to per-IP limits where possible.

### Step 2.2 — General API cap

- **Rule:** `300` requests per **10 minutes** per IP on all `/api/*` except `/api/health`.
- Consider per-user quotas (`userId` from JWT) within auth checks to reduce unfair blocking behind shared NAT.

### Step 2.3 — Tune for deployment

- Behind **one reverse proxy**, set `app.set("trust proxy", 1)` (or your hop count) so `req.ip` is correct; otherwise rate limits apply per proxy.
- For **many users behind one corporate NAT**, consider keyed limits (e.g. user id) for authenticated routes later.

---

## Phase 3 — Socket.IO authentication & rooms (Day 1–2)

### Step 3.1 — How it works

1. On connect, the server reads the JWT from `handshake.auth.token` (optional: `Authorization` header).
2. `verifyToken` attaches `socket.data.userId`, `socket.data.role`, `socket.data.workspaceId`.
3. `workspaceId` is derived from the same claim used for tenancy (`adminRef` in the token payload from `generateToken`).
4. `join-workspace` only succeeds if the requested id **equals** `socket.data.workspaceId`.

### Step 3.2 — Front-end contract

1. After login, the client opens the socket with the **same** JWT as REST calls.
2. `socketService.connect(token)` — token from your auth store (no `Bearer ` prefix required).
3. For HTTP endpoints, include header `Authorization: Bearer <token>` exactly; server must strip the `Bearer ` prefix before verifying.
4. On Socket.IO, server reads `socket.handshake.headers['authorization']` first, then `handshake.auth.token` fallback, validates via `verifyToken`.

### Step 3.3 — Failure modes

- Missing/invalid token → connection rejected (`connect_error`).
- Wrong workspace id → server emits `workspace:error` and does not join the room.

---

## Phase 4 — Database resilience & indexes (Day 2)

### Step 4.1 — Mongoose connection

- `serverSelectionTimeoutMS: 5000` in `src/config/database.js` fails fast when Atlas is unreachable.

### Step 4.2 — Tenant and stats queries

- `User`: index on `adminRef` for workspace counts.
- `Task`: compound indexes on `(adminRef, status)` and `(adminRef, createdAt)` for list/stats patterns.

---

## Phase 5 — Stats broadcast efficiency (Day 2)

### Step 5.1 — Debounce

- `broadcastAdminStats` is debounced **per workspace** (default **350 ms**) so ten task updates in one second trigger **one** aggregate + one emit.
- Override with `STATS_BROADCAST_DEBOUNCE_MS` in `.env`.

### Step 5.2 — Correctness

- `activeProjects` counts task statuses that match `task.model.js` (see `stats-helper.js`).

---

## Phase 6 — Seat limits under concurrency (Day 2–3)

### Step 6.1 — Problem

- Two parallel `create-employee` requests could both pass `countDocuments` before either insert completes.

### Step 6.2 — Solution

- `createEmployee` wraps **limit checks + user creation + admin counter increment** in `mongoose.startSession().withTransaction(...)`.
- Note: MongoDB transactions require replica sets (or managed clusters supporting transactions). Standalone servers do not support `withTransaction`; configure a replica set or use Atlas/GCP/AWS managed MongoDB for production.

---

## Phase 7 — Secrets & logs (Day 1)

- Removed logging of raw email verification tokens on signup.
- Never log JWTs or reset tokens in production; use structured logging with levels.

---

## Phase 8 — Horizontal scaling (when you add a 2nd server)

### Step 8.1 — Socket.IO

- Default adapter is **in-memory**. With **multiple Node processes**, use **`@socket.io/redis-adapter`** and a shared Redis.
- Sticky sessions at the load balancer help for long-lived connections.

### Step 8.2 — Stateless API

- Keep uploads and sessions out of local disk; use object storage and signed URLs where applicable.

---

## Checklist before production

| Item                                                       | Done |
| ---------------------------------------------------------- | ---- |
| `CLIENT_ORIGINS` set to real domains                       | ☐    |
| `trust proxy` configured if behind LB                      | ☐    |
| `/api/health` monitored (200 vs 503)                       | ☐    |
| Socket connects only with valid JWT                        | ☐    |
| Rate limits verified (429 on abuse)                        | ☐    |
| MongoDB indexes created (or allow app to create on deploy) | ☐    |
| (Multi-instance) Redis adapter for Socket.IO               | ☐    |

---

## Files touched by this implementation

| Area             | Files                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Socket auth      | `src/socket/socket.io.setup.js`, `src/app.js`                                                                                         |
| Rate limits      | `src/middleware/rateLimit.middleware.js`, `src/routes/index.js`                                                                       |
| DB               | `src/config/database.js`, `src/models/user.model.js`, `src/models/task.model.js`                                                      |
| Stats            | `src/utils/stats-helper.js`                                                                                                           |
| Concurrency      | `src/controllers/manager.controller.js`                                                                                               |
| Security hygiene | `src/controllers/auth.controller.js`                                                                                                  |
| Front-end socket | `front-end/src/services/socket.service.ts`, `front-end/src/store/authStore.ts`, `front-end/src/components/layout/DashboardLayout.tsx` |
