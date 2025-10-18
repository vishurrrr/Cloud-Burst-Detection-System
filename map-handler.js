/**
 * Interactive Map Handler for Cloud Burst Detection
 * Manages Leaflet map with weather overlays and risk zones
 */

class MapHandler {
    constructor() {
        this.map = null;
        this.markers = [];
        this.riskZones = [];
        this.weatherOverlays = {};
        this.currentLocationMarker = null;
        
        this.initializeMap();
        this.setupEventListeners();
    }

    initializeMap() {
        // Initialize Leaflet map centered on India
        this.map = L.map('map').setView([20.5937, 78.9629], 5);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18,
        }).addTo(this.map);

        // Add map controls
        this.addMapControls();
        
        // Add Indian states data
        this.addIndianStates();
        
        // Add risk zones
        this.addRiskZones();
        
        // Add current location marker
        this.addCurrentLocationMarker();

        console.log('Map initialized successfully');
    }

    addMapControls() {
        // Add zoom control
        L.control.zoom({
            position: 'topright'
        }).addTo(this.map);

        // Add scale control
        L.control.scale({
            position: 'bottomleft'
        }).addTo(this.map);

        // Custom legend control
        this.addLegendControl();
    }

    addLegendControl() {
        const legend = L.control({ position: 'bottomright' });
        
        legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'map-legend');
            div.innerHTML = `
                <div class="bg-white p-3 rounded-lg shadow-lg text-sm">
                    <h4 class="font-semibold mb-2">Risk Levels</h4>
                    <div class="space-y-1">
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Low Risk (0-30%)</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>Medium Risk (30-60%)</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span>High Risk (60-85%)</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>Critical Risk (85%+)</span>
                        </div>
                    </div>
                </div>
            `;
            return div;
        };
        
        legend.addTo(this.map);
    }

    addIndianStates() {
        // Indian state boundaries (simplified GeoJSON)
        const stateData = this.getIndianStatesGeoJSON();
        
        const stateLayer = L.geoJSON(stateData, {
            style: {
                fillColor: '#f0f9ff',
                weight: 2,
                opacity: 1,
                color: '#3b82f6',
                dashArray: '3',
                fillOpacity: 0.1
            },
            onEachFeature: (feature, layer) => {
                if (feature.properties && feature.properties.name) {
                    layer.bindPopup(`
                        <div class="p-2">
                            <h3 class="font-semibold text-lg text-gray-800">${feature.properties.name}</h3>
                            <div class="mt-2 space-y-1 text-sm">
                                <div>Current Risk: <span class="font-semibold text-green-600">Low</span></div>
                                <div>Active Alerts: <span class="font-semibold">0</span></div>
                                <div>Population: <span class="font-semibold">${feature.properties.population || 'N/A'}</span></div>
                            </div>
                            <button onclick="mapHandler.focusOnState('${feature.properties.name}')" 
                                    class="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                View Details
                            </button>
                        </div>
                    `);
                }
            }
        }).addTo(this.map);

        this.stateLayer = stateLayer;
    }

    getIndianStatesGeoJSON() {
        // Simplified GeoJSON data for major Indian states
        return {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {
                        "name": "Rajasthan",
                        "population": "68,548,437"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[69.5, 23.0], [78.0, 23.0], [78.0, 30.0], [69.5, 30.0], [69.5, 23.0]]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "name": "Maharashtra",
                        "population": "112,374,333"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[72.5, 15.5], [80.0, 15.5], [80.0, 22.0], [72.5, 22.0], [72.5, 15.5]]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "name": "Uttar Pradesh",
                        "population": "199,812,341"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[77.0, 24.0], [85.0, 24.0], [85.0, 31.0], [77.0, 31.0], [77.0, 24.0]]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "name": "West Bengal",
                        "population": "91,276,115"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[85.0, 21.5], [89.5, 21.5], [89.5, 27.5], [85.0, 27.5], [85.0, 21.5]]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "name": "Tamil Nadu",
                        "population": "72,147,030"
                    },
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[76.0, 8.0], [80.5, 8.0], [80.5, 13.5], [76.0, 13.5], [76.0, 8.0]]]
                    }
                }
            ]
        };
    }

    addRiskZones() {
        // Add weather monitoring stations with risk indicators
        const stations = this.getWeatherStations();
        
        stations.forEach(station => {
            const riskLevel = this.calculateStationRisk(station);
            const marker = this.createRiskMarker(station, riskLevel);
            this.markers.push(marker);
        });
    }

    getWeatherStations() {
        return [
            { id: 1, name: 'New Delhi', lat: 28.6139, lng: 77.2090, type: 'primary' },
            { id: 2, name: 'Mumbai', lat: 19.0760, lng: 72.8777, type: 'primary' },
            { id: 3, name: 'Chennai', lat: 13.0827, lng: 80.2707, type: 'primary' },
            { id: 4, name: 'Kolkata', lat: 22.5726, lng: 88.3639, type: 'primary' },
            { id: 5, name: 'Bangalore', lat: 12.9716, lng: 77.5946, type: 'primary' },
            { id: 6, name: 'Hyderabad', lat: 17.3850, lng: 78.4867, type: 'secondary' },
            { id: 7, name: 'Pune', lat: 18.5204, lng: 73.8567, type: 'secondary' },
            { id: 8, name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, type: 'secondary' },
            { id: 9, name: 'Jaipur', lat: 26.9124, lng: 75.7873, type: 'secondary' },
            { id: 10, name: 'Lucknow', lat: 26.8467, lng: 80.9462, type: 'secondary' },
            { id: 11, name: 'Patna', lat: 25.5941, lng: 85.1376, type: 'tertiary' },
            { id: 12, name: 'Bhopal', lat: 23.2599, lng: 77.4126, type: 'tertiary' },
            { id: 13, name: 'Guwahati', lat: 26.1445, lng: 91.7362, type: 'tertiary' },
            { id: 14, name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, type: 'tertiary' },
            { id: 15, name: 'Chandigarh', lat: 30.7333, lng: 76.7794, type: 'tertiary' }
        ];
    }

    calculateStationRisk(station) {
        // Simulate risk calculation based on location and current conditions
        const risks = ['low', 'medium', 'high', 'critical'];
        const weights = [0.6, 0.25, 0.12, 0.03]; // Higher probability for lower risks
        
        let random = Math.random();
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return risks[i];
            }
        }
        return 'low';
    }

    createRiskMarker(station, riskLevel) {
        const colors = {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#f97316',
            critical: '#ef4444'
        };

        const size = station.type === 'primary' ? 30 : station.type === 'secondary' ? 25 : 20;

        const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
                <div class="risk-marker risk-${riskLevel}" style="width: ${size}px; height: ${size}px; background-color: ${colors[riskLevel]}">
                    <i class="fas fa-cloud-rain" style="font-size: ${size/3}px;"></i>
                </div>
            `,
            iconSize: [size, size],
            iconAnchor: [size/2, size/2]
        });

        const marker = L.marker([station.lat, station.lng], { icon: customIcon })
            .bindPopup(this.createStationPopup(station, riskLevel))
            .addTo(this.map);

        // Add click event for detailed view
        marker.on('click', () => {
            this.showStationDetails(station, riskLevel);
        });

        return marker;
    }

    createStationPopup(station, riskLevel) {
        const riskColor = {
            low: 'text-green-600',
            medium: 'text-yellow-600',
            high: 'text-orange-600',
            critical: 'text-red-600'
        };

        const riskBg = {
            low: 'bg-green-50 border-green-200',
            medium: 'bg-yellow-50 border-yellow-200',
            high: 'bg-orange-50 border-orange-200',
            critical: 'bg-red-50 border-red-200'
        };

        return `
            <div class="p-4 min-w-64">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="font-bold text-lg text-gray-800">${station.name}</h3>
                    <div class="px-2 py-1 rounded-full text-xs font-semibold ${riskBg[riskLevel]} ${riskColor[riskLevel]}">
                        ${riskLevel.toUpperCase()} RISK
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                        <div class="text-gray-500">Temperature</div>
                        <div class="font-semibold">${(25 + Math.random() * 15).toFixed(1)}°C</div>
                    </div>
                    <div>
                        <div class="text-gray-500">Humidity</div>
                        <div class="font-semibold">${(60 + Math.random() * 30).toFixed(0)}%</div>
                    </div>
                    <div>
                        <div class="text-gray-500">Rainfall</div>
                        <div class="font-semibold">${(Math.random() * 20).toFixed(1)} mm/h</div>
                    </div>
                    <div>
                        <div class="text-gray-500">Pressure</div>
                        <div class="font-semibold">${(1000 + Math.random() * 30).toFixed(0)} hPa</div>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <button onclick="mapHandler.centerOnStation(${station.lat}, ${station.lng})" 
                            class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm font-semibold">
                        <i class="fas fa-crosshairs mr-1"></i> Center Map
                    </button>
                    <button onclick="mapHandler.getDetailedForecast('${station.name}')" 
                            class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded text-sm font-semibold">
                        <i class="fas fa-chart-line mr-1"></i> View Forecast
                    </button>
                </div>
            </div>
        `;
    }

    addCurrentLocationMarker() {
        // Add user's current location marker
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;

                const locationIcon = L.divIcon({
                    className: 'current-location-marker',
                    html: `
                        <div class="bg-blue-500 border-4 border-white rounded-full shadow-lg" style="width: 20px; height: 20px;">
                            <div class="bg-blue-600 rounded-full" style="width: 12px; height: 12px; margin: 2px;"></div>
                        </div>
                    `,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                this.currentLocationMarker = L.marker([lat, lng], { icon: locationIcon })
                    .bindPopup(`
                        <div class="p-3">
                            <h3 class="font-semibold text-gray-800 mb-2">Your Location</h3>
                            <p class="text-sm text-gray-600">Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}</p>
                            <button onclick="mapHandler.getWeatherForCurrentLocation()" 
                                    class="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                                Get Weather
                            </button>
                        </div>
                    `)
                    .addTo(this.map);

                // Add accuracy circle
                const accuracy = position.coords.accuracy;
                L.circle([lat, lng], {
                    radius: accuracy,
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    weight: 2
                }).addTo(this.map);

            }, (error) => {
                console.error('Geolocation error:', error);
            });
        }
    }

    setupEventListeners() {
        // Map click event for location selection
        this.map.on('click', (e) => {
            this.onMapClick(e.latlng.lat, e.latlng.lng);
        });

        // Map zoom event for marker visibility
        this.map.on('zoomend', () => {
            this.updateMarkerVisibility();
        });
    }

    onMapClick(lat, lng) {
        // Add temporary marker for clicked location
        const tempMarker = L.marker([lat, lng])
            .bindPopup(`
                <div class="p-3">
                    <h3 class="font-semibold text-gray-800 mb-2">Selected Location</h3>
                    <p class="text-sm text-gray-600 mb-3">
                        Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}
                    </p>
                    <div class="space-y-2">
                        <button onclick="mapHandler.getWeatherForLocation(${lat}, ${lng})" 
                                class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm">
                            Get Weather Data
                        </button>
                        <button onclick="mapHandler.removeMarker(this)" 
                                class="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm">
                            Remove Marker
                        </button>
                    </div>
                </div>
            `)
            .addTo(this.map)
            .openPopup();

        // Store reference for removal
        this.tempMarkers = this.tempMarkers || [];
        this.tempMarkers.push(tempMarker);
    }

    updateMarkerVisibility() {
        const zoomLevel = this.map.getZoom();
        
        this.markers.forEach(marker => {
            const markerElement = marker.getElement();
            if (markerElement) {
                if (zoomLevel < 6) {
                    markerElement.style.opacity = '0.7';
                } else {
                    markerElement.style.opacity = '1';
                }
            }
        });
    }

    // Public methods for external interaction
    centerOnStation(lat, lng) {
        this.map.setView([lat, lng], 10);
    }

    focusOnState(stateName) {
        console.log(`Focusing on state: ${stateName}`);
        // Implement state-specific zoom and data display
        window.notificationSystem.showNotification(
            `Viewing detailed data for ${stateName}`,
            'info'
        );
    }

    getDetailedForecast(stationName) {
        console.log(`Getting detailed forecast for: ${stationName}`);
        window.notificationSystem.showNotification(
            `Loading detailed forecast for ${stationName}`,
            'info'
        );
    }

    getWeatherForCurrentLocation() {
        if (this.currentLocationMarker) {
            const latlng = this.currentLocationMarker.getLatLng();
            this.getWeatherForLocation(latlng.lat, latlng.lng);
        }
    }

    getWeatherForLocation(lat, lng) {
        console.log(`Getting weather for location: ${lat}, ${lng}`);
        
        // Simulate weather data fetch
        window.notificationSystem.showNotification(
            'Fetching weather data for selected location...',
            'info'
        );

        // Update weather display with location-specific data
        setTimeout(() => {
            window.notificationSystem.showNotification(
                'Weather data updated for selected location',
                'success'
            );
        }, 2000);
    }

    removeMarker(button) {
        // Remove temporary markers
        if (this.tempMarkers) {
            this.tempMarkers.forEach(marker => {
                this.map.removeLayer(marker);
            });
            this.tempMarkers = [];
        }
    }

    // Update risk zones based on new data
    updateRiskZones(riskData) {
        this.markers.forEach((marker, index) => {
            if (riskData[index]) {
                const newRiskLevel = riskData[index].riskLevel;
                const station = this.getWeatherStations()[index];
                
                // Remove old marker
                this.map.removeLayer(marker);
                
                // Add updated marker
                const newMarker = this.createRiskMarker(station, newRiskLevel);
                this.markers[index] = newMarker;
            }
        });
    }

    // Add weather overlay (rainfall, pressure, etc.)
    addWeatherOverlay(type, data) {
        // Remove existing overlay if present
        if (this.weatherOverlays[type]) {
            this.map.removeLayer(this.weatherOverlays[type]);
        }

        // Add new overlay based on type
        switch (type) {
            case 'rainfall':
                this.weatherOverlays[type] = this.createRainfallOverlay(data);
                break;
            case 'pressure':
                this.weatherOverlays[type] = this.createPressureOverlay(data);
                break;
            case 'temperature':
                this.weatherOverlays[type] = this.createTemperatureOverlay(data);
                break;
        }

        if (this.weatherOverlays[type]) {
            this.weatherOverlays[type].addTo(this.map);
        }
    }

    createRainfallOverlay(data) {
        // Create heatmap-style overlay for rainfall data
        const heatmapData = data.map(point => [
            point.lat, 
            point.lng, 
            point.intensity / 50 // Normalize intensity
        ]);

        // Simple circle-based visualization (in production, use proper heatmap library)
        const layerGroup = L.layerGroup();
        
        data.forEach(point => {
            const intensity = point.intensity;
            const color = intensity > 20 ? '#ef4444' : 
                         intensity > 10 ? '#f97316' : 
                         intensity > 5 ? '#f59e0b' : '#10b981';
            
            L.circle([point.lat, point.lng], {
                radius: intensity * 100,
                color: color,
                fillColor: color,
                fillOpacity: 0.3,
                weight: 2
            }).addTo(layerGroup);
        });

        return layerGroup;
    }

    createPressureOverlay(data) {
        // Similar implementation for pressure data
        const layerGroup = L.layerGroup();
        // Implementation details...
        return layerGroup;
    }

    createTemperatureOverlay(data) {
        // Similar implementation for temperature data
        const layerGroup = L.layerGroup();
        // Implementation details...
        return layerGroup;
    }

    // Search for location and center map
    searchAndCenter(query) {
        // Simple geocoding simulation
        const locations = {
            'mumbai': [19.0760, 72.8777],
            'delhi': [28.6139, 77.2090],
            'bangalore': [12.9716, 77.5946],
            'chennai': [13.0827, 80.2707],
            'kolkata': [22.5726, 88.3639]
        };

        const normalizedQuery = query.toLowerCase();
        for (const [city, coords] of Object.entries(locations)) {
            if (city.includes(normalizedQuery) || normalizedQuery.includes(city)) {
                this.map.setView(coords, 10);
                
                // Add search result marker
                const searchMarker = L.marker(coords)
                    .bindPopup(`
                        <div class="p-3">
                            <h3 class="font-semibold text-gray-800 mb-2">${city.charAt(0).toUpperCase() + city.slice(1)}</h3>
                            <p class="text-sm text-gray-600">Search result location</p>
                        </div>
                    `)
                    .addTo(this.map)
                    .openPopup();

                return true;
            }
        }

        return false;
    }
}

// Initialize map handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mapHandler = new MapHandler();
});