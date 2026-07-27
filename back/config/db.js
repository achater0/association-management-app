const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to the specific database file
const db = new sqlite3.Database(path.join(__dirname, '../ams_database.db'), (err) => {
    if (err) {
        console.error("connection failed:", err.message);
    } else {
        console.log("Connected to the database.");
    }
});

module.exports = db;