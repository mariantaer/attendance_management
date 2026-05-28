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

router.delete("/teachers/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM users WHERE id = ? AND role = 'teacher'",
        [id],
        (err) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to delete teacher"
                });
            }

            res.json({
                message: "Teacher deleted successfully"
            });
        }
    );
});

module.exports = router;