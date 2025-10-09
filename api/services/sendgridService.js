const sgMail = require('@sendgrid/mail');

const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
} else {
  console.warn('SENDGRID_API_KEY is not set. Emails will not be sent.');
}

/**
 * Send an email using SendGrid
 * @param {string} to - recipient email
 * @param {string} subject - email subject
 * @param {string} html - HTML body
 * @param {string} [fromOverride] - optional sender override, defaults to SENDGRID_FROM
 * @returns {Promise<object>} SendGrid response info
 */
async function sendEmail(to, subject, html, fromOverride) {
  const from = fromOverride || process.env.SENDGRID_FROM;
  if (!from) throw new Error('SENDGRID_FROM is not set');
  if (!apiKey) throw new Error('SENDGRID_API_KEY is not set');

  const msg = { to, from, subject, html };
  const [res] = await sgMail.send(msg);
  return { statusCode: res?.statusCode, headers: res?.headers };
}

module.exports = { sendEmail };

