/**
 * Chart Handler for Weather Data Visualization
 * Manages Chart.js charts for rainfall, temperature, and forecast data
 */

class ChartHandler {
    constructor() {
        this.charts = {};
        this.chartConfigs = {};
        this.initialized = false;
        
        this.initializeCharts();
    }

    initializeCharts() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupCharts();
            });
        } else {
            this.setupCharts();
        }
    }

    setupCharts() {
        try {
            this.createRainfallChart();
            this.createTemperatureChart();
            this.createPrecipitationChart();
            this.createRiskMeterChart();
            
            this.initialized = true;
            console.log('Charts initialized successfully');
        } catch (error) {
            console.error('Error initializing charts:', error);
        }
    }

    createRainfallChart() {
        const ctx = document.getElementById('rainfallChart');
        if (!ctx) return;

        const data = this.generateRainfallData();
        
        this.chartConfigs.rainfall = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Rainfall (mm/h)',
                    data: data.values,
                    backgroundColor: data.values.map(val => 
                        val > 20 ? 'rgba(239, 68, 68, 0.8)' :
                        val > 10 ? 'rgba(249, 115, 22, 0.8)' :
                        val > 5 ? 'rgba(245, 158, 11, 0.8)' :
                        'rgba(34, 197, 94, 0.8)'
                    ),
                    borderColor: data.values.map(val => 
                        val > 20 ? 'rgb(239, 68, 68)' :
                        val > 10 ? 'rgb(249, 115, 22)' :
                        val > 5 ? 'rgb(245, 158, 11)' :
                        'rgb(34, 197, 94)'
                    ),
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '24-Hour Rainfall Distribution',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                const risk = value > 20 ? 'Critical Risk' :
                                           value > 10 ? 'High Risk' :
                                           value > 5 ? 'Medium Risk' : 'Low Risk';
                                return [`Rainfall: ${value.toFixed(1)} mm/h`, `Risk Level: ${risk}`];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 30,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + ' mm/h';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Rainfall Intensity (mm/h)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Time (Hours)'
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        };

        this.charts.rainfall = new Chart(ctx, this.chartConfigs.rainfall);
    }

    createTemperatureChart() {
        const ctx = document.getElementById('temperatureChart');
        if (!ctx) return;

        const data = this.generateTemperatureData();
        
        this.chartConfigs.temperature = {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: data.temperature,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(239, 68, 68)',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }, {
                    label: 'Feels Like (°C)',
                    data: data.feelsLike,
                    borderColor: 'rgb(245, 158, 11)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    borderDash: [5, 5],
                    pointBackgroundColor: 'rgb(245, 158, 11)',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '7-Day Temperature Forecast',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '°C';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        };

        this.charts.temperature = new Chart(ctx, this.chartConfigs.temperature);
    }

    createPrecipitationChart() {
        const ctx = document.getElementById('precipitationChart');
        if (!ctx) return;

        const data = this.generatePrecipitationForecast();
        
        this.chartConfigs.precipitation = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Precipitation Probability (%)',
                    data: data.probability,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 2,
                    yAxisID: 'y'
                }, {
                    label: 'Expected Rainfall (mm)',
                    data: data.rainfall,
                    type: 'line',
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1',
                    pointBackgroundColor: 'rgb(34, 197, 94)',
                    pointBorderColor: 'white',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Precipitation Forecast',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Probability (%)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            callback: function(value) {
                                return value + ' mm';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Rainfall (mm)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        };

        this.charts.precipitation = new Chart(ctx, this.chartConfigs.precipitation);
    }

    createRiskMeterChart() {
        // This will be handled by CSS/SVG animation, not Chart.js
        this.updateRiskMeter(20); // Default 20% risk
    }

    generateRainfallData() {
        const labels = [];
        const values = [];
        const currentHour = new Date().getHours();

        for (let i = 23; i >= 0; i--) {
            const hour = (currentHour - i + 24) % 24;
            labels.push(hour.toString().padStart(2, '0') + ':00');
            
            // Generate realistic rainfall data with some peak periods
            let rainfall = 0;
            if (hour >= 14 && hour <= 18) { // Afternoon peak
                rainfall = Math.random() * 15 + 5;
            } else if (hour >= 2 && hour <= 6) { // Early morning
                rainfall = Math.random() * 8;
            } else {
                rainfall = Math.random() * 5;
            }
            
            values.push(Math.round(rainfall * 10) / 10);
        }

        return { labels, values };
    }

    generateTemperatureData() {
        const labels = [];
        const temperature = [];
        const feelsLike = [];
        
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            labels.push(date.toLocaleDateString('en-IN', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            }));
            
            // Generate realistic temperature curve
            const baseTemp = 28 + Math.sin(i * 0.5) * 5 + (Math.random() - 0.5) * 4;
            temperature.push(Math.round(baseTemp * 10) / 10);
            feelsLike.push(Math.round((baseTemp + Math.random() * 3) * 10) / 10);
        }

        return { labels, temperature, feelsLike };
    }

    generatePrecipitationForecast() {
        const labels = [];
        const probability = [];
        const rainfall = [];
        
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            labels.push(date.toLocaleDateString('en-IN', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            }));
            
            const prob = Math.random() * 100;
            const rain = prob > 50 ? (prob / 100) * 15 : 0;
            
            probability.push(Math.round(prob));
            rainfall.push(Math.round(rain * 10) / 10);
        }

        return { labels, probability, rainfall };
    }

    updateRiskMeter(riskPercentage) {
        const riskCircle = document.getElementById('riskCircle');
        const riskPercentageElement = document.getElementById('riskPercentage');
        const riskStatus = document.getElementById('riskStatus');

        if (!riskCircle || !riskPercentageElement || !riskStatus) return;

        // Calculate stroke-dashoffset for the circle
        const circumference = 283; // 2 * PI * radius (45)
        const offset = circumference - (riskPercentage / 100) * circumference;

        // Update circle
        riskCircle.style.strokeDashoffset = offset;
        
        // Update colors and text based on risk level
        let color, status, bgClass;
        if (riskPercentage >= 85) {
            color = '#ef4444'; // Red
            status = 'CRITICAL RISK';
            bgClass = 'bg-red-100 text-red-800';
        } else if (riskPercentage >= 60) {
            color = '#f97316'; // Orange  
            status = 'HIGH RISK';
            bgClass = 'bg-orange-100 text-orange-800';
        } else if (riskPercentage >= 30) {
            color = '#f59e0b'; // Yellow
            status = 'MEDIUM RISK';
            bgClass = 'bg-yellow-100 text-yellow-800';
        } else {
            color = '#10b981'; // Green
            status = 'LOW RISK';
            bgClass = 'bg-green-100 text-green-800';
        }

        riskCircle.style.stroke = color;
        riskPercentageElement.textContent = riskPercentage + '%';
        riskStatus.textContent = status;
        riskStatus.className = `px-4 py-2 rounded-full font-semibold ${bgClass}`;
    }

    updateChartData(chartName, newData) {
        const chart = this.charts[chartName];
        if (!chart) return;

        switch (chartName) {
            case 'rainfall':
                chart.data.datasets[0].data = newData.values;
                chart.data.labels = newData.labels;
                break;
            case 'temperature':
                chart.data.datasets[0].data = newData.temperature;
                chart.data.datasets[1].data = newData.feelsLike;
                chart.data.labels = newData.labels;
                break;
            case 'precipitation':
                chart.data.datasets[0].data = newData.probability;
                chart.data.datasets[1].data = newData.rainfall;
                chart.data.labels = newData.labels;
                break;
        }

        chart.update('active');
    }

    updateAllCharts() {
        if (!this.initialized) return;

        try {
            // Update rainfall chart
            const rainfallData = this.generateRainfallData();
            this.updateChartData('rainfall', rainfallData);

            // Update temperature chart
            const temperatureData = this.generateTemperatureData();
            this.updateChartData('temperature', temperatureData);

            // Update precipitation chart
            const precipitationData = this.generatePrecipitationForecast();
            this.updateChartData('precipitation', precipitationData);

            // Update risk meter with new calculation
            const newRiskPercentage = Math.floor(Math.random() * 100);
            this.updateRiskMeter(newRiskPercentage);

            console.log('Charts updated with new data');
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }

    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    destroyChart(chartName) {
        const chart = this.charts[chartName];
        if (chart) {
            chart.destroy();
            delete this.charts[chartName];
        }
    }

    destroyAllCharts() {
        Object.keys(this.charts).forEach(chartName => {
            this.destroyChart(chartName);
        });
    }

    // Method to create forecast cards for the 7-day section
    updateForecastCards() {
        const forecastContainer = document.querySelector('#forecast .grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-7');
        if (!forecastContainer) return;

        const forecastData = this.generateTemperatureData();
        const precipitationData = this.generatePrecipitationForecast();
        
        let cardsHTML = '';
        
        for (let i = 0; i < 7; i++) {
            const isToday = i === 0;
            const cardClass = isToday ? 'forecast-card today' : 'forecast-card';
            const temp = forecastData.temperature[i];
            const prob = precipitationData.probability[i];
            const rain = precipitationData.rainfall[i];
            
            let weatherIcon = 'fas fa-sun';
            let weatherDesc = 'Sunny';
            
            if (prob > 70) {
                weatherIcon = 'fas fa-cloud-rain';
                weatherDesc = 'Rainy';
            } else if (prob > 40) {
                weatherIcon = 'fas fa-cloud';
                weatherDesc = 'Cloudy';
            } else if (prob > 20) {
                weatherIcon = 'fas fa-cloud-sun';
                weatherDesc = 'Partly Cloudy';
            }

            cardsHTML += `
                <div class="${cardClass}">
                    <div class="mb-3">
                        <div class="text-sm font-semibold ${isToday ? 'text-blue-100' : 'text-gray-600'} mb-1">
                            ${isToday ? 'Today' : forecastData.labels[i]}
                        </div>
                        <div class="text-2xl ${isToday ? 'text-white' : 'text-gray-800'} font-bold">
                            ${Math.round(temp)}°
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <i class="${weatherIcon} text-2xl ${isToday ? 'text-blue-100' : 'text-gray-600'} weather-icon"></i>
                    </div>
                    
                    <div class="text-xs ${isToday ? 'text-blue-100' : 'text-gray-600'} mb-2">
                        ${weatherDesc}
                    </div>
                    
                    <div class="text-xs ${isToday ? 'text-blue-100' : 'text-gray-500'}">
                        <div>Rain: ${prob}%</div>
                        ${rain > 0 ? `<div>${rain.toFixed(1)}mm</div>` : ''}
                    </div>
                </div>
            `;
        }
        
        forecastContainer.innerHTML = cardsHTML;
    }
}

// Initialize chart handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.chartHandler = new ChartHandler();
    
    // Update forecast cards
    setTimeout(() => {
        if (window.chartHandler) {
            window.chartHandler.updateForecastCards();
        }
    }, 1000);

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.chartHandler) {
            window.chartHandler.resizeCharts();
        }
    });
});