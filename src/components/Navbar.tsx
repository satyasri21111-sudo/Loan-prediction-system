import React from 'react';
import { Download, Server, CheckCircle2, AlertCircle } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenRunGuide: () => void;
  backendConnected: boolean | null;
}

export const NAV_LINKS = [
  { id: 'home', label: 'Home' },
  { id: 'dataset', label: 'Dataset' },
  { id: 'analysis', label: 'Data Analysis' },
  { id: 'model', label: 'Model' },
  { id: 'prediction', label: 'Loan Prediction' },
  { id: 'about', label: 'About' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenRunGuide,
  backendConnected,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & System Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('home')}>
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              LP
            </div>
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-tight block">
                Loan Prediction Data Analysis System
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-normal">
                Retail Credit Analytics & Prediction
              </span>
            </div>
          </div>

          {/* Simple Professional Navigation Bar (No emojis) */}
          <nav className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map(link => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Backend Status & Project Download */}
          <div className="flex items-center gap-2.5">
            {/* Backend status badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border font-mono ${
                backendConnected === true
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
              }`}
              title={
                backendConnected === true
                  ? 'Connected to Python Flask API (http://localhost:5000)'
                  : 'Integrated Analytical Engine active. Start Flask backend on localhost:5000 to link live server.'
              }
            >
              <Server className="w-3 h-3 text-slate-400" />
              <span>
                {backendConnected === true ? 'Flask API: Online' : 'Engine: Standalone'}
              </span>
            </div>

            <button
              onClick={onOpenRunGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Project Files</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800 gap-1 scrollbar-none">
          {NAV_LINKS.map(link => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`px-3 py-1 text-xs whitespace-nowrap rounded-md font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
