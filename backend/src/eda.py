"""
Module: eda.py
Project: Loan Prediction Data Analysis System

Description:
This module contains functions to generate exploratory data analysis
visualizations using Matplotlib and Seaborn.
"""

import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

# Set consistent aesthetic style
sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams.update({'font.sans-serif': 'DejaVu Sans', 'axes.titlesize': 13, 'axes.labelsize': 11})


def plot_applicant_income_dist(df: pd.DataFrame):
    """1. Applicant Income Distribution (Histogram + KDE)"""
    fig, ax = plt.subplots(figsize=(8, 4.5))
    income_data = df['ApplicantIncome'].dropna()
    sns.histplot(income_data, kde=True, bins=30, color="#2563eb", ax=ax)
    ax.axvline(income_data.median(), color="#ef4444", linestyle="--", linewidth=1.5, label=f"Median: ₹{income_data.median():,.0f}")
    ax.set_title("1. Distribution of Applicant Income", weight='bold', pad=12)
    ax.set_xlabel("Applicant Monthly Income (₹)")
    ax.set_ylabel("Number of Applicants")
    ax.legend()
    plt.tight_layout()
    return fig


def plot_loan_amount_dist(df: pd.DataFrame):
    """2. Loan Amount Distribution (Histogram + Box Plot)"""
    fig, (ax_box, ax_hist) = plt.subplots(2, 1, figsize=(8, 5), gridspec_kw={'height_ratios': [0.25, 0.75]})
    loan_data = df['LoanAmount'].dropna()
    sns.boxplot(x=loan_data, color="#38bdf8", ax=ax_box)
    ax_box.set(xlabel="")
    ax_box.set_title("2. Distribution of Requested Loan Amount (in Thousands)", weight='bold', pad=10)
    
    sns.histplot(loan_data, kde=True, bins=30, color="#0284c7", ax=ax_hist)
    ax_hist.axvline(loan_data.median(), color="#ef4444", linestyle="--", label=f"Median: ₹{loan_data.median():,.0f}k")
    ax_hist.set_xlabel("Loan Amount (₹'000)")
    ax_hist.set_ylabel("Frequency")
    ax_hist.legend()
    plt.tight_layout()
    return fig


def plot_gender_distribution(df: pd.DataFrame):
    """3. Gender Distribution"""
    fig, ax = plt.subplots(figsize=(6, 4))
    counts = df['Gender'].value_counts(dropna=False)
    sns.barplot(x=counts.index.astype(str), y=counts.values, palette=["#3b82f6", "#ec4899", "#94a3b8"], ax=ax)
    ax.set_title("3. Gender Distribution of Applicants", weight='bold', pad=12)
    ax.set_xlabel("Gender")
    ax.set_ylabel("Applicant Count")
    for i, v in enumerate(counts.values):
        ax.text(i, v + 3, f"{v} ({v/len(df)*100:.1f}%)", ha='center', weight='bold', fontsize=9)
    plt.tight_layout()
    return fig


def plot_education_distribution(df: pd.DataFrame):
    """4. Education Distribution"""
    fig, ax = plt.subplots(figsize=(6, 4))
    counts = df['Education'].value_counts()
    sns.barplot(x=counts.index, y=counts.values, palette=["#10b981", "#f59e0b"], ax=ax)
    ax.set_title("4. Education Level Distribution", weight='bold', pad=12)
    ax.set_xlabel("Education Qualification")
    ax.set_ylabel("Count")
    for i, v in enumerate(counts.values):
        ax.text(i, v + 4, f"{v} ({v/len(df)*100:.1f}%)", ha='center', weight='bold', fontsize=9)
    plt.tight_layout()
    return fig


def plot_employment_distribution(df: pd.DataFrame):
    """5. Self Employment Status Distribution"""
    fig, ax = plt.subplots(figsize=(6, 4))
    counts = df['Self_Employed'].value_counts(dropna=False)
    sns.barplot(x=counts.index.astype(str), y=counts.values, palette=["#6366f1", "#a855f7", "#cbd5e1"], ax=ax)
    ax.set_title("5. Employment Status (Self-Employed vs Salaried)", weight='bold', pad=12)
    ax.set_xlabel("Self Employed")
    ax.set_ylabel("Count")
    for i, v in enumerate(counts.values):
        ax.text(i, v + 4, f"{v}", ha='center', weight='bold', fontsize=9)
    plt.tight_layout()
    return fig


def plot_property_area_distribution(df: pd.DataFrame):
    """6. Property Area Distribution"""
    fig, ax = plt.subplots(figsize=(6, 4))
    counts = df['Property_Area'].value_counts()
    sns.barplot(x=counts.index, y=counts.values, palette="Set2", ax=ax)
    ax.set_title("6. Property Area Distribution", weight='bold', pad=12)
    ax.set_xlabel("Property Area")
    ax.set_ylabel("Applicant Count")
    for i, v in enumerate(counts.values):
        ax.text(i, v + 3, f"{v}", ha='center', weight='bold')
    plt.tight_layout()
    return fig


def plot_loan_approval_rejection(df: pd.DataFrame):
    """7. Overall Loan Approval vs Rejection Count"""
    fig, ax = plt.subplots(figsize=(6, 4))
    counts = df['Loan_Status'].value_counts()
    colors = ['#10b981' if k in ['Y', 1] else '#ef4444' for k in counts.index]
    sns.barplot(x=counts.index.astype(str), y=counts.values, palette=colors, ax=ax)
    ax.set_title("7. Loan Approval vs Rejection (Target Variable)", weight='bold', pad=12)
    ax.set_xlabel("Loan Status (Y = Approved, N = Rejected)")
    ax.set_ylabel("Total Count")
    for i, v in enumerate(counts.values):
        ax.text(i, v + 5, f"{v} ({v/len(df)*100:.1f}%)", ha='center', weight='bold')
    plt.tight_layout()
    return fig


def plot_credit_history_vs_approval(df: pd.DataFrame):
    """8. Credit History vs Loan Approval"""
    fig, ax = plt.subplots(figsize=(7, 4.5))
    ct = pd.crosstab(df['Credit_History'].fillna(-1), df['Loan_Status'], normalize='index') * 100
    ct.index = [f"Meets Guidelines (1.0)" if i == 1 else f"No Guidelines (0.0)" if i == 0 else "Missing" for i in ct.index]
    ct.plot(kind='bar', stacked=True, color=['#ef4444', '#10b981'], ax=ax, edgecolor='black', alpha=0.85)
    ax.set_title("8. Credit History vs Loan Approval Rate (%)", weight='bold', pad=12)
    ax.set_xlabel("Credit History Status")
    ax.set_ylabel("Approval / Rejection Percentage (%)")
    ax.legend(["Rejected (N)", "Approved (Y)"], loc="upper left")
    plt.xticks(rotation=0)
    plt.tight_layout()
    return fig


def plot_education_vs_approval(df: pd.DataFrame):
    """9. Education vs Loan Approval"""
    fig, ax = plt.subplots(figsize=(7, 4.5))
    ct = pd.crosstab(df['Education'], df['Loan_Status'], normalize='index') * 100
    ct.plot(kind='bar', color=['#ef4444', '#10b981'], ax=ax, edgecolor='black', alpha=0.85)
    ax.set_title("9. Education vs Loan Approval Rate (%)", weight='bold', pad=12)
    ax.set_xlabel("Education Level")
    ax.set_ylabel("Percentage (%)")
    ax.legend(["Rejected (N)", "Approved (Y)"])
    plt.xticks(rotation=0)
    plt.tight_layout()
    return fig


def plot_property_vs_approval(df: pd.DataFrame):
    """10. Property Area vs Loan Approval"""
    fig, ax = plt.subplots(figsize=(7, 4.5))
    ct = pd.crosstab(df['Property_Area'], df['Loan_Status'], normalize='index') * 100
    ct.plot(kind='bar', color=['#ef4444', '#10b981'], ax=ax, edgecolor='black', alpha=0.85)
    ax.set_title("10. Property Area vs Loan Approval (%)", weight='bold', pad=12)
    ax.set_xlabel("Property Area")
    ax.set_ylabel("Approval Rate (%)")
    ax.legend(["Rejected (N)", "Approved (Y)"])
    plt.xticks(rotation=0)
    plt.tight_layout()
    return fig


def plot_income_vs_approval(df: pd.DataFrame):
    """11. Applicant Income vs Loan Approval (Box Plot)"""
    fig, ax = plt.subplots(figsize=(7, 4.5))
    sns.boxplot(x='Loan_Status', y='ApplicantIncome', data=df, palette=['#ef4444', '#10b981'], ax=ax)
    ax.set_title("11. Applicant Monthly Income by Loan Status", weight='bold', pad=12)
    ax.set_xlabel("Loan Status (N = Rejected, Y = Approved)")
    ax.set_ylabel("Applicant Income (₹)")
    # Zoom y-axis to eliminate extreme visual distortion
    ax.set_ylim(0, 20000)
    plt.tight_layout()
    return fig


def plot_correlation_matrix(df: pd.DataFrame):
    """Correlation Heatmap of Numerical Features"""
    numeric_df = df.select_dtypes(include=[np.number])
    fig, ax = plt.subplots(figsize=(7, 5))
    corr = numeric_df.corr()
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", cbar=True, ax=ax, linewidths=0.5)
    ax.set_title("Feature Correlation Heatmap", weight='bold', pad=12)
    plt.tight_layout()
    return fig
