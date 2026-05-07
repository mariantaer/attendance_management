const express = require("express");
const router = express.Router();
const db = require("../db");

// GET TEACHERS
router.get("/teachers", (req, res) => {
    db.query("SELECT * FROM users WHERE role='teacher'", (err, result) => {
        res.json(result);
    });
});

// ADD TEACHER
router.post("/teacher", (req, res) => {
    const { name, email, password } = req.body;

    db.query(
        "INSERT INTO users(name,email,password,role) VALUES(?,?,?, 'teacher')",
        [name, email, password],
        (err) => {
            if (err) return res.send(err);
            res.send("Teacher added");
        }
    );
});

module.exports = router;