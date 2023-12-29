const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_ID,
    pass: process.env.SMTP_KEY
  }
});

module.exports = function sendEmail(data) {
  const { firstName, lastName, email, message } = data;
  return transporter.sendMail({
    from: process.env.SMTP_ID,
    to: process.env.SMTP_RECIEVER_ID,
    subject: 'New message from contact form',
    text: `Name: ${firstName}\nLast Name: ${lastName}\nEmail: ${email}\n Message: ${message}`
  });
};
