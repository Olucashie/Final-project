const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Send a simple token email to a recipient
const sendToken = async (email, token) => {
  try {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM,
      subject: 'This is your verification token',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <p>Use the token below to verify your email:</p>
          <div style="font-size: 24px; font-weight: 700; letter-spacing: 4px; padding: 12px 16px; background: #f4f6f8; border-radius: 8px; display: inline-block;">
            ${token}
          </div>
        </div>
      `
    };
    await sgMail.send(msg);
    console.log('Verification token email queued:', { to: email });
  } catch (error) {
    console.error('Error sending token email:', error);
    throw error;
  }
};

module.exports = { sendToken };