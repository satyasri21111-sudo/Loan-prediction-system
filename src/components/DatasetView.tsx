import React, { useState, useMemo } from 'react';
import { DatasetApiResponse } from '../api/client';
import { Search, Download, ChevronLeft, ChevronRight, ShieldCheck, BarChart3, Database } from 'lucide-react';
import { RAW_CSV_DATA, parseCSV } from '../data/defaultDataset';

interface DatasetViewProps {
  data: DatasetApiResponse | null;
  onDownloadCsv: () => void;
}

export const DatasetView: React.FC<DatasetViewProps> = ({ data, onDownloadCsv }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'quality' | 'statistics'>('preview');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Full records parsed from dataset
  const fullRecords = useMemo(() => {
    return parseCSV(RAW_CSV_DATA);
  }, []);

  const totalRecords = data?.total_records || fullRecords.length || 614;
  const totalFeatures = data?.total_features || 13;
  const totalMissing = data?.total_missing_cells || 149;
  const duplicateRecords = data?.duplicate_records ?? 0;

  // Filtered rows for Preview Tab
  const filteredRows = useMemo(() => {
    const list = fullRecords.length > 0 ? fullRecords : (data?.preview_rows || []);
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(r => {
      return (
        (r.Loan_ID && String(r.Loan_ID).toLowerCase().includes(term)) ||
        (r.Education && String(r.Education).toLowerCase().includes(term)) ||
        (r.Property_Area && String(r.Property_Area).toLowerCase().includes(term)) ||
        (r.Gender && String(r.Gender).toLowerCase().includes(term)) ||
        (r.Married && String(r.Married).toLowerCase().includes(term)) ||
        (r.Loan_Status && String(r.Loan_Status).toLowerCase().includes(term))
      );
    });
  }, [fullRecords, data, searchTerm]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (validPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, validPage, pageSize]);

  // Missing values audit table
  const missingReport = data?.missing_report || [
    { Column: 'Credit_History', Missing_Count: 50, Missing_Percentage: 8.14, Strategy: 'Mode (1.0)' },
    { Column: 'Self_Employed', Missing_Count: 32, Missing_Percentage: 5.21, Strategy: 'Mode (No)' },
    { Column: 'LoanAmount', Missing_Count: 22, Missing_Percentage: 3.58, Strategy: 'Median (₹128k)' },
    { Column: 'Dependents', Missing_Count: 15, Missing_Percentage: 2.44, Strategy: 'Mode (0)' },
    { Column: 'Loan_Amount_Term', Missing_Count: 14, Missing_Percentage: 2.28, Strategy: 'Median (360)' },
    { Column: 'Gender', Missing_Count: 13, Missing_Percentage: 2.12, Strategy: 'Mode (Male)' },
    { Column: 'Married', Missing_Count: 3, Missing_Percentage: 0.49, Strategy: 'Mode (Yes)' },
  ];

  // Statistics calculation for numeric columns
  const numericStats = useMemo(() => {
    const calcStats = (arr: number[]) => {
      if (arr.length === 0) return { count: 0, mean: 0, median: 0, min: 0, max: 0, std: 0 };
      const sorted = [...arr].sort((a, b) => a - b);
      const count = sorted.length;
      const sum = sorted.reduce((a, b) => a + b, 0);
      const mean = sum / count;
      const median = count % 2 === 0 ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2 : sorted[Math.floor(count / 2)];
      const min = sorted[0];
      const max = sorted[count - 1];
      const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
      const std = Math.sqrt(variance);
      return { count, mean, median, min, max, std };
    };

    const incomes = fullRecords.map(r => r.ApplicantIncome).filter(v => typeof v === 'number' && !isNaN(v));
    const coIncomes = fullRecords.map(r => r.CoapplicantIncome).filter(v => typeof v === 'number' && !isNaN(v));
    const loans = fullRecords.map(r => r.LoanAmount).filter((v): v is number => typeof v === 'number' && !isNaN(v));
    const terms = fullRecords.map(r => r.Loan_Amount_Term).filter((v): v is number => typeof v === 'number' && !isNaN(v));

    return [
      { feature: 'ApplicantIncome (₹)', ...calcStats(incomes), format: (v: number) => `₹${Math.round(v).toLocaleString()}` },
      { feature: 'CoapplicantIncome (₹)', ...calcStats(coIncomes), format: (v: number) => `₹${Math.round(v).toLocaleString()}` },
      { feature: 'LoanAmount (₹ Thousands)', ...calcStats(loans), format: (v: number) => `₹${Math.round(v).toLocaleString()}k` },
      { feature: 'Loan_Amount_Term (Months)', ...calcStats(terms), format: (v: number) => `${Math.round(v)} mos` },
    ];
  }, [fullRecords]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Dataset Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Historical loan application dataset, data quality assessment, and statistical profile.
          </p>
        </div>

        <button
          onClick={onDownloadCsv}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Download Raw CSV</span>
        </button>
      </div>

      {/* Backend Status Notice */}
      {!data && (
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 text-xs">
          Showing cached dataset records. Connect Python Flask server (<code className="font-mono text-[11px] text-blue-600 dark:text-blue-400">http://localhost:5000/api/dataset</code>) for live backend synchronization.
        </div>
      )}

      {/* TOP 4 DATASET METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
            Total Records
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 block font-mono">
            {totalRecords.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Historical loan applications</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
            Number of Features
          </span>
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 block font-mono">
            {totalFeatures}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">12 inputs + 1 target status</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
            Missing Values
          </span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block font-mono">
            {totalMissing}
          </span>
          <span className="text-[11px] text-amber-600/70 mt-0.5 block">Across 7 raw columns</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
            Duplicate Records
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
            {duplicateRecords}
          </span>
          <span className="text-[11px] text-emerald-600/70 mt-0.5 block">Zero duplicate rows</span>
        </div>
      </div>

      {/* SECTIONS / TABS: Dataset Preview | Data Quality | Statistics */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-3 px-4 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'preview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Dataset Preview</span>
        </button>

        <button
          onClick={() => setActiveTab('quality')}
          className={`pb-3 px-4 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'quality'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Data Quality</span>
        </button>

        <button
          onClick={() => setActiveTab('statistics')}
          className={`pb-3 px-4 transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'statistics'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Statistics</span>
        </button>
      </div>

      {/* TAB 1: DATASET PREVIEW */}
      {activeTab === 'preview' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs space-y-0">
          {/* Controls bar: Search + Rows Per Page */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, Area, Education..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span>Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <span className="text-[11px] text-slate-400">
                {filteredRows.length} {filteredRows.length === 1 ? 'record' : 'records'}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-medium">
                <tr>
                  <th className="p-3 whitespace-nowrap">Loan ID</th>
                  <th className="p-3 whitespace-nowrap">Gender</th>
                  <th className="p-3 whitespace-nowrap">Married</th>
                  <th className="p-3 whitespace-nowrap">Dependents</th>
                  <th className="p-3 whitespace-nowrap">Education</th>
                  <th className="p-3 whitespace-nowrap">Self Employed</th>
                  <th className="p-3 text-right whitespace-nowrap">Applicant Income</th>
                  <th className="p-3 text-right whitespace-nowrap">Co-applicant Income</th>
                  <th className="p-3 text-right whitespace-nowrap">Loan Amount</th>
                  <th className="p-3 text-right whitespace-nowrap">Term</th>
                  <th className="p-3 text-center whitespace-nowrap">Credit History</th>
                  <th className="p-3 whitespace-nowrap">Property Area</th>
                  <th className="p-3 text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-8 text-center text-slate-400">
                      No records found matching "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map(r => (
                    <tr
                      key={r.Loan_ID}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3 font-mono font-medium text-slate-900 dark:text-slate-100">
                        {r.Loan_ID}
                      </td>
                      <td className="p-3">{r.Gender || <span className="text-amber-500 font-mono">NaN</span>}</td>
                      <td className="p-3">{r.Married || <span className="text-amber-500 font-mono">NaN</span>}</td>
                      <td className="p-3">{r.Dependents ?? <span className="text-amber-500 font-mono">NaN</span>}</td>
                      <td className="p-3">{r.Education}</td>
                      <td className="p-3">{r.Self_Employed || <span className="text-amber-500 font-mono">NaN</span>}</td>
                      <td className="p-3 text-right font-mono">₹{r.ApplicantIncome.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono">₹{r.CoapplicantIncome.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono">
                        {r.LoanAmount !== null && r.LoanAmount !== undefined && !isNaN(r.LoanAmount) ? (
                          `₹${r.LoanAmount}k`
                        ) : (
                          <span className="text-amber-500 font-mono">NaN</span>
                        )}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {r.Loan_Amount_Term ?? <span className="text-amber-500 font-mono">NaN</span>}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {r.Credit_History === 1 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                            1.0
                          </span>
                        ) : r.Credit_History === 0 ? (
                          <span className="px-2 py-0.5 rounded text-[11px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">
                            0.0
                          </span>
                        ) : (
                          <span className="text-amber-500 font-mono">NaN</span>
                        )}
                      </td>
                      <td className="p-3">{r.Property_Area}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            r.Loan_Status === 'Y'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {r.Loan_Status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-900/50">
            <span>
              Page {validPage} of {totalPages} ({filteredRows.length} total rows)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={validPage <= 1}
                className="p-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={validPage >= totalPages}
                className="p-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATA QUALITY */}
      {activeTab === 'quality' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Categorical Imputation Strategy
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Applied <strong>Mode Imputation</strong> (most frequently occurring category) to prevent class shift. Features handled: Gender, Married, Dependents, Self_Employed, and Credit_History.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Numerical Imputation Strategy
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Applied <strong>Median Imputation</strong> for continuous variables (LoanAmount, Loan_Amount_Term) to shield the pipeline against right-skewed extreme outliers.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Missing Values Audit by Column
              </h3>
              <p className="text-[11px] text-slate-500">
                Detailed count and percentage of missing values requiring preprocessing
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-medium">
                  <tr>
                    <th className="p-3">Column Name</th>
                    <th className="p-3 text-right">Missing Count</th>
                    <th className="p-3 text-right">Missing %</th>
                    <th className="p-3">Imputation Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  {missingReport.map(item => (
                    <tr key={item.Column} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                        {item.Column}
                      </td>
                      <td className="p-3 text-right text-amber-600 dark:text-amber-400 font-bold">
                        {item.Missing_Count}
                      </td>
                      <td className="p-3 text-right">
                        {item.Missing_Percentage.toFixed(2)}%
                      </td>
                      <td className="p-3 font-sans text-slate-600 dark:text-slate-400">
                        {(item as any).Strategy || (item.Column === 'LoanAmount' ? 'Median (₹128k)' : 'Mode Imputation')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STATISTICS */}
      {activeTab === 'statistics' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Descriptive Numerical Statistics
              </h3>
              <p className="text-[11px] text-slate-500">
                Summary statistics including mean, median, spread, and range for continuous variables
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-sans font-medium">
                  <tr>
                    <th className="p-3">Feature</th>
                    <th className="p-3 text-right">Count</th>
                    <th className="p-3 text-right">Mean</th>
                    <th className="p-3 text-right">Median</th>
                    <th className="p-3 text-right">Std Dev</th>
                    <th className="p-3 text-right">Min</th>
                    <th className="p-3 text-right">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {numericStats.map(stat => (
                    <tr key={stat.feature} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 font-sans">
                        {stat.feature}
                      </td>
                      <td className="p-3 text-right">{stat.count}</td>
                      <td className="p-3 text-right">{stat.format(stat.mean)}</td>
                      <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">
                        {stat.format(stat.median)}
                      </td>
                      <td className="p-3 text-right">{stat.format(stat.std)}</td>
                      <td className="p-3 text-right">{stat.format(stat.min)}</td>
                      <td className="p-3 text-right">{stat.format(stat.max)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                Income Skewness
              </span>
              <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                Mean ₹5,403 vs Median ₹3,812
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Substantial positive skew due to top earners exceeding ₹80,000.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                Standard Loan Amount
              </span>
              <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                Median ₹128,000 (IQR ₹100k-₹168k)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                50% of applicants request between ₹100k and ₹168k.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                Predominant Term
              </span>
              <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-1">
                360 Months (30 Years)
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Over 85% of institutional loan contracts are structured over 30 years.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
