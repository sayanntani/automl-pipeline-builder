# Quick Start Guide - AutoML Pipeline Builder

Get the **Advanced AutoML Pipeline Builder** up and running in less than 5 minutes!

## ⚡ Super Fast Setup (2 Minutes)

### Windows Users
```bash
# Option 1: Run the batch script
START_SERVER.bat

# Then in another terminal:
cd frontend
python -m http.server 8000
```

Visit: **http://localhost:8000**

### macOS/Linux Users
```bash
# Option 1: Run the shell script
bash START_SERVER.sh

# Then in another terminal:
cd frontend
python3 -m http.server 8000
```

Visit: **http://localhost:8000**

---

## 📋 Manual 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Start Backend Server (Terminal 1)
```bash
cd backend
python app.py
```

Expected output:
```
 * Running on http://127.0.0.1:5000
```

### Step 3: Start Frontend Server (Terminal 2)
```bash
cd frontend
python -m http.server 8000
```

Expected output:
```
Serving HTTP on http://0.0.0.0:8000
```

### Step 4: Open Web App
Visit in your browser: **http://localhost:8000**

---

## 🎯 Test With Sample Data

### Using sample_data.csv:
1. Click "BROWSE FILES" button
2. Select `sample_data.csv` from project folder
3. Choose Configuration:
   - **Task Type:** Classification
   - **Target Column:** Select your target variable
4. Click "START PIPELINE"
5. Wait for training to complete
6. Review results in the leaderboard

---

## 🚀 What's Happening

### Backend (Port 5000)
- REST API server
- Data processing
- Model training
- ML pipeline execution

### Frontend (Port 8000)
- Web interface
- Configuration panels
- Real-time monitoring
- Results visualization

---

## 📊 Key Features Ready to Use

✅ **8 ML Algorithms** (Classification & Regression)  
✅ **Neural Architecture Search** (NAS)  
✅ **Hyperparameter Tuning** (Grid Search)  
✅ **Ensemble Generation**  
✅ **6 Data Imputation Methods**  
✅ **Feature Scaling & Encoding**  
✅ **Real-time Metrics & Monitoring**  
✅ **Result Export** (CSV, JSON)  

---

## ❌ Troubleshooting

### "Can't connect to backend"
```bash
# Verify Flask is running
# Terminal should show "Running on http://127.0.0.1:5000"

# If port 5000 is in use:
python app.py --port 5001
```

### "ModuleNotFoundError: No module named..."
```bash
# Reinstall dependencies
pip install --force-reinstall -r backend/requirements.txt
```

### "Frontend shows blank page"
```bash
# Hard refresh your browser
# Windows/Linux: Ctrl + Shift + R
# Mac: Cmd + Shift + R
```

### "File upload fails"
- Check file format (CSV, Excel, JSON only)
- Verify file size is under 100MB
- Use UTF-8 encoding for CSV files

---

## 📖 Next Steps

Once you've tested:
1. Read **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for detailed configuration
2. Check **[README.md](README.md)** for all features
3. Review **[ARCHITECTURE.md](ARCHITECTURE.md)** for system design
4. Prepare your own dataset and test!

---

## 🎓 First Time Using?

### Recommended Workflow:
1. **Upload** your dataset (CSV/Excel)
2. **Configure** target column and preprocessing options
3. **Select** models to train (start with defaults)
4. **Monitor** training progress in real-time
5. **Review** leaderboard and feature importance
6. **Export** results for further analysis

---

**That's it!** 🎉 You now have a production-ready AutoML system running locally.

For issues or questions, see [SETUP_GUIDE.md - Troubleshooting](SETUP_GUIDE.md#-troubleshooting)

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
