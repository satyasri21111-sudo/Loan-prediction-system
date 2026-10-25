import React, { useState } from 'react';
import { ModelMetric } from '../types';
import { CheckSquare, BarChart, HelpCircle, Layers, Award } from 'lucide-react';

interface ModelEvaluationViewProps {
  metrics: ModelMetric[] | null;
  onNavigateToTraining: () => void;
}

export const ModelEvaluationView: React.FC<ModelEvaluationViewProps> = ({
  metrics,
  onNavigateToTraining,
}) => {
  const [selectedModelIndex, setSelectedModelIndex] = useState<number>(0);

  if (!metrics || metrics.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
        <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Models Trained Yet</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please run the training pipeline first under <strong>🤖 Model Training</strong> to generate real performance metrics, confusion matrices, and ROC curves.
        </p>
        <button
          onClick={onNavigateToTraining}
          className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-500 transition-colors"
        >
          Go to Model Training
        </button>
      </div>
    );
  }

  const activeModel = metrics[selectedModelIndex] || metrics[0];
  const [tn, fp] = activeModel.confusionMatrix[0];
  const [fn, tp] = activeModel.confusionMatrix[1];
  const totalCases = tn + fp + fn + tp;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>📊 Model Evaluation & Comparison</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Module 6: Multi-metric comparison, Confusion Matrix breakdowns, ROC-AUC curves, and Feature Importance analysis.
        </p>
      </div>

      {/* Model Selection Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {metrics.map((m, idx) => (
          <button
            key={m.modelName}
            onClick={() => setSelectedModelIndex(idx)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedModelIndex === idx
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {m.modelName}
          </button>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Cross-Model Performance Benchmark Table
        </h3>

        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Model Algorithm</th>
                <th className="p-3 text-right">Accuracy (%)</th>
                <th className="p-3 text-right">Precision (%)</th>
                <th className="p-3 text-right">Recall (%)</th>
                <th className="p-3 text-right">F1-Score (%)</th>
                <th className="p-3 text-right">ROC-AUC</th>
                <th className="p-3">Model Characteristics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {metrics.map(m => (
                <tr
                  key={m.modelName}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                    m.modelName === activeModel.modelName ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                  }`}
                >
                  <td className="p-3 font-semibold text-slate-800 dark:text-slate-100 font-sans">
                    {m.modelName}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-800 dark:text-slate-100">{m.accuracy}%</td>
                  <td className="p-3 text-right font-mono">{m.precision}%</td>
                  <td className="p-3 text-right font-mono">{m.recall}%</td>
                  <td className="p-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{m.f1Score}%</td>
                  <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">{m.rocAuc}</td>
                  <td className="p-3 text-[11px] text-slate-500">
                    {m.modelName === 'Logistic Regression'
                      ? 'High recall; fast linear decision boundary'
                      : m.modelName === 'Decision Tree'
                      ? 'Interpretable rules; prone to slight variance'
                      : 'Robust ensemble; balances bias-variance'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Evaluation: Confusion Matrix & ROC Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Confusion Matrix */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Confusion Matrix: {activeModel.modelName}
            </h4>
            <span className="text-[11px] font-mono text-slate-500">N = {totalCases} Test Samples</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 font-mono text-[10px] text-slate-400 flex items-center justify-center">Actual \ Pred</div>
              <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded font-semibold text-slate-700 dark:text-slate-300">
                Pred: Rejected (0)
              </div>
              <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded font-semibold text-slate-700 dark:text-slate-300">
                Pred: Approved (1)
              </div>

              <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center">
                Actual: Rejected (0)
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded border border-blue-300 dark:border-blue-800">
                <span className="text-[10px] text-slate-500 block">True Negative (TN)</span>
                <span className="text-xl font-bold font-mono text-blue-700 dark:text-blue-300">{tn}</span>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-300 dark:border-amber-800">
                <span className="text-[10px] text-slate-500 block">False Positive (FP)</span>
                <span className="text-xl font-bold font-mono text-amber-700 dark:text-amber-300">{fp}</span>
              </div>

              <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center">
                Actual: Approved (1)
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded border border-rose-300 dark:border-rose-800">
                <span className="text-[10px] text-slate-500 block">False Negative (FN)</span>
                <span className="text-xl font-bold font-mono text-rose-700 dark:text-rose-300">{fn}</span>
              </div>
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded border border-emerald-300 dark:border-emerald-800">
                <span className="text-[10px] text-slate-500 block">True Positive (TP)</span>
                <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">{tp}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 space-y-1">
            <p>• <strong>Accuracy Formula:</strong> (TP + TN) / Total = ({tp} + {tn}) / {totalCases} = <strong>{activeModel.accuracy}%</strong></p>
            <p>• <strong>Recall Formula:</strong> TP / (TP + FN) = {tp} / ({tp} + {fn}) = <strong>{activeModel.recall}%</strong></p>
            <p>• <strong>Precision Formula:</strong> TP / (TP + FP) = {tp} / ({tp} + {fp}) = <strong>{activeModel.precision}%</strong></p>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Feature Importance: {activeModel.modelName}
            </h4>
            <span className="text-[11px] text-slate-400">Relative Gini / Coef Weight</span>
          </div>

          <div className="space-y-2 pt-2">
            {activeModel.featureImportances.map((item, idx) => {
              const maxVal = Math.max(...activeModel.featureImportances.map(f => Math.abs(f.importance)));
              const widthPct = (Math.abs(item.importance) / maxVal) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                      {item.feature}
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.importance}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded text-[11px] text-blue-800 dark:text-blue-300 mt-2">
            <strong>Viva Review Tip:</strong> Explain to examiners that <code>Credit_History</code> overwhelmingly carries highest feature importance across all three models, followed by <code>ApplicantIncome</code> and <code>LoanAmount</code>.
          </div>
        </div>
      </div>
    </div>
  );
};
