const express = require("express");

const router = express.Router();


const {
  create,
  getAll,
  remove,
} = require("../controllers/noteController");


const {
  authenticate,
} = require("../middleware/authMiddleware");



const authorize = require("../middleware/authorize");



// Add Note to Lead
router.post(
  "/leads/:id/notes",
  authenticate,
  create
);


// Get Lead Notes
router.get(
  "/leads/:id/notes",
  authenticate,
  getAll
);


// Delete Note
router.delete(
  "/notes/:id",
  authenticate,
  authorize("admin"),
  remove
);



module.exports = router;