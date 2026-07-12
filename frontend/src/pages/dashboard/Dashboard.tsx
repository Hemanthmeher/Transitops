import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Users, Route, Wrench, DollarSign, Fuel, TrendingUp, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardService } from '../../services/dashboard.service';
import { DashboardStats, StatusChartData, Trip } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6b7280'];
const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vehicleStatus, setVehicleStatus] = useState<StatusChartData[]>([]);
  const [tripStatus, setTripStatus] = useState<StatusChartData[]>([]);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsData, vehicleData, tripData, trips] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getVehicleStatusDistribution(),
        dashboardService.getTripStatusSummary(),
        dashboardService.getRecentTrips(),
      ]);
      setStats(statsData);
      setVehicleStatus(vehicleData);
      setTripStatus(tripData);
      setRecentTrips(trips);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Loading dashboard..." /></div>;

  const statCards = [
    { label: 'Total Vehicles', value: stats?.vehicles.total || 0, icon: Truck, color: 'bg-blue-500', sub: `${stats?.vehicles.available || 0} available` },
    { label: 'Available Drivers', value: stats?.drivers.available || 0, icon: Users, color: 'bg-emerald-500', sub: `${stats?.drivers.total || 0} total` },
    { label: 'Active Trips', value: stats?.trips.active || 0, icon: Route, color: 'bg-violet-500', sub: `${stats?.trips.today || 0} today` },
    { label: 'Pending Maintenance', value: stats?.maintenance.pending || 0, icon: Wrench, color: 'bg-amber-500', sub: 'Needs attention' },
    { label: 'Fuel Cost Today', value: formatCurrency(stats?.finances.fuelCostToday || 0), icon: Fuel, color: 'bg-orange-500', sub: 'All vehicles' },
    { label: 'Expenses Today', value: formatCurrency(stats?.finances.expensesToday || 0), icon: DollarSign, color: 'bg-rose-500', sub: 'All categories' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${card.color} bg-opacity-10`}>
                <card.icon className={`h-5 w-5 ${card.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Status */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Vehicle Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="name"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {vehicleStatus.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trip Status */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Trip Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tripStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {tripStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Trips</h3>
          <button onClick={() => navigate('/trips')} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">#{trip.id}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{trip.origin} → {trip.destination}</td>
                  <td className="px-6 py-3 text-sm text-gray-600">{trip.vehicle?.plateNumber}</td>
                  <td className="px-6 py-3"><StatusBadge status={trip.status} /></td>
                  <td className="px-6 py-3 text-sm text-gray-500">{formatDateTime(trip.startTime)}</td>
                </tr>
              ))}
              {recentTrips.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No trips yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
