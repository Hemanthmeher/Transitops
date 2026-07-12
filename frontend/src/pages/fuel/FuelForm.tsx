import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fuelService } from '../../services/fuel.service';
import { vehicleService } from '../../services/vehicle.service';
import { tripService } from '../../services/trip.service';
import { Vehicle, Trip } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

const fuelSchema = z.object({
  vehicleId: z.coerce.number().positive('Vehicle is required'),
  tripId: z.coerce.number().optional(),
  liters: z.coerce.number().positive('Liters must be positive'),
  costPerLiter: z.coerce.number().positive('Cost per liter must be positive'),
  totalCost: z.coerce.number().positive('Total cost must be positive'),
  notes: z.string().optional(),
});

type FuelFormData = z.infer<typeof fuelSchema>;

export default function FuelForm() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectedTripId = searchParams.get('tripId');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FuelFormData>({
    resolver: zodResolver(fuelSchema),
  });

  useEffect(() => {
    Promise.all([
      vehicleService.findAll({ limit: 100 }),
      tripService.findAll({ limit: 50 }),
    ]).then(([vData, tData]) => {
      setVehicles(vData.data);
      setTrips(tData.data);
    }).catch(() => addToast({ type: 'error', title: 'Failed to load options' }))
      .finally(() => setIsLoadingOptions(false));
  }, [addToast]);

  useEffect(() => {
    if (preselectedTripId) setValue('tripId', Number(preselectedTripId));
  }, [preselectedTripId, setValue]);

  const onSubmit = async (data: FuelFormData) => {
    setIsSubmitting(true);
    try {
      await fuelService.create(data);
      addToast({ type: 'success', title: 'Fuel log created' });
      navigate('/fuel');
    } catch (error: any) {
      addToast({ type: 'error', title: 'Failed', message: error.response?.data?.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/fuel')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Fuel Logs
      </button>

      <div className="card">
        <div className="card-header"><h2 className="text-lg font-semibold">Add Fuel Log</h2></div>
        <div className="card-body">
          {isLoadingOptions ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Vehicle</label>
                  <select {...register('vehicleId')} className={`input ${errors.vehicleId ? 'input-error' : ''}`}>
                    <option value="">Select vehicle...</option>
                    {vehicles.map((v) => <option key={v.id} value={v.id}>{v.plateNumber}</option>)}
                  </select>
                  {errors.vehicleId && <p className="text-xs text-red-500 mt-1">{errors.vehicleId.message}</p>}
                </div>
                <div>
                  <label className="label">Trip (optional)</label>
                  <select {...register('tripId')} className="input">
                    <option value="">No trip</option>
                    {trips.map((t) => <option key={t.id} value={t.id}>#{t.id} - {t.origin}→{t.destination}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Liters</label>
                  <input {...register('liters')} type="number" step="0.1" className={`input ${errors.liters ? 'input-error' : ''}`} placeholder="100" />
                  {errors.liters && <p className="text-xs text-red-500 mt-1">{errors.liters.message}</p>}
                </div>
                <div>
                  <label className="label">Cost per Liter ($)</label>
                  <input {...register('costPerLiter')} type="number" step="0.001" className={`input ${errors.costPerLiter ? 'input-error' : ''}`} placeholder="1.25" />
                  {errors.costPerLiter && <p className="text-xs text-red-500 mt-1">{errors.costPerLiter.message}</p>}
                </div>
              </div>
              <div>
                <label className="label">Total Cost ($)</label>
                <input {...register('totalCost')} type="number" step="0.01" className={`input ${errors.totalCost ? 'input-error' : ''}`} placeholder="125.00" />
                {errors.totalCost && <p className="text-xs text-red-500 mt-1">{errors.totalCost.message}</p>}
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea {...register('notes')} className="input" rows={2} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? 'Saving...' : 'Add Log'}
                </button>
                <button type="button" onClick={() => navigate('/fuel')} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
