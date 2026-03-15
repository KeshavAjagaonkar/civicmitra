const Notification = require('../models/Notification');
const { getSocketIO } = require('../utils/socket');

/**
 * Create a notification in DB and emit it via Socket.IO.
 * Non-critical — failures are logged but do not propagate.
 */
const createAndEmitNotification = async (userId, title, message, complaintId) => {
  if (!userId) return;
  try {
    const notification = await Notification.create({ userId, title, message, complaintId });
    const io = getSocketIO();
    if (io) {
      io.to(userId.toString()).emit('new_notification', notification);
    }
  } catch (error) {
    console.error(`[Notification] Failed to notify user ${userId}:`, error.message);
  }
};

/**
 * Broadcast a notification to the complaint filer AND all supporters.
 * Uses Promise.all for parallel notification creation instead of sequential awaits.
 */
const broadcastToSupporters = async (complaint, title, message) => {
  const promises = [];

  // Notify original filer
  promises.push(createAndEmitNotification(complaint.citizenId, title, message, complaint._id));

  // Notify all supporters (skip if same as the filer)
  if (complaint.upvotes && complaint.upvotes.supporters) {
    for (const supporter of complaint.upvotes.supporters) {
      if (supporter.userId.toString() !== complaint.citizenId.toString()) {
        promises.push(createAndEmitNotification(supporter.userId, title, message, complaint._id));
      }
    }
  }

  // Fire all notifications in parallel (Fix #8 — was sequential)
  await Promise.all(promises);
};

module.exports = { createAndEmitNotification, broadcastToSupporters };
