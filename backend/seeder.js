const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Department = require('./models/Department');
const Complaint = require('./models/Complaint');
const SystemAlert = require('./models/SystemAlert');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Complaint.deleteMany({});
    await SystemAlert.deleteMany({});

    // Create departments
    const departments = await Department.create([
      { name: 'Public Works', description: 'Roads, infrastructure, and public facilities' },
      { name: 'Water Department', description: 'Water supply and quality management' },
      { name: 'Sanitation', description: 'Waste management and cleanliness' },
      { name: 'Electricity', description: 'Power supply and electrical infrastructure' },
      { name: 'Health Department', description: 'Public health and medical services' },
      { name: 'Traffic Department', description: 'Traffic management and road safety' }
    ]);

    // Create admin user
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'System Admin',
      email: process.env.ADMIN_EMAIL || 'admin@civicmitra.com',
      phone: '9999999999',
      address: 'HQ, City Center',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
    });

    // Create staff users
    const staff = await User.create([
      {
        name: 'John Staff',
        email: 'staff@civicmitra.com',
        phone: '8888888888',
        address: 'Dept Office, Block A',
        password: 'staff123',
        role: 'staff',
        department: departments[0]._id
      },
      {
        name: 'Jane Department Head',
        email: 'jane.staff@civicmitra.com',
        phone: '7777777777',
        address: 'Dept Office, Block B',
        password: 'staff123',
        role: 'staff',
        department: departments[1]._id
      }
    ]);

    // Create worker users
    const workers = await User.create([
      {
        name: 'Mike Worker',
        email: 'worker@civicmitra.com',
        phone: '6666666666',
        address: 'Field Unit 1',
        password: 'worker123',
        role: 'worker',
        department: departments[0]._id
      },
      {
        name: 'Sarah Field Worker',
        email: 'sarah.worker@civicmitra.com',
        phone: '5555555555',
        address: 'Field Unit 2',
        password: 'worker123',
        role: 'worker',
        department: departments[1]._id
      }
    ]);

    // Create citizen users
    const citizens = await User.create([
      {
        name: 'Alice Citizen',
        email: 'citizen@civicmitra.com',
        phone: '4444444444',
        address: 'House 1, Neighborhood',
        password: 'citizen123',
        role: 'citizen'
      },
      {
        name: 'Bob User',
        email: 'bob@civicmitra.com',
        phone: '3333333333',
        address: 'House 2, Neighborhood',
        password: 'citizen123',
        role: 'citizen'
      }
    ]);

    // Create sample complaints
    const complaints = await Complaint.create([
      {
        title: 'Pothole on Main Street',
        description: 'There is a large pothole on Main Street that is causing damage to vehicles. It needs immediate attention.',
        category: 'Roads',
        department: departments[0]._id,
        priority: 'High',
        location: 'Main Street, near City Hall',
        citizenId: citizens[0]._id,
        status: 'In Progress',
        workerId: workers[0]._id,
        timeline: [
          {
            action: 'Complaint Submitted',
            status: 'Submitted',
            updatedBy: citizens[0]._id,
          },
          {
            action: 'Assigned to Worker',
            status: 'In Progress',
            updatedBy: staff[0]._id,
            notes: 'Assigned to field team for assessment'
          }
        ]
      },
      {
        title: 'Water Supply Issue',
        description: 'No water supply in my area for the past 2 days. Please fix urgently.',
        category: 'Water Supply',
        department: departments[1]._id,
        priority: 'High',
        location: 'Residential Area Block A',
        citizenId: citizens[1]._id,
        status: 'Submitted',
        timeline: [
          {
            action: 'Complaint Submitted',
            status: 'Submitted',
            updatedBy: citizens[1]._id,
          }
        ]
      },
      {
        title: 'Street Light Not Working',
        description: 'The street light near the park has been out for a week. It makes the area unsafe at night.',
        category: 'Electricity',
        department: departments[3]._id,
        priority: 'Medium',
        location: 'Park Street, near Central Park',
        citizenId: citizens[0]._id,
        status: 'Resolved',
        workerId: workers[1]._id,
        timeline: [
          {
            action: 'Complaint Submitted',
            status: 'Submitted',
            updatedBy: citizens[0]._id,
          },
          {
            action: 'In Progress',
            status: 'In Progress',
            updatedBy: workers[1]._id,
            notes: 'Technician dispatched for repair'
          },
          {
            action: 'Resolved',
            status: 'Resolved',
            updatedBy: workers[1]._id,
            notes: 'Street light repaired and tested'
          }
        ]
      }
    ]);

    // Create system alerts
    const systemAlerts = await SystemAlert.create([
      {
        type: 'warning',
        message: 'High number of pending complaints in Public Works department',
        title: 'Department Overload',
        category: 'complaints',
        targetRoles: ['admin', 'staff'],
        priority: 'high',
        createdBy: admin._id,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        type: 'info',
        message: 'New user registration: 3 new citizens joined today',
        title: 'New Registrations',
        category: 'users',
        targetRoles: ['admin'],
        priority: 'medium',
        createdBy: admin._id,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        type: 'success',
        message: 'Database backup completed successfully',
        title: 'System Maintenance',
        category: 'system',
        targetRoles: ['admin'],
        priority: 'low',
        createdBy: admin._id,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
    ]);

    console.log('Sample data created successfully!');
    console.log(`Created ${departments.length} departments, ${staff.length + workers.length + citizens.length + 1} users, ${complaints.length} complaints, and ${systemAlerts.length} system alerts`);
    console.log('');
    console.log('Login credentials:');
    console.log('Admin: admin@civicmitra.com / admin123');
    console.log('Staff: staff@civicmitra.com / staff123');
    console.log('Worker: worker@civicmitra.com / worker123');
    console.log('Citizen: citizen@civicmitra.com / citizen123');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany({});
    await Department.deleteMany({});
    await Complaint.deleteMany({});
    await SystemAlert.deleteMany({});
    console.log('All data destroyed!');
    process.exit();
  } catch (error) {
    console.error('Error destroying data:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
