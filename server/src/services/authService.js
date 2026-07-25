const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/hash");


const registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw {
      status: 409,
      message: "Email already exists",
    };
  }

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
};


const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw {
      status: 404,
      message: "User not found",
    };
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) {
    throw {
      status: 400,
      message: "Invalid credentials",
    };
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};


const getMe = async (userId) => {
  const user = await User.findById(userId).select(
    "-password"
  );

  return user;
};


module.exports = {
  registerUser,
  loginUser,
  getMe,
};