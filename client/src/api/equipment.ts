import api from './axios';

export interface Equipment {
  _id: string;
  name: string;
  description?: string;
  category: 'Electronics' | 'Sports' | 'Laboratory' | 'Audio/Visual' | 'Computing' | 'Tools' | 'Other';
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Out of Service';
  totalQuantity: number;
  availableQuantity: number;
  serialNumber?: string;
  brand?: string;
  model?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  location?: string;
  isActive: boolean;
  imageUrl?: string;
  notes?: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  lastUpdatedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipmentData {
  name: string;
  description?: string;
  category: string;
  condition: string;
  totalQuantity: number;
  serialNumber?: string;
  brand?: string;
  model?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  location?: string;
  imageUrl?: string;
  notes?: string;
}

export const equipmentAPI = {
  // Get all equipment
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    condition?: string;
    available?: boolean;
    search?: string;
  }) => {
    const response = await api.get('/equipment', { params });
    return response.data;
  },

  // Get equipment by ID
  getById: async (id: string) => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },

  // Create new equipment (staff/admin)
  create: async (equipmentData: CreateEquipmentData) => {
    const response = await api.post('/equipment', equipmentData);
    return response.data;
  },

  // Update equipment (staff/admin)
  update: async (id: string, equipmentData: Partial<CreateEquipmentData>) => {
    const response = await api.put(`/equipment/${id}`, equipmentData);
    return response.data;
  },

  // Delete equipment (admin)
  delete: async (id: string) => {
    const response = await api.delete(`/equipment/${id}`);
    return response.data;
  },

  // Get equipment categories
  getCategories: async () => {
    const response = await api.get('/equipment/categories');
    return response.data;
  },

  // Get equipment statistics (staff/admin)
  getStats: async () => {
    const response = await api.get('/equipment/stats');
    return response.data;
  },
};