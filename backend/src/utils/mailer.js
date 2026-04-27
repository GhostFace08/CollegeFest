const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendRegistrationMail = async (to, studentName, eventTitle, registrationId, qrCode) => {
  await transporter.sendMail({
    from: `"CollegeFest" <${process.env.MAIL_USER}>`,
    to,
    subject: `Registration Confirmed — ${eventTitle}`,
    html: `
      <h2>Hi ${studentName},</h2>
      <p>Your registration for <strong>${eventTitle}</strong> is confirmed.</p>
      <p>Registration ID: <strong>${registrationId}</strong></p>
      <p>Show this QR code at the venue:</p>
      <img src="${qrCode}" alt="QR Ticket" />
      <p>See you there!</p>
    `,
  });
};

const sendCapacityAlertMail = async (adminEmail, eventTitle, filled, capacity) => {
  await transporter.sendMail({
    from: `"CollegeFest" <${process.env.MAIL_USER}>`,
    to: adminEmail,
    subject: `Capacity Alert — ${eventTitle}`,
    html: `
      <p>Event <strong>${eventTitle}</strong> has reached ${filled}/${capacity} registrations (80%+ capacity).</p>
    `,
  });
};

module.exports = { sendRegistrationMail, sendCapacityAlertMail };