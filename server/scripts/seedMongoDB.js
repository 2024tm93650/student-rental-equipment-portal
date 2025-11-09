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
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB for seeding');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Equipment.deleteMany({});
    await Request.deleteMany({});
    console.log('🗑️ Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
};

// Seed Users (M.Tech Project Test Data)
const seedUsers = async () => {
  try {
    const users = [
      {
        username: 'admin',
        email: 'admin@school.com',
        password: 'admin123',
        role: 'admin',
        firstName: 'System',
        lastName: 'Administrator',
        department: 'IT Department'
      },
      {
        username: 'staff1',
        email: 'staff1@school.com',
        password: 'staff123',
        role: 'staff',
        firstName: 'Dr. Sarah',
        lastName: 'Wilson',
        department: 'Computer Science'
      },
      {
        username: 'staff2',
        email: 'staff2@school.com',
        password: 'staff123',
        role: 'staff',
        firstName: 'Prof. Michael',
        lastName: 'Johnson',
        department: 'Electronics Engineering'
      },
      {
        username: 'student1',
        email: 'student1@school.com',
        password: 'student123',
        role: 'student',
        firstName: 'Rahul',
        lastName: 'Sharma',
        studentId: 'MT2023001',
        department: 'Computer Science'
      },
      {
        username: 'student2',
        email: 'student2@school.com',
        password: 'student123',
        role: 'student',
        firstName: 'Priya',
        lastName: 'Patel',
        studentId: 'MT2023002',
        department: 'Electronics Engineering'
      },
      {
        username: 'student3',
        email: 'student3@school.com',
        password: 'student123',
        role: 'student',
        firstName: 'Amit',
        lastName: 'Kumar',
        studentId: 'MT2023003',
        department: 'Computer Science'
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    return [];
  }
};

// Seed Equipment (M.Tech Project Test Data)
const seedEquipment = async (users) => {
  try {
    const adminUser = users.find(u => u.role === 'admin');
    const staffUser = users.find(u => u.role === 'staff');

    const equipment = [
      {
        name: 'Dell XPS 15 Laptop',
        description: 'High-performance laptop with Intel i7, 16GB RAM, RTX 3050',
        category: 'Computing',
        condition: 'Excellent',
        totalQuantity: 5,
        availableQuantity: 3,
        serialNumber: 'DELL001',
        brand: 'Dell',
        model: 'XPS 15 9520',
        purchaseDate: new Date('2023-01-15'),
        purchasePrice: 1500,
        location: 'Computer Lab A',
        createdBy: adminUser._id
      },
      {
        name: 'MacBook Pro M2',
        description: 'Apple MacBook Pro with M2 chip, 16GB RAM, perfect for development',
        category: 'Computing',
        condition: 'Excellent',
        totalQuantity: 3,
        availableQuantity: 2,
        serialNumber: 'APPLE001',
        brand: 'Apple',
        model: 'MacBook Pro 14"',
        purchaseDate: new Date('2023-02-10'),
        purchasePrice: 2000,
        location: 'Computer Lab B',
        createdBy: staffUser._id
      },
      {
        name: 'EPSON PowerLite Projector',
        description: '4K wireless projector for presentations and lectures',
        category: 'Audio/Visual',
        condition: 'Good',
        totalQuantity: 4,
        availableQuantity: 2,
        serialNumber: 'EPSON001',
        brand: 'EPSON',
        model: 'PowerLite 2247U',
        purchaseDate: new Date('2022-11-20'),
        purchasePrice: 800,
        location: 'Conference Room',
        createdBy: adminUser._id
      },
      {
        name: 'Canon DSLR Camera',
        description: 'Professional DSLR camera with 18-55mm lens for documentation',
        category: 'Electronics',
        condition: 'Excellent',
        totalQuantity: 2,
        availableQuantity: 1,
        serialNumber: 'CANON001',
        brand: 'Canon',
        model: 'EOS 2000D',
        purchaseDate: new Date('2023-03-05'),
        purchasePrice: 600,
        location: 'Media Lab',
        createdBy: staffUser._id
      },
      {
        name: 'Arduino Uno Kit',
        description: 'Complete Arduino starter kit with sensors and components',
        category: 'Electronics',
        condition: 'Good',
        totalQuantity: 10,
        availableQuantity: 7,
        serialNumber: 'ARD001',
        brand: 'Arduino',
        model: 'Uno R3 Starter Kit',
        purchaseDate: new Date('2023-04-12'),
        purchasePrice: 50,
        location: 'Electronics Lab',
        createdBy: adminUser._id
      },
      {
        name: 'Raspberry Pi 4 Kit',
        description: 'Raspberry Pi 4 with 8GB RAM, case, and accessories',
        category: 'Electronics',
        condition: 'Excellent',
        totalQuantity: 8,
        availableQuantity: 5,
        serialNumber: 'RPI001',
        brand: 'Raspberry Pi',
        model: 'Pi 4 Model B 8GB',
        purchaseDate: new Date('2023-05-18'),
        purchasePrice: 120,
        location: 'Electronics Lab',
        createdBy: staffUser._id
      },
      {
        name: 'Wireless Microphone Set',
        description: 'Professional wireless microphone system for presentations',
        category: 'Audio/Visual',
        condition: 'Good',
        totalQuantity: 3,
        availableQuantity: 2,
        serialNumber: 'MIC001',
        brand: 'Shure',
        model: 'BLX288/PG58',
        purchaseDate: new Date('2022-12-08'),
        purchasePrice: 400,
        location: 'Audio Lab',
        createdBy: adminUser._id
      },
      {
        name: 'Oscilloscope',
        description: 'Digital oscilloscope for electronics testing and measurements',
        category: 'Laboratory',
        condition: 'Excellent',
        totalQuantity: 2,
        availableQuantity: 1,
        serialNumber: 'OSC001',
        brand: 'Rigol',
        model: 'DS1054Z',
        purchaseDate: new Date('2023-06-25'),
        purchasePrice: 400,
        location: 'Electronics Lab',
        createdBy: staffUser._id
      }
    ];

    const createdEquipment = await Equipment.insertMany(equipment);
    console.log(`✅ Created ${createdEquipment.length} equipment items`);
    return createdEquipment;
  } catch (error) {
    console.error('❌ Error seeding equipment:', error);
    return [];
  }
};

// Seed Requests (M.Tech Project Test Data)
const seedRequests = async (users, equipment) => {
  try {
    const students = users.filter(u => u.role === 'student');
    const staff = users.filter(u => u.role === 'staff');

    const requests = [
      {
        requester: students[0]._id,
        equipment: equipment[0]._id, // Dell XPS 15 Laptop
        quantity: 1,
        requestedStartDate: new Date('2023-11-10'),
        requestedEndDate: new Date('2023-11-20'),
        status: 'approved',
        purpose: 'M.Tech thesis research - Machine Learning project implementation',
        approvedBy: staff[0]._id,
        approvalDate: new Date('2023-11-08')
      },
      {
        requester: students[1]._id,
        equipment: equipment[2]._id, // EPSON Projector
        quantity: 1,
        requestedStartDate: new Date('2023-11-15'),
        requestedEndDate: new Date('2023-11-16'),
        status: 'borrowed',
        purpose: 'M.Tech seminar presentation on IoT systems',
        approvedBy: staff[1]._id,
        approvalDate: new Date('2023-11-14'),
        actualStartDate: new Date('2023-11-15')
      },
      {
        requester: students[2]._id,
        equipment: equipment[3]._id, // Canon DSLR Camera
        quantity: 1,
        requestedStartDate: new Date('2023-11-12'),
        requestedEndDate: new Date('2023-11-14'),
        status: 'pending',
        purpose: 'Documentation for M.Tech project prototype'
      },
      {
        requester: students[0]._id,
        equipment: equipment[4]._id, // Arduino Kit
        quantity: 2,
        requestedStartDate: new Date('2023-11-20'),
        requestedEndDate: new Date('2023-12-15'),
        status: 'approved',
        purpose: 'IoT sensor network development for M.Tech project',
        approvedBy: staff[0]._id,
        approvalDate: new Date('2023-11-18')
      },
      {
        requester: students[1]._id,
        equipment: equipment[5]._id, // Raspberry Pi Kit
        quantity: 1,
        requestedStartDate: new Date('2023-11-25'),
        requestedEndDate: new Date('2023-12-20'),
        status: 'pending',
        purpose: 'Edge computing research for M.Tech thesis'
      },
      {
        requester: students[2]._id,
        equipment: equipment[7]._id, // Oscilloscope
        quantity: 1,
        requestedStartDate: new Date('2023-11-05'),
        requestedEndDate: new Date('2023-11-08'),
        status: 'returned',
        purpose: 'Circuit analysis for electronics project',
        approvedBy: staff[1]._id,
        approvalDate: new Date('2023-11-04'),
        actualStartDate: new Date('2023-11-05'),
        actualEndDate: new Date('2023-11-08')
      }
    ];

    const createdRequests = await Request.insertMany(requests);
    console.log(`✅ Created ${createdRequests.length} requests`);
    return createdRequests;
  } catch (error) {
    console.error('❌ Error seeding requests:', error);
    return [];
  }
};

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding for M.Tech Project...\n');

    await connectDB();
    await clearDatabase();

    console.log('\n📊 Seeding test data...');
    const users = await seedUsers();
    const equipment = await seedEquipment(users);
    const requests = await seedRequests(users, equipment);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n👤 Test Accounts Created:');
    console.log('📧 Admin:    admin@school.com / admin123');
    console.log('👨‍🏫 Staff 1:  staff1@school.com / staff123');
    console.log('👨‍🏫 Staff 2:  staff2@school.com / staff123');
    console.log('🎓 Student 1: student1@school.com / student123 (MT2023001)');
    console.log('🎓 Student 2: student2@school.com / student123 (MT2023002)');
    console.log('🎓 Student 3: student3@school.com / student123 (MT2023003)');

    console.log('\n📊 Database Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`🔧 Equipment: ${equipment.length}`);
    console.log(`📋 Requests: ${requests.length}`);

    console.log('\n🎯 Perfect for M.Tech Project Demonstration!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📤 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run seeding if script is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };