const express = require('express');
const router = express.Router();
const { createFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');
const { validate, createFeedbackSchema } = require('../middleware/validationMiddleware');

router.route('/').post(protect, validate(createFeedbackSchema), createFeedback);

module.exports = router;