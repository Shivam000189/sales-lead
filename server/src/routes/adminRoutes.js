const express = require("express");
const router = express.Router();
const { syncInbox } = require("../controllers/adminController");
const { authenticate } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// POST /api/admin/sync-inbox - Manual trigger for inbound email synchronization (Admin only)
router.post("/sync-inbox", authenticate, authorize("admin"), syncInbox);

module.exports = router;
