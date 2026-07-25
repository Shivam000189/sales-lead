const {
  registerUser,
  loginUser,
  getMe,
} = require("../services/authService");

const { generateToken } = require("../utils/jwt");


// Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser(name, email, password);

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        _id: user.id,
        name: user.name,
        email: user.email,
        token,
      },
    });

  } catch (error) {
    res.status(error.status || error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};


// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);

    const token = generateToken(user.id);

    res.json({
      success: true,
      token,
      expiresIn: "24h",
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(error.status || error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};


// Get Current User
const me = async (req, res) => {
  try {
    const user = await getMe(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// Logout
const logout = async (_req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
};


module.exports = {
  register,
  login,
  me,
  logout,
};