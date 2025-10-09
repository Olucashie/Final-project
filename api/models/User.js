const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true },
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	password: { type: String, required: true },
	role: { type: String, enum: ['student', 'agent', 'admin'], default: 'student' },
	phone: { type: String, trim: true },
	cacUrl: { type: String, trim: true },
	hostelDocUrl: { type: String, trim: true },
	// Contact information
	whatsapp: { type: String, trim: true },
	telegram: { type: String, trim: true },
// Email verification fields
isEmailVerified: { type: Boolean, default: false },
emailVerificationToken: { type: String, trim: true },
emailVerificationExpires: { type: Date },
	isCacVerified: { type: Boolean, default: false },
	isHostelDocVerified: { type: Boolean, default: false },
	savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
	if (!this.isModified('password')) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

userSchema.methods.comparePassword = async function(candidate) {
	return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
