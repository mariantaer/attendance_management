const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const sendEmail = require("../mailer");

// ===============================
// DB CONNECTION
// ===============================
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "attendance_db"
});

// ===============================
// MARK ATTENDANCE + EMAIL
// ===============================
router.post("/mark", (req, res) => {

    const { student_id, status } = req.body;

    const now = new Date();

    const date = now.toLocaleDateString("en-CA"); // YYYY-MM-DD

    const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    const insertQuery = `
        INSERT INTO attendance (student_id, status, date, time)
        VALUES (?, ?, ?, ?)
    `;

    db.query(insertQuery, [student_id, status, date, time], (err) => {

        if (err) {
            console.log("DB ERROR:", err);
            return res.status(500).send("Error saving attendance");
        }

        const getStudent = `
            SELECT full_name, section, student_email, parent_email
            FROM students
            WHERE id = ?
        `;

        db.query(getStudent, [student_id], async (err, results) => {

            if (err || results.length === 0) {
                return res.send("Saved but email failed");
            }

            const student = results[0];

            const mailOptions = {
                from: `"PTC Attendance System" <ptc.attendance.system@gmail.com>`,
                to: `${student.student_email}, ${student.parent_email}`,
                subject: `Attendance Notification – ${student.full_name}`,
                html: `
                    <h2>📢 Attendance Notification</h2>

                    <p>
                        <strong>${student.full_name}</strong> was marked
                        <strong>${status.toUpperCase()}</strong>
                    </p>

                    <p><strong>Section:</strong> ${student.section}</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Time:</strong> ${time}</p>
                `
            };

            try {
                await sendEmail(mailOptions);
                res.send("Saved + Email Sent");
            } catch (emailErr) {
                console.log(emailErr);
                res.send("Saved but email failed");
            }

        });

    });

});

// ===============================
// FIXED REPORTS ROUTE
// ===============================
router.get("/reports", (req, res) => {

    const query = `
        SELECT 
            a.id,
            s.student_id,
            s.full_name,
            s.section,
            a.status,
            a.date,
            a.time
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        ORDER BY a.id DESC
    `;

    db.query(query, (err, results) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(results);
    });

});

// ✅ IMPORTANT: correct export (THIS FIXES YOUR ERROR)
module.exports = router;