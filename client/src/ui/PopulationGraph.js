import Chart from 'chart.js/auto';

/**
 * PopulationGraph - Visualizes population trends over time
 * Tracks creature count, births, deaths, and optional genetic traits
 */
export class PopulationGraph {
    constructor() {
        // Data storage (rolling window of last 300 seconds)
        this.maxDataPoints = 300;
        this.updateInterval = 1.0; // Update every 1 second
        this.timeSinceLastUpdate = 0;

        this.timeLabels = [];
        this.populationData = [];
        this.foodData = [];
        this.birthRateData = [];
        this.deathRateData = [];

        // For calculating rates (births/deaths per second)
        this.lastBirths = 0;
        this.lastDeaths = 0;

        // Moving average: track births/deaths with timestamps
        this.birthEvents = []; // Array of {timestamp, count}
        this.deathEvents = []; // Array of {timestamp, count}
        this.movingAverageWindowSeconds = 10; // Calculate rate over last 10 seconds

        // Exponential smoothing for display (reduces jitter in the graph)
        this.smoothedBirthRate = 0;
        this.smoothedDeathRate = 0;
        this.smoothingFactor = 0.15; // Lower = smoother but slower to respond, higher = more reactive

        // Chart instance
        this.chart = null;
        this.isVisible = false;
    }

    /**
     * Initialize the chart with a canvas element
     */
    init(canvasElement) {
        const ctx = canvasElement.getContext('2d');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.timeLabels,
                datasets: [
                    {
                        label: 'Population',
                        data: this.populationData,
                        borderColor: '#4169e1',
                        backgroundColor: 'rgba(65, 105, 225, 0.1)',
                        borderWidth: 2,
                        tension: 0.2,
                        fill: true,
                        pointRadius: 0,
                        pointHitRadius: 10,
                    },
                    {
                        label: 'Food',
                        data: this.foodData,
                        borderColor: '#90ee90',
                        backgroundColor: 'rgba(144, 238, 144, 0.1)',
                        borderWidth: 2,
                        tension: 0.2,
                        fill: true,
                        pointRadius: 0,
                        pointHitRadius: 10,
                    },
                    {
                        label: 'Birth Rate (10s avg)',
                        data: this.birthRateData,
                        borderColor: '#ffd700',
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        borderWidth: 1.5,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHitRadius: 10,
                        yAxisID: 'y-rate',
                    },
                    {
                        label: 'Death Rate (10s avg)',
                        data: this.deathRateData,
                        borderColor: '#ff6b6b',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        borderWidth: 1.5,
                        tension: 0.4,
                        fill: false,
                        pointRadius: 0,
                        pointHitRadius: 10,
                        yAxisID: 'y-rate',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false, // Disable animations for performance
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: {
                                size: 11
                            },
                            boxWidth: 15,
                            padding: 8
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#444444',
                        borderWidth: 1,
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Time (seconds)',
                            color: '#cccccc'
                        },
                        ticks: {
                            color: '#cccccc',
                            maxTicksLimit: 8,
                            callback: function(value, index) {
                                // Show only some labels to avoid clutter
                                if (index % 30 === 0) return value;
                                return '';
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Count',
                            color: '#cccccc'
                        },
                        ticks: {
                            color: '#cccccc',
                            stepSize: 10
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        beginAtZero: true
                    },
                    'y-rate': {
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Rate (per second)',
                            color: '#cccccc'
                        },
                        ticks: {
                            color: '#cccccc',
                        },
                        grid: {
                            drawOnChartArea: false, // Don't draw grid lines for this axis
                        },
                        beginAtZero: true
                    }
                }
            }
        });

        this.isVisible = true;
        console.log('PopulationGraph initialized successfully');
    }

    /**
     * Update graph data (called from World.update)
     */
    update(deltaTime, stats) {
        if (!this.chart || !this.isVisible) return;

        this.timeSinceLastUpdate += deltaTime;

        // Only update at specified interval
        if (this.timeSinceLastUpdate >= this.updateInterval) {
            const currentTime = stats.elapsedTime;

            // Track new births/deaths that occurred since last update
            const newBirths = stats.totalBirths - this.lastBirths;
            const newDeaths = stats.totalDeaths - this.lastDeaths;

            // Add events to history if any occurred
            if (newBirths > 0) {
                this.birthEvents.push({ timestamp: currentTime, count: newBirths });
            }
            if (newDeaths > 0) {
                this.deathEvents.push({ timestamp: currentTime, count: newDeaths });
            }

            // Remove events older than the moving average window
            const cutoffTime = currentTime - this.movingAverageWindowSeconds;
            this.birthEvents = this.birthEvents.filter(e => e.timestamp > cutoffTime);
            this.deathEvents = this.deathEvents.filter(e => e.timestamp > cutoffTime);

            // Calculate moving average: total events in window / window duration
            const totalBirthsInWindow = this.birthEvents.reduce((sum, e) => sum + e.count, 0);
            const totalDeathsInWindow = this.deathEvents.reduce((sum, e) => sum + e.count, 0);
            const rawBirthRate = totalBirthsInWindow / this.movingAverageWindowSeconds;
            const rawDeathRate = totalDeathsInWindow / this.movingAverageWindowSeconds;

            // Apply exponential smoothing to reduce jitter
            // Formula: smoothed = smoothed * (1 - alpha) + raw * alpha
            this.smoothedBirthRate = this.smoothedBirthRate * (1 - this.smoothingFactor) + rawBirthRate * this.smoothingFactor;
            this.smoothedDeathRate = this.smoothedDeathRate * (1 - this.smoothingFactor) + rawDeathRate * this.smoothingFactor;

            // Add new data point
            this.timeLabels.push(Math.floor(currentTime));
            this.populationData.push(stats.creatureCount);
            this.foodData.push(stats.foodCount);
            this.birthRateData.push(parseFloat(this.smoothedBirthRate.toFixed(2)));
            this.deathRateData.push(parseFloat(this.smoothedDeathRate.toFixed(2)));

            console.log(`Graph update: Pop=${stats.creatureCount}, Food=${stats.foodCount}, BirthRate=${this.smoothedBirthRate.toFixed(2)}/s, Time=${currentTime.toFixed(1)}s`);

            // Remove old data if we exceed max points
            if (this.timeLabels.length > this.maxDataPoints) {
                this.timeLabels.shift();
                this.populationData.shift();
                this.foodData.shift();
                this.birthRateData.shift();
                this.deathRateData.shift();
            }

            // Update chart data references (Chart.js needs this)
            this.chart.data.labels = this.timeLabels;
            this.chart.data.datasets[0].data = this.populationData;
            this.chart.data.datasets[1].data = this.foodData;
            this.chart.data.datasets[2].data = this.birthRateData;
            this.chart.data.datasets[3].data = this.deathRateData;

            // Update chart
            this.chart.update('none'); // 'none' mode = no animation

            // Update tracking variables
            this.lastBirths = stats.totalBirths;
            this.lastDeaths = stats.totalDeaths;
            this.timeSinceLastUpdate = 0;
        }
    }

    /**
     * Clear all data and reset graph
     */
    reset(stats) {
        this.timeLabels = [];
        this.populationData = [];
        this.foodData = [];
        this.birthRateData = [];
        this.deathRateData = [];

        this.lastBirths = stats ? stats.totalBirths : 0;
        this.lastDeaths = stats ? stats.totalDeaths : 0;
        this.timeSinceLastUpdate = 0;

        // Clear event history for moving average
        this.birthEvents = [];
        this.deathEvents = [];

        // Reset smoothed values
        this.smoothedBirthRate = 0;
        this.smoothedDeathRate = 0;

        if (this.chart) {
            this.chart.update('none');
        }
    }

    /**
     * Show or hide the graph
     */
    setVisible(visible) {
        this.isVisible = visible;
        const container = document.getElementById('graph-container');
        if (container) {
            container.style.display = visible ? 'block' : 'none';
        }
    }

    /**
     * Toggle graph visibility
     */
    toggle() {
        this.setVisible(!this.isVisible);
    }

    /**
     * Destroy the chart instance
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}
