const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const sendEmail = require("../mailer");

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
    const { student_id, status, time } = req.body;

    if (!student_id || !status) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields"
        });
    }

    const now = new Date();
    const date = now.toISOString().split("T")[0];

    const finalTime =
        time && time !== ""
            ? time
            : now.toTimeString().slice(0, 5);

    // FIND STUDENT
    db.query(
        "SELECT * FROM students WHERE student_id = ?",
        [student_id],
        async (err, result) => {
            if (err) {
                console.log("DB ERROR:", err);
                return res.status(500).json(err);
            }

            if (result.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found"
                });
            }

            const student = result[0];

            // SAVE ATTENDANCE
            db.query(
                `INSERT INTO attendance
                (student_id, name, section, status, date, time)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    student.student_id,
                    student.full_name,
                    student.section,
                    status,
                    date,
                    finalTime
                ],
                async (insertErr) => {
                    if (insertErr) {
                        console.log("INSERT ERROR:", insertErr);
                        return res.status(500).json(insertErr);
                    }

                    try {
                        await sendAttendanceEmail(
                            student,
                            status,
                            date,
                            finalTime
                        );

                        res.json({
                            success: true,
                            emailSent: true,
                            message:
                                "Attendance saved and emails sent"
                        });

                    } catch (emailErr) {
                        console.log("EMAIL ERROR:", emailErr);

                        res.json({
                            success: true,
                            emailSent: false,
                            message:
                                "Attendance saved but email failed"
                        });
                    }
                }
            );
        }
    );
});

// ===============================
// REPORTS
// ===============================
router.get("/reports", (req, res) => {
    const sql = `
        SELECT
            a.student_id,
            s.full_name,
            s.gender,
            s.section,
            a.status,

            DATE_FORMAT(a.date,'%Y-%m-%d') AS date,

            TIME_FORMAT(
                STR_TO_DATE(a.time,'%H:%i'),
                '%h:%i %p'
            ) AS time

        FROM attendance a
        JOIN students s
        ON s.student_id = a.student_id

        ORDER BY a.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(results);
    });
});

// ===============================
// EMAIL FUNCTION
// ===============================
async function sendAttendanceEmail(
    student,
    status,
    date,
    time
) {
    const emails = [];

    // parent email
    if (
        student.parent_email &&
        student.parent_email.trim() !== ""
    ) {
        emails.push(student.parent_email.trim());
    }

    // student email
    if (
        student.student_email &&
        student.student_email.trim() !== ""
    ) {
        emails.push(student.student_email.trim());
    }

    // remove duplicates
    const uniqueEmails = [...new Set(emails)];

    if (uniqueEmails.length === 0) {
        console.log(
            "NO EMAIL FOUND:",
            student.student_id
        );
        return;
    }

    const subject = "Attendance Notification";

    const html = `
        <h2>Attendance Update</h2>

        <p><b>Student ID:</b> ${student.student_id}</p>
        <p><b>Name:</b> ${student.full_name}</p>
        <p><b>Section:</b> ${student.section}</p>
        <p><b>Status:</b> ${status}</p>
        <p><b>Date:</b> ${date}</p>
        <p><b>Time:</b> ${time}</p>
    `;

    // send to all emails
    for (const email of uniqueEmails) {
        await sendEmail(email, subject, html);
        console.log("Sent to:", email);
    }
}

module.exports = router;