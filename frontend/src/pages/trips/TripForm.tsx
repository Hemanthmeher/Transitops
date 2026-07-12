import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tripService } from '../../services/trip.service';
import { vehicleService } from '../../services/vehicle.service';
import { driverService } from '../../services/driver.service';
import { Vehicle, Driver } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { formatWeight } from '../../utils/formatters';

const tripSchema = z.object({
  vehicleId: z.coerce.number().positive('Vehicle is required'),
  driverId: z.coerce.number().positive('Driver is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  cargoWeight: z.coerce.number().positive('Cargo weight must be positive'),
  notes: z.string().optional(),
});

type TripFormData = z.infer<typeof tripSchema>;

export default function TripForm() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
  });

  const watchVehicleId = watch('vehicleId');

  useEffect(() => {
    Promise.all([
      vehicleService.getAvailable(),
      driverService.getAvailable(),
    ]).then(([vehiclesData, driversData]) => {
      setVehicles(vehiclesData);
      setDrivers(driversData);
    }).catch(() => {
      addToast({ type: 'error', title: 'Failed to load options' });
    }).finally(() => setIsLoadingOptions(false));
  }, [addToast]);

  useEffect(() => {
    const v = vehicles.find(v => v.id === Number(watchVehicleId));
    setSelectedVehicle(v || null);
  }, [watchVehicleId, vehicles]);

  const onSubmit = async (data: TripFormData) => {
    setIsSubmitting(true);
    try {
      const trip = await tripService.create(data);
      addToast({ type: 'success', title: 'Trip created', message: 'Vehicle and driver dispatched' });
      navigate(`/trips/${trip.id}`);
    } catch (error: any) {
      addToast({ type: 'error', title: 'Failed to create trip', message: error.response?.data?.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/trips')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Trips
      </button>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">Create New Trip</h2>
          <p className="text-sm text-gray-500 mt-0.5">Dispatch a vehicle and driver</p>
        </div>
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
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.plateNumber} - {v.make} {v.model} ({formatWeight(v.capacity)})</option>
                    ))}
                  </select>
                  {errors.vehicleId && <p className="text-xs text-red-500 mt-1">{errors.vehicleId.message}</p>}
                  {selectedVehicle && (
                    <p className="text-xs text-gray-500 mt-1">Capacity: {formatWeight(selectedVehicle.capacity)}</p>
                  )}
                </div>
                <div>
                  <label className="label">Driver</label>
                  <select {...register('driverId')} className={`input ${errors.driverId ? 'input-error' : ''}`}>
                    <option value="">Select driver...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.firstName} {d.lastName} ({d.licenseNumber})</option>
                    ))}
                  </select>
                  {errors.driverId && <p className="text-xs text-red-500 mt-1">{errors.driverId.message}</p>}
                </div>
                <div>
                  <label className="label">Origin</label>
                  <input {...register('origin')} className={`input ${errors.origin ? 'input-error' : ''}`} placeholder="New York, NY" />
                  {errors.origin && <p className="text-xs text-red-500 mt-1">{errors.origin.message}</p>}
                </div>
                <div>
                  <label className="label">Destination</label>
                  <input {...register('destination')} className={`input ${errors.destination ? 'input-error' : ''}`} placeholder="Boston, MA" />
                  {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination.message}</p>}
                </div>
              </div>
              <div>
                <label className="label">Cargo Weight (kg)</label>
                <input {...register('cargoWeight')} type="number" step="0.1" className={`input ${errors.cargoWeight ? 'input-error' : ''}`} placeholder="10000" />
                {errors.cargoWeight && <p className="text-xs text-red-500 mt-1">{errors.cargoWeight.message}</p>}
                {selectedVehicle && (
                  <p className="text-xs text-gray-500 mt-1">Max capacity: {formatWeight(selectedVehicle.capacity)}</p>
                )}
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea {...register('notes')} className="input" rows={2} placeholder="Any special instructions..." />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {isSubmitting ? 'Dispatching...' : 'Dispatch Trip'}
                </button>
                <button type="button" onClick={() => navigate('/trips')} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
