const express = require("express");
const router = express.Router();
const db = require("../db");

// ======================================
// GET ALL STUDENTS
// ======================================
router.get("/", (req, res) => {

    const sql = `
        SELECT 
            id,
            student_id,
            full_name,
            gender,
            section,
            parent_email,
            student_email
        FROM students
        ORDER BY id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error("GET ALL STUDENTS ERROR:", err);
            return res.status(500).json([]);
        }

        res.json(results || []);
    });
});


// ======================================
// GET SINGLE STUDENT
// ======================================
router.get("/:id", (req, res) => {

    db.query(
        "SELECT * FROM students WHERE id = ?",
        [req.params.id],
        (err, results) => {

            if (err) {
                console.error("GET STUDENT ERROR:", err);
                return res.status(500).json(null);
            }

            if (!results || results.length === 0) {
                return res.status(404).json(null);
            }

            res.json(results[0]);
        }
    );
});


// ======================================
// ADD STUDENT
// ======================================
router.post("/", (req, res) => {

    const {
        student_id,
        full_name,
        gender = "",
        section,
        parent_email = "",
        student_email = ""
    } = req.body;

    if (!student_id || !full_name || !section || !student_email) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields"
        });
    }

    const sql = `
        INSERT INTO students 
        (student_id, full_name, gender, section, parent_email, student_email)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [student_id, full_name, gender, section, parent_email, student_email],
        (err) => {

            if (err) {
                console.error("INSERT ERROR:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database insert failed"
                });
            }

            res.json({
                success: true,
                message: "Student added successfully"
            });
        }
    );
});


// ======================================
// UPDATE STUDENT
// ======================================
router.put("/:id", (req, res) => {

    const {
        student_id,
        full_name,
        gender = "",
        section,
        parent_email = "",
        student_email = ""
    } = req.body;

    const sql = `
        UPDATE students
        SET 
            student_id = ?,
            full_name = ?,
            gender = ?,
            section = ?,
            parent_email = ?,
            student_email = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            student_id,
            full_name,
            gender,
            section,
            parent_email,
            student_email,
            req.params.id
        ],
        (err) => {

            if (err) {
                console.error("UPDATE ERROR:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database update failed"
                });
            }

            res.json({
                success: true,
                message: "Student updated successfully"
            });
        }
    );
});


// ======================================
// DELETE STUDENT
// ======================================
router.delete("/:id", (req, res) => {

    db.query(
        "DELETE FROM students WHERE id = ?",
        [req.params.id],
        (err) => {

            if (err) {
                console.error("DELETE ERROR:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database delete failed"
                });
            }

            res.json({
                success: true,
                message: "Student deleted successfully"
            });
        }
    );
});

module.exports = router;