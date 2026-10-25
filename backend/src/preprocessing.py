"""
Module: preprocessing.py
Project: Loan Prediction Data Analysis System

Description:
This module prepares cleaned data for Machine Learning model training:
1. Feature and target separation (X and y)
2. Train-test splitting without data leakage (fit transformations ONLY on train set)
3. Categorical encoding (Binary mapping & One-Hot Encoding)
4. Feature scaling using StandardScaler / MinMaxScaler
5. Exporting processed matrices and metadata for deployment
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


def preprocess_data(
    df: pd.DataFrame,
    test_size: float = 0.2,
    random_state: int = 42,
    scale_features: bool = True
):
    """
    Preprocesses the cleaned loan dataset for scikit-learn training.
    
    Academic note: Splitting into train and test happens BEFORE scaling and encoding
    alignments, avoiding data leakage from the test distribution into the training pipeline.

    Returns:
        X_train_scaled: Transformed feature array for training
        X_test_scaled: Transformed feature array for testing
        y_train: Target labels for training (1=Approved, 0=Rejected)
        y_test: Target labels for testing
        scaler: Fitted StandardScaler instance (or None if scale_features=False)
        feature_names: List of column names after encoding
        df_encoded: Full DataFrame in encoded format for reference
    """
    data = df.copy()

    # Drop Loan_ID if present as it's an identifier, not a predictive feature
    if 'Loan_ID' in data.columns:
        data = data.drop(columns=['Loan_ID'])

    # Map Target Variable 'Loan_Status': Y -> 1, N -> 0
    if 'Loan_Status' in data.columns:
        target_map = {'Y': 1, 'N': 0, 'y': 1, 'n': 0, 1: 1, 0: 0}
        data['Loan_Status'] = data['Loan_Status'].map(target_map)
        # Drop rows where target couldn't be mapped
        data = data.dropna(subset=['Loan_Status'])
        y = data['Loan_Status'].astype(int)
        X = data.drop(columns=['Loan_Status'])
    else:
        raise ValueError("Target column 'Loan_Status' not found in dataset.")

    # Encode binary & ordinal features
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

    # One-Hot Encode nominal multiclass feature 'Property_Area' (Urban, Semiurban, Rural)
    if 'Property_Area' in X.columns:
        X = pd.get_dummies(X, columns=['Property_Area'], drop_first=True, dtype=int)

    feature_names = list(X.columns)

    # Train / Test split with stratification to preserve class balance
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    scaler = None
    if scale_features:
        scaler = StandardScaler()
        # FIT only on training data to prevent data leakage!
        X_train_scaled = scaler.fit_transform(X_train)
        # TRANSFORM test data using training statistics
        X_test_scaled = scaler.transform(X_test)
    else:
        X_train_scaled = X_train.values
        X_test_scaled = X_test.values

    # Full encoded dataset for exploration
    df_encoded = pd.concat([X, y], axis=1)

    return (
        X_train_scaled,
        X_test_scaled,
        y_train.values,
        y_test.values,
        scaler,
        feature_names,
        df_encoded,
        X_train,
        X_test
    )


def transform_single_applicant(applicant_dict: dict, feature_names: list, scaler=None) -> np.ndarray:
    """
    Transforms a single applicant's input dictionary to match the exact feature
    vector required by the trained machine learning model.
    """
    row = {}
    row['Gender'] = 1 if applicant_dict.get('Gender') == 'Male' else 0
    row['Married'] = 1 if applicant_dict.get('Married') == 'Yes' else 0
    
    dep_str = str(applicant_dict.get('Dependents', '0')).replace('+', '').strip()
    row['Dependents'] = int(dep_str) if dep_str.isdigit() else 0
    
    row['Education'] = 1 if applicant_dict.get('Education') == 'Graduate' else 0
    row['Self_Employed'] = 1 if applicant_dict.get('Self_Employed') == 'Yes' else 0
    row['ApplicantIncome'] = float(applicant_dict.get('ApplicantIncome', 0))
    row['CoapplicantIncome'] = float(applicant_dict.get('CoapplicantIncome', 0))
    row['LoanAmount'] = float(applicant_dict.get('LoanAmount', 0))
    row['Loan_Amount_Term'] = float(applicant_dict.get('Loan_Amount_Term', 360))
    row['Credit_History'] = float(applicant_dict.get('Credit_History', 1))

    # Property_Area dummy encoding (matching training dummies drop_first=True, Rural is base)
    prop_area = applicant_dict.get('Property_Area', 'Urban')
    if 'Property_Area_Semiurban' in feature_names:
        row['Property_Area_Semiurban'] = 1 if prop_area == 'Semiurban' else 0
    if 'Property_Area_Urban' in feature_names:
        row['Property_Area_Urban'] = 1 if prop_area == 'Urban' else 0

    # Align columns exactly in model feature order
    vec = []
    for col in feature_names:
        vec.append(row.get(col, 0.0))

    vec_array = np.array([vec], dtype=float)
    if scaler is not None:
        vec_array = scaler.transform(vec_array)
    return vec_array
