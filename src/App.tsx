import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { AdminModule } from './components/AdminModule';
import { RegistrationModule } from './components/RegistrationModule';
import { AccessionModule } from './components/AccessionModule';
import { OperationsModule } from './components/OperationsModule';
import { FinanceModule } from './components/FinanceModule';
import { LoginView } from './components/LoginView';

function AppContent() {
  const { setActiveSubView, activeSubView, isLoading, currentUser } = useApp();
  const isAdmin = currentUser?.userRole === 'Super Administrator' || currentUser?.userRole === 'Admin';

  const [activeModule, setActiveModule] = useState<'dashboard' | 'registration' | 'accession' | 'operations' | 'finance' | 'admin'>(() => {
    if (currentUser?.userRole === 'Employee') {
      return 'registration';
    }
    return 'dashboard';
  });

  useEffect(() => {
    if (currentUser?.userRole === 'Employee') {
      if (activeModule !== 'registration') {
        setActiveModule('registration');
      }
      if (activeSubView !== 'registration-billing' && activeSubView !== 'billing-history') {
        setActiveSubView('registration-billing');
      }
    } else if (!isAdmin && currentUser) {
      if (activeModule === 'finance' && activeSubView !== 'finance-bill-list') {
        setActiveSubView('finance-bill-list');
      }
    }
  }, [currentUser, isAdmin, activeModule, activeSubView, setActiveSubView]);

  
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

  if (!currentUser) {
    return <LoginView />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#FAF9F6] flex-col gap-4">
        {/* A beautiful laboratory flask animation or spinner */}
        <div className="relative w-16 h-16 border-4 border-t-[#5A5A40] border-r-transparent border-b-[#5A5A40] border-l-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-[#5A5A40] font-mono tracking-wider animate-pulse">DLABS LIMS SECURE SYNCING...</p>
      </div>
    );
  }

  return (
    <div id="dl-lims-applet" className="flex h-screen w-screen overflow-hidden bg-brand-bg text-brand-dark font-sans">
      
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
        <main id="main-viewport" className="flex-1 overflow-y-auto p-8 bg-brand-bg">
          <div className="max-w-7xl mx-auto w-full">
            {activeModule === 'dashboard' && currentUser?.userRole !== 'Employee' && (
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
            {activeModule === 'accession' && currentUser?.userRole !== 'Employee' && (
              <AccessionModule />
            )}
            {activeModule === 'operations' && currentUser?.userRole !== 'Employee' && (
              <OperationsModule />
            )}
            {activeModule === 'finance' && currentUser?.userRole !== 'Employee' && (
              <FinanceModule />
            )}
            {activeModule === 'admin' && currentUser?.userRole !== 'Employee' && (
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
