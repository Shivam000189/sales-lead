# Phase 1: Research & Technical Analysis

## Objective
Investigate, analyze, and plan the resolution of foundational security vulnerabilities, runtime authentication errors, session management flaws, missing status calculations, and missing team endpoints.

---

## 1. Security Analysis: Credential Sanitization
- **File**: `DEPLOYMENT.md`
- **Issue**: Line 24 contains `MONGO_URI=mongodb+srv://Shivam0018:Shivam123@cluster0.cb9rvtm.mongodb.net/?appName=Cluster0` and Line 25 contains `JWT_SECRET=shivam2233`.
- **Remediation**:
  - Replace line 24 with `MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/?appName=Cluster0`.
  - Replace line 25 with `JWT_SECRET=your-production-jwt-secret`.
  - Ensure `.env.example` in both server and client already use placeholders (verified safe).

---

## 2. Runtime Analysis: Auth Profile Retrieval (`/api/auth/me`)
- **Files**:
  - `server/src/middleware/authMiddleware.js` (lines 22-25)
  - `server/src/controllers/authController.js` (lines 78-107)
  - `server/src/services/authService.js` (lines 61-67)
- **Current Behavior**:
  - `authMiddleware.js` assigns:
    ```javascript
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };
    ```
  - `authController.js:me` executes:
    ```javascript
    const user = await getMe(req.userId);
    ```
    Because `req.userId` is `undefined`, `getMe(undefined)` fails to match any document, resulting in a false `404 Not Found: "User not found"`.
  - Furthermore, `authController.js` line 95 returns `googleId: user.googleId`. The `User` model does not possess a `googleId` field.
- **Remediation**:
  - Change `getMe(req.userId)` to `getMe(req.user.id)`.
  - Remove `googleId: user.googleId` from the response mapping.

---

## 3. Session Flow Analysis: Axios 403 Response Interceptor
- **File**: `client/src/api/axios.js` (lines 28-36)
- **Current Behavior**:
  - Response interceptor evaluates:
    ```javascript
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    ```
  - An HTTP `403 Forbidden` response indicates insufficient permission for a specific action (e.g. non-admin member attempting to delete a lead), NOT session expiration.
  - Purging `localStorage` abruptly logs the user out and disrupts user flow.
- **Remediation**:
  - Check only for `error.response?.status === 401` before clearing credentials and redirecting.
  - On `403`, let the error reject cleanly so callers or UI components can display permission denial alerts.

---

## 4. Pipeline Analysis: `PROPOSAL_SENT` Metric Calculation
- **Files**:
  - `server/src/services/dashboardService.js` (lines 8-16, 96-107)
  - `client/src/pages/CrmPages.jsx` (lines 178-185)
- **Current Behavior**:
  - `Lead.js` defines statuses: `NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL_SENT`, `WON`, `LOST`.
  - `dashboardService.js` counts `totalLeads`, `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`.
  - `PROPOSAL_SENT` count is missing from `Promise.all` and returned data.
  - `Dashboard` in `CrmPages.jsx` lacks a metric card for `PROPOSAL_SENT`.
- **Remediation**:
  - Add `Lead.countDocuments({ status: "PROPOSAL_SENT" })` to the `dashboardService.js` query list.
  - Include `proposalSent` in the returned JSON object.
  - Add `["Proposal sent", "proposalSent", "✉", "cyan"]` to the `stats` array in `CrmPages.jsx`.

---

## 5. Model Analysis: Structured `Activity` Schema
- **Files**:
  - `server/src/models/Activity.js`
  - `server/src/services/activityService.js`
- **Current Behavior**:
  - `Activity` schema only contains `leadId`, `action` (String), `performedBy` (User ref).
  - Requirements in `INTEGRATION.md` for Email, Status Changes, Notes, and Real-Time notifications require classifying activities by structured `type` (`STATUS_CHANGE`, `NOTE_ADDED`, `EMAIL_SENT`, `ASSIGNED`, `LEAD_CREATED`, `LEAD_DELETED`).
- **Remediation**:
  - Add `type` field to `Activity` schema with enum values and default `"STATUS_CHANGE"`.
  - Maintain `action` for backward compatibility.
  - Update `createActivity` helper to accept optional `type`.

---

## 6. API Analysis: Team Members Endpoint (`GET /api/users`)
- **Files to Create / Update**:
  - `server/src/controllers/userController.js` (new)
  - `server/src/routes/userRoutes.js` (new)
  - `server/src/index.js` (mount router)
- **Design**:
  - `GET /api/users`: Guarded by `authenticate`.
  - Queries `User.find().select("-password").sort({ name: 1 })`.
  - Returns `{ success: true, data: users }`.
  - Enables user assignment dropdowns and member performance aggregations.

---

## 7. Validation & Controller Fixes
- **Files**:
  - `server/src/validations/leadValidation.js`
  - `server/src/routes/leadRoutes.js`
  - `server/src/controllers/leadController.js`
- **Remediation**:
  - Create distinct `updateLeadSchema` and `updateStatusSchema`.
  - Apply `validate(updateLeadSchema)` to `PATCH /api/leads/:id`.
  - Apply `validate(updateStatusSchema)` to `PATCH /api/leads/:id/status`.
  - In `leadController.js:remove`, pass `req.user.id` to `deleteLead(req.params.id, req.user.id)`.
