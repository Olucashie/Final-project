const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
	const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/apartments_db';
	try {
		await mongoose.connect(mongoUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		console.log('MongoDB connected');
	} catch (err) {
		console.error('MongoDB connection error', err);
		process.exit(1);
	}
};

module.exports = connectDB;
