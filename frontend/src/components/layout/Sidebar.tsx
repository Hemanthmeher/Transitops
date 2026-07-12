import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface SidebarItem {
  label: string;
  path: string;
  icon: string;
  roles?: string[];
}

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Vehicles', path: '/vehicles', icon: '🚛' },
  { label: 'Drivers', path: '/drivers', icon: '👤' },
  { label: 'Trips', path: '/trips', icon: '📍' },
  { label: 'Maintenance', path: '/maintenance', icon: '🔧' },
  { label: 'Fuel Logs', path: '/fuel', icon: '⛽' },
  { label: 'Expenses', path: '/expenses', icon: '💰' },
  { label: 'Reports', path: '/reports', icon: '📈' },
  { label: 'Settings', path: '/settings', icon: '⚙️', roles: ['ADMIN'] },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = sidebarItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center px-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            T
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">TransitOps</h1>
              <p className="text-xs text-gray-500">Fleet Management</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>{collapsed ? '→' : '←'}</span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
