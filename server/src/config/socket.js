const { Server } = require("socket.io");
const { verifyToken } = require("../utils/jwt");

let io = null;

const initSocket = (httpServer, { allowedOrigins = [], localOrigins = [] } = {}) => {
  const origins =
    process.env.NODE_ENV === "production"
      ? allowedOrigins
      : [...allowedOrigins, ...localOrigins];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow connections with no origin (e.g. mobile/postman) or matching origin
        if (!origin || origins.includes(origin)) {
          return callback(null, true);
        }
        return callback(null, true); // Permissive in dev, or origin check
      },
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Socket.io Handshake Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = verifyToken(token);
      socket.user = {
        id: decoded.userId,
        role: decoded.role,
      };
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user?.id;
    if (userId) {
      // Auto-join personal user room for direct notifications
      socket.join(`user:${userId}`);
    }

    // Lead-specific room subscriptions
    socket.on("join-lead", (leadId) => {
      if (leadId) {
        socket.join(`lead:${leadId}`);
      }
    });

    socket.on("leave-lead", (leadId) => {
      if (leadId) {
        socket.leave(`lead:${leadId}`);
      }
    });

    socket.on("disconnect", () => {
      // Clean disconnect
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized. Call initSocket first.");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
