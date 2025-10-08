const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getUsers,
  getUser,
  updateUserRole,
  updateUser,
  deleteUser,
  createUser,
  getDashboardStats,
  getRecentComplaints,
  getDepartmentStats,
  getSystemAlerts,
  createSystemAlert,
  deleteComplaint,
  updateComplaint,
  bulkDeleteComplaints,
  bulkDeleteUsers
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate, updateUserRoleSchema, createUserSchema } = require('../middleware/validationMiddleware');

router.route('/analytics').get(protect, authorize('admin'), getAnalytics);

// User Management
router.route('/users').get(protect, authorize('admin', 'staff'), getUsers);
router.route('/users').post(protect, authorize('admin'), validate(createUserSchema), createUser);
router.route('/users/:id').get(protect, authorize('admin'), getUser);
router.route('/users/:id').put(protect, authorize('admin'), updateUser);
router.route('/users/:id/role').put(protect, authorize('admin'), validate(updateUserRoleSchema), updateUserRole);
router.route('/users/:id').delete(protect, authorize('admin'), deleteUser);
router.route('/users/bulk-delete').post(protect, authorize('admin'), bulkDeleteUsers);

// Complaint Management
router.route('/complaints/:id').delete(protect, authorize('admin'), deleteComplaint);
router.route('/complaints/:id').put(protect, authorize('admin'), updateComplaint);
router.route('/complaints/bulk-delete').post(protect, authorize('admin'), bulkDeleteComplaints);

// Dashboard routes
router.route('/dashboard/stats').get(protect, authorize('admin'), getDashboardStats);
router.route('/dashboard/recent-complaints').get(protect, authorize('admin'), getRecentComplaints);
router.route('/dashboard/department-stats').get(protect, authorize('admin'), getDepartmentStats);
router.route('/dashboard/alerts').get(protect, authorize('admin'), getSystemAlerts);
router.route('/alerts').post(protect, authorize('admin'), createSystemAlert);

module.exports = router;