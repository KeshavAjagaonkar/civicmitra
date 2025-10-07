const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Chat = require('../models/Chat');
const { getSocketIO } = require('../utils/socket');
const { classifyComplaint } = require('../services/aiService');

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
    console.error(`Failed to create notification for user ${userId}:`, error);
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
exports.createComplaint = asyncHandler(async (req, res, next) => {
  const { title, description, category, location, department: userDepartment, priority } = req.body;
  if (!title || !description || !location) {
    return next(new ErrorResponse('Title, description, and location are required', 400));
  }

  const classification = await classifyComplaint(title, description, category);
  
  const newComplaintData = {
    title,
    description,
    category: classification.category || category,
    department: userDepartment || classification.department,
    priority: priority || classification.priority || 'Medium',
    location,
    citizenId: req.user.id,
    aiClassification: {
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      aiClassified: classification.aiClassified,
      originalCategory: category,
    },
    timeline: [{ action: 'Complaint Submitted', status: 'Submitted', updatedBy: req.user.id }],
  };

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
      console.error('Failed to auto-assign to staff:', assignError);
    }
  }

  try {
    const chat = await Chat.create({ complaintId: complaint._id, citizenId: req.user.id });
    chat.messages.push({ sender: null, message: 'Welcome! A staff member will be with you shortly.' });
    await chat.save();
    complaint.chat = chat._id;
    await complaint.save();
  } catch (chatError) {
    console.error('Failed to create chat:', chatError);
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

  await createAndEmitNotification(complaint.citizenId, 'Status Updated', `Your complaint "${complaint.title}" is now "${complaint.status}".`, complaint._id);

  res.status(200).json({ success: true, data: complaint });
});

// @desc    Assign worker to a complaint by Staff/Admin
// @route   PATCH /api/complaints/:id/assign-worker
// @access  Private (Staff, Admin)
exports.assignWorkerToComplaint = asyncHandler(async (req, res, next) => {
  const { workerId } = req.body;
  let complaint = await Complaint.findById(req.params.id);
  if (!complaint) { return next(new ErrorResponse(`Complaint not found`, 404)); }

  complaint.workerId = workerId;
  if (complaint.status === 'Submitted') {
    complaint.status = 'In Progress';
  }
  complaint.timeline.push({
    action: 'Assigned to Worker',
    status: complaint.status,
    notes: `Assigned to a field worker by ${req.user.name}.`,
    updatedBy: req.user.id,
  });
  await complaint.save();

  await createAndEmitNotification(workerId, 'New Task Assigned', `You have been assigned: "${complaint.title}".`, complaint._id);
  await createAndEmitNotification(complaint.citizenId, 'Worker Assigned', `A worker is now assigned to your complaint: "${complaint.title}".`, complaint._id);

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
  
  complaint.timeline.push({
    action: status === 'Resolved' ? 'Resolved' : 'Update',
    status: status || complaint.status,
    notes: notes || 'Worker provided an update.',
    updatedBy: req.user.id,
  });
  
  await complaint.save();

  await createAndEmitNotification(complaint.citizenId, 'Progress Update', `An update was posted for your complaint: "${complaint.title}".`, complaint._id);

  await complaint.populate('citizenId workerId timeline.updatedBy', 'name email role');
  
  res.status(200).json({ success: true, data: complaint });
});

// --- Other functions that might have been deleted ---
// These are just placeholders to ensure routes don't crash.
// We should verify if more specific logic is needed.

exports.getUserStats = asyncHandler(async(req, res, next) => {
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

