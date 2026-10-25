import React from 'react';
import {
  LayoutDashboard,
  Database,
  BarChart2,
  Cpu,
  CheckCircle2,
  Info,
  Code2,
  Download,
  Terminal,
  Activity,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCodeModal: () => void;
  onOpenGuideModal: () => void;
  onDownloadZip: () => void;
  backendConnected: boolean | null;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'dataset', label: 'Dataset', icon: Database },
  { id: 'analysis', label: 'Data Analysis', icon: BarChart2 },
  { id: 'models', label: 'Models', icon: Cpu },
  { id: 'prediction', label: 'Loan Prediction', icon: CheckCircle2 },
  { id: 'about', label: 'About', icon: Info },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCodeModal,
  onOpenGuideModal,
  onDownloadZip,
  backendConnected,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs font-bold text-sm tracking-tight">
              LP
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight block leading-tight">
                Loan Prediction
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-normal">
                Data Analysis System
              </span>
            </div>
          </div>

          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation List - Clean, NO Emojis */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </div>
          {NAV_ITEMS.map(item => {
            const isActive = currentTab === item.id || (item.id === 'dashboard' && currentTab === 'home');
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Backend Status indicator */}
        <div className="px-4 py-2.5 mx-3 mb-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 truncate">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                backendConnected === true
                  ? 'bg-emerald-500 shadow-xs shadow-emerald-500/50'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="text-slate-600 dark:text-slate-400 truncate">
              {backendConnected === true ? 'Flask API (Port 5000)' : 'Client Engine Active'}
            </span>
          </div>
          <Activity className="w-3 h-3 text-slate-400 shrink-0" />
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5 bg-slate-50/50 dark:bg-slate-900/40">
          <button
            onClick={() => {
              onOpenCodeModal();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs"
          >
            <Code2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Python Files</span>
          </button>

          <button
            onClick={() => {
              onOpenGuideModal();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-800 shadow-2xs"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-500" />
            <span>Terminal Run Guide</span>
          </button>

          <button
            onClick={onDownloadZip}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Project</span>
          </button>
        </div>
      </aside>
    </>
  );
};
