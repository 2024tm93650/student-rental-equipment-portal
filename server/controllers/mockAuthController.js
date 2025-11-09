const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Simple password comparison for mock data
const comparePassword = async (inputPassword, hashedPassword) => {
  // For demo purposes, just check if password is "admin123"
  return inputPassword === 'admin123';
};

// Hash password for new users
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password, role, firstName, lastName, studentId, department } = req.body;

    // Check if user already exists
    const existingUser = global.mockDatabase.users.find(user => 
      user.email === email || user.username === username
    );

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Validate student ID for students
    if (role === 'student') {
      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required for student role'
        });
      }

      const existingStudent = global.mockDatabase.users.find(user => user.studentId === studentId);
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Student ID already exists'
        });
      }
    }

    // Create new user
    const newUser = {
      _id: String(global.mockDatabase.users.length + 1),
      username,
      email,
      password: await hashPassword(password),
      role,
      firstName,
      lastName,
      studentId: role === 'student' ? studentId : undefined,
      department,
      isActive: true,
      createdAt: new Date()
    };

    // Add to mock database
    global.mockDatabase.users.push(newUser);

    // Generate token
    const token = generateToken(newUser._id);

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔍 Login attempt:', { username, password: password ? '***' : 'missing' });

    // Find user by username or email
    const user = global.mockDatabase.users.find(user => 
      (user.username === username || user.email === username) && user.isActive
    );

    console.log('👤 User found:', user ? `${user.username} (${user.role})` : 'Not found');

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    console.log('🔐 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('✅ Login successful for:', user.username);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = global.mockDatabase.users.find(user => user._id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, department } = req.body;
    const userId = req.user.userId;

    const userIndex = global.mockDatabase.users.findIndex(user => user._id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user data
    global.mockDatabase.users[userIndex] = {
      ...global.mockDatabase.users[userIndex],
      firstName,
      lastName,
      department
    };

    const updatedUser = global.mockDatabase.users[userIndex];
    const { password: _, ...userResponse } = updatedUser;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userResponse }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    let filteredUsers = global.mockDatabase.users;
    
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Remove passwords from response
    const usersResponse = paginatedUsers.map(user => {
      const { password: _, ...userResponse } = user;
      return userResponse;
    });

    res.json({
      success: true,
      data: {
        users: usersResponse,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredUsers.length,
          pages: Math.ceil(filteredUsers.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers
};