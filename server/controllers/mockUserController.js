// Mock User Management Controller
// This simulates user management operations for the school equipment portal

const bcrypt = require('bcryptjs');

// Mock user database
let mockUsers = [
  {
    _id: '1',
    username: 'admin',
    email: 'admin@school.edu',
    password: '$2a$10$8K1p/a4J5dP.VWJd.b/cGuhtKaS7VdXQFl4qBv3MwbpjLwU5C8gSK', // admin123
    role: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    department: 'IT',
    isActive: true,
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    _id: '2',
    username: 'staff1',
    email: 'staff1@school.edu',
    password: '$2a$10$8K1p/a4J5dP.VWJd.b/cGuhtKaS7VdXQFl4qBv3MwbpjLwU5C8gSK', // admin123
    role: 'staff',
    firstName: 'Jane',
    lastName: 'Smith',
    department: 'Equipment Management',
    isActive: true,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    _id: '3',
    username: 'student1',
    email: 'student1@school.edu',
    password: '$2a$10$8K1p/a4J5dP.VWJd.b/cGuhtKaS7VdXQFl4qBv3MwbpjLwU5C8gSK', // admin123
    role: 'student',
    firstName: 'John',
    lastName: 'Doe',
    studentId: 'STU2024001',
    department: 'Computer Science',
    isActive: true,
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString(),
  },
  {
    _id: '4',
    username: 'student2',
    email: 'student2@school.edu',
    password: '$2a$10$8K1p/a4J5dP.VWJd.b/cGuhtKaS7VdXQFl4qBv3MwbpjLwU5C8gSK', // admin123
    role: 'student',
    firstName: 'Alice',
    lastName: 'Johnson',
    studentId: 'STU2024002',
    department: 'Engineering',
    isActive: true,
    createdAt: new Date('2024-02-02').toISOString(),
    updatedAt: new Date('2024-02-02').toISOString(),
  },
  {
    _id: '5',
    username: 'student3',
    email: 'student3@school.edu',
    password: '$2a$10$8K1p/a4J5dP.VWJd.b/cGuhtKaS7VdXQFl4qBv3MwbpjLwU5C8gSK', // admin123
    role: 'student',
    firstName: 'Bob',
    lastName: 'Wilson',
    studentId: 'STU2024003',
    department: 'Physics',
    isActive: false,
    createdAt: new Date('2024-02-03').toISOString(),
    updatedAt: new Date('2024-02-03').toISOString(),
  },
];

// Generate unique ID
const generateId = () => {
  return (Math.max(...mockUsers.map(u => parseInt(u._id))) + 1).toString();
};

// Sanitize user object (remove password)
const sanitizeUser = (user) => {
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};

// Get all users with filtering and pagination
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    // Filter users
    let filteredUsers = mockUsers;
    
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm) ||
        user.lastName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.username.toLowerCase().includes(searchTerm) ||
        (user.studentId && user.studentId.toLowerCase().includes(searchTerm)) ||
        (user.department && user.department.toLowerCase().includes(searchTerm))
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        users: paginatedUsers.map(sanitizeUser),
        total: filteredUsers.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(filteredUsers.length / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message,
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = mockUsers.find(u => u._id === id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.json({
      success: true,
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message,
    });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { username, email, password, role, firstName, lastName, studentId, department } = req.body;
    
    // Check if username or email already exists
    const existingUser = mockUsers.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists',
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = {
      _id: generateId(),
      username,
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      studentId: role === 'student' ? studentId : undefined,
      department,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    mockUsers.push(newUser);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: sanitizeUser(newUser) },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const userIndex = mockUsers.findIndex(u => u._id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Check if updating username or email conflicts with existing users
    if (updateData.username || updateData.email) {
      const existingUser = mockUsers.find(u => 
        u._id !== id && (u.username === updateData.username || u.email === updateData.email)
      );
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username or email already exists',
        });
      }
    }
    
    // Hash password if provided
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    
    // Update user
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: sanitizeUser(mockUsers[userIndex]) },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userIndex = mockUsers.findIndex(u => u._id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Prevent deletion of the last admin
    const user = mockUsers[userIndex];
    if (user.role === 'admin') {
      const adminCount = mockUsers.filter(u => u.role === 'admin' && u.isActive).length;
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last active admin user',
        });
      }
    }
    
    mockUsers.splice(userIndex, 1);
    
    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

// Toggle user activation
const toggleUserActivation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userIndex = mockUsers.findIndex(u => u._id === id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    const user = mockUsers[userIndex];
    
    // Prevent deactivation of the last admin
    if (user.role === 'admin' && user.isActive) {
      const activeAdminCount = mockUsers.filter(u => u.role === 'admin' && u.isActive).length;
      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate the last active admin user',
        });
      }
    }
    
    mockUsers[userIndex] = {
      ...user,
      isActive: !user.isActive,
      updatedAt: new Date().toISOString(),
    };
    
    res.json({
      success: true,
      message: `User ${mockUsers[userIndex].isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user: sanitizeUser(mockUsers[userIndex]) },
    });
  } catch (error) {
    console.error('Error toggling user activation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user activation',
      error: error.message,
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const totalUsers = mockUsers.length;
    const activeUsers = mockUsers.filter(u => u.isActive).length;
    const inactiveUsers = totalUsers - activeUsers;
    
    const roleBreakdown = [
      { role: 'admin', count: mockUsers.filter(u => u.role === 'admin').length },
      { role: 'staff', count: mockUsers.filter(u => u.role === 'staff').length },
      { role: 'student', count: mockUsers.filter(u => u.role === 'student').length },
    ];
    
    const departmentBreakdown = mockUsers.reduce((acc, user) => {
      if (user.department) {
        const existing = acc.find(d => d.department === user.department);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ department: user.department, count: 1 });
        }
      }
      return acc;
    }, []);
    
    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = mockUsers.filter(u => new Date(u.createdAt) >= thirtyDaysAgo);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          recentRegistrations: recentUsers.length,
        },
        roleBreakdown,
        departmentBreakdown,
        recentUsers: recentUsers.map(sanitizeUser).slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActivation,
  getUserStats,
};