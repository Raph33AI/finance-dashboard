/* ==============================================
   MONTE-CARLO.JS - VERSION OPTIMISÉE & CORRIGÉE
   ✅ Performances optimisées
   ✅ Firebase integration pour scénarios
   ✅ Tous les bugs corrigés
   ============================================== */

const MonteCarlo = (function() {
    'use strict';
    
    // ========== VARIABLES PRIVÉES ==========
    let simulationResults = null;
    let currentUser = null;
    
    // ========== TEMPLATES PRÉDÉFINIS ==========
    const TEMPLATES = {
        conservative: {
            monthlyInvestment: 500,
            monthlyYield: 0.4,
            volatility: 8,
            years: 25,
            simulations: 1000,
            targetValue: 150000,
            inflationRate: 2.5,
            distribution: 'normal',
            strategy: 'dca'
        },
        balanced: {
            monthlyInvestment: 300,
            monthlyYield: 0.58,
            volatility: 12,
            years: 25,
            simulations: 1000,
            targetValue: 100000,
            inflationRate: 2.5,
            distribution: 'normal',
            strategy: 'dca'
        },
        aggressive: {
            monthlyInvestment: 200,
            monthlyYield: 0.83,
            volatility: 18,
            years: 25,
            simulations: 1000,
            targetValue: 100000,
            inflationRate: 2.5,
            distribution: 'normal',
            strategy: 'dca'
        },
        retirement: {
            monthlyInvestment: 400,
            monthlyYield: 0.5,
            volatility: 10,
            years: 30,
            simulations: 1000,
            targetValue: 500000,
            inflationRate: 2.5,
            distribution: 'normal',
            strategy: 'dca'
        },
        crypto: {
            monthlyInvestment: 100,
            monthlyYield: 1.5,
            volatility: 60,
            years: 10,
            simulations: 1000,
            targetValue: 50000,
            inflationRate: 2.5,
            distribution: 'studentt',
            strategy: 'dca',
            degreesOfFreedom: 3
        }
    };
    
    // ========== FONCTIONS UTILITAIRES ==========
    
    function randomNormal(mean = 0, stdDev = 1) {
        let u1 = Math.random();
        let u2 = Math.random();
        let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z0 * stdDev + mean;
    }
    
    function randomStudentT(df, mean = 0, scale = 1) {
        const normalSample = randomNormal(0, 1);
        const chiSquared = Array.from({length: df}, () => Math.pow(randomNormal(0, 1), 2))
            .reduce((sum, val) => sum + val, 0);
        const tValue = normalSample / Math.sqrt(chiSquared / df);
        return mean + tValue * scale;
    }
    
    function percentile(arr, p) {
        if (!arr || arr.length === 0) return 0;
        const sorted = arr.slice().sort((a, b) => a - b);
        const index = (p / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
    
    function adjustForInflationMC(value, monthIndex, inflationRate) {
        const monthlyInflation = Math.pow(1 + inflationRate / 100, 1/12) - 1;
        return value / Math.pow(1 + monthlyInflation, monthIndex);
    }
    
    function calculateMaxDrawdown(path) {
        let maxDD = 0;
        let peak = path[0];
        
        for (let i = 1; i < path.length; i++) {
            if (path[i] > peak) {
                peak = path[i];
            }
            const drawdown = (peak - path[i]) / peak;
            if (drawdown > maxDD) {
                maxDD = drawdown;
            }
        }
        
        return maxDD;
    }
    
    function calculateAdvancedMetrics(returns, riskFreeRate = 0.02) {
        if (!returns || returns.length === 0) {
            return {
                sharpeRatio: 0,
                sortinoRatio: 0,
                skewness: 0,
                kurtosis: 0
            };
        }
        
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
        
        const downsideReturns = returns.filter(r => r < 0);
        const downsideDeviation = downsideReturns.length > 0 
            ? Math.sqrt(downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downsideReturns.length)
            : stdDev;
        
        const sharpeRatio = stdDev !== 0 ? (avgReturn - riskFreeRate / 12) / stdDev : 0;
        const sortinoRatio = downsideDeviation !== 0 ? (avgReturn - riskFreeRate / 12) / downsideDeviation : 0;
        
        const skewness = stdDev !== 0 
            ? (returns.reduce((sum, r) => sum + Math.pow((r - avgReturn) / stdDev, 3), 0) / returns.length)
            : 0;
        
        const kurtosis = stdDev !== 0
            ? (returns.reduce((sum, r) => sum + Math.pow((r - avgReturn) / stdDev, 4), 0) / returns.length)
            : 0;
        
        return { sharpeRatio, sortinoRatio, skewness, kurtosis };
    }
    
    // ========== FIREBASE FUNCTIONS ==========
    
    function initFirebase() {
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                loadScenariosFromFirebase();
            } else {
                currentUser = null;
                updateSavedScenariosList([]);
            }
        });
    }
    
    async function loadScenariosFromFirebase() {
        if (!currentUser) return;
        
        try {
            const snapshot = await firebase.firestore()
                .collection('users')
                .doc(currentUser.uid)
                .collection('monteCarloScenarios')
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();
            
            const scenarios = [];
            snapshot.forEach(doc => {
                scenarios.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            updateSavedScenariosList(scenarios);
        } catch (error) {
            console.error('Error loading scenarios:', error);
        }
    }
    
    async function saveScenarioToFirebase(scenarioData) {
        if (!currentUser) {
            window.FinanceDashboard.showNotification('Please login to save scenarios', 'warning');
            return;
        }
        
        try {
            await firebase.firestore()
                .collection('users')
                .doc(currentUser.uid)
                .collection('monteCarloScenarios')
                .add({
                    ...scenarioData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            
            loadScenariosFromFirebase();
            window.FinanceDashboard.showNotification('Scenario saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving scenario:', error);
            window.FinanceDashboard.showNotification('Failed to save scenario', 'error');
        }
    }
    
    async function deleteScenarioFromFirebase(scenarioId) {
        if (!currentUser) return;
        
        try {
            await firebase.firestore()
                .collection('users')
                .doc(currentUser.uid)
                .collection('monteCarloScenarios')
                .doc(scenarioId)
                .delete();
            
            loadScenariosFromFirebase();
            window.FinanceDashboard.showNotification('Scenario deleted', 'info');
        } catch (error) {
            console.error('Error deleting scenario:', error);
            window.FinanceDashboard.showNotification('Failed to delete scenario', 'error');
        }
    }
    
    async function clearAllScenarios() {
        if (!currentUser) return;
        
        if (!confirm('Are you sure you want to delete all saved scenarios?')) return;
        
        try {
            const snapshot = await firebase.firestore()
                .collection('users')
                .doc(currentUser.uid)
                .collection('monteCarloScenarios')
                .get();
            
            const batch = firebase.firestore().batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            loadScenariosFromFirebase();
            window.FinanceDashboard.showNotification('All scenarios deleted', 'info');
        } catch (error) {
            console.error('Error clearing scenarios:', error);
            window.FinanceDashboard.showNotification('Failed to clear scenarios', 'error');
        }
    }
    
    function updateSavedScenariosList(scenarios) {
        const container = document.getElementById('savedScenariosList');
        if (!container) return;
        
        if (!scenarios || scenarios.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No saved scenarios. Run a simulation and save it!</p>';
            return;
        }
        
        container.innerHTML = scenarios.map(scenario => `
            <div class="saved-scenario-card">
                <div class="scenario-info">
                    <h4>${scenario.name}</h4>
                    <p>${scenario.date || 'No date'}</p>
                </div>
                <div class="scenario-actions">
                    <button onclick="MonteCarlo.loadScenario('${scenario.id}')" title="Load">
                        <i class="fas fa-folder-open"></i>
                    </button>
                    <button onclick="MonteCarlo.deleteScenario('${scenario.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // ========== TEMPLATE LOADING ==========
    
    function loadTemplate(templateName) {
        const template = TEMPLATES[templateName];
        if (!template) return;
        
        document.getElementById('monthlyInvestment').value = template.monthlyInvestment;
        document.getElementById('monthlyYield').value = template.monthlyYield;
        document.getElementById('volatility').value = template.volatility;
        document.getElementById('years').value = template.years;
        document.getElementById('simulations').value = template.simulations;
        document.getElementById('targetValue').value = template.targetValue;
        document.getElementById('inflationRateMC').value = template.inflationRate;
        
        document.querySelectorAll('input[name="distribution"]').forEach(radio => {
            radio.checked = radio.value === template.distribution;
        });
        
        document.querySelectorAll('input[name="strategy"]').forEach(radio => {
            radio.checked = radio.value === template.strategy;
        });
        
        updateStrategyFields();
        updateDistributionFields();
        
        if (template.degreesOfFreedom) {
            document.getElementById('degreesOfFreedom').value = template.degreesOfFreedom;
        }
        
        window.FinanceDashboard.showNotification(`Template "${templateName}" loaded!`, 'success');
    }
    
    // ========== SCENARIO MANAGEMENT ==========
    
    function saveCurrentScenario() {
        if (!simulationResults) {
            window.FinanceDashboard.showNotification('Run a simulation first!', 'warning');
            return;
        }
        
        const name = prompt('Enter a name for this scenario:', `Scenario ${new Date().toLocaleDateString()}`);
        if (!name) return;
        
        const params = getSimulationParams();
        const median = percentile(simulationResults.finalValues, 50);
        
        const scenarioData = {
            name: name,
            date: new Date().toLocaleString(),
            params: params,
            medianResult: median
        };
        
        saveScenarioToFirebase(scenarioData);
    }
    
    function deleteScenario(scenarioId) {
        deleteScenarioFromFirebase(scenarioId);
    }
    
    function loadScenario(scenarioId) {
        // Future implementation: load and apply scenario parameters
        window.FinanceDashboard.showNotification('Load scenario feature coming soon!', 'info');
    }
    
    function compareScenarios() {
        window.FinanceDashboard.showNotification('Compare scenarios feature coming soon!', 'info');
    }
    
    function clearScenarios() {
        clearAllScenarios();
    }
    
    // ========== PARAMETER HANDLING ==========
    
    function getSimulationParams() {
        const strategy = document.querySelector('input[name="strategy"]:checked')?.value || 'dca';
        const distribution = document.querySelector('input[name="distribution"]:checked')?.value || 'normal';
        
        return {
            monthlyInvestment: parseFloat(document.getElementById('monthlyInvestment').value) || 0,
            lumpSumAmount: parseFloat(document.getElementById('lumpSumAmount')?.value) || 0,
            monthlyYield: parseFloat(document.getElementById('monthlyYield').value) / 100 || 0,
            volatility: parseFloat(document.getElementById('volatility').value) / 100 || 0,
            years: parseInt(document.getElementById('years').value) || 1,
            simulations: Math.min(parseInt(document.getElementById('simulations').value) || 1000, 5000),
            targetValue: parseFloat(document.getElementById('targetValue').value) || 0,
            inflationRate: parseFloat(document.getElementById('inflationRateMC').value) || 2.5,
            showInflation: document.getElementById('showInflationMC').checked,
            distribution: distribution,
            strategy: strategy,
            degreesOfFreedom: parseInt(document.getElementById('degreesOfFreedom')?.value) || 5
        };
    }
    
    function updateStrategyFields() {
        const strategy = document.querySelector('input[name="strategy"]:checked')?.value || 'dca';
        const lumpSumGroup = document.getElementById('lumpSumGroup');
        
        if (lumpSumGroup) {
            lumpSumGroup.style.display = (strategy === 'lumpsum') ? 'block' : 'none';
        }
    }
    
    function updateDistributionFields() {
        const distribution = document.querySelector('input[name="distribution"]:checked')?.value || 'normal';
        const dfGroup = document.getElementById('degreesOfFreedomGroup');
        
        if (dfGroup) {
            dfGroup.style.display = (distribution === 'studentt') ? 'block' : 'none';
        }
    }
    
    // ========== SIMULATION PRINCIPALE ==========
    
    function runSimulation() {
        const params = getSimulationParams();
        
        // Validation
        if (params.monthlyInvestment <= 0 && params.strategy === 'dca') {
            alert('Monthly investment must be greater than 0!');
            return;
        }
        
        if (params.simulations < 100) {
            alert('Number of simulations must be at least 100!');
            return;
        }
        
        // Afficher la progression
        const progressBar = document.getElementById('simulationProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressBar) {
            progressBar.style.display = 'block';
            if (progressFill) progressFill.style.width = '0%';
            if (progressText) progressText.textContent = 'Initializing...';
        }
        
        // Simuler de manière asynchrone
        setTimeout(() => {
            try {
                const totalMonths = params.years * 12;
                const monthlyVolatility = params.volatility / Math.sqrt(12);
                
                // Exécuter la simulation
                const results = executeDCASimulation(params, totalMonths, monthlyVolatility);
                
                if (progressText) progressText.textContent = 'Analyzing results...';
                if (progressFill) progressFill.style.width = '90%';
                
                setTimeout(() => {
                    displayResults(results, params);
                    if (progressBar) progressBar.style.display = 'none';
                    window.FinanceDashboard.showNotification('Simulation completed!', 'success');
                }, 200);
                
            } catch (error) {
                console.error('Simulation error:', error);
                if (progressBar) progressBar.style.display = 'none';
                window.FinanceDashboard.showNotification('Simulation failed: ' + error.message, 'error');
            }
        }, 100);
    }
    
    // ========== SIMULATION DCA ==========
    
    function executeDCASimulation(params, totalMonths, monthlyVolatility) {
        const allSimulations = [];
        const finalValues = [];
        const monthsToTarget = [];
        const maxDrawdowns = [];
        const allReturns = [];
        
        const updateInterval = Math.floor(params.simulations / 10);
        
        for (let sim = 0; sim < params.simulations; sim++) {
            let portfolio = params.strategy === 'lumpsum' ? params.lumpSumAmount : 0;
            const path = [portfolio];
            const returns = [];
            
            for (let month = 0; month < totalMonths; month++) {
                let randomReturn;
                
                if (params.distribution === 'studentt') {
                    randomReturn = randomStudentT(params.degreesOfFreedom, params.monthlyYield, monthlyVolatility);
                } else {
                    randomReturn = randomNormal(params.monthlyYield, monthlyVolatility);
                }
                
                returns.push(randomReturn);
                
                if (params.strategy === 'lumpsum') {
                    portfolio = portfolio * (1 + randomReturn);
                } else {
                    portfolio = portfolio * (1 + randomReturn) + params.monthlyInvestment;
                }
                
                path.push(portfolio);
                
                if (portfolio >= params.targetValue && monthsToTarget.length === sim) {
                    monthsToTarget.push(month + 1);
                }
            }
            
            if (monthsToTarget.length === sim) {
                monthsToTarget.push(totalMonths + 1);
            }
            
            allSimulations.push(path);
            finalValues.push(portfolio);
            allReturns.push(returns);
            
            const mdd = calculateMaxDrawdown(path);
            maxDrawdowns.push(mdd);
            
            // Mise à jour de la progression
            if (sim % updateInterval === 0) {
                const progress = Math.floor((sim / params.simulations) * 100);
                const progressFill = document.getElementById('progressFill');
                const progressText = document.getElementById('progressText');
                if (progressFill) progressFill.style.width = progress + '%';
                if (progressText) progressText.textContent = `Simulating... ${progress}%`;
            }
        }
        
        return {
            allSimulations,
            finalValues,
            monthsToTarget,
            maxDrawdowns,
            allReturns
        };
    }
    
    // ========== AFFICHAGE DES RÉSULTATS ==========
    
    function displayResults(results, params) {
        simulationResults = results;
        
        const resultsPanel = document.getElementById('resultsPanel');
        if (resultsPanel) {
            resultsPanel.classList.remove('hidden');
            setTimeout(() => {
                resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
        
        const { allSimulations, finalValues, monthsToTarget, maxDrawdowns, allReturns } = results;
        const totalMonths = params.years * 12;
        
        // Statistiques
        const median = percentile(finalValues, 50);
        const p10 = percentile(finalValues, 10);
        const p90 = percentile(finalValues, 90);
        const best = Math.max(...finalValues);
        const worst = Math.min(...finalValues);
        const avgFinal = finalValues.reduce((a, b) => a + b, 0) / finalValues.length;
        
        displayMainStats(median, avgFinal, p10, p90, best, worst, params);
        displayAdvancedRiskMetrics(finalValues, maxDrawdowns, allReturns, params, totalMonths);
        
        // Graphiques
        createChart1(allSimulations, totalMonths, params);
        createChart2(finalValues, params, totalMonths);
        createChart3(finalValues, params.targetValue);
        createDrawdownAnalysis(maxDrawdowns, allSimulations);
        createRiskAnalysis(finalValues, totalMonths, params.monthlyInvestment, params.strategy, params.lumpSumAmount);
        createChart4(allSimulations, totalMonths);
        createChart5(monthsToTarget, params.targetValue);
        createRollingSharpe(allReturns);
    }
    
    function displayMainStats(median, avgFinal, p10, p90, best, worst, params) {
        const statsContainer = document.getElementById('statsContainer');
        if (!statsContainer) return;
        
        const medianReal = params.showInflation ? 
            adjustForInflationMC(median, params.years * 12, params.inflationRate) : median;
        const avgFinalReal = params.showInflation ? 
            adjustForInflationMC(avgFinal, params.years * 12, params.inflationRate) : avgFinal;
        
        statsContainer.innerHTML = `
            <div class="stat-box">
                <div class="label">Median (50th Percentile)</div>
                <div class="value">${window.FinanceDashboard.formatNumber(median, 0)} EUR</div>
                ${params.showInflation ? `<div style="font-size: 0.9em; color: #9D5CE6; margin-top: 5px;">Real: ${window.FinanceDashboard.formatNumber(medianReal, 0)} EUR</div>` : ''}
            </div>
            <div class="stat-box">
                <div class="label">Average Final Value</div>
                <div class="value">${window.FinanceDashboard.formatNumber(avgFinal, 0)} EUR</div>
                ${params.showInflation ? `<div style="font-size: 0.9em; color: #9D5CE6; margin-top: 5px;">Real: ${window.FinanceDashboard.formatNumber(avgFinalReal, 0)} EUR</div>` : ''}
            </div>
            <div class="stat-box">
                <div class="label">10th Percentile</div>
                <div class="value">${window.FinanceDashboard.formatNumber(p10, 0)} EUR</div>
            </div>
            <div class="stat-box">
                <div class="label">90th Percentile</div>
                <div class="value">${window.FinanceDashboard.formatNumber(p90, 0)} EUR</div>
            </div>
            <div class="stat-box">
                <div class="label">Best Case</div>
                <div class="value">${window.FinanceDashboard.formatNumber(best, 0)} EUR</div>
            </div>
            <div class="stat-box">
                <div class="label">Worst Case</div>
                <div class="value">${window.FinanceDashboard.formatNumber(worst, 0)} EUR</div>
            </div>
        `;
    }
    
    function displayAdvancedRiskMetrics(finalValues, maxDrawdowns, allReturns, params, totalMonths) {
        const container = document.getElementById('advancedRiskMetrics');
        if (!container) return;
        
        const var5 = percentile(finalValues, 5);
        const belowVar = finalValues.filter(v => v <= var5);
        const cvar = belowVar.length > 0 ? belowVar.reduce((a,b) => a+b, 0) / belowVar.length : var5;
        
        const medianMDD = percentile(maxDrawdowns, 50);
        const worstMDD = Math.max(...maxDrawdowns);
        
        const flatReturns = allReturns.flat();
        const metrics = calculateAdvancedMetrics(flatReturns);
        
        const totalInvested = params.strategy === 'lumpsum' ? 
            params.lumpSumAmount : 
            params.monthlyInvestment * totalMonths;
        const annualReturn = totalInvested > 0 ? 
            ((percentile(finalValues, 50) / totalInvested) - 1) / params.years : 0;
        const calmarRatio = worstMDD > 0 ? (annualReturn / worstMDD).toFixed(2) : 'N/A';
        
        container.innerHTML = `
            <div class="stat-box">
                <div class="label">CVaR (5%)</div>
                <div class="value">${window.FinanceDashboard.formatNumber(cvar, 0)} EUR</div>
            </div>
            <div class="stat-box">
                <div class="label">Median Max Drawdown</div>
                <div class="value" style="color: #f5576c;">${(medianMDD * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-box">
                <div class="label">Sharpe Ratio</div>
                <div class="value">${metrics.sharpeRatio.toFixed(2)}</div>
            </div>
            <div class="stat-box">
                <div class="label">Sortino Ratio</div>
                <div class="value">${metrics.sortinoRatio.toFixed(2)}</div>
            </div>
            <div class="stat-box">
                <div class="label">Calmar Ratio</div>
                <div class="value">${calmarRatio}</div>
            </div>
            <div class="stat-box">
                <div class="label">Skewness</div>
                <div class="value" style="color: ${metrics.skewness < 0 ? '#f5576c' : '#43e97b'}">${metrics.skewness.toFixed(2)}</div>
            </div>
        `;
    }
    
    // ========== GRAPHIQUES ==========
    
    function createChart1(allSimulations, totalMonths, params) {
        if (!allSimulations || allSimulations.length === 0) {
            console.error('No simulation data for chart1');
            return;
        }
        
        const months = Array.from({length: totalMonths + 1}, (_, i) => i);
        
        const medianPath = months.map(m => {
            const values = allSimulations.map(sim => sim[m] || 0);
            return percentile(values, 50);
        });
        
        const p10Path = months.map(m => {
            const values = allSimulations.map(sim => sim[m] || 0);
            return percentile(values, 10);
        });
        
        const p90Path = months.map(m => {
            const values = allSimulations.map(sim => sim[m] || 0);
            return percentile(values, 90);
        });
        
        // Seulement 10 simulations en arrière-plan pour optimiser
        const samplePaths = [];
        const sampleCount = Math.min(10, allSimulations.length);
        const step = Math.floor(allSimulations.length / sampleCount);
        
        for (let i = 0; i < allSimulations.length && samplePaths.length < sampleCount; i += step) {
            samplePaths.push({
                name: 'Simulation',
                data: allSimulations[i],
                color: 'rgba(102, 126, 234, 0.1)',
                lineWidth: 1,
                enableMouseTracking: false,
                showInLegend: false
            });
        }
        
        const series = [
            ...samplePaths,
            { name: 'P90', data: p90Path, color: '#43e97b', lineWidth: 2, dashStyle: 'Dash' },
            { name: 'Median', data: medianPath, color: '#667eea', lineWidth: 3 },
            { name: 'P10', data: p10Path, color: '#f5576c', lineWidth: 2, dashStyle: 'Dash' }
        ];
        
        Highcharts.chart('chart1', {
            chart: { type: 'line', backgroundColor: 'transparent', zoomType: 'x' },
            title: { text: '📊 Portfolio Evolution', style: { color: '#667eea', fontWeight: 'bold' } },
            xAxis: { title: { text: 'Months' }, crosshair: true },
            yAxis: { title: { text: 'Portfolio Value (EUR)' } },
            tooltip: { shared: true, valueDecimals: 0, valueSuffix: ' EUR' },
            series: series,
            plotOptions: { line: { marker: { enabled: false } } },
            credits: { enabled: false }
        });
    }
    
    function createChart2(finalValues, params, totalMonths) {
        if (!finalValues || finalValues.length === 0) return;
        
        const dataToDisplay = params.showInflation ? 
            finalValues.map(v => adjustForInflationMC(v, totalMonths, params.inflationRate)) : 
            finalValues;
        
        const min = Math.min(...dataToDisplay);
        const max = Math.max(...dataToDisplay);
        const binWidth = (max - min) / 30;
        const bins = Array.from({length: 30}, (_, i) => ({ 
            x: min + i * binWidth + binWidth/2,
            y: 0
        }));
        
        dataToDisplay.forEach(val => {
            const binIndex = Math.min(Math.floor((val - min) / binWidth), 29);
            if (bins[binIndex]) bins[binIndex].y++;
        });
        
        Highcharts.chart('chart2', {
            chart: { type: 'column', backgroundColor: 'transparent' },
            title: { text: '📈 Distribution of Returns', style: { color: '#667eea', fontWeight: 'bold' } },
            xAxis: { 
                title: { text: 'Final Value (EUR)' },
                labels: { formatter: function() { return window.FinanceDashboard.formatNumber(this.value, 0); } }
            },
            yAxis: { title: { text: 'Frequency' } },
            tooltip: { pointFormat: 'Value: <b>{point.x:,.0f} EUR</b><br/>Count: <b>{point.y}</b>' },
            series: [{ name: 'Distribution', data: bins, color: '#667eea', borderRadius: 5 }],
            legend: { enabled: false },
            plotOptions: { column: { pointPadding: 0, groupPadding: 0, borderWidth: 0 } },
            credits: { enabled: false }
        });
    }
    
    function createChart3(finalValues, targetValue) {
        if (!finalValues || finalValues.length === 0) return;
        
        const aboveTarget = finalValues.filter(v => v >= targetValue).length;
        const successRate = (aboveTarget / finalValues.length * 100).toFixed(1);
        
        Highcharts.chart('chart3', {
            chart: { type: 'pie', backgroundColor: 'transparent' },
            title: { text: `🎯 Success Rate: ${successRate}%`, style: { color: '#667eea', fontWeight: 'bold' } },
            tooltip: { pointFormat: '<b>{point.name}</b>: {point.percentage:.1f}%' },
            plotOptions: { 
                pie: { 
                    innerSize: '65%',
                    dataLabels: { 
                        format: '<b>{point.name}</b><br/>{point.percentage:.1f}%',
                        style: { fontWeight: 'bold' }
                    }
                }
            },
            series: [{
                name: 'Probability',
                data: [
                    { name: 'Above Target ✓', y: aboveTarget, color: '#43e97b', sliced: true },
                    { name: 'Below Target', y: finalValues.length - aboveTarget, color: '#f5576c' }
                ]
            }],
            credits: { enabled: false }
        });
    }
    
    function createDrawdownAnalysis(maxDrawdowns, allSimulations) {
        if (!maxDrawdowns || maxDrawdowns.length === 0) return;
        
        const container = document.getElementById('drawdownStats');
        if (!container) return;
        
        const medianMDD = percentile(maxDrawdowns, 50);
        const p10MDD = percentile(maxDrawdowns, 10);
        const p90MDD = percentile(maxDrawdowns, 90);
        const worstMDD = Math.max(...maxDrawdowns);
        const avgMDD = maxDrawdowns.reduce((a,b) => a+b, 0) / maxDrawdowns.length;
        
        container.innerHTML = `
            <div class="stat-box">
                <div class="label">Median Max Drawdown</div>
                <div class="value" style="color: #f5576c;">${(medianMDD * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-box">
                <div class="label">Average Drawdown</div>
                <div class="value" style="color: #f5576c;">${(avgMDD * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-box">
                <div class="label">Best Case (P10)</div>
                <div class="value" style="color: #43e97b;">${(p10MDD * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-box">
                <div class="label">Worst Case (P90)</div>
                <div class="value" style="color: #f5576c;">${(p90MDD * 100).toFixed(1)}%</div>
            </div>
        `;
        
        // Histogramme
        const min = Math.min(...maxDrawdowns);
        const max = Math.max(...maxDrawdowns);
        const binWidth = (max - min) / 25;
        const bins = [];
        
        for (let i = 0; i < 25; i++) {
            bins.push({ x: ((min + i * binWidth) * 100), y: 0 });
        }
        
        maxDrawdowns.forEach(dd => {
            const binIndex = Math.min(Math.floor((dd - min) / binWidth), 24);
            if (bins[binIndex]) bins[binIndex].y++;
        });
        
        Highcharts.chart('chartDrawdown', {
            chart: { type: 'column', backgroundColor: 'transparent' },
            title: { text: '📉 Drawdown Distribution', style: { color: '#f5576c', fontWeight: 'bold' } },
            xAxis: { 
                title: { text: 'Maximum Drawdown (%)' },
                labels: { formatter: function() { return this.value.toFixed(1) + '%'; } }
            },
            yAxis: { title: { text: 'Frequency' } },
            series: [{ name: 'Distribution', data: bins, color: '#f5576c', borderRadius: 5 }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    function createRiskAnalysis(finalValues, totalMonths, monthlyInvestment, strategy, lumpSumAmount) {
        if (!finalValues || finalValues.length === 0) return;
        
        const totalInvested = strategy === 'lumpsum' ? lumpSumAmount : monthlyInvestment * totalMonths;
        const losses = finalValues.filter(v => v < totalInvested).length;
        const lossRate = (losses / finalValues.length * 100).toFixed(1);
        const avgReturn = totalInvested > 0 ? 
            ((finalValues.reduce((a, b) => a + b, 0) / finalValues.length - totalInvested) / totalInvested * 100).toFixed(1) : 0;
        const medianReturn = totalInvested > 0 ?
            ((percentile(finalValues, 50) - totalInvested) / totalInvested * 100).toFixed(1) : 0;
        const var5 = percentile(finalValues, 5);
        const var5Return = totalInvested > 0 ?
            ((var5 - totalInvested) / totalInvested * 100).toFixed(1) : 0;
        
        const container = document.getElementById('riskAnalysis');
        if (container) {
            container.innerHTML = `
                <div class='stat-box'>
                    <div class='label'>Total Invested</div>
                    <div class='value'>${window.FinanceDashboard.formatNumber(totalInvested, 0)} EUR</div>
                </div>
                <div class='stat-box'>
                    <div class='label'>Average Return</div>
                    <div class='value' style='color: ${parseFloat(avgReturn) >= 0 ? "#43e97b" : "#f5576c"}'>${avgReturn}%</div>
                </div>
                <div class='stat-box'>
                    <div class='label'>Median Return</div>
                    <div class='value' style='color: ${parseFloat(medianReturn) >= 0 ? "#43e97b" : "#f5576c"}'>${medianReturn}%</div>
                </div>
                <div class='stat-box'>
                    <div class='label'>Loss Probability</div>
                    <div class='value' style='color: ${parseFloat(lossRate) > 10 ? "#f5576c" : "#43e97b"}'>${lossRate}%</div>
                </div>
                <div class='stat-box'>
                    <div class='label'>VaR (5%)</div>
                    <div class='value'>${window.FinanceDashboard.formatNumber(var5, 0)} EUR</div>
                </div>
                <div class='stat-box'>
                    <div class='label'>VaR Return (5%)</div>
                    <div class='value' style='color: ${parseFloat(var5Return) >= 0 ? "#43e97b" : "#f5576c"}'>${var5Return}%</div>
                </div>
            `;
        }
    }
    
    function createChart4(allSimulations, totalMonths) {
        if (!allSimulations || allSimulations.length === 0) return;
        
        const scenarios = [
            { name: 'Crisis (-40%)', shock: -0.40, color: '#8b0000' },
            { name: 'Recession (-20%)', shock: -0.20, color: '#f5576c' },
            { name: 'Correction (-10%)', shock: -0.10, color: '#ffa500' },
            { name: 'Normal (0%)', shock: 0, color: '#667eea' },
            { name: 'Bull (+20%)', shock: 0.20, color: '#43e97b' }
        ];
        
        const categories = scenarios.map(s => s.name);
        const data = scenarios.map(scenario => {
            const stressedValues = allSimulations.map(sim => {
                const finalValue = sim[totalMonths] || sim[sim.length - 1] || 0;
                return finalValue * (1 + scenario.shock);
            });
            return {
                y: percentile(stressedValues, 50),
                color: scenario.color
            };
        });
        
        Highcharts.chart('chart4', {
            chart: { type: 'column', backgroundColor: 'transparent' },
            title: { text: '⚡ Stress Testing', style: { color: '#667eea', fontWeight: 'bold' } },
            xAxis: { categories: categories, labels: { rotation: -15, style: { fontSize: '11px' } } },
            yAxis: { title: { text: 'Median Value (EUR)' } },
            tooltip: { valueDecimals: 0, valueSuffix: ' EUR' },
            series: [{ 
                name: 'Portfolio', 
                data: data, 
                borderRadius: 5,
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return window.FinanceDashboard.formatNumber(this.y / 1000, 0) + 'k';
                    }
                }
            }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    function createChart5(monthsToTarget, targetValue) {
        if (!monthsToTarget || monthsToTarget.length === 0) return;
        
        const validMonths = monthsToTarget.filter(m => m < 1000);
        
        if (validMonths.length === 0) {
            const chartDiv = document.getElementById('chart5');
            if (chartDiv) {
                chartDiv.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">Target not reached in any simulation</p>';
            }
            return;
        }
        
        const min = Math.min(...validMonths);
        const max = Math.max(...validMonths);
        const binWidth = Math.max(1, Math.ceil((max - min) / 20));
        const bins = [];
        
        for (let i = min; i <= max; i += binWidth) {
            bins.push({ x: i, y: 0 });
        }
        
        validMonths.forEach(m => {
            const binIndex = Math.min(Math.floor((m - min) / binWidth), bins.length - 1);
            if (bins[binIndex]) bins[binIndex].y++;
        });
        
        const medianTime = percentile(validMonths, 50);
        const successRate = (validMonths.length / monthsToTarget.length * 100).toFixed(1);
        
        Highcharts.chart('chart5', {
            chart: { type: 'column', backgroundColor: 'transparent' },
            title: { 
                text: `⏱ Time to ${window.FinanceDashboard.formatNumber(targetValue, 0)} EUR`, 
                style: { color: '#667eea', fontWeight: 'bold' } 
            },
            subtitle: {
                text: `Success: ${successRate}% | Median: ${medianTime.toFixed(0)} months (${(medianTime/12).toFixed(1)} years)`,
                style: { color: '#764ba2' }
            },
            xAxis: { 
                title: { text: 'Months' },
                plotLines: [{
                    color: '#667eea',
                    width: 2,
                    value: medianTime,
                    dashStyle: 'Dash',
                    label: { text: 'Median', style: { color: '#667eea' } }
                }]
            },
            yAxis: { title: { text: 'Frequency' } },
            series: [{ name: 'Distribution', data: bins, color: '#667eea', borderRadius: 5 }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    function createRollingSharpe(allReturns) {
        if (!allReturns || allReturns.length === 0) return;
        
        const windowSize = 12;
        const rollingSharpes = [];
        
        allReturns.forEach(returns => {
            if (!returns || returns.length < windowSize) return;
            
            const simSharpes = [];
            for (let i = windowSize; i < returns.length; i++) {
                const window = returns.slice(i - windowSize, i);
                const avgReturn = window.reduce((a, b) => a + b, 0) / window.length;
                const stdDev = Math.sqrt(window.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / window.length);
                const sharpe = stdDev !== 0 ? avgReturn / stdDev : 0;
                simSharpes.push(sharpe);
            }
            rollingSharpes.push(simSharpes);
        });
        
        if (rollingSharpes.length === 0 || rollingSharpes[0].length === 0) return;
        
        const months = [];
        const medianSharpes = [];
        
        for (let i = 0; i < rollingSharpes[0].length; i++) {
            const sharpes = rollingSharpes.map(sim => sim[i]).filter(s => !isNaN(s));
            if (sharpes.length > 0) {
                months.push(i + windowSize);
                medianSharpes.push(percentile(sharpes, 50));
            }
        }
        
        Highcharts.chart('chartRollingSharpe', {
            chart: { type: 'line', backgroundColor: 'transparent' },
            title: { text: '📈 Rolling Sharpe Ratio', style: { color: '#667eea', fontWeight: 'bold' } },
            xAxis: { title: { text: 'Month' }, categories: months },
            yAxis: { 
                title: { text: 'Sharpe Ratio' },
                plotLines: [{
                    value: 0,
                    color: '#f5576c',
                    width: 1,
                    dashStyle: 'Dash'
                }]
            },
            tooltip: { valueDecimals: 2 },
            series: [{ name: 'Median Sharpe', data: medianSharpes, color: '#667eea', lineWidth: 2 }],
            plotOptions: { line: { marker: { enabled: false } } },
            credits: { enabled: false }
        });
    }
    
    // ========== EXPORT FUNCTIONS ==========
    
    function exportPDF() {
        window.FinanceDashboard.showNotification('Generating PDF...', 'info');
        
        setTimeout(() => {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                
                // Cover page
                doc.setFillColor(102, 126, 234);
                doc.rect(0, 0, 210, 297, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(32);
                doc.text('Monte Carlo Report', 105, 100, { align: 'center' });
                doc.setFontSize(14);
                doc.text(new Date().toLocaleDateString(), 105, 120, { align: 'center' });
                
                // Summary page
                doc.addPage();
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(18);
                doc.text('Executive Summary', 20, 20);
                
                const params = getSimulationParams();
                doc.setFontSize(11);
                let y = 35;
                doc.text(`Monthly Investment: ${params.monthlyInvestment} EUR`, 20, y);
                y += 7;
                doc.text(`Expected Yield: ${(params.monthlyYield * 100).toFixed(2)}%/month`, 20, y);
                y += 7;
                doc.text(`Volatility: ${(params.volatility * 100).toFixed(1)}%`, 20, y);
                y += 7;
                doc.text(`Horizon: ${params.years} years`, 20, y);
                
                if (simulationResults) {
                    y += 12;
                    const median = percentile(simulationResults.finalValues, 50);
                    doc.text(`Median Result: ${window.FinanceDashboard.formatNumber(median, 0)} EUR`, 20, y);
                }
                
                doc.save('MonteCarlo_Report_' + new Date().toISOString().split('T')[0] + '.pdf');
                window.FinanceDashboard.showNotification('PDF generated!', 'success');
            } catch (error) {
                console.error('PDF error:', error);
                window.FinanceDashboard.showNotification('PDF generation failed', 'error');
            }
        }, 300);
    }
    
    function exportExcel() {
        if (!simulationResults) {
            window.FinanceDashboard.showNotification('No results to export', 'warning');
            return;
        }
        
        try {
            let csv = 'Monte Carlo Simulation Results\n';
            csv += 'Generated: ' + new Date().toLocaleString() + '\n\n';
            csv += 'Simulation,Final Value (EUR)\n';
            
            for (let i = 0; i < Math.min(100, simulationResults.finalValues.length); i++) {
                csv += (i + 1) + ',' + simulationResults.finalValues[i].toFixed(2) + '\n';
            }
            
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'MonteCarlo_Data_' + new Date().toISOString().split('T')[0] + '.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.FinanceDashboard.showNotification('CSV exported!', 'success');
        } catch (error) {
            console.error('CSV error:', error);
            window.FinanceDashboard.showNotification('Export failed', 'error');
        }
    }
    
    // ========== INITIALISATION ==========
    
    function init() {
        const strategyRadios = document.querySelectorAll('input[name="strategy"]');
        strategyRadios.forEach(radio => {
            radio.addEventListener('change', updateStrategyFields);
        });
        
        const distributionRadios = document.querySelectorAll('input[name="distribution"]');
        distributionRadios.forEach(radio => {
            radio.addEventListener('change', updateDistributionFields);
        });
        
        updateStrategyFields();
        updateDistributionFields();
        
        // Initialiser Firebase
        initFirebase();
        
        console.log('✅ Monte Carlo initialized');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ========== EXPORTS PUBLICS ==========
    return {
        runSimulation,
        loadTemplate,
        saveCurrentScenario,
        deleteScenario,
        loadScenario,
        compareScenarios,
        clearScenarios,
        exportPDF,
        exportExcel
    };
})();

// ========== MODAL FUNCTIONS ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        // Force reflow
        modal.offsetHeight;
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Fermer en cliquant en dehors
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal') && event.target.classList.contains('active')) {
        closeModal(event.target.id);
    }
});

// Fermer avec Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            closeModal(modal.id);
        });
    }
});

console.log('✅ Monte Carlo module loaded successfully!');