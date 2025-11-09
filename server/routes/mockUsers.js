const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth, requireRole } = require('../middleware/mockAuth');
const { validate } = require('../middleware/validation');
const userController = require('../controllers/mockUserController');

// Validation rules using express-validator
const createUserValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['student', 'staff', 'admin'])
    .withMessage('Role must be student, staff, or admin'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Student ID must be less than 20 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters')
];

const updateUserValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['student', 'staff', 'admin'])
    .withMessage('Role must be student, staff, or admin'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Student ID must be less than 20 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

// GET /api/auth/users - Get all users (admin only)
router.get('/users', 
  auth, 
  requireRole(['admin']), 
  userController.getAllUsers
);

// GET /api/auth/users/stats - Get user statistics (admin only)
router.get('/users/stats', 
  auth, 
  requireRole(['admin']), 
  userController.getUserStats
);

// GET /api/auth/users/:id - Get user by ID (admin only)
router.get('/users/:id', 
  auth, 
  requireRole(['admin']), 
  userController.getUserById
);

// POST /api/auth/users - Create new user (admin only)
router.post('/users', 
  auth, 
  requireRole(['admin']), 
  createUserValidation,
  validate, 
  userController.createUser
);

// PUT /api/auth/users/:id - Update user (admin only)
router.put('/users/:id', 
  auth, 
  requireRole(['admin']), 
  updateUserValidation,
  validate, 
  userController.updateUser
);

// PUT /api/auth/users/:id/toggle-activation - Toggle user activation (admin only)
router.put('/users/:id/toggle-activation', 
  auth, 
  requireRole(['admin']), 
  userController.toggleUserActivation
);

// DELETE /api/auth/users/:id - Delete user (admin only)
router.delete('/users/:id', 
  auth, 
  requireRole(['admin']), 
  userController.deleteUser
);

module.exports = router;