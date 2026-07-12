import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fuelService } from '../../services/fuel.service';
import { vehicleService } from '../../services/vehicle.service';
import { tripService } from '../../services/trip.service';
import { Vehicle, Trip } from '../../types';
import { useToast } from '../../hooks/useToast';

interface FormData {
  vehicleId: number | '';
  tripId: number | '';
  date: string;
  liters: number | '';
  costPerLiter: number | '';
  totalCost: number | '';
  station: string;
  fuelType: string;
  notes: string;
}

const initialForm: FormData = {
  vehicleId: '', tripId: '', date: new Date().toISOString().split('T')[0],
  liters: '', costPerLiter: '', totalCost: '', station: '', fuelType: 'DIESEL', notes: '',
};

const FuelForm: React.FC = () => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      vehicleService.findAll({ limit: 100 }),
      tripService.findAll({ limit: 100, status: 'ON_TRIP' }),
    ]).then(([v, t]) => {
      setVehicles(v.data);
      setTrips(t.data);
    }).catch(() => addToast('error', 'Failed to load data.')).finally(() => setLoading(false));
  }, [addToast]);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.liters || !form.costPerLiter) {
      addToast('error', 'Please fill in required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const totalCost = form.totalCost || (Number(form.liters) * Number(form.costPerLiter));
      await fuelService.create({
        vehicleId: Number(form.vehicleId),
        tripId: form.tripId ? Number(form.tripId) : undefined,
        date: form.date,
        liters: Number(form.liters),
        costPerLiter: Number(form.costPerLiter),
        totalCost: Number(totalCost),
        station: form.station || undefined,
        fuelType: form.fuelType,
        notes: form.notes || undefined,
      });
      addToast('success', 'Fuel log created.');
      navigate('/fuel');
    } catch (error: any) {
      addToast('error', error?.response?.data?.message || 'Failed to create fuel log.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="page-container"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Fuel Log</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
            <select value={form.vehicleId} onChange={updateField('vehicleId')} className="input-field" required>
              <option value="">Select vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plateNumber}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trip (optional)</label>
            <select value={form.tripId} onChange={updateField('tripId')} className="input-field">
              <option value="">No trip</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>#{t.id} - {t.origin} → {t.destination}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Liters *</label>
            <input type="number" value={form.liters} onChange={updateField('liters')} className="input-field" min={0} step={0.1} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost/Liter *</label>
            <input type="number" value={form.costPerLiter} onChange={updateField('costPerLiter')} className="input-field" min={0} step={0.01} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost</label>
            <input type="number" value={form.totalCost} onChange={updateField('totalCost')} className="input-field" min={0} step={0.01} placeholder="Auto-calc" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={form.date} onChange={updateField('date')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
            <select value={form.fuelType} onChange={updateField('fuelType')} className="input-field">
              <option value="DIESEL">Diesel</option>
              <option value="GASOLINE">Gasoline</option>
              <option value="ELECTRIC">Electric</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
          <input type="text" value={form.station} onChange={updateField('station')} className="input-field" placeholder="Station name" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Creating...' : 'Create Fuel Log'}
          </button>
          <button type="button" onClick={() => navigate('/fuel')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default FuelForm;
