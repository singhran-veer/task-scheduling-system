const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASSWORD) {
        throw new Error("MAIL_HOST, MAIL_USER, and MAIL_PASSWORD must be set to send emails.");
    }

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT) || 587,
        secure: process.env.MAIL_SECURE === "true",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    return transporter.sendMail({
        from: process.env.MAIL_FROM || "Task Scheduling System",
        to: email,
        subject: title,
        html: body,
    });
};

module.exports = mailSender;
