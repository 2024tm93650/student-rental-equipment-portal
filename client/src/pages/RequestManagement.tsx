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
  Eye,
  Check,
  X,
  RefreshCw,
  Users,
  TrendingUp
} from 'lucide-react';
import Loading from '../components/Loading';

interface Request {
  _id: string;
  requester: {
    firstName: string;
    lastName: string;
    email: string;
    studentId: string;
  };
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

const RequestManagement: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'borrow' | 'return' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [returnData, setReturnData] = useState({
    returnNotes: '',
    damageReported: false,
    damageDescription: '',
    penalty: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user && !['staff', 'admin'].includes(user.role)) {
      window.location.href = '/';
      return;
    }
    loadRequests();
    loadStats();
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

  const loadStats = async () => {
    try {
      const response = await requestAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
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
        request.requester.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requester.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requester.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.purpose.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by request date (newest first) and priority (pending first)
    filtered.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (b.status === 'pending' && a.status !== 'pending') return 1;
      return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
    });

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

  const handleAction = async (requestId: string, action: 'approve' | 'reject' | 'borrow' | 'return') => {
    const request = requests.find(r => r._id === requestId);
    if (!request) return;

    setSelectedRequest(request);
    setActionType(action);
    setActionNotes('');
    setRejectionReason('');
    setReturnData({
      returnNotes: '',
      damageReported: false,
      damageDescription: '',
      penalty: 0,
    });
  };

  const submitAction = async () => {
    if (!selectedRequest || !actionType) return;

    try {
      setIsProcessing(true);

      switch (actionType) {
        case 'approve':
          await requestAPI.approve(selectedRequest._id, actionNotes);
          break;
        case 'reject':
          if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
          }
          await requestAPI.reject(selectedRequest._id, rejectionReason);
          break;
        case 'borrow':
          await requestAPI.markAsBorrowed(selectedRequest._id, new Date().toISOString(), actionNotes);
          break;
        case 'return':
          await requestAPI.markAsReturned(selectedRequest._id, {
            actualEndDate: new Date().toISOString(),
            ...returnData,
          });
          break;
      }

      alert('Action completed successfully!');
      setActionType(null);
      setSelectedRequest(null);
      loadRequests();
      loadStats();
    } catch (error) {
      console.error('Failed to process action:', error);
      alert('Failed to process action. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const viewRequestDetails = (request: Request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  if (isLoading) {
    return <Loading message="Loading requests..." />;
  }

  if (user && !['staff', 'admin'].includes(user.role)) {
    return (
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You don't have permission to manage requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Request Management</h1>
        <p className="mt-2 text-gray-600">
          Review, approve, and manage equipment requests
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending Requests
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.statusBreakdown?.find((s: any) => s._id === 'pending')?.count || 0}
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
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Currently Borrowed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.statusBreakdown?.find((s: any) => s._id === 'borrowed')?.count || 0}
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
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Overdue Items
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.statusBreakdown?.find((s: any) => s._id === 'overdue')?.count || 0}
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
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Requests
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalRequests || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by equipment, requester, or purpose..."
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
            <button
              onClick={loadRequests}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
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

                return (
                  <div
                    key={request._id}
                    className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${
                      request.status === 'pending' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-400" />
                            {request.requester.firstName} {request.requester.lastName}
                          </div>
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

                        {request.notes && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Notes:</span> {request.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex items-center space-x-2">
                        <button
                          onClick={() => viewRequestDetails(request)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>

                        {/* Action Buttons */}
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAction(request._id, 'approve')}
                              className="p-2 text-green-600 hover:text-green-800 transition-colors"
                              title="Approve"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleAction(request._id, 'reject')}
                              className="p-2 text-red-600 hover:text-red-800 transition-colors"
                              title="Reject"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        )}

                        {request.status === 'approved' && (
                          <button
                            onClick={() => handleAction(request._id, 'borrow')}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            title="Mark as Borrowed"
                          >
                            Borrowed
                          </button>
                        )}

                        {request.status === 'borrowed' && (
                          <button
                            onClick={() => handleAction(request._id, 'return')}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            title="Mark as Returned"
                          >
                            Returned
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {statusFilter || searchTerm ? 'No matching requests' : 'No requests found'}
              </h3>
              <p className="text-gray-500">
                {statusFilter || searchTerm ? 
                  'Try adjusting your search criteria or filters.' :
                  'No equipment requests have been submitted yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionType && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {actionType === 'approve' && 'Approve Request'}
                  {actionType === 'reject' && 'Reject Request'}
                  {actionType === 'borrow' && 'Mark as Borrowed'}
                  {actionType === 'return' && 'Mark as Returned'}
                </h3>
                <button
                  onClick={() => setActionType(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {selectedRequest.equipment.name} - {selectedRequest.requester.firstName} {selectedRequest.requester.lastName}
                </p>
              </div>

              {actionType === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please provide a reason for rejection..."
                  />
                </div>
              )}

              {(actionType === 'approve' || actionType === 'borrow') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any additional notes..."
                  />
                </div>
              )}

              {actionType === 'return' && (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Notes
                    </label>
                    <textarea
                      value={returnData.returnNotes}
                      onChange={(e) => setReturnData(prev => ({ ...prev, returnNotes: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Condition of returned equipment..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="damageReported"
                      checked={returnData.damageReported}
                      onChange={(e) => setReturnData(prev => ({ ...prev, damageReported: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="damageReported" className="ml-2 block text-sm text-gray-900">
                      Damage reported
                    </label>
                  </div>

                  {returnData.damageReported && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Damage Description
                        </label>
                        <textarea
                          value={returnData.damageDescription}
                          onChange={(e) => setReturnData(prev => ({ ...prev, damageDescription: e.target.value }))}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Describe the damage..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Penalty Amount ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={returnData.penalty}
                          onChange={(e) => setReturnData(prev => ({ ...prev, penalty: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setActionType(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAction}
                  disabled={isProcessing || (actionType === 'reject' && !rejectionReason.trim())}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 
                    actionType === 'approve' ? 'Approve' :
                    actionType === 'reject' ? 'Reject' :
                    actionType === 'borrow' ? 'Mark Borrowed' :
                    'Mark Returned'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <span className="font-medium text-gray-700">Requester:</span>
                    <p className="text-gray-900">{selectedRequest.requester.firstName} {selectedRequest.requester.lastName}</p>
                    <p className="text-gray-600">{selectedRequest.requester.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Student ID:</span>
                    <p className="text-gray-900">{selectedRequest.requester.studentId}</p>
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

export default RequestManagement;