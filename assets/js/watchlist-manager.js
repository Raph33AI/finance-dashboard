/**
 * Watchlist Manager - Version SANS PRIX (Symboles uniquement)
 * Gère uniquement les symboles dans le portfolio actif
 */

const WatchlistManager = {
    
    // Initialisation
    async init() {
        console.log('⭐ WatchlistManager initialized (Symbols Only - No Prices)');
        
        // Attendre que Portfolio Manager soit prêt
        if (typeof PortfolioManager === 'undefined') {
            console.warn('⚠ PortfolioManager not loaded yet');
            return;
        }
        
        // Charger la watchlist du portfolio actif
        this.loadWatchlist();
    },
    
    // Charger la watchlist
    async loadWatchlist() {
        const portfolioName = PortfolioManager.getCurrentPortfolio();
        if (!portfolioName) {
            console.warn('⚠ No active portfolio');
            return;
        }
        
        const portfolioData = await PortfolioManager.loadFromCloud(portfolioName);
        
        if (portfolioData && portfolioData.watchlist) {
            console.log(`⭐ Loaded ${portfolioData.watchlist.length} watchlist items`);
            this.renderWatchlist(portfolioData.watchlist);
        } else {
            this.displayEmptyState();
        }
    },
    
    // ✅ AFFICHER LA WATCHLIST (SANS PRIX)
    renderWatchlist(watchlist) {
        const container = document.getElementById('watchlistContainer');
        if (!container) return;
        
        if (!watchlist || watchlist.length === 0) {
            this.displayEmptyState();
            return;
        }
        
        // ✅ MODIFICATION : Supprimer l'affichage du prix
        container.innerHTML = watchlist.map(symbol => `
            <div class='watchlist-card' data-symbol='${symbol}' onclick='AdvancedAnalysis.loadSymbol("${symbol}")'>
                <div class='watchlist-card-header'>
                    <div class='watchlist-symbol'>${symbol}</div>
                    <button class='watchlist-remove' onclick='event.stopPropagation(); WatchlistManager.removeStock("${symbol}")'>
                        <i class='fas fa-trash'></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // ❌ SUPPRIMER : Plus besoin de charger les prix
        // this.loadPrices(watchlist);
        
        console.log('✅ Watchlist rendered (symbols only, no prices)');
    },
    
    // ❌ FONCTION loadPrices() SUPPRIMÉE (plus nécessaire)
    
    // Ajouter un symbole
    async addFromInput() {
        const input = document.getElementById('watchlistSearchInput');
        if (!input) return;
        
        const symbol = input.value.trim().toUpperCase();
        if (!symbol) {
            alert('Please enter a stock symbol');
            return;
        }
        
        await this.addStock(symbol);
        input.value = '';
    },
    
    // Ajouter un symbole au portfolio
    async addStock(symbol) {
        const portfolioName = PortfolioManager.getCurrentPortfolio();
        if (!portfolioName) {
            alert('Please select a portfolio first');
            return;
        }
        
        const portfolioData = await PortfolioManager.loadFromCloud(portfolioName);
        
        // Initialiser watchlist si elle n'existe pas
        if (!portfolioData.watchlist) {
            portfolioData.watchlist = [];
        }
        
        // Vérifier si déjà présent
        if (portfolioData.watchlist.includes(symbol)) {
            alert(`${symbol} is already in your watchlist`);
            return;
        }
        
        // Ajouter le symbole
        portfolioData.watchlist.push(symbol);
        
        // Sauvegarder
        await PortfolioManager.saveToCloud(portfolioName, portfolioData);
        
        // Recharger
        await this.loadWatchlist();
        
        console.log(`✅ Added ${symbol} to watchlist`);
    },
    
    // Supprimer un symbole
    async removeStock(symbol) {
        if (!confirm(`Remove ${symbol} from watchlist?`)) return;
        
        const portfolioName = PortfolioManager.getCurrentPortfolio();
        if (!portfolioName) return;
        
        const portfolioData = await PortfolioManager.loadFromCloud(portfolioName);
        
        // ✅ FIX: Vérifier que watchlist existe ET est un tableau
        if (!portfolioData.watchlist || !Array.isArray(portfolioData.watchlist)) {
            console.warn('⚠ Watchlist is not an array, initializing...');
            portfolioData.watchlist = [];
            return;
        }
        
        // Retirer le symbole
        portfolioData.watchlist = portfolioData.watchlist.filter(s => s !== symbol);
        
        // Sauvegarder
        await PortfolioManager.saveToCloud(portfolioName, portfolioData);
        
        // Recharger
        await this.loadWatchlist();
        
        console.log(`✅ Removed ${symbol} from watchlist`);
    },
    
    // Filtrer (stub)
    filterWatchlist(filter) {
        console.log('📊 Filter:', filter);
        
        const allCards = document.querySelectorAll('.watchlist-card');
        const allButtons = document.querySelectorAll('.filter-btn');
        
        // Update active button
        allButtons.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // ✅ NOTE: Filtrage limité car pas de données de prix
        // Si vous voulez filtrer par gainers/losers, il faudrait réactiver loadPrices()
        
        if (filter === 'all') {
            allCards.forEach(card => card.style.display = 'block');
        } else {
            console.warn('⚠ Gainers/Losers filtering disabled (price data not loaded)');
            alert('Gainers/Losers filtering requires price data.\nCurrently, watchlist displays symbols only.');
        }
    },
    
    // État vide
    displayEmptyState() {
        const container = document.getElementById('watchlistContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class='watchlist-empty'>
                <i class='fas fa-star'></i>
                <p>No stocks in watchlist</p>
                <small>Add stocks to track them</small>
            </div>
        `;
    }
};

// Auto-initialisation
document.addEventListener('DOMContentLoaded', async () => {
    // Attendre que PortfolioManager soit prêt
    let attempts = 0;
    const waitForPortfolio = setInterval(() => {
        if (typeof PortfolioManager !== 'undefined' && PortfolioManager.isFirebaseReady && PortfolioManager.isFirebaseReady()) {
            clearInterval(waitForPortfolio);
            WatchlistManager.init();
        }
        
        attempts++;
        if (attempts > 30) { // 3 secondes max
            clearInterval(waitForPortfolio);
            console.warn('⚠ PortfolioManager timeout, initializing anyway');
            WatchlistManager.init();
        }
    }, 100);
});

// Exposer globalement
window.WatchlistManager = WatchlistManager;

console.log('✅ WatchlistManager loaded (Symbols Only - No Prices)');