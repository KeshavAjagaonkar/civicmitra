const express = require('express');
const router = express.Router();
const { createFeedback, getFeedbackByComplaint } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { validate, createFeedbackSchema } = require('../middleware/validationMiddleware');

router.route('/').post(protect, validate(createFeedbackSchema), createFeedback);
router.route('/:complaintId').get(protect, getFeedbackByComplaint);

module.exports = router;