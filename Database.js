const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000, // TiDB ka port 4000 hota hai
    ssl: {
        rejectUnauthorized: true // TiDB ke liye SSL zaroori hai
    }
});
db.connect((err) => {
    if (err) {
        console.log("Database Connection Failed");
        console.log(err);
    }
    else {
        console.log("MySQL TiDB Connected Successfully!");
    }
});
module.exports = db;