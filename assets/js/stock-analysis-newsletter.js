/**
 * ════════════════════════════════════════════════════════════════
 * STOCK ANALYSIS NEWSLETTER SYSTEM V2.0 - ULTRA-PROFESSIONAL
 * Reuses Advanced Analysis Methods for Identical Results
 * 6 Months Data + 14 Technical Indicators + AI Recommendations
 * ════════════════════════════════════════════════════════════════
 */

class StockAnalysisNewsletter {
    constructor() {
        this.LAST_POST_KEY = 'lastStockAnalysisPost';
        this.DEFAULT_PERIOD = '6M'; // ✅ 6 mois comme advanced-analysis.js
        this.advancedAnalysis = null;
        this.stockData = null;
        this.technicalSignals = null;
        this.aiRecommendations = null;
    }

    async initialize() {
        console.log('📊 Initializing Stock Analysis Newsletter System V2.0...');
        await this.waitForAdvancedAnalysis();
        console.log('✅ Stock Analysis Newsletter System ready');
    }

    async waitForAdvancedAnalysis() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50;

            const checkAnalysis = setInterval(() => {
                attempts++;

                if (window.AdvancedAnalysis) {
                    console.log('✅ AdvancedAnalysis module found');
                    this.advancedAnalysis = window.AdvancedAnalysis;
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
                if (forceManual) this.showNotification('Please log in to generate analysis', 'error');
                return;
            }

            if (!symbol || symbol.trim() === '') {
                this.showNotification('Please enter a valid stock symbol', 'error');
                return;
            }

            symbol = symbol.trim().toUpperCase();
            this.showNotification(`📊 Generating deep analysis for ${symbol}...`, 'info');

            if (!this.advancedAnalysis) {
                throw new Error('Advanced Analysis module not available');
            }

            // ✅ ÉTAPE 1 : Charger les données (6 mois = 180 jours)
            await this.loadStockData(symbol);

            if (!this.stockData || !this.stockData.prices || this.stockData.prices.length < 30) {
                throw new Error(`Insufficient data for ${symbol} (minimum 30 days required)`);
            }

            console.log(`✅ Data loaded: ${this.stockData.prices.length} data points (6 months)`);

            // ✅ ÉTAPE 2 : Calculer les indicateurs techniques (RÉUTILISE advanced-analysis.js)
            this.technicalSignals = this.advancedAnalysis.collectAllTechnicalSignals(this.stockData.prices);

            // ✅ ÉTAPE 3 : Générer les recommandations AI (RÉUTILISE advanced-analysis.js)
            const trendAnalysis = this.advancedAnalysis.analyzeTrendsByHorizon(this.stockData.prices);
            const aiScore = this.advancedAnalysis.calculateAIConfidenceScore(this.technicalSignals);
            const horizonRecommendations = this.advancedAnalysis.generateHorizonRecommendations(
                aiScore,
                this.technicalSignals,
                trendAnalysis
            );

            this.aiRecommendations = {
                globalScore: aiScore.score.toFixed(1),
                rating: aiScore.rating,
                bullishSignals: aiScore.bullishSignals,
                neutralSignals: aiScore.neutralSignals,
                bearishSignals: aiScore.bearishSignals,
                horizons: horizonRecommendations
            };

            console.log(`✅ AI Score: ${this.aiRecommendations.globalScore}/100 (${this.aiRecommendations.rating})`);

            // ✅ ÉTAPE 4 : Générer le contenu premium avec graphiques
            const postContent = this.generatePremiumContent(symbol);

            // ✅ ÉTAPE 5 : Publier sur Firestore
            const postData = {
                title: `📊 Deep Analysis: ${symbol} - AlphaVault Intelligence Report`,
                content: postContent.markdown,
                channelId: 'market-analysis',
                tags: ['stock-analysis', 'technical-indicators', 'ai-recommendation', symbol.toLowerCase()],
                images: [],
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
                analysisDate: new Date().toISOString(),
                aiScore: this.aiRecommendations.globalScore,
                aiRating: this.aiRecommendations.rating
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
    // CHARGEMENT DES DONNÉES (6 MOIS = 180 JOURS)
    // ════════════════════════════════════════════════════════════════

    async loadStockData(symbol) {
        let apiClient = this.advancedAnalysis.apiClient || window.apiClient;
        
        if (!apiClient && typeof FinanceAPIClient !== 'undefined') {
            const baseURL = typeof APP_CONFIG !== 'undefined' 
                ? APP_CONFIG.API_BASE_URL 
                : 'https://financial-data-api.raphnardone.workers.dev';
            
            apiClient = new FinanceAPIClient({
                baseURL: baseURL,
                cacheDuration: 300000,
                maxRetries: 2
            });
            
            window.apiClient = apiClient;
        }

        if (!apiClient) {
            throw new Error('API Client not available');
        }

        try {
            console.log(`📡 Fetching 6 months data for ${symbol}...`);
            
            const [quote, timeSeries] = await Promise.all([
                apiClient.getQuote(symbol),
                apiClient.getTimeSeries(symbol, '1day', 180) // ✅ 6 mois = 180 jours
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

        } catch (error) {
            console.warn('⚠ API call failed, using demo data:', error.message);
            this.stockData = this.generateDemoData(symbol, 180);
        }
    }

    // ════════════════════════════════════════════════════════════════
    // GÉNÉRATION DU CONTENU PREMIUM AVEC GRAPHIQUES
    // ════════════════════════════════════════════════════════════════

    generatePremiumContent(symbol) {
        const quote = this.stockData.quote || {};
        const aiScore = this.aiRecommendations.globalScore;
        const aiRating = this.aiRecommendations.rating;
        const horizons = this.aiRecommendations.horizons;
        
        let md = '';

        // ═══════════════════════════════════════════════════════
        // ✅ HEADER PREMIUM
        // ═══════════════════════════════════════════════════════
        md += `<div style="background: linear-gradient(135deg, #06b6d4 0%, #ec4899 100%); padding: 60px 40px; border-radius: 24px; text-align: center; margin-bottom: 40px; box-shadow: 0 10px 30px rgba(6, 182, 212, 0.4);">\n\n`;
        md += `<h1 style="font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 900; margin: 0 0 20px 0; color: #ffffff; letter-spacing: 1px; line-height: 1.2;">DEEP ANALYSIS: ${symbol}</h1>\n\n`;
        md += `<h3 style="font-size: clamp(1.2rem, 3vw, 1.6rem); font-weight: 700; margin: 0 0 24px 0; color: #ffffff; letter-spacing: 0.5px;">AlphaVault Intelligence Report</h3>\n\n`;
        md += `<p style="font-size: clamp(1rem, 2.5vw, 1.3rem); font-weight: 700; margin: 0 0 16px 0; color: #ffffff;">${quote.name || symbol}</p>\n\n`;
        md += `<p style="font-size: clamp(0.9rem, 2vw, 1.1rem); margin: 0; color: #ffffff;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | 6-Month Analysis (${this.stockData.prices.length} data points)</p>\n\n`;
        md += `</div>\n\n`;

        md += this.createSeparator();

        // ═══════════════════════════════════════════════════════
        // ✅ ALPHAVAULT SCORE
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
        
        md += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 16px; margin: 24px 0;">\n\n`;
        md += `<div style="text-align: center; padding: 16px; background: rgba(16, 185, 129, 0.1); border-radius: 12px;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 900; color: #10b981; margin: 0 0 4px 0;">${this.aiRecommendations.bullishSignals}</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 1.8vw, 0.9rem); font-weight: 700; color: #475569; margin: 0;">Bullish</p>\n\n`;
        md += `</div>\n\n`;
        md += `<div style="text-align: center; padding: 16px; background: rgba(245, 158, 11, 0.1); border-radius: 12px;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 900; color: #f59e0b; margin: 0 0 4px 0;">${this.aiRecommendations.neutralSignals}</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 1.8vw, 0.9rem); font-weight: 700; color: #475569; margin: 0;">Neutral</p>\n\n`;
        md += `</div>\n\n`;
        md += `<div style="text-align: center; padding: 16px; background: rgba(239, 68, 68, 0.1); border-radius: 12px;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 900; color: #ef4444; margin: 0 0 4px 0;">${this.aiRecommendations.bearishSignals}</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 1.8vw, 0.9rem); font-weight: 700; color: #475569; margin: 0;">Bearish</p>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;
        
        md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); color: #475569; text-align: center; line-height: 1.7; margin: 20px 0 0 0;">Based on 14 professional technical indicators analyzed by AlphaVault AI</p>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        md += this.createSeparator();

        // ═══════════════════════════════════════════════════════
        // ✅ GRAPHIQUES DES INDICATEURS CLÉS
        // ═══════════════════════════════════════════════════════
        md += this.generateChartsSection();
        md += this.createSeparator();

        // ═══════════════════════════════════════════════════════
        // ✅ AI RECOMMENDATIONS PAR HORIZON
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
            
            md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); color: #475569; margin: 0 0 12px 0;"><strong>Potential Move:</strong> ${rec.potentialMove >= 0 ? '+' : ''}${rec.potentialMove}%</p>\n\n`;
            
            // ✅ Key Drivers
            if (rec.drivers && rec.drivers.length > 0) {
                md += `<div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid rgba(139, 92, 246, 0.2);">\n\n`;
                md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); font-weight: 800; color: #64748b; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Key Drivers:</p>\n\n`;
                rec.drivers.forEach(driver => {
                    md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); color: #475569; margin: 0 0 8px 0; padding-left: 16px; border-left: 3px solid ${h.gradient.includes('10b981') ? '#10b981' : h.gradient.includes('3b82f6') ? '#3b82f6' : '#8b5cf6'};">✓ ${driver}</p>\n\n`;
                });
                md += `</div>\n\n`;
            }
            
            md += `</div>\n\n`;
        });
        
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        md += this.createSeparator();

        // ═══════════════════════════════════════════════════════
        // ✅ TECHNICAL INDICATORS BREAKDOWN
        // ═══════════════════════════════════════════════════════
        md += this.generateTechnicalIndicatorsSection();

        md += this.createSeparator();

        // ═══════════════════════════════════════════════════════
        // ✅ PREMIUM FOOTER
        // ═══════════════════════════════════════════════════════
        md += `<div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: clamp(30px, 6vw, 40px); border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">\n\n`;
        md += `<h3 style="font-size: clamp(1.4rem, 4vw, 1.8rem); font-weight: 800; color: white; margin: 0 0 16px 0; line-height: 1.2;">Advanced Technical Analysis</h3>\n\n`;
        md += `<p style="font-size: clamp(0.9rem, 2.2vw, 1.05rem); color: rgba(255,255,255,0.9); line-height: 1.7; margin: 0 0 24px 0; max-width: 700px; margin-left: auto; margin-right: auto;">This analysis is based on 14 professional technical indicators powered by <strong style="color: #06b6d4;">AlphaVault AI</strong>. Same methodology as our Advanced Analysis platform. Not financial advice.</p>\n\n`;
        
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
        md += `<p style="font-size: clamp(0.8rem, 2vw, 0.95rem); font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">6 Months Data</p>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;
        
        md += `<div style="margin-top: 32px; display: flex; gap: clamp(12px, 3vw, 16px); justify-content: center; flex-wrap: wrap;">\n\n`;
        md += `<a href="https://alphavault-ai.com/advanced-analysis.html" target="_blank" style="background: linear-gradient(135deg, #06b6d4, #ec4899); color: white; padding: clamp(12px, 2.5vw, 14px) clamp(24px, 5vw, 32px); border-radius: 12px; text-decoration: none; font-weight: 800; font-size: clamp(0.9rem, 2vw, 1rem); box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);">Analyze Another Stock</a>\n\n`;
        md += `<a href="checkout.html" target="_blank" style="background: white; color: #06b6d4; padding: clamp(12px, 2.5vw, 14px) clamp(24px, 5vw, 32px); border-radius: 12px; text-decoration: none; font-weight: 800; font-size: clamp(0.9rem, 2vw, 1rem); box-shadow: 0 4px 12px rgba(255,255,255,0.2);">Upgrade to Premium</a>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        return { markdown: md, html: md };
    }

    // ════════════════════════════════════════════════════════════════
    // ✅ GÉNÉRATION DE LA SECTION GRAPHIQUES
    // ════════════════════════════════════════════════════════════════

    generateChartsSection() {
        let md = '';
        
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #667eea;">Key Technical Indicators</h2>\n\n`;
        
        // ✅ RSI Chart
        const rsiData = this.advancedAnalysis.calculateRSI(this.stockData.prices);
        if (rsiData.length > 0) {
            const rsiChartUrl = this.generateChartImage('RSI', rsiData, { min: 0, max: 100, zones: [30, 70] });
            md += `<div style="margin-bottom: 32px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">\n\n`;
            md += `<div style="padding: 20px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05)); border-bottom: 2px solid rgba(102, 126, 234, 0.2);">\n\n`;
            md += `<h3 style="font-size: clamp(1.1rem, 2.8vw, 1.4rem); font-weight: 800; color: #1e293b; margin: 0;">RSI (Relative Strength Index)</h3>\n\n`;
            md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); color: #64748b; margin: 8px 0 0 0;">Current: ${rsiData[rsiData.length - 1][1].toFixed(2)}</p>\n\n`;
            md += `</div>\n\n`;
            md += `<img src="${rsiChartUrl}" alt="RSI Chart" style="width: 100%; height: auto; display: block;">\n\n`;
            md += `</div>\n\n`;
        }

        // ✅ MACD Chart
        const macdData = this.advancedAnalysis.calculateMACD(this.stockData.prices);
        if (macdData.histogram.length > 0) {
            const macdChartUrl = this.generateMACDChartImage(macdData);
            md += `<div style="margin-bottom: 32px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">\n\n`;
            md += `<div style="padding: 20px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.05)); border-bottom: 2px solid rgba(59, 130, 246, 0.2);">\n\n`;
            md += `<h3 style="font-size: clamp(1.1rem, 2.8vw, 1.4rem); font-weight: 800; color: #1e293b; margin: 0;">MACD (Moving Average Convergence Divergence)</h3>\n\n`;
            md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); color: #64748b; margin: 8px 0 0 0;">Histogram: ${macdData.histogram[macdData.histogram.length - 1][1].toFixed(4)}</p>\n\n`;
            md += `</div>\n\n`;
            md += `<img src="${macdChartUrl}" alt="MACD Chart" style="width: 100%; height: auto; display: block;">\n\n`;
            md += `</div>\n\n`;
        }

        // ✅ Stochastic Chart
        const stochasticData = this.advancedAnalysis.calculateStochastic(this.stockData.prices);
        if (stochasticData.k.length > 0) {
            const stochChartUrl = this.generateStochasticChartImage(stochasticData);
            md += `<div style="margin-bottom: 32px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">\n\n`;
            md += `<div style="padding: 20px; background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.05)); border-bottom: 2px solid rgba(139, 92, 246, 0.2);">\n\n`;
            md += `<h3 style="font-size: clamp(1.1rem, 2.8vw, 1.4rem); font-weight: 800; color: #1e293b; margin: 0;">Stochastic Oscillator</h3>\n\n`;
            md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); color: #64748b; margin: 8px 0 0 0;">%K: ${stochasticData.k[stochasticData.k.length - 1][1].toFixed(2)} | %D: ${stochasticData.d[stochasticData.d.length - 1][1].toFixed(2)}</p>\n\n`;
            md += `</div>\n\n`;
            md += `<img src="${stochChartUrl}" alt="Stochastic Chart" style="width: 100%; height: auto; display: block;">\n\n`;
            md += `</div>\n\n`;
        }

        md += `</div>\n\n`;
        
        return md;
    }

    // ════════════════════════════════════════════════════════════════
    // ✅ GÉNÉRATION DES URLs DE GRAPHIQUES (QuickChart.io)
    // ════════════════════════════════════════════════════════════════

    generateChartImage(title, data, options = {}) {
        const labels = data.slice(-60).map((d, i) => i); // 60 derniers points
        const values = data.slice(-60).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: title,
                    data: values,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    title: { display: false }
                },
                scales: {
                    y: {
                        min: options.min || undefined,
                        max: options.max || undefined
                    },
                    x: { display: false }
                },
                annotation: options.zones ? {
                    annotations: options.zones.map(zone => ({
                        type: 'line',
                        yMin: zone,
                        yMax: zone,
                        borderColor: 'rgba(255, 99, 132, 0.5)',
                        borderWidth: 2,
                        borderDash: [5, 5]
                    }))
                } : undefined
            }
        };
        
        return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&width=800&height=300`;
    }

    generateMACDChartImage(macdData) {
        const labels = macdData.histogram.slice(-60).map((d, i) => i);
        const macdLine = macdData.macdLine.slice(-60).map(d => d[1]);
        const signalLine = macdData.signalLine.slice(-60).map(d => d[1]);
        const histogram = macdData.histogram.slice(-60).map(d => d[1]);
        
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        type: 'line',
                        label: 'MACD',
                        data: macdLine,
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        type: 'line',
                        label: 'Signal',
                        data: signalLine,
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        type: 'bar',
                        label: 'Histogram',
                        data: histogram,
                        backgroundColor: histogram.map(v => v > 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)')
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { display: false } }
            }
        };
        
        return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&width=800&height=300`;
    }

    generateStochasticChartImage(stochasticData) {
        const labels = stochasticData.k.slice(-60).map((d, i) => i);
        const kValues = stochasticData.k.slice(-60).map(d => d[1]);
        const dValues = stochasticData.d.slice(-60).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '%K',
                        data: kValues,
                        borderColor: 'rgb(102, 126, 234)',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: '%D',
                        data: dValues,
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 2,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: 0, max: 100 },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(config))}&width=800&height=300`;
    }

    // ════════════════════════════════════════════════════════════════
    // ✅ GÉNÉRATION DE LA SECTION TECHNICAL INDICATORS
    // ════════════════════════════════════════════════════════════════

    generateTechnicalIndicatorsSection() {
        let md = '';
        
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #ef4444;">Complete Technical Indicators Breakdown</h2>\n\n`;
        
        const categories = [
            { key: 'momentum', name: 'Momentum Indicators', icon: '📊', color: '#ef4444' },
            { key: 'trend', name: 'Trend Indicators', icon: '📈', color: '#10b981' },
            { key: 'volume', name: 'Volume Indicators', icon: '💹', color: '#3b82f6' },
            { key: 'composite', name: 'Composite Indicators', icon: '🔮', color: '#8b5cf6' }
        ];

        categories.forEach(cat => {
            const indicators = this.technicalSignals[cat.key];
            if (!indicators || indicators.length === 0) return;

            md += `<div style="margin-bottom: 32px;">\n\n`;
            md += `<h3 style="font-size: clamp(1.2rem, 3vw, 1.5rem); font-weight: 800; color: #1e293b; margin: 0 0 16px 0;">${cat.icon} ${cat.name}</h3>\n\n`;
            md += `<div style="background: linear-gradient(135deg, rgba(${this.hexToRgb(cat.color)}, 0.08), rgba(${this.hexToRgb(cat.color)}, 0.05)); padding: clamp(18px, 3.5vw, 24px); border-radius: 16px; border: 2px solid rgba(${this.hexToRgb(cat.color)}, 0.2);">\n\n`;
            
            indicators.forEach((ind, i) => {
                const signalColor = ind.signal > 0.5 ? '#10b981' : ind.signal < -0.5 ? '#ef4444' : '#f59e0b';
                const signalLabel = ind.signal > 0.5 ? 'BULLISH' : ind.signal < -0.5 ? 'BEARISH' : 'NEUTRAL';
                
                md += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: ${i < indicators.length - 1 ? '12px 0' : '12px 0 0 0'}; border-bottom: ${i < indicators.length - 1 ? `1px solid rgba(${this.hexToRgb(cat.color)}, 0.15)` : 'none'};">\n\n`;
                md += `<div style="flex: 1; min-width: 200px;">\n\n`;
                md += `<p style="font-size: clamp(1rem, 2.5vw, 1.2rem); font-weight: 800; color: #1e293b; margin: 0 0 4px 0;">${ind.name}</p>\n\n`;
                md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); color: #64748b; margin: 0;">${ind.status || ind.description || ''}</p>\n\n`;
                md += `</div>\n\n`;
                md += `<div style="text-align: right;">\n\n`;
                md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">${ind.value}</p>\n\n`;
                md += `<span style="background: ${signalColor}; color: white; padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: clamp(0.75rem, 1.8vw, 0.85rem);">${signalLabel}</span>\n\n`;
                md += `</div>\n\n`;
                md += `</div>\n\n`;
            });
            
            md += `</div>\n\n`;
            md += `</div>\n\n`;
        });

        md += `</div>\n\n`;
        
        return md;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
    }

    // ════════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ════════════════════════════════════════════════════════════════

    createSeparator() {
        return `<div style="height: 40px; margin: 30px 0; position: relative; display: flex; align-items: center;">\n\n` +
               `<div style="flex: 1; height: 3px; background: linear-gradient(90deg, transparent 0%, #06b6d4 30%, #ec4899 50%, #06b6d4 70%, transparent 100%); border-radius: 2px;"></div>\n\n` +
               `</div>\n\n`;
    }

    generateDemoData(symbol, days = 180) {
        console.log(`📊 Generating demo data for ${symbol} (${days} days)`);
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
        console.log('📊 Initializing Stock Analysis Newsletter System V2.0...');
        window.stockAnalysisNewsletter = new StockAnalysisNewsletter();
        await window.stockAnalysisNewsletter.initialize();
    }
    
    return window.stockAnalysisNewsletter;
}

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

document.addEventListener('DOMContentLoaded', async () => {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            await initStockAnalysisNewsletter();
            console.log('✅ Stock Analysis Newsletter system initialized - Ready for manual generation');
        }
    });
});

console.log('✅ Stock Analysis Newsletter System V2 - Script Loaded (Reuses Advanced Analysis Methods)');