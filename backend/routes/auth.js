const express = require('express');
const router = express.Router();
// Note: 'adminLogin' is no longer imported because it has been removed.
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } = require('../middleware/validationMiddleware');

// Route for citizen self-registration
router.post('/register', validate(registerSchema), register);

// Unified login route for ALL roles (citizen, staff, worker, admin)
router.post('/login', validate(loginSchema), login);

// This is the route that was causing the crash and has been removed:
// router.post('/admin-login', validate(loginSchema), adminLogin);

// Route to get the currently logged-in user's data
router.get('/me', protect, getMe);

// Routes for profile management
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.put('/password', protect, validate(changePasswordSchema), changePassword);

module.exports = router;

