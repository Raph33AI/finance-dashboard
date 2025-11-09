/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📊 MARKET TICKER - 100% REAL-TIME API DATA
   ✅ RAFRAÎCHISSEMENT TOUTES LES HEURES (1h = 3600000 ms)
   NO MOCK DATA - ONLY LIVE MARKET DATA FROM API
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

class MarketTicker {
    constructor() {
        this.tickerContainer = document.getElementById('tickerContent');
        this.symbols = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 
            'TSLA', 'META', 'NFLX', 'AMD', 'INTC',
            'JPM', 'BAC', 'V', 'MA', 'DIS'
        ];
        
        // ✅ CORRECTION : 1 heure au lieu de 30 secondes
        this.updateInterval = 3600000; // 1 HEURE (3600000 ms)
        
        this.apiClient = null;
        this.isLoading = false;
        this.lastUpdate = null;
        
        this.init();
    }

    init() {
        if (!this.tickerContainer) {
            console.error('❌ Market ticker container #tickerContent not found');
            return;
        }

        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');
        console.log('%c📊 Market Ticker - Initializing...', 'color: #3B82F6; font-weight: bold;');
        console.log('%c⏱️  Refresh interval: 1 HOUR', 'color: #10b981; font-weight: bold;');
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');
        
        // Afficher le loading state
        this.showLoadingState();
        
        // Attendre que l'API Client soit disponible
        this.waitForAPIClient();
    }

    showLoadingState() {
        this.tickerContainer.innerHTML = `
            <div class="ticker-item loading">
                <span class="ticker-symbol">⏳</span>
                <span class="ticker-price">Loading real-time data...</span>
                <span class="ticker-change">--</span>
            </div>
        `;
    }

    showErrorState() {
        this.tickerContainer.innerHTML = `
            <div class="ticker-item error">
                <span class="ticker-symbol">⚠️</span>
                <span class="ticker-price">Unable to load market data</span>
                <span class="ticker-change">Check API</span>
            </div>
        `;
    }

    waitForAPIClient() {
        let attempts = 0;
        const maxAttempts = 100; // 10 secondes max

        const checkAPI = setInterval(() => {
            attempts++;

            // ✅ CORRECTION : Utiliser FinanceAPIClient au lieu de TwelveDataClient
            if (window.FinanceAPIClient) {
                clearInterval(checkAPI);
                
                try {
                    // ✅ Utiliser la configuration globale
                    const config = window.APP_CONFIG ? {
                        baseURL: window.APP_CONFIG.API_BASE_URL,
                        cacheDuration: window.APP_CONFIG.CACHE_DURATION.quote,
                        maxRetries: window.APP_CONFIG.MAX_RETRIES
                    } : {};
                    
                    this.apiClient = new window.FinanceAPIClient(config);
                    
                    console.log('%c✅ API Client connected successfully', 'color: #10b981; font-weight: bold;');
                    console.log('📡 Base URL:', this.apiClient.baseURL);
                    console.log('⏱️  Cache Duration:', this.apiClient.cacheDuration / 1000 / 60, 'minutes');
                    console.log('🔄 Refresh Interval:', this.updateInterval / 1000 / 60, 'minutes');
                    console.log('📊 Starting real-time market data stream...');
                    
                    // Charger les données immédiatement
                    this.loadRealTimeData();
                    
                    // ✅ Mettre à jour toutes les heures
                    setInterval(() => {
                        if (!this.isLoading) {
                            console.log('🔄 Hourly refresh triggered...');
                            this.loadRealTimeData();
                        }
                    }, this.updateInterval);
                    
                } catch (error) {
                    console.error('❌ Error initializing API Client:', error);
                    this.showErrorState();
                }
            } else if (attempts >= maxAttempts) {
                clearInterval(checkAPI);
                console.error('❌ FinanceAPIClient not found after 10 seconds');
                console.error('📋 Make sure api-client.js is loaded before landing-market-ticker.js');
                console.error('📋 Check that the class is exported as FinanceAPIClient (not TwelveDataClient)');
                this.showErrorState();
            }

            // Log de progression tous les 2 secondes
            if (attempts % 20 === 0) {
                console.log(`⏳ Waiting for FinanceAPIClient... (${attempts/10}s)`);
            }
        }, 100);
    }

    async loadRealTimeData() {
        if (!this.apiClient) {
            console.error('❌ API Client not initialized');
            this.showErrorState();
            return;
        }

        if (this.isLoading) {
            console.log('⏳ Previous request still loading, skipping...');
            return;
        }

        this.isLoading = true;
        const startTime = Date.now();
        console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');
        console.log('%c📊 Fetching REAL-TIME market data from API...', 'color: #3B82F6; font-weight: bold;');
        console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);

        try {
            // Fetch data for all symbols in parallel
            const promises = this.symbols.map(async (symbol) => {
                try {
                    console.log(`  📈 Fetching ${symbol}...`);
                    const quote = await this.apiClient.getQuote(symbol);
                    
                    // Extraire les données de l'API
                    const price = parseFloat(quote.price || quote.close || quote.last || 0);
                    const change = parseFloat(quote.percentChange || quote.percent_change || 0);

                    if (price > 0) {
                        console.log(`  ✅ ${symbol}: $${price.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)`);
                    } else {
                        console.warn(`  ⚠️ ${symbol}: No valid price data`);
                    }

                    return {
                        symbol: symbol,
                        price: price,
                        change: change,
                        success: price > 0,
                        timestamp: Date.now()
                    };
                } catch (error) {
                    console.error(`  ❌ Error fetching ${symbol}:`, error.message);
                    return {
                        symbol: symbol,
                        price: 0,
                        change: 0,
                        success: false,
                        error: error.message
                    };
                }
            });

            const results = await Promise.all(promises);
            const validResults = results.filter(r => r.success);
            const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);

            if (validResults.length > 0) {
                console.log(`%c✅ Successfully loaded ${validResults.length}/${this.symbols.length} stocks in ${loadTime}s`, 'color: #10b981; font-weight: bold;');
                this.lastUpdate = new Date();
                this.renderTicker(validResults);
                
                // Afficher la prochaine mise à jour
                const nextUpdate = new Date(Date.now() + this.updateInterval);
                console.log(`⏰ Next update at: ${nextUpdate.toLocaleTimeString()}`);
            } else {
                console.error('❌ No valid data received from API');
                this.showErrorState();
            }
            
        } catch (error) {
            console.error('❌ Fatal error loading market data:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
            console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');
        }
    }

    renderTicker(data) {
        if (!data || data.length === 0) {
            this.showErrorState();
            return;
        }

        const tickerHTML = data.map(stock => {
            const changeClass = stock.change >= 0 ? 'positive' : 'negative';
            const changeSign = stock.change >= 0 ? '+' : '';

            return `
                <div class="ticker-item" data-symbol="${stock.symbol}">
                    <span class="ticker-symbol">${stock.symbol}</span>
                    <span class="ticker-price">$${stock.price.toFixed(2)}</span>
                    <span class="ticker-change ${changeClass}">${changeSign}${stock.change.toFixed(2)}%</span>
                </div>
            `;
        }).join('');

        // Mettre à jour le contenu
        this.tickerContainer.innerHTML = tickerHTML;
        
        // Dupliquer pour l'effet de défilement infini
        this.duplicateTickerContent();

        // Log de confirmation
        console.log(`✅ Ticker updated at ${this.lastUpdate.toLocaleTimeString()}`);
        console.log(`⏱️  Cache valid for ${this.apiClient.cacheDuration / 1000 / 60} minutes`);
    }

    duplicateTickerContent() {
        // Dupliquer le contenu pour créer un défilement infini fluide
        const content = this.tickerContainer.innerHTML;
        this.tickerContainer.innerHTML = content + content;
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');
    console.log('%c🎬 Market Ticker - Starting...', 'color: #3B82F6; font-weight: bold;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #3B82F6; font-weight: bold;');
    
    window.marketTicker = new MarketTicker();
});