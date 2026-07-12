import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { expenseService } from '../../services/expense.service';
import { Expense } from '../../types';
import { DataTable, Column } from '../../components/common/DataTable';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function ExpenseList() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  const loadExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await expenseService.findAll({ page, limit: 10 });
      setExpenses(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  const columns: Column<Expense>[] = [
    { key: 'date', header: 'Date', render: (e) => formatDate(e.date) },
    { key: 'category', header: 'Category', render: (e) => <StatusBadge status={e.category} /> },
    { key: 'description', header: 'Description' },
    { key: 'amount', header: 'Amount', render: (e) => formatCurrency(e.amount) },
    { key: 'trip', header: 'Trip', render: (e) => e.trip ? `#${e.trip.id}` : '—' },
  ];

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Track trip-related expenses"
        actions={
          <button onClick={() => navigate('/expenses/new')} className="btn-primary">
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={expenses}
        isLoading={isLoading}
        emptyTitle="No expenses"
        emptyDescription="Start tracking expenses"
        emptyAction={<button onClick={() => navigate('/expenses/new')} className="btn-primary"><Plus className="h-4 w-4" /> Add Expense</button>}
      />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary btn-sm">Previous</button>
          <span className="px-4 py-1.5 text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary btn-sm">Next</button>
        </div>
      )}
    </div>
  );
}
