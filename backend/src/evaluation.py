"""
Module: evaluation.py
Project: Loan Prediction Data Analysis System

Description:
This module computes model performance metrics:
1. Accuracy, Precision, Recall, F1-Score, and ROC-AUC
2. Confusion Matrix generation and visualization
3. Cross-model comparison summary table
4. Feature importance extraction (Gini importance for Trees, Coefficients for Logistic Regression)
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    roc_curve
)


def evaluate_models(models: dict, X_test, y_test) -> tuple[pd.DataFrame, dict]:
    """
    Evaluates each trained model against test data and compiles metrics into a comparison table.

    Returns:
        comparison_df: DataFrame of all metrics for each model
        details: Dict with per-model confusion matrix, roc curve coords, and predictions
    """
    results = []
    details = {}

    for name, model in models.items():
        y_pred = model.predict(X_test)
        
        # Calculate probabilities for ROC-AUC if supported
        if hasattr(model, "predict_proba"):
            y_proba = model.predict_proba(X_test)[:, 1]
            try:
                auc = roc_auc_score(y_test, y_proba)
            except Exception:
                auc = np.nan
        else:
            y_proba = None
            auc = np.nan

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        cm = confusion_matrix(y_test, y_pred)

        results.append({
            'Model': name,
            'Accuracy': round(acc * 100, 2),
            'Precision': round(prec * 100, 2),
            'Recall': round(rec * 100, 2),
            'F1-Score': round(f1 * 100, 2),
            'ROC-AUC': round(auc, 4) if not np.isnan(auc) else 'N/A'
        })

        details[name] = {
            'y_pred': y_pred,
            'y_proba': y_proba,
            'confusion_matrix': cm,
            'roc_auc': auc
        }

    comparison_df = pd.DataFrame(results)
    return comparison_df, details


def plot_confusion_matrix(cm: np.ndarray, model_name: str):
    """
    Generates a clear confusion matrix heatmap using Seaborn.
    """
    fig, ax = plt.subplots(figsize=(5, 4))
    sns.heatmap(
        cm,
        annot=True,
        fmt='d',
        cmap='Blues',
        xticklabels=['Pred: Rejected (0)', 'Pred: Approved (1)'],
        yticklabels=['Actual: Rejected (0)', 'Actual: Approved (1)'],
        cbar=False,
        ax=ax
    )
    ax.set_title(f"Confusion Matrix: {model_name}", weight='bold', pad=10)
    plt.tight_layout()
    return fig


def plot_roc_curves(models: dict, X_test, y_test):
    """
    Plots the ROC curves for all models on a single graph for academic visual comparison.
    """
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.plot([0, 1], [0, 1], linestyle='--', color='gray', label='Random Guess (AUC = 0.50)')

    colors = ['#2563eb', '#10b981', '#f59e0b']
    for (name, model), color in zip(models.items(), colors):
        if hasattr(model, "predict_proba"):
            y_proba = model.predict_proba(X_test)[:, 1]
            fpr, tpr, _ = roc_curve(y_test, y_proba)
            auc = roc_auc_score(y_test, y_proba)
            ax.plot(fpr, tpr, label=f"{name} (AUC = {auc:.3f})", color=color, linewidth=2)

    ax.set_title("ROC Curves Comparison", weight='bold', pad=12)
    ax.set_xlabel("False Positive Rate (1 - Specificity)")
    ax.set_ylabel("True Positive Rate (Recall)")
    ax.legend(loc="lower right")
    plt.tight_layout()
    return fig


def get_feature_importance(model, feature_names: list, model_name: str) -> pd.DataFrame:
    """
    Extracts feature importance weights from Tree-based models or coefficients from Logistic Regression.
    """
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
        df = pd.DataFrame({
            'Feature': feature_names,
            'Importance': importances
        }).sort_values('Importance', ascending=False).reset_index(drop=True)
        return df
    elif hasattr(model, 'coef_'):
        # For logistic regression: absolute value of coefficient indicates influence
        coefs = np.abs(model.coef_[0])
        df = pd.DataFrame({
            'Feature': feature_names,
            'Importance': coefs
        }).sort_values('Importance', ascending=False).reset_index(drop=True)
        return df
    return pd.DataFrame()


def plot_feature_importance(fi_df: pd.DataFrame, model_name: str):
    """
    Plots horizontal bar chart of feature importance.
    """
    fig, ax = plt.subplots(figsize=(7, 4.5))
    top_fi = fi_df.head(8).sort_values('Importance', ascending=True)
    ax.barh(top_fi['Feature'], top_fi['Importance'], color='#3b82f6', edgecolor='navy', alpha=0.85)
    ax.set_title(f"Top Driving Features ({model_name})", weight='bold', pad=12)
    ax.set_xlabel("Relative Importance Weight")
    plt.tight_layout()
    return fig
