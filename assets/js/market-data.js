/* ==============================================
   MARKET-DATA.JS - Récupération données de marché
   VERSION ENRICHIE AVEC DONNÉES COMPLÈTES
   ============================================== */

const MarketData = (function() {
    'use strict';
    
    // ========== CONFIGURATION API ==========
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';
    const YAHOO_QUOTE_BASE = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary/';
    
    // ========== VARIABLES PRIVÉES ==========
    let currentStockData = null;
    let technicalIndicators = null;
    
    // ========== FONCTIONS PRINCIPALES ==========
    
    /**
     * Récupère les données d'une action
     */
    async function fetchStockData() {
        const symbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
        const period = document.getElementById('timePeriod').value;
        
        if (!symbol) {
            showError('Please enter a stock symbol!');
            return;
        }
        
        showLoading(true);
        hideError();
        hideResults();
        
        try {
            // Récupérer les données de prix
            const priceData = await fetchFromYahooFinance(symbol, period);
            
            // Récupérer les informations détaillées
            const detailedInfo = await fetchDetailedInfo(symbol);
            
            // Fusionner les données
            currentStockData = { ...priceData, ...detailedInfo };
            
            // Calculer les indicateurs techniques
            technicalIndicators = calculateTechnicalIndicators(priceData);
            
            displayResults(currentStockData, symbol);
            window.FinanceDashboard.showNotification('Stock data loaded successfully!', 'success');
        } catch (error) {
            console.error('Error fetching stock data:', error);
            showError('Failed to fetch data for ' + symbol + '. ' + error.message);
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Récupération depuis Yahoo Finance (avec proxy CORS)
     */
    async function fetchFromYahooFinance(symbol, period) {
        const periods = {
            '1D': { range: '1d', interval: '5m' },
            '5D': { range: '5d', interval: '15m' },
            '1M': { range: '1mo', interval: '1d' },
            '3M': { range: '3mo', interval: '1d' },
            '6M': { range: '6mo', interval: '1d' },
            '1Y': { range: '1y', interval: '1d' },
            '5Y': { range: '5y', interval: '1wk' }
        };
        
        const { range, interval } = periods[period] || periods['1M'];
        const yahooUrl = `${YAHOO_FINANCE_BASE}${symbol}?range=${range}&interval=${interval}`;
        const proxyUrl = CORS_PROXY + encodeURIComponent(yahooUrl);
        
        console.log('Fetching price data:', symbol, 'Period:', period);
        
        try {
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error('Network response was not ok (Status: ' + response.status + ')');
            }
            
            const json = await response.json();
            
            if (!json.chart || !json.chart.result || json.chart.result.length === 0) {
                throw new Error('Invalid symbol or no data available');
            }
            
            if (json.chart.error) {
                throw new Error(json.chart.error.description || 'Yahoo Finance API error');
            }
            
            const result = json.chart.result[0];
            const meta = result.meta;
            const quote = result.indicators.quote[0];
            const timestamps = result.timestamp;
            
            if (!timestamps || timestamps.length === 0) {
                throw new Error('No historical data available for this symbol');
            }
            
            // Nettoyer les données
            const cleanData = {
                open: [],
                high: [],
                low: [],
                close: [],
                volume: []
            };
            
            const cleanTimestamps = [];
            
            for (let i = 0; i < timestamps.length; i++) {
                if (quote.close[i] !== null && quote.close[i] !== undefined) {
                    cleanTimestamps.push(timestamps[i]);
                    cleanData.open.push(quote.open[i] || quote.close[i]);
                    cleanData.high.push(quote.high[i] || quote.close[i]);
                    cleanData.low.push(quote.low[i] || quote.close[i]);
                    cleanData.close.push(quote.close[i]);
                    cleanData.volume.push(quote.volume[i] || 0);
                }
            }
            
            if (cleanData.close.length === 0) {
                throw new Error('No valid price data found');
            }
            
            const currentPrice = meta.regularMarketPrice || cleanData.close[cleanData.close.length - 1];
            const previousClose = meta.previousClose || cleanData.close[cleanData.close.length - 2] || currentPrice;
            
            const formattedData = {
                symbol: meta.symbol,
                currency: meta.currency || 'USD',
                currentPrice: currentPrice,
                previousClose: previousClose,
                change: currentPrice - previousClose,
                changePercent: ((currentPrice - previousClose) / previousClose * 100),
                dayHigh: meta.regularMarketDayHigh || Math.max(...cleanData.high),
                dayLow: meta.regularMarketDayLow || Math.min(...cleanData.low),
                volume: cleanData.volume[cleanData.volume.length - 1] || 0,
                timestamps: cleanTimestamps,
                prices: cleanData,
                exchangeName: meta.exchangeName || 'N/A',
                marketState: meta.marketState || 'REGULAR',
                fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 'N/A',
                fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 'N/A'
            };
            
            return formattedData;
            
        } catch (error) {
            console.error('Fetch error:', error);
            
            if (error.message.includes('Invalid symbol')) {
                throw new Error('Stock symbol not found. Please verify the ticker symbol.');
            } else if (error.message.includes('Network')) {
                throw new Error('Network error. Please check your internet connection.');
            } else {
                throw new Error(error.message || 'Unable to fetch stock data');
            }
        }
    }
    
    /**
     * Récupère les informations détaillées (fondamentaux)
     */
    async function fetchDetailedInfo(symbol) {
        const modules = [
            'summaryDetail',
            'financialData',
            'defaultKeyStatistics',
            'assetProfile',
            'earningsHistory',
            'recommendationTrend'
        ].join(',');
        
        const yahooUrl = `${YAHOO_QUOTE_BASE}${symbol}?modules=${modules}`;
        const proxyUrl = CORS_PROXY + encodeURIComponent(yahooUrl);
        
        console.log('Fetching detailed info for:', symbol);
        
        try {
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                console.warn('Could not fetch detailed info');
                return {}; // Retourner un objet vide si ça échoue
            }
            
            const json = await response.json();
            
            if (!json.quoteSummary || !json.quoteSummary.result || json.quoteSummary.result.length === 0) {
                console.warn('No detailed info available');
                return {};
            }
            
            const result = json.quoteSummary.result[0];
            
            // Extraire les données importantes
            const summaryDetail = result.summaryDetail || {};
            const financialData = result.financialData || {};
            const keyStats = result.defaultKeyStatistics || {};
            const profile = result.assetProfile || {};
            const recommendation = result.recommendationTrend || {};
            
            return {
                // Informations de la société
                companyName: profile.longName || profile.shortName || symbol,
                sector: profile.sector || 'N/A',
                industry: profile.industry || 'N/A',
                website: profile.website || 'N/A',
                country: profile.country || 'N/A',
                employees: profile.fullTimeEmployees || 'N/A',
                description: profile.longBusinessSummary || 'No description available',
                
                // Données financières clés
                marketCap: summaryDetail.marketCap?.raw || keyStats.enterpriseValue?.raw || 'N/A',
                peRatio: summaryDetail.trailingPE?.raw || keyStats.trailingPE?.raw || 'N/A',
                forwardPE: summaryDetail.forwardPE?.raw || 'N/A',
                eps: keyStats.trailingEps?.raw || 'N/A',
                beta: keyStats.beta?.raw || summaryDetail.beta?.raw || 'N/A',
                
                // Dividendes
                dividendRate: summaryDetail.dividendRate?.raw || 'N/A',
                dividendYield: summaryDetail.dividendYield?.raw || 'N/A',
                exDividendDate: summaryDetail.exDividendDate?.raw || 'N/A',
                payoutRatio: keyStats.payoutRatio?.raw || 'N/A',
                
                // Rentabilité
                profitMargins: financialData.profitMargins?.raw || 'N/A',
                operatingMargins: financialData.operatingMargins?.raw || 'N/A',
                grossMargins: financialData.grossMargins?.raw || 'N/A',
                returnOnAssets: financialData.returnOnAssets?.raw || 'N/A',
                returnOnEquity: financialData.returnOnEquity?.raw || 'N/A',
                
                // Revenus et croissance
                totalRevenue: financialData.totalRevenue?.raw || 'N/A',
                revenuePerShare: financialData.revenuePerShare?.raw || 'N/A',
                revenueGrowth: financialData.revenueGrowth?.raw || 'N/A',
                earningsGrowth: financialData.earningsGrowth?.raw || 'N/A',
                
                // Liquidité et dette
                currentRatio: financialData.currentRatio?.raw || 'N/A',
                debtToEquity: financialData.debtToEquity?.raw || 'N/A',
                totalCash: financialData.totalCash?.raw || 'N/A',
                totalDebt: financialData.totalDebt?.raw || 'N/A',
                quickRatio: financialData.quickRatio?.raw || 'N/A',
                
                // Valorisation
                priceToBook: keyStats.priceToBook?.raw || 'N/A',
                priceToSales: keyStats.priceToSalesTrailing12Months?.raw || 'N/A',
                enterpriseValue: keyStats.enterpriseValue?.raw || 'N/A',
                enterpriseToRevenue: keyStats.enterpriseToRevenue?.raw || 'N/A',
                enterpriseToEbitda: keyStats.enterpriseToEbitda?.raw || 'N/A',
                
                // Statistiques de trading
                sharesOutstanding: keyStats.sharesOutstanding?.raw || 'N/A',
                floatShares: keyStats.floatShares?.raw || 'N/A',
                sharesShort: keyStats.sharesShort?.raw || 'N/A',
                shortRatio: keyStats.shortRatio?.raw || 'N/A',
                heldPercentInsiders: keyStats.heldPercentInsiders?.raw || 'N/A',
                heldPercentInstitutions: keyStats.heldPercentInstitutions?.raw || 'N/A',
                
                // Recommandations
                recommendationKey: financialData.recommendationKey || 'N/A',
                targetHighPrice: financialData.targetHighPrice?.raw || 'N/A',
                targetLowPrice: financialData.targetLowPrice?.raw || 'N/A',
                targetMeanPrice: financialData.targetMeanPrice?.raw || 'N/A',
                numberOfAnalystOpinions: financialData.numberOfAnalystOpinions?.raw || 'N/A'
            };
            
        } catch (error) {
            console.error('Error fetching detailed info:', error);
            return {}; // Retourner un objet vide en cas d'erreur
        }
    }
    
    /**
     * Calcule les indicateurs techniques
     */
    function calculateTechnicalIndicators(data) {
        const prices = data.prices.close;
        const volumes = data.prices.volume;
        const highs = data.prices.high;
        const lows = data.prices.low;
        
        return {
            sma20: calculateSMA(prices, 20),
            sma50: calculateSMA(prices, 50),
            sma200: calculateSMA(prices, 200),
            ema12: calculateEMA(prices, 12),
            ema26: calculateEMA(prices, 26),
            rsi: calculateRSI(prices, 14),
            macd: calculateMACD(prices),
            bollingerBands: calculateBollingerBands(prices, 20),
            atr: calculateATR(highs, lows, prices, 14),
            obv: calculateOBV(prices, volumes),
            stochastic: calculateStochastic(highs, lows, prices, 14),
            adx: calculateADX(highs, lows, prices, 14)
        };
    }
    
    // ========== INDICATEURS TECHNIQUES ==========
    
    function calculateSMA(data, period) {
        if (data.length < period) return null;
        const slice = data.slice(-period);
        return slice.reduce((a, b) => a + b, 0) / period;
    }
    
    function calculateEMA(data, period) {
        if (data.length < period) return null;
        const multiplier = 2 / (period + 1);
        let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
        
        for (let i = period; i < data.length; i++) {
            ema = (data[i] - ema) * multiplier + ema;
        }
        return ema;
    }
    
    function calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return null;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = prices.length - period; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) gains += change;
            else losses -= change;
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    function calculateMACD(prices) {
        const ema12 = calculateEMA(prices, 12);
        const ema26 = calculateEMA(prices, 26);
        
        if (!ema12 || !ema26) return null;
        
        const macdLine = ema12 - ema26;
        return {
            macd: macdLine,
            signal: macdLine, // Simplifié
            histogram: 0
        };
    }
    
    function calculateBollingerBands(prices, period = 20) {
        if (prices.length < period) return null;
        
        const sma = calculateSMA(prices, period);
        const slice = prices.slice(-period);
        const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        return {
            upper: sma + (2 * stdDev),
            middle: sma,
            lower: sma - (2 * stdDev)
        };
    }
    
    function calculateATR(highs, lows, closes, period = 14) {
        if (highs.length < period + 1) return null;
        
        let atr = 0;
        for (let i = highs.length - period; i < highs.length; i++) {
            const tr = Math.max(
                highs[i] - lows[i],
                Math.abs(highs[i] - closes[i - 1]),
                Math.abs(lows[i] - closes[i - 1])
            );
            atr += tr;
        }
        return atr / period;
    }
    
    function calculateOBV(prices, volumes) {
        if (prices.length < 2) return null;
        
        let obv = 0;
        for (let i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i - 1]) {
                obv += volumes[i];
            } else if (prices[i] < prices[i - 1]) {
                obv -= volumes[i];
            }
        }
        return obv;
    }
    
    function calculateStochastic(highs, lows, closes, period = 14) {
        if (closes.length < period) return null;
        
        const recentHighs = highs.slice(-period);
        const recentLows = lows.slice(-period);
        const currentClose = closes[closes.length - 1];
        
        const highestHigh = Math.max(...recentHighs);
        const lowestLow = Math.min(...recentLows);
        
        const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
        return {
            k: k,
            d: k // Simplifié
        };
    }
    
    function calculateADX(highs, lows, closes, period = 14) {
        if (highs.length < period + 1) return null;
        
        // Version simplifiée de l'ADX
        let dmPlus = 0;
        let dmMinus = 0;
        
        for (let i = highs.length - period; i < highs.length; i++) {
            const highDiff = highs[i] - highs[i - 1];
            const lowDiff = lows[i - 1] - lows[i];
            
            if (highDiff > lowDiff && highDiff > 0) dmPlus += highDiff;
            if (lowDiff > highDiff && lowDiff > 0) dmMinus += lowDiff;
        }
        
        const atr = calculateATR(highs, lows, closes, period);
        if (!atr || atr === 0) return null;
        
        const diPlus = (dmPlus / period) / atr * 100;
        const diMinus = (dmMinus / period) / atr * 100;
        
        const dx = Math.abs(diPlus - diMinus) / (diPlus + diMinus) * 100;
        return dx;
    }
    
    /**
     * Calcule la volatilité
     */
    function calculateVolatility(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        return Math.sqrt(variance) * 100;
    }
    
    // ========== AFFICHAGE DES RÉSULTATS ==========
    
    /**
     * Affiche les résultats
     */
    function displayResults(data, symbol) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        displayStockInfo(data);
        displayCompanyInfo(data);
        displayFinancialMetrics(data);
        displayTechnicalIndicators();
        createPriceChart(data);
        createVolumeChart(data);
        createTechnicalChart(data);
        createStatsTable(data);
        createValuationTable(data);
        displayTradingSignals(data);
    }
    
    /**
     * Affiche les informations de base de l'action
     */
    function displayStockInfo(data) {
        const container = document.getElementById('stockInfo');
        const isPositive = data.change >= 0;
        
        const html = `
            <div class='info-card'>
                <div class='label'>Symbol</div>
                <div class='value'>${data.symbol}</div>
            </div>
            <div class='info-card ${isPositive ? 'positive' : 'negative'}'>
                <div class='label'>Current Price</div>
                <div class='value'>${data.currentPrice.toFixed(2)} ${data.currency}</div>
            </div>
            <div class='info-card ${isPositive ? 'positive' : 'negative'}'>
                <div class='label'>Change</div>
                <div class='value'>${isPositive ? '+' : ''}${data.change.toFixed(2)} (${data.changePercent.toFixed(2)}%)</div>
            </div>
            <div class='info-card'>
                <div class='label'>Day High</div>
                <div class='value'>${data.dayHigh.toFixed(2)}</div>
            </div>
            <div class='info-card'>
                <div class='label'>Day Low</div>
                <div class='value'>${data.dayLow.toFixed(2)}</div>
            </div>
            <div class='info-card'>
                <div class='label'>Volume</div>
                <div class='value'>${formatNumber(data.volume)}</div>
            </div>
            <div class='info-card'>
                <div class='label'>52W High</div>
                <div class='value'>${typeof data.fiftyTwoWeekHigh === 'number' ? data.fiftyTwoWeekHigh.toFixed(2) : 'N/A'}</div>
            </div>
            <div class='info-card'>
                <div class='label'>52W Low</div>
                <div class='value'>${typeof data.fiftyTwoWeekLow === 'number' ? data.fiftyTwoWeekLow.toFixed(2) : 'N/A'}</div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Affiche les informations de la société
     */
    function displayCompanyInfo(data) {
        if (!data.companyName) return;
        
        let container = document.getElementById('companyInfo');
        if (!container) {
            container = document.createElement('div');
            container.id = 'companyInfo';
            container.className = 'section-card';
            document.getElementById('resultsSection').insertBefore(
                container,
                document.getElementById('chartPrice').parentElement
            );
        }
        
        const html = `
            <h3 style="color: #2649B2; margin-bottom: 20px;">📊 Company Information</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class='info-item'>
                    <strong>Company:</strong> ${data.companyName}
                </div>
                <div class='info-item'>
                    <strong>Sector:</strong> ${data.sector}
                </div>
                <div class='info-item'>
                    <strong>Industry:</strong> ${data.industry}
                </div>
                <div class='info-item'>
                    <strong>Country:</strong> ${data.country}
                </div>
                <div class='info-item'>
                    <strong>Employees:</strong> ${formatNumber(data.employees)}
                </div>
                <div class='info-item'>
                    <strong>Exchange:</strong> ${data.exchangeName}
                </div>
            </div>
            ${data.description !== 'No description available' ? `
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                    <strong>About:</strong>
                    <p style="margin-top: 10px; line-height: 1.6;">${data.description.substring(0, 500)}${data.description.length > 500 ? '...' : ''}</p>
                </div>
            ` : ''}
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Affiche les métriques financières clés
     */
    function displayFinancialMetrics(data) {
        let container = document.getElementById('financialMetrics');
        if (!container) {
            container = document.createElement('div');
            container.id = 'financialMetrics';
            container.className = 'section-card';
            document.getElementById('resultsSection').appendChild(container);
        }
        
        const html = `
            <h3 style="color: #4A74F3; margin-bottom: 20px;">💰 Financial Metrics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                <div class='metric-card'>
                    <div class='metric-label'>Market Cap</div>
                    <div class='metric-value'>${formatLargeNumber(data.marketCap)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>P/E Ratio (TTM)</div>
                    <div class='metric-value'>${formatNumber(data.peRatio, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Forward P/E</div>
                    <div class='metric-value'>${formatNumber(data.forwardPE, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>EPS (TTM)</div>
                    <div class='metric-value'>${formatNumber(data.eps, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Beta</div>
                    <div class='metric-value'>${formatNumber(data.beta, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Dividend Yield</div>
                    <div class='metric-value'>${formatPercent(data.dividendYield)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Profit Margin</div>
                    <div class='metric-value'>${formatPercent(data.profitMargins)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>ROE</div>
                    <div class='metric-value'>${formatPercent(data.returnOnEquity)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Revenue Growth</div>
                    <div class='metric-value'>${formatPercent(data.revenueGrowth)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Debt to Equity</div>
                    <div class='metric-value'>${formatNumber(data.debtToEquity, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Current Ratio</div>
                    <div class='metric-value'>${formatNumber(data.currentRatio, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Price to Book</div>
                    <div class='metric-value'>${formatNumber(data.priceToBook, 2)}</div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Affiche les indicateurs techniques
     */
    function displayTechnicalIndicators() {
        if (!technicalIndicators) return;
        
        let container = document.getElementById('technicalIndicatorsSection');
        if (!container) {
            container = document.createElement('div');
            container.id = 'technicalIndicatorsSection';
            container.className = 'section-card';
            document.getElementById('resultsSection').appendChild(container);
        }
        
        const rsi = technicalIndicators.rsi;
        const rsiSignal = rsi < 30 ? '🟢 Oversold' : rsi > 70 ? '🔴 Overbought' : '🟡 Neutral';
        
        const html = `
            <h3 style="color: #8E7DE3; margin-bottom: 20px;">📈 Technical Indicators</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class='metric-card'>
                    <div class='metric-label'>RSI (14)</div>
                    <div class='metric-value'>${formatNumber(rsi, 2)}</div>
                    <div class='metric-signal'>${rsiSignal}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>SMA 20</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.sma20, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>SMA 50</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.sma50, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>SMA 200</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.sma200, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Bollinger Upper</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.bollingerBands?.upper, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Bollinger Lower</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.bollingerBands?.lower, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>ATR (14)</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.atr, 2)}</div>
                </div>
                <div class='metric-card'>
                    <div class='metric-label'>Stochastic %K</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.stochastic?.k, 2)}</div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Affiche les signaux de trading
     */
    function displayTradingSignals(data) {
        if (!technicalIndicators) return;
        
        let container = document.getElementById('tradingSignals');
        if (!container) {
            container = document.createElement('div');
            container.id = 'tradingSignals';
            container.className = 'section-card';
            document.getElementById('resultsSection').appendChild(container);
        }
        
        const signals = [];
        const currentPrice = data.currentPrice;
        
        // Signaux basés sur RSI
        if (technicalIndicators.rsi < 30) {
            signals.push({ type: 'buy', indicator: 'RSI', message: 'RSI indicates oversold conditions (potential buy signal)' });
        } else if (technicalIndicators.rsi > 70) {
            signals.push({ type: 'sell', indicator: 'RSI', message: 'RSI indicates overbought conditions (potential sell signal)' });
        }
        
        // Signaux basés sur SMA
        if (technicalIndicators.sma50 && technicalIndicators.sma200) {
            if (technicalIndicators.sma50 > technicalIndicators.sma200) {
                signals.push({ type: 'buy', indicator: 'SMA', message: 'Golden Cross: SMA 50 above SMA 200 (bullish trend)' });
            } else {
                signals.push({ type: 'sell', indicator: 'SMA', message: 'Death Cross: SMA 50 below SMA 200 (bearish trend)' });
            }
        }
        
        // Signaux basés sur Bollinger Bands
        if (technicalIndicators.bollingerBands) {
            if (currentPrice < technicalIndicators.bollingerBands.lower) {
                signals.push({ type: 'buy', indicator: 'Bollinger', message: 'Price below lower Bollinger Band (potential reversal up)' });
            } else if (currentPrice > technicalIndicators.bollingerBands.upper) {
                signals.push({ type: 'sell', indicator: 'Bollinger', message: 'Price above upper Bollinger Band (potential reversal down)' });
            }
        }
        
        // Signal basé sur la tendance
        if (data.changePercent > 3) {
            signals.push({ type: 'neutral', indicator: 'Momentum', message: `Strong upward momentum (+${data.changePercent.toFixed(2)}%)` });
        } else if (data.changePercent < -3) {
            signals.push({ type: 'neutral', indicator: 'Momentum', message: `Strong downward momentum (${data.changePercent.toFixed(2)}%)` });
        }
        
        let signalsHtml = signals.map(signal => {
            const color = signal.type === 'buy' ? '#28a745' : signal.type === 'sell' ? '#dc3545' : '#6c757d';
            const icon = signal.type === 'buy' ? '📈' : signal.type === 'sell' ? '📉' : '📊';
            return `
                <div style="padding: 12px; margin: 8px 0; background: ${color}15; border-left: 4px solid ${color}; border-radius: 4px;">
                    <strong style="color: ${color};">${icon} ${signal.indicator}:</strong> ${signal.message}
                </div>
            `;
        }).join('');
        
        if (signals.length === 0) {
            signalsHtml = '<div style="padding: 12px; background: #f8f9fa; border-radius: 4px; text-align: center;">No strong signals detected</div>';
        }
        
        const html = `
            <h3 style="color: #9D5CE6; margin-bottom: 20px;">🎯 Trading Signals</h3>
            ${signalsHtml}
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                <strong>⚠️ Disclaimer:</strong> These signals are for informational purposes only and should not be considered as financial advice. Always do your own research and consult with a financial advisor before making investment decisions.
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Crée le graphique de prix avec moyennes mobiles
     */
    function createPriceChart(data) {
        const prices = data.timestamps.map((timestamp, i) => [
            timestamp * 1000,
            data.prices.close[i]
        ]);
        
        const series = [{
            name: data.symbol,
            data: prices,
            color: '#2649B2',
            fillColor: {
                linearGradient: [0, 0, 0, 300],
                stops: [
                    [0, 'rgba(38,73,178,0.5)'],
                    [1, 'rgba(38,73,178,0.05)']
                ]
            },
            lineWidth: 2,
            zIndex: 2
        }];
        
        // Ajouter les moyennes mobiles si disponibles
        if (technicalIndicators) {
            if (technicalIndicators.sma20) {
                const sma20Data = data.timestamps.map(ts => [ts * 1000, technicalIndicators.sma20]);
                series.push({
                    name: 'SMA 20',
                    data: sma20Data.slice(-20),
                    color: '#4A74F3',
                    lineWidth: 1,
                    dashStyle: 'Dash',
                    zIndex: 1
                });
            }
            
            if (technicalIndicators.sma50) {
                const sma50Data = data.timestamps.map(ts => [ts * 1000, technicalIndicators.sma50]);
                series.push({
                    name: 'SMA 50',
                    data: sma50Data.slice(-50),
                    color: '#8E7DE3',
                    lineWidth: 1,
                    dashStyle: 'Dash',
                    zIndex: 1
                });
            }
        }
        
        Highcharts.chart('chartPrice', {
            chart: {
                type: 'area',
                backgroundColor: 'transparent',
                zoomType: 'x'
            },
            title: {
                text: data.symbol + ' - Price Evolution',
                style: { color: '#2649B2', fontSize: '1.3em', fontWeight: 'bold' }
            },
            xAxis: {
                type: 'datetime',
                crosshair: true
            },
            yAxis: {
                title: {
                    text: 'Price (' + data.currency + ')',
                    style: { color: '#2649B2', fontWeight: 'bold' }
                }
            },
            tooltip: {
                shared: true,
                valueDecimals: 2,
                valueSuffix: ' ' + data.currency,
                xDateFormat: '%Y-%m-%d %H:%M'
            },
            series: series,
            plotOptions: {
                area: {
                    marker: { enabled: false }
                },
                line: {
                    marker: { enabled: false }
                }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Crée le graphique de volume
     */
    function createVolumeChart(data) {
        const volumes = data.timestamps.map((timestamp, i) => [
            timestamp * 1000,
            data.prices.volume[i] || 0
        ]);
        
        Highcharts.chart('chartVolume', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent'
            },
            title: {
                text: 'Trading Volume',
                style: { color: '#9D5CE6', fontSize: '1.2em', fontWeight: 'bold' }
            },
            xAxis: {
                type: 'datetime',
                crosshair: true
            },
            yAxis: {
                title: {
                    text: 'Volume',
                    style: { color: '#9D5CE6', fontWeight: 'bold' }
                }
            },
            tooltip: {
                valueDecimals: 0,
                xDateFormat: '%Y-%m-%d'
            },
            series: [{
                name: 'Volume',
                data: volumes,
                color: '#9D5CE6',
                borderRadius: '25%'
            }],
            plotOptions: {
                column: {
                    borderRadius: '25%'
                }
            },
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    /**
     * Crée le graphique des indicateurs techniques (RSI)
     */
    function createTechnicalChart(data) {
        if (!technicalIndicators || !technicalIndicators.rsi) return;
        
        // Créer un conteneur pour le graphique RSI s'il n'existe pas
        let container = document.getElementById('chartTechnical');
        if (!container) {
            const volumeChart = document.getElementById('chartVolume');
            container = document.createElement('div');
            container.id = 'chartTechnical';
            container.style.cssText = 'width: 100%; height: 300px; margin-top: 20px;';
            volumeChart.parentElement.appendChild(container);
        }
        
        // Calculer le RSI pour chaque point
        const rsiData = [];
        const prices = data.prices.close;
        
        for (let i = 14; i < prices.length; i++) {
            const slice = prices.slice(i - 14, i + 1);
            let gains = 0;
            let losses = 0;
            
            for (let j = 1; j < slice.length; j++) {
                const change = slice[j] - slice[j - 1];
                if (change > 0) gains += change;
                else losses -= change;
            }
            
            const avgGain = gains / 14;
            const avgLoss = losses / 14;
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));
            
            rsiData.push([data.timestamps[i] * 1000, rsi]);
        }
        
        Highcharts.chart('chartTechnical', {
            chart: {
                backgroundColor: 'transparent'
            },
            title: {
                text: 'RSI (Relative Strength Index)',
                style: { color: '#6C8BE0', fontSize: '1.2em', fontWeight: 'bold' }
            },
            xAxis: {
                type: 'datetime',
                crosshair: true
            },
            yAxis: {
                title: {
                    text: 'RSI',
                    style: { color: '#6C8BE0', fontWeight: 'bold' }
                },
                min: 0,
                max: 100,
                plotLines: [
                    {
                        value: 70,
                        color: '#dc3545',
                        dashStyle: 'Dash',
                        width: 1,
                        label: { text: 'Overbought (70)', style: { color: '#dc3545' } }
                    },
                    {
                        value: 30,
                        color: '#28a745',
                        dashStyle: 'Dash',
                        width: 1,
                        label: { text: 'Oversold (30)', style: { color: '#28a745' } }
                    }
                ]
            },
            tooltip: {
                valueDecimals: 2,
                xDateFormat: '%Y-%m-%d'
            },
            series: [{
                name: 'RSI',
                data: rsiData,
                color: '#6C8BE0',
                lineWidth: 2
            }],
            plotOptions: {
                line: {
                    marker: { enabled: false }
                }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Crée le tableau de statistiques
     */
    function createStatsTable(data) {
        const prices = data.prices.close;
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const volatility = calculateVolatility(prices);
        
        const html = `
            <h3 style="color: #2649B2; margin-bottom: 15px;">📊 Period Statistics</h3>
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Period Min</strong></td>
                        <td>${min.toFixed(2)} ${data.currency}</td>
                    </tr>
                    <tr>
                        <td><strong>Period Max</strong></td>
                        <td>${max.toFixed(2)} ${data.currency}</td>
                    </tr>
                    <tr>
                        <td><strong>Period Average</strong></td>
                        <td>${avg.toFixed(2)} ${data.currency}</td>
                    </tr>
                    <tr>
                        <td><strong>Volatility (Std Dev)</strong></td>
                        <td>${volatility.toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td><strong>Total Return</strong></td>
                        <td>${((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(2)}%</td>
                    </tr>
                    <tr>
                        <td><strong>Data Points</strong></td>
                        <td>${prices.length}</td>
                    </tr>
                    <tr>
                        <td><strong>Average Volume</strong></td>
                        <td>${formatNumber(data.prices.volume.reduce((a, b) => a + b, 0) / data.prices.volume.length)}</td>
                    </tr>
                    <tr>
                        <td><strong>Market State</strong></td>
                        <td>${data.marketState}</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        document.getElementById('statsTable').innerHTML = html;
    }
    
    /**
     * Crée le tableau de valorisation
     */
    function createValuationTable(data) {
        if (!data.marketCap) return;
        
        let container = document.getElementById('valuationTable');
        if (!container) {
            container = document.createElement('div');
            container.id = 'valuationTable';
            container.className = 'section-card';
            document.getElementById('resultsSection').appendChild(container);
        }
        
        const html = `
            <h3 style="color: #4A74F3; margin-bottom: 15px;">💎 Valuation & Fundamentals</h3>
            <table>
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Total Revenue</strong></td>
                        <td>${formatLargeNumber(data.totalRevenue)}</td>
                    </tr>
                    <tr>
                        <td><strong>Revenue Per Share</strong></td>
                        <td>${formatNumber(data.revenuePerShare, 2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Operating Margin</strong></td>
                        <td>${formatPercent(data.operatingMargins)}</td>
                    </tr>
                    <tr>
                        <td><strong>Gross Margin</strong></td>
                        <td>${formatPercent(data.grossMargins)}</td>
                    </tr>
                    <tr>
                        <td><strong>ROA (Return on Assets)</strong></td>
                        <td>${formatPercent(data.returnOnAssets)}</td>
                    </tr>
                    <tr>
                        <td><strong>Total Cash</strong></td>
                        <td>${formatLargeNumber(data.totalCash)}</td>
                    </tr>
                    <tr>
                        <td><strong>Total Debt</strong></td>
                        <td>${formatLargeNumber(data.totalDebt)}</td>
                    </tr>
                    <tr>
                        <td><strong>Quick Ratio</strong></td>
                        <td>${formatNumber(data.quickRatio, 2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Enterprise Value</strong></td>
                        <td>${formatLargeNumber(data.enterpriseValue)}</td>
                    </tr>
                    <tr>
                        <td><strong>EV/Revenue</strong></td>
                        <td>${formatNumber(data.enterpriseToRevenue, 2)}</td>
                    </tr>
                    <tr>
                        <td><strong>EV/EBITDA</strong></td>
                        <td>${formatNumber(data.enterpriseToEbitda, 2)}</td>
                    </tr>
                    <tr>
                        <td><strong>Shares Outstanding</strong></td>
                        <td>${formatLargeNumber(data.sharesOutstanding)}</td>
                    </tr>
                    <tr>
                        <td><strong>Held by Insiders</strong></td>
                        <td>${formatPercent(data.heldPercentInsiders)}</td>
                    </tr>
                    <tr>
                        <td><strong>Held by Institutions</strong></td>
                        <td>${formatPercent(data.heldPercentInstitutions)}</td>
                    </tr>
                    <tr>
                        <td><strong>Analyst Rating</strong></td>
                        <td>${data.recommendationKey !== 'N/A' ? data.recommendationKey.toUpperCase() : 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Number of Analysts</strong></td>
                        <td>${formatNumber(data.numberOfAnalystOpinions)}</td>
                    </tr>
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
    }
    
    // ========== UTILITAIRES DE FORMATAGE ==========
    
    function formatNumber(num, decimals = 0) {
        if (num === 'N/A' || num === null || num === undefined || isNaN(num)) return 'N/A';
        return Number(num).toLocaleString('en-US', { 
            minimumFractionDigits: decimals, 
            maximumFractionDigits: decimals 
        });
    }
    
    function formatLargeNumber(num) {
        if (num === 'N/A' || num === null || num === undefined || isNaN(num)) return 'N/A';
        
        const absNum = Math.abs(num);
        
        if (absNum >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (absNum >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (absNum >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (absNum >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        
        return num.toFixed(2);
    }
    
    function formatPercent(num) {
        if (num === 'N/A' || num === null || num === undefined || isNaN(num)) return 'N/A';
        return (num * 100).toFixed(2) + '%';
    }
    
    // ========== GESTION DE L'AFFICHAGE ==========
    
    function loadQuickStock(symbol) {
        document.getElementById('stockSymbol').value = symbol;
        fetchStockData();
    }
    
    function showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        if (loader) {
            if (show) {
                loader.classList.remove('hidden');
            } else {
                loader.classList.add('hidden');
            }
        }
    }
    
    function hideResults() {
        const results = document.getElementById('resultsSection');
        if (results) results.classList.add('hidden');
    }
    
    function showError(message) {
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');
        if (errorSection && errorMessage) {
            errorMessage.textContent = message;
            errorSection.classList.remove('hidden');
            errorSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    function hideError() {
        const errorSection = document.getElementById('errorSection');
        if (errorSection) errorSection.classList.add('hidden');
    }
    
    // ========== EXPORTS ==========
    return {
        fetchStockData,
        loadQuickStock
    };
})();