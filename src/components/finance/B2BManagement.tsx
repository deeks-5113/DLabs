import React, { useState } from 'react';
// Force IDE cache update
import { useApp } from '../../context/AppContext';
import { Building2, UserCheck2, Plus, Search } from 'lucide-react';

export const B2BManagement: React.FC = () => {
  const { b2bPartners, referringDoctors } = useApp();
  const [activeTab, setActiveTab] = useState<'organisations' | 'referrals'>('organisations');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrgs = b2bPartners.filter(org => 
    org.partner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.partner_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDoctors = referringDoctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.clinic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif font-bold text-brand-dark">B2B & Referral Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage corporate partners, insurance tie-ups, and referring doctors</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('organisations'); setSearchTerm(''); }}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'organisations' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <Building2 size={18} />
          <span>Organisations</span>
        </button>
        <button
          onClick={() => { setActiveTab('referrals'); setSearchTerm(''); }}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
            activeTab === 'referrals' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <UserCheck2 size={18} />
          <span>Referring Doctors</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'organisations' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#F8F9FA]/50">
              <h3 className="font-semibold text-brand-dark">Corporate Clients</h3>
              <button className="flex items-center space-x-2 bg-brand-primary hover:bg-[#329E67] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                <Plus size={16} />
                <span>Add Organisation</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4 font-semibold">Partner ID</th>
                    <th className="px-6 py-4 font-semibold">Organisation Name</th>
                    <th className="px-6 py-4 font-semibold">Billing Type</th>
                    <th className="px-6 py-4 font-semibold text-right">Discount Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredOrgs.map(org => (
                    <tr key={org.partner_id} className="hover:bg-[#F8F9FA]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-brand-dark">{org.partner_id}</td>
                      <td className="px-6 py-4 font-semibold text-brand-dark">{org.partner_name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          org.billing_type === 'Prepaid' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {org.billing_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-brand-dark">{org.discount_percentage}%</td>
                    </tr>
                  ))}
                  {filteredOrgs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No organisations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div>
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#F8F9FA]/50">
              <h3 className="font-semibold text-brand-dark">Referring Doctors Network</h3>
              <button className="flex items-center space-x-2 bg-brand-primary hover:bg-[#329E67] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                <Plus size={16} />
                <span>Add Doctor</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FA] border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4 font-semibold">Doctor ID</th>
                    <th className="px-6 py-4 font-semibold">Name & Speciality</th>
                    <th className="px-6 py-4 font-semibold">Clinic / Hospital</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold text-right">Commission Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredDoctors.map(doc => (
                    <tr key={doc.id} className="hover:bg-[#F8F9FA]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-brand-dark">{doc.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-brand-dark">{doc.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{doc.speciality}</p>
                      </td>
                      <td className="px-6 py-4 text-brand-dark">{doc.clinic}</td>
                      <td className="px-6 py-4 text-brand-dark">{doc.contact}</td>
                      <td className="px-6 py-4 text-right font-medium text-brand-dark">{doc.commission}%</td>
                    </tr>
                  ))}
                  {filteredDoctors.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No referring doctors found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
