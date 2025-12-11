/**
 * ====================================================================
 * ALPHAVAULT AI - MORTGAGE CALCULATOR
 * ====================================================================
 * Calculateur de prêt immobilier avec taux réels FRED
 */

class MortgageCalculator {
    constructor() {
        this.currentRates = {};
    }

    async init() {
        console.log('🏠 Initializing Mortgage Calculator...');
        
        try {
            await Promise.all([
                this.loadCurrentRates(),
                this.loadHistoricalRates()
            ]);
            
            // Auto-remplir le taux actuel dans le formulaire
            this.autoFillCurrentRate();
            
            console.log('✅ Mortgage Calculator loaded');
            
        } catch (error) {
            console.error('❌ Mortgage Calculator error:', error);
        }
    }

    /**
     * ========================================
     * LOAD CURRENT RATES
     * ========================================
     */
    async loadCurrentRates() {
        const grid = document.getElementById('currentRatesGrid');
        
        try {
            const [rate30Y, rate15Y] = await Promise.all([
                economicDataClient.getSeries('MORTGAGE30US', { limit: 1 }),
                economicDataClient.getSeries('MORTGAGE15US', { limit: 1 })
            ]);

            const rate30 = this.parseLatest(rate30Y);
            const rate15 = this.parseLatest(rate15Y);

            this.currentRates.rate30Y = rate30;
            this.currentRates.rate15Y = rate15;

            grid.innerHTML = `
                <div class='eco-card us-card'>
                    <div class='eco-card-header'>
                        <h3 class='eco-card-title'>30-Year Fixed</h3>
                        <span class='eco-flag'>🏠</span>
                    </div>
                    <div class='eco-value' style='font-size: 3rem;'>${rate30}%</div>
                    <div class='eco-sublabel'>Current Average Rate</div>
                </div>

                <div class='eco-card us-card'>
                    <div class='eco-card-header'>
                        <h3 class='eco-card-title'>15-Year Fixed</h3>
                        <span class='eco-flag'>🏠</span>
                    </div>
                    <div class='eco-value' style='font-size: 3rem;'>${rate15}%</div>
                    <div class='eco-sublabel'>Current Average Rate</div>
                </div>

                <div class='eco-card us-card' style='grid-column: span 2;'>
                    <div class='eco-card-header'>
                        <h3 class='eco-card-title'>Rate Comparison</h3>
                        <span class='eco-flag'>📊</span>
                    </div>
                    <div style='display: flex; justify-content: space-around; margin-top: 20px;'>
                        <div style='text-align: center;'>
                            <div style='font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;'>Monthly Payment<br>(30Y on $300k)</div>
                            <div style='font-size: 1.8rem; font-weight: 900; color: var(--ml-primary);'>
                                ${this.calculateMonthlyPayment(300000, parseFloat(rate30), 30).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
                            </div>
                        </div>
                        <div style='text-align: center;'>
                            <div style='font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 8px;'>Monthly Payment<br>(15Y on $300k)</div>
                            <div style='font-size: 1.8rem; font-weight: 900; color: var(--ml-secondary);'>
                                ${this.calculateMonthlyPayment(300000, parseFloat(rate15), 15).toLocaleString('en-US', {style: 'currency', currency: 'USD'})}
                            </div>
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('❌ Error loading current rates:', error);
            grid.innerHTML = '<div class="eco-error">Error loading rates</div>';
        }
    }

    /**
     * Auto-remplir le taux actuel
     */
    autoFillCurrentRate() {
        const interestRateInput = document.getElementById('interestRate');
        if (interestRateInput && this.currentRates.rate30Y) {
            interestRateInput.value = this.currentRates.rate30Y;
        }
    }

    /**
     * ========================================
     * CALCULATE MORTGAGE
     * ========================================
     */
    calculate() {
        const homePrice = parseFloat(document.getElementById('homePrice').value);
        const downPaymentPct = parseFloat(document.getElementById('downPayment').value);
        const loanTerm = parseInt(document.getElementById('loanTerm').value);
        const interestRate = parseFloat(document.getElementById('interestRate').value);
        const propertyTax = parseFloat(document.getElementById('propertyTax').value);
        const homeInsurance = parseFloat(document.getElementById('homeInsurance').value);

        // Validation
        if (isNaN(homePrice) || homePrice <= 0) {
            alert('Please enter a valid home price');
            return;
        }

        if (isNaN(interestRate) || interestRate < 0) {
            alert('Please enter a valid interest rate');
            return;
        }

        // Calculs
        const downPaymentAmount = homePrice * (downPaymentPct / 100);
        const loanAmount = homePrice - downPaymentAmount;
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;

        // Formule de paiement mensuel
        const monthlyPayment = this.calculateMonthlyPayment(loanAmount, interestRate, loanTerm);

        const totalPaid = monthlyPayment * numberOfPayments;
        const totalInterest = totalPaid - loanAmount;

        const monthlyTax = propertyTax / 12;
        const monthlyInsurance = homeInsurance / 12;
        const totalMonthlyPayment = monthlyPayment + monthlyTax + monthlyInsurance;

        // Afficher les résultats
        document.getElementById('mortgageResults').style.display = 'block';
        document.getElementById('monthlyPayment').textContent = monthlyPayment.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
        document.getElementById('totalMonthly').textContent = totalMonthlyPayment.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
        document.getElementById('loanAmount').textContent = loanAmount.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
        document.getElementById('downPaymentAmount').textContent = downPaymentAmount.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
        document.getElementById('totalInterest').textContent = totalInterest.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
        document.getElementById('totalPaid').textContent = totalPaid.toLocaleString('en-US', {style: 'currency', currency: 'USD'});

        // Générer le graphique d'amortissement
        this.generateAmortizationChart(loanAmount, monthlyRate, numberOfPayments, monthlyPayment);
    }

    /**
     * Calculer le paiement mensuel (Principal + Interest)
     */
    calculateMonthlyPayment(principal, annualRate, years) {
        const monthlyRate = annualRate / 100 / 12;
        const numberOfPayments = years * 12;
        
        if (monthlyRate === 0) {
            return principal / numberOfPayments;
        }
        
        return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
               (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    /**
     * ========================================
     * AMORTIZATION CHART
     * ========================================
     */
    generateAmortizationChart(loanAmount, monthlyRate, numberOfPayments, monthlyPayment) {
        document.getElementById('amortizationSection').style.display = 'block';

        const principalData = [];
        const interestData = [];
        const balanceData = [];
        
        let balance = loanAmount;
        
        for (let month = 1; month <= numberOfPayments; month++) {
            const interestPayment = balance * monthlyRate;
            const principalPayment = monthlyPayment - interestPayment;
            balance -= principalPayment;

            if (month % 12 === 0 || month === 1) { // Afficher chaque année
                const year = Math.floor(month / 12);
                principalData.push([year, principalPayment]);
                interestData.push([year, interestPayment]);
                balanceData.push([year, Math.max(0, balance)]);
            }
        }

        Highcharts.chart('amortizationChart', {
            chart: { 
                type: 'column', 
                backgroundColor: 'transparent'
            },
            title: { 
                text: 'Principal vs Interest Payment Over Time',
                style: { color: 'var(--text-primary)', fontWeight: '800' }
            },
            xAxis: { 
                title: { text: 'Year', style: { color: 'var(--text-secondary)' } },
                labels: { style: { color: 'var(--text-secondary)' } }
            },
            yAxis: [{ 
                title: { text: 'Monthly Payment ($)', style: { color: 'var(--text-secondary)' } },
                labels: { 
                    style: { color: 'var(--text-secondary)' },
                    formatter: function() {
                        return '$' + this.value.toFixed(0);
                    }
                },
                gridLineColor: 'var(--border-color)'
            }, {
                title: { text: 'Remaining Balance ($)', style: { color: 'var(--text-secondary)' } },
                labels: { 
                    style: { color: 'var(--text-secondary)' },
                    formatter: function() {
                        return '$' + (this.value / 1000).toFixed(0) + 'k';
                    }
                },
                opposite: true
            }],
            tooltip: {
                shared: true,
                valuePrefix: '$',
                valueDecimals: 0
            },
            plotOptions: {
                column: {
                    stacking: 'normal'
                }
            },
            series: [{
                name: 'Principal',
                data: principalData,
                color: '#10b981',
                yAxis: 0
            }, {
                name: 'Interest',
                data: interestData,
                color: '#ef4444',
                yAxis: 0
            }, {
                name: 'Remaining Balance',
                data: balanceData,
                type: 'line',
                color: '#3b82f6',
                yAxis: 1,
                marker: { enabled: false },
                lineWidth: 3
            }],
            credits: { enabled: false },
            legend: { 
                enabled: true,
                itemStyle: { color: 'var(--text-primary)' }
            }
        });

        // Scroll vers le graphique
        document.getElementById('amortizationSection').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * ========================================
     * HISTORICAL RATES CHART
     * ========================================
     */
    async loadHistoricalRates() {
        try {
            const [rate30Y, rate15Y] = await Promise.all([
                economicDataClient.getSeries('MORTGAGE30US', { limit: 520 }), // ~10 ans
                economicDataClient.getSeries('MORTGAGE15US', { limit: 520 })
            ]);

            const data30Y = rate30Y
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            const data15Y = rate15Y
                .filter(d => d.value !== '.')
                .map(d => [new Date(d.date).getTime(), parseFloat(d.value)]);

            Highcharts.chart('historicalRatesChart', {
                chart: { 
                    type: 'line', 
                    backgroundColor: 'transparent'
                },
                title: { 
                    text: 'US Mortgage Rates - Historical Trends',
                    style: { color: 'var(--text-primary)', fontWeight: '800' }
                },
                subtitle: {
                    text: 'Freddie Mac Primary Mortgage Market Survey',
                    style: { color: 'var(--text-secondary)' }
                },
                xAxis: { 
                    type: 'datetime',
                    labels: { style: { color: 'var(--text-secondary)' } }
                },
                yAxis: { 
                    title: { text: 'Interest Rate (%)', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: {
                    valueSuffix: '%',
                    valueDecimals: 2,
                    shared: true
                },
                series: [{
                    name: '30-Year Fixed',
                    data: data30Y,
                    color: '#3b82f6',
                    marker: { enabled: false },
                    lineWidth: 3
                }, {
                    name: '15-Year Fixed',
                    data: data15Y,
                    color: '#8b5cf6',
                    marker: { enabled: false },
                    lineWidth: 3
                }],
                credits: { enabled: false },
                legend: { 
                    enabled: true,
                    itemStyle: { color: 'var(--text-primary)' }
                }
            });

        } catch (error) {
            console.error('❌ Error loading historical rates:', error);
        }
    }

    /**
     * ========================================
     * HELPERS
     * ========================================
     */
    parseLatest(series) {
        if (!series || !Array.isArray(series) || series.length === 0) return 'N/A';
        for (let i = series.length - 1; i >= 0; i--) {
            if (series[i].value !== '.') {
                return parseFloat(series[i].value).toFixed(2);
            }
        }
        return 'N/A';
    }
}

// ========================================
// INITIALISATION
// ========================================

let mortgageCalculator;

document.addEventListener('DOMContentLoaded', () => {
    mortgageCalculator = new MortgageCalculator();
    mortgageCalculator.init();
});