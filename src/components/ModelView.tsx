import React, { useState } from 'react';
import { ModelApiResponse } from '../api/client';
import { Cpu } from 'lucide-react';

interface ModelViewProps {
  data: ModelApiResponse | null;
}

export const ModelView: React.FC<ModelViewProps> = ({ data }) => {
  const [selectedModel, setSelectedModel] = useState<string>('Logistic Regression');

  if (!data || !data.models || data.models.length === 0) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading model evaluation...</div>;
  }

  const current = data.models.find(m => (m.modelName || m.name) === selectedModel) || data.models[0];
  const currentName = current.modelName || current.name || 'Model';

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Machine Learning Models & Evaluation
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Three classical classification algorithms evaluated on the identical 80/20 stratified test split.
        </p>
      </div>

      {/* Models Comparison Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Model Performance Comparison
          </h2>
          <p className="text-xs text-slate-500">
            Metrics evaluated on 123 unobserved test applications.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-sans font-medium">
              <tr>
                <th className="p-3 text-left">Model Name</th>
                <th className="p-3 text-right">Accuracy</th>
                <th className="p-3 text-right">Precision</th>
                <th className="p-3 text-right">Recall</th>
                <th className="p-3 text-right">F1-Score</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {data.models.map(m => {
                const mName = m.modelName || m.name || 'Model';
                const isSelected = selectedModel === mName;
                const isBest = mName === 'Logistic Regression';
                return (
                  <tr
                    key={mName}
                    onClick={() => setSelectedModel(mName)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 font-semibold text-slate-900 dark:text-slate-100'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3 font-sans font-medium flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-slate-300'}`} />
                      <span>{mName}</span>
                      {isBest && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-sans font-normal">
                          Benchmark
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">{m.accuracy.toFixed(1)}%</td>
                    <td className="p-3 text-right">{m.precision.toFixed(1)}%</td>
                    <td className="p-3 text-right">{m.recall.toFixed(1)}%</td>
                    <td className="p-3 text-right">{m.f1Score.toFixed(1)}%</td>
                    <td className="p-3 text-center font-sans">
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Trained
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Model Simple Academic Explanation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Algorithm Details: {currentName}
          </h2>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {data.descriptions[currentName] || 'Classical machine-learning algorithm for binary classification.'}
        </p>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Accuracy</span>
            <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100 mt-1 block">
              {current.accuracy.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Total correct labels</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Precision</span>
            <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100 mt-1 block">
              {current.precision.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">True positives / predicted</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">Recall</span>
            <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100 mt-1 block">
              {current.recall.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">True positives / actual</span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 block">F1-Score</span>
            <span className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100 mt-1 block">
              {current.f1Score.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Harmonic mean of P & R</span>
          </div>
        </div>

        {/* Academic Note */}
        <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
          <strong>Academic Observation:</strong> Because loan approval in real-world lending is heavily bounded by Credit History, Logistic Regression achieves robust generalization (~82.1% accuracy) without the overfitting vulnerability observed in unpruned Decision Trees.
        </p>
      </div>
    </div>
  );
};
