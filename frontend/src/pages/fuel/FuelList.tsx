import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fuelService } from '../../services/fuel.service';
import { FuelLog } from '../../types';
import DataTable from '../../components/common/DataTable';
import PageHeader from '../../components/common/PageHeader';
import { formatDate, formatCurrency, formatLiters } from '../../utils/formatters';

const FuelList: React.FC = () => {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState<any>(null);
  const navigate = useNavigate();

  const loadLogs = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const result = await fuelService.findAll({ page, limit: 10 });
      setLogs(result.data);
      setMeta(result.meta);
    } catch (error) {
      console.error('Failed to load fuel logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const columns = [
    { key: 'vehicle', header: 'Vehicle', render: (f: FuelLog) => f.vehicle?.plateNumber || '-' },
    { key: 'liters', header: 'Liters', render: (f: FuelLog) => formatLiters(f.liters) },
    { key: 'costPerLiter', header: 'Cost/L', render: (f: FuelLog) => formatCurrency(f.costPerLiter) },
    { key: 'totalCost', header: 'Total', render: (f: FuelLog) => <span className="font-medium">{formatCurrency(f.totalCost)}</span> },
    { key: 'station', header: 'Station', render: (f: FuelLog) => f.station || '-' },
    { key: 'date', header: 'Date', render: (f: FuelLog) => formatDate(f.date) },
  ];

  return (
    <div className="page-container">
      <PageHeader title="Fuel Logs" subtitle="Track fuel purchases" actionLabel="Add Fuel Log" actionPath="/fuel/new" />
      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        meta={meta}
        onPageChange={(page) => loadLogs(page)}
        keyExtractor={(f: FuelLog) => f.id}
        emptyTitle="No fuel logs"
        emptyMessage="Log your first fuel purchase."
        emptyActionLabel="Add Fuel Log"
        emptyActionPath="/fuel/new"
      />
    </div>
  );
};

export default FuelList;
