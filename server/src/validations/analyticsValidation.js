const { z } = require("zod");

const timeseriesQuerySchema = z.object({
  range: z.enum(["week", "month"]).optional().default("week"),
  from: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid 'from' date format",
    })
    .optional(),
  to: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid 'to' date format",
    })
    .optional(),
});

module.exports = {
  timeseriesQuerySchema,
};
