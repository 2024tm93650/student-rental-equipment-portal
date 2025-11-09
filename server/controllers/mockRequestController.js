// Mock Request Controller for in-memory operations

// Get all requests (filtered by role)
const getAllRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, equipmentId, userId } = req.query;
    const currentUser = req.user;

    console.log('📋 Get requests:', { page, limit, status, equipmentId, userId, currentUser });

    let filteredRequests = [...global.mockDatabase.requests];

    // Role-based filtering
    if (currentUser.role === 'student') {
      // Students can only see their own requests
      filteredRequests = filteredRequests.filter(req => req.userId === currentUser.userId);
    }
    // Staff and admin can see all requests (no additional filtering needed)

    // Apply filters
    if (status) {
      filteredRequests = filteredRequests.filter(req => req.status === status);
    }

    if (equipmentId) {
      filteredRequests = filteredRequests.filter(req => req.equipmentId === equipmentId);
    }

    if (userId && currentUser.role !== 'student') {
      filteredRequests = filteredRequests.filter(req => req.userId === userId);
    }

    // Populate with user and equipment data
    const populatedRequests = filteredRequests.map(request => {
      const user = global.mockDatabase.users.find(u => u._id === request.userId);
      const equipment = global.mockDatabase.equipment.find(eq => eq._id === request.equipmentId);
      
      return {
        ...request,
        user: user ? {
          _id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          studentId: user.studentId
        } : null,
        equipment: equipment ? {
          _id: equipment._id,
          name: equipment.name,
          category: equipment.category,
          serialNumber: equipment.serialNumber,
          status: equipment.status
        } : null
      };
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedRequests = populatedRequests.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        requests: paginatedRequests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredRequests.length,
          pages: Math.ceil(filteredRequests.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests',
      error: error.message
    });
  }
};

// Get request statistics
const getStats = async (req, res) => {
  try {
    const requests = global.mockDatabase.requests;
    const currentUser = req.user;

    let filteredRequests = requests;

    // Role-based filtering for stats
    if (currentUser.role === 'student') {
      filteredRequests = requests.filter(req => req.userId === currentUser.userId);
    }

    const stats = {
      total: filteredRequests.length,
      pending: filteredRequests.filter(req => req.status === 'pending').length,
      approved: filteredRequests.filter(req => req.status === 'approved').length,
      rejected: filteredRequests.filter(req => req.status === 'rejected').length,
      borrowed: filteredRequests.filter(req => req.status === 'borrowed').length,
      returned: filteredRequests.filter(req => req.status === 'returned').length
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get request by ID
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const request = global.mockDatabase.requests.find(req => req._id === id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Students can only view their own requests
    if (currentUser.role === 'student' && request.userId !== currentUser.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Populate with user and equipment data
    const user = global.mockDatabase.users.find(u => u._id === request.userId);
    const equipment = global.mockDatabase.equipment.find(eq => eq._id === request.equipmentId);

    const populatedRequest = {
      ...request,
      user: user ? {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        studentId: user.studentId
      } : null,
      equipment: equipment ? {
        _id: equipment._id,
        name: equipment.name,
        category: equipment.category,
        serialNumber: equipment.serialNumber,
        description: equipment.description,
        location: equipment.location,
        status: equipment.status
      } : null
    };

    res.json({
      success: true,
      data: { request: populatedRequest }
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

// Create new request
const createRequest = async (req, res) => {
  try {
    const { equipmentId, purpose, requestedStartDate, requestedEndDate } = req.body;
    const userId = req.user.userId;

    console.log('➕ Create request:', { equipmentId, purpose, userId });

    // Check if equipment exists and is available
    const equipment = global.mockDatabase.equipment.find(eq => eq._id === equipmentId);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    if (equipment.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Equipment is not available for borrowing'
      });
    }

    // Check if user already has an active request for this equipment
    const existingRequest = global.mockDatabase.requests.find(req => 
      req.userId === userId && 
      req.equipmentId === equipmentId && 
      ['pending', 'approved', 'borrowed'].includes(req.status)
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active request for this equipment'
      });
    }

    // Create new request
    const newRequest = {
      _id: String(global.mockDatabase.requests.length + 1),
      userId,
      equipmentId,
      status: 'pending',
      purpose,
      requestedStartDate: new Date(requestedStartDate),
      requestedEndDate: new Date(requestedEndDate),
      requestDate: new Date(),
      createdAt: new Date()
    };

    global.mockDatabase.requests.push(newRequest);

    // Populate response with user and equipment data
    const user = global.mockDatabase.users.find(u => u._id === userId);
    const populatedRequest = {
      ...newRequest,
      user: user ? {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        studentId: user.studentId
      } : null,
      equipment: {
        _id: equipment._id,
        name: equipment.name,
        category: equipment.category,
        serialNumber: equipment.serialNumber
      }
    };

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: { request: populatedRequest }
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

// Approve request (staff/admin only)
const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedStartDate, approvedEndDate, notes } = req.body;

    const requestIndex = global.mockDatabase.requests.findIndex(req => req._id === id);

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = global.mockDatabase.requests[requestIndex];

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be approved'
      });
    }

    // Update request
    global.mockDatabase.requests[requestIndex] = {
      ...request,
      status: 'approved',
      approvedDate: new Date(),
      approvedBy: req.user.userId,
      approvedStartDate: new Date(approvedStartDate),
      approvedEndDate: new Date(approvedEndDate),
      notes,
      updatedAt: new Date()
    };

    const updatedRequest = global.mockDatabase.requests[requestIndex];

    res.json({
      success: true,
      message: 'Request approved successfully',
      data: { request: updatedRequest }
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
    const { reason } = req.body;

    const requestIndex = global.mockDatabase.requests.findIndex(req => req._id === id);

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = global.mockDatabase.requests[requestIndex];

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be rejected'
      });
    }

    // Update request
    global.mockDatabase.requests[requestIndex] = {
      ...request,
      status: 'rejected',
      rejectedDate: new Date(),
      rejectedBy: req.user.userId,
      rejectionReason: reason,
      updatedAt: new Date()
    };

    const updatedRequest = global.mockDatabase.requests[requestIndex];

    res.json({
      success: true,
      message: 'Request rejected successfully',
      data: { request: updatedRequest }
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

    const requestIndex = global.mockDatabase.requests.findIndex(req => req._id === id);

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = global.mockDatabase.requests[requestIndex];

    if (request.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved requests can be marked as borrowed'
      });
    }

    // Update request
    global.mockDatabase.requests[requestIndex] = {
      ...request,
      status: 'borrowed',
      borrowDate: new Date(),
      borrowedBy: req.user.userId,
      updatedAt: new Date()
    };

    // Update equipment status
    const equipmentIndex = global.mockDatabase.equipment.findIndex(eq => eq._id === request.equipmentId);
    if (equipmentIndex !== -1) {
      global.mockDatabase.equipment[equipmentIndex].status = 'borrowed';
    }

    const updatedRequest = global.mockDatabase.requests[requestIndex];

    res.json({
      success: true,
      message: 'Equipment marked as borrowed successfully',
      data: { request: updatedRequest }
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
    const { condition, notes } = req.body;

    const requestIndex = global.mockDatabase.requests.findIndex(req => req._id === id);

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = global.mockDatabase.requests[requestIndex];

    if (request.status !== 'borrowed') {
      return res.status(400).json({
        success: false,
        message: 'Only borrowed equipment can be marked as returned'
      });
    }

    // Update request
    global.mockDatabase.requests[requestIndex] = {
      ...request,
      status: 'returned',
      returnDate: new Date(),
      returnedBy: req.user.userId,
      returnCondition: condition,
      returnNotes: notes,
      updatedAt: new Date()
    };

    // Update equipment status back to available
    const equipmentIndex = global.mockDatabase.equipment.findIndex(eq => eq._id === request.equipmentId);
    if (equipmentIndex !== -1) {
      global.mockDatabase.equipment[equipmentIndex].status = 'available';
    }

    const updatedRequest = global.mockDatabase.requests[requestIndex];

    res.json({
      success: true,
      message: 'Equipment marked as returned successfully',
      data: { request: updatedRequest }
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

module.exports = {
  getAllRequests,
  getStats,
  getRequestById,
  createRequest,
  approveRequest,
  rejectRequest,
  markAsBorrowed,
  markAsReturned
};