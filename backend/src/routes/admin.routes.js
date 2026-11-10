const router = require("express").Router();
const { verifyToken, requireRole } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { busSchema, routeSchema, tripSchema } = require("../validators/admin.validator");

const bus = require("../controllers/bus.controller");
const route = require("../controllers/route.controller");
const trip = require("../controllers/adminTrip.controller");

// Every route in this file needs a logged-in ADMIN
router.use(verifyToken, requireRole("ADMIN"));

// Buses
router.get("/buses", bus.listBuses);
router.post("/buses", validate(busSchema), bus.createBus);
router.put("/buses/:id", validate(busSchema), bus.updateBus);
router.delete("/buses/:id", bus.deleteBus);

// Routes
router.get("/routes", route.listRoutes);
router.post("/routes", validate(routeSchema), route.createRoute);
router.put("/routes/:id", validate(routeSchema), route.updateRoute);
router.delete("/routes/:id", route.deleteRoute);

// Trips
router.get("/trips", trip.listTrips);
router.post("/trips", validate(tripSchema), trip.createTrip);
router.put("/trips/:id", validate(tripSchema), trip.updateTrip);
router.delete("/trips/:id", trip.deleteTrip);

module.exports = router;
