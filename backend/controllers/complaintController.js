/**
 * Complaint Controller — Core CRUD and Status Management
 * 
 * Community features → communityController.js
 * Worker operations → workerComplaintController.js
 * Notification helpers → utils/notificationHelper.js
 */
const Complaint = require('../models/Complaint');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Chat = require('../models/Chat');
const { classifyComplaint, summarizeComplaint, getDepartmentByCategory } = require('../services/aiService');
const { sendComplaintUpdateEmail, sendWorkerAssignmentEmail } = require('../utils/emailService');
const User = require('../models/User');
const { createAndEmitNotification, broadcastToSupporters } = require('../utils/notificationHelper');

// Per-user filing rate limit: max 5 complaints per 24 hours.
const DAILY_FILING_LIMIT = 5;

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
exports.createComplaint = asyncHandler(async (req, res, next) => {
  const { title, description, category, location, department: userDepartment, priority, lng, lat } = req.body;
  if (!title || !description || !location) {
    return next(new ErrorResponse('Title, description, and location are required', 400));
  }

  // Rate limit: count complaints filed by this user in the last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await Complaint.countDocuments({
    citizenId: req.user.id,
    createdAt: { $gte: since },
  });
  if (recentCount >= DAILY_FILING_LIMIT) {
    return next(new ErrorResponse(
      `You have reached the limit of ${DAILY_FILING_LIMIT} complaints per day. Please try again after 24 hours.`,
      429
    ));
  }

  const classification = await classifyComplaint(title, description, category);

  // Get department by category if not provided by user
  let departmentId = userDepartment;
  if (!departmentId) {
    const finalCategory = classification.category || category;
    departmentId = await getDepartmentByCategory(finalCategory);
  }

  let locationData = {
    type: 'Point',
    address: location
  };

  if (lng && lat) {
    locationData.coordinates = [parseFloat(lng), parseFloat(lat)];
  }
  // Fix #17: No longer hardcoding Mumbai fallback — coordinates are optional

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

  // Generate AI summary (non-blocking — complaint still created without it)
  try {
    const summary = await summarizeComplaint(title, description, locationData.address, classification.category || category);
    if (summary) {
      newComplaintData.aiSummary = summary;
    }
  } catch (summaryError) {
    console.error('[AI Summary] Failed:', summaryError.message);
  }

  if (req.files && req.files.length > 0) {
    newComplaintData.attachments = req.files.map(file => ({ public_id: file.filename, url: file.path }));
  }

  const complaint = await Complaint.create(newComplaintData);

  // Auto-assign to department staff
  if (complaint.department) {
    try {
      const departmentStaff = await User.findOne({
        role: 'staff',
        department: complaint.department
      });

      if (departmentStaff) {
        complaint.departmentStaffId = departmentStaff._id;
        await complaint.save();

        await createAndEmitNotification(
          departmentStaff._id,
          'New Complaint Assigned',
          `A new complaint "${complaint.title}" has been assigned to your department.`,
          complaint._id
        );
      }
    } catch (assignError) {
      console.error('[Auto-assign] Failed to assign staff:', assignError.message);
    }
  }

  try {
    const chat = await Chat.create({ complaintId: complaint._id, citizenId: req.user.id });
    chat.messages.push({ sender: null, message: 'Welcome! A staff member will be with you shortly.' });
    await chat.save();
    complaint.chat = chat._id;
    await complaint.save();
  } catch (chatError) {
    console.error('[Chat] Failed to create chat for complaint:', chatError.message);
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

  // Authorization: citizen can only see their own complaints, staff sees department, worker sees assigned, admin sees all
  const isOwner = complaint.citizenId._id.toString() === req.user.id;
  const isStaff = req.user.role === 'staff' && complaint.department && req.user.department &&
    complaint.department._id.toString() === (req.user.department._id || req.user.department).toString();
  const isWorker = req.user.role === 'worker' && complaint.workerId && complaint.workerId._id.toString() === req.user.id;
  const isAdmin = req.user.role === 'admin';
  const isPublic = complaint.isPublic;

  if (!isOwner && !isStaff && !isWorker && !isAdmin && !isPublic) {
    return next(new ErrorResponse('Not authorized to view this complaint', 403));
  }

  res.status(200).json({ success: true, data: complaint });
});

// Valid state transitions — enforced to prevent illegal status jumps.
// NOTE: 'Transferred' is intentionally removed as a transition target.
// To route a complaint to another department, use PATCH /:id/assign instead.
const VALID_TRANSITIONS = {
  'Submitted':     ['Under Review', 'Rejected', 'In Progress'],
  'Under Review':  ['Needs Info', 'In Progress', 'Rejected'],
  'Needs Info':    ['Under Review', 'Rejected'],
  'In Progress':   ['Resolved', 'Under Review'],
  'Resolved':      ['Closed', 'Reopened'],
  'Reopened':      ['In Progress', 'Rejected'],
  'Transferred':   [],  // legacy terminal — kept for historical data only
  'Rejected':      [],  // terminal
  'Closed':        [],  // terminal
};

// @desc    Update complaint status
// @route   PATCH /api/complaints/:id/status
// @access  Private (Staff, Admin — and Citizen for Resolved→Closed/Reopened on own complaint)
exports.updateComplaintStatus = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason, notes } = req.body;

  let complaint = await Complaint.findById(req.params.id);
  if (!complaint) { return next(new ErrorResponse(`Complaint not found`, 404)); }

  const isCitizen = req.user.role === 'citizen';

  // --- Citizen guard: may only accept/dispute their own resolved complaint ---
  if (isCitizen) {
    const isOwner = complaint.citizenId.toString() === req.user.id;
    if (!isOwner) {
      return next(new ErrorResponse('Not authorized to update this complaint', 403));
    }
    // Citizens can only do Resolved → Closed (accept) or Resolved → Reopened (dispute)
    const citizenAllowed = ['Closed', 'Reopened'];
    if (complaint.status !== 'Resolved' || !citizenAllowed.includes(status)) {
      return next(new ErrorResponse(
        'You can only accept (Close) or dispute (Reopen) a resolved complaint.',
        403
      ));
    }
  }

  // Validate the state transition
  const allowedNext = VALID_TRANSITIONS[complaint.status] || [];
  if (!allowedNext.includes(status)) {
    return next(new ErrorResponse(
      `Cannot transition from "${complaint.status}" to "${status}". Allowed: ${allowedNext.join(', ') || 'none (terminal state)'}`,
      400
    ));
  }

  // Rejection requires a reason
  if (status === 'Rejected') {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      return next(new ErrorResponse('A rejection reason (min 10 characters) is required when rejecting a complaint', 400));
    }
    complaint.rejectionReason = rejectionReason.trim();
  }

  const timelineNote = notes?.trim() ||
    (status === 'Rejected' ? `Rejected: ${rejectionReason}` :
     status === 'Closed'   ? `Accepted and closed by citizen.` :
     status === 'Reopened' ? `Citizen disputed the resolution. Reopened for review.` :
     `Status changed to ${status} by ${req.user.role}.`);

  complaint.timeline.push({
    action: status,
    status,
    notes: timelineNote,
    updatedBy: req.user.id,
  });
  complaint.status = status;
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

exports.getUserStats = asyncHandler(async (req, res, next) => {
  let query = {};

  if (req.user.role === 'citizen') {
    query = { citizenId: req.user.id };
  } else if (req.user.role === 'staff') {
    query = { department: req.user.department?._id || req.user.department };
  } else if (req.user.role === 'worker') {
    query = { workerId: req.user.id };
  }

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
  const { departmentId } = req.body;
  if (!departmentId) {
    return next(new ErrorResponse('departmentId is required', 400));
  }

  let complaint = await Complaint.findById(req.params.id);
  if (!complaint) { return next(new ErrorResponse('Complaint not found', 404)); }

  complaint.department = departmentId;
  complaint.timeline.push({
    action: 'Department Assigned',
    status: complaint.status,
    notes: `Complaint assigned to department by admin.`,
    updatedBy: req.user.id,
  });
  await complaint.save();

  // Auto-assign a staff member from the new department
  const departmentStaff = await User.findOne({ role: 'staff', department: departmentId });
  if (departmentStaff) {
    complaint.departmentStaffId = departmentStaff._id;
    await complaint.save();
    await createAndEmitNotification(departmentStaff._id, 'New Complaint Assigned', `Complaint "${complaint.title}" has been assigned to your department.`, complaint._id);
  }

  await broadcastToSupporters(complaint, 'Department Assigned', `Your complaint "${complaint.title}" has been assigned to a department.`);

  res.status(200).json({ success: true, data: complaint });
});

exports.getRecentComplaints = asyncHandler(async (req, res, next) => {
  let query = {};
  if (req.user.role === 'staff') {
    query.department = req.user.department?._id || req.user.department;
  } else if (req.user.role === 'worker') {
    query.workerId = req.user.id;
  }

  const complaints = await Complaint.find(query)
    .populate('citizenId', 'name email')
    .populate('department', 'name')
    .sort({ createdAt: -1 })
    .limit(5);
  res.status(200).json({ success: true, data: complaints });
});

// @desc    Get public stats for landing page hero
// @route   GET /api/complaints/public-stats
// @access  Public
// Fix #16: Moved from inline route handler to controller for consistent error handling
exports.getPublicStats = asyncHandler(async (req, res, next) => {
  const [total, resolved, inProgress] = await Promise.all([
    Complaint.countDocuments({ isPublic: true }),
    Complaint.countDocuments({ isPublic: true, status: 'Resolved' }),
    Complaint.countDocuments({ isPublic: true, status: 'In Progress' }),
  ]);
  res.json({ success: true, data: { total, resolved, inProgress } });
});

// @desc    Soft-delete a complaint (Admin/Staff)
// @route   DELETE /api/complaints/:id
// @access  Private (Admin, Staff)
exports.deleteComplaint = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;
  
  let complaint = await Complaint.findById(req.params.id);
  if (!complaint) { return next(new ErrorResponse(`Complaint not found`, 404)); }

  // Staff can only delete within their department
  if (req.user.role === 'staff') {
    if (!complaint.department || complaint.department.toString() !== (req.user.department?._id || req.user.department).toString()) {
      return next(new ErrorResponse('Not authorized to delete this complaint', 403));
    }
  }

  // Soft Delete Logic (Move to Public Audit Log)
  const status = 'Rejected';
  const rejectionReason = reason || 'Violation of Platform Policies';

  complaint.timeline.push({
    action: 'Rejected',
    status,
    notes: `Removed to Audit Log by ${req.user.role}: ${rejectionReason}`,
    updatedBy: req.user.id,
  });

  complaint.status = status;
  complaint.rejectionReason = rejectionReason;
  // Note: We leave isPublic: true so it stays in the Audit Log, but drops from Active Feed
  await complaint.save();

  // Notify Citizen
  await createAndEmitNotification(complaint.citizenId, 'Complaint Rejected', `Your complaint "${complaint.title}" has been rejected. Reason: ${rejectionReason}. You may appeal this decision once.`, complaint._id);

  res.status(200).json({ success: true, data: complaint });
});

// @desc    Citizen appeals a rejected complaint (One-Time Dispute)
// @route   POST /api/complaints/:id/appeal
// @access  Private (Citizen)
exports.appealComplaint = asyncHandler(async (req, res, next) => {
  const { reason = 'Citizen disagreed with the rejection and initiated a dispute.' } = req.body;

  let complaint = await Complaint.findById(req.params.id);
  if (!complaint) { return next(new ErrorResponse(`Complaint not found`, 404)); }

  // Must be owner
  if (complaint.citizenId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to appeal this complaint', 403));
  }

  // Must be rejected/closed
  if (!['Rejected', 'Closed'].includes(complaint.status)) {
    return next(new ErrorResponse('You can only appeal rejected or closed complaints', 400));
  }

  // One-time appeal check
  if (complaint.isAppealed) {
    return next(new ErrorResponse('This complaint has already been appealed once. The final decision stands.', 400));
  }

  // Appeal Logic
  complaint.status = 'Under Review';
  complaint.isAppealed = true;

  complaint.timeline.push({
    action: 'Under Review',
    status: 'Under Review',
    notes: `APPEAL FILED: ${reason}`,
    updatedBy: req.user.id,
  });

  await complaint.save();

  // Notify Staff/Admin
  if (complaint.departmentStaffId) {
    await createAndEmitNotification(complaint.departmentStaffId, 'Appeal Filed', `Citizen appealed the rejection of "${complaint.title}".`, complaint._id);
  }

  res.status(200).json({ success: true, data: complaint });
});

// ============================================================
// Re-export split controllers for backward-compatible imports
// ============================================================
const communityController = require('./communityController');
const workerComplaintController = require('./workerComplaintController');

// Community features
exports.getPublicComplaints = communityController.getPublicComplaints;
exports.getNearbyComplaints = communityController.getNearbyComplaints;
exports.checkSimilarComplaints = communityController.checkSimilarComplaints;
exports.upvoteComplaint = communityController.upvoteComplaint;
exports.removeUpvote = communityController.removeUpvote;

// Worker features
exports.updateComplaintByWorker = workerComplaintController.updateComplaintByWorker;
exports.updateComplaintTimeline = workerComplaintController.updateComplaintTimeline;
exports.getWorkerReports = workerComplaintController.getWorkerReports;

