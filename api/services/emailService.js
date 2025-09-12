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

// Generate verification code
const generateVerificationCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send verification email
const sendVerificationEmail = async (email, verificationCode, userName) => {
  try {
    const transporter = createTransporter();
    
    // If no email service is configured, log to console for development
    if (!transporter) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 EMAIL VERIFICATION CODE');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`Name: ${userName}`);
      console.log(`Verification Code: ${verificationCode}`);
      console.log('='.repeat(60));
      console.log('Note: Email service not configured. Set EMAIL_USER and EMAIL_PASS environment variables to send real emails.');
      console.log('='.repeat(60) + '\n');
      return true; // Return true so registration continues
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@hostelfinder.com',
      to: email,
      subject: 'Verify Your Email - Hostel Finder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Hostel Finder!</h2>
          <p>Hi ${userName},</p>
          <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #000; font-size: 32px; letter-spacing: 5px; margin: 0;">${verificationCode}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <br>
          <p>Best regards,<br>Hostel Finder Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Still log the code for development
    console.log('\n' + '='.repeat(60));
    console.log('📧 EMAIL VERIFICATION CODE (FALLBACK)');
    console.log('='.repeat(60));
    console.log(`To: ${email}`);
    console.log(`Name: ${userName}`);
    console.log(`Verification Code: ${verificationCode}`);
    console.log('='.repeat(60) + '\n');
    return true; // Return true so registration continues
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, userName) => {
  try {
    const transporter = createTransporter();
    
    // If no email service is configured, just log success
    if (!transporter) {
      console.log(`✅ Welcome email would be sent to ${userName} (${email}) - Email service not configured`);
      return true;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@hostelfinder.com',
      to: email,
      subject: 'Welcome to Hostel Finder!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Hostel Finder!</h2>
          <p>Hi ${userName},</p>
          <p>Your email has been successfully verified! You can now enjoy all the features of our platform.</p>
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
    return true; // Don't fail the verification process
  }
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail,
  sendWelcomeEmail
};
