const router = require("express").Router();
const { register, login, me } = require("../controllers/auth.controller");
const { verifyToken, requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", verifyToken, me);

// TEMPORARY: only to test the ADMIN role check. Delete after testing.
router.get("/admin-check", verifyToken, requireRole("ADMIN"), (req, res) => {
  res.json({ message: "Hello admin, role check works" });
});

module.exports = router;
