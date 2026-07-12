import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { vehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatWeight } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

const VehicleDetail: React.FC = () => {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (id) {
      vehicleService.findById(parseInt(id))
        .then(setVehicle)
        .catch(() => addToast('error', 'Failed to load vehicle details.'))
        .finally(() => setIsLoading(false));
    }
  }, [id, addToast]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await vehicleService.delete(parseInt(id!));
      addToast('success', 'Vehicle deleted.');
      navigate('/vehicles');
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Failed to delete vehicle.');
    }
  };

  if (isLoading) return <div className="page-container"><LoadingSpinner /></div>;
  if (!vehicle) return <div className="page-container"><div className="card text-red-500">Vehicle not found.</div></div>;

  return (
    <div className="page-container max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{vehicle.plateNumber}</h1>
          <p className="text-gray-500">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/vehicles/${id}/edit`)} className="btn-secondary">Edit</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Status</p>
          <StatusBadge status={vehicle.status} size="md" />
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Capacity</p>
          <p className="text-lg font-semibold">{formatWeight(vehicle.capacity)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Fuel Type</p>
          <p className="text-lg font-semibold">{vehicle.fuelType || 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Recent Trips</h3>
          {vehicle.trips && vehicle.trips.length > 0 ? (
            <div className="space-y-2">
              {vehicle.trips.map((t) => (
                <div key={t.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer" onClick={() => navigate(`/trips/${t.id}`)}>
                  <div>
                    <p className="text-sm font-medium">{t.origin} → {t.destination}</p>
                    <p className="text-xs text-gray-500">{t.driver ? `${t.driver.firstName} ${t.driver.lastName}` : 'N/A'}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-500">No trips yet.</p>}
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-3">Maintenance History</h3>
          {vehicle.maintenanceLogs && vehicle.maintenanceLogs.length > 0 ? (
            <div className="space-y-2">
              {vehicle.maintenanceLogs.map((m) => (
                <div key={m.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">{m.description}</p>
                    <p className="text-xs text-gray-500">{formatDate(m.scheduledDate)}</p>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-500">No maintenance logs.</p>}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
