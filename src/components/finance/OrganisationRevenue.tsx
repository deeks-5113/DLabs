import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building2 } from 'lucide-react';

export const OrganisationRevenue: React.FC = () => {
  const { billSettlements } = useApp();

  const orgRevenue = billSettlements.reduce((acc, bill) => {
    const org = bill.organisation || 'Direct Walk-In';
    if (!acc[org]) {
      acc[org] = { total: 0, paid: 0, due: 0 };
    }
    acc[org].total += bill.bill_amount;
    acc[org].due += bill.due_amount;
    acc[org].paid += (bill.bill_amount - bill.due_amount);
    return acc;
  }, {} as Record<string, { total: number; paid: number; due: number }>);

  const orgs = Object.entries(orgRevenue).map(([name, data]) => ({ 
    name, 
    ...(data as { total: number; paid: number; due: number })
  }));
  
  // Sort by total revenue descending
  orgs.sort((a, b) => b.total - a.total);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-100 p-6 mt-6">
      <div className="flex items-center space-x-2 mb-6">
        <Building2 className="text-[#3CB577]" size={20} />
        <h3 className="text-lg font-serif font-bold text-[#3F3A3A]">Revenue by Organisation</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 px-4 font-sans text-sm font-semibold text-[#3F3A3A]">Organisation</th>
              <th className="py-3 px-4 font-sans text-sm font-semibold text-[#3F3A3A] text-right">Total Revenue</th>
              <th className="py-3 px-4 font-sans text-sm font-semibold text-[#3F3A3A] text-right">Collected</th>
              <th className="py-3 px-4 font-sans text-sm font-semibold text-[#3F3A3A] text-right">Pending</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org, index) => (
              <tr key={index} className="border-b border-gray-50 last:border-0 hover:bg-[#F8F9FA] transition-colors">
                <td className="py-3 px-4 font-sans text-sm text-[#3F3A3A] font-medium">{org.name}</td>
                <td className="py-3 px-4 font-sans text-sm text-[#3F3A3A] text-right tabular-nums">{formatCurrency(org.total)}</td>
                <td className="py-3 px-4 font-sans text-sm text-[#3CB577] text-right tabular-nums">{formatCurrency(org.paid)}</td>
                <td className="py-3 px-4 font-sans text-sm text-orange-500 text-right tabular-nums">{formatCurrency(org.due)}</td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-gray-500 font-sans">
                  No revenue data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
