import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      addToast('error', 'Please fill in all fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      addToast('error', 'Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      addToast('error', 'Password must be at least 6 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password });
      addToast('success', 'Registration successful!');
      navigate('/dashboard');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registration failed.';
      addToast('error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-3xl text-white font-bold">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TransitOps</h1>
          <p className="text-gray-500 mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Register</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={formData.name} onChange={updateField('name')} className="input-field" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={updateField('email')} className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={formData.password} onChange={updateField('password')} className="input-field" placeholder="Min. 6 characters" required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" value={formData.confirmPassword} onChange={updateField('confirmPassword')} className="input-field" placeholder="Repeat password" required />
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
