const mongoose = require('mongoose');
const { summarizeComplaint, getDepartmentByCategory } = require('../services/aiService');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Complaint = require('../models/Complaint');

async function updateComplaint(complaintId) {
  try {
    console.log('🔍 Finding complaint...');
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      console.log('❌ Complaint not found');
      return;
    }

    console.log('✅ Complaint found:', complaint.title);

    // Generate AI Summary if not exists
    if (!complaint.aiSummary) {
      console.log('🤖 Generating AI Summary...');
      const summary = await summarizeComplaint(
        complaint.title,
        complaint.description,
        complaint.location,
        complaint.category
      );

      if (summary) {
        complaint.aiSummary = summary;
        console.log('✅ AI Summary generated:');
        console.log('   Short Summary:', summary.shortSummary);
        console.log('   Key Points:', summary.keyPoints);
        console.log('   Urgency:', summary.extractedInfo?.urgency);
        console.log('   Sentiment:', summary.sentiment);
      } else {
        console.log('⚠️  AI Summary generation failed');
      }
    } else {
      console.log('ℹ️  AI Summary already exists');
    }

    // Auto-assign department if not exists
    if (!complaint.department) {
      console.log('🏢 Auto-assigning department...');
      const departmentId = await getDepartmentByCategory(complaint.category);

      if (departmentId) {
        complaint.department = departmentId;
        const Department = require('../models/Department');
        const dept = await Department.findById(departmentId);
        console.log('✅ Department assigned:', dept?.name);
      } else {
        console.log('⚠️  No department found for category:', complaint.category);
      }
    } else {
      console.log('ℹ️  Department already assigned');
    }

    // Save complaint
    await complaint.save();
    console.log('💾 Complaint updated successfully!');

    // Display final complaint
    await complaint.populate('department');
    console.log('\n📋 Updated Complaint:');
    console.log('   Title:', complaint.title);
    console.log('   Category:', complaint.category);
    console.log('   Department:', complaint.department?.name || 'Not assigned');
    console.log('   AI Summary:', complaint.aiSummary?.shortSummary || 'Not generated');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Get complaint ID from command line
const complaintId = process.argv[2];

if (!complaintId) {
  console.log('❌ Please provide complaint ID');
  console.log('Usage: node addAISummaryToComplaint.js <complaint_id>');
  process.exit(1);
}

updateComplaint(complaintId);
