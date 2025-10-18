/**
 * Notification System for CloudGuard
 * Handles real-time alerts, notifications, and emergency messages
 */

class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.alertBanner = document.getElementById('alertBanner');
        this.notificationContainer = document.getElementById('notifications');
        this.alertQueue = [];
        this.isProcessingQueue = false;
        
        this.setupEventListeners();
        this.startPeriodicChecks();
        
        console.log('Notification system initialized');
    }

    setupEventListeners() {
        // Close alert banner
        const closeAlert = document.getElementById('closeAlert');
        if (closeAlert) {
            closeAlert.addEventListener('click', () => {
                this.hideAlertBanner();
            });
        }

        // Auto-hide alert banner after 10 seconds
        if (this.alertBanner) {
            this.alertBanner.addEventListener('show', () => {
                setTimeout(() => {
                    this.hideAlertBanner();
                }, 10000);
            });
        }
    }

    startPeriodicChecks() {
        // Check for weather alerts every 5 minutes
        setInterval(() => {
            this.checkWeatherAlerts();
        }, 5 * 60 * 1000);

        // Initial check after 5 seconds
        setTimeout(() => {
            this.checkWeatherAlerts();
        }, 5000);

        // Update recent alerts every minute
        setInterval(() => {
            this.updateRecentAlerts();
        }, 60 * 1000);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const notification = {
            id: Date.now() + Math.random(),
            message,
            type,
            timestamp: new Date()
        };

        this.notifications.unshift(notification);
        this.renderNotification(notification);

        // Auto-remove after duration
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);

        return notification.id;
    }

    renderNotification(notification) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${notification.type} alert-enter`;
        notificationElement.setAttribute('data-id', notification.id);

        const icons = {
            success: 'fas fa-check-circle text-green-600',
            error: 'fas fa-exclamation-circle text-red-600',
            warning: 'fas fa-exclamation-triangle text-yellow-600',
            info: 'fas fa-info-circle text-blue-600'
        };

        const colors = {
            success: 'text-green-800',
            error: 'text-red-800',
            warning: 'text-yellow-800',
            info: 'text-blue-800'
        };

        notificationElement.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0 mt-0.5">
                    <i class="${icons[notification.type]}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium ${colors[notification.type]}">
                        ${notification.message}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">
                        ${notification.timestamp.toLocaleTimeString()}
                    </p>
                </div>
                <button onclick="notificationSystem.removeNotification(${notification.id})" 
                        class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        this.notificationContainer.appendChild(notificationElement);

        // Trigger animation
        setTimeout(() => {
            notificationElement.classList.remove('alert-enter');
        }, 100);
    }

    removeNotification(id) {
        const element = document.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.add('alert-exit');
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 500);
        }

        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    showAlertBanner(message, type = 'error') {
        if (!this.alertBanner) return;

        const alertMessage = document.getElementById('alertMessage');
        if (alertMessage) {
            alertMessage.textContent = message;
        }

        // Update banner style based on type
        this.alertBanner.className = `fixed top-20 left-0 right-0 z-40 p-4 shadow-lg ${
            type === 'error' ? 'bg-red-600 text-white' :
            type === 'warning' ? 'bg-yellow-600 text-white' :
            type === 'success' ? 'bg-green-600 text-white' :
            'bg-blue-600 text-white'
        }`;

        this.alertBanner.classList.remove('hidden');
        
        // Dispatch custom event
        this.alertBanner.dispatchEvent(new CustomEvent('show'));
    }

    hideAlertBanner() {
        if (this.alertBanner) {
            this.alertBanner.classList.add('hidden');
        }
    }

    checkWeatherAlerts() {
        // Simulate weather alert checking
        const alerts = this.generateWeatherAlerts();
        
        alerts.forEach(alert => {
            if (alert.severity === 'critical') {
                this.showAlertBanner(alert.message, 'error');
                this.showNotification(alert.message, 'error', 15000);
            } else if (alert.severity === 'high') {
                this.showNotification(alert.message, 'warning', 10000);
            } else {
                this.showNotification(alert.message, 'info', 8000);
            }
        });

        this.updateRecentAlerts();
    }

    generateWeatherAlerts() {
        const alerts = [];
        const random = Math.random();

        // Generate different types of alerts based on probability
        if (random < 0.1) { // 10% chance of critical alert
            alerts.push({
                severity: 'critical',
                message: 'CRITICAL ALERT: Heavy rainfall detected in your area. Cloud burst risk is high. Take immediate precautions.',
                location: 'Current Location',
                timestamp: new Date(),
                type: 'cloudburst_risk'
            });
        } else if (random < 0.3) { // 20% chance of high severity
            alerts.push({
                severity: 'high',
                message: 'Weather Warning: Intense rainfall expected in the next 2 hours. Monitor conditions closely.',
                location: 'Regional Area',
                timestamp: new Date(),
                type: 'heavy_rain'
            });
        } else if (random < 0.5) { // 20% chance of medium severity
            alerts.push({
                severity: 'medium',
                message: 'Weather Advisory: Moderate to heavy rainfall predicted. Stay updated with latest forecasts.',
                location: 'District',
                timestamp: new Date(),
                type: 'rain_advisory'
            });
        }

        return alerts;
    }

    updateRecentAlerts() {
        const recentAlertsContainer = document.getElementById('recentAlerts');
        if (!recentAlertsContainer) return;

        const alerts = this.generateRecentAlerts();
        
        let alertsHTML = '';
        
        if (alerts.length === 0) {
            alertsHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-shield-alt text-4xl mb-3 text-green-500"></i>
                    <p class="text-lg font-semibold">No Active Alerts</p>
                    <p class="text-sm">All systems are monitoring normally</p>
                </div>
            `;
        } else {
            alerts.forEach(alert => {
                const severityClass = {
                    critical: 'border-red-500 bg-red-50 text-red-800',
                    high: 'border-orange-500 bg-orange-50 text-orange-800',
                    medium: 'border-yellow-500 bg-yellow-50 text-yellow-800',
                    low: 'border-green-500 bg-green-50 text-green-800'
                };

                const severityIcon = {
                    critical: 'fas fa-exclamation-triangle text-red-600',
                    high: 'fas fa-exclamation-circle text-orange-600',
                    medium: 'fas fa-info-circle text-yellow-600',
                    low: 'fas fa-check-circle text-green-600'
                };

                alertsHTML += `
                    <div class="border-l-4 p-4 rounded-lg ${severityClass[alert.severity]}">
                        <div class="flex items-start space-x-3">
                            <div class="flex-shrink-0 mt-1">
                                <i class="${severityIcon[alert.severity]}"></i>
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center justify-between mb-2">
                                    <h4 class="font-semibold text-sm uppercase tracking-wide">
                                        ${alert.severity} Alert
                                    </h4>
                                    <span class="text-xs opacity-75">
                                        ${this.getTimeAgo(alert.timestamp)}
                                    </span>
                                </div>
                                <p class="text-sm mb-2">${alert.message}</p>
                                <div class="flex items-center justify-between text-xs">
                                    <span class="flex items-center space-x-1">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <span>${alert.location}</span>
                                    </span>
                                    <span class="flex items-center space-x-1">
                                        <i class="fas fa-clock"></i>
                                        <span>${alert.timestamp.toLocaleTimeString()}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        recentAlertsContainer.innerHTML = alertsHTML;
    }

    generateRecentAlerts() {
        const alerts = [];
        const currentTime = new Date();
        
        // Generate some sample recent alerts
        for (let i = 0; i < Math.floor(Math.random() * 4); i++) {
            const alertTime = new Date(currentTime.getTime() - Math.random() * 6 * 60 * 60 * 1000); // Within last 6 hours
            
            const alertTypes = [
                {
                    severity: 'medium',
                    message: 'Moderate rainfall detected in the region. Cloud burst risk is currently low to medium.',
                    location: 'Regional Monitoring Station'
                },
                {
                    severity: 'low',
                    message: 'Weather conditions are stable. No immediate threat detected.',
                    location: 'All Monitoring Stations'
                },
                {
                    severity: 'high',
                    message: 'Heavy rainfall warning issued. Residents advised to stay alert.',
                    location: 'Mumbai Metropolitan Region'
                }
            ];

            const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            alerts.push({
                ...randomAlert,
                timestamp: alertTime,
                type: 'weather_update'
            });
        }

        return alerts.sort((a, b) => b.timestamp - a.timestamp);
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        }
    }

    showEmergencyAlert(message, location = 'Unknown') {
        // Critical emergency alert that demands immediate attention
        this.showAlertBanner(`🚨 EMERGENCY: ${message}`, 'error');
        this.showNotification(`EMERGENCY ALERT: ${message}`, 'error', 30000);
        
        // Browser notification if permission granted
        this.showBrowserNotification('CloudGuard Emergency Alert', message);
        
        // Play alert sound (if implemented)
        this.playAlertSound();
    }

    showBrowserNotification(title, message) {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body: message,
                    icon: '/favicon.ico',
                    tag: 'cloudburst-alert',
                    requireInteraction: true
                });
            } else if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, {
                            body: message,
                            icon: '/favicon.ico',
                            tag: 'cloudburst-alert',
                            requireInteraction: true
                        });
                    }
                });
            }
        }
    }

    playAlertSound() {
        // Create and play alert sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.showNotification('Notifications enabled successfully!', 'success');
                } else {
                    this.showNotification('Notification permission denied', 'warning');
                }
            });
        }
    }

    // Method to simulate SOS alert activation
    activateSOSAlert(location = null) {
        const userLocation = location || 'Current Location';
        
        this.showEmergencyAlert(
            `SOS Alert activated at ${userLocation}. Emergency services have been notified.`,
            userLocation
        );

        // Add to recent alerts
        const sosAlert = {
            severity: 'critical',
            message: 'SOS Emergency Alert activated. Emergency services dispatched.',
            location: userLocation,
            timestamp: new Date(),
            type: 'sos_alert'
        };

        // Show notification to nearby users (simulated)
        setTimeout(() => {
            this.showNotification(
                'Emergency services are on their way. Help is coming!',
                'info',
                15000
            );
        }, 3000);

        return sosAlert;
    }

    // Clear all notifications
    clearAllNotifications() {
        this.notifications.forEach(notification => {
            this.removeNotification(notification.id);
        });
        this.hideAlertBanner();
    }

    // Get notification statistics
    getNotificationStats() {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const recent = this.notifications.filter(n => n.timestamp >= last24Hours);
        const byType = recent.reduce((acc, n) => {
            acc[n.type] = (acc[n.type] || 0) + 1;
            return acc;
        }, {});

        return {
            total: this.notifications.length,
            recent24h: recent.length,
            byType
        };
    }
}

// Initialize notification system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.notificationSystem = new NotificationSystem();
    
    // Request notification permission after page loads
    setTimeout(() => {
        window.notificationSystem.requestNotificationPermission();
    }, 2000);
});