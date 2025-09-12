const connectDB = require('../config/db');
const Apartment = require('../models/Apartment');

const seed = async () => {
	await connectDB();

	const apartments = [
		{ title: 'Sunny Studio in Downtown', description: 'Cozy studio near shops and cafes.', price: 1200, location: 'Downtown', bedrooms: 0, bathrooms: 1, amenities: ['WiFi', 'Air Conditioning'], images: ['https://picsum.photos/seed/a1/800/600'] },
		{ title: 'Modern 1BR with City View', description: 'Open-concept layout with balcony.', price: 1800, location: 'Midtown', bedrooms: 1, bathrooms: 1, amenities: ['Gym', 'Pool', 'Parking'], images: ['https://picsum.photos/seed/a2/800/600'] },
		{ title: 'Spacious 2BR Family Home', description: 'Quiet neighborhood, great schools.', price: 2400, location: 'Uptown', bedrooms: 2, bathrooms: 2, amenities: ['Backyard', 'Dishwasher'], images: ['https://picsum.photos/seed/a3/800/600'] },
		{ title: 'Loft Apartment with Brick Walls', description: 'Industrial vibe, high ceilings.', price: 2000, location: 'Arts District', bedrooms: 1, bathrooms: 1, amenities: ['Washer/Dryer', 'Pet Friendly'], images: ['https://picsum.photos/seed/a4/800/600'] },
		{ title: 'Luxury 3BR Penthouse', description: 'Panoramic views and private terrace.', price: 5200, location: 'Financial District', bedrooms: 3, bathrooms: 3, amenities: ['Concierge', 'Rooftop', 'Gym'], images: ['https://picsum.photos/seed/a5/800/600'] },
		{ title: 'Charming 1BR Near Park', description: 'Steps from green spaces and trails.', price: 1500, location: 'Greenwood', bedrooms: 1, bathrooms: 1, amenities: ['Storage', 'Bike Room'], images: ['https://picsum.photos/seed/a6/800/600'] },
		{ title: 'Budget Studio', description: 'Affordable and convenient.', price: 900, location: 'Old Town', bedrooms: 0, bathrooms: 1, amenities: ['WiFi'], images: ['https://picsum.photos/seed/a7/800/600'] },
		{ title: 'Waterfront 2BR', description: 'Stunning views over the river.', price: 3000, location: 'Harbor', bedrooms: 2, bathrooms: 2, amenities: ['Pool', 'Gym', 'Doorman'], images: ['https://picsum.photos/seed/a8/800/600'] },
		{ title: 'Suburban 4BR House', description: 'Perfect for families, big yard.', price: 3500, location: 'Suburbia', bedrooms: 4, bathrooms: 3, amenities: ['Garage', 'Fireplace'], images: ['https://picsum.photos/seed/a9/800/600'] },
		{ title: 'Minimalist Micro-Apartment', description: 'Smart space-saving design.', price: 1100, location: 'Innovation Hub', bedrooms: 0, bathrooms: 1, amenities: ['Smart Home'], images: ['https://picsum.photos/seed/a10/800/600'] },
		{ title: 'Co-living Private Room', description: 'Shared amenities, private room.', price: 800, location: 'University District', bedrooms: 1, bathrooms: 1, amenities: ['Co-working Space', 'Events'], images: ['https://picsum.photos/seed/a11/800/600'] }
	];
	
	try {
		await Apartment.deleteMany({});
		await Apartment.insertMany(apartments);
		console.log('Seeded apartments successfully');
	} catch (err) {
		console.error('Seeding failed', err);
	} finally {
		process.exit(0);
	}
};

seed();
