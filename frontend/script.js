/**
 * IoT Sensor Dashboard Frontend JavaScript
 * Handles API communication, data visualization, and user interactions
 */

class SensorDashboard {
    constructor() {
        // Configuration
        this.apiBaseUrl = 'http://localhost:5000/api';
        this.autoRefreshInterval = null;
        this.autoRefreshEnabled = false;
        this.refreshIntervalMs = 5000; // 5 seconds
        
        // DOM elements
        this.elements = {
            connectionStatus: document.getElementById('connection-status'),
            refreshBtn: document.getElementById('refresh-btn'),
            autoRefreshBtn: document.getElementById('auto-refresh-btn'),
            errorMessage: document.getElementById('error-message'),
            errorText: document.getElementById('error-text'),
            loading: document.getElementById('loading'),
            sensorGrid: document.getElementById('sensor-grid'),
            sensorTableBody: document.getElementById('sensor-table-body'),
            lastUpdated: document.getElementById('last-updated')
        };
        
        // Initialize the dashboard
        this.init();
    }
    
    /**
     * Initialize the dashboard application
     */
    init() {
        console.log('Initializing IoT Sensor Dashboard...');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial data load
        this.loadSensorData();
        
        // Set initial connection status
        this.updateConnectionStatus('connecting');
    }
    
    /**
     * Set up event listeners for user interactions
     */
    setupEventListeners() {
        // Refresh button
        this.elements.refreshBtn.addEventListener('click', () => {
            this.loadSensorData();
        });
        
        // Auto-refresh toggle button
        this.elements.autoRefreshBtn.addEventListener('click', () => {
            this.toggleAutoRefresh();
        });
        
        // Handle page visibility change to pause/resume auto-refresh
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoRefresh();
            } else if (this.autoRefreshEnabled) {
                this.resumeAutoRefresh();
            }
        });
    }
    
    /**
     * Load sensor data from the API
     */
    async loadSensorData() {
        this.showLoading(true);
        this.hideError();
        
        try {
            console.log('Fetching sensor data...');
            const response = await fetch(`${this.apiBaseUrl}/sensors`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.status === 'success') {
                this.displaySensorData(data.sensors);
                this.updateConnectionStatus('connected');
                this.updateLastUpdated();
                console.log(`Loaded ${data.count} sensors successfully`);
            } else {
                throw new Error(data.message || 'Unknown API error');
            }
            
        } catch (error) {
            console.error('Error loading sensor data:', error);
            this.showError(`Failed to load sensor data: ${error.message}`);
            this.updateConnectionStatus('disconnected');
        } finally {
            this.showLoading(false);
        }
    }
    
    /**
     * Display sensor data in both grid and table formats
     */
    displaySensorData(sensors) {
        this.displaySensorGrid(sensors);
        this.displaySensorTable(sensors);
    }
    
    /**
     * Display sensors in card grid format
     */
    displaySensorGrid(sensors) {
        const grid = this.elements.sensorGrid;
        grid.innerHTML = '';
        
        sensors.forEach(sensor => {
            const card = this.createSensorCard(sensor);
            grid.appendChild(card);
        });
    }
    
    /**
     * Create a sensor card element
     */
    createSensorCard(sensor) {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow';
        
        const statusColor = this.getStatusColor(sensor.status);
        const statusDot = `<div class="w-3 h-3 rounded-full ${statusColor} inline-block mr-2"></div>`;
        
        card.innerHTML = `
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-800">${sensor.name}</h3>
                <div class="flex items-center">
                    ${statusDot}
                    <span class="text-sm text-gray-600 capitalize">${sensor.status}</span>
                </div>
            </div>
            
            <div class="mb-4">
                <div class="text-3xl font-bold text-gray-900 mb-1">
                    ${sensor.value !== null ? sensor.value : 'N/A'}
                    <span class="text-lg font-normal text-gray-600">${sensor.unit}</span>
                </div>
                <div class="text-sm text-gray-500">${sensor.type.replace('_', ' ').toUpperCase()}</div>
            </div>
            
            <div class="text-sm text-gray-500">
                <div class="mb-1">📍 ${sensor.location}</div>
                <div>🕒 ${this.formatTimestamp(sensor.timestamp)}</div>
            </div>
        `;
        
        return card;
    }
    
    /**
     * Display sensors in table format
     */
    displaySensorTable(sensors) {
        const tbody = this.elements.sensorTableBody;
        tbody.innerHTML = '';
        
        sensors.forEach(sensor => {
            const row = this.createSensorTableRow(sensor);
            tbody.appendChild(row);
        });
    }
    
    /**
     * Create a table row for a sensor
     */
    createSensorTableRow(sensor) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        const statusColor = this.getStatusColor(sensor.status);
        const statusBadge = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${this.getStatusBadgeColor(sensor.status)}">
            <div class="w-2 h-2 rounded-full ${statusColor} mr-1"></div>
            ${sensor.status}
        </span>`;
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${sensor.id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sensor.type.replace('_', ' ')}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${sensor.value !== null ? sensor.value : 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${sensor.unit}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${this.formatTimestamp(sensor.timestamp)}</td>
            <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
        `;
        
        return row;
    }
    
    /**
     * Get status indicator color classes
     */
    getStatusColor(status) {
        const colors = {
            'normal': 'bg-green-500',
            'warning': 'bg-yellow-500',
            'critical': 'bg-red-500',
            'error': 'bg-gray-500'
        };
        return colors[status] || 'bg-gray-500';
    }
    
    /**
     * Get status badge color classes
     */
    getStatusBadgeColor(status) {
        const colors = {
            'normal': 'bg-green-100 text-green-800',
            'warning': 'bg-yellow-100 text-yellow-800',
            'critical': 'bg-red-100 text-red-800',
            'error': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }
    
    /**
     * Format timestamp for display
     */
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }
    
    /**
     * Update connection status indicator
     */
    updateConnectionStatus(status) {
        const statusElement = this.elements.connectionStatus;
        const dot = statusElement.querySelector('div');
        const text = statusElement.querySelector('span');
        
        statusElement.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
        
        switch (status) {
            case 'connected':
                statusElement.classList.add('bg-green-100', 'text-green-800');
                dot.className = 'w-2 h-2 rounded-full mr-2 bg-green-500';
                text.textContent = 'Connected';
                break;
            case 'connecting':
                statusElement.classList.add('bg-yellow-100', 'text-yellow-800');
                dot.className = 'w-2 h-2 rounded-full mr-2 bg-yellow-500 animate-pulse';
                text.textContent = 'Connecting...';
                break;
            case 'disconnected':
                statusElement.classList.add('bg-red-100', 'text-red-800');
                dot.className = 'w-2 h-2 rounded-full mr-2 bg-red-500';
                text.textContent = 'Disconnected';
                break;
        }
    }
    
    /**
     * Toggle auto-refresh functionality
     */
    toggleAutoRefresh() {
        if (this.autoRefreshEnabled) {
            this.stopAutoRefresh();
        } else {
            this.startAutoRefresh();
        }
    }
    
    /**
     * Start auto-refresh
     */
    startAutoRefresh() {
        this.autoRefreshEnabled = true;
        this.autoRefreshInterval = setInterval(() => {
            this.loadSensorData();
        }, this.refreshIntervalMs);
        
        this.elements.autoRefreshBtn.textContent = 'Auto Refresh: ON';
        this.elements.autoRefreshBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        this.elements.autoRefreshBtn.classList.add('bg-red-600', 'hover:bg-red-700');
        
        console.log('Auto-refresh started');
    }
    
    /**
     * Stop auto-refresh
     */
    stopAutoRefresh() {
        this.autoRefreshEnabled = false;
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
        
        this.elements.autoRefreshBtn.textContent = 'Auto Refresh: OFF';
        this.elements.autoRefreshBtn.classList.remove('bg-red-600', 'hover:bg-red-700');
        this.elements.autoRefreshBtn.classList.add('bg-green-600', 'hover:bg-green-700');
        
        console.log('Auto-refresh stopped');
    }
    
    /**
     * Pause auto-refresh (for page visibility change)
     */
    pauseAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }
    
    /**
     * Resume auto-refresh (for page visibility change)
     */
    resumeAutoRefresh() {
        if (this.autoRefreshEnabled && !this.autoRefreshInterval) {
            this.autoRefreshInterval = setInterval(() => {
                this.loadSensorData();
            }, this.refreshIntervalMs);
        }
    }
    
    /**
     * Show loading indicator
     */
    showLoading(show) {
        this.elements.loading.classList.toggle('hidden', !show);
    }
    
    /**
     * Show error message
     */
    showError(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
    }
    
    /**
     * Hide error message
     */
    hideError() {
        this.elements.errorMessage.classList.add('hidden');
    }
    
    /**
     * Update last updated timestamp
     */
    updateLastUpdated() {
        const now = new Date();
        this.elements.lastUpdated.textContent = now.toLocaleString();
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing sensor dashboard...');
    new SensorDashboard();
});

// Handle any unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});
