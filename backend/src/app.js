require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const registrationRoutes = require("./routes/registration");
const volunteerRoutes = require("./routes/volunteers");
const financeRoutes = require("./routes/finance");
const logisticsRoutes = require("./routes/logistics");
const superadminRoutes = require("./routes/superadmin");

const app = express();

connectDB();

app.use(cors({ origin: ["http://localhost:8080", "http://localhost:5173", "*"] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/logistics", logisticsRoutes);
app.use("/api/superadmin", superadminRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));