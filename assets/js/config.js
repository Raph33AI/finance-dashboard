// ============================================
// CONFIGURATION GLOBALE - FINANCE HUB
// ============================================

const CONFIG = {
    // 🔧 Backend API URL - ⚠️ REMPLACE PAR TON URL CLOUDFLARE WORKER
    API_BASE_URL: 'https://finance-hub-api.raphnardone.workers.dev/api',
    
    // GitHub Pages URL 
    GITHUB_PAGES_URL: 'https://raph33ai.github.io/finance-dashboard',
    
    // Cache settings (côté client)
    CACHE_DURATION: {
        quote: 60000,         // 1 minute (données temps réel)
        timeSeries: 1800000,  // 30 minutes (historique)
        indicators: 1800000,  // 30 minutes (indicateurs)
        search: 86400000,     // 24 heures (recherche)
        statistics: 3600000,  // 1 heure (stats)
        profile: 86400000,    // 24 heures (profil)
    },
    
    // Retry settings
    MAX_RETRIES: 2,
    RETRY_DELAY: 1000,
    
    // App metadata
    APP_NAME: 'Finance Hub',
    APP_VERSION: '2.0.0',
    AUTHOR: 'Raphael NARDONE',
};

// Make config globally available
window.APP_CONFIG = CONFIG;