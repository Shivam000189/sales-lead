# Requirements Specification

## Milestone: Sales-Lead 2.0 (Email, Analytics & Real-Time)

This requirements document synthesizes the feature upgrades specified in `.planning/codebase/INTEGRATION.md` along with essential architectural stability fixes identified in `.planning/codebase/CONCERNS.md`.

---

## 1. Foundation & Stability (FND)

- [ ] **FND-01: Credential Sanitization**: Replace live MongoDB Atlas credentials and JWT secrets in `DEPLOYMENT.md` with environment variable placeholders.
- [ ] **FND-02: Auth Profile Fix**: Fix `req.userId` reference in `server/src/controllers/authController.js` to `req.user.id` so `/api/auth/me` functions correctly. Remove reference to nonexistent `user.googleId`.
- [ ] **FND-03: Axios Interceptor Fix**: Modify `client/src/api/axios.js` to only wipe `localStorage` and redirect to `/login` on HTTP `401 Unauthorized`. HTTP `403 Forbidden` responses must reject without terminating the user's active session.
- [ ] **FND-04: Pipeline Consistency**: Ensure `PROPOSAL_SENT` status is included in `dashboardService.js` counts alongside `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, and `LOST`.
- [ ] **FND-05: Team Members Endpoint**: Add `GET /api/users` (admin-only or authenticated) returning `{ _id, name, email, role }` so lead assignment and member analytics have a canonical data source.
- [ ] **FND-06: Activity Model Alignment**: Update `Activity` schema to support structured activity `type` enum (`STATUS_CHANGE`, `NOTE_ADDED`, `EMAIL_SENT`, `ASSIGNED`) alongside descriptive `action` or `message`.

---

## 2. Outbound Email Integration (EML)

- [ ] **EML-01: Nodemailer Transporter Service**: Install `nodemailer` in `server` and create `server/src/services/emailService.js` supporting SMTP configuration (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`). Implement error handling that logs issues and rejects without crashing.
- [ ] **EML-02: Branded HTML Email Template**: Implement `server/src/utils/emailTemplates.js` providing `buildLeadEmailHtml({ subject, message, leadName })` with company branding, message content, and unsubscribe/footer styling.
- [ ] **EML-03: Email Dispatch Endpoint**: Implement `POST /api/leads/:id/send-email`:
  - Auth: Authenticated JWT user.
  - Authorization: `admin` or member assigned to the lead (403 if member does not own the lead).
  - Validation: Zod schema requiring `subject` (max 150 chars) and `message` (max 5000 chars).
  - Side-effect: Sends email via `emailService`, creates an `Activity` document with `type: "EMAIL_SENT"`, and returns the created activity.
  - Failure mode: Returns clean 400 or 502 error if SMTP fails; does not record activity on failure.
- [ ] **EML-04: UI Email Modal & Trigger**: Add a "Send Email" action button on the Lead Detail view opening a modal with Subject and Message fields.
- [ ] **EML-05: Timeline & Feedback Integration**: Display button loading state, success/error toast notifications, and append the new `EMAIL_SENT` activity item to the live timeline immediately without page reload, styled with a distinct mail icon.

---

## 3. Analytics & Reporting Dashboard (ANA)

- [ ] **ANA-01: MongoDB Indexing**: Add compound or single indexes on `Lead.status` and `Activity.createdAt` to ensure aggregation queries execute efficiently.
- [ ] **ANA-02: Aggregation Endpoints (`server/src/routes/analytics.routes.js`)**:
  - `GET /api/analytics/funnel`: Aggregate lead counts across all 6 statuses (`NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL_SENT`, `WON`, `LOST`).
  - `GET /api/analytics/conversion-rate`: Calculate overall conversion rate (`WON / total * 100`) and stage-to-stage drop-off percentages.
  - `GET /api/analytics/by-member` (Admin only): Aggregate per-member statistics (`userId`, `name`, `totalAssigned`, `won`, `lost`, `inProgress`, `conversionRate`).
  - `GET /api/analytics/timeseries?range=weekly|monthly&from=&to=`: Timeseries aggregation with Zod validation on query params bucketing lead creation and won events.
- [ ] **ANA-03: Analytics Route & Navigation**: Add an admin-protected `/analytics` route in the client router and navigation link in the `Shell` sidebar.
- [ ] **ANA-04: Recharts Integration & Visualizations**:
  - Install `recharts` in `client`.
  - `FunnelChart`: Horizontal bar chart of status counts.
  - `ConversionSummaryCards`: KPI cards for conversion rate and highest drop-off stage.
  - `MemberPerformanceTable`: Sortable table of member lead ownership and conversion metrics.
  - `LeadsOverTimeChart`: Toggleable weekly/monthly line chart with date-range picker.
- [ ] **ANA-05: Independent Component Fetching**: Each analytics widget must fetch independently with loading skeletons and graceful empty states.

---

## 4. Real-Time Collaboration via WebSockets (RT)

- [ ] **RT-01: Socket.io Server Setup**: Install `socket.io` on `server` and attach it to the existing HTTP server instance on the same port.
- [ ] **RT-02: Authenticated Socket Handshake**: Validate JWT in `socket.handshake.auth.token` using the existing secret; reject unauthenticated connections; attach decoded user context to socket.
- [ ] **RT-03: Room Management**: Automatically join users to `user:{userId}`; handle `join-lead` and `leave-lead` events for room `lead:{leadId}`.
- [ ] **RT-04: Controller Event Hooks**: Create `server/src/services/socketEvents.js` singleton and hook into mutations:
  - Lead status change: emit `lead:status-changed` to `lead:{leadId}` and `dashboard:lead-updated` to all clients.
  - Note added: emit `lead:note-added` to `lead:{leadId}`.
  - Lead assigned: emit `lead:assigned` to `lead:{leadId}` and `notification:new` to `user:{assignedTo}`.
- [ ] **RT-05: Client Socket Provider**: Install `socket.io-client` in `client`, create `src/lib/socket.js`, and provide a `SocketProvider` context that connects on login and disconnects on logout.
- [ ] **RT-06: Live UI Listeners**:
  - Update lead status and activity timeline in place on Lead Detail page.
  - Patch updated row in Lead List view on `dashboard:lead-updated` without full re-fetch.
  - Display live toast notification on `notification:new` when a lead is assigned to the current user.
  - Display green "live" status indicator dot in the navigation header when WebSocket is connected.
- [ ] **RT-07: Offline & REST Fallback**: Ensure application remains fully operational via standard REST endpoints if WebSocket connection drops or fails.
