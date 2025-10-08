const { sendEmail } = require('./sendgridService');

// sendWelcomeEmail: uses sendGrid under the hood via sendgridService
// Returns true on success, or logs and returns an object when SendGrid is not configured
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
    console.log(`✅ Welcome email queued for ${email}`, res?.info || res);
    return true;
  } catch (err) {
    console.error('Error sending welcome email via SendGrid:', err);
    return true; // Do not block user registration if email failed
  }
};

module.exports = {
  sendWelcomeEmail,
};
