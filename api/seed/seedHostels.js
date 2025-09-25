const mongoose = require('mongoose');
const Hostel = require('../models/Hostel');
const User = require('../models/User');

const sampleHostels = [
  {
    title: "Cozy Student Hostel Near UNILAG",
    description: "A comfortable and affordable hostel located just 5 minutes walk from the University of Lagos. Features modern amenities and a safe environment for students.",
    price: 150000,
    location: "Akoka, Lagos",
    school: "University of Lagos",
    address: "Akoka",
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["WiFi", "24/7 Security", "Generator", "Water Supply", "Kitchen", "Study Room"],
    images: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop"
    ],
    videos: [
      "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4"
    ],
    contactPhone: "+234 801 234 5678",
    contactWhatsapp: "+234 801 234 5678",
    contactTelegram: "@hostelowner1"
  },
  {
    title: "Modern Hostel at OAU Campus",
    description: "Brand new hostel facility with state-of-the-art amenities. Perfect for students who value comfort and convenience.",
    price: 180000,
    location: "Ile-Ife, Osun State",
    school: "Obafemi Awolowo University",
    address: "Campus Area",
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["Air Conditioning", "WiFi", "24/7 Security", "Laundry", "Parking", "Gym"],
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"
    ],
    videos: [
      "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_2mb.mp4"
    ],
    contactPhone: "+234 802 345 6789",
    contactWhatsapp: "+234 802 345 6789"
  },
  {
    title: "Affordable Hostel Near UI",
    description: "Budget-friendly accommodation for students. Clean, safe, and well-maintained with all basic amenities.",
    price: 120000,
    location: "Bodija, Ibadan",
    school: "University of Ibadan",
    address: "Bodija",
    bedrooms: 4,
    bathrooms: 2,
    amenities: ["WiFi", "Security", "Water Supply", "Kitchen", "Common Room"],
    images: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop"
    ],
    videos: [],
    contactPhone: "+234 803 456 7890",
    contactTelegram: "@uihostel"
  }
];

async function seedHostels() {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/apartments_db');
    }

    // Find an existing agent user or create one
    let agentUser = await User.findOne({ role: 'agent' });
    
    if (!agentUser) {
      // Create a sample agent user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      agentUser = await User.create({
        name: 'Sample Agent',
        email: 'agent@example.com',
        password: hashedPassword,
        role: 'agent'
      });
      
      console.log('Created sample agent user');
    }

    // Clear existing hostels
    await Hostel.deleteMany({});
    console.log('Cleared existing hostels');

    // Add owner to each hostel and create them
    const hostelsWithOwner = sampleHostels.map(hostel => ({
      ...hostel,
      owner: agentUser._id
    }));

    const createdHostels = await Hostel.insertMany(hostelsWithOwner);
    console.log(`Created ${createdHostels.length} sample hostels`);

    return createdHostels;
  } catch (error) {
    console.error('Error seeding hostels:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedHostels()
    .then(() => {
      console.log('Hostel seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Hostel seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedHostels, sampleHostels };