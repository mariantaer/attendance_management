const express = require("express");
const router = express.Router();
const db = require("../db");

// LOGIN
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    // 1. Basic validation
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Query database
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error" });
        }

        // 3. Check user
        if (result.length > 0) {
            const user = result[0];

            return res.json({
                message: "Login successful",
                id: user.id,
                email: user.email,
                role: user.role
            });
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    });
});

module.exports = router;