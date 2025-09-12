const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateVerificationCode, sendWelcomeEmail } = require('../services/emailService');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
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
		
		// Generate verification code
		const verificationCode = generateVerificationCode();
		const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
		
		const payload = { 
			name, 
			email, 
			password, 
			role: role || 'student',
			emailVerificationCode: verificationCode,
			emailVerificationExpires: verificationExpires
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
		
	// Send verification email
	await sendVerificationEmail(email, verificationCode);
		
		res.status(201).json({ 
			message: 'Registration successful. Please check your email for verification code.',
			user: { 
				id: user._id, 
				name: user.name, 
				email: user.email, 
				role: user.role, 
				phone: user.phone, 
				cacUrl: user.cacUrl, 
				hostelDocUrl: user.hostelDocUrl,
				isEmailVerified: user.isEmailVerified
			}
		});
	} catch (err) {
		console.error('Registration error:', err);
		res.status(500).json({ message: 'Registration failed' });
	}
};

exports.login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ message: 'Invalid credentials' });
		const matched = await user.comparePassword(password);
		if (!matched) return res.status(401).json({ message: 'Invalid credentials' });
		
		// Check if email is verified
		if (!user.isEmailVerified) {
			return res.status(401).json({ 
				message: 'Please verify your email before logging in. Check your email for verification code.',
				needsVerification: true 
			});
		}
		
		const token = signToken(user);
		res.json({ 
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
		res.status(500).json({ message: 'Login failed' });
	}
};

// Verify email with code
exports.verifyEmail = async (req, res) => {
	try {
		const { email, verificationCode } = req.body;
		if (!email || !verificationCode) return res.status(400).json({ message: 'Email and verification code are required' });
		
		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: 'User not found' });
		
		// Check if already verified
		if (user.isEmailVerified) {
			return res.status(400).json({ message: 'Email already verified' });
		}
		
		// Check verification code and expiration
		if (user.emailVerificationCode !== verificationCode) {
			return res.status(400).json({ message: 'Invalid verification code' });
		}
		
		if (user.emailVerificationExpires < new Date()) {
			return res.status(400).json({ message: 'Verification code has expired' });
		}
		
		// Update user verification status
		user.isEmailVerified = true;
		user.emailVerificationCode = undefined;
		user.emailVerificationExpires = undefined;
		await user.save();
		
		// Send welcome email
		await sendWelcomeEmail(email, user.name);
		
		const token = signToken(user);
		res.json({ 
			message: 'Email verified successfully!',
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
		console.error('Email verification error:', err);
		res.status(500).json({ message: 'Email verification failed' });
	}
};

// Resend verification code
exports.resendVerificationCode = async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ message: 'Email is required' });
		
		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: 'User not found' });
		
		if (user.isEmailVerified) {
			return res.status(400).json({ message: 'Email already verified' });
		}
		
		// Generate new verification code
		const verificationCode = generateVerificationCode();
		const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
		
		user.emailVerificationCode = verificationCode;
		user.emailVerificationExpires = verificationExpires;
		await user.save();
		
		// Send verification email
		const emailSent = await sendVerificationEmail(email, verificationCode, user.name);
		if (!emailSent) {
			return res.status(500).json({ message: 'Failed to send verification email' });
		}
		
		res.json({ message: 'Verification code sent successfully' });
	} catch (err) {
		console.error('Resend verification error:', err);
		res.status(500).json({ message: 'Failed to resend verification code' });
	}
};
