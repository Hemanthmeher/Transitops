import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { driverService } from '../../services/driver.service';
import { useToast } from '../../hooks/useToast';

interface FormData {
  licenseNumber: string; firstName: string; lastName: string; email: string;
  phone: string; licenseExpiry: string; experience: number | ''; status: string;
}

const initialForm: FormData = {
  licenseNumber: '', firstName: '', lastName: '', email: '', phone: '',
  licenseExpiry: '', experience: '', status: 'AVAILABLE',
};

const DriverForm: React.FC = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const [form, setForm] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      driverService.findById(parseInt(id)).then((d) => {
        setForm({
          licenseNumber: d.licenseNumber, firstName: d.firstName, lastName: d.lastName,
          email: d.email, phone: d.phone || '', licenseExpiry: d.licenseExpiry?.split('T')[0] || '',
          experience: d.experience || '', status: d.status,
        });
      }).catch(() => addToast('error', 'Failed to load driver.'));
    }
  }, [id, addToast]);

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.licenseNumber) {
      addToast('error', 'Please fill in required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const data: any = { ...form, experience: form.experience ? Number(form.experience) : 0 };
      if (isEdit) {
        await driverService.update(parseInt(id!), data);
        addToast('success', 'Driver updated!');
      } else {
        await driverService.create(data);
        addToast('success', 'Driver created!');
      }
      navigate('/drivers');
    } catch (error: any) {
      addToast('error', error?.response?.data?.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Driver' : 'Add Driver'}</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
            <input type="text" value={form.firstName} onChange={updateField('firstName')} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
            <input type="text" value={form.lastName} onChange={updateField('lastName')} className="input-field" required />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={updateField('email')} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" value={form.phone} onChange={updateField('phone')} className="input-field" placeholder="+1-555-0101" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Number *</label>
            <input type="text" value={form.licenseNumber} onChange={updateField('licenseNumber')} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
            <input type="date" value={form.licenseExpiry} onChange={updateField('licenseExpiry')} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Experience (yrs)</label>
            <input type="number" value={form.experience} onChange={updateField('experience')} className="input-field" min={0} max={50} />
          </div>
        </div>
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={updateField('status')} className="input-field">
              <option value="AVAILABLE">Available</option>
              <option value="OFF_DUTY">Off Duty</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Driver' : 'Create Driver'}
          </button>
          <button type="button" onClick={() => navigate('/drivers')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default DriverForm;
