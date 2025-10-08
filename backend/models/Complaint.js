const mongoose = require('mongoose');

const TimelineEventSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['Complaint Submitted', 'Assigned to Worker', 'In Progress', 'Update', 'Resolved', 'Closed'],
  },
  status: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  attachments: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ComplaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title can not be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description can not be more than 1000 characters'],
  },
  category: {
    type: String,
    // required: [true, 'Please select a category'],
    enum: [
      'Roads',
      'Water Supply',   
      'Sanitation',
      'Electricity', 
      'Public Health',
      'Street Lights',
      'Drainage',
      'Garbage',
      'Other',
    ],
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    // required: [true, 'Please specify a department'],
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  location: {
    type: String,
    required: [true, 'Please add a location'],
  },
  attachments: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    enum: ['Submitted', 'In Progress', 'Resolved', 'Closed'],
    default: 'Submitted',
  },
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  departmentStaffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  deadline: {
    type: Date,
  },
  timeline: [TimelineEventSchema],
  aiClassification: {
    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    reasoning: {
      type: String,
    },
    aiClassified: {
      type: Boolean,
      default: false,
    },
    originalCategory: {
      type: String,
    },
  },
  resolutionProof: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
});

module.exports = mongoose.model('Complaint', ComplaintSchema);