const {
  getFunnelMetrics,
  getConversionRateMetrics,
  getMemberPerformance,
  getLeadTimeseries,
} = require("../services/analyticsService");

const getFunnel = async (req, res) => {
  try {
    const data = await getFunnelMetrics();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch funnel metrics",
    });
  }
};

const getConversionRate = async (req, res) => {
  try {
    const data = await getConversionRateMetrics();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch conversion metrics",
    });
  }
};

const getByMember = async (req, res) => {
  try {
    const data = await getMemberPerformance();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch member performance metrics",
    });
  }
};

const getTimeseries = async (req, res) => {
  try {
    const { range, from, to } = req.query;
    const data = await getLeadTimeseries({ range, from, to });
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch lead timeseries",
    });
  }
};

module.exports = {
  getFunnel,
  getConversionRate,
  getByMember,
  getTimeseries,
};
