const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

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

// @desc    Register a new CITIZEN user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, phone, address, password } = req.body;

  // This route is for citizen registration only.
  const user = await User.create({
    name,
    email,
    phone,
    address,
    password,
    role: 'citizen', // Hardcode role to 'citizen' for security
  });

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
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
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
