const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email").transform((v) => v.toLowerCase()),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.email("Enter a valid email").transform((v) => v.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

module.exports = { registerSchema, loginSchema };
