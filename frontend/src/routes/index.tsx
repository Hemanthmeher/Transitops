import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Layout } from '../components/layout/Layout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import VehicleList from '../pages/vehicles/VehicleList';
import VehicleForm from '../pages/vehicles/VehicleForm';
import VehicleDetail from '../pages/vehicles/VehicleDetail';
import DriverList from '../pages/drivers/DriverList';
import DriverForm from '../pages/drivers/DriverForm';
import DriverDetail from '../pages/drivers/DriverDetail';
import TripList from '../pages/trips/TripList';
import TripForm from '../pages/trips/TripForm';
import TripDetail from '../pages/trips/TripDetail';
import MaintenanceList from '../pages/maintenance/MaintenanceList';
import MaintenanceForm from '../pages/maintenance/MaintenanceForm';
import FuelList from '../pages/fuel/FuelList';
import FuelForm from '../pages/fuel/FuelForm';
import ExpenseList from '../pages/expenses/ExpenseList';
import ExpenseForm from '../pages/expenses/ExpenseForm';
import Reports from '../pages/reports/Reports';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes with layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Vehicles */}
        <Route path="vehicles" element={<VehicleList />} />
        <Route path="vehicles/new" element={<VehicleForm />} />
        <Route path="vehicles/:id" element={<VehicleDetail />} />
        <Route path="vehicles/:id/edit" element={<VehicleForm />} />

        {/* Drivers */}
        <Route path="drivers" element={<DriverList />} />
        <Route path="drivers/new" element={<DriverForm />} />
        <Route path="drivers/:id" element={<DriverDetail />} />
        <Route path="drivers/:id/edit" element={<DriverForm />} />

        {/* Trips */}
        <Route path="trips" element={<TripList />} />
        <Route path="trips/new" element={<TripForm />} />
        <Route path="trips/:id" element={<TripDetail />} />

        {/* Maintenance */}
        <Route path="maintenance" element={<MaintenanceList />} />
        <Route path="maintenance/new" element={<MaintenanceForm />} />

        {/* Fuel */}
        <Route path="fuel" element={<FuelList />} />
        <Route path="fuel/new" element={<FuelForm />} />

        {/* Expenses */}
        <Route path="expenses" element={<ExpenseList />} />
        <Route path="expenses/new" element={<ExpenseForm />} />

        {/* Reports */}
        <Route path="reports" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Reports /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
