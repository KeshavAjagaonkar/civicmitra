const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

const Department = require('../models/Department');

async function checkDepartments() {
  try {
    console.log('🔍 Fetching all departments...\n');
    const departments = await Department.find({});

    if (departments.length === 0) {
      console.log('❌ No departments found in database');
    } else {
      console.log(`✅ Found ${departments.length} departments:\n`);
      departments.forEach((dept, index) => {
        console.log(`${index + 1}. ${dept.name}`);
        console.log(`   ID: ${dept._id}`);
        console.log(`   Slug: ${dept.slug || 'N/A'}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

checkDepartments();
