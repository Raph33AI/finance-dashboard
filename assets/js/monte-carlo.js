/* ==============================================
   MONTE-CARLO.JS - ULTRA PROFESSIONAL VERSION
   Toutes les fonctionnalités avancées intégrées
   ============================================== */

const MonteCarlo = (function() {
    'use strict';
    
    // ========== VARIABLES PRIVÉES ==========
    let simulationResults = null;
    let savedScenarios = [];
    const MAX_SCENARIOS = 5;
    
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
            strategy: 'withdrawal',
            withdrawalRate: 4,
            withdrawalStartYear: 15
        },
        crypto: {
            monthlyInvestment: 100,
            monthlyYield: 1.5,
            volatility: 60,
            years: 10,
            simulations: 2000,
            targetValue: 50000,
            inflationRate: 2.5,
            distribution: 'jump',
            strategy: 'dca',
            jumpIntensity: 0.2,
            jumpMagnitude: -15
        }
    };
    
    // ========== FONCTIONS UTILITAIRES ==========
    
    /**
     * Génère une valeur aléatoire suivant une distribution normale (Box-Muller)
     */
    function randomNormal(mean = 0, stdDev = 1) {
        let u1 = Math.random();
        let u2 = Math.random();
        let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z0 * stdDev + mean;
    }
    
    /**
     * Génère une valeur aléatoire suivant une distribution Student-t
     */
    function randomStudentT(df, mean = 0, scale = 1) {
        // Approximation de Student-t via gamma
        const normalSample = randomNormal(0, 1);
        const chiSquared = Array.from({length: df}, () => Math.pow(randomNormal(0, 1), 2))
            .reduce((sum, val) => sum + val, 0);
        const tValue = normalSample / Math.sqrt(chiSquared / df);
        return mean + tValue * scale;
    }
    
    /**
     * Génère un rendement avec Jump Diffusion (Merton)
     */
    function randomJumpDiffusion(mean, stdDev, lambda, jumpMean) {
        const normalReturn = randomNormal(mean, stdDev);
        const jumpOccurs = Math.random() < (lambda / 12); // Probabilité mensuelle
        const jump = jumpOccurs ? (jumpMean / 100) : 0;
        return normalReturn + jump;
    }
    
    /**
     * Génère un rendement avec Regime Switching
     */
    function randomRegimeSwitching(currentRegime, mean, stdDev) {
        // Probabilité de transition (Markov)
        const transitionProb = 0.05; // 5% chance de changer de régime par mois
        
        let regime = currentRegime;
        if (Math.random() < transitionProb) {
            regime = regime === 'bull' ? 'bear' : 'bull';
        }
        
        // Paramètres selon le régime
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
    
    /**
     * Calcule le percentile d'un tableau
     */
    function percentile(arr, p) {
        if (arr.length === 0) return 0;
        const sorted = arr.slice().sort((a, b) => a - b);
        const index = (p / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
    
    /**
     * Ajuste une valeur pour l'inflation
     */
    function adjustForInflationMC(value, monthIndex, inflationRate) {
        const monthlyInflation = Math.pow(1 + inflationRate / 100, 1/12) - 1;
        return value / Math.pow(1 + monthlyInflation, monthIndex);
    }
    
    /**
     * Calcule le Maximum Drawdown d'une trajectoire
     */
    function calculateMaxDrawdown(path) {
        let maxDD = 0;
        let peak = path[0];
        let peakIndex = 0;
        let troughIndex = 0;
        
        for (let i = 1; i < path.length; i++) {
            if (path[i] > peak) {
                peak = path[i];
                peakIndex = i;
            }
            
            const drawdown = (peak - path[i]) / peak;
            if (drawdown > maxDD) {
                maxDD = drawdown;
                troughIndex = i;
            }
        }
        
        return {
            mdd: maxDD,
            peakIndex: peakIndex,
            troughIndex: troughIndex,
            recoveryTime: 0 // À calculer après
        };
    }
    
    /**
     * Calcule les métriques avancées (Sharpe, Sortino, etc.)
     */
    function calculateAdvancedMetrics(returns, riskFreeRate = 0.02) {
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length);
        
        // Downside deviation (seulement les rendements négatifs)
        const downsideReturns = returns.filter(r => r < 0);
        const downsideDeviation = downsideReturns.length > 0 
            ? Math.sqrt(downsideReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / downsideReturns.length)
            : 0;
        
        // Sharpe Ratio
        const sharpeRatio = stdDev !== 0 ? (avgReturn - riskFreeRate / 12) / stdDev : 0;
        
        // Sortino Ratio
        const sortinoRatio = downsideDeviation !== 0 ? (avgReturn - riskFreeRate / 12) / downsideDeviation : 0;
        
        // Skewness
        const skewness = returns.length > 0 
            ? (returns.reduce((sum, r) => sum + Math.pow((r - avgReturn) / stdDev, 3), 0) / returns.length)
            : 0;
        
        // Kurtosis
        const kurtosis = returns.length > 0
            ? (returns.reduce((sum, r) => sum + Math.pow((r - avgReturn) / stdDev, 4), 0) / returns.length)
            : 0;
        
        return {
            sharpeRatio,
            sortinoRatio,
            skewness,
            kurtosis,
            avgReturn,
            stdDev
        };
    }
    
    // ========== TEMPLATE LOADING ==========
    
    function loadTemplate(templateName) {
        const template = TEMPLATES[templateName];
        if (!template) {
            console.error('Template not found:', templateName);
            return;
        }
        
        // Remplir les champs
        document.getElementById('monthlyInvestment').value = template.monthlyInvestment;
        document.getElementById('monthlyYield').value = template.monthlyYield;
        document.getElementById('volatility').value = template.volatility;
        document.getElementById('years').value = template.years;
        document.getElementById('simulations').value = template.simulations;
        document.getElementById('targetValue').value = template.targetValue;
        document.getElementById('inflationRateMC').value = template.inflationRate;
        
        // Sélectionner la distribution
        const distRadios = document.querySelectorAll('input[name="distribution"]');
        distRadios.forEach(radio => {
            radio.checked = radio.value === template.distribution;
        });
        
        // Sélectionner la stratégie
        const strategyRadios = document.querySelectorAll('input[name="strategy"]');
        strategyRadios.forEach(radio => {
            radio.checked = radio.value === template.strategy;
        });
        updateStrategyFields();
        
        // Paramètres spécifiques
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
        
        window.FinanceDashboard.showNotification(`Template "${templateName}" loaded!`, 'success');
    }
    
    // ========== SCENARIO MANAGEMENT ==========
    
    function saveCurrentScenario() {
        if (!simulationResults) {
            window.FinanceDashboard.showNotification('Run a simulation first!', 'warning');
            return;
        }
        
        if (savedScenarios.length >= MAX_SCENARIOS) {
            window.FinanceDashboard.showNotification(`Maximum ${MAX_SCENARIOS} scenarios allowed. Delete one first.`, 'warning');
            return;
        }
        
        const name = prompt('Enter a name for this scenario:', `Scenario ${savedScenarios.length + 1}`);
        if (!name) return;
        
        const scenario = {
            id: Date.now(),
            name: name,
            date: new Date().toLocaleString(),
            params: getSimulationParams(),
            results: simulationResults
        };
        
        savedScenarios.push(scenario);
        updateSavedScenariosList();
        window.FinanceDashboard.showNotification(`Scenario "${name}" saved!`, 'success');
    }
    
    function deleteScenario(id) {
        savedScenarios = savedScenarios.filter(s => s.id !== id);
        updateSavedScenariosList();
        window.FinanceDashboard.showNotification('Scenario deleted', 'info');
    }
    
    function loadScenario(id) {
        const scenario = savedScenarios.find(s => s.id === id);
        if (!scenario) return;
        
        // Charger les paramètres
        const params = scenario.params;
        document.getElementById('monthlyInvestment').value = params.monthlyInvestment;
        document.getElementById('monthlyYield').value = params.monthlyYield;
        document.getElementById('volatility').value = params.volatility;
        document.getElementById('years').value = params.years;
        document.getElementById('simulations').value = params.simulations;
        document.getElementById('targetValue').value = params.targetValue;
        document.getElementById('inflationRateMC').value = params.inflationRate;
        
        window.FinanceDashboard.showNotification(`Scenario "${scenario.name}" loaded!`, 'success');
    }
    
    function compareScenarios() {
        if (savedScenarios.length < 2) {
            window.FinanceDashboard.showNotification('Save at least 2 scenarios to compare', 'warning');
            return;
        }
        
        // Créer un graphique de comparaison
        createScenarioComparisonChart();
        window.FinanceDashboard.showNotification('Scenario comparison created!', 'success');
    }
    
    function clearScenarios() {
        if (confirm('Are you sure you want to delete all saved scenarios?')) {
            savedScenarios = [];
            updateSavedScenariosList();
            window.FinanceDashboard.showNotification('All scenarios deleted', 'info');
        }
    }
    
    function updateSavedScenariosList() {
        const container = document.getElementById('savedScenariosList');
        if (!container) return;
        
        if (savedScenarios.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No saved scenarios yet. Run a simulation and save it!</p>';
            return;
        }
        
        container.innerHTML = savedScenarios.map(scenario => `
            <div class="saved-scenario-card">
                <div class="scenario-info">
                    <h4>${scenario.name}</h4>
                    <p>${scenario.date}</p>
                </div>
                <div class="scenario-actions">
                    <button onclick="MonteCarlo.loadScenario(${scenario.id})" title="Load">
                        <i class="fas fa-folder-open"></i>
                    </button>
                    <button onclick="MonteCarlo.deleteScenario(${scenario.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    function createScenarioComparisonChart() {
        if (savedScenarios.length === 0) return;
        
        const series = savedScenarios.map((scenario, index) => {
            const colors = ['#667eea', '#f5576c', '#43e97b', '#f6d365', '#764ba2'];
            const medianPath = [];
            
            const totalMonths = scenario.results.allSimulations[0].length;
            for (let m = 0; m < totalMonths; m++) {
                const values = scenario.results.allSimulations.map(sim => sim[m]);
                medianPath.push(percentile(values, 50));
            }
            
            return {
                name: scenario.name,
                data: medianPath,
                color: colors[index % colors.length],
                lineWidth: 3
            };
        });
        
        Highcharts.chart('chart1', {
            chart: { type: 'line', backgroundColor: 'transparent', zoomType: 'xy' },
            title: { text: '📊 Scenario Comparison', style: { color: '#667eea', fontSize: '1.3em', fontWeight: 'bold' } },
            xAxis: { title: { text: 'Months' }, crosshair: true },
            yAxis: { title: { text: 'Portfolio Value (EUR)' } },
            tooltip: { shared: true, valueDecimals: 0, valueSuffix: ' EUR' },
            series: series,
            plotOptions: { line: { marker: { enabled: false } } },
            credits: { enabled: false }
        });
    }
    
    // ========== PARAMETER HANDLING ==========
    
    function getSimulationParams() {
        const strategy = document.querySelector('input[name="strategy"]:checked').value;
        const distribution = document.querySelector('input[name="distribution"]:checked').value;
        
        return {
            monthlyInvestment: parseFloat(document.getElementById('monthlyInvestment').value) || 0,
            lumpSumAmount: parseFloat(document.getElementById('lumpSumAmount')?.value) || 0,
            monthlyYield: parseFloat(document.getElementById('monthlyYield').value) / 100 || 0,
            volatility: parseFloat(document.getElementById('volatility').value) / 100 || 0,
            years: parseInt(document.getElementById('years').value) || 1,
            simulations: parseInt(document.getElementById('simulations').value) || 1000,
            targetValue: parseFloat(document.getElementById('targetValue').value) || 0,
            inflationRate: parseFloat(document.getElementById('inflationRateMC').value) || 2.5,
            showInflation: document.getElementById('showInflationMC').checked,
            distribution: distribution,
            strategy: strategy,
            withdrawalRate: parseFloat(document.getElementById('withdrawalRate')?.value) / 100 || 0.04,
            withdrawalStartYear: parseInt(document.getElementById('withdrawalStartYear')?.value) || 15,
            degreesOfFreedom: parseInt(document.getElementById('degreesOfFreedom')?.value) || 5,
            jumpIntensity: parseFloat(document.getElementById('jumpIntensity')?.value) || 0.1,
            jumpMagnitude: parseFloat(document.getElementById('jumpMagnitude')?.value) || -10,
            enableGARCH: document.getElementById('enableGARCH')?.checked || false,
            showConfidenceCone: document.getElementById('showConfidenceCone')?.checked || false
        };
    }
    
    function updateStrategyFields() {
        const strategy = document.querySelector('input[name="strategy"]:checked')?.value || 'dca';
        
        // Cacher tous les champs spécifiques
        const lumpSumGroup = document.getElementById('lumpSumGroup');
        const withdrawalRateGroup = document.getElementById('withdrawalRateGroup');
        const withdrawalStartGroup = document.getElementById('withdrawalStartGroup');
        
        if (lumpSumGroup) lumpSumGroup.style.display = 'none';
        if (withdrawalRateGroup) withdrawalRateGroup.style.display = 'none';
        if (withdrawalStartGroup) withdrawalStartGroup.style.display = 'none';
        
        // Afficher les champs selon la stratégie
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
    
    // ========== SIMULATION PRINCIPALE ==========
    
    function runSimulation() {
        const params = getSimulationParams();
        
        // Validation
        if (params.monthlyInvestment <= 0 && params.strategy === 'dca') {
            alert('Monthly investment must be greater than 0!');
            return;
        }
        
        if (params.simulations < 100 || params.simulations > 10000) {
            alert('Number of simulations must be between 100 and 10,000!');
            return;
        }
        
        // Afficher la barre de progression
        const progressBar = document.getElementById('simulationProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressBar) {
            progressBar.style.display = 'block';
            progressFill.style.width = '0%';
            progressText.textContent = 'Initializing simulation...';
        }
        
        // Simuler de manière asynchrone
        setTimeout(() => {
            try {
                const totalMonths = params.years * 12;
                const monthlyVolatility = params.volatility / Math.sqrt(12);
                
                // Choisir la fonction de simulation selon la stratégie
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
                
                // Mettre à jour la progression
                if (progressText) progressText.textContent = 'Analyzing results...';
                if (progressFill) progressFill.style.width = '90%';
                
                setTimeout(() => {
                    displayResults(results, params);
                    
                    if (progressBar) progressBar.style.display = 'none';
                    
                    window.FinanceDashboard.showNotification('Simulation completed successfully!', 'success');
                }, 300);
                
            } catch (error) {
                console.error('Simulation error:', error);
                if (progressBar) progressBar.style.display = 'none';
                window.FinanceDashboard.showNotification('Simulation failed: ' + error.message, 'error');
            }
        }, 100);
    }
    
    // ========== SIMULATIONS SPÉCIFIQUES ==========
    
    /**
     * Simulation DCA standard
     */
    function executeDCASimulation(params, totalMonths, monthlyVolatility) {
        const allSimulations = [];
        const finalValues = [];
        const monthsToTarget = [];
        const maxDrawdowns = [];
        const allReturns = [];
        
        let currentRegime = 'bull';
        
        for (let sim = 0; sim < params.simulations; sim++) {
            let portfolio = 0;
            const path = [0];
            const returns = [];
            
            for (let month = 0; month < totalMonths; month++) {
                let randomReturn;
                
                // Générer le rendement selon la distribution choisie
                switch (params.distribution) {
                    case 'studentt':
                        randomReturn = randomStudentT(params.degreesOfFreedom, params.monthlyYield, monthlyVolatility);
                        break;
                    case 'jump':
                        randomReturn = randomJumpDiffusion(params.monthlyYield, monthlyVolatility, params.jumpIntensity, params.jumpMagnitude);
                        break;
                    case 'regime':
                        const regimeResult = randomRegimeSwitching(currentRegime, params.monthlyYield, monthlyVolatility);
                        randomReturn = regimeResult.return;
                        currentRegime = regimeResult.regime;
                        break;
                    default: // normal
                        randomReturn = randomNormal(params.monthlyYield, monthlyVolatility);
                }
                
                returns.push(randomReturn);
                portfolio = portfolio * (1 + randomReturn) + params.monthlyInvestment;
                path.push(portfolio);
                
                // Vérifier si la cible est atteinte
                if (portfolio >= params.targetValue && monthsToTarget.length === sim) {
                    monthsToTarget.push(month + 1);
                }
                
                // Mettre à jour la progression
                if (sim % 100 === 0 && month === 0) {
                    const progress = (sim / params.simulations * 100).toFixed(0);
                    const progressFill = document.getElementById('progressFill');
                    const progressText = document.getElementById('progressText');
                    if (progressFill) progressFill.style.width = progress + '%';
                    if (progressText) progressText.textContent = `Running simulation ${sim + 1} / ${params.simulations}...`;
                }
            }
            
            // Si la cible n'est jamais atteinte
            if (monthsToTarget.length === sim) {
                monthsToTarget.push(totalMonths + 1);
            }
            
            allSimulations.push(path);
            finalValues.push(portfolio);
            allReturns.push(returns);
            
            // Calculer le maximum drawdown
            const ddInfo = calculateMaxDrawdown(path);
            maxDrawdowns.push(ddInfo.mdd);
        }
        
        return {
            allSimulations,
            finalValues,
            monthsToTarget,
            maxDrawdowns,
            allReturns
        };
    }
    
    /**
     * Simulation Lump Sum
     */
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
            
            const ddInfo = calculateMaxDrawdown(path);
            maxDrawdowns.push(ddInfo.mdd);
        }
        
        return {
            allSimulations,
            finalValues,
            monthsToTarget,
            maxDrawdowns,
            allReturns
        };
    }
    
    /**
     * Simulation avec retrait (retirement)
     */
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
                    // Phase d'accumulation
                    portfolio = portfolio * (1 + randomReturn) + params.monthlyInvestment;
                } else {
                    // Phase de retrait
                    if (month === withdrawalStartMonth) {
                        initialWithdrawalPortfolio = portfolio;
                        monthlyWithdrawal = (initialWithdrawalPortfolio * params.withdrawalRate) / 12;
                    }
                    
                    portfolio = portfolio * (1 + randomReturn) - monthlyWithdrawal;
                    
                    // Vérifier si le portfolio est épuisé
                    if (portfolio <= 0) {
                        portfolio = 0;
                    }
                }
                
                path.push(portfolio);
            }
            
            allSimulations.push(path);
            finalValues.push(portfolio);
            allReturns.push(returns);
            
            depletionCount.push(portfolio <= 0 ? 1 : 0);
            
            const ddInfo = calculateMaxDrawdown(path);
            maxDrawdowns.push(ddInfo.mdd);
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
    
    /**
     * Simulation de comparaison DCA vs Lump Sum
     */
    function executeComparisonSimulation(params, totalMonths, monthlyVolatility) {
        // Exécuter DCA
        const dcaResults = executeDCASimulation(params, totalMonths, monthlyVolatility);
        
        // Exécuter Lump Sum
        const lsResults = executeLumpSumSimulation(params, totalMonths, monthlyVolatility);
        
        return {
            dca: dcaResults,
            lumpsum: lsResults,
            comparison: true
        };
    }
    
    // ========== AFFICHAGE DES RÉSULTATS ==========
    
    function displayResults(results, params) {
        simulationResults = results;
        
        const resultsPanel = document.getElementById('resultsPanel');
        if (resultsPanel) {
            resultsPanel.classList.remove('hidden');
            resultsPanel.scrollIntoView({ behavior: 'smooth' });
        }
        
        if (results.comparison) {
            displayComparisonResults(results, params);
            return;
        }
        
        if (params.strategy === 'withdrawal') {
            displayWithdrawalResults(results, params);
            return;
        }
        
        // Affichage standard
        displayStandardResults(results, params);
    }
    
    function displayStandardResults(results, params) {
        const { allSimulations, finalValues, monthsToTarget, maxDrawdowns, allReturns } = results;
        const totalMonths = params.years * 12;
        
        // Calculer les statistiques principales
        const median = percentile(finalValues, 50);
        const p10 = percentile(finalValues, 10);
        const p90 = percentile(finalValues, 90);
        const best = Math.max(...finalValues);
        const worst = Math.min(...finalValues);
        const avgFinal = finalValues.reduce((a, b) => a + b, 0) / finalValues.length;
        
        // Afficher les statistiques principales
        displayMainStats(median, avgFinal, p10, p90, best, worst, params);
        
        // Afficher les métriques avancées
        displayAdvancedRiskMetrics(finalValues, maxDrawdowns, allReturns, params, totalMonths);
        
        // Créer les graphiques
        createChart1(allSimulations, totalMonths, median, p10, p90, params);
        createChart2(finalValues, params, totalMonths);
        createChart3(finalValues, params.targetValue);
        createDrawdownAnalysis(maxDrawdowns, allSimulations);
        createRiskAnalysis(finalValues, totalMonths, params.monthlyInvestment);
        createTornadoDiagram(params);
        createHeatMap(params);
        createRollingSharpe(allReturns);
        createChart4(allSimulations, totalMonths, params.monthlyInvestment);
        createChart5(monthsToTarget, params.targetValue);
        
        // Afficher le cône de confiance si activé
        if (params.showConfidenceCone) {
            createConfidenceCone(allSimulations, totalMonths);
        }
        
        // Cacher les sections non utilisées
        document.getElementById('strategyComparisonSection').style.display = 'none';
        document.getElementById('withdrawalAnalysisSection').style.display = 'none';
    }
    
    // ========== AFFICHAGE DES RÉSULTATS (SUITE) ==========
    
    /**
     * Affiche les résultats de comparaison DCA vs Lump Sum
     */
    function displayComparisonResults(results, params) {
        const { dca, lumpsum } = results;
        const totalMonths = params.years * 12;
        
        // Statistiques DCA
        const dcaMedian = percentile(dca.finalValues, 50);
        const dcaP10 = percentile(dca.finalValues, 10);
        const dcaP90 = percentile(dca.finalValues, 90);
        
        // Statistiques Lump Sum
        const lsMedian = percentile(lumpsum.finalValues, 50);
        const lsP10 = percentile(lumpsum.finalValues, 10);
        const lsP90 = percentile(lumpsum.finalValues, 90);
        
        // Afficher les stats principales (DCA par défaut)
        displayMainStats(dcaMedian, dca.finalValues.reduce((a,b) => a+b, 0) / dca.finalValues.length, dcaP10, dcaP90, Math.max(...dca.finalValues), Math.min(...dca.finalValues), params);
        
        // Afficher le graphique de comparaison
        const strategySection = document.getElementById('strategyComparisonSection');
        if (strategySection) {
            strategySection.style.display = 'block';
            
            // Calculer les chemins médians
            const dcaMedianPath = [];
            const lsMedianPath = [];
            
            for (let m = 0; m <= totalMonths; m++) {
                const dcaValues = dca.allSimulations.map(sim => sim[m]);
                const lsValues = lumpsum.allSimulations.map(sim => sim[m]);
                dcaMedianPath.push(percentile(dcaValues, 50));
                lsMedianPath.push(percentile(lsValues, 50));
            }
            
            Highcharts.chart('chartStrategyComparison', {
                chart: { type: 'line', backgroundColor: 'transparent', zoomType: 'xy' },
                title: { 
                    text: '💰 DCA vs Lump Sum Strategy Comparison', 
                    style: { color: '#667eea', fontSize: '1.3em', fontWeight: 'bold' } 
                },
                xAxis: { title: { text: 'Months' }, crosshair: true },
                yAxis: { title: { text: 'Portfolio Value (EUR)' } },
                tooltip: { shared: true, valueDecimals: 0, valueSuffix: ' EUR' },
                series: [
                    { 
                        name: 'Dollar-Cost Averaging (DCA)', 
                        data: dcaMedianPath, 
                        color: '#667eea', 
                        lineWidth: 3 
                    },
                    { 
                        name: 'Lump Sum Investment', 
                        data: lsMedianPath, 
                        color: '#f5576c', 
                        lineWidth: 3,
                        dashStyle: 'Dash'
                    }
                ],
                plotOptions: { line: { marker: { enabled: false } } },
                credits: { enabled: false }
            });
            
            // Stats comparatives
            const statsContainer = document.getElementById('strategyComparisonStats');
            if (statsContainer) {
                const dcaWins = dca.finalValues.filter((v, i) => v > lumpsum.finalValues[i]).length;
                const winRate = (dcaWins / dca.finalValues.length * 100).toFixed(1);
                
                statsContainer.innerHTML = `
                    <div class="stat-box">
                        <div class="label">DCA Median Final</div>
                        <div class="value">${window.FinanceDashboard.formatNumber(dcaMedian, 0)} EUR</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">Lump Sum Median Final</div>
                        <div class="value">${window.FinanceDashboard.formatNumber(lsMedian, 0)} EUR</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">DCA Win Rate</div>
                        <div class="value">${winRate}%</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">Median Difference</div>
                        <div class="value">${window.FinanceDashboard.formatNumber(lsMedian - dcaMedian, 0)} EUR</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">DCA Total Invested</div>
                        <div class="value">${window.FinanceDashboard.formatNumber(params.monthlyInvestment * totalMonths, 0)} EUR</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">Lump Sum Invested</div>
                        <div class="value">${window.FinanceDashboard.formatNumber(params.lumpSumAmount, 0)} EUR</div>
                    </div>
                `;
            }
        }
        
        // Créer les autres graphiques (basés sur DCA)
        displayAdvancedRiskMetrics(dca.finalValues, dca.maxDrawdowns, dca.allReturns, params, totalMonths);
        createChart2(dca.finalValues, params, totalMonths);
        createChart3(dca.finalValues, params.targetValue);
        createDrawdownAnalysis(dca.maxDrawdowns, dca.allSimulations);
        createTornadoDiagram(params);
        createHeatMap(params);
        
        // Cacher la section withdrawal
        document.getElementById('withdrawalAnalysisSection').style.display = 'none';
    }
    
    /**
     * Affiche les résultats de simulation avec retrait (retirement)
     */
    function displayWithdrawalResults(results, params) {
        const { allSimulations, finalValues, depletionCount, maxDrawdowns, withdrawalStartMonth } = results;
        const totalMonths = params.years * 12;
        
        // Statistiques
        const median = percentile(finalValues, 50);
        const p10 = percentile(finalValues, 10);
        const p90 = percentile(finalValues, 90);
        const depletionRate = (depletionCount.reduce((a,b) => a+b, 0) / depletionCount.length * 100).toFixed(1);
        
        // Afficher les stats principales
        displayMainStats(median, finalValues.reduce((a,b) => a+b, 0) / finalValues.length, p10, p90, Math.max(...finalValues), Math.min(...finalValues), params);
        
        // Section withdrawal
        const withdrawalSection = document.getElementById('withdrawalAnalysisSection');
        if (withdrawalSection) {
            withdrawalSection.style.display = 'block';
            
            // Calculer les chemins de percentiles
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
                chart: { type: 'area', backgroundColor: 'transparent', zoomType: 'xy' },
                title: { 
                    text: '🏖 Retirement Withdrawal Projection', 
                    style: { color: '#764ba2', fontSize: '1.3em', fontWeight: 'bold' } 
                },
                xAxis: { 
                    title: { text: 'Months' }, 
                    plotLines: [{
                        color: '#f5576c',
                        width: 2,
                        value: withdrawalStartMonth,
                        dashStyle: 'Dash',
                        label: {
                            text: 'Withdrawal Starts',
                            style: { color: '#f5576c', fontWeight: 'bold' }
                        }
                    }]
                },
                yAxis: { title: { text: 'Portfolio Value (EUR)' } },
                tooltip: { shared: true, valueDecimals: 0, valueSuffix: ' EUR' },
                plotOptions: {
                    area: {
                        fillOpacity: 0.3,
                        marker: { enabled: false }
                    }
                },
                series: [
                    { 
                        name: 'P90 (Optimistic)', 
                        data: p90Path, 
                        color: '#43e97b',
                        fillOpacity: 0.1
                    },
                    { 
                        name: 'Median', 
                        data: medianPath, 
                        color: '#667eea',
                        lineWidth: 3
                    },
                    { 
                        name: 'P10 (Pessimistic)', 
                        data: p10Path, 
                        color: '#f5576c',
                        fillOpacity: 0.1
                    }
                ],
                credits: { enabled: false }
            });
            
            // Stats withdrawal
            const statsContainer = document.getElementById('withdrawalStats');
            if (statsContainer) {
                const totalInvested = params.monthlyInvestment * withdrawalStartMonth;
                const portfolioAtWithdrawal = percentile(allSimulations.map(sim => sim[withdrawalStartMonth]), 50);
                const monthlyWithdrawal = (portfolioAtWithdrawal * params.withdrawalRate) / 12;
                
                statsContainer.innerHTML = `
                    <div class="stat-box">
                        <div class="label">Accumulation Period</div>
                        <div class="value">${params.withdrawalStartYear} years</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">Portfolio at Retirement (Median)</div>
                        <div class="value">${window.FinanceDashboard.formatNumber(portfolioAtWithdrawal, 0)} EUR</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">Monthly Withdrawal</div>
                        <div class="value">${window.FinanceDashboard.formatNumber(monthlyWithdrawal, 0)} EUR</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">Annual Withdrawal Rate</div>
                        <div class="value">${(params.withdrawalRate * 100).toFixed(1)}%</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">Depletion Risk</div>
                        <div class="value" style="color: ${parseFloat(depletionRate) > 10 ? '#f5576c' : '#43e97b'}">${depletionRate}%</div>
                    </div>
                    <div class="stat-box">
                        <div class="label">Final Balance (Median)</div>
                        <div class="value">${window.FinanceDashboard.formatNumber(median, 0)} EUR</div>
                    </div>
                `;
            }
        }
        
        // Autres graphiques
        displayAdvancedRiskMetrics(finalValues, maxDrawdowns, results.allReturns, params, totalMonths);
        createChart2(finalValues, params, totalMonths);
        createDrawdownAnalysis(maxDrawdowns, allSimulations);
        
        // Cacher la section comparison
        document.getElementById('strategyComparisonSection').style.display = 'none';
    }
    
    /**
     * Affiche les statistiques principales
     */
    function displayMainStats(median, avgFinal, p10, p90, best, worst, params) {
        const statsContainer = document.getElementById('statsContainer');
        if (!statsContainer) return;
        
        const medianReal = params.showInflation ? adjustForInflationMC(median, params.years * 12, params.inflationRate) : median;
        const avgFinalReal = params.showInflation ? adjustForInflationMC(avgFinal, params.years * 12, params.inflationRate) : avgFinal;
        
        let statsHTML = '';
        
        statsHTML += '<div class="stat-box">';
        statsHTML += '<div class="label">Median (50th Percentile)</div>';
        statsHTML += '<div class="value">' + window.FinanceDashboard.formatNumber(median, 0) + ' EUR</div>';
        if (params.showInflation) {
            statsHTML += '<div style="font-size: 0.9em; color: #9D5CE6; margin-top: 5px;">Real: ' + 
                         window.FinanceDashboard.formatNumber(medianReal, 0) + ' EUR</div>';
        }
        statsHTML += '</div>';
        
        statsHTML += '<div class="stat-box">';
        statsHTML += '<div class="label">Average Final Value</div>';
        statsHTML += '<div class="value">' + window.FinanceDashboard.formatNumber(avgFinal, 0) + ' EUR</div>';
        if (params.showInflation) {
            statsHTML += '<div style="font-size: 0.9em; color: #9D5CE6; margin-top: 5px;">Real: ' + 
                         window.FinanceDashboard.formatNumber(avgFinalReal, 0) + ' EUR</div>';
        }
        statsHTML += '</div>';
        
        statsHTML += '<div class="stat-box">';
        statsHTML += '<div class="label">10th Percentile (Pessimistic)</div>';
        statsHTML += '<div class="value">' + window.FinanceDashboard.formatNumber(p10, 0) + ' EUR</div>';
        statsHTML += '</div>';
        
        statsHTML += '<div class="stat-box">';
        statsHTML += '<div class="label">90th Percentile (Optimistic)</div>';
        statsHTML += '<div class="value">' + window.FinanceDashboard.formatNumber(p90, 0) + ' EUR</div>';
        statsHTML += '</div>';
        
        statsHTML += '<div class="stat-box">';
        statsHTML += '<div class="label">Best Case</div>';
        statsHTML += '<div class="value">' + window.FinanceDashboard.formatNumber(best, 0) + ' EUR</div>';
        statsHTML += '</div>';
        
        statsHTML += '<div class="stat-box">';
        statsHTML += '<div class="label">Worst Case</div>';
        statsHTML += '<div class="value">' + window.FinanceDashboard.formatNumber(worst, 0) + ' EUR</div>';
        statsHTML += '</div>';
        
        statsContainer.innerHTML = statsHTML;
    }
    
    /**
     * Affiche les métriques de risque avancées
     */
    function displayAdvancedRiskMetrics(finalValues, maxDrawdowns, allReturns, params, totalMonths) {
        const container = document.getElementById('advancedRiskMetrics');
        if (!container) return;
        
        // CVaR (Expected Shortfall)
        const var5 = percentile(finalValues, 5);
        const belowVar = finalValues.filter(v => v <= var5);
        const cvar = belowVar.length > 0 ? belowVar.reduce((a,b) => a+b, 0) / belowVar.length : var5;
        
        // Maximum Drawdown stats
        const medianMDD = percentile(maxDrawdowns, 50);
        const worstMDD = Math.max(...maxDrawdowns);
        
        // Calculer les métriques avancées à partir des rendements
        const flatReturns = allReturns.flat();
        const metrics = calculateAdvancedMetrics(flatReturns);
        
        // Calmar Ratio
        const totalInvested = params.monthlyInvestment * totalMonths;
        const annualReturn = ((percentile(finalValues, 50) / totalInvested) - 1) / params.years;
        const calmarRatio = worstMDD !== 0 ? (annualReturn / worstMDD).toFixed(2) : 'N/A';
        
        let html = '';
        
        html += '<div class="stat-box">';
        html += '<div class="label">CVaR (5%)</div>';
        html += '<div class="value">' + window.FinanceDashboard.formatNumber(cvar, 0) + ' EUR</div>';
        html += '<div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">Expected loss in worst 5%</div>';
        html += '</div>';
        
        html += '<div class="stat-box">';
        html += '<div class="label">Median Max Drawdown</div>';
        html += '<div class="value" style="color: #f5576c;">' + (medianMDD * 100).toFixed(1) + '%</div>';
        html += '</div>';
        
        html += '<div class="stat-box">';
        html += '<div class="label">Sharpe Ratio</div>';
        html += '<div class="value">' + metrics.sharpeRatio.toFixed(2) + '</div>';
        html += '<div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">Risk-adjusted return</div>';
        html += '</div>';
        
        html += '<div class="stat-box">';
        html += '<div class="label">Sortino Ratio</div>';
        html += '<div class="value">' + metrics.sortinoRatio.toFixed(2) + '</div>';
        html += '<div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">Downside risk-adjusted</div>';
        html += '</div>';
        
        html += '<div class="stat-box">';
        html += '<div class="label">Calmar Ratio</div>';
        html += '<div class="value">' + calmarRatio + '</div>';
        html += '<div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">Return / Max Drawdown</div>';
        html += '</div>';
        
        html += '<div class="stat-box">';
        html += '<div class="label">Skewness</div>';
        html += '<div class="value" style="color: ' + (metrics.skewness < 0 ? '#f5576c' : '#43e97b') + '">' + metrics.skewness.toFixed(2) + '</div>';
        html += '<div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">Distribution asymmetry</div>';
        html += '</div>';
        
        html += '<div class="stat-box">';
        html += '<div class="label">Kurtosis</div>';
        html += '<div class="value">' + metrics.kurtosis.toFixed(2) + '</div>';
        html += '<div style="font-size: 0.85em; color: var(--text-secondary); margin-top: 5px;">Tail thickness (>3 = fat tails)</div>';
        html += '</div>';
        
        container.innerHTML = html;
    }
    
    // ========== GRAPHIQUES ==========
    
    /**
     * Graphique 1 : Évolution du portefeuille
     */
    function createChart1(allSimulations, totalMonths, median, p10, p90, params) {
        const months = Array.from({length: totalMonths + 1}, (_, i) => i);
        
        // Calculer les chemins de percentiles
        const medianPath = months.map(m => {
            const values = allSimulations.map(sim => sim[m]);
            return percentile(values, 50);
        });
        
        const p10Path = months.map(m => {
            const values = allSimulations.map(sim => sim[m]);
            return percentile(values, 10);
        });
        
        const p90Path = months.map(m => {
            const values = allSimulations.map(sim => sim[m]);
            return percentile(values, 90);
        });
        
        const p25Path = months.map(m => {
            const values = allSimulations.map(sim => sim[m]);
            return percentile(values, 25);
        });
        
        const p75Path = months.map(m => {
            const values = allSimulations.map(sim => sim[m]);
            return percentile(values, 75);
        });
        
        const series = [
            { 
                name: 'P90 (Optimistic)', 
                data: p90Path, 
                color: '#43e97b', 
                lineWidth: 2, 
                dashStyle: 'Dash' 
            },
            { 
                name: 'P75', 
                data: p75Path, 
                color: '#6C8BE0', 
                lineWidth: 1.5, 
                dashStyle: 'ShortDot' 
            },
            { 
                name: 'Median', 
                data: medianPath, 
                color: '#667eea', 
                lineWidth: 4 
            },
            { 
                name: 'P25', 
                data: p25Path, 
                color: '#9D5CE6', 
                lineWidth: 1.5, 
                dashStyle: 'ShortDot' 
            },
            { 
                name: 'P10 (Pessimistic)', 
                data: p10Path, 
                color: '#f5576c', 
                lineWidth: 2, 
                dashStyle: 'Dash' 
            }
        ];
        
        // Ajouter le chemin ajusté pour l'inflation si nécessaire
        if (params.showInflation) {
            const medianPathReal = months.map(m => {
                const values = allSimulations.map(sim => sim[m]);
                const nominalValue = percentile(values, 50);
                return adjustForInflationMC(nominalValue, m, params.inflationRate);
            });
            series.push({ 
                name: 'Median (Real)', 
                data: medianPathReal, 
                color: '#f6d365', 
                lineWidth: 3, 
                dashStyle: 'ShortDot' 
            });
        }
        
        // Ajouter quelques simulations en arrière-plan
        const samplePaths = [];
        const sampleCount = Math.min(30, allSimulations.length);
        const step = Math.floor(allSimulations.length / sampleCount);
        
        for (let i = 0; i < allSimulations.length; i += step) {
            if (samplePaths.length >= sampleCount) break;
            samplePaths.push({ 
                name: 'Simulation', 
                data: allSimulations[i], 
                color: 'rgba(102, 126, 234, 0.08)', 
                lineWidth: 1, 
                enableMouseTracking: false, 
                showInLegend: false 
            });
        }
        
        Highcharts.chart('chart1', {
            chart: { 
                type: 'line', 
                backgroundColor: 'transparent', 
                zoomType: 'xy' 
            },
            title: { 
                text: params.showInflation ? `📊 Portfolio Evolution (Inflation: ${params.inflationRate}% annual)` : '📊 Portfolio Evolution Over Time', 
                style: { color: '#667eea', fontSize: '1.3em', fontWeight: 'bold' } 
            },
            xAxis: { 
                title: { text: 'Months', style: { color: '#667eea', fontWeight: 'bold' } }, 
                crosshair: true 
            },
            yAxis: { 
                title: { text: 'Portfolio Value (EUR)', style: { color: '#667eea', fontWeight: 'bold' } } 
            },
            tooltip: { 
                shared: true, 
                valueDecimals: 0, 
                valueSuffix: ' EUR' 
            },
            series: [...samplePaths, ...series],
            plotOptions: { 
                line: { marker: { enabled: false } } 
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique 2 : Distribution des rendements finaux
     */
    function createChart2(finalValues, params, totalMonths) {
        const finalValuesReal = params.showInflation ? 
            finalValues.map(v => adjustForInflationMC(v, totalMonths, params.inflationRate)) : 
            finalValues;
        
        const dataToDisplay = params.showInflation ? finalValuesReal : finalValues;
        
        // Créer l'histogramme
        const min = Math.min(...dataToDisplay);
        const max = Math.max(...dataToDisplay);
        const binWidth = (max - min) / 40;
        const bins = Array.from({length: 40}, (_, i) => ({ 
            x: min + i * binWidth, 
            y: 0,
            x2: min + (i + 1) * binWidth
        }));
        
        dataToDisplay.forEach(val => {
            const binIndex = Math.min(Math.floor((val - min) / binWidth), 39);
            bins[binIndex].y++;
        });
        
        Highcharts.chart('chart2', {
            chart: { 
                type: 'column', 
                backgroundColor: 'transparent' 
            },
            title: { 
                text: params.showInflation ? '📈 Distribution of Final Returns (Real)' : '📈 Distribution of Final Returns (Nominal)', 
                style: { color: params.showInflation ? '#f6d365' : '#667eea', fontSize: '1.2em', fontWeight: 'bold' } 
            },
            xAxis: { 
                title: { text: 'Final Portfolio Value (EUR)', style: { color: '#667eea', fontWeight: 'bold' } }, 
                labels: { 
                    formatter: function() { 
                        return window.FinanceDashboard.formatNumber(this.value, 0); 
                    } 
                } 
            },
            yAxis: { 
                title: { text: 'Frequency', style: { color: '#667eea', fontWeight: 'bold' } } 
            },
            tooltip: { 
                pointFormat: 'Range: <b>{point.x:,.0f} - {point.x2:,.0f} EUR</b><br/>Frequency: <b>{point.y}</b>' 
            },
            series: [{ 
                name: 'Distribution', 
                data: bins, 
                color: params.showInflation ? '#f6d365' : '#667eea', 
                borderRadius: 5,
                borderWidth: 0
            }],
            legend: { enabled: false },
            plotOptions: {
                column: {
                    pointPadding: 0,
                    groupPadding: 0,
                    borderWidth: 0
                }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique 3 : Analyse de probabilité
     */
    function createChart3(finalValues, targetValue) {
        const aboveTarget = finalValues.filter(v => v >= targetValue).length;
        const successRate = (aboveTarget / finalValues.length * 100).toFixed(1);
        
        Highcharts.chart('chart3', {
            chart: { 
                type: 'pie', 
                backgroundColor: 'transparent' 
            },
            title: { 
                text: `🎯 Success Rate: ${successRate}%`, 
                style: { color: '#667eea', fontWeight: 'bold', fontSize: '1.3em' } 
            },
            subtitle: {
                text: `Target: ${window.FinanceDashboard.formatNumber(targetValue, 0)} EUR`,
                style: { color: '#764ba2', fontSize: '1em' }
            },
            tooltip: { 
                pointFormat: '<b>{point.name}</b>: {point.percentage:.1f}% ({point.y} simulations)' 
            },
            plotOptions: { 
                pie: { 
                    innerSize: '65%', 
                    dataLabels: { 
                        format: '<b>{point.name}</b><br/>{point.percentage:.1f}%', 
                        style: { 
                            color: 'var(--text-primary)', 
                            fontSize: '13px',
                            fontWeight: 'bold'
                        },
                        distance: 15
                    }, 
                    borderWidth: 4, 
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                } 
            },
            series: [{ 
                name: 'Probability', 
                data: [
                    { 
                        name: 'Above Target ✓', 
                        y: aboveTarget, 
                        color: '#43e97b',
                        sliced: true
                    },
                    { 
                        name: 'Below Target', 
                        y: finalValues.length - aboveTarget, 
                        color: '#f5576c' 
                    }
                ] 
            }],
            credits: { enabled: false }
        });
    }
    
    /**
     * Analyse du Maximum Drawdown
     */
    function createDrawdownAnalysis(maxDrawdowns, allSimulations) {
        const container = document.getElementById('drawdownStats');
        if (!container) return;
        
        const medianMDD = percentile(maxDrawdowns, 50);
        const p10MDD = percentile(maxDrawdowns, 10);
        const p90MDD = percentile(maxDrawdowns, 90);
        const worstMDD = Math.max(...maxDrawdowns);
        const avgMDD = maxDrawdowns.reduce((a,b) => a+b, 0) / maxDrawdowns.length;
        
        // Calculer le temps de récupération moyen
        let avgRecoveryTime = 0;
        let recoveryCount = 0;
        
        allSimulations.forEach(path => {
            const ddInfo = calculateMaxDrawdown(path);
            if (ddInfo.troughIndex < path.length - 1) {
                const peak = path[ddInfo.peakIndex];
                for (let i = ddInfo.troughIndex + 1; i < path.length; i++) {
                    if (path[i] >= peak) {
                        avgRecoveryTime += (i - ddInfo.troughIndex);
                        recoveryCount++;
                        break;
                    }
                }
            }
        });
        
        avgRecoveryTime = recoveryCount > 0 ? avgRecoveryTime / recoveryCount : 0;
        
        container.innerHTML = `
            <div class="stat-box">
                <div class="label">Median Max Drawdown</div>
                <div class="value" style="color: #f5576c;">${(medianMDD * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-box">
                <div class="label">Average Max Drawdown</div>
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
            <div class="stat-box">
                <div class="label">Maximum Observed Drawdown</div>
                <div class="value" style="color: #f5576c;">${(worstMDD * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-box">
                <div class="label">Avg Recovery Time</div>
                <div class="value">${avgRecoveryTime.toFixed(1)} months</div>
            </div>
        `;
        
        // Créer l'histogramme des drawdowns
        const min = Math.min(...maxDrawdowns);
        const max = Math.max(...maxDrawdowns);
        const binWidth = (max - min) / 30;
        const bins = [];
        
        for (let i = 0; i < 30; i++) {
            bins.push({ x: (min + i * binWidth) * 100, y: 0 });
        }
        
        maxDrawdowns.forEach(dd => {
            const binIndex = Math.min(Math.floor((dd - min) / binWidth), 29);
            bins[binIndex].y++;
        });
        
        Highcharts.chart('chartDrawdown', {
            chart: { type: 'column', backgroundColor: 'transparent' },
            title: { 
                text: '📉 Maximum Drawdown Distribution', 
                style: { color: '#f5576c', fontSize: '1.2em', fontWeight: 'bold' } 
            },
            xAxis: { 
                title: { text: 'Maximum Drawdown (%)', style: { fontWeight: 'bold' } },
                labels: {
                    formatter: function() {
                        return this.value.toFixed(1) + '%';
                    }
                }
            },
            yAxis: { title: { text: 'Frequency', style: { fontWeight: 'bold' } } },
            tooltip: { 
                pointFormat: 'Drawdown: <b>{point.x:.1f}%</b><br/>Frequency: <b>{point.y}</b>' 
            },
            series: [{ 
                name: 'Distribution', 
                data: bins, 
                color: '#f5576c',
                borderRadius: 5
            }],
            legend: { enabled: false },
            plotOptions: {
                column: {
                    pointPadding: 0.05,
                    groupPadding: 0.05
                }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Analyse de risque classique
     */
    function createRiskAnalysis(finalValues, totalMonths, monthlyInvestment) {
        const totalInvested = monthlyInvestment * totalMonths;
        const losses = finalValues.filter(v => v < totalInvested).length;
        const lossRate = (losses / finalValues.length * 100).toFixed(1);
        const avgReturn = ((finalValues.reduce((a, b) => a + b, 0) / finalValues.length - totalInvested) / totalInvested * 100).toFixed(1);
        const medianReturn = ((percentile(finalValues, 50) - totalInvested) / totalInvested * 100).toFixed(1);
        const valueAtRisk5 = percentile(finalValues, 5);
        const var5Return = ((valueAtRisk5 - totalInvested) / totalInvested * 100).toFixed(1);
        
        const riskHTML = `
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
                <div class='value'>${window.FinanceDashboard.formatNumber(valueAtRisk5, 0)} EUR</div>
            </div>
            <div class='stat-box'>
                <div class='label'>VaR Return (5%)</div>
                <div class='value' style='color: ${parseFloat(var5Return) >= 0 ? "#43e97b" : "#f5576c"}'>${var5Return}%</div>
            </div>
        `;
        
        const container = document.getElementById('riskAnalysis');
        if (container) container.innerHTML = riskHTML;
    }
    
    /**
     * Tornado Diagram - Analyse de sensibilité
     */
    function createTornadoDiagram(params) {
        const baseParams = {...params};
        const baseMedian = percentile(executeDCASimulation(baseParams, baseParams.years * 12, baseParams.volatility / Math.sqrt(12)).finalValues, 50);
        
        const sensitivity = [];
        const parameterNames = {
            monthlyInvestment: 'Monthly Investment',
            monthlyYield: 'Expected Yield',
            volatility: 'Volatility',
            years: 'Time Horizon'
        };
        
        // Tester chaque paramètre
        for (const [paramName, displayName] of Object.entries(parameterNames)) {
            // +10%
            const paramsPlus = {...baseParams};
            if (paramName === 'monthlyYield' || paramName === 'volatility') {
                paramsPlus[paramName] = baseParams[paramName] * 1.1;
            } else {
                paramsPlus[paramName] = Math.round(baseParams[paramName] * 1.1);
            }
            const medianPlus = percentile(executeDCASimulation(paramsPlus, paramsPlus.years * 12, paramsPlus.volatility / Math.sqrt(12)).finalValues, 50);
            
            // -10%
            const paramsMinus = {...baseParams};
            if (paramName === 'monthlyYield' || paramName === 'volatility') {
                paramsMinus[paramName] = baseParams[paramName] * 0.9;
            } else {
                paramsMinus[paramName] = Math.max(1, Math.round(baseParams[paramName] * 0.9));
            }
            const medianMinus = percentile(executeDCASimulation(paramsMinus, paramsMinus.years * 12, paramsMinus.volatility / Math.sqrt(12)).finalValues, 50);
            
            const impact = Math.abs(medianPlus - medianMinus);
            sensitivity.push({
                name: displayName,
                low: medianMinus - baseMedian,
                high: medianPlus - baseMedian,
                impact: impact
            });
        }
        
        // Trier par impact
        sensitivity.sort((a, b) => b.impact - a.impact);
        
        const categories = sensitivity.map(s => s.name);
        const lowData = sensitivity.map(s => s.low);
        const highData = sensitivity.map(s => s.high);
        
        Highcharts.chart('chartTornado', {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent'
            },
            title: {
                text: '🌪 Sensitivity Analysis (±10% Parameter Change)',
                style: { color: '#667eea', fontSize: '1.2em', fontWeight: 'bold' }
            },
            subtitle: {
                text: 'Impact on Median Final Portfolio Value',
                style: { color: '#764ba2' }
            },
            xAxis: [{
                categories: categories,
                reversed: false,
                labels: {
                    step: 1,
                    style: { fontWeight: 'bold' }
                }
            }, {
                opposite: true,
                reversed: false,
                categories: categories,
                linkedTo: 0,
                labels: { step: 1 }
            }],
            yAxis: {
                title: { text: 'Impact (EUR)', style: { fontWeight: 'bold' } },
                labels: {
                    formatter: function() {
                        return window.FinanceDashboard.formatNumber(Math.abs(this.value), 0);
                    }
                }
            },
            plotOptions: {
                series: {
                    stacking: 'normal',
                    borderRadius: 5
                }
            },
            tooltip: {
                formatter: function() {
                    return '<b>' + this.series.name + '</b><br/>' +
                           this.point.category + ': ' + window.FinanceDashboard.formatNumber(Math.abs(this.y), 0) + ' EUR';
                }
            },
            series: [{
                name: 'Decrease (-10%)',
                data: lowData,
                color: '#f5576c'
            }, {
                name: 'Increase (+10%)',
                data: highData,
                color: '#43e97b'
            }],
            credits: { enabled: false }
        });
    }
    
    /**
     * Heat Map 2D - Rendement vs Volatilité
     */
    function createHeatMap(params) {
        const yields = [0.3, 0.5, 0.67, 0.83, 1.0, 1.2];
        const volatilities = [5, 10, 15, 20, 25, 30];
        const data = [];
        
        for (let i = 0; i < yields.length; i++) {
            for (let j = 0; j < volatilities.length; j++) {
                const testParams = {
                    ...params,
                    monthlyYield: yields[i] / 100,
                    volatility: volatilities[j] / 100,
                    simulations: 500 // Réduit pour la vitesse
                };
                
                const results = executeDCASimulation(testParams, testParams.years * 12, testParams.volatility / Math.sqrt(12));
                const median = percentile(results.finalValues, 50);
                
                data.push([i, j, median]);
            }
        }
        
        Highcharts.chart('chartHeatMap', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent'
            },
            title: {
                text: '🌡 2D Parameter Heat Map',
                style: { color: '#667eea', fontSize: '1.2em', fontWeight: 'bold' }
            },
            subtitle: {
                text: 'Median Portfolio Value by Expected Return & Volatility',
                style: { color: '#764ba2' }
            },
            xAxis: {
                categories: yields.map(y => (y * 12).toFixed(1) + '% annual'),
                title: { text: 'Expected Annual Return', style: { fontWeight: 'bold' } }
            },
            yAxis: {
                categories: volatilities.map(v => v + '%'),
                title: { text: 'Annual Volatility', style: { fontWeight: 'bold' } }
            },
            colorAxis: {
                min: Math.min(...data.map(d => d[2])),
                max: Math.max(...data.map(d => d[2])),
                stops: [
                    [0, '#f5576c'],
                    [0.25, '#f6d365'],
                    [0.5, '#f093fb'],
                    [0.75, '#667eea'],
                    [1, '#43e97b']
                ]
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 280
            },
            tooltip: {
                formatter: function() {
                    return '<b>Median Portfolio:</b> ' + window.FinanceDashboard.formatNumber(this.point.value, 0) + ' EUR<br/>' +
                           '<b>Return:</b> ' + this.series.xAxis.categories[this.point.x] + '<br/>' +
                           '<b>Volatility:</b> ' + this.series.yAxis.categories[this.point.y];
                }
            },
            series: [{
                name: 'Portfolio Value',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                data: data,
                dataLabels: {
                    enabled: true,
                    color: '#ffffff',
                    formatter: function() {
                        return window.FinanceDashboard.formatNumber(this.point.value / 1000, 0) + 'k';
                    },
                    style: {
                        textOutline: '2px contrast',
                        fontSize: '10px',
                        fontWeight: 'bold'
                    }
                }
            }],
            credits: { enabled: false }
        });
    }
    
    /**
     * Confidence Cone (Fan Chart)
     */
    function createConfidenceCone(allSimulations, totalMonths) {
        const section = document.getElementById('confidenceConeSection');
        if (!section) return;
        
        section.style.display = 'block';
        
        const months = Array.from({length: totalMonths + 1}, (_, i) => i);
        
        // Calculer les percentiles pour chaque mois
        const percentiles = [5, 10, 25, 50, 75, 90, 95];
        const series = [];
        
        // Créer les aires de confidence
        const areas = [
            { low: 5, high: 95, color: 'rgba(102, 126, 234, 0.1)', name: '90% Confidence' },
            { low: 10, high: 90, color: 'rgba(102, 126, 234, 0.2)', name: '80% Confidence' },
            { low: 25, high: 75, color: 'rgba(102, 126, 234, 0.3)', name: '50% Confidence' }
        ];
        
        areas.forEach(area => {
            const lowData = months.map(m => {
                const values = allSimulations.map(sim => sim[m]);
                return percentile(values, area.low);
            });
            
            const highData = months.map(m => {
                const values = allSimulations.map(sim => sim[m]);
                return percentile(values, area.high);
            });
            
            series.push({
                name: area.name,
                data: lowData.map((val, i) => [i, val, highData[i]]),
                type: 'arearange',
                lineWidth: 0,
                color: area.color,
                fillOpacity: 0.5,
                zIndex: 0,
                marker: { enabled: false }
            });
        });
        
        // Ajouter la médiane
        const medianPath = months.map(m => {
            const values = allSimulations.map(sim => sim[m]);
            return percentile(values, 50);
        });
        
        series.push({
            name: 'Median',
            data: medianPath,
            type: 'line',
            color: '#667eea',
            lineWidth: 4,
            zIndex: 1,
            marker: { enabled: false }
        });
        
        Highcharts.chart('chartConfidenceCone', {
            chart: {
                backgroundColor: 'transparent',
                zoomType: 'xy'
            },
            title: {
                text: '📊 Confidence Cone Projection',
                style: { color: '#667eea', fontSize: '1.3em', fontWeight: 'bold' }
            },
            subtitle: {
                text: 'Fan chart showing probability bands',
                style: { color: '#764ba2' }
            },
            xAxis: {
                title: { text: 'Months', style: { fontWeight: 'bold' } }
            },
            yAxis: {
                title: { text: 'Portfolio Value (EUR)', style: { fontWeight: 'bold' } }
            },
            tooltip: {
                crosshairs: true,
                shared: true,
                valueDecimals: 0,
                valueSuffix: ' EUR'
            },
            series: series,
            credits: { enabled: false }
        });
    }
    
    /**
     * Rolling Sharpe Ratio (fenêtre glissante 12 mois)
     */
    function createRollingSharpe(allReturns) {
        if (!allReturns || allReturns.length === 0) return;
        
        const windowSize = 12;
        const rollingSharpes = [];
        
        // Calculer pour chaque simulation
        allReturns.forEach(returns => {
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
        
        // Calculer les percentiles
        const months = [];
        const medianSharpes = [];
        const p10Sharpes = [];
        const p90Sharpes = [];
        
        if (rollingSharpes.length > 0 && rollingSharpes[0].length > 0) {
            for (let i = 0; i < rollingSharpes[0].length; i++) {
                const sharpes = rollingSharpes.map(sim => sim[i]);
                months.push(i + windowSize);
                medianSharpes.push(percentile(sharpes, 50));
                p10Sharpes.push(percentile(sharpes, 10));
                p90Sharpes.push(percentile(sharpes, 90));
            }
        }
        
        Highcharts.chart('chartRollingSharpe', {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                zoomType: 'xy'
            },
            title: {
                text: '📈 Rolling Sharpe Ratio (12-Month Window)',
                style: { color: '#667eea', fontSize: '1.2em', fontWeight: 'bold' }
            },
            subtitle: {
                text: 'Risk-adjusted performance over time',
                style: { color: '#764ba2' }
            },
            xAxis: {
                title: { text: 'Months', style: { fontWeight: 'bold' } },
                categories: months
            },
            yAxis: {
                title: { text: 'Sharpe Ratio', style: { fontWeight: 'bold' } },
                plotLines: [{
                    value: 0,
                    color: '#f5576c',
                    width: 2,
                    dashStyle: 'Dash',
                    label: {
                        text: 'Zero',
                        style: { color: '#f5576c' }
                    }
                }]
            },
            tooltip: {
                shared: true,
                valueDecimals: 2
            },
            series: [
                {
                    name: 'P90',
                    data: p90Sharpes,
                    color: '#43e97b',
                    lineWidth: 1.5,
                    dashStyle: 'ShortDot'
                },
                {
                    name: 'Median',
                    data: medianSharpes,
                    color: '#667eea',
                    lineWidth: 3
                },
                {
                    name: 'P10',
                    data: p10Sharpes,
                    color: '#f5576c',
                    lineWidth: 1.5,
                    dashStyle: 'ShortDot'
                }
            ],
            plotOptions: {
                line: { marker: { enabled: false } }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique 4 : Stress Testing
     */
    function createChart4(allSimulations, totalMonths, monthlyInvestment) {
        const scenarios = [
            { name: 'Financial Crisis (-40%)', shock: -0.40, color: '#8b0000' },
            { name: 'Severe Recession (-30%)', shock: -0.30, color: '#f5576c' },
            { name: 'Moderate Recession (-20%)', shock: -0.20, color: '#ff6b6b' },
            { name: 'Market Correction (-10%)', shock: -0.10, color: '#ffa500' },
            { name: 'Normal Conditions (0%)', shock: 0, color: '#667eea' },
            { name: 'Modest Growth (+10%)', shock: 0.10, color: '#90ee90' },
            { name: 'Bull Market (+20%)', shock: 0.20, color: '#43e97b' }
        ];
        
        const categories = scenarios.map(s => s.name);
        const data = scenarios.map((scenario, index) => {
            const stressedValues = allSimulations.map(sim => sim[totalMonths] * (1 + scenario.shock));
            return {
                y: percentile(stressedValues, 50),
                color: scenario.color
            };
        });
        
        Highcharts.chart('chart4', {
            chart: { 
                type: 'column', 
                backgroundColor: 'transparent' 
            },
            title: { 
                text: '⚡ Stress Testing Scenarios', 
                style: { color: '#667eea', fontWeight: 'bold', fontSize: '1.3em' } 
            },
            subtitle: {
                text: 'Portfolio value under different market conditions',
                style: { color: '#764ba2' }
            },
            xAxis: { 
                categories: categories, 
                labels: { 
                    rotation: -25, 
                    style: { fontSize: '10px', fontWeight: 'bold' } 
                } 
            },
            yAxis: { 
                title: { text: 'Median Portfolio Value (EUR)', style: { fontWeight: 'bold' } } 
            },
            tooltip: { 
                valueDecimals: 0, 
                valueSuffix: ' EUR' 
            },
            series: [{ 
                name: 'Median Value', 
                data: data,
                borderRadius: 5,
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return window.FinanceDashboard.formatNumber(this.y / 1000, 0) + 'k';
                    },
                    style: {
                        fontSize: '10px',
                        fontWeight: 'bold'
                    }
                }
            }],
            plotOptions: { 
                column: { 
                    colorByPoint: true
                } 
            },
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique 5 : Temps pour atteindre la cible
     */
    function createChart5(monthsToTarget, targetValue) {
        if (!monthsToTarget || monthsToTarget.length === 0) return;
        
        const validMonths = monthsToTarget.filter(m => m < 1000);
        
        if (validMonths.length === 0) {
            document.getElementById('chart5').innerHTML = '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">Target not reached in any simulation</p>';
            return;
        }
        
        const min = Math.min(...validMonths);
        const max = Math.max(...validMonths);
        const binWidth = Math.max(1, Math.ceil((max - min) / 25));
        const bins = [];
        
        for (let i = min; i <= max; i += binWidth) {
            bins.push({ x: i, y: 0 });
        }
        
        validMonths.forEach(m => {
            const binIndex = Math.min(Math.floor((m - min) / binWidth), bins.length - 1);
            if (bins[binIndex]) bins[binIndex].y++;
        });
        
        const medianTime = percentile(validMonths, 50);
        const p10Time = percentile(validMonths, 10);
        const p90Time = percentile(validMonths, 90);
        const successRate = (validMonths.length / monthsToTarget.length * 100).toFixed(1);
        
        Highcharts.chart('chart5', {
            chart: { 
                type: 'column', 
                backgroundColor: 'transparent' 
            },
            title: { 
                text: `⏱ Time to Reach ${window.FinanceDashboard.formatNumber(targetValue, 0)} EUR`, 
                style: { color: '#667eea', fontSize: '1.3em', fontWeight: 'bold' } 
            },
            subtitle: { 
                text: `Success Rate: ${successRate}% | Median: ${medianTime.toFixed(0)} months (${(medianTime/12).toFixed(1)} years) | P10: ${p10Time.toFixed(0)} | P90: ${p90Time.toFixed(0)}`, 
                style: { color: '#764ba2', fontWeight: 'bold' } 
            },
            xAxis: { 
                title: { text: 'Months to Target', style: { fontWeight: 'bold' } },
                plotLines: [
                    {
                        color: '#667eea',
                        width: 3,
                        value: medianTime,
                        dashStyle: 'Dash',
                        label: {
                            text: 'Median',
                            style: { color: '#667eea', fontWeight: 'bold' }
                        }
                    }
                ]
            },
            yAxis: { 
                title: { text: 'Frequency', style: { fontWeight: 'bold' } } 
            },
            tooltip: { 
                pointFormat: 'Months: <b>{point.x}</b><br/>Frequency: <b>{point.y}</b>' 
            },
            series: [{ 
                name: 'Distribution', 
                data: bins, 
                color: '#667eea',
                borderRadius: 5
            }],
            plotOptions: { 
                column: { 
                    pointPlacement: 'on',
                    pointPadding: 0.05,
                    groupPadding: 0.05
                } 
            },
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    // ========== EXPORT PDF ==========
    
    function exportPDF() {
        window.FinanceDashboard.showNotification('Generating PDF report...', 'info');
        
        setTimeout(() => {
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                
                // Page 1 - Cover
                doc.setFillColor(102, 126, 234);
                doc.rect(0, 0, 210, 297, 'F');
                
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(36);
                doc.setFont(undefined, 'bold');
                doc.text('AlphaVault AI', 105, 100, { align: 'center' });
                
                doc.setFontSize(24);
                doc.text('Monte Carlo Simulation Report', 105, 120, { align: 'center' });
                
                doc.setFontSize(14);
                doc.text(new Date().toLocaleDateString(), 105, 140, { align: 'center' });
                
                // Page 2 - Summary
                doc.addPage();
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(20);
                doc.text('Executive Summary', 20, 20);
                
                doc.setFontSize(12);
                doc.setFont(undefined, 'normal');
                
                const params = getSimulationParams();
                let yPos = 40;
                
                doc.text(`Simulation Parameters:`, 20, yPos);
                yPos += 10;
                doc.text(`• Monthly Investment: ${params.monthlyInvestment} EUR`, 30, yPos);
                yPos += 7;
                doc.text(`• Expected Monthly Yield: ${(params.monthlyYield * 100).toFixed(2)}%`, 30, yPos);
                yPos += 7;
                doc.text(`• Annual Volatility: ${(params.volatility * 100).toFixed(1)}%`, 30, yPos);
                yPos += 7;
                doc.text(`• Time Horizon: ${params.years} years`, 30, yPos);
                yPos += 7;
                doc.text(`• Number of Simulations: ${params.simulations}`, 30, yPos);
                yPos += 7;
                doc.text(`• Distribution Model: ${params.distribution}`, 30, yPos);
                yPos += 7;
                doc.text(`• Strategy: ${params.strategy}`, 30, yPos);
                
                yPos += 15;
                doc.setFont(undefined, 'bold');
                doc.text(`Key Results:`, 20, yPos);
                doc.setFont(undefined, 'normal');
                yPos += 10;
                
                if (simulationResults && simulationResults.finalValues) {
                    const median = percentile(simulationResults.finalValues, 50);
                    const p10 = percentile(simulationResults.finalValues, 10);
                    const p90 = percentile(simulationResults.finalValues, 90);
                    
                    doc.text(`• Median Final Value: ${window.FinanceDashboard.formatNumber(median, 0)} EUR`, 30, yPos);
                    yPos += 7;
                    doc.text(`• 10th Percentile: ${window.FinanceDashboard.formatNumber(p10, 0)} EUR`, 30, yPos);
                    yPos += 7;
                    doc.text(`• 90th Percentile: ${window.FinanceDashboard.formatNumber(p90, 0)} EUR`, 30, yPos);
                }
                
                // Footer
                doc.setFontSize(10);
                doc.setTextColor(128, 128, 128);
                doc.text('Generated by AlphaVault AI - Professional Monte Carlo Analytics', 105, 280, { align: 'center' });
                doc.text('© 2025 AlphaVault AI. All rights reserved.', 105, 287, { align: 'center' });
                
                // Page 3 - Disclaimer
                doc.addPage();
                doc.setTextColor(0, 0, 0);
                doc.setFontSize(20);
                doc.text('Important Disclaimer', 20, 20);
                
                doc.setFontSize(11);
                doc.setFont(undefined, 'normal');
                const disclaimer = `
This Monte Carlo simulation is provided for informational and educational purposes only. 
It does not constitute financial advice, investment recommendations, or a guarantee of future results.

Key Points to Consider:

• Past performance does not guarantee future results
• Simulations are based on statistical models and assumptions that may not reflect actual market conditions
• Actual investment returns may vary significantly from simulated outcomes
• Markets can behave in ways not captured by historical data or statistical models
• This analysis does not account for taxes, fees, or transaction costs
• Consult with a qualified financial advisor before making investment decisions

Methodology:

This simulation uses advanced stochastic modeling techniques including:
- Monte Carlo random sampling
- Multiple probability distributions (Normal, Student-t, Jump Diffusion, Regime Switching)
- Time-varying volatility (GARCH) when enabled
- Professional risk metrics (VaR, CVaR, Sharpe Ratio, Sortino Ratio, Maximum Drawdown)

The results represent statistical probabilities based on the input parameters and should be 
interpreted as one of many possible tools for financial planning.
                `.trim();
                
                const lines = doc.splitTextToSize(disclaimer, 170);
                doc.text(lines, 20, 40);
                
                // Sauvegarder
                doc.save('Monte_Carlo_Report_' + new Date().toISOString().split('T')[0] + '.pdf');
                
                window.FinanceDashboard.showNotification('PDF report generated successfully!', 'success');
            } catch (error) {
                console.error('PDF generation error:', error);
                window.FinanceDashboard.showNotification('PDF generation failed: ' + error.message, 'error');
            }
        }, 500);
    }
    
    // ========== EXPORT CSV ==========
    
    function exportExcel() {
        if (!simulationResults) {
            window.FinanceDashboard.showNotification('No simulation results to export!', 'warning');
            return;
        }
        
        try {
            let csv = 'Monte Carlo Simulation Results\n';
            csv += 'Generated: ' + new Date().toLocaleString() + '\n\n';
            
            // Parameters
            const params = getSimulationParams();
            csv += 'PARAMETERS\n';
            csv += 'Monthly Investment (EUR),' + params.monthlyInvestment + '\n';
            csv += 'Expected Monthly Yield (%),' + (params.monthlyYield * 100).toFixed(2) + '\n';
            csv += 'Annual Volatility (%),' + (params.volatility * 100).toFixed(1) + '\n';
            csv += 'Time Horizon (years),' + params.years + '\n';
            csv += 'Number of Simulations,' + params.simulations + '\n';
            csv += 'Distribution Model,' + params.distribution + '\n';
            csv += 'Strategy,' + params.strategy + '\n\n';
            
            // Statistics
            csv += 'FINAL VALUE STATISTICS\n';
            csv += 'Metric,Value (EUR)\n';
            csv += 'Median,' + percentile(simulationResults.finalValues, 50).toFixed(2) + '\n';
            csv += 'Mean,' + (simulationResults.finalValues.reduce((a,b) => a+b, 0) / simulationResults.finalValues.length).toFixed(2) + '\n';
            csv += 'P10,' + percentile(simulationResults.finalValues, 10).toFixed(2) + '\n';
            csv += 'P25,' + percentile(simulationResults.finalValues, 25).toFixed(2) + '\n';
            csv += 'P75,' + percentile(simulationResults.finalValues, 75).toFixed(2) + '\n';
            csv += 'P90,' + percentile(simulationResults.finalValues, 90).toFixed(2) + '\n';
            csv += 'Minimum,' + Math.min(...simulationResults.finalValues).toFixed(2) + '\n';
            csv += 'Maximum,' + Math.max(...simulationResults.finalValues).toFixed(2) + '\n\n';
            
            // All simulations data
            csv += 'SIMULATION RESULTS (First 100 simulations)\n';
            csv += 'Simulation,Final Value (EUR)\n';
            
            for (let i = 0; i < Math.min(100, simulationResults.finalValues.length); i++) {
                csv += (i + 1) + ',' + simulationResults.finalValues[i].toFixed(2) + '\n';
            }
            
            // Download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'Monte_Carlo_Data_' + new Date().toISOString().split('T')[0] + '.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            window.FinanceDashboard.showNotification('CSV data exported successfully!', 'success');
        } catch (error) {
            console.error('CSV export error:', error);
            window.FinanceDashboard.showNotification('CSV export failed: ' + error.message, 'error');
        }
    }
    
    // ========== SHARE RESULTS ==========
    
    function shareResults() {
        if (!simulationResults) {
            window.FinanceDashboard.showNotification('No simulation results to share!', 'warning');
            return;
        }
        
        const params = getSimulationParams();
        const median = percentile(simulationResults.finalValues, 50);
        
        const shareText = `🎲 Monte Carlo Simulation Results\n\n` +
            `📊 Parameters:\n` +
            `• Monthly Investment: ${params.monthlyInvestment} EUR\n` +
            `• Expected Yield: ${(params.monthlyYield * 100).toFixed(2)}%/month\n` +
            `• Volatility: ${(params.volatility * 100).toFixed(1)}%\n` +
            `• Time Horizon: ${params.years} years\n\n` +
            `💰 Median Final Value: ${window.FinanceDashboard.formatNumber(median, 0)} EUR\n\n` +
            `Generated by AlphaVault AI`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Monte Carlo Simulation Results',
                text: shareText
            }).then(() => {
                window.FinanceDashboard.showNotification('Results shared successfully!', 'success');
            }).catch(() => {
                copyToClipboard(shareText);
            });
        } else {
            copyToClipboard(shareText);
        }
    }
    
    function copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        window.FinanceDashboard.showNotification('Results copied to clipboard!', 'success');
    }
    
    // ========== INITIALISATION ==========
    
    function init() {
        // Event listeners pour les changements de stratégie
        const strategyRadios = document.querySelectorAll('input[name="strategy"]');
        strategyRadios.forEach(radio => {
            radio.addEventListener('change', updateStrategyFields);
        });
        
        // Event listeners pour les changements de distribution
        const distributionRadios = document.querySelectorAll('input[name="distribution"]');
        distributionRadios.forEach(radio => {
            radio.addEventListener('change', updateDistributionFields);
        });
        
        // Initialiser les champs visibles
        updateStrategyFields();
        updateDistributionFields();
        updateSavedScenariosList();
        
        console.log('✅ Monte Carlo Advanced module initialized');
    }
    
    // Initialiser au chargement de la page
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
        exportExcel,
        shareResults
    };
})();

// ========== INITIALISATION DES MODALS ==========
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
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

// Fermer les modals en cliquant en dehors
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target.id);
    }
});

console.log('✅ Monte Carlo Advanced Analytics loaded successfully!');

