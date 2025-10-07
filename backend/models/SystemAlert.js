const mongoose = require('mongoose');

const SystemAlertSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Please specify alert type'],
    enum: ['info', 'warning', 'error', 'success'],
    default: 'info'
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  title: {
    type: String,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['system', 'complaints', 'users', 'departments', 'security'],
    default: 'system'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetRoles: [{
    type: String,
    enum: ['admin', 'staff', 'worker', 'citizen']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
SystemAlertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SystemAlert', SystemAlertSchema);