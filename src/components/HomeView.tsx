import React from 'react';
import { ArrowRight, Database, BarChart2, Cpu, CheckCircle } from 'lucide-react';

interface HomeViewProps {
  stats: {
    total: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  };
  onNavigate: (tabId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Title & Short Description */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Loan Prediction Data Analysis System
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          An analytics system that explores historical loan application data and provides loan prediction based on applicant information.
        </p>
      </div>

      {/* 4 Simple Key Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Total Applications
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2 block font-mono">
            {stats.total.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Historical CSV records</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Approved Applications
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2 block font-mono">
            {stats.approved.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Satisfied loan criteria</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Rejected Applications
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-300 mt-2 block font-mono">
            {stats.rejected.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Unmet guidelines / risk</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Approval Rate
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2 block font-mono">
            {stats.approvalRate.toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Overall dataset benchmark</span>
        </div>
      </div>

      {/* System Pipeline Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Core Project Pipeline
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">1. Ingestion</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">614 CSV applicant records</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">2. Cleaning</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Mode & Median imputation</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">3. Analysis</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Demographic & income EDA</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">4. Training</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">LR, Decision Tree, RF</span>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200 dark:border-blue-900">
            <span className="font-semibold text-blue-700 dark:text-blue-300 block">5. Prediction</span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5 block">Instant status decision</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => onNavigate('dataset')}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-500/50 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Dataset Overview
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Inspect the historical data, check missing value statistics, and review cleaning rules.
          </p>
        </div>

        <div
          onClick={() => onNavigate('analysis')}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-500/50 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Data Analysis
            </span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Explore visual distributions of approval rates, credit compliance, education, and income.
          </p>
        </div>

        <div
          onClick={() => onNavigate('prediction')}
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-blue-500/50 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-sm text-blue-600 dark:text-blue-400">
              Loan Prediction Form
            </span>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Submit new applicant details to calculate real machine-learning prediction and financial EMI.
          </p>
        </div>
      </div>
    </div>
  );
};
