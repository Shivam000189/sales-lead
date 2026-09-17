# Technical Concerns, Bugs & Tech Debt

## Executive Summary
This document provides a comprehensive audit of architectural risks, security vulnerabilities, functional bugs, and code health concerns identified in the Digital Heros codebase.

---

## 1. Critical & Security Concerns

### 1.1 Plaintext Production Credentials Committed in Documentation
- **File**: `DEPLOYMENT.md` (lines 24-25)
- **Detail**: The file contains a hardcoded, actual MongoDB Atlas connection string and JWT secret:
  ```sh
  MONGO_URI=mongodb+srv://Shivam0018:Shivam123@cluster0.cb9rvtm.mongodb.net/?appName=Cluster0
  JWT_SECRET=shivam2233
  ```
- **Risk**: Severe. The database username, cluster endpoint, and password are fully exposed in version control history. Anyone with repo read access can access, modify, or drop the database.
- **Action Required**: Rotate MongoDB cluster password immediately, purge commit history or rotate database users, and update documentation to use placeholders (`mongodb+srv://<username>:<password>@...`).

### 1.2 Destructive Axios Response Interceptor (403 Wipes Session)
- **File**: `client/src/api/axios.js` (lines 28-34)
- **Detail**:
  ```javascript
  if (error.response?.status === 401 || error.response?.status === 403) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
  ```
- **Risk**: Severe usability flaw. A `403 Forbidden` response indicates lack of permission for an operation (e.g. a `member` attempting to delete a lead), NOT session expiration. Treating `403` identically to `401` forcefully terminates the user's valid session and unexpectedly logs them out of the application.
- **Action Required**: Only wipe storage and redirect on `401 Unauthorized`. For `403 Forbidden`, reject the promise and display an inline permission alert to the user.

### 1.3 Server Crashes Immediately If `JWT_SECRET` is Missing at Import Time
- **File**: `server/src/utils/jwt.js` (lines 5-7)
- **Detail**:
  ```javascript
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET not defined");
  }
  ```
- **Risk**: When running auxiliary scripts, tests, or migrations where `dotenv` might not be eagerly invoked before `utils/jwt.js` is required, the entire Node.js runtime process terminates abruptly without helpful bootstrap guidance.

---

## 2. Functional & Logic Bugs

### 2.1 Bug in `/api/auth/me` Endpoint (`req.userId` vs `req.user.id`)
- **Files**: `server/src/controllers/authController.js` (line 80) and `server/src/middleware/authMiddleware.js` (lines 22-25)
- **Detail**:
  - `authMiddleware.js` attaches authenticated user data to `req.user = { id: decoded.userId, role: decoded.role }`.
  - `authController.js` calls: `const user = await getMe(req.userId);`.
  - Notice `req.userId` is `undefined`.
  - As a result, `getMe(undefined)` fails or returns `null`, causing `/api/auth/me` to consistently return a `404 Not Found: "User not found"` or `500 Server error`.
  - Additionally, line 95 attempts to return `googleId: user.googleId`, an unindexed field that does not exist on the `User` schema.
- **Action Required**: Change `req.userId` to `req.user.id` in `authController.js`, and remove `googleId`.

### 2.2 Missing Pipeline Status in Dashboard Aggregation (`PROPOSAL_SENT`)
- **File**: `server/src/services/dashboardService.js` (lines 8-16)
- **Detail**:
  - Lead model defines 6 pipeline statuses: `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL_SENT`, `WON`, `LOST`.
  - `getDashboardStats()` only counts:
    - `totalLeads`, `new`, `contacted`, `qualified`, `won`, `lost`.
  - `PROPOSAL_SENT` is entirely omitted from the dashboard metrics object and UI stat cards.

### 2.3 Mismatched Validation Schema for General Lead Updates
- **Files**: `server/src/routes/leadRoutes.js` (lines 59-64) and `server/src/validations/leadValidation.js` (lines 57-64)
- **Detail**:
  - `leadRoutes.js` has:
    ```javascript
    router.patch("/:id", authenticate, validate(updateStatusSchema), update);
    ```
  - The schema is named `updateStatusSchema`, but it actually validates name, email, phone, company, message, status.
  - Meanwhile, `router.patch("/:id/status", authenticate, updateStatus)` has **no** Zod validation middleware attached at all, relying solely on an ad-hoc in-controller array check.
- **Action Required**: Rename `updateStatusSchema` to `updateLeadSchema`, and create a dedicated `updateStatusSchema` (`z.object({ status: z.enum(...) })`) for `/api/leads/:id/status`.

### 2.4 Missing User Context and Orphaned Documents on Lead Deletion
- **Files**: `server/src/controllers/leadController.js` (lines 243-273) and `server/src/services/leadService.js` (lines 198-227)
- **Detail**:
  - `deleteLead` expects `(leadId, userId)` so it can record `createActivity(leadId, "Lead Deleted", userId)`.
  - In `leadController.js`:
    ```javascript
    const lead = await deleteLead(req.params.id); // req.user.id is omitted!
    ```
  - `userId` is passed as `undefined` to `createActivity`.
  - Furthermore, when a lead is deleted via `Lead.findByIdAndDelete(leadId)`, all child `Note` and `Activity` documents referencing that `leadId` are left as orphaned records in the database.

---

## 3. Architecture & Code Health

### 3.1 Monolithic Frontend Component (`CrmPages.jsx`)
- **File**: `client/src/pages/CrmPages.jsx` (767 lines)
- **Detail**:
  - A single file contains 9 distinct components: `Status`, `Empty`, `RequireAuth`, `Shell`, `Login`, `Dashboard`, `Leads`, `LeadForm`, and `LeadDetails`.
  - Re-rendering and maintenance are coupled together; file readability and unit testability are hindered.
- **Action Required**: Break into modular component files:
  - `components/layout/Shell.jsx`
  - `components/common/Status.jsx`, `Empty.jsx`, `RequireAuth.jsx`
  - `pages/Dashboard.jsx`, `pages/Leads.jsx`, `pages/LeadForm.jsx`, `pages/LeadDetails.jsx`

### 3.2 Dead / Orphaned Frontend Code (`SignIn.jsx`)
- **File**: `client/src/pages/SignIn.jsx`
- **Detail**:
  - `SignIn.jsx` is an unused 77-line login component styled with Tailwind utilities.
  - `App.jsx` imports `Login` from `CrmPages.jsx` for both `/login` and `/signin` routes.
  - `SignIn.jsx` is completely unused and creates confusion regarding which styling system and auth workflow is canonical.

### 3.3 Missing Team Assignment API & UI Controls
- **Detail**:
  - The backend provides `PATCH /api/leads/:id/assign`, but there is **no endpoint** to list team members (`GET /api/users`).
  - In `LeadDetails.jsx`, the "Assignment" panel only displays the current assignee or an empty state; there is no UI control (select dropdown, modal, or button) allowing an admin to assign a lead to a team member.

### 3.4 Zero Automated Test Coverage
- **Detail**:
  - Both `server` and `client` have 0 tests.
  - Critical workflows like JWT auth, lead creation, RBAC authorization, and state transitions are vulnerable to silent regressions during refactoring.

---

## Priority Matrix

| Priority | Issue | Type | Estimated Effort |
| --- | --- | --- | --- |
| **P0** | Purge and rotate hardcoded MongoDB Atlas credentials in `DEPLOYMENT.md` | Security | 15 mins |
| **P0** | Fix `/api/auth/me` by changing `req.userId` to `req.user.id` | Bug | 5 mins |
| **P1** | Stop wiping auth session on 403 Forbidden in `client/src/api/axios.js` | UX / Bug | 10 mins |
| **P1** | Add `PROPOSAL_SENT` to `dashboardService.js` stats calculation | Bug | 10 mins |
| **P1** | Correct validation schemas and attach Zod check to `PATCH /:id/status` | Quality / Bug | 20 mins |
| **P2** | Add `GET /api/users` and implement Lead Assignment dropdown in UI | Feature / Gap | 1 hour |
| **P2** | Decompose monolithic `CrmPages.jsx` into individual components | Refactoring | 1-2 hours |
| **P2** | Remove dead code `client/src/pages/SignIn.jsx` and clean `server/src/app.js` | Cleanup | 10 mins |
| **P3** | Setup Vitest / Jest test suites with integration tests | Testing | 2-4 hours |
