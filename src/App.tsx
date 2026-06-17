import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AdminModule } from './components/AdminModule';
import { RegistrationModule } from './components/RegistrationModule';
import { AccessionModule } from './components/AccessionModule';
import { OperationsModule } from './components/OperationsModule';

function AppContent() {
  const [activeModule, setActiveModule] = useState<'dashboard' | 'registration' | 'accession' | 'operations' | 'admin'>('dashboard');
  const { setActiveSubView, activeSubView } = useApp();
  
  // Extra linking states
  const [adminInitialTab, setAdminInitialTab] = useState<'profile' | 'tests' | 'partners'>('profile');
  const [adminFilterQuery, setAdminFilterQuery] = useState('');
  const [registrationInitialPhone, setRegistrationInitialPhone] = useState('');
  const [dashboardHighlightedAccession, setDashboardHighlightedAccession] = useState('');

  /**
   * Orchestrates deep links triggered by global instant-search.
   */
  const handleNavigateResult = (targetModule: 'dashboard' | 'registration' | 'admin', payload?: any) => {
    setActiveModule(targetModule);
    if (targetModule === 'admin') {
      if (payload?.tab === 'tests') {
        setActiveSubView('settings'); // maps back to configuring settings or prices
        setAdminInitialTab('tests');
      } else if (payload?.tab === 'partners') {
        setActiveSubView('org-mgmt');
        setAdminInitialTab('partners');
      } else {
        setActiveSubView('account-overview');
      }
      if (payload?.filter) {
        setAdminFilterQuery(payload.filter);
      } else {
        setAdminFilterQuery('');
      }
    } else if (targetModule === 'registration') {
      if (payload?.subview) {
        setActiveSubView(payload.subview);
      } else {
        setActiveSubView('registration-billing');
      }
      if (payload?.phone_number) {
        setRegistrationInitialPhone(payload.phone_number);
      } else {
        setRegistrationInitialPhone('');
      }
    } else if (targetModule === 'dashboard') {
      if (payload?.highlight) {
        setDashboardHighlightedAccession(payload.highlight);
        setTimeout(() => {
          setDashboardHighlightedAccession('');
        }, 5000);
      }
    }
  };

  /**
   * Shortcut navigation
   */
  const handleQuickNavigate = (module: 'registration' | 'admin', payload?: any) => {
    setActiveModule(module);
    if (module === 'admin') {
      if (payload?.tab === 'tests') {
        setActiveSubView('settings');
      } else if (payload?.tab === 'partners') {
        setActiveSubView('org-mgmt');
      } else {
        setActiveSubView('account-overview');
      }
      setAdminFilterQuery('');
    } else if (module === 'registration') {
      if (payload?.subview) {
        setActiveSubView(payload.subview);
      } else {
        setActiveSubView('registration-billing');
      }
      setRegistrationInitialPhone('');
    }
  };

  return (
    <div id="dl-lims-applet" className="flex h-screen w-screen overflow-hidden bg-[#FAF9F6] text-[#3C3C3B] font-sans">
      
      {/* Sidebar navigation drawer with cascaded accordions */}
      <Sidebar 
        currentModule={activeModule} 
        onChangeModule={(m) => {
          setActiveModule(m);
          setAdminFilterQuery('');
          setRegistrationInitialPhone('');
          setDashboardHighlightedAccession('');
        }} 
      />

      {/* Main viewport area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        
        {/* Top Control header */}
        <Header 
          currentModule={activeModule} 
          onNavigateResult={handleNavigateResult} 
        />
        
        {/* Module Render Routing */}
        <main id="main-viewport" className="flex-1 overflow-y-auto p-8 bg-[#FAF9F6]">
          <div className="max-w-7xl mx-auto w-full">
            {activeModule === 'dashboard' && (
              <DashboardView 
                onNavigate={handleQuickNavigate} 
                highlightedAccession={dashboardHighlightedAccession} 
              />
            )}
            {activeModule === 'registration' && (
              <RegistrationModule 
                initialPhone={registrationInitialPhone} 
              />
            )}
            {activeModule === 'accession' && (
              <AccessionModule />
            )}
            {activeModule === 'operations' && (
              <OperationsModule />
            )}
            {activeModule === 'admin' && (
              <AdminModule 
                initialTab={adminInitialTab} 
                filterQuery={adminFilterQuery} 
              />
            )}
          </div>
        </main>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
