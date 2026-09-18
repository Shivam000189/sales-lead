const { z } = require("zod");

const updateContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  email: z.string().trim().email("Invalid email address").optional(),
  phone: z.string().trim().min(1, "Phone is required").optional(),
  company: z.string().trim().optional(),
  assignedTo: z.string().nullable().optional(),
});

module.exports = {
  updateContactSchema,
};
