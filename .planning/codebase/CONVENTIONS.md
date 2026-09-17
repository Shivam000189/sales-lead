# Code Conventions & Standards

## Overview
This document captures the conventions, design patterns, coding styles, and architectural standards adhered to across the Digital Heros codebase.

---

## Language & Module Conventions

### Server-Side (Node.js)
- **Module System**: CommonJS (`require` / `module.exports`).
- **Syntax & Style**:
  - Double quotes (`"..."`) for string literals and JSON keys.
  - Semicolons used consistently at the end of statements.
  - Multi-line function signatures and destructuring with generous vertical spacing.
- **Async Pattern**: Modern `async/await` syntax throughout controllers and services.
- **Database Access**: Direct Mongoose Model queries with `.populate()` for foreign keys and `.sort()`, `.skip()`, `.limit()` for pagination.

### Client-Side (React)
- **Module System**: ES Modules (`import` / `export`).
- **Syntax & Style**:
  - React function components with modern Hooks (`useState`, `useEffect`, `useParams`, `useNavigate`).
  - Double and single quotes mixed across files.
  - Arrow functions for inline event handlers and component helpers.
- **Component File Conventions**:
  - PascalCase for component names (`LeadCapture`, `Dashboard`, `Shell`, `RequireAuth`).
  - `.jsx` file extensions for all component files.

---

## File & Identifier Naming Conventions

| Category | Convention | Examples |
| --- | --- | --- |
| Mongoose Models | PascalCase singular | `User.js`, `Lead.js`, `Note.js`, `Activity.js` |
| Express Controllers | camelCase singular + `Controller` suffix | `authController.js`, `leadController.js`, `noteController.js` |
| Express Services | camelCase singular + `Service` suffix | `authService.js`, `leadService.js`, `noteService.js` |
| Express Routes | camelCase singular/plural + `Routes` suffix | `authRoutes.js`, `leadRoutes.js`, `activityRoutes.js` |
| Middleware Handlers | camelCase | `authMiddleware.js`, `authorize.js`, `validate.js` |
| Validation Files | camelCase + `Validation` suffix | `authValidation.js`, `leadValidation.js` |
| React Components | PascalCase | `LeadCapture.jsx`, `SignUP.jsx`, `SignIn.jsx` |
| Lead Pipeline States | UPPER_SNAKE_CASE | `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL_SENT`, `WON`, `LOST` |
| User Roles | lowercase | `admin`, `member` |
| Database Fields | camelCase | `assignedTo`, `performedBy`, `leadId`, `createdAt` |

---

## API Request & Response Conventions

### Successful Responses
Responses conform to a consistent JSON structure:
```json
{
  "success": true,
  "message": "Human-readable confirmation message",
  "data": { ... }
}
```
*Note: For collection endpoints like `/api/leads`, pagination metadata is top-level:*
```json
{
  "success": true,
  "leads": [ ... ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

### Error Responses
All error responses return a standardized payload:
```json
{
  "success": false,
  "message": "Detailed error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

### HTTP Status Code Usage
- `200 OK`: Successful read, update, or login action.
- `201 Created`: Successful creation of a resource (`POST /api/leads`, `POST /api/auth/register`, `POST /api/leads/:id/notes`).
- `400 Bad Request`: Payload validation errors, invalid credentials, or missing required fields.
- `401 Unauthorized`: Missing, expired, or invalid JWT token.
- `403 Forbidden`: Role permission failure (`authorize("admin")`) or CORS origin rejection.
- `404 Not Found`: Resource does not exist (User, Lead, Note, or API route).
- `409 Conflict`: Unique field conflict (e.g. duplicate email during registration).
- `500 Server Error`: Uncaught database or internal server errors.

---

## Security & Authentication Conventions

1. **Password Storage**: Passwords are never stored in plain text. Always hashed via `bcrypt.hash(password, 10)` in `utils/hash.js`.
2. **Password Filtering**: Password fields must be stripped from queries and excluded from API responses (e.g., `User.findById(...).select("-password")`).
3. **Stateless Tokens**: JWTs encode `userId` and `role` with a 24-hour expiration (`expiresIn: "24h"`).
4. **Header Convention**: Client sends token via `Authorization: Bearer <token>`.
5. **Role Check**: Role authorization occurs at the route level via `authorize("admin")` middleware before reaching controller logic.

---

## CSS & Styling Conventions

- **Dual Approach**: The codebase imports Tailwind CSS v4 in `index.css`, but the dominant UI style is driven by bespoke semantic classes in `App.css`.
- **Class Naming**:
  - Layout containers: `.app-shell`, `.sidebar`, `.workspace`, `.page-head`
  - Cards & Panels: `.panel`, `.panel-head`, `.stat-grid`, `.stat-card`
  - Forms: `.form-grid`, `.form-card`, `.form-section`, `.form-actions`
  - Feedback: `.alert`, `.alert.error`, `.alert.success`, `.loading`, `.empty`
  - Status Pills: `.status`, `.status-new`, `.status-won`, etc.
