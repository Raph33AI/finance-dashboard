/* ==============================================
   MONTE-CARLO.JS - Logique de simulation Monte Carlo
   ============================================== */

// Module MonteCarlo (pattern IIFE)
const MonteCarlo = (function() {
    'use strict';
    
    // ========== VARIABLES PRIVÉES ==========
    let simulationResults = null;
    
    // ========== FONCTIONS UTILITAIRES ==========
    
    /**
     * Génère une valeur aléatoire suivant une distribution normale
     * Utilise la transformation de Box-Muller
     */
    function randomNormal(mean = 0, stdDev = 1) {
        let u1 = Math.random();
        let u2 = Math.random();
        let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z0 * stdDev + mean;
    }
    
    /**
     * Calcule le percentile d'un tableau
     */
    function percentile(arr, p) {
        const sorted = arr.slice().sort((a, b) => a - b);
        const index = (p / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
    
    /**
     * Ajuste une valeur pour l'inflation
     */
    function adjustForInflationMC(value, monthIndex, inflationRate) {
        const monthlyInflation = Math.pow(1 + inflationRate / 100, 1/12) - 1;
        return value / Math.pow(1 + monthlyInflation, monthIndex);
    }
    
    // ========== SIMULATION MONTE CARLO ==========
    
    /**
     * Lance la simulation Monte Carlo
     */
    function runSimulation() {
        // Récupération des paramètres
        const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestment').value) || 0;
        const monthlyYield = parseFloat(document.getElementById('monthlyYield').value) / 100 || 0;
        const annualVolatility = parseFloat(document.getElementById('volatility').value) / 100 || 0;
        const monthlyVolatility = annualVolatility / Math.sqrt(12);
        const years = parseInt(document.getElementById('years').value) || 1;
        const nbSimulations = parseInt(document.getElementById('simulations').value) || 1000;
        const targetValue = parseFloat(document.getElementById('targetValue').value) || 0;
        const inflationRate = parseFloat(document.getElementById('inflationRateMC').value) || 2.5;
        const showInflation = document.getElementById('showInflationMC').checked;
        
        const totalMonths = years * 12;
        
        // Validation
        if (monthlyInvestment <= 0) {
            alert('Monthly investment must be greater than 0!');
            return;
        }
        
        if (nbSimulations < 100) {
            alert('Number of simulations must be at least 100!');
            return;
        }
        
        // Afficher un message de chargement
        window.FinanceDashboard.showNotification('Running ' + nbSimulations + ' simulations...', 'info');
        
        // Lancer la simulation de manière asynchrone pour ne pas bloquer l'UI
        setTimeout(() => {
            try {
                const results = executeSimulation(
                    monthlyInvestment,
                    monthlyYield,
                    monthlyVolatility,
                    totalMonths,
                    nbSimulations,
                    targetValue
                );
                
                displayResults(results, totalMonths, monthlyInvestment, targetValue, inflationRate, showInflation);
                
                window.FinanceDashboard.showNotification('Simulation completed successfully!', 'success');
            } catch (error) {
                console.error('Simulation error:', error);
                window.FinanceDashboard.showNotification('Simulation failed: ' + error.message, 'error');
            }
        }, 100);
    }
    
    /**
     * Exécute la simulation Monte Carlo
     */
    function executeSimulation(monthlyInvestment, monthlyYield, monthlyVolatility, totalMonths, nbSimulations, targetValue) {
        const allSimulations = [];
        const finalValues = [];
        const monthsToTarget = [];
        
        for (let sim = 0; sim < nbSimulations; sim++) {
            let portfolio = 0;
            const path = [0];
            
            for (let month = 0; month < totalMonths; month++) {
                const randomReturn = randomNormal(monthlyYield, monthlyVolatility);
                portfolio = portfolio * (1 + randomReturn) + monthlyInvestment;
                path.push(portfolio);
                
                // Vérifier si la cible est atteinte
                if (portfolio >= targetValue && monthsToTarget.length === sim) {
                    monthsToTarget.push(month + 1);
                }
            }
            
            // Si la cible n'est jamais atteinte, marquer comme "jamais"
            if (monthsToTarget.length === sim) {
                monthsToTarget.push(totalMonths + 1);
            }
            
            allSimulations.push(path);
            finalValues.push(portfolio);
        }
        
        return {
            allSimulations,
            finalValues,
            monthsToTarget
        };
    }
    
    // ========== AFFICHAGE DES RÉSULTATS ==========
    
    /**
     * Affiche les résultats de la simulation
     */
    function displayResults(results, totalMonths, monthlyInvestment, targetValue, inflationRate, showInflation) {
        const { allSimulations, finalValues, monthsToTarget } = results;
        
        simulationResults = results;
        
        // Afficher le panneau de résultats
        const resultsPanel = document.getElementById('resultsPanel');
        if (resultsPanel) {
            resultsPanel.classList.remove('hidden');
            resultsPanel.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Calculer les statistiques
        const median = percentile(finalValues, 50);
        const p10 = percentile(finalValues, 10);
        const p90 = percentile(finalValues, 90);
        const best = Math.max(...finalValues);
        const worst = Math.min(...finalValues);
        const avgFinal = finalValues.reduce((a, b) => a + b, 0) / finalValues.length;
        
        // Ajuster pour l'inflation si nécessaire
        const medianReal = showInflation ? adjustForInflationMC(median, totalMonths, inflationRate) : median;
        const avgFinalReal = showInflation ? adjustForInflationMC(avgFinal, totalMonths, inflationRate) : avgFinal;
        
        // Afficher les statistiques principales
        displayMainStats(median, avgFinal, p10, p90, best, worst, medianReal, avgFinalReal, showInflation);
        
        // Créer les graphiques
        createChart1(allSimulations, totalMonths, median, p10, p90, inflationRate, showInflation);
        createChart2(finalValues, inflationRate, showInflation, totalMonths);
        createChart3(finalValues, targetValue);
        createRiskAnalysis(finalValues, totalMonths, monthlyInvestment);
        createChart4(allSimulations, totalMonths, monthlyInvestment);
        createChart5(monthsToTarget, targetValue);
    }
    
    /**
     * Affiche les statistiques principales
     */
    function displayMainStats(median, avgFinal, p10, p90, best, worst, medianReal, avgFinalReal, showInflation) {
        const statsContainer = document.getElementById('statsContainer');
        if (!statsContainer) return;
        
        let statsHTML = '';
        
        statsHTML += '<div class="stat-box">';
        statsHTML += '<div class="label">Median (50th percentile)</div>';
        statsHTML += '<div class="value">' + window.FinanceDashboard.formatNumber(median, 0) + ' EUR</div>';
        if (showInflation) {
            statsHTML += '<div style="font-size: 0.9em; color: #9D5CE6; margin-top: 5px;">Real: ' + 
                         window.FinanceDashboard.formatNumber(medianReal, 0) + ' EUR</div>';
        }
        statsHTML += '</div>';
        
        statsHTML += '<div class="stat-box">';
        statsHTML += '<div class="label">Average Final Value</div>';
        statsHTML += '<div class="value">' + window.FinanceDashboard.formatNumber(avgFinal, 0) + ' EUR</div>';
        if (showInflation) {
            statsHTML += '<div style="font-size: 0.9em; color: #9D5CE6; margin-top: 5px;">Real: ' + 
                         window.FinanceDashboard.formatNumber(avgFinalReal, 0) + ' EUR</div>';
        }
        statsHTML += '</div>';
        
        statsHTML += '<div class="stat-box">';
        statsHTML += '<div class="label">10th Percentile (Pessimistic)</div>';
        statsHTML += '<div class="value">' + window.FinanceDashboard.formatNumber(p10, 0) + ' EUR</div>';
        statsHTML += '</div>';
        
        statsHTML += '<div class="stat-box">';
        statsHTML += '<div class="label">90th Percentile (Optimistic)</div>';
        statsHTML += '<div class="value">' + window.FinanceDashboard.formatNumber(p90, 0) + ' EUR</div>';
        statsHTML += '</div>';
        
        statsHTML += '<div class="stat-box">';
        statsHTML += '<div class="label">Best Case</div>';
        statsHTML += '<div class="value">' + window.FinanceDashboard.formatNumber(best, 0) + ' EUR</div>';
        statsHTML += '</div>';
        
        statsHTML += '<div class="stat-box">';
        statsHTML += '<div class="label">Worst Case</div>';
        statsHTML += '<div class="value">' + window.FinanceDashboard.formatNumber(worst, 0) + ' EUR</div>';
        statsHTML += '</div>';
        
        statsContainer.innerHTML = statsHTML;
    }
    
    // ========== GRAPHIQUES ==========
    
    /**
     * Graphique 1 : Évolution du portefeuille dans le temps
     */
    function createChart1(allSimulations, totalMonths, median, p10, p90, inflationRate, showInflation) {
        const months = Array.from({length: totalMonths + 1}, (_, i) => i);
        
        // Calculer les chemins de percentiles
        const medianPath = months.map(m => {
            const values = allSimulations.map(sim => sim[m]);
            return percentile(values, 50);
        });
        
        const p10Path = months.map(m => {
            const values = allSimulations.map(sim => sim[m]);
            return percentile(values, 10);
        });
        
        const p90Path = months.map(m => {
            const values = allSimulations.map(sim => sim[m]);
            return percentile(values, 90);
        });
        
        const series = [
            { 
                name: 'P90 (Optimistic)', 
                data: p90Path, 
                color: '#4A74F3', 
                lineWidth: 2, 
                dashStyle: 'Dash' 
            },
            { 
                name: 'Median', 
                data: medianPath, 
                color: '#2649B2', 
                lineWidth: 3 
            },
            { 
                name: 'P10 (Pessimistic)', 
                data: p10Path, 
                color: '#8E44AD', 
                lineWidth: 2, 
                dashStyle: 'Dash' 
            }
        ];
        
        // Ajouter le chemin ajusté pour l'inflation si nécessaire
        if (showInflation) {
            const medianPathReal = months.map(m => {
                const values = allSimulations.map(sim => sim[m]);
                const nominalValue = percentile(values, 50);
                return adjustForInflationMC(nominalValue, m, inflationRate);
            });
            series.push({ 
                name: 'Median (Real)', 
                data: medianPathReal, 
                color: '#9D5CE6', 
                lineWidth: 3, 
                dashStyle: 'ShortDot' 
            });
        }
        
        // Ajouter quelques simulations en arrière-plan
        const samplePaths = [];
        const sampleCount = Math.min(50, allSimulations.length);
        const step = Math.floor(allSimulations.length / sampleCount);
        
        for (let i = 0; i < allSimulations.length; i += step) {
            if (samplePaths.length >= sampleCount) break;
            samplePaths.push({ 
                name: 'Simulation', 
                data: allSimulations[i], 
                color: 'rgba(212,217,240,0.3)', 
                lineWidth: 1, 
                enableMouseTracking: false, 
                showInLegend: false 
            });
        }
        
        Highcharts.chart('chart1', {
            chart: { 
                type: 'line', 
                backgroundColor: 'transparent', 
                zoomType: 'xy' 
            },
            title: { 
                text: showInflation ? 'Inflation Rate: ' + inflationRate + '% annual' : null, 
                style: { color: '#9D5CE6', fontSize: '1em' } 
            },
            xAxis: { 
                title: { text: 'Months', style: { color: '#2649B2' } }, 
                crosshair: true 
            },
            yAxis: { 
                title: { text: 'Portfolio Value (EUR)', style: { color: '#2649B2' } } 
            },
            tooltip: { 
                shared: true, 
                valueDecimals: 0, 
                valueSuffix: ' EUR' 
            },
            series: [...samplePaths, ...series],
            plotOptions: { 
                line: { marker: { enabled: false } } 
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique 2 : Distribution des rendements finaux
     */
    function createChart2(finalValues, inflationRate, showInflation, totalMonths) {
        const finalValuesReal = showInflation ? 
            finalValues.map(v => adjustForInflationMC(v, totalMonths, inflationRate)) : 
            finalValues;
        
        const dataToDisplay = showInflation ? finalValuesReal : finalValues;
        
        // Créer l'histogramme
        const min = Math.min(...dataToDisplay);
        const max = Math.max(...dataToDisplay);
        const binWidth = (max - min) / 30;
        const bins = Array.from({length: 30}, (_, i) => ({ 
            x: min + i * binWidth, 
            y: 0 
        }));
        
        dataToDisplay.forEach(val => {
            const binIndex = Math.min(Math.floor((val - min) / binWidth), 29);
            bins[binIndex].y++;
        });
        
        Highcharts.chart('chart2', {
            chart: { 
                type: 'column', 
                backgroundColor: 'transparent' 
            },
            title: { 
                text: showInflation ? 'Real Returns (Inflation-Adjusted)' : 'Nominal Returns', 
                style: { color: showInflation ? '#9D5CE6' : '#2649B2', fontSize: '1em' } 
            },
            xAxis: { 
                title: { text: 'Final Portfolio Value (EUR)', style: { color: '#2649B2' } }, 
                labels: { formatter: function() { return this.value.toLocaleString(); } } 
            },
            yAxis: { 
                title: { text: 'Frequency', style: { color: '#2649B2' } } 
            },
            tooltip: { 
                pointFormat: 'Value: <b>{point.x:,.0f} EUR</b><br/>Frequency: <b>{point.y}</b>' 
            },
            series: [{ 
                name: 'Distribution', 
                data: bins, 
                color: showInflation ? '#9D5CE6' : '#4A74F3', 
                borderRadius: '25%' 
            }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique 3 : Analyse de probabilité (atteindre la cible)
     */
    function createChart3(finalValues, targetValue) {
        const aboveTarget = finalValues.filter(v => v >= targetValue).length;
        const successRate = (aboveTarget / finalValues.length * 100).toFixed(1);
        
        Highcharts.chart('chart3', {
            chart: { 
                type: 'pie', 
                backgroundColor: 'transparent' 
            },
            title: { 
                text: 'Success Rate: ' + successRate + '%', 
                style: { color: '#2649B2', fontWeight: 'bold', fontSize: '1.3em' } 
            },
            tooltip: { 
                pointFormat: '<b>{point.name}</b>: {point.percentage:.1f}% ({point.y} simulations)' 
            },
            plotOptions: { 
                pie: { 
                    innerSize: '60%', 
                    dataLabels: { 
                        format: '<b>{point.name}</b><br/>{point.percentage:.1f}%', 
                        style: { color: '#2649B2', fontSize: '12px' } 
                    }, 
                    borderWidth: 3, 
                    borderColor: '#E8DAEF' 
                } 
            },
            series: [{ 
                name: 'Probability', 
                data: [
                    { name: 'Above Target', y: aboveTarget, color: '#4A74F3' },
                    { name: 'Below Target', y: finalValues.length - aboveTarget, color: '#9D5CE6' }
                ] 
            }],
            credits: { enabled: false }
        });
    }
    
    /**
     * Analyse de risque
     */
    function createRiskAnalysis(finalValues, totalMonths, monthlyInvestment) {
        const totalInvested = monthlyInvestment * totalMonths;
        const losses = finalValues.filter(v => v < totalInvested).length;
        const lossRate = (losses / finalValues.length * 100).toFixed(1);
        const avgReturn = ((finalValues.reduce((a, b) => a + b, 0) / finalValues.length - totalInvested) / totalInvested * 100).toFixed(1);
        const medianReturn = ((percentile(finalValues, 50) - totalInvested) / totalInvested * 100).toFixed(1);
        const valueAtRisk5 = percentile(finalValues, 5);
        const var5Return = ((valueAtRisk5 - totalInvested) / totalInvested * 100).toFixed(1);
        
        const riskHTML = `
            <div class='stat-box'>
                <div class='label'>Total Invested</div>
                <div class='value'>${window.FinanceDashboard.formatNumber(totalInvested, 0)} EUR</div>
            </div>
            <div class='stat-box'>
                <div class='label'>Average Return</div>
                <div class='value'>${avgReturn}%</div>
            </div>
            <div class='stat-box'>
                <div class='label'>Median Return</div>
                <div class='value'>${medianReturn}%</div>
            </div>
            <div class='stat-box'>
                <div class='label'>Loss Probability</div>
                <div class='value'>${lossRate}%</div>
            </div>
            <div class='stat-box'>
                <div class='label'>VaR (5%)</div>
                <div class='value'>${window.FinanceDashboard.formatNumber(valueAtRisk5, 0)} EUR</div>
            </div>
            <div class='stat-box'>
                <div class='label'>VaR Return (5%)</div>
                <div class='value'>${var5Return}%</div>
            </div>
        `;
        
        const container = document.getElementById('riskAnalysis');
        if (container) container.innerHTML = riskHTML;
    }
    
    /**
     * Graphique 4 : Tests de stress
     */
    function createChart4(allSimulations, totalMonths, monthlyInvestment) {
        const scenarios = [
            { name: 'Financial Crisis (-40%)', shock: -0.40 },
            { name: 'Moderate Recession (-20%)', shock: -0.20 },
            { name: 'Market Correction (-10%)', shock: -0.10 },
            { name: 'Normal Conditions (0%)', shock: 0 },
            { name: 'Bull Market (+20%)', shock: 0.20 }
        ];
        
        const categories = scenarios.map(s => s.name);
        const data = scenarios.map(scenario => {
            const stressedValues = allSimulations.map(sim => sim[totalMonths] * (1 + scenario.shock));
            return percentile(stressedValues, 50);
        });
        
        Highcharts.chart('chart4', {
            chart: { 
                type: 'column', 
                backgroundColor: 'transparent' 
            },
            title: { 
                text: 'Portfolio Value Under Different Scenarios', 
                style: { color: '#2649B2', fontSize: '1.1em' } 
            },
            xAxis: { 
                categories: categories, 
                labels: { rotation: -15, style: { fontSize: '10px' } } 
            },
            yAxis: { 
                title: { text: 'Median Portfolio Value (EUR)', style: { color: '#2649B2' } } 
            },
            tooltip: { 
                valueDecimals: 0, 
                valueSuffix: ' EUR' 
            },
            series: [{ 
                name: 'Median Value', 
                data: data, 
                colorByPoint: true, 
                colors: ['#8E44AD', '#9D5CE6', '#6C8BE0', '#2649B2', '#4A74F3'], 
                borderRadius: '25%' 
            }],
            plotOptions: { 
                column: { 
                    dataLabels: { 
                        enabled: true, 
                        format: '{point.y:,.0f}', 
                        style: { fontSize: '10px' } 
                    } 
                } 
            },
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique 5 : Temps pour atteindre la cible
     */
    function createChart5(monthsToTarget, targetValue) {
        const min = Math.min(...monthsToTarget);
        const max = Math.max(...monthsToTarget);
        const binWidth = Math.max(1, Math.ceil((max - min) / 20));
        const bins = [];
        
        for (let i = min; i <= max; i += binWidth) {
            bins.push({ x: i, y: 0 });
        }
        
        monthsToTarget.forEach(m => {
            const binIndex = Math.min(Math.floor((m - min) / binWidth), bins.length - 1);
            bins[binIndex].y++;
        });
        
        const medianTime = percentile(monthsToTarget, 50);
        const p10Time = percentile(monthsToTarget, 10);
        const p90Time = percentile(monthsToTarget, 90);
        
        Highcharts.chart('chart5', {
            chart: { 
                type: 'column', 
                backgroundColor: 'transparent' 
            },
            title: { 
                text: 'Time to Reach ' + targetValue.toLocaleString() + ' EUR', 
                style: { color: '#2649B2', fontSize: '1.2em' } 
            },
            subtitle: { 
                text: 'Median: ' + medianTime.toFixed(0) + ' months (' + (medianTime/12).toFixed(1) + 
                      ' years) | P10: ' + p10Time.toFixed(0) + ' | P90: ' + p90Time.toFixed(0), 
                style: { color: '#6C3483' } 
            },
            xAxis: { 
                title: { text: 'Months', style: { color: '#2649B2' } } 
            },
            yAxis: { 
                title: { text: 'Frequency', style: { color: '#2649B2' } } 
            },
            tooltip: { 
                pointFormat: 'Months: <b>{point.x}</b><br/>Frequency: <b>{point.y}</b>' 
            },
            series: [{ 
                name: 'Distribution', 
                data: bins, 
                color: '#6C8BE0', 
                borderRadius: '25%' 
            }],
            plotOptions: { 
                column: { pointPlacement: 'on' } 
            },
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    // ========== EXPORTS PUBLICS ==========
    return {
        runSimulation
    };
})();

/* ============================================
   SIDEBAR USER MENU - Toggle
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const sidebarUserTrigger = document.getElementById('sidebarUserTrigger');
    const sidebarUserDropdown = document.getElementById('sidebarUserDropdown');
    
    if (sidebarUserTrigger && sidebarUserDropdown) {
        // Toggle dropdown au clic
        sidebarUserTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Toggle classes
            sidebarUserTrigger.classList.toggle('active');
            sidebarUserDropdown.classList.toggle('active');
        });
        
        // Fermer le dropdown si on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!sidebarUserDropdown.contains(e.target) && 
                !sidebarUserTrigger.contains(e.target)) {
                sidebarUserTrigger.classList.remove('active');
                sidebarUserDropdown.classList.remove('active');
            }
        });
        
        // Empêcher la fermeture si on clique dans le dropdown
        sidebarUserDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
});

console.log('✅ Menu utilisateur sidebar initialisé');