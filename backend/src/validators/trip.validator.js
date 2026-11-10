const { z } = require("zod");

const searchSchema = z.object({
  from: z.string().trim().min(1, "From city is required"),
  to: z.string().trim().min(1, "To city is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .refine((v) => !isNaN(Date.parse(v)), "Invalid date"),
  type: z.enum(["AC", "NON_AC"]).optional(),
  sort: z.enum(["time", "price"]).default("time"),
});

module.exports = { searchSchema };
