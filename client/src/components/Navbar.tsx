import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', roles: ['student', 'staff', 'admin'] },
    { name: 'Equipment', path: '/equipment', roles: ['student', 'staff', 'admin'] },
    { name: 'My Requests', path: '/my-requests', roles: ['student'] },
    { name: 'Manage Requests', path: '/manage-requests', roles: ['staff', 'admin'] },
    { name: 'Add Equipment', path: '/equipment/new', roles: ['staff', 'admin'] },
    { name: 'Users', path: '/users', roles: ['admin'] },
  ];

  const visibleNavItems = navigationItems.filter(item => 
    !user || item.roles.includes(user.role)
  );

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-white text-blue-600 p-2 rounded-lg">
                <Settings className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl">Equipment Portal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-8">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}

          {/* User menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="text-sm">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs bg-blue-500 px-2 py-1 rounded">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="space-x-2">
                <Link
                  to="/login"
                  className="bg-blue-700 hover:bg-blue-800 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-blue-500">
            <div className="flex flex-col space-y-2">
              {user && (
                <div className="flex items-center space-x-2 px-3 py-2 text-sm">
                  <User className="h-5 w-5" />
                  <span>{user.firstName} {user.lastName}</span>
                  <span className="bg-blue-500 px-2 py-1 rounded text-xs">
                    {user.role}
                  </span>
                </div>
              )}
              {visibleNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-white hover:text-blue-200 px-3 py-2 text-sm font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;