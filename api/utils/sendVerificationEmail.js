const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, // your Gmail from .env
    pass: process.env.PASSWORD  // app password from .env
  }
});

async function sendVerificationEmail(toEmail, token) {
  try {
    let info = await transporter.sendMail({
      from: `"Unihost Verification" <${process.env.EMAIL}>`,
      to: toEmail,
      subject: "Verify Your Account",
      text: `Your verification token is: ${token}`,
      html: `<h3>Your verification token is:</h3> <b>${token}</b>`
    });
    console.log("Email sent: " + info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

module.exports = sendVerificationEmail;
