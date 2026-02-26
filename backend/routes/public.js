/**
 * Public routes — no authentication required.
 * These power the public-facing accountability/transparency dashboard.
 */

const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');

// @desc    Public accountability stats — department performance, category breakdown, trends
// @route   GET /api/public/accountability
// @access  Public (no auth)
router.get('/accountability', asyncHandler(async (req, res) => {
  const [
    totalComplaints,
    resolvedCount,
    closedCount,
    categoryBreakdown,
    statusBreakdown,
    deptRaw,
    monthlyTrend,
  ] = await Promise.all([
    // Overall totals
    Complaint.countDocuments({ isPublic: true }),
    Complaint.countDocuments({ isPublic: true, status: 'Resolved' }),
    Complaint.countDocuments({ isPublic: true, status: 'Closed' }),

    // Breakdown by category
    Complaint.aggregate([
      { $match: { isPublic: true } },
      { $group: {
        _id: '$category',
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] } },
      }},
      { $sort: { total: -1 } },
    ]),

    // Breakdown by status
    Complaint.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Per-department stats: total, resolved, avg resolution time
    Complaint.aggregate([
      { $match: { isPublic: true, department: { $ne: null } } },
      { $group: {
        _id: '$department',
        total: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] } },
      }},
      { $lookup: {
        from: 'departments',
        localField: '_id',
        foreignField: '_id',
        as: 'dept',
      }},
      { $unwind: { path: '$dept', preserveNullAndEmpty: true } },
      { $project: {
        name: { $ifNull: ['$dept.name', 'Unknown Department'] },
        total: 1,
        resolved: 1,
        resolutionRate: {
          $cond: [
            { $gt: ['$total', 0] },
            { $round: [{ $multiply: [{ $divide: ['$resolved', '$total'] }, 100] }, 1] },
            0,
          ],
        },
      }},
      { $sort: { resolutionRate: -1 } },
    ]),

    // Monthly complaint volume — last 6 months
    (async () => {
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const [total, resolved] = await Promise.all([
          Complaint.countDocuments({ isPublic: true, createdAt: { $gte: start, $lte: end } }),
          Complaint.countDocuments({ isPublic: true, status: { $in: ['Resolved', 'Closed'] }, createdAt: { $gte: start, $lte: end } }),
        ]);
        months.push({
          month: start.toLocaleString('en-US', { month: 'short' }),
          year: start.getFullYear(),
          total,
          resolved,
        });
      }
      return months;
    })(),
  ]);

  const resolvedTotal = resolvedCount + closedCount;
  const overallResolutionRate = totalComplaints > 0
    ? Math.round((resolvedTotal / totalComplaints) * 100)
    : 0;

  res.json({
    success: true,
    data: {
      summary: {
        totalComplaints,
        resolvedComplaints: resolvedTotal,
        activeComplaints: totalComplaints - resolvedTotal,
        overallResolutionRate,
      },
      departments: deptRaw,
      categories: categoryBreakdown.map(c => ({
        category: c._id || 'Other',
        total: c.total,
        resolved: c.resolved,
        resolutionRate: c.total > 0 ? Math.round((c.resolved / c.total) * 100) : 0,
      })),
      statusBreakdown: Object.fromEntries(statusBreakdown.map(s => [s._id, s.count])),
      monthlyTrend,
    },
  });
}));

module.exports = router;
