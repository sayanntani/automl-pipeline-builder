# AutoML Pipeline - Architecture & Technical Documentation

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         WEB BROWSER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Frontend (HTML/CSS/JavaScript)                        │ │
│  │  - index.html (UI Components)                          │ │
│  │  - style.css (Styling & Responsive Design)             │ │
│  │  - app.js (API Calls & User Interactions)              │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬────────────────────────────────┘
                            │ HTTP/REST API
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    FLASK BACKEND (Python)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  app.py (Flask Application & Routes)                   │ │
│  │  - Upload endpoints                                    │ │
│  │  - Data processing endpoints                           │ │
│  │  - ML training endpoints                               │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  utils/data_handler.py (Data Processing)               │ │
│  │  - Load data (CSV, Excel)                              │ │
│  │  - Analyze data structure                              │ │
│  │  - Handle missing values (6 strategies)                │ │
│  │  - Remove duplicates                                   │ │
│  │  - Encode categorical variables                        │ │
│  │  - Scale features                                      │ │
│  │  - Export processed data                               │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  utils/ml_pipeline.py (Machine Learning)               │ │
│  │  - Train multiple models                               │ │
│  │  - Task detection (Regression/Classification)          │ │
│  │  - Model comparison                                    │ │
│  │  - Feature importance extraction                       │ │
│  │  - Make predictions                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### 1. File Upload
```
User selects file → Frontend sends to API
→ Backend receives file → Validate format
→ Load data (pandas) → Analyze structure
→ Return analysis to frontend
```

### 2. Data Preprocessing
```
User clicks preprocessing button → Frontend sends parameters
→ Backend applies operation (DataHandler)
→ Update internal DataFrame → Re-analyze
→ Return updated analysis to frontend
```

### 3. Model Training
```
User selects target column → Frontend sends to API
→ Backend separates features & target
→ Detect task type (auto) → Split data (80-20)
→ Train 4 models (MLPipeline) → Compare results
→ Return comparison & best model to frontend
```

## 📦 Key Components

### Frontend Components

#### HTML Structure (index.html)
- **Upload Section**: File upload interface with drag-drop
- **Analysis Section**: Data overview, preview, preprocessing controls
- **ML Section**: Model training, comparison, and results

#### CSS (style.css)
- **Responsive Grid Layout**: Works on mobile and desktop
- **Component Styling**: Cards, buttons, tables, forms
- **Dark/Light Adaptive**: Modern color scheme
- **Animations**: Smooth transitions and loaders

#### JavaScript (app.js)
- **Session Management**: Track current session and data
- **API Communication**: Fetch requests to Flask backend
- **UI Updates**: Dynamic content rendering
- **Form Validation**: Input validation before submission
- **Event Handlers**: File upload, button clicks, user interactions

### Backend Components

#### Flask Application (app.py)
**Routes Structure**:
```
GET  /api/health                              - Health check
POST /api/upload                              - Upload file
GET  /api/data/<session_id>/analysis          - Get analysis
POST /api/data/<session_id>/handle-missing    - Handle missing values
POST /api/data/<session_id>/remove-duplicates - Remove duplicates
POST /api/data/<session_id>/encode-categorical - Encode categories
POST /api/data/<session_id>/scale-features    - Scale features
GET  /api/data/<session_id>/export            - Export data
POST /api/ml/<session_id>/train               - Train models
GET  /api/ml/<session_id>/models              - Get trained models
GET  /api/ml/<session_id>/feature-importance  - Get feature importance
```

#### DataHandler Class (data_handler.py)
**Responsibilities**:
- Load CSV and Excel files
- Analyze data (shape, types, statistics)
- Impute missing values (6 strategies)
- Remove duplicates
- Encode categorical variables
- Scale numeric features
- Export processed data

**Missing Value Strategies**:
```
1. mean      → Fill numeric with mean, categorical with mode
2. median    → Fill numeric with median, categorical with mode
3. mode      → Fill all with most frequent value
4. forward_fill → Propagate values forward/backward
5. knn       → Use K-Nearest Neighbors for imputation
6. drop      → Remove rows with missing values
```

#### MLPipeline Class (ml_pipeline.py)
**Responsibilities**:
- Prepare data (train-test split)
- Detect task type (auto)
- Train multiple models
- Compare model performance
- Extract feature importance
- Make predictions

**Regression Models**:
```
1. Linear Regression        - Fast, interpretable
2. Random Forest Regressor  - Handles non-linearity
3. Gradient Boosting        - Often highest accuracy
4. Support Vector Regressor - Good for complex patterns
```

**Classification Models**:
```
1. Logistic Regression      - Fast, interpretable
2. Random Forest Classifier - Handles non-linearity
3. Gradient Boosting        - Often highest accuracy
4. Support Vector Classifier - Good for complex patterns
```

## 🔐 Security Features

1. **File Validation**:
   - Check file type (CSV/Excel only)
   - Limit file size (50MB max)
   - Validate column names

2. **Data Isolation**:
   - Session-based storage
   - No persistent data storage (in-memory)
   - Unique session IDs

3. **Error Handling**:
   - Try-catch blocks for all operations
   - Detailed error messages
   - User input validation

4. **CORS Enabled**:
   - Frontend can communicate with backend
   - Secure cross-origin requests

## 🚀 Performance Optimizations

1. **Efficient Data Processing**:
   - Pandas vectorization (not loops)
   - Numpy operations (fast numeric operations)
   - Scikit-learn algorithms (optimized C implementations)

2. **Memory Management**:
   - Session-based cleanup (no memory leaks)
   - Efficient imputation strategies
   - Selective model training

3. **Frontend Optimization**:
   - Single-page application (no page refreshes)
   - Async fetch calls (non-blocking)
   - Dynamic content updates

## 📊 Supported Data Types

### Numeric Types
- int32, int64 (integers)
- float32, float64 (decimals)

### Categorical Types
- object (text strings)
- bool (true/false)

### Handled In Processing
- NULL/None values
- NaN (Not a Number)
- Duplicate rows

## 🎯 Model Selection Logic

### Auto Task Detection
```python
if target.dtype in [int64, int32]:
    if len(unique_values) <= 10:
        task = Classification
    else:
        task = Regression
elif target.dtype in [float64, float32]:
    task = Regression
else:
    task = Classification
```

### Best Model Selection
```python
# Regression
best_model = model with highest R² score

# Classification  
best_model = model with highest Accuracy
```

## 📈 Metrics Explained

### Regression Metrics
- **RMSE**: Average prediction error (lower is better)
- **R² Score**: Variance explained (0-1, higher is better)
- **MSE**: Mean squared error (lower is better)

### Classification Metrics
- **Accuracy**: Correct predictions % (higher is better)
- **Precision**: True positives / all predicted positives
- **Recall**: True positives / all actual positives
- **F1-Score**: Harmonic mean of precision & recall

## 🔧 Configuration

Edit `config.py` to customize:
```python
DEBUG = True              # Enable debug mode
UPLOAD_FOLDER = './uploads'  # Upload folder path
MAX_CONTENT_LENGTH = 50MB    # Max file size
```

## 📚 Dependencies & Versions

```
Flask==2.3.3                    # Web framework
Flask-CORS==4.0.0              # Cross-origin support
pandas==2.0.3                  # Data manipulation
numpy==1.24.3                  # Numeric computing
scikit-learn==1.3.0            # ML algorithms
scipy==1.11.2                  # Scientific computing
```

## 🧪 Testing Recommendations

### Unit Tests (not included, but recommended)
```python
# Test DataHandler
- test_load_csv()
- test_load_excel()
- test_missing_value_handling()
- test_categorical_encoding()
- test_feature_scaling()

# Test MLPipeline
- test_model_training()
- test_classification_detection()
- test_regression_detection()
- test_feature_importance()
```

### Integration Tests
- Upload → Preprocess → Train workflow
- Different file formats
- Edge cases (empty data, all missing, etc.)

## 🐛 Debugging Tips

### Frontend Debugging
```javascript
// Check in browser console (F12)
console.log(currentSessionId)  // Current session
console.log(currentAnalysis)   // Data analysis
// All API responses logged automatically
```

### Backend Debugging
```python
# Check Flask terminal output
# Enable debug mode in config.py
# Add print statements or logging
```

### Common Issues
- **CORS Error**: Frontend can't reach backend
  - Ensure Flask is running
  - Check port 5000 is accessible
  
- **Upload Fails**: Invalid file
  - Use CSV or Excel format
  - Check file size < 50MB
  
- **Training Fails**: Data issue
  - Verify target column exists
  - Check for sufficient data

## 🎓 Learning Path

1. **Understand the Flow**: Read this documentation
2. **Try Sample Data**: Use included sample_data.csv
3. **Explore UI**: Click buttons, see how data changes
4. **Read Code Comments**: Backend has detailed comments
5. **Experiment**: Upload your own data and test
6. **Extend**: Add new features or models

## 📈 Potential Enhancements

1. **Advanced Features**:
   - Hyperparameter tuning
   - Cross-validation
   - Ensemble methods
   - Neural networks

2. **User Features**:
   - User authentication
   - Save/load projects
   - Model deployment
   - Prediction API

3. **Data Features**:
   - Data validation rules
   - Outlier detection
   - Data profiling reports
   - Data quality metrics

4. **ML Features**:
   - Clustering algorithms
   - Anomaly detection
   - Time series forecasting
   - Custom model selection

---

**Version**: 1.0  
**Last Updated**: February 2024  
**Status**: Production Ready
