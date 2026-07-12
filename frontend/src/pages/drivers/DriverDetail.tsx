import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { driverService } from '../../services/driver.service';
import { Driver } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export default function DriverDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      driverService.findById(Number(id))
        .then(setDriver)
        .catch(() => addToast({ type: 'error', title: 'Failed to load driver' }))
        .finally(() => setIsLoading(false));
    }
  }, [id, addToast]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to suspend this driver?')) return;
    try {
      await driverService.delete(Number(id));
      addToast({ type: 'success', title: 'Driver suspended' });
      navigate('/drivers');
    } catch (error: any) {
      addToast({ type: 'error', title: 'Failed', message: error.response?.data?.message });
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!driver) return <div className="text-center py-20 text-gray-500">Driver not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/drivers')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Drivers
      </button>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{driver.firstName} {driver.lastName}</h2>
            <p className="text-sm text-gray-500">{driver.email}</p>
          </div>
          <StatusBadge status={driver.status} />
        </div>
        <div className="card-body space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500 uppercase">License #</label><p className="font-medium">{driver.licenseNumber}</p></div>
            <div><label className="text-xs text-gray-500 uppercase">Phone</label><p className="font-medium">{driver.phone}</p></div>
            <div><label className="text-xs text-gray-500 uppercase">Total Trips</label><p className="font-medium">{driver._count?.trips || 0}</p></div>
          </div>

          <div className="border-t pt-4">
            <p className="text-xs text-gray-500">Added {formatDate(driver.createdAt)}</p>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => navigate(`/drivers/${id}/edit`)} className="btn-secondary"><Edit className="h-4 w-4" /> Edit</button>
            <button onClick={handleDelete} className="btn-danger"><Trash2 className="h-4 w-4" /> Suspend</button>
          </div>
        </div>
      </div>
    </div>
  );
}
