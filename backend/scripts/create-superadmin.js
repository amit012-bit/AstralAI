/**
 * Create SuperAdmin Account Script
 * Run this to create the initial superadmin user
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_solutions_marketplace');
    console.log('✅ Connected to MongoDB');

    // Check if superadmin already exists
    const existingAdmin = await User.findOne({ 
      email: 'SuperAdmin@medicodio.com',
      role: 'superadmin'
    });

    if (existingAdmin) {
      console.log('❌ SuperAdmin already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create superadmin user
    const superAdmin = new User({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'SuperAdmin@medicodio.com',
      password: 'SuperAdmin@#123',
      role: 'superadmin',
      isEmailVerified: true,
      isActive: true,
      phone: '+1-555-123-4567',
      bio: 'System Administrator for AI SolutionsHub',
      location: {
        city: 'San Francisco',
        state: 'CA',
        country: 'USA'
      }
    });

    // Save the superadmin
    await superAdmin.save();

    console.log('🎉 SuperAdmin created successfully!');
    console.log('Email:', superAdmin.email);
    console.log('Password:', 'SuperAdmin@#123');
    console.log('Role:', superAdmin.role);
    console.log('ID:', superAdmin._id);

  } catch (error) {
    console.error('❌ Error creating SuperAdmin:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  }
};

// Run the script
createSuperAdmin();
