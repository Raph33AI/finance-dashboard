/**
 * ====================================================================
 * ALPHAVAULT AI - YOUTUBE MARKET INTELLIGENCE ENGINE
 * ====================================================================
 * Version: 3.0 Ultra - Dual Mode System
 * Section 1: Global Market Dashboard (Top Trending Companies)
 * Section 2: Company-Specific Deep Dive
 */

class YouTubeMarketIntelligence {
    constructor() {
        this.workerUrl = 'https://google-apis-proxy.raphnardone.workers.dev';
        
        // Market Data Storage
        this.marketData = {
            week: [],
            month: [],
            quarter: []
        };
        
        // Search Data Storage
        this.currentCompany = null;
        this.currentPeriod = '1month';
        this.currentSort = 'relevance';
        this.videosData = [];
        
        // Top Companies to Track (S&P 500 + Popular Stocks)
        this.topCompanies = [
            { name: 'Apple', ticker: 'AAPL', sector: 'Technology' },
            { name: 'Microsoft', ticker: 'MSFT', sector: 'Technology' },
            { name: 'Nvidia', ticker: 'NVDA', sector: 'Technology' },
            { name: 'Tesla', ticker: 'TSLA', sector: 'Automotive' },
            { name: 'Amazon', ticker: 'AMZN', sector: 'E-commerce' },
            { name: 'Meta', ticker: 'META', sector: 'Social Media' },
            { name: 'Alphabet', ticker: 'GOOGL', sector: 'Technology' },
            { name: 'Berkshire Hathaway', ticker: 'BRK.B', sector: 'Finance' },
            { name: 'Visa', ticker: 'V', sector: 'Finance' },
            { name: 'JPMorgan', ticker: 'JPM', sector: 'Banking' },
            { name: 'Johnson & Johnson', ticker: 'JNJ', sector: 'Healthcare' },
            { name: 'Walmart', ticker: 'WMT', sector: 'Retail' },
            { name: 'Mastercard', ticker: 'MA', sector: 'Finance' },
            { name: 'Procter & Gamble', ticker: 'PG', sector: 'Consumer' },
            { name: 'Netflix', ticker: 'NFLX', sector: 'Entertainment' },
            { name: 'AMD', ticker: 'AMD', sector: 'Technology' },
            { name: 'Palantir', ticker: 'PLTR', sector: 'Technology' },
            { name: 'Coinbase', ticker: 'COIN', sector: 'Crypto' },
            { name: 'Snowflake', ticker: 'SNOW', sector: 'Technology' },
            { name: 'Rivian', ticker: 'RIVN', sector: 'Automotive' }
        ];
        
        this.init();
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    init() {
        console.log('🚀 YouTube Market Intelligence Engine v3.0 initialized');
        
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
        
        try {
            // Fetch data for all time periods in parallel
            const [weekData, monthData, quarterData] = await Promise.all([
                this.fetchMarketDataForPeriod('7days'),
                this.fetchMarketDataForPeriod('1month'),
                this.fetchMarketDataForPeriod('3months')
            ]);
            
            this.marketData.week = weekData;
            this.marketData.month = monthData;
            this.marketData.quarter = quarterData;
            
            // Render Dashboard
            this.renderGlobalStats();
            this.renderTopCompanies('week');
            this.renderSectorAnalysis();
            this.renderSentimentTrends();
            
            this.hideSection('globalLoadingSection');
            this.showSection('globalDashboardSection');
            
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
            '3months': 90
        };
        
        const days = periodDays[period] || 30;
        const dateFilter = this.getDateFilter(days);
        
        const allCompaniesData = [];
        
        // Fetch data for each company (limit to 10 for demo to avoid quota issues)
        const companiesSubset = this.topCompanies.slice(0, 10);
        
        for (const company of companiesSubset) {
            try {
                const videos = await this.fetchYouTubeVideos(
                    `${company.ticker} stock analysis`,
                    10,
                    'date',
                    dateFilter
                );
                
                const analysis = this.analyzeCompanyVideos(company, videos, period);
                allCompaniesData.push(analysis);
                
                // Small delay to avoid rate limiting
                await this.sleep(200);
                
            } catch (error) {
                console.warn(`⚠ Failed to fetch data for ${company.ticker}:`, error);
            }
        }
        
        // Sort by popularity score
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
                videos: []
            };
        }
        
        // Sentiment Analysis
        const sentimentCounts = { bullish: 0, bearish: 0, neutral: 0 };
        let totalEngagement = 0;
        
        videos.forEach(video => {
            const sentiment = this.detectSentiment(
                video.snippet.title + ' ' + video.snippet.description
            );
            sentimentCounts[sentiment.toLowerCase()]++;
        });
        
        const totalVideos = videos.length;
        
        // Calculate Scores (0-100)
        const sentimentScore = this.calculateSentimentScore(sentimentCounts, totalVideos);
        const popularityScore = this.calculatePopularityScore(totalVideos, period);
        const momentumScore = this.calculateMomentumScore(videos);
        const engagementScore = this.calculateEngagementScore(videos);
        
        // Overall Trending Level
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
            videos: videos.slice(0, 3) // Keep top 3 videos
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
        // Expected videos per period (baseline)
        const baseline = {
            '7days': 5,
            '1month': 15,
            '3months': 40
        };
        
        const expected = baseline[period] || 15;
        const score = Math.min((videoCount / expected) * 100, 100);
        
        return score;
    }

    calculateMomentumScore(videos) {
        if (!videos || videos.length < 2) return 0;
        
        // Sort by date
        const sortedVideos = [...videos].sort((a, b) => 
            new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
        );
        
        const now = Date.now();
        const recentCount = sortedVideos.filter(v => 
            (now - new Date(v.snippet.publishedAt).getTime()) < (7 * 24 * 60 * 60 * 1000)
        ).length;
        
        const olderCount = videos.length - recentCount;
        
        if (olderCount === 0) return 100; // All recent = high momentum
        
        const momentumRatio = recentCount / olderCount;
        return Math.min(momentumRatio * 50, 100);
    }

    calculateEngagementScore(videos) {
        // Placeholder: would need video details API call for real engagement
        // For now, use video count as proxy
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
                    <div class="stat-value">${weekTotal}</div>
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
                <div class="stat-icon" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-label">Quarter Total</div>
                    <div class="stat-value">${quarterTotal}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-chart-bar"></i> 3 Months
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
                    <i class="fas fa-chart-line" style="font-size: 3rem; color: #94a3b8; margin-bottom: 12px;"></i>
                    <p>No data available for this period</p>
                </div>
            `;
            return;
        }
        
        const html = data.slice(0, 10).map((company, index) => {
            const trendIcon = this.getTrendIcon(company.trendingLevel);
            const sentimentClass = this.getSentimentClass(company.sentimentScore);
            
            return `
                <div class="company-rank-card" onclick="document.getElementById('companySearchInput').value='${company.ticker}'; companyResearch.searchCompany();">
                    <div class="rank-badge rank-${index + 1}">
                        ${index + 1}
                    </div>
                    
                    <div class="company-info-compact">
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
                            <span><i class="fas fa-circle" style="color: var(--forex-success);"></i> ${company.sentiment.bullish}</span>
                            <span><i class="fas fa-circle" style="color: #94a3b8;"></i> ${company.sentiment.neutral}</span>
                            <span><i class="fas fa-circle" style="color: var(--forex-danger);"></i> ${company.sentiment.bearish}</span>
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
                <div class="sector-card">
                    <div class="sector-header">
                        <h4>${sector.name}</h4>
                        <div class="sector-sentiment ${sentimentClass}">
                            ${sector.sentimentScore}%
                        </div>
                    </div>
                    <div class="sector-stats">
                        <div class="sector-stat">
                            <i class="fas fa-video"></i>
                            <span>${sector.videoCount} videos</span>
                        </div>
                        <div class="sector-stat">
                            <i class="fas fa-building"></i>
                            <span>${sector.companies.length} companies</span>
                        </div>
                    </div>
                    <div class="sector-sentiment-bar">
                        <div class="sentiment-fill bullish" style="width: ${(sector.bullish / sector.videoCount) * 100}%"></div>
                        <div class="sentiment-fill neutral" style="width: ${(sector.neutral / sector.videoCount) * 100}%"></div>
                        <div class="sentiment-fill bearish" style="width: ${(sector.bearish / sector.videoCount) * 100}%"></div>
                    </div>
                    <div class="sector-companies">
                        ${sector.companies.slice(0, 5).join(', ')}${sector.companies.length > 5 ? '...' : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('sectorAnalysisGrid').innerHTML = html || '<p>No sector data available</p>';
    }

    renderSentimentTrends() {
        // Placeholder for sentiment trend chart
        const html = `
            <div class="sentiment-trend-placeholder">
                <i class="fas fa-chart-area" style="font-size: 3rem; color: #94a3b8; margin-bottom: 16px;"></i>
                <h4>Sentiment Trend Chart</h4>
                <p>7-day, 30-day, 90-day sentiment evolution</p>
                <p style="font-size: 0.9rem; color: var(--text-tertiary); margin-top: 8px;">
                    Chart.js integration coming soon
                </p>
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
        this.currentPeriod = document.getElementById('periodSelector').value || '1month';
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
            
            this.videosData = videos;
            
            this.renderCompanyHeader(query);
            this.renderCompanyStats(videos);
            this.renderVideos(videos);
            
            this.hideSection('searchLoadingSection');
            this.showSection('searchResultsSection');
            
            // Scroll to results
            document.getElementById('searchResultsSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error('Search error:', error);
            this.hideSection('searchLoadingSection');
            this.showError('An error occurred. Please try again.');
        }
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
                    <i class="fab fa-youtube" style="font-size: 3rem; color: #ef4444; margin-bottom: 12px;"></i>
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
        
        // Recent videos (last 7 days)
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
                    <div class="stat-value-large" style="color: var(--forex-success);">${sentimentCounts.bullish}</div>
                </div>
            </div>
        `;
        
        document.getElementById('companyStatsGrid').innerHTML = statsHTML;
    }

    renderVideos(videos) {
        if (!videos || videos.length === 0) {
            document.getElementById('videosGrid').innerHTML = `
                <div class="empty-state">
                    <i class="fab fa-youtube" style="font-size: 4rem; color: #ef4444; margin-bottom: 16px;"></i>
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
        const bullishWords = ['buy', 'bullish', 'growth', 'profit', 'surge', 'record', 'strong', 'opportunity', 'breakout', 'moon', 'rally', 'upgrade', 'beat', 'soar', 'rise'];
        const bearishWords = ['sell', 'bearish', 'loss', 'decline', 'drop', 'crash', 'weak', 'fall', 'warning', 'collapse', 'downgrade', 'miss', 'plunge', 'tank'];
        
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
        document.querySelectorAll('.period-tab').forEach(tab => tab.classList.remove('active'));
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