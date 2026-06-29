const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("dotenv").config();
require("./Database");
const authRoutes = require("./src/routes/authRoutes");
const timetableRoutes = require("./src/routes/timetableRoutes");


const app = express();

app.use(cors());

app.use(express.json());

app.use(

    "/api/auth",

    authRoutes

);
app.use(
    "/api/timetable",
    timetableRoutes
);

app.get("/", (req, res) => {

    res.send("API is running...");

});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(

        `Server running on port ${PORT}`

    );

});