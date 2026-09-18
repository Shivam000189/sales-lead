# HeroCRM (Sales-Lead)

A full-stack, enterprise-grade CRM and lead management platform designed to streamline lead acquisition, pipeline tracking, outbound customer engagement, team collaboration, and real-time performance analytics.

---

## Live Application

- **Frontend Application**: [https://digital-h-mocha.vercel.app/](https://digital-h-mocha.vercel.app/)
- **Backend API**: [https://heros-4vm4.onrender.com/](https://heros-4vm4.onrender.com/)

---

## Overview & Architecture

HeroCRM connects public customer acquisition directly into an internal, role-protected sales workspace:

1. **Public Lead Capture**: Responsive web form where prospects submit their contact details and inquiries without requiring authentication.
2. **Private CRM Workspace**: Authenticated dashboard tailored for Admins and Team Members to manage leads, communicate via email, assign team ownership, log notes, and inspect activity timelines.
3. **Analytics & Reporting Engine**: MongoDB aggregation-backed visual dashboard powered by Recharts, delivering stage conversion funnels, volume trends over time, and individual sales rep performance metrics.

---

## Features

### 1. Lead Acquisition & Pipeline Management
- **Public Capture Form**: Clean, high-conversion landing page with real-time validation.
- **6-Stage Pipeline Lifecycle**:
  ```text
  NEW ➔ CONTACTED ➔ QUALIFIED ➔ PROPOSAL_SENT ➔ WON / LOST
  ```
- **Live Search & Filtering**: Multi-condition search across lead names, emails, phone numbers, and companies. Filter by status or assigned team member with server-side pagination.
- **Assignment & Ownership**: Admins can reassign leads across team members with automated activity tracking.

### 2. Outbound Email Integration & Activity Logging
- **In-App Email Composer**: Compose and dispatch branded HTML emails directly from the Lead Detail view.
- **Branded Templates**: Responsive HTML email layout with customized signatures and CRM branding.
- **Development Fallback**: Safe mock mode in development when external SMTP credentials are not configured.
- **Audit & Activity Timeline**: Every lead status change, note creation, assignment, and outbound email is logged with timestamps, actor IDs, and dedicated visual markers (e.g. `EMAIL_SENT`, `STATUS_CHANGE`).

### 3. Analytics & Reporting Engine
- **KPI Summary Cards**: Real-time cards displaying Overall Conversion Rate (%), Active Pipeline, Won Deals, and Lost Deals.
- **Pipeline Funnel Chart**: Horizontal Recharts bar chart depicting volume distribution across each sales stage with drop-off percentages.
- **Lead Volume Over Time**: Dual-area chart tracking lead generation and closed deals over weekly or monthly intervals, complete with custom date range pickers.
- **Team Performance Table**: Sortable breakdown of leads assigned, in-progress, won, lost, and conversion rate progress bars per team member.

### 4. Authentication & Role-Based Access Control (RBAC)
- **JWT & Password Hashing**: Secure stateless authentication using JSON Web Tokens and bcryptjs.
- **Admin Role**:
  - Full access to all leads, notes, and activity histories.
  - Ability to create, edit, reassign, and delete leads.
  - Exclusive access to team member listings (`/api/users`) and performance analytics (`/analytics` & `/api/analytics/by-member`).
  - Authority to send emails to any lead.
- **Member Role**:
  - Access to assigned leads and shared dashboards.
  - Ability to update status, add notes, and compose outbound emails to assigned leads.
  - Protected from performing lead deletions, reassignments, or viewing sensitive rep-level analytics.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Data Visualization**: Recharts (v3)
- **Styling**: Tailwind CSS + Custom Design System (`App.css`)
- **Routing**: React Router v7 (with `RequireAuth` role gates)
- **HTTP Client**: Axios (with response interceptors for 401/403 handling)

### Backend
- **Runtime**: Node.js & Express.js (CommonJS)
- **Database**: MongoDB with Mongoose ODM
- **Indexing**: Optimized schema indexes on `Lead` (`status`, `createdAt`, `assignedTo`) and `Activity` (`createdAt`)
- **Validation**: Zod (body validation & query string validation)
- **Email Delivery**: Nodemailer (SMTP transport with dev fallback)
- **Security**: CORS origin allowlisting, bcryptjs password hashing, JWT bearer tokens

---

## Project Structure

```text
HeroC/
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Axios instance & token interceptors
│   │   ├── pages/
│   │   │   ├── Analytics.jsx       # Recharts dashboards & KPI widgets
│   │   │   ├── CrmPages.jsx        # Dashboard, Leads, LeadDetails, Shell & Modals
│   │   │   ├── LeadCapture.jsx     # Public lead capture landing page
│   │   │   └── SignUP.jsx          # Registration view
│   │   ├── App.jsx                 # Route definitions & RBAC guards
│   │   ├── App.css                 # CRM theme styles & design tokens
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── analyticsController.js
│   │   │   ├── authController.js
│   │   │   ├── emailController.js
│   │   │   ├── leadController.js
│   │   │   ├── noteController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT verification
│   │   │   ├── authorize.js        # Role-based authorization
│   │   │   └── validate.js         # Zod body & query validators
│   │   ├── models/
│   │   │   ├── Activity.js         # Timeline event schema
│   │   │   ├── Lead.js             # Lead schema with compound indexes
│   │   │   ├── Note.js             # Lead notes schema
│   │   │   └── User.js             # User & role schema
│   │   ├── routes/
│   │   │   ├── activityRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── leadRoutes.js
│   │   │   ├── noteRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── services/
│   │   │   ├── analyticsService.js # MongoDB aggregation pipelines
│   │   │   ├── emailService.js     # Nodemailer dispatch & dev mock
│   │   │   └── leadService.js      # Lead filtering & mutations
│   │   ├── utils/
│   │   │   └── emailTemplates.js   # HTML email builder
│   │   ├── validations/
│   │   │   ├── analyticsValidation.js
│   │   │   ├── authValidation.js
│   │   │   ├── emailValidation.js
│   │   │   └── leadValidation.js
│   │   └── index.js                # Express app entry & middleware
│   └── package.json
│
├── package.json                    # Root monorepo orchestration
└── README.md
```

---

## API Reference

All endpoints are prefixed with `/api`.

### Authentication & Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate local session |
| `GET` | `/api/users` | Admin | List all registered users / team members |

### Leads
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/leads` | Public / Auth | Submit or create a new lead |
| `GET` | `/api/leads` | Authenticated | List leads with pagination, search, & filters |
| `GET` | `/api/leads/:id` | Authenticated | Fetch full lead detail by ID |
| `PATCH`| `/api/leads/:id` | Admin | Update lead contact or company information |
| `PATCH`| `/api/leads/:id/status` | Authenticated | Update lead status (`NEW`, `CONTACTED`, etc.) |
| `PATCH`| `/api/leads/:id/assign` | Admin | Assign lead to a team member |
| `DELETE`| `/api/leads/:id` | Admin | Remove a lead from the system |

### Outbound Email
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/leads/:id/send-email` | Auth (Admin / Assigned Member) | Send branded email to lead & log timeline event |

### Notes & Activities
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/leads/:id/notes` | Authenticated | Add an internal note to a lead |
| `GET` | `/api/leads/:id/notes` | Authenticated | Fetch all notes for a specific lead |
| `DELETE`| `/api/notes/:id` | Authenticated | Delete a note |
| `GET` | `/api/leads/:id/activities` | Authenticated | Retrieve timeline history for a lead |

### Analytics & Dashboard
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard` | Authenticated | Overall lead counts & recent activity feed |
| `GET` | `/api/analytics/funnel` | Authenticated | Stage distribution & funnel metrics |
| `GET` | `/api/analytics/conversion-rate` | Authenticated | Conversion rates, won/lost totals & drop-offs |
| `GET` | `/api/analytics/by-member` | Admin | Individual team member performance breakdown |
| `GET` | `/api/analytics/timeseries` | Authenticated | Lead creation & win volume trends (`?range=week\|month`) |

### Real-Time Events (Socket.io WebSockets)
| Event Name | Direction / Room | Payload Shape | Description |
|---|---|---|---|
| `join-lead` | Client ➔ Server | `leadId: string` | Subscribe client to updates for a specific lead |
| `leave-lead` | Client ➔ Server | `leadId: string` | Unsubscribe client from lead updates room |
| `lead:status-changed` | Server ➔ `lead:{leadId}` | `{ leadId, status, lead, activity }` | Status badge and timeline live synchronization |
| `dashboard:lead-updated` | Server ➔ Broadcast (all) | `{ leadId, status, assignedTo, updatedAt, lead }` | In-place table row updates across all active sessions |
| `lead:assigned` | Server ➔ `lead:{leadId}` | `{ leadId, assignedTo, lead, activity }` | Updates assignee details in Lead Detail view |
| `notification:new` | Server ➔ `user:{assignedUserId}` | `{ title, message, leadId, leadName, timestamp }` | Dispatches live floating toast alert to the assigned rep |
| `lead:note-added` | Server ➔ `lead:{leadId}` | `{ leadId, note }` | Prepends new note to timeline without refresh |
| `lead:activity-added` | Server ➔ `lead:{leadId}` | `{ leadId, activity }` | Prepends outbound email / audit event to timeline |

---

## Environment Setup

### 1. Server Configuration (`server/.env`)
```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/dg-heros
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173

# Outbound Email (SMTP) - Optional in dev; operates in Mock mode if omitted
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="HeroCRM <no-reply@herocrm.com>"
```

### 2. Client Configuration (`client/.env`)
```env
VITE_API_URL=http://localhost:3000/api
```

---

## Getting Started Locally

### Prerequisites
- Node.js (v18.x or later recommended)
- MongoDB instance (local service or MongoDB Atlas URI)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Shivam000189/sales-lead.git
cd sales-lead

# Install monorepo dependencies
npm run install:all
```

### 2. Start Backend & Frontend
In separate terminal windows:

**Start the Server:**
```bash
npm run dev:server
# Server starts at http://localhost:3000
```

**Start the Client:**
```bash
npm run dev:client
# Vite client runs at http://localhost:5173
```

---

## Verification & Code Quality

Run linting and production build checks across the application:

```bash
# Verify server syntax
node -c server/src/index.js

# Lint the client code
npm --prefix client run lint

# Compile client production bundle
npm --prefix client run build
```

---

## License

This project is open source and available under the [MIT License](LICENSE).
