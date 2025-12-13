/**
 * ═══════════════════════════════════════════════════════════════════
 * 🚀 IPO INTELLIGENCE DASHBOARD - ALPHAVAULT AI - VERSION COMPLÈTE
 * ═══════════════════════════════════════════════════════════════════
 */

class IPOIntelligenceDashboard {
    constructor() {
        this.secClient = new SECApiClient();
        this.ipos = [];
        this.enrichedIPOs = [];
        this.currentPeriod = 30;
        this.filters = {
            sectors: [],
            scoreMin: 0,
            scoreMax: 100,
            stages: []
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing IPO Intelligence Dashboard...');
        
        this.setupEventListeners();
        await this.loadData();
        this.renderAll();
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshData')?.addEventListener('click', () => {
            this.loadData(true);
        });

        // Filter button
        document.getElementById('viewFilters')?.addEventListener('click', () => {
            this.openModal('filtersModal');
        });

        // Period selector
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = parseInt(e.target.dataset.period);
                this.renderHeatmap();
            });
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            });
        });

        // Filter actions
        document.getElementById('applyFilters')?.addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('resetFilters')?.addEventListener('click', () => {
            this.resetFilters();
        });
    }

    async loadData(forceRefresh = false) {
        try {
            console.log('📊 Loading IPO data...');
            
            const response = await this.secClient.getIPOs({
                limit: 100,
                includeAmendments: true,
                forceRefresh
            });

            this.ipos = response.data || [];
            
            // Remove duplicates based on CIK + Company Name
            this.ipos = this.removeDuplicates(this.ipos);
            
            // Enrich IPOs with analysis
            this.enrichedIPOs = await Promise.all(
                this.ipos.map(ipo => this.secClient.analyzeIPO(ipo))
            );

            console.log(`✅ Loaded ${this.enrichedIPOs.length} unique IPOs`);
            
        } catch (error) {
            console.error('❌ Error loading IPO data:', error);
            this.showError('Failed to load IPO data. Please check your Worker URL in sec-api-client.js');
        }
    }

    removeDuplicates(ipos) {
        const seen = new Map();
        return ipos.filter(ipo => {
            const key = `${ipo.cik}-${ipo.companyName}`;
            if (seen.has(key)) {
                return false;
            }
            seen.set(key, true);
            return true;
        });
    }

    renderAll() {
        this.renderAlphyRecommendation();
        this.renderSummaryCards();
        this.renderAnalyticsCharts();
        this.renderHeatmap();
        this.renderPipeline();
        this.renderTopIPOs();
        this.renderLockUpTracker();
    }

    renderAlphyRecommendation() {
        const container = document.getElementById('alphyRecommendation');
        if (!container) return;

        const topIPOs = [...this.enrichedIPOs]
            .sort((a, b) => b.successScore - a.successScore)
            .slice(0, 3);

        if (topIPOs.length === 0) {
            container.innerHTML = '<p style="color: white; text-align: center;">Loading recommendations...</p>';
            return;
        }

        const html = `
            <div class='alphy-recommendation-header'>
                <h2 class='alphy-recommendation-title'>
                    <i class='fas fa-brain'></i> Alphy AI Recommendations
                </h2>
            </div>
            
            <div class='alphy-recommendation-content'>
                <div class='recommendation-grid'>
                    ${topIPOs.map((ipo, index) => this.createRecommendationCard(ipo, index + 1)).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    createRecommendationCard(ipo, rank) {
        const insights = this.generateInsights(ipo);
        
        return `
            <div class='recommendation-card'>
                <div class='recommendation-rank'>${rank}</div>
                <h3 class='recommendation-company'>${ipo.companyName}</h3>
                
                <div class='recommendation-score-badge'>
                    <i class='fas fa-star'></i>
                    <span>Success Score: ${ipo.successScore}/100</span>
                </div>
                
                <div class='recommendation-insights'>
                    ${insights.map(insight => `
                        <div class='insight-item'>
                            <i class='fas fa-check-circle'></i>
                            <span>${insight}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class='recommendation-metrics'>
                    <div class='metric-item'>
                        <span class='metric-label'>Sector</span>
                        <span class='metric-value'>${ipo.sector}</span>
                    </div>
                    <div class='metric-item'>
                        <span class='metric-label'>Filing Stage</span>
                        <span class='metric-value'>${ipo.filingStage}</span>
                    </div>
                    <div class='metric-item'>
                        <span class='metric-label'>Risk/Opp Ratio</span>
                        <span class='metric-value'>${this.calculateRiskOpportunityRatio(ipo)}</span>
                    </div>
                    <div class='metric-item'>
                        <span class='metric-label'>Lock-Up Days</span>
                        <span class='metric-value'>${this.calculateLockUpDays(ipo)}</span>
                    </div>
                </div>
                
                <div class='recommendation-action'>
                    <button class='recommendation-btn' onclick='ipoApp.viewIPODetail(${JSON.stringify(ipo).replace(/'/g, "&apos;")})'>
                        <i class='fas fa-chart-line'></i>
                        View Full Analysis
                    </button>
                </div>
            </div>
        `;
    }

    generateInsights(ipo) {
        const insights = [];
        
        if (ipo.successScore >= 75) {
            insights.push('Exceptionally high success probability');
        } else if (ipo.successScore >= 60) {
            insights.push('Strong potential for successful IPO');
        }
        
        const daysSinceFiling = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceFiling < 30) {
            insights.push('Recently filed - fresh opportunity');
        }
        
        const highGrowthSectors = ['Technology', 'Healthcare', 'Financial Services'];
        if (highGrowthSectors.includes(ipo.sector)) {
            insights.push(`Operating in high-growth ${ipo.sector} sector`);
        }
        
        if (ipo.riskFactors && ipo.riskFactors.length === 0) {
            insights.push('No major red flags detected');
        }
        
        if (ipo.filingStage === 'Initial Filing') {
            insights.push('Early-stage filing - potential upside');
        }
        
        // Ensure at least 3 insights
        if (insights.length < 3) {
            insights.push(`CIK ${ipo.cik} - SEC registered company`);
        }
        
        return insights.slice(0, 4);
    }

    calculateLockUpDays(ipo) {
        const now = Date.now();
        const expiry = new Date(ipo.lockUpExpiry).getTime();
        const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        return daysRemaining < 0 ? 0 : daysRemaining;
    }

    renderSummaryCards() {
        const container = document.getElementById('summaryCards');
        if (!container) return;

        const filteredIPOs = this.applyCurrentFilters();
        const totalIPOs = filteredIPOs.length;
        const avgScore = totalIPOs > 0 
            ? (filteredIPOs.reduce((sum, ipo) => sum + ipo.successScore, 0) / totalIPOs).toFixed(1)
            : 0;
        
        const sectors = {};
        filteredIPOs.forEach(ipo => {
            sectors[ipo.sector] = (sectors[ipo.sector] || 0) + 1;
        });
        const topSector = Object.entries(sectors).sort((a, b) => b[1] - a[1])[0];
        
        const recentIPOs = filteredIPOs.filter(ipo => {
            const days = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
            return days <= 30;
        }).length;

        const html = `
            <div class='eco-card us-card'>
                <div class='eco-card-header'>
                    <div class='eco-card-title-wrapper'>
                        <i class='eco-card-icon fas fa-rocket'></i>
                        <h3 class='eco-card-title'>Total IPOs</h3>
                    </div>
                    <button class='info-btn' onclick='ipoApp.showInfoModal("total-ipos")'>
                        <i class='fas fa-info-circle'></i>
                    </button>
                </div>
                <div class='eco-value'>${totalIPOs}</div>
                <div class='eco-sublabel'>Active filings</div>
            </div>

            <div class='eco-card us-card'>
                <div class='eco-card-header'>
                    <div class='eco-card-title-wrapper'>
                        <i class='eco-card-icon fas fa-star'></i>
                        <h3 class='eco-card-title'>Avg Success Score</h3>
                    </div>
                    <button class='info-btn' onclick='ipoApp.showInfoModal("success-score")'>
                        <i class='fas fa-info-circle'></i>
                    </button>
                </div>
                <div class='eco-value'>${avgScore}</div>
                <div class='eco-sublabel'>Out of 100</div>
            </div>

            <div class='eco-card us-card'>
                <div class='eco-card-header'>
                    <div class='eco-card-title-wrapper'>
                        <i class='eco-card-icon fas fa-industry'></i>
                        <h3 class='eco-card-title'>Top Sector</h3>
                    </div>
                    <button class='info-btn' onclick='ipoApp.showInfoModal("top-sector")'>
                        <i class='fas fa-info-circle'></i>
                    </button>
                </div>
                <div class='eco-value' style='font-size: 1.8rem;'>${topSector ? topSector[0] : 'N/A'}</div>
                <div class='eco-sublabel'>${topSector ? topSector[1] : 0} IPOs</div>
            </div>

            <div class='eco-card us-card'>
                <div class='eco-card-header'>
                    <div class='eco-card-title-wrapper'>
                        <i class='eco-card-icon fas fa-calendar-check'></i>
                        <h3 class='eco-card-title'>Recent (30 days)</h3>
                    </div>
                    <button class='info-btn' onclick='ipoApp.showInfoModal("recent-ipos")'>
                        <i class='fas fa-info-circle'></i>
                    </button>
                </div>
                <div class='eco-value'>${recentIPOs}</div>
                <div class='eco-sublabel'>New filings</div>
            </div>
        `;

        container.innerHTML = html;
    }

    renderAnalyticsCharts() {
        this.renderRiskOpportunityChart();
        this.renderSectorValuationChart();
        this.renderDilutionChart();
    }

    renderRiskOpportunityChart() {
        const filteredIPOs = this.applyCurrentFilters();
        const categories = filteredIPOs.map(ipo => ipo.companyName.substring(0, 20) + '...');
        const data = filteredIPOs.map((ipo, index) => {
            const ratio = parseFloat(this.calculateRiskOpportunityRatio(ipo));
            const colorValue = ratio < 0.5 ? 0 : ratio < 1 ? 1 : 2; // Green, Yellow, Red
            return [index, 0, colorValue];
        });

        Highcharts.chart('riskOpportunityChart', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent',
                height: 400
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                labels: {
                    rotation: -45,
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            yAxis: {
                categories: ['Risk/Opportunity Ratio'],
                title: null,
                labels: {
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            colorAxis: {
                min: 0,
                max: 2,
                stops: [
                    [0, '#10b981'],    // Green (low risk)
                    [0.5, '#f59e0b'],  // Yellow (medium risk)
                    [1, '#ef4444']     // Red (high risk)
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
                formatter: function () {
                    const ipo = filteredIPOs[this.point.x];
                    const ratio = parseFloat(ipoApp.calculateRiskOpportunityRatio(ipo));
                    return `<b>${ipo.companyName}</b><br>Risk/Opp Ratio: <b>${ratio}</b><br>${ratio < 0.5 ? 'Low Risk ✓' : ratio < 1 ? 'Medium Risk' : 'High Risk ⚠'}`;
                }
            },
            series: [{
                name: 'Risk/Opportunity Ratio',
                borderWidth: 2,
                borderColor: '#ffffff',
                data: data,
                dataLabels: {
                    enabled: false
                }
            }],
            credits: { enabled: false }
        });
    }

    renderSectorValuationChart() {
        const filteredIPOs = this.applyCurrentFilters();
        const sectorData = {};
        
        filteredIPOs.forEach(ipo => {
            if (!sectorData[ipo.sector]) {
                sectorData[ipo.sector] = { count: 0, totalScore: 0 };
            }
            sectorData[ipo.sector].count++;
            sectorData[ipo.sector].totalScore += ipo.successScore;
        });

        const categories = Object.keys(sectorData);
        const data = categories.map((sector, index) => {
            const avgScore = sectorData[sector].totalScore / sectorData[sector].count;
            const colorValue = avgScore < 40 ? 2 : avgScore < 65 ? 1 : 0; // Red, Yellow, Green
            return [index, 0, colorValue];
        });

        Highcharts.chart('sectorValuationChart', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent',
                height: 400
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                labels: {
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            yAxis: {
                categories: ['Avg Success Score'],
                title: null,
                labels: {
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            colorAxis: {
                min: 0,
                max: 2,
                stops: [
                    [0, '#10b981'],    // Green (high score)
                    [0.5, '#f59e0b'],  // Yellow (medium score)
                    [1, '#ef4444']     // Red (low score)
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
                formatter: function () {
                    const sector = categories[this.point.x];
                    const avgScore = (sectorData[sector].totalScore / sectorData[sector].count).toFixed(1);
                    return `<b>${sector}</b><br>Avg Score: <b>${avgScore}/100</b><br>IPOs: ${sectorData[sector].count}`;
                }
            },
            series: [{
                name: 'Sector Valuation',
                borderWidth: 2,
                borderColor: '#ffffff',
                data: data,
                dataLabels: {
                    enabled: true,
                    color: '#ffffff',
                    style: { 
                        fontWeight: 'bold',
                        textOutline: '2px contrast'
                    },
                    formatter: function() {
                        const sector = categories[this.point.x];
                        return (sectorData[sector].totalScore / sectorData[sector].count).toFixed(0);
                    }
                }
            }],
            credits: { enabled: false }
        });
    }

    renderDilutionChart() {
        const filteredIPOs = this.applyCurrentFilters();
        const categories = filteredIPOs.slice(0, 20).map(ipo => ipo.companyName.substring(0, 20) + '...');
        const data = filteredIPOs.slice(0, 20).map((ipo, index) => {
            const dilution = this.estimateDilution(ipo);
            const colorValue = dilution < 20 ? 0 : dilution < 30 ? 1 : 2; // Green, Yellow, Red
            return [index, 0, colorValue];
        });

        Highcharts.chart('dilutionChart', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent',
                height: 400
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                labels: {
                    rotation: -45,
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            yAxis: {
                categories: ['Expected Dilution'],
                title: null,
                labels: {
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            colorAxis: {
                min: 0,
                max: 2,
                stops: [
                    [0, '#10b981'],    // Green (low dilution)
                    [0.5, '#f59e0b'],  // Yellow (medium dilution)
                    [1, '#ef4444']     // Red (high dilution)
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
                formatter: function () {
                    const ipo = filteredIPOs[this.point.x];
                    const dilution = ipoApp.estimateDilution(ipo);
                    return `<b>${ipo.companyName}</b><br>Expected Dilution: <b>${dilution}%</b><br>${dilution < 20 ? 'Favorable ✓' : dilution < 30 ? 'Moderate' : 'High ⚠'}`;
                }
            },
            series: [{
                name: 'Shareholder Dilution',
                borderWidth: 2,
                borderColor: '#ffffff',
                data: data,
                dataLabels: {
                    enabled: true,
                    color: '#ffffff',
                    style: { 
                        fontWeight: 'bold',
                        textOutline: '2px contrast'
                    },
                    formatter: function() {
                        const ipo = filteredIPOs[this.point.x];
                        return ipoApp.estimateDilution(ipo) + '%';
                    }
                }
            }],
            credits: { enabled: false }
        });
    }

    renderHeatmap() {
        const filteredIPOs = this.applyCurrentFilters();
        const sectors = {};
        
        filteredIPOs.forEach(ipo => {
            const days = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
            if (days <= this.currentPeriod) {
                sectors[ipo.sector] = (sectors[ipo.sector] || 0) + 1;
            }
        });

        const categories = Object.keys(sectors);
        const data = categories.map((sector, index) => [index, 0, sectors[sector]]);

        Highcharts.chart('heatmapChart', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent',
                height: 400
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                labels: {
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            yAxis: {
                categories: ['IPO Count'],
                title: null,
                labels: {
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            colorAxis: {
                min: 0,
                stops: [
                    [0, '#10b981'],    // Green (low activity)
                    [0.5, '#f59e0b'],  // Yellow (medium activity)
                    [1, '#ef4444']     // Red (high activity)
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
                formatter: function () {
                    return `<b>${this.series.xAxis.categories[this.point.x]}</b><br>IPOs: <b>${this.point.value}</b>`;
                }
            },
            series: [{
                name: 'IPOs by Sector',
                borderWidth: 2,
                borderColor: '#ffffff',
                data: data,
                dataLabels: {
                    enabled: true,
                    color: '#ffffff',
                    style: { 
                        fontWeight: 'bold',
                        textOutline: '2px contrast'
                    }
                }
            }],
            credits: { enabled: false }
        });
    }

    renderPipeline() {
        const container = document.getElementById('ipoPipeline');
        if (!container) return;

        const filteredIPOs = this.applyCurrentFilters();
        const topIPOs = [...filteredIPOs]
            .sort((a, b) => b.successScore - a.successScore)
            .slice(0, 10);

        if (topIPOs.length === 0) {
            container.innerHTML = '<p class="text-center">No IPOs in pipeline</p>';
            return;
        }

        const html = topIPOs.map(ipo => `
            <div class='pipeline-item'>
                <div class='pipeline-header'>
                    <h3 class='pipeline-company'>${ipo.companyName}</h3>
                    <div class='pipeline-score'>
                        <i class='fas fa-star'></i>
                        ${ipo.successScore}
                    </div>
                </div>
                
                <div class='pipeline-details'>
                    <div class='pipeline-detail'>
                        <span class='pipeline-detail-label'>Sector</span>
                        <span class='pipeline-detail-value'>${ipo.sector}</span>
                    </div>
                    <div class='pipeline-detail'>
                        <span class='pipeline-detail-label'>Form Type</span>
                        <span class='pipeline-detail-value'>${ipo.formType}</span>
                    </div>
                    <div class='pipeline-detail'>
                        <span class='pipeline-detail-label'>Filed Date</span>
                        <span class='pipeline-detail-value'>${new Date(ipo.filedDate).toLocaleDateString()}</span>
                    </div>
                    <div class='pipeline-detail'>
                        <span class='pipeline-detail-label'>Stage</span>
                        <span class='pipeline-detail-value'>${ipo.filingStage}</span>
                    </div>
                </div>
                
                <div class='pipeline-actions'>
                    <button class='pipeline-btn' onclick='ipoApp.viewIPODetail(${JSON.stringify(ipo).replace(/'/g, "&apos;")})'>
                        <i class='fas fa-chart-line'></i>
                        View Analysis
                    </button>
                    <button class='pipeline-btn pipeline-btn-secondary' onclick='window.open("${ipo.filingUrl}", "_blank")'>
                        <i class='fas fa-external-link-alt'></i>
                        SEC Filing
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    renderTopIPOs() {
        const tbody = document.querySelector('#topIPOsTable tbody');
        if (!tbody) return;

        const filteredIPOs = this.applyCurrentFilters();
        const topIPOs = [...filteredIPOs]
            .sort((a, b) => b.successScore - a.successScore)
            .slice(0, 20);

        const html = topIPOs.map((ipo, index) => `
            <tr>
                <td><div class='ipo-rank'>${index + 1}</div></td>
                <td>
                    <div class='ipo-company-cell'>
                        <span class='ipo-company-name'>${ipo.companyName}</span>
                        <span class='ipo-company-cik'>CIK: ${ipo.cik || 'N/A'}</span>
                    </div>
                </td>
                <td>
                    <span class='ipo-sector-badge'>
                        <i class='fas fa-industry'></i>
                        ${ipo.sector}
                    </span>
                </td>
                <td>
                    <div class='ipo-score'>
                        <div class='ipo-score-bar'>
                            <div class='ipo-score-fill' style='width: ${ipo.successScore}%'></div>
                        </div>
                        <span class='ipo-score-value'>${ipo.successScore}</span>
                    </div>
                </td>
                <td>${new Date(ipo.filedDate).toLocaleDateString()}</td>
                <td>
                    <span class='ipo-stage-badge ${ipo.filingStage.includes('Initial') ? 'stage-initial' : ipo.filingStage.includes('Amendment') ? 'stage-amendment' : 'stage-final'}'>
                        ${ipo.filingStage}
                    </span>
                </td>
                <td>
                    <button class='ipo-action-btn' onclick='ipoApp.viewIPODetail(${JSON.stringify(ipo).replace(/'/g, "&apos;")})'>
                        <i class='fas fa-eye'></i>
                        View
                    </button>
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = html || '<tr><td colspan="7" class="text-center">No data available</td></tr>';
    }

    renderLockUpTracker() {
        const container = document.getElementById('lockupGrid');
        if (!container) return;

        const filteredIPOs = this.applyCurrentFilters();
        const lockUpIPOs = filteredIPOs
            .filter(ipo => ipo.lockUpExpiry)
            .slice(0, 12);

        const html = lockUpIPOs.map(ipo => {
            const now = Date.now();
            const expiry = new Date(ipo.lockUpExpiry).getTime();
            const filed = new Date(ipo.filedDate).getTime();
            const progress = Math.min(100, ((now - filed) / (expiry - filed)) * 100);
            
            const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
            const status = daysRemaining < 0 ? 'expired' : daysRemaining < 30 ? 'expiring' : 'active';

            return `
                <div class='lockup-card'>
                    <div class='lockup-header'>
                        <h3 class='lockup-company'>${ipo.companyName}</h3>
                        <span class='lockup-status lockup-${status}'>
                            <i class='fas ${status === 'expired' ? 'fa-unlock' : 'fa-lock'}'></i>
                            ${status === 'expired' ? 'Expired' : status === 'expiring' ? 'Expiring Soon' : 'Active'}
                        </span>
                    </div>
                    
                    <div class='lockup-progress'>
                        <div class='lockup-progress-bar'>
                            <div class='lockup-progress-fill' style='width: ${progress}%'></div>
                        </div>
                        <div class='lockup-dates'>
                            <span>${new Date(ipo.filedDate).toLocaleDateString()}</span>
                            <span>${new Date(ipo.lockUpExpiry).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div class='lockup-info'>
                        <div class='lockup-info-item'>
                            <span class='lockup-info-label'>Days Remaining</span>
                            <span class='lockup-info-value'>${daysRemaining < 0 ? 0 : daysRemaining}</span>
                        </div>
                        <div class='lockup-info-item'>
                            <span class='lockup-info-label'>Success Score</span>
                            <span class='lockup-info-value'>${ipo.successScore}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html || '<p class="text-center">No lock-up data available</p>';
    }

    viewIPODetail(ipo) {
        const modal = document.getElementById('ipoDetailModal');
        const title = document.getElementById('ipoModalTitle');
        const body = document.getElementById('ipoModalBody');

        title.textContent = `${ipo.companyName} - IPO Analysis`;
        
        body.innerHTML = `
            <div style='padding: 20px 0;'>
                <h3 class='gradient-title' style='margin-bottom: 20px;'>
                    <i class='fas fa-chart-line'></i> Company Overview
                </h3>
                
                <div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px;'>
                    <div>
                        <strong>Company:</strong><br>${ipo.companyName}
                    </div>
                    <div>
                        <strong>CIK:</strong><br>${ipo.cik || 'N/A'}
                    </div>
                    <div>
                        <strong>Sector:</strong><br>${ipo.sector}
                    </div>
                    <div>
                        <strong>Success Score:</strong><br><span class='gradient-title' style='font-size: 1.5rem;'>${ipo.successScore}/100</span>
                    </div>
                </div>
                
                <h3 class='gradient-title' style='margin: 32px 0 20px;'>
                    <i class='fas fa-brain'></i> Advanced Analytics
                </h3>
                
                <div style='background: var(--eco-gradient-soft); padding: 24px; border-radius: 12px; margin-bottom: 20px;'>
                    <div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;'>
                        <div>
                            <h4 class='gradient-title' style='margin-bottom: 8px;'>Risk/Opportunity Ratio</h4>
                            <p style='font-size: 1.3rem; font-weight: 800;'>${this.calculateRiskOpportunityRatio(ipo)}</p>
                            <small style='color: var(--text-tertiary);'>Lower is better (more opportunity vs risk)</small>
                        </div>
                        <div>
                            <h4 class='gradient-title' style='margin-bottom: 8px;'>Sector Valuation</h4>
                            <p style='font-size: 1.3rem; font-weight: 800;'>${this.calculateSectorValuation(ipo)}</p>
                            <small style='color: var(--text-tertiary);'>Relative to sector peers</small>
                        </div>
                        <div>
                            <h4 class='gradient-title' style='margin-bottom: 8px;'>Dilution Estimate</h4>
                            <p style='font-size: 1.3rem; font-weight: 800;'>${this.estimateDilution(ipo)}%</p>
                            <small style='color: var(--text-tertiary);'>Expected shareholder dilution</small>
                        </div>
                        <div>
                            <h4 class='gradient-title' style='margin-bottom: 8px;'>Filing Momentum</h4>
                            <p style='font-size: 1.3rem; font-weight: 800;'>${this.calculateFilingMomentum(ipo)}</p>
                            <small style='color: var(--text-tertiary);'>Speed of progress to IPO</small>
                        </div>
                    </div>
                </div>
                
                <h3 class='gradient-title' style='margin: 32px 0 20px;'>
                    <i class='fas fa-file-alt'></i> Filing Information
                </h3>
                
                <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin-bottom: 20px;'>
                    <p><strong>Form Type:</strong> ${ipo.formType}</p>
                    <p><strong>Filing Stage:</strong> ${ipo.filingStage}</p>
                    <p><strong>Filed Date:</strong> ${new Date(ipo.filedDate).toLocaleDateString()}</p>
                    <p><strong>Accession Number:</strong> ${ipo.accessionNumber || 'N/A'}</p>
                    <p><strong>Lock-Up Expiry:</strong> ${new Date(ipo.lockUpExpiry).toLocaleDateString()}</p>
                </div>
                
                ${ipo.riskFactors && ipo.riskFactors.length > 0 ? `
                <h3 class='gradient-title' style='margin: 32px 0 20px;'>
                    <i class='fas fa-exclamation-triangle'></i> Risk Factors
                </h3>
                <ul style='list-style: none; padding: 0;'>
                    ${ipo.riskFactors.map(risk => `
                        <li style='background: rgba(239, 68, 68, 0.1); padding: 12px; border-left: 4px solid var(--eco-danger); margin-bottom: 8px; border-radius: 8px;'>
                            <i class='fas fa-exclamation-circle'></i> ${risk}
                        </li>
                    `).join('')}
                </ul>
                ` : ''}
                
                <div style='margin-top: 32px; text-align: center;'>
                    <a href='${ipo.filingUrl}' target='_blank' class='dashboard-btn' style='display: inline-flex;'>
                        <i class='fas fa-external-link-alt'></i>
                        <span>View SEC Filing</span>
                    </a>
                </div>
            </div>
        `;

        this.openModal('ipoDetailModal');
    }

    calculateRiskOpportunityRatio(ipo) {
        const riskCount = (ipo.riskFactors && ipo.riskFactors.length) || 1;
        const opportunityScore = ipo.successScore;
        const ratio = (riskCount / (opportunityScore / 10)).toFixed(2);
        return ratio;
    }

    calculateSectorValuation(ipo) {
        const sectorMultipliers = {
            'Technology': 'Premium (+20%)',
            'Healthcare': 'Above Average (+10%)',
            'Financial Services': 'Market Rate (0%)',
            'Energy': 'Below Average (-10%)',
            'Consumer': 'Market Rate (0%)',
            'Real Estate': 'Below Average (-5%)',
            'Industrials': 'Market Rate (0%)',
            'Other': 'Variable'
        };
        return sectorMultipliers[ipo.sector] || 'N/A';
    }

    estimateDilution(ipo) {
        let baseDilution = 20;
        if (ipo.filingStage === 'Amendment') baseDilution += 5;
        if (ipo.successScore < 50) baseDilution += 10;
        return Math.min(40, baseDilution);
    }

    calculateFilingMomentum(ipo) {
        const daysSinceFiling = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
        if (daysSinceFiling < 30) return 'Very Fast ⚡';
        if (daysSinceFiling < 90) return 'Fast 🚀';
        if (daysSinceFiling < 180) return 'Moderate ✓';
        return 'Slow 🐌';
    }

    applyCurrentFilters() {
        return this.enrichedIPOs.filter(ipo => {
            if (this.filters.sectors.length > 0 && !this.filters.sectors.includes(ipo.sector)) {
                return false;
            }
            
            if (ipo.successScore < this.filters.scoreMin || ipo.successScore > this.filters.scoreMax) {
                return false;
            }
            
            if (this.filters.stages.length > 0 && !this.filters.stages.includes(ipo.filingStage)) {
                return false;
            }
            
            return true;
        });
    }

    applyFilters() {
        this.filters.sectors = Array.from(document.querySelectorAll('[data-sector].active'))
            .map(btn => btn.dataset.sector);
        
        this.filters.scoreMin = parseInt(document.getElementById('scoreMin')?.value || 0);
        this.filters.scoreMax = parseInt(document.getElementById('scoreMax')?.value || 100);
        
        this.filters.stages = Array.from(document.querySelectorAll('[data-stage].active'))
            .map(btn => btn.dataset.stage);
        
        console.log('🔍 Filters applied:', this.filters);
        
        this.renderAll();
        this.closeModal('filtersModal');
    }

    resetFilters() {
        this.filters = {
            sectors: [],
            scoreMin: 0,
            scoreMax: 100,
            stages: []
        };
        
        document.querySelectorAll('.filter-btn.active').forEach(btn => btn.classList.remove('active'));
        if (document.getElementById('scoreMin')) document.getElementById('scoreMin').value = 0;
        if (document.getElementById('scoreMax')) document.getElementById('scoreMax').value = 100;
        
        this.renderAll();
        this.closeModal('filtersModal');
    }

    showInfoModal(section) {
        const modal = document.getElementById('infoModal');
        const title = document.getElementById('infoModalTitle');
        const body = document.getElementById('infoModalBody');

        const infoContent = {
            'total-ipos': {
                title: 'Total IPOs',
                content: `
                    <p>This metric shows the total number of Initial Public Offering (IPO) filings currently tracked in our system.</p>
                    <h4>Data Source:</h4>
                    <p>SEC EDGAR database - includes S-1 (US companies), F-1 (foreign companies), and their amendments.</p>
                    <h4>Why it matters:</h4>
                    <p>A higher number indicates increased IPO activity in the market, which can signal investor confidence and economic growth.</p>
                `
            },
            'success-score': {
                title: 'Success Score',
                content: `
                    <p>Our proprietary AI-powered success score (0-100) predicts the likelihood of a successful IPO based on multiple factors.</p>
                    <h4>Factors analyzed:</h4>
                    <ul>
                        <li>Filing recency (recent filings score higher)</li>
                        <li>Form type (original S-1/F-1 vs amendments)</li>
                        <li>Industry sector (tech, healthcare score higher)</li>
                        <li>Summary detail level (more detailed = better prepared)</li>
                        <li>Risk factors identified</li>
                    </ul>
                    <h4>Score interpretation:</h4>
                    <p><strong>75-100:</strong> Exceptional potential<br>
                    <strong>60-74:</strong> Strong potential<br>
                    <strong>40-59:</strong> Moderate potential<br>
                    <strong>0-39:</strong> Higher risk</p>
                `
            },
            'top-sector': {
                title: 'Top Sector',
                content: `
                    <p>The industry sector with the highest number of IPO filings currently active.</p>
                    <h4>Sector classification:</h4>
                    <p>Companies are automatically classified into sectors based on keywords in their name and business description.</p>
                    <h4>Why it matters:</h4>
                    <p>Dominant sectors indicate where investor capital is flowing and which industries are experiencing the most growth and innovation.</p>
                `
            },
            'recent-ipos': {
                title: 'Recent IPOs (30 days)',
                content: `
                    <p>Number of new IPO filings submitted to the SEC in the last 30 days.</p>
                    <h4>Why track recent filings:</h4>
                    <ul>
                        <li>Indicates current market sentiment</li>
                        <li>Early-stage opportunities for investors</li>
                        <li>Market timing indicators</li>
                    </ul>
                    <h4>Typical timeline:</h4>
                    <p>From initial S-1 filing to actual IPO typically takes 3-6 months, though it can vary significantly.</p>
                `
            },
            'heatmap': {
                title: 'IPO Heatmap by Sector',
                content: `
                    <p>Visual representation of IPO activity across different industry sectors.</p>
                    <h4>How to read:</h4>
                    <ul>
                        <li><span style="color: #10b981;">●</span> Green = Low activity (fewer IPOs)</li>
                        <li><span style="color: #f59e0b;">●</span> Yellow = Medium activity</li>
                        <li><span style="color: #ef4444;">●</span> Red = High activity (many IPOs)</li>
                        <li>Each cell shows the count of IPOs in that sector</li>
                        <li>Filter by time period (30, 90, 180, 365 days)</li>
                    </ul>
                    <h4>Strategic use:</h4>
                    <p>Identify trending sectors and potential sector rotation opportunities.</p>
                `
            },
            'pipeline': {
                title: 'IPO Pipeline',
                content: `
                    <p>A curated list of top IPO candidates ranked by our success score algorithm.</p>
                    <h4>Information provided:</h4>
                    <ul>
                        <li>Company name and sector</li>
                        <li>Form type and filing stage</li>
                        <li>Filed date</li>
                        <li>Success score</li>
                        <li>Direct link to SEC filing</li>
                    </ul>
                    <h4>Use cases:</h4>
                    <p>Track promising IPOs from filing to launch, analyze competitive landscape, identify investment opportunities early.</p>
                `
            },
            'lockup': {
                title: 'Lock-Up Period Tracker',
                content: `
                    <p>Tracks when IPO lock-up periods are set to expire.</p>
                    <h4>What is a lock-up period:</h4>
                    <p>A lock-up period (typically 180 days) prevents company insiders from selling their shares immediately after an IPO.</p>
                    <h4>Why it matters:</h4>
                    <ul>
                        <li>Lock-up expiration can trigger sell-offs</li>
                        <li>Price volatility often increases near expiration</li>
                        <li>Strategic timing for entry/exit points</li>
                    </ul>
                    <h4>Our estimates:</h4>
                    <p>Based on typical 180-day lock-up periods from estimated IPO date (filing date + 30 days).</p>
                `
            },
            's1-f1': {
                title: 'SEC Form Types Explained',
                content: `
                    <h4><strong>Form S-1 (US Companies)</strong></h4>
                    <p>The <strong>S-1</strong> is the initial registration statement filed with the SEC by <strong>U.S.-based companies</strong> preparing for an IPO. It contains:</p>
                    <ul>
                        <li>Business description and strategy</li>
                        <li>Financial statements (3+ years)</li>
                        <li>Risk factors</li>
                        <li>Use of proceeds</li>
                        <li>Management and ownership structure</li>
                    </ul>
                    
                    <h4 style="margin-top: 20px;"><strong>Form F-1 (Foreign Companies)</strong></h4>
                    <p>The <strong>F-1</strong> is used by <strong>foreign companies</strong> registering securities in the U.S. Similar to S-1 but includes:</p>
                    <ul>
                        <li>Disclosure of foreign jurisdiction laws</li>
                        <li>Currency exchange considerations</li>
                        <li>International accounting standards reconciliation</li>
                    </ul>
                    
                    <h4 style="margin-top: 20px;"><strong>Amendments (S-1/A, F-1/A)</strong></h4>
                    <p>Forms ending with <strong>/A</strong> (e.g., S-1/A, F-1/A) are <strong>amendments</strong> to the original filing. Companies file amendments to:</p>
                    <ul>
                        <li>Update financial information</li>
                        <li>Address SEC comments</li>
                        <li>Revise pricing range</li>
                        <li>Add or clarify risk factors</li>
                    </ul>
                    <p><strong>Multiple amendments are normal</strong> and often indicate progress toward finalizing the IPO.</p>
                `
            },
            'filing-stage': {
                title: 'Filing Stages Explained',
                content: `
                    <h4><strong>Initial Filing</strong></h4>
                    <p>The company has just submitted its <strong>first S-1 or F-1 form</strong> to the SEC. This is the earliest public signal of an IPO.</p>
                    <ul>
                        <li><strong>Timeline:</strong> 3-6 months from IPO</li>
                        <li><strong>Risk:</strong> Higher (may not complete)</li>
                        <li><strong>Opportunity:</strong> Early visibility</li>
                    </ul>
                    
                    <h4 style="margin-top: 20px;"><strong>Amendment</strong></h4>
                    <p>The company has filed one or more amendments (S-1/A, F-1/A). This indicates:</p>
                    <ul>
                        <li>Active dialogue with SEC</li>
                        <li>Refinement of offering details</li>
                        <li>Progress toward approval</li>
                    </ul>
                    <p><strong>More amendments = closer to IPO</strong> (typically 4-7 amendments before finalization).</p>
                    
                    <h4 style="margin-top: 20px;"><strong>Final Prospectus (424B4)</strong></h4>
                    <p>The <strong>424B4</strong> form is the <strong>final prospectus</strong> filed after pricing. This means:</p>
                    <ul>
                        <li>SEC approval obtained</li>
                        <li>Final price and share count determined</li>
                        <li>IPO is imminent (often within days)</li>
                    </ul>
                    <p><strong>This is the last step before trading begins.</strong></p>
                    
                    <h4 style="margin-top: 20px;"><strong>Typical IPO Timeline:</strong></h4>
                    <p style="background: var(--eco-gradient-soft); padding: 15px; border-radius: 8px; margin-top: 12px;">
                        <strong>Day 0:</strong> Initial S-1/F-1 filed<br>
                        <strong>Days 30-90:</strong> Amendments filed (SEC review)<br>
                        <strong>Days 90-120:</strong> Roadshow & pricing<br>
                        <strong>Day 120+:</strong> 424B4 filed → IPO launch
                    </p>
                `
            }
        };

        const info = infoContent[section] || { title: 'Information', content: '<p>No information available.</p>' };
        
        title.textContent = info.title;
        body.innerHTML = info.content;
        
        this.openModal('infoModal');
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    }

    showError(message) {
        console.error('❌', message);
        alert(message);
    }
}

// Initialize app
let ipoApp;
document.addEventListener('DOMContentLoaded', () => {
    ipoApp = new IPOIntelligenceDashboard();
});