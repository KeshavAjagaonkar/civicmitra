const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load env vars
dotenv.config({ path: './.env' });

// Load models
const User = require('./models/User');
const Department = require('./models/Department');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Departments for Indian Municipal Corporation
const departments = [
  { name: 'Water Supply', description: 'Manages water supply and distribution' },
  { name: 'Sanitation', description: 'Handles waste management and cleanliness' },
  { name: 'Road Maintenance', description: 'Maintains roads and infrastructure' },
  { name: 'Street Lighting', description: 'Manages public lighting systems' },
  { name: 'Health & Hygiene', description: 'Public health and sanitation services' },
  { name: 'Parks & Gardens', description: 'Maintains public parks and green spaces' },
];

// Admin User
const adminUser = {
  name: 'Admin CivicMitra',
  email: 'admin@civicmitra.com',
  phone: '9999999999',
  address: 'Municipal Corporation Headquarters',
  password: 'admin123',
  role: 'admin',
};

// Staff users for each department
const staffUsers = [
  {
    name: 'Ramesh Kumar',
    email: 'staff.water@civicmitra.com',
    phone: '9876543210',
    address: 'Water Supply Department Office',
    password: 'staff123',
    role: 'staff',
    departmentName: 'Water Supply',
  },
  {
    name: 'Priya Sharma',
    email: 'staff.sanitation@civicmitra.com',
    phone: '9876543211',
    address: 'Sanitation Department Office',
    password: 'staff123',
    role: 'staff',
    departmentName: 'Sanitation',
  },
  {
    name: 'Anil Verma',
    email: 'staff.roads@civicmitra.com',
    phone: '9876543212',
    address: 'Road Maintenance Department Office',
    password: 'staff123',
    role: 'staff',
    departmentName: 'Road Maintenance',
  },
  {
    name: 'Sunita Patel',
    email: 'staff.lighting@civicmitra.com',
    phone: '9876543213',
    address: 'Street Lighting Department Office',
    password: 'staff123',
    role: 'staff',
    departmentName: 'Street Lighting',
  },
  {
    name: 'Dr. Rajesh Singh',
    email: 'staff.health@civicmitra.com',
    phone: '9876543214',
    address: 'Health & Hygiene Department Office',
    password: 'staff123',
    role: 'staff',
    departmentName: 'Health & Hygiene',
  },
  {
    name: 'Geeta Mehta',
    email: 'staff.parks@civicmitra.com',
    phone: '9876543215',
    address: 'Parks & Gardens Department Office',
    password: 'staff123',
    role: 'staff',
    departmentName: 'Parks & Gardens',
  },
];

// Note: Workers register themselves via public registration
// No need to seed worker accounts

// Sample citizen users
const citizenUsers = [
  {
    name: 'Rahul Sharma',
    email: 'citizen@civicmitra.com',
    phone: '9876543230',
    address: '123, MG Road, Block A, New Delhi',
    password: 'citizen123',
    role: 'citizen',
  },
  {
    name: 'Anjali Verma',
    email: 'citizen2@civicmitra.com',
    phone: '9876543231',
    address: '456, Rajpath Avenue, Sector 5, Mumbai',
    password: 'citizen123',
    role: 'citizen',
  },
];

const seedDatabase = async () => {
  try {
    // Delete existing data
    await Department.deleteMany();
    await User.deleteMany();

    console.log('Cleared existing data...'.yellow);

    // Create departments (using create instead of insertMany to trigger pre-save hooks)
    const createdDepartments = [];
    for (const dept of departments) {
      const created = await Department.create(dept);
      createdDepartments.push(created);
    }
    console.log(`${createdDepartments.length} Departments created`.green);

    // Create admin
    const admin = await User.create(adminUser);
    console.log('Admin user created'.green);

    // Create staff users with department references
    for (const staffData of staffUsers) {
      const dept = createdDepartments.find(d => d.name === staffData.departmentName);
      if (dept) {
        await User.create({
          name: staffData.name,
          email: staffData.email,
          phone: staffData.phone,
          address: staffData.address,
          password: staffData.password,
          role: staffData.role,
          department: dept._id,
        });
        console.log(`Staff user created: ${staffData.name} - ${staffData.departmentName}`.green);
      }
    }

    // Workers register themselves - no seeding needed
    console.log('Workers will register themselves via public registration'.yellow);

    // Create sample citizen users
    for (const citizenData of citizenUsers) {
      await User.create({
        name: citizenData.name,
        email: citizenData.email,
        phone: citizenData.phone,
        address: citizenData.address,
        password: citizenData.password,
        role: citizenData.role,
      });
      console.log(`Citizen user created: ${citizenData.name}`.green);
    }

    console.log('\n========================================'.cyan);
    console.log('SEED DATA COMPLETED SUCCESSFULLY!'.green.bold);
    console.log('========================================\n'.cyan);

    console.log('LOGIN CREDENTIALS:'.yellow.bold);
    console.log('\n--- ADMIN ---'.cyan);
    console.log(`Email: ${adminUser.email}`.white);
    console.log(`Password: ${adminUser.password}`.white);

    console.log('\n--- DEPARTMENT STAFF (1 per department) ---'.cyan);
    staffUsers.forEach(staff => {
      console.log(`\n${staff.departmentName}:`.yellow);
      console.log(`  Email: ${staff.email}`.white);
      console.log(`  Password: ${staff.password}`.white);
    });

    console.log('\n--- CITIZENS (Sample - can register more) ---'.cyan);
    citizenUsers.forEach(citizen => {
      console.log(`\n${citizen.name}:`.yellow);
      console.log(`  Email: ${citizen.email}`.white);
      console.log(`  Password: ${citizen.password}`.white);
    });

    console.log('\n--- WORKERS ---'.cyan);
    console.log('Workers can register themselves at /auth'.yellow);
    console.log('Workers select their department during registration'.yellow);

    console.log('\n========================================\n'.cyan);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:'.red, error);
    process.exit(1);
  }
};

seedDatabase();
