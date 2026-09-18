const { z } = require("zod");

const ALLOWED_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "WON",
  "LOST",
];

const createWorkflowRuleSchema = z.object({
  name: z
    .string({ required_error: "Rule name is required" })
    .trim()
    .min(2, "Rule name must be at least 2 characters")
    .max(100, "Rule name cannot exceed 100 characters"),

  triggerStatus: z.enum(ALLOWED_STATUSES, {
    required_error: "Trigger status is required",
    invalid_type_error: "Invalid trigger status",
  }),

  action: z.enum(["SEND_EMAIL"]).optional().default("SEND_EMAIL"),

  emailTemplateKey: z
    .string({ required_error: "Email template is required" })
    .trim()
    .min(1, "Email template key is required"),

  isActive: z.boolean().optional().default(true),
});

const updateWorkflowRuleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Rule name must be at least 2 characters")
    .max(100, "Rule name cannot exceed 100 characters")
    .optional(),

  triggerStatus: z.enum(ALLOWED_STATUSES).optional(),

  action: z.enum(["SEND_EMAIL"]).optional(),

  emailTemplateKey: z.string().trim().min(1).optional(),

  isActive: z.boolean().optional(),
});

module.exports = {
  createWorkflowRuleSchema,
  updateWorkflowRuleSchema,
};
