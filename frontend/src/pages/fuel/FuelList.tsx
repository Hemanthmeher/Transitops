import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { fuelService } from '../../services/fuel.service';
import { FuelLog } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/PageHeader';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function FuelList() {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fuelService.findAll({ page, limit: 10 });
      setLogs(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load fuel logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const columns: Column<FuelLog>[] = [
    { key: 'date', header: 'Date', render: (l) => formatDate(l.date) },
    { key: 'vehicle', header: 'Vehicle', render: (l) => l.vehicle?.plateNumber || '—' },
    { key: 'liters', header: 'Liters', render: (l) => l.liters.toFixed(1) },
    { key: 'costPerLiter', header: 'Price/L', render: (l) => formatCurrency(l.costPerLiter) },
    { key: 'totalCost', header: 'Total', render: (l) => formatCurrency(l.totalCost) },
    { key: 'trip', header: 'Trip', render: (l) => l.trip ? `#${l.trip.id}` : '—' },
  ];

  return (
    <div>
      <PageHeader
        title="Fuel Logs"
        description="Track fuel consumption and costs"
        actions={
          <button onClick={() => navigate('/fuel/new')} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Fuel Log
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyTitle="No fuel logs"
        emptyDescription="Start tracking fuel consumption"
        emptyAction={<button onClick={() => navigate('/fuel/new')} className="btn-primary"><Plus className="h-4 w-4" /> Add Fuel Log</button>}
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
