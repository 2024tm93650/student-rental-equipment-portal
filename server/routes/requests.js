const express = require('express');
const { body } = require('express-validator');
const {
  createRequest,
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  markAsBorrowed,
  markAsReturned,
  getRequestStats
} = require('../controllers/requestController');
const { auth, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const createRequestValidation = [
  body('equipmentId')
    .isMongoId()
    .withMessage('Valid equipment ID is required'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('requestedStartDate')
    .isISO8601()
    .withMessage('Valid start date is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  
  body('requestedEndDate')
    .isISO8601()
    .withMessage('Valid end date is required')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.requestedStartDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('purpose')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Purpose is required and must be less than 500 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const approveRequestValidation = [
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const rejectRequestValidation = [
  body('rejectionReason')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Rejection reason is required and must be less than 500 characters')
];

const markBorrowedValidation = [
  body('actualStartDate')
    .optional()
    .isISO8601()
    .withMessage('Valid actual start date required'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const markReturnedValidation = [
  body('actualEndDate')
    .optional()
    .isISO8601()
    .withMessage('Valid actual end date required'),
  
  body('returnNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Return notes must be less than 500 characters'),
  
  body('damageReported')
    .optional()
    .isBoolean()
    .withMessage('Damage reported must be true or false'),
  
  body('damageDescription')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Damage description must be less than 1000 characters'),
  
  body('penalty')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Penalty must be a non-negative number')
];

// Routes
router.get('/', auth, getAllRequests);
router.get('/stats', auth, requireRole(['staff', 'admin']), getRequestStats);
router.get('/:id', auth, getRequestById);
router.post('/', auth, createRequestValidation, validate, createRequest);
router.put('/:id/approve', auth, requireRole(['staff', 'admin']), approveRequestValidation, validate, approveRequest);
router.put('/:id/reject', auth, requireRole(['staff', 'admin']), rejectRequestValidation, validate, rejectRequest);
router.put('/:id/borrowed', auth, requireRole(['staff', 'admin']), markBorrowedValidation, validate, markAsBorrowed);
router.put('/:id/returned', auth, requireRole(['staff', 'admin']), markReturnedValidation, validate, markAsReturned);

module.exports = router;