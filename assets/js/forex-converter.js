/**
 * ====================================================================
 * ALPHAVAULT AI - FOREX CONVERTER
 * ====================================================================
 * Convertisseur 38 devises avec taux officiels ECB
 */

class ForexConverter {
    constructor() {
        this.rates = {};
        this.currencies = ECB_CURRENCIES; // Défini dans economic-data-client.js
    }

    async init() {
        console.log('💱 Initializing Forex Converter...');
        
        try {
            await this.loadExchangeRates();
            this.populateCurrencySelectors();
            this.setupEventListeners();
            this.convert(); // Conversion initiale
            await this.loadHistoricalChart();
            
            console.log('✅ Forex Converter loaded');
            
        } catch (error) {
            console.error('❌ Forex Converter error:', error);
        }
    }

    /**
     * ========================================
     * LOAD EXCHANGE RATES
     * ========================================
     */
    async loadExchangeRates() {
        try {
            const ratesData = await economicDataClient.getECBAllExchangeRates();
            
            if (ratesData.success && ratesData.rates) {
                this.rates = ratesData.rates;
                console.log(`📊 Loaded ${Object.keys(this.rates).length} exchange rates`);
                
                // Afficher les taux en grille
                this.displayLiveRates();
            }
            
        } catch (error) {
            console.error('❌ Error loading exchange rates:', error);
        }
    }

    /**
     * Afficher les taux en direct
     */
    displayLiveRates() {
        const grid = document.getElementById('liveRatesGrid');
        if (!grid) return;

        const rateCards = Object.entries(this.rates)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([currency, data]) => `
                <div class='eco-card eu-card'>
                    <div class='eco-card-header'>
                        <h3 class='eco-card-title'>${currency}</h3>
                        <span class='eco-flag'>${this.getCurrencyFlag(currency)}</span>
                    </div>
                    <div class='eco-value' style='font-size: 1.8rem;'>${data.rate.toFixed(4)}</div>
                    <div class='eco-sublabel'>1 EUR = ${data.rate.toFixed(4)} ${currency}</div>
                    <div class='eco-sublabel' style='margin-top: 8px; font-size: 0.75rem;'>Updated: ${data.date}</div>
                </div>
            `).join('');

        grid.innerHTML = `<div class='eco-dashboard-grid' style='grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));'>${rateCards}</div>`;
    }

    /**
     * Peupler les sélecteurs de devises
     */
    populateCurrencySelectors() {
        const fromSelect = document.getElementById('fromCurrency');
        const toSelect = document.getElementById('toCurrency');

        // Ajouter EUR en premier
        const eurOption1 = document.createElement('option');
        eurOption1.value = 'EUR';
        eurOption1.textContent = 'EUR - Euro';
        fromSelect.appendChild(eurOption1);

        const eurOption2 = document.createElement('option');
        eurOption2.value = 'EUR';
        eurOption2.textContent = 'EUR - Euro';
        toSelect.appendChild(eurOption2);

        // Ajouter les autres devises
        this.currencies.forEach(currency => {
            const option1 = document.createElement('option');
            option1.value = currency;
            option1.textContent = `${currency} - ${this.getCurrencyName(currency)}`;
            fromSelect.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = currency;
            option2.textContent = `${currency} - ${this.getCurrencyName(currency)}`;
            toSelect.appendChild(option2);
        });

        // Valeurs par défaut
        fromSelect.value = 'EUR';
        toSelect.value = 'USD';
    }

    /**
     * Event listeners
     */
    setupEventListeners() {
        document.getElementById('fromAmount').addEventListener('input', () => this.convert());
        document.getElementById('fromCurrency').addEventListener('change', () => this.convert());
        document.getElementById('toCurrency').addEventListener('change', () => this.convert());
    }

    /**
     * ========================================
     * CONVERT CURRENCY
     * ========================================
     */
    convert() {
        const fromAmount = parseFloat(document.getElementById('fromAmount').value);
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;

        if (isNaN(fromAmount) || fromAmount < 0) {
            document.getElementById('toAmount').value = '0.00';
            return;
        }

        // Conversion via EUR comme base
        let toAmount;
        
        if (fromCurrency === 'EUR' && toCurrency === 'EUR') {
            toAmount = fromAmount;
        } else if (fromCurrency === 'EUR') {
            // EUR vers autre devise
            const rate = this.rates[toCurrency]?.rate || 1;
            toAmount = fromAmount * rate;
        } else if (toCurrency === 'EUR') {
            // Autre devise vers EUR
            const rate = this.rates[fromCurrency]?.rate || 1;
            toAmount = fromAmount / rate;
        } else {
            // Autre vers autre (passer par EUR)
            const fromRate = this.rates[fromCurrency]?.rate || 1;
            const toRate = this.rates[toCurrency]?.rate || 1;
            toAmount = (fromAmount / fromRate) * toRate;
        }

        document.getElementById('toAmount').value = toAmount.toFixed(2);

        // Afficher le taux de change
        const exchangeRate = toAmount / fromAmount;
        document.getElementById('conversionResult').style.display = 'block';
        document.getElementById('conversionRate').textContent = 
            `1 ${fromCurrency} = ${exchangeRate.toFixed(4)} ${toCurrency}`;
    }

    /**
     * Échanger les devises
     */
    swap() {
        const fromCurrency = document.getElementById('fromCurrency').value;
        const toCurrency = document.getElementById('toCurrency').value;

        document.getElementById('fromCurrency').value = toCurrency;
        document.getElementById('toCurrency').value = fromCurrency;

        this.convert();
    }

    /**
     * ========================================
     * HISTORICAL CHART
     * ========================================
     */
    async loadHistoricalChart() {
        try {
            const currency = 'USD';
            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 5);

            const historicalData = await economicDataClient.getECBHistoricalExchangeRate(
                currency,
                this.formatDate(startDate),
                this.formatDate(endDate)
            );

            const chartData = this.extractECBTimeSeries(historicalData);

            Highcharts.chart('historicalForexChart', {
                chart: { 
                    type: 'line', 
                    backgroundColor: 'transparent'
                },
                title: { 
                    text: 'EUR/USD Exchange Rate (5 Years)',
                    style: { color: 'var(--text-primary)', fontWeight: '800' }
                },
                subtitle: {
                    text: 'European Central Bank Official Rate',
                    style: { color: 'var(--text-secondary)' }
                },
                xAxis: { 
                    type: 'datetime',
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { text: 'EUR/USD Rate', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: {
                    valueDecimals: 4,
                    xDateFormat: '%Y-%m-%d'
                },
                series: [{
                    name: 'EUR/USD',
                    data: chartData,
                    color: '#8b5cf6',
                    marker: { enabled: false },
                    lineWidth: 3
                }],
                credits: { enabled: false },
                legend: { enabled: false }
            });

        } catch (error) {
            console.error('❌ Error loading historical chart:', error);
        }
    }

    /**
     * ========================================
     * HELPERS
     * ========================================
     */
    getCurrencyName(code) {
        const names = {
            'USD': 'US Dollar', 'GBP': 'British Pound', 'JPY': 'Japanese Yen',
            'CHF': 'Swiss Franc', 'CNY': 'Chinese Yuan', 'AUD': 'Australian Dollar',
            'CAD': 'Canadian Dollar', 'SEK': 'Swedish Krona', 'NOK': 'Norwegian Krone',
            'DKK': 'Danish Krone', 'PLN': 'Polish Zloty', 'CZK': 'Czech Koruna',
            'HUF': 'Hungarian Forint', 'RON': 'Romanian Leu', 'BGN': 'Bulgarian Lev',
            'HRK': 'Croatian Kuna', 'TRY': 'Turkish Lira', 'RUB': 'Russian Ruble',
            'BRL': 'Brazilian Real', 'INR': 'Indian Rupee', 'ZAR': 'South African Rand',
            'KRW': 'South Korean Won', 'MXN': 'Mexican Peso', 'IDR': 'Indonesian Rupiah',
            'MYR': 'Malaysian Ringgit', 'PHP': 'Philippine Peso', 'THB': 'Thai Baht',
            'SGD': 'Singapore Dollar', 'HKD': 'Hong Kong Dollar', 'NZD': 'New Zealand Dollar',
            'ISK': 'Icelandic Krona', 'ILS': 'Israeli Shekel', 'CLP': 'Chilean Peso',
            'ARS': 'Argentine Peso', 'PEN': 'Peruvian Sol', 'COP': 'Colombian Peso',
            'UAH': 'Ukrainian Hryvnia', 'EGP': 'Egyptian Pound'
        };
        return names[code] || code;
    }

    getCurrencyFlag(code) {
        const flags = {
            'USD': '🇺🇸', 'GBP': '🇬🇧', 'JPY': '🇯🇵', 'CHF': '🇨🇭', 'CNY': '🇨🇳',
            'AUD': '🇦🇺', 'CAD': '🇨🇦', 'SEK': '🇸🇪', 'NOK': '🇳🇴', 'DKK': '🇩🇰',
            'PLN': '🇵🇱', 'CZK': '🇨🇿', 'HUF': '🇭🇺', 'RON': '🇷🇴', 'BGN': '🇧🇬',
            'HRK': '🇭🇷', 'TRY': '🇹🇷', 'RUB': '🇷🇺', 'BRL': '🇧🇷', 'INR': '🇮🇳',
            'ZAR': '🇿🇦', 'KRW': '🇰🇷', 'MXN': '🇲🇽', 'IDR': '🇮🇩', 'MYR': '🇲🇾',
            'PHP': '🇵🇭', 'THB': '🇹🇭', 'SGD': '🇸🇬', 'HKD': '🇭🇰', 'NZD': '🇳🇿',
            'ISK': '🇮🇸', 'ILS': '🇮🇱', 'CLP': '🇨🇱', 'ARS': '🇦🇷', 'PEN': '🇵🇪',
            'COP': '🇨🇴', 'UAH': '🇺🇦', 'EGP': '🇪🇬'
        };
        return flags[code] || '💱';
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    extractECBTimeSeries(data) {
        if (!data || !data.success) return [];
        try {
            const observations = economicDataClient.extractECBObservations(data.data);
            return observations.map(obs => [obs.timestamp, obs.value]);
        } catch (error) {
            return [];
        }
    }
}

// ========================================
// INITIALISATION
// ========================================

let forexConverter;

document.addEventListener('DOMContentLoaded', () => {
    forexConverter = new ForexConverter();
    forexConverter.init();
});