import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService } from '../../services/trip.service';
import { vehicleService } from '../../services/vehicle.service';
import { driverService } from '../../services/driver.service';
import { Vehicle, Driver } from '../../types';
import { useToast } from '../../hooks/useToast';

interface FormData {
  vehicleId: number | '';
  driverId: number | '';
  origin: string;
  destination: string;
  cargoWeight: number | '';
  cargoType: string;
  description: string;
  scheduledDate: string;
}

const initialForm: FormData = {
  vehicleId: '', driverId: '', origin: '', destination: '',
  cargoWeight: '', cargoType: '', description: '', scheduledDate: new Date().toISOString().split('T')[0],
};

const TripForm: React.FC = () => {
  const [form, setForm] = useState<FormData>(initialForm);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([vehicleService.getAvailable(), driverService.getAvailable()])
      .then(([v, d]) => { setVehicles(v.filter((veh: Vehicle) => veh.status === 'AVAILABLE' || veh.status === 'DEPLOYED')); setDrivers(d); })
      .catch(() => addToast('error', 'Failed to load available vehicles/drivers.'))
      .finally(() => setLoading(false));
  }, [addToast]);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleId || !form.driverId || !form.origin || !form.destination) {
      addToast('error', 'Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const trip = await tripService.create({
        ...form,
        vehicleId: Number(form.vehicleId),
        driverId: Number(form.driverId),
        cargoWeight: form.cargoWeight ? Number(form.cargoWeight) : undefined,
        cargoType: form.cargoType || undefined,
      });
      addToast('success', 'Trip dispatched successfully!');
      navigate(`/trips/${trip.id}`);
    } catch (error: any) {
      addToast('error', error?.response?.data?.message || 'Failed to dispatch trip.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="page-container"><p className="text-gray-500">Loading...</p></div>;

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dispatch New Trip</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
            <select value={form.vehicleId} onChange={updateField('vehicleId')} className="input-field" required>
              <option value="">Select vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.plateNumber} - {v.make} {v.model} ({v.capacity}kg)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Driver *</label>
            <select value={form.driverId} onChange={updateField('driverId')} className="input-field" required>
              <option value="">Select driver...</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.firstName} {d.lastName} {d.safetyScore ? `(${d.safetyScore} pts)` : ''}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origin *</label>
            <input type="text" value={form.origin} onChange={updateField('origin')} className="input-field" placeholder="New York, NY" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
            <input type="text" value={form.destination} onChange={updateField('destination')} className="input-field" placeholder="Boston, MA" required />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Weight (kg)</label>
            <input type="number" value={form.cargoWeight} onChange={updateField('cargoWeight')} className="input-field" min={0} placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type</label>
            <select value={form.cargoType} onChange={updateField('cargoType')} className="input-field">
              <option value="">Select...</option>
              <option value="General">General</option>
              <option value="Perishable">Perishable</option>
              <option value="Hazardous">Hazardous</option>
              <option value="Heavy Machinery">Heavy Machinery</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
            <input type="date" value={form.scheduledDate} onChange={updateField('scheduledDate')} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={updateField('description')} className="input-field" rows={3} placeholder="Cargo details, special instructions..." />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Dispatching...' : 'Dispatch Trip'}
          </button>
          <button type="button" onClick={() => navigate('/trips')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default TripForm;
