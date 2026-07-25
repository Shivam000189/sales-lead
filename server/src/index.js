const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

connectDB();

app.use(express.json());

const PORT = process.env.PORT || 3000;



app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});