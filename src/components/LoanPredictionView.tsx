import React, { useState } from 'react';
import { ApplicantInput } from '../types';
import { api, PredictApiResponse } from '../api/client';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  History,
  Trash2,
  Users,
  TrendingUp,
  Info,
} from 'lucide-react';

interface LoanPredictionViewProps {
  onPredictSuccess?: (res: PredictApiResponse) => void;
}

interface StoredPrediction extends PredictApiResponse {
  id: string;
  applicant: ApplicantInput;
  timestamp: string;
}

export const LoanPredictionView: React.FC<LoanPredictionViewProps> = () => {
  const [modelChoice, setModelChoice] = useState<string>('Logistic Regression');
  const [loading, setLoading] = useState<boolean>(false);

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

  const [result, setResult] = useState<PredictApiResponse | null>(null);

  const [history, setHistory] = useState<StoredPrediction[]>(() => {
    try {
      const saved = localStorage.getItem('loan_prediction_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.predict(formData, modelChoice);
      const resData = response.data;
      setResult(resData);

      const newEntry: StoredPrediction = {
        ...resData,
        id: 'PRED-' + Date.now().toString().slice(-6),
        applicant: { ...formData },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      const updatedHistory = [newEntry, ...history.slice(0, 9)];
      setHistory(updatedHistory);
      try {
        localStorage.setItem('loan_prediction_history', JSON.stringify(updatedHistory));
      } catch {
        // Ignore localStorage quota
      }
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('loan_prediction_history');
  };

  // Co-applicant financial calculations
  const applicantIncome = formData.ApplicantIncome || 0;
  const coapplicantIncome = formData.CoapplicantIncome || 0;
  const totalHouseholdIncome = applicantIncome + coapplicantIncome;
  const applicantSharePct = totalHouseholdIncome > 0 ? (applicantIncome / totalHouseholdIncome) * 100 : 0;
  const coapplicantSharePct = totalHouseholdIncome > 0 ? (coapplicantIncome / totalHouseholdIncome) * 100 : 0;

  // EMI and DTI analysis
  const emi = result
    ? result.est_monthly_payment
    : (formData.LoanAmount * 1000 * 0.085 * Math.pow(1 + 0.085 / 12, formData.Loan_Amount_Term)) /
      (12 * (Math.pow(1 + 0.085 / 12, formData.Loan_Amount_Term) - 1));
  const soloDti = applicantIncome > 0 ? (emi / applicantIncome) * 100 : 0;
  const householdDti = totalHouseholdIncome > 0 ? (emi / totalHouseholdIncome) * 100 : 0;
  const dtiReduction = Math.max(0, soloDti - householdDti);
  const incomeCapacityBoost = applicantIncome > 0 ? (coapplicantIncome / applicantIncome) * 100 : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Loan Approval Prediction
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Enter applicant information to evaluate credit eligibility with the trained machine-learning model.
        </p>
      </div>

      {/* Quick Sample Applicants Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
          Autofill Sample Applicant:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setFormData({
                Gender: 'Male',
                Married: 'Yes',
                Dependents: '1',
                Education: 'Graduate',
                Self_Employed: 'No',
                ApplicantIncome: 6500,
                CoapplicantIncome: 2500,
                LoanAmount: 120,
                Loan_Amount_Term: 360,
                Credit_History: 1,
                Property_Area: 'Semiurban',
                Coapplicant_Relationship: 'Spouse',
                Coapplicant_Employment: 'Salaried (Private / Corporate)',
              })
            }
            className="px-2.5 py-1 text-xs font-medium rounded border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
          >
            Low Risk (Prime)
          </button>

          <button
            type="button"
            onClick={() =>
              setFormData({
                Gender: 'Female',
                Married: 'Yes',
                Dependents: '2',
                Education: 'Graduate',
                Self_Employed: 'No',
                ApplicantIncome: 4500,
                CoapplicantIncome: 3500,
                LoanAmount: 160,
                Loan_Amount_Term: 360,
                Credit_History: 1,
                Property_Area: 'Urban',
                Coapplicant_Relationship: 'Spouse',
                Coapplicant_Employment: 'Salaried (Government / PSU)',
              })
            }
            className="px-2.5 py-1 text-xs font-medium rounded border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            Joint Co-applicant Prime
          </button>

          <button
            type="button"
            onClick={() =>
              setFormData({
                Gender: 'Male',
                Married: 'No',
                Dependents: '0',
                Education: 'Not Graduate',
                Self_Employed: 'No',
                ApplicantIncome: 2100,
                CoapplicantIncome: 0,
                LoanAmount: 260,
                Loan_Amount_Term: 360,
                Credit_History: 0,
                Property_Area: 'Rural',
                Coapplicant_Relationship: 'None (Independent Applicant)',
                Coapplicant_Employment: 'Homemaker',
              })
            }
            className="px-2.5 py-1 text-xs font-medium rounded border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
          >
            High Risk (Subprime)
          </button>

          <button
            type="button"
            onClick={() =>
              setFormData({
                Gender: 'Female',
                Married: 'Yes',
                Dependents: '2',
                Education: 'Graduate',
                Self_Employed: 'Yes',
                ApplicantIncome: 4200,
                CoapplicantIncome: 1200,
                LoanAmount: 150,
                Loan_Amount_Term: 360,
                Credit_History: 1,
                Property_Area: 'Urban',
                Coapplicant_Relationship: 'Parent',
                Coapplicant_Employment: 'Self-Employed (Business / Enterprise)',
              })
            }
            className="px-2.5 py-1 text-xs font-medium rounded border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
          >
            Borderline Applicant
          </button>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handlePredict} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-6 shadow-2xs">
        {/* Model Selection Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Machine Learning Model:
          </label>
          <select
            value={modelChoice}
            onChange={e => setModelChoice(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="Logistic Regression">Logistic Regression (Recommended)</option>
            <option value="Decision Tree">Decision Tree</option>
            <option value="Random Forest">Random Forest</option>
          </select>
        </div>

        {/* Section 1: Personal Attributes */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            1. Applicant Profile
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                value={formData.Gender}
                onChange={e => setFormData({ ...formData, Gender: e.target.value })}
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Married
              </label>
              <select
                value={formData.Married}
                onChange={e => setFormData({ ...formData, Married: e.target.value })}
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="Yes">Yes (Married)</option>
                <option value="No">No (Single)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Dependents
              </label>
              <select
                value={formData.Dependents}
                onChange={e => setFormData({ ...formData, Dependents: e.target.value })}
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="0">0 Dependents</option>
                <option value="1">1 Dependent</option>
                <option value="2">2 Dependents</option>
                <option value="3+">3+ Dependents</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Education
              </label>
              <select
                value={formData.Education}
                onChange={e => setFormData({ ...formData, Education: e.target.value })}
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="Graduate">Graduate</option>
                <option value="Not Graduate">Not Graduate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Self Employed
              </label>
              <select
                value={formData.Self_Employed}
                onChange={e => setFormData({ ...formData, Self_Employed: e.target.value })}
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="No">No (Salaried Employee)</option>
                <option value="Yes">Yes (Self Employed / Business)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Property Area
              </label>
              <select
                value={formData.Property_Area}
                onChange={e => setFormData({ ...formData, Property_Area: e.target.value })}
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="Semiurban">Semiurban</option>
                <option value="Urban">Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Financial & Credit Information */}
        <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            2. Financial & Credit Information
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
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Co-Applicant Income (₹/month)
              </label>
              <input
                type="number"
                min="0"
                max="50000"
                step="100"
                value={formData.CoapplicantIncome}
                onChange={e => setFormData({ ...formData, CoapplicantIncome: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
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
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Principal: ₹{(formData.LoanAmount * 1000).toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Loan Term (Months)
              </label>
              <select
                value={formData.Loan_Amount_Term}
                onChange={e => setFormData({ ...formData, Loan_Amount_Term: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
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
              className="w-full px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="1">1.0 — Meets Guidelines (Clean repayment record)</option>
              <option value="0">0.0 — Does Not Meet Guidelines (History of default / missed payments)</option>
            </select>
          </div>

          {/* Optional Co-applicant Profile Section */}
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
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Spouses & parents provide highest stability score in retail banking guidelines.
                </span>
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
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Salaried & professional incomes receive primary debt-servicing weighting.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Predict Loan Status Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Evaluating Underwriting Guidelines...</span>
            ) : (
              <>
                <span>Predict Loan Status</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Prediction Result Section */}
      {result && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-6 shadow-2xs">
          {/* Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Prediction Result & Financial Underwriting
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              Model: {result.model_used}
            </span>
          </div>

          {/* APPROVED / NOT APPROVED Outcome Box */}
          <div
            className={`p-5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
              result.decision === 'APPROVED'
                ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {result.decision === 'APPROVED' ? (
                <CheckCircle2 className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-slate-500 shrink-0" />
              )}
              <div>
                <span className="text-xs text-slate-500 block uppercase font-medium">
                  Official Decision
                </span>
                <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 block">
                  {result.decision === 'APPROVED' ? 'APPROVED' : 'NOT APPROVED'}
                </span>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="text-xs text-slate-500 block">
                {result.decision === 'APPROVED' ? 'Approval Probability' : 'Rejection Probability'}
              </span>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                {result.confidence_percentage}%
              </span>
            </div>
          </div>

          {/* Financial Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded">
              <span className="text-slate-400 block text-[11px]">Total Household Income</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono mt-0.5 block">
                ₹{result.total_income.toLocaleString('en-IN')}/mo
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded">
              <span className="text-slate-400 block text-[11px]">Est. Monthly Payment (EMI)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono mt-0.5 block">
                ₹{Math.round(result.est_monthly_payment).toLocaleString('en-IN')}/mo
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded">
              <span className="text-slate-400 block text-[11px]">Debt-to-Income (DTI)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono mt-0.5 block">
                {result.dti_ratio.toFixed(1)}%
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded">
              <span className="text-slate-400 block text-[11px]">Credit History</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                {formData.Credit_History === 1 ? 'Meets Guidelines' : 'Unmet'}
              </span>
            </div>
          </div>

          {/* Co-applicant Details & Impact Summary Card */}
          <div className="p-4 rounded-lg bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 space-y-3.5">
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

            {/* Breakdown Equation */}
            <div className="p-3.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Applicant Income
                </span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                  ₹{applicantIncome.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/mo</span>
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {applicantSharePct.toFixed(0)}% of household income
                </span>
              </div>

              <div className="flex items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs shrink-0">
                  +
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">
                    Co-applicant Income
                  </span>
                  {formData.Coapplicant_Relationship && formData.Coapplicant_Relationship !== 'None (Independent Applicant)' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {formData.Coapplicant_Relationship}
                    </span>
                  )}
                </div>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                  ₹{coapplicantIncome.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-400">/mo</span>
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {coapplicantSharePct.toFixed(0)}% of household income
                </span>
              </div>

              <div className="flex items-center justify-center">
                <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs shrink-0">
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

            {/* Income Share Distribution Bar */}
            {totalHouseholdIncome > 0 && (
              <div className="space-y-1">
                <div className="w-full h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex">
                  <div
                    style={{ width: `${applicantSharePct}%` }}
                    className="bg-blue-600 dark:bg-blue-500 h-full"
                    title={`Applicant Income: ${applicantSharePct.toFixed(1)}%`}
                  />
                  <div
                    style={{ width: `${coapplicantSharePct}%` }}
                    className="bg-emerald-500 dark:bg-emerald-400 h-full"
                    title={`Co-applicant Income: ${coapplicantSharePct.toFixed(1)}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                    Applicant: {applicantSharePct.toFixed(0)}% (₹{applicantIncome.toLocaleString('en-IN')})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Co-applicant: {coapplicantSharePct.toFixed(0)}% (₹{coapplicantIncome.toLocaleString('en-IN')})
                  </span>
                </div>
              </div>
            )}

            {/* DTI Reduction Note */}
            {coapplicantIncome > 0 ? (
              <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Co-applicant contribution reduces Debt-to-Income (DTI) ratio by {dtiReduction.toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 leading-relaxed">
                    Without the co-applicant, the applicant would face an individual DTI ratio of <strong>{soloDti.toFixed(1)}%</strong>. With the co-applicant contributing ₹{coapplicantIncome.toLocaleString('en-IN')}/month ({formData.Coapplicant_Relationship || 'Co-applicant'} • {formData.Coapplicant_Employment || 'Salaried'}), the household DTI drops to <strong>{householdDti.toFixed(1)}%</strong> (+{incomeCapacityBoost.toFixed(0)}% debt servicing buffer), strengthening loan eligibility and mitigating default exposure.
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
                    Applicant currently absorbs 100% of debt obligations at a single-earner DTI of <strong>{soloDti.toFixed(1)}%</strong>. Adding an earning co-applicant (e.g. spouse or parent earning ₹15,000/mo) would reduce the DTI by <strong>{(soloDti - (emi / (applicantIncome + 15000)) * 100).toFixed(1)}%</strong> (down to {((emi / (applicantIncome + 15000)) * 100).toFixed(1)}%), improving underwriting comfort.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Contributing Decision Factors */}
          {result.factors && result.factors.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Key Decision Factors:
              </h3>
              <div className="space-y-1.5">
                {result.factors.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs flex items-start justify-between"
                  >
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{f.factor}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{f.detail}</p>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-semibold shrink-0 ml-2 px-1.5 py-0.5 rounded ${
                        f.impact.includes('Positive')
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {f.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prediction History Table */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Recent Session Predictions (Stored Separately)
              </h3>
            </div>
            <button
              onClick={handleClearHistory}
              className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-[10px] border-b border-slate-200 dark:border-slate-800 font-sans">
                <tr>
                  <th className="p-2">Time</th>
                  <th className="p-2">Model</th>
                  <th className="p-2">Applicant</th>
                  <th className="p-2">Co-app</th>
                  <th className="p-2">Total Inc.</th>
                  <th className="p-2">Loan Req.</th>
                  <th className="p-2">Credit</th>
                  <th className="p-2">Decision</th>
                  <th className="p-2 text-right">Probability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                {history.map((h, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-2 font-sans">{h.timestamp}</td>
                    <td className="p-2 font-sans">{h.model_used}</td>
                    <td className="p-2">₹{h.applicant.ApplicantIncome.toLocaleString('en-IN')}</td>
                    <td className="p-2">₹{(h.applicant.CoapplicantIncome || 0).toLocaleString('en-IN')}</td>
                    <td className="p-2 font-semibold">
                      ₹{(h.total_income || (h.applicant.ApplicantIncome + (h.applicant.CoapplicantIncome || 0))).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2">₹{h.applicant.LoanAmount}k</td>
                    <td className="p-2 font-sans">{h.applicant.Credit_History === 1 ? '1.0' : '0.0'}</td>
                    <td className="p-2 font-sans font-semibold">
                      {h.decision === 'APPROVED' ? (
                        <span className="text-blue-600 dark:text-blue-400">APPROVED</span>
                      ) : (
                        <span className="text-slate-500">NOT APPROVED</span>
                      )}
                    </td>
                    <td className="p-2 text-right">{h.confidence_percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-400">
            Note: User predictions are kept exclusively in local session state and are never appended to the static 614-record historical dataset.
          </p>
        </div>
      )}
    </div>
  );
};