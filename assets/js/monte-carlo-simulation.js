/* ==============================================
   🎲 MONTE CARLO SIMULATION
   Simulation probabiliste de prix futurs
   ============================================== */

const MonteCarloSimulation = {
    currentSymbol: null,
    simulationResults: null,
    
    /**
     * Initialisation
     */
    init() {
        console.log('🎲 Initializing Monte Carlo Simulation...');
    },
    
    /**
     * Lance la simulation Monte Carlo
     */
    async run() {
        // Vérifier qu'un stock est chargé
        if (!window.TrendPrediction || !window.TrendPrediction.stockData) {
            alert('Please analyze a stock first before running Monte Carlo simulation');
            return;
        }
        
        this.currentSymbol = window.TrendPrediction.currentSymbol;
        
        // Récupérer les paramètres
        const numSimulations = parseInt(document.getElementById('mcSimulations').value);
        const timeHorizon = parseInt(document.getElementById('mcTimeHorizon').value);
        const confidenceLevel = parseInt(document.getElementById('mcConfidence').value);
        
        console.log(`🎲 Running Monte Carlo: ${numSimulations} simulations, ${timeHorizon} days, ${confidenceLevel}% confidence`);
        
        // Afficher le loader
        if (window.TrendPrediction) {
            window.TrendPrediction.showLoading(true, `Running ${numSimulations.toLocaleString()} Monte Carlo simulations...`);
        }
        
        try {
            // Calculer les statistiques historiques
            const prices = window.TrendPrediction.stockData.prices.map(p => p.close);
            const returns = this.calculateReturns(prices);
            const stats = this.calculateStatistics(returns);
            
            console.log('📊 Historical statistics:', stats);
            
            // Lancer les simulations
            const simulations = this.runSimulations(
                prices[prices.length - 1],
                stats.mean,
                stats.stdDev,
                timeHorizon,
                numSimulations
            );
            
            // Calculer les résultats
            this.simulationResults = this.analyzeSimulations(
                simulations,
                prices[prices.length - 1],
                confidenceLevel
            );
            
            console.log('✅ Monte Carlo results:', this.simulationResults);
            
            // Afficher les résultats
            this.displayResults();
            
        } catch (error) {
            console.error('❌ Monte Carlo simulation error:', error);
            if (window.TrendPrediction) {
                window.TrendPrediction.showNotification('Simulation failed', 'error');
            }
        } finally {
            if (window.TrendPrediction) {
                window.TrendPrediction.showLoading(false);
            }
        }
    },
    
    /**
     * Calcule les rendements quotidiens
     */
    calculateReturns(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const dailyReturn = (prices[i] - prices[i - 1]) / prices[i - 1];
            returns.push(dailyReturn);
        }
        return returns;
    },
    
    /**
     * Calcule les statistiques (moyenne, écart-type)
     */
    calculateStatistics(returns) {
        const n = returns.length;
        const mean = returns.reduce((sum, r) => sum + r, 0) / n;
        
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        
        return { mean, stdDev, variance };
    },
    
    /**
     * Lance les simulations Monte Carlo
     */
    runSimulations(startPrice, meanReturn, stdDev, days, numSims) {
        const simulations = [];
        
        for (let sim = 0; sim < numSims; sim++) {
            const path = [startPrice];
            let currentPrice = startPrice;
            
            for (let day = 0; day < days; day++) {
                // Générer un rendement aléatoire (distribution normale)
                const randomReturn = this.randomNormal(meanReturn, stdDev);
                
                // Calculer le nouveau prix
                currentPrice = currentPrice * (1 + randomReturn);
                path.push(currentPrice);
            }
            
            simulations.push(path);
        }
        
        return simulations;
    },
    
    /**
     * Génère un nombre aléatoire suivant une distribution normale
     * (Box-Muller transform)
     */
    randomNormal(mean, stdDev) {
        let u1 = 0, u2 = 0;
        
        // Éviter log(0)
        while (u1 === 0) u1 = Math.random();
        while (u2 === 0) u2 = Math.random();
        
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        
        return mean + stdDev * z0;
    },
    
    /**
     * Analyse les résultats des simulations
     */
    analyzeSimulations(simulations, startPrice, confidenceLevel) {
        const numSims = simulations.length;
        const finalPrices = simulations.map(sim => sim[sim.length - 1]);
        
        // Trier les prix finaux
        finalPrices.sort((a, b) => a - b);
        
        // Calculer les statistiques
        const mean = finalPrices.reduce((sum, p) => sum + p, 0) / numSims;
        const median = finalPrices[Math.floor(numSims / 2)];
        
        // Calculer les percentiles
        const lowerPercentile = (100 - confidenceLevel) / 2;
        const upperPercentile = 100 - lowerPercentile;
        
        const lowerIndex = Math.floor((lowerPercentile / 100) * numSims);
        const upperIndex = Math.floor((upperPercentile / 100) * numSims);
        
        const lowerBound = finalPrices[lowerIndex];
        const upperBound = finalPrices[upperIndex];
        
        const percentile5 = finalPrices[Math.floor(0.05 * numSims)];
        const percentile25 = finalPrices[Math.floor(0.25 * numSims)];
        const percentile75 = finalPrices[Math.floor(0.75 * numSims)];
        const percentile95 = finalPrices[Math.floor(0.95 * numSims)];
        
        // Calculer les probabilités
        const profitSims = finalPrices.filter(p => p > startPrice).length;
        const probabilityOfProfit = (profitSims / numSims) * 100;
        
        // Calculer la variance
        const variance = finalPrices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / numSims;
        const stdDev = Math.sqrt(variance);
        
        // Calculer le max et min
        const max = Math.max(...finalPrices);
        const min = Math.min(...finalPrices);
        
        return {
            startPrice,
            mean,
            median,
            stdDev,
            variance,
            lowerBound,
            upperBound,
            percentile5,
            percentile25,
            percentile75,
            percentile95,
            max,
            min,
            probabilityOfProfit,
            confidenceLevel,
            numSimulations: numSims,
            allPrices: finalPrices,
            simulations: simulations.slice(0, 100) // Garder 100 chemins pour le graphique
        };
    },
    
    /**
     * Affiche les résultats
     */
    displayResults() {
        const resultsContainer = document.getElementById('monteCarloResults');
        const chartContainer = document.getElementById('monteCarloChartContainer');
        
        if (!resultsContainer || !chartContainer) return;
        
        resultsContainer.classList.remove('hidden');
        chartContainer.classList.remove('hidden');
        
        // Créer les cartes de stats
        this.createStatsCards();
        
        // Créer le graphique de distribution
        this.createDistributionChart();
        
        // Créer le graphique des chemins
        this.createPathsChart();
    },
    
    /**
     * Crée les cartes de statistiques
     */
    createStatsCards() {
        const resultsContainer = document.getElementById('monteCarloResults');
        if (!resultsContainer) return;
        
        const r = this.simulationResults;
        const currentPrice = r.startPrice;
        
        const html = `
            <div class='simulation-stat'>
                <div class='simulation-stat-label'>Expected Price</div>
                <div class='simulation-stat-value'>$${r.mean.toFixed(2)}</div>
                <small style='color: var(--text-secondary);'>Mean outcome</small>
            </div>
            
            <div class='simulation-stat'>
                <div class='simulation-stat-label'>Median Price</div>
                <div class='simulation-stat-value'>$${r.median.toFixed(2)}</div>
                <small style='color: var(--text-secondary);'>50th percentile</small>
            </div>
            
            <div class='simulation-stat'>
                <div class='simulation-stat-label'>Best Case</div>
                <div class='simulation-stat-value' style='background: linear-gradient(135deg, #43e97b, #38f9d7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>
                    $${r.percentile95.toFixed(2)}
                </div>
                <small style='color: var(--text-secondary);'>95th percentile</small>
            </div>
            
            <div class='simulation-stat'>
                <div class='simulation-stat-label'>Worst Case</div>
                <div class='simulation-stat-value' style='background: linear-gradient(135deg, #f5576c, #fd7e14); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>
                    $${r.percentile5.toFixed(2)}
                </div>
                <small style='color: var(--text-secondary);'>5th percentile</small>
            </div>
            
            <div class='simulation-stat'>
                <div class='simulation-stat-label'>Volatility (σ)</div>
                <div class='simulation-stat-value'>$${r.stdDev.toFixed(2)}</div>
                <small style='color: var(--text-secondary);'>Standard deviation</small>
            </div>
            
            <div class='simulation-stat'>
                <div class='simulation-stat-label'>Probability of Profit</div>
                <div class='simulation-stat-value'>${r.probabilityOfProfit.toFixed(1)}%</div>
                <small style='color: var(--text-secondary);'>Price > Current</small>
            </div>
            
            <div class='simulation-stat'>
                <div class='simulation-stat-label'>${r.confidenceLevel}% Range</div>
                <div class='simulation-stat-value' style='font-size: 1.2rem;'>
                    $${r.lowerBound.toFixed(2)} - $${r.upperBound.toFixed(2)}
                </div>
                <small style='color: var(--text-secondary);'>Confidence interval</small>
            </div>
            
            <div class='simulation-stat'>
                <div class='simulation-stat-label'>Expected Return</div>
                <div class='simulation-stat-value' style='color: ${r.mean > currentPrice ? '#43e97b' : '#f5576c'};'>
                    ${((r.mean - currentPrice) / currentPrice * 100).toFixed(2)}%
                </div>
                <small style='color: var(--text-secondary);'>From current price</small>
            </div>
        `;
        
        resultsContainer.innerHTML = html;
    },
    
    /**
     * Crée le graphique de distribution
     */
    createDistributionChart() {
        const r = this.simulationResults;
        
        // Créer un histogramme
        const numBins = 50;
        const binWidth = (r.max - r.min) / numBins;
        const bins = Array(numBins).fill(0);
        
        r.allPrices.forEach(price => {
            const binIndex = Math.min(Math.floor((price - r.min) / binWidth), numBins - 1);
            bins[binIndex]++;
        });
        
        const categories = bins.map((_, i) => (r.min + i * binWidth).toFixed(2));
        
        Highcharts.chart('monteCarloChart', {
            chart: {
                type: 'column',
                height: 400,
                borderRadius: 15
            },
            title: {
                text: `Price Distribution - ${this.currentSymbol}`,
                style: {
                    color: '#43e97b',
                    fontWeight: 'bold'
                }
            },
            subtitle: {
                text: `${r.numSimulations.toLocaleString()} Monte Carlo Simulations`,
                style: { color: '#64748b' }
            },
            xAxis: {
                categories: categories,
                title: { text: 'Price (USD)' },
                labels: {
                    rotation: -45,
                    formatter: function() {
                        return this.value % 5 === 0 ? '$' + this.value : '';
                    }
                }
            },
            yAxis: {
                title: { text: 'Frequency' }
            },
            plotOptions: {
                column: {
                    borderRadius: '25%',
                    color: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, '#43e97b'],
                            [1, '#38f9d7']
                        ]
                    }
                }
            },
            series: [{
                name: 'Frequency',
                data: bins,
                showInLegend: false
            }],
            tooltip: {
                formatter: function() {
                    return `<b>Price Range:</b> $${this.x} - $${(parseFloat(this.x) + binWidth).toFixed(2)}<br>` +
                           `<b>Occurrences:</b> ${this.y} (${(this.y / r.numSimulations * 100).toFixed(2)}%)`;
                }
            },
            credits: { enabled: false }
        });
    },
    
    /**
     * Crée le graphique des chemins de simulation
     */
    createPathsChart() {
        // Créer un deuxième graphique pour montrer quelques chemins
        const chartDiv = document.createElement('div');
        chartDiv.id = 'monteCarloPathsChart';
        chartDiv.style.minHeight = '400px';
        chartDiv.style.marginTop = '30px';
        
        const chartContainer = document.getElementById('monteCarloChartContainer');
        chartContainer.appendChild(chartDiv);
        
        const r = this.simulationResults;
        
        // Prendre 50 chemins aléatoires
        const pathsToShow = r.simulations.slice(0, 50);
        
        const series = pathsToShow.map((path, index) => ({
            name: `Path ${index + 1}`,
            data: path,
            lineWidth: 1,
            opacity: 0.3,
            enableMouseTracking: false,
            showInLegend: false,
            color: '#667eea'
        }));
        
        // Ajouter la moyenne
        const avgPath = [];
        const pathLength = r.simulations[0].length;
        
        for (let day = 0; day < pathLength; day++) {
            const dayPrices = r.simulations.map(sim => sim[day]);
            const avg = dayPrices.reduce((sum, p) => sum + p, 0) / dayPrices.length;
            avgPath.push(avg);
        }
        
        series.push({
            name: 'Average Path',
            data: avgPath,
            lineWidth: 3,
            color: '#43e97b',
            zIndex: 10
        });
        
        Highcharts.chart('monteCarloPathsChart', {
            chart: {
                height: 400,
                borderRadius: 15
            },
            title: {
                text: 'Sample Simulation Paths',
                style: {
                    color: '#667eea',
                    fontWeight: 'bold'
                }
            },
            subtitle: {
                text: 'Showing 50 random paths + average',
                style: { color: '#64748b' }
            },
            xAxis: {
                title: { text: 'Days' }
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
                valuePrefix: '$',
                valueDecimals: 2
            },
            series: series,
            credits: { enabled: false }
        });
    }
};

/**
 * Fonction globale pour lancer la simulation
 */
function runMonteCarloSimulation() {
    MonteCarloSimulation.run();
}

/**
 * Initialisation
 */
document.addEventListener('DOMContentLoaded', () => {
    MonteCarloSimulation.init();
});

console.log('✅ monte-carlo-simulation.js loaded');