/**
 * Weather API Integration Module
 * Handles data fetching from multiple weather sources and IMERG satellite data
 */

class WeatherAPI {
    constructor() {
        this.API_KEY = 'demo_key'; // In production, use environment variable
        this.BASE_URL = 'https://api.openweathermap.org/data/2.5';
        this.IMERG_URL = 'https://gpm1.gesdisc.eosdis.nasa.gov/data/GPM_L3/GPM_3IMERGDL.06';
        this.currentLocation = { lat: 28.6139, lng: 77.2090 }; // Default: New Delhi
        this.weatherData = null;
        this.forecastData = null;
        
        this.initializeAPI();
    }

    initializeAPI() {
        console.log('Weather API initialized');
        this.updateWeatherData();
        
        // Update weather data every 10 minutes
        setInterval(() => {
            this.updateWeatherData();
        }, 600000);
    }

    // Get current location using Geolocation API
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.currentLocation = location;
                    resolve(location);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
        });
    }

    // Simulate weather data (since we can't use real API without key)
    generateMockWeatherData(lat, lng) {
        const baseTemp = 25 + Math.random() * 15; // 25-40°C range
        const humidity = 60 + Math.random() * 30; // 60-90% range
        const pressure = 1000 + Math.random() * 30; // 1000-1030 hPa
        const windSpeed = Math.random() * 20; // 0-20 km/h
        const rainfall = Math.random() * 50; // 0-50 mm
        
        return {
            main: {
                temp: baseTemp,
                feels_like: baseTemp + Math.random() * 5,
                humidity: humidity,
                pressure: pressure
            },
            wind: {
                speed: windSpeed,
                deg: Math.random() * 360
            },
            weather: [{
                main: this.getWeatherCondition(rainfall, humidity),
                description: this.getWeatherDescription(rainfall, humidity),
                icon: this.getWeatherIcon(rainfall, humidity)
            }],
            clouds: {
                all: Math.random() * 100
            },
            visibility: 10000 - (rainfall * 100),
            dt: Date.now() / 1000,
            coord: { lat, lon: lng },
            name: this.getCityName(lat, lng),
            rainfall: rainfall
        };
    }

    // Generate 7-day forecast data
    generateMockForecastData(lat, lng) {
        const forecast = {
            city: {
                name: this.getCityName(lat, lng),
                coord: { lat, lon: lng }
            },
            list: []
        };

        const currentDate = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() + i);
            
            const baseTemp = 25 + Math.random() * 15;
            const rainfall = Math.random() * 30;
            const humidity = 50 + Math.random() * 40;
            
            forecast.list.push({
                dt: date.getTime() / 1000,
                main: {
                    temp: baseTemp,
                    temp_min: baseTemp - 5,
                    temp_max: baseTemp + 5,
                    humidity: humidity,
                    pressure: 1010 + Math.random() * 20
                },
                weather: [{
                    main: this.getWeatherCondition(rainfall, humidity),
                    description: this.getWeatherDescription(rainfall, humidity),
                    icon: this.getWeatherIcon(rainfall, humidity)
                }],
                wind: {
                    speed: Math.random() * 15,
                    deg: Math.random() * 360
                },
                clouds: {
                    all: Math.random() * 100
                },
                rainfall: rainfall,
                pop: rainfall > 10 ? 0.8 : rainfall > 5 ? 0.4 : 0.1 // Probability of precipitation
            });
        }

        return forecast;
    }

    // Get weather condition based on rainfall and humidity
    getWeatherCondition(rainfall, humidity) {
        if (rainfall > 25) return 'Thunderstorm';
        if (rainfall > 10) return 'Rain';
        if (rainfall > 2) return 'Drizzle';
        if (humidity > 80) return 'Mist';
        if (humidity < 30) return 'Clear';
        return 'Clouds';
    }

    getWeatherDescription(rainfall, humidity) {
        if (rainfall > 25) return 'heavy intensity rain';
        if (rainfall > 10) return 'moderate rain';
        if (rainfall > 2) return 'light rain';
        if (humidity > 80) return 'mist';
        if (humidity < 30) return 'clear sky';
        return 'scattered clouds';
    }

    getWeatherIcon(rainfall, humidity) {
        if (rainfall > 25) return '11d';
        if (rainfall > 10) return '10d';
        if (rainfall > 2) return '09d';
        if (humidity > 80) return '50d';
        if (humidity < 30) return '01d';
        return '03d';
    }

    getCityName(lat, lng) {
        // Simple city mapping based on coordinates
        const cities = [
            { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
            { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
            { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
            { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
            { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
            { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
            { name: 'Pune', lat: 18.5204, lng: 73.8567 },
            { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
            { name: 'Surat', lat: 21.1702, lng: 72.8311 },
            { name: 'Jaipur', lat: 26.9124, lng: 75.7873 }
        ];

        let closestCity = cities[0];
        let minDistance = this.calculateDistance(lat, lng, closestCity.lat, closestCity.lng);

        for (const city of cities) {
            const distance = this.calculateDistance(lat, lng, city.lat, city.lng);
            if (distance < minDistance) {
                minDistance = distance;
                closestCity = city;
            }
        }

        return closestCity.name;
    }

    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Update weather data for current location
    async updateWeatherData() {
        try {
            // Generate mock data for current location
            this.weatherData = this.generateMockWeatherData(
                this.currentLocation.lat, 
                this.currentLocation.lng
            );
            
            this.forecastData = this.generateMockForecastData(
                this.currentLocation.lat, 
                this.currentLocation.lng
            );

            // Trigger update events
            this.onWeatherUpdate(this.weatherData);
            this.onForecastUpdate(this.forecastData);

        } catch (error) {
            console.error('Error updating weather data:', error);
            this.onWeatherError(error);
        }
    }

    // Get weather data for specific location
    async getWeatherForLocation(query) {
        try {
            // Simulate geocoding for location query
            const location = await this.geocodeLocation(query);
            const weather = this.generateMockWeatherData(location.lat, location.lng);
            const forecast = this.generateMockForecastData(location.lat, location.lng);
            
            return { weather, forecast, location };
        } catch (error) {
            console.error('Error getting weather for location:', error);
            throw error;
        }
    }

    // Simple geocoding simulation
    async geocodeLocation(query) {
        const locations = {
            'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
            'delhi': { lat: 28.6139, lng: 77.2090, name: 'New Delhi' },
            'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
            'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
            'kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
            'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
            'pune': { lat: 18.5204, lng: 73.8567, name: 'Pune' },
            'ahmedabad': { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad' },
            'surat': { lat: 21.1702, lng: 72.8311, name: 'Surat' },
            'jaipur': { lat: 26.9124, lng: 75.7873, name: 'Jaipur' }
        };

        const normalizedQuery = query.toLowerCase().replace(/[^a-z]/g, '');
        
        for (const [key, location] of Object.entries(locations)) {
            if (key.includes(normalizedQuery) || normalizedQuery.includes(key)) {
                return location;
            }
        }

        // If no match found, return default location
        return { lat: 28.6139, lng: 77.2090, name: 'New Delhi' };
    }

    // Calculate cloud burst risk based on weather parameters
    calculateCloudBurstRisk(weatherData) {
        let riskScore = 0;
        const factors = [];

        // High rainfall rate (major factor)
        if (weatherData.rainfall > 20) {
            riskScore += 40;
            factors.push('Heavy rainfall detected');
        } else if (weatherData.rainfall > 10) {
            riskScore += 25;
            factors.push('Moderate rainfall');
        } else if (weatherData.rainfall > 5) {
            riskScore += 10;
            factors.push('Light rainfall');
        }

        // High humidity
        if (weatherData.main.humidity > 85) {
            riskScore += 20;
            factors.push('Very high humidity');
        } else if (weatherData.main.humidity > 70) {
            riskScore += 15;
            factors.push('High humidity');
        }

        // Low pressure (indicates unstable atmosphere)
        if (weatherData.main.pressure < 1005) {
            riskScore += 15;
            factors.push('Low atmospheric pressure');
        }

        // High temperature (convective energy)
        if (weatherData.main.temp > 35) {
            riskScore += 10;
            factors.push('High temperature');
        }

        // Wind conditions
        if (weatherData.wind.speed > 15) {
            riskScore += 10;
            factors.push('Strong winds');
        }

        // Cloud cover
        if (weatherData.clouds.all > 80) {
            riskScore += 5;
            factors.push('Heavy cloud cover');
        }

        return {
            score: Math.min(riskScore, 100),
            level: this.getRiskLevel(riskScore),
            factors: factors
        };
    }

    getRiskLevel(score) {
        if (score >= 70) return 'CRITICAL';
        if (score >= 50) return 'HIGH';
        if (score >= 30) return 'MEDIUM';
        return 'LOW';
    }

    // Generate IMERG-style precipitation data
    generateIMERGData() {
        const data = [];
        const currentTime = new Date();
        
        for (let i = 23; i >= 0; i--) {
            const time = new Date(currentTime.getTime() - i * 60 * 60 * 1000);
            data.push({
                time: time.toISOString(),
                precipitation: Math.random() * 15, // 0-15 mm/h
                convectiveRain: Math.random() * 5,
                stratiformRain: Math.random() * 8
            });
        }
        
        return data;
    }

    // Event handlers (to be overridden)
    onWeatherUpdate(data) {
        console.log('Weather data updated:', data);
    }

    onForecastUpdate(data) {
        console.log('Forecast data updated:', data);
    }

    onWeatherError(error) {
        console.error('Weather API error:', error);
    }

    // Utility method to format weather data for display
    formatWeatherData(data) {
        return {
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: Math.round(data.main.humidity),
            pressure: Math.round(data.main.pressure),
            windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
            windDirection: this.getWindDirection(data.wind.deg),
            rainfall: Math.round(data.rainfall * 10) / 10,
            condition: data.weather[0].main,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            location: data.name,
            timestamp: new Date(data.dt * 1000)
        };
    }

    getWindDirection(degrees) {
        const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return directions[Math.round(degrees / 22.5) % 16];
    }
}

// Export for use in other modules
window.WeatherAPI = WeatherAPI;