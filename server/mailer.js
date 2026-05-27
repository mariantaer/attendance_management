const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "ptc.attendance.system@gmail.com",
        pass: "eaiy vjpi zxmx sgcc"
    }
});

function sendEmail(mailOptions) {
    return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;