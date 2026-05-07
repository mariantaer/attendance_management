const express = require("express");
const router = express.Router();
const db = require("../db");

// GET STUDENTS
router.get("/students", (req, res) => {
    db.query("SELECT * FROM students", (err, result) => {
        res.json(result);
    });
});

router.get("/teachers", (req, res) => {
    db.query("SELECT * FROM users WHERE role='teacher'", (err, result) => {
        res.json(result);
    });
});

router.post("/teacher", (req, res) => {
    const { name, email, password } = req.body;

    db.query(
        "INSERT INTO users(name,email,password,role) VALUES(?,?,?,'teacher')",
        [name, email, password],
        (err) => {
            if (err) return res.send(err);
            res.send("Teacher added successfully");
        }
    );
});

module.exports = router;