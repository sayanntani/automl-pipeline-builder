# AutoML Pipeline - Complete File Structure & Documentation

## 📁 Directory Tree

```
AUTO/
├── backend/                          # Flask Python Backend
│   ├── app.py                        # Main Flask application with API routes
│   ├── config.py                     # Configuration settings
│   ├── requirements.txt               # Python package dependencies
│   └── utils/                        # Utility modules
│       ├── __init__.py               # Python package marker
│       ├── data_handler.py           # Data processing operations
│       └── ml_pipeline.py            # ML model training and evaluation
│
├── frontend/                         # Web User Interface
│   ├── index.html                    # Main HTML file with page structure
│   ├── css/
│   │   └── style.css                 # Complete CSS styling
│   └── js/
│       └── app.js                    # JavaScript for frontend logic
│
├── README.md                         # Complete project documentation
├── QUICK_START.md                    # Quick setup and usage guide
├── ARCHITECTURE.md                   # Technical architecture overview
├── FILE_STRUCTURE.md                 # This file
├── sample_data.csv                   # Sample dataset for testing
├── START_SERVER.bat                  # Windows startup script
└── START_SERVER.sh                   # Linux/macOS startup script
```

## 📄 File Descriptions

### Backend Files

#### `backend/app.py`
**Purpose**: Main Flask web application and API endpoints  
**Key Functions**:
- Flask application initialization
- CORS configuration for cross-origin requests
- API route definitions
- Error handling and response formatting
- Session management

**Key Routes** (16 endpoints):
- `GET /api/health` - Server health check
- `POST /api/upload` - File upload and initial analysis
- `GET /api/data/<id>/analysis` - Get data analysis details
- `POST /api/data/<id>/handle-missing` - Handle missing values
- `POST /api/data/<id>/remove-duplicates` - Remove duplicate rows
- `POST /api/data/<id>/encode-categorical` - Encode categorical variables
- `POST /api/data/<id>/scale-features` - Scale numeric features
- `GET /api/data/<id>/export` - Export processed data
- `POST /api/ml/<id>/train` - Train ML models
- `GET /api/ml/<id>/models` - Get trained models info
- `GET /api/ml/<id>/feature-importance` - Get feature importance

**Dependencies**:
- Flask (web framework)
- Flask-CORS (cross-origin support)
- werkzeug (file handling)
- Custom utils modules

**Lines of Code**: ~400

---

#### `backend/config.py`
**Purpose**: Configuration management for different environments  
**Key Classes**:
- `Config` - Base configuration
- `DevelopmentConfig` - Development settings
- `TestingConfig` - Testing settings
- `ProductionConfig` - Production settings

**Configuration Options**:
- DEBUG mode
- TESTING mode
- UPLOAD_FOLDER path
- MAX_CONTENT_LENGTH (file size limit)

**Lines of Code**: ~30

---

#### `backend/requirements.txt`
**Purpose**: Lists all Python package dependencies  
**Packages**:
- Flask==2.3.3 - Web framework
- Flask-CORS==4.0.0 - CORS support
- pandas==2.0.3 - Data manipulation
- numpy==1.24.3 - Numerical computing
- scikit-learn==1.3.0 - ML algorithms
- scipy==1.11.2 - Scientific computing

**Installation**: `pip install -r requirements.txt`

---

#### `backend/utils/__init__.py`
**Purpose**: Python package marker  
**Content**: Makes utils directory a Python package  
**Lines of Code**: 1

---

#### `backend/utils/data_handler.py`
**Purpose**: Core data processing and manipulation  
**Key Class**: `DataHandler`  
**Key Methods**:
- `load_data()` - Load CSV and Excel files
- `analyze_data()` - Analyze data structure and statistics
- `handle_missing_values()` - Impute missing values (6 strategies)
- `remove_duplicates()` - Remove duplicate rows
- `encode_categorical()` - Convert text to numeric
- `scale_features()` - Standardize/normalize features
- `get_data_preview()` - Return preview data
- `export_data()` - Export to CSV or JSON

**Imputation Strategies**:
1. Mean (numeric) / Mode (categorical)
2. Median (numeric) / Mode (categorical)
3. Mode (all columns)
4. Forward/Backward fill
5. KNN imputation
6. Drop missing rows

**Dependencies**:
- pandas - Data manipulation
- numpy - Numerical operations
- sklearn - Preprocessing and imputation
- scipy - Scientific functions

**Lines of Code**: ~350

---

#### `backend/utils/ml_pipeline.py`
**Purpose**: Machine learning model training and evaluation  
**Key Class**: `MLPipeline`  
**Key Methods**:
- `prepare_data()` - Prepare and split data
- `train_models()` - Train multiple models
- `get_model_comparison()` - Format model comparison
- `get_best_model_info()` - Get best model details
- `predict()` - Make predictions
- `get_feature_importance()` - Extract feature importance

**Supported Models**:
**Regression** (R², RMSE, MSE):
- Linear Regression
- Random Forest Regressor
- Gradient Boosting Regressor
- Support Vector Regressor

**Classification** (Accuracy, Precision, Recall, F1):
- Logistic Regression
- Random Forest Classifier
- Gradient Boosting Classifier
- Support Vector Classifier

**Task Auto-Detection**: 
- Integer target with <10 unique values = Classification
- Integer target with >10 unique values = Regression
- Float target = Regression
- String target = Classification

**Dependencies**:
- pandas - Data handling
- numpy - Numerical operations
- sklearn - ML algorithms and metrics

**Lines of Code**: ~300

---

### Frontend Files

#### `frontend/index.html`
**Purpose**: Main web page structure and layout  
**Key Sections**:
1. Navigation bar with branding
2. Upload section (file input, drag-drop)
3. Analysis section (overview, preview, preprocessing)
4. ML section (training, results, comparison)
5. Footer with credits

**Form Elements**:
- File input with drag-drop
- Select boxes for strategies
- Input fields for parameters
- Data preview table

**Contains IDs for**:
- `upload-area` - Drop zone
- `file-input` - File input
- `analysis-section` - Data analysis UI
- `ml-section` - ML training UI
- And 20+ more element IDs

**Dependencies**:
- css/style.css - Styling
- js/app.js - JavaScript logic

**Lines of Code**: ~350

---

#### `frontend/css/style.css`
**Purpose**: Complete styling for responsive web interface  
**Key Components**:
- CSS Variables (--primary-color, --shadow-md, etc.)
- Navbar styling (gradient, responsive)
- Card layouts and grid systems
- Form controls (inputs, selects, buttons)
- Table styling for data preview
- Alert/notification styling
- Loading spinner animation
- Responsive design (breakpoint at 768px)
- Dark/Light color scheme
- Hover and active states
- Animations (slideIn, spin)

**CSS Sections**:
1. Root variables (colors, shadows)
2. Base styles (*, body, container)
3. Navbar
4. Sections and cards
5. Grids and layouts
6. Buttons and forms
7. Tables
8. Alerts
9. Loading states
10. Responsive queries

**Key Features**:
- Mobile-first responsive design
- Smooth transitions and animations
- Modern color scheme
- Accessibility-friendly
- No external dependencies

**Lines of Code**: ~700

---

#### `frontend/js/app.js`
**Purpose**: Frontend logic, API communication, and user interactions  
**Key Functions**:

**Initialization**:
- `setupEventListeners()` - Setup event handlers
- `checkApiHealth()` - Verify backend connectivity

**File Upload**:
- `handleFileUpload()` - Handle file selection
- Drag-drop event handlers
- File validation

**Data Operations**:
- `displayDataAnalysis()` - Show data overview
- `displayMissingValues()` - Show missing value details
- `displayDataPreview()` - Display table preview
- `handleMissingValues()` - API call to impute missing
- `removeDuplicates()` - API call to remove duplicates
- `encodeCategorical()` - API call to encode
- `scaleFeatures()` - API call to scale features

**ML Operations**:
- `trainModels()` - Train ML models
- `displayModelsInformation()` - Show results
- `displayBestModel()` - Display top model
- `displayModelsComparison()` - Show comparison table
- `loadFeatureImportance()` - Fetch feature importance
- `displayFeatureImportance()` - Render importance

**Navigation**:
- `goToMLSection()` - Switch to ML section
- `goToAnalysisSection()` - Switch to analysis section
- `showSection()` - Generic section switcher

**Export**:
- `downloadResults()` - Export processed data
- `downloadFile()` - Handle file download

**UI Helpers**:
- `showLoading()` - Show/hide loading spinner
- `showAlert()` - Display notifications
- `showError()` - Display error messages
- `showProcessingStatus()` - Show status message
- `updateSessionInfo()` - Update session display

**API Base URL**: `http://localhost:5000/api`

**Key Variables**:
- `currentSessionId` - Active session
- `currentAnalysis` - Cached analysis data

**Dependencies**:
- Fetch API (HTTP requests)
- DOM manipulation (vanilla JavaScript)

**Lines of Code**: ~650

---

### Documentation Files

#### `README.md`
**Purpose**: Complete project documentation  
**Sections**:
- Project features overview
- Project structure diagram
- Installation instructions (Windows/macOS/Linux)
- Usage step-by-step guide
- API endpoint reference
- Supported metrics explanation
- Configuration options
- Troubleshooting guide
- Performance tips
- Example workflow
- Future enhancements

**Lines of Code**: ~400

---

#### `QUICK_START.md`
**Purpose**: Quick setup and first-use guide  
**Sections**:
- 2-minute quick setup (Windows/macOS/Linux)
- Test with sample data
- What you can do
- Troubleshooting quick answers
- Example use cases
- Tips for best results
- Common Q&A

**Lines of Code**: ~200

---

#### `ARCHITECTURE.md`
**Purpose**: Technical architecture documentation  
**Sections**:
- Architecture diagram
- Complete data flow explanation
- Key component descriptions
- Security features
- Performance optimizations
- Supported data types
- Model selection logic
- Metrics explanations
- Configuration details
- Dependencies and versions
- Testing recommendations
- Debugging tips
- Learning path
- Potential enhancements

**Lines of Code**: ~450

---

### Data & Setup Files

#### `sample_data.csv`
**Purpose**: Sample dataset for testing  
**Content**: Employee data with columns:
- Age (numeric)
- Salary (numeric)
- Years_Experience (numeric)
- Department (categorical)
- Performance_Score (numeric with some missing)
- Bonus (numeric)

**Rows**: 20 data rows + header  
**Features**: Contains missing values, multiple data types, good for testing

---

#### `START_SERVER.bat`
**Purpose**: Windows batch script to start the server  
**Steps**:
1. Check Python installation
2. Navigate to backend directory
3. Create virtual environment if needed
4. Activate virtual environment
5. Install dependencies
6. Start Flask server

**Usage**: Double-click the file

---

#### `START_SERVER.sh`
**Purpose**: Linux/macOS shell script to start the server  
**Steps**: Same as batch file but for Unix systems  
**Usage**: `bash START_SERVER.sh`

---

## 📊 File Statistics

| Category | File | Lines | Purpose |
|----------|------|-------|---------|
| Backend | app.py | ~400 | API & Routes |
| Backend | config.py | ~30 | Configuration |
| Backend | data_handler.py | ~350 | Data Processing |
| Backend | ml_pipeline.py | ~300 | ML Training |
| Frontend | index.html | ~350 | HTML Structure |
| Frontend | style.css | ~700 | Styling |
| Frontend | app.js | ~650 | JavaScript Logic |
| Docs | README.md | ~400 | Main Docs |
| Docs | QUICK_START.md | ~200 | Quick Guide |
| Docs | ARCHITECTURE.md | ~450 | Tech Docs |
| **Total** | **Total** | **~4,000** | **Complete Project** |

## 🔄 File Dependencies

```
index.html
├── css/style.css
└── js/app.js
    └── API calls to Flask backend

app.py
├── config.py
└── utils/
    ├── data_handler.py
    └── ml_pipeline.py
        ├── pandas
        ├── numpy
        └── scikit-learn

requirements.txt
└── Lists all pip packages needed
```

## 📝 Modification Guide

### To Add a New Preprocessing Step
1. Add method to `DataHandler` class in `data_handler.py`
2. Add Flask route in `app.py`
3. Add frontend button/control in `index.html`
4. Add styling in `style.css` (if needed)
5. Add JavaScript function in `app.js`

### To Add a New ML Model
1. Add model to `_train_regression_models()` or `_train_classification_models()` in `ml_pipeline.py`
2. Model will automatically be trained and compared
3. No frontend changes needed!

### To Change Styling
- Edit `frontend/css/style.css`
- Changes are immediate in browser (refresh)

### To Change Behavior
- Edit `frontend/js/app.js` for UI behavior
- Edit `backend/utils/ml_pipeline.py` for ML behavior
- Edit `backend/utils/data_handler.py` for data processing

## 🎯 Entry Points

**For Users**: 
- Open `frontend/index.html` in web browser

**For Developers**:
- Start: `python backend/app.py` (needs Python setup)
- Frontend: Any changes in `frontend/` auto-reload in browser

## ✅ Verification Checklist

- [ ] All backend files present (app.py, config.py, requirements.txt, utils/)
- [ ] All frontend files present (index.html, css/style.css, js/app.js)
- [ ] Documentation files present (README.md, QUICK_START.md, etc.)
- [ ] Startup scripts present (START_SERVER.bat/sh)
- [ ] Sample data present (sample_data.csv)
- [ ] Python dependencies installed
- [ ] Flask server running
- [ ] Frontend can access http://localhost:5000

---

**Version**: 1.0  
**Last Updated**: February 2024  
**Total Files**: 15  
**Total Lines of Code**: ~4,000
