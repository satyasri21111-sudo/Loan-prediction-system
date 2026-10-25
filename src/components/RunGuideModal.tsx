import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, CheckCircle2, Server } from 'lucide-react';
import { api } from '../api/client';
import { downloadProjectZip } from '../utils/projectZip';

interface RunGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendConnected: boolean | null;
  onRefreshStatus: () => void;
}

export const RunGuideModal: React.FC<RunGuideModalProps> = ({
  isOpen,
  onClose,
  backendConnected,
  onRefreshStatus,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [apiUrl, setApiUrl] = useState(api.getBackendUrl());

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    api.setBackendUrl(apiUrl);
    await api.checkHealth();
    onRefreshStatus();
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Project Execution & Localhost Run Guide
            </h2>
            <p className="text-xs text-slate-500">
              How to run the normal React frontend and Python Flask backend locally.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* Download Button Banner */}
          <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                Download Complete Project ZIP
              </span>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                Includes both <code className="font-mono text-blue-600">frontend/</code> and <code className="font-mono text-blue-600">backend/</code> folders, CSV dataset, requirements.txt, and setup scripts.
              </p>
            </div>
            <button
              onClick={downloadProjectZip}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-semibold shrink-0 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>
          </div>

          {/* Backend Connection Check */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-600" />
                Backend Connection Status
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                  backendConnected
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                }`}
              >
                {backendConnected ? 'Connected to Flask (localhost:5000)' : 'Backend Offline (Requires Port 5000)'}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
                placeholder="http://localhost:5000"
                className="flex-1 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-[11px]"
              />
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium transition-colors"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </div>

          {/* Windows 1-Click Launch */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                ⚡
              </span>
              Windows 1-Click Launcher (Recommended)
            </h3>
            <p className="text-[11.5px] text-slate-600 dark:text-slate-400">
              Double-click <code className="font-mono text-emerald-700 dark:text-emerald-300 font-semibold">START_PROJECT.bat</code> in the project root to automatically check dependencies, create virtual environment, start Flask and Vite, and open your browser to <code className="font-mono text-emerald-700 dark:text-emerald-300">http://localhost:3000/</code>. Run <code className="font-mono text-emerald-700 dark:text-emerald-300 font-semibold">STOP_PROJECT.bat</code> to shut down.
            </p>
          </div>

          {/* Step 1: Python Flask Backend */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                Step 1: Start Python Backend (localhost:5000)
              </h3>
              <button
                onClick={() =>
                  copyToClipboard(
                    `cd backend\npython -m venv .venv\n.venv\\Scripts\\activate\npip install -r requirements.txt\npython app.py`,
                    'step1'
                  )
                }
                className="text-[11px] text-blue-600 hover:text-blue-500 flex items-center gap-1"
              >
                {copiedSection === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'step1' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-100 rounded-md font-mono text-[11px] overflow-x-auto">
{`# In terminal 1:
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python app.py

# Output:
# * Running on http://127.0.0.1:5000
# Backend initialized: Dataset loaded and models trained successfully.`}
            </pre>
          </div>

          {/* Step 2: React Frontend */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                Step 2: Start React Frontend (localhost:3000)
              </h3>
              <button
                onClick={() =>
                  copyToClipboard(
                    `npm install\nnpm run dev`,
                    'step2'
                  )
                }
                className="text-[11px] text-blue-600 hover:text-blue-500 flex items-center gap-1"
              >
                {copiedSection === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'step2' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-100 rounded-md font-mono text-[11px] overflow-x-auto">
{`# In terminal 2 (project root):
npm install
npm run dev

# Open in browser:
# http://localhost:3000/`}
            </pre>
          </div>

          {/* Structure Overview */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
              Project Architecture
            </h3>
            <pre className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-md font-mono text-[10.5px] overflow-x-auto leading-relaxed">
{`project-root/
├── START_PROJECT.bat     # Automated Windows launcher
├── STOP_PROJECT.bat      # Safe process shutdown
├── backend/              # Python Flask API Server (Port 5000)
│   ├── app.py            # API routes (/api/dataset, /api/analysis, /api/model, /api/predict)
│   ├── requirements.txt  # flask, flask-cors, pandas, numpy, scikit-learn
│   ├── data/
│   │   └── loan_dataset.csv
│   └── src/              # cleaning, preprocessing, eda, training, evaluation, prediction
├── src/                  # React + Vite Web Application (Port 3000)
├── package.json          # Node dependencies
├── vite.config.ts
└── README.md             # Complete step-by-step documentation`}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
