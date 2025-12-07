/* ==============================================
   MONTE-CARLO.JS - VERSION ULTRA-COMPLÈTE
   ✅ 50,000 simulations max
   ✅ 6 distributions
   ✅ 4 stratégies
   ✅ Nouveaux graphiques (Tornado, HeatMap, Correlation, Frontier)
   ✅ COMPARAISON DE SCÉNARIOS
   ✅ CHARGEMENT DE SCÉNARIOS
   ============================================== */

const MonteCarlo = (function() {
    'use strict';
    
    let simulationResults = null;
    let currentUser = null;
    let savedScenariosData = []; // Stockage local des scénarios
    
    // ========== TEMPLATES ==========
    const TEMPLATES = {
        conservative: {
            monthlyInvestment: 500,
            monthlyYield: 0.4,
            volatility: 8,
            years: 25,
            simulations: 2000,
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
            simulations: 2000,
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
            simulations: 2000,
            targetValue: 100000,
            inflationRate: 2.5,
            distribution: 'studentt',
            strategy: 'dca',
            degreesOfFreedom: 5
        },
        retirement: {
            monthlyInvestment: 400,
            monthlyYield: 0.5,
            volatility: 10,
            years: 30,
            simulations: 2000,
            targetValue: 500000,
            inflationRate: 2.5,
            distribution: 'normal',
            strategy: 'withdrawal',
            withdrawalRate: 4,
            withdrawalStartYear: 20
        },
        crypto: {
            monthlyInvestment: 100,
            monthlyYield: 1.5,
            volatility: 60,
            years: 10,
            simulations: 3000,
            targetValue: 50000,
            inflationRate: 2.5,
            distribution: 'jump',
            strategy: 'dca',
            jumpIntensity: 0.3,
            jumpMagnitude: -15
        }
    };
    
    // ========== RANDOM GENERATORS ==========
    
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
    
    function randomLogNormal(mean, stdDev) {
        const normalSample = randomNormal(mean, stdDev);
        return Math.exp(normalSample);
    }
    
    function randomJumpDiffusion(mean, stdDev, lambda, jumpMean) {
        const normalReturn = randomNormal(mean, stdDev);
        const jumpOccurs = Math.random() < (lambda / 12);
        const jump = jumpOccurs ? (jumpMean / 100) : 0;
        return normalReturn + jump;
    }
    
    function randomRegimeSwitching(currentRegime, mean, stdDev) {
        const transitionProb = 0.05;
        let regime = currentRegime;
        if (Math.random() < transitionProb) {
            regime = regime === 'bull' ? 'bear' : 'bull';
        }
        
        const regimeParams = {
            bull: { mean: mean * 1.5, stdDev: stdDev * 0.8 },
            bear: { mean: mean * -0.5, stdDev: stdDev * 1.5 }
        };
        
        const params = regimeParams[regime];
        return {
            return: randomNormal(params.mean, params.stdDev),
            regime: regime
        };
    }
    
    function randomGARCH(prevReturn, prevVolatility, omega, alpha, beta, mean, baseStdDev) {
        const newVolatility = Math.sqrt(omega + alpha * Math.pow(prevReturn - mean, 2) + beta * Math.pow(prevVolatility, 2));
        return {
            return: randomNormal(mean, newVolatility),
            volatility: newVolatility
        };
    }
    
    // ========== UTILITY FUNCTIONS ==========
    
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
            if (path[i] > peak) peak = path[i];
            const drawdown = (peak - path[i]) / peak;
            if (drawdown > maxDD) maxDD = drawdown;
        }
        
        return maxDD;
    }
    
    function calculateAdvancedMetrics(returns, riskFreeRate = 0.02) {
        if (!returns || returns.length === 0) {
            return { sharpeRatio: 0, sortinoRatio: 0, skewness: 0, kurtosis: 0 };
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

    // ========== FIREBASE ==========
    
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
                .limit(10)
                .get();
            
            const scenarios = [];
            snapshot.forEach(doc => {
                scenarios.push({ id: doc.id, ...doc.data() });
            });
            
            savedScenariosData = scenarios; // Stockage local
            updateSavedScenariosList(scenarios);
        } catch (error) {
            console.error('Load scenarios error:', error);
        }
    }
    
    async function saveScenarioToFirebase(scenarioData) {
        if (!currentUser) {
            window.FinanceDashboard.showNotification('Please login to save', 'warning');
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
            window.FinanceDashboard.showNotification('Scenario saved!', 'success');
        } catch (error) {
            console.error('Save error:', error);
            window.FinanceDashboard.showNotification('Save failed', 'error');
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
            window.FinanceDashboard.showNotification('Deleted', 'info');
        } catch (error) {
            console.error('Delete error:', error);
        }
    }
    
    async function clearAllScenarios() {
        if (!currentUser) return;
        if (!confirm('Delete all scenarios?')) return;
        
        try {
            const snapshot = await firebase.firestore()
                .collection('users')
                .doc(currentUser.uid)
                .collection('monteCarloScenarios')
                .get();
            
            const batch = firebase.firestore().batch();
            snapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            
            loadScenariosFromFirebase();
            window.FinanceDashboard.showNotification('All deleted', 'info');
        } catch (error) {
            console.error('Clear error:', error);
        }
    }
    
    function updateSavedScenariosList(scenarios) {
        const container = document.getElementById('savedScenariosList');
        if (!container) return;
        
        if (!scenarios || scenarios.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No saved scenarios</p>';
            return;
        }
        
        container.innerHTML = scenarios.map(s => `
            <div class="saved-scenario-card">
                <div class="scenario-checkbox">
                    <input type="checkbox" id="scenario-${s.id}" value="${s.id}" class="scenario-select-checkbox">
                </div>
                <div class="scenario-info" onclick="MonteCarlo.loadScenario('${s.id}')" style="cursor: pointer; flex-grow: 1;">
                    <h4>${s.name}</h4>
                    <p>${s.date || 'No date'}</p>
                    <p style="font-size: 0.85rem; color: var(--ml-primary); font-weight: 600;">
                        Median: ${window.FinanceDashboard.formatNumber(s.medianResult || 0, 0)} EUR
                    </p>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
                        ${s.params?.distribution || 'N/A'} • ${s.params?.strategy || 'N/A'} • ${s.params?.years || 0}y
                    </p>
                </div>
                <div class="scenario-actions">
                    <button onclick="event.stopPropagation(); MonteCarlo.loadScenario('${s.id}')" title="Load parameters">
                        <i class="fas fa-download"></i>
                    </button>
                    <button onclick="event.stopPropagation(); MonteCarlo.deleteScenario('${s.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // ========== SCENARIO LOADING ==========
    
    function loadScenario(scenarioId) {
        const scenario = savedScenariosData.find(s => s.id === scenarioId);
        if (!scenario || !scenario.params) {
            window.FinanceDashboard.showNotification('Scenario not found', 'error');
            return;
        }
        
        const params = scenario.params;
        
        // Load basic parameters
        if (params.monthlyInvestment !== undefined) {
            document.getElementById('monthlyInvestment').value = params.monthlyInvestment;
        }
        if (params.lumpSumAmount !== undefined) {
            const elem = document.getElementById('lumpSumAmount');
            if (elem) elem.value = params.lumpSumAmount;
        }
        if (params.monthlyYield !== undefined) {
            document.getElementById('monthlyYield').value = params.monthlyYield * 100;
        }
        if (params.volatility !== undefined) {
            document.getElementById('volatility').value = params.volatility * 100;
        }
        if (params.years !== undefined) {
            document.getElementById('years').value = params.years;
        }
        if (params.simulations !== undefined) {
            document.getElementById('simulations').value = params.simulations;
        }
        if (params.targetValue !== undefined) {
            document.getElementById('targetValue').value = params.targetValue;
        }
        if (params.inflationRate !== undefined) {
            document.getElementById('inflationRateMC').value = params.inflationRate;
        }
        if (params.showInflation !== undefined) {
            document.getElementById('showInflationMC').checked = params.showInflation;
        }
        
        // Load distribution
        if (params.distribution) {
            document.querySelectorAll('input[name="distribution"]').forEach(radio => {
                radio.checked = radio.value === params.distribution;
            });
        }
        
        // Load strategy
        if (params.strategy) {
            document.querySelectorAll('input[name="strategy"]').forEach(radio => {
                radio.checked = radio.value === params.strategy;
            });
        }
        
        // Update UI fields based on strategy/distribution
        updateStrategyFields();
        updateDistributionFields();
        
        // Load strategy-specific parameters
        if (params.withdrawalRate !== undefined) {
            const elem = document.getElementById('withdrawalRate');
            if (elem) elem.value = params.withdrawalRate * 100;
        }
        if (params.withdrawalStartYear !== undefined) {
            const elem = document.getElementById('withdrawalStartYear');
            if (elem) elem.value = params.withdrawalStartYear;
        }
        
        // Load distribution-specific parameters
        if (params.degreesOfFreedom !== undefined) {
            const elem = document.getElementById('degreesOfFreedom');
            if (elem) elem.value = params.degreesOfFreedom;
        }
        if (params.jumpIntensity !== undefined) {
            const elem = document.getElementById('jumpIntensity');
            if (elem) elem.value = params.jumpIntensity;
        }
        if (params.jumpMagnitude !== undefined) {
            const elem = document.getElementById('jumpMagnitude');
            if (elem) elem.value = params.jumpMagnitude;
        }
        
        window.FinanceDashboard.showNotification(`"${scenario.name}" loaded!`, 'success');
        
        // Scroll to parameters panel
        const paramsPanel = document.querySelector('.params-panel');
        if (paramsPanel) {
            paramsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    // ========== SCENARIO COMPARISON ==========
    
    function compareScenarios() {
        const checkboxes = document.querySelectorAll('.scenario-select-checkbox:checked');
        const selectedIds = Array.from(checkboxes).map(cb => cb.value);
        
        if (selectedIds.length < 2) {
            window.FinanceDashboard.showNotification('Please select at least 2 scenarios to compare', 'warning');
            return;
        }
        
        if (selectedIds.length > 5) {
            window.FinanceDashboard.showNotification('Maximum 5 scenarios can be compared', 'warning');
            return;
        }
        
        // Récupérer les données des scénarios sélectionnés
        const selectedScenarios = savedScenariosData.filter(s => selectedIds.includes(s.id));
        
        if (selectedScenarios.length === 0) {
            window.FinanceDashboard.showNotification('No scenario data found', 'error');
            return;
        }
        
        // Ouvrir le modal et créer la comparaison
        openModal('modalCompareScenarios');
        createComparisonChart(selectedScenarios);
        createComparisonStats(selectedScenarios);
    }
    
    function createComparisonChart(scenarios) {
        const container = document.getElementById('comparisonChartContainer');
        if (!container) return;
        
        // Couleurs pour chaque scénario
        const colors = ['#667eea', '#f5576c', '#43e97b', '#f6d365', '#764ba2'];
        
        // Créer le graphique de comparaison
        Highcharts.chart('comparisonChartContainer', {
            chart: { 
                type: 'column',
                backgroundColor: 'transparent',
                height: 500
            },
            title: { 
                text: '📊 Scenario Comparison - Median Results',
                style: { 
                    color: '#667eea', 
                    fontWeight: 'bold',
                    fontSize: '1.5rem'
                }
            },
            xAxis: {
                categories: scenarios.map(s => s.name),
                title: { text: 'Scenarios' }
            },
            yAxis: {
                title: { text: 'Median Portfolio Value (EUR)' },
                labels: {
                    formatter: function() {
                        return window.FinanceDashboard.formatNumber(this.value, 0);
                    }
                }
            },
            tooltip: {
                formatter: function() {
                    return '<b>' + this.x + '</b><br/>' +
                           'Median: <b>' + window.FinanceDashboard.formatNumber(this.y, 0) + ' EUR</b>';
                }
            },
            plotOptions: {
                column: {
                    borderRadius: 8,
                    dataLabels: {
                        enabled: true,
                        formatter: function() {
                            return window.FinanceDashboard.formatNumber(this.y / 1000, 0) + 'k';
                        },
                        style: {
                            fontWeight: 'bold',
                            fontSize: '0.9rem'
                        }
                    }
                }
            },
            series: [{
                name: 'Median Value',
                data: scenarios.map((s, i) => ({
                    y: s.medianResult || 0,
                    color: colors[i % colors.length]
                }))
            }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    function createComparisonStats(scenarios) {
        const container = document.getElementById('comparisonStatsContainer');
        if (!container) return;
        
        const colors = ['#667eea', '#f5576c', '#43e97b', '#f6d365', '#764ba2'];
        
        container.innerHTML = scenarios.map((scenario, index) => {
            const params = scenario.params || {};
            const medianResult = scenario.medianResult || 0;
            const totalInvested = params.strategy === 'lumpsum' 
                ? (params.lumpSumAmount || 0)
                : (params.monthlyInvestment || 0) * (params.years || 1) * 12;
            const totalReturn = totalInvested > 0 
                ? ((medianResult - totalInvested) / totalInvested * 100).toFixed(1)
                : 0;
            
            return `
                <div class="comparison-stat-box" style="border-left: 5px solid ${colors[index % colors.length]};">
                    <h4 style="color: ${colors[index % colors.length]};">${scenario.name}</h4>
                    <div class="comparison-values">
                        <div class="comparison-value-item" style="border-left-color: ${colors[index % colors.length]};">
                            <span class="comparison-value-name">Strategy:</span>
                            <span class="comparison-value-number">${params.strategy || 'N/A'}</span>
                        </div>
                        <div class="comparison-value-item" style="border-left-color: ${colors[index % colors.length]};">
                            <span class="comparison-value-name">Distribution:</span>
                            <span class="comparison-value-number">${params.distribution || 'N/A'}</span>
                        </div>
                        <div class="comparison-value-item" style="border-left-color: ${colors[index % colors.length]};">
                            <span class="comparison-value-name">Monthly Yield:</span>
                            <span class="comparison-value-number">${((params.monthlyYield || 0) * 100).toFixed(2)}%</span>
                        </div>
                        <div class="comparison-value-item" style="border-left-color: ${colors[index % colors.length]};">
                            <span class="comparison-value-name">Volatility:</span>
                            <span class="comparison-value-number">${((params.volatility || 0) * 100).toFixed(1)}%</span>
                        </div>
                        <div class="comparison-value-item" style="border-left-color: ${colors[index % colors.length]};">
                            <span class="comparison-value-name">Time Horizon:</span>
                            <span class="comparison-value-number">${params.years || 0} years</span>
                        </div>
                        <div class="comparison-value-item" style="border-left-color: ${colors[index % colors.length]};">
                            <span class="comparison-value-name">Invested:</span>
                            <span class="comparison-value-number">${window.FinanceDashboard.formatNumber(totalInvested, 0)} EUR</span>
                        </div>
                        <div class="comparison-value-item" style="border-left-color: ${colors[index % colors.length]};">
                            <span class="comparison-value-name">Median Result:</span>
                            <span class="comparison-value-number">${window.FinanceDashboard.formatNumber(medianResult, 0)} EUR</span>
                        </div>
                        <div class="comparison-value-item" style="border-left-color: ${colors[index % colors.length]};">
                            <span class="comparison-value-name">Total Return:</span>
                            <span class="comparison-value-number" style="color: ${parseFloat(totalReturn) >= 0 ? '#43e97b' : '#f5576c'};">${totalReturn}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function exportComparisonPDF() {
        window.FinanceDashboard.showNotification('Generating comparison PDF...', 'info');
        
        setTimeout(() => {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                
                // Page de garde
                doc.setFillColor(102, 126, 234);
                doc.rect(0, 0, 210, 297, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(28);
                doc.text('Scenario Comparison Report', 105, 100, { align: 'center' });
                doc.setFontSize(12);
                doc.text(new Date().toLocaleDateString(), 105, 120, { align: 'center' });
                
                // Nouvelle page pour les détails
                doc.addPage();
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(16);
                doc.text('Comparison Summary', 20, 20);
                
                doc.setFontSize(10);
                let y = 35;
                
                const checkboxes = document.querySelectorAll('.scenario-select-checkbox:checked');
                const selectedIds = Array.from(checkboxes).map(cb => cb.value);
                const selectedScenarios = savedScenariosData.filter(s => selectedIds.includes(s.id));
                
                selectedScenarios.forEach((scenario, index) => {
                    if (y > 250) {
                        doc.addPage();
                        y = 20;
                    }
                    
                    doc.setFontSize(12);
                    doc.setTextColor(102, 126, 234);
                    doc.text(`${index + 1}. ${scenario.name}`, 20, y);
                    y += 7;
                    
                    doc.setFontSize(10);
                    doc.setTextColor(0, 0, 0);
                    doc.text(`Median Result: ${window.FinanceDashboard.formatNumber(scenario.medianResult || 0, 0)} EUR`, 25, y);
                    y += 7;
                    
                    const params = scenario.params || {};
                    doc.text(`Strategy: ${params.strategy || 'N/A'}`, 25, y);
                    y += 5;
                    doc.text(`Distribution: ${params.distribution || 'N/A'}`, 25, y);
                    y += 5;
                    doc.text(`Volatility: ${((params.volatility || 0) * 100).toFixed(1)}%`, 25, y);
                    y += 10;
                });
                
                doc.save('MonteCarloComparison_' + new Date().toISOString().split('T')[0] + '.pdf');
                window.FinanceDashboard.showNotification('Comparison PDF ready!', 'success');
            } catch (error) {
                console.error('PDF error:', error);
                window.FinanceDashboard.showNotification('PDF export failed', 'error');
            }
        }, 300);
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
        if (template.withdrawalRate) {
            document.getElementById('withdrawalRate').value = template.withdrawalRate;
        }
        if (template.withdrawalStartYear) {
            document.getElementById('withdrawalStartYear').value = template.withdrawalStartYear;
        }
        if (template.jumpIntensity) {
            document.getElementById('jumpIntensity').value = template.jumpIntensity;
        }
        if (template.jumpMagnitude) {
            document.getElementById('jumpMagnitude').value = template.jumpMagnitude;
        }
        
        window.FinanceDashboard.showNotification(`"${templateName}" loaded!`, 'success');
    }
    
    // ========== SCENARIO MANAGEMENT ==========
    
    function saveCurrentScenario() {
        if (!simulationResults) {
            window.FinanceDashboard.showNotification('Run simulation first', 'warning');
            return;
        }
        
        const name = prompt('Scenario name:', `Scenario ${new Date().toLocaleDateString()}`);
        if (!name) return;
        
        const params = getSimulationParams();
        const median = percentile(simulationResults.finalValues, 50);
        
        saveScenarioToFirebase({
            name: name,
            date: new Date().toLocaleString(),
            params: params,
            medianResult: median
        });
    }
    
    function deleteScenario(scenarioId) {
        deleteScenarioFromFirebase(scenarioId);
    }
    
    function clearScenarios() {
        clearAllScenarios();
    }

    // ========== PARAMETERS ==========
    
    function getSimulationParams() {
        const strategy = document.querySelector('input[name="strategy"]:checked')?.value || 'dca';
        const distribution = document.querySelector('input[name="distribution"]:checked')?.value || 'normal';
        
        return {
            monthlyInvestment: parseFloat(document.getElementById('monthlyInvestment').value) || 0,
            lumpSumAmount: parseFloat(document.getElementById('lumpSumAmount')?.value) || 0,
            monthlyYield: parseFloat(document.getElementById('monthlyYield').value) / 100 || 0,
            volatility: parseFloat(document.getElementById('volatility').value) / 100 || 0,
            years: parseInt(document.getElementById('years').value) || 1,
            simulations: Math.min(parseInt(document.getElementById('simulations').value) || 1000, 50000),
            targetValue: parseFloat(document.getElementById('targetValue').value) || 0,
            inflationRate: parseFloat(document.getElementById('inflationRateMC').value) || 2.5,
            showInflation: document.getElementById('showInflationMC').checked,
            distribution: distribution,
            strategy: strategy,
            degreesOfFreedom: parseInt(document.getElementById('degreesOfFreedom')?.value) || 5,
            jumpIntensity: parseFloat(document.getElementById('jumpIntensity')?.value) || 0.1,
            jumpMagnitude: parseFloat(document.getElementById('jumpMagnitude')?.value) || -10,
            withdrawalRate: parseFloat(document.getElementById('withdrawalRate')?.value) / 100 || 0.04,
            withdrawalStartYear: parseInt(document.getElementById('withdrawalStartYear')?.value) || 15
        };
    }
    
    function updateStrategyFields() {
        const strategy = document.querySelector('input[name="strategy"]:checked')?.value || 'dca';
        
        const lumpSumGroup = document.getElementById('lumpSumGroup');
        const withdrawalRateGroup = document.getElementById('withdrawalRateGroup');
        const withdrawalStartGroup = document.getElementById('withdrawalStartGroup');
        
        if (lumpSumGroup) lumpSumGroup.style.display = 'none';
        if (withdrawalRateGroup) withdrawalRateGroup.style.display = 'none';
        if (withdrawalStartGroup) withdrawalStartGroup.style.display = 'none';
        
        if (strategy === 'lumpsum' || strategy === 'compare') {
            if (lumpSumGroup) lumpSumGroup.style.display = 'block';
        }
        
        if (strategy === 'withdrawal') {
            if (withdrawalRateGroup) withdrawalRateGroup.style.display = 'block';
            if (withdrawalStartGroup) withdrawalStartGroup.style.display = 'block';
        }
    }
    
    function updateDistributionFields() {
        const distribution = document.querySelector('input[name="distribution"]:checked')?.value || 'normal';
        
        const dfGroup = document.getElementById('degreesOfFreedomGroup');
        const jumpIntensityGroup = document.getElementById('jumpIntensityGroup');
        const jumpMagnitudeGroup = document.getElementById('jumpMagnitudeGroup');
        
        if (dfGroup) dfGroup.style.display = 'none';
        if (jumpIntensityGroup) jumpIntensityGroup.style.display = 'none';
        if (jumpMagnitudeGroup) jumpMagnitudeGroup.style.display = 'none';
        
        if (distribution === 'studentt') {
            if (dfGroup) dfGroup.style.display = 'block';
        }
        
        if (distribution === 'jump') {
            if (jumpIntensityGroup) jumpIntensityGroup.style.display = 'block';
            if (jumpMagnitudeGroup) jumpMagnitudeGroup.style.display = 'block';
        }
    }
    
    // ========== MAIN SIMULATION ==========
    
    function runSimulation() {
        const params = getSimulationParams();
        
        if (params.monthlyInvestment <= 0 && params.strategy === 'dca') {
            alert('Monthly investment must be > 0');
            return;
        }
        
        if (params.simulations < 100) {
            alert('Min 100 simulations');
            return;
        }
        
        const progressBar = document.getElementById('simulationProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressBar) {
            progressBar.style.display = 'block';
            if (progressFill) progressFill.style.width = '0%';
            if (progressText) progressText.textContent = 'Starting...';
        }
        
        setTimeout(() => {
            try {
                const totalMonths = params.years * 12;
                const monthlyVolatility = params.volatility / Math.sqrt(12);
                
                let results;
                if (params.strategy === 'compare') {
                    results = executeComparisonSimulation(params, totalMonths, monthlyVolatility);
                } else if (params.strategy === 'withdrawal') {
                    results = executeWithdrawalSimulation(params, totalMonths, monthlyVolatility);
                } else if (params.strategy === 'lumpsum') {
                    results = executeLumpSumSimulation(params, totalMonths, monthlyVolatility);
                } else {
                    results = executeDCASimulation(params, totalMonths, monthlyVolatility);
                }
                
                if (progressText) progressText.textContent = 'Analyzing...';
                if (progressFill) progressFill.style.width = '90%';
                
                setTimeout(() => {
                    displayResults(results, params);
                    if (progressBar) progressBar.style.display = 'none';
                    window.FinanceDashboard.showNotification('Simulation complete!', 'success');
                }, 200);
                
            } catch (error) {
                console.error('Simulation error:', error);
                if (progressBar) progressBar.style.display = 'none';
                window.FinanceDashboard.showNotification('Error: ' + error.message, 'error');
            }
        }, 100);
    }
    
    // ========== SIMULATIONS EXECUTION ==========
    
    function executeDCASimulation(params, totalMonths, monthlyVolatility) {
        const allSimulations = [];
        const finalValues = [];
        const monthsToTarget = [];
        const maxDrawdowns = [];
        const allReturns = [];
        
        const updateInterval = Math.max(Math.floor(params.simulations / 20), 1);
        
        let currentRegime = 'bull';
        let prevVolatility = monthlyVolatility;
        
        for (let sim = 0; sim < params.simulations; sim++) {
            let portfolio = 0;
            const path = [0];
            const returns = [];
            
            for (let month = 0; month < totalMonths; month++) {
                let randomReturn;
                
                switch (params.distribution) {
                    case 'studentt':
                        randomReturn = randomStudentT(params.degreesOfFreedom, params.monthlyYield, monthlyVolatility);
                        break;
                    case 'lognormal':
                        randomReturn = randomLogNormal(params.monthlyYield, monthlyVolatility) - 1;
                        break;
                    case 'jump':
                        randomReturn = randomJumpDiffusion(params.monthlyYield, monthlyVolatility, params.jumpIntensity, params.jumpMagnitude);
                        break;
                    case 'regime':
                        const regimeResult = randomRegimeSwitching(currentRegime, params.monthlyYield, monthlyVolatility);
                        randomReturn = regimeResult.return;
                        currentRegime = regimeResult.regime;
                        break;
                    case 'garch':
                        const prevReturn = returns.length > 0 ? returns[returns.length - 1] : params.monthlyYield;
                        const garchResult = randomGARCH(prevReturn, prevVolatility, 0.00001, 0.1, 0.85, params.monthlyYield, monthlyVolatility);
                        randomReturn = garchResult.return;
                        prevVolatility = garchResult.volatility;
                        break;
                    default: // normal
                        randomReturn = randomNormal(params.monthlyYield, monthlyVolatility);
                }
                
                returns.push(randomReturn);
                portfolio = portfolio * (1 + randomReturn) + params.monthlyInvestment;
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
            
            if (sim % updateInterval === 0) {
                const progress = Math.floor((sim / params.simulations) * 100);
                const progressFill = document.getElementById('progressFill');
                const progressText = document.getElementById('progressText');
                if (progressFill) progressFill.style.width = progress + '%';
                if (progressText) progressText.textContent = `Simulating... ${progress}%`;
            }
        }
        
        return { allSimulations, finalValues, monthsToTarget, maxDrawdowns, allReturns };
    }
    
    function executeLumpSumSimulation(params, totalMonths, monthlyVolatility) {
        const allSimulations = [];
        const finalValues = [];
        const monthsToTarget = [];
        const maxDrawdowns = [];
        const allReturns = [];
        
        for (let sim = 0; sim < params.simulations; sim++) {
            let portfolio = params.lumpSumAmount;
            const path = [portfolio];
            const returns = [];
            
            for (let month = 0; month < totalMonths; month++) {
                const randomReturn = randomNormal(params.monthlyYield, monthlyVolatility);
                returns.push(randomReturn);
                portfolio = portfolio * (1 + randomReturn);
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
            maxDrawdowns.push(calculateMaxDrawdown(path));
        }
        
        return { allSimulations, finalValues, monthsToTarget, maxDrawdowns, allReturns };
    }
    
    function executeWithdrawalSimulation(params, totalMonths, monthlyVolatility) {
        const allSimulations = [];
        const finalValues = [];
        const depletionCount = [];
        const maxDrawdowns = [];
        const allReturns = [];
        
        const withdrawalStartMonth = params.withdrawalStartYear * 12;
        
        for (let sim = 0; sim < params.simulations; sim++) {
            let portfolio = 0;
            const path = [0];
            const returns = [];
            let initialWithdrawalPortfolio = 0;
            let monthlyWithdrawal = 0;
            
            for (let month = 0; month < totalMonths; month++) {
                const randomReturn = randomNormal(params.monthlyYield, monthlyVolatility);
                returns.push(randomReturn);
                
                if (month < withdrawalStartMonth) {
                    portfolio = portfolio * (1 + randomReturn) + params.monthlyInvestment;
                } else {
                    if (month === withdrawalStartMonth) {
                        initialWithdrawalPortfolio = portfolio;
                        monthlyWithdrawal = (initialWithdrawalPortfolio * params.withdrawalRate) / 12;
                    }
                    portfolio = portfolio * (1 + randomReturn) - monthlyWithdrawal;
                    if (portfolio <= 0) portfolio = 0;
                }
                
                path.push(portfolio);
            }
            
            allSimulations.push(path);
            finalValues.push(portfolio);
            allReturns.push(returns);
            depletionCount.push(portfolio <= 0 ? 1 : 0);
            maxDrawdowns.push(calculateMaxDrawdown(path));
        }
        
        return {
            allSimulations,
            finalValues,
            monthsToTarget: [],
            maxDrawdowns,
            allReturns,
            depletionCount,
            withdrawalStartMonth
        };
    }
    
    function executeComparisonSimulation(params, totalMonths, monthlyVolatility) {
        const dcaResults = executeDCASimulation(params, totalMonths, monthlyVolatility);
        const lsResults = executeLumpSumSimulation(params, totalMonths, monthlyVolatility);
        
        return {
            dca: dcaResults,
            lumpsum: lsResults,
            comparison: true
        };
    }

    // ========== DISPLAY RESULTS ==========
    
    function displayResults(results, params) {
        simulationResults = results;
        
        const resultsPanel = document.getElementById('resultsPanel');
        if (resultsPanel) {
            resultsPanel.classList.remove('hidden');
            setTimeout(() => {
                resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
        
        if (results.comparison) {
            displayComparisonResults(results, params);
            return;
        }
        
        if (params.strategy === 'withdrawal') {
            displayWithdrawalResults(results, params);
            return;
        }
        
        displayStandardResults(results, params);
    }
    
    function displayStandardResults(results, params) {
        const { allSimulations, finalValues, monthsToTarget, maxDrawdowns, allReturns } = results;
        const totalMonths = params.years * 12;
        
        const median = percentile(finalValues, 50);
        const p10 = percentile(finalValues, 10);
        const p90 = percentile(finalValues, 90);
        const best = Math.max(...finalValues);
        const worst = Math.min(...finalValues);
        const avgFinal = finalValues.reduce((a, b) => a + b, 0) / finalValues.length;
        
        displayMainStats(median, avgFinal, p10, p90, best, worst, params);
        displayAdvancedRiskMetrics(finalValues, maxDrawdowns, allReturns, params, totalMonths);
        
        createChart1(allSimulations, totalMonths, params);
        createChart2(finalValues, params, totalMonths);
        createChart3(finalValues, params.targetValue);
        createDrawdownAnalysis(maxDrawdowns, allSimulations);
        createRiskAnalysis(finalValues, totalMonths, params.monthlyInvestment, params.strategy, params.lumpSumAmount);
        createTornadoDiagram(params, totalMonths);
        createHeatMap(params, totalMonths);
        createCorrelationMatrix(allReturns, finalValues, maxDrawdowns);
        createEfficientFrontier(params, totalMonths);
        createChart4(allSimulations, totalMonths);
        createChart5(monthsToTarget, params.targetValue);
        createRollingSharpe(allReturns);
        
        document.getElementById('strategyComparisonSection').style.display = 'none';
        document.getElementById('withdrawalAnalysisSection').style.display = 'none';
    }
    
    function displayComparisonResults(results, params) {
        const { dca, lumpsum } = results;
        const totalMonths = params.years * 12;
        
        const dcaMedian = percentile(dca.finalValues, 50);
        const dcaP10 = percentile(dca.finalValues, 10);
        const dcaP90 = percentile(dca.finalValues, 90);
        
        displayMainStats(dcaMedian, dca.finalValues.reduce((a,b) => a+b, 0) / dca.finalValues.length, 
                        dcaP10, dcaP90, Math.max(...dca.finalValues), Math.min(...dca.finalValues), params);
        
        displayAdvancedRiskMetrics(dca.finalValues, dca.maxDrawdowns, dca.allReturns, params, totalMonths);
        
        createChart1(dca.allSimulations, totalMonths, params);
        createChart2(dca.finalValues, params, totalMonths);
        createChart3(dca.finalValues, params.targetValue);
        createDrawdownAnalysis(dca.maxDrawdowns, dca.allSimulations);
        createRiskAnalysis(dca.finalValues, totalMonths, params.monthlyInvestment, params.strategy, params.lumpSumAmount);
        
        const strategySection = document.getElementById('strategyComparisonSection');
        if (strategySection) {
            strategySection.style.display = 'block';
            
            const dcaMedianPath = [];
            const lsMedianPath = [];
            
            for (let m = 0; m <= totalMonths; m++) {
                const dcaValues = dca.allSimulations.map(sim => sim[m]);
                const lsValues = lumpsum.allSimulations.map(sim => sim[m]);
                dcaMedianPath.push(percentile(dcaValues, 50));
                lsMedianPath.push(percentile(lsValues, 50));
            }
            
            Highcharts.chart('chartStrategyComparison', {
                chart: { type: 'line', backgroundColor: 'transparent' },
                title: { text: '💰 DCA vs Lump Sum', style: { color: '#667eea', fontWeight: 'bold' } },
                xAxis: { title: { text: 'Months' } },
                yAxis: { title: { text: 'Portfolio (EUR)' } },
                series: [
                    { name: 'DCA', data: dcaMedianPath, color: '#667eea', lineWidth: 3 },
                    { name: 'Lump Sum', data: lsMedianPath, color: '#f5576c', lineWidth: 3, dashStyle: 'Dash' }
                ],
                credits: { enabled: false }
            });
            
            const lsMedian = percentile(lumpsum.finalValues, 50);
            const dcaWins = dca.finalValues.filter((v, i) => v > lumpsum.finalValues[i]).length;
            const winRate = (dcaWins / dca.finalValues.length * 100).toFixed(1);
            
            const statsContainer = document.getElementById('strategyComparisonStats');
            if (statsContainer) {
                statsContainer.innerHTML = `
                    <div class="stat-box">
                        <div class="label">DCA Median</div>
                        <div class="value">${window.FinanceDashboard.formatNumber(dcaMedian, 0)} EUR</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">Lump Sum Median</div>
                        <div class="value">${window.FinanceDashboard.formatNumber(lsMedian, 0)} EUR</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">DCA Win Rate</div>
                        <div class="value">${winRate}%</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">Difference</div>
                        <div class="value">${window.FinanceDashboard.formatNumber(lsMedian - dcaMedian, 0)} EUR</div>
                    </div>
                `;
            }
        }
        
        document.getElementById('withdrawalAnalysisSection').style.display = 'none';
    }
    
    function displayWithdrawalResults(results, params) {
        const { allSimulations, finalValues, depletionCount, maxDrawdowns, withdrawalStartMonth } = results;
        const totalMonths = params.years * 12;
        
        const median = percentile(finalValues, 50);
        const p10 = percentile(finalValues, 10);
        const p90 = percentile(finalValues, 90);
        const depletionRate = (depletionCount.reduce((a,b) => a+b, 0) / depletionCount.length * 100).toFixed(1);
        
        displayMainStats(median, finalValues.reduce((a,b) => a+b, 0) / finalValues.length, 
                        p10, p90, Math.max(...finalValues), Math.min(...finalValues), params);
        
        displayAdvancedRiskMetrics(finalValues, maxDrawdowns, results.allReturns, params, totalMonths);
        
        createChart1(allSimulations, totalMonths, params);
        createChart2(finalValues, params, totalMonths);
        createChart3(finalValues, params.targetValue);
        createDrawdownAnalysis(maxDrawdowns, allSimulations);
        
        const withdrawalSection = document.getElementById('withdrawalAnalysisSection');
        if (withdrawalSection) {
            withdrawalSection.style.display = 'block';
            
            const medianPath = [];
            const p10Path = [];
            const p90Path = [];
            
            for (let m = 0; m <= totalMonths; m++) {
                const values = allSimulations.map(sim => sim[m]);
                medianPath.push(percentile(values, 50));
                p10Path.push(percentile(values, 10));
                p90Path.push(percentile(values, 90));
            }
            
            Highcharts.chart('chartWithdrawal', {
                chart: { type: 'area', backgroundColor: 'transparent' },
                title: { text: '🏖 Retirement Plan', style: { color: '#764ba2', fontWeight: 'bold' } },
                xAxis: { 
                    title: { text: 'Months' },
                    plotLines: [{
                        color: '#f5576c',
                        width: 2,
                        value: withdrawalStartMonth,
                        dashStyle: 'Dash',
                        label: { text: 'Withdrawal Starts', style: { color: '#f5576c' } }
                    }]
                },
                yAxis: { title: { text: 'Portfolio (EUR)' } },
                series: [
                    { name: 'P90', data: p90Path, color: '#43e97b', fillOpacity: 0.2 },
                    { name: 'Median', data: medianPath, color: '#667eea', lineWidth: 3 },
                    { name: 'P10', data: p10Path, color: '#f5576c', fillOpacity: 0.2 }
                ],
                credits: { enabled: false }
            });
            
            const portfolioAtWithdrawal = percentile(allSimulations.map(sim => sim[withdrawalStartMonth]), 50);
            const monthlyWithdrawal = (portfolioAtWithdrawal * params.withdrawalRate) / 12;
            
            const statsContainer = document.getElementById('withdrawalStats');
            if (statsContainer) {
                statsContainer.innerHTML = `
                    <div class="stat-box">
                        <div class="label">Accumulation Period</div>
                        <div class="value">${params.withdrawalStartYear} years</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">Portfolio at Retirement</div>
                        <div class="value">${window.FinanceDashboard.formatNumber(portfolioAtWithdrawal, 0)} EUR</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">Monthly Withdrawal</div>
                        <div class="value">${window.FinanceDashboard.formatNumber(monthlyWithdrawal, 0)} EUR</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">Depletion Risk</div>
                        <div class="value" style="color: ${parseFloat(depletionRate) > 10 ? '#f5576c' : '#43e97b'}">${depletionRate}%</div>
                    </div>
                `;
            }
        }
        
        document.getElementById('strategyComparisonSection').style.display = 'none';
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
                <div class="label">Median (P50)</div>
                <div class="value">${window.FinanceDashboard.formatNumber(median, 0)} EUR</div>
                ${params.showInflation ? `<div style="font-size: 0.9em; color: #9D5CE6; margin-top: 5px;">Real: ${window.FinanceDashboard.formatNumber(medianReal, 0)} EUR</div>` : ''}
            </div>
            <div class="stat-box">
                <div class="label">Average</div>
                <div class="value">${window.FinanceDashboard.formatNumber(avgFinal, 0)} EUR</div>
                ${params.showInflation ? `<div style="font-size: 0.9em; color: #9D5CE6; margin-top: 5px;">Real: ${window.FinanceDashboard.formatNumber(avgFinalReal, 0)} EUR</div>` : ''}
            </div>
            <div class="stat-box">
                <div class="label">P10 (Pessimistic)</div>
                <div class="value">${window.FinanceDashboard.formatNumber(p10, 0)} EUR</div>
            </div>
            <div class="stat-box">
                <div class="label">P90 (Optimistic)</div>
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
                <div class="label">Median MDD</div>
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

    // ========== CHARTS ==========
    
    function createChart1(allSimulations, totalMonths, params) {
        if (!allSimulations || allSimulations.length === 0) return;
        
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
        
        const samplePaths = [];
        const sampleCount = Math.min(5, allSimulations.length);
        const step = Math.floor(allSimulations.length / sampleCount);
        
        for (let i = 0; i < allSimulations.length && samplePaths.length < sampleCount; i += step) {
            samplePaths.push({
                name: 'Simulation',
                data: allSimulations[i],
                color: 'rgba(102, 126, 234, 0.05)',
                lineWidth: 1,
                enableMouseTracking: false,
                showInLegend: false
            });
        }
        
        const series = [
            ...samplePaths,
            { name: 'P90', data: p90Path, color: '#43e97b', lineWidth: 2 },
            { name: 'Median', data: medianPath, color: '#667eea', lineWidth: 3 },
            { name: 'P10', data: p10Path, color: '#f5576c', lineWidth: 2 }
        ];
        
        Highcharts.chart('chart1', {
            chart: { type: 'line', backgroundColor: 'transparent' },
            title: { text: '📊 Portfolio Evolution', style: { color: '#667eea', fontWeight: 'bold' } },
            xAxis: { title: { text: 'Months' } },
            yAxis: { title: { text: 'Value (EUR)' } },
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
            title: { text: '📈 Return Distribution', style: { color: '#667eea', fontWeight: 'bold' } },
            xAxis: { 
                title: { text: 'Final Value (EUR)' },
                labels: { formatter: function() { return window.FinanceDashboard.formatNumber(this.value, 0); } }
            },
            yAxis: { title: { text: 'Frequency' } },
            series: [{ name: 'Distribution', data: bins, color: '#667eea', borderRadius: 5 }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    function createChart3(finalValues, targetValue) {
        if (!finalValues || finalValues.length === 0) return;
        
        const aboveTarget = finalValues.filter(v => v >= targetValue).length;
        const successRate = (aboveTarget / finalValues.length * 100).toFixed(1);
        
        Highcharts.chart('chart3', {
            chart: { type: 'pie', backgroundColor: 'transparent' },
            title: { text: `🎯 Success: ${successRate}%`, style: { color: '#667eea', fontWeight: 'bold' } },
            plotOptions: { 
                pie: { 
                    innerSize: '65%',
                    dataLabels: { format: '<b>{point.name}</b><br/>{point.percentage:.1f}%' }
                }
            },
            series: [{
                name: 'Probability',
                data: [
                    { name: 'Above ✓', y: aboveTarget, color: '#43e97b', sliced: true },
                    { name: 'Below', y: finalValues.length - aboveTarget, color: '#f5576c' }
                ]
            }],
            credits: { enabled: false }
        });
    }
    
    function createDrawdownAnalysis(maxDrawdowns, allSimulations) {
        if (!maxDrawdowns || maxDrawdowns.length === 0) return;
        
        const container = document.getElementById('drawdownStats');
        if (container) {
            const medianMDD = percentile(maxDrawdowns, 50);
            const p90MDD = percentile(maxDrawdowns, 90);
            const avgMDD = maxDrawdowns.reduce((a,b) => a+b, 0) / maxDrawdowns.length;
            
            container.innerHTML = `
                <div class="stat-box">
                    <div class="label">Median MDD</div>
                    <div class="value" style="color: #f5576c;">${(medianMDD * 100).toFixed(1)}%</div>
                </div>
                <div class="stat-box">
                    <div class="label">Average MDD</div>
                    <div class="value" style="color: #f5576c;">${(avgMDD * 100).toFixed(1)}%</div>
                </div>
                <div class="stat-box">
                    <div class="label">P90 MDD</div>
                    <div class="value" style="color: #f5576c;">${(p90MDD * 100).toFixed(1)}%</div>
                </div>
            `;
        }
        
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
                title: { text: 'MDD (%)' },
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
        
        const container = document.getElementById('riskAnalysis');
        if (container) {
            container.innerHTML = `
                <div class='stat-box'>
                    <div class='label'>Total Invested</div>
                    <div class='value'>${window.FinanceDashboard.formatNumber(totalInvested, 0)} EUR</div>
                </div>
                <div class='stat-box'>
                    <div class='label'>Avg Return</div>
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
            `;
        }
    }
    
    function createChart4(allSimulations, totalMonths) {
        if (!allSimulations || allSimulations.length === 0) return;
        
        const scenarios = [
            { name: 'Crisis (-40%)', shock: -0.40, color: '#8b0000' },
            { name: 'Recession (-20%)', shock: -0.20, color: '#f5576c' },
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
            xAxis: { categories: categories },
            yAxis: { title: { text: 'Median (EUR)' } },
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
                chartDiv.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">Target not reached</p>';
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
                text: `Success: ${successRate}% | Median: ${(medianTime/12).toFixed(1)} years`,
                style: { color: '#764ba2' }
            },
            xAxis: { title: { text: 'Months' } },
            yAxis: { title: { text: 'Frequency' } },
            series: [{ name: 'Distribution', data: bins, color: '#667eea', borderRadius: 5 }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }

    // ========== ADVANCED CHARTS ==========
    
    function createTornadoDiagram(params, totalMonths) {
        const baseParams = {...params, simulations: 500};
        const baseMedian = percentile(executeDCASimulation(baseParams, totalMonths, baseParams.volatility / Math.sqrt(12)).finalValues, 50);
        
        const sensitivity = [];
        const parameterNames = {
            monthlyInvestment: 'Monthly Investment',
            monthlyYield: 'Monthly Yield',
            volatility: 'Volatility',
            years: 'Time Horizon'
        };
        
        for (const [paramName, displayName] of Object.entries(parameterNames)) {
            const paramsPlus = {...baseParams};
            const paramsMinus = {...baseParams};
            
            if (paramName === 'monthlyYield' || paramName === 'volatility') {
                paramsPlus[paramName] = baseParams[paramName] * 1.1;
                paramsMinus[paramName] = baseParams[paramName] * 0.9;
            } else {
                paramsPlus[paramName] = Math.round(baseParams[paramName] * 1.1);
                paramsMinus[paramName] = Math.max(1, Math.round(baseParams[paramName] * 0.9));
            }
            
            const medianPlus = percentile(executeDCASimulation(paramsPlus, paramsPlus.years * 12, paramsPlus.volatility / Math.sqrt(12)).finalValues, 50);
            const medianMinus = percentile(executeDCASimulation(paramsMinus, paramsMinus.years * 12, paramsMinus.volatility / Math.sqrt(12)).finalValues, 50);
            
            const impact = Math.abs(medianPlus - medianMinus);
            sensitivity.push({
                name: displayName,
                low: medianMinus - baseMedian,
                high: medianPlus - baseMedian,
                impact: impact
            });
        }
        
        sensitivity.sort((a, b) => b.impact - a.impact);
        
        const categories = sensitivity.map(s => s.name);
        const lowData = sensitivity.map(s => s.low);
        const highData = sensitivity.map(s => s.high);
        
        Highcharts.chart('chartTornado', {
            chart: { type: 'bar', backgroundColor: 'transparent' },
            title: { text: '🌪 Sensitivity Analysis', style: { color: '#667eea', fontWeight: 'bold' } },
            xAxis: [{ categories: categories, reversed: false }, { opposite: true, reversed: false, categories: categories, linkedTo: 0 }],
            yAxis: { title: { text: 'Impact (EUR)' } },
            plotOptions: { series: { stacking: 'normal', borderRadius: 5 } },
            series: [
                { name: 'Decrease (-10%)', data: lowData, color: '#f5576c' },
                { name: 'Increase (+10%)', data: highData, color: '#43e97b' }
            ],
            credits: { enabled: false }
        });
    }
    
    function createHeatMap(params, totalMonths) {
        const yields = [0.3, 0.5, 0.67, 0.83, 1.0, 1.2];
        const volatilities = [8, 12, 15, 18, 22, 25];
        const data = [];
        
        for (let i = 0; i < yields.length; i++) {
            for (let j = 0; j < volatilities.length; j++) {
                const testParams = {
                    ...params,
                    monthlyYield: yields[i] / 100,
                    volatility: volatilities[j] / 100,
                    simulations: 300
                };
                
                const results = executeDCASimulation(testParams, testParams.years * 12, testParams.volatility / Math.sqrt(12));
                const median = percentile(results.finalValues, 50);
                
                data.push([i, j, median]);
            }
        }
        
        Highcharts.chart('chartHeatMap', {
            chart: { type: 'heatmap', backgroundColor: 'transparent' },
            title: { text: '🌡 Parameter Heat Map', style: { color: '#667eea', fontWeight: 'bold' } },
            xAxis: {
                categories: yields.map(y => (y * 12).toFixed(1) + '%'),
                title: { text: 'Annual Return' }
            },
            yAxis: {
                categories: volatilities.map(v => v + '%'),
                title: { text: 'Volatility' }
            },
            colorAxis: {
                min: Math.min(...data.map(d => d[2])),
                max: Math.max(...data.map(d => d[2])),
                stops: [
                    [0, '#f5576c'],
                    [0.5, '#f6d365'],
                    [1, '#43e97b']
                ]
            },
            series: [{
                name: 'Portfolio',
                borderWidth: 1,
                data: data,
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return window.FinanceDashboard.formatNumber(this.point.value / 1000, 0) + 'k';
                    }
                }
            }],
            credits: { enabled: false }
        });
    }
    
    function createCorrelationMatrix(allReturns, finalValues, maxDrawdowns) {
        const flatReturns = allReturns.flat();
        const avgReturn = flatReturns.reduce((a,b) => a+b, 0) / flatReturns.length;
        
        const volatilities = allReturns.map(returns => {
            const avg = returns.reduce((a,b) => a+b, 0) / returns.length;
            return Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / returns.length);
        });
        
        const sharpes = allReturns.map((returns, i) => {
            const avg = returns.reduce((a,b) => a+b, 0) / returns.length;
            const std = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / returns.length);
            return std !== 0 ? avg / std : 0;
        });
        
        function correlation(arr1, arr2) {
            const n = arr1.length;
            const mean1 = arr1.reduce((a,b) => a+b, 0) / n;
            const mean2 = arr2.reduce((a,b) => a+b, 0) / n;
            
            let num = 0;
            let den1 = 0;
            let den2 = 0;
            
            for (let i = 0; i < n; i++) {
                num += (arr1[i] - mean1) * (arr2[i] - mean2);
                den1 += Math.pow(arr1[i] - mean1, 2);
                den2 += Math.pow(arr2[i] - mean2, 2);
            }
            
            return den1 === 0 || den2 === 0 ? 0 : num / Math.sqrt(den1 * den2);
        }
        
        const metrics = ['Final Value', 'Max Drawdown', 'Volatility', 'Sharpe'];
        const arrays = [finalValues, maxDrawdowns, volatilities, sharpes];
        const data = [];
        
        for (let i = 0; i < metrics.length; i++) {
            for (let j = 0; j < metrics.length; j++) {
                const corr = i === j ? 1 : correlation(arrays[i], arrays[j]);
                data.push([i, j, corr]);
            }
        }
        
        Highcharts.chart('chartCorrelation', {
            chart: { type: 'heatmap', backgroundColor: 'transparent' },
            title: { text: '📊 Correlation Matrix', style: { color: '#667eea', fontWeight: 'bold' } },
            xAxis: { categories: metrics },
            yAxis: { categories: metrics },
            colorAxis: {
                min: -1,
                max: 1,
                stops: [
                    [0, '#f5576c'],
                    [0.5, '#ffffff'],
                    [1, '#43e97b']
                ]
            },
            series: [{
                name: 'Correlation',
                borderWidth: 1,
                data: data,
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return this.point.value.toFixed(2);
                    }
                }
            }],
            credits: { enabled: false }
        });
    }
    
    function createEfficientFrontier(params, totalMonths) {
        const frontierData = [];
        
        for (let vol = 5; vol <= 30; vol += 2) {
            const testParams = {
                ...params,
                volatility: vol / 100,
                simulations: 300
            };
            
            const results = executeDCASimulation(testParams, totalMonths, testParams.volatility / Math.sqrt(12));
            const median = percentile(results.finalValues, 50);
            const totalInvested = testParams.monthlyInvestment * totalMonths;
            const annualReturn = totalInvested > 0 ? 
                ((median / totalInvested) - 1) / testParams.years * 100 : 0;
            
            frontierData.push([vol, annualReturn]);
        }
        
        Highcharts.chart('chartFrontier', {
            chart: { type: 'scatter', backgroundColor: 'transparent' },
            title: { text: '📈 Risk-Return Frontier', style: { color: '#667eea', fontWeight: 'bold' } },
            xAxis: { title: { text: 'Volatility (%)' } },
            yAxis: { title: { text: 'Annual Return (%)' } },
            series: [{
                name: 'Efficient Frontier',
                data: frontierData,
                color: '#667eea',
                marker: { radius: 6 }
            }],
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
            title: { text: '📈 Rolling Sharpe', style: { color: '#667eea', fontWeight: 'bold' } },
            xAxis: { title: { text: 'Month' }, categories: months },
            yAxis: { title: { text: 'Sharpe Ratio' } },
            series: [{ name: 'Median Sharpe', data: medianSharpes, color: '#667eea', lineWidth: 2 }],
            plotOptions: { line: { marker: { enabled: false } } },
            credits: { enabled: false }
        });
    }
    
    // ========== EXPORT ==========
    
    function exportPDF() {
        window.FinanceDashboard.showNotification('Generating PDF...', 'info');
        
        setTimeout(() => {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                
                doc.setFillColor(102, 126, 234);
                doc.rect(0, 0, 210, 297, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(28);
                doc.text('Monte Carlo Report', 105, 100, { align: 'center' });
                doc.setFontSize(12);
                doc.text(new Date().toLocaleDateString(), 105, 120, { align: 'center' });
                
                doc.addPage();
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(16);
                doc.text('Summary', 20, 20);
                
                const params = getSimulationParams();
                doc.setFontSize(10);
                let y = 35;
                doc.text(`Investment: ${params.monthlyInvestment} EUR/month`, 20, y);
                y += 7;
                doc.text(`Yield: ${(params.monthlyYield * 100).toFixed(2)}%`, 20, y);
                y += 7;
                doc.text(`Volatility: ${(params.volatility * 100).toFixed(1)}%`, 20, y);
                y += 7;
                doc.text(`Horizon: ${params.years} years`, 20, y);
                
                if (simulationResults) {
                    y += 12;
                    const median = percentile(simulationResults.finalValues, 50);
                    doc.text(`Median: ${window.FinanceDashboard.formatNumber(median, 0)} EUR`, 20, y);
                }
                
                doc.save('MonteCarlo_' + new Date().toISOString().split('T')[0] + '.pdf');
                window.FinanceDashboard.showNotification('PDF ready!', 'success');
            } catch (error) {
                console.error('PDF error:', error);
                window.FinanceDashboard.showNotification('PDF failed', 'error');
            }
        }, 300);
    }
    
    function exportExcel() {
        if (!simulationResults) {
            window.FinanceDashboard.showNotification('No results', 'warning');
            return;
        }
        
        try {
            let csv = 'Monte Carlo Results\n';
            csv += 'Generated: ' + new Date().toLocaleString() + '\n\n';
            csv += 'Simulation,Final Value (EUR)\n';
            
            for (let i = 0; i < Math.min(1000, simulationResults.finalValues.length); i++) {
                csv += (i + 1) + ',' + simulationResults.finalValues[i].toFixed(2) + '\n';
            }
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'MonteCarlo_' + new Date().toISOString().split('T')[0] + '.csv';
            link.click();
            
            window.FinanceDashboard.showNotification('CSV ready!', 'success');
        } catch (error) {
            console.error('CSV error:', error);
            window.FinanceDashboard.showNotification('Export failed', 'error');
        }
    }

    // ========== INIT ==========
    
    function init() {
        document.querySelectorAll('input[name="strategy"]').forEach(radio => {
            radio.addEventListener('change', updateStrategyFields);
        });
        
        document.querySelectorAll('input[name="distribution"]').forEach(radio => {
            radio.addEventListener('change', updateDistributionFields);
        });
        
        updateStrategyFields();
        updateDistributionFields();
        initFirebase();
        
        console.log('✅ Monte Carlo Ultra initialized with Scenario Comparison & Loading');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // ========== PUBLIC API ==========
    return {
        runSimulation,
        loadTemplate,
        loadScenario,
        saveCurrentScenario,
        deleteScenario,
        clearScenarios,
        compareScenarios,
        exportPDF,
        exportExcel,
        exportComparisonPDF
    };
})();

// ========== MODAL FUNCTIONS ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
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

window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal') && event.target.classList.contains('active')) {
        closeModal(event.target.id);
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            closeModal(modal.id);
        });
    }
});

console.log('✅ Monte Carlo Ultra-Complete with Scenario Comparison & Loading loaded!');