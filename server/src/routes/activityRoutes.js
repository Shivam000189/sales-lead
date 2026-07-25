const express = require("express");

const router = express.Router();


const {
  getActivities,
} = require("../controllers/activityController");


const {
  authenticate,
} = require("../middleware/authMiddleware");



router.get(
  "/leads/:id/activities",
  authenticate,
  getActivities
);



module.exports = router;