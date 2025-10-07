const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new feedback
// @route   POST /api/feedback
// @access  Private
exports.createFeedback = asyncHandler(async (req, res, next) => {
  const { complaintId, rating, comments } = req.body;

  const complaint = await Complaint.findById(complaintId);

  if (!complaint) {
    return next(new ErrorResponse(`Complaint not found with id of ${complaintId}`, 404));
  }

  if (complaint.citizenId.toString() !== req.user.id.toString()) {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to leave feedback for this complaint`, 401));
  }

  if (complaint.status !== 'Resolved') {
    return next(new ErrorResponse('Feedback can only be submitted for resolved complaints', 400));
  }

  const newFeedback = await Feedback.create({
    complaintId,
    citizenId: req.user.id,
    rating,
    comments,
  });

  res.status(201).json({
    success: true,
    data: newFeedback,
  });
});