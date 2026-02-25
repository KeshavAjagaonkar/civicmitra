const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Chat = require('../models/Chat');
const { getSocketIO } = require('../utils/socket');
const { classifyComplaint, summarizeComplaint, getDepartmentByCategory } = require('../services/aiService');
const { sendComplaintUpdateEmail, sendWorkerAssignmentEmail } = require('../utils/emailService');
const User = require('../models/User');
const { calculateCommunityPriority } = require('../utils/communityPriority');
const { findSimilarWithAI, findSimilarWithKeywords } = require('../utils/duplicateDetection');

// A helper function to create and emit notifications
const createAndEmitNotification = async (userId, title, message, complaintId) => {
  if (!userId) return;
  try {
    const notification = await Notification.create({ userId, title, message, complaintId });
    const io = getSocketIO();
    if (io) {
      io.to(userId.toString()).emit('new_notification', notification);
    }
  } catch (error) {
    // Notification creation failed silently — non-critical
  }
};

// Broadcast a notification to the original filer AND all supporters of a complaint
const broadcastToSupporters = async (complaint, title, message) => {
  // Notify original filer
  await createAndEmitNotification(complaint.citizenId, title, message, complaint._id);

  // Notify all supporters (skip if same as the filer)
  if (complaint.upvotes && complaint.upvotes.supporters) {
    for (const supporter of complaint.upvotes.supporters) {
      if (supporter.userId.toString() !== complaint.citizenId.toString()) {
        await createAndEmitNotification(supporter.userId, title, message, complaint._id);
      }
    }
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
exports.createComplaint = asyncHandler(async (req, res, next) => {
  const { title, description, category, location, department: userDepartment, priority, lng, lat } = req.body;
  if (!title || !description || !location) {
    return next(new ErrorResponse('Title, description, and location are required', 400));
  }

  const classification = await classifyComplaint(title, description, category);

  // Get department by category if not provided by user
  let departmentId = userDepartment;
  if (!departmentId) {
    const finalCategory = classification.category || category;
    departmentId = await getDepartmentByCategory(finalCategory);
    // Department auto-assigned based on category
  }

  let locationData = {
    type: 'Point',
    address: location
  };
  
  if (lng && lat) {
    locationData.coordinates = [parseFloat(lng), parseFloat(lat)];
  } else {
    locationData.coordinates = [72.8777, 19.0760]; // fallback to Mumbai if not provided
  }

  const newComplaintData = {
    title,
    description,
    category: classification.category || category,
    department: departmentId,
    priority: priority || classification.priority || 'Medium',
    location: locationData,
    citizenId: req.user.id,
    aiClassification: {
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      aiClassified: classification.aiClassified,
      originalCategory: category,
    },
    timeline: [{ action: 'Complaint Submitted', status: 'Submitted', updatedBy: req.user.id }],
  };

  // Generate AI summary (runs in background, doesn't block complaint creation)
  try {
    const summary = await summarizeComplaint(title, description, location, classification.category || category);
    if (summary) {
      newComplaintData.aiSummary = summary;
    }
  } catch (summaryError) {
    // AI Summary generation failed — complaint will still be created without it
  }

  if (req.files && req.files.length > 0) {
    newComplaintData.attachments = req.files.map(file => ({ public_id: file.filename, url: file.path }));
  }

  const complaint = await Complaint.create(newComplaintData);

  // Auto-assign to department staff
  if (complaint.department) {
    try {
      const User = require('../models/User');
      const departmentStaff = await User.findOne({
        role: 'staff',
        department: complaint.department
      });

      if (departmentStaff) {
        complaint.staffId = departmentStaff._id;
        await complaint.save();

        // Notify staff about new complaint
        await createAndEmitNotification(
          departmentStaff._id,
          'New Complaint Assigned',
          `A new complaint "${complaint.title}" has been assigned to your department.`,
          complaint._id
        );
      }
    } catch (assignError) {
      // Auto-assign to staff failed — complaint still created
    }
  }

  try {
    const chat = await Chat.create({ complaintId: complaint._id, citizenId: req.user.id });
    chat.messages.push({ sender: null, message: 'Welcome! A staff member will be with you shortly.' });
    await chat.save();
    complaint.chat = chat._id;
    await complaint.save();
  } catch (chatError) {
    // Chat creation failed — complaint still created
  }

  res.status(201).json({ success: true, data: complaint });
});

// @desc    Get all complaints for the logged-in user (for Citizens)
// @route   GET /api/complaints/my
// @access  Private
exports.getMyComplaints = asyncHandler(async (req, res, next) => {
  const complaints = await Complaint.find({ citizenId: req.user.id })
    .populate('department', 'name')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: complaints.length, data: complaints });
});

// @desc    Get all complaints (for Admin, Staff, Worker with role-based filtering)
// @route   GET /api/complaints/all
// @access  Private (Admin, Staff, Worker)
exports.listComplaints = asyncHandler(async (req, res, next) => {
  let query = {};
  if (req.user.role === 'staff') {
    query = { department: req.user.department };
  } else if (req.user.role === 'worker') {
    query = { workerId: req.user.id };
  }
  // Admins have an empty query, so they get all complaints.

  const complaints = await Complaint.find(query)
    .populate('citizenId', 'name email')
    .populate('department', 'name')
    .populate('workerId', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: complaints.length, data: complaints });
});

// @desc    Get a single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaintById = asyncHandler(async (req, res, next) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('citizenId', 'name email phone')
    .populate('department', 'name')
    .populate('workerId', 'name email')
    .populate('timeline.updatedBy', 'name role');

  if (!complaint) {
    return next(new ErrorResponse(`Complaint not found with id of ${req.params.id}`, 404));
  }

  // Authorization check could be added here if needed
  res.status(200).json({ success: true, data: complaint });
});

// @desc    Update complaint status by Staff/Admin
// @route   PATCH /api/complaints/:id/status
// @access  Private (Staff, Admin)
exports.updateComplaintStatus = asyncHandler(async (req, res, next) => {
  let complaint = await Complaint.findById(req.params.id);
  if (!complaint) { return next(new ErrorResponse(`Complaint not found`, 404)); }

  complaint.timeline.push({
    action: 'Status Update',
    status: req.body.status,
    notes: `Status changed to ${req.body.status} by ${req.user.role}.`,
    updatedBy: req.user.id,
  });
  complaint.status = req.body.status;
  await complaint.save();

  await broadcastToSupporters(complaint, 'Status Updated', `Complaint "${complaint.title}" is now "${complaint.status}".`);

  // Send email notification to citizen
  const citizen = await User.findById(complaint.citizenId);
  if (citizen) {
    await sendComplaintUpdateEmail(
      citizen,
      complaint,
      `Your complaint status has been updated to "${complaint.status}".`
    );
  }

  res.status(200).json({ success: true, data: complaint });
});

// @desc    Assign worker to a complaint by Staff/Admin
// @route   PATCH /api/complaints/:id/assign-worker
// @access  Private (Staff, Admin)
exports.assignWorkerToComplaint = asyncHandler(async (req, res, next) => {
  const { workerId, deadline } = req.body;
  let complaint = await Complaint.findById(req.params.id);
  if (!complaint) { return next(new ErrorResponse(`Complaint not found`, 404)); }

  complaint.workerId = workerId;
  if (deadline) {
    complaint.deadline = deadline;
  }
  if (complaint.status === 'Submitted') {
    complaint.status = 'In Progress';
  }
  complaint.timeline.push({
    action: 'Assigned to Worker',
    status: complaint.status,
    notes: `Assigned to a field worker by ${req.user.name}.${deadline ? ` Deadline: ${new Date(deadline).toLocaleDateString()}` : ''}`,
    updatedBy: req.user.id,
  });
  await complaint.save();

  await createAndEmitNotification(workerId, 'New Task Assigned', `You have been assigned: "${complaint.title}".${deadline ? ` Deadline: ${new Date(deadline).toLocaleDateString()}` : ''}`, complaint._id);
  await broadcastToSupporters(complaint, 'Worker Assigned', `A worker is now assigned to complaint: "${complaint.title}".`);

  // Send email notifications
  const citizen = await User.findById(complaint.citizenId);
  const worker = await User.findById(workerId);
  if (citizen && worker) {
    await sendWorkerAssignmentEmail(citizen, complaint, worker);
  }

  res.status(200).json({ success: true, data: complaint });
});

// @desc    Update deadline and/or reassign worker by Staff/Admin
// @route   PATCH /api/complaints/:id/update-assignment
// @access  Private (Staff, Admin)
exports.updateAssignment = asyncHandler(async (req, res, next) => {
  const { workerId, deadline } = req.body;
  let complaint = await Complaint.findById(req.params.id);
  if (!complaint) { return next(new ErrorResponse(`Complaint not found`, 404)); }

  const updates = [];

  if (workerId && workerId !== complaint.workerId?.toString()) {
    const oldWorkerId = complaint.workerId;
    complaint.workerId = workerId;
    updates.push(`Reassigned to a different worker`);

    // Notify new worker
    await createAndEmitNotification(workerId, 'New Task Assigned', `You have been assigned: "${complaint.title}".`, complaint._id);

    // Notify old worker if exists
    if (oldWorkerId) {
      await createAndEmitNotification(oldWorkerId, 'Task Reassigned', `The complaint "${complaint.title}" has been reassigned to another worker.`, complaint._id);
    }
  }

  if (deadline) {
    const oldDeadline = complaint.deadline;
    complaint.deadline = deadline;
    if (oldDeadline) {
      updates.push(`Deadline updated to ${new Date(deadline).toLocaleDateString()}`);
    } else {
      updates.push(`Deadline set to ${new Date(deadline).toLocaleDateString()}`);
    }

    // Notify worker about deadline change
    if (complaint.workerId) {
      await createAndEmitNotification(complaint.workerId, 'Deadline Updated', `Deadline for "${complaint.title}" has been updated to ${new Date(deadline).toLocaleDateString()}.`, complaint._id);
    }
  }

  if (updates.length > 0) {
    complaint.timeline.push({
      action: 'Update',
      status: complaint.status,
      notes: updates.join('. ') + `. Updated by ${req.user.name}.`,
      updatedBy: req.user.id,
    });
    await complaint.save();

    await broadcastToSupporters(complaint, 'Complaint Updated', `Complaint "${complaint.title}" has been updated.`);
  }

  res.status(200).json({ success: true, data: complaint });
});

// @desc    Update complaint timeline by Worker
// @route   PUT /api/complaints/:id/worker-update
// @access  Private (Worker)
exports.updateComplaintByWorker = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;
  let complaint = await Complaint.findById(req.params.id);
  if (!complaint) { return next(new ErrorResponse(`Complaint not found`, 404)); }
  if (complaint.workerId?.toString() !== req.user.id) {
    return next(new ErrorResponse('You are not authorized to update this complaint', 403));
  }

  if (status) complaint.status = status;

  // Handle uploaded attachments
  const attachments = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      if (file.path) {
        // Cloudinary upload
        attachments.push({
          public_id: file.filename,
          url: file.path,
        });
      } else if (file.filename) {
        // Local storage
        attachments.push({
          public_id: file.filename,
          url: `/uploads/${file.filename}`,
        });
      }
    }
  }

  complaint.timeline.push({
    action: status === 'Resolved' ? 'Resolved' : 'Update',
    status: status || complaint.status,
    notes: notes || 'Worker provided an update.',
    updatedBy: req.user.id,
    attachments: attachments,
  });

  await complaint.save();

  await broadcastToSupporters(complaint, 'Progress Update', `An update was posted for complaint: "${complaint.title}".`);

  // Send email notification to citizen about worker update
  const citizen = await User.findById(complaint.citizenId);
  if (citizen) {
    const updateMessage = status === 'Resolved'
      ? `Great news! Your complaint has been resolved by the assigned worker.`
      : `Your complaint has been updated by the assigned worker.`;
    await sendComplaintUpdateEmail(citizen, complaint, updateMessage);
  }

  await complaint.populate('citizenId workerId timeline.updatedBy', 'name email role');

  res.status(200).json({ success: true, data: complaint });
});

// --- Other functions that might have been deleted ---
// These are just placeholders to ensure routes don't crash.
// We should verify if more specific logic is needed.

exports.getUserStats = asyncHandler(async (req, res, next) => {
  let query = {};

  // Build query based on user role
  if (req.user.role === 'citizen') {
    query = { citizenId: req.user.id };
  } else if (req.user.role === 'staff') {
    query = { department: req.user.department?._id || req.user.department };
  } else if (req.user.role === 'worker') {
    query = { workerId: req.user.id };
  }
  // Admin gets all complaints (empty query)

  const total = await Complaint.countDocuments(query);
  const resolved = await Complaint.countDocuments({ ...query, status: 'Resolved' });
  const pending = await Complaint.countDocuments({ ...query, status: { $in: ['Submitted', 'In Progress'] } });
  const submitted = await Complaint.countDocuments({ ...query, status: 'Submitted' });
  const inProgress = await Complaint.countDocuments({ ...query, status: 'In Progress' });

  res.status(200).json({
    success: true,
    data: {
      total,
      resolved,
      pending,
      submitted,
      inProgress,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
    }
  });
});

exports.assignComplaint = asyncHandler(async (req, res, next) => {
  // This is likely an admin function to assign a complaint to a department.
  // Placeholder logic:
  res.status(200).json({ success: true, message: "assignComplaint not fully implemented yet." });
});

exports.updateComplaintTimeline = asyncHandler(async (req, res, next) => {
  // This is redundant with updateComplaintByWorker, but we keep it to prevent crashes.
  // We should consolidate this logic later.
  return exports.updateComplaintByWorker(req, res, next);
});

exports.getRecentComplaints = asyncHandler(async (req, res, next) => {
  // Logic for staff/admin to get recent complaints in their scope.
  let query = {};
  if (req.user.role === 'staff') {
    query.department = req.user.department?._id || req.user.department;
  } else if (req.user.role === 'worker') {
    query.workerId = req.user.id;
  }
  // Admin gets all complaints (empty query)

  const complaints = await Complaint.find(query)
    .populate('citizenId', 'name email')
    .populate('department', 'name')
    .sort({ createdAt: -1 })
    .limit(5);
  res.status(200).json({ success: true, data: complaints });
});

// @desc    Get detailed worker performance report
// @route   GET /api/complaints/worker-reports
// @access  Private (Worker)
exports.getWorkerReports = asyncHandler(async (req, res, next) => {
  const workerId = req.user.id;
  const { period = 'thisMonth', category = 'all' } = req.query;

  // Calculate date range based on period
  const now = new Date();
  let startDate;

  switch (period) {
    case 'thisMonth':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'lastMonth':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    case 'thisYear':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Build query
  let query = { workerId };
  if (period === 'lastMonth') {
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    query.createdAt = { $gte: startDate, $lte: lastMonthEnd };
  } else {
    query.createdAt = { $gte: startDate };
  }

  if (category !== 'all') {
    query.category = category;
  }

  // Get all complaints for the worker in the period
  const allComplaints = await Complaint.find(query)
    .populate('citizenId', 'name email')
    .populate('department', 'name')
    .populate('workerId', 'name email')
    .sort({ createdAt: -1 });

  // Calculate statistics
  const totalTasks = allComplaints.length;
  const completedTasks = allComplaints.filter(c => c.status === 'Resolved').length;
  const inProgressTasks = allComplaints.filter(c => c.status === 'In Progress').length;
  const overdueTasks = allComplaints.filter(c =>
    c.deadline && new Date(c.deadline) < now && c.status !== 'Resolved'
  ).length;

  // Calculate average completion time (for resolved complaints)
  const resolvedComplaints = allComplaints.filter(c => c.status === 'Resolved');
  let averageCompletionTime = 'N/A';
  if (resolvedComplaints.length > 0) {
    const totalDays = resolvedComplaints.reduce((sum, c) => {
      const created = new Date(c.createdAt);
      const resolved = c.timeline?.find(t => t.status === 'Resolved');
      if (resolved) {
        const resolvedDate = new Date(resolved.date);
        const days = (resolvedDate - created) / (1000 * 60 * 60 * 24);
        return sum + days;
      }
      return sum;
    }, 0);
    const avgDays = (totalDays / resolvedComplaints.length).toFixed(1);
    averageCompletionTime = `${avgDays} days`;
  }

  // Calculate efficiency (completion rate)
  const efficiency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate average rating (from feedback)
  const ratedComplaints = allComplaints.filter(c => c.feedback && c.feedback.rating);
  const averageRating = ratedComplaints.length > 0
    ? (ratedComplaints.reduce((sum, c) => sum + c.feedback.rating, 0) / ratedComplaints.length).toFixed(1)
    : 0;

  // Get category breakdown
  const categoryBreakdown = {};
  allComplaints.forEach(c => {
    if (!categoryBreakdown[c.category]) {
      categoryBreakdown[c.category] = { total: 0, completed: 0 };
    }
    categoryBreakdown[c.category].total++;
    if (c.status === 'Resolved') {
      categoryBreakdown[c.category].completed++;
    }
  });

  const taskBreakdown = Object.keys(categoryBreakdown).map(cat => ({
    category: cat,
    total: categoryBreakdown[cat].total,
    completed: categoryBreakdown[cat].completed,
    percentage: categoryBreakdown[cat].total > 0
      ? Math.round((categoryBreakdown[cat].completed / categoryBreakdown[cat].total) * 100)
      : 0
  }));

  // Get monthly trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

    const monthComplaints = await Complaint.find({
      workerId,
      createdAt: { $gte: monthStart, $lte: monthEnd }
    });

    const monthCompleted = monthComplaints.filter(c => c.status === 'Resolved').length;
    const monthTotal = monthComplaints.length;
    const monthEfficiency = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0;

    monthlyTrend.push({
      month: monthStart.toLocaleString('en-US', { month: 'short' }),
      completed: monthCompleted,
      total: monthTotal,
      efficiency: monthEfficiency
    });
  }

  // Get recent tasks with details
  const recentTasks = allComplaints.slice(0, 10).map(c => {
    const createdDate = new Date(c.createdAt);
    const resolvedEntry = c.timeline?.find(t => t.status === 'Resolved');
    let completionTime = 'N/A';

    if (resolvedEntry) {
      const resolvedDate = new Date(resolvedEntry.date);
      const days = ((resolvedDate - createdDate) / (1000 * 60 * 60 * 24)).toFixed(1);
      completionTime = `${days} days`;
    } else if (c.status === 'In Progress') {
      const currentDays = ((now - createdDate) / (1000 * 60 * 60 * 24)).toFixed(1);
      completionTime = `${currentDays} days`;
    }

    return {
      id: c._id,
      title: c.title,
      category: c.category,
      status: c.status,
      completionTime,
      rating: c.feedback?.rating || null,
      date: c.createdAt
    };
  });

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        averageCompletionTime,
        efficiency,
        rating: parseFloat(averageRating)
      },
      taskBreakdown,
      monthlyTrend,
      recentTasks
    }
  });
});

// ============================================================
// COMMUNITY FEATURES — Public Feed, Upvotes
// ============================================================

// @desc    Get nearby public complaints
// @route   GET /api/complaints/nearby
// @access  Private
exports.getNearbyComplaints = asyncHandler(async (req, res, next) => {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng);
  const radius = parseInt(req.query.radius, 10) || 2000;

  if (!lat || !lng) {
    return next(new ErrorResponse('Please provide lat and lng coordinates', 400));
  }

  const complaints = await Complaint.find({
    isPublic: true,
    'location.coordinates': {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: radius,
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

  // 1. Find candidates (Active complaints in the same category)
  // If coordinates are provided, we could narrow this down geographically, 
  // but for now let's just grab recent active ones in the category to pass to the AI.
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
    // 2. Try Gemini first
    matches = await findSimilarWithAI(title, description, candidates);
  } catch (error) {
    // 3. Fallback to keywords if Gemini fails or times out
    matches = await findSimilarWithKeywords(title, description, candidates);
  }

  res.status(200).json({
    success: true,
    matches: matches
  });
});

// @desc    Get public complaints feed (sorted by community priority)
// @route   GET /api/complaints/public
// @access  Private (any authenticated user)
exports.getPublicComplaints = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = { isPublic: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.status) filter.status = req.query.status;

  // Build sort
  let sort = { 'communityPriority.score': -1 }; // Default: highest priority first
  if (req.query.sort === 'newest') sort = { createdAt: -1 };
  if (req.query.sort === 'oldest') sort = { createdAt: 1 };
  if (req.query.sort === 'most-upvoted') sort = { 'upvotes.count': -1 };

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .select('-upvotes.supporters') // Privacy: don't expose who supported what
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

