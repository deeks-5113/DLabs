import React from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, IndianRupee, CreditCard, Clock, Activity } from 'lucide-react';
import { OrganisationRevenue } from './OrganisationRevenue';

export const FinanceDashboard: React.FC = () => {
  const { billSettlements } = useApp();

  const totalRevenue = billSettlements.reduce((sum, bill) => sum + bill.bill_amount, 0);
  const pendingBusiness = billSettlements.reduce((sum, bill) => sum + bill.due_amount, 0);
  const totalCollection = totalRevenue - pendingBusiness;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const collectionPercentage = totalRevenue > 0 ? Math.round((totalCollection / totalRevenue) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif font-bold text-brand-dark">Finance Telemetry</h2>
          <p className="text-sm text-gray-500 mt-1">Live financial performance and collections</p>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Revenue Generated</p>
            <p className="text-2xl font-bold text-brand-dark">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-lg">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Collection</p>
            <p className="text-2xl font-bold text-brand-dark">{formatCurrency(totalCollection)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 text-orange-500 rounded-lg group relative cursor-help">
            <Clock size={24} />
            <div className="absolute hidden group-hover:block bottom-full mb-2 right-0 w-48 p-2 bg-brand-dark text-white text-xs rounded shadow-lg z-10">
              Outstanding payments from patients and B2B partners
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Business</p>
            <p className="text-2xl font-bold text-brand-dark">{formatCurrency(pendingBusiness)}</p>
          </div>
        </div>
      </div>

      {/* Visual Data Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Activity className="text-brand-primary" size={20} />
          <h3 className="text-lg font-serif font-bold text-brand-dark">Revenue Breakdown: Paid vs Due</h3>
        </div>

        <div className="w-full max-w-3xl">
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-brand-primary">Collected ({collectionPercentage}%)</span>
            <span className="text-orange-500">Pending ({100 - collectionPercentage}%)</span>
          </div>
          <div className="w-full h-8 flex rounded-full overflow-hidden">
            <div 
              className="bg-brand-primary h-full transition-all duration-500 flex items-center justify-center text-xs text-white font-bold"
              style={{ width: `${collectionPercentage}%` }}
            >
              {collectionPercentage > 10 && 'PAID'}
            </div>
            <div 
              className="bg-orange-400 h-full transition-all duration-500 flex items-center justify-center text-xs text-white font-bold"
              style={{ width: `${100 - collectionPercentage}%` }}
            >
              {100 - collectionPercentage > 10 && 'DUE'}
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Total Paid (Liquid)</p>
              <p className="text-xl font-bold text-brand-primary">{formatCurrency(totalCollection)}</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Total Due (Receivables)</p>
              <p className="text-xl font-bold text-orange-500">{formatCurrency(pendingBusiness)}</p>
            </div>
          </div>
        </div>
      </div>

      <OrganisationRevenue />
    </div>
  );
};
