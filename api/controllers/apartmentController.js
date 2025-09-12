const Apartment = require('../models/Apartment');

exports.getAll = async (req, res) => {
	try {
		const apartments = await Apartment.find().sort({ createdAt: -1 });
		res.json(apartments);
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch apartments' });
	}
};

exports.getById = async (req, res) => {
	try {
		const apt = await Apartment.findById(req.params.id);
		if (!apt) return res.status(404).json({ message: 'Not found' });
		res.json(apt);
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch apartment' });
	}
};

exports.create = async (req, res) => {
	try {
		const apt = await Apartment.create(req.body);
		res.status(201).json(apt);
	} catch (err) {
		res.status(400).json({ message: 'Failed to create apartment' });
	}
};

exports.update = async (req, res) => {
	try {
		const apt = await Apartment.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!apt) return res.status(404).json({ message: 'Not found' });
		res.json(apt);
	} catch (err) {
		res.status(400).json({ message: 'Failed to update apartment' });
	}
};

exports.remove = async (req, res) => {
	try {
		const apt = await Apartment.findByIdAndDelete(req.params.id);
		if (!apt) return res.status(404).json({ message: 'Not found' });
		res.json({ message: 'Deleted' });
	} catch (err) {
		res.status(400).json({ message: 'Failed to delete apartment' });
	}
};

exports.search = async (req, res) => {
	try {
		const { minPrice, maxPrice, location, bedrooms, amenities } = req.query;
		const filter = {};
		if (minPrice || maxPrice) {
			filter.price = {};
			if (minPrice) filter.price.$gte = Number(minPrice);
			if (maxPrice) filter.price.$lte = Number(maxPrice);
		}
		if (location) filter.location = new RegExp(location, 'i');
		if (bedrooms) filter.bedrooms = Number(bedrooms);
		if (amenities) {
			const arr = Array.isArray(amenities) ? amenities : String(amenities).split(',').map(s => s.trim());
			filter.amenities = { $all: arr };
		}
		const apartments = await Apartment.find(filter).sort({ createdAt: -1 });
		res.json(apartments);
	} catch (err) {
		res.status(500).json({ message: 'Search failed' });
	}
};
