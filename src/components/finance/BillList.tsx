import React, { useState } from 'react';
// Force IDE cache update
import { useApp } from '../../context/AppContext';
import { Search, MoreVertical, IndianRupee, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const BillList: React.FC = () => {
  const { billSettlements, updateBillStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | ''>('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const filteredBills = billSettlements.filter(bill => 
    bill.bill_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.patient_details.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.organisation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2.5 py-1 bg-brand-accent/20 text-brand-primary text-xs font-bold rounded-full flex items-center gap-1 w-max"><CheckCircle2 size={12}/> Paid</span>;
      case 'Pending':
        return <span className="px-2.5 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full flex items-center gap-1 w-max"><AlertCircle size={12}/> Pending</span>;
      case 'Cancelled':
      case 'Overdue':
        return <span className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full flex items-center gap-1 w-max">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">{status}</span>;
    }
  };

  const handleSettleClick = (billId: string) => {
    setSelectedBillId(billId);
    setPaymentMode('');
    setSettleModalOpen(true);
    setActiveDropdown(null);
  };

  const handleConfirmSettle = () => {
    if (selectedBillId && paymentMode) {
      updateBillStatus(selectedBillId, 'Paid');
      setSettleModalOpen(false);
      setSelectedBillId(null);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif font-bold text-brand-dark">Transaction Ledger</h2>
          <p className="text-sm text-gray-500 mt-1">Manage patient bills and pending collections</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Bill ID, Patient, or Org..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="px-6 py-4 font-semibold">Bill ID & Date</th>
                <th className="px-6 py-4 font-semibold">Patient Details</th>
                <th className="px-6 py-4 font-semibold">Referral & Org</th>
                <th className="px-6 py-4 font-semibold text-right">Bill Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Due Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredBills.map(bill => (
                <tr key={bill.bill_id} className="hover:bg-[#F8F9FA]/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-bold text-brand-dark">{bill.bill_id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{bill.bill_date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-brand-dark">{bill.patient_details.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{bill.patient_details.gender}, {bill.patient_details.age}Y • {bill.patient_details.patient_id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-brand-dark truncate max-w-[200px]" title={bill.referral}>{bill.referral}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]" title={bill.organisation}>{bill.organisation}</p>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-brand-dark">
                    {formatCurrency(bill.bill_amount)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-brand-dark">
                    {formatCurrency(bill.due_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(bill.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === bill.bill_id ? null : bill.bill_id)}
                      className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeDropdown === bill.bill_id && (
                      <div className="absolute right-6 top-10 w-40 bg-white border border-gray-200 shadow-lg rounded-lg py-1 z-10 text-left">
                        {bill.status === 'Pending' && (
                          <button 
                            onClick={() => handleSettleClick(bill.bill_id)}
                            className="w-full px-4 py-2 text-sm text-brand-primary hover:bg-brand-primary/5 font-medium flex items-center gap-2"
                          >
                            <IndianRupee size={14} />
                            Settle Bill
                          </button>
                        )}
                        <button className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 text-left">
                          View Invoice
                        </button>
                        <button className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 text-left">
                          Print Receipt
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredBills.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settle Bill Modal */}
      {settleModalOpen && (
        <div className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#F8F9FA]">
              <h3 className="font-serif font-bold text-lg text-brand-dark">Settle Bill</h3>
              <button 
                onClick={() => setSettleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 bg-orange-50 text-orange-800 p-4 rounded-lg border border-orange-100">
                <p className="text-sm font-medium">You are recording a payment for:</p>
                <p className="font-bold text-lg mt-1">{selectedBillId}</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-brand-dark mb-2">Select Payment Mode <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-3">
                  {['Cash', 'UPI', 'Card'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMode(mode as any)}
                      className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                        paymentMode === mode 
                          ? 'bg-brand-primary text-white border-brand-primary shadow-sm' 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-brand-primary/50 hover:bg-brand-bg'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-[#F8F9FA] flex justify-end gap-3">
              <button 
                onClick={() => setSettleModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmSettle}
                disabled={!paymentMode}
                className="px-5 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-[#329E67] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
