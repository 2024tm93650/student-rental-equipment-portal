// Mock Equipment Controller for in-memory operations

// Get all equipment with optional filters
const getAllEquipment = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    console.log('📦 Get equipment request:', { page, limit, category, status, search });

    let filteredEquipment = [...global.mockDatabase.equipment];

    // Apply filters
    if (category) {
      filteredEquipment = filteredEquipment.filter(eq => 
        eq.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (status) {
      filteredEquipment = filteredEquipment.filter(eq => 
        eq.status === status
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredEquipment = filteredEquipment.filter(eq =>
        eq.name.toLowerCase().includes(searchLower) ||
        eq.description.toLowerCase().includes(searchLower) ||
        eq.serialNumber.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedEquipment = filteredEquipment.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        equipment: paginatedEquipment,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredEquipment.length,
          pages: Math.ceil(filteredEquipment.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

// Get equipment categories
const getCategories = async (req, res) => {
  try {
    const categories = [...new Set(global.mockDatabase.equipment.map(eq => eq.category))];
    
    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get equipment statistics
const getStats = async (req, res) => {
  try {
    const equipment = global.mockDatabase.equipment;
    
    const stats = {
      total: equipment.length,
      available: equipment.filter(eq => eq.status === 'available').length,
      borrowed: equipment.filter(eq => eq.status === 'borrowed').length,
      maintenance: equipment.filter(eq => eq.status === 'maintenance').length,
      byCategory: {}
    };

    // Count by category
    equipment.forEach(eq => {
      stats.byCategory[eq.category] = (stats.byCategory[eq.category] || 0) + 1;
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get equipment by ID
const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = global.mockDatabase.equipment.find(eq => eq._id === id);

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: { equipment }
    });
  } catch (error) {
    console.error('Get equipment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

// Create new equipment (staff/admin only)
const createEquipment = async (req, res) => {
  try {
    const { name, category, serialNumber, description, location } = req.body;
    console.log('➕ Create equipment request:', req.body);

    // Check if serial number already exists
    const existingEquipment = global.mockDatabase.equipment.find(eq => 
      eq.serialNumber === serialNumber
    );

    if (existingEquipment) {
      return res.status(400).json({
        success: false,
        message: 'Equipment with this serial number already exists'
      });
    }

    // Create new equipment
    const newEquipment = {
      _id: String(global.mockDatabase.equipment.length + 1),
      name,
      category,
      status: 'available',
      serialNumber,
      description,
      location,
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    global.mockDatabase.equipment.push(newEquipment);

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: { equipment: newEquipment }
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create equipment',
      error: error.message
    });
  }
};

// Update equipment (staff/admin only)
const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, status, serialNumber, description, location } = req.body;

    const equipmentIndex = global.mockDatabase.equipment.findIndex(eq => eq._id === id);

    if (equipmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Check if serial number is being changed and if it already exists
    if (serialNumber && serialNumber !== global.mockDatabase.equipment[equipmentIndex].serialNumber) {
      const existingEquipment = global.mockDatabase.equipment.find(eq => 
        eq.serialNumber === serialNumber && eq._id !== id
      );

      if (existingEquipment) {
        return res.status(400).json({
          success: false,
          message: 'Equipment with this serial number already exists'
        });
      }
    }

    // Update equipment
    global.mockDatabase.equipment[equipmentIndex] = {
      ...global.mockDatabase.equipment[equipmentIndex],
      name: name || global.mockDatabase.equipment[equipmentIndex].name,
      category: category || global.mockDatabase.equipment[equipmentIndex].category,
      status: status || global.mockDatabase.equipment[equipmentIndex].status,
      serialNumber: serialNumber || global.mockDatabase.equipment[equipmentIndex].serialNumber,
      description: description || global.mockDatabase.equipment[equipmentIndex].description,
      location: location || global.mockDatabase.equipment[equipmentIndex].location,
      updatedAt: new Date(),
      updatedBy: req.user.userId
    };

    const updatedEquipment = global.mockDatabase.equipment[equipmentIndex];

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: { equipment: updatedEquipment }
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update equipment',
      error: error.message
    });
  }
};

// Delete equipment (admin only)
const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const equipmentIndex = global.mockDatabase.equipment.findIndex(eq => eq._id === id);

    if (equipmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    // Check if equipment is currently borrowed
    const activeRequest = global.mockDatabase.requests.find(req => 
      req.equipmentId === id && ['approved', 'borrowed'].includes(req.status)
    );

    if (activeRequest) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete equipment that is currently borrowed or has pending requests'
      });
    }

    // Remove equipment
    global.mockDatabase.equipment.splice(equipmentIndex, 1);

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete equipment',
      error: error.message
    });
  }
};

module.exports = {
  getAllEquipment,
  getCategories,
  getStats,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment
};