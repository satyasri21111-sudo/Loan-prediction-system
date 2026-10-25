import React from 'react';
import { PredictionResult } from '../types';
import { FileText, Printer, ArrowLeft, ShieldAlert, Award, Calendar } from 'lucide-react';

interface ApplicantReportViewProps {
  report: PredictionResult | null;
  onNavigateToPrediction: () => void;
}

export const ApplicantReportView: React.FC<ApplicantReportViewProps> = ({
  report,
  onNavigateToPrediction,
}) => {
  if (!report) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
        <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Applicant Report Available</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please run a prediction first under <strong>💰 Loan Prediction</strong> to compile the formal risk and underwriting report.
        </p>
        <button
          onClick={onNavigateToPrediction}
          className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-500 transition-colors"
        >
          Go to Loan Prediction Form
        </button>
      </div>
    );
  }

  const { applicantData: d } = report;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>📄 Applicant Risk Assessment Report</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Module 8: Formal academic underwriting dossier summarizing financial metrics, ML prediction confidence, and risk factors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
          <button
            onClick={onNavigateToPrediction}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs font-medium border border-slate-300 dark:border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Form</span>
          </button>
        </div>
      </div>

      {/* Formal Printable Document Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-6 shadow-xs max-w-4xl mx-auto">
        {/* Document Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-start">
          <div>
            <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase">
              Underwriting Assessment Report
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              Preliminary Credit Evaluation Dossier
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>Timestamp: {report.timestamp} | Model: {report.modelUsed}</span>
            </p>
          </div>

          <div
            className={`px-3 py-1.5 rounded text-xs font-bold font-mono uppercase tracking-wider ${
              report.prediction === 1
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}
          >
            {report.statusText}
          </div>
        </div>

        {/* Executive Decision Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 block">Model Recommendation</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-100">{report.statusText}</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 block">Statistical Confidence</span>
            <span className="text-base font-bold text-blue-600 dark:text-blue-400">{report.confidencePct}%</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-500 block">Debt-to-Income (DTI)</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-100">{report.dtiRatio}%</span>
          </div>
        </div>

        {/* Applicant Profile Table */}
        <div>
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
            1. Applicant Profile Summary
          </h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden text-xs">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <td className="p-2 font-semibold text-slate-700 dark:text-slate-300 w-1/4">Gender & Marital</td>
                  <td className="p-2 text-slate-600 dark:text-slate-300 w-1/4">{d.Gender} / {d.Married === 'Yes' ? 'Married' : 'Single'}</td>
                  <td className="p-2 font-semibold text-slate-700 dark:text-slate-300 w-1/4">Dependents</td>
                  <td className="p-2 text-slate-600 dark:text-slate-300 w-1/4">{d.Dependents}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-700 dark:text-slate-300">Education</td>
                  <td className="p-2 text-slate-600 dark:text-slate-300">{d.Education}</td>
                  <td className="p-2 font-semibold text-slate-700 dark:text-slate-300">Employment</td>
                  <td className="p-2 text-slate-600 dark:text-slate-300">{d.Self_Employed === 'Yes' ? 'Self Employed' : 'Salaried'}</td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <td className="p-2 font-semibold text-slate-700 dark:text-slate-300">Applicant Income</td>
                  <td className="p-2 text-slate-600 dark:text-slate-300 font-bold">₹{d.ApplicantIncome.toLocaleString()}/mo</td>
                  <td className="p-2 font-semibold text-slate-700 dark:text-slate-300">Coapplicant Income</td>
                  <td className="p-2 text-slate-600 dark:text-slate-300 font-bold">₹{d.CoapplicantIncome.toLocaleString()}/mo</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-700 dark:text-slate-300">Combined Income</td>
                  <td className="p-2 text-slate-600 dark:text-slate-300 font-bold text-blue-600">₹{report.totalIncome.toLocaleString()}/mo</td>
                  <td className="p-2 font-semibold text-slate-700 dark:text-slate-300">Requested Loan</td>
                  <td className="p-2 text-slate-600 dark:text-slate-300 font-bold">₹{(d.LoanAmount * 1000).toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <td className="p-2 font-semibold text-slate-700 dark:text-slate-300">Term (Months)</td>
                  <td className="p-2 text-slate-600 dark:text-slate-300">{d.Loan_Amount_Term} mos</td>
                  <td className="p-2 font-semibold text-slate-700 dark:text-slate-300">Property Area</td>
                  <td className="p-2 text-slate-600 dark:text-slate-300">{d.Property_Area}</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-700 dark:text-slate-300">Credit History</td>
                  <td colSpan={3} className="p-2 font-bold">
                    {d.Credit_History === 1 ? (
                      <span className="text-emerald-600">1.0 — Institutional Guidelines Met</span>
                    ) : (
                      <span className="text-rose-600">0.0 — Guidelines NOT Met (Prior Default Flag)</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Driving Factors Breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
            2. Qualitative & Quantitative Risk Factors
          </h4>
          <div className="space-y-2">
            {report.factors.map((f, i) => (
              <div key={i} className="p-3 rounded border border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{f.factor}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    f.impact.includes('Positive')
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                  }`}>
                    {f.impact}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-1 text-[11px]">{f.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ethical Academic Disclaimer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Academic Evaluation Notice:</strong> {report.disclaimer} This assessment represents empirical statistical mapping and should never replace human underwriter discretion or official credit bureau certification.
          </p>
        </div>
      </div>
    </div>
  );
};
