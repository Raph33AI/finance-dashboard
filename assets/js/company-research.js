/**
 * ====================================================================
 * ALPHAVAULT AI - COMPANY RESEARCH ENGINE
 * ====================================================================
 * Intègre Google Custom Search API + YouTube Data API v3
 */

class CompanyResearch {
    constructor() {
        // ⚠ REMPLACER PAR VOTRE URL DE WORKER CLOUDFLARE
        this.workerUrl = 'https://google-apis-proxy.raphnardone.workers.dev';
        
        this.currentCompany = null;
        this.newsData = [];
        this.videosData = [];
        
        this.init();
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    init() {
        console.log('🚀 Company Research Engine initialized');
        
        // Auto-suggestions
        const input = document.getElementById('companySearchInput');
        if (input) {
            input.addEventListener('input', () => this.handleInput());
        }
    }

    // ========================================
    // SEARCH COMPANY
    // ========================================
    async search() {
        const input = document.getElementById('companySearchInput');
        const query = input.value.trim();
        
        if (!query) {
            this.showError('Please enter a company name or ticker');
            return;
        }
        
        this.currentCompany = query;
        document.getElementById('loadingCompany').textContent = query;
        
        // Show loading, hide other sections
        this.showSection('loadingSection');
        this.hideSection('overviewSection');
        this.hideSection('marketAnalysisSection');
        this.hideSection('newsSection');
        this.hideSection('youtubeSection');
        
        try {
            // Parallel API calls
            await Promise.all([
                this.fetchCompanyData(query),
                this.fetchNews(query),
                this.fetchYouTubeData(query)
            ]);
            
            // Hide loading, show results
            this.hideSection('loadingSection');
            this.showSection('overviewSection');
            this.showSection('marketAnalysisSection');
            this.showSection('newsSection');
            this.showSection('youtubeSection');
            
        } catch (error) {
            console.error('Search error:', error);
            this.hideSection('loadingSection');
            this.showError('An error occurred. Please try again.');
        }
    }

    // ========================================
    // FETCH COMPANY DATA (Google Search)
    // ========================================
    async fetchCompanyData(query) {
        try {
            const response = await fetch(
                `${this.workerUrl}/search?q=${encodeURIComponent(query + ' stock company overview')}&num=10`
            );
            
            if (!response.ok) {
                throw new Error('Google Search API error');
            }
            
            const data = await response.json();
            
            // Extract company info from search results
            this.renderCompanyOverview(query, data);
            this.renderMarketAnalysis(query, data);
            
        } catch (error) {
            console.error('Company data fetch error:', error);
            throw error;
        }
    }

    // ========================================
    // FETCH NEWS (Google Search)
    // ========================================
    async fetchNews(query) {
        try {
            const response = await fetch(
                `${this.workerUrl}/search?q=${encodeURIComponent(query + ' stock news analysis')}&num=10`
            );
            
            if (!response.ok) {
                throw new Error('News fetch error');
            }
            
            const data = await response.json();
            this.newsData = data.items || [];
            
            this.renderNews(this.newsData);
            
        } catch (error) {
            console.error('News fetch error:', error);
            this.renderNews([]);
        }
    }

    // ========================================
    // FETCH YOUTUBE DATA
    // ========================================
    async fetchYouTubeData(query) {
        try {
            const response = await fetch(
                `${this.workerUrl}/youtube/search?q=${encodeURIComponent(query + ' stock analysis')}&maxResults=20&order=viewCount`
            );
            
            if (!response.ok) {
                throw new Error('YouTube API error');
            }
            
            const data = await response.json();
            this.videosData = data.items || [];
            
            this.renderYouTubeStats(this.videosData);
            this.renderVideos(this.videosData);
            
        } catch (error) {
            console.error('YouTube fetch error:', error);
            this.renderYouTubeStats([]);
            this.renderVideos([]);
        }
    }

    // ========================================
    // RENDER COMPANY OVERVIEW
    // ========================================
    renderCompanyOverview(companyName, searchData) {
        const headerHTML = `
            <div class="company-info">
                <h2>${companyName}</h2>
                <p>${searchData.searchInformation?.totalResults || '0'} results found • ${searchData.searchInformation?.searchTime || '0'}s</p>
            </div>
        `;
        
        document.getElementById('companyHeader').innerHTML = headerHTML;
        
        // Mock metrics (you can enhance with real data from APIs)
        const metricsHTML = `
            <div class="metric-card">
                <div class="metric-label">
                    <i class="fas fa-chart-line"></i> Market Cap
                </div>
                <div class="metric-value">$2.5T</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">
                    <i class="fas fa-dollar-sign"></i> Stock Price
                </div>
                <div class="metric-value">$185.50</div>
                <div class="metric-change positive">
                    <i class="fas fa-arrow-up"></i> +2.3%
                </div>
            </div>
            <div class="metric-card">
                <div class="metric-label">
                    <i class="fas fa-chart-pie"></i> P/E Ratio
                </div>
                <div class="metric-value">28.5</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">
                    <i class="fas fa-percentage"></i> Dividend Yield
                </div>
                <div class="metric-value">0.5%</div>
            </div>
        `;
        
        document.getElementById('companyMetrics').innerHTML = metricsHTML;
    }

    // ========================================
    // RENDER MARKET ANALYSIS
    // ========================================
    renderMarketAnalysis(companyName, searchData) {
        // Sector Performance Chart (Highcharts)
        Highcharts.chart('sectorChart', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                categories: ['Tech', 'Finance', 'Healthcare', 'Energy', 'Consumer']
            },
            yAxis: {
                title: { text: 'Performance (%)' }
            },
            series: [{
                name: 'YTD Return',
                data: [15.2, 8.5, 12.3, -2.1, 10.8],
                color: '#3b82f6'
            }],
            credits: { enabled: false }
        });
        
        // Sentiment Gauge (Highcharts)
        Highcharts.chart('sentimentGauge', {
            chart: {
                type: 'solidgauge',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            pane: {
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor: '#e5e7eb',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
            yAxis: {
                min: 0,
                max: 100,
                stops: [
                    [0.3, '#ef4444'],
                    [0.5, '#f59e0b'],
                    [0.7, '#10b981']
                ],
                lineWidth: 0,
                tickWidth: 0,
                minorTickInterval: null,
                tickAmount: 2,
                labels: { y: 16 }
            },
            series: [{
                name: 'Sentiment',
                data: [72],
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:25px">{y}</span><br/>' +
                           '<span style="font-size:12px;opacity:0.4">Bullish</span></div>'
                }
            }],
            credits: { enabled: false }
        });
        
        // Competitive Positioning (Highcharts)
        Highcharts.chart('competitiveChart', {
            chart: {
                type: 'scatter',
                backgroundColor: 'transparent'
            },
            title: { text: 'Market Cap vs. Growth Rate' },
            xAxis: {
                title: { text: 'Market Cap (Billions)' }
            },
            yAxis: {
                title: { text: 'Revenue Growth (%)' }
            },
            series: [{
                name: companyName,
                data: [[2500, 15]],
                color: '#3b82f6',
                marker: { radius: 10 }
            }, {
                name: 'Competitors',
                data: [[1800, 12], [900, 18], [1200, 8], [600, 22]],
                color: '#8b5cf6',
                marker: { radius: 6 }
            }],
            credits: { enabled: false }
        });
    }

    // ========================================
    // RENDER NEWS
    // ========================================
    renderNews(articles) {
        if (!articles || articles.length === 0) {
            document.getElementById('newsGrid').innerHTML = '<p>No news found.</p>';
            return;
        }
        
        const newsHTML = articles.map(article => {
            const sentiment = this.detectSentiment(article.title + ' ' + article.snippet);
            const sentimentClass = sentiment.toLowerCase();
            
            return `
                <div class="news-card" onclick="window.open('${article.link}', '_blank')">
                    <div class="news-header">
                        <div class="news-source">${article.displayLink}</div>
                        <div class="news-sentiment ${sentimentClass}">${sentiment}</div>
                    </div>
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-snippet">${article.snippet}</p>
                    <div class="news-footer">
                        <span class="news-date">${new Date().toLocaleDateString()}</span>
                        <a href="${article.link}" class="news-link" target="_blank">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('newsGrid').innerHTML = newsHTML;
    }

    // ========================================
    // RENDER YOUTUBE STATS
    // ========================================
    renderYouTubeStats(videos) {
        const totalVideos = videos.length;
        const totalViews = videos.reduce((sum, v) => sum + (v.statistics?.viewCount || 0), 0);
        
        const statsHTML = `
            <div class="youtube-stat-card">
                <div class="youtube-stat-icon">🎥</div>
                <div class="youtube-stat-value">${totalVideos}</div>
                <div class="youtube-stat-label">Total Videos</div>
            </div>
            <div class="youtube-stat-card">
                <div class="youtube-stat-icon">👁</div>
                <div class="youtube-stat-value">${this.formatNumber(totalViews)}</div>
                <div class="youtube-stat-label">Total Views</div>
            </div>
            <div class="youtube-stat-card">
                <div class="youtube-stat-icon">📈</div>
                <div class="youtube-stat-value">${this.calculateEngagementRate(videos)}%</div>
                <div class="youtube-stat-label">Engagement</div>
            </div>
            <div class="youtube-stat-card">
                <div class="youtube-stat-icon">⭐</div>
                <div class="youtube-stat-value">${this.calculateSentimentScore(videos)}%</div>
                <div class="youtube-stat-label">Positive Sentiment</div>
            </div>
        `;
        
        document.getElementById('youtubeStats').innerHTML = statsHTML;
    }

    // ========================================
    // RENDER VIDEOS
    // ========================================
    renderVideos(videos) {
        if (!videos || videos.length === 0) {
            document.getElementById('videosGrid').innerHTML = '<p>No videos found.</p>';
            return;
        }
        
        const videosHTML = videos.map(video => {
            const videoId = video.id.videoId;
            const thumbnail = video.snippet.thumbnails.high.url;
            const title = video.snippet.title;
            const channel = video.snippet.channelTitle;
            const publishedAt = new Date(video.snippet.publishedAt).toLocaleDateString();
            
            return `
                <div class="video-card" onclick="window.open('https://youtube.com/watch?v=${videoId}', '_blank')">
                    <div class="video-thumbnail-wrapper">
                        <img src="${thumbnail}" alt="${title}" class="video-thumbnail">
                        <div class="video-play-icon">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                    <div class="video-content">
                        <h4 class="video-title">${title}</h4>
                        <p class="video-channel"><i class="fas fa-user-circle"></i> ${channel}</p>
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
        const bullishWords = ['growth', 'profit', 'surge', 'record', 'strong', 'bullish', 'buy'];
        const bearishWords = ['loss', 'decline', 'drop', 'bearish', 'sell', 'weak', 'fall'];
        
        const lowerText = text.toLowerCase();
        const bullishCount = bullishWords.filter(word => lowerText.includes(word)).length;
        const bearishCount = bearishWords.filter(word => lowerText.includes(word)).length;
        
        if (bullishCount > bearishCount) return 'Bullish';
        if (bearishCount > bullishCount) return 'Bearish';
        return 'Neutral';
    }

    formatNumber(num) {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    calculateEngagementRate(videos) {
        // Mock calculation
        return (Math.random() * 15 + 5).toFixed(1);
    }

    calculateSentimentScore(videos) {
        // Mock calculation
        return (Math.random() * 30 + 60).toFixed(0);
    }

    handleInput() {
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
    }

    filterNews(filter) {
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Filter logic (you can enhance this)
        this.renderNews(this.newsData);
    }

    sortVideos() {
        const sortBy = document.getElementById('videoSortSelector').value;
        // Sort logic (you can enhance this)
        this.renderVideos(this.videosData);
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
        alert(message); // You can enhance with a custom modal
    }

    exportReport() {
        alert('Export functionality coming soon!');
    }

    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('active');
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.classList.remove('active');
    }
}

// ========================================
// INITIALIZATION
// ========================================
const companyResearch = new CompanyResearch();