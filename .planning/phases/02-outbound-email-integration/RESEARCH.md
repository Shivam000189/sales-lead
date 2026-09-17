# Phase 2: Research - Outbound Email Integration & Activity Logging

## Objective
Design and specify the outbound email service, templating engine, endpoint authorization rules, activity trail integration, and interactive modal on the Lead Detail view.

---

## 1. Dependencies & Configuration
- **Package**: `nodemailer` (installed in `server/`).
- **Environment Variables**:
  - `SMTP_HOST`: SMTP server host (e.g. `smtp.mailtrap.io`, `smtp.gmail.com`, `smtp.resend.com`).
  - `SMTP_PORT`: Port (e.g. `2525`, `587`, `465`).
  - `SMTP_USER`: SMTP username / API key.
  - `SMTP_PASS`: SMTP password.
  - `SMTP_FROM`: Default sender address (e.g. `"HeroCRM" <no-reply@herocrm.com>`).
- **Resilience Strategy**:
  - If SMTP credentials are missing in development, log a warning and return a mock send or test preview so that local development and UI testing can proceed without hard crashes.
  - In production, missing credentials or connection timeouts reject with a clean 502 Bad Gateway.

---

## 2. Branded HTML Email Template
- **File**: `server/src/utils/emailTemplates.js`
- **Function**: `buildLeadEmailHtml({ subject, message, leadName })`
- **Design Elements**:
  - Minimal, high-contrast, responsive container (max-width: 600px).
  - Brand header: "HeroCRM".
  - Personalized salutation: `Hi ${leadName || "there"},`.
  - Body copy: sanitizes/escapes text and converts newlines to `<p>` or `<br/>`.
  - Professional email signature: sender's team / workspace name.
  - Subtle footer: "Sent via HeroCRM".

---

## 3. Endpoint Design & Security Guard
- **Route**: `POST /api/leads/:id/send-email`
- **Middleware Pipeline**:
  - `authenticate`: Enforces valid Bearer JWT.
  - `validate(sendEmailSchema)`: Validates body (`subject`: 1-150 chars, `message`: 1-5000 chars).
- **Ownership & Authorization**:
  - Fetch lead by ID (`Lead.findById(id)`).
  - If lead does not exist: return 404 `"Lead not found"`.
  - If user is `member` and `lead.assignedTo?.toString() !== req.user.id`: return 403 `"Forbidden: You can only email leads assigned to you"`.
  - If user is `admin`: allowed to email any lead.
- **Side-Effects & Audit**:
  - Call `emailService.sendEmail(...)`.
  - Only when email dispatch resolves successfully, call `createActivity(lead._id, `Email sent: ${subject}`, req.user.id, "EMAIL_SENT")`.
  - Return `{ success: true, message: "Email sent successfully", data: activity }`.
  - If email fails: return `{ success: false, message: error.message }` with status 502/400. Zero phantom activity records.

---

## 4. Frontend UI: Lead Detail Email Flow
- **Component**: `LeadDetails` in `client/src/pages/CrmPages.jsx`
- **UI Elements**:
  - "Send Email" action button next to "Edit lead" in `head-actions`.
  - Accessible modal dialog overlay:
    - Recipient preview (`To: ${lead.email}`).
    - Input: Subject line (`required`, autofocus).
    - Textarea: Message content (`required`, 5 rows).
    - Actions: Cancel button, "Send email" primary button with spinner / disabled loading state.
  - Toast alert: Success notification ("Email sent successfully to ...") or error alert.
  - Activity Timeline:
    - Render mail indicator (✉ / SVG icon) for `a.type === "EMAIL_SENT"`.
    - Prepend new activity immediately to `activities` state without requiring a full page refresh.
