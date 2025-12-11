/* ==============================================
   📊 PORTFOLIO, WATCHLIST & ALERTS MANAGER
   Firebase Integration - Real-time Sync
   ============================================== */

// ============================================
// 🌐 GLOBAL STATE
// ============================================
const AppState = {
    currentUser: null,
    currentPortfolioId: null,
    portfolios: [],
    watchlist: [],
    alerts: [],
    priceCache: new Map(),
    alertCheckInterval: null,
    unsubscribers: []
};

// ============================================
// 🔥 FIREBASE UTILITIES
// ============================================
const FirebaseUtils = {
    // Obtenir la référence utilisateur
    getUserRef(userId) {
        if (!firebase.firestore) {
            console.error('❌ Firestore not initialized');
            return null;
        }
        return firebase.firestore().collection('users').doc(userId);
    },
    
    // Obtenir la collection portfolios
    getPortfoliosRef(userId) {
        const userRef = this.getUserRef(userId);
        return userRef ? userRef.collection('portfolios') : null;
    },
    
    // Obtenir la collection watchlist d'un portfolio
    getWatchlistRef(userId, portfolioId) {
        const portfoliosRef = this.getPortfoliosRef(userId);
        return portfoliosRef ? portfoliosRef.doc(portfolioId).collection('watchlist') : null;
    },
    
    // Obtenir la collection alerts d'un portfolio
    getAlertsRef(userId, portfolioId) {
        const portfoliosRef = this.getPortfoliosRef(userId);
        return portfoliosRef ? portfoliosRef.doc(portfolioId).collection('alerts') : null;
    },
    
    // Créer un timestamp Firestore
    timestamp() {
        return firebase.firestore.FieldValue.serverTimestamp();
    }
};

// ============================================
// 💼 PORTFOLIO MANAGER
// ============================================
const PortfolioManager = {
    
    // ========== INITIALIZATION ==========
    async init() {
        console.log('💼 Initializing Portfolio Manager...');
        
        // Attendre l'authentification
        await this.waitForAuth();
        
        if (!AppState.currentUser) {
            console.warn('⚠ No user authenticated');
            return;
        }
        
        // Charger les portfolios
        await this.loadPortfolios();
        
        // Sélectionner le portfolio actif (dernier utilisé ou créer un par défaut)
        await this.selectActivePortfolio();
        
        console.log('✅ Portfolio Manager initialized');
    },
    
    async waitForAuth() {
        return new Promise((resolve) => {
            if (!firebase.auth) {
                console.error('❌ Firebase Auth not available');
                resolve();
                return;
            }
            
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    AppState.currentUser = user;
                    console.log('✅ User authenticated:', user.email);
                    unsubscribe();
                    resolve();
                } else {
                    console.warn('⚠ No user logged in');
                    unsubscribe();
                    resolve();
                }
            });
            
            // Timeout après 3 secondes
            setTimeout(() => {
                unsubscribe();
                resolve();
            }, 3000);
        });
    },
    
    // ========== LOAD PORTFOLIOS ==========
    async loadPortfolios() {
        if (!AppState.currentUser) return;
        
        try {
            const portfoliosRef = FirebaseUtils.getPortfoliosRef(AppState.currentUser.uid);
            if (!portfoliosRef) return;
            
            const snapshot = await portfoliosRef.orderBy('createdAt', 'asc').get();
            
            AppState.portfolios = [];
            snapshot.forEach(doc => {
                AppState.portfolios.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`📁 Loaded ${AppState.portfolios.length} portfolios`);
            
            // Mettre à jour le dropdown
            this.updatePortfolioDropdown();
            
        } catch (error) {
            console.error('❌ Error loading portfolios:', error);
        }
    },
    
    // ========== SELECT ACTIVE PORTFOLIO ==========
    async selectActivePortfolio() {
        if (AppState.portfolios.length === 0) {
            // Créer un portfolio par défaut
            console.log('📁 No portfolios found, creating default...');
            await this.createDefaultPortfolio();
            return;
        }
        
        // Récupérer le dernier portfolio utilisé depuis localStorage
        const lastPortfolioId = localStorage.getItem('lastActivePortfolio');
        
        let portfolioToSelect = null;
        
        if (lastPortfolioId) {
            portfolioToSelect = AppState.portfolios.find(p => p.id === lastPortfolioId);
        }
        
        // Si non trouvé, prendre le premier
        if (!portfolioToSelect) {
            portfolioToSelect = AppState.portfolios[0];
        }
        
        await this.switchPortfolio(portfolioToSelect.id);
    },
    
    // ========== CREATE DEFAULT PORTFOLIO ==========
    async createDefaultPortfolio() {
        try {
            const portfoliosRef = FirebaseUtils.getPortfoliosRef(AppState.currentUser.uid);
            if (!portfoliosRef) return;
            
            const docRef = await portfoliosRef.add({
                name: 'My Portfolio',
                createdAt: FirebaseUtils.timestamp(),
                updatedAt: FirebaseUtils.timestamp()
            });
            
            console.log('✅ Default portfolio created:', docRef.id);
            
            // Recharger les portfolios
            await this.loadPortfolios();
            
            // Sélectionner le nouveau portfolio
            await this.switchPortfolio(docRef.id);
            
        } catch (error) {
            console.error('❌ Error creating default portfolio:', error);
        }
    },
    
    // ========== SWITCH PORTFOLIO ==========
    async switchPortfolio(portfolioId) {
        AppState.currentPortfolioId = portfolioId;
        
        // Sauvegarder dans localStorage
        localStorage.setItem('lastActivePortfolio', portfolioId);
        
        // Mettre à jour le dropdown
        const dropdown = document.getElementById('portfolioSelect');
        if (dropdown) {
            dropdown.value = portfolioId;
        }
        
        console.log('🔄 Switched to portfolio:', portfolioId);
        
        // Charger la watchlist et les alertes de ce portfolio
        await WatchlistManager.loadWatchlist();
        await AlertsManager.loadAlerts();
    },
    
    // ========== UPDATE DROPDOWN ==========
    updatePortfolioDropdown() {
        const dropdown = document.getElementById('portfolioSelect');
        if (!dropdown) return;
        
        dropdown.innerHTML = '';
        
        if (AppState.portfolios.length === 0) {
            dropdown.innerHTML = '<option value="">No portfolios</option>';
            return;
        }
        
        AppState.portfolios.forEach(portfolio => {
            const option = document.createElement('option');
            option.value = portfolio.id;
            option.textContent = portfolio.name;
            dropdown.appendChild(option);
        });
        
        // Sélectionner le portfolio actif
        if (AppState.currentPortfolioId) {
            dropdown.value = AppState.currentPortfolioId;
        }
        
        // Event listener pour changer de portfolio
        dropdown.removeEventListener('change', this.handlePortfolioChange);
        dropdown.addEventListener('change', this.handlePortfolioChange.bind(this));
    },
    
    handlePortfolioChange(event) {
        const newPortfolioId = event.target.value;
        if (newPortfolioId) {
            this.switchPortfolio(newPortfolioId);
        }
    },
    
    // ========== CREATE NEW PORTFOLIO ==========
    openCreateModal() {
        document.getElementById('newPortfolioName').value = '';
        openModal('modalCreatePortfolio');
    },
    
    async createPortfolio() {
        const nameInput = document.getElementById('newPortfolioName');
        const name = nameInput.value.trim();
        
        if (!name) {
            alert('Please enter a portfolio name');
            return;
        }
        
        try {
            const portfoliosRef = FirebaseUtils.getPortfoliosRef(AppState.currentUser.uid);
            if (!portfoliosRef) return;
            
            const docRef = await portfoliosRef.add({
                name: name,
                createdAt: FirebaseUtils.timestamp(),
                updatedAt: FirebaseUtils.timestamp()
            });
            
            console.log('✅ Portfolio created:', docRef.id);
            
            // Recharger les portfolios
            await this.loadPortfolios();
            
            // Switcher vers le nouveau portfolio
            await this.switchPortfolio(docRef.id);
            
            // Fermer le modal
            closeModal('modalCreatePortfolio');
            
            // Notification
            this.showNotification('Portfolio created successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Error creating portfolio:', error);
            alert('Error creating portfolio. Please try again.');
        }
    },
    
    // ========== MANAGE PORTFOLIOS ==========
    openManageModal() {
        this.renderManageList();
        openModal('modalManagePortfolios');
    },
    
    renderManageList() {
        const container = document.getElementById('portfoliosListManage');
        if (!container) return;
        
        if (AppState.portfolios.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-folder-open" style="font-size: 3rem; opacity: 0.5; margin-bottom: 15px; display: block;"></i>
                    <p>No portfolios available</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = AppState.portfolios.map(portfolio => `
            <div class="portfolio-manage-item" data-id="${portfolio.id}">
                <div class="portfolio-manage-name">${this.escapeHtml(portfolio.name)}</div>
                <div class="portfolio-manage-actions">
                    <button class="btn-rename" onclick="PortfolioManager.renamePortfolio('${portfolio.id}')">
                        <i class="fas fa-edit"></i> Rename
                    </button>
                    ${AppState.portfolios.length > 1 ? `
                        <button class="btn-delete-portfolio" onclick="PortfolioManager.deletePortfolio('${portfolio.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },
    
    // ========== RENAME PORTFOLIO ==========
    async renamePortfolio(portfolioId) {
        const portfolio = AppState.portfolios.find(p => p.id === portfolioId);
        if (!portfolio) return;
        
        const newName = prompt('Enter new portfolio name:', portfolio.name);
        if (!newName || newName.trim() === '' || newName === portfolio.name) return;
        
        try {
            const portfoliosRef = FirebaseUtils.getPortfoliosRef(AppState.currentUser.uid);
            if (!portfoliosRef) return;
            
            await portfoliosRef.doc(portfolioId).update({
                name: newName.trim(),
                updatedAt: FirebaseUtils.timestamp()
            });
            
            console.log('✅ Portfolio renamed');
            
            // Recharger les portfolios
            await this.loadPortfolios();
            
            // Mettre à jour la liste de gestion
            this.renderManageList();
            
            this.showNotification('Portfolio renamed successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Error renaming portfolio:', error);
            alert('Error renaming portfolio. Please try again.');
        }
    },
    
    // ========== DELETE PORTFOLIO ==========
    async deletePortfolio(portfolioId) {
        if (AppState.portfolios.length <= 1) {
            alert('You must have at least one portfolio');
            return;
        }
        
        const portfolio = AppState.portfolios.find(p => p.id === portfolioId);
        if (!portfolio) return;
        
        const confirmed = confirm(`Are you sure you want to delete "${portfolio.name}"?\n\nThis will also delete all associated watchlist items and alerts.`);
        if (!confirmed) return;
        
        try {
            const portfoliosRef = FirebaseUtils.getPortfoliosRef(AppState.currentUser.uid);
            if (!portfoliosRef) return;
            
            // Supprimer le document portfolio (les sous-collections seront supprimées côté serveur ou manuellement)
            await portfoliosRef.doc(portfolioId).delete();
            
            console.log('✅ Portfolio deleted');
            
            // Si c'était le portfolio actif, switcher vers un autre
            if (AppState.currentPortfolioId === portfolioId) {
                localStorage.removeItem('lastActivePortfolio');
            }
            
            // Recharger les portfolios
            await this.loadPortfolios();
            
            // Sélectionner un autre portfolio
            await this.selectActivePortfolio();
            
            // Mettre à jour la liste de gestion
            this.renderManageList();
            
            this.showNotification('Portfolio deleted successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Error deleting portfolio:', error);
            alert('Error deleting portfolio. Please try again.');
        }
    },
    
    // ========== UTILITIES ==========
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    showNotification(message, type = 'info') {
        // Simple notification (tu peux améliorer avec un système plus élaboré)
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #43e97b, #38f9d7)' : 'linear-gradient(135deg, #667eea, #764ba2)'};
            color: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 10001;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// ============================================
// ⭐ WATCHLIST MANAGER
// ============================================
const WatchlistManager = {
    
    currentFilter: 'all',
    priceUpdateInterval: null,
    
    // ========== INITIALIZATION ==========
    async init() {
        console.log('⭐ Initializing Watchlist Manager...');
        
        // Charger la watchlist du portfolio actif
        await this.loadWatchlist();
        
        // Démarrer les mises à jour de prix en temps réel
        this.startPriceUpdates();
        
        console.log('✅ Watchlist Manager initialized');
    },
    
    // ========== LOAD WATCHLIST ==========
    async loadWatchlist() {
        if (!AppState.currentUser || !AppState.currentPortfolioId) {
            this.displayEmptyState();
            return;
        }
        
        try {
            const watchlistRef = FirebaseUtils.getWatchlistRef(
                AppState.currentUser.uid,
                AppState.currentPortfolioId
            );
            
            if (!watchlistRef) {
                this.displayEmptyState();
                return;
            }
            
            const snapshot = await watchlistRef.orderBy('addedAt', 'desc').get();
            
            AppState.watchlist = [];
            snapshot.forEach(doc => {
                AppState.watchlist.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`⭐ Loaded ${AppState.watchlist.length} watchlist items`);
            
            // Afficher la watchlist
            await this.renderWatchlist();
            
        } catch (error) {
            console.error('❌ Error loading watchlist:', error);
            this.displayEmptyState();
        }
    },
    
    // ========== RENDER WATCHLIST ==========
    async renderWatchlist() {
        const container = document.getElementById('watchlistContainer');
        if (!container) return;
        
        if (AppState.watchlist.length === 0) {
            this.displayEmptyState();
            return;
        }
        
        // Appliquer le filtre
        let filteredWatchlist = [...AppState.watchlist];
        
        if (this.currentFilter === 'gainers') {
            filteredWatchlist = filteredWatchlist.filter(item => {
                const cached = AppState.priceCache.get(item.symbol);
                return cached && cached.changePercent > 0;
            });
        } else if (this.currentFilter === 'losers') {
            filteredWatchlist = filteredWatchlist.filter(item => {
                const cached = AppState.priceCache.get(item.symbol);
                return cached && cached.changePercent < 0;
            });
        }
        
        if (filteredWatchlist.length === 0) {
            container.innerHTML = `
                <div class="watchlist-empty">
                    <i class="fas fa-filter"></i>
                    <p>No stocks match this filter</p>
                    <small>Try a different filter</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredWatchlist.map(item => this.createWatchlistCard(item)).join('');
        
        // Charger les prix
        await this.updateAllPrices();
    },
    
    // ========== CREATE WATCHLIST CARD ==========
    createWatchlistCard(item) {
        const cached = AppState.priceCache.get(item.symbol);
        
        let priceHTML = '<div class="watchlist-loading">Loading...</div>';
        let changeHTML = '';
        
        if (cached) {
            const changeClass = cached.changePercent >= 0 ? 'positive' : 'negative';
            const changeSign = cached.changePercent >= 0 ? '+' : '';
            
            priceHTML = `<div class="watchlist-price">$${cached.price.toFixed(2)}</div>`;
            changeHTML = `<div class="watchlist-change ${changeClass}">${changeSign}${cached.changePercent.toFixed(2)}%</div>`;
        }
        
        return `
            <div class="watchlist-card" data-symbol="${item.symbol}" onclick="WatchlistManager.analyzeStock('${item.symbol}')">
                <div class="watchlist-card-header">
                    <div class="watchlist-symbol">${item.symbol}</div>
                    <button class="watchlist-remove" onclick="event.stopPropagation(); WatchlistManager.removeFromWatchlist('${item.id}', '${item.symbol}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                ${priceHTML}
                ${changeHTML}
            </div>
        `;
    },
    
    // ========== ADD TO WATCHLIST ==========
    async addFromInput() {
        const input = document.getElementById('watchlistSearchInput');
        const symbol = input.value.trim().toUpperCase();
        
        if (!symbol) {
            alert('Please enter a stock symbol');
            return;
        }
        
        await this.addToWatchlist(symbol);
        
        // Vider l'input
        input.value = '';
    },
    
    async addToWatchlist(symbol) {
        if (!AppState.currentUser || !AppState.currentPortfolioId) {
            alert('Please select a portfolio first');
            return;
        }
        
        // Vérifier si déjà dans la watchlist
        const exists = AppState.watchlist.find(item => item.symbol === symbol);
        if (exists) {
            alert(`${symbol} is already in your watchlist`);
            return;
        }
        
        try {
            const watchlistRef = FirebaseUtils.getWatchlistRef(
                AppState.currentUser.uid,
                AppState.currentPortfolioId
            );
            
            if (!watchlistRef) return;
            
            await watchlistRef.add({
                symbol: symbol,
                addedAt: FirebaseUtils.timestamp()
            });
            
            console.log(`✅ Added ${symbol} to watchlist`);
            
            // Recharger la watchlist
            await this.loadWatchlist();
            
            PortfolioManager.showNotification(`${symbol} added to watchlist!`, 'success');
            
        } catch (error) {
            console.error('❌ Error adding to watchlist:', error);
            alert('Error adding to watchlist. Please try again.');
        }
    },
    
    // ========== REMOVE FROM WATCHLIST ==========
    async removeFromWatchlist(itemId, symbol) {
        const confirmed = confirm(`Remove ${symbol} from watchlist?`);
        if (!confirmed) return;
        
        try {
            const watchlistRef = FirebaseUtils.getWatchlistRef(
                AppState.currentUser.uid,
                AppState.currentPortfolioId
            );
            
            if (!watchlistRef) return;
            
            await watchlistRef.doc(itemId).delete();
            
            console.log(`✅ Removed ${symbol} from watchlist`);
            
            // Retirer du cache
            AppState.priceCache.delete(symbol);
            
            // Recharger la watchlist
            await this.loadWatchlist();
            
            PortfolioManager.showNotification(`${symbol} removed from watchlist!`, 'success');
            
        } catch (error) {
            console.error('❌ Error removing from watchlist:', error);
            alert('Error removing from watchlist. Please try again.');
        }
    },
    
    // ========== FILTER WATCHLIST ==========
    filterWatchlist(filter) {
        this.currentFilter = filter;
        
        // Mettre à jour les boutons de filtre
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        // Re-render avec le filtre
        this.renderWatchlist();
    },
    
    // ========== UPDATE PRICES ==========
    async updateAllPrices() {
        if (AppState.watchlist.length === 0) return;
        
        // Utiliser l'API client existant
        if (!window.apiClient) {
            console.warn('⚠ API client not available');
            return;
        }
        
        for (const item of AppState.watchlist) {
            try {
                const quote = await window.apiClient.getQuote(item.symbol);
                
                if (quote && quote.price !== undefined) {
                    AppState.priceCache.set(item.symbol, {
                        price: quote.price,
                        change: quote.change || 0,
                        changePercent: quote.percentChange || 0,
                        timestamp: Date.now()
                    });
                    
                    // Mettre à jour la carte
                    this.updateCardPrice(item.symbol);
                }
            } catch (error) {
                console.error(`❌ Error fetching price for ${item.symbol}:`, error);
            }
            
            // Petit délai pour éviter de surcharger l'API
            await this.sleep(300);
        }
    },
    
    updateCardPrice(symbol) {
        const card = document.querySelector(`.watchlist-card[data-symbol="${symbol}"]`);
        if (!card) return;
        
        const cached = AppState.priceCache.get(symbol);
        if (!cached) return;
        
        const changeClass = cached.changePercent >= 0 ? 'positive' : 'negative';
        const changeSign = cached.changePercent >= 0 ? '+' : '';
        
        card.innerHTML = `
            <div class="watchlist-card-header">
                <div class="watchlist-symbol">${symbol}</div>
                <button class="watchlist-remove" onclick="event.stopPropagation(); WatchlistManager.removeFromWatchlist('${card.closest('[data-symbol]').dataset.symbol}', '${symbol}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="watchlist-price">$${cached.price.toFixed(2)}</div>
            <div class="watchlist-change ${changeClass}">${changeSign}${cached.changePercent.toFixed(2)}%</div>
        `;
    },
    
    // ========== START PRICE UPDATES ==========
    startPriceUpdates() {
        // Mettre à jour toutes les 60 secondes
        this.priceUpdateInterval = setInterval(() => {
            if (AppState.watchlist.length > 0) {
                this.updateAllPrices();
            }
        }, 60000);
    },
    
    stopPriceUpdates() {
        if (this.priceUpdateInterval) {
            clearInterval(this.priceUpdateInterval);
            this.priceUpdateInterval = null;
        }
    },
    
    // ========== ANALYZE STOCK ==========
    analyzeStock(symbol) {
        // Charger le symbole dans Advanced Analysis
        if (typeof AdvancedAnalysis !== 'undefined' && AdvancedAnalysis.loadSymbol) {
            AdvancedAnalysis.loadSymbol(symbol);
            
            // Scroll vers la section d'analyse
            const searchPanel = document.querySelector('.search-panel');
            if (searchPanel) {
                searchPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    },
    
    // ========== UTILITIES ==========
    displayEmptyState() {
        const container = document.getElementById('watchlistContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="watchlist-empty">
                <i class="fas fa-star"></i>
                <p>No stocks in watchlist</p>
                <small>Add stocks to track them in real-time</small>
            </div>
        `;
    },
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ============================================
// 🔔 ALERTS MANAGER
// ============================================
const AlertsManager = {
    
    alertCheckInterval: null,
    
    // ========== INITIALIZATION ==========
    async init() {
        console.log('🔔 Initializing Alerts Manager...');
        
        // Charger les alertes du portfolio actif
        await this.loadAlerts();
        
        // Démarrer la vérification automatique des alertes
        this.startAlertChecking();
        
        console.log('✅ Alerts Manager initialized');
    },
    
    // ========== LOAD ALERTS ==========
    async loadAlerts() {
        if (!AppState.currentUser || !AppState.currentPortfolioId) {
            this.displayEmptyState();
            this.updateStats();
            return;
        }
        
        try {
            const alertsRef = FirebaseUtils.getAlertsRef(
                AppState.currentUser.uid,
                AppState.currentPortfolioId
            );
            
            if (!alertsRef) {
                this.displayEmptyState();
                this.updateStats();
                return;
            }
            
            const snapshot = await alertsRef.orderBy('createdAt', 'desc').get();
            
            AppState.alerts = [];
            snapshot.forEach(doc => {
                AppState.alerts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`🔔 Loaded ${AppState.alerts.length} alerts`);
            
            // Afficher les alertes
            this.renderAlerts();
            
            // Mettre à jour les stats
            this.updateStats();
            
        } catch (error) {
            console.error('❌ Error loading alerts:', error);
            this.displayEmptyState();
            this.updateStats();
        }
    },
    
    // ========== RENDER ALERTS ==========
    renderAlerts() {
        const container = document.getElementById('alertsContainer');
        if (!container) return;
        
        if (AppState.alerts.length === 0) {
            this.displayEmptyState();
            return;
        }
        
        container.innerHTML = AppState.alerts.map(alert => this.createAlertCard(alert)).join('');
    },
    
    // ========== CREATE ALERT CARD ==========
    createAlertCard(alert) {
        const conditionText = alert.condition === 'above' ? 'goes above' : 'goes below';
        const isTriggered = alert.triggered || false;
        const isActive = alert.active !== false; // Par défaut true si non défini
        
        return `
            <div class="alert-card ${isTriggered ? 'triggered' : ''}" data-alert-id="${alert.id}">
                <div class="alert-info">
                    <div class="alert-symbol">${alert.symbol}</div>
                    <div class="alert-condition">
                        When price <span class="condition-type">${conditionText}</span> 
                        <span class="target-price">$${alert.targetPrice.toFixed(2)}</span>
                    </div>
                </div>
                <div class="alert-actions">
                    <div class="alert-toggle ${isActive ? 'active' : ''}" 
                         onclick="AlertsManager.toggleAlert('${alert.id}', ${!isActive})">
                    </div>
                    <button class="alert-delete" onclick="AlertsManager.deleteAlert('${alert.id}', '${alert.symbol}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    },
    
    // ========== OPEN CREATE MODAL ==========
    openCreateModal() {
        // Pré-remplir avec le symbole actuellement analysé si disponible
        const currentSymbol = AdvancedAnalysis?.currentSymbol || '';
        
        document.getElementById('alertSymbol').value = currentSymbol;
        document.getElementById('alertCondition').value = 'above';
        document.getElementById('alertTargetPrice').value = '';
        
        openModal('modalCreateAlert');
    },
    
    // ========== CREATE ALERT ==========
    async createAlert() {
        const symbol = document.getElementById('alertSymbol').value.trim().toUpperCase();
        const condition = document.getElementById('alertCondition').value;
        const targetPrice = parseFloat(document.getElementById('alertTargetPrice').value);
        
        // Validation
        if (!symbol) {
            alert('Please enter a stock symbol');
            return;
        }
        
        if (!targetPrice || targetPrice <= 0) {
            alert('Please enter a valid target price');
            return;
        }
        
        if (!AppState.currentUser || !AppState.currentPortfolioId) {
            alert('Please select a portfolio first');
            return;
        }
        
        try {
            const alertsRef = FirebaseUtils.getAlertsRef(
                AppState.currentUser.uid,
                AppState.currentPortfolioId
            );
            
            if (!alertsRef) return;
            
            await alertsRef.add({
                symbol: symbol,
                condition: condition,
                targetPrice: targetPrice,
                active: true,
                triggered: false,
                createdAt: FirebaseUtils.timestamp()
            });
            
            console.log(`✅ Alert created for ${symbol}`);
            
            // Recharger les alertes
            await this.loadAlerts();
            
            // Fermer le modal
            closeModal('modalCreateAlert');
            
            PortfolioManager.showNotification('Price alert created successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Error creating alert:', error);
            alert('Error creating alert. Please try again.');
        }
    },
    
    // ========== TOGGLE ALERT ==========
    async toggleAlert(alertId, newActiveState) {
        try {
            const alertsRef = FirebaseUtils.getAlertsRef(
                AppState.currentUser.uid,
                AppState.currentPortfolioId
            );
            
            if (!alertsRef) return;
            
            await alertsRef.doc(alertId).update({
                active: newActiveState
            });
            
            console.log(`✅ Alert ${newActiveState ? 'activated' : 'deactivated'}`);
            
            // Mettre à jour localement
            const alert = AppState.alerts.find(a => a.id === alertId);
            if (alert) {
                alert.active = newActiveState;
            }
            
            // Re-render
            this.renderAlerts();
            this.updateStats();
            
        } catch (error) {
            console.error('❌ Error toggling alert:', error);
        }
    },
    
    // ========== DELETE ALERT ==========
    async deleteAlert(alertId, symbol) {
        const confirmed = confirm(`Delete price alert for ${symbol}?`);
        if (!confirmed) return;
        
        try {
            const alertsRef = FirebaseUtils.getAlertsRef(
                AppState.currentUser.uid,
                AppState.currentPortfolioId
            );
            
            if (!alertsRef) return;
            
            await alertsRef.doc(alertId).delete();
            
            console.log(`✅ Alert deleted`);
            
            // Recharger les alertes
            await this.loadAlerts();
            
            PortfolioManager.showNotification('Alert deleted successfully!', 'success');
            
        } catch (error) {
            console.error('❌ Error deleting alert:', error);
            alert('Error deleting alert. Please try again.');
        }
    },
    
    // ========== UPDATE STATS ==========
    updateStats() {
        const activeCount = AppState.alerts.filter(a => a.active !== false && !a.triggered).length;
        const triggeredCount = AppState.alerts.filter(a => a.triggered).length;
        
        const activeCountEl = document.getElementById('activeAlertsCount');
        const triggeredCountEl = document.getElementById('triggeredAlertsCount');
        
        if (activeCountEl) activeCountEl.textContent = activeCount;
        if (triggeredCountEl) triggeredCountEl.textContent = triggeredCount;
    },
    
    // ========== CHECK ALERTS ==========
    async checkAllAlerts() {
        const activeAlerts = AppState.alerts.filter(a => a.active !== false && !a.triggered);
        
        if (activeAlerts.length === 0) return;
        
        if (!window.apiClient) {
            console.warn('⚠ API client not available for alert checking');
            return;
        }
        
        for (const alert of activeAlerts) {
            try {
                const quote = await window.apiClient.getQuote(alert.symbol);
                
                if (!quote || quote.price === undefined) continue;
                
                const currentPrice = quote.price;
                let triggered = false;
                
                if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
                    triggered = true;
                } else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
                    triggered = true;
                }
                
                if (triggered) {
                    await this.triggerAlert(alert, currentPrice);
                }
                
            } catch (error) {
                console.error(`❌ Error checking alert for ${alert.symbol}:`, error);
            }
            
            // Petit délai pour éviter de surcharger l'API
            await this.sleep(300);
        }
    },
    
    // ========== TRIGGER ALERT ==========
    async triggerAlert(alert, currentPrice) {
        console.log(`🔔 ALERT TRIGGERED: ${alert.symbol} ${alert.condition} $${alert.targetPrice} (current: $${currentPrice})`);
        
        try {
            const alertsRef = FirebaseUtils.getAlertsRef(
                AppState.currentUser.uid,
                AppState.currentPortfolioId
            );
            
            if (!alertsRef) return;
            
            // Marquer comme déclenché
            await alertsRef.doc(alert.id).update({
                triggered: true,
                triggeredAt: FirebaseUtils.timestamp(),
                triggeredPrice: currentPrice
            });
            
            // Mettre à jour localement
            alert.triggered = true;
            
            // Re-render
            this.renderAlerts();
            this.updateStats();
            
            // Notification
            const conditionText = alert.condition === 'above' ? 'went above' : 'went below';
            PortfolioManager.showNotification(
                `🔔 ${alert.symbol} ${conditionText} $${alert.targetPrice.toFixed(2)}!`,
                'success'
            );
            
            // Optionnel : Jouer un son
            this.playAlertSound();
            
        } catch (error) {
            console.error('❌ Error triggering alert:', error);
        }
    },
    
    // ========== START ALERT CHECKING ==========
    startAlertChecking() {
        // Vérifier toutes les 60 secondes
        this.alertCheckInterval = setInterval(() => {
            if (AppState.alerts.length > 0) {
                this.checkAllAlerts();
            }
        }, 60000);
        
        // Première vérification immédiate
        setTimeout(() => {
            this.checkAllAlerts();
        }, 5000);
    },
    
    stopAlertChecking() {
        if (this.alertCheckInterval) {
            clearInterval(this.alertCheckInterval);
            this.alertCheckInterval = null;
        }
    },
    
    // ========== UTILITIES ==========
    displayEmptyState() {
        const container = document.getElementById('alertsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="alerts-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No active price alerts</p>
                <small>Create alerts to get notified when prices reach your targets</small>
            </div>
        `;
    },
    
    playAlertSound() {
        // Créer un son simple (bip)
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('⚠ Could not play alert sound:', error);
        }
    },
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// ============================================
// 🚀 GLOBAL INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Initializing Portfolio, Watchlist & Alerts System...');
    
    // Attendre un peu pour s'assurer que Firebase est prêt
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
        // Initialiser dans l'ordre
        await PortfolioManager.init();
        await WatchlistManager.init();
        await AlertsManager.init();
        
        console.log('✅ Portfolio, Watchlist & Alerts System initialized successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing Portfolio/Watchlist/Alerts system:', error);
    }
});

// ============================================
// 🧹 CLEANUP ON PAGE UNLOAD
// ============================================
window.addEventListener('beforeunload', () => {
    WatchlistManager.stopPriceUpdates();
    AlertsManager.stopAlertChecking();
    
    // Unsubscribe from Firestore listeners
    AppState.unsubscribers.forEach(unsubscribe => unsubscribe());
});

// ============================================
// 🌐 EXPOSE TO GLOBAL SCOPE
// ============================================
window.PortfolioManager = PortfolioManager;
window.WatchlistManager = WatchlistManager;
window.AlertsManager = AlertsManager;
window.AppState = AppState;

console.log('✅ portfolio-watchlist-alerts.js loaded');