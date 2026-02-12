from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import hashlib
from utils.data_handler import DataHandler
from utils.ml_pipeline import MLPipeline
from config import config

app = Flask(__name__)

# Secure CORS configuration - only allow localhost
cors_config = {
    "origins": ["http://localhost:5000", "http://127.0.0.1:5000", "http://localhost", "http://127.0.0.1"],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True,
    "max_age": 3600
}
CORS(app, resources={r"/api/*": cors_config})

# Security headers middleware
@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    return response

# Configuration
env = os.getenv('FLASK_ENV', 'development')
app.config.from_object(config[env])

# Create uploads folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Store data handlers and pipelines per session
data_handlers = {}
pipelines = {}

# Frontend path
frontend_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))

# ==================== FRONTEND ROUTES ====================

@app.route('/', methods=['GET'])
def serve_index():
    """Serve the main HTML file"""
    index_path = os.path.join(frontend_folder, 'index.html')
    if os.path.exists(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            return f.read()
    return jsonify({'error': 'Frontend not found'}), 404

@app.route('/css/<path:filename>', methods=['GET'])
def serve_css(filename):
    """Serve CSS files"""
    css_folder = os.path.join(frontend_folder, 'css')
    return send_from_directory(css_folder, filename)

@app.route('/js/<path:filename>', methods=['GET'])
def serve_js(filename):
    """Serve JavaScript files"""
    js_folder = os.path.join(frontend_folder, 'js')
    return send_from_directory(js_folder, filename)

# ==================== DATA HANDLING ROUTES ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'message': 'AutoML API is running'}), 200

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload and load data - with security checks"""
    try:
        # Security: Check file was provided
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Security: Validate filename and get extension
        filename = secure_filename(file.filename)
        if not filename or filename == '':
            return jsonify({'success': False, 'error': 'Invalid filename'}), 400
        
        # Security: Check file extension
        file_ext = os.path.splitext(filename)[1].lower()
        if file_ext not in ['.csv', '.xlsx', '.xls', '.pdf']:
            return jsonify({'success': False, 'error': 'Unsupported file type. Supported: CSV, Excel (.xlsx, .xls), PDF'}), 400
        
        # Security: Check file size before reading (50MB limit)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        max_size = app.config['MAX_CONTENT_LENGTH']
        if file_size > max_size:
            return jsonify({'success': False, 'error': f'File too large. Max size: {max_size / (1024*1024):.0f}MB'}), 413
        
        # Security: Read and validate file content
        try:
            if file_ext == '.csv':
                file_content = file.read().decode('utf-8')
                # Validate CSV content is not empty
                if not file_content or len(file_content.strip()) == 0:
                    return jsonify({'success': False, 'error': 'File is empty'}), 400
                file_type = 'csv'
            elif file_ext == '.pdf':
                file_content = file.read()
                if not file_content or len(file_content) == 0:
                    return jsonify({'success': False, 'error': 'File is empty'}), 400
                file_type = 'pdf'
            else:
                # Excel files
                file_content = file.read()
                if not file_content or len(file_content) == 0:
                    return jsonify({'success': False, 'error': 'File is empty'}), 400
                file_type = 'excel'
        except UnicodeDecodeError:
            return jsonify({'success': False, 'error': 'File encoding error. Use UTF-8 for CSV'}), 400
        
        # Security: Create safe session ID using hash
        file_hash = hashlib.sha256(filename.encode()).hexdigest()[:16]
        session_id = f"session_{file_hash}"
        
        # Initialize data handler
        handler = DataHandler()
        success, message = handler.load_data(file_content, file_type)
        
        if not success:
            return jsonify({'success': False, 'error': message}), 400
        
        # Store handler
        data_handlers[session_id] = handler
        
        # Analyze data
        analysis = handler.analyze_data()
        
        return jsonify({
            'success': True,
            'message': message,
            'session_id': session_id,
            'analysis': analysis,
            'preview': handler.get_data_preview(5)
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data/<session_id>/analysis', methods=['GET'])
def get_data_analysis(session_id):
    """Get detailed data analysis"""
    try:
        if session_id not in data_handlers:
            return jsonify({'success': False, 'error': 'Session not found'}), 404
        
        handler = data_handlers[session_id]
        analysis = handler.analyze_data()
        preview = handler.get_data_preview(10)
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'preview': preview
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data/<session_id>/handle-missing', methods=['POST'])
def handle_missing_values(session_id):
    """Handle missing values in data"""
    try:
        if session_id not in data_handlers:
            return jsonify({'success': False, 'error': 'Session not found'}), 404
        
        data = request.get_json()
        method = data.get('method', 'mean')
        threshold = data.get('threshold', 50)
        
        handler = data_handlers[session_id]
        success, message = handler.handle_missing_values(method=method, threshold=threshold)
        
        if not success:
            return jsonify({'success': False, 'error': message}), 400
        
        analysis = handler.analyze_data()
        preview = handler.get_data_preview(5)
        
        return jsonify({
            'success': True,
            'message': message,
            'analysis': analysis,
            'preview': preview
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data/<session_id>/remove-duplicates', methods=['POST'])
def remove_duplicates(session_id):
    """Remove duplicate rows"""
    try:
        if session_id not in data_handlers:
            return jsonify({'success': False, 'error': 'Session not found'}), 404
        
        handler = data_handlers[session_id]
        success, message = handler.remove_duplicates()
        
        if not success:
            return jsonify({'success': False, 'error': message}), 400
        
        analysis = handler.analyze_data()
        
        return jsonify({
            'success': True,
            'message': message,
            'analysis': analysis
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data/<session_id>/encode-categorical', methods=['POST'])
def encode_categorical(session_id):
    """Encode categorical variables"""
    try:
        if session_id not in data_handlers:
            return jsonify({'success': False, 'error': 'Session not found'}), 404
        
        handler = data_handlers[session_id]
        success, message = handler.encode_categorical()
        
        if not success:
            return jsonify({'success': False, 'error': message}), 400
        
        analysis = handler.analyze_data()
        
        return jsonify({
            'success': True,
            'message': message,
            'analysis': analysis
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data/<session_id>/scale-features', methods=['POST'])
def scale_features(session_id):
    """Scale numeric features"""
    try:
        if session_id not in data_handlers:
            return jsonify({'success': False, 'error': 'Session not found'}), 404
        
        data = request.get_json()
        method = data.get('method', 'standard')
        
        handler = data_handlers[session_id]
        success, message = handler.scale_features(method=method)
        
        if not success:
            return jsonify({'success': False, 'error': message}), 400
        
        preview = handler.get_data_preview(5)
        
        return jsonify({
            'success': True,
            'message': message,
            'preview': preview
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/data/<session_id>/export', methods=['GET'])
def export_data(session_id):
    """Export processed data"""
    try:
        if session_id not in data_handlers:
            return jsonify({'success': False, 'error': 'Session not found'}), 404
        
        file_format = request.args.get('format', 'csv')
        handler = data_handlers[session_id]
        content, fmt = handler.export_data(file_format)
        
        if content is None:
            return jsonify({'success': False, 'error': fmt}), 400
        
        return jsonify({
            'success': True,
            'content': content,
            'format': fmt
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== ML PIPELINE ROUTES ====================

@app.route('/api/ml/<session_id>/train', methods=['POST'])
def train_models(session_id):
    """Train machine learning models"""
    try:
        if session_id not in data_handlers:
            return jsonify({'success': False, 'error': 'Session not found'}), 404
        
        data = request.get_json()
        target_column = data.get('target_column')
        
        if not target_column:
            return jsonify({'success': False, 'error': 'Target column not specified'}), 400
        
        handler = data_handlers[session_id]
        pipeline = MLPipeline()
        
        # Prepare data
        success, message = pipeline.prepare_data(handler.df, target_column)
        if not success:
            return jsonify({'success': False, 'error': message}), 400
        
        # Train models
        success, message = pipeline.train_models()
        if not success:
            return jsonify({'success': False, 'error': message}), 400
        
        # Store pipeline
        pipelines[session_id] = pipeline
        
        # Get comparison and best model info
        comparison = pipeline.get_model_comparison()
        best_info = pipeline.get_best_model_info()
        
        return jsonify({
            'success': True,
            'message': message,
            'task_type': pipeline.task_type,
            'models_comparison': comparison,
            'best_model': best_info
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ml/<session_id>/models', methods=['GET'])
def get_models(session_id):
    """Get trained models information"""
    try:
        if session_id not in pipelines:
            return jsonify({'success': False, 'error': 'No trained models found'}), 404
        
        pipeline = pipelines[session_id]
        comparison = pipeline.get_model_comparison()
        best_info = pipeline.get_best_model_info()
        
        return jsonify({
            'success': True,
            'task_type': pipeline.task_type,
            'models_comparison': comparison,
            'best_model': best_info
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/ml/<session_id>/feature-importance', methods=['GET'])
def get_feature_importance(session_id):
    """Get feature importance"""
    try:
        if session_id not in pipelines:
            return jsonify({'success': False, 'error': 'No trained models found'}), 404
        
        pipeline = pipelines[session_id]
        importance = pipeline.get_feature_importance(top_n=10)
        
        return jsonify({
            'success': True,
            'feature_importance': importance
        }), 200
    
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ==================== ERROR HANDLING ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
