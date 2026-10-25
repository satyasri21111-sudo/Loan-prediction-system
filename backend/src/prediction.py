"""
Module: prediction.py
Project: Loan Prediction Data Analysis System

Description:
This module manages inference on new loan applicants:
1. Validating single applicant inputs
2. Vectorizing using saved preprocessing pipeline
3. Generating predicted class and confidence probability
4. Deriving key contributing factors (Credit History, EMI-to-income ratio, etc.)
5. Generating structured risk assessment report
"""

import numpy as np
from src.preprocessing import transform_single_applicant


def predict_loan_application(applicant_data: dict, model, scaler, feature_names: list) -> dict:
    """
    Executes inference for a single applicant and generates contextual explanations.

    Args:
        applicant_data: Dictionary of user inputs from the form
        model: Scikit-learn trained model object
        scaler: StandardScaler instance or None
        feature_names: List of model input column names

    Returns:
        result_dict with prediction, probabilities, factors, and academic risk disclaimer
    """
    # 1. Transform applicant inputs to feature vector
    X_input = transform_single_applicant(applicant_data, feature_names, scaler=scaler)

    # 2. Model Prediction
    pred = int(model.predict(X_input)[0])
    status_text = "Approved (Y)" if pred == 1 else "Rejected (N)"

    # 3. Model Probability
    prob_approved = None
    prob_rejected = None
    if hasattr(model, 'predict_proba'):
        probs = model.predict_proba(X_input)[0]
        prob_rejected = float(probs[0])
        prob_approved = float(probs[1])
        confidence = prob_approved if pred == 1 else prob_rejected
    else:
        confidence = 1.0

    # 4. Domain & Financial Factor Analysis
    app_inc = float(applicant_data.get('ApplicantIncome', 0))
    co_inc = float(applicant_data.get('CoapplicantIncome', 0))
    total_income = app_inc + co_inc
    loan_amt_thousands = float(applicant_data.get('LoanAmount', 100))
    loan_amt_rupees = loan_amt_thousands * 1000
    loan_term_months = float(applicant_data.get('Loan_Amount_Term', 360))
    if loan_term_months <= 0:
        loan_term_months = 360
    credit_hist = int(applicant_data.get('Credit_History', 1))

    # Approximate Monthly Repayment (Principal / Term)
    est_monthly_payment = loan_amt_rupees / loan_term_months
    dti_ratio = (est_monthly_payment / (total_income if total_income > 0 else 1)) * 100

    factors = []
    # Factor 1: Credit History
    if credit_hist == 1:
        factors.append({
            'factor': 'Credit History Meets Guidelines (1.0)',
            'impact': 'Positive (+)',
            'detail': 'Applicant has a documented history of meeting institutional loan repayment guidelines.'
        })
    else:
        factors.append({
            'factor': 'Credit History Default / Missing (0.0)',
            'impact': 'Critical Negative (-)',
            'detail': 'Absence of clean credit history is historically the strongest rejection predictor in the dataset.'
        })

    # Factor 2: Total Household Income
    if total_income >= 6000:
        factors.append({
            'factor': 'Robust Household Income',
            'impact': 'Positive (+)',
            'detail': f'Combined monthly income (₹{total_income:,.0f}) provides healthy financial cushion.'
        })
    elif total_income < 3000:
        factors.append({
            'factor': 'Constrained Household Income',
            'impact': 'Negative (-)',
            'detail': f'Combined monthly income (₹{total_income:,.0f}) is below the institutional median.'
        })

    # Factor 3: Debt-To-Income / Loan-to-Income
    income_multiple = loan_amt_rupees / (total_income * 12) if total_income > 0 else 999
    if income_multiple > 4.5:
        factors.append({
            'factor': 'High Loan-to-Annual-Income Multiple',
            'impact': 'Negative (-)',
            'detail': f'Requested loan (₹{loan_amt_rupees:,.0f}) is {income_multiple:.1f}x annual income.'
        })
    else:
        factors.append({
            'factor': 'Balanced Loan-to-Income Multiple',
            'impact': 'Positive (+)',
            'detail': f'Loan request (₹{loan_amt_rupees:,.0f}) is {income_multiple:.1f}x annual income.'
        })

    # Factor 4: Property Area Opportunity
    prop_area = applicant_data.get('Property_Area', 'Urban')
    if prop_area == 'Semiurban':
        factors.append({
            'factor': 'Semiurban Property Advantage',
            'impact': 'Positive (+)',
            'detail': 'Semiurban applicants exhibit historically the highest acceptance rate (~76%) in this dataset.'
        })

    return {
        'prediction': pred,
        'status_text': status_text,
        'prob_approved': prob_approved,
        'prob_rejected': prob_rejected,
        'confidence_pct': round(confidence * 100, 1),
        'total_income': total_income,
        'est_monthly_payment': est_monthly_payment,
        'dti_ratio': round(dti_ratio, 2),
        'factors': factors,
        'disclaimer': "Academic Disclaimer: This prediction is generated by a statistical machine-learning model trained on historical benchmark data. It is intended solely for educational and academic evaluation, not as a binding credit underwriting decision."
    }
