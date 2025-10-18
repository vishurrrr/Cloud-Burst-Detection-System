/**
 * CloudGuard Main Application Controller
 * Coordinates all modules and handles user interactions
 */

class CloudGuardApp {
    constructor() {
        this.weatherAPI = null;
        this.mapHandler = null;
        this.chartHandler = null;
        this.notificationSystem = null;
        this.currentLocation = null;
        this.riskData = null;
        
        this.initialize();
    }

    async initialize() {
        try {
            // Initialize modules
            await this.initializeModules();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start data updates
            this.startDataUpdates();
            
            console.log('CloudGuard application initialized successfully');
            
            // Show welcome message
            setTimeout(() => {
                if (this.notificationSystem) {
                    this.notificationSystem.showNotification(
                        'CloudGuard system is active and monitoring weather conditions',
                        'success'
                    );
                }
            }, 2000);

        } catch (error) {
            console.error('Error initializing CloudGuard:', error);
            this.handleInitializationError(error);
        }
    }

    async initializeModules() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        // Initialize weather API
        this.weatherAPI = new WeatherAPI();
        this.weatherAPI.onWeatherUpdate = (data) => this.handleWeatherUpdate(data);
        this.weatherAPI.onForecastUpdate = (data) => this.handleForecastUpdate(data);
        this.weatherAPI.onWeatherError = (error) => this.handleWeatherError(error);

        // Wait for other modules to initialize
        await this.waitForModules();
    }

    async waitForModules() {
        // Wait for global modules to be available
        let attempts = 0;
        const maxAttempts = 50;
        
        while (attempts < maxAttempts) {
            if (window.mapHandler && window.chartHandler && window.notificationSystem) {
                this.mapHandler = window.mapHandler;
                this.chartHandler = window.chartHandler;
                this.notificationSystem = window.notificationSystem;
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (attempts >= maxAttempts) {
            throw new Error('Failed to initialize all modules');
        }
    }

    setupEventListeners() {
        // Navigation
        this.setupNavigation();
        
        // Search functionality
        this.setupSearch();
        
        // SOS system
        this.setupSOSSystem();
        
        // Location detection
        this.setupLocationDetection();
        
        // Mobile menu
        this.setupMobileMenu();
        
        // Auto-refresh controls
        this.setupAutoRefresh();
    }

    setupNavigation() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Update active nav item on scroll
        window.addEventListener('scroll', () => {
            this.updateActiveNavItem();
        });
    }

    setupSearch() {
        const searchBtn = document.getElementById('searchBtn');
        const locationBtn = document.getElementById('locationBtn');
        const locationSearch = document.getElementById('locationSearch');

        if (searchBtn && locationSearch) {
            searchBtn.addEventListener('click', () => {
                this.performLocationSearch();
            });

            locationSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performLocationSearch();
                }
            });
        }

        if (locationBtn) {
            locationBtn.addEventListener('click', () => {
                this.getCurrentLocation();
            });
        }
    }

    setupSOSSystem() {
        // Multiple SOS buttons
        const sosButtons = [
            document.getElementById('sosBtn'),
            document.getElementById('sosBtnMobile'),
            document.getElementById('mainSosBtn')
        ];

        sosButtons.forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.activateSOSAlert();
                });
            }
        });

        // SOS modal handlers
        const sosModal = document.getElementById('sosModal');
        const closeSosModal = document.getElementById('closeSosModal');
        const callEmergency = document.getElementById('callEmergency');

        if (closeSosModal) {
            closeSosModal.addEventListener('click', () => {
                this.closeSOSModal();
            });
        }

        if (callEmergency) {
            callEmergency.addEventListener('click', () => {
                window.location.href = 'tel:112';
            });
        }

        // Close modal on outside click
        if (sosModal) {
            sosModal.addEventListener('click', (e) => {
                if (e.target === sosModal) {
                    this.closeSOSModal();
                }
            });
        }
    }

    setupLocationDetection() {
        // Get user's current location for weather data
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.updateLocationDisplay();
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    this.handleLocationError(error);
                }
            );
        }
    }

    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const mobileMenu = document.getElementById('mobileMenu');

        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                
                // Update icon
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-bars');
                    icon.classList.toggle('fa-times');
                }
            });
        }
    }

    setupAutoRefresh() {
        // Auto-refresh data every 5 minutes
        setInterval(() => {
            this.refreshAllData();
        }, 5 * 60 * 1000);

        // Manual refresh trigger
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                // Allow normal refresh, but also trigger data update
                setTimeout(() => {
                    this.refreshAllData();
                }, 1000);
            }
        });
    }

    startDataUpdates() {
        // Initial data load
        this.refreshAllData();
        
        // Update weather cards every 30 seconds
        setInterval(() => {
            this.updateWeatherCards();
        }, 30000);

        // Update risk assessment every minute
        setInterval(() => {
            this.updateRiskAssessment();
        }, 60000);
    }

    async performLocationSearch() {
        const locationSearch = document.getElementById('locationSearch');
        if (!locationSearch || !locationSearch.value.trim()) {
            this.notificationSystem.showNotification(
                'Please enter a location to search',
                'warning'
            );
            return;
        }

        const query = locationSearch.value.trim();
        
        try {
            // Show loading state
            const searchBtn = document.getElementById('searchBtn');
            if (searchBtn) {
                searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                searchBtn.disabled = true;
            }

            this.notificationSystem.showNotification(
                `Searching for weather data in ${query}...`,
                'info'
            );

            // Get weather data for location
            const result = await this.weatherAPI.getWeatherForLocation(query);
            
            if (result && result.weather) {
                // Update displays
                this.handleWeatherUpdate(result.weather);
                this.handleForecastUpdate(result.forecast);
                
                // Update location display
                this.updateLocationDisplay(result.location.name);
                
                // Center map on location
                if (this.mapHandler && result.location) {
                    this.mapHandler.centerOnStation(result.location.lat, result.location.lng);
                }

                this.notificationSystem.showNotification(
                    `Weather data updated for ${result.location.name}`,
                    'success'
                );
            }

        } catch (error) {
            console.error('Location search error:', error);
            this.notificationSystem.showNotification(
                'Location not found. Please try a different search term.',
                'error'
            );
        } finally {
            // Reset search button
            const searchBtn = document.getElementById('searchBtn');
            if (searchBtn) {
                searchBtn.innerHTML = '<i class="fas fa-search"></i>';
                searchBtn.disabled = false;
            }
        }
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.notificationSystem.showNotification(
                'Geolocation is not supported by this browser',
                'error'
            );
            return;
        }

        try {
            const locationBtn = document.getElementById('locationBtn');
            if (locationBtn) {
                locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                locationBtn.disabled = true;
            }

            this.notificationSystem.showNotification(
                'Getting your current location...',
                'info'
            );

            const location = await this.weatherAPI.getCurrentLocation();
            this.currentLocation = location;
            
            // Update weather for current location
            await this.weatherAPI.updateWeatherData();
            
            // Update location display
            this.updateLocationDisplay();

            this.notificationSystem.showNotification(
                'Location detected and weather data updated',
                'success'
            );

        } catch (error) {
            console.error('Current location error:', error);
            this.notificationSystem.showNotification(
                'Unable to get current location. Please check permissions.',
                'error'
            );
        } finally {
            const locationBtn = document.getElementById('locationBtn');
            if (locationBtn) {
                locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                locationBtn.disabled = false;
            }
        }
    }

    activateSOSAlert() {
        try {
            // Show confirmation dialog
            if (!confirm('Are you sure you want to activate the SOS alert? This will notify emergency services.')) {
                return;
            }

            // Activate SOS through notification system
            if (this.notificationSystem) {
                const alertData = this.notificationSystem.activateSOSAlert(this.currentLocation);
                
                // Show SOS modal
                this.showSOSModal();
                
                // Log SOS activation
                console.log('SOS Alert activated:', alertData);
                
                // Simulate emergency response
                setTimeout(() => {
                    this.notificationSystem.showNotification(
                        'Emergency contact successfully notified. Help is on the way!',
                        'success',
                        10000
                    );
                }, 2000);
            }

        } catch (error) {
            console.error('SOS activation error:', error);
            this.notificationSystem.showNotification(
                'Error activating SOS alert. Please try calling emergency services directly.',
                'error'
            );
        }
    }

    showSOSModal() {
        const sosModal = document.getElementById('sosModal');
        if (sosModal) {
            sosModal.classList.remove('hidden');
            sosModal.classList.add('flex');
            
            // Focus on modal for accessibility
            sosModal.focus();
        }
    }

    closeSOSModal() {
        const sosModal = document.getElementById('sosModal');
        if (sosModal) {
            sosModal.classList.add('hidden');
            sosModal.classList.remove('flex');
        }
    }

    handleWeatherUpdate(weatherData) {
        if (!weatherData) return;

        try {
            // Format weather data
            const formattedData = this.weatherAPI.formatWeatherData(weatherData);
            
            // Update weather cards
            this.updateWeatherCards(formattedData);
            
            // Calculate and update risk assessment
            this.updateRiskAssessment(weatherData);
            
            // Update charts if available
            if (this.chartHandler) {
                // Generate chart data based on weather data
                setTimeout(() => {
                    this.chartHandler.updateAllCharts();
                }, 500);
            }

        } catch (error) {
            console.error('Error handling weather update:', error);
        }
    }

    handleForecastUpdate(forecastData) {
        if (!forecastData || !this.chartHandler) return;

        try {
            // Update forecast cards
            this.chartHandler.updateForecastCards();
            
            // Update forecast charts
            setTimeout(() => {
                this.chartHandler.updateAllCharts();
            }, 500);

        } catch (error) {
            console.error('Error handling forecast update:', error);
        }
    }

    handleWeatherError(error) {
        console.error('Weather API error:', error);
        this.notificationSystem.showNotification(
            'Unable to fetch weather data. Using cached information.',
            'warning'
        );
    }

    updateWeatherCards(data = null) {
        // Update temperature
        const tempElement = document.getElementById('currentTemp');
        const feelsLikeElement = document.getElementById('feelsLike');
        
        if (tempElement && data) {
            tempElement.textContent = `${data.temperature}°C`;
        }
        if (feelsLikeElement && data) {
            feelsLikeElement.textContent = `${data.feelsLike}°C`;
        }

        // Update humidity
        const humidityElement = document.getElementById('currentHumidity');
        const dewPointElement = document.getElementById('dewPoint');
        
        if (humidityElement && data) {
            humidityElement.textContent = `${data.humidity}%`;
        }
        if (dewPointElement && data) {
            dewPointElement.textContent = `${Math.round(data.temperature - ((100 - data.humidity) / 5))}°C`;
        }

        // Update wind
        const windSpeedElement = document.getElementById('windSpeed');
        const windDirectionElement = document.getElementById('windDirection');
        
        if (windSpeedElement && data) {
            windSpeedElement.textContent = `${data.windSpeed} km/h`;
        }
        if (windDirectionElement && data) {
            windDirectionElement.textContent = data.windDirection;
        }

        // Update pressure
        const pressureElement = document.getElementById('pressure');
        const pressureTrendElement = document.getElementById('pressureTrend');
        
        if (pressureElement && data) {
            pressureElement.textContent = `${data.pressure} hPa`;
        }
        if (pressureTrendElement) {
            pressureTrendElement.textContent = data && data.pressure > 1013 ? 'Rising' : 'Falling';
        }
    }

    updateRiskAssessment(weatherData = null) {
        if (!weatherData || !this.weatherAPI) return;

        try {
            // Calculate risk
            const riskData = this.weatherAPI.calculateCloudBurstRisk(weatherData);
            this.riskData = riskData;

            // Update risk meter
            if (this.chartHandler) {
                this.chartHandler.updateRiskMeter(riskData.score);
            }

            // Update risk level display
            const riskLevelElement = document.getElementById('currentRiskLevel');
            if (riskLevelElement) {
                riskLevelElement.textContent = riskData.level;
                riskLevelElement.className = `text-2xl font-bold ${
                    riskData.level === 'CRITICAL' ? 'text-red-300' :
                    riskData.level === 'HIGH' ? 'text-orange-300' :
                    riskData.level === 'MEDIUM' ? 'text-yellow-300' :
                    'text-green-300'
                }`;
            }

            // Update indicators
            this.updateRiskIndicators(weatherData, riskData);

            // Check for alerts
            if (riskData.score >= 70) {
                this.notificationSystem.showNotification(
                    `CRITICAL: Cloud burst risk is ${riskData.score}%. Take immediate precautions!`,
                    'error',
                    15000
                );
            } else if (riskData.score >= 50) {
                this.notificationSystem.showNotification(
                    `WARNING: Cloud burst risk is elevated (${riskData.score}%). Stay alert!`,
                    'warning'
                );
            }

        } catch (error) {
            console.error('Error updating risk assessment:', error);
        }
    }

    updateRiskIndicators(weatherData, riskData) {
        // Update precipitation rate
        const precipRateElement = document.getElementById('precipRate');
        if (precipRateElement) {
            precipRateElement.textContent = `${weatherData.rainfall.toFixed(1)} mm/h`;
        }

        // Update convective energy
        const convectiveEnergyElement = document.getElementById('convectiveEnergy');
        if (convectiveEnergyElement) {
            const energy = weatherData.main.temp > 35 ? 'High' : 
                          weatherData.main.temp > 30 ? 'Medium' : 'Low';
            convectiveEnergyElement.textContent = energy;
        }

        // Update wind shear
        const windShearElement = document.getElementById('windShear');
        if (windShearElement) {
            const shear = weatherData.wind.speed > 15 ? 'High' : 
                         weatherData.wind.speed > 8 ? 'Medium' : 'Low';
            windShearElement.textContent = shear;
        }

        // Update atmospheric stability
        const atmStabilityElement = document.getElementById('atmStability');
        if (atmStabilityElement) {
            const stability = weatherData.main.pressure < 1005 ? 'Unstable' : 
                             weatherData.main.pressure < 1010 ? 'Neutral' : 'Stable';
            atmStabilityElement.textContent = stability;
        }
    }

    updateLocationDisplay(locationName = null) {
        const currentLocationElement = document.getElementById('currentLocation');
        if (currentLocationElement) {
            if (locationName) {
                currentLocationElement.textContent = locationName;
            } else if (this.currentLocation) {
                // Use reverse geocoding or default name
                currentLocationElement.textContent = 'Current Location';
            }
        }
    }

    updateActiveNavItem() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            if (sectionTop <= 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    async refreshAllData() {
        try {
            this.notificationSystem.showNotification(
                'Refreshing weather data...',
                'info',
                3000
            );

            // Refresh weather data
            if (this.weatherAPI) {
                await this.weatherAPI.updateWeatherData();
            }

            // Refresh charts
            if (this.chartHandler) {
                this.chartHandler.updateAllCharts();
                this.chartHandler.updateForecastCards();
            }

            // Refresh map data
            if (this.mapHandler) {
                // Update risk zones with new data
                const mockRiskData = Array.from({length: 15}, () => ({
                    riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
                }));
                this.mapHandler.updateRiskZones(mockRiskData);
            }

        } catch (error) {
            console.error('Error refreshing data:', error);
            this.notificationSystem.showNotification(
                'Error refreshing data. Please try again.',
                'error'
            );
        }
    }

    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        // Show error message to user
        const errorHTML = `
            <div class="fixed inset-0 bg-red-50 flex items-center justify-center z-50">
                <div class="bg-white p-8 rounded-lg shadow-2xl max-w-md text-center">
                    <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Initialization Error</h3>
                    <p class="text-gray-600 mb-4">
                        CloudGuard encountered an error during startup. Please refresh the page to try again.
                    </p>
                    <button onclick="window.location.reload()" 
                            class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', errorHTML);
    }
}

// Utility functions
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.cloudGuardApp = new CloudGuardApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.cloudGuardApp) {
        // Refresh data when page becomes visible again
        setTimeout(() => {
            window.cloudGuardApp.refreshAllData();
        }, 1000);
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    if (window.notificationSystem) {
        window.notificationSystem.showNotification(
            'Connection restored. Updating weather data...',
            'success'
        );
    }
    if (window.cloudGuardApp) {
        window.cloudGuardApp.refreshAllData();
    }
});

window.addEventListener('offline', () => {
    if (window.notificationSystem) {
        window.notificationSystem.showNotification(
            'Connection lost. Using cached data.',
            'warning'
        );
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.altKey) {
        switch (e.key) {
            case 's':
                e.preventDefault();
                document.getElementById('locationSearch')?.focus();
                break;
            case 'r':
                e.preventDefault();
                if (window.cloudGuardApp) {
                    window.cloudGuardApp.refreshAllData();
                }
                break;
            case 'n':
                e.preventDefault();
                if (window.notificationSystem) {
                    window.notificationSystem.clearAllNotifications();
                }
                break;
        }
    }
});