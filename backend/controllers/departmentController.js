const Department = require('../models/Department');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a department
// @route   POST /api/v1/departments
// @access  Private/Admin
exports.createDepartment = asyncHandler(async (req, res, next) => {
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, data: department });
});

// @desc    Get all departments
// @route   GET /api/v1/departments
// @access  Public
exports.getDepartments = asyncHandler(async (req, res, next) => {
    const departments = await Department.find();
    res.status(200).json({ success: true, data: departments });
});

// @desc    Get a single department
// @route   GET /api/v1/departments/:id
// @access  Public
exports.getDepartment = asyncHandler(async (req, res, next) => {
    const department = await Department.findById(req.params.id);
    if (!department) {
        return next(new ErrorResponse(`Department not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: department });
});

// @desc    Update a department
// @route   PUT /api/v1/departments/:id
// @access  Private/Admin
exports.updateDepartment = asyncHandler(async (req, res, next) => {
    let department = await Department.findById(req.params.id);
    if (!department) {
        return next(new ErrorResponse(`Department not found with id of ${req.params.id}`, 404));
    }
    department = await Department.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    res.status(200).json({ success: true, data: department });
});

// @desc    Delete a department
// @route   DELETE /api/v1/departments/:id
// @access  Private/Admin
exports.deleteDepartment = asyncHandler(async (req, res, next) => {
    const department = await Department.findById(req.params.id);
    if (!department) {
        return next(new ErrorResponse(`Department not found with id of ${req.params.id}`, 404));
    }
    await department.remove();
    res.status(200).json({ success: true, data: {} });
});
