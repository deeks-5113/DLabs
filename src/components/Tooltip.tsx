import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children ? (
        children
      ) : (
        <span className="cursor-help text-gray-400 hover:text-blue-500 transition-colors ml-1 inline-flex items-center align-middle" id="tooltip-trigger">
          <HelpCircle size={14} className="inline" />
        </span>
      )}
      {isVisible && (
        <div id="tooltip-container" className="absolute z-50 left-full ml-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-left-2 duration-150">
          <div className="absolute -left-1.5 top-3.5 w-3 h-3 bg-slate-900 border-b border-l border-slate-700 rotate-45"></div>
          <div className="relative z-10 leading-relaxed font-sans">{content}</div>
        </div>
      )}
    </div>
  );
};
