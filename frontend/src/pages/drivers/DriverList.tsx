import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { driverService } from '../../services/driver.service';
import { Driver } from '../../types';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';

const DriverList: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadDrivers = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const result = await driverService.findAll({ page, limit: 10, search: search || undefined });
      setDrivers(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error('Failed to load drivers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => { loadDrivers(); }, [loadDrivers]);

  const safetyColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 85) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const columns = [
    { key: 'name', header: 'Name', render: (d: Driver) => <span className="font-medium">{d.firstName} {d.lastName}</span> },
    { key: 'licenseNumber', header: 'License #' },
    { key: 'email', header: 'Email' },
    { key: 'experience', header: 'Exp', render: (d: Driver) => d.experience ? `${d.experience}yrs` : '-' },
    { key: 'safetyScore', header: 'Safety', render: (d: Driver) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${safetyColor(d.safetyScore)}`}>
        {d.safetyScore ?? '-'}
      </span>
    )},
    { key: 'status', header: 'Status', render: (d: Driver) => <StatusBadge status={d.status} /> },
    { key: 'trips', header: 'Trips', render: (d: Driver) => d._count?.trips || 0 },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Drivers" subtitle="Manage drivers and safety scores" actionLabel="Add Driver" actionPath="/drivers/new" />
      <div className="mb-4">
        <input type="text" placeholder="Search by name, email, or license..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field max-w-md" />
      </div>
      <DataTable columns={columns} data={drivers} isLoading={isLoading} meta={meta}
        onPageChange={(page) => loadDrivers(page)}
        onRowClick={(d: Driver) => navigate(`/drivers/${d.id}`)}
        keyExtractor={(d: Driver) => d.id}
        emptyTitle="No drivers found" emptyMessage="Add your first driver." emptyActionLabel="Add Driver" emptyActionPath="/drivers/new" />
    </div>
  );
};

export default DriverList;
