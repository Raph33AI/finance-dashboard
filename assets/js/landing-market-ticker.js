/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📊 MARKET TICKER - 100% REAL-TIME API DATA
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
        this.updateInterval = 30000; // 30 secondes (limite API)
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

        console.log('%c📊 Market Ticker - Initializing...', 'color: #3B82F6; font-weight: bold;');
        
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

            // Vérifier si TwelveDataClient existe
            if (window.TwelveDataClient) {
                clearInterval(checkAPI);
                
                try {
                    this.apiClient = new window.TwelveDataClient();
                    console.log('%c✅ API Client connected successfully', 'color: #10b981; font-weight: bold;');
                    console.log('📡 Starting real-time market data stream...');
                    
                    // Charger les données immédiatement
                    this.loadRealTimeData();
                    
                    // Mettre à jour régulièrement
                    setInterval(() => {
                        if (!this.isLoading) {
                            this.loadRealTimeData();
                        }
                    }, this.updateInterval);
                    
                } catch (error) {
                    console.error('❌ Error initializing API Client:', error);
                    this.showErrorState();
                }
            } else if (attempts >= maxAttempts) {
                clearInterval(checkAPI);
                console.error('❌ API Client (TwelveDataClient) not found after 10 seconds');
                console.error('📋 Make sure api-client.js is loaded before landing-market-ticker.js');
                this.showErrorState();
            }

            // Log de progression tous les 2 secondes
            if (attempts % 20 === 0) {
                console.log(`⏳ Waiting for API Client... (${attempts/10}s)`);
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
        console.log('%c📊 Fetching REAL-TIME market data from API...', 'color: #3B82F6; font-weight: bold;');

        try {
            // Fetch data for all symbols in parallel
            const promises = this.symbols.map(async (symbol) => {
                try {
                    console.log(`  📈 Fetching ${symbol}...`);
                    const quote = await this.apiClient.getQuote(symbol);
                    
                    // Extraire les données de l'API
                    const price = parseFloat(quote.close || quote.price || quote.last || 0);
                    const previousClose = parseFloat(quote.previous_close || 0);
                    
                    // Calculer le changement
                    let change = 0;
                    if (quote.percent_change !== undefined) {
                        change = parseFloat(quote.percent_change);
                    } else if (previousClose > 0 && price > 0) {
                        change = ((price - previousClose) / previousClose) * 100;
                    }

                    console.log(`  ✅ ${symbol}: $${price.toFixed(2)} (${change >= 0 ? '+' : ''}${change.toFixed(2)}%)`);

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

            if (validResults.length > 0) {
                console.log(`%c✅ Successfully loaded ${validResults.length}/${this.symbols.length} stocks`, 'color: #10b981; font-weight: bold;');
                this.lastUpdate = new Date();
                this.renderTicker(validResults);
            } else {
                console.error('❌ No valid data received from API');
                this.showErrorState();
            }
            
        } catch (error) {
            console.error('❌ Fatal error loading market data:', error);
            this.showErrorState();
        } finally {
            this.isLoading = false;
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
        console.log(`📊 Ticker updated at ${this.lastUpdate.toLocaleTimeString()}`);
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