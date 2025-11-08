/* ========================================
   MOTEUR DE GRAPHIQUES INTERACTIFS
   Chart.js pour visualisations premium
   ======================================== */

class ChatbotCharts {
    constructor() {
        this.charts = {};
        this.chartColors = {
            primary: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            purple: '#8b5cf6',
            pink: '#ec4899',
            teal: '#14b8a6',
            indigo: '#6366f1',
            orange: '#f97316'
        };
        
        this.loadChartJS();
    }

    /**
     * Charge Chart.js dynamiquement
     */
    async loadChartJS() {
        if (typeof Chart !== 'undefined') return;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.async = true;
            script.onload = () => {
                console.log('Chart.js loaded successfully');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Crée un graphique depuis les données Gemini
     */
    async createChartFromData(containerId, chartData) {
        // Attendre que Chart.js soit chargé
        await this.loadChartJS();
        
        const type = chartData.type || 'line';
        
        switch(type) {
            case 'line':
                return this.createLineChart(containerId, chartData);
            case 'bar':
                return this.createBarChart(containerId, chartData);
            case 'pie':
                return this.createPieChart(containerId, chartData);
            case 'multi-line':
                return this.createMultiLineChart(containerId, chartData);
            default:
                return this.createLineChart(containerId, chartData);
        }
    }

    /**
     * Crée un graphique de ligne
     */
    createLineChart(containerId, data) {
        const canvas = this.createCanvas(containerId);
        const ctx = canvas.getContext('2d');

        const datasets = data.datasets.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.data,
            borderColor: dataset.color || this.chartColors.primary,
            backgroundColor: this.hexToRgba(dataset.color || this.chartColors.primary, 0.1),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: dataset.color || this.chartColors.primary,
            pointHoverBackgroundColor: dataset.color || this.chartColors.primary,
            pointBorderColor: '#fff',
            pointHoverBorderColor: '#fff',
            pointBorderWidth: 2
        }));

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: !!data.title,
                        text: data.title || '',
                        font: { size: 16, weight: 'bold' },
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        display: datasets.length > 1,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12, weight: '600' }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 13, weight: '600' },
                        bodyFont: { size: 12 },
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            label: (context) => {
                                let label = context.dataset.label || '';
                                if (label) label += ': ';
                                
                                const value = context.parsed.y;
                                const formatValue = data.formatValue || '';
                                
                                if (formatValue === '$') {
                                    label += `$${value.toFixed(2)}`;
                                } else if (formatValue === '%') {
                                    label += `${value.toFixed(2)}%`;
                                } else if (formatValue === 'M') {
                                    label += `${value.toFixed(0)}M`;
                                } else if (formatValue === 'B') {
                                    label += `${value.toFixed(2)}B`;
                                } else {
                                    label += value.toLocaleString();
                                }
                                
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 11 },
                            maxRotation: 45,
                            minRotation: 0
                        }
                    },
                    y: {
                        beginAtZero: data.beginAtZero !== false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            font: { size: 11 },
                            callback: (value) => {
                                const formatValue = data.formatValue || '';
                                if (formatValue === '$') return `$${value.toFixed(0)}`;
                                if (formatValue === '%') return `${value}%`;
                                if (formatValue === 'M') return `${value}M`;
                                if (formatValue === 'B') return `${value.toFixed(1)}B`;
                                return value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        this.charts[containerId] = chart;
        return chart;
    }

    /**
     * Crée un graphique multi-lignes
     */
    createMultiLineChart(containerId, data) {
        return this.createLineChart(containerId, data);
    }

    /**
     * Crée un graphique en barres
     */
    createBarChart(containerId, data) {
        const canvas = this.createCanvas(containerId);
        const ctx = canvas.getContext('2d');

        const colors = data.datasets[0].colors || 
            data.labels.map((_, i) => Object.values(this.chartColors)[i % 9]);

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: data.datasets.map(dataset => ({
                    label: dataset.label,
                    data: dataset.data,
                    backgroundColor: dataset.colors || colors,
                    borderColor: 'transparent',
                    borderRadius: 8,
                    borderSkipped: false
                }))
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: !!data.title,
                        text: data.title || '',
                        font: { size: 16, weight: 'bold' },
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        display: data.datasets.length > 1,
                        position: 'top'
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    x: {
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            callback: (value) => {
                                const formatValue = data.formatValue || '';
                                if (formatValue === '$') return `$${value.toFixed(0)}`;
                                if (formatValue === '%') return `${value}%`;
                                if (formatValue === 'M') return `${value}M`;
                                if (formatValue === 'B') return `${value.toFixed(1)}B`;
                                return value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        this.charts[containerId] = chart;
        return chart;
    }

    /**
     * Crée un graphique camembert
     */
    createPieChart(containerId, data) {
        const canvas = this.createCanvas(containerId);
        const ctx = canvas.getContext('2d');

        const colors = data.colors || Object.values(this.chartColors);

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.datasets[0].data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: !!data.title,
                        text: data.title || '',
                        font: { size: 16, weight: 'bold' },
                        padding: { top: 10, bottom: 20 }
                    },
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${percentage}% (${value})`;
                            }
                        }
                    }
                }
            }
        });

        this.charts[containerId] = chart;
        return chart;
    }

    /**
     * Crée le canvas pour le graphique
     */
    createCanvas(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container ${containerId} not found`);
        }

        // Nettoie le container
        container.innerHTML = '';

        // Crée le canvas
        const canvas = document.createElement('canvas');
        canvas.id = `${containerId}-canvas`;
        canvas.style.maxHeight = '300px';
        container.appendChild(canvas);

        return canvas;
    }

    /**
     * Convertit hex en rgba
     */
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    /**
     * Détruit un graphique
     */
    destroyChart(containerId) {
        if (this.charts[containerId]) {
            this.charts[containerId].destroy();
            delete this.charts[containerId];
        }
    }

    /**
     * Détruit tous les graphiques
     */
    destroyAll() {
        Object.keys(this.charts).forEach(id => this.destroyChart(id));
    }

    /**
     * Génère un ID unique pour un container
     */
    generateChartId() {
        return `chatbot-chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Export global
window.ChatbotCharts = ChatbotCharts;