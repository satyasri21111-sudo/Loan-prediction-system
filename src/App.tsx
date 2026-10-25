import React, { useState, useEffect } from 'react';
import { api, DatasetApiResponse, AnalysisApiResponse, ModelApiResponse } from './api/client';
import { RAW_CSV_DATA } from './data/defaultDataset';
import { downloadProjectZip } from './utils/projectZip';

import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DatasetView } from './components/DatasetView';
import { DataAnalysisView } from './components/DataAnalysisView';
import { ModelsView } from './components/ModelsView';
import { LoanPredictionView } from './components/LoanPredictionView';
import { AboutView } from './components/AboutView';
import { SourceCodeModal } from './components/SourceCodeModal';
import { RunGuideModal } from './components/RunGuideModal';
import { Menu, Activity, Download } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [datasetData, setDatasetData] = useState<DatasetApiResponse | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisApiResponse | null>(null);
  const [modelData, setModelData] = useState<ModelApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check API
  const loadData = async () => {
    setLoading(true);
    try {
      const isOnline = await api.checkHealth();
      setBackendConnected(isOnline);

      const [dsRes, anRes, mdRes] = await Promise.all([
        api.getDataset(),
        api.getAnalysis(),
        api.getModel(),
      ]);

      if (dsRes.success && dsRes.data) {
        setDatasetData(dsRes.data);
        setBackendConnected(true);
      } else {
        setDatasetData(null);
      }

      if (anRes.success && anRes.data) {
        setAnalysisData(anRes.data);
      } else {
        setAnalysisData(null);
      }

      if (mdRes.success && mdRes.data) {
        setModelData(mdRes.data);
      } else {
        setModelData(null);
      }
    } catch (err) {
      console.error('Data initialization failed:', err);
      setBackendConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadCsv = () => {
    const blob = new Blob([RAW_CSV_DATA], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loan_dataset.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Compute stats for Dashboard
  const dashboardStats = analysisData?.approval_distribution
    ? {
        total: analysisData.approval_distribution.total,
        approved: analysisData.approval_distribution.approved,
        rejected: analysisData.approval_distribution.rejected,
        approvalRate: analysisData.approval_distribution.approval_rate,
        avgLoanAmount: 146.4,
      }
    : {
        total: 614,
        approved: 422,
        rejected: 192,
        approvalRate: 68.7,
        avgLoanAmount: 146.4,
      };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 flex">
      {/* 1. PROFESSIONAL FIXED LEFT SIDEBAR */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onDownloadZip={downloadProjectZip}
        backendConnected={backendConnected}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. MAIN CONTENT AREA TO THE RIGHT OF THE SIDEBAR */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Loan Prediction System
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadProjectZip}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Download Project ZIP"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
          {(currentTab === 'dashboard' || currentTab === 'home') && (
            <DashboardView
              stats={dashboardStats}
              analysisData={analysisData}
              onNavigate={tab => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'dataset' && (
            <DatasetView
              data={datasetData}
              onDownloadCsv={handleDownloadCsv}
            />
          )}

          {currentTab === 'analysis' && (
            <DataAnalysisView
              data={analysisData}
            />
          )}

          {currentTab === 'models' && (
            <ModelsView
              data={modelData}
            />
          )}

          {currentTab === 'prediction' && (
            <LoanPredictionView backendConnected={backendConnected} />
          )}

          {currentTab === 'about' && (
            <AboutView />
          )}
        </main>

        {/* Professional Minimal Footer */}
        <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-xs text-slate-500 text-center">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Loan Prediction Data Analysis System
            </p>
            <p className="text-[11px] text-slate-400">
              Python (Flask) + Scikit-Learn + React SPA • Running on Localhost
            </p>
          </div>
        </footer>
      </div>

      {/* Python Source Files Modal */}
      <SourceCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* Terminal Run Guide Modal */}
      <RunGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        backendConnected={backendConnected}
        onRefreshStatus={loadData}
      />
    </div>
  );
}
