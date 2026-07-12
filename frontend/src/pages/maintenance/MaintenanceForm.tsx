import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { maintenanceService } from '../../services/maintenance.service';
import { vehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../types';
import { useToast } from '../../hooks/useToast';

interface FormData {
  vehicleId: number | '';
  type: string;
  description: string;
  scheduledDate: string;
  cost: number | '';
  notes: string;
}

const initialForm: FormData = {
  vehicleId: '', type: 'SCHEDULED', description: '', scheduledDate: new Date().toISOString().split('T')[0], cost: '', notes: '',
};

const MaintenanceForm: React.FC = () => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    vehicleService.findAll({ limit: 100 }).then((r) => {
      setVehicles(r.data.filter((v: Vehicle) => v.status !== 'RETIRED'));
    }).catch(() => addToast('error', 'Failed to load vehicles.')).finally(() => setLoading(false));
  }, [addToast]);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.description) {
      addToast('error', 'Please fill in required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const log = await maintenanceService.create({
        ...form,
        vehicleId: Number(form.vehicleId),
        cost: form.cost ? Number(form.cost) : undefined,
        type: form.type as any,
        scheduledDate: form.scheduledDate || undefined,
      });
      addToast('success', 'Maintenance record created. Vehicle is now in shop.');
      navigate('/maintenance');
    } catch (error: any) {
      addToast('error', error?.response?.data?.message || 'Failed to create record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="page-container"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Maintenance Record</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
          <select value={form.vehicleId} onChange={updateField('vehicleId')} className="input-field" required>
            <option value="">Select vehicle...</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.plateNumber} - {v.make} {v.model} ({v.status})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select value={form.type} onChange={updateField('type')} className="input-field">
              <option value="SCHEDULED">Scheduled</option>
              <option value="UNSCHEDULED">Unscheduled</option>
              <option value="EMERGENCY">Emergency</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
            <input type="number" value={form.cost} onChange={updateField('cost')} className="input-field" min={0} step={0.01} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea value={form.description} onChange={updateField('description')} className="input-field" rows={3} placeholder="Describe the maintenance issue..." required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
            <input type="date" value={form.scheduledDate} onChange={updateField('scheduledDate')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input type="text" value={form.notes} onChange={updateField('notes')} className="input-field" placeholder="Additional notes" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Creating...' : 'Create Maintenance Record'}
          </button>
          <button type="button" onClick={() => navigate('/maintenance')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm;
