/* ==============================================
   MARKET-DATA.JS - Market Data Retrieval
   ENHANCED VERSION WITH DIAGNOSTIC AND IMPROVED ROBUSTNESS
   ============================================== */

const MarketData = (function() {
    'use strict';
    
    // ========== API CONFIGURATION ==========
    const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
    const YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart/';
    const YAHOO_QUOTE_BASE = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary/';
    
    // ========== PRIVATE VARIABLES ==========
    let currentStockData = null;
    let technicalIndicators = null;
    
    // ========== MAIN FUNCTIONS ==========
    
    /**
     * Fetches stock data
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
            // Fetch price data (should work)
            const priceData = await fetchFromYahooFinance(symbol, period);
            
            // Fetch detailed information (prone to fail due to 'Invalid Crumb')
            let detailedInfo = {};
            try {
                detailedInfo = await fetchDetailedInfo(symbol);
            } catch (crumbError) {
                console.warn("Could not fetch detailed info due to Yahoo's 'Invalid Crumb' security. Fundamental data will be limited.", crumbError);
                // Continue without detailed data; it will be N/A
                showNotification(`Warning: Fundamental data for ${symbol} may be incomplete. Yahoo's API requires additional security for this data.`, 'warning');
            }
            
            // Merge data
            currentStockData = { ...priceData, ...detailedInfo };
            
            // Calculate technical indicators (depends on prices, so should work)
            technicalIndicators = calculateTechnicalIndicators(priceData);
            
            displayResults(currentStockData, symbol);
            showNotification('Stock data loaded successfully!', 'success');
        } catch (error) {
            console.error('Error fetching stock data:', error);
            showError('Failed to fetch data for ' + symbol + '. ' + error.message);
        } finally {
            showLoading(false);
        }
    }
    
    /**
     * Fetches from Yahoo Finance (with CORS proxy)
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
        console.log('Yahoo Price URL:', yahooUrl);
        console.log('Proxy Price URL:', proxyUrl);
        
        try {
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                console.warn('Network response for price data was not ok. Status:', response.status);
                throw new Error('Network response was not ok (Status: ' + response.status + ')');
            }
            
            const json = await response.json();
            
            console.log('Raw JSON price data response:', json);
            
            if (!json.chart || !json.chart.result || json.chart.result.length === 0) {
                throw new Error('Invalid symbol or no data available for price chart');
            }
            
            if (json.chart.error) {
                throw new Error(json.chart.error.description || 'Yahoo Finance API price chart error');
            }
            
            const result = json.chart.result[0];
            const meta = result.meta;
            const quote = result.indicators.quote[0];
            const timestamps = result.timestamp;
            
            if (!timestamps || timestamps.length === 0) {
                throw new Error('No historical data available for this symbol');
            }
            
            // Clean data
            const cleanData = {
                open: [],
                high: [],
                low: [],
                close: [],
                volume: []
            };
            
            const cleanTimestamps = [];
            
            for (let i = 0; i < timestamps.length; i++) {
                if (timestamps[i] !== null && quote.close[i] !== null && quote.close[i] !== undefined) {
                    cleanTimestamps.push(timestamps[i]);
                    cleanData.open.push(quote.open[i] || quote.close[i]);
                    cleanData.high.push(quote.high[i] || quote.close[i]);
                    cleanData.low.push(quote.low[i] || quote.close[i]);
                    cleanData.close.push(quote.close[i]);
                    cleanData.volume.push(quote.volume[i] || 0);
                }
            }
            
            if (cleanData.close.length === 0) {
                throw new Error('No valid price data found after cleaning');
            }
            
            const currentPrice = meta.regularMarketPrice || cleanData.close[cleanData.close.length - 1];
            const previousClose = meta.chartPreviousClose || cleanData.close[cleanData.close.length - 2] || currentPrice;
            
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
            console.error('Fetch error in price data:', error);
            
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
     * Fetches detailed information (fundamentals)
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
        console.log('Yahoo Quote URL:', yahooUrl);
        console.log('Proxy Quote URL:', proxyUrl);
        
        try {
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                console.warn('Network response for detailed info was not ok. Status:', response.status);
                throw new Error(`Network response was not ok for detailed info (Status: ${response.status})`);
            }
            
            const json = await response.json();
            
            console.log('Raw JSON detailed info response for ' + symbol + ':', json);
            
            if (json.quoteSummary && json.quoteSummary.error && json.quoteSummary.error.description === 'Invalid Crumb') {
                throw new Error('Yahoo Finance API security error: Invalid Crumb. Detailed fundamental data not available.');
            }
            
            if (!json.quoteSummary || !json.quoteSummary.result || json.quoteSummary.result.length === 0) {
                console.warn('No detailed info available in JSON response for', symbol);
                return {};
            }
            
            const result = json.quoteSummary.result[0];
            
            console.log('Parsed detailed result object for ' + symbol + ':', result);
            
            const getValue = (obj, prop, fallback = 'N/A') => {
                if (obj && obj[prop] && (obj[prop].raw !== undefined || obj[prop].fmt !== undefined)) {
                    if (obj[prop].raw !== undefined) {
                        return obj[prop].raw;
                    } else if (obj[prop].fmt !== undefined && obj[prop].fmt !== null) {
                        const parsedFmt = parseFloat(obj[prop].fmt.replace(/,/g, ''));
                        return isNaN(parsedFmt) ? fallback : parsedFmt;
                    }
                }
                return fallback;
            };

            const getStringValue = (obj, prop, fallback = 'N/A') => {
                if (obj && obj[prop] && obj[prop] !== null) {
                    return obj[prop];
                }
                return fallback;
            };
            
            return {
                companyName: getStringValue(profile, 'longName') || getStringValue(profile, 'shortName') || symbol,
                sector: getStringValue(profile, 'sector'),
                industry: getStringValue(profile, 'industry'),
                website: getStringValue(profile, 'website'),
                country: getStringValue(profile, 'country'),
                employees: getValue(profile, 'fullTimeEmployees'),
                description: getStringValue(profile, 'longBusinessSummary') || 'No description available',
                
                marketCap: getValue(summaryDetail, 'marketCap') || getValue(keyStats, 'enterpriseValue'),
                peRatio: getValue(summaryDetail, 'trailingPE') || getValue(keyStats, 'trailingPE'),
                forwardPE: getValue(summaryDetail, 'forwardPE'),
                eps: getValue(keyStats, 'trailingEps'),
                beta: getValue(keyStats, 'beta') || getValue(summaryDetail, 'beta'),
                
                dividendRate: getValue(summaryDetail, 'dividendRate'),
                dividendYield: getValue(summaryDetail, 'dividendYield'),
                exDividendDate: getValue(summaryDetail, 'exDividendDate'),
                payoutRatio: getValue(keyStats, 'payoutRatio'),
                
                profitMargins: getValue(financialData, 'profitMargins'),
                operatingMargins: getValue(financialData, 'operatingMargins'),
                grossMargins: getValue(financialData, 'grossMargins'),
                returnOnAssets: getValue(financialData, 'returnOnAssets'),
                returnOnEquity: getValue(financialData, 'returnOnEquity'),
                
                totalRevenue: getValue(financialData, 'totalRevenue'),
                revenuePerShare: getValue(financialData, 'revenuePerShare'),
                revenueGrowth: getValue(financialData, 'revenueGrowth'),
                earningsGrowth: getValue(financialData, 'earningsGrowth'),
                
                currentRatio: getValue(financialData, 'currentRatio'),
                debtToEquity: getValue(financialData, 'debtToEquity'),
                totalCash: getValue(financialData, 'totalCash'),
                totalDebt: getValue(financialData, 'totalDebt'),
                quickRatio: getValue(financialData, 'quickRatio'),
                
                priceToBook: getValue(keyStats, 'priceToBook'),
                priceToSales: getValue(keyStats, 'priceToSalesTrailing12Months'),
                enterpriseValue: getValue(keyStats, 'enterpriseValue'),
                enterpriseToRevenue: getValue(keyStats, 'enterpriseToRevenue'),
                enterpriseToEbitda: getValue(keyStats, 'enterpriseToEbitda'),
                
                sharesOutstanding: getValue(keyStats, 'sharesOutstanding'),
                floatShares: getValue(keyStats, 'floatShares'),
                sharesShort: getValue(keyStats, 'sharesShort'),
                shortRatio: getValue(keyStats, 'shortRatio'),
                heldPercentInsiders: getValue(keyStats, 'heldPercentInsiders'),
                heldPercentInstitutions: getValue(keyStats, 'heldPercentInstitutions'),
                
                recommendationKey: getStringValue(financialData, 'recommendationKey') || (recommendation.trend && recommendation.trend[0] ? getStringValue(recommendation.trend[0], 'strongBuy') : 'N/A'),
                targetHighPrice: getValue(financialData, 'targetHighPrice'),
                targetLowPrice: getValue(financialData, 'targetLowPrice'),
                targetMeanPrice: getValue(financialData, 'targetMeanPrice'),
                numberOfAnalystOpinions: getValue(financialData, 'numberOfAnalystOpinions')
            };
            
        } catch (error) {
            console.error('Error fetching detailed info:', error);
            throw error; 
        }
    }
    
    /**
     * Calculates technical indicators
     */
    function calculateTechnicalIndicators(data) {
        const prices = data.prices.close;
        const volumes = data.prices.volume;
        const highs = data.prices.high;
        const lows = data.prices.low;
        
        if (prices.length < 200) {
            console.warn('Not enough price data points for all technical indicators.');
            return {
                sma20: null, sma50: null, sma200: null,
                ema12: null, ema26: null, rsi: null,
                macd: null, bollingerBands: null, atr: null,
                obv: null, stochastic: null, adx: null
            };
        }

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
    
    // ========== TECHNICAL INDICATORS ==========
    
    function calculateSMA(data, period) {
        if (!data || data.length < period) return null;
        const slice = data.slice(-period); 
        const sum = slice.reduce((a, b) => a + b, 0);
        return sum / period;
    }
    
    function calculateEMA(data, period) {
        if (!data || data.length < period) return null;
        const multiplier = 2 / (period + 1);
        let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
        
        for (let i = period; i < data.length; i++) {
            ema = (data[i] - ema) * multiplier + ema;
        }
        return ema;
    }
    
    function calculateRSI(prices, period = 14) {
        if (!prices || prices.length < period + 1) return null;
        
        let avgGain = 0;
        let avgLoss = 0;
        
        for (let i = 1; i <= period; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) avgGain += change;
            else avgLoss -= change;
        }
        avgGain /= period;
        avgLoss /= period;

        for (let i = period + 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            let currentGain = 0;
            let currentLoss = 0;
            if (change > 0) currentGain = change;
            else currentLoss = -change;

            avgGain = (avgGain * (period - 1) + currentGain) / period;
            avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
        }
        
        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    function calculateMACD(prices) {
        if (!prices || prices.length < 35) return null;

        const calculateEmaSeries = (data, period) => {
            if (data.length < period) return [];
            const emaSeries = new Array(data.length).fill(null);
            
            let currentEma = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
            for(let i = 0; i < period; i++) emaSeries[i] = currentEma;
            
            const multiplier = 2 / (period + 1);
            for (let i = period; i < data.length; i++) {
                currentEma = (data[i] - currentEma) * multiplier + currentEma;
                emaSeries[i] = currentEma;
            }
            return emaSeries;
        };

        const ema12Series = calculateEmaSeries(prices, 12);
        const ema26Series = calculateEmaSeries(prices, 26);

        if (ema12Series.length === 0 || ema26Series.length === 0) return null;

        const macdLineSeries = [];
        for (let i = 0; i < prices.length; i++) {
            if (ema12Series[i] !== null && ema26Series[i] !== null) {
                macdLineSeries.push(ema12Series[i] - ema26Series[i]);
            } else {
                macdLineSeries.push(null);
            }
        }
        
        const signalLineSeries = calculateEmaSeries(macdLineSeries.filter(val => val !== null), 9);

        const lastMacdLine = macdLineSeries[macdLineSeries.length - 1];
        const lastSignalLine = signalLineSeries[signalLineSeries.length - 1];

        if (lastMacdLine === null || lastSignalLine === null || isNaN(lastMacdLine) || isNaN(lastSignalLine)) return null;
        
        return {
            macd: lastMacdLine,
            signal: lastSignalLine,
            histogram: lastMacdLine - lastSignalLine
        };
    }
    
    function calculateBollingerBands(prices, period = 20) {
        if (!prices || prices.length < period) return null;
        
        const slice = prices.slice(-period);
        const sma = slice.reduce((a, b) => a + b, 0) / period;
        
        const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        
        if (isNaN(sma) || isNaN(stdDev)) return null;

        return {
            upper: sma + (2 * stdDev),
            middle: sma,
            lower: sma - (2 * stdDev)
        };
    }
    
    function calculateATR(highs, lows, closes, period = 14) {
        if (!highs || !lows || !closes || highs.length < period + 1) return null;
        
        let trueRanges = [];
        for (let i = 1; i < closes.length; i++) {
            const tr = Math.max(
                highs[i] - lows[i],
                Math.abs(highs[i] - closes[i - 1]),
                Math.abs(lows[i] - closes[i - 1])
            );
            trueRanges.push(tr);
        }

        if (trueRanges.length < period) return null;

        let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
        for (let i = period; i < trueRanges.length; i++) {
            atr = (atr * (period - 1) + trueRanges[i]) / period;
        }
        return isNaN(atr) ? null : atr;
    }
    
    function calculateOBV(prices, volumes) {
        if (!prices || !volumes || prices.length < 2) return null;
        
        let obv = volumes[0] || 0;
        for (let i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i - 1]) {
                obv += volumes[i];
            } else if (prices[i] < prices[i - 1]) {
                obv -= volumes[i];
            }
        }
        return isNaN(obv) ? null : obv;
    }
    
    function calculateStochastic(highs, lows, closes, period = 14) {
        if (!highs || !lows || !closes || closes.length < period) return null;
        
        const currentHighs = highs.slice(closes.length - period);
        const currentLows = lows.slice(closes.length - period);
        const currentClose = closes[closes.length - 1];
        
        const highestHigh = Math.max(...currentHighs);
        const lowestLow = Math.min(...currentLows);
        
        if (highestHigh === lowestLow) return { k: 0, d: 0 };
        
        const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
        return {
            k: isNaN(k) ? null : k,
            d: isNaN(k) ? null : k
        };
    }
    
    function calculateADX(highs, lows, closes, period = 14) {
        if (!highs || !lows || !closes || highs.length < period + 1) return null;
        
        let dmPlusSeries = [];
        let dmMinusSeries = [];
        let trSeries = [];

        for (let i = 1; i < highs.length; i++) {
            const highDiff = highs[i] - highs[i-1];
            const lowDiff = lows[i-1] - lows[i];
            
            const tr = Math.max(
                highs[i] - lows[i],
                Math.abs(highs[i] - closes[i - 1]),
                Math.abs(lows[i] - closes[i - 1])
            );
            trSeries.push(tr);

            if (highDiff > lowDiff && highDiff > 0) {
                dmPlusSeries.push(highDiff);
                dmMinusSeries.push(0);
            } else if (lowDiff > highDiff && lowDiff > 0) {
                dmMinusSeries.push(lowDiff);
                dmPlusSeries.push(0);
            } else {
                dmPlusSeries.push(0);
                dmMinusSeries.push(0);
            }
        }
        
        if (dmPlusSeries.length < period || dmMinusSeries.length < period || trSeries.length < period) return null;

        const avgDmPlus = dmPlusSeries.slice(-period).reduce((a, b) => a + b, 0) / period;
        const avgDmMinus = dmMinusSeries.slice(-period).reduce((a, b) => a + b, 0) / period;
        const avgTr = trSeries.slice(-period).reduce((a, b) => a + b, 0) / period;

        if (avgTr === 0) return null;

        const diPlus = (avgDmPlus / avgTr) * 100;
        const diMinus = (avgDmMinus / avgTr) * 100;

        const dx = (Math.abs(diPlus - diMinus) / (diPlus + diMinus || 1)) * 100;
        return isNaN(dx) ? null : dx;
    }
    
    /**
     * Calculates volatility (standard deviation of daily returns)
     */
    function calculateVolatility(prices) {
        if (!prices || prices.length < 2) return 0;
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualize volatility (252 trading days per year)
        return isNaN(volatility) ? 0 : volatility;
    }
    
    // ========== DISPLAY RESULTS ==========
    
    /**
     * Displays results
     */
    function displayResults(data, symbol) {
        const resultsSection = document.getElementById('resultsSection');
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        displayStockInfo(data);
        displayCompanyInfo(data);
        displayFinancialMetrics(data);
        displayTechnicalIndicators();
        
        let chartTechnicalDiv = document.getElementById('chartTechnical');
        if (!chartTechnicalDiv) {
            const chartVolumeParent = document.getElementById('chartVolume')?.parentElement;
            if (chartVolumeParent) {
                chartTechnicalDiv = document.createElement('div');
                chartTechnicalDiv.id = 'chartTechnical';
                chartTechnicalDiv.className = 'chart chart-medium';
                chartVolumeParent.appendChild(chartTechnicalDiv);
            } else {
                console.warn("Could not find parent for chartTechnical. RSI chart might not display.");
            }
        }

        createPriceChart(data);
        createVolumeChart(data);
        createTechnicalChart(data);
        
        createStatsTable(data);
        createValuationTable(data);
        displayTradingSignals(data);
    }
    
    /**
     * Displays basic stock information
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
                <div class='value'>${formatNumber(data.currentPrice, 2)} ${data.currency}</div>
            </div>
            <div class='info-card ${isPositive ? 'positive' : 'negative'}'>
                <div class='label'>Change</div>
                <div class='value'>${isPositive ? '+' : ''}${formatNumber(data.change, 2)} (${formatNumber(data.changePercent, 2)}%)</div>
            </div>
            <div class='info-card'>
                <div class='label'>Day High</div>
                <div class='value'>${formatNumber(data.dayHigh, 2)}</div>
            </div>
            <div class='info-card'>
                <div class='label'>Day Low</div>
                <div class='value'>${formatNumber(data.dayLow, 2)}</div>
            </div>
            <div class='info-card'>
                <div class='label'>Volume</div>
                <div class='value'>${formatNumber(data.volume)}</div>
            </div>
            <div class='info-card'>
                <div class='label'>52W High</div>
                <div class='value'>${typeof data.fiftyTwoWeekHigh === 'number' ? formatNumber(data.fiftyTwoWeekHigh, 2) : 'N/A'}</div>
            </div>
            <div class='info-card'>
                <div class='label'>52W Low</div>
                <div class='value'>${typeof data.fiftyTwoWeekLow === 'number' ? formatNumber(data.fiftyTwoWeekLow, 2) : 'N/A'}</div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Displays company information
     */
    function displayCompanyInfo(data) {
        let container = document.getElementById('companyInfo');
        const resultsSection = document.getElementById('resultsSection');
        const stockInfoDiv = document.getElementById('stockInfo');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'companyInfo';
            container.className = 'section';
            resultsSection.insertBefore(container, stockInfoDiv.nextSibling);
        }

        const hasCompanyData = (data.companyName && data.companyName !== data.symbol && data.companyName !== 'N/A') || 
                                (data.description && data.description !== 'No description available' && data.description !== 'N/A') ||
                                (data.sector && data.sector !== 'N/A') || (data.industry && data.industry !== 'N/A');

        if (!hasCompanyData) {
            container.innerHTML = '';
            container.classList.add('hidden');
            return;
        } else {
            container.classList.remove('hidden');
        }

        const descriptionHtml = (data.description && data.description !== 'No description available' && data.description !== 'N/A') ? `
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <strong>About:</strong>
                <p style="margin-top: 10px; line-height: 1.6;">${data.description.substring(0, 500)}${data.description.length > 500 ? '...' : ''}</p>
            </div>
        ` : '';
        
        const html = `
            <h2 class='section-title'>
                🏢 Company Information 
                <span class='help-icon' onclick='openModal("modalMDCompanyInfo")'>?</span>
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div class='info-item'>
                    <strong>Company:</strong> ${data.companyName !== 'N/A' ? data.companyName : ''}
                </div>
                <div class='info-item'>
                    <strong>Sector:</strong> ${data.sector !== 'N/A' ? data.sector : ''}
                </div>
                <div class='info-item'>
                    <strong>Industry:</strong> ${data.industry !== 'N/A' ? data.industry : ''}
                </div>
                <div class='info-item'>
                    <strong>Country:</strong> ${data.country !== 'N/A' ? data.country : ''}
                </div>
                <div class='info-item'>
                    <strong>Employees:</strong> ${formatNumber(data.employees)}
                </div>
                <div class='info-item'>
                    <strong>Exchange:</strong> ${data.exchangeName !== 'N/A' ? data.exchangeName : ''}
                </div>
            </div>
            ${descriptionHtml}
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Displays key financial metrics
     */
    function displayFinancialMetrics(data) {
        let container = document.getElementById('financialMetrics');
        const resultsSection = document.getElementById('resultsSection');
        const companyInfoDiv = document.getElementById('companyInfo');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'financialMetrics';
            container.className = 'section';
            if (companyInfoDiv && !companyInfoDiv.classList.contains('hidden')) {
                resultsSection.insertBefore(container, companyInfoDiv.nextSibling);
            } else {
                resultsSection.insertBefore(container, stockInfoDiv.nextSibling);
            }
        }

        const allMetricsAreNA = [
            data.marketCap, data.peRatio, data.forwardPE, data.eps,
            data.beta, data.dividendYield, data.profitMargins, data.returnOnEquity,
            data.revenueGrowth, data.debtToEquity, data.currentRatio, data.priceToBook
        ].every(val => val === 'N/A' || val === null || val === undefined || isNaN(val));

        if (allMetricsAreNA) {
            container.innerHTML = '<p class="info-message">Financial metrics not available for this symbol (API limitation).</p>';
            container.classList.remove('hidden');
            return;
        } else {
            container.classList.remove('hidden');
        }
        
        const html = `
            <h2 class='section-title'>
                💰 Financial Metrics 
                <span class='help-icon' onclick='openModal("modalMDFinancialMetrics")'>?</span>
            </h2>
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
     * Displays technical indicators
     */
    function displayTechnicalIndicators() {
        let container = document.getElementById('technicalIndicatorsSection');
        const resultsSection = document.getElementById('resultsSection');
        const financialMetricsDiv = document.getElementById('financialMetrics');
        const companyInfoDiv = document.getElementById('companyInfo');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'technicalIndicatorsSection';
            container.className = 'section';
            if (financialMetricsDiv && !financialMetricsDiv.classList.contains('hidden')) {
                resultsSection.insertBefore(container, financialMetricsDiv.nextSibling);
            } else if (companyInfoDiv && !companyInfoDiv.classList.contains('hidden')) {
                 resultsSection.insertBefore(container, companyInfoDiv.nextSibling);
            } else {
                resultsSection.insertBefore(container, stockInfoDiv.nextSibling);
            }
        }

        if (!technicalIndicators || !currentStockData || currentStockData.prices.close.length < 200) {
            container.innerHTML = '<p class="info-message">Technical indicators not calculated (insufficient price data).</p>';
            container.classList.remove('hidden');
            return;
        }
        
        const allIndicatorsAreNull = [
            technicalIndicators.rsi, technicalIndicators.sma20, technicalIndicators.sma50,
            technicalIndicators.sma200, technicalIndicators.bollingerBands?.upper,
            technicalIndicators.bollingerBands?.lower, technicalIndicators.atr,
            technicalIndicators.stochastic?.k, technicalIndicators.macd?.macd, technicalIndicators.adx
        ].every(val => val === null || val === undefined);

        if (allIndicatorsAreNull) {
            container.innerHTML = '<p class="info-message">Technical indicators not available (API limitation or data not suitable).</p>';
            container.classList.remove('hidden');
            return;
        } else {
            container.classList.remove('hidden');
        }

        const rsi = technicalIndicators.rsi;
        const rsiSignal = rsi !== null ? (rsi < 30 ? '🟢 Oversold' : rsi > 70 ? '🔴 Overbought' : '🟡 Neutral') : 'N/A';
        
        const html = `
            <h2 class='section-title'>
                📈 Technical Indicators 
                <span class='help-icon' onclick='openModal("modalMDTechnicalIndicators")'>?</span>
            </h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                ${technicalIndicators.rsi !== null ? `<div class='metric-card'>
                    <div class='metric-label'>RSI (14)</div>
                    <div class='metric-value'>${formatNumber(rsi, 2)}</div>
                    <div class='metric-signal'>${rsiSignal}</div>
                </div>` : ''}
                ${technicalIndicators.sma20 !== null ? `<div class='metric-card'>
                    <div class='metric-label'>SMA 20</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.sma20, 2)}</div>
                </div>` : ''}
                ${technicalIndicators.sma50 !== null ? `<div class='metric-card'>
                    <div class='metric-label'>SMA 50</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.sma50, 2)}</div>
                </div>` : ''}
                ${technicalIndicators.sma200 !== null ? `<div class='metric-card'>
                    <div class='metric-label'>SMA 200</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.sma200, 2)}</div>
                </div>` : ''}
                ${technicalIndicators.bollingerBands?.upper !== null ? `<div class='metric-card'>
                    <div class='metric-label'>Bollinger Upper</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.bollingerBands?.upper, 2)}</div>
                </div>` : ''}
                ${technicalIndicators.bollingerBands?.lower !== null ? `<div class='metric-card'>
                    <div class='metric-label'>Bollinger Lower</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.bollingerBands?.lower, 2)}</div>
                </div>` : ''}
                ${technicalIndicators.atr !== null ? `<div class='metric-card'>
                    <div class='metric-label'>ATR (14)</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.atr, 2)}</div>
                </div>` : ''}
                ${technicalIndicators.stochastic?.k !== null ? `<div class='metric-card'>
                    <div class='metric-label'>Stochastic %K</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.stochastic?.k, 2)}</div>
                </div>` : ''}
                 ${technicalIndicators.macd?.macd !== null ? `<div class='metric-card'>
                    <div class='metric-label'>MACD Line</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.macd?.macd, 2)}</div>
                </div>` : ''}
                ${technicalIndicators.adx !== null ? `<div class='metric-card'>
                    <div class='metric-label'>ADX (14)</div>
                    <div class='metric-value'>${formatNumber(technicalIndicators.adx, 2)}</div>
                </div>` : ''}
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    /**
     * Displays trading signals
     */
    function displayTradingSignals(data) {
        let container = document.getElementById('tradingSignals');
        const resultsSection = document.getElementById('resultsSection');
        const technicalIndicatorsDiv = document.getElementById('technicalIndicatorsSection');
        const chartPriceDiv = document.getElementById('chartPrice');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'tradingSignals';
            container.className = 'section';
            if (technicalIndicatorsDiv && !technicalIndicatorsDiv.classList.contains('hidden')) {
                 resultsSection.insertBefore(container, technicalIndicatorsDiv.nextSibling);
            } else if (chartPriceDiv && chartPriceDiv.parentElement && !chartPriceDiv.parentElement.classList.contains('hidden')) {
                resultsSection.insertBefore(container, chartPriceDiv.parentElement.nextSibling);
            } else {
                resultsSection.appendChild(container);
            }
        }
        
        if (!technicalIndicators || !currentStockData) {
            container.innerHTML = '';
            container.classList.add('hidden');
            return;
        }

        const signals = [];
        const currentPrice = data.currentPrice;
        
        if (technicalIndicators.rsi !== null) {
            if (technicalIndicators.rsi < 30) {
                signals.push({ type: 'buy', indicator: 'RSI', message: 'RSI indicates oversold conditions (potential buy signal)' });
            } else if (technicalIndicators.rsi > 70) {
                signals.push({ type: 'sell', indicator: 'RSI', message: 'RSI indicates overbought conditions (potential sell signal)' });
            }
        }
        
        if (technicalIndicators.sma50 && technicalIndicators.sma200 && currentPrice !== 'N/A') {
            if (technicalIndicators.sma50 > technicalIndicators.sma200 && currentPrice > technicalIndicators.sma50) { 
                signals.push({ type: 'buy', indicator: 'SMA', message: 'Golden Cross: SMA 50 above SMA 200, price above SMA 50 (bullish trend)' });
            } else if (technicalIndicators.sma50 < technicalIndicators.sma200 && currentPrice < technicalIndicators.sma50) { 
                signals.push({ type: 'sell', indicator: 'SMA', message: 'Death Cross: SMA 50 below SMA 200, price below SMA 50 (bearish trend)' });
            }
        }
        
        if (technicalIndicators.bollingerBands && currentPrice !== 'N/A' && data.change !== 'N/A') {
            if (currentPrice < technicalIndicators.bollingerBands.lower && data.change > 0) { 
                signals.push({ type: 'buy', indicator: 'Bollinger', message: 'Price below lower Bollinger Band and rising (potential reversal up)' });
            } else if (currentPrice > technicalIndicators.bollingerBands.upper && data.change < 0) { 
                signals.push({ type: 'sell', indicator: 'Bollinger', message: 'Price above upper Bollinger Band and falling (potential reversal down)' });
            }
        }
        
        if (data.changePercent !== 'N/A') {
            if (data.changePercent > 1 && data.changePercent <= 3) {
                signals.push({ type: 'neutral', indicator: 'Momentum', message: `Moderate upward momentum (+${formatNumber(data.changePercent, 2)}%)` });
            } else if (data.changePercent > 3) {
                signals.push({ type: 'buy', indicator: 'Momentum', message: `Strong upward momentum (+${formatNumber(data.changePercent, 2)}%)` });
            } else if (data.changePercent < -1 && data.changePercent >= -3) {
                signals.push({ type: 'neutral', indicator: 'Momentum', message: `Moderate downward momentum (${formatNumber(data.changePercent, 2)}%)` });
            } else if (data.changePercent < -3) {
                signals.push({ type: 'sell', indicator: 'Momentum', message: `Strong downward momentum (${formatNumber(data.changePercent, 2)}%)` });
            }
        }
        
        let signalsHtml = signals.map(signal => {
            const color = signal.type === 'buy' ? '#28a745' : signal.type === 'sell' ? '#dc3545' : '#6c757d';
            const icon = signal.type === 'buy' ? '⬆️' : signal.type === 'sell' ? '⬇️' : '↔️';
            return `
                <div style="padding: 12px; margin: 8px 0; background: ${color}15; border-left: 4px solid ${color}; border-radius: 4px;">
                    <strong style="color: ${color};">${icon} ${signal.indicator}:</strong> ${signal.message}
                </div>
            `;
        }).join('');
        
        if (signals.length === 0) {
            signalsHtml = '<div style="padding: 12px; background: #f8f9fa; border-radius: 4px; text-align: center;">No strong signals or specific patterns detected for the current period.</div>';
        }
        
        const html = `
            <h2 class='section-title'>
                🎯 Trading Signals 
                <span class='help-icon' onclick='openModal("modalMDTradingSignals")'>?</span>
            </h2>
            ${signalsHtml}
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                <strong>⚠️ Disclaimer:</strong> These signals are for informational purposes only and should not be considered as financial advice. Always do your own research and consult with a financial advisor before making investment decisions.
            </div>
        `;
        
        container.innerHTML = html;
        container.classList.remove('hidden');
    }
    
    /**
     * Creates price chart with moving averages
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
            zIndex: 2,
            tooltip: {
                valueDecimals: 2
            }
        }];
        
        if (technicalIndicators) {
            if (technicalIndicators.sma20 && prices.length >= 20) {
                const sma20SeriesData = [];
                for (let i = 19; i < data.prices.close.length; i++) {
                    const slice = data.prices.close.slice(i - 19, i + 1);
                    sma20SeriesData.push([data.timestamps[i] * 1000, calculateSMA(slice, 20)]);
                }
                series.push({
                    name: 'SMA 20',
                    data: sma20SeriesData,
                    type: 'line',
                    color: '#4A74F3',
                    lineWidth: 1,
                    dashStyle: 'Dash',
                    zIndex: 1,
                    marker: { enabled: false }
                });
            }
            
            if (technicalIndicators.sma50 && prices.length >= 50) {
                const sma50SeriesData = [];
                for (let i = 49; i < data.prices.close.length; i++) {
                    const slice = data.prices.close.slice(i - 49, i + 1);
                    sma50SeriesData.push([data.timestamps[i] * 1000, calculateSMA(slice, 50)]);
                }
                series.push({
                    name: 'SMA 50',
                    data: sma50SeriesData,
                    type: 'line',
                    color: '#8E7DE3',
                    lineWidth: 1,
                    dashStyle: 'Dash',
                    zIndex: 1,
                    marker: { enabled: false }
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
     * Creates volume chart
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
     * Creates technical indicator chart (RSI)
     */
    function createTechnicalChart(data) {
        const chartTechnicalDiv = document.getElementById('chartTechnical');
        if (!technicalIndicators || !technicalIndicators.rsi || data.prices.close.length < 15) {
            if (chartTechnicalDiv) chartTechnicalDiv.classList.add('hidden');
            return;
        } else {
            if (chartTechnicalDiv) chartTechnicalDiv.classList.remove('hidden');
        }
        
        const rsiData = [];
        const prices = data.prices.close;
        const timestamps = data.timestamps;
        const period = 14;

        if (prices.length < period + 1) return;

        let avgGain = 0;
        let avgLoss = 0;
        
        for (let i = 1; i <= period; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) avgGain += change;
            else avgLoss -= change;
        }
        avgGain /= period;
        avgLoss /= period;
        
        if (avgLoss === 0) {
            rsiData.push([timestamps[period] * 1000, 100]);
        } else {
            const rs = avgGain / avgLoss;
            rsiData.push([timestamps[period] * 1000, 100 - (100 / (1 + rs))]);
        }

        for (let i = period + 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            let currentGain = 0;
            let currentLoss = 0;
            if (change > 0) currentGain = change;
            else currentLoss = -change;

            avgGain = (avgGain * (period - 1) + currentGain) / period;
            avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
            
            if (avgLoss === 0) {
                rsiData.push([timestamps[i] * 1000, 100]);
            } else {
                const rs = avgGain / avgLoss;
                rsiData.push([timestamps[i] * 1000, 100 - (100 / (1 + rs))]);
            }
        }

        Highcharts.chart('chartTechnical', {
            chart: {
                backgroundColor: 'transparent'
            },
            title: {
                text: 'RSI (Relative Strength Index) <span class="help-icon help-icon-small" onclick="openModal(\'modalMDRSIChart\')">?</span>',
                useHTML: true,
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
     * Creates statistics table
     */
    function createStatsTable(data) {
        let container = document.getElementById('statsTable');
        const resultsSection = document.getElementById('resultsSection');
        const chartVolumeParent = document.getElementById('chartVolume')?.parentElement;
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'statsTable';
            container.className = 'section';
            if (chartVolumeParent) {
                resultsSection.insertBefore(container, chartVolumeParent.nextSibling);
            } else {
                resultsSection.appendChild(container);
            }
        }

        const prices = data.prices.close;
        
        if (prices.length < 2) {
            container.innerHTML = '<p class="info-message">Not enough data for statistics.</p>';
            container.classList.remove('hidden');
            return;
        }

        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const volatility = calculateVolatility(prices);
        
        const html = `
            <h2 class='section-title'>
                📊 Period Statistics 
                <span class='help-icon' onclick='openModal("modalMDPeriodStatistics")'>?</span>
            </h2>
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
                        <td>${formatNumber(min, 2)} ${data.currency}</td>
                    </tr>
                    <tr>
                        <td><strong>Period Max</strong></td>
                        <td>${formatNumber(max, 2)} ${data.currency}</td>
                    </tr>
                    <tr>
                        <td><strong>Period Average</strong></td>
                        <td>${formatNumber(avg, 2)} ${data.currency}</td>
                    </tr>
                    <tr>
                        <td><strong>Volatility (Annualized Std Dev)</strong></td>
                        <td>${formatNumber(volatility, 2)}%</td>
                    </tr>
                    <tr>
                        <td><strong>Total Return</strong></td>
                        <td>${formatNumber(((prices[prices.length - 1] - prices[0]) / prices[0] * 100), 2)}%</td>
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
        
        container.innerHTML = html;
        container.classList.remove('hidden');
    }
    
    /**
     * Creates valuation table
     */
    function createValuationTable(data) {
        let container = document.getElementById('valuationTable');
        const resultsSection = document.getElementById('resultsSection');
        const statsTableDiv = document.getElementById('statsTable');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'valuationTable';
            container.className = 'section';
            resultsSection.insertBefore(container, statsTableDiv.nextSibling);
        }

        const allMetricsAreNA = [
            data.totalRevenue, data.revenuePerShare, data.operatingMargins,
            data.grossMargins, data.returnOnAssets, data.totalCash,
            data.totalDebt, data.quickRatio, data.enterpriseValue,
            data.enterpriseToRevenue, data.enterpriseToEbitda,
            data.sharesOutstanding, data.heldPercentInsiders, data.heldPercentInstitutions,
            data.recommendationKey, data.numberOfAnalystOpinions
        ].every(val => val === 'N/A' || val === null || val === undefined || isNaN(val));

        if (allMetricsAreNA) {
            container.innerHTML = '<p class="info-message">Valuation & Fundamentals not available for this symbol (API limitation).</p>';
            container.classList.remove('hidden');
            return;
        } else {
            container.classList.remove('hidden');
        }
        
        const html = `
            <h2 class='section-title'>
                💎 Valuation & Fundamentals 
                <span class='help-icon' onclick='openModal("modalMDValuationFundamentals")'>?</span>
            </h2>
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
    
    // ========== FORMATTING UTILITIES ==========
    
    function formatNumber(num, decimals = 0) {
        if (num === 'N/A' || num === null || num === undefined || isNaN(num)) return 'N/A';
        return Number(num).toLocaleString('en-US', { // Changed to 'en-US' for English formatting
            minimumFractionDigits: decimals, 
            maximumFractionDigits: decimals 
        });
    }
    
    function formatLargeNumber(num) {
        if (num === 'N/A' || num === null || num === undefined || isNaN(num)) return 'N/A';
        
        const absNum = Math.abs(num);
        let formatted = '';
        
        if (absNum >= 1e12) formatted = (num / 1e12).toFixed(2) + 'T';
        else if (absNum >= 1e9) formatted = (num / 1e9).toFixed(2) + 'B';
        else if (absNum >= 1e6) formatted = (num / 1e6).toFixed(2) + 'M';
        else if (absNum >= 1e3) formatted = (num / 1e3).toFixed(2) + 'K';
        else formatted = num.toFixed(2);
        
        return formatted; // No longer replacing '.' with ',' for English formatting
    }
    
    function formatPercent(num) {
        if (num === 'N/A' || num === null || num === undefined || isNaN(num)) return 'N/A';
        return (num * 100).toFixed(2) + '%'; // No longer replacing '.' with ',' for English formatting
    }

    function showNotification(message, type = 'info') {
        if (window.FinanceDashboard && typeof window.FinanceDashboard.showNotification === 'function') {
            window.FinanceDashboard.showNotification(message, type);
        } else {
            console.log(`Notification (${type}): ${message}`);
        }
    }
    
    // ========== DISPLAY MANAGEMENT ==========
    
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
        
        const sectionsToClear = ['stockInfo', 'companyInfo', 'financialMetrics', 'technicalIndicatorsSection', 'tradingSignals', 'statsTable', 'valuationTable'];
        sectionsToClear.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = '';
                el.classList.add('hidden');
            }
        });

        Highcharts.charts.forEach(chart => {
            if (chart && chart.renderTo) {
                const chartId = chart.renderTo.id;
                if (['chartPrice', 'chartVolume', 'chartTechnical'].includes(chartId)) {
                    chart.destroy();
                }
            }
        });

        const chartPriceDiv = document.getElementById('chartPrice'); if(chartPriceDiv) chartPriceDiv.innerHTML = '';
        const chartVolumeDiv = document.getElementById('chartVolume'); if(chartVolumeDiv) chartVolumeDiv.innerHTML = '';
        const chartTechnicalDiv = document.getElementById('chartTechnical'); if(chartTechnicalDiv) chartTechnicalDiv.innerHTML = ''; if (chartTechnicalDiv) chartTechnicalDiv.classList.add('hidden');
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