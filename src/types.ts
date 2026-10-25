export interface LoanRecord {
  Loan_ID: string;
  Gender: string | null;
  Married: string | null;
  Dependents: string | null;
  Education: string | null;
  Self_Employed: string | null;
  ApplicantIncome: number;
  CoapplicantIncome: number;
  LoanAmount: number | null;
  Loan_Amount_Term: number | null;
  Credit_History: number | null;
  Property_Area: string | null;
  Loan_Status: string | null;
  [key: string]: any;
}

export interface ModelMetric {
  modelName: string;
  name?: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: [[number, number], [number, number]]; // [[TN, FP], [FN, TP]]
  featureImportances: { feature: string; importance: number }[];
}

export interface ApplicantInput {
  Gender: string;
  Married: string;
  Dependents: string;
  Education: string;
  Self_Employed: string;
  ApplicantIncome: number;
  CoapplicantIncome: number;
  LoanAmount: number;
  Loan_Amount_Term: number;
  Credit_History: number;
  Property_Area: string;
  Coapplicant_Relationship?: string;
  Coapplicant_Employment?: string;
}

export interface PredictionResult {
  prediction: number; // 1 = Approved, 0 = Rejected
  statusText: string;
  probApproved: number;
  probRejected: number;
  confidencePct: number;
  totalIncome: number;
  estMonthlyPayment: number;
  dtiRatio: number;
  modelUsed: string;
  applicantData: ApplicantInput;
  factors: {
    factor: string;
    impact: 'Positive (+)' | 'Critical Negative (-)' | 'Negative (-)';
    detail: string;
  }[];
  disclaimer: string;
  timestamp: string;
}
