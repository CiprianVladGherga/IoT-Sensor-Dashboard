#!/usr/bin/env python3
"""
IoT Sensor Dashboard Backend
Flask application that provides REST API endpoints for sensor data
"""

from flask import Flask, jsonify
from flask_cors import CORS
import logging
from datetime import datetime
from sensor_simulator import SensorSimulator

# Initialize Flask application
app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for frontend

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize sensor simulator
sensor_sim = SensorSimulator()

@app.route('/')
def home():
    """
    Home endpoint - returns basic API information
    """
    return jsonify({
        'message': 'IoT Sensor Dashboard API',
        'version': '1.0.0',
        'endpoints': {
            '/api/sensors': 'GET - Retrieve all sensor data',
            '/api/data': 'GET - Retrieve current sensor readings',
            '/api/health': 'GET - API health check'
        }
    })

@app.route('/api/sensors', methods=['GET'])
def get_sensors():
    """
    Get all sensor data with current readings
    Returns a list of sensors with their latest values
    """
    try:
        sensors_data = sensor_sim.get_all_sensors()
        logger.info(f"Retrieved data for {len(sensors_data)} sensors")
        
        return jsonify({
            'status': 'success',
            'timestamp': datetime.now().isoformat(),
            'count': len(sensors_data),
            'sensors': sensors_data
        })
    
    except Exception as e:
        logger.error(f"Error retrieving sensor data: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Failed to retrieve sensor data',
            'error': str(e)
        }), 500

@app.route('/api/data', methods=['GET'])
def get_data():
    """
    Alternative endpoint for sensor data (alias for /api/sensors)
    """
    return get_sensors()

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify API is running
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'IoT Sensor Dashboard API'
    })

@app.errorhandler(404)
def not_found(error):
    """
    Custom 404 error handler
    """
    return jsonify({
        'status': 'error',
        'message': 'Endpoint not found',
        'code': 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """
    Custom 500 error handler
    """
    return jsonify({
        'status': 'error',
        'message': 'Internal server error',
        'code': 500
    }), 500

if __name__ == '__main__':
    logger.info("Starting IoT Sensor Dashboard API...")
    logger.info("Available endpoints:")
    logger.info("  GET / - API information")
    logger.info("  GET /api/sensors - Sensor data")
    logger.info("  GET /api/data - Sensor data (alias)")
    logger.info("  GET /api/health - Health check")
    
    # Run the Flask development server
    app.run(host='0.0.0.0', port=5000, debug=True)
