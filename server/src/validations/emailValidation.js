const { z } = require("zod");

const sendEmailSchema = z.object({
  subject: z
    .string({ required_error: "Subject is required" })
    .trim()
    .min(1, "Subject is required")
    .max(150, "Subject cannot exceed 150 characters"),

  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message is required")
    .max(5000, "Message cannot exceed 5000 characters"),
});

module.exports = {
  sendEmailSchema,
};
