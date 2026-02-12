import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.svm import SVR, SVC
from sklearn.metrics import mean_squared_error, r2_score, accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

class MLPipeline:
    """AutoML pipeline for automatic model selection and training"""
    
    def __init__(self):
        self.df = None
        self.models = {}
        self.results = {}
        self.best_model = None
        self.best_score = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.task_type = None  # 'regression' or 'classification'
    
    def prepare_data(self, df, target_column, test_size=0.2, random_state=42):
        """Prepare and split data"""
        try:
            self.df = df.copy()
            
            # Separate features and target
            if target_column not in df.columns:
                return False, f"Target column '{target_column}' not found"
            
            X = df.drop(columns=[target_column])
            y = df[target_column]
            
            # Determine task type
            if y.dtype in [np.int64, np.int32, int]:
                if len(y.unique()) <= 10:
                    self.task_type = 'classification'
                else:
                    self.task_type = 'regression'
            elif y.dtype in [np.float64, np.float32, float]:
                self.task_type = 'regression'
            else:
                self.task_type = 'classification'
            
            # Split data
            self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
                X, y, test_size=test_size, random_state=random_state
            )
            
            return True, f"Data prepared for {self.task_type}"
        
        except Exception as e:
            return False, f"Error preparing data: {str(e)}"
    
    def train_models(self):
        """Train multiple models and compare"""
        if self.X_train is None:
            return False, "Data not prepared"
        
        try:
            if self.task_type == 'regression':
                return self._train_regression_models()
            else:
                return self._train_classification_models()
        
        except Exception as e:
            return False, f"Error training models: {str(e)}"
    
    def _train_regression_models(self):
        """Train regression models"""
        models = {
            'Linear Regression': LinearRegression(),
            'Random Forest Regressor': RandomForestRegressor(n_estimators=100, random_state=42),
            'Gradient Boosting Regressor': GradientBoostingRegressor(n_estimators=100, random_state=42),
            'SVR': SVR(kernel='rbf', C=100)
        }
        
        results = {}
        
        for name, model in models.items():
            try:
                model.fit(self.X_train, self.y_train)
                y_pred = model.predict(self.X_test)
                
                mse = mean_squared_error(self.y_test, y_pred)
                rmse = np.sqrt(mse)
                r2 = r2_score(self.y_test, y_pred)
                
                results[name] = {
                    'model': model,
                    'RMSE': rmse,
                    'R2': r2,
                    'MSE': mse
                }
            except Exception as e:
                results[name] = {'error': str(e)}
        
        self.results = results
        
        # Find best model
        valid_results = {k: v for k, v in results.items() if 'error' not in v}
        if valid_results:
            self.best_model = max(valid_results.items(), key=lambda x: x[1]['R2'])
            self.best_score = self.best_model[1]['R2']
        
        return True, "Regression models trained successfully"
    
    def _train_classification_models(self):
        """Train classification models"""
        models = {
            'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
            'Random Forest Classifier': RandomForestClassifier(n_estimators=100, random_state=42),
            'Gradient Boosting Classifier': GradientBoostingClassifier(n_estimators=100, random_state=42),
            'SVC': SVC(kernel='rbf', probability=True, random_state=42)
        }
        
        results = {}
        
        for name, model in models.items():
            try:
                model.fit(self.X_train, self.y_train)
                y_pred = model.predict(self.X_test)
                
                accuracy = accuracy_score(self.y_test, y_pred)
                precision = precision_score(self.y_test, y_pred, average='weighted', zero_division=0)
                recall = recall_score(self.y_test, y_pred, average='weighted', zero_division=0)
                f1 = f1_score(self.y_test, y_pred, average='weighted', zero_division=0)
                
                results[name] = {
                    'model': model,
                    'Accuracy': accuracy,
                    'Precision': precision,
                    'Recall': recall,
                    'F1-Score': f1
                }
            except Exception as e:
                results[name] = {'error': str(e)}
        
        self.results = results
        
        # Find best model
        valid_results = {k: v for k, v in results.items() if 'error' not in v}
        if valid_results:
            self.best_model = max(valid_results.items(), key=lambda x: x[1]['Accuracy'])
            self.best_score = self.best_model[1]['Accuracy']
        
        return True, "Classification models trained successfully"
    
    def get_model_comparison(self):
        """Get formatted comparison of all models"""
        if not self.results:
            return {}
        
        comparison = {}
        for model_name, metrics in self.results.items():
            if 'error' not in metrics:
                comparison[model_name] = {k: round(float(v), 4) if isinstance(v, (int, float)) else str(v) 
                                         for k, v in metrics.items() if k != 'model'}
        
        return comparison
    
    def get_best_model_info(self):
        """Get information about best model"""
        if self.best_model is None:
            return None
        
        model_name, metrics = self.best_model
        info = {
            'model_name': model_name,
            'task_type': self.task_type,
            'metrics': {k: round(float(v), 4) if isinstance(v, (int, float)) else str(v) 
                       for k, v in metrics.items() if k != 'model'},
            'best_score': round(float(self.best_score), 4)
        }
        
        return info
    
    def predict(self, input_data):
        """Make predictions with best model"""
        if self.best_model is None:
            return None, "No model trained yet"
        
        try:
            model = self.best_model[1]['model']
            predictions = model.predict(input_data)
            return predictions, "Predictions made successfully"
        except Exception as e:
            return None, f"Error making predictions: {str(e)}"
    
    def get_feature_importance(self, top_n=10):
        """Get feature importance from tree-based models"""
        if self.best_model is None:
            return {}
        
        model = self.best_model[1]['model']
        
        if not hasattr(model, 'feature_importances_'):
            return {}
        
        feature_importance = model.feature_importances_
        feature_names = self.X_train.columns
        
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': feature_importance
        }).sort_values('importance', ascending=False).head(top_n)
        
        return importance_df.to_dict('records')
