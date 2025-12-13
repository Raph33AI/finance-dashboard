/**
 * ═══════════════════════════════════════════════════════════════════
 * 🚀 IPO INTELLIGENCE DASHBOARD - ALPHAVAULT AI
 * ═══════════════════════════════════════════════════════════════════
 */

class IPOIntelligenceDashboard {
    constructor() {
        this.secClient = new SECApiClient();
        this.ipos = [];
        this.enrichedIPOs = [];
        this.currentPeriod = 30;
        
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

        // Export button
        document.getElementById('exportData')?.addEventListener('click', () => {
            this.openModal('exportModal');
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

        // Export format buttons
        document.querySelectorAll('[data-format]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.exportData(e.target.closest('[data-format]').dataset.format);
            });
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            });
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
            
            // Enrich IPOs with analysis
            this.enrichedIPOs = await Promise.all(
                this.ipos.map(ipo => this.secClient.analyzeIPO(ipo))
            );

            console.log(`✅ Loaded ${this.enrichedIPOs.length} IPOs`);
            
        } catch (error) {
            console.error('❌ Error loading IPO data:', error);
            this.showError('Failed to load IPO data. Please try again.');
        }
    }

    renderAll() {
        this.renderSummaryCards();
        this.renderHeatmap();
        this.renderPipeline();
        this.renderTopIPOs();
        this.renderLockUpTracker();
    }

    renderSummaryCards() {
        const container = document.getElementById('summaryCards');
        if (!container) return;

        const totalIPOs = this.enrichedIPOs.length;
        const avgScore = (this.enrichedIPOs.reduce((sum, ipo) => sum + ipo.successScore, 0) / totalIPOs).toFixed(1);
        
        const sectors = {};
        this.enrichedIPOs.forEach(ipo => {
            sectors[ipo.sector] = (sectors[ipo.sector] || 0) + 1;
        });
        const topSector = Object.entries(sectors).sort((a, b) => b[1] - a[1])[0];
        
        const recentIPOs = this.enrichedIPOs.filter(ipo => {
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
                </div>
                <div class='eco-value'>${recentIPOs}</div>
                <div class='eco-sublabel'>New filings</div>
            </div>
        `;

        container.innerHTML = html;
    }

    renderHeatmap() {
        const sectors = {};
        
        this.enrichedIPOs.forEach(ipo => {
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
                    style: { color: getComputedStyle(document.body).getPropertyValue('--text-primary') }
                }
            },
            yAxis: {
                categories: ['IPO Count'],
                title: null,
                labels: {
                    style: { color: getComputedStyle(document.body).getPropertyValue('--text-primary') }
                }
            },
            colorAxis: {
                min: 0,
                minColor: '#e0e7ff',
                maxColor: '#667eea'
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
                borderWidth: 1,
                data: data,
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    style: { fontWeight: 'bold' }
                }
            }],
            credits: { enabled: false }
        });
    }

    renderPipeline() {
        const container = document.getElementById('ipoPipeline');
        if (!container) return;

        const topIPOs = [...this.enrichedIPOs]
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

        const topIPOs = [...this.enrichedIPOs]
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

        tbody.innerHTML = html;
    }

    renderLockUpTracker() {
        const container = document.getElementById('lockupGrid');
        if (!container) return;

        const lockUpIPOs = this.enrichedIPOs
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

        container.innerHTML = html;
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
                    <i class='fas fa-file-alt'></i> Filing Information
                </h3>
                
                <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin-bottom: 20px;'>
                    <p><strong>Form Type:</strong> ${ipo.formType}</p>
                    <p><strong>Filing Stage:</strong> ${ipo.filingStage}</p>
                    <p><strong>Filed Date:</strong> ${new Date(ipo.filedDate).toLocaleDateString()}</p>
                    <p><strong>Accession Number:</strong> ${ipo.accessionNumber || 'N/A'}</p>
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

    exportData(format) {
        console.log(`📤 Exporting data as ${format}...`);
        
        if (format === 'csv') {
            this.exportAsCSV();
        } else if (format === 'json') {
            this.exportAsJSON();
        } else if (format === 'pdf') {
            alert('PDF export will be implemented soon!');
        }
        
        this.closeModal('exportModal');
    }

    exportAsCSV() {
        const headers = ['Rank', 'Company', 'CIK', 'Sector', 'Success Score', 'Form Type', 'Filing Stage', 'Filed Date'];
        const rows = this.enrichedIPOs
            .sort((a, b) => b.successScore - a.successScore)
            .map((ipo, index) => [
                index + 1,
                `"${ipo.companyName}"`,
                ipo.cik || 'N/A',
                ipo.sector,
                ipo.successScore,
                ipo.formType,
                ipo.filingStage,
                new Date(ipo.filedDate).toLocaleDateString()
            ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ipo-intelligence-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }

    exportAsJSON() {
        const data = {
            exportDate: new Date().toISOString(),
            totalIPOs: this.enrichedIPOs.length,
            ipos: this.enrichedIPOs
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ipo-intelligence-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
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