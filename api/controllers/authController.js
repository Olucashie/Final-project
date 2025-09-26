const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
// Email verification removed
const { validateCacUrl, validateHostelDocUrl, validatePhoneNumber, validateWhatsAppNumber, validateTelegramUsername } = require('../services/validationService');

const signToken = (user) => {
	const secret = process.env.JWT_SECRET || 'dev_secret';
	const expiresIn = process.env.JWT_EXPIRES || '7d';
	return jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn });
};

const crypto = require('crypto');
const nodemailer = require('nodemailer');

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

		// For student/agent, generate verification code
		let emailVerificationCode, emailVerificationExpires, isEmailVerified = false;
		if (desiredRole === 'student' || desiredRole === 'agent') {
			emailVerificationCode = crypto.randomInt(100000, 999999).toString();
			emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
		} else {
			isEmailVerified = true;
		}

		const payload = { 
			name, 
			email, 
			password, 
			role: desiredRole,
			isEmailVerified,
			emailVerificationCode,
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

		// Send verification email for student/agent
		if (desiredRole === 'student' || desiredRole === 'agent') {
			// Use nodemailer directly for now
			const transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: process.env.EMAIL || process.env.EMAIL_USER,
					pass: process.env.PASSWORD || process.env.EMAIL_PASS
				}
			});
					await transporter.sendMail({
					from: `"UniHost" <${process.env.EMAIL || process.env.EMAIL_USER}>`,
						to: email,
						subject: 'Verify your email',
						html: `
		<div style="background: #f4f8fb; padding: 32px 0;">
			<div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px #0001; padding: 32px 24px; font-family: 'Segoe UI', Arial, sans-serif;">
				<div style="text-align: center;">
					<img src="https://img.icons8.com/color/96/000000/verified-account.png" alt="Verify" style="width: 64px; margin-bottom: 16px;" />
					<h2 style="color: #1a237e; margin-bottom: 8px;">Verify Your Email</h2>
					<p style="color: #333; font-size: 16px; margin-bottom: 24px;">
						Hi <b>${name}</b>,<br>
						Thank you for registering with <b>UniHost</b>!<br>
						Please use the code below to verify your email address:
					</p>
					<div style="background: #e3f2fd; color: #1565c0; font-size: 2rem; letter-spacing: 6px; font-weight: bold; border-radius: 8px; padding: 18px 0; margin-bottom: 24px;">
						${emailVerificationCode}
					</div>
					<p style="color: #555; font-size: 15px; margin-bottom: 0;">
						This code will expire in 10 minutes.<br>
						If you did not request this, you can safely ignore this email.
					</p>
				</div>
				<hr style="margin: 32px 0 16px 0; border: none; border-top: 1px solid #eee;">
				<div style="text-align: center; color: #aaa; font-size: 13px;">
					&copy; 2025 UniHost. All rights reserved.
				</div>
			</div>
		</div>
						`
					});
		}

		res.status(201).json({ 
			message: desiredRole === 'admin' ? 'Registration successful.' : 'Registration successful. Please check your email for verification code.',
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

		// Prevent login for student/agent unless verified
		if ((user.role === 'student' || user.role === 'agent') && !user.isEmailVerified) {
			return res.status(401).json({ message: 'Please verify your email before logging in.', needsVerification: true });
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
// Verify email endpoint
exports.verifyEmail = async (req, res) => {
	try {
		const { email, code } = req.body;
		if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });
		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: 'User not found' });
		if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });
		if (user.emailVerificationCode !== code) return res.status(400).json({ message: 'Invalid verification code' });
		if (user.emailVerificationExpires < new Date()) return res.status(400).json({ message: 'Verification code expired' });
		user.isEmailVerified = true;
		user.emailVerificationCode = undefined;
		user.emailVerificationExpires = undefined;
		await user.save();
		res.json({ message: 'Email verified successfully!' });
	} catch (err) {
		console.error('Verify email error:', err);
		res.status(500).json({ message: 'Verification failed' });
	}
};

// Email verification endpoint removed

// Resend verification endpoint removed
