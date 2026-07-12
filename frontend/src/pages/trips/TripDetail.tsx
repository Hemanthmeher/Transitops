import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService } from '../../services/trip.service';
import { Trip } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency, formatWeight, formatDateTime } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

const TripDetail: React.FC = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (id) {
      tripService.findById(parseInt(id))
        .then(setTrip)
        .catch(() => addToast('error', 'Failed to load trip details.'))
        .finally(() => setIsLoading(false));
    }
  }, [id, addToast]);

  const handleAction = async (action: 'assign' | 'start' | 'complete' | 'cancel') => {
    try {
      const tripId = parseInt(id!);
      let updated: any;
      switch (action) {
        case 'assign': updated = await tripService.assign(tripId); addToast('success', 'Trip assigned!'); break;
        case 'start': updated = await tripService.startTrip(tripId); addToast('success', 'Trip started!'); break;
        case 'complete': updated = await tripService.complete(tripId, actionNotes); addToast('success', 'Trip completed!'); setActionNotes(''); break;
        case 'cancel': updated = await tripService.cancel(tripId, actionNotes); addToast('success', 'Trip cancelled.'); setActionNotes(''); break;
      }
      const full = await tripService.findById(tripId);
      setTrip(full);
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || `Failed to ${action} trip.`);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this trip?')) return;
    try {
      await tripService.delete(parseInt(id!));
      addToast('success', 'Trip deleted.');
      navigate('/trips');
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Failed to delete trip.');
    }
  };

  if (isLoading) return <div className="page-container"><LoadingSpinner /></div>;
  if (!trip) return <div className="page-container"><div className="card text-red-500">Trip not found.</div></div>;

  const activeStatuses = ['REQUESTED', 'ASSIGNED', 'IN_PROGRESS'];

  return (
    <div className="page-container max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip #{trip.id}</h1>
          <p className="text-gray-500">{trip.origin} → {trip.destination}</p>
        </div>
        <StatusBadge status={trip.status} size="md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Vehicle</p>
          <p className="text-lg font-semibold">{trip.vehicle?.plateNumber || 'N/A'}</p>
          <p className="text-xs text-gray-500">{trip.vehicle?.make} {trip.vehicle?.model}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Driver</p>
          <p className="text-lg font-semibold">{trip.driver ? `${trip.driver.firstName} ${trip.driver.lastName}` : 'N/A'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Cargo</p>
          <p className="text-lg font-semibold">{trip.cargoWeight ? formatWeight(trip.cargoWeight) : 'N/A'}</p>
          {trip.cargoType && <p className="text-xs text-gray-500">{trip.cargoType}</p>}
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-3">Trip Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Origin:</span> <span className="font-medium">{trip.origin}</span></div>
          <div><span className="text-gray-500">Destination:</span> <span className="font-medium">{trip.destination}</span></div>
          <div><span className="text-gray-500">Cargo Type:</span> <span className="font-medium">{trip.cargoType || '-'}</span></div>
          <div><span className="text-gray-500">Scheduled:</span> <span className="font-medium">{formatDate(trip.scheduledDate)}</span></div>
          <div><span className="text-gray-500">Started:</span> <span className="font-medium">{trip.startTime ? formatDateTime(trip.startTime) : '-'}</span></div>
          <div><span className="text-gray-500">Completed:</span> <span className="font-medium">{trip.completedDate ? formatDate(trip.completedDate) : '-'}</span></div>
          <div><span className="text-gray-500">Revenue:</span> <span className="font-medium">{trip.revenue ? formatCurrency(trip.revenue) : '-'}</span></div>
          <div><span className="text-gray-500">Created:</span> <span className="font-medium">{formatDateTime(trip.createdAt)}</span></div>
        </div>
        {trip.description && (
          <div className="mt-3">
            <span className="text-gray-500 text-sm">Description:</span>
            <p className="text-sm mt-1">{trip.description}</p>
          </div>
        )}
      </div>

      {/* Status Workflow Actions */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Status Workflow</h3>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {['REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <span className="text-gray-300">→</span>}
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                trip.status === s ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                ['COMPLETED', 'CANCELLED'].includes(trip.status) && s === 'COMPLETED' && trip.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border border-green-300' :
                'bg-gray-100 text-gray-400'
              }`}>
                {s.replace('_', ' ')}
              </span>
            </React.Fragment>
          ))}
          {trip.status === 'CANCELLED' && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-300">CANCELLED</span>
          )}
        </div>

        {activeStatuses.includes(trip.status) && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Notes (optional)</label>
              <textarea value={actionNotes} onChange={(e) => setActionNotes(e.target.value)} className="input-field" rows={2} placeholder="Add notes..." />
            </div>
            <div className="flex gap-3 flex-wrap">
              {trip.status === 'REQUESTED' && (
                <button onClick={() => handleAction('assign')} className="btn-primary">Assign Trip</button>
              )}
              {trip.status === 'ASSIGNED' && (
                <button onClick={() => handleAction('start')} className="btn-primary">Start Trip</button>
              )}
              {trip.status === 'IN_PROGRESS' && (
                <button onClick={() => handleAction('complete')} className="btn-primary">Complete Trip</button>
              )}
              {trip.status !== 'CANCELLED' && (
                <button onClick={() => handleAction('cancel')} className="btn-danger">Cancel Trip</button>
              )}
            </div>
          </div>
        )}
      </div>

      {!activeStatuses.includes(trip.status) && (
        <button onClick={handleDelete} className="btn-danger">Delete Trip</button>
      )}
    </div>
  );
};

export default TripDetail;
