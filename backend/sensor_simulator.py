#!/usr/bin/env python3
"""
IoT Sensor Simulator
Generates realistic sensor data for temperature, humidity, pressure, and air quality
"""

import random
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any
import math

class SensorSimulator:
    """
    Simulates various IoT sensors with realistic data patterns
    """
    
    def __init__(self):
        """
        Initialize the sensor simulator with predefined sensor configurations
        """
        self.sensors = [
            {
                'id': 'TEMP_001',
                'name': 'Living Room Temperature',
                'type': 'temperature',
                'unit': '°C',
                'location': 'Living Room',
                'min_value': 18.0,
                'max_value': 28.0,
                'base_value': 22.0
            },
            {
                'id': 'TEMP_002',
                'name': 'Bedroom Temperature',
                'type': 'temperature',
                'unit': '°C',
                'location': 'Bedroom',
                'min_value': 16.0,
                'max_value': 26.0,
                'base_value': 20.0
            },
            {
                'id': 'HUM_001',
                'name': 'Living Room Humidity',
                'type': 'humidity',
                'unit': '%',
                'location': 'Living Room',
                'min_value': 30.0,
                'max_value': 70.0,
                'base_value': 45.0
            },
            {
                'id': 'HUM_002',
                'name': 'Bedroom Humidity',
                'type': 'humidity',
                'unit': '%',
                'location': 'Bedroom',
                'min_value': 35.0,
                'max_value': 65.0,
                'base_value': 50.0
            },
            {
                'id': 'PRES_001',
                'name': 'Atmospheric Pressure',
                'type': 'pressure',
                'unit': 'hPa',
                'location': 'Outdoor',
                'min_value': 980.0,
                'max_value': 1030.0,
                'base_value': 1013.25
            },
            {
                'id': 'AQ_001',
                'name': 'Air Quality Index',
                'type': 'air_quality',
                'unit': 'AQI',
                'location': 'Living Room',
                'min_value': 0.0,
                'max_value': 150.0,
                'base_value': 25.0
            }
        ]
        
        # Initialize last update time for each sensor
        self.last_update = {}
        for sensor in self.sensors:
            self.last_update[sensor['id']] = datetime.now()
    
    def _generate_realistic_value(self, sensor: Dict[str, Any]) -> float:
        """
        Generate a realistic sensor value based on sensor type and time patterns
        
        Args:
            sensor: Sensor configuration dictionary
            
        Returns:
            Generated sensor value
        """
        current_time = datetime.now()
        
        # Create time-based variations (daily patterns)
        hour_factor = math.sin((current_time.hour * math.pi) / 12)
        
        # Base value with some drift
        base = sensor['base_value']
        
        # Add time-based variation
        if sensor['type'] == 'temperature':
            # Temperature varies throughout the day
            daily_variation = 3.0 * hour_factor
            random_noise = random.uniform(-1.5, 1.5)
            value = base + daily_variation + random_noise
        
        elif sensor['type'] == 'humidity':
            # Humidity inversely related to temperature
            daily_variation = -2.0 * hour_factor
            random_noise = random.uniform(-5.0, 5.0)
            value = base + daily_variation + random_noise
        
        elif sensor['type'] == 'pressure':
            # Pressure changes slowly with weather patterns
            random_noise = random.uniform(-5.0, 5.0)
            trend = math.sin((current_time.day * math.pi) / 15) * 10
            value = base + trend + random_noise
        
        elif sensor['type'] == 'air_quality':
            # Air quality can have sudden changes
            if random.random() < 0.05:  # 5% chance of spike
                spike = random.uniform(20, 50)
            else:
                spike = 0
            random_noise = random.uniform(-5.0, 5.0)
            value = base + spike + random_noise
        
        else:
            # Default case
            value = base + random.uniform(-2.0, 2.0)
        
        # Ensure value is within sensor limits
        value = max(sensor['min_value'], min(sensor['max_value'], value))
        
        return round(value, 2)
    
    def _get_sensor_status(self, sensor: Dict[str, Any], value: float) -> str:
        """
        Determine sensor status based on value ranges
        
        Args:
            sensor: Sensor configuration
            value: Current sensor value
            
        Returns:
            Status string ('normal', 'warning', 'critical')
        """
        sensor_type = sensor['type']
        
        if sensor_type == 'temperature':
            if value < 16 or value > 30:
                return 'critical'
            elif value < 18 or value > 28:
                return 'warning'
            else:
                return 'normal'
        
        elif sensor_type == 'humidity':
            if value < 25 or value > 75:
                return 'critical'
            elif value < 30 or value > 70:
                return 'warning'
            else:
                return 'normal'
        
        elif sensor_type == 'pressure':
            if value < 990 or value > 1025:
                return 'critical'
            elif value < 1000 or value > 1020:
                return 'warning'
            else:
                return 'normal'
        
        elif sensor_type == 'air_quality':
            if value > 100:
                return 'critical'
            elif value > 50:
                return 'warning'
            else:
                return 'normal'
        
        return 'normal'
    
    def get_sensor_reading(self, sensor_id: str) -> Dict[str, Any]:
        """
        Get a single sensor reading by ID
        
        Args:
            sensor_id: Unique sensor identifier
            
        Returns:
            Dictionary containing sensor reading data
        """
        sensor = next((s for s in self.sensors if s['id'] == sensor_id), None)
        
        if not sensor:
            raise ValueError(f"Sensor with ID '{sensor_id}' not found")
        
        value = self._generate_realistic_value(sensor)
        status = self._get_sensor_status(sensor, value)
        timestamp = datetime.now()
        
        # Update last update time
        self.last_update[sensor_id] = timestamp
        
        return {
            'id': sensor['id'],
            'name': sensor['name'],
            'type': sensor['type'],
            'value': value,
            'unit': sensor['unit
'],
            'location': sensor['location'],
            'status': status,
            'timestamp': timestamp.isoformat(),
            'last_updated': self.last_update[sensor_id].isoformat()
        }
    
    def get_all_sensors(self) -> List[Dict[str, Any]]:
        """
        Get readings from all sensors
        
        Returns:
            List of sensor reading dictionaries
        """
        readings = []
        
        for sensor in self.sensors:
            try:
                reading = self.get_sensor_reading(sensor['id'])
                readings.append(reading)
            except Exception as e:
                # Log error but continue with other sensors
                print(f"Error reading sensor {sensor['id']}: {str(e)}")
                
                # Add error reading
                readings.append({
                    'id': sensor['id'],
                    'name': sensor['name'],
                    'type': sensor['type'],
                    'value': None,
                    'unit': sensor['unit'],
                    'location': sensor['location'],
                    'status': 'error',
                    'timestamp': datetime.now().isoformat(),
                    'error': str(e)
                })
        
        return readings
    
    def simulate_sensor_failure(self, sensor_id: str, duration_seconds: int = 60):
        """
        Simulate a sensor failure for testing purposes
        
        Args:
            sensor_id: ID of sensor to fail
            duration_seconds: How long the failure should last
        """
        # This could be extended to actually simulate failures
        # For now, it's a placeholder for future functionality
        pass

if __name__ == '__main__':
    # Test the sensor simulator
    sim = SensorSimulator()
    
    print("IoT Sensor Simulator Test")
    print("=" * 40)
    
    # Get all sensor readings
    readings = sim.get_all_sensors()
    
    for reading in readings:
        print(f"Sensor: {reading['name']}")
        print(f"  Value: {reading['value']} {reading['unit']}")
        print(f"  Status: {reading['status']}")
        print(f"  Location: {reading['location']}")
        print(f"  Timestamp: {reading['timestamp']}")
        print()
