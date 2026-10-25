"""
Module: model_training.py
Project: Loan Prediction Data Analysis System

Description:
This module handles:
1. Instantiation and training of 3 classical ML models:
   - Logistic Regression
   - Decision Tree Classifier
   - Random Forest Classifier
2. Fair comparison on identical training splits
3. Saving and loading the best / chosen model using Joblib
"""

import os
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier


def train_all_models(
    X_train,
    y_train,
    lr_c: float = 1.0,
    dt_max_depth: int = 5,
    rf_n_estimators: int = 100,
    random_state: int = 42
) -> dict:
    """
    Trains all three models on the exact same training split for a fair benchmark.

    Returns:
        models: Dictionary of trained model objects:
                {'Logistic Regression': model_lr, 'Decision Tree': model_dt, 'Random Forest': model_rf}
    """
    models = {}

    # 1. Logistic Regression
    lr = LogisticRegression(
        C=lr_c,
        max_iter=1000,
        random_state=random_state,
        solver='liblinear'
    )
    lr.fit(X_train, y_train)
    models['Logistic Regression'] = lr

    # 2. Decision Tree
    dt = DecisionTreeClassifier(
        max_depth=dt_max_depth,
        criterion='gini',
        random_state=random_state
    )
    dt.fit(X_train, y_train)
    models['Decision Tree'] = dt

    # 3. Random Forest
    rf = RandomForestClassifier(
        n_estimators=rf_n_estimators,
        max_depth=dt_max_depth,
        random_state=random_state
    )
    rf.fit(X_train, y_train)
    models['Random Forest'] = rf

    return models


def save_pipeline(model, scaler, feature_names: list, model_name: str, file_path: str = "models/trained_model.pkl"):
    """
    Serializes the trained model, feature scaler, and feature names into a single pickle file.
    This enables quick deployment without retraining on each new user query.
    """
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    bundle = {
        'model': model,
        'scaler': scaler,
        'feature_names': feature_names,
        'model_name': model_name
    }
    joblib.dump(bundle, file_path)
    return file_path


def load_pipeline(file_path: str = "models/trained_model.pkl"):
    """
    Loads a previously saved model pipeline bundle from disk.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Model file not found at {file_path}. Please train a model first.")
    return joblib.load(file_path)
