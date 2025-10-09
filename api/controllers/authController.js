const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../services/emailService');
const { sendToken } = require('../utils/sendVerificationEmail');
const { validateCacUrl, validateHostelDocUrl, validatePhoneNumber, validateWhatsAppNumber, validateTelegramUsername } = require('../services/validationService');

const signToken = (user) => {
	const secret = process.env.JWT_SECRET || 'dev_secret';
	const expiresIn = process.env.JWT_EXPIRES || '7d';
	return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn });
};


exports.register = async (req, res) => {
	try {
		const { name, email, password, role, phone, cacUrl, hostelDocUrl, whatsapp, telegram } = req.body;
		if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
		if (role && !['student','agent','admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ message: 'Email already in use' });

		// Admin registration guard: allow only a single admin and only with configured email
		let desiredRole = role || 'student';
		if (desiredRole === 'admin') {
			const allowedAdminEmail = process.env.ADMIN_EMAIL && String(process.env.ADMIN_EMAIL).toLowerCase();
			if (!allowedAdminEmail) return res.status(403).json({ message: 'Admin registration disabled' });
			if (String(email).toLowerCase() !== allowedAdminEmail) return res.status(403).json({ message: 'Not allowed to register as admin' });
			const existingAdmin = await User.findOne({ role: 'admin' });
			if (existingAdmin) return res.status(403).json({ message: 'Admin already exists' });
		}

		// For student/agent, generate verification token (6-digit) and 5-minute expiry
		let emailVerificationToken, emailVerificationExpires, isEmailVerified = false;
		if (desiredRole === 'student' || desiredRole === 'agent') {
			emailVerificationToken = String(crypto.randomInt(100000, 999999)); // 6-digit numeric token
			emailVerificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
		} else {
			isEmailVerified = true;
		}

		const payload = { 
			name, 
			email, 
			password, 
			role: desiredRole,
			isEmailVerified,
			emailVerificationToken,
			emailVerificationExpires
		};

		if (payload.role === 'agent') {
			if (!phone) return res.status(400).json({ message: 'Agent requires phone number' });

			// Validate phone number
			const phoneValidation = validatePhoneNumber(phone);
			if (!phoneValidation.valid) return res.status(400).json({ message: phoneValidation.error });

			// Validate optional contact fields
			if (whatsapp) {
				const whatsappValidation = validateWhatsAppNumber(whatsapp);
				if (!whatsappValidation.valid) return res.status(400).json({ message: whatsappValidation.error });
			}

			if (telegram) {
				const telegramValidation = validateTelegramUsername(telegram);
				if (!telegramValidation.valid) return res.status(400).json({ message: telegramValidation.error });
			}

			payload.phone = phone; 
			payload.cacUrl = ''; // No longer required
			payload.hostelDocUrl = ''; // No longer required
			if (whatsapp) payload.whatsapp = whatsapp;
			if (telegram) payload.telegram = telegram;
		}

		const user = await User.create(payload);

		// Send only token email based on role (no link)
		if (desiredRole === 'student' || desiredRole === 'agent') {
			try {
				await sendToken(user.email, emailVerificationToken);
			} catch (error) {
				console.error('Error sending verification token:', error);
			}
		} else {
			try {
				await sendWelcomeEmail(user.email, user.name);
			} catch (error) {
				console.error('Error sending welcome email:', error);
			}
		}

		// Registration success response
		return res.status(201).json({
			message: desiredRole === 'admin' ? 'Registration successful.' : 'Registration successful. Please check your email for the verification token.',
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				phone: user.phone,
				cacUrl: user.cacUrl,
				hostelDocUrl: user.hostelDocUrl,
				whatsapp: user.whatsapp,
				telegram: user.telegram,
				isEmailVerified: user.isEmailVerified
			}
		});
	} catch (err) {
		console.error('Registration error:', err);
		return res.status(500).json({ message: 'Registration failed' });
	}
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const matched = await user.comparePassword(password);
    if (!matched) return res.status(401).json({ message: 'Invalid credentials' });

    // Prevent login for student/agent unless verified
    if ((user.role === 'student' || user.role === 'agent') && !user.isEmailVerified) {
      return res.status(401).json({ message: 'Please verify your email before logging in.', needsVerification: true });
    }

    const token = signToken(user);
    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        cacUrl: user.cacUrl,
        hostelDocUrl: user.hostelDocUrl,
        whatsapp: user.whatsapp,
        telegram: user.telegram,
        isEmailVerified: user.isEmailVerified
      },
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed' });
  }
};

// Verify email endpoint supports both GET /verify-email/:token and POST /verify-email { email, token }
exports.verifyEmail = async (req, res) => {
  try {
    let token = req.params?.token;
    let email = undefined;

    // If POST body is provided, use email + token from body
    if (!token && req.body && req.method === 'POST') {
      token = req.body.token;
      email = req.body.email;
      if (!email || !token) return res.status(400).json({ message: 'Email and token are required' });
    }

    if (!token) return res.status(400).json({ message: 'Verification token is required' });

    const query = email
      ? { email, emailVerificationToken: token, emailVerificationExpires: { $gt: Date.now() } }
      : { emailVerificationToken: token, emailVerificationExpires: { $gt: Date.now() } };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

		user.isEmailVerified = true;
		user.emailVerificationToken = undefined;
		user.emailVerificationExpires = undefined;
		await user.save();

		// Send a welcome email on successful verification (non-fatal)
		try {
			await sendWelcomeEmail(user.email, user.name);
		} catch (e) {
			console.error('Error sending welcome email after verification:', e);
		}

    // If this was GET (link), redirect; if POST (token), return JSON
    if (req.method === 'GET') {
      return res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);
    }
    return res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify email error:', err);
    return res.status(500).json({ success: false, message: 'Email verification failed. Please try again.' });
  }
};

// Resend verification token
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

	// Generate new verification token (6-digit) and 5-minute expiry
	const emailVerificationToken = String(crypto.randomInt(100000, 999999));
	user.emailVerificationToken = emailVerificationToken;
	user.emailVerificationExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    // Send token only
    await sendToken(user.email, emailVerificationToken);
    return res.json({ message: 'Verification token resent successfully' });
  } catch (err) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ success: false, message: 'Failed to resend verification token' });
  }
};
