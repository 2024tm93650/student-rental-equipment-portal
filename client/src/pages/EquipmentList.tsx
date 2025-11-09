import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { equipmentAPI } from '../api/equipment';
import { requestAPI } from '../api/requests';
import { Search, Filter, Package, Plus, Edit, Trash2, Clock, CheckCircle } from 'lucide-react';
import Loading from '../components/Loading';

interface Equipment {
  _id: string;
  name: string;
  description: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  borrowedQuantity: number;
  condition: string;
  location: string;
  isActive: boolean;
  addedBy: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const EquipmentList: React.FC = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [requestingItem, setRequestingItem] = useState<string | null>(null);

  useEffect(() => {
    loadEquipment();
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, selectedCategory, conditionFilter, availabilityFilter]);

  const loadEquipment = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: selectedCategory,
        condition: conditionFilter,
      };

      if (availabilityFilter === 'available') {
        params.available = true;
      } else if (availabilityFilter === 'unavailable') {
        params.available = false;
      }

      const response = await equipmentAPI.getAll(params);
      setEquipment(response.data.equipment);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, selectedCategory, conditionFilter, availabilityFilter]);

  const loadCategories = async () => {
    try {
      const response = await equipmentAPI.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadEquipment();
  };

  const handleRequestEquipment = async (equipmentId: string) => {
    try {
      setRequestingItem(equipmentId);
      
      // Simple request with quantity 1 for now
      await requestAPI.create({
        equipmentId: equipmentId,
        quantity: 1,
        purpose: 'General use',
        requestedStartDate: new Date().toISOString(),
        requestedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      alert('Equipment request submitted successfully!');
      loadEquipment(); // Refresh to update available quantities
    } catch (error) {
      console.error('Failed to request equipment:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setRequestingItem(null);
    }
  };

  const handleDeleteEquipment = async (equipmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    try {
      await equipmentAPI.delete(equipmentId);
      alert('Equipment deleted successfully!');
      loadEquipment();
    } catch (error) {
      console.error('Failed to delete equipment:', error);
      alert('Failed to delete equipment. Please try again.');
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Fair': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setConditionFilter('');
    setAvailabilityFilter('');
    setCurrentPage(1);
  };

  if (isLoading && currentPage === 1) {
    return <Loading message="Loading equipment..." />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipment Catalog</h1>
            <p className="mt-2 text-gray-600">
              Browse and manage school equipment inventory
            </p>
          </div>
          {(user?.role === 'staff' || user?.role === 'admin') && (
            <button
              onClick={() => window.location.href = '/add-equipment'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Equipment
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search equipment by name or description..."
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                  >
                    <option value="">Any Condition</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                  >
                    <option value="">All Items</option>
                    <option value="available">Available Only</option>
                    <option value="unavailable">Unavailable Only</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          {equipment.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {equipment.map((item) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                          {item.category}
                        </span>
                      </div>
                      {(user?.role === 'staff' || user?.role === 'admin') && (
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => window.location.href = `/equipment/${item._id}/edit`}
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Edit Equipment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEquipment(item._id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete Equipment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description || 'No description available'}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total:</span>
                        <span className="font-medium">{item.totalQuantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Available:</span>
                        <span className={`font-medium ${item.availableQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.availableQuantity}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Location:</span>
                        <span className="font-medium truncate">{item.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getConditionColor(item.condition)}`}>
                        {item.condition}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        {item.availableQuantity > 0 ? (
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        {item.availableQuantity > 0 ? 'Available' : 'Unavailable'}
                      </div>
                    </div>

                    {user?.role === 'student' && item.availableQuantity > 0 && (
                      <button
                        onClick={() => handleRequestEquipment(item._id)}
                        disabled={requestingItem === item._id}
                        className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {requestingItem === item._id ? 'Requesting...' : 'Request Equipment'}
                      </button>
                    )}

                    {user?.role !== 'student' && (
                      <div className="text-xs text-gray-500 pt-2 border-t">
                        Added by {item.addedBy?.firstName} {item.addedBy?.lastName}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  <div className="text-sm text-gray-700">
                    Showing page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 border rounded-md text-sm font-medium ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory || conditionFilter || availabilityFilter
                  ? 'Try adjusting your search criteria or filters.'
                  : 'No equipment has been added to the system yet.'}
              </p>
              {(user?.role === 'staff' || user?.role === 'admin') && (
                <button
                  onClick={() => window.location.href = '/add-equipment'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Equipment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentList;