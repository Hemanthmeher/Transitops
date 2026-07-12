import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { vehicleService } from '../../services/vehicle.service';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

const vehicleSchema = z.object({
  plateNumber: z.string().min(2, 'Plate number is required').max(20),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.coerce.number().int().min(1980, 'Year must be 1980 or later').max(2030, 'Invalid year'),
  capacity: z.coerce.number().positive('Capacity must be positive'),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export default function VehicleForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  useEffect(() => {
    if (isEditing && id) {
      vehicleService.findById(Number(id))
        .then((vehicle) => {
          reset({
            plateNumber: vehicle.plateNumber,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            capacity: vehicle.capacity,
          });
        })
        .catch(() => addToast({ type: 'error', title: 'Failed to load vehicle' }))
        .finally(() => setIsLoadingData(false));
    }
  }, [id, isEditing, reset, addToast]);

  const onSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await vehicleService.update(Number(id), data);
        addToast({ type: 'success', title: 'Vehicle updated successfully' });
      } else {
        await vehicleService.create(data);
        addToast({ type: 'success', title: 'Vehicle created successfully' });
      }
      navigate('/vehicles');
    } catch (error: any) {
      addToast({ type: 'error', title: isEditing ? 'Update failed' : 'Creation failed', message: error.response?.data?.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/vehicles')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Vehicles
      </button>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{isEditing ? 'Update vehicle details' : 'Register a new vehicle in the fleet'}</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Plate Number</label>
                <input {...register('plateNumber')} className={`input ${errors.plateNumber ? 'input-error' : ''}`} placeholder="ABC-1234" />
                {errors.plateNumber && <p className="text-xs text-red-500 mt-1">{errors.plateNumber.message}</p>}
              </div>
              <div>
                <label className="label">Make</label>
                <input {...register('make')} className={`input ${errors.make ? 'input-error' : ''}`} placeholder="Volvo" />
                {errors.make && <p className="text-xs text-red-500 mt-1">{errors.make.message}</p>}
              </div>
              <div>
                <label className="label">Model</label>
                <input {...register('model')} className={`input ${errors.model ? 'input-error' : ''}`} placeholder="FH16" />
                {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model.message}</p>}
              </div>
              <div>
                <label className="label">Year</label>
                <input {...register('year')} type="number" className={`input ${errors.year ? 'input-error' : ''}`} placeholder="2024" />
                {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year.message}</p>}
              </div>
            </div>
            <div>
              <label className="label">Capacity (kg)</label>
              <input {...register('capacity')} type="number" step="0.1" className={`input ${errors.capacity ? 'input-error' : ''}`} placeholder="25000" />
              {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Vehicle' : 'Create Vehicle'}
              </button>
              <button type="button" onClick={() => navigate('/vehicles')} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
