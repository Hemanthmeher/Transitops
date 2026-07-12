import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { tripService } from '../../services/trip.service';
import { Trip } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatWeight } from '../../utils/formatters';

export default function TripList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const loadTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await tripService.findAll({ page, limit: 10, status: statusFilter || undefined });
      setTrips(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  const columns: Column<Trip>[] = [
    { key: 'id', header: 'ID', render: (t) => `#${t.id}` },
    { key: 'origin', header: 'Origin' },
    { key: 'destination', header: 'Destination', render: (t) => t.destination },
    { key: 'vehicle', header: 'Vehicle', render: (t) => t.vehicle?.plateNumber || '—' },
    { key: 'driver', header: 'Driver', render: (t) => t.driver ? `${t.driver.firstName} ${t.driver.lastName}` : '—' },
    { key: 'cargoWeight', header: 'Cargo', render: (t) => formatWeight(t.cargoWeight) },
    { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'createdAt', header: 'Created', render: (t) => formatDate(t.createdAt) },
  ];

  return (
    <div>
      <PageHeader
        title="Trips"
        description="Manage and track all trips"
        actions={
          <button onClick={() => navigate('/trips/new')} className="btn-primary">
            <Plus className="h-4 w-4" /> Create Trip
          </button>
        }
      />

      <div className="flex gap-3 mb-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input w-full sm:w-44">
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={trips}
        isLoading={isLoading}
        onRowClick={(t) => navigate(`/trips/${t.id}`)}
        emptyTitle="No trips found"
        emptyDescription="Create your first trip to get started"
        emptyAction={<button onClick={() => navigate('/trips/new')} className="btn-primary"><Plus className="h-4 w-4" /> Create Trip</button>}
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
