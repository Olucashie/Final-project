const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true },
	description: { type: String, required: true },
	price: { type: Number, required: true, min: 0 },
	location: { type: String, required: false },
	school: { type: String, required: true, trim: true },
	address: { type: String, required: true, trim: true },
	bedrooms: { type: Number, required: true, min: 0 },
	bathrooms: { type: Number, required: true, min: 0 },
	amenities: [{ type: String }],
	images: [{ type: String }],
	videos: [{ type: String }],
	document: { type: String, trim: true },
	owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	// Verification status
	isVerified: { type: Boolean, default: false },
	verificationDocuments: [{ type: String }],
	// Contact information for this specific hostel
	contactPhone: { type: String, trim: true },
	contactWhatsapp: { type: String, trim: true },
	contactTelegram: { type: String, trim: true },
	createdAt: { type: Date, default: Date.now }
	});

module.exports = mongoose.model('Hostel', hostelSchema);
