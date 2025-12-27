// /**
//  * ═══════════════════════════════════════════════════════════════
//  * CHATBOT ANALYTICS - Advanced Stock Analysis Engine
//  * ═══════════════════════════════════════════════════════════════
//  * Version: 3.0.0 - LEGAL COMPLIANT
//  * Description: Analyses techniques/fondamentales + AlphaVault Scoring
//  * Features:
//  *   - Intégration AlphaVault Scoring
//  *   - 14 indicateurs techniques (RSI, MACD, ADX, etc.)
//  *   - Calculs de risque (VaR, Sharpe, Beta, ATR)
//  *   - Sentiment analysis
//  *   - Corrélation matrix
//  */

// class ChatbotAnalytics {
//     constructor(config) {
//         this.config = config;
//         this.apiClient = null;
//         this.chartsEngine = null;
        
//         console.log('📊 ChatbotAnalytics initialized');
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * INITIALIZE
//      * ✅ CORRIGÉ : Crée FinanceAPIClient comme dans advanced-analysiss
//      * ═══════════════════════════════════════════════════════════
//      */
//     async initialize() {
//         if (typeof FinanceAPIClient !== 'undefined') {
//             this.apiClient = new FinanceAPIClient({
//                 baseURL: this.config.apiBaseURL || APP_CONFIG.API_BASE_URL,
//                 cacheDuration: 300000,
//                 maxRetries: 2
//             });
            
//             console.log('✅ FinanceAPIClient initialized');
//         } else {
//             console.warn('⚠ FinanceAPIClient not available - will try to use window.apiClient');
//         }

//         if (typeof ChatbotCharts !== 'undefined') {
//             this.chartsEngine = new ChatbotCharts();
//             console.log('✅ Charts engine initialized');
//         }

//         console.log('✅ ChatbotAnalytics initialized');
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * ANALYZE STOCK (MAIN METHOD)
//      * ✅ CORRIGÉ : Initialisation API + Utilise Twelve Data comme advanced-analysis
//      * ═══════════════════════════════════════════════════════════
//      */
//     async analyzeStock(symbol, entities = {}) {
//         try {
//             // ✅ CORRECTION : Initialiser l'API client si nécessaire
//             if (!this.apiClient) {
//                 await this.initialize();
//             }

//             // ✅ VÉRIFICATION : Si toujours null, utiliser window.apiClient (comme advanced-analysis)
//             if (!this.apiClient && window.apiClient) {
//                 console.log('📡 Using global apiClient from window');
//                 this.apiClient = window.apiClient;
//             }

//             // ✅ DERNIÈRE VÉRIFICATION
//             if (!this.apiClient) {
//                 console.error('❌ API Client not available');
//                 return {
//                     text: `❌ Unable to fetch data for ${symbol}. API client not initialized.\n\nPlease check that FinanceAPIClient is properly loaded.`,
//                     charts: [],
//                     data: null
//                 };
//             }

//             console.log(`📊 Analyzing ${symbol}...`);

//             // ✅ UTILISE LA MÊME LOGIQUE QUE ADVANCED-ANALYSIS
//             const [quote, timeSeries] = await Promise.all([
//                 this.apiClient.getQuote(symbol).catch(() => null),
//                 this.apiClient.getTimeSeries(symbol, '1day', 365).catch(() => null)
//             ]);

//             if (!quote || !timeSeries || !timeSeries.data || timeSeries.data.length < 30) {
//                 return {
//                     text: `❌ Unable to fetch sufficient data for ${symbol}. Please verify the ticker symbol.`,
//                     charts: [],
//                     data: null
//                 };
//             }

//             const prices = timeSeries.data;

//             // Calculate all technical indicators
//             const technicalIndicators = this.calculateAllIndicators(prices);

//             // Calculate AlphaVault Score
//             const alphaVaultScore = this.calculateAlphaVaultScore(technicalIndicators);

//             // Calculate risk metrics
//             const riskMetrics = this.calculateRiskMetrics(prices);

//             // Generate AI recommendation
//             const aiRecommendation = this.generateAIRecommendation(alphaVaultScore, technicalIndicators, riskMetrics);

//             // Generate charts
//             const charts = this.generateCharts(technicalIndicators, symbol);

//             // ✅ BUILD RESPONSE (SANS MENTIONNER LES PRIX BRUTS)
//             const responseText = this.buildAnalysisResponse(symbol, quote, alphaVaultScore, technicalIndicators, riskMetrics, aiRecommendation);

//             return {
//                 text: responseText,
//                 charts: charts,
//                 data: {
//                     symbol,
//                     quote,
//                     alphaVaultScore,
//                     technicalIndicators,
//                     riskMetrics,
//                     aiRecommendation
//                 }
//             };

//         } catch (error) {
//             console.error('❌ Stock analysis error:', error);
//             return {
//                 text: `❌ An error occurred while analyzing ${symbol}. Please try again.`,
//                 charts: [],
//                 data: null
//             };
//         }
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE ALL TECHNICAL INDICATORS
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateAllIndicators(prices) {
//         return {
//             rsi: this.calculateRSI(prices),
//             macd: this.calculateMACD(prices),
//             stochastic: this.calculateStochastic(prices),
//             adx: this.calculateADX(prices),
//             obv: this.calculateOBV(prices),
//             atr: this.calculateATR(prices),
//             mfi: this.calculateMFI(prices),
//             cci: this.calculateCCI(prices),
//             williamsR: this.calculateWilliamsR(prices),
//             roc: this.calculateROC(prices),
//             aroon: this.calculateAroon(prices),
//             cmf: this.calculateCMF(prices),
//             elderRay: this.calculateElderRay(prices),
//             ultimateOscillator: this.calculateUltimateOscillator(prices)
//         };
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE RSI
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateRSI(prices, period = 14) {
//         const rsi = [];
//         const changes = [];
        
//         for (let i = 1; i < prices.length; i++) {
//             changes.push(prices[i].close - prices[i - 1].close);
//         }
        
//         let avgGain = 0;
//         let avgLoss = 0;
        
//         for (let i = 0; i < period; i++) {
//             if (changes[i] > 0) avgGain += changes[i];
//             else avgLoss += Math.abs(changes[i]);
//         }
        
//         avgGain /= period;
//         avgLoss /= period;
        
//         for (let i = period; i < changes.length; i++) {
//             const gain = changes[i] > 0 ? changes[i] : 0;
//             const loss = changes[i] < 0 ? Math.abs(changes[i]) : 0;
            
//             avgGain = (avgGain * (period - 1) + gain) / period;
//             avgLoss = (avgLoss * (period - 1) + loss) / period;
            
//             const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
//             const rsiValue = 100 - (100 / (1 + rs));
            
//             rsi.push([prices[i + 1].timestamp, rsiValue]);
//         }
        
//         return rsi;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE MACD
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
//         const closes = prices.map(p => p.close);
        
//         const fastEMA = this.calculateEMA(closes, fastPeriod);
//         const slowEMA = this.calculateEMA(closes, slowPeriod);
        
//         const macdLine = [];
//         const startIndex = Math.max(fastEMA.length - slowEMA.length, 0);
        
//         for (let i = 0; i < slowEMA.length; i++) {
//             const macdValue = fastEMA[i + startIndex] - slowEMA[i];
//             macdLine.push(macdValue);
//         }
        
//         const signalEMA = this.calculateEMA(macdLine, signalPeriod);
        
//         const macdLineData = [];
//         const signalLineData = [];
//         const histogram = [];
        
//         const offset = prices.length - macdLine.length;
//         const signalOffset = macdLine.length - signalEMA.length;
        
//         for (let i = 0; i < signalEMA.length; i++) {
//             const timestamp = prices[offset + signalOffset + i].timestamp;
//             const macdVal = macdLine[signalOffset + i];
//             const signalVal = signalEMA[i];
            
//             macdLineData.push([timestamp, macdVal]);
//             signalLineData.push([timestamp, signalVal]);
//             histogram.push([timestamp, macdVal - signalVal]);
//         }
        
//         return { macdLine: macdLineData, signalLine: signalLineData, histogram };
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE EMA
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateEMA(data, period) {
//         const ema = [];
//         const multiplier = 2 / (period + 1);
        
//         let sum = 0;
//         for (let i = 0; i < period && i < data.length; i++) {
//             sum += data[i];
//         }
//         ema.push(sum / period);
        
//         for (let i = period; i < data.length; i++) {
//             const value = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
//             ema.push(value);
//         }
        
//         return ema;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE STOCHASTIC
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateStochastic(prices, kPeriod = 14, dPeriod = 3) {
//         const k = [];
//         const d = [];
        
//         for (let i = kPeriod - 1; i < prices.length; i++) {
//             const slice = prices.slice(i - kPeriod + 1, i + 1);
//             const high = Math.max(...slice.map(p => p.high));
//             const low = Math.min(...slice.map(p => p.low));
//             const close = prices[i].close;
            
//             const kValue = ((close - low) / (high - low)) * 100;
//             k.push([prices[i].timestamp, kValue || 0]);
//         }
        
//         for (let i = dPeriod - 1; i < k.length; i++) {
//             const slice = k.slice(i - dPeriod + 1, i + 1);
//             const avg = slice.reduce((sum, item) => sum + item[1], 0) / dPeriod;
//             d.push([k[i][0], avg]);
//         }
        
//         return { k, d };
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE ADX
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateADX(prices, period = 14) {
//         if (prices.length < period + 2) {
//             return { adx: [], plusDI: [], minusDI: [] };
//         }
        
//         const trueRange = [];
//         const plusDM = [];
//         const minusDM = [];
        
//         for (let i = 1; i < prices.length; i++) {
//             const high = prices[i].high;
//             const low = prices[i].low;
//             const prevClose = prices[i - 1].close;
            
//             const tr = Math.max(
//                 high - low,
//                 Math.abs(high - prevClose),
//                 Math.abs(low - prevClose)
//             );
//             trueRange.push(tr);
            
//             const highDiff = high - prices[i - 1].high;
//             const lowDiff = prices[i - 1].low - low;
            
//             plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
//             minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
//         }
        
//         const smoothTR = this.smoothArray(trueRange, period);
//         const smoothPlusDM = this.smoothArray(plusDM, period);
//         const smoothMinusDM = this.smoothArray(minusDM, period);
        
//         const plusDI = [];
//         const minusDI = [];
//         const dxValues = [];
        
//         const maxIndex = Math.min(smoothTR.length, prices.length - period - 1);
        
//         for (let i = 0; i < maxIndex; i++) {
//             if (smoothTR[i] === 0) continue;
            
//             const plusDIValue = (smoothPlusDM[i] / smoothTR[i]) * 100;
//             const minusDIValue = (smoothMinusDM[i] / smoothTR[i]) * 100;
            
//             const timestamp = prices[i + period + 1].timestamp;
//             plusDI.push([timestamp, plusDIValue]);
//             minusDI.push([timestamp, minusDIValue]);
            
//             const sum = plusDIValue + minusDIValue;
//             if (sum > 0) {
//                 const dx = (Math.abs(plusDIValue - minusDIValue) / sum) * 100;
//                 dxValues.push(dx);
//             }
//         }
        
//         if (dxValues.length < period) {
//             return { adx: [], plusDI, minusDI };
//         }
        
//         const adxSmoothed = this.smoothArray(dxValues, period);
//         const adxArray = [];
        
//         const adxMaxIndex = Math.min(adxSmoothed.length, prices.length - period * 2 - 1);
        
//         for (let i = 0; i < adxMaxIndex; i++) {
//             const timestamp = prices[i + period * 2 + 1].timestamp;
//             adxArray.push([timestamp, adxSmoothed[i]]);
//         }
        
//         return { adx: adxArray, plusDI, minusDI };
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * SMOOTH ARRAY (Helper for ADX)
//      * ═══════════════════════════════════════════════════════════
//      */
//     smoothArray(arr, period) {
//         if (arr.length < period) return [];
        
//         const result = [];
//         let sum = 0;
        
//         for (let i = 0; i < period; i++) {
//             sum += arr[i];
//         }
//         result.push(sum / period);
        
//         for (let i = period; i < arr.length; i++) {
//             const smoothed = (result[result.length - 1] * (period - 1) + arr[i]) / period;
//             result.push(smoothed);
//         }
        
//         return result;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE OBV
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateOBV(prices) {
//         const obv = [];
//         let currentOBV = 0;
        
//         obv.push([prices[0].timestamp, currentOBV]);
        
//         for (let i = 1; i < prices.length; i++) {
//             if (prices[i].close > prices[i - 1].close) {
//                 currentOBV += prices[i].volume;
//             } else if (prices[i].close < prices[i - 1].close) {
//                 currentOBV -= prices[i].volume;
//             }
            
//             obv.push([prices[i].timestamp, currentOBV]);
//         }
        
//         return obv;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE ATR
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateATR(prices, period = 14) {
//         const trueRange = [];
        
//         for (let i = 1; i < prices.length; i++) {
//             const high = prices[i].high;
//             const low = prices[i].low;
//             const prevClose = prices[i - 1].close;
            
//             const tr = Math.max(
//                 high - low,
//                 Math.abs(high - prevClose),
//                 Math.abs(low - prevClose)
//             );
            
//             trueRange.push(tr);
//         }
        
//         const atr = [];
//         let sum = 0;
        
//         for (let i = 0; i < period && i < trueRange.length; i++) {
//             sum += trueRange[i];
//         }
        
//         if (period < prices.length) {
//             atr.push([prices[period].timestamp, sum / period]);
//         }
        
//         for (let i = period; i < trueRange.length; i++) {
//             const smoothed = (atr[atr.length - 1][1] * (period - 1) + trueRange[i]) / period;
//             const priceIndex = i + 1;
            
//             if (priceIndex < prices.length) {
//                 atr.push([prices[priceIndex].timestamp, smoothed]);
//             }
//         }
        
//         return atr;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE MFI (Money Flow Index)
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateMFI(prices, period = 14) {
//         const mfi = [];
//         const typicalPrices = [];
//         const moneyFlow = [];
        
//         for (let i = 0; i < prices.length; i++) {
//             const typical = (prices[i].high + prices[i].low + prices[i].close) / 3;
//             typicalPrices.push(typical);
//             moneyFlow.push(typical * prices[i].volume);
//         }
        
//         for (let i = period; i < prices.length; i++) {
//             let positiveFlow = 0;
//             let negativeFlow = 0;
            
//             for (let j = i - period + 1; j <= i; j++) {
//                 if (typicalPrices[j] > typicalPrices[j - 1]) {
//                     positiveFlow += moneyFlow[j];
//                 } else if (typicalPrices[j] < typicalPrices[j - 1]) {
//                     negativeFlow += moneyFlow[j];
//                 }
//             }
            
//             const moneyFlowRatio = negativeFlow === 0 ? 100 : positiveFlow / negativeFlow;
//             const mfiValue = 100 - (100 / (1 + moneyFlowRatio));
            
//             mfi.push([prices[i].timestamp, mfiValue]);
//         }
        
//         return mfi;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE CCI
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateCCI(prices, period = 20) {
//         const cci = [];
//         const typicalPrices = prices.map(p => (p.high + p.low + p.close) / 3);
        
//         for (let i = period - 1; i < prices.length; i++) {
//             const slice = typicalPrices.slice(i - period + 1, i + 1);
//             const sma = slice.reduce((a, b) => a + b, 0) / period;
            
//             const meanDeviation = slice.reduce((sum, val) => sum + Math.abs(val - sma), 0) / period;
            
//             const cciValue = (typicalPrices[i] - sma) / (0.015 * meanDeviation);
            
//             cci.push([prices[i].timestamp, cciValue]);
//         }
        
//         return cci;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE WILLIAMS %R
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateWilliamsR(prices, period = 14) {
//         const williams = [];
        
//         for (let i = period - 1; i < prices.length; i++) {
//             const slice = prices.slice(i - period + 1, i + 1);
//             const high = Math.max(...slice.map(p => p.high));
//             const low = Math.min(...slice.map(p => p.low));
//             const close = prices[i].close;
            
//             const value = ((high - close) / (high - low)) * -100;
//             williams.push([prices[i].timestamp, value || 0]);
//         }
        
//         return williams;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE ROC (Rate of Change)
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateROC(prices, period = 12) {
//         const roc = [];
        
//         for (let i = period; i < prices.length; i++) {
//             const currentClose = prices[i].close;
//             const pastClose = prices[i - period].close;
//             const rocValue = ((currentClose - pastClose) / pastClose) * 100;
            
//             roc.push([prices[i].timestamp, rocValue]);
//         }
        
//         return roc;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE AROON
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateAroon(prices, period = 25) {
//         const up = [];
//         const down = [];
        
//         for (let i = period; i < prices.length; i++) {
//             const slice = prices.slice(i - period, i + 1);
            
//             let highestIndex = 0;
//             let lowestIndex = 0;
//             let highest = slice[0].high;
//             let lowest = slice[0].low;
            
//             for (let j = 1; j < slice.length; j++) {
//                 if (slice[j].high > highest) {
//                     highest = slice[j].high;
//                     highestIndex = j;
//                 }
//                 if (slice[j].low < lowest) {
//                     lowest = slice[j].low;
//                     lowestIndex = j;
//                 }
//             }
            
//             const daysSinceHigh = period - highestIndex;
//             const daysSinceLow = period - lowestIndex;
            
//             const aroonUp = ((period - daysSinceHigh) / period) * 100;
//             const aroonDown = ((period - daysSinceLow) / period) * 100;
            
//             up.push([prices[i].timestamp, aroonUp]);
//             down.push([prices[i].timestamp, aroonDown]);
//         }
        
//         return { up, down };
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE CMF (Chaikin Money Flow)
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateCMF(prices, period = 20) {
//         const cmf = [];
//         const moneyFlowMultiplier = [];
//         const moneyFlowVolume = [];
        
//         for (let i = 0; i < prices.length; i++) {
//             const high = prices[i].high;
//             const low = prices[i].low;
//             const close = prices[i].close;
//             const volume = prices[i].volume;
            
//             const mfm = high === low ? 0 : ((close - low) - (high - close)) / (high - low);
//             const mfv = mfm * volume;
            
//             moneyFlowMultiplier.push(mfm);
//             moneyFlowVolume.push(mfv);
//         }
        
//         for (let i = period - 1; i < prices.length; i++) {
//             const sumMFV = this.sumArray(moneyFlowVolume, i - period + 1, i + 1);
//             const sumVolume = prices.slice(i - period + 1, i + 1).reduce((sum, p) => sum + p.volume, 0);
            
//             const cmfValue = sumVolume === 0 ? 0 : sumMFV / sumVolume;
            
//             cmf.push([prices[i].timestamp, cmfValue]);
//         }
        
//         return cmf;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE ELDER RAY
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateElderRay(prices, period = 13) {
//         const closes = prices.map(p => p.close);
//         const ema = this.calculateEMA(closes, period);
        
//         const bullPower = [];
//         const bearPower = [];
        
//         const offset = prices.length - ema.length;
        
//         for (let i = 0; i < ema.length; i++) {
//             const priceIndex = offset + i;
//             const timestamp = prices[priceIndex].timestamp;
//             const high = prices[priceIndex].high;
//             const low = prices[priceIndex].low;
//             const emaValue = ema[i];
            
//             bullPower.push([timestamp, high - emaValue]);
//             bearPower.push([timestamp, low - emaValue]);
//         }
        
//         return { bullPower, bearPower };
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE ULTIMATE OSCILLATOR
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateUltimateOscillator(prices, period1 = 7, period2 = 14, period3 = 28) {
//         const ultimate = [];
//         const buyingPressure = [];
//         const trueRange = [];
        
//         for (let i = 1; i < prices.length; i++) {
//             const trueLow = Math.min(prices[i].low, prices[i - 1].close);
//             const bp = prices[i].close - trueLow;
//             const tr = Math.max(prices[i].high, prices[i - 1].close) - trueLow;
            
//             buyingPressure.push(bp);
//             trueRange.push(tr);
//         }
        
//         const maxPeriod = Math.max(period1, period2, period3);
        
//         for (let i = maxPeriod - 1; i < buyingPressure.length; i++) {
//             const avg1 = this.sumArray(buyingPressure, i - period1 + 1, i + 1) / this.sumArray(trueRange, i - period1 + 1, i + 1);
//             const avg2 = this.sumArray(buyingPressure, i - period2 + 1, i + 1) / this.sumArray(trueRange, i - period2 + 1, i + 1);
//             const avg3 = this.sumArray(buyingPressure, i - period3 + 1, i + 1) / this.sumArray(trueRange, i - period3 + 1, i + 1);
            
//             const uo = 100 * ((4 * avg1 + 2 * avg2 + avg3) / 7);
            
//             ultimate.push([prices[i + 1].timestamp, uo]);
//         }
        
//         return ultimate;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * SUM ARRAY (Helper)
//      * ═══════════════════════════════════════════════════════════
//      */
//     sumArray(arr, start, end) {
//         let sum = 0;
//         for (let i = start; i < end && i < arr.length; i++) {
//             sum += arr[i];
//         }
//         return sum || 1;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE ALPHAVAULT SCORE
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateAlphaVaultScore(indicators) {
//         let score = 50;  // Base score
//         let totalWeight = 0;
//         let weightedScore = 0;

//         // RSI (weight: 1.8)
//         if (indicators.rsi.length > 0) {
//             const lastRSI = indicators.rsi[indicators.rsi.length - 1][1];
//             let rsiScore = 0;
            
//             if (lastRSI < 30) rsiScore = 80;
//             else if (lastRSI < 40) rsiScore = 65;
//             else if (lastRSI > 70) rsiScore = 20;
//             else if (lastRSI > 60) rsiScore = 35;
//             else rsiScore = 50;
            
//             weightedScore += rsiScore * 1.8;
//             totalWeight += 1.8;
//         }

//         // MACD (weight: 2.2)
//         if (indicators.macd.histogram.length > 0) {
//             const lastHist = indicators.macd.histogram[indicators.macd.histogram.length - 1][1];
//             let macdScore = lastHist > 0 ? 70 : 30;
            
//             weightedScore += macdScore * 2.2;
//             totalWeight += 2.2;
//         }

//         // ADX (weight: 2.0)
//         if (indicators.adx.adx.length > 0) {
//             const lastADX = indicators.adx.adx[indicators.adx.adx.length - 1][1];
//             const lastPlusDI = indicators.adx.plusDI[indicators.adx.plusDI.length - 1][1];
//             const lastMinusDI = indicators.adx.minusDI[indicators.adx.minusDI.length - 1][1];
            
//             let adxScore = 50;
//             if (lastADX > 25) {
//                 adxScore = lastPlusDI > lastMinusDI ? 75 : 25;
//             }
            
//             weightedScore += adxScore * 2.0;
//             totalWeight += 2.0;
//         }

//         // OBV (weight: 1.7)
//         if (indicators.obv.length >= 20) {
//             const recentOBV = indicators.obv.slice(-20);
//             const obvTrend = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
//             const obvScore = obvTrend > 0 ? 65 : 35;
            
//             weightedScore += obvScore * 1.7;
//             totalWeight += 1.7;
//         }

//         // Stochastic (weight: 1.5)
//         if (indicators.stochastic.k.length > 0) {
//             const lastK = indicators.stochastic.k[indicators.stochastic.k.length - 1][1];
//             let stochScore = 50;
            
//             if (lastK < 20) stochScore = 75;
//             else if (lastK > 80) stochScore = 25;
            
//             weightedScore += stochScore * 1.5;
//             totalWeight += 1.5;
//         }

//         // Calculate final score
//         const finalScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50;

//         return Math.max(0, Math.min(100, finalScore));
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * CALCULATE RISK METRICS
//      * ═══════════════════════════════════════════════════════════
//      */
//     calculateRiskMetrics(prices) {
//         const returns = [];
//         for (let i = 1; i < prices.length; i++) {
//             const ret = (prices[i].close - prices[i - 1].close) / prices[i - 1].close;
//             returns.push(ret);
//         }

//         // Volatility (annualized)
//         const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
//         const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
//         const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100;

//         // Sharpe Ratio (assuming risk-free rate of 3%)
//         const riskFreeRate = 0.03;
//         const annualReturn = mean * 252;
//         const sharpeRatio = (annualReturn - riskFreeRate) / (volatility / 100);

//         // Max Drawdown
//         let peak = prices[0].close;
//         let maxDrawdown = 0;

//         for (let i = 1; i < prices.length; i++) {
//             if (prices[i].close > peak) {
//                 peak = prices[i].close;
//             }
//             const drawdown = ((peak - prices[i].close) / peak) * 100;
//             if (drawdown > maxDrawdown) {
//                 maxDrawdown = drawdown;
//             }
//         }

//         // VaR (95% confidence)
//         const sortedReturns = [...returns].sort((a, b) => a - b);
//         const varIndex = Math.floor(returns.length * 0.05);
//         const var95 = sortedReturns[varIndex] * 100;

//         return {
//             volatility: volatility.toFixed(2),
//             sharpeRatio: sharpeRatio.toFixed(2),
//             maxDrawdown: maxDrawdown.toFixed(2),
//             var95: var95.toFixed(2)
//         };
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * GENERATE AI RECOMMENDATION
//      * ═══════════════════════════════════════════════════════════
//      */
//     generateAIRecommendation(alphaVaultScore, indicators, riskMetrics) {
//         let recommendation = 'HOLD';
//         let confidence = 50;

//         if (alphaVaultScore >= 75) {
//             recommendation = 'BUY';
//             confidence = 85;
//         } else if (alphaVaultScore >= 60) {
//             recommendation = 'BUY';
//             confidence = 70;
//         } else if (alphaVaultScore >= 55) {
//             recommendation = 'BUY';
//             confidence = 60;
//         } else if (alphaVaultScore <= 25) {
//             recommendation = 'SELL';
//             confidence = 85;
//         } else if (alphaVaultScore <= 40) {
//             recommendation = 'SELL';
//             confidence = 70;
//         } else if (alphaVaultScore <= 45) {
//             recommendation = 'SELL';
//             confidence = 60;
//         }

//         return {
//             recommendation,
//             confidence,
//             rating: alphaVaultScore >= 75 ? 'VERY BULLISH' :
//                     alphaVaultScore >= 60 ? 'BULLISH' :
//                     alphaVaultScore >= 45 ? 'NEUTRAL' :
//                     alphaVaultScore >= 30 ? 'BEARISH' : 'VERY BEARISH'
//         };
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * GENERATE CHARTS
//      * ═══════════════════════════════════════════════════════════
//      */
//     generateCharts(indicators, symbol) {
//         if (!this.chartsEngine) {
//             return [];
//         }

//         const charts = [];

//         // RSI Chart
//         if (indicators.rsi.length > 0) {
//             charts.push(this.chartsEngine.createRSIChart(indicators.rsi, null, { 
//                 title: `${symbol} - RSI (Relative Strength Index)` 
//             }));
//         }

//         // MACD Chart
//         if (indicators.macd.histogram.length > 0) {
//             charts.push(this.chartsEngine.createMACDChart(indicators.macd, null, { 
//                 title: `${symbol} - MACD` 
//             }));
//         }

//         // Stochastic Chart
//         if (indicators.stochastic.k.length > 0) {
//             charts.push(this.chartsEngine.createStochasticChart(indicators.stochastic, null, { 
//                 title: `${symbol} - Stochastic Oscillator` 
//             }));
//         }

//         // ADX Chart
//         if (indicators.adx.adx.length > 0) {
//             charts.push(this.chartsEngine.createADXChart(indicators.adx, null, { 
//                 title: `${symbol} - ADX (Trend Strength)` 
//             }));
//         }

//         return charts;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * BUILD ANALYSIS RESPONSE TEXT
//      * ═══════════════════════════════════════════════════════════
//      */
//     buildAnalysisResponse(symbol, quote, alphaVaultScore, indicators, riskMetrics, aiRecommendation) {
//         const lastRSI = indicators.rsi.length > 0 ? indicators.rsi[indicators.rsi.length - 1][1].toFixed(2) : 'N/A';
//         const lastMACD = indicators.macd.histogram.length > 0 ? indicators.macd.histogram[indicators.macd.histogram.length - 1][1].toFixed(4) : 'N/A';

//         return `📊 **Technical Analysis for ${symbol}**

// **AlphaVault Score:** ${alphaVaultScore}/100 (${aiRecommendation.rating})
// **AI Recommendation:** ${aiRecommendation.recommendation} (${aiRecommendation.confidence}% confidence)

// **Key Technical Indicators:**
// • RSI (14): ${lastRSI}
// • MACD Histogram: ${lastMACD}

// **Risk Metrics:**
// • Volatility (annualized): ${riskMetrics.volatility}%
// • Sharpe Ratio: ${riskMetrics.sharpeRatio}
// • Max Drawdown: ${riskMetrics.maxDrawdown}%
// • VaR (95%): ${riskMetrics.var95}%

// 📈 View the detailed charts below for comprehensive technical analysis.`;
//     }

//     /**
//      * ═══════════════════════════════════════════════════════════
//      * GET MARKET OVERVIEW
//      * ═══════════════════════════════════════════════════════════
//      */
//     async getMarketOverview(entities) {
//         return {
//             text: `📊 **Market Overview**

// The current market environment shows mixed signals across major indices. For detailed analysis of specific stocks, please provide a ticker symbol.

// **Major Indices:**
// • S&P 500: Market sentiment neutral
// • NASDAQ: Tech sector showing strength
// • Dow Jones: Industrial stocks consolidating

// Use commands like "analyze AAPL" or "show me NVDA technical analysis" for detailed stock insights.`,
//             charts: [],
//             data: null
//         };
//     }
// }

// // ═══════════════════════════════════════════════════════════════
// // EXPORT
// // ═══════════════════════════════════════════════════════════════

// if (typeof module !== 'undefined' && module.exports) {
//     module.exports = ChatbotAnalytics;
// }

// if (typeof window !== 'undefined') {
//     window.ChatbotAnalytics = ChatbotAnalytics;
// }

// console.log('✅ ChatbotAnalytics loaded (Legal Compliant)');

/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT ANALYTICS - ULTRA-COMPLETE VERSION v5.0
 * ═══════════════════════════════════════════════════════════════
 * Integration: ALL specialized analyzers
 * - Technical Analysis (14 indicators)
 * - IPO Intelligence
 * - M&A Predictor
 * - Forex Analysis (38+ currencies)
 * - Insider Trading (14 classes)
 * - Budget Management
 * - Investment Analytics
 * - AlphaVault Scoring
 * ═══════════════════════════════════════════════════════════════
 */

class ChatbotAnalytics {
    constructor(config) {
        this.config = config;
        this.apiClient = null;
        this.chartsEngine = null;
        
        // ✅ SPECIALIZED ANALYZERS
        this.ipoAnalyzer = null;
        this.maAnalyzer = null;
        this.forexAnalyzer = null;
        this.insiderAnalyzer = null;
        this.budgetManager = null;
        this.investmentManager = null;
        
        console.log('📊 ChatbotAnalytics Ultra v5.0 initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * INITIALIZE (v5.3 - Use Global Clients)
     * ═══════════════════════════════════════════════════════════
     */
    async initialize() {
        console.log('🚀 Initializing ChatbotAnalytics v5.3...');

        // ✅ USE GLOBAL API CLIENTS (already initialized)
        this.apiClient = window.apiClient;

        if (!this.apiClient) {
            console.error('❌ Global apiClient not found!');
        } else {
            console.log('✅ Using global apiClient');
        }

        // ✅ CHARTS ENGINE
        if (typeof ChatbotCharts !== 'undefined') {
            this.chartsEngine = new ChatbotCharts();
            console.log('✅ ChatbotCharts initialized');
        }

        // ═══════════════════════════════════════════════════════════
        // ✅ SPECIALIZED ANALYZERS (use global clients)
        // ═══════════════════════════════════════════════════════════

        // IPO Analyzer
        if (typeof ChatbotIPOAnalyzer !== 'undefined') {
            this.ipoAnalyzer = new ChatbotIPOAnalyzer(this.config);
            this.ipoAnalyzer.apiClient = window.secAPIClient; // ✅ SEC IPO client
            console.log('✅ ChatbotIPOAnalyzer initialized');
        }

        // M&A Analyzer
        if (typeof ChatbotMAAnalyzer !== 'undefined') {
            this.maAnalyzer = new ChatbotMAAnalyzer(this.config);
            this.maAnalyzer.apiClient = window.secMAClient; // ✅ SEC M&A client
            console.log('✅ ChatbotMAAnalyzer initialized');
        }

        // Forex Analyzer
        if (typeof ChatbotForexAnalyzer !== 'undefined') {
            this.forexAnalyzer = new ChatbotForexAnalyzer(this.config);
            this.forexAnalyzer.apiClient = window.apiClient; // ✅ Finance API client
            console.log('✅ ChatbotForexAnalyzer initialized');
        }

        // Insider Analyzer
        if (typeof ChatbotInsiderAnalyzer !== 'undefined') {
            this.insiderAnalyzer = new ChatbotInsiderAnalyzer(this.config);
            this.insiderAnalyzer.apiClient = window.secMAClient; // ✅ SEC M&A client (pour Form 4)
            console.log('✅ ChatbotInsiderAnalyzer initialized');
        }

        // Budget Manager
        if (typeof ChatbotBudgetManager !== 'undefined') {
            this.budgetManager = new ChatbotBudgetManager(this.config);
            console.log('✅ ChatbotBudgetManager initialized');
        }

        // Investment Manager
        if (typeof ChatbotInvestmentManager !== 'undefined') {
            this.investmentManager = new ChatbotInvestmentManager(this.config);
            console.log('✅ ChatbotInvestmentManager initialized');
        }

        console.log('✅ ChatbotAnalytics v5.3 fully initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 🚀 ANALYZE IPO (Delegated to ChatbotIPOAnalyzer)
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeIPO(entities = {}, options = {}) {
        if (!this.ipoAnalyzer) {
            return {
                text: '❌ IPO Analyzer not available. Please ensure ChatbotIPOAnalyzer is loaded.',
                charts: [],
                data: null
            };
        }

        try {
            console.log('📊 Delegating to IPO Analyzer...');
            const result = await this.ipoAnalyzer.analyzeIPOs(entities, options);

            // ✅ CONVERT IPO DATA TO CHARTS
            const charts = [];

            if (result.data && result.data.topIPOs) {
                // Top IPO Rankings Chart
                charts.push(this.chartsEngine.createIPOTopRankingsChart(
                    result.data.topIPOs,
                    null,
                    { title: 'Top IPO Rankings by Success Score' }
                ));

                // Sector Performance Chart
                if (result.data.stats && result.data.stats.sectorPerformance) {
                    charts.push(this.chartsEngine.createIPOSectorPerformanceChart(
                        result.data.stats.sectorPerformance,
                        null,
                        { title: 'IPO Performance by Sector' }
                    ));
                }

                // Score Distribution Chart
                if (result.data.allIPOs) {
                    charts.push(this.chartsEngine.createIPOScoreDistributionChart(
                        result.data.allIPOs,
                        null,
                        { title: 'IPO Success Score Distribution' }
                    ));
                }

                // Risk/Opportunity Scatter
                charts.push(this.chartsEngine.createIPORiskOpportunityChart(
                    result.data.allIPOs,
                    null,
                    { title: 'IPO Risk vs Success Score' }
                ));
            }

            return {
                text: result.text,
                charts: charts,
                data: result.data
            };

        } catch (error) {
            console.error('❌ IPO analysis error:', error);
            return {
                text: `❌ IPO analysis error: ${error.message}`,
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 🤝 ANALYZE M&A (Delegated to ChatbotMAAnalyzer)
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeMA(entities = {}) {
        if (!this.maAnalyzer) {
            return {
                text: '❌ M&A Analyzer not available. Please ensure ChatbotMAAnalyzer is loaded.',
                charts: [],
                data: null
            };
        }

        try {
            console.log('📊 Delegating to M&A Analyzer...');
            const result = await this.maAnalyzer.analyzeMA(entities);

            // ✅ CONVERT M&A DATA TO CHARTS
            const charts = [];

            if (result.data && result.data.deals) {
                // Success Probability Chart
                charts.push(this.chartsEngine.createMASuccessProbabilityChart(
                    result.data.deals,
                    null,
                    { title: 'M&A Success Probability' }
                ));

                // Deal Value Timeline
                charts.push(this.chartsEngine.createMADealValueTimelineChart(
                    result.data.deals,
                    null,
                    { title: 'M&A Deal Value Timeline' }
                ));

                // Sector Breakdown
                charts.push(this.chartsEngine.createMASectorBreakdownChart(
                    result.data.deals,
                    null,
                    { title: 'M&A Activity by Sector' }
                ));
            }

            return {
                text: result.text,
                charts: charts,
                data: result.data
            };

        } catch (error) {
            console.error('❌ M&A analysis error:', error);
            return {
                text: `❌ M&A analysis error: ${error.message}`,
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 💱 ANALYZE FOREX (Delegated to ChatbotForexAnalyzer)
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeForex(entities = {}) {
        if (!this.forexAnalyzer) {
            return {
                text: '❌ Forex Analyzer not available. Please ensure ChatbotForexAnalyzer is loaded.',
                charts: [],
                data: null
            };
        }

        try {
            console.log('📊 Delegating to Forex Analyzer...');
            const result = await this.forexAnalyzer.analyzeForex(entities);

            // ✅ CONVERT FOREX DATA TO CHARTS
            const charts = [];

            if (result.data && result.data.historicalData) {
                // Historical Price Chart
                charts.push(this.chartsEngine.createForexHistoricalChart(
                    result.data.historicalData,
                    null,
                    { title: `${result.data.pair} - Historical Price`, pair: result.data.pair }
                ));

                // Technical Indicators Charts
                if (result.data.indicators) {
                    const indicators = result.data.indicators;

                    // RSI
                    if (indicators.rsi && indicators.rsi.length > 0) {
                        charts.push(this.chartsEngine.createRSIChart(
                            indicators.rsi,
                            null,
                            { title: `${result.data.pair} - RSI` }
                        ));
                    }

                    // MACD
                    if (indicators.macd) {
                        charts.push(this.chartsEngine.createMACDChart(
                            indicators.macd,
                            null,
                            { title: `${result.data.pair} - MACD` }
                        ));
                    }

                    // Bollinger Bands
                    if (indicators.bollinger && result.data.historicalData) {
                        charts.push(this.chartsEngine.createBollingerBandsChart(
                            indicators.bollinger,
                            result.data.historicalData,
                            null,
                            { title: `${result.data.pair} - Bollinger Bands` }
                        ));
                    }
                }

                // Volatility Chart
                if (result.data.volatility) {
                    charts.push(this.chartsEngine.createForexVolatilityChart(
                        result.data.volatility,
                        null,
                        { title: `${result.data.pair} - Volatility Analysis` }
                    ));
                }
            }

            return {
                text: result.text,
                charts: charts,
                data: result.data
            };

        } catch (error) {
            console.error('❌ Forex analysis error:', error);
            return {
                text: `❌ Forex analysis error: ${error.message}`,
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 📊 ANALYZE INSIDER TRADING (Delegated to ChatbotInsiderAnalyzer)
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeInsiderTrading(entities = {}) {
        if (!this.insiderAnalyzer) {
            return {
                text: '❌ Insider Analyzer not available. Please ensure ChatbotInsiderAnalyzer is loaded.',
                charts: [],
                data: null
            };
        }

        try {
            console.log('📊 Delegating to Insider Analyzer...');
            const result = await this.insiderAnalyzer.analyzeInsiderTrading(entities);

            // ✅ CONVERT INSIDER DATA TO CHARTS
            const charts = [];

            if (result.data) {
                // Transaction Timeline
                if (result.data.transactions) {
                    charts.push(this.chartsEngine.createInsiderTimelineChart(
                        result.data.transactions,
                        null,
                        { title: `${result.data.symbol} - Insider Transaction Timeline` }
                    ));
                }

                // Buy vs Sell Pie
                if (result.data.classified) {
                    charts.push(this.chartsEngine.createInsiderBuySellPieChart(
                        result.data.classified,
                        null,
                        { title: 'Buy vs Sell Distribution' }
                    ));
                }

                // Role Analysis
                if (result.data.roleAnalysis) {
                    charts.push(this.chartsEngine.createInsiderRoleAnalysisChart(
                        result.data.roleAnalysis,
                        null,
                        { title: 'Insider Activity by Role' }
                    ));
                }

                // Sentiment Gauge
                if (result.data.sentiment) {
                    charts.push(this.chartsEngine.createInsiderSentimentGaugeChart(
                        result.data.sentiment,
                        null,
                        { title: 'Insider Sentiment Score' }
                    ));
                }

                // Whale Insiders
                if (result.data.whales) {
                    charts.push(this.chartsEngine.createWhaleInsiderChart(
                        result.data.whales,
                        null,
                        { title: 'Whale Insiders - Top Volume Traders' }
                    ));
                }
            }

            return {
                text: result.text,
                charts: charts,
                data: result.data
            };

        } catch (error) {
            console.error('❌ Insider analysis error:', error);
            return {
                text: `❌ Insider analysis error: ${error.message}`,
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 💰 ANALYZE BUDGET (Delegated to ChatbotBudgetManager)
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeBudget(entities = {}) {
        if (!this.budgetManager) {
            return {
                text: '❌ Budget Manager not available. Please ensure ChatbotBudgetManager is loaded.',
                charts: [],
                data: null
            };
        }

        try {
            console.log('📊 Delegating to Budget Manager...');
            const result = await this.budgetManager.analyzeBudget(entities);

            // ✅ CONVERT BUDGET DATA TO CHARTS
            const charts = [];

            if (result.data) {
                // Budget Overview
                if (result.data.budgetData) {
                    charts.push(this.chartsEngine.createBudgetOverviewChart(
                        result.data.budgetData,
                        null,
                        { title: 'Budget Overview - Income vs Expenses vs Savings' }
                    ));
                }

                // Portfolio Evolution
                if (result.data.portfolioData) {
                    charts.push(this.chartsEngine.createPortfolioEvolutionChart(
                        result.data.portfolioData,
                        null,
                        { title: 'Portfolio Evolution' }
                    ));
                }

                // ROI Evolution
                if (result.data.roiData) {
                    charts.push(this.chartsEngine.createROIChart(
                        result.data.roiData,
                        null,
                        { title: 'ROI Evolution (%)' }
                    ));
                }
            }

            return {
                text: result.text,
                charts: charts,
                data: result.data
            };

        } catch (error) {
            console.error('❌ Budget analysis error:', error);
            return {
                text: `❌ Budget analysis error: ${error.message}`,
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 📈 ANALYZE INVESTMENT (Delegated to ChatbotInvestmentManager)
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeInvestment(entities = {}) {
        if (!this.investmentManager) {
            return {
                text: '❌ Investment Manager not available. Please ensure ChatbotInvestmentManager is loaded.',
                charts: [],
                data: null
            };
        }

        try {
            console.log('📊 Delegating to Investment Manager...');
            const result = await this.investmentManager.analyzeInvestment(entities);

            // ✅ CONVERT INVESTMENT DATA TO CHARTS
            const charts = [];

            if (result.data) {
                // Asset Allocation
                if (result.data.allocation) {
                    charts.push(this.chartsEngine.createAssetAllocationChart(
                        result.data.allocation,
                        null,
                        { title: 'Asset Allocation' }
                    ));
                }

                // Efficient Frontier
                if (result.data.frontier) {
                    charts.push(this.chartsEngine.createEfficientFrontierChart(
                        result.data.frontier,
                        null,
                        { title: 'Efficient Frontier - Risk vs Return' }
                    ));
                }

                // Backtest Performance
                if (result.data.backtest) {
                    charts.push(this.chartsEngine.createBacktestChart(
                        result.data.backtest,
                        null,
                        { title: 'Backtest Performance Comparison' }
                    ));
                }

                // Diversification Radar
                if (result.data.diversification) {
                    charts.push(this.chartsEngine.createDiversificationRadarChart(
                        result.data.diversification,
                        null,
                        { title: 'Portfolio Diversification Score' }
                    ));
                }
            }

            return {
                text: result.text,
                charts: charts,
                data: result.data
            };

        } catch (error) {
            console.error('❌ Investment analysis error:', error);
            return {
                text: `❌ Investment analysis error: ${error.message}`,
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * 📊 ANALYZE STOCK (Technical Analysis - EXISTING)
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeStock(symbol, entities = {}) {
        try {
            if (!this.apiClient) {
                await this.initialize();
            }

            if (!this.apiClient && window.apiClient) {
                this.apiClient = window.apiClient;
            }

            if (!this.apiClient) {
                return {
                    text: `❌ Unable to fetch data for ${symbol}. API client not initialized.`,
                    charts: [],
                    data: null
                };
            }

            console.log(`📊 Analyzing ${symbol}...`);

            const [quote, timeSeries] = await Promise.all([
                this.apiClient.getQuote(symbol).catch(() => null),
                this.apiClient.getTimeSeries(symbol, '1day', 365).catch(() => null)
            ]);

            if (!quote || !timeSeries || !timeSeries.data || timeSeries.data.length < 30) {
                return {
                    text: `❌ Unable to fetch sufficient data for ${symbol}. Please verify the ticker symbol.`,
                    charts: [],
                    data: null
                };
            }

            const prices = timeSeries.data;
            const technicalIndicators = this.calculateAllIndicators(prices);
            const alphaVaultScore = this.calculateAlphaVaultScore(technicalIndicators);
            const riskMetrics = this.calculateRiskMetrics(prices);
            const aiRecommendation = this.generateAIRecommendation(alphaVaultScore, technicalIndicators, riskMetrics);

            // ✅ GENERATE ALL TECHNICAL CHARTS
            const charts = this.generateTechnicalCharts(technicalIndicators, symbol);

            const responseText = this.buildAnalysisResponse(symbol, quote, alphaVaultScore, technicalIndicators, riskMetrics, aiRecommendation);

            return {
                text: responseText,
                charts: charts,
                data: {
                    symbol,
                    quote,
                    alphaVaultScore,
                    technicalIndicators,
                    riskMetrics,
                    aiRecommendation
                }
            };

        } catch (error) {
            console.error('❌ Stock analysis error:', error);
            return {
                text: `❌ An error occurred while analyzing ${symbol}. Please try again.`,
                charts: [],
                data: null
            };
        }
    }

    // ═══════════════════════════════════════════════════════════
    // TECHNICAL INDICATORS (EXISTING METHODS - Keep as is)
    // ═══════════════════════════════════════════════════════════

    calculateAllIndicators(prices) {
        return {
            rsi: this.calculateRSI(prices),
            macd: this.calculateMACD(prices),
            stochastic: this.calculateStochastic(prices),
            adx: this.calculateADX(prices),
            obv: this.calculateOBV(prices),
            atr: this.calculateATR(prices),
            mfi: this.calculateMFI(prices),
            cci: this.calculateCCI(prices),
            williamsR: this.calculateWilliamsR(prices),
            roc: this.calculateROC(prices),
            aroon: this.calculateAroon(prices),
            cmf: this.calculateCMF(prices),
            elderRay: this.calculateElderRay(prices),
            ultimateOscillator: this.calculateUltimateOscillator(prices)
        };
    }

    calculateRSI(prices, period = 14) {
        const rsi = [];
        const changes = [];
        
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i].close - prices[i - 1].close);
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
            
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsiValue = 100 - (100 / (1 + rs));
            
            rsi.push([prices[i + 1].timestamp, rsiValue]);
        }
        
        return rsi;
    }

    calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        const closes = prices.map(p => p.close);
        
        const fastEMA = this.calculateEMA(closes, fastPeriod);
        const slowEMA = this.calculateEMA(closes, slowPeriod);
        
        const macdLine = [];
        const startIndex = Math.max(fastEMA.length - slowEMA.length, 0);
        
        for (let i = 0; i < slowEMA.length; i++) {
            const macdValue = fastEMA[i + startIndex] - slowEMA[i];
            macdLine.push(macdValue);
        }
        
        const signalEMA = this.calculateEMA(macdLine, signalPeriod);
        
        const macdLineData = [];
        const signalLineData = [];
        const histogram = [];
        
        const offset = prices.length - macdLine.length;
        const signalOffset = macdLine.length - signalEMA.length;
        
        for (let i = 0; i < signalEMA.length; i++) {
            const timestamp = prices[offset + signalOffset + i].timestamp;
            const macdVal = macdLine[signalOffset + i];
            const signalVal = signalEMA[i];
            
            macdLineData.push([timestamp, macdVal]);
            signalLineData.push([timestamp, signalVal]);
            histogram.push([timestamp, macdVal - signalVal]);
        }
        
        return { macdLine: macdLineData, signalLine: signalLineData, histogram };
    }

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

    calculateStochastic(prices, kPeriod = 14, dPeriod = 3) {
        const k = [];
        const d = [];
        
        for (let i = kPeriod - 1; i < prices.length; i++) {
            const slice = prices.slice(i - kPeriod + 1, i + 1);
            const high = Math.max(...slice.map(p => p.high));
            const low = Math.min(...slice.map(p => p.low));
            const close = prices[i].close;
            
            const kValue = ((close - low) / (high - low)) * 100;
            k.push([prices[i].timestamp, kValue || 0]);
        }
        
        for (let i = dPeriod - 1; i < k.length; i++) {
            const slice = k.slice(i - dPeriod + 1, i + 1);
            const avg = slice.reduce((sum, item) => sum + item[1], 0) / dPeriod;
            d.push([k[i][0], avg]);
        }
        
        return { k, d };
    }

    calculateADX(prices, period = 14) {
        if (prices.length < period + 2) {
            return { adx: [], plusDI: [], minusDI: [] };
        }
        
        const trueRange = [];
        const plusDM = [];
        const minusDM = [];
        
        for (let i = 1; i < prices.length; i++) {
            const high = prices[i].high;
            const low = prices[i].low;
            const prevClose = prices[i - 1].close;
            
            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            trueRange.push(tr);
            
            const highDiff = high - prices[i - 1].high;
            const lowDiff = prices[i - 1].low - low;
            
            plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
            minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
        }
        
        const smoothTR = this.smoothArray(trueRange, period);
        const smoothPlusDM = this.smoothArray(plusDM, period);
        const smoothMinusDM = this.smoothArray(minusDM, period);
        
        const plusDI = [];
        const minusDI = [];
        const dxValues = [];
        
        const maxIndex = Math.min(smoothTR.length, prices.length - period - 1);
        
        for (let i = 0; i < maxIndex; i++) {
            if (smoothTR[i] === 0) continue;
            
            const plusDIValue = (smoothPlusDM[i] / smoothTR[i]) * 100;
            const minusDIValue = (smoothMinusDM[i] / smoothTR[i]) * 100;
            
            const timestamp = prices[i + period + 1].timestamp;
            plusDI.push([timestamp, plusDIValue]);
            minusDI.push([timestamp, minusDIValue]);
            
            const sum = plusDIValue + minusDIValue;
            if (sum > 0) {
                const dx = (Math.abs(plusDIValue - minusDIValue) / sum) * 100;
                dxValues.push(dx);
            }
        }
        
        if (dxValues.length < period) {
            return { adx: [], plusDI, minusDI };
        }
        
        const adxSmoothed = this.smoothArray(dxValues, period);
        const adxArray = [];
        
        const adxMaxIndex = Math.min(adxSmoothed.length, prices.length - period * 2 - 1);
        
        for (let i = 0; i < adxMaxIndex; i++) {
            const timestamp = prices[i + period * 2 + 1].timestamp;
            adxArray.push([timestamp, adxSmoothed[i]]);
        }
        
        return { adx: adxArray, plusDI, minusDI };
    }

    smoothArray(arr, period) {
        if (arr.length < period) return [];
        
        const result = [];
        let sum = 0;
        
        for (let i = 0; i < period; i++) {
            sum += arr[i];
        }
        result.push(sum / period);
        
        for (let i = period; i < arr.length; i++) {
            const smoothed = (result[result.length - 1] * (period - 1) + arr[i]) / period;
            result.push(smoothed);
        }
        
        return result;
    }

    calculateOBV(prices) {
        const obv = [];
        let currentOBV = 0;
        
        obv.push([prices[0].timestamp, currentOBV]);
        
        for (let i = 1; i < prices.length; i++) {
            if (prices[i].close > prices[i - 1].close) {
                currentOBV += prices[i].volume;
            } else if (prices[i].close < prices[i - 1].close) {
                currentOBV -= prices[i].volume;
            }
            
            obv.push([prices[i].timestamp, currentOBV]);
        }
        
        return obv;
    }

    calculateATR(prices, period = 14) {
        const trueRange = [];
        
        for (let i = 1; i < prices.length; i++) {
            const high = prices[i].high;
            const low = prices[i].low;
            const prevClose = prices[i - 1].close;
            
            const tr = Math.max(
                high - low,
                Math.abs(high - prevClose),
                Math.abs(low - prevClose)
            );
            
            trueRange.push(tr);
        }
        
        const atr = [];
        let sum = 0;
        
        for (let i = 0; i < period && i < trueRange.length; i++) {
            sum += trueRange[i];
        }
        
        if (period < prices.length) {
            atr.push([prices[period].timestamp, sum / period]);
        }
        
        for (let i = period; i < trueRange.length; i++) {
            const smoothed = (atr[atr.length - 1][1] * (period - 1) + trueRange[i]) / period;
            const priceIndex = i + 1;
            
            if (priceIndex < prices.length) {
                atr.push([prices[priceIndex].timestamp, smoothed]);
            }
        }
        
        return atr;
    }

    calculateMFI(prices, period = 14) {
        const mfi = [];
        const typicalPrices = [];
        const moneyFlow = [];
        
        for (let i = 0; i < prices.length; i++) {
            const typical = (prices[i].high + prices[i].low + prices[i].close) / 3;
            typicalPrices.push(typical);
            moneyFlow.push(typical * prices[i].volume);
        }
        
        for (let i = period; i < prices.length; i++) {
            let positiveFlow = 0;
            let negativeFlow = 0;
            
            for (let j = i - period + 1; j <= i; j++) {
                if (typicalPrices[j] > typicalPrices[j - 1]) {
                    positiveFlow += moneyFlow[j];
                } else if (typicalPrices[j] < typicalPrices[j - 1]) {
                    negativeFlow += moneyFlow[j];
                }
            }
            
            const moneyFlowRatio = negativeFlow === 0 ? 100 : positiveFlow / negativeFlow;
            const mfiValue = 100 - (100 / (1 + moneyFlowRatio));
            
            mfi.push([prices[i].timestamp, mfiValue]);
        }
        
        return mfi;
    }

    calculateCCI(prices, period = 20) {
        const cci = [];
        const typicalPrices = prices.map(p => (p.high + p.low + p.close) / 3);
        
        for (let i = period - 1; i < prices.length; i++) {
            const slice = typicalPrices.slice(i - period + 1, i + 1);
            const sma = slice.reduce((a, b) => a + b, 0) / period;
            
            const meanDeviation = slice.reduce((sum, val) => sum + Math.abs(val - sma), 0) / period;
            
            const cciValue = (typicalPrices[i] - sma) / (0.015 * meanDeviation);
            
            cci.push([prices[i].timestamp, cciValue]);
        }
        
        return cci;
    }

    calculateWilliamsR(prices, period = 14) {
        const williams = [];
        
        for (let i = period - 1; i < prices.length; i++) {
            const slice = prices.slice(i - period + 1, i + 1);
            const high = Math.max(...slice.map(p => p.high));
            const low = Math.min(...slice.map(p => p.low));
            const close = prices[i].close;
            
            const value = ((high - close) / (high - low)) * -100;
            williams.push([prices[i].timestamp, value || 0]);
        }
        
        return williams;
    }

    calculateROC(prices, period = 12) {
        const roc = [];
        
        for (let i = period; i < prices.length; i++) {
            const currentClose = prices[i].close;
            const pastClose = prices[i - period].close;
            const rocValue = ((currentClose - pastClose) / pastClose) * 100;
            
            roc.push([prices[i].timestamp, rocValue]);
        }
        
        return roc;
    }

    calculateAroon(prices, period = 25) {
        const up = [];
        const down = [];
        
        for (let i = period; i < prices.length; i++) {
            const slice = prices.slice(i - period, i + 1);
            
            let highestIndex = 0;
            let lowestIndex = 0;
            let highest = slice[0].high;
            let lowest = slice[0].low;
            
            for (let j = 1; j < slice.length; j++) {
                if (slice[j].high > highest) {
                    highest = slice[j].high;
                    highestIndex = j;
                }
                if (slice[j].low < lowest) {
                    lowest = slice[j].low;
                    lowestIndex = j;
                }
            }
            
            const daysSinceHigh = period - highestIndex;
            const daysSinceLow = period - lowestIndex;
            
            const aroonUp = ((period - daysSinceHigh) / period) * 100;
            const aroonDown = ((period - daysSinceLow) / period) * 100;
            
            up.push([prices[i].timestamp, aroonUp]);
            down.push([prices[i].timestamp, aroonDown]);
        }
        
        return { up, down };
    }

    calculateCMF(prices, period = 20) {
        const cmf = [];
        const moneyFlowMultiplier = [];
        const moneyFlowVolume = [];
        
        for (let i = 0; i < prices.length; i++) {
            const high = prices[i].high;
            const low = prices[i].low;
            const close = prices[i].close;
            const volume = prices[i].volume;
            
            const mfm = high === low ? 0 : ((close - low) - (high - close)) / (high - low);
            const mfv = mfm * volume;
            
            moneyFlowMultiplier.push(mfm);
            moneyFlowVolume.push(mfv);
        }
        
        for (let i = period - 1; i < prices.length; i++) {
            const sumMFV = this.sumArray(moneyFlowVolume, i - period + 1, i + 1);
            const sumVolume = prices.slice(i - period + 1, i + 1).reduce((sum, p) => sum + p.volume, 0);
            
            const cmfValue = sumVolume === 0 ? 0 : sumMFV / sumVolume;
            
            cmf.push([prices[i].timestamp, cmfValue]);
        }
        
        return cmf;
    }

    calculateElderRay(prices, period = 13) {
        const closes = prices.map(p => p.close);
        const ema = this.calculateEMA(closes, period);
        
        const bullPower = [];
        const bearPower = [];
        
        const offset = prices.length - ema.length;
        
        for (let i = 0; i < ema.length; i++) {
            const priceIndex = offset + i;
            const timestamp = prices[priceIndex].timestamp;
            const high = prices[priceIndex].high;
            const low = prices[priceIndex].low;
            const emaValue = ema[i];
            
            bullPower.push([timestamp, high - emaValue]);
            bearPower.push([timestamp, low - emaValue]);
        }
        
        return { bullPower, bearPower };
    }

    calculateUltimateOscillator(prices, period1 = 7, period2 = 14, period3 = 28) {
        const ultimate = [];
        const buyingPressure = [];
        const trueRange = [];
        
        for (let i = 1; i < prices.length; i++) {
            const trueLow = Math.min(prices[i].low, prices[i - 1].close);
            const bp = prices[i].close - trueLow;
            const tr = Math.max(prices[i].high, prices[i - 1].close) - trueLow;
            
            buyingPressure.push(bp);
            trueRange.push(tr);
        }
        
        const maxPeriod = Math.max(period1, period2, period3);
        
        for (let i = maxPeriod - 1; i < buyingPressure.length; i++) {
            const avg1 = this.sumArray(buyingPressure, i - period1 + 1, i + 1) / this.sumArray(trueRange, i - period1 + 1, i + 1);
            const avg2 = this.sumArray(buyingPressure, i - period2 + 1, i + 1) / this.sumArray(trueRange, i - period2 + 1, i + 1);
            const avg3 = this.sumArray(buyingPressure, i - period3 + 1, i + 1) / this.sumArray(trueRange, i - period3 + 1, i + 1);
            
            const uo = 100 * ((4 * avg1 + 2 * avg2 + avg3) / 7);
            
            ultimate.push([prices[i + 1].timestamp, uo]);
        }
        
        return ultimate;
    }

    sumArray(arr, start, end) {
        let sum = 0;
        for (let i = start; i < end && i < arr.length; i++) {
            sum += arr[i];
        }
        return sum || 1;
    }

    calculateAlphaVaultScore(indicators) {
        let score = 50;
        let totalWeight = 0;
        let weightedScore = 0;

        if (indicators.rsi.length > 0) {
            const lastRSI = indicators.rsi[indicators.rsi.length - 1][1];
            let rsiScore = 0;
            
            if (lastRSI < 30) rsiScore = 80;
            else if (lastRSI < 40) rsiScore = 65;
            else if (lastRSI > 70) rsiScore = 20;
            else if (lastRSI > 60) rsiScore = 35;
            else rsiScore = 50;
            
            weightedScore += rsiScore * 1.8;
            totalWeight += 1.8;
        }

        if (indicators.macd.histogram.length > 0) {
            const lastHist = indicators.macd.histogram[indicators.macd.histogram.length - 1][1];
            let macdScore = lastHist > 0 ? 70 : 30;
            
            weightedScore += macdScore * 2.2;
            totalWeight += 2.2;
        }

        if (indicators.adx.adx.length > 0) {
            const lastADX = indicators.adx.adx[indicators.adx.adx.length - 1][1];
            const lastPlusDI = indicators.adx.plusDI[indicators.adx.plusDI.length - 1][1];
            const lastMinusDI = indicators.adx.minusDI[indicators.adx.minusDI.length - 1][1];
            
            let adxScore = 50;
            if (lastADX > 25) {
                adxScore = lastPlusDI > lastMinusDI ? 75 : 25;
            }
            
            weightedScore += adxScore * 2.0;
            totalWeight += 2.0;
        }

        if (indicators.obv.length >= 20) {
            const recentOBV = indicators.obv.slice(-20);
            const obvTrend = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
            const obvScore = obvTrend > 0 ? 65 : 35;
            
            weightedScore += obvScore * 1.7;
            totalWeight += 1.7;
        }

        if (indicators.stochastic.k.length > 0) {
            const lastK = indicators.stochastic.k[indicators.stochastic.k.length - 1][1];
            let stochScore = 50;
            
            if (lastK < 20) stochScore = 75;
            else if (lastK > 80) stochScore = 25;
            
            weightedScore += stochScore * 1.5;
            totalWeight += 1.5;
        }

        const finalScore = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 50;

        return Math.max(0, Math.min(100, finalScore));
    }

    calculateRiskMetrics(prices) {
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            const ret = (prices[i].close - prices[i - 1].close) / prices[i - 1].close;
            returns.push(ret);
        }

        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100;

        const riskFreeRate = 0.03;
        const annualReturn = mean * 252;
        const sharpeRatio = (annualReturn - riskFreeRate) / (volatility / 100);

        let peak = prices[0].close;
        let maxDrawdown = 0;

        for (let i = 1; i < prices.length; i++) {
            if (prices[i].close > peak) {
                peak = prices[i].close;
            }
            const drawdown = ((peak - prices[i].close) / peak) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        }

        const sortedReturns = [...returns].sort((a, b) => a - b);
        const varIndex = Math.floor(returns.length * 0.05);
        const var95 = sortedReturns[varIndex] * 100;

        return {
            volatility: volatility.toFixed(2),
            sharpeRatio: sharpeRatio.toFixed(2),
            maxDrawdown: maxDrawdown.toFixed(2),
            var95: var95.toFixed(2)
        };
    }

    generateAIRecommendation(alphaVaultScore, indicators, riskMetrics) {
        let recommendation = 'HOLD';
        let confidence = 50;

        if (alphaVaultScore >= 75) {
            recommendation = 'BUY';
            confidence = 85;
        } else if (alphaVaultScore >= 60) {
            recommendation = 'BUY';
            confidence = 70;
        } else if (alphaVaultScore >= 55) {
            recommendation = 'BUY';
            confidence = 60;
        } else if (alphaVaultScore <= 25) {
            recommendation = 'SELL';
            confidence = 85;
        } else if (alphaVaultScore <= 40) {
            recommendation = 'SELL';
            confidence = 70;
        } else if (alphaVaultScore <= 45) {
            recommendation = 'SELL';
            confidence = 60;
        }

        return {
            recommendation,
            confidence,
            rating: alphaVaultScore >= 75 ? 'VERY BULLISH' :
                    alphaVaultScore >= 60 ? 'BULLISH' :
                    alphaVaultScore >= 45 ? 'NEUTRAL' :
                    alphaVaultScore >= 30 ? 'BEARISH' : 'VERY BEARISH'
        };
    }

    /**
     * ✅ GENERATE TECHNICAL CHARTS
     */
    generateTechnicalCharts(indicators, symbol) {
        if (!this.chartsEngine) {
            return [];
        }

        const charts = [];

        if (indicators.rsi.length > 0) {
            charts.push(this.chartsEngine.createRSIChart(indicators.rsi, null, { 
                title: `${symbol} - RSI (Relative Strength Index)` 
            }));
        }

        if (indicators.macd.histogram.length > 0) {
            charts.push(this.chartsEngine.createMACDChart(indicators.macd, null, { 
                title: `${symbol} - MACD` 
            }));
        }

        if (indicators.stochastic.k.length > 0) {
            charts.push(this.chartsEngine.createStochasticChart(indicators.stochastic, null, { 
                title: `${symbol} - Stochastic Oscillator` 
            }));
        }

        if (indicators.adx.adx.length > 0) {
            charts.push(this.chartsEngine.createADXChart(indicators.adx, null, { 
                title: `${symbol} - ADX (Trend Strength)` 
            }));
        }

        if (indicators.atr.length > 0) {
            charts.push(this.chartsEngine.createATRChart(indicators.atr, null, {
                title: `${symbol} - ATR (Volatility)`
            }));
        }

        if (indicators.obv.length > 0) {
            charts.push(this.chartsEngine.createOBVChart(indicators.obv, null, {
                title: `${symbol} - On-Balance Volume`
            }));
        }

        return charts;
    }

    buildAnalysisResponse(symbol, quote, alphaVaultScore, technicalIndicators, riskMetrics, aiRecommendation) {
        const lastRSI = technicalIndicators.rsi.length > 0 ? technicalIndicators.rsi[technicalIndicators.rsi.length - 1][1].toFixed(2) : 'N/A';
        const lastMACD = technicalIndicators.macd.histogram.length > 0 ? technicalIndicators.macd.histogram[technicalIndicators.macd.histogram.length - 1][1].toFixed(4) : 'N/A';

        return `📊 **Technical Analysis for ${symbol}**

**AlphaVault Score:** ${alphaVaultScore}/100 (${aiRecommendation.rating})
**AI Recommendation:** ${aiRecommendation.recommendation} (${aiRecommendation.confidence}% confidence)

**Key Technical Indicators:**
• RSI (14): ${lastRSI}
• MACD Histogram: ${lastMACD}

**Risk Metrics:**
• Volatility (annualized): ${riskMetrics.volatility}%
• Sharpe Ratio: ${riskMetrics.sharpeRatio}
• Max Drawdown: ${riskMetrics.maxDrawdown}%
• VaR (95%): ${riskMetrics.var95}%

📈 View the detailed charts below for comprehensive technical analysis.`;
    }

    async getMarketOverview(entities) {
        return {
            text: `📊 **Market Overview**

The current market environment shows mixed signals across major indices. For detailed analysis of specific stocks, please provide a ticker symbol.

**Major Indices:**
• S&P 500: Market sentiment neutral
• NASDAQ: Tech sector showing strength
• Dow Jones: Industrial stocks consolidating

Use commands like "analyze AAPL" or "show me NVDA technical analysis" for detailed stock insights.`,
            charts: [],
            data: null
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotAnalytics;
}

if (typeof window !== 'undefined') {
    window.ChatbotAnalytics = ChatbotAnalytics;
}

console.log('✅ ChatbotAnalytics Ultra v5.0 loaded - ALL modules integrated');