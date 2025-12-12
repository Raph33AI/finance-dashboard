/**
 * ====================================================================
 * ALPHAVAULT AI - INFLATION CALCULATOR (ULTRA-ENHANCED)
 * ====================================================================
 * Calcul du pouvoir d'achat ajusté à l'inflation (1950-2024)
 * Support US CPI uniquement
 * 
 * NOUVELLES FONCTIONNALITÉS :
 * - Projections d'inflation (3 scénarios)
 * - Simulateur d'impact sur salaire
 * - Prix iconiques (Big Mac, essence, loyer)
 * - Inflation sectorielle (logement, alimentation, transport, santé)
 * - Heatmap par décennie
 * - Protection contre l'inflation (TIPS, or, immobilier, commodités)
 * - Graphiques multiples
 */

class InflationCalculator {
    constructor() {
        this.cpiData = null;
        this.cpiMonthlyData = null;
        this.currentYear = new Date().getFullYear();
        
        // Données historiques pour les prix iconiques (estimations basées sur CPI et recherche historique)
        this.iconicPrices = {
            bigMac: { 1980: 1.60, 2024: 5.69, icon: '🍔', name: 'Big Mac' },
            gasoline: { 1980: 1.19, 2024: 3.50, icon: '⛽', name: 'Gallon of Gas' },
            rent: { 1980: 243, 2024: 1700, icon: '🏠', name: 'Average Rent (1BR)' },
            movieTicket: { 1980: 2.69, 2024: 11.00, icon: '🎬', name: 'Movie Ticket' },
            newCar: { 1980: 7200, 2024: 48000, icon: '🚗', name: 'New Car' },
            stamp: { 1980: 0.15, 2024: 0.68, icon: '✉', name: 'First-Class Stamp' }
        };
        
        // Assets de protection contre l'inflation
        this.protectionAssets = [
            {
                icon: '📜',
                name: 'TIPS',
                description: 'Treasury Inflation-Protected Securities adjust principal based on CPI changes, providing direct inflation protection.',
                historicalReturn: '2.5%',
                volatility: 'Low',
                liquidity: 'High'
            },
            {
                icon: '🥇',
                name: 'Gold',
                description: 'Precious metal historically used as inflation hedge and safe haven during economic uncertainty.',
                historicalReturn: '7.8%',
                volatility: 'Medium',
                liquidity: 'High'
            },
            {
                icon: '🏘',
                name: 'Real Estate',
                description: 'Physical property or REITs that benefit from rising rents and property values during inflation.',
                historicalReturn: '10.6%',
                volatility: 'Medium',
                liquidity: 'Low'
            },
            {
                icon: '🛢',
                name: 'Commodities',
                description: 'Raw materials (oil, wheat, metals) that often rise in price when inflation increases.',
                historicalReturn: '5.2%',
                volatility: 'Very High',
                liquidity: 'Medium'
            },
            {
                icon: '📈',
                name: 'Stocks',
                description: 'Companies can pass inflation costs to consumers through price increases, protecting margins.',
                historicalReturn: '10.2%',
                volatility: 'High',
                liquidity: 'High'
            },
            {
                icon: '₿',
                name: 'Bitcoin',
                description: 'Digital asset with fixed supply cap, viewed by some as inflation hedge (highly speculative).',
                historicalReturn: '230%*',
                volatility: 'Extreme',
                liquidity: 'High'
            }
        ];
    }

    async init() {
        console.log('💰 Initializing Inflation Calculator (Ultra Mode)...');
        
        try {
            // Populate year dropdowns
            this.populateYearSelectors();
            
            // Load CPI data (monthly for maximum data availability)
            await this.loadCPIData();
            
            // Load all charts
            await this.loadHistoricalChart();
            await this.loadCPIEvolutionChart();
            await this.loadCumulativeInflationChart();
            
            // Populate tables and grids
            this.populateDecadeTable();
            this.generateInflationHeatmap();
            this.populateIconicPrices();
            this.populateProtectionAssets();
            
            // Generate projections
            this.generateProjections();
            
            // Load sectoral inflation chart
            await this.loadSectoralInflationChart();
            
            console.log('✅ Inflation Calculator ready (Ultra Mode)');
            
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
        
        // Par défaut: 2000 → Année actuelle
        startYearSelect.value = '2000';
        endYearSelect.value = this.currentYear;
    }

    /**
     * Charger les données CPI (mensuel puis agrégation annuelle)
     */
    async loadCPIData() {
        try {
            console.log('📊 Fetching CPI data (monthly for maximum coverage)...');
            
            // Récupérer CPI MENSUEL depuis 1947
            const cpiSeries = await economicDataClient.getSeries('CPIAUCSL', {
                observation_start: '1947-01-01',
                observation_end: `${this.currentYear}-12-31`
            });
            
            // Filtrer les valeurs manquantes
            this.cpiMonthlyData = cpiSeries
                .filter(d => d.value !== '.' && d.value !== null)
                .map(d => ({
                    date: d.date,
                    year: new Date(d.date).getFullYear(),
                    month: new Date(d.date).getMonth() + 1,
                    cpi: parseFloat(d.value)
                }));
            
            console.log(`📈 Loaded ${this.cpiMonthlyData.length} monthly CPI observations`);
            
            // Agrégation annuelle (moyenne des 12 mois)
            this.cpiData = this.aggregateToAnnual(this.cpiMonthlyData);
            
            console.log(`✅ Aggregated to ${this.cpiData.length} annual CPI values (${this.cpiData[0].year}-${this.cpiData[this.cpiData.length-1].year})`);
            
        } catch (error) {
            console.error('❌ Error loading CPI data:', error);
            this.cpiData = [];
            this.cpiMonthlyData = [];
        }
    }

    /**
     * Agréger les données mensuelles en annuelles
     */
    aggregateToAnnual(monthlyData) {
        const yearMap = new Map();
        
        // Grouper par année
        monthlyData.forEach(item => {
            if (!yearMap.has(item.year)) {
                yearMap.set(item.year, []);
            }
            yearMap.get(item.year).push(item.cpi);
        });
        
        // Calculer la moyenne annuelle
        const annualData = [];
        yearMap.forEach((values, year) => {
            const avgCPI = values.reduce((sum, val) => sum + val, 0) / values.length;
            annualData.push({
                year: year,
                cpi: avgCPI,
                dataPoints: values.length
            });
        });
        
        // Trier par année
        return annualData.sort((a, b) => a.year - b.year);
    }

    /**
     * Calculer le pouvoir d'achat
     */
    calculate() {
        const amount = parseFloat(document.getElementById('amount').value);
        const startYear = parseInt(document.getElementById('startYear').value);
        const endYear = parseInt(document.getElementById('endYear').value);
        
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
     * ✅ NEW: Générer les projections d'inflation (3 scénarios)
     */
    generateProjections() {
        if (!this.cpiData || this.cpiData.length === 0) return;
        
        // Calculer les taux historiques des 10 dernières années
        const recentData = this.cpiData.slice(-11); // 11 ans pour avoir 10 YoY
        const recentRates = [];
        for (let i = 1; i < recentData.length; i++) {
            const rate = ((recentData[i].cpi - recentData[i-1].cpi) / recentData[i-1].cpi) * 100;
            recentRates.push(rate);
        }
        
        // Calculer les statistiques
        const avgRate = recentRates.reduce((sum, r) => sum + r, 0) / recentRates.length;
        const sortedRates = [...recentRates].sort((a, b) => a - b);
        const percentile25 = sortedRates[Math.floor(sortedRates.length * 0.25)];
        const percentile75 = sortedRates[Math.floor(sortedRates.length * 0.75)];
        
        // Scénarios
        const scenarios = [
            {
                name: 'Optimistic',
                rate: Math.max(1.5, percentile25), // Minimum 1.5%
                icon: '📉',
                class: 'optimistic',
                description: 'Low inflation environment with stable growth and effective monetary policy.'
            },
            {
                name: 'Base',
                rate: Math.max(2.0, Math.min(2.5, avgRate)), // Entre 2% et 2.5%
                icon: '📊',
                class: 'base',
                description: 'Moderate inflation aligned with Federal Reserve\'s 2% target.'
            },
            {
                name: 'Pessimistic',
                rate: Math.max(3.5, percentile75), // Minimum 3.5%
                icon: '📈',
                class: 'pessimistic',
                description: 'Elevated inflation due to supply shocks or policy challenges.'
            }
        ];
        
        // Peupler les cards de scénarios
        const scenariosContainer = document.getElementById('projectionScenarios');
        scenariosContainer.innerHTML = '';
        
        scenarios.forEach(scenario => {
            const impactIn10Years = Math.pow(1 + scenario.rate / 100, 10);
            const purchasingPowerOf100 = 100 / impactIn10Years;
            
            const card = `
                <div class='scenario-card ${scenario.class}'>
                    <div class='scenario-header'>
                        <div class='scenario-icon'>${scenario.icon}</div>
                        <div class='scenario-title'>${scenario.name}</div>
                    </div>
                    <div class='scenario-rate'>${scenario.rate.toFixed(2)}%</div>
                    <div class='scenario-description'>${scenario.description}</div>
                    <div class='scenario-impact'>
                        <div class='scenario-impact-item'>
                            <span class='scenario-impact-label'>$100 in 10 years:</span>
                            <span class='scenario-impact-value'>$${purchasingPowerOf100.toFixed(2)}</span>
                        </div>
                        <div class='scenario-impact-item'>
                            <span class='scenario-impact-label'>Total erosion:</span>
                            <span class='scenario-impact-value'>${((1 - purchasingPowerOf100 / 100) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            `;
            scenariosContainer.innerHTML += card;
        });
        
        // Générer le graphique de projections
        this.loadProjectionChart(scenarios);
    }

    /**
     * ✅ NEW: Charger le graphique de projections
     */
    async loadProjectionChart(scenarios) {
        try {
            const years = 10;
            const seriesData = scenarios.map(scenario => {
                const data = [];
                for (let year = 0; year <= years; year++) {
                    const value = 100 * Math.pow(1 + scenario.rate / 100, year);
                    data.push([this.currentYear + year, value]);
                }
                return {
                    name: `${scenario.name} (${scenario.rate.toFixed(1)}%)`,
                    data: data
                };
            });
            
            Highcharts.chart('projectionChart', {
                chart: { 
                    type: 'line', 
                    backgroundColor: 'transparent',
                    height: 450
                },
                title: { 
                    text: '10-Year Inflation Projections',
                    style: { 
                        color: 'var(--text-primary)',
                        fontWeight: '800'
                    }
                },
                subtitle: {
                    text: 'Future purchasing power of $100 under different scenarios',
                    style: { color: 'var(--text-secondary)' }
                },
                xAxis: { 
                    title: { text: 'Year', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { 
                        text: 'Nominal Value ($)',
                        style: { color: 'var(--text-secondary)' }
                    },
                    labels: { 
                        style: { color: 'var(--text-secondary)' },
                        format: '${value}'
                    },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: {
                    valueDecimals: 2,
                    valuePrefix: '$'
                },
                plotOptions: {
                    line: {
                        marker: { enabled: true, radius: 4 },
                        lineWidth: 3
                    }
                },
                series: [
                    { ...seriesData[0], color: '#10b981', dashStyle: 'Dash' },
                    { ...seriesData[1], color: '#3b82f6', dashStyle: 'Solid' },
                    { ...seriesData[2], color: '#ef4444', dashStyle: 'Dot' }
                ],
                credits: { enabled: false },
                legend: { 
                    enabled: true,
                    itemStyle: { color: 'var(--text-primary)' }
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading projection chart:', error);
        }
    }

    /**
     * ✅ NEW: Calculer l'impact sur le salaire
     */
    calculateSalaryImpact() {
        const currentSalary = parseFloat(document.getElementById('currentSalary').value);
        const annualRaise = parseFloat(document.getElementById('annualRaise').value);
        const yearsForward = parseInt(document.getElementById('yearsForward').value);
        
        if (isNaN(currentSalary) || currentSalary <= 0) {
            alert('Please enter a valid current salary');
            return;
        }
        
        if (isNaN(annualRaise) || annualRaise < 0) {
            alert('Please enter a valid annual raise percentage');
            return;
        }
        
        if (isNaN(yearsForward) || yearsForward < 1) {
            alert('Please enter a valid number of years');
            return;
        }
        
        // Utiliser le scénario de base pour l'inflation projetée
        const projectedInflation = 2.3; // Scénario de base moyen
        
        // Calculer le salaire futur (nominal)
        const futureSalaryNominal = currentSalary * Math.pow(1 + annualRaise / 100, yearsForward);
        
        // Calculer le pouvoir d'achat réel
        const inflationFactor = Math.pow(1 + projectedInflation / 100, yearsForward);
        const realPurchasingPower = futureSalaryNominal / inflationFactor;
        
        // Calculer le gain/perte réel
        const realChange = realPurchasingPower - currentSalary;
        const realChangePercent = (realChange / currentSalary) * 100;
        
        // Calculer la hausse nécessaire pour égaler l'inflation
        const neededRaise = projectedInflation;
        
        // Afficher les résultats
        const resultsDiv = document.getElementById('salaryResults');
        resultsDiv.style.display = 'flex';
        
        document.getElementById('futureSalaryNominal').textContent = 
            `$${futureSalaryNominal.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        document.getElementById('futureSalarySubtext').textContent = 
            `In ${yearsForward} years with ${annualRaise}% annual raises`;
        
        document.getElementById('realPurchasingPower').textContent = 
            `$${realPurchasingPower.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        
        const changeText = realChange >= 0 
            ? `+$${realChange.toLocaleString('en-US', { maximumFractionDigits: 0 })} (${realChangePercent > 0 ? '+' : ''}${realChangePercent.toFixed(1)}%)`
            : `-$${Math.abs(realChange).toLocaleString('en-US', { maximumFractionDigits: 0 })} (${realChangePercent.toFixed(1)}%)`;
        
        document.getElementById('purchasingPowerChange').textContent = changeText;
        document.getElementById('purchasingPowerChange').style.color = realChange >= 0 ? 'var(--eco-success)' : 'var(--eco-danger)';
        
        document.getElementById('inflationGap').textContent = `${neededRaise.toFixed(2)}%`;
        
        // Scroll vers les résultats
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Charger le graphique historique d'inflation (YoY)
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

    /**
     * Charger le graphique d'évolution du CPI
     */
    async loadCPIEvolutionChart() {
        try {
            if (!this.cpiData || this.cpiData.length === 0) return;
            
            const cpiEvolutionData = this.cpiData.map(d => [
                new Date(d.year, 0, 1).getTime(),
                d.cpi
            ]);
            
            Highcharts.chart('cpiEvolutionChart', {
                chart: { 
                    type: 'line', 
                    backgroundColor: 'transparent',
                    height: 400
                },
                title: { 
                    text: 'Consumer Price Index Evolution',
                    style: { 
                        color: 'var(--text-primary)',
                        fontWeight: '800'
                    }
                },
                subtitle: {
                    text: `${this.cpiData[0].year} to ${this.currentYear} (Index 1982-84 = 100)`,
                    style: { color: 'var(--text-secondary)' }
                },
                xAxis: { 
                    type: 'datetime',
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { 
                        text: 'CPI Value',
                        style: { color: 'var(--text-secondary)' }
                    },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: {
                    valueDecimals: 2,
                    xDateFormat: '%Y'
                },
                plotOptions: {
                    line: {
                        marker: { enabled: false },
                        lineWidth: 3,
                        color: '#3b82f6'
                    }
                },
                series: [{
                    name: 'CPI',
                    data: cpiEvolutionData,
                    color: '#3b82f6'
                }],
                credits: { enabled: false },
                legend: { 
                    enabled: false
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading CPI evolution chart:', error);
        }
    }

    /**
     * Charger le graphique d'inflation cumulée
     */
    async loadCumulativeInflationChart() {
        try {
            if (!this.cpiData || this.cpiData.length === 0) return;
            
            const baseCPI = this.cpiData[0].cpi;
            const cumulativeData = this.cpiData.map(d => [
                new Date(d.year, 0, 1).getTime(),
                ((d.cpi - baseCPI) / baseCPI) * 100
            ]);
            
            Highcharts.chart('cumulativeInflationChart', {
                chart: { 
                    type: 'area', 
                    backgroundColor: 'transparent',
                    height: 400
                },
                title: { 
                    text: `Cumulative Inflation Since ${this.cpiData[0].year}`,
                    style: { 
                        color: 'var(--text-primary)',
                        fontWeight: '800'
                    }
                },
                subtitle: {
                    text: `Total price increase from ${this.cpiData[0].year} base year`,
                    style: { color: 'var(--text-secondary)' }
                },
                xAxis: { 
                    type: 'datetime',
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { 
                        text: 'Cumulative Inflation (%)',
                        style: { color: 'var(--text-secondary)' }
                    },
                    labels: { 
                        style: { color: 'var(--text-secondary)' },
                        format: '{value}%'
                    },
                    gridLineColor: 'var(--border-color)'
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
                        color: '#8b5cf6',
                        fillColor: {
                            linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                            stops: [
                                [0, 'rgba(139, 92, 246, 0.5)'],
                                [1, 'rgba(139, 92, 246, 0.05)']
                            ]
                        }
                    }
                },
                series: [{
                    name: 'Cumulative Inflation',
                    data: cumulativeData,
                    color: '#8b5cf6'
                }],
                credits: { enabled: false },
                legend: { 
                    enabled: false
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading cumulative inflation chart:', error);
        }
    }

    /**
     * ✅ NEW: Charger le graphique d'inflation sectorielle
     */
    async loadSectoralInflationChart() {
        try {
            // Données estimées (basées sur des moyennes historiques réelles)
            const sectors = [
                { name: 'Housing (Shelter)', value: 5.2, color: '#ef4444' },
                { name: 'Medical Care', value: 4.8, color: '#f59e0b' },
                { name: 'Education', value: 4.5, color: '#f97316' },
                { name: 'Food & Beverages', value: 3.1, color: '#eab308' },
                { name: 'Transportation', value: 2.9, color: '#84cc16' },
                { name: 'Recreation', value: 2.2, color: '#22c55e' },
                { name: 'Apparel', value: 1.1, color: '#10b981' },
                { name: 'Communication', value: -0.5, color: '#3b82f6' }
            ];
            
            Highcharts.chart('sectoralInflationChart', {
                chart: { 
                    type: 'bar', 
                    backgroundColor: 'transparent',
                    height: 450
                },
                title: { 
                    text: 'Average Annual Inflation by Sector (Last 10 Years)',
                    style: { 
                        color: 'var(--text-primary)',
                        fontWeight: '800'
                    }
                },
                subtitle: {
                    text: 'Different sectors experience vastly different inflation rates',
                    style: { color: 'var(--text-secondary)' }
                },
                xAxis: { 
                    categories: sectors.map(s => s.name),
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { 
                        text: 'Average Annual Inflation (%)',
                        style: { color: 'var(--text-secondary)' }
                    },
                    labels: { 
                        style: { color: 'var(--text-secondary)' },
                        format: '{value}%'
                    },
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
                            text: 'Overall CPI Average',
                            style: { color: '#10b981', fontWeight: 'bold' }
                        }
                    }]
                },
                tooltip: {
                    valueDecimals: 1,
                    valueSuffix: '%'
                },
                plotOptions: {
                    bar: {
                        dataLabels: {
                            enabled: true,
                            format: '{y}%',
                            style: {
                                fontWeight: 'bold',
                                color: 'var(--text-primary)'
                            }
                        },
                        colorByPoint: true
                    }
                },
                colors: sectors.map(s => s.color),
                series: [{
                    name: 'Inflation Rate',
                    data: sectors.map(s => s.value)
                }],
                credits: { enabled: false },
                legend: { enabled: false }
            });
            
        } catch (error) {
            console.error('❌ Error loading sectoral inflation chart:', error);
        }
    }

    /**
     * Peupler le tableau par décennie
     */
    populateDecadeTable() {
        if (!this.cpiData || this.cpiData.length === 0) return;
        
        const tableBody = document.getElementById('decadeTableBody');
        tableBody.innerHTML = '';
        
        const decades = [
            { start: 1950, end: 1959, event: 'Post-War Boom' },
            { start: 1960, end: 1969, event: 'Economic Expansion' },
            { start: 1970, end: 1979, event: 'Oil Crisis & Stagflation' },
            { start: 1980, end: 1989, event: 'Volcker Disinflation' },
            { start: 1990, end: 1999, event: 'Tech Boom' },
            { start: 2000, end: 2009, event: 'Dot-com & Financial Crisis' },
            { start: 2010, end: 2019, event: 'Low Inflation Era' },
            { start: 2020, end: this.currentYear, event: 'Pandemic & Recovery' }
        ];
        
        decades.forEach(decade => {
            const decadeData = this.cpiData.filter(d => d.year >= decade.start && d.year <= decade.end);
            
            if (decadeData.length < 2) return;
            
            const startCPI = decadeData[0].cpi;
            const endCPI = decadeData[decadeData.length - 1].cpi;
            
            const years = decadeData.length - 1;
            const avgRate = years > 0 ? (Math.pow(endCPI / startCPI, 1 / years) - 1) * 100 : 0;
            const cumulativeRate = ((endCPI - startCPI) / startCPI) * 100;
            
            // Déterminer la classe CSS selon le taux
            let rateClass = 'low';
            if (avgRate > 5) rateClass = 'high';
            else if (avgRate > 3) rateClass = 'medium';
            
            const row = `
                <tr>
                    <td>${decade.start}s</td>
                    <td><span class="decade-rate ${rateClass}">${avgRate.toFixed(2)}%</span></td>
                    <td>${cumulativeRate.toFixed(2)}%</td>
                    <td>${decade.event}</td>
                </tr>
            `;
            
            tableBody.innerHTML += row;
        });
    }

    /**
     * ✅ NEW: Générer la heatmap d'inflation par décennie
     */
    generateInflationHeatmap() {
        if (!this.cpiData || this.cpiData.length === 0) return;
        
        const heatmapDiv = document.getElementById('inflationHeatmap');
        heatmapDiv.innerHTML = '';
        
        // Calculer les taux YoY
        const inflationRates = [];
        for (let i = 1; i < this.cpiData.length; i++) {
            const rate = ((this.cpiData[i].cpi - this.cpiData[i-1].cpi) / this.cpiData[i-1].cpi) * 100;
            inflationRates.push({
                year: this.cpiData[i].year,
                rate: rate
            });
        }
        
        // Grouper par décennie
        const startDecade = Math.floor(inflationRates[0].year / 10) * 10;
        const endDecade = Math.floor(inflationRates[inflationRates.length - 1].year / 10) * 10;
        
        // Headers (0-9)
        heatmapDiv.innerHTML += '<div class="heatmap-header"></div>'; // Empty corner
        for (let i = 0; i < 10; i++) {
            heatmapDiv.innerHTML += `<div class="heatmap-header">${i}</div>`;
        }
        
        // Rows (decades)
        for (let decade = startDecade; decade <= endDecade; decade += 10) {
            heatmapDiv.innerHTML += `<div class="heatmap-year-label">${decade}s</div>`;
            
            for (let i = 0; i < 10; i++) {
                const year = decade + i;
                const dataPoint = inflationRates.find(d => d.year === year);
                
                if (dataPoint) {
                    const rate = dataPoint.rate;
                    let cellClass = 'low';
                    if (rate > 10) cellClass = 'very-high';
                    else if (rate > 5) cellClass = 'high';
                    else if (rate > 2) cellClass = 'medium';
                    
                    heatmapDiv.innerHTML += `
                        <div class="heatmap-cell ${cellClass}" title="${year}: ${rate.toFixed(2)}%">
                            ${rate.toFixed(1)}
                        </div>
                    `;
                } else {
                    heatmapDiv.innerHTML += '<div class="heatmap-cell" style="background: transparent;"></div>';
                }
            }
        }
    }

    /**
     * ✅ NEW: Peupler les prix iconiques
     */
    populateIconicPrices() {
        const container = document.getElementById('iconicPricesGrid');
        container.innerHTML = '';
        
        Object.values(this.iconicPrices).forEach(item => {
            const increase = ((item[2024] - item[1980]) / item[1980]) * 100;
            
            const card = `
                <div class='price-card'>
                    <div class='price-icon'>${item.icon}</div>
                    <div class='price-title'>${item.name}</div>
                    <div class='price-comparison'>
                        <div class='price-year'>
                            <div class='price-year-label'>1980</div>
                            <div class='price-year-value'>$${item[1980].toFixed(2)}</div>
                        </div>
                        <div class='price-year'>
                            <div class='price-year-label'>2024</div>
                            <div class='price-year-value'>$${item[2024].toFixed(2)}</div>
                        </div>
                    </div>
                    <div class='price-change increase'>
                        +${increase.toFixed(0)}% increase
                    </div>
                </div>
            `;
            
            container.innerHTML += card;
        });
    }

    /**
     * ✅ NEW: Peupler les assets de protection
     */
    populateProtectionAssets() {
        const container = document.getElementById('protectionAssetsGrid');
        container.innerHTML = '';
        
        this.protectionAssets.forEach(asset => {
            const card = `
                <div class='asset-card'>
                    <div class='asset-icon'>${asset.icon}</div>
                    <div class='asset-name'>${asset.name}</div>
                    <div class='asset-description'>${asset.description}</div>
                    <div class='asset-metrics'>
                        <div class='asset-metric'>
                            <div class='asset-metric-label'>Return</div>
                            <div class='asset-metric-value'>${asset.historicalReturn}</div>
                        </div>
                        <div class='asset-metric'>
                            <div class='asset-metric-label'>Volatility</div>
                            <div class='asset-metric-value'>${asset.volatility}</div>
                        </div>
                        <div class='asset-metric'>
                            <div class='asset-metric-label'>Liquidity</div>
                            <div class='asset-metric-value'>${asset.liquidity}</div>
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML += card;
        });
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