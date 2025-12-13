/**
 * ═══════════════════════════════════════════════════════════════════
 * 🏛 SEC EDGAR API CLIENT - AlphaVault AI
 * ═══════════════════════════════════════════════════════════════════
 * Client pour communiquer avec le Cloudflare Worker SEC
 * ═══════════════════════════════════════════════════════════════════
 */

class SECApiClient {
  constructor() {
    // ⚠ REMPLACE PAR TON URL WORKER CLOUDFLARE
    this.baseUrl = 'https://sec-edgar-api.raphnardone.workers.dev';
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🌐 REQUÊTE GÉNÉRIQUE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async request(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}${endpoint}${queryString ? '?' + queryString : ''}`;
    
    // Cache check
    const cacheKey = url;
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheDuration) {
        console.log('📦 Cache hit:', endpoint);
        return data;
      }
    }

    try {
      console.log('🌐 Fetching:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Store in cache
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;

    } catch (error) {
      console.error('❌ SEC API Error:', error);
      throw error;
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 MÉTHODES API
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * Récupère les infos d'une entreprise
   * @param {string} ticker - Symbole boursier (ex: 'AAPL', 'NVDA')
   */
  async getCompanyInfo(ticker) {
    return await this.request('/api/sec/company-info', { ticker });
  }

  /**
   * Récupère les IPOs récents
   * @param {number} limit - Nombre max de résultats
   * @param {number} months - Nombre de mois en arrière
   */
  async getIPOs(limit = 20, months = 6) {
    return await this.request('/api/sec/ipos', { limit, months });
  }

  /**
   * Récupère les earnings reports
   * @param {string} ticker - Symbole boursier
   * @param {number} limit - Nombre max de résultats
   */
  async getEarnings(ticker, limit = 10) {
    return await this.request('/api/sec/earnings', { ticker, limit });
  }

  /**
   * Récupère les insider transactions
   * @param {string} ticker - Symbole boursier
   * @param {number} limit - Nombre max de résultats
   */
  async getInsiderTrading(ticker, limit = 50) {
    return await this.request('/api/sec/insider-trading', { ticker, limit });
  }

  /**
   * Récupère les institutional holdings
   * @param {string} ticker - Symbole boursier
   * @param {number} limit - Nombre max de résultats
   */
  async getInstitutionalOwnership(ticker, limit = 100) {
    return await this.request('/api/sec/institutional-ownership', { ticker, limit });
  }

  /**
   * Récupère l'activité M&A
   * @param {number} months - Période en mois
   * @param {number} limit - Nombre max de résultats
   */
  async getMergersAcquisitions(months = 12, limit = 50) {
    return await this.request('/api/sec/ma-activity', { months, limit });
  }

  /**
   * Récupère les filings génériques
   * @param {string} ticker - Symbole boursier
   * @param {string} formType - Type de formulaire (ex: '10-K')
   * @param {number} limit - Nombre max de résultats
   */
  async getFilings(ticker, formType = null, limit = 20) {
    const params = { ticker, limit };
    if (formType) params.form_type = formType;
    return await this.request('/api/sec/filings', params);
  }

  /**
   * Récupère les risk factors
   * @param {string} ticker - Symbole boursier
   */
  async getRiskFactors(ticker) {
    return await this.request('/api/sec/risk-factors', { ticker });
  }

  /**
   * Récupère les corporate events (8-K)
   * @param {string} ticker - Symbole boursier
   * @param {number} limit - Nombre max de résultats
   */
  async getCorporateEvents(ticker, limit = 50) {
    return await this.request('/api/sec/corporate-events', { ticker, limit });
  }

  /**
   * Vide le cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑 Cache cleared');
  }
}

// ═══════════════════════════════════════════════════════════════════
// 🌍 EXPORT GLOBAL
// ═══════════════════════════════════════════════════════════════════

window.SECApi = new SECApiClient();
console.log('✅ SEC API Client loaded');