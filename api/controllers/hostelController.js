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
		} else if (!req.user || req.user.role === 'student') {
			// Students and unauthenticated users only see verified hostels
			filter.isVerified = true;
		}
		const hostels = await Hostel.find(filter).sort({ createdAt: -1 });
		// Backward compatibility: ensure address is present
		const out = hostels.map(h => {
			const o = h.toObject();
			if (!o.address && o.area) o.address = o.area;
			return o;
		});
		res.json(out);
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch hostels' });
	}
};

exports.getById = async (req, res) => {
	try {
		const item = await Hostel.findById(req.params.id).populate('owner', 'name');
		if (!item) return res.status(404).json({ message: 'Not found' });
		// Students can only view verified hostels; agents can view their own; admins can view all
		if (!req.user || req.user.role === 'student') {
			if (!item.isVerified) return res.status(404).json({ message: 'Not found' });
		}
		const o = item.toObject();
		if (!o.address && o.area) o.address = o.area;
		res.json(o);
	} catch (err) {
		res.status(500).json({ message: 'Failed to fetch hostel' });
	}
};

exports.create = async (req, res) => {
	const cloudinary = require('../config/cloudinary');
	try {
		if (!['agent', 'admin'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
		let imageUrls = [];
		let videoUrl = '';
		let documentUrl = '';
			const canUpload = !!process.env.CLOUDINARY_CLOUD_NAME && !!process.env.CLOUDINARY_API_KEY && !!process.env.CLOUDINARY_API_SECRET;
			if (Array.isArray(req.files?.images) && req.files.images.length && canUpload) {
				for (const file of req.files.images) {
					// eslint-disable-next-line no-await-in-loop
					await new Promise((resolve, reject) => {
						const stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
							if (error) return reject(error);
							imageUrls.push(result.secure_url);
							return resolve();
						});
						stream.end(file.buffer);
					});
				}
			} else if (Array.isArray(req.files?.images) && req.files.images.length) {
				// Fallback: save to local uploads folder
				const fs = require('fs');
				const path = require('path');
				const uploadsDir = path.join(__dirname, '..', 'uploads');
				if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
				for (const file of req.files.images) {
					const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
					const filepath = path.join(uploadsDir, filename);
					// eslint-disable-next-line no-await-in-loop
					await fs.promises.writeFile(filepath, file.buffer);
					imageUrls.push(`/uploads/${filename}`);
				}
			}

			// Video upload (optional) with size validation (~100MB)
			if (req.files?.video?.[0] && canUpload) {
				const maxVideoBytes = 100 * 1024 * 1024;
				if (req.files.video[0].size > maxVideoBytes) {
					return res.status(400).json({ message: 'Video too large. Max 100MB.' });
				}
				await new Promise((resolve, reject) => {
					const stream = cloudinary.uploader.upload_stream({ resource_type: 'video' }, (error, result) => {
						if (error) return reject(error);
						videoUrl = result.secure_url;
						return resolve();
					});
					stream.end(req.files.video[0].buffer);
				});
			} else if (req.files?.video?.[0]) {
				const maxVideoBytes = 100 * 1024 * 1024;
				if (req.files.video[0].size > maxVideoBytes) {
					return res.status(400).json({ message: 'Video too large. Max 100MB.' });
				}
				const fs = require('fs');
				const path = require('path');
				const uploadsDir = path.join(__dirname, '..', 'uploads');
				if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
				const filename = `vid_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`;
				const filepath = path.join(uploadsDir, filename);
				await fs.promises.writeFile(filepath, req.files.video[0].buffer);
				videoUrl = `/uploads/${filename}`;
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
			} else {
				// Require a document to be provided
				return res.status(400).json({ message: 'Hostel document is required (PDF, DOC, or DOCX).' });
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
				address: req.body.address,
				bedrooms: req.body.bedrooms !== undefined ? Number(req.body.bedrooms) : undefined,
				bathrooms: req.body.bathrooms !== undefined ? Number(req.body.bathrooms) : undefined,
				amenities,
				owner: req.user.id,
				images: imageUrls,
				videos: videoUrl ? [videoUrl] : [],
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
		const item = await Hostel.findById(req.params.id);
		if (!item) return res.status(404).json({ message: 'Not found' });
		// Agents can only delete their own hostels
		if (req.user.role === 'agent' && String(item.owner) !== String(req.user.id)) {
			return res.status(403).json({ message: 'Forbidden' });
		}
		await Hostel.deleteOne({ _id: item._id });
		res.json({ message: 'Deleted' });
	} catch (err) {
		res.status(400).json({ message: 'Failed to delete hostel' });
	}
};

exports.search = async (req, res) => {
	try {
		const { minPrice, maxPrice, location, bedrooms, amenities, school, address, area, mine } = req.query;
		const filter = {};
		// Always restrict agents to their own hostels
		if (req.user?.role === 'agent') {
			filter.owner = req.user.id;
		} else if (mine === 'true') {
			filter.owner = req.user.id;
		} else if (!req.user || req.user.role === 'student') {
			filter.isVerified = true;
		}
		if (minPrice || maxPrice) {
			filter.price = {};
			if (minPrice) filter.price.$gte = Number(minPrice);
			if (maxPrice) filter.price.$lte = Number(maxPrice);
		}
		if (location) filter.location = new RegExp(location, 'i');
		if (school) filter.school = new RegExp(school, 'i');
		const addr = address || area; // accept legacy 'area'
		if (addr) {
			const regex = new RegExp(addr, 'i');
			// Match either the new 'address' field or legacy 'area' field
			filter.$or = [{ address: regex }, { area: regex }];
		}
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

// Admin-only: verify (approve) a hostel
exports.verify = async (req, res) => {
	try {
		if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
		const item = await Hostel.findByIdAndUpdate(
			req.params.id,
			{ isVerified: true },
			{ new: true }
		).populate('owner', 'name');
		if (!item) return res.status(404).json({ message: 'Not found' });
		return res.json({ message: 'Hostel verified', hostel: item });
	} catch (err) {
		return res.status(400).json({ message: 'Failed to verify hostel' });
	}
};

// Admin-only: unverify (set back to pending)
exports.unverify = async (req, res) => {
	try {
		if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
		const item = await Hostel.findByIdAndUpdate(
			req.params.id,
			{ isVerified: false },
			{ new: true }
		).populate('owner', 'name');
		if (!item) return res.status(404).json({ message: 'Not found' });
		return res.json({ message: 'Hostel set to pending', hostel: item });
	} catch (err) {
		return res.status(400).json({ message: 'Failed to update hostel verification' });
	}
};
