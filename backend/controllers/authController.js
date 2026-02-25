const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { sendWelcomeEmail } = require('../utils/emailService');

// Get token from model, set cookie, and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  // Remove password from the user object before sending
  const userResponse = user.toObject();
  delete userResponse.password;

  res.status(statusCode).json({
    success: true,
    token,
    user: userResponse,
  });
};

// @desc    Register a new user (citizen, worker, or staff)
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, phone, address, password } = req.body;

  // SECURITY: Public registration ALWAYS creates citizen accounts.
  // Staff and worker accounts can only be created through the admin-only POST /api/admin/users endpoint.
  const userRole = 'citizen';

  // Email validation for Citizens (most common registration)
  if (userRole === 'citizen') {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new ErrorResponse('Please provide a valid email address', 400));
    }

    // Block dummy emails for citizens (must use real email)
    if (email.endsWith('@civicmitra.com')) {
      return next(new ErrorResponse('Please use a real email address (Gmail, Yahoo, Outlook, etc.) to register. Dummy emails are not allowed.', 400));
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email is already registered. Please login instead.', 400));
    }
  }

  // Create user data object
  const userData = {
    name,
    email,
    phone,
    address,
    password,
    role: userRole,
  };

  const user = await User.create(userData);

  // Send welcome email for citizens
  await sendWelcomeEmail(user);

  sendTokenResponse(user, 201, res);
});

// @desc    Login user (any role)
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body; // Role is no longer needed here

  // Check for user by email and populate department
  const user = await User.findOne({ email }).select('+password').populate('department');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // req.user is set in the protect middleware
  const user = await User.findById(req.user.id).populate('department');
  res.status(200).json({ success: true, data: user });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  // SECURITY: Only allow updating safe fields — prevents privilege escalation
  // via mass assignment (e.g., sending { "role": "admin" } in the body)
  const allowedFields = ['name', 'email', 'phone', 'address'];
  const updates = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: user });
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('Current password is not correct', 400));
  }
  user.password = newPassword;
  await user.save();
  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

// Note: adminLogin is removed as the primary login now handles all roles.
// You can keep a separate adminLogin route if you have specific logic,
// but the unified login controller makes it redundant.
