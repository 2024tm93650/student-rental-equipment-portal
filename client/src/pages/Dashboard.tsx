import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { equipmentAPI } from '../api/equipment';
import { requestAPI } from '../api/requests';
import { Search, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import Loading from '../components/Loading';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load equipment
      const equipmentResponse = await equipmentAPI.getAll({
        limit: 12,
        available: true,
        search: searchTerm,
        category: selectedCategory,
      });
      
      // Load categories
      const categoriesResponse = await equipmentAPI.getCategories();
      
      // Load recent requests
      const requestsResponse = await requestAPI.getAll({ limit: 5 });
      
      // Load stats if user is staff or admin
      let statsData = null;
      if (user && ['staff', 'admin'].includes(user.role)) {
        try {
          const equipmentStats = await equipmentAPI.getStats();
          const requestStats = await requestAPI.getStats();
          statsData = { equipment: equipmentStats.data, requests: requestStats.data };
        } catch (error) {
          console.error('Failed to load stats:', error);
        }
      }

      setEquipment(equipmentResponse.data.equipment);
      setCategories(categoriesResponse.data.categories);
      setRecentRequests(requestsResponse.data.requests);
      setStats(statsData);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory, user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'borrowed': return 'text-blue-600 bg-blue-100';
      case 'returned': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="mt-2 text-gray-600">
          {user?.role === 'student' && 'Browse and request equipment for your projects.'}
          {user?.role === 'staff' && 'Manage equipment requests and inventory.'}
          {user?.role === 'admin' && 'Full system administration and oversight.'}
        </p>
      </div>

      {/* Stats Cards (Staff/Admin only) */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Equipment
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.equipment?.overview?.totalEquipment || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Available Items
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.equipment?.overview?.availableItems || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Borrowed Items
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.equipment?.overview?.borrowedItems || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Requests
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.requests?.statusBreakdown?.find((s: any) => s._id === 'pending')?.count || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Equipment */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Available Equipment
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Browse equipment available for borrowing
              </p>
            </div>

            {/* Search and Filter */}
            <div className="px-4 py-3 border-t border-gray-200">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search equipment..."
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="sm:w-48">
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
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Equipment Grid */}
            <div className="px-4 py-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {equipment.map((item: any) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Available: {item.availableQuantity}/{item.totalQuantity}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.condition === 'Excellent' ? 'bg-green-100 text-green-800' :
                        item.condition === 'Good' ? 'bg-blue-100 text-blue-800' :
                        item.condition === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.condition}
                      </span>
                    </div>
                    {user?.role === 'student' && item.availableQuantity > 0 && (
                      <button
                        className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={() => window.location.href = `/equipment/${item._id}/request`}
                      >
                        Request Equipment
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {equipment.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No equipment found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Requests
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {user?.role === 'student' ? 'Your recent requests' : 'Latest requests in the system'}
              </p>
            </div>
            <div className="px-4 py-5">
              <div className="space-y-4">
                {recentRequests.map((request: any) => (
                  <div key={request._id} className="border-l-4 border-blue-400 pl-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {request.equipment?.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {user?.role !== 'student' && `${request.requester?.firstName} ${request.requester?.lastName} - `}
                      Qty: {request.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                
                {recentRequests.length === 0 && (
                  <div className="text-center py-4">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No recent requests</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => window.location.href = user?.role === 'student' ? '/my-requests' : '/manage-requests'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  View All Requests
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;