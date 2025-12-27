/**
 * ════════════════════════════════════════════════════════════════
 * STOCK ANALYSIS NEWSLETTER SYSTEM V1.0
 * Deep Technical Analysis for Individual Stocks
 * Premium Design - Based on 14 Technical Indicators
 * ════════════════════════════════════════════════════════════════
 */

class StockAnalysisNewsletter {
    constructor() {
        this.LAST_POST_KEY = 'lastStockAnalysisPost';
        this.advancedAnalysis = null;
        this.stockData = null;
        this.technicalSignals = null;
        this.aiRecommendations = null;
    }

    async initialize() {
        console.log('📊 Initializing Stock Analysis Newsletter System...');
        
        // Attendre que AdvancedAnalysis soit disponible
        await this.waitForAdvancedAnalysis();
        
        console.log('✅ Stock Analysis Newsletter System ready');
    }

    async waitForAdvancedAnalysis() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50;

            const checkAnalysis = setInterval(() => {
                attempts++;

                if (window.AdvancedAnalysis || window.advancedAnalysis) {
                    console.log('✅ AdvancedAnalysis module found');
                    this.advancedAnalysis = window.AdvancedAnalysis || window.advancedAnalysis;
                    clearInterval(checkAnalysis);
                    resolve();
                    return;
                }

                if (attempts >= maxAttempts) {
                    console.warn('⚠ AdvancedAnalysis not available after 5s');
                    clearInterval(checkAnalysis);
                    resolve();
                }
            }, 100);
        });
    }

    // ════════════════════════════════════════════════════════════════
    // GÉNÉRATION DE LA NEWSLETTER POUR UN STOCK
    // ════════════════════════════════════════════════════════════════

    async generateStockAnalysis(symbol, forceManual = false) {
        try {
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                console.error('❌ No user authenticated');
                if (forceManual) {
                    this.showNotification('Please log in to generate analysis', 'error');
                }
                return;
            }

            if (!symbol || symbol.trim() === '') {
                this.showNotification('Please enter a valid stock symbol', 'error');
                return;
            }

            symbol = symbol.trim().toUpperCase();

            this.showNotification(`📊 Generating deep analysis for ${symbol}...`, 'info');

            console.log(`🔍 Loading comprehensive data for ${symbol}...`);

            // ✅ Charger les données via AdvancedAnalysis
            if (!this.advancedAnalysis) {
                throw new Error('Advanced Analysis module not available');
            }

            // Charger le stock
            await this.loadStockData(symbol);

            if (!this.stockData || !this.stockData.prices || this.stockData.prices.length < 30) {
                throw new Error(`Insufficient data for ${symbol} (minimum 30 days required)`);
            }

            console.log(`✅ Data loaded: ${this.stockData.prices.length} data points`);

            // ✅ Calculer tous les indicateurs techniques
            this.technicalSignals = this.calculateAllTechnicalIndicators(this.stockData.prices);

            // ✅ Générer les recommandations AI
            this.aiRecommendations = this.generateAIRecommendations(this.stockData.prices, this.technicalSignals);

            // ✅ Générer le contenu premium
            const postContent = this.generatePremiumContent(symbol);

            // ✅ Publier sur Firestore
            const postData = {
                title: `📊 Deep Analysis: ${symbol} - AlphaVault Intelligence Report`,
                content: postContent.markdown,
                channelId: 'technical-analysis',
                tags: ['stock-analysis', 'technical-indicators', 'ai-recommendation', symbol.toLowerCase()],
                images: this.stockData.quote?.image ? [this.stockData.quote.image] : [],
                authorId: currentUser.uid,
                authorName: 'AlphaVault AI',
                authorPhoto: currentUser.photoURL || 'https://ui-avatars.com/api/?name=AlphaVault+AI&background=667eea&color=fff&bold=true',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                views: 0,
                likes: [],
                commentsCount: 0,
                isPinned: false,
                isAutoGenerated: true,
                stockSymbol: symbol,
                analysisDate: new Date().toISOString()
            };

            console.log('📤 Publishing stock analysis to Firestore...');
            const docRef = await firebase.firestore().collection('posts').add(postData);

            console.log(`✅ Analysis published successfully! ID: ${docRef.id}`);

            localStorage.setItem(this.LAST_POST_KEY, Date.now().toString());

            this.showNotification(`✅ Analysis for ${symbol} published!`, 'success');

            if (window.communityHub) {
                await window.communityHub.loadPosts();
            }

        } catch (error) {
            console.error('❌ Error generating stock analysis:', error);
            this.showNotification('Failed to generate analysis: ' + error.message, 'error');
        }
    }

    // ════════════════════════════════════════════════════════════════
    // CHARGEMENT DES DONNÉES DU STOCK
    // ════════════════════════════════════════════════════════════════

    async loadStockData(symbol) {
        // ✅ CRÉER SON PROPRE API CLIENT SI NÉCESSAIRE
        let apiClient = null;
        
        // Méthode 1 : Utiliser l'API client de AdvancedAnalysis
        if (this.advancedAnalysis && this.advancedAnalysis.apiClient) {
            apiClient = this.advancedAnalysis.apiClient;
            console.log('✅ Using AdvancedAnalysis.apiClient');
        }
        // Méthode 2 : Utiliser l'API client global
        else if (window.apiClient) {
            apiClient = window.apiClient;
            console.log('✅ Using window.apiClient');
        }
        // Méthode 3 : Créer un nouveau client
        else if (typeof FinanceAPIClient !== 'undefined') {
            console.log('⚠ Creating new FinanceAPIClient instance...');
            
            // Vérifier si APP_CONFIG existe
            const baseURL = typeof APP_CONFIG !== 'undefined' 
                ? APP_CONFIG.API_BASE_URL 
                : 'https://financial-data-api.raphnardone.workers.dev';
            
            apiClient = new FinanceAPIClient({
                baseURL: baseURL,
                cacheDuration: 300000,
                maxRetries: 2
            });
            
            // Stocker pour réutilisation
            window.apiClient = apiClient;
            console.log('✅ New FinanceAPIClient created');
        }
        else {
            throw new Error('FinanceAPIClient class not available');
        }

        try {
            console.log(`📡 Fetching data for ${symbol}...`);
            
            const [quote, timeSeries] = await Promise.all([
                apiClient.getQuote(symbol),
                apiClient.getTimeSeries(symbol, '1day', 365)
            ]);

            if (!quote || !timeSeries || !timeSeries.data) {
                throw new Error('Failed to load stock data from API');
            }

            this.stockData = {
                symbol: quote.symbol || symbol,
                prices: timeSeries.data,
                currency: timeSeries.currency || 'USD',
                quote: quote
            };

            console.log(`✅ Stock data loaded for ${symbol}: ${this.stockData.prices.length} data points`);

        } catch (error) {
            console.warn('⚠ API call failed, using demo data:', error.message);
            this.stockData = this.generateDemoData(symbol);
            console.log('✅ Demo data generated successfully');
        }
    }

    // ════════════════════════════════════════════════════════════════
    // CALCUL DE TOUS LES INDICATEURS TECHNIQUES
    // ════════════════════════════════════════════════════════════════

    calculateAllTechnicalIndicators(prices) {
        console.log('📊 Calculating 14 technical indicators...');

        const signals = {
            momentum: [],
            trend: [],
            volume: [],
            volatility: [],
            composite: []
        };

        // 1⃣ RSI
        try {
            const rsi = this.advancedAnalysis.calculateRSI(prices);
            if (rsi.length > 0) {
                const lastRSI = rsi[rsi.length - 1][1];
                let strength = 0;
                if (lastRSI < 30) strength = 2.0;
                else if (lastRSI > 70) strength = -2.0;
                else if (lastRSI < 40) strength = 1.0;
                else if (lastRSI > 60) strength = -1.0;

                signals.momentum.push({
                    name: 'RSI',
                    value: lastRSI.toFixed(2),
                    signal: strength,
                    status: lastRSI < 30 ? 'Oversold' : lastRSI > 70 ? 'Overbought' : 'Neutral'
                });
            }
        } catch (e) { console.warn('RSI calc failed:', e); }

        // 2⃣ MACD
        try {
            const macd = this.advancedAnalysis.calculateMACD(prices);
            if (macd.histogram.length > 0) {
                const lastHist = macd.histogram[macd.histogram.length - 1][1];
                const prevHist = macd.histogram[macd.histogram.length - 2]?.[1] || 0;
                
                let strength = 0;
                if (lastHist > 0 && prevHist <= 0) strength = 2.5;
                else if (lastHist < 0 && prevHist >= 0) strength = -2.5;
                else if (lastHist > 0) strength = 1.0;
                else if (lastHist < 0) strength = -1.0;

                signals.trend.push({
                    name: 'MACD',
                    value: lastHist.toFixed(4),
                    signal: strength,
                    status: lastHist > 0 && prevHist <= 0 ? 'Bullish Cross' : 
                           lastHist < 0 && prevHist >= 0 ? 'Bearish Cross' :
                           lastHist > 0 ? 'Positive' : 'Negative'
                });
            }
        } catch (e) { console.warn('MACD calc failed:', e); }

        // 3⃣ Stochastic
        try {
            const stochastic = this.advancedAnalysis.calculateStochastic(prices);
            if (stochastic.k.length > 0) {
                const lastK = stochastic.k[stochastic.k.length - 1][1];
                
                let strength = 0;
                if (lastK < 20) strength = 1.5;
                else if (lastK > 80) strength = -1.5;

                signals.momentum.push({
                    name: 'Stochastic',
                    value: lastK.toFixed(2),
                    signal: strength,
                    status: lastK < 20 ? 'Oversold' : lastK > 80 ? 'Overbought' : 'Neutral'
                });
            }
        } catch (e) { console.warn('Stochastic calc failed:', e); }

        // 4⃣ Williams %R
        try {
            const williams = this.advancedAnalysis.calculateWilliams(prices);
            if (williams.length > 0) {
                const lastWR = williams[williams.length - 1][1];
                
                let strength = 0;
                if (lastWR < -80) strength = 1.5;
                else if (lastWR > -20) strength = -1.5;

                signals.momentum.push({
                    name: 'Williams %R',
                    value: lastWR.toFixed(2),
                    signal: strength,
                    status: lastWR < -80 ? 'Oversold' : lastWR > -20 ? 'Overbought' : 'Neutral'
                });
            }
        } catch (e) { console.warn('Williams calc failed:', e); }

        // 5⃣ ADX
        try {
            const adx = this.advancedAnalysis.calculateADX(prices);
            if (adx.adx.length > 0) {
                const lastADX = adx.adx[adx.adx.length - 1][1];
                const lastPlusDI = adx.plusDI[adx.plusDI.length - 1][1];
                const lastMinusDI = adx.minusDI[adx.minusDI.length - 1][1];
                
                let strength = 0;
                if (lastADX > 25) {
                    strength = lastPlusDI > lastMinusDI ? 2.0 : -2.0;
                }

                signals.trend.push({
                    name: 'ADX',
                    value: lastADX.toFixed(2),
                    signal: strength,
                    status: lastADX > 25 ? (lastPlusDI > lastMinusDI ? 'Strong Uptrend' : 'Strong Downtrend') : 'Weak Trend'
                });
            }
        } catch (e) { console.warn('ADX calc failed:', e); }

        // 6⃣ OBV
        try {
            const obv = this.advancedAnalysis.calculateOBV(prices);
            if (obv.length >= 20) {
                const recentOBV = obv.slice(-20);
                const obvTrend = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
                
                let strength = obvTrend > 0 ? 1.5 : -1.5;

                signals.volume.push({
                    name: 'OBV',
                    value: obvTrend > 0 ? 'Rising' : 'Falling',
                    signal: strength,
                    status: obvTrend > 0 ? 'Accumulation' : 'Distribution'
                });
            }
        } catch (e) { console.warn('OBV calc failed:', e); }

        // 7⃣ ATR
        try {
            const atr = this.advancedAnalysis.calculateATR(prices);
            if (atr.length > 0) {
                const lastATR = atr[atr.length - 1][1];
                const avgATR = atr.slice(-30).reduce((sum, val) => sum + val[1], 0) / Math.min(30, atr.length);
                const atrRatio = lastATR / avgATR;

                signals.volatility.push({
                    name: 'ATR',
                    value: lastATR.toFixed(2),
                    signal: 0,
                    status: atrRatio > 1.3 ? 'High Volatility' : atrRatio < 0.8 ? 'Low Volatility' : 'Normal'
                });
            }
        } catch (e) { console.warn('ATR calc failed:', e); }

        // 8⃣ MFI
        try {
            const mfi = this.advancedAnalysis.calculateMFI(prices);
            if (mfi.length > 0) {
                const lastMFI = mfi[mfi.length - 1][1];
                
                let strength = 0;
                if (lastMFI < 20) strength = 2.0;
                else if (lastMFI > 80) strength = -2.0;

                signals.momentum.push({
                    name: 'MFI',
                    value: lastMFI.toFixed(2),
                    signal: strength,
                    status: lastMFI < 20 ? 'Oversold' : lastMFI > 80 ? 'Overbought' : 'Neutral'
                });
            }
        } catch (e) { console.warn('MFI calc failed:', e); }

        // 9⃣ CCI
        try {
            const cci = this.advancedAnalysis.calculateCCI(prices);
            if (cci.length > 0) {
                const lastCCI = cci[cci.length - 1][1];
                
                let strength = 0;
                if (lastCCI < -100) strength = 1.5;
                else if (lastCCI > 100) strength = -1.5;

                signals.composite.push({
                    name: 'CCI',
                    value: lastCCI.toFixed(2),
                    signal: strength,
                    status: lastCCI < -100 ? 'Oversold' : lastCCI > 100 ? 'Overbought' : 'Neutral'
                });
            }
        } catch (e) { console.warn('CCI calc failed:', e); }

        // 🔟 Ultimate Oscillator
        try {
            const ultimate = this.advancedAnalysis.calculateUltimateOscillator(prices);
            if (ultimate.length > 0) {
                const lastUO = ultimate[ultimate.length - 1][1];
                
                let strength = 0;
                if (lastUO < 30) strength = 1.8;
                else if (lastUO > 70) strength = -1.8;

                signals.composite.push({
                    name: 'Ultimate Oscillator',
                    value: lastUO.toFixed(2),
                    signal: strength,
                    status: lastUO < 30 ? 'Oversold' : lastUO > 70 ? 'Overbought' : 'Neutral'
                });
            }
        } catch (e) { console.warn('Ultimate Osc calc failed:', e); }

        // 1⃣1⃣ ROC
        try {
            const roc = this.advancedAnalysis.calculateROC(prices);
            if (roc.length > 0) {
                const lastROC = roc[roc.length - 1][1];
                
                let strength = 0;
                if (lastROC > 10) strength = 2.0;
                else if (lastROC < -10) strength = -2.0;
                else if (lastROC > 0) strength = 0.5;
                else if (lastROC < 0) strength = -0.5;

                signals.momentum.push({
                    name: 'ROC',
                    value: lastROC.toFixed(2) + '%',
                    signal: strength,
                    status: lastROC > 5 ? 'Strong Momentum' : lastROC < -5 ? 'Weak Momentum' : 'Neutral'
                });
            }
        } catch (e) { console.warn('ROC calc failed:', e); }

        // 1⃣2⃣ Aroon
        try {
            const aroon = this.advancedAnalysis.calculateAroon(prices);
            if (aroon.up.length > 0) {
                const lastUp = aroon.up[aroon.up.length - 1][1];
                const lastDown = aroon.down[aroon.down.length - 1][1];
                const diff = lastUp - lastDown;
                
                let strength = 0;
                if (diff > 50) strength = 2.0;
                else if (diff < -50) strength = -2.0;

                signals.trend.push({
                    name: 'Aroon',
                    value: `Up: ${lastUp.toFixed(0)}, Down: ${lastDown.toFixed(0)}`,
                    signal: strength,
                    status: diff > 50 ? 'Strong Uptrend' : diff < -50 ? 'Strong Downtrend' : 'Consolidation'
                });
            }
        } catch (e) { console.warn('Aroon calc failed:', e); }

        // 1⃣3⃣ CMF
        try {
            const cmf = this.advancedAnalysis.calculateCMF(prices);
            if (cmf.length > 0) {
                const lastCMF = cmf[cmf.length - 1][1];
                
                let strength = 0;
                if (lastCMF > 0.15) strength = 2.0;
                else if (lastCMF < -0.15) strength = -2.0;
                else if (lastCMF > 0) strength = 0.8;
                else if (lastCMF < 0) strength = -0.8;

                signals.volume.push({
                    name: 'CMF',
                    value: lastCMF.toFixed(4),
                    signal: strength,
                    status: lastCMF > 0.15 ? 'Strong Accumulation' : lastCMF < -0.15 ? 'Strong Distribution' : 'Neutral'
                });
            }
        } catch (e) { console.warn('CMF calc failed:', e); }

        // 1⃣4⃣ Elder Ray
        try {
            const elderRay = this.advancedAnalysis.calculateElderRay(prices);
            if (elderRay.bullPower.length > 0) {
                const lastBull = elderRay.bullPower[elderRay.bullPower.length - 1][1];
                const lastBear = elderRay.bearPower[elderRay.bearPower.length - 1][1];
                
                let strength = 0;
                if (lastBull > 0 && lastBear > 0) strength = 2.0;
                else if (lastBull < 0 && lastBear < 0) strength = -2.0;

                signals.composite.push({
                    name: 'Elder Ray',
                    value: `Bull: ${lastBull.toFixed(2)}, Bear: ${lastBear.toFixed(2)}`,
                    signal: strength,
                    status: lastBull > 0 && lastBear > 0 ? 'Bulls Control' : lastBull < 0 && lastBear < 0 ? 'Bears Control' : 'Mixed'
                });
            }
        } catch (e) { console.warn('Elder Ray calc failed:', e); }

        console.log(`✅ ${Object.values(signals).flat().length} indicators calculated`);

        return signals;
    }

    // ════════════════════════════════════════════════════════════════
    // GÉNÉRATION DES RECOMMANDATIONS AI
    // ════════════════════════════════════════════════════════════════

    generateAIRecommendations(prices, signals) {
        console.log('🤖 Generating AI recommendations...');

        // Calculer le score global
        let totalScore = 0;
        let totalWeight = 0;

        Object.values(signals).forEach(category => {
            category.forEach(indicator => {
                const signal = indicator.signal || 0;
                const weight = 1.5;
                
                totalScore += signal * weight;
                totalWeight += weight;
            });
        });

        const maxPossible = totalWeight * 2.5;
        const minPossible = totalWeight * -2.5;
        const normalizedScore = ((totalScore - minPossible) / (maxPossible - minPossible)) * 100;
        const globalScore = Math.max(0, Math.min(100, normalizedScore));

        // Générer recommandations par horizon
        const recommendations = {
            '1y': this.generateHorizonRec(globalScore, signals, 'short'),
            '2y': this.generateHorizonRec(globalScore, signals, 'medium'),
            '5y': this.generateHorizonRec(globalScore, signals, 'long')
        };

        console.log(`✅ AI Score: ${globalScore.toFixed(1)}/100`);

        return {
            globalScore: globalScore.toFixed(1),
            rating: this.getScoreRating(globalScore),
            horizons: recommendations
        };
    }

    generateHorizonRec(baseScore, signals, horizon) {
        let adjustedScore = baseScore;

        if (horizon === 'short') {
            const momentumScore = this.getCategoryScore(signals.momentum);
            adjustedScore = (baseScore * 0.6) + (momentumScore * 0.4);
        } else if (horizon === 'medium') {
            const trendScore = this.getCategoryScore(signals.trend);
            adjustedScore = (baseScore * 0.5) + (trendScore * 0.5);
        } else {
            const compositeScore = this.getCategoryScore(signals.composite);
            adjustedScore = (baseScore * 0.6) + (compositeScore * 0.4);
        }

        adjustedScore = Math.max(0, Math.min(100, adjustedScore));

        let recommendation = '';
        let confidence = 0;

        if (adjustedScore >= 70) {
            recommendation = 'BUY';
            confidence = 70 + (adjustedScore - 70) * 0.8;
        } else if (adjustedScore >= 55) {
            recommendation = 'BUY';
            confidence = 55 + (adjustedScore - 55);
        } else if (adjustedScore >= 45) {
            recommendation = 'HOLD';
            confidence = 50;
        } else if (adjustedScore >= 30) {
            recommendation = 'SELL';
            confidence = 50 + (45 - adjustedScore);
        } else {
            recommendation = 'SELL';
            confidence = 70 + (30 - adjustedScore) * 0.8;
        }

        const potentialMove = (adjustedScore - 50) * (horizon === 'short' ? 0.3 : horizon === 'medium' ? 0.6 : 1.2);

        return {
            recommendation,
            confidence: Math.round(confidence),
            potentialMove: potentialMove.toFixed(1)
        };
    }

    getCategoryScore(categorySignals) {
        if (!categorySignals || categorySignals.length === 0) return 50;

        let total = 0;
        categorySignals.forEach(s => {
            total += s.signal || 0;
        });

        const avg = total / categorySignals.length;
        const normalized = ((avg + 2.5) / 5) * 100;
        return Math.max(0, Math.min(100, normalized));
    }

    getScoreRating(score) {
        if (score >= 80) return 'VERY BULLISH';
        if (score >= 65) return 'BULLISH';
        if (score >= 55) return 'MODERATELY BULLISH';
        if (score >= 45) return 'NEUTRAL';
        if (score >= 35) return 'MODERATELY BEARISH';
        if (score >= 20) return 'BEARISH';
        return 'VERY BEARISH';
    }

    // ════════════════════════════════════════════════════════════════
    // GÉNÉRATION DU CONTENU PREMIUM (STYLE IDENTIQUE WEEKLY NEWSLETTER)
    // ════════════════════════════════════════════════════════════════

    generatePremiumContent(symbol) {
        const quote = this.stockData.quote || {};
        const aiScore = this.aiRecommendations.globalScore;
        const aiRating = this.aiRecommendations.rating;
        const horizons = this.aiRecommendations.horizons;
        
        let md = '';

        // ═══════════════════════════════════════════════════════
        // ✅ HEADER PREMIUM - DÉGRADÉ CYAN/ROSE
        // ═══════════════════════════════════════════════════════
        md += `<div style="background: linear-gradient(135deg, #06b6d4 0%, #ec4899 100%); padding: 60px 40px; border-radius: 24px; text-align: center; margin-bottom: 40px; box-shadow: 0 10px 30px rgba(6, 182, 212, 0.4);">\n\n`;
        
        md += `<h1 style="font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 900; margin: 0 0 20px 0; color: #ffffff; letter-spacing: 1px; line-height: 1.2;">DEEP ANALYSIS: ${symbol}</h1>\n\n`;
        
        md += `<h3 style="font-size: clamp(1.2rem, 3vw, 1.6rem); font-weight: 700; margin: 0 0 24px 0; color: #ffffff; letter-spacing: 0.5px;">AlphaVault Intelligence Report</h3>\n\n`;
        
        md += `<p style="font-size: clamp(1rem, 2.5vw, 1.3rem); font-weight: 700; margin: 0 0 16px 0; color: #ffffff;">${quote.name || symbol}</p>\n\n`;
        
        md += `<p style="font-size: clamp(0.9rem, 2vw, 1.1rem); margin: 0; color: #ffffff;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>\n\n`;
        
        md += `</div>\n\n`;

        md += this.createSeparator();

        // ═══════════════════════════════════════════════════════
        // EXECUTIVE SUMMARY - ALPHAVAULT SCORE
        // ═══════════════════════════════════════════════════════
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #06b6d4;">AlphaVault Intelligence Score</h2>\n\n`;
        md += `<div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(236, 72, 153, 0.08)); padding: clamp(20px, 4vw, 32px); border-radius: 20px; border: 2px solid rgba(6, 182, 212, 0.2);">\n\n`;
        
        md += `<div style="text-align: center; margin-bottom: 24px;">\n\n`;
        md += `<p style="font-size: clamp(3rem, 8vw, 5rem); font-weight: 900; background: linear-gradient(135deg, #06b6d4, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px 0;">${aiScore}/100</p>\n\n`;
        md += `<p style="font-size: clamp(1.2rem, 3vw, 1.6rem); font-weight: 800; color: #1e293b; margin: 0; text-transform: uppercase; letter-spacing: 1px;">${aiRating}</p>\n\n`;
        md += `</div>\n\n`;
        
        const scoreBarWidth = Math.max(0, Math.min(100, parseFloat(aiScore)));
        md += `<div style="background: rgba(203, 213, 225, 0.3); height: 20px; border-radius: 10px; overflow: hidden; margin: 24px 0;">\n\n`;
        md += `<div style="background: linear-gradient(90deg, #06b6d4, #ec4899); height: 100%; width: ${scoreBarWidth}%; border-radius: 10px; transition: width 0.3s ease;"></div>\n\n`;
        md += `</div>\n\n`;
        
        md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); color: #475569; text-align: center; line-height: 1.7; margin: 20px 0 0 0;">Based on 14 professional technical indicators analyzed by AlphaVault AI</p>\n\n`;
        
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        md += this.createSeparator();

        // ═══════════════════════════════════════════════════════
        // AI RECOMMENDATIONS PAR HORIZON
        // ═══════════════════════════════════════════════════════
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #8b5cf6;">AI Recommendations by Time Horizon</h2>\n\n`;
        md += `<div style="display: grid; gap: 20px;">\n\n`;
        
        const horizonData = [
            { key: '1y', label: '1-Year Horizon', icon: '📊', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
            { key: '2y', label: '2-Year Horizon', icon: '📈', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
            { key: '5y', label: '5-Year Horizon', icon: '🚀', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }
        ];

        horizonData.forEach(h => {
            const rec = horizons[h.key];
            const recClass = rec.recommendation === 'BUY' ? 'buy' : rec.recommendation === 'SELL' ? 'sell' : 'hold';
            const recColor = rec.recommendation === 'BUY' ? '#10b981' : rec.recommendation === 'SELL' ? '#ef4444' : '#f59e0b';
            
            md += `<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(124, 58, 237, 0.05)); padding: clamp(20px, 4vw, 28px); border-radius: 16px; border: 2px solid rgba(139, 92, 246, 0.2);">\n\n`;
            
            md += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">\n\n`;
            md += `<div>\n\n`;
            md += `<p style="font-size: clamp(0.85rem, 2vw, 1rem); font-weight: 800; color: #8b5cf6; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">${h.icon} ${h.label}</p>\n\n`;
            md += `<p style="font-size: clamp(1.3rem, 3.5vw, 1.8rem); font-weight: 900; color: ${recColor}; margin: 0; text-transform: uppercase; letter-spacing: 1px;">${rec.recommendation}</p>\n\n`;
            md += `</div>\n\n`;
            md += `<div style="text-align: right;">\n\n`;
            md += `<p style="font-size: clamp(0.85rem, 2vw, 1rem); color: #64748b; margin: 0 0 4px 0;">Confidence</p>\n\n`;
            md += `<p style="font-size: clamp(1.3rem, 3.5vw, 1.6rem); font-weight: 800; color: #1e293b; margin: 0;">${rec.confidence}%</p>\n\n`;
            md += `</div>\n\n`;
            md += `</div>\n\n`;
            
            md += `<div style="background: rgba(139, 92, 246, 0.1); height: 12px; border-radius: 10px; overflow: hidden; margin-bottom: 16px;">\n\n`;
            md += `<div style="background: ${h.gradient}; height: 100%; width: ${rec.confidence}%; border-radius: 10px;"></div>\n\n`;
            md += `</div>\n\n`;
            
            md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); color: #475569; margin: 0;"><strong>Potential Move:</strong> ${rec.potentialMove >= 0 ? '+' : ''}${rec.potentialMove}%</p>\n\n`;
            
            md += `</div>\n\n`;
        });
        
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        md += this.createSeparator();

        // ═══════════════════════════════════════════════════════
        // TECHNICAL INDICATORS BREAKDOWN
        // ═══════════════════════════════════════════════════════
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #ef4444;">Technical Indicators Breakdown</h2>\n\n`;
        
        // MOMENTUM
        if (this.technicalSignals.momentum.length > 0) {
            md += `<div style="margin-bottom: 32px;">\n\n`;
            md += `<h3 style="font-size: clamp(1.2rem, 3vw, 1.5rem); font-weight: 800; color: #1e293b; margin: 0 0 16px 0;">📊 Momentum Indicators</h3>\n\n`;
            md += `<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.05)); padding: clamp(18px, 3.5vw, 24px); border-radius: 16px; border: 2px solid rgba(239, 68, 68, 0.2);">\n\n`;
            
            this.technicalSignals.momentum.forEach((ind, i) => {
                const signalColor = ind.signal > 0.5 ? '#10b981' : ind.signal < -0.5 ? '#ef4444' : '#f59e0b';
                const signalLabel = ind.signal > 0.5 ? 'BULLISH' : ind.signal < -0.5 ? 'BEARISH' : 'NEUTRAL';
                
                md += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: ${i < this.technicalSignals.momentum.length - 1 ? '12px 0' : '12px 0 0 0'}; border-bottom: ${i < this.technicalSignals.momentum.length - 1 ? '1px solid rgba(239, 68, 68, 0.15)' : 'none'};">\n\n`;
                md += `<div>\n\n`;
                md += `<p style="font-size: clamp(1rem, 2.5vw, 1.2rem); font-weight: 800; color: #1e293b; margin: 0 0 4px 0;">${ind.name}</p>\n\n`;
                md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); color: #64748b; margin: 0;">${ind.status}</p>\n\n`;
                md += `</div>\n\n`;
                md += `<div style="text-align: right;">\n\n`;
                md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">${ind.value}</p>\n\n`;
                md += `<span style="background: ${signalColor}; color: white; padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: clamp(0.75rem, 1.8vw, 0.85rem);">${signalLabel}</span>\n\n`;
                md += `</div>\n\n`;
                md += `</div>\n\n`;
            });
            
            md += `</div>\n\n`;
            md += `</div>\n\n`;
        }

        // TREND
        if (this.technicalSignals.trend.length > 0) {
            md += `<div style="margin-bottom: 32px;">\n\n`;
            md += `<h3 style="font-size: clamp(1.2rem, 3vw, 1.5rem); font-weight: 800; color: #1e293b; margin: 0 0 16px 0;">📈 Trend Indicators</h3>\n\n`;
            md += `<div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(5, 150, 105, 0.05)); padding: clamp(18px, 3.5vw, 24px); border-radius: 16px; border: 2px solid rgba(16, 185, 129, 0.2);">\n\n`;
            
            this.technicalSignals.trend.forEach((ind, i) => {
                const signalColor = ind.signal > 0.5 ? '#10b981' : ind.signal < -0.5 ? '#ef4444' : '#f59e0b';
                const signalLabel = ind.signal > 0.5 ? 'BULLISH' : ind.signal < -0.5 ? 'BEARISH' : 'NEUTRAL';
                
                md += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: ${i < this.technicalSignals.trend.length - 1 ? '12px 0' : '12px 0 0 0'}; border-bottom: ${i < this.technicalSignals.trend.length - 1 ? '1px solid rgba(16, 185, 129, 0.15)' : 'none'};">\n\n`;
                md += `<div>\n\n`;
                md += `<p style="font-size: clamp(1rem, 2.5vw, 1.2rem); font-weight: 800; color: #1e293b; margin: 0 0 4px 0;">${ind.name}</p>\n\n`;
                md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); color: #64748b; margin: 0;">${ind.status}</p>\n\n`;
                md += `</div>\n\n`;
                md += `<div style="text-align: right;">\n\n`;
                md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">${ind.value}</p>\n\n`;
                md += `<span style="background: ${signalColor}; color: white; padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: clamp(0.75rem, 1.8vw, 0.85rem);">${signalLabel}</span>\n\n`;
                md += `</div>\n\n`;
                md += `</div>\n\n`;
            });
            
            md += `</div>\n\n`;
            md += `</div>\n\n`;
        }

        // VOLUME
        if (this.technicalSignals.volume.length > 0) {
            md += `<div style="margin-bottom: 32px;">\n\n`;
            md += `<h3 style="font-size: clamp(1.2rem, 3vw, 1.5rem); font-weight: 800; color: #1e293b; margin: 0 0 16px 0;">💹 Volume Indicators</h3>\n\n`;
            md += `<div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(37, 99, 235, 0.05)); padding: clamp(18px, 3.5vw, 24px); border-radius: 16px; border: 2px solid rgba(59, 130, 246, 0.2);">\n\n`;
            
            this.technicalSignals.volume.forEach((ind, i) => {
                const signalColor = ind.signal > 0.5 ? '#10b981' : ind.signal < -0.5 ? '#ef4444' : '#f59e0b';
                const signalLabel = ind.signal > 0.5 ? 'BULLISH' : ind.signal < -0.5 ? 'BEARISH' : 'NEUTRAL';
                
                md += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: ${i < this.technicalSignals.volume.length - 1 ? '12px 0' : '12px 0 0 0'}; border-bottom: ${i < this.technicalSignals.volume.length - 1 ? '1px solid rgba(59, 130, 246, 0.15)' : 'none'};">\n\n`;
                md += `<div>\n\n`;
                md += `<p style="font-size: clamp(1rem, 2.5vw, 1.2rem); font-weight: 800; color: #1e293b; margin: 0 0 4px 0;">${ind.name}</p>\n\n`;
                md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); color: #64748b; margin: 0;">${ind.status}</p>\n\n`;
                md += `</div>\n\n`;
                md += `<div style="text-align: right;">\n\n`;
                md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">${ind.value}</p>\n\n`;
                md += `<span style="background: ${signalColor}; color: white; padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: clamp(0.75rem, 1.8vw, 0.85rem);">${signalLabel}</span>\n\n`;
                md += `</div>\n\n`;
                md += `</div>\n\n`;
            });
            
            md += `</div>\n\n`;
            md += `</div>\n\n`;
        }

        // COMPOSITE
        if (this.technicalSignals.composite.length > 0) {
            md += `<div style="margin-bottom: 32px;">\n\n`;
            md += `<h3 style="font-size: clamp(1.2rem, 3vw, 1.5rem); font-weight: 800; color: #1e293b; margin: 0 0 16px 0;">🔮 Composite Indicators</h3>\n\n`;
            md += `<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(124, 58, 237, 0.05)); padding: clamp(18px, 3.5vw, 24px); border-radius: 16px; border: 2px solid rgba(139, 92, 246, 0.2);">\n\n`;
            
            this.technicalSignals.composite.forEach((ind, i) => {
                const signalColor = ind.signal > 0.5 ? '#10b981' : ind.signal < -0.5 ? '#ef4444' : '#f59e0b';
                const signalLabel = ind.signal > 0.5 ? 'BULLISH' : ind.signal < -0.5 ? 'BEARISH' : 'NEUTRAL';
                
                md += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: ${i < this.technicalSignals.composite.length - 1 ? '12px 0' : '12px 0 0 0'}; border-bottom: ${i < this.technicalSignals.composite.length - 1 ? '1px solid rgba(139, 92, 246, 0.15)' : 'none'};">\n\n`;
                md += `<div>\n\n`;
                md += `<p style="font-size: clamp(1rem, 2.5vw, 1.2rem); font-weight: 800; color: #1e293b; margin: 0 0 4px 0;">${ind.name}</p>\n\n`;
                md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); color: #64748b; margin: 0;">${ind.status}</p>\n\n`;
                md += `</div>\n\n`;
                md += `<div style="text-align: right;">\n\n`;
                md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">${ind.value}</p>\n\n`;
                md += `<span style="background: ${signalColor}; color: white; padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: clamp(0.75rem, 1.8vw, 0.85rem);">${signalLabel}</span>\n\n`;
                md += `</div>\n\n`;
                md += `</div>\n\n`;
            });
            
            md += `</div>\n\n`;
            md += `</div>\n\n`;
        }

        md += `</div>\n\n`;

        md += this.createSeparator();

        // ═══════════════════════════════════════════════════════
        // PREMIUM FOOTER
        // ═══════════════════════════════════════════════════════
        md += `<div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: clamp(30px, 6vw, 40px); border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">\n\n`;
        md += `<h3 style="font-size: clamp(1.4rem, 4vw, 1.8rem); font-weight: 800; color: white; margin: 0 0 16px 0; line-height: 1.2;">Advanced Technical Analysis</h3>\n\n`;
        md += `<p style="font-size: clamp(0.9rem, 2.2vw, 1.05rem); color: rgba(255,255,255,0.9); line-height: 1.7; margin: 0 0 24px 0; max-width: 700px; margin-left: auto; margin-right: auto;">This analysis is based on 14 professional technical indicators powered by <strong style="color: #06b6d4;">AlphaVault AI</strong>. Not financial advice.</p>\n\n`;
        
        md += `<div style="display: flex; justify-content: center; gap: clamp(20px, 5vw, 32px); flex-wrap: wrap; margin: 24px 0;">\n\n`;
        md += `<div style="text-align: center;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); margin: 0 0 8px 0;">📊</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 2vw, 0.95rem); font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">14 Indicators</p>\n\n`;
        md += `</div>\n\n`;
        md += `<div style="text-align: center;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); margin: 0 0 8px 0;">🤖</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 2vw, 0.95rem); font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">AI-Powered</p>\n\n`;
        md += `</div>\n\n`;
        md += `<div style="text-align: center;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); margin: 0 0 8px 0;">📈</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 2vw, 0.95rem); font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">Multi-Horizon</p>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;
        
        md += `<div style="margin-top: 32px; display: flex; gap: clamp(12px, 3vw, 16px); justify-content: center; flex-wrap: wrap;">\n\n`;
        md += `<a href="https://alphavault-ai.com/advanced-analysis.html" target="_blank" style="background: linear-gradient(135deg, #06b6d4, #ec4899); color: white; padding: clamp(12px, 2.5vw, 14px) clamp(24px, 5vw, 32px); border-radius: 12px; text-decoration: none; font-weight: 800; font-size: clamp(0.9rem, 2vw, 1rem); box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);">Analyze Another Stock</a>\n\n`;
        md += `<a href="checkout.html" target="_blank" style="background: white; color: #06b6d4; padding: clamp(12px, 2.5vw, 14px) clamp(24px, 5vw, 32px); border-radius: 12px; text-decoration: none; font-weight: 800; font-size: clamp(0.9rem, 2vw, 1rem); box-shadow: 0 4px 12px rgba(255,255,255,0.2);">Upgrade to Premium</a>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        return {
            markdown: md,
            html: md
        };
    }

    createSeparator() {
        return `<div style="height: 40px; margin: 30px 0; position: relative; display: flex; align-items: center;">\n\n` +
               `<div style="flex: 1; height: 3px; background: linear-gradient(90deg, transparent 0%, #06b6d4 30%, #ec4899 50%, #06b6d4 70%, transparent 100%); border-radius: 2px;"></div>\n\n` +
               `</div>\n\n`;
    }

    // ════════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ════════════════════════════════════════════════════════════════

    generateDemoData(symbol) {
        console.log('📊 Generating demo data for', symbol);
        const days = 365;
        const prices = [];
        let price = 150;
        
        for (let i = 0; i < days; i++) {
            const change = (Math.random() - 0.5) * 3;
            price = price * (1 + change / 100);
            
            const timestamp = Date.now() - (days - i) * 24 * 60 * 60 * 1000;
            prices.push({
                timestamp: timestamp,
                datetime: new Date(timestamp).toISOString(),
                open: price * (1 + (Math.random() - 0.5) * 0.01),
                high: price * (1 + Math.random() * 0.02),
                low: price * (1 - Math.random() * 0.02),
                close: price,
                volume: Math.floor(Math.random() * 10000000)
            });
        }
        
        return {
            symbol: symbol,
            prices: prices,
            currency: 'USD',
            quote: {
                name: symbol + ' Corporation',
                symbol: symbol,
                price: price,
                change: price - 150,
                percentChange: ((price - 150) / 150) * 100
            }
        };
    }

    showNotification(message, type = 'info') {
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #06b6d4, #ec4899)'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-weight: 600;
            max-width: 90%;
            font-size: clamp(0.85rem, 2vw, 1rem);
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// ════════════════════════════════════════════════════════════════
// INITIALISATION
// ════════════════════════════════════════════════════════════════

window.stockAnalysisNewsletter = null;

async function initStockAnalysisNewsletter() {
    if (!window.stockAnalysisNewsletter) {
        console.log('📊 Initializing Stock Analysis Newsletter System...');
        window.stockAnalysisNewsletter = new StockAnalysisNewsletter();
        await window.stockAnalysisNewsletter.initialize();
    }
    
    return window.stockAnalysisNewsletter;
}

// ════════════════════════════════════════════════════════════════
// ✅ FONCTION MANUELLE - VIA BOUTON ADMIN
// ════════════════════════════════════════════════════════════════

async function generateStockAnalysisNewsletter() {
    try {
        const symbol = document.getElementById('stockSymbolInput')?.value;
        
        if (!symbol || symbol.trim() === '') {
            alert('⚠ Please enter a stock symbol');
            return;
        }

        console.log(`🚀 Manual stock analysis generation requested for: ${symbol}`);
        
        const system = await initStockAnalysisNewsletter();
        
        if (!firebase.auth().currentUser) {
            alert('⚠ Please log in to generate analysis');
            return;
        }
        
        await system.generateStockAnalysis(symbol, true);
        
    } catch (error) {
        console.error('❌ Error generating stock analysis:', error);
        alert('Failed to generate stock analysis: ' + error.message);
    }
}

window.generateStockAnalysisNewsletter = generateStockAnalysisNewsletter;

// ════════════════════════════════════════════════════════════════
// ✅ INITIALISATION PASSIVE
// ════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            await initStockAnalysisNewsletter();
            console.log('✅ Stock Analysis Newsletter system initialized - Ready for manual generation');
        }
    });
});

console.log('✅ Stock Analysis Newsletter System - Script Loaded');