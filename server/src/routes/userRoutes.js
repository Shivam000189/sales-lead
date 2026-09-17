const express = require("express");
const { getUsers } = require("../controllers/userController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/users - list team members
router.get("/", authenticate, getUsers);

module.exports = router;
