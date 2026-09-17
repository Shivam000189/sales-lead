const User = require("../models/User");

// Get all users (team members)
const getUsers = async (_req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ name: 1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getUsers,
};
