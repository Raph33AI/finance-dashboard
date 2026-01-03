/**
 * ====================================================================
 * ALPHAVAULT AI - YOUTUBE MARKET INTELLIGENCE ENGINE
 * ====================================================================
 * Version: 4.2 Ultra - Corrections Logos + Titres Dégradés
 */

class YouTubeMarketIntelligence {
    constructor() {
        this.workerUrl = 'https://google-apis-proxy.raphnardone.workers.dev';
        
        // Market Data Storage
        this.marketData = {
            week: [],
            month: [],
            quarter: [],
            year: []
        };
        
        // Search Data Storage
        this.currentCompany = null;
        this.currentPeriod = '1month';
        this.currentSort = 'relevance';
        this.videosData = [];
        
        // Top Companies avec domaines corrects
        this.topCompanies = [
            { name: 'Apple', ticker: 'AAPL', sector: 'Technology', domain: 'apple.com' },
            { name: 'Microsoft', ticker: 'MSFT', sector: 'Technology', domain: 'microsoft.com' },
            { name: 'Nvidia', ticker: 'NVDA', sector: 'Technology', domain: 'nvidia.com' },
            { name: 'Tesla', ticker: 'TSLA', sector: 'Automotive', domain: 'tesla.com' },
            { name: 'Amazon', ticker: 'AMZN', sector: 'E-commerce', domain: 'amazon.com' },
            { name: 'Meta', ticker: 'META', sector: 'Social Media', domain: 'meta.com' },
            { name: 'Netflix', ticker: 'NFLX', sector: 'Entertainment', domain: 'netflix.com' },
            { name: 'AMD', ticker: 'AMD', sector: 'Technology', domain: 'amd.com' },
            { name: 'Palantir', ticker: 'PLTR', sector: 'Technology', domain: 'palantir.com' },
            { name: 'Coinbase', ticker: 'COIN', sector: 'Crypto', domain: 'coinbase.com' },
            { name: 'Salesforce', ticker: 'CRM', sector: 'Technology', domain: 'salesforce.com' },
            { name: 'Adobe', ticker: 'ADBE', sector: 'Technology', domain: 'adobe.com' },
            { name: 'Oracle', ticker: 'ORCL', sector: 'Technology', domain: 'oracle.com' },
            { name: 'Intel', ticker: 'INTC', sector: 'Technology', domain: 'intel.com' },
            { name: 'Qualcomm', ticker: 'QCOM', sector: 'Technology', domain: 'qualcomm.com' }
        ];
        
        this.init();
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    init() {
        console.log('🚀 YouTube Market Intelligence Engine v4.2 initialized');
        
        // Event Listeners
        const searchInput = document.getElementById('companySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.handleSearchInput());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchCompany();
            });
        }
        
        const periodSelector = document.getElementById('periodSelector');
        if (periodSelector) {
            periodSelector.addEventListener('change', () => {
                if (this.currentCompany) this.searchCompany();
            });
        }
        
        // Supprimer le bouton View Trends
        const viewTrendsBtn = document.getElementById('viewTrends');
        if (viewTrendsBtn) {
            viewTrendsBtn.style.display = 'none';
        }
        
        // Auto-load global dashboard
        this.loadGlobalDashboard();
    }

    // ========================================
    // SECTION 1: GLOBAL MARKET DASHBOARD
    // ========================================
    async loadGlobalDashboard() {
        console.log('📊 Loading Global Market Dashboard...');
        
        this.showSection('globalLoadingSection');
        this.hideSection('globalDashboardSection');
        this.hideSection('topCompaniesSection');
        this.hideSection('sectorAnalysisSection');
        this.hideSection('sentimentTrendsSection');
        
        try {
            // Charger seulement la semaine pour éviter quota
            const [weekData] = await Promise.all([
                this.fetchMarketDataForPeriod('7days')
            ]);
            
            this.marketData.week = weekData;
            
            // Mock data pour le reste
            this.marketData.month = this.generateMockData(30);
            this.marketData.quarter = this.generateMockData(90);
            this.marketData.year = this.generateMockData(365);
            
            // Render Dashboard
            this.renderGlobalStats();
            this.renderTopCompanies('week');
            this.renderSectorAnalysis();
            this.renderSentimentTrends();
            
            this.hideSection('globalLoadingSection');
            this.showSection('globalDashboardSection');
            this.showSection('topCompaniesSection');
            this.showSection('sectorAnalysisSection');
            this.showSection('sentimentTrendsSection');
            
            console.log('✅ Global Dashboard loaded successfully');
            
        } catch (error) {
            console.error('❌ Global Dashboard error:', error);
            this.hideSection('globalLoadingSection');
            
            // Fallback: Afficher des données mock
            this.marketData.week = this.generateMockData(7);
            this.marketData.month = this.generateMockData(30);
            this.marketData.quarter = this.generateMockData(90);
            this.marketData.year = this.generateMockData(365);
            
            this.renderGlobalStats();
            this.renderTopCompanies('week');
            this.renderSectorAnalysis();
            this.renderSentimentTrends();
            
            this.showSection('globalDashboardSection');
            this.showSection('topCompaniesSection');
            this.showSection('sectorAnalysisSection');
            this.showSection('sentimentTrendsSection');
            
            console.warn('⚠ Displaying mock data due to API error');
        }
    }

    generateMockData(days) {
        return this.topCompanies.map((company, index) => {
            const baseVideos = Math.floor(Math.random() * 50) + 20;
            const bullish = Math.floor(Math.random() * baseVideos * 0.6);
            const bearish = Math.floor(Math.random() * (baseVideos - bullish) * 0.4);
            const neutral = baseVideos - bullish - bearish;
            
            const sentimentScore = Math.round((bullish / baseVideos) * 100);
            const popularityScore = Math.floor(Math.random() * 100);
            const momentumScore = Math.floor(Math.random() * 100);
            const engagementScore = Math.floor(Math.random() * 100);
            const overallScore = Math.round((sentimentScore + popularityScore + momentumScore + engagementScore) / 4);
            
            return {
                ...company,
                videoCount: baseVideos,
                sentiment: {
                    bullish,
                    bearish,
                    neutral
                },
                sentimentScore,
                popularityScore,
                momentumScore,
                engagementScore,
                overallScore,
                trendingLevel: this.getTrendingLevel(overallScore),
                videos: [],
                logoUrl: this.getLogoUrl(company.domain)
            };
        }).sort((a, b) => b.overallScore - a.overallScore);
    }

    async fetchMarketDataForPeriod(period) {
        const periodDays = {
            '7days': 7,
            '1month': 30,
            '3months': 90,
            '1year': 365
        };
        
        const days = periodDays[period] || 30;
        const dateFilter = this.getDateFilter(days);
        
        console.log(`📅 Fetching data for period: ${period} (${days} days)`);
        console.log(`📅 Date filter: ${dateFilter}`);
        
        const allCompaniesData = [];
        
        // Limiter à 5 entreprises
        const companiesSubset = this.topCompanies.slice(0, 5);
        
        for (const company of companiesSubset) {
            try {
                const videos = await this.fetchYouTubeVideos(
                    `${company.ticker} stock analysis`,
                    10,
                    'date',
                    dateFilter
                );
                
                if (videos.length > 0) {
                    const analysis = this.analyzeCompanyVideos(company, videos, period);
                    allCompaniesData.push(analysis);
                }
                
                await this.sleep(300);
                
            } catch (error) {
                console.warn(`⚠ Failed to fetch data for ${company.ticker}:`, error.message);
            }
        }
        
        // Compléter avec mock data
        if (allCompaniesData.length < 10) {
            const mockData = this.generateMockData(days);
            return [...allCompaniesData, ...mockData.slice(0, 10 - allCompaniesData.length)];
        }
        
        return allCompaniesData.sort((a, b) => b.popularityScore - a.popularityScore);
    }

    analyzeCompanyVideos(company, videos, period) {
        if (!videos || videos.length === 0) {
            return {
                ...company,
                videoCount: 0,
                sentiment: { bullish: 0, bearish: 0, neutral: 0 },
                sentimentScore: 0,
                popularityScore: 0,
                momentumScore: 0,
                engagementScore: 0,
                trendingLevel: 'Low',
                videos: [],
                logoUrl: this.getLogoUrl(company.domain)
            };
        }
        
        const sentimentCounts = { bullish: 0, bearish: 0, neutral: 0 };
        
        videos.forEach(video => {
            const sentiment = this.detectSentiment(
                video.snippet.title + ' ' + video.snippet.description
            );
            sentimentCounts[sentiment.toLowerCase()]++;
        });
        
        const totalVideos = videos.length;
        
        const sentimentScore = this.calculateSentimentScore(sentimentCounts, totalVideos);
        const popularityScore = this.calculatePopularityScore(totalVideos, period);
        const momentumScore = this.calculateMomentumScore(videos);
        const engagementScore = this.calculateEngagementScore(videos);
        
        const overallScore = (popularityScore + sentimentScore + momentumScore + engagementScore) / 4;
        const trendingLevel = this.getTrendingLevel(overallScore);
        
        return {
            ...company,
            videoCount: totalVideos,
            sentiment: {
                bullish: sentimentCounts.bullish,
                bearish: sentimentCounts.bearish,
                neutral: sentimentCounts.neutral
            },
            sentimentScore: Math.round(sentimentScore),
            popularityScore: Math.round(popularityScore),
            momentumScore: Math.round(momentumScore),
            engagementScore: Math.round(engagementScore),
            overallScore: Math.round(overallScore),
            trendingLevel,
            videos: videos.slice(0, 3),
            logoUrl: this.getLogoUrl(company.domain)
        };
    }

    // ✅ CORRECTION: Système de logos multi-fallback amélioré
    getLogoUrl(domain) {
        if (!domain) return null;
        
        return {
            primary: `https://img.logo.dev/${domain}?token=pk_X-WazSBJQn2GwW2hy9Lwpg`,
            fallbacks: [
                `https://logo.clearbit.com/${domain}`,
                `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
                `https://unavatar.io/${domain}?fallback=false`
            ]
        };
    }

    
    static handleLogoError(img, initials) {
        const logoDiv = img.parentElement;
        const fallbacks = JSON.parse(logoDiv.dataset.fallbacks || '[]');
        
        if (fallbacks.length > 0) {
            const nextUrl = fallbacks.shift();
            logoDiv.dataset.fallbacks = JSON.stringify(fallbacks);
            img.src = nextUrl;
        } else {
            logoDiv.classList.add('text-fallback');
            logoDiv.innerHTML = initials;
        }
    }

    // ========================================
    // SCORING ALGORITHMS
    // ========================================
    calculateSentimentScore(sentimentCounts, totalVideos) {
        if (totalVideos === 0) return 0;
        
        const bullishWeight = 100;
        const neutralWeight = 50;
        const bearishWeight = 0;
        
        const weightedScore = (
            (sentimentCounts.bullish * bullishWeight) +
            (sentimentCounts.neutral * neutralWeight) +
            (sentimentCounts.bearish * bearishWeight)
        ) / totalVideos;
        
        return weightedScore;
    }

    calculatePopularityScore(videoCount, period) {
        const baseline = {
            '7days': 3,
            '1month': 10,
            '3months': 30,
            '1year': 100
        };
        
        const expected = baseline[period] || 10;
        const score = Math.min((videoCount / expected) * 100, 100);
        
        return score;
    }

    calculateMomentumScore(videos) {
        if (!videos || videos.length < 2) return 0;
        
        const sortedVideos = [...videos].sort((a, b) => 
            new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
        );
        
        const now = Date.now();
        const recentCount = sortedVideos.filter(v => 
            (now - new Date(v.snippet.publishedAt).getTime()) < (7 * 24 * 60 * 60 * 1000)
        ).length;
        
        const olderCount = videos.length - recentCount;
        
        if (olderCount === 0) return 100;
        
        const momentumRatio = recentCount / olderCount;
        return Math.min(momentumRatio * 50, 100);
    }

    calculateEngagementScore(videos) {
        return Math.min(videos.length * 5, 100);
    }

    getTrendingLevel(score) {
        if (score >= 80) return 'Very High';
        if (score >= 60) return 'High';
        if (score >= 40) return 'Moderate';
        if (score >= 20) return 'Low';
        return 'Very Low';
    }

    // ========================================
    // RENDER GLOBAL DASHBOARD
    // ========================================
    renderGlobalStats() {
        const weekTotal = this.marketData.week.reduce((sum, c) => sum + c.videoCount, 0);
        const monthTotal = this.marketData.month.reduce((sum, c) => sum + c.videoCount, 0);
        const quarterTotal = this.marketData.quarter.reduce((sum, c) => sum + c.videoCount, 0);
        const yearTotal = this.marketData.year.reduce((sum, c) => sum + c.videoCount, 0);
        
        const weekBullish = this.marketData.week.reduce((sum, c) => sum + c.sentiment.bullish, 0);
        const weekTotal_videos = this.marketData.week.reduce((sum, c) => sum + c.videoCount, 0);
        const marketSentiment = weekTotal_videos > 0 ? Math.round((weekBullish / weekTotal_videos) * 100) : 50;
        
        const topCompany = this.marketData.week[0] || { ticker: 'N/A', overallScore: 0 };
        
        const statsHTML = `
            <div class="global-stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                    <i class="fas fa-video"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-label">Videos (7 Days)</div>
                    <div class="stat-value">${weekTotal.toLocaleString()}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i> ${monthTotal > 0 ? Math.round((weekTotal / monthTotal) * 100) : 0}% of month
                    </div>
                </div>
            </div>
            
            <div class="global-stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-label">Market Sentiment</div>
                    <div class="stat-value">${marketSentiment}%</div>
                    <div class="stat-change ${marketSentiment >= 50 ? 'positive' : 'negative'}">
                        ${marketSentiment >= 50 ? 'Bullish' : 'Bearish'}
                    </div>
                </div>
            </div>
            
            <div class="global-stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #dc2626);">
                    <i class="fas fa-fire"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-label">Top Trending</div>
                    <div class="stat-value">${topCompany.ticker}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-star"></i> Score: ${topCompany.overallScore}
                    </div>
                </div>
            </div>
            
            <div class="global-stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                    <i class="fas fa-calendar-year"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-label">Year Total (365d)</div>
                    <div class="stat-value">${yearTotal.toLocaleString()}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-chart-bar"></i> Full Year
                    </div>
                </div>
            </div>
            
            <div class="global-stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-label">Quarter Total</div>
                    <div class="stat-value">${quarterTotal.toLocaleString()}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-chart-bar"></i> 3 Months
                    </div>
                </div>
            </div>
            
            <div class="global-stat-card">
                <div class="stat-icon" style="background: linear-gradient(135deg, #ec4899, #db2777);">
                    <i class="fas fa-calendar-day"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-label">Monthly Total</div>
                    <div class="stat-value">${monthTotal.toLocaleString()}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-calendar"></i> 30 Days
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('globalStatsGrid').innerHTML = statsHTML;
    }

    renderTopCompanies(period = 'week') {
        const data = this.marketData[period] || [];
        
        if (data.length === 0) {
            document.getElementById('topCompaniesGrid').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line"></i>
                    <p>No data available for this period</p>
                </div>
            `;
            return;
        }
        
        const html = data.slice(0, 15).map((company, index) => {
            const trendIcon = this.getTrendIcon(company.trendingLevel);
            const sentimentClass = this.getSentimentClass(company.sentimentScore);
            const initials = company.ticker.substring(0, 2).toUpperCase();
            
            // ✅ CORRECTION : Système de logos multi-fallback identique à companies-directory.js
            const fallbacksData = JSON.stringify(company.logoUrl?.fallbacks || []);
            const primaryLogoUrl = company.logoUrl?.primary || '';
            
            const logoHtml = primaryLogoUrl 
                ? `<img src="${primaryLogoUrl}" 
                        alt="${company.name}" 
                        onerror="YouTubeMarketIntelligence.handleLogoError(this, '${initials}')">`
                : `<div class="text-fallback">${initials}</div>`;
            
            return `
                <div class="company-rank-card" onclick="document.getElementById('companySearchInput').value='${company.ticker}'; companyResearch.searchCompany();">
                    <div class="rank-badge rank-${index + 1}">
                        ${index + 1}
                    </div>
                    
                    <div class="company-info-compact">
                        <div class="company-logo-compact" 
                            data-ticker="${company.ticker}"
                            data-fallbacks='${fallbacksData.replace(/'/g, '&apos;')}'>
                            ${logoHtml}
                        </div>
                        <div class="company-ticker">${company.ticker}</div>
                        <div class="company-name-small">${company.name}</div>
                        <div class="company-sector-tag">${company.sector}</div>
                    </div>
                    
                    <div class="company-metrics-compact">
                        <div class="metric-item">
                            <span class="metric-label-small">Videos</span>
                            <span class="metric-value-small">${company.videoCount}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label-small">Sentiment</span>
                            <span class="metric-value-small ${sentimentClass}">${company.sentimentScore}%</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label-small">Score</span>
                            <span class="metric-value-small">${company.overallScore}</span>
                        </div>
                    </div>
                    
                    <div class="trending-indicator">
                        ${trendIcon}
                        <span>${company.trendingLevel}</span>
                    </div>
                    
                    <div class="sentiment-breakdown-mini">
                        <div class="sentiment-bar-mini">
                            <div class="sentiment-fill bullish" style="width: ${company.videoCount > 0 ? (company.sentiment.bullish / company.videoCount) * 100 : 0}%"></div>
                            <div class="sentiment-fill neutral" style="width: ${company.videoCount > 0 ? (company.sentiment.neutral / company.videoCount) * 100 : 0}%"></div>
                            <div class="sentiment-fill bearish" style="width: ${company.videoCount > 0 ? (company.sentiment.bearish / company.videoCount) * 100 : 0}%"></div>
                        </div>
                        <div class="sentiment-legend-mini">
                            <span><i class="fas fa-circle" style="color: var(--youtube-success);"></i> ${company.sentiment.bullish}</span>
                            <span><i class="fas fa-circle" style="color: #94a3b8;"></i> ${company.sentiment.neutral}</span>
                            <span><i class="fas fa-circle" style="color: var(--youtube-danger);"></i> ${company.sentiment.bearish}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('topCompaniesGrid').innerHTML = html;
    }

    renderSectorAnalysis() {
        const sectorData = {};
        
        this.marketData.week.forEach(company => {
            if (!sectorData[company.sector]) {
                sectorData[company.sector] = {
                    videoCount: 0,
                    bullish: 0,
                    bearish: 0,
                    neutral: 0,
                    companies: []
                };
            }
            
            sectorData[company.sector].videoCount += company.videoCount;
            sectorData[company.sector].bullish += company.sentiment.bullish;
            sectorData[company.sector].bearish += company.sentiment.bearish;
            sectorData[company.sector].neutral += company.sentiment.neutral;
            sectorData[company.sector].companies.push(company.ticker);
        });
        
        const sectors = Object.keys(sectorData).map(sector => ({
            name: sector,
            ...sectorData[sector],
            sentimentScore: sectorData[sector].videoCount > 0 ? Math.round((sectorData[sector].bullish / sectorData[sector].videoCount) * 100) : 0
        })).sort((a, b) => b.videoCount - a.videoCount);
        
        const html = sectors.map(sector => {
            const sentimentClass = this.getSentimentClass(sector.sentimentScore);
            
            return `
                <div class="company-stat-card">
                    <div class="stat-icon-small" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                        <i class="fas fa-industry"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 8px 0; font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">${sector.name}</h4>
                        <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 12px;">
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                <i class="fas fa-video" style="color: var(--youtube-primary);"></i> ${sector.videoCount} videos
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">
                                <i class="fas fa-building" style="color: var(--youtube-primary);"></i> ${sector.companies.length} companies
                            </div>
                            <div style="font-size: 0.85rem;" class="${sentimentClass}">
                                <i class="fas fa-chart-line"></i> ${sector.sentimentScore}% bullish
                            </div>
                        </div>
                        <div class="sentiment-bar-mini">
                            <div class="sentiment-fill bullish" style="width: ${sector.videoCount > 0 ? (sector.bullish / sector.videoCount) * 100 : 0}%"></div>
                            <div class="sentiment-fill neutral" style="width: ${sector.videoCount > 0 ? (sector.neutral / sector.videoCount) * 100 : 0}%"></div>
                            <div class="sentiment-fill bearish" style="width: ${sector.videoCount > 0 ? (sector.bearish / sector.videoCount) * 100 : 0}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('sectorAnalysisGrid').innerHTML = html || '<p>No sector data available</p>';
    }

    renderSentimentTrends() {
        const html = `
            <div class="empty-state">
                <i class="fas fa-chart-area"></i>
                <h3>Sentiment Trend Chart</h3>
                <p>7-day, 30-day, 90-day, 365-day sentiment evolution</p>
            </div>
        `;
        
        document.getElementById('sentimentTrendsChart').innerHTML = html;
    }

    // ========================================
    // SECTION 2: COMPANY-SPECIFIC SEARCH
    // ========================================
    async searchCompany() {
        const input = document.getElementById('companySearchInput');
        if (!input) {
            console.error('❌ Search input not found');
            return;
        }
        
        const query = input.value.trim();
        
        if (!query) {
            this.showError('Please enter a company name or ticker');
            return;
        }
        
        this.currentCompany = query;
        
        const periodSelector = document.getElementById('periodSelector');
        this.currentPeriod = periodSelector ? periodSelector.value : '1month';
        
        const sortSelector = document.getElementById('videoSortSelector');
        this.currentSort = sortSelector ? sortSelector.value : 'relevance';
        
        const loadingCompany = document.getElementById('loadingCompany');
        if (loadingCompany) {
            loadingCompany.textContent = query;
        }
        
        this.showSection('searchLoadingSection');
        this.hideSection('searchResultsSection');
        
        try {
            const days = this.getPeriodDays(this.currentPeriod);
            const dateFilter = this.getDateFilter(days);
            
            console.log(`🔍 Searching for: ${query}`);
            console.log(`📅 Period: ${this.currentPeriod} (${days} days)`);
            console.log(`📅 Date filter: ${dateFilter}`);
            
            const videos = await this.fetchYouTubeVideos(
                `${query} stock analysis`,
                50,
                this.currentSort,
                dateFilter
            );
            
            const filteredVideos = this.filterVideosByPeriod(videos, days);
            
            this.videosData = filteredVideos;
            
            this.renderCompanyHeader(query);
            this.renderCompanyStats(filteredVideos);
            this.renderVideos(filteredVideos);
            
            this.hideSection('searchLoadingSection');
            this.showSection('searchResultsSection');
            
            const resultsSection = document.getElementById('searchResultsSection');
            if (resultsSection) {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
        } catch (error) {
            console.error('Search error:', error);
            this.hideSection('searchLoadingSection');
            this.showError('An error occurred. Please try again.');
        }
    }

    filterVideosByPeriod(videos, days) {
        const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
        
        return videos.filter(video => {
            const publishedDate = new Date(video.snippet.publishedAt).getTime();
            return publishedDate >= cutoffDate;
        });
    }

    async fetchYouTubeVideos(query, maxResults = 20, order = 'relevance', dateFilter = null) {
        try {
            let url = `${this.workerUrl}/youtube/search?q=${encodeURIComponent(query)}&maxResults=${maxResults}&order=${order}`;
            
            if (dateFilter) {
                url += `&publishedAfter=${dateFilter}`;
            }
            
            console.log(`📡 Fetching YouTube videos: ${url}`);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ YouTube API error (${response.status}):`, errorText);
                throw new Error(`YouTube API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            console.log(`✅ Fetched ${data.items?.length || 0} videos`);
            
            return data.items || [];
            
        } catch (error) {
            console.error('YouTube fetch error:', error);
            return [];
        }
    }

    renderCompanyHeader(company) {
        const html = `
            <div class="company-header-search">
                <div class="company-icon-large">
                    ${company.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3>${company}</h3>
                    <p>YouTube Analysis - ${this.getPeriodLabel(this.currentPeriod)}</p>
                </div>
            </div>
        `;
        
        const headerEl = document.getElementById('companyHeaderSearch');
        if (headerEl) {
            headerEl.innerHTML = html;
        }
    }

    renderCompanyStats(videos) {
        const statsGrid = document.getElementById('companyStatsGrid');
        if (!statsGrid) return;
        
        if (!videos || videos.length === 0) {
            statsGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fab fa-youtube"></i>
                    <p>No videos found for this period</p>
                </div>
            `;
            return;
        }
        
        const sentimentCounts = { bullish: 0, bearish: 0, neutral: 0 };
        
        videos.forEach(video => {
            const sentiment = this.detectSentiment(
                video.snippet.title + ' ' + video.snippet.description
            );
            sentimentCounts[sentiment.toLowerCase()]++;
        });
        
        const totalVideos = videos.length;
        const sentimentScore = totalVideos > 0 ? Math.round((sentimentCounts.bullish / totalVideos) * 100) : 0;
        
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentVideos = videos.filter(v => 
            new Date(v.snippet.publishedAt).getTime() > weekAgo
        ).length;
        
        const statsHTML = `
            <div class="company-stat-card">
                <div class="stat-icon-small" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                    <i class="fas fa-video"></i>
                </div>
                <div>
                    <div class="stat-label">Total Videos</div>
                    <div class="stat-value-large">${totalVideos}</div>
                </div>
            </div>
            
            <div class="company-stat-card">
                <div class="stat-icon-small" style="background: linear-gradient(135deg, #10b981, #059669);">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div>
                    <div class="stat-label">Bullish Sentiment</div>
                    <div class="stat-value-large ${this.getSentimentClass(sentimentScore)}">${sentimentScore}%</div>
                </div>
            </div>
            
            <div class="company-stat-card">
                <div class="stat-icon-small" style="background: linear-gradient(135deg, #f59e0b, #dc2626);">
                    <i class="fas fa-calendar-week"></i>
                </div>
                <div>
                    <div class="stat-label">Last 7 Days</div>
                    <div class="stat-value-large">${recentVideos}</div>
                </div>
            </div>
            
            <div class="company-stat-card">
                <div class="stat-icon-small" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">
                    <i class="fas fa-thumbs-up"></i>
                </div>
                <div>
                    <div class="stat-label">Bullish Videos</div>
                    <div class="stat-value-large" style="color: var(--youtube-success);">${sentimentCounts.bullish}</div>
                </div>
            </div>
        `;
        
        statsGrid.innerHTML = statsHTML;
    }

    renderVideos(videos) {
        const videosGrid = document.getElementById('videosGrid');
        if (!videosGrid) return;
        
        if (!videos || videos.length === 0) {
            videosGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fab fa-youtube"></i>
                    <h3>No videos found</h3>
                    <p>Try changing the period or search term.</p>
                </div>
            `;
            return;
        }
        
        const videosHTML = videos.map(video => {
            const videoId = video.id.videoId;
            const thumbnail = video.snippet.thumbnails.high.url;
            const title = video.snippet.title;
            const channel = video.snippet.channelTitle;
            const publishedAt = new Date(video.snippet.publishedAt).toLocaleDateString();
            const sentiment = this.detectSentiment(title + ' ' + video.snippet.description);
            const sentimentClass = sentiment.toLowerCase();
            
            return `
                <div class="video-card" onclick="window.open('https://youtube.com/watch?v=${videoId}', '_blank')">
                    <div class="video-thumbnail-wrapper">
                        <img src="${thumbnail}" alt="${this.escapeHtml(title)}" class="video-thumbnail">
                        <div class="video-play-icon">
                            <i class="fas fa-play"></i>
                        </div>
                        <div class="video-sentiment-badge ${sentimentClass}">
                            ${sentiment}
                        </div>
                    </div>
                    <div class="video-content">
                        <h4 class="video-title">${this.escapeHtml(title)}</h4>
                        <p class="video-channel"><i class="fas fa-user-circle"></i> ${this.escapeHtml(channel)}</p>
                        <div class="video-stats">
                            <div class="video-stat">
                                <i class="fas fa-calendar"></i> ${publishedAt}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        videosGrid.innerHTML = videosHTML;
    }

    // ========================================
    // HELPER METHODS
    // ========================================
    detectSentiment(text) {
        const bullishWords = ['buy', 'bullish', 'growth', 'profit', 'surge', 'record', 'strong', 'opportunity', 'breakout', 'moon', 'rally', 'upgrade', 'beat', 'soar', 'rise', 'explode', 'rocket'];
        const bearishWords = ['sell', 'bearish', 'loss', 'decline', 'drop', 'crash', 'weak', 'fall', 'warning', 'collapse', 'downgrade', 'miss', 'plunge', 'tank', 'dump'];
        
        const lowerText = text.toLowerCase();
        const bullishCount = bullishWords.filter(word => lowerText.includes(word)).length;
        const bearishCount = bearishWords.filter(word => lowerText.includes(word)).length;
        
        if (bullishCount > bearishCount) return 'Bullish';
        if (bearishCount > bullishCount) return 'Bearish';
        return 'Neutral';
    }

    getTrendIcon(level) {
        const icons = {
            'Very High': '<i class="fas fa-fire" style="color: #dc2626;"></i>',
            'High': '<i class="fas fa-arrow-trend-up" style="color: #f59e0b;"></i>',
            'Moderate': '<i class="fas fa-minus" style="color: #8b5cf6;"></i>',
            'Low': '<i class="fas fa-arrow-trend-down" style="color: #64748b;"></i>',
            'Very Low': '<i class="fas fa-circle" style="color: #94a3b8;"></i>'
        };
        
        return icons[level] || icons['Low'];
    }

    getSentimentClass(score) {
        if (score >= 60) return 'sentiment-bullish';
        if (score >= 40) return 'sentiment-neutral';
        return 'sentiment-bearish';
    }

    getPeriodDays(period) {
        const periods = {
            '7days': 7,
            '1month': 30,
            '3months': 90,
            '6months': 180,
            '1year': 365
        };
        
        return periods[period] || 30;
    }

    getPeriodLabel(period) {
        const labels = {
            '7days': 'Last 7 Days',
            '1month': 'Last Month',
            '3months': 'Last 3 Months',
            '6months': 'Last 6 Months',
            '1year': 'Last Year'
        };
        
        return labels[period] || 'Last Month';
    }

    getDateFilter(days) {
        const now = new Date();
        const pastDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        const isoDate = pastDate.toISOString();
        
        console.log(`📅 Calculating date filter:`);
        console.log(`   Now: ${now.toISOString()}`);
        console.log(`   ${days} days ago: ${isoDate}`);
        
        return isoDate;
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    handleSearchInput() {
        const input = document.getElementById('companySearchInput');
        const clearBtn = document.querySelector('.search-clear-btn');
        
        if (input && clearBtn) {
            if (input.value.length > 0) {
                clearBtn.style.display = 'flex';
            } else {
                clearBtn.style.display = 'none';
            }
        }
    }

    clearSearch() {
        const input = document.getElementById('companySearchInput');
        const clearBtn = document.querySelector('.search-clear-btn');
        
        if (input) input.value = '';
        if (clearBtn) clearBtn.style.display = 'none';
        
        this.hideSection('searchResultsSection');
    }

    changePeriod(period) {
        document.querySelectorAll('.time-btn').forEach(tab => tab.classList.remove('active'));
        event.target.classList.add('active');
        this.renderTopCompanies(period);
    }

    sortVideos() {
        if (this.currentCompany) {
            this.searchCompany();
        }
    }

    showSection(id) {
        const section = document.getElementById(id);
        if (section) section.style.display = 'block';
    }

    hideSection(id) {
        const section = document.getElementById(id);
        if (section) section.style.display = 'none';
    }

    showError(message) {
        alert(message);
    }
}

// ========================================
// INITIALIZATION
// ========================================
const companyResearch = new YouTubeMarketIntelligence();