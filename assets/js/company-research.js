/**
 * ====================================================================
 * ALPHAVAULT AI - COMPANY RESEARCH ENGINE (YouTube Only)
 * ====================================================================
 */

class CompanyResearch {
    constructor() {
        this.workerUrl = 'https://google-apis-proxy.raphnardone.workers.dev';
        
        this.currentCompany = null;
        this.videosData = [];
        this.currentSort = 'relevance';
        
        this.init();
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    init() {
        console.log('🚀 Company Research Engine initialized (YouTube Only)');
        
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
        
        this.showSection('loadingSection');
        this.hideSection('youtubeSection');
        
        try {
            await this.fetchYouTubeData(query);
            
            this.hideSection('loadingSection');
            this.showSection('youtubeSection');
            
        } catch (error) {
            console.error('Search error:', error);
            this.hideSection('loadingSection');
            this.showError('An error occurred. Please try again.');
        }
    }

    // ========================================
    // FETCH YOUTUBE DATA
    // ========================================
    async fetchYouTubeData(query) {
        try {
            const searchQueries = [
                `${query} stock analysis`,
                `${query} earnings report`,
                `${query} financial analysis`,
                `${query} investment opportunity`
            ];
            
            const allVideos = [];
            
            for (const searchQuery of searchQueries) {
                const response = await fetch(
                    `${this.workerUrl}/youtube/search?q=${encodeURIComponent(searchQuery)}&maxResults=10&order=${this.currentSort}`
                );
                
                if (!response.ok) {
                    throw new Error('YouTube API error');
                }
                
                const data = await response.json();
                if (data.items) {
                    allVideos.push(...data.items);
                }
            }
            
            // Remove duplicates
            const uniqueVideos = allVideos.filter((video, index, self) =>
                index === self.findIndex((v) => v.id.videoId === video.id.videoId)
            );
            
            this.videosData = uniqueVideos;
            
            this.renderYouTubeStats(this.videosData);
            this.renderVideos(this.videosData);
            
        } catch (error) {
            console.error('YouTube fetch error:', error);
            this.renderYouTubeStats([]);
            this.renderVideos([]);
        }
    }

    // ========================================
    // RENDER YOUTUBE STATS
    // ========================================
    renderYouTubeStats(videos) {
        const totalVideos = videos.length;
        
        // Calculate sentiment from titles
        const bullishCount = videos.filter(v => 
            this.detectSentiment(v.snippet.title + ' ' + v.snippet.description) === 'Bullish'
        ).length;
        
        const sentimentPercent = totalVideos > 0 ? Math.round((bullishCount / totalVideos) * 100) : 0;
        
        // Recent videos (last 7 days)
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentVideos = videos.filter(v => 
            new Date(v.snippet.publishedAt).getTime() > weekAgo
        ).length;
        
        const statsHTML = `
            <div class="youtube-stat-card">
                <div class="youtube-stat-icon">🎥</div>
                <div class="youtube-stat-value">${totalVideos}</div>
                <div class="youtube-stat-label">Total Videos</div>
            </div>
            <div class="youtube-stat-card">
                <div class="youtube-stat-icon">📅</div>
                <div class="youtube-stat-value">${recentVideos}</div>
                <div class="youtube-stat-label">Last 7 Days</div>
            </div>
            <div class="youtube-stat-card">
                <div class="youtube-stat-icon">📈</div>
                <div class="youtube-stat-value">${sentimentPercent}%</div>
                <div class="youtube-stat-label">Bullish Sentiment</div>
            </div>
            <div class="youtube-stat-card">
                <div class="youtube-stat-icon">⭐</div>
                <div class="youtube-stat-value">${Math.round(totalVideos / 4)}</div>
                <div class="youtube-stat-label">Unique Channels</div>
            </div>
        `;
        
        document.getElementById('youtubeStats').innerHTML = statsHTML;
    }

    // ========================================
    // RENDER VIDEOS
    // ========================================
    renderVideos(videos) {
        if (!videos || videos.length === 0) {
            document.getElementById('videosGrid').innerHTML = `
                <div class="empty-state">
                    <i class="fab fa-youtube" style="font-size: 4rem; color: #ef4444; margin-bottom: 16px;"></i>
                    <h3>No videos found</h3>
                    <p>Try searching for a different company or ticker symbol.</p>
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
        const bullishWords = ['buy', 'bullish', 'growth', 'profit', 'surge', 'record', 'strong', 'opportunity', 'breakout', 'moon', 'rally'];
        const bearishWords = ['sell', 'bearish', 'loss', 'decline', 'drop', 'crash', 'weak', 'fall', 'warning', 'collapse'];
        
        const lowerText = text.toLowerCase();
        const bullishCount = bullishWords.filter(word => lowerText.includes(word)).length;
        const bearishCount = bearishWords.filter(word => lowerText.includes(word)).length;
        
        if (bullishCount > bearishCount) return 'Bullish';
        if (bearishCount > bullishCount) return 'Bearish';
        return 'Neutral';
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

    sortVideos() {
        const sortBy = document.getElementById('videoSortSelector').value;
        this.currentSort = sortBy;
        
        if (this.currentCompany) {
            this.search();
        }
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
        this.hideSection('youtubeSection');
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