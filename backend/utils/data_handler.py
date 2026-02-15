import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.preprocessing import StandardScaler, LabelEncoder
import io
import pdfplumber
import warnings
warnings.filterwarnings('ignore')

class DataHandler:
    """Handle data loading, cleaning, and preprocessing"""
    
    def __init__(self):
        self.df = None
        self.original_df = None
        self.feature_types = {}
        self.missing_stats = {}
        
    def load_data(self, file_content, file_type='csv'):
        """Load data from file content - supports CSV, Excel, and PDF"""
        try:
            if file_type == 'csv':
                self.df = pd.read_csv(io.StringIO(file_content))
            elif file_type == 'excel':
                self.df = pd.read_excel(io.BytesIO(file_content))
            elif file_type == 'pdf':
                # Extract tables from PDF
                with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                    tables = []
                    for page in pdf.pages:
                        page_tables = page.extract_tables()
                        if page_tables:
                            for table in page_tables:
                                tables.append(table)
                    
                    if not tables:
                        return False, "No tables found in PDF. Please ensure the PDF contains tabular data."
                    
                    # Use first table
                    table_data = tables[0]
                    
                    # First row as header if it looks like headers
                    headers = table_data[0]
                    data = table_data[1:]
                    
                    self.df = pd.DataFrame(data, columns=headers)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
            
            # Validate dataframe
            if self.df is None or self.df.empty:
                return False, "File is empty or contains no data"
            
            self.original_df = self.df.copy()
            return True, f"Data loaded successfully ({len(self.df)} rows, {len(self.df.columns)} columns)"
        except Exception as e:
            return False, f"Error loading data: {str(e)}"
    
    def analyze_data(self):
        """Analyze data structure and missing values"""
        if self.df is None:
            return None
        
        analysis = {
            'shape': list(self.df.shape),
            'columns': list(self.df.columns),
            'data_types': {col: str(dtype) for col, dtype in self.df.dtypes.items()},
            'missing_values': self.df.isnull().sum().to_dict(),
            'missing_percentage': (self.df.isnull().sum() / len(self.df) * 100).to_dict(),
            'duplicates': int(self.df.duplicated().sum()),
            'numeric_columns': list(self.df.select_dtypes(include=[np.number]).columns),
            'categorical_columns': list(self.df.select_dtypes(include=['object']).columns),
            'statistics': {
                'numeric_stats': self.df.describe().to_dict(),
                'categorical_stats': {col: self.df[col].value_counts().head(5).to_dict() 
                                     for col in self.df.select_dtypes(include=['object']).columns}
            }
        }
        
        self.missing_stats = analysis['missing_values']
        self.feature_types = {col: str(dtype) for col, dtype in self.df.dtypes.items()}
        
        return analysis
    
    def handle_missing_values(self, method='mean', threshold=50):
        """
        Handle missing values using specified method
        method: 'mean', 'median', 'mode', 'forward_fill', 'backward_fill', 'knn', 'drop'
        threshold: Remove columns with missing % > threshold
        """
        if self.df is None:
            return False, "No data loaded"
        
        try:
            # Drop columns with too many missing values
            missing_percent = (self.df.isnull().sum() / len(self.df)) * 100
            cols_to_drop = missing_percent[missing_percent > threshold].index
            self.df = self.df.drop(columns=cols_to_drop)
            
            if len(cols_to_drop) > 0:
                print(f"Dropped columns with >{threshold}% missing values: {list(cols_to_drop)}")
            
            # Handle remaining missing values
            numeric_cols = self.df.select_dtypes(include=[np.number]).columns
            categorical_cols = self.df.select_dtypes(include=['object']).columns
            
            if method == 'mean':
                imputer = SimpleImputer(strategy='mean')
                self.df[numeric_cols] = imputer.fit_transform(self.df[numeric_cols])
                
                imputer_cat = SimpleImputer(strategy='most_frequent')
                self.df[categorical_cols] = imputer_cat.fit_transform(self.df[categorical_cols])
                
            elif method == 'median':
                imputer = SimpleImputer(strategy='median')
                self.df[numeric_cols] = imputer.fit_transform(self.df[numeric_cols])
                
                imputer_cat = SimpleImputer(strategy='most_frequent')
                self.df[categorical_cols] = imputer_cat.fit_transform(self.df[categorical_cols])
                
            elif method == 'mode':
                imputer = SimpleImputer(strategy='most_frequent')
                self.df[numeric_cols] = imputer.fit_transform(self.df[numeric_cols])
                self.df[categorical_cols] = imputer.fit_transform(self.df[categorical_cols])
                
            elif method == 'forward_fill':
                self.df = self.df.fillna(method='ffill')
                self.df = self.df.fillna(method='bfill')
                
            elif method == 'knn':
                imputer = KNNImputer(n_neighbors=5)
                self.df[numeric_cols] = imputer.fit_transform(self.df[numeric_cols])
                
                imputer_cat = SimpleImputer(strategy='most_frequent')
                self.df[categorical_cols] = imputer_cat.fit_transform(self.df[categorical_cols])
                
            elif method == 'drop':
                self.df = self.df.dropna()
            
            return True, f"Missing values handled using {method} method"
        
        except Exception as e:
            return False, f"Error handling missing values: {str(e)}"
    
    def remove_duplicates(self):
        """Remove duplicate rows"""
        if self.df is None:
            return False, "No data loaded"
        
        try:
            initial_count = len(self.df)
            self.df = self.df.drop_duplicates()
            removed_count = initial_count - len(self.df)
            
            return True, f"Removed {removed_count} duplicate rows"
        except Exception as e:
            return False, f"Error removing duplicates: {str(e)}"
    
    def encode_categorical(self):
        """Encode categorical variables"""
        if self.df is None:
            return False, "No data loaded"
        
        try:
            categorical_cols = self.df.select_dtypes(include=['object']).columns
            
            for col in categorical_cols:
                le = LabelEncoder()
                self.df[col] = le.fit_transform(self.df[col].astype(str))
            
            return True, f"Encoded {len(categorical_cols)} categorical columns"
        except Exception as e:
            return False, f"Error encoding categorical data: {str(e)}"
    
    def scale_features(self, method='standard'):
        """Scale numeric features"""
        if self.df is None:
            return False, "No data loaded"
        
        try:
            numeric_cols = self.df.select_dtypes(include=[np.number]).columns
            
            if method == 'standard':
                scaler = StandardScaler()
            elif method == 'minmax':
                from sklearn.preprocessing import MinMaxScaler
                scaler = MinMaxScaler()
            else:
                return False, f"Unknown scaling method: {method}"
            
            self.df[numeric_cols] = scaler.fit_transform(self.df[numeric_cols])
            
            return True, f"Scaled {len(numeric_cols)} numeric columns using {method} scaling"
        except Exception as e:
            return False, f"Error scaling features: {str(e)}"
    
    def get_data_preview(self, rows=5):
        """Get preview of processed data"""
        if self.df is None:
            return None
        
        preview = self.df.head(rows).to_dict('records')
        return preview
    
    def export_data(self, file_format='csv'):
        """Export processed data in multiple formats"""
        if self.df is None:
            return None, "No data to export"
        
        try:
            if file_format == 'csv':
                return self.df.to_csv(index=False), 'csv'
            elif file_format == 'json':
                return self.df.to_json(orient='records'), 'json'
            elif file_format == 'excel':
                # Excel export
                excel_buffer = io.BytesIO()
                with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
                    self.df.to_excel(writer, sheet_name='Data', index=False)
                excel_buffer.seek(0)
                return excel_buffer.getvalue().hex(), 'excel'
            else:
                return None, f"Unsupported format: {file_format}"
        except Exception as e:
            return None, f"Error exporting data: {str(e)}"
