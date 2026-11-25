const { z } = require("zod");

const dateStr = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .refine((v) => !isNaN(Date.parse(v)), "Invalid date");

const MAX_DAYS = 14;

// Single day:   ?date=2026-11-23            (still works, the mobile app uses this)
// Date range:   ?dateFrom=2026-11-23&dateTo=2026-11-27   (max 14 days)
const searchSchema = z
  .object({
    from: z.string().trim().min(1, "From city is required"),
    to: z.string().trim().min(1, "To city is required"),
    date: dateStr.optional(),
    dateFrom: dateStr.optional(),
    dateTo: dateStr.optional(),
    type: z.enum(["AC", "NON_AC"]).optional(),
    sort: z.enum(["time", "price"]).default("time"),
  })
  .superRefine((v, ctx) => {
    const start = v.dateFrom || v.date;
    if (!start) {
      ctx.addIssue({ code: "custom", message: "Date is required", path: ["date"] });
      return;
    }
    const end = v.dateTo || start;
    const days = (Date.parse(end) - Date.parse(start)) / 86400000;
    if (days < 0) {
      ctx.addIssue({ code: "custom", message: "End date cannot be before the start date", path: ["dateTo"] });
    } else if (days > MAX_DAYS - 1) {
      ctx.addIssue({
        code: "custom",
        message: `Date range cannot be more than ${MAX_DAYS} days`,
        path: ["dateTo"],
      });
    }
  });

module.exports = { searchSchema };
