# Sales-Lead Upgrade Prompts

Three detailed, ready-to-use prompts you can hand to an AI coding assistant (or follow yourself) to implement Email Integration, Analytics/Reporting, and Real-Time Updates in the Sales-Lead MERN project. Each one is self-contained: goal, prerequisites, step-by-step build order, data flow, and expected output.

---

## 1. Email Integration (Outbound + Activity Logging)

```
You are working on my existing MERN CRM project called "Sales-Lead" 
(client: React + Vite + Tailwind, server: Node + Express + MongoDB + Mongoose, 
auth: JWT). The current structure is:

server/src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  validations/

GOAL:
Add outbound email capability so a logged-in user (admin or member) can send an 
email directly to a lead from the Lead Detail page, and have that email 
automatically logged as an "activity" on that lead's timeline.

REQUIREMENTS:
1. Backend:
   - Add a new dependency: nodemailer (use SMTP credentials via env vars: 
     SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM).
   - Create server/src/services/emailService.js exporting a sendEmail({ to, subject, 
     html, text }) function that wraps nodemailer's transporter.createTransport 
     and sendMail. Handle and log errors without crashing the request.
   - Create a new route: POST /api/leads/:id/send-email
     Body: { subject: string, message: string }
     Auth: must be logged in (existing JWT middleware); both admin and member 
     can use it, but only for leads they own OR if they're admin (reuse existing 
     role/ownership check pattern from the leads controller).
   - Controller (leadController.js or a new emailController.js):
     a. Validate input with Zod (subject and message required, subject max 150 
        chars, message max 5000 chars).
     b. Fetch the lead by :id; 404 if not found; 403 if member doesn't own it.
     c. Call emailService.sendEmail with the lead's email as `to`.
     d. On success, create a new Activity document: 
        { lead: leadId, type: "EMAIL_SENT", performedBy: req.user.id, 
          message: subject, createdAt: now }
        (match whatever the existing Activity model schema already uses — 
        inspect server/src/models/Activity.js first and conform to it, don't 
        invent a new schema).
     e. Return the created activity in the response.
   - If an Activity model doesn't exist yet, create one with fields: lead (ref), 
     type (enum: STATUS_CHANGE, NOTE_ADDED, EMAIL_SENT, ASSIGNED), performedBy 
     (ref User), message (string), createdAt.

2. Frontend:
   - On the Lead Detail page, add an "Send Email" button that opens a modal/form 
     with Subject and Message fields.
   - On submit, call the new POST /leads/:id/send-email endpoint via the 
     existing axios instance (reuse whatever base client/interceptor pattern is 
     already set up for auth headers).
   - Show a loading state on the button while sending, a success toast, and an 
     error toast on failure.
   - After success, refresh/prepend the activity list on that page so the new 
     "EMAIL_SENT" entry appears immediately without a full page reload.
   - Add a small icon (e.g. Mail icon from lucide-react) to activity list items 
     of type EMAIL_SENT to visually distinguish them from status changes/notes.

3. Email template:
   - Wrap the plain message in a simple branded HTML template (company name 
     placeholder, the message body, a footer). Keep it in 
     server/src/utils/emailTemplates.js as a function 
     buildLeadEmailHtml({ subject, message, leadName }).

DATA FLOW:
User clicks "Send Email" on Lead Detail → fills subject/message → frontend 
POSTs to /leads/:id/send-email with JWT → backend validates + checks ownership 
→ emailService sends via SMTP → on success, Activity doc is created → response 
returns the activity → frontend appends it to the on-screen activity timeline.

EXPECTED OUTPUT:
- A working "Send Email" flow from the UI that actually delivers an email (test 
  with a real SMTP provider like Gmail app password, Mailtrap, or Resend in dev).
- Every sent email appears as an EMAIL_SENT entry in that lead's activity 
  history, visible to anyone who can view the lead.
- No crash or 500 if SMTP fails — return a clean 502/400 with an error message, 
  and do NOT create an activity record if the send failed.
- Update the README's API Overview section to document the new endpoint.

ACCEPTANCE CHECK:
Send a test email to a lead you own → confirm it arrives → confirm the activity 
shows up on the Lead Detail page without refreshing → try sending as a member 
to a lead you don't own → confirm you get a 403.
```

---

## 2. Analytics & Reporting Dashboard

```
You are working on my existing MERN CRM project called "Sales-Lead". Leads have 
a status pipeline: NEW → CONTACTED → QUALIFIED → PROPOSAL_SENT → WON / LOST, and 
every status change is already logged as an Activity document with a 
createdAt timestamp.

GOAL:
Build a new "Analytics" section in the dashboard showing conversion funnel, 
per-member performance, and lead volume over time, backed by real aggregation 
queries (not client-side math on a full data dump).

REQUIREMENTS:

1. Backend — new aggregation endpoints (add to a new 
   server/src/routes/analytics.routes.js, guarded by the existing auth 
   middleware; admin-only unless specified):
   
   a. GET /api/analytics/funnel
      Returns count of leads currently in each status:
      { NEW: n, CONTACTED: n, QUALIFIED: n, PROPOSAL_SENT: n, WON: n, LOST: n }
      Implement with a single MongoDB aggregation ($group by status, $count).

   b. GET /api/analytics/conversion-rate
      Returns overall conversion rate: (WON count) / (total leads created) * 100, 
      plus stage-to-stage drop-off percentages (e.g. NEW→CONTACTED rate, 
      CONTACTED→QUALIFIED rate, etc.) computed from the funnel counts above.

   c. GET /api/analytics/by-member  (admin only)
      For each user with assigned leads, return: 
      { userId, name, totalAssigned, won, lost, inProgress, conversionRate }.
      Use an aggregation pipeline: $group by assignedTo, then $lookup into the 
      users collection to attach the name.

   d. GET /api/analytics/timeseries?range=weekly|monthly&from=&to=
      Returns an array of { period: "2026-W37", created: n, won: n } buckets 
      for charting lead creation and wins over time. Use $dateTrunc or 
      $dateToString in the aggregation to bucket by week/month.

   e. Add input validation (Zod) on query params for the timeseries endpoint 
      (range must be one of the enum values, from/to must be valid ISO dates 
      if provided).

2. Frontend:
   - Add a new "Analytics" nav item/page in the dashboard (admin-only route — 
     reuse the existing role-protected route pattern).
   - Install and use recharts (already common with this stack; confirm it's not 
     already a dependency before adding).
   - Build four components:
     a. FunnelChart — horizontal bar chart of lead counts per status.
     b. ConversionSummaryCards — small stat cards for overall conversion rate 
        and the biggest drop-off stage.
     c. MemberPerformanceTable — sortable table of each member's totals and 
        conversion rate, calling GET /analytics/by-member.
     d. LeadsOverTimeChart — line chart (created vs. won) with a toggle for 
        weekly/monthly, calling GET /analytics/timeseries.
   - Each component fetches its own endpoint independently (don't create one 
     giant combined endpoint) and shows a loading skeleton + empty state if 
     there's no data yet.
   - Add a date-range picker at the top of the Analytics page that, when 
     changed, re-fetches the timeseries chart.

3. Performance:
   - Add indexes on Lead.status and Activity.createdAt if they don't already 
     exist, since these aggregations will run on every dashboard visit.

DATA FLOW:
Admin opens Analytics page → frontend fires four parallel requests to the 
analytics endpoints → each hits a MongoDB aggregation pipeline scoped to the 
Lead/Activity collections → results return as small pre-aggregated JSON 
payloads (not raw lead lists) → charts render from that JSON.

EXPECTED OUTPUT:
- A dedicated Analytics page reachable only by admins.
- Four working, independently-loading charts/tables backed by real aggregation 
  queries against MongoDB (verify by checking the query plan or adding console 
  timing — this should not be doing math in JavaScript over every lead).
- Correct numbers that match what you'd get by manually counting leads by 
  status in MongoDB Compass, as a sanity check.

ACCEPTANCE CHECK:
Create a handful of test leads across different statuses and members → open 
the Analytics page → confirm funnel counts, conversion rate, and per-member 
table all match reality → change the date range on the timeseries chart and 
confirm it re-fetches and updates.
```

---

## 3. Real-Time Updates (Socket.io)

```
You are working on my existing MERN CRM project called "Sales-Lead". The 
backend is Express + MongoDB/Mongoose with JWT auth; the frontend is React + 
Vite + Tailwind, with a dashboard showing a lead list, lead detail, and 
activity history.

GOAL:
Add real-time updates so that when one user changes a lead (status change, 
assignment, note added), every other logged-in user viewing the dashboard or 
that same lead sees the change instantly without refreshing the page.

REQUIREMENTS:

1. Backend:
   - Add socket.io as a dependency on the server.
   - Wire it into the existing HTTP server (wherever app.listen currently is), 
     NOT as a separate server — attach socket.io to the same underlying HTTP 
     server instance so it can share the port.
   - Add JWT auth to the socket handshake: on connection, read the token from 
     the client's `auth` payload (socket.handshake.auth.token), verify it with 
     the same JWT secret/logic used in the existing HTTP middleware, and reject 
     the connection if invalid. Attach the decoded user to the socket.
   - Set up rooms:
     a. Every connected user joins a `user:{userId}` room automatically.
     b. When a client opens a specific lead's detail page, emit a `join-lead` 
        event with the lead ID; server joins that socket to a `lead:{leadId}` 
        room.
     c. On leaving the page, emit `leave-lead` to leave that room.
   - In the existing controllers where leads are mutated, after a successful 
     DB write, emit events:
     - Status change → io.to(`lead:${leadId}`).emit('lead:status-changed', 
       { leadId, newStatus, activity }) AND io.emit('dashboard:lead-updated', 
       { leadId }) so the list view can refresh that row.
     - Note added → io.to(`lead:${leadId}`).emit('lead:note-added', { leadId, 
       note }).
     - Lead assigned → io.to(`lead:${leadId}`).emit('lead:assigned', { leadId, 
       assignedTo }) AND io.to(`user:${assignedTo}`).emit('notification:new', 
       { message: "A lead was assigned to you", leadId }).
   - Keep this event-emitting logic in a small helper 
     (server/src/services/socketEvents.js) that controllers call into, rather 
     than importing `io` directly everywhere — pass the io instance in via a 
     simple singleton/init pattern set up when the server starts.

2. Frontend:
   - Add socket.io-client as a dependency.
   - Create a src/lib/socket.js that initializes a single socket instance, 
     connecting with `auth: { token }` pulled from wherever the JWT is 
     currently stored (localStorage/context — match existing auth setup).
   - Create a React context/provider (SocketProvider) that establishes the 
     connection once when the user is authenticated, and disconnects on logout.
   - On the dashboard/lead-list page: listen for `dashboard:lead-updated` and 
     re-fetch or patch just that lead's row in local state (don't refetch the 
     whole list every time).
   - On the Lead Detail page: emit `join-lead` on mount, `leave-lead` on 
     unmount; listen for `lead:status-changed` and `lead:note-added` to append 
     to the activity timeline and update the status badge live.
   - Add a small toast/notification listener for `notification:new` so a 
     member sees a live popup when a lead is assigned to them.
   - Show a subtle "live" indicator (small green dot) somewhere in the header 
     when the socket is connected, so it's visually obvious this is real-time 
     for demo purposes.

3. Resilience:
   - Handle reconnection gracefully (socket.io does this by default — just make 
     sure re-joining lead rooms happens again on reconnect via the `connect` 
     event handler).
   - Don't let a missing/expired token crash the app — if socket auth fails, 
     fail silently and just don't get real-time updates (the REST API should 
     still work standalone).

DATA FLOW:
User A changes a lead's status via the existing REST endpoint → controller 
saves to MongoDB → controller calls socketEvents helper → server emits 
`lead:status-changed` to everyone in that lead's room and `dashboard:lead-updated` 
to everyone → User B, who has that lead open (or is on the dashboard), receives 
the event over their already-open WebSocket connection → their UI updates 
in place, no polling or refresh needed.

EXPECTED OUTPUT:
- Two browser windows logged in as different users: changing a lead's status 
  in Window A instantly reflects in Window B's open dashboard/lead detail.
- Socket connections are authenticated — an invalid/missing token cannot open 
  a socket connection.
- The app still works entirely over plain REST if socket.io fails to connect 
  (no hard dependency that breaks core CRUD).

ACCEPTANCE CHECK:
Open the dashboard in two browsers as different users → change a lead's status 
in one → confirm the other updates within ~1 second without refresh → open the 
same lead's detail page in both → add a note in one → confirm it appears live 
in the other → assign a lead to the second user → confirm they get a live 
notification.
```

---

**How to use these:** paste one prompt at a time into Claude Code (or this chat with your repo open) so it can inspect your actual file structure before writing code — each prompt tells it to conform to your existing model/controller patterns rather than inventing new conventions.