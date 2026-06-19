import React from 'react';
// @ts-ignore
import dlabsLogo from '../../Dlabs_102.svg';
import {
  LayoutDashboard,
  Settings,
  UserPlus,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Search,
  Calendar,
  Receipt,
  TrendingDown,
  Archive,
  Printer,
  Table,
  Cpu,
  UserCheck2,
  Building2,
  FileSpreadsheet,
  Grid,
  Users2,
  Sliders,
  Database,
  Terminal,
  Activity,
  Award,
  Barcode,
  FlaskConical,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';

interface SidebarProps {
  currentModule: 'dashboard' | 'registration' | 'accession' | 'operations' | 'finance' | 'admin';
  onChangeModule: (module: 'dashboard' | 'registration' | 'accession' | 'operations' | 'finance' | 'admin') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentModule, onChangeModule }) => {
  const { activeSubView, setActiveSubView, encounters, samples, patientCases, currentLanguage } = useApp();
  const t = translations[currentLanguage];

  const [expandedModule, setExpandedModule] = React.useState<'registration' | 'accession' | 'operations' | 'finance' | 'admin' | null>(
    currentModule !== 'dashboard' ? currentModule : null
  );

  React.useEffect(() => {
    if (currentModule !== 'dashboard') {
      setExpandedModule(currentModule);
    }
  }, [currentModule]);

  const handleModuleClick = (module: 'dashboard' | 'registration' | 'accession' | 'operations' | 'finance' | 'admin') => {
    if (module === 'dashboard') {
      onChangeModule(module);
      setExpandedModule(null);
      return;
    }

    if (expandedModule === module) {
      setExpandedModule(null);
    } else {
      setExpandedModule(module);
      onChangeModule(module);
      if (module === 'registration') {
        setActiveSubView('registration-billing');
      } else if (module === 'admin') {
        setActiveSubView('account-overview');
      } else if (module === 'accession') {
        setActiveSubView('accession-pending-accession');
      } else if (module === 'operations') {
        setActiveSubView('ops-dashboard');
      } else if (module === 'finance') {
        setActiveSubView('finance-dashboard');
      }
    }
  };

  const pendingAccessionCount = encounters.filter(e => e.status === 'Pending Accession').length;
  const pendingCollectionCount = React.useMemo(() => {
    const pendingSmp = samples.filter(s => s.status === 'Pending Collection');
    const uniqueAccs = new Set(pendingSmp.map(s => s.accession_no));
    return uniqueAccs.size;
  }, [samples]);
  const accessedCount = samples.filter(s => s.status === 'Accessed').length;
  const rejectedCount = samples.filter(s => s.status === 'Rejected').length;

  const accessionSubitems = [
    { id: 'accession-pending-accession', label: `Pending Accession (${pendingAccessionCount})`, icon: ClipboardList },
    { id: 'accession-pending-collection', label: `Pending Collection (${pendingCollectionCount})`, icon: Users2 },
    { id: 'accession-accessed', label: `Accessed (${accessedCount})`, icon: Barcode },
    { id: 'accession-rejected', label: `Rejected Samples (${rejectedCount})`, icon: AlertTriangle },
    { id: 'accession-settings', label: 'Accession Settings', icon: Settings },
  ];

  const opsCounters = React.useMemo(() => {
    const incompleteCount = 52 + patientCases.filter(p => p.category === 'Incomplete').length;
    const signedCount = 20 + patientCases.filter(p => p.category === 'Signed').length;
    const allTestsCount = incompleteCount + signedCount;

    const partiallyCompleted = patientCases.filter(p => p.category === 'Partially Completed').length;
    const activeReruns = patientCases.filter(p => p.category === 'Active Reruns').length;
    const completed = patientCases.filter(p => p.category === 'Completed').length;
    const partiallySigned = patientCases.filter(p => p.category === 'Partially Signed').length;

    const emergencyCount = patientCases.filter(p => p.category === 'Emergency Reports').length;
    const criticalCount = patientCases.filter(p => p.category === 'Critical Reports').length;
    const tatExceeded = patientCases.filter(p => p.category === 'TAT Exceeded').length;
    const outsourced = patientCases.filter(p => p.category === 'Outsourced').length;
    const cancelled = patientCases.filter(p => p.category === 'Cancelled Reports').length;

    return {
      allTests: allTestsCount,
      incomplete: incompleteCount,
      partiallyCompleted,
      activeReruns,
      completed,
      partiallySigned,
      signed: signedCount,
      emergency: emergencyCount,
      critical: criticalCount,
      tatExceeded,
      outsourced,
      cancelled
    };
  }, [patientCases]);

  const operationsSubitems = [
    { id: 'ops-dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
    { id: 'ops-all-tests', label: `All Tests (${opsCounters.allTests})`, icon: Grid },
    { id: 'ops-incomplete', label: `Incomplete (${opsCounters.incomplete})`, icon: Activity },
    { id: 'ops-partially-completed', label: `Partially Completed (${opsCounters.partiallyCompleted})`, icon: Archive },
    { id: 'ops-active-reruns', label: `Active Reruns (${opsCounters.activeReruns})`, icon: FlaskConical },
    { id: 'ops-completed', label: `Completed (${opsCounters.completed})`, icon: ShieldCheck },
    { id: 'ops-partially-signed', label: `Partially Signed (${opsCounters.partiallySigned})`, icon: ClipboardList },
    { id: 'ops-signed', label: `Signed (${opsCounters.signed})`, icon: ShieldCheck },
    { id: 'ops-emergency-reports', label: `Emergency Reports (${opsCounters.emergency})`, icon: AlertTriangle },
    { id: 'ops-critical-reports', label: `Critical Reports (${opsCounters.critical})`, icon: AlertTriangle },
    { id: 'ops-tat-exceeded', label: `TAT Exceeded (${opsCounters.tatExceeded})`, icon: Clock },
    { id: 'ops-outsourced', label: `Outsourced (${opsCounters.outsourced})`, icon: Building2 },
    { id: 'ops-cancelled-reports', label: `Cancelled Reports (${opsCounters.cancelled})`, icon: AlertTriangle },
    { id: 'ops-export', label: 'Operational Export', icon: FileSpreadsheet },
    { id: 'ops-settings', label: 'Settings', icon: Settings },
  ];

  const registrationSubitems = [
    { id: 'registration-billing', label: 'Registration / Billing', icon: ClipboardList },
    { id: 'patient-search', label: 'Patient Search', icon: Search },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'billing-history', label: 'Billing History', icon: Receipt },
    { id: 'financial-reports', label: 'Financial Reports', icon: TrendingDown },
    { id: 'archives', label: 'Archives', icon: Archive },
    { id: 'report-prints', label: 'Report Prints', icon: Printer },
    { id: 'collection-reports', label: 'Collection Reports', icon: FileSpreadsheet },
    { id: 'tests-list', label: 'Tests List', icon: Table },
    { id: 'operational-status', label: 'Operational Status', icon: Activity },
    { id: 'advanced-search', label: 'Advanced Search', icon: Database },
  ];

  const financeSubitems = [
    { id: 'finance-dashboard', label: 'Finance Dashboard', icon: LayoutDashboard },
    { id: 'finance-bill-list', label: 'Bill List', icon: Receipt },
    { id: 'finance-b2b', label: 'B2B & Referral Management', icon: Building2 },
  ];

  const adminSubitems = [
    { id: 'referral-mgmt', label: 'Referral Management', icon: UserCheck2 },
    { id: 'org-mgmt', label: 'Organisation Management', icon: Building2 },
    { id: 'profile-report-mgmt', label: 'Profile & Report Management', icon: Award },
    { id: 'account-overview', label: 'Account Overview', icon: LayoutDashboard },
    { id: 'list-group-mgmt', label: 'List & Group Management', icon: Grid },
    { id: 'doctor-mgmt', label: 'Doctor Management', icon: Users2 },
    { id: 'department-mgmt', label: 'Department Management', icon: Cpu },
    { id: 'outsourcing-mgmt', label: 'Outsourcing Management', icon: Activity },
    { id: 'marketing-mgmt', label: 'Marketing Management', icon: TrendingDown },
    { id: 'center-mgmt', label: 'Center Management', icon: Building2 },
    { id: 'users-mgmt', label: 'Users Management', icon: Users2 },
    { id: 'settings', label: 'Setting', icon: Sliders },
    { id: 'storage-mgmt', label: 'Storage Management', icon: Database },
    { id: 'integration-dashboard', label: 'Integration Dashboard', icon: Terminal },
  ];

  return (
    <aside id="sidebar-navigation" className="w-72 bg-white border-r border-gray-200 text-brand-dark flex flex-col shrink-0 min-h-screen shadow-sm overflow-hidden">
      {/* Brand Header */}
      <div className="h-20 border-b border-gray-200 flex items-center px-6 bg-white justify-start">
        <img src={dlabsLogo} alt="DLabs Logo" className="h-10 w-auto object-contain" />
      </div>

      {/* Navigation Layout */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-[#9E9E96] uppercase tracking-widest mb-3">Core Subsystems</p>

        {/* Dashboard Link */}
        <button
          id="sidebar-link-dashboard"
          onClick={() => handleModuleClick('dashboard')}
          className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl cursor-pointer text-left transition-all duration-150 relative group ${currentModule === 'dashboard'
              ? 'bg-brand-primary text-white shadow-md font-bold'
              : 'text-[#6B6B66] hover:bg-[#F3F1ED] hover:text-brand-dark'
            }`}
        >
          <LayoutDashboard size={18} className={currentModule === 'dashboard' ? 'text-white' : 'text-[#6B6B66]'} />
          <div className="flex-1 min-w-0">
            <span className="text-sm block">Dashboard</span>
          </div>
          {currentModule === 'dashboard' && <span className="absolute right-0 top-3 bottom-3 w-1 bg-white rounded-l-md" />}
        </button>

        {/* Registration Subsystem Accordion */}
        <div className="space-y-1">
          <button
            id="sidebar-link-registration"
            onClick={() => handleModuleClick('registration')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer text-left transition-all duration-150 relative group ${currentModule === 'registration'
                ? 'bg-brand-primary/10 text-brand-primary font-bold border border-brand-primary/25'
                : 'text-[#6B6B66] hover:bg-[#F3F1ED] hover:text-brand-dark'
              }`}
          >
            <div className="flex items-center space-x-3">
              <UserPlus size={18} className={currentModule === 'registration' ? 'text-brand-primary' : 'text-[#6B6B66]'} />
              <span className="text-sm">Registration</span>
            </div>
            {expandedModule === 'registration' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {expandedModule === 'registration' && (
            <div className="pl-6.5 pr-1 py-1 space-y-1 bg-[#FAF9F6]/40 rounded-xl border border-[#E5E2D9]/40 mt-1 max-h-72 overflow-y-auto">
              {registrationSubitems.map((sub) => {
                const SubIcon = sub.icon;
                const isSubActive = activeSubView === sub.id;

                return (
                  <button
                    key={sub.id}
                    id={`sublink-${sub.id}`}
                    onClick={() => setActiveSubView(sub.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer text-left text-xs transition-all duration-150 ${isSubActive
                        ? 'bg-brand-primary text-white font-bold shadow-xs'
                        : 'text-[#6B6B66] hover:bg-[#F3F1ED] hover:text-brand-dark'
                      }`}
                  >
                    <SubIcon size={14} className={isSubActive ? 'text-white' : 'text-[#9E9E96]'} />
                    <span className="truncate">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Accession Subsystem Accordion */}
        <div className="space-y-1">
          <button
            id="sidebar-link-accession"
            onClick={() => handleModuleClick('accession')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer text-left transition-all duration-150 relative group ${currentModule === 'accession'
                ? 'bg-brand-primary/10 text-brand-primary font-bold border border-brand-primary/25'
                : 'text-[#6B6B66] hover:bg-[#F3F1ED] hover:text-brand-dark'
              }`}
          >
            <div className="flex items-center space-x-3">
              <Barcode size={18} className={currentModule === 'accession' ? 'text-brand-primary' : 'text-[#6B6B66]'} />
              <span className="text-sm">Sample Accession</span>
            </div>
            {expandedModule === 'accession' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {expandedModule === 'accession' && (
            <div className="pl-6.5 pr-1 py-1 space-y-1 bg-[#FAF9F6]/40 rounded-xl border border-[#E5E2D9]/40 mt-1 max-h-72 overflow-y-auto">
              {accessionSubitems.map((sub) => {
                const SubIcon = sub.icon;
                const isSubActive = activeSubView === sub.id;

                return (
                  <button
                    key={sub.id}
                    id={`sublink-${sub.id}`}
                    onClick={() => setActiveSubView(sub.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer text-left text-xs transition-all duration-150 ${isSubActive
                        ? 'bg-brand-primary text-white font-bold shadow-xs'
                        : 'text-[#6B6B66] hover:bg-[#F3F1ED] hover:text-brand-dark'
                      }`}
                  >
                    <SubIcon size={14} className={isSubActive ? 'text-white' : 'text-[#9E9E96]'} />
                    <span className="truncate">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Operations Subsystem Accordion */}
        <div className="space-y-1">
          <button
            id="sidebar-link-operations"
            onClick={() => handleModuleClick('operations')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer text-left transition-all duration-150 relative group ${currentModule === 'operations'
                ? 'bg-brand-primary/10 text-brand-primary font-bold border border-brand-primary/25'
                : 'text-[#6B6B66] hover:bg-[#F3F1ED] hover:text-brand-dark'
              }`}
          >
            <div className="flex items-center space-x-3">
              <FlaskConical size={18} className={currentModule === 'operations' ? 'text-brand-primary' : 'text-[#6B6B66]'} />
              <span className="text-sm">Operations</span>
            </div>
            {expandedModule === 'operations' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {expandedModule === 'operations' && (
            <div className="pl-6.5 pr-1 py-1 space-y-1 bg-[#FAF9F6]/40 rounded-xl border border-[#E5E2D9]/40 mt-1 max-h-80 overflow-y-auto">
              {operationsSubitems.map((sub) => {
                const SubIcon = sub.icon;
                const isSubActive = activeSubView === sub.id;

                return (
                  <button
                    key={sub.id}
                    id={`sublink-${sub.id}`}
                    onClick={() => setActiveSubView(sub.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer text-left text-xs transition-all duration-150 ${isSubActive
                        ? 'bg-brand-primary text-white font-bold shadow-xs'
                        : 'text-[#6B6B66] hover:bg-[#F3F1ED] hover:text-brand-dark'
                      }`}
                  >
                    <SubIcon size={14} className={isSubActive ? 'text-white' : 'text-[#9E9E96]'} />
                    <span className="truncate">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Finance Subsystem Accordion */}
        <div className="space-y-1">
          <button
            id="sidebar-link-finance"
            onClick={() => handleModuleClick('finance')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer text-left transition-all duration-150 relative group ${currentModule === 'finance'
                ? 'bg-brand-primary/10 text-brand-primary font-bold border border-brand-primary/25'
                : 'text-[#6B6B66] hover:bg-[#F3F1ED] hover:text-brand-dark'
              }`}
          >
            <div className="flex items-center space-x-3">
              <Receipt size={18} className={currentModule === 'finance' ? 'text-brand-primary' : 'text-[#6B6B66]'} />
              <span className="text-sm">Finance</span>
            </div>
            {expandedModule === 'finance' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {expandedModule === 'finance' && (
            <div className="pl-6.5 pr-1 py-1 space-y-1 bg-[#FAF9F6]/40 rounded-xl border border-[#E5E2D9]/40 mt-1 max-h-80 overflow-y-auto">
              {financeSubitems.map((sub) => {
                const SubIcon = sub.icon;
                const isSubActive = activeSubView === sub.id;

                return (
                  <button
                    key={sub.id}
                    id={`sublink-${sub.id}`}
                    onClick={() => setActiveSubView(sub.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer text-left text-xs transition-all duration-150 ${isSubActive
                        ? 'bg-brand-primary text-white font-bold shadow-xs'
                        : 'text-[#6B6B66] hover:bg-[#F3F1ED] hover:text-brand-dark'
                      }`}
                  >
                    <SubIcon size={14} className={isSubActive ? 'text-white' : 'text-[#9E9E96]'} />
                    <span className="truncate">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Admin Subsystem Accordion */}
        <div className="space-y-1">
          <button
            id="sidebar-link-admin"
            onClick={() => handleModuleClick('admin')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl cursor-pointer text-left transition-all duration-150 relative group ${currentModule === 'admin'
                ? 'bg-brand-primary/10 text-brand-primary font-bold border border-brand-primary/25'
                : 'text-[#6B6B66] hover:bg-[#F3F1ED] hover:text-brand-dark'
              }`}
          >
            <div className="flex items-center space-x-3">
              <Settings size={18} className={currentModule === 'admin' ? 'text-brand-primary' : 'text-[#6B6B66]'} />
              <span className="text-sm">Admin Control</span>
            </div>
            {expandedModule === 'admin' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {expandedModule === 'admin' && (
            <div className="pl-6.5 pr-1 py-1 space-y-1 bg-[#FAF9F6]/40 rounded-xl border border-[#E5E2D9]/40 mt-1 max-h-80 overflow-y-auto">
              {adminSubitems.map((sub) => {
                const SubIcon = sub.icon;
                const isSubActive = activeSubView === sub.id;

                return (
                  <button
                    key={sub.id}
                    id={`sublink-${sub.id}`}
                    onClick={() => setActiveSubView(sub.id)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer text-left text-xs transition-all duration-150 ${isSubActive
                        ? 'bg-brand-primary text-white font-bold shadow-xs'
                        : 'text-[#6B6B66] hover:bg-[#F3F1ED] hover:text-brand-dark'
                      }`}
                  >
                    <SubIcon size={14} className={isSubActive ? 'text-white' : 'text-[#9E9E96]'} />
                    <span className="truncate">{sub.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Operator Zone Badge */}
      <div className="p-4 border-t border-[#E5E2D9] bg-[#FAF9F6]/40">
        <div className="rounded-xl bg-[#F3F1ED] p-3.5 border border-[#E5E2D9]">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-[10px] font-bold text-brand-primary font-mono leading-none">TERMINAL ACTIVE</p>
          </div>
          <p className="text-[9px] text-[#6B6B66] mt-1.5 leading-tight">All transaction sessions verified with checksums</p>
        </div>
      </div>
    </aside>
  );
};
