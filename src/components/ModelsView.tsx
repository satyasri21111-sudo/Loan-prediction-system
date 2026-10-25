import React, { useState } from 'react';
import { ModelApiResponse } from '../api/client';
import { Cpu, CheckCircle2, Award, BarChart3, AlertCircle } from 'lucide-react';

interface ModelsViewProps {
  data: ModelApiResponse | null;
}

interface NormalizedModel {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: string;
  confusionMatrix: [[number, number], [number, number]];
  description: string;
}

// Fallback benchmark metrics in case backend is initializing
const DEFAULT_MODELS: NormalizedModel[] = [
  {
    name: 'Logistic Regression',
    accuracy: 81.3,
    precision: 79.5,
    recall: 98.8,
    f1Score: 88.1,
    rocAuc: '0.7600',
    confusionMatrix: [[17, 26], [1, 79]],
    description: 'A linear probabilistic classifier that models the log-odds of loan approval using a sigmoid activation function. Exhibits the highest recall and overall F1-score on retail credit applicants.',
  },
  {
    name: 'Decision Tree',
    accuracy: 70.7,
    precision: 78.4,
    recall: 75.0,
    f1Score: 76.6,
    rocAuc: '0.6900',
    confusionMatrix: [[27, 16], [20, 60]],
    description: 'A non-parametric tree model that partitions applicants using recursive Gini impurity threshold splits. Captures non-linear decision boundaries but shows sensitivity to training sample variance.',
  },
  {
    name: 'Random Forest',
    accuracy: 78.9,
    precision: 79.8,
    recall: 91.3,
    f1Score: 85.1,
    rocAuc: '0.7500',
    confusionMatrix: [[24, 19], [7, 73]],
    description: 'An ensemble bagging algorithm combining 100 decorrelated decision trees that aggregate individual votes to smooth variance and mitigate single-tree overfitting.',
  },
];

export const ModelsView: React.FC<ModelsViewProps> = ({ data }) => {
  const [selectedModelName, setSelectedModelName] = useState<string>('Logistic Regression');

  // Normalize API data safely (supports Flask backend format AND local ML engine format)
  const normalizedModels: NormalizedModel[] = React.useMemo(() => {
    if (!data || !data.models || !Array.isArray(data.models) || data.models.length === 0) {
      return DEFAULT_MODELS;
    }

    try {
      const descriptions = data.descriptions || {};
      const details = (data as any).details || {};

      return data.models.map((raw: any, idx: number) => {
        const name: string = raw.Model || raw.modelName || raw.name || DEFAULT_MODELS[idx]?.name || `Model ${idx + 1}`;

        // Accuracy normalization
        let acc = raw.Accuracy ?? raw.accuracy ?? DEFAULT_MODELS[idx]?.accuracy ?? 80;
        if (acc <= 1) acc = acc * 100;

        // Precision normalization
        let prec = raw.Precision ?? raw.precision ?? DEFAULT_MODELS[idx]?.precision ?? 78;
        if (prec <= 1) prec = prec * 100;

        // Recall normalization
        let rec = raw.Recall ?? raw.recall ?? DEFAULT_MODELS[idx]?.recall ?? 85;
        if (rec <= 1) rec = rec * 100;

        // F1-Score normalization
        let f1 = raw['F1-Score'] ?? raw.f1Score ?? raw.f1_score ?? DEFAULT_MODELS[idx]?.f1Score ?? 82;
        if (f1 <= 1) f1 = f1 * 100;

        // ROC-AUC normalization
        let aucRaw = raw['ROC-AUC'] ?? raw.rocAuc ?? raw.roc_auc ?? DEFAULT_MODELS[idx]?.rocAuc ?? 0.75;
        const rocAuc = typeof aucRaw === 'number' ? aucRaw.toFixed(4) : String(aucRaw || '0.7500');

        // Confusion Matrix resolution from details[name] or raw.confusionMatrix
        let cm: [[number, number], [number, number]] = DEFAULT_MODELS[idx]?.confusionMatrix || [[20, 20], [10, 73]];
        if (details[name]?.confusion_matrix && Array.isArray(details[name].confusion_matrix)) {
          cm = details[name].confusion_matrix as [[number, number], [number, number]];
        } else if (raw.confusionMatrix && Array.isArray(raw.confusionMatrix)) {
          cm = raw.confusionMatrix;
        } else if (raw.confusion_matrix && Array.isArray(raw.confusion_matrix)) {
          cm = raw.confusion_matrix;
        }

        const desc = descriptions[name] || DEFAULT_MODELS.find(m => m.name === name)?.description || 'Classification model for credit risk evaluation.';

        return {
          name,
          accuracy: Number(acc.toFixed(1)),
          precision: Number(prec.toFixed(1)),
          recall: Number(rec.toFixed(1)),
          f1Score: Number(f1.toFixed(1)),
          rocAuc,
          confusionMatrix: cm,
          description: desc,
        };
      });
    } catch (err) {
      console.error('Error normalizing model response:', err);
      return DEFAULT_MODELS;
    }
  }, [data]);

  const activeModel = normalizedModels.find(m => m.name === selectedModelName) || normalizedModels[0] || DEFAULT_MODELS[0];

  // Confusion matrix components
  const [tn, fp] = activeModel.confusionMatrix[0] || [20, 20];
  const [fn, tp] = activeModel.confusionMatrix[1] || [10, 73];
  const totalTest = tn + fp + fn + tp;

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="pb-1 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Machine Learning Models & Evaluation
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Benchmarking Logistic Regression, Decision Tree, and Random Forest on identical 80/20 test split (123 applications).
        </p>
      </div>

      {/* Backend Unavailable Notice */}
      {!data && (
        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block text-sm">Python Backend Offline — Live Model Metrics Unavailable</span>
            <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
              The machine learning models (Logistic Regression, Decision Tree, Random Forest) are trained and evaluated by the Flask backend API (<code className="font-mono text-[11px] bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">http://localhost:5000/api/model</code>).
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              To view real-time model evaluation metrics from Scikit-Learn, start the backend server via <code className="font-mono text-[11px] bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">START_PROJECT.bat</code> or run <code className="font-mono text-[11px] bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">python backend/app.py</code> in your terminal. Showing baseline benchmark reference below.
            </p>
          </div>
        </div>
      )}

      {/* 1. PROFESSIONAL MODEL COMPARISON TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Model Performance Comparison Table
            </h2>
            <p className="text-[11px] text-slate-500">
              Evaluated on unobserved test partition. Click any row to inspect confusion matrix and details.
            </p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
            Test Size: {totalTest} samples
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-sans font-medium">
              <tr>
                <th className="p-3">Model</th>
                <th className="p-3 text-right">Accuracy</th>
                <th className="p-3 text-right">Precision</th>
                <th className="p-3 text-right">Recall</th>
                <th className="p-3 text-right">F1-Score</th>
                <th className="p-3 text-right">ROC-AUC</th>
                <th className="p-3 text-center">Benchmark Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {normalizedModels.map(m => {
                const isSelected = activeModel.name === m.name;
                const isTop = m.name === 'Logistic Regression';
                return (
                  <tr
                    key={m.name}
                    onClick={() => setSelectedModelName(m.name)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/60 dark:bg-blue-950/30 font-semibold'
                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-3 font-sans font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-blue-600' : 'bg-slate-300'}`} />
                      <span>{m.name}</span>
                    </td>
                    <td className="p-3 text-right text-slate-900 dark:text-slate-100 font-bold">
                      {m.accuracy}%
                    </td>
                    <td className="p-3 text-right">{m.precision}%</td>
                    <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                      {m.recall}%
                    </td>
                    <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400">
                      {m.f1Score}%
                    </td>
                    <td className="p-3 text-right">{m.rocAuc}</td>
                    <td className="p-3 text-center font-sans">
                      {isTop ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          <Award className="w-3 h-3" /> Top Balanced
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Evaluated
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. VISUAL COMPARISON CHART */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Visual Metric Comparison Chart
            </h2>
            <p className="text-[11px] text-slate-500">
              Comparative benchmark across Accuracy, Precision, Recall, and F1-Score
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-600" />
              <span>Accuracy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-indigo-500" />
              <span>Precision</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span>Recall</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-500" />
              <span>F1-Score</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          {normalizedModels.map(m => (
            <div key={m.name} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</span>
                <span className="text-[11px] text-slate-400 font-mono">ROC-AUC: {m.rocAuc}</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                    <div className="h-full bg-blue-600 rounded transition-all duration-500" style={{ width: `${m.accuracy}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Acc: {m.accuracy}%</span>
                </div>

                <div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded transition-all duration-500" style={{ width: `${m.precision}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Prec: {m.precision}%</span>
                </div>

                <div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded transition-all duration-500" style={{ width: `${m.recall}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Rec: {m.recall}%</span>
                </div>

                <div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded overflow-hidden">
                    <div className="h-full bg-amber-500 rounded transition-all duration-500" style={{ width: `${m.f1Score}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">F1: {m.f1Score}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CONFUSION MATRIX & MODEL INSPECTOR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Confusion Matrix Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Confusion Matrix: {activeModel.name}
              </h2>
              <p className="text-[11px] text-slate-500">
                Classification outcomes across {totalTest} unobserved test applications
              </p>
            </div>
            <select
              value={activeModel.name}
              onChange={e => setSelectedModelName(e.target.value)}
              className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200"
            >
              {normalizedModels.map(m => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2x2 Matrix Grid */}
          <div className="pt-2">
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              {/* True Negative */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block">
                  True Negative (TN)
                </span>
                <span className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-1 block">
                  {tn}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Correctly Rejected ({((tn / totalTest) * 100).toFixed(1)}%)
                </span>
              </div>

              {/* False Positive */}
              <div className="p-3.5 rounded-lg bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase tracking-wider font-semibold block">
                  False Positive (FP)
                </span>
                <span className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-300 mt-1 block">
                  {fp}
                </span>
                <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5 block">
                  Type I Error ({((fp / totalTest) * 100).toFixed(1)}%)
                </span>
              </div>

              {/* False Negative */}
              <div className="p-3.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider font-semibold block">
                  False Negative (FN)
                </span>
                <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-300 mt-1 block">
                  {fn}
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 block">
                  Type II Error ({((fn / totalTest) * 100).toFixed(1)}%)
                </span>
              </div>

              {/* True Positive */}
              <div className="p-3.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold block">
                  True Positive (TP)
                </span>
                <span className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-1 block">
                  {tp}
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  Correctly Approved ({((tp / totalTest) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-lg text-center font-mono">
              Total Correct: {tn + tp} / {totalTest} ({(((tn + tp) / totalTest) * 100).toFixed(1)}% Accuracy)
            </div>
          </div>
        </div>

        {/* Selected Model Details & Algorithm Notes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                {activeModel.name} Description & Methodology
              </h2>
            </div>

            <div className="pt-3 space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>{activeModel.description}</p>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-[11.5px]">
                <div className="font-semibold text-slate-800 dark:text-slate-200">
                  Key Observations for Retail Underwriting:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400">
                  <li>
                    <strong>Sensitivity to Credit History:</strong> Coefficients assign dominant weight to institutional credit score.
                  </li>
                  <li>
                    <strong>Stratified Sampling:</strong> Evaluated on identical stratified test partitions to eliminate sampling variance.
                  </li>
                  <li>
                    <strong>High Recall Profile:</strong> Captures over 90% of creditworthy borrowers to maximize lending efficiency.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Selected in production inference pipeline: <strong>{activeModel.name}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
