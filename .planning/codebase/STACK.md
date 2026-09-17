# Technology Stack

## Overview
The Digital Heros (Sales-Lead / HeroCRM) application is organized as a monorepo containing two distinct subsystems: an Express-based Node.js backend (`server`) and a React single-page application built with Vite (`client`).

---

## Languages & Runtimes
- **JavaScript (Node.js)**: Server-side execution using Node.js with CommonJS modules (`"type": "commonjs"` in `server/package.json`).
- **JavaScript / JSX (Browser)**: Client-side execution using modern ES modules (`"type": "module"` in `client/package.json`) and ECMAScript 2020+.

---

## Backend Subsystem (`server/`)

### Core Runtimes & Frameworks
- **Express.js (`^5.2.1`)**: Next-generation Express web framework handling HTTP routing, middleware pipelines, and API endpoints.
- **Node.js**: Underlying runtime environment.

### Database & ODM
- **Mongoose (`^9.8.0`)**: Object Data Modeling (ODM) library for MongoDB, providing schema definition, validation, query helpers, and model lifecycle hooks.

### Authentication & Security
- **jsonwebtoken (`^9.0.3`)**: Creation and verification of HMAC-SHA256 JSON Web Tokens for stateless user sessions.
- **bcryptjs (`^3.0.3`)**: Password hashing and salt generation for user credential security.
- **cors (`^2.8.6`)**: Cross-Origin Resource Sharing middleware supporting whitelist and dynamic origin validation.

### Request Validation & Parsing
- **zod (`^4.4.3`)**: TypeScript-first schema declaration and data validation library used on request payloads.
- **body-parser (`^2.3.0`)**: Request body parsing middleware.
- **dotenv (`^17.4.2`)**: Loads environment configuration from `.env` files into `process.env`.

### Development & Tooling
- **nodemon (`^3.1.14`)**: Automatic process restart daemon watching for server-side source file modifications.

---

## Frontend Subsystem (`client/`)

### Core Framework
- **React (`^19.2.7`)**: Modern React UI library using function components and Hooks.
- **React DOM (`^19.2.7`)**: DOM renderer for React.

### Routing
- **react-router-dom (`^7.18.1`)**: Declarative client-side routing, URL parameter management, and route protection (`BrowserRouter`, `Routes`, `Route`, `Navigate`, `useNavigate`, `useParams`).

### Build Tool & Bundler
- **Vite (`^8.1.1`)**: Fast build tool and dev server featuring native ES-module hot module replacement (HMR).
- **@vitejs/plugin-react (`^6.0.3`)**: Babel/SWC-based Fast Refresh plugin for React in Vite.

### Styling & CSS
- **Tailwind CSS (`^4.3.3`)**: Utility-first CSS framework (v4 engine).
- **@tailwindcss/vite (`^4.3.3`)**: Vite integration plugin for Tailwind CSS v4.
- **Custom CSS (`App.css`)**: 13KB handcrafted stylesheet providing the primary design tokens, layout primitives, and component styling for the CRM shell and lead capture interfaces.

### Networking
- **Axios (`^1.18.1`)**: Promise-based HTTP client configured with base URL resolution, request interceptors (JWT injection), and response interceptors (401/403 handling).

### Linting & Code Quality
- **ESLint (`^10.6.0`)**: Static code analysis tool.
- **@eslint/js (`^10.0.1`)**: Official ESLint JavaScript configurations.
- **eslint-plugin-react-hooks (`^7.1.1`)**: Enforces Rules of Hooks.
- **eslint-plugin-react-refresh (`^0.5.3`)**: Validates React components for Fast Refresh.
- **globals (`^17.7.0`)**: Global variable declarations for browser environments.

---

## Monorepo Management & Scripts

The root `package.json` coordinates lifecycle commands across both workspaces using `npm --prefix`:

| Script | Command | Purpose |
| --- | --- | --- |
| `install:all` | `npm --prefix server install && npm --prefix client install` | Install dependencies for both subprojects |
| `dev:server` | `npm --prefix server run dev` | Run backend server with nodemon |
| `dev:client` | `npm --prefix client run dev` | Run frontend Vite development server |
| `build` | `npm --prefix client run build` | Produce optimized production bundle in `client/dist` |
| `start` | `npm --prefix server start` | Start Node.js production server |
| `lint` | `npm --prefix client run lint` | Run ESLint across client codebase |

---

## Environment Requirements
- **Node.js**: v18+ recommended (required by Vite 8 and Express 5).
- **MongoDB**: v5+ local instance or MongoDB Atlas cluster.
- **Environment Variables**:
  - Server: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `SERVE_CLIENT`, `NODE_ENV`.
  - Client: `VITE_API_URL`.
