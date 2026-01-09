// ========================================
// ADMIN ANALYTICS PRO - ULTRA POWERFUL DASHBOARD v6.0
// ✅ Adapté au Worker v4.4 avec toutes les données Cloudflare
// ✅ Ajout de TOUTES les collections Firestore manquantes
// ✅ Nouveaux graphiques et KPIs
// ✅ Cache & Rate Limiting optimisé
// ========================================

// 🔐 CONFIGURATION
const ADMIN_EMAIL = 'raphnardone@gmail.com';
const WORKER_URL = 'https://admin-analytics-api.raphnardone.workers.dev';
const GMAIL_WORKER_URL = 'https://gmail-api.raphnardone.workers.dev';
const STRIPE_PUBLIC_KEY = 'pk_live_51SU1qnDxR6DPBfOfX6yJYr9Qzh40aNGrn1TSZxI5q0Q0m9hsgXmMQFq2TErynzuUKOivH4T3DJ1FjKy683WsqQAR00tAMRJGtk';

// 🆕 CONFIGURATION DU CACHE & RATE LIMITING
const CACHE_CONFIG = {
    CACHE_DURATION: 6 * 60 * 60 * 1000, // 6 heures
    MAX_DAILY_CALLS: 50,
    ENABLE_CACHE: true,
    ENABLE_RATE_LIMIT: true,
    CACHED_ENDPOINTS: [
        'stripe-analytics',
        'cloudflare-analytics',
        'cloudflare-geo',
        'cloudflare-devices',
        'cloudflare-pages',
        'cloudflare-cache',
        'cloudflare-referrers'
    ]
};

// ========================================
// 🗄 CACHE MANAGER
// ========================================

class CacheManager {
    constructor(config) {
        this.config = config;
        this.storagePrefix = 'admin_cache_';
        this.callsCountKey = 'admin_calls_count';
        this.callsDateKey = 'admin_calls_date';
    }
    
    isCacheEnabled() {
        return this.config.ENABLE_CACHE;
    }
    
    isRateLimitEnabled() {
        return this.config.ENABLE_RATE_LIMIT;
    }
    
    get(key) {
        if (!this.isCacheEnabled()) return null;
        
        try {
            const cachedItem = localStorage.getItem(this.storagePrefix + key);
            if (!cachedItem) return null;
            
            const { data, timestamp } = JSON.parse(cachedItem);
            const now = Date.now();
            
            if (now - timestamp < this.config.CACHE_DURATION) {
                const ageMinutes = Math.floor((now - timestamp) / 60000);
                console.log(`✅ Cache HIT for ${key} (age: ${ageMinutes} min)`);
                return data;
            } else {
                console.log(`⏰ Cache EXPIRED for ${key}`);
                this.remove(key);
                return null;
            }
        } catch (error) {
            console.error('❌ Cache read error:', error);
            return null;
        }
    }
    
    set(key, data) {
        if (!this.isCacheEnabled()) return;
        
        try {
            const cacheItem = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.storagePrefix + key, JSON.stringify(cacheItem));
            console.log(`💾 Cache SAVED for ${key}`);
        } catch (error) {
            console.error('❌ Cache write error:', error);
        }
    }
    
    remove(key) {
        localStorage.removeItem(this.storagePrefix + key);
    }
    
    clearAll() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
                localStorage.removeItem(key);
            }
        });
        localStorage.removeItem(this.callsCountKey);
        localStorage.removeItem(this.callsDateKey);
        console.log('🗑 All cache cleared');
    }
    
    canMakeCall() {
        if (!this.isRateLimitEnabled()) return true;
        
        const today = new Date().toDateString();
        const storedDate = localStorage.getItem(this.callsDateKey);
        let callsCount = parseInt(localStorage.getItem(this.callsCountKey) || '0');
        
        if (storedDate !== today) {
            callsCount = 0;
            localStorage.setItem(this.callsDateKey, today);
            localStorage.setItem(this.callsCountKey, '0');
        }
        
        if (callsCount >= this.config.MAX_DAILY_CALLS) {
            console.warn(`⚠ RATE LIMIT EXCEEDED: ${callsCount}/${this.config.MAX_DAILY_CALLS} calls today`);
            return false;
        }
        
        return true;
    }
    
    incrementCallCount() {
        if (!this.isRateLimitEnabled()) return;
        
        const today = new Date().toDateString();
        const storedDate = localStorage.getItem(this.callsDateKey);
        let callsCount = parseInt(localStorage.getItem(this.callsCountKey) || '0');
        
        if (storedDate !== today) {
            callsCount = 0;
            localStorage.setItem(this.callsDateKey, today);
        }
        
        callsCount++;
        localStorage.setItem(this.callsCountKey, callsCount.toString());
        
        console.log(`📞 API Calls today: ${callsCount}/${this.config.MAX_DAILY_CALLS}`);
    }
    
    getStats() {
        const today = new Date().toDateString();
        const storedDate = localStorage.getItem(this.callsDateKey);
        let callsCount = parseInt(localStorage.getItem(this.callsCountKey) || '0');
        
        if (storedDate !== today) {
            callsCount = 0;
        }
        
        return {
            callsToday: callsCount,
            maxCalls: this.config.MAX_DAILY_CALLS,
            remaining: Math.max(0, this.config.MAX_DAILY_CALLS - callsCount),
            cacheEnabled: this.isCacheEnabled(),
            rateLimitEnabled: this.isRateLimitEnabled(),
            cacheDuration: this.config.CACHE_DURATION / (60 * 60 * 1000)
        };
    }
}

// ========================================
// 🆕 PAGINATION MANAGER
// ========================================

class PaginationManager {
    constructor(tableId, data, renderRowCallback, itemsPerPageOptions = [10, 25, 50, 100]) {
        this.tableId = tableId;
        this.data = data;
        this.renderRowCallback = renderRowCallback;
        this.itemsPerPageOptions = itemsPerPageOptions;
        this.currentPage = 1;
        this.itemsPerPage = itemsPerPageOptions[0];
        this.totalPages = Math.ceil(data.length / this.itemsPerPage);
    }
    
    updateData(newData) {
        this.data = newData;
        this.currentPage = 1;
        this.totalPages = Math.ceil(newData.length / this.itemsPerPage);
        this.render();
    }
    
    goToPage(page) {
        if (page < 1 || page > this.totalPages) return;
        this.currentPage = page;
        this.render();
    }
    
    changeItemsPerPage(newItemsPerPage) {
        this.itemsPerPage = newItemsPerPage;
        this.totalPages = Math.ceil(this.data.length / this.itemsPerPage);
        this.currentPage = 1;
        this.render();
    }
    
    render() {
        const tbody = document.getElementById(this.tableId);
        if (!tbody) {
            console.error(`❌ Table body not found: ${this.tableId}`);
            return;
        }
        
        tbody.innerHTML = '';
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.data.length);
        
        const pageData = this.data.slice(startIndex, endIndex);
        
        if (pageData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="100" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                        <p style="margin: 0;">No data available</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        pageData.forEach((item, index) => {
            const globalIndex = startIndex + index;
            this.renderRowCallback(item, globalIndex, tbody);
        });
        
        this.renderControls();
    }
    
    renderControls() {
        const controlsId = `${this.tableId}-pagination-controls`;
        let controlsContainer = document.getElementById(controlsId);
        
        if (!controlsContainer) {
            const tbody = document.getElementById(this.tableId);
            if (!tbody) return;
            
            const tableWrapper = tbody.closest('.table-wrapper');
            if (!tableWrapper) return;
            
            controlsContainer = document.createElement('div');
            controlsContainer.id = controlsId;
            controlsContainer.className = 'pagination-controls';
            tableWrapper.appendChild(controlsContainer);
        }
        
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, this.data.length);
        
        controlsContainer.innerHTML = `
            <div class="pagination-info">
                Showing ${startItem}-${endItem} of ${this.data.length} items
            </div>
            
            <div class="pagination-buttons">
                <button class="pagination-btn" onclick="window.paginationManagers['${this.tableId}'].goToPage(1)" ${this.currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button class="pagination-btn" onclick="window.paginationManagers['${this.tableId}'].goToPage(${this.currentPage - 1})" ${this.currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-left"></i>
                </button>
                
                <div class="pagination-pages">
                    ${this.generatePageButtons()}
                </div>
                
                <button class="pagination-btn" onclick="window.paginationManagers['${this.tableId}'].goToPage(${this.currentPage + 1})" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                    <i class="fas fa-angle-right"></i>
                </button>
                <button class="pagination-btn" onclick="window.paginationManagers['${this.tableId}'].goToPage(${this.totalPages})" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
            
            <div class="pagination-selector">
                <label>Items per page:</label>
                <select onchange="window.paginationManagers['${this.tableId}'].changeItemsPerPage(parseInt(this.value))" class="pagination-select">
                    ${this.itemsPerPageOptions.map(option => 
                        `<option value="${option}" ${option === this.itemsPerPage ? 'selected' : ''}>${option}</option>`
                    ).join('')}
                </select>
            </div>
        `;
    }
    
    generatePageButtons() {
        const pages = [];
        const maxButtons = 5;
        
        let startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(this.totalPages, startPage + maxButtons - 1);
        
        if (endPage - startPage < maxButtons - 1) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            pages.push(`
                <button class="pagination-page-btn ${i === this.currentPage ? 'active' : ''}" 
                        onclick="window.paginationManagers['${this.tableId}'].goToPage(${i})">
                    ${i}
                </button>
            `);
        }
        
        return pages.join('');
    }
}

window.paginationManagers = {};

// ========================================
// 📊 ADMIN ANALYTICS PRO CLASS
// ========================================

class AdminAnalyticsPro {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.charts = {};
        this.maps = {};
        
        this.cache = new CacheManager(CACHE_CONFIG);
        
        // Third-Party Data
        this.stripeData = null;
        this.cloudflareData = null;
        this.cloudflareGeo = null;
        this.cloudflareDevices = null;
        this.cloudflarePages = null;
        this.cloudflareCache = null;
        this.cloudflareReferrers = null;
        
        // Firebase Core Data
        this.allUsersData = [];
        this.allUsersDetailedData = [];
        this.allVisitsData = [];
        this.allPaymentsData = [];
        this.allActivityData = [];
        
        // 🆕 NOUVELLES COLLECTIONS FIRESTORE
        this.allWatchlistsData = [];
        this.allPortfoliosData = [];
        this.allNewsletterSubscribers = [];
        this.allApiUsageData = [];
        this.allFeedbackData = [];
        this.allAlertsData = [];
        this.allRealEstateSimulations = [];
        this.allLoginHistory = [];
        this.allConversations = [];
        
        // Analytics Data
        this.nonCustomerVisitors = [];
        this.potentialCustomers = [];
        this.sessionData = [];
        this.conversionPaths = [];
        this.bounceRateData = {};
        this.heatmapData = {};
        
        // Alert thresholds
        this.alertThresholds = {
            mrrDropPercent: 10,
            churnRatePercent: 5,
            lowActiveUsers: 1,
            conversionDrop: 2
        };
        
        this.currentSection = 'dashboard';
        this.currentMRR = 0;

        // ========================================
        // 🆕 SIGNATURES EMAIL (FIRESTORE)
        // ========================================
        this.emailSignatures = {}; // Sera chargé depuis Firestore
        this.currentSignatureEmail = 'newsletter@alphavault-ai.com';
        this.signatureEditor = null;

        // Charger les signatures au démarrage
        // this.loadSignatures();
        
        // ========================================
        // 🆕 PROPRIÉTÉS POUR LA MESSAGERIE COMPLÈTE
        // ========================================
        this.currentEmail = null;
        this.currentThread = null;
        this.gmailStats = null;
        this.gmailInbox = [];
        this.gmailDrafts = [];
        this.gmailLabels = [];
        this.gmailTemplates = [];
        this.emailSignature = '';
        this.searchResults = [];
        this.attachments = [];
        this.autoSaveDraftTimer = null;
        
        // Éditeurs Quill.js (seront initialisés dans les modales)
        this.composeEditor = null;
        this.replyEditor = null;
        this.forwardEditor = null;

        // 🆕 LISTE DES ADRESSES ALPHAVAULT
        this.alphavaultAddresses = [
            { email: 'newsletter@alphavault-ai.com', label: 'Newsletter' },
            { email: 'contact@alphavault-ai.com', label: 'Contact' },
            { email: 'info@alphavault-ai.com', label: 'Info' },
            { email: 'support@alphavault-ai.com', label: 'Support' },
            { email: 'raphnardone@gmail.com', label: 'Personal (Gmail)' }
        ];
        
        this.init();
    }

    async init() {
        console.log('🔐 Initializing Admin Analytics PRO v6.0...');
        
        this.auth.onAuthStateChanged(async (user) => {
            if (!user) {
                console.log('❌ Not authenticated - redirecting...');
                alert('⛔ You must be logged in to access this page.');
                window.location.href = 'login.html';
                return;
            }

            if (user.email !== ADMIN_EMAIL) {
                console.log('⛔ Access denied for:', user.email);
                alert(`⛔ ACCESS DENIED\n\nThis page is reserved for administrators only.`);
                window.location.href = 'index.html';
                return;
            }

            console.log('✅ Admin authenticated:', user.email);
            
            const displays = document.querySelectorAll('[data-admin-email]');
            displays.forEach(el => el.textContent = user.email);
            
            document.getElementById('loading-screen')?.style.setProperty('display', 'none');
            document.getElementById('admin-dashboard')?.style.setProperty('display', 'block');
            
            await this.loadLeafletLibrary();

            // Charger les signatures email depuis Firestore
            await this.loadSignatures();
            await this.loadProfilePictures();
            await this.loadGmailStats();
            await this.loadGmailInbox();

            // Setup listeners pour changer signature avec FROM
            this.setupFromChangeListeners();
            
            this.displayCacheStats();
            this.initSectionTabs();
            this.showSection('dashboard');
            
            console.log('📊 Starting data loading...');
            await this.loadAllData();
            console.log('✅ Data loading complete');
            
            await this.refreshAllDisplays();
            
            this.initEventListeners();
            // Charger les brouillons Gmail
            await this.loadGmailDrafts();
            this.setupFromChangeListeners();
            
            console.log('✅ Admin Analytics PRO fully initialized');
        });
    }

    async loadLeafletLibrary() {
        return new Promise((resolve) => {
            if (typeof L !== 'undefined') {
                resolve();
                return;
            }
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
            
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
                console.log('✅ Leaflet.js loaded');
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    initEventListeners() {
        console.log('🎯 Initializing event listeners...');
        
        const exportButtons = {
            'exportDataBtn': () => this.exportAllData(),
            'exportUsersBtn': () => this.exportData('users'),
            'exportRevenueBtn': () => this.exportData('revenue'),
            'exportVisitorsBtn': () => this.exportData('non-customers'),
            'exportPotentialBtn': () => this.exportData('potential-customers'),
            'exportCloudflareBtn': () => this.exportData('cloudflare'),
            'exportStripeBtn': () => this.exportData('stripe'),
            'exportSessionsBtn': () => this.exportData('sessions'),
            'exportConversionPathsBtn': () => this.exportData('conversion-paths'),
            'exportActivityBtn': () => this.exportData('activity'),
            'exportVisitsBtn': () => this.exportData('visits'),
            'exportPaymentsBtn': () => this.exportData('payments'),
            'exportWatchlistsBtn': () => this.exportData('watchlists'),
            'exportPortfoliosBtn': () => this.exportData('portfolios'),
            'exportNewsletterBtn': () => this.exportData('newsletter')
        };
        
        Object.entries(exportButtons).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handler);
                console.log(`✅ Export button registered: ${id}`);
            }
        });
        
        const refreshBtn = document.getElementById('refreshDataBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
                refreshBtn.disabled = true;
                await this.loadAllData();
                this.displayCacheStats();
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
                refreshBtn.disabled = false;
            });
        }
        
        const clearCacheBtn = document.getElementById('clearCacheBtn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                if (confirm('⚠ Clear all cached data? This will force fresh API calls on next refresh.')) {
                    this.cache.clearAll();
                    alert('✅ Cache cleared successfully!');
                    this.displayCacheStats();
                }
            });
        }
        
        console.log('✅ Event listeners initialized');
    }

    displayCacheStats() {
        const stats = this.cache.getStats();
        
        console.log('📊 Cache Statistics:');
        console.log(`   - API Calls today: ${stats.callsToday}/${stats.maxCalls}`);
        console.log(`   - Remaining calls: ${stats.remaining}`);
        console.log(`   - Cache enabled: ${stats.cacheEnabled}`);
        console.log(`   - Cache duration: ${stats.cacheDuration}h`);
        
        const cacheStatsEl = document.getElementById('cache-stats');
        if (cacheStatsEl) {
            const percentUsed = (stats.callsToday / stats.maxCalls) * 100;
            const statusClass = percentUsed >= 90 ? 'danger' : percentUsed >= 70 ? 'warning' : 'success';
            
            cacheStatsEl.innerHTML = `
                <div class="cache-stats-card">
                    <div class="stat-item">
                        <span class="stat-label">📞 API Calls Today</span>
                        <span class="stat-value ${statusClass}">
                            ${stats.callsToday} / ${stats.maxCalls}
                        </span>
                        <div class="progress-bar">
                            <div class="progress-fill ${statusClass}" style="width: ${percentUsed}%"></div>
                        </div>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">⏳ Remaining Calls</span>
                        <span class="stat-value">${stats.remaining}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">🗄 Cache Duration</span>
                        <span class="stat-value">${stats.cacheDuration}h</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">⚡ Status</span>
                        <span class="stat-value ${stats.cacheEnabled ? 'success' : 'danger'}">
                            ${stats.cacheEnabled ? '✅ Active' : '❌ Disabled'}
                        </span>
                    </div>
                </div>
            `;
        }
    }

    initSectionTabs() {
        const tabButtons = document.querySelectorAll('.section-tab, [data-section]');
        const sections = document.querySelectorAll('.analytics-section, [data-section-content]');
        
        if (tabButtons.length === 0) {
            console.warn('⚠ No section tabs found - creating default navigation');
            return;
        }
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = button.dataset.section || button.getAttribute('href')?.replace('#', '');
                
                if (targetSection) {
                    this.showSection(targetSection);
                }
            });
        });
        
        console.log(`✅ Section tabs initialized (${tabButtons.length} tabs)`);
    }

    showSection(sectionName) {
        console.log(`🔄 Switching to section: ${sectionName}`);
        
        this.currentSection = sectionName;
        
        document.querySelectorAll('.section-tab, .main-tab, [data-section]').forEach(btn => {
            if (btn.dataset.section === sectionName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        let sectionFound = false;
        document.querySelectorAll('.analytics-section, .tab-section, [data-section-content]').forEach(section => {
            const sectionId = section.id || section.dataset.sectionContent;
            
            if (sectionId === sectionName || section.id === `${sectionName}-section`) {
                section.classList.add('active');
                section.style.display = 'block';
                sectionFound = true;
                console.log(`✅ Section "${sectionName}" displayed`);
            } else {
                section.classList.remove('active');
                section.style.display = 'none';
            }
        });
        
        if (!sectionFound) {
            console.warn(`⚠ Section "${sectionName}" NOT FOUND in DOM`);
        }
        
        if (sectionName === 'users-management') {
            console.log('📋 Loading users management data...');
            this.loadUsersManagementTable();
        }
    }

    async loadAllData() {
        console.log('📊 ========================================');
        console.log('📊 LOADING ALL ANALYTICS DATA');
        console.log('📊 ========================================');
        
        const startTime = Date.now();
        
        try {
            // SECTION 1: THIRD-PARTY ANALYTICS
            console.log('💳 Loading Stripe & Cloudflare...');
            await Promise.all([
                this.loadStripeMetrics(),
                this.loadCloudflareAnalytics(),
                this.loadCloudflareGeo(),
                this.loadCloudflareDevices(),
                this.loadCloudflarePages(),
                this.loadCloudflareCache(),
                this.loadCloudflareReferrers(),
                this.loadGmailStats(),
                this.loadGmailInbox(),
                this.loadSentEmails()
            ]);
            console.log('✅ Third-party analytics loaded');
            
            // SECTION 2: FIREBASE CORE ANALYTICS
            console.log('🔥 Loading Firebase core data...');
            await Promise.all([
                this.loadUsersStats(),
                this.loadVisitsStats(),
                this.loadRevenueStats(),
                this.loadEngagementStats()
            ]);
            console.log('✅ Firebase core stats loaded');
            
            // 🆕 SECTION 3: NOUVELLES COLLECTIONS FIRESTORE
            console.log('📦 Loading new Firestore collections...');
            await Promise.all([
                this.loadWatchlistsData(),
                this.loadPortfoliosData(),
                this.loadNewsletterData(),
                this.loadApiUsageData(),
                this.loadFeedbackData(),
                this.loadAlertsData(),
                // 🆕 NOUVELLES FONCTIONS
                this.loadRealEstateSimulations(),
                this.loadLoginHistory(),
                this.loadConversationsData(),
                this.loadSocialStats()
            ]);
            console.log('✅ New Firestore collections loaded');

            console.log(`📊 Total users loaded: ${this.allUsersData.length}`);
            console.log(`📊 Total visits loaded: ${this.allVisitsData.length}`);
            console.log(`📊 Total payments loaded: ${this.allPaymentsData.length}`);
            console.log(`📊 Total activities loaded: ${this.allActivityData.length}`);
            console.log(`📊 Total watchlists: ${this.allWatchlistsData.length}`);
            console.log(`📊 Total portfolios: ${this.allPortfoliosData.length}`);
            console.log(`📊 Newsletter subscribers: ${this.allNewsletterSubscribers.length}`);
            console.log(`📊 Real estate simulations: ${this.allRealEstateSimulations?.length || 0}`);
            console.log(`📊 Login history entries: ${this.allLoginHistory?.length || 0}`);
            console.log(`📊 AI conversations: ${this.allConversations?.length || 0}`);
            
            // SECTION 4: ADVANCED ANALYTICS
            console.log('📈 Loading advanced analytics...');
            await Promise.all([
                this.loadSessionAnalytics(),
                this.loadBounceRateAnalytics(),
                this.loadConversionPaths(),
                this.loadHeatmapData()
            ]);
            console.log('✅ Advanced analytics loaded');
            
            // SECTION 5: CHARTS
            console.log('📊 Loading charts...');
            await Promise.all([
                this.loadRegistrationsChart(),
                this.loadPlansChart(),
                this.loadVisitsChart(),
                this.loadRevenueChart(),
                this.loadChurnChart(),
                this.loadCohortChart()
            ]);
            console.log('✅ Charts loaded');
            
            // SECTION 6: TABLES
            console.log('📋 Loading tables...');
            await Promise.all([
                this.loadRecentUsers(),
                this.loadRecentActivity(),
                this.loadTopUsers(),
                this.loadUserSimulations()
            ]);
            console.log('✅ Tables loaded');
            
            // SECTION 7: ADVANCED FEATURES
            console.log('🤖 Loading advanced features...');
            await Promise.all([
                this.loadConversionFunnel(),
                this.loadLTVAnalysis(),
                this.loadMLPredictions()
            ]);
            console.log('✅ Advanced features loaded');
            
            // SECTION 8: NON-CUSTOMERS
            console.log('👥 Loading non-customer data...');
            await this.loadNonCustomerVisitors();
            await this.loadPotentialCustomers();
            console.log('✅ Non-customer data loaded');
            
            // SECTION 9: DETAILED USERS
            console.log('📋 Loading detailed users data...');
            await this.loadUsersDetailedData();
            console.log('✅ Detailed users data loaded');
            
            const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log('========================================');
            console.log(`✅ ALL DATA LOADED in ${loadTime}s`);
            console.log('========================================');
            
        } catch (error) {
            console.error('❌ ========================================');
            console.error('❌ ERROR LOADING DATA:');
            console.error('❌ ========================================');
            console.error(error);
            alert('⚠ Error loading analytics data. Check console for details.');
        }
    }

    async refreshAllDisplays() {
        console.log('🔄 Refreshing all displays...');
        
        try {
            this.displayCacheStats();
            
            if (this.stripeData) {
                this.displayStripeMetrics(this.stripeData);
            }
            
            if (this.cloudflareData) {
                this.displayCloudflareAnalytics(this.cloudflareData);
            }

            if (this.cloudflareGeo || this.cloudflarePages) {
                this.displayCloudflareExtras();
            }

            if (this.cloudflareGeo && this.cloudflareGeo.length > 0) {
                this.createGeoMap();
            }
            
            await this.loadRecentUsers();
            await this.loadRecentActivity();
            await this.loadTopUsers();
            
            this.displayNonCustomerVisitors();
            this.displayPotentialCustomers();
            this.createLeadsCharts();
            
            // 🆕 AFFICHER LES NOUVELLES DONNÉES
            this.displayWatchlistsStats();
            this.displayPortfoliosStats();
            this.displayNewsletterStats();
            this.displayNewsletterSubscribers();
            this.displayRealEstateStats();
            this.displayLoginHistoryStats();
            this.displayConversationsStats();
            this.displaySocialStatsByUser();
            
            console.log('✅ All displays refreshed successfully');
            
        } catch (error) {
            console.error('❌ Error refreshing displays:', error);
        }
    }

    // ========================================
    // 🔥 SECTION 1: THIRD-PARTY ANALYTICS (Worker v4.4)
    // ========================================
    
    async loadStripeMetrics() {
        try {
            console.log('💳 Loading Stripe metrics...');
            
            const cacheKey = 'stripe-analytics';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                this.stripeData = cachedData;
                this.displayStripeMetrics(cachedData);
                return;
            }
            
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - using cached data only');
                return;
            }
            
            this.cache.incrementCallCount();
            
            const response = await fetch(`${WORKER_URL}/stripe-analytics`);
            
            if (!response.ok) {
                throw new Error(`Stripe API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            this.cache.set(cacheKey, data);
            
            this.stripeData = data;
            this.displayStripeMetrics(data);
            
            console.log('✅ Stripe metrics loaded from API');
            
        } catch (error) {
            console.error('❌ Error loading Stripe metrics:', error);
        }
    }

    displayStripeMetrics(data) {
        console.log('💳 Displaying Stripe metrics:', data);
        
        if (!data) {
            console.warn('⚠ No Stripe data to display');
            return;
        }
        
        if (data.customers) {
            this.updateStat('stripe-total-customers', data.customers.total || 0);
            this.updateStat('stripe-with-subscription', data.customers.withSubscription || 0);
        }
        
        if (data.subscriptions) {
            this.updateStat('stripe-active-subs', data.subscriptions.active || 0);
            this.updateStat('stripe-trialing-subs', data.subscriptions.trialing || 0);
            this.updateStat('stripe-canceled-subs', data.subscriptions.canceled || 0);
        }
        
        if (data.revenue) {
            const mrr = (data.revenue.mrr / 100).toFixed(2);
            const arr = (data.revenue.arr / 100).toFixed(2);
            this.updateStat('stripe-mrr', `$${mrr}`);
            this.updateStat('stripe-arr', `$${arr}`);
            console.log(`💰 Stripe Revenue - MRR: $${mrr}, ARR: $${arr}`);
        }
        
        this.createStripeChart(data);
        
        console.log('✅ Stripe metrics displayed');
    }

    async loadCloudflareAnalytics() {
        try {
            console.log('☁ Loading Cloudflare analytics...');
            
            const cacheKey = 'cloudflare-analytics';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                this.cloudflareData = cachedData;
                this.displayCloudflareAnalytics(cachedData);
                return;
            }
            
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - skipping Cloudflare analytics');
                return;
            }
            
            this.cache.incrementCallCount();
            
            // 🔥 ADAPTATION AU WORKER v4.4 - UTILISER ?days=30
            const response = await fetch(`${WORKER_URL}/cloudflare-analytics?days=30`);
            
            if (!response.ok) {
                throw new Error(`Cloudflare API error: ${response.status}`);
            }
            
            const result = await response.json();
            
            // 🔥 WORKER RETOURNE result.data
            this.cache.set(cacheKey, result.data);
            
            this.cloudflareData = result.data;
            this.displayCloudflareAnalytics(result.data);
            
            console.log('✅ Cloudflare analytics loaded from API');
            console.log('📊 Cloudflare data structure:', result);
            
        } catch (error) {
            console.error('❌ Error loading Cloudflare analytics:', error);
        }
    }

    displayCloudflareAnalytics(data) {
        console.log('☁ Displaying Cloudflare analytics:', data);
        
        if (!data || !data.overview) {
            console.warn('⚠ No Cloudflare data to display');
            return;
        }
        
        const overview = data.overview;
        
        this.updateStat('cf-total-requests', (overview.totalRequests || 0).toLocaleString());
        this.updateStat('cf-total-pageviews', (overview.totalPageViews || 0).toLocaleString());
        this.updateStat('cf-total-uniques', (overview.totalUniques || 0).toLocaleString());
        this.updateStat('cf-cache-hit-rate', `${overview.cacheHitRate || 0}%`);
        this.updateStat('cf-total-threats', overview.totalThreats || 0);
        this.updateStat('cf-total-bytes', this.formatBytes(overview.totalBytes || 0));
        
        console.log(`📊 Cloudflare Stats - Requests: ${overview.totalRequests}, Pageviews: ${overview.totalPageViews}, Uniques: ${overview.totalUniques}`);
        
        this.createCloudflareCharts(data);
        
        console.log('✅ Cloudflare analytics displayed');
    }

    displayCloudflareExtras() {
        console.log('📊 Displaying Cloudflare extras (Top Country & Pages)...');
        
        // TOP COUNTRY KPI
        if (this.cloudflareGeo && this.cloudflareGeo.length > 0) {
            const sortedCountries = [...this.cloudflareGeo].sort((a, b) => b.requests - a.requests);
            const topCountry = sortedCountries[0];
            
            this.updateStat('cf-top-country', topCountry.country);
            this.updateStat('cf-top-country-requests', topCountry.requests.toLocaleString());
            
            console.log(`🌍 Top Country: ${topCountry.country} (${topCountry.requests.toLocaleString()} requests)`);
        } else {
            console.warn('⚠ No geo data available for Top Country KPI');
            this.updateStat('cf-top-country', 'N/A');
            this.updateStat('cf-top-country-requests', '0');
        }
        
        // TOP PAGES TABLE
        const tbody = document.getElementById('cf-pages-table-body');
        if (!tbody) {
            console.warn('⚠ Top Pages table body not found');
            return;
        }
        
        if (!this.cloudflarePages || this.cloudflarePages.length === 0) {
            console.warn('⚠ No pages data available');
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" style="text-align: center; padding: 20px; color: #64748b;">
                        <i class="fas fa-inbox" style="font-size: 1.5rem; margin-bottom: 8px; display: block;"></i>
                        <p style="margin: 0;">No page data available</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        
        const sortedPages = [...this.cloudflarePages].sort((a, b) => b.requests - a.requests);
        const topPages = sortedPages.slice(0, 10);
        
        console.log(`📄 Displaying top ${topPages.length} pages`);
        
        topPages.forEach((page, index) => {
            const row = document.createElement('tr');
            
            let pageName = page.path || 'N/A';
            if (pageName === '/') {
                pageName = '🏠 Home Page';
            } else if (pageName.endsWith('.html')) {
                pageName = pageName.replace('.html', '').replace(/\//g, '');
            }
            
            row.innerHTML = `
                <td style="width: 40px; text-align: center;">${index + 1}</td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${pageName}
                </td>
                <td style="width: 120px; text-align: right; font-weight: 600;">
                    ${page.requests.toLocaleString()}
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log('✅ Top Pages table populated');
    }

    createGeoMap() {
        const mapContainer = document.getElementById('geo-map');
        if (!mapContainer) {
            console.warn('⚠ Geo map container not found');
            return;
        }
        
        if (!this.cloudflareGeo || this.cloudflareGeo.length === 0) {
            console.warn('⚠ No geo data available for map');
            return;
        }
        
        console.log('🗺 Creating geographic map...');
        
        if (this.maps.geoMap) {
            this.maps.geoMap.remove();
        }
        
        const map = L.map('geo-map').setView([20, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);
        
        const countryCoords = {
        // 🌍 AMÉRIQUE DU NORD
        'US': [37.0902, -95.7129],
        'United States': [37.0902, -95.7129],
        'USA': [37.0902, -95.7129],
        'CA': [56.1304, -106.3468],
        'Canada': [56.1304, -106.3468],
        'MX': [23.6345, -102.5528],
        'Mexico': [23.6345, -102.5528],
        
        // 🌍 AMÉRIQUE CENTRALE & CARAÏBES
        'CR': [9.7489, -83.7534],
        'Costa Rica': [9.7489, -83.7534],
        'PA': [8.5380, -80.7821],
        'Panama': [8.5380, -80.7821],
        'JM': [18.1096, -77.2975],
        'Jamaica': [18.1096, -77.2975],
        'CU': [21.5218, -77.7812],
        'Cuba': [21.5218, -77.7812],
        
        // 🌍 AMÉRIQUE DU SUD
        'BR': [-14.2350, -51.9253],
        'Brazil': [-14.2350, -51.9253],
        'AR': [-38.4161, -63.6167],
        'Argentina': [-38.4161, -63.6167],
        'CL': [-35.6751, -71.5430],
        'Chile': [-35.6751, -71.5430],
        'CO': [4.5709, -74.2973],
        'Colombia': [4.5709, -74.2973],
        'PE': [-9.1900, -75.0152],
        'Peru': [-9.1900, -75.0152],
        'VE': [6.4238, -66.5897],
        'Venezuela': [6.4238, -66.5897],
        'EC': [-1.8312, -78.1834],
        'Ecuador': [-1.8312, -78.1834],
        'UY': [-32.5228, -55.7658],
        'Uruguay': [-32.5228, -55.7658],
        'PY': [-23.4425, -58.4438],
        'Paraguay': [-23.4425, -58.4438],
        
        // 🌍 EUROPE OCCIDENTALE
        'FR': [46.2276, 2.2137],
        'France': [46.2276, 2.2137],
        'GB': [55.3781, -3.4360],
        'United Kingdom': [55.3781, -3.4360],
        'UK': [55.3781, -3.4360],
        'DE': [51.1657, 10.4515],
        'Germany': [51.1657, 10.4515],
        'ES': [40.4637, -3.7492],
        'Spain': [40.4637, -3.7492],
        'IT': [41.8719, 12.5674],
        'Italy': [41.8719, 12.5674],
        'PT': [39.3999, -8.2245],
        'Portugal': [39.3999, -8.2245],
        'NL': [52.1326, 5.2913],
        'Netherlands': [52.1326, 5.2913],
        'BE': [50.5039, 4.4699],
        'Belgium': [50.5039, 4.4699],
        'CH': [46.8182, 8.2275],
        'Switzerland': [46.8182, 8.2275],
        'AT': [47.5162, 14.5501],
        'Austria': [47.5162, 14.5501],
        'IE': [53.4129, -8.2439],
        'Ireland': [53.4129, -8.2439],
        'LU': [49.8153, 6.1296],
        'Luxembourg': [49.8153, 6.1296],
        
        // 🌍 EUROPE DU NORD
        'SE': [60.1282, 18.6435],
        'Sweden': [60.1282, 18.6435],
        'NO': [60.4720, 8.4689],
        'Norway': [60.4720, 8.4689],
        'DK': [56.2639, 9.5018],
        'Denmark': [56.2639, 9.5018],
        'FI': [61.9241, 25.7482],
        'Finland': [61.9241, 25.7482],
        'IS': [64.9631, -19.0208],
        'Iceland': [64.9631, -19.0208],
        
        // 🌍 EUROPE DE L'EST
        'PL': [51.9194, 19.1451],
        'Poland': [51.9194, 19.1451],
        'CZ': [49.8175, 15.4730],
        'Czech Republic': [49.8175, 15.4730],
        'HU': [47.1625, 19.5033],
        'Hungary': [47.1625, 19.5033],
        'RO': [45.9432, 24.9668],
        'Romania': [45.9432, 24.9668],
        'BG': [42.7339, 25.4858],
        'Bulgaria': [42.7339, 25.4858],
        'GR': [39.0742, 21.8243],
        'Greece': [39.0742, 21.8243],
        'UA': [48.3794, 31.1656],
        'Ukraine': [48.3794, 31.1656],
        'RU': [61.5240, 105.3188],
        'Russia': [61.5240, 105.3188],
        'HR': [45.1, 15.2],
        'Croatia': [45.1, 15.2],
        'RS': [44.0165, 21.0059],
        'Serbia': [44.0165, 21.0059],
        'SK': [48.6690, 19.6990],
        'Slovakia': [48.6690, 19.6990],
        'SI': [46.1512, 14.9955],
        'Slovenia': [46.1512, 14.9955],
        
        // 🌍 ASIE DE L'EST
        'CN': [35.8617, 104.1954],
        'China': [35.8617, 104.1954],
        'JP': [36.2048, 138.2529],
        'Japan': [36.2048, 138.2529],
        'KR': [35.9078, 127.7669],
        'South Korea': [35.9078, 127.7669],
        'KP': [40.3399, 127.5101],
        'North Korea': [40.3399, 127.5101],
        'TW': [23.6978, 120.9605],
        'Taiwan': [23.6978, 120.9605],
        'HK': [22.3193, 114.1694],
        'Hong Kong': [22.3193, 114.1694],
        'MO': [22.1987, 113.5439],
        'Macau': [22.1987, 113.5439],
        'MN': [46.8625, 103.8467],
        'Mongolia': [46.8625, 103.8467],
        
        // 🌍 ASIE DU SUD-EST
        'TH': [15.8700, 100.9925],
        'Thailand': [15.8700, 100.9925],
        'VN': [14.0583, 108.2772],
        'Vietnam': [14.0583, 108.2772],
        'SG': [1.3521, 103.8198],
        'Singapore': [1.3521, 103.8198],
        'MY': [4.2105, 101.9758],
        'Malaysia': [4.2105, 101.9758],
        'ID': [-0.7893, 113.9213],
        'Indonesia': [-0.7893, 113.9213],
        'PH': [12.8797, 121.7740],
        'Philippines': [12.8797, 121.7740],
        'MM': [21.9162, 95.9560],
        'Myanmar': [21.9162, 95.9560],
        'KH': [12.5657, 104.9910],
        'Cambodia': [12.5657, 104.9910],
        'LA': [19.8563, 102.4955],
        'Laos': [19.8563, 102.4955],
        'BN': [4.5353, 114.7277],
        'Brunei': [4.5353, 114.7277],
        
        // 🌍 ASIE DU SUD
        'IN': [20.5937, 78.9629],
        'India': [20.5937, 78.9629],
        'PK': [30.3753, 69.3451],
        'Pakistan': [30.3753, 69.3451],
        'BD': [23.6850, 90.3563],
        'Bangladesh': [23.6850, 90.3563],
        'LK': [7.8731, 80.7718],
        'Sri Lanka': [7.8731, 80.7718],
        'NP': [28.3949, 84.1240],
        'Nepal': [28.3949, 84.1240],
        'BT': [27.5142, 90.4336],
        'Bhutan': [27.5142, 90.4336],
        'MV': [3.2028, 73.2207],
        'Maldives': [3.2028, 73.2207],
        'AF': [33.9391, 67.7100],
        'Afghanistan': [33.9391, 67.7100],
        
        // 🌍 MOYEN-ORIENT
        'SA': [23.8859, 45.0792],
        'Saudi Arabia': [23.8859, 45.0792],
        'AE': [23.4241, 53.8478],
        'United Arab Emirates': [23.4241, 53.8478],
        'UAE': [23.4241, 53.8478],
        'IL': [31.0461, 34.8516],
        'Israel': [31.0461, 34.8516],
        'TR': [38.9637, 35.2433],
        'Turkey': [38.9637, 35.2433],
        'IR': [32.4279, 53.6880],
        'Iran': [32.4279, 53.6880],
        'IQ': [33.2232, 43.6793],
        'Iraq': [33.2232, 43.6793],
        'SY': [34.8021, 38.9968],
        'Syria': [34.8021, 38.9968],
        'JO': [30.5852, 36.2384],
        'Jordan': [30.5852, 36.2384],
        'LB': [33.8547, 35.8623],
        'Lebanon': [33.8547, 35.8623],
        'KW': [29.3117, 47.4818],
        'Kuwait': [29.3117, 47.4818],
        'QA': [25.3548, 51.1839],
        'Qatar': [25.3548, 51.1839],
        'BH': [26.0667, 50.5577],
        'Bahrain': [26.0667, 50.5577],
        'OM': [21.4735, 55.9754],
        'Oman': [21.4735, 55.9754],
        'YE': [15.5527, 48.5164],
        'Yemen': [15.5527, 48.5164],
        
        // 🌍 AFRIQUE DU NORD
        'EG': [26.8206, 30.8025],
        'Egypt': [26.8206, 30.8025],
        'DZ': [28.0339, 1.6596],
        'Algeria': [28.0339, 1.6596],
        'MA': [31.7917, -7.0926],
        'Morocco': [31.7917, -7.0926],
        'TN': [33.8869, 9.5375],
        'Tunisia': [33.8869, 9.5375],
        'LY': [26.3351, 17.2283],
        'Libya': [26.3351, 17.2283],
        
        // 🌍 AFRIQUE SUBSAHARIENNE
        'ZA': [-30.5595, 22.9375],
        'South Africa': [-30.5595, 22.9375],
        'NG': [9.0820, 8.6753],
        'Nigeria': [9.0820, 8.6753],
        'KE': [-0.0236, 37.9062],
        'Kenya': [-0.0236, 37.9062],
        'ET': [9.1450, 40.4897],
        'Ethiopia': [9.1450, 40.4897],
        'GH': [7.9465, -1.0232],
        'Ghana': [7.9465, -1.0232],
        'TZ': [-6.3690, 34.8888],
        'Tanzania': [-6.3690, 34.8888],
        'UG': [1.3733, 32.2903],
        'Uganda': [1.3733, 32.2903],
        'SN': [14.4974, -14.4524],
        'Senegal': [14.4974, -14.4524],
        'CM': [7.3697, 12.3547],
        'Cameroon': [7.3697, 12.3547],
        'CI': [7.5400, -5.5471],
        'Ivory Coast': [7.5400, -5.5471],
        'AO': [-11.2027, 17.8739],
        'Angola': [-11.2027, 17.8739],
        'MZ': [-18.6657, 35.5296],
        'Mozambique': [-18.6657, 35.5296],
        'ZW': [-19.0154, 29.1549],
        'Zimbabwe': [-19.0154, 29.1549],
        'BW': [-22.3285, 24.6849],
        'Botswana': [-22.3285, 24.6849],
        'NA': [-22.9576, 18.4904],
        'Namibia': [-22.9576, 18.4904],
        'RW': [-1.9403, 29.8739],
        'Rwanda': [-1.9403, 29.8739],
        
        // 🌍 OCÉANIE
        'AU': [-25.2744, 133.7751],
        'Australia': [-25.2744, 133.7751],
        'NZ': [-40.9006, 174.8860],
        'New Zealand': [-40.9006, 174.8860],
        'FJ': [-17.7134, 178.0650],
        'Fiji': [-17.7134, 178.0650],
        'PG': [-6.3150, 143.9555],
        'Papua New Guinea': [-6.3150, 143.9555],
        'NC': [-20.9043, 165.6180],
        'New Caledonia': [-20.9043, 165.6180],
        'PF': [-17.6797, -149.4068],
        'French Polynesia': [-17.6797, -149.4068],
        
        // 🌍 ASIE CENTRALE
        'KZ': [48.0196, 66.9237],
        'Kazakhstan': [48.0196, 66.9237],
        'UZ': [41.3775, 64.5853],
        'Uzbekistan': [41.3775, 64.5853],
        'TM': [38.9697, 59.5563],
        'Turkmenistan': [38.9697, 59.5563],
        'KG': [41.2044, 74.7661],
        'Kyrgyzstan': [41.2044, 74.7661],
        'TJ': [38.8610, 71.2761],
        'Tajikistan': [38.8610, 71.2761]
    };
        
        this.cloudflareGeo.forEach(country => {
            const coords = countryCoords[country.country] || countryCoords[country.countryCode];
            
            if (coords) {
                const requests = country.requests || 0;
                const radius = Math.max(5, Math.min(50, Math.sqrt(requests) / 10));
                
                L.circleMarker(coords, {
                    radius: radius,
                    fillColor: '#667eea',
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.6
                })
                .bindPopup(`
                    <b>${country.country}</b><br>
                    Requests: ${requests.toLocaleString()}<br>
                    Percentage: ${country.percentage}%
                `)
                .addTo(map);
            }
        });
        
        this.maps.geoMap = map;
        console.log('✅ Geographic map created');
    }

    async loadCloudflareGeo() {
        try {
            console.log('🌍 Loading Cloudflare Geo...');
            
            const cacheKey = 'cloudflare-geo';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                this.cloudflareGeo = cachedData;
                return;
            }
            
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - skipping Cloudflare Geo');
                return;
            }
            
            this.cache.incrementCallCount();
            
            const response = await fetch(`${WORKER_URL}/cloudflare-geo`);
            
            if (!response.ok) {
                throw new Error(`Cloudflare Geo error: ${response.status}`);
            }
            
            const result = await response.json();
            
            this.cache.set(cacheKey, result.countries);
            this.cloudflareGeo = result.countries;
            
            console.log('✅ Cloudflare Geo loaded from API');
            
        } catch (error) {
            console.error('❌ Error loading Cloudflare Geo:', error);
        }
    }

    async loadCloudflareDevices() {
        try {
            console.log('📱 Loading Cloudflare Devices...');
            
            const cacheKey = 'cloudflare-devices';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                this.cloudflareDevices = cachedData;
                return;
            }
            
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - skipping Cloudflare Devices');
                return;
            }
            
            this.cache.incrementCallCount();
            
            const response = await fetch(`${WORKER_URL}/cloudflare-devices`);
            
            if (!response.ok) {
                throw new Error(`Cloudflare Devices error: ${response.status}`);
            }
            
            const result = await response.json();
            
            // 🔥 WORKER RETOURNE result.devices, result.browsers, result.operatingSystems
            this.cache.set(cacheKey, result);
            this.cloudflareDevices = result;
            
            console.log('✅ Cloudflare Devices loaded from API');
            
        } catch (error) {
            console.error('❌ Error loading Cloudflare Devices:', error);
        }
    }

    async loadCloudflarePages() {
        try {
            console.log('📄 Loading Cloudflare Pages...');
            
            const cacheKey = 'cloudflare-pages';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                this.cloudflarePages = cachedData;
                return;
            }
            
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - skipping Cloudflare Pages');
                return;
            }
            
            this.cache.incrementCallCount();
            
            const response = await fetch(`${WORKER_URL}/cloudflare-pages`);
            
            if (!response.ok) {
                throw new Error(`Cloudflare Pages error: ${response.status}`);
            }
            
            const result = await response.json();
            
            this.cache.set(cacheKey, result.pages);
            this.cloudflarePages = result.pages;
            
            console.log('✅ Cloudflare Pages loaded from API');
            
        } catch (error) {
            console.error('❌ Error loading Cloudflare Pages:', error);
        }
    }

    // 🆕 NOUVEAU ENDPOINT CACHE
    async loadCloudflareCache() {
        try {
            console.log('💾 Loading Cloudflare Cache stats...');
            
            const cacheKey = 'cloudflare-cache';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                this.cloudflareCache = cachedData;
                return;
            }
            
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - skipping Cloudflare Cache');
                return;
            }
            
            this.cache.incrementCallCount();
            
            const response = await fetch(`${WORKER_URL}/cloudflare-cache`);
            
            if (!response.ok) {
                throw new Error(`Cloudflare Cache error: ${response.status}`);
            }
            
            const result = await response.json();
            
            this.cache.set(cacheKey, result.cacheStats);
            this.cloudflareCache = result.cacheStats;
            
            console.log('✅ Cloudflare Cache stats loaded from API');
            console.log('📊 Cache data:', this.cloudflareCache);
            
        } catch (error) {
            console.error('❌ Error loading Cloudflare Cache:', error);
        }
    }

    // 🆕 NOUVEAU ENDPOINT REFERRERS
    async loadCloudflareReferrers() {
        try {
            console.log('🔗 Loading Cloudflare Referrers...');
            
            const cacheKey = 'cloudflare-referrers';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                this.cloudflareReferrers = cachedData;
                return;
            }
            
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - skipping Cloudflare Referrers');
                return;
            }
            
            this.cache.incrementCallCount();
            
            const response = await fetch(`${WORKER_URL}/cloudflare-referrers`);
            
            if (!response.ok) {
                // 🔥 SI ERREUR 403 = PLAN FREE (PAS ACCÈS À clientRefererHost)
                if (response.status === 403) {
                    console.warn('⚠ Referrers tracking requires Cloudflare Pro plan');
                    this.cloudflareReferrers = [];
                    return;
                }
                throw new Error(`Cloudflare Referrers error: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.cache.set(cacheKey, result.referrers);
                this.cloudflareReferrers = result.referrers;
                console.log('✅ Cloudflare Referrers loaded from API');
            } else {
                console.warn('⚠ Referrers not available:', result.message);
                this.cloudflareReferrers = [];
            }
            
        } catch (error) {
            console.error('❌ Error loading Cloudflare Referrers:', error);
            this.cloudflareReferrers = [];
        }
    }

    // ========================================
    // 🔥 SECTION 2: INTERNAL ANALYTICS (FIREBASE)
    // ========================================
    
    async loadUsersStats() {
        try {
            console.log('👥 Loading users stats...');
            
            const usersSnapshot = await this.db.collection('users').get();
            const totalUsers = usersSnapshot.size;
            
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            
            let weekUsers = 0;
            let monthUsers = 0;
            let premiumUsers = 0;
            let activeUsers = 0;
            let emailVerifiedUsers = 0;
            
            this.allUsersData = [];
            
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                
                this.allUsersData.push({
                    id: doc.id,
                    ...data
                });
                
                if (data.plan && data.plan !== 'free' && data.plan !== 'basic') {
                    premiumUsers++;
                }
                
                if (data.emailVerified) {
                    emailVerifiedUsers++;
                }
                
                if (data.createdAt) {
                    const createdDate = data.createdAt.toDate();
                    if (createdDate > weekAgo) weekUsers++;
                    if (createdDate > monthAgo) monthUsers++;
                }
                
                if (data.lastLogin && data.lastLogin.toDate() > weekAgo) {
                    activeUsers++;
                }
            });
            
            this.updateStat('total-users', totalUsers);
            this.updateStat('users-change', `+${weekUsers} this week`);
            this.updateStat('premium-users', premiumUsers);
            
            const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0;
            this.updateStat('premium-change', `${conversionRate}% conversion`);
            
            this.updateStat('active-users', activeUsers);
            this.updateStat('monthly-signups', monthUsers);
            this.updateStat('email-verified-users', emailVerifiedUsers);
            
            const activeRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;
            this.updateStat('active-rate', `${activeRate}%`);
            
            console.log('✅ Users stats loaded:', totalUsers, 'total users');
            
        } catch (error) {
            console.error('❌ Error loading users stats:', error);
        }
    }

    async loadVisitsStats() {
        try {
            console.log('📊 Loading visits stats...');
            
            const visitsSnapshot = await this.db.collection('analytics_visits').get();
            const totalVisits = visitsSnapshot.size;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            let todayVisits = 0;
            let weekVisits = 0;
            let uniqueVisitors = new Set();
            let anonymousVisits = 0;
            let authenticatedVisits = 0;
            
            this.allVisitsData = [];
            
            visitsSnapshot.forEach(doc => {
                const data = doc.data();
                
                this.allVisitsData.push({
                    id: doc.id,
                    ...data
                });
                
                if (data.timestamp) {
                    const visitDate = data.timestamp.toDate();
                    
                    if (visitDate >= today) todayVisits++;
                    if (visitDate >= weekAgo) weekVisits++;
                    
                    if (data.userId) {
                        uniqueVisitors.add(data.userId);
                        authenticatedVisits++;
                    } else {
                        anonymousVisits++;
                    }
                }
            });
            
            this.updateStat('total-visits', totalVisits.toLocaleString());
            this.updateStat('visits-change', `+${todayVisits} today`);
            this.updateStat('unique-visitors', uniqueVisitors.size.toLocaleString());
            this.updateStat('anonymous-visits', anonymousVisits.toLocaleString());
            
            const avgVisitsPerDay = weekVisits > 0 ? (weekVisits / 7).toFixed(1) : '0';
            this.updateStat('avg-visits-per-day', avgVisitsPerDay);
            
            console.log('✅ Visits stats loaded:', totalVisits, 'total visits');
            
        } catch (error) {
            console.error('❌ Error loading visits stats:', error);
        }
    }

    async loadRevenueStats() {
        try {
            console.log('💰 Loading revenue stats...');
            
            const paymentsSnapshot = await this.db.collection('payments').get();
            
            let totalRevenue = 0;
            let monthRevenue = 0;
            let activeSubscriptions = 0;
            let mrr = 0;
            
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            
            const planPrices = {
                'basic': 0,
                'pro': 29.99,
                'platinum': 99.99
            };

            this.allPaymentsData = [];

            paymentsSnapshot.forEach(doc => {
                const data = doc.data();
                const amount = parseFloat(data.amount) || 0;
                
                this.allPaymentsData.push({
                    id: doc.id,
                    ...data
                });
                
                totalRevenue += amount;
                
                if (data.createdAt && data.createdAt.toDate() > monthAgo) {
                    monthRevenue += amount;
                }
            });

            console.log('📊 Calculating active subscriptions from users...');

            this.allUsersData.forEach(user => {
                const plan = user.plan || 'basic';
                
                if (plan && (plan === 'basic' || plan === 'pro' || plan === 'platinum')) {
                    activeSubscriptions++;
                    const planPrice = planPrices[plan] || 0;
                    mrr += planPrice;
                }
            });

            console.log(`📊 Total Active Subscriptions: ${activeSubscriptions}`);
            console.log(`📊 Total MRR: $${mrr.toFixed(2)}`);
            
            const arr = mrr * 12;
            
            this.updateStat('total-revenue', `$${totalRevenue.toFixed(0)}`);
            this.updateStat('revenue-change', `+$${monthRevenue.toFixed(0)} this month`);
            this.updateStat('mrr', `$${mrr.toFixed(0)}`);
            this.updateStat('arr', `$${arr.toFixed(0)}`);
            this.updateStat('active-subscriptions', activeSubscriptions);
            
            const totalCustomers = this.allUsersData.length || 1;
            const arpu = totalRevenue / totalCustomers;
            this.updateStat('arpu', `$${arpu.toFixed(2)}`);
            
            this.currentMRR = mrr;
            
            console.log('✅ Revenue stats loaded: $', totalRevenue);
            
        } catch (error) {
            console.error('❌ Error loading revenue stats:', error);
        }
    }

    async loadEngagementStats() {
        try {
            console.log('⚡ Loading engagement stats...');
            
            const activitySnapshot = await this.db.collection('analytics_activity').get();
            
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            let weekActivity = 0;
            let userActions = {};
            const actionTypes = {};
            
            this.allActivityData = [];
            
            activitySnapshot.forEach(doc => {
                const data = doc.data();
                
                this.allActivityData.push({
                    id: doc.id,
                    ...data
                });
                
                if (data.timestamp && data.timestamp.toDate() > weekAgo) {
                    weekActivity++;
                    
                    if (data.userId) {
                        userActions[data.userId] = (userActions[data.userId] || 0) + 1;
                    }
                    
                    if (data.action) {
                        actionTypes[data.action] = (actionTypes[data.action] || 0) + 1;
                    }
                }
            });
            
            const avgActionsPerUser = Object.keys(userActions).length > 0
                ? (weekActivity / Object.keys(userActions).length).toFixed(1)
                : '0';
            
            this.updateStat('total-activity', this.allActivityData.length.toLocaleString());
            this.updateStat('avg-actions-per-user', avgActionsPerUser);
            
            const topAction = Object.entries(actionTypes)
                .sort((a, b) => b[1] - a[1])[0];
            
            if (topAction) {
                this.updateStat('top-action', `${topAction[0]} (${topAction[1]})`);
            }
            
            console.log('✅ Engagement stats loaded:', weekActivity, 'activities this week');
            
        } catch (error) {
            console.error('❌ Error loading engagement stats:', error);
        }
    }

    // ========================================
    // 🆕 SECTION 3: NOUVELLES COLLECTIONS FIRESTORE
    // ========================================

    async loadWatchlistsData() {
        try {
            console.log('📋 Loading watchlists data...');
            
            this.allWatchlistsData = [];
            
            // 🔥 MÉTHODE 1 : Collection globale /watchlists (si elle existe)
            try {
                const watchlistsSnapshot = await this.db.collection('watchlists').get();
                console.log(`   Found ${watchlistsSnapshot.size} global watchlists`);
                
                watchlistsSnapshot.forEach(doc => {
                    this.allWatchlistsData.push({
                        id: doc.id,
                        ...doc.data(),
                        source: 'global'
                    });
                });
            } catch (e) {
                console.warn('⚠ No global /watchlists collection');
            }
            
            // 🔥 MÉTHODE 2 : Sous-collections users/{userId}/watchlist (SINGULIER)
            for (const user of this.allUsersData) {
                try {
                    // 🔥 CORRECTION : watchlist (SINGULIER, pas watchlists)
                    const userWatchlistSnapshot = await this.db
                        .collection('users')
                        .doc(user.id)
                        .collection('watchlist')
                        .get();
                    
                    console.log(`   User ${user.email}: ${userWatchlistSnapshot.size} watchlist items`);
                    
                    userWatchlistSnapshot.forEach(doc => {
                        this.allWatchlistsData.push({
                            id: doc.id,
                            userId: user.id,
                            userEmail: user.email,
                            ...doc.data(),
                            source: 'user'
                        });
                    });
                } catch (e) {
                    // User n'a pas de watchlist
                }
            }
            
            console.log(`✅ Watchlists loaded: ${this.allWatchlistsData.length} total`);
            
            // Calculer les stats
            const totalWatchlists = this.allWatchlistsData.length;
            const usersWithWatchlists = new Set(this.allWatchlistsData.map(w => w.userId)).size;
            const avgWatchlistsPerUser = usersWithWatchlists > 0 ? (totalWatchlists / usersWithWatchlists).toFixed(1) : 0;
            
            this.updateStat('total-watchlists', totalWatchlists);
            this.updateStat('users-with-watchlists', usersWithWatchlists);
            this.updateStat('avg-watchlists-per-user', avgWatchlistsPerUser);
            this.updateStat('total-watchlists-detail', totalWatchlists); // Pour la section détail
            
        } catch (error) {
            console.error('❌ Error loading watchlists:', error);
        }
    }

    async loadPortfoliosData() {
        try {
            console.log('💼 Loading portfolios data...');
            
            this.allPortfoliosData = [];
            
            // 🔥 MÉTHODE 1 : Collection globale /portfolios (si elle existe)
            try {
                const portfoliosSnapshot = await this.db.collection('portfolios').get();
                console.log(`   Found ${portfoliosSnapshot.size} global portfolios`);
                
                portfoliosSnapshot.forEach(doc => {
                    this.allPortfoliosData.push({
                        id: doc.id,
                        ...doc.data(),
                        source: 'global'
                    });
                });
            } catch (e) {
                console.warn('⚠ No global /portfolios collection');
            }
            
            // 🔥 MÉTHODE 2 : Sous-collections users/{userId}/portfolios/{portfolioId}
            for (const user of this.allUsersData) {
                try {
                    const userPortfoliosSnapshot = await this.db
                        .collection('users')
                        .doc(user.id)
                        .collection('portfolios')
                        .get();
                    
                    console.log(`   User ${user.email}: ${userPortfoliosSnapshot.size} portfolios`);
                    
                    userPortfoliosSnapshot.forEach(doc => {
                        const data = doc.data();
                        
                        // 🔥 EXTRAIRE LES SYMBOLES DU CHAMP "watchlist"
                        let symbols = [];
                        if (data.watchlist && Array.isArray(data.watchlist)) {
                            symbols = data.watchlist;
                        } else if (data.symbols && Array.isArray(data.symbols)) {
                            symbols = data.symbols;
                        }
                        
                        this.allPortfoliosData.push({
                            id: doc.id,
                            userId: user.id,
                            userEmail: user.email,
                            ...data,
                            symbols: symbols, // 🔥 Normaliser le champ
                            source: 'user'
                        });
                    });
                } catch (e) {
                    // User n'a pas de portfolio
                }
            }
            
            console.log(`✅ Portfolios loaded: ${this.allPortfoliosData.length} total`);
            
            // Calculer les stats
            const totalPortfolios = this.allPortfoliosData.length;
            const usersWithPortfolios = new Set(this.allPortfoliosData.map(p => p.userId)).size;
            const avgPortfoliosPerUser = usersWithPortfolios > 0 ? (totalPortfolios / usersWithPortfolios).toFixed(1) : 0;
            
            this.updateStat('total-portfolios', totalPortfolios);
            this.updateStat('users-with-portfolios', usersWithPortfolios);
            this.updateStat('avg-portfolios-per-user', avgPortfoliosPerUser);
            
        } catch (error) {
            console.error('❌ Error loading portfolios:', error);
        }
    }

    async loadNewsletterData() {
        try {
            console.log('📧 Loading newsletter subscribers...');
            
            this.allNewsletterSubscribers = [];
            
            // 🔥 MÉTHODE 1 : Collection globale /newsletter_subscribers
            try {
                const newsletterSnapshot = await this.db.collection('newsletter_subscribers').get();
                console.log(`   Found ${newsletterSnapshot.size} newsletter subscribers`);
                
                newsletterSnapshot.forEach(doc => {
                    this.allNewsletterSubscribers.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            } catch (e) {
                console.warn('⚠ No /newsletter_subscribers collection');
            }
            
            // 🔥 MÉTHODE 2 : Lire depuis les champs users
            this.allUsersData.forEach(user => {
                // Vérifier si l'utilisateur a le champ newsletterSubscribedAt ou weeklyNewsletter
                if (user.newsletterSubscribedAt || user.weeklyNewsletter) {
                    this.allNewsletterSubscribers.push({
                        id: user.id,
                        email: user.email,
                        subscribedAt: user.newsletterSubscribedAt ? 
                            (typeof user.newsletterSubscribedAt === 'string' ? 
                                new Date(user.newsletterSubscribedAt) : 
                                user.newsletterSubscribedAt) : 
                            user.createdAt,
                        weeklyNewsletter: user.weeklyNewsletter,
                        source: 'user_field'
                    });
                }
            });
            
            // Dédupliquer par email
            const uniqueSubscribers = new Map();
            this.allNewsletterSubscribers.forEach(sub => {
                if (!uniqueSubscribers.has(sub.email)) {
                    uniqueSubscribers.set(sub.email, sub);
                }
            });
            
            this.allNewsletterSubscribers = Array.from(uniqueSubscribers.values());
            
            console.log(`✅ Newsletter subscribers loaded: ${this.allNewsletterSubscribers.length} total`);
            
            // Calculer les stats
            const totalSubscribers = this.allNewsletterSubscribers.length;
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const newSubscribers = this.allNewsletterSubscribers.filter(sub => {
                if (!sub.subscribedAt) return false;
                const subDate = sub.subscribedAt instanceof Date ? sub.subscribedAt : 
                            (sub.subscribedAt.toDate ? sub.subscribedAt.toDate() : new Date(sub.subscribedAt));
                return subDate > weekAgo;
            }).length;
            
            this.updateStat('total-newsletter-subscribers', totalSubscribers);
            this.updateStat('new-newsletter-subscribers', `+${newSubscribers} this week`);
            this.updateStat('total-newsletter-subscribers-detail', totalSubscribers);
            this.updateStat('new-newsletter-subscribers-detail', `+${newSubscribers} this week`);
            
        } catch (error) {
            console.error('❌ Error loading newsletter data:', error);
        }
    }

    async loadApiUsageData() {
        try {
            console.log('⚡ Loading API usage data...');
            
            this.allApiUsageData = [];
            
            // 🔥 COLLECTION /api_requests OU /api_usage
            try {
                const apiUsageSnapshot = await this.db.collection('api_requests').get();
                console.log(`   Found ${apiUsageSnapshot.size} API requests`);
                
                apiUsageSnapshot.forEach(doc => {
                    this.allApiUsageData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            } catch (e) {
                console.warn('⚠ No /api_requests collection');
            }
            
            // 🔥 ALTERNATIVE : Sous-collections users/{userId}/api_requests
            for (const user of this.allUsersData.slice(0, 10)) { // Limiter à 10 users pour perf
                try {
                    const userApiSnapshot = await this.db
                        .collection('users')
                        .doc(user.id)
                        .collection('api_requests')
                        .limit(100)
                        .get();
                    
                    userApiSnapshot.forEach(doc => {
                        this.allApiUsageData.push({
                            id: doc.id,
                            userId: user.id,
                            userEmail: user.email,
                            ...doc.data()
                        });
                    });
                } catch (e) {
                    // User n'a pas d'API requests
                }
            }
            
            console.log(`✅ API usage loaded: ${this.allApiUsageData.length} requests`);
            
            // Calculer les stats
            const totalApiRequests = this.allApiUsageData.length;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const todayRequests = this.allApiUsageData.filter(req => {
                if (!req.timestamp) return false;
                const reqDate = req.timestamp.toDate ? req.timestamp.toDate() : new Date(req.timestamp);
                return reqDate >= today;
            }).length;
            
            this.updateStat('total-api-requests', totalApiRequests.toLocaleString());
            this.updateStat('api-requests-today', todayRequests);
            
        } catch (error) {
            console.error('❌ Error loading API usage:', error);
        }
    }

    async loadFeedbackData() {
        try {
            console.log('💬 Loading feedback data...');
            
            this.allFeedbackData = [];
            
            try {
                const feedbackSnapshot = await this.db.collection('feedback').get();
                console.log(`   Found ${feedbackSnapshot.size} feedback entries`);
                
                feedbackSnapshot.forEach(doc => {
                    this.allFeedbackData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            } catch (e) {
                console.warn('⚠ No /feedback collection');
            }
            
            console.log(`✅ Feedback loaded: ${this.allFeedbackData.length} entries`);
            
            // Calculer les stats
            const totalFeedback = this.allFeedbackData.length;
            const positiveFeedback = this.allFeedbackData.filter(f => f.sentiment === 'positive' || f.rating >= 4).length;
            const negativeFeedback = this.allFeedbackData.filter(f => f.sentiment === 'negative' || f.rating <= 2).length;
            
            this.updateStat('total-feedback', totalFeedback);
            this.updateStat('positive-feedback', positiveFeedback);
            this.updateStat('negative-feedback', negativeFeedback);
            
        } catch (error) {
            console.error('❌ Error loading feedback:', error);
        }
    }

    async loadAlertsData() {
        try {
            console.log('🔔 Loading user alerts data...');
            
            this.allAlertsData = [];
            
            try {
                const alertsSnapshot = await this.db.collection('user_alerts').get();
                console.log(`   Found ${alertsSnapshot.size} user alerts`);
                
                alertsSnapshot.forEach(doc => {
                    this.allAlertsData.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            } catch (e) {
                console.warn('⚠ No /user_alerts collection');
            }
            
            console.log(`✅ User alerts loaded: ${this.allAlertsData.length} alerts`);
            
            // Calculer les stats
            const totalAlerts = this.allAlertsData.length;
            const activeAlerts = this.allAlertsData.filter(a => a.active || a.enabled).length;
            
            this.updateStat('total-user-alerts', totalAlerts);
            this.updateStat('active-user-alerts', activeAlerts);
            
        } catch (error) {
            console.error('❌ Error loading alerts:', error);
        }
    }

    // ========================================
    // 🆕 SECTION 3B: NOUVELLES DONNÉES FIRESTORE
    // ========================================

    async loadRealEstateSimulations() {
        try {
            console.log('🏠 Loading real estate simulations...');
            
            this.allRealEstateSimulations = [];
            
            for (const user of this.allUsersData) {
                try {
                    const realEstateSnapshot = await this.db
                        .collection('users')
                        .doc(user.id)
                        .collection('realEstateSimulations')
                        .get();
                    
                    realEstateSnapshot.forEach(doc => {
                        this.allRealEstateSimulations.push({
                            id: doc.id,
                            userId: user.id,
                            userEmail: user.email,
                            ...doc.data()
                        });
                    });
                } catch (e) {
                    this.updateStat('total-real-estate-simulations-detail', totalSimulations);
                    this.updateStat('users-with-real-estate-detail', usersWithSimulations);
                    this.updateStat('avg-real-estate-per-user-detail', avgPerUser);
                }
            }
            
            console.log(`✅ Real estate simulations loaded: ${this.allRealEstateSimulations.length} total`);
            
            // Stats
            const totalSimulations = this.allRealEstateSimulations.length;
            const usersWithSimulations = new Set(this.allRealEstateSimulations.map(s => s.userId)).size;
            const avgPerUser = usersWithSimulations > 0 ? (totalSimulations / usersWithSimulations).toFixed(1) : 0;
            
            this.updateStat('total-real-estate-simulations', totalSimulations);
            this.updateStat('users-with-real-estate', usersWithSimulations);
            this.updateStat('avg-real-estate-per-user', avgPerUser);
            
        } catch (error) {
            console.error('❌ Error loading real estate simulations:', error);
        }
    }

    async loadLoginHistory() {
        try {
            console.log('🔐 Loading login history...');
            
            this.allLoginHistory = [];
            
            for (const user of this.allUsersData) {
                try {
                    const loginSnapshot = await this.db
                        .collection('users')
                        .doc(user.id)
                        .collection('login_history')
                        .orderBy('timestamp', 'desc')
                        .limit(50) // Limiter pour ne pas surcharger
                        .get();
                    
                    loginSnapshot.forEach(doc => {
                        this.allLoginHistory.push({
                            id: doc.id,
                            userId: user.id,
                            userEmail: user.email,
                            ...doc.data()
                        });
                    });
                } catch (e) {
                    this.updateStat('total-logins-detail', totalLogins);
                    this.updateStat('avg-logins-per-user-detail', avgLoginsPerUser);
                    this.updateStat('top-login-method-detail', topMethod ? `${topMethod[0]}` : 'N/A');
                }
            }
            
            console.log(`✅ Login history loaded: ${this.allLoginHistory.length} total logins`);
            
            // Stats
            const totalLogins = this.allLoginHistory.length;
            const uniqueUsers = new Set(this.allLoginHistory.map(l => l.userId)).size;
            const avgLoginsPerUser = uniqueUsers > 0 ? (totalLogins / uniqueUsers).toFixed(1) : 0;
            
            // Méthodes de connexion
            const loginMethods = {};
            this.allLoginHistory.forEach(login => {
                const method = login.method || login.loginMethod || 'unknown';
                loginMethods[method] = (loginMethods[method] || 0) + 1;
            });
            
            const topMethod = Object.entries(loginMethods)
                .sort((a, b) => b[1] - a[1])[0];
            
            this.updateStat('total-logins', totalLogins);
            this.updateStat('avg-logins-per-user', avgLoginsPerUser);
            this.updateStat('top-login-method', topMethod ? `${topMethod[0]} (${topMethod[1]})` : 'N/A');
            
        } catch (error) {
            console.error('❌ Error loading login history:', error);
        }
    }

    async loadConversationsData() {
        try {
            console.log('💬 Loading AI conversations...');
            
            this.allConversations = [];
            let totalMessages = 0;
            
            for (const user of this.allUsersData) {
                try {
                    const conversationsSnapshot = await this.db
                        .collection('users')
                        .doc(user.id)
                        .collection('conversations')
                        .get();
                    
                    conversationsSnapshot.forEach(doc => {
                        const data = doc.data();
                        this.allConversations.push({
                            id: doc.id,
                            userId: user.id,
                            userEmail: user.email,
                            ...data
                        });
                        
                        totalMessages += data.messageCount || (data.messages ? data.messages.length : 0);
                    });
                } catch (e) {
                    this.updateStat('total-conversations-detail', totalConversations);
                    this.updateStat('avg-conversations-per-user-detail', avgConversationsPerUser);
                    this.updateStat('total-ai-messages-detail', totalMessages);
                    this.updateStat('avg-messages-per-conversation-detail', avgMessagesPerConversation);
                }
            }
            
            console.log(`✅ AI conversations loaded: ${this.allConversations.length} conversations`);
            
            // Stats
            const totalConversations = this.allConversations.length;
            const usersWithConversations = new Set(this.allConversations.map(c => c.userId)).size;
            const avgConversationsPerUser = usersWithConversations > 0 ? 
                (totalConversations / usersWithConversations).toFixed(1) : 0;
            const avgMessagesPerConversation = totalConversations > 0 ? 
                (totalMessages / totalConversations).toFixed(1) : 0;
            
            this.updateStat('total-conversations', totalConversations);
            this.updateStat('total-ai-messages', totalMessages);
            this.updateStat('avg-conversations-per-user', avgConversationsPerUser);
            this.updateStat('avg-messages-per-conversation', avgMessagesPerConversation);
            
        } catch (error) {
            console.error('❌ Error loading conversations:', error);
        }
    }

    async loadSocialStats() {
        try {
            console.log('👥 Loading social stats...');
            
            let totalFollowers = 0;
            let totalFollowing = 0;
            let totalPosts = 0;
            let totalComments = 0;
            let totalPoints = 0;
            let totalReputation = 0;
            let totalLikesReceived = 0;
            
            this.allUsersData.forEach(user => {
                totalFollowers += user.followersCount || 0;
                totalFollowing += user.followingCount || 0;
                totalPosts += user.postsCount || user.postCount || 0;
                totalComments += user.commentsCount || 0;
                totalPoints += user.points || 0;
                totalReputation += user.reputation || 0;
                totalLikesReceived += user.likesReceived || 0;
            });
            
            const totalUsers = this.allUsersData.length || 1;
            
            this.updateStat('total-followers', totalFollowers);
            this.updateStat('total-following', totalFollowing);
            this.updateStat('total-posts', totalPosts);
            this.updateStat('total-comments', totalComments);
            this.updateStat('avg-points-per-user', (totalPoints / totalUsers).toFixed(1));
            this.updateStat('avg-reputation-per-user', (totalReputation / totalUsers).toFixed(1));
            this.updateStat('total-likes-received', totalLikesReceived);
            
            console.log(`✅ Social stats loaded`);
            
        } catch (error) {
            console.error('❌ Error loading social stats:', error);
        }
    }

    displaySocialStatsByUser() {
        console.log('📊 Displaying social stats by user...');
        
        const tbody = document.getElementById('social-stats-users-table-body');
        if (!tbody) {
            console.warn('⚠ Social stats users table not found');
            return;
        }
        
        if (this.allUsersData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                        <p style="margin: 0;">No users data</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        
        // Trier par reputation décroissante
        const sortedUsers = [...this.allUsersData]
            .sort((a, b) => (b.reputation || 0) - (a.reputation || 0));
        
        sortedUsers.forEach((user, index) => {
            const followers = user.followersCount || 0;
            const following = user.followingCount || 0;
            const posts = user.postsCount || user.postCount || 0;
            const comments = user.commentsCount || 0;
            const points = user.points || 0;
            const reputation = user.reputation || 0;
            const likes = user.likesReceived || 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${user.email || 'N/A'}</td>
                <td style="text-align: center; font-weight: 600; color: #3b82f6;">${followers}</td>
                <td style="text-align: center; font-weight: 600; color: #8b5cf6;">${following}</td>
                <td style="text-align: center; font-weight: 600; color: #10b981;">${posts}</td>
                <td style="text-align: center; font-weight: 600; color: #f59e0b;">${comments}</td>
                <td style="text-align: center; font-weight: 600; color: #ef4444;">${points}</td>
                <td style="text-align: center; font-weight: 700; color: #667eea;">${reputation}</td>
            `;
            tbody.appendChild(row);
        });
        
        console.log(`✅ Social stats by user table populated (${sortedUsers.length} users)`);
    }

    // 🆕 AFFICHAGE DES NOUVELLES STATISTIQUES

    displayWatchlistsStats() {
        console.log('📊 Displaying watchlists stats...');
        
        // 🔥 MISE À JOUR DES STATS GLOBALES
        const totalWatchlists = this.allWatchlistsData.length;
        const usersWithWatchlists = new Set(this.allWatchlistsData.map(w => w.userId)).size;
        const avgPerUser = usersWithWatchlists > 0 ? (totalWatchlists / usersWithWatchlists).toFixed(1) : 0;
        
        this.updateStat('total-watchlists', totalWatchlists);
        this.updateStat('users-with-watchlists', usersWithWatchlists);
        this.updateStat('avg-watchlists-per-user', avgPerUser);
        this.updateStat('total-watchlists-detail', totalWatchlists);
        
        // 🔥 VÉRIFIER SI AUCUNE DONNÉE
        if (this.allWatchlistsData.length === 0 && this.allPortfoliosData.length === 0) {
            console.warn('⚠ No watchlists or portfolios data available');
            
            const tbody = document.getElementById('top-watchlist-symbols-body');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align: center; padding: 40px; color: #64748b;">
                            <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                            <p style="margin: 0; font-weight: 600;">No Watchlists Data</p>
                            <p style="margin: 8px 0 0 0; font-size: 0.9rem;">Users haven't created watchlists yet.</p>
                        </td>
                    </tr>
                `;
            }
            
            const usersTableBody = document.getElementById('watchlists-users-table-body');
            if (usersTableBody) {
                usersTableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">
                            <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                            <p style="margin: 0;">No data available</p>
                        </td>
                    </tr>
                `;
            }
            return;
        }
        
        // 🔥 TOP SYMBOLES DEPUIS WATCHLISTS + PORTFOLIOS
        const symbolCounts = {};
        
        // Depuis watchlists
        this.allWatchlistsData.forEach(watchlist => {
            let symbols = [];
            
            if (watchlist.symbols && Array.isArray(watchlist.symbols)) {
                symbols = watchlist.symbols;
            } else if (watchlist.watchlist && Array.isArray(watchlist.watchlist)) {
                symbols = watchlist.watchlist;
            } else if (watchlist.symbol) {
                symbols = [watchlist.symbol];
            } else if (watchlist.ticker) {
                symbols = [watchlist.ticker];
            }
            
            symbols.forEach(symbol => {
                if (symbol) {
                    symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
                }
            });
        });
        
        // 🔥 DEPUIS PORTFOLIOS (champ watchlist)
        this.allPortfoliosData.forEach(portfolio => {
            let symbols = [];
            
            // 🔥 PRIORITÉ AU CHAMP "watchlist" (array)
            if (portfolio.watchlist && Array.isArray(portfolio.watchlist)) {
                symbols = portfolio.watchlist;
            } else if (portfolio.symbols && Array.isArray(portfolio.symbols)) {
                symbols = portfolio.symbols;
            }
            
            symbols.forEach(symbol => {
                if (symbol) {
                    symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
                }
            });
        });
        
        const topSymbols = Object.entries(symbolCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        const tbody = document.getElementById('top-watchlist-symbols-body');
        if (tbody) {
            if (topSymbols.length > 0) {
                tbody.innerHTML = '';
                topSymbols.forEach(([symbol, count], index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td style="width: 40px; text-align: center;">${index + 1}</td>
                        <td style="font-weight: 600; color: #1e293b;">${symbol}</td>
                        <td style="width: 100px; text-align: right; font-weight: 600; color: #667eea;">${count}</td>
                    `;
                    tbody.appendChild(row);
                });
                console.log(`✅ Top symbols table populated with ${topSymbols.length} symbols`);
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="3" style="text-align: center; padding: 20px;">
                            No symbols tracked yet
                        </td>
                    </tr>
                `;
            }
        }
        
        // 🔥 TABLEAU DÉTAILLÉ PAR USER
        this.displayWatchlistsByUser();
    }

    displayWatchlistsByUser() {
        console.log('📋 Displaying watchlists by user...');
        
        const tbody = document.getElementById('watchlists-users-table-body');
        if (!tbody) {
            console.warn('⚠ Watchlists users table not found');
            return;
        }
        
        if (this.allWatchlistsData.length === 0 && this.allPortfoliosData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                        <p style="margin: 0;">No watchlists data</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        
        // 🔥 COMBINER WATCHLISTS + PORTFOLIOS PAR USER
        const dataByUser = {};
        
        // Depuis watchlists
        this.allWatchlistsData.forEach(watchlist => {
            const userId = watchlist.userId || 'unknown';
            if (!dataByUser[userId]) {
                dataByUser[userId] = { watchlists: [], portfolios: [], symbols: new Set() };
            }
            dataByUser[userId].watchlists.push(watchlist);
            
            // Extraire symboles
            let symbols = [];
            if (watchlist.symbols && Array.isArray(watchlist.symbols)) {
                symbols = watchlist.symbols;
            } else if (watchlist.watchlist && Array.isArray(watchlist.watchlist)) {
                symbols = watchlist.watchlist;
            } else if (watchlist.symbol) {
                symbols = [watchlist.symbol];
            }
            
            symbols.forEach(s => dataByUser[userId].symbols.add(s));
        });
        
        // 🔥 DEPUIS PORTFOLIOS
        this.allPortfoliosData.forEach(portfolio => {
            const userId = portfolio.userId || 'unknown';
            if (!dataByUser[userId]) {
                dataByUser[userId] = { watchlists: [], portfolios: [], symbols: new Set() };
            }
            dataByUser[userId].portfolios.push(portfolio);
            
            // 🔥 EXTRAIRE DEPUIS LE CHAMP "watchlist"
            let symbols = [];
            if (portfolio.watchlist && Array.isArray(portfolio.watchlist)) {
                symbols = portfolio.watchlist;
            } else if (portfolio.symbols && Array.isArray(portfolio.symbols)) {
                symbols = portfolio.symbols;
            }
            
            symbols.forEach(s => dataByUser[userId].symbols.add(s));
        });
        
        // Afficher une ligne par user
        let index = 0;
        Object.entries(dataByUser).forEach(([userId, data]) => {
            const user = this.allUsersData.find(u => u.id === userId);
            const userEmail = user?.email || 
                            data.watchlists[0]?.userEmail || 
                            data.portfolios[0]?.userEmail || 
                            'N/A';
            
            const totalItems = data.watchlists.length + data.portfolios.length;
            const symbolsList = Array.from(data.symbols).join(', ');
            const displaySymbols = symbolsList.length > 50 ? 
                symbolsList.substring(0, 50) + '...' : 
                symbolsList;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${++index}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${userEmail}</td>
                <td style="text-align: center; font-weight: 600; color: #667eea;">${totalItems}</td>
                <td style="text-align: center; font-weight: 600; color: #10b981;">${data.symbols.size}</td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${symbolsList}">${displaySymbols || 'N/A'}</td>
            `;
            tbody.appendChild(row);
        });
        
        console.log(`✅ Watchlists by user table populated (${index} users)`);
    }

    displayPortfoliosStats() {
        console.log('📊 Displaying portfolios stats...');
        
        // 🔥 CALCULER LES STATS
        const totalPortfolios = this.allPortfoliosData.length;
        const usersWithPortfolios = new Set(this.allPortfoliosData.map(p => p.userId)).size;
        const avgPerUser = usersWithPortfolios > 0 ? (totalPortfolios / usersWithPortfolios).toFixed(1) : 0;
        
        let totalValue = 0;
        this.allPortfoliosData.forEach(portfolio => {
            if (portfolio.totalValue) {
                totalValue += parseFloat(portfolio.totalValue);
            } else if (portfolio.value) {
                totalValue += parseFloat(portfolio.value);
            }
        });
        
        // 🔥 METTRE À JOUR LES STATS
        this.updateStat('total-portfolios', totalPortfolios);
        this.updateStat('users-with-portfolios', usersWithPortfolios);
        this.updateStat('avg-portfolios-per-user', avgPerUser);
        this.updateStat('total-portfolios-detail', totalPortfolios);
        this.updateStat('total-portfolios-value', `$${totalValue.toLocaleString()}`);
        
        console.log(`💼 Portfolios: ${totalPortfolios} total, $${totalValue.toLocaleString()} value`);
        
        // 🔥 TABLEAU DÉTAILLÉ PAR USER
        this.displayPortfoliosByUser();
    }

    displayPortfoliosByUser() {
        console.log('📋 Displaying portfolios by user...');
        
        const tbody = document.getElementById('portfolios-users-table-body');
        if (!tbody) {
            console.warn('⚠ Portfolios users table not found');
            return;
        }
        
        if (this.allPortfoliosData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                        <p style="margin: 0;">No portfolios data</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        
        // Grouper par user
        const portfoliosByUser = {};
        this.allPortfoliosData.forEach(portfolio => {
            const userId = portfolio.userId || 'unknown';
            if (!portfoliosByUser[userId]) {
                portfoliosByUser[userId] = [];
            }
            portfoliosByUser[userId].push(portfolio);
        });
        
        // Afficher une ligne par user
        let index = 0;
        Object.entries(portfoliosByUser).forEach(([userId, portfolios]) => {
            const user = this.allUsersData.find(u => u.id === userId);
            const userEmail = user?.email || portfolios[0]?.userEmail || 'N/A';
            
            // Calculer la valeur totale des portfolios de ce user
            let userTotalValue = 0;
            portfolios.forEach(p => {
                userTotalValue += parseFloat(p.totalValue || p.value || 0);
            });
            
            // Récupérer les noms des portfolios
            const portfolioNames = portfolios
                .map(p => p.name || p.portfolioName || 'Unnamed')
                .join(', ');
            const displayNames = portfolioNames.length > 50 ? 
                portfolioNames.substring(0, 50) + '...' : 
                portfolioNames;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${++index}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${userEmail}</td>
                <td style="text-align: center; font-weight: 600; color: #667eea;">${portfolios.length}</td>
                <td style="text-align: right; font-weight: 600; color: #10b981;">$${userTotalValue.toLocaleString()}</td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${portfolioNames}">${displayNames}</td>
            `;
            tbody.appendChild(row);
        });
        
        console.log(`✅ Portfolios by user table populated (${index} users)`);
    }

    displayNewsletterStats() {
        console.log('📊 Displaying newsletter stats...');
        
        // Compter les abonnés au weekly newsletter
        const weeklyCount = this.allNewsletterSubscribers.filter(sub => sub.weeklyNewsletter).length;
        this.updateStat('weekly-newsletter-count', weeklyCount);
    }

    displayNewsletterSubscribers() {
        console.log('📧 Displaying newsletter subscribers table...');
        
        const tbody = document.getElementById('newsletter-subscribers-table-body');
        if (!tbody) {
            console.warn('⚠ Newsletter subscribers table not found');
            return;
        }
        
        if (this.allNewsletterSubscribers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                        <p style="margin: 0; font-weight: 600;">No Newsletter Subscribers</p>
                        <p style="margin: 8px 0 0 0; font-size: 0.9rem;">No one has subscribed yet.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        
        // Trier par date d'inscription (plus récent en premier)
        const sortedSubscribers = [...this.allNewsletterSubscribers].sort((a, b) => {
            const dateA = a.subscribedAt ? 
                (a.subscribedAt instanceof Date ? a.subscribedAt : 
                a.subscribedAt.toDate ? a.subscribedAt.toDate() : 
                new Date(a.subscribedAt)) : new Date(0);
            const dateB = b.subscribedAt ? 
                (b.subscribedAt instanceof Date ? b.subscribedAt : 
                b.subscribedAt.toDate ? b.subscribedAt.toDate() : 
                new Date(b.subscribedAt)) : new Date(0);
            return dateB - dateA;
        });
        
        sortedSubscribers.forEach((subscriber, index) => {
            const email = subscriber.email || 'N/A';
            
            const subscribedDate = subscriber.subscribedAt ? 
                (subscriber.subscribedAt instanceof Date ? subscriber.subscribedAt : 
                subscriber.subscribedAt.toDate ? subscriber.subscribedAt.toDate() : 
                new Date(subscriber.subscribedAt)).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }) : 'N/A';
            
            const source = subscriber.source || 'Unknown';
            const weeklyNewsletter = subscriber.weeklyNewsletter ? '✅ Yes' : '❌ No';
            
            // Calculer depuis combien de temps
            const daysSinceSubscription = subscriber.subscribedAt ? 
                Math.floor((new Date() - (subscriber.subscribedAt instanceof Date ? subscriber.subscribedAt : 
                        subscriber.subscribedAt.toDate ? subscriber.subscribedAt.toDate() : 
                        new Date(subscriber.subscribedAt))) / (1000 * 60 * 60 * 24)) : 0;
            
            const daysDisplay = daysSinceSubscription === 0 ? 'Today' : 
                            daysSinceSubscription === 1 ? '1 day ago' : 
                            daysSinceSubscription < 30 ? `${daysSinceSubscription} days ago` :
                            daysSinceSubscription < 365 ? `${Math.floor(daysSinceSubscription / 30)} months ago` :
                            `${Math.floor(daysSinceSubscription / 365)} years ago`;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 600;">
                    ${email}
                </td>
                <td>${subscribedDate}</td>
                <td style="color: #64748b;">${daysDisplay}</td>
                <td>
                    <span class="source-badge source-${source.toLowerCase().replace('_', '-')}">
                        ${source}
                    </span>
                </td>
                <td style="text-align: center;">${weeklyNewsletter}</td>
            `;
            tbody.appendChild(row);
        });
        
        console.log(`✅ Newsletter subscribers table populated (${sortedSubscribers.length} subscribers)`);
    }

    displayRealEstateStats() {
        console.log('📊 Displaying real estate stats...');
    
        // 🔥 METTRE À JOUR LES KPI CARDS
        const totalSimulations = this.allRealEstateSimulations?.length || 0;
        const usersWithSimulations = totalSimulations > 0 ? 
            new Set(this.allRealEstateSimulations.map(s => s.userId)).size : 0;
        const avgPerUser = usersWithSimulations > 0 ? 
            (totalSimulations / usersWithSimulations).toFixed(1) : 0;
        
        this.updateStat('total-real-estate-simulations-detail', totalSimulations);
        this.updateStat('users-with-real-estate-detail', usersWithSimulations);
        this.updateStat('avg-real-estate-per-user-detail', avgPerUser);
        
        console.log(`🏠 Real Estate: ${totalSimulations} simulations, ${usersWithSimulations} users`);
        
        const tbody = document.getElementById('real-estate-users-table-body');
        if (!tbody) {
            console.warn('⚠ Real estate users table not found');
            return;
        }
        
        if (!this.allRealEstateSimulations || this.allRealEstateSimulations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                        <p style="margin: 0;">No real estate simulations</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        
        // Grouper par user
        const simulationsByUser = {};
        this.allRealEstateSimulations.forEach(sim => {
            const userId = sim.userId || 'unknown';
            if (!simulationsByUser[userId]) {
                simulationsByUser[userId] = [];
            }
            simulationsByUser[userId].push(sim);
        });
        
        // Afficher une ligne par user
        let index = 0;
        Object.entries(simulationsByUser).forEach(([userId, sims]) => {
            const user = this.allUsersData.find(u => u.id === userId);
            const userEmail = user?.email || sims[0]?.userEmail || 'N/A';
            
            // Récupérer la dernière simulation
            const latestSim = sims.sort((a, b) => {
                const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
                const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
                return dateB - dateA;
            })[0];
            
            const lastSimDate = latestSim.createdAt ? 
                (latestSim.createdAt.toDate ? latestSim.createdAt.toDate() : new Date(latestSim.createdAt)).toLocaleDateString('en-US') : 
                'N/A';
            
            const propertyTypes = [...new Set(sims.map(s => s.propertyType || s.type || 'Unknown'))].join(', ');
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${++index}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${userEmail}</td>
                <td style="text-align: center; font-weight: 600; color: #667eea;">${sims.length}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${propertyTypes}</td>
                <td>${lastSimDate}</td>
            `;
            tbody.appendChild(row);
        });
        
        console.log(`✅ Real estate by user table populated (${index} users)`);
    }

    displayLoginHistoryStats() {
        console.log('📊 Displaying login history stats...');
    
        // 🔥 METTRE À JOUR LES KPI CARDS
        const totalLogins = this.allLoginHistory?.length || 0;
        const uniqueUsers = totalLogins > 0 ? 
            new Set(this.allLoginHistory.map(l => l.userId)).size : 0;
        const avgLoginsPerUser = uniqueUsers > 0 ? 
            (totalLogins / uniqueUsers).toFixed(1) : 0;
        
        // Trouver la méthode la plus utilisée
        const methods = {};
        if (this.allLoginHistory) {
            this.allLoginHistory.forEach(l => {
                const method = l.method || l.loginMethod || 'unknown';
                methods[method] = (methods[method] || 0) + 1;
            });
        }
        
        const topMethod = Object.entries(methods)
            .sort((a, b) => b[1] - a[1])[0];
        
        this.updateStat('total-logins-detail', totalLogins);
        this.updateStat('avg-logins-per-user-detail', avgLoginsPerUser);
        this.updateStat('top-login-method-detail', topMethod ? topMethod[0] : 'N/A');
        
        console.log(`🔐 Login History: ${totalLogins} logins, ${uniqueUsers} users, top method: ${topMethod?.[0]}`);
        
        const tbody = document.getElementById('login-history-users-table-body');
        if (!tbody) {
            console.warn('⚠ Login history users table not found');
            return;
        }
        
        if (!this.allLoginHistory || this.allLoginHistory.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                        <p style="margin: 0;">No login history</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        
        // Grouper par user
        const loginsByUser = {};
        this.allLoginHistory.forEach(login => {
            const userId = login.userId || 'unknown';
            if (!loginsByUser[userId]) {
                loginsByUser[userId] = [];
            }
            loginsByUser[userId].push(login);
        });
        
        // Afficher une ligne par user
        let index = 0;
        Object.entries(loginsByUser).forEach(([userId, logins]) => {
            const user = this.allUsersData.find(u => u.id === userId);
            const userEmail = user?.email || logins[0]?.userEmail || 'N/A';
            
            // Trouver le dernier login
            const latestLogin = logins.sort((a, b) => {
                const dateA = a.timestamp ? (a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp)) : new Date(0);
                const dateB = b.timestamp ? (b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp)) : new Date(0);
                return dateB - dateA;
            })[0];
            
            const lastLoginDate = latestLogin.timestamp ? 
                (latestLogin.timestamp.toDate ? latestLogin.timestamp.toDate() : new Date(latestLogin.timestamp)).toLocaleString('en-US') : 
                'N/A';
            
            // Compter les méthodes
            const methods = {};
            logins.forEach(l => {
                const method = l.method || l.loginMethod || 'unknown';
                methods[method] = (methods[method] || 0) + 1;
            });
            
            const topMethod = Object.entries(methods).sort((a, b) => b[1] - a[1])[0];
            const methodDisplay = topMethod ? `${topMethod[0]} (${topMethod[1]})` : 'N/A';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${++index}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${userEmail}</td>
                <td style="text-align: center; font-weight: 600; color: #667eea;">${logins.length}</td>
                <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${methodDisplay}</td>
                <td>${lastLoginDate}</td>
                <td style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${latestLogin.ip || 'N/A'}</td>
            `;
            tbody.appendChild(row);
        });
        
        console.log(`✅ Login history by user table populated (${index} users)`);
    }

    displayConversationsStats() {
        console.log('📊 Displaying conversations stats...');
    
        // 🔥 METTRE À JOUR LES KPI CARDS
        const totalConversations = this.allConversations?.length || 0;
        const usersWithConversations = totalConversations > 0 ? 
            new Set(this.allConversations.map(c => c.userId)).size : 0;
        const avgConversationsPerUser = usersWithConversations > 0 ? 
            (totalConversations / usersWithConversations).toFixed(1) : 0;
        
        // Calculer total messages
        let totalMessages = 0;
        if (this.allConversations) {
            this.allConversations.forEach(c => {
                totalMessages += c.messageCount || (c.messages ? c.messages.length : 0);
            });
        }
        
        const avgMessagesPerConversation = totalConversations > 0 ? 
            (totalMessages / totalConversations).toFixed(1) : 0;
        
        this.updateStat('total-conversations-detail', totalConversations);
        this.updateStat('avg-conversations-per-user-detail', avgConversationsPerUser);
        this.updateStat('total-ai-messages-detail', totalMessages);
        this.updateStat('avg-messages-per-conversation-detail', avgMessagesPerConversation);
        
        console.log(`💬 Conversations: ${totalConversations} total, ${totalMessages} messages`);
        
        const tbody = document.getElementById('conversations-users-table-body');
        if (!tbody) {
            console.warn('⚠ Conversations users table not found');
            return;
        }
        
        if (!this.allConversations || this.allConversations.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                        <p style="margin: 0;">No AI conversations</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        
        // Grouper par user
        const conversationsByUser = {};
        this.allConversations.forEach(conv => {
            const userId = conv.userId || 'unknown';
            if (!conversationsByUser[userId]) {
                conversationsByUser[userId] = [];
            }
            conversationsByUser[userId].push(conv);
        });
        
        // Afficher une ligne par user
        let index = 0;
        Object.entries(conversationsByUser).forEach(([userId, conversations]) => {
            const user = this.allUsersData.find(u => u.id === userId);
            const userEmail = user?.email || conversations[0]?.userEmail || 'N/A';
            
            // Compter total messages
            let totalMessages = 0;
            conversations.forEach(c => {
                totalMessages += c.messageCount || (c.messages ? c.messages.length : 0);
            });
            
            const avgMessages = conversations.length > 0 ? (totalMessages / conversations.length).toFixed(1) : 0;
            
            // Trouver la dernière conversation
            const latestConv = conversations.sort((a, b) => {
                const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
                const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
                return dateB - dateA;
            })[0];
            
            const lastConvDate = latestConv.createdAt ? 
                (latestConv.createdAt.toDate ? latestConv.createdAt.toDate() : new Date(latestConv.createdAt)).toLocaleDateString('en-US') : 
                'N/A';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${++index}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${userEmail}</td>
                <td style="text-align: center; font-weight: 600; color: #667eea;">${conversations.length}</td>
                <td style="text-align: center; font-weight: 600; color: #10b981;">${totalMessages}</td>
                <td style="text-align: center; color: #64748b;">${avgMessages}</td>
                <td>${lastConvDate}</td>
            `;
            tbody.appendChild(row);
        });
        
        console.log(`✅ Conversations by user table populated (${index} users)`);
    }

    // ========================================
    // SECTION 4: ADVANCED ANALYTICS
    // ========================================

    async loadSessionAnalytics() {
        try {
            console.log('📊 Loading session analytics...');
            
            const sessions = {};
            
            this.allVisitsData.forEach(visit => {
                const sessionId = visit.sessionId || visit.userId || `anon-${visit.ip || Math.random()}`;
                
                if (!sessions[sessionId]) {
                    sessions[sessionId] = {
                        id: sessionId,
                        userId: visit.userId,
                        pages: [],
                        startTime: null,
                        endTime: null,
                        duration: 0,
                        deviceType: this.detectDevice(visit.userAgent),
                        country: visit.country
                    };
                }
                
                sessions[sessionId].pages.push({
                    page: visit.page,
                    timestamp: visit.timestamp ? visit.timestamp.toDate() : null
                });
                
                if (visit.timestamp) {
                    const time = visit.timestamp.toDate();
                    if (!sessions[sessionId].startTime || time < sessions[sessionId].startTime) {
                        sessions[sessionId].startTime = time;
                    }
                    if (!sessions[sessionId].endTime || time > sessions[sessionId].endTime) {
                        sessions[sessionId].endTime = time;
                    }
                }
            });
            
            Object.values(sessions).forEach(session => {
                if (session.startTime && session.endTime) {
                    session.duration = (session.endTime - session.startTime) / 1000;
                }
            });
            
            this.sessionData = Object.values(sessions);
            
            const totalSessions = this.sessionData.length;
            const validSessions = this.sessionData.filter(s => s.duration > 0);
            const avgValidDuration = validSessions.length > 0
                ? validSessions.reduce((sum, s) => sum + s.duration, 0) / validSessions.length
                : 0;
            const avgPagesPerSession = this.sessionData.reduce((sum, s) => sum + s.pages.length, 0) / (totalSessions || 1);
            
            this.updateStat('total-sessions', totalSessions.toLocaleString());
            this.updateStat('avg-session-duration', `${(avgValidDuration / 60).toFixed(1)} min`);
            this.updateStat('avg-pages-per-session', avgPagesPerSession.toFixed(1));
            
            console.log('✅ Session analytics loaded:', totalSessions, 'sessions');
            
        } catch (error) {
            console.error('❌ Session analytics error:', error);
        }
    }

    async loadBounceRateAnalytics() {
        try {
            console.log('📊 Loading bounce rate analytics...');
            
            const pageVisits = {};
            const pageBounces = {};
            
            this.sessionData.forEach(session => {
                const firstPage = session.pages[0]?.page;
                
                if (firstPage) {
                    pageVisits[firstPage] = (pageVisits[firstPage] || 0) + 1;
                    
                    if (session.pages.length === 1) {
                        pageBounces[firstPage] = (pageBounces[firstPage] || 0) + 1;
                    }
                }
            });
            
            this.bounceRateData = {};
            
            Object.keys(pageVisits).forEach(page => {
                const bounces = pageBounces[page] || 0;
                const visits = pageVisits[page];
                this.bounceRateData[page] = {
                    visits: visits,
                    bounces: bounces,
                    bounceRate: ((bounces / visits) * 100).toFixed(1)
                };
            });
            
            const totalVisits = Object.values(pageVisits).reduce((a, b) => a + b, 0);
            const totalBounces = Object.values(pageBounces).reduce((a, b) => a + b, 0);
            const overallBounceRate = totalVisits > 0 ? ((totalBounces / totalVisits) * 100).toFixed(1) : '0';
            
            this.updateStat('overall-bounce-rate', `${overallBounceRate}%`);
            
            console.log('✅ Bounce rate analytics loaded');
            
        } catch (error) {
            console.error('❌ Bounce rate analytics error:', error);
        }
    }

    async loadConversionPaths() {
        try {
            console.log('📊 Loading conversion paths...');
            
            const paths = {};
            
            this.sessionData.forEach(session => {
                if (session.userId && session.pages.length > 0) {
                    const path = session.pages.map(p => p.page).join(' → ');
                    paths[path] = (paths[path] || 0) + 1;
                }
            });
            
            this.conversionPaths = Object.entries(paths)
                .map(([path, count]) => ({ path, count }))
                .sort((a, b) => b.count - a.count);
            
            const uniquePaths = this.conversionPaths.length;
            
            this.updateStat('unique-conversion-paths', uniquePaths);
            
            this.displayConversionPaths(this.conversionPaths.slice(0, 10));
            
            console.log('✅ Conversion paths loaded:', this.conversionPaths.length, 'unique paths');
            
        } catch (error) {
            console.error('❌ Conversion paths error:', error);
        }
    }

    displayConversionPaths(paths) {
        const tbody = document.getElementById('conversion-paths-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        paths.forEach((path, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${path.path}</td>
                <td>${path.count}</td>
            `;
            tbody.appendChild(row);
        });
        
        if (paths.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No conversion paths available</td></tr>';
        }
    }

    async loadHeatmapData() {
        try {
            console.log('🔥 Loading heatmap data...');
            
            const pageClicks = {};
            
            this.allActivityData.forEach(activity => {
                if (activity.action === 'click' && activity.page) {
                    const page = activity.page;
                    if (!pageClicks[page]) {
                        pageClicks[page] = 0;
                    }
                    pageClicks[page]++;
                }
            });
            
            this.heatmapData = pageClicks;
            
            console.log('✅ Heatmap data loaded');
            
        } catch (error) {
            console.error('❌ Heatmap data error:', error);
        }
    }

    detectDevice(userAgent) {
        const ua = (userAgent || '').toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile';
        if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
        return 'Desktop';
    }

    // ========================================
    // SECTION 5: CHARTS
    // ========================================
    
    async loadRegistrationsChart() {
        try {
            console.log('📈 Loading registrations chart...');
            
            const daysCounts = {};
            const today = new Date();
            
            for (let i = 89; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const key = date.toISOString().split('T')[0];
                daysCounts[key] = 0;
            }
            
            this.allUsersData.forEach(user => {
                if (user.createdAt) {
                    const dateKey = user.createdAt.toDate().toISOString().split('T')[0];
                    if (daysCounts.hasOwnProperty(dateKey)) {
                        daysCounts[dateKey]++;
                    }
                }
            });
            
            const labels = Object.keys(daysCounts).map(date => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
            });
            
            const data = Object.values(daysCounts);
            
            this.createChart('registrations-chart', 'line', {
                labels: labels,
                datasets: [{
                    label: 'Daily Registrations',
                    data: data,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                }]
            }, {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading registrations chart:', error);
        }
    }

    async loadPlansChart() {
        try {
            console.log('📈 Loading plans chart...');
            
            const planCounts = { basic: 0, pro: 0, platinum: 0 };
            
            this.allUsersData.forEach(user => {
                const plan = user.plan || 'basic';
                if (planCounts.hasOwnProperty(plan)) {
                    planCounts[plan]++;
                }
            });
            
            this.createChart('plans-chart', 'doughnut', {
                labels: ['Basic (Free)', 'Pro', 'Platinum'],
                datasets: [{
                    data: [planCounts.basic, planCounts.pro, planCounts.platinum],
                    backgroundColor: [
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            }, {
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading plans chart:', error);
        }
    }

    async loadVisitsChart() {
        try {
            console.log('📈 Loading visits chart...');
            
            const daysCounts = {};
            const today = new Date();
            
            for (let i = 89; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const key = date.toISOString().split('T')[0];
                daysCounts[key] = 0;
            }
            
            this.allVisitsData.forEach(visit => {
                if (visit.timestamp) {
                    const dateKey = visit.timestamp.toDate().toISOString().split('T')[0];
                    if (daysCounts.hasOwnProperty(dateKey)) {
                        daysCounts[dateKey]++;
                    }
                }
            });
            
            const labels = Object.keys(daysCounts).map(date => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
            });
            
            const data = Object.values(daysCounts);
            
            this.createChart('visits-chart', 'bar', {
                labels: labels,
                datasets: [{
                    label: 'Daily Visits',
                    data: data,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderRadius: 8
                }]
            }, {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading visits chart:', error);
        }
    }

    async loadRevenueChart() {
        try {
            console.log('📈 Loading revenue chart...');
            
            const monthsRevenue = {};
            
            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthsRevenue[key] = 0;
            }
            
            this.allPaymentsData.forEach(payment => {
                if (payment.createdAt) {
                    const date = payment.createdAt.toDate();
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (monthsRevenue.hasOwnProperty(key)) {
                        monthsRevenue[key] += parseFloat(payment.amount) || 0;
                    }
                }
            });
            
            const labels = Object.keys(monthsRevenue).map(key => {
                const [year, month] = key.split('-');
                return `${month}/${year.slice(2)}`;
            });
            
            const data = Object.values(monthsRevenue);
            
            this.createChart('revenue-chart', 'bar', {
                labels: labels,
                datasets: [{
                    label: 'Monthly Revenue ($)',
                    data: data,
                    backgroundColor: 'rgba(67, 233, 123, 0.8)',
                    borderRadius: 8
                }]
            }, {
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading revenue chart:', error);
        }
    }

    async loadChurnChart() {
        try {
            console.log('📈 Loading churn chart...');
            
            const monthlyData = {};
            
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthlyData[key] = { new: 0, churned: 0 };
            }
            
            this.allUsersData.forEach(user => {
                if (user.createdAt) {
                    const date = user.createdAt.toDate();
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (monthlyData[key]) monthlyData[key].new++;
                }
                
                if (user.canceledAt) {
                    const date = user.canceledAt.toDate();
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (monthlyData[key]) monthlyData[key].churned++;
                }
            });
            
            const labels = Object.keys(monthlyData).map(key => {
                const [year, month] = key.split('-');
                return `${month}/${year.slice(2)}`;
            });
            
            this.createChart('churn-chart', 'line', {
                labels: labels,
                datasets: [
                    {
                        label: 'New Users',
                        data: Object.values(monthlyData).map(d => d.new),
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 3
                    },
                    {
                        label: 'Churned Users',
                        data: Object.values(monthlyData).map(d => d.churned),
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 3
                    }
                ]
            });
            
        } catch (error) {
            console.error('❌ Error loading churn chart:', error);
        }
    }

    async loadCohortChart() {
        try {
            console.log('📈 Loading cohort chart...');
            
            const canvas = document.getElementById('cohort-chart');
            if (!canvas) {
                console.warn('⚠ Cohort chart canvas not found');
                return;
            }
            
            const cohorts = {};
            
            this.allUsersData.forEach(user => {
                if (user.createdAt) {
                    const cohortMonth = user.createdAt.toDate().toISOString().slice(0, 7);
                    
                    if (!cohorts[cohortMonth]) {
                        cohorts[cohortMonth] = { total: 0, active: 0, premium: 0 };
                    }
                    
                    cohorts[cohortMonth].total++;
                    
                    if (user.plan && user.plan !== 'basic' && user.plan !== 'free') {
                        cohorts[cohortMonth].premium++;
                    }
                    
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    
                    if (user.lastLogin && user.lastLogin.toDate() > weekAgo) {
                        cohorts[cohortMonth].active++;
                    }
                }
            });
            
            const sortedCohorts = Object.keys(cohorts).sort().slice(-12);
            
            const labels = sortedCohorts.map(key => {
                const [year, month] = key.split('-');
                return `${month}/${year.slice(2)}`;
            });
            
            this.createChart('cohort-chart', 'bar', {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Users',
                        data: sortedCohorts.map(key => cohorts[key].total),
                        backgroundColor: 'rgba(99, 102, 241, 0.6)'
                    },
                    {
                        label: 'Active Users',
                        data: sortedCohorts.map(key => cohorts[key].active),
                        backgroundColor: 'rgba(16, 185, 129, 0.6)'
                    },
                    {
                        label: 'Premium Users',
                        data: sortedCohorts.map(key => cohorts[key].premium),
                        backgroundColor: 'rgba(139, 92, 246, 0.6)'
                    }
                ]
            }, {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading cohort chart:', error);
        }
    }

    createStripeChart(data) {
        if (!data || !data.subscriptions) return;
        
        const canvas = document.getElementById('stripe-subscriptions-chart');
        if (!canvas) {
            console.warn('⚠ Stripe chart canvas not found');
            return;
        }
        
        console.log('📊 Creating Stripe subscriptions chart...');
        
        this.createChart('stripe-subscriptions-chart', 'doughnut', {
            labels: ['Active', 'Trialing', 'Canceled', 'Past Due'],
            datasets: [{
                data: [
                    data.subscriptions.active || 0,
                    data.subscriptions.trialing || 0,
                    data.subscriptions.canceled || 0,
                    data.subscriptions.past_due || 0
                ],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        }, {
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Stripe Subscriptions Status'
                }
            }
        });
        
        console.log('✅ Stripe chart created');
    }

    createCloudflareCharts(data) {
        if (!data || !data.overview) return;
        
        // Graphique 1 : Requests Over Time
        const requestsCanvas = document.getElementById('cf-requests-chart');
        if (requestsCanvas && data.overview.requestsByDate) {
            console.log('📊 Creating Cloudflare requests chart...');
            
            const dates = Object.keys(data.overview.requestsByDate).sort();
            const requests = dates.map(date => data.overview.requestsByDate[date]);
            
            this.createChart('cf-requests-chart', 'line', {
                labels: dates.map(d => {
                    const date = new Date(d);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                }),
                datasets: [{
                    label: 'Daily Requests',
                    data: requests,
                    borderColor: 'rgb(249, 115, 22)',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                }]
            }, {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Cloudflare Requests Over Time'
                    }
                }
            });
            
            console.log('✅ Cloudflare requests chart created');
        }
        
        // Graphique 2 : Geo Distribution
        const geoCanvas = document.getElementById('cf-geo-chart');
        if (geoCanvas && this.cloudflareGeo && this.cloudflareGeo.length > 0) {
            console.log('📊 Creating Cloudflare geo chart...');
            
            const topCountries = this.cloudflareGeo.slice(0, 6);
            
            this.createChart('cf-geo-chart', 'bar', {
                labels: topCountries.map(c => c.country),
                datasets: [{
                    label: 'Requests by Country',
                    data: topCountries.map(c => c.requests),
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderRadius: 8
                }]
            }, {
                indexAxis: 'y',
                plugins: {
                    title: {
                        display: true,
                        text: 'Top Countries by Requests'
                    }
                }
            });
            
            console.log('✅ Cloudflare geo chart created');
        }
        
        // Graphique 3 : Device Distribution
        const deviceCanvas = document.getElementById('cf-devices-chart');
        if (deviceCanvas && this.cloudflareDevices && this.cloudflareDevices.devices) {
            console.log('📊 Creating Cloudflare devices chart...');
            
            this.createChart('cf-devices-chart', 'pie', {
                labels: this.cloudflareDevices.devices.map(d => d.type),
                datasets: [{
                    data: this.cloudflareDevices.devices.map(d => d.requests),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            }, {
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Requests by Device Type'
                    }
                }
            });
            
            console.log('✅ Cloudflare devices chart created');
        }
    }

    // ========================================
    // SECTION 6: TABLES
    // ========================================
    
    async loadRecentUsers() {
        try {
            console.log('📋 Loading recent users...');
            
            const tbody = document.getElementById('recent-users-body');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            const sortedUsers = this.allUsersData
                .filter(u => u.createdAt)
                .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
                .slice(0, 10);
            
            sortedUsers.forEach(user => {
                const row = document.createElement('tr');
                
                const createdAt = user.createdAt.toDate().toLocaleDateString('en-US');
                const plan = user.plan || 'basic';
                
                row.innerHTML = `
                    <td>${user.email || 'N/A'}</td>
                    <td><span class="plan-badge plan-${plan}">${plan}</span></td>
                    <td>${createdAt}</td>
                    <td>${user.subscriptionStatus || 'inactive'}</td>
                `;
                
                tbody.appendChild(row);
            });
            
            if (sortedUsers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No users available</td></tr>';
            }
            
        } catch (error) {
            console.error('❌ Error loading recent users:', error);
        }
    }

    async loadRecentActivity() {
        try {
            console.log('📋 Loading recent activity (real connection data)...');
            
            const tbody = document.getElementById('recent-activity-body');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            if (this.allVisitsData.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 40px; color: #64748b;">
                            <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                            <p style="margin: 0;">No visit data available</p>
                        </td>
                    </tr>
                `;
                console.log('⚠ No visits data available');
                return;
            }
            
            const recentVisits = this.allVisitsData
                .filter(v => v.timestamp)
                .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate())
                .slice(0, 20);
            
            console.log(`📊 Displaying ${recentVisits.length} recent visits`);
            
            recentVisits.forEach(visit => {
                const row = document.createElement('tr');
                
                let userDisplay = 'Anonymous';
                if (visit.userId) {
                    const user = this.allUsersData.find(u => u.id === visit.userId);
                    userDisplay = user?.email ? user.email.substring(0, 20) + '...' : visit.userId.substring(0, 8) + '...';
                } else if (visit.ip) {
                    userDisplay = `IP: ${visit.ip}`;
                }
                
                const action = visit.page ? 'Page View' : 'Visit';
                
                let page = visit.page || visit.url || 'N/A';
                if (page.includes('.html')) {
                    page = page.replace('.html', '').replace(/\//g, '');
                }
                if (page.length > 30) {
                    page = page.substring(0, 30) + '...';
                }
                
                const timestamp = visit.timestamp.toDate().toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                row.innerHTML = `
                    <td style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${userDisplay}</td>
                    <td><span class="action-badge">${action}</span></td>
                    <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${page}</td>
                    <td>${timestamp}</td>
                `;
                
                tbody.appendChild(row);
            });
            
            console.log('✅ Recent activity table loaded with real visits data');
            
        } catch (error) {
            console.error('❌ Error loading recent activity:', error);
        }
    }

    async loadTopUsers() {
        try {
            console.log('📋 Loading top users...');
            
            const usersData = [];
            
            for (const user of this.allUsersData) {
                const simulationsSnapshot = await this.db
                    .collection('users')
                    .doc(user.id)
                    .collection('simulations')
                    .get();
                
                usersData.push({
                    email: user.email,
                    plan: user.plan || 'basic',
                    simulations: simulationsSnapshot.size
                });
            }
            
            usersData.sort((a, b) => b.simulations - a.simulations);
            
            const tbody = document.getElementById('top-users-body');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            usersData.slice(0, 10).forEach((user, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${user.email}</td>
                    <td><span class="plan-badge plan-${user.plan}">${user.plan}</span></td>
                    <td>${user.simulations}</td>
                `;
                tbody.appendChild(row);
            });
            
            if (usersData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No users available</td></tr>';
            }
            
        } catch (error) {
            console.error('❌ Error loading top users:', error);
        }
    }

    async loadUserSimulations() {
        try {
            console.log('📋 Loading user simulations...');
            
            let totalSimulations = 0;
            
            for (const user of this.allUsersData) {
                const simsSnapshot = await this.db
                    .collection('users')
                    .doc(user.id)
                    .collection('simulations')
                    .get();
                
                totalSimulations += simsSnapshot.size;
            }
            
            const avgSimulations = this.allUsersData.length > 0
                ? (totalSimulations / this.allUsersData.length).toFixed(1)
                : '0';
            
            this.updateStat('total-simulations', totalSimulations.toLocaleString());
            this.updateStat('avg-simulations', avgSimulations);
            
        } catch (error) {
            console.error('❌ Error loading simulations:', error);
        }
    }

    async loadConversionFunnel() {
        try {
            console.log('📋 Loading conversion funnel...');
            
            let registered = this.allUsersData.length;
            let emailVerified = 0;
            let firstLogin = 0;
            let trialStarted = 0;
            let converted = this.allPaymentsData.length;
            
            this.allUsersData.forEach(user => {
                if (user.emailVerified) emailVerified++;
                if (user.lastLogin) firstLogin++;
                if (user.trialEnds) trialStarted++;
            });
            
            const tbody = document.getElementById('funnel-body');
            if (!tbody) return;
            
            tbody.innerHTML = `
                <tr>
                    <td>Registrations</td>
                    <td>${registered}</td>
                    <td>100%</td>
                </tr>
                <tr>
                    <td>Email Verified</td>
                    <td>${emailVerified}</td>
                    <td>${registered > 0 ? ((emailVerified / registered) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                    <td>First Login</td>
                    <td>${firstLogin}</td>
                    <td>${registered > 0 ? ((firstLogin / registered) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                    <td>Trial Started</td>
                    <td>${trialStarted}</td>
                    <td>${registered > 0 ? ((trialStarted / registered) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr class="conversion-row">
                    <td><strong>Paid Conversion</strong></td>
                    <td><strong>${converted}</strong></td>
                    <td><strong>${registered > 0 ? ((converted / registered) * 100).toFixed(1) : 0}%</strong></td>
                </tr>
            `;
            
        } catch (error) {
            console.error('❌ Error loading funnel:', error);
        }
    }

    async loadLTVAnalysis() {
        try {
            console.log('📋 Loading LTV analysis...');
            
            const userPayments = {};
            
            this.allPaymentsData.forEach(payment => {
                const userId = payment.userId || 'unknown';
                const amount = parseFloat(payment.amount) || 0;
                userPayments[userId] = (userPayments[userId] || 0) + amount;
            });
            
            const ltvValues = Object.values(userPayments);
            const avgLTV = ltvValues.length > 0
                ? (ltvValues.reduce((a, b) => a + b, 0) / ltvValues.length).toFixed(2)
                : '0';
            
            const maxLTV = ltvValues.length > 0 ? Math.max(...ltvValues).toFixed(2) : '0';
            
            this.updateStat('avg-ltv', `$${avgLTV}`);
            this.updateStat('max-ltv', `$${maxLTV}`);
            
        } catch (error) {
            console.error('❌ Error loading LTV:', error);
        }
    }

    // ========================================
    // SECTION 7: ML PREDICTIONS
    // ========================================
    
    async loadMLPredictions() {
        try {
            console.log('🤖 Generating ML predictions...');
            
            const churnPrediction = await this.predictChurn();
            const ltvPrediction = await this.predictLTV();
            const mrrPrediction = await this.predictMRR();
            
            const container = document.getElementById('ml-predictions');
            if (container) {
                container.innerHTML = `
                    <div class="prediction-card">
                        <div class="prediction-icon">📉</div>
                        <div class="prediction-content">
                            <h3>Predicted Churn (30 days)</h3>
                            <div class="prediction-value ${churnPrediction.risk > 5 ? 'danger' : 'success'}">
                                ${churnPrediction.value} users
                            </div>
                            <div class="prediction-detail">
                                Rate: ${churnPrediction.risk.toFixed(1)}%
                                ${churnPrediction.risk > 5 ? '⚠ High risk' : '✅ Normal'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="prediction-card">
                        <div class="prediction-icon">💰</div>
                        <div class="prediction-content">
                            <h3>Projected Avg LTV</h3>
                            <div class="prediction-value success">
                                $${ltvPrediction.toFixed(2)}
                            </div>
                            <div class="prediction-detail">
                                Per premium user
                            </div>
                        </div>
                    </div>
                    
                    <div class="prediction-card">
                        <div class="prediction-icon">📈</div>
                        <div class="prediction-content">
                            <h3>Predicted MRR (3 months)</h3>
                            <div class="prediction-value success">
                                $${mrrPrediction.toFixed(0)}
                            </div>
                            <div class="prediction-detail">
                                Trend: ${mrrPrediction > (this.currentMRR || 0) ? '↗ Growth' : '↘ Decline'}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            console.log('✅ ML predictions generated');
            
        } catch (error) {
            console.error('❌ Error generating ML predictions:', error);
        }
    }

    async predictChurn() {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let inactiveUsers = 0;
        let totalPremiumUsers = 0;
        
        this.allUsersData.forEach(user => {
            if (user.plan && user.plan !== 'basic' && user.plan !== 'free') {
                totalPremiumUsers++;
                
                if (!user.lastLogin || user.lastLogin.toDate() < thirtyDaysAgo) {
                    inactiveUsers++;
                }
            }
        });
        
        const churnRate = totalPremiumUsers > 0 ? (inactiveUsers / totalPremiumUsers) * 100 : 0;
        
        return {
            value: inactiveUsers,
            risk: churnRate
        };
    }

    async predictLTV() {
        const userPayments = {};
        let totalRevenue = 0;
        let totalUsers = 0;
        
        this.allPaymentsData.forEach(payment => {
            const userId = payment.userId || 'unknown';
            const amount = parseFloat(payment.amount) || 0;
            
            if (!userPayments[userId]) {
                userPayments[userId] = 0;
                totalUsers++;
            }
            
            userPayments[userId] += amount;
            totalRevenue += amount;
        });
        
        const currentLTV = totalUsers > 0 ? totalRevenue / totalUsers : 0;
        const projectedLTV = currentLTV * 1.15;
        
        return projectedLTV;
    }

    async predictMRR() {
        const monthlyRevenue = {};
        
        this.allPaymentsData.forEach(payment => {
            if (payment.createdAt) {
                const monthKey = payment.createdAt.toDate().toISOString().slice(0, 7);
                monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (parseFloat(payment.amount) || 0);
            }
        });
        
        const months = Object.keys(monthlyRevenue).sort();
        const revenues = months.map(m => monthlyRevenue[m]);
        
        if (revenues.length < 2) {
            return this.currentMRR || 0;
        }
        
        const n = revenues.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = revenues.reduce((a, b) => a + b, 0);
        const sumXY = revenues.reduce((sum, y, x) => sum + x * y, 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const futureMonth = n + 3;
        const predictedMRR = slope * futureMonth + intercept;
        
        return Math.max(predictedMRR, 0);
    }

    // ========================================
    // SECTION 8: USERS MANAGEMENT
    // ========================================
    
    async loadUsersDetailedData() {
        try {
            console.log('👥 Loading detailed users data...');
            
            this.allUsersDetailedData = [];
            
            for (const user of this.allUsersData) {
                const simulationsSnapshot = await this.db
                    .collection('users')
                    .doc(user.id)
                    .collection('simulations')
                    .get();
                
                const userVisits = this.allVisitsData.filter(v => v.userId === user.id).length;
                const userActivities = this.allActivityData.filter(a => a.userId === user.id).length;
                
                const apiRequestsSnapshot = await this.db
                    .collection('users')
                    .doc(user.id)
                    .collection('api_requests')
                    .get();
                
                const userDoc = await this.db.collection('users').doc(user.id).get();
                const userData = userDoc.data();
                
                this.allUsersDetailedData.push({
                    id: user.id,
                    email: user.email || 'N/A',
                    displayName: user.displayName || user.name || 'N/A',
                    plan: user.plan || 'basic',
                    subscriptionStatus: user.subscriptionStatus || 'inactive',
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                    emailVerified: user.emailVerified || false,
                    simulations: simulationsSnapshot.size,
                    visits: userVisits,
                    activities: userActivities,
                    apiRequests: apiRequestsSnapshot.size,
                    isBanned: userData?.isBanned || false,
                    bannedAt: userData?.bannedAt || null,
                    bannedReason: userData?.bannedReason || null,
                    photoURL: user.photoURL || null,
                    country: user.country || 'Unknown'
                });
            }
            
            console.log(`✅ Detailed data loaded for ${this.allUsersDetailedData.length} users`);
            
        } catch (error) {
            console.error('❌ Error loading detailed users data:', error);
        }
    }

    async loadUsersManagementTable() {
        try {
            console.log('📋 Loading users management table with pagination...');
            
            const tbody = document.getElementById('users-management-body');
            if (!tbody) {
                console.warn('⚠ Users management table not found');
                return;
            }
            
            const sortedUsers = this.allUsersDetailedData
                .sort((a, b) => {
                    if (!a.createdAt) return 1;
                    if (!b.createdAt) return -1;
                    return b.createdAt.toDate() - a.createdAt.toDate();
                });
            
            if (sortedUsers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="12" style="text-align: center;">No users available</td></tr>';
                return;
            }
            
            const renderUserRow = (user, index, tbody) => {
                const row = document.createElement('tr');
                
                if (user.isBanned) {
                    row.style.backgroundColor = '#fee2e2';
                    row.style.opacity = '0.7';
                }
                
                const createdAt = user.createdAt ? user.createdAt.toDate().toLocaleDateString('en-US') : 'N/A';
                const lastLogin = user.lastLogin ? user.lastLogin.toDate().toLocaleDateString('en-US') : 'Never';
                
                const planBadge = `<span class="plan-badge plan-${user.plan}">${user.plan.toUpperCase()}</span>`;
                
                let statusBadge = '';
                if (user.isBanned) {
                    statusBadge = '<span class="status-badge status-banned">🚫 BANNED</span>';
                } else if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') {
                    statusBadge = '<span class="status-badge status-active">✅ Active</span>';
                } else {
                    statusBadge = '<span class="status-badge status-inactive">❌ Inactive</span>';
                }
                
                const actionButton = user.isBanned
                    ? `<button class="btn-action btn-unban" onclick="adminAnalytics.unbanUser('${user.id}')">
                        <i class="fas fa-unlock"></i> Unban
                    </button>`
                    : `<button class="btn-action btn-ban" onclick="adminAnalytics.banUser('${user.id}')">
                        <i class="fas fa-ban"></i> Ban
                    </button>`;
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>
                        <div class="user-info">
                            ${user.photoURL ? `<img src="${user.photoURL}" alt="Avatar" class="user-avatar-small">` : ''}
                            <div>
                                <div class="user-email">${user.email}</div>
                                ${user.displayName !== 'N/A' ? `<div class="user-name">${user.displayName}</div>` : ''}
                            </div>
                        </div>
                    </td>
                    <td>${planBadge}</td>
                    <td>${statusBadge}</td>
                    <td>${createdAt}</td>
                    <td>${lastLogin}</td>
                    <td>${user.simulations}</td>
                    <td>${user.visits}</td>
                    <td>${user.activities}</td>
                    <td>${user.apiRequests}</td>
                    <td>${user.country}</td>
                    <td>${actionButton}</td>
                `;
                
                tbody.appendChild(row);
            };
            
            if (!window.paginationManagers['users-management-body']) {
                window.paginationManagers['users-management-body'] = new PaginationManager(
                    'users-management-body',
                    sortedUsers,
                    renderUserRow,
                    [10, 25, 50, 100]
                );
            } else {
                window.paginationManagers['users-management-body'].updateData(sortedUsers);
            }
            
            window.paginationManagers['users-management-body'].render();
            
            this.updateUsersManagementStats();
            
            console.log(`✅ Users management table loaded with pagination (${sortedUsers.length} users)`);
            
        } catch (error) {
            console.error('❌ Error loading users management table:', error);
        }
    }

    updateUsersManagementStats() {
        const totalUsers = this.allUsersDetailedData.length;
        const bannedUsers = this.allUsersDetailedData.filter(u => u.isBanned).length;
        const activeUsers = this.allUsersDetailedData.filter(u => !u.isBanned && (u.subscriptionStatus === 'active' || u.subscriptionStatus === 'trialing')).length;
        const premiumUsers = this.allUsersDetailedData.filter(u => u.plan !== 'basic' && u.plan !== 'free').length;
        
        this.updateStat('total-users-mgmt', totalUsers);
        this.updateStat('banned-users-mgmt', bannedUsers);
        this.updateStat('active-users-mgmt', activeUsers);
        this.updateStat('premium-users-mgmt', premiumUsers);
    }

    async banUser(userId) {
        try {
            console.log(`🚫 Attempting to ban user: ${userId}`);
            
            if (!this.auth.currentUser || this.auth.currentUser.email !== ADMIN_EMAIL) {
                alert('❌ Erreur : Accès admin refusé');
                return;
            }
            
            const reason = prompt('Raison du bannissement (optionnel):');
            
            if (reason === null) {
                console.log('❌ Ban canceled by user');
                return;
            }
            
            const confirmBan = confirm(
                `⚠ BANNIR CET UTILISATEUR ?\n\n` +
                `Cette action va :\n` +
                `✓ Bloquer son accès au site\n` +
                `✓ Annuler son abonnement actif\n` +
                `✓ Être enregistrée dans les logs admin\n\n` +
                `Raison : ${reason || 'Aucune raison fournie'}\n\n` +
                `Confirmer le bannissement ?`
            );
            
            if (!confirmBan) {
                console.log('❌ Ban canceled by confirmation');
                return;
            }
            
            console.log(`🔄 Banning user ${userId}...`);
            
            await this.db.collection('users').doc(userId).update({
                isBanned: true,
                bannedAt: firebase.firestore.FieldValue.serverTimestamp(),
                bannedReason: reason || 'No reason provided',
                subscriptionStatus: 'banned',
                bannedBy: ADMIN_EMAIL
            });
            
            console.log('✅ User document updated');
            
            await this.db.collection('admin_actions').add({
                action: 'ban_user',
                userId: userId,
                adminEmail: ADMIN_EMAIL,
                reason: reason || 'No reason provided',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ Admin action logged');
            
            alert('✅ Utilisateur banni avec succès !');
            
            console.log('🔄 Reloading user data...');
            await this.loadUsersDetailedData();
            await this.loadUsersManagementTable();
            
            console.log('✅ User ban complete');
            
        } catch (error) {
            console.error('❌ Error banning user:', error);
            
            let errorMessage = '⚠ Erreur lors du bannissement :\n\n';
            
            if (error.code === 'permission-denied') {
                errorMessage += '🔒 Permissions insuffisantes.\n\n';
                errorMessage += 'Solutions :\n';
                errorMessage += '1. Vérifiez que vous êtes connecté en tant qu\'admin\n';
                errorMessage += '2. Vérifiez les règles Firestore\n';
                errorMessage += '3. Actualisez la page et réessayez';
            } else {
                errorMessage += error.message;
            }
            
            alert(errorMessage);
        }
    }

    async unbanUser(userId) {
        try {
            console.log(`✅ Attempting to unban user: ${userId}`);
            
            if (!this.auth.currentUser || this.auth.currentUser.email !== ADMIN_EMAIL) {
                alert('❌ Erreur : Accès admin refusé');
                return;
            }
            
            const confirmUnban = confirm(
                `✅ DÉBANNIR CET UTILISATEUR ?\n\n` +
                `Cette action va :\n` +
                `✓ Restaurer son accès au site\n` +
                `✓ Réinitialiser son statut à "inactive"\n` +
                `✓ Être enregistrée dans les logs admin\n\n` +
                `Confirmer le débannissement ?`
            );
            
            if (!confirmUnban) {
                console.log('❌ Unban canceled');
                return;
            }
            
            console.log(`🔄 Unbanning user ${userId}...`);
            
            await this.db.collection('users').doc(userId).update({
                isBanned: false,
                bannedAt: null,
                bannedReason: null,
                subscriptionStatus: 'inactive',
                unbannedBy: ADMIN_EMAIL,
                unbannedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ User document updated');
            
            await this.db.collection('admin_actions').add({
                action: 'unban_user',
                userId: userId,
                adminEmail: ADMIN_EMAIL,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ Admin action logged');
            
            alert('✅ Utilisateur débanni avec succès !');
            
            console.log('🔄 Reloading user data...');
            await this.loadUsersDetailedData();
            await this.loadUsersManagementTable();
            
            console.log('✅ User unban complete');
            
        } catch (error) {
            console.error('❌ Error unbanning user:', error);
            
            let errorMessage = '⚠ Erreur lors du débannissement :\n\n';
            
            if (error.code === 'permission-denied') {
                errorMessage += '🔒 Permissions insuffisantes.\n\n';
                errorMessage += 'Vérifiez les règles Firestore.';
            } else {
                errorMessage += error.message;
            }
            
            alert(errorMessage);
        }
    }

    // ========================================
    // SECTION 9: NON-CUSTOMER VISITORS & POTENTIAL
    // ========================================
    
    async loadNonCustomerVisitors() {
        try {
            console.log('👥 Loading non-customer visitors...');
            
            const customerIds = new Set();
            this.allUsersData.forEach(user => customerIds.add(user.id));
            
            const anonymousVisitors = {};
            let totalAnonymousVisits = 0;
            
            this.allVisitsData.forEach(visit => {
                const isNonCustomer = !visit.userId || !customerIds.has(visit.userId);
                
                if (isNonCustomer) {
                    totalAnonymousVisits++;
                    
                    const visitorId = visit.sessionId || visit.ip || `anon-${Math.random()}`;
                    
                    if (!anonymousVisitors[visitorId]) {
                        anonymousVisitors[visitorId] = {
                            id: visitorId,
                            ip: visit.ip || 'N/A',
                            country: visit.country || 'Unknown',
                            firstVisit: visit.timestamp ? visit.timestamp.toDate() : null,
                            lastVisit: visit.timestamp ? visit.timestamp.toDate() : null,
                            visits: 0,
                            pages: [],
                            devices: new Set(),
                            sources: new Set()
                        };
                    }
                    
                    const visitor = anonymousVisitors[visitorId];
                    visitor.visits++;
                    
                    if (visit.page) visitor.pages.push(visit.page);
                    if (visit.userAgent) visitor.devices.add(this.detectDevice(visit.userAgent));
                    if (visit.referrer) visitor.sources.add(visit.referrer);
                    
                    if (visit.timestamp) {
                        const visitDate = visit.timestamp.toDate();
                        if (!visitor.firstVisit || visitDate < visitor.firstVisit) {
                            visitor.firstVisit = visitDate;
                        }
                        if (!visitor.lastVisit || visitDate > visitor.lastVisit) {
                            visitor.lastVisit = visitDate;
                        }
                    }
                }
            });
            
            Object.values(anonymousVisitors).forEach(visitor => {
                visitor.devices = Array.from(visitor.devices);
                visitor.sources = Array.from(visitor.sources);
            });
            
            this.nonCustomerVisitors = Object.values(anonymousVisitors);
            
            console.log(`✅ ${this.nonCustomerVisitors.length} non-customer visitors detected`);
            
            this.updateStat('total-non-customers', this.nonCustomerVisitors.length);
            this.updateStat('total-anonymous-visits', totalAnonymousVisits);
            
            this.displayNonCustomerVisitors();
            
        } catch (error) {
            console.error('❌ Error loading non-customer visitors:', error);
        }
    }

    displayNonCustomerVisitors() {
        const tbody = document.getElementById('non-customer-visitors-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const sortedVisitors = this.nonCustomerVisitors
            .sort((a, b) => b.visits - a.visits)
            .slice(0, 50);
        
        sortedVisitors.forEach((visitor, index) => {
            const row = document.createElement('tr');
            
            const lastVisit = visitor.lastVisit ? visitor.lastVisit.toLocaleDateString('en-US') : 'N/A';
            const pagesVisited = visitor.pages ? new Set(visitor.pages).size : 0;
            const devices = visitor.devices ? visitor.devices.join(', ') : 'N/A';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${visitor.ip}</td>
                <td>${visitor.country}</td>
                <td>${visitor.visits}</td>
                <td>${pagesVisited}</td>
                <td>${devices}</td>
                <td>${lastVisit}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        if (sortedVisitors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No non-customer visitors</td></tr>';
        }
    }

    async loadPotentialCustomers() {
        try {
            console.log('🎯 Analyzing potential customers...');
            
            this.potentialCustomers = this.nonCustomerVisitors.map(visitor => {
                let score = 0;
                
                score += Math.min(visitor.visits * 3, 30);
                
                const uniquePages = visitor.pages ? new Set(visitor.pages).size : 0;
                score += Math.min(uniquePages * 5, 25);
                
                if (visitor.lastVisit) {
                    const daysSinceLastVisit = (new Date() - visitor.lastVisit) / (1000 * 60 * 60 * 24);
                    if (daysSinceLastVisit < 1) score += 20;
                    else if (daysSinceLastVisit < 7) score += 15;
                    else if (daysSinceLastVisit < 30) score += 10;
                }
                
                const strategicPages = ['pricing', 'plans', 'dashboard', 'signup', 'register'];
                const visitedStrategic = visitor.pages ? visitor.pages.filter(page =>
                    strategicPages.some(sp => page.toLowerCase().includes(sp))
                ).length : 0;
                score += Math.min(visitedStrategic * 5, 15);
                
                const deviceCount = visitor.devices ? visitor.devices.length : 0;
                score += Math.min(deviceCount * 5, 10);
                
                let category = 'Low';
                if (score >= 70) category = 'Hot Lead 🔥';
                else if (score >= 50) category = 'Warm Lead 🌡';
                else if (score >= 30) category = 'Cold Lead ❄';
                
                return {
                    ...visitor,
                    score: Math.min(score, 100),
                    category: category,
                    uniquePages: uniquePages,
                    strategicPages: visitedStrategic
                };
            });
            
            this.potentialCustomers.sort((a, b) => b.score - a.score);
            
            console.log(`✅ ${this.potentialCustomers.length} potential customers analyzed`);
            
            const hotLeads = this.potentialCustomers.filter(c => c.category.includes('Hot')).length;
            const warmLeads = this.potentialCustomers.filter(c => c.category.includes('Warm')).length;
            const coldLeads = this.potentialCustomers.filter(c => c.category.includes('Cold')).length;
            
            this.updateStat('hot-leads', hotLeads);
            this.updateStat('warm-leads', warmLeads);
            this.updateStat('cold-leads', coldLeads);
            
            this.displayPotentialCustomers();
            
        } catch (error) {
            console.error('❌ Error loading potential customers:', error);
        }
    }

    displayPotentialCustomers() {
        console.log('📊 Displaying potential customers with pagination...');
        
        const tbody = document.getElementById('potential-customers-body');
        if (!tbody) return;
        
        if (this.potentialCustomers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No potential customers detected</td></tr>';
            return;
        }
        
        const renderLeadRow = (lead, index, tbody) => {
            const row = document.createElement('tr');
            
            const lastVisit = lead.lastVisit ? lead.lastVisit.toLocaleDateString('en-US') : 'N/A';
            
            let scoreColor = '#ef4444';
            if (lead.score >= 70) scoreColor = '#10b981';
            else if (lead.score >= 50) scoreColor = '#f59e0b';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${lead.ip}</td>
                <td>${lead.country}</td>
                <td>${lead.visits}</td>
                <td>${lead.uniquePages}</td>
                <td>${lead.strategicPages}</td>
                <td style="font-weight: bold; color: ${scoreColor};">${lead.score}</td>
                <td>${lead.category}</td>
                <td>${lastVisit}</td>
            `;
            
            tbody.appendChild(row);
        };
        
        if (!window.paginationManagers['potential-customers-body']) {
            window.paginationManagers['potential-customers-body'] = new PaginationManager(
                'potential-customers-body',
                this.potentialCustomers,
                renderLeadRow,
                [10, 25, 50, 100]
            );
        } else {
            window.paginationManagers['potential-customers-body'].updateData(this.potentialCustomers);
        }
        
        window.paginationManagers['potential-customers-body'].render();
        
        console.log(`✅ Potential customers displayed with pagination (${this.potentialCustomers.length} leads)`);
    }

    createLeadsCharts() {
        const scoreCanvas = document.getElementById('potential-customers-chart');
        if (scoreCanvas && this.potentialCustomers && this.potentialCustomers.length > 0) {
            console.log('📊 Creating lead score distribution chart...');
            
            const hotLeads = this.potentialCustomers.filter(c => c.category.includes('Hot')).length;
            const warmLeads = this.potentialCustomers.filter(c => c.category.includes('Warm')).length;
            const coldLeads = this.potentialCustomers.filter(c => c.category.includes('Cold')).length;
            
            this.createChart('potential-customers-chart', 'doughnut', {
                labels: ['🔥 Hot Leads', '🌡 Warm Leads', '❄ Cold Leads'],
                datasets: [{
                    data: [hotLeads, warmLeads, coldLeads],
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(6, 182, 212, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            }, {
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Lead Categories Distribution'
                    }
                }
            });
            
            console.log('✅ Lead score chart created');
        }
        
        const countryCanvas = document.getElementById('non-customer-countries-chart');
        if (countryCanvas && this.nonCustomerVisitors && this.nonCustomerVisitors.length > 0) {
            console.log('📊 Creating non-customers by country chart...');
            
            const countryVisits = {};
            this.nonCustomerVisitors.forEach(visitor => {
                const country = visitor.country || 'Unknown';
                countryVisits[country] = (countryVisits[country] || 0) + visitor.visits;
            });
            
            const topCountries = Object.entries(countryVisits)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6);
            
            this.createChart('non-customer-countries-chart', 'bar', {
                labels: topCountries.map(c => c[0]),
                datasets: [{
                    label: 'Visits by Non-Customers',
                    data: topCountries.map(c => c[1]),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderRadius: 8
                }]
            }, {
                indexAxis: 'y',
                plugins: {
                    title: {
                        display: true,
                        text: 'Top Countries (Non-Customers)'
                    }
                }
            });
            
            console.log('✅ Non-customers country chart created');
        }
        
        if (this.potentialCustomers && this.potentialCustomers.length > 0) {
            const avgScore = this.potentialCustomers.reduce((sum, c) => sum + c.score, 0) / this.potentialCustomers.length;
            this.updateStat('avg-lead-score', avgScore.toFixed(1));
        }
    }

    // ========================================
    // SECTION 10: ALERTS SYSTEM
    // ========================================
    
    async checkAlerts() {
        try {
            console.log('🔔 Checking alerts...');
            
            const alerts = [];
            
            const mrrAlert = await this.checkMRRDrop();
            if (mrrAlert) alerts.push(mrrAlert);
            
            const churnAlert = await this.checkHighChurn();
            if (churnAlert) alerts.push(churnAlert);
            
            const activeUsersAlert = await this.checkLowActiveUsers();
            if (activeUsersAlert) alerts.push(activeUsersAlert);
            
            const conversionAlert = await this.checkConversionDrop();
            if (conversionAlert) alerts.push(conversionAlert);
            
            if (alerts.length > 0) {
                console.log(`⚠ ${alerts.length} alert(s) detected:`, alerts);
            } else {
                console.log('✅ No alerts - all metrics are healthy');
            }
            
        } catch (error) {
            console.error('❌ Error checking alerts:', error);
        }
    }

    async checkMRRDrop() {
        if (!this.allPaymentsData || this.allPaymentsData.length === 0) return null;
        
        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
        const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
        
        let currentMRR = 0;
        let lastMonthMRR = 0;
        
        const planPrices = { basic: 0, pro: 29.99, platinum: 99.99 };
        
        this.allPaymentsData.forEach(payment => {
            const price = planPrices[payment.plan] || 0;
            
            if (payment.createdAt) {
                const month = payment.createdAt.toDate().toISOString().slice(0, 7);
                if (month === thisMonth) currentMRR += price;
                if (month === lastMonth) lastMonthMRR += price;
            }
        });
        
        if (lastMonthMRR > 0) {
            const dropPercent = ((lastMonthMRR - currentMRR) / lastMonthMRR) * 100;
            
            if (dropPercent > this.alertThresholds.mrrDropPercent) {
                return {
                    type: 'MRR_DROP',
                    severity: 'high',
                    message: `MRR dropped by ${dropPercent.toFixed(1)}% (from $${lastMonthMRR.toFixed(0)} to $${currentMRR.toFixed(0)})`,
                    data: {
                        currentMRR: currentMRR.toFixed(2),
                        lastMonthMRR: lastMonthMRR.toFixed(2),
                        dropPercent: dropPercent.toFixed(1)
                    }
                };
            }
        }
        
        return null;
    }

    async checkHighChurn() {
        const churnPrediction = await this.predictChurn();
        
        if (churnPrediction.risk > this.alertThresholds.churnRatePercent) {
            return {
                type: 'HIGH_CHURN',
                severity: 'medium',
                message: `High churn rate detected: ${churnPrediction.risk.toFixed(1)}% (${churnPrediction.value} inactive users)`,
                data: {
                    churnRate: churnPrediction.risk.toFixed(1),
                    affectedUsers: churnPrediction.value
                }
            };
        }
        
        return null;
    }

    async checkLowActiveUsers() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        let activeUsers = 0;
        
        this.allUsersData.forEach(user => {
            if (user.lastLogin && user.lastLogin.toDate() > weekAgo) {
                activeUsers++;
            }
        });
        
        if (activeUsers < this.alertThresholds.lowActiveUsers) {
            return {
                type: 'LOW_ACTIVE_USERS',
                severity: 'medium',
                message: `Only ${activeUsers} active users this week (threshold: ${this.alertThresholds.lowActiveUsers})`,
                data: {
                    activeUsers: activeUsers,
                    threshold: this.alertThresholds.lowActiveUsers
                }
            };
        }
        
        return null;
    }

    async checkConversionDrop() {
        const totalUsers = this.allUsersData.length;
        const premiumUsers = this.allPaymentsData.length;
        
        const currentConversion = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;
        
        const lastConversion = parseFloat(localStorage.getItem('lastConversionRate') || currentConversion);
        
        const drop = lastConversion - currentConversion;
        
        localStorage.setItem('lastConversionRate', currentConversion.toString());
        
        if (drop > this.alertThresholds.conversionDrop) {
            return {
                type: 'CONVERSION_DROP',
                severity: 'high',
                message: `Conversion rate dropped by ${drop.toFixed(1)}% (from ${lastConversion.toFixed(1)}% to ${currentConversion.toFixed(1)}%)`,
                data: {
                    currentConversion: currentConversion.toFixed(1),
                    lastConversion: lastConversion.toFixed(1),
                    drop: drop.toFixed(1)
                }
            };
        }
        
        return null;
    }

    async sendAlertEmail(alerts) {
        try {
            console.log('📧 Sending alert email...');
            
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - skipping alert email');
                return;
            }
            
            this.cache.incrementCallCount();
            
            const response = await fetch(`${WORKER_URL}/send-alert-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: ADMIN_EMAIL,
                    alerts: alerts,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Alert email response:', result);
            } else {
                console.warn('⚠ Error sending alert email');
            }
            
        } catch (error) {
            console.error('❌ Error sending alert email:', error);
        }
    }

    // ========================================
    // SECTION 11: CSV EXPORT
    // ========================================
    
    async exportAllData() {
        console.log('📥 Exporting all data to CSV...');
        
        await Promise.all([
            this.exportData('users'),
            this.exportData('visits'),
            this.exportData('payments'),
            this.exportData('activity'),
            this.exportData('non-customers'),
            this.exportData('potential-customers'),
            this.exportData('sessions'),
            this.exportData('conversion-paths'),
            this.exportData('watchlists'),
            this.exportData('portfolios'),
            this.exportData('newsletter')
        ]);
        
        alert('✅ All data has been exported to CSV files!');
    }

    async exportData(type) {
        try {
            console.log(`📥 Exporting ${type} to CSV...`);
            
            let data = [];
            let filename = '';
            let headers = [];
            
            switch(type) {
                case 'users':
                    data = this.allUsersDetailedData;
                    filename = 'users_detailed';
                    headers = ['ID', 'Email', 'Display Name', 'Plan', 'Status', 'Created At', 'Last Login', 'Simulations', 'Visits', 'Activities', 'API Requests', 'Country', 'Banned'];
                    data = data.map(u => [
                        u.id,
                        u.email,
                        u.displayName,
                        u.plan,
                        u.subscriptionStatus,
                        u.createdAt ? u.createdAt.toDate().toISOString() : 'N/A',
                        u.lastLogin ? u.lastLogin.toDate().toISOString() : 'N/A',
                        u.simulations,
                        u.visits,
                        u.activities,
                        u.apiRequests,
                        u.country,
                        u.isBanned ? 'Yes' : 'No'
                    ]);
                    break;
                
                case 'visits':
                    data = this.allVisitsData;
                    filename = 'visits';
                    headers = ['ID', 'User ID', 'Page', 'URL', 'Timestamp', 'Country', 'Device', 'User Agent'];
                    data = data.map(v => [
                        v.id,
                        v.userId || 'Anonymous',
                        v.page || 'N/A',
                        v.url || 'N/A',
                        v.timestamp ? v.timestamp.toDate().toISOString() : 'N/A',
                        v.country || 'Unknown',
                        this.detectDevice(v.userAgent),
                        v.userAgent || 'N/A'
                    ]);
                    break;
                
                case 'payments':
                case 'revenue':
                    data = this.allPaymentsData;
                    filename = 'payments';
                    headers = ['ID', 'User ID', 'Plan', 'Amount', 'Status', 'Created At', 'Invoice Number'];
                    data = data.map(p => [
                        p.id,
                        p.userId || 'N/A',
                        p.plan || 'N/A',
                        p.amount || 0,
                        p.status || 'N/A',
                        p.createdAt ? p.createdAt.toDate().toISOString() : 'N/A',
                        p.invoiceNumber || 'N/A'
                    ]);
                    break;
                
                case 'activity':
                    data = this.allActivityData;
                    filename = 'activity';
                    headers = ['ID', 'User ID', 'Action', 'Page', 'Timestamp', 'Details'];
                    data = data.map(a => [
                        a.id,
                        a.userId || 'Anonymous',
                        a.action || 'N/A',
                        a.page || 'N/A',
                        a.timestamp ? a.timestamp.toDate().toISOString() : 'N/A',
                        a.details || 'N/A'
                    ]);
                    break;
                
                case 'non-customers':
                    data = this.nonCustomerVisitors;
                    filename = 'non_customer_visitors';
                    headers = ['ID', 'IP', 'Country', 'Visits', 'Unique Pages', 'Devices', 'First Visit', 'Last Visit'];
                    data = data.map(v => [
                        v.id,
                        v.ip,
                        v.country,
                        v.visits,
                        v.pages ? new Set(v.pages).size : 0,
                        v.devices ? v.devices.join('; ') : '',
                        v.firstVisit ? v.firstVisit.toISOString() : 'N/A',
                        v.lastVisit ? v.lastVisit.toISOString() : 'N/A'
                    ]);
                    break;
                
                case 'potential-customers':
                    data = this.potentialCustomers;
                    filename = 'potential_customers';
                    headers = ['IP', 'Country', 'Visits', 'Unique Pages', 'Strategic Pages', 'Score', 'Category', 'Last Visit'];
                    data = data.map(c => [
                        c.ip,
                        c.country,
                        c.visits,
                        c.uniquePages,
                        c.strategicPages,
                        c.score,
                        c.category,
                        c.lastVisit ? c.lastVisit.toISOString() : 'N/A'
                    ]);
                    break;
                
                case 'sessions':
                    data = this.sessionData;
                    filename = 'sessions';
                    headers = ['Session ID', 'User ID', 'Pages Count', 'Duration (seconds)', 'Device', 'Country', 'Start Time', 'End Time'];
                    data = data.map(s => [
                        s.id,
                        s.userId || 'Anonymous',
                        s.pages.length,
                        s.duration,
                        s.deviceType,
                        s.country,
                        s.startTime ? s.startTime.toISOString() : 'N/A',
                        s.endTime ? s.endTime.toISOString() : 'N/A'
                    ]);
                    break;
                
                case 'conversion-paths':
                    data = this.conversionPaths;
                    filename = 'conversion_paths';
                    headers = ['Path', 'Count'];
                    data = data.map(p => [
                        p.path,
                        p.count
                    ]);
                    break;
                
                case 'watchlists':
                    data = this.allWatchlistsData;
                    filename = 'watchlists';
                    headers = ['ID', 'User ID', 'User Email', 'Symbols', 'Created At', 'Source'];
                    data = data.map(w => [
                        w.id,
                        w.userId || 'N/A',
                        w.userEmail || 'N/A',
                        w.symbols ? w.symbols.join('; ') : '',
                        w.createdAt ? (w.createdAt.toDate ? w.createdAt.toDate().toISOString() : w.createdAt) : 'N/A',
                        w.source || 'N/A'
                    ]);
                    break;
                
                case 'portfolios':
                    data = this.allPortfoliosData;
                    filename = 'portfolios';
                    headers = ['ID', 'User ID', 'User Email', 'Name', 'Total Value', 'Created At', 'Source'];
                    data = data.map(p => [
                        p.id,
                        p.userId || 'N/A',
                        p.userEmail || 'N/A',
                        p.name || 'N/A',
                        p.totalValue || 0,
                        p.createdAt ? (p.createdAt.toDate ? p.createdAt.toDate().toISOString() : p.createdAt) : 'N/A',
                        p.source || 'N/A'
                    ]);
                    break;
                
                case 'newsletter':
                    data = this.allNewsletterSubscribers;
                    filename = 'newsletter_subscribers';
                    headers = ['ID', 'Email', 'Subscribed At', 'Source'];
                    data = data.map(n => [
                        n.id,
                        n.email || 'N/A',
                        n.subscribedAt ? (n.subscribedAt.toDate ? n.subscribedAt.toDate().toISOString() : n.subscribedAt) : 'N/A',
                        n.source || 'N/A'
                    ]);
                    break;
                
                case 'cloudflare':
                    if (!this.cloudflareData || !this.cloudflareData.overview) {
                        alert('⚠ No Cloudflare data available to export.');
                        console.warn('⚠ No Cloudflare data to export');
                        return;
                    }
                    filename = 'cloudflare_analytics';
                    headers = ['Metric', 'Value'];
                    const overview = this.cloudflareData.overview;
                    data = [
                        ['Total Requests', overview.totalRequests || 0],
                        ['Total Bytes', overview.totalBytes || 0],
                        ['Cached Requests', overview.totalCachedRequests || 0],
                        ['Cache Hit Rate', (overview.cacheHitRate || 0) + '%'],
                        ['Total Pageviews', overview.totalPageViews || 0],
                        ['Total Uniques', overview.totalUniques || 0],
                        ['Total Threats', overview.totalThreats || 0]
                    ];
                    break;
                
                case 'stripe':
                    if (!this.stripeData) {
                        alert('⚠ No Stripe data available to export.');
                        console.warn('⚠ No Stripe data to export');
                        return;
                    }
                    filename = 'stripe_analytics';
                    headers = ['Metric', 'Value'];
                    data = [
                        ['Total Customers', this.stripeData.customers?.total || 0],
                        ['Customers with Subscription', this.stripeData.customers?.withSubscription || 0],
                        ['Active Subscriptions', this.stripeData.subscriptions?.active || 0],
                        ['Trialing Subscriptions', this.stripeData.subscriptions?.trialing || 0],
                        ['Canceled Subscriptions', this.stripeData.subscriptions?.canceled || 0],
                        ['MRR (cents)', this.stripeData.revenue?.mrr || 0],
                        ['ARR (cents)', this.stripeData.revenue?.arr || 0],
                        ['Total Revenue (cents)', this.stripeData.revenue?.total || 0]
                    ];
                    break;
                
                default:
                    console.warn('⚠ Unknown export type:', type);
                    alert(`⚠ Export type "${type}" is not supported.`);
                    return;
            }
            
            if (data.length === 0) {
                console.warn(`⚠ No data to export for ${type}`);
                alert(`⚠ No data available to export for "${type}".`);
                return;
            }
            
            const csvContent = this.arrayToCSV(data, headers);
            this.downloadCSV(csvContent, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            
            console.log(`✅ Export ${type} successful (${data.length} rows)`);
            
        } catch (error) {
            console.error(`❌ Error exporting ${type}:`, error);
            alert(`❌ Error exporting ${type}: ${error.message}`);
        }
    }

    arrayToCSV(data, headers) {
        let csv = headers.join(',') + '\n';
        
        data.forEach(row => {
            csv += row.map(cell => {
                const cellStr = String(cell || '');
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return `"${cellStr.replace(/"/g, '""')}"`;
                }
                return cellStr;
            }).join(',') + '\n';
        });
        
        return csv;
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // ========================================
    // SECTION 12: HELPER FUNCTIONS
    // ========================================
    
    updateStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    createChart(canvasId, type, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`⚠ Canvas not found: ${canvasId}`);
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        this.charts[canvasId] = new Chart(ctx, {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: type === 'doughnut' || type === 'pie',
                        position: 'bottom'
                    },
                    tooltip: {
                        enabled: true
                    }
                },
                ...options
            }
        });
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    // ========================================
    // 📧 GMAIL MANAGEMENT - SECTION COMPLÈTE CORRIGÉE
    // Version: 4.2.0 - Full Gmail Integration with Profile Pictures
    // ========================================

    async loadGmailStats() {
        try {
            console.log('📧 Loading Gmail stats...');
            
            const cacheKey = 'gmail-stats';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                this.gmailStats = cachedData;
                this.displayGmailStats(cachedData);
                return;
            }
            
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - skipping Gmail stats');
                return;
            }
            
            this.cache.incrementCallCount();
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-stats`);
            
            if (!response.ok) {
                throw new Error(`Gmail API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            this.cache.set(cacheKey, data.stats);
            this.gmailStats = data.stats;
            this.displayGmailStats(data.stats);
            
            console.log('✅ Gmail stats loaded from API');
            
        } catch (error) {
            console.error('❌ Error loading Gmail stats:', error);
        }
    }

    displayGmailStats(stats) {
        console.log('📧 Displaying Gmail stats:', stats);
        
        if (!stats) {
            console.warn('⚠ No Gmail stats to display');
            return;
        }
        
        this.updateStat('gmail-total-emails', stats.total || 0);
        this.updateStat('gmail-unread-emails', stats.unread || 0);
        this.updateStat('gmail-spam-emails', stats.spam || 0);
        this.updateStat('gmail-sent-emails', stats.sent || 0);
        this.updateStat('gmail-unread-rate', `${stats.unreadRate || 0}%`);
        this.updateStat('gmail-avg-response-time', `${stats.avgResponseTime || 0}h`);
        
        console.log('✅ Gmail stats displayed');
    }

    async loadGmailInbox() {
        try {
            console.log('📥 Loading Gmail inbox...');
            
            const cacheKey = 'gmail-inbox';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                this.gmailInbox = cachedData;
                this.displayGmailInbox(cachedData);
                return;
            }
            
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - using cached Gmail inbox');
                return;
            }
            
            this.cache.incrementCallCount();
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-inbox?maxResults=30`);
            
            if (!response.ok) {
                throw new Error(`Gmail inbox error: ${response.status}`);
            }
            
            const data = await response.json();
            
            this.cache.set(cacheKey, data.messages);
            this.gmailInbox = data.messages;
            this.displayGmailInbox(data.messages);
            
            console.log('✅ Gmail inbox loaded from API');
            
        } catch (error) {
            console.error('❌ Error loading Gmail inbox:', error);
        }
    }

    displayGmailInbox(messages) {
        const tbody = document.getElementById('gmail-inbox-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!messages || messages.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                        <p style="margin: 0;">No emails available</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        const renderEmailRow = (email, index, tbody) => {
            const row = document.createElement('tr');
            
            row.style.cursor = 'pointer';
            row.onclick = () => {
                this.viewEmail(email.id);
            };
            
            if (email.isUnread) {
                row.style.fontWeight = '600';
                row.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
            }
            
            row.onmouseenter = () => {
                row.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
            };
            row.onmouseleave = () => {
                if (email.isUnread) {
                    row.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
                } else {
                    row.style.backgroundColor = '';
                }
            };
            
            const categoryBadge = this.getEmailCategoryBadge(email.category);
            const date = new Date(email.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${email.isUnread ? '<i class="fas fa-circle" style="font-size: 6px; color: #3b82f6; margin-right: 8px;"></i>' : ''}
                    ${email.from}
                </td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${email.subject}
                </td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #64748b;">
                    ${email.snippet}
                </td>
                <td>${categoryBadge}</td>
                <td>${date}</td>
                <td onclick="event.stopPropagation()">
                    <button class="btn-action btn-sm" onclick="adminAnalytics.openReplyModal('${email.id}')" title="Reply">
                        <i class="fas fa-reply"></i>
                    </button>
                    <button class="btn-action btn-sm" onclick="adminAnalytics.openForwardModal('${email.id}')" title="Forward">
                        <i class="fas fa-share"></i>
                    </button>
                    <button class="btn-action btn-sm" onclick="adminAnalytics.markEmailAsRead('${email.id}')" title="Mark as read">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-action btn-sm" onclick="adminAnalytics.archiveEmail('${email.id}')" title="Archive">
                        <i class="fas fa-archive"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        };
        
        if (!window.paginationManagers) window.paginationManagers = {};
        
        if (!window.paginationManagers['gmail-inbox-body']) {
            window.paginationManagers['gmail-inbox-body'] = new PaginationManager(
                'gmail-inbox-body',
                messages,
                renderEmailRow,
                [10, 25, 50]
            );
        } else {
            window.paginationManagers['gmail-inbox-body'].updateData(messages);
        }
        
        window.paginationManagers['gmail-inbox-body'].render();
        
        console.log(`✅ Gmail inbox displayed (${messages.length} emails)`);
    }

    // 🆕 LOAD SENT EMAILS
    async loadSentEmails() {
        try {
            console.log('📤 Loading sent emails...');
            
            const cacheKey = 'gmail-sent';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                this.gmailSent = cachedData;
                this.displaySentEmails(cachedData);
                return;
            }
            
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - using cached sent emails');
                return;
            }
            
            this.cache.incrementCallCount();
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-sent?maxResults=30`);
            
            if (!response.ok) {
                throw new Error(`Gmail sent emails error: ${response.status}`);
            }
            
            const data = await response.json();
            
            this.cache.set(cacheKey, data.messages);
            this.gmailSent = data.messages;
            this.displaySentEmails(data.messages);
            
            console.log('✅ Sent emails loaded from API');
            
        } catch (error) {
            console.error('❌ Error loading sent emails:', error);
        }
    }

    // 🆕 DISPLAY SENT EMAILS
    displaySentEmails(messages) {
        const tbody = document.getElementById('gmail-sent-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (!messages || messages.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-paper-plane" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                        <p style="margin: 0;">No sent emails</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        const renderSentRow = (email, index, tbody) => {
            const row = document.createElement('tr');
            
            row.style.cursor = 'pointer';
            row.onclick = () => {
                this.viewEmail(email.id);
            };
            
            row.onmouseenter = () => {
                row.style.backgroundColor = 'rgba(16, 185, 129, 0.05)';
            };
            row.onmouseleave = () => {
                row.style.backgroundColor = '';
            };
            
            const date = new Date(email.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <i class="fas fa-paper-plane" style="font-size: 10px; color: #10b981; margin-right: 8px;"></i>
                    ${email.to}
                </td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${email.subject}
                </td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #64748b;">
                    ${email.snippet || ''}
                </td>
                <td>${date}</td>
                <td onclick="event.stopPropagation()">
                    <button class="btn-action btn-sm" onclick="adminAnalytics.viewEmail('${email.id}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-sm" onclick="adminAnalytics.openForwardModal('${email.id}')" title="Forward">
                        <i class="fas fa-share"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        };
        
        if (!window.paginationManagers) window.paginationManagers = {};
        
        if (!window.paginationManagers['gmail-sent-body']) {
            window.paginationManagers['gmail-sent-body'] = new PaginationManager(
                'gmail-sent-body',
                messages,
                renderSentRow,
                [10, 25, 50]
            );
        } else {
            window.paginationManagers['gmail-sent-body'].updateData(messages);
        }
        
        window.paginationManagers['gmail-sent-body'].render();
        
        console.log(`✅ Sent emails displayed (${messages.length} emails)`);
    }

    getEmailCategoryBadge(category) {
        const badges = {
            support: '<span class="status-badge" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">📧 Support</span>',
            feedback: '<span class="status-badge" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">💬 Feedback</span>',
            commercial: '<span class="status-badge" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">💰 Commercial</span>',
            notification: '<span class="status-badge" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">🔔 Notification</span>',
            spam: '<span class="status-badge" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">⚠ Spam</span>',
            other: '<span class="status-badge" style="background: linear-gradient(135deg, #64748b, #475569); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 700;">📁 Other</span>'
        };
        
        return badges[category] || badges.other;
    }

    async markEmailAsRead(messageId) {
        try {
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'markAsRead',
                    messageId: messageId
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to mark email as read');
            }
            
            alert('✅ Email marked as read!');
            await this.loadGmailInbox();
            await this.loadGmailStats();
            
        } catch (error) {
            console.error('❌ Error marking email as read:', error);
            alert('⚠ Error: ' + error.message);
        }
    }

    async archiveEmail(messageId) {
        try {
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'archive',
                    messageId: messageId
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to archive email');
            }
            
            alert('✅ Email archived!');
            await this.loadGmailInbox();
            await this.loadGmailStats();
            
        } catch (error) {
            console.error('❌ Error archiving email:', error);
            alert('⚠ Error: ' + error.message);
        }
    }

    // ========================================
    // 📨 COMPOSE, REPLY, FORWARD - AVEC INJECTION PHOTOS
    // ========================================

    openComposeModal() {
        console.log('✉ Opening compose modal...');
        
        const modal = document.getElementById('compose-email-modal');
        if (!modal) {
            console.error('❌ Compose modal not found');
            return;
        }
        
        document.getElementById('compose-from').value = 'raphael.nardone@alphavault-ai.com';
        document.getElementById('compose-to').value = '';
        document.getElementById('compose-cc').value = '';
        document.getElementById('compose-bcc').value = '';
        document.getElementById('compose-subject').value = '';
        
        if (!this.composeEditor) {
            this.composeEditor = new Quill('#compose-body-editor', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                    ]
                },
                placeholder: 'Write your message here...'
            });
        } else {
            this.composeEditor.setText('');
        }
        
        this.injectSignature('compose');
        
        this.attachments = [];
        this.updateAttachmentsList('compose');
        
        this.startAutoSaveDraft('compose');
        
        modal.style.display = 'flex';
        
        console.log('✅ Compose modal opened');
    }

    closeComposeModal() {
        const modal = document.getElementById('compose-email-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        if (this.autoSaveDraftTimer) {
            clearInterval(this.autoSaveDraftTimer);
        }
        
        console.log('✅ Compose modal closed');
    }

    // 🆕 SEND EMAIL AVEC INJECTION PHOTO DE PROFIL
    async sendEmail() {
        try {
            console.log('📤 Sending email...');
            
            const from = document.getElementById('compose-from').value.trim();
            const to = document.getElementById('compose-to').value.trim();
            const cc = document.getElementById('compose-cc').value.trim();
            const bcc = document.getElementById('compose-bcc').value.trim();
            const subject = document.getElementById('compose-subject').value.trim();
            
            if (!to || !subject) {
                alert('⚠ Please fill in recipient and subject fields.');
                return;
            }
            
            let bodyHtml = this.composeEditor.root.innerHTML;
            const bodyText = this.composeEditor.getText();
            
            // 🆕 INJECTION DE LA SIGNATURE AVEC PHOTO
            const signature = this.generateSignatureWithPicture(from);
            
            if (signature) {
                // Vérifier si une signature existe déjà
                if (!bodyHtml.includes('border-top: 2px solid #667eea')) {
                    bodyHtml += signature;
                }
            }
            
            console.log('✅ Signature with photo injected for:', from);
            
            const sendBtn = document.getElementById('send-email-btn');
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: from,
                    to: to,
                    cc: cc || undefined,
                    bcc: bcc || undefined,
                    subject: subject,
                    bodyHtml: bodyHtml,
                    bodyText: bodyText,
                    attachments: this.attachments
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send email');
            }
            
            const result = await response.json();
            
            console.log('✅ Email sent:', result);
            alert(`✅ Email sent successfully from ${from}!`);
            
            this.closeComposeModal();
            
            await this.loadGmailInbox();
            await this.loadGmailStats();
            await this.loadSentEmails();
            
        } catch (error) {
            console.error('❌ Error sending email:', error);
            alert('⚠ Error sending email: ' + error.message);
        } finally {
            const sendBtn = document.getElementById('send-email-btn');
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send';
        }
    }

    async openReplyModal(messageId, replyAll = false) {
        try {
            console.log(`↩ Opening reply modal (messageId: ${messageId}, replyAll: ${replyAll})...`);
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-message?id=${messageId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch message details');
            }
            
            const result = await response.json();
            const message = result.message;
            
            this.currentEmail = message;
            
            const modal = document.getElementById('reply-email-modal');
            if (!modal) {
                console.error('❌ Reply modal not found');
                return;
            }
            
            document.getElementById('reply-from').value = 'raphael.nardone@alphavault-ai.com';
            document.getElementById('reply-to').value = message.from;
            document.getElementById('reply-cc').value = replyAll ? (message.cc || '') : '';
            document.getElementById('reply-subject').value = `Re: ${message.subject.replace(/^Re:\s*/i, '')}`;
            
            if (!this.replyEditor) {
                this.replyEditor = new Quill('#reply-body-editor', {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['link'],
                            ['clean']
                        ]
                    },
                    placeholder: 'Write your reply...'
                });
            } else {
                this.replyEditor.setText('');
            }
            
            this.injectSignature('reply');
            
            const quotedMessage = `
                <br><br>
                <blockquote style="border-left: 3px solid #667eea; padding-left: 12px; margin: 12px 0; color: #64748b;">
                    <p><strong>On ${new Date(message.timestamp).toLocaleString()}, ${message.from} wrote:</strong></p>
                    ${message.bodyHtml || message.bodyText || ''}
                </blockquote>
            `;
            this.replyEditor.clipboard.dangerouslyPasteHTML(this.replyEditor.getLength(), quotedMessage);
            
            modal.style.display = 'flex';
            
            console.log('✅ Reply modal opened');
            
        } catch (error) {
            console.error('❌ Error opening reply modal:', error);
            alert('⚠ Error loading email details: ' + error.message);
        }
    }

    closeReplyModal() {
        const modal = document.getElementById('reply-email-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentEmail = null;
    }

    // 🆕 SEND REPLY AVEC INJECTION PHOTO DE PROFIL
    async sendReply(replyAll = false) {
        try {
            console.log(`📤 Sending reply (replyAll: ${replyAll})...`);
            
            if (!this.currentEmail) {
                alert('⚠ Original email not found.');
                return;
            }
            
            const from = document.getElementById('reply-from')?.value || 'raphael.nardone@alphavault-ai.com';
            
            let bodyHtml = this.replyEditor.root.innerHTML;
            const bodyText = this.replyEditor.getText();
            
            // 🆕 INJECTION DE LA SIGNATURE AVEC PHOTO
            const signature = this.generateSignatureWithPicture(from);
            
            if (signature) {
                // Extraire uniquement le contenu de la réponse (avant le quoted message)
                const quotedStart = bodyHtml.indexOf('<blockquote');
                if (quotedStart > -1) {
                    const replyContent = bodyHtml.substring(0, quotedStart);
                    const quotedContent = bodyHtml.substring(quotedStart);
                    bodyHtml = replyContent + signature + '<br>' + quotedContent;
                } else {
                    bodyHtml += signature;
                }
            }
            
            const sendBtn = document.getElementById('send-reply-btn');
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messageId: this.currentEmail.id,
                    originalMessageId: this.currentEmail.messageId,
                    from: from,
                    to: this.currentEmail.from,
                    subject: this.currentEmail.subject,
                    threadId: this.currentEmail.threadId,
                    replyAll: replyAll,
                    bodyHtml: bodyHtml,
                    bodyText: bodyText
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send reply');
            }
            
            const result = await response.json();
            
            console.log('✅ Reply sent:', result);
            alert('✅ Reply sent successfully!');
            
            this.closeReplyModal();
            
            await this.loadGmailInbox();
            await this.loadGmailStats();
            await this.loadSentEmails();
            
        } catch (error) {
            console.error('❌ Error sending reply:', error);
            alert('⚠ Error sending reply: ' + error.message);
        } finally {
            const sendBtn = document.getElementById('send-reply-btn');
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-reply"></i> Send Reply';
        }
    }

    async openForwardModal(messageId) {
        try {
            console.log(`➡ Opening forward modal (messageId: ${messageId})...`);
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-message?id=${messageId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch message details');
            }
            
            const result = await response.json();
            const message = result.message;
            
            this.currentEmail = message;
            
            const modal = document.getElementById('forward-email-modal');
            if (!modal) {
                console.error('❌ Forward modal not found');
                return;
            }
            
            document.getElementById('forward-from').value = 'raphael.nardone@alphavault-ai.com';
            document.getElementById('forward-to').value = '';
            document.getElementById('forward-subject').value = `Fwd: ${message.subject.replace(/^Fwd:\s*/i, '')}`;
            
            if (!this.forwardEditor) {
                this.forwardEditor = new Quill('#forward-body-editor', {
                    theme: 'snow',
                    modules: {
                        toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['link'],
                            ['clean']
                        ]
                    },
                    placeholder: 'Add a message (optional)...'
                });
            } else {
                this.forwardEditor.setText('');
            }
            
            const forwardedMessage = `
                <br><br>
                ---------- Forwarded message ---------<br>
                <strong>From:</strong> ${message.from}<br>
                <strong>Date:</strong> ${new Date(message.timestamp).toLocaleString()}<br>
                <strong>Subject:</strong> ${message.subject}<br>
                <br>
                ${message.bodyHtml || message.bodyText || ''}
            `;
            this.forwardEditor.clipboard.dangerouslyPasteHTML(this.forwardEditor.getLength(), forwardedMessage);
            
            if (message.attachments && message.attachments.length > 0) {
                this.displayForwardedAttachments(message.attachments);
            }
            
            modal.style.display = 'flex';
            
            console.log('✅ Forward modal opened');
            
        } catch (error) {
            console.error('❌ Error opening forward modal:', error);
            alert('⚠ Error loading email details: ' + error.message);
        }
    }

    closeForwardModal() {
        const modal = document.getElementById('forward-email-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentEmail = null;
    }

    // 🆕 SEND FORWARD AVEC INJECTION PHOTO DE PROFIL
    async sendForward() {
        try {
            console.log('📤 Forwarding email...');
            
            if (!this.currentEmail) {
                alert('⚠ Original email not found.');
                return;
            }
            
            const to = document.getElementById('forward-to').value.trim();
            
            if (!to) {
                alert('⚠ Please enter a recipient.');
                return;
            }
            
            const from = document.getElementById('forward-from')?.value || 'raphael.nardone@alphavault-ai.com';
            
            let bodyHtml = this.forwardEditor.root.innerHTML;
            const bodyText = this.forwardEditor.getText();
            
            // 🆕 INJECTION DE LA SIGNATURE AVEC PHOTO
            const signature = this.generateSignatureWithPicture(from);
            
            if (signature) {
                // Ajouter la signature avant le message transféré
                const forwardedStart = bodyHtml.indexOf('---------- Forwarded message');
                if (forwardedStart > -1) {
                    const yourMessage = bodyHtml.substring(0, forwardedStart);
                    const forwardedContent = bodyHtml.substring(forwardedStart);
                    bodyHtml = yourMessage + signature + '<br><br>' + forwardedContent;
                } else {
                    bodyHtml += signature;
                }
            }
            
            const sendBtn = document.getElementById('send-forward-btn');
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Forwarding...';
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-forward`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messageId: this.currentEmail.id,
                    from: from,
                    to: to,
                    subject: this.currentEmail.subject,
                    bodyHtml: bodyHtml,
                    bodyText: bodyText
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to forward email');
            }
            
            const result = await response.json();
            
            console.log('✅ Email forwarded:', result);
            alert('✅ Email forwarded successfully!');
            
            this.closeForwardModal();
            
            await this.loadGmailInbox();
            await this.loadSentEmails();
            
        } catch (error) {
            console.error('❌ Error forwarding email:', error);
            alert('⚠ Error forwarding email: ' + error.message);
        } finally {
            const sendBtn = document.getElementById('send-forward-btn');
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-share"></i> Forward';
        }
    }

    // 🆕 FONCTION UTILITAIRE : INJECTION PHOTO DE PROFIL DANS HTML
    injectProfilePictureIntoHTML(fromEmail, bodyHtml) {
        if (!this.emailProfilePictures || !this.emailProfilePictures[fromEmail]) {
            return bodyHtml;
        }
        
        const pictureData = this.emailProfilePictures[fromEmail];
        let profilePictureHTML = '';
        
        if (pictureData.type === 'upload' && pictureData.url) {
            // Image en base64 (déjà prête pour l'email)
            profilePictureHTML = `<img src="${pictureData.url}" alt="${pictureData.name || fromEmail}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />`;
        } else if (pictureData.type === 'url' && pictureData.url) {
            // URL externe
            profilePictureHTML = `<img src="${pictureData.url}" alt="${pictureData.name || fromEmail}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />`;
        } else {
            // Initiales (fallback)
            profilePictureHTML = `
                <div style="width: 60px; height: 60px; border-radius: 50%; background: ${pictureData.bgColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                    ${pictureData.initials}
                </div>
            `;
        }
        
        // Remplacer le placeholder générique par la vraie photo
        const signatureRegex = /<div style="[^"]*border-top:[^"]*">[\s\S]*?<div style="[^"]*display:\s*flex[^"]*">/i;
        
        if (signatureRegex.test(bodyHtml)) {
            // Remplacer les initiales génériques par la photo réelle
            bodyHtml = bodyHtml.replace(
                /<(?:img[^>]*|div style="width:\s*\d+px;\s*height:\s*\d+px;[^>]*>(?:AV|RN|[A-Z]{2,3})<\/div)>/,
                profilePictureHTML
            );
        }
        
        return bodyHtml;
    }

    // ========================================
    // 🔍 SEARCH EMAILS
    // ========================================

    async searchEmails() {
        try {
            const query = document.getElementById('gmail-search-input').value.trim();
            
            if (!query) {
                alert('⚠ Please enter a search query.');
                return;
            }
            
            console.log(`🔍 Searching emails with query: "${query}"...`);
            
            const searchBtn = document.getElementById('gmail-search-btn');
            const resultsContainer = document.getElementById('gmail-search-results');
            
            searchBtn.disabled = true;
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-search?q=${encodeURIComponent(query)}&maxResults=20`);
            
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            const result = await response.json();
            this.searchResults = result.messages || [];
            
            this.displaySearchResults();
            
            resultsContainer.style.display = 'block';
            
            console.log(`✅ Found ${this.searchResults.length} results`);
            
        } catch (error) {
            console.error('❌ Search error:', error);
            alert('⚠ Search error: ' + error.message);
        } finally {
            const searchBtn = document.getElementById('gmail-search-btn');
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="fas fa-search"></i><span class="btn-text">Search</span>';
        }
    }

    displaySearchResults() {
        const container = document.getElementById('gmail-search-results');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.searchResults.length === 0) {
            container.innerHTML = `
                <p style="color: #64748b; text-align: center; padding: 20px;">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                    No results found
                </p>
            `;
            return;
        }
        
        const title = document.createElement('h4');
        title.style.cssText = 'margin-bottom: 16px; color: #1e293b; font-weight: 700;';
        title.innerHTML = `<i class="fas fa-search"></i> Search Results (${this.searchResults.length})`;
        container.appendChild(title);
        
        this.searchResults.forEach(email => {
            const emailDiv = document.createElement('div');
            emailDiv.className = 'search-result-item';
            emailDiv.onclick = () => this.viewEmail(email.id);
            emailDiv.innerHTML = `
                <div class="search-result-header">
                    <strong>${email.from}</strong>
                    <span class="email-date">${new Date(email.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="search-result-subject">${email.subject}</div>
                <div class="search-result-snippet">${email.snippet}</div>
            `;
            container.appendChild(emailDiv);
        });
    }

    // ========================================
    // 👁 VIEW EMAIL
    // ========================================

    async viewEmail(messageId) {
        try {
            console.log(`👁 Loading email details (ID: ${messageId})...`);
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-message?id=${messageId}`);
            
            if (!response.ok) {
                throw new Error('Failed to load email');
            }
            
            const result = await response.json();
            const message = result.message;
            
            this.currentEmail = message;
            
            const modal = document.getElementById('view-email-modal');
            if (!modal) return;
            
            document.getElementById('view-email-from').textContent = message.from;
            document.getElementById('view-email-to').textContent = message.to;
            document.getElementById('view-email-subject').textContent = message.subject;
            document.getElementById('view-email-date').textContent = new Date(message.timestamp).toLocaleString();
            document.getElementById('view-email-body').innerHTML = message.bodyHtml || `<pre>${message.bodyText}</pre>`;
            
            const attContainer = document.getElementById('view-email-attachments');
            if (message.attachments && message.attachments.length > 0) {
                attContainer.innerHTML = '';
                message.attachments.forEach(att => {
                    const attDiv = document.createElement('div');
                    attDiv.className = 'attachment-item';
                    attDiv.innerHTML = `
                        <div class="attachment-info">
                            <i class="fas fa-paperclip"></i>
                            <span>${att.filename}</span>
                            <span class="attachment-size">${this.formatBytes(att.size)}</span>
                        </div>
                        <button class="btn-download" onclick="adminAnalytics.downloadAttachment('${message.id}', '${att.attachmentId}', '${att.filename}')">
                            <i class="fas fa-download"></i>
                        </button>
                    `;
                    attContainer.appendChild(attDiv);
                });
            } else {
                attContainer.innerHTML = '<p style="color: #64748b;">No attachments</p>';
            }
            
            modal.style.display = 'flex';
            
            console.log('✅ Email details displayed');
            
        } catch (error) {
            console.error('❌ Error loading email:', error);
            alert('⚠ Error: ' + error.message);
        }
    }

    closeViewEmailModal() {
        const modal = document.getElementById('view-email-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentEmail = null;
    }

    async downloadAttachment(messageId, attachmentId, filename) {
        try {
            console.log(`📎 Downloading attachment: ${filename}...`);
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-attachment?messageId=${messageId}&attachmentId=${attachmentId}`);
            
            if (!response.ok) {
                throw new Error('Failed to download attachment');
            }
            
            const result = await response.json();
            
            const byteCharacters = atob(result.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray]);
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            
            console.log('✅ Attachment downloaded');
            
        } catch (error) {
            console.error('❌ Download error:', error);
            alert('⚠ Download error: ' + error.message);
        }
    }

    // ========================================
    // 📎 ATTACHMENTS
    // ========================================

    handleFileUpload(event) {
        const files = event.target.files;
        
        if (!files || files.length === 0) return;
        
        if (!this.attachments) this.attachments = [];
        
        Array.from(files).forEach(file => {
            if (file.size > 25 * 1024 * 1024) {
                alert(`⚠ File "${file.name}" is too large (max 25MB)`);
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const base64Data = e.target.result.split(',')[1];
                
                this.attachments.push({
                    filename: file.name,
                    mimeType: file.type,
                    size: file.size,
                    data: base64Data
                });
                
                this.updateAttachmentsList('compose');
                
                console.log(`✅ File attached: ${file.name} (${this.formatBytes(file.size)})`);
            };
            
            reader.readAsDataURL(file);
        });
    }

    removeAttachment(index) {
        this.attachments.splice(index, 1);
        this.updateAttachmentsList('compose');
        console.log(`✅ Attachment removed (index: ${index})`);
    }

    updateAttachmentsList(context = 'compose') {
        const container = document.getElementById(`${context}-attachments-list`);
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!this.attachments || this.attachments.length === 0) {
            container.innerHTML = '<p style="color: #64748b; font-size: 0.9rem; margin-top: 8px;">No attachments</p>';
            return;
        }
        
        this.attachments.forEach((att, index) => {
            const attDiv = document.createElement('div');
            attDiv.className = 'attachment-item';
            attDiv.innerHTML = `
                <div class="attachment-info">
                    <i class="fas fa-paperclip"></i>
                    <span>${att.filename}</span>
                    <span class="attachment-size">${this.formatBytes(att.size)}</span>
                </div>
                <button class="btn-remove-attachment" onclick="adminAnalytics.removeAttachment(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(attDiv);
        });
    }

    displayForwardedAttachments(attachments) {
        const container = document.getElementById('forward-original-attachments');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!attachments || attachments.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        container.style.display = 'block';
        
        const label = document.createElement('label');
        label.textContent = 'Original Attachments:';
        label.style.cssText = 'font-weight: 700; margin-bottom: 8px; display: block;';
        container.appendChild(label);
        
        attachments.forEach(att => {
            const attDiv = document.createElement('div');
            attDiv.className = 'attachment-item';
            attDiv.innerHTML = `
                <div class="attachment-info">
                    <i class="fas fa-paperclip"></i>
                    <span>${att.filename}</span>
                    <span class="attachment-size">${this.formatBytes(att.size)}</span>
                </div>
            `;
            container.appendChild(attDiv);
        });
    }

    // ========================================
    // 💾 DRAFTS
    // ========================================

    startAutoSaveDraft(context = 'compose') {
        if (this.autoSaveDraftTimer) {
            clearInterval(this.autoSaveDraftTimer);
        }
        
        this.autoSaveDraftTimer = setInterval(() => {
            this.saveDraft(context, true);
        }, 30000);
        
        console.log('✅ Auto-save draft activated (every 30s)');
    }

    async saveDraft(context = 'compose', auto = false) {
        try {
            const to = document.getElementById(`${context}-to`).value.trim();
            const subject = document.getElementById(`${context}-subject`).value.trim();
            
            if (!to && !subject) {
                if (!auto) {
                    alert('⚠ Please enter at least a recipient or subject.');
                }
                return;
            }
            
            const editor = context === 'compose' ? this.composeEditor : this.replyEditor;
            if (!editor) return;
            
            const bodyHtml = editor.root.innerHTML;
            const bodyText = editor.getText();
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-save-draft`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: to || undefined,
                    cc: document.getElementById(`${context}-cc`)?.value.trim() || undefined,
                    subject: subject || undefined,
                    bodyHtml: bodyHtml,
                    bodyText: bodyText
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save draft');
            }
            
            const result = await response.json();
            
            if (auto) {
                console.log('💾 Draft auto-saved');
            } else {
                console.log('✅ Draft saved:', result);
                alert('✅ Draft saved successfully!');
            }
            
            await this.loadGmailDrafts();
            
        } catch (error) {
            console.error('❌ Error saving draft:', error);
            if (!auto) {
                alert('⚠ Error saving draft: ' + error.message);
            }
        }
    }

    async loadGmailDrafts() {
        try {
            console.log('💾 Loading Gmail drafts...');
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-drafts`);
            
            if (!response.ok) {
                throw new Error('Failed to load drafts');
            }
            
            const result = await response.json();
            this.gmailDrafts = result.drafts || [];
            
            this.updateStat('gmail-drafts-count', this.gmailDrafts.length);
            
            this.displayGmailDrafts();
            
            console.log(`✅ ${this.gmailDrafts.length} drafts loaded`);
            
        } catch (error) {
            console.error('❌ Error loading drafts:', error);
        }
    }

    displayGmailDrafts() {
        const container = document.getElementById('gmail-drafts-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!this.gmailDrafts || this.gmailDrafts.length === 0) {
            container.innerHTML = '<p style="color: #64748b; text-align: center; padding: 20px;">No drafts saved</p>';
            return;
        }
        
        this.gmailDrafts.forEach(draft => {
            const draftDiv = document.createElement('div');
            draftDiv.className = 'draft-item';
            draftDiv.innerHTML = `
                <div class="draft-info">
                    <div class="draft-subject">${draft.subject || '(No subject)'}</div>
                    <div class="draft-to">To: ${draft.to || 'N/A'}</div>
                    <div class="draft-snippet">${draft.snippet || ''}</div>
                </div>
                <div class="draft-actions">
                    <button class="btn-action" onclick="adminAnalytics.openDraft('${draft.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-action btn-danger" onclick="adminAnalytics.deleteDraft('${draft.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(draftDiv);
        });
    }

    async deleteDraft(draftId) {
        try {
            if (!confirm('Delete this draft?')) return;
            
            const response = await fetch(`${GMAIL_WORKER_URL}/gmail-delete-draft`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    draftId: draftId
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete draft');
            }
            
            alert('✅ Draft deleted!');
            await this.loadGmailDrafts();
            
        } catch (error) {
            console.error('❌ Error deleting draft:', error);
            alert('⚠ Error: ' + error.message);
        }
    }

    // ========================================
    // ✍ SIGNATURE MANAGEMENT - FIRESTORE (ULTRA PRO EDITION)
    // ========================================

    async loadSignatures() {
        try {
            console.log('📥 Loading email signatures from Firestore...');
            
            const loadingIndicator = document.getElementById('signatures-loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block';
            }
            
            // ✨ AJOUT TEMPORAIRE : Force l'update (supprimer après)
            const FORCE_UPDATE = true; // ⚠ Mettre à FALSE après la première exécution
            
            if (FORCE_UPDATE) {
                console.warn('⚠ FORCE UPDATE MODE ENABLED - Updating all signatures...');
                this.emailSignatures = this.getDefaultSignatures();
                await this.saveAllSignaturesToFirestore();
                this.displaySignaturePreviews();
                
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
                
                alert('✅ Signatures forcées à jour ! Change FORCE_UPDATE à false maintenant.');
                return;
            }
            // ✨ FIN AJOUT TEMPORAIRE
            
            const signaturesSnapshot = await this.db.collection('email_signatures').get();
            
            if (signaturesSnapshot.empty) {
                console.warn('⚠ No signatures found in Firestore, creating defaults...');
                this.emailSignatures = this.getDefaultSignatures();
                await this.saveAllSignaturesToFirestore();
            } else {
                this.emailSignatures = {};
                
                signaturesSnapshot.forEach(doc => {
                    const data = doc.data();
                    this.emailSignatures[data.email] = data.signature;
                });
                
                console.log(`✅ ${signaturesSnapshot.size} signatures loaded from Firestore`);
            }
            
            this.displaySignaturePreviews();
            
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            
        } catch (error) {
            console.error('❌ Error loading signatures from Firestore:', error);
            
            this.emailSignatures = this.getDefaultSignatures();
            this.displaySignaturePreviews();
            
            const loadingIndicator = document.getElementById('signatures-loading-indicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }

    // ========================================
    // 🎨 DEFAULT SIGNATURES (ULTRA PREMIUM)
    // ========================================

    getDefaultSignatures() {
        return {
            'newsletter@alphavault-ai.com': this.getNewsletterSignature('newsletter@alphavault-ai.com'),
            'raphael.nardone@alphavault-ai.com': this.getRaphaelSignature(),
            'contact@alphavault-ai.com': this.getContactSignature('contact@alphavault-ai.com'),
            'info@alphavault-ai.com': this.getInfoSignature('info@alphavault-ai.com'),
            'support@alphavault-ai.com': this.getSupportSignature('support@alphavault-ai.com'),
            'raphnardone@gmail.com': this.getPersonalSignature('raphnardone@gmail.com')
        };
    }

    // ========================================
    // 🌟 SIGNATURE 1: EXECUTIVE PREMIUM (Raphaël)
    // ========================================

    getRaphaelSignature() {
        return `
            <br><br>
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1.6; max-width: 600px;">
                <tr>
                    <td style="padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <!-- Photo Profile -->
                                <td style="width: 90px; vertical-align: top; padding-right: 20px;">
                                    <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0,0,0,0.2); border: 3px solid rgba(255,255,255,0.9);">
                                        <span style="font-size: 36px; font-weight: 800; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">RN</span>
                                    </div>
                                </td>
                                
                                <!-- Infos -->
                                <td style="vertical-align: top; color: #ffffff;">
                                    <div style="margin-bottom: 8px;">
                                        <strong style="font-size: 20px; font-weight: 700; letter-spacing: 0.5px; color: #ffffff;">Raphaël Nardone</strong>
                                    </div>
                                    <div style="font-size: 13px; color: rgba(255,255,255,0.9); margin-bottom: 14px; font-weight: 600;">
                                        Founder & CEO | AlphaVault AI
                                    </div>
                                    
                                    <!-- Contact Info avec icônes -->
                                    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: rgba(255,255,255,0.95);">
                                        <tr>
                                            <td style="padding: 3px 0;">
                                                <span style="display: inline-block; width: 18px;">📧</span>
                                                <a href="mailto:raphael.nardone@alphavault-ai.com" style="color: #ffffff; text-decoration: none; font-weight: 500;">raphael.nardone@alphavault-ai.com</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 3px 0;">
                                                <span style="display: inline-block; width: 18px;">📱</span>
                                                <span style="font-weight: 500;">+33 (0)X XX XX XX XX</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 3px 0;">
                                                <span style="display: inline-block; width: 18px;">🌐</span>
                                                <a href="https://alphavault-ai.com" style="color: #ffffff; text-decoration: none; font-weight: 600;">alphavault-ai.com</a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Social Links -->
                                    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.3);">
                                        <table cellpadding="0" cellspacing="0" border="0">
                                            <tr>
                                                <!-- LinkedIn -->
                                                <td style="padding-right: 12px;">
                                                    <a href="https://linkedin.com/in/raphael-nardone" style="display: inline-block; text-decoration: none;">
                                                        <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 8px; text-align: center; line-height: 32px; backdrop-filter: blur(10px);">
                                                            <span style="color: #ffffff; font-weight: 700; font-size: 14px;">in</span>
                                                        </div>
                                                    </a>
                                                </td>
                                                <!-- Twitter/X -->
                                                <td style="padding-right: 12px;">
                                                    <a href="https://twitter.com/alphavault_ai" style="display: inline-block; text-decoration: none;">
                                                        <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 8px; text-align: center; line-height: 32px; backdrop-filter: blur(10px);">
                                                            <span style="color: #ffffff; font-weight: 700; font-size: 14px;">𝕏</span>
                                                        </div>
                                                    </a>
                                                </td>
                                                <!-- GitHub -->
                                                <td>
                                                    <a href="https://github.com/alphavault-ai" style="display: inline-block; text-decoration: none;">
                                                        <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 8px; text-align: center; line-height: 32px; backdrop-filter: blur(10px);">
                                                            <span style="color: #ffffff; font-weight: 700; font-size: 16px;">⚡</span>
                                                        </div>
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Tagline -->
                        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.3); text-align: center; color: rgba(255,255,255,0.95); font-size: 12px; font-style: italic; font-weight: 500;">
                            🚀 Leading the future of AI-powered financial intelligence
                        </div>
                    </td>
                </tr>
            </table>
        `;
    }

    // ========================================
    // 💼 SIGNATURE 2: CORPORATE CLEAN (Newsletter)
    // ========================================

    getNewsletterSignature(email) {
        return `
            <br><br>
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px;">
                <tr>
                    <td style="padding: 20px; background: linear-gradient(to right, #f8fafc 0%, #ffffff 100%); border-left: 5px solid; border-image: linear-gradient(135deg, #667eea, #764ba2) 1; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <!-- Logo -->
                                <td style="width: 70px; vertical-align: middle; padding-right: 18px;">
                                    <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                                        <span style="color: #ffffff; font-weight: 900; font-size: 26px; letter-spacing: -1px;">AV</span>
                                    </div>
                                </td>
                                
                                <!-- Content -->
                                <td style="vertical-align: middle;">
                                    <div style="margin-bottom: 6px;">
                                        <strong style="font-size: 18px; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: 800;">AlphaVault AI</strong>
                                    </div>
                                    <div style="font-size: 12px; color: #64748b; margin-bottom: 10px; font-weight: 600;">
                                        Premium Financial Intelligence Platform
                                    </div>
                                    
                                    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #475569;">
                                        <tr>
                                            <td style="padding: 2px 0;">
                                                <span style="color: #667eea;">📧</span> <a href="mailto:${email}" style="color: #1e293b; text-decoration: none; font-weight: 500;">${email}</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 2px 0;">
                                                <span style="color: #667eea;">🌐</span> <a href="https://alphavault-ai.com" style="color: #667eea; text-decoration: none; font-weight: 600;">alphavault-ai.com</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 2px 0;">
                                                <span style="color: #667eea;">💎</span> <span style="font-size: 12px; color: #64748b;">Real-time Analysis | AI Predictions | Market Intelligence</span>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        
                        <!-- Social Footer -->
                        <div style="margin-top: 16px; padding-top: 14px; border-top: 2px solid #e2e8f0; text-align: center;">
                            <a href="https://linkedin.com/company/alphavault-ai" style="display: inline-block; margin: 0 6px; text-decoration: none;">
                                <div style="width: 30px; height: 30px; background: linear-gradient(135deg, #0077b5, #00a0dc); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,119,181,0.3);">
                                    <span style="color: #ffffff; font-weight: 700; font-size: 14px;">in</span>
                                </div>
                            </a>
                            <a href="https://twitter.com/alphavault_ai" style="display: inline-block; margin: 0 6px; text-decoration: none;">
                                <div style="width: 30px; height: 30px; background: linear-gradient(135deg, #1da1f2, #0d8bd9); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(29,161,242,0.3);">
                                    <span style="color: #ffffff; font-weight: 700; font-size: 14px;">𝕏</span>
                                </div>
                            </a>
                            <a href="https://github.com/alphavault-ai" style="display: inline-block; margin: 0 6px; text-decoration: none;">
                                <div style="width: 30px; height: 30px; background: linear-gradient(135deg, #333333, #24292e); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(36,41,46,0.3);">
                                    <span style="color: #ffffff; font-weight: 700; font-size: 16px;">⚡</span>
                                </div>
                            </a>
                        </div>
                    </td>
                </tr>
            </table>
        `;
    }

    // ========================================
    // 🎯 SIGNATURE 3: MINIMAL MODERN (Support)
    // ========================================

    getSupportSignature(email) {
        return `
            <br><br>
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px;">
                <tr>
                    <td>
                        <div style="padding: 18px 24px; background: #ffffff; border: 2px solid transparent; background-clip: padding-box; position: relative; border-radius: 12px; box-shadow: 0 4px 16px rgba(102, 126, 234, 0.12);">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td>
                                        <div style="margin-bottom: 12px;">
                                            <span style="font-size: 22px; font-weight: 900; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">AlphaVault AI</span>
                                            <span style="display: block; font-size: 12px; color: #64748b; margin-top: 4px; font-weight: 600;">Customer Support Team</span>
                                        </div>
                                        
                                        <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #1e293b; line-height: 1.8;">
                                            <tr>
                                                <td style="padding: 4px 0;">
                                                    <span style="display: inline-block; width: 24px; text-align: center;">💬</span>
                                                    <a href="mailto:${email}" style="color: #667eea; text-decoration: none; font-weight: 600;">${email}</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0;">
                                                    <span style="display: inline-block; width: 24px; text-align: center;">🌐</span>
                                                    <a href="https://alphavault-ai.com/support" style="color: #667eea; text-decoration: none; font-weight: 600;">Help Center</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0;">
                                                    <span style="display: inline-block; width: 24px; text-align: center;">⏱</span>
                                                    <span style="color: #64748b; font-size: 12px;">24/7 Support Available</span>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
                                            <em>🚀 We're here to help you succeed with AlphaVault AI</em>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
            </table>
        `;
    }

    // ========================================
    // 📊 SIGNATURE 4: TECH GLASSMORPHISM (Info)
    // ========================================

    getInfoSignature(email) {
        return `
            <br><br>
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px;">
                <tr>
                    <td style="padding: 22px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%); border-radius: 16px; border: 1px solid rgba(102, 126, 234, 0.2); backdrop-filter: blur(10px);">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td style="vertical-align: top; width: 80px; padding-right: 20px;">
                                    <!-- Animated Badge -->
                                    <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); background-size: 200% 200%; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4), 0 0 40px rgba(118, 75, 162, 0.2);">
                                        <span style="color: #ffffff; font-weight: 900; font-size: 28px;">AV</span>
                                    </div>
                                </td>
                                
                                <td style="vertical-align: top;">
                                    <div style="margin-bottom: 8px;">
                                        <strong style="font-size: 20px; color: #1e293b; font-weight: 800;">AlphaVault AI</strong>
                                        <div style="display: inline-block; margin-left: 8px; padding: 3px 10px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 20px; font-size: 10px; color: #ffffff; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Premium</div>
                                    </div>
                                    
                                    <div style="font-size: 12px; color: #64748b; margin-bottom: 12px; font-weight: 600;">
                                        AI-Powered Financial Intelligence
                                    </div>
                                    
                                    <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: #475569;">
                                        <tr>
                                            <td style="padding: 3px 0;">
                                                <span style="display: inline-block; width: 20px; height: 20px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 6px; text-align: center; line-height: 20px; margin-right: 8px;">📧</span>
                                                <a href="mailto:${email}" style="color: #1e293b; text-decoration: none; font-weight: 600;">${email}</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 3px 0;">
                                                <span style="display: inline-block; width: 20px; height: 20px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 6px; text-align: center; line-height: 20px; margin-right: 8px;">🌐</span>
                                                <a href="https://alphavault-ai.com" style="color: #667eea; text-decoration: none; font-weight: 700;">alphavault-ai.com</a>
                                            </td>
                                        </tr>
                                    </table>
                                    
                                    <!-- Features Pills -->
                                    <div style="margin-top: 12px;">
                                        <span style="display: inline-block; padding: 4px 10px; background: rgba(102, 126, 234, 0.1); border: 1px solid rgba(102, 126, 234, 0.3); border-radius: 20px; font-size: 11px; color: #667eea; font-weight: 600; margin-right: 6px; margin-bottom: 4px;">📊 Real-Time Data</span>
                                        <span style="display: inline-block; padding: 4px 10px; background: rgba(118, 75, 162, 0.1); border: 1px solid rgba(118, 75, 162, 0.3); border-radius: 20px; font-size: 11px; color: #764ba2; font-weight: 600; margin-right: 6px; margin-bottom: 4px;">🤖 AI Predictions</span>
                                        <span style="display: inline-block; padding: 4px 10px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; font-size: 11px; color: #10b981; font-weight: 600; margin-bottom: 4px;">💎 Premium Insights</span>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        `;
    }

    // ========================================
    // 🔥 SIGNATURE 5: COMPACT GRADIENT (Contact)
    // ========================================

    getContactSignature(email) {
        return `
            <br><br>
            <table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px;">
                <tr>
                    <td>
                        <div style="padding: 16px 20px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); border-radius: 12px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);">
                            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td style="color: #ffffff;">
                                        <div style="margin-bottom: 10px;">
                                            <strong style="font-size: 19px; font-weight: 800; color: #ffffff; letter-spacing: 0.3px;">AlphaVault AI</strong>
                                            <div style="font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 3px; font-weight: 500;">Contact & Business Inquiries</div>
                                        </div>
                                        
                                        <table cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; color: rgba(255,255,255,0.95); line-height: 1.7;">
                                            <tr>
                                                <td style="padding: 3px 0;">
                                                    📧 <a href="mailto:${email}" style="color: #ffffff; text-decoration: none; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.5);">${email}</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 3px 0;">
                                                    🌐 <a href="https://alphavault-ai.com" style="color: #ffffff; text-decoration: none; font-weight: 700;">alphavault-ai.com</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 3px 0;">
                                                    💼 <span style="font-size: 12px; color: rgba(255,255,255,0.9);">Premium Financial Intelligence Platform</span>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Social Icons Inline -->
                                        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.25);">
                                            <a href="https://linkedin.com/company/alphavault-ai" style="display: inline-block; margin-right: 8px; padding: 6px 12px; background: rgba(255,255,255,0.2); border-radius: 8px; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; backdrop-filter: blur(10px);">
                                                🔗 LinkedIn
                                            </a>
                                            <a href="https://twitter.com/alphavault_ai" style="display: inline-block; margin-right: 8px; padding: 6px 12px; background: rgba(255,255,255,0.2); border-radius: 8px; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 600; backdrop-filter: blur(10px);">
                                                𝕏 Twitter
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
            </table>
        `;
    }

    // ========================================
    // 👤 SIGNATURE 6: PERSONAL MINIMAL (Gmail)
    // ========================================

    getPersonalSignature(email) {
        return `
            <br><br>
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #1e293b; max-width: 400px; padding: 16px; border-left: 4px solid; border-image: linear-gradient(to bottom, #667eea, #764ba2) 1;">
                <div style="margin-bottom: 10px;">
                    <strong style="font-size: 17px; color: #1e293b;">Raphaël Nardone</strong>
                    <div style="font-size: 12px; color: #64748b; margin-top: 3px;">AlphaVault AI</div>
                </div>
                
                <div style="font-size: 13px; color: #475569; line-height: 1.7;">
                    📧 <a href="mailto:${email}" style="color: #667eea; text-decoration: none; font-weight: 600;">${email}</a><br>
                    🌐 <a href="https://alphavault-ai.com" style="color: #667eea; text-decoration: none; font-weight: 600;">alphavault-ai.com</a>
                </div>
                
                <div style="margin-top: 12px; font-size: 11px; color: #94a3b8; font-style: italic;">
                    💡 Financial Intelligence Powered by AI
                </div>
            </div>
        `;
    }

    // ========================================
    // 💾 SAVE ALL SIGNATURES TO FIRESTORE
    // ========================================

    async saveAllSignaturesToFirestore() {
        try {
            console.log('💾 Saving default signatures to Firestore...');
            
            const batch = this.db.batch();
            
            Object.entries(this.emailSignatures).forEach(([email, signature]) => {
                const docRef = this.db.collection('email_signatures').doc(email);
                
                batch.set(docRef, {
                    email: email,
                    signature: signature,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    createdBy: ADMIN_EMAIL || 'admin'
                });
            });
            
            await batch.commit();
            
            console.log('✅ All signatures saved to Firestore');
            
        } catch (error) {
            console.error('❌ Error saving signatures to Firestore:', error);
            throw error;
        }
    }

    // ========================================
    // 💾 SAVE SINGLE SIGNATURE TO FIRESTORE
    // ========================================

    async saveSignatureToFirestore(email, signatureHTML) {
        try {
            console.log(`💾 Saving signature to Firestore for: ${email}`);
            
            await this.db.collection('email_signatures').doc(email).set({
                email: email,
                signature: signatureHTML,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: ADMIN_EMAIL || 'admin'
            });
            
            console.log('✅ Signature saved to Firestore');
            
        } catch (error) {
            console.error('❌ Error saving signature to Firestore:', error);
            throw error;
        }
    }

    // ========================================
    // 👁 DISPLAY SIGNATURE PREVIEWS
    // ========================================

    displaySignaturePreviews() {
        if (!this.emailSignatures) return;
        
        const emailKeyMap = {
            'newsletter@alphavault-ai.com': 'newsletter',
            'raphael.nardone@alphavault-ai.com': 'raphael',
            'contact@alphavault-ai.com': 'contact',
            'info@alphavault-ai.com': 'info',
            'support@alphavault-ai.com': 'support',
            'raphnardone@gmail.com': 'personal'
        };
        
        Object.keys(this.emailSignatures).forEach(email => {
            const key = emailKeyMap[email];
            if (!key) return;
            
            const preview = document.getElementById(`signature-preview-${key}`);
            if (preview) {
                preview.innerHTML = this.emailSignatures[email] || '<em style="color: #64748b;">No signature defined</em>';
            }
        });
        
        console.log('✅ Signature previews updated');
    }

    // ========================================
    // 🔓 OPEN SIGNATURE MODAL
    // ========================================

    openSignatureModal() {
        const modal = document.getElementById('signature-editor-modal');
        if (!modal) {
            console.error('❌ Signature modal not found');
            return;
        }
        
        this.currentSignatureEmail = 'raphael.nardone@alphavault-ai.com';
        
        if (!this.signatureEditor) {
            this.signatureEditor = new Quill('#signature-wysiwyg-editor', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'image'],
                        ['clean']
                    ]
                },
                placeholder: 'Create your email signature...'
            });
            
            this.setupImageResizer();
        }
        
        this.loadSignatureForEmail('raphael.nardone@alphavault-ai.com');
        
        modal.style.display = 'flex';
        
        console.log('✅ Signature modal opened');
    }

    // ========================================
    // 🔒 CLOSE SIGNATURE MODAL
    // ========================================

    closeSignatureModal() {
        const modal = document.getElementById('signature-editor-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        if (this.removeImageControls) {
            this.removeImageControls();
        }
    }

    // ========================================
    // 🔄 SWITCH SIGNATURE TAB
    // ========================================

    switchSignatureTab(email) {
        this.currentSignatureEmail = email;
        
        document.querySelectorAll('.signature-tab').forEach(tab => {
            if (tab.dataset.email === email) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        document.getElementById('current-signature-email').textContent = email;
        
        this.loadSignatureForEmail(email);
        
        console.log(`✅ Switched to signature: ${email}`);
    }

    // ========================================
    // 📥 LOAD SIGNATURE FOR EMAIL
    // ========================================

    loadSignatureForEmail(email) {
        if (!this.signatureEditor || !this.emailSignatures) return;
        
        const signature = this.emailSignatures[email] || '';
        
        this.signatureEditor.root.innerHTML = signature;
        
        console.log(`✅ Signature loaded for: ${email}`);
    }

    // ========================================
    // 💾 SAVE CURRENT SIGNATURE
    // ========================================

    async saveCurrentSignature() {
        if (!this.signatureEditor || !this.currentSignatureEmail) {
            alert('⚠ No signature to save');
            return;
        }
        
        try {
            const signatureHTML = this.signatureEditor.root.innerHTML;
            
            this.emailSignatures[this.currentSignatureEmail] = signatureHTML;
            
            await this.saveSignatureToFirestore(this.currentSignatureEmail, signatureHTML);
            
            this.displaySignaturePreviews();
            
            alert(`✅ Signature saved for ${this.currentSignatureEmail}!`);
            
            console.log(`✅ Signature saved for: ${this.currentSignatureEmail}`);
            
        } catch (error) {
            console.error('❌ Error saving signature:', error);
            alert('⚠ Error saving signature: ' + error.message);
        }
    }

    // ========================================
    // 🗑 CLEAR CURRENT SIGNATURE
    // ========================================

    clearCurrentSignature() {
        if (!this.signatureEditor) return;
        
        if (confirm('Clear this signature?')) {
            this.signatureEditor.setText('');
        }
    }

    // ========================================
    // 🎨 APPLY SIGNATURE TEMPLATE
    // ========================================

    applySignatureTemplate(templateName) {
        if (!this.signatureEditor || !this.currentSignatureEmail) return;
        
        const templates = {
            minimal: this.getPersonalSignature(this.currentSignatureEmail),
            
            professional: this.getNewsletterSignature(this.currentSignatureEmail),
            
            corporate: this.getContactSignature(this.currentSignatureEmail),
            
            modern: this.getInfoSignature(this.currentSignatureEmail),
            
            executive: this.currentSignatureEmail.includes('raphael') ? 
                this.getRaphaelSignature() : 
                this.getNewsletterSignature(this.currentSignatureEmail),
            
            support: this.getSupportSignature(this.currentSignatureEmail),
            
            glassmorphism: `
                <br><br>
                <table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Segoe UI', sans-serif; max-width: 540px;">
                    <tr>
                        <td style="padding: 24px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.12)); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                            <div style="text-align: center; margin-bottom: 16px;">
                                <div style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50px; box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);">
                                    <span style="color: #ffffff; font-weight: 900; font-size: 24px; letter-spacing: 1px;">AlphaVault AI</span>
                                </div>
                            </div>
                            
                            <div style="text-align: center; color: #1e293b; font-size: 14px; line-height: 2;">
                                <strong style="font-size: 16px; color: #667eea;">${this.currentSignatureEmail}</strong><br>
                                <a href="https://alphavault-ai.com" style="color: #764ba2; text-decoration: none; font-weight: 700;">alphavault-ai.com</a><br>
                                <span style="font-size: 12px; color: #64748b;">🚀 AI Financial Intelligence • 📊 Real-Time Analysis • 💎 Premium Insights</span>
                            </div>
                        </td>
                    </tr>
                </table>
            `
        };
        
        const template = templates[templateName];
        
        if (template) {
            this.signatureEditor.root.innerHTML = template;
            alert(`✅ Template "${templateName}" applied!`);
        }
    }

    // ========================================
    // 💉 INJECT SIGNATURE INTO EDITOR
    // ========================================

    injectSignature(context = 'compose') {
        const fromSelect = document.getElementById(`${context}-from`);
        if (!fromSelect) {
            console.warn(`⚠ FROM selector not found for context: ${context}`);
            return;
        }
        
        const fromEmail = fromSelect.value;
        
        if (!this.emailSignatures) {
            console.warn('⚠ Email signatures not loaded yet');
            return;
        }
        
        const signature = this.emailSignatures[fromEmail];
        
        if (!signature) {
            console.warn(`⚠ No signature defined for: ${fromEmail}`);
            return;
        }
        
        const editor = context === 'compose' ? this.composeEditor : 
                        context === 'reply' ? this.replyEditor : 
                        context === 'forward' ? this.forwardEditor : null;
        
        if (!editor) {
            console.warn(`⚠ Editor not found for context: ${context}`);
            return;
        }
        
        editor.clipboard.dangerouslyPasteHTML(0, signature);
        
        console.log(`✅ Signature injected for: ${fromEmail}`);
    }

    // ========================================
    // 🔄 SETUP FROM CHANGE LISTENERS
    // ========================================

    setupFromChangeListeners() {
        const composeFrom = document.getElementById('compose-from');
        if (composeFrom) {
            composeFrom.addEventListener('change', () => {
                if (this.composeEditor) {
                    this.composeEditor.setText('');
                    this.injectSignature('compose');
                }
            });
        }
        
        const replyFrom = document.getElementById('reply-from');
        if (replyFrom) {
            replyFrom.addEventListener('change', () => {
                if (this.replyEditor) {
                    const currentContent = this.replyEditor.root.innerHTML;
                    const signatureRemoved = currentContent.split('<br><br>')[0];
                    this.replyEditor.root.innerHTML = signatureRemoved;
                    this.injectSignature('reply');
                }
            });
        }
        
        const forwardFrom = document.getElementById('forward-from');
        if (forwardFrom) {
            forwardFrom.addEventListener('change', () => {
                if (this.forwardEditor) {
                    this.injectSignature('forward');
                }
            });
        }
        
        console.log('✅ FROM change listeners setup');
    }

    // ========================================
    // 🖼 IMAGE RESIZER FOR SIGNATURE EDITOR
    // ========================================

    setupImageResizer() {
        if (!this.signatureEditor) return;
        
        let selectedImage = null;
        let controlsElement = null;
        
        const createControls = (img) => {
            if (controlsElement) {
                controlsElement.remove();
            }
            
            controlsElement = document.createElement('div');
            controlsElement.className = 'image-resize-controls-overlay';
            controlsElement.innerHTML = `
                <button class="img-resize-btn img-resize-minus" title="Reduce size">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" class="img-resize-input" value="${Math.round(img.width || 200)}" min="50" max="800" step="10">
                <span class="img-resize-label">px</span>
                <button class="img-resize-btn img-resize-plus" title="Increase size">
                    <i class="fas fa-plus"></i>
                </button>
            `;
            
            const updateControlsPosition = () => {
                const rect = img.getBoundingClientRect();
                controlsElement.style.position = 'fixed';
                controlsElement.style.top = `${rect.bottom + 10}px`;
                controlsElement.style.left = `${rect.left + (rect.width / 2)}px`;
                controlsElement.style.transform = 'translateX(-50%)';
                controlsElement.style.zIndex = '999999';
            };
            
            updateControlsPosition();
            document.body.appendChild(controlsElement);
            
            const btnMinus = controlsElement.querySelector('.img-resize-minus');
            const btnPlus = controlsElement.querySelector('.img-resize-plus');
            const input = controlsElement.querySelector('.img-resize-input');
            
            btnMinus.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const currentWidth = img.width || parseInt(img.style.width) || 200;
                const newWidth = Math.max(50, currentWidth - 50);
                img.style.width = newWidth + 'px';
                img.style.height = 'auto';
                img.setAttribute('width', newWidth);
                input.value = newWidth;
                updateControlsPosition();
            });
            
            btnPlus.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const currentWidth = img.width || parseInt(img.style.width) || 200;
                const newWidth = Math.min(800, currentWidth + 50);
                img.style.width = newWidth + 'px';
                img.style.height = 'auto';
                img.setAttribute('width', newWidth);
                input.value = newWidth;
                updateControlsPosition();
            });
            
            input.addEventListener('change', (e) => {
                e.stopPropagation();
                const newWidth = parseInt(input.value);
                if (newWidth >= 50 && newWidth <= 800) {
                    img.style.width = newWidth + 'px';
                    img.style.height = 'auto';
                    img.setAttribute('width', newWidth);
                    updateControlsPosition();
                }
            });
            
            input.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            const modalBody = document.querySelector('#signature-editor-modal .gmail-modal-body');
            if (modalBody) {
                modalBody.addEventListener('scroll', updateControlsPosition);
            }
            
            return controlsElement;
        };
        
        const removeControls = () => {
            if (controlsElement) {
                controlsElement.remove();
                controlsElement = null;
            }
            if (selectedImage) {
                selectedImage.classList.remove('img-selected');
                selectedImage = null;
            }
        };
        
        this.signatureEditor.root.addEventListener('click', (e) => {
            const clickedImg = e.target.closest('img');
            
            if (clickedImg) {
                if (selectedImage && selectedImage !== clickedImg) {
                    selectedImage.classList.remove('img-selected');
                }
                
                selectedImage = clickedImg;
                selectedImage.classList.add('img-selected');
                
                createControls(clickedImg);
                
                console.log('✅ Image selected, controls displayed');
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.ql-editor') && !e.target.closest('.image-resize-controls-overlay')) {
                removeControls();
            }
        });
        
        const modal = document.getElementById('signature-editor-modal');
        if (modal) {
            const closeBtn = modal.querySelector('.btn-close-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', removeControls);
            }
        }
        
        this.removeImageControls = removeControls;
        
        console.log('✅ Image resizer setup complete');
    }

    // ========================================
    // 🖼 PROFILE PICTURES MANAGEMENT - FIRESTORE
    // ========================================

    async loadProfilePictures() {
        try {
            console.log('📸 Loading profile pictures from Firestore...');
            
            const loadingIndicator = document.getElementById('profile-pictures-loading');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block';
            }
            
            const picturesSnapshot = await this.db.collection('email_profile_pictures').get();
            
            if (picturesSnapshot.empty) {
                console.warn('⚠ No profile pictures found, creating defaults...');
                this.emailProfilePictures = this.getDefaultProfilePictures();
                await this.saveAllProfilePicturesToFirestore();
            } else {
                this.emailProfilePictures = {};
                
                picturesSnapshot.forEach(doc => {
                    const data = doc.data();
                    this.emailProfilePictures[data.email] = {
                        url: data.url || '',
                        type: data.type || 'initials',
                        initials: data.initials || 'AV',
                        bgColor: data.bgColor || '#667eea',
                        name: data.name || '',
                        title: data.title || '',
                        updatedAt: data.updatedAt
                    };
                });
                
                console.log(`✅ ${picturesSnapshot.size} profile pictures loaded from Firestore`);
            }
            
            this.displayProfilePicturesManager();
            
            // 🆕 METTRE À JOUR TOUTES LES SIGNATURES AVEC LES PHOTOS
            this.updateAllSignaturesWithPictures();
            
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            
        } catch (error) {
            console.error('❌ Error loading profile pictures:', error);
            this.emailProfilePictures = this.getDefaultProfilePictures();
            this.displayProfilePicturesManager();
        }
    }

    getDefaultProfilePictures() {
        return {
            'raphael.nardone@alphavault-ai.com': {
                url: 'https://Raph33AI.github.io/assets/images/raphael-nardone.jpg',
                type: 'url',
                initials: 'RN',
                bgColor: '#667eea',
                name: 'Raphaël Nardone',
                title: 'Founder & CEO - AlphaVault AI'
            },
            'newsletter@alphavault-ai.com': {
                url: 'https://Raph33AI.github.io/apple-touch-icon.png',
                type: 'url',
                initials: 'AV',
                bgColor: '#3b82f6',
                name: 'AlphaVault AI',
                title: 'Newsletter Team'
            },
            'contact@alphavault-ai.com': {
                url: 'https://Raph33AI.github.io/apple-touch-icon.png',
                type: 'url',
                initials: 'AV',
                bgColor: '#10b981',
                name: 'AlphaVault AI',
                title: 'Contact Team'
            },
            'info@alphavault-ai.com': {
                url: 'https://Raph33AI.github.io/apple-touch-icon.png',
                type: 'url',
                initials: 'AV',
                bgColor: '#f59e0b',
                name: 'AlphaVault AI',
                title: 'Information Team'
            },
            'support@alphavault-ai.com': {
                url: 'https://Raph33AI.github.io/apple-touch-icon.png',
                type: 'url',
                initials: 'AV',
                bgColor: '#8b5cf6',
                name: 'AlphaVault AI',
                title: 'Support Team'
            },
            'raphnardone@gmail.com': {
                url: 'https://Raph33AI.github.io/assets/images/raphael-nardone.jpg',
                type: 'url',
                initials: 'RN',
                bgColor: '#ef4444',
                name: 'Raphaël Nardone',
                title: 'Personal'
            }
        };
    }

    async saveAllProfilePicturesToFirestore() {
        try {
            console.log('💾 Saving profile pictures to Firestore...');
            
            const batch = this.db.batch();
            
            Object.entries(this.emailProfilePictures).forEach(([email, data]) => {
                const docRef = this.db.collection('email_profile_pictures').doc(email);
                
                batch.set(docRef, {
                    email: email,
                    url: data.url || '',
                    type: data.type || 'initials',
                    initials: data.initials || 'AV',
                    bgColor: data.bgColor || '#667eea',
                    name: data.name || '',
                    title: data.title || '',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    createdBy: ADMIN_EMAIL || 'admin'
                });
            });
            
            await batch.commit();
            
            console.log('✅ All profile pictures saved to Firestore');
            
        } catch (error) {
            console.error('❌ Error saving profile pictures:', error);
            throw error;
        }
    }

    async saveProfilePictureToFirestore(email, pictureData) {
        try {
            console.log(`💾 Saving profile picture for: ${email}`);
            
            await this.db.collection('email_profile_pictures').doc(email).set({
                email: email,
                url: pictureData.url || '',
                type: pictureData.type || 'initials',
                initials: pictureData.initials || 'AV',
                bgColor: pictureData.bgColor || '#667eea',
                name: pictureData.name || '',
                title: pictureData.title || '',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: ADMIN_EMAIL || 'admin'
            });
            
            console.log('✅ Profile picture saved to Firestore');
            
        } catch (error) {
            console.error('❌ Error saving profile picture:', error);
            throw error;
        }
    }

    displayProfilePicturesManager() {
        const container = document.getElementById('profile-pictures-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        const emailOrder = [
            'raphael.nardone@alphavault-ai.com',
            'newsletter@alphavault-ai.com',
            'contact@alphavault-ai.com',
            'info@alphavault-ai.com',
            'support@alphavault-ai.com',
            'raphnardone@gmail.com'
        ];
        
        emailOrder.forEach(email => {
            if (!this.emailProfilePictures[email]) return;
            
            const data = this.emailProfilePictures[email];
            
            const card = document.createElement('div');
            card.className = 'profile-picture-card';
            card.innerHTML = `
                <div class="profile-picture-preview">
                    ${this.generateProfilePictureHTML(email, 80)}
                </div>
                <div class="profile-picture-info">
                    <div class="profile-name">${data.name || email.split('@')[0]}</div>
                    <div class="profile-email">${email}</div>
                    <div class="profile-title">${data.title || ''}</div>
                </div>
                <div class="profile-picture-actions">
                    <button class="btn-action btn-sm" onclick="adminAnalytics.openProfilePictureModal('${email}')" title="Edit Picture">
                        <i class="fas fa-camera"></i> Change Photo
                    </button>
                </div>
            `;
            
            container.appendChild(card);
        });
        
        console.log('✅ Profile pictures manager displayed');
    }

    generateProfilePictureHTML(email, size = 50) {
        const data = this.emailProfilePictures?.[email];
        
        if (!data) {
            console.warn(`⚠ No profile data for ${email} - using default logo`);
            return `
                <img src="https://raph33ai.github.io/finance-dashboard/assets/images/logo-alphavault.png" 
                    alt="AlphaVault AI" 
                    style="width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: block;" 
                />
            `;
        }
        
        // 🔥 PRIORITÉ : URL EXTERNE (SEULE MÉTHODE COMPATIBLE EMAIL)
        if (data.url && data.url.startsWith('http')) {
            console.log(`✅ Using external URL for ${email}: ${data.url}`);
            return `
                <img src="${data.url}" 
                    alt="${data.name || email}" 
                    style="width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: block;" 
                />
            `;
        }
        
        // ⚠ BASE64 DÉTECTÉ - NE FONCTIONNE PAS DANS LES EMAILS
        if (data.url && data.url.startsWith('data:image')) {
            console.error(`❌ BASE64 detected for ${email} - NOT compatible with email clients!`);
            console.warn(`💡 Run the migration script to fix this issue.`);
        }
        
        // 🔥 FALLBACK : INITIALES
        const initials = data.initials || 'AV';
        const bgColor = data.bgColor || '#667eea';
        
        console.log(`⚠ Using initials fallback for ${email}: ${initials}`);
        
        return `
            <div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: ${bgColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: ${size * 0.4}px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                ${initials}
            </div>
        `;
    }

    // Fonction MD5 pour Gravatar
    md5(string) {
        return CryptoJS.MD5(string.trim().toLowerCase()).toString();
    }

    openProfilePictureModal(email) {
        this.currentEditingEmail = email;
        const data = this.emailProfilePictures[email];
        
        const modal = document.getElementById('profile-picture-modal');
        if (!modal) {
            console.error('❌ Profile picture modal not found');
            return;
        }
        
        document.getElementById('profile-picture-email').textContent = email;
        document.getElementById('profile-picture-name').value = data.name || '';
        document.getElementById('profile-picture-title').value = data.title || '';
        document.getElementById('profile-picture-initials').value = data.initials || '';
        document.getElementById('profile-picture-bg-color').value = data.bgColor || '#667eea';
        document.getElementById('profile-picture-url').value = (data.type === 'url') ? data.url : '';
        
        if (data.type === 'upload' && data.url) {
            document.getElementById('picture-type-upload').checked = true;
        } else if (data.type === 'url' && data.url) {
            document.getElementById('picture-type-url').checked = true;
        } else {
            document.getElementById('picture-type-initials').checked = true;
        }
        
        this.updateProfilePicturePreview();
        
        modal.style.display = 'flex';
        
        console.log(`✅ Profile picture modal opened for: ${email}`);
    }

    closeProfilePictureModal() {
        const modal = document.getElementById('profile-picture-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentEditingEmail = null;
    }

    handleProfilePictureUpload(event) {
        const file = event.target.files[0];
        
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('⚠ Please upload an image file (JPG, PNG, GIF)');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            alert('⚠ Image is too large. Maximum size: 2MB');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const base64Data = e.target.result;
            
            this.currentUploadedImage = base64Data;
            
            document.getElementById('picture-type-upload').checked = true;
            
            this.updateProfilePicturePreview();
            
            console.log('✅ Image uploaded successfully');
        };
        
        reader.readAsDataURL(file);
    }

    updateProfilePicturePreview() {
        const previewContainer = document.getElementById('profile-picture-preview-container');
        if (!previewContainer) return;
        
        const selectedType = document.querySelector('input[name="picture-type"]:checked').value;
        
        const initials = document.getElementById('profile-picture-initials').value || 'AV';
        const bgColor = document.getElementById('profile-picture-bg-color').value || '#667eea';
        const urlValue = document.getElementById('profile-picture-url').value;
        
        let html = '';
        
        if (selectedType === 'initials') {
            html = `
                <div style="width: 100px; height: 100px; border-radius: 50%; background: ${bgColor}; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 40px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);">
                    ${initials}
                </div>
            `;
        } else if (selectedType === 'upload') {
            if (this.currentUploadedImage) {
                html = `
                    <img src="${this.currentUploadedImage}" alt="Preview" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; box-shadow: 0 8px 24px rgba(0,0,0,0.2);" />
                `;
            } else if (this.emailProfilePictures[this.currentEditingEmail]?.url && this.emailProfilePictures[this.currentEditingEmail]?.type === 'upload') {
                html = `
                    <img src="${this.emailProfilePictures[this.currentEditingEmail].url}" alt="Preview" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; box-shadow: 0 8px 24px rgba(0,0,0,0.2);" />
                `;
            } else {
                html = `
                    <div style="width: 100px; height: 100px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 14px; text-align: center; padding: 10px;">
                        No image<br>uploaded
                    </div>
                `;
            }
        } else if (selectedType === 'url') {
            if (urlValue) {
                html = `
                    <img src="${urlValue}" alt="Preview" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; box-shadow: 0 8px 24px rgba(0,0,0,0.2);" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                    <div style="width: 100px; height: 100px; border-radius: 50%; background: #ef4444; display: none; align-items: center; justify-content: center; color: white; font-size: 14px; text-align: center; padding: 10px;">
                        Invalid<br>URL
                    </div>
                `;
            } else {
                html = `
                    <div style="width: 100px; height: 100px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; color: #64748b; font-size: 14px; text-align: center; padding: 10px;">
                        Enter URL<br>below
                    </div>
                `;
            }
        }
        
        previewContainer.innerHTML = html;
    }

    async saveProfilePicture() {
        if (!this.currentEditingEmail) {
            alert('⚠ No email selected');
            return;
        }
        
        try {
            const selectedType = document.querySelector('input[name="picture-type"]:checked').value;
            
            const pictureData = {
                name: document.getElementById('profile-picture-name').value.trim(),
                title: document.getElementById('profile-picture-title').value.trim(),
                initials: document.getElementById('profile-picture-initials').value.trim() || 'AV',
                bgColor: document.getElementById('profile-picture-bg-color').value,
                type: selectedType,
                url: ''
            };
            
            if (selectedType === 'upload') {
                if (this.currentUploadedImage) {
                    pictureData.url = this.currentUploadedImage;
                } else if (this.emailProfilePictures[this.currentEditingEmail]?.url && this.emailProfilePictures[this.currentEditingEmail]?.type === 'upload') {
                    pictureData.url = this.emailProfilePictures[this.currentEditingEmail].url;
                } else {
                    alert('⚠ Please upload an image first');
                    return;
                }
            } else if (selectedType === 'url') {
                pictureData.url = document.getElementById('profile-picture-url').value.trim();
                if (!pictureData.url) {
                    alert('⚠ Please enter an image URL');
                    return;
                }
            }
            
            this.emailProfilePictures[this.currentEditingEmail] = pictureData;
            
            await this.saveProfilePictureToFirestore(this.currentEditingEmail, pictureData);
            
            this.displayProfilePicturesManager();
            this.updateAllSignaturesWithPictures();
            
            this.closeProfilePictureModal();
            
            this.currentUploadedImage = null;
            
            alert(`✅ Profile picture saved for ${this.currentEditingEmail}!`);
            
            console.log(`✅ Profile picture saved for: ${this.currentEditingEmail}`);
            
        } catch (error) {
            console.error('❌ Error saving profile picture:', error);
            alert('⚠ Error saving profile picture: ' + error.message);
        }
    }

    updateAllSignaturesWithPictures() {
        Object.keys(this.emailSignatures).forEach(email => {
            const signature = this.generateSignatureWithPicture(email);
            if (signature) {
                this.emailSignatures[email] = signature;
            }
        });
        
        this.displaySignaturePreviews();
        
        console.log('✅ All signatures updated with profile pictures');
    }

    generateSignatureWithPicture(email) {
        console.log(`✍ Generating signature with picture for: ${email}`);
        
        const pictureData = this.emailProfilePictures?.[email];
        
        if (!pictureData) {
            console.warn(`⚠ No picture data for ${email}`);
            return null;
        }
        
        console.log(`📸 Picture data:`, pictureData);
        
        // Générer le HTML de la photo (60px pour la signature)
        const pictureHTML = this.generateProfilePictureHTML(email, 60);
        
        console.log(`✅ Signature HTML generated for ${email}`);
        
        return `
            <br><br>
            <table cellpadding="0" cellspacing="0" border="0" style="border-top: 2px solid #667eea; padding-top: 16px; margin-top: 20px; font-family: Arial, sans-serif; color: #1e293b; font-size: 14px; line-height: 1.8; border-collapse: collapse;">
                <tr>
                    <td style="padding-right: 16px; vertical-align: top; width: 76px;">
                        ${pictureHTML}
                    </td>
                    <td style="vertical-align: top;">
                        <strong style="color: #667eea; font-size: 17px; display: block; margin-bottom: 4px;">
                            ${pictureData.name || email.split('@')[0]}
                        </strong>
                        <span style="color: #64748b; font-size: 13px; display: block; margin-bottom: 12px;">
                            ${pictureData.title || 'AlphaVault AI'}
                        </span>
                        <div style="color: #64748b; font-size: 13px; line-height: 1.6;">
                            📧 ${email}<br>
                            🌐 <a href="https://alphavault-ai.com" style="color: #667eea; text-decoration: none; font-weight: 600;">alphavault-ai.com</a><br>
                            💼 Real-time market analysis & AI-powered predictions
                        </div>
                    </td>
                </tr>
            </table>
        `;
    }

    deleteProfilePicture() {
        if (!this.currentEditingEmail) return;
        
        if (!confirm(`Delete profile picture for ${this.currentEditingEmail}?`)) return;
        
        const defaultData = this.getDefaultProfilePictures()[this.currentEditingEmail];
        
        if (defaultData) {
            this.emailProfilePictures[this.currentEditingEmail] = defaultData;
            this.saveProfilePictureToFirestore(this.currentEditingEmail, defaultData);
            this.displayProfilePicturesManager();
            this.updateAllSignaturesWithPictures();
            this.closeProfilePictureModal();
            
            alert('✅ Profile picture reset to default!');
        }
    }

    // ========================================
    // 🛠 UTILITY METHODS
    // ========================================

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    updateStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Admin Analytics PRO v6.0...');
    console.log('📊 Initializing comprehensive analytics dashboard...');
    console.log('🗄 Cache & Rate Limiting enabled');
    console.log('🔥 Worker v4.4 compatible');
    
    window.adminAnalytics = new AdminAnalyticsPro();
    
    console.log('✅ Admin Analytics instance created and attached to window.adminAnalytics');
});

// 🔍 DIAGNOSTIC TOOL
function diagnoseData() {
    console.log('🔍 ========================================');
    console.log('🔍 DATA DIAGNOSTIC');
    console.log('🔍 ========================================');
    
    const analytics = window.adminAnalytics;
    
    if (!analytics) {
        console.error('❌ Admin Analytics NOT INITIALIZED');
        return;
    }
    
    console.log('✅ Admin Analytics instance found');
    console.log(`📊 Users loaded: ${analytics.allUsersData.length}`);
    console.log(`📊 Users detailed: ${analytics.allUsersDetailedData.length}`);
    console.log(`📊 Visits: ${analytics.allVisitsData.length}`);
    console.log(`📊 Payments: ${analytics.allPaymentsData.length}`);
    console.log(`📊 Activities: ${analytics.allActivityData.length}`);
    console.log(`📊 Watchlists: ${analytics.allWatchlistsData.length}`);
    console.log(`📊 Portfolios: ${analytics.allPortfoliosData.length}`);
    console.log(`📊 Newsletter: ${analytics.allNewsletterSubscribers.length}`);
    console.log(`📊 Sessions: ${analytics.sessionData.length}`);
    console.log(`📊 Non-customers: ${analytics.nonCustomerVisitors.length}`);
    console.log(`📊 Potential customers: ${analytics.potentialCustomers.length}`);
    console.log(`📊 Stripe data:`, analytics.stripeData ? '✅ Loaded' : '❌ NULL');
    console.log(`📊 Cloudflare data:`, analytics.cloudflareData ? '✅ Loaded' : '❌ NULL');
    
    console.log('🔍 Checking DOM elements...');
    const elementsToCheck = [
        'total-users',
        'recent-users-body',
        'users-management-body',
        'registrations-chart',
        'plans-chart',
        'cf-requests-chart',
        'stripe-subscriptions-chart'
    ];
    
    elementsToCheck.forEach(id => {
        const el = document.getElementById(id);
        console.log(`   ${id}: ${el ? '✅ Found' : '❌ NOT FOUND'}`);
    });
    
    console.log('🔍 ========================================');
}

setTimeout(() => {
    console.log('⏰ Running automatic diagnostic...');
    diagnoseData();
}, 5000);

function exportAnalyticsData(type) {
    if (window.adminAnalytics) {
        window.adminAnalytics.exportData(type);
    } else {
        console.error('❌ Admin Analytics not initialized');
        alert('Analytics system not ready. Please wait...');
    }
}