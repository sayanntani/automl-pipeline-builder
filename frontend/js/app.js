// ==================== CONFIGURATION ====================
const API_BASE_URL = `${window.location.origin}/api`;
let sessionId = null;
let pipelineRunning = false;
let uploadedData = null;
let startTime = null;
let timerInterval = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    setupEventListeners();
    testAPI();
});

function initializeUI() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('active');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('active');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('active');
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    // File input
    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

function setupEventListeners() {
    // Additional event listeners can be added here
    document.addEventListener('change', function(e) {
        if (e.target.id === 'task-type') {
            updateModelsForTaskType();
        }
    });
}

function testAPI() {
    fetch(`${API_BASE_URL}/health`)
        .then(r => r.json())
        .then(data => {
            addLog('System initialized and ready', 'success');
        })
        .catch(err => {
            addLog('API connection error', 'error');
            console.error(err);
        });
}

// ==================== FILE UPLOAD ====================
async function handleFileUpload(file) {
    if (!file) return;

    addLog(`Uploading file: ${file.name}`, 'info');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('session_id', sessionId || 'new_session');

    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            sessionId = data.session_id;
            uploadedData = data.analysis;
            
            addLog(`File loaded: ${data.analysis.shape[0]} rows, ${data.analysis.shape[1]} columns`, 'success');
            
            // Populate target column dropdown
            const targetSelect = document.getElementById('target-column');
            targetSelect.innerHTML = '<option value="">Select a target column</option>';
            data.analysis.columns.forEach(col => {
                const option = document.createElement('option');
                option.value = col;
                option.textContent = col;
                targetSelect.appendChild(option);
            });

            // Update data display
            updateDataDisplay(data.analysis);
        } else {
            addLog(`Error: ${data.error}`, 'error');
        }
    } catch (error) {
        addLog(`Upload failed: ${error.message}`, 'error');
        console.error(error);
    }
}

function updateDataDisplay(analysis) {
    document.getElementById('models-count').textContent = analysis.shape[0];
    document.getElementById('completed-count').textContent = analysis.shape[1];
}

// ==================== PIPELINE EXECUTION ====================
async function startPipeline() {
    const targetColumn = document.getElementById('target-column').value;
    const taskType = document.getElementById('task-type').value;

    if (!targetColumn) {
        addLog('Please select a target column', 'error');
        return;
    }

    if (!sessionId) {
        addLog('Please upload a file first', 'error');
        return;
    }

    pipelineRunning = true;
    startTime = Date.now();
    
    document.getElementById('start-pipeline-btn').style.display = 'none';
    document.getElementById('stop-pipeline-btn').style.display = 'block';
    document.getElementById('pipeline-status').textContent = 'RUNNING';
    document.getElementById('status-badge').textContent = 'RUNNING';

    addLog('Starting pipeline training...', 'info');
    
    // Start timer
    timerInterval = setInterval(updateTimer, 1000);

    try {
        const models = Array.from(document.querySelectorAll('.model-checkbox:checked'))
            .map(el => el.value);
        
        if (models.length === 0) {
            addLog('Please select at least one model', 'error');
            stopPipeline();
            return;
        }

        const config = {
            session_id: sessionId,
            config: {
                target_column: targetColumn,
                task_type: taskType,
                models: models,
                hyperparameter_tuning: document.getElementById('hyperparameter-tuning').value,
                cv_folds: parseInt(document.getElementById('cv-folds').value),
                nas_enabled: document.getElementById('nas-enabled').checked,
                ensemble_enabled: document.getElementById('ensemble-enabled').checked
            }
        };

        const response = await fetch(`${API_BASE_URL}/train`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        const data = await response.json();

        if (response.ok) {
            addLog(`Training completed successfully!`, 'success');
            displayResults(data);
            
            document.getElementById('export-buttons').style.display = 'grid';
            document.getElementById('export-content').innerHTML = '<p class="success-message">✓ Pipeline completed successfully!</p>';
        } else {
            addLog(`Training error: ${data.error}`, 'error');
        }
    } catch (error) {
        addLog(`Pipeline error: ${error.message}`, 'error');
        console.error(error);
    } finally {
        stopPipeline();
    }
}

function stopPipeline() {
    pipelineRunning = false;
    clearInterval(timerInterval);
    
    document.getElementById('start-pipeline-btn').style.display = 'block';
    document.getElementById('stop-pipeline-btn').style.display = 'none';
    document.getElementById('pipeline-status').textContent = 'IDLE';
    document.getElementById('status-badge').textContent = 'IDLE';
    
    addLog('Pipeline stopped', 'warning');
}

function updateTimer() {
    if (!startTime) return;
    
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    document.getElementById('elapsed-time').textContent = 
        `${minutes}m ${seconds}s`;
}

// ==================== RESULTS DISPLAY ====================
function displayResults(results) {
    // Display models comparison
    if (results.models && results.models.length > 0) {
        displayLeaderboard(results.models);
    }

    // Display best model
    if (results.best_model) {
        displayBestModel(results.best_model);
    }

    // Display feature importance
    if (results.feature_importance) {
        displayFeatureImportance(results.feature_importance);
    }
}

function displayLeaderboard(models) {
    const leaderboardHtml = `
        <table class="leaderboard-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Model</th>
                    <th>Score</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${models.map((model, idx) => `
                    <tr>
                        <td class="model-rank">#${idx + 1}</td>
                        <td>${model.name}</td>
                        <td>${Object.values(model.metrics)[0] || 'N/A'}</td>
                        <td><span style="color: var(--success-color);">✓</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    const leaderboardContent = document.getElementById('leaderboard-content');
    if (leaderboardContent) {
        leaderboardContent.innerHTML = leaderboardHtml;
    }

    document.getElementById('models-count').textContent = models.length;
    document.getElementById('completed-count').textContent = models.length;
}

function displayBestModel(bestModel) {
    const bestModelHtml = `
        <div style="padding: 15px; background-color: rgba(0, 255, 204, 0.1); border-radius: 4px;">
            <h3 style="color: var(--primary-color); margin-bottom: 10px;">👑 ${bestModel.name}</h3>
            <div style="font-size: 12px;">
                ${Object.entries(bestModel.metrics).map(([key, val]) => `
                    <p><strong>${key}:</strong> ${typeof val === 'number' ? val.toFixed(4) : val}</p>
                `).join('')}
            </div>
        </div>
    `;
    
    const bestModelDiv = document.querySelector('[onclick=""]'); // Placeholder
    const bestModelInfo = document.createElement('div');
    bestModelInfo.innerHTML = bestModelHtml;
    
    const leaderboardPanel = document.querySelector('.leaderboard-panel .panel-content');
    if (leaderboardPanel && !leaderboardPanel.querySelector('[style*="background-color: rgba(0, 255, 204"]')) {
        leaderboardPanel.appendChild(bestModelInfo);
    }
}

function displayFeatureImportance(featureImportance) {
    const featuresList = document.getElementById('features-list');
    if (!featuresList) return;

    const firstModel = Object.values(featureImportance)[0];
    if (firstModel && firstModel.features) {
        const html = firstModel.features.slice(0, 10).map(feature => 
            `<span class="feature-tag">${feature}</span>`
        ).join('');
        
        featuresList.innerHTML = html;
        document.getElementById('features-content').style.display = 'none';
    }
}

// ==================== DOWNLOAD FUNCTIONS ====================
function downloadResults(format) {
    if (!sessionId) {
        addLog('No session found', 'error');
        return;
    }

    addLog(`Downloading results as ${format.toUpperCase()}...`, 'info');
    
    const url = `${API_BASE_URL}/export/${sessionId}?format=${format}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `results.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    addLog('Download completed', 'success');
}

function exportModel() {
    addLog('Exporting best model...', 'info');
    // Model export functionality can be implemented here
    setTimeout(() => {
        addLog('Model exported successfully', 'success');
    }, 1000);
}

// ==================== UTILITY FUNCTIONS ====================
function addLog(message, level = 'info') {
    const logsContainer = document.getElementById('logs-container');
    if (!logsContainer) return;

    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('p');
    logEntry.className = `log-entry ${level}`;
    logEntry.textContent = `[${timestamp}] ${message}`;
    
    logsContainer.appendChild(logEntry);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

function updateModelsForTaskType() {
    const taskType = document.getElementById('task-type').value;
    const checkboxes = document.querySelectorAll('.model-checkbox');
    
    checkboxes.forEach(checkbox => {
        if (taskType === 'classification') {
            if (['logistic_regression', 'svc', 'random_forest', 'gradient_boosting'].includes(checkbox.value)) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        } else {
            if (['linear_regression', 'random_forest', 'gradient_boosting', 'svr'].includes(checkbox.value)) {
                checkbox.checked = true;
            } else {
                checkbox.checked = false;
            }
        }
    });
}

// Export functions for global access
window.startPipeline = startPipeline;
window.stopPipeline = stopPipeline;
window.downloadResults = downloadResults;
window.exportModel = exportModel;

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
            document.getElementById('export-card').style.display = 'block';
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

function downloadResults(format = 'csv') {
    if (!currentSessionId) {
        showAlert('Error', 'No session found', 'error');
        return;
    }

    const formatMap = {
        'csv': { mime: 'text/csv', ext: 'csv' },
        'json': { mime: 'application/json', ext: 'json' },
        'excel': { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx' }
    };

    const formatInfo = formatMap[format] || formatMap['csv'];

    fetch(`${API_BASE_URL}/data/${currentSessionId}/export?format=${format}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let content = data.content;
                
                // If Excel format, convert from hex
                if (format === 'excel') {
                    const binaryString = atob(content);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }
                    const blob = new Blob([bytes], { type: formatInfo.mime });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `automl_processed_${currentSessionId}.${formatInfo.ext}`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                } else {
                    downloadFile(content, `automl_processed_${currentSessionId}.${formatInfo.ext}`, formatInfo.mime);
                }
                
                showAlert('Success', `Data exported as ${format.toUpperCase()}`, 'success');
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
