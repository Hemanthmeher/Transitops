import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService } from '../../services/trip.service';
import { Trip } from '../../types';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';

const TripList: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const loadTrips = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const result = await tripService.findAll(params);
      setTrips(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error('Failed to load trips:', error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  const columns = [
    { key: 'route', header: 'Route', render: (t: Trip) => <span className="font-medium">{t.origin} → {t.destination}</span> },
    { key: 'vehicle', header: 'Vehicle', render: (t: Trip) => t.vehicle?.plateNumber || '-' },
    { key: 'driver', header: 'Driver', render: (t: Trip) => t.driver ? `${t.driver.firstName} ${t.driver.lastName}` : '-' },
    { key: 'revenue', header: 'Revenue', render: (t: Trip) => t.revenue ? formatCurrency(t.revenue) : '-' },
    { key: 'status', header: 'Status', render: (t: Trip) => <StatusBadge status={t.status} /> },
    { key: 'date', header: 'Date', render: (t: Trip) => formatDate(t.createdAt) },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Trips" subtitle="Manage dispatches and trips" actionLabel="New Trip" actionPath="/trips/new" />
      <div className="mb-4 flex gap-3 flex-wrap">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Statuses</option>
          <option value="REQUESTED">Requested</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        {statusFilter && (
          <button onClick={() => setStatusFilter('')} className="text-xs px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
            ✕ Clear filter
          </button>
        )}
      </div>
      <DataTable
        columns={columns}
        data={trips}
        isLoading={isLoading}
        meta={meta}
        onPageChange={(page) => loadTrips(page)}
        onRowClick={(t: Trip) => navigate(`/trips/${t.id}`)}
        keyExtractor={(t: Trip) => t.id}
        emptyTitle="No trips found"
        emptyMessage="Create your first dispatch to get started."
        emptyActionLabel="New Trip"
        emptyActionPath="/trips/new"
      />
    </div>
  );
};

export default TripList;
