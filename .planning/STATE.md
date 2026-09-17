# Project State

## Current Position
- **Active Milestone**: Sales-Lead 2.0 (Email, Analytics & Real-Time)
- **Status**: Onboarding complete; ready to plan and execute Phase 1
- **Active Phase**: Phase 1: Foundations & Core Bug Fixes

---

## Phase Status Summary

| Phase | Description | Status | Plans Completed |
|---|---|---|---|
| **Phase 1** | Foundations & Core Bug Fixes | Ready to Plan | 0 / TBD |
| **Phase 2** | Outbound Email Integration & Activity Logging | Backlog | 0 / TBD |
| **Phase 3** | Analytics & Reporting Engine | Backlog | 0 / TBD |
| **Phase 4** | Real-Time WebSockets Collaboration | Backlog | 0 / TBD |

---

## Key Decisions & Context

1. **Ingested Specifications**: Requirements synthesized directly from `.planning/codebase/INTEGRATION.md` and `.planning/codebase/CONCERNS.md`.
2. **Phase 1 Prioritization**: Addressed critical baseline stability (auth bug, session wiping on 403, credential leak, missing team members endpoint) before adding external dependencies and new features.
3. **Database Architecture**: Mongoose models will maintain backward compatibility while enriching the `Activity` schema to support `type: "EMAIL_SENT"`.
4. **WebSocket Design**: Socket.io attached directly to the existing HTTP server instance sharing port 3000, guarded with handshake JWT auth.
5. **Analytics Strategy**: Pure MongoDB aggregation pipelines (`$group`, `$lookup`, `$dateTrunc`) avoiding in-memory array manipulation in Node.js.

---

## Known Blockers & Warnings
- **MongoDB Atlas Credentials**: `DEPLOYMENT.md` contained hardcoded production credentials. These must be replaced in Phase 1 and the database password rotated.
- **SMTP Credentials Needed**: Phase 2 requires valid SMTP configuration (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) for live testing (can use Ethereal / Mailtrap in development).
