const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("dotenv").config();
require("./Database");
const authRoutes = require("./src/routes/authRoutes");
const timetableRoutes = require("./src/routes/timetableRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const monitoringdutyRoutes = require("./src/routes/monitoringdutyRoutes");
const locationRoutes = require("./src/routes/locationRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const reportRoutes = require("./src/routes/reportRoutes");

const app = express();

app.use(cors());
app.use(locationRoutes);
app.use(reportRoutes);
app.use(dashboardRoutes);

app.use(express.json());

app.use(

    "/api/auth",

    authRoutes

);
app.use(
    "/api/timetable",
    timetableRoutes
);
app.use(
    "/api/attendance",
    attendanceRoutes
);

app.use("/api/report", reportRoutes);

app.get("/", (req, res) => {

    res.send("API is running...");

});

app.use("/api/monitoring-duty", monitoringdutyRoutes);

app.use("/api/location", locationRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(

        `Server running on port ${PORT}`

    );

});