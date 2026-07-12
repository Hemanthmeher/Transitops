import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '../../services/expense.service';
import { Expense } from '../../types';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';

const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const navigate = useNavigate();

  const loadExpenses = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const result = await expenseService.findAll({ page, limit: 10 });
      setExpenses(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error('Failed to load expenses:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadExpenses(); }, [loadExpenses]);

  const columns = [
    { key: 'category', header: 'Category', render: (e: Expense) => <StatusBadge status={e.category} /> },
    { key: 'description', header: 'Description', render: (e: Expense) => <span className="font-medium">{e.description}</span> },
    { key: 'vehicle', header: 'Vehicle', render: (e: Expense) => e.vehicle?.plateNumber || '-' },
    { key: 'amount', header: 'Amount', render: (e: Expense) => <span className="font-semibold">{formatCurrency(e.amount)}</span> },
    { key: 'date', header: 'Date', render: (e: Expense) => formatDate(e.date) },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Expenses" subtitle="Track operational expenses" actionLabel="Add Expense" actionPath="/expenses/new" />
      <DataTable
        columns={columns}
        data={expenses}
        isLoading={isLoading}
        meta={meta}
        onPageChange={(page) => loadExpenses(page)}
        keyExtractor={(e: Expense) => e.id}
        emptyTitle="No expenses"
        emptyMessage="Record your first expense."
        emptyActionLabel="Add Expense"
        emptyActionPath="/expenses/new"
      />
    </div>
  );
};

export default ExpenseList;
