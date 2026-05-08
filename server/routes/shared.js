const express = require("express");
const router = express.Router();
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "attendance_db"
});

// GET ALL SECTIONS (GLOBAL USE)
router.get("/sections", (req, res) => {

    const query = `
        SELECT DISTINCT section 
        FROM students 
        ORDER BY section ASC
    `;

    db.query(query, (err, results) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ error: "DB error" });
        }

        res.json(results.map(r => r.section));
    });
});

module.exports = router;