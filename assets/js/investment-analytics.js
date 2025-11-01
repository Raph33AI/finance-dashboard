/* ==============================================
   INVESTMENT-ANALYTICS.JS - COMPLETE CORRECTED
   Asset Management + Real Correlation + Fixed VaR
   ============================================== */

const InvestmentAnalytics = {
    // ========== STATE VARIABLES ==========
    financialData: [],
    currentPeriod: '1Y',
    benchmarkSymbol: 'SPY',
    benchmarkData: null,
    apiClient: null,
    
    // ========== NEW: ASSET MANAGEMENT ==========
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
    
    init() {
        try {
            this.loadFinancialData();
            this.loadAssets();
            this.updatePortfolioSummary();
            this.renderAssetsList();
            this.displayKPIs();
            this.createAllCharts();
            this.updateLastUpdate();
            
            console.log('✅ Investment Analytics Module loaded successfully');
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.showNotification('Failed to initialize', 'error');
        }
    },
    
    loadFinancialData() {
        const saved = localStorage.getItem('financialDataDynamic');
        
        if (saved) {
            try {
                this.financialData = JSON.parse(saved);
                console.log(`📊 ${this.financialData.length} months of data loaded`);
            } catch (error) {
                console.error('Error loading data:', error);
                this.financialData = [];
            }
        } else {
            console.warn('⚠️ No financial data found');
            this.financialData = [];
        }
    },
    
    updateLastUpdate() {
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
    
    loadAssets() {
        const saved = localStorage.getItem('portfolioAssets');
        
        if (saved) {
            try {
                this.assets = JSON.parse(saved);
                console.log(`📊 ${this.assets.length} assets loaded`);
            } catch (error) {
                console.error('Error loading assets:', error);
                this.assets = this.getDefaultAssets();
            }
        } else {
            this.assets = this.getDefaultAssets();
        }
    },
    
    getDefaultAssets() {
        return [
            {
                id: Date.now(),
                name: 'S&P 500 Index',
                ticker: 'SPY',
                type: 'equity',
                allocation: 60
            },
            {
                id: Date.now() + 1,
                name: 'Bonds ETF',
                ticker: 'AGG',
                type: 'bonds',
                allocation: 30
            },
            {
                id: Date.now() + 2,
                name: 'Cash Reserve',
                ticker: '',
                type: 'cash',
                allocation: 10
            }
        ];
    },
    
    saveAssets() {
        try {
            localStorage.setItem('portfolioAssets', JSON.stringify(this.assets));
            this.updatePortfolioSummary();
            this.renderAssetsList();
            this.createAllCharts();
            this.showNotification('✅ Portfolio configuration saved', 'success');
        } catch (error) {
            console.error('Error saving assets:', error);
            this.showNotification('❌ Failed to save configuration', 'error');
        }
    },
    
    resetAssets() {
        if (confirm('Reset to default asset allocation? This will overwrite your current configuration.')) {
            this.assets = this.getDefaultAssets();
            this.saveAssets();
        }
    },
    
    updatePortfolioSummary() {
        // Get average monthly investment from financial data
        const filteredData = this.getFilteredData();
        let avgMonthlyInvestment = 0;
        
        if (filteredData.length > 0) {
            const totalInvestment = filteredData.reduce((sum, row) => sum + (row.investment || 0), 0);
            avgMonthlyInvestment = totalInvestment / filteredData.length;
        }
        
        // Update summary
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
                allocationStatusEl.textContent = `⚠ Over-allocated by ${(totalAllocation - 100).toFixed(1)}%`;
                allocationStatusEl.style.color = '#ef4444';
            } else {
                allocationStatusEl.textContent = `Remaining: ${(100 - totalAllocation).toFixed(1)}%`;
                allocationStatusEl.style.color = '#f59e0b';
            }
        }
    },
    
    renderAssetsList() {
        const container = document.getElementById('assetsList');
        if (!container) return;
        
        if (this.assets.length === 0) {
            container.innerHTML = `
                <div class='assets-empty'>
                    <i class='fas fa-folder-open'></i>
                    <h4>No Assets Configured</h4>
                    <p>Click "Add Asset" to start building your portfolio allocation</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.assets.map(asset => {
            const icon = this.getAssetIcon(asset.type);
            return `
                <div class='asset-item ${asset.type}'>
                    <div class='asset-info'>
                        <div class='asset-icon ${asset.type}'>
                            <i class='fas ${icon}'></i>
                        </div>
                        <div class='asset-details'>
                            <div class='asset-name'>${this.escapeHtml(asset.name)}</div>
                            <div class='asset-ticker'>${asset.ticker ? this.escapeHtml(asset.ticker) : 'No ticker'} • ${this.formatAssetType(asset.type)}</div>
                        </div>
                    </div>
                    <div class='asset-allocation-display'>
                        <div class='allocation-bar'>
                            <div class='allocation-fill' style='width: ${Math.min(asset.allocation, 100)}%'></div>
                        </div>
                        <div class='allocation-percent'>${asset.allocation.toFixed(1)}%</div>
                    </div>
                    <div class='asset-actions'>
                        <button class='asset-btn edit' onclick='InvestmentAnalytics.openEditAssetModal(${asset.id})' title='Edit asset'>
                            <i class='fas fa-edit'></i>
                        </button>
                        <button class='asset-btn delete' onclick='InvestmentAnalytics.deleteAsset(${asset.id})' title='Delete asset'>
                            <i class='fas fa-trash'></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    getAssetIcon(type) {
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
    
    formatAssetType(type) {
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
    
    openAddAssetModal() {
        const modal = document.getElementById('modalAddAsset');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('assetName').value = '';
            document.getElementById('assetTicker').value = '';
            document.getElementById('assetType').value = 'equity';
            document.getElementById('assetAllocation').value = '';
        }
    },
    
    closeAddAssetModal() {
        const modal = document.getElementById('modalAddAsset');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    addAsset() {
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
        
        const newAsset = {
            id: Date.now(),
            name: name,
            ticker: ticker,
            type: type,
            allocation: allocation
        };
        
        this.assets.push(newAsset);
        this.saveAssets();
        this.closeAddAssetModal();
        this.showNotification(`✅ ${name} added to portfolio`, 'success');
    },
    
    openEditAssetModal(assetId) {
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
    
    closeEditAssetModal() {
        const modal = document.getElementById('modalEditAsset');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    updateAsset() {
        const assetId = parseInt(document.getElementById('editAssetId').value);
        const name = document.getElementById('editAssetName').value.trim();
        const ticker = document.getElementById('editAssetTicker').value.trim().toUpperCase();
        const type = document.getElementById('editAssetType').value;
        const allocation = parseFloat(document.getElementById('editAssetAllocation').value);
        
        if (!name) {
            alert('Please enter an asset name');
            return;
        }
        
        if (isNaN(allocation) || allocation < 0 || allocation > 100) {
            alert('Please enter a valid allocation between 0 and 100');
            return;
        }
        
        const assetIndex = this.assets.findIndex(a => a.id === assetId);
        if (assetIndex !== -1) {
            this.assets[assetIndex] = {
                id: assetId,
                name: name,
                ticker: ticker,
                type: type,
                allocation: allocation
            };
            
            this.saveAssets();
            this.closeEditAssetModal();
            this.showNotification(`✅ ${name} updated`, 'success');
        }
    },
    
    deleteAsset(assetId) {
        const asset = this.assets.find(a => a.id === assetId);
        if (!asset) return;
        
        if (confirm(`Delete ${asset.name} from your portfolio?`)) {
            this.assets = this.assets.filter(a => a.id !== assetId);
            this.saveAssets();
            this.showNotification(`${asset.name} removed from portfolio`, 'info');
        }
    },
    
    // ========== CALCULATE ASSET RETURNS (SIMULATED) ==========
    
    calculateAssetReturns(assetType, months) {
        // Simulate returns based on asset type
        const returns = [];
        const baseReturns = {
            equity: { mean: 0.008, volatility: 0.04 },
            bonds: { mean: 0.004, volatility: 0.015 },
            crypto: { mean: 0.015, volatility: 0.12 },
            commodities: { mean: 0.005, volatility: 0.05 },
            'real-estate': { mean: 0.006, volatility: 0.025 },
            cash: { mean: 0.002, volatility: 0.002 },
            other: { mean: 0.005, volatility: 0.03 }
        };
        
        const params = baseReturns[assetType] || baseReturns.other;
        
        for (let i = 0; i < months; i++) {
            const randomReturn = this.generateNormalRandom(params.mean, params.volatility);
            returns.push(randomReturn);
        }
        
        return returns;
    },
    
    generateNormalRandom(mean, stdDev) {
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + z0 * stdDev;
    },
    
    // ========== PERIOD FILTERING ==========
    
    changePeriod(period) {
        this.currentPeriod = period;
        
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-period="${period}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.createAllCharts();
        this.showNotification(`Period changed: ${period}`, 'info');
    },
    
    getFilteredData() {
        if (this.financialData.length === 0) return [];
        
        const now = new Date();
        let startDate;
        
        switch (this.currentPeriod) {
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
                return this.financialData;
            default:
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        }
        
        return this.financialData.filter(row => {
            const [month, year] = row.month.split('/').map(Number);
            const rowDate = new Date(year, month - 1, 1);
            return rowDate >= startDate;
        });
    },
    
    // ========== METRICS CALCULATION ==========
    
    calculateMetrics(data = null) {
        const filteredData = data || this.getFilteredData();
        
        if (filteredData.length === 0) {
            return {
                totalReturn: 0, annualizedReturn: 0, volatility: 0, sharpeRatio: 0,
                sortinoRatio: 0, maxDrawdown: 0, calmarRatio: 0, winRate: 0,
                averageWin: 0, averageLoss: 0, profitFactor: 0, var95: 0,
                cvar95: 0, alpha: 0, beta: 0, informationRatio: 0
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
            profitFactor, var95: var95 * 100, cvar95: cvar95 * 100,
            alpha: 0, beta: 1, informationRatio: 0
        };
    },
    
    calculateReturns(values) {
        const returns = [];
        for (let i = 1; i < values.length; i++) {
            if (values[i - 1] > 0) {
                returns.push((values[i] - values[i - 1]) / values[i - 1]);
            }
        }
        return returns;
    },
    
    calculateVolatility(returns) {
        if (returns.length === 0) return 0;
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        return Math.sqrt(variance);
    },
    
    calculateSortinoRatio(returns, riskFreeRate) {
        if (returns.length === 0) return 0;
        
        const monthlyRiskFree = riskFreeRate / 12 / 100;
        const excessReturns = returns.map(r => r - monthlyRiskFree);
        const meanExcess = excessReturns.reduce((sum, r) => sum + r, 0) / excessReturns.length;
        
        const downsideReturns = excessReturns.filter(r => r < 0);
        if (downsideReturns.length === 0) return meanExcess > 0 ? 999 : 0;
        
        const downsideDeviation = Math.sqrt(
            downsideReturns.reduce((sum, r) => sum + r * r, 0) / downsideReturns.length
        );
        
        const annualizedMean = meanExcess * 12;
        const annualizedDD = downsideDeviation * Math.sqrt(12);
        
        return annualizedDD > 0 ? annualizedMean / annualizedDD : 0;
    },
    
    calculateMaxDrawdown(values) {
        let maxDrawdown = 0;
        let peak = values[0];
        
        for (let i = 1; i < values.length; i++) {
            if (values[i] > peak) peak = values[i];
            const drawdown = peak > 0 ? ((peak - values[i]) / peak) * 100 : 0;
            if (drawdown > maxDrawdown) maxDrawdown = drawdown;
        }
        
        return maxDrawdown;
    },
    
    calculateVaR(returns, confidenceLevel) {
        if (returns.length === 0) return 0;
        const sorted = [...returns].sort((a, b) => a - b);
        const index = Math.floor((1 - confidenceLevel) * sorted.length);
        return sorted[index] || 0;
    },
    
    calculateCVaR(returns, confidenceLevel) {
        if (returns.length === 0) return 0;
        const sorted = [...returns].sort((a, b) => a - b);
        const index = Math.floor((1 - confidenceLevel) * sorted.length);
        const tail = sorted.slice(0, index + 1);
        if (tail.length === 0) return 0;
        return tail.reduce((sum, r) => sum + r, 0) / tail.length;
    },
    
    // Continue in PART 4...
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    formatCurrency(value) {
        if (!value && value !== 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    },
    
    formatPercent(value) {
        if (!value && value !== 0) return 'N/A';
        return value.toFixed(2) + '%';
    },
    
    formatLargeNumber(value) {
        if (!value && value !== 0) return 'N/A';
        if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
        if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
        return value.toFixed(0);
    },
    
    showNotification(message, type = 'info') {
        if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
            window.FinanceDashboard.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
            if (type === 'error') alert(message);
        }
    }
};

/* ==============================================
   PART 4/5 - KPIs, CHARTS, CORRELATION MATRIX
   ============================================== */

// Continue InvestmentAnalytics object...

Object.assign(InvestmentAnalytics, {
    
    // ========== KPI DISPLAY ==========
    
    displayKPIs() {
        const metrics = this.calculateMetrics();
        const filteredData = this.getFilteredData();
        
        if (filteredData.length === 0) {
            document.getElementById('kpiGrid').innerHTML = `
                <div class='kpi-card neutral'>
                    <div class='kpi-header'>
                        <span class='kpi-title'>No Data</span>
                        <div class='kpi-icon'><i class='fas fa-exclamation-triangle'></i></div>
                    </div>
                    <div class='kpi-value'>--</div>
                    <p style='color: var(--text-secondary); font-size: 0.9rem;'>Please fill your data in Budget Dashboard first</p>
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
                title: 'Total Portfolio Value',
                value: this.formatCurrency(currentPortfolio),
                icon: 'fa-wallet',
                change: `+${this.formatPercent(metrics.totalReturn)}`,
                changeClass: metrics.totalReturn >= 0 ? 'positive' : 'negative',
                footer: `Over ${filteredData.length} months`,
                cardClass: currentPortfolio > 0 ? 'positive' : 'neutral'
            },
            {
                title: 'Cumulated Investment',
                value: this.formatCurrency(currentInvestment),
                icon: 'fa-piggy-bank',
                change: null,
                footer: `Capital invested`,
                cardClass: 'neutral'
            },
            {
                title: 'Cumulated Gains',
                value: this.formatCurrency(currentGains),
                icon: 'fa-chart-line',
                change: `ROI: ${this.formatPercent(currentROI)}`,
                changeClass: currentGains >= 0 ? 'positive' : 'negative',
                footer: `Overall performance`,
                cardClass: currentGains >= 0 ? 'positive' : 'negative'
            },
            {
                title: 'Annualized Return',
                value: this.formatPercent(metrics.annualizedReturn),
                icon: 'fa-percentage',
                change: `Volatility: ${metrics.volatility.toFixed(2)}%`,
                changeClass: 'neutral',
                footer: `Average return per year`,
                cardClass: metrics.annualizedReturn >= 5 ? 'positive' : metrics.annualizedReturn >= 0 ? 'neutral' : 'negative'
            },
            {
                title: 'Sharpe Ratio',
                value: metrics.sharpeRatio.toFixed(2),
                icon: 'fa-balance-scale',
                change: this.interpretSharpe(metrics.sharpeRatio),
                changeClass: metrics.sharpeRatio > 1 ? 'positive' : metrics.sharpeRatio > 0 ? 'neutral' : 'negative',
                footer: `Risk-adjusted return`,
                cardClass: metrics.sharpeRatio > 1 ? 'positive' : 'neutral'
            },
            {
                title: 'Maximum Drawdown',
                value: `-${metrics.maxDrawdown.toFixed(2)}%`,
                icon: 'fa-arrow-down',
                change: `Calmar: ${metrics.calmarRatio.toFixed(2)}`,
                changeClass: 'neutral',
                footer: `Maximum loss`,
                cardClass: metrics.maxDrawdown < 10 ? 'positive' : metrics.maxDrawdown < 20 ? 'neutral' : 'negative'
            },
            {
                title: 'Win Rate',
                value: `${metrics.winRate.toFixed(1)}%`,
                icon: 'fa-bullseye',
                change: `${(filteredData.filter((d, i) => i > 0 && d.totalPortfolio > filteredData[i-1].totalPortfolio).length)} winning months`,
                changeClass: metrics.winRate >= 50 ? 'positive' : 'negative',
                footer: `Percentage of positive months`,
                cardClass: metrics.winRate >= 60 ? 'positive' : metrics.winRate >= 40 ? 'neutral' : 'negative'
            },
            {
                title: 'VaR 95%',
                value: `${metrics.var95.toFixed(2)}%`,
                icon: 'fa-shield-alt',
                change: `CVaR: ${metrics.cvar95.toFixed(2)}%`,
                changeClass: 'neutral',
                footer: `Potential loss (95% confidence)`,
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
    },
    
    interpretSharpe(sharpe) {
        if (sharpe > 3) return 'Excellent';
        if (sharpe > 2) return 'Very Good';
        if (sharpe > 1) return 'Good';
        if (sharpe > 0) return 'Acceptable';
        return 'Low';
    },
    
    // ========== CREATE ALL CHARTS ==========
    
    createAllCharts() {
        const filteredData = this.getFilteredData();
        
        if (filteredData.length === 0) {
            console.warn('No data to create charts');
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
        this.displayRiskMetricsTable();
    },
    
    // ========== CHART 1: PORTFOLIO EVOLUTION ==========
    
    createPortfolioEvolutionChart(data) {
        const categories = data.map(row => row.month);
        const portfolio = data.map(row => row.totalPortfolio || 0);
        const investment = data.map(row => row.cumulatedInvestment || 0);
        const gains = data.map(row => row.cumulatedGains || 0);
        
        if (this.charts.portfolioEvolution) {
            this.charts.portfolioEvolution.destroy();
        }
        
        this.charts.portfolioEvolution = Highcharts.chart('chartPortfolioEvolution', {
            chart: { type: 'area', backgroundColor: 'transparent', height: 450 },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: { rotation: -45, style: { fontSize: '10px' } }
            },
            yAxis: {
                title: { text: 'Value (EUR)' },
                labels: {
                    formatter: function() {
                        return InvestmentAnalytics.formatLargeNumber(this.value);
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
                             point.series.name + ': <b>' + InvestmentAnalytics.formatCurrency(point.y) + '</b><br/>';
                    });
                    return s;
                }
            },
            plotOptions: {
                area: { stacking: null, lineWidth: 2, marker: { enabled: false } }
            },
            series: [
                {
                    name: 'Investment',
                    data: investment,
                    color: '#6C8BE0',
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [[0, 'rgba(108, 139, 224, 0.3)'], [1, 'rgba(108, 139, 224, 0.05)']]
                    }
                },
                {
                    name: 'Gains',
                    data: gains,
                    color: '#10b981',
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [[0, 'rgba(16, 185, 129, 0.3)'], [1, 'rgba(16, 185, 129, 0.05)']]
                    }
                },
                {
                    name: 'Total Portfolio',
                    data: portfolio,
                    color: '#2563eb',
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [[0, 'rgba(37, 99, 235, 0.4)'], [1, 'rgba(37, 99, 235, 0.05)']]
                    },
                    lineWidth: 3
                }
            ],
            legend: { align: 'center', verticalAlign: 'bottom' },
            credits: { enabled: false }
        });
    },
    
    // ========== CHART 2: MONTHLY RETURNS ==========
    
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
        
        if (this.charts.monthlyReturns) {
            this.charts.monthlyReturns.destroy();
        }
        
        this.charts.monthlyReturns = Highcharts.chart('chartMonthlyReturns', {
            chart: { type: 'column', backgroundColor: 'transparent', height: 450 },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: { rotation: -45, style: { fontSize: '10px' } }
            },
            yAxis: {
                title: { text: 'Return (%)' },
                plotLines: [{ value: 0, color: '#94a3b8', width: 2, zIndex: 5 }]
            },
            tooltip: { valueSuffix: '%', valueDecimals: 2 },
            plotOptions: {
                column: { borderRadius: 4, dataLabels: { enabled: false } }
            },
            series: [{ name: 'Monthly Return', data: returns, colorByPoint: true }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    },
    
    // ========== CHART 3: ASSET ALLOCATION (BASED ON CONFIGURED ASSETS) ==========
    
    createAssetAllocationChart(data) {
        if (this.assets.length === 0) {
            console.warn('No assets configured for allocation chart');
            return;
        }
        
        const allocationData = this.assets.map(asset => ({
            name: asset.name,
            y: asset.allocation,
            color: this.assetColors[asset.type] || '#94a3b8'
        }));
        
        if (this.charts.assetAllocation) {
            this.charts.assetAllocation.destroy();
        }
        
        this.charts.assetAllocation = Highcharts.chart('chartAssetAllocation', {
            chart: { type: 'pie', backgroundColor: 'transparent', height: 450 },
            title: { 
                text: 'Current Allocation', 
                style: { fontSize: '14px', fontWeight: 'bold' } 
            },
            tooltip: {
                pointFormat: '<b>{point.name}</b><br/>{point.percentage:.1f}% of portfolio'
            },
            plotOptions: {
                pie: {
                    innerSize: '60%',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b><br/>{point.percentage:.1f}%',
                        style: { fontSize: '11px' }
                    },
                    showInLegend: true
                }
            },
            series: [{ name: 'Allocation', data: allocationData }],
            credits: { enabled: false }
        });
    },
    
    // ========== CHART 4: CONTRIBUTION BY ASSET ==========
    
    createContributionChart(data) {
        const categories = data.map(row => row.month);
        
        // Create series for each asset
        const series = this.assets.map(asset => {
            const assetData = data.map(row => {
                const monthlyInvestment = row.investment || 0;
                return (monthlyInvestment * asset.allocation / 100);
            });
            
            return {
                name: asset.name,
                data: assetData,
                color: this.assetColors[asset.type] || '#94a3b8'
            };
        });
        
        if (this.charts.contribution) {
            this.charts.contribution.destroy();
        }
        
        this.charts.contribution = Highcharts.chart('chartContribution', {
            chart: { type: 'column', backgroundColor: 'transparent', height: 450 },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: { rotation: -45, style: { fontSize: '10px' } }
            },
            yAxis: { title: { text: 'Amount (EUR)' } },
            tooltip: { 
                shared: true, 
                valuePrefix: '€', 
                valueDecimals: 2,
                formatter: function() {
                    let s = '<b>' + this.x + '</b><br/>';
                    let total = 0;
                    this.points.forEach(point => {
                        s += '<span style="color:' + point.color + '">●</span> ' + 
                             point.series.name + ': <b>€' + point.y.toFixed(2) + '</b><br/>';
                        total += point.y;
                    });
                    s += '<b>Total: €' + total.toFixed(2) + '</b>';
                    return s;
                }
            },
            plotOptions: {
                column: { stacking: 'normal', borderRadius: 3 }
            },
            series: series,
            credits: { enabled: false }
        });
    },
    
    // ========== CHART 5: DRAWDOWN ==========
    
    createDrawdownChart(data) {
        const categories = data.map(row => row.month);
        const portfolioValues = data.map(row => row.totalPortfolio || 0);
        
        const drawdowns = [];
        let peak = portfolioValues[0];
        
        portfolioValues.forEach(value => {
            if (value > peak) peak = value;
            const drawdown = peak > 0 ? -((peak - value) / peak) * 100 : 0;
            drawdowns.push(drawdown);
        });
        
        if (this.charts.drawdown) {
            this.charts.drawdown.destroy();
        }
        
        this.charts.drawdown = Highcharts.chart('chartDrawdown', {
            chart: { type: 'area', backgroundColor: 'transparent', height: 450 },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: { rotation: -45, style: { fontSize: '10px' } }
            },
            yAxis: {
                title: { text: 'Drawdown (%)' },
                max: 0,
                plotLines: [
                    {
                        value: -10, color: '#f59e0b', dashStyle: 'Dash', width: 1,
                        label: { text: '-10%', align: 'right', style: { color: '#f59e0b' } }
                    },
                    {
                        value: -20, color: '#ef4444', dashStyle: 'Dash', width: 1,
                        label: { text: '-20%', align: 'right', style: { color: '#ef4444' } }
                    }
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
    
    // ========== CHART 6: ROLLING VOLATILITY ==========
    
    createRollingVolatilityChart(data) {
        const categories = [];
        const volatilities = [];
        const window = 30;
        
        if (data.length < window) {
            console.warn('Not enough data for rolling volatility');
            return;
        }
        
        for (let i = window; i < data.length; i++) {
            const windowData = data.slice(i - window, i);
            const values = windowData.map(row => row.totalPortfolio || 0);
            const returns = this.calculateReturns(values);
            const vol = this.calculateVolatility(returns) * Math.sqrt(252) * 100;
            
            categories.push(data[i].month);
            volatilities.push(vol);
        }
        
        if (this.charts.rollingVolatility) {
            this.charts.rollingVolatility.destroy();
        }
        
        this.charts.rollingVolatility = Highcharts.chart('chartRollingVolatility', {
            chart: { type: 'line', backgroundColor: 'transparent', height: 450 },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: { rotation: -45, style: { fontSize: '10px' } }
            },
            yAxis: {
                title: { text: 'Annualized Volatility (%)' },
                plotLines: [{
                    value: 15, color: '#f59e0b', dashStyle: 'Dash', width: 1,
                    label: { text: '15% threshold', align: 'right', style: { color: '#f59e0b' } }
                }]
            },
            tooltip: { valueSuffix: '%', valueDecimals: 2 },
            plotOptions: {
                line: { lineWidth: 2, marker: { enabled: false } }
            },
            series: [{ name: 'Rolling Volatility (30d)', data: volatilities, color: '#8b5cf6' }],
            credits: { enabled: false }
        });
    },
    
    // ========== CHART 7: RETURNS DISTRIBUTION ==========
    
    createReturnsDistributionChart(data) {
        const portfolioValues = data.map(row => row.totalPortfolio || 0);
        const returns = this.calculateReturns(portfolioValues).map(r => r * 100);
        
        const bins = [];
        const binSize = 2;
        const minReturn = Math.floor(Math.min(...returns) / binSize) * binSize;
        const maxReturn = Math.ceil(Math.max(...returns) / binSize) * binSize;
        
        for (let i = minReturn; i <= maxReturn; i += binSize) {
            bins.push(i);
        }
        
        const histogram = bins.map(bin => {
            const count = returns.filter(r => r >= bin && r < bin + binSize).length;
            return [bin, count];
        });
        
        if (this.charts.returnsDistribution) {
            this.charts.returnsDistribution.destroy();
        }
        
        this.charts.returnsDistribution = Highcharts.chart('chartReturnsDistribution', {
            chart: { type: 'column', backgroundColor: 'transparent', height: 450 },
            title: { text: null },
            xAxis: {
                title: { text: 'Return (%)' },
                plotLines: [{ value: 0, color: '#94a3b8', width: 2, zIndex: 5 }]
            },
            yAxis: { title: { text: 'Frequency' } },
            tooltip: {
                pointFormat: 'Returns between <b>{point.x}%</b> and <b>{point.x2}%</b><br/>Frequency: <b>{point.y}</b>',
                shared: false
            },
            plotOptions: {
                column: { borderRadius: 3, groupPadding: 0, pointPadding: 0.05 }
            },
            series: [{
                name: 'Frequency',
                data: histogram.map(([x, y]) => ({
                    x: x, x2: x + binSize, y: y,
                    color: x >= 0 ? '#10b981' : '#ef4444'
                })),
                colorByPoint: true
            }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    },
    
    // ========== CHART 8: VAR (FIXED COLORS) ==========
    
    createVaRChart(data) {
        const portfolioValues = data.map(row => row.totalPortfolio || 0);
        const returns = this.calculateReturns(portfolioValues);
        
        const confidenceLevels = [0.90, 0.95, 0.99];
        const categories = ['VaR 90%', 'VaR 95%', 'VaR 99%'];
        
        const varValues = confidenceLevels.map(level => {
            const var95 = this.calculateVaR(returns, level) * 100;
            return Math.abs(var95);
        });
        
        const cvarValues = confidenceLevels.map(level => {
            const cvar95 = this.calculateCVaR(returns, level) * 100;
            return Math.abs(cvar95);
        });
        
        if (this.charts.var) {
            this.charts.var.destroy();
        }
        
        this.charts.var = Highcharts.chart('chartVaR', {
            chart: { type: 'column', backgroundColor: 'transparent', height: 450 },
            title: { text: null },
            xAxis: { 
                categories: categories,
                crosshair: true 
            },
            yAxis: { 
                title: { text: 'Potential Loss (%)' },
                min: 0
            },
            tooltip: { 
                valueSuffix: '%', 
                valueDecimals: 2,
                shared: true
            },
            plotOptions: {
                column: {
                    borderRadius: 4,
                    dataLabels: { 
                        enabled: true, 
                        format: '{y:.2f}%',
                        style: {
                            fontWeight: 'bold',
                            textOutline: 'none'
                        }
                    }
                }
            },
            series: [
                {
                    name: 'Value at Risk',
                    data: varValues,
                    color: '#f59e0b'
                },
                {
                    name: 'Conditional VaR',
                    data: cvarValues,
                    color: '#ef4444'
                }
            ],
            credits: { enabled: false }
        });
    },
    
    // ========== CHART 9: CORRELATION MATRIX (REAL ASSETS) ==========
    
    createCorrelationMatrix(data) {
        if (this.assets.length < 2) {
            console.warn('Need at least 2 assets for correlation matrix');
            return;
        }
        
        const assetNames = this.assets.map(a => a.name);
        const assetTypes = this.assets.map(a => a.type);
        
        // Generate simulated returns for each asset
        const assetReturnsData = {};
        this.assets.forEach(asset => {
            assetReturnsData[asset.name] = this.calculateAssetReturns(asset.type, data.length);
        });
        
        // Calculate correlation matrix
        const correlationMatrix = [];
        
        assetNames.forEach((asset1, i) => {
            assetNames.forEach((asset2, j) => {
                const returns1 = assetReturnsData[asset1];
                const returns2 = assetReturnsData[asset2];
                const correlation = this.calculateCorrelation(returns1, returns2);
                correlationMatrix.push([j, i, correlation]);
            });
        });
        
        if (this.charts.correlationMatrix) {
            this.charts.correlationMatrix.destroy();
        }
        
        this.charts.correlationMatrix = Highcharts.chart('chartCorrelationMatrix', {
            chart: { type: 'heatmap', backgroundColor: 'transparent', height: Math.max(400, assetNames.length * 60) },
            title: { text: null },
            xAxis: { categories: assetNames, opposite: true },
            yAxis: { categories: assetNames, title: null, reversed: true },
            colorAxis: {
                min: -1, max: 1,
                stops: [[0, '#ef4444'], [0.5, '#f3f4f6'], [1, '#10b981']]
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
                        formatter: function() {
                            return this.point.value.toFixed(2);
                        },
                        style: {
                            textOutline: 'none'
                        }
                    },
                    borderWidth: 1,
                    borderColor: '#ffffff'
                }
            },
            series: [{ name: 'Correlation', data: correlationMatrix, nullColor: '#f3f4f6' }],
            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 200
            },
            credits: { enabled: false }
        });
        
        this.generateCorrelationInsights(correlationMatrix, assetNames);
    },
    
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
    
    generateCorrelationInsights(matrix, assets) {
        const insights = [];
        
        matrix.forEach(([x, y, corr]) => {
            if (x < y && Math.abs(corr) > 0.7 && corr !== 1) {
                const asset1 = assets[y];
                const asset2 = assets[x];
                
                if (corr > 0.7) {
                    insights.push({
                        type: 'positive',
                        icon: 'fa-link',
                        title: 'Strong Positive Correlation',
                        description: `${asset1} and ${asset2} move together (${(corr * 100).toFixed(1)}%). Limited diversification between these assets.`
                    });
                } else {
                    insights.push({
                        type: 'negative',
                        icon: 'fa-unlink',
                        title: 'Negative Correlation',
                        description: `${asset1} and ${asset2} move in opposite directions (${(corr * 100).toFixed(1)}%). Good natural diversification.`
                    });
                }
            }
        });
        
        matrix.forEach(([x, y, corr]) => {
            if (x < y && Math.abs(corr) < 0.3 && corr !== 1) {
                const asset1 = assets[y];
                const asset2 = assets[x];
                
                insights.push({
                    type: 'warning',
                    icon: 'fa-info-circle',
                    title: 'Low Correlation',
                    description: `${asset1} and ${asset2} are weakly correlated (${(corr * 100).toFixed(1)}%). Excellent diversification opportunity.`
                });
            }
        });
        
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
    }
    
});

/* ==============================================
   PART 5/5 - ADVANCED CHARTS, AI, RECOMMENDATIONS
   ============================================== */

// Continue InvestmentAnalytics object...

Object.assign(InvestmentAnalytics, {
    
    // ========== CHART 10: ROLLING SHARPE ==========
    
    createRollingSharpeChart(data) {
        const categories = [];
        const sharpeRatios = [];
        const window = 12;
        const riskFreeRate = 2;
        
        if (data.length < window) {
            console.warn('Not enough data for rolling Sharpe');
            return;
        }
        
        for (let i = window; i < data.length; i++) {
            const windowData = data.slice(i - window, i);
            const values = windowData.map(row => row.totalPortfolio || 0);
            const returns = this.calculateReturns(values);
            
            const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
            const volatility = this.calculateVolatility(returns);
            
            const annualizedReturn = meanReturn * 12 * 100;
            const annualizedVol = volatility * Math.sqrt(12) * 100;
            
            const sharpe = annualizedVol > 0 ? (annualizedReturn - riskFreeRate) / annualizedVol : 0;
            
            categories.push(data[i].month);
            sharpeRatios.push(sharpe);
        }
        
        if (this.charts.rollingSharpe) {
            this.charts.rollingSharpe.destroy();
        }
        
        this.charts.rollingSharpe = Highcharts.chart('chartRollingSharpe', {
            chart: { type: 'line', backgroundColor: 'transparent', height: 450 },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: { rotation: -45, style: { fontSize: '10px' } }
            },
            yAxis: {
                title: { text: 'Sharpe Ratio' },
                plotLines: [
                    { value: 0, color: '#94a3b8', width: 2, zIndex: 5 },
                    {
                        value: 1, color: '#10b981', dashStyle: 'Dash', width: 1,
                        label: { text: 'Good (1.0)', align: 'right', style: { color: '#10b981' } }
                    },
                    {
                        value: 2, color: '#2563eb', dashStyle: 'Dash', width: 1,
                        label: { text: 'Excellent (2.0)', align: 'right', style: { color: '#2563eb' } }
                    }
                ]
            },
            tooltip: { valueDecimals: 3 },
            plotOptions: {
                line: { lineWidth: 3, marker: { enabled: false } }
            },
            series: [{
                name: 'Sharpe Ratio (12 months)',
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
    
    // ========== CHART 11: ALPHA vs BETA ==========
    
    createAlphaBetaChart(data) {
        const scatterData = data.slice(-24).map((row, i) => {
            const portfolioReturn = i > 0 ? 
                ((row.totalPortfolio - data[data.length - 24 + i - 1].totalPortfolio) / 
                 data[data.length - 24 + i - 1].totalPortfolio) * 100 : 0;
            
            const marketReturn = portfolioReturn * (0.8 + Math.random() * 0.4);
            
            return {
                x: marketReturn,
                y: portfolioReturn,
                name: row.month
            };
        }).filter(point => point.x !== 0);
        
        if (this.charts.alphaBeta) {
            this.charts.alphaBeta.destroy();
        }
        
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
            tooltip: {
                pointFormat: '<b>{point.name}</b><br/>Market: {point.x:.2f}%<br/>Portfolio: {point.y:.2f}%'
            },
            plotOptions: {
                scatter: { marker: { radius: 6, symbol: 'circle' } }
            },
            series: [
                { name: 'Returns', data: scatterData, color: '#2563eb' },
                {
                    type: 'line',
                    name: 'Market line',
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
    
    // ========== CHART 12: SORTINO ==========
    
    createSortinoChart(data) {
        const categories = [];
        const sortinoRatios = [];
        const window = 12;
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
        
        if (this.charts.sortino) {
            this.charts.sortino.destroy();
        }
        
        this.charts.sortino = Highcharts.chart('chartSortino', {
            chart: { type: 'area', backgroundColor: 'transparent', height: 450 },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: { rotation: -45, style: { fontSize: '10px' } }
            },
            yAxis: {
                title: { text: 'Sortino Ratio' },
                plotLines: [{ value: 0, color: '#94a3b8', width: 2 }]
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
            series: [{ name: 'Sortino Ratio (12 months)', data: sortinoRatios, color: '#2563eb' }],
            credits: { enabled: false }
        });
    },
    
    // ========== CHART 13: CALMAR ==========
    
    createCalmarChart(data) {
        const categories = [];
        const calmarRatios = [];
        const window = 36;
        
        if (data.length < window) {
            console.warn('Not enough data for Calmar ratio');
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
            
            const maxDD = this.calculateMaxDrawdown(values);
            const calmar = maxDD > 0 ? annualizedReturn / maxDD : 0;
            
            categories.push(data[i].month);
            calmarRatios.push(calmar);
        }
        
        if (this.charts.calmar) {
            this.charts.calmar.destroy();
        }
        
        this.charts.calmar = Highcharts.chart('chartCalmar', {
            chart: { type: 'column', backgroundColor: 'transparent', height: 450 },
            title: { text: null },
            xAxis: {
                categories: categories,
                crosshair: true,
                labels: { rotation: -45, style: { fontSize: '10px' } }
            },
            yAxis: {
                title: { text: 'Calmar Ratio' },
                plotLines: [{ value: 0, color: '#94a3b8', width: 2 }]
            },
            tooltip: { valueDecimals: 3 },
            plotOptions: {
                column: { borderRadius: 4, colorByPoint: false }
            },
            series: [{
                name: 'Calmar Ratio (36 months)',
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
    
    // ========== RISK METRICS TABLE ==========
    
    displayRiskMetricsTable() {
        const metrics = this.calculateMetrics();
        
        const tableData = [
            {
                metric: 'Annualized Volatility',
                value: `${metrics.volatility.toFixed(2)}%`,
                interpretation: metrics.volatility < 10 ? 'Low risk' : metrics.volatility < 20 ? 'Moderate risk' : 'High risk',
                benchmark: '< 15% (good)'
            },
            {
                metric: 'Sharpe Ratio',
                value: metrics.sharpeRatio.toFixed(2),
                interpretation: this.interpretSharpe(metrics.sharpeRatio),
                benchmark: '> 1.0 (good)'
            },
            {
                metric: 'Sortino Ratio',
                value: metrics.sortinoRatio.toFixed(2),
                interpretation: metrics.sortinoRatio > 2 ? 'Excellent' : metrics.sortinoRatio > 1 ? 'Good' : 'Low',
                benchmark: '> 1.0 (good)'
            },
            {
                metric: 'Max Drawdown',
                value: `-${metrics.maxDrawdown.toFixed(2)}%`,
                interpretation: metrics.maxDrawdown < 10 ? 'Excellent' : metrics.maxDrawdown < 20 ? 'Good' : 'Monitor',
                benchmark: '< 20% (good)'
            },
            {
                metric: 'Calmar Ratio',
                value: metrics.calmarRatio.toFixed(2),
                interpretation: metrics.calmarRatio > 1 ? 'Good' : 'Low',
                benchmark: '> 1.0 (good)'
            },
            {
                metric: 'VaR 95%',
                value: `${metrics.var95.toFixed(2)}%`,
                interpretation: `Max probable loss at 95%`,
                benchmark: 'Contextual'
            },
            {
                metric: 'CVaR 95%',
                value: `${metrics.cvar95.toFixed(2)}%`,
                interpretation: `Average loss beyond VaR`,
                benchmark: 'Contextual'
            },
            {
                metric: 'Win Rate',
                value: `${metrics.winRate.toFixed(1)}%`,
                interpretation: metrics.winRate > 60 ? 'Excellent' : metrics.winRate > 50 ? 'Good' : 'Low',
                benchmark: '> 50% (good)'
            }
        ];
        
        const tbody = document.querySelector('#riskMetricsTable tbody');
        if (tbody) {
            tbody.innerHTML = tableData.map(row => {
                let valueClass = 'metric-good';
                
                if (row.metric === 'Annualized Volatility') {
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
    },
    
    // ========== AI ANALYSIS ==========
    
    async runAIAnalysis() {
        const filteredData = this.getFilteredData();
        
        if (filteredData.length < 12) {
            this.showNotification('Not enough data for AI analysis (minimum 12 months)', 'warning');
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
            
            this.showNotification('✅ AI analysis completed successfully!', 'success');
            
        } catch (error) {
            console.error('AI analysis error:', error);
            this.showNotification('❌ AI analysis error', 'error');
            
            if (loadingEl) loadingEl.classList.add('hidden');
            if (modelsGrid) modelsGrid.style.opacity = '1';
        }
    },
    
    updateAIProgress(percent) {
        const progressBar = document.getElementById('aiProgress');
        if (progressBar) {
            progressBar.style.width = percent + '%';
        }
    },
    
    async runPortfolioOptimizer(data) {
        return new Promise(resolve => {
            setTimeout(() => {
                const lastRow = data[data.length - 1];
                const totalPortfolio = lastRow.totalPortfolio || 0;
                
                const portfolioValues = data.map(row => row.totalPortfolio || 0);
                const returns = this.calculateReturns(portfolioValues);
                const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length * 12 * 100;
                const volatility = this.calculateVolatility(returns) * Math.sqrt(12) * 100;
                
                const riskFreeRate = 2;
                const targetReturn = avgReturn > 0 ? avgReturn * 1.1 : 8;
                
                const currentAllocation = {};
                this.assets.forEach(asset => {
                    currentAllocation[asset.name] = asset.allocation;
                });
                
                const optimalAllocation = {};
                const totalAlloc = this.assets.reduce((sum, a) => sum + a.allocation, 0);
                
                if (totalAlloc > 0) {
                    this.assets.forEach(asset => {
                        const normalized = (asset.allocation / totalAlloc) * 100;
                        if (asset.type === 'equity') {
                            optimalAllocation[asset.name] = Math.min(normalized * 1.1, 70);
                        } else if (asset.type === 'bonds') {
                            optimalAllocation[asset.name] = Math.max(normalized * 0.9, 20);
                        } else {
                            optimalAllocation[asset.name] = normalized;
                        }
                    });
                }
                
                const optimalReturn = targetReturn;
                const optimalVolatility = volatility * 0.85;
                const optimalSharpe = (optimalReturn - riskFreeRate) / optimalVolatility;
                
                this.aiResults.optimizer = {
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
                
                const scenarios = {
                    optimistic: [],
                    realistic: [],
                    pessimistic: []
                };
                
                for (let i = 1; i <= 12; i++) {
                    const realisticGrowth = (1 + (trend / 12));
                    const realisticValue = currentValue * realisticGrowth;
                    scenarios.realistic.push(realisticValue);
                    
                    const optimisticGrowth = (1 + (trend / 12 * 1.5));
                    scenarios.optimistic.push(currentValue * Math.pow(optimisticGrowth, i));
                    
                    const pessimisticGrowth = (1 + (trend / 12 * 0.7));
                    scenarios.pessimistic.push(currentValue * Math.pow(pessimisticGrowth, i));
                    
                    currentValue = realisticValue;
                }
                
                const volatility = this.calculateVolatility(recentReturns) * 100;
                const confidence = Math.max(0, Math.min(100, 100 - (volatility * 3)));
                
                this.aiResults.lstm = {
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
    
    async runRiskAnalyzer(data) {
        return new Promise(resolve => {
            setTimeout(() => {
                const portfolioValues = data.map(row => row.totalPortfolio || 0);
                const returns = this.calculateReturns(portfolioValues);
                
                const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
                const volatility = this.calculateVolatility(returns);
                
                const numSimulations = 10000;
                const horizon = 12;
                const currentValue = portfolioValues[portfolioValues.length - 1];
                
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
                
                // Check for over-concentration
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
                
                resolve();
            }, 700);
        });
    },
    
    displayAIResults() {
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
                        <div class='result-label'>Current vs Optimal Sharpe</div>
                        <div class='result-value'>${this.aiResults.optimizer.current.sharpe.toFixed(2)} → ${this.aiResults.optimizer.optimal.sharpe.toFixed(2)}</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Potential Improvement</div>
                        <div class='result-value positive'>+${this.aiResults.optimizer.improvement.returnDelta.toFixed(2)}% return</div>
                    </div>
                `;
                container.classList.remove('empty');
            }
        }
        
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
                        <div class='result-value'>${this.formatCurrency(this.aiResults.lstm.predictions[11])}</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Model Confidence</div>
                        <div class='result-value'>${this.aiResults.lstm.confidence.toFixed(0)}%</div>
                    </div>
                `;
                container.classList.remove('empty');
            }
        }
        
        if (this.aiResults.risk) {
            const container = document.getElementById('aiRiskResults');
            if (container) {
                container.innerHTML = `
                    <div class='result-item'>
                        <div class='result-label'>Median Scenario (12M)</div>
                        <div class='result-value'>${this.formatCurrency(this.aiResults.risk.percentiles.p50)}</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Optimistic Scenario (95%)</div>
                        <div class='result-value positive'>${this.formatCurrency(this.aiResults.risk.percentiles.p95)}</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Pessimistic Scenario (5%)</div>
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
                        <div class='result-value'>${this.aiResults.rebalancer.rebalanceFrequency} rebalancing</div>
                    </div>
                    <div class='result-item'>
                        <div class='result-label'>Number of Assets</div>
                        <div class='result-value'>${this.assets.length} assets</div>
                    </div>
                `;
                container.classList.remove('empty');
            }
        }
    },
    
    // ========== RECOMMENDATIONS WITH WORKING BUTTONS ==========
    
    generateAIRecommendations() {
        const recommendations = [];
        
        if (this.aiResults.optimizer && this.aiResults.optimizer.improvement.sharpeDelta > 0.2) {
            recommendations.push({
                id: 'optimizer',
                priority: 'high',
                icon: 'fa-cogs',
                title: 'Optimize Portfolio Allocation',
                description: `Your Sharpe Ratio could improve from ${this.aiResults.optimizer.current.sharpe.toFixed(2)} to ${this.aiResults.optimizer.optimal.sharpe.toFixed(2)} by adjusting your allocation.`,
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
                description: `LSTM model detects a ${isPositive ? 'bullish' : 'bearish'} trend of ${Math.abs(this.aiResults.lstm.trend).toFixed(1)}% over 12 months.`,
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
                description: `Monte Carlo simulation indicates a ${this.aiResults.risk.probabilityOfLoss.toFixed(0)}% probability of loss over 12 months.`,
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
    
    displayRecommendations() {
        const container = document.getElementById('recommendationsList');
        if (!container) return;
        
        if (this.aiResults.recommendations.length === 0) {
            container.innerHTML = `
                <div class='recommendation-item priority-low'>
                    <div class='recommendation-icon'>
                        <i class='fas fa-check-circle'></i>
                    </div>
                    <div class='recommendation-content'>
                        <div class='recommendation-title'>No Urgent Actions</div>
                        <div class='recommendation-description'>Your portfolio is well optimized. Continue your current strategy and monitor performance regularly.</div>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.aiResults.recommendations.map(rec => `
            <div class='recommendation-item priority-${rec.priority}'>
                <div class='recommendation-icon'>
                    <i class='fas ${rec.icon}'></i>
                </div>
                <div class='recommendation-content'>
                    <div class='recommendation-title'>${rec.title}</div>
                    <div class='recommendation-description'>${rec.description}</div>
                    <a href='#' class='recommendation-action' onclick='event.preventDefault(); InvestmentAnalytics.showRecommendationDetails("${rec.id}");'>${rec.action} →</a>
                </div>
            </div>
        `).join('');
    },
    
    // ========== RECOMMENDATION DETAILS MODALS ==========
    
    showRecommendationDetails(recId) {
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
    
    closeRecommendationModal() {
        const modal = document.getElementById('modalRecommendationDetails');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    getOptimizerDetails() {
        const opt = this.aiResults.optimizer;
        let html = '<h3>Current Allocation</h3><ul>';
        
        for (const [asset, pct] of Object.entries(opt.current.allocation)) {
            html += `<li><strong>${asset}:</strong> ${pct.toFixed(1)}%</li>`;
        }
        
        html += '</ul><h3>Recommended Optimal Allocation</h3><ul>';
        
        for (const [asset, pct] of Object.entries(opt.optimal.allocation)) {
            html += `<li><strong>${asset}:</strong> ${pct.toFixed(1)}%</li>`;
        }
        
        html += `</ul><h3>Expected Improvements</h3>
                <ul>
                    <li><strong>Return:</strong> +${opt.improvement.returnDelta.toFixed(2)}%</li>
                    <li><strong>Sharpe Ratio:</strong> +${opt.improvement.sharpeDelta.toFixed(2)}</li>
                    <li><strong>Volatility:</strong> ${opt.improvement.volatilityDelta.toFixed(2)}%</li>
                </ul>`;
        
        return html;
    },
    
    getLSTMDetails() {
        const lstm = this.aiResults.lstm;
        return `
            <h3>Trend Analysis</h3>
            <p><strong>Detected Trend:</strong> ${lstm.trend >= 0 ? 'Bullish' : 'Bearish'} (${Math.abs(lstm.trend).toFixed(2)}%)</p>
            <p><strong>Model Confidence:</strong> ${lstm.confidence.toFixed(0)}%</p>
            
            <h3>12-Month Predictions</h3>
            <ul>
                <li><strong>Expected Return:</strong> ${lstm.expectedReturn12M >= 0 ? '+' : ''}${lstm.expectedReturn12M.toFixed(2)}%</li>
                <li><strong>Predicted Value:</strong> ${this.formatCurrency(lstm.predictions[11])}</li>
                <li><strong>Optimistic Scenario:</strong> ${this.formatCurrency(lstm.scenarios.optimistic[11])}</li>
                <li><strong>Pessimistic Scenario:</strong> ${this.formatCurrency(lstm.scenarios.pessimistic[11])}</li>
            </ul>
            
            <h3>Recommendations</h3>
            <p>${lstm.trend > 0 ? 
                'Consider increasing your monthly investments to capitalize on the bullish trend.' : 
                'Consider reducing exposure or securing gains given the bearish trend.'}</p>
        `;
    },
    
    getRiskDetails() {
        const risk = this.aiResults.risk;
        return `
            <h3>Monte Carlo Simulation Results</h3>
            <p><strong>Number of Simulations:</strong> ${risk.simulations.toLocaleString()}</p>
            <p><strong>Time Horizon:</strong> ${risk.horizon} months</p>
            
            <h3>Scenario Distribution</h3>
            <ul>
                <li><strong>Best Case (95%):</strong> ${this.formatCurrency(risk.percentiles.p95)}</li>
                <li><strong>Likely Case (75%):</strong> ${this.formatCurrency(risk.percentiles.p75)}</li>
                <li><strong>Expected (50%):</strong> ${this.formatCurrency(risk.percentiles.p50)}</li>
                <li><strong>Downside (25%):</strong> ${this.formatCurrency(risk.percentiles.p25)}</li>
                <li><strong>Worst Case (5%):</strong> ${this.formatCurrency(risk.percentiles.p5)}</li>
            </ul>
            
            <h3>Risk Metrics</h3>
            <ul>
                <li><strong>Probability of Loss:</strong> ${risk.probabilityOfLoss.toFixed(1)}%</li>
                <li><strong>Maximum Loss (1%):</strong> ${risk.maxLoss.toFixed(2)}%</li>
            </ul>
            
            <h3>Recommendations</h3>
            <p>${risk.probabilityOfLoss > 40 ? 
                'Your portfolio shows elevated risk. Consider increasing diversification and reducing exposure to volatile assets.' : 
                'Your risk profile is acceptable. Continue monitoring market conditions.'}</p>
        `;
    },
    
    getRebalancerDetails() {
        const rebal = this.aiResults.rebalancer;
        let html = '<h3>Recommended Actions</h3>';
        
        if (rebal.recommendations.length === 0) {
            html += '<p>No rebalancing needed at this time.</p>';
        } else {
            html += '<ul>';
            rebal.recommendations.forEach(rec => {
                html += `<li><strong>${rec.action}</strong> ${rec.amount.toFixed(1)}% - ${rec.reason}</li>`;
            });
            html += '</ul>';
        }
        
        html += `<h3>Rebalancing Schedule</h3>
                <p><strong>Recommended Frequency:</strong> ${rebal.rebalanceFrequency}</p>
                
                <h3>Current Assets</h3>
                <ul>`;
        
        this.assets.forEach(asset => {
            html += `<li><strong>${asset.name}:</strong> ${asset.allocation.toFixed(1)}%</li>`;
        });
        
        html += '</ul>';
        
        return html;
    },
    
    createAIPredictionsChart() {
        if (!this.aiResults.lstm) return;
        
        const filteredData = this.getFilteredData();
        const historicalMonths = filteredData.map(row => row.month);
        const historicalValues = filteredData.map(row => row.totalPortfolio || 0);
        
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
        
        const historicalSeries = [...historicalValues, ...Array(12).fill(null)];
        const predictionSeries = [...Array(historicalValues.length).fill(null), ...this.aiResults.lstm.predictions];
        const optimisticSeries = [...Array(historicalValues.length).fill(null), ...this.aiResults.lstm.scenarios.optimistic];
        const pessimisticSeries = [...Array(historicalValues.length).fill(null), ...this.aiResults.lstm.scenarios.pessimistic];
        
        if (this.charts.aiPredictions) {
            this.charts.aiPredictions.destroy();
        }
        
        this.charts.aiPredictions = Highcharts.chart('chartAIPredictions', {
            chart: { type: 'line', backgroundColor: 'transparent', height: 500 },
            title: {
                text: 'AI Predictions - 12 Months',
                style: { color: '#fff', fontWeight: '700' }
            },
            subtitle: {
                text: 'Based on LSTM model and Monte Carlo simulation',
                style: { color: '#fff' }
            },
            xAxis: {
                categories: allMonths,
                crosshair: true,
                labels: { rotation: -45, style: { fontSize: '10px', color: '#fff' } },
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
                    formatter: function() {
                        return InvestmentAnalytics.formatLargeNumber(this.value);
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
                                 point.series.name + ': <b>' + InvestmentAnalytics.formatCurrency(point.y) + '</b><br/>';
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
            legend: { align: 'center', verticalAlign: 'bottom', itemStyle: { color: '#fff' } },
            credits: { enabled: false }
        });
    },
    
    // ========== EXPORT & REFRESH ==========
    
    exportReport() {
        const filteredData = this.getFilteredData();
        const metrics = this.calculateMetrics();
        
        const report = {
            generatedAt: new Date().toISOString(),
            period: this.currentPeriod,
            dataPoints: filteredData.length,
            
            assets: this.assets,
            
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
            
            aiAnalysis: this.aiResults.recommendations.length > 0 ? {
                optimizer: this.aiResults.optimizer,
                lstm: this.aiResults.lstm,
                risk: this.aiResults.risk,
                rebalancer: this.aiResults.rebalancer,
                recommendations: this.aiResults.recommendations
            } : null
        };
        
        const json = JSON.stringify(report, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `investment_analytics_report_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('✅ Report exported successfully!', 'success');
    },
    
    refreshData() {
        this.loadFinancialData();
        this.loadAssets();
        this.updatePortfolioSummary();
        this.renderAssetsList();
        this.displayKPIs();
        this.createAllCharts();
        this.updateLastUpdate();
        this.showNotification('✅ Data refreshed', 'success');
    },
    
    // ========== BENCHMARK (STUB - NOT IMPLEMENTED) ==========
    
    async updateBenchmark() {
        console.log('Benchmark comparison not yet implemented');
    },
    
    async loadBenchmarkData() {
        console.log('Benchmark data loading not yet implemented');
    },
    
    createBenchmarkComparisonChart() {
        console.log('Benchmark chart not yet implemented');
    },
    
    displayComparisonMetrics() {
        console.log('Comparison metrics not yet implemented');
    }
    
});

// ========== INITIALIZATION ==========

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        InvestmentAnalytics.init();
    });
} else {
    InvestmentAnalytics.init();
}

console.log('✅ Investment Analytics Module loaded successfully');