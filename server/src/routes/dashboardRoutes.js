const express = require("express");

const router = express.Router();


const {
  dashboard,
} = require("../controllers/dashboardController");


const {
  authenticate,
} = require("../middleware/authMiddleware");



router.get(
  "/dashboard",
  authenticate,
  dashboard
);



module.exports = router;