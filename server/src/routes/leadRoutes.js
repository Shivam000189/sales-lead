const express = require("express");

const router = express.Router();
const validate = require("../middleware/validate");

const {
  create,
  getAll,
  getOne,
  update,
  updateStatus,
  assign,
  remove,
} = require("../controllers/leadController");

const { sendLeadEmail } = require("../controllers/emailController");

const {
  createLeadSchema,
  updateLeadSchema,
  updateStatusSchema,
  assignLeadSchema,
} = require("../validations/leadValidation");

const { sendEmailSchema } = require("../validations/emailValidation");

const { authenticate } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// Create Lead (Public visitor or authenticated user)
router.post(
  "/",
  validate(createLeadSchema),
  create
);

// View All Leads
router.get(
  "/",
  authenticate,
  getAll
);

// View Single Lead
router.get(
  "/:id",
  authenticate,
  getOne
);

// Update Lead details
router.patch(
  "/:id",
  authenticate,
  validate(updateLeadSchema),
  update
);

// Assign Lead (Admin Only)
router.patch(
  "/:id/assign",
  authenticate,
  authorize("admin"),
  validate(assignLeadSchema),
  assign
);

// Update Lead Status
router.patch(
  "/:id/status",
  authenticate,
  validate(updateStatusSchema),
  updateStatus
);

// Send Email to Lead
router.post(
  "/:id/send-email",
  authenticate,
  validate(sendEmailSchema),
  sendLeadEmail
);

// Delete Lead (Admin Only)
router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  remove
);

module.exports = router;
