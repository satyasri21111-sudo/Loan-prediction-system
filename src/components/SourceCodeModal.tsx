import React, { useState } from 'react';
import { PYTHON_FILES, downloadProjectZip } from '../utils/projectZip';
import { X, Copy, Check, Download, FileCode, Folder, ExternalLink } from 'lucide-react';

interface SourceCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourceCodeModal: React.FC<SourceCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('app.py');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const fileContent = PYTHON_FILES[selectedFile] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fileDescriptions: Record<string, string> = {
    'app.py': 'Main Flask backend application file containing REST API endpoints.',
    'requirements.txt': 'Python package dependencies (flask, pandas, numpy, scikit-learn, etc.).',
    'README.md': 'Exhaustive system documentation and deployment guide.',
    'src/data_cleaning.py': 'Missing value detection, mode/median imputation, and duplicate removal.',
    'src/preprocessing.py': 'Encoders, StandardScaler, and stratified train_test_split without data leakage.',
    'src/eda.py': 'All 11 Matplotlib/Seaborn visualization functions returning Figure objects.',
    'src/model_training.py': 'Training Logistic Regression, Decision Tree, and Random Forest on identical splits.',
    'src/evaluation.py': 'Metrics computation, Confusion Matrix heatmap, ROC curves, and Feature Importance.',
    'src/prediction.py': 'Inference pipeline, probability calculation, and contextual risk factor synthesis.',
    'data/loan_dataset.csv': 'Historical loan applicant dataset with 614 rows and 12 features.',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Python Project Source Files & Downloader
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              loan_prediction_system/
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadProjectZip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Project ZIP</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree Sidebar */}
          <div className="w-60 border-r border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3 overflow-y-auto space-y-1 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 font-mono">
              Project Structure
            </div>
            {Object.keys(PYTHON_FILES).map(fileName => {
              const isActive = selectedFile === fileName;
              return (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2 font-mono text-[11.5px] transition-colors truncate ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                  <span className="truncate">{fileName}</span>
                </button>
              );
            })}
          </div>

          {/* File Content Area */}
          <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 overflow-hidden font-mono text-xs">
            {/* File Info Bar */}
            <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-semibold">{selectedFile}</span>
                <span className="text-slate-400 text-[11px] ml-2 font-sans">
                  — {fileDescriptions[selectedFile] || ''}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="flex-1 p-4 overflow-auto font-mono text-[11.5px] leading-relaxed text-slate-300 select-text">
              <pre>{fileContent}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
