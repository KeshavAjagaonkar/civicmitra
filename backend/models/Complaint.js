const mongoose = require('mongoose');

const TimelineEventSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: [
      'Complaint Submitted', 'Under Review', 'Needs Info', 'Assigned to Worker',
      'In Progress', 'Update', 'Resolved', 'Rejected', 'Transferred',
      'Reopened', 'Closed', 'Status Update', 'Department Assigned',
    ],
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
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' },  // [longitude, latitude]
    address: { type: String, required: true },
    ward: String,
    pincode: String
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
    enum: [
      'Submitted',     // initial — citizen just filed it
      'Under Review',  // staff is reviewing
      'Needs Info',    // staff needs more details from citizen
      'In Progress',   // worker assigned and working
      'Rejected',      // invalid/out of scope (rejectionReason required)
      'Transferred',   // routed to a different department
      'Resolved',      // work completed (citizen can dispute within 7 days)
      'Reopened',      // citizen disputed resolution
      'Closed',        // terminal state — resolved + accepted or admin closed
    ],
    default: 'Submitted',
  },
  rejectionReason: {
    type: String,
    // Required when status is Rejected — enforced in controller, not schema level
    // so that existing data isn't broken by a strict schema validator
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
  aiSummary: {
    shortSummary: {
      type: String,
      maxlength: [200, 'Summary cannot be more than 200 characters'],
    },
    keyPoints: [{
      type: String,
    }],
    extractedInfo: {
      mainIssue: String,
      location: String,
      urgency: String,
      affectedArea: String,
    },
    sentiment: {
      type: String,
      enum: ['Neutral', 'Concerned', 'Frustrated', 'Angry', 'Urgent'],
    },
    generatedAt: {
      type: Date,
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
  // --- Community Fields ---
  isPublic: {
    type: Boolean,
    default: true,
  },
  upvotes: {
    // Denormalized count for efficient indexing/sorting (MongoDB can't index array.length)
    count: { type: Number, default: 0 },
    supporters: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      supportedAt: { type: Date, default: Date.now },
    }],
  },
  communityPriority: {
    score: { type: Number, default: 0 },
    lastCalculated: { type: Date, default: Date.now },
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
});

// --- Performance Indexes ---

// Department dashboard queries
ComplaintSchema.index({ department: 1, status: 1 });

// "My Complaints" page sorted by newest
ComplaintSchema.index({ citizenId: 1, createdAt: -1 });

// Public feed default sort
ComplaintSchema.index({ 'communityPriority.score': -1 });

// Public feed with filters
ComplaintSchema.index({ isPublic: 1, category: 1, status: 1 });

// Idempotency check on upvote (preventing duplicate votes from same user)
ComplaintSchema.index({ 'upvotes.supporters.userId': 1 });

// Geospatial queries - location is already indexed inline in the schema as '2dsphere'
// ComplaintSchema.index({ 'location.coordinates': '2dsphere' }); // Redundant but noted for clarity

module.exports = mongoose.model('Complaint', ComplaintSchema);