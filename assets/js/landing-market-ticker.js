/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📊 MARKET TICKER - REAL-TIME DATA WITH DYNAMIC MOCK
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

class MarketTicker {
    constructor() {
        this.tickerContainer = document.getElementById('tickerContent');
        this.symbols = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 
            'TSLA', 'META', 'NFLX', 'AMD', 'INTC',
            'JPM', 'BAC', 'V', 'MA', 'DIS'
        ];
        this.updateInterval = 5000; // 5 seconds for dynamic updates
        this.apiClient = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Prix de base pour chaque symbole
        this.basePrices = {
            'AAPL': 178.32,
            'MSFT': 374.58,
            'GOOGL': 138.21,
            'AMZN': 145.78,
            'NVDA': 485.32,
            'TSLA': 242.84,
            'META': 356.77,
            'NFLX': 489.32,
            'AMD': 142.67,
            'INTC': 43.21,
            'JPM': 152.45,
            'BAC': 34.56,
            'V': 245.67,
            'MA': 412.89,
            'DIS': 95.23
        };
        
        // Prix actuels (mis à jour dynamiquement)
        this.currentPrices = { ...this.basePrices };
        
        this.init();
    }

    init() {
        if (!this.tickerContainer) {
            console.warn('⚠️ Market ticker container not found');
            return;
        }

        console.log('📊 Market Ticker initializing...');
        
        // Wait for API client
        this.waitForAPIClient();
    }

    waitForAPIClient() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max

        const checkAPI = setInterval(() => {
            attempts++;

            if (window.TwelveDataClient) {
                clearInterval(checkAPI);
                this.apiClient = new window.TwelveDataClient();
                console.log('✅ API Client connected for Market Ticker');
                this.loadTickerData();
                
                // Update regularly
                setInterval(() => this.loadTickerData(), this.updateInterval);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkAPI);
                console.warn('⚠️ API Client not available - using dynamic mock data');
                this.loadDynamicMockData();
                
                // Update mock data every 5 seconds
                setInterval(() => this.loadDynamicMockData(), this.updateInterval);
            }
        }, 100);
    }

    async loadTickerData() {
        if (!this.apiClient) {
            console.warn('⚠️ API Client not initialized - using dynamic mock data');
            this.loadDynamicMockData();
            return;
        }

        try {
            console.log('📊 Fetching real-time market data from API...');
            
            const promises = this.symbols.map(async (symbol) => {
                try {
                    const quote = await this.apiClient.getQuote(symbol);
                    
                    const price = parseFloat(quote.close || quote.price || quote.last || 0);
                    const previousClose = parseFloat(quote.previous_close || price);
                    const change = previousClose > 0 
                        ? ((price - previousClose) / previousClose) * 100 
                        : parseFloat(quote.percent_change || 0);

                    return {
                        symbol: symbol,
                        price: price,
                        change: change,
                        success: price > 0
                    };
                } catch (error) {
                    console.warn(`⚠️ Error fetching ${symbol}:`, error.message);
                    return {
                        symbol: symbol,
                        price: 0,
                        change: 0,
                        success: false
                    };
                }
            });

            const results = await Promise.all(promises);
            const validResults = results.filter(r => r.success);

            if (validResults.length > 0) {
                console.log(`✅ Loaded ${validResults.length}/${this.symbols.length} stocks from API`);
                this.renderTicker(validResults);
                this.retryCount = 0;
            } else {
                console.warn('⚠️ No valid data from API - using dynamic mock data');
                this.loadDynamicMockData();
            }
            
        } catch (error) {
            console.error('❌ Error loading ticker data:', error);
            
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`🔄 Retrying... (${this.retryCount}/${this.maxRetries})`);
                setTimeout(() => this.loadTickerData(), 2000);
            } else {
                console.warn('⚠️ Max retries reached - using dynamic mock data');
                this.loadDynamicMockData();
            }
        }
    }

    loadDynamicMockData() {
        console.log('📊 Generating dynamic market data...');
        
        const mockData = this.symbols.map(symbol => {
            // Récupérer le prix actuel ou le prix de base
            const currentPrice = this.currentPrices[symbol] || this.basePrices[symbol];
            
            // Générer une variation réaliste (-2% à +2%)
            const variationPercent = (Math.random() - 0.5) * 0.04; // -2% to +2%
            const priceChange = currentPrice * variationPercent;
            const newPrice = currentPrice + priceChange;
            
            // Mettre à jour le prix actuel
            this.currentPrices[symbol] = newPrice;
            
            // Calculer le changement en pourcentage par rapport au prix de base
            const changePercent = ((newPrice - this.basePrices[symbol]) / this.basePrices[symbol]) * 100;
            
            return {
                symbol: symbol,
                price: newPrice,
                change: changePercent
            };
        });

        this.renderTicker(mockData);
    }

    renderTicker(data) {
        const tickerHTML = data.map(stock => {
            const changeClass = stock.change >= 0 ? 'positive' : 'negative';
            const changeSign = stock.change >= 0 ? '+' : '';

            return `
                <div class="ticker-item">
                    <span class="ticker-symbol">${stock.symbol}</span>
                    <span class="ticker-price">$${stock.price.toFixed(2)}</span>
                    <span class="ticker-change ${changeClass}">${changeSign}${stock.change.toFixed(2)}%</span>
                </div>
            `;
        }).join('');

        this.tickerContainer.innerHTML = tickerHTML;
        this.duplicateTickerContent();
    }

    duplicateTickerContent() {
        // Duplicate content for infinite scroll effect
        const content = this.tickerContainer.innerHTML;
        this.tickerContainer.innerHTML = content + content;
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 Initializing Market Ticker...');
    window.marketTicker = new MarketTicker();
});