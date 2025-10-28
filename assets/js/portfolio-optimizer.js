/* ==============================================
   PORTFOLIO-OPTIMIZER.JS - Optimisation Markowitz
   ============================================== */

// Module PortfolioOptimizer (pattern IIFE)
const PortfolioOptimizer = (function() {
    'use strict';
    
    // ========== VARIABLES PRIVÉES ==========
    let assets = [
        { name: 'Stocks', expectedReturn: 10, volatility: 18, correlation: {} },
        { name: 'Bonds', expectedReturn: 4, volatility: 6, correlation: {} },
        { name: 'Real Estate', expectedReturn: 8, volatility: 12, correlation: {} }
    ];
    
    // ========== INITIALISATION ==========
    
    /**
     * Initialise le module
     */
    function init() {
        renderAssets();
    }
    
    // ========== GESTION DES ACTIFS ==========
    
    /**
     * Ajoute un nouvel actif
     */
    function addAsset() {
        const newAsset = {
            name: 'Asset ' + (assets.length + 1),
            expectedReturn: 6,
            volatility: 10,
            correlation: {}
        };
        assets.push(newAsset);
        renderAssets();
    }
    
    /**
     * Supprime un actif
     */
    function removeAsset(index) {
        if (assets.length <= 2) {
            alert('You must have at least 2 assets!');
            return;
        }
        assets.splice(index, 1);
        renderAssets();
    }
    
    /**
     * Affiche tous les actifs
     */
    function renderAssets() {
        const container = document.getElementById('assetsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        assets.forEach((asset, index) => {
            let correlationHTML = '';
            
            // Générer les champs de corrélation avec les autres actifs
            assets.forEach((otherAsset, otherIndex) => {
                if (index !== otherIndex) {
                    const corrValue = asset.correlation[otherIndex] || 0;
                    correlationHTML += `
                        <div class='asset-input-group'>
                            <label>Correlation with ${otherAsset.name}</label>
                            <input type='number' step='0.1' min='-1' max='1' value='${corrValue}' 
                                   onchange='PortfolioOptimizer.updateCorrelation(${index}, ${otherIndex}, this.value)'>
                        </div>
                    `;
                }
            });
            
            // Bouton de suppression (si plus de 2 actifs)
            const removeBtn = assets.length > 2 ? 
                `<button onclick='PortfolioOptimizer.removeAsset(${index})' class='btn-remove'>X</button>` : '';
            
            const card = `
                <div class='asset-card'>
                    <h4>
                        <input type='text' value='${asset.name}' 
                               onchange='PortfolioOptimizer.updateAssetName(${index}, this.value)' 
                               class='asset-name-input'>
                        ${removeBtn}
                    </h4>
                    <div class='asset-input-group'>
                        <label>Expected Annual Return (%)</label>
                        <input type='number' step='0.5' value='${asset.expectedReturn}' 
                               onchange='PortfolioOptimizer.updateAsset(${index}, "expectedReturn", this.value)'>
                    </div>
                    <div class='asset-input-group'>
                        <label>Annual Volatility (%)</label>
                        <input type='number' step='0.5' value='${asset.volatility}' 
                               onchange='PortfolioOptimizer.updateAsset(${index}, "volatility", this.value)'>
                    </div>
                    ${correlationHTML}
                </div>
            `;
            
            container.innerHTML += card;
        });
    }
    
    /**
     * Met à jour le nom d'un actif
     */
    function updateAssetName(index, value) {
        assets[index].name = value;
        renderAssets();
    }
    
    /**
     * Met à jour un champ d'un actif
     */
    function updateAsset(index, field, value) {
        assets[index][field] = parseFloat(value);
    }
    
    /**
     * Met à jour une corrélation (symétrique)
     */
    function updateCorrelation(i, j, value) {
        const val = parseFloat(value);
        assets[i].correlation[j] = val;
        assets[j].correlation[i] = val;
    }
    
    /**
     * Réinitialise aux actifs par défaut
     */
    function resetAssets() {
        if (confirm('Reset all assets to default values?')) {
            assets = [
                { name: 'Stocks', expectedReturn: 10, volatility: 18, correlation: {} },
                { name: 'Bonds', expectedReturn: 4, volatility: 6, correlation: {} },
                { name: 'Real Estate', expectedReturn: 8, volatility: 12, correlation: {} }
            ];
            renderAssets();
            document.getElementById('resultsSection').classList.add('hidden');
        }
    }
    
    // ========== CALCULS FINANCIERS ==========
    
    /**
     * Construit la matrice de covariance
     */
    function buildCovarianceMatrix() {
        const n = assets.length;
        const cov = [];
        
        for (let i = 0; i < n; i++) {
            cov[i] = [];
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    // Variance sur la diagonale
                    cov[i][j] = Math.pow(assets[i].volatility / 100, 2);
                } else {
                    // Covariance hors diagonale
                    const corr = assets[i].correlation[j] || 0;
                    cov[i][j] = corr * (assets[i].volatility / 100) * (assets[j].volatility / 100);
                }
            }
        }
        return cov;
    }
    
    /**
     * Calcule les métriques d'un portefeuille
     */
    function calculatePortfolioMetrics(weights, covMatrix, returns, riskFreeRate) {
        // Rendement du portefeuille
        let portfolioReturn = 0;
        for (let i = 0; i < weights.length; i++) {
            portfolioReturn += weights[i] * returns[i];
        }
        
        // Variance du portefeuille
        let portfolioVariance = 0;
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights.length; j++) {
                portfolioVariance += weights[i] * weights[j] * covMatrix[i][j];
            }
        }
        
        // Volatilité (écart-type) en %
        const portfolioVol = Math.sqrt(portfolioVariance) * 100;
        
        // Ratio de Sharpe
        const sharpe = (portfolioReturn - riskFreeRate) / portfolioVol;
        
        return {
            return: portfolioReturn,
            volatility: portfolioVol,
            sharpe: sharpe
        };
    }
    
    // ========== OPTIMISATION ==========
    
    /**
     * Lance l'optimisation du portefeuille
     */
    function optimizePortfolio() {
        const riskFreeRate = parseFloat(document.getElementById('riskFreeRate').value) || 3.5;
        const inflationRate = parseFloat(document.getElementById('inflationRatePO').value) || 2.5;
        const showInflation = document.getElementById('showInflationPO').checked;
        
        // Construire la matrice de covariance
        const covMatrix = buildCovarianceMatrix();
        const returns = assets.map(a => a.expectedReturn);
        
        // Ajuster pour l'inflation si nécessaire
        const returnsAdjusted = showInflation ? returns.map(r => r - inflationRate) : returns;
        const riskFreeAdjusted = showInflation ? riskFreeRate - inflationRate : riskFreeRate;
        
        const n = assets.length;
        
        // Générer la frontière efficiente par simulation Monte Carlo
        const efficientFrontier = [];
        let maxSharpe = { sharpe: -Infinity };
        let minVar = { volatility: Infinity };
        
        // Générer 5000 portefeuilles aléatoires
        for (let iter = 0; iter < 5000; iter++) {
            // Générer des poids aléatoires qui somment à 1
            let weights = [];
            let sum = 0;
            for (let i = 0; i < n; i++) {
                weights[i] = Math.random();
                sum += weights[i];
            }
            weights = weights.map(w => w / sum);
            
            // Calculer les métriques
            const metrics = calculatePortfolioMetrics(weights, covMatrix, returnsAdjusted, riskFreeAdjusted);
            efficientFrontier.push({ ...metrics, weights: weights });
            
            // Mettre à jour le max Sharpe
            if (metrics.sharpe > maxSharpe.sharpe) {
                maxSharpe = { ...metrics, weights: weights };
            }
            
            // Mettre à jour le min variance
            if (metrics.volatility < minVar.volatility) {
                minVar = { ...metrics, weights: weights };
            }
        }
        
        // Afficher les résultats
        displayResults(maxSharpe, minVar, efficientFrontier, riskFreeAdjusted, showInflation, inflationRate);
    }
    
    // ========== AFFICHAGE DES RÉSULTATS ==========
    
    /**
     * Affiche les résultats de l'optimisation
     */
    function displayResults(maxSharpe, minVar, frontier, riskFreeRate, showInflation, inflationRate) {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        const returnLabel = showInflation ? ' (Real)' : ' (Nominal)';
        
        // Statistiques globales
        const statsHTML = `
            <div class='stats-row'>
                <div class='stat-item'>
                    <div class='label'>Max Sharpe Ratio</div>
                    <div class='value'>${maxSharpe.sharpe.toFixed(2)}</div>
                </div>
                <div class='stat-item'>
                    <div class='label'>Expected Return${returnLabel}</div>
                    <div class='value'>${maxSharpe.return.toFixed(2)}%</div>
                </div>
                <div class='stat-item'>
                    <div class='label'>Volatility</div>
                    <div class='value'>${maxSharpe.volatility.toFixed(2)}%</div>
                </div>
            </div>
            <div class='stats-row' style='margin-top: 10px;'>
                <div class='stat-item'>
                    <div class='label'>Min Variance Return${returnLabel}</div>
                    <div class='value'>${minVar.return.toFixed(2)}%</div>
                </div>
                <div class='stat-item'>
                    <div class='label'>Min Variance Vol</div>
                    <div class='value'>${minVar.volatility.toFixed(2)}%</div>
                </div>
                <div class='stat-item'>
                    <div class='label'>Risk-Free Rate${returnLabel}</div>
                    <div class='value'>${riskFreeRate.toFixed(2)}%</div>
                </div>
            </div>
        `;
        
        const globalStats = document.getElementById('globalStats');
        if (globalStats) globalStats.innerHTML = statsHTML;
        
        // Créer les graphiques
        createFrontierChart(frontier, maxSharpe, minVar, riskFreeRate, showInflation, inflationRate);
        createAllocationChart('chartAllocation1', maxSharpe.weights);
        createAllocationChart('chartAllocation2', minVar.weights);
        createAllocationTable(maxSharpe.weights, minVar.weights);
        
        window.FinanceDashboard.showNotification('Portfolio optimized successfully!', 'success');
    }
    
    // ========== GRAPHIQUES ==========
    
    /**
     * Graphique de la frontière efficiente
     */
    function createFrontierChart(frontier, maxSharpe, minVar, riskFreeRate, showInflation, inflationRate) {
        const data = frontier.map(p => ({
            x: p.volatility,
            y: p.return,
            sharpe: p.sharpe
        }));
        
        const titleText = showInflation ? 
            'Efficient Frontier (Real Returns - Inflation: ' + inflationRate.toFixed(1) + '%)' : 
            'Efficient Frontier (Nominal Returns)';
        
        Highcharts.chart('chartFrontier', {
            chart: {
                type: 'scatter',
                backgroundColor: 'transparent',
                zoomType: 'xy'
            },
            title: {
                text: titleText,
                style: { color: '#2649B2', fontSize: '1.1em' }
            },
            xAxis: {
                title: { text: 'Volatility (%)', style: { color: '#2649B2' } },
                crosshair: true
            },
            yAxis: {
                title: { text: 'Expected Return (%)', style: { color: '#2649B2' } },
                plotLines: [{
                    value: riskFreeRate,
                    color: '#9D5CE6',
                    width: 2,
                    dashStyle: 'Dash',
                    label: {
                        text: 'Risk-Free Rate',
                        style: { color: '#9D5CE6' }
                    }
                }],
                crosshair: true
            },
            tooltip: {
                pointFormat: 'Return: <b>{point.y:.2f}%</b><br/>Vol: <b>{point.x:.2f}%</b><br/>Sharpe: <b>{point.sharpe:.2f}</b>'
            },
            series: [
                {
                    name: 'Portfolios',
                    data: data,
                    color: 'rgba(142,125,227,0.4)',
                    marker: { radius: 3 }
                },
                {
                    name: 'Max Sharpe',
                    data: [{ x: maxSharpe.volatility, y: maxSharpe.return }],
                    color: '#2649B2',
                    marker: { radius: 10, symbol: 'diamond' }
                },
                {
                    name: 'Min Variance',
                    data: [{ x: minVar.volatility, y: minVar.return }],
                    color: '#4A74F3',
                    marker: { radius: 10, symbol: 'triangle' }
                }
            ],
            legend: {
                enabled: true,
                itemStyle: { color: '#5B2C6F' }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique d'allocation (camembert)
     */
    function createAllocationChart(containerId, weights) {
        const data = assets.map((asset, i) => ({
            name: asset.name,
            y: weights[i] * 100
        }));
        
        const colors = ['#2649B2', '#4A74F3', '#8E7DE3', '#9D5CE6', '#D4D9F0', '#6C8BE0', '#B55CE6'];
        
        Highcharts.chart(containerId, {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            tooltip: {
                pointFormat: '<b>{point.name}</b>: {point.y:.1f}%'
            },
            series: [{
                name: 'Allocation',
                data: data,
                colors: colors
            }],
            plotOptions: {
                pie: {
                    innerSize: '50%',
                    dataLabels: {
                        format: '<b>{point.name}</b>: {point.y:.1f}%',
                        style: { color: '#2649B2' }
                    },
                    borderWidth: 2,
                    borderColor: '#E8DAEF'
                }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Tableau détaillé des allocations
     */
    function createAllocationTable(maxSharpeWeights, minVarWeights) {
        let tableHTML = `
            <table class='allocation-table'>
                <thead>
                    <tr>
                        <th>Asset</th>
                        <th>Expected Return</th>
                        <th>Volatility</th>
                        <th>Max Sharpe Weight</th>
                        <th>Min Vol Weight</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        assets.forEach((asset, i) => {
            tableHTML += `
                <tr>
                    <td><b>${asset.name}</b></td>
                    <td>${asset.expectedReturn.toFixed(2)}%</td>
                    <td>${asset.volatility.toFixed(2)}%</td>
                    <td><span class='allocation-badge'>${(maxSharpeWeights[i] * 100).toFixed(2)}%</span></td>
                    <td><span class='allocation-badge-secondary'>${(minVarWeights[i] * 100).toFixed(2)}%</span></td>
                </tr>
            `;
        });
        
        tableHTML += `</tbody></table>`;
        
        const allocationTable = document.getElementById('allocationTable');
        if (allocationTable) allocationTable.innerHTML = tableHTML;
    }
    
    // ========== EXPORTS PUBLICS ==========
    return {
        init,
        addAsset,
        removeAsset,
        updateAssetName,
        updateAsset,
        updateCorrelation,
        resetAssets,
        optimizePortfolio
    };
})();

// Initialisation au chargement de la page
window.addEventListener('DOMContentLoaded', PortfolioOptimizer.init);