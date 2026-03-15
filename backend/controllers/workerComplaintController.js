const Complaint = require('../models/Complaint');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const { broadcastToSupporters } = require('../utils/notificationHelper');
const { sendComplaintUpdateEmail } = require('../utils/emailService');

// @desc    Update complaint by Worker (progress update or mark resolved)
// @route   PUT /api/complaints/:id/worker-update
// @route   PUT /api/complaints/:id/timeline (alias — same handler)
// @access  Private (Worker)
exports.updateComplaintByWorker = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;
  let complaint = await Complaint.findById(req.params.id);
  if (!complaint) { return next(new ErrorResponse(`Complaint not found`, 404)); }
  if (complaint.workerId?.toString() !== req.user.id) {
    return next(new ErrorResponse('You are not authorized to update this complaint', 403));
  }

  // State machine guard: workers can only interact with In Progress complaints.
  if (complaint.status !== 'In Progress') {
    return next(new ErrorResponse(
      `Cannot add updates to a complaint in "${complaint.status}" status. Workers can only update In Progress complaints.`,
      400
    ));
  }

  // Workers can only change status to Resolved.
  if (status && status !== 'Resolved') {
    return next(new ErrorResponse(
      `Workers can only change status to "Resolved". Other status changes must be made by staff.`,
      400
    ));
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

// Alias — routes can use either /timeline or /worker-update
exports.updateComplaintTimeline = exports.updateComplaintByWorker;

// @desc    Get detailed worker performance report
// @route   GET /api/complaints/worker-reports
// @access  Private (Worker)
// Fix #9: Uses MongoDB aggregation pipeline instead of 6 sequential queries
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
        const resolvedDate = new Date(resolved.createdAt);
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

  // Fix #9: Monthly trend uses aggregation pipeline instead of 6 sequential queries
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthlyTrendAgg = await Complaint.aggregate([
    {
      $match: {
        workerId: require('mongoose').Types.ObjectId.createFromHexString(workerId),
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // Build monthly trend with all 6 months (fill gaps with zeros)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth() + 1; // MongoDB $month is 1-indexed
    const aggEntry = monthlyTrendAgg.find(e => e._id.year === year && e._id.month === month);

    const total = aggEntry ? aggEntry.total : 0;
    const completed = aggEntry ? aggEntry.completed : 0;

    monthlyTrend.push({
      month: monthDate.toLocaleString('en-US', { month: 'short' }),
      completed,
      total,
      efficiency: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  }

  // Get recent tasks with details
  const recentTasks = allComplaints.slice(0, 10).map(c => {
    const createdDate = new Date(c.createdAt);
    const resolvedEntry = c.timeline?.find(t => t.status === 'Resolved');
    let completionTime = 'N/A';

    if (resolvedEntry) {
      const resolvedDate = new Date(resolvedEntry.createdAt);
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
