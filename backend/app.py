"""
Loan Prediction Data Analysis System - Flask Backend API

Endpoints:
- GET  /api/health     : Health check
- GET  /api/dataset    : Dataset metadata, missing values, duplicates, and preview rows
- GET  /api/analysis   : Aggregated statistics for EDA visualizations
- GET  /api/model      : ML model evaluation metrics (LR, DT, RF)
- POST /api/predict    : Run prediction for a new loan applicant
- GET  /               : Serves the production React frontend
"""

import os
import sys
import json
import numpy as np
import pandas as pd

# Ensure backend directory is in sys.path regardless of execution working directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from src.data_cleaning import detect_missing_values, check_duplicates, clean_loan_dataset
from src.preprocessing import preprocess_data
from src.model_training import train_all_models
from src.evaluation import evaluate_models
from src.prediction import predict_loan_application

# Static folder pointing to compiled React frontend (dist/) in root directory
DIST_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "dist"))

app = Flask(
    __name__,
    static_folder=DIST_DIR if os.path.exists(DIST_DIR) else None,
    static_url_path="/"
)
CORS(app)  # Enable Cross-Origin Resource Sharing for React frontend

# Global cached variables for fast responses
DATA_PATH = os.path.join(BASE_DIR, "data", "loan_dataset.csv")

raw_df = None
cleaned_df = None
trained_models = None
scaler = None
feature_names = None
eval_summary = None


def load_and_initialize():
    """Load dataset, clean data, and train models at startup."""
    global raw_df, cleaned_df, trained_models, scaler, feature_names, eval_summary
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}")

    raw_df = pd.read_csv(DATA_PATH)
    cleaned_df, _ = clean_loan_dataset(raw_df, fill_strategy="standard")

    # Preprocess & split - safely unpack up to 6 return values
    preprocess_result = preprocess_data(cleaned_df, test_size=0.2, random_state=42)
    X_train, X_test, y_train, y_test, scaler, feature_names = preprocess_result[:6]

    # Train all 3 models
    trained_models = train_all_models(X_train, y_train)

    # Pre-evaluate models
    eval_df, eval_details = evaluate_models(trained_models, X_test, y_test)
    eval_summary = {
        "metrics": eval_df.to_dict(orient="records"),
        "details": {
            k: {
                "confusion_matrix": v["confusion_matrix"].tolist()
            }
            for k, v in eval_details.items()
        }
    }
    print("Backend initialized: Dataset loaded and models trained successfully.")


# Initialize on startup
try:
    load_and_initialize()
except Exception as e:
    print(f"Warning: Initialization error: {e}")


# ==============================================================================
# REST API ENDPOINTS
# ==============================================================================

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "online",
        "service": "Loan Prediction Data Analysis System API",
        "version": "1.0.0"
    })


@app.route("/api/dataset", methods=["GET"])
def get_dataset():
    """Returns dataset overview, shape, missing values, duplicates, and preview records."""
    if raw_df is None:
        return jsonify({"error": "Dataset not loaded"}), 500

    missing_report = detect_missing_values(raw_df)
    duplicates = check_duplicates(raw_df)

    preview_records = raw_df.head(25).replace({np.nan: None}).to_dict(orient="records")

    total_records = int(len(raw_df))
    total_features = int(len(raw_df.columns))

    return jsonify({
        "total_records": total_records,
        "total_features": total_features,
        "duplicate_records": duplicates,
        "columns": list(raw_df.columns),
        "missing_report": missing_report.to_dict(orient="records"),
        "total_missing_cells": int(missing_report["Missing_Count"].sum()),
        "cleaning_strategy": {
            "categorical": "Mode Imputation (most frequent class)",
            "numerical": "Median Imputation (robust against income/loan skewness)",
            "duplicates": "Identified and dropped if any"
        },
        "preview_rows": preview_records
    })


@app.route("/api/analysis", methods=["GET"])
def get_analysis():
    """Returns aggregated data distributions for clean charts."""
    df_to_use = cleaned_df
    if df_to_use is None:
        df_to_use = raw_df

    if df_to_use is None:
        return jsonify({"error": "No data available"}), 500

    total = len(df_to_use)
    approved = int((df_to_use["Loan_Status"] == "Y").sum())
    rejected = int((df_to_use["Loan_Status"] == "N").sum())
    approval_rate = round((approved / total) * 100, 2) if total > 0 else 0

    # 1. Credit History vs Approval
    ch1 = df_to_use[df_to_use["Credit_History"] == 1]
    ch0 = df_to_use[df_to_use["Credit_History"] == 0]
    ch1_rate = round(((ch1["Loan_Status"] == "Y").sum() / len(ch1)) * 100, 1) if len(ch1) > 0 else 0
    ch0_rate = round(((ch0["Loan_Status"] == "Y").sum() / len(ch0)) * 100, 1) if len(ch0) > 0 else 0

    # 2. Education vs Approval
    grad = df_to_use[df_to_use["Education"] == "Graduate"]
    not_grad = df_to_use[df_to_use["Education"] == "Not Graduate"]
    grad_rate = round(((grad["Loan_Status"] == "Y").sum() / len(grad)) * 100, 1) if len(grad) > 0 else 0
    not_grad_rate = round(((not_grad["Loan_Status"] == "Y").sum() / len(not_grad)) * 100, 1) if len(not_grad) > 0 else 0

    # 3. Property Area vs Approval
    semi = df_to_use[df_to_use["Property_Area"] == "Semiurban"]
    urban = df_to_use[df_to_use["Property_Area"] == "Urban"]
    rural = df_to_use[df_to_use["Property_Area"] == "Rural"]
    semi_rate = round(((semi["Loan_Status"] == "Y").sum() / len(semi)) * 100, 1) if len(semi) > 0 else 0
    urban_rate = round(((urban["Loan_Status"] == "Y").sum() / len(urban)) * 100, 1) if len(urban) > 0 else 0
    rural_rate = round(((rural["Loan_Status"] == "Y").sum() / len(rural)) * 100, 1) if len(rural) > 0 else 0

    # 4. Income Distribution Bins (in Rupees)
    incomes = df_to_use["ApplicantIncome"].dropna()
    income_bins = [
        {"label": "<₹2.5k", "count": int((incomes < 2500).sum())},
        {"label": "₹2.5k-₹5k", "count": int(((incomes >= 2500) & (incomes < 5000)).sum())},
        {"label": "₹5k-₹7.5k", "count": int(((incomes >= 5000) & (incomes < 7500)).sum())},
        {"label": "₹7.5k-₹10k", "count": int(((incomes >= 7500) & (incomes < 10000)).sum())},
        {"label": ">₹10k", "count": int((incomes >= 10000).sum())}
    ]

    # 5. Loan Amount Bins (in Thousands of Rupees)
    loans = df_to_use["LoanAmount"].dropna()
    loan_bins = [
        {"label": "<₹75k", "count": int((loans < 75).sum())},
        {"label": "₹75k-₹120k", "count": int(((loans >= 75) & (loans < 120)).sum())},
        {"label": "₹120k-₹160k", "count": int(((loans >= 120) & (loans < 160)).sum())},
        {"label": "₹160k-₹220k", "count": int(((loans >= 160) & (loans < 220)).sum())},
        {"label": ">₹220k", "count": int((loans >= 220).sum())}
    ]

    return jsonify({
        "approval_distribution": {
            "total": total,
            "approved": approved,
            "rejected": rejected,
            "approval_rate": approval_rate
        },
        "credit_history": {
            "meets_guidelines_rate": ch1_rate,
            "not_meets_guidelines_rate": ch0_rate
        },
        "education": {
            "graduate_rate": grad_rate,
            "not_graduate_rate": not_grad_rate
        },
        "property_area": {
            "semiurban_rate": semi_rate,
            "urban_rate": urban_rate,
            "rural_rate": rural_rate
        },
        "income_bins": income_bins,
        "loan_bins": loan_bins
    })


@app.route("/api/model", methods=["GET"])
def get_model():
    """Returns trained models benchmark and performance evaluation."""
    if eval_summary is None:
        return jsonify({"error": "Models not yet evaluated"}), 500

    return jsonify({
        "models": eval_summary["metrics"],
        "details": eval_summary["details"],
        "descriptions": {
            "Logistic Regression": "A linear classification algorithm predicting the probability of default or approval using the sigmoid logistic function.",
            "Decision Tree": "A non-linear model that builds decision rules based on information gain and Gini impurity splits.",
            "Random Forest": "An ensemble technique that averages predictions across multiple decision trees to mitigate individual variance."
        }
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Accepts applicant input JSON and returns prediction using trained pipeline.
    Expected fields:
    - Gender, Married, Dependents, Education, Self_Employed
    - ApplicantIncome, CoapplicantIncome, LoanAmount, Loan_Amount_Term
    - Credit_History, Property_Area, model_choice (optional)
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input payload provided"}), 400

    model_choice = data.get("model_choice", "Logistic Regression")
    selected_model = trained_models.get(model_choice) if trained_models else None

    if selected_model is None:
        # Fallback to first available model
        if trained_models:
            selected_model = next(iter(trained_models.values()))
        else:
            return jsonify({"error": "Model not available"}), 500

    result = predict_loan_application(data, selected_model, scaler, feature_names)

    return jsonify({
        "status": "success",
        "model_used": model_choice,
        "prediction": result["prediction"],
        "decision": "APPROVED" if result["prediction"] == 1 else "NOT APPROVED",
        "prob_approved": result["prob_approved"],
        "prob_rejected": result["prob_rejected"],
        "confidence_percentage": round(
            (result["prob_approved"] if result["prediction"] == 1 else result["prob_rejected"]) * 100, 1
        ),
        "total_income": result["total_income"],
        "est_monthly_payment": result["est_monthly_payment"],
        "dti_ratio": result["dti_ratio"],
        "factors": result["factors"]
    })


# ==============================================================================
# FRONTEND STATIC SERVING (FOR RENDER DEPLOYMENT)
# ==============================================================================

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    """Serve production React build (SPA routing) when dist folder exists."""
    dist_folder = os.path.abspath(os.path.join(BASE_DIR, "..", "dist"))
    if path != "" and os.path.exists(os.path.join(dist_folder, path)):
        return send_from_directory(dist_folder, path)
    if os.path.exists(os.path.join(dist_folder, "index.html")):
        return send_from_directory(dist_folder, "index.html")
    return jsonify({
        "status": "Backend running. Run 'npm run build' in project root to compile frontend into dist/."
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting Flask server on http://localhost:{port} ...")
    app.run(host="0.0.0.0", port=port, debug=True)