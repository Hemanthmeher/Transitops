import React, { useEffect, useState } from 'react';
import { authService } from '../../services/auth.service';
import { User, Role } from '../../types';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/formatters';

const ROLES_LIST: Role[] = ['ADMIN', 'MANAGER', 'DISPATCHER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

const Settings: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const { addToast } = useToast();

  const loadUsers = async (page = 1) => {
    setIsLoading(true);
    try {
      const result = await authService.getAllUsers(page, 10);
      setUsers(result.data);
      setMeta(result.meta);
    } catch (error) {
      addToast('error', 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await authService.updateUserRole(userId, newRole);
      addToast('success', 'User role updated.');
      loadUsers();
    } catch (err: any) {
      addToast('error', err?.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleToggleActive = async (userId: number, currentActive: boolean) => {
    try {
      // Find current user to preserve their role
      const user = users.find(u => u.id === userId);
      if (!user) { addToast('error', 'User not found.'); return; }
      await authService.updateUserRole(userId, user.role, !currentActive);
      addToast('success', `User ${currentActive ? 'deactivated' : 'activated'}.`);
      loadUsers();
    } catch (err: any) {
      addToast('error', 'Failed to update user status.');
    }
  };

  if (isLoading) return <div className="page-container"><LoadingSpinner /></div>;

  return (
    <div className="page-container">
      <PageHeader title="Settings" subtitle="Manage users, roles, and permissions" />

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">User Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-xs border rounded px-2 py-1"
                    >
                      {ROLES_LIST.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={user.isActive ? 'AVAILABLE' : 'SUSPENDED'} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                      className={`text-xs px-2 py-1 rounded ${user.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 mt-4">
            <span className="text-sm text-gray-500">Page {meta.page} of {meta.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={meta.page <= 1} onClick={() => loadUsers(meta.page - 1)} className="btn-secondary text-sm">Previous</button>
              <button disabled={meta.page >= meta.totalPages} onClick={() => loadUsers(meta.page + 1)} className="btn-secondary text-sm">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Permissions Matrix */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Permission Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Module</th>
                {ROLES_LIST.map((r) => (
                  <th key={r} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { module: 'Fleet', roles: ['ADMIN', 'MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'] },
                { module: 'Drivers', roles: ['ADMIN', 'MANAGER', 'DISPATCHER', 'SAFETY_OFFICER'] },
                { module: 'Trips', roles: ['ADMIN', 'MANAGER', 'DISPATCHER', 'DRIVER', 'FINANCIAL_ANALYST'] },
                { module: 'Fuel', roles: ['ADMIN', 'MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'] },
                { module: 'Reports', roles: ['ADMIN', 'MANAGER', 'FINANCIAL_ANALYST', 'SAFETY_OFFICER'] },
                { module: 'Settings', roles: ['ADMIN'] },
              ].map(({ module, roles }) => (
                <tr key={module}>
                  <td className="px-4 py-3 text-sm font-medium">{module}</td>
                  {ROLES_LIST.map((r) => (
                    <td key={r} className="px-4 py-3 text-center">
                      {roles.includes(r) ? (
                        <span className="text-green-500 text-lg">✓</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;
