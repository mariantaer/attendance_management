const nodemailer = require("nodemailer");

const transporter =
    nodemailer.createTransport({
        service: "gmail",
        auth: {
            user:
                "attendance.mngt.system@gmail.com",

            pass:
                "czptabfupnnpnjuz"
        }
    });

async function sendEmail(
    to,
    subject,
    html
) {
    if (!to || to.trim() === "") {
        throw new Error(
            "No recipient email"
        );
    }

    try {
        const info =
            await transporter.sendMail({
                from:
                    '"Attendance Management System" <attendance.mngt.system@gmail.com>',

                to: to.trim(),

                subject,

                html
            });

        console.log(
            "EMAIL SENT:",
            info.response
        );

        return info;

    } catch (err) {

        console.log(
            "EMAIL ERROR:",
            err.message
        );

        throw err;
    }
}

module.exports = sendEmail;