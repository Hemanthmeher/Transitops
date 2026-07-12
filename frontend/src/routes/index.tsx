import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/layout/Layout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard from '../pages/dashboard/Dashboard';
import Settings from '../pages/settings/Settings';
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
import MaintenanceDetail from '../pages/maintenance/MaintenanceDetail';
import FuelList from '../pages/fuel/FuelList';
import FuelForm from '../pages/fuel/FuelForm';
import ExpenseList from '../pages/expenses/ExpenseList';
import ExpenseForm from '../pages/expenses/ExpenseForm';
import Reports from '../pages/reports/Reports';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="/vehicles" element={<VehicleList />} />
          <Route path="/vehicles/new" element={<VehicleForm />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/vehicles/:id/edit" element={<VehicleForm />} />

          <Route path="/drivers" element={<DriverList />} />
          <Route path="/drivers/new" element={<DriverForm />} />
          <Route path="/drivers/:id" element={<DriverDetail />} />
          <Route path="/drivers/:id/edit" element={<DriverForm />} />

          <Route path="/trips" element={<TripList />} />
          <Route path="/trips/new" element={<TripForm />} />
          <Route path="/trips/:id" element={<TripDetail />} />

          <Route path="/maintenance" element={<MaintenanceList />} />
          <Route path="/maintenance/new" element={<MaintenanceForm />} />
          <Route path="/maintenance/:id" element={<MaintenanceDetail />} />

          <Route path="/fuel" element={<FuelList />} />
          <Route path="/fuel/new" element={<FuelForm />} />

          <Route path="/expenses" element={<ExpenseList />} />
          <Route path="/expenses/new" element={<ExpenseForm />} />

          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
