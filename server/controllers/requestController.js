const Request = require('../models/Request');
const Equipment = require('../models/Equipment');
const User = require('../models/User');

// Create new borrowing request
const createRequest = async (req, res) => {
  try {
    const {
      equipmentId,
      quantity,
      requestedStartDate,
      requestedEndDate,
      purpose,
      notes
    } = req.body;

    // Validate equipment exists and is active
    const equipment = await Equipment.findOne({ _id: equipmentId, isActive: true });
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found or inactive'
      });
    }

    // Check if enough quantity is available
    if (equipment.availableQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${equipment.availableQuantity} items available`
      });
    }

    // Check for overlapping approved/borrowed requests
    const overlappingRequests = await Request.findOverlapping(
      equipmentId,
      new Date(requestedStartDate),
      new Date(requestedEndDate)
    );

    const totalOverlappingQuantity = overlappingRequests.reduce((sum, req) => sum + req.quantity, 0);
    if (totalOverlappingQuantity + quantity > equipment.totalQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Equipment not available for the requested time period'
      });
    }

    // Create request
    const request = new Request({
      requester: req.user.userId,
      equipment: equipmentId,
      quantity,
      requestedStartDate,
      requestedEndDate,
      purpose,
      notes
    });

    await request.save();

    // Populate the request
    await request.populate('requester', 'firstName lastName username studentId');
    await request.populate('equipment', 'name category');

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: { request }
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create request',
      error: error.message
    });
  }
};

// Get all requests with filtering
const getAllRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      equipmentId,
      requesterId
    } = req.query;

    let query = {};

    // Role-based filtering
    if (req.user.role === 'student') {
      query.requester = req.user.userId;
    }

    // Apply filters
    if (status) {
      query.status = status;
    }
    if (equipmentId) {
      query.equipment = equipmentId;
    }
    if (requesterId && (req.user.role === 'staff' || req.user.role === 'admin')) {
      query.requester = requesterId;
    }

    const requests = await Request.find(query)
      .populate('requester', 'firstName lastName username studentId')
      .populate('equipment', 'name category')
      .populate('approvedBy', 'firstName lastName username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Request.countDocuments(query);

    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
};

// Get request by ID
const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requester', 'firstName lastName username studentId')
      .populate('equipment', 'name category description')
      .populate('approvedBy', 'firstName lastName username');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check if user has permission to view this request
    if (req.user.role === 'student' && request.requester._id.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { request }
    });
  } catch (error) {
    console.error('Get request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request',
      error: error.message
    });
  }
};

// Approve request (staff/admin only)
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const request = await Request.findById(id)
      .populate('equipment');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be approved'
      });
    }

    // Check availability again
    const equipment = request.equipment;
    const overlappingRequests = await Request.findOverlapping(
      equipment._id,
      request.requestedStartDate,
      request.requestedEndDate,
      request._id
    );

    const totalOverlappingQuantity = overlappingRequests.reduce((sum, req) => sum + req.quantity, 0);
    if (totalOverlappingQuantity + request.quantity > equipment.totalQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Equipment no longer available for the requested time period'
      });
    }

    // Update request
    request.status = 'approved';
    request.approvedBy = req.user.userId;
    request.approvalDate = new Date();
    if (notes) {
      request.notes = notes;
    }

    await request.save();

    // Update equipment availability
    equipment.availableQuantity -= request.quantity;
    await equipment.save();

    await request.populate('requester', 'firstName lastName username studentId');
    await request.populate('approvedBy', 'firstName lastName username');

    res.json({
      success: true,
      message: 'Request approved successfully',
      data: { request }
    });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve request',
      error: error.message
    });
  }
};

// Reject request (staff/admin only)
const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be rejected'
      });
    }

    request.status = 'rejected';
    request.approvedBy = req.user.userId;
    request.approvalDate = new Date();
    request.rejectionReason = rejectionReason;

    await request.save();

    await request.populate('requester', 'firstName lastName username studentId');
    await request.populate('equipment', 'name category');
    await request.populate('approvedBy', 'firstName lastName username');

    res.json({
      success: true,
      message: 'Request rejected successfully',
      data: { request }
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject request',
      error: error.message
    });
  }
};

// Mark as borrowed (staff/admin only)
const markAsBorrowed = async (req, res) => {
  try {
    const { id } = req.params;
    const { actualStartDate, notes } = req.body;

    const request = await Request.findById(id)
      .populate('equipment');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved requests can be marked as borrowed'
      });
    }

    request.status = 'borrowed';
    request.actualStartDate = actualStartDate || new Date();
    if (notes) {
      request.notes = notes;
    }

    await request.save();

    await request.populate('requester', 'firstName lastName username studentId');
    await request.populate('approvedBy', 'firstName lastName username');

    res.json({
      success: true,
      message: 'Request marked as borrowed successfully',
      data: { request }
    });
  } catch (error) {
    console.error('Mark as borrowed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as borrowed',
      error: error.message
    });
  }
};

// Mark as returned (staff/admin only)
const markAsReturned = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      actualEndDate, 
      returnNotes, 
      damageReported, 
      damageDescription, 
      penalty 
    } = req.body;

    const request = await Request.findById(id)
      .populate('equipment');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'borrowed') {
      return res.status(400).json({
        success: false,
        message: 'Only borrowed requests can be marked as returned'
      });
    }

    // Update request
    request.status = 'returned';
    request.actualEndDate = actualEndDate || new Date();
    request.returnNotes = returnNotes;
    request.damageReported = damageReported || false;
    request.damageDescription = damageDescription;
    request.penalty = penalty || 0;

    await request.save();

    // Update equipment availability
    const equipment = request.equipment;
    equipment.availableQuantity += request.quantity;
    await equipment.save();

    await request.populate('requester', 'firstName lastName username studentId');
    await request.populate('approvedBy', 'firstName lastName username');

    res.json({
      success: true,
      message: 'Request marked as returned successfully',
      data: { request }
    });
  } catch (error) {
    console.error('Mark as returned error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as returned',
      error: error.message
    });
  }
};

// Get request statistics (staff/admin only)
const getRequestStats = async (req, res) => {
  try {
    const stats = await Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const monthlyStats = await Request.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        statusBreakdown: stats,
        monthlyTrend: monthlyStats
      }
    });
  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request statistics',
      error: error.message
    });
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest,
  markAsBorrowed,
  markAsReturned,
  getRequestStats
};