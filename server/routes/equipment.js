const express = require('express');
const { body } = require('express-validator');
const {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getCategories,
  getEquipmentStats
} = require('../controllers/equipmentController');
const { auth, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const equipmentValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Equipment name is required and must be less than 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('category')
    .isIn(['Electronics', 'Sports', 'Laboratory', 'Audio/Visual', 'Computing', 'Tools', 'Other'])
    .withMessage('Invalid category'),
  
  body('condition')
    .isIn(['Excellent', 'Good', 'Fair', 'Poor', 'Out of Service'])
    .withMessage('Invalid condition'),
  
  body('totalQuantity')
    .isInt({ min: 0 })
    .withMessage('Total quantity must be a non-negative integer'),
  
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Serial number must be less than 100 characters'),
  
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Brand must be less than 50 characters'),
  
  body('model')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Model must be less than 50 characters'),
  
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a non-negative number'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

const updateEquipmentValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Equipment name must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('category')
    .optional()
    .isIn(['Electronics', 'Sports', 'Laboratory', 'Audio/Visual', 'Computing', 'Tools', 'Other'])
    .withMessage('Invalid category'),
  
  body('condition')
    .optional()
    .isIn(['Excellent', 'Good', 'Fair', 'Poor', 'Out of Service'])
    .withMessage('Invalid condition'),
  
  body('totalQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total quantity must be a non-negative integer'),
  
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Serial number must be less than 100 characters'),
  
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Brand must be less than 50 characters'),
  
  body('model')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Model must be less than 50 characters'),
  
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a non-negative number'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
];

// Routes
router.get('/', getAllEquipment);
router.get('/categories', getCategories);
router.get('/stats', auth, requireRole(['staff', 'admin']), getEquipmentStats);
router.get('/:id', getEquipmentById);
router.post('/', auth, requireRole(['staff', 'admin']), equipmentValidation, validate, createEquipment);
router.put('/:id', auth, requireRole(['staff', 'admin']), updateEquipmentValidation, validate, updateEquipment);
router.delete('/:id', auth, requireRole(['admin']), deleteEquipment);

module.exports = router;