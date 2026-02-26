/**
 * cleanupFiles.js
 *
 * Deletes stored files when a complaint is deleted.
 * Works for both Cloudinary (production) and local disk storage (dev fallback).
 *
 * WHY: Without this, deleting a complaint leaves orphaned files in Cloudinary
 * that can never be traced back. Over time these waste quota and cost money.
 */

const path = require('path');
const fs = require('fs');

const hasCloudinaryConfig =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

/**
 * Delete a single file by its public_id.
 * For Cloudinary: public_id is the Cloudinary resource identifier.
 * For local storage: public_id is the filename stored in /uploads.
 *
 * Errors are swallowed — a failed file delete must never block complaint delete.
 */
const deleteFile = async (public_id) => {
  if (!public_id) return;

  if (hasCloudinaryConfig) {
    try {
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      await cloudinary.uploader.destroy(public_id);
    } catch (_) {
      // Non-critical — log in production but don't throw
    }
  } else {
    // Local disk storage fallback
    try {
      const filePath = path.join(__dirname, '..', 'uploads', public_id);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (_) {
      // Non-critical
    }
  }
};

/**
 * Delete all attachments and resolution proof files for a complaint.
 * Accepts a complaint Mongoose document.
 */
const cleanupComplaintFiles = async (complaint) => {
  const allFiles = [
    ...(complaint.attachments || []),
    ...(complaint.resolutionProof || []),
    // Also clean timeline attachments
    ...((complaint.timeline || []).flatMap(t => t.attachments || [])),
  ];

  await Promise.all(allFiles.map(f => deleteFile(f.public_id)));
};

module.exports = { cleanupComplaintFiles };
