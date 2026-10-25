/**
 * API Client for Loan Prediction Data Analysis System
 * Connects frontend to Python Flask backend.
 * Uses relative paths in production (Render deployment) and localhost:5000 in local development.
 */

import { ApplicantInput, ModelMetric } from '../types';

// In production on Render, backend and frontend share the same origin.
// In local dev, Vite runs on port 3000 while Flask runs on port 5000.
const DEFAULT_BACKEND_URL =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? ''
    : 'http://localhost:5000';

export interface DatasetApiResponse {
  total_records: number;
  total_features: number;
  duplicate_records: number;
  columns: string[];
  total_missing_cells: number;
  missing_report: Array<{
    Column: string;
    Missing_Count: number;
    Missing_Percentage: number;
  }>;
  cleaning_strategy: {
    categorical: string;
    numerical: string;
    duplicates: string;
  };
  preview_rows: any[];
}

export interface AnalysisApiResponse {
  approval_distribution: {
    total: number;
    approved: number;
    rejected: number;
    approval_rate: number;
  };
  credit_history: {
    meets_guidelines_rate: number;
    not_meets_guidelines_rate: number;
  };
  education: {
    graduate_rate: number;
    not_graduate_rate: number;
  };
  property_area: {
    semiurban_rate: number;
    urban_rate: number;
    rural_rate: number;
  };
  income_bins: Array<{ label: string; count: number }>;
  loan_bins: Array<{ label: string; count: number }>;
}

export interface ModelApiResponse {
  models: ModelMetric[];
  descriptions: Record<string, string>;
}

export interface PredictApiResponse {
  status: string;
  model_used: string;
  prediction: number;
  decision: 'APPROVED' | 'NOT APPROVED';
  prob_approved: number;
  prob_rejected: number;
  confidence_percentage: number;
  total_income: number;
  est_monthly_payment: number;
  dti_ratio: number;
  factors: Array<{ factor: string; impact: string; detail: string }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

class ApiService {
  private backendUrl: string = DEFAULT_BACKEND_URL;
  private isConnected: boolean | null = null;

  setBackendUrl(url: string) {
    this.backendUrl = url.replace(/\/$/, '');
    this.isConnected = null;
  }

  getBackendUrl(): string {
    return this.backendUrl;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.backendUrl}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      this.isConnected = res.ok;
      return res.ok;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  async getDataset(): Promise<ApiResponse<DatasetApiResponse>> {
    try {
      const res = await fetch(`${this.backendUrl}/api/dataset`, {
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const json = await res.json();
        this.isConnected = true;
        return { success: true, data: json, error: null };
      }
      return {
        success: false,
        data: null,
        error: `Backend returned HTTP ${res.status}: ${res.statusText}`,
      };
    } catch {
      this.isConnected = false;
      return {
        success: false,
        data: null,
        error: 'Backend unavailable. Please start the Python server.',
      };
    }
  }

  async getAnalysis(): Promise<ApiResponse<AnalysisApiResponse>> {
    try {
      const res = await fetch(`${this.backendUrl}/api/analysis`, {
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const json = await res.json();
        this.isConnected = true;
        return { success: true, data: json, error: null };
      }
      return {
        success: false,
        data: null,
        error: `Backend returned HTTP ${res.status}: ${res.statusText}`,
      };
    } catch {
      this.isConnected = false;
      return {
        success: false,
        data: null,
        error: 'Backend unavailable. Please start the Python server.',
      };
    }
  }

  async getModel(): Promise<ApiResponse<ModelApiResponse>> {
    try {
      const res = await fetch(`${this.backendUrl}/api/model`, {
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const json = await res.json();
        this.isConnected = true;
        return { success: true, data: json, error: null };
      }
      return {
        success: false,
        data: null,
        error: `Backend returned HTTP ${res.status}: ${res.statusText}`,
      };
    } catch {
      this.isConnected = false;
      return {
        success: false,
        data: null,
        error: 'Backend unavailable. Please start the Python server.',
      };
    }
  }

  async predict(
    input: ApplicantInput,
    modelChoice: string = 'Logistic Regression'
  ): Promise<ApiResponse<PredictApiResponse>> {
    try {
      const res = await fetch(`${this.backendUrl}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, model_choice: modelChoice }),
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const json = await res.json();
        this.isConnected = true;
        return { success: true, data: json, error: null };
      }
      return {
        success: false,
        data: null,
        error: `Backend returned HTTP ${res.status}: ${res.statusText}`,
      };
    } catch {
      this.isConnected = false;
      return {
        success: false,
        data: null,
        error: 'Backend unavailable. Please start the Python server.',
      };
    }
  }
}

export const api = new ApiService();
