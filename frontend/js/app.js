// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
let currentSessionId = null;
let currentAnalysis = null;

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkApiHealth();
});

function setupEventListeners() {
    // File upload
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Click on upload area to trigger file input
    uploadArea.addEventListener('click', (e) => {
        if (!e.target.classList.contains('btn')) {
            fileInput.click();
        }
    });
}

function checkApiHealth() {
    fetch(`${API_BASE_URL}/health`)
        .then(response => {
            if (!response.ok) throw new Error('API not available');
            return response.json();
        })
        .catch(error => {
            showAlert('API Connection Error', 'Cannot connect to backend API. Make sure the Flask server is running on http://localhost:5000', 'error');
            console.error('Health check failed:', error);
        });
}

// ==================== FILE UPLOAD ====================

function handleFileUpload(file) {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 
                         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        showAlert('Invalid File Type', 'Please upload a CSV or Excel file', 'error');
        return;
    }

    if (file.size > 50 * 1024 * 1024) {
        showAlert('File Too Large', 'Maximum file size is 50MB', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    showLoading('upload-loading', true);

    fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        showLoading('upload-loading', false);
        
        if (data.success) {
            currentSessionId = data.session_id;
            currentAnalysis = data.analysis;
            updateSessionInfo(data.session_id);
            displayDataAnalysis(data);
            showSection('analysis-section');
            showAlert('Success', `Data uploaded successfully! File: ${currentSessionId}`, 'info');
        } else {
            showAlert('Upload Error', data.error, 'error');
        }
    })
    .catch(error => {
        showLoading('upload-loading', false);
        showAlert('Upload Error', `Failed to upload file: ${error.message}`, 'error');
        console.error('Upload error:', error);
    });
}

// ==================== DATA ANALYSIS ====================

function displayDataAnalysis(data) {
    const analysis = data.analysis;
    
    // Update overview
    document.getElementById('row-count').textContent = analysis.shape[0];
    document.getElementById('col-count').textContent = analysis.shape[1];
    document.getElementById('duplicate-count').textContent = analysis.duplicates;
    document.getElementById('numeric-count').textContent = analysis.numeric_columns.length;
    document.getElementById('categorical-count').textContent = analysis.categorical_columns.length;

    // Display missing values
    displayMissingValues(analysis.missing_values, analysis.missing_percentage);

    // Display data preview
    displayDataPreview(data.preview);

    // Populate target column select
    populateTargetColumnSelect(analysis.columns);
}

function displayMissingValues(missingValues, missingPercentage) {
    const container = document.getElementById('missing-values-summary');
    container.innerHTML = '';

    const hasMissing = Object.values(missingValues).some(v => v > 0);
    
    if (!hasMissing) {
        container.innerHTML = '<p style="color: #10b981; font-weight: bold;">✓ No missing values found</p>';
        return;
    }

    Object.entries(missingValues).forEach(([column, count]) => {
        if (count > 0) {
            const percentage = missingPercentage[column].toFixed(2);
            const html = `
                <div class="missing-item">
                    <div class="column-name">${column}</div>
                    <div class="missing-info">
                        <span class="missing-count">${count} missing</span>
                        <span class="missing-percent">${percentage}%</span>
                    </div>
                </div>
            `;
            container.innerHTML += html;
        }
    });
}

function displayDataPreview(preview) {
    if (!preview || preview.length === 0) return;

    const table = document.getElementById('data-preview-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    // Clear existing content
    thead.innerHTML = '';
    tbody.innerHTML = '';

    // Create header
    const columns = Object.keys(preview[0]);
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Create rows
    preview.forEach(row => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            const value = row[col];
            td.textContent = value === null ? 'NULL' : (typeof value === 'number' ? value.toFixed(3) : value);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function populateTargetColumnSelect(columns) {
    const select = document.getElementById('target-column');
    select.innerHTML = '<option value="">-- Choose a column --</option>';
    
    columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.textContent = col;
        select.appendChild(option);
    });
}

// ==================== DATA PREPROCESSING ====================

function handleMissingValues() {
    if (!currentSessionId) return;

    const method = document.getElementById('missing-method').value;
    const threshold = parseFloat(document.getElementById('missing-threshold').value);

    const payload = { method, threshold };

    showProcessingStatus('Handling missing values...');

    fetch(`${API_BASE_URL}/data/${currentSessionId}/handle-missing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentAnalysis = data.analysis;
            displayDataAnalysis(data);
            showAlert('Success', data.message, 'success');
        } else {
            showAlert('Error', data.error, 'error');
        }
    })
    .catch(error => {
        showAlert('Error', `Failed to handle missing values: ${error.message}`, 'error');
        console.error('Error:', error);
    });
}

function removeDuplicates() {
    if (!currentSessionId) return;

    showProcessingStatus('Removing duplicates...');

    fetch(`${API_BASE_URL}/data/${currentSessionId}/remove-duplicates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentAnalysis = data.analysis;
            displayDataAnalysis(data);
            showAlert('Success', data.message, 'success');
        } else {
            showAlert('Error', data.error, 'error');
        }
    })
    .catch(error => {
        showAlert('Error', `Failed to remove duplicates: ${error.message}`, 'error');
        console.error('Error:', error);
    });
}

function encodeCategorical() {
    if (!currentSessionId) return;

    showProcessingStatus('Encoding categorical variables...');

    fetch(`${API_BASE_URL}/data/${currentSessionId}/encode-categorical`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentAnalysis = data.analysis;
            displayDataAnalysis(data);
            showAlert('Success', data.message, 'success');
        } else {
            showAlert('Error', data.error, 'error');
        }
    })
    .catch(error => {
        showAlert('Error', `Failed to encode categorical data: ${error.message}`, 'error');
        console.error('Error:', error);
    });
}

function scaleFeatures() {
    if (!currentSessionId) return;

    const method = document.getElementById('scaling-method').value;
    const payload = { method };

    showProcessingStatus('Scaling features...');

    fetch(`${API_BASE_URL}/data/${currentSessionId}/scale-features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayDataPreview(data.preview);
            showAlert('Success', data.message, 'success');
        } else {
            showAlert('Error', data.error, 'error');
        }
    })
    .catch(error => {
        showAlert('Error', `Failed to scale features: ${error.message}`, 'error');
        console.error('Error:', error);
    });
}

// ==================== ML TRAINING ====================

function goToMLSection() {
    showSection('ml-section');
    window.scrollTo(0, 0);
}

function trainModels() {
    const targetColumn = document.getElementById('target-column').value;

    if (!targetColumn) {
        showAlert('Missing Configuration', 'Please select a target column', 'error');
        return;
    }

    if (!currentSessionId) {
        showAlert('Error', 'No data loaded', 'error');
        return;
    }

    const payload = { target_column: targetColumn };

    showLoading('training-loading', true);
    document.getElementById('training-error').classList.add('hidden');

    fetch(`${API_BASE_URL}/ml/${currentSessionId}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        showLoading('training-loading', false);

        if (data.success) {
            displayModelsInformation(data);
            document.getElementById('models-info-section').classList.remove('hidden');
            document.getElementById('nav-buttons').style.display = 'flex';
            showAlert('Success', 'Models trained successfully!', 'success');
        } else {
            showError('training-error', data.error);
            console.error('Training error:', data.error);
        }
    })
    .catch(error => {
        showLoading('training-loading', false);
        showError('training-error', `Failed to train models: ${error.message}`);
        console.error('Error:', error);
    });
}

function displayModelsInformation(data) {
    // Display task type
    const taskTypeEl = document.getElementById('task-type-display');
    const taskType = data.task_type;
    taskTypeEl.innerHTML = `
        <div style="display: inline-block; padding: 12px 20px; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; border-radius: 6px; font-size: 16px; font-weight: bold;">
            ${taskType === 'classification' ? '🏷️ Classification' : '📊 Regression'}
        </div>
    `;

    // Display best model information
    displayBestModel(data.best_model);

    // Display models comparison
    displayModelsComparison(data.models_comparison, data.task_type);

    // Load and display feature importance
    loadFeatureImportance();
}

function displayBestModel(bestModel) {
    const container = document.getElementById('best-model-info');
    
    if (!bestModel) {
        container.innerHTML = '<p>No models were successfully trained</p>';
        return;
    }

    const metricKeys = Object.keys(bestModel.metrics);
    const metricsHtml = metricKeys
        .filter(k => k !== 'model')
        .map(key => `
            <div class="metric">
                <div class="metric-label">${key}</div>
                <div class="metric-value">${bestModel.metrics[key]}</div>
            </div>
        `)
        .join('');

    container.innerHTML = `
        <div class="model-name">🏆 ${bestModel.model_name}</div>
        <div class="model-score">Best Score: ${bestModel.best_score}</div>
        <div class="metrics-grid">
            ${metricsHtml}
        </div>
    `;
}

function displayModelsComparison(comparison, taskType) {
    const table = document.getElementById('models-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    thead.innerHTML = '';
    tbody.innerHTML = '';

    if (Object.keys(comparison).length === 0) {
        tbody.innerHTML = '<tr><td colspan="10">No models to display</td></tr>';
        return;
    }

    // Get all unique metric names
    const allMetrics = new Set();
    Object.values(comparison).forEach(metrics => {
        Object.keys(metrics).forEach(m => allMetrics.add(m));
    });

    // Create header
    const headerRow = document.createElement('tr');
    const modelHeader = document.createElement('th');
    modelHeader.textContent = 'Model';
    headerRow.appendChild(modelHeader);

    Array.from(allMetrics).forEach(metric => {
        const th = document.createElement('th');
        th.textContent = metric;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Create rows
    Object.entries(comparison).forEach(([model, metrics]) => {
        const tr = document.createElement('tr');

        const modelCell = document.createElement('td');
        modelCell.textContent = model;
        modelCell.style.fontWeight = 'bold';
        tr.appendChild(modelCell);

        Array.from(allMetrics).forEach(metric => {
            const td = document.createElement('td');
            td.textContent = metric in metrics ? metrics[metric] : 'N/A';
            td.style.textAlign = 'right';
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

function loadFeatureImportance() {
    if (!currentSessionId) return;

    fetch(`${API_BASE_URL}/ml/${currentSessionId}/feature-importance`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayFeatureImportance(data.feature_importance);
            }
        })
        .catch(error => console.error('Error loading feature importance:', error));
}

function displayFeatureImportance(importance) {
    const container = document.getElementById('feature-importance-list');
    container.innerHTML = '';

    if (!importance || importance.length === 0) {
        container.innerHTML = '<p>No feature importance data available (tree-based models only)</p>';
        return;
    }

    const maxScore = Math.max(...importance.map(f => f.importance));

    importance.forEach((feature, index) => {
        const percentage = (feature.importance / maxScore * 100).toFixed(1);
        const html = `
            <div class="feature-item">
                <div class="feature-name">${index + 1}. ${feature.feature}</div>
                <div class="feature-score">${feature.importance.toFixed(4)}</div>
            </div>
            <div class="feature-bar">
                <div class="feature-bar-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        container.innerHTML += html;
    });
}

// ==================== NAVIGATION ====================

function goToAnalysisSection() {
    showSection('analysis-section');
    window.scrollTo(0, 0);
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// ==================== EXPORT ====================

function downloadResults() {
    if (!currentSessionId) return;

    fetch(`${API_BASE_URL}/data/${currentSessionId}/export?format=csv`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                downloadFile(data.content, `automl_processed_${currentSessionId}.csv`, 'text/csv');
                showAlert('Success', 'Data exported successfully', 'success');
            } else {
                showAlert('Error', data.error, 'error');
            }
        })
        .catch(error => {
            showAlert('Error', `Failed to export data: ${error.message}`, 'error');
        });
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

// ==================== UI HELPERS ====================

function showLoading(elementId, show = true) {
    const element = document.getElementById(elementId);
    if (element) {
        if (show) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    }
}

function showAlert(title, message, type = 'info') {
    const alertHtml = `
        <div style="display: flex; gap: 15px;">
            <div style="font-weight: bold;">${title}:</div>
            <div>${message}</div>
        </div>
    `;

    // Create temporary alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = alertHtml;

    // Insert at top of container
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.remove('hidden');
    }
}

function showProcessingStatus(message) {
    const statusEl = document.getElementById('processing-status');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.classList.remove('hidden');
    }
}

function updateSessionInfo(sessionId) {
    document.getElementById('session-info').textContent = `📌 Session: ${sessionId}`;
}
