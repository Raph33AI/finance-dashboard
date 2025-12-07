/* ==============================================
   📊 MULTI-STOCK COMPARISON
   Comparaison de prédictions pour plusieurs stocks
   ============================================== */

const MultiStockComparison = {
    selectedStocks: [],
    maxStocks: 5,
    comparisonData: {},
    
    /**
     * Initialisation
     */
    init() {
        console.log('📊 Initializing Multi-Stock Comparison...');
    },
    
    /**
     * Gère la sélection/désélection d'un stock
     */
    toggleStock(symbol) {
        const index = this.selectedStocks.indexOf(symbol);
        
        if (index > -1) {
            // Désélectionner
            this.selectedStocks.splice(index, 1);
            this.updateChipUI(symbol, false);
        } else {
            // Vérifier la limite
            if (this.selectedStocks.length >= this.maxStocks) {
                if (window.TrendPrediction && window.TrendPrediction.showNotification) {
                    window.TrendPrediction.showNotification(`Maximum ${this.maxStocks} stocks allowed`, 'warning');
                } else {
                    alert(`Maximum ${this.maxStocks} stocks allowed`);
                }
                return;
            }
            
            // Sélectionner
            this.selectedStocks.push(symbol);
            this.updateChipUI(symbol, true);
        }
        
        // Mettre à jour le bouton de comparaison
        this.updateCompareButton();
        
        console.log('Selected stocks:', this.selectedStocks);
    },
    
    /**
     * Met à jour l'UI du chip
     */
    updateChipUI(symbol, selected) {
        const chips = document.querySelectorAll('.stock-chip');
        chips.forEach(chip => {
            const chipText = chip.textContent.trim();
            if (chipText.includes(symbol)) {
                if (selected) {
                    chip.classList.add('selected');
                    // Ajouter un bouton de suppression
                    if (!chip.querySelector('.remove-chip')) {
                        const removeBtn = document.createElement('span');
                        removeBtn.className = 'remove-chip';
                        removeBtn.innerHTML = '✕';
                        removeBtn.onclick = (e) => {
                            e.stopPropagation();
                            this.toggleStock(symbol);
                        };
                        chip.appendChild(removeBtn);
                    }
                } else {
                    chip.classList.remove('selected');
                    const removeBtn = chip.querySelector('.remove-chip');
                    if (removeBtn) {
                        removeBtn.remove();
                    }
                }
            }
        });
    },
    
    /**
     * Met à jour l'état du bouton de comparaison
     */
    updateCompareButton() {
        const btn = document.getElementById('btnCompareStocks');
        if (!btn) return;
        
        if (this.selectedStocks.length >= 2) {
            btn.disabled = false;
            btn.innerHTML = `<i class='fas fa-chart-line'></i> Compare ${this.selectedStocks.length} Stocks`;
        } else {
            btn.disabled = true;
            btn.innerHTML = `<i class='fas fa-chart-line'></i> Select at least 2 stocks`;
        }
    },
    
    /**
     * Lance la comparaison
     */
    async runComparison() {
        if (this.selectedStocks.length < 2) {
            alert('Please select at least 2 stocks to compare');
            return;
        }
        
        console.log('🚀 Running comparison for:', this.selectedStocks);
        
        // Afficher le loader
        if (window.TrendPrediction) {
            window.TrendPrediction.showLoading(true, 'Analyzing selected stocks...');
        }
        
        try {
            // Charger les données pour chaque stock
            this.comparisonData = {};
            
            for (const symbol of this.selectedStocks) {
                console.log(`📊 Loading data for ${symbol}...`);
                
                // Utiliser l'API client avec rate limiting
                const quote = await window.TrendPrediction.apiRequest(
                    () => window.apiClient.getQuote(symbol),
                    'high'
                );
                
                const timeSeries = await window.TrendPrediction.apiRequest(
                    () => window.TrendPrediction.getTimeSeriesForPeriod(symbol, '6M'),
                    'high'
                );
                
                // Entraîner un modèle simple (Linear Regression)
                const prices = timeSeries.data.map(p => p.close);
                const prediction = await this.predictSimple(prices, 30);
                
                this.comparisonData[symbol] = {
                    quote,
                    prices,
                    prediction,
                    currentPrice: quote.price,
                    change: quote.change,
                    changePercent: quote.percentChange
                };
                
                await this.sleep(300);
            }
            
            // Afficher les résultats
            this.displayComparison();
            
        } catch (error) {
            console.error('❌ Comparison error:', error);
            if (window.TrendPrediction) {
                window.TrendPrediction.showNotification('Failed to load comparison data', 'error');
            }
        } finally {
            if (window.TrendPrediction) {
                window.TrendPrediction.showLoading(false);
            }
        }
    },
    
    /**
     * Prédiction simple (Linear Regression)
     */
    async predictSimple(prices, days) {
        const n = prices.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = prices;
        
        // Calcul de la régression linéaire
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Prédiction
        const futureX = n + days - 1;
        const prediction = slope * futureX + intercept;
        
        return {
            value: prediction,
            change: ((prediction - prices[prices.length - 1]) / prices[prices.length - 1]) * 100
        };
    },
    
    /**
     * Affiche le graphique de comparaison
     */
    displayComparison() {
        const chartContainer = document.getElementById('multiStockChartContainer');
        const metricsGrid = document.getElementById('comparisonMetricsGrid');
        
        if (!chartContainer || !metricsGrid) return;
        
        chartContainer.classList.remove('hidden');
        metricsGrid.classList.remove('hidden');
        
        // Créer le graphique
        this.createComparisonChart();
        
        // Créer les cartes de métriques
        this.createMetricsCards();
    },
    
    /**
     * Crée le graphique de comparaison
     */
    createComparisonChart() {
        const series = [];
        
        Object.entries(this.comparisonData).forEach(([symbol, data]) => {
            // Série historique
            const historicalData = data.prices.map((price, i) => [i, price]);
            
            series.push({
                name: symbol,
                data: historicalData,
                type: 'line',
                lineWidth: 2
            });
            
            // Ajouter un point de prédiction
            const lastIndex = data.prices.length - 1;
            series.push({
                name: `${symbol} Prediction`,
                data: [[lastIndex, data.prices[lastIndex]], [lastIndex + 30, data.prediction.value]],
                type: 'line',
                dashStyle: 'Dash',
                lineWidth: 2,
                enableMouseTracking: false
            });
        });
        
        Highcharts.chart('multiStockChart', {
            chart: {
                height: 500,
                borderRadius: 15
            },
            title: {
                text: 'Multi-Stock Price Comparison',
                style: {
                    color: '#667eea',
                    fontWeight: 'bold'
                }
            },
            subtitle: {
                text: '30-Day Prediction Outlook',
                style: { color: '#64748b' }
            },
            xAxis: {
                title: { text: 'Days' },
                plotLines: [{
                    value: Object.values(this.comparisonData)[0].prices.length - 1,
                    color: '#dc3545',
                    dashStyle: 'Dash',
                    width: 2,
                    label: {
                        text: 'Today',
                        style: { color: '#dc3545', fontWeight: 'bold' }
                    }
                }]
            },
            yAxis: {
                title: { text: 'Price (USD)' },
                labels: {
                    formatter: function() {
                        return '$' + this.value.toFixed(2);
                    }
                }
            },
            tooltip: {
                shared: true,
                crosshairs: true,
                valuePrefix: '$',
                valueDecimals: 2
            },
            legend: {
                enabled: true,
                align: 'center',
                verticalAlign: 'bottom'
            },
            series: series,
            credits: { enabled: false }
        });
    },
    
    /**
     * Crée les cartes de métriques
     */
    createMetricsCards() {
        const metricsGrid = document.getElementById('comparisonMetricsGrid');
        if (!metricsGrid) return;
        
        let html = '';
        
        Object.entries(this.comparisonData).forEach(([symbol, data]) => {
            const changeClass = data.prediction.change >= 0 ? 'positive' : 'negative';
            const changeSign = data.prediction.change >= 0 ? '+' : '';
            
            html += `
                <div class='comparison-metric-card'>
                    <h4 style='font-weight: 800; font-size: 1.3rem; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 12px;'>
                        ${symbol}
                    </h4>
                    <div style='margin-bottom: 10px;'>
                        <span style='color: var(--text-secondary); font-size: 0.85rem;'>Current Price</span>
                        <div style='font-size: 1.8rem; font-weight: 700; color: var(--text-primary);'>
                            $${data.currentPrice.toFixed(2)}
                        </div>
                    </div>
                    <div style='margin-bottom: 10px;'>
                        <span style='color: var(--text-secondary); font-size: 0.85rem;'>30-Day Prediction</span>
                        <div style='font-size: 1.5rem; font-weight: 700; color: var(--text-primary);'>
                            $${data.prediction.value.toFixed(2)}
                        </div>
                    </div>
                    <div style='padding: 8px 16px; border-radius: 20px; background: ${changeClass === 'positive' ? 'linear-gradient(135deg, #43e97b, #38f9d7)' : 'linear-gradient(135deg, #f5576c, #fd7e14)'}; color: white; font-weight: 700; text-align: center;'>
                        ${changeSign}${data.prediction.change.toFixed(2)}%
                    </div>
                </div>
            `;
        });
        
        metricsGrid.innerHTML = html;
    },
    
    /**
     * Utilitaire sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

/**
 * Fonction globale pour toggle la sélection
 */
function toggleStockSelection(symbol) {
    MultiStockComparison.toggleStock(symbol);
}

/**
 * Fonction globale pour lancer la comparaison
 */
function runMultiStockComparison() {
    MultiStockComparison.runComparison();
}

/**
 * Initialisation
 */
document.addEventListener('DOMContentLoaded', () => {
    MultiStockComparison.init();
});

console.log('✅ multi-stock-comparison.js loaded');