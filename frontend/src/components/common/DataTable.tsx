import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionLabel?: string;
  emptyActionPath?: string;
  meta?: { total: number; page: number; limit: number; totalPages: number };
  onPageChange?: (page: number) => void;
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string | number;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  isLoading,
  emptyTitle,
  emptyMessage,
  emptyActionLabel,
  emptyActionPath,
  meta,
  onPageChange,
  onRowClick,
  keyExtractor,
}: DataTableProps<T>) {
  if (isLoading) {
    return <div className="card"><LoadingSpinner message="Loading data..." /></div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <EmptyState
          title={emptyTitle || 'No data found'}
          message={emptyMessage || 'There are no records to display.'}
          actionLabel={emptyActionLabel}
          actionPath={emptyActionPath}
        />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 text-sm text-gray-700 ${col.className || ''}`}>
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange?.(meta.page - 1)}
              disabled={meta.page <= 1}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(meta.page + 1)}
              disabled={meta.page >= meta.totalPages}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
