const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const noteRoutes = require("./routes/noteRoutes");
const activityRoutes = require("./routes/activityRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");


const app = express();

connectDB();

app.use(express.json());

const PORT = process.env.PORT || 3000;



app.use('/api/auth', authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api", noteRoutes);
app.use("/api", activityRoutes);
app.use("/api", dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});