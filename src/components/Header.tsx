import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, Keyboard, User, ArrowRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations } from '../translations';

interface HeaderProps {
  currentModule: string;
  onNavigateResult: (targetModule: 'dashboard' | 'registration' | 'accession' | 'operations' | 'admin', payload?: any) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentModule, onNavigateResult }) => {
  const { searchGlobal, currentLanguage, setLanguage, currentUser } = useApp();
  const t = translations[currentLanguage];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [istTime, setIstTime] = useState('');
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync search results
  useEffect(() => {
    let active = true;
    if (searchQuery.trim().length > 0) {
      Promise.resolve(searchGlobal(searchQuery)).then(results => {
        if (active) {
          const isAdmin = currentUser?.userRole === 'Super Administrator' || currentUser?.userRole === 'Admin';
          let filtered = results;
          if (currentUser?.userRole === 'Employee') {
            filtered = results.filter(r => r.targetModule === 'registration' && (!r.payload?.subview || r.payload.subview === 'billing-history' || r.payload.subview === 'registration-billing'));
          } else if (!isAdmin) {
            filtered = results.filter(r => r.targetModule !== 'admin');
          }
          setSearchResults(filtered);
          setIsDropdownOpen(true);
        }
      });
    } else {
      setSearchResults([]);
      setIsDropdownOpen(false);
    }
    return () => {
      active = false;
    };
  }, [searchQuery, searchGlobal, currentUser]);

  // Handle outside clicks to close the search dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Live IST clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Force IST conversion regardless of browser environment
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const istDate = new Date(utcTime + (3600000 * 5.5)); // +5.5 hours for IST
      
      const hours = String(istDate.getHours()).padStart(2, '0');
      const minutes = String(istDate.getMinutes()).padStart(2, '0');
      const seconds = String(istDate.getSeconds()).padStart(2, '0');
      const day = String(istDate.getDate()).padStart(2, '0');
      const month = String(istDate.getMonth() + 1).padStart(2, '0');
      const year = istDate.getFullYear();
      
      setIstTime(`${day}/${month}/${year} ${hours}:${minutes}:${seconds}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResultClick = (result: any) => {
    onNavigateResult(result.targetModule, result.payload);
    setSearchQuery('');
    setIsDropdownOpen(false);
    searchInputRef.current?.blur();
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    searchInputRef.current?.focus();
  };

  return (
    <header id="global-header" className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 relative shrink-0 z-30">
      
      {/* Persistent Global Search Container */}
      <div ref={dropdownRef} className="w-120 relative">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E9E96] group-focus-within:text-brand-primary transition-colors" size={18} />
          <input
            id="global-search-bar"
            ref={searchInputRef}
            type="text"
            className="w-full pl-11 pr-22 py-2.5 bg-gray-100 border-none rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30 text-sm transition-all text-brand-dark"
            placeholder={t.navigation.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim().length > 0 && setIsDropdownOpen(true)}
          />
          
          {/* Quick Shortcuts Visual Indicator */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-1.5 pointer-events-none">
            {searchQuery ? (
              <button 
                type="button" 
                onClick={clearSearch}
                className="pointer-events-auto p-0.5 rounded-full hover:bg-[#E5E2D9] text-[#9E9E96] hover:text-brand-dark mr-1"
              >
                <X size={14} />
              </button>
            ) : (
              <>
                <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 font-mono text-[10px] font-bold text-[#9E9E96] bg-white border border-gray-200 rounded-md shadow-xs">
                  Ctrl
                </kbd>
                <span className="text-[10px] text-[#9E9E96] font-mono">+</span>
                <kbd className="hidden sm:inline-flex items-center h-5 px-1.5 font-mono text-[10px] font-bold text-[#9E9E96] bg-white border border-gray-200 rounded-md shadow-xs">
                  K
                </kbd>
              </>
            )}
          </div>
        </div>

        {/* Global Instant-Search Dropdown Overlays */}
        {isDropdownOpen && (
          <div id="search-dropdown-results" className="absolute top-13 left-0 right-0 max-h-96 min-w-120 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-150 py-2">
            <div className="px-4 py-2 text-[10px] font-bold text-[#6B6B66] uppercase tracking-widest border-b border-gray-200 flex justify-between items-center bg-brand-bg">
              <span>Matching Core Ledger Results ({searchResults.length})</span>
              <span className="font-normal font-mono text-[9px] text-[#9E9E96]">Click to redirect context</span>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm text-[#9E9E96] font-medium">
                No matching Patient, Accession code, or Test catalog found
              </div>
            ) : (
              <div className="divide-y divide-[#E5E2D9]/40">
                {searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    id={`search-result-${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-5 py-3.5 hover:bg-gray-100/50 flex items-center justify-between group transition-colors cursor-pointer text-left focus:outline-none focus:bg-gray-100/30"
                  >
                    <div className="flex items-start space-x-3.5 min-w-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold shrink-0 uppercase tracking-wider ${
                        result.type === 'patient' ? 'bg-brand-primary/10 text-brand-primary border border-[#5A5A40]/20' :
                        result.type === 'accession' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                        result.type === 'test' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                        'bg-gray-100 text-[#6B6B66] border border-gray-200'
                      }`}>
                        {result.type}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-brand-dark group-hover:text-brand-primary block truncate transition-colors leading-normal">{result.title}</p>
                        <p className="text-xs text-[#6B6B66] block truncate mt-0.5 font-sans leading-none">{result.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-300 group-hover:text-brand-primary transition-colors pl-2 shrink-0">
                      <span className="text-[10px] font-bold uppercase text-[#9E9E96] group-hover:text-brand-primary mr-1.5 transition-colors">Go to {result.targetModule}</span>
                      <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls Area: Clock and Tech Credentials */}
      <div className="flex items-center space-x-6">
        
        {/* Language Selector */}
        <div id="i18n-language-selector" className="flex items-center space-x-1 bg-gray-100 border border-gray-200 p-1 rounded-xl text-[11px] font-bold">
          <button
            id="lang-en-btn"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              currentLanguage === 'en'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-[#6B6B66] hover:text-brand-dark'
            }`}
          >
            EN
          </button>
          <button
            id="lang-te-btn"
            onClick={() => setLanguage('te')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              currentLanguage === 'te'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-[#6B6B66] hover:text-brand-dark'
            }`}
          >
            తెలుగు
          </button>
          <button
            id="lang-hi-btn"
            onClick={() => setLanguage('hi')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              currentLanguage === 'hi'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-[#6B6B66] hover:text-brand-dark'
            }`}
          >
            हिंदी
          </button>
        </div>

        {/* GMT+5:30 IST Clock */}
        <div id="ist-regional-clock" className="flex items-center space-x-3 bg-gray-100 border border-gray-200 px-4.5 py-1.8 rounded-xl font-mono text-xs text-brand-dark select-none">
          <div className="flex items-center space-x-1.5">
            <Clock size={14} className="text-brand-primary" />
            <span className="text-[#6B6B66] text-[11px] font-bold uppercase tracking-wide">IST</span>
          </div>
          <span className="text-[#E5E2D9]">|</span>
          <span className="font-semibold">{istTime || 'Loading regional clock...'}</span>
        </div>

        {/* User Account / Operator Credentials badge */}
        <div id="operator-badge" className="flex items-center space-x-3 border-l border-gray-200 pl-6">
          <div className="text-right">
            <p className="text-sm font-bold text-brand-dark">{currentUser?.name || 'Operator Terminal'}</p>
            <p className="text-[9px] font-mono text-[#9E9E96] tracking-tight leading-none mt-0.5">{currentUser?.username ? `${currentUser.username}@dlabs.com` : 'deekshithsistu@gmail.com'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E5E2D9] flex items-center justify-center text-brand-primary font-bold">
            {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'OT'}
          </div>
        </div>

      </div>
    </header>
  );
};
