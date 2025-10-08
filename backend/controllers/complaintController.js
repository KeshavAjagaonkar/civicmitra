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
  await createAndEmitNotification(complaint.citizenId, 'Worker Assigned', `A worker is now assigned to your complaint: "${complaint.title}".`, complaint._id);

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

    // Notify citizen
    await createAndEmitNotification(complaint.citizenId, 'Complaint Updated', `Your complaint "${complaint.title}" has been updated.`, complaint._id);
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

