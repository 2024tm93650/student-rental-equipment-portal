import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestAPI } from '../api/requests';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Calendar,
  FileText,
  Filter,
  Search,
  AlertTriangle,
  Eye
} from 'lucide-react';
import Loading from '../components/Loading';

interface Request {
  _id: string;
  equipment: {
    name: string;
    category: string;
  };
  quantity: number;
  requestDate: string;
  requestedStartDate: string;
  requestedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'borrowed' | 'returned' | 'overdue';
  purpose: string;
  notes?: string;
  approvedBy?: {
    firstName: string;
    lastName: string;
  };
  approvalDate?: string;
  rejectionReason?: string;
  returnNotes?: string;
  damageReported: boolean;
  damageDescription?: string;
  penalty: number;
}

const MyRequests: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user?.role !== 'student') {
      window.location.href = '/';
      return;
    }
    loadRequests();
  }, [user]);

  useEffect(() => {
    filterRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requests, statusFilter, searchTerm]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const response = await requestAPI.getAll();
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (statusFilter) {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          text: 'Pending Review'
        };
      case 'approved':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'Approved'
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          text: 'Rejected'
        };
      case 'borrowed':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Package,
          text: 'Borrowed'
        };
      case 'returned':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: CheckCircle,
          text: 'Returned'
        };
      case 'overdue':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertTriangle,
          text: 'Overdue'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
          text: status
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntilReturn = (endDate: string) => {
    const today = new Date();
    const returnDate = new Date(endDate);
    const diffTime = returnDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const viewRequestDetails = (request: Request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  if (isLoading) {
    return <Loading message="Loading your requests..." />;
  }

  if (user?.role !== 'student') {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">This page is only available to students.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Equipment Requests</h1>
        <p className="mt-2 text-gray-600">
          Track the status of your equipment requests and borrowing history
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by equipment name or purpose..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="borrowed">Borrowed</option>
                  <option value="returned">Returned</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const statusInfo = getStatusInfo(request.status);
                const StatusIcon = statusInfo.icon;
                const daysUntilReturn = request.status === 'borrowed' ? 
                  getDaysUntilReturn(request.requestedEndDate) : null;

                return (
                  <div
                    key={request._id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {request.equipment.name}
                          </h3>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {request.equipment.category}
                          </span>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.text}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2 text-gray-400" />
                            Quantity: {request.quantity}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            Requested: {formatDate(request.requestDate)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                            Period: {formatDate(request.requestedStartDate)} - {formatDate(request.requestedEndDate)}
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-400" />
                            Purpose: {request.purpose}
                          </div>
                        </div>

                        {/* Status-specific information */}
                        {request.status === 'approved' && request.approvedBy && (
                          <div className="mt-3 p-3 bg-green-50 rounded-md">
                            <p className="text-sm text-green-800">
                              ✓ Approved by {request.approvedBy.firstName} {request.approvedBy.lastName} on {formatDate(request.approvalDate!)}
                            </p>
                          </div>
                        )}

                        {request.status === 'rejected' && request.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 rounded-md">
                            <p className="text-sm text-red-800">
                              ✗ Rejected: {request.rejectionReason}
                            </p>
                          </div>
                        )}

                        {request.status === 'borrowed' && daysUntilReturn !== null && (
                          <div className={`mt-3 p-3 rounded-md ${
                            daysUntilReturn < 0 ? 'bg-red-50' : 
                            daysUntilReturn <= 2 ? 'bg-yellow-50' : 'bg-blue-50'
                          }`}>
                            <p className={`text-sm ${
                              daysUntilReturn < 0 ? 'text-red-800' : 
                              daysUntilReturn <= 2 ? 'text-yellow-800' : 'text-blue-800'
                            }`}>
                              {daysUntilReturn < 0 ? 
                                `⚠️ Overdue by ${Math.abs(daysUntilReturn)} day(s)` :
                                daysUntilReturn === 0 ? 
                                  '📅 Due today' :
                                  `📅 Due in ${daysUntilReturn} day(s)`
                              }
                            </p>
                          </div>
                        )}

                        {request.status === 'returned' && request.penalty > 0 && (
                          <div className="mt-3 p-3 bg-red-50 rounded-md">
                            <p className="text-sm text-red-800">
                              💰 Penalty applied: ${request.penalty}
                              {request.damageReported && ' (Equipment damage reported)'}
                            </p>
                          </div>
                        )}

                        {request.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Notes:</span> {request.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => viewRequestDetails(request)}
                        className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter || searchTerm ? 'No matching requests' : 'No requests yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {statusFilter || searchTerm ? 
                  'Try adjusting your search criteria or filters.' :
                  'You haven\'t made any equipment requests yet.'
                }
              </p>
              {!statusFilter && !searchTerm && (
                <button
                  onClick={() => window.location.href = '/equipment'}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Browse Equipment
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">Request Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Equipment:</span>
                    <p className="text-gray-900">{selectedRequest.equipment.name}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Category:</span>
                    <p className="text-gray-900">{selectedRequest.equipment.category}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Quantity:</span>
                    <p className="text-gray-900">{selectedRequest.quantity}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <p className="text-gray-900">{getStatusInfo(selectedRequest.status).text}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Request Date:</span>
                    <p className="text-gray-900">{formatDate(selectedRequest.requestDate)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Requested Period:</span>
                    <p className="text-gray-900">
                      {formatDate(selectedRequest.requestedStartDate)} - {formatDate(selectedRequest.requestedEndDate)}
                    </p>
                  </div>
                  {selectedRequest.actualStartDate && (
                    <div>
                      <span className="font-medium text-gray-700">Actual Start:</span>
                      <p className="text-gray-900">{formatDate(selectedRequest.actualStartDate)}</p>
                    </div>
                  )}
                  {selectedRequest.actualEndDate && (
                    <div>
                      <span className="font-medium text-gray-700">Actual Return:</span>
                      <p className="text-gray-900">{formatDate(selectedRequest.actualEndDate)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <span className="font-medium text-gray-700">Purpose:</span>
                  <p className="text-gray-900 mt-1">{selectedRequest.purpose}</p>
                </div>

                {selectedRequest.notes && (
                  <div>
                    <span className="font-medium text-gray-700">Notes:</span>
                    <p className="text-gray-900 mt-1">{selectedRequest.notes}</p>
                  </div>
                )}

                {selectedRequest.rejectionReason && (
                  <div>
                    <span className="font-medium text-gray-700">Rejection Reason:</span>
                    <p className="text-red-900 mt-1">{selectedRequest.rejectionReason}</p>
                  </div>
                )}

                {selectedRequest.returnNotes && (
                  <div>
                    <span className="font-medium text-gray-700">Return Notes:</span>
                    <p className="text-gray-900 mt-1">{selectedRequest.returnNotes}</p>
                  </div>
                )}

                {selectedRequest.damageReported && (
                  <div className="p-3 bg-red-50 rounded-md">
                    <span className="font-medium text-red-700">Damage Reported:</span>
                    <p className="text-red-900 mt-1">{selectedRequest.damageDescription}</p>
                  </div>
                )}

                {selectedRequest.penalty > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-md">
                    <span className="font-medium text-yellow-700">Penalty Applied:</span>
                    <p className="text-yellow-900 mt-1">${selectedRequest.penalty}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;