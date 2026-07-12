import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Please fill in all fields' });
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      addToast({ type: 'success', title: 'Welcome back!', message: 'Login successful' });
      navigate('/dashboard');
    } catch (error: any) {
      addToast({ type: 'error', title: 'Login Failed', message: error.response?.data?.message || 'Invalid credentials' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">TransitOps</h1>
          <p className="text-blue-200 mt-1">Fleet Management System</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@transitops.com"
                autoComplete="email"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-2.5" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Register
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-sm text-blue-100">
          <p className="font-medium text-white mb-1">Demo Credentials:</p>
          <p>Admin: admin@transitops.com / admin123</p>
          <p>Manager: manager@transitops.com / manager123</p>
          <p>Dispatcher: dispatcher@transitops.com / dispatch123</p>
        </div>
      </div>
    </div>
  );
}
