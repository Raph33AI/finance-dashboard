/* ================================================
   FINANCIAL NEWS PAGE - MAIN JAVASCRIPT
   ================================================ */

// ==================== CONFIGURATION ====================
const CONFIG = {
    workerURL: 'https://your-worker.workers.dev/api', // ⚠️ Replace with your Cloudflare Worker URL
    refreshInterval: 300000, // 5 minutes
    maxNewsPerLoad: 50,
    categories: {
        general: 'general',
        forex: 'forex',
        crypto: 'crypto',
        merger: 'merger'
    }
};

// ==================== STATE ====================
let newsData = {
    all: [],
    filtered: [],
    currentCategory: 'general',
    currentSymbol: '',
    searchQuery: '',
    sortBy: 'newest',
    isLoading: false,
    lastUpdate: null
};

// ==================== DOM ELEMENTS ====================
const DOM = {
    // Header
    refreshBtn: document.getElementById('refreshBtn'),
    themeToggle: document.getElementById('themeToggle'),
    userAvatar: document.getElementById('userAvatar'),
    
    // Hero
    newsCount: document.getElementById('newsCount'),
    lastUpdate: document.getElementById('lastUpdate'),
    
    // Filters
    searchInput: document.getElementById('searchInput'),
    clearSearch: document.getElementById('clearSearch'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    symbolInput: document.getElementById('symbolInput'),
    applySymbol: document.getElementById('applySymbol'),
    sortSelect: document.getElementById('sortSelect'),
    resetFilters: document.getElementById('resetFilters'),
    
    // Content
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    errorMessage: document.getElementById('errorMessage'),
    emptyState: document.getElementById('emptyState'),
    newsGrid: document.getElementById('newsGrid'),
    loadMoreContainer: document.getElementById('loadMoreContainer'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    
    // Modal
    newsModal: document.getElementById('newsModal'),
    closeModal: document.getElementById('closeModal'),
    modalBody: document.getElementById('modalBody'),
    
    // Footer
    scrollToTop: document.getElementById('scrollToTop')
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 News Page Initializing...');
    
    initializeEventListeners();
    loadThemePreference();
    fetchNews();
    
    // Auto-refresh
    setInterval(() => {
        if (!newsData.isLoading) {
            fetchNews(true);
        }
    }, CONFIG.refreshInterval);
    
    console.log('✅ News Page Ready');
});

// ==================== EVENT LISTENERS ====================
function initializeEventListeners() {
    // Header Actions
    DOM.refreshBtn.addEventListener('click', () => fetchNews(true));
    DOM.themeToggle.addEventListener('click', toggleTheme);
    
    // Search
    DOM.searchInput.addEventListener('input', handleSearch);
    DOM.clearSearch.addEventListener('click', clearSearch);
    
    // Category Filters
    DOM.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => handleCategoryChange(btn.dataset.category));
    });
    
    // Symbol Filter
    DOM.applySymbol.addEventListener('click', applySymbolFilter);
    DOM.symbolInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applySymbolFilter();
    });
    
    // Sort
    DOM.sortSelect.addEventListener('change', handleSortChange);
    
    // Reset Filters
    DOM.resetFilters?.addEventListener('click', resetAllFilters);
    
    // Load More
    DOM.loadMoreBtn.addEventListener('click', loadMoreNews);
    
    // Modal
    DOM.closeModal.addEventListener('click', closeModal);
    DOM.newsModal.addEventListener('click', (e) => {
        if (e.target === DOM.newsModal) closeModal();
    });
    
    // Scroll to Top
    DOM.scrollToTop.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', handleScroll);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
}

// ==================== FETCH NEWS ====================
async function fetchNews(silent = false) {
    if (newsData.isLoading) return;
    
    newsData.isLoading = true;
    
    if (!silent) {
        showLoading();
    } else {
        DOM.refreshBtn.classList.add('rotating');
    }
    
    try {
        console.log('📡 Fetching news...');
        
        // Call Finnhub News API through your Worker
        const response = await fetch(`${CONFIG.workerURL}/news?category=${newsData.currentCategory}`);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Finnhub returns array of news directly
        newsData.all = processNewsData(data);
        newsData.lastUpdate = new Date();
        
        console.log(`✅ Loaded ${newsData.all.length} news articles`);
        
        applyFilters();
        renderNews();
        updateLastUpdateTime();
        
        hideLoading();
        
    } catch (error) {
        console.error('❌ Error fetching news:', error);
        showError(error.message);
    } finally {
        newsData.isLoading = false;
        DOM.refreshBtn.classList.remove('rotating');
    }
}

// ==================== PROCESS NEWS DATA ====================
function processNewsData(rawData) {
    // Finnhub news format: 
    // { category, datetime, headline, id, image, related, source, summary, url }
    
    return rawData.map(item => ({
        id: item.id || Date.now() + Math.random(),
        category: item.category || 'general',
        headline: item.headline || 'No headline',
        summary: item.summary || '',
        source: item.source || 'Unknown',
        url: item.url || '#',
        image: item.image || 'https://via.placeholder.com/400x200?text=No+Image',
        datetime: item.datetime ? new Date(item.datetime * 1000) : new Date(),
        relatedSymbols: item.related ? item.related.split(',').slice(0, 3) : []
    })).sort((a, b) => b.datetime - a.datetime);
}

// ==================== FILTERS ====================
function applyFilters() {
    let filtered = [...newsData.all];
    
    // Category filter
    if (newsData.currentCategory !== 'general') {
        filtered = filtered.filter(news => news.category === newsData.currentCategory);
    }
    
    // Symbol filter
    if (newsData.currentSymbol) {
        filtered = filtered.filter(news => 
            news.relatedSymbols.some(symbol => 
                symbol.toUpperCase().includes(newsData.currentSymbol.toUpperCase())
            )
        );
    }
    
    // Search filter
    if (newsData.searchQuery) {
        const query = newsData.searchQuery.toLowerCase();
        filtered = filtered.filter(news =>
            news.headline.toLowerCase().includes(query) ||
            news.summary.toLowerCase().includes(query) ||
            news.source.toLowerCase().includes(query) ||
            news.relatedSymbols.some(symbol => symbol.toLowerCase().includes(query))
        );
    }
    
    // Sort
    switch (newsData.sortBy) {
        case 'newest':
            filtered.sort((a, b) => b.datetime - a.datetime);
            break;
        case 'oldest':
            filtered.sort((a, b) => a.datetime - b.datetime);
            break;
        case 'relevance':
            // Keep original order (already sorted by API)
            break;
    }
    
    newsData.filtered = filtered;
    
    console.log(`🔍 Filtered: ${filtered.length}/${newsData.all.length} articles`);
}

function handleCategoryChange(category) {
    newsData.currentCategory = category;
    
    // Update UI
    DOM.filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    applyFilters();
    renderNews();
}

function handleSearch() {
    const query = DOM.searchInput.value.trim();
    newsData.searchQuery = query;
    
    DOM.clearSearch.style.display = query ? 'flex' : 'none';
    
    applyFilters();
    renderNews();
}

function clearSearch() {
    DOM.searchInput.value = '';
    newsData.searchQuery = '';
    DOM.clearSearch.style.display = 'none';
    
    applyFilters();
    renderNews();
}

function applySymbolFilter() {
    const symbol = DOM.symbolInput.value.trim().toUpperCase();
    newsData.currentSymbol = symbol;
    
    applyFilters();
    renderNews();
    
    if (symbol) {
        showNotification(`Filtered by ${symbol}`, 'info');
    }
}

function handleSortChange() {
    newsData.sortBy = DOM.sortSelect.value;
    
    applyFilters();
    renderNews();
}

function resetAllFilters() {
    newsData.currentCategory = 'general';
    newsData.currentSymbol = '';
    newsData.searchQuery = '';
    newsData.sortBy = 'newest';
    
    // Update UI
    DOM.searchInput.value = '';
    DOM.symbolInput.value = '';
    DOM.sortSelect.value = 'newest';
    DOM.clearSearch.style.display = 'none';
    
    DOM.filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === 'general');
    });
    
    applyFilters();
    renderNews();
    
    showNotification('Filters reset', 'success');
}

// ==================== RENDER NEWS ====================
function renderNews() {
    const newsToShow = newsData.filtered;
    
    // Update count
    DOM.newsCount.textContent = `${newsToShow.length} article${newsToShow.length !== 1 ? 's' : ''}`;
    
    // Show/hide states
    if (newsToShow.length === 0) {
        showEmpty();
        return;
    }
    
    // Clear grid
    DOM.newsGrid.innerHTML = '';
    
    // Render cards
    newsToShow.forEach((news, index) => {
        const card = createNewsCard(news, index);
        DOM.newsGrid.appendChild(card);
    });
    
    // Show grid
    DOM.loadingState.style.display = 'none';
    DOM.errorState.style.display = 'none';
    DOM.emptyState.style.display = 'none';
    DOM.newsGrid.style.display = 'grid';
    
    // Hide load more for now (Finnhub free tier has limited pagination)
    DOM.loadMoreContainer.style.display = 'none';
}

function createNewsCard(news, index) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.style.animationDelay = `${index * 0.05}s`;
    
    const timeAgo = getTimeAgo(news.datetime);
    
    card.innerHTML = `
        <img 
            src="${news.image}" 
            alt="${escapeHTML(news.headline)}" 
            class="news-card-image"
            onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'"
        >
        <div class="news-card-content">
            <div class="news-card-header">
                <span class="news-category ${news.category}">
                    <i class="fas fa-tag"></i>
                    ${news.category}
                </span>
                <span class="news-time">
                    <i class="far fa-clock"></i>
                    ${timeAgo}
                </span>
            </div>
            
            <h3 class="news-card-title">${escapeHTML(news.headline)}</h3>
            
            <p class="news-card-summary">${escapeHTML(news.summary)}</p>
            
            <div class="news-card-footer">
                <div class="news-source">
                    <i class="fas fa-rss"></i>
                    ${escapeHTML(news.source)}
                </div>
                ${news.relatedSymbols.length > 0 ? `
                    <div class="news-related-symbols">
                        ${news.relatedSymbols.map(symbol => 
                            `<span class="symbol-tag">${escapeHTML(symbol)}</span>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openNewsModal(news));
    
    return card;
}

// ==================== MODAL ====================
function openNewsModal(news) {
    const timeAgo = getTimeAgo(news.datetime);
    const formattedDate = news.datetime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    DOM.modalBody.innerHTML = `
        <img 
            src="${news.image}" 
            alt="${escapeHTML(news.headline)}" 
            class="modal-image"
            onerror="this.src='https://via.placeholder.com/800x300?text=No+Image'"
        >
        
        <div class="modal-header">
            <div class="modal-meta">
                <span class="news-category ${news.category}">
                    <i class="fas fa-tag"></i>
                    ${news.category}
                </span>
                <span class="news-time">
                    <i class="far fa-clock"></i>
                    ${timeAgo}
                </span>
                <span class="news-time">
                    <i class="far fa-calendar"></i>
                    ${formattedDate}
                </span>
            </div>
            
            <h2 class="modal-title">${escapeHTML(news.headline)}</h2>
            
            ${news.summary ? `
                <div class="modal-summary">
                    <strong>Summary:</strong> ${escapeHTML(news.summary)}
                </div>
            ` : ''}
            
            ${news.relatedSymbols.length > 0 ? `
                <div class="news-related-symbols">
                    <strong>Related:</strong>
                    ${news.relatedSymbols.map(symbol => 
                        `<span class="symbol-tag">${escapeHTML(symbol)}</span>`
                    ).join('')}
                </div>
            ` : ''}
        </div>
        
        <div class="modal-footer">
            <div class="news-source">
                <i class="fas fa-rss"></i>
                Source: ${escapeHTML(news.source)}
            </div>
            <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="btn-read-original">
                <i class="fas fa-external-link-alt"></i>
                Read Original Article
            </a>
        </div>
    `;
    
    DOM.newsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    DOM.newsModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ==================== UI STATES ====================
function showLoading() {
    DOM.loadingState.style.display = 'flex';
    DOM.errorState.style.display = 'none';
    DOM.emptyState.style.display = 'none';
    DOM.newsGrid.style.display = 'none';
}

function hideLoading() {
    DOM.loadingState.style.display = 'none';
}

function showError(message) {
    DOM.errorMessage.textContent = message;
    DOM.loadingState.style.display = 'none';
    DOM.errorState.style.display = 'flex';
    DOM.emptyState.style.display = 'none';
    DOM.newsGrid.style.display = 'none';
}

function showEmpty() {
    DOM.loadingState.style.display = 'none';
    DOM.errorState.style.display = 'none';
    DOM.emptyState.style.display = 'flex';
    DOM.newsGrid.style.display = 'none';
}

// ==================== THEME ====================
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    const isDark = document.body.classList.contains('dark-mode');
    DOM.themeToggle.innerHTML = isDark 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    showNotification(`${isDark ? 'Dark' : 'Light'} mode activated`, 'success');
}

function loadThemePreference() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        DOM.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

// ==================== UTILITIES ====================
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
        }
    }
    
    return 'Just now';
}

function updateLastUpdateTime() {
    if (newsData.lastUpdate) {
        const timeString = newsData.lastUpdate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        DOM.lastUpdate.textContent = `Last update: ${timeString}`;
    }
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Simple console notification (you can implement a toast later)
    console.log(`[${type.toUpperCase()}] ${message}`);
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 500) {
        DOM.scrollToTop.classList.add('visible');
    } else {
        DOM.scrollToTop.classList.remove('visible');
    }
}

function handleKeyboard(e) {
    // ESC to close modal
    if (e.key === 'Escape' && DOM.newsModal.classList.contains('active')) {
        closeModal();
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        DOM.searchInput.focus();
    }
    
    // Ctrl/Cmd + R to refresh
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        fetchNews(true);
    }
}

function loadMoreNews() {
    // Placeholder for pagination
    showNotification('Load more feature coming soon', 'info');
}

// ==================== EXPORT ====================
window.NewsApp = {
    fetchNews,
    resetFilters: resetAllFilters,
    openModal: openNewsModal,
    closeModal
};

console.log('📰 News.js loaded successfully');