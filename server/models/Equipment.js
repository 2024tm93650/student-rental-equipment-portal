const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Sports', 'Laboratory', 'Audio/Visual', 'Computing', 'Tools', 'Other'],
    trim: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Out of Service'],
    default: 'Good'
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  serialNumber: {
    type: String,
    trim: true,
    sparse: true, // Allows multiple null values
    unique: true
  },
  brand: {
    type: String,
    trim: true,
    maxlength: 50
  },
  model: {
    type: String,
    trim: true,
    maxlength: 50
  },
  purchaseDate: {
    type: Date
  },
  purchasePrice: {
    type: Number,
    min: 0
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Validate that availableQuantity doesn't exceed totalQuantity
equipmentSchema.pre('save', function(next) {
  if (this.availableQuantity > this.totalQuantity) {
    next(new Error('Available quantity cannot exceed total quantity'));
  }
  next();
});

// Index for searching
equipmentSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Equipment', equipmentSchema);