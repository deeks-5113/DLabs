import React from 'react';
import { 
  Users, 
  Activity, 
  IndianRupee, 
  Briefcase, 
  UserPlus, 
  FileSpreadsheet, 
  Plus, 
  ArrowRight,
  TrendingUp,
  CircleDot
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';
import { formatCurrency } from '../utils/format';

interface DashboardViewProps {
  onNavigate: (module: 'registration' | 'admin', payload?: any) => void;
  highlightedAccession?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate, highlightedAccession }) => {
  const { encounters, patients, b2bPartners, testCatalog, currentLanguage } = useApp();
  const t = translations[currentLanguage];

  // Metrics calculation
  const totalEncounters = encounters.length;
  const pendingAccessionCount = encounters.filter(e => e.status === 'Pending Accession').length;
  
  // Calculate potential collections
  const totalCollections = encounters.reduce((sum, e) => sum + e.total_amount, 0);
  
  // Custom average discounts or B2B stats
  const activeB2BCount = b2bPartners.length;

  return (
    <div id="dashboard-view" className="space-y-8 animate-in fade-in duration-200">
      
      {/* Dynamic Title Area */}
      <div>
        <h2 className="text-3xl font-serif font-light text-[#2D2D2B] tracking-tight">{t.dashboard.title}</h2>
        <p className="text-sm text-[#6B6B66] mt-1">{t.dashboard.subtitle}</p>
      </div>

      {/* Numerical Command Metrics (Bento Grid Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Metric Card 1: Total Enrolled */}
        <div id="metric-total-orders" className="bg-white p-6 rounded-3xl border border-[#E5E2D9] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9E96]">{t.dashboard.metricTotalEncounters}</p>
            <h3 className="text-3xl font-serif font-bold text-[#2D2D2B] tracking-tight">{totalEncounters}</h3>
            <p className="text-[11px] text-emerald-700 font-medium flex items-center space-x-1">
              <TrendingUp size={12} />
              <span>Full intake matching 100% SLA</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] border border-[#E5E2D9] flex items-center justify-center text-[#5A5A40]">
            <Users size={22} />
          </div>
        </div>

        {/* Metric Card 2: Pending Accession */}
        <div id="metric-pending-accessions" className="bg-white p-6 rounded-3xl border border-[#E5E2D9] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9E96]">{t.dashboard.metricPendingAccession}</p>
            <h3 className="text-3xl font-serif font-bold text-[#2D2D2B] tracking-tight">{pendingAccessionCount}</h3>
            <p className="text-[11px] text-amber-700 font-medium flex items-center space-x-1">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
              <span>Awaiting specimen collection barcoding</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 shadow-xs border border-amber-100 flex items-center justify-center text-amber-850">
            <Activity size={22} />
          </div>
        </div>

        {/* Metric Card 3: Expected Collections */}
        <div id="metric-expected-collections" className="bg-white p-6 rounded-3xl border border-[#E5E2D9] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9E96]">{t.dashboard.metricTotalRevenue}</p>
            <h3 className="text-3xl font-serif font-bold text-[#2D2D2B] tracking-tight">{formatCurrency(totalCollections)}</h3>
            <p className="text-[11px] text-[#6B6B66] font-sans">
              Indian Spaced Currency formatting
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#5A5A40]/10 border border-[#5A5A40]/20 flex items-center justify-center text-[#5A5A40]">
            <IndianRupee size={22} />
          </div>
        </div>

        {/* Metric Card 4: Corporate Clients */}
        <div id="metric-corporate-b2b" className="bg-white p-6 rounded-3xl border border-[#E5E2D9] shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9E9E96]">{t.dashboard.metricB2BRevenue}</p>
            <h3 className="text-3xl font-serif font-bold text-[#2D2D2B] tracking-tight">{activeB2BCount}</h3>
            <p className="text-[11px] text-[#5A5A40] font-medium flex items-center space-x-1">
              <span>Standard client contracts ledgered</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] border border-[#E5E2D9] flex items-center justify-center text-[#5A5A40]">
            <Briefcase size={22} />
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Enrolled Audits & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Registered Intake Ledger */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E5E2D9] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-[#E5E2D9] flex justify-between items-center bg-[#FAF9F6]/40">
            <div>
              <h4 className="text-sm font-bold text-[#2D2D2B]">{t.dashboard.recentOrders}</h4>
              <p className="text-xs text-[#9E9E96] mt-0.5">Primary queue auditing panel</p>
            </div>
            <button 
              onClick={() => onNavigate('registration')}
              className="px-4 py-1.8 text-xs text-[#5A5A40] hover:bg-[#F3F1ED] rounded-xl font-bold transition-all flex items-center space-x-1.5 cursor-pointer border border-[#E5E2D9]"
            >
              <span>Onboard Intake</span>
              <Plus size={14} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F3F1ED]/50 border-b border-[#E5E2D9]">
                  <th className="px-6 py-3.5 text-xs font-bold text-[#6B6B66] uppercase tracking-wider">{t.dashboard.tableAccession}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-[#6B6B66] uppercase tracking-wider">{t.dashboard.tablePatient}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-[#6B6B66] uppercase tracking-wider">{t.dashboard.tablePartner}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-[#6B6B66] uppercase tracking-wider">{t.dashboard.tableAmount}</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-[#6B6B66] uppercase tracking-wider">{t.dashboard.tableStatus}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9]/40 text-sm">
                {encounters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[#9E9E96]">
                      {t.common.noData}
                    </td>
                  </tr>
                ) : (
                  encounters.map((encounter) => {
                    const patient = patients.find(p => p.patient_id === encounter.patient_id);
                    const partner = b2bPartners.find(b => b.partner_id === encounter.partner_id);
                    const isHighlighted = highlightedAccession === encounter.accession_no;
                    
                    return (
                      <tr 
                        key={encounter.encounter_id} 
                        id={`dashboard-row-${encounter.accession_no}`}
                        className={`transition-colors duration-300 ${
                          isHighlighted 
                            ? 'bg-[#5A5A40]/10 border-y border-[#5A5A40]/30 font-semibold' 
                            : 'hover:bg-[#FAF9F6]/40'
                        }`}
                      >
                        <td className="px-6 py-4 font-mono font-bold text-[#2D2D2B] flex items-center space-x-2.5">
                          <CircleDot size={10} className={encounter.status === 'Pending Accession' ? 'text-amber-600' : 'text-emerald-700'} />
                          <span>{encounter.accession_no}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-[#2D2D2B]">{patient ? patient.patient_name : 'Default Intake'}</div>
                          <div className="text-[11px] text-[#9E9E96] font-mono mt-0.5">{patient ? `Phone: ${patient.contact_number}` : ''}</div>
                        </td>
                        <td className="px-6 py-4">
                          {partner ? (
                            <div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-[#5A5A40]/10 text-[#5A5A40] border border-[#5A5A40]/25">
                                {partner.partner_name}
                              </span>
                              <div className="text-[10px] text-[#9E9E96] font-mono mt-0.5">{partner.discount_percentage}% contract rebate</div>
                            </div>
                          ) : (
                            <span className="text-[#9E9E96] text-xs italic">Retail Cash Desk</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-[#2D2D2B]">
                          {formatCurrency(encounter.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-100">
                            {encounter.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Functional Command Center Shortcuts */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E5E2D9] shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-[#9E9E96] uppercase tracking-widest">{t.dashboard.quickActions}</h4>
            <div className="space-y-3.5">
              
              {/* Shortcut 1: Patient Intake */}
              <button
                id="btn-shortcut-intake"
                onClick={() => onNavigate('registration')}
                className="w-full p-4 hover:bg-[#F3F1ED]/50 rounded-2xl border border-[#E5E2D9] text-left transition-all flex items-center justify-between group cursor-pointer hover:border-[#5A5A40]/30"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-[#F3F1ED] text-[#5A5A40] rounded-xl group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2D2D2B] leading-normal">{t.dashboard.actionRegister}</p>
                    <p className="text-[11px] text-[#9E9E96] mt-0.5 leading-none">Register patient & calculate bills</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#9E9E96] group-hover:text-[#5A5A40] transform group-hover:translate-x-1 transition-all" />
              </button>

              {/* Shortcut 2: Configure Clinical Tests */}
              <button
                id="btn-shortcut-tests"
                onClick={() => onNavigate('admin', { tab: 'tests' })}
                className="w-full p-4 hover:bg-[#F3F1ED]/50 rounded-2xl border border-[#E5E2D9] text-left transition-all flex items-center justify-between group cursor-pointer hover:border-[#5A5A40]/30"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-[#F3F1ED] text-[#5A5A40] rounded-xl group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
                    <FileSpreadsheet size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2D2D2B] leading-normal">{t.dashboard.actionAddTest}</p>
                    <p className="text-[11px] text-[#9E9E96] mt-0.5 leading-none">Add CBC, HbA1c or diagnostic catalogs</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#9E9E96] group-hover:text-[#5A5A40] transform group-hover:translate-x-1 transition-all" />
              </button>

              {/* Shortcut 3: Corporate Clients */}
              <button
                id="btn-shortcut-partners"
                onClick={() => onNavigate('admin', { tab: 'partners' })}
                className="w-full p-4 hover:bg-[#F3F1ED]/50 rounded-2xl border border-[#E5E2D9] text-left transition-all flex items-center justify-between group cursor-pointer hover:border-[#5A5A40]/30"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2.5 bg-[#F3F1ED] text-[#5A5A40] rounded-xl group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2D2D2B] leading-normal">{t.dashboard.actionAddPartner}</p>
                    <p className="text-[11px] text-[#9E9E96] mt-0.5 leading-none">Onboard corporate contracted rebate clients</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#9E9E96] group-hover:text-[#5A5A40] transform group-hover:translate-x-1 transition-all" />
              </button>

            </div>
          </div>

          {/* Quick Terminal Metrics Disclaimer Card */}
          <div className="bg-[#5A5A40] p-6 rounded-3xl text-white space-y-3 shadow-md">
            <h5 className="text-xs font-mono font-bold tracking-wider text-[#FAF9F6]/80 uppercase">Aviation Intake Guidelines</h5>
            <p className="text-xs text-[#FAF9F6]/90 leading-relaxed font-sans">
              Ensure physical barcodes are correctly adhered to specimens in the appropriate vials (EDTA Purple for Blood, SST Yellow for Serum). Maintain consistent IST logging records.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-[#FAF9F6]/70 font-mono">LIMS Rev 1.0.4-IST</span>
              <span className="text-[10px] px-2 py-0.5 bg-black/15 rounded-full text-[#FAF9F6] font-mono">SLA Verified</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
