const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');
const SystemAlert = require('../models/SystemAlert');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new user (DepartmentStaff or Worker)
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, department, phone, address } = req.body;

  if (!['staff', 'worker', 'admin', 'citizen'].includes(role)) {
    return next(new ErrorResponse('Invalid role specified', 400));
  }
  
  if ((role === 'staff' || role === 'worker') && !department) {
    return next(new ErrorResponse('Please provide a department for staff or worker roles', 400));
  }

  const user = await User.create({
    name,
    email,
    phone,
    address,
    password,
    role,
    department: ['staff', 'worker'].includes(role) ? department : undefined,
  });

  // Do not send token back, admin is just creating a user
  user.password = undefined;

  res.status(201).json({
    success: true,
    data: user,
  });
});


// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const totalComplaints = await Complaint.countDocuments();

  const categoryCounts = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const statusCounts = await Complaint.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const departmentCounts = await Complaint.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } },
    {
      $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'departmentInfo',
      },
    },
    { $unwind: { path: '$departmentInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        name: { $ifNull: ['$departmentInfo.name', 'Unassigned'] },
        count: 1,
      },
    },
  ]);

  const resolvedComplaints = await Complaint.find({ status: 'Resolved' });
  let totalResolutionTime = 0;
  let resolvedCount = 0;

  resolvedComplaints.forEach(complaint => {
    if (complaint.createdAt && complaint.timeline && complaint.timeline.length > 0) {
      // Find the timeline event where status changed to "Resolved"
      const resolvedEvent = complaint.timeline.find(
        event => event.status === 'Resolved' || event.action === 'Resolved'
      );

      if (resolvedEvent && resolvedEvent.createdAt) {
        const resolutionTime = resolvedEvent.createdAt.getTime() - complaint.createdAt.getTime();
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    }
  });

  const avgResolutionTimeMs = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;
  const avgResolutionTimeDays = avgResolutionTimeMs / (1000 * 60 * 60 * 24);

  // Get worker performance by calculating from timeline
  const workerComplaints = await Complaint.find({
    status: 'Resolved',
    workerId: { $ne: null }
  }).populate('workerId', 'name');

  const workerStats = {};

  workerComplaints.forEach(complaint => {
    if (!complaint.workerId) return;

    const workerId = complaint.workerId._id.toString();

    if (!workerStats[workerId]) {
      workerStats[workerId] = {
        _id: complaint.workerId._id,
        worker: { name: complaint.workerId.name },
        resolvedCount: 0,
        totalResolutionTime: 0,
      };
    }

    // Find resolved event in timeline
    const resolvedEvent = complaint.timeline?.find(
      event => event.status === 'Resolved' || event.action === 'Resolved'
    );

    if (resolvedEvent && resolvedEvent.createdAt && complaint.createdAt) {
      const resolutionTime = resolvedEvent.createdAt.getTime() - complaint.createdAt.getTime();
      workerStats[workerId].totalResolutionTime += resolutionTime;
      workerStats[workerId].resolvedCount++;
    } else {
      // Fallback: count but don't add to time if no timeline
      workerStats[workerId].resolvedCount++;
    }
  });

  const workerPerformance = Object.values(workerStats).map(stat => ({
    _id: stat._id,
    worker: stat.worker,
    resolvedCount: stat.resolvedCount,
    avgResolutionTime: stat.resolvedCount > 0
      ? (stat.totalResolutionTime / stat.resolvedCount) / (1000 * 60 * 60 * 24)
      : 0,
  }));

  res.status(200).json({
    success: true,
    data: {
      totalComplaints,
      categoryCounts,
      statusCounts,
      departmentCounts,
      avgResolutionTime: avgResolutionTimeDays.toFixed(2),
      workerPerformance,
    },
  });
});

// @desc    Get all users (with optional filtering by role and department)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const query = {};
  if (req.query.role) {
    query.role = req.query.role;
  }
  if (req.query.department) {
    query.department = req.query.department;
  }

  const users = await User.find(query)
    .select('-password')
    .populate('department', 'name description');
    
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});


// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('department', 'name description');

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, phone, address, role, department, isActive } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Update fields if provided
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (role) user.role = role;
  if (department !== undefined) user.department = department;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Don't allow deleting yourself
  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('Cannot delete your own account', 400));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: {},
  });
});

// @desc    Bulk delete users
// @route   POST /api/admin/users/bulk-delete
// @access  Private/Admin
exports.bulkDeleteUsers = asyncHandler(async (req, res, next) => {
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return next(new ErrorResponse('Please provide an array of user IDs', 400));
  }

  // Don't allow deleting yourself
  if (userIds.includes(req.user.id)) {
    return next(new ErrorResponse('Cannot delete your own account', 400));
  }

  const result = await User.deleteMany({ _id: { $in: userIds } });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} user(s) deleted successfully`,
    data: { deletedCount: result.deletedCount },
  });
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const { period = 'thisMonth' } = req.query;
  
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
  
  const totalComplaints = await Complaint.countDocuments({ createdAt: { $gte: startDate } });
  
  const statusStats = await Complaint.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  const statusCounts = { submitted: 0, inProgress: 0, resolved: 0, closed: 0 };
  statusStats.forEach(stat => {
    const key = stat._id.charAt(0).toLowerCase() + stat._id.slice(1).replace(' ', '');
    if (key in statusCounts) statusCounts[key] = stat.count;
  });
  
  const totalUsers = await User.countDocuments();
  const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
  
  const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  
  const totalDepartments = await Department.countDocuments();
  
  const resolvedComplaints = await Complaint.find({ status: 'Resolved', createdAt: { $gte: startDate } });
  
  let avgResolutionTime = 0;
  if (resolvedComplaints.length > 0) {
    const totalTime = resolvedComplaints.reduce((total, c) => total + (c.updatedAt - c.createdAt), 0);
    avgResolutionTime = Math.round(totalTime / resolvedComplaints.length / (1000 * 60 * 60 * 24));
  }
  
  const activeWorkers = await User.countDocuments({ role: 'worker', isActive: true });
  
  res.status(200).json({
    success: true,
    data: {
      total: totalComplaints,
      resolved: statusCounts.resolved,
      pending: statusCounts.submitted + statusCounts.inProgress,
      ...statusCounts,
      totalUsers,
      totalDepartments,
      newUsers,
      avgResolutionTime,
      satisfactionRating: 4.2, // Placeholder
      activeWorkers,
      recentComplaints: totalComplaints,
      assignedWorkers: activeWorkers,
      resolutionRate: totalComplaints > 0 ? Math.round((statusCounts.resolved / totalComplaints) * 100) : 0,
      usersByRole
    }
  });
});

// @desc    Get recent complaints for dashboard
// @route   GET /api/admin/dashboard/recent-complaints
// @access  Private/Admin
exports.getRecentComplaints = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const recentComplaints = await Complaint.find()
    .populate('citizenId', 'name')
    .populate('department', 'name')
    .populate('workerId', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));
  
  const formattedComplaints = recentComplaints.map(c => ({
    id: c._id,
    title: c.title,
    category: c.category,
    status: c.status,
    priority: c.priority,
    citizen: c.citizenId ? c.citizenId.name : 'Unknown',
    department: c.department ? c.department.name : 'N/A',
    createdAt: c.createdAt,
  }));
  
  res.status(200).json({ success: true, count: formattedComplaints.length, data: formattedComplaints });
});

// @desc    Get department performance stats
// @route   GET /api/admin/dashboard/department-stats
// @access  Private/Admin
exports.getDepartmentStats = asyncHandler(async (req, res, next) => {
  const departmentStats = await Department.aggregate([
    { $lookup: { from: 'complaints', localField: '_id', foreignField: 'department', as: 'complaints' } },
    {
      $project: {
        name: 1,
        complaints: { $size: '$complaints' },
        resolved: { $size: { $filter: { input: '$complaints', as: 'c', cond: { $eq: ['$$c.status', 'Resolved'] } } } },
        pending: { $size: { $filter: { input: '$complaints', as: 'c', cond: { $in: ['$$c.status', ['Submitted', 'In Progress']] } } } }
      }
    },
    {
      $addFields: {
        efficiency: {
          $cond: [ { $gt: ['$complaints', 0] }, { $multiply: [ { $divide: ['$resolved', '$complaints'] }, 100 ] }, 0 ]
        }
      }
    },
    { $project: { name: 1, complaints: 1, resolved: 1, pending: 1, efficiency: { $round: ['$efficiency', 0] } } },
    { $sort: { complaints: -1 } }
  ]);
  
  res.status(200).json({ success: true, count: departmentStats.length, data: departmentStats });
});

// @desc    Get system alerts
// @route   GET /api/admin/dashboard/alerts
// @access  Private/Admin
exports.getSystemAlerts = asyncHandler(async (req, res, next) => {
  const alerts = await SystemAlert.find({
    isActive: true,
    targetRoles: { $in: ['admin'] },
    $or: [ { expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } } ]
  }).sort({ createdAt: -1 }).limit(10);
  
  res.status(200).json({ success: true, count: alerts.length, data: alerts });
});

// @desc    Create system alert
// @route   POST /api/admin/alerts
// @access  Private/Admin
exports.createSystemAlert = asyncHandler(async (req, res, next) => {
  const alert = await SystemAlert.create({ ...req.body, createdBy: req.user.id });
  res.status(201).json({ success: true, data: alert });
});

// @desc    Delete complaint
// @route   DELETE /api/admin/complaints/:id
// @access  Private/Admin
exports.deleteComplaint = asyncHandler(async (req, res, next) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return next(new ErrorResponse(`Complaint not found with id of ${req.params.id}`, 404));
  }

  await complaint.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Complaint deleted successfully',
    data: {},
  });
});

// @desc    Update complaint (admin override)
// @route   PUT /api/admin/complaints/:id
// @access  Private/Admin
exports.updateComplaint = asyncHandler(async (req, res, next) => {
  const { title, description, category, priority, status, department, workerId } = req.body;

  let complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return next(new ErrorResponse(`Complaint not found with id of ${req.params.id}`, 404));
  }

  // Admin can update any field
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (category !== undefined) updateData.category = category;
  if (priority !== undefined) updateData.priority = priority;
  if (status !== undefined) updateData.status = status;
  if (department !== undefined) updateData.department = department;
  if (workerId !== undefined) updateData.workerId = workerId;

  complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('citizenId', 'name email')
   .populate('department', 'name')
   .populate('workerId', 'name');

  res.status(200).json({
    success: true,
    data: complaint,
  });
});

// @desc    Bulk delete complaints
// @route   POST /api/admin/complaints/bulk-delete
// @access  Private/Admin
exports.bulkDeleteComplaints = asyncHandler(async (req, res, next) => {
  const { complaintIds } = req.body;

  if (!complaintIds || !Array.isArray(complaintIds) || complaintIds.length === 0) {
    return next(new ErrorResponse('Please provide an array of complaint IDs', 400));
  }

  const result = await Complaint.deleteMany({ _id: { $in: complaintIds } });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} complaint(s) deleted successfully`,
    data: { deletedCount: result.deletedCount },
  });
});

