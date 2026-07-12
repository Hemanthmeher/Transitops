import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { maintenanceService } from '../../services/maintenance.service';
import { MaintenanceLog } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { useToast } from '../../hooks/useToast';

const MaintenanceDetail: React.FC = () => {
  const { id } = useParams();
  const [log, setLog] = useState<MaintenanceLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState('');
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completeCost, setCompleteCost] = useState<number | ''>('');
  const [completeNotes, setCompleteNotes] = useState('');
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    if (id) {
      maintenanceService.findById(parseInt(id))
        .then(setLog)
        .catch(() => addToast('error', 'Failed to load maintenance details.'))
        .finally(() => setIsLoading(false));
    }
  }, [id, addToast]);

  const handleMarkDueSoon = async () => {
    try {
      await maintenanceService.markDueSoon(parseInt(id!));
      addToast('success', 'Marked as due soon.');
      const updated = await maintenanceService.findById(parseInt(id!));
      setLog(updated);
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Failed to update.');
    }
  };

  const handleComplete = async () => {
    try {
      await maintenanceService.complete(parseInt(id!), {
        cost: completeCost ? Number(completeCost) : undefined,
        notes: completeNotes || undefined,
      });
      addToast('success', 'Maintenance marked as completed!');
      const updated = await maintenanceService.findById(parseInt(id!));
      setLog(updated);
      setShowCompleteForm(false);
      setCompleteCost('');
      setCompleteNotes('');
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Failed to complete.');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this maintenance record?')) return;
    try {
      await maintenanceService.cancel(parseInt(id!), actionNotes || undefined);
      addToast('success', 'Maintenance cancelled.');
      const updated = await maintenanceService.findById(parseInt(id!));
      setLog(updated);
      setActionNotes('');
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Failed to cancel.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this maintenance record?')) return;
    try {
      await maintenanceService.delete(parseInt(id!));
      addToast('success', 'Maintenance record deleted.');
      navigate('/maintenance');
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Failed to delete.');
    }
  };

  if (isLoading) return <div className="page-container"><LoadingSpinner /></div>;
  if (!log) return <div className="page-container"><div className="card text-red-500">Maintenance record not found.</div></div>;

  const activeStatuses = ['OPEN', 'DUE_SOON'];
  const isActive = activeStatuses.includes(log.status);

  return (
    <div className="page-container max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance #{log.id}</h1>
          <p className="text-gray-500">{log.description}</p>
        </div>
        <StatusBadge status={log.status} size="md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Vehicle</p>
          <p className="text-lg font-semibold">{log.vehicle?.plateNumber || 'N/A'}</p>
          <p className="text-xs text-gray-500">{log.vehicle?.make} {log.vehicle?.model}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Type</p>
          <StatusBadge status={log.type} />
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Cost</p>
          <p className="text-lg font-semibold">{log.cost ? formatCurrency(log.cost) : 'TBD'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Schedule</p>
          <p className="text-lg font-semibold">{formatDate(log.scheduledDate)}</p>
          {log.completedDate && <p className="text-xs text-gray-500">Completed: {formatDate(log.completedDate)}</p>}
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-3">Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Description:</span> <span className="font-medium">{log.description}</span></div>
          <div><span className="text-gray-500">Status:</span> <StatusBadge status={log.status} /></div>
          <div><span className="text-gray-500">Type:</span> <StatusBadge status={log.type} /></div>
          <div><span className="text-gray-500">Scheduled:</span> <span className="font-medium">{formatDate(log.scheduledDate)}</span></div>
          {log.completedDate && <div><span className="text-gray-500">Completed:</span> <span className="font-medium">{formatDate(log.completedDate)}</span></div>}
          {log.cost && <div><span className="text-gray-500">Cost:</span> <span className="font-medium">{formatCurrency(log.cost)}</span></div>}
          {log.notes && <div className="col-span-2"><span className="text-gray-500">Notes:</span> <p className="mt-1">{log.notes}</p></div>}
          {log.reminderSent && <div><span className="text-gray-500">Reminder:</span> <span className="text-green-600 font-medium">Sent ✓</span></div>}
        </div>
      </div>

      {/* Status Actions */}
      {isActive && (
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-4">Actions</h3>
          <div className="space-y-4">
            {log.status === 'OPEN' && (
              <div className="flex gap-3 flex-wrap">
                <button onClick={handleMarkDueSoon} className="btn-primary">Mark as Due Soon</button>
              </div>
            )}
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setShowCompleteForm(!showCompleteForm)} className="btn-primary bg-green-600 hover:bg-green-700">
                {showCompleteForm ? 'Cancel' : 'Mark as Complete'}
              </button>
              <button onClick={handleCancel} className="btn-danger">Cancel Record</button>
            </div>

            {/* Complete Form */}
            {showCompleteForm && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3 animate-fadeIn">
                <h4 className="font-medium text-sm text-gray-700">Complete Maintenance</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Actual Cost ($)</label>
                    <input type="number" value={completeCost} onChange={(e) => setCompleteCost(e.target.value ? Number(e.target.value) : '')} className="input-field" min={0} step={0.01} placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Notes</label>
                    <input type="text" value={completeNotes} onChange={(e) => setCompleteNotes(e.target.value)} className="input-field" placeholder="Completion notes..." />
                  </div>
                </div>
                <button onClick={handleComplete} className="btn-primary bg-green-600 hover:bg-green-700 text-sm">Confirm Complete</button>
              </div>
            )}
          </div>
        </div>
      )}

      {!isActive && (
        <div className="flex gap-3">
          <button onClick={() => navigate('/maintenance')} className="btn-secondary">← Back to List</button>
          {log.status !== 'COMPLETED' && <button onClick={handleDelete} className="btn-danger">Delete Record</button>}
        </div>
      )}
    </div>
  );
};

export default MaintenanceDetail;
