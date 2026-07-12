import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useToast } from '../../hooks/useToast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      addToast('error', 'Please enter your email.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await authService.forgotPassword(email);
      setSent(true);
      addToast('success', result.message || 'Reset link sent if email exists.');
    } catch (error: any) {
      addToast('error', error?.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-3xl text-white font-bold">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TransitOps</h1>
          <p className="text-gray-500 mt-1">Fleet Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {!sent ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Forgot Password</h2>
              <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-sm text-gray-500 mb-4">
                If an account exists with {email}, you'll receive a password reset link shortly.
              </p>
              <p className="text-xs text-gray-400">Check the console for the reset URL (dev mode).</p>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
