require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

const seedAdmin = async () => {
  try {
    // Connect to database
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/demo_requests');
    console.log('[Seed] Database connected successfully.');

    // Clear any existing admin accounts to ensure clean setup with current environment credentials
    console.log('[Seed] Clearing existing admin accounts...');
    await Admin.deleteMany({});

    const username = process.env.ADMIN_DEFAULT_USER || 'admin';
    const email = process.env.ADMIN_EMAIL || 'admin@youragency.com';
    const password = process.env.ADMIN_DEFAULT_PASS || 'AdminSecurePass2026!';

    console.log(`[Seed] Creating default administrator:`);
    console.log(`  - Username: ${username}`);
    console.log(`  - Email:    ${email}`);
    console.log(`  - Password: ${password} (change this in your .env or admin profile)`);

    await Admin.create({
      username,
      email,
      password
    });

    console.log('[Seed] Default admin account seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
