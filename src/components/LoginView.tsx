import React, { useState } from 'react';
// @ts-ignore
import dlabsLogo from '../../Dlabs_102.svg';
import { useApp } from '../context/AppContext';
import { ShieldCheck, User as UserIcon, Lock } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        setError('Invalid username or password. Please try again.');
      }
    } catch (err) {
      setError('A system error occurred. Please contact the administrator.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAF9F6] font-sans">
      {/* Left Pane - Branding & Info */}
      <div className="hidden lg:flex w-1/2 bg-[#5A5A40] text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
            <polygon points="0,100 100,0 100,100" fill="#ffffff" />
          </svg>
        </div>

        <div className="relative z-10">
          <img src={dlabsLogo} alt="DLabs Logo" className="h-30 w-auto mt-16 mb-8 bg-white/10 p-2 rounded-xl backdrop-blur-sm" />
          <h1 className="text-4xl font-serif font-bold leading-tight mb-6">
            Pioneering Precision<br />in Clinical Pathology
          </h1>
          <p className="text-[#D1D1C7] text-lg max-w-md leading-relaxed">
            DLabs Laboratory Information Management System (LIMS) orchestrates our nationwide diagnostic operations.
            Securely access patient records, accessioning queues, and automated analyzer telemetry.
          </p>
        </div>

        <div className="relative z-10 text-xs text-[#A3A393] space-y-2">
          <p>© 2026 DLabs Diagnostics Pvt Ltd. All rights reserved.</p>
          <p>ISO 9001:2015 Accredited | HIPAA Compliant Infrastructure</p>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#2D2D2B] font-serif">Welcome back</h2>
            <p className="text-[#6B6B66] mt-2 text-sm">Please authenticate to access the LIMS network.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6B6B66] uppercase tracking-wider">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={16} className="text-[#9E9E96]" />
                  </div>
                  <input
                    type="text"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-[#E5E2D9] rounded-xl text-[#2D2D2B] placeholder-[#9E9E96] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] bg-white transition-all"
                    placeholder="Enter your system ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#6B6B66] uppercase tracking-wider">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={16} className="text-[#9E9E96]" />
                  </div>
                  <input
                    type="password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-[#E5E2D9] rounded-xl text-[#2D2D2B] placeholder-[#9E9E96] focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] bg-white transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-start space-x-2 text-sm">
                <ShieldCheck size={18} className="shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#5A5A40] hover:bg-[#4a4a35] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5A5A40] transition-colors disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
            >
              {isLoading ? 'Authenticating...' : 'Secure Login'}
            </button>

            <div className="text-center">
              <p className="text-[11px] text-[#9E9E96]">
                Hint: Login with <span className="font-mono bg-[#E5E2D9] px-1 rounded text-[#2D2D2B]">ops_lab_admin</span> or <span className="font-mono bg-[#E5E2D9] px-1 rounded text-[#2D2D2B]">lab_tech_r</span> and password <span className="font-mono bg-[#E5E2D9] px-1 rounded text-[#2D2D2B]">password123</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
