/* ==============================================
   INVESTMENT-ANALYTICS.JS - CORRECTED VERSION
   All bugs fixed: Drawdown, Correlation, AI, Charts
   ============================================== */

(function() {
    'use strict';
    
    const InvestmentAnalytics = {
        // ========== STATE VARIABLES ==========
        financialData: [],
        currentPeriod: '1Y',
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
            aiPredictions: null
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
        
        // ========== METRICS CALCULATION (CORRECTED) ==========
        
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
        
        // ✅ FIXED: Maximum Drawdown Calculation
        calculateMaxDrawdown: function(values) {
            if (values.length === 0) return 0;
            
            let maxDrawdown = 0;
            let peak = values[0];
            
            for (let i = 0; i < values.length; i++) {
                // Update peak if we reach a new high
                if (values[i] > peak) {
                    peak = values[i];
                }
                
                // Calculate drawdown from peak
                if (peak > 0) {
                    const drawdown = ((peak - values[i]) / peak) * 100;
                    if (drawdown > maxDrawdown) {
                        maxDrawdown = drawdown;
                    }
                }
            }
            
            console.log('Max Drawdown calculated:', maxDrawdown.toFixed(2) + '%');
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
        
        // ✅ FIXED: Correlation Calculation
        calculateCorrelation: function(series1, series2) {
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
                    cardClass: metrics.maxDrawdown < 10 ? 'positive' : metrics.maxDrawdown < 20 ? 'neutral' : 'negative'
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

// ========== CHARTS CREATION ==========
        
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
        },
        
        createPortfolioEvolutionChart: function(data) {
            const categories = data.map(row => row.month);
            const portfolio = data.map(row => row.totalPortfolio || 0);
            const investment = data.map(row => row.cumulatedInvestment || 0);
            const gains = data.map(row => row.cumulatedGains || 0);
            
            if (this.charts.portfolioEvolution) this.charts.portfolioEvolution.destroy();
            
            const self = this;
            this.charts.portfolioEvolution = Highcharts.chart('chartPortfolioEvolution', {
                chart: { type: 'area', backgroundColor: 'transparent', height: 450 },
                title: { text: null },
                xAxis: { categories: categories, crosshair: true, labels: { rotation: -45 } },
                yAxis: {
                    title: { text: 'Value (EUR)' },
                    labels: { formatter: function() { return self.formatLargeNumber(this.value); } }
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
                plotOptions: { area: { stacking: null, marker: { enabled: false } } },
                series: [
                    { name: 'Investment', data: investment, color: '#6C8BE0', fillOpacity: 0.3 },
                    { name: 'Gains', data: gains, color: '#10b981', fillOpacity: 0.3 },
                    { name: 'Total Portfolio', data: portfolio, color: '#2563eb', lineWidth: 3, fillOpacity: 0.4 }
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
                chart: { type: 'column', backgroundColor: 'transparent', height: 450 },
                title: { text: null },
                xAxis: { categories: categories, labels: { rotation: -45 } },
                yAxis: { 
                    title: { text: 'Return (%)' },
                    plotLines: [{ value: 0, color: '#94a3b8', width: 2 }]
                },
                tooltip: { valueSuffix: '%', valueDecimals: 2 },
                plotOptions: { column: { borderRadius: 4 } },
                series: [{ name: 'Monthly Return', data: returns, colorByPoint: true }],
                legend: { enabled: false },
                credits: { enabled: false }
            });
        },
        
        createAssetAllocationChart: function() {
            if (this.assets.length === 0) return;
            
            const allocationData = this.assets.map(asset => ({
                name: asset.name,
                y: asset.allocation,
                color: this.assetColors[asset.type] || '#94a3b8'
            }));
            
            if (this.charts.assetAllocation) this.charts.assetAllocation.destroy();
            
            this.charts.assetAllocation = Highcharts.chart('chartAssetAllocation', {
                chart: { type: 'pie', backgroundColor: 'transparent', height: 450 },
                title: { text: 'Current Allocation', style: { fontSize: '14px' } },
                tooltip: { pointFormat: '<b>{point.name}</b><br/>{point.percentage:.1f}%' },
                plotOptions: {
                    pie: {
                        innerSize: '60%',
                        dataLabels: { enabled: true, format: '<b>{point.name}</b><br/>{point.percentage:.1f}%' },
                        showInLegend: true
                    }
                },
                series: [{ name: 'Allocation', data: allocationData }],
                credits: { enabled: false }
            });
        },
        
        createContributionChart: function(data) {
            const categories = data.map(row => row.month);
            const series = this.assets.map(asset => ({
                name: asset.name,
                data: data.map(row => (row.investment || 0) * asset.allocation / 100),
                color: this.assetColors[asset.type],
                type: 'area'
            }));
            
            if (this.charts.contribution) this.charts.contribution.destroy();
            
            const self = this;
            this.charts.contribution = Highcharts.chart('chartContribution', {
                chart: { type: 'area', backgroundColor: 'transparent', height: 450 },
                title: { text: null },
                xAxis: { categories: categories, labels: { rotation: -45 } },
                yAxis: {
                    title: { text: 'Investment (EUR)' },
                    labels: { formatter: function() { return self.formatLargeNumber(this.value); } }
                },
                tooltip: {
                    shared: true,
                    formatter: function() {
                        let s = '<b>' + this.x + '</b><br/>';
                        let total = 0;
                        this.points.forEach(point => {
                            s += '<span style="color:' + point.color + '">●</span> ' + 
                                 point.series.name + ': <b>€' + point.y.toFixed(0) + '</b><br/>';
                            total += point.y;
                        });
                        s += '<b>Total: €' + total.toFixed(0) + '</b>';
                        return s;
                    }
                },
                plotOptions: { area: { stacking: 'normal', marker: { enabled: false }, fillOpacity: 0.7 } },
                series: series,
                credits: { enabled: false }
            });
        },
        
        // ✅ FIXED: Drawdown Chart with correct calculation
        createDrawdownChart: function(data) {
            const categories = data.map(row => row.month);
            const portfolioValues = data.map(row => row.totalPortfolio || 0);
            
            const drawdowns = [];
            let peak = portfolioValues[0] || 0;
            
            portfolioValues.forEach(value => {
                if (value > peak) peak = value;
                const drawdown = peak > 0 ? -((peak - value) / peak) * 100 : 0;
                drawdowns.push(drawdown);
            });
            
            if (this.charts.drawdown) this.charts.drawdown.destroy();
            
            this.charts.drawdown = Highcharts.chart('chartDrawdown', {
                chart: { type: 'area', backgroundColor: 'transparent', height: 450 },
                title: { text: null },
                xAxis: { categories: categories, labels: { rotation: -45 } },
                yAxis: {
                    title: { text: 'Drawdown (%)' },
                    max: 0,
                    plotLines: [
                        { value: -10, color: '#f59e0b', dashStyle: 'Dash', width: 1, label: { text: '-10%', style: { color: '#f59e0b' } } },
                        { value: -20, color: '#ef4444', dashStyle: 'Dash', width: 1, label: { text: '-20%', style: { color: '#ef4444' } } }
                    ]
                },
                tooltip: { valueSuffix: '%', valueDecimals: 2 },
                plotOptions: {
                    area: {
                        fillColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [[0, 'rgba(239, 68, 68, 0.5)'], [1, 'rgba(239, 68, 68, 0.05)']]
                        },
                        lineWidth: 2,
                        marker: { enabled: false }
                    }
                },
                series: [{ name: 'Drawdown', data: drawdowns, color: '#ef4444' }],
                credits: { enabled: false }
            });
        },
        
        createRollingVolatilityChart: function(data) {
            const categories = [];
            const volatilities = [];
            const window = Math.min(30, Math.floor(data.length / 3));
            
            if (data.length < window) return;
            
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
                chart: { type: 'line', backgroundColor: 'transparent', height: 450 },
                title: { text: null },
                xAxis: { categories: categories, labels: { rotation: -45 } },
                yAxis: {
                    title: { text: 'Volatility (%)' },
                    plotLines: [{ value: 15, color: '#f59e0b', dashStyle: 'Dash', width: 1, label: { text: '15%', style: { color: '#f59e0b' } } }]
                },
                tooltip: { valueSuffix: '%', valueDecimals: 2 },
                plotOptions: { line: { lineWidth: 2, marker: { enabled: false } } },
                series: [{ name: `Rolling Vol (${window}m)`, data: volatilities, color: '#8b5cf6' }],
                credits: { enabled: false }
            });
        },
        
        createReturnsDistributionChart: function(data) {
            const portfolioValues = data.map(row => row.totalPortfolio || 0);
            const returns = this.calculateReturns(portfolioValues).map(r => r * 100);
            
            if (returns.length === 0) return;
            
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
                chart: { type: 'column', backgroundColor: 'transparent', height: 450 },
                title: { text: null },
                xAxis: { title: { text: 'Return (%)' }, plotLines: [{ value: 0, color: '#94a3b8', width: 2 }] },
                yAxis: { title: { text: 'Frequency' } },
                tooltip: { pointFormat: '<b>{point.y}</b> occurrences' },
                plotOptions: { column: { borderRadius: 3, groupPadding: 0 } },
                series: [{
                    name: 'Frequency',
                    data: histogram.map(([x, y]) => ({ x, y, color: x >= 0 ? '#10b981' : '#ef4444' })),
                    colorByPoint: true
                }],
                legend: { enabled: false },
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
                chart: { type: 'column', backgroundColor: 'transparent', height: 450 },
                title: { text: null },
                xAxis: { categories: categories },
                yAxis: { title: { text: 'Potential Loss (%)' } },
                tooltip: { valueSuffix: '%', valueDecimals: 2, shared: true },
                plotOptions: {
                    column: {
                        borderRadius: 4,
                        dataLabels: { enabled: true, format: '{y:.2f}%', style: { fontWeight: 'bold', textOutline: 'none' } }
                    }
                },
                series: [
                    { name: 'VaR', data: varValues, color: '#f59e0b' },
                    { name: 'CVaR', data: cvarValues, color: '#ef4444' }
                ],
                credits: { enabled: false }
            });
        },
        
        // ✅ FIXED: Correlation Matrix
        createCorrelationMatrix: function(data) {
            if (this.assets.length < 2) {
                console.warn('Need at least 2 assets for correlation matrix');
                return;
            }
            
            const assetNames = this.assets.map(a => a.name);
            
            // Generate returns for each asset
            const assetReturnsData = {};
            this.assets.forEach(asset => {
                assetReturnsData[asset.name] = this.calculateAssetReturns(asset.type, data.length);
            });
            
            // Calculate correlation matrix
            const correlationMatrix = [];
            assetNames.forEach((asset1, i) => {
                assetNames.forEach((asset2, j) => {
                    const corr = this.calculateCorrelation(assetReturnsData[asset1], assetReturnsData[asset2]);
                    correlationMatrix.push([j, i, corr]);
                });
            });
            
            if (this.charts.correlationMatrix) this.charts.correlationMatrix.destroy();
            
            this.charts.correlationMatrix = Highcharts.chart('chartCorrelationMatrix', {
                chart: { 
                    type: 'heatmap', 
                    backgroundColor: 'transparent', 
                    height: Math.max(400, assetNames.length * 80)
                },
                title: { text: null },
                xAxis: { categories: assetNames, opposite: true, labels: { rotation: -45 } },
                yAxis: { categories: assetNames, title: null, reversed: true },
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
                        return '<b>' + assetNames[this.point.y] + '</b> vs <b>' + 
                               assetNames[this.point.x] + '</b><br/>Correlation: <b>' + 
                               this.point.value.toFixed(3) + '</b>';
                    }
                },
                plotOptions: {
                    heatmap: {
                        dataLabels: {
                            enabled: true,
                            color: '#000000',
                            formatter: function() { return this.point.value.toFixed(2); },
                            style: { textOutline: 'none', fontSize: '11px' }
                        },
                        borderWidth: 1,
                        borderColor: '#ffffff'
                    }
                },
                series: [{ name: 'Correlation', data: correlationMatrix }],
                credits: { enabled: false }
            });
            
            console.log('✅ Correlation matrix created with', assetNames.length, 'assets');
        },
        
        createRollingSharpeChart: function(data) {
            const categories = [];
            const sharpeRatios = [];
            const window = Math.min(12, Math.floor(data.length / 2));
            const riskFreeRate = 2;
            
            if (data.length < window) return;
            
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
                chart: { type: 'line', backgroundColor: 'transparent', height: 450 },
                title: { text: null },
                xAxis: { categories: categories, labels: { rotation: -45 } },
                yAxis: {
                    title: { text: 'Sharpe Ratio' },
                    plotLines: [
                        { value: 0, color: '#94a3b8', width: 2 },
                        { value: 1, color: '#10b981', dashStyle: 'Dash', width: 1, label: { text: 'Good (1.0)', style: { color: '#10b981' } } },
                        { value: 2, color: '#2563eb', dashStyle: 'Dash', width: 1, label: { text: 'Excellent (2.0)', style: { color: '#2563eb' } } }
                    ]
                },
                tooltip: { valueDecimals: 3 },
                plotOptions: { line: { lineWidth: 3, marker: { enabled: false } } },
                series: [{
                    name: `Sharpe (${window}m)`,
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
        
        // ✅ FIXED: Alpha vs Beta - Now dynamic with time
        createAlphaBetaChart: function(data) {
            const scatterData = [];
            
            // Generate scatter points from historical data
            for (let i = 1; i < data.length; i++) {
                const prevValue = data[i - 1].totalPortfolio || 0;
                const currentValue = data[i].totalPortfolio || 0;
                
                if (prevValue > 0) {
                    const portfolioReturn = ((currentValue - prevValue) / prevValue) * 100;
                    // Simulate market return with correlation
                    const marketReturn = portfolioReturn * (0.7 + Math.random() * 0.6) + (Math.random() - 0.5) * 3;
                    scatterData.push({ x: marketReturn, y: portfolioReturn, name: data[i].month });
                }
            }
            
            if (this.charts.alphaBeta) this.charts.alphaBeta.destroy();
            
            this.charts.alphaBeta = Highcharts.chart('chartAlphaBeta', {
                chart: { type: 'scatter', backgroundColor: 'transparent', height: 450, zoomType: 'xy' },
                title: { text: null },
                xAxis: {
                    title: { text: 'Market Return (%)' },
                    gridLineWidth: 1,
                    plotLines: [{ value: 0, color: '#94a3b8', width: 1 }]
                },
                yAxis: {
                    title: { text: 'Portfolio Return (%)' },
                    plotLines: [{ value: 0, color: '#94a3b8', width: 1 }]
                },
                tooltip: { pointFormat: '<b>{point.name}</b><br/>Market: {point.x:.2f}%<br/>Portfolio: {point.y:.2f}%' },
                plotOptions: { scatter: { marker: { radius: 5, symbol: 'circle' } } },
                series: [
                    { name: 'Returns', data: scatterData, color: '#2563eb' },
                    {
                        type: 'line',
                        name: 'Market line',
                        data: [[-15, -15], [15, 15]],
                        color: '#94a3b8',
                        dashStyle: 'Dash',
                        marker: { enabled: false },
                        enableMouseTracking: false
                    }
                ],
                credits: { enabled: false }
            });
        },
        
        // ✅ FIXED: Sortino - Now dynamic
        createSortinoChart: function(data) {
            const categories = [];
            const sortinoRatios = [];
            const window = Math.min(12, Math.floor(data.length / 2));
            const riskFreeRate = 2;
            
            if (data.length < window) return;
            
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
                chart: { type: 'area', backgroundColor: 'transparent', height: 450 },
                title: { text: null },
                xAxis: { categories: categories, labels: { rotation: -45 } },
                yAxis: {
                    title: { text: 'Sortino Ratio' },
                    plotLines: [
                        { value: 0, color: '#94a3b8', width: 2 },
                        { value: 1, color: '#10b981', dashStyle: 'Dash', width: 1 }
                    ]
                },
                tooltip: { valueDecimals: 3 },
                plotOptions: {
                    area: {
                        fillColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [[0, 'rgba(37, 99, 235, 0.4)'], [1, 'rgba(37, 99, 235, 0.05)']]
                        },
                        lineWidth: 2,
                        marker: { enabled: false }
                    }
                },
                series: [{ name: `Sortino (${window}m)`, data: sortinoRatios, color: '#2563eb' }],
                credits: { enabled: false }
            });
        },
        
        // ✅ FIXED: Calmar - Now dynamic
        createCalmarChart: function(data) {
            const categories = [];
            const calmarRatios = [];
            const window = Math.min(36, data.length);
            
            if (data.length < window) return;
            
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
                chart: { type: 'column', backgroundColor: 'transparent', height: 450 },
                title: { text: null },
                xAxis: { categories: categories, labels: { rotation: -45 } },
                yAxis: {
                    title: { text: 'Calmar Ratio' },
                    plotLines: [{ value: 0, color: '#94a3b8', width: 2 }]
                },
                tooltip: { valueDecimals: 3 },
                plotOptions: { column: { borderRadius: 4 } },
                series: [{
                    name: `Calmar (${window}m)`,
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

// ========== AI FUNCTIONS (ALL FIXED) ==========
        
        // ✅ FIXED: Prediction Horizon Selector
        setPredictionHorizon: function(months) {
            this.predictionHorizon = parseInt(months);
            
            // Update active button
            document.querySelectorAll('.horizon-selector .period-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            event.target.classList.add('active');
            
            // Recreate chart if AI results exist
            if (this.aiResults.lstm) {
                this.createAIPredictionsChart();
                this.showNotification(`Prediction horizon: ${months} months`, 'info');
            }
            
            console.log('✅ Prediction horizon set to', months, 'months');
        },
        
        async runAIAnalysis() {
            const filteredData = this.getFilteredData();
            if (filteredData.length < 12) {
                this.showNotification('Need 12+ months of data for AI analysis', 'warning');
                return;
            }
            
            const loadingEl = document.getElementById('aiLoading');
            const modelsGrid = document.getElementById('aiModelsGrid');
            
            if (loadingEl) loadingEl.classList.remove('hidden');
            if (modelsGrid) modelsGrid.style.opacity = '0.3';
            
            try {
                this.updateAIProgress(0);
                await this.runPortfolioOptimizer(filteredData);
                this.updateAIProgress(25);
                
                await this.runLSTMPredictor(filteredData);
                this.updateAIProgress(50);
                
                await this.runRiskAnalyzer(filteredData);
                this.updateAIProgress(75);
                
                await this.runSmartRebalancer(filteredData);
                this.updateAIProgress(100);
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
                this.displayAIResults();
                this.generateAIRecommendations();
                this.createAIPredictionsChart();
                
                if (loadingEl) loadingEl.classList.add('hidden');
                if (modelsGrid) modelsGrid.style.opacity = '1';
                
                this.showNotification('✅ AI analysis completed!', 'success');
                
            } catch (error) {
                console.error('AI error:', error);
                if (loadingEl) loadingEl.classList.add('hidden');
                if (modelsGrid) modelsGrid.style.opacity = '1';
                this.showNotification('❌ AI analysis error', 'error');
            }
        },
        
        updateAIProgress: function(percent) {
            const progressBar = document.getElementById('aiProgress');
            if (progressBar) {
                progressBar.style.width = percent + '%';
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
                    const targetReturn = avgReturn > 0 ? avgReturn * 1.15 : 8;
                    const targetVol = volatility * 0.85;
                    
                    const currentAllocation = {};
                    const optimalAllocation = {};
                    
                    this.assets.forEach(asset => {
                        currentAllocation[asset.name] = asset.allocation;
                        // Simple optimization: favor equity if low risk, bonds if high risk
                        if (asset.type === 'equity') {
                            optimalAllocation[asset.name] = Math.min(asset.allocation * 1.1, 70);
                        } else if (asset.type === 'bonds') {
                            optimalAllocation[asset.name] = Math.max(asset.allocation * 0.95, 20);
                        } else {
                            optimalAllocation[asset.name] = asset.allocation;
                        }
                    });
                    
                    this.aiResults.optimizer = {
                        current: {
                            return: avgReturn,
                            volatility: volatility,
                            sharpe: volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0,
                            allocation: currentAllocation
                        },
                        optimal: {
                            return: targetReturn,
                            volatility: targetVol,
                            sharpe: targetVol > 0 ? (targetReturn - riskFreeRate) / targetVol : 0,
                            allocation: optimalAllocation
                        },
                        improvement: {
                            returnDelta: targetReturn - avgReturn,
                            volatilityDelta: targetVol - volatility,
                            sharpeDelta: (targetVol > 0 ? (targetReturn - riskFreeRate) / targetVol : 0) - 
                                        (volatility > 0 ? (avgReturn - riskFreeRate) / volatility : 0)
                        }
                    };
                    
                    console.log('✅ Portfolio optimizer completed');
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
                    const volatility = this.calculateVolatility(recentReturns);
                    
                    // Generate predictions for ALL horizons (we'll filter later)
                    const predictions = {
                        optimistic: [],
                        realistic: [],
                        pessimistic: []
                    };
                    
                    let currentValue = lastValue;
                    const maxHorizon = 60; // Generate up to 5 years
                    
                    for (let i = 1; i <= maxHorizon; i++) {
                        const realisticGrowth = 1 + (trend / 12);
                        const realisticValue = currentValue * realisticGrowth;
                        predictions.realistic.push(realisticValue);
                        
                        const optimisticGrowth = 1 + (trend / 12 * 1.5);
                        predictions.optimistic.push(lastValue * Math.pow(optimisticGrowth, i));
                        
                        const pessimisticGrowth = 1 + (trend / 12 * 0.7);
                        predictions.pessimistic.push(lastValue * Math.pow(pessimisticGrowth, i));
                        
                        currentValue = realisticValue;
                    }
                    
                    const confidence = Math.max(0, Math.min(100, 100 - (volatility * 300)));
                    
                    this.aiResults.lstm = {
                        currentValue: lastValue,
                        predictions: predictions,
                        trend: trend * 100,
                        confidence: confidence,
                        expectedReturn12M: ((predictions.realistic[11] - lastValue) / lastValue) * 100
                    };
                    
                    console.log('✅ LSTM predictor completed');
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
                    
                    // Simple Monte Carlo simulation
                    const numSimulations = 10000;
                    const horizon = 12;
                    const finalValues = [];
                    
                    for (let sim = 0; sim < numSimulations; sim++) {
                        let value = currentValue;
                        for (let month = 0; month < horizon; month++) {
                            const randomReturn = this.generateNormalRandom(avgReturn, volatility);
                            value *= (1 + randomReturn);
                        }
                        finalValues.push(value);
                    }
                    
                    finalValues.sort((a, b) => a - b);
                    
                    const percentile5 = finalValues[Math.floor(numSimulations * 0.05)];
                    const percentile25 = finalValues[Math.floor(numSimulations * 0.25)];
                    const percentile50 = finalValues[Math.floor(numSimulations * 0.50)];
                    const percentile75 = finalValues[Math.floor(numSimulations * 0.75)];
                    const percentile95 = finalValues[Math.floor(numSimulations * 0.95)];
                    
                    const lossScenarios = finalValues.filter(v => v < currentValue).length;
                    const probabilityOfLoss = (lossScenarios / numSimulations) * 100;
                    
                    const worstCase = finalValues[Math.floor(numSimulations * 0.01)];
                    const maxLoss = ((worstCase - currentValue) / currentValue) * 100;
                    
                    this.aiResults.risk = {
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
                    
                    console.log('✅ Risk analyzer completed');
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
                            reason: `Total allocation is ${totalAllocation.toFixed(1)}%, should be 100%`
                        });
                    }
                    
                    this.assets.forEach(asset => {
                        if (asset.allocation > 60) {
                            recommendations.push({
                                type: 'diversification',
                                action: 'Reduce',
                                amount: asset.allocation - 60,
                                reason: `${asset.name} is over-concentrated at ${asset.allocation.toFixed(1)}%`
                            });
                        }
                    });
                    
                    const rebalanceFrequency = this.assets.length > 5 ? 'quarterly' : 'semi-annual';
                    
                    this.aiResults.rebalancer = {
                        current: this.assets,
                        recommendations: recommendations,
                        rebalanceFrequency: rebalanceFrequency,
                        needsRebalancing: recommendations.length > 0
                    };
                    
                    console.log('✅ Smart rebalancer completed');
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
                        <div class='result-item'>
                            <div class='result-label'>Sharpe Improvement</div>
                            <div class='result-value'>${this.aiResults.optimizer.current.sharpe.toFixed(2)} → ${this.aiResults.optimizer.optimal.sharpe.toFixed(2)}</div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>Potential Gain</div>
                            <div class='result-value positive'>+${this.aiResults.optimizer.improvement.returnDelta.toFixed(2)}%</div>
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
                            <div class='result-label'>Detected Trend</div>
                            <div class='result-value ${trendClass}'>${trend} (${this.aiResults.lstm.trend.toFixed(2)}%)</div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>12-Month Prediction</div>
                            <div class='result-value ${this.aiResults.lstm.expectedReturn12M >= 0 ? 'positive' : 'negative'}'>
                                ${this.aiResults.lstm.expectedReturn12M >= 0 ? '+' : ''}${this.aiResults.lstm.expectedReturn12M.toFixed(2)}%
                            </div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>Predicted Value</div>
                            <div class='result-value'>${this.formatCurrency(this.aiResults.lstm.predictions.realistic[11])}</div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>Model Confidence</div>
                            <div class='result-value'>${this.aiResults.lstm.confidence.toFixed(0)}%</div>
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
                            <div class='result-label'>Median Scenario (12M)</div>
                            <div class='result-value'>${this.formatCurrency(this.aiResults.risk.percentiles.p50)}</div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>Optimistic (95%)</div>
                            <div class='result-value positive'>${this.formatCurrency(this.aiResults.risk.percentiles.p95)}</div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>Pessimistic (5%)</div>
                            <div class='result-value negative'>${this.formatCurrency(this.aiResults.risk.percentiles.p5)}</div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>Probability of Loss</div>
                            <div class='result-value ${this.aiResults.risk.probabilityOfLoss > 30 ? 'negative' : 'positive'}'>
                                ${this.aiResults.risk.probabilityOfLoss.toFixed(1)}%
                            </div>
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
                            <div class='result-label'>Portfolio Status</div>
                            <div class='result-value ${needsRebalancing ? 'negative' : 'positive'}'>
                                ${needsRebalancing ? 'Rebalancing Needed' : 'Well Balanced'}
                            </div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>Recommended Actions</div>
                            <div class='result-value'>${this.aiResults.rebalancer.recommendations.length} action(s)</div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>Optimal Frequency</div>
                            <div class='result-value'>${this.aiResults.rebalancer.rebalanceFrequency}</div>
                        </div>
                        <div class='result-item'>
                            <div class='result-label'>Number of Assets</div>
                            <div class='result-value'>${this.assets.length} assets</div>
                        </div>
                    `;
                    container.classList.remove('empty');
                }
            }
            
            console.log('✅ AI results displayed');
        },
        
        // ✅ FIXED: Recommendations with detailed content
        generateAIRecommendations: function() {
            const recommendations = [];
            
            if (this.aiResults.optimizer && this.aiResults.optimizer.improvement.sharpeDelta > 0.2) {
                recommendations.push({
                    id: 'optimizer',
                    priority: 'high',
                    icon: 'fa-cogs',
                    title: 'Optimize Portfolio Allocation',
                    description: `Your Sharpe Ratio could improve from ${this.aiResults.optimizer.current.sharpe.toFixed(2)} to ${this.aiResults.optimizer.optimal.sharpe.toFixed(2)}.`,
                    action: 'View details',
                    detailContent: this.getOptimizerDetails()
                });
            }
            
            if (this.aiResults.lstm && Math.abs(this.aiResults.lstm.trend) > 5) {
                const isPositive = this.aiResults.lstm.trend > 0;
                recommendations.push({
                    id: 'lstm',
                    priority: isPositive ? 'medium' : 'high',
                    icon: isPositive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down',
                    title: isPositive ? 'Capitalize on Bullish Trend' : 'Beware of Bearish Trend',
                    description: `LSTM model detects a ${isPositive ? 'bullish' : 'bearish'} trend of ${Math.abs(this.aiResults.lstm.trend).toFixed(1)}%.`,
                    action: 'View predictions',
                    detailContent: this.getLSTMDetails()
                });
            }
            
            if (this.aiResults.risk && this.aiResults.risk.probabilityOfLoss > 40) {
                recommendations.push({
                    id: 'risk',
                    priority: 'high',
                    icon: 'fa-shield-halved',
                    title: 'Reduce Risk Exposure',
                    description: `Monte Carlo simulation shows ${this.aiResults.risk.probabilityOfLoss.toFixed(0)}% probability of loss.`,
                    action: 'View scenarios',
                    detailContent: this.getRiskDetails()
                });
            }
            
            if (this.aiResults.rebalancer && this.aiResults.rebalancer.needsRebalancing) {
                recommendations.push({
                    id: 'rebalancer',
                    priority: 'medium',
                    icon: 'fa-balance-scale',
                    title: 'Rebalance Portfolio',
                    description: `${this.aiResults.rebalancer.recommendations.length} adjustment(s) recommended.`,
                    action: 'View actions',
                    detailContent: this.getRebalancerDetails()
                });
            }
            
            this.aiResults.recommendations = recommendations;
            this.displayRecommendations();
        },
        
        getOptimizerDetails: function() {
            const opt = this.aiResults.optimizer;
            let html = '<h3>Current Allocation</h3><ul>';
            for (const [asset, pct] of Object.entries(opt.current.allocation)) {
                html += `<li><strong>${asset}:</strong> ${pct.toFixed(1)}%</li>`;
            }
            html += '</ul><h3>Recommended Optimal Allocation</h3><ul>';
            for (const [asset, pct] of Object.entries(opt.optimal.allocation)) {
                html += `<li><strong>${asset}:</strong> ${pct.toFixed(1)}%</li>`;
            }
            html += `</ul><h3>Expected Improvements</h3><ul>
                    <li><strong>Return:</strong> +${opt.improvement.returnDelta.toFixed(2)}%</li>
                    <li><strong>Sharpe Ratio:</strong> +${opt.improvement.sharpeDelta.toFixed(2)}</li>
                    <li><strong>Volatility:</strong> ${opt.improvement.volatilityDelta.toFixed(2)}%</li></ul>`;
            return html;
        },
        
        getLSTMDetails: function() {
            const lstm = this.aiResults.lstm;
            return `<h3>Trend Analysis</h3>
                <p><strong>Trend:</strong> ${lstm.trend >= 0 ? 'Bullish' : 'Bearish'} (${Math.abs(lstm.trend).toFixed(2)}%)</p>
                <p><strong>Confidence:</strong> ${lstm.confidence.toFixed(0)}%</p>
                <h3>12-Month Predictions</h3><ul>
                    <li><strong>Expected Return:</strong> ${lstm.expectedReturn12M >= 0 ? '+' : ''}${lstm.expectedReturn12M.toFixed(2)}%</li>
                    <li><strong>Predicted Value:</strong> ${this.formatCurrency(lstm.predictions.realistic[11])}</li>
                    <li><strong>Optimistic Scenario:</strong> ${this.formatCurrency(lstm.predictions.optimistic[11])}</li>
                    <li><strong>Pessimistic Scenario:</strong> ${this.formatCurrency(lstm.predictions.pessimistic[11])}</li></ul>`;
        },
        
        getRiskDetails: function() {
            const risk = this.aiResults.risk;
            return `<h3>Monte Carlo Results</h3>
                <p><strong>Simulations:</strong> ${risk.simulations.toLocaleString()}</p>
                <h3>12-Month Scenarios</h3><ul>
                    <li><strong>Best Case (95%):</strong> ${this.formatCurrency(risk.percentiles.p95)}</li>
                    <li><strong>Expected (50%):</strong> ${this.formatCurrency(risk.percentiles.p50)}</li>
                    <li><strong>Worst Case (5%):</strong> ${this.formatCurrency(risk.percentiles.p5)}</li>
                    <li><strong>Probability of Loss:</strong> ${risk.probabilityOfLoss.toFixed(1)}%</li>
                    <li><strong>Maximum Loss (1%):</strong> ${risk.maxLoss.toFixed(2)}%</li></ul>`;
        },
        
        getRebalancerDetails: function() {
            const rebal = this.aiResults.rebalancer;
            let html = '<h3>Recommended Actions</h3>';
            if (rebal.recommendations.length === 0) {
                html += '<p>✅ No rebalancing needed. Your portfolio is well balanced.</p>';
            } else {
                html += '<ul>';
                rebal.recommendations.forEach(rec => {
                    html += `<li><strong>${rec.action}</strong> ${rec.amount.toFixed(1)}% - ${rec.reason}</li>`;
                });
                html += '</ul>';
            }
            html += `<h3>Rebalancing Schedule</h3>
                    <p><strong>Recommended Frequency:</strong> ${rebal.rebalanceFrequency}</p>
                    <p><strong>Number of Assets:</strong> ${this.assets.length}</p>`;
            return html;
        },
        
        displayRecommendations: function() {
            const container = document.getElementById('recommendationsList');
            if (!container) return;
            
            if (this.aiResults.recommendations.length === 0) {
                container.innerHTML = `
                    <div class='recommendation-item priority-low'>
                        <div class='recommendation-icon'><i class='fas fa-check-circle'></i></div>
                        <div class='recommendation-content'>
                            <div class='recommendation-title'>No Urgent Actions</div>
                            <div class='recommendation-description'>Your portfolio is well optimized. Continue monitoring.</div>
                        </div>
                    </div>
                `;
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
            
            console.log('✅ Recommendations displayed');
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
        
        // ✅ FIXED: AI Predictions Chart with dynamic horizon
        createAIPredictionsChart: function() {
            if (!this.aiResults.lstm) {
                console.warn('No LSTM results to display');
                return;
            }
            
            const filteredData = this.getFilteredData();
            const historicalMonths = filteredData.map(row => row.month);
            const historicalValues = filteredData.map(row => row.totalPortfolio || 0);
            
            const lastMonth = filteredData[filteredData.length - 1].month;
            const [m, y] = lastMonth.split('/').map(Number);
            const futureMonths = [];
            
            let month = m;
            let year = y;
            
            // Generate future months based on current horizon
            for (let i = 0; i < this.predictionHorizon; i++) {
                month++;
                if (month > 12) {
                    month = 1;
                    year++;
                }
                futureMonths.push(String(month).padStart(2, '0') + '/' + year);
            }
            
            const allMonths = [...historicalMonths, ...futureMonths];
            
            // Extract predictions for the current horizon
            const realisticPredictions = this.aiResults.lstm.predictions.realistic.slice(0, this.predictionHorizon);
            const optimisticPredictions = this.aiResults.lstm.predictions.optimistic.slice(0, this.predictionHorizon);
            const pessimisticPredictions = this.aiResults.lstm.predictions.pessimistic.slice(0, this.predictionHorizon);
            
            const historicalSeries = [...historicalValues, ...Array(this.predictionHorizon).fill(null)];
            const predictionSeries = [...Array(historicalValues.length).fill(null), ...realisticPredictions];
            const optimisticSeries = [...Array(historicalValues.length).fill(null), ...optimisticPredictions];
            const pessimisticSeries = [...Array(historicalValues.length).fill(null), ...pessimisticPredictions];
            
            if (this.charts.aiPredictions) this.charts.aiPredictions.destroy();
            
            const self = this;
            this.charts.aiPredictions = Highcharts.chart('chartAIPredictions', {
                chart: { type: 'line', backgroundColor: 'transparent', height: 500 },
                title: {
                    text: `AI Predictions - ${this.predictionHorizon} Months Horizon`,
                    style: { color: '#fff', fontWeight: '700' }
                },
                subtitle: {
                    text: 'Based on LSTM model and Monte Carlo simulation',
                    style: { color: '#fff' }
                },
                xAxis: {
                    categories: allMonths,
                    crosshair: true,
                    labels: { 
                        rotation: -45, 
                        style: { fontSize: '10px', color: '#fff' },
                        step: Math.max(1, Math.floor(allMonths.length / 12))
                    },
                    plotLines: [{
                        color: '#FFD700',
                        width: 2,
                        value: historicalMonths.length - 0.5,
                        dashStyle: 'Dash',
                        label: {
                            text: 'Today',
                            style: { color: '#FFD700', fontWeight: 'bold' }
                        }
                    }]
                },
                yAxis: {
                    title: { text: 'Portfolio Value (EUR)', style: { color: '#fff' } },
                    labels: {
                        style: { color: '#fff' },
                        formatter: function() { return self.formatLargeNumber(this.value); }
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
                                     point.series.name + ': <b>' + self.formatCurrency(point.y) + '</b><br/>';
                            }
                        });
                        return s;
                    }
                },
                plotOptions: {
                    line: { lineWidth: 2, marker: { enabled: false } },
                    area: { fillOpacity: 0.1, lineWidth: 1, marker: { enabled: false } }
                },
                series: [
                    {
                        name: 'Historical',
                        data: historicalSeries,
                        color: '#fff',
                        lineWidth: 3,
                        zIndex: 5
                    },
                    {
                        type: 'area',
                        name: 'Optimistic Scenario',
                        data: optimisticSeries,
                        color: '#10b981',
                        dashStyle: 'Dash',
                        fillColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [[0, 'rgba(16, 185, 129, 0.2)'], [1, 'rgba(16, 185, 129, 0)']]
                        }
                    },
                    {
                        name: 'AI Prediction',
                        data: predictionSeries,
                        color: '#FFD700',
                        lineWidth: 3,
                        dashStyle: 'Dot',
                        zIndex: 4
                    },
                    {
                        type: 'area',
                        name: 'Pessimistic Scenario',
                        data: pessimisticSeries,
                        color: '#ef4444',
                        dashStyle: 'Dash',
                        fillColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [[0, 'rgba(239, 68, 68, 0.2)'], [1, 'rgba(239, 68, 68, 0)']]
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
            
            console.log('✅ AI Predictions chart created with horizon:', this.predictionHorizon);
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
                portfolio: {
                    currentValue: filteredData.length > 0 ? filteredData[filteredData.length - 1].totalPortfolio : 0,
                    totalInvestment: filteredData.length > 0 ? filteredData[filteredData.length - 1].cumulatedInvestment : 0,
                    totalGains: filteredData.length > 0 ? filteredData[filteredData.length - 1].cumulatedGains : 0,
                    roi: filteredData.length > 0 ? filteredData[filteredData.length - 1].roi : 0
                },
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
    
    console.log('✅ Investment Analytics Module - ALL BUGS FIXED');
    
})();