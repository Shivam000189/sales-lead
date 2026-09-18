const express = require("express");
const router = express.Router();
const {
  list,
  getById,
  update,
  remove,
  getNotes,
  addNote,
} = require("../controllers/contactController");
const { authenticate } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// List contacts
router.get("/", authenticate, list);

// Get single contact
router.get("/:id", authenticate, getById);

// Update contact
router.put("/:id", authenticate, update);

// Delete contact (admin only)
router.delete("/:id", authenticate, authorize("admin"), remove);

// Contact notes
router.get("/:id/notes", authenticate, getNotes);
router.post("/:id/notes", authenticate, addNote);

module.exports = router;
