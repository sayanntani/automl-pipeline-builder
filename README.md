# AutoML Pipeline - Automated Machine Learning Website

A complete web-based AutoML pipeline application that automatically handles data preprocessing, missing value imputation, feature scaling, and trains multiple machine learning models to find the best fit.

## 🌟 Features

### Data Handling
- **File Upload**: Support for CSV and Excel files
- **Data Analysis**: Automatic detection of data types, missing values, duplicates
- **Missing Value Handling**: Multiple imputation strategies (mean, median, mode, KNN, forward fill, drop)
- **Duplicate Removal**: Automatic detection and removal of duplicate rows
- **Categorical Encoding**: Automatic label encoding for categorical variables
- **Feature Scaling**: Standard scaling and Min-Max scaling support

### Machine Learning
- **Automatic Model Selection**: Trains multiple models and compares them
- **Regression Models**:
  - Linear Regression
  - Random Forest Regressor
  - Gradient Boosting Regressor
  - Support Vector Regressor (SVR)

- **Classification Models**:
  - Logistic Regression
  - Random Forest Classifier
  - Gradient Boosting Classifier
  - Support Vector Classifier (SVC)

- **Model Comparison**: Side-by-side comparison of all trained models
- **Feature Importance**: Automatically extracted from tree-based models
- **Best Model Selection**: Algorithm automatically selects the best performer

### Data Export
- Export processed data as CSV
- Export results for further analysis

## 📁 Project Structure

```
AUTO/
├── backend/
│   ├── app.py                    # Main Flask application
│   ├── config.py                 # Configuration settings
│   ├── requirements.txt           # Python dependencies
│   └── utils/
│       ├── __init__.py
│       ├── data_handler.py       # Data processing operations
│       └── ml_pipeline.py        # ML training and prediction
│
├── frontend/
│   ├── index.html                # Main HTML file
│   ├── css/
│   │   └── style.css             # Complete styling
│   └── js/
│       └── app.js                # Frontend logic and API calls
│
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

#### 1. Clone or Download the Project
```bash
cd AUTO
```

#### 2. Set Up Python Backend

Navigate to the backend directory:
```bash
cd backend
```

Create a virtual environment (recommended):
```bash
python -m venv venv
```

Activate the virtual environment:
- **Windows**:
  ```bash
  venv\Scripts\activate
  ```
- **macOS/Linux**:
  ```bash
  source venv/bin/activate
  ```

Install dependencies:
```bash
pip install -r requirements.txt
```

#### 3. Run the Backend Server

From the `backend` directory (with virtual environment activated):
```bash
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

### 4. Open the Frontend

Navigate to the `frontend` folder and open `index.html` in your web browser:
- **Option 1**: Double-click `index.html`
- **Option 2**: Use a local server:
  ```bash
  # From the frontend directory
  python -m http.server 8000
  ```
  Then visit: http://localhost:8000

## 📖 Usage Guide

### Step 1: Upload Your Data
1. Click on the upload area or browse for a file
2. Select a CSV or Excel file
3. The system will automatically analyze your data and display:
   - Number of rows and columns
   - Data types for each column
   - Missing values and their percentages
   - Duplicate rows count
   - Data preview

### Step 2: Data Preprocessing
1. **Handle Missing Values**: Choose an imputation strategy:
   - **Mean**: Fill numeric columns with mean values (default for numeric)
   - **Median**: Fill numeric columns with median values
   - **Mode**: Fill with most frequent value
   - **KNN**: K-Nearest Neighbors imputation
   - **Forward Fill**: Propagate last valid value forward
   - **Drop**: Remove rows with missing values

2. **Set Missing Value Threshold**: 
   - Automatically removes columns with missing values above this percentage

3. **Remove Duplicates**: 
   - Click the button to identify and remove exact duplicate rows

4. **Encode Categorical Variables**: 
   - Automatically converts text categories to numeric values

5. **Scale Features**: 
   - Choose between Standard Scaling (Z-score) or Min-Max Scaling (0-1)

### Step 3: Train Machine Learning Models
1. Select your **Target Column** (the variable you want to predict)
2. The system automatically:
   - Detects if it's a regression or classification task
   - Splits data into training and testing sets (80-20)
   - Trains 4 different model types
   - Compares model performance
   - Selects the best model

3. View results:
   - **Task Type**: Regression or Classification
   - **Best Model**: Top-performing model with metrics
   - **Models Comparison**: Performance of all trained models
   - **Feature Importance**: Most influential features (tree-based models only)

### Step 4: Export Results
- Download the processed data as CSV
- Use results for further analysis or deployment

## 🔌 API Endpoints

### Data Endpoints
- `POST /api/upload` - Upload and analyze data
- `GET /api/data/<session_id>/analysis` - Get detailed analysis
- `POST /api/data/<session_id>/handle-missing` - Handle missing values
- `POST /api/data/<session_id>/remove-duplicates` - Remove duplicates
- `POST /api/data/<session_id>/encode-categorical` - Encode categories
- `POST /api/data/<session_id>/scale-features` - Scale features
- `GET /api/data/<session_id>/export` - Export processed data

### ML Endpoints
- `POST /api/ml/<session_id>/train` - Train models
- `GET /api/ml/<session_id>/models` - Get trained models info
- `GET /api/ml/<session_id>/feature-importance` - Get feature importance

## 📊 Supported Metrics

### Regression
- **RMSE** (Root Mean Squared Error): Lower is better
- **R² Score**: Higher is better (0-1 scale)
- **MSE** (Mean Squared Error): Lower is better

### Classification
- **Accuracy**: Percentage of correct predictions
- **Precision**: Correct positive predictions / all positive predictions
- **Recall** (Sensitivity): Correct positive predictions / all actual positives
- **F1-Score**: Harmonic mean of precision and recall

## 🛠️ Configuration

Edit `backend/config.py` to customize:
- Debug mode
- Upload folder location
- Maximum file size
- Environment settings

## 📦 Dependencies

### Backend
- **Flask**: Web framework
- **Flask-CORS**: Cross-Origin Resource Sharing
- **pandas**: Data manipulation
- **numpy**: Numerical computing
- **scikit-learn**: Machine learning algorithms
- **scipy**: Scientific computing

## 🐛 Troubleshooting

### Issue: "Cannot connect to backend API"
- Ensure Flask server is running: `python app.py`
- Check if running on port 5000
- Check firewall settings

### Issue: "File upload fails"
- Verify file format is CSV or Excel (.xlsx, .xls)
- Check file size is under 50MB
- Ensure no special characters in column names

### Issue: "Models fail to train"
- Ensure target column is numeric or has few unique values
- Check for columns with all missing values
- Verify data has at least 2 samples

### Issue: "Feature importance not showing"
- Some models (e.g., SVM, Linear Regression) don't support feature importance
- Feature importance only shows for tree-based models

## 🚀 Performance Tips

1. **Data Size**: For large files (>100MB), consider preprocessing externally
2. **Feature Count**: More features = longer training time
3. **Missing Values**: High missing percentages may require manual intervention
4. **Data Quality**: Clean data leads to better models

## 📝 Example Workflow

1. Prepare a dataset (e.g., housing prices, customer churn, sales data)
2. Upload the CSV file
3. Remove missing values using mean interpolation
4. Remove duplicates
5. Encode any categorical features
6. Scale the features
7. Select your target variable (e.g., "price", "churn")
8. Train models
9. Review the best model performance
10. Export the processed data

## 📄 License

This project is provided as-is for educational and commercial use.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check browser console for errors (F12)
4. Check Flask server output for errors

## 🎯 Future Enhancements

- [ ] Hyperparameter tuning
- [ ] Cross-validation support
- [ ] Custom model selection
- [ ] Model deployment
- [ ] Time series forecasting
- [ ] Clustering algorithms
- [ ] Anomaly detection
- [ ] Data validation rules
- [ ] Model versioning
- [ ] Prediction interface

---

**Created**: February 2024
**Version**: 1.0
**Status**: Production Ready
