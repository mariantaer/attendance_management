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

    const { student_id, status, time } = req.body;

    if (!student_id || !status) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields"
        });
    }

    const now = new Date();

    const date =
        now.toISOString().split("T")[0];

    // SAVE AS 24-HOUR FORMAT
    const finalTime =
        time &&
        time !== ""
            ? time
            : now.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });

    // ===============================
    // FIND STUDENT
    // ===============================
    db.query(
        "SELECT * FROM students WHERE id = ?",
        [student_id],
        (err, studentResult) => {

            if (err) {

                console.error(
                    "STUDENT ERROR:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (
                studentResult.length === 0
            ) {

                return res.status(404).json({
                    success: false,
                    message: "Student not found"
                });
            }

            const student =
                studentResult[0];

            // ===============================
            // INSERT ONLY
            // ===============================
            db.query(
                `
                INSERT INTO attendance
                (
                    student_id,
                    name,
                    section,
                    status,
                    date,
                    time
                )
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [
                    student.student_id,
                    student.full_name,
                    student.section,
                    status,
                    date,
                    finalTime
                ],
                (insertErr, result) => {

                    if (insertErr) {

                        console.error(
                            "INSERT ERROR:",
                            insertErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                insertErr.message
                        });
                    }

                    console.log(
                        "Attendance Saved:",
                        result.insertId
                    );

                    sendAttendanceEmail(
                        student,
                        status,
                        date,
                        finalTime
                    );

                    return res.json({
                        success: true,
                        message:
                            "Attendance saved"
                    });
                }
            );
        }
    );
});

// ===============================
// EMAIL FUNCTION
// ===============================
function sendAttendanceEmail(
    student,
    status,
    date,
    time
) {

    // skip if blank/null
    if (
        !student.student_email ||
        student.student_email.trim() === ""
    ) {

        console.log(
            `Email skipped for student ${student.id}`
        );

        return;
    }

    const subject =
        "Attendance Confirmation";

    const html = `
        <h2>Attendance Confirmation</h2>

        <p><b>Student ID:</b>
            ${student.student_id}
        </p>

        <p><b>Name:</b>
            ${student.full_name}
        </p>

        <p><b>Section:</b>
            ${student.section}
        </p>

        <p><b>Status:</b>
            ${status}
        </p>

        <p><b>Date:</b>
            ${date}
        </p>

        <p><b>Time:</b>
            ${time}
        </p>
    `;

    sendEmail(
        student.student_email,
        subject,
        html
    ).catch(err => {

        console.error(
            "EMAIL ERROR:",
            err.message
        );
    });
}

// ===============================
// REPORTS
// ===============================
router.get("/reports", (req, res) => {

    const sql = `
        SELECT
            a.id,
            s.student_id,
            s.full_name,
            s.gender,
            s.section,
            a.status,
            DATE_FORMAT(a.date, '%Y-%m-%d') AS date,
            TIME_FORMAT(a.time, '%H:%i:%s') AS time

        FROM attendance a

        JOIN students s
            ON s.id = a.student_id

        ORDER BY a.id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "REPORT ERROR:",
                err
            );

            return res.status(500).json({
                error: err.message
            });
        }

        console.log(
            "REPORT DATA:",
            results
        );

        res.json(results);
    });
});

module.exports = router;