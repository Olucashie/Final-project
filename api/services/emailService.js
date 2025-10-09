const { sendEmail } = require('./sendgridService');
const { sendToken } = require('../utils/sendVerificationEmail');

const sendWelcomeEmail = async (email, userName) => {
  const subject = 'Welcome to UniHost!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to UniHost!</h2>
      <p>Hi ${userName},</p>
      <p>Your email has been successfully registered! You can now enjoy all the features of our platform.</p>
      <p>Start exploring hostels or list your own property today!</p>
      <br>
      <p>Best regards,<br>UniHost Team</p>
    </div>
  `;
  try {
    const res = await sendEmail(email, subject, html, process.env.SENDGRID_FROM);
    console.log(`Welcome email queued for ${email}`, res?.info || res);
    return true;
  } catch (err) {
    console.error('Error sending welcome email via SendGrid:', err);
    return true; // Do not block user registration if email failed
  }
};

const sendVerificationEmail = async (email, token, userName) => {
  // Prefer using the token sender util so verification emails contain a 6-digit token
  try {
    const res = await sendToken(email, token);
    if (!res || !res.ok) {
      console.warn('sendToken returned non-ok result for', email, res);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error sending verification token via sendToken util:', err);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail
};
