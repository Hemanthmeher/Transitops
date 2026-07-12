import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { driverService } from '../../services/driver.service';
import { Driver } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';

export default function DriverList() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const loadDrivers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await driverService.findAll({ page, limit: 10, status: statusFilter || undefined, search: search || undefined });
      setDrivers(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { loadDrivers(); }, [loadDrivers]);

  const columns: Column<Driver>[] = [
    { key: 'firstName', header: 'Name', render: (d) => `${d.firstName} ${d.lastName}` },
    { key: 'licenseNumber', header: 'License #' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'status', header: 'Status', render: (d) => <StatusBadge status={d.status} /> },
    { key: 'trips', header: 'Trips', render: (d) => d._count?.trips || 0 },
    { key: 'createdAt', header: 'Added', render: (d) => formatDate(d.createdAt) },
  ];

  return (
    <div>
      <PageHeader
        title="Drivers"
        description="Manage your drivers and their licenses"
        actions={
          <button onClick={() => navigate('/drivers/new')} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Driver
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search drivers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input w-full sm:w-44">
          <option value="">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_TRIP">On Trip</option>
          <option value="EXPIRED">Expired</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={drivers}
        isLoading={isLoading}
        onRowClick={(d) => navigate(`/drivers/${d.id}`)}
        emptyTitle="No drivers found"
        emptyDescription="Add your first driver to get started"
        emptyAction={<button onClick={() => navigate('/drivers/new')} className="btn-primary"><Plus className="h-4 w-4" /> Add Driver</button>}
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
