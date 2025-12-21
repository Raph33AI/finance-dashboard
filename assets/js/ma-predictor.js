// // /**
// //  * ═══════════════════════════════════════════════════════════════════
// //  * 🤝 M&A PREDICTOR - REFACTORED VERSION
// //  * ═══════════════════════════════════════════════════════════════════
// //  * Interface simplifiée pour le M&A Predictor
// //  * ✅ Suppression de la watchlist et de l'analyse par ticker
// //  * ✅ Chargement à la demande uniquement
// //  * ✅ Pagination sur la table
// //  * ✅ Modal avec parsing des documents SEC
// //  * ═══════════════════════════════════════════════════════════════════
// //  */

// // class MAPredictor {
// //     constructor(config = {}) {
// //         this.workerURL = config.workerURL || 'https://sec-edgar-api.raphnardone.workers.dev';
// //         this.client = new SECMAClient({ workerURL: this.workerURL });
// //         this.parser = new SECDocumentParser();
        
// //         this.state = {
// //             currentDeals: [],
// //             filteredDeals: [],
// //             currentPage: 1,
// //             itemsPerPage: 20,
// //             totalPages: 1,
// //             filters: {
// //                 period: 30,
// //                 maxFilings: 250
// //             },
// //             isLoading: false
// //         };

// //         this.init();
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 🎬 INITIALIZATION
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     async init() {
// //         console.log('🤝 M&A Predictor initializing...');
        
// //         this.setupEventListeners();
// //         this.renderEmptyState();
        
// //         console.log('✅ M&A Predictor ready');
// //     }

// //     setupEventListeners() {
// //         // Bouton de chargement des données
// //         const loadBtn = document.getElementById('btn-load-data');
// //         if (loadBtn) {
// //             loadBtn.addEventListener('click', () => this.loadData());
// //         }

// //         // Pagination
// //         const prevBtn = document.getElementById('btn-prev-page');
// //         const nextBtn = document.getElementById('btn-next-page');
        
// //         if (prevBtn) prevBtn.addEventListener('click', () => this.changePage(-1));
// //         if (nextBtn) nextBtn.addEventListener('click', () => this.changePage(1));

// //         // Fermeture des modals en cliquant à l'extérieur
// //         window.addEventListener('click', (e) => {
// //             if (e.target.classList.contains('modal')) {
// //                 this.closeDealModal();
// //                 this.closeModal('filtersInfo');
// //             }
// //         });
// //     }

// //     renderEmptyState() {
// //         const container = document.getElementById('ma-dashboard-container');
// //         if (!container) return;

// //         container.innerHTML = `
// //             <div class="ma-filters-section">
// //                 <h2 class="section-title">
// //                     <i class="fas fa-filter"></i> Data Filters
// //                     <button class="help-icon" onclick="maPredictor.openModal('filtersInfo')">
// //                         <i class="fas fa-question-circle"></i>
// //                     </button>
// //                 </h2>
                
// //                 <div class="filters-grid">
// //                     <div class="filter-group">
// //                         <label>
// //                             <i class="fas fa-calendar"></i> Time Period
// //                         </label>
// //                         <select id="time-period-filter" class="filter-select">
// //                             <option value="7">Last Week</option>
// //                             <option value="30" selected>Last Month</option>
// //                             <option value="90">Last 3 Months</option>
// //                             <option value="180">Last 6 Months</option>
// //                             <option value="365">Last Year</option>
// //                         </select>
// //                     </div>
                    
// //                     <div class="filter-group">
// //                         <label>
// //                             <i class="fas fa-file-alt"></i> Max Filings
// //                         </label>
// //                         <select id="max-filings-filter" class="filter-select">
// //                             <option value="100">100 filings</option>
// //                             <option value="250" selected>250 filings</option>
// //                             <option value="500">500 filings</option>
// //                             <option value="1000">1,000 filings</option>
// //                             <option value="2000">2,000 filings</option>
// //                         </select>
// //                     </div>
                    
// //                     <div class="filter-group" style="justify-content: flex-end;">
// //                         <button id="btn-load-data" class="btn-bulk-load">
// //                             <i class="fas fa-cloud-download-alt"></i>
// //                             Load M&A Data
// //                         </button>
// //                     </div>
// //                 </div>
// //             </div>

// //             <div class="empty-state">
// //                 <div class="empty-state-icon">
// //                     <i class="fas fa-search-dollar"></i>
// //                 </div>
// //                 <h3>No Data Loaded</h3>
// //                 <p>Select your filters above and click "Load M&A Data" to retrieve SEC filings.</p>
// //                 <div class="empty-state-features">
// //                     <div class="feature-item">
// //                         <i class="fas fa-file-contract"></i>
// //                         <span>S-4 Merger Filings</span>
// //                     </div>
// //                     <div class="feature-item">
// //                         <i class="fas fa-bell"></i>
// //                         <span>8-K Material Events</span>
// //                     </div>
// //                     <div class="feature-item">
// //                         <i class="fas fa-chart-line"></i>
// //                         <span>Real-Time SEC Data</span>
// //                     </div>
// //                 </div>
// //             </div>
// //         `;

// //         // Réattacher les event listeners
// //         this.setupEventListeners();
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 📊 DATA LOADING
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     async loadData() {
// //         if (this.state.isLoading) {
// //             console.log('⚠ Already loading data...');
// //             return;
// //         }

// //         // Récupère les valeurs des filtres
// //         const periodSelect = document.getElementById('time-period-filter');
// //         const filingsSelect = document.getElementById('max-filings-filter');
        
// //         if (!periodSelect || !filingsSelect) {
// //             console.error('❌ Filter elements not found');
// //             return;
// //         }

// //         this.state.filters.period = parseInt(periodSelect.value);
// //         this.state.filters.maxFilings = parseInt(filingsSelect.value);

// //         console.log(`📊 Loading data: ${this.state.filters.period} days, max ${this.state.filters.maxFilings} filings`);
        
// //         this.state.isLoading = true;
// //         this.showProgressModal();
        
// //         try {
// //             // Chargement des S-4 et 8-K
// //             this.updateProgress(0, 'Connecting to SEC EDGAR...');
            
// //             const [s4Data, eightKData] = await Promise.all([
// //                 this.loadS4Filings(),
// //                 this.load8KFilings()
// //             ]);

// //             // Combine et trie les données
// //             this.state.currentDeals = [...s4Data, ...eightKData].sort((a, b) => 
// //                 new Date(b.filedDate) - new Date(a.filedDate)
// //             );

// //             this.state.filteredDeals = [...this.state.currentDeals];
// //             this.state.totalPages = Math.ceil(this.state.filteredDeals.length / this.state.itemsPerPage);
// //             this.state.currentPage = 1;

// //             this.updateProgress(100, `Loaded ${this.state.currentDeals.length} filings!`);

// //             setTimeout(() => {
// //                 this.hideProgressModal();
// //                 this.renderDealsTable();
// //                 this.showDealsSection();
// //                 this.showToast(`✅ Successfully loaded ${this.state.currentDeals.length} M&A filings!`);
// //             }, 500);

// //         } catch (error) {
// //             console.error('❌ Data loading failed:', error);
// //             this.hideProgressModal();
// //             this.showToast('❌ Failed to load data. Please check your connection and try again.');
// //         } finally {
// //             this.state.isLoading = false;
// //         }
// //     }

// //     async loadS4Filings() {
// //         this.updateProgress(20, 'Loading S-4 merger filings...');
        
// //         try {
// //             const response = await this.client.getRecentDeals({
// //                 days: this.state.filters.period,
// //                 minValue: 0
// //             });

// //             const deals = response.deals || [];
            
// //             this.updateProgress(50, `Loaded ${deals.length} S-4 filings...`);
            
// //             return deals.map(deal => ({
// //                 ...deal,
// //                 formType: 'S-4',
// //                 source: 'S-4',
// //                 description: deal.dealType || 'Merger/Acquisition',
// //                 url: this.buildSECUrl(deal.cik, deal.accessionNumber)
// //             }));

// //         } catch (error) {
// //             console.error('❌ S-4 loading failed:', error);
// //             return [];
// //         }
// //     }

// //     async load8KFilings() {
// //         this.updateProgress(60, 'Loading 8-K material events...');
        
// //         try {
// //             const response = await this.client.get8KAlerts(
// //                 ['1.01', '2.01', '2.03', '5.02', '8.01'],
// //                 this.state.filters.period
// //             );

// //             const alerts = response.alerts || [];
            
// //             this.updateProgress(90, `Loaded ${alerts.length} 8-K filings...`);
            
// //             return alerts.map(alert => ({
// //                 ...alert,
// //                 formType: '8-K',
// //                 source: '8-K',
// //                 description: this.get8KDescription(alert.items),
// //                 url: this.buildSECUrl(alert.cik, alert.accessionNumber)
// //             }));

// //         } catch (error) {
// //             console.error('❌ 8-K loading failed:', error);
// //             return [];
// //         }
// //     }

// //     buildSECUrl(cik, accession) {
// //         const cleanAccession = accession.replace(/-/g, '');
// //         return `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${accession}&xbrl_type=v`;
// //     }

// //     get8KDescription(items) {
// //         if (!items || items.length === 0) return 'Material Event';
        
// //         const descriptions = {
// //             '1.01': 'Material Definitive Agreement',
// //             '2.01': 'Completion of Acquisition/Disposition',
// //             '2.03': 'Creation of Direct Financial Obligation',
// //             '5.02': 'Departure/Election of Directors/Officers',
// //             '8.01': 'Other Events'
// //         };

// //         return items.map(item => descriptions[item] || `Item ${item}`).join(', ');
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 📋 TABLE RENDERING & PAGINATION
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     renderDealsTable() {
// //         const tbody = document.getElementById('ma-deals-tbody');
// //         const badge = document.getElementById('deals-count-badge');
        
// //         if (!tbody || !badge) {
// //             console.error('❌ Table elements not found');
// //             return;
// //         }

// //         tbody.innerHTML = '';
// //         badge.textContent = this.state.filteredDeals.length;

// //         const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
// //         const endIndex = Math.min(startIndex + this.state.itemsPerPage, this.state.filteredDeals.length);
        
// //         const pageDeals = this.state.filteredDeals.slice(startIndex, endIndex);

// //         if (pageDeals.length === 0) {
// //             tbody.innerHTML = `
// //                 <tr>
// //                     <td colspan="5" style="text-align: center; padding: 40px;">
// //                         <i class="fas fa-inbox" style="font-size: 3rem; opacity: 0.3;"></i>
// //                         <p style="margin-top: 20px; opacity: 0.6;">No M&A deals found for selected filters</p>
// //                     </td>
// //                 </tr>
// //             `;
// //             return;
// //         }

// //         pageDeals.forEach((deal, index) => {
// //             const row = document.createElement('tr');
// //             row.innerHTML = `
// //                 <td>${this.formatDate(deal.filedDate)}</td>
// //                 <td>
// //                     <strong>${deal.companyName || 'Unknown Company'}</strong><br>
// //                     <small style="opacity: 0.7;">CIK: ${deal.cik}</small>
// //                 </td>
// //                 <td><span class="form-badge form-${deal.formType.toLowerCase()}">${deal.formType}</span></td>
// //                 <td>${deal.description}</td>
// //                 <td>
// //                     <button class="btn-action" onclick="maPredictor.viewDealDetails(${startIndex + index})">
// //                         <i class="fas fa-eye"></i> View Details
// //                     </button>
// //                 </td>
// //             `;
// //             tbody.appendChild(row);
// //         });

// //         this.updatePagination();
// //     }

// //     changePage(direction) {
// //         const newPage = this.state.currentPage + direction;
        
// //         if (newPage < 1 || newPage > this.state.totalPages) {
// //             return;
// //         }

// //         this.state.currentPage = newPage;
// //         this.renderDealsTable();
        
// //         // Scroll to top of table
// //         document.getElementById('ma-deals-section')?.scrollIntoView({ behavior: 'smooth' });
// //     }

// //     updatePagination() {
// //         const prevBtn = document.getElementById('btn-prev-page');
// //         const nextBtn = document.getElementById('btn-next-page');
// //         const info = document.getElementById('pagination-info');

// //         if (!prevBtn || !nextBtn || !info) return;

// //         prevBtn.disabled = this.state.currentPage === 1;
// //         nextBtn.disabled = this.state.currentPage === this.state.totalPages;

// //         info.textContent = `Page ${this.state.currentPage} of ${this.state.totalPages}`;
// //     }

// //     showDealsSection() {
// //         const section = document.getElementById('ma-deals-section');
// //         if (section) {
// //             section.style.display = 'block';
// //         }
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 📄 DEAL DETAILS MODAL (avec parsing SEC)
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     // async viewDealDetails(index) {
// //     //     const deal = this.state.filteredDeals[index];
        
// //     //     if (!deal) {
// //     //         console.error('❌ Deal not found at index:', index);
// //     //         return;
// //     //     }

// //     //     console.log('📄 Viewing deal details:', deal);

// //     //     const modal = document.getElementById('dealDetailsModal');
// //     //     const title = document.getElementById('modal-deal-title');
// //     //     const body = document.getElementById('modal-deal-body');

// //     //     if (!modal || !title || !body) {
// //     //         console.error('❌ Modal elements not found');
// //     //         return;
// //     //     }

// //     //     // Affiche le modal avec loader
// //     //     title.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading Document...`;
// //     //     body.innerHTML = `
// //     //         <div style="text-align: center; padding: 60px;">
// //     //             <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #667eea;"></i>
// //     //             <p style="margin-top: 20px; opacity: 0.7;">Parsing SEC document...</p>
// //     //         </div>
// //     //     `;
        
// //     //     modal.style.display = 'flex';

// //     //     // Parse le document SEC
// //     //     try {
// //     //         const parsedData = await this.parser.parseDocument(deal.url);
// //     //         const html = this.parser.generateDisplayHTML(parsedData);

// //     //         title.innerHTML = `
// //     //             <i class="fas fa-file-contract"></i> 
// //     //             ${deal.formType} - ${deal.companyName || 'SEC Filing'}
// //     //         `;
// //     //         body.innerHTML = html;

// //     //     } catch (error) {
// //     //         console.error('❌ Error parsing document:', error);
            
// //     //         title.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error Loading Document`;
// //     //         body.innerHTML = `
// //     //             <div class="error-container">
// //     //                 <i class="fas fa-exclamation-triangle"></i>
// //     //                 <h3>Failed to Parse Document</h3>
// //     //                 <p>${error.message}</p>
// //     //                 <a href="${deal.url}" target="_blank" class="btn-external-link">
// //     //                     <i class="fas fa-external-link-alt"></i> View Original on SEC.gov
// //     //                 </a>
// //     //             </div>
// //     //         `;
// //     //     }
// //     // }

// //     async viewDealDetails(index) {
// //         const deal = this.state.filteredDeals[index];
        
// //         if (!deal) {
// //             console.error('❌ Deal not found at index:', index);
// //             return;
// //         }

// //         console.log('📄 Viewing deal details:', deal);

// //         const modal = document.getElementById('dealDetailsModal');
// //         const title = document.getElementById('modal-deal-title');
// //         const body = document.getElementById('modal-deal-body');

// //         if (!modal || !title || !body) {
// //             console.error('❌ Modal elements not found');
// //             return;
// //         }

// //         // Affiche le modal avec loader
// //         title.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading Document...`;
// //         body.innerHTML = `
// //             <div style="text-align: center; padding: 60px;">
// //                 <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #667eea;"></i>
// //                 <p style="margin-top: 20px; opacity: 0.7;">Parsing SEC document via Worker...</p>
// //             </div>
// //         `;
        
// //         modal.style.display = 'flex';

// //         // ✅ UTILISE LE WORKER AU LIEU DU PARSER LOCAL
// //         try {
// //             console.log('🌐 Requesting document from Worker:', deal.url);
            
// //             // Appelle le Worker pour parser le document
// //             const parsedData = await this.client.getDocumentParsed(deal.url);

// //             // Génère le HTML d'affichage
// //             const html = this.generateDocumentHTML(parsedData, deal);

// //             title.innerHTML = `
// //                 <i class="fas fa-file-contract"></i> 
// //                 ${deal.formType} - ${deal.companyName || 'SEC Filing'}
// //             `;
// //             body.innerHTML = html;

// //         } catch (error) {
// //             console.error('❌ Error loading document:', error);
            
// //             title.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error Loading Document`;
// //             body.innerHTML = `
// //                 <div class="error-container">
// //                     <i class="fas fa-exclamation-triangle"></i>
// //                     <h3>Failed to Load Document</h3>
// //                     <p>${error.message}</p>
// //                     <p style="margin-top: 16px; opacity: 0.7;">The Worker may be unavailable or the document format is unsupported.</p>
// //                     <a href="${deal.url}" target="_blank" class="btn-external-link">
// //                         <i class="fas fa-external-link-alt"></i> View Original on SEC.gov
// //                     </a>
// //                 </div>
// //             `;
// //         }
// //     }

// //     /**
// //      * 🎨 Génère le HTML d'affichage du document parsé
// //      */
// //     generateDocumentHTML(data, deal) {
// //         if (!data || !data.success) {
// //             return `
// //                 <div class="error-container">
// //                     <i class="fas fa-exclamation-triangle"></i>
// //                     <h3>Parsing Failed</h3>
// //                     <p>${data?.error || 'Unknown error'}</p>
// //                 </div>
// //             `;
// //         }

// //         const { type, content } = data;

// //         let html = `
// //             <div class="sec-document-container">
// //                 <div class="sec-document-header">
// //                     <div class="doc-type-badge">${type || deal.formType}</div>
// //                     <h3>${content.companyName || deal.companyName || 'SEC Filing'}</h3>
// //                     ${content.cik ? `<p class="doc-meta"><strong>CIK:</strong> ${content.cik}</p>` : ''}
// //                     ${content.filingDate ? `<p class="doc-meta"><strong>Filing Date:</strong> ${this.formatDate(content.filingDate)}</p>` : ''}
// //                 </div>
// //         `;

// //         // Items (pour les 8-K)
// //         if (content.items && content.items.length > 0) {
// //             html += `
// //                 <div class="sec-items-section">
// //                     <h4><i class="fas fa-list"></i> Items Reported</h4>
// //                     <ul class="sec-items-list">
// //                         ${content.items.map(item => `
// //                             <li><strong>Item ${item.code || item}:</strong> ${item.name || item.description || ''}</li>
// //                         `).join('')}
// //                     </ul>
// //                 </div>
// //             `;
// //         }

// //         // Merger Info (pour les S-4)
// //         if (content.mergerInfo) {
// //             html += `
// //                 <div class="sec-merger-section">
// //                     <h4><i class="fas fa-handshake"></i> Merger Information</h4>
// //                     <div class="merger-grid">
// //                         ${content.mergerInfo.acquirer ? `
// //                             <div class="merger-item">
// //                                 <span class="merger-label">Acquirer:</span>
// //                                 <span class="merger-value">${content.mergerInfo.acquirer}</span>
// //                             </div>
// //                         ` : ''}
// //                         ${content.mergerInfo.target ? `
// //                             <div class="merger-item">
// //                                 <span class="merger-label">Target:</span>
// //                                 <span class="merger-value">${content.mergerInfo.target}</span>
// //                             </div>
// //                         ` : ''}
// //                         ${content.mergerInfo.dealValue ? `
// //                             <div class="merger-item">
// //                                 <span class="merger-label">Deal Value:</span>
// //                                 <span class="merger-value">${content.mergerInfo.dealValue}</span>
// //                             </div>
// //                         ` : ''}
// //                     </div>
// //                 </div>
// //             `;
// //         }

// //         // ✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //         // ✅ OFFERINGS SECTION (NOUVEAU)
// //         // ✅ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //         if (content.offerings && content.offerings.length > 0) {
// //             html += `
// //                 <div class="sec-offerings-section">
// //                     <h4><i class="fas fa-file-invoice-dollar"></i> Offerings (${content.offerings.length})</h4>
                    
// //                     ${content.offeringsMetadata ? `
// //                         <div class="offerings-summary">
// //                             <div class="summary-item">
// //                                 <span class="summary-label">Total Offerings:</span>
// //                                 <span class="summary-value">${content.offeringsMetadata.totalOfferings}</span>
// //                             </div>
// //                             <div class="summary-item">
// //                                 <span class="summary-label">Total Max Aggregate Price:</span>
// //                                 <span class="summary-value">$${content.offeringsMetadata.totalMaxAggregatePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
// //                             </div>
// //                             <div class="summary-item">
// //                                 <span class="summary-label">Total Registration Fees:</span>
// //                                 <span class="summary-value">$${content.offeringsMetadata.totalRegistrationFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
// //                             </div>
// //                         </div>
// //                     ` : ''}
                    
// //                     <div class="offerings-list">
// //                         ${content.offerings.map(offering => `
// //                             <div class="offering-card">
// //                                 <div class="offering-header">
// //                                     <span class="offering-number">Offering ${offering.offeringNumber}</span>
// //                                     <div class="offering-badges">
// //                                         ${offering.feePreviousPaid ? '<span class="badge badge-success">Fee Paid</span>' : '<span class="badge badge-warning">Fee Unpaid</span>'}
// //                                         ${offering.securityType ? `<span class="badge badge-${offering.securityType.toLowerCase() === 'equity' ? 'primary' : 'secondary'}">${offering.securityType}</span>` : ''}
// //                                     </div>
// //                                 </div>
                                
// //                                 <div class="offering-details">
// //                                     ${offering.securityClassTitle ? `
// //                                         <div class="offering-row">
// //                                             <span class="offering-label">Security Class:</span>
// //                                             <span class="offering-value">${offering.securityClassTitle}</span>
// //                                         </div>
// //                                     ` : ''}
                                    
// //                                     ${offering.amountRegistered ? `
// //                                         <div class="offering-row">
// //                                             <span class="offering-label">Amount Registered:</span>
// //                                             <span class="offering-value">${offering.amountRegistered.toLocaleString()} shares</span>
// //                                         </div>
// //                                     ` : ''}
                                    
// //                                     ${offering.proposedMaxOfferingPricePerUnit ? `
// //                                         <div class="offering-row">
// //                                             <span class="offering-label">Price per Unit:</span>
// //                                             <span class="offering-value">${offering.proposedMaxOfferingPricePerUnit}</span>
// //                                         </div>
// //                                     ` : ''}
                                    
// //                                     ${offering.maximumAggregateOfferingPrice ? `
// //                                         <div class="offering-row highlight">
// //                                             <span class="offering-label">Max Aggregate Price:</span>
// //                                             <span class="offering-value">${offering.maximumAggregateOfferingPrice}</span>
// //                                         </div>
// //                                     ` : ''}
                                    
// //                                     ${offering.feeRate ? `
// //                                         <div class="offering-row">
// //                                             <span class="offering-label">Fee Rate:</span>
// //                                             <span class="offering-value">${offering.feeRate}</span>
// //                                         </div>
// //                                     ` : ''}
                                    
// //                                     ${offering.amountOfRegistrationFee ? `
// //                                         <div class="offering-row">
// //                                             <span class="offering-label">Registration Fee:</span>
// //                                             <span class="offering-value">${offering.amountOfRegistrationFee}</span>
// //                                         </div>
// //                                     ` : ''}
                                    
// //                                     ${offering.offeringNote ? `
// //                                         <div class="offering-note">
// //                                             <strong>Note:</strong> ${offering.offeringNote}
// //                                         </div>
// //                                     ` : ''}
// //                                 </div>
// //                             </div>
// //                         `).join('')}
// //                     </div>
// //                 </div>
// //             `;
// //         }

// //         // Contenu principal
// //         if (content.htmlContent) {
// //             html += `
// //                 <div class="sec-document-content">
// //                     <h4><i class="fas fa-file-alt"></i> Document Content</h4>
// //                     <div class="content-body">
// //                         ${content.htmlContent}
// //                     </div>
// //                 </div>
// //             `;
// //         }

// //         html += `
// //                 <div class="sec-document-footer">
// //                     <a href="${deal.url}" target="_blank" class="btn-external-link">
// //                         <i class="fas fa-external-link-alt"></i> View Full Document on SEC.gov
// //                     </a>
// //                 </div>
// //             </div>
// //         `;

// //         return html;
// //     }

// //     closeDealModal() {
// //         const modal = document.getElementById('dealDetailsModal');
// //         if (modal) {
// //             modal.style.display = 'none';
// //         }
// //     }

// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// //     // 🎨 UI UTILITIES
// //     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// //     showProgressModal() {
// //         const modal = document.getElementById('progressModal');
// //         if (modal) {
// //             modal.style.display = 'flex';
// //         }
// //     }

// //     hideProgressModal() {
// //         const modal = document.getElementById('progressModal');
// //         if (modal) {
// //             modal.style.display = 'none';
// //         }
// //     }

// //     updateProgress(percent, message) {
// //         const progressBar = document.getElementById('progress-bar');
// //         const progressText = document.getElementById('bulk-progress-text');

// //         if (progressBar) {
// //             progressBar.style.width = `${percent}%`;
// //         }

// //         if (progressText) {
// //             progressText.textContent = message;
// //         }
// //     }

// //     showToast(message) {
// //         const toast = document.createElement('div');
// //         toast.className = 'ma-toast';
// //         toast.textContent = message;
// //         document.body.appendChild(toast);

// //         setTimeout(() => toast.classList.add('show'), 100);
// //         setTimeout(() => {
// //             toast.classList.remove('show');
// //             setTimeout(() => toast.remove(), 300);
// //         }, 3000);
// //     }

// //     openModal(modalId) {
// //         const modal = document.getElementById(modalId);
// //         if (modal) {
// //             modal.style.display = 'flex';
// //             document.body.style.overflow = 'hidden';
// //         }
// //     }

// //     closeModal(modalId) {
// //         const modal = document.getElementById(modalId);
// //         if (modal) {
// //             modal.style.display = 'none';
// //             document.body.style.overflow = 'auto';
// //         }
// //     }

// //     formatDate(dateString) {
// //         if (!dateString) return 'N/A';
        
// //         const date = new Date(dateString);
        
// //         if (isNaN(date.getTime())) return dateString;

// //         return date.toLocaleDateString('en-US', {
// //             year: 'numeric',
// //             month: 'short',
// //             day: 'numeric'
// //         });
// //     }
// // }

// // // ═══════════════════════════════════════════════════════════════════
// // // 🌐 GLOBAL INITIALIZATION
// // // ═══════════════════════════════════════════════════════════════════

// // let maPredictor;

// // document.addEventListener('DOMContentLoaded', () => {
// //     console.log('🚀 Initializing M&A Predictor...');
    
// //     const workerURL = 'https://sec-edgar-api.raphnardone.workers.dev';
    
// //     try {
// //         maPredictor = new MAPredictor({ workerURL });
// //         window.maPredictor = maPredictor; // Accès global pour onclick
        
// //         console.log('✅ M&A Predictor initialized successfully');
// //     } catch (error) {
// //         console.error('❌ Failed to initialize M&A Predictor:', error);
// //     }
// // });

// /**
//  * ═══════════════════════════════════════════════════════════════════
//  * 🤝 M&A PREDICTOR - REFACTORED VERSION
//  * ═══════════════════════════════════════════════════════════════════
//  * Interface simplifiée pour le M&A Predictor
//  * ✅ Extraction correcte des dates
//  * ✅ Scoring AI dynamique (sans random ni hardcoding)
//  * ✅ Section Alphy AI Recommendations
//  * ✅ Analyses avancées et graphiques
//  * ═══════════════════════════════════════════════════════════════════
//  */

// class MAPredictor {
//     constructor(config = {}) {
//         this.workerURL = config.workerURL || 'https://sec-edgar-api.raphnardone.workers.dev';
//         this.client = new SECMAClient({ workerURL: this.workerURL });
        
//         this.state = {
//             currentDeals: [],
//             filteredDeals: [],
//             currentPage: 1,
//             itemsPerPage: 20,
//             totalPages: 1,
//             filters: {
//                 period: 30,
//                 maxFilings: 250
//             },
//             isLoading: false,
//             topRecommendations: []
//         };

//         this.init();
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 🎬 INITIALIZATION
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     async init() {
//         console.log('🤝 M&A Predictor initializing...');
        
//         this.setupEventListeners();
//         console.log('✅ M&A Predictor ready');
//     }

//     setupEventListeners() {
//         // Bouton de chargement des données
//         const loadBtn = document.getElementById('btn-load-data');
//         if (loadBtn) {
//             loadBtn.addEventListener('click', () => this.loadData());
//         }

//         // Pagination
//         const prevBtn = document.getElementById('btn-prev-page');
//         const nextBtn = document.getElementById('btn-next-page');
        
//         if (prevBtn) prevBtn.addEventListener('click', () => this.changePage(-1));
//         if (nextBtn) nextBtn.addEventListener('click', () => this.changePage(1));

//         // Fermeture des modals en cliquant à l'extérieur
//         window.addEventListener('click', (e) => {
//             if (e.target.classList.contains('modal')) {
//                 this.closeDealModal();
//                 this.closeModal('filtersInfo');
//             }
//         });
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 📊 DATA LOADING WITH AI SCORING
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     async loadData() {
//         if (this.state.isLoading) {
//             console.log('⚠ Already loading data...');
//             return;
//         }

//         // Récupère les valeurs des filtres
//         const periodSelect = document.getElementById('time-period-filter');
//         const filingsSelect = document.getElementById('max-filings-filter');
        
//         if (!periodSelect || !filingsSelect) {
//             console.error('❌ Filter elements not found');
//             return;
//         }

//         this.state.filters.period = parseInt(periodSelect.value);
//         this.state.filters.maxFilings = parseInt(filingsSelect.value);

//         console.log(`📊 Loading data: ${this.state.filters.period} days, max ${this.state.filters.maxFilings} filings`);
        
//         this.state.isLoading = true;
//         this.showProgressModal();
        
//         try {
//             // Chargement des S-4 et 8-K
//             this.updateProgress(0, 'Connecting to SEC EDGAR...');
            
//             const [s4Data, eightKData] = await Promise.all([
//                 this.loadS4Filings(),
//                 this.load8KFilings()
//             ]);

//             // Combine les données
//             let allDeals = [...s4Data, ...eightKData];
            
//             // ✅ SCORING AI DYNAMIQUE
//             this.updateProgress(70, 'Calculating AI probability scores...');
//             allDeals = await this.calculateAIScores(allDeals);

//             // Trie par score AI décroissant
//             allDeals.sort((a, b) => (b.aiScore?.score || 0) - (a.aiScore?.score || 0));

//             this.state.currentDeals = allDeals;
//             this.state.filteredDeals = [...allDeals];
//             this.state.totalPages = Math.ceil(this.state.filteredDeals.length / this.state.itemsPerPage);
//             this.state.currentPage = 1;

//             // Top 6 pour les recommandations
//             this.state.topRecommendations = allDeals.slice(0, 6);

//             this.updateProgress(100, `Loaded ${this.state.currentDeals.length} filings with AI scores!`);

//             setTimeout(() => {
//                 this.hideProgressModal();
//                 this.renderResults();
//                 this.showToast(`✅ Successfully loaded ${this.state.currentDeals.length} M&A filings!`);
//             }, 500);

//         } catch (error) {
//             console.error('❌ Data loading failed:', error);
//             this.hideProgressModal();
//             this.showToast('❌ Failed to load data. Please check your connection and try again.');
//         } finally {
//             this.state.isLoading = false;
//         }
//     }

//     async loadS4Filings() {
//         this.updateProgress(20, 'Loading S-4 merger filings...');
        
//         try {
//             const response = await this.client.getRecentDeals({
//                 days: this.state.filters.period,
//                 minValue: 0
//             });

//             const deals = response.deals || [];
            
//             this.updateProgress(40, `Loaded ${deals.length} S-4 filings...`);
            
//             return deals.map(deal => ({
//                 ...deal,
//                 formType: 'S-4',
//                 source: 'S-4',
//                 description: deal.dealType || 'Merger/Acquisition',
//                 url: this.buildSECUrl(deal.cik, deal.accessionNumber),
//                 filedDate: deal.filedDate || this.client.extractFilingDate(deal)
//             }));

//         } catch (error) {
//             console.error('❌ S-4 loading failed:', error);
//             return [];
//         }
//     }

//     async load8KFilings() {
//         this.updateProgress(50, 'Loading 8-K material events...');
        
//         try {
//             const response = await this.client.get8KAlerts(
//                 ['1.01', '2.01', '2.03', '5.02', '8.01'],
//                 this.state.filters.period
//             );

//             const alerts = response.alerts || [];
            
//             this.updateProgress(65, `Loaded ${alerts.length} 8-K filings...`);
            
//             return alerts.map(alert => ({
//                 ...alert,
//                 formType: '8-K',
//                 source: '8-K',
//                 description: this.get8KDescription(alert.items),
//                 url: this.buildSECUrl(alert.cik, alert.accessionNumber),
//                 filedDate: alert.filedDate || this.client.extractFilingDate(alert)
//             }));

//         } catch (error) {
//             console.error('❌ 8-K loading failed:', error);
//             return [];
//         }
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 🤖 AI SCORING ENGINE (DYNAMIC - NO RANDOM)
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     async calculateAIScores(deals) {
//         console.log('🤖 Calculating AI scores for', deals.length, 'deals...');
        
//         for (let i = 0; i < deals.length; i++) {
//             deals[i].aiScore = this.calculateDealScore(deals[i], deals);
//         }
        
//         return deals;
//     }

//     calculateDealScore(deal, allDeals) {
//         const factors = {
//             formTypeRelevance: this.scoreFormType(deal),
//             recency: this.scoreRecency(deal),
//             companyActivity: this.scoreCompanyActivity(deal, allDeals),
//             filingComplexity: this.scoreFilingComplexity(deal),
//             keywordSignals: this.scoreKeywordSignals(deal),
//             itemRelevance: this.scoreItemRelevance(deal)
//         };

//         const weights = {
//             formTypeRelevance: 30,
//             recency: 20,
//             companyActivity: 15,
//             filingComplexity: 15,
//             keywordSignals: 15,
//             itemRelevance: 5
//         };

//         let totalScore = 0;
//         let totalWeight = 0;

//         for (const [factor, value] of Object.entries(factors)) {
//             const weight = weights[factor] || 0;
//             totalScore += value * weight;
//             totalWeight += weight;
//         }

//         const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

//         let confidence = 'LOW';
//         let color = '#6b7280';
        
//         if (finalScore >= 75) {
//             confidence = 'HIGH';
//             color = '#10b981';
//         } else if (finalScore >= 50) {
//             confidence = 'MEDIUM';
//             color = '#f59e0b';
//         }

//         return {
//             score: finalScore,
//             confidence,
//             color,
//             factors,
//             breakdown: this.generateScoreBreakdown(factors, weights)
//         };
//     }

//     scoreFormType(deal) {
//         const formType = deal.formType?.toUpperCase() || '';
        
//         if (formType === 'S-4') return 100; // Merger registration
//         if (formType === '8-K' && deal.items?.includes('2.01')) return 90; // Acquisition completion
//         if (formType === '8-K' && deal.items?.includes('1.01')) return 80; // Material agreement
//         if (formType === '8-K' && deal.items?.includes('5.02')) return 60; // Leadership changes
//         if (formType === '8-K') return 50;
        
//         return 30;
//     }

//     scoreRecency(deal) {
//         if (!deal.filedDate) return 30;
        
//         const filedDate = new Date(deal.filedDate);
//         const now = new Date();
//         const daysAgo = Math.floor((now - filedDate) / (1000 * 60 * 60 * 24));

//         if (daysAgo <= 7) return 100;
//         if (daysAgo <= 14) return 90;
//         if (daysAgo <= 30) return 75;
//         if (daysAgo <= 60) return 55;
//         if (daysAgo <= 90) return 35;
        
//         return 15;
//     }

//     scoreCompanyActivity(deal, allDeals) {
//         const companyCIK = deal.cik;
//         const companyFilings = allDeals.filter(d => d.cik === companyCIK);
//         const count = companyFilings.length;

//         if (count >= 5) return 95;
//         if (count >= 3) return 75;
//         if (count >= 2) return 55;
        
//         return 35;
//     }

//     scoreFilingComplexity(deal) {
//         const summary = deal.summary || deal.description || '';
//         const length = summary.length;

//         if (length > 500) return 90;
//         if (length > 300) return 75;
//         if (length > 150) return 60;
//         if (length > 50) return 40;
        
//         return 20;
//     }

//     scoreKeywordSignals(deal) {
//         const text = ((deal.summary || '') + ' ' + (deal.description || '')).toLowerCase();
        
//         const highValueKeywords = [
//             'merger', 'acquisition', 'acquire', 'purchased', 'bought',
//             'definitive agreement', 'tender offer', 'takeover',
//             'combination', 'consolidation', 'amalgamation'
//         ];
        
//         const mediumValueKeywords = [
//             'strategic', 'investment', 'partnership', 'joint venture',
//             'equity stake', 'controlling interest', 'majority stake'
//         ];
        
//         const lowValueKeywords = [
//             'agreement', 'transaction', 'deal', 'purchase', 'contract'
//         ];

//         let score = 0;
        
//         for (const keyword of highValueKeywords) {
//             if (text.includes(keyword)) score += 12;
//         }
        
//         for (const keyword of mediumValueKeywords) {
//             if (text.includes(keyword)) score += 6;
//         }
        
//         for (const keyword of lowValueKeywords) {
//             if (text.includes(keyword)) score += 2;
//         }

//         return Math.min(score, 100);
//     }

//     scoreItemRelevance(deal) {
//         if (deal.formType !== '8-K' || !deal.items) return 50;
        
//         const items = Array.isArray(deal.items) ? deal.items : [deal.items];
        
//         if (items.includes('2.01')) return 100; // Acquisition completion
//         if (items.includes('1.01')) return 90;  // Material agreement
//         if (items.includes('5.02')) return 70;  // Leadership change
//         if (items.includes('2.03')) return 60;  // Financial obligation
        
//         return 40;
//     }

//     generateScoreBreakdown(factors, weights) {
//         return Object.entries(factors).map(([factor, value]) => ({
//             factor: this.humanizeFactorName(factor),
//             value,
//             weight: weights[factor] || 0,
//             contribution: Math.round(value * (weights[factor] || 0) / 100)
//         })).sort((a, b) => b.contribution - a.contribution);
//     }

//     humanizeFactorName(factor) {
//         const names = {
//             formTypeRelevance: 'Form Type Relevance',
//             recency: 'Filing Recency',
//             companyActivity: 'Company Activity Level',
//             filingComplexity: 'Filing Detail Level',
//             keywordSignals: 'M&A Keyword Signals',
//             itemRelevance: '8-K Item Relevance'
//         };
//         return names[factor] || factor;
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 🎨 RENDER RESULTS
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     renderResults() {
//         this.renderAIRecommendations();
//         this.renderDealsTable();
//         this.showSections();
//     }

//     renderAIRecommendations() {
//         const container = document.getElementById('recommendations-container');
//         const badge = document.getElementById('recommendations-count-badge');
        
//         if (!container) return;

//         const topDeals = this.state.topRecommendations;
        
//         if (topDeals.length === 0) {
//             container.innerHTML = `
//                 <div class="empty-state" style="grid-column: 1 / -1;">
//                     <p>No high-probability deals found.</p>
//                 </div>
//             `;
//             return;
//         }

//         if (badge) badge.textContent = topDeals.length;

//         container.innerHTML = topDeals.map((deal, index) => `
//             <div class='recommendation-card' onclick='maPredictor.viewDealDetails(${this.state.currentDeals.indexOf(deal)})'>
//                 <div class='recommendation-header'>
//                     <div>
//                         <div class='recommendation-company'>${this.truncate(deal.companyName || 'Unknown Company', 30)}</div>
//                         <span class='${this.getRecommendationBadgeClass(deal.aiScore.score)}'>${deal.aiScore.confidence} PROBABILITY</span>
//                     </div>
//                     <div style='text-align: right;'>
//                         <div class='recommendation-score'>${deal.aiScore.score}</div>
//                         <div class='recommendation-score-label'>AI Score</div>
//                     </div>
//                 </div>
                
//                 <div class='recommendation-metrics'>
//                     <div class='metric-row'>
//                         <span class='metric-label'>Form Type</span>
//                         <span class='metric-value'>${deal.formType}</span>
//                     </div>
//                     <div class='metric-row'>
//                         <span class='metric-label'>Filed Date</span>
//                         <span class='metric-value'>${this.formatDate(deal.filedDate)}</span>
//                     </div>
//                     <div class='metric-row'>
//                         <span class='metric-label'>CIK</span>
//                         <span class='metric-value'>${deal.cik}</span>
//                     </div>
//                     <div class='metric-row'>
//                         <span class='metric-label'>Top Signal</span>
//                         <span class='metric-value'>${deal.aiScore.breakdown[0]?.factor || 'N/A'}</span>
//                     </div>
//                 </div>
                
//                 <div style='margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--glass-border);'>
//                     <div style='font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;'>
//                         ${this.truncate(deal.description || deal.summary || 'No description available', 120)}
//                     </div>
//                 </div>
//             </div>
//         `).join('');
//     }

//     getRecommendationBadgeClass(score) {
//         if (score >= 75) return 'recommendation-badge badge-high-probability';
//         if (score >= 50) return 'recommendation-badge badge-medium-probability';
//         return 'recommendation-badge badge-monitoring';
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 📋 TABLE RENDERING & PAGINATION
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     renderDealsTable() {
//         const tbody = document.getElementById('ma-deals-tbody');
//         const badge = document.getElementById('deals-count-badge');
        
//         if (!tbody || !badge) {
//             console.error('❌ Table elements not found');
//             return;
//         }

//         tbody.innerHTML = '';
//         badge.textContent = this.state.filteredDeals.length;

//         const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
//         const endIndex = Math.min(startIndex + this.state.itemsPerPage, this.state.filteredDeals.length);
        
//         const pageDeals = this.state.filteredDeals.slice(startIndex, endIndex);

//         if (pageDeals.length === 0) {
//             tbody.innerHTML = `
//                 <tr>
//                     <td colspan="6" style="text-align: center; padding: 40px;">
//                         <i class="fas fa-inbox" style="font-size: 3rem; opacity: 0.3;"></i>
//                         <p style="margin-top: 20px; opacity: 0.6;">No M&A deals found for selected filters</p>
//                     </td>
//                 </tr>
//             `;
//             return;
//         }

//         pageDeals.forEach((deal, index) => {
//             const row = document.createElement('tr');
//             row.innerHTML = `
//                 <td>${this.formatDate(deal.filedDate)}</td>
//                 <td>
//                     <strong>${deal.companyName || 'Unknown Company'}</strong><br>
//                     <small style="opacity: 0.7;">CIK: ${deal.cik}</small>
//                 </td>
//                 <td><span class="form-badge form-${deal.formType.toLowerCase()}">${deal.formType}</span></td>
//                 <td>${this.truncate(deal.description, 80)}</td>
//                 <td>
//                     <span class='score-badge ${this.getScoreBadgeClass(deal.aiScore.score)}'>
//                         <i class='fas fa-brain'></i> ${deal.aiScore.score}
//                     </span>
//                 </td>
//                 <td>
//                     <button class="btn-action" onclick="maPredictor.viewDealDetails(${startIndex + index})">
//                         <i class="fas fa-eye"></i> View
//                     </button>
//                 </td>
//             `;
//             tbody.appendChild(row);
//         });

//         this.updatePagination();
//     }

//     getScoreBadgeClass(score) {
//         if (score >= 75) return 'score-high';
//         if (score >= 50) return 'score-medium';
//         return 'score-low';
//     }

//     changePage(direction) {
//         const newPage = this.state.currentPage + direction;
        
//         if (newPage < 1 || newPage > this.state.totalPages) {
//             return;
//         }

//         this.state.currentPage = newPage;
//         this.renderDealsTable();
        
//         // Scroll to top of table
//         document.getElementById('ma-deals-section')?.scrollIntoView({ behavior: 'smooth' });
//     }

//     updatePagination() {
//         const prevBtn = document.getElementById('btn-prev-page');
//         const nextBtn = document.getElementById('btn-next-page');
//         const info = document.getElementById('pagination-info');

//         if (!prevBtn || !nextBtn || !info) return;

//         prevBtn.disabled = this.state.currentPage === 1;
//         nextBtn.disabled = this.state.currentPage === this.state.totalPages;

//         info.textContent = `Page ${this.state.currentPage} of ${this.state.totalPages}`;
//     }

//     showSections() {
//         const aiSection = document.getElementById('ai-recommendations-section');
//         const dealsSection = document.getElementById('ma-deals-section');
        
//         if (aiSection) aiSection.style.display = 'block';
//         if (dealsSection) dealsSection.style.display = 'block';
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 📄 DEAL DETAILS MODAL
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     async viewDealDetails(index) {
//         const deal = this.state.filteredDeals[index];
        
//         if (!deal) {
//             console.error('❌ Deal not found at index:', index);
//             return;
//         }

//         console.log('📄 Viewing deal details:', deal);

//         const modal = document.getElementById('dealDetailsModal');
//         const title = document.getElementById('modal-deal-title');
//         const body = document.getElementById('modal-deal-body');

//         if (!modal || !title || !body) {
//             console.error('❌ Modal elements not found');
//             return;
//         }

//         title.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading Document...`;
//         body.innerHTML = `
//             <div style="text-align: center; padding: 60px;">
//                 <i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: #667eea;"></i>
//                 <p style="margin-top: 20px; opacity: 0.7;">Parsing SEC document via Worker...</p>
//             </div>
//         `;
        
//         modal.style.display = 'flex';

//         try {
//             console.log('🌐 Requesting document from Worker:', deal.url);
            
//             const parsedData = await this.client.getDocumentParsed(deal.url);
//             const html = this.generateDocumentHTML(parsedData, deal);

//             title.innerHTML = `
//                 <i class="fas fa-file-contract"></i> 
//                 ${deal.formType} - ${deal.companyName || 'SEC Filing'}
//             `;
//             body.innerHTML = html;

//         } catch (error) {
//             console.error('❌ Error loading document:', error);
            
//             title.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Error Loading Document`;
//             body.innerHTML = `
//                 <div class="error-container">
//                     <i class="fas fa-exclamation-triangle"></i>
//                     <h3>Failed to Load Document</h3>
//                     <p>${error.message}</p>
//                     <p style="margin-top: 16px; opacity: 0.7;">The Worker may be unavailable or the document format is unsupported.</p>
//                     <a href="${deal.url}" target="_blank" class="btn-external-link">
//                         <i class="fas fa-external-link-alt"></i> View Original on SEC.gov
//                     </a>
//                 </div>
//             `;
//         }
//     }

//     generateDocumentHTML(data, deal) {
//         if (!data || !data.success) {
//             return `
//                 <div class="error-container">
//                     <i class="fas fa-exclamation-triangle"></i>
//                     <h3>Parsing Failed</h3>
//                     <p>${data?.error || 'Unknown error'}</p>
//                 </div>
//             `;
//         }

//         const { type, content } = data;

//         let html = `
//             <div class="sec-document-container">
//                 <div class="sec-document-header">
//                     <div class="doc-type-badge">${type || deal.formType}</div>
//                     <h3>${content.companyName || deal.companyName || 'SEC Filing'}</h3>
//                     ${content.cik ? `<p class="doc-meta"><i class="fas fa-building"></i> <strong>CIK:</strong> ${content.cik}</p>` : ''}
//                     ${content.filingDate ? `<p class="doc-meta"><i class="fas fa-calendar"></i> <strong>Filing Date:</strong> ${this.formatDate(content.filingDate)}</p>` : ''}
//                 </div>
//         `;

//         // Items (pour les 8-K)
//         if (content.items && content.items.length > 0) {
//             html += `
//                 <div class="sec-items-section">
//                     <h4><i class="fas fa-list"></i> Items Reported</h4>
//                     <ul class="sec-items-list">
//                         ${content.items.map(item => `
//                             <li><strong>Item ${item.code || item}:</strong> ${item.name || item.description || ''}</li>
//                         `).join('')}
//                     </ul>
//                 </div>
//             `;
//         }

//         // Merger Info (pour les S-4)
//         if (content.mergerInfo) {
//             html += `
//                 <div class="sec-merger-section">
//                     <h4><i class="fas fa-handshake"></i> Merger Information</h4>
//                     <div class="merger-grid">
//                         ${content.mergerInfo.acquirer ? `
//                             <div class="merger-item">
//                                 <span class="merger-label">Acquirer:</span>
//                                 <span class="merger-value">${content.mergerInfo.acquirer}</span>
//                             </div>
//                         ` : ''}
//                         ${content.mergerInfo.target ? `
//                             <div class="merger-item">
//                                 <span class="merger-label">Target:</span>
//                                 <span class="merger-value">${content.mergerInfo.target}</span>
//                             </div>
//                         ` : ''}
//                         ${content.mergerInfo.dealValue ? `
//                             <div class="merger-item">
//                                 <span class="merger-label">Deal Value:</span>
//                                 <span class="merger-value">${content.mergerInfo.dealValue}</span>
//                             </div>
//                         ` : ''}
//                     </div>
//                 </div>
//             `;
//         }

//         // Offerings Section
//         if (content.offerings && content.offerings.length > 0) {
//             html += `
//                 <div class="sec-offerings-section">
//                     <h4><i class="fas fa-file-invoice-dollar"></i> Offerings (${content.offerings.length})</h4>
                    
//                     ${content.offeringsMetadata ? `
//                         <div class="offerings-summary">
//                             <div class="summary-item">
//                                 <span class="summary-label">Total Offerings:</span>
//                                 <span class="summary-value">${content.offeringsMetadata.totalOfferings}</span>
//                             </div>
//                             <div class="summary-item">
//                                 <span class="summary-label">Total Max Aggregate Price:</span>
//                                 <span class="summary-value">$${content.offeringsMetadata.totalMaxAggregatePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
//                             </div>
//                             <div class="summary-item">
//                                 <span class="summary-label">Total Registration Fees:</span>
//                                 <span class="summary-value">$${content.offeringsMetadata.totalRegistrationFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
//                             </div>
//                         </div>
//                     ` : ''}
                    
//                     <div class="offerings-list">
//                         ${content.offerings.map(offering => `
//                             <div class="offering-card">
//                                 <div class="offering-header">
//                                     <span class="offering-number">Offering ${offering.offeringNumber}</span>
//                                     <div class="offering-badges">
//                                         ${offering.feePreviousPaid ? '<span class="badge badge-success">Fee Paid</span>' : '<span class="badge badge-warning">Fee Unpaid</span>'}
//                                         ${offering.securityType ? `<span class="badge badge-${offering.securityType.toLowerCase() === 'equity' ? 'primary' : 'secondary'}">${offering.securityType}</span>` : ''}
//                                     </div>
//                                 </div>
                                
//                                 <div class="offering-details">
//                                     ${offering.securityClassTitle ? `
//                                         <div class="offering-row">
//                                             <span class="offering-label">Security Class:</span>
//                                             <span class="offering-value">${offering.securityClassTitle}</span>
//                                         </div>
//                                     ` : ''}
                                    
//                                     ${offering.amountRegistered ? `
//                                         <div class="offering-row">
//                                             <span class="offering-label">Amount Registered:</span>
//                                             <span class="offering-value">${offering.amountRegistered.toLocaleString()} shares</span>
//                                         </div>
//                                     ` : ''}
                                    
//                                     ${offering.proposedMaxOfferingPricePerUnit ? `
//                                         <div class="offering-row">
//                                             <span class="offering-label">Price per Unit:</span>
//                                             <span class="offering-value">${offering.proposedMaxOfferingPricePerUnit}</span>
//                                         </div>
//                                     ` : ''}
                                    
//                                     ${offering.maximumAggregateOfferingPrice ? `
//                                         <div class="offering-row highlight">
//                                             <span class="offering-label">Max Aggregate Price:</span>
//                                             <span class="offering-value">${offering.maximumAggregateOfferingPrice}</span>
//                                         </div>
//                                     ` : ''}
                                    
//                                     ${offering.feeRate ? `
//                                         <div class="offering-row">
//                                             <span class="offering-label">Fee Rate:</span>
//                                             <span class="offering-value">${offering.feeRate}</span>
//                                         </div>
//                                     ` : ''}
                                    
//                                     ${offering.amountOfRegistrationFee ? `
//                                         <div class="offering-row">
//                                             <span class="offering-label">Registration Fee:</span>
//                                             <span class="offering-value">${offering.amountOfRegistrationFee}</span>
//                                         </div>
//                                     ` : ''}
                                    
//                                     ${offering.offeringNote ? `
//                                         <div class="offering-note">
//                                             <strong>Note:</strong> ${offering.offeringNote}
//                                         </div>
//                                     ` : ''}
//                                 </div>
//                             </div>
//                         `).join('')}
//                     </div>
//                 </div>
//             `;
//         }

//         // Contenu principal
//         if (content.htmlContent) {
//             html += `
//                 <div class="sec-document-content">
//                     <h4><i class="fas fa-file-alt"></i> Document Content</h4>
//                     <div class="content-body">
//                         ${content.htmlContent}
//                     </div>
//                 </div>
//             `;
//         }

//         html += `
//                 <div class="sec-document-footer">
//                     <a href="${deal.url}" target="_blank" class="btn-external-link">
//                         <i class="fas fa-external-link-alt"></i> View Full Document on SEC.gov
//                     </a>
//                 </div>
//             </div>
//         `;

//         return html;
//     }

//     closeDealModal() {
//         const modal = document.getElementById('dealDetailsModal');
//         if (modal) {
//             modal.style.display = 'none';
//         }
//     }

//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//     // 🎨 UI UTILITIES
//     // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//     buildSECUrl(cik, accession) {
//         const cleanAccession = accession.replace(/-/g, '');
//         return `https://www.sec.gov/cgi-bin/viewer?action=view&cik=${cik}&accession_number=${accession}&xbrl_type=v`;
//     }

//     get8KDescription(items) {
//         if (!items || items.length === 0) return 'Material Event';
        
//         const descriptions = {
//             '1.01': 'Material Definitive Agreement',
//             '2.01': 'Completion of Acquisition/Disposition',
//             '2.03': 'Creation of Direct Financial Obligation',
//             '5.02': 'Departure/Election of Directors/Officers',
//             '8.01': 'Other Events'
//         };

//         return items.map(item => descriptions[item] || `Item ${item}`).join(', ');
//     }

//     showProgressModal() {
//         const modal = document.getElementById('progressModal');
//         if (modal) {
//             modal.style.display = 'flex';
//         }
//     }

//     hideProgressModal() {
//         const modal = document.getElementById('progressModal');
//         if (modal) {
//             modal.style.display = 'none';
//         }
//     }

//     updateProgress(percent, message) {
//         const progressBar = document.getElementById('progress-bar');
//         const progressText = document.getElementById('bulk-progress-text');

//         if (progressBar) {
//             progressBar.style.width = `${percent}%`;
//         }

//         if (progressText) {
//             progressText.textContent = message;
//         }
//     }

//     showToast(message) {
//         const toast = document.createElement('div');
//         toast.className = 'ma-toast';
//         toast.textContent = message;
//         document.body.appendChild(toast);

//         setTimeout(() => toast.classList.add('show'), 100);
//         setTimeout(() => {
//             toast.classList.remove('show');
//             setTimeout(() => toast.remove(), 300);
//         }, 3000);
//     }

//     openModal(modalId) {
//         const modal = document.getElementById(modalId);
//         if (modal) {
//             modal.style.display = 'flex';
//             document.body.style.overflow = 'hidden';
//         }
//     }

//     closeModal(modalId) {
//         const modal = document.getElementById(modalId);
//         if (modal) {
//             modal.style.display = 'none';
//             document.body.style.overflow = 'auto';
//         }
//     }

//     formatDate(dateString) {
//         if (!dateString) return 'N/A';
        
//         const date = new Date(dateString);
        
//         if (isNaN(date.getTime())) return dateString;

//         return date.toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     }

//     truncate(str, maxLength) {
//         if (!str) return '';
//         return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
//     }
// }

// // ═══════════════════════════════════════════════════════════════════
// // 🌐 GLOBAL INITIALIZATION
// // ═══════════════════════════════════════════════════════════════════

// let maPredictor;

// document.addEventListener('DOMContentLoaded', () => {
//     console.log('🚀 Initializing M&A Predictor...');
    
//     const workerURL = 'https://sec-edgar-api.raphnardone.workers.dev';
    
//     try {
//         maPredictor = new MAPredictor({ workerURL });
//         window.maPredictor = maPredictor;
        
//         console.log('✅ M&A Predictor initialized successfully');
//     } catch (error) {
//         console.error('❌ Failed to initialize M&A Predictor:', error);
//     }
// });

/**
 * ═══════════════════════════════════════════════════════════════════
 * 🤝 M&A PREDICTOR - CORRECTED VERSION
 * ═══════════════════════════════════════════════════════════════════
 * ✅ CORRECTIONS:
 * - Fixed missing deals-count-badge reference
 * - Added safety checks for DOM elements
 * - Reduced max filings from 500 to 250
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
                maxFilings: 100 // ✅ RÉDUIT (était 250)
            },
            isLoading: false,
            topRecommendations: []
        };

        this.init();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎬 INITIALIZATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    async init() {
        console.log('🤝 M&A Predictor initializing...');
        
        this.setupEventListeners();
        console.log('✅ M&A Predictor ready');
    }

    setupEventListeners() {
        const loadBtn = document.getElementById('btn-load-data');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadData());
        }

        const prevBtn = document.getElementById('btn-prev-page');
        const nextBtn = document.getElementById('btn-next-page');
        
        if (prevBtn) prevBtn.addEventListener('click', () => this.changePage(-1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.changePage(1));

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
            this.updateProgress(0, 'Connecting to SEC EDGAR...');
            
            const [s4Data, eightKData] = await Promise.all([
                this.loadS4Filings(),
                this.load8KFilings()
            ]);

            let allDeals = [...s4Data, ...eightKData];
            
            this.updateProgress(70, 'Calculating AI probability scores...');
            allDeals = await this.calculateAIScores(allDeals);

            allDeals.sort((a, b) => (b.aiScore?.score || 0) - (a.aiScore?.score || 0));

            this.state.currentDeals = allDeals;
            this.state.filteredDeals = [...allDeals];
            this.state.totalPages = Math.ceil(this.state.filteredDeals.length / this.state.itemsPerPage);
            this.state.currentPage = 1;

            this.state.topRecommendations = allDeals.slice(0, 6);

            this.updateProgress(100, `Loaded ${this.state.currentDeals.length} filings with AI scores!`);

            setTimeout(() => {
                this.hideProgressModal();
                this.renderResults();
                this.showToast(`✅ Successfully loaded ${this.state.currentDeals.length} M&A filings!`);
            }, 500);

        } catch (error) {
            console.error('❌ Data loading failed:', error);
            this.hideProgressModal();
            this.showToast(`❌ Failed to load data: ${error.message}`);
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
            
            this.updateProgress(40, `Loaded ${deals.length} S-4 filings...`);
            
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
        this.updateProgress(50, 'Loading 8-K material events...');
        
        try {
            // ✅ RÉDUIT max de 500 à 250
            const response = await this.client.get8KAlerts(
                ['1.01', '2.01', '2.03', '5.02', '8.01'],
                this.state.filters.period
            );

            const alerts = response.alerts || [];
            
            this.updateProgress(65, `Loaded ${alerts.length} 8-K filings...`);
            
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
        const badge = document.getElementById('recommendations-count-badge');
        
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

        if (badge) badge.textContent = topDeals.length;

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
    // 📋 TABLE RENDERING & PAGINATION (✅ CORRIGÉ)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    renderDealsTable() {
        const tbody = document.getElementById('ma-deals-tbody');
        const badge = document.getElementById('deals-count-badge');
        
        if (!tbody) {
            console.error('❌ Table body (ma-deals-tbody) not found');
            return;
        }

        // ✅ SÉCURITÉ : Badge peut ne pas exister
        if (badge) {
            badge.textContent = this.state.filteredDeals.length;
        } else {
            console.warn('⚠ Badge (deals-count-badge) not found - skipping badge update');
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