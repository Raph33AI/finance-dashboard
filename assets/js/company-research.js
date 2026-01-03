/**
 * ====================================================================
 * ALPHAVAULT AI - YOUTUBE MARKET INTELLIGENCE ENGINE
 * ====================================================================
 * Version: 4.0 Ultra - Full Data Display avec Logos
 */

class YouTubeMarketIntelligence {
    constructor() {
        this.workerUrl = 'https://google-apis-proxy.raphnardone.workers.dev';
        
        // Market Data Storage
        this.marketData = {
            week: [],
            month: [],
            quarter: [],
            year: [] // ✅ NOUVEAU: Données 1 an
        };
        
        // Search Data Storage
        this.currentCompany = null;
        this.currentPeriod = '1month';
        this.currentSort = 'relevance';
        this.videosData = [];
        
        // Top Companies avec tickers et secteurs
        this.topCompanies = [
            { name: 'Apple', ticker: 'AAPL', sector: 'Technology', domain: 'apple.com' },
            { name: 'Microsoft', ticker: 'MSFT', sector: 'Technology', domain: 'microsoft.com' },
            { name: 'Nvidia', ticker: 'NVDA', sector: 'Technology', domain: 'nvidia.com' },
            { name: 'Tesla', ticker: 'TSLA', sector: 'Automotive', domain: 'tesla.com' },
            { name: 'Amazon', ticker: 'AMZN', sector: 'E-commerce', domain: 'amazon.com' },
            { name: 'Meta', ticker: 'META', sector: 'Social Media', domain: 'meta.com' },
            { name: 'Alphabet', ticker: 'GOOGL', sector: 'Technology', domain: 'abc.xyz' },
            { name: 'Netflix', ticker: 'NFLX', sector: 'Entertainment', domain: 'netflix.com' },
            { name: 'AMD', ticker: 'AMD', sector: 'Technology', domain: 'amd.com' },
            { name: 'Palantir', ticker: 'PLTR', sector: 'Technology', domain: 'palantir.com' },
            { name: 'Coinbase', ticker: 'COIN', sector: 'Crypto', domain: 'coinbase.com' },
            { name: 'Snowflake', ticker: 'SNOW', sector: 'Technology', domain: 'snowflake.com' },
            { name: 'Rivian', ticker: 'RIVN', sector: 'Automotive', domain: 'rivian.com' },
            { name: 'Salesforce', ticker: 'CRM', sector: 'Technology', domain: 'salesforce.com' },
            { name: 'Adobe', ticker: 'ADBE', sector: 'Technology', domain: 'adobe.com' }
        ];
        
        this.init();
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    init() {
        console.log('🚀 YouTube Market Intelligence Engine v4.0 initialized');
        
        // Event Listeners
        const searchInput = document.getElementById('companySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.handleSearchInput());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchCompany();
            });
        }
        
        const periodSelector = document.getElementById('periodSelectorSearch');
        if (periodSelector) {
            periodSelector.addEventListener('change', () => {
                if (this.currentCompany) this.searchCompany();
            });
        }
        
        // ✅ Supprimer le bouton View Trends
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
            // ✅ Charger données 1 an au lieu de 3 mois
            const [weekData, monthData, quarterData, yearData] = await Promise.all([
                this.fetchMarketDataForPeriod('7days'),
                this.fetchMarketDataForPeriod('1month'),
                this.fetchMarketDataForPeriod('3months'),
                this.fetchMarketDataForPeriod('1year') // ✅ NOUVEAU
            ]);
            
            this.marketData.week = weekData;
            this.marketData.month = monthData;
            this.marketData.quarter = quarterData;
            this.marketData.year = yearData; // ✅ NOUVEAU
            
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
            this.showError('Failed to load global dashboard. Please try again.');
        }
    }

    async fetchMarketDataForPeriod(period) {
        const periodDays = {
            '7days': 7,
            '1month': 30,
            '3months': 90,
            '1year': 365 // ✅ NOUVEAU
        };
        
        const days = periodDays[period] || 30;
        const dateFilter = this.getDateFilter(days);
        
        const allCompaniesData = [];
        
        // Fetch data pour chaque entreprise (limité à 15 pour éviter quota)
        const companiesSubset = this.topCompanies.slice(0, 15);
        
        for (const company of companiesSubset) {
            try {
                const videos = await this.fetchYouTubeVideos(
                    `${company.ticker} stock analysis`,
                    20, // Plus de vidéos
                    'date',
                    dateFilter
                );
                
                const analysis = this.analyzeCompanyVideos(company, videos, period);
                allCompaniesData.push(analysis);
                
                // Small delay
                await this.sleep(150);
                
            } catch (error) {
                console.warn(`⚠ Failed to fetch data for ${company.ticker}:`, error);
            }
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
        
        // Calculate Scores
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

    // ✅ NOUVEAU: Système de logos multi-fallback
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
            '7days': 5,
            '1month': 15,
            '3months': 40,
            '1year': 120 // ✅ NOUVEAU
        };
        
        const expected = baseline[period] || 15;
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
        const yearTotal = this.marketData.year.reduce((sum, c) => sum + c.videoCount, 0); // ✅ NOUVEAU
        
        const weekBullish = this.marketData.week.reduce((sum, c) => sum + c.sentiment.bullish, 0);
        const weekTotal_videos = this.marketData.week.reduce((sum, c) => sum + c.videoCount, 0);
        const marketSentiment = weekTotal_videos > 0 ? Math.round((weekBullish / weekTotal_videos) * 100) : 0;
        
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
                        <i class="fas fa-arrow-up"></i> ${Math.round((weekTotal / monthTotal) * 100)}% of month
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
            
            // ✅ Logos avec fallback
            const logoHtml = company.logoUrl 
                ? `<img src="${company.logoUrl.primary}" alt="${company.name}" onerror="this.onerror=null; this.parentElement.innerHTML='${initials}';">`
                : initials;
            
            return `
                <div class="company-rank-card" onclick="document.getElementById('companySearchInput').value='${company.ticker}'; companyResearch.searchCompany();">
                    <div class="rank-badge rank-${index + 1}">
                        ${index + 1}
                    </div>
                    
                    <div class="company-info-compact">
                        <div class="company-logo-compact">
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
                            <div class="sentiment-fill bullish" style="width: ${(company.sentiment.bullish / company.videoCount) * 100}%"></div>
                            <div class="sentiment-fill neutral" style="width: ${(company.sentiment.neutral / company.videoCount) * 100}%"></div>
                            <div class="sentiment-fill bearish" style="width: ${(company.sentiment.bearish / company.videoCount) * 100}%"></div>
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
            sentimentScore: Math.round((sectorData[sector].bullish / sectorData[sector].videoCount) * 100) || 0
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
                            <div class="sentiment-fill bullish" style="width: ${(sector.bullish / sector.videoCount) * 100}%"></div>
                            <div class="sentiment-fill neutral" style="width: ${(sector.neutral / sector.videoCount) * 100}%"></div>
                            <div class="sentiment-fill bearish" style="width: ${(sector.bearish / sector.videoCount) * 100}%"></div>
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
        const query = input.value.trim();
        
        if (!query) {
            this.showError('Please enter a company name or ticker');
            return;
        }
        
        this.currentCompany = query;
        this.currentPeriod = document.getElementById('periodSelectorSearch').value || '1month';
        this.currentSort = document.getElementById('videoSortSelector').value || 'relevance';
        
        document.getElementById('loadingCompany').textContent = query;
        
        this.showSection('searchLoadingSection');
        this.hideSection('searchResultsSection');
        
        try {
            const days = this.getPeriodDays(this.currentPeriod);
            const dateFilter = this.getDateFilter(days);
            
            const videos = await this.fetchYouTubeVideos(
                `${query} stock analysis`,
                50,
                this.currentSort,
                dateFilter
            );
            
            // ✅ CORRECTION FILTRE: Vérifier que les vidéos sont bien dans la période
            const filteredVideos = this.filterVideosByPeriod(videos, days);
            
            this.videosData = filteredVideos;
            
            this.renderCompanyHeader(query);
            this.renderCompanyStats(filteredVideos);
            this.renderVideos(filteredVideos);
            
            this.hideSection('searchLoadingSection');
            this.showSection('searchResultsSection');
            
            document.getElementById('searchResultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error('Search error:', error);
            this.hideSection('searchLoadingSection');
            this.showError('An error occurred. Please try again.');
        }
    }

    // ✅ NOUVEAU: Filtrage strict des vidéos par période
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
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('YouTube API error');
            }
            
            const data = await response.json();
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
        
        document.getElementById('companyHeaderSearch').innerHTML = html;
    }

    renderCompanyStats(videos) {
        if (!videos || videos.length === 0) {
            document.getElementById('companyStatsGrid').innerHTML = `
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
        const sentimentScore = Math.round((sentimentCounts.bullish / totalVideos) * 100);
        
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
        
        document.getElementById('companyStatsGrid').innerHTML = statsHTML;
    }

    renderVideos(videos) {
        if (!videos || videos.length === 0) {
            document.getElementById('videosGrid').innerHTML = `
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
        
        document.getElementById('videosGrid').innerHTML = videosHTML;
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
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString();
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
        
        if (input.value.length > 0) {
            clearBtn.style.display = 'block';
        } else {
            clearBtn.style.display = 'none';
        }
    }

    clearSearch() {
        document.getElementById('companySearchInput').value = '';
        document.querySelector('.search-clear-btn').style.display = 'none';
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