import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '../../services/expense.service';
import { vehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../types';
import { useToast } from '../../hooks/useToast';

interface FormData {
  vehicleId: number | '';
  category: string;
  description: string;
  amount: number | '';
  date: string;
  notes: string;
}

const initialForm: FormData = {
  vehicleId: '', category: 'OTHER', description: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '',
};

const ExpenseForm: React.FC = () => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    vehicleService.findAll({ limit: 100 })
      .then((r) => setVehicles(r.data))
      .catch(() => addToast('error', 'Failed to load vehicles.'))
      .finally(() => setLoading(false));
  }, [addToast]);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount) {
      addToast('error', 'Please fill in required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await expenseService.create({
        vehicleId: form.vehicleId ? Number(form.vehicleId) : undefined,
        category: form.category as any,
        description: form.description,
        amount: Number(form.amount),
        date: form.date,
        notes: form.notes || undefined,
      });
      addToast('success', 'Expense recorded.');
      navigate('/expenses');
    } catch (error: any) {
      addToast('error', error?.response?.data?.message || 'Failed to record expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="page-container"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Expense</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select value={form.category} onChange={updateField('category')} className="input-field">
              <option value="MAINTENANCE">Maintenance</option>
              <option value="FUEL">Fuel</option>
              <option value="TOLL">Toll</option>
              <option value="PARKING">Parking</option>
              <option value="INSURANCE">Insurance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle (optional)</label>
            <select value={form.vehicleId} onChange={updateField('vehicleId')} className="input-field">
              <option value="">Not assigned</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plateNumber}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <input type="text" value={form.description} onChange={updateField('description')} className="input-field" placeholder="What is this for?" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
            <input type="number" value={form.amount} onChange={updateField('amount')} className="input-field" min={0} step={0.01} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date} onChange={updateField('date')} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={updateField('notes')} className="input-field" rows={2} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Recording...' : 'Record Expense'}
          </button>
          <button type="button" onClick={() => navigate('/expenses')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
