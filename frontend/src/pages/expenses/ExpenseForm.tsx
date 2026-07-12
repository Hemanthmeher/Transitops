import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { expenseService } from '../../services/expense.service';
import { tripService } from '../../services/trip.service';
import { Trip } from '../../types';
import { useToast } from '../../context/ToastContext';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../../utils/constants';

const expenseSchema = z.object({
  category: z.enum(['TOLL', 'PARKING', 'FOOD', 'ACCOMMODATION', 'SUPPLIES', 'OTHER']),
  amount: z.coerce.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  tripId: z.coerce.number().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function ExpenseForm() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectedTripId = searchParams.get('tripId');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  });

  useEffect(() => {
    tripService.findAll({ limit: 50 })
      .then((result) => setTrips(result.data))
      .catch(() => addToast({ type: 'error', title: 'Failed to load trips' }))
      .finally(() => setIsLoadingOptions(false));
  }, [addToast]);

  useEffect(() => {
    if (preselectedTripId) setValue('tripId', Number(preselectedTripId));
  }, [preselectedTripId, setValue]);

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      await expenseService.create(data);
      addToast({ type: 'success', title: 'Expense created' });
      navigate('/expenses');
    } catch (error: any) {
      addToast({ type: 'error', title: 'Failed', message: error.response?.data?.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button onClick={() => navigate('/expenses')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Expenses
      </button>

      <div className="card">
        <div className="card-header"><h2 className="text-lg font-semibold">Add Expense</h2></div>
        <div className="card-body">
          {isLoadingOptions ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-blue-600" /></div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select {...register('category')} className="input">
                    {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Amount ($)</label>
                  <input {...register('amount')} type="number" step="0.01" className={`input ${errors.amount ? 'input-error' : ''}`} placeholder="0.00" />
                  {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <input {...register('description')} className={`input ${errors.description ? 'input-error' : ''}`} placeholder="What was this for?" />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>
              <div>
                <label className="label">Trip (optional)</label>
                <select {...register('tripId')} className="input">
                  <option value="">No trip</option>
                  {trips.map((t) => <option key={t.id} value={t.id}>#{t.id} - {t.origin}→{t.destination}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? 'Saving...' : 'Add Expense'}
                </button>
                <button type="button" onClick={() => navigate('/expenses')} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
