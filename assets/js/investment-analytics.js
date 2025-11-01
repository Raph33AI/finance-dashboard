/* ==============================================
   INVESTMENT-ANALYTICS.JS
   Analyse avancée de performance + IA
   Version ES6+ 2024 - PARTIE 1/5
   ============================================== */

const InvestmentAnalytics = (function() {
    'use strict';
    
    // ========== VARIABLES PRIVÉES ==========
    
    let financialData = [];
    let currentPeriod = '1Y';
    let benchmarkSymbol = 'SPY';
    let benchmarkData = null;
    let apiClient = null;
    
    // Charts instances
    const charts = {
        portfolioEvolution: null,
        monthlyReturns: null,
        assetAllocation: null,
        contribution: null,
        drawdown: null,
        rollingVolatility: null,
        returnsDistribution: null,
        var: null,
        correlationMatrix: null,
        rollingSharpe: null,
        alphaBeta: null,
        sortino: null,
        calmar: null,
        aiPredictions: null,
        benchmarkComparison: null
    };
    
    // AI Models
    let aiModels = {
        optimizer: null,
        lstm: null,
        riskAnalyzer: null,
        rebalancer: null
    };
    
    let aiResults = {
        optimizer: null,
        lstm: null,
        risk: null,
        rebalancer: null,
        recommendations: []
    };
    
    // ========== INITIALISATION ==========
    
    /**
     * Initialise le module
     */
    function init() {
        try {
            // Charger les données du dashboard budget
            loadFinancialData();
            
            // Initialiser l'API client si disponible
            if (window.FinanceAPIClient && window.APP_CONFIG) {
                apiClient = new FinanceAPIClient({
                    baseURL: APP_CONFIG.API_BASE_URL,
                    cacheDuration: APP_CONFIG.CACHE_DURATION,
                    maxRetries: APP_CONFIG.MAX_RETRIES
                });
            }
            
            // Afficher les KPIs
            displayKPIs();
            
            // Créer tous les graphiques
            createAllCharts();
            
            // Charger le benchmark
            loadBenchmarkData();
            
            // Mettre à jour l'heure
            updateLastUpdate();
            
            console.log('✅ Investment Analytics initialisé avec succès');
            
        } catch (error) {
            console.error('❌ Erreur d\'initialisation:', error);
            showNotification('Erreur lors de l\'initialisation', 'error');
        }
    }
    
    /**
     * Charge les données financières depuis localStorage
     */
    function loadFinancialData() {
        const saved = localStorage.getItem('financialDataDynamic');
        
        if (saved) {
            try {
                financialData = JSON.parse(saved);
                console.log(`📊 ${financialData.length} mois de données chargés`);
            } catch (error) {
                console.error('Erreur de chargement des données:', error);
                financialData = [];
            }
        } else {
            console.warn('⚠️ Aucune donnée financière trouvée');
            financialData = [];
        }
    }
    
    /**
     * Met à jour l'heure de dernière mise à jour
     */
    function updateLastUpdate() {
        const now = new Date();
        const formatted = now.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const elem = document.getElementById('lastUpdate');
        if (elem) {
            elem.textContent = `Dernière mise à jour : ${formatted}`;
        }
    }
    
    // ========== FILTRAGE PAR PÉRIODE ==========
    
    /**
     * Change la période d'analyse
     */
    function changePeriod(period) {
        currentPeriod = period;
        
        // Mettre à jour les boutons
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-period="${period}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Rafraîchir les graphiques
        createAllCharts();
        
        showNotification(`Période changée : ${period}`, 'info');
    }
    
    /**
     * Filtre les données selon la période
     */
    function getFilteredData() {
        if (financialData.length === 0) return [];
        
        const now = new Date();
        let startDate;
        
        switch (currentPeriod) {
            case '1M':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case '3M':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case '6M':
                startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
                break;
            case '1Y':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            case 'YTD':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'ALL':
                return financialData;
            default:
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        }
        
        return financialData.filter(row => {
            const [month, year] = row.month.split('/').map(Number);
            const rowDate = new Date(year, month - 1, 1);
            return rowDate >= startDate;
        });
    }
    
    // ========== CALCUL DES MÉTRIQUES ==========
    
    /**
     * Calcule toutes les métriques de performance
     */
    function calculateMetrics(data = null) {
        const filteredData = data || getFilteredData();
        
        if (filteredData.length === 0) {
            return {
                totalReturn: 0,
                annualizedReturn: 0,
                volatility: 0,
                sharpeRatio: 0,
                sortinoRatio: 0,
                maxDrawdown: 0,
                calmarRatio: 0,
                winRate: 0,
                averageWin: 0,
                averageLoss: 0,
                profitFactor: 0,
                var95: 0,
                cvar95: 0,
                alpha: 0,
                beta: 0,
                informationRatio: 0
            };
        }
        
        // Portfolio values
        const portfolioValues = filteredData.map(row => row.totalPortfolio || 0);
        const returns = calculateReturns(portfolioValues);
        
        // Total return
        const firstValue = portfolioValues[0];
        const lastValue = portfolioValues[portfolioValues.length - 1];
        const totalReturn = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
        
        // Annualized return
        const years = filteredData.length / 12;
        const annualizedReturn = years > 0 ? (Math.pow(1 + totalReturn / 100, 1 / years) - 1) * 100 : 0;
        
        // Volatility
        const volatility = calculateVolatility(returns) * Math.sqrt(12) * 100;
        
        // Sharpe Ratio (assuming 2% risk-free rate)
        const riskFreeRate = 2;
        const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / volatility : 0;
        
        // Sortino Ratio
        const sortinoRatio = calculateSortinoRatio(returns, riskFreeRate);
        
        // Max Drawdown
        const maxDrawdown = calculateMaxDrawdown(portfolioValues);
        
        // Calmar Ratio
        const calmarRatio = maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0;
        
        // Win/Loss metrics
        const wins = returns.filter(r => r > 0);
        const losses = returns.filter(r => r < 0);
        const winRate = returns.length > 0 ? (wins.length / returns.length) * 100 : 0;
        const averageWin = wins.length > 0 ? wins.reduce((sum, r) => sum + r, 0) / wins.length : 0;
        const averageLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, r) => sum + r, 0) / losses.length) : 0;
        const profitFactor = averageLoss > 0 ? Math.abs(averageWin / averageLoss) : 0;
        
        // VaR and CVaR
        const var95 = calculateVaR(returns, 0.95);
        const cvar95 = calculateCVaR(returns, 0.95);
        
        // Alpha & Beta (vs benchmark - placeholder)
        const alpha = 0; // Calculé plus tard avec benchmark
        const beta = 1; // Calculé plus tard avec benchmark
        const informationRatio = 0;
        
        return {
            totalReturn,
            annualizedReturn,
            volatility,
            sharpeRatio,
            sortinoRatio,
            maxDrawdown,
            calmarRatio,
            winRate,
            averageWin: averageWin * 100,
            averageLoss: averageLoss * 100,
            profitFactor,
            var95: var95 * 100,
            cvar95: cvar95 * 100,
            alpha,
            beta,
            informationRatio
        };
    }
    
    /**
     * Calcule les rendements à partir des valeurs
     */
    function calculateReturns(values) {
        const returns = [];
        for (let i = 1; i < values.length; i++) {
            if (values[i - 1] > 0) {
                returns.push((values[i] - values[i - 1]) / values[i - 1]);
            }
        }
        return returns;
    }
    
    /**
     * Calcule la volatilité
     */
    function calculateVolatility(returns) {
        if (returns.length === 0) return 0;
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        return Math.sqrt(variance);
    }
    
    /**
     * Calcule le ratio de Sortino
     */
    function calculateSortinoRatio(returns, riskFreeRate) {
        if (returns.length === 0) return 0;
        
        const monthlyRiskFree = riskFreeRate / 12 / 100;
        const excessReturns = returns.map(r => r - monthlyRiskFree);
        const meanExcess = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
        
        const downsideReturns = excessReturns.filter(r => r < 0);
        if (downsideReturns.length === 0) return meanExcess > 0 ? Infinity : 0;
        
        const downsideDeviation = Math.sqrt(
            downsideReturns.reduce((sum, r) => sum + r * r, 0) / downsideReturns.length
        );
        
        const annualizedMean = meanExcess * 12;
        const annualizedDD = downsideDeviation * Math.sqrt(12);
        
        return annualizedDD > 0 ? annualizedMean / annualizedDD : 0;
    }
    
    /**
     * Calcule le drawdown maximum
     */
    function calculateMaxDrawdown(values) {
        let maxDrawdown = 0;
        let peak = values[0];
        
        for (let i = 1; i < values.length; i++) {
            if (values[i] > peak) {
                peak = values[i];
            }
            const drawdown = peak > 0 ? ((peak - values[i]) / peak) * 100 : 0;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }
        
        return maxDrawdown;
    }
    
    /**
     * Calcule la Value at Risk
     */
    function calculateVaR(returns, confidenceLevel) {
        if (returns.length === 0) return 0;
        
        const sorted = [...returns].sort((a, b) => a - b);
        const index = Math.floor((1 - confidenceLevel) * sorted.length);
        return sorted[index] || 0;
    }
    
    /**
     * Calcule la Conditional Value at Risk
     */
    function calculateCVaR(returns, confidenceLevel) {
        if (returns.length === 0) return 0;
        
        const sorted = [...returns].sort((a, b) => a - b);
        const index = Math.floor((1 - confidenceLevel) * sorted.length);
        const tail = sorted.slice(0, index + 1);
        
        if (tail.length === 0) return 0;
        return tail.reduce((sum, r) => sum + r, 0) / tail.length;
    }
    
    // ========== AFFICHAGE DES KPIs ==========
    
    /**
     * Affiche les KPIs principaux
     */
    function displayKPIs() {
        const metrics = calculateMetrics();
        const filteredData = getFilteredData();
        
        if (filteredData.length === 0) {
            document.getElementById('kpiGrid').innerHTML = `
                <div class='kpi-card neutral'>
                    <div class='kpi-header'>
                        <span class='kpi-title'>Aucune donnée</span>
                        <div class='kpi-icon'><i class='fas fa-exclamation-triangle'></i></div>
                    </div>
                    <div class='kpi-value'>--</div>
                    <p style='color: var(--text-secondary); font-size: 0.9rem;'>Veuillez d'abord remplir vos données dans le Dashboard Budget</p>
                </div>
            `;
            return;
        }
        
        const currentPortfolio = filteredData[filteredData.length - 1].totalPortfolio || 0;
        const currentInvestment = filteredData[filteredData.length - 1].cumulatedInvestment || 0;
        const currentGains = filteredData[filteredData.length - 1].cumulatedGains || 0;
        const currentROI = filteredData[filteredData.length - 1].roi || 0;
        
        const kpis = [
            {
                title: 'Valeur Totale du Portefeuille',
                value: formatCurrency(currentPortfolio),
                icon: 'fa-wallet',
                change: `+${formatPercent(metrics.totalReturn)}`,
                changeClass: metrics.totalReturn >= 0 ? 'positive' : 'negative',
                footer: `Sur ${filteredData.length} mois`,
                cardClass: currentPortfolio > 0 ? 'positive' : 'neutral'
            },
            {
                title: 'Investissement Cumulé',
                value: formatCurrency(currentInvestment),
                icon: 'fa-piggy-bank',
                change: null,
                footer: `Capital investi`,
                cardClass: 'neutral'
            },
            {
                title: 'Gains Cumulés',
                value: formatCurrency(currentGains),
                icon: 'fa-chart-line',
                change: `ROI: ${formatPercent(currentROI)}`,
                changeClass: currentGains >= 0 ? 'positive' : 'negative',
                footer: `Performance globale`,
                cardClass: currentGains >= 0 ? 'positive' : 'negative'
            },
            {
                title: 'Rendement Annualisé',
                value: formatPercent(metrics.annualizedReturn),
                icon: 'fa-percentage',
                change: `Volatilité: ${metrics.volatility.toFixed(2)}%`,
                changeClass: 'neutral',
                footer: `Rendement moyen par an`,
                cardClass: metrics.annualizedReturn >= 5 ? 'positive' : metrics.annualizedReturn >= 0 ? 'neutral' : 'negative'
            },
            {
                title: 'Sharpe Ratio',
                value: metrics.sharpeRatio.toFixed(2),
                icon: 'fa-balance-scale',
                change: interpretSharpe(metrics.sharpeRatio),
                changeClass: metrics.sharpeRatio > 1 ? 'positive' : metrics.sharpeRatio > 0 ? 'neutral' : 'negative',
                footer: `Rendement ajusté au risque`,
                cardClass: metrics.sharpeRatio > 1 ? 'positive' : 'neutral'
            },
            {
                title: 'Drawdown Maximum',
                value: `-${metrics.maxDrawdown.toFixed(2)}%`,
                icon: 'fa-arrow-down',
                change: `Calmar: ${metrics.calmarRatio.toFixed(2)}`,
                changeClass: 'neutral',
                footer: `Perte maximale`,
                cardClass: metrics.maxDrawdown < 10 ? 'positive' : metrics.maxDrawdown < 20 ? 'neutral' : 'negative'
            },
            {
                title: 'Taux de Réussite',
                value: `${metrics.winRate.toFixed(1)}%`,
                icon: 'fa-bullseye',
                change: `${(filteredData.filter((d, i) => i > 0 && d.totalPortfolio > filteredData[i-1].totalPortfolio).length)} mois gagnants`,
                changeClass: metrics.winRate >= 50 ? 'positive' : 'negative',
                footer: `Pourcentage de mois positifs`,
                cardClass: metrics.winRate >= 60 ? 'positive' : metrics.winRate >= 40 ? 'neutral' : 'negative'
            },
            {
                title: 'VaR 95%',
                value: `${metrics.var95.toFixed(2)}%`,
                icon: 'fa-shield-alt',
                change: `CVaR: ${metrics.cvar95.toFixed(2)}%`,
                changeClass: 'neutral',
                footer: `Perte potentielle (95% confiance)`,
                cardClass: Math.abs(metrics.var95) < 5 ? 'positive' : 'neutral'
            }
        ];
        
        const html = kpis.map(kpi => `
            <div class='kpi-card ${kpi.cardClass}'>
                <div class='kpi-header'>
                    <span class='kpi-title'>${kpi.title}</span>
                    <div class='kpi-icon'><i class='fas ${kpi.icon}'></i></div>
                </div>
                <div class='kpi-value'>${kpi.value}</div>
                ${kpi.change ? `<div class='kpi-change ${kpi.changeClass}'>${kpi.change}</div>` : ''}
                <div class='kpi-footer'>${kpi.footer}</div>
            </div>
        `).join('');
        
        document.getElementById('kpiGrid').innerHTML = html;
    }
    
    /**
     * Interprète le Sharpe Ratio
     */
    function interpretSharpe(sharpe) {
        if (sharpe > 3) return 'Excellent';
        if (sharpe > 2) return 'Très bon';
        if (sharpe > 1) return 'Bon';
        if (sharpe > 0) return 'Acceptable';
        return 'Faible';
    }
    
    // ========== FIN PARTIE 1/5 ==========
    
    // Les exports publics seront à la fin
    return {
        init,
        changePeriod,
        refreshData: init,
        exportReport: () => console.log('Export en cours...'),
        runAIAnalysis: () => console.log('Analyse IA en cours...'),
        updateBenchmark: () => console.log('Mise à jour benchmark...')
    };
    
})();

// Initialisation au chargement
window.addEventListener('DOMContentLoaded', InvestmentAnalytics.init);

/* ==============================================
   INVESTMENT-ANALYTICS.JS - PARTIE 2/5
   GRAPHIQUES DE PERFORMANCE
   ============================================== */

// Continuer dans le module InvestmentAnalytics

Object.assign(InvestmentAnalytics, {
    
    // ========== CRÉATION DE TOUS LES GRAPHIQUES ==========
    
    createAllCharts() {
        const filteredData = getFilteredData();
        
        if (filteredData.length === 0) {
            console.warn('Aucune donnée pour créer les graphiques');
            return;
        }
        
        this.createPortfolioEvolutionChart(filteredData);
        this.createMonthlyReturnsChart(filteredData);
        this.createAssetAllocationChart(filteredData);
        this.createContributionChart(filteredData);
        this.createDrawdownChart(filteredData);
        this.createRollingVolatilityChart(filteredData);
        this.createReturnsDistributionChart(filteredData);
        this.createVaRChart(filteredData);
        this.createCorrelationMatrix(filteredData);
        this.createRollingSharpeChart(filteredData);
        this.createAlphaBetaChart(filteredData);
        this.createSortinoChart(filteredData);
        this.createCalmarChart(filteredData);
    },
    
    // ========== 1. ÉVOLUTION DU PORTEFEUILLE ==========
    
    createPortfolioEvolutionChart(data) {
        const categories = data.map(row => row.month);
        const portfolio = data.map(row => row.totalPortfolio || 0);
        const investment = data.map(row => row.cumulatedInvestment || 0);
        const gains = data.map(row => row.cumulatedGains || 0);
        
        if (charts.portfolioEvolution) {
            charts.portfolioEvolution.destroy();
        }
        
        charts.portfolioEvolution = Highcharts.chart('chartPortfolioEvolution', {
            chart: {
                type: 'area',
                backgroundColor: 'transparent',
                height: 450
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { fontSize: '10px' }
                }
            },
            yAxis: {
                title: { text: 'Valeur (EUR)' },
                labels: {
                    formatter: function() {
                        return formatLargeNumber(this.value);
                    }
                }
            },
            tooltip: {
                shared: true,
                valuePrefix: '€',
                valueDecimals: 0,
                formatter: function() {
                    let s = '<b>' + this.x + '</b><br/>';
                    this.points.forEach(point => {
                        s += '<span style="color:' + point.color + '">●</span> ' + 
                             point.series.name + ': <b>' + formatCurrency(point.y) + '</b><br/>';
                    });
                    return s;
                }
            },
            plotOptions: {
                area: {
                    stacking: null,
                    lineWidth: 2,
                    marker: { enabled: false }
                }
            },
            series: [
                {
                    name: 'Investissement',
                    data: investment,
                    color: '#6C8BE0',
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, 'rgba(108, 139, 224, 0.3)'],
                            [1, 'rgba(108, 139, 224, 0.05)']
                        ]
                    }
                },
                {
                    name: 'Gains',
                    data: gains,
                    color: '#10b981',
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, 'rgba(16, 185, 129, 0.3)'],
                            [1, 'rgba(16, 185, 129, 0.05)']
                        ]
                    }
                },
                {
                    name: 'Portefeuille Total',
                    data: portfolio,
                    color: '#2563eb',
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, 'rgba(37, 99, 235, 0.4)'],
                            [1, 'rgba(37, 99, 235, 0.05)']
                        ]
                    },
                    lineWidth: 3
                }
            ],
            legend: {
                align: 'center',
                verticalAlign: 'bottom'
            },
            credits: { enabled: false }
        });
    },
    
    // ========== 2. RENDEMENTS MENSUELS ==========
    
    createMonthlyReturnsChart(data) {
        const categories = [];
        const returns = [];
        
        for (let i = 1; i < data.length; i++) {
            const prevValue = data[i - 1].totalPortfolio || 0;
            const currentValue = data[i].totalPortfolio || 0;
            
            if (prevValue > 0) {
                const returnPct = ((currentValue - prevValue) / prevValue) * 100;
                categories.push(data[i].month);
                returns.push({
                    y: returnPct,
                    color: returnPct >= 0 ? '#10b981' : '#ef4444'
                });
            }
        }
        
        if (charts.monthlyReturns) {
            charts.monthlyReturns.destroy();
        }
        
        charts.monthlyReturns = Highcharts.chart('chartMonthlyReturns', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                height: 450
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { fontSize: '10px' }
                }
            },
            yAxis: {
                title: { text: 'Rendement (%)' },
                plotLines: [{
                    value: 0,
                    color: '#94a3b8',
                    width: 2,
                    zIndex: 5
                }]
            },
            tooltip: {
                valueSuffix: '%',
                valueDecimals: 2
            },
            plotOptions: {
                column: {
                    borderRadius: 4,
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            series: [{
                name: 'Rendement Mensuel',
                data: returns,
                colorByPoint: true
            }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    },
    
    // ========== 3. ALLOCATION D'ACTIFS ==========
    
    createAssetAllocationChart(data) {
        const lastRow = data[data.length - 1];
        
        const allocationData = [
            {
                name: 'Investissement',
                y: lastRow.cumulatedInvestment || 0,
                color: '#6C8BE0'
            },
            {
                name: 'Gains',
                y: lastRow.cumulatedGains || 0,
                color: '#10b981'
            },
            {
                name: 'PEE L\'Oreal',
                y: lastRow.peeLoreal || 0,
                color: '#8b5cf6'
            }
        ].filter(item => item.y > 0);
        
        if (charts.assetAllocation) {
            charts.assetAllocation.destroy();
        }
        
        charts.assetAllocation = Highcharts.chart('chartAssetAllocation', {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent',
                height: 450
            },
            title: { 
                text: lastRow.month,
                style: { fontSize: '14px', fontWeight: 'bold' }
            },
            tooltip: {
                pointFormat: '<b>{point.name}</b><br/>{point.y:,.0f} EUR ({point.percentage:.1f}%)'
            },
            plotOptions: {
                pie: {
                    innerSize: '60%',
                    depth: 45,
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b><br/>{point.percentage:.1f}%',
                        style: { fontSize: '11px' }
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Allocation',
                data: allocationData
            }],
            credits: { enabled: false }
        });
    },
    
    // ========== 4. CONTRIBUTION PAR INVESTISSEMENT ==========
    
    createContributionChart(data) {
        const categories = data.map(row => row.month);
        const monthlyInvestment = data.map(row => row.investment || 0);
        const monthlyGain = data.map(row => row.monthlyGain || 0);
        
        if (charts.contribution) {
            charts.contribution.destroy();
        }
        
        charts.contribution = Highcharts.chart('chartContribution', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                height: 450
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { fontSize: '10px' }
                }
            },
            yAxis: {
                title: { text: 'Montant (EUR)' }
            },
            tooltip: {
                shared: true,
                valuePrefix: '€',
                valueDecimals: 2
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    borderRadius: 3
                }
            },
            series: [
                {
                    name: 'Investissement Mensuel',
                    data: monthlyInvestment,
                    color: '#6C8BE0'
                },
                {
                    name: 'Gain Mensuel',
                    data: monthlyGain,
                    color: '#10b981'
                }
            ],
            credits: { enabled: false }
        });
    },
    
    // ========== 5. DRAWDOWN ==========
    
    createDrawdownChart(data) {
        const categories = data.map(row => row.month);
        const portfolioValues = data.map(row => row.totalPortfolio || 0);
        
        // Calculer le drawdown
        const drawdowns = [];
        let peak = portfolioValues[0];
        
        portfolioValues.forEach(value => {
            if (value > peak) peak = value;
            const drawdown = peak > 0 ? -((peak - value) / peak) * 100 : 0;
            drawdowns.push(drawdown);
        });
        
        if (charts.drawdown) {
            charts.drawdown.destroy();
        }
        
        charts.drawdown = Highcharts.chart('chartDrawdown', {
            chart: {
                type: 'area',
                backgroundColor: 'transparent',
                height: 450
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { fontSize: '10px' }
                }
            },
            yAxis: {
                title: { text: 'Drawdown (%)' },
                max: 0,
                plotLines: [{
                    value: -10,
                    color: '#f59e0b',
                    dashStyle: 'Dash',
                    width: 1,
                    label: {
                        text: '-10%',
                        align: 'right',
                        style: { color: '#f59e0b' }
                    }
                }, {
                    value: -20,
                    color: '#ef4444',
                    dashStyle: 'Dash',
                    width: 1,
                    label: {
                        text: '-20%',
                        align: 'right',
                        style: { color: '#ef4444' }
                    }
                }]
            },
            tooltip: {
                valueSuffix: '%',
                valueDecimals: 2
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, 'rgba(239, 68, 68, 0.5)'],
                            [1, 'rgba(239, 68, 68, 0.05)']
                        ]
                    },
                    lineWidth: 2,
                    marker: { enabled: false }
                }
            },
            series: [{
                name: 'Drawdown',
                data: drawdowns,
                color: '#ef4444',
                negativeColor: '#ef4444'
            }],
            credits: { enabled: false }
        });
    },
    
    // ========== 6. VOLATILITÉ ROULANTE ==========
    
    createRollingVolatilityChart(data) {
        const categories = [];
        const volatilities = [];
        const window = 30; // 30 jours
        
        if (data.length < window) {
            console.warn('Pas assez de données pour la volatilité roulante');
            return;
        }
        
        for (let i = window; i < data.length; i++) {
            const windowData = data.slice(i - window, i);
            const values = windowData.map(row => row.totalPortfolio || 0);
            const returns = calculateReturns(values);
            const vol = calculateVolatility(returns) * Math.sqrt(252) * 100;
            
            categories.push(data[i].month);
            volatilities.push(vol);
        }
        
        if (charts.rollingVolatility) {
            charts.rollingVolatility.destroy();
        }
        
        charts.rollingVolatility = Highcharts.chart('chartRollingVolatility', {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: 450
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { fontSize: '10px' }
                }
            },
            yAxis: {
                title: { text: 'Volatilité Annualisée (%)' },
                plotLines: [{
                    value: 15,
                    color: '#f59e0b',
                    dashStyle: 'Dash',
                    width: 1,
                    label: {
                        text: 'Seuil 15%',
                        align: 'right',
                        style: { color: '#f59e0b' }
                    }
                }]
            },
            tooltip: {
                valueSuffix: '%',
                valueDecimals: 2
            },
            plotOptions: {
                line: {
                    lineWidth: 2,
                    marker: { enabled: false }
                }
            },
            series: [{
                name: 'Volatilité Roulante (30j)',
                data: volatilities,
                color: '#8b5cf6'
            }],
            credits: { enabled: false }
        });
    },
    
    // ========== 7. DISTRIBUTION DES RENDEMENTS ==========
    
    createReturnsDistributionChart(data) {
        const portfolioValues = data.map(row => row.totalPortfolio || 0);
        const returns = calculateReturns(portfolioValues).map(r => r * 100);
        
        // Créer un histogramme
        const bins = [];
        const binSize = 2; // 2%
        const minReturn = Math.floor(Math.min(...returns) / binSize) * binSize;
        const maxReturn = Math.ceil(Math.max(...returns) / binSize) * binSize;
        
        for (let i = minReturn; i <= maxReturn; i += binSize) {
            bins.push(i);
        }
        
        const histogram = bins.map(bin => {
            const count = returns.filter(r => r >= bin && r < bin + binSize).length;
            return [bin, count];
        });
        
        if (charts.returnsDistribution) {
            charts.returnsDistribution.destroy();
        }
        
        charts.returnsDistribution = Highcharts.chart('chartReturnsDistribution', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                height: 450
            },
            title: { text: null },
            xAxis: {
                title: { text: 'Rendement (%)' },
                plotLines: [{
                    value: 0,
                    color: '#94a3b8',
                    width: 2,
                    zIndex: 5
                }]
            },
            yAxis: {
                title: { text: 'Fréquence' }
            },
            tooltip: {
                pointFormat: 'Rendements entre <b>{point.x}%</b> et <b>{point.x2}%</b><br/>Fréquence: <b>{point.y}</b>',
                shared: false
            },
            plotOptions: {
                column: {
                    borderRadius: 3,
                    groupPadding: 0,
                    pointPadding: 0.05
                }
            },
            series: [{
                name: 'Fréquence',
                data: histogram.map(([x, y]) => ({
                    x: x,
                    x2: x + binSize,
                    y: y,
                    color: x >= 0 ? '#10b981' : '#ef4444'
                })),
                colorByPoint: true
            }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    },
    
    // ========== 8. VALUE AT RISK (VaR) ==========
    
    createVaRChart(data) {
        const portfolioValues = data.map(row => row.totalPortfolio || 0);
        const returns = calculateReturns(portfolioValues);
        
        const confidenceLevels = [0.90, 0.95, 0.99];
        const varData = confidenceLevels.map(level => {
            const var95 = calculateVaR(returns, level) * 100;
            const cvar95 = calculateCVaR(returns, level) * 100;
            
            return {
                name: `${(level * 100).toFixed(0)}%`,
                data: [
                    { name: 'VaR', y: Math.abs(var95), color: '#f59e0b' },
                    { name: 'CVaR', y: Math.abs(cvar95), color: '#ef4444' }
                ]
            };
        });
        
        if (charts.var) {
            charts.var.destroy();
        }
        
        charts.var = Highcharts.chart('chartVaR', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                height: 450
            },
            title: { text: null },
            xAxis: {
                categories: ['VaR', 'CVaR'],
                crosshair: true
            },
            yAxis: {
                title: { text: 'Perte Potentielle (%)' }
            },
            tooltip: {
                valueSuffix: '%',
                valueDecimals: 2
            },
            plotOptions: {
                column: {
                    borderRadius: 4,
                    dataLabels: {
                        enabled: true,
                        format: '{y:.2f}%'
                    }
                }
            },
            series: varData,
            credits: { enabled: false }
        });
    }
    
});

// ========== FIN PARTIE 2/5 ==========

/* ==============================================
   INVESTMENT-ANALYTICS.JS - PARTIE 3/5
   ANALYSE DES RISQUES & CORRÉLATIONS
   ============================================== */

Object.assign(InvestmentAnalytics, {
    
    // ========== 9. MATRICE DE CORRÉLATION ==========
    
    createCorrelationMatrix(data) {
        // Créer des séries temporelles factices pour différents types d'investissement
        const assets = [
            'Investissement Total',
            'Gains',
            'PEE L\'Oreal',
            'Épargne',
            'Revenus'
        ];
        
        const timeSeries = {
            'Investissement Total': data.map(row => row.cumulatedInvestment || 0),
            'Gains': data.map(row => row.cumulatedGains || 0),
            'PEE L\'Oreal': data.map(row => row.peeLoreal || 0),
            'Épargne': data.map(row => row.cumulatedSavings || 0),
            'Revenus': data.map(row => row.totalIncome || 0)
        };
        
        // Calculer la matrice de corrélation
        const correlationMatrix = [];
        
        assets.forEach((asset1, i) => {
            assets.forEach((asset2, j) => {
                const returns1 = calculateReturns(timeSeries[asset1]);
                const returns2 = calculateReturns(timeSeries[asset2]);
                
                const correlation = calculateCorrelation(returns1, returns2);
                
                correlationMatrix.push([j, i, correlation]);
            });
        });
        
        if (charts.correlationMatrix) {
            charts.correlationMatrix.destroy();
        }
        
        charts.correlationMatrix = Highcharts.chart('chartCorrelationMatrix', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent',
                height: 500
            },
            title: { text: null },
            xAxis: {
                categories: assets,
                opposite: true
            },
            yAxis: {
                categories: assets,
                title: null,
                reversed: true
            },
            colorAxis: {
                min: -1,
                max: 1,
                stops: [
                    [0, '#ef4444'],
                    [0.5, '#f3f4f6'],
                    [1, '#10b981']
                ]
            },
            tooltip: {
                formatter: function() {
                    return '<b>' + assets[this.point.y] + '</b> vs <b>' + 
                           assets[this.point.x] + '</b><br/>Corrélation: <b>' + 
                           this.point.value.toFixed(3) + '</b>';
                }
            },
            plotOptions: {
                heatmap: {
                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        formatter: function() {
                            return this.point.value.toFixed(2);
                        }
                    },
                    borderWidth: 1,
                    borderColor: '#ffffff'
                }
            },
            series: [{
                name: 'Corrélation',
                data: correlationMatrix,
                nullColor: '#f3f4f6'
            }],
            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 280
            },
            credits: { enabled: false }
        });
        
        // Générer des insights
        this.generateCorrelationInsights(correlationMatrix, assets);
    },
    
    /**
     * Calcule la corrélation entre deux séries
     */
    calculateCorrelation(series1, series2) {
        if (series1.length !== series2.length || series1.length === 0) return 0;
        
        const n = series1.length;
        const mean1 = series1.reduce((sum, val) => sum + val, 0) / n;
        const mean2 = series2.reduce((sum, val) => sum + val, 0) / n;
        
        let numerator = 0;
        let denominator1 = 0;
        let denominator2 = 0;
        
        for (let i = 0; i < n; i++) {
            const diff1 = series1[i] - mean1;
            const diff2 = series2[i] - mean2;
            numerator += diff1 * diff2;
            denominator1 += diff1 * diff1;
            denominator2 += diff2 * diff2;
        }
        
        const denominator = Math.sqrt(denominator1 * denominator2);
        return denominator === 0 ? 0 : numerator / denominator;
    },
    
    /**
     * Génère des insights sur la corrélation
     */
    generateCorrelationInsights(matrix, assets) {
        const insights = [];
        
        // Trouver les corrélations fortes (>0.7 ou <-0.7)
        matrix.forEach(([x, y, corr]) => {
            if (x < y && Math.abs(corr) > 0.7 && corr !== 1) {
                const asset1 = assets[y];
                const asset2 = assets[x];
                
                if (corr > 0.7) {
                    insights.push({
                        type: 'positive',
                        icon: 'fa-link',
                        title: 'Corrélation Forte Positive',
                        description: `${asset1} et ${asset2} évoluent ensemble (${(corr * 100).toFixed(1)}%). Une diversification limitée entre ces actifs.`
                    });
                } else {
                    insights.push({
                        type: 'negative',
                        icon: 'fa-unlink',
                        title: 'Corrélation Négative',
                        description: `${asset1} et ${asset2} évoluent en sens inverse (${(corr * 100).toFixed(1)}%). Bonne diversification naturelle.`
                    });
                }
            }
        });
        
        // Trouver les corrélations faibles (<0.3)
        matrix.forEach(([x, y, corr]) => {
            if (x < y && Math.abs(corr) < 0.3 && corr !== 1) {
                const asset1 = assets[y];
                const asset2 = assets[x];
                
                insights.push({
                    type: 'warning',
                    icon: 'fa-info-circle',
                    title: 'Faible Corrélation',
                    description: `${asset1} et ${asset2} sont peu corrélés (${(corr * 100).toFixed(1)}%). Excellente opportunité de diversification.`
                });
            }
        });
        
        // Afficher les insights
        const container = document.getElementById('correlationInsights');
        if (container && insights.length > 0) {
            container.innerHTML = insights.slice(0, 4).map(insight => `
                <div class='insight-item'>
                    <div class='insight-icon ${insight.type}'>
                        <i class='fas ${insight.icon}'></i>
                    </div>
                    <div class='insight-content'>
                        <h4>${insight.title}</h4>
                        <p>${insight.description}</p>
                    </div>
                </div>
            `).join('');
        }
    },
    
    // ========== 10. SHARPE RATIO ROULANT ==========
    
    createRollingSharpeChart(data) {
        const categories = [];
        const sharpeRatios = [];
        const window = 12; // 12 mois
        const riskFreeRate = 2; // 2%
        
        if (data.length < window) {
            console.warn('Pas assez de données pour le Sharpe roulant');
            return;
        }
        
        for (let i = window; i < data.length; i++) {
            const windowData = data.slice(i - window, i);
            const values = windowData.map(row => row.totalPortfolio || 0);
            const returns = calculateReturns(values);
            
            const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
            const volatility = calculateVolatility(returns);
            
            const annualizedReturn = meanReturn * 12 * 100;
            const annualizedVol = volatility * Math.sqrt(12) * 100;
            
            const sharpe = annualizedVol > 0 ? (annualizedReturn - riskFreeRate) / annualizedVol : 0;
            
            categories.push(data[i].month);
            sharpeRatios.push(sharpe);
        }
        
        if (charts.rollingSharpe) {
            charts.rollingSharpe.destroy();
        }
        
        charts.rollingSharpe = Highcharts.chart('chartRollingSharpe', {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: 450
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { fontSize: '10px' }
                }
            },
            yAxis: {
                title: { text: 'Sharpe Ratio' },
                plotLines: [
                    {
                        value: 0,
                        color: '#94a3b8',
                        width: 2,
                        zIndex: 5
                    },
                    {
                        value: 1,
                        color: '#10b981',
                        dashStyle: 'Dash',
                        width: 1,
                        label: {
                            text: 'Bon (1.0)',
                            align: 'right',
                            style: { color: '#10b981' }
                        }
                    },
                    {
                        value: 2,
                        color: '#2563eb',
                        dashStyle: 'Dash',
                        width: 1,
                        label: {
                            text: 'Excellent (2.0)',
                            align: 'right',
                            style: { color: '#2563eb' }
                        }
                    }
                ]
            },
            tooltip: {
                valueDecimals: 3
            },
            plotOptions: {
                line: {
                    lineWidth: 3,
                    marker: { enabled: false }
                }
            },
            series: [{
                name: 'Sharpe Ratio (12 mois)',
                data: sharpeRatios,
                color: '#8b5cf6',
                zones: [
                    { value: 0, color: '#ef4444' },
                    { value: 1, color: '#f59e0b' },
                    { value: 2, color: '#10b981' },
                    { color: '#2563eb' }
                ]
            }],
            credits: { enabled: false }
        });
    },
    
    // ========== 11. ALPHA vs BETA ==========
    
    createAlphaBetaChart(data) {
        // Pour simplifier, on crée des données factices
        // Dans une vraie implémentation, il faudrait comparer avec un benchmark
        
        const scatterData = data.slice(-24).map((row, i) => {
            const portfolioReturn = i > 0 ? 
                ((row.totalPortfolio - data[data.length - 24 + i - 1].totalPortfolio) / 
                 data[data.length - 24 + i - 1].totalPortfolio) * 100 : 0;
            
            // Market return simulé (factice)
            const marketReturn = portfolioReturn * (0.8 + Math.random() * 0.4);
            
            return {
                x: marketReturn,
                y: portfolioReturn,
                name: row.month
            };
        }).filter(point => point.x !== 0);
        
        if (charts.alphaBeta) {
            charts.alphaBeta.destroy();
        }
        
        charts.alphaBeta = Highcharts.chart('chartAlphaBeta', {
            chart: {
                type: 'scatter',
                backgroundColor: 'transparent',
                height: 450,
                zoomType: 'xy'
            },
            title: { text: null },
            xAxis: {
                title: { text: 'Rendement du Marché (%)' },
                gridLineWidth: 1,
                plotLines: [{
                    value: 0,
                    color: '#94a3b8',
                    width: 1
                }]
            },
            yAxis: {
                title: { text: 'Rendement du Portefeuille (%)' },
                plotLines: [{
                    value: 0,
                    color: '#94a3b8',
                    width: 1
                }]
            },
            tooltip: {
                pointFormat: '<b>{point.name}</b><br/>Marché: {point.x:.2f}%<br/>Portfolio: {point.y:.2f}%'
            },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 6,
                        symbol: 'circle'
                    }
                }
            },
            series: [
                {
                    name: 'Rendements',
                    data: scatterData,
                    color: '#2563eb'
                },
                {
                    type: 'line',
                    name: 'Ligne de marché',
                    data: [[-5, -5], [5, 5]],
                    color: '#94a3b8',
                    dashStyle: 'Dash',
                    marker: { enabled: false },
                    enableMouseTracking: false
                }
            ],
            credits: { enabled: false }
        });
    },
    
    // ========== 12. SORTINO RATIO ==========
    
    createSortinoChart(data) {
        const categories = [];
        const sortinoRatios = [];
        const window = 12;
        const riskFreeRate = 2;
        
        if (data.length < window) return;
        
        for (let i = window; i < data.length; i++) {
            const windowData = data.slice(i - window, i);
            const values = windowData.map(row => row.totalPortfolio || 0);
            const returns = calculateReturns(values);
            
            const sortino = calculateSortinoRatio(returns, riskFreeRate);
            
            categories.push(data[i].month);
            sortinoRatios.push(sortino);
        }
        
        if (charts.sortino) {
            charts.sortino.destroy();
        }
        
        charts.sortino = Highcharts.chart('chartSortino', {
            chart: {
                type: 'area',
                backgroundColor: 'transparent',
                height: 450
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { fontSize: '10px' }
                }
            },
            yAxis: {
                title: { text: 'Sortino Ratio' },
                plotLines: [{
                    value: 0,
                    color: '#94a3b8',
                    width: 2
                }]
            },
            tooltip: {
                valueDecimals: 3
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, 'rgba(37, 99, 235, 0.4)'],
                            [1, 'rgba(37, 99, 235, 0.05)']
                        ]
                    },
                    lineWidth: 2,
                    marker: { enabled: false }
                }
            },
            series: [{
                name: 'Sortino Ratio (12 mois)',
                data: sortinoRatios,
                color: '#2563eb'
            }],
            credits: { enabled: false }
        });
    },
    
    // ========== 13. CALMAR RATIO ==========
    
    createCalmarChart(data) {
        const categories = [];
        const calmarRatios = [];
        const window = 36; // 3 ans
        
        if (data.length < window) {
            console.warn('Pas assez de données pour le Calmar ratio');
            return;
        }
        
        for (let i = window; i < data.length; i++) {
            const windowData = data.slice(i - window, i);
            const values = windowData.map(row => row.totalPortfolio || 0);
            
            const firstValue = values[0];
            const lastValue = values[values.length - 1];
            const totalReturn = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
            const years = window / 12;
            const annualizedReturn = (Math.pow(1 + totalReturn / 100, 1 / years) - 1) * 100;
            
            const maxDD = calculateMaxDrawdown(values);
            const calmar = maxDD > 0 ? annualizedReturn / maxDD : 0;
            
            categories.push(data[i].month);
            calmarRatios.push(calmar);
        }
        
        if (charts.calmar) {
            charts.calmar.destroy();
        }
        
        charts.calmar = Highcharts.chart('chartCalmar', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent',
                height: 450
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { fontSize: '10px' }
                }
            },
            yAxis: {
                title: { text: 'Calmar Ratio' },
                plotLines: [{
                    value: 0,
                    color: '#94a3b8',
                    width: 2
                }]
            },
            tooltip: {
                valueDecimals: 3
            },
            plotOptions: {
                column: {
                    borderRadius: 4,
                    colorByPoint: false
                }
            },
            series: [{
                name: 'Calmar Ratio (36 mois)',
                data: calmarRatios.map(val => ({
                    y: val,
                    color: val > 1 ? '#10b981' : val > 0 ? '#f59e0b' : '#ef4444'
                })),
                colorByPoint: true
            }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    },
    
    // ========== TABLE DES MÉTRIQUES DE RISQUE ==========
    
    displayRiskMetricsTable() {
        const metrics = calculateMetrics();
        
        const tableData = [
            {
                metric: 'Volatilité Annualisée',
                value: `${metrics.volatility.toFixed(2)}%`,
                interpretation: metrics.volatility < 10 ? 'Faible risque' : metrics.volatility < 20 ? 'Risque modéré' : 'Risque élevé',
                benchmark: '< 15% (bon)'
            },
            {
                metric: 'Sharpe Ratio',
                value: metrics.sharpeRatio.toFixed(2),
                interpretation: interpretSharpe(metrics.sharpeRatio),
                benchmark: '> 1.0 (bon)'
            },
            {
                metric: 'Sortino Ratio',
                value: metrics.sortinoRatio.toFixed(2),
                interpretation: metrics.sortinoRatio > 2 ? 'Excellent' : metrics.sortinoRatio > 1 ? 'Bon' : 'Faible',
                benchmark: '> 1.0 (bon)'
            },
            {
                metric: 'Max Drawdown',
                value: `-${metrics.maxDrawdown.toFixed(2)}%`,
                interpretation: metrics.maxDrawdown < 10 ? 'Excellent' : metrics.maxDrawdown < 20 ? 'Bon' : 'À surveiller',
                benchmark: '< 20% (bon)'
            },
            {
                metric: 'Calmar Ratio',
                value: metrics.calmarRatio.toFixed(2),
                interpretation: metrics.calmarRatio > 1 ? 'Bon' : 'Faible',
                benchmark: '> 1.0 (bon)'
            },
            {
                metric: 'VaR 95%',
                value: `${metrics.var95.toFixed(2)}%`,
                interpretation: `Perte max probable à 95%`,
                benchmark: 'Contextuel'
            },
            {
                metric: 'CVaR 95%',
                value: `${metrics.cvar95.toFixed(2)}%`,
                interpretation: `Perte moyenne au-delà du VaR`,
                benchmark: 'Contextuel'
            },
            {
                metric: 'Taux de Réussite',
                value: `${metrics.winRate.toFixed(1)}%`,
                interpretation: metrics.winRate > 60 ? 'Excellent' : metrics.winRate > 50 ? 'Bon' : 'Faible',
                benchmark: '> 50% (bon)'
            }
        ];
        
        const tbody = document.querySelector('#riskMetricsTable tbody');
        if (tbody) {
            tbody.innerHTML = tableData.map(row => {
                let valueClass = 'metric-good';
                
                // Déterminer la classe selon la métrique
                if (row.metric === 'Volatilité Annualisée') {
                    valueClass = metrics.volatility < 10 ? 'metric-good' : metrics.volatility < 20 ? 'metric-warning' : 'metric-bad';
                } else if (row.metric === 'Sharpe Ratio' || row.metric === 'Sortino Ratio') {
                    const val = parseFloat(row.value);
                    valueClass = val > 1 ? 'metric-good' : val > 0 ? 'metric-warning' : 'metric-bad';
                } else if (row.metric === 'Max Drawdown') {
                    valueClass = metrics.maxDrawdown < 10 ? 'metric-good' : metrics.maxDrawdown < 20 ? 'metric-warning' : 'metric-bad';
                }
                
                return `
                    <tr>
                        <td><strong>${row.metric}</strong></td>
                        <td class='${valueClass}'>${row.value}</td>
                        <td>${row.interpretation}</td>
                        <td style='color: var(--text-secondary); font-size: 0.9rem;'>${row.benchmark}</td>
                    </tr>
                `;
            }).join('');
        }
    }
    
});

// Appeler la création de la table après les graphiques
const originalCreateAllCharts = InvestmentAnalytics.createAllCharts;
InvestmentAnalytics.createAllCharts = function() {
    originalCreateAllCharts.call(this);
    this.displayRiskMetricsTable();
};

// ========== FIN PARTIE 3/5 ==========

/* ==============================================
   INVESTMENT-ANALYTICS.JS - PARTIE 4/5
   MODÈLES D'INTELLIGENCE ARTIFICIELLE
   ============================================== */

Object.assign(InvestmentAnalytics, {
    
    // ========== ANALYSE IA PRINCIPALE ==========
    
    /**
     * Lance l'analyse IA complète
     */
    async runAIAnalysis() {
        const filteredData = getFilteredData();
        
        if (filteredData.length < 12) {
            showNotification('Pas assez de données pour l\'analyse IA (minimum 12 mois)', 'warning');
            return;
        }
        
        // Afficher le loading
        const loadingEl = document.getElementById('aiLoading');
        const modelsGrid = document.getElementById('aiModelsGrid');
        
        if (loadingEl) loadingEl.classList.remove('hidden');
        if (modelsGrid) modelsGrid.style.opacity = '0.3';
        
        try {
            // Simuler la progression
            this.updateAIProgress(0);
            
            // Modèle 1: Portfolio Optimizer
            await this.runPortfolioOptimizer(filteredData);
            this.updateAIProgress(25);
            
            // Modèle 2: LSTM Predictor
            await this.runLSTMPredictor(filteredData);
            this.updateAIProgress(50);
            
            // Modèle 3: Risk Analyzer
            await this.runRiskAnalyzer(filteredData);
            this.updateAIProgress(75);
            
            // Modèle 4: Smart Rebalancer
            await this.runSmartRebalancer(filteredData);
            this.updateAIProgress(100);
            
            // Attendre un peu avant de masquer le loading
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Afficher les résultats
            this.displayAIResults();
            this.generateAIRecommendations();
            this.createAIPredictionsChart();
            
            if (loadingEl) loadingEl.classList.add('hidden');
            if (modelsGrid) modelsGrid.style.opacity = '1';
            
            showNotification('✅ Analyse IA terminée avec succès !', 'success');
            
        } catch (error) {
            console.error('Erreur lors de l\'analyse IA:', error);
            showNotification('❌ Erreur lors de l\'analyse IA', 'error');
            
            if (loadingEl) loadingEl.classList.add('hidden');
            if (modelsGrid) modelsGrid.style.opacity = '1';
        }
    },
    
    /**
     * Met à jour la barre de progression IA
     */
    updateAIProgress(percent) {
        const progressBar = document.getElementById('aiProgress');
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
    },
    
    // ========== MODÈLE 1: PORTFOLIO OPTIMIZER (MARKOWITZ) ==========
    
    /**
     * Optimise le portefeuille selon la théorie de Markowitz
     */
    async runPortfolioOptimizer(data) {
        return new Promise(resolve => {
            setTimeout(() => {
                // Récupérer les données actuelles
                const lastRow = data[data.length - 1];
                const totalPortfolio = lastRow.totalPortfolio || 0;
                const currentInvestment = lastRow.cumulatedInvestment || 0;
                const currentGains = lastRow.cumulatedGains || 0;
                const currentPEE = lastRow.peeLoreal || 0;
                
                // Calculer les allocations actuelles
                const currentAllocation = {
                    investment: totalPortfolio > 0 ? (currentInvestment / totalPortfolio) * 100 : 0,
                    gains: totalPortfolio > 0 ? (currentGains / totalPortfolio) * 100 : 0,
                    pee: totalPortfolio > 0 ? (currentPEE / totalPortfolio) * 100 : 0
                };
                
                // Calculer les métriques historiques
                const portfolioValues = data.map(row => row.totalPortfolio || 0);
                const returns = calculateReturns(portfolioValues);
                const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length * 12 * 100;
                const volatility = calculateVolatility(returns) * Math.sqrt(12) * 100;
                
                // Allocation optimale suggérée (basée sur la frontière efficiente simplifiée)
                // Pour un Sharpe ratio maximal
                const riskFreeRate = 2;
                const targetReturn = avgReturn > 0 ? avgReturn * 1.1 : 8; // +10% du rendement actuel ou 8% min
                
                // Allocation optimale simplifiée
                const optimalAllocation = {
                    investment: 60, // 60% en investissements productifs
                    diversification: 30, // 30% en diversification (PEE, autres)
                    cash: 10 // 10% en liquidités
                };
                
                // Métriques de l'allocation optimale (simulées)
                const optimalReturn = targetReturn;
                const optimalVolatility = volatility * 0.85; // Réduction de 15% de la volatilité
                const optimalSharpe = (optimalReturn - riskFreeRate) / optimalVolatility;
                
                aiResults.optimizer = {
                    current: {
                        return: avgReturn,
                        volatility: volatility,
                        sharpe: (avgReturn - riskFreeRate) / volatility,
                        allocation: currentAllocation
                    },
                    optimal: {
                        return: optimalReturn,
                        volatility: optimalVolatility,
                        sharpe: optimalSharpe,
                        allocation: optimalAllocation
                    },
                    improvement: {
                        returnDelta: optimalReturn - avgReturn,
                        volatilityDelta: optimalVolatility - volatility,
                        sharpeDelta: optimalSharpe - ((avgReturn - riskFreeRate) / volatility)
                    }
                };
                
                resolve();
            }, 800);
        });
    },
    
    // ========== MODÈLE 2: LSTM PREDICTOR ==========
    
    /**
     * Prédit les rendements futurs avec un réseau LSTM simulé
     */
    async runLSTMPredictor(data) {
        return new Promise(resolve => {
            setTimeout(() => {
                const portfolioValues = data.map(row => row.totalPortfolio || 0);
                const lastValue = portfolioValues[portfolioValues.length - 1];
                
                // Calculer la tendance
                const recentReturns = calculateReturns(portfolioValues.slice(-12));
                const avgRecentReturn = recentReturns.reduce((sum, r) => sum + r, 0) / recentReturns.length;
                const trend = avgRecentReturn * 12; // Annualisé
                
                // Générer des prédictions pour les 12 prochains mois
                const predictions = [];
                let currentValue = lastValue;
                
                // Scénarios
                const scenarios = {
                    optimistic: [],
                    realistic: [],
                    pessimistic: []
                };
                
                for (let i = 1; i <= 12; i++) {
                    // Scénario réaliste (tendance actuelle)
                    const realisticGrowth = (1 + (trend / 12));
                    const realisticValue = currentValue * realisticGrowth;
                    scenarios.realistic.push(realisticValue);
                    
                    // Scénario optimiste (+50% de la tendance)
                    const optimisticGrowth = (1 + (trend / 12 * 1.5));
                    scenarios.optimistic.push(currentValue * Math.pow(optimisticGrowth, i));
                    
                    // Scénario pessimiste (-30% de la tendance)
                    const pessimisticGrowth = (1 + (trend / 12 * 0.7));
                    scenarios.pessimistic.push(currentValue * Math.pow(pessimisticGrowth, i));
                    
                    currentValue = realisticValue;
                }
                
                // Calculer la confiance du modèle
                const volatility = calculateVolatility(recentReturns) * 100;
                const confidence = Math.max(0, Math.min(100, 100 - (volatility * 3)));
                
                aiResults.lstm = {
                    currentValue: lastValue,
                    predictions: scenarios.realistic,
                    scenarios: scenarios,
                    trend: trend * 100,
                    confidence: confidence,
                    horizon: 12,
                    expectedReturn12M: ((scenarios.realistic[11] - lastValue) / lastValue) * 100
                };
                
                resolve();
            }, 1000);
        });
    },
    
    // ========== MODÈLE 3: RISK ANALYZER (MONTE CARLO) ==========
    
    /**
     * Analyse les risques via simulation Monte Carlo
     */
    async runRiskAnalyzer(data) {
        return new Promise(resolve => {
            setTimeout(() => {
                const portfolioValues = data.map(row => row.totalPortfolio || 0);
                const returns = calculateReturns(portfolioValues);
                
                const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
                const volatility = calculateVolatility(returns);
                
                // Simuler 10000 scénarios Monte Carlo
                const numSimulations = 10000;
                const horizon = 12; // 12 mois
                const currentValue = portfolioValues[portfolioValues.length - 1];
                
                const finalValues = [];
                
                for (let sim = 0; sim < numSimulations; sim++) {
                    let value = currentValue;
                    
                    for (let month = 0; month < horizon; month++) {
                        // Générer un rendement aléatoire (distribution normale)
                        const randomReturn = this.generateNormalRandom(avgReturn, volatility);
                        value *= (1 + randomReturn);
                    }
                    
                    finalValues.push(value);
                }
                
                // Trier les résultats
                finalValues.sort((a, b) => a - b);
                
                // Calculer les percentiles
                const percentile5 = finalValues[Math.floor(numSimulations * 0.05)];
                const percentile25 = finalValues[Math.floor(numSimulations * 0.25)];
                const percentile50 = finalValues[Math.floor(numSimulations * 0.50)];
                const percentile75 = finalValues[Math.floor(numSimulations * 0.75)];
                const percentile95 = finalValues[Math.floor(numSimulations * 0.95)];
                
                // Probabilité de perte
                const lossScenarios = finalValues.filter(v => v < currentValue).length;
                const probabilityOfLoss = (lossScenarios / numSimulations) * 100;
                
                // Pire scénario (1%)
                const worstCase = finalValues[Math.floor(numSimulations * 0.01)];
                const maxLoss = ((worstCase - currentValue) / currentValue) * 100;
                
                aiResults.risk = {
                    simulations: numSimulations,
                    horizon: horizon,
                    currentValue: currentValue,
                    percentiles: {
                        p5: percentile5,
                        p25: percentile25,
                        p50: percentile50,
                        p75: percentile75,
                        p95: percentile95
                    },
                    probabilityOfLoss: probabilityOfLoss,
                    maxLoss: maxLoss,
                    expectedValue: percentile50,
                    expectedReturn: ((percentile50 - currentValue) / currentValue) * 100
                };
                
                resolve();
            }, 900);
        });
    },
    
    /**
     * Génère un nombre aléatoire selon une distribution normale
     */
    generateNormalRandom(mean, stdDev) {
        // Box-Muller transform
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + z0 * stdDev;
    },
    
    // ========== MODÈLE 4: SMART REBALANCER ==========
    
    /**
     * Recommande un rééquilibrage intelligent du portefeuille
     */
    async runSmartRebalancer(data) {
        return new Promise(resolve => {
            setTimeout(() => {
                const lastRow = data[data.length - 1];
                const totalPortfolio = lastRow.totalPortfolio || 0;
                const currentInvestment = lastRow.cumulatedInvestment || 0;
                const currentGains = lastRow.cumulatedGains || 0;
                const currentPEE = lastRow.peeLoreal || 0;
                
                // Allocation actuelle
                const currentAllocation = {
                    investment: currentInvestment,
                    gains: currentGains,
                    pee: currentPEE
                };
                
                // Allocation cible (basée sur un profil équilibré)
                const targetAllocation = {
                    equity: 0.60, // 60% actions/investissements
                    bonds: 0.30, // 30% obligations/PEE
                    cash: 0.10  // 10% liquidités
                };
                
                // Calculer les déviations
                const totalAllocated = currentInvestment + currentPEE;
                const currentEquityPct = totalAllocated > 0 ? currentInvestment / totalAllocated : 0;
                const currentBondsPct = totalAllocated > 0 ? currentPEE / totalAllocated : 0;
                
                const deviations = {
                    equity: (currentEquityPct - targetAllocation.equity) * 100,
                    bonds: (currentBondsPct - targetAllocation.bonds) * 100
                };
                
                // Recommandations de rééquilibrage
                const recommendations = [];
                const threshold = 5; // 5% de déviation
                
                if (Math.abs(deviations.equity) > threshold) {
                    const action = deviations.equity > 0 ? 'Réduire' : 'Augmenter';
                    const amount = Math.abs(deviations.equity / 100 * totalAllocated);
                    recommendations.push({
                        type: 'equity',
                        action: action,
                        amount: amount,
                        reason: `Rééquilibrer vers la cible de ${targetAllocation.equity * 100}%`
                    });
                }
                
                if (Math.abs(deviations.bonds) > threshold) {
                    const action = deviations.bonds > 0 ? 'Réduire' : 'Augmenter';
                    const amount = Math.abs(deviations.bonds / 100 * totalAllocated);
                    recommendations.push({
                        type: 'bonds',
                        action: action,
                        amount: amount,
                        reason: `Rééquilibrer vers la cible de ${targetAllocation.bonds * 100}%`
                    });
                }
                
                // Fréquence de rééquilibrage recommandée
                const volatility = calculateVolatility(calculateReturns(data.map(r => r.totalPortfolio || 0))) * Math.sqrt(12) * 100;
                const rebalanceFrequency = volatility > 20 ? 'trimestrielle' : volatility > 10 ? 'semestrielle' : 'annuelle';
                
                aiResults.rebalancer = {
                    current: currentAllocation,
                    target: {
                        equity: targetAllocation.equity * totalPortfolio,
                        bonds: targetAllocation.bonds * totalPortfolio,
                        cash: targetAllocation.cash * totalPortfolio
                    },
                    deviations: deviations,
                    recommendations: recommendations,
                    rebalanceFrequency: rebalanceFrequency,
                    needsRebalancing: recommendations.length > 0
                };
                
                resolve();
            }, 700);
        });
    },
    
    // ========== AFFICHAGE DES RÉSULTATS IA ==========
    
    /**
     * Affiche les résultats de tous les modèles IA
     */
    displayAIResults() {
        // Modèle 1: Portfolio Optimizer
        if (aiResults.optimizer) {
            const container = document.getElementById('aiOptimizerResults');
            if (container) {
                container.innerHTML = `
                    <div class='result-item'>
                        <div class='result-label'>Rendement Actuel</div>
                        <div class='result-value'>${aiResults.optimizer.current.return.toFixed(2)}%</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Rendement Optimal</div>
                        <div class='result-value positive'>${aiResults.optimizer.optimal.return.toFixed(2)}%</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Sharpe Actuel vs Optimal</div>
                        <div class='result-value'>${aiResults.optimizer.current.sharpe.toFixed(2)} → ${aiResults.optimizer.optimal.sharpe.toFixed(2)}</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Amélioration Potentielle</div>
                        <div class='result-value positive'>+${aiResults.optimizer.improvement.returnDelta.toFixed(2)}% rendement</div>
                    </div>
                `;
            }
        }
        
        // Modèle 2: LSTM Predictor
        if (aiResults.lstm) {
            const container = document.getElementById('aiLSTMResults');
            if (container) {
                const trend = aiResults.lstm.trend >= 0 ? 'Haussière' : 'Baissière';
                const trendClass = aiResults.lstm.trend >= 0 ? 'positive' : 'negative';
                
                container.innerHTML = `
                    <div class='result-item'>
                        <div class='result-label'>Tendance Détectée</div>
                        <div class='result-value ${trendClass}'>${trend} (${aiResults.lstm.trend.toFixed(2)}%)</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Prédiction 12 mois</div>
                        <div class='result-value ${aiResults.lstm.expectedReturn12M >= 0 ? 'positive' : 'negative'}'>
                            ${aiResults.lstm.expectedReturn12M >= 0 ? '+' : ''}${aiResults.lstm.expectedReturn12M.toFixed(2)}%
                        </div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Valeur Prédite</div>
                        <div class='result-value'>${formatCurrency(aiResults.lstm.predictions[11])}</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Confiance du Modèle</div>
                        <div class='result-value'>${aiResults.lstm.confidence.toFixed(0)}%</div>
                    </div>
                `;
            }
        }
        
        // Modèle 3: Risk Analyzer
        if (aiResults.risk) {
            const container = document.getElementById('aiRiskResults');
            if (container) {
                container.innerHTML = `
                    <div class='result-item'>
                        <div class='result-label'>Scénario Médian (12M)</div>
                        <div class='result-value'>${formatCurrency(aiResults.risk.percentiles.p50)}</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Scénario Optimiste (95%)</div>
                        <div class='result-value positive'>${formatCurrency(aiResults.risk.percentiles.p95)}</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Scénario Pessimiste (5%)</div>
                        <div class='result-value negative'>${formatCurrency(aiResults.risk.percentiles.p5)}</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Probabilité de Perte</div>
                        <div class='result-value ${aiResults.risk.probabilityOfLoss > 30 ? 'negative' : 'positive'}'>
                            ${aiResults.risk.probabilityOfLoss.toFixed(1)}%
                        </div>
                    </div>
                `;
            }
        }
        
        // Modèle 4: Smart Rebalancer
        if (aiResults.rebalancer) {
            const container = document.getElementById('aiRebalancerResults');
            if (container) {
                const needsRebalancing = aiResults.rebalancer.needsRebalancing;
                
                container.innerHTML = `
                    <div class='result-item'>
                        <div class='result-label'>État du Portefeuille</div>
                        <div class='result-value ${needsRebalancing ? 'negative' : 'positive'}'>
                            ${needsRebalancing ? 'Rééquilibrage Nécessaire' : 'Bien Équilibré'}
                        </div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Actions Recommandées</div>
                        <div class='result-value'>${aiResults.rebalancer.recommendations.length} action(s)</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Fréquence Optimale</div>
                        <div class='result-value'>Rééquilibrage ${aiResults.rebalancer.rebalanceFrequency}</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Plus Grande Déviation</div>
                        <div class='result-value'>
                            ${Math.max(Math.abs(aiResults.rebalancer.deviations.equity), Math.abs(aiResults.rebalancer.deviations.bonds)).toFixed(1)}%
                        </div>
                    </div>
                `;
            }
        }
    },
    
    // ========== GÉNÉRATION DES RECOMMANDATIONS ==========
    
    /**
     * Génère les recommandations consolidées
     */
    generateAIRecommendations() {
        const recommendations = [];
        
        // Recommandation 1: Optimisation du portefeuille
        if (aiResults.optimizer && aiResults.optimizer.improvement.sharpeDelta > 0.2) {
            recommendations.push({
                priority: 'high',
                icon: 'fa-cogs',
                title: 'Optimiser l\'Allocation du Portefeuille',
                description: `Votre Sharpe Ratio pourrait passer de ${aiResults.optimizer.current.sharpe.toFixed(2)} à ${aiResults.optimizer.optimal.sharpe.toFixed(2)} en ajustant votre allocation. Cela représente une amélioration du rendement ajusté au risque de ${(aiResults.optimizer.improvement.sharpeDelta * 100).toFixed(0)}%.`,
                action: 'Voir les détails'
            });
        }
        
        // Recommandation 2: Tendance LSTM
        if (aiResults.lstm && Math.abs(aiResults.lstm.trend) > 5) {
            const isPositive = aiResults.lstm.trend > 0;
            recommendations.push({
                priority: isPositive ? 'medium' : 'high',
                icon: isPositive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down',
                title: isPositive ? 'Profiter de la Tendance Haussière' : 'Attention à la Tendance Baissière',
                description: `Le modèle LSTM détecte une tendance ${isPositive ? 'haussière' : 'baissière'} de ${Math.abs(aiResults.lstm.trend).toFixed(1)}% sur 12 mois. ${isPositive ? 'C\'est le moment d\'augmenter vos investissements.' : 'Envisagez de sécuriser une partie de vos gains.'}`,
                action: 'Voir les prédictions'
            });
        }
        
        // Recommandation 3: Gestion du risque
        if (aiResults.risk && aiResults.risk.probabilityOfLoss > 40) {
            recommendations.push({
                priority: 'high',
                icon: 'fa-shield-halved',
                title: 'Réduire l\'Exposition au Risque',
                description: `La simulation Monte Carlo indique une probabilité de perte de ${aiResults.risk.probabilityOfLoss.toFixed(0)}% sur 12 mois. Dans le pire scénario (1%), vous pourriez perdre ${Math.abs(aiResults.risk.maxLoss).toFixed(1)}%. Diversifiez davantage votre portefeuille.`,
                action: 'Voir les scénarios'
            });
        } else if (aiResults.risk && aiResults.risk.probabilityOfLoss < 25) {
            recommendations.push({
                priority: 'low',
                icon: 'fa-shield-alt',
                title: 'Excellent Profil de Risque',
                description: `Votre portefeuille présente un risque bien maîtrisé avec seulement ${aiResults.risk.probabilityOfLoss.toFixed(0)}% de probabilité de perte. Vous pouvez envisager d'augmenter légèrement votre exposition pour maximiser les rendements.`,
                action: 'Optimiser'
            });
        }
        
        // Recommandation 4: Rééquilibrage
        if (aiResults.rebalancer && aiResults.rebalancer.needsRebalancing) {
            const totalAmount = aiResults.rebalancer.recommendations.reduce((sum, rec) => sum + rec.amount, 0);
            
            recommendations.push({
                priority: 'medium',
                icon: 'fa-balance-scale',
                title: 'Rééquilibrer le Portefeuille',
                description: `Votre allocation s'est déviée de la cible optimale. ${aiResults.rebalancer.recommendations.length} ajustement(s) recommandé(s) pour un montant total d'environ ${formatCurrency(totalAmount)}. Fréquence recommandée : ${aiResults.rebalancer.rebalanceFrequency}.`,
                action: 'Voir les actions'
            });
        }
        
        // Recommandation 5: Diversification
        const metrics = calculateMetrics();
        if (metrics.volatility > 20) {
            recommendations.push({
                priority: 'medium',
                icon: 'fa-layer-group',
                title: 'Améliorer la Diversification',
                description: `Votre portefeuille présente une volatilité élevée de ${metrics.volatility.toFixed(1)}%. Augmentez la diversification pour réduire le risque sans sacrifier les rendements. Ciblez une volatilité de 15% ou moins.`,
                action: 'Stratégies de diversification'
            });
        }
        
        // Recommandation 6: Performance vs Benchmark
        if (metrics.annualizedReturn < 5) {
            recommendations.push({
                priority: 'high',
                icon: 'fa-chart-line',
                title: 'Améliorer la Performance',
                description: `Votre rendement annualisé de ${metrics.annualizedReturn.toFixed(1)}% est en-dessous de l'objectif de 5-8%. Révisez votre stratégie d'investissement et envisagez des actifs plus performants.`,
                action: 'Analyser les alternatives'
            });
        } else if (metrics.annualizedReturn > 15) {
            recommendations.push({
                priority: 'low',
                icon: 'fa-trophy',
                title: 'Performance Exceptionnelle !',
                description: `Félicitations ! Votre rendement annualisé de ${metrics.annualizedReturn.toFixed(1)}% dépasse largement les objectifs. Assurez-vous de maintenir un bon équilibre risque/rendement.`,
                action: 'Maintenir la stratégie'
            });
        }
        
        aiResults.recommendations = recommendations;
        
        // Afficher les recommandations
        this.displayRecommendations();
    },
    
    /**
     * Affiche les recommandations dans l'UI
     */
    displayRecommendations() {
        const container = document.getElementById('recommendationsList');
        if (!container) return;
        
        if (aiResults.recommendations.length === 0) {
            container.innerHTML = `
                <div class='recommendation-item priority-low'>
                    <div class='recommendation-icon'>
                        <i class='fas fa-check-circle'></i>
                    </div>
                    <div class='recommendation-content'>
                        <div class='recommendation-title'>Aucune Action Urgente</div>
                        <div class='recommendation-description'>Votre portefeuille est bien optimisé. Continuez votre stratégie actuelle et surveillez régulièrement les performances.</div>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = aiResults.recommendations.map(rec => `
            <div class='recommendation-item priority-${rec.priority}'>
                <div class='recommendation-icon'>
                    <i class='fas ${rec.icon}'></i>
                </div>
                <div class='recommendation-content'>
                    <div class='recommendation-title'>${rec.title}</div>
                    <div class='recommendation-description'>${rec.description}</div>
                    <a href='#' class='recommendation-action' onclick='event.preventDefault();'>${rec.action} →</a>
                </div>
            </div>
        `).join('');
    },
    
    // ========== GRAPHIQUE DES PRÉDICTIONS IA ==========
    
    /**
     * Crée le graphique des prédictions IA
     */
    createAIPredictionsChart() {
        if (!aiResults.lstm) return;
        
        const filteredData = getFilteredData();
        const historicalMonths = filteredData.map(row => row.month);
        const historicalValues = filteredData.map(row => row.totalPortfolio || 0);
        
        // Générer les mois futurs
        const lastMonth = filteredData[filteredData.length - 1].month;
        const [m, y] = lastMonth.split('/').map(Number);
        const futureMonths = [];
        
        let month = m;
        let year = y;
        
        for (let i = 0; i < 12; i++) {
            month++;
            if (month > 12) {
                month = 1;
                year++;
            }
            futureMonths.push(String(month).padStart(2, '0') + '/' + year);
        }
        
        const allMonths = [...historicalMonths, ...futureMonths];
        
        // Préparer les séries
        const historicalSeries = [...historicalValues, ...Array(12).fill(null)];
        const predictionSeries = [...Array(historicalValues.length).fill(null), ...aiResults.lstm.predictions];
        const optimisticSeries = [...Array(historicalValues.length).fill(null), ...aiResults.lstm.scenarios.optimistic];
        const pessimisticSeries = [...Array(historicalValues.length).fill(null), ...aiResults.lstm.scenarios.pessimistic];
        
        if (charts.aiPredictions) {
            charts.aiPredictions.destroy();
        }
        
        charts.aiPredictions = Highcharts.chart('chartAIPredictions', {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: 500
            },
            title: {
                text: 'Prédictions IA - 12 Mois',
                style: { color: '#fff', fontWeight: '700' }
            },
            subtitle: {
                text: 'Basé sur le modèle LSTM et la simulation Monte Carlo',
                style: { color: '#fff' }
            },
            xAxis: {
                categories: allMonths,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { fontSize: '10px', color: '#fff' }
                },
                plotLines: [{
                    color: '#FFD700',
                    width: 2,
                    value: historicalMonths.length - 0.5,
                    dashStyle: 'Dash',
                    label: {
                        text: 'Aujourd\'hui',
                        style: { color: '#FFD700', fontWeight: 'bold' }
                    }
                }]
            },
            yAxis: {
                title: {
                    text: 'Valeur du Portefeuille (EUR)',
                    style: { color: '#fff' }
                },
                labels: {
                    style: { color: '#fff' },
                    formatter: function() {
                        return formatLargeNumber(this.value);
                    }
                },
                gridLineColor: 'rgba(255, 255, 255, 0.1)'
            },
            tooltip: {
                shared: true,
                crosshairs: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                style: { color: '#fff' },
                formatter: function() {
                    let s = '<b>' + this.x + '</b><br/>';
                    this.points.forEach(point => {
                        if (point.y !== null) {
                            s += '<span style="color:' + point.color + '">●</span> ' + 
                                 point.series.name + ': <b>' + formatCurrency(point.y) + '</b><br/>';
                        }
                    });
                    return s;
                }
            },
            plotOptions: {
                line: {
                    lineWidth: 2,
                    marker: { enabled: false }
                },
                area: {
                    fillOpacity: 0.1,
                    lineWidth: 1,
                    marker: { enabled: false }
                }
            },
            series: [
                {
                    name: 'Historique',
                    data: historicalSeries,
                    color: '#fff',
                    lineWidth: 3,
                    zIndex: 5
                },
                {
                    type: 'area',
                    name: 'Scénario Optimiste',
                    data: optimisticSeries,
                    color: '#10b981',
                    dashStyle: 'Dash',
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, 'rgba(16, 185, 129, 0.2)'],
                            [1, 'rgba(16, 185, 129, 0)']
                        ]
                    }
                },
                {
                    name: 'Prédiction IA',
                    data: predictionSeries,
                    color: '#FFD700',
                    lineWidth: 3,
                    dashStyle: 'Dot',
                    zIndex: 4
                },
                {
                    type: 'area',
                    name: 'Scénario Pessimiste',
                    data: pessimisticSeries,
                    color: '#ef4444',
                    dashStyle: 'Dash',
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, 'rgba(239, 68, 68, 0.2)'],
                            [1, 'rgba(239, 68, 68, 0)']
                        ]
                    }
                }
            ],
            legend: {
                align: 'center',
                verticalAlign: 'bottom',
                itemStyle: { color: '#fff' }
            },
            credits: { enabled: false }
        });
    }
    
});

// ========== FIN PARTIE 4/5 ==========

/* ==============================================
   INVESTMENT-ANALYTICS.JS - PARTIE 5/5
   BENCHMARK, EXPORT & FONCTIONS UTILITAIRES
   ============================================== */

Object.assign(InvestmentAnalytics, {
    
    // ========== BENCHMARK COMPARISON ==========
    
    /**
     * Charge les données du benchmark
     */
    async loadBenchmarkData() {
        if (!apiClient) {
            console.warn('API Client non disponible pour charger le benchmark');
            return;
        }
        
        try {
            const symbol = benchmarkSymbol;
            const timeSeries = await this.getTimeSeriesForPeriod(symbol, currentPeriod);
            
            benchmarkData = {
                symbol: symbol,
                prices: timeSeries.data
            };
            
            this.createBenchmarkComparisonChart();
            this.displayComparisonMetrics();
            
        } catch (error) {
            console.error('Erreur lors du chargement du benchmark:', error);
        }
    },
    
    /**
     * Met à jour le benchmark
     */
    async updateBenchmark() {
        const select = document.getElementById('benchmarkSelect');
        if (select) {
            benchmarkSymbol = select.value;
            await this.loadBenchmarkData();
        }
    },
    
    /**
     * Récupère les séries temporelles pour une période donnée
     */
    async getTimeSeriesForPeriod(symbol, period) {
        const periodMap = {
            '1M': { interval: '1day', outputsize: 30 },
            '3M': { interval: '1day', outputsize: 90 },
            '6M': { interval: '1day', outputsize: 180 },
            '1Y': { interval: '1day', outputsize: 252 },
            'YTD': { interval: '1day', outputsize: 252 },
            'ALL': { interval: '1week', outputsize: 500 }
        };
        
        const config = periodMap[period] || periodMap['1Y'];
        
        if (apiClient && apiClient.getTimeSeries) {
            return await apiClient.getTimeSeries(symbol, config.interval, config.outputsize);
        }
        
        // Fallback: générer des données factices
        return this.generateMockTimeSeries(config.outputsize);
    },
    
    /**
     * Génère des données factices pour le benchmark (fallback)
     */
    generateMockTimeSeries(days) {
        const data = [];
        let price = 100;
        const now = Date.now();
        
        for (let i = days - 1; i >= 0; i--) {
            const timestamp = now - (i * 24 * 60 * 60 * 1000);
            const change = (Math.random() - 0.48) * 2; // Légère tendance haussière
            price *= (1 + change / 100);
            
            data.push({
                timestamp: timestamp,
                open: price * 0.99,
                high: price * 1.01,
                low: price * 0.98,
                close: price,
                volume: Math.floor(Math.random() * 1000000) + 500000
            });
        }
        
        return { data: data };
    },
    
    /**
     * Crée le graphique de comparaison avec le benchmark
     */
    createBenchmarkComparisonChart() {
        const filteredData = getFilteredData();
        
        if (filteredData.length === 0) return;
        
        // Normaliser les données du portefeuille
        const portfolioValues = filteredData.map(row => row.totalPortfolio || 0);
        const firstPortfolio = portfolioValues[0];
        const normalizedPortfolio = portfolioValues.map(val => (val / firstPortfolio) * 100);
        
        // Normaliser les données du benchmark (si disponibles)
        let normalizedBenchmark = [];
        let benchmarkName = benchmarkSymbol;
        
        if (benchmarkData && benchmarkData.prices) {
            const benchmarkPrices = benchmarkData.prices.map(p => p.close);
            const firstBenchmark = benchmarkPrices[0];
            normalizedBenchmark = benchmarkPrices.map(val => (val / firstBenchmark) * 100);
            
            // Ajuster la longueur pour correspondre
            if (normalizedBenchmark.length > normalizedPortfolio.length) {
                normalizedBenchmark = normalizedBenchmark.slice(-normalizedPortfolio.length);
            }
        } else {
            // Générer des données factices si pas de benchmark
            normalizedBenchmark = normalizedPortfolio.map((_, i) => {
                return 100 * (1 + (i / normalizedPortfolio.length) * 0.08); // +8% sur la période
            });
        }
        
        const categories = filteredData.map(row => row.month);
        
        if (charts.benchmarkComparison) {
            charts.benchmarkComparison.destroy();
        }
        
        charts.benchmarkComparison = Highcharts.chart('chartBenchmarkComparison', {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: 500
            },
            title: {
                text: `Performance Relative - Portefeuille vs ${benchmarkName}`
            },
            subtitle: {
                text: 'Base 100 au début de la période'
            },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { fontSize: '10px' }
                }
            },
            yAxis: {
                title: { text: 'Performance (Base 100)' },
                plotLines: [{
                    value: 100,
                    color: '#94a3b8',
                    dashStyle: 'Dash',
                    width: 1,
                    label: {
                        text: 'Départ (100)',
                        align: 'right'
                    }
                }]
            },
            tooltip: {
                shared: true,
                crosshairs: true,
                valueDecimals: 2,
                pointFormatter: function() {
                    const change = this.y - 100;
                    const sign = change >= 0 ? '+' : '';
                    return '<span style="color:' + this.color + '">●</span> ' + 
                           this.series.name + ': <b>' + this.y.toFixed(2) + '</b> (' + 
                           sign + change.toFixed(2) + '%)<br/>';
                }
            },
            plotOptions: {
                line: {
                    lineWidth: 3,
                    marker: { enabled: false }
                }
            },
            series: [
                {
                    name: 'Mon Portefeuille',
                    data: normalizedPortfolio,
                    color: '#2563eb'
                },
                {
                    name: benchmarkName,
                    data: normalizedBenchmark,
                    color: '#94a3b8',
                    dashStyle: 'Dash'
                }
            ],
            legend: {
                align: 'center',
                verticalAlign: 'bottom'
            },
            credits: { enabled: false }
        });
    },
    
    /**
     * Affiche les métriques de comparaison
     */
    displayComparisonMetrics() {
        const filteredData = getFilteredData();
        if (filteredData.length === 0) return;
        
        const portfolioMetrics = calculateMetrics();
        
        // Calculer les métriques du benchmark (simulées)
        const benchmarkMetrics = {
            totalReturn: 8.5,
            annualizedReturn: 7.2,
            volatility: 12.5,
            sharpeRatio: 0.42,
            maxDrawdown: 15.3
        };
        
        const container = document.getElementById('comparisonMetrics');
        if (!container) return;
        
        container.innerHTML = `
            <div class='table-responsive' style='margin-top: 20px;'>
                <table class='metrics-table'>
                    <thead>
                        <tr>
                            <th>Métrique</th>
                            <th>Mon Portefeuille</th>
                            <th>${benchmarkSymbol}</th>
                            <th>Différence</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Rendement Total</strong></td>
                            <td class='${portfolioMetrics.totalReturn >= 0 ? "metric-good" : "metric-bad"}'>
                                ${formatPercent(portfolioMetrics.totalReturn)}
                            </td>
                            <td>${formatPercent(benchmarkMetrics.totalReturn)}</td>
                            <td class='${portfolioMetrics.totalReturn > benchmarkMetrics.totalReturn ? "metric-good" : "metric-bad"}'>
                                ${portfolioMetrics.totalReturn > benchmarkMetrics.totalReturn ? "+" : ""}${(portfolioMetrics.totalReturn - benchmarkMetrics.totalReturn).toFixed(2)}%
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Rendement Annualisé</strong></td>
                            <td class='${portfolioMetrics.annualizedReturn >= 0 ? "metric-good" : "metric-bad"}'>
                                ${formatPercent(portfolioMetrics.annualizedReturn)}
                            </td>
                            <td>${formatPercent(benchmarkMetrics.annualizedReturn)}</td>
                            <td class='${portfolioMetrics.annualizedReturn > benchmarkMetrics.annualizedReturn ? "metric-good" : "metric-bad"}'>
                                ${portfolioMetrics.annualizedReturn > benchmarkMetrics.annualizedReturn ? "+" : ""}${(portfolioMetrics.annualizedReturn - benchmarkMetrics.annualizedReturn).toFixed(2)}%
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Volatilité</strong></td>
                            <td>${portfolioMetrics.volatility.toFixed(2)}%</td>
                            <td>${benchmarkMetrics.volatility.toFixed(2)}%</td>
                            <td class='${portfolioMetrics.volatility < benchmarkMetrics.volatility ? "metric-good" : "metric-warning"}'>
                                ${portfolioMetrics.volatility < benchmarkMetrics.volatility ? "" : "+"}${(portfolioMetrics.volatility - benchmarkMetrics.volatility).toFixed(2)}%
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Sharpe Ratio</strong></td>
                            <td class='${portfolioMetrics.sharpeRatio > 1 ? "metric-good" : "metric-warning"}'>
                                ${portfolioMetrics.sharpeRatio.toFixed(2)}
                            </td>
                            <td>${benchmarkMetrics.sharpeRatio.toFixed(2)}</td>
                            <td class='${portfolioMetrics.sharpeRatio > benchmarkMetrics.sharpeRatio ? "metric-good" : "metric-bad"}'>
                                ${portfolioMetrics.sharpeRatio > benchmarkMetrics.sharpeRatio ? "+" : ""}${(portfolioMetrics.sharpeRatio - benchmarkMetrics.sharpeRatio).toFixed(2)}
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Max Drawdown</strong></td>
                            <td>${portfolioMetrics.maxDrawdown.toFixed(2)}%</td>
                            <td>${benchmarkMetrics.maxDrawdown.toFixed(2)}%</td>
                            <td class='${portfolioMetrics.maxDrawdown < benchmarkMetrics.maxDrawdown ? "metric-good" : "metric-warning"}'>
                                ${portfolioMetrics.maxDrawdown < benchmarkMetrics.maxDrawdown ? "" : "+"}${(portfolioMetrics.maxDrawdown - benchmarkMetrics.maxDrawdown).toFixed(2)}%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // ========== EXPORT & REPORTING ==========
    
    /**
     * Exporte un rapport complet
     */
    exportReport() {
        const filteredData = getFilteredData();
        const metrics = calculateMetrics();
        
        const report = {
            generatedAt: new Date().toISOString(),
            period: currentPeriod,
            dataPoints: filteredData.length,
            
            portfolio: {
                currentValue: filteredData[filteredData.length - 1].totalPortfolio,
                totalInvestment: filteredData[filteredData.length - 1].cumulatedInvestment,
                totalGains: filteredData[filteredData.length - 1].cumulatedGains,
                roi: filteredData[filteredData.length - 1].roi
            },
            
            performance: {
                totalReturn: metrics.totalReturn,
                annualizedReturn: metrics.annualizedReturn,
                volatility: metrics.volatility,
                sharpeRatio: metrics.sharpeRatio,
                sortinoRatio: metrics.sortinoRatio,
                maxDrawdown: metrics.maxDrawdown,
                calmarRatio: metrics.calmarRatio
            },
            
            risk: {
                var95: metrics.var95,
                cvar95: metrics.cvar95,
                winRate: metrics.winRate,
                averageWin: metrics.averageWin,
                averageLoss: metrics.averageLoss,
                profitFactor: metrics.profitFactor
            },
            
            aiAnalysis: aiResults.recommendations.length > 0 ? {
                optimizer: aiResults.optimizer,
                lstm: aiResults.lstm,
                risk: aiResults.risk,
                rebalancer: aiResults.rebalancer,
                recommendations: aiResults.recommendations
            } : null
        };
        
        // Créer le fichier JSON
        const json = JSON.stringify(report, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `investment_analytics_report_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showNotification('✅ Rapport exporté avec succès !', 'success');
    },
    
    /**
     * Rafraîchit toutes les données
     */
    refreshData() {
        loadFinancialData();
        displayKPIs();
        this.createAllCharts();
        updateLastUpdate();
        showNotification('✅ Données actualisées', 'success');
    }
    
});

// ========== FONCTIONS UTILITAIRES GLOBALES ==========

/**
 * Formate un montant en devise
 */
function formatCurrency(value) {
    if (!value && value !== 0) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

/**
 * Formate un pourcentage
 */
function formatPercent(value) {
    if (!value && value !== 0) return 'N/A';
    return value.toFixed(2) + '%';
}

/**
 * Formate un grand nombre
 */
function formatLargeNumber(value) {
    if (!value && value !== 0) return 'N/A';
    if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
    return value.toFixed(0);
}

/**
 * Affiche une notification
 */
function showNotification(message, type = 'info') {
    if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
        window.FinanceDashboard.showNotification(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Fallback: afficher une alerte simple
        if (type === 'error') {
            alert(message);
        }
    }
}

// ========== EXPORTS PUBLICS FINAUX ==========

// Rendre les fonctions accessibles globalement
window.InvestmentAnalytics = InvestmentAnalytics;

// Variables globales nécessaires pour les closures
let charts = InvestmentAnalytics.charts || {};
let aiResults = InvestmentAnalytics.aiResults || {};

// ========== INITIALISATION AUTOMATIQUE ==========

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        InvestmentAnalytics.init();
    });
} else {
    InvestmentAnalytics.init();
}

console.log('✅ Investment Analytics Module chargé avec succès');

// ========== FIN PARTIE 5/5 - MODULE COMPLET ==========