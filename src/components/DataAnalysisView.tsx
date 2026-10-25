import React from 'react';
import { AnalysisApiResponse } from '../api/client';
import { RAW_CSV_DATA, parseCSV } from '../data/defaultDataset';
import { Lightbulb, CheckCircle2, XCircle } from 'lucide-react';

interface DataAnalysisViewProps {
  data: AnalysisApiResponse | null;
}

export const DataAnalysisView: React.FC<DataAnalysisViewProps> = ({ data }) => {
  // Use parsed CSV or fallback data
  const records = React.useMemo(() => parseCSV(RAW_CSV_DATA), []);

  const total = data?.approval_distribution?.total || records.length || 614;
  const approved = data?.approval_distribution?.approved || records.filter(r => r.Loan_Status === 'Y').length || 422;
  const rejected = data?.approval_distribution?.rejected || records.filter(r => r.Loan_Status === 'N').length || 192;
  const approvalRate = data?.approval_distribution?.approval_rate || (approved / total) * 100;

  // Credit History rates
  const chMeetsRate = data?.credit_history?.meets_guidelines_rate ?? 79.6;
  const chDeficitRate = data?.credit_history?.not_meets_guidelines_rate ?? 8.0;

  // Education rates
  const eduGradRate = data?.education?.graduate_rate ?? 70.8;
  const eduNotGradRate = data?.education?.not_graduate_rate ?? 61.2;

  // Property Area rates
  const semiurbanRate = data?.property_area?.semiurban_rate ?? 76.8;
  const urbanRate = data?.property_area?.urban_rate ?? 65.8;
  const ruralRate = data?.property_area?.rural_rate ?? 61.5;

  // Gender rates
  const maleRecords = records.filter(r => r.Gender === 'Male');
  const femaleRecords = records.filter(r => r.Gender === 'Female');
  const maleRate = maleRecords.length > 0 ? (maleRecords.filter(r => r.Loan_Status === 'Y').length / maleRecords.length) * 100 : 69.3;
  const femaleRate = femaleRecords.length > 0 ? (femaleRecords.filter(r => r.Loan_Status === 'Y').length / femaleRecords.length) * 100 : 67.0;

  // Self Employed rates
  const seYes = records.filter(r => r.Self_Employed === 'Yes');
  const seNo = records.filter(r => r.Self_Employed === 'No');
  const seYesRate = seYes.length > 0 ? (seYes.filter(r => r.Loan_Status === 'Y').length / seYes.length) * 100 : 68.4;
  const seNoRate = seNo.length > 0 ? (seNo.filter(r => r.Loan_Status === 'Y').length / seNo.length) * 100 : 68.6;

  // Financial Bins
  const incomeBins = data?.income_bins || [
    { label: '<₹2.5k', count: 108 },
    { label: '₹2.5k-₹5k', count: 326 },
    { label: '₹5k-₹7.5k', count: 111 },
    { label: '₹7.5k-₹10k', count: 35 },
    { label: '>₹10k', count: 34 },
  ];
  const maxIncome = Math.max(...incomeBins.map(b => b.count), 1);

  const loanBins = data?.loan_bins || [
    { label: '<₹75k', count: 48 },
    { label: '₹75k-₹120k', count: 196 },
    { label: '₹120k-₹160k', count: 184 },
    { label: '₹160k-₹220k', count: 112 },
    { label: '>₹220k', count: 52 },
  ];
  const maxLoan = Math.max(...loanBins.map(b => b.count), 1);

  // SVG Donut calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const approvedDash = (approvalRate / 100) * circumference;
  const rejectedDash = circumference - approvedDash;

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="pb-1 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Data Analysis & Visualizations
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Comprehensive exploratory visual breakdown of historical loan approval factors.
        </p>
      </div>

      {/* Backend Status Notice */}
      {!data && (
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 text-xs">
          Showing cached exploratory analytics. Connect Python Flask server (<code className="font-mono text-[11px] text-blue-600 dark:text-blue-400">http://localhost:5000/api/analysis</code>) for live backend synchronization.
        </div>
      )}

      {/* 8 CLEAN, PROFESSIONAL CHARTS IN A 2-COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* CHART 1: Loan Approval Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                1. Loan Approval Distribution
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Donut Chart
              </span>
            </div>

            <div className="py-3 flex items-center justify-center gap-6">
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={radius} className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="14" fill="transparent" />
                  <circle cx="50" cy="50" r={radius} className="stroke-emerald-500" strokeWidth="14" strokeDasharray={`${approvedDash} ${circumference}`} strokeDashoffset="0" fill="transparent" />
                  <circle cx="50" cy="50" r={radius} className="stroke-rose-500" strokeWidth="14" strokeDasharray={`${rejectedDash} ${circumference}`} strokeDashoffset={`-${approvedDash}`} fill="transparent" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 leading-tight">
                    {approvalRate.toFixed(1)}%
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase">Approved</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-300">Approved: <strong>{approved}</strong> ({approvalRate.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-700 dark:text-slate-300">Rejected: <strong>{rejected}</strong> ({(100 - approvalRate).toFixed(1)}%)</span>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 font-mono">
                  Sample: {total} total applications
                </div>
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-300">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p>
              <strong>Key Insight:</strong> Overall loan approval rate stands at 68.7%, indicating that more than two-thirds of submitted applications meet lending criteria.
            </p>
          </div>
        </div>

        {/* CHART 2: Credit History vs Approval */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                2. Credit History vs Approval
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Bar Chart
              </span>
            </div>

            <div className="py-2 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Credit Meets Guidelines (1.0)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{chMeetsRate.toFixed(1)}%</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${chMeetsRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Credit Default / Missing (0.0)</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">{chDeficitRate.toFixed(1)}%</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${chDeficitRate}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-300">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p>
              <strong>Key Insight:</strong> Applicants with positive credit history have a substantially higher approval rate (79.6% vs 8.0%), making it the dominant predictor.
            </p>
          </div>
        </div>

        {/* CHART 3: Education vs Approval */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                3. Education vs Approval
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Bar Chart
              </span>
            </div>

            <div className="py-2 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Graduate</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">{eduGradRate.toFixed(1)}% Approved</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${eduGradRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Not Graduate</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400 font-mono">{eduNotGradRate.toFixed(1)}% Approved</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500 rounded-full" style={{ width: `${eduNotGradRate}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-300">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p>
              <strong>Key Insight:</strong> Graduates achieve a 70.8% approval rate compared to 61.2% for non-graduates due to higher average income profiles.
            </p>
          </div>
        </div>

        {/* CHART 4: Property Area vs Approval */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                4. Property Area vs Approval
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Bar Chart
              </span>
            </div>

            <div className="py-2 space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Semiurban</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400 font-mono">{semiurbanRate.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${semiurbanRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Urban</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{urbanRate.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: `${urbanRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Rural</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400 font-mono">{ruralRate.toFixed(1)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${ruralRate}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-300">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p>
              <strong>Key Insight:</strong> Semiurban collateral demonstrates the strongest approval rate (76.8%), outperforming Urban (65.8%) and Rural (61.5%) zones.
            </p>
          </div>
        </div>

        {/* CHART 5: Applicant Income Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                5. Applicant Income Distribution
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Histogram
              </span>
            </div>

            <div className="pt-3 pb-1">
              <div className="flex items-end justify-between gap-1.5 h-28 px-1">
                {incomeBins.map(bin => {
                  const pct = Math.max((bin.count / maxIncome) * 100, 6);
                  return (
                    <div key={bin.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-slate-400">{bin.count}</span>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t h-20 flex items-end">
                        <div className="w-full bg-blue-500 rounded-t" style={{ height: `${pct}%` }} />
                      </div>
                      <span className="text-[9px] text-slate-500 font-medium truncate w-full text-center">
                        {bin.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-300">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p>
              <strong>Key Insight:</strong> Applicant monthly income is heavily right-skewed with median ₹3,812; over half of all applicants earn between ₹2,500 and ₹5,000.
            </p>
          </div>
        </div>

        {/* CHART 6: Loan Amount Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                6. Loan Amount Distribution
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Histogram
              </span>
            </div>

            <div className="pt-3 pb-1">
              <div className="flex items-end justify-between gap-1.5 h-28 px-1">
                {loanBins.map(bin => {
                  const pct = Math.max((bin.count / maxLoan) * 100, 6);
                  return (
                    <div key={bin.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-mono text-slate-400">{bin.count}</span>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t h-20 flex items-end">
                        <div className="w-full bg-cyan-600 rounded-t" style={{ height: `${pct}%` }} />
                      </div>
                      <span className="text-[9px] text-slate-500 font-medium truncate w-full text-center">
                        {bin.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-300">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p>
              <strong>Key Insight:</strong> Requested loan amounts concentrate between ₹100,000 and ₹160,000 with a median of ₹128,000, aligning with retail borrowing norms.
            </p>
          </div>
        </div>

        {/* CHART 7: Gender vs Approval */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                7. Gender vs Approval
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Bar Chart
              </span>
            </div>

            <div className="py-2 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Male Applicants (489)</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400 font-mono">{maleRate.toFixed(1)}% Approved</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${maleRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Female Applicants (112)</span>
                  <span className="font-bold text-violet-600 dark:text-violet-400 font-mono">{femaleRate.toFixed(1)}% Approved</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${femaleRate}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-300">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p>
              <strong>Key Insight:</strong> Approval rates between male (69.3%) and female (67.0%) applicants are comparable, indicating credit evaluation is largely gender-neutral.
            </p>
          </div>
        </div>

        {/* CHART 8: Self Employed vs Approval */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                8. Self Employed vs Approval
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                Bar Chart
              </span>
            </div>

            <div className="py-2 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Salaried / Standard Employment</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">{seNoRate.toFixed(1)}% Approved</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: `${seNoRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Self-Employed Applicants</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">{seYesRate.toFixed(1)}% Approved</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${seYesRate}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2 text-xs text-blue-900 dark:text-blue-300">
            <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <p>
              <strong>Key Insight:</strong> Self-employed applicants obtain similar approval rates (~68.5%) as salaried applicants, provided verifiable cash flow meets guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
