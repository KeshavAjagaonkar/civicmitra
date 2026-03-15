const Complaint = require('../models/Complaint');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { calculateCommunityPriority } = require('../utils/communityPriority');
const { findSimilarWithAI, findSimilarWithKeywords } = require('../utils/duplicateDetection');
const { broadcastToSupporters } = require('../utils/notificationHelper');

// @desc    Get public complaints feed (sorted by community priority)
// @route   GET /api/complaints/public
// @access  Private (any authenticated user)
exports.getPublicComplaints = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build Sort
  let sort = { 'communityPriority.score': -1 }; // Default: highest priority first
  if (req.query.sort === 'newest') sort = { createdAt: -1 };
  if (req.query.sort === 'oldest') sort = { createdAt: 1 };
  if (req.query.sort === 'most-upvoted') sort = { 'upvotes.count': -1 };

  // Build Filter
  const isAudit = req.query.audit === 'true';
  const filter = {
    isPublic: true,
    status: isAudit ? { $in: ['Rejected', 'Closed'] } : { $nin: ['Rejected', 'Closed'] }
  };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.status && !isAudit) filter.status = req.query.status;

  // Geospatial filter using $geoWithin/$centerSphere
  // IMPORTANT: We use $geoWithin (NOT $nearSphere) here because:
  // - $nearSphere implicitly sorts by distance and conflicts with Mongoose's .sort()
  //   causing mongoose to OVERRIDE the geo sort, making the radius limit have no effect.
  // - $geoWithin is a pure FILTER (like a "box") with no implicit sort.
  //   It finds all documents WITHIN a given circular area and then lets us apply
  //   any sort we want on top of it (e.g. priority score, newest, etc.).
  if (req.query.lat && req.query.lng) {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusInMeters = parseInt(req.query.radius, 10) || 5000; // default 5km
    const radiusInRadians = radiusInMeters / 6378100; // Earth's radius in meters

    filter['location.coordinates'] = {
      $geoWithin: {
        $centerSphere: [[lng, lat], radiusInRadians],
      },
    };
  }

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .select('-upvotes.supporters')
      .populate('citizenId', 'name')
      .populate('department', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Complaint.countDocuments(filter),
  ]);

  // For the current user, check which complaints they have supported
  const userId = req.user.id;
  const userSupportedIds = await Complaint.find({
    _id: { $in: complaints.map(c => c._id) },
    'upvotes.supporters.userId': userId,
  }).select('_id').lean();

  const supportedSet = new Set(userSupportedIds.map(c => c._id.toString()));

  const enrichedComplaints = complaints.map(c => ({
    ...c,
    hasUserSupported: supportedSet.has(c._id.toString()),
  }));

  res.status(200).json({
    success: true,
    data: enrichedComplaints,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    },
  });
});

// @desc    Get nearby public complaints
// @route   GET /api/complaints/nearby
// @access  Private
exports.getNearbyComplaints = asyncHandler(async (req, res, next) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radiusInMeters = parseInt(req.query.radius, 10) || 2000; // default 2km

  if (!lat || !lng) {
    return next(new ErrorResponse('Please provide lat and lng coordinates', 400));
  }

  // Convert radius from meters to radians for $centerSphere
  const radiusInRadians = radiusInMeters / 6378100;

  const complaints = await Complaint.find({
    isPublic: true,
    status: { $nin: ['Rejected', 'Closed'] },
    'location.coordinates': {
      $geoWithin: {
        $centerSphere: [[lng, lat], radiusInRadians],
      },
    },
  })
    .select('-upvotes.supporters')
    .sort({ 'communityPriority.score': -1 })
    .limit(50)
    .populate('citizenId', 'name')
    .populate('department', 'name')
    .lean();

  const userId = req.user.id;
  const userSupportedIds = await Complaint.find({
    _id: { $in: complaints.map(c => c._id) },
    'upvotes.supporters.userId': userId,
  }).select('_id').lean();

  const supportedSet = new Set(userSupportedIds.map(c => c._id.toString()));

  const enrichedComplaints = complaints.map(c => ({
    ...c,
    hasUserSupported: supportedSet.has(c._id.toString()),
  }));

  res.status(200).json({
    success: true,
    count: enrichedComplaints.length,
    data: enrichedComplaints,
  });
});

// @desc    Check for similar active complaints (Duplicate Detection)
// @route   POST /api/complaints/check-similar
// @access  Private (Citizen)
exports.checkSimilarComplaints = asyncHandler(async (req, res, next) => {
  const { title, description, category, lng, lat } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Title and description required' });
  }

  // Find candidates (Active complaints in the same category)
  const filter = {
    status: { $nin: ['Resolved', 'Closed'] },
    isPublic: true
  };

  if (category && category !== 'Other') {
    filter.category = category;
  }

  // Optional: If we have location, only check within 5km
  if (lng && lat) {
    filter['location.coordinates'] = {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: 5000
      }
    };
  }

  const candidates = await Complaint.find(filter)
    .select('title description category location status upvotes.count createdAt')
    .sort({ 'communityPriority.score': -1 })
    .limit(10) // Only send top 10 to Gemini to save tokens/time
    .lean();

  if (candidates.length === 0) {
    return res.status(200).json({ success: true, matches: [] });
  }

  let matches = [];
  try {
    // Try Gemini first
    matches = await findSimilarWithAI(title, description, candidates);
  } catch (error) {
    // Fallback to keywords if Gemini fails or times out
    matches = await findSimilarWithKeywords(title, description, candidates);
  }

  res.status(200).json({
    success: true,
    matches: matches
  });
});

// @desc    Upvote (support) a public complaint
// @route   POST /api/complaints/:id/upvote
// @access  Private (Citizen)
exports.upvoteComplaint = asyncHandler(async (req, res, next) => {
  const complaintId = req.params.id;
  const userId = req.user.id;

  // Use atomic updates to prevent race conditions.
  const updatedComplaint = await Complaint.findOneAndUpdate(
    {
      _id: complaintId,
      isPublic: true,
      'upvotes.supporters.userId': { $ne: userId }
    },
    {
      $addToSet: { 'upvotes.supporters': { userId: userId, supportedAt: new Date() } },
      $inc: { 'upvotes.count': 1 }
    },
    { new: true } // Return updated document for priority calculation
  );

  if (!updatedComplaint) {
    const exists = await Complaint.findById(complaintId);
    if (!exists) return next(new ErrorResponse('Complaint not found', 404));
    if (!exists.isPublic) return next(new ErrorResponse('This complaint is not public', 403));
    
    // Check if it's already closed/resolved before assuming they already voted
    if (['Resolved', 'Closed', 'Rejected'].includes(exists.status)) {
      return next(new ErrorResponse(`Cannot upvote a complaint that is ${exists.status}`, 400));
    }

    // If it exists and is public, but not updated, user already supported
    return res.status(409).json({ success: false, message: 'You have already supported this complaint' });
  }

  // Recalculate community priority based on new values
  const priority = calculateCommunityPriority(updatedComplaint);
  updatedComplaint.communityPriority = priority;

  await Complaint.updateOne(
    { _id: complaintId },
    { $set: { communityPriority: priority } }
  );

  res.status(200).json({
    success: true,
    data: {
      upvoteCount: updatedComplaint.upvotes.count,
      communityPriority: priority,
    },
  });
});

// @desc    Remove upvote from a public complaint
// @route   DELETE /api/complaints/:id/upvote
// @access  Private (Citizen)
exports.removeUpvote = asyncHandler(async (req, res, next) => {
  const complaintId = req.params.id;
  const userId = req.user.id;

  const updatedComplaint = await Complaint.findOneAndUpdate(
    {
      _id: complaintId,
      'upvotes.supporters.userId': userId
    },
    {
      $pull: { 'upvotes.supporters': { userId: userId } },
      $inc: { 'upvotes.count': -1 }
    },
    { new: true }
  );

  if (!updatedComplaint) {
    const exists = await Complaint.findById(complaintId);
    if (!exists) return next(new ErrorResponse('Complaint not found', 404));

    if (['Resolved', 'Closed', 'Rejected'].includes(exists.status)) {
      return next(new ErrorResponse(`Cannot modify upvotes on a complaint that is ${exists.status}`, 400));
    }

    return res.status(409).json({ success: false, message: 'You have not supported this complaint' });
  }

  // Recalculate community priority based on new values
  const priority = calculateCommunityPriority(updatedComplaint);
  updatedComplaint.communityPriority = priority;

  await Complaint.updateOne(
    { _id: complaintId },
    { $set: { communityPriority: priority } }
  );

  res.status(200).json({
    success: true,
    data: {
      upvoteCount: updatedComplaint.upvotes.count,
      communityPriority: priority,
    },
  });
});
