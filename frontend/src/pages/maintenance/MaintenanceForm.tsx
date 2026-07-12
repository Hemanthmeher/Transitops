import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { maintenanceService } from '../../services/maintenance.service';
import { vehicleService } from '../../services/vehicle.service';
import { Vehicle } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { MAINTENANCE_TYPES } from '../../utils/constants';

const maintenanceSchema = z.object({
  vehicleId: z.coerce.number().positive('Vehicle is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(['ROUTINE', 'REPAIR', 'INSPECTION', 'EMERGENCY']),
  cost: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

export default function MaintenanceForm() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicleId');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
  });

  useEffect(() => {
    vehicleService.findAll({ limit: 100 })
      .then((result) => setVehicles(result.data))
      .catch(() => addToast({ type: 'error', title: 'Failed to load vehicles' }))
      .finally(() => setIsLoadingOptions(false));
  }, [addToast]);

  useEffect(() => {
    if (preselectedVehicleId) {
      setValue('vehicleId', Number(preselectedVehicleId));
    }
  }, [preselectedVehicleId, setValue]);

  const onSubmit = async (data: MaintenanceFormData) => {
    setIsSubmitting(true);
    try {
      await maintenanceService.create(data);
      addToast({ type: 'success', title: 'Maintenance record created' });
      navigate('/maintenance');
    } catch (error: any) {
      addToast({ type: 'error', title: 'Failed', message: error.response?.data?.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/maintenance')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Maintenance
      </button>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Add Maintenance Record</h2>
        </div>
        <div className="card-body">
          {isLoadingOptions ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Vehicle</label>
                <select {...register('vehicleId')} className={`input ${errors.vehicleId ? 'input-error' : ''}`}>
                  <option value="">Select vehicle...</option>
                  {vehicles.filter(v => v.status !== 'RETIRED').map((v) => (
                    <option key={v.id} value={v.id}>{v.plateNumber} - {v.make} {v.model}</option>
                  ))}
                </select>
                {errors.vehicleId && <p className="text-xs text-red-500 mt-1">{errors.vehicleId.message}</p>}
              </div>
              <div>
                <label className="label">Description</label>
                <input {...register('description')} className={`input ${errors.description ? 'input-error' : ''}`} placeholder="Oil change, brake repair..." />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select {...register('type')} className="input">
                    {MAINTENANCE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Cost ($)</label>
                  <input {...register('cost')} type="number" step="0.01" className="input" placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea {...register('notes')} className="input" rows={2} placeholder="Additional details..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? 'Saving...' : 'Add Record'}
                </button>
                <button type="button" onClick={() => navigate('/maintenance')} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
