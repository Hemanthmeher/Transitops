import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Wrench } from 'lucide-react';
import { vehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatWeight } from '../../utils/formatters';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      vehicleService.findById(Number(id))
        .then(setVehicle)
        .catch(() => addToast({ type: 'error', title: 'Failed to load vehicle' }))
        .finally(() => setIsLoading(false));
    }
  }, [id, addToast]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to retire this vehicle?')) return;
    try {
      await vehicleService.delete(Number(id));
      addToast({ type: 'success', title: 'Vehicle retired' });
      navigate('/vehicles');
    } catch (error: any) {
      addToast({ type: 'error', title: 'Failed', message: error.response?.data?.message });
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!vehicle) return <div className="text-center py-20 text-gray-500">Vehicle not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/vehicles')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Vehicles
      </button>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{vehicle.plateNumber}</h2>
            <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
          </div>
          <StatusBadge status={vehicle.status} />
        </div>
        <div className="card-body space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><label className="text-xs text-gray-500 uppercase">Make</label><p className="font-medium">{vehicle.make}</p></div>
            <div><label className="text-xs text-gray-500 uppercase">Model</label><p className="font-medium">{vehicle.model}</p></div>
            <div><label className="text-xs text-gray-500 uppercase">Year</label><p className="font-medium">{vehicle.year}</p></div>
            <div><label className="text-xs text-gray-500 uppercase">Capacity</label><p className="font-medium">{formatWeight(vehicle.capacity)}</p></div>
            <div><label className="text-xs text-gray-500 uppercase">Total Trips</label><p className="font-medium">{vehicle._count?.trips || 0}</p></div>
            <div><label className="text-xs text-gray-500 uppercase">Maintenance Records</label><p className="font-medium">{vehicle._count?.maintenanceLogs || 0}</p></div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500">Added {formatDate(vehicle.createdAt)}</p>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => navigate(`/vehicles/${id}/edit`)} className="btn-secondary"><Edit className="h-4 w-4" /> Edit</button>
            <button onClick={() => navigate(`/maintenance/new?vehicleId=${id}`)} className="btn-warning"><Wrench className="h-4 w-4" /> Maintenance</button>
            <button onClick={handleDelete} className="btn-danger"><Trash2 className="h-4 w-4" /> Retire</button>
          </div>
        </div>
      </div>
    </div>
  );
}
