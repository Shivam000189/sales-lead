const { z } = require("zod");

const createScheduledActivitySchema = z
  .object({
    relatedLead: z.string().trim().nullable().optional(),
    relatedContact: z.string().trim().nullable().optional(),
    title: z.string().trim().optional(),
    type: z.enum(["CALL", "MEETING"], {
      required_error: "Activity type is required (CALL or MEETING)",
      invalid_type_error: "Type must be either CALL or MEETING",
    }),
    scheduledFor: z.string({
      required_error: "Scheduled date is required",
    }),
    notes: z.string().trim().optional(),
  })
  .refine(
    (data) => Boolean(data.relatedLead) || Boolean(data.relatedContact),
    {
      message: "Scheduled activity must be linked to either a lead or a contact",
      path: ["relatedLead"],
    }
  );

const updateScheduledActivitySchema = z.object({
  title: z.string().trim().optional(),
  type: z.enum(["CALL", "MEETING"]).optional(),
  scheduledFor: z.string().optional(),
  notes: z.string().trim().optional(),
  completed: z.boolean().optional(),
});

module.exports = {
  createScheduledActivitySchema,
  updateScheduledActivitySchema,
};
