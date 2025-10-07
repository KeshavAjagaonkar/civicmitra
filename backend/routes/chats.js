const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getChat, sendMessage } = require('../controllers/chatController');

router.route('/:complaintId')
    .get(protect, getChat)
    .post(protect, sendMessage);

module.exports = router;
