import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { vehicleService } from '../../services/vehicle.service';
import { useToast } from '../../hooks/useToast';
import type { VehicleStatus } from '../../types';

interface FormData {
  plateNumber: string; make: string; model: string; year: number; capacity: number;
  type: string; fuelType: string; mileage: number | ''; region: string; status: VehicleStatus;
}

const initialForm: FormData = {
  plateNumber: '', make: '', model: '', year: new Date().getFullYear(), capacity: 0,
  type: '', fuelType: '', mileage: '', region: '', status: 'AVAILABLE',
};

const VehicleForm: React.FC = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const [form, setForm] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      vehicleService.findById(parseInt(id)).then((v) => {
        setForm({
          plateNumber: v.plateNumber, make: v.make, model: v.model, year: v.year, capacity: v.capacity,
          type: v.type || '', fuelType: v.fuelType || '', mileage: v.mileage || '', region: v.region || '', status: v.status,
        });
      }).catch(() => addToast('error', 'Failed to load vehicle.'));
    }
  }, [id, addToast]);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plateNumber || !form.make || !form.model || form.capacity <= 0) {
      addToast('error', 'Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEdit) {
        await vehicleService.update(parseInt(id!), { ...form, mileage: form.mileage ? Number(form.mileage) : undefined });
        addToast('success', 'Vehicle updated!');
      } else {
        await vehicleService.create({ ...form, mileage: form.mileage ? Number(form.mileage) : undefined });
        addToast('success', 'Vehicle created!');
      }
      navigate('/vehicles');
    } catch (error: any) {
      addToast('error', error?.response?.data?.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
            <input type="text" value={form.plateNumber} onChange={updateField('plateNumber')} className="input-field" placeholder="ABC-1234" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={updateField('status')} className="input-field">
              <option value="AVAILABLE">Available</option>
              <option value="DEPLOYED">Deployed</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
            <input type="text" value={form.make} onChange={updateField('make')} className="input-field" placeholder="Volvo" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
            <input type="text" value={form.model} onChange={updateField('model')} className="input-field" placeholder="FH16" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
            <input type="number" value={form.year} onChange={updateField('year')} className="input-field" min={1990} max={2030} required />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (kg) *</label>
            <input type="number" value={form.capacity} onChange={updateField('capacity')} className="input-field" min={1} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (km)</label>
            <input type="number" value={form.mileage} onChange={updateField('mileage')} className="input-field" min={0} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select value={form.region} onChange={updateField('region')} className="input-field">
              <option value="">Select...</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
            <select value={form.fuelType} onChange={updateField('fuelType')} className="input-field">
              <option value="">Select...</option>
              <option value="DIESEL">Diesel</option>
              <option value="GASOLINE">Gasoline</option>
              <option value="ELECTRIC">Electric</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <input type="text" value={form.type} onChange={updateField('type')} className="input-field" placeholder="Truck, Trailer, Van" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Create Vehicle'}
          </button>
          <button type="button" onClick={() => navigate('/vehicles')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;
