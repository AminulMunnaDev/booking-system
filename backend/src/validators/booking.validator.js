const { z } = require("zod");

const passengerSchema = z.object({
  seatNumber: z.string().trim().regex(/^[A-Z]\d{1,2}$/, "Invalid seat number"),
  name: z.string().trim().min(2, "Passenger name is required"),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number").optional(),
  gender: z.enum(["M", "F", "O"]).optional(),
});

const createBookingSchema = z
  .object({
    tripId: z.coerce.number().int().positive("Trip is required"),
    passengers: z
      .array(passengerSchema)
      .min(1, "Select at least one seat")
      .max(4, "You can book at most 4 seats at a time"),
  })
  .refine((v) => new Set(v.passengers.map((p) => p.seatNumber)).size === v.passengers.length, {
    message: "The same seat was selected twice",
    path: ["passengers"],
  });

const bookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"], { error: "Status must be CONFIRMED or CANCELLED" }),
});

const roleSchema = z.object({
  role: z.enum(["USER", "ADMIN"], { error: "Role must be USER or ADMIN" }),
});

const adminBookingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
    .optional(),
});

module.exports = { createBookingSchema, bookingStatusSchema, roleSchema, adminBookingQuerySchema };
