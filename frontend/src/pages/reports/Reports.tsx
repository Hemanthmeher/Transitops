import React, { useEffect, useState, useRef } from 'react';
import { reportService } from '../../services/report.service';
import { ReportData } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { PIE_COLORS } from '../../utils/constants';

const Reports: React.FC = () => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [exporting, setExporting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const loadReport = async (start?: string, end?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getReport(start || undefined, end || undefined);
      setReport(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load report.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, []);

  const handleFilter = () => { loadReport(dateRange.start, dateRange.end); };

  const handleExport = async (type: string) => {
    setExporting(type);
    try {
      const csvText = await reportService.exportCsv(type, dateRange.start, dateRange.end);
      const blob = new Blob([csvText as string], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    setExporting('pdf');
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      if (!reportRef.current) return;
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f9fafb',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(null);
    }
  };

  if (isLoading) return <div className="page-container"><LoadingSpinner size="lg" message="Generating report..." /></div>;
  if (error) return <div className="page-container"><div className="card text-red-600">{error}</div></div>;
  if (!report) return null;

  const exportButton = (type: string, label: string) => (
    <button
      onClick={() => handleExport(type)}
      disabled={exporting === type}
      className="btn-secondary text-xs px-3 py-1.5"
    >
      {exporting === type ? 'Exporting...' : `📥 ${label}`}
    </button>
  );

  return (
    <div className="page-container" ref={reportRef}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Overview of operations and finances</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="input-field w-auto text-sm" />
          <span className="text-gray-400">to</span>
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="input-field w-auto text-sm" />
          <button onClick={handleFilter} className="btn-primary text-sm">Filter</button>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {exportButton('trips', 'CSV Trips')}
        {exportButton('fuel', 'CSV Fuel')}
        {exportButton('expenses', 'CSV Expenses')}
        <button
          onClick={handleExportPDF}
          disabled={exporting === 'pdf'}
          className="btn-primary text-xs px-3 py-1.5"
        >
          {exporting === 'pdf' ? 'Generating PDF...' : '📄 Export PDF'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Total Trips</p>
          <p className="text-2xl font-bold">{formatNumber(report.trips.total)}</p>
          <p className="text-xs text-gray-400 mt-1">{report.trips.completed} completed</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(report.revenue.total)}</p>
          <p className="text-xs text-gray-400 mt-1">Avg: {formatCurrency(report.trips.averageRevenue)}/trip</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Total Cost</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(report.expenses.totalCost + report.fuel.totalCost)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Net Profit</p>
          <p className={`text-2xl font-bold ${report.revenue.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(report.revenue.profit)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Fleet Utilization</p>
          <p className="text-2xl font-bold text-blue-600">{report.fleetUtilization}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Trips Over Time</h3>
          {report.chartData.tripsOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={report.chartData.tripsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" name="Trips" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-sm py-8 text-center">No data available</p>}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          {report.chartData.expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={report.chartData.expensesByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={100}
                  label={({ category, total }) => `${category}: ${formatCurrency(total)}`}>
                  {report.chartData.expensesByCategory.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 text-sm py-8 text-center">No data available</p>}
        </div>
      </div>

      {/* Fuel cost over time */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold mb-4">Fuel Cost Over Time</h3>
        {report.chartData.fuelCostOverTime.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={report.chartData.fuelCostOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#F59E0B" name="Cost ($)" strokeWidth={2} dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="liters" stroke="#3B82F6" name="Liters" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-gray-500 text-sm py-8 text-center">No data available</p>}
      </div>

      {/* Vehicle Performance */}
      {report.vehiclePerformance && report.vehiclePerformance.length > 0 && (
        <div className="card mb-8">
          <h3 className="text-lg font-semibold mb-4">Vehicle Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vehicle</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total Trips</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Completed</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Fuel Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.vehiclePerformance.map((v: any) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3 text-sm font-medium">{v.vehicle}</td>
                    <td className="px-4 py-3 text-sm text-right">{v.totalTrips}</td>
                    <td className="px-4 py-3 text-sm text-right">{v.completedTrips}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">{formatCurrency(v.totalRevenue)}</td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600">{formatCurrency(v.totalFuelCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expense breakdown */}
      {report.expenses.byCategory.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.expenses.byCategory.map((cat) => (
                  <tr key={cat.category}>
                    <td className="px-4 py-3 text-sm font-medium">{cat.category}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(cat.total)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-500">
                      {report.expenses.totalCost > 0 ? `${((cat.total / report.expenses.totalCost) * 100).toFixed(1)}%` : '0%'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-sm">Total</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(report.expenses.totalCost)}</td>
                  <td className="px-4 py-3 text-sm text-right">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
