const express = require("express");
const router = express.Router();

const {
  getFunnel,
  getConversionRate,
  getByMember,
  getTimeseries,
} = require("../controllers/analyticsController");

const { timeseriesQuerySchema } = require("../validations/analyticsValidation");
const validate = require("../middleware/validate");
const { authenticate } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// All analytics routes require authentication
router.use(authenticate);

// Pipeline funnel metrics
router.get("/funnel", getFunnel);

// Stage-to-stage conversion rate metrics
router.get("/conversion-rate", getConversionRate);

// Leads by team member (admin only)
router.get("/by-member", authorize("admin"), getByMember);

// Lead creation and win volume timeseries
router.get("/timeseries", validate.query(timeseriesQuerySchema), getTimeseries);

module.exports = router;
