import React from 'react';
import { ApplicantInput } from '../types';
import { PredictApiResponse } from '../api/client';
import { Printer, X, CheckCircle2, ShieldCheck, Building2, Calendar, FileText } from 'lucide-react';

interface SanctionLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ApplicantInput;
  result: PredictApiResponse;
}

export const SanctionLetterModal: React.FC<SanctionLetterModalProps> = ({
  isOpen,
  onClose,
  formData,
  result,
}) => {
  if (!isOpen) return null;

  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const validUntil = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const refId = `SL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const handlePrint = () => {
    window.print();
  };

  const loanAmountRupees = formData.LoanAmount * 1000;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden print:border-none print:shadow-none print:w-full">
        {/* Modal Top Bar (Hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Preliminary Sanction Letter
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sanction Letter Content */}
        <div className="p-8 space-y-6 text-slate-800 dark:text-slate-200 print:text-black print:p-6 print:space-y-4">
          {/* Institution Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 dark:border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400 print:text-black" />
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white print:text-black">
                  APEX HOUSING & MORTGAGE FINANCE
                </h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Retail Lending & Credit Underwriting Division • RBI Regulated Entity
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Ref No: {refId} • Date: {today}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider border border-emerald-300 dark:border-emerald-800">
                In-Principle Approved
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Validity: 60 Days (Till {validUntil})
              </p>
            </div>
          </div>

          {/* Letter Body Intro */}
          <div className="space-y-2 text-xs leading-relaxed">
            <p className="font-semibold text-slate-900 dark:text-white">
              To: {formData.Gender === 'Male' ? 'Mr.' : 'Ms.'} Applicant (Co-applicant:{' '}
              {formData.CoapplicantIncome > 0
                ? `${formData.Coapplicant_Relationship || 'Co-applicant'} - Income: ₹${formData.CoapplicantIncome.toLocaleString()}/mo`
                : 'None'}
              )
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Dear Applicant,
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              We are pleased to inform you that your application for a Retail Housing / Term Loan has been evaluated using our institutional risk underwriting model (<span className="font-mono">{result.model_used}</span>) and has received <strong>In-Principle Sanction Approval</strong> subject to the terms and conditions outlined below.
            </p>
          </div>

          {/* Key Loan Terms Table */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
            <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 font-bold text-slate-900 dark:text-white text-xs border-b border-slate-200 dark:border-slate-700">
              Sanctioned Credit Facility Parameters
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="grid grid-cols-2 px-4 py-2 bg-white dark:bg-slate-900">
                <span className="text-slate-500 dark:text-slate-400">Sanctioned Principal Amount:</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  ₹{loanAmountRupees.toLocaleString('en-IN')} (₹{formData.LoanAmount} Thousand)
                </span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">Approved Loan Term:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formData.Loan_Amount_Term} Months ({Math.round(formData.Loan_Amount_Term / 12)} Years)
                </span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2 bg-white dark:bg-slate-900">
                <span className="text-slate-500 dark:text-slate-400">Estimated Monthly Installment (EMI):</span>
                <span className="font-bold font-mono text-blue-600 dark:text-blue-400">
                  ₹{Math.round(result.est_monthly_payment).toLocaleString('en-IN')}/month
                </span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">Benchmark Floating Interest Rate:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  8.50% p.a. (EBLR Linked)
                </span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2 bg-white dark:bg-slate-900">
                <span className="text-slate-500 dark:text-slate-400">Assessed Household Income:</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-white">
                  ₹{result.total_income.toLocaleString('en-IN')}/month (Applicant: ₹{formData.ApplicantIncome.toLocaleString('en-IN')} + Co-app: ₹{formData.CoapplicantIncome.toLocaleString('en-IN')})
                </span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2 bg-slate-50/50 dark:bg-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400">Debt-to-Income (DTI) Ratio:</span>
                <span className="font-semibold font-mono text-slate-900 dark:text-white">
                  {result.dti_ratio.toFixed(1)}% (Institutional threshold ≤ 40%)
                </span>
              </div>
              <div className="grid grid-cols-2 px-4 py-2 bg-white dark:bg-slate-900">
                <span className="text-slate-500 dark:text-slate-400">Property Area / Collateral Category:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formData.Property_Area}
                </span>
              </div>
            </div>
          </div>

          {/* Conditions Precedent */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Conditions Precedent to Final Disbursement
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
              <li>Submission of valid KYC documents (Aadhaar & PAN) with biometric or digital e-KYC.</li>
              <li>Verification of continuous income via last 3 months salary slips / Form 16 and 6 months bank statements.</li>
              <li>Satisfactory legal vetting of original title chain deeds and technical valuation report of the subject property.</li>
              <li>Execution of formal Loan Agreement and registration of NACH / e-Mandate for automated monthly deductions.</li>
            </ul>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-end justify-between text-xs">
            <div>
              <div className="w-20 h-10 border border-dashed border-slate-300 dark:border-slate-700 rounded flex items-center justify-center text-[10px] text-slate-400">
                [Digital Seal]
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                System Authenticated: {result.confidence_percentage}% Confidence Score
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif italic text-sm text-slate-800 dark:text-slate-200">
                Authorized Credit Signatory
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">
                Underwriting & Risk Operations
              </p>
              <p className="text-[10px] text-slate-500">
                Apex Housing & Mortgage Finance Ltd.
              </p>
            </div>
          </div>

          {/* Academic / Preliminary Disclaimer */}
          <p className="text-[10px] text-slate-400 text-center border-t border-slate-100 dark:border-slate-800/80 pt-3 italic">
            This in-principle sanction advice is issued based on self-declared parameters and analytical ML evaluation. Final disbursement remains contingent upon conclusive title search, physical collateral appraisal, and institutional credit policy compliance.
          </p>
        </div>
      </div>
    </div>
  );
};
