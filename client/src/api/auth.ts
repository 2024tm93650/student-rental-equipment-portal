import api from './axios';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  firstName: string;
  lastName: string;
  studentId?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'student' | 'staff' | 'admin';
  firstName: string;
  lastName: string;
  studentId?: string;
  department?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export const authAPI = {
  // Register new user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (loginData: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', loginData);
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData: Partial<User>): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Get all users (admin only)
  getAllUsers: async (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const response = await api.get('/auth/users', { params });
    return response.data;
  },

  // Create new user (admin only)
  createUser: async (userData: RegisterData) => {
    const response = await api.post('/auth/users', userData);
    return response.data;
  },

  // Update user (admin only)
  updateUser: async (userId: string, userData: Partial<User>) => {
    const response = await api.put(`/auth/users/${userId}`, userData);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (userId: string) => {
    const response = await api.delete(`/auth/users/${userId}`);
    return response.data;
  },

  // Toggle user activation (admin only)
  toggleUserActivation: async (userId: string) => {
    const response = await api.put(`/auth/users/${userId}/toggle-activation`);
    return response.data;
  },

  // Get user statistics (admin only)
  getUserStats: async () => {
    const response = await api.get('/auth/users/stats');
    return response.data;
  },
};