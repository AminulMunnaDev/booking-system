const router = require("express").Router();
const { verifyToken } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { createBookingSchema } = require("../validators/booking.validator");
const bookings = require("../controllers/bookings.controller");

// Every route here needs a logged-in user
router.use(verifyToken);

router.post("/", validate(createBookingSchema), bookings.createBooking);
router.get("/my", bookings.myBookings); // "/my" must come before "/:id"
router.get("/:id", bookings.getBooking);
router.patch("/:id/cancel", bookings.cancelBooking);

module.exports = router;
