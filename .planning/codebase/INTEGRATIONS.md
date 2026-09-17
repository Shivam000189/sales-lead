# External Integrations & Services

## Overview
This document outlines all external services, database systems, APIs, protocols, and hosting platforms that integrate with the Digital Heros codebase.

---

## Database Integrations

### MongoDB
- **Purpose**: Primary transactional document datastore for users, leads, notes, and activity logs.
- **Connection Handler**: `server/src/config/db.js`
- **Driver / Layer**: Mongoose ODM (`^9.8.0`)
- **Connection Configuration**:
  - Configured via `MONGO_URI` in `server/.env`.
  - Development default: `mongodb://127.0.0.1:27017/dg-heros`.
  - Production: MongoDB Atlas hosted cluster.
  - Connection options: standard connection string without deprecated flags.
  - Error handling: logs connection failure to `console.error` and calls `process.exit(1)`.

---

## Client-to-Server API Integration

### Base URL Resolution
- **Location**: `client/src/api/axios.js`
- **Logic**:
  - Checks `import.meta.env.VITE_API_URL`.
  - Normalizes trailing slashes and ensures `/api` suffix.
  - Defaults to `/api` relative URL if `VITE_API_URL` is omitted (enabling same-origin deployment or Vite reverse-proxying).

### Request Interceptors
- Injects `Authorization: Bearer <token>` into HTTP headers if `localStorage.getItem("token")` exists.
- Injects `withCredentials: true` on all requests.

### Response Interceptors
- Catches HTTP `401 Unauthorized` and `403 Forbidden` responses.
- Automatically wipes `localStorage` (`token`, `user`) and redirects the user to `/login`.

### Vite Development Proxy
- **Location**: `client/vite.config.js`
- **Configuration**:
  ```javascript
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  }
  ```
- Allows client requests to `/api/*` to proxy transparently to the backend during local development without CORS complications.

---

## Cross-Origin Resource Sharing (CORS)

- **Location**: `server/src/index.js`
- **Behavior**:
  - Reads `CLIENT_URL` from `process.env`.
  - Supports comma-separated origin strings.
  - Pre-whitelisted local origins in development:
    - `http://localhost:5173`
    - `http://127.0.0.1:5173`
    - `https://digital-h-mocha.vercel.app`
  - In production, enforces strict validation against `allowedOrigins`.
  - Handles origin matching or same-host requests (`req.protocol + '://' + req.get('host')`).
  - Returns `403 Forbidden` with `"Not allowed by CORS"` on unauthorized origins.

---

## Cloud Hosting & Deployment Targets

### 1. Vercel (Frontend SPA Hosting)
- **Live URL**: `https://digital-h-mocha.vercel.app/`
- **Type**: Static SPA deployment of `client/dist`.
- **Environment Configuration**: `VITE_API_URL=https://heros-4vm4.onrender.com/api`.

### 2. Render (Backend Node.js API Service)
- **Live URL**: `https://heros-4vm4.onrender.com/`
- **Type**: Web Service running `npm start` on Node.js.
- **Environment Variables**:
  - `NODE_ENV=production`
  - `PORT=3000`
  - `MONGO_URI=<Atlas connection string>`
  - `JWT_SECRET=<secret>`
  - `CLIENT_URL=https://digital-h-mocha.vercel.app`
  - `SERVE_CLIENT=false`

### 3. Unified Single-Service Deployment Mode
- The Express server (`server/src/index.js`) includes built-in static asset serving:
  - If `SERVE_CLIENT=true` or `NODE_ENV=production`, and `client/dist` exists on disk:
  - Serves static assets via `express.static(clientDistPath)`.
  - Falls back to `client/dist/index.html` on non-API routes (`/^(?!\/api).*/`).

---

## Health Check & Monitoring

- **Endpoint**: `GET /api/health`
- **Access**: Public, unauthenticated.
- **Payload**:
  ```json
  {
    "success": true,
    "status": "ok",
    "uptime": 124.56,
    "timestamp": "2026-09-17T17:40:00.000Z"
  }
  ```
- **Usage**: Used by cloud container orchestrators (Render, Kubernetes, AWS) to confirm service health.

---

## Third-Party Services Status

| Service Category | Provider / Tool | Status | Notes |
| --- | --- | --- | --- |
| Transactional Email | None | Not Implemented | Lead assignments and registrations do not trigger emails |
| SMS / WhatsApp | None | Not Implemented | No external notification integration |
| OAuth / Social Login | None | Planned / Incomplete | `authController.js` has vestigial `googleId` references, but no Google OAuth provider is wired |
| File Storage / S3 | None | Not Implemented | No file attachments supported on leads or notes |
| Error Tracking (Sentry) | None | Not Implemented | Server errors only logged to standard stdout/stderr |
| Webhooks | None | Not Implemented | No outbound or inbound webhooks for CRM integrations |
