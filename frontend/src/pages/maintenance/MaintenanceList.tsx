import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceService } from '../../services/maintenance.service';
import { MaintenanceLog } from '../../types';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

const MaintenanceList: React.FC = () => {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  const loadLogs = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const result = await maintenanceService.findAll(params);
      setLogs(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error('Failed to load maintenance logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleMarkDueSoon = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await maintenanceService.markDueSoon(id);
      addToast('success', 'Marked as due soon.');
      loadLogs();
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Failed to update.');
    }
  };

  const handleComplete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Mark this maintenance as completed?')) return;
    try {
      await maintenanceService.complete(id);
      addToast('success', 'Maintenance completed!');
      loadLogs();
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Failed to complete.');
    }
  };

  const handleCancel = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Cancel this maintenance record?')) return;
    try {
      await maintenanceService.cancel(id);
      addToast('success', 'Maintenance cancelled.');
      loadLogs();
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Failed to cancel.');
    }
  };

  const columns = [
    { key: 'vehicle', header: 'Vehicle', render: (m: MaintenanceLog) => (
      <span className="font-medium">{m.vehicle?.plateNumber || '-'}</span>
    )},
    { key: 'type', header: 'Type', render: (m: MaintenanceLog) => <StatusBadge status={m.type} /> },
    { key: 'description', header: 'Description', render: (m: MaintenanceLog) => (
      <span className="text-gray-600 max-w-[200px] truncate block">{m.description}</span>
    )},
    { key: 'cost', header: 'Cost', render: (m: MaintenanceLog) => m.cost ? (
      <span className="font-medium">{formatCurrency(m.cost)}</span>
    ) : <span className="text-gray-400">-</span> },
    { key: 'status', header: 'Status', render: (m: MaintenanceLog) => <StatusBadge status={m.status} /> },
    { key: 'date', header: 'Date', render: (m: MaintenanceLog) => (
      <span className="text-gray-500 text-xs">{formatDate(m.scheduledDate)}</span>
    )},
    { key: 'actions', header: 'Actions', render: (m: MaintenanceLog) => (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => navigate(`/maintenance/${m.id}`)} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">
          View
        </button>
        {m.status === 'OPEN' && (
          <button onClick={(e) => handleMarkDueSoon(m.id, e)} className="text-xs px-2 py-1 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 transition-colors">
            Due Soon
          </button>
        )}
        {['OPEN', 'DUE_SOON'].includes(m.status) && (
          <>
            <button onClick={(e) => handleComplete(m.id, e)} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors">
              ✓
            </button>
            <button onClick={(e) => handleCancel(m.id, e)} className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors">
              ✕
            </button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <PageHeader title="Maintenance" subtitle="Track vehicle maintenance and service schedules" actionLabel="Add Maintenance" actionPath="/maintenance/new" />
      <div className="mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="DUE_SOON">Due Soon</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <DataTable columns={columns} data={logs} isLoading={isLoading} meta={meta}
        onPageChange={(page) => loadLogs(page)}
        onRowClick={(m: MaintenanceLog) => navigate(`/maintenance/${m.id}`)}
        keyExtractor={(m: MaintenanceLog) => m.id}
        emptyTitle="No maintenance records" emptyMessage="Log your first maintenance record." emptyActionLabel="Add Maintenance" emptyActionPath="/maintenance/new" />
    </div>
  );
};

export default MaintenanceList;
