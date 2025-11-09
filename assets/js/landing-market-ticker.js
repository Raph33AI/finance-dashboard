/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📊 MARKET TICKER - BANDEROLE DÉFILANTE AVEC FINNHUB
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

class MarketTicker {
    constructor() {
        this.tickerContainer = document.getElementById('tickerContent');
        this.symbols = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 
            'TSLA', 'META', 'NFLX', 'AMD', 'INTC'
        ];
        this.updateInterval = 60000; // 60 secondes
        this.init();
    }

    init() {
        if (!this.tickerContainer) {
            console.warn('⚠️ Market ticker container not found');
            return;
        }

        console.log('📊 Market Ticker initialized');
        
        // Charger les données initiales
        this.loadTickerData();
        
        // Mettre à jour régulièrement
        setInterval(() => this.loadTickerData(), this.updateInterval);
        
        // Dupliquer le contenu pour un défilement infini
        this.duplicateTickerContent();
    }

    async loadTickerData() {
        if (typeof window.finnhubClient === 'undefined') {
            console.warn('⚠️ FinnHub client not available - using mock data');
            return;
        }

        try {
            const promises = this.symbols.map(symbol => 
                window.finnhubClient.getQuote(symbol)
            );

            const results = await Promise.allSettled(promises);
            
            const tickerHTML = results
                .filter(result => result.status === 'fulfilled')
                .map((result, index) => {
                    const data = result.value;
                    const symbol = this.symbols[index];
                    const price = data.c || 0;
                    const change = data.dp || 0;
                    const changeClass = change >= 0 ? 'positive' : 'negative';

                    return `
                        <div class="ticker-item">
                            <span class="ticker-symbol">${symbol}</span>
                            <span class="ticker-price">$${price.toFixed(2)}</span>
                            <span class="ticker-change ${changeClass}">${change > 0 ? '+' : ''}${change.toFixed(2)}%</span>
                        </div>
                    `;
                })
                .join('');

            this.tickerContainer.innerHTML = tickerHTML;
            this.duplicateTickerContent();
            
        } catch (error) {
            console.error('❌ Error loading ticker data:', error);
        }
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