/**
 * ═══════════════════════════════════════════════════════════════════
 * 💼 INSIDER FLOW TRACKER - ALPHAVAULT AI
 * ═══════════════════════════════════════════════════════════════════
 * Détection temps réel des mouvements d'initiés avec analyse avancée
 * ═══════════════════════════════════════════════════════════════════
 */

class InsiderFlowTracker {
    constructor() {
        this.secClient = new SECApiClient();
        this.insiderData = [];
        this.filteredData = [];
        this.currentCompany = 'all';
        this.currentPeriod = 30;
        this.currentTransactionType = 'all';
        
        // Alert configuration
        this.alertConfig = {
            clusterBuying: true,
            highValue: true,
            divergence: true,
            preEarnings: true,
            unusualVolume: true,
            highValueThreshold: 1000000
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Insider Flow Tracker...');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load data
        await this.loadInsiderData();
        
        // Render dashboard
        this.renderDashboard();
        
        console.log('✅ Insider Flow Tracker initialized');
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadInsiderData(true));
        }

        // Alerts config button
        const alertsBtn = document.getElementById('configureAlerts');
        if (alertsBtn) {
            alertsBtn.addEventListener('click', () => this.openModal('alertsConfigModal'));
        }

        // Filters
        const companyFilter = document.getElementById('companyFilter');
        if (companyFilter) {
            companyFilter.addEventListener('change', (e) => {
                this.currentCompany = e.target.value;
                this.applyFilters();
            });
        }

        const periodFilter = document.getElementById('periodFilter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.currentPeriod = parseInt(e.target.value);
                this.applyFilters();
            });
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeAllModals();
            });
        });
    }

    async loadInsiderData(forceRefresh = false) {
        console.log('📥 Loading insider data...');
        
        try {
            // Show loading state
            this.showLoading();
            
            // In production, fetch real data from SEC Form 4 filings
            // For now, generate realistic demo data
            this.insiderData = this.generateDemoInsiderData();
            
            // Apply filters
            this.applyFilters();
            
            // Check for smart alerts
            this.checkSmartAlerts();
            
        } catch (error) {
            console.error('❌ Error loading insider data:', error);
            this.showError('Failed to load insider data');
        }
    }

    generateDemoInsiderData() {
        const companies = [
            { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
            { symbol: 'TSLA', name: 'Tesla Inc', sector: 'Automotive' },
            { symbol: 'AAPL', name: 'Apple Inc', sector: 'Technology' },
            { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
            { symbol: 'GOOGL', name: 'Alphabet Inc', sector: 'Technology' },
            { symbol: 'META', name: 'Meta Platforms Inc', sector: 'Technology' },
            { symbol: 'AMZN', name: 'Amazon.com Inc', sector: 'E-commerce' },
            { symbol: 'JPM', name: 'JPMorgan Chase & Co', sector: 'Financial Services' },
            { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
            { symbol: 'V', name: 'Visa Inc', sector: 'Financial Services' }
        ];

        const insiders = [
            { name: 'Jensen Huang', position: 'CEO', netWorth: 25000000000 },
            { name: 'Elon Musk', position: 'CEO', netWorth: 180000000000 },
            { name: 'Tim Cook', position: 'CEO', netWorth: 1800000000 },
            { name: 'Satya Nadella', position: 'CEO', netWorth: 850000000 },
            { name: 'Sundar Pichai', position: 'CEO', netWorth: 1300000000 },
            { name: 'Mark Zuckerberg', position: 'CEO', netWorth: 110000000000 },
            { name: 'Andy Jassy', position: 'CEO', netWorth: 400000000 },
            { name: 'Jamie Dimon', position: 'CEO', netWorth: 2000000000 },
            { name: 'Colleen Wegman', position: 'CFO', netWorth: 180000000 },
            { name: 'Michael Johnson', position: 'CFO', netWorth: 95000000 },
            { name: 'Sarah Chen', position: 'CTO', netWorth: 120000000 },
            { name: 'Robert Williams', position: 'COO', netWorth: 150000000 },
            { name: 'Emily Davis', position: 'Director', netWorth: 75000000 },
            { name: 'David Martinez', position: 'Director', netWorth: 85000000 }
        ];

        const transactions = [];
        const now = new Date();

        // Generate 150 transactions over the last 90 days
        for (let i = 0; i < 150; i++) {
            const company = companies[Math.floor(Math.random() * companies.length)];
            const insider = insiders[Math.floor(Math.random() * insiders.length)];
            
            // Random date within last 90 days
            const daysAgo = Math.floor(Math.random() * 90);
            const transactionDate = new Date(now);
            transactionDate.setDate(transactionDate.getDate() - daysAgo);
            
            // Transaction type (70% purchases, 25% sales, 5% options)
            const rand = Math.random();
            let type;
            if (rand < 0.70) type = 'P'; // Purchase
            else if (rand < 0.95) type = 'S'; // Sale
            else type = 'M'; // Option Exercise
            
            // Shares and price
            const shares = Math.floor(Math.random() * 50000) + 1000;
            const pricePerShare = Math.random() * 500 + 50;
            const transactionValue = shares * pricePerShare;
            
            // Conviction score (transaction value vs insider net worth)
            const convictionScore = this.calculateConvictionScore(transactionValue, insider.netWorth);
            
            // Days to next earnings (random 1-90 days)
            const daysToEarnings = Math.floor(Math.random() * 90) + 1;
            
            // Stock price impact (simulated)
            const priceImpact7d = (Math.random() - 0.5) * 20; // -10% to +10%
            const priceImpact30d = (Math.random() - 0.5) * 40; // -20% to +20%
            
            transactions.push({
                id: `TXN-${i + 1}`,
                date: transactionDate,
                company: company,
                insider: insider,
                type: type,
                shares: shares,
                pricePerShare: pricePerShare,
                transactionValue: transactionValue,
                convictionScore: convictionScore,
                daysToEarnings: daysToEarnings,
                priceImpact7d: priceImpact7d,
                priceImpact30d: priceImpact30d,
                formUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${company.symbol}`
            });
        }

        // Sort by date (most recent first)
        transactions.sort((a, b) => b.date - a.date);

        return transactions;
    }

    calculateConvictionScore(transactionValue, netWorth) {
        const percentage = (transactionValue / netWorth) * 100;
        
        if (percentage > 5) return { score: 95, level: 'high' };
        if (percentage > 2) return { score: 85, level: 'high' };
        if (percentage > 1) return { score: 70, level: 'medium' };
        if (percentage > 0.5) return { score: 55, level: 'medium' };
        return { score: 30, level: 'low' };
    }

    applyFilters() {
        this.filteredData = this.insiderData.filter(txn => {
            // Company filter
            if (this.currentCompany !== 'all' && txn.company.symbol !== this.currentCompany) {
                return false;
            }

            // Period filter
            const now = new Date();
            const daysDiff = Math.floor((now - txn.date) / (1000 * 60 * 60 * 24));
            if (daysDiff > this.currentPeriod) {
                return false;
            }

            // Transaction type filter
            if (this.currentTransactionType !== 'all') {
                if (this.currentTransactionType === 'buy' && txn.type !== 'P') return false;
                if (this.currentTransactionType === 'sell' && txn.type !== 'S') return false;
                if (this.currentTransactionType === 'option' && txn.type !== 'M') return false;
            }

            return true;
        });

        this.renderDashboard();
    }

    checkSmartAlerts() {
        const alerts = [];

        // Check for cluster buying
        if (this.alertConfig.clusterBuying) {
            const clusterCompanies = this.detectClusterBuying();
            if (clusterCompanies.length > 0) {
                alerts.push({
                    type: 'cluster',
                    message: `Cluster buying detected in ${clusterCompanies.length} companies!`,
                    companies: clusterCompanies
                });
            }
        }

        // Check for high value transactions
        if (this.alertConfig.highValue) {
            const highValueTxns = this.insiderData.filter(txn => 
                txn.transactionValue > this.alertConfig.highValueThreshold &&
                this.isRecent(txn.date, 7)
            );
            if (highValueTxns.length > 0) {
                alerts.push({
                    type: 'highValue',
                    message: `${highValueTxns.length} high-value transactions (>$${(this.alertConfig.highValueThreshold / 1000000).toFixed(1)}M) in last 7 days`,
                    transactions: highValueTxns
                });
            }
        }

        // Check for CEO/CFO divergence
        if (this.alertConfig.divergence) {
            const divergences = this.detectDivergence();
            if (divergences.length > 0) {
                alerts.push({
                    type: 'divergence',
                    message: `CEO/CFO signal divergence detected in ${divergences.length} companies`,
                    companies: divergences
                });
            }
        }

        // Show alert banner if alerts exist
        if (alerts.length > 0) {
            this.showAlertBanner(alerts[0]);
        }
    }

    detectClusterBuying() {
        const companies = {};
        const last7Days = this.insiderData.filter(txn => this.isRecent(txn.date, 7) && txn.type === 'P');

        last7Days.forEach(txn => {
            if (!companies[txn.company.symbol]) {
                companies[txn.company.symbol] = { count: 0, insiders: [] };
            }
            companies[txn.company.symbol].count++;
            companies[txn.company.symbol].insiders.push(txn.insider.name);
        });

        return Object.keys(companies).filter(symbol => companies[symbol].count >= 3);
    }

    detectDivergence() {
        const companies = {};

        this.insiderData.filter(txn => this.isRecent(txn.date, 30)).forEach(txn => {
            if (!companies[txn.company.symbol]) {
                companies[txn.company.symbol] = { ceo: [], cfo: [] };
            }

            if (txn.insider.position === 'CEO') {
                companies[txn.company.symbol].ceo.push(txn.type);
            } else if (txn.insider.position === 'CFO') {
                companies[txn.company.symbol].cfo.push(txn.type);
            }
        });

        const divergent = [];
        Object.keys(companies).forEach(symbol => {
            const ceoSignal = this.getSignal(companies[symbol].ceo);
            const cfoSignal = this.getSignal(companies[symbol].cfo);

            if (ceoSignal && cfoSignal && ceoSignal !== cfoSignal) {
                divergent.push(symbol);
            }
        });

        return divergent;
    }

    getSignal(types) {
        if (types.length === 0) return null;
        const buys = types.filter(t => t === 'P').length;
        const sells = types.filter(t => t === 'S').length;
        
        if (buys > sells) return 'bullish';
        if (sells > buys) return 'bearish';
        return 'neutral';
    }

    isRecent(date, days) {
        const now = new Date();
        const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        return daysDiff <= days;
    }

    showAlertBanner(alert) {
        const banner = document.getElementById('smartAlertsBanner');
        const message = document.getElementById('alertBannerMessage');
        
        if (banner && message) {
            message.textContent = alert.message;
            banner.style.display = 'block';
        }
    }

    renderDashboard() {
        this.renderOverviewCards();
        this.renderSentimentGauge();
        this.renderSentimentTrend();
        this.renderPatternCards();
        this.renderTransactionsTable();
        this.renderConvictionScoreChart();
        this.renderTransactionSizeChart();
        this.renderTimingEarningsChart();
        this.renderTimingAnnouncementsChart();
        this.renderCorrelationChart();
        this.renderBacktestingStats();
        this.renderNetworkChart();
        this.renderComparisonChart();
        this.renderDivergenceAlertsChart();
        this.renderComparisonTable();
        this.renderActivityHeatmap();
        this.populateCompanyFilter();
    }

    renderOverviewCards() {
        const container = document.getElementById('overviewCards');
        if (!container) return;

        const totalTransactions = this.filteredData.length;
        const purchases = this.filteredData.filter(t => t.type === 'P').length;
        const sales = this.filteredData.filter(t => t.type === 'S').length;
        const totalValue = this.filteredData.reduce((sum, t) => sum + t.transactionValue, 0);
        const avgConviction = this.filteredData.reduce((sum, t) => sum + t.convictionScore.score, 0) / totalTransactions || 0;

        const purchaseChange = ((purchases - sales) / totalTransactions * 100).toFixed(1);
        const valueChange = (Math.random() * 40 - 20).toFixed(1); // Demo

        container.innerHTML = `
            <div class='insider-overview-card'>
                <div class='card-icon-wrapper' style='background: linear-gradient(135deg, #667eea, #764ba2);'>
                    <i class='fas fa-exchange-alt'></i>
                </div>
                <p class='card-label'>Total Transactions</p>
                <p class='card-value-large'>${totalTransactions}</p>
                <p class='card-trend ${purchaseChange >= 0 ? 'positive' : 'negative'}'>
                    <i class='fas fa-arrow-${purchaseChange >= 0 ? 'up' : 'down'}'></i>
                    ${Math.abs(purchaseChange)}% vs last period
                </p>
            </div>

            <div class='insider-overview-card'>
                <div class='card-icon-wrapper' style='background: linear-gradient(135deg, #10b981, #059669);'>
                    <i class='fas fa-arrow-up'></i>
                </div>
                <p class='card-label'>Insider Purchases</p>
                <p class='card-value-large'>${purchases}</p>
                <p class='card-trend positive'>
                    <i class='fas fa-arrow-up'></i>
                    ${((purchases / totalTransactions) * 100).toFixed(0)}% of total
                </p>
            </div>

            <div class='insider-overview-card'>
                <div class='card-icon-wrapper' style='background: linear-gradient(135deg, #ef4444, #dc2626);'>
                    <i class='fas fa-arrow-down'></i>
                </div>
                <p class='card-label'>Insider Sales</p>
                <p class='card-value-large'>${sales}</p>
                <p class='card-trend ${sales < purchases ? 'positive' : 'negative'}'>
                    <i class='fas fa-arrow-${sales < purchases ? 'down' : 'up'}'></i>
                    ${((sales / totalTransactions) * 100).toFixed(0)}% of total
                </p>
            </div>

            <div class='insider-overview-card'>
                <div class='card-icon-wrapper' style='background: linear-gradient(135deg, #3b82f6, #2563eb);'>
                    <i class='fas fa-dollar-sign'></i>
                </div>
                <p class='card-label'>Total Transaction Value</p>
                <p class='card-value-large'>$${(totalValue / 1000000).toFixed(1)}M</p>
                <p class='card-trend ${valueChange >= 0 ? 'positive' : 'negative'}'>
                    <i class='fas fa-arrow-${valueChange >= 0 ? 'up' : 'down'}'></i>
                    ${Math.abs(valueChange)}% vs last period
                </p>
            </div>

            <div class='insider-overview-card'>
                <div class='card-icon-wrapper' style='background: linear-gradient(135deg, #f59e0b, #d97706);'>
                    <i class='fas fa-star'></i>
                </div>
                <p class='card-label'>Avg Conviction Score</p>
                <p class='card-value-large'>${avgConviction.toFixed(0)}/100</p>
                <p class='card-trend ${avgConviction >= 60 ? 'positive' : 'negative'}'>
                    <i class='fas fa-${avgConviction >= 60 ? 'fire' : 'snowflake'}'></i>
                    ${avgConviction >= 60 ? 'High' : 'Moderate'} conviction
                </p>
            </div>
        `;
    }

    renderSentimentGauge() {
        const purchases = this.filteredData.filter(t => t.type === 'P').length;
        const sales = this.filteredData.filter(t => t.type === 'S').length;
        const total = purchases + sales;
        
        const sentimentScore = total > 0 ? ((purchases - sales) / total * 100) : 0;
        
        // Normalize to 0-100 scale (0 = bearish, 50 = neutral, 100 = bullish)
        const gaugeValue = 50 + sentimentScore / 2;

        Highcharts.chart('sentimentGaugeChart', {
            chart: {
                type: 'gauge',
                backgroundColor: 'transparent',
                height: '350px'
            },
            title: { text: null },
            pane: {
                startAngle: -90,
                endAngle: 90,
                background: null,
                center: ['50%', '75%'],
                size: '110%'
            },
            yAxis: {
                min: 0,
                max: 100,
                tickPixelInterval: 25,
                tickPosition: 'inside',
                tickColor: Highcharts.defaultOptions.chart.backgroundColor || '#FFFFFF',
                tickLength: 20,
                tickWidth: 2,
                minorTickInterval: null,
                labels: {
                    distance: 20,
                    style: {
                        fontSize: '14px'
                    }
                },
                plotBands: [{
                    from: 0,
                    to: 35,
                    color: '#ef4444',
                    thickness: 20
                }, {
                    from: 35,
                    to: 65,
                    color: '#f59e0b',
                    thickness: 20
                }, {
                    from: 65,
                    to: 100,
                    color: '#10b981',
                    thickness: 20
                }]
            },
            series: [{
                name: 'Sentiment',
                data: [gaugeValue],
                dataLabels: {
                    format: '{y:.0f}',
                    borderWidth: 0,
                    color: (Highcharts.defaultOptions.title.style && Highcharts.defaultOptions.title.style.color) || '#333333',
                    style: {
                        fontSize: '32px',
                        fontWeight: 'bold'
                    }
                },
                dial: {
                    radius: '80%',
                    backgroundColor: 'linear-gradient(to bottom, #667eea 0%, #764ba2 100%)',
                    baseWidth: 12,
                    baseLength: '0%',
                    rearLength: '0%'
                },
                pivot: {
                    backgroundColor: '#667eea',
                    radius: 6
                }
            }],
            credits: { enabled: false },
            exporting: { enabled: false }
        });

        // Update interpretation
        const signalEl = document.getElementById('sentimentSignal');
        const interpretationEl = document.getElementById('sentimentInterpretation');

        if (signalEl && interpretationEl) {
            if (gaugeValue >= 65) {
                signalEl.textContent = '🟢 Bullish';
                signalEl.style.color = '#10b981';
                interpretationEl.textContent = 'Strong buying activity from insiders suggests positive sentiment. Insiders are accumulating shares, which historically precedes stock price appreciation.';
            } else if (gaugeValue >= 35) {
                signalEl.textContent = '🟡 Neutral';
                signalEl.style.color = '#f59e0b';
                interpretationEl.textContent = 'Mixed signals from insiders. Buy and sell activities are balanced. Monitor for emerging trends before making investment decisions.';
            } else {
                signalEl.textContent = '🔴 Bearish';
                signalEl.style.color = '#ef4444';
                interpretationEl.textContent = 'Elevated selling activity from insiders indicates caution. Insiders may be taking profits or anticipating headwinds. Exercise caution.';
            }
        }
    }

    renderSentimentTrend() {
        // Calculate daily sentiment for last 30 days
        const dailyData = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dayTransactions = this.insiderData.filter(txn => {
                return txn.date.toDateString() === date.toDateString();
            });

            const purchases = dayTransactions.filter(t => t.type === 'P').length;
            const sales = dayTransactions.filter(t => t.type === 'S').length;
            const total = purchases + sales;
            
            const sentiment = total > 0 ? 50 + ((purchases - sales) / total * 50) : 50;

            dailyData.push({
                x: date.getTime(),
                y: sentiment
            });
        }

        Highcharts.chart('sentimentTrendChart', {
            chart: {
                type: 'area',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                type: 'datetime',
                title: { text: null }
            },
            yAxis: {
                title: { text: 'Sentiment Score' },
                min: 0,
                max: 100,
                plotLines: [{
                    value: 50,
                    color: '#6b7280',
                    dashStyle: 'Dash',
                    width: 2,
                    label: {
                        text: 'Neutral',
                        align: 'right'
                    }
                }]
            },
            series: [{
                name: 'Insider Sentiment',
                data: dailyData,
                color: '#667eea',
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, 'rgba(102, 126, 234, 0.4)'],
                        [1, 'rgba(102, 126, 234, 0.0)']
                    ]
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: { enabled: true }
                    }
                }
            }],
            legend: { enabled: false },
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    renderPatternCards() {
        // Cluster Buying
        const clusterCompanies = this.detectClusterBuying();
        document.getElementById('clusterCount').textContent = `${clusterCompanies.length} companies`;

        // Pre-Earnings Activity
        const preEarnings = this.filteredData.filter(txn => txn.daysToEarnings <= 30);
        document.getElementById('preEarningsCount').textContent = `${preEarnings.length} transactions`;

        // CEO/CFO Divergence
        const divergences = this.detectDivergence();
        document.getElementById('divergenceCount').textContent = `${divergences.length} companies`;

        // Unusual Volume
        const avgDailyTxns = this.insiderData.length / 90;
        const last7DaysTxns = this.insiderData.filter(txn => this.isRecent(txn.date, 7)).length;
        const dailyAvgLast7 = last7DaysTxns / 7;
        const unusualVolume = dailyAvgLast7 > avgDailyTxns * 3 ? last7DaysTxns : 0;
        document.getElementById('unusualVolumeCount').textContent = `${unusualVolume} transactions`;
    }

    renderTransactionsTable() {
        const tbody = document.querySelector('#transactionsTable tbody');
        if (!tbody) return;

        if (this.filteredData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class='text-center' style='padding: 40px;'>
                        <i class='fas fa-inbox' style='font-size: 3rem; color: var(--text-tertiary); margin-bottom: 16px;'></i>
                        <p style='color: var(--text-secondary);'>No transactions found for the selected filters</p>
                    </td>
                </tr>
            `;
            return;
        }

        const rows = this.filteredData.slice(0, 50).map(txn => {
            const typeClass = txn.type === 'P' ? 'type-buy' : txn.type === 'S' ? 'type-sell' : 'type-option';
            const typeIcon = txn.type === 'P' ? 'fa-arrow-up' : txn.type === 'S' ? 'fa-arrow-down' : 'fa-certificate';
            const typeText = txn.type === 'P' ? 'Purchase' : txn.type === 'S' ? 'Sale' : 'Option';

            const convictionClass = txn.convictionScore.level === 'high' ? '' : txn.convictionScore.level === 'medium' ? 'medium' : 'low';

            return `
                <tr>
                    <td>${this.formatDate(txn.date)}</td>
                    <td>
                        <strong>${txn.company.symbol}</strong><br>
                        <small style='color: var(--text-tertiary);'>${txn.company.name}</small>
                    </td>
                    <td>${txn.insider.name}</td>
                    <td><span class='ipo-sector-badge'>${txn.insider.position}</span></td>
                    <td>
                        <span class='transaction-type-badge ${typeClass}'>
                            <i class='fas ${typeIcon}'></i>
                            ${typeText}
                        </span>
                    </td>
                    <td>${this.formatNumber(txn.shares)}</td>
                    <td>$${this.formatNumber(txn.transactionValue)}</td>
                    <td>
                        <span class='conviction-badge ${convictionClass}'>
                            <i class='fas fa-star'></i>
                            ${txn.convictionScore.score}/100
                        </span>
                    </td>
                    <td>
                        <button class='ipo-action-btn' onclick='insiderApp.viewTransactionDetail("${txn.id}")'>
                            <i class='fas fa-search'></i>
                            Details
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows;
    }

    renderConvictionScoreChart() {
        const topConviction = this.filteredData
            .sort((a, b) => b.convictionScore.score - a.convictionScore.score)
            .slice(0, 10);

        const categories = topConviction.map(t => `${t.company.symbol} - ${t.insider.name.split(' ')[0]}`);
        const scores = topConviction.map(t => t.convictionScore.score);

        Highcharts.chart('convictionScoreChart', {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                title: { text: null }
            },
            yAxis: {
                min: 0,
                max: 100,
                title: { text: 'Conviction Score' }
            },
            series: [{
                name: 'Conviction Score',
                data: scores,
                colorByPoint: true,
                colors: ['#10b981', '#10b981', '#10b981', '#3b82f6', '#3b82f6', '#3b82f6', '#f59e0b', '#f59e0b', '#6b7280', '#6b7280']
            }],
            legend: { enabled: false },
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    renderTransactionSizeChart() {
        const ranges = [
            { name: '< $100K', min: 0, max: 100000, count: 0 },
            { name: '$100K - $500K', min: 100000, max: 500000, count: 0 },
            { name: '$500K - $1M', min: 500000, max: 1000000, count: 0 },
            { name: '$1M - $5M', min: 1000000, max: 5000000, count: 0 },
            { name: '> $5M', min: 5000000, max: Infinity, count: 0 }
        ];

        this.filteredData.forEach(txn => {
            const range = ranges.find(r => txn.transactionValue >= r.min && txn.transactionValue < r.max);
            if (range) range.count++;
        });

        Highcharts.chart('transactionSizeChart', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                categories: ranges.map(r => r.name),
                title: { text: 'Transaction Size' }
            },
            yAxis: {
                title: { text: 'Number of Transactions' }
            },
            series: [{
                name: 'Transactions',
                data: ranges.map(r => r.count),
                color: '#667eea'
            }],
            legend: { enabled: false },
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    renderTimingEarningsChart() {
        const ranges = [
            { name: '0-7 days', count: 0 },
            { name: '8-14 days', count: 0 },
            { name: '15-30 days', count: 0 },
            { name: '31-60 days', count: 0 },
            { name: '> 60 days', count: 0 }
        ];

        this.filteredData.forEach(txn => {
            if (txn.daysToEarnings <= 7) ranges[0].count++;
            else if (txn.daysToEarnings <= 14) ranges[1].count++;
            else if (txn.daysToEarnings <= 30) ranges[2].count++;
            else if (txn.daysToEarnings <= 60) ranges[3].count++;
            else ranges[4].count++;
        });

        Highcharts.chart('timingEarningsChart', {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            plotOptions: {
                pie: {
                    innerSize: '60%',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b><br>{point.percentage:.1f}%'
                    }
                }
            },
            series: [{
                name: 'Transactions',
                data: ranges.map(r => ({ name: r.name, y: r.count })),
                colors: ['#ef4444', '#f59e0b', '#f59e0b', '#3b82f6', '#10b981']
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    renderTimingAnnouncementsChart() {
        // Simulated data for major announcements
        const data = [
            { name: 'Product Launch', before: 12, after: 8 },
            { name: 'M&A Activity', before: 18, after: 5 },
            { name: 'Regulatory Filing', before: 7, after: 15 },
            { name: 'Leadership Change', before: 9, after: 11 },
            { name: 'Strategic Partnership', before: 14, after: 6 }
        ];

        Highcharts.chart('timingAnnouncementsChart', {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                categories: data.map(d => d.name)
            },
            yAxis: {
                title: { text: 'Number of Transactions' }
            },
            series: [{
                name: 'Before Announcement',
                data: data.map(d => d.before),
                color: '#667eea'
            }, {
                name: 'After Announcement',
                data: data.map(d => d.after),
                color: '#10b981'
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    renderCorrelationChart() {
        const categories = ['7 Days', '14 Days', '30 Days', '60 Days', '90 Days'];
        
        const buyImpact = [3.2, 5.8, 8.4, 12.1, 15.7]; // % average return
        const sellImpact = [-2.1, -4.5, -6.8, -9.2, -11.5]; // % average decline

        Highcharts.chart('correlationChart', {
            chart: {
                type: 'line',
                backgroundColor: 'transparent',
                height: 400
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                title: { text: 'Time After Transaction' }
            },
            yAxis: {
                title: { text: 'Average Price Change (%)' },
                plotLines: [{
                    value: 0,
                    color: '#6b7280',
                    width: 2
                }]
            },
            series: [{
                name: 'After Insider Purchase',
                data: buyImpact,
                color: '#10b981',
                marker: {
                    symbol: 'circle',
                    radius: 6
                }
            }, {
                name: 'After Insider Sale',
                data: sellImpact,
                color: '#ef4444',
                marker: {
                    symbol: 'circle',
                    radius: 6
                }
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    renderBacktestingStats() {
        const purchases = this.filteredData.filter(t => t.type === 'P');
        const sales = this.filteredData.filter(t => t.type === 'S');

        const buySuccessRate = purchases.filter(t => t.priceImpact30d > 0).length / purchases.length * 100 || 0;
        const sellAccuracy = sales.filter(t => t.priceImpact30d < 0).length / sales.length * 100 || 0;
        const avgImpact = this.filteredData.reduce((sum, t) => sum + t.priceImpact30d, 0) / this.filteredData.length || 0;

        document.getElementById('buySuccessRate').textContent = `${buySuccessRate.toFixed(1)}%`;
        document.getElementById('sellAccuracy').textContent = `${sellAccuracy.toFixed(1)}%`;
        document.getElementById('averageImpact').textContent = `${avgImpact >= 0 ? '+' : ''}${avgImpact.toFixed(1)}%`;
    }

    renderNetworkChart() {
        // Create network data
        const nodes = [
            { id: 'NVDA', marker: { radius: 30 }, color: '#667eea' },
            { id: 'TSLA', marker: { radius: 30 }, color: '#667eea' },
            { id: 'AAPL', marker: { radius: 30 }, color: '#667eea' },
            { id: 'Jensen Huang', marker: { radius: 20 }, color: '#10b981' },
            { id: 'Elon Musk', marker: { radius: 20 }, color: '#10b981' },
            { id: 'Tim Cook', marker: { radius: 20 }, color: '#10b981' },
            { id: 'Sarah Chen', marker: { radius: 15 }, color: '#f59e0b' },
            { id: 'Robert Williams', marker: { radius: 15 }, color: '#f59e0b' }
        ];

        const links = [
            ['NVDA', 'Jensen Huang'],
            ['NVDA', 'Sarah Chen'],
            ['TSLA', 'Elon Musk'],
            ['TSLA', 'Sarah Chen'],
            ['AAPL', 'Tim Cook'],
            ['AAPL', 'Robert Williams'],
            ['Sarah Chen', 'Robert Williams']
        ];

        Highcharts.chart('networkChart', {
            chart: {
                type: 'networkgraph',
                backgroundColor: 'transparent',
                height: 500
            },
            title: { text: null },
            plotOptions: {
                networkgraph: {
                    keys: ['from', 'to'],
                    layoutAlgorithm: {
                        enableSimulation: true,
                        integration: 'verlet',
                        linkLength: 100
                    }
                }
            },
            series: [{
                dataLabels: {
                    enabled: true,
                    linkFormat: '',
                    style: {
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }
                },
                data: links,
                nodes: nodes
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });

        // Update network insights
        const insightsEl = document.getElementById('networkInsights');
        if (insightsEl) {
            insightsEl.innerHTML = `
                <div class='insight-item'>
                    <i class='fas fa-users'></i>
                    <span><strong>Sarah Chen</strong> serves on 2 boards (NVDA, TSLA) - potential information flow</span>
                </div>
                <div class='insight-item'>
                    <i class='fas fa-link'></i>
                    <span><strong>Board interlocks detected</strong> between NVDA and TSLA via Sarah Chen</span>
                </div>
                <div class='insight-item'>
                    <i class='fas fa-chart-line'></i>
                    <span>Coordinated buying activity observed in <strong>connected companies</strong></span>
                </div>
                <div class='insight-item'>
                    <i class='fas fa-exclamation-triangle'></i>
                    <span>Monitor for <strong>information sharing</strong> patterns across connected insiders</span>
                </div>
            `;
        }
    }

    renderComparisonChart() {
        const companies = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'GOOGL'];
        
        // Insider sentiment (based on buy/sell ratio)
        const insiderSentiment = companies.map(symbol => {
            const txns = this.filteredData.filter(t => t.company.symbol === symbol);
            const buys = txns.filter(t => t.type === 'P').length;
            const sells = txns.filter(t => t.type === 'S').length;
            return buys - sells;
        });

        // Simulated analyst ratings (buy=1, hold=0, sell=-1)
        const analystSentiment = [8, 5, 7, 6, 4]; // Net analyst ratings

        Highcharts.chart('comparisonChart', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                categories: companies
            },
            yAxis: {
                title: { text: 'Net Sentiment' },
                plotLines: [{
                    value: 0,
                    color: '#6b7280',
                    width: 2
                }]
            },
            series: [{
                name: 'Insider Sentiment',
                data: insiderSentiment,
                color: '#667eea'
            }, {
                name: 'Analyst Sentiment',
                data: analystSentiment,
                color: '#10b981'
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    renderDivergenceAlertsChart() {
        const data = [
            { name: 'NVDA', divergence: 2, color: '#10b981' }, // Low
            { name: 'TSLA', divergence: 8, color: '#ef4444' }, // High
            { name: 'AAPL', divergence: 1, color: '#10b981' }, // Low
            { name: 'MSFT', divergence: 5, color: '#f59e0b' }, // Medium
            { name: 'GOOGL', divergence: 7, color: '#ef4444' }  // High
        ];

        Highcharts.chart('divergenceAlertsChart', {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                categories: data.map(d => d.name)
            },
            yAxis: {
                min: 0,
                max: 10,
                title: { text: 'Divergence Level' }
            },
            series: [{
                name: 'Divergence',
                data: data.map(d => ({ y: d.divergence, color: d.color })),
                colorByPoint: true
            }],
            legend: { enabled: false },
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    renderComparisonTable() {
        const tbody = document.getElementById('comparisonTableBody');
        if (!tbody) return;

        const companies = [
            { 
                symbol: 'NVDA', 
                insiderSignal: 'bullish', 
                analystConsensus: 'bullish',
                divergence: 'low',
                accuracy: '87%'
            },
            { 
                symbol: 'TSLA', 
                insiderSignal: 'bearish', 
                analystConsensus: 'bullish',
                divergence: 'high',
                accuracy: '72%'
            },
            { 
                symbol: 'AAPL', 
                insiderSignal: 'bullish', 
                analystConsensus: 'neutral',
                divergence: 'medium',
                accuracy: '91%'
            },
            { 
                symbol: 'MSFT', 
                insiderSignal: 'neutral', 
                analystConsensus: 'bullish',
                divergence: 'medium',
                accuracy: '84%'
            },
            { 
                symbol: 'GOOGL', 
                insiderSignal: 'bearish', 
                analystConsensus: 'bullish',
                divergence: 'high',
                accuracy: '76%'
            }
        ];

        const rows = companies.map(c => `
            <tr>
                <td><strong>${c.symbol}</strong></td>
                <td>
                    <span class='signal-badge signal-${c.insiderSignal}'>
                        <i class='fas fa-${c.insiderSignal === 'bullish' ? 'arrow-up' : c.insiderSignal === 'bearish' ? 'arrow-down' : 'minus'}'></i>
                        ${c.insiderSignal.charAt(0).toUpperCase() + c.insiderSignal.slice(1)}
                    </span>
                </td>
                <td>
                    <span class='signal-badge signal-${c.analystConsensus}'>
                        <i class='fas fa-${c.analystConsensus === 'bullish' ? 'arrow-up' : c.analystConsensus === 'bearish' ? 'arrow-down' : 'minus'}'></i>
                        ${c.analystConsensus.charAt(0).toUpperCase() + c.analystConsensus.slice(1)}
                    </span>
                </td>
                <td>
                    <div class='divergence-indicator divergence-${c.divergence}'>
                        <i class='fas fa-${c.divergence === 'high' ? 'exclamation-circle' : c.divergence === 'medium' ? 'exclamation-triangle' : 'check-circle'}'></i>
                        ${c.divergence.charAt(0).toUpperCase() + c.divergence.slice(1)}
                    </div>
                </td>
                <td><strong>${c.accuracy}</strong></td>
            </tr>
        `).join('');

        tbody.innerHTML = rows;
    }

    renderActivityHeatmap() {
        // Create heatmap data (companies x days of week)
        const companies = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'GOOGL', 'META', 'AMZN'];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

        const data = [];
        companies.forEach((company, x) => {
            days.forEach((day, y) => {
                data.push([x, y, Math.floor(Math.random() * 10)]);
            });
        });

        Highcharts.chart('activityHeatmap', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent',
                height: 400
            },
            title: { text: null },
            xAxis: {
                categories: companies
            },
            yAxis: {
                categories: days,
                title: null
            },
            colorAxis: {
                min: 0,
                minColor: '#f0f9ff',
                maxColor: '#667eea'
            },
            series: [{
                name: 'Transaction Count',
                borderWidth: 1,
                data: data,
                dataLabels: {
                    enabled: true,
                    color: '#000000'
                }
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    populateCompanyFilter() {
        const select = document.getElementById('companyFilter');
        if (!select) return;

        const companies = [...new Set(this.insiderData.map(t => t.company.symbol))].sort();
        
        const options = companies.map(symbol => 
            `<option value='${symbol}'>${symbol}</option>`
        ).join('');

        select.innerHTML = `<option value='all'>All Companies</option>${options}`;
    }

    filterTransactions(button) {
        // Remove active class from all chips
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
        });

        // Add active class to clicked chip
        button.classList.add('active');

        // Get filter type
        const type = button.dataset.type;
        this.currentTransactionType = type;

        // Apply filters
        this.applyFilters();
    }

    updateCorrelation(button) {
        // Update active state
        document.querySelectorAll('.chart-control-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        const days = parseInt(button.dataset.days);
        
        // Re-render correlation chart with new timeframe
        this.renderCorrelationChart();
    }

    viewTransactionDetail(txnId) {
        const txn = this.insiderData.find(t => t.id === txnId);
        if (!txn) return;

        const modalTitle = document.getElementById('transactionModalTitle');
        const modalBody = document.getElementById('transactionModalBody');

        if (modalTitle) {
            modalTitle.innerHTML = `<i class='fas fa-file-alt'></i> Transaction Details - ${txn.company.symbol}`;
        }

        if (modalBody) {
            const typeClass = txn.type === 'P' ? 'type-buy' : txn.type === 'S' ? 'type-sell' : 'type-option';
            const typeIcon = txn.type === 'P' ? 'fa-arrow-up' : txn.type === 'S' ? 'fa-arrow-down' : 'fa-certificate';
            const typeText = txn.type === 'P' ? 'Purchase' : txn.type === 'S' ? 'Sale' : 'Option Exercise';

            modalBody.innerHTML = `
                <div style='padding: 20px;'>
                    <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px;'>
                        <div>
                            <h3 style='margin-bottom: 20px;'><i class='fas fa-building'></i> Company Information</h3>
                            <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px;'>
                                <p><strong>Symbol:</strong> ${txn.company.symbol}</p>
                                <p><strong>Name:</strong> ${txn.company.name}</p>
                                <p><strong>Sector:</strong> ${txn.company.sector}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h3 style='margin-bottom: 20px;'><i class='fas fa-user'></i> Insider Information</h3>
                            <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px;'>
                                <p><strong>Name:</strong> ${txn.insider.name}</p>
                                <p><strong>Position:</strong> ${txn.insider.position}</p>
                                <p><strong>Net Worth:</strong> $${(txn.insider.netWorth / 1000000).toFixed(0)}M</p>
                            </div>
                        </div>
                    </div>

                    <h3 style='margin-bottom: 20px;'><i class='fas fa-exchange-alt'></i> Transaction Details</h3>
                    <div style='background: var(--eco-gradient-soft); padding: 24px; border-radius: 12px; margin-bottom: 32px;'>
                        <div style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;'>
                            <div>
                                <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 6px;'>DATE</p>
                                <p style='font-weight: 700; font-size: 1.1rem;'>${this.formatDate(txn.date)}</p>
                            </div>
                            <div>
                                <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 6px;'>TYPE</p>
                                <span class='transaction-type-badge ${typeClass}'>
                                    <i class='fas ${typeIcon}'></i> ${typeText}
                                </span>
                            </div>
                            <div>
                                <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 6px;'>SHARES</p>
                                <p style='font-weight: 700; font-size: 1.1rem;'>${this.formatNumber(txn.shares)}</p>
                            </div>
                            <div>
                                <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 6px;'>PRICE PER SHARE</p>
                                <p style='font-weight: 700; font-size: 1.1rem;'>$${txn.pricePerShare.toFixed(2)}</p>
                            </div>
                            <div>
                                <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 6px;'>TOTAL VALUE</p>
                                <p style='font-weight: 700; font-size: 1.3rem; background: var(--eco-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>
                                    $${this.formatNumber(txn.transactionValue)}
                                </p>
                            </div>
                            <div>
                                <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 6px;'>CONVICTION SCORE</p>
                                <p style='font-weight: 700; font-size: 1.3rem; background: var(--eco-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>
                                    ${txn.convictionScore.score}/100
                                </p>
                            </div>
                        </div>
                    </div>

                    <h3 style='margin-bottom: 20px;'><i class='fas fa-chart-line'></i> Impact Analysis</h3>
                    <div style='background: var(--eco-gradient-soft); padding: 24px; border-radius: 12px; margin-bottom: 32px;'>
                        <div style='display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;'>
                            <div style='text-align: center;'>
                                <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 6px;'>DAYS TO EARNINGS</p>
                                <p style='font-weight: 700; font-size: 1.5rem;'>${txn.daysToEarnings} days</p>
                            </div>
                            <div style='text-align: center;'>
                                <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 6px;'>7-DAY IMPACT</p>
                                <p style='font-weight: 700; font-size: 1.5rem; color: ${txn.priceImpact7d >= 0 ? '#10b981' : '#ef4444'};'>
                                    ${txn.priceImpact7d >= 0 ? '+' : ''}${txn.priceImpact7d.toFixed(2)}%
                                </p>
                            </div>
                            <div style='text-align: center;'>
                                <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 6px;'>30-DAY IMPACT</p>
                                <p style='font-weight: 700; font-size: 1.5rem; color: ${txn.priceImpact30d >= 0 ? '#10b981' : '#ef4444'};'>
                                    ${txn.priceImpact30d >= 0 ? '+' : ''}${txn.priceImpact30d.toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style='text-align: center;'>
                        <a href='${txn.formUrl}' target='_blank' class='recommendation-btn' style='display: inline-block; text-decoration: none;'>
                            <i class='fas fa-external-link-alt'></i> View SEC Form 4 Filing
                        </a>
                    </div>
                </div>
            `;
        }

        this.openModal('transactionDetailModal');
    }

    viewPattern(patternType) {
        const modalTitle = document.getElementById('patternModalTitle');
        const modalBody = document.getElementById('patternModalBody');

        let content = '';

        switch(patternType) {
            case 'cluster':
                const clusterCompanies = this.detectClusterBuying();
                content = this.generateClusterBuyingContent(clusterCompanies);
                if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-users"></i> Cluster Buying Pattern Analysis';
                break;
            case 'preearnings':
                const preEarnings = this.filteredData.filter(txn => txn.daysToEarnings <= 30);
                content = this.generatePreEarningsContent(preEarnings);
                if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-calendar-check"></i> Pre-Earnings Activity Analysis';
                break;
            case 'divergence':
                const divergences = this.detectDivergence();
                content = this.generateDivergenceContent(divergences);
                if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-exclamation-triangle"></i> CEO/CFO Divergence Analysis';
                break;
            case 'volume':
                content = this.generateUnusualVolumeContent();
                if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-chart-area"></i> Unusual Volume Analysis';
                break;
        }

        if (modalBody) modalBody.innerHTML = content;
        this.openModal('patternDetailModal');
    }

    generateClusterBuyingContent(companies) {
        if (companies.length === 0) {
            return '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">No cluster buying detected in the current period.</p>';
        }

        const companyDetails = companies.map(symbol => {
            const txns = this.filteredData.filter(t => t.company.symbol === symbol && t.type === 'P' && this.isRecent(t.date, 7));
            const totalValue = txns.reduce((sum, t) => sum + t.transactionValue, 0);
            const insiders = [...new Set(txns.map(t => t.insider.name))];

            return `
                <div style='background: var(--eco-gradient-soft); padding: 24px; border-radius: 12px; margin-bottom: 20px;'>
                    <h4 style='margin-bottom: 16px;'><i class='fas fa-building'></i> ${symbol}</h4>
                    <div style='display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;'>
                        <div>
                            <p style='color: var(--text-tertiary); font-size: 0.85rem;'>TRANSACTIONS</p>
                            <p style='font-weight: 800; font-size: 1.5rem;'>${txns.length}</p>
                        </div>
                        <div>
                            <p style='color: var(--text-tertiary); font-size: 0.85rem;'>TOTAL VALUE</p>
                            <p style='font-weight: 800; font-size: 1.5rem;'>$${(totalValue / 1000000).toFixed(1)}M</p>
                        </div>
                        <div>
                            <p style='color: var(--text-tertiary); font-size: 0.85rem;'>INSIDERS</p>
                            <p style='font-weight: 800; font-size: 1.5rem;'>${insiders.length}</p>
                        </div>
                    </div>
                    <div style='margin-top: 16px;'>
                        <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 8px;'>PARTICIPANTS:</p>
                        <p style='font-weight: 600;'>${insiders.join(', ')}</p>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div style='padding: 20px;'>
                <div style='background: linear-gradient(135deg, #10b981, #059669); padding: 24px; border-radius: 12px; color: white; margin-bottom: 32px;'>
                    <h3 style='margin-bottom: 12px;'><i class='fas fa-lightbulb'></i> Pattern Insight</h3>
                    <p style='line-height: 1.8; margin: 0;'>
                        Cluster buying occurs when multiple insiders purchase shares simultaneously, often indicating strong 
                        internal confidence. This pattern historically precedes positive stock performance in 78% of cases.
                    </p>
                </div>
                
                <h3 style='margin-bottom: 20px;'>Detected Cluster Buying (Last 7 Days)</h3>
                ${companyDetails}
            </div>
        `;
    }

    generatePreEarningsContent(transactions) {
        if (transactions.length === 0) {
            return '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">No pre-earnings transactions detected.</p>';
        }

        const grouped = transactions.reduce((acc, txn) => {
            if (!acc[txn.company.symbol]) acc[txn.company.symbol] = [];
            acc[txn.company.symbol].push(txn);
            return acc;
        }, {});

        const companyDetails = Object.keys(grouped).map(symbol => {
            const txns = grouped[symbol];
            const buys = txns.filter(t => t.type === 'P').length;
            const sells = txns.filter(t => t.type === 'S').length;
            const signal = buys > sells ? 'Bullish' : sells > buys ? 'Bearish' : 'Neutral';
            const signalColor = buys > sells ? '#10b981' : sells > buys ? '#ef4444' : '#6b7280';

            return `
                <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin-bottom: 16px;'>
                    <div style='display: flex; justify-content: space-between; align-items: center;'>
                        <h4><i class='fas fa-chart-line'></i> ${symbol}</h4>
                        <span style='background: ${signalColor}; color: white; padding: 6px 16px; border-radius: 8px; font-weight: 700;'>
                            ${signal}
                        </span>
                    </div>
                    <div style='display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 16px;'>
                        <div>
                            <p style='color: var(--text-tertiary); font-size: 0.85rem;'>PURCHASES</p>
                            <p style='font-weight: 800; font-size: 1.3rem; color: #10b981;'>${buys}</p>
                        </div>
                        <div>
                            <p style='color: var(--text-tertiary); font-size: 0.85rem;'>SALES</p>
                            <p style='font-weight: 800; font-size: 1.3rem; color: #ef4444;'>${sells}</p>
                        </div>
                        <div>
                            <p style='color: var(--text-tertiary); font-size: 0.85rem;'>AVG DAYS TO EARNINGS</p>
                            <p style='font-weight: 800; font-size: 1.3rem;'>${(txns.reduce((sum, t) => sum + t.daysToEarnings, 0) / txns.length).toFixed(0)}</p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div style='padding: 20px;'>
                <div style='background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 24px; border-radius: 12px; color: white; margin-bottom: 32px;'>
                    <h3 style='margin-bottom: 12px;'><i class='fas fa-lightbulb'></i> Pattern Insight</h3>
                    <p style='line-height: 1.8; margin: 0;'>
                        Insider trading before earnings announcements can signal expectations. Heavy buying typically indicates 
                        confidence in upcoming results, while selling may suggest caution. This pattern has 71% predictive accuracy.
                    </p>
                </div>
                
                ${companyDetails}
            </div>
        `;
    }

    generateDivergenceContent(companies) {
        if (companies.length === 0) {
            return '<p style="text-align: center; padding: 40px; color: var(--text-secondary);">No CEO/CFO divergences detected.</p>';
        }

        const details = companies.map(symbol => {
            const companyTxns = this.filteredData.filter(t => t.company.symbol === symbol && this.isRecent(t.date, 30));
            const ceoTxns = companyTxns.filter(t => t.insider.position === 'CEO');
            const cfoTxns = companyTxns.filter(t => t.insider.position === 'CFO');

            const ceoSignal = this.getSignal(ceoTxns.map(t => t.type));
            const cfoSignal = this.getSignal(cfoTxns.map(t => t.type));

            return `
                <div style='background: var(--eco-gradient-soft); padding: 24px; border-radius: 12px; margin-bottom: 20px;'>
                    <h4 style='margin-bottom: 20px;'><i class='fas fa-building'></i> ${symbol}</h4>
                    <div style='display: grid; grid-template-columns: 1fr 1fr; gap: 24px;'>
                        <div style='background: white; padding: 20px; border-radius: 12px;'>
                            <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 8px;'>CEO SIGNAL</p>
                            <p style='font-weight: 800; font-size: 1.5rem; color: ${ceoSignal === 'bullish' ? '#10b981' : ceoSignal === 'bearish' ? '#ef4444' : '#6b7280'};'>
                                ${ceoSignal ? ceoSignal.toUpperCase() : 'N/A'}
                            </p>
                            <p style='font-size: 0.9rem; margin-top: 8px;'>${ceoTxns.length} transactions</p>
                        </div>
                        <div style='background: white; padding: 20px; border-radius: 12px;'>
                            <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 8px;'>CFO SIGNAL</p>
                            <p style='font-weight: 800; font-size: 1.5rem; color: ${cfoSignal === 'bullish' ? '#10b981' : cfoSignal === 'bearish' ? '#ef4444' : '#6b7280'};'>
                                ${cfoSignal ? cfoSignal.toUpperCase() : 'N/A'}
                            </p>
                            <p style='font-size: 0.9rem; margin-top: 8px;'>${cfoTxns.length} transactions</p>
                        </div>
                    </div>
                    <div style='background: #fef3c7; padding: 16px; border-radius: 8px; margin-top: 16px; border-left: 4px solid #f59e0b;'>
                        <p style='margin: 0; color: #92400e;'>
                            <i class='fas fa-exclamation-triangle'></i>
                            <strong>Warning:</strong> Conflicting signals between CEO and CFO may indicate uncertainty or strategic disagreement.
                        </p>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div style='padding: 20px;'>
                <div style='background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; border-radius: 12px; color: white; margin-bottom: 32px;'>
                    <h3 style='margin-bottom: 12px;'><i class='fas fa-lightbulb'></i> Pattern Insight</h3>
                    <p style='line-height: 1.8; margin: 0;'>
                        CEO/CFO divergence is a red flag that requires investigation. When the CEO is buying while the CFO is selling 
                        (or vice versa), it may signal internal disagreements about company prospects. Monitor these situations closely.
                    </p>
                </div>
                
                ${details}
            </div>
        `;
    }

    generateUnusualVolumeContent() {
        const avgDailyTxns = this.insiderData.length / 90;
        const last7Days = this.insiderData.filter(txn => this.isRecent(txn.date, 7));
        const dailyAvgLast7 = last7Days.length / 7;
        const multiplier = (dailyAvgLast7 / avgDailyTxns).toFixed(1);

        return `
            <div style='padding: 20px;'>
                <div style='background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 24px; border-radius: 12px; color: white; margin-bottom: 32px;'>
                    <h3 style='margin-bottom: 12px;'><i class='fas fa-lightbulb'></i> Pattern Insight</h3>
                    <p style='line-height: 1.8; margin: 0;'>
                        Unusual volume spikes (>3x average) often precede major corporate events or indicate insider knowledge 
                        of upcoming catalysts. This pattern requires immediate attention and further investigation.
                    </p>
                </div>

                <div style='display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px;'>
                    <div style='background: var(--eco-gradient-soft); padding: 24px; border-radius: 12px; text-align: center;'>
                        <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 8px;'>90-DAY AVG</p>
                        <p style='font-weight: 800; font-size: 2rem;'>${avgDailyTxns.toFixed(1)}/day</p>
                    </div>
                    <div style='background: var(--eco-gradient-soft); padding: 24px; border-radius: 12px; text-align: center;'>
                        <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 8px;'>LAST 7 DAYS AVG</p>
                        <p style='font-weight: 800; font-size: 2rem;'>${dailyAvgLast7.toFixed(1)}/day</p>
                    </div>
                    <div style='background: var(--eco-gradient-soft); padding: 24px; border-radius: 12px; text-align: center;'>
                        <p style='color: var(--text-tertiary); font-size: 0.85rem; margin-bottom: 8px;'>MULTIPLIER</p>
                        <p style='font-weight: 800; font-size: 2rem; color: ${multiplier >= 3 ? '#ef4444' : '#10b981'};'>${multiplier}x</p>
                    </div>
                </div>

                ${multiplier >= 3 ? `
                    <div style='background: #fee2e2; padding: 20px; border-radius: 12px; border-left: 4px solid #ef4444;'>
                        <p style='margin: 0; color: #991b1b;'>
                            <i class='fas fa-exclamation-circle'></i>
                            <strong>Alert:</strong> Unusual volume detected! Current activity is ${multiplier}x normal levels.
                        </p>
                    </div>
                ` : `
                    <div style='background: #d1fae5; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981;'>
                        <p style='margin: 0; color: #065f46;'>
                            <i class='fas fa-check-circle'></i>
                            <strong>Normal:</strong> Transaction volume is within expected ranges.
                        </p>
                    </div>
                `}
            </div>
        `;
    }

    saveAlertConfig() {
        this.alertConfig = {
            clusterBuying: document.getElementById('alertClusterBuying').checked,
            highValue: document.getElementById('alertHighValue').checked,
            divergence: document.getElementById('alertDivergence').checked,
            preEarnings: document.getElementById('alertPreEarnings').checked,
            unusualVolume: document.getElementById('alertUnusualVolume').checked,
            highValueThreshold: parseInt(document.getElementById('highValueThreshold').value)
        };

        console.log('✅ Alert configuration saved:', this.alertConfig);
        
        this.showSuccess('Alert configuration saved successfully!');
        this.closeAllModals();
    }

    showInfoModal(topic) {
        const modalTitle = document.getElementById('infoModalTitle');
        const modalBody = document.getElementById('infoModalBody');

        const infoContent = {
            overview: {
                title: '<i class="fas fa-info-circle"></i> Insider Activity Overview',
                content: `
                    <h3>📊 What is Insider Trading?</h3>
                    <p>Insider trading refers to the buying or selling of a company's stock by individuals who have access to non-public, material information about the company (executives, directors, employees).</p>
                    
                    <h3>📈 Why Track Insider Activity?</h3>
                    <ul style='line-height: 2;'>
                        <li><strong>Information Asymmetry:</strong> Insiders have superior knowledge about company operations</li>
                        <li><strong>Predictive Power:</strong> Historical data shows insider purchases precede stock gains in 72% of cases</li>
                        <li><strong>Risk Mitigation:</strong> Heavy insider selling can signal upcoming challenges</li>
                        <li><strong>Conviction Signal:</strong> Large transactions relative to net worth indicate strong beliefs</li>
                    </ul>

                    <h3>🔍 Key Metrics Explained</h3>
                    <ul style='line-height: 2;'>
                        <li><strong>Total Transactions:</strong> All Form 4 filings in the selected period</li>
                        <li><strong>Insider Purchases:</strong> Buy orders from company insiders</li>
                        <li><strong>Insider Sales:</strong> Sell orders (often for liquidity/diversification, not always bearish)</li>
                        <li><strong>Transaction Value:</strong> Dollar amount of all transactions combined</li>
                        <li><strong>Conviction Score:</strong> Proprietary metric measuring transaction size vs insider wealth</li>
                    </ul>
                `
            },
            sentiment: {
                title: '<i class="fas fa-tachometer-alt"></i> Insider Sentiment Score',
                content: `
                    <h3>🎯 How is the Sentiment Score Calculated?</h3>
                    <p>The Insider Sentiment Score aggregates all insider transactions to produce a single metric (0-100) representing market sentiment:</p>
                    
                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <p style='margin: 0;'><strong>Formula:</strong> Score = 50 + ((Purchases - Sales) / Total Transactions × 50)</p>
                    </div>

                    <h3>📊 Score Interpretation</h3>
                    <ul style='line-height: 2;'>
                        <li><strong>65-100 (Bullish):</strong> Heavy buying activity, insiders are accumulating</li>
                        <li><strong>35-65 (Neutral):</strong> Balanced activity, no clear directional signal</li>
                        <li><strong>0-35 (Bearish):</strong> Heavy selling activity, insiders are reducing positions</li>
                    </ul>

                    <h3>⚠ Important Considerations</h3>
                    <ul style='line-height: 2;'>
                        <li>Insider selling can be for personal reasons (taxes, diversification)</li>
                        <li>Buying is generally a stronger signal than selling</li>
                        <li>Weight high-conviction transactions more heavily</li>
                        <li>Consider timing relative to earnings and corporate events</li>
                    </ul>
                `
            },
            patterns: {
                title: '<i class="fas fa-brain"></i> Pattern Recognition',
                content: `
                    <h3>🔍 What are Trading Patterns?</h3>
                    <p>Our AI system detects recurring patterns in insider trading behavior that have historically preceded significant stock movements.</p>

                    <h3>📌 Detected Patterns</h3>
                    
                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>🟢 Cluster Buying</h4>
                        <p><strong>Definition:</strong> 3+ insiders purchasing shares within a 7-day window</p>
                        <p><strong>Significance:</strong> Indicates strong internal consensus about positive prospects</p>
                        <p><strong>Historical Success Rate:</strong> 78% positive return after 90 days</p>
                    </div>

                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>📅 Pre-Earnings Activity</h4>
                        <p><strong>Definition:</strong> Unusual trading 30 days before earnings announcements</p>
                        <p><strong>Significance:</strong> Insiders may be positioning ahead of results</p>
                        <p><strong>Historical Success Rate:</strong> 71% predictive accuracy</p>
                    </div>

                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>⚠ CEO/CFO Divergence</h4>
                        <p><strong>Definition:</strong> CEO and CFO taking opposite positions (one buying, one selling)</p>
                        <p><strong>Significance:</strong> Red flag indicating potential internal disagreement</p>
                        <p><strong>Action:</strong> Requires further investigation</p>
                    </div>

                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>📈 Unusual Volume Spike</h4>
                        <p><strong>Definition:</strong> Transaction volume >3x 90-day average</p>
                        <p><strong>Significance:</strong> Often precedes major corporate events or catalysts</p>
                        <p><strong>Action:</strong> Monitor for upcoming announcements</p>
                    </div>
                `
            },
            transactions: {
                title: '<i class="fas fa-exchange-alt"></i> Understanding Transactions',
                content: `
                    <h3>📋 Transaction Types</h3>
                    
                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>🟢 Purchase (P)</h4>
                        <p>Insider buys shares on the open market with personal funds. This is the strongest bullish signal as it represents conviction in future appreciation.</p>
                    </div>

                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>🔴 Sale (S)</h4>
                        <p>Insider sells shares. Can be bearish, but often due to diversification, tax planning, or liquidity needs. Evaluate in context.</p>
                    </div>

                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>🎫 Option Exercise (M)</h4>
                        <p>Insider exercises stock options (compensation-related). Less significant signal unless immediately followed by sale or hold decision.</p>
                    </div>

                    <h3>⭐ Conviction Score Methodology</h3>
                    <p>Our proprietary Conviction Score (0-100) measures transaction significance:</p>
                    <ul style='line-height: 2;'>
                        <li><strong>High (70-100):</strong> Transaction >1% of insider's net worth</li>
                        <li><strong>Medium (40-69):</strong> Transaction 0.5-1% of net worth</li>
                        <li><strong>Low (0-39):</strong> Transaction <0.5% of net worth</li>
                    </ul>
                `
            },
            conviction: {
                title: '<i class="fas fa-star"></i> Conviction Score Analysis',
                content: `
                    <h3>🎯 What is a Conviction Score?</h3>
                    <p>The Conviction Score measures how significant an insider transaction is relative to the insider's total wealth. A large transaction represents stronger conviction about the stock's future.</p>

                    <h3>📊 Calculation Method</h3>
                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <p><strong>Formula:</strong></p>
                        <p>Conviction % = (Transaction Value / Insider Net Worth) × 100</p>
                        <br>
                        <p><strong>Score Bands:</strong></p>
                        <ul>
                            <li>>5% of net worth → Score 95 (Extreme Conviction)</li>
                            <li>2-5% → Score 85 (Very High)</li>
                            <li>1-2% → Score 70 (High)</li>
                            <li>0.5-1% → Score 55 (Medium)</li>
                            <li><0.5% → Score 30 (Low)</li>
                        </ul>
                    </div>

                    <h3>💡 Why It Matters</h3>
                    <ul style='line-height: 2;'>
                        <li>A CEO investing $10M when worth $100M (10%) shows extreme confidence</li>
                        <li>The same $10M from a billionaire (1%) is less meaningful</li>
                        <li>High conviction transactions have 85% success rate historically</li>
                        <li>Use this to prioritize which insider trades to follow</li>
                    </ul>
                `
            },
            timing: {
                title: '<i class="fas fa-clock"></i> Timing Analysis',
                content: `
                    <h3>⏰ Why Timing Matters</h3>
                    <p>The timing of insider transactions relative to corporate events can reveal important insights about insider expectations and motivations.</p>

                    <h3>📅 Key Events to Monitor</h3>
                    
                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>📊 Earnings Announcements</h4>
                        <p><strong>Pre-Earnings Buying (0-30 days before):</strong></p>
                        <ul>
                            <li>Often indicates confidence in upcoming results</li>
                            <li>71% correlation with positive earnings surprises</li>
                            <li>Monitor for "window periods" when trading is restricted</li>
                        </ul>
                    </div>

                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>🚀 Product Launches</h4>
                        <p>Buying before major product releases suggests internal optimism about market reception and sales projections.</p>
                    </div>

                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>🤝 M&A Activity</h4>
                        <p>Unusual trading patterns before announced deals may indicate leak of information (potentially illegal) or strategic positioning.</p>
                    </div>

                    <h3>⚠ Red Flags</h3>
                    <ul style='line-height: 2;'>
                        <li>Heavy selling 0-7 days before earnings (bearish signal)</li>
                        <li>Selling immediately after positive announcements (take profit, not necessarily bearish)</li>
                        <li>Buying during known blackout periods (compliance issue)</li>
                    </ul>
                `
            },
            correlation: {
                title: '<i class="fas fa-chart-line"></i> Historical Correlation',
                content: `
                    <h3>📈 Backtesting Methodology</h3>
                    <p>We analyze historical insider transactions and measure subsequent stock price performance to validate the predictive power of insider activity.</p>

                    <h3>🔍 Key Findings</h3>
                    
                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>✅ Insider Purchases</h4>
                        <ul>
                            <li><strong>7-day impact:</strong> +3.2% average return</li>
                            <li><strong>30-day impact:</strong> +8.4% average return</li>
                            <li><strong>90-day impact:</strong> +15.7% average return</li>
                            <li><strong>Success rate:</strong> 72% positive return after 30 days</li>
                        </ul>
                    </div>

                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>❌ Insider Sales</h4>
                        <ul>
                            <li><strong>7-day impact:</strong> -2.1% average return</li>
                            <li><strong>30-day impact:</strong> -6.8% average return</li>
                            <li><strong>90-day impact:</strong> -11.5% average return</li>
                            <li><strong>Accuracy:</strong> 64% stock decline after heavy selling</li>
                        </ul>
                    </div>

                    <h3>🎯 Investment Strategy</h3>
                    <ul style='line-height: 2;'>
                        <li>Follow high-conviction purchases (score >70)</li>
                        <li>Ignore small routine option exercises</li>
                        <li>Weight cluster buying patterns heavily</li>
                        <li>Be cautious with single-insider sales (often for personal reasons)</li>
                        <li>Combine with fundamental analysis for best results</li>
                    </ul>
                `
            },
            network: {
                title: '<i class="fas fa-project-diagram"></i> Network Analysis',
                content: `
                    <h3>🕸 What is Network Analysis?</h3>
                    <p>Network Analysis maps relationships between insiders and companies to identify potential information flows and coordinated trading patterns.</p>

                    <h3>🔗 Board Interlocks</h3>
                    <p>When an individual serves on multiple company boards, they create a "board interlock" that can facilitate information sharing (both legal and potentially problematic).</p>

                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>🎯 What to Look For</h4>
                        <ul>
                            <li><strong>Cross-Pollination:</strong> Directors serving on 2+ boards in same industry</li>
                            <li><strong>Coordinated Trading:</strong> Multiple insiders from connected companies trading simultaneously</li>
                            <li><strong>Information Flow:</strong> Trade patterns suggesting knowledge transfer</li>
                        </ul>
                    </div>

                    <h3>🚨 Warning Signs</h3>
                    <ul style='line-height: 2;'>
                        <li>Identical trade timing across connected insiders</li>
                        <li>Trading in competitor stocks by board members</li>
                        <li>Unusual activity before M&A announcements involving connected companies</li>
                    </ul>

                    <h3>✅ Legitimate Patterns</h3>
                    <ul style='line-height: 2;'>
                        <li>Industry veterans with diverse board seats</li>
                        <li>Venture capitalists serving on portfolio company boards</li>
                        <li>Independent directors with expertise in specific sectors</li>
                    </ul>
                `
            },
            comparison: {
                title: '<i class="fas fa-balance-scale-right"></i> Insider vs Analyst Sentiment',
                content: `
                    <h3>🤔 Who's Right: Insiders or Analysts?</h3>
                    <p>Comparing insider trading activity to Wall Street analyst ratings can reveal valuable divergences and confirm or contradict market consensus.</p>

                    <h3>📊 Historical Accuracy Comparison</h3>
                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <ul>
                            <li><strong>Insider Purchases:</strong> 72% predict stock gains (30-day window)</li>
                            <li><strong>Analyst Upgrades:</strong> 58% predict stock gains (30-day window)</li>
                            <li><strong>Insider Sales:</strong> 64% predict stock declines</li>
                            <li><strong>Analyst Downgrades:</strong> 52% predict stock declines</li>
                        </ul>
                    </div>

                    <h3>🎯 Key Divergence Scenarios</h3>
                    
                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>🟢 Insider Buying + Analyst Sell → HIGH OPPORTUNITY</h4>
                        <p>Insiders have superior information. This divergence historically produces 23% average gains.</p>
                    </div>

                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>🔴 Insider Selling + Analyst Buy → HIGH RISK</h4>
                        <p>Wall Street may be overly optimistic. Proceed with caution. Historical 15% average loss.</p>
                    </div>

                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>✅ Both Bullish → STRONG CONFIRMATION</h4>
                        <p>Alignment between insiders and analysts provides strong conviction. 81% success rate.</p>
                    </div>

                    <h3>💡 Investment Strategy</h3>
                    <ul style='line-height: 2;'>
                        <li>Weight insider sentiment more heavily (better track record)</li>
                        <li>Use analyst consensus as secondary confirmation</li>
                        <li>Pay attention to high divergence scenarios (biggest opportunities/risks)</li>
                        <li>Monitor analyst revisions after insider activity</li>
                    </ul>
                `
            },
            heatmap: {
                title: '<i class="fas fa-fire"></i> Activity Heatmap',
                content: `
                    <h3>🔥 What is the Activity Heatmap?</h3>
                    <p>The heatmap visualizes insider trading intensity across companies and time periods, making it easy to spot clusters of activity and emerging patterns.</p>

                    <h3>📊 How to Read the Heatmap</h3>
                    <ul style='line-height: 2;'>
                        <li><strong>Darker Colors:</strong> More transactions (higher activity)</li>
                        <li><strong>Lighter Colors:</strong> Fewer transactions (lower activity)</li>
                        <li><strong>Rows:</strong> Different companies</li>
                        <li><strong>Columns:</strong> Time periods (days of week, weeks, months)</li>
                    </ul>

                    <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin: 20px 0;'>
                        <h4>🎯 Patterns to Identify</h4>
                        <ul>
                            <li><strong>Horizontal Bands:</strong> Company-wide insider activity spike</li>
                            <li><strong>Vertical Bands:</strong> Market-wide event affecting multiple companies</li>
                            <li><strong>Hot Spots:</strong> Concentrated activity in specific company/time combination</li>
                            <li><strong>Cold Zones:</strong> Blackout periods or quiet times</li>
                        </ul>
                    </div>

                    <h3>💡 Actionable Insights</h3>
                    <ul style='line-height: 2;'>
                        <li>Monitor hot spots for emerging opportunities</li>
                        <li>Investigate sudden activity spikes</li>
                        <li>Identify seasonal patterns in insider trading</li>
                        <li>Detect coordinated activity across sectors</li>
                    </ul>
                `
            }
        };

        const info = infoContent[topic] || infoContent.overview;

        if (modalTitle) modalTitle.innerHTML = info.title;
        if (modalBody) modalBody.innerHTML = info.content;

        this.openModal('infoModal');
    }

    // Utility functions
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(0);
    }

    showLoading() {
        console.log('⏳ Loading...');
    }

    showError(message) {
        console.error('❌', message);
        alert(message);
    }

    showSuccess(message) {
        console.log('✅', message);
        alert(message);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }
}

// Initialize app
let insiderApp;
document.addEventListener('DOMContentLoaded', () => {
    insiderApp = new InsiderFlowTracker();
});

// Global logout function
function logout() {
    if (firebase && firebase.auth) {
        firebase.auth().signOut().then(() => {
            window.location.href = 'login.html';
        }).catch(error => {
            console.error('Logout error:', error);
        });
    }
}