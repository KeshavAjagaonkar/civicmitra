const mongoose = require('mongoose');
const { summarizeComplaint } = require('../services/aiService');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI);

const Complaint = require('../models/Complaint');

async function forceGenerateAISummary(complaintId) {
  try {
    console.log('🔍 Finding complaint...');
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      console.log('❌ Complaint not found');
      return;
    }

    console.log('✅ Complaint found:', complaint.title);
    console.log('📝 Description:', complaint.description);
    console.log('📍 Location:', complaint.location);
    console.log('📂 Category:', complaint.category);

    console.log('\n🤖 Generating AI Summary (forced)...');
    const summary = await summarizeComplaint(
      complaint.title,
      complaint.description,
      complaint.location,
      complaint.category
    );

    if (summary) {
      complaint.aiSummary = summary;
      await complaint.save();

      console.log('\n✅ AI Summary generated successfully!');
      console.log('\n📋 Summary Details:');
      console.log('   Short Summary:', summary.shortSummary);
      console.log('\n   Key Points:');
      summary.keyPoints.forEach((point, i) => {
        console.log(`   ${i + 1}. ${point}`);
      });
      console.log('\n   Main Issue:', summary.extractedInfo?.mainIssue);
      console.log('   Urgency:', summary.extractedInfo?.urgency);
      console.log('   Affected Area:', summary.extractedInfo?.affectedArea);
      console.log('   Sentiment:', summary.sentiment);
    } else {
      console.log('❌ AI Summary generation failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

const complaintId = process.argv[2];

if (!complaintId) {
  console.log('❌ Please provide complaint ID');
  console.log('Usage: node forceGenerateAISummary.js <complaint_id>');
  process.exit(1);
}

forceGenerateAISummary(complaintId);
