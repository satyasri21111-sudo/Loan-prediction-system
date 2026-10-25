# Loan Prediction Data Analysis System

A comprehensive web application combining a Python Flask REST API backend with a high-performance React + Vite frontend for retail credit scoring and loan eligibility analytics.

---

## 1. System Architecture

```
project-root/
│
├── backend/
│   ├── app.py                 # Flask REST API server (port 5000)
│   ├── requirements.txt       # Python package dependencies
│   ├── data/
│   │   └── loan_dataset.csv   # Historical applicant records (614 rows)
│   └── src/
│       ├── data_cleaning.py   # Mode / Median imputation & duplicate audits
│       ├── preprocessing.py   # One-hot encoding & StandardScaler
│       ├── eda.py             # Statistical distributions & aggregations
│       ├── model_training.py  # Logistic Regression, Decision Tree, Random Forest
│       ├── evaluation.py      # Accuracy, Precision, Recall, F1 metrics
│       └── prediction.py      # Scikit-learn inference pipeline
│
├── src/                       # React frontend source code
│   ├── api/
│   │   └── client.ts          # REST client communicating with localhost:5000
│   ├── components/            # Sidebar, Dashboard, Dataset, Models, Prediction
│   └── data/                  # Embedded dataset representation
│
├── package.json               # Node.js project manifest & scripts
├── package-lock.json          # Deterministic dependency lockfile
├── vite.config.ts             # Vite build & dev server config (port 3000)
├── index.html                 # Frontend HTML entry point
└── README.md
```

---

## 2. Requirements

- **Operating System:** Windows 10 / 11, macOS, or Linux
- **Python:** Python 3.10+ (ensure Python is added to your PATH)
- **Node.js:** Node.js 18+ LTS
- **npm:** Included with Node.js

---

## 3. How to Run Locally (Manual Startup)

To start the full system, run the backend and frontend in separate terminal windows:

### Terminal 1: Python Flask Backend (Port 5000)
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS / Linux:
source .venv/bin/activate

pip install -r requirements.txt
python app.py
```
Backend API will start on: **http://localhost:5000/**

### Terminal 2: React + Vite Frontend (Port 3000)
```bash
npm install
npm run dev
```
Frontend web application will start on: **http://localhost:3000/**

---

## 4. REST API Endpoints

The Flask backend provides five REST endpoints:

- `GET  /api/health`    : Connectivity health check.
- `GET  /api/dataset`   : Dataset metadata, missing value statistics, and preview records.
- `GET  /api/analysis`  : Aggregated distributions for credit history, property area, and income bins.
- `GET  /api/model`     : Machine learning model benchmark metrics (Logistic Regression, Decision Tree, Random Forest).
- `POST /api/predict`   : Inference pipeline for evaluating new applicant loan eligibility.

---

## 5. Currency Standard

All monetary figures, applicant income brackets, and loan amounts are standardized in **Indian Rupees (₹)**:
- Income Brackets: `<₹2.5k`, `₹2.5k–₹5k`, `₹5k–₹7.5k`, `₹7.5k–₹10k`, `>₹10k`
- Loan Principal: `<₹75k`, `₹75k–₹120k`, `₹120k–₹160k`, `₹160k–₹220k`, `>₹220k`
- Estimated Monthly Installment (EMI) computed in ₹/month
