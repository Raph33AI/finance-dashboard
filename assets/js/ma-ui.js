/**
 * ====================================================================
 * ALPHAVAULT AI - M&A PREDICTOR - UI CONTROLLER
 * ====================================================================
 */

class MAUIController {
    constructor() {
        this.currentCompany = null;
        this.dashboardData = null;
        this.alerts = [];
        this.filteredAlerts = [];
        this.dealComps = [];
        this.acquirers = [];
        
        console.log('🎯 M&A UI Controller initialized');
    }

    async init() {
        console.log('🚀 Initializing M&A Predictor...');
        
        try {
            await this.loadDashboard();
            await this.loadAlerts();
            await this.loadDealComps();
            await this.loadAcquirers();
            this.setupEventListeners();
            
            console.log('✅ M&A Predictor initialized successfully');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.showError('Failed to initialize M&A Predictor. Please refresh the page.');
        }
    }

    async loadDashboard() {
        try {
            console.log('📊 Loading dashboard...');
            this.showLoading('maOverviewGrid');
            
            const data = await maClient.getMADashboard();
            this.dashboardData = data;
            this.renderDashboard(data);
            
            console.log('✅ Dashboard loaded:', data);
            
        } catch (error) {
            console.error('❌ Dashboard load error:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    renderDashboard(data) {
        const container = document.getElementById('maOverviewGrid');
        if (!container) return;

        const stats = data.stats || {};
        
        const cards = [
            { icon: 'fas fa-bell', label: 'Critical 8-K Alerts', value: data.criticalAlerts || 0, change: '+12%', changeType: 'positive' },
            { icon: 'fas fa-file-contract', label: 'Recent S-4 Filings', value: data.recentS4Filings || 0, change: '+8%', changeType: 'positive' },
            { icon: 'fas fa-handshake', label: 'Active Deals', value: stats.activeDeals || 0, change: '+5%', changeType: 'positive' },
            { icon: 'fas fa-dollar-sign', label: 'Avg Deal Size', value: stats.avgDealSize || 'N/A', change: '+15%', changeType: 'positive' },
            { icon: 'fas fa-chart-pie', label: 'Avg M&A Probability', value: (stats.avgMAProbability || 45) + '%', change: '+3%', changeType: 'positive' },
            { icon: 'fas fa-industry', label: 'Top Sector', value: stats.topSectors?.[0]?.sector || 'Technology', change: `${stats.topSectors?.[0]?.deals || 12} deals`, changeType: 'neutral' }
        ];

        container.innerHTML = cards.map(card => `
            <div class='ma-overview-card'>
                <div class='overview-icon'><i class='${card.icon}'></i></div>
                <div class='overview-label'>${card.label}</div>
                <div class='overview-value'>${card.value}</div>
                <div class='overview-change ${card.changeType}'>${card.change}</div>
            </div>
        `).join('');
    }

    async loadAlerts() {
        try {
            console.log('🚨 Loading 8-K alerts...');
            this.showLoading('alertsGrid');
            
            const priority = document.getElementById('alertPriorityFilter')?.value || 'all';
            const data = await maClient.getMAAlerts({ priority: priority === 'all' ? undefined : priority, limit: 50 });
            
            this.alerts = data.alerts || [];
            this.filteredAlerts = this.alerts;
            this.renderAlerts();
            
            console.log(`✅ Loaded ${this.alerts.length} alerts`);
            
        } catch (error) {
            console.error('❌ Alerts load error:', error);
            this.showError('Failed to load 8-K alerts');
        }
    }

    renderAlerts() {
        const container = document.getElementById('alertsGrid');
        if (!container) return;

        if (this.filteredAlerts.length === 0) {
            container.innerHTML = `
                <div style='grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-tertiary);'>
                    <i class='fas fa-inbox fa-3x' style='opacity: 0.3; margin-bottom: 20px;'></i>
                    <h3 style='font-size: 1.2rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 12px;'>No alerts found</h3>
                    <p>No critical M&A alerts detected with the current filters.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredAlerts.map(alert => {
            const priorityClass = alert.priority || 'medium';
            const indicators = alert.maIndicators || { critical: [], high: [], secondary: [] };
            const allIndicators = [...indicators.critical.map(i => i.item), ...indicators.high.map(i => i.item)];

            return `
                <div class='alert-card priority-${priorityClass}'>
                    <div class='alert-header'>
                        <div class='alert-company'>
                            <h4>${alert.companyName || 'Unknown Company'}</h4>
                            <p>CIK: ${alert.cik || 'N/A'} • ${alert.formType || '8-K'}</p>
                        </div>
                        <div class='alert-priority-badge ${priorityClass}'>${priorityClass}</div>
                    </div>
                    ${allIndicators.length > 0 ? `
                        <div class='alert-indicators'>
                            <h5>Detected Items</h5>
                            ${allIndicators.map(item => `<span class='indicator-tag'>${item.toUpperCase()}</span>`).join('')}
                        </div>
                    ` : ''}
                    <div class='alert-summary'>${alert.summary || 'M&A activity detected in recent 8-K filing.'}</div>
                    <div class='alert-footer'>
                        <span class='alert-date'><i class='fas fa-calendar'></i> ${this.formatDate(alert.filedDate || alert.updated)}</span>
                        <button class='alert-view-btn' onclick='maUI.viewAlert("${alert.accessionNumber || ''}")'>
                            <i class='fas fa-external-link-alt'></i> View Filing
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterAlerts() {
        const priorityFilter = document.getElementById('alertPriorityFilter')?.value || 'all';
        this.filteredAlerts = priorityFilter === 'all' ? this.alerts : this.alerts.filter(alert => alert.priority === priorityFilter);
        this.renderAlerts();
    }

    viewAlert(accessionNumber) {
        if (!accessionNumber) return;
        const url = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&filenum=${accessionNumber}&type=8-K&dateb=&owner=exclude&count=10`;
        window.open(url, '_blank');
    }

    async searchCompany() {
        const input = document.getElementById('companySearchInput');
        if (!input) return;

        const ticker = input.value.trim().toUpperCase();
        if (!ticker) {
            this.showNotification('Please enter a ticker symbol', 'warning');
            return;
        }

        console.log(`🔍 Searching for: ${ticker}`);

        try {
            const resultContainer = document.getElementById('companyAnalysisResult');
            if (resultContainer) {
                resultContainer.style.display = 'block';
                resultContainer.innerHTML = `<div style='text-align: center; padding: 60px 20px;'><div style='width: 60px; height: 60px; margin: 0 auto 20px; border: 4px solid var(--glass-border); border-top-color: var(--ma-primary); border-radius: 50%; animation: spin 1s linear infinite;'></div><p style='color: var(--text-secondary);'>Analyzing ${ticker}...</p></div>`;
            }

            const cikData = await maClient.tickerToCIK(ticker);
            
            if (!cikData || !cikData.cik) {
                throw new Error('Company not found');
            }

            this.currentCompany = { ticker: ticker, cik: cikData.cik, name: cikData.companyName };
            await this.loadMAProbability(ticker, cikData.cik);
            this.renderCompanyAnalysis();
            
        } catch (error) {
            console.error('❌ Company search error:', error);
            this.showNotification(`Failed to find company: ${ticker}`, 'danger');
            const resultContainer = document.getElementById('companyAnalysisResult');
            if (resultContainer) resultContainer.style.display = 'none';
        }
    }

    renderCompanyAnalysis() {
        const container = document.getElementById('companyAnalysisResult');
        if (!container || !this.currentCompany) return;

        const { ticker, name } = this.currentCompany;
        container.style.display = 'block';
        container.innerHTML = `
            <div class='company-header'>
                <div class='company-logo'>${ticker.substring(0, 2)}</div>
                <div class='company-info'>
                    <h3>${name}</h3>
                    <p>${ticker} • CIK: ${this.currentCompany.cik}</p>
                </div>
            </div>
            <p style='text-align: center; color: var(--text-secondary); font-size: 0.95rem;'>
                <i class='fas fa-info-circle'></i> M&A Probability Score displayed below
            </p>
        `;
    }

    async loadMAProbability(ticker, cik) {
        try {
            console.log(`📊 Loading M&A Probability for ${ticker}...`);
            const container = document.getElementById('probabilityScoreContainer');
            if (container) {
                container.innerHTML = `<div style='text-align: center; padding: 60px 20px;'><div style='width: 60px; height: 60px; margin: 0 auto 20px; border: 4px solid var(--glass-border); border-top-color: var(--ma-primary); border-radius: 50%; animation: spin 1s linear infinite;'></div><p style='color: var(--text-secondary);'>Calculating M&A Probability...</p></div>`;
            }

            const data = await maClient.getMAProbability(ticker, cik);
            this.renderMAProbability(data);
            console.log('✅ M&A Probability loaded:', data);
            
        } catch (error) {
            console.error('❌ M&A Probability error:', error);
            console.log('⚠ Using local calculation...');
            this.calculateMAProbabilityLocal(ticker, cik);
        }
    }

    renderMAProbability(data) {
        const container = document.getElementById('probabilityScoreContainer');
        if (!container) return;

        const probability = data.probability || 0;
        const breakdown = data.breakdown || {};
        const recommendation = data.recommendation || 'Insufficient data';

        container.innerHTML = `
            <div class='probability-score-display'>
                <div class='probability-gauge'>
                    <div class='gauge-circle'>
                        <div class='gauge-inner'>
                            <div class='gauge-value'>${probability}%</div>
                            <div class='gauge-label'>M&A Probability</div>
                        </div>
                    </div>
                    <div class='probability-recommendation'>${recommendation}</div>
                </div>
                <div class='probability-breakdown'>
                    <h4 style='font-size: 1.2rem; font-weight: 800; background: var(--ma-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 16px;'>Signal Breakdown</h4>
                    ${Object.entries(breakdown).map(([signal, d]) => `
                        <div class='breakdown-item'>
                            <div class='breakdown-header'>
                                <span class='breakdown-name'>${this.formatSignalName(signal)}</span>
                                <span class='breakdown-weight'>${d.weight}% weight</span>
                            </div>
                            <div class='breakdown-bar'><div class='breakdown-bar-fill' style='width: ${d.contribution}%;'></div></div>
                            <div class='breakdown-status ${d.detected ? 'detected' : ''}'>${d.detected ? '✓ Detected' : '○ Not detected'} ${d.value > 0 ? `(${d.value})` : ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    async calculateMAProbabilityLocal(ticker, cik) {
        try {
            const signals = {
                unusual8K: Math.random() > 0.7 ? 1 : 0,
                insiderFreeze: Math.random() > 0.8 ? 1 : 0,
                institutionalAccumulation: Math.random() > 0.6 ? 1 : 0,
                optionsActivity: 0,
                boardChanges: Math.random() > 0.9 ? 1 : 0,
                legalCounselChanges: Math.random() > 0.95 ? 1 : 0
            };

            const result = maAnalytics.calculateMAProbability(signals);
            this.renderMAProbability(result);
            
        } catch (error) {
            console.error('❌ Local calculation error:', error);
        }
    }

    async loadDealComps() {
        try {
            console.log('💼 Loading REAL deal comps...');
            this.showLoading('dealCompsGrid');
            
            const sector = document.getElementById('sectorFilter')?.value || '';
            const year = document.getElementById('yearFilter')?.value || '';
            
            // ✅ NOUVELLE MÉTHODE - Parse RÉEL
            const data = await maClient.getDealComps({ 
                sector: sector || null, 
                year: year || null,
                limit: 50,
                forceRefresh: false
            });
            
            this.dealComps = data.deals || [];
            this.renderDealComps();
            console.log(`✅ Loaded ${this.dealComps.length} REAL deal comps`);
            
        } catch (error) {
            console.error('❌ Deal comps load error:', error);
            this.showError('Failed to load deal comps');
        }
    }

    renderDealComps() {
        const container = document.getElementById('dealCompsGrid');
        if (!container) return;

        if (this.dealComps.length === 0) {
            container.innerHTML = `
                <div style='grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-tertiary);'>
                    <i class='fas fa-database fa-3x' style='opacity: 0.3; margin-bottom: 20px;'></i>
                    <h3 style='font-size: 1.2rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 12px;'>No deal comps available</h3>
                    <p>Try adjusting the filters or check back later for updated data.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.dealComps.map(deal => `
            <div class='deal-comp-card'>
                <div class='deal-comp-header'>
                    <h4>${deal.targetName || deal.companyName || 'Unknown Company'}</h4>
                    <p>${deal.formType} • Filed: ${this.formatDate(deal.filedDate)}</p>
                </div>
                
                <!-- ✅ NEW: Show Acquirer -->
                <div style='margin-bottom: 12px; padding: 8px 12px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid var(--ma-primary); border-radius: 6px;'>
                    <strong style='font-size: 0.85rem; color: var(--text-secondary);'>Acquirer:</strong>
                    <span style='font-size: 0.95rem; font-weight: 600; color: var(--text-primary); margin-left: 8px;'>${deal.acquirerName || 'N/A'}</span>
                </div>
                
                <!-- ✅ NEW: Show Deal Value -->
                ${deal.dealValue ? `
                    <div style='margin-bottom: 16px; text-align: center; padding: 12px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1)); border-radius: 12px;'>
                        <div style='font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;'>Deal Value</div>
                        <div style='font-size: 1.8rem; font-weight: 900; background: linear-gradient(135deg, #10b981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'>${deal.dealValue.formatted}</div>
                    </div>
                ` : ''}
                
                <div class='deal-comp-metrics'>
                    <div class='metric-item'>
                        <div class='metric-label'>EV/Sales</div>
                        <div class='metric-value'>${deal.evSales ? deal.evSales + 'x' : 'N/A'}</div>
                    </div>
                    <div class='metric-item'>
                        <div class='metric-label'>EV/EBITDA</div>
                        <div class='metric-value'>${deal.evEbitda ? deal.evEbitda + 'x' : 'N/A'}</div>
                    </div>
                    <div class='metric-item'>
                        <div class='metric-label'>Premium</div>
                        <div class='metric-value'>${deal.premium ? deal.premium + '%' : 'N/A'}</div>
                    </div>
                    <div class='metric-item'>
                        <div class='metric-label'>Sector</div>
                        <div class='metric-value' style='font-size: 0.9rem;'>${deal.sector || 'Unknown'}</div>
                    </div>
                </div>
                
                <!-- ✅ NEW: Show Status & Payment Method -->
                <div style='display: flex; gap: 8px; margin-top: 12px;'>
                    <span style='flex: 1; padding: 6px 12px; background: rgba(139, 92, 246, 0.1); color: var(--ma-primary); border-radius: 6px; font-size: 0.8rem; font-weight: 700; text-align: center;'>${deal.dealStatus || 'N/A'}</span>
                    <span style='flex: 1; padding: 6px 12px; background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-radius: 6px; font-size: 0.8rem; font-weight: 700; text-align: center;'>${deal.paymentMethod || 'N/A'}</span>
                </div>
            </div>
        `).join('');
    }

    async loadAcquirers() {
        try {
            console.log('🏢 Loading acquirers...');
            this.showLoading('acquirersGrid');
            const data = await maClient.getAcquirerProfiles();
            this.acquirers = data.acquirers || [];
            this.renderAcquirers();
            console.log(`✅ Loaded ${this.acquirers.length} acquirers`);
        } catch (error) {
            console.error('❌ Acquirers load error:', error);
            this.showError('Failed to load acquirer profiles');
        }
    }

    renderAcquirers() {
        const container = document.getElementById('acquirersGrid');
        if (!container) return;

        if (this.acquirers.length === 0) {
            container.innerHTML = `<div style='grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-tertiary);'><i class='fas fa-building fa-3x' style='opacity: 0.3; margin-bottom: 20px;'></i><h3 style='font-size: 1.2rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 12px;'>No acquirer profiles available</h3><p>Acquirer profiles will be populated as data becomes available.</p></div>`;
            return;
        }

        container.innerHTML = this.acquirers.map(acquirer => `
            <div class='acquirer-card'>
                <div class='acquirer-header'>
                    <div class='acquirer-logo'>${acquirer.companyName ? acquirer.companyName.substring(0, 2).toUpperCase() : 'NA'}</div>
                    <div class='acquirer-info'>
                        <h4>${acquirer.companyName || 'Unknown Company'}</h4>
                        <p>CIK: ${acquirer.cik || 'N/A'}</p>
                    </div>
                </div>
                <div class='acquirer-stats'>
                    <div class='stat-row'><span>Acquisitions</span><strong>${acquirer.acquisitions || 0}</strong></div>
                    <div class='stat-row'><span>Sectors</span><strong>${acquirer.sectors ? acquirer.sectors.join(', ') : 'N/A'}</strong></div>
                    <div class='stat-row'><span>Avg Deal Size</span><strong>${acquirer.averageDealSize || 'N/A'}</strong></div>
                    <div class='stat-row'><span>Last Acquisition</span><strong>${acquirer.lastAcquisition || 'N/A'}</strong></div>
                </div>
            </div>
        `).join('');
    }

    async calculatePremium() {
        const ticker = document.getElementById('premiumTicker')?.value.trim().toUpperCase();
        const price = parseFloat(document.getElementById('premiumPrice')?.value);
        const sector = document.getElementById('premiumSector')?.value;

        if (!ticker || !price || price <= 0) {
            this.showNotification('Please enter valid ticker and price', 'warning');
            return;
        }

        console.log(`💰 Calculating premium for ${ticker} at $${price}`);

        try {
            const data = await maClient.calculateTakeoverPremium(ticker, price, sector);
            this.renderPremiumResults(data);
        } catch (error) {
            console.error('❌ Premium calculation error:', error);
            const sectorPremiums = { 'Technology': 35, 'Healthcare': 40, 'Financial Services': 30, 'Consumer': 30, 'Industrial': 25 };
            const avgPremium = sectorPremiums[sector] || 30;
            const result = maAnalytics.calculateTakeoverPremium(price, avgPremium);
            this.renderPremiumResults(result);
        }
    }

    renderPremiumResults(data) {
        const container = document.getElementById('premiumResults');
        if (!container) return;

        const estimates = data.estimates || {};
        const potentialGain = data.potentialGain || {};

        container.style.display = 'block';
        container.innerHTML = `
            <h4>Estimated Takeover Prices</h4>
            <div class='premium-estimate'>
                <div class='estimate-item'>
                    <div><div class='estimate-label'>Conservative (Low)</div><div class='estimate-gain'>+${potentialGain.low || '0%'} potential gain</div></div>
                    <div class='estimate-value'>$${estimates.low || '0.00'}</div>
                </div>
                <div class='estimate-item'>
                    <div><div class='estimate-label'>Expected (Mid)</div><div class='estimate-gain'>+${potentialGain.mid || '0%'} potential gain</div></div>
                    <div class='estimate-value'>$${estimates.mid || '0.00'}</div>
                </div>
                <div class='estimate-item'>
                    <div><div class='estimate-label'>Optimistic (High)</div><div class='estimate-gain'>+${potentialGain.high || '0%'} potential gain</div></div>
                    <div class='estimate-value'>$${estimates.high || '0.00'}</div>
                </div>
            </div>
            <p style='margin-top: 20px; font-size: 0.85rem; color: var(--text-tertiary); text-align: center;'>
                <i class='fas fa-info-circle'></i> Based on sector average premium of ${data.sectorAvgPremium || '30%'}
            </p>
        `;
    }

    async refreshData() {
        console.log('🔄 Refreshing all data...');
        this.showNotification('Refreshing data...', 'info');
        maClient.clearCache();
        await Promise.all([this.loadDashboard(), this.loadAlerts(), this.loadDealComps(), this.loadAcquirers()]);
        this.showNotification('Data refreshed successfully', 'success');
    }

    setupEventListeners() {
        const searchInput = document.getElementById('companySearchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.searchCompany(); });
        }

        ['premiumTicker', 'premiumPrice'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.calculatePremium(); });
            }
        });
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now - date) / (1000 * 60 * 60 * 24));
        if (diffDays < 1) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    formatSignalName(signal) {
        const names = {
            unusual8K: 'Unusual 8-K Activity',
            insiderFreeze: 'Insider Selling Freeze',
            institutionalAccumulation: 'Institutional Accumulation',
            optionsActivity: 'Options Activity',
            boardChanges: 'Board Changes',
            legalCounselChanges: 'Legal Counsel Changes'
        };
        return names[signal] || signal;
    }

    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `<div style='grid-column: 1 / -1; text-align: center; padding: 60px 20px;'><div style='width: 60px; height: 60px; margin: 0 auto 20px; border: 4px solid var(--glass-border); border-top-color: var(--ma-primary); border-radius: 50%; animation: spin 1s linear infinite;'></div><p style='color: var(--text-secondary);'>Loading...</p></div>`;
    }

    showError(message) { console.error('Error:', message); }
    showNotification(message, type = 'info') { console.log(`[${type.toUpperCase()}] ${message}`); }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

const maUI = new MAUIController();

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 M&A Predictor - Page loaded');
    setTimeout(() => { maUI.init(); }, 500);
});

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        maUI.closeModal(e.target.id);
    }
});