import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const demoAccounts = [
    { role: 'Admin', email: 'admin@transitops.com', password: 'admin123', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { role: 'Manager', email: 'manager@transitops.com', password: 'manager123', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { role: 'Dispatcher', email: 'dispatcher@transitops.com', password: 'dispatch123', color: 'bg-green-100 text-green-800 border-green-200' },
    { role: 'Driver', email: 'driver@transitops.com', password: 'driver123', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { role: 'Safety Officer', email: 'safety@transitops.com', password: 'safety123', color: 'bg-rose-100 text-rose-800 border-rose-200' },
    { role: 'Financial Analyst', email: 'finance@transitops.com', password: 'finance123', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  ];

  const handleCopy = async (text: string, email: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEmail(email);
      addToast('success', 'Copied to clipboard!');
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch {
      addToast('error', 'Failed to copy');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('error', 'Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password);
      addToast('success', 'Login successful!');
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
      navigate('/dashboard');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Login failed. Please try again.';
      addToast('error', message);
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@transitops.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-2.5">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Demo Credentials Toggle */}
          <div className="mt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowCredentials(!showCredentials)}
              className="w-full flex items-center justify-between gap-2 pt-4 pb-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <span className="font-medium">🔑 Demo Credentials</span>
              {showCredentials ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className={`overflow-hidden transition-all duration-300 ${
              showCredentials ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
              <div className="pb-4 space-y-2">
                {demoAccounts.map((account) => (
                  <div
                    key={account.email}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${account.color} transition-all hover:shadow-sm`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-xs whitespace-nowrap">{account.role}</span>
                      <span className="text-xs opacity-75 truncate hidden sm:inline">{account.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-mono opacity-75 hidden md:inline">{account.password}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${account.email} / ${account.password}`, account.email)}
                        className="p-1 rounded hover:bg-black/5 transition-colors"
                        title="Copy credentials"
                      >
                        {copiedEmail === account.email ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-gray-400 text-center pt-1">
                  Click any row to copy credentials. Login with any role to see different views.
                </p>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
