const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendWelcomeEmail } = require('../services/emailService');
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

		// For student/agent, generate verification token
		let emailVerificationToken, emailVerificationExpires, isEmailVerified = false;
		if (desiredRole === 'student' || desiredRole === 'agent') {
			emailVerificationToken = crypto.randomBytes(32).toString('hex');
			emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
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

		// Send verification or welcome email based on role
		if (desiredRole === 'student' || desiredRole === 'agent') {
			try {
				await sendVerificationEmail(user.email, emailVerificationToken, user.name);
				// Also send a simple token email via SendGrid as requested
				await sendToken(user.email, emailVerificationToken);
			} catch (error) {
				console.error('Error sending verification email:', error);
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
			message: desiredRole === 'admin' ? 'Registration successful.' : 'Registration successful. Please check your email for verification link.',
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

// Verify email endpoint using token from URL
exports.verifyEmail = async (req, res) => {
	try {
		const { token } = req.params;
		if (!token) return res.status(400).json({ message: 'Verification token is required' });
		
		const user = await User.findOne({
			emailVerificationToken: token,
			emailVerificationExpires: { $gt: Date.now() }
		});

		if (!user) {
			return res.status(400).json({ 
				success: false, 
				message: 'Invalid or expired verification token' 
			});
		}

		if (user.isEmailVerified) {
			return res.status(400).json({ 
				success: false, 
				message: 'Email already verified' 
			});
		}

		// Mark user as verified
		user.isEmailVerified = true;
		user.emailVerificationToken = undefined;
		user.emailVerificationExpires = undefined;
		await user.save();

		// Send welcome email after successful verification
		try {
			await sendWelcomeEmail(user.email, user.name);
		} catch (error) {
			console.error('Error sending welcome email:', error);
		}

		// Redirect to login page with success message
		res.redirect(`${process.env.CLIENT_URL}/login?verified=true`);

	} catch (err) {
		console.error('Verify email error:', err);
		res.status(500).json({ 
			success: false, 
			message: 'Email verification failed. Please try again.' 
		});
	}
};

// Resend verification email
exports.resendVerification = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ message: 'Email is required' });

		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: 'User not found' });
		if (user.isEmailVerified) {
			return res.status(400).json({ message: 'Email is already verified' });
		}

		// Generate new verification token
		const emailVerificationToken = crypto.randomBytes(32).toString('hex');
		user.emailVerificationToken = emailVerificationToken;
		user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
		await user.save();

		// Send verification email
		try {
			await sendVerificationEmail(user.email, emailVerificationToken, user.name);
			await sendToken(user.email, emailVerificationToken);
			res.json({ message: 'Verification email resent successfully' });
		} catch (error) {
			console.error('Error sending verification email:', error);
			throw new Error('Failed to send verification email');
		}

	} catch (err) {
		console.error('Resend verification error:', err);
		res.status(500).json({ 
			success: false, 
			message: 'Failed to resend verification email' 
		});
	}
};

