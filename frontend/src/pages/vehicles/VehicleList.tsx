import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { vehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate, formatWeight } from '../../utils/formatters';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const loadVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await vehicleService.findAll({ page, limit: 10, status: statusFilter || undefined, search: search || undefined });
      setVehicles(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  const columns: Column<Vehicle>[] = [
    { key: 'plateNumber', header: 'Plate', sortable: true },
    { key: 'make', header: 'Make' },
    { key: 'model', header: 'Model' },
    { key: 'year', header: 'Year' },
    { key: 'capacity', header: 'Capacity', render: (v) => formatWeight(v.capacity) },
    { key: 'status', header: 'Status', render: (v) => <StatusBadge status={v.status} /> },
    { key: 'trips', header: 'Trips', render: (v) => v._count?.trips || 0 },
    { key: 'createdAt', header: 'Added', render: (v) => formatDate(v.createdAt) },
  ];

  return (
    <div>
      <PageHeader
        title="Vehicles"
        description="Manage your fleet vehicles"
        actions={
          <button onClick={() => navigate('/vehicles/new')} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Vehicle
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input w-full sm:w-44"
        >
          <option value="">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_TRIP">On Trip</option>
          <option value="IN_SHOP">In Shop</option>
          <option value="RETIRED">Retired</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        isLoading={isLoading}
        onRowClick={(v) => navigate(`/vehicles/${v.id}`)}
        emptyTitle="No vehicles found"
        emptyDescription="Add your first vehicle to get started"
        emptyAction={<button onClick={() => navigate('/vehicles/new')} className="btn-primary"><Plus className="h-4 w-4" /> Add Vehicle</button>}
      />

      {/* Pagination */}
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
