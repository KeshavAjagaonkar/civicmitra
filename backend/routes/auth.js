const express = require('express');
const router = express.Router();
// Note: 'adminLogin' is no longer imported because it has been removed.
const { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword, refreshToken } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } = require('../middleware/validationMiddleware');

// Route for citizen self-registration
router.post('/register', validate(registerSchema), register);

// Unified login route for ALL roles (citizen, staff, worker, admin)
router.post('/login', validate(loginSchema), login);

// Forgot/Reset Password (public — no auth needed)
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Route to get the currently logged-in user's data
router.get('/me', protect, getMe);

// Routes for profile management
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.put('/password', protect, validate(changePasswordSchema), changePassword);

// Token refresh — extends session without re-login
router.post('/refresh-token', protect, refreshToken);

module.exports = router;

