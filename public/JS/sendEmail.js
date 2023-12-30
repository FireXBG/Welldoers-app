const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_ID,
    pass: process.env.SMTP_KEY,
  },
});

module.exports = function sendEmail(data) {
  const { firstName, lastName, email, message } = data;
  return transporter.sendMail({
    from: process.env.SMTP_ID,
    to: process.env.SMTP_RECIEVER_ID,
    subject: "Welldoers - Ново съобщение от контактна форма",
    text: `Име: ${firstName}\nФамилия: ${lastName}\nEmail: ${email}\n Съобщение: ${message}\n\n\n This message was sent from the contact form on welldoers.bg - please do not reply directly to this email.\n\n powered by Carica Web Development`,
  });
};
