const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456Haffsa.",
    database: "ClassMonitoringSystem"
});

connection.connect((err) => {
    if (err) {
        console.log("Connection Error:", err);
    } else {
        console.log("MySQL Connected Successfully!");
    }
});

module.exports = connection;