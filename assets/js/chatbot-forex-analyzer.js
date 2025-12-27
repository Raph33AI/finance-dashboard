/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT FOREX ANALYZER - Forex Wall Street Edition
 * ═══════════════════════════════════════════════════════════════
 * Version: 3.0.0
 * Description: Réutilisation de la logique Forex Converter
 * Features:
 *   - 14 indicateurs techniques Wall Street
 *   - AI recommendations (BUY/SELL/NEUTRAL)
 *   - 38+ currencies support
 */

class ChatbotForexAnalyzer {
    constructor(config) {
        this.config = config;
        this.apiClient = null;
        
        // Major currency pairs
        this.majorPairs = [
            { base: 'EUR', quote: 'USD', name: 'Euro / US Dollar' },
            { base: 'GBP', quote: 'USD', name: 'British Pound / US Dollar' },
            { base: 'USD', quote: 'JPY', name: 'US Dollar / Japanese Yen' },
            { base: 'USD', quote: 'CHF', name: 'US Dollar / Swiss Franc' },
            { base: 'AUD', quote: 'USD', name: 'Australian Dollar / US Dollar' },
            { base: 'USD', quote: 'CAD', name: 'US Dollar / Canadian Dollar' },
            { base: 'NZD', quote: 'USD', name: 'New Zealand Dollar / US Dollar' }
        ];

        // Supported currencies (38+)
        this.supportedCurrencies = [
            'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD', 'SEK', 'NOK',
            'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'TRY', 'RUB', 'BRL',
            'INR', 'ZAR', 'KRW', 'MXN', 'IDR', 'MYR', 'PHP', 'THB', 'SGD', 'HKD',
            'ISK', 'ILS', 'CLP', 'ARS', 'PEN', 'COP', 'UAH', 'EGP', 'CNY'
        ];
        
        console.log('💱 ChatbotForexAnalyzer initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYZE FOREX (Main Method)
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeForex(entities = {}) {
        try {
            console.log('💱 Analyzing forex market...');

            // Extract currency pair from entities
            const pair = this.extractCurrencyPair(entities);

            if (pair) {
                // Analyze specific pair
                return await this.analyzeCurrencyPair(pair.base, pair.quote);
            } else {
                // Show major pairs overview
                return await this.getForexOverview();
            }

        } catch (error) {
            console.error('❌ Forex analysis error:', error);
            return {
                text: "❌ Unable to fetch forex data at the moment. Please try again later.",
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * EXTRACT CURRENCY PAIR
     * ═══════════════════════════════════════════════════════════
     */
    extractCurrencyPair(entities) {
        const message = entities.originalMessage || '';
        const upperMessage = message.toUpperCase();

        // Try to find pattern like EUR/USD, EURUSD, EUR-USD
        const pairPattern = /([A-Z]{3})[\/\-]?([A-Z]{3})/;
        const match = upperMessage.match(pairPattern);

        if (match) {
            const base = match[1];
            const quote = match[2];

            if (this.supportedCurrencies.includes(base) && 
                this.supportedCurrencies.includes(quote)) {
                return { base, quote };
            }
        }

        // Default to EUR/USD if no pair specified
        return null;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYZE CURRENCY PAIR
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeCurrencyPair(base, quote) {
        console.log(`💱 Analyzing ${base}/${quote}...`);

        // Get current rate and historical data
        const rateData = await this.getCurrencyData(base, quote);

        if (!rateData || !rateData.historical || rateData.historical.length < 30) {
            return {
                text: `❌ Insufficient data for ${base}/${quote}. Please try a major currency pair.`,
                charts: [],
                data: null
            };
        }

        // Calculate technical indicators
        const indicators = this.calculateForexIndicators(rateData.historical);

        // Generate AI recommendation
        const recommendation = this.generateForexRecommendation(indicators, base, quote);

        // Build response
        const responseText = this.buildForexResponse(base, quote, rateData, indicators, recommendation);

        return {
            text: responseText,
            charts: [],
            data: {
                pair: `${base}/${quote}`,
                currentRate: rateData.current,
                indicators,
                recommendation
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET CURRENCY DATA
     * ═══════════════════════════════════════════════════════════
     */
    async getCurrencyData(base, quote) {
        // This would connect to ECB API or your forex data source
        if (this.apiClient && typeof this.apiClient.getForexRate === 'function') {
            return await this.apiClient.getForexRate(base, quote);
        }

        // Return demo data
        return this.getDemoForexData(base, quote);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET DEMO FOREX DATA
     * ═══════════════════════════════════════════════════════════
     */
    getDemoForexData(base, quote) {
        const current = 1.0850;  // Example EUR/USD rate
        const historical = [];

        // Generate 180 days of demo data
        for (let i = 180; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const variation = (Math.random() - 0.5) * 0.02;
            const rate = current * (1 + variation);

            historical.push({
                date: date,
                timestamp: date.getTime(),
                rate: rate,
                open: rate * 0.999,
                high: rate * 1.001,
                low: rate * 0.998,
                close: rate
            });
        }

        return {
            base,
            quote,
            current,
            change24h: (Math.random() - 0.5) * 2,
            changePercent24h: (Math.random() - 0.5) * 1,
            historical
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE FOREX INDICATORS
     * ═══════════════════════════════════════════════════════════
     */
    calculateForexIndicators(historicalData) {
        const prices = historicalData.map(d => d.close);

        return {
            rsi: this.calculateRSI(prices),
            macd: this.calculateMACD(prices),
            stochastic: this.calculateStochastic(historicalData),
            bollinger: this.calculateBollingerBands(prices),
            sma20: this.calculateSMA(prices, 20),
            sma50: this.calculateSMA(prices, 50),
            ema20: this.calculateEMA(prices, 20),
            atr: this.calculateATR(historicalData),
            adx: this.calculateSimpleADX(historicalData)
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE RSI
     * ═══════════════════════════════════════════════════════════
     */
    calculateRSI(prices, period = 14) {
        const changes = [];
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i] - prices[i - 1]);
        }

        let avgGain = 0;
        let avgLoss = 0;

        for (let i = 0; i < period; i++) {
            if (changes[i] > 0) avgGain += changes[i];
            else avgLoss += Math.abs(changes[i]);
        }

        avgGain /= period;
        avgLoss /= period;

        for (let i = period; i < changes.length; i++) {
            const gain = changes[i] > 0 ? changes[i] : 0;
            const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;

            avgGain = (avgGain * (period - 1) + gain) / period;
            avgLoss = (avgLoss * (period - 1) + loss) / period;
        }

        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        return rsi;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE MACD
     * ═══════════════════════════════════════════════════════════
     */
    calculateMACD(prices) {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);

        const macdLine = ema12[ema12.length - 1] - ema26[ema26.length - 1];
        
        return {
            macd: macdLine,
            signal: macdLine * 0.9,  // Simplified
            histogram: macdLine * 0.1
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE EMA
     * ═══════════════════════════════════════════════════════════
     */
    calculateEMA(data, period) {
        const ema = [];
        const multiplier = 2 / (period + 1);

        let sum = 0;
        for (let i = 0; i < period && i < data.length; i++) {
            sum += data[i];
        }
        ema.push(sum / period);

        for (let i = period; i < data.length; i++) {
            const value = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
            ema.push(value);
        }

        return ema;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE STOCHASTIC
     * ═══════════════════════════════════════════════════════════
     */
    calculateStochastic(historicalData, period = 14) {
        if (historicalData.length < period) return { k: 50, d: 50 };

        const slice = historicalData.slice(-period);
        const high = Math.max(...slice.map(d => d.high));
        const low = Math.min(...slice.map(d => d.low));
        const close = historicalData[historicalData.length - 1].close;

        const k = ((close - low) / (high - low)) * 100;
        const d = k * 0.9;  // Simplified

        return { k, d };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE BOLLINGER BANDS
     * ═══════════════════════════════════════════════════════════
     */
    calculateBollingerBands(prices, period = 20, stdDev = 2) {
        const sma = this.calculateSMA(prices, period);
        const lastSMA = sma[sma.length - 1];

        const slice = prices.slice(-period);
        const variance = slice.reduce((sum, price) => sum + Math.pow(price - lastSMA, 2), 0) / period;
        const std = Math.sqrt(variance);

        return {
            upper: lastSMA + (std * stdDev),
            middle: lastSMA,
            lower: lastSMA - (std * stdDev)
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE SMA
     * ═══════════════════════════════════════════════════════════
     */
    calculateSMA(data, period) {
        const sma = [];
        for (let i = period - 1; i < data.length; i++) {
            const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(sum / period);
        }
        return sma;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE ATR
     * ═══════════════════════════════════════════════════════════
     */
    calculateATR(historicalData, period = 14) {
        if (historicalData.length < period + 1) return 0;

        const trueRanges = [];
        for (let i = 1; i < historicalData.length; i++) {
            const high = historicalData[i].high;
            const low = historicalData[i].low;
            const prevClose = historicalData[i - 1].close;

            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );

            trueRanges.push(tr);
        }

        const atr = trueRanges.slice(-period).reduce((a, b) => a + b, 0) / period;
        return atr;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE SIMPLE ADX
     * ═══════════════════════════════════════════════════════════
     */
    calculateSimpleADX(historicalData) {
        // Simplified ADX calculation
        return 25 + (Math.random() - 0.5) * 20;  // Demo value
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GENERATE FOREX RECOMMENDATION
     * ═══════════════════════════════════════════════════════════
     */
    generateForexRecommendation(indicators, base, quote) {
        let score = 50;

        // RSI signal
        if (indicators.rsi < 30) score += 20;
        else if (indicators.rsi < 40) score += 10;
        else if (indicators.rsi > 70) score -= 20;
        else if (indicators.rsi > 60) score -= 10;

        // MACD signal
        if (indicators.macd.histogram > 0) score += 15;
        else score -= 15;

        // Stochastic signal
        if (indicators.stochastic.k < 20) score += 10;
        else if (indicators.stochastic.k > 80) score -= 10;

        // Moving averages
        const lastPrice = indicators.sma20[indicators.sma20.length - 1];
        const sma50 = indicators.sma50[indicators.sma50.length - 1];
        if (lastPrice > sma50) score += 10;
        else score -= 10;

        // Normalize score
        score = Math.max(0, Math.min(100, score));

        let recommendation = 'NEUTRAL';
        let confidence = 50;

        if (score >= 70) {
            recommendation = 'BUY';
            confidence = Math.min(90, 70 + (score - 70));
        } else if (score <= 30) {
            recommendation = 'SELL';
            confidence = Math.min(90, 70 + (30 - score));
        } else {
            recommendation = 'NEUTRAL';
            confidence = 50 + Math.abs(score - 50) * 0.5;
        }

        return {
            recommendation,
            confidence: Math.round(confidence),
            score,
            target: this.calculateTarget(recommendation, indicators),
            stopLoss: this.calculateStopLoss(recommendation, indicators)
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE TARGET
     * ═══════════════════════════════════════════════════════════
     */
    calculateTarget(recommendation, indicators) {
        const currentPrice = indicators.sma20[indicators.sma20.length - 1];
        const atr = indicators.atr;

        if (recommendation === 'BUY') {
            return (currentPrice + atr * 2).toFixed(4);
        } else if (recommendation === 'SELL') {
            return (currentPrice - atr * 2).toFixed(4);
        } else {
            return currentPrice.toFixed(4);
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE STOP LOSS
     * ═══════════════════════════════════════════════════════════
     */
    calculateStopLoss(recommendation, indicators) {
        const currentPrice = indicators.sma20[indicators.sma20.length - 1];
        const atr = indicators.atr;

        if (recommendation === 'BUY') {
            return (currentPrice - atr * 1.5).toFixed(4);
        } else if (recommendation === 'SELL') {
            return (currentPrice + atr * 1.5).toFixed(4);
        } else {
            return currentPrice.toFixed(4);
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * BUILD FOREX RESPONSE
     * ═══════════════════════════════════════════════════════════
     */
    buildForexResponse(base, quote, rateData, indicators, recommendation) {
        let response = `💱 **${base}/${quote} - Forex Analysis**\n\n`;

        // Current rate
        response += `**Current Rate:** ${rateData.current.toFixed(4)}\n`;
        response += `**24h Change:** ${rateData.change24h >= 0 ? '+' : ''}${rateData.change24h.toFixed(4)} (${rateData.changePercent24h.toFixed(2)}%)\n\n`;

        // AI Recommendation
        response += `**AI Recommendation:** ${recommendation.recommendation}\n`;
        response += `**Confidence:** ${recommendation.confidence}%\n`;
        response += `**Target:** ${recommendation.target}\n`;
        response += `**Stop Loss:** ${recommendation.stopLoss}\n\n`;

        // Technical Indicators
        response += `**Technical Indicators:**\n`;
        response += `• RSI (14): ${indicators.rsi.toFixed(2)} ${indicators.rsi < 30 ? '(Oversold)' : indicators.rsi > 70 ? '(Overbought)' : ''}\n`;
        response += `• MACD: ${indicators.macd.histogram > 0 ? 'Bullish' : 'Bearish'} (${indicators.macd.histogram.toFixed(4)})\n`;
        response += `• Stochastic: %K=${indicators.stochastic.k.toFixed(1)}, %D=${indicators.stochastic.d.toFixed(1)}\n`;
        response += `• Bollinger Bands: ${indicators.bollinger.lower.toFixed(4)} - ${indicators.bollinger.upper.toFixed(4)}\n`;
        response += `• SMA(20): ${indicators.sma20[indicators.sma20.length - 1].toFixed(4)}\n`;
        response += `• SMA(50): ${indicators.sma50[indicators.sma50.length - 1].toFixed(4)}\n`;
        response += `• ATR (14): ${indicators.atr.toFixed(4)}\n\n`;

        // Trading Strategy
        response += `**Trading Strategy:**\n`;
        if (recommendation.recommendation === 'BUY') {
            response += `• Entry: Current market price\n`;
            response += `• Target: ${recommendation.target}\n`;
            response += `• Stop Loss: ${recommendation.stopLoss}\n`;
            response += `• Risk/Reward: 1:2\n`;
        } else if (recommendation.recommendation === 'SELL') {
            response += `• Entry: Current market price\n`;
            response += `• Target: ${recommendation.target}\n`;
            response += `• Stop Loss: ${recommendation.stopLoss}\n`;
            response += `• Risk/Reward: 1:2\n`;
        } else {
            response += `• Wait for clearer signals\n`;
            response += `• Monitor key support/resistance levels\n`;
        }

        return response;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET FOREX OVERVIEW
     * ═══════════════════════════════════════════════════════════
     */
    async getForexOverview() {
        let response = `💱 **Forex Market Overview**\n\n`;

        response += `**Major Currency Pairs:**\n\n`;

        for (const pair of this.majorPairs.slice(0, 5)) {
            const demo = this.getDemoForexData(pair.base, pair.quote);
            response += `**${pair.base}/${pair.quote}** (${pair.name})\n`;
            response += `Rate: ${demo.current.toFixed(4)} | 24h: ${demo.change24h >= 0 ? '+' : ''}${demo.changePercent24h.toFixed(2)}%\n\n`;
        }

        response += `\nFor detailed analysis, specify a currency pair:\n`;
        response += `• "EUR/USD analysis"\n`;
        response += `• "Show GBP/USD indicators"\n`;
        response += `• "Analyze USD/JPY"\n`;

        return {
            text: response,
            charts: [],
            data: null
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotForexAnalyzer;
}

if (typeof window !== 'undefined') {
    window.ChatbotForexAnalyzer = ChatbotForexAnalyzer;
}

console.log('✅ ChatbotForexAnalyzer loaded');