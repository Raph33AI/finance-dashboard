/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📊 MARKET TICKER - REAL-TIME DATA FROM FINNHUB
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

class MarketTicker {
    constructor() {
        this.tickerContainer = document.getElementById('tickerContent');
        this.symbols = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 
            'TSLA', 'META', 'NFLX', 'AMD', 'INTC',
            'JPM', 'BAC', 'V', 'MA', 'DIS'
        ];
        this.updateInterval = 30000; // 30 secondes
        this.apiClient = null;
        this.init();
    }

    init() {
        if (!this.tickerContainer) {
            console.warn('⚠️ Market ticker container not found');
            return;
        }

        console.log('📊 Market Ticker initializing...');
        
        // Attendre que l'API client soit disponible
        this.waitForAPIClient();
    }

    waitForAPIClient() {
        const checkAPI = setInterval(() => {
            if (window.TwelveDataClient) {
                clearInterval(checkAPI);
                this.apiClient = new window.TwelveDataClient();
                console.log('✅ API Client connected for Market Ticker');
                this.loadTickerData();
                setInterval(() => this.loadTickerData(), this.updateInterval);
            }
        }, 100);

        // Timeout après 5 secondes
        setTimeout(() => {
            if (!this.apiClient) {
                clearInterval(checkAPI);
                console.warn('⚠️ API Client not available - using mock data');
                this.loadMockData();
            }
        }, 5000);
    }

    async loadTickerData() {
        try {
            console.log('📊 Loading real-time ticker data...');
            
            const promises = this.symbols.map(async (symbol) => {
                try {
                    const quote = await this.apiClient.getQuote(symbol);
                    return {
                        symbol: symbol,
                        price: quote.close || quote.price || 0,
                        change: quote.percent_change || 0,
                        success: true
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
            const validResults = results.filter(r => r.success && r.price > 0);

            if (validResults.length > 0) {
                this.renderTicker(validResults);
                console.log(`✅ Loaded ${validResults.length} stocks`);
            } else {
                console.warn('⚠️ No valid data - using mock data');
                this.loadMockData();
            }
            
        } catch (error) {
            console.error('❌ Error loading ticker data:', error);
            this.loadMockData();
        }
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

    loadMockData() {
        const mockData = [
            { symbol: 'AAPL', price: 178.32, change: 2.4 },
            { symbol: 'MSFT', price: 374.58, change: 1.8 },
            { symbol: 'GOOGL', price: 138.21, change: -0.5 },
            { symbol: 'AMZN', price: 145.78, change: 3.2 },
            { symbol: 'NVDA', price: 485.32, change: 5.7 },
            { symbol: 'TSLA', price: 242.84, change: -1.2 },
            { symbol: 'META', price: 356.77, change: 2.9 },
            { symbol: 'NFLX', price: 489.32, change: 1.5 },
            { symbol: 'AMD', price: 142.67, change: 4.1 },
            { symbol: 'INTC', price: 43.21, change: -0.8 }
        ];

        this.renderTicker(mockData);
    }

    duplicateTickerContent() {
        // Dupliquer pour créer un défilement infini
        const content = this.tickerContainer.innerHTML;
        this.tickerContainer.innerHTML = content + content;
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    window.marketTicker = new MarketTicker();
});