require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const noteRoutes = require("./routes/noteRoutes");
const activityRoutes = require("./routes/activityRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const workflowRoutes = require("./routes/workflowRoutes");
const contactRoutes = require("./routes/contactRoutes");
const scheduledActivityRoutes = require("./routes/scheduledActivityRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { startInboundEmailJob } = require("./jobs/inboundEmailJob");
const cors = require("cors");


const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

connectDB();

app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 3000;
const localOrigins = ["http://localhost:5173", "http://127.0.0.1:5173", "https://digital-h-mocha.vercel.app"];
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(cors((req, callback) => {
  const origin = req.header("Origin");
  const requestOrigin = `${req.protocol}://${req.get("host")}`;
  const origins = process.env.NODE_ENV === "production"
    ? allowedOrigins
    : [...allowedOrigins, ...localOrigins];

  if (!origin || origin === requestOrigin || origins.includes(origin)) {
    return callback(null, { origin: true, credentials: true });
  }

  return callback(new Error("Not allowed by CORS"));
}));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/users", userRoutes);
app.use("/api", noteRoutes);
app.use("/api", activityRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/scheduled-activities", scheduledActivityRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

const clientDistPath = path.join(__dirname, "../../client/dist");
const shouldServeClient = process.env.SERVE_CLIENT === "true" || process.env.NODE_ENV === "production";

if (shouldServeClient && fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

app.use((error, _req, res, _next) => {
  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Not allowed by CORS",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Server error",
  });
});

const server = http.createServer(app);
initSocket(server, { allowedOrigins, localOrigins });

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startInboundEmailJob();
});
