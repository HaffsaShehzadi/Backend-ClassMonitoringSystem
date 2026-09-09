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
const teacherRoutes = require("./src/routes/teacherRoutes");
const complaintRoutes = require("./src/routes/complaintRoutes");
const userRoutes = require("./src/routes/userRoutes"); // Path ko baqi files ke pattern ke mutabiq theek kar diya
const departmentRoutes = require('./src/routes/departmentRoutes');

// ✅ 4. Ab 'app' use karein (Pehle yeh line upar thi, isliye error aa raha tha)
app.use('/api/users', userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/monitoring-duty", monitoringdutyRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/departments", departmentRoutes);

app.get("/", (req, res) => {
    res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});