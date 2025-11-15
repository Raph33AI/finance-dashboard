/**
 * ═══════════════════════════════════════════════════════════════
 * MARKET TICKER - REAL-TIME DATA FROM FINNHUB API
 * ═══════════════════════════════════════════════════════════════
 * Description: Displays a scrolling ticker with live stock prices
 * API: Finnhub (via FinanceAPIClient)
 * Update: Every 1 minute for real-time prices
 * ═══════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981; font-weight: bold;');
    console.log('%c📊 Market Ticker - Initializing...', 'color: #10b981; font-weight: bold; font-size: 16px;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981; font-weight: bold;');

    // ═══════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════
    
    const TICKER_CONFIG = {
        symbols: [
            'AAPL',   // Apple
            'MSFT',   // Microsoft
            'GOOGL',  // Alphabet
            'AMZN',   // Amazon
            'TSLA',   // Tesla
            'NVDA',   // NVIDIA
            'META',   // Meta
            'BRK.B',  // Berkshire Hathaway
            'JPM',    // JPMorgan Chase
            'V',      // Visa
            'WMT',    // Walmart
            'MA',     // Mastercard
            'UNH',    // UnitedHealth
            'HD',     // Home Depot
            'DIS'     // Disney
        ],
        updateInterval: 60000, // 1 minute (60 seconds)
        animationSpeed: 30,    // Pixels per second
        duplicateCount: 2      // Number of times to duplicate the ticker for seamless loop
    };

    // ═══════════════════════════════════════════════════════════
    // CLASS: MarketTicker
    // ═══════════════════════════════════════════════════════════

    class MarketTicker {
        constructor(config) {
            this.config = config;
            this.tickerElement = document.getElementById('tickerContent');
            this.apiClient = null;
            this.updateInterval = null;
            this.quotes = new Map();
            this.isLoading = false;

            console.log('✅ MarketTicker instance created');
            console.log('   📌 Symbols to track:', this.config.symbols.length);
            console.log('   ⏱️  Update interval:', this.config.updateInterval / 1000, 'seconds');
        }

        /**
         * Initialize the ticker
         */
        async init() {
            console.log('\n%c🚀 Initializing Market Ticker...', 'color: #3B82F6; font-weight: bold;');

            // Check if FinanceAPIClient is available
            if (typeof window.FinanceAPIClient === 'undefined') {
                console.error('%c❌ FinanceAPIClient not found!', 'color: #ef4444; font-weight: bold;');
                console.error('   📋 Make sure api-client.js is loaded before landing-market-ticker.js');
                this.showError('API Client not available');
                return;
            }

            // Initialize API Client
            try {
                this.apiClient = new window.FinanceAPIClient({
                    baseURL: 'https://finance-hub-api.raphnardone.workers.dev'
                });
                console.log('✅ FinanceAPIClient initialized with Finnhub Worker');
            } catch (error) {
                console.error('%c❌ Failed to initialize API Client:', 'color: #ef4444; font-weight: bold;');
                console.error(error);
                this.showError('API initialization failed');
                return;
            }

            // Load initial data
            await this.loadQuotes();

            // Start auto-update
            this.startAutoUpdate();

            console.log('%c✅ Market Ticker fully initialized!', 'color: #10b981; font-weight: bold;');
        }

        /**
         * Load quotes for all symbols
         */
        async loadQuotes() {
            console.log('\n📡 Fetching quotes for', this.config.symbols.length, 'symbols...');
            this.isLoading = true;

            const promises = this.config.symbols.map(symbol => this.fetchQuote(symbol));
            
            try {
                await Promise.all(promises);
                console.log('✅ All quotes loaded successfully');
                this.render();
            } catch (error) {
                console.error('❌ Error loading quotes:', error);
                this.showError('Failed to load market data');
            } finally {
                this.isLoading = false;
            }
        }

        /**
         * Fetch quote for a single symbol
         * ✅ CORRECTION : Utilise les propriétés transformées par FinanceAPIClient
         */
        async fetchQuote(symbol) {
            try {
                const quote = await this.apiClient.getQuote(symbol);
                
                console.log(`   📦 Raw quote for ${symbol}:`, quote);
                
                // ✅ CORRECTION : Utiliser les propriétés transformées
                if (quote && typeof quote.price === 'number') {
                    this.quotes.set(symbol, {
                        symbol: symbol,
                        price: quote.price,              // ✅ Propriété transformée
                        change: quote.change || 0,       // ✅ Propriété transformée
                        changePercent: quote.percentChange || 0, // ✅ Propriété transformée
                        previousClose: quote.previousClose || 0  // ✅ Propriété transformée
                    });
                    
                    const sign = quote.percentChange >= 0 ? '+' : '';
                    console.log(`   ✅ ${symbol}: $${quote.price.toFixed(2)} (${sign}${(quote.percentChange || 0).toFixed(2)}%)`);
                } else {
                    console.warn(`   ⚠️ Invalid data for ${symbol}:`, quote);
                }
            } catch (error) {
                console.error(`   ❌ Error fetching ${symbol}:`, error.message);
            }
        }

        /**
         * Render the ticker
         * ✅ CORRECTION : Flèche gérée uniquement en CSS (::before)
         */
        render() {
            if (!this.tickerElement) {
                console.error('❌ Ticker element not found (#tickerContent)');
                return;
            }

            if (this.quotes.size === 0) {
                this.showError('No market data available');
                return;
            }

            console.log('\n🎨 Rendering ticker with', this.quotes.size, 'quotes...');

            let html = '';

            // Duplicate the ticker content for seamless loop
            for (let i = 0; i < this.config.duplicateCount; i++) {
                this.quotes.forEach((quote, symbol) => {
                    const isPositive = quote.changePercent >= 0;
                    const changeClass = isPositive ? 'positive' : 'negative';

                    // ✅ CORRECTION : Pas de flèche dans le HTML, uniquement le pourcentage
                    html += `
                        <div class="ticker-item">
                            <span class="ticker-symbol">${quote.symbol}</span>
                            <span class="ticker-price">$${quote.price.toFixed(2)}</span>
                            <span class="ticker-change ${changeClass}">
                                ${Math.abs(quote.changePercent).toFixed(2)}%
                            </span>
                        </div>
                    `;
                });
            }

            this.tickerElement.innerHTML = html;
            this.startAnimation();

            console.log('✅ Ticker rendered successfully');
        }

        /**
         * Start the scrolling animation
         */
        startAnimation() {
            const tickerWrapper = document.querySelector('.ticker-wrapper');
            if (!tickerWrapper) return;

            // Remove any existing animation
            this.tickerElement.style.animation = 'none';
            
            // Force reflow
            void this.tickerElement.offsetWidth;

            // Calculate animation duration based on content width
            const contentWidth = this.tickerElement.scrollWidth / this.config.duplicateCount;
            const duration = contentWidth / this.config.animationSpeed;

            // Apply animation
            this.tickerElement.style.animation = `ticker-scroll ${duration}s linear infinite`;
            
            console.log('   🎬 Animation started (duration:', duration.toFixed(1), 's)');
        }

        /**
         * Start auto-update interval
         */
        startAutoUpdate() {
            console.log('\n⏱️  Starting auto-update (every', this.config.updateInterval / 1000, 'seconds)...');
            
            this.updateInterval = setInterval(() => {
                console.log('\n🔄 Auto-updating market data...');
                this.loadQuotes();
            }, this.config.updateInterval);

            console.log('✅ Auto-update enabled');
        }

        /**
         * Stop auto-update interval
         */
        stopAutoUpdate() {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
                console.log('⏸️  Auto-update stopped');
            }
        }

        /**
         * Show error message
         */
        showError(message) {
            if (!this.tickerElement) return;

            this.tickerElement.innerHTML = `
                <div class="ticker-item error">
                    <span class="ticker-symbol">⚠️</span>
                    <span class="ticker-price">${message}</span>
                    <span class="ticker-change">Please refresh</span>
                </div>
            `;
        }

        /**
         * Destroy the ticker
         */
        destroy() {
            this.stopAutoUpdate();
            this.quotes.clear();
            if (this.tickerElement) {
                this.tickerElement.innerHTML = '';
            }
            console.log('🗑️  Market Ticker destroyed');
        }
    }

    // ═══════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTicker);
    } else {
        initTicker();
    }

    function initTicker() {
        console.log('\n📍 DOM ready - creating MarketTicker instance...');
        
        // Create global instance
        window.marketTicker = new MarketTicker(TICKER_CONFIG);
        
        // Initialize after a small delay to ensure all scripts are loaded
        setTimeout(() => {
            window.marketTicker.init();
        }, 500);
    }

    console.log('\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #10b981; font-weight: bold;');

})();