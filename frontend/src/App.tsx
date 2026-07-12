import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes';
import { ToastContainer } from './components/common/Toast';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  );
}
