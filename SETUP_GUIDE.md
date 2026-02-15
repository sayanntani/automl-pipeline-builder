# AutoML Pipeline Builder - Setup Guide

A complete web-based Advanced AutoML Pipeline application with Neural Architecture Search, Hyperparameter Tuning, and Ensemble Generation capabilities.

## 🎯 Features Overview

### **Advanced Model Training**
- Multiple classifier and regressor models
- Automatic task type detection (Classification vs Regression)
- Hyperparameter tuning (Grid Search, Random Search)
- Cross-validation support
- Neural Architecture Search (NAS) capability
- Ensemble model generation

### **Supported Models**

**Classification:**
- Logistic Regression
- Random Forest Classifier
- Gradient Boosting Classifier
- Support Vector Classifier (SVC)
- XGBoost Classifier
- Neural Networks (with NAS)

**Regression:**
- Linear Regression
- Random Forest Regressor
- Gradient Boosting Regressor
- Support Vector Regressor (SVR)
- XGBoost Regressor
- Neural Networks (with NAS)

### **Data Processing**
- Automatic missing value detection
- Multiple imputation strategies (Mean, Median, Mode, KNN, Forward Fill)
- Duplicate removal
- Categorical variable encoding
- Feature scaling (Standard, Min-Max)
- Automatic feature selection

### **Performance Analysis**
- Real-time model comparison leaderboard
- Feature importance extraction
- Multi-metric evaluation
- Pipeline execution monitoring

---

## 📋 Prerequisites

- **Python:** 3.8 or higher
- **pip:** Python package manager
- **Modern Web Browser:** Chrome, Firefox, Edge, or Safari
- **Disk Space:** ~500MB for dependencies

---

## 🚀 Installation & Setup

### **Step 1: Clone/Download the Project**

```bash
cd AUTO
```

### **Step 2: Create Python Virtual Environment**

#### Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

#### macOS/Linux:
```bash
python -m venv venv
source venv/bin/activate
```

### **Step 3: Install Dependencies**

```bash
pip install --upgrade pip
pip install -r backend/requirements.txt
```

### **Step 4: Run the Backend Server**

```bash
cd backend
python app.py
```

You'll see:
```
 * Running on http://127.0.0.1:5000
```

### **Step 5: Open the Frontend**

In a new terminal/browser:

**Option A - Direct HTML (Recommended for Development):**
1. Navigate to the `frontend` folder
2. Open `index.html` in your web browser
3. Or use a local server:
   ```bash
   cd frontend
   python -m http.server 8000
   ```
   Then visit: `http://localhost:8000`

---

## 📖 Usage Guide

### **1. Upload Dataset**
- Click "BROWSE FILES" or drag-drop your dataset
- Supports: CSV, Excel (.xlsx, .xls), JSON
- File size limit: 100MB

### **2. Configure Pipeline**
- **Task Type:** Select Classification or Regression
- **Target Column:** Choose the variable to predict
- **Preprocessing:** Enable/disable options
- **Feature Selection:** Choose method (Automatic, Correlation, Manual)

### **3. Select Models**
- Choose which algorithms to train
- Default models are pre-selected based on task type
- Each model trains with default hyperparameters

### **4. Advanced Options**
- **Hyperparameter Tuning:** GridSearch, RandomSearch
- **Cross-Validation:** Set number of folds (2-10)
- **Neural Architecture Search (NAS):** Auto-design neural networks
- **Ensemble Generation:** Combine top models

### **5. Start Training**
- Click "START PIPELINE" button
- Monitor progress in real-time
- View logs and elapsed time
- Observe model training status

### **6. Review Results**
- **Leaderboard:** Ranked model performance
- **Best Model:** Top-performing algorithm
- **Feature Importance:** Most influential features
- **Metrics:** Detailed accuracy/RMSE results

### **7. Export Results**
- Download processed data (CSV, JSON)
- Export best model
- Save pipeline configuration

---

## 🔧 API Documentation

### **Health Check**
```
GET /api/health
```
Response: System status

### **File Upload**
```
POST /api/upload
```
Parameters:
- `file`: Dataset file
- `session_id`: User session ID (optional)

### **Train Pipeline**
```
POST /api/train
```
Body:
```json
{
  "session_id": "user_session_id",
  "config": {
    "target_column": "column_name",
    "task_type": "classification|regression",
    "models": ["random_forest", "gradient_boosting", ...],
    "hyperparameter_tuning": "none|grid_search|random_search",
    "cv_folds": 5,
    "nas_enabled": true|false,
    "ensemble_enabled": true|false
  }
}
```

### **Export Data**
```
GET /api/export/{session_id}?format=csv|json
```

---

## 📊 Metrics Explained

### **Classification Metrics**
- **Accuracy:** % of correct predictions
- **Precision:** Correct positive predictions / all positive predictions
- **Recall:** Correct positives / all actual positives  
- **F1-Score:** Harmonic mean of precision & recall

### **Regression Metrics**
- **RMSE:** Root Mean Squared Error (lower is better)
- **R² Score:** Coefficient of determination (0-1, higher is better)
- **MAE:** Mean Absolute Error (lower is better)
- **MSE:** Mean Squared Error (lower is better)

---

## ⚙️ Configuration

Edit `backend/config.py` to customize:

```python
# Maximum file size
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB

# Cross-validation folds
CV_FOLDS = 5

# Hyperparameter tuning parameters
HYPERPARAMETER_TUNING_PARAMS = {...}

# Neural Architecture Search configuration  
NAS_CONFIG = {...}
```

---

## 🐛 Troubleshooting

### **"Cannot connect to backend API"**
- Ensure Flask server is running: `python app.py`
- Check if running on `http://127.0.0.1:5000`
- Verify firewall isn't blocking port 5000
- Check browser console (F12) for errors

### **"File upload fails"**
- Verify file format (CSV, Excel, JSON)
- Check file size is under 100MB
- Ensure columns have no special characters
- Verify file encoding (UTF-8 recommended)

### **"Models fail to train"**
- Ensure target column is numeric or categorical
- Check for columns with 100% missing values
- Verify data has at least 10 samples
- Review target column for validity

### **"API health check fails"**
- Port 5000 might be in use
- Try: `python app.py --port 5001`
- Or: `lsof -i :5000` (macOS/Linux) to find process

### **"Browser shows blank page"**
- Verify `frontend/index.html` exists
- Check browser console for JavaScript errors
- Ensure CSS file loads (check Network tab in F12)
- Try hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### **"ModuleNotFoundError: No module named..."**
```bash
# Reinstall dependencies
pip install -r backend/requirements.txt --force-reinstall

# Or upgrade pip first
pip install --upgrade pip
pip install -r backend/requirements.txt
```

---

## 📁 Project Structure

```
AUTO/
├── backend/
│   ├── app.py                      # Main Flask application
│   ├── config.py                   # Configuration settings
│   ├── requirements.txt            # Python dependencies
│   ├── uploads/                    # Temporary data storage
│   └── utils/
│       ├── __init__.py
│       ├── data_handler.py         # Data processing
│       └── ml_pipeline.py          # Model training & evaluation
│
├── frontend/
│   ├── index.html                  # Main UI
│   ├── css/
│   │   └── style.css               # Dark-theme styling
│   └── js/
│       └── app.js                  # UI logic & API calls
│
├── sample_data.csv                 # Example dataset
├── README.md                       # Project overview
├── SETUP_GUIDE.md                  # This file
└── START_SERVER.bat/.sh            # Quick start scripts

```

---

## 🎓 Example Workflow

1. **Prepare Dataset**
   - Use `sample_data.csv` or your own dataset
   - Formats: CSV, Excel, JSON
   - Min ~10-20 rows recommended

2. **Start Development Server**
   ```bash
   cd backend
   python app.py
   # In another terminal:
   cd frontend
   python -m http.server 8000
   ```

3. **Open Web Interface**
   - Navigate to `http://localhost:8000`

4. **Upload & Configure**
   - Select your dataset
   - Choose target column
   - Select models and options

5. **Train & Monitor**
   - Click "START PIPELINE"
   - Watch real-time progress
   - Monitor logs and metrics

6. **Analyze Results**
   - Review leaderboard
   - Check feature importance
   - Examine best model metrics

7. **Export & Deploy**
   - Download processed data
   - Export best model
   - Use results for further analysis

---

## 🚀 Performance Tips

1. **Data Size:** 
   - Optimal: 1K-100K rows
   - Max recommended: 1M rows
   - Consider preprocessing large files externally

2. **Feature Count:**
   - Fewer = faster training
   - Remove irrelevant features
   - Use Feature Selection option

3. **Missing Data:**
   - <5% missing: Use Mean/Median
   - 5-30% missing: Use KNN/Mode
   - >30% missing: Drop columns

4. **Model Selection:**
   - Start with 2-3 models
   - Add complex models for accuracy
   - Use ensemble only when beneficial

5. **Hyperparameter Tuning:**
   - Use GridSearch for small parameter spaces
   - Disable for quick results
   - Enable NAS for custom architectures

---

## 📝 Example Datasets

Popular datasets to test:

1. **Iris Dataset** (Classification)
   - 150 samples, 4 features
   - 3 classes

2. **Housing Prices** (Regression)
   - 506 samples, 13 features
   - Price prediction

3. **Titanic** (Classification)
   - 891 samples, mixed features
   - Survival prediction

4. **Customer Churn** (Classification)
   - Enterprise prediction task

---

## 🔐 Security Notes

- All file uploads are validated
- Maximum file size: 100MB
- Session-based storage (temporary)
- CORS configuration: localhost only
- No data persists between sessions

---

## 🤝 Support & Contribution

For issues:
1. Check browser console (F12)
2. Review Flask server output
3. Check `TROUBLESHOOTING` section
4. Verify all dependencies installed

---

## 📄 License

This project is provided as-is for educational and commercial use.

---

## 🎯 Future Enhancements

- [ ] Real-time model monitoring dashboard
- [ ] Distributed training support
- [ ] Custom model architecture builder
- [ ] Model versioning & comparison
- [ ] Advanced feature engineering
- [ ] Time series forecasting
- [ ] Anomaly detection
- [ ] Model deployment to cloud
- [ ] A/B testing framework
- [ ] Automated report generation

---

**Version:** 1.0.0  
**Last Updated:** February 2024  
**Status:** Production Ready
