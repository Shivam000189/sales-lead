const {
  getDashboardStats,
} = require("../services/dashboardService");



const dashboard = async (req, res) => {

  try {

    const stats = await getDashboardStats();


    res.json({
      success: true,
      data: stats,
    });


  } catch(error) {

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }

};



module.exports = {
  dashboard,
};