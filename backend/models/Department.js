const mongoose = require('mongoose');

// These are the only valid complaint categories in the system.
// Stored here so that both the schema and aiService can reference the same source.
const COMPLAINT_CATEGORIES = [
  'Roads', 'Water Supply', 'Sanitation', 'Electricity',
  'Public Health', 'Street Lights', 'Drainage', 'Garbage', 'Other',
];

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a department name'],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    maxlength: [500, 'Description can not be more than 500 characters'],
  },
  // Which complaint categories this department handles.
  // Drives AI auto-routing: getDepartmentByCategory queries this field.
  // Admin sets this via the Department Management UI.
  categories: [{
    type: String,
    enum: COMPLAINT_CATEGORIES,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate slug from name before saving
DepartmentSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Department', DepartmentSchema);
module.exports.COMPLAINT_CATEGORIES = COMPLAINT_CATEGORIES;
