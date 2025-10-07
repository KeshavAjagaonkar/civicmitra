const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // The user who will receive the notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // A clear title for the notification
  title: {
    type: String,
    required: [true, 'Please provide a notification title.'],
  },
  // The detailed message
  message: {
    type: String,
    required: true,
  },
  // Link to the relevant complaint (optional)
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
  },
  // Read status
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create an index on userId and createdAt for efficient querying
NotificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
