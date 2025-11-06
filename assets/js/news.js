/* ================================================
   NEWS.JS - Financial News with Cloud Backend
   Version Cloud avec Cloudflare Workers & Firebase
   ================================================ */

const NewsApp = {
    // API Client
    apiClient: null,
    
    // Current State
    currentCategory: 'general',
    currentSymbol: '',
    searchQuery: '',
    sortBy: 'newest',
    isLoading: false,
    lastUpdate: null,
    
    // News Data
    newsData: {
        all: [],
        filtered: [],
        displayedCount: 0
    },
    
    // User Preferences (CLOUD)
    preferences: {
        favoriteCategories: [],
        hiddenSources: [],
        autoRefresh: true,
        refreshInterval: 300000 // 5 minutes
    },
    
    // Search functionality
    selectedSuggestionIndex: -1,
    searchTimeout: null,
    
    // Auto-refresh
    refreshInterval: null,
    
    // ========== INITIALIZATION (MODIFIÉ POUR CLOUD) ==========
    
    async init() {
        try {
            console.log('🚀 Initializing News App...');
            
            // ✅ CORRECTION : Charger le thème EN PREMIER
            this.loadThemePreference();
            
            // Attendre que l'utilisateur soit authentifié
            await this.waitForAuth();
            
            // Initialiser le client API
            this.apiClient = new FinanceAPIClient({
                baseURL: APP_CONFIG.API_BASE_URL,
                cacheDuration: APP_CONFIG.CACHE_DURATION,
                maxRetries: APP_CONFIG.MAX_RETRIES,
                onLoadingChange: (isLoading) => {
                    this.showLoading(isLoading);
                }
            });
            
            // Rendre accessible globalement
            window.newsApiClient = this.apiClient;
            
            // Setup event listeners
            this.setupEventListeners();
            this.setupSearchListeners();
            
            // ✅ Charger les préférences utilisateur depuis le cloud
            await this.loadUserPreferences();
            
            // ✅ Charger les news
            await this.fetchNews();
            
            // ✅ Auto-refresh si activé
            if (this.preferences.autoRefresh) {
                this.startAutoRefresh();
            }
            
            // Update last update time
            this.updateLastUpdateTime();
            
            console.log('✅ News App Ready');
            
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.showNotification('Failed to initialize News App', 'error');
        }
    },
    
    /**
     * ✅ Attend que Firebase Auth soit prêt
     */
    async waitForAuth() {
        return new Promise((resolve) => {
            if (!firebase || !firebase.auth) {
                console.warn('⚠️ Firebase not available');
                resolve();
                return;
            }
            
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ User authenticated for News App:', user.email);
                    unsubscribe();
                    resolve();
                } else {
                    console.log('⚠️ No user authenticated, using guest mode');
                    unsubscribe();
                    resolve();
                }
            });
            
            // Timeout de sécurité
            setTimeout(() => {
                unsubscribe();
                resolve();
            }, 3000);
        });
    },
    
    /**
     * ✅ Charge les préférences utilisateur depuis Firestore
     */
    async loadUserPreferences() {
        if (!firebase || !firebase.auth || !firebase.firestore) {
            console.warn('⚠️ Firebase not available, using default preferences');
            this.loadPreferencesFromStorage();
            return;
        }
        
        const user = firebase.auth().currentUser;
        if (!user) {
            console.log('ℹ️ No authenticated user, using localStorage');
            this.loadPreferencesFromStorage();
            return;
        }
        
        try {
            const db = firebase.firestore();
            const docRef = db.collection('userPreferences').doc(user.uid);
            const doc = await docRef.get();
            
            if (doc.exists) {
                const data = doc.data();
                if (data.newsPreferences) {
                    this.preferences = {
                        ...this.preferences,
                        ...data.newsPreferences
                    };
                    console.log('✅ Loaded news preferences from cloud');
                }
            } else {
                console.log('ℹ️ No cloud preferences found, using defaults');
            }
        } catch (error) {
            console.error('❌ Error loading preferences from cloud:', error);
            this.loadPreferencesFromStorage();
        }
    },
    
    /**
     * ✅ Sauvegarde les préférences dans Firestore
     */
    async saveUserPreferences() {
        // Sauvegarder dans localStorage (fallback)
        this.savePreferencesToStorage();
        
        if (!firebase || !firebase.auth || !firebase.firestore) {
            return;
        }
        
        const user = firebase.auth().currentUser;
        if (!user) {
            return;
        }
        
        try {
            const db = firebase.firestore();
            const docRef = db.collection('userPreferences').doc(user.uid);
            
            await docRef.set({
                newsPreferences: this.preferences,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('✅ Preferences saved to cloud');
            
        } catch (error) {
            console.error('❌ Error saving preferences to cloud:', error);
        }
    },
    
    /**
     * ✅ Charge les préférences depuis localStorage (fallback)
     */
    loadPreferencesFromStorage() {
        const saved = localStorage.getItem('financepro_news_preferences');
        if (saved) {
            try {
                this.preferences = {
                    ...this.preferences,
                    ...JSON.parse(saved)
                };
                console.log('✅ Loaded preferences from localStorage');
            } catch (error) {
                console.error('❌ Error loading preferences from localStorage:', error);
            }
        }
    },
    
    /**
     * ✅ Sauvegarde les préférences dans localStorage
     */
    savePreferencesToStorage() {
        try {
            localStorage.setItem('financepro_news_preferences', JSON.stringify(this.preferences));
        } catch (error) {
            console.error('❌ Error saving preferences to localStorage:', error);
        }
    },
    
    // ========== EVENT LISTENERS ==========
    
    setupEventListeners() {
        // Sidebar Toggle (Mobile)
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        mobileMenuBtn?.addEventListener('click', () => this.toggleSidebar());
        sidebarToggle?.addEventListener('click', () => this.toggleSidebar());
        sidebarOverlay?.addEventListener('click', () => this.closeSidebar());
        
        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());
        
        // Header Actions
        document.getElementById('refreshBtn')?.addEventListener('click', () => this.fetchNews(true));
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
        
        // Search
        document.getElementById('searchInput')?.addEventListener('input', (e) => this.handleSearch(e));
        document.getElementById('clearSearch')?.addEventListener('click', () => this.clearSearch());
        
        // Category Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleCategoryChange(btn.dataset.category));
        });
        
        // Symbol Filter
        document.getElementById('applySymbol')?.addEventListener('click', () => this.applySymbolFilter());
        document.getElementById('symbolInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.applySymbolFilter();
        });
        
        // Sort
        document.getElementById('sortSelect')?.addEventListener('change', (e) => this.handleSortChange(e));
        
        // Reset Filters
        document.getElementById('resetFilters')?.addEventListener('click', () => this.resetAllFilters());
        
        // Load More
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => this.loadMoreNews());
        
        // Modal
        document.getElementById('closeModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('newsModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'newsModal') this.closeModal();
        });
        
        // Scroll to Top
        document.getElementById('scrollToTop')?.addEventListener('click', () => this.scrollToTop());
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Resize handler
        window.addEventListener('resize', () => this.handleResize());
    },
    
    setupSearchListeners() {
        const input = document.getElementById('searchInput');
        if (!input) return;
        
        input.addEventListener('input', (e) => {
            this.handleSearch(e);
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
    },
    
    // ========== SIDEBAR MANAGEMENT ==========
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar?.classList.toggle('active');
        overlay?.classList.toggle('active');
        
        document.body.style.overflow = sidebar?.classList.contains('active') ? 'hidden' : '';
    },
    
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar?.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
    },
    
    handleResize() {
        if (window.innerWidth > 1024) {
            this.closeSidebar();
        }
    },
    
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            if (firebase && firebase.auth) {
                firebase.auth().signOut().then(() => {
                    window.location.href = 'index.html';
                });
            } else {
                localStorage.removeItem('financepro_user');
                localStorage.removeItem('financepro_token');
                window.location.href = 'index.html';
            }
        }
    },
    
    // ========== FETCH NEWS (AVEC API CLIENT) ==========
    
    async fetchNews(silent = false) {
        if (this.isLoading) {
            console.log('⚠️ Already loading news...');
            return;
        }
        
        this.isLoading = true;
        
        if (!silent) {
            this.showLoading(true);
        } else {
            const refreshBtn = document.getElementById('refreshBtn');
            refreshBtn?.classList.add('rotating');
        }
        
        try {
            console.log(`📡 Fetching news for category: ${this.currentCategory}`);
            
            // ✅ UTILISER L'API CLIENT (comme market-data.js)
            const newsResponse = await this.apiClient.getNews(this.currentCategory);
            
            if (!newsResponse || !newsResponse.data) {
                throw new Error('No news data received');
            }
            
            // Process news data
            this.newsData.all = this.processNewsData(newsResponse.data);
            this.lastUpdate = new Date();
            
            console.log(`✅ Loaded ${this.newsData.all.length} news articles`);
            
            // Apply filters and render
            this.applyFilters();
            this.renderNews();
            this.updateLastUpdateTime();
            
            this.showLoading(false);
            
            if (silent) {
                this.showNotification('News updated successfully', 'success');
            }
            
        } catch (error) {
            console.error('❌ Error fetching news:', error);
            
            // Si on a déjà des données, on garde et on montre juste un toast
            if (this.newsData.all.length > 0) {
                this.showNotification('Failed to refresh news', 'error');
            } else {
                this.showError(error.message || 'Unable to fetch news. Please try again later.');
            }
        } finally {
            this.isLoading = false;
            const refreshBtn = document.getElementById('refreshBtn');
            refreshBtn?.classList.remove('rotating');
        }
    },
    
    /**
     * ✅ CORRECTION : Process news data from API
     */
    processNewsData(rawData) {
        if (!Array.isArray(rawData)) {
            console.warn('⚠️ News data is not an array:', rawData);
            return [];
        }
        
        return rawData.map(item => ({
            id: item.id || `${Date.now()}_${Math.random()}`,
            category: item.category || 'general',
            headline: item.headline || item.title || 'No headline available',
            summary: item.summary || item.description || '',
            source: item.source || 'Unknown Source',
            url: item.url || item.link || '#',
            image: item.image || item.imageUrl || 'https://via.placeholder.com/400x200?text=Financial+News',
            datetime: item.datetime 
                ? (item.datetime instanceof Date ? item.datetime : new Date(item.datetime))
                : new Date(),
            relatedSymbols: item.related || [] // ✅ SIMPLIFIÉ : API Client retourne déjà un array
        })).sort((a, b) => b.datetime - a.datetime);
    },
    
    // ========== FILTERS ==========
    
    applyFilters() {
        let filtered = [...this.newsData.all];
        
        // Category filter
        if (this.currentCategory !== 'general') {
            filtered = filtered.filter(news => news.category === this.currentCategory);
        }
        
        // Symbol filter
        if (this.currentSymbol) {
            filtered = filtered.filter(news => 
                news.relatedSymbols.some(symbol => 
                    symbol.toUpperCase().includes(this.currentSymbol.toUpperCase())
                )
            );
        }
        
        // Search filter
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(news =>
                news.headline.toLowerCase().includes(query) ||
                news.summary.toLowerCase().includes(query) ||
                news.source.toLowerCase().includes(query) ||
                news.relatedSymbols.some(symbol => symbol.toLowerCase().includes(query))
            );
        }
        
        // Sort
        switch (this.sortBy) {
            case 'newest':
                filtered.sort((a, b) => b.datetime - a.datetime);
                break;
            case 'oldest':
                filtered.sort((a, b) => a.datetime - b.datetime);
                break;
            case 'relevance':
                // Keep original order
                break;
        }
        
        this.newsData.filtered = filtered;
        
        console.log(`🔍 Filtered: ${filtered.length}/${this.newsData.all.length} articles`);
    },
    
    handleCategoryChange(category) {
        this.currentCategory = category;
        
        // Update UI
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        // Fetch new news for this category
        this.fetchNews();
    },
    
    handleSearch(e) {
        const query = e.target.value.trim();
        this.searchQuery = query;
        
        const clearBtn = document.getElementById('clearSearch');
        if (clearBtn) {
            clearBtn.style.display = query ? 'flex' : 'none';
        }
        
        // Debounce
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.applyFilters();
            this.renderNews();
        }, 300);
    },
    
    clearSearch() {
        const input = document.getElementById('searchInput');
        if (input) input.value = '';
        
        this.searchQuery = '';
        
        const clearBtn = document.getElementById('clearSearch');
        if (clearBtn) clearBtn.style.display = 'none';
        
        this.applyFilters();
        this.renderNews();
    },
    
    applySymbolFilter() {
        const input = document.getElementById('symbolInput');
        const symbol = input?.value.trim().toUpperCase() || '';
        
        this.currentSymbol = symbol;
        
        this.applyFilters();
        this.renderNews();
        
        if (symbol) {
            this.showNotification(`Filtered by ${symbol}`, 'info');
        }
    },
    
    handleSortChange(e) {
        this.sortBy = e.target.value;
        
        this.applyFilters();
        this.renderNews();
    },
    
    resetAllFilters() {
        this.currentCategory = 'general';
        this.currentSymbol = '';
        this.searchQuery = '';
        this.sortBy = 'newest';
        
        // Update UI
        const searchInput = document.getElementById('searchInput');
        const symbolInput = document.getElementById('symbolInput');
        const sortSelect = document.getElementById('sortSelect');
        const clearSearch = document.getElementById('clearSearch');
        
        if (searchInput) searchInput.value = '';
        if (symbolInput) symbolInput.value = '';
        if (sortSelect) sortSelect.value = 'newest';
        if (clearSearch) clearSearch.style.display = 'none';
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'general');
        });
        
        this.applyFilters();
        this.renderNews();
        
        this.showNotification('Filters reset', 'success');
    },
    
    // ========== RENDER NEWS ==========
    
    renderNews() {
        const newsToShow = this.newsData.filtered;
        
        // Update count
        const newsCount = document.getElementById('newsCount');
        if (newsCount) {
            newsCount.textContent = `${newsToShow.length} article${newsToShow.length !== 1 ? 's' : ''}`;
        }
        
        // Show/hide states
        if (newsToShow.length === 0) {
            this.showEmpty();
            return;
        }
        
        // Clear grid
        const newsGrid = document.getElementById('newsGrid');
        if (!newsGrid) return;
        
        newsGrid.innerHTML = '';
        
        // Render cards
        newsToShow.forEach((news, index) => {
            const card = this.createNewsCard(news, index);
            newsGrid.appendChild(card);
        });
        
        // Show grid
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const emptyState = document.getElementById('emptyState');
        
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
        newsGrid.style.display = 'grid';
        
        // Hide load more for now
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) {
            loadMoreContainer.style.display = 'none';
        }
    },
    
    createNewsCard(news, index) {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.style.animationDelay = `${index * 0.05}s`;
        
        const timeAgo = this.getTimeAgo(news.datetime);
        
        card.innerHTML = `
            <img 
                src="${news.image}" 
                alt="${this.escapeHTML(news.headline)}" 
                class="news-card-image"
                onerror="this.src='https://via.placeholder.com/400x200?text=Financial+News'"
            >
            <div class="news-card-content">
                <div class="news-card-header">
                    <span class="news-category ${news.category}">
                        <i class="fas fa-tag"></i>
                        ${news.category}
                    </span>
                    <span class="news-time">
                        <i class="far fa-clock"></i>
                        ${timeAgo}
                    </span>
                </div>
                
                <h3 class="news-card-title">${this.escapeHTML(news.headline)}</h3>
                
                ${news.summary ? `<p class="news-card-summary">${this.escapeHTML(news.summary)}</p>` : ''}
                
                <div class="news-card-footer">
                    <div class="news-source">
                        <i class="fas fa-rss"></i>
                        ${this.escapeHTML(news.source)}
                    </div>
                    ${news.relatedSymbols.length > 0 ? `
                        <div class="news-related-symbols">
                            ${news.relatedSymbols.slice(0, 3).map(symbol => 
                                `<span class="symbol-tag">${this.escapeHTML(symbol)}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => this.openNewsModal(news));
        
        return card;
    },
    
    // ========== MODAL ==========
    
    openNewsModal(news) {
        const modal = document.getElementById('newsModal');
        const modalBody = document.getElementById('modalBody');
        
        if (!modal || !modalBody) return;
        
        const timeAgo = this.getTimeAgo(news.datetime);
        const formattedDate = news.datetime.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        modalBody.innerHTML = `
            <img 
                src="${news.image}" 
                alt="${this.escapeHTML(news.headline)}" 
                class="modal-image"
                onerror="this.src='https://via.placeholder.com/800x300?text=Financial+News'"
            >
            
            <div class="modal-header">
                <div class="modal-meta">
                    <span class="news-category ${news.category}">
                        <i class="fas fa-tag"></i>
                        ${news.category}
                    </span>
                    <span class="news-time">
                        <i class="far fa-clock"></i>
                        ${timeAgo}
                    </span>
                    <span class="news-time">
                        <i class="far fa-calendar"></i>
                        ${formattedDate}
                    </span>
                </div>
                
                <h2 class="modal-title">${this.escapeHTML(news.headline)}</h2>
                
                ${news.summary ? `
                    <div class="modal-summary">
                        <strong>Summary:</strong> ${this.escapeHTML(news.summary)}
                    </div>
                ` : ''}
                
                ${news.relatedSymbols.length > 0 ? `
                    <div class="news-related-symbols">
                        <strong>Related Symbols:</strong>
                        ${news.relatedSymbols.map(symbol => 
                            `<span class="symbol-tag">${this.escapeHTML(symbol)}</span>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
            
            <div class="modal-footer">
                <div class="news-source">
                    <i class="fas fa-rss"></i>
                    Source: ${this.escapeHTML(news.source)}
                </div>
                <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="btn-read-original">
                    <i class="fas fa-external-link-alt"></i>
                    Read Original Article
                </a>
            </div>
        `;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },
    
    closeModal() {
        const modal = document.getElementById('newsModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    // ========== UI STATES (✅ CORRECTION 3) ==========
    
    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const emptyState = document.getElementById('emptyState');
        const newsGrid = document.getElementById('newsGrid');
        
        if (show) {
            if (loadingState) loadingState.style.display = 'flex';
            if (errorState) errorState.style.display = 'none';
            if (emptyState) emptyState.style.display = 'none';
            if (newsGrid) newsGrid.style.display = 'none';
        } else {
            if (loadingState) loadingState.style.display = 'none';
        }
    },
    
    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const emptyState = document.getElementById('emptyState');
        const newsGrid = document.getElementById('newsGrid');
        
        if (errorMessage) errorMessage.textContent = message;
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'flex';
        if (emptyState) emptyState.style.display = 'none';
        if (newsGrid) newsGrid.style.display = 'none';
    },
    
    showEmpty() {
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const emptyState = document.getElementById('emptyState');
        const newsGrid = document.getElementById('newsGrid');
        
        if (loadingState) loadingState.style.display = 'none';
        if (errorState) errorState.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        if (newsGrid) newsGrid.style.display = 'none';
    },
    
    // ========== THEME ==========
    
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        
        const isDark = document.body.classList.contains('dark-mode');
        const themeToggle = document.getElementById('themeToggle');
        
        if (themeToggle) {
            themeToggle.innerHTML = isDark 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        }
        
        localStorage.setItem('financepro_theme', isDark ? 'dark' : 'light');
        
        this.showNotification(`${isDark ? 'Dark' : 'Light'} mode activated`, 'success');
    },
    
    loadThemePreference() {
        const theme = localStorage.getItem('financepro_theme');
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        }
    },
    
    // ========== AUTO-REFRESH ==========
    
    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        this.refreshInterval = setInterval(() => {
            if (!this.isLoading && this.preferences.autoRefresh) {
                console.log('🔄 Auto-refreshing news...');
                this.fetchNews(true);
            }
        }, this.preferences.refreshInterval);
        
        console.log(`✅ Auto-refresh started (${this.preferences.refreshInterval / 1000}s)`);
    },
    
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
            console.log('🛑 Auto-refresh stopped');
        }
    },
    
    // ========== UTILITIES ==========
    
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };
        
        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
            }
        }
        
        return 'Just now';
    },
    
    updateLastUpdateTime() {
        if (!this.lastUpdate) return;
        
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl) {
            const timeString = this.lastUpdate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
            lastUpdateEl.textContent = `Last update: ${timeString}`;
        }
    },
    
    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },
    
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },
    
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollToTopBtn = document.getElementById('scrollToTop');
        
        if (scrollToTopBtn) {
            if (scrollTop > 500) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        }
    },
    
    handleKeyboard(e) {
        // ESC to close modal or sidebar
        if (e.key === 'Escape') {
            const modal = document.getElementById('newsModal');
            const sidebar = document.getElementById('sidebar');
            
            if (modal?.classList.contains('active')) {
                this.closeModal();
            } else if (sidebar?.classList.contains('active')) {
                this.closeSidebar();
            }
        }
        
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('searchInput')?.focus();
        }
        
        // Ctrl/Cmd + R to refresh
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.fetchNews(true);
        }
    },
    
    loadMoreNews() {
        this.showNotification('Load more feature coming soon', 'info');
    },
    
    showNotification(message, type = 'info') {
        // Utiliser le système de notification global si disponible
        if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
            window.FinanceDashboard.showNotification(message, type);
        } else {
            // Sinon, créer un toast simple
            this.showToast(message, type);
        }
    },
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10001;
            font-weight: 600;
            transition: transform 0.3s ease;
            max-width: 90%;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
};

// ========== INITIALIZE WHEN DOM IS LOADED ==========
document.addEventListener('DOMContentLoaded', () => {
    // ✅ CORRECTION : Plus besoin de charger le thème ici, c'est fait dans init()
    NewsApp.init();
});

// ========== EXPOSITION GLOBALE ==========
window.NewsApp = NewsApp;

console.log('✅ News.js loaded - Cloud version with FinanceAPIClient');