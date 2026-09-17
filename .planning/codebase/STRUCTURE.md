# Codebase Directory Structure & File Map

## Repository Layout Overview
The project is structured as an npm multi-package monorepo containing root coordination files, an Express backend in `server/`, and a React/Vite frontend in `client/`.

```text
HeroC/
├── .planning/               # GSD planning, architecture, and codebase mapping
│   └── codebase/            # Codebase intelligence documents
├── client/                  # Frontend SPA application (React 19 + Vite 8)
│   ├── public/              # Static public assets
│   ├── src/                 # Application source code
│   │   ├── api/             # HTTP clients & API adapters
│   │   ├── assets/          # Embedded images & SVG vectors
│   │   ├── pages/           # Route views and page components
│   │   ├── App.css          # Core design tokens and stylesheet
│   │   ├── App.jsx          # Route definitions and application entry
│   │   ├── index.css        # Tailwind and global CSS entry
│   │   └── main.jsx         # React DOM mount point
│   ├── eslint.config.js     # Client ESLint flat configuration
│   ├── index.html           # HTML template container
│   ├── package.json         # Frontend dependencies and scripts
│   └── vite.config.js       # Vite configuration & dev proxy
├── server/                  # Backend REST API (Node.js + Express 5)
│   ├── src/                 # Server source code
│   │   ├── config/          # Infrastructure and database setup
│   │   ├── controllers/     # HTTP route controllers
│   │   ├── middleware/      # Express authentication and validation handlers
│   │   ├── models/          # Mongoose data models
│   │   ├── routes/          # Express router definitions
│   │   ├── services/        # Business logic and database operations
│   │   ├── tests/           # Test suite directory (currently empty)
│   │   ├── utils/           # Shared utility functions (JWT, bcrypt)
│   │   ├── validations/     # Zod schema definitions
│   │   ├── app.js           # Empty placeholder file
│   │   └── index.js         # Backend server entry point
│   ├── .env.example         # Server environment variables template
│   └── package.json         # Backend dependencies and scripts
├── screenshort/             # Documentation screenshots
├── .gitignore               # Git ignored patterns
├── DEPLOYMENT.md            # Production deployment instructions
├── package.json             # Root monorepo scripts
└── README.md                # Project documentation and API specifications
```

---

## Detailed Directory & File Breakdown

### Root Directory
- **`package.json`**: Root orchestration scripts (`install:all`, `dev:server`, `dev:client`, `build`, `start`, `lint`).
- **`README.md`**: Comprehensive project guide, credentials, API reference, and screenshots.
- **`DEPLOYMENT.md`**: Runbook for single-service and split frontend/backend hosting.
- **`.gitignore`**: Excludes `node_modules/`, `client/dist/`, and `.env`.

---

### Backend (`server/`)

| File / Folder | Purpose | Key Exports / Responsibilities |
| --- | --- | --- |
| `src/index.js` | Main entry point | Configures Express, connects to MongoDB, mounts middleware, mounts routes, serves client build in prod, handles 404/500 |
| `src/app.js` | Unused placeholder | 0-byte file (vestigial) |
| `src/config/db.js` | MongoDB connection | `connectDB()` using `mongoose.connect(process.env.MONGO_URI)` |
| `src/controllers/` | Request handlers | Translates HTTP requests to service calls |
| `├── activityController.js` | Audit controller | `getActivities` |
| `├── authController.js` | Auth controller | `register`, `login`, `me`, `logout` |
| `├── dashboardController.js` | Metrics controller | `dashboard` |
| `├── leadController.js` | Lead controller | `create`, `getAll`, `getOne`, `update`, `updateStatus`, `assign`, `remove` |
| `└── noteController.js` | Note controller | `create`, `getAll`, `remove` |
| `src/middleware/` | Request pipeline | Authentication, authorization, schema validation |
| `├── authMiddleware.js` | JWT authenticator | `authenticate` - verifies Bearer token, populates `req.user` |
| `├── authorize.js` | RBAC guard | `authorize(...roles)` - enforces role match (`admin` vs `member`) |
| `└── validate.js` | Schema validator | `validate(schema)` - parses request body against Zod schemas |
| `src/models/` | Data definitions | Mongoose ODM schemas |
| `├── Activity.js` | Activity model | Fields: `leadId`, `action`, `performedBy`, timestamps |
| `├── Lead.js` | Lead model | Fields: `name`, `email`, `phone`, `company`, `message`, `status`, `assignedTo`, timestamps |
| `├── Note.js` | Note model | Fields: `leadId`, `userId`, `text`, timestamps |
| `└── User.js` | User model | Fields: `name`, `email`, `password`, `role`, timestamps |
| `src/routes/` | Endpoint routing | Defines URL patterns and applies middleware |
| `├── activityRoutes.js` | `/api/leads/:id/activities` |
| `├── authRoutes.js` | `/api/auth/register`, `/login`, `/me`, `/logout` |
| `├── dashboardRoutes.js`| `/api/dashboard` |
| `├── leadRoutes.js` | `/api/leads`, `/:id`, `/:id/status`, `/:id/assign` |
| `└── noteRoutes.js` | `/api/leads/:id/notes`, `/api/notes/:id` |
| `src/services/` | Business logic | Pure database and domain logic |
| `├── activityService.js`| Activity operations | `createActivity`, `getLeadActivities` |
| `├── authService.js` | Authentication | `registerUser`, `loginUser`, `getMe` |
| `├── dashboardService.js`| Aggregations | `getDashboardStats` |
| `├── leadService.js` | Lead operations | `createLead`, `getLeads`, `getLeadById`, `updateLead`, `updateLeadStatus`, `assignLead`, `deleteLead` |
| `└── noteService.js` | Note operations | `createNote`, `getNotesByLead`, `deleteNote` |
| `src/utils/` | Helpers | Cryptographic and token utilities |
| `├── hash.js` | Bcrypt wrappers | `hashPassword`, `comparePassword` |
| `└── jwt.js` | JWT wrappers | `generateToken`, `verifyToken` |
| `src/validations/` | Zod schemas | Input contracts |
| `├── authValidation.js` | Auth schemas | `registerSchema`, `loginSchema` |
| `└── leadValidation.js` | Lead schemas | `createLeadSchema`, `updateStatusSchema`, `assignLeadSchema` |
| `src/tests/` | Test folder | Empty directory |

---

### Frontend (`client/`)

| File / Folder | Purpose | Key Responsibilities / Components |
| --- | --- | --- |
| `src/main.jsx` | React mount entry | Mounts `<App />` to `#root` inside `StrictMode` |
| `src/App.jsx` | Top-level router | Configures `BrowserRouter`, registers routes, wraps protected routes with `RequireAuth` |
| `src/index.css` | Global stylesheet | Imports `@tailwindcss` and `./App.css` |
| `src/App.css` | Design system CSS | Custom classes: `.app-shell`, `.sidebar`, `.workspace`, `.panel`, `.stat-grid`, `.table-wrap`, `.form-grid`, etc. |
| `src/api/axios.js` | Axios instance | Creates configured instance, adds token interceptor, handles 401/403 redirects |
| `src/pages/` | Page views | UI screens and views |
| `├── CrmPages.jsx` | Monolithic CRM view | Contains `Shell`, `Status`, `Empty`, `RequireAuth`, `Login`, `Dashboard`, `Leads`, `LeadForm`, `LeadDetails` |
| `├── LeadCapture.jsx` | Public landing page | Contact form submitting leads to `POST /api/leads` without auth |
| `├── SignUP.jsx` | Registration page | Account creation calling `POST /api/auth/register` |
| `└── SignIn.jsx` | Unused sign-in page | Standalone Tailwind login page (dead code, not referenced in router) |
| `src/assets/` | Media assets | `hero.png`, `react.svg`, `vite.svg` |
| `vite.config.js` | Vite config | Configures React plugin, Tailwind Vite plugin, and `/api` dev proxy to port 3000 |
| `eslint.config.js` | Linter rules | Flat ESLint config with React hooks and refresh rules |
