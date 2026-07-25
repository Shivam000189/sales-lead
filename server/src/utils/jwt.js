const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not defined");
}


const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
};


const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};


module.exports = {
  generateToken,
  verifyToken,
};