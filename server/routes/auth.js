const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActivation
} = require('../controllers/authController');
const { auth, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
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
    .isLength({ min: 1 })
    .withMessage('Student ID is required for students'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters')
];

const loginValidation = [
  body('username')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Username or email is required'),
  
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
];

const updateProfileValidation = [
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
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department must be less than 100 characters')
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfileValidation, validate, updateProfile);

// User management routes (Admin only)
router.get('/users', auth, requireRole(['admin']), getAllUsers);
router.post('/users', auth, requireRole(['admin']), registerValidation, validate, createUser);
router.put('/users/:id', auth, requireRole(['admin']), updateProfileValidation, validate, updateUser);
router.delete('/users/:id', auth, requireRole(['admin']), deleteUser);
router.put('/users/:id/toggle-activation', auth, requireRole(['admin']), toggleUserActivation);

module.exports = router;