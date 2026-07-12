import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../types';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';

const VehicleList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const loadVehicles = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const result = await vehicleService.findAll({ page, limit: 10, search: search || undefined });
      setVehicles(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => { loadVehicles(); }, [loadVehicles]);

  const columns = [
    { key: 'plateNumber', header: 'Vehicle #', render: (v: Vehicle) => <span className="font-medium">{v.plateNumber}</span> },
    { key: 'status', header: 'Status', render: (v: Vehicle) => <StatusBadge status={v.status} /> },
    { key: 'type', header: 'Type', render: (v: Vehicle) => v.type || '-' },
    { key: 'capacity', header: 'Capacity', render: (v: Vehicle) => `${(v.capacity / 1000).toFixed(1)}T` },
    { key: 'mileage', header: 'Mileage', render: (v: Vehicle) => v.mileage ? `${v.mileage.toLocaleString()} km` : '-' },
    { key: 'fuelType', header: 'Fuel', render: (v: Vehicle) => v.fuelType ? (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">{v.fuelType}</span>
    ) : '-' },
    { key: 'actions', header: 'Actions', render: (v: Vehicle) => (
      <div className="flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${v.id}/edit`); }} className="text-xs px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors">Edit</button>
        <button onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${v.id}`); }} className="text-xs px-2.5 py-1.5 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">View</button>
      </div>
    )},
  ];

  return (
    <div className="page-container">
      <PageHeader title="Vehicles" subtitle="Manage your fleet vehicles" actionLabel="Add Vehicle" actionPath="/vehicles/new" />
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by plate number, make, or model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-md"
        />
      </div>
      <DataTable
        columns={columns}
        data={vehicles}
        isLoading={isLoading}
        meta={meta}
        onPageChange={(page) => loadVehicles(page)}
        onRowClick={(v: Vehicle) => navigate(`/vehicles/${v.id}`)}
        keyExtractor={(v: Vehicle) => v.id}
        emptyTitle="No vehicles found"
        emptyMessage="Add your first vehicle to get started."
        emptyActionLabel="Add Vehicle"
        emptyActionPath="/vehicles/new"
      />
    </div>
  );
};

export default VehicleList;
