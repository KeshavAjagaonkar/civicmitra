const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
  listComplaints,
  getRecentComplaints,
  assignWorkerToComplaint,
  updateComplaintTimeline,
  updateComplaintByWorker,
  getUserStats,
  updateAssignment,
  getWorkerReports,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validate, createComplaintSchema, updateComplaintStatusSchema } = require('../middleware/validationMiddleware');

router.route('/')
  .post(protect, upload.array('attachments'), createComplaint);

// Explicit list endpoint to avoid any ambiguity
router.route('/all').get(protect, authorize('staff', 'admin', 'worker'), listComplaints);
router.route('/recent').get(protect, authorize('staff', 'admin', 'worker'), getRecentComplaints);
router.route('/stats').get(protect, getUserStats);
router.route('/worker-reports').get(protect, authorize('worker'), getWorkerReports);
router.route('/my').get(protect, getMyComplaints);
router.route('/:id').get(protect, getComplaintById);
router.route('/:id/status').patch(protect, authorize('staff', 'admin'), validate(updateComplaintStatusSchema), updateComplaintStatus);
router.route('/:id/assign').patch(protect, authorize('admin'), assignComplaint);
router.route('/:id/assign-worker').patch(protect, authorize('admin', 'staff'), assignWorkerToComplaint);
router.route('/:id/update-assignment').patch(protect, authorize('admin', 'staff'), updateAssignment);
router.route('/:id/timeline').put(protect, authorize('worker'), upload.array('attachments', 5), updateComplaintTimeline);
router.route('/:id/worker-update').put(protect, authorize('worker'), upload.array('attachments', 5), updateComplaintByWorker);

module.exports = router;
