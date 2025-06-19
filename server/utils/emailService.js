const nodemailer = require('nodemailer');

/**
 * Sends an inactivity reminder email to the student.
 */
async function sendInactivityEmail(email, name) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Keep Going with Codeforces!',
    text: `Hi ${name},\n\nWe noticed you haven't solved any problems on Codeforces in the past week. Keep practicing to improve your skills!\n\nBest,\nYour Progress Tracker`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Inactivity email sent to ${email}`);
  } catch (err) {
    console.error('Error sending email:', err.message);
  }
}

module.exports = { sendInactivityEmail };
