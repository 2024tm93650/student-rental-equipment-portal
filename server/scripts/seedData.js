const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Equipment = require('../models/Equipment');
const Request = require('../models/Request');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/school-equipment-portal';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@school.edu',
    password: 'password123',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    department: 'IT Administration'
  },
  {
    username: 'staff',
    email: 'staff@school.edu',
    password: 'password123',
    role: 'staff',
    firstName: 'Staff',
    lastName: 'Member',
    department: 'Equipment Management'
  },
  {
    username: 'student',
    email: 'student@school.edu',
    password: 'password123',
    role: 'student',
    firstName: 'Student',
    lastName: 'User',
    studentId: 'STU001',
    department: 'Computer Science'
  },
  {
    username: 'john_doe',
    email: 'john.doe@school.edu',
    password: 'password123',
    role: 'student',
    firstName: 'John',
    lastName: 'Doe',
    studentId: 'STU002',
    department: 'Engineering'
  },
  {
    username: 'jane_smith',
    email: 'jane.smith@school.edu',
    password: 'password123',
    role: 'student',
    firstName: 'Jane',
    lastName: 'Smith',
    studentId: 'STU003',
    department: 'Biology'
  }
];

const sampleEquipment = [
  {
    name: 'MacBook Pro 16"',
    description: 'High-performance laptop for development and design work',
    category: 'Computing',
    condition: 'Excellent',
    totalQuantity: 10,
    availableQuantity: 8,
    brand: 'Apple',
    model: 'MacBook Pro 16-inch 2023',
    location: 'IT Lab - Room 101',
    notes: 'Includes charger and carrying case'
  },
  {
    name: 'Digital Camera',
    description: 'Professional DSLR camera for photography projects',
    category: 'Audio/Visual',
    condition: 'Good',
    totalQuantity: 5,
    availableQuantity: 4,
    brand: 'Canon',
    model: 'EOS 90D',
    location: 'Media Lab - Room 205',
    notes: 'Includes lens kit and memory card'
  },
  {
    name: 'Microscope',
    description: 'High-resolution microscope for laboratory work',
    category: 'Laboratory',
    condition: 'Excellent',
    totalQuantity: 15,
    availableQuantity: 12,
    brand: 'Olympus',
    model: 'CX23',
    location: 'Biology Lab - Room 301',
    notes: 'Multiple objective lenses included'
  },
  {
    name: 'Arduino Starter Kit',
    description: 'Complete electronics prototyping kit',
    category: 'Electronics',
    condition: 'Good',
    totalQuantity: 20,
    availableQuantity: 18,
    brand: 'Arduino',
    model: 'Uno R3 Starter Kit',
    location: 'Electronics Lab - Room 401',
    notes: 'Includes breadboard, sensors, and cables'
  },
  {
    name: 'Projector',
    description: 'HD projector for presentations',
    category: 'Audio/Visual',
    condition: 'Good',
    totalQuantity: 8,
    availableQuantity: 6,
    brand: 'Epson',
    model: 'PowerLite 1781W',
    location: 'AV Equipment Room',
    notes: 'Includes HDMI and VGA cables'
  },
  {
    name: 'Soccer Ball',
    description: 'Official size soccer ball for sports activities',
    category: 'Sports',
    condition: 'Good',
    totalQuantity: 25,
    availableQuantity: 22,
    brand: 'Nike',
    model: 'Strike Team',
    location: 'Sports Equipment Storage',
    notes: 'Various colors available'
  },
  {
    name: 'Power Drill',
    description: 'Cordless power drill for construction projects',
    category: 'Tools',
    condition: 'Excellent',
    totalQuantity: 6,
    availableQuantity: 5,
    brand: 'DeWalt',
    model: 'DCD771C2',
    location: 'Workshop - Room 501',
    notes: 'Includes battery charger and drill bits'
  },
  {
    name: 'Tablet (iPad)',
    description: 'Tablet for mobile computing and presentations',
    category: 'Computing',
    condition: 'Excellent',
    totalQuantity: 12,
    availableQuantity: 10,
    brand: 'Apple',
    model: 'iPad Air (5th generation)',
    location: 'IT Lab - Room 101',
    notes: 'Includes protective case and stylus'
  }
];

// Seeding function
const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Equipment.deleteMany({});
    await Request.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`👤 Created user: ${user.username}`);
    }

    // Get admin user for equipment creation
    const adminUser = createdUsers.find(user => user.role === 'admin');
    
    // Create equipment
    const createdEquipment = [];
    for (const equipmentData of sampleEquipment) {
      const equipment = new Equipment({
        ...equipmentData,
        createdBy: adminUser._id
      });
      await equipment.save();
      createdEquipment.push(equipment);
      console.log(`🔧 Created equipment: ${equipment.name}`);
    }

    // Create some sample requests
    const studentUsers = createdUsers.filter(user => user.role === 'student');
    const staffUser = createdUsers.find(user => user.role === 'staff');

    const sampleRequests = [
      {
        requester: studentUsers[0]._id,
        equipment: createdEquipment[0]._id, // MacBook Pro
        quantity: 1,
        requestedStartDate: new Date(Date.now() + 86400000), // Tomorrow
        requestedEndDate: new Date(Date.now() + 86400000 * 7), // Next week
        purpose: 'Final year project development',
        status: 'pending'
      },
      {
        requester: studentUsers[1]._id,
        equipment: createdEquipment[1]._id, // Digital Camera
        quantity: 1,
        requestedStartDate: new Date(Date.now() + 86400000 * 2), // Day after tomorrow
        requestedEndDate: new Date(Date.now() + 86400000 * 4), // 4 days from now
        purpose: 'Photography assignment',
        status: 'approved',
        approvedBy: staffUser._id,
        approvalDate: new Date()
      },
      {
        requester: studentUsers[2]._id,
        equipment: createdEquipment[2]._id, // Microscope
        quantity: 2,
        requestedStartDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
        requestedEndDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
        purpose: 'Biology lab experiment',
        status: 'pending'
      }
    ];

    for (const requestData of sampleRequests) {
      const request = new Request(requestData);
      await request.save();
      
      // Update equipment availability for approved requests
      if (request.status === 'approved') {
        const equipment = await Equipment.findById(request.equipment);
        equipment.availableQuantity -= request.quantity;
        await equipment.save();
      }
      
      console.log(`📋 Created request: ${request._id}`);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users created: ${createdUsers.length}`);
    console.log(`🔧 Equipment items created: ${createdEquipment.length}`);
    console.log(`📋 Requests created: ${sampleRequests.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin / password123');
    console.log('Staff: staff / password123');
    console.log('Student: student / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📡 Database connection closed');
    process.exit(0);
  }
};

// Run seeding
const runSeed = async () => {
  await connectDB();
  await seedData();
};

// Execute if run directly
if (require.main === module) {
  runSeed();
}

module.exports = { seedData, connectDB };