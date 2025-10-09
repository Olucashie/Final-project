let sgMail;
try {
  // lazy-require to avoid hard crash if package missing in some environments
  sgMail = require('@sendgrid/mail');
} catch (e) {
  sgMail = null;
}

// Send a simple token email to a recipient
const sendToken = async (email, token) => {
  const key = process.env.SENDGRID_API_KEY || process.env.SENDGRID_API;
  const from = process.env.SENDGRID_FROM || process.env.EMAIL_USER;

  if (!key) {
    console.warn('SENDGRID_API_KEY not configured; skipping email send for', email);
    return { ok: false, reason: 'no_sendgrid' };
  }

  if (!sgMail) {
    console.warn('@sendgrid/mail module not installed; cannot send verification email to', email);
    return { ok: false, reason: 'sendgrid_not_installed' };
  }

  try {
    sgMail.setApiKey(key);
    const msg = {
      to: email,
      from,
      subject: 'Your UniHost verification token',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <p>Use the token below to verify your email (expires in 5 minutes):</p>
          <div style="font-size: 24px; font-weight: 700; letter-spacing: 4px; padding: 12px 16px; background: #f4f6f8; border-radius: 8px; display: inline-block;">
            ${token}
          </div>
        </div>
      `
    };
    const res = await sgMail.send(msg);
    console.log('Verification token email queued:', { to: email });
    return { ok: true, info: res };
  } catch (error) {
    console.error('Error sending token email via SendGrid:', error);
    return { ok: false, reason: 'send_error', error };
  }
};

module.exports = { sendToken };