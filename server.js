const express = require("express");
const cors = require("cors");
const db = require("./Database");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.get("/test-db", (req, res) => {
    db.query("SELECT 1 AS result", (err, results) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(results);
    });
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});