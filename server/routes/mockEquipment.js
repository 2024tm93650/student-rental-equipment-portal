const express = require('express');
const { body, query } = require('express-validator');
const { validate } = require('../middleware/validation');
const { auth, requireRole, optionalAuth } = require('../middleware/mockAuth');
const {
  getAllEquipment,
  getCategories,
  getStats,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
} = require('../controllers/mockEquipmentController');

const router = express.Router();

// Validation rules
const createEquipmentValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  
  body('category')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category is required'),
  
  body('serialNumber')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Serial number is required'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters')
];

const updateEquipmentValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category is required'),
  
  body('status')
    .optional()
    .isIn(['available', 'borrowed', 'maintenance', 'retired'])
    .withMessage('Status must be one of: available, borrowed, maintenance, retired'),
  
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Serial number is required'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters')
];

// Routes
router.get('/', optionalAuth, getAllEquipment);
router.get('/categories', getCategories);
router.get('/stats', auth, requireRole(['staff', 'admin']), getStats);
router.get('/:id', optionalAuth, getEquipmentById);
router.post('/', auth, requireRole(['staff', 'admin']), createEquipmentValidation, validate, createEquipment);
router.put('/:id', auth, requireRole(['staff', 'admin']), updateEquipmentValidation, validate, updateEquipment);
router.delete('/:id', auth, requireRole(['admin']), deleteEquipment);

module.exports = router;