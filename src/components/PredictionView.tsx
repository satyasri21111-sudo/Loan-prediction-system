import React, { useState } from 'react';
import { ApplicantInput, PredictionResult, ModelMetric } from '../types';
import { predictSingleApplicant } from '../utils/mlEngine';
import {
  CheckCircle2,
  XCircle,
  Users,
  TrendingUp,
  AlertTriangle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Sparkles,
  CheckSquare,
  Square,
  Info,
} from 'lucide-react';
import { SanctionLetterModal } from './SanctionLetterModal';

interface PredictionViewProps {
  metrics?: ModelMetric[] | null;
}

interface DocumentItem {
  id: string;
  title: string;
  category: string;
  description: string;
  acceptedFormats: string;
}

const VERIFICATION_DOCUMENTS: DocumentItem[] = [
  {
    id: 'identity',
    title: 'Identity Proof (PAN Card / Aadhaar)',
    category: 'Mandatory KYC',
    description:
      'Valid PAN card for tax & CIBIL bureau verification. Aadhaar card for biometric or OTP e-KYC. Required for both primary applicant and co-applicant.',
    acceptedFormats: 'PAN Card, Aadhaar Card, Passport, Voter ID (PDF / JPG < 5MB)',
  },
  {
    id: 'address',
    title: 'Address Proof',
    category: 'Resident Proof',
    description:
      'Current and permanent residence proof. Must reflect applicant full name and matching address.',
    acceptedFormats: 'Passport, Aadhaar Card, Voter ID, Utility Bill (Electricity / Piped Gas <= 60 days)',
  },
  {
    id: 'income',
    title: 'Income Proof (Last 3 months salary slips or Form 16)',
    category: 'Income Verification',
    description:
      'Salaried: Last 3 consecutive months salary slips with official company seal / digital signature + latest Form 16 (Part A & B). Self-employed: 2 years audited Balance Sheet, P&L, and ITR-V with computation.',
    acceptedFormats: 'Salary Slips, Form 16, ITR-V Acknowledgement',
  },
  {
    id: 'bank',
    title: 'Last 6 months bank statements',
    category: 'Banking History',
    description:
      'Operative bank account statement showing continuous salary credits or business operational turnover with institutional bank stamp / digital verification.',
    acceptedFormats: 'Official e-Statement (PDF) or Original Passbook with bank stamp',
  },
  {
    id: 'property',
    title: 'Property legal & title documents',
    category: 'Collateral Title',
    description:
      'Registered Agreement for Sale / Builder Allotment Letter, chain of title deeds (13 to 30 years), approved municipal building plan, and Non-Encumbrance Certificate (NEC).',
    acceptedFormats: 'Title Deed, Allotment Letter, Approved Plan, NEC',
  },
];

export const PredictionView: React.FC<PredictionViewProps> = () => {
  const [modelChoice, setModelChoice] = useState<string>('Logistic Regression');

  const [formData, setFormData] = useState<ApplicantInput>({
    Gender: 'Male',
    Married: 'Yes',
    Dependents: '0',
    Education: 'Graduate',
    Self_Employed: 'No',
    ApplicantIncome: 5000,
    CoapplicantIncome: 1500,
    LoanAmount: 140,
    Loan_Amount_Term: 360,
    Credit_History: 1,
    Property_Area: 'Semiurban',
    Coapplicant_Relationship: 'Spouse',
    Coapplicant_Employment: 'Salaried (Private / Corporate)',
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [showSanctionModal, setShowSanctionModal] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(true);
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    identity: false,
    address: false,
    income: false,
    bank: false,
    property: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = predictSingleApplicant(formData, modelChoice);
    setResult(res);
  };

  const toggleDoc = (id: string) => {
    setCheckedDocs(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAllDocs = () => {
    const allChecked = Object.values(checkedDocs).every(Boolean);
    const nextState: Record<string, boolean> = {};
    VERIFICATION_DOCUMENTS.forEach(d => {
      nextState[d.id] = !allChecked;
    });
    setCheckedDocs(nextState);
  };

  // Co-applicant financial metrics
  const applicantIncome = formData.ApplicantIncome || 0;
  const coapplicantIncome = formData.CoapplicantIncome || 0;
  const totalHouseholdIncome = applicantIncome + coapplicantIncome;
  const applicantSharePct = totalHouseholdIncome > 0 ? (applicantIncome / totalHouseholdIncome) * 100 : 0;
  const coapplicantSharePct = totalHouseholdIncome > 0 ? (coapplicantIncome / totalHouseholdIncome) * 100 : 0;

  const emi = result ? result.estMonthlyPayment : (formData.LoanAmount * 1000 * 0.085 * Math.pow(1 + 0.085 / 12, formData.Loan_Amount_Term)) / (12 * (Math.pow(1 + 0.085 / 12, formData.Loan_Amount_Term) - 1));
  const soloDti = applicantIncome > 0 ? (emi / applicantIncome) * 100 : 0;
  const householdDti = totalHouseholdIncome > 0 ? (emi / totalHouseholdIncome) * 100 : 0;
  const dtiReduction = Math.max(0, soloDti - householdDti);
  const incomeCapacityBoost = applicantIncome > 0 ? (coapplicantIncome / applicantIncome) * 100 : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Loan Approval Prediction
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Enter applicant information to evaluate credit eligibility with the trained machine-learning model.
        </p>
      </div>

      {/* Main Prediction Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-6">
        {/* Model Selection */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Selected Model:
          </label>
          <select
            value={modelChoice}
            onChange={e => setModelChoice(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="Logistic Regression">Logistic Regression (Recommended)</option>
            <option value="Decision Tree">Decision Tree</option>
            <option value="Random Forest">Random Forest</option>
          </select>
        </div>

        {/* GROUP 1: PERSONAL INFORMATION */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Applicant Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Gender</label>
              <select
                value={formData.Gender}
                onChange={e => setFormData({ ...formData, Gender: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Married</label>
              <select
                value={formData.Married}
                onChange={e => setFormData({ ...formData, Married: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Dependents</label>
              <select
                value={formData.Dependents}
                onChange={e => setFormData({ ...formData, Dependents: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3+">3+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Education</label>
              <select
                value={formData.Education}
                onChange={e => setFormData({ ...formData, Education: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="Graduate">Graduate</option>
                <option value="Not Graduate">Not Graduate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Self Employed</label>
              <select
                value={formData.Self_Employed}
                onChange={e => setFormData({ ...formData, Self_Employed: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Property Area</label>
              <select
                value={formData.Property_Area}
                onChange={e => setFormData({ ...formData, Property_Area: e.target.value })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="Semiurban">Semiurban</option>
                <option value="Urban">Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
          </div>
        </div>

        {/* GROUP 2: FINANCIAL INFORMATION */}
        <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Financial & Underwriting Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Applicant Income (₹/month)
              </label>
              <input
                type="number"
                min="0"
                max="100000"
                step="100"
                value={formData.ApplicantIncome}
                onChange={e => setFormData({ ...formData, ApplicantIncome: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Co-applicant Income (₹/month)
              </label>
              <input
                type="number"
                min="0"
                max="50000"
                step="100"
                value={formData.CoapplicantIncome}
                onChange={e => setFormData({ ...formData, CoapplicantIncome: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Loan Amount (₹ in Thousands)
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                step="5"
                value={formData.LoanAmount}
                onChange={e => setFormData({ ...formData, LoanAmount: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Loan Term (Months)
              </label>
              <select
                value={formData.Loan_Amount_Term}
                onChange={e => setFormData({ ...formData, Loan_Amount_Term: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="360">360 Months (30 Years)</option>
                <option value="240">240 Months (20 Years)</option>
                <option value="180">180 Months (15 Years)</option>
                <option value="120">120 Months (10 Years)</option>
                <option value="60">60 Months (5 Years)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Credit History Guidelines
            </label>
            <select
              value={formData.Credit_History}
              onChange={e => setFormData({ ...formData, Credit_History: Number(e.target.value) })}
              className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="1">1.0 — Meets Guidelines</option>
              <option value="0">0.0 — Does Not Meet Guidelines</option>
            </select>
          </div>

          {/* Co-applicant Profile Optional Section */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Co-applicant Profile (Optional Underwriting Context)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Institutional credit context for combined debt servicing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Relationship to Applicant
                </label>
                <select
                  value={formData.Coapplicant_Relationship || 'Spouse'}
                  onChange={e => setFormData({ ...formData, Coapplicant_Relationship: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="Spouse">Spouse (Husband / Wife)</option>
                  <option value="Parent">Parent (Father / Mother)</option>
                  <option value="Sibling">Sibling (Brother / Sister)</option>
                  <option value="Child">Child (Son / Daughter)</option>
                  <option value="Business Partner">Business Partner / Other</option>
                  <option value="None (Independent Applicant)">None (Independent Applicant)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Co-applicant Employment Type
                </label>
                <select
                  value={formData.Coapplicant_Employment || 'Salaried (Private / Corporate)'}
                  onChange={e => setFormData({ ...formData, Coapplicant_Employment: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="Salaried (Private / Corporate)">Salaried (Private / Corporate)</option>
                  <option value="Salaried (Government / PSU)">Salaried (Government / PSU)</option>
                  <option value="Self-Employed (Business / Enterprise)">Self-Employed (Business / Enterprise)</option>
                  <option value="Professional (Doctor / CA / Lawyer)">Professional (Doctor / CA / Lawyer)</option>
                  <option value="Homemaker">Homemaker</option>
                  <option value="Retired / Pensioner">Retired / Pensioner</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Predict Loan Status
          </button>
        </div>
      </form>

      {/* Clean Result Section */}
      {result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Prediction Result
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              Model: {result.modelUsed}
            </span>
          </div>

          <div
            className={`p-5 rounded-lg flex items-center justify-between border ${
              result.prediction === 1
                ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                {result.prediction === 1 ? (
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-500" />
                )}
                <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {result.prediction === 1 ? 'APPROVED' : 'NOT APPROVED'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {result.prediction === 1
                  ? `Approval Probability: ${(result.probApproved * 100).toFixed(1)}%`
                  : `Prediction Probability: ${(result.probRejected * 100).toFixed(1)}%`}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Confidence Score</span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {result.confidencePct}%
              </span>
            </div>
          </div>

          {/* Household Income Breakdown & Co-applicant Impact */}
          <div className="p-4 rounded-lg bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Household Income Breakdown & Co-applicant Impact
                </h3>
              </div>
              <span className="text-[10px] font-mono font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded">
                Underwriting Breakdown
              </span>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Applicant Income
                </span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                  ₹{applicantIncome.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/mo</span>
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {applicantSharePct.toFixed(0)}% of household
                </span>
              </div>

              <div className="flex items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs">
                  +
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Co-applicant Income
                  </span>
                  {formData.Coapplicant_Relationship && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {formData.Coapplicant_Relationship}
                    </span>
                  )}
                </div>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                  ₹{coapplicantIncome.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/mo</span>
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {coapplicantSharePct.toFixed(0)}% of household
                </span>
              </div>

              <div className="flex items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs">
                  =
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded border border-blue-200/60 dark:border-blue-900/40">
                <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block">
                  Total Household Income
                </span>
                <span className="text-base font-bold font-mono text-blue-700 dark:text-blue-300">
                  ₹{totalHouseholdIncome.toLocaleString('en-IN')}<span className="text-xs font-normal text-blue-600 dark:text-blue-400">/mo</span>
                </span>
                <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80 block">
                  Combined Servicing Capacity
                </span>
              </div>
            </div>

            {coapplicantIncome > 0 ? (
              <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Co-applicant contribution reduces Debt-to-Income (DTI) ratio by {dtiReduction.toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
                    Without the co-applicant, the applicant alone faces a DTI of <strong>{soloDti.toFixed(1)}%</strong>. Adding co-applicant income reduces total DTI down to <strong>{householdDti.toFixed(1)}%</strong>, boosting debt-servicing capacity by +{incomeCapacityBoost.toFixed(0)}%.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    Co-applicant Opportunity: No Co-applicant Income Provided
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-relaxed">
                    Adding an earning co-applicant (e.g. ₹15,000/mo) would lower the DTI from <strong>{soloDti.toFixed(1)}%</strong> to <strong>{((emi / (applicantIncome + 15000)) * 100).toFixed(1)}%</strong>, significantly enhancing eligibility.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Outcome-Dependent Next Steps */}
          {result.prediction === 1 ? (
            <div className="p-4 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                    Procedural Next Steps (Application Approved)
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                  In-Principle Approved
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-md border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                        1
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        Download preliminary sanction letter
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7">
                      Obtain your official In-Principle Sanction Letter detailing sanctioned principal and terms.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSanctionModal(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-xs transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Sanction Letter</span>
                  </button>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-md border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      Complete biometric KYC at nearest branch
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Visit the nearest branch with original PAN & Aadhaar for verification or complete DigiLocker video-KYC.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-md border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      Submit property valuation documents
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Provide registered sale deed, approved plan, and 30-year non-encumbrance certificate for legal vetting.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200">
                    Actionable Financial Improvement Tips
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded">
                  Credit Recovery Action Plan
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-md border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      Improve credit score by clearing existing dues
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7 leading-relaxed">
                    Clear overdue credit card balances and delinquent personal loans. Target a CIBIL score ≥ 750.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-md border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      Consider applying with a higher co-applicant income
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7 leading-relaxed">
                    Adding an earning family member pools household income and directly reduces Debt-to-Income (DTI).
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-md border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      Reduce requested loan amount or increase tenure
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7 leading-relaxed">
                    Lowering the loan amount or extending tenure reduces monthly installment burden to achieve DTI ≤ 36%.
                  </p>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-md border border-slate-200/80 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      Re-apply after 6 months
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-7 leading-relaxed">
                    Wait 180 days for credit bureaus to register cleared records before re-submitting.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Verification Documents Checklist */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
            <button
              type="button"
              onClick={() => setIsDocsOpen(!isDocsOpen)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                      Required Verification Documents
                    </h3>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                      {Object.values(checkedDocs).filter(Boolean).length} of {VERIFICATION_DOCUMENTS.length} Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Official documents required by underwriters prior to final credit sanction
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-xs text-slate-500 hidden sm:inline">
                  {isDocsOpen ? 'Collapse' : 'Expand Checklist'}
                </span>
                {isDocsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isDocsOpen && (
              <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 text-[11px]">
                    Check off documents verified or gathered for submission:
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleAllDocs}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                    >
                      {Object.values(checkedDocs).every(Boolean) ? 'Uncheck All' : 'Select All'}
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print Checklist</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {VERIFICATION_DOCUMENTS.map(doc => {
                    const isChecked = checkedDocs[doc.id];
                    return (
                      <div
                        key={doc.id}
                        onClick={() => toggleDoc(doc.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                          isChecked
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                            : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0 text-slate-400">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span
                              className={`text-xs font-semibold ${
                                isChecked
                                  ? 'text-emerald-900 dark:text-emerald-200 line-through'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {doc.title}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {doc.category}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                            {doc.description}
                          </p>

                          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                            <span>Accepted:</span>
                            <span className="text-slate-600 dark:text-slate-300">
                              {doc.acceptedFormats}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sanction Letter Modal */}
      {result && (
        <SanctionLetterModal
          isOpen={showSanctionModal}
          onClose={() => setShowSanctionModal(false)}
          formData={formData}
          result={{
            status: 'success',
            model_used: result.modelUsed,
            prediction: result.prediction,
            decision: result.prediction === 1 ? 'APPROVED' : 'NOT APPROVED',
            prob_approved: result.probApproved,
            prob_rejected: result.probRejected,
            confidence_percentage: result.confidencePct,
            total_income: result.totalIncome,
            est_monthly_payment: result.estMonthlyPayment,
            dti_ratio: result.dtiRatio,
            factors: result.factors,
          }}
        />
      )}
    </div>
  );
};
