const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true },
	description: { type: String, required: true },
	price: { type: Number, required: true, min: 0 },
	location: { type: String, required: true },
	bedrooms: { type: Number, required: true, min: 0 },
	bathrooms: { type: Number, required: true, min: 0 },
	amenities: [{ type: String }],
	images: [{ type: String }],
	createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Apartment', apartmentSchema);
