const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter with fallback options
const createTransporter = () => {
  // Try Gmail first if credentials are provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  // Fallback to Ethereal (for testing) or console logging
  if (process.env.NODE_ENV === 'development') {
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'verysecret'
      }
    });
  }
  
  // For production without email config, return null
  return null;
};


// Only keep welcome email logic
const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log(`✅ Welcome email would be sent to ${userName} (${email}) - Email service not configured`);
      return true;
    }
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@unihost.com',
      to: email,
      subject: 'Welcome to Hostel Finder!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Hostel Finder!</h2>
          <p>Hi ${userName},</p>
          <p>Your email has been successfully registered! You can now enjoy all the features of our platform.</p>
          <p>Start exploring hostels or list your own property today!</p>
          <br>
          <p>Best regards,<br>Hostel Finder Team</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return true; // Don't fail the registration process
  }
};

module.exports = {
  sendWelcomeEmail
};
