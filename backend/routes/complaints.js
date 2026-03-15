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
  getPublicComplaints,
  getNearbyComplaints,
  checkSimilarComplaints,
  upvoteComplaint,
  removeUpvote,
  getPublicStats,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { validate, createComplaintSchema, updateComplaintStatusSchema } = require('../middleware/validationMiddleware');

// GET /api/complaints/public-stats — no auth, for landing page hero counters
router.get('/public-stats', getPublicStats);

router.route('/')
  .post(protect, upload.array('attachments'), validate(createComplaintSchema), createComplaint);

// Community routes — MUST be before /:id to avoid Express matching "public" as an ID
router.route('/public').get(protect, getPublicComplaints);
router.route('/nearby').get(protect, getNearbyComplaints);
router.route('/check-similar').post(protect, authorize('citizen'), checkSimilarComplaints);

// Explicit list endpoint to avoid any ambiguity
router.route('/all').get(protect, authorize('staff', 'admin', 'worker'), listComplaints);
router.route('/recent').get(protect, authorize('staff', 'admin', 'worker'), getRecentComplaints);
router.route('/stats').get(protect, getUserStats);
router.route('/worker-reports').get(protect, authorize('worker'), getWorkerReports);
router.route('/my').get(protect, getMyComplaints);

// Upvote routes
router.route('/:id/upvote')
  .post(protect, authorize('citizen'), upvoteComplaint)
  .delete(protect, authorize('citizen'), removeUpvote);

router.route('/:id').get(protect, getComplaintById);
router.route('/:id/status').patch(protect, authorize('staff', 'admin'), validate(updateComplaintStatusSchema), updateComplaintStatus);
router.route('/:id/assign').patch(protect, authorize('admin'), assignComplaint);
router.route('/:id/assign-worker').patch(protect, authorize('admin', 'staff'), assignWorkerToComplaint);
router.route('/:id/update-assignment').patch(protect, authorize('admin', 'staff'), updateAssignment);
router.route('/:id/timeline').put(protect, authorize('worker'), upload.array('attachments', 5), updateComplaintTimeline);
router.route('/:id/worker-update').put(protect, authorize('worker'), upload.array('attachments', 5), updateComplaintByWorker);

module.exports = router;
