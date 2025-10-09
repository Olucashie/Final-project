#!/usr/bin/env node
// Simple CLI to send a verification token email using your sendToken util.
// Usage: node scripts/send_test_token.js user@example.com 123456

const { sendToken } = require('../utils/sendVerificationEmail');

const [,, email, token] = process.argv;
if (!email || !token) {
  console.error('Usage: node scripts/send_test_token.js <email> <token>');
  process.exit(1);
}

(async () => {
  const res = await sendToken(email, token);
  console.log('sendToken result:', res);
})();
