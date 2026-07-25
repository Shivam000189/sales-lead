const { verifyToken } = require("../utils/jwt");


const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyToken(token);

    req.userId = decoded.userId;

    next();

  } catch (error) {
    res.status(401).json({
      message: "Invalid token",
    });
  }
};


module.exports = {
  authMiddleware,
};