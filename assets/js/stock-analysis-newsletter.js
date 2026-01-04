/**
 * ════════════════════════════════════════════════════════════════
 * STOCK ANALYSIS NEWSLETTER SYSTEM V3.0 - ULTRA-PROFESSIONAL
 * ✅ Premium Modern Charts (QuickChart.io Enhanced)
 * ✅ Company Logos Integration (Multi-Fallback System)
 * ✅ Logo en pièce jointe du post
 * ✅ Enhanced Visual Design
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
        this.CHART_WIDTH = 1400;
        this.CHART_HEIGHT = 450;
        
        // ✅ SYSTÈME DE LOGOS (même logique que companies-directory.js)
        this.companyDomains = this.buildCompleteDomainMapping();
    }

    // ════════════════════════════════════════════════════════════════
    // 🎨 SYSTÈME DE LOGOS - MULTI-FALLBACK
    // ════════════════════════════════════════════════════════════════

    buildCompleteDomainMapping() {
        return {
            'AAPL': 'apple.com',
            'MSFT': 'microsoft.com',
            'GOOGL': 'abc.xyz',
            'AMZN': 'amazon.com',
            'META': 'meta.com',
            'TSLA': 'tesla.com',
            'NVDA': 'nvidia.com',
            'NFLX': 'netflix.com',
            'ADBE': 'adobe.com',
            'CRM': 'salesforce.com',
            'ORCL': 'oracle.com',
            'INTC': 'intel.com',
            'AMD': 'amd.com',
            'QCOM': 'qualcomm.com',
            'AVGO': 'broadcom.com',
            'TXN': 'ti.com',
            'CSCO': 'cisco.com',
            'IBM': 'ibm.com',
            'ACN': 'accenture.com',
            'NOW': 'servicenow.com',
            'INTU': 'intuit.com',
            'PYPL': 'paypal.com',
            'SQ': 'squareup.com',
            'SNOW': 'snowflake.com',
            'PLTR': 'palantir.com',
            'ZM': 'zoom.us',
            'SHOP': 'shopify.com',
            'UBER': 'uber.com',
            'LYFT': 'lyft.com',
            'ABNB': 'airbnb.com',
            'DASH': 'doordash.com',
            'SNAP': 'snap.com',
            'PINS': 'pinterest.com',
            'SPOT': 'spotify.com',
            'RBLX': 'roblox.com',
            'TWLO': 'twilio.com',
            'U': 'unity.com',
            'JPM': 'jpmorganchase.com',
            'BAC': 'bankofamerica.com',
            'WFC': 'wellsfargo.com',
            'C': 'citigroup.com',
            'GS': 'goldmansachs.com',
            'MS': 'morganstanley.com',
            'V': 'visa.com',
            'MA': 'mastercard.com',
            'COIN': 'coinbase.com',
            'HOOD': 'robinhood.com',
            'SOFI': 'sofi.com',
            'AFRM': 'affirm.com',
            'JNJ': 'jnj.com',
            'UNH': 'unitedhealthgroup.com',
            'PFE': 'pfizer.com',
            'LLY': 'lilly.com',
            'ABBV': 'abbvie.com',
            'MRK': 'merck.com',
            'ABT': 'abbott.com',
            'TMO': 'thermofisher.com',
            'DHR': 'danaher.com',
            'BMY': 'bmy.com',
            'AMGN': 'amgen.com',
            'GILD': 'gilead.com',
            'REGN': 'regeneron.com',
            'VRTX': 'vrtx.com',
            'MRNA': 'modernatx.com',
            'BNTX': 'biontech.com',
            'WMT': 'walmart.com',
            'COST': 'costco.com',
            'HD': 'homedepot.com',
            'TGT': 'target.com',
            'LOW': 'lowes.com',
            'NKE': 'nike.com',
            'LULU': 'lululemon.com',
            'KO': 'coca-colacompany.com',
            'PEP': 'pepsico.com',
            'MCD': 'mcdonalds.com',
            'SBUX': 'starbucks.com',
            'CMG': 'chipotle.com',
            'YUM': 'yum.com',
            'DIS': 'disney.com',
            'CMCSA': 'comcastcorporation.com',
            'VZ': 'verizon.com',
            'T': 'att.com',
            'TMUS': 't-mobile.com',
            'XOM': 'exxonmobil.com',
            'CVX': 'chevron.com',
            'COP': 'conocophillips.com',
            'SLB': 'slb.com',
            'BA': 'boeing.com',
            'CAT': 'caterpillar.com',
            'HON': 'honeywell.com',
            'GE': 'ge.com',
            'LMT': 'lockheedmartin.com',
            'RTX': 'rtx.com',
            'DE': 'deere.com',
            'F': 'ford.com',
            'GM': 'gm.com',
            'RIVN': 'rivian.com',
            'LCID': 'lucidmotors.com',
            'BABA': 'alibaba.com',
            'TCEHY': 'tencent.com',
            'TSM': 'tsmc.com',
            'SONY': 'sony.com',
            'TM': 'toyota.com',
            'HMC': 'honda.com',
            'SAP': 'sap.com',
            'ASML': 'asml.com',
            'LVMUY': 'lvmh.com',
            'NVO': 'novonordisk.com',
            'SHEL': 'shell.com',
            'BP': 'bp.com',
            'TTE': 'totalenergies.com'
        };
    }

    autoGenerateDomain(ticker, companyName) {
        let cleanName = companyName.toLowerCase()
            .replace(/\s+inc\.?$/i, '')
            .replace(/\s+corp(oration)?\.?$/i, '')
            .replace(/\s+ltd\.?$/i, '')
            .replace(/\s+plc\.?$/i, '')
            .replace(/\s+sa\.?$/i, '')
            .replace(/\s+nv\.?$/i, '')
            .replace(/\s+ag\.?$/i, '')
            .replace(/\s+gmbh\.?$/i, '')
            .replace(/\s+holdings?\.?$/i, '')
            .replace(/\s+group\.?$/i, '')
            .replace(/\s+&\s+/g, '')
            .replace(/\s+and\s+/g, '')
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');
        
        const exceptions = {
            'meta': 'meta.com',
            'metaplatforms': 'meta.com',
            'alphabet': 'abc.xyz',
            'facebook': 'meta.com',
            'google': 'google.com',
            'xcorp': 'twitter.com',
            'twitter': 'twitter.com',
            'square': 'squareup.com',
            'block': 'squareup.com',
            '3m': '3m.com',
            'lvmh': 'lvmh.com',
            'hermes': 'hermes.com',
            'loreal': 'loreal.com',
            'berkshirehathaway': 'berkshirehathaway.com',
            'jpmorgan': 'jpmorganchase.com',
            'jpmorganchase': 'jpmorganchase.com',
            'bankofamerica': 'bankofamerica.com',
            'wellsfargo': 'wellsfargo.com'
        };
        
        return exceptions[cleanName] || `${cleanName}.com`;
    }

    getLogoUrls(ticker, companyName) {
        const domain = this.companyDomains[ticker] || this.autoGenerateDomain(ticker, companyName);
        
        return {
            primary: `https://img.logo.dev/${domain}?token=pk_X-WazSBJQn2GwW2hy9Lwpg`,
            fallbacks: [
                `https://logo.clearbit.com/${domain}`,
                `https://www.google.com/s2/favicons?domain=${domain}&sz=256`,
                `https://unavatar.io/${domain}?fallback=false`
            ],
            domain: domain
        };
    }

    async fetchValidLogo(ticker, companyName) {
        const logos = this.getLogoUrls(ticker, companyName);
        const allUrls = [logos.primary, ...logos.fallbacks];
        
        for (const url of allUrls) {
            try {
                const response = await fetch(url, { method: 'HEAD', timeout: 3000 });
                if (response.ok) {
                    console.log(`✅ Logo found for ${ticker}: ${url}`);
                    return url;
                }
            } catch (error) {
                console.warn(`⚠ Logo failed for ${ticker} at ${url}`);
            }
        }
        
        console.warn(`❌ No logo found for ${ticker}, using fallback`);
        return null;
    }

    async initialize() {
        console.log('🚀 Initializing Stock Analysis Newsletter System V3.0...');
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
    // 📰 GÉNÉRATION DE LA NEWSLETTER POUR UN STOCK
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
            this.showNotification(`Generating deep analysis for ${symbol}...`, 'info');

            if (!this.advancedAnalysis) {
                throw new Error('Advanced Analysis module not available');
            }

            // ✅ CHARGER LES DONNÉES DU STOCK
            await this.loadStockData(symbol);

            if (!this.stockData || !this.stockData.prices || this.stockData.prices.length < 30) {
                throw new Error(`Insufficient data for ${symbol} (minimum 30 days required)`);
            }

            console.log(`📊 Data loaded: ${this.stockData.prices.length} data points (6 months)`);

            // ✅ CHARGER LE LOGO DE L'ENTREPRISE
            const companyName = this.stockData.quote.name || `${symbol} Corporation`;
            console.log(`🎨 Fetching logo for ${companyName} (${symbol})...`);
            const logoUrl = await this.fetchValidLogo(symbol, companyName);

            // ✅ CALCULER LES SIGNAUX TECHNIQUES
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

            console.log(`🧠 AI Score: ${this.aiRecommendations.globalScore}/100 (${this.aiRecommendations.rating})`);

            // ✅ GÉNÉRER LE CONTENU PREMIUM
            const postContent = this.generatePremiumContent(symbol, companyName, logoUrl);

            const analysisDate = new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });

            // ✅ PRÉPARER LES IMAGES (LOGO EN PREMIER pour pièce jointe)
            const postImages = [];
            if (logoUrl) {
                postImages.push(logoUrl);
            }

            const postData = {
                title: `Deep Analysis: ${symbol} - ${analysisDate} - AlphaVault Intelligence Report`,
                content: postContent.markdown,
                channelId: 'market-analysis',
                tags: ['stock-analysis', 'technical-indicators', 'ai-recommendation', symbol.toLowerCase()],
                images: postImages, // ✅ Logo en pièce jointe
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
                companyName: companyName,
                companyLogo: logoUrl, // ✅ Métadonnée logo
                analysisDate: new Date().toISOString(),
                aiScore: this.aiRecommendations.globalScore,
                aiRating: this.aiRecommendations.rating
            };

            console.log('📤 Publishing stock analysis to Firestore...');
            const docRef = await firebase.firestore().collection('posts').add(postData);

            console.log(`✅ Analysis published successfully! ID: ${docRef.id}`);

            // 📧 ENVOI DES NOTIFICATIONS PAR EMAIL
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

            this.showNotification(`Analysis for ${symbol} published successfully!`, 'success');

            if (window.communityHub) {
                await window.communityHub.loadPosts();
            }

        } catch (error) {
            console.error('❌ Error generating stock analysis:', error);
            this.showNotification('Failed to generate analysis: ' + error.message, 'error');
        }
    }

    // ════════════════════════════════════════════════════════════════
    // 📊 CHARGEMENT DES DONNÉES (6 MOIS = 180 JOURS)
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
            console.warn('⚠ API call failed, using demo data:', error.message);
            this.stockData = this.generateDemoData(symbol, 180);
        }
    }

    // ════════════════════════════════════════════════════════════════
    // 🎨 GÉNÉRATION DU CONTENU PREMIUM AVEC LOGO
    // ════════════════════════════════════════════════════════════════

    generatePremiumContent(symbol, companyName, logoUrl) {
        const quote = this.stockData.quote || {};
        const aiScore = this.aiRecommendations.globalScore;
        const aiRating = this.aiRecommendations.rating;
        const horizons = this.aiRecommendations.horizons;
        
        let md = '';

        // ✅ HEADER PREMIUM AVEC LOGO
        md += `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); padding: 60px 40px; border-radius: 28px; text-align: center; margin-bottom: 40px; box-shadow: 0 20px 60px rgba(102, 126, 234, 0.5); position: relative; overflow: hidden;">\n\n`;
        
        // ✅ STRIPES ANIMÉES
        md += `<div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255, 255, 255, 0.03) 10px, rgba(255, 255, 255, 0.03) 20px); pointer-events: none;"></div>\n\n`;
        
        md += `<div style="position: relative; z-index: 1;">\n\n`;
        
        // ✅ LOGO DE L'ENTREPRISE (si disponible)
        if (logoUrl) {
            md += `<div style="width: 140px; height: 140px; margin: 0 auto 24px; background: white; border-radius: 24px; padding: 16px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3); border: 4px solid rgba(255, 255, 255, 0.5); display: flex; align-items: center; justify-content: center;">\n\n`;
            md += `<img src="${logoUrl}" alt="${companyName}" style="max-width: 100%; max-height: 100%; object-fit: contain;">\n\n`;
            md += `</div>\n\n`;
        } else {
            // ✅ FALLBACK : Initiales si pas de logo
            const initials = symbol.substring(0, 2).toUpperCase();
            md += `<div style="width: 140px; height: 140px; margin: 0 auto 24px; background: white; border-radius: 24px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3); border: 4px solid rgba(255, 255, 255, 0.5); display: flex; align-items: center; justify-content: center;">\n\n`;
            md += `<span style="font-size: 3.5rem; font-weight: 900; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${initials}</span>\n\n`;
            md += `</div>\n\n`;
        }
        
        md += `<h1 style="font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 900; margin: 0 0 16px 0; color: #ffffff; letter-spacing: 2px; line-height: 1.1; text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);">DEEP ANALYSIS: ${symbol}</h1>\n\n`;
        md += `<h2 style="font-size: clamp(1.3rem, 3.5vw, 1.8rem); font-weight: 700; margin: 0 0 12px 0; color: rgba(255, 255, 255, 0.95); letter-spacing: 1px;">${companyName}</h2>\n\n`;
        md += `<h3 style="font-size: clamp(1.1rem, 3vw, 1.5rem); font-weight: 700; margin: 0 0 28px 0; color: rgba(255, 255, 255, 0.9); letter-spacing: 0.5px;">AlphaVault Intelligence Report</h3>\n\n`;
        
        md += `<div style="display: inline-flex; align-items: center; gap: 16px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); padding: 14px 32px; border-radius: 50px; border: 2px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);">\n\n`;
        md += `<i class="fas fa-calendar-alt" style="color: white; font-size: 1.2rem;"></i>\n\n`;
        md += `<span style="font-size: clamp(0.95rem, 2.2vw, 1.15rem); color: white; font-weight: 700;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>\n\n`;
        md += `</div>\n\n`;
        
        md += `<p style="font-size: clamp(0.85rem, 2vw, 1rem); margin: 20px 0 0 0; color: rgba(255, 255, 255, 0.85); font-weight: 600;">6-Month Analysis | ${this.stockData.prices.length} data points | 14 Technical Indicators</p>\n\n`;
        
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        md += this.createSeparator();

        // ✅ SECTIONS
        md += this.generateAlphaVaultScoreSection(aiScore, aiRating);
        md += this.createSeparator();

        md += this.generateHorizonRecommendationsSection(horizons);
        md += this.createSeparator();

        md += this.generateAllChartsSection();
        md += this.createSeparator();

        md += this.generateTechnicalIndicatorsSection();
        md += this.createSeparator();

        md += this.generatePremiumFooter();

        return { markdown: md, html: md };
    }

    // ════════════════════════════════════════════════════════════════
    // 📊 SECTION ALPHAVAULT SCORE
    // ════════════════════════════════════════════════════════════════

    generateAlphaVaultScoreSection(aiScore, aiRating) {
        let md = `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: clamp(1.6rem, 4.5vw, 2.2rem); font-weight: 900; color: #1e293b; margin: 0 0 28px 0; padding-left: 24px; border-left: 8px solid #667eea; display: flex; align-items: center; gap: 12px;"><i class="fas fa-brain" style="color: #667eea; font-size: 2rem;"></i>AlphaVault Intelligence Score</h2>\n\n`;
        md += `<div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.12)); padding: clamp(24px, 5vw, 40px); border-radius: 24px; border: 3px solid rgba(102, 126, 234, 0.3); box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);">\n\n`;
        
        md += `<div style="text-align: center; margin-bottom: 32px;">\n\n`;
        md += `<p style="font-size: clamp(4rem, 10vw, 6rem); font-weight: 900; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 12px 0; line-height: 1; text-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);">${aiScore}/100</p>\n\n`;
        md += `<p style="font-size: clamp(1.4rem, 3.5vw, 1.8rem); font-weight: 900; color: #1e293b; margin: 0; text-transform: uppercase; letter-spacing: 2px;">${aiRating}</p>\n\n`;
        md += `</div>\n\n`;
        
        const scoreBarWidth = Math.max(0, Math.min(100, parseFloat(aiScore)));
        md += `<div style="background: rgba(203, 213, 225, 0.4); height: 28px; border-radius: 14px; overflow: hidden; margin: 32px 0; box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);">\n\n`;
        md += `<div style="background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%); height: 100%; width: ${scoreBarWidth}%; border-radius: 14px; transition: width 0.5s ease; box-shadow: 0 0 20px rgba(102, 126, 234, 0.6);"></div>\n\n`;
        md += `</div>\n\n`;
        
        md += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 20px; margin: 32px 0;">\n\n`;
        md += this.generateSignalBadge('Bullish Signals', this.aiRecommendations.bullishSignals, '#10b981', 'fa-arrow-trend-up');
        md += this.generateSignalBadge('Neutral Signals', this.aiRecommendations.neutralSignals, '#f59e0b', 'fa-minus');
        md += this.generateSignalBadge('Bearish Signals', this.aiRecommendations.bearishSignals, '#ef4444', 'fa-arrow-trend-down');
        md += `</div>\n\n`;
        
        md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); color: #64748b; text-align: center; line-height: 1.8; margin: 24px 0 0 0; font-weight: 600;"><i class="fas fa-info-circle" style="color: #667eea; margin-right: 8px;"></i>Based on 14 professional technical indicators analyzed by AlphaVault AI</p>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;
        
        return md;
    }

    generateSignalBadge(label, count, color, icon) {
        return `<div style="text-align: center; padding: 24px 20px; background: linear-gradient(135deg, ${color}15, ${color}08); border-radius: 16px; border: 2px solid ${color}40; box-shadow: 0 4px 16px ${color}20;">\n\n` +
               `<i class="fas ${icon}" style="color: ${color}; font-size: 2rem; margin-bottom: 12px; display: block;"></i>\n\n` +
               `<p style="font-size: clamp(2rem, 5vw, 2.5rem); font-weight: 900; color: ${color}; margin: 0 0 8px 0; line-height: 1;">${count}</p>\n\n` +
               `<p style="font-size: clamp(0.8rem, 1.8vw, 0.95rem); font-weight: 800; color: #475569; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">${label}</p>\n\n` +
               `</div>\n\n`;
    }

    // ════════════════════════════════════════════════════════════════
    // 🎯 SECTION RECOMMENDATIONS PAR HORIZON
    // ════════════════════════════════════════════════════════════════

    generateHorizonRecommendationsSection(horizons) {
        let md = `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: clamp(1.6rem, 4.5vw, 2.2rem); font-weight: 900; color: #1e293b; margin: 0 0 28px 0; padding-left: 24px; border-left: 8px solid #8b5cf6; display: flex; align-items: center; gap: 12px;"><i class="fas fa-crosshairs" style="color: #8b5cf6; font-size: 2rem;"></i>AI Recommendations by Time Horizon</h2>\n\n`;
        md += `<div style="display: grid; gap: 24px;">\n\n`;
        
        const horizonData = [
            { key: '1y', label: '1-Year Horizon', gradient: 'linear-gradient(135deg, #10b981, #059669)', icon: 'fa-calendar-days' },
            { key: '2y', label: '2-Year Horizon', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', icon: 'fa-calendar-week' },
            { key: '5y', label: '5-Year Horizon', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', icon: 'fa-calendar' }
        ];

        horizonData.forEach(h => {
            const rec = horizons[h.key];
            const recColor = rec.recommendation === 'BUY' ? '#10b981' : rec.recommendation === 'SELL' ? '#ef4444' : '#f59e0b';
            const recIcon = rec.recommendation === 'BUY' ? 'fa-circle-up' : rec.recommendation === 'SELL' ? 'fa-circle-down' : 'fa-circle-pause';
            
            md += `<div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(236, 72, 153, 0.1)); padding: clamp(24px, 5vw, 32px); border-radius: 20px; border: 2px solid rgba(102, 126, 234, 0.3); box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);">\n\n`;
            
            md += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; margin-bottom: 24px;">\n\n`;
            
            md += `<div>\n\n`;
            md += `<p style="font-size: clamp(0.9rem, 2.2vw, 1.1rem); font-weight: 900; background: ${h.gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0; display: flex; align-items: center; gap: 10px;"><i class="fas ${h.icon}" style="font-size: 1.3rem;"></i>${h.label}</p>\n\n`;
            md += `<p style="font-size: clamp(1.6rem, 4vw, 2.2rem); font-weight: 900; color: ${recColor}; margin: 0; text-transform: uppercase; letter-spacing: 2px; display: flex; align-items: center; gap: 12px;"><i class="fas ${recIcon}"></i>${rec.recommendation}</p>\n\n`;
            md += `</div>\n\n`;
            
            md += `<div style="text-align: right;">\n\n`;
            md += `<p style="font-size: clamp(0.85rem, 2vw, 1rem); color: #64748b; margin: 0 0 6px 0; font-weight: 700;">Confidence</p>\n\n`;
            md += `<p style="font-size: clamp(1.6rem, 4vw, 2rem); font-weight: 900; background: ${h.gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0;">${rec.confidence}%</p>\n\n`;
            md += `</div>\n\n`;
            
            md += `</div>\n\n`;
            
            md += `<div style="background: rgba(102, 126, 234, 0.15); height: 16px; border-radius: 12px; overflow: hidden; margin-bottom: 20px; box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.1);">\n\n`;
            md += `<div style="background: ${h.gradient}; height: 100%; width: ${rec.confidence}%; border-radius: 12px; box-shadow: 0 0 16px ${recColor}80;"></div>\n\n`;
            md += `</div>\n\n`;
            
            md += `<div style="background: white; padding: 20px; border-radius: 14px; border-left: 4px solid ${recColor};">\n\n`;
            md += `<p style="font-size: clamp(1rem, 2.5vw, 1.2rem); color: #1e293b; margin: 0 0 16px 0; font-weight: 700;"><i class="fas fa-chart-line" style="color: ${recColor}; margin-right: 10px;"></i>Potential Move: <strong style="color: ${recColor};">${parseFloat(rec.potentialMove) >= 0 ? '+' : ''}${parseFloat(rec.potentialMove).toFixed(2)}%</strong></p>\n\n`;
            
            if (rec.drivers && rec.drivers.length > 0) {
                md += `<div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid rgba(102, 126, 234, 0.15);">\n\n`;
                md += `<p style="font-size: clamp(0.9rem, 2.2vw, 1.05rem); font-weight: 900; color: #475569; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 1px;"><i class="fas fa-lightbulb" style="color: #f59e0b; margin-right: 8px;"></i>Key Drivers:</p>\n\n`;
                rec.drivers.forEach(driver => {
                    md += `<p style="font-size: clamp(0.9rem, 2.2vw, 1rem); color: #475569; margin: 0 0 10px 0; padding-left: 20px; border-left: 4px solid ${recColor}; padding-top: 8px; padding-bottom: 8px; background: rgba(102, 126, 234, 0.05); border-radius: 0 8px 8px 0;"><i class="fas fa-check-circle" style="color: ${recColor}; margin-right: 10px;"></i>${driver}</p>\n\n`;
                });
                md += `</div>\n\n`;
            }
            
            md += `</div>\n\n`;
            md += `</div>\n\n`;
        });
        
        md += `</div>\n\n`;
        md += `</div>\n\n`;
        
        return md;
    }

    // ════════════════════════════════════════════════════════════════
    // 📈 GÉNÉRATION DE TOUS LES GRAPHIQUES (14 INDICATEURS) - VERSION MODERNE
    // ════════════════════════════════════════════════════════════════

    generateAllChartsSection() {
        let md = '';
        
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: clamp(1.6rem, 4.5vw, 2.2rem); font-weight: 900; color: #1e293b; margin: 0 0 28px 0; padding-left: 24px; border-left: 8px solid #667eea; display: flex; align-items: center; gap: 12px;"><i class="fas fa-chart-area" style="color: #667eea; font-size: 2rem;"></i>Technical Indicators - Visual Analysis</h2>\n\n`;
        
        const chartConfigs = [
            {
                name: 'RSI (Relative Strength Index)',
                dataFunc: () => this.advancedAnalysis.calculateRSI(this.stockData.prices),
                chartFunc: (data) => this.generateModernRSIChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A',
                icon: 'fa-gauge-high',
                color: '#667eea'
            },
            {
                name: 'MACD (Moving Average Convergence Divergence)',
                dataFunc: () => this.advancedAnalysis.calculateMACD(this.stockData.prices),
                chartFunc: (data) => this.generateModernMACDChart(data),
                getCurrentValue: (data) => data.histogram && data.histogram.length > 0 ? `${data.histogram[data.histogram.length - 1][1].toFixed(2)}` : 'N/A',
                icon: 'fa-wave-square',
                color: '#3b82f6'
            },
            {
                name: 'Stochastic Oscillator',
                dataFunc: () => this.advancedAnalysis.calculateStochastic(this.stockData.prices),
                chartFunc: (data) => this.generateModernStochasticChart(data),
                getCurrentValue: (data) => data.k && data.k.length > 0 ? `${data.k[data.k.length - 1][1].toFixed(2)}` : 'N/A',
                icon: 'fa-chart-line',
                color: '#8b5cf6'
            },
            {
                name: 'Williams %R',
                dataFunc: () => this.advancedAnalysis.calculateWilliams(this.stockData.prices),
                chartFunc: (data) => this.generateModernWilliamsChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A',
                icon: 'fa-percent',
                color: '#ec4899'
            },
            {
                name: 'ADX (Average Directional Index)',
                dataFunc: () => this.advancedAnalysis.calculateADX(this.stockData.prices),
                chartFunc: (data) => this.generateModernADXChart(data),
                getCurrentValue: (data) => data.adx && data.adx.length > 0 ? `${data.adx[data.adx.length - 1][1].toFixed(2)}` : 'N/A',
                icon: 'fa-arrows-split-up-and-left',
                color: '#10b981'
            },
            {
                name: 'OBV (On-Balance Volume)',
                dataFunc: () => this.advancedAnalysis.calculateOBV(this.stockData.prices),
                chartFunc: (data) => this.generateModernOBVChart(data),
                getCurrentValue: (data) => data.length > 0 ? `${(data[data.length - 1][1] / 1000000).toFixed(2)}M` : 'N/A',
                icon: 'fa-chart-column',
                color: '#f59e0b'
            },
            {
                name: 'ATR (Average True Range)',
                dataFunc: () => this.advancedAnalysis.calculateATR(this.stockData.prices),
                chartFunc: (data) => this.generateModernATRChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A',
                icon: 'fa-maximize',
                color: '#ef4444'
            },
            {
                name: 'MFI (Money Flow Index)',
                dataFunc: () => this.advancedAnalysis.calculateMFI(this.stockData.prices),
                chartFunc: (data) => this.generateModernMFIChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A',
                icon: 'fa-money-bill-trend-up',
                color: '#06b6d4'
            },
            {
                name: 'CCI (Commodity Channel Index)',
                dataFunc: () => this.advancedAnalysis.calculateCCI(this.stockData.prices),
                chartFunc: (data) => this.generateModernCCIChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A',
                icon: 'fa-wave',
                color: '#8b5cf6'
            },
            {
                name: 'Ultimate Oscillator',
                dataFunc: () => this.advancedAnalysis.calculateUltimateOscillator(this.stockData.prices),
                chartFunc: (data) => this.generateModernUltimateChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A',
                icon: 'fa-ranking-star',
                color: '#ec4899'
            },
            {
                name: 'ROC (Rate of Change)',
                dataFunc: () => this.advancedAnalysis.calculateROC(this.stockData.prices),
                chartFunc: (data) => this.generateModernROCChart(data),
                getCurrentValue: (data) => data.length > 0 ? `${data[data.length - 1][1].toFixed(2)}%` : 'N/A',
                icon: 'fa-chart-simple',
                color: '#f59e0b'
            },
            {
                name: 'Aroon Indicator',
                dataFunc: () => this.advancedAnalysis.calculateAroon(this.stockData.prices),
                chartFunc: (data) => this.generateModernAroonChart(data),
                getCurrentValue: (data) => data.up && data.up.length > 0 ? `${data.up[data.up.length - 1][1].toFixed(2)}` : 'N/A',
                icon: 'fa-arrows-up-down',
                color: '#10b981'
            },
            {
                name: 'CMF (Chaikin Money Flow)',
                dataFunc: () => this.advancedAnalysis.calculateCMF(this.stockData.prices),
                chartFunc: (data) => this.generateModernCMFChart(data),
                getCurrentValue: (data) => data.length > 0 ? data[data.length - 1][1].toFixed(2) : 'N/A',
                icon: 'fa-water',
                color: '#06b6d4'
            },
            {
                name: 'Elder Ray Index',
                dataFunc: () => this.advancedAnalysis.calculateElderRay(this.stockData.prices),
                chartFunc: (data) => this.generateModernElderRayChart(data),
                getCurrentValue: (data) => data.bullPower && data.bullPower.length > 0 ? `${data.bullPower[data.bullPower.length - 1][1].toFixed(2)}` : 'N/A',
                icon: 'fa-sun',
                color: '#f59e0b'
            }
        ];

        chartConfigs.forEach((config) => {
            try {
                const data = config.dataFunc();
                if (data) {
                    const chartUrl = config.chartFunc(data);
                    const currentValue = config.getCurrentValue(data);
                    
                    md += `<div style="margin-bottom: 36px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(236, 72, 153, 0.08)); border-radius: 20px; overflow: hidden; box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15); border: 2px solid rgba(102, 126, 234, 0.2);">\n\n`;
                    
                    md += `<div style="padding: 24px 28px; background: white; border-bottom: 3px solid ${config.color};">\n\n`;
                    md += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">\n\n`;
                    md += `<h3 style="font-size: clamp(1.2rem, 3vw, 1.5rem); font-weight: 900; color: #1e293b; margin: 0; display: flex; align-items: center; gap: 12px;"><i class="fas ${config.icon}" style="color: ${config.color}; font-size: 1.6rem;"></i>${config.name}</h3>\n\n`;
                    md += `<div style="background: linear-gradient(135deg, ${config.color}20, ${config.color}10); padding: 10px 20px; border-radius: 12px; border: 2px solid ${config.color}40;">\n\n`;
                    md += `<p style="font-size: clamp(0.85rem, 2vw, 1rem); color: #64748b; margin: 0 0 4px 0; font-weight: 700; text-align: center;">Current Value</p>\n\n`;
                    md += `<p style="font-size: clamp(1.1rem, 2.8vw, 1.4rem); font-weight: 900; color: ${config.color}; margin: 0; text-align: center;">${currentValue}</p>\n\n`;
                    md += `</div>\n\n`;
                    md += `</div>\n\n`;
                    md += `</div>\n\n`;
                    
                    md += `<div style="padding: 24px; background: white;">\n\n`;
                    md += `<img src="${chartUrl}" alt="${config.name} Chart" style="width: 100%; max-width: 100%; height: auto; display: block; border-radius: 12px; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);">\n\n`;
                    md += `</div>\n\n`;
                    
                    md += `</div>\n\n`;
                }
            } catch (error) {
                console.warn(`⚠ Failed to generate chart for ${config.name}:`, error);
            }
        });

        md += `</div>\n\n`;
        
        return md;
    }

    // ════════════════════════════════════════════════════════════════
    // 🎨 GRAPHIQUES MODERNES - QUICKCHART.IO PREMIUM
    // ════════════════════════════════════════════════════════════════

    generateModernRSIChart(data) {
        const labels = data.slice(-90).map(() => '');
        const values = data.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'RSI',
                    data: values,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.15)',
                    borderWidth: 4,
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
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: 70,
                                yMax: 70,
                                borderColor: 'rgba(239, 68, 68, 0.8)',
                                borderWidth: 3,
                                borderDash: [8, 4]
                            },
                            line2: {
                                type: 'line',
                                yMin: 30,
                                yMax: 30,
                                borderColor: 'rgba(16, 185, 129, 0.8)',
                                borderWidth: 3,
                                borderDash: [8, 4]
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(100, 116, 139, 0.1)', lineWidth: 2 },
                        ticks: { font: { size: 14, weight: 'bold' }, color: '#475569' }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateModernMACDChart(data) {
        const labels = data.histogram.slice(-90).map(() => '');
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
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 4,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0,
                        order: 1
                    },
                    {
                        type: 'line',
                        label: 'Signal',
                        data: signalLine,
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 4,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0,
                        order: 2
                    },
                    {
                        type: 'bar',
                        label: 'Histogram',
                        data: histogram,
                        backgroundColor: histogram.map(v => v > 0 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                        borderWidth: 0,
                        order: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { font: { size: 14, weight: 'bold' }, padding: 15 }
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(100, 116, 139, 0.1)', lineWidth: 2 },
                        ticks: { font: { size: 14, weight: 'bold' }, color: '#475569' }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateModernStochasticChart(data) {
        const labels = data.k.slice(-90).map(() => '');
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
                        borderColor: 'rgb(139, 92, 246)',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        borderWidth: 4,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: '%D',
                        data: dValues,
                        borderColor: 'rgb(236, 72, 153)',
                        borderWidth: 4,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { font: { size: 14, weight: 'bold' }, padding: 15 }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(100, 116, 139, 0.1)', lineWidth: 2 },
                        ticks: { font: { size: 14, weight: 'bold' }, color: '#475569' }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateModernADXChart(data) {
        const labels = data.adx.slice(-90).map(() => '');
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
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 5,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: '+DI',
                        data: plusDI,
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: '-DI',
                        data: minusDI,
                        borderColor: 'rgb(239, 68, 68)',
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
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { font: { size: 14, weight: 'bold' }, padding: 15 }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(100, 116, 139, 0.1)', lineWidth: 2 },
                        ticks: { font: { size: 14, weight: 'bold' }, color: '#475569' }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateModernAroonChart(data) {
        const labels = data.up.slice(-90).map(() => '');
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
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 4,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    },
                    {
                        label: 'Aroon Down',
                        data: downValues,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 4,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { font: { size: 14, weight: 'bold' }, padding: 15 }
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(100, 116, 139, 0.1)', lineWidth: 2 },
                        ticks: { font: { size: 14, weight: 'bold' }, color: '#475569' }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateModernElderRayChart(data) {
        const labels = data.bullPower.slice(-90).map(() => '');
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
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 2
                    },
                    {
                        label: 'Bear Power',
                        data: bearValues,
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: { font: { size: 14, weight: 'bold' }, padding: 15 }
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(100, 116, 139, 0.1)', lineWidth: 2 },
                        ticks: { font: { size: 14, weight: 'bold' }, color: '#475569' }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    // ✅ GRAPHIQUES GÉNÉRIQUES (pour les autres indicateurs)
    generateModernGenericLineChart(data, label, color, yMin = null, yMax = null) {
        const labels = data.slice(-90).map(() => '');
        const values = data.slice(-90).map(d => d[1]);
        
        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: values,
                    borderColor: color,
                    backgroundColor: `${color.replace('rgb', 'rgba').replace(')', ', 0.15)')}`,
                    borderWidth: 4,
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
                        ...(yMin !== null && { min: yMin }),
                        ...(yMax !== null && { max: yMax }),
                        grid: { color: 'rgba(100, 116, 139, 0.1)', lineWidth: 2 },
                        ticks: { font: { size: 14, weight: 'bold' }, color: '#475569' }
                    },
                    x: { display: false }
                }
            }
        };
        
        return `https://quickchart.io/chart?bkg=white&c=${encodeURIComponent(JSON.stringify(config))}&width=${this.CHART_WIDTH}&height=${this.CHART_HEIGHT}`;
    }

    generateModernWilliamsChart(data) {
        return this.generateModernGenericLineChart(data, 'Williams %R', 'rgb(236, 72, 153)', -100, 0);
    }

    generateModernATRChart(data) {
        return this.generateModernGenericLineChart(data, 'ATR', 'rgb(245, 158, 11)');
    }

    generateModernMFIChart(data) {
        return this.generateModernGenericLineChart(data, 'MFI', 'rgb(6, 182, 212)', 0, 100);
    }

    generateModernCCIChart(data) {
        return this.generateModernGenericLineChart(data, 'CCI', 'rgb(139, 92, 246)');
    }

    generateModernUltimateChart(data) {
        return this.generateModernGenericLineChart(data, 'Ultimate Oscillator', 'rgb(236, 72, 153)', 0, 100);
    }

    generateModernROCChart(data) {
        return this.generateModernGenericLineChart(data, 'ROC', 'rgb(245, 158, 11)');
    }

    generateModernCMFChart(data) {
        return this.generateModernGenericLineChart(data, 'CMF', 'rgb(6, 182, 212)');
    }

    generateModernOBVChart(data) {
        return this.generateModernGenericLineChart(data, 'OBV', 'rgb(16, 185, 129)');
    }

    // ════════════════════════════════════════════════════════════════
    // 📋 SECTION TECHNICAL INDICATORS - TABLEAU RÉCAPITULATIF
    // ════════════════════════════════════════════════════════════════

    generateTechnicalIndicatorsSection() {
        let md = '';
        
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: clamp(1.6rem, 4.5vw, 2.2rem); font-weight: 900; color: #1e293b; margin: 0 0 28px 0; padding-left: 24px; border-left: 8px solid #ef4444; display: flex; align-items: center; gap: 12px;"><i class="fas fa-list-check" style="color: #ef4444; font-size: 2rem;"></i>Complete Technical Indicators Summary</h2>\n\n`;
        
        const categories = [
            { key: 'momentum', name: 'Momentum Indicators', color: '#ef4444', icon: 'fa-gauge-high' },
            { key: 'trend', name: 'Trend Indicators', color: '#10b981', icon: 'fa-chart-line' },
            { key: 'volume', name: 'Volume Indicators', color: '#3b82f6', icon: 'fa-chart-column' },
            { key: 'composite', name: 'Composite Indicators', color: '#8b5cf6', icon: 'fa-layer-group' }
        ];

        categories.forEach(cat => {
            const indicators = this.technicalSignals[cat.key];
            if (!indicators || indicators.length === 0) return;

            md += `<div style="margin-bottom: 36px;">\n\n`;
            md += `<h3 style="font-size: clamp(1.3rem, 3.5vw, 1.7rem); font-weight: 900; color: #1e293b; margin: 0 0 20px 0; display: flex; align-items: center; gap: 12px;"><i class="fas ${cat.icon}" style="color: ${cat.color}; font-size: 1.6rem;"></i>${cat.name}</h3>\n\n`;
            md += `<div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(236, 72, 153, 0.08)); padding: clamp(20px, 4vw, 28px); border-radius: 20px; border: 2px solid rgba(102, 126, 234, 0.2); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.12);">\n\n`;
            
            indicators.forEach((ind, i) => {
                const signalColor = ind.signal > 0.5 ? '#10b981' : ind.signal < -0.5 ? '#ef4444' : '#f59e0b';
                const signalLabel = ind.signal > 0.5 ? 'BULLISH' : ind.signal < -0.5 ? 'BEARISH' : 'NEUTRAL';
                
                // ✅ CORRECTION: Formatage des décimales à 2 chiffres maximum
                let displayValue = ind.value;
                
                if (typeof displayValue === 'number') {
                    displayValue = displayValue.toFixed(2);
                } else if (typeof displayValue === 'string') {
                    displayValue = displayValue.replace(/(-?\d+\.\d{3,})/g, (match) => {
                        return parseFloat(match).toFixed(2);
                    });
                }
                
                md += `<div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: ${i < indicators.length - 1 ? '16px 0' : '16px 0 0 0'}; border-bottom: ${i < indicators.length - 1 ? '2px solid rgba(102, 126, 234, 0.15)' : 'none'};">\n\n`;
                md += `<div style="flex: 1; min-width: 200px;">\n\n`;
                md += `<p style="font-size: clamp(1rem, 2.5vw, 1.2rem); font-weight: 900; color: #1e293b; margin: 0 0 6px 0;">${ind.name}</p>\n\n`;
                md += `<p style="font-size: clamp(0.85rem, 2vw, 0.95rem); color: #64748b; margin: 0;">${ind.status || ind.description || ''}</p>\n\n`;
                md += `</div>\n\n`;
                md += `<div style="text-align: right;">\n\n`;
                md += `<p style="font-size: clamp(0.95rem, 2.2vw, 1.1rem); font-weight: 800; color: #1e293b; margin: 0 0 6px 0;">${displayValue}</p>\n\n`;
                md += `<span style="background: ${signalColor}; color: white; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: clamp(0.75rem, 1.8vw, 0.85rem); text-transform: uppercase; letter-spacing: 0.5px;">${signalLabel}</span>\n\n`;
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
    // 🎨 FOOTER PREMIUM
    // ════════════════════════════════════════════════════════════════

    generatePremiumFooter() {
        let md = `<div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: clamp(30px, 6vw, 40px); border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">\n\n`;
        md += `<h3 style="font-size: clamp(1.4rem, 4vw, 1.8rem); font-weight: 800; color: white; margin: 0 0 16px 0; line-height: 1.2;">Advanced Technical Analysis</h3>\n\n`;
        md += `<p style="font-size: clamp(0.9rem, 2.2vw, 1.05rem); color: rgba(255,255,255,0.9); line-height: 1.7; margin: 0 0 24px 0; max-width: 700px; margin-left: auto; margin-right: auto;">This analysis is based on 14 professional technical indicators powered by <strong style="color: #06b6d4;">AlphaVault AI</strong>. Same methodology as our Advanced Analysis platform. Not financial advice.</p>\n\n`;
        
        md += `<div style="display: flex; justify-content: center; gap: clamp(20px, 5vw, 32px); flex-wrap: wrap; margin: 24px 0;">\n\n`;
        md += `<div style="text-align: center;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); margin: 0 0 8px 0; color: white; font-weight: 900;">14</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 2vw, 0.95rem); font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">Technical Indicators</p>\n\n`;
        md += `</div>\n\n`;
        md += `<div style="text-align: center;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); margin: 0 0 8px 0; color: white; font-weight: 900;">AI</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 2vw, 0.95rem); font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">Powered Analysis</p>\n\n`;
        md += `</div>\n\n`;
        md += `<div style="text-align: center;">\n\n`;
        md += `<p style="font-size: clamp(1.5rem, 4vw, 2rem); margin: 0 0 8px 0; color: white; font-weight: 900;">6M</p>\n\n`;
        md += `<p style="font-size: clamp(0.8rem, 2vw, 0.95rem); font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">Historical Data</p>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;
        
        md += `<div style="margin-top: 32px; display: flex; gap: clamp(12px, 3vw, 16px); justify-content: center; flex-wrap: wrap;">\n\n`;
        md += `<a href="https://alphavault-ai.com/advanced-analysis.html" target="_blank" style="background: linear-gradient(135deg, #06b6d4, #ec4899); color: white; padding: clamp(12px, 2.5vw, 14px) clamp(24px, 5vw, 32px); border-radius: 12px; text-decoration: none; font-weight: 800; font-size: clamp(0.9rem, 2vw, 1rem); box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);">Analyze Another Stock</a>\n\n`;
        md += `<a href="https://alphavault-ai.com/checkout.html" target="_blank" style="background: white; color: #06b6d4; padding: clamp(12px, 2.5vw, 14px) clamp(24px, 5vw, 32px); border-radius: 12px; text-decoration: none; font-weight: 800; font-size: clamp(0.9rem, 2vw, 1rem); box-shadow: 0 4px 12px rgba(255,255,255,0.2);">Upgrade to Premium</a>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        return md;
    }

    // ════════════════════════════════════════════════════════════════
    // 🛠 UTILITY FUNCTIONS
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
// 🚀 INITIALISATION
// ════════════════════════════════════════════════════════════════

window.stockAnalysisNewsletter = null;

async function initStockAnalysisNewsletter() {
    if (!window.stockAnalysisNewsletter) {
        console.log('🚀 Initializing Stock Analysis Newsletter System V3.0...');
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

        console.log(`📊 Manual stock analysis generation requested for: ${symbol}`);
        
        const system = await initStockAnalysisNewsletter();
        
        if (!firebase.auth().currentUser) {
            alert('Please log in to generate analysis');
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

console.log('✅ Stock Analysis Newsletter System V3.0 - Script Loaded (Premium Charts + Logos Integration)');