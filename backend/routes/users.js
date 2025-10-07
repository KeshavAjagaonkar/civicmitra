const express = require('express');
const router = express.Router();
const {
  getWorkerPerformance,
  getDepartmentAlerts
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// @desc    Get worker performance data for staff/admin dashboard
// @route   GET /api/users/workers/performance
router.route('/workers/performance').get(protect, authorize('staff', 'admin'), getWorkerPerformance);

// @desc    Get department-specific alerts for staff dashboard
// @route   GET /api/users/department/alerts
router.route('/department/alerts').get(protect, authorize('staff', 'admin'), getDepartmentAlerts);

module.exports = router;
