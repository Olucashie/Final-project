const User = require('../models/User');

exports.addFavorite = async (req, res) => {
	try {
		const userId = req.user.id;
		const { hostelId } = req.body;
		if (!hostelId) return res.status(400).json({ message: 'hostelId required' });
		const user = await User.findByIdAndUpdate(
			userId,
			{ $addToSet: { savedListings: hostelId } },
			{ new: true }
		).populate('savedListings');
		res.json(user.savedListings);
	} catch (err) {
		res.status(400).json({ message: 'Failed to add favorite' });
	}
};

exports.removeFavorite = async (req, res) => {
	try {
		const userId = req.user.id;
		const { hostelId } = req.body;
		if (!hostelId) return res.status(400).json({ message: 'hostelId required' });
		const user = await User.findByIdAndUpdate(
			userId,
			{ $pull: { savedListings: hostelId } },
			{ new: true }
		).populate('savedListings');
		res.json(user.savedListings);
	} catch (err) {
		res.status(400).json({ message: 'Failed to remove favorite' });
	}
};

exports.getFavorites = async (req, res) => {
	try {
		const user = await User.findById(req.user.id).populate('savedListings');
		if (!user) return res.status(404).json({ message: 'User not found' });
		res.json(user.savedListings);
	} catch (err) {
		res.status(400).json({ message: 'Failed to fetch favorites' });
	}
};
