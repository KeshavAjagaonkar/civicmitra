
const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotifications);
// read-all MUST be before /:id/read so Express doesn't treat "read-all" as an :id param
router.route('/read-all').patch(protect, markAllNotificationsAsRead);
router.route('/:id/read').patch(protect, markNotificationAsRead);

module.exports = router;
