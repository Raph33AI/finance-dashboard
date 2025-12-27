/**
 * ═══════════════════════════════════════════════════════════════
 * API CLIENTS GLOBAL INITIALIZATION
 * ═══════════════════════════════════════════════════════════════
 * Ce fichier initialise TOUS les clients API globalement
 * À charger AVANT tous les analyzers
 * ═══════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';
    
    console.log('🚀 Initializing API Clients globally...');

    // ═══════════════════════════════════════════════════════════
    // ✅ 1. FINANCE API CLIENT (Finnhub + Twelve Data)
    // ═══════════════════════════════════════════════════════════
    if (typeof FinanceAPIClient !== 'undefined') {
        window.apiClient = new FinanceAPIClient({
            baseURL: 'https://finance-hub-api.raphnardone.workers.dev',
            cacheDuration: 300000,
            maxRetries: 2
        });
        console.log('✅ FinanceAPIClient initialized globally');
    } else {
        console.error('❌ FinanceAPIClient class not found! Check if api-client.js is loaded.');
    }

    // ═══════════════════════════════════════════════════════════
    // ✅ 2. ECONOMIC DATA CLIENT (ECB Forex + FRED)
    // ═══════════════════════════════════════════════════════════
    if (typeof EconomicDataClient !== 'undefined') {
        window.economicDataClient = new EconomicDataClient();
        console.log('✅ EconomicDataClient initialized globally');
    } else {
        console.error('❌ EconomicDataClient class not found! Check if economic-data-client.js is loaded.');
    }

    // ═══════════════════════════════════════════════════════════
    // ✅ 3. SEC API CLIENT (IPO - S-1, F-1)
    // ═══════════════════════════════════════════════════════════
    if (typeof SECApiClient !== 'undefined') {
        window.secAPIClient = new SECApiClient();
        console.log('✅ SECApiClient initialized globally');
    } else {
        console.warn('⚠ SECApiClient class not found! IPO data will use fallback.');
        
        // Créer un fallback minimal
        window.secAPIClient = {
            getIPOs: async (options) => {
                console.warn('⚠ Using fallback IPO client (no real data)');
                return {
                    success: false,
                    data: [],
                    count: 0,
                    error: 'SECApiClient not available'
                };
            },
            healthCheck: async () => ({ status: 'unavailable' })
        };
    }

    // ═══════════════════════════════════════════════════════════
    // ✅ 4. SEC M&A CLIENT (Form S-4, 8-K)
    // ═══════════════════════════════════════════════════════════
    if (typeof SECMAClient !== 'undefined') {
        window.secMAClient = new SECMAClient({
            workerURL: 'https://sec-edgar-api.raphnardone.workers.dev',
            cacheTTL: 300000,
            rateLimit: 200,
            maxRetries: 2
        });
        console.log('✅ SECMAClient initialized globally');
    } else {
        console.warn('⚠ SECMAClient class not found! M&A data will use fallback.');
        
        // Créer un fallback minimal
        window.secMAClient = {
            getS4Bulk: async (params) => {
                console.warn('⚠ Using fallback M&A client (no real data)');
                return {
                    success: false,
                    filings: [],
                    count: 0,
                    error: 'SECMAClient not available'
                };
            },
            get8KBulk: async (params) => {
                console.warn('⚠ Using fallback 8-K client (no real data)');
                return {
                    success: false,
                    filings: [],
                    count: 0,
                    error: 'SECMAClient not available'
                };
            },
            healthCheck: async () => ({ status: 'unavailable' })
        };
    }

    // ═══════════════════════════════════════════════════════════
    // ✅ 5. VÉRIFICATION FINALE
    // ═══════════════════════════════════════════════════════════
    console.log('🔍 API Clients Status:');
    console.log('   - FinanceAPIClient:', window.apiClient ? '✅' : '❌');
    console.log('   - EconomicDataClient:', window.economicDataClient ? '✅' : '❌');
    console.log('   - SECApiClient:', window.secAPIClient ? '✅' : '❌');
    console.log('   - SECMAClient:', window.secMAClient ? '✅' : '❌');

    // ═══════════════════════════════════════════════════════════
    // ✅ 6. HEALTH CHECK (Optional - pour debug)
    // ═══════════════════════════════════════════════════════════
    window.checkAPIHealth = async function() {
        console.log('🏥 Running API Health Checks...');
        
        const results = {
            finance: { status: 'unknown' },
            economic: { status: 'unknown' },
            secIPO: { status: 'unknown' },
            secMA: { status: 'unknown' }
        };

        // Finance API
        try {
            if (window.apiClient && typeof window.apiClient.getQuote === 'function') {
                await window.apiClient.getQuote('AAPL');
                results.finance = { status: 'ok', message: 'Finance API working' };
            }
        } catch (error) {
            results.finance = { status: 'error', message: error.message };
        }

        // Economic API (ECB)
        try {
            if (window.economicDataClient && typeof window.economicDataClient.getECBAllExchangeRates === 'function') {
                const rates = await window.economicDataClient.getECBAllExchangeRates();
                results.economic = { 
                    status: rates.success ? 'ok' : 'error', 
                    message: `ECB API - ${Object.keys(rates.rates || {}).length} currencies` 
                };
            }
        } catch (error) {
            results.economic = { status: 'error', message: error.message };
        }

        // SEC IPO API
        try {
            if (window.secAPIClient && typeof window.secAPIClient.healthCheck === 'function') {
                const health = await window.secAPIClient.healthCheck();
                results.secIPO = { status: health.status === 'ok' ? 'ok' : 'error', message: 'SEC IPO Worker' };
            }
        } catch (error) {
            results.secIPO = { status: 'error', message: error.message };
        }

        // SEC M&A API
        try {
            if (window.secMAClient && typeof window.secMAClient.healthCheck === 'function') {
                const health = await window.secMAClient.healthCheck();
                results.secMA = { status: health.status ? 'ok' : 'error', message: 'SEC M&A Worker' };
            }
        } catch (error) {
            results.secMA = { status: 'error', message: error.message };
        }

        console.table(results);
        return results;
    };

    console.log('✅ API Clients initialization complete!');
    console.log('💡 Tip: Run window.checkAPIHealth() to test all APIs');

})();