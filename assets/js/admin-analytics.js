// ========================================
// ADMIN ANALYTICS PRO - ULTRA POWERFUL DASHBOARD v5.1
// ✅ Système de Cache & Rate Limiting intégré
// ✅ Correction complète des erreurs
// ✅ Tableau général des utilisateurs avec actions admin
// ✅ Système de gestion d'accès
// ✅ Menu principal restructuré
// ========================================

// 🔐 CONFIGURATION
const ADMIN_EMAIL = 'raphnardone@gmail.com';
const WORKER_URL = 'https://admin-analytics-api.raphnardone.workers.dev';
const STRIPE_PUBLIC_KEY = 'pk_live_51SU1qnDxR6DPBfOfX6yJYr9Qzh40aNGrn1TSZxI5q0Q0m9hsgXmMQFq2TErynzuUKOivH4T3DJ1FjKy683WsqQAR00tAMRJGtk';

// 🆕 CONFIGURATION DU CACHE & RATE LIMITING
const CACHE_CONFIG = {
    // Durée de validité du cache (en millisecondes)
    // Par défaut: 6 heures = 6 * 60 * 60 * 1000
    CACHE_DURATION: 6 * 60 * 60 * 1000, // ⬅ 6 heures (modifiable)
    
    // Nombre maximum d'appels Worker autorisés par jour
    MAX_DAILY_CALLS: 50, // ⬅ Limite quotidienne (modifiable)
    
    // Activer/désactiver le cache
    ENABLE_CACHE: true, // ⬅ Mettre à false pour désactiver le cache
    
    // Activer/désactiver le rate limiting
    ENABLE_RATE_LIMIT: true, // ⬅ Mettre à false pour désactiver la limite
    
    // Endpoints à mettre en cache (tous par défaut)
    CACHED_ENDPOINTS: [
        'stripe-analytics',
        'cloudflare-analytics',
        'cloudflare-geo',
        'cloudflare-devices',
        'cloudflare-pages',
        'cloudflare-visitors'
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
    
    // Vérifier si le cache est activé
    isCacheEnabled() {
        return this.config.ENABLE_CACHE;
    }
    
    // Vérifier si le rate limiting est activé
    isRateLimitEnabled() {
        return this.config.ENABLE_RATE_LIMIT;
    }
    
    // Obtenir des données du cache
    get(key) {
        if (!this.isCacheEnabled()) return null;
        
        try {
            const cachedItem = localStorage.getItem(this.storagePrefix + key);
            if (!cachedItem) return null;
            
            const { data, timestamp } = JSON.parse(cachedItem);
            const now = Date.now();
            
            // Vérifier si le cache est encore valide
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
    
    // Stocker des données dans le cache
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
    
    // Supprimer une entrée du cache
    remove(key) {
        localStorage.removeItem(this.storagePrefix + key);
    }
    
    // Vider tout le cache
    clearAll() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
                localStorage.removeItem(key);
            }
        });
        // Réinitialiser aussi le compteur d'appels
        localStorage.removeItem(this.callsCountKey);
        localStorage.removeItem(this.callsDateKey);
        console.log('🗑 All cache cleared');
    }
    
    // Vérifier le nombre d'appels aujourd'hui
    canMakeCall() {
        if (!this.isRateLimitEnabled()) return true;
        
        const today = new Date().toDateString();
        const storedDate = localStorage.getItem(this.callsDateKey);
        let callsCount = parseInt(localStorage.getItem(this.callsCountKey) || '0');
        
        // Réinitialiser le compteur si on est un nouveau jour
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
    
    // Incrémenter le compteur d'appels
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
    
    // Obtenir les statistiques de cache
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
            cacheDuration: this.config.CACHE_DURATION / (60 * 60 * 1000) // en heures
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
        
        // Calculer les indices de début et fin
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.data.length);
        
        // Afficher les données de la page actuelle
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
        
        // Mettre à jour les contrôles de pagination
        this.renderControls();
    }
    
    renderControls() {
        const controlsId = `${this.tableId}-pagination-controls`;
        let controlsContainer = document.getElementById(controlsId);
        
        if (!controlsContainer) {
            // Créer le conteneur de contrôles
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

// Global registry for pagination managers
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
        
        // 🆕 CACHE MANAGER
        this.cache = new CacheManager(CACHE_CONFIG);
        
        // Third-Party Data
        this.stripeData = null;
        this.cloudflareData = null;
        this.cloudflareGeo = null;
        this.cloudflareDevices = null;
        this.cloudflarePages = null;
        this.cloudflareVisitors = null;
        
        // Internal Analytics Data
        this.allUsersData = [];
        this.allUsersDetailedData = []; // 🆕 Données utilisateurs enrichies
        this.allVisitsData = [];
        this.allPaymentsData = [];
        this.allActivityData = [];
        this.nonCustomerVisitors = [];
        this.potentialCustomers = [];
        
        // Advanced Metrics
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
        
        // Current section
        this.currentSection = 'dashboard';
        
        // Current MRR
        this.currentMRR = 0;
        
        this.init();
    }

    async init() {
        console.log('🔐 Initializing Admin Analytics PRO v5.1...');
        
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
            
            // 🆕 AFFICHER LE DASHBOARD AVANT DE CHARGER
            document.getElementById('loading-screen')?.style.setProperty('display', 'none');
            document.getElementById('admin-dashboard')?.style.setProperty('display', 'block');
            
            // Load Leaflet.js for maps
            await this.loadLeafletLibrary();
            
            // 🆕 Afficher les stats de cache
            this.displayCacheStats();
            
            // 🆕 INITIALISER LES SECTIONS AVANT LE CHARGEMENT
            this.initSectionTabs();
            
            // 🆕 AFFICHER LA SECTION DASHBOARD PAR DÉFAUT
            this.showSection('dashboard');
            
            // 🔥 CHARGER TOUTES LES DONNÉES
            console.log('📊 Starting data loading...');
            await this.loadAllData();
            console.log('✅ Data loading complete');
            
            // 🆕 AFFICHER EXPLICITEMENT LES TABLEAUX/GRAPHIQUES
            await this.refreshAllDisplays();
            
            this.initEventListeners();
            
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
        
        // Export buttons
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
            'exportPaymentsBtn': () => this.exportData('payments')
        };
        
        Object.entries(exportButtons).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handler);
                console.log(`✅ Export button registered: ${id}`);
            }
        });
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshDataBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
                refreshBtn.disabled = true;
                await this.loadAllData();
                this.displayCacheStats(); // 🆕 Mettre à jour les stats
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
                refreshBtn.disabled = false;
            });
        }
        
        // 🆕 BOUTON POUR VIDER LE CACHE
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

    // 🆕 AFFICHER LES STATS DE CACHE
    displayCacheStats() {
        const stats = this.cache.getStats();
        
        console.log('📊 Cache Statistics:');
        console.log(`   - API Calls today: ${stats.callsToday}/${stats.maxCalls}`);
        console.log(`   - Remaining calls: ${stats.remaining}`);
        console.log(`   - Cache enabled: ${stats.cacheEnabled}`);
        console.log(`   - Cache duration: ${stats.cacheDuration}h`);
        
        // Afficher dans l'UI si l'élément existe
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

    // 🆕 SYSTÈME DE NAVIGATION PAR SECTIONS
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
        
        // Update active tab
        document.querySelectorAll('.section-tab, .main-tab, [data-section]').forEach(btn => {
            if (btn.dataset.section === sectionName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Show target section, hide others
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
        
        // 🆕 VÉRIFIER SI LA SECTION EXISTE
        if (!sectionFound) {
            console.warn(`⚠ Section "${sectionName}" NOT FOUND in DOM`);
        }
        
        // 🆕 Charger les données spécifiques si nécessaire
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
                this.loadCloudflareVisitors()
            ]);
            console.log('✅ Third-party analytics loaded');
            
            // SECTION 2: FIREBASE INTERNAL ANALYTICS
            console.log('🔥 Loading Firebase data...');
            await Promise.all([
                this.loadUsersStats(),
                this.loadVisitsStats(),
                this.loadRevenueStats(),
                this.loadEngagementStats()
            ]);
            console.log('✅ Firebase core stats loaded');
            
            console.log(`📊 Total users loaded: ${this.allUsersData.length}`);
            console.log(`📊 Total visits loaded: ${this.allVisitsData.length}`);
            console.log(`📊 Total payments loaded: ${this.allPaymentsData.length}`);
            console.log(`📊 Total activities loaded: ${this.allActivityData.length}`);
            
            // SECTION 3: ADVANCED ANALYTICS
            console.log('📈 Loading advanced analytics...');
            await Promise.all([
                this.loadSessionAnalytics(),
                this.loadBounceRateAnalytics(),
                this.loadConversionPaths(),
                this.loadHeatmapData()
            ]);
            console.log('✅ Advanced analytics loaded');
            
            // SECTION 4: CHARTS
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
            
            // SECTION 5: TABLES
            console.log('📋 Loading tables...');
            await Promise.all([
                this.loadRecentUsers(),
                this.loadRecentActivity(),
                this.loadTopUsers(),
                this.loadUserSimulations()
            ]);
            console.log('✅ Tables loaded');
            
            // SECTION 6: ADVANCED FEATURES
            console.log('🤖 Loading advanced features...');
            await Promise.all([
                this.loadConversionFunnel(),
                this.loadLTVAnalysis(),
                this.loadMLPredictions()
            ]);
            console.log('✅ Advanced features loaded');
            
            // SECTION 7: NON-CUSTOMERS
            console.log('👥 Loading non-customer data...');
            await this.loadNonCustomerVisitors();
            await this.loadPotentialCustomers();
            console.log('✅ Non-customer data loaded');
            
            // SECTION 8: DETAILED USERS
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

    // 🆕 FONCTION POUR RAFRAÎCHIR TOUS LES AFFICHAGES
    async refreshAllDisplays() {
        console.log('🔄 Refreshing all displays...');
        
        try {
            // Rafraîchir les stats affichées
            this.displayCacheStats();
            
            // 🆕 AFFICHER LES MÉTRIQUES THIRD-PARTY
            if (this.stripeData) {
                this.displayStripeMetrics(this.stripeData);
            }
            
            if (this.cloudflareData) {
                this.displayCloudflareAnalytics(this.cloudflareData);
            }

            if (this.cloudflareData) {
                this.displayCloudflareAnalytics(this.cloudflareData);
            }

            // 🔥 APPELER displayCloudflareExtras() APRÈS QUE TOUTES LES DONNÉES CLOUDFLARE SOIENT CHARGÉES
            if (this.cloudflareGeo || this.cloudflarePages) {
                this.displayCloudflareExtras();
            }

            // Créer la carte géographique
            if (this.cloudflareGeo && this.cloudflareGeo.length > 0) {
                this.createGeoMap();
            }
            
            // Rafraîchir les tableaux
            await this.loadRecentUsers();
            await this.loadRecentActivity();
            await this.loadTopUsers();
            // 🆕 FORCER L'AFFICHAGE DES VISITEURS NON-CLIENTS
            this.displayNonCustomerVisitors();
            this.displayPotentialCustomers();
            this.createLeadsCharts(); // 🆕 AJOUTER ICI
            
            console.log('✅ All displays refreshed successfully');
            
        } catch (error) {
            console.error('❌ Error refreshing displays:', error);
        }
    }

    // ========================================
    // SECTION 1: THIRD-PARTY ANALYTICS (avec Cache & Rate Limiting)
    // ========================================
    
    async loadStripeMetrics() {
        try {
            console.log('💳 Loading Stripe metrics...');
            
            // 🆕 VÉRIFIER LE CACHE
            const cacheKey = 'stripe-analytics';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                this.stripeData = cachedData;
                this.displayStripeMetrics(cachedData);
                return;
            }
            
            // 🆕 VÉRIFIER LE RATE LIMIT
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - using cached data only');
                return;
            }
            
            // APPEL API RÉEL
            this.cache.incrementCallCount();
            
            const response = await fetch(`${WORKER_URL}/stripe-analytics`);
            
            if (!response.ok) {
                throw new Error(`Stripe API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 🆕 SAUVEGARDER DANS LE CACHE
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
        
        // 🆕 CRÉER UN GRAPHIQUE STRIPE SI L'ÉLÉMENT EXISTE
        this.createStripeChart(data);
        
        console.log('✅ Stripe metrics displayed');
    }

    async loadCloudflareAnalytics() {
        try {
            console.log('☁ Loading Cloudflare analytics...');
            
            // 🆕 VÉRIFIER LE CACHE
            const cacheKey = 'cloudflare-analytics';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                this.cloudflareData = cachedData;
                this.displayCloudflareAnalytics(cachedData);
                return;
            }
            
            // 🆕 VÉRIFIER LE RATE LIMIT
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - skipping Cloudflare analytics');
                return;
            }
            
            // APPEL API RÉEL
            this.cache.incrementCallCount();
            
            const response = await fetch(`${WORKER_URL}/cloudflare-analytics?days=30`);
            
            if (!response.ok) {
                throw new Error(`Cloudflare API error: ${response.status}`);
            }
            
            const result = await response.json();
            
            // 🆕 SAUVEGARDER DANS LE CACHE
            this.cache.set(cacheKey, result.data);
            
            this.cloudflareData = result.data;
            this.displayCloudflareAnalytics(result.data);
            
            console.log('✅ Cloudflare analytics loaded from API');
            
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
        
        // 🔥 CRÉER DES GRAPHIQUES CLOUDFLARE
        this.createCloudflareCharts(data);
        
        // ❌ NE PLUS APPELER displayCloudflareExtras() ICI
        
        console.log('✅ Cloudflare analytics displayed');
    }

    // 🆕 AFFICHER TOP COUNTRY & TOP PAGES
    displayCloudflareExtras() {
        console.log('📊 Displaying Cloudflare extras (Top Country & Pages)...');
        
        // ============================================
        // TOP COUNTRY KPI
        // ============================================
        if (this.cloudflareGeo && this.cloudflareGeo.length > 0) {
            // Trier par nombre de requêtes (décroissant)
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
        
        // ============================================
        // TOP PAGES TABLE
        // ============================================
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
        
        // Trier par nombre de requêtes (décroissant)
        const sortedPages = [...this.cloudflarePages].sort((a, b) => b.requests - a.requests);
        const topPages = sortedPages.slice(0, 10);
        
        console.log(`📄 Displaying top ${topPages.length} pages`);
        
        topPages.forEach((page, index) => {
        const row = document.createElement('tr');
        
        // 🔥 TRANSFORMER "/" EN "Home Page"
        let pageName = page.path || 'N/A';
        if (pageName === '/') {
            pageName = '🏠 Home Page';
        } else if (pageName.endsWith('.html')) {
            // Nettoyer les noms de fichiers HTML
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

    // 🆕 CRÉER LA CARTE GÉOGRAPHIQUE
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
        
        // Détruire la carte existante si elle existe
        if (this.maps.geoMap) {
            this.maps.geoMap.remove();
        }
        
        // Créer la carte
        const map = L.map('geo-map').setView([20, 0], 2);
        
        // Ajouter la couche de tuiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);
        
        // Coordonnées approximatives des pays
        const countryCoords = {
            'US': [37.0902, -95.7129],
            'United States': [37.0902, -95.7129],
            'FR': [46.2276, 2.2137],
            'France': [46.2276, 2.2137],
            'GB': [55.3781, -3.4360],
            'United Kingdom': [55.3781, -3.4360],
            'DE': [51.1657, 10.4515],
            'Germany': [51.1657, 10.4515],
            'CA': [56.1304, -106.3468],
            'Canada': [56.1304, -106.3468],
            'JP': [36.2048, 138.2529],
            'Japan': [36.2048, 138.2529],
            'CN': [35.8617, 104.1954],
            'China': [35.8617, 104.1954],
            'IN': [20.5937, 78.9629],
            'India': [20.5937, 78.9629],
            'BR': [-14.2350, -51.9253],
            'Brazil': [-14.2350, -51.9253],
            'AU': [-25.2744, 133.7751],
            'Australia': [-25.2744, 133.7751]
        };
        
        // Ajouter des marqueurs pour chaque pays
        this.cloudflareGeo.forEach(country => {
            const coords = countryCoords[country.country] || countryCoords[country.countryCode];
            
            if (coords) {
                const requests = country.requests || 0;
                
                // Taille du cercle proportionnelle aux requêtes
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
                    Uniques: ${(country.uniques || 0).toLocaleString()}
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
            
            this.cache.set(cacheKey, result.devices);
            this.cloudflareDevices = result.devices;
            
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

    async loadCloudflareVisitors() {
        try {
            console.log('👥 Loading Cloudflare Visitors...');
            
            const cacheKey = 'cloudflare-visitors';
            const cachedData = this.cache.get(cacheKey);
            
            if (cachedData) {
                this.cloudflareVisitors = cachedData;
                return;
            }
            
            if (!this.cache.canMakeCall()) {
                console.warn('⚠ Rate limit reached - skipping Cloudflare Visitors');
                return;
            }
            
            this.cache.incrementCallCount();
            
            const response = await fetch(`${WORKER_URL}/cloudflare-visitors?days=30`);
            
            if (!response.ok) {
                throw new Error(`Cloudflare Visitors error: ${response.status}`);
            }
            
            const result = await response.json();
            
            this.cache.set(cacheKey, result.visitors);
            this.cloudflareVisitors = result.visitors;
            
            console.log('✅ Cloudflare Visitors loaded from API');
            
        } catch (error) {
            console.error('❌ Error loading Cloudflare Visitors:', error);
        }
    }

    // ========================================
    // SECTION 2: INTERNAL ANALYTICS (FIREBASE)
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

            // 🔥 CALCULER LES SUBSCRIPTIONS ACTIVES DEPUIS LES USERS
            console.log('📊 Calculating active subscriptions from users...');

            this.allUsersData.forEach(user => {
                const plan = user.plan || 'basic';
                
                // Debug : Logger chaque user avec son plan
                console.log(`   User ${user.email}: plan="${plan}"`);
                
                // Compter TOUS les users avec un plan (basic, pro, platinum)
                // Un user est considéré comme "actif" s'il a un plan assigné
                if (plan && (plan === 'basic' || plan === 'pro' || plan === 'platinum')) {
                    activeSubscriptions++;
                    const planPrice = planPrices[plan] || 0;
                    mrr += planPrice;
                    
                    console.log(`   ✅ Counted as active: ${plan} (MRR contribution: $${planPrice})`);
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
    // CHARTS
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

    // ========================================
    // TABLES
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
            
            // 🔥 UTILISER LES VISITES COMME ACTIVITÉ RÉELLE
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
            
            // Trier par timestamp (plus récent en premier)
            const recentVisits = this.allVisitsData
                .filter(v => v.timestamp)
                .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate())
                .slice(0, 20);
            
            console.log(`📊 Displaying ${recentVisits.length} recent visits`);
            
            recentVisits.forEach(visit => {
                const row = document.createElement('tr');
                
                // User : Email si userId existe, sinon IP ou "Anonymous"
                let userDisplay = 'Anonymous';
                if (visit.userId) {
                    const user = this.allUsersData.find(u => u.id === visit.userId);
                    userDisplay = user?.email ? user.email.substring(0, 20) + '...' : visit.userId.substring(0, 8) + '...';
                } else if (visit.ip) {
                    userDisplay = `IP: ${visit.ip}`;
                }
                
                // Action : Type de visite
                const action = visit.page ? 'Page View' : 'Visit';
                
                // Page : Nettoyer le nom de la page
                let page = visit.page || visit.url || 'N/A';
                if (page.includes('.html')) {
                    page = page.replace('.html', '').replace(/\//g, '');
                }
                if (page.length > 30) {
                    page = page.substring(0, 30) + '...';
                }
                
                // Timestamp
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
    // ML PREDICTIONS
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
    // 🆕 USERS MANAGEMENT (DETAILED DATA)
    // ========================================
    
    async loadUsersDetailedData() {
        try {
            console.log('👥 Loading detailed users data...');
            
            this.allUsersDetailedData = [];
            
            for (const user of this.allUsersData) {
                // Récupérer les simulations
                const simulationsSnapshot = await this.db
                    .collection('users')
                    .doc(user.id)
                    .collection('simulations')
                    .get();
                
                // Compter les visites
                const userVisits = this.allVisitsData.filter(v => v.userId === user.id).length;
                
                // Compter les activités
                const userActivities = this.allActivityData.filter(a => a.userId === user.id).length;
                
                // Compter les requêtes API (si disponible)
                const apiRequestsSnapshot = await this.db
                    .collection('users')
                    .doc(user.id)
                    .collection('api_requests')
                    .get();
                
                // Récupérer le statut de ban
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
            
            // Trier par date d'inscription (plus récent en premier)
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
            
            // 🆕 CRÉER LE PAGINATION MANAGER
            const renderUserRow = (user, index, tbody) => {
                const row = document.createElement('tr');
                
                // Appliquer un style si l'utilisateur est banni
                if (user.isBanned) {
                    row.style.backgroundColor = '#fee2e2';
                    row.style.opacity = '0.7';
                }
                
                const createdAt = user.createdAt ? user.createdAt.toDate().toLocaleDateString('en-US') : 'N/A';
                const lastLogin = user.lastLogin ? user.lastLogin.toDate().toLocaleDateString('en-US') : 'Never';
                
                // Badge de plan
                const planBadge = `<span class="plan-badge plan-${user.plan}">${user.plan.toUpperCase()}</span>`;
                
                // Badge de statut
                let statusBadge = '';
                if (user.isBanned) {
                    statusBadge = '<span class="status-badge status-banned">🚫 BANNED</span>';
                } else if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') {
                    statusBadge = '<span class="status-badge status-active">✅ Active</span>';
                } else {
                    statusBadge = '<span class="status-badge status-inactive">❌ Inactive</span>';
                }
                
                // Bouton d'action
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
            
            // Créer ou mettre à jour le pagination manager
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
            
            // Rendre la première page
            window.paginationManagers['users-management-body'].render();
            
            // Mettre à jour les statistiques
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
            console.log(`👤 Current admin: ${this.auth.currentUser?.email}`);
            
            // Vérifier que l'utilisateur admin est bien connecté
            if (!this.auth.currentUser) {
                alert('❌ Erreur : Vous n\'êtes pas connecté');
                return;
            }
            
            if (this.auth.currentUser.email !== ADMIN_EMAIL) {
                alert('❌ Erreur : Accès admin refusé');
                return;
            }
            
            const reason = prompt('Raison du bannissement (optionnel):');
            
            if (reason === null) {
                console.log('❌ Ban canceled by user');
                return; // Annulé
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
            
            // 🔥 METTRE À JOUR FIRESTORE
            await this.db.collection('users').doc(userId).update({
                isBanned: true,
                bannedAt: firebase.firestore.FieldValue.serverTimestamp(),
                bannedReason: reason || 'No reason provided',
                subscriptionStatus: 'banned',
                bannedBy: ADMIN_EMAIL
            });
            
            console.log('✅ User document updated');
            
            // 🔥 ENREGISTRER DANS LES LOGS ADMIN
            await this.db.collection('admin_actions').add({
                action: 'ban_user',
                userId: userId,
                adminEmail: ADMIN_EMAIL,
                reason: reason || 'No reason provided',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ Admin action logged');
            
            alert('✅ Utilisateur banni avec succès !');
            
            // 🔄 RECHARGER LES DONNÉES
            console.log('🔄 Reloading user data...');
            await this.loadUsersDetailedData();
            await this.loadUsersManagementTable();
            
            console.log('✅ User ban complete');
            
        } catch (error) {
            console.error('❌ Error banning user:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
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
            console.log(`👤 Current admin: ${this.auth.currentUser?.email}`);
            
            // Vérifier que l'utilisateur admin est bien connecté
            if (!this.auth.currentUser) {
                alert('❌ Erreur : Vous n\'êtes pas connecté');
                return;
            }
            
            if (this.auth.currentUser.email !== ADMIN_EMAIL) {
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
            
            // 🔥 METTRE À JOUR FIRESTORE
            await this.db.collection('users').doc(userId).update({
                isBanned: false,
                bannedAt: null,
                bannedReason: null,
                subscriptionStatus: 'inactive',
                unbannedBy: ADMIN_EMAIL,
                unbannedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ User document updated');
            
            // 🔥 ENREGISTRER DANS LES LOGS ADMIN
            await this.db.collection('admin_actions').add({
                action: 'unban_user',
                userId: userId,
                adminEmail: ADMIN_EMAIL,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ Admin action logged');
            
            alert('✅ Utilisateur débanni avec succès !');
            
            // 🔄 RECHARGER LES DONNÉES
            console.log('🔄 Reloading user data...');
            await this.loadUsersDetailedData();
            await this.loadUsersManagementTable();
            
            console.log('✅ User unban complete');
            
        } catch (error) {
            console.error('❌ Error unbanning user:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            
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
    // NON-CUSTOMER VISITORS & POTENTIAL
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
        
        // 🆕 CRÉER LE PAGINATION MANAGER
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
        
        // Créer ou mettre à jour le pagination manager
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
        
        // Rendre la première page
        window.paginationManagers['potential-customers-body'].render();
        
        console.log(`✅ Potential customers displayed with pagination (${this.potentialCustomers.length} leads)`);
    }

    // 🆕 CRÉER LES GRAPHIQUES LEADS
    createLeadsCharts() {
        // Graphique 1 : Lead Score Distribution
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
                        'rgba(239, 68, 68, 0.8)',    // Red for hot
                        'rgba(245, 158, 11, 0.8)',   // Orange for warm
                        'rgba(6, 182, 212, 0.8)'     // Cyan for cold
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
        
        // Graphique 2 : Non-Customers by Country
        const countryCanvas = document.getElementById('non-customer-countries-chart');
        if (countryCanvas && this.nonCustomerVisitors && this.nonCustomerVisitors.length > 0) {
            console.log('📊 Creating non-customers by country chart...');
            
            // Compter par pays
            const countryVisits = {};
            this.nonCustomerVisitors.forEach(visitor => {
                const country = visitor.country || 'Unknown';
                countryVisits[country] = (countryVisits[country] || 0) + visitor.visits;
            });
            
            // Top 6 pays
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
        
        // Calculer et afficher Avg Lead Score
        if (this.potentialCustomers && this.potentialCustomers.length > 0) {
            const avgScore = this.potentialCustomers.reduce((sum, c) => sum + c.score, 0) / this.potentialCustomers.length;
            this.updateStat('avg-lead-score', avgScore.toFixed(1));
        }
    }

    // ========================================
    // ALERTS
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
                // Note: Envoi d'email désactivé par défaut (économie d'appels)
                // await this.sendAlertEmail(alerts);
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
            
            // 🆕 VÉRIFIER LE RATE LIMIT
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
    // CSV EXPORT
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
            this.exportData('conversion-paths')
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
    // HELPER FUNCTIONS
    // ========================================
    
    updateStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        } else {
            // console.warn(`⚠ Element not found: ${elementId}`);
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

    // 🆕 CRÉER GRAPHIQUE STRIPE
    createStripeChart(data) {
        if (!data || !data.subscriptions) return;
        
        const canvas = document.getElementById('stripe-subscriptions-chart');
        if (!canvas) {
            console.warn('⚠ Stripe chart canvas not found (id: stripe-subscriptions-chart)');
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
                    'rgba(16, 185, 129, 0.8)',  // Green for active
                    'rgba(59, 130, 246, 0.8)',   // Blue for trialing
                    'rgba(239, 68, 68, 0.8)',    // Red for canceled
                    'rgba(245, 158, 11, 0.8)'    // Orange for past due
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

    // 🆕 CRÉER GRAPHIQUES CLOUDFLARE
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
        } else {
            console.warn('⚠ Cloudflare requests chart canvas not found (id: cf-requests-chart)');
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
        } else {
            console.warn('⚠ Cloudflare geo chart canvas not found (id: cf-geo-chart)');
        }
        
        // Graphique 3 : Device Distribution
        const deviceCanvas = document.getElementById('cf-devices-chart');
        if (deviceCanvas && this.cloudflareDevices && this.cloudflareDevices.length > 0) {
            console.log('📊 Creating Cloudflare devices chart...');
            
            this.createChart('cf-devices-chart', 'pie', {
                labels: this.cloudflareDevices.map(d => d.type),
                datasets: [{
                    data: this.cloudflareDevices.map(d => d.requests),
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
        } else {
            console.warn('⚠ Cloudflare devices chart canvas not found (id: cf-devices-chart)');
        }
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Admin Analytics PRO v5.1...');
    console.log('📊 Initializing comprehensive analytics dashboard...');
    console.log('🗄 Cache & Rate Limiting enabled');
    
    window.adminAnalytics = new AdminAnalyticsPro();
    
    console.log('✅ Admin Analytics instance created and attached to window.adminAnalytics');
});

// 🔍 DIAGNOSTIC TOOL - À SUPPRIMER APRÈS LE DEBUG
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
    console.log(`📊 Sessions: ${analytics.sessionData.length}`);
    console.log(`📊 Non-customers: ${analytics.nonCustomerVisitors.length}`);
    console.log(`📊 Potential customers: ${analytics.potentialCustomers.length}`);
    console.log(`📊 Stripe data:`, analytics.stripeData ? '✅ Loaded' : '❌ NULL');
    console.log(`📊 Cloudflare data:`, analytics.cloudflareData ? '✅ Loaded' : '❌ NULL');
    
    // Vérifier les éléments DOM
    console.log('🔍 Checking DOM elements...');
    const elementsToCheck = [
        'total-users',
        'recent-users-body',
        'users-management-body',
        'registrations-chart',
        'plans-chart'
    ];
    
    elementsToCheck.forEach(id => {
        const el = document.getElementById(id);
        console.log(`   ${id}: ${el ? '✅ Found' : '❌ NOT FOUND'}`);
    });
    
    console.log('🔍 ========================================');
}

// Appeler le diagnostic après 5 secondes
setTimeout(() => {
    console.log('⏰ Running automatic diagnostic...');
    diagnoseData();
}, 5000);

// Global function for export (called from HTML buttons)
function exportAnalyticsData(type) {
    if (window.adminAnalytics) {
        window.adminAnalytics.exportData(type);
    } else {
        console.error('❌ Admin Analytics not initialized');
        alert('Analytics system not ready. Please wait...');
    }
}