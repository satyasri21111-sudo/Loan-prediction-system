import React, { useState } from 'react';
import { LoanRecord } from '../types';
import { detectMissing, cleanDataset, CleaningAudit } from '../utils/mlEngine';
import { Sparkles, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

interface DataCleaningViewProps {
  records: LoanRecord[];
  isCleaned: boolean;
  auditLog: CleaningAudit | null;
  onApplyCleaning: (strategy: 'standard' | 'drop') => void;
}

export const DataCleaningView: React.FC<DataCleaningViewProps> = ({
  records,
  isCleaned,
  auditLog,
  onApplyCleaning,
}) => {
  const [strategy, setStrategy] = useState<'standard' | 'drop'>('standard');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const missingReport = detectMissing(records);
  const totalMissingCells = missingReport.reduce((acc, col) => acc + col.missingCount, 0);

  const handleClean = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onApplyCleaning(strategy);
      setIsProcessing(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>🧹 Data Cleaning & Imputation Pipeline</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Module 2: Missing value detection, duplicate removal, and statistical imputation (Mode for categorical, Median for numerical).
        </p>
      </div>

      {/* Cleaning Strategy Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-4">
        <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Configure Data Cleaning Strategy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label
            className={`border rounded-lg p-3 cursor-pointer transition-all flex items-start gap-3 ${
              strategy === 'standard'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <input
              type="radio"
              name="strategy"
              value="standard"
              checked={strategy === 'standard'}
              onChange={() => setStrategy('standard')}
              className="mt-0.5"
            />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Standard Academic Imputation (Recommended)
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                • Categorical features (<code className="text-blue-600">Gender, Married, Dependents, Self_Employed</code>) imputed with <strong>Mode</strong>.<br />
                • Numerical features (<code className="text-blue-600">LoanAmount, Term</code>) imputed with <strong>Median</strong> (robust against extreme salary outliers).
              </p>
            </div>
          </label>

          <label
            className={`border rounded-lg p-3 cursor-pointer transition-all flex items-start gap-3 ${
              strategy === 'drop'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <input
              type="radio"
              name="strategy"
              value="drop"
              checked={strategy === 'drop'}
              onChange={() => setStrategy('drop')}
              className="mt-0.5"
            />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Drop Missing Values (Listwise Deletion)
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Removes all rows containing any null values. Note: Drops ~22% of rows, reducing sample size from 614 to ~480.
              </p>
            </div>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleClean}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Executing Cleaning...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Execute Cleaning Pipeline</span>
              </>
            )}
          </button>

          {isCleaned && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Dataset is currently clean and ready for ML!</span>
            </span>
          )}
        </div>
      </div>

      {/* Before / After Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Missing Values Report */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Missing Values Detection Report
            </h4>
            <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
              Total Nulls: {totalMissingCells}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2">Feature</th>
                  <th className="p-2 text-right">Missing Count</th>
                  <th className="p-2 text-right">Missing %</th>
                  <th className="p-2">Imputation Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                {missingReport.map(col => (
                  <tr key={col.column} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-2 font-mono font-medium text-slate-800 dark:text-slate-200">{col.column}</td>
                    <td className="p-2 text-right font-mono">
                      <span className={col.missingCount > 0 ? 'text-amber-600 font-bold' : 'text-slate-400'}>
                        {col.missingCount}
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono text-[11px] text-slate-500">
                      {col.missingPct}%
                    </td>
                    <td className="p-2 text-[11px] text-slate-600 dark:text-slate-400">
                      {['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term'].includes(col.column)
                        ? 'Median (Outlier-safe)'
                        : 'Mode (Frequent)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cleaning Audit Log */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Academic Cleaning Audit Log</span>
          </h4>

          {auditLog ? (
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded flex items-center justify-between font-mono text-[11px]">
                <span>Dimensions Before:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {auditLog.initialShape[0]} rows × {auditLog.initialShape[1]} cols
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded flex items-center justify-between font-mono text-[11px]">
                <span>Dimensions After:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {auditLog.finalShape[0]} rows × {auditLog.finalShape[1]} cols
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded flex items-center justify-between font-mono text-[11px]">
                <span>Duplicate Rows Removed:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{auditLog.duplicatesRemoved}</span>
              </div>

              <div className="pt-2">
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] mb-1.5">
                  Applied Imputations:
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto text-[11px] font-mono">
                  {auditLog.imputations.map((imp, idx) => (
                    <div key={idx} className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-700 dark:text-slate-300">{imp.column}:</span>
                      <span className="text-blue-600 dark:text-blue-400">{imp.strategy} ➔ {imp.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400 text-xs">
              <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-slate-300 dark:text-slate-600" />
              <span>Click "Execute Cleaning Pipeline" above to perform and record audit tracking.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
