const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate a unique, URL-friendly slug
async function generateUniqueSlug(model, base) {
  const slugBase = base
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[\s\W-]+/g, '-') // Replace spaces, non-word chars, and dashes with a single dash
    .replace(/^-+|-+$/g, ''); // Trim leading/trailing dashes

  let slug = slugBase;
  let counter = 0;
  // Check if a user with this slug already exists and append a number if it does
  while (await model.exists({ slug })) {
    counter++;
    slug = `${slugBase}-${counter}`;
  }
  return slug;
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true, // This requires the slug to be unique for each user
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email' ],
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['citizen', 'staff', 'admin', 'worker'],
    default: 'citizen',
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function() { return this.role === 'staff' || this.role === 'worker'; }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Mongoose 'pre-save' hook: This runs BEFORE a user is saved to the database.
UserSchema.pre('save', async function (next) {
  try {
    // 1. Generate a unique slug if the user is new or their name changes.
    if (this.isNew || this.isModified('name')) {
      const base = this.name || (this.email ? this.email.split('@')[0] : 'user');
      this.slug = await generateUniqueSlug(this.constructor, base);
    }

    // 2. Hash the password if it has been modified (or is new).
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    
    next(); // Continue with the save operation
  } catch (error) {
    next(error); // Pass any errors to the next middleware
  }
});

// Method to sign a JWT for the user
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Method to compare entered password with the hashed password in the database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);