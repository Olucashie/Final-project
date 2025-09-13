const Hostel = require('../models/Hostel');
const { validateHostelDocUrl, validatePhoneNumber, validateWhatsAppNumber, validateTelegramUsername } = require('../services/validationService');

exports.getAll = async (req, res) => {
	try {
		const filter = {};
		if (req.query.mine === 'true') {
			filter.owner = req.user.id;
		}
		const hostels = await Hostel.find(filter).sort({ createdAt: -1 });
		res.json(hostels);
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch hostels' });
	}
};

exports.getById = async (req, res) => {
	try {
		const item = await Hostel.findById(req.params.id).populate('owner', 'name');
		if (!item) return res.status(404).json({ message: 'Not found' });
		res.json(item);
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch hostel' });
	}
};

exports.create = async (req, res) => {
	const cloudinary = require('../config/cloudinary');
	try {
		if (!['agent', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
		let imageUrl = '';
		let documentUrl = '';
		if (req.files?.images?.[0]) {
			const imgRes = await cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
				if (error) throw error;
				imageUrl = result.secure_url;
			});
			await new Promise((resolve, reject) => {
				imgRes.end(req.files.images[0].buffer);
				imgRes.on('finish', resolve);
				imgRes.on('error', reject);
			});
		}
		if (req.files?.document?.[0]) {
			const docRes = await cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
				if (error) throw error;
				documentUrl = result.secure_url;
			});
			await new Promise((resolve, reject) => {
				docRes.end(req.files.document[0].buffer);
				docRes.on('finish', resolve);
				docRes.on('error', reject);
			});
		}
		const payload = {
			...req.body,
			owner: req.user.id,
			images: imageUrl ? [imageUrl] : [],
			document: documentUrl || '',
		};
		const hostel = await Hostel.create(payload);
		const populated = await hostel.populate('owner', 'name');
		res.status(201).json(populated);
	} catch (err) {
		res.status(400).json({ message: 'Failed to create hostel' });
	}
};

exports.update = async (req, res) => {
	try {
		if (!['agent', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
		const item = await Hostel.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('owner', 'name');
		if (!item) return res.status(404).json({ message: 'Not found' });
		res.json(item);
	} catch (err) {
		res.status(400).json({ message: 'Failed to update hostel' });
	}
};

exports.remove = async (req, res) => {
	try {
		if (!['agent','admin'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
		const item = await Hostel.findByIdAndDelete(req.params.id);
		if (!item) return res.status(404).json({ message: 'Not found' });
		res.json({ message: 'Deleted' });
	} catch (err) {
		res.status(400).json({ message: 'Failed to delete hostel' });
	}
};

exports.search = async (req, res) => {
	try {
		const { minPrice, maxPrice, location, bedrooms, amenities, school, area, mine } = req.query;
		const filter = {};
		if (mine === 'true') filter.owner = req.user.id;
		if (minPrice || maxPrice) {
			filter.price = {};
			if (minPrice) filter.price.$gte = Number(minPrice);
			if (maxPrice) filter.price.$lte = Number(maxPrice);
		}
		if (location) filter.location = new RegExp(location, 'i');
		if (school) filter.school = new RegExp(school, 'i');
		if (area) filter.area = new RegExp(area, 'i');
		if (bedrooms) filter.bedrooms = Number(bedrooms);
		if (amenities) {
			const arr = Array.isArray(amenities) ? amenities : String(amenities).split(',').map(s => s.trim());
			filter.amenities = { $all: arr };
		}
		const hostels = await Hostel.find(filter).sort({ createdAt: -1 });
		res.json(hostels);
	} catch (err) {
		res.status(500).json({ message: 'Search failed' });
	}
};
