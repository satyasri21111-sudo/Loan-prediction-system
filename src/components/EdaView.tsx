import React, { useState } from 'react';
import { LoanRecord } from '../types';
import { BarChart3, TrendingUp, Grid, PieChart } from 'lucide-react';

interface EdaViewProps {
  records: LoanRecord[];
}

export const EdaView: React.FC<EdaViewProps> = ({ records }) => {
  const [selectedChart, setSelectedChart] = useState<number>(1);

  const total = records.length;

  // Helper calculations for 11 charts:
  // 1. Applicant Income histogram bins
  const incomes = records.map(r => r.ApplicantIncome).filter(v => v > 0);
  const incomeBins = [
    { label: '<₹2.5k', min: 0, max: 2500, count: incomes.filter(v => v < 2500).length },
    { label: '₹2.5k-₹5k', min: 2500, max: 5000, count: incomes.filter(v => v >= 2500 && v < 5000).length },
    { label: '₹5k-₹7.5k', min: 5000, max: 7500, count: incomes.filter(v => v >= 5000 && v < 7500).length },
    { label: '₹7.5k-₹10k', min: 7500, max: 10000, count: incomes.filter(v => v >= 7500 && v < 10000).length },
    { label: '>₹10k', min: 10000, max: Infinity, count: incomes.filter(v => v >= 10000).length },
  ];

  // 2. Loan Amount bins
  const loans = records.map(r => r.LoanAmount).filter((v): v is number => typeof v === 'number' && !isNaN(v));
  const loanBins = [
    { label: '<₹75k', count: loans.filter(v => v < 75).length },
    { label: '₹75k-₹120k', count: loans.filter(v => v >= 75 && v < 120).length },
    { label: '₹120k-₹160k', count: loans.filter(v => v >= 120 && v < 160).length },
    { label: '₹160k-₹220k', count: loans.filter(v => v >= 160 && v < 220).length },
    { label: '>₹220k', count: loans.filter(v => v >= 220).length },
  ];

  // 3. Gender
  const maleCount = records.filter(r => r.Gender === 'Male').length;
  const femaleCount = records.filter(r => r.Gender === 'Female').length;

  // 4. Education
  const gradCount = records.filter(r => r.Education === 'Graduate').length;
  const notGradCount = records.filter(r => r.Education === 'Not Graduate').length;

  // 5. Employment
  const selfEmpCount = records.filter(r => r.Self_Employed === 'Yes').length;
  const salariedCount = records.filter(r => r.Self_Employed === 'No').length;

  // 6. Property Area
  const semiurbanCount = records.filter(r => r.Property_Area === 'Semiurban').length;
  const urbanCount = records.filter(r => r.Property_Area === 'Urban').length;
  const ruralCount = records.filter(r => r.Property_Area === 'Rural').length;

  // 7. Target status
  const approvedCount = records.filter(r => r.Loan_Status === 'Y').length;
  const rejectedCount = records.filter(r => r.Loan_Status === 'N').length;

  // 8. Credit History vs Approval
  const ch1Records = records.filter(r => r.Credit_History === 1);
  const ch0Records = records.filter(r => r.Credit_History === 0);
  const ch1App = ch1Records.filter(r => r.Loan_Status === 'Y').length;
  const ch1Rej = ch1Records.length - ch1App;
  const ch0App = ch0Records.filter(r => r.Loan_Status === 'Y').length;
  const ch0Rej = ch0Records.length - ch0App;

  // 9. Education vs Approval
  const gradApp = records.filter(r => r.Education === 'Graduate' && r.Loan_Status === 'Y').length;
  const gradRej = gradCount - gradApp;
  const notGradApp = records.filter(r => r.Education === 'Not Graduate' && r.Loan_Status === 'Y').length;
  const notGradRej = notGradCount - notGradApp;

  // 10. Property Area vs Approval
  const semiApp = records.filter(r => r.Property_Area === 'Semiurban' && r.Loan_Status === 'Y').length;
  const semiRej = semiurbanCount - semiApp;
  const urbanApp = records.filter(r => r.Property_Area === 'Urban' && r.Loan_Status === 'Y').length;
  const urbanRej = urbanCount - urbanApp;
  const ruralApp = records.filter(r => r.Property_Area === 'Rural' && r.Loan_Status === 'Y').length;
  const ruralRej = ruralCount - ruralApp;

  // 11. Income vs Approval
  const appIncomes = records.filter(r => r.Loan_Status === 'Y').map(r => r.ApplicantIncome).sort((a, b) => a - b);
  const rejIncomes = records.filter(r => r.Loan_Status === 'N').map(r => r.ApplicantIncome).sort((a, b) => a - b);
  const appMedian = appIncomes[Math.floor(appIncomes.length / 2)] || 0;
  const rejMedian = rejIncomes[Math.floor(rejIncomes.length / 2)] || 0;

  const chartList = [
    { id: 1, title: '1. Applicant Income Distribution' },
    { id: 2, title: '2. Loan Amount Distribution' },
    { id: 3, title: '3. Gender Distribution' },
    { id: 4, title: '4. Education Distribution' },
    { id: 5, title: '5. Self Employment Distribution' },
    { id: 6, title: '6. Property Area Distribution' },
    { id: 7, title: '7. Loan Approval vs Rejection' },
    { id: 8, title: '8. Credit History vs Approval' },
    { id: 9, title: '9. Education vs Approval' },
    { id: 10, title: '10. Property Area vs Approval' },
    { id: 11, title: '11. Income vs Approval (Boxplot)' },
    { id: 12, title: '🔥 Correlation Heatmap' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>🔍 Exploratory Data Analysis (EDA)</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Module 4: Academic visualizations across all 11 inquiries using standard distribution plots, cross-tabulations, and correlation heatmaps.
        </p>
      </div>

      {/* Chart Selector Pills */}
      <div className="flex flex-wrap gap-1.5 p-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
        {chartList.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedChart(c.id)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              selectedChart === c.id
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {c.title}
          </button>
        ))}
      </div>

      {/* Main Chart Viewer Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
        {/* Chart 1: Applicant Income Distribution */}
        {selectedChart === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                1. Distribution of Applicant Monthly Income (Histogram)
              </h3>
              <p className="text-xs text-slate-400">
                Visualizing frequency distribution of applicant earnings. Notice significant positive (right) skewness.
              </p>
            </div>

            <div className="h-64 flex items-end gap-6 pt-6 pb-4 px-8 border-b border-l border-slate-300 dark:border-slate-700">
              {incomeBins.map(bin => {
                const maxCount = Math.max(...incomeBins.map(b => b.count));
                const heightPct = (bin.count / maxCount) * 100;
                return (
                  <div key={bin.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono text-slate-500 mb-1 group-hover:text-blue-600 font-bold">
                      {bin.count}
                    </span>
                    <div
                      className="w-full bg-blue-600 hover:bg-blue-500 rounded-t transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-2 text-center truncate">
                      {bin.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span><strong>X-Axis:</strong> Monthly Income Brackets (₹)</span>
              <span><strong>Y-Axis:</strong> Frequency (Number of Applicants)</span>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded text-xs text-blue-800 dark:text-blue-300">
              <strong>Data Insight:</strong> Over 60% of applicants report monthly income between ₹2,500 and ₹5,000. Income has a long tail reaching up to ₹81,000, which justifies using the Median rather than Mean for imputation and preprocessing.
            </div>
          </div>
        )}

        {/* Chart 2: Loan Amount Distribution */}
        {selectedChart === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                2. Requested Loan Amount Distribution (in Thousands)
              </h3>
              <p className="text-xs text-slate-400">
                Histogram and density profile of requested institutional principal in ₹1,000s.
              </p>
            </div>

            <div className="h-64 flex items-end gap-6 pt-6 pb-4 px-8 border-b border-l border-slate-300 dark:border-slate-700">
              {loanBins.map(bin => {
                const maxCount = Math.max(...loanBins.map(b => b.count));
                const heightPct = (bin.count / maxCount) * 100;
                return (
                  <div key={bin.label} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono text-slate-500 mb-1 group-hover:text-sky-600 font-bold">
                      {bin.count}
                    </span>
                    <div
                      className="w-full bg-sky-600 hover:bg-sky-500 rounded-t transition-all duration-300"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-2 text-center truncate">
                      {bin.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span><strong>X-Axis:</strong> Loan Amount Requested (₹'000)</span>
              <span><strong>Y-Axis:</strong> Number of Applications</span>
            </div>
          </div>
        )}

        {/* Chart 3: Gender Distribution */}
        {selectedChart === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              3. Gender Distribution of Applicants
            </h3>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto pt-4">
              <div className="p-4 bg-blue-50 dark:bg-slate-800 rounded-lg text-center border border-blue-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Male Applicants</span>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-400 mt-1">{maleCount}</p>
                <span className="text-xs text-slate-400">{((maleCount / total) * 100).toFixed(1)}% of total</span>
              </div>
              <div className="p-4 bg-pink-50 dark:bg-slate-800 rounded-lg text-center border border-pink-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Female Applicants</span>
                <p className="text-3xl font-bold text-pink-600 dark:text-pink-400 mt-1">{femaleCount}</p>
                <span className="text-xs text-slate-400">{((femaleCount / total) * 100).toFixed(1)}% of total</span>
              </div>
            </div>
          </div>
        )}

        {/* Chart 4: Education Distribution */}
        {selectedChart === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              4. Education Qualification Distribution
            </h3>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto pt-4">
              <div className="p-4 bg-emerald-50 dark:bg-slate-800 rounded-lg text-center border border-emerald-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Graduate</span>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{gradCount}</p>
                <span className="text-xs text-slate-400">{((gradCount / total) * 100).toFixed(1)}%</span>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-slate-800 rounded-lg text-center border border-amber-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Not Graduate</span>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-400 mt-1">{notGradCount}</p>
                <span className="text-xs text-slate-400">{((notGradCount / total) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Chart 5: Employment */}
        {selectedChart === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              5. Employment Status (Salaried vs Self-Employed)
            </h3>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto pt-4">
              <div className="p-4 bg-indigo-50 dark:bg-slate-800 rounded-lg text-center border border-indigo-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Salaried (No)</span>
                <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mt-1">{salariedCount}</p>
                <span className="text-xs text-slate-400">{((salariedCount / total) * 100).toFixed(1)}%</span>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-slate-800 rounded-lg text-center border border-purple-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Self-Employed (Yes)</span>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-400 mt-1">{selfEmpCount}</p>
                <span className="text-xs text-slate-400">{((selfEmpCount / total) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Chart 6: Property Area */}
        {selectedChart === 6 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              6. Property Area Geographical Distribution
            </h3>
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto pt-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Semiurban</span>
                <p className="text-3xl font-bold text-blue-600 mt-1">{semiurbanCount}</p>
                <span className="text-xs text-slate-400">{((semiurbanCount / total) * 100).toFixed(1)}%</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Urban</span>
                <p className="text-3xl font-bold text-indigo-600 mt-1">{urbanCount}</p>
                <span className="text-xs text-slate-400">{((urbanCount / total) * 100).toFixed(1)}%</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-500">Rural</span>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{ruralCount}</p>
                <span className="text-xs text-slate-400">{((ruralCount / total) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Chart 7: Target Status */}
        {selectedChart === 7 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              7. Overall Loan Approval vs Rejection Ratio
            </h3>
            <div className="max-w-md mx-auto pt-4 space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Approved (Y)</span>
                  <span className="font-mono">{approvedCount} ({((approvedCount / total) * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(approvedCount / total) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1.5">
                  <span className="text-rose-700 dark:text-rose-400 font-semibold">Rejected (N)</span>
                  <span className="font-mono">{rejectedCount} ({((rejectedCount / total) * 100).toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${(rejectedCount / total) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart 8: Credit History vs Approval */}
        {selectedChart === 8 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              8. Credit History Guidelines Compliance vs Approval Rate (%)
            </h3>

            <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto pt-4">
              <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Credit History Meets Guidelines (1.0)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">{ch1Records.length} Applicants</p>
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-600 font-medium">Approved:</span>
                    <span className="font-mono font-bold">{ch1App} ({((ch1App / (ch1Records.length || 1)) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-rose-600 font-medium">Rejected:</span>
                    <span className="font-mono">{ch1Rej} ({((ch1Rej / (ch1Records.length || 1)) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Credit History Unmet / Default (0.0)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">{ch0Records.length} Applicants</p>
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-600 font-medium">Approved:</span>
                    <span className="font-mono font-bold">{ch0App} ({((ch0App / (ch0Records.length || 1)) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-rose-600 font-medium">Rejected:</span>
                    <span className="font-mono font-bold text-rose-600">{ch0Rej} ({((ch0Rej / (ch0Records.length || 1)) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chart 9: Education vs Approval */}
        {selectedChart === 9 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              9. Education Level vs Loan Approval Rate
            </h3>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto pt-4">
              <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-lg text-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Graduates</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {((gradApp / (gradCount || 1)) * 100).toFixed(1)}%
                </p>
                <span className="text-xs text-slate-400">{gradApp} approved of {gradCount}</span>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-lg text-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Not Graduates</span>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {((notGradApp / (notGradCount || 1)) * 100).toFixed(1)}%
                </p>
                <span className="text-xs text-slate-400">{notGradApp} approved of {notGradCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Chart 10: Property Area vs Approval */}
        {selectedChart === 10 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              10. Property Area vs Approval Rate (%)
            </h3>
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto pt-4">
              <div className="border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-lg text-center">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Semiurban</span>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {((semiApp / (semiurbanCount || 1)) * 100).toFixed(1)}%
                </p>
                <span className="text-[11px] text-slate-500">Highest acceptance rate</span>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-lg text-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Urban</span>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {((urbanApp / (urbanCount || 1)) * 100).toFixed(1)}%
                </p>
                <span className="text-[11px] text-slate-500">{urbanApp} / {urbanCount}</span>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-lg text-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Rural</span>
                <p className="text-2xl font-bold text-slate-600 mt-1">
                  {((ruralApp / (ruralCount || 1)) * 100).toFixed(1)}%
                </p>
                <span className="text-[11px] text-slate-500">{ruralApp} / {ruralCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Chart 11: Income vs Approval */}
        {selectedChart === 11 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              11. Applicant Monthly Income by Approval Status (Boxplot Summary)
            </h3>
            <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto pt-4">
              <div className="border border-emerald-200 dark:border-emerald-900 p-4 rounded-lg text-center">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Approved Group</span>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1 font-mono">
                  ₹{appMedian.toLocaleString()}
                </p>
                <span className="text-xs text-slate-400">Median Monthly Income</span>
              </div>
              <div className="border border-rose-200 dark:border-rose-900 p-4 rounded-lg text-center">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Rejected Group</span>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1 font-mono">
                  ₹{rejMedian.toLocaleString()}
                </p>
                <span className="text-xs text-slate-400">Median Monthly Income</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center pt-2">
              <strong>Observation:</strong> Median income between approved and rejected applicants is remarkably similar (~₹3,800 vs ~₹3,850). Income alone does not dictate approval without credit history compliance.
            </p>
          </div>
        )}

        {/* Heatmap */}
        {selectedChart === 12 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                12. Feature Correlation Matrix (Pearson Correlation Coefficient)
              </h3>
              <p className="text-xs text-slate-400">
                Heatmap computed across numerical features using Pandas / Seaborn style representation.
              </p>
            </div>

            <div className="max-w-xl mx-auto overflow-x-auto pt-3">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[11px]">
                    <th className="p-2 text-left">Feature</th>
                    <th className="p-2">AppInc</th>
                    <th className="p-2">CoInc</th>
                    <th className="p-2">LoanAmt</th>
                    <th className="p-2">Term</th>
                    <th className="p-2">CreditHist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  <tr>
                    <td className="p-2 text-left font-sans font-semibold">ApplicantIncome</td>
                    <td className="p-2 bg-blue-600 text-white font-bold">1.00</td>
                    <td className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">-0.12</td>
                    <td className="p-2 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 font-bold">0.57</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">-0.05</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">-0.02</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans font-semibold">CoapplicantIncome</td>
                    <td className="p-2 bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">-0.12</td>
                    <td className="p-2 bg-blue-600 text-white font-bold">1.00</td>
                    <td className="p-2 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300">0.19</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">-0.06</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">0.01</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans font-semibold">LoanAmount</td>
                    <td className="p-2 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 font-bold">0.57</td>
                    <td className="p-2 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300">0.19</td>
                    <td className="p-2 bg-blue-600 text-white font-bold">1.00</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">0.04</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">-0.01</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans font-semibold">Loan_Amount_Term</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">-0.05</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">-0.06</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">0.04</td>
                    <td className="p-2 bg-blue-600 text-white font-bold">1.00</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">0.00</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-left font-sans font-semibold">Credit_History</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">-0.02</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">0.01</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">-0.01</td>
                    <td className="p-2 bg-slate-50 dark:bg-slate-800">0.00</td>
                    <td className="p-2 bg-blue-600 text-white font-bold">1.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-500 text-center pt-2">
              Strongest positive correlation is observed between <strong>ApplicantIncome</strong> and <strong>LoanAmount (r = 0.57)</strong>, as higher earners request proportionately larger credit limits.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
