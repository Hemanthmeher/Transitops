import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { driverService } from '../../services/driver.service';
import { Driver } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

const DriverDetail: React.FC = () => {
  const { id } = useParams();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (id) {
      driverService.findById(parseInt(id))
        .then(setDriver)
        .catch(() => addToast('error', 'Failed to load driver details.'))
        .finally(() => setIsLoading(false));
    }
  }, [id, addToast]);

  const handleStatusAction = async (status: string) => {
    try {
      await driverService.updateStatus(parseInt(id!), status);
      addToast('success', `Driver status set to ${status}.`);
      const updated = await driverService.findById(parseInt(id!));
      setDriver(updated);
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this driver?')) return;
    try {
      await driverService.delete(parseInt(id!));
      addToast('success', 'Driver deleted.');
      navigate('/drivers');
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Failed to delete.');
    }
  };

  if (isLoading) return <div className="page-container"><LoadingSpinner /></div>;
  if (!driver) return <div className="page-container"><div className="card text-red-500">Driver not found.</div></div>;

  return (
    <div className="page-container max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{driver.firstName} {driver.lastName}</h1>
          <p className="text-gray-500">{driver.email}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/drivers/${id}/edit`)} className="btn-secondary">Edit</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Status</p>
          <StatusBadge status={driver.status} size="md" />
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Safety Score</p>
          <p className={`text-2xl font-bold ${(driver.safetyScore ?? 0) >= 85 ? 'text-green-600' : (driver.safetyScore ?? 0) >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
            {driver.safetyScore ?? 'N/A'}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Experience</p>
          <p className="text-lg font-semibold">{driver.experience ? `${driver.experience} years` : 'N/A'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">License</p>
          <p className="text-lg font-semibold">{driver.licenseNumber}</p>
          {driver.licenseExpiry && <p className="text-xs text-gray-500">Exp: {formatDate(driver.licenseExpiry)}</p>}
        </div>
      </div>

      {/* Status Actions */}
      {driver.status !== 'SUSPENDED' && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="flex gap-3 flex-wrap">
            {driver.status !== 'AVAILABLE' && (
              <button onClick={() => handleStatusAction('AVAILABLE')} className="btn-primary">Set Available</button>
            )}
            {driver.status !== 'OFF_DUTY' && (
              <button onClick={() => handleStatusAction('OFF_DUTY')} className="btn-secondary">Set Off Duty</button>
            )}
            {driver.status !== 'ON_TRIP' && (
              <button onClick={() => navigate('/trips/new')} className="btn-primary">Assign Trip</button>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-semibold mb-3">Trip History</h3>
        {driver.trips && driver.trips.length > 0 ? (
          <div className="space-y-2">
            {driver.trips.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer" onClick={() => navigate(`/trips/${t.id}`)}>
                <div>
                  <p className="text-sm font-medium">{t.origin} → {t.destination}</p>
                  <p className="text-xs text-gray-500">{t.vehicle?.plateNumber || 'N/A'}</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gray-500">No trips yet.</p>}
      </div>
    </div>
  );
};

export default DriverDetail;
