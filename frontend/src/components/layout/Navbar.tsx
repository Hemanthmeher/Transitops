import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6">
      <div className="min-w-0">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
          Welcome back, {user?.name || 'User'}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 capitalize">{user?.role?.toLowerCase().replace('_', ' ')} Dashboard</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 relative">
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full 
                       flex items-center justify-center text-white font-semibold text-xs sm:text-sm
                       cursor-pointer hover:shadow-md transition-shadow duration-200"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>

        {/* Profile dropdown for mobile */}
        {showProfileMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
            <div className="absolute right-0 top-12 z-20 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 animate-scale-in">
              <div className="px-4 py-2 border-b border-gray-100 sm:hidden">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                Role: <span className="font-medium text-gray-700 uppercase">{user?.role}</span>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </>
        )}

        <button
          onClick={logout}
          className="hidden sm:inline-flex px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
