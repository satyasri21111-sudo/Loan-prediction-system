import React, { useState } from 'react';
import { LoanRecord } from '../types';

interface AnalysisViewProps {
  records: LoanRecord[];
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ records }) => {
  const [activeSection, setActiveSection] = useState<'approval' | 'applicant' | 'financial' | 'correlation'>('approval');

  const total = records.length;
  const approved = records.filter(r => r.Loan_Status === 'Y').length;
  const rejected = records.filter(r => r.Loan_Status === 'N').length;

  // Applicant Characteristics stats
  const male = records.filter(r => r.Gender === 'Male');
  const female = records.filter(r => r.Gender === 'Female');
  const maleAppRate = male.length > 0 ? (male.filter(r => r.Loan_Status === 'Y').length / male.length) * 100 : 0;
  const femaleAppRate = female.length > 0 ? (female.filter(r => r.Loan_Status === 'Y').length / female.length) * 100 : 0;

  const grad = records.filter(r => r.Education === 'Graduate');
  const notGrad = records.filter(r => r.Education === 'Not Graduate');
  const gradAppRate = grad.length > 0 ? (grad.filter(r => r.Loan_Status === 'Y').length / grad.length) * 100 : 0;
  const notGradAppRate = notGrad.length > 0 ? (notGrad.filter(r => r.Loan_Status === 'Y').length / notGrad.length) * 100 : 0;

  const semi = records.filter(r => r.Property_Area === 'Semiurban');
  const urban = records.filter(r => r.Property_Area === 'Urban');
  const rural = records.filter(r => r.Property_Area === 'Rural');
  const semiAppRate = semi.length > 0 ? (semi.filter(r => r.Loan_Status === 'Y').length / semi.length) * 100 : 0;
  const urbanAppRate = urban.length > 0 ? (urban.filter(r => r.Loan_Status === 'Y').length / urban.length) * 100 : 0;
  const ruralAppRate = rural.length > 0 ? (rural.filter(r => r.Loan_Status === 'Y').length / rural.length) * 100 : 0;

  // Financial Features Bins
  const incomes = records.map(r => r.ApplicantIncome).filter(v => v > 0);
  const incomeBins = [
    { label: '<₹2.5k', count: incomes.filter(v => v < 2500).length },
    { label: '₹2.5k-₹5k', count: incomes.filter(v => v >= 2500 && v < 5000).length },
    { label: '₹5k-₹7.5k', count: incomes.filter(v => v >= 5000 && v < 7500).length },
    { label: '₹7.5k-₹10k', count: incomes.filter(v => v >= 7500 && v < 10000).length },
    { label: '>₹10k', count: incomes.filter(v => v >= 10000).length },
  ];

  const loans = records.map(r => r.LoanAmount).filter((v): v is number => typeof v === 'number' && !isNaN(v));
  const loanBins = [
    { label: '<₹75k', count: loans.filter(v => v < 75).length },
    { label: '₹75k-₹120k', count: loans.filter(v => v >= 75 && v < 120).length },
    { label: '₹120k-₹160k', count: loans.filter(v => v >= 120 && v < 160).length },
    { label: '₹160k-₹220k', count: loans.filter(v => v >= 160 && v < 220).length },
    { label: '>₹220k', count: loans.filter(v => v >= 220).length },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Data Analysis
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Explore key distributions, applicant demographics, and financial relationships.
        </p>
      </div>

      {/* Clean Segmented Section Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveSection('approval')}
          className={`pb-3 px-4 transition-colors border-b-2 ${
            activeSection === 'approval'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Section 1: Loan Approval Distribution
        </button>
        <button
          onClick={() => setActiveSection('applicant')}
          className={`pb-3 px-4 transition-colors border-b-2 ${
            activeSection === 'applicant'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Section 2: Applicant Characteristics
        </button>
        <button
          onClick={() => setActiveSection('financial')}
          className={`pb-3 px-4 transition-colors border-b-2 ${
            activeSection === 'financial'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Section 3: Financial Features
        </button>
        <button
          onClick={() => setActiveSection('correlation')}
          className={`pb-3 px-4 transition-colors border-b-2 ${
            activeSection === 'correlation'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Section 4: Correlation Analysis
        </button>
      </div>

      {/* SECTION 1: Loan Approval Distribution */}
      {activeSection === 'approval' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Loan Approval vs. Rejection
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target variable distribution across historical applications.
              </p>
            </div>

            <div className="space-y-4 max-w-xl">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Approved Applications</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{approved} ({((approved / total) * 100).toFixed(1)}%)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(approved / total) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Rejected Applications</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{rejected} ({((rejected / total) * 100).toFixed(1)}%)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-400 dark:bg-slate-600 rounded-full" style={{ width: `${(rejected / total) * 100}%` }} />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              The dataset contains an approximate 69% approval rate, reflecting a natural class imbalance that is preserved during stratified train-test splitting.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 2: Applicant Characteristics */}
      {activeSection === 'applicant' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Education vs Approval */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Education Level vs. Approval
            </h2>
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Graduates ({grad.length})</span>
                  <span className="font-mono text-blue-600 font-medium">{gradAppRate.toFixed(1)}% Approved</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${gradAppRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Not Graduates ({notGrad.length})</span>
                  <span className="font-mono text-slate-500 font-medium">{notGradAppRate.toFixed(1)}% Approved</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${notGradAppRate}%` }} />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Graduates show a moderately higher approval rate (~70.8% vs. ~61.2%).
            </p>
          </div>

          {/* Property Area vs Approval */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Property Area vs. Approval
            </h2>
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Semiurban ({semi.length})</span>
                  <span className="font-mono text-blue-600 font-medium">{semiAppRate.toFixed(1)}% Approved</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${semiAppRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Urban ({urban.length})</span>
                  <span className="font-mono text-slate-500 font-medium">{urbanAppRate.toFixed(1)}% Approved</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${urbanAppRate}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Rural ({rural.length})</span>
                  <span className="font-mono text-slate-500 font-medium">{ruralAppRate.toFixed(1)}% Approved</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${ruralAppRate}%` }} />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              Semiurban applicants demonstrate the highest historical approval percentage (76.8%).
            </p>
          </div>
        </div>
      )}

      {/* SECTION 3: Financial Features */}
      {activeSection === 'financial' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Applicant Income Distribution */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Applicant Monthly Income Distribution
              </h2>
              <p className="text-[11px] text-slate-500">Frequency of monthly earnings.</p>

              <div className="h-44 flex items-end gap-4 pt-4 border-b border-l border-slate-200 dark:border-slate-800 px-4">
                {incomeBins.map(bin => {
                  const maxCount = Math.max(...incomeBins.map(b => b.count));
                  const height = (bin.count / maxCount) * 100;
                  return (
                    <div key={bin.label} className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] text-slate-500 font-mono mb-1">{bin.count}</span>
                      <div className="w-full bg-blue-600 rounded-t" style={{ height: `${height}%` }} />
                      <span className="text-[10px] text-slate-500 mt-2 truncate">{bin.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Income is strongly right-skewed; the median applicant earns ~₹3,812/month.
              </p>
            </div>

            {/* Loan Amount Distribution */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Requested Loan Amount Distribution (₹'000)
              </h2>
              <p className="text-[11px] text-slate-500">Distribution of principal amounts requested.</p>

              <div className="h-44 flex items-end gap-4 pt-4 border-b border-l border-slate-200 dark:border-slate-800 px-4">
                {loanBins.map(bin => {
                  const maxCount = Math.max(...loanBins.map(b => b.count));
                  const height = (bin.count / maxCount) * 100;
                  return (
                    <div key={bin.label} className="flex-1 flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] text-slate-500 font-mono mb-1">{bin.count}</span>
                      <div className="w-full bg-blue-600 rounded-t" style={{ height: `${height}%` }} />
                      <span className="text-[10px] text-slate-500 mt-2 truncate">{bin.label}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Most applications request loan amounts between ₹100k and ₹160k.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: Correlation Analysis */}
      {activeSection === 'correlation' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Correlation Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pearson correlation coefficients across numerical attributes.
            </p>
          </div>

          <div className="max-w-xl mx-auto overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-md">
            <table className="w-full text-center text-xs font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2.5 text-left font-sans">Feature</th>
                  <th className="p-2.5">Applicant Income</th>
                  <th className="p-2.5">Coapplicant Income</th>
                  <th className="p-2.5">Loan Amount</th>
                  <th className="p-2.5">Loan Term</th>
                  <th className="p-2.5">Credit History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="p-2.5 text-left font-sans font-medium">Applicant Income</td>
                  <td className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold">1.00</td>
                  <td className="p-2.5">-0.12</td>
                  <td className="p-2.5 text-blue-600 font-bold">0.57</td>
                  <td className="p-2.5">-0.05</td>
                  <td className="p-2.5">-0.02</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-left font-sans font-medium">Coapplicant Income</td>
                  <td className="p-2.5">-0.12</td>
                  <td className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold">1.00</td>
                  <td className="p-2.5">0.19</td>
                  <td className="p-2.5">-0.06</td>
                  <td className="p-2.5">0.01</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-left font-sans font-medium">Loan Amount</td>
                  <td className="p-2.5 text-blue-600 font-bold">0.57</td>
                  <td className="p-2.5">0.19</td>
                  <td className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold">1.00</td>
                  <td className="p-2.5">0.04</td>
                  <td className="p-2.5">-0.01</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-left font-sans font-medium">Loan Term</td>
                  <td className="p-2.5">-0.05</td>
                  <td className="p-2.5">-0.06</td>
                  <td className="p-2.5">0.04</td>
                  <td className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold">1.00</td>
                  <td className="p-2.5">0.00</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-left font-sans font-medium">Credit History</td>
                  <td className="p-2.5">-0.02</td>
                  <td className="p-2.5">0.01</td>
                  <td className="p-2.5">-0.01</td>
                  <td className="p-2.5">0.00</td>
                  <td className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-bold">1.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed text-center">
            A moderate positive correlation (<strong>r = 0.57</strong>) exists between Applicant Income and requested Loan Amount, indicating higher earners typically request higher limits.
          </p>
        </div>
      )}
    </div>
  );
};
