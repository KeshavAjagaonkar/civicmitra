const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    createDepartment,
    getDepartments,
    getDepartment,
    updateDepartment,
    deleteDepartment 
} = require('../controllers/departmentController');

router.route('/')
    .post(protect, authorize(['admin']), createDepartment)
    .get(getDepartments);

router.route('/:id')
    .get(getDepartment)
    .put(protect, authorize(['admin']), updateDepartment)
    .delete(protect, authorize(['admin']), deleteDepartment);

module.exports = router;
