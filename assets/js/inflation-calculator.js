/**
 * ====================================================================
 * ALPHAVAULT AI - INFLATION CALCULATOR
 * ====================================================================
 * Calcul du pouvoir d'achat ajusté à l'inflation (1950-2024)
 * Support US (CPI) et EU (HICP)
 */

class InflationCalculator {
    constructor() {
        this.cpiData = null;
        this.currentYear = new Date().getFullYear();
    }

    async init() {
        console.log('💰 Initializing Inflation Calculator...');
        
        try {
            // Populate year dropdowns
            this.populateYearSelectors();
            
            // Load CPI data
            await this.loadCPIData();
            
            // Load historical chart
            await this.loadHistoricalChart();
            
            console.log('✅ Inflation Calculator ready');
            
        } catch (error) {
            console.error('❌ Inflation Calculator error:', error);
        }
    }

    /**
     * Peupler les sélecteurs d'années
     */
    populateYearSelectors() {
        const startYearSelect = document.getElementById('startYear');
        const endYearSelect = document.getElementById('endYear');
        
        for (let year = 1950; year <= this.currentYear; year++) {
            const option1 = document.createElement('option');
            option1.value = year;
            option1.textContent = year;
            startYearSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = year;
            option2.textContent = year;
            endYearSelect.appendChild(option2);
        }
        
        // Par défaut: 1950 → Année actuelle
        startYearSelect.value = '2000';
        endYearSelect.value = this.currentYear;
    }

    /**
     * Charger les données CPI
     */
    async loadCPIData() {
        try {
            // Récupérer CPI depuis 1950
            const cpiSeries = await economicDataClient.getSeries('CPIAUCSL', {
                observation_start: '1950-01-01',
                observation_end: `${this.currentYear}-12-31`,
                frequency: 'a' // Annual
            });
            
            this.cpiData = cpiSeries
                .filter(d => d.value !== '.')
                .map(d => ({
                    year: new Date(d.date).getFullYear(),
                    cpi: parseFloat(d.value)
                }));
            
            console.log(`📊 Loaded ${this.cpiData.length} years of CPI data`);
            
        } catch (error) {
            console.error('❌ Error loading CPI data:', error);
            this.cpiData = [];
        }
    }

    /**
     * Calculer le pouvoir d'achat
     */
    calculate() {
        const amount = parseFloat(document.getElementById('amount').value);
        const startYear = parseInt(document.getElementById('startYear').value);
        const endYear = parseInt(document.getElementById('endYear').value);
        const region = document.getElementById('region').value;
        
        // Validation
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        if (startYear >= endYear) {
            alert('Start year must be before end year');
            return;
        }
        
        if (!this.cpiData || this.cpiData.length === 0) {
            alert('CPI data not loaded. Please try again.');
            return;
        }
        
        // Trouver les CPI correspondants
        const startCPI = this.cpiData.find(d => d.year === startYear);
        const endCPI = this.cpiData.find(d => d.year === endYear);
        
        if (!startCPI || !endCPI) {
            alert(`CPI data not available for ${startYear} or ${endYear}`);
            return;
        }
        
        // Calculer la valeur ajustée
        const adjustedValue = (amount * endCPI.cpi) / startCPI.cpi;
        
        // Calculer l'inflation totale
        const totalInflation = ((endCPI.cpi - startCPI.cpi) / startCPI.cpi) * 100;
        
        // Calculer le taux annuel moyen
        const years = endYear - startYear;
        const avgAnnualRate = (Math.pow(endCPI.cpi / startCPI.cpi, 1 / years) - 1) * 100;
        
        // Afficher les résultats
        this.displayResults(amount, startYear, endYear, adjustedValue, totalInflation, avgAnnualRate);
    }

    /**
     * Afficher les résultats
     */
    displayResults(originalAmount, startYear, endYear, adjustedValue, totalInflation, avgRate) {
        const resultDiv = document.getElementById('inflationResult');
        const resultYearSpan = document.getElementById('resultYear');
        const resultValueDiv = document.getElementById('resultValue');
        const resultExplanationDiv = document.getElementById('resultExplanation');
        const totalInflationDiv = document.getElementById('totalInflation');
        const avgInflationDiv = document.getElementById('avgInflation');
        
        resultDiv.style.display = 'block';
        resultYearSpan.textContent = endYear;
        resultValueDiv.textContent = `$${adjustedValue.toFixed(2)}`;
        
        resultExplanationDiv.innerHTML = `
            $${originalAmount.toFixed(2)} in <strong>${startYear}</strong> has the same purchasing power as 
            <strong>$${adjustedValue.toFixed(2)}</strong> in <strong>${endYear}</strong>.
        `;
        
        totalInflationDiv.textContent = `${totalInflation > 0 ? '+' : ''}${totalInflation.toFixed(2)}%`;
        avgInflationDiv.textContent = `${avgRate.toFixed(2)}%`;
        
        // Scroll vers les résultats
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Charger le graphique historique d'inflation
     */
    async loadHistoricalChart() {
        try {
            if (!this.cpiData || this.cpiData.length === 0) {
                await this.loadCPIData();
            }
            
            // Calculer YoY inflation
            const inflationData = [];
            for (let i = 1; i < this.cpiData.length; i++) {
                const currentCPI = this.cpiData[i].cpi;
                const previousCPI = this.cpiData[i - 1].cpi;
                const yoyInflation = ((currentCPI - previousCPI) / previousCPI) * 100;
                
                inflationData.push([
                    new Date(this.cpiData[i].year, 0, 1).getTime(),
                    yoyInflation
                ]);
            }
            
            Highcharts.chart('inflationHistoryChart', {
                chart: { 
                    type: 'area', 
                    backgroundColor: 'transparent',
                    height: 450
                },
                title: { 
                    text: 'US Inflation Rate (YoY %)',
                    style: { 
                        color: 'var(--text-primary)',
                        fontWeight: '800'
                    }
                },
                subtitle: {
                    text: 'Consumer Price Index - 1951 to ' + this.currentYear,
                    style: { color: 'var(--text-secondary)' }
                },
                xAxis: { 
                    type: 'datetime',
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { 
                        text: 'Inflation Rate (%)',
                        style: { color: 'var(--text-secondary)' }
                    },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)',
                    plotLines: [{
                        value: 0,
                        color: '#000',
                        width: 2,
                        zIndex: 4
                    }, {
                        value: 2,
                        color: '#10b981',
                        width: 2,
                        dashStyle: 'Dash',
                        label: {
                            text: 'Fed Target 2%',
                            style: { color: '#10b981', fontWeight: 'bold' }
                        }
                    }]
                },
                tooltip: {
                    valueDecimals: 2,
                    valueSuffix: '%',
                    xDateFormat: '%Y'
                },
                plotOptions: {
                    area: {
                        fillOpacity: 0.3,
                        marker: { enabled: false },
                        lineWidth: 3,
                        threshold: 0,
                        negativeFillColor: 'rgba(239, 68, 68, 0.2)',
                        color: '#f59e0b',
                        fillColor: {
                            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                            stops: [
                                [0, 'rgba(245, 158, 11, 0.5)'],
                                [1, 'rgba(245, 158, 11, 0.05)']
                            ]
                        }
                    }
                },
                series: [{
                    name: 'Inflation Rate',
                    data: inflationData,
                    color: '#f59e0b'
                }],
                credits: { enabled: false },
                legend: { 
                    enabled: true,
                    itemStyle: { color: 'var(--text-primary)' }
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading historical chart:', error);
        }
    }
}

// ========================================
// INITIALISATION
// ========================================

let inflationCalculator;

document.addEventListener('DOMContentLoaded', () => {
    inflationCalculator = new InflationCalculator();
    inflationCalculator.init();
});