import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Play } from 'lucide-react';
import { tripService } from '../../services/trip.service';
import { Trip } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { formatDateTime, formatWeight, formatCurrency } from '../../utils/formatters';

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadTrip = () => {
    if (id) {
      tripService.findById(Number(id))
        .then(setTrip)
        .catch(() => addToast({ type: 'error', title: 'Failed to load trip' }))
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => { loadTrip(); }, [id]);

  const handleStatusUpdate = async (status: string) => {
    setIsUpdating(true);
    try {
      await tripService.updateStatus(Number(id), status);
      addToast({ type: 'success', title: `Trip ${status.toLowerCase()}` });
      loadTrip();
    } catch (error: any) {
      addToast({ type: 'error', title: 'Failed', message: error.response?.data?.message });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!trip) return <div className="text-center py-20 text-gray-500">Trip not found</div>;

  const totalFuelCost = (trip as any).fuelLogs?.reduce((s: number, f: any) => s + f.totalCost, 0) || 0;
  const totalExpenses = (trip as any).expenses?.reduce((s: number, e: any) => s + e.amount, 0) || 0;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/trips')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Trips
      </button>

      <div className="card mb-6">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Trip #{trip.id}</h2>
            <p className="text-sm text-gray-500">{trip.origin} → {trip.destination}</p>
          </div>
          <StatusBadge status={trip.status} />
        </div>
        <div className="card-body space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><label className="text-xs text-gray-500 uppercase">Vehicle</label><p className="font-medium">{trip.vehicle?.plateNumber || '—'}</p></div>
            <div><label className="text-xs text-gray-500 uppercase">Driver</label><p className="font-medium">{trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : '—'}</p></div>
            <div><label className="text-xs text-gray-500 uppercase">Cargo</label><p className="font-medium">{formatWeight(trip.cargoWeight)}</p></div>
            <div><label className="text-xs text-gray-500 uppercase">Started</label><p className="font-medium">{formatDateTime(trip.startTime)}</p></div>
            <div><label className="text-xs text-gray-500 uppercase">Completed</label><p className="font-medium">{formatDateTime(trip.endTime)}</p></div>
            <div><label className="text-xs text-gray-500 uppercase">Duration</label><p className="font-medium">
              {trip.startTime && trip.endTime
                ? `${Math.round((new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime()) / 3600000)}h`
                : '—'}
            </p></div>
          </div>

          {trip.notes && (
            <div className="border-t pt-4">
              <label className="text-xs text-gray-500 uppercase">Notes</label>
              <p className="text-sm text-gray-700 mt-1">{trip.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t">
            {trip.status === 'PENDING' && (
              <button onClick={() => handleStatusUpdate('IN_PROGRESS')} disabled={isUpdating} className="btn-primary">
                <Play className="h-4 w-4" /> Start Trip
              </button>
            )}
            {trip.status === 'IN_PROGRESS' && (
              <>
                <button onClick={() => handleStatusUpdate('COMPLETED')} disabled={isUpdating} className="btn-success">
                  <CheckCircle className="h-4 w-4" /> Complete Trip
                </button>
                <button onClick={() => handleStatusUpdate('CANCELLED')} disabled={isUpdating} className="btn-danger">
                  <XCircle className="h-4 w-4" /> Cancel Trip
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fuel & Expenses Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Fuel Costs</h3>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalFuelCost)}</p>
          <p className="text-xs text-gray-500 mt-1">{(trip as any).fuelLogs?.length || 0} entries</p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Expenses</h3>
          <p className="text-2xl font-bold text-rose-600">{formatCurrency(totalExpenses)}</p>
          <p className="text-xs text-gray-500 mt-1">{(trip as any).expenses?.length || 0} entries</p>
        </div>
      </div>
    </div>
  );
}
