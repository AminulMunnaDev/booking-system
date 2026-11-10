// Usage: router.post("/register", validate(registerSchema), controller)
// Replaces req.body with the cleaned data. Zod errors are handled by errorHandler (400).
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body ?? {});
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = validate;
