/* ==============================================
   RISK-PARITY.JS - Logique Risk Parity
   ============================================== */

const RiskParity = (function() {
    'use strict';
    
    // ========== VARIABLES PRIVÉES ==========
    let assets = [
        { name: 'Stocks', volatility: 18, correlation: {} },
        { name: 'Bonds', volatility: 6, correlation: {} },
        { name: 'Real Estate', volatility: 12, correlation: {} }
    ];
    
    // ========== INITIALISATION ==========
    function init() {
        renderAssets();
    }
    
    // ========== GESTION DES ACTIFS ==========
    function addAsset() {
        const newAsset = {
            name: 'Asset ' + (assets.length + 1),
            volatility: 10,
            correlation: {}
        };
        assets.push(newAsset);
        renderAssets();
    }
    
    function removeAsset(index) {
        if (assets.length <= 2) {
            alert('You must have at least 2 assets!');
            return;
        }
        assets.splice(index, 1);
        renderAssets();
    }
    
    function renderAssets() {
        const container = document.getElementById('assetsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        assets.forEach((asset, index) => {
            let correlationHTML = '';
            
            assets.forEach((otherAsset, otherIndex) => {
                if (index !== otherIndex) {
                    const corrValue = asset.correlation[otherIndex] || 0;
                    correlationHTML += `
                        <div class='asset-input-group'>
                            <label>Correlation with ${otherAsset.name}</label>
                            <input type='number' step='0.1' min='-1' max='1' value='${corrValue}' 
                                   onchange='RiskParity.updateCorrelation(${index}, ${otherIndex}, this.value)'>
                        </div>
                    `;
                }
            });
            
            const removeBtn = assets.length > 2 ? 
                `<button onclick='RiskParity.removeAsset(${index})' class='btn-remove'>X</button>` : '';
            
            const card = `
                <div class='asset-card'>
                    <h4>
                        <input type='text' value='${asset.name}' 
                               onchange='RiskParity.updateAssetName(${index}, this.value)' 
                               class='asset-name-input'>
                        ${removeBtn}
                    </h4>
                    <div class='asset-input-group'>
                        <label>Annual Volatility (%)</label>
                        <input type='number' step='0.5' value='${asset.volatility}' 
                               onchange='RiskParity.updateAsset(${index}, "volatility", this.value)'>
                    </div>
                    ${correlationHTML}
                </div>
            `;
            
            container.innerHTML += card;
        });
    }
    
    function updateAssetName(index, value) {
        assets[index].name = value;
        renderAssets();
    }
    
    function updateAsset(index, field, value) {
        assets[index][field] = parseFloat(value);
    }
    
    function updateCorrelation(i, j, value) {
        const val = parseFloat(value);
        assets[i].correlation[j] = val;
        assets[j].correlation[i] = val;
    }
    
    function resetAssets() {
        if (confirm('Reset all assets to default values?')) {
            assets = [
                { name: 'Stocks', volatility: 18, correlation: {} },
                { name: 'Bonds', volatility: 6, correlation: {} },
                { name: 'Real Estate', volatility: 12, correlation: {} }
            ];
            renderAssets();
            document.getElementById('resultsSection').classList.add('hidden');
        }
    }
    
    // ========== CALCULS ==========
    function buildCovarianceMatrix() {
        const n = assets.length;
        const cov = [];
        
        for (let i = 0; i < n; i++) {
            cov[i] = [];
            for (let j = 0; j < n; j++) {
                if (i === j) {
                    cov[i][j] = Math.pow(assets[i].volatility / 100, 2);
                } else {
                    const corr = assets[i].correlation[j] || 0;
                    cov[i][j] = corr * (assets[i].volatility / 100) * (assets[j].volatility / 100);
                }
            }
        }
        return cov;
    }
    
    function calculatePortfolioVolatility(weights, covMatrix) {
        let variance = 0;
        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights.length; j++) {
                variance += weights[i] * weights[j] * covMatrix[i][j];
            }
        }
        return Math.sqrt(variance) * 100;
    }
    
    function calculateRiskContributions(weights, covMatrix) {
        const n = weights.length;
        const portfolioVar = calculatePortfolioVolatility(weights, covMatrix) / 100;
        const contributions = [];
        
        for (let i = 0; i < n; i++) {
            let marginalContribution = 0;
            for (let j = 0; j < n; j++) {
                marginalContribution += weights[j] * covMatrix[i][j];
            }
            const riskContribution = weights[i] * marginalContribution / portfolioVar;
            contributions.push(riskContribution * 100);
        }
        return contributions;
    }
    
    function calculateRiskParity() {
        const covMatrix = buildCovarianceMatrix();
        const n = assets.length;
        
        // Simplified Risk Parity: Inverse volatility weighting
        const inverseVols = assets.map(a => 1 / a.volatility);
        const sumInverseVols = inverseVols.reduce((a, b) => a + b, 0);
        const rpWeights = inverseVols.map(iv => iv / sumInverseVols);
        
        // Equal weight for comparison
        const ewWeights = assets.map(() => 1 / n);
        
        // Calculate statistics
        const rpVol = calculatePortfolioVolatility(rpWeights, covMatrix);
        const ewVol = calculatePortfolioVolatility(ewWeights, covMatrix);
        
        const rpRiskContrib = calculateRiskContributions(rpWeights, covMatrix);
        const ewRiskContrib = calculateRiskContributions(ewWeights, covMatrix);
        
        displayResults(rpWeights, ewWeights, rpVol, ewVol, rpRiskContrib, ewRiskContrib);
    }
    
    // ========== AFFICHAGE ==========
    function displayResults(rpWeights, ewWeights, rpVol, ewVol, rpRiskContrib, ewRiskContrib) {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        const statsHTML = `
            <div class='stats-row'>
                <div class='stat-item'>
                    <div class='label'>Risk Parity Volatility</div>
                    <div class='value'>${rpVol.toFixed(2)}%</div>
                </div>
                <div class='stat-item'>
                    <div class='label'>Equal Weight Volatility</div>
                    <div class='value'>${ewVol.toFixed(2)}%</div>
                </div>
                <div class='stat-item'>
                    <div class='label'>Volatility Reduction</div>
                    <div class='value'>${((ewVol - rpVol) / ewVol * 100).toFixed(1)}%</div>
                </div>
            </div>
            <div class='stats-row' style='margin-top: 10px;'>
                <div class='stat-item'>
                    <div class='label'>Number of Assets</div>
                    <div class='value'>${assets.length}</div>
                </div>
                <div class='stat-item'>
                    <div class='label'>Risk Balance Quality</div>
                    <div class='value'>${calculateRiskBalance(rpRiskContrib).toFixed(1)}%</div>
                </div>
                <div class='stat-item'>
                    <div class='label'>Diversification Benefit</div>
                    <div class='value'>${calculateDiversificationBenefit(rpWeights).toFixed(1)}%</div>
                </div>
            </div>
        `;
        
        const globalStats = document.getElementById('globalStats');
        if (globalStats) globalStats.innerHTML = statsHTML;
        
        createRiskParityChart(rpWeights);
        createEqualWeightChart(ewWeights);
        createRiskContributionChart(rpRiskContrib, ewRiskContrib);
        createComparisonTable(rpWeights, ewWeights, rpRiskContrib, ewRiskContrib);
        
        window.FinanceDashboard.showNotification('Risk Parity calculated successfully!', 'success');
    }
    
    function calculateRiskBalance(riskContrib) {
        const target = 100 / riskContrib.length;
        const deviations = riskContrib.map(rc => Math.abs(rc - target));
        const avgDeviation = deviations.reduce((a, b) => a + b, 0) / riskContrib.length;
        return 100 - (avgDeviation / target * 100);
    }
    
    function calculateDiversificationBenefit(weights) {
        const maxWeight = Math.max(...weights);
        const equalWeight = 1 / weights.length;
        return (1 - maxWeight / equalWeight) * 100;
    }
    
    // ========== GRAPHIQUES ==========
    function createRiskParityChart(weights) {
        const data = assets.map((asset, i) => ({ name: asset.name, y: weights[i] * 100 }));
        const colors = ['#2649B2', '#4A74F3', '#8E7DE3', '#9D5CE6', '#D4D9F0', '#6C8BE0', '#B55CE6'];
        
        Highcharts.chart('chartRiskParity', {
            chart: { type: 'pie', backgroundColor: 'transparent' },
            title: { text: null },
            tooltip: { pointFormat: '<b>{point.name}</b>: {point.y:.1f}%' },
            series: [{ name: 'Allocation', data: data, colors: colors }],
            plotOptions: {
                pie: {
                    innerSize: '50%',
                    dataLabels: {
                        format: '<b>{point.name}</b>: {point.y:.1f}%',
                        style: { color: '#2649B2', fontSize: '11px' }
                    },
                    borderWidth: 2,
                    borderColor: '#E8DAEF'
                }
            },
            credits: { enabled: false }
        });
    }
    
    function createEqualWeightChart(weights) {
        const data = assets.map((asset, i) => ({ name: asset.name, y: weights[i] * 100 }));
        const colors = ['#6C3483', '#8E44AD', '#9D5CE6', '#C39BD3', '#E8DAEF', '#B55CE6', '#D4D9F0'];
        
        Highcharts.chart('chartEqualWeight', {
            chart: { type: 'pie', backgroundColor: 'transparent' },
            title: { text: null },
            tooltip: { pointFormat: '<b>{point.name}</b>: {point.y:.1f}%' },
            series: [{ name: 'Allocation', data: data, colors: colors }],
            plotOptions: {
                pie: {
                    innerSize: '50%',
                    dataLabels: {
                        format: '<b>{point.name}</b>: {point.y:.1f}%',
                        style: { color: '#6C3483', fontSize: '11px' }
                    },
                    borderWidth: 2,
                    borderColor: '#E8DAEF'
                }
            },
            credits: { enabled: false }
        });
    }
    
    function createRiskContributionChart(rpRiskContrib, ewRiskContrib) {
        const categories = assets.map(a => a.name);
        
        Highcharts.chart('chartRiskContribution', {
            chart: { type: 'column', backgroundColor: 'transparent' },
            title: { text: 'Risk Contribution Comparison', style: { color: '#2649B2', fontSize: '1.2em' } },
            xAxis: {
                categories: categories,
                title: { text: 'Assets', style: { color: '#2649B2' } },
                labels: { style: { color: '#5B2C6F' } }
            },
            yAxis: {
                title: { text: 'Risk Contribution (%)', style: { color: '#2649B2' } },
                labels: { style: { color: '#6C3483' } },
                plotLines: [{
                    value: 100 / assets.length,
                    color: '#9D5CE6',
                    width: 2,
                    dashStyle: 'Dash',
                    label: { text: 'Target (Equal Risk)', style: { color: '#9D5CE6' } }
                }]
            },
            tooltip: { valueSuffix: '%', valueDecimals: 1 },
            series: [
                { name: 'Risk Parity', data: rpRiskContrib, color: '#2649B2', borderRadius: '25%' },
                { name: 'Equal Weight', data: ewRiskContrib, color: '#9D5CE6', borderRadius: '25%' }
            ],
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}%',
                        style: { fontSize: '10px' }
                    }
                }
            },
            legend: { itemStyle: { color: '#5B2C6F' } },
            credits: { enabled: false }
        });
    }
    
    function createComparisonTable(rpWeights, ewWeights, rpRiskContrib, ewRiskContrib) {
        let tableHTML = `
            <table class='comparison-table'>
                <thead>
                    <tr>
                        <th>Asset</th>
                        <th>Volatility (%)</th>
                        <th>Risk Parity Weight (%)</th>
                        <th>Equal Weight (%)</th>
                        <th>RP Risk Contribution (%)</th>
                        <th>EW Risk Contribution (%)</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        assets.forEach((asset, i) => {
            tableHTML += `
                <tr>
                    <td><b>${asset.name}</b></td>
                    <td>${asset.volatility.toFixed(1)}%</td>
                    <td><span class='highlight'>${(rpWeights[i] * 100).toFixed(2)}%</span></td>
                    <td>${(ewWeights[i] * 100).toFixed(2)}%</td>
                    <td><span class='highlight'>${rpRiskContrib[i].toFixed(1)}%</span></td>
                    <td>${ewRiskContrib[i].toFixed(1)}%</td>
                </tr>
            `;
        });
        
        tableHTML += `</tbody></table>`;
        
        const comparisonTable = document.getElementById('comparisonTable');
        if (comparisonTable) comparisonTable.innerHTML = tableHTML;
    }
    
    // ========== EXPORTS ==========
    return {
        init,
        addAsset,
        removeAsset,
        updateAssetName,
        updateAsset,
        updateCorrelation,
        resetAssets,
        calculateRiskParity
    };
})();

window.addEventListener('DOMContentLoaded', RiskParity.init);