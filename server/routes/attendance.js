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

    const { student_id, status: manualStatus, time } = req.body;

    if (!student_id || !time) {
        return res.status(400).send("Missing data");
    }

    const now = new Date();
    const date = now.toISOString().split("T")[0];

    // ===============================
    // CLASS START TIME (8:00 AM)
    // ===============================
    const [hour, minutePart] = time.split(":");
    const inputHour = parseInt(hour);

    const classStart = new Date();
    classStart.setHours(8, 0, 0, 0);

    const inputTime = new Date();
    inputTime.setHours(inputHour, parseInt(minutePart), 0, 0);

    const diffMinutes = Math.floor((inputTime - classStart) / 60000);

    let finalStatus = "Present";

    if (diffMinutes <= 15) {
        finalStatus = "Present";
    } else if (diffMinutes <= 30) {
        finalStatus = "Late";
    } else {
        finalStatus = "Absent";
    }

    const insertQuery = `
        INSERT INTO attendance (student_id, status, date, time)
        VALUES (?, ?, ?, ?)
    `;

    db.query(insertQuery, [student_id, finalStatus, date, time], (err) => {

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
                subject: `Attendance Notification - ${student.full_name}`,

                html: `
                    <div style="font-family: Arial;">
                        <h2>Attendance Notification</h2>

                        <p>
                            <strong>${student.full_name}</strong>
                            is marked as
                            <strong style="color:${
                                finalStatus === "Present"
                                    ? "green"
                                    : finalStatus === "Late"
                                    ? "orange"
                                    : "red"
                            }">
                                ${finalStatus}
                            </strong>
                        </p>

                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Time:</strong> ${time}</p>
                    </div>
                `
            };

            try {
                await sendEmail(mailOptions);
                res.send(`Saved + Email Sent (${finalStatus})`);
            } catch (emailErr) {
                console.log(emailErr);
                res.send("Saved but email failed");
            }
        });
    });
});

// ===============================
// REPORTS ROUTE (FIXED DATABASE FILTER)
// ===============================
router.get("/reports", (req, res) => {

    const { date, sortBy, order } = req.query;

    const allowedSortFields = {
        name: "s.full_name",
        date: "a.date",
        time: "a.time",
        status: "a.status",
        section: "s.section"
    };

    const sortField = allowedSortFields[sortBy] || "a.date";
    const sortOrder = order === "asc" ? "ASC" : "DESC";

    let query = `
        SELECT 
            a.id,
            a.student_id,
            s.full_name,
            s.gender,
            s.section,
            a.status,
            a.date,
            a.time
        FROM attendance a
        INNER JOIN students s ON s.id = a.student_id
    `;

    const params = [];

    // ✅ DEBUG SAFE DATE FILTER
    if (date && date !== "") {
        query += ` WHERE DATE(a.date) = DATE(?)`;
        params.push(date);
    }

    query += ` ORDER BY ${sortField} ${sortOrder}`;

    console.log("REPORT QUERY:", query, params); // 🔥 DEBUG LINE

    db.query(query, params, (err, results) => {

        if (err) {
            console.log("MYSQL ERROR:", err); // 🔥 IMPORTANT
            return res.status(500).json({ error: err.message });
        }

        res.json(results);
    });
});

// ===============================
// EXPORT ROUTER
// ===============================
module.exports = router;