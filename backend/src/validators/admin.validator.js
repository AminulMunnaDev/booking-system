const { z } = require("zod");

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:MM (24 hour)");

const busSchema = z.object({
  name: z.string().trim().min(2, "Bus name is required"),
  plateNo: z.string().trim().min(3, "Plate number is required"),
  type: z.enum(["AC", "NON_AC"], { error: "Type must be AC or NON_AC" }),
  totalSeats: z.coerce.number().int().min(1).max(60).default(40),
});

const routeSchema = z
  .object({
    fromCity: z.string().trim().min(2, "From city is required"),
    toCity: z.string().trim().min(2, "To city is required"),
    distanceKm: z.coerce.number().int().positive().optional().nullable(),
  })
  .refine((v) => v.fromCity.toLowerCase() !== v.toCity.toLowerCase(), {
    message: "From and To cities must be different",
    path: ["toCity"],
  });

const tripSchema = z.object({
  routeId: z.coerce.number().int().positive("Route is required"),
  busId: z.coerce.number().int().positive("Bus is required"),
  travelDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .refine((v) => !isNaN(Date.parse(v)), "Invalid date"),
  departureTime: time,
  arrivalTime: time.optional().nullable(),
  price: z.coerce.number().int().positive("Price must be greater than 0"),
  isActive: z.boolean().default(true),
});

module.exports = { busSchema, routeSchema, tripSchema };
