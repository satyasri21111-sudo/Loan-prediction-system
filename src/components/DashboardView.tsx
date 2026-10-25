import React from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Percent,
  IndianRupee,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Layers,
} from 'lucide-react';
import { AnalysisApiResponse } from '../api/client';

interface DashboardViewProps {
  stats: {
    total: number;
    approved: number;
    rejected: number;
    approvalRate: number;
    avgLoanAmount?: number;
  };
  analysisData?: AnalysisApiResponse | null;
  onNavigate: (tabId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  analysisData,
  onNavigate,
}) => {
  const total = stats.total || 614;
  const approved = stats.approved || 422;
  const rejected = stats.rejected || 192;
  const approvalRate = stats.approvalRate || 68.7;
  const avgLoanAmount = stats.avgLoanAmount || 146.4; // in thousands

  // Data for charts from analysisData or defaults
  const chData = analysisData?.credit_history || {
    meets_guidelines_rate: 79.6,
    not_meets_guidelines_rate: 8.0,
  };

  const propData = analysisData?.property_area || {
    semiurban_rate: 76.8,
    urban_rate: 65.8,
    rural_rate: 61.5,
  };

  const incomeBins = analysisData?.income_bins || [
    { label: '<₹2.5k', count: 108 },
    { label: '₹2.5k-₹5k', count: 326 },
    { label: '₹5k-₹7.5k', count: 111 },
    { label: '₹7.5k-₹10k', count: 35 },
    { label: '>₹10k', count: 34 },
  ];
  const maxIncomeCount = Math.max(...incomeBins.map(b => b.count), 1);

  // SVG Donut calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const approvedDash = (approvalRate / 100) * circumference;
  const rejectedDash = circumference - approvedDash;

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Key retail portfolio performance indicators, approval statistics, and risk distributions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('prediction')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Run New Prediction</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TOP 5 COMPACT METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Total Applicants - Royal Blue */}
        <div className="bg-white dark:bg-slate-900 border border-blue-500/30 dark:border-blue-500/40 hover:border-blue-500/60 rounded-xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Applicants
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2 font-mono">
            {total.toLocaleString()}
          </p>
          <span className="text-[11px] text-blue-600/70 dark:text-blue-400/70 mt-1 block font-medium">
            Historical loan records
          </span>
        </div>

        {/* Metric 2: Approval Rate - Violet / Purple */}
        <div className="bg-white dark:bg-slate-900 border border-purple-500/30 dark:border-purple-500/40 hover:border-purple-500/60 rounded-xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Approval Rate
            </span>
            <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2 font-mono">
            {approvalRate.toFixed(1)}%
          </p>
          <span className="text-[11px] text-purple-600/70 dark:text-purple-400/70 mt-1 block font-medium">
            Overall acceptance
          </span>
        </div>

        {/* Metric 3: Approved Loans - Emerald Green */}
        <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/40 hover:border-emerald-500/60 rounded-xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Approved Loans
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            {approved.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-1 block font-medium">
            Satisfied guidelines
          </span>
        </div>

        {/* Metric 4: Rejected Loans - Coral Red */}
        <div className="bg-white dark:bg-slate-900 border border-rose-500/30 dark:border-rose-500/40 hover:border-rose-500/60 rounded-xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Rejected Loans
            </span>
            <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2 font-mono">
            {rejected.toLocaleString()}
          </p>
          <span className="text-[11px] text-rose-600/70 dark:text-rose-400/70 mt-1 block font-medium">
            Declined for credit risk
          </span>
        </div>

        {/* Metric 5: Average Loan Amount - Warm Amber / Orange */}
        <div className="bg-white dark:bg-slate-900 border border-amber-500/30 dark:border-amber-500/40 hover:border-amber-500/60 rounded-xl p-4 shadow-2xs col-span-2 sm:col-span-1 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Avg Loan Amount
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2 font-mono">
            ₹{Math.round(avgLoanAmount).toLocaleString()}k
          </p>
          <span className="text-[11px] text-amber-600/70 dark:text-amber-400/70 mt-1 block font-medium">
            ~₹{(Math.round(avgLoanAmount * 1000)).toLocaleString()} average
          </span>
        </div>
      </div>

      {/* 4 USEFUL VISUALIZATIONS IN BALANCED CARD-BASED LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Visualization 1: Loan Approval Distribution (Donut Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Loan Approval Distribution
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Proportion of approved vs. rejected applications
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              Donut Chart
            </span>
          </div>

          <div className="py-4 flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-emerald-500 transition-all duration-700 ease-out"
                  strokeWidth="12"
                  strokeDasharray={`${approvedDash} ${circumference}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-rose-500 transition-all duration-700 ease-out"
                  strokeWidth="12"
                  strokeDasharray={`${rejectedDash} ${circumference}`}
                  strokeDashoffset={`-${approvedDash}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 leading-none">
                  {approvalRate.toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                  Approved
                </span>
              </div>
            </div>

            {/* Legend & Breakdown */}
            <div className="space-y-3 w-full sm:w-56 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-medium text-emerald-900 dark:text-emerald-300">Approved (Y)</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">{approved}</span>
                  <span className="text-[10px] text-emerald-600/80 block">({approvalRate.toFixed(1)}%)</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="font-medium text-rose-900 dark:text-rose-300">Rejected (N)</span>
                </div>
                <div className="text-right font-mono">
                  <span className="font-bold text-rose-800 dark:text-rose-300">{rejected}</span>
                  <span className="text-[10px] text-rose-600/80 block">({(100 - approvalRate).toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
            Approval distribution indicates that approximately 7 out of 10 submitted applications pass underwriting guidelines.
          </div>
        </div>

        {/* Visualization 2: Credit History vs Loan Approval (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Credit History vs Loan Approval
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Approval rate comparison based on credit guidelines
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              Bar Chart
            </span>
          </div>

          <div className="py-4 space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Credit History Meets Guidelines (1.0)
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {chData.meets_guidelines_rate.toFixed(1)}% Approved
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${chData.meets_guidelines_rate}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>475 applicants with clean credit history</span>
                <span>{chData.meets_guidelines_rate}% approval rate</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Credit History Deficit / Default (0.0)
                </span>
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {chData.not_meets_guidelines_rate.toFixed(1)}% Approved
                </span>
              </div>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${chData.not_meets_guidelines_rate}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>89 applicants with defaults or lack of history</span>
                <span>{chData.not_meets_guidelines_rate}% approval rate</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
            Applicants with positive credit history are nearly 10 times more likely to receive loan approval.
          </div>
        </div>

        {/* Visualization 3: Property Area vs Loan Approval (Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Property Area vs Loan Approval
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Approval percentage across geographic collateral zones
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              Bar Chart
            </span>
          </div>

          <div className="py-4 space-y-3.5">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">Semiurban Property</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                  {propData.semiurban_rate.toFixed(1)}% Approved
                </span>
              </div>
              <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${propData.semiurban_rate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">Urban Property</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                  {propData.urban_rate.toFixed(1)}% Approved
                </span>
              </div>
              <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-600 rounded-full transition-all duration-500"
                  style={{ width: `${propData.urban_rate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-medium text-slate-700 dark:text-slate-300">Rural Property</span>
                <span className="font-bold text-slate-600 dark:text-slate-400 font-mono">
                  {propData.rural_rate.toFixed(1)}% Approved
                </span>
              </div>
              <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 dark:bg-slate-600 rounded-full transition-all duration-500"
                  style={{ width: `${propData.rural_rate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
            Semiurban properties achieve the highest approval rate at 76.8%, followed by Urban (65.8%) and Rural (61.5%).
          </div>
        </div>

        {/* Visualization 4: Applicant Income Distribution (Histogram) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Applicant Income Distribution
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Distribution of monthly applicant earnings (₹)
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              Histogram
            </span>
          </div>

          <div className="py-4">
            <div className="flex items-end justify-between gap-2 h-32 pt-4 px-2">
              {incomeBins.map(bin => {
                const heightPct = Math.max((bin.count / maxIncomeCount) * 100, 6);
                return (
                  <div key={bin.label} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {bin.count}
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-md h-24 flex items-end">
                      <div
                        className="w-full bg-indigo-500 hover:bg-indigo-400 rounded-t-md transition-all duration-500 group-hover:brightness-110"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate w-full text-center">
                      {bin.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg">
            Applicant income shows strong right-skewness: 53% of applicants earn between ₹2,500 and ₹5,000 per month.
          </div>
        </div>
      </div>

      {/* QUICK WORKFLOW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => onNavigate('prediction')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-500/50 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-3">
            Loan Prediction Engine
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Input applicant financial variables and run real ML classification.
          </p>
        </div>

        <div
          onClick={() => onNavigate('dataset')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-500/50 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-3">
            Dataset & Data Quality
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Inspect raw rows, missing value audit, and imputation statistics.
          </p>
        </div>

        <div
          onClick={() => onNavigate('models')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-500/50 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Layers className="w-4 h-4" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-3">
            ML Models Benchmark
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Compare Logistic Regression, Decision Tree, and Random Forest.
          </p>
        </div>
      </div>
    </div>
  );
};
