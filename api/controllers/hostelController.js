const Hostel = require('../models/Hostel');
const { validateHostelDocUrl, validatePhoneNumber, validateWhatsAppNumber, validateTelegramUsername } = require('../services/validationService');

exports.getAll = async (req, res) => {
	try {
		const filter = {};
		// Always restrict agents to their own hostels
		if (req.user?.role === 'agent') {
			filter.owner = req.user.id;
		} else if (req.query.mine === 'true') {
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
			const canUpload = !!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET;
			if (req.files?.images?.[0] && canUpload) {
				await new Promise((resolve, reject) => {
					const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
						if (error) return reject(error);
						imageUrl = result.secure_url;
						return resolve();
					});
					stream.end(req.files.images[0].buffer);
				});
			} else if (req.files?.images?.[0]) {
				// Fallback: save to local uploads folder
				const fs = require('fs');
				const path = require('path');
				const uploadsDir = path.join(__dirname, '..', 'uploads');
				if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
				const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
				const filepath = path.join(uploadsDir, filename);
				await fs.promises.writeFile(filepath, req.files.images[0].buffer);
				imageUrl = `/uploads/${filename}`;
			}
			if (req.files?.document?.[0] && canUpload) {
				await new Promise((resolve, reject) => {
					const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
						if (error) return reject(error);
						documentUrl = result.secure_url;
						return resolve();
					});
					stream.end(req.files.document[0].buffer);
				});
			} else if (req.files?.document?.[0]) {
				const fs = require('fs');
				const path = require('path');
				const uploadsDir = path.join(__dirname, '..', 'uploads');
				if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
				const filename = `doc_${Date.now()}_${Math.random().toString(36).slice(2)}.bin`;
				const filepath = path.join(uploadsDir, filename);
				await fs.promises.writeFile(filepath, req.files.document[0].buffer);
				documentUrl = `/uploads/${filename}`;
			}
			// Normalize incoming body types and values
			const amenitiesInput = req.body.amenities;
			let amenities = [];
			if (Array.isArray(amenitiesInput)) {
				amenities = amenitiesInput.map(s => String(s).trim()).filter(Boolean);
			} else if (typeof amenitiesInput === 'string') {
				amenities = amenitiesInput.split(',').map(s => s.trim()).filter(Boolean);
			}
			const payload = {
				title: req.body.title,
				description: req.body.description,
				price: req.body.price !== undefined ? Number(req.body.price) : undefined,
				location: req.body.location ? String(req.body.location) : undefined,
				school: req.body.school,
				area: req.body.area,
				bedrooms: req.body.bedrooms !== undefined ? Number(req.body.bedrooms) : undefined,
				bathrooms: req.body.bathrooms !== undefined ? Number(req.body.bathrooms) : undefined,
				amenities,
				owner: req.user.id,
				images: imageUrl ? [imageUrl] : [],
				document: documentUrl || '',
			};
		const hostel = await Hostel.create(payload);
		const populated = await hostel.populate('owner', 'name');
		res.status(201).json(populated);
	} catch (err) {
			res.status(400).json({ message: 'Failed to create hostel', error: err?.message });
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
		// Always restrict agents to their own hostels
		if (req.user?.role === 'agent') {
			filter.owner = req.user.id;
		} else if (mine === 'true') {
			filter.owner = req.user.id;
		}
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
