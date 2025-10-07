const { z } = require('zod');

// The main validation function
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    // Reformat Zod errors for a cleaner API response that's easier for the frontend
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return res.status(400).json({ success: false, message: "Validation failed", errors: formattedErrors });
  }
};

// --- AUTHENTICATION SCHEMAS ---

// UPDATED: For citizen self-registration via the public form. Role is handled on the backend.
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please provide a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid 10-digit phone number.' }),
  address: z.string().min(5, { message: 'Address is required.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

// UPDATED: For the unified login form. Role is not required from the user.
const loginSchema = z.object({
  email: z.string().email({ message: "A valid email is required." }),
  password: z.string().min(1, { message: "Password cannot be empty." }),
});

// For an Admin creating a new Staff or Worker user.
const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['staff', 'worker']),
  department: z.string(), // Department ID is required when creating staff/workers
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  address: z.string().min(5).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});


// --- OTHER SCHEMAS (No changes needed, but included for completeness) ---

const createComplaintSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }).max(100),
  description: z.string().min(1, { message: 'Description is required' }).max(1000),
  category: z.enum([
    'Roads', 'Water Supply', 'Sanitation', 'Electricity', 
    'Public Health', 'Street Lights', 'Drainage', 'Garbage', 'Other'
  ]),
  location: z.string().min(1, { message: 'Location is required' }),
  department: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
});

const updateComplaintStatusSchema = z.object({
  status: z.enum(['Submitted', 'In Progress', 'Resolved', 'Closed']),
  remarks: z.string().optional(),
});

const updateUserRoleSchema = z.object({
  role: z.enum(['citizen', 'staff', 'admin', 'worker']),
});

const createFeedbackSchema = z.object({
  complaintId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comments: z.string().optional(),
});


module.exports = {
  validate,
  registerSchema,
  loginSchema,
  createComplaintSchema,
  updateComplaintStatusSchema,
  updateUserRoleSchema,
  createFeedbackSchema,
  createUserSchema,
  updateProfileSchema,
  changePasswordSchema,
};

