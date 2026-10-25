"""
Module: data_cleaning.py
Project: Loan Prediction Data Analysis System

Description:
This module handles all data cleaning operations:
1. Missing value detection and reporting
2. Missing value imputation (mode for categorical, median for numerical)
3. Duplicate detection and removal
4. Handling invalid / non-numeric entries
5. Generating before vs after summary tables
"""

import pandas as pd
import numpy as np


def detect_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """
    Detects missing values across all columns and returns a structured report.
    Returns:
        pd.DataFrame with columns: ['Column', 'Missing_Count', 'Missing_Percentage']
    """
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
    """
    Checks the number of duplicated rows in the dataset.
    """
    return int(df.duplicated().sum())


def clean_loan_dataset(df: pd.DataFrame, fill_strategy: str = "standard") -> tuple[pd.DataFrame, dict]:
    """
    Cleans the loan dataset using appropriate statistical imputation.
    - Categorical features imputed using Mode (most frequent value).
    - Numerical features imputed using Median (robust against income/loan outliers).
    - Removes duplicate rows if any.
    - Converts object columns to proper numeric types where invalid entries like strings exist.

    Args:
        df: Raw input DataFrame
        fill_strategy: "standard" (mode for categorical, median for numerical) or "drop"

    Returns:
        cleaned_df: Cleaned pandas DataFrame
        audit_log: Dictionary of cleaning operations performed for academic audit
    """
    cleaned_df = df.copy()
    audit_log = {
        'initial_shape': df.shape,
        'duplicates_removed': 0,
        'imputations': {},
        'invalid_handled': []
    }

    # 1. Remove duplicate records
    dup_count = cleaned_df.duplicated().sum()
    if dup_count > 0:
        cleaned_df = cleaned_df.drop_duplicates()
        audit_log['duplicates_removed'] = int(dup_count)

    # 2. Coerce numeric columns if contaminated with text (e.g. 'np' or invalid strings)
    numeric_cols = ['ApplicantIncome', 'CoapplicantIncome', 'LoanAmount', 'Loan_Amount_Term', 'Credit_History']
    for col in numeric_cols:
        if col in cleaned_df.columns:
            cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors='coerce')

    # 3. Clean 'Dependents' (e.g. replace '3+' with 3)
    if 'Dependents' in cleaned_df.columns:
        cleaned_df['Dependents'] = cleaned_df['Dependents'].astype(str).str.replace('+', '', regex=False).str.strip()
        cleaned_df['Dependents'] = cleaned_df['Dependents'].replace({'nan': np.nan, 'None': np.nan, '': np.nan})

    # 4. Handle Missing Values
    if fill_strategy == "drop":
        cleaned_df = cleaned_df.dropna()
        audit_log['strategy'] = 'Dropped all rows with missing values'
    else:
        # Categorical columns imputation: Mode
        categorical_cols = ['Gender', 'Married', 'Dependents', 'Education', 'Self_Employed', 'Property_Area']
        for col in categorical_cols:
            if col in cleaned_df.columns and cleaned_df[col].isnull().sum() > 0:
                mode_val = cleaned_df[col].mode(dropna=True)[0] if not cleaned_df[col].mode(dropna=True).empty else "Unknown"
                missing_count = int(cleaned_df[col].isnull().sum())
                cleaned_df[col] = cleaned_df[col].fillna(mode_val)
                audit_log['imputations'][col] = f"Imputed {missing_count} missing values with Mode ('{mode_val}')"

        # Numerical columns imputation: Median
        for col in numeric_cols:
            if col in cleaned_df.columns and cleaned_df[col].isnull().sum() > 0:
                median_val = float(cleaned_df[col].median(skipna=True))
                missing_count = int(cleaned_df[col].isnull().sum())
                cleaned_df[col] = cleaned_df[col].fillna(median_val)
                audit_log['imputations'][col] = f"Imputed {missing_count} missing values with Median ({median_val:.1f})"

        # Handle target column Loan_Status if missing
        if 'Loan_Status' in cleaned_df.columns and cleaned_df['Loan_Status'].isnull().sum() > 0:
            cleaned_df = cleaned_df.dropna(subset=['Loan_Status'])
            audit_log['imputations']['Loan_Status'] = 'Removed rows where target Loan_Status was missing'

    audit_log['final_shape'] = cleaned_df.shape
    return cleaned_df, audit_log
