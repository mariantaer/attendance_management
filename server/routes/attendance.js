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
// TIME FORMATTER
// ===============================
function formatTime12Hour(timeStr) {

    if (!timeStr) return "";

    // already formatted
    if (/AM|PM/i.test(timeStr)) {
        return timeStr.trim();
    }

    const parts = timeStr.split(":");

    let hour = parseInt(parts[0], 10);
    const minute = parts[1];

    const period = hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minute} ${period}`;
}

// ===============================
// MARK ATTENDANCE + EMAIL
// ===============================
router.post("/mark", (req, res) => {

    console.log(req.body);

    const {
        student_id,
        status: manualStatus,
        time
    } = req.body;

    if (!student_id) {
        return res.status(400).send("Missing student ID");
    }

    const now = new Date();

    const date =
        now.toISOString().split("T")[0];

    // use current time if blank
    const finalTime =
        time ||
        `${String(now.getHours()).padStart(2, "0")}:${String(
            now.getMinutes()
        ).padStart(2, "0")}`;

    const formattedTime =
        formatTime12Hour(finalTime);

    const finalStatus =
        manualStatus || "Present";

    const insertQuery = `
        INSERT INTO attendance
        (
            student_id,
            status,
            date,
            time
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        insertQuery,
        [
            student_id,
            finalStatus,
            date,
            formattedTime
        ],
        (err) => {

            if (err) {
                console.log("DB ERROR:", err);
                return res
                    .status(500)
                    .send(err.message);
            }

            const getStudent = `
                SELECT
                    student_id,
                    full_name,
                    section,
                    student_email,
                    parent_email
                FROM students
                WHERE student_id = ?
            `;

            db.query(
                getStudent,
                [student_id],
                async (err, results) => {

                    if (
                        err ||
                        results.length === 0
                    ) {
                        return res.send(
                            "Attendance saved."
                        );
                    }

                    const student =
                        results[0];

                    const mailOptions = {
                        from:
                            `"PTC Attendance System" <ptc.attendance.system@gmail.com>`,

                        to:
                            `${student.student_email}, ${student.parent_email}`,

                        subject:
                            `Attendance Notification - ${student.full_name}`,

                        html: `
                            <div style="font-family:Arial;">
                                <h2>Attendance Notification</h2>

                                <p>
                                    <strong>Student ID:</strong>
                                    ${student.student_id}
                                </p>

                                <p>
                                    <strong>Name:</strong>
                                    ${student.full_name}
                                </p>

                                <p>
                                    <strong>Section:</strong>
                                    ${student.section}
                                </p>

                                <p>
                                    Status:
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

                                <p>
                                    <strong>Date:</strong>
                                    ${date}
                                </p>

                                <p>
                                    <strong>Time:</strong>
                                    ${formattedTime}
                                </p>
                            </div>
                        `
                    };

                    try {
                        await sendEmail(mailOptions);

                        res.send(
                            `Saved + Email Sent (${finalStatus})`
                        );
                    } catch (emailErr) {

                        console.log(
                            "EMAIL ERROR:",
                            emailErr
                        );

                        res.send(
                            "Attendance saved but email failed."
                        );
                    }
                }
            );
        }
    );
});

// ===============================
// REPORTS ROUTE
// ===============================
router.get("/reports", (req, res) => {

    const { date } = req.query;

    let query = `
        SELECT
            s.student_id,
            s.full_name,
            s.gender,
            s.section,
            a.status,
            DATE_FORMAT(a.date, '%Y-%m-%d') AS date,
            a.time
        FROM attendance a
        INNER JOIN students s
            ON s.student_id = a.student_id
    `;

    const params = [];

    if (date && date !== "") {
        query += `
            WHERE DATE(a.date) = DATE(?)
        `;
        params.push(date);
    }

    query += `
        ORDER BY
            a.date DESC,
            a.time DESC
    `;

    db.query(
        query,
        params,
        (err, results) => {

            if (err) {
                console.log(err);

                return res
                    .status(500)
                    .json({
                        error:
                            err.message
                    });
            }

            res.json(results);
        }
    );
});

// ===============================
// EXPORT
// ===============================
module.exports = router;