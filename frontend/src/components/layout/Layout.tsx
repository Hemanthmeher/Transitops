import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vehicles': 'Vehicles',
  '/vehicles/new': 'Add Vehicle',
  '/drivers': 'Drivers',
  '/drivers/new': 'Add Driver',
  '/trips': 'Trips',
  '/trips/new': 'Create Trip',
  '/maintenance': 'Maintenance',
  '/maintenance/new': 'Add Maintenance',
  '/fuel': 'Fuel Logs',
  '/fuel/new': 'Add Fuel Log',
  '/expenses': 'Expenses',
  '/expenses/new': 'Add Expense',
  '/reports': 'Reports',
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'TransitOps';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
