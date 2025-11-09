const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const { validate } = require('../middleware/validation');
const { auth, requireRole } = require('../middleware/mockAuth');
const {
  getAllRequests,
  getStats,
  getRequestById,
  createRequest,
  approveRequest,
  rejectRequest,
  markAsBorrowed,
  markAsReturned
} = require('../controllers/mockRequestController');

// GET /api/requests - Get all requests (role-based access)
router.get('/', 
  auth,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['pending', 'approved', 'rejected', 'borrowed', 'returned']).withMessage('Invalid status'),
    query('equipmentId').optional().isString().withMessage('Equipment ID must be a string'),
    query('userId').optional().isString().withMessage('User ID must be a string')
  ],
  validate,
  getAllRequests
);

// GET /api/requests/stats - Get request statistics
router.get('/stats', 
  auth,
  requireRole(['staff', 'admin']),
  getStats
);

// GET /api/requests/:id - Get request by ID
router.get('/:id', 
  auth,
  getRequestById
);

// POST /api/requests - Create new request (all authenticated users)
router.post('/',
  auth,
  [
    body('equipmentId').notEmpty().withMessage('Equipment ID is required'),
    body('purpose').notEmpty().withMessage('Purpose is required')
      .isLength({ min: 10, max: 500 }).withMessage('Purpose must be between 10 and 500 characters'),
    body('requestedStartDate').isISO8601().withMessage('Valid start date is required'),
    body('requestedEndDate').isISO8601().withMessage('Valid end date is required')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.requestedStartDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      })
  ],
  validate,
  createRequest
);

// PUT /api/requests/:id/approve - Approve request (staff/admin only)
router.put('/:id/approve',
  auth,
  requireRole(['staff', 'admin']),
  [
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  validate,
  approveRequest
);

// PUT /api/requests/:id/reject - Reject request (staff/admin only)
router.put('/:id/reject',
  auth,
  requireRole(['staff', 'admin']),
  [
    body('rejectionReason').notEmpty().withMessage('Rejection reason is required')
      .isLength({ min: 10, max: 500 }).withMessage('Rejection reason must be between 10 and 500 characters')
  ],
  validate,
  rejectRequest
);

// PUT /api/requests/:id/borrowed - Mark as borrowed (staff/admin only)
router.put('/:id/borrowed',
  auth,
  requireRole(['staff', 'admin']),
  [
    body('borrowedDate').optional().isISO8601().withMessage('Valid borrowed date is required'),
    body('expectedReturnDate').optional().isISO8601().withMessage('Valid expected return date is required'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  validate,
  markAsBorrowed
);

// PUT /api/requests/:id/returned - Mark as returned (staff/admin only)
router.put('/:id/returned',
  auth,
  requireRole(['staff', 'admin']),
  [
    body('returnedDate').optional().isISO8601().withMessage('Valid returned date is required'),
    body('condition').optional().isIn(['excellent', 'good', 'fair', 'poor', 'damaged']).withMessage('Invalid condition'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  validate,
  markAsReturned
);

module.exports = router;

// GET /api/requests/stats - Get request statistics
router.get('/stats', 
  auth,
  getStats
);

// GET /api/requests/:id - Get request by ID
router.get('/:id', 
  auth,
  [
    body('id').isString().withMessage('Request ID must be a string')
  ],
  getRequestById
);

// POST /api/requests - Create new request (all authenticated users)
router.post('/',
  auth,
  [
    body('equipmentId').notEmpty().withMessage('Equipment ID is required'),
    body('purpose').notEmpty().withMessage('Purpose is required')
      .isLength({ min: 10, max: 500 }).withMessage('Purpose must be between 10 and 500 characters'),
    body('requestedStartDate').isISO8601().withMessage('Valid start date is required'),
    body('requestedEndDate').isISO8601().withMessage('Valid end date is required')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.requestedStartDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      })
  ],
  validate,
  createRequest
);

// PUT /api/requests/:id/approve - Approve request (staff/admin only)
router.put('/:id/approve',
  auth,
  (req, res, next) => {
    if (!['staff', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff or admin role required.'
      });
    }
    next();
  },
  [
    body('approvedStartDate').isISO8601().withMessage('Valid approved start date is required'),
    body('approvedEndDate').isISO8601().withMessage('Valid approved end date is required')
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.approvedStartDate)) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters')
  ],
  validate,
  approveRequest
);

// PUT /api/requests/:id/reject - Reject request (staff/admin only)
router.put('/:id/reject',
  auth,
  (req, res, next) => {
    if (!['staff', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff or admin role required.'
      });
    }
    next();
  },
  [
    body('reason').notEmpty().withMessage('Rejection reason is required')
      .isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters')
  ],
  validate,
  rejectRequest
);

// PUT /api/requests/:id/borrow - Mark as borrowed (staff/admin only)
router.put('/:id/borrow',
  auth,
  (req, res, next) => {
    if (!['staff', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff or admin role required.'
      });
    }
    next();
  },
  markAsBorrowed
);

// PUT /api/requests/:id/return - Mark as returned (staff/admin only)
router.put('/:id/return',
  auth,
  (req, res, next) => {
    if (!['staff', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Staff or admin role required.'
      });
    }
    next();
  },
  [
    body('condition').notEmpty().withMessage('Return condition is required')
      .isIn(['excellent', 'good', 'fair', 'damaged']).withMessage('Invalid condition value'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters')
  ],
  validate,
  markAsReturned
);

module.exports = router;