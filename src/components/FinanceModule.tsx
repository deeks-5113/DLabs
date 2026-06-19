import React from 'react';
import { useApp } from '../context/AppContext';
import { FinanceDashboard } from './finance/FinanceDashboard';
import { BillList } from './finance/BillList';
import { B2BManagement } from './finance/B2BManagement';

// Finance Module Entry Component
export const FinanceModule: React.FC = () => {
  const { activeSubView } = useApp();

  return (
    <div className="w-full h-full flex flex-col">
      {activeSubView === 'finance-dashboard' && <FinanceDashboard />}
      {activeSubView === 'finance-bill-list' && <BillList />}
      {activeSubView === 'finance-b2b' && <B2BManagement />}
    </div>
  );
};
