import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ vehicleType: '', region: '', status: '' });
  const [refreshInterval, setRefreshInterval] = useState<number>(0);
  const navigate = useNavigate();

  const loadStats = useCallback(async () => {
    try {
      const activeFilters: any = {};
      if (filters.vehicleType) activeFilters.vehicleType = filters.vehicleType;
      if (filters.region) activeFilters.region = filters.region;
      if (filters.status) activeFilters.status = filters.status;
      const data = await dashboardService.getStats(activeFilters);
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadStats(); }, [loadStats]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(loadStats, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, loadStats]);

  if (isLoading) return <div className="page-container"><LoadingSpinner size="lg" message="Loading dashboard..." /></div>;
  if (error) return <div className="page-container"><div className="card text-red-600">{error}</div></div>;
  if (!stats) return null;

  const statCards = [
    { label: 'Total Vehicles', value: stats.totalVehicles, color: 'blue', icon: '🚛' },
    { label: 'Available', value: stats.availableVehicles, color: 'green', icon: '✅' },
    { label: 'In Shop', value: stats.inShopVehicles, color: 'yellow', icon: '🔧' },
    { label: 'Deployed', value: stats.deployedVehicles, color: 'purple', icon: '📋' },
    { label: 'Active Drivers', value: stats.totalDrivers, color: 'indigo', icon: '👤' },
    { label: 'Today Trips', value: stats.todayTrips, color: 'blue', icon: '📍' },
    { label: 'Pending Trips', value: stats.pendingTrips, color: 'orange', icon: '⏳' },
    { label: 'Fleet Utilization', value: `${stats.fleetUtilization}%`, color: 'teal', icon: '📊' },
  ];

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className="page-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your fleet operations</p>
        </div>

        {/* Filters & Refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          <select value={filters.vehicleType} onChange={(e) => setFilters(p => ({ ...p, vehicleType: e.target.value }))} className="input-field w-auto text-sm">
            <option value="">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Trailer">Trailer</option>
            <option value="Van">Van</option>
          </select>
          <select value={filters.region} onChange={(e) => setFilters(p => ({ ...p, region: e.target.value }))} className="input-field w-auto text-sm">
            <option value="">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
          <select value={filters.status} onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))} className="input-field w-auto text-sm">
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="IN_SHOP">In Shop</option>
          </select>
          <select value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))} className="input-field w-auto text-sm">
            <option value={0}>Auto-refresh off</option>
            <option value={30}>Every 30s</option>
            <option value={60}>Every 1min</option>
            <option value={300}>Every 5min</option>
          </select>
          <button onClick={loadStats} className="btn-secondary text-sm px-3 py-2">Refresh</button>
        </div>
      </div>

      {/* Stat cards - 8 cards now */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-xl border p-4 ${colorClasses[card.color] || 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm opacity-80">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Financial summary & Fuel Cost Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-lg">⛽</div>
            <h3 className="text-lg font-semibold text-gray-900">Fuel Cost Summary</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Fuel</span>
              <span className="font-semibold text-orange-600">{formatCurrency(stats.monthlyFuelCost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Other Expenses</span>
              <span className="font-semibold text-gray-900">{formatCurrency(stats.monthlyExpenseCost)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-gray-800 font-medium">Total Monthly</span>
              <span className="font-bold text-lg text-gray-900">{formatCurrency(stats.monthlyFuelCost + stats.monthlyExpenseCost)}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600 text-lg">🔧</div>
            <h3 className="text-lg font-semibold text-gray-900">Maintenance Alerts</h3>
          </div>
          {stats.maintenanceAlerts && stats.maintenanceAlerts.length > 0 ? (
            <div className="space-y-2">
              {stats.maintenanceAlerts.slice(0, 4).map((alert: any) => (
                <div key={alert.id} className={`flex items-center justify-between p-2.5 rounded-lg border ${
                  alert.status === 'DUE_SOON' 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate ${
                      alert.status === 'DUE_SOON' ? 'text-orange-800' : 'text-red-800'
                    }">{alert.description}</p>
                    <p className="text-xs ${
                      alert.status === 'DUE_SOON' ? 'text-orange-600' : 'text-red-600'
                    }">{alert.vehicle?.plateNumber} • {formatDate(alert.scheduledDate)}</p>
                  </div>
                  <StatusBadge status={alert.status} />
                </div>
              ))}
              {stats.maintenanceAlerts.length > 4 && (
                <p className="text-xs text-gray-500 text-center pt-1">+{stats.maintenanceAlerts.length - 4} more alerts</p>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm text-gray-500">No maintenance alerts</p>
              <p className="text-xs text-gray-400 mt-1">All vehicles are in good shape</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600 text-lg">📊</div>
            <h3 className="text-lg font-semibold text-gray-900">Fleet Overview</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Vehicles</span>
              <span className="font-semibold">{stats.availableVehicles} / {stats.totalVehicles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Drivers</span>
              <span className="font-semibold">{stats.availableDrivers} / {stats.totalDrivers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">In Shop</span>
              <span className="font-semibold text-yellow-600">{stats.inShopVehicles}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Today's Trips</span>
              <span className="font-semibold text-blue-600">{stats.todayTrips}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Trips</span>
              <span className="font-semibold text-orange-600">{stats.pendingTrips}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status distributions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Status</h3>
          <div className="space-y-3">
            {stats.vehicleStatusDistribution.map((v) => (
              <div key={v.status} className="flex justify-between items-center">
                <StatusBadge status={v.status} />
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${stats.totalVehicles > 0 ? (v.count / stats.totalVehicles) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{v.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Status</h3>
          <div className="space-y-3">
            {stats.driverStatusDistribution.map((d) => (
              <div key={d.status} className="flex justify-between items-center">
                <StatusBadge status={d.status} />
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${stats.totalDrivers > 0 ? (d.count / stats.totalDrivers) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{d.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Status</h3>
          <div className="space-y-3">
            {stats.tripStatusDistribution?.map((t: { status: string; count: number }) => (
              <div key={t.status} className="flex justify-between items-center">
                <StatusBadge status={t.status} />
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${stats.completedTrips + stats.activeTrips + stats.pendingTrips > 0 ? (t.count / (stats.completedTrips + stats.activeTrips + stats.pendingTrips)) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-8 text-right">{t.count}</span>
                </div>
              </div>
            )) || <p className="text-sm text-gray-500">No trip data</p>}
          </div>
        </div>
      </div>

      {/* Recent trips */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Trips</h3>
          <button onClick={() => navigate('/trips')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View all
          </button>
        </div>
        {stats.recentTrips.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">No trips yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Route</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Driver</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
                    <td className="px-4 py-3 text-sm">{trip.origin} → {trip.destination}</td>
                    <td className="px-4 py-3 text-sm">{trip.vehicle?.plateNumber || '-'}</td>
                    <td className="px-4 py-3 text-sm">{trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={trip.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(trip.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
