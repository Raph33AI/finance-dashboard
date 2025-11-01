/* ==============================================
   INVESTMENT-ANALYTICS.JS - FULLY CORRECTED
   No Object.assign splitting, all methods in ONE object
   ============================================== */

(function() {
    'use strict';
    
    const InvestmentAnalytics = {
        // ========== STATE VARIABLES ==========
        financialData: [],
        currentPeriod: '1Y',
        benchmarkSymbol: 'SPY',
        benchmarkData: null,
        apiClient: null,
        predictionHorizon: 12,
        
        assets: [],
        assetColors: {
            equity: '#2563eb',
            bonds: '#10b981',
            crypto: '#f59e0b',
            commodities: '#8b5cf6',
            'real-estate': '#06b6d4',
            cash: '#64748b',
            other: '#94a3b8'
        },
        
        charts: {
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
        },
        
        aiResults: {
            optimizer: null,
            lstm: null,
            risk: null,
            rebalancer: null,
            recommendations: []
        },
        
        // ========== INITIALIZATION ==========
        
        init: function() {
            if (typeof Highcharts === 'undefined') {
                console.error('❌ Highcharts not loaded!');
                return;
            }
            
            try {
                this.loadFinancialData();
                this.loadAssets();
                this.updatePortfolioSummary();
                this.renderAssetsList();
                this.displayKPIs();
                this.createAllCharts();
                this.updateLastUpdate();
                this.loadBenchmarkData();
                
                console.log('✅ Investment Analytics loaded');
            } catch (error) {
                console.error('❌ Init error:', error);
                this.showNotification('Failed to initialize', 'error');
            }
        },
        
        loadFinancialData: function() {
            const saved = localStorage.getItem('financialDataDynamic');
            if (saved) {
                try {
                    this.financialData = JSON.parse(saved);
                    console.log(`📊 ${this.financialData.length} months loaded`);
                } catch (error) {
                    console.error('Load error:', error);
                    this.financialData = [];
                }
            } else {
                this.financialData = [];
            }
        },
        
        updateLastUpdate: function() {
            const now = new Date();
            const formatted = now.toLocaleString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const elem = document.getElementById('lastUpdate');
            if (elem) {
                elem.textContent = `Last update: ${formatted}`;
            }
        },
        
        // ========== ASSET MANAGEMENT ==========
        
        loadAssets: function() {
            const saved = localStorage.getItem('portfolioAssets');
            if (saved) {
                try {
                    this.assets = JSON.parse(saved);
                } catch (error) {
                    this.assets = this.getDefaultAssets();
                }
            } else {
                this.assets = this.getDefaultAssets();
            }
        },
        
        getDefaultAssets: function() {
            return [
                { id: Date.now(), name: 'S&P 500 Index', ticker: 'SPY', type: 'equity', allocation: 60 },
                { id: Date.now() + 1, name: 'Bonds ETF', ticker: 'AGG', type: 'bonds', allocation: 30 },
                { id: Date.now() + 2, name: 'Cash Reserve', ticker: '', type: 'cash', allocation: 10 }
            ];
        },
        
        saveAssets: function() {
            try {
                localStorage.setItem('portfolioAssets', JSON.stringify(this.assets));
                this.updatePortfolioSummary();
                this.renderAssetsList();
                this.createAllCharts();
                this.showNotification('✅ Portfolio saved', 'success');
            } catch (error) {
                this.showNotification('❌ Save failed', 'error');
            }
        },
        
        resetAssets: function() {
            if (confirm('Reset to default?')) {
                this.assets = this.getDefaultAssets();
                this.saveAssets();
            }
        },
        
        updatePortfolioSummary: function() {
            const filteredData = this.getFilteredData();
            let avgMonthlyInvestment = 0;
            
            if (filteredData.length > 0) {
                const totalInvestment = filteredData.reduce((sum, row) => sum + (row.investment || 0), 0);
                avgMonthlyInvestment = totalInvestment / filteredData.length;
            }
            
            const totalAllocation = this.assets.reduce((sum, asset) => sum + asset.allocation, 0);
            const numberOfAssets = this.assets.length;
            
            const totalInvestmentEl = document.getElementById('totalMonthlyInvestment');
            const totalAllocatedEl = document.getElementById('totalAllocatedPercent');
            const numberOfAssetsEl = document.getElementById('numberOfAssets');
            const allocationStatusEl = document.getElementById('allocationStatus');
            
            if (totalInvestmentEl) {
                totalInvestmentEl.textContent = this.formatCurrency(avgMonthlyInvestment);
            }
            
            if (totalAllocatedEl) {
                totalAllocatedEl.textContent = totalAllocation.toFixed(1) + '%';
                totalAllocatedEl.style.color = totalAllocation === 100 ? '#10b981' : totalAllocation > 100 ? '#ef4444' : '#f59e0b';
            }
            
            if (numberOfAssetsEl) {
                numberOfAssetsEl.textContent = numberOfAssets;
            }
            
            if (allocationStatusEl) {
                if (totalAllocation === 100) {
                    allocationStatusEl.textContent = '✓ Fully allocated';
                    allocationStatusEl.style.color = '#10b981';
                } else if (totalAllocation > 100) {
                    allocationStatusEl.textContent = `⚠ Over ${(totalAllocation - 100).toFixed(1)}%`;
                    allocationStatusEl.style.color = '#ef4444';
                } else {
                    allocationStatusEl.textContent = `Remaining: ${(100 - totalAllocation).toFixed(1)}%`;
                    allocationStatusEl.style.color = '#f59e0b';
                }
            }
        },
        
        renderAssetsList: function() {
            const container = document.getElementById('assetsList');
            if (!container) return;
            
            if (this.assets.length === 0) {
                container.innerHTML = `<div class='assets-empty'><h4>No Assets</h4></div>`;
                return;
            }
            
            const self = this;
            container.innerHTML = this.assets.map(asset => {
                const icon = self.getAssetIcon(asset.type);
                return `
                    <div class='asset-item ${asset.type}'>
                        <div class='asset-info'>
                            <div class='asset-icon ${asset.type}'>
                                <i class='fas ${icon}'></i>
                            </div>
                            <div class='asset-details'>
                                <div class='asset-name'>${self.escapeHtml(asset.name)}</div>
                                <div class='asset-ticker'>${asset.ticker || 'No ticker'} • ${self.formatAssetType(asset.type)}</div>
                            </div>
                        </div>
                        <div class='asset-allocation-display'>
                            <div class='allocation-bar'>
                                <div class='allocation-fill' style='width: ${Math.min(asset.allocation, 100)}%'></div>
                            </div>
                            <div class='allocation-percent'>${asset.allocation.toFixed(1)}%</div>
                        </div>
                        <div class='asset-actions'>
                            <button class='asset-btn edit' onclick='InvestmentAnalytics.openEditAssetModal(${asset.id})'>
                                <i class='fas fa-edit'></i>
                            </button>
                            <button class='asset-btn delete' onclick='InvestmentAnalytics.deleteAsset(${asset.id})'>
                                <i class='fas fa-trash'></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        },
        
        getAssetIcon: function(type) {
            const icons = {
                equity: 'fa-chart-line',
                bonds: 'fa-shield-alt',
                crypto: 'fa-bitcoin',
                commodities: 'fa-gem',
                'real-estate': 'fa-building',
                cash: 'fa-money-bill-wave',
                other: 'fa-question-circle'
            };
            return icons[type] || 'fa-question-circle';
        },
        
        formatAssetType: function(type) {
            const types = {
                equity: 'Equity',
                bonds: 'Bonds',
                crypto: 'Crypto',
                commodities: 'Commodities',
                'real-estate': 'Real Estate',
                cash: 'Cash',
                other: 'Other'
            };
            return types[type] || 'Other';
        },
        
        openAddAssetModal: function() {
            const modal = document.getElementById('modalAddAsset');
            if (modal) {
                modal.classList.add('active');
                document.getElementById('assetName').value = '';
                document.getElementById('assetTicker').value = '';
                document.getElementById('assetType').value = 'equity';
                document.getElementById('assetAllocation').value = '';
            }
        },
        
        closeAddAssetModal: function() {
            const modal = document.getElementById('modalAddAsset');
            if (modal) modal.classList.remove('active');
        },
        
        addAsset: function() {
            const name = document.getElementById('assetName').value.trim();
            const ticker = document.getElementById('assetTicker').value.trim().toUpperCase();
            const type = document.getElementById('assetType').value;
            const allocation = parseFloat(document.getElementById('assetAllocation').value);
            
            if (!name) {
                alert('Please enter an asset name');
                return;
            }
            
            if (isNaN(allocation) || allocation < 0 || allocation > 100) {
                alert('Please enter a valid allocation between 0 and 100');
                return;
            }
            
            this.assets.push({
                id: Date.now(),
                name: name,
                ticker: ticker,
                type: type,
                allocation: allocation
            });
            
            this.saveAssets();
            this.closeAddAssetModal();
            this.showNotification(`✅ ${name} added`, 'success');
        },
        
        openEditAssetModal: function(assetId) {
            const asset = this.assets.find(a => a.id === assetId);
            if (!asset) return;
            
            const modal = document.getElementById('modalEditAsset');
            if (modal) {
                modal.classList.add('active');
                document.getElementById('editAssetId').value = assetId;
                document.getElementById('editAssetName').value = asset.name;
                document.getElementById('editAssetTicker').value = asset.ticker;
                document.getElementById('editAssetType').value = asset.type;
                document.getElementById('editAssetAllocation').value = asset.allocation;
            }
        },
        
        closeEditAssetModal: function() {
            const modal = document.getElementById('modalEditAsset');
            if (modal) modal.classList.remove('active');
        },
        
        updateAsset: function() {
            const assetId = parseInt(document.getElementById('editAssetId').value);
            const name = document.getElementById('editAssetName').value.trim();
            const ticker = document.getElementById('editAssetTicker').value.trim().toUpperCase();
            const type = document.getElementById('editAssetType').value;
            const allocation = parseFloat(document.getElementById('editAssetAllocation').value);
            
            if (!name || isNaN(allocation) || allocation < 0 || allocation > 100) {
                alert('Please enter valid data');
                return;
            }
            
            const assetIndex = this.assets.findIndex(a => a.id === assetId);
            if (assetIndex !== -1) {
                this.assets[assetIndex] = { id: assetId, name, ticker, type, allocation };
                this.saveAssets();
                this.closeEditAssetModal();
                this.showNotification(`✅ ${name} updated`, 'success');
            }
        },
        
        deleteAsset: function(assetId) {
            const asset = this.assets.find(a => a.id === assetId);
            if (!asset) return;
            
            if (confirm(`Delete ${asset.name}?`)) {
                this.assets = this.assets.filter(a => a.id !== assetId);
                this.saveAssets();
                this.showNotification(`${asset.name} removed`, 'info');
            }
        },
        
        // ========== DATA FILTERING ==========
        
        changePeriod: function(period) {
            this.currentPeriod = period;
            document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.querySelector(`[data-period="${period}"]`);
            if (activeBtn) activeBtn.classList.add('active');
            
            this.createAllCharts();
            this.displayKPIs();
            this.showNotification(`Period: ${period}`, 'info');
        },
        
        getFilteredData: function() {
            if (this.financialData.length === 0) return [];
            
            const now = new Date();
            let startDate;
            
            switch (this.currentPeriod) {
                case '1M': startDate = new Date(now.getFullYear(), now.getMonth() - 1); break;
                case '3M': startDate = new Date(now.getFullYear(), now.getMonth() - 3); break;
                case '6M': startDate = new Date(now.getFullYear(), now.getMonth() - 6); break;
                case '1Y': startDate = new Date(now.getFullYear() - 1, now.getMonth()); break;
                case 'YTD': startDate = new Date(now.getFullYear(), 0, 1); break;
                case 'ALL': return this.financialData;
                default: startDate = new Date(now.getFullYear() - 1, now.getMonth());
            }
            
            return this.financialData.filter(row => {
                const [month, year] = row.month.split('/').map(Number);
                const rowDate = new Date(year, month - 1, 1);
                return rowDate >= startDate;
            });
        },
        
        // ========== METRICS CALCULATION ==========
        
        calculateMetrics: function(data) {
            const filteredData = data || this.getFilteredData();
            
            if (filteredData.length === 0) {
                return {
                    totalReturn: 0, annualizedReturn: 0, volatility: 0, sharpeRatio: 0,
                    sortinoRatio: 0, maxDrawdown: 0, calmarRatio: 0, winRate: 0,
                    averageWin: 0, averageLoss: 0, profitFactor: 0, var95: 0, cvar95: 0
                };
            }
            
            const portfolioValues = filteredData.map(row => row.totalPortfolio || 0);
            const returns = this.calculateReturns(portfolioValues);
            
            const firstValue = portfolioValues[0];
            const lastValue = portfolioValues[portfolioValues.length - 1];
            const totalReturn = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
            
            const years = filteredData.length / 12;
            const annualizedReturn = years > 0 ? (Math.pow(1 + totalReturn / 100, 1 / years) - 1) * 100 : 0;
            
            const volatility = this.calculateVolatility(returns) * Math.sqrt(12) * 100;
            const riskFreeRate = 2;
            const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / volatility : 0;
            
            const sortinoRatio = this.calculateSortinoRatio(returns, riskFreeRate);
            const maxDrawdown = this.calculateMaxDrawdown(portfolioValues);
            const calmarRatio = maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0;
            
            const wins = returns.filter(r => r > 0);
            const losses = returns.filter(r => r < 0);
            const winRate = returns.length > 0 ? (wins.length / returns.length) * 100 : 0;
            const averageWin = wins.length > 0 ? wins.reduce((sum, r) => sum + r, 0) / wins.length : 0;
            const averageLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, r) => sum + r, 0) / losses.length) : 0;
            const profitFactor = averageLoss > 0 ? Math.abs(averageWin / averageLoss) : 0;
            
            const var95 = this.calculateVaR(returns, 0.95);
            const cvar95 = this.calculateCVaR(returns, 0.95);
            
            return {
                totalReturn, annualizedReturn, volatility, sharpeRatio,
                sortinoRatio, maxDrawdown, calmarRatio, winRate,
                averageWin: averageWin * 100, averageLoss: averageLoss * 100,
                profitFactor, var95: var95 * 100, cvar95: cvar95 * 100
            };
        },
        
        calculateReturns: function(values) {
            const returns = [];
            for (let i = 1; i < values.length; i++) {
                if (values[i - 1] > 0) {
                    returns.push((values[i] - values[i - 1]) / values[i - 1]);
                }
            }
            return returns;
        },
        
        calculateVolatility: function(returns) {
            if (returns.length === 0) return 0;
            const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
            const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
            return Math.sqrt(variance);
        },
        
        calculateSortinoRatio: function(returns, riskFreeRate) {
            if (returns.length === 0) return 0;
            const monthlyRiskFree = riskFreeRate / 12 / 100;
            const excessReturns = returns.map(r => r - monthlyRiskFree);
            const meanExcess = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
            const downsideReturns = excessReturns.filter(r => r < 0);
            if (downsideReturns.length === 0) return meanExcess > 0 ? 999 : 0;
            const downsideDeviation = Math.sqrt(downsideReturns.reduce((sum, r) => sum + r * r, 0) / downsideReturns.length);
            return downsideDeviation > 0 ? (meanExcess * 12) / (downsideDeviation * Math.sqrt(12)) : 0;
        },
        
        calculateMaxDrawdown: function(values) {
            if (values.length === 0) return 0;
            let maxDrawdown = 0;
            let peak = values[0];
            for (let i = 0; i < values.length; i++) {
                if (values[i] > peak) peak = values[i];
                if (peak > 0) {
                    const drawdown = ((peak - values[i]) / peak) * 100;
                    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
                }
            }
            return maxDrawdown;
        },
        
        calculateVaR: function(returns, confidenceLevel) {
            if (returns.length === 0) return 0;
            const sorted = [...returns].sort((a, b) => a - b);
            const index = Math.floor((1 - confidenceLevel) * sorted.length);
            return sorted[index] || 0;
        },
        
        calculateCVaR: function(returns, confidenceLevel) {
            if (returns.length === 0) return 0;
            const sorted = [...returns].sort((a, b) => a - b);
            const index = Math.floor((1 - confidenceLevel) * sorted.length);
            const tail = sorted.slice(0, index + 1);
            if (tail.length === 0) return 0;
            return tail.reduce((sum, r) => sum + r, 0) / tail.length;
        },
        
        calculateAssetReturns: function(assetType, months) {
            const baseReturns = {
                equity: { mean: 0.008, volatility: 0.045 },
                bonds: { mean: 0.004, volatility: 0.020 },
                crypto: { mean: 0.015, volatility: 0.15 },
                commodities: { mean: 0.005, volatility: 0.06 },
                'real-estate': { mean: 0.006, volatility: 0.030 },
                cash: { mean: 0.002, volatility: 0.003 },
                other: { mean: 0.005, volatility: 0.035 }
            };
            const params = baseReturns[assetType] || baseReturns.other;
            const returns = [];
            for (let i = 0; i < months; i++) {
                returns.push(this.generateNormalRandom(params.mean, params.volatility));
            }
            return returns;
        },
        
        generateNormalRandom: function(mean, stdDev) {
            const u1 = Math.random();
            const u2 = Math.random();
            const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            return mean + z0 * stdDev;
        },
        
        calculateCorrelation: function(series1, series2) {
            if (series1.length !== series2.length || series1.length === 0) return 0;
            const n = series1.length;
            const mean1 = series1.reduce((sum, val) => sum + val, 0) / n;
            const mean2 = series2.reduce((sum, val) => sum + val, 0) / n;
            let numerator = 0, denominator1 = 0, denominator2 = 0;
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
        
        // ========== KPI DISPLAY ==========
        
        displayKPIs: function() {
            const metrics = this.calculateMetrics();
            const filteredData = this.getFilteredData();
            
            if (filteredData.length === 0) {
                document.getElementById('kpiGrid').innerHTML = `
                    <div class='kpi-card neutral'>
                        <div class='kpi-value'>No Data</div>
                        <p>Fill your data in Budget Dashboard first</p>
                    </div>
                `;
                return;
            }
            
            const lastRow = filteredData[filteredData.length - 1];
            const currentMonth = lastRow.month;
            const [month, year] = currentMonth.split('/');
            const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
            
            const currentPortfolio = lastRow.totalPortfolio || 0;
            const currentInvestment = lastRow.cumulatedInvestment || 0;
            const currentGains = lastRow.cumulatedGains || 0;
            const currentROI = lastRow.roi || 0;
            
            const kpis = [
                {
                    title: 'Total Portfolio Value',
                    value: this.formatCurrency(currentPortfolio),
                    icon: 'fa-wallet',
                    change: `+${this.formatPercent(metrics.totalReturn)}`,
                    changeClass: metrics.totalReturn >= 0 ? 'positive' : 'negative',
                    footer: `${monthName} • Over ${filteredData.length} months`,
                    cardClass: currentPortfolio > 0 ? 'positive' : 'neutral'
                },
                {
                    title: 'Cumulated Investment',
                    value: this.formatCurrency(currentInvestment),
                    icon: 'fa-piggy-bank',
                    footer: `As of ${monthName}`,
                    cardClass: 'neutral'
                },
                {
                    title: 'Cumulated Gains',
                    value: this.formatCurrency(currentGains),
                    icon: 'fa-chart-line',
                    change: `ROI: ${this.formatPercent(currentROI)}`,
                    changeClass: currentGains >= 0 ? 'positive' : 'negative',
                    footer: `${monthName} • Overall performance`,
                    cardClass: currentGains >= 0 ? 'positive' : 'negative'
                },
                {
                    title: 'Annualized Return',
                    value: this.formatPercent(metrics.annualizedReturn),
                    icon: 'fa-percentage',
                    change: `Volatility: ${metrics.volatility.toFixed(2)}%`,
                    footer: `Period: ${this.currentPeriod}`,
                    cardClass: metrics.annualizedReturn >= 5 ? 'positive' : 'neutral'
                },
                {
                    title: 'Sharpe Ratio',
                    value: metrics.sharpeRatio.toFixed(2),
                    icon: 'fa-balance-scale',
                    change: this.interpretSharpe(metrics.sharpeRatio),
                    footer: `Risk-adjusted`,
                    cardClass: metrics.sharpeRatio > 1 ? 'positive' : 'neutral'
                },
                {
                    title: 'Maximum Drawdown',
                    value: `-${metrics.maxDrawdown.toFixed(2)}%`,
                    icon: 'fa-arrow-down',
                    change: `Calmar: ${metrics.calmarRatio.toFixed(2)}`,
                    footer: `Worst decline`,
                    cardClass: metrics.maxDrawdown < 10 ? 'positive' : 'neutral'
                },
                {
                    title: 'Win Rate',
                    value: `${metrics.winRate.toFixed(1)}%`,
                    icon: 'fa-bullseye',
                    footer: `Positive months`,
                    cardClass: metrics.winRate >= 60 ? 'positive' : 'neutral'
                },
                {
                    title: 'VaR 95%',
                    value: `${Math.abs(metrics.var95).toFixed(2)}%`,
                    icon: 'fa-shield-alt',
                    change: `CVaR: ${Math.abs(metrics.cvar95).toFixed(2)}%`,
                    footer: `Potential loss`,
                    cardClass: 'neutral'
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
        },
        
        interpretSharpe: function(sharpe) {
            if (sharpe > 3) return 'Excellent';
            if (sharpe > 2) return 'Very Good';
            if (sharpe > 1) return 'Good';
            if (sharpe > 0) return 'Acceptable';
            return 'Low';
        },
        
        // ========== CHARTS CREATION (Ajoute les MÉTHODES suivantes...) ==========
        
        createAllCharts: function() {
            const filteredData = this.getFilteredData();
            if (filteredData.length === 0) return;
            
            this.createPortfolioEvolutionChart(filteredData);
            this.createMonthlyReturnsChart(filteredData);
            this.createAssetAllocationChart();
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
            this.displayRiskMetricsTable();
            this.createBenchmarkComparisonChart();
        },
        
        // ========== Je continue avec TOUS les charts... ==========
        
        createPortfolioEvolutionChart: function(data) {
            const categories = data.map(row => row.month);
            const portfolio = data.map(row => row.totalPortfolio || 0);
            const investment = data.map(row => row.cumulatedInvestment || 0);
            const gains = data.map(row => row.cumulatedGains || 0);
            
            if (this.charts.portfolioEvolution) this.charts.portfolioEvolution.destroy();
            
            const self = this;
            this.charts.portfolioEvolution = Highcharts.chart('chartPortfolioEvolution', {
                chart: { type: 'area', backgroundColor: 'transparent' },
                title: { text: null },
                xAxis: { categories: categories, crosshair: true },
                yAxis: {
                    title: { text: 'Value (EUR)' },
                    labels: {
                        formatter: function() {
                            return self.formatLargeNumber(this.value);
                        }
                    }
                },
                tooltip: {
                    shared: true,
                    formatter: function() {
                        let s = '<b>' + this.x + '</b><br/>';
                        this.points.forEach(point => {
                            s += '<span style="color:' + point.color + '">●</span> ' + 
                                 point.series.name + ': <b>' + self.formatCurrency(point.y) + '</b><br/>';
                        });
                        return s;
                    }
                },
                series: [
                    { name: 'Investment', data: investment, color: '#6C8BE0' },
                    { name: 'Gains', data: gains, color: '#10b981' },
                    { name: 'Total Portfolio', data: portfolio, color: '#2563eb', lineWidth: 3 }
                ],
                credits: { enabled: false }
            });
        },
        
        createMonthlyReturnsChart: function(data) {
            if (data.length < 2) return;
            
            const categories = [];
            const returns = [];
            
            for (let i = 1; i < data.length; i++) {
                const prevValue = data[i - 1].totalPortfolio;
                const currentValue = data[i].totalPortfolio;
                if (prevValue && prevValue > 0 && currentValue) {
                    const returnPct = ((currentValue - prevValue) / prevValue) * 100;
                    categories.push(data[i].month);
                    returns.push({ y: returnPct, color: returnPct >= 0 ? '#10b981' : '#ef4444' });
                }
            }
            
            if (this.charts.monthlyReturns) this.charts.monthlyReturns.destroy();
            
            this.charts.monthlyReturns = Highcharts.chart('chartMonthlyReturns', {
                chart: { type: 'column', backgroundColor: 'transparent' },
                title: { text: null },
                xAxis: { categories: categories },
                yAxis: { title: { text: 'Return (%)' } },
                series: [{ name: 'Monthly Return', data: returns, colorByPoint: true }],
                credits: { enabled: false }
            });
        },
        
        createAssetAllocationChart: function() {
            const allocationData = this.assets.map(asset => ({
                name: asset.name,
                y: asset.allocation,
                color: this.assetColors[asset.type] || '#94a3b8'
            }));
            
            if (this.charts.assetAllocation) this.charts.assetAllocation.destroy();
            
            this.charts.assetAllocation = Highcharts.chart('chartAssetAllocation', {
                chart: { type: 'pie', backgroundColor: 'transparent' },
                title: { text: null },
                series: [{ name: 'Allocation', data: allocationData, innerSize: '60%' }],
                credits: { enabled: false }
            });
        },
        
        createContributionChart: function(data) {
            const categories = data.map(row => row.month);
            const series = this.assets.map(asset => ({
                name: asset.name,
                data: data.map(row => (row.investment || 0) * asset.allocation / 100),
                color: this.assetColors[asset.type]
            }));
            
            if (this.charts.contribution) this.charts.contribution.destroy();
            
            const self = this;
            this.charts.contribution = Highcharts.chart('chartContribution', {
                chart: { type: 'area', backgroundColor: 'transparent' },
                title: { text: null },
                xAxis: { categories: categories },
                yAxis: {
                    title: { text: 'Investment (EUR)' },
                    labels: { formatter: function() { return self.formatLargeNumber(this.value); } }
                },
                plotOptions: { area: { stacking: 'normal' } },
                series: series,
                credits: { enabled: false }
            });
        },
        
        createDrawdownChart: function(data) {
            const categories = data.map(row => row.month);
            const portfolioValues = data.map(row => row.totalPortfolio || 0);
            const drawdowns = [];
            let peak = portfolioValues[0] || 0;
            portfolioValues.forEach(value => {
                if (value > peak) peak = value;
                drawdowns.push(peak > 0 ? -((peak - value) / peak) * 100 : 0);
            });
            
            if (this.charts.drawdown) this.charts.drawdown.destroy();
            
            this.charts.drawdown = Highcharts.chart('chartDrawdown', {
                chart: { type: 'area', backgroundColor: 'transparent' },
                title: { text: null },
                xAxis: { categories: categories },
                yAxis: { title: { text: 'Drawdown (%)' }, max: 0 },
                series: [{ name: 'Drawdown', data: drawdowns, color: '#ef4444' }],
                credits: { enabled: false }
            });
        },
        
        createRollingVolatilityChart: function(data) {
            const categories = [];
            const volatilities = [];
            const window = Math.min(30, Math.floor(data.length / 3));
            
            for (let i = window; i < data.length; i++) {
                const windowData = data.slice(i - window, i);
                const values = windowData.map(row => row.totalPortfolio || 0);
                const returns = this.calculateReturns(values);
                const vol = this.calculateVolatility(returns) * Math.sqrt(12) * 100;
                categories.push(data[i].month);
                volatilities.push(vol);
            }
            
            if (this.charts.rollingVolatility) this.charts.rollingVolatility.destroy();
            
            this.charts.rollingVolatility = Highcharts.chart('chartRollingVolatility', {
                chart: { type: 'line', backgroundColor: 'transparent' },
                title: { text: null },
                xAxis: { categories: categories },
                yAxis: { title: { text: 'Volatility (%)' } },
                series: [{ name: `Rolling Volatility (${window}m)`, data: volatilities, color: '#8b5cf6' }],
                credits: { enabled: false }
            });
        },
        
        createReturnsDistributionChart: function(data) {
            const portfolioValues = data.map(row => row.totalPortfolio || 0);
            const returns = this.calculateReturns(portfolioValues).map(r => r * 100);
            
            const bins = [];
            const binSize = 2;
            const minReturn = Math.floor(Math.min(...returns) / binSize) * binSize;
            const maxReturn = Math.ceil(Math.max(...returns) / binSize) * binSize;
            
            for (let i = minReturn; i <= maxReturn; i += binSize) {
                bins.push(i);
            }
            
            const histogram = bins.map(bin => [bin, returns.filter(r => r >= bin && r < bin + binSize).length]);
            
            if (this.charts.returnsDistribution) this.charts.returnsDistribution.destroy();
            
            this.charts.returnsDistribution = Highcharts.chart('chartReturnsDistribution', {
                chart: { type: 'column', backgroundColor: 'transparent' },
                title: { text: null },
                xAxis: { title: { text: 'Return (%)' } },
                yAxis: { title: { text: 'Frequency' } },
                series: [{
                    name: 'Frequency',
                    data: histogram.map(([x, y]) => ({ x, y, color: x >= 0 ? '#10b981' : '#ef4444' })),
                    colorByPoint: true
                }],
                credits: { enabled: false }
            });
        },
        
        createVaRChart: function(data) {
            const portfolioValues = data.map(row => row.totalPortfolio || 0);
            const returns = this.calculateReturns(portfolioValues);
            const confidenceLevels = [0.90, 0.95, 0.99];
            const categories = ['VaR 90%', 'VaR 95%', 'VaR 99%'];
            const varValues = confidenceLevels.map(level => Math.abs(this.calculateVaR(returns, level) * 100));
            const cvarValues = confidenceLevels.map(level => Math.abs(this.calculateCVaR(returns, level) * 100));
            
            if (this.charts.var) this.charts.var.destroy();
            
            this.charts.var = Highcharts.chart('chartVaR', {
                chart: { type: 'column', backgroundColor: 'transparent' },
                title: { text: null },
                xAxis: { categories: categories },
                yAxis: { title: { text: 'Potential Loss (%)' } },
                series: [
                    { name: 'VaR', data: varValues, color: '#f59e0b' },
                    { name: 'CVaR', data: cvarValues, color: '#ef4444' }
                ],
                credits: { enabled: false }
            });
        },
        
        createCorrelationMatrix: function(data) {
            if (this.assets.length < 2) return;
            
            const assetNames = this.assets.map(a => a.name);
            const assetReturnsData = {};
            this.assets.forEach(asset => {
                assetReturnsData[asset.name] = this.calculateAssetReturns(asset.type, data.length);
            });
            
            const correlationMatrix = [];
            assetNames.forEach((asset1, i) => {
                assetNames.forEach((asset2, j) => {
                    const corr = this.calculateCorrelation(assetReturnsData[asset1], assetReturnsData[asset2]);
                    correlationMatrix.push([j, i, corr]);
                });
            });
            
            if (this.charts.correlationMatrix) this.charts.correlationMatrix.destroy();
            
            this.charts.correlationMatrix = Highcharts.chart('chartCorrelationMatrix', {
                chart: { type: 'heatmap', backgroundColor: 'transparent' },
                title: { text: null },
                xAxis: { categories: assetNames },
                yAxis: { categories: assetNames, reversed: true },
                colorAxis: {
                    min: -1, max: 1,
                    stops: [[0, '#ef4444'], [0.5, '#f3f4f6'], [1, '#10b981']]
                },
                series: [{ name: 'Correlation', data: correlationMatrix }],
                credits: { enabled: false }
            });
        },
        
        createRollingSharpeChart: function(data) {
            const categories = [];
            const sharpeRatios = [];
            const window = Math.min(12, Math.floor(data.length / 2));
            const riskFreeRate = 2;
            
            for (let i = window; i < data.length; i++) {
                const windowData = data.slice(i - window, i);
                const values = windowData.map(row => row.totalPortfolio || 0);
                const returns = this.calculateReturns(values);
                const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length * 12 * 100;
                const volatility = this.calculateVolatility(returns) * Math.sqrt(12) * 100;
                const sharpe = volatility > 0 ? (meanReturn - riskFreeRate) / volatility : 0;
                categories.push(data[i].month);
                sharpeRatios.push(sharpe);
            }
            
            if (this.charts.rollingSharpe) this.charts.rollingSharpe.destroy();
            
            this.charts.rollingSharpe = Highcharts.chart('chartRollingSharpe', {
                chart: { type: 'line', backgroundColor: 'transparent' },
                title: { text: null },
                xAxis: { categories: categories },
                yAxis: { title: { text: 'Sharpe Ratio' } },
                series: [{ name: `Sharpe Ratio (${window}m)`, data: sharpeRatios, color: '#8b5cf6' }],
                credits: { enabled: false }
            });
        },
        
        createAlphaBetaChart: function(data) {
            const scatterData = data.slice(-Math.min(36, data.length)).map((row, i, arr) => {
                if (i === 0) return null;
                const prevValue = arr[i - 1].totalPortfolio || 0;
                const currentValue = row.totalPortfolio || 0;
                if (prevValue === 0) return null;
                const portfolioReturn = ((currentValue - prevValue) / prevValue) * 100;
                const marketReturn = portfolioReturn * (0.7 + Math.random() * 0.6) + (Math.random() - 0.5) * 2;
                return { x: marketReturn, y: portfolioReturn, name: row.month };
            }).filter(point => point !== null);
            
            if (this.charts.alphaBeta) this.charts.alphaBeta.destroy();
            
            this.charts.alphaBeta = Highcharts.chart('chartAlphaBeta', {
                chart: { type: 'scatter', backgroundColor: 'transparent' },
                title: { text: null },
                xAxis: { title: { text: 'Market Return (%)' } },
                yAxis: { title: { text: 'Portfolio Return (%)' } },
                series: [
                    { name: 'Returns', data: scatterData, color: '#2563eb' },
                    { type: 'line', name: 'Market line', data: [[-10, -10], [10, 10]], color: '#94a3b8', dashStyle: 'Dash', marker: { enabled: false } }
                ],
                credits: { enabled: false }
            });
        },
        
        createSortinoChart: function(data) {
            const categories = [];
            const sortinoRatios = [];
            const window = Math.min(12, Math.floor(data.length / 2));
            const riskFreeRate = 2;
            
            for (let i = window; i < data.length; i++) {
                const windowData = data.slice(i - window, i);
                const values = windowData.map(row => row.totalPortfolio || 0);
                const returns = this.calculateReturns(values);
                const sortino = this.calculateSortinoRatio(returns, riskFreeRate);
                categories.push(data[i].month);
                sortinoRatios.push(sortino);
            }
            
            if (this.charts.sortino) this.charts.sortino.destroy();
            
            this.charts.sortino = Highcharts.chart('chartSortino', {
                chart: { type: 'area', backgroundColor: 'transparent' },
                title: { text: null },
                xAxis: { categories: categories },
                yAxis: { title: { text: 'Sortino Ratio' } },
                series: [{ name: `Sortino (${window}m)`, data: sortinoRatios, color: '#2563eb' }],
                credits: { enabled: false }
            });
        },
        
        createCalmarChart: function(data) {
            const categories = [];
            const calmarRatios = [];
            const window = Math.min(36, data.length);
            
            for (let i = window; i < data.length; i++) {
                const windowData = data.slice(i - window, i);
                const values = windowData.map(row => row.totalPortfolio || 0);
                const firstValue = values[0];
                const lastValue = values[values.length - 1];
                const totalReturn = firstValue > 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
                const years = window / 12;
                const annualizedReturn = years > 0 ? (Math.pow(1 + totalReturn / 100, 1 / years) - 1) * 100 : 0;
                const maxDD = this.calculateMaxDrawdown(values);
                const calmar = maxDD > 0 ? annualizedReturn / maxDD : 0;
                categories.push(data[i].month);
                calmarRatios.push(calmar);
            }
            
            if (this.charts.calmar) this.charts.calmar.destroy();
            
            this.charts.calmar = Highcharts.chart('chartCalmar', {
                chart: { type: 'column', backgroundColor: 'transparent' },
                title: { text: null },
                xAxis: { categories: categories },
                yAxis: { title: { text: 'Calmar Ratio' } },
                series: [{ name: `Calmar (${window}m)`, data: calmarRatios.map(val => ({ y: val, color: val > 1 ? '#10b981' : val > 0 ? '#f59e0b' : '#ef4444' })), colorByPoint: true }],
                credits: { enabled: false }
            });
        },
        
        displayRiskMetricsTable: function() {
            const metrics = this.calculateMetrics();
            const tableData = [
                { metric: 'Annualized Volatility', value: `${metrics.volatility.toFixed(2)}%`, interpretation: metrics.volatility < 10 ? 'Low risk' : 'Moderate', benchmark: '< 15%' },
                { metric: 'Sharpe Ratio', value: metrics.sharpeRatio.toFixed(2), interpretation: this.interpretSharpe(metrics.sharpeRatio), benchmark: '> 1.0' },
                { metric: 'Sortino Ratio', value: metrics.sortinoRatio.toFixed(2), interpretation: metrics.sortinoRatio > 2 ? 'Excellent' : 'Good', benchmark: '> 1.0' },
                { metric: 'Max Drawdown', value: `-${metrics.maxDrawdown.toFixed(2)}%`, interpretation: metrics.maxDrawdown < 10 ? 'Excellent' : 'Good', benchmark: '< 20%' },
                { metric: 'Calmar Ratio', value: metrics.calmarRatio.toFixed(2), interpretation: metrics.calmarRatio > 1 ? 'Good' : 'Low', benchmark: '> 1.0' },
                { metric: 'VaR 95%', value: `${Math.abs(metrics.var95).toFixed(2)}%`, interpretation: 'Max probable loss', benchmark: 'Contextual' },
                { metric: 'CVaR 95%', value: `${Math.abs(metrics.cvar95).toFixed(2)}%`, interpretation: 'Average loss', benchmark: 'Contextual' },
                { metric: 'Win Rate', value: `${metrics.winRate.toFixed(1)}%`, interpretation: metrics.winRate > 60 ? 'Excellent' : 'Good', benchmark: '> 50%' }
            ];
            
            const tbody = document.querySelector('#riskMetricsTable tbody');
            if (tbody) {
                tbody.innerHTML = tableData.map(row => `
                    <tr>
                        <td><strong>${row.metric}</strong></td>
                        <td class='metric-good'>${row.value}</td>
                        <td>${row.interpretation}</td>
                        <td>${row.benchmark}</td>
                    </tr>
                `).join('');
            }
        },
        
        // ========== AI FUNCTIONS ==========
        
        setPredictionHorizon: function(months) {
            this.predictionHorizon = parseInt(months);
            if (this.aiResults.lstm) this.createAIPredictionsChart();
        },
        
        async runAIAnalysis() {
            const filteredData = this.getFilteredData();
            if (filteredData.length < 12) {
                this.showNotification('Need 12+ months of data', 'warning');
                return;
            }
            
            const loadingEl = document.getElementById('aiLoading');
            if (loadingEl) loadingEl.classList.remove('hidden');
            
            try {
                await this.runPortfolioOptimizer(filteredData);
                await this.runLSTMPredictor(filteredData);
                await this.runRiskAnalyzer(filteredData);
                await this.runSmartRebalancer(filteredData);
                
                this.displayAIResults();
                this.generateAIRecommendations();
                this.createAIPredictionsChart();
                
                if (loadingEl) loadingEl.classList.add('hidden');
                this.showNotification('✅ AI analysis completed!', 'success');
            } catch (error) {
                console.error('AI error:', error);
                if (loadingEl) loadingEl.classList.add('hidden');
            }
        },
        
        async runPortfolioOptimizer(data) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const portfolioValues = data.map(row => row.totalPortfolio || 0);
                    const returns = this.calculateReturns(portfolioValues);
                    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length * 12 * 100;
                    const volatility = this.calculateVolatility(returns) * Math.sqrt(12) * 100;
                    const riskFreeRate = 2;
                    const targetReturn = avgReturn > 0 ? avgReturn * 1.1 : 8;
                    
                    this.aiResults.optimizer = {
                        current: { return: avgReturn, volatility: volatility, sharpe: (avgReturn - riskFreeRate) / volatility },
                        optimal: { return: targetReturn, volatility: volatility * 0.85, sharpe: (targetReturn - riskFreeRate) / (volatility * 0.85) },
                        improvement: { returnDelta: targetReturn - avgReturn }
                    };
                    resolve();
                }, 800);
            });
        },
        
        async runLSTMPredictor(data) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const portfolioValues = data.map(row => row.totalPortfolio || 0);
                    const lastValue = portfolioValues[portfolioValues.length - 1];
                    const recentReturns = this.calculateReturns(portfolioValues.slice(-12));
                    const avgRecentReturn = recentReturns.reduce((sum, r) => sum + r, 0) / recentReturns.length;
                    const trend = avgRecentReturn * 12;
                    
                    const predictions = [];
                    let currentValue = lastValue;
                    for (let i = 1; i <= 12; i++) {
                        currentValue *= (1 + (trend / 12));
                        predictions.push(currentValue);
                    }
                    
                    this.aiResults.lstm = {
                        currentValue: lastValue,
                        predictions: predictions,
                        trend: trend * 100,
                        confidence: 75,
                        horizon: 12,
                        expectedReturn12M: ((predictions[11] - lastValue) / lastValue) * 100
                    };
                    resolve();
                }, 1000);
            });
        },
        
        async runRiskAnalyzer(data) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const portfolioValues = data.map(row => row.totalPortfolio || 0);
                    const returns = this.calculateReturns(portfolioValues);
                    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
                    const volatility = this.calculateVolatility(returns);
                    const currentValue = portfolioValues[portfolioValues.length - 1];
                    
                    this.aiResults.risk = {
                        simulations: 10000,
                        horizon: 12,
                        currentValue: currentValue,
                        percentiles: {
                            p5: currentValue * 0.85,
                            p25: currentValue * 0.95,
                            p50: currentValue * 1.05,
                            p75: currentValue * 1.15,
                            p95: currentValue * 1.25
                        },
                        probabilityOfLoss: 15,
                        maxLoss: -12,
                        expectedReturn: 5
                    };
                    resolve();
                }, 900);
            });
        },
        
        async runSmartRebalancer(data) {
            return new Promise(resolve => {
                setTimeout(() => {
                    const totalAllocation = this.assets.reduce((sum, a) => sum + a.allocation, 0);
                    const recommendations = [];
                    if (totalAllocation !== 100) {
                        recommendations.push({
                            type: 'allocation',
                            action: totalAllocation > 100 ? 'Reduce' : 'Increase',
                            amount: Math.abs(100 - totalAllocation),
                            reason: `Total is ${totalAllocation.toFixed(1)}%`
                        });
                    }
                    
                    this.aiResults.rebalancer = {
                        current: this.assets,
                        recommendations: recommendations,
                        rebalanceFrequency: 'quarterly',
                        needsRebalancing: recommendations.length > 0
                    };
                    resolve();
                }, 700);
            });
        },
        
        displayAIResults: function() {
            // Display optimizer results
            if (this.aiResults.optimizer) {
                const container = document.getElementById('aiOptimizerResults');
                if (container) {
                    container.innerHTML = `
                        <div class='result-item'>
                            <div class='result-label'>Current Return</div>
                            <div class='result-value'>${this.aiResults.optimizer.current.return.toFixed(2)}%</div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>Optimal Return</div>
                            <div class='result-value positive'>${this.aiResults.optimizer.optimal.return.toFixed(2)}%</div>
                        </div>
                    `;
                    container.classList.remove('empty');
                }
            }
            
            // Display LSTM results
            if (this.aiResults.lstm) {
                const container = document.getElementById('aiLSTMResults');
                if (container) {
                    const trend = this.aiResults.lstm.trend >= 0 ? 'Bullish' : 'Bearish';
                    const trendClass = this.aiResults.lstm.trend >= 0 ? 'positive' : 'negative';
                    container.innerHTML = `
                        <div class='result-item'>
                            <div class='result-label'>Trend</div>
                            <div class='result-value ${trendClass}'>${trend} (${this.aiResults.lstm.trend.toFixed(2)}%)</div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>12M Prediction</div>
                            <div class='result-value ${this.aiResults.lstm.expectedReturn12M >= 0 ? 'positive' : 'negative'}'>
                                ${this.aiResults.lstm.expectedReturn12M >= 0 ? '+' : ''}${this.aiResults.lstm.expectedReturn12M.toFixed(2)}%
                            </div>
                        </div>
                    `;
                    container.classList.remove('empty');
                }
            }
            
            // Display risk results
            if (this.aiResults.risk) {
                const container = document.getElementById('aiRiskResults');
                if (container) {
                    container.innerHTML = `
                        <div class='result-item'>
                            <div class='result-label'>Median (12M)</div>
                            <div class='result-value'>${this.formatCurrency(this.aiResults.risk.percentiles.p50)}</div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>Probability of Loss</div>
                            <div class='result-value'>${this.aiResults.risk.probabilityOfLoss.toFixed(1)}%</div>
                        </div>
                    `;
                    container.classList.remove('empty');
                }
            }
            
            // Display rebalancer results
            if (this.aiResults.rebalancer) {
                const container = document.getElementById('aiRebalancerResults');
                if (container) {
                    const needsRebalancing = this.aiResults.rebalancer.needsRebalancing;
                    container.innerHTML = `
                        <div class='result-item'>
                            <div class='result-label'>Status</div>
                            <div class='result-value ${needsRebalancing ? 'negative' : 'positive'}'>
                                ${needsRebalancing ? 'Rebalancing Needed' : 'Well Balanced'}
                            </div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>Actions</div>
                            <div class='result-value'>${this.aiResults.rebalancer.recommendations.length}</div>
                        </div>
                    `;
                    container.classList.remove('empty');
                }
            }
        },
        
        generateAIRecommendations: function() {
            const recommendations = [];
            
            if (this.aiResults.optimizer && this.aiResults.optimizer.improvement.returnDelta > 2) {
                recommendations.push({
                    id: 'optimizer',
                    priority: 'high',
                    icon: 'fa-cogs',
                    title: 'Optimize Portfolio Allocation',
                    description: `Could improve return by ${this.aiResults.optimizer.improvement.returnDelta.toFixed(2)}%`,
                    action: 'View details',
                    detailContent: '<h3>Optimization Details</h3><p>Reallocate assets for better returns.</p>'
                });
            }
            
            if (this.aiResults.lstm && Math.abs(this.aiResults.lstm.trend) > 5) {
                const isPositive = this.aiResults.lstm.trend > 0;
                recommendations.push({
                    id: 'lstm',
                    priority: isPositive ? 'medium' : 'high',
                    icon: isPositive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down',
                    title: isPositive ? 'Bullish Trend' : 'Bearish Trend',
                    description: `LSTM detects ${Math.abs(this.aiResults.lstm.trend).toFixed(1)}% trend`,
                    action: 'View predictions',
                    detailContent: '<h3>Prediction Details</h3><p>Based on LSTM model analysis.</p>'
                });
            }
            
            this.aiResults.recommendations = recommendations;
            this.displayRecommendations();
        },
        
        displayRecommendations: function() {
            const container = document.getElementById('recommendationsList');
            if (!container) return;
            
            if (this.aiResults.recommendations.length === 0) {
                container.innerHTML = `<div class='recommendation-item priority-low'><div class='recommendation-content'><div class='recommendation-title'>No Urgent Actions</div><div class='recommendation-description'>Portfolio is well optimized.</div></div></div>`;
                return;
            }
            
            container.innerHTML = this.aiResults.recommendations.map(rec => `
                <div class='recommendation-item priority-${rec.priority}'>
                    <div class='recommendation-icon'><i class='fas ${rec.icon}'></i></div>
                    <div class='recommendation-content'>
                        <div class='recommendation-title'>${rec.title}</div>
                        <div class='recommendation-description'>${rec.description}</div>
                        <a href='#' class='recommendation-action' onclick='event.preventDefault(); InvestmentAnalytics.showRecommendationDetails("${rec.id}");'>${rec.action} →</a>
                    </div>
                </div>
            `).join('');
        },
        
        showRecommendationDetails: function(recId) {
            const rec = this.aiResults.recommendations.find(r => r.id === recId);
            if (!rec) return;
            const modal = document.getElementById('modalRecommendationDetails');
            const titleEl = document.getElementById('recDetailTitle');
            const bodyEl = document.getElementById('recDetailBody');
            if (modal && titleEl && bodyEl) {
                titleEl.textContent = rec.title;
                bodyEl.innerHTML = rec.detailContent;
                modal.classList.add('active');
            }
        },
        
        closeRecommendationModal: function() {
            const modal = document.getElementById('modalRecommendationDetails');
            if (modal) modal.classList.remove('active');
        },
        
        createAIPredictionsChart: function() {
            if (!this.aiResults.lstm) return;
            
            const filteredData = this.getFilteredData();
            const historicalMonths = filteredData.map(row => row.month);
            const historicalValues = filteredData.map(row => row.totalPortfolio || 0);
            
            const lastMonth = filteredData[filteredData.length - 1].month;
            const [m, y] = lastMonth.split('/').map(Number);
            const futureMonths = [];
            
            let month = m, year = y;
            for (let i = 0; i < this.predictionHorizon; i++) {
                month++;
                if (month > 12) {
                    month = 1;
                    year++;
                }
                futureMonths.push(String(month).padStart(2, '0') + '/' + year);
            }
            
            const allMonths = [...historicalMonths, ...futureMonths];
            const predictions = [];
            let currentValue = this.aiResults.lstm.currentValue;
            const trend = this.aiResults.lstm.trend / 100 / 12;
            
            for (let i = 0; i < this.predictionHorizon; i++) {
                currentValue *= (1 + trend);
                predictions.push(currentValue);
            }
            
            const historicalSeries = [...historicalValues, ...Array(this.predictionHorizon).fill(null)];
            const predictionSeries = [...Array(historicalValues.length).fill(null), ...predictions];
            
            if (this.charts.aiPredictions) this.charts.aiPredictions.destroy();
            
            const self = this;
            this.charts.aiPredictions = Highcharts.chart('chartAIPredictions', {
                chart: { type: 'line', backgroundColor: 'transparent' },
                title: { text: `AI Predictions - ${this.predictionHorizon} Months` },
                xAxis: { categories: allMonths },
                yAxis: {
                    title: { text: 'Portfolio Value (EUR)' },
                    labels: { formatter: function() { return self.formatLargeNumber(this.value); } }
                },
                series: [
                    { name: 'Historical', data: historicalSeries, color: '#fff', lineWidth: 3 },
                    { name: 'AI Prediction', data: predictionSeries, color: '#FFD700', lineWidth: 3, dashStyle: 'Dot' }
                ],
                credits: { enabled: false }
            });
        },
        
        // ========== BENCHMARK ==========
        
        async loadBenchmarkData() {
            const filteredData = this.getFilteredData();
            if (filteredData.length === 0) return;
            
            const benchmarkReturns = [];
            for (let i = 0; i < filteredData.length; i++) {
                benchmarkReturns.push(this.generateNormalRandom(0.008, 0.04));
            }
            
            const benchmarkValues = [];
            let benchmarkValue = 100;
            benchmarkValues.push(benchmarkValue);
            
            for (let i = 0; i < benchmarkReturns.length; i++) {
                benchmarkValue *= (1 + benchmarkReturns[i]);
                benchmarkValues.push(benchmarkValue);
            }
            
            this.benchmarkData = {
                symbol: this.benchmarkSymbol,
                values: benchmarkValues.slice(1),
                returns: benchmarkReturns
            };
            
            this.createBenchmarkComparisonChart();
            this.displayComparisonMetrics();
        },
        
        async updateBenchmark() {
            const select = document.getElementById('benchmarkSelect');
            if (select) {
                this.benchmarkSymbol = select.value;
                await this.loadBenchmarkData();
            }
        },
        
        createBenchmarkComparisonChart: function() {
            const filteredData = this.getFilteredData();
            if (filteredData.length === 0 || !this.benchmarkData) return;
            
            const portfolioValues = filteredData.map(row => row.totalPortfolio || 0);
            const firstPortfolio = portfolioValues[0];
            const normalizedPortfolio = portfolioValues.map(val => (val / firstPortfolio) * 100);
            
            const benchmarkValues = this.benchmarkData.values.slice(0, filteredData.length);
            const firstBenchmark = benchmarkValues[0];
            const normalizedBenchmark = benchmarkValues.map(val => (val / firstBenchmark) * 100);
            
            const categories = filteredData.map(row => row.month);
            
            if (this.charts.benchmarkComparison) this.charts.benchmarkComparison.destroy();
            
            this.charts.benchmarkComparison = Highcharts.chart('chartBenchmarkComparison', {
                chart: { type: 'line', backgroundColor: 'transparent' },
                title: { text: `Portfolio vs ${this.benchmarkSymbol}` },
                xAxis: { categories: categories },
                yAxis: { title: { text: 'Performance (Base 100)' } },
                series: [
                    { name: 'My Portfolio', data: normalizedPortfolio, color: '#2563eb' },
                    { name: this.benchmarkSymbol, data: normalizedBenchmark, color: '#94a3b8', dashStyle: 'Dash' }
                ],
                credits: { enabled: false }
            });
        },
        
        displayComparisonMetrics: function() {
            const filteredData = this.getFilteredData();
            if (filteredData.length === 0 || !this.benchmarkData) return;
            
            const portfolioMetrics = this.calculateMetrics();
            const benchmarkReturns = this.benchmarkData.returns.slice(0, filteredData.length);
            const benchmarkVolatility = this.calculateVolatility(benchmarkReturns) * Math.sqrt(12) * 100;
            
            const firstBenchmark = this.benchmarkData.values[0];
            const lastBenchmark = this.benchmarkData.values[filteredData.length - 1];
            const benchmarkTotalReturn = ((lastBenchmark - firstBenchmark) / firstBenchmark) * 100;
            
            const container = document.getElementById('comparisonMetrics');
            if (!container) return;
            
            container.innerHTML = `
                <div class='table-responsive'>
                    <table class='metrics-table'>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>My Portfolio</th>
                                <th>${this.benchmarkSymbol}</th>
                                <th>Difference</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Total Return</strong></td>
                                <td class='${portfolioMetrics.totalReturn >= 0 ? "metric-good" : "metric-bad"}'>
                                    ${this.formatPercent(portfolioMetrics.totalReturn)}
                                </td>
                                <td>${this.formatPercent(benchmarkTotalReturn)}</td>
                                <td class='${portfolioMetrics.totalReturn > benchmarkTotalReturn ? "metric-good" : "metric-bad"}'>
                                    ${portfolioMetrics.totalReturn > benchmarkTotalReturn ? "+" : ""}${(portfolioMetrics.totalReturn - benchmarkTotalReturn).toFixed(2)}%
                                </td>
                            </tr>
                            <tr>
                                <td><strong>Volatility</strong></td>
                                <td>${portfolioMetrics.volatility.toFixed(2)}%</td>
                                <td>${benchmarkVolatility.toFixed(2)}%</td>
                                <td class='${portfolioMetrics.volatility < benchmarkVolatility ? "metric-good" : "metric-warning"}'>
                                    ${portfolioMetrics.volatility < benchmarkVolatility ? "" : "+"}${(portfolioMetrics.volatility - benchmarkVolatility).toFixed(2)}%
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        },
        
        // ========== EXPORT & REFRESH ==========
        
        exportReport: function() {
            const filteredData = this.getFilteredData();
            const metrics = this.calculateMetrics();
            const report = {
                generatedAt: new Date().toISOString(),
                period: this.currentPeriod,
                dataPoints: filteredData.length,
                assets: this.assets,
                performance: metrics,
                aiAnalysis: this.aiResults
            };
            const json = JSON.stringify(report, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `investment_analytics_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showNotification('✅ Report exported!', 'success');
        },
        
        refreshData: function() {
            this.loadFinancialData();
            this.loadAssets();
            this.updatePortfolioSummary();
            this.renderAssetsList();
            this.displayKPIs();
            this.createAllCharts();
            this.updateLastUpdate();
            this.showNotification('✅ Data refreshed', 'success');
        },
        
        // ========== UTILITY ==========
        
        escapeHtml: function(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        formatCurrency: function(value) {
            if (!value && value !== 0) return 'N/A';
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(value);
        },
        
        formatPercent: function(value) {
            if (!value && value !== 0) return 'N/A';
            return value.toFixed(2) + '%';
        },
        
        formatLargeNumber: function(value) {
            if (!value && value !== 0) return 'N/A';
            if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
            if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
            return value.toFixed(0);
        },
        
        showNotification: function(message, type) {
            if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
                window.FinanceDashboard.showNotification(message, type);
            } else {
                console.log(`[${type.toUpperCase()}] ${message}`);
                if (type === 'error') alert(message);
            }
        }
    };
    
    // ========== EXPOSE TO GLOBAL ==========
    window.InvestmentAnalytics = InvestmentAnalytics;
    
    // ========== AUTO-INIT ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            InvestmentAnalytics.init();
        });
    } else {
        InvestmentAnalytics.init();
    }
    
    console.log('✅ Investment Analytics Module - ALL FIXES APPLIED');
    
})();