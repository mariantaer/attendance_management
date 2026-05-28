const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "ptc.attendance.system@gmail.com",
        pass: "eaiy vjpi zxmx sgcc"

    }
});

async function sendEmail(
    to,
    subject,
    html
) {

    // stop blank/null emails
    if (
        !to ||
        typeof to !== "string" ||
        to.trim() === ""
    ) {
        console.log(
            "Email skipped: no recipient"
        );
        return;
    }

    try {

        await transporter.sendMail({
            from: "ptc.attendance.system@gmail.com",
            to: to.trim(),
            subject,
            html
        });

        console.log(
            "Email sent to:",
            to
        );

    } catch (err) {

        console.error(
            "EMAIL ERROR:",
            err.message
        );
    }
}

module.exports = sendEmail;