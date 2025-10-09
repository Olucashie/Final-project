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

		// Prepare payload. By default users are not verified; admin registration remains immediate verified.
		const payload = { 
			name, 
			email, 
			password, 
			role: desiredRole,
			isEmailVerified: desiredRole === 'admin' ? true : false
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

		// If not admin, generate a verification token and send it via email
		if (user.role !== 'admin') {
			try {
				// create a random token, store its hash and expiry
				const verificationToken = crypto.randomBytes(20).toString('hex');
				const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
				const expires = Date.now() + (5 * 60 * 1000); // 5 minutes

				user.emailVerificationToken = tokenHash;
				user.emailVerificationExpires = new Date(expires);
				await user.save();

				// send plain token to user's email (non-fatal)
				try {
					await sendToken(user.email, verificationToken);
				} catch (err) {
					console.error('Error sending verification token:', err);
				}
			} catch (err) {
				console.error('Error generating verification token:', err);
			}
		}

		// Send welcome email (non-fatal) if configured
		try {
			await sendWelcomeEmail(user.email, user.name);
		} catch (error) {
			console.error('Error sending welcome email:', error);
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

// Email verification removed - functions intentionally omitted
// Verify email using token
exports.verifyEmail = async (req, res) => {
	try {
		const { token, email } = req.body;
		if (!token || !email) return res.status(400).json({ message: 'Missing token or email' });

		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ message: 'Invalid email or token' });

		if (user.isEmailVerified) return res.status(200).json({ message: 'Email already verified' });

		if (!user.emailVerificationToken || !user.emailVerificationExpires) return res.status(400).json({ message: 'No verification token found; please request a new one' });

		if (user.emailVerificationExpires.getTime() < Date.now()) return res.status(400).json({ message: 'Verification token expired' });

		const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
		if (tokenHash !== user.emailVerificationToken) return res.status(400).json({ message: 'Invalid verification token' });

		user.isEmailVerified = true;
		user.emailVerificationToken = undefined;
		user.emailVerificationExpires = undefined;
		await user.save();

		return res.json({ message: 'Email verified successfully' });
	} catch (err) {
		console.error('verifyEmail error:', err);
		return res.status(500).json({ message: 'Verification failed' });
	}
};

// Resend verification token
exports.resendVerification = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ message: 'Missing email' });

		const user = await User.findOne({ email });
		if (!user) return res.status(400).json({ message: 'User not found' });

		if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

		// generate new token
		const verificationToken = crypto.randomBytes(20).toString('hex');
		const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
		const expires = Date.now() + (5 * 60 * 1000); // 5 minutes

		user.emailVerificationToken = tokenHash;
		user.emailVerificationExpires = new Date(expires);
		await user.save();

		try {
			await sendToken(user.email, verificationToken);
		} catch (err) {
			console.error('Error sending verification token:', err);
		}

		return res.json({ message: 'Verification token sent' });
	} catch (err) {
		console.error('resendVerification error:', err);
		return res.status(500).json({ message: 'Could not resend verification' });
	}
};
