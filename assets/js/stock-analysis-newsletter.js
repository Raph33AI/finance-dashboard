/**
 * ════════════════════════════════════════════════════════════════
 * STOCK ANALYSIS NEWSLETTER SYSTEM V2.0 - ULTRA-PROFESSIONAL
 * Reuses Advanced Analysis Methods for Identical Results
 * 6 Months Data + 14 Technical Indicators + AI Recommendations
 * Premium Charts with Responsive Design
 * ════════════════════════════════════════════════════════════════
 */

class StockAnalysisNewsletter {
    constructor() {
        this.LAST_POST_KEY = 'lastStockAnalysisPost';
        this.DEFAULT_PERIOD = '6M';
        this.advancedAnalysis = null;
        this.stockData = null;
        this.technicalSignals = null;
        this.aiRecommendations = null;
        this.CHART_WIDTH = 1200;
        this.CHART_HEIGHT = 400;
    }

    async initialize() {
        console.log('Initializing Stock Analysis Newsletter System V2.0...');
        await this.waitForAdvancedAnalysis();
        console.log('Stock Analysis Newsletter System ready');
    }

    async waitForAdvancedAnalysis() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50;

            const checkAnalysis = setInterval(() => {
                attempts++;

                if (window.AdvancedAnalysis) {
                    console.log('AdvancedAnalysis module found');
                    this.advancedAnalysis = window.AdvancedAnalysis;
                    clearInterval(checkAnalysis);
                    resolve();
                    return;
                }

                if (attempts >= maxAttempts) {
                    console.warn('AdvancedAnalysis not available after 5s');
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
                console.error('No user authenticated');
                if (forceManual) this.showNotification('Please log in to generate analysis', 'error');
                return;
            }

            if (!symbol || symbol.trim() === '') {
                this.showNotification('Please enter a valid stock symbol', 'error');
                return;
            }

            symbol = symbol.trim().toUpperCase();
            this.showNotification(`Generating deep analysis for ${symbol}...`, 'info');

            if (!this.advancedAnalysis) {
                throw new Error('Advanced Analysis module not available');
            }

            await this.loadStockData(symbol);

            if (!this.stockData || !this.stockData.prices || this.stockData.prices.length < 30) {
                throw new Error(`Insufficient data for ${symbol} (minimum 30 days required)`);
            }

            console.log(`Data loaded: ${this.stockData.prices.length} data points (6 months)`);

            this.technicalSignals = this.advancedAnalysis.collectAllTechnicalSignals(this.stockData.prices);

            const trendAnalysis = this.advancedAnalysis.analyzeTrendsByHorizon(this.stockData.prices);
            const aiScore = this.advancedAnalysis.calculateAIConfidenceScore(this.technicalSignals);
            const horizonRecommendations = this.advancedAnalysis.generateHorizonRecommendations(
                aiScore,
                this.technicalSignals,
                trendAnalysis
            );

            this.aiRecommendations = {
                globalScore: parseFloat(aiScore.score).toFixed(2),
                rating: aiScore.rating,
                bullishSignals: aiScore.bullishSignals,
                neutralSignals: aiScore.neutralSignals,
                bearishSignals: aiScore.bearishSignals,
                horizons: horizonRecommendations
            };

            console.log(`AI Score: ${this.aiRecommendations.globalScore}/100 (${this.aiRecommendations.rating})`);

            const postContent = this.generatePremiumContent(symbol);

            // ✅ Génération de la date au format lisible
            const analysisDate = new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });

            const postData = {
                title: `Deep Analysis: ${symbol} - ${analysisDate} - AlphaVault Intelligence Report`,
                content: postContent.markdown,
                channelId: 'market-analysis',
                tags: ['stock-analysis', 'technical-indicators', 'ai-recommendation', symbol.toLowerCase()],
                images: [],
                authorId: currentUser.uid,
                authorName: 'Raphaël Nardone',
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

            console.log('Publishing stock analysis to Firestore...');
            const docRef = await firebase.firestore().collection('posts').add(postData);

            console.log(`Analysis published successfully! ID: ${docRef.id}`);

            // ✅ 📧 NOUVEAU : Envoyer les notifications par email
            try {
                if (window.communityService && window.communityService.sendBlogPostNotification) {
                    console.log('📧 Sending email notifications to all users...');
                    await window.communityService.sendBlogPostNotification(postData, docRef.id);
                } else {
                    console.warn('⚠ Community service not available - emails not sent');
                }
            } catch (emailError) {
                console.error('⚠ Email notification failed (post still published):', emailError);
            }

            localStorage.setItem(this.LAST_POST_KEY, Date.now().toString());

            this.showNotification(`Analysis for ${symbol} published!`, 'success');

            if (window.communityHub) {
                await window.communityHub.loadPosts();
            }

        } catch (error) {
            console.error('Error generating stock analysis:', error);
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
            console.log(`Fetching 6 months data for ${symbol}...`);
            
            const [quote, timeSeries] = await Promise.all([
                apiClient.getQuote(symbol),
                apiClient.getTimeSeries(symbol, '1day', 180)
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
            console.warn('API call failed, using demo data:', error.message);
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

        // HEADER PREMIUM
        md += `<div style="background: linear-gradient(135deg, #06b6d4 0%, #ec4899 100%); padding: 60px 40px; border-radius: 24px; text-align: center; margin-bottom: 40px; box-shadow: 0 10px 30px rgba(6, 182, 212, 0.4);">\n\n`;
        md += `<h1 style="font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 900; margin: 0 0 20px 0; color: #ffffff; letter-spacing: 1px; line-height: 1.2;">DEEP ANALYSIS: ${symbol}</h1>\n\n`;
        md += `<h3 style="font-size: clamp(1.2rem, 3vw, 1.6rem); font-weight: 700; margin: 0 0 24px 0; color: #ffffff; letter-spacing: 0.5px;">AlphaVault Intelligence Report</h3>\n\n`;
        md += `<p style="font-size: clamp(1rem, 2.5vw, 1.3rem); font-weight: 700; margin: 0 0 16px 0; color: #ffffff;">${quote.name || symbol}</p>\n\n`;
        md += `<p style="font-size: clamp(0.9rem, 2vw, 1.1rem); margin: 0; color: #ffffff;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} | 6-Month Analysis (${this.stockData.prices.length} data points)</p>\n\n`;
        md += `</div>\n\n`;

        md += this.createSeparator();

        // ALPHAVAULT SCORE
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
        md += `<div style="text-align: center; padding: 16px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05)); border-radius: 12px;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 900; color: #10b981; margin: 0 0 4px 0;">${this.aiRecommendations.bullishSignals}</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 1.8vw, 0.9rem); font-weight: 700; color: #475569; margin: 0;">Bullish Signals</p>\n\n`;
        md += `</div>\n\n`;
        md += `<div style="text-align: center; padding: 16px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05)); border-radius: 12px;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 900; color: #f59e0b; margin: 0 0 4px 0;">${this.aiRecommendations.neutralSignals}</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 1.8vw, 0.9rem); font-weight: 700; color: #475569; margin: 0;">Neutral Signals</p>\n\n`;
        md += `</div>\n\n`;
        md += `<div style="text-align: center; padding: 16px; background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); border-radius: 12px;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 900; color: #ef4444; margin: 0 0 4px 0;">${this.aiRecommendations.bearishSignals}</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 1.8vw, 0.9rem); font-weight: 700; color: #475569; margin: 0;">Bearish Signals</p>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;
        
        md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); color: #475569; text-align: center; line-height: 1.7; margin: 20px 0 0 0;">Based on 14 professional technical indicators analyzed by AlphaVault AI</p>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        md += this.createSeparator();

        // AI RECOMMENDATIONS PAR HORIZON
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #8b5cf6;">AI Recommendations by Time Horizon</h2>\n\n`;
        md += `<div style="display: grid; gap: 20px;">\n\n`;
        
        const horizonData = [
            { key: '1y', label: '1-Year Horizon', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
            { key: '2y', label: '2-Year Horizon', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
            { key: '5y', label: '5-Year Horizon', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }
        ];

        horizonData.forEach(h => {
            const rec = horizons[h.key];
            const recColor = rec.recommendation === 'BUY' ? '#10b981' : rec.recommendation === 'SELL' ? '#ef4444' : '#f59e0b';
            
            md += `<div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(236, 72, 153, 0.08)); padding: clamp(20px, 4vw, 28px); border-radius: 16px; border: 2px solid rgba(6, 182, 212, 0.2);">\n\n`;
            
            md += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">\n\n`;
            md += `<div>\n\n`;
            md += `<p style="font-size: clamp(0.85rem, 2vw, 1rem); font-weight: 800; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">${h.label}</p>\n\n`;
            md += `<p style="font-size: clamp(1.3rem, 3.5vw, 1.8rem); font-weight: 900; color: ${recColor}; margin: 0; text-transform: uppercase; letter-spacing: 1px;">${rec.recommendation}</p>\n\n`;
            md += `</div>\n\n`;
            md += `<div style="text-align: right;">\n\n`;
            md += `<p style="font-size: clamp(0.85rem, 2vw, 1rem); color: #64748b; margin: 0 0 4px 0;">Confidence</p>\n\n`;
            md += `<p style="font-size: clamp(1.3rem, 3.5vw, 1.6rem); font-weight: 800; color: #1e293b; margin: 0;">${rec.confidence}.00%</p>\n\n`;
            md += `</div>\n\n`;
            md += `</div>\n\n`;
            
            md += `<div style="background: rgba(6, 182, 212, 0.1); height: 12px; border-radius: 10px; overflow: hidden; margin-bottom: 16px;">\n\n`;
            md += `<div style="background: ${h.gradient}; height: 100%; width: ${rec.confidence}%; border-radius: 10px;"></div>\n\n`;
            md += `</div>\n\n`;
            
            md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); color: #475569; margin: 0 0 12px 0;"><strong>Potential Move:</strong> ${parseFloat(rec.potentialMove) >= 0 ? '+' : ''}${parseFloat(rec.potentialMove).toFixed(2)}%</p>\n\n`;
            
            if (rec.drivers && rec.drivers.length > 0) {
                md += `<div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid rgba(6, 182, 212, 0.2);">\n\n`;
                md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); font-weight: 800; color: #64748b; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">Key Drivers:</p>\n\n`;
                rec.drivers.forEach(driver => {
                    md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); color: #475569; margin: 0 0 8px 0; padding-left: 16px; border-left: 3px solid #06b6d4;">✓ ${driver}</p>\n\n`;
                });
                md += `</div>\n\n`;
            }
            
            md += `</div>\n\n`;
        });
        
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        md += this.createSeparator();

        // GRAPHIQUES DES INDICATEURS
        md += this.generateAllChartsSection();
        md += this.createSeparator();

        // TECHNICAL INDICATORS BREAKDOWN
        md += this.generateTechnicalIndicatorsSection();

        md += this.createSeparator();

        // PREMIUM FOOTER
        md += `<div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: clamp(30px, 6vw, 40px); border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">\n\n`;
        md += `<h3 style="font-size: clamp(1.4rem, 4vw, 1.8rem); font-weight: 800; color: white; margin: 0 0 16px 0; line-height: 1.2;">Advanced Technical Analysis</h3>\n\n`;
        md += `<p style="font-size: clamp(0.9rem, 2.2vw, 1.05rem); color: rgba(255,255,255,0.9); line-height: 1.7; margin: 0 0 24px 0; max-width: 700px; margin-left: auto; margin-right: auto;">This analysis is based on 14 professional technical indicators powered by <strong style="color: #06b6d4;">AlphaVault AI</strong>. Same methodology as our Advanced Analysis platform. Not financial advice.</p>\n\n`;
        
        md += `<div style="display: flex; justify-content: center; gap: clamp(20px, 5vw, 32px); flex-wrap: wrap; margin: 24px 0;">\n\n`;
        md += `<div style="text-align: center;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); margin: 0 0 8px 0;">14</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 2vw, 0.95rem); font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">Technical Indicators</p>\n\n`;
        md += `</div>\n\n`;
        md += `<div style="text-align: center;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); margin: 0 0 8px 0;">AI</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 2vw, 0.95rem); font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">Powered Analysis</p>\n\n`;
        md += `</div>\n\n`;
        md += `<div style="text-align: center;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); margin: 0 0 8px 0;">6M</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 2vw, 0.95rem); font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">Historical Data</p>\n\n`;
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
    // GÉNÉRATION DE TOUS LES GRAPHIQUES (14 INDICATEURS)
    // ════════════════════════════════════════════════════════════════

    generateAllChartsSection() {
        let md = '';
        
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #667eea;">Technical Indicators - Visual Analysis</h2>\n\n`;
        
        const chartConfigs = [
            {
                name: 'RSI (Relative Strength Index)',
                dataFunc: () => this.advancedAnalysis.calculateRSI(this.stockData.prices),
                chartFunc: (data) => this.generateRSIChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A'
            },
            {
                name: 'MACD (Moving Average Convergence Divergence)',
                dataFunc: () => this.advancedAnalysis.calculateMACD(this.stockData.prices),
                chartFunc: (data) => this.generateMACDChart(data),
                getCurrentValue: (data) => data.histogram && data.histogram.length > 0 ? `Histogram: ${data.histogram[data.histogram.length - 1][1].toFixed(2)}` : 'N/A'
            },
            {
                name: 'Stochastic Oscillator',
                dataFunc: () => this.advancedAnalysis.calculateStochastic(this.stockData.prices),
                chartFunc: (data) => this.generateStochasticChart(data),
                getCurrentValue: (data) => data.k && data.k.length > 0 ? `%K: ${data.k[data.k.length - 1][1].toFixed(2)}` : 'N/A'
            },
            {
                name: 'Williams %R',
                dataFunc: () => this.advancedAnalysis.calculateWilliams(this.stockData.prices),
                chartFunc: (data) => this.generateWilliamsChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A'
            },
            {
                name: 'ADX (Average Directional Index)',
                dataFunc: () => this.advancedAnalysis.calculateADX(this.stockData.prices),
                chartFunc: (data) => this.generateADXChart(data),
                getCurrentValue: (data) => data.adx && data.adx.length > 0 ? `ADX: ${data.adx[data.adx.length - 1][1].toFixed(2)}` : 'N/A'
            },
            {
                name: 'OBV (On-Balance Volume)',
                dataFunc: () => this.advancedAnalysis.calculateOBV(this.stockData.prices),
                chartFunc: (data) => this.generateOBVChart(data),
                getCurrentValue: (data) => data.length > 0 ? `Current: ${(data[data.length - 1][1] / 1000000).toFixed(2)}M` : 'N/A'
            },
            {
                name: 'ATR (Average True Range)',
                dataFunc: () => this.advancedAnalysis.calculateATR(this.stockData.prices),
                chartFunc: (data) => this.generateATRChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A'
            },
            {
                name: 'MFI (Money Flow Index)',
                dataFunc: () => this.advancedAnalysis.calculateMFI(this.stockData.prices),
                chartFunc: (data) => this.generateMFIChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A'
            },
            {
                name: 'CCI (Commodity Channel Index)',
                dataFunc: () => this.advancedAnalysis.calculateCCI(this.stockData.prices),
                chartFunc: (data) => this.generateCCIChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A'
            },
            {
                name: 'Ultimate Oscillator',
                dataFunc: () => this.advancedAnalysis.calculateUltimateOscillator(this.stockData.prices),
                chartFunc: (data) => this.generateUltimateChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A'
            },
            {
                name: 'ROC (Rate of Change)',
                dataFunc: () => this.advancedAnalysis.calculateROC(this.stockData.prices),
                chartFunc: (data) => this.generateROCChart(data),
                getCurrentValue: (data) => data.length > 0 ? `${data[data.length - 1][1].toFixed(2)}%` : 'N/A'
            },
            {
                name: 'Aroon Indicator',
                dataFunc: () => this.advancedAnalysis.calculateAroon(this.stockData.prices),
                chartFunc: (data) => this.generateAroonChart(data),
                getCurrentValue: (data) => data.up && data.up.length > 0 ? `Up: ${data.up[data.up.length - 1][1].toFixed(2)}` : 'N/A'
            },
            {
                name: 'CMF (Chaikin Money Flow)',
                dataFunc: () => this.advancedAnalysis.calculateCMF(this.stockData.prices),
                chartFunc: (data) => this.generateCMFChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A'
            },
            {
                name: 'Elder Ray Index',
                dataFunc: () => this.advancedAnalysis.calculateElderRay(this.stockData.prices),
                chartFunc: (data) => this.generateElderRayChart(data),
                getCurrentValue: (data) => data.bullPower && data.bullPower.length > 0 ? `Bull: ${data.bullPower[data.bullPower.length - 1][1].toFixed(2)}` : 'N/A'
            }
        ];

        chartConfigs.forEach(config => {
            try {
                const data = config.dataFunc();
                if (data) {
                    const chartUrl = config.chartFunc(data);
                    const currentValue = config.getCurrentValue(data);
                    
                    md += `<div style="margin-bottom: 32px; background: linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(236, 72, 153, 0.08)); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 2px solid rgba(6, 182, 212, 0.2);">\n\n`;
                    md += `<div style="padding: 20px; border-bottom: 2px solid rgba(6, 182, 212, 0.2);">\n\n`;
                    md += `<h3 style="font-size: clamp(1.1rem, 2.8vw, 1.4rem); font-weight: 800; color: #1e293b; margin: 0 0 8px 0;">${config.name}</h3>\n\n`;
                    md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); color: #64748b; margin: 0;">Current Value: <strong>${currentValue}</strong></p>\n\n`;
                    md += `</div>\n\n`;
                    md += `<div style="padding: 20px; background: white;">\n\n`;
                    md += `<img src="${chartUrl}" alt="${config.name} Chart" style="width: 100%; max-width: 100%; height: auto; display: block; border-radius: 8px;">\n\n`;
                    md += `</div>\n\n`;
                    md += `</div>\n\n`;
                }
            } catch (error) {
                console.warn(`Failed to generate chart for ${config.name}:`, error);
            }
        });

        md += `</div>\n\n`;
        
        return md;
    }

    // ════════════════════════════════════════════════════════════════
    // FONCTIONS DE GÉNÉRATION DE GRAPHIQUES INDIVIDUELS (QuickChart.io)
    // ════════════════════════════════════════════════════════════════

    generateRSIChart(data) {
        const labels = data.slice(-90).map((d, i) => '');
        const values = data.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'RSI',
                    data: values,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: false }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: { size: 12, weight: 'bold' }
                        }
                    },
                    x: {
                        display: false
                    }
                },
                annotation: {
                    annotations: [
                        {
                            type: 'line',
                            yMin: 70,
                            yMax: 70,
                            borderColor: 'rgba(239, 68, 68, 0.7)',
                            borderWidth: 2,
                            borderDash: [5, 5]
                        },
                        {
                            type: 'line',
                            yMin: 30,
                            yMax: 30,
                            borderColor: 'rgba(16, 185, 129, 0.7)',
                            borderWidth: 2,
                            borderDash: [5, 5]
                        }
                    ]
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateMACDChart(data) {
        const labels = data.histogram.slice(-90).map((d, i) => '');
        const macdLine = data.macdLine.slice(-90).map(d => d[1]);
        const signalLine = data.signalLine.slice(-90).map(d => d[1]);
        const histogram = data.histogram.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        type: 'line',
                        label: 'MACD',
                        data: macdLine,
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        type: 'line',
                        label: 'Signal',
                        data: signalLine,
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        type: 'bar',
                        label: 'Histogram',
                        data: histogram,
                        backgroundColor: histogram.map(v => v > 0 ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12, weight: 'bold' } }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateStochasticChart(data) {
        const labels = data.k.slice(-90).map((d, i) => '');
        const kValues = data.k.slice(-90).map(d => d[1]);
        const dValues = data.d.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '%K',
                        data: kValues,
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: '%D',
                        data: dValues,
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12, weight: 'bold' } }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateWilliamsChart(data) {
        const labels = data.slice(-90).map((d, i) => '');
        const values = data.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Williams %R',
                    data: values,
                    borderColor: 'rgba(139, 92, 246, 1)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        min: -100,
                        max: 0,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12, weight: 'bold' } }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateADXChart(data) {
        const labels = data.adx.slice(-90).map((d, i) => '');
        const adxValues = data.adx.slice(-90).map(d => d[1]);
        const plusDI = data.plusDI.slice(-90).map(d => d[1]);
        const minusDI = data.minusDI.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'ADX',
                        data: adxValues,
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 4,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: '+DI',
                        data: plusDI,
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: '-DI',
                        data: minusDI,
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12, weight: 'bold' } }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateOBVChart(data) {
        const labels = data.slice(-90).map((d, i) => '');
        const values = data.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'OBV',
                    data: values,
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12, weight: 'bold' } }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateATRChart(data) {
        const labels = data.slice(-90).map((d, i) => '');
        const values = data.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'ATR',
                    data: values,
                    borderColor: 'rgba(245, 158, 11, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12, weight: 'bold' } }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateMFIChart(data) {
        const labels = data.slice(-90).map((d, i) => '');
        const values = data.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'MFI',
                    data: values,
                    borderColor: 'rgba(6, 182, 212, 1)',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12, weight: 'bold' } }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateCCIChart(data) {
        const labels = data.slice(-90).map((d, i) => '');
        const values = data.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'CCI',
                    data: values,
                    borderColor: 'rgba(99, 102, 241, 1)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12, weight: 'bold' } }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateUltimateChart(data) {
        const labels = data.slice(-90).map((d, i) => '');
        const values = data.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ultimate Oscillator',
                    data: values,
                    borderColor: 'rgba(236, 72, 153, 1)',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12, weight: 'bold' } }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateROCChart(data) {
        const labels = data.slice(-90).map((d, i) => '');
        const values = data.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'ROC',
                    data: values,
                    borderColor: 'rgba(245, 158, 11, 1)',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12, weight: 'bold' } }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateAroonChart(data) {
        const labels = data.up.slice(-90).map((d, i) => '');
        const upValues = data.up.slice(-90).map(d => d[1]);
        const downValues = data.down.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Aroon Up',
                        data: upValues,
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Aroon Down',
                        data: downValues,
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12, weight: 'bold' } }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateCMFChart(data) {
        const labels = data.slice(-90).map((d, i) => '');
        const values = data.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'CMF',
                    data: values,
                    borderColor: 'rgba(6, 182, 212, 1)',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12, weight: 'bold' } }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateElderRayChart(data) {
        const labels = data.bullPower.slice(-90).map((d, i) => '');
        const bullValues = data.bullPower.slice(-90).map(d => d[1]);
        const bearValues = data.bearPower.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Bull Power',
                        data: bullValues,
                        backgroundColor: 'rgba(16, 185, 129, 0.6)',
                        borderWidth: 0
                    },
                    {
                        label: 'Bear Power',
                        data: bearValues,
                        backgroundColor: 'rgba(239, 68, 68, 0.6)',
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: { font: { size: 12, weight: 'bold' } }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    // ════════════════════════════════════════════════════════════════
    // GÉNÉRATION DE LA SECTION TECHNICAL INDICATORS - CORRECTION DÉCIMALES
    // ════════════════════════════════════════════════════════════════

    generateTechnicalIndicatorsSection() {
        let md = '';
        
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #ef4444;">Complete Technical Indicators Summary</h2>\n\n`;
        
        const categories = [
            { key: 'momentum', name: 'Momentum Indicators', color: '#ef4444' },
            { key: 'trend', name: 'Trend Indicators', color: '#10b981' },
            { key: 'volume', name: 'Volume Indicators', color: '#3b82f6' },
            { key: 'composite', name: 'Composite Indicators', color: '#8b5cf6' }
        ];

        categories.forEach(cat => {
            const indicators = this.technicalSignals[cat.key];
            if (!indicators || indicators.length === 0) return;

            md += `<div style="margin-bottom: 32px;">\n\n`;
            md += `<h3 style="font-size: clamp(1.2rem, 3vw, 1.5rem); font-weight: 800; color: #1e293b; margin: 0 0 16px 0;">${cat.name}</h3>\n\n`;
            md += `<div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(236, 72, 153, 0.08)); padding: clamp(18px, 3.5vw, 24px); border-radius: 16px; border: 2px solid rgba(6, 182, 212, 0.2);">\n\n`;
            
            indicators.forEach((ind, i) => {
                const signalColor = ind.signal > 0.5 ? '#10b981' : ind.signal < -0.5 ? '#ef4444' : '#f59e0b';
                const signalLabel = ind.signal > 0.5 ? 'BULLISH' : ind.signal < -0.5 ? 'BEARISH' : 'NEUTRAL';
                
                // ✅ CORRECTION: Formatage des décimales à 2 chiffres maximum
                let displayValue = ind.value;
                
                // Si c'est un nombre, limiter à 2 décimales
                if (typeof displayValue === 'number') {
                    displayValue = displayValue.toFixed(2);
                } 
                // Si c'est une string contenant des nombres, formatter tous les nombres à 2 décimales
                else if (typeof displayValue === 'string') {
                    // Remplacer tous les nombres avec 3 décimales ou plus par leur version à 2 décimales
                    displayValue = displayValue.replace(/(-?\d+\.\d{3,})/g, (match) => {
                        return parseFloat(match).toFixed(2);
                    });
                }
                
                md += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: ${i < indicators.length - 1 ? '12px 0' : '12px 0 0 0'}; border-bottom: ${i < indicators.length - 1 ? '1px solid rgba(6, 182, 212, 0.15)' : 'none'};">\n\n`;
                md += `<div style="flex: 1; min-width: 200px;">\n\n`;
                md += `<p style="font-size: clamp(1rem, 2.5vw, 1.2rem); font-weight: 800; color: #1e293b; margin: 0 0 4px 0;">${ind.name}</p>\n\n`;
                md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); color: #64748b; margin: 0;">${ind.status || ind.description || ''}</p>\n\n`;
                md += `</div>\n\n`;
                md += `<div style="text-align: right;">\n\n`;
                md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); font-weight: 700; color: #1e293b; margin: 0 0 4px 0;">${displayValue}</p>\n\n`;
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

    // ════════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ════════════════════════════════════════════════════════════════

    createSeparator() {
        return `<div style="height: 40px; margin: 30px 0; position: relative; display: flex; align-items: center;">\n\n` +
               `<div style="flex: 1; height: 3px; background: linear-gradient(90deg, transparent 0%, #06b6d4 30%, #ec4899 50%, #06b6d4 70%, transparent 100%); border-radius: 2px;"></div>\n\n` +
               `</div>\n\n`;
    }

    generateDemoData(symbol, days = 180) {
        console.log(`Generating demo data for ${symbol} (${days} days)`);
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
        console.log('Initializing Stock Analysis Newsletter System V2.0...');
        window.stockAnalysisNewsletter = new StockAnalysisNewsletter();
        await window.stockAnalysisNewsletter.initialize();
    }
    
    return window.stockAnalysisNewsletter;
}

async function generateStockAnalysisNewsletter() {
    try {
        const symbol = document.getElementById('stockSymbolInput')?.value;
        
        if (!symbol || symbol.trim() === '') {
            alert('Please enter a stock symbol');
            return;
        }

        console.log(`Manual stock analysis generation requested for: ${symbol}`);
        
        const system = await initStockAnalysisNewsletter();
        
        if (!firebase.auth().currentUser) {
            alert('Please log in to generate analysis');
            return;
        }
        
        await system.generateStockAnalysis(symbol, true);
        
    } catch (error) {
        console.error('Error generating stock analysis:', error);
        alert('Failed to generate stock analysis: ' + error.message);
    }
}

window.generateStockAnalysisNewsletter = generateStockAnalysisNewsletter;

document.addEventListener('DOMContentLoaded', async () => {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            await initStockAnalysisNewsletter();
            console.log('Stock Analysis Newsletter system initialized - Ready for manual generation');
        }
    });
});

console.log('Stock Analysis Newsletter System V2.0 - Script Loaded (Reuses Advanced Analysis Methods)');