const express = require("express");
const router = express.Router();
const db = require("../db");

// GET STUDENTS
router.get("/students", (req, res) => {
    db.query("SELECT * FROM students", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// GET TEACHERS
router.get("/teachers", (req, res) => {
    db.query(
        "SELECT * FROM users WHERE role='teacher'",
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json(result);
        }
    );
});

// ADD TEACHER
router.post("/teacher", (req, res) => {
    const { name, email, password } = req.body;

    db.query(
        "INSERT INTO users(name,email,password,role) VALUES(?,?,?,'teacher')",
        [name, email, password],
        (err) => {
            if (err) return res.status(500).send(err);

            res.send("Teacher added successfully");
        }
    );
});


module.exports = router;