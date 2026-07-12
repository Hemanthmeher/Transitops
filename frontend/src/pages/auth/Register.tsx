import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Truck, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Please fill in all fields' });
      return;
    }
    if (password.length < 6) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Password must be at least 6 characters' });
      return;
    }
    setIsLoading(true);
    try {
      await register({ name, email, password });
      addToast({ type: 'success', title: 'Welcome!', message: 'Account created successfully' });
      navigate('/dashboard');
    } catch (error: any) {
      addToast({ type: 'error', title: 'Registration Failed', message: error.response?.data?.message || 'Something went wrong' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">TransitOps</h1>
          <p className="text-blue-200 mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Register</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">Full Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="John Doe" disabled={isLoading} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" autoComplete="email" disabled={isLoading} />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Min. 6 characters" autoComplete="new-password" disabled={isLoading} />
            </div>

            <button type="submit" className="btn-primary w-full py-2.5" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
