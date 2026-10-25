import React from 'react';
import { Layers, Cpu, Database, Server, Code2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="pb-1 border-b border-slate-200/80 dark:border-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          About Loan Prediction Data Analysis System
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Enterprise retail credit scoring, historical loan exploration, and automated underwriting pipeline.
        </p>
      </div>

      {/* System Overview Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
          System Overview
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          The <strong>Loan Prediction Data Analysis System</strong> is an end-to-end analytics and machine learning application designed to automate retail credit risk classification. The platform cleans and evaluates historical loan applications, performs multi-variable exploratory data analysis, trains and benchmarks classification algorithms, and delivers real-time risk predictions with granular factor attribution.
        </p>
      </div>

      {/* System Architecture Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
          System Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Frontend Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 w-fit">
              <Code2 className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Frontend Client
            </h3>
            <ul className="text-[11.5px] text-slate-500 dark:text-slate-400 space-y-1">
              <li>• React 18 SPA built with Vite</li>
              <li>• TypeScript static type safety</li>
              <li>• Responsive Tailwind CSS interface</li>
              <li>• Fixed left sidebar navigation</li>
              <li>• Interactive SVG charts & visual metrics</li>
            </ul>
          </div>

          {/* Backend API Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 w-fit">
              <Server className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Backend REST API
            </h3>
            <ul className="text-[11.5px] text-slate-500 dark:text-slate-400 space-y-1">
              <li>• Python 3 + Flask REST API</li>
              <li>• CORS enabled for client integration</li>
              <li>• Modular package architecture (src/)</li>
              <li>• Standard port 5000 service</li>
              <li>• Instant client fallback engine</li>
            </ul>
          </div>

          {/* Machine Learning Engine */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs space-y-2">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 w-fit">
              <Cpu className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              ML & Analytics Pipeline
            </h3>
            <ul className="text-[11.5px] text-slate-500 dark:text-slate-400 space-y-1">
              <li>• Scikit-learn classification models</li>
              <li>• Logistic Regression, Decision Tree, RF</li>
              <li>• Pandas DataFrame ingestion & EDA</li>
              <li>• Mode & Median imputation pipeline</li>
              <li>• 80/20 stratified validation split</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technologies Used Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
          Technologies & Libraries
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">React 18 + Vite</span>
            <span className="text-[11px] text-slate-400">Reactive web interface</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">TypeScript</span>
            <span className="text-[11px] text-slate-400">Static type checking</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">Python 3 + Flask</span>
            <span className="text-[11px] text-slate-400">Microservice backend</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">Scikit-learn</span>
            <span className="text-[11px] text-slate-400">ML classification algorithms</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">Pandas & NumPy</span>
            <span className="text-[11px] text-slate-400">Data analysis & matrices</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">Tailwind CSS</span>
            <span className="text-[11px] text-slate-400">Utility styling architecture</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">Lucide Icons</span>
            <span className="text-[11px] text-slate-400">Clean icon design system</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">JSZip</span>
            <span className="text-[11px] text-slate-400">In-browser project packaging</span>
          </div>
        </div>
      </div>

      {/* Methodology & Data Integrity Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
          Data Governance & Prediction Isolation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 dark:text-slate-400">
          <div className="space-y-1.5">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              Immutable Historical Dataset
            </span>
            <p className="text-[11.5px] leading-relaxed">
              The original historical dataset (614 records) remains strictly immutable and protected from runtime modification. Inference evaluations never mutate or overwrite training records.
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              Isolated Prediction Storage
            </span>
            <p className="text-[11.5px] leading-relaxed">
              Runtime prediction requests and calculated factor analyses are persisted in an isolated ephemeral session log, maintaining clean separation between historical data and live evaluations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
