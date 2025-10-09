const { sendEmail } = require('./sendgridService');

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

const sendVerificationEmail = async (email, token, userName) => {
  const apiBase = process.env.API_URL || process.env.SERVER_URL || '';
  const verificationUrl = `${apiBase}/api/auth/verify-email/${token}`;
  const subject = 'Verify Your Email - UniHost';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for registering with UniHost! Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; font-weight: bold;">
          Verify Email
        </a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all;">${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <br>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>Best regards,<br>UniHost Team</p>
    </div>
  `;

  try {
    const res = await sendEmail(email, subject, html, process.env.SENDGRID_FROM);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail
};
