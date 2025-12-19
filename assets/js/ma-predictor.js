/**
 * ═══════════════════════════════════════════════════════════════════
 * 🤝 M&A PREDICTOR - USER INTERFACE
 * ═══════════════════════════════════════════════════════════════════
 * Interface complète pour le M&A Predictor avec toutes les fonctionnalités
 * ═══════════════════════════════════════════════════════════════════
 */

class MAPredictor {
    constructor(config = {}) {
        this.workerURL = config.workerURL || 'https://sec-edgar-api.raphnardone.workers.dev';
        this.client = new SECMAClient({ workerURL: this.workerURL });
        this.analytics = new MAAnalyticsEngine(this.client);
        
        this.state = {
            currentView: 'dashboard',
            selectedTicker: null,
            watchlist: this.loadWatchlist(),
            alerts: []
        };

        this.init();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎬 INITIALIZATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async init() {
        console.log('🤝 M&A Predictor initializing...');
        
        this.setupEventListeners();
        await this.loadDashboard();
        this.startAlertMonitoring();
        
        console.log('✅ M&A Predictor ready');
    }

    setupEventListeners() {
        // Search form
        const searchForm = document.getElementById('ma-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const ticker = document.getElementById('ma-ticker-input').value.trim().toUpperCase();
                if (ticker) this.analyzeCompany(ticker);
            });
        }

        // View switchers
        document.querySelectorAll('[data-ma-view]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.maView;
                this.switchView(view);
            });
        });

        // Watchlist actions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-add-watchlist]')) {
                const ticker = e.target.dataset.addWatchlist;
                this.addToWatchlist(ticker);
            }
            
            if (e.target.matches('[data-remove-watchlist]')) {
                const ticker = e.target.dataset.removeWatchlist;
                this.removeFromWatchlist(ticker);
            }
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 DASHBOARD
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async loadDashboard() {
        this.showLoading('ma-dashboard-container');
        
        try {
            const [recentDeals, materialEvents, alerts] = await Promise.all([
                this.client.getRecentDeals({ days: 30 }),
                this.client.get8KAlerts(['1.01', '2.01'], 7),
                this.loadAlerts()
            ]);

            this.renderDashboard({
                recentDeals,
                materialEvents,
                alerts
            });

        } catch (error) {
            console.error('❌ Dashboard load failed:', error);
            this.showError('ma-dashboard-container', 'Failed to load dashboard');
        }
    }

    renderDashboard(data) {
        const container = document.getElementById('ma-dashboard-container');
        if (!container) return;

        container.innerHTML = `
            <!-- Stats Cards -->
            <div class="ma-stats-grid">
                <div class="ma-stat-card">
                    <div class="stat-icon">🤝</div>
                    <div class="stat-value">${data.recentDeals.count}</div>
                    <div class="stat-label">Recent Deals (30d)</div>
                </div>
                
                <div class="ma-stat-card">
                    <div class="stat-icon">📋</div>
                    <div class="stat-value">${data.materialEvents.count}</div>
                    <div class="stat-label">Material Events (7d)</div>
                </div>
                
                <div class="ma-stat-card">
                    <div class="stat-icon">🚨</div>
                    <div class="stat-value">${data.alerts.length}</div>
                    <div class="stat-label">Active Alerts</div>
                </div>
                
                <div class="ma-stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-value">${this.state.watchlist.length}</div>
                    <div class="stat-label">Watchlist</div>
                </div>
            </div>

            <!-- Recent Deals -->
            <div class="ma-section">
                <h2 class="section-title">
                    <i class="fas fa-handshake"></i> Recent M&A Deals
                </h2>
                <div class="deals-table-container">
                    ${this.renderDealsTable(data.recentDeals.deals.slice(0, 10))}
                </div>
            </div>

            <!-- Material Events -->
            <div class="ma-section">
                <h2 class="section-title">
                    <i class="fas fa-bell"></i> Latest Material Events
                </h2>
                <div class="events-list">
                    ${this.renderEventsList(data.materialEvents.alerts.slice(0, 10))}
                </div>
            </div>

            <!-- Watchlist -->
            ${this.renderWatchlistSection()}
        `;
    }

    renderDealsTable(deals) {
        if (!deals || deals.length === 0) {
            return '<p class="no-data">No recent deals found</p>';
        }

        return `
            <table class="ma-table">
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>Type</th>
                        <th>Filed Date</th>
                        <th>Source</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${deals.map(deal => `
                        <tr>
                            <td><strong>${deal.companyName}</strong></td>
                            <td><span class="badge badge-${deal.source.toLowerCase()}">${deal.dealType || deal.formType}</span></td>
                            <td>${this.formatDate(deal.filedDate)}</td>
                            <td><span class="badge badge-info">${deal.source}</span></td>
                            <td>
                                <button class="btn-icon" onclick="maPredictor.viewDealDetails('${deal.accessionNumber}', '${deal.cik}', '${deal.source}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderEventsList(events) {
        if (!events || events.length === 0) {
            return '<p class="no-data">No recent events found</p>';
        }

        return events.map(event => `
            <div class="event-card">
                <div class="event-header">
                    <strong>${event.companyName}</strong>
                    <span class="event-date">${this.formatDate(event.filedDate)}</span>
                </div>
                <div class="event-items">
                    ${event.items?.map(item => `<span class="badge badge-warning">Item ${item}</span>`).join('') || ''}
                </div>
                <div class="event-flags">
                    ${event.isMaterialAgreement ? '<span class="flag flag-agreement">🤝 Material Agreement</span>' : ''}
                    ${event.isAcquisition ? '<span class="flag flag-acquisition">💼 Acquisition</span>' : ''}
                    ${event.isLeadershipChange ? '<span class="flag flag-leadership">👔 Leadership Change</span>' : ''}
                </div>
                <p class="event-summary">${this.truncate(event.summary, 200)}</p>
            </div>
        `).join('');
    }

    renderWatchlistSection() {
        if (this.state.watchlist.length === 0) {
            return `
                <div class="ma-section">
                    <h2 class="section-title">
                        <i class="fas fa-star"></i> Watchlist
                    </h2>
                    <p class="no-data">Your watchlist is empty. Add companies to monitor their M&A activity.</p>
                </div>
            `;
        }

        return `
            <div class="ma-section">
                <h2 class="section-title">
                    <i class="fas fa-star"></i> Watchlist
                </h2>
                <div class="watchlist-grid">
                    ${this.state.watchlist.map(ticker => `
                        <div class="watchlist-card">
                            <div class="watchlist-ticker">${ticker}</div>
                            <button class="btn-remove" data-remove-watchlist="${ticker}">
                                <i class="fas fa-times"></i>
                            </button>
                            <button class="btn-analyze" onclick="maPredictor.analyzeCompany('${ticker}')">
                                Analyze
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 COMPANY ANALYSIS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async analyzeCompany(ticker) {
        console.log(`🎯 Analyzing ${ticker}...`);
        
        const container = document.getElementById('ma-analysis-container');
        if (!container) {
            console.error('Analysis container not found');
            return;
        }

        this.showLoading('ma-analysis-container');
        this.state.selectedTicker = ticker;

        try {
            // Calculate M&A Probability Score
            const probability = await this.analytics.calculateMAProbability(ticker);

            // Get company M&A activity
            const activity = await this.client.getCompanyMAActivity(probability.cik, 365);

            // Render analysis
            this.renderAnalysis({
                ticker,
                probability,
                activity
            });

            // Switch to analysis view
            this.switchView('analysis');

        } catch (error) {
            console.error(`❌ Analysis failed for ${ticker}:`, error);
            this.showError('ma-analysis-container', `Failed to analyze ${ticker}: ${error.message}`);
        }
    }

    renderAnalysis(data) {
        const container = document.getElementById('ma-analysis-container');
        if (!container) return;

        const { ticker, probability, activity } = data;

        container.innerHTML = `
            <!-- Header -->
            <div class="analysis-header">
                <div class="company-info">
                    <h1 class="company-ticker">${ticker}</h1>
                    <p class="company-name">${probability.companyName}</p>
                    <p class="company-cik">CIK: ${probability.cik}</p>
                </div>
                <button class="btn-primary" data-add-watchlist="${ticker}">
                    <i class="fas fa-star"></i> Add to Watchlist
                </button>
            </div>

            <!-- M&A Probability Score -->
            <div class="ma-section">
                <h2 class="section-title">
                    <i class="fas fa-chart-line"></i> M&A Probability Score
                </h2>
                ${this.renderProbabilityScore(probability)}
            </div>

            <!-- Signal Breakdown -->
            <div class="ma-section">
                <h2 class="section-title">
                    <i class="fas fa-signal"></i> Signal Breakdown
                </h2>
                ${this.renderSignalBreakdown(probability.breakdown)}
            </div>

            <!-- Company Activity -->
            <div class="ma-section">
                <h2 class="section-title">
                    <i class="fas fa-history"></i> M&A Activity History
                </h2>
                ${this.renderCompanyActivity(activity)}
            </div>
        `;
    }

    renderProbabilityScore(probability) {
        return `
            <div class="probability-card">
                <div class="probability-gauge">
                    <svg viewBox="0 0 200 120" class="gauge-svg">
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e5e7eb" stroke-width="20" stroke-linecap="round"/>
                        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="${probability.riskColor}" stroke-width="20" stroke-linecap="round" stroke-dasharray="${probability.probabilityScore * 2.51} 251" class="gauge-progress"/>
                    </svg>
                    <div class="gauge-center">
                        <div class="gauge-score">${probability.probabilityScore}</div>
                        <div class="gauge-label">M&A Probability</div>
                    </div>
                </div>
                
                <div class="probability-details">
                    <div class="detail-row">
                        <span class="detail-label">Risk Level:</span>
                        <span class="detail-value" style="color: ${probability.riskColor}">
                            <strong>${probability.riskLevel}</strong>
                        </span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Data Quality:</span>
                        <span class="detail-value">${probability.dataQuality}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Last Updated:</span>
                        <span class="detail-value">${this.formatDate(probability.timestamp)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderSignalBreakdown(breakdown) {
        return `
            <div class="signals-grid">
                ${breakdown.map(signal => `
                    <div class="signal-card signal-${signal.status.toLowerCase()}">
                        <div class="signal-header">
                            <span class="signal-name">${signal.signal}</span>
                            <span class="signal-status badge badge-${signal.status.toLowerCase()}">${signal.status}</span>
                        </div>
                        <div class="signal-metrics">
                            <div class="metric">
                                <span class="metric-label">Value</span>
                                <span class="metric-value">${signal.value}/100</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Weight</span>
                                <span class="metric-value">${signal.weight}%</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Contribution</span>
                                <span class="metric-value">${signal.contribution}</span>
                            </div>
                        </div>
                        <div class="signal-bar">
                            <div class="signal-bar-fill" style="width: ${signal.value}%; background: ${this.getSignalColor(signal.status)}"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderCompanyActivity(activity) {
        const totalEvents = activity.s4Filings.length + activity.materialEvents.length;

        if (totalEvents === 0) {
            return '<p class="no-data">No M&A activity found in the past 12 months</p>';
        }

        return `
            <div class="activity-summary">
                <div class="activity-stat">
                    <div class="stat-value">${activity.s4Filings.length}</div>
                    <div class="stat-label">S-4 Filings</div>
                </div>
                <div class="activity-stat">
                    <div class="stat-value">${activity.materialEvents.length}</div>
                    <div class="stat-label">Material Events</div>
                </div>
                <div class="activity-stat">
                    <div class="stat-value">${totalEvents}</div>
                    <div class="stat-label">Total Activity</div>
                </div>
            </div>

            ${activity.s4Filings.length > 0 ? `
                <h3 class="subsection-title">S-4 Filings</h3>
                ${this.renderDealsTable(activity.s4Filings)}
            ` : ''}

            ${activity.materialEvents.length > 0 ? `
                <h3 class="subsection-title">Material Events (8-K)</h3>
                ${this.renderEventsList(activity.materialEvents)}
            ` : ''}
        `;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📄 DEAL DETAILS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async viewDealDetails(accession, cik, source) {
        console.log(`📄 Loading deal details: ${accession}`);
        
        this.showLoading('ma-deal-details-container');
        
        try {
            let dealData;
            
            if (source === 'S-4') {
                dealData = await this.client.getS4ContentParsed(accession, cik);
            } else {
                dealData = await this.client.get8KContentParsed(accession, cik);
            }

            this.renderDealDetails(dealData, source);
            this.switchView('deal-details');

        } catch (error) {
            console.error('❌ Failed to load deal details:', error);
            this.showError('ma-deal-details-container', 'Failed to load deal details');
        }
    }

    renderDealDetails(data, source) {
        const container = document.getElementById('ma-deal-details-container');
        if (!container) return;

        const parsed = data.parsedEnhanced || data.parsed;

        if (source === 'S-4') {
            container.innerHTML = this.renderS4Details(data, parsed);
        } else {
            container.innerHTML = this.render8KDetails(data, parsed);
        }
    }

    renderS4Details(data, parsed) {
        const integrationRisk = this.analytics.calculateIntegrationRisk(parsed);
        const timeline = this.analytics.predictRegulatoryTimeline(parsed);
        const breakUpFee = this.analytics.analyzeBreakUpFee(parsed);

        return `
            <div class="deal-header">
                <button class="btn-back" onclick="maPredictor.switchView('dashboard')">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                <h1>S-4 Deal Details</h1>
            </div>

            <!-- Deal Overview -->
            <div class="ma-section">
                <h2 class="section-title">Deal Overview</h2>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="label">Accession Number:</span>
                        <span class="value">${data.accessionNumber}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">CIK:</span>
                        <span class="value">${data.cik}</span>
                    </div>
                    ${parsed?.dealStructure?.dealType ? `
                        <div class="detail-item">
                            <span class="label">Deal Type:</span>
                            <span class="value">${parsed.dealStructure.dealType}</span>
                        </div>
                    ` : ''}
                    ${parsed?.financialTerms?.dealValue ? `
                        <div class="detail-item highlight">
                            <span class="label">Deal Value:</span>
                            <span class="value">$${parsed.financialTerms.dealValue.toLocaleString()}M</span>
                        </div>
                    ` : ''}
                    ${parsed?.financialTerms?.premiumOffered ? `
                        <div class="detail-item">
                            <span class="label">Premium Offered:</span>
                            <span class="value">${parsed.financialTerms.premiumOffered}%</span>
                        </div>
                    ` : ''}
                    ${parsed?.financialTerms?.exchangeRatio ? `
                        <div class="detail-item">
                            <span class="label">Exchange Ratio:</span>
                            <span class="value">${parsed.financialTerms.exchangeRatio}</span>
                        </div>
                    ` : ''}
                    ${parsed?.dealStructure?.effectiveDate ? `
                        <div class="detail-item">
                            <span class="label">Expected Closing:</span>
                            <span class="value">${parsed.dealStructure.effectiveDate}</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Financial Terms -->
            ${(parsed?.financialTerms?.breakUpFee || parsed?.synergies?.totalSynergies) ? `
                <div class="ma-section">
                    <h2 class="section-title">Financial Terms</h2>
                    <div class="details-grid">
                        ${parsed.financialTerms.breakUpFee ? `
                            <div class="detail-item">
                                <span class="label">Break-Up Fee:</span>
                                <span class="value">$${parsed.financialTerms.breakUpFee.toLocaleString()}M</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Break-Up Fee %:</span>
                                <span class="value">${breakUpFee.feePercentage}%</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Fee Assessment:</span>
                                <span class="value badge badge-${breakUpFee.assessment.toLowerCase()}">${breakUpFee.assessment}</span>
                            </div>
                        ` : ''}
                        ${parsed.synergies?.totalSynergies ? `
                            <div class="detail-item highlight">
                                <span class="label">Expected Synergies:</span>
                                <span class="value">$${parsed.synergies.totalSynergies.toLocaleString()}M</span>
                            </div>
                        ` : ''}
                    </div>
                    ${breakUpFee.hasBreakUpFee ? `
                        <p class="detail-note">${breakUpFee.implications}</p>
                    ` : ''}
                </div>
            ` : ''}

            <!-- Regulatory -->
            ${parsed?.regulatory?.approvalsRequired?.length > 0 ? `
                <div class="ma-section">
                    <h2 class="section-title">Regulatory Approvals</h2>
                    <div class="badges-list">
                        ${parsed.regulatory.approvalsRequired.map(approval => `
                            <span class="badge badge-warning">${approval.authority}</span>
                        `).join('')}
                    </div>
                    <div class="timeline-card">
                        <h3>Estimated Timeline</h3>
                        <div class="timeline-details">
                            <div class="timeline-item">
                                <span class="label">Total Duration:</span>
                                <span class="value">${timeline.totalMonths} months</span>
                            </div>
                            <div class="timeline-item">
                                <span class="label">Estimated Close:</span>
                                <span class="value">${timeline.estimatedCloseDate}</span>
                            </div>
                            <div class="timeline-item">
                                <span class="label">Complexity:</span>
                                <span class="value badge badge-${timeline.complexity.toLowerCase()}">${timeline.complexity}</span>
                            </div>
                        </div>
                        <div class="timeline-breakdown">
                            ${Object.entries(timeline.timelines).map(([stage, months]) => `
                                <div class="timeline-stage">
                                    <span>${stage}</span>
                                    <span>${months} months</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            ` : ''}

            <!-- Advisors -->
            ${(parsed?.advisors?.allLegalCounsel?.length > 0 || parsed?.advisors?.allFinancialAdvisors?.length > 0) ? `
                <div class="ma-section">
                    <h2 class="section-title">Advisors</h2>
                    <div class="advisors-grid">
                        ${parsed.advisors.allLegalCounsel?.length > 0 ? `
                            <div class="advisor-category">
                                <h3>Legal Counsel</h3>
                                <ul>
                                    ${parsed.advisors.allLegalCounsel.map(counsel => `<li>${counsel}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        ${parsed.advisors.allFinancialAdvisors?.length > 0 ? `
                            <div class="advisor-category">
                                <h3>Financial Advisors</h3>
                                <ul>
                                    ${parsed.advisors.allFinancialAdvisors.map(advisor => `<li>${advisor}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            <!-- Integration Risk -->
            <div class="ma-section">
                <h2 class="section-title">Integration Risk Analysis</h2>
                ${this.renderIntegrationRisk(integrationRisk)}
            </div>

            <!-- Document Link -->
            <div class="ma-section">
                <h2 class="section-title">Original Document</h2>
                <a href="${data.documentURL}" target="_blank" class="btn-link">
                    <i class="fas fa-external-link-alt"></i> View Full S-4 Filing on SEC.gov
                </a>
            </div>
        `;
    }

    render8KDetails(data, parsed) {
        return `
            <div class="deal-header">
                <button class="btn-back" onclick="maPredictor.switchView('dashboard')">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
                <h1>8-K Material Event Details</h1>
            </div>

            <!-- Event Overview -->
            <div class="ma-section">
                <h2 class="section-title">Event Overview</h2>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="label">Accession Number:</span>
                        <span class="value">${data.accessionNumber}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">CIK:</span>
                        <span class="value">${data.cik}</span>
                    </div>
                    ${parsed?.eventDate ? `
                        <div class="detail-item">
                            <span class="label">Event Date:</span>
                            <span class="value">${parsed.eventDate}</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Items -->
            ${parsed?.items?.length > 0 ? `
                <div class="ma-section">
                    <h2 class="section-title">Items Reported</h2>
                    <div class="items-list">
                        ${parsed.items.map(item => `
                            <div class="item-card">
                                <div class="item-number">Item ${item.itemNumber}</div>
                                <div class="item-description">${item.description}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <!-- Material Agreements -->
            ${parsed?.materialAgreements?.length > 0 ? `
                <div class="ma-section">
                    <h2 class="section-title">Material Agreements</h2>
                    <ul class="agreements-list">
                        ${parsed.materialAgreements.map(agreement => `
                            <li>${agreement.type || agreement}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}

            <!-- Acquisitions -->
            ${parsed?.acquisitions?.length > 0 ? `
                <div class="ma-section">
                    <h2 class="section-title">Acquisitions</h2>
                    ${parsed.acquisitions.map(acq => `
                        <div class="acquisition-card">
                            <div class="acq-type">${acq.type}</div>
                            <div class="acq-value">$${acq.value.toLocaleString()}M ${acq.currency}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Leadership Changes -->
            ${parsed?.leadershipChanges?.length > 0 ? `
                <div class="ma-section">
                    <h2 class="section-title">Leadership Changes</h2>
                    <ul class="leadership-list">
                        ${parsed.leadershipChanges.map(change => `
                            <li><strong>${change.action}</strong> - ${change.position}${change.name ? ` (${change.name})` : ''}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}

            <!-- Financial Results -->
            ${parsed?.financialResults?.hasEarningsRelease ? `
                <div class="ma-section">
                    <h2 class="section-title">Financial Results</h2>
                    <div class="details-grid">
                        ${parsed.financialResults.period ? `
                            <div class="detail-item">
                                <span class="label">Period:</span>
                                <span class="value">${parsed.financialResults.period}</span>
                            </div>
                        ` : ''}
                        ${parsed.financialResults.revenue ? `
                            <div class="detail-item">
                                <span class="label">Revenue:</span>
                                <span class="value">$${parsed.financialResults.revenue.toLocaleString()}M</span>
                            </div>
                        ` : ''}
                        ${parsed.financialResults.netIncome ? `
                            <div class="detail-item">
                                <span class="label">Net Income:</span>
                                <span class="value">$${parsed.financialResults.netIncome.toLocaleString()}M</span>
                            </div>
                        ` : ''}
                        ${parsed.financialResults.eps ? `
                            <div class="detail-item">
                                <span class="label">EPS:</span>
                                <span class="value">$${parsed.financialResults.eps.toFixed(2)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            <!-- Critical Flags -->
            ${(parsed?.criticalFlags?.bankruptcy || parsed?.criticalFlags?.delisting || parsed?.criticalFlags?.goingConcern) ? `
                <div class="ma-section alert-section">
                    <h2 class="section-title">🚨 Critical Alerts</h2>
                    ${parsed.criticalFlags.bankruptcy ? '<p class="alert-critical">⚠ BANKRUPTCY FILING</p>' : ''}
                    ${parsed.criticalFlags.delisting ? '<p class="alert-critical">⚠ DELISTING NOTICE</p>' : ''}
                    ${parsed.criticalFlags.goingConcern ? '<p class="alert-critical">⚠ GOING CONCERN ISSUE</p>' : ''}
                    ${parsed.criticalFlags.materialWeakness ? '<p class="alert-warning">⚠ MATERIAL WEAKNESS DISCLOSED</p>' : ''}
                    ${parsed.criticalFlags.restatement ? '<p class="alert-warning">⚠ FINANCIAL RESTATEMENT</p>' : ''}
                </div>
            ` : ''}

            <!-- Document Link -->
            <div class="ma-section">
                <h2 class="section-title">Original Document</h2>
                <a href="${data.documentURL}" target="_blank" class="btn-link">
                    <i class="fas fa-external-link-alt"></i> View Full 8-K Filing on SEC.gov
                </a>
            </div>
        `;
    }

    renderIntegrationRisk(risk) {
        return `
            <div class="risk-card">
                <div class="risk-score">
                    <div class="risk-value">${risk.overallRisk}</div>
                    <div class="risk-label">${risk.riskLevel} RISK</div>
                </div>
                <div class="risk-breakdown">
                    ${Object.entries(risk.risks).map(([category, value]) => `
                        <div class="risk-item">
                            <div class="risk-item-header">
                                <span>${this.humanizeRiskCategory(category)}</span>
                                <span class="risk-score-mini">${value}/100</span>
                            </div>
                            <div class="risk-bar">
                                <div class="risk-bar-fill" style="width: ${value}%; background: ${this.getRiskColor(value)}"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚨 ALERTS & MONITORING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async startAlertMonitoring() {
        console.log('🚨 Starting alert monitoring...');
        
        // Check for new alerts every 5 minutes
        setInterval(() => {
            this.checkForAlerts();
        }, 5 * 60 * 1000);

        // Initial check
        this.checkForAlerts();
    }

    async checkForAlerts() {
        try {
            const alerts = await this.client.get8KAlerts(['1.01', '2.01'], 1);
            
            if (alerts.count > 0) {
                this.state.alerts = alerts.alerts;
                this.showAlertNotification(alerts.count);
            }
        } catch (error) {
            console.error('❌ Alert check failed:', error);
        }
    }

    showAlertNotification(count) {
        // Create notification
        const notification = document.createElement('div');
        notification.className = 'ma-notification';
        notification.innerHTML = `
            <div class="notification-icon">🚨</div>
            <div class="notification-content">
                <strong>${count} new M&A alert${count > 1 ? 's' : ''}</strong>
                <p>Material events detected in the last 24 hours</p>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 10000);
    }

    async loadAlerts() {
        try {
            const data = await this.client.get8KAlerts(['1.01', '2.01'], 7);
            return data.alerts || [];
        } catch (error) {
            console.error('Failed to load alerts:', error);
            return [];
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⭐ WATCHLIST MANAGEMENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    loadWatchlist() {
        const stored = localStorage.getItem('ma-watchlist');
        return stored ? JSON.parse(stored) : [];
    }

    saveWatchlist() {
        localStorage.setItem('ma-watchlist', JSON.stringify(this.state.watchlist));
    }

    addToWatchlist(ticker) {
        if (!this.state.watchlist.includes(ticker)) {
            this.state.watchlist.push(ticker);
            this.saveWatchlist();
            this.showToast(`${ticker} added to watchlist`);
            this.loadDashboard(); // Refresh
        }
    }

    removeFromWatchlist(ticker) {
        this.state.watchlist = this.state.watchlist.filter(t => t !== ticker);
        this.saveWatchlist();
        this.showToast(`${ticker} removed from watchlist`);
        this.loadDashboard(); // Refresh
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎨 UI UTILITIES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    switchView(viewName) {
        this.state.currentView = viewName;
        
        document.querySelectorAll('[data-ma-view]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.maView === viewName) {
                btn.classList.add('active');
            }
        });

        document.querySelectorAll('.ma-view').forEach(view => {
            view.style.display = 'none';
        });

        const activeView = document.getElementById(`ma-${viewName}-view`);
        if (activeView) {
            activeView.style.display = 'block';
        }
    }

    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="spinner"></div>
                    <p>Loading M&A data...</p>
                </div>
            `;
        }
    }

    showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                    <button class="btn-retry" onclick="maPredictor.loadDashboard()">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
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

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    truncate(text, length) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    getSignalColor(status) {
        const colors = {
            'HIGH': '#ef4444',
            'MEDIUM': '#f59e0b',
            'LOW': '#10b981'
        };
        return colors[status] || '#6b7280';
    }

    getRiskColor(value) {
        if (value >= 70) return '#ef4444';
        if (value >= 40) return '#f59e0b';
        return '#10b981';
    }

    humanizeRiskCategory(category) {
        const names = {
            culturalMismatch: 'Cultural Alignment',
            debtLevel: 'Debt Level',
            synergyRealization: 'Synergy Realization',
            regulatoryComplexity: 'Regulatory Complexity',
            integrationTimeline: 'Integration Timeline'
        };
        return names[category] || category;
    }
}

// Initialize on page load
let maPredictor;

document.addEventListener('DOMContentLoaded', () => {
    // ⚠ IMPORTANT: Remplacez par l'URL réelle de votre worker
    const workerURL = 'https://your-worker.workers.dev';
    
    maPredictor = new MAPredictor({ workerURL });
    window.maPredictor = maPredictor; // Global access
});