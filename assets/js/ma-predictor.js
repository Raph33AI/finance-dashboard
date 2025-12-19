/**
 * ═══════════════════════════════════════════════════════════════════
 * 🤝 M&A PREDICTOR - REFACTORED VERSION
 * ═══════════════════════════════════════════════════════════════════
 * Interface simplifiée pour le M&A Predictor
 * ✅ Suppression de la watchlist et de l'analyse par ticker
 * ✅ Chargement à la demande uniquement
 * ✅ Pagination sur la table
 * ✅ Modal avec parsing des documents SEC
 * ═══════════════════════════════════════════════════════════════════
 */

class MAPredictor {
    constructor(config = {}) {
        this.workerURL = config.workerURL || 'https://sec-edgar-api.raphnardone.workers.dev';
        this.client = new SECMAClient({ workerURL: this.workerURL });
        this.parser = new SECDocumentParser();
        
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
            isLoading: false
        };

        this.init();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎬 INITIALIZATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async init() {
        console.log('🤝 M&A Predictor initializing...');
        
        this.setupEventListeners();
        this.renderEmptyState();
        
        console.log('✅ M&A Predictor ready');
    }

    setupEventListeners() {
        // Bouton de chargement des données
        const loadBtn = document.getElementById('btn-load-data');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadData());
        }

        // Pagination
        const prevBtn = document.getElementById('btn-prev-page');
        const nextBtn = document.getElementById('btn-next-page');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.changePage(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.changePage(1));

        // Fermeture des modals en cliquant à l'extérieur
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeDealModal();
                this.closeModal('filtersInfo');
            }
        });
    }

    renderEmptyState() {
        const container = document.getElementById('ma-dashboard-container');
        if (!container) return;

        container.innerHTML = `
            <div class="ma-filters-section">
                <h2 class="section-title">
                    <i class="fas fa-filter"></i> Data Filters
                    <button class="help-icon" onclick="maPredictor.openModal('filtersInfo')">
                        <i class="fas fa-question-circle"></i>
                    </button>
                </h2>
                
                <div class="filters-grid">
                    <div class="filter-group">
                        <label>
                            <i class="fas fa-calendar"></i> Time Period
                        </label>
                        <select id="time-period-filter" class="filter-select">
                            <option value="7">Last Week</option>
                            <option value="30" selected>Last Month</option>
                            <option value="90">Last 3 Months</option>
                            <option value="180">Last 6 Months</option>
                            <option value="365">Last Year</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>
                            <i class="fas fa-file-alt"></i> Max Filings
                        </label>
                        <select id="max-filings-filter" class="filter-select">
                            <option value="100">100 filings</option>
                            <option value="250" selected>250 filings</option>
                            <option value="500">500 filings</option>
                            <option value="1000">1,000 filings</option>
                            <option value="2000">2,000 filings</option>
                        </select>
                    </div>
                    
                    <div class="filter-group" style="justify-content: flex-end;">
                        <button id="btn-load-data" class="btn-bulk-load">
                            <i class="fas fa-cloud-download-alt"></i>
                            Load M&A Data
                        </button>
                    </div>
                </div>
            </div>

            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-search-dollar"></i>
                </div>
                <h3>No Data Loaded</h3>
                <p>Select your filters above and click "Load M&A Data" to retrieve SEC filings.</p>
                <div class="empty-state-features">
                    <div class="feature-item">
                        <i class="fas fa-file-contract"></i>
                        <span>S-4 Merger Filings</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-bell"></i>
                        <span>8-K Material Events</span>
                    </div>
                    <div class="feature-item">
                        <i class="fas fa-chart-line"></i>
                        <span>Real-Time SEC Data</span>
                    </div>
                </div>
            </div>
        `;

        // Réattacher les event listeners
        this.setupEventListeners();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 DATA LOADING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async loadData() {
        if (this.state.isLoading) {
            console.log('⚠ Already loading data...');
            return;
        }

        // Récupère les valeurs des filtres
        const periodSelect = document.getElementById('time-period-filter');
        const filingsSelect = document.getElementById('max-filings-filter');
        
        if (!periodSelect || !filingsSelect) {
            console.error('❌ Filter elements not found');
            return;
        }

        this.state.filters.period = parseInt(periodSelect.value);
        this.state.filters.maxFilings = parseInt(filingsSelect.value);

        console.log(`📊 Loading data: ${this.state.filters.period} days, max ${this.state.filters.maxFilings} filings`);
        
        this.state.isLoading = true;
        this.showProgressModal();
        
        try {
            // Chargement des S-4 et 8-K
            this.updateProgress(0, 'Connecting to SEC EDGAR...');
            
            const [s4Data, eightKData] = await Promise.all([
                this.loadS4Filings(),
                this.load8KFilings()
            ]);

            // Combine et trie les données
            this.state.currentDeals = [...s4Data, ...eightKData].sort((a, b) => 
                new Date(b.filedDate) - new Date(a.filedDate)
            );

            this.state.filteredDeals = [...this.state.currentDeals];
            this.state.totalPages = Math.ceil(this.state.filteredDeals.length / this.state.itemsPerPage);
            this.state.currentPage = 1;

            this.updateProgress(100, `Loaded ${this.state.currentDeals.length} filings!`);

            setTimeout(() => {
                this.hideProgressModal();
                this.renderDealsTable();
                this.showDealsSection();
                this.showToast(`✅ Successfully loaded ${this.state.currentDeals.length} M&A filings!`);
            }, 500);

        } catch (error) {
            console.error('❌ Data loading failed:', error);
            this.hideProgressModal();
            this.showToast('❌ Failed to load data. Please check your connection and try again.');
        } finally {
            this.state.isLoading = false;
        }
    }

    async loadS4Filings() {
        this.updateProgress(20, 'Loading S-4 merger filings...');
        
        try {
            const response = await this.client.getRecentDeals({
                days: this.state.filters.period,
                minValue: 0
            });

            const deals = response.deals || [];
            
            this.updateProgress(50, `Loaded ${deals.length} S-4 filings...`);
            
            return deals.map(deal => ({
                ...deal,
                formType: 'S-4',
                source: 'S-4',
                description: deal.dealType || 'Merger/Acquisition',
                url: this.buildSECUrl(deal.cik, deal.accessionNumber)
            }));

        } catch (error) {
            console.error('❌ S-4 loading failed:', error);
            return [];
        }
    }

    async load8KFilings() {
        this.updateProgress(60, 'Loading 8-K material events...');
        
        try {
            const response = await this.client.get8KAlerts(
                ['1.01', '2.01', '2.03', '5.02', '8.01'],
                this.state.filters.period
            );

            const alerts = response.alerts || [];
            
            this.updateProgress(90, `Loaded ${alerts.length} 8-K filings...`);
            
            return alerts.map(alert => ({
                ...alert,
                formType: '8-K',
                source: '8-K',
                description: this.get8KDescription(alert.items),
                url: this.buildSECUrl(alert.cik, alert.accessionNumber)
            }));

        } catch (error) {
            console.error('❌ 8-K loading failed:', error);
            return [];
        }
    }

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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📋 TABLE RENDERING & PAGINATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    renderDealsTable() {
        const tbody = document.getElementById('ma-deals-tbody');
        const badge = document.getElementById('deals-count-badge');
        
        if (!tbody || !badge) {
            console.error('❌ Table elements not found');
            return;
        }

        tbody.innerHTML = '';
        badge.textContent = this.state.filteredDeals.length;

        const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const endIndex = Math.min(startIndex + this.state.itemsPerPage, this.state.filteredDeals.length);
        
        const pageDeals = this.state.filteredDeals.slice(startIndex, endIndex);

        if (pageDeals.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px;">
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
                <td>${deal.description}</td>
                <td>
                    <button class="btn-action" onclick="maPredictor.viewDealDetails(${startIndex + index})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.updatePagination();
    }

    changePage(direction) {
        const newPage = this.state.currentPage + direction;
        
        if (newPage < 1 || newPage > this.state.totalPages) {
            return;
        }

        this.state.currentPage = newPage;
        this.renderDealsTable();
        
        // Scroll to top of table
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

    showDealsSection() {
        const section = document.getElementById('ma-deals-section');
        if (section) {
            section.style.display = 'block';
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📄 DEAL DETAILS MODAL (avec parsing SEC)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // async viewDealDetails(index) {
    //     const deal = this.state.filteredDeals[index];
        
    //     if (!deal) {
    //         console.error('❌ Deal not found at index:', index);
    //         return;
    //     }

    //     console.log('📄 Viewing deal details:', deal);

    //     const modal = document.getElementById('dealDetailsModal');
    //     const title = document.getElementById('modal-deal-title');
    //     const body = document.getElementById('modal-deal-body');

    //     if (!modal || !title || !body) {
    //         console.error('❌ Modal elements not found');
    //         return;
    //     }

    //     // Affiche le modal avec loader
    //     title.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading Document...`;
    //     body.innerHTML = `
    //         <div style="text-align: center; padding: 60px;">
    //             <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #667eea;"></i>
    //             <p style="margin-top: 20px; opacity: 0.7;">Parsing SEC document...</p>
    //         </div>
    //     `;
        
    //     modal.style.display = 'flex';

    //     // Parse le document SEC
    //     try {
    //         const parsedData = await this.parser.parseDocument(deal.url);
    //         const html = this.parser.generateDisplayHTML(parsedData);

    //         title.innerHTML = `
    //             <i class="fas fa-file-contract"></i> 
    //             ${deal.formType} - ${deal.companyName || 'SEC Filing'}
    //         `;
    //         body.innerHTML = html;

    //     } catch (error) {
    //         console.error('❌ Error parsing document:', error);
            
    //         title.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error Loading Document`;
    //         body.innerHTML = `
    //             <div class="error-container">
    //                 <i class="fas fa-exclamation-triangle"></i>
    //                 <h3>Failed to Parse Document</h3>
    //                 <p>${error.message}</p>
    //                 <a href="${deal.url}" target="_blank" class="btn-external-link">
    //                     <i class="fas fa-external-link-alt"></i> View Original on SEC.gov
    //                 </a>
    //             </div>
    //         `;
    //     }
    // }

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

        // Affiche le modal avec loader
        title.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading Document...`;
        body.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #667eea;"></i>
                <p style="margin-top: 20px; opacity: 0.7;">Parsing SEC document via Worker...</p>
            </div>
        `;
        
        modal.style.display = 'flex';

        // ✅ UTILISE LE WORKER AU LIEU DU PARSER LOCAL
        try {
            console.log('🌐 Requesting document from Worker:', deal.url);
            
            // Appelle le Worker pour parser le document
            const parsedData = await this.client.getDocumentParsed(deal.url);

            // Génère le HTML d'affichage
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

    /**
     * 🎨 Génère le HTML d'affichage du document parsé
     */
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
                    ${content.cik ? `<p class="doc-meta"><strong>CIK:</strong> ${content.cik}</p>` : ''}
                    ${content.filingDate ? `<p class="doc-meta"><strong>Filing Date:</strong> ${this.formatDate(content.filingDate)}</p>` : ''}
                </div>
        `;

        // Items (pour les 8-K)
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

        // Merger Info (pour les S-4)
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

        // ✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ✅ OFFERINGS SECTION (NOUVEAU)
        // ✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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

        // Contenu principal
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

    showProgressModal() {
        const modal = document.getElementById('progressModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideProgressModal() {
        const modal = document.getElementById('progressModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateProgress(percent, message) {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('bulk-progress-text');

        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }

        if (progressText) {
            progressText.textContent = message;
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
        window.maPredictor = maPredictor; // Accès global pour onclick
        
        console.log('✅ M&A Predictor initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize M&A Predictor:', error);
    }
});