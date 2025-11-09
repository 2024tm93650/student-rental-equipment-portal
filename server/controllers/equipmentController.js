const Equipment = require('../models/Equipment');
const Request = require('../models/Request');

// Get all equipment with filtering and search
const getAllEquipment = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      condition, 
      available, 
      search 
    } = req.query;

    let query = { isActive: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by condition
    if (condition) {
      query.condition = condition;
    }

    // Filter by availability
    if (available === 'true') {
      query.availableQuantity = { $gt: 0 };
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    const equipment = await Equipment.find(query)
      .populate('createdBy', 'firstName lastName username')
      .populate('lastUpdatedBy', 'firstName lastName username')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Equipment.countDocuments(query);

    res.json({
      success: true,
      data: {
        equipment,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all equipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment',
      error: error.message
    });
  }
};

// Get equipment by ID
const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('createdBy', 'firstName lastName username')
      .populate('lastUpdatedBy', 'firstName lastName username');

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

// Create new equipment (admin/staff only)
const createEquipment = async (req, res) => {
  try {
    const equipmentData = {
      ...req.body,
      createdBy: req.user.userId,
      availableQuantity: req.body.totalQuantity // Initially all items are available
    };

    const equipment = new Equipment(equipmentData);
    await equipment.save();

    // Populate the created equipment
    await equipment.populate('createdBy', 'firstName lastName username');

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: { equipment }
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

// Update equipment (admin/staff only)
const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user.userId
    };

    // If totalQuantity is being updated, adjust availableQuantity proportionally
    if (req.body.totalQuantity !== undefined) {
      const currentEquipment = await Equipment.findById(id);
      if (currentEquipment) {
        const borrowedQuantity = currentEquipment.totalQuantity - currentEquipment.availableQuantity;
        updateData.availableQuantity = Math.max(0, req.body.totalQuantity - borrowedQuantity);
      }
    }

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName username')
     .populate('lastUpdatedBy', 'firstName lastName username');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: { equipment }
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

    // Check if equipment has active requests
    const activeRequests = await Request.findOne({
      equipment: id,
      status: { $in: ['pending', 'approved', 'borrowed'] }
    });

    if (activeRequests) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete equipment with active requests'
      });
    }

    const equipment = await Equipment.findByIdAndUpdate(
      id,
      { isActive: false, lastUpdatedBy: req.user.userId },
      { new: true }
    );

    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

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

// Get equipment categories
const getCategories = async (req, res) => {
  try {
    const categories = await Equipment.distinct('category', { isActive: true });
    
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

// Get equipment stats (admin/staff only)
const getEquipmentStats = async (req, res) => {
  try {
    const stats = await Equipment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalEquipment: { $sum: 1 },
          totalItems: { $sum: '$totalQuantity' },
          availableItems: { $sum: '$availableQuantity' },
          borrowedItems: { $sum: { $subtract: ['$totalQuantity', '$availableQuantity'] } }
        }
      }
    ]);

    const categoryStats = await Equipment.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalItems: { $sum: '$totalQuantity' },
          availableItems: { $sum: '$availableQuantity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { totalEquipment: 0, totalItems: 0, availableItems: 0, borrowedItems: 0 },
        categoryBreakdown: categoryStats
      }
    });
  } catch (error) {
    console.error('Get equipment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch equipment statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getCategories,
  getEquipmentStats
};