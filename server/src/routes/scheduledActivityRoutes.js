const express = require("express");
const router = express.Router();
const {
  list,
  create,
  update,
  remove,
} = require("../controllers/scheduledActivityController");
const { authenticate } = require("../middleware/authMiddleware");

// List scheduled activities (supports ?from=&to=&leadId=&contactId=&completed=&type=)
router.get("/", authenticate, list);

// Create scheduled activity
router.post("/", authenticate, create);

// Update scheduled activity (reschedule, mark completed, notes)
router.put("/:id", authenticate, update);

// Delete scheduled activity
router.delete("/:id", authenticate, remove);

module.exports = router;
