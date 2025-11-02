/* ============================================
   THEME-CHARTS.JS - Adaptation des graphiques au thème
   Gère Chart.js, ApexCharts, et graphiques personnalisés
   ============================================ */

/**
 * Obtenir les couleurs du thème actuel
 */
function getThemeColors() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    if (isDarkMode) {
        return {
            // Couleurs principales
            primary: '#3b82f6',
            secondary: '#8b5cf6',
            accent: '#f472b6',
            success: '#34d399',
            warning: '#fbbf24',
            error: '#f87171',
            info: '#60a5fa',
            
            // Texte
            textPrimary: '#f8fafc',
            textSecondary: '#cbd5e1',
            textTertiary: '#94a3b8',
            
            // Fond
            backgroundPrimary: '#0f172a',
            backgroundSecondary: '#1e293b',
            backgroundTertiary: '#334155',
            
            // Graphiques
            gridColor: 'rgba(255, 255, 255, 0.1)',
            tickColor: '#94a3b8',
            tooltipBg: '#1e293b',
            tooltipBorder: 'rgba(255, 255, 255, 0.1)',
            tooltipText: '#f8fafc',
            legendText: '#cbd5e1',
            
            // Séries de couleurs pour graphiques multiples
            series: [
                '#3b82f6', // Bleu
                '#8b5cf6', // Violet
                '#f472b6', // Rose
                '#34d399', // Vert
                '#fbbf24', // Jaune
                '#f87171', // Rouge
                '#60a5fa', // Bleu clair
                '#a78bfa', // Violet clair
                '#fb923c', // Orange
                '#22d3ee', // Cyan
            ],
            
            // Dégradés
            gradientStart: 'rgba(59, 130, 246, 0.3)',
            gradientEnd: 'rgba(59, 130, 246, 0.01)'
        };
    } else {
        return {
            // Couleurs principales
            primary: '#2563eb',
            secondary: '#7c3aed',
            accent: '#ec4899',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6',
            
            // Texte
            textPrimary: '#1e293b',
            textSecondary: '#64748b',
            textTertiary: '#94a3b8',
            
            // Fond
            backgroundPrimary: '#ffffff',
            backgroundSecondary: '#f8fafc',
            backgroundTertiary: '#f1f5f9',
            
            // Graphiques
            gridColor: 'rgba(0, 0, 0, 0.1)',
            tickColor: '#64748b',
            tooltipBg: '#ffffff',
            tooltipBorder: '#e2e8f0',
            tooltipText: '#1e293b',
            legendText: '#64748b',
            
            // Séries de couleurs pour graphiques multiples
            series: [
                '#2563eb', // Bleu
                '#7c3aed', // Violet
                '#ec4899', // Rose
                '#10b981', // Vert
                '#f59e0b', // Orange
                '#ef4444', // Rouge
                '#3b82f6', // Bleu clair
                '#8b5cf6', // Violet clair
                '#f97316', // Orange foncé
                '#06b6d4', // Cyan
            ],
            
            // Dégradés
            gradientStart: 'rgba(37, 99, 235, 0.3)',
            gradientEnd: 'rgba(37, 99, 235, 0.01)'
        };
    }
}

/* ============================================
   CHART.JS - Configuration
   ============================================ */

/**
 * Obtenir les options par défaut pour Chart.js
 */
function getChartJsDefaultOptions() {
    const colors = getThemeColors();
    
    return {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
            intersect: false,
            mode: 'index'
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                    color: colors.legendText,
                    font: {
                        family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        size: 12,
                        weight: 500
                    },
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    boxWidth: 8,
                    boxHeight: 8
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: colors.tooltipBg,
                titleColor: colors.tooltipText,
                bodyColor: colors.textSecondary,
                borderColor: colors.tooltipBorder,
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                displayColors: true,
                titleFont: {
                    size: 13,
                    weight: 600,
                    family: "'Inter', sans-serif"
                },
                bodyFont: {
                    size: 12,
                    family: "'Inter', sans-serif"
                },
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR'
                            }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: true,
                    color: colors.gridColor,
                    borderColor: colors.gridColor,
                    tickColor: colors.gridColor,
                    drawBorder: true,
                    drawOnChartArea: true,
                    drawTicks: true
                },
                ticks: {
                    color: colors.tickColor,
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    },
                    padding: 8
                },
                border: {
                    color: colors.gridColor
                }
            },
            y: {
                grid: {
                    display: true,
                    color: colors.gridColor,
                    borderColor: colors.gridColor,
                    tickColor: colors.gridColor,
                    drawBorder: true,
                    drawOnChartArea: true,
                    drawTicks: true
                },
                ticks: {
                    color: colors.tickColor,
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    },
                    padding: 8,
                    callback: function(value) {
                        return new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'EUR',
                            notation: 'compact',
                            compactDisplay: 'short'
                        }).format(value);
                    }
                },
                border: {
                    color: colors.gridColor
                }
            }
        }
    };
}

/**
 * Créer un dégradé pour Chart.js
 */
function createChartJsGradient(ctx, chartArea, color) {
    const colors = getThemeColors();
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, colors.gradientEnd);
    gradient.addColorStop(1, colors.gradientStart);
    return gradient;
}

/**
 * Mettre à jour un graphique Chart.js existant
 */
function updateChartJsTheme(chart) {
    if (!chart || !chart.options) return;
    
    const options = getChartJsDefaultOptions();
    const colors = getThemeColors();
    
    // Mettre à jour les options
    if (chart.options.plugins) {
        chart.options.plugins.legend = options.plugins.legend;
        chart.options.plugins.tooltip = options.plugins.tooltip;
    }
    
    if (chart.options.scales) {
        if (chart.options.scales.x) {
            chart.options.scales.x.grid = options.scales.x.grid;
            chart.options.scales.x.ticks = options.scales.x.ticks;
            chart.options.scales.x.border = options.scales.x.border;
        }
        if (chart.options.scales.y) {
            chart.options.scales.y.grid = options.scales.y.grid;
            chart.options.scales.y.ticks = options.scales.y.ticks;
            chart.options.scales.y.border = options.scales.y.border;
        }
    }
    
    // Mettre à jour les couleurs des datasets si nécessaire
    chart.data.datasets.forEach((dataset, index) => {
        // Ne modifier que si pas de couleur custom
        if (!dataset.customColor) {
            const seriesColor = colors.series[index % colors.series.length];
            
            // Pour les graphiques en ligne/aire
            if (dataset.borderColor) {
                dataset.borderColor = seriesColor;
            }
            
            // Pour les aires remplies
            if (dataset.backgroundColor && typeof dataset.backgroundColor === 'string') {
                if (dataset.fill) {
                    // Créer un dégradé si c'est une aire
                    const ctx = chart.ctx;
                    const chartArea = chart.chartArea;
                    if (chartArea) {
                        dataset.backgroundColor = createChartJsGradient(ctx, chartArea, seriesColor);
                    }
                } else {
                    dataset.backgroundColor = seriesColor + '40'; // Ajout d'opacité
                }
            }
            
            // Pour les points
            if (dataset.pointBackgroundColor) {
                dataset.pointBackgroundColor = seriesColor;
            }
            if (dataset.pointBorderColor) {
                dataset.pointBorderColor = seriesColor;
            }
        }
    });
    
    chart.update();
}

/**
 * Mettre à jour tous les graphiques Chart.js
 */
function updateAllChartJsCharts() {
    if (typeof Chart === 'undefined') {
        console.log('⚠️ Chart.js non chargé');
        return;
    }
    
    // Chart.js v3+
    if (Chart.instances) {
        Chart.instances.forEach(chart => {
            updateChartJsTheme(chart);
        });
        console.log('🎨 Graphiques Chart.js mis à jour:', Chart.instances.length);
    }
    // Chart.js v2
    else if (Chart.helpers && Chart.helpers.each) {
        Chart.helpers.each(Chart.instances, (instance) => {
            updateChartJsTheme(instance.chart);
        });
        console.log('🎨 Graphiques Chart.js mis à jour (v2)');
    }
}

/* ============================================
   APEXCHARTS - Configuration
   ============================================ */

/**
 * Obtenir les options par défaut pour ApexCharts
 */
function getApexChartsDefaultOptions() {
    const colors = getThemeColors();
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    return {
        chart: {
            foreColor: colors.textSecondary,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: 'transparent',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true
                },
                theme: isDarkMode ? 'dark' : 'light'
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 400
            }
        },
        colors: colors.series,
        grid: {
            borderColor: colors.gridColor,
            strokeDashArray: 3,
            xaxis: {
                lines: {
                    show: true
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        xaxis: {
            labels: {
                style: {
                    colors: colors.tickColor,
                    fontSize: '11px',
                    fontFamily: "'Inter', sans-serif"
                }
            },
            axisBorder: {
                color: colors.gridColor,
                height: 1
            },
            axisTicks: {
                color: colors.gridColor
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: colors.tickColor,
                    fontSize: '11px',
                    fontFamily: "'Inter', sans-serif"
                },
                formatter: function(value) {
                    if (value === null || value === undefined) return '';
                    return new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        notation: 'compact',
                        maximumFractionDigits: 1
                    }).format(value);
                }
            }
        },
        tooltip: {
            theme: isDarkMode ? 'dark' : 'light',
            style: {
                fontSize: '12px',
                fontFamily: "'Inter', sans-serif"
            },
            y: {
                formatter: function(value) {
                    if (value === null || value === undefined) return '';
                    return new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR'
                    }).format(value);
                }
            }
        },
        legend: {
            labels: {
                colors: colors.legendText
            },
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: "'Inter', sans-serif",
            markers: {
                width: 10,
                height: 10,
                radius: 10
            }
        },
        dataLabels: {
            style: {
                colors: [colors.textPrimary],
                fontSize: '11px',
                fontFamily: "'Inter', sans-serif"
            }
        },
        stroke: {
            width: 2,
            curve: 'smooth'
        },
        markers: {
            size: 4,
            strokeWidth: 2,
            hover: {
                size: 6
            }
        }
    };
}

/**
 * Mettre à jour un graphique ApexCharts
 */
function updateApexChartTheme(chart) {
    if (!chart || !chart.updateOptions) return;
    
    const options = getApexChartsDefaultOptions();
    
    try {
        chart.updateOptions(options, false, true);
        console.log('🎨 Graphique ApexChart mis à jour');
    } catch (error) {
        console.error('❌ Erreur mise à jour ApexChart:', error);
    }
}

/**
 * Mettre à jour tous les graphiques ApexCharts
 */
function updateAllApexCharts() {
    // Les instances ApexCharts doivent être stockées globalement
    if (window.apexCharts && Array.isArray(window.apexCharts)) {
        window.apexCharts.forEach(chart => {
            updateApexChartTheme(chart);
        });
        console.log('🎨 Graphiques ApexCharts mis à jour:', window.apexCharts.length);
    } else {
        console.log('ℹ️ Aucune instance ApexCharts trouvée (utiliser window.apexCharts)');
    }
}

/* ============================================
   HIGHCHARTS - Configuration
   ============================================ */

/**
 * Obtenir les options par défaut pour Highcharts
 */
function getHighchartsDefaultOptions() {
    const colors = getThemeColors();
    
    return {
        colors: colors.series,
        chart: {
            backgroundColor: 'transparent',
            style: {
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }
        },
        title: {
            style: {
                color: colors.textPrimary,
                fontSize: '16px',
                fontWeight: '600'
            }
        },
        subtitle: {
            style: {
                color: colors.textSecondary,
                fontSize: '13px'
            }
        },
        xAxis: {
            gridLineColor: colors.gridColor,
            labels: {
                style: {
                    color: colors.tickColor,
                    fontSize: '11px'
                }
            },
            lineColor: colors.gridColor,
            tickColor: colors.gridColor,
            title: {
                style: {
                    color: colors.textSecondary
                }
            }
        },
        yAxis: {
            gridLineColor: colors.gridColor,
            labels: {
                style: {
                    color: colors.tickColor,
                    fontSize: '11px'
                }
            },
            lineColor: colors.gridColor,
            tickColor: colors.gridColor,
            title: {
                style: {
                    color: colors.textSecondary
                }
            }
        },
        legend: {
            itemStyle: {
                color: colors.legendText,
                fontSize: '12px',
                fontWeight: '500'
            },
            itemHoverStyle: {
                color: colors.textPrimary
            }
        },
        tooltip: {
            backgroundColor: colors.tooltipBg,
            borderColor: colors.tooltipBorder,
            style: {
                color: colors.tooltipText,
                fontSize: '12px'
            }
        },
        plotOptions: {
            series: {
                dataLabels: {
                    color: colors.textPrimary
                }
            }
        }
    };
}

/**
 * Mettre à jour un graphique Highcharts
 */
function updateHighchartTheme(chart) {
    if (!chart || !chart.update) return;
    
    const options = getHighchartsDefaultOptions();
    
    try {
        chart.update(options);
        console.log('🎨 Graphique Highcharts mis à jour');
    } catch (error) {
        console.error('❌ Erreur mise à jour Highcharts:', error);
    }
}

/**
 * Mettre à jour tous les graphiques Highcharts
 */
function updateAllHighcharts() {
    if (typeof Highcharts === 'undefined') {
        console.log('⚠️ Highcharts non chargé');
        return;
    }
    
    if (Highcharts.charts) {
        Highcharts.charts.forEach(chart => {
            if (chart) {
                updateHighchartTheme(chart);
            }
        });
        console.log('🎨 Graphiques Highcharts mis à jour:', Highcharts.charts.length);
    }
}

/* ============================================
   ÉCOUTER LES CHANGEMENTS DE THÈME
   ============================================ */

/**
 * Observer les changements de classe sur body
 */
function watchThemeChanges() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const isDarkMode = document.body.classList.contains('dark-mode');
                console.log('🎨 Changement de thème détecté:', isDarkMode ? 'dark' : 'light');
                
                // Petite pause pour laisser les transitions CSS se faire
                setTimeout(() => {
                    // Mettre à jour tous les graphiques
                    updateAllChartJsCharts();
                    updateAllApexCharts();
                    updateAllHighcharts();
                    
                    // Event personnalisé pour d'autres éléments
                    window.dispatchEvent(new CustomEvent('themeChanged', {
                        detail: {
                            isDarkMode: isDarkMode,
                            colors: getThemeColors()
                        }
                    }));
                }, 100);
            }
        });
    });
    
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    console.log('👀 Observateur de thème pour graphiques activé');
}

/* ============================================
   EVENT LISTENER PERSONNALISÉ
   ============================================ */

// Écouter l'événement personnalisé themeChanged
window.addEventListener('themeChanged', (e) => {
    console.log('📢 Event themeChanged reçu:', e.detail);
    
    // Vous pouvez ajouter ici du code personnalisé
    // Par exemple: mettre à jour d'autres visualisations
});

/* ============================================
   INITIALISATION
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    watchThemeChanges();
    console.log('✅ Système d\'adaptation des graphiques initialisé');
});

// Exporter les fonctions pour utilisation globale
window.getThemeColors = getThemeColors;
window.getChartJsDefaultOptions = getChartJsDefaultOptions;
window.getApexChartsDefaultOptions = getApexChartsDefaultOptions;
window.getHighchartsDefaultOptions = getHighchartsDefaultOptions;
window.createChartJsGradient = createChartJsGradient;
window.updateChartJsTheme = updateChartJsTheme;
window.updateApexChartTheme = updateApexChartTheme;
window.updateHighchartTheme = updateHighchartTheme;
window.updateAllChartJsCharts = updateAllChartJsCharts;
window.updateAllApexCharts = updateAllApexCharts;
window.updateAllHighcharts = updateAllHighcharts;

console.log('✅ Module de thème pour graphiques chargé');