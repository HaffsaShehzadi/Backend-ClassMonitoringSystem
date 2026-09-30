const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./Database");

// ✅ 1. Sab se pehle 'app' ko initialize karein (Error yahan se fix hua)
const app = express();

// ✅ 2. Phir Middlewares lagayein
app.use(cors());
app.use(express.json());

// ✅ 3. Phir Routes import karein
const authRoutes = require("./src/routes/authRoutes");
const timetableRoutes = require("./src/routes/timetableRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const monitoringdutyRoutes = require("./src/routes/monitoringdutyRoutes");
const locationRoutes = require("./src/routes/locationRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const reportRoutes = require("./src/routes/reportRoutes");
const complaintRoutes = require("./src/routes/complaintRoutes");
const userRoutes = require("./src/routes/userRoutes");
const departmentRoutes = require('./src/routes/departmentRoutes');

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/monitoring-duty", monitoringdutyRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/departments", departmentRoutes);

const path = require("path");
const fs = require("fs");

// ✅ Web Frontend Static Serving (agar public/ folder majood ho)
const publicPath = path.join(__dirname, "public");
if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        res.sendFile(path.join(publicPath, "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.send("API is running...");
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});