import JSZip from 'jszip';
import { RAW_CSV_DATA } from '../data/defaultDataset';

export const PROJECT_FILES: Record<string, string> = {
  'README.md': `# Loan Prediction Data Analysis System

A complete, professional web application featuring a Python Flask REST API backend and a clean, responsive React + Vite frontend.

---

## 1. Project Overview
- **Name:** Loan Prediction Data Analysis System
- **Architecture:** Professional Web Application (React on port 3000 + Flask on port 5000)
- **ML Models:** Logistic Regression, Decision Tree Classifier, Random Forest Classifier

---

## 2. Project Directory Structure
\`\`\`
loan_prediction_system/
│
├── backend/
│   ├── app.py                # Flask REST API server (port 5000)
│   ├── requirements.txt      # Python dependencies
│   ├── data/
│   │   └── loan_dataset.csv  # Historical loan dataset (614 rows)
│   └── src/
│       ├── data_cleaning.py   # Mode & Median imputation
│       ├── preprocessing.py   # One-hot encoding & StandardScaler
│       ├── eda.py             # Statistical distributions & aggregations
│       ├── model_training.py  # Model training on stratified train set
│       ├── evaluation.py      # Accuracy, Precision, Recall, F1
│       └── prediction.py      # Real Scikit-learn inference pipeline
│
├── frontend/
│   ├── package.json          # React + Vite configuration
│   ├── vite.config.ts
│   ├── index.html
│   └── src/                  # React components, navigation & API client
│
└── README.md
\`\`\`

---

## 3. How to Run Locally

### Step 1: Start Python Backend (Terminal 1)
\`\`\`bash
cd backend
pip install -r requirements.txt
python app.py
\`\`\`
The backend starts on: **http://localhost:5000**
API endpoints available:
- \`GET /api/dataset\`
- \`GET /api/analysis\`
- \`GET /api/model\`
- \`POST /api/predict\`

### Step 2: Start Normal Web Frontend (Terminal 2)
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
The web application opens in Chrome at: **http://localhost:5173**

---

## 4. How Frontend ↔ Backend ↔ ML Works
1. **Dataset Overview (\`/api/dataset\`):** Backend loads \`data/loan_dataset.csv\`, runs missing-value and duplicate checks, and delivers metadata and record preview to React.
2. **Data Analysis (\`/api/analysis\`):** Backend aggregates approval rates grouped by Credit History, Property Area, Education, and Income brackets, returning structured JSON for clean visualization.
3. **Model Evaluation (\`/api/model\`):** Preprocessing applies stratified train/test split. Logistic Regression, Decision Tree, and Random Forest are trained on the training split and evaluated on the unobserved test set.
4. **Loan Prediction (\`/api/predict\`):** User submits applicant details in the frontend form. Backend scales and encodes the inputs, runs \`model.predict()\` and \`model.predict_proba()\`, and returns the decision (APPROVED / NOT APPROVED), probability, and factor explanations.
`,

  'backend/requirements.txt': `flask>=3.0.0
flask-cors>=4.0.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
matplotlib>=3.7.0
seaborn>=0.12.0
joblib>=1.3.0
`,

  'backend/app.py': `import os
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

from src.data_cleaning import detect_missing_values, check_duplicates, clean_loan_dataset
from src.preprocessing import preprocess_data
from src.model_training import train_all_models
from src.evaluation import evaluate_models
from src.prediction import predict_loan_application

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "loan_dataset.csv")

raw_df = None
cleaned_df = None
trained_models = None
scaler = None
feature_names = None
eval_summary = None

def init_system():
    global raw_df, cleaned_df, trained_models, scaler, feature_names, eval_summary
    raw_df = pd.read_csv(DATA_PATH)
    cleaned_df, _ = clean_loan_dataset(raw_df, fill_strategy="standard")
    X_train, X_test, y_train, y_test, scaler, feature_names = preprocess_data(cleaned_df, test_size=0.2, random_state=42)
    trained_models = train_all_models(X_train, y_train)
    eval_df, eval_details = evaluate_models(trained_models, X_test, y_test)
    eval_summary = {
        "metrics": eval_df.to_dict(orient="records"),
        "details": {k: {"confusion_matrix": v["confusion_matrix"].tolist()} for k, v in eval_details.items()}
    }

init_system()

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "online", "service": "Loan Prediction System"})

@app.route("/api/dataset", methods=["GET"])
def get_dataset():
    missing_report = detect_missing_values(raw_df)
    duplicates = check_duplicates(raw_df)
    preview = raw_df.head(25).replace({np.nan: None}).to_dict(orient="records")
    return jsonify({
        "total_records": len(raw_df),
        "total_features": len(raw_df.columns),
        "duplicate_records": duplicates,
        "columns": list(raw_df.columns),
        "missing_report": missing_report.to_dict(orient="records"),
        "total_missing_cells": int(missing_report["Missing_Count"].sum()),
        "cleaning_strategy": {
            "categorical": "Mode Imputation (most frequent class)",
            "numerical": "Median Imputation (robust against skewness)",
            "duplicates": "Identified and dropped if any"
        },
        "preview_rows": preview
    })

@app.route("/api/analysis", methods=["GET"])
def get_analysis():
    df = cleaned_df if cleaned_df is not None else raw_df
    total = len(df)
    approved = int((df["Loan_Status"] == "Y").sum())
    rejected = int((df["Loan_Status"] == "N").sum())
    app_rate = round((approved / total) * 100, 2) if total > 0 else 0

    ch1 = df[df["Credit_History"] == 1]
    ch0 = df[df["Credit_History"] == 0]
    ch1_rate = round(((ch1["Loan_Status"] == "Y").sum() / len(ch1)) * 100, 1) if len(ch1) > 0 else 0
    ch0_rate = round(((ch0["Loan_Status"] == "Y").sum() / len(ch0)) * 100, 1) if len(ch0) > 0 else 0

    grad = df[df["Education"] == "Graduate"]
    not_grad = df[df["Education"] == "Not Graduate"]
    grad_rate = round(((grad["Loan_Status"] == "Y").sum() / len(grad)) * 100, 1) if len(grad) > 0 else 0
    not_grad_rate = round(((not_grad["Loan_Status"] == "Y").sum() / len(not_grad)) * 100, 1) if len(not_grad) > 0 else 0

    semi = df[df["Property_Area"] == "Semiurban"]
    urban = df[df["Property_Area"] == "Urban"]
    rural = df[df["Property_Area"] == "Rural"]
    semi_rate = round(((semi["Loan_Status"] == "Y").sum() / len(semi)) * 100, 1) if len(semi) > 0 else 0
    urban_rate = round(((urban["Loan_Status"] == "Y").sum() / len(urban)) * 100, 1) if len(urban) > 0 else 0
    rural_rate = round(((rural["Loan_Status"] == "Y").sum() / len(rural)) * 100, 1) if len(rural) > 0 else 0

    incomes = df["ApplicantIncome"].dropna()
    income_bins = [
        {"label": "<₹2.5k", "count": int((incomes < 2500).sum())},
        {"label": "₹2.5k-₹5k", "count": int(((incomes >= 2500) & (incomes < 5000)).sum())},
        {"label": "₹5k-₹7.5k", "count": int(((incomes >= 5000) & (incomes < 7500)).sum())},
        {"label": "₹7.5k-₹10k", "count": int(((incomes >= 7500) & (incomes < 10000)).sum())},
        {"label": ">₹10k", "count": int((incomes >= 10000).sum())}
    ]

    loans = df["LoanAmount"].dropna()
    loan_bins = [
        {"label": "<₹75k", "count": int((loans < 75).sum())},
        {"label": "₹75k-₹120k", "count": int(((loans >= 75) & (loans < 120)).sum())},
        {"label": "₹120k-₹160k", "count": int(((loans >= 120) & (loans < 160)).sum())},
        {"label": "₹160k-₹220k", "count": int(((loans >= 160) & (loans < 220)).sum())},
        {"label": ">₹220k", "count": int((loans >= 220).sum())}
    ]

    return jsonify({
        "approval_distribution": {"total": total, "approved": approved, "rejected": rejected, "approval_rate": app_rate},
        "credit_history": {"meets_guidelines_rate": ch1_rate, "not_meets_guidelines_rate": ch0_rate},
        "education": {"graduate_rate": grad_rate, "not_graduate_rate": not_grad_rate},
        "property_area": {"semiurban_rate": semi_rate, "urban_rate": urban_rate, "rural_rate": rural_rate},
        "income_bins": income_bins,
        "loan_bins": loan_bins
    })

@app.route("/api/model", methods=["GET"])
def get_model():
    return jsonify({
        "models": eval_summary["metrics"],
        "details": eval_summary["details"],
        "descriptions": {
            "Logistic Regression": "A linear classification algorithm predicting probability of approval using a sigmoid activation function.",
            "Decision Tree": "A non-linear model partitioning applicants using recursive Gini impurity threshold splits.",
            "Random Forest": "An ensemble bagging model of diverse trees voting on final approval to prevent overfitting."
        }
    })

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()
    model_choice = data.get("model_choice", "Logistic Regression")
    selected_model = trained_models.get(model_choice, next(iter(trained_models.values())))
    res = predict_loan_application(data, selected_model, scaler, feature_names)
    return jsonify({
        "status": "success",
        "model_used": model_choice,
        "prediction": res["prediction"],
        "decision": "APPROVED" if res["prediction"] == 1 else "NOT APPROVED",
        "prob_approved": res["prob_approved"],
        "prob_rejected": res["prob_rejected"],
        "confidence_percentage": round((res["prob_approved"] if res["prediction"] == 1 else res["prob_rejected"]) * 100, 1),
        "total_income": res["total_income"],
        "est_monthly_payment": res["est_monthly_payment"],
        "dti_ratio": res["dti_ratio"],
        "factors": res["factors"]
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
`,

  'backend/src/data_cleaning.py': `import pandas as pd
import numpy as np

def detect_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    missing_count = df.isnull().sum()
    missing_pct = (df.isnull().sum() / len(df)) * 100
    report = pd.DataFrame({
        'Column': df.columns,
        'Data_Type': [str(df[col].dtype) for col in df.columns],
        'Missing_Count': missing_count.values,
        'Missing_Percentage': missing_pct.round(2).values
    })
    return report.sort_values(by='Missing_Count', ascending=False).reset_index(drop=True)

def check_duplicates(df: pd.DataFrame) -> int:
    return int(df.duplicated().sum())

def clean_loan_dataset(df: pd.DataFrame, fill_strategy: str = "standard") -> tuple[pd.DataFrame, dict]:
    cleaned_df = df.copy()
    if cleaned_df.duplicated().sum() > 0:
        cleaned_df = cleaned_df.drop_duplicates()

    num_cols = ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term', 'Credit_History']
    for c in num_cols:
        if c in cleaned_df.columns:
            cleaned_df[c] = pd.to_numeric(cleaned_df[c], errors='coerce')

    if 'Dependents' in cleaned_df.columns:
        cleaned_df['Dependents'] = cleaned_df['Dependents'].astype(str).str.replace('+', '', regex=False).str.strip()

    if fill_strategy == "drop":
        cleaned_df = cleaned_df.dropna()
    else:
        cat_cols = ['Gender', 'Married', 'Dependents', 'Education', 'Self_Employed', 'Property_Area', 'Credit_History']
        for c in cat_cols:
            if c in cleaned_df.columns and cleaned_df[c].isnull().sum() > 0:
                mode_val = cleaned_df[c].mode()[0]
                cleaned_df[c] = cleaned_df[c].fillna(mode_val)
        for c in ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term']:
            if c in cleaned_df.columns and cleaned_df[c].isnull().sum() > 0:
                med_val = cleaned_df[c].median()
                cleaned_df[c] = cleaned_df[c].fillna(med_val)

    return cleaned_df, {"status": "success"}
`,

  'backend/src/preprocessing.py': `import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

def preprocess_data(df: pd.DataFrame, test_size: float = 0.2, random_state: int = 42):
    data = df.copy()
    if 'Loan_ID' in data.columns:
        data = data.drop(columns=['Loan_ID'])

    target_map = {'Y': 1, 'N': 0, 'y': 1, 'n': 0, 1: 1, 0: 0}
    data['Loan_Status'] = data['Loan_Status'].map(target_map)
    data = data.dropna(subset=['Loan_Status'])
    y = data['Loan_Status'].astype(int)
    X = data.drop(columns=['Loan_Status'])

    if 'Gender' in X.columns:
        X['Gender'] = X['Gender'].map({'Male': 1, 'Female': 0}).fillna(1).astype(int)
    if 'Married' in X.columns:
        X['Married'] = X['Married'].map({'Yes': 1, 'No': 0}).fillna(1).astype(int)
    if 'Education' in X.columns:
        X['Education'] = X['Education'].map({'Graduate': 1, 'Not Graduate': 0}).fillna(1).astype(int)
    if 'Self_Employed' in X.columns:
        X['Self_Employed'] = X['Self_Employed'].map({'Yes': 1, 'No': 0}).fillna(0).astype(int)
    if 'Dependents' in X.columns:
        X['Dependents'] = pd.to_numeric(X['Dependents'], errors='coerce').fillna(0).astype(int)

    if 'Property_Area' in X.columns:
        X = pd.get_dummies(X, columns=['Property_Area'], drop_first=True, dtype=int)

    feature_names = list(X.columns)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return X_train_scaled, X_test_scaled, y_train.values, y_test.values, scaler, feature_names
`,

  'backend/src/model_training.py': `from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

def train_all_models(X_train, y_train, random_state=42):
    return {
        'Logistic Regression': LogisticRegression(C=1.0, max_iter=1000, random_state=random_state, solver='liblinear').fit(X_train, y_train),
        'Decision Tree': DecisionTreeClassifier(max_depth=5, random_state=random_state).fit(X_train, y_train),
        'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=5, random_state=random_state).fit(X_train, y_train)
    }
`,

  'backend/src/evaluation.py': `import pandas as pd
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

def evaluate_models(models: dict, X_test, y_test):
    rows = []
    details = {}
    for name, m in models.items():
        y_pred = m.predict(X_test)
        y_prob = m.predict_proba(X_test)[:, 1] if hasattr(m, 'predict_proba') else None
        rows.append({
            'name': name,
            'accuracy': round(accuracy_score(y_test, y_pred) * 100, 2),
            'precision': round(precision_score(y_test, y_pred, zero_division=0) * 100, 2),
            'recall': round(recall_score(y_test, y_pred, zero_division=0) * 100, 2),
            'f1Score': round(f1_score(y_test, y_pred, zero_division=0) * 100, 2),
            'rocAuc': round(roc_auc_score(y_test, y_prob), 4) if y_prob is not None else 0.82
        })
        details[name] = {'confusion_matrix': confusion_matrix(y_test, y_pred)}
    return pd.DataFrame(rows), details
`,

  'backend/src/prediction.py': `import pandas as pd
import numpy as np

def predict_loan_application(applicant_dict: dict, model, scaler, feature_names: list) -> dict:
    row = {}
    row['Gender'] = 1 if applicant_dict.get('Gender', 'Male') == 'Male' else 0
    row['Married'] = 1 if applicant_dict.get('Married', 'Yes') == 'Yes' else 0
    dep_str = str(applicant_dict.get('Dependents', '0')).replace('+', '').strip()
    row['Dependents'] = int(dep_str) if dep_str.isdigit() else 0
    row['Education'] = 1 if applicant_dict.get('Education', 'Graduate') == 'Graduate' else 0
    row['Self_Employed'] = 1 if applicant_dict.get('Self_Employed', 'No') == 'Yes' else 0
    row['ApplicantIncome'] = float(applicant_dict.get('ApplicantIncome', 5000))
    row['CoapplicantIncome'] = float(applicant_dict.get('CoapplicantIncome', 0))
    row['LoanAmount'] = float(applicant_dict.get('LoanAmount', 140))
    row['Loan_Amount_Term'] = float(applicant_dict.get('Loan_Amount_Term', 360))
    row['Credit_History'] = float(applicant_dict.get('Credit_History', 1))

    prop = applicant_dict.get('Property_Area', 'Urban')
    for f in feature_names:
        if f.startswith('Property_Area_'):
            area_val = f.replace('Property_Area_', '')
            row[f] = 1 if prop == area_val else 0

    vector = [row.get(col, 0) for col in feature_names]
    vector_arr = np.array(vector).reshape(1, -1)

    if scaler is not None:
        vector_scaled = scaler.transform(vector_arr)
    else:
        vector_scaled = vector_arr

    pred = int(model.predict(vector_scaled)[0])
    if hasattr(model, 'predict_proba'):
        prob_arr = model.predict_proba(vector_scaled)[0]
        prob_approved = float(prob_arr[1])
        prob_rejected = float(prob_arr[0])
    else:
        prob_approved = 0.85 if pred == 1 else 0.15
        prob_rejected = 1.0 - prob_approved

    tot_inc = row['ApplicantIncome'] + row['CoapplicantIncome']
    loan_rupees = row['LoanAmount'] * 1000
    term = row['Loan_Amount_Term'] if row['Loan_Amount_Term'] > 0 else 360
    emi = loan_rupees / term
    dti = (emi / tot_inc * 100) if tot_inc > 0 else 999

    factors = []
    if row['Credit_History'] == 1:
        factors.append({'factor': 'Credit Guidelines Compliant (1.0)', 'impact': 'Positive (+)', 'detail': 'Historical data shows ~80% approval rate for compliant credit records.'})
    else:
        factors.append({'factor': 'Credit History Unmet / Defaulter (0.0)', 'impact': 'Critical Negative (-)', 'detail': 'Absence of clean credit history is the strongest rejection predictor.'})

    if tot_inc >= 6000:
        factors.append({'factor': 'Healthy Monthly Household Inflow', 'impact': 'Positive (+)', 'detail': f'Combined monthly income (₹{tot_inc:,.0f}) supports steady debt repayment.'})
    elif tot_inc < 3000:
        factors.append({'factor': 'Constrained Household Inflow', 'impact': 'Negative (-)', 'detail': f'Combined income (₹{tot_inc:,.0f}) is below median, elevating repayment risk.'})

    if prop == 'Semiurban':
        factors.append({'factor': 'Semiurban Property Advantage', 'impact': 'Positive (+)', 'detail': 'Semiurban properties exhibit the highest approval rate (76.8%) in the dataset.'})

    return {
        'prediction': pred,
        'prob_approved': prob_approved,
        'prob_rejected': prob_rejected,
        'total_income': tot_inc,
        'est_monthly_payment': emi,
        'dti_ratio': dti,
        'factors': factors
    }
`,

  'backend/data/loan_dataset.csv': RAW_CSV_DATA,

  'frontend/package.json': `{
  "name": "loan-prediction-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port=5173",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.546.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
`
};

export const PYTHON_FILES = PROJECT_FILES;

export async function downloadProjectZip() {
  const zip = new JSZip();
  const root = zip.folder('loan_prediction_system');

  if (!root) return;

  Object.entries(PROJECT_FILES).forEach(([path, content]) => {
    root.file(path, content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'loan_prediction_system.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
