import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Download, TrendingUp, Fuel, DollarSign, Truck } from 'lucide-react';
import { reportService } from '../../services/report.service';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { formatCurrency } from '../../utils/formatters';

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type ReportType = 'trips' | 'fuel' | 'expenses' | 'utilization';

export default function Reports() {
  const { addToast } = useToast();
  const [activeReport, setActiveReport] = useState<ReportType>('trips');
  const [isLoading, setIsLoading] = useState(false);
  const [tripReport, setTripReport] = useState<any>(null);
  const [fuelReport, setFuelReport] = useState<any>(null);
  const [expenseReport, setExpenseReport] = useState<any>(null);
  const [utilization, setUtilization] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const loadReport = async (type: ReportType) => {
    setIsLoading(true);
    setActiveReport(type);
    try {
      const params = { startDate: dateRange.start || undefined, endDate: dateRange.end || undefined };
      switch (type) {
        case 'trips': {
          const data = await reportService.getTripReport(params.startDate, params.endDate);
          setTripReport(data);
          break;
        }
        case 'fuel': {
          const data = await reportService.getFuelReport(params.startDate, params.endDate);
          setFuelReport(data);
          break;
        }
        case 'expenses': {
          const data = await reportService.getExpenseReport(params.startDate, params.endDate);
          setExpenseReport(data);
          break;
        }
        case 'utilization': {
          const data = await reportService.getFleetUtilization(params.startDate, params.endDate);
          setUtilization(data);
          break;
        }
      }
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to load report' });
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial report on mount
  useEffect(() => {
    loadReport('trips');
  }, []);

  const exportCsv = async () => {
    try {
      await reportService.exportTripsCsv(dateRange.start || undefined, dateRange.end || undefined);
      addToast({ type: 'success', title: 'CSV exported' });
    } catch (error) {
      addToast({ type: 'error', title: 'Export failed' });
    }
  };

  const tabs = [
    { key: 'trips' as ReportType, label: 'Trips', icon: TrendingUp },
    { key: 'fuel' as ReportType, label: 'Fuel', icon: Fuel },
    { key: 'expenses' as ReportType, label: 'Expenses', icon: DollarSign },
    { key: 'utilization' as ReportType, label: 'Utilization', icon: Truck },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Analytics and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange(d => ({ ...d, start: e.target.value }))} className="input text-sm w-36" />
          <span className="text-gray-400">to</span>
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange(d => ({ ...d, end: e.target.value }))} className="input text-sm w-36" />
          <button onClick={() => loadReport(activeReport)} className="btn-primary btn-sm">Filter</button>
          {activeReport === 'trips' && <button onClick={exportCsv} className="btn-secondary btn-sm"><Download className="h-4 w-4" /> CSV</button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => loadReport(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeReport === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" text="Generating report..." /></div>
      ) : (
        <>
          {/* Trip Report */}
          {activeReport === 'trips' && tripReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card p-4"><p className="text-2xl font-bold text-gray-900">{tripReport.summary.totalTrips}</p><p className="text-sm text-gray-500">Total Trips</p></div>
                <div className="card p-4"><p className="text-2xl font-bold text-emerald-600">{tripReport.summary.completedTrips}</p><p className="text-sm text-gray-500">Completed</p></div>
                <div className="card p-4"><p className="text-2xl font-bold text-rose-600">{tripReport.summary.cancelledTrips}</p><p className="text-sm text-gray-500">Cancelled</p></div>
                <div className="card p-4"><p className="text-2xl font-bold text-blue-600">{tripReport.summary.activeTrips}</p><p className="text-sm text-gray-500">Active</p></div>
                <div className="card p-4"><p className="text-2xl font-bold text-orange-600">{formatCurrency(tripReport.summary.totalFuelCost)}</p><p className="text-sm text-gray-500">Fuel Cost</p></div>
                <div className="card p-4"><p className="text-2xl font-bold text-rose-600">{formatCurrency(tripReport.summary.totalExpenses)}</p><p className="text-sm text-gray-500">Expenses</p></div>
                <div className="card p-4"><p className="text-2xl font-bold text-gray-900">{(tripReport.summary.totalCargoMoved / 1000).toFixed(1)}t</p><p className="text-sm text-gray-500">Cargo Moved</p></div>
                <div className="card p-4"><p className="text-2xl font-bold text-gray-900">{tripReport.summary.averageCargoPerTrip.toFixed(1)} kg</p><p className="text-sm text-gray-500">Avg Cargo/Trip</p></div>
              </div>
            </div>
          )}

          {/* Fuel Report */}
          {activeReport === 'fuel' && fuelReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card p-4"><p className="text-2xl font-bold text-gray-900">{fuelReport.summary.totalFuelLogs}</p><p className="text-sm text-gray-500">Fuel Entries</p></div>
                <div className="card p-4"><p className="text-2xl font-bold text-blue-600">{fuelReport.summary.totalLiters.toFixed(1)} L</p><p className="text-sm text-gray-500">Total Liters</p></div>
                <div className="card p-4"><p className="text-2xl font-bold text-orange-600">{formatCurrency(fuelReport.summary.totalCost)}</p><p className="text-sm text-gray-500">Total Cost</p></div>
                <div className="card p-4"><p className="text-2xl font-bold text-gray-900">${fuelReport.summary.avgCostPerLiter.toFixed(3)}</p><p className="text-sm text-gray-500">Avg Price/L</p></div>
              </div>
            </div>
          )}

          {/* Expense Report */}
          {activeReport === 'expenses' && expenseReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="card p-4"><p className="text-2xl font-bold text-gray-900">{expenseReport.summary.totalExpenses}</p><p className="text-sm text-gray-500">Total Entries</p></div>
                <div className="card p-4"><p className="text-2xl font-bold text-rose-600">{formatCurrency(expenseReport.summary.totalAmount)}</p><p className="text-sm text-gray-500">Total Amount</p></div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">By Category</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={Object.entries(expenseReport.summary.byCategory).map(([name, count]) => ({ name, count }))} cx="50%" cy="50%" outerRadius={100} dataKey="count" nameKey="name" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                        {Object.keys(expenseReport.summary.byCategory).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Utilization Report */}
          {activeReport === 'utilization' && utilization.length > 0 && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Trips</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {utilization.map((v: any) => (
                      <tr key={v.plateNumber} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{v.plateNumber} ({v.make} {v.model})</td>
                        <td className="px-4 py-3"><span className="badge-neutral">{v.status}</span></td>
                        <td className="px-4 py-3 text-sm">{v.totalTrips}</td>
                        <td className="px-4 py-3 text-sm">{v.completedTrips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
