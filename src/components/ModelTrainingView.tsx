import React, { useState } from 'react';
import { LoanRecord, ModelMetric } from '../types';
import { Cpu, Play, CheckCircle2, Sliders, ShieldCheck } from 'lucide-react';

interface ModelTrainingViewProps {
  records: LoanRecord[];
  isCleaned: boolean;
  metrics: ModelMetric[] | null;
  onTrainModels: (params: {
    testSplit: number;
    randomSeed: number;
    dtMaxDepth: number;
    rfEstimators: number;
    lrC: number;
    scaleFeatures: boolean;
  }) => void;
  onNavigateToEvaluation: () => void;
}

export const ModelTrainingView: React.FC<ModelTrainingViewProps> = ({
  records,
  isCleaned,
  metrics,
  onTrainModels,
  onNavigateToEvaluation,
}) => {
  const [testSplit, setTestSplit] = useState<number>(0.2);
  const [randomSeed, setRandomSeed] = useState<number>(42);
  const [dtMaxDepth, setDtMaxDepth] = useState<number>(4);
  const [rfEstimators, setRfEstimators] = useState<number>(100);
  const [lrC, setLrC] = useState<number>(1.0);
  const [scaleFeatures, setScaleFeatures] = useState<boolean>(true);
  const [isTraining, setIsTraining] = useState<boolean>(false);

  const handleTrain = () => {
    setIsTraining(true);
    setTimeout(() => {
      onTrainModels({
        testSplit,
        randomSeed,
        dtMaxDepth,
        rfEstimators,
        lrC,
        scaleFeatures,
      });
      setIsTraining(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>🤖 Machine Learning Model Training</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Module 5: Train and compare three classical algorithms on identical stratified train/test data to prevent data leakage.
        </p>
      </div>

      {/* Hyperparameter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <Sliders className="w-4 h-4 text-blue-500" />
          <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Pipeline Configuration & Hyperparameters
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Split & Seed */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Test Split Ratio (test_size):</span>
                <span className="font-mono font-bold text-blue-600">{testSplit * 100}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.4"
                step="0.05"
                value={testSplit}
                onChange={e => setTestSplit(parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[10.5px] text-slate-400">
                Train: {(100 - testSplit * 100).toFixed(0)}% | Test: {(testSplit * 100).toFixed(0)}%
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Random Seed (Reproducibility):
              </label>
              <input
                type="number"
                value={randomSeed}
                onChange={e => setRandomSeed(parseInt(e.target.value) || 42)}
                className="w-full px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>
          </div>

          {/* Model 1 & 2 Parameters */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Decision Tree max_depth:</span>
                <span className="font-mono font-bold text-blue-600">{dtMaxDepth}</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={dtMaxDepth}
                onChange={e => setDtMaxDepth(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[10.5px] text-slate-400">Controls tree depth to prevent overfitting</span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Logistic Regression C:</span>
                <span className="font-mono font-bold text-blue-600">{lrC}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={lrC}
                onChange={e => setLrC(parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[10.5px] text-slate-400">Inverse regularization parameter</span>
            </div>
          </div>

          {/* Model 3 Parameters & Scaling */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>Random Forest n_estimators:</span>
                <span className="font-mono font-bold text-blue-600">{rfEstimators}</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                step="10"
                value={rfEstimators}
                onChange={e => setRfEstimators(parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[10.5px] text-slate-400">Number of decision trees in ensemble</span>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={scaleFeatures}
                  onChange={e => setScaleFeatures(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Apply StandardScaler (Zero Mean, Unit Var)</span>
              </label>
              <p className="text-[10.5px] text-slate-400 ml-5 mt-0.5">
                Crucial for Logistic Regression convergence. Fitted strictly on train set.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleTrain}
            disabled={isTraining}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            {isTraining ? (
              <>
                <Cpu className="w-4 h-4 animate-spin" />
                <span>Training Models & Computing Metrics...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>🚀 Train All 3 Models Now</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Guaranteed zero data leakage</span>
          </div>
        </div>
      </div>

      {/* Results Comparison Table Preview */}
      {metrics && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Model Comparison Summary</span>
            </h3>
            <button
              onClick={onNavigateToEvaluation}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Go to Full Evaluation Page (Confusion Matrix, ROC) →
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Model Name</th>
                  <th className="p-3 text-right">Accuracy (%)</th>
                  <th className="p-3 text-right">Precision (%)</th>
                  <th className="p-3 text-right">Recall (%)</th>
                  <th className="p-3 text-right">F1-Score (%)</th>
                  <th className="p-3 text-right">ROC-AUC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {metrics.map(m => (
                  <tr key={m.modelName} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-sans">
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      {m.modelName}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">{m.accuracy}%</td>
                    <td className="p-3 text-right font-mono">{m.precision}%</td>
                    <td className="p-3 text-right font-mono">{m.recall}%</td>
                    <td className="p-3 text-right font-mono font-semibold text-blue-600 dark:text-blue-400">{m.f1Score}%</td>
                    <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">{m.rocAuc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-400">
            * Serialized model artifact saved to <code>models/trained_model.pkl</code> via Joblib.
          </p>
        </div>
      )}
    </div>
  );
};
