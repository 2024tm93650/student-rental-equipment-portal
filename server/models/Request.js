const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  requestedStartDate: {
    type: Date,
    required: true
  },
  requestedEndDate: {
    type: Date,
    required: true
  },
  actualStartDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'borrowed', 'returned', 'overdue'],
    default: 'pending'
  },
  purpose: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  returnNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  damageReported: {
    type: Boolean,
    default: false
  },
  damageDescription: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  penalty: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Validate that end date is after start date
requestSchema.pre('save', function(next) {
  if (this.requestedEndDate <= this.requestedStartDate) {
    next(new Error('End date must be after start date'));
  }
  
  if (this.actualEndDate && this.actualStartDate && this.actualEndDate <= this.actualStartDate) {
    next(new Error('Actual end date must be after actual start date'));
  }
  
  next();
});

// Check for overlapping requests
requestSchema.statics.findOverlapping = function(equipmentId, startDate, endDate, excludeRequestId = null) {
  const query = {
    equipment: equipmentId,
    status: { $in: ['approved', 'borrowed'] },
    $or: [
      {
        requestedStartDate: { $lte: endDate },
        requestedEndDate: { $gte: startDate }
      }
    ]
  };
  
  if (excludeRequestId) {
    query._id = { $ne: excludeRequestId };
  }
  
  return this.find(query);
};

// Index for efficient querying
requestSchema.index({ requester: 1, status: 1 });
requestSchema.index({ equipment: 1, status: 1 });
requestSchema.index({ requestedStartDate: 1, requestedEndDate: 1 });

module.exports = mongoose.model('Request', requestSchema);