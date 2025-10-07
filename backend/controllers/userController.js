const User = require('../models/User');
const Complaint = require('../models/Complaint');
const SystemAlert = require('../models/SystemAlert');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get worker performance data for staff/admin dashboard
// @route   GET /api/users/workers/performance
// @access  Private (Staff, Admin)
exports.getWorkerPerformance = asyncHandler(async (req, res, next) => {
  let query = {};
  
  // If the user is a staff member, only show workers in their department
  if (req.user.role === 'staff' && req.user.department) {
    query.department = req.user.department;
  }
  
  const workers = await User.find({ role: 'worker', ...query }).select('name email department');

  const workerPerformanceData = await Promise.all(
    workers.map(async (worker) => {
      const assignedTasks = await Complaint.countDocuments({ workerId: worker._id });
      const completedTasks = await Complaint.countDocuments({ workerId: worker._id, status: 'Resolved' });
      const inProgressTasks = await Complaint.countDocuments({ workerId: worker._id, status: 'In Progress' });
      
      const efficiency = assignedTasks > 0 ? Math.round((completedTasks / assignedTasks) * 100) : 0;

      // In a real system, you would calculate this from the Feedback model
      const rating = 4.5; // Placeholder rating for now

      return {
        id: worker._id,
        name: worker.name,
        assignedTasks,
        completedTasks,
        inProgressTasks,
        efficiency,
        rating,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: workerPerformanceData.length,
    data: workerPerformanceData
  });
});

// @desc    Get department-specific alerts for staff dashboard
// @route   GET /api/users/department/alerts
// @access  Private (Staff, Admin)
exports.getDepartmentAlerts = asyncHandler(async (req, res, next) => {
  let alertQuery = {};
  
  // Staff members see alerts for their department and global alerts
  if (req.user.role === 'staff' && req.user.department) {
    alertQuery = {
      $or: [
        { department: req.user.department },
        { department: null } 
      ]
    };
  }
  
  // Admins see all alerts
  const systemAlerts = await SystemAlert.find({ isActive: true, ...alertQuery })
    .sort({ createdAt: -1 })
    .limit(5);

  const dynamicAlerts = [];
  
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  let overdueQuery = { createdAt: { $lt: threeDaysAgo }, status: { $in: ['Submitted', 'In Progress'] } };
  if (req.user.role === 'staff') {
    overdueQuery.department = req.user.department;
  }
    
  const overdueCount = await Complaint.countDocuments(overdueQuery);
  
  if (overdueCount > 0) {
    dynamicAlerts.push({
      id: `overdue-${Date.now()}`,
      type: 'warning',
      message: `${overdueCount} complaint(s) in your department are overdue.`,
      timestamp: new Date(),
    });
  }
  
  const allAlerts = [
    ...dynamicAlerts,
    ...systemAlerts.map(alert => ({
      id: alert._id,
      type: alert.type,
      message: alert.message,
      timestamp: alert.createdAt,
    }))
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.status(200).json({
    success: true,
    count: allAlerts.length,
    data: allAlerts
  });
});

