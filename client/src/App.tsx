import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import AddEquipment from './pages/AddEquipment';
import MyRequests from './pages/MyRequests';
import RequestManagement from './pages/RequestManagement';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              {/* Placeholder routes for additional pages */}
              <Route path="/equipment" element={
                <PrivateRoute>
                  <EquipmentList />
                </PrivateRoute>
              } />
              
              <Route path="/add-equipment" element={
                <PrivateRoute requiredRoles={['staff', 'admin']}>
                  <AddEquipment />
                </PrivateRoute>
              } />
              
              <Route path="/my-requests" element={
                <PrivateRoute requiredRoles={['student']}>
                  <MyRequests />
                </PrivateRoute>
              } />
              
              <Route path="/manage-requests" element={
                <PrivateRoute requiredRoles={['staff', 'admin']}>
                  <RequestManagement />
                </PrivateRoute>
              } />
              
              <Route path="/equipment/new" element={
                <PrivateRoute requiredRoles={['staff', 'admin']}>
                  <AddEquipment />
                </PrivateRoute>
              } />
              
              <Route path="/users" element={
                <PrivateRoute requiredRoles={['admin']}>
                  <UserManagement />
                </PrivateRoute>
              } />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* 404 Page */}
              <Route path="*" element={
                <div className="max-w-7xl mx-auto py-6 px-4 text-center">
                  <h1 className="text-4xl font-bold text-gray-900">404</h1>
                  <p className="text-gray-600 mt-2">Page not found</p>
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Go to Dashboard
                  </button>
                </div>
              } />
            </Routes>
          </main>
          
          {/* Toast notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
