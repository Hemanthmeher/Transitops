import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { driverService } from '../../services/driver.service';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

const driverSchema = z.object({
  licenseNumber: z.string().min(2, 'License number is required').max(30),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(7, 'Phone must be at least 7 characters'),
});

type DriverFormData = z.infer<typeof driverSchema>;

export default function DriverForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(isEditing);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
  });

  useEffect(() => {
    if (isEditing && id) {
      driverService.findById(Number(id))
        .then((driver) => {
          reset({
            licenseNumber: driver.licenseNumber,
            firstName: driver.firstName,
            lastName: driver.lastName,
            email: driver.email,
            phone: driver.phone,
          });
        })
        .catch(() => addToast({ type: 'error', title: 'Failed to load driver' }))
        .finally(() => setIsLoadingData(false));
    }
  }, [id, isEditing, reset, addToast]);

  const onSubmit = async (data: DriverFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await driverService.update(Number(id), data);
        addToast({ type: 'success', title: 'Driver updated successfully' });
      } else {
        await driverService.create(data);
        addToast({ type: 'success', title: 'Driver created successfully' });
      }
      navigate('/drivers');
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
      <button onClick={() => navigate('/drivers')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Drivers
      </button>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold">{isEditing ? 'Edit Driver' : 'Add New Driver'}</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input {...register('firstName')} className={`input ${errors.firstName ? 'input-error' : ''}`} placeholder="John" />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input {...register('lastName')} className={`input ${errors.lastName ? 'input-error' : ''}`} placeholder="Doe" />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
              </div>
              <div>
                <label className="label">License Number</label>
                <input {...register('licenseNumber')} className={`input ${errors.licenseNumber ? 'input-error' : ''}`} placeholder="DL-1001" />
                {errors.licenseNumber && <p className="text-xs text-red-500 mt-1">{errors.licenseNumber.message}</p>}
              </div>
              <div>
                <label className="label">Email</label>
                <input {...register('email')} type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="john@example.com" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Phone</label>
                <input {...register('phone')} className={`input ${errors.phone ? 'input-error' : ''}`} placeholder="+1-555-0100" />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Driver' : 'Create Driver'}
              </button>
              <button type="button" onClick={() => navigate('/drivers')} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
