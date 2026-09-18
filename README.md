# HeroCRM (Sales-Lead 2.0)

[![Vite](https://img.shields.io/badge/Vite-8.1.5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.2.7-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, real-time CRM and sales lifecycle platform. HeroCRM streamlines lead acquisition, interactive Kanban pipeline management, outbound & inbound email synchronization, rule-based workflow automation, converted customer tracking, and forward-looking calendar scheduling.

---

## Live Deployments

- **Frontend Application**: [https://digital-h-mocha.vercel.app/](https://digital-h-mocha.vercel.app/)
- **Backend REST & WebSocket API**: [https://heros-4vm4.onrender.com/](https://heros-4vm4.onrender.com/)

---

## Core Capabilities & Feature Overview

### 1. Lead Acquisition & Pipeline Tracking
- **Public Lead Capture Form**: Clean, high-converting public landing page with real-time field validation for prospective customer submissions.
- **6-Stage Pipeline Lifecycle**:
  ```text
  NEW ➔ CONTACTED ➔ QUALIFIED ➔ PROPOSAL_SENT ➔ WON / LOST
  ```
- **Live Search & Filtering**: Multi-condition search across lead names, emails, phone numbers, and companies. Server-side pagination, status filters, and assignee filtering.
- **Assignment & Ownership**: Granular assignment of leads to team members with live toast alerts to newly assigned reps.

### 2. Interactive Drag-and-Drop Kanban Board (`@dnd-kit`)
- **Visual Pipeline**: 6 dedicated droppable columns with status badges, stage color accents, and lead count indicators.
- **Optimistic Drag-and-Drop**: Immediate UI movement with automatic rollback on network failure.
- **Role-Based Drag Authorization**:
  - `admin`: Can drag and re-stage any lead across all columns.
  - `member`: Can only drag leads assigned to their user ID (unassigned or other members' leads are locked).
- **Real-Time Kanban Sync**: Subscribes to WebSocket events; card movements by other reps reflect live without page reloads.
- **Persistent View Switcher**: Toggle seamlessly between traditional Table List and Kanban Board with preference remembered in `localStorage`.

### 3. Outbound Email & Inbound IMAP Email Sync
- **In-App Outbound Email Composer**: Dispatch branded HTML emails directly from Lead Detail.
- **Inbound Email Sync Engine (`imapflow` + `mailparser`)**:
  - Automatically polls an external IMAP mailbox over TLS (e.g. Gmail with App Password, Outlook, Mailtrap).
  - Stream-parses incoming RFC 822 MIME messages to extract sender, subject, date, and clean text snippets.
  - Matches sender address to existing leads (`Lead.findOne({ email: fromAddress })`).
  - Automatically logs `EMAIL_RECEIVED` activities on the lead's timeline and broadcasts live updates.
  - Unmatched senders are safely ignored without creating rogue leads or orphan records.
- **Automated & Manual Sync**:
  - Background polling runs every 5 minutes via `node-cron`.
  - Manual on-demand sync endpoint (`POST /api/admin/sync-inbox`) for instant administrator triggers.
- **Persistent Sync State (`SyncState.js`)**: Tracks `lastCheckedAt` and UID high-water mark in MongoDB to survive server restarts.

### 4. Rule-Based Workflow Automation on Status Transitions
- **Event-Driven Execution**: Automatically triggers actions when a lead transitions to specific pipeline stages.
- **Branded Email Catalog**: Pre-built, customizable email templates for each pipeline stage:
  - `WON` ➔ `won_welcome`: Welcome package and customer onboarding kickoff.
  - `PROPOSAL_SENT` ➔ `proposal_followup`: Proposal check-in and review schedule link.
  - `QUALIFIED` ➔ `qualified_intro`: Next steps and discovery agenda.
  - `CONTACTED` ➔ `contact_touchpoint`: Meeting recap touchpoint.
  - `NEW` ➔ `lead_acknowledgment`: Immediate inquiry receipt confirmation.
  - `LOST` ➔ `lost_nurture`: Nurture message with future updates opt-in.
- **Anti-Spam Deduplication Guard**: Enforces a 1-hour anti-spam cooldown per lead to prevent duplicate emails when toggling statuses.
- **Admin Management Console (`/workflows`)**: Full CRUD interface to configure trigger statuses, templates, and active/inactive switches.

### 5. Converted Customer Contacts Directory
- **Automatic Deal Conversion**: Transitioning a lead to `WON` automatically creates a persistent `Contact` record with full profile information (idempotent, prevents duplicates).
- **Customer Directory (`/contacts`)**: Searchable, paginated directory table showing customer name, company, email, phone, account manager, and backlink to the original lead (`/leads/:id`).
- **Customer Details View (`/contacts/:id`)**: Displays customer profile, shared account notes, and scheduled activities.
- **Generalized Notes System**: `Note.js` supports both `leadId` and `contactId`, allowing collaborative notes across the entire lead and customer lifecycle.

### 6. Interactive Month-Grid Calendar & Activity Scheduling
- **Forward-Looking Commitments (`ScheduledActivity.js`)**: Explicitly differentiates future commitments (calls & meetings) from historical audit logs.
- **Interactive Calendar View (`/calendar`)**: Custom, responsive month grid with previous/next navigation and "Today" shortcut.
- **Color-Coded Activity Chips**:
  - 📞 **Calls**: Blue chip (`chip-call`)
  - 👥 **Meetings**: Purple chip (`chip-meeting`)
  - ✓ **Completed**: Strikethrough, muted styling
- **Date Click Scheduling**: Click any day cell to open a quick schedule modal with the date pre-filled.
- **Chip Click Management**: Click any activity chip to view details, linked lead/customer, mark complete/incomplete, or delete.
- **Upcoming Activities Widget**: Embedded in both `LeadDetails` and `ContactDetails` with quick completion toggles.

### 7. Real-Time WebSockets Collaboration (`Socket.io`)
- **JWT Socket Handshake**: Authenticated connection verifying tokens directly during the WebSocket handshake.
- **Room Subscriptions**: Dedicated user notification rooms (`user:{userId}`) and lead rooms (`lead:{leadId}`).
- **Live Sync Without Refresh**:
  - Instant status badge updates and live timeline prepending.
  - In-place row updates on active table and Kanban boards.
  - Floating toast notifications for newly assigned leads.
  - Real-time connection health indicator in sidebar.

### 8. Analytics & Reporting Engine
- **Aggregation-Backed**: High-performance MongoDB aggregation pipelines with zero in-memory JavaScript loops.
- **Visual Dashboards (`Recharts`)**:
  - **KPI Cards**: Overall Conversion Rate (%), Active Pipeline Volume, Won Deals, and Lost Deals.
  - **Stage Funnel**: Horizontal bar chart showing volume distribution and conversion drop-offs.
  - **Volume Trends**: Dual-area chart tracking lead creation and won deals over selectable timeframes (`week` / `month`).
  - **Team Performance Table**: Sortable breakdown of leads assigned, won, lost, and conversion rates per sales rep.

### 9. Dark Mode & Unified Theming System
- **Theme Switching**: Seamless toggle between Light and Dark modes available directly in the application header.
- **Persistence & Anti-FOUC**: Remembers preference across browser reloads via `localStorage` with system preference fallback (`prefers-color-scheme`). Head-injected bootstrap script prevents light flashes on dark theme loads.
- **Pure CSS Custom Properties**: Zero extra UI dependencies; built directly with native CSS custom properties and Tailwind CSS v4 variables.
- **Theme-Aware Visualizations**: Real-time chart re-rendering in Recharts with automatic grid, axis, and legend color adaptations.

### 10. Standalone Embeddable Lead Widget
- **Single-Script Drop-In**: Package public lead capture into a self-contained IIFE bundle (`dist-embed/widget.js`) embeddable on any external website.
- **True Shadow DOM Isolation**: Renders inside an open Shadow DOM root with encapsulated CSS, guaranteeing complete immunity against external host style overrides.
- **Configurable API Target**: Script tag dynamically passes `data-api-url` to point to any backend deployment.
- **Scoped Cross-Origin CORS**: Backend securely accepts public `POST /api/leads` from any external domain while maintaining strict origin whitelist protection on all authenticated CRM routes.

---

## Technology Stack

### Frontend Subsystem (`client/`)
| Category | Technology |
|---|---|
| **Framework** | React 19 (`19.2.7`) + Vite 8 (`8.1.5`) |
| **Routing** | React Router v7 (`7.18.1`) with `<RequireAuth>` guards |
| **Real-Time Client** | Socket.io-client (`4.8.3`) with `<SocketProvider>` |
| **Drag & Drop** | `@dnd-kit/core` + `@dnd-kit/sortable` (`6.3.1`) |
| **Visualizations** | Recharts (`3.10.1`) |
| **Styling** | Tailwind CSS v4 + Handcrafted Design System (`App.css`) |
| **HTTP Client** | Axios (`1.18.1`) with JWT bearer injection and 401/403 interceptors |

### Backend Subsystem (`server/`)
| Category | Technology |
|---|---|
| **Runtime & Framework** | Node.js + Express 5 (`5.2.1`) |
| **Database & ODM** | MongoDB with Mongoose (`9.8.0`) |
| **Real-Time Server** | Socket.io (`4.8.1`) attached to Node HTTP server |
| **Inbound Email** | `imapflow` (`1.0.171`) + `mailparser` (`3.7.2`) |
| **Outbound Email** | `nodemailer` (`6.10.1`) with development preview mock |
| **Job Scheduler** | `node-cron` (`3.0.3`) for 5-minute background inbox checks |
| **Validation** | Zod (`4.4.3`) on all request bodies and query parameters |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, and strict CORS allowlisting |

---

## Directory Structure

```text
HeroC/
├── client/                          # React 19 Frontend SPA
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js             # Axios client with interceptors
│   │   ├── context/
│   │   │   ├── SocketContext.jsx    # Real-time WebSocket context & toast manager
│   │   │   └── ThemeContext.jsx     # Dark/light mode theme provider & persistence
│   │   ├── embed/
│   │   │   ├── embed.css            # Scoped widget stylesheet for Shadow DOM
│   │   │   ├── LeadFormShared.jsx   # Shared form validation & phone formatting
│   │   │   └── widget.jsx           # Standalone Shadow DOM mounting entry
│   │   ├── lib/
│   │   │   └── socket.js            # Socket.io client singleton
│   │   ├── pages/
│   │   │   ├── Analytics.jsx        # Recharts visual analytics dashboard
│   │   │   ├── Calendar.jsx         # Custom month-grid activity calendar
│   │   │   ├── Contacts.jsx         # Customer directory & detail view
│   │   │   ├── CrmPages.jsx         # Dashboard, Leads, LeadDetails, Shell layout
│   │   │   ├── KanbanBoard.jsx      # Interactive drag-and-drop Kanban pipeline
│   │   │   ├── LeadCapture.jsx      # Public landing page with lead form
│   │   │   ├── SignUP.jsx           # User registration
│   │   │   └── WorkflowSettings.jsx # Automation rules manager
│   │   ├── App.css                  # Design system, layout grids, dark/light CSS variables
│   │   ├── App.jsx                  # Application router tree with role gates
│   │   └── main.jsx                 # Entry mount point
│   ├── dist-embed/                  # Standalone IIFE widget output (`widget.js`)
│   ├── package.json
│   ├── vite.config.js               # Main SPA Vite config
│   └── vite.config.embed.js         # Dedicated standalone widget Vite config
│
├── server/                          # Express 5 REST & Real-Time API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                # MongoDB connection handler
│   │   │   └── socket.js            # Socket.io initialization & JWT handshake
│   │   ├── controllers/
│   │   │   ├── activityController.js
│   │   │   ├── adminController.js   # Manual inbox sync trigger
│   │   │   ├── analyticsController.js
│   │   │   ├── authController.js
│   │   │   ├── contactController.js # Converted customer CRUD
│   │   │   ├── dashboardController.js
│   │   │   ├── emailController.js
│   │   │   ├── leadController.js
│   │   │   ├── noteController.js
│   │   │   ├── scheduledActivityController.js # Calendar calls & meetings
│   │   │   ├── userController.js
│   │   │   └── workflowController.js# Workflow rules CRUD
│   │   ├── jobs/
│   │   │   └── inboundEmailJob.js   # node-cron scheduled IMAP polling
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT verification
│   │   │   ├── authorize.js         # RBAC guard (admin vs member)
│   │   │   └── validate.js          # Zod schema validation middleware
│   │   ├── models/
│   │   │   ├── Activity.js          # Audit log (EMAIL_SENT, EMAIL_RECEIVED, etc.)
│   │   │   ├── Contact.js           # Converted customer profiles
│   │   │   ├── Lead.js              # Lead documents with indexes
│   │   │   ├── Note.js              # Multi-entity notes (leads & contacts)
│   │   │   ├── ScheduledActivity.js # Future calls & meetings
│   │   │   ├── SyncState.js         # IMAP sync persistence
│   │   │   ├── User.js              # Accounts & roles
│   │   │   └── WorkflowRule.js      # Status transition rules
│   │   ├── routes/                  # Express route definitions
│   │   ├── services/
│   │   │   ├── analyticsService.js  # MongoDB aggregation pipelines
│   │   │   ├── contactService.js    # Auto-conversion on WON
│   │   │   ├── emailService.js      # Outbound Nodemailer
│   │   │   ├── inboundEmailService.js # Inbound IMAP flow & parsing
│   │   │   ├── leadService.js       # Core lead operations
│   │   │   ├── noteService.js
│   │   │   ├── scheduledActivityService.js
│   │   │   ├── socketEvents.js      # Socket event emitters
│   │   │   └── workflowService.js   # Automation runner with 1h anti-spam
│   │   ├── utils/
│   │   │   └── emailTemplates.js    # HTML template catalog
│   │   ├── validations/             # Zod schemas
│   │   └── index.js                 # Server entry & cron initialization
│   ├── .env.example
│   └── package.json
│
├── .planning/                       # GSD planning, architecture & roadmap
├── package.json                     # Monorepo orchestration scripts
└── README.md
```

---

## API Reference

All backend API routes are prefixed with `/api`.

### 1. Authentication & Team Management
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user profile |
| `POST` | `/api/auth/logout` | Authenticated | Logout & terminate session |
| `GET` | `/api/users` | Admin | List all registered team members for assignment |

### 2. Leads Management
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/leads` | Public / Auth | Submit public inquiry or create lead |
| `GET` | `/api/leads` | Authenticated | List leads with pagination, search, status & assignee filters |
| `GET` | `/api/leads/:id` | Authenticated | Fetch full lead detail by ID |
| `PUT` | `/api/leads/:id` | Authenticated | Update lead contact details |
| `PATCH`| `/api/leads/:id/status`| Authenticated | Update status (triggers workflows & contact auto-conversion on WON) |
| `PATCH`| `/api/leads/:id/assign`| Admin | Assign lead to a team member |
| `DELETE`| `/api/leads/:id` | Admin | Remove a lead from the system |
| `POST` | `/api/leads/:id/send-email` | Auth (Admin/Owner) | Send branded outbound email to lead |
| `GET` | `/api/leads/:id/notes` | Authenticated | Get all notes for a lead |
| `POST` | `/api/leads/:id/notes` | Authenticated | Add a note to a lead |
| `GET` | `/api/leads/:id/activities` | Authenticated | Retrieve activity history for a lead |

### 3. Customer Contacts
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/contacts` | Authenticated | Searchable, paginated directory of converted customers |
| `GET` | `/api/contacts/:id` | Authenticated | Fetch contact detail with lead link and notes |
| `PUT` | `/api/contacts/:id` | Authenticated | Update customer contact profile |
| `DELETE`| `/api/contacts/:id` | Admin | Remove customer contact |
| `GET` | `/api/contacts/:id/notes` | Authenticated | Get notes for a contact |
| `POST` | `/api/contacts/:id/notes` | Authenticated | Add a note to a contact |

### 4. Scheduled Activities & Calendar
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/scheduled-activities` | Authenticated | Query activities (`?from=&to=&leadId=&contactId=&completed=&type=`) |
| `POST` | `/api/scheduled-activities` | Authenticated | Schedule a call or meeting for lead/contact |
| `PUT` | `/api/scheduled-activities/:id` | Authenticated | Reschedule or mark activity completed/incomplete |
| `DELETE`| `/api/scheduled-activities/:id` | Authenticated | Delete a scheduled activity |

### 5. Workflow Automation (Admin Only)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/workflows` | Admin | List all configured workflow rules |
| `GET` | `/api/workflows/templates` | Admin | List registered email templates |
| `POST` | `/api/workflows` | Admin | Create an automated trigger rule |
| `PATCH`| `/api/workflows/:id` | Admin | Update rule or toggle active state |
| `DELETE`| `/api/workflows/:id` | Admin | Delete an automation rule |

### 6. Inbound Email & Admin Operations
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/admin/sync-inbox` | Admin | Manually trigger IMAP inbox sync on demand |

### 7. Analytics & Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard` | Authenticated | Overview statistics and recent activity feed |
| `GET` | `/api/analytics/funnel` | Authenticated | Pipeline stage distribution & drop-off metrics |
| `GET` | `/api/analytics/conversion-rate` | Authenticated | Overall conversion rate & won/lost distribution |
| `GET` | `/api/analytics/by-member` | Admin | Rep-level performance and conversion breakdown |
| `GET` | `/api/analytics/timeseries` | Authenticated | Lead creation and win trends over time (`week`/`month`) |

---

## Real-Time Events (Socket.io)

| Event Name | Direction / Room | Payload | Description |
|---|---|---|---|
| `join-lead` | Client ➔ Server | `leadId: string` | Subscribe client to updates for a specific lead |
| `leave-lead` | Client ➔ Server | `leadId: string` | Unsubscribe client from lead updates room |
| `lead:status-changed` | Server ➔ `lead:{leadId}` | `{ leadId, status, lead, activity }` | Synchronizes status badges and adds timeline audit entry |
| `dashboard:lead-updated` | Server ➔ Broadcast (all) | `{ leadId, status, assignedTo, updatedAt, lead }` | Live in-place row update on Table and Kanban boards |
| `lead:assigned` | Server ➔ `lead:{leadId}` | `{ leadId, assignedTo, lead, activity }` | Updates assignee information in detail view |
| `notification:new` | Server ➔ `user:{assignedUserId}` | `{ title, message, leadId, leadName, timestamp }` | Dispatches live floating toast alert to assigned rep |
| `lead:note-added` | Server ➔ `lead:{leadId}` | `{ leadId, note }` | Prepends new note in real-time |
| `lead:activity-added` | Server ➔ `lead:{leadId}` | `{ leadId, activity }` | Prepends outbound/inbound email to timeline live |

---

## Environment Variables

### Backend Configuration (`server/.env`)
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/dg-heros
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173

# Outbound Email (SMTP) - Optional; runs in mock preview mode if omitted
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
SMTP_FROM="HeroCRM <no-reply@herocrm.com>"

# Inbound Email (IMAP) - Optional; runs in mock mode if omitted
# Note: Gmail and Outlook require a 16-character App Password (2FA enabled)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your_email@example.com
IMAP_PASS=your_16_character_app_password
IMAP_TLS=true
INBOUND_EMAIL_CRON="*/5 * * * *"
```

### Frontend Configuration (`client/.env`)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## Local Development Setup

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- MongoDB instance running locally or a MongoDB Atlas connection string

### 1. Installation
```bash
git clone https://github.com/Shivam000189/sales-lead.git
cd sales-lead

# Install dependencies for both server and client
npm run install:all
```

### 2. Running Locally
In separate terminal tabs:

**Start Backend Server:**
```bash
npm run dev:server
# API and WebSocket server runs at http://localhost:3000
```

**Start Frontend Client:**
```bash
npm run dev:client
# Vite client runs at http://localhost:5173
```

---

## Embedding the Lead Form

HeroCRM includes a standalone, embeddable lead capture widget designed for seamless integration into external websites, landing pages, and marketing platforms (WordPress, Webflow, Shopify, static HTML, etc.).

### 1. Embed Snippet

Place the target container element anywhere in your external HTML page and load the widget script:

```html
<!-- Lead form target container -->
<div id="hero-crm-lead-form"></div>

<!-- HeroCRM embed script -->
<script 
  src="https://digital-h-mocha.vercel.app/widget.js" 
  data-api-url="https://heros-4vm4.onrender.com/api"
  defer>
</script>
```

### 2. Configuration & Attributes

| Attribute | Required | Default | Description |
|---|---|---|---|
| `data-api-url` | Optional | Auto-resolved | The base URL of your HeroCRM API (`http://<server-host>/api`). If omitted, it automatically falls back to the current origin (`/api`). |

### 3. Architecture & Isolation Guarantees

- **Shadow DOM Isolation**: The widget attaches an open Shadow Root (`#shadow-root (open)`) to `#hero-crm-lead-form` and injects its self-contained stylesheet (`embed.css`). External parent CSS resets, frameworks (like Bootstrap, Tailwind, or global typography rules), or `!important` tags cannot disrupt or pollute the form's styling.
- **Self-Contained Bundle**: Compiled as a standalone IIFE (`dist-embed/widget.js`) with React and ReactDOM bundled inside. No external runtime script dependencies are required on the host page.
- **Client-Side Validation & Auto-Formatting**: Features real-time required-field checks and automatic 10-digit North American phone formatting `(XXX) XXX-XXXX`.
- **Scoped Cross-Origin CORS**: The HeroCRM backend safely permits public cross-origin `POST /api/leads` and preflight `OPTIONS` requests from any domain, while enforcing strict origin allowlisting on all authenticated CRM management endpoints.

### 4. Compiling the Standalone Widget

To build the standalone embed script:

```bash
# From workspace root
npm run build:embed

# Or from client directory
npm --prefix client run build:embed
```
The compiled output is emitted to `client/dist-embed/widget.js`.

---

## Verification & Code Quality

Verify syntax, linting, and build correctness across the monorepo:

```bash
# 1. Verify backend syntax
node --check server/src/index.js

# 2. Run client ESLint
npm --prefix client run lint

# 3. Compile client production bundle
npm --prefix client run build

# 4. Compile standalone embed widget bundle
npm --prefix client run build:embed
```

---

## License

This project is licensed under the [MIT License](LICENSE).
