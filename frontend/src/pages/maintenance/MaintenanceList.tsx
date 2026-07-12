import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { maintenanceService } from '../../services/maintenance.service';
import { MaintenanceLog } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function MaintenanceList() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await maintenanceService.findAll({ page, limit: 10, status: statusFilter || undefined });
      setLogs(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load maintenance logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const columns: Column<MaintenanceLog>[] = [
    { key: 'id', header: 'ID', render: (l) => `#${l.id}` },
    { key: 'vehicle', header: 'Vehicle', render: (l) => l.vehicle?.plateNumber || '—' },
    { key: 'description', header: 'Description' },
    { key: 'type', header: 'Type', render: (l) => <StatusBadge status={l.type} /> },
    { key: 'cost', header: 'Cost', render: (l) => formatCurrency(l.cost) },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} /> },
    { key: 'scheduledDate', header: 'Scheduled', render: (l) => formatDate(l.scheduledDate) },
  ];

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Track vehicle maintenance and repairs"
        actions={
          <button onClick={() => navigate('/maintenance/new')} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Maintenance
          </button>
        }
      />

      <div className="flex gap-3 mb-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input w-full sm:w-44">
          <option value="">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyTitle="No maintenance logs"
        emptyDescription="Add your first maintenance record"
        emptyAction={<button onClick={() => navigate('/maintenance/new')} className="btn-primary"><Plus className="h-4 w-4" /> Add Maintenance</button>}
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm">Previous</button>
          <span className="px-4 py-1.5 text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm">Next</button>
        </div>
      )}
    </div>
  );
}
