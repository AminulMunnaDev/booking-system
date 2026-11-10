const router = require("express").Router();
const trips = require("../controllers/trips.controller");

// No login needed. Mounted at /api
router.get("/cities", trips.getCities);

// "search" and "popular-routes" MUST come before "/trips/:id"
router.get("/trips/search", trips.searchTrips);
router.get("/trips/popular-routes", trips.popularRoutes);
router.get("/trips/:id", trips.getTripDetails);

module.exports = router;
