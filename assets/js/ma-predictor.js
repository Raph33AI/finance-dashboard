/**
 * ═══════════════════════════════════════════════════════════════════
 * 🤝 M&A PREDICTOR - VERSION WITH CONFIG PANEL V2
 * ═══════════════════════════════════════════════════════════════════
 * ✅ CORRECTIONS V2:
 * - Added configuration panel before loading (like IPO Intelligence)
 * - User selects period + max filings before analysis
 * - Loading indicator with progress
 * - Dataset info bar with reconfigure button
 * - Enhanced error handling
 * ═══════════════════════════════════════════════════════════════════
 */

class MAPredictor {
    constructor(config = {}) {
        this.workerURL = config.workerURL || 'https://sec-edgar-api.raphnardone.workers.dev';
        this.client = new SECMAClient({ workerURL: this.workerURL });
        
        this.state = {
            currentDeals: [],
            filteredDeals: [],
            currentPage: 1,
            itemsPerPage: 20,
            totalPages: 1,
            filters: {
                period: 30,
                maxFilings: 250
            },
            isLoading: false,
            topRecommendations: []
        };

        // ✅ CONFIGURATION UTILISATEUR
        this.userConfig = {
            period: 30,
            maxFilings: 250
        };

        this.init();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎬 INITIALIZATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async init() {
        console.log('🤝 M&A Predictor initializing...');
        
        this.setupEventListeners();
        this.showConfigPanel();
        
        console.log('✅ M&A Predictor ready');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ CONFIG PANEL MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    showConfigPanel() {
        const panel = document.getElementById('dataLoaderPanel');
        const dashboard = document.getElementById('dashboardContent');
        
        if (panel) panel.style.display = 'flex';
        if (dashboard) dashboard.style.display = 'none';
        
        this.updateEstimatedTime();
    }

    hidePanelAndShowDashboard() {
        const panel = document.getElementById('dataLoaderPanel');
        const dashboard = document.getElementById('dashboardContent');
        
        if (panel) panel.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
    }

    updateEstimatedTime() {
        const filingsSelect = document.getElementById('configFilingsSelect');
        const timeEstimate = document.getElementById('estimatedTime');
        
        if (!filingsSelect || !timeEstimate) return;
        
        const count = parseInt(filingsSelect.value);
        
        let estimate = '~5-10 seconds';
        if (count <= 100) estimate = '~3-5 seconds';
        else if (count <= 250) estimate = '~5-10 seconds';
        else if (count <= 500) estimate = '~10-15 seconds';
        else if (count <= 1000) estimate = '~15-30 seconds';
        else estimate = '~30-60 seconds';
        
        timeEstimate.textContent = estimate;
    }

    async startAnalysis() {
        const periodSelect = document.getElementById('configPeriodSelect');
        const filingsSelect = document.getElementById('configFilingsSelect');
        
        if (!periodSelect || !filingsSelect) {
            console.error('❌ Config elements not found');
            return;
        }

        const period = parseInt(periodSelect.value);
        const maxFilings = parseInt(filingsSelect.value);
        
        console.log(`🎯 User selected: ${period} days, ${maxFilings} max filings`);
        
        this.userConfig.period = period;
        this.userConfig.maxFilings = maxFilings;
        
        this.state.filters.period = period;
        this.state.filters.maxFilings = maxFilings;
        
        this.hidePanelAndShowDashboard();
        
        await this.loadData();
    }

    updateDatasetInfoDisplay() {
        const infoElement = document.getElementById('datasetInfo');
        if (!infoElement) return;
        
        if (this.state.currentDeals.length === 0) {
            infoElement.innerHTML = '<i class="fas fa-database"></i> No data loaded';
            return;
        }
        
        const period = this.userConfig.period;
        const dealsCount = this.state.currentDeals.length;
        
        infoElement.innerHTML = `
            <i class="fas fa-database"></i> 
            <strong>${dealsCount} M&A deals</strong> loaded 
            | <i class="fas fa-calendar-alt"></i> 
            Period: <strong>${period} days</strong>
            | <i class="fas fa-file-alt"></i>
            <strong>S-4 + 8-K filings</strong>
        `;
    }

    setupEventListeners() {
        // ✅ CONFIG PANEL EVENTS
        const configAnalyzeBtn = document.getElementById('configAnalyzeBtn');
        if (configAnalyzeBtn) {
            configAnalyzeBtn.addEventListener('click', () => this.startAnalysis());
        }

        const configFilingsSelect = document.getElementById('configFilingsSelect');
        if (configFilingsSelect) {
            configFilingsSelect.addEventListener('change', () => this.updateEstimatedTime());
        }

        const reconfigureBtn = document.getElementById('reconfigureBtn');
        if (reconfigureBtn) {
            reconfigureBtn.addEventListener('click', () => this.showConfigPanel());
        }

        const refreshDataBtn = document.getElementById('refreshData');
        if (refreshDataBtn) {
            refreshDataBtn.addEventListener('click', () => {
                if (this.state.currentDeals.length > 0) {
                    this.loadData();
                } else {
                    this.showToast('⚠ Please configure analysis first');
                    this.showConfigPanel();
                }
            });
        }

        // PAGINATION
        const prevBtn = document.getElementById('btn-prev-page');
        const nextBtn = document.getElementById('btn-next-page');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.changePage(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.changePage(1));

        // MODALS
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeDealModal();
                this.closeModal('filtersInfo');
            }
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 DATA LOADING WITH AI SCORING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async loadData() {
        if (this.state.isLoading) {
            console.log('⚠ Already loading data...');
            return;
        }

        console.log(`📊 Loading data: ${this.state.filters.period} days, max ${this.state.filters.maxFilings} filings`);
        
        this.state.isLoading = true;
        this.showLoadingIndicator(true);
        
        try {
            this.updateProgress('Connecting to SEC EDGAR...');
            
            const [s4Data, eightKData] = await Promise.all([
                this.loadS4Filings(),
                this.load8KFilings()
            ]);

            let allDeals = [...s4Data, ...eightKData];
            
            this.updateProgress('Calculating AI probability scores...');
            allDeals = await this.calculateAIScores(allDeals);

            allDeals.sort((a, b) => (b.aiScore?.score || 0) - (a.aiScore?.score || 0));

            this.state.currentDeals = allDeals;
            this.state.filteredDeals = [...allDeals];
            this.state.totalPages = Math.ceil(this.state.filteredDeals.length / this.state.itemsPerPage);
            this.state.currentPage = 1;

            this.state.topRecommendations = allDeals.slice(0, 6);

            this.updateProgress(`Loaded ${this.state.currentDeals.length} filings with AI scores!`);

            setTimeout(() => {
                this.showLoadingIndicator(false);
                this.renderResults();
                this.updateDatasetInfoDisplay();
                this.showToast(`✅ Successfully loaded ${this.state.currentDeals.length} M&A filings!`);
            }, 500);

        } catch (error) {
            console.error('❌ Data loading failed:', error);
            this.showLoadingIndicator(false);
            this.showToast(`❌ Failed to load data: ${error.message}`);
        } finally {
            this.state.isLoading = false;
        }
    }

    async loadS4Filings() {
        this.updateProgress('Loading S-4 merger filings...');
        
        try {
            const response = await this.client.getRecentDeals({
                days: this.state.filters.period,
                minValue: 0
            });

            const deals = response.deals || [];
            
            this.updateProgress(`Loaded ${deals.length} S-4 filings...`);
            
            return deals.map(deal => ({
                ...deal,
                formType: 'S-4',
                source: 'S-4',
                description: deal.dealType || 'Merger/Acquisition',
                url: this.buildSECUrl(deal.cik, deal.accessionNumber),
                filedDate: deal.filedDate || this.client.extractFilingDate(deal)
            }));

        } catch (error) {
            console.error('❌ S-4 loading failed:', error);
            return [];
        }
    }

    async load8KFilings() {
        this.updateProgress('Loading 8-K material events...');
        
        try {
            const response = await this.client.get8KAlerts(
                ['1.01', '2.01', '2.03', '5.02', '8.01'],
                this.state.filters.period
            );

            const alerts = response.alerts || [];
            
            this.updateProgress(`Loaded ${alerts.length} 8-K filings...`);
            
            return alerts.map(alert => ({
                ...alert,
                formType: '8-K',
                source: '8-K',
                description: this.get8KDescription(alert.items),
                url: this.buildSECUrl(alert.cik, alert.accessionNumber),
                filedDate: alert.filedDate || this.client.extractFilingDate(alert)
            }));

        } catch (error) {
            console.error('❌ 8-K loading failed:', error);
            return [];
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🤖 AI SCORING ENGINE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async calculateAIScores(deals) {
        console.log('🤖 Calculating AI scores for', deals.length, 'deals...');
        
        for (let i = 0; i < deals.length; i++) {
            deals[i].aiScore = this.calculateDealScore(deals[i], deals);
        }
        
        return deals;
    }

    calculateDealScore(deal, allDeals) {
        const factors = {
            formTypeRelevance: this.scoreFormType(deal),
            recency: this.scoreRecency(deal),
            companyActivity: this.scoreCompanyActivity(deal, allDeals),
            filingComplexity: this.scoreFilingComplexity(deal),
            keywordSignals: this.scoreKeywordSignals(deal),
            itemRelevance: this.scoreItemRelevance(deal)
        };

        const weights = {
            formTypeRelevance: 30,
            recency: 20,
            companyActivity: 15,
            filingComplexity: 15,
            keywordSignals: 15,
            itemRelevance: 5
        };

        let totalScore = 0;
        let totalWeight = 0;

        for (const [factor, value] of Object.entries(factors)) {
            const weight = weights[factor] || 0;
            totalScore += value * weight;
            totalWeight += weight;
        }

        const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

        let confidence = 'LOW';
        let color = '#6b7280';
        
        if (finalScore >= 75) {
            confidence = 'HIGH';
            color = '#10b981';
        } else if (finalScore >= 50) {
            confidence = 'MEDIUM';
            color = '#f59e0b';
        }

        return {
            score: finalScore,
            confidence,
            color,
            factors,
            breakdown: this.generateScoreBreakdown(factors, weights)
        };
    }

    scoreFormType(deal) {
        const formType = deal.formType?.toUpperCase() || '';
        
        if (formType === 'S-4') return 100;
        if (formType === '8-K' && deal.items?.includes('2.01')) return 90;
        if (formType === '8-K' && deal.items?.includes('1.01')) return 80;
        if (formType === '8-K' && deal.items?.includes('5.02')) return 60;
        if (formType === '8-K') return 50;
        
        return 30;
    }

    scoreRecency(deal) {
        if (!deal.filedDate) return 30;
        
        const filedDate = new Date(deal.filedDate);
        const now = new Date();
        const daysAgo = Math.floor((now - filedDate) / (1000 * 60 * 60 * 24));

        if (daysAgo <= 7) return 100;
        if (daysAgo <= 14) return 90;
        if (daysAgo <= 30) return 75;
        if (daysAgo <= 60) return 55;
        if (daysAgo <= 90) return 35;
        
        return 15;
    }

    scoreCompanyActivity(deal, allDeals) {
        const companyCIK = deal.cik;
        const companyFilings = allDeals.filter(d => d.cik === companyCIK);
        const count = companyFilings.length;

        if (count >= 5) return 95;
        if (count >= 3) return 75;
        if (count >= 2) return 55;
        
        return 35;
    }

    scoreFilingComplexity(deal) {
        const summary = deal.summary || deal.description || '';
        const length = summary.length;

        if (length > 500) return 90;
        if (length > 300) return 75;
        if (length > 150) return 60;
        if (length > 50) return 40;
        
        return 20;
    }

    scoreKeywordSignals(deal) {
        const text = ((deal.summary || '') + ' ' + (deal.description || '')).toLowerCase();
        
        const highValueKeywords = [
            'merger', 'acquisition', 'acquire', 'purchased', 'bought',
            'definitive agreement', 'tender offer', 'takeover',
            'combination', 'consolidation', 'amalgamation'
        ];
        
        const mediumValueKeywords = [
            'strategic', 'investment', 'partnership', 'joint venture',
            'equity stake', 'controlling interest', 'majority stake'
        ];
        
        const lowValueKeywords = [
            'agreement', 'transaction', 'deal', 'purchase', 'contract'
        ];

        let score = 0;
        
        for (const keyword of highValueKeywords) {
            if (text.includes(keyword)) score += 12;
        }
        
        for (const keyword of mediumValueKeywords) {
            if (text.includes(keyword)) score += 6;
        }
        
        for (const keyword of lowValueKeywords) {
            if (text.includes(keyword)) score += 2;
        }

        return Math.min(score, 100);
    }

    scoreItemRelevance(deal) {
        if (deal.formType !== '8-K' || !deal.items) return 50;
        
        const items = Array.isArray(deal.items) ? deal.items : [deal.items];
        
        if (items.includes('2.01')) return 100;
        if (items.includes('1.01')) return 90;
        if (items.includes('5.02')) return 70;
        if (items.includes('2.03')) return 60;
        
        return 40;
    }

    generateScoreBreakdown(factors, weights) {
        return Object.entries(factors).map(([factor, value]) => ({
            factor: this.humanizeFactorName(factor),
            value,
            weight: weights[factor] || 0,
            contribution: Math.round(value * (weights[factor] || 0) / 100)
        })).sort((a, b) => b.contribution - a.contribution);
    }

    humanizeFactorName(factor) {
        const names = {
            formTypeRelevance: 'Form Type Relevance',
            recency: 'Filing Recency',
            companyActivity: 'Company Activity Level',
            filingComplexity: 'Filing Detail Level',
            keywordSignals: 'M&A Keyword Signals',
            itemRelevance: '8-K Item Relevance'
        };
        return names[factor] || factor;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 RENDER RESULTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    renderResults() {
        this.renderAIRecommendations();
        this.renderDealsTable();
        this.showSections();
    }

    renderAIRecommendations() {
        const container = document.getElementById('recommendations-container');
        
        if (!container) {
            console.warn('⚠ Recommendations container not found');
            return;
        }

        const topDeals = this.state.topRecommendations;
        
        if (topDeals.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <p>No high-probability deals found.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = topDeals.map((deal, index) => `
            <div class='recommendation-card' onclick='maPredictor.viewDealDetails(${this.state.currentDeals.indexOf(deal)})'>
                <div class='recommendation-header'>
                    <div>
                        <div class='recommendation-company'>${this.truncate(deal.companyName || 'Unknown Company', 30)}</div>
                        <span class='${this.getRecommendationBadgeClass(deal.aiScore.score)}'>${deal.aiScore.confidence} PROBABILITY</span>
                    </div>
                    <div style='text-align: right;'>
                        <div class='recommendation-score'>${deal.aiScore.score}</div>
                        <div class='recommendation-score-label'>AI Score</div>
                    </div>
                </div>
                
                <div class='recommendation-metrics'>
                    <div class='metric-row'>
                        <span class='metric-label'>Form Type</span>
                        <span class='metric-value'>${deal.formType}</span>
                    </div>
                    <div class='metric-row'>
                        <span class='metric-label'>Filed Date</span>
                        <span class='metric-value'>${this.formatDate(deal.filedDate)}</span>
                    </div>
                    <div class='metric-row'>
                        <span class='metric-label'>CIK</span>
                        <span class='metric-value'>${deal.cik}</span>
                    </div>
                    <div class='metric-row'>
                        <span class='metric-label'>Top Signal</span>
                        <span class='metric-value'>${deal.aiScore.breakdown[0]?.factor || 'N/A'}</span>
                    </div>
                </div>
                
                <div style='margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--glass-border);'>
                    <div style='font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;'>
                        ${this.truncate(deal.description || deal.summary || 'No description available', 120)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    getRecommendationBadgeClass(score) {
        if (score >= 75) return 'recommendation-badge badge-high-probability';
        if (score >= 50) return 'recommendation-badge badge-medium-probability';
        return 'recommendation-badge badge-monitoring';
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📋 TABLE RENDERING & PAGINATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    renderDealsTable() {
        const tbody = document.getElementById('ma-deals-tbody');
        const badge = document.getElementById('deals-count-badge');
        
        if (!tbody) {
            console.error('❌ Table body (ma-deals-tbody) not found');
            return;
        }

        if (badge) {
            badge.textContent = this.state.filteredDeals.length;
        }

        tbody.innerHTML = '';

        const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const endIndex = Math.min(startIndex + this.state.itemsPerPage, this.state.filteredDeals.length);
        
        const pageDeals = this.state.filteredDeals.slice(startIndex, endIndex);

        if (pageDeals.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <i class="fas fa-inbox" style="font-size: 3rem; opacity: 0.3;"></i>
                        <p style="margin-top: 20px; opacity: 0.6;">No M&A deals found for selected filters</p>
                    </td>
                </tr>
            `;
            return;
        }

        pageDeals.forEach((deal, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(deal.filedDate)}</td>
                <td>
                    <strong>${deal.companyName || 'Unknown Company'}</strong><br>
                    <small style="opacity: 0.7;">CIK: ${deal.cik}</small>
                </td>
                <td><span class="form-badge form-${deal.formType.toLowerCase()}">${deal.formType}</span></td>
                <td>${this.truncate(deal.description, 80)}</td>
                <td>
                    <span class='score-badge ${this.getScoreBadgeClass(deal.aiScore.score)}'>
                        <i class='fas fa-brain'></i> ${deal.aiScore.score}
                    </span>
                </td>
                <td>
                    <button class="btn-action" onclick="maPredictor.viewDealDetails(${startIndex + index})">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.updatePagination();
    }

    getScoreBadgeClass(score) {
        if (score >= 75) return 'score-high';
        if (score >= 50) return 'score-medium';
        return 'score-low';
    }

    changePage(direction) {
        const newPage = this.state.currentPage + direction;
        
        if (newPage < 1 || newPage > this.state.totalPages) {
            return;
        }

        this.state.currentPage = newPage;
        this.renderDealsTable();
        
        document.getElementById('ma-deals-section')?.scrollIntoView({ behavior: 'smooth' });
    }

    updatePagination() {
        const prevBtn = document.getElementById('btn-prev-page');
        const nextBtn = document.getElementById('btn-next-page');
        const info = document.getElementById('pagination-info');

        if (!prevBtn || !nextBtn || !info) return;

        prevBtn.disabled = this.state.currentPage === 1;
        nextBtn.disabled = this.state.currentPage === this.state.totalPages;

        info.textContent = `Page ${this.state.currentPage} of ${this.state.totalPages}`;
    }

    showSections() {
        const aiSection = document.getElementById('ai-recommendations-section');
        const dealsSection = document.getElementById('ma-deals-section');
        
        if (aiSection) aiSection.style.display = 'block';
        if (dealsSection) dealsSection.style.display = 'block';
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📄 DEAL DETAILS MODAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async viewDealDetails(index) {
        const deal = this.state.filteredDeals[index];
        
        if (!deal) {
            console.error('❌ Deal not found at index:', index);
            return;
        }

        console.log('📄 Viewing deal details:', deal);

        const modal = document.getElementById('dealDetailsModal');
        const title = document.getElementById('modal-deal-title');
        const body = document.getElementById('modal-deal-body');

        if (!modal || !title || !body) {
            console.error('❌ Modal elements not found');
            return;
        }

        title.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading Document...`;
        body.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #667eea;"></i>
                <p style="margin-top: 20px; opacity: 0.7;">Parsing SEC document via Worker...</p>
            </div>
        `;
        
        modal.style.display = 'flex';

        try {
            console.log('🌐 Requesting document from Worker:', deal.url);
            
            const parsedData = await this.client.getDocumentParsed(deal.url);
            const html = this.generateDocumentHTML(parsedData, deal);

            title.innerHTML = `
                <i class="fas fa-file-contract"></i> 
                ${deal.formType} - ${deal.companyName || 'SEC Filing'}
            `;
            body.innerHTML = html;

        } catch (error) {
            console.error('❌ Error loading document:', error);
            
            title.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error Loading Document`;
            body.innerHTML = `
                <div class="error-container">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to Load Document</h3>
                    <p>${error.message}</p>
                    <p style="margin-top: 16px; opacity: 0.7;">The Worker may be unavailable or the document format is unsupported.</p>
                    <a href="${deal.url}" target="_blank" class="btn-external-link">
                        <i class="fas fa-external-link-alt"></i> View Original on SEC.gov
                    </a>
                </div>
            `;
        }
    }

    generateDocumentHTML(data, deal) {
        if (!data || !data.success) {
            return `
                <div class="error-container">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Parsing Failed</h3>
                    <p>${data?.error || 'Unknown error'}</p>
                </div>
            `;
        }

        const { type, content } = data;

        let html = `
            <div class="sec-document-container">
                <div class="sec-document-header">
                    <div class="doc-type-badge">${type || deal.formType}</div>
                    <h3>${content.companyName || deal.companyName || 'SEC Filing'}</h3>
                    ${content.cik ? `<p class="doc-meta"><i class="fas fa-building"></i> <strong>CIK:</strong> ${content.cik}</p>` : ''}
                    ${content.filingDate ? `<p class="doc-meta"><i class="fas fa-calendar"></i> <strong>Filing Date:</strong> ${this.formatDate(content.filingDate)}</p>` : ''}
                </div>
        `;

        if (content.items && content.items.length > 0) {
            html += `
                <div class="sec-items-section">
                    <h4><i class="fas fa-list"></i> Items Reported</h4>
                    <ul class="sec-items-list">
                        ${content.items.map(item => `
                            <li><strong>Item ${item.code || item}:</strong> ${item.name || item.description || ''}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (content.mergerInfo) {
            html += `
                <div class="sec-merger-section">
                    <h4><i class="fas fa-handshake"></i> Merger Information</h4>
                    <div class="merger-grid">
                        ${content.mergerInfo.acquirer ? `
                            <div class="merger-item">
                                <span class="merger-label">Acquirer:</span>
                                <span class="merger-value">${content.mergerInfo.acquirer}</span>
                            </div>
                        ` : ''}
                        ${content.mergerInfo.target ? `
                            <div class="merger-item">
                                <span class="merger-label">Target:</span>
                                <span class="merger-value">${content.mergerInfo.target}</span>
                            </div>
                        ` : ''}
                        ${content.mergerInfo.dealValue ? `
                            <div class="merger-item">
                                <span class="merger-label">Deal Value:</span>
                                <span class="merger-value">${content.mergerInfo.dealValue}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        if (content.offerings && content.offerings.length > 0) {
            html += `
                <div class="sec-offerings-section">
                    <h4><i class="fas fa-file-invoice-dollar"></i> Offerings (${content.offerings.length})</h4>
                    
                    ${content.offeringsMetadata ? `
                        <div class="offerings-summary">
                            <div class="summary-item">
                                <span class="summary-label">Total Offerings:</span>
                                <span class="summary-value">${content.offeringsMetadata.totalOfferings}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Total Max Aggregate Price:</span>
                                <span class="summary-value">$${content.offeringsMetadata.totalMaxAggregatePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div class="summary-item">
                                <span class="summary-label">Total Registration Fees:</span>
                                <span class="summary-value">$${content.offeringsMetadata.totalRegistrationFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="offerings-list">
                        ${content.offerings.map(offering => `
                            <div class="offering-card">
                                <div class="offering-header">
                                    <span class="offering-number">Offering ${offering.offeringNumber}</span>
                                    <div class="offering-badges">
                                        ${offering.feePreviousPaid ? '<span class="badge badge-success">Fee Paid</span>' : '<span class="badge badge-warning">Fee Unpaid</span>'}
                                        ${offering.securityType ? `<span class="badge badge-${offering.securityType.toLowerCase() === 'equity' ? 'primary' : 'secondary'}">${offering.securityType}</span>` : ''}
                                    </div>
                                </div>
                                
                                <div class="offering-details">
                                    ${offering.securityClassTitle ? `
                                        <div class="offering-row">
                                            <span class="offering-label">Security Class:</span>
                                            <span class="offering-value">${offering.securityClassTitle}</span>
                                        </div>
                                    ` : ''}
                                    
                                    ${offering.amountRegistered ? `
                                        <div class="offering-row">
                                            <span class="offering-label">Amount Registered:</span>
                                            <span class="offering-value">${offering.amountRegistered.toLocaleString()} shares</span>
                                        </div>
                                    ` : ''}
                                    
                                    ${offering.proposedMaxOfferingPricePerUnit ? `
                                        <div class="offering-row">
                                            <span class="offering-label">Price per Unit:</span>
                                            <span class="offering-value">${offering.proposedMaxOfferingPricePerUnit}</span>
                                        </div>
                                    ` : ''}
                                    
                                    ${offering.maximumAggregateOfferingPrice ? `
                                        <div class="offering-row highlight">
                                            <span class="offering-label">Max Aggregate Price:</span>
                                            <span class="offering-value">${offering.maximumAggregateOfferingPrice}</span>
                                        </div>
                                    ` : ''}
                                    
                                    ${offering.feeRate ? `
                                        <div class="offering-row">
                                            <span class="offering-label">Fee Rate:</span>
                                            <span class="offering-value">${offering.feeRate}</span>
                                        </div>
                                    ` : ''}
                                    
                                    ${offering.amountOfRegistrationFee ? `
                                        <div class="offering-row">
                                            <span class="offering-label">Registration Fee:</span>
                                            <span class="offering-value">${offering.amountOfRegistrationFee}</span>
                                        </div>
                                    ` : ''}
                                    
                                    ${offering.offeringNote ? `
                                        <div class="offering-note">
                                            <strong>Note:</strong> ${offering.offeringNote}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (content.htmlContent) {
            html += `
                <div class="sec-document-content">
                    <h4><i class="fas fa-file-alt"></i> Document Content</h4>
                    <div class="content-body">
                        ${content.htmlContent}
                    </div>
                </div>
            `;
        }

        html += `
                <div class="sec-document-footer">
                    <a href="${deal.url}" target="_blank" class="btn-external-link">
                        <i class="fas fa-external-link-alt"></i> View Full Document on SEC.gov
                    </a>
                </div>
            </div>
        `;

        return html;
    }

    closeDealModal() {
        const modal = document.getElementById('dealDetailsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 UI UTILITIES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    buildSECUrl(cik, accession) {
        const cleanAccession = accession.replace(/-/g, '');
        return `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${accession}&xbrl_type=v`;
    }

    get8KDescription(items) {
        if (!items || items.length === 0) return 'Material Event';
        
        const descriptions = {
            '1.01': 'Material Definitive Agreement',
            '2.01': 'Completion of Acquisition/Disposition',
            '2.03': 'Creation of Direct Financial Obligation',
            '5.02': 'Departure/Election of Directors/Officers',
            '8.01': 'Other Events'
        };

        return items.map(item => descriptions[item] || `Item ${item}`).join(', ');
    }

    showLoadingIndicator(show) {
        let indicator = document.getElementById('globalLoadingIndicator');
        
        if (show) {
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'globalLoadingIndicator';
                indicator.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.7);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        backdrop-filter: blur(5px);
                    ">
                        <div style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 40px 60px;
                            border-radius: 20px;
                            text-align: center;
                            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                        ">
                            <div style="
                                width: 60px;
                                height: 60px;
                                border: 5px solid rgba(255, 255, 255, 0.3);
                                border-top-color: white;
                                border-radius: 50%;
                                animation: spin 1s linear infinite;
                                margin: 0 auto 20px;
                            "></div>
                            <h3 style="color: white; margin: 0 0 10px; font-size: 1.5rem;">Loading M&A Data</h3>
                            <p id="loadingMessage" style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 1rem;">
                                Connecting to SEC EDGAR...
                            </p>
                        </div>
                    </div>
                    <style>
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    </style>
                `;
                document.body.appendChild(indicator);
            }
            indicator.style.display = 'flex';
        } else {
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
    }

    updateProgress(message) {
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
        console.log(`📊 Progress: ${message}`);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'ma-toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) return dateString;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    truncate(str, maxLength) {
        if (!str) return '';
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    }
}

// ═══════════════════════════════════════════════════════════════════
// 🌐 GLOBAL INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

let maPredictor;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing M&A Predictor...');
    
    const workerURL = 'https://sec-edgar-api.raphnardone.workers.dev';
    
    try {
        maPredictor = new MAPredictor({ workerURL });
        window.maPredictor = maPredictor;
        
        console.log('✅ M&A Predictor initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize M&A Predictor:', error);
    }
});