# AutoML Pipeline - Quick Start Guide

## 🎯 Quick Setup (2 minutes)

### Windows Users
1. Navigate to the AUTO folder
2. Double-click **START_SERVER.bat**
3. Wait for "Running on http://127.0.0.1:5000" message
4. Open **frontend/index.html** in your browser (double-click)
5. You're ready to go! 🚀

### macOS/Linux Users
1. Open terminal in the AUTO folder
2. Run: `bash START_SERVER.sh`
3. Wait for "Running on http://127.0.0.1:5000" message
4. Open **frontend/index.html** in your browser
5. You're ready to go! 🚀

---

## 📊 Test with Sample Data

A **sample_data.csv** file is included to test the application:

1. Start the server (see Quick Setup above)
2. Upload **sample_data.csv**
3. Process the data:
   - Handle missing values (mean strategy)
   - Remove duplicates
   - Encode categorical (Department column)
   - Scale features
4. Train models with target: **Salary**
5. View results and comparison

---

## 🎓 What You Can Do

### Upload Your Data
- CSV files (.csv)
- Excel files (.xlsx, .xls)
- Up to 50MB in size

### Automatic Data Cleaning
- ✅ Detect and handle missing values
- ✅ Remove duplicate rows
- ✅ Encode categorical variables
- ✅ Scale numeric features
- ✅ View data statistics and preview

### Train ML Models
- ✅ Automatically train 4 different algorithms
- ✅ Works for regression AND classification
- ✅ Compare model performance
- ✅ View feature importance
- ✅ Export processed data

---

## 🔧 Troubleshooting

### "Cannot connect to backend"
- Make sure START_SERVER.bat/sh is still running
- Check it says "Running on http://localhost:5000"

### "File upload fails"
- Use CSV or Excel (.xlsx, .xls) format
- Check file is under 50MB
- Column names shouldn't have special characters

### "Models won't train"
- Make sure you select a target column
- Target column should be numeric or categorical
- Dataset needs at least a few rows

---

## 💡 Example Tests

### Test 1: Salary Prediction
- Upload: sample_data.csv
- Clean data (handle missing, encode departments)
- Target: Salary
- Expected: Regression task with salary predictions

### Test 2: Use Your Own Data
- Prepare a CSV with your data
- Upload to the application
- Follow the preprocessing steps
- Train and compare models
- Export results

---

## 📚 Features Explained

### Missing Value Strategies
- **Mean**: Use average value (numeric columns)
- **Median**: Use middle value (numeric columns)
- **Mode**: Use most common value
- **KNN**: Use K-Nearest Neighbors (data-aware)
- **Forward Fill**: Use previous value
- **Drop**: Remove rows with missing values

### Scaling Methods
- **Standard Scaling**: Convert to mean=0, std=1 (best for most ML)
- **Min-Max Scaling**: Convert to 0-1 range (preserves distribution)

### Model Types
- **Linear Regression**: Simple, fast, interpretable
- **Random Forest**: Handles non-linear patterns well
- **Gradient Boosting**: Usually highest accuracy
- **SVM**: Works well for smaller datasets

---

## 🎯 Tips for Best Results

1. **Clean Data First**: Handle missing values and duplicates
2. **Proper Target Selection**: Choose the variable to predict
3. **Feature Encoding**: Encode text/categorical columns
4. **Feature Scaling**: Scale features for better performance
5. **Review Metrics**: Check which model performs best
6. **Use Feature Importance**: Understand what drives predictions

---

## ❓ Common Questions

**Q: Can I use this for big data?**
A: Files up to 50MB work fine. For larger data, preprocess externally.

**Q: What's the best imputation strategy?**
A: Start with "mean" for numeric, "mode" for categorical. Try KNN for better accuracy.

**Q: How do I know which model is best?**
A: The application shows a comparison table. Higher accuracy/R² = better model.

**Q: Can I export the results?**
A: Yes! Click "Download Results" to get the processed data as CSV.

---

## 🚀 Next Steps

1. **Try the sample data** to understand the workflow
2. **Upload your own data** and process it
3. **Experiment** with different preprocessing strategies
4. **Compare models** and learn from the results
5. **Export and use** the processed data

---

**Happy AutoML-ing! 🤖**
