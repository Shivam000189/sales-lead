const express = require("express");
const router = express.Router();

const {
  getRules,
  getTemplates,
  createRule,
  updateRule,
  deleteRule,
} = require("../controllers/workflowController");

const {
  createWorkflowRuleSchema,
  updateWorkflowRuleSchema,
} = require("../validations/workflowValidation");

const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// All workflow routes require authentication and admin authorization
router.use(authenticate);
router.use(authorize("admin"));

// List available email templates
router.get("/templates", getTemplates);

// List all workflow rules
router.get("/", getRules);

// Create a new workflow rule
router.post("/", validate(createWorkflowRuleSchema), createRule);

// Update an existing workflow rule
router.patch("/:id", validate(updateWorkflowRuleSchema), updateRule);

// Delete a workflow rule
router.delete("/:id", deleteRule);

module.exports = router;
