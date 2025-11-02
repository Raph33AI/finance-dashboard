/* ==============================================
   SCENARIO-ANALYSIS.JS - Analyse de scénarios
   ============================================== */

const ScenarioAnalysis = (function() {
    'use strict';
    
    // ========== SCÉNARIOS PRÉDÉFINIS ==========
    const scenarios = [
        {
            name: 'Financial Crisis 2008',
            description: 'Global banking collapse, housing market crash',
            impacts: { stocks: -40, bonds: 5, realEstate: -35, commodities: -30, cash: 0 }
        },
        {
            name: 'High Inflation 1970s',
            description: 'Oil shocks, stagflation, rising rates',
            impacts: { stocks: -10, bonds: -15, realEstate: 8, commodities: 25, cash: -15 }
        },
        {
            name: 'Tech Boom 1999',
            description: 'Dot-com bubble, irrational exuberance',
            impacts: { stocks: 60, bonds: -3, realEstate: 5, commodities: -5, cash: 2 }
        },
        {
            name: 'COVID-19 Pandemic 2020',
            description: 'Global lockdowns, unprecedented stimulus',
            impacts: { stocks: 35, bonds: 8, realEstate: 10, commodities: -20, cash: 0 }
        },
        {
            name: 'Mild Recession',
            description: 'Economic slowdown, moderate unemployment',
            impacts: { stocks: -20, bonds: 3, realEstate: -10, commodities: -15, cash: 1 }
        },
        {
            name: 'Strong Bull Market',
            description: 'Economic expansion, low unemployment',
            impacts: { stocks: 25, bonds: -2, realEstate: 12, commodities: 8, cash: 1 }
        }
    ];
    
    // ========== INITIALISATION ==========
    function init() {
        updateTotalAllocation();
    }
    
    // ========== GESTION DU PORTEFEUILLE ==========
    
    /**
     * Met à jour l'affichage de l'allocation totale
     */
    function updateTotalAllocation() {
        const stocks = parseFloat(document.getElementById('allocStocks').value) || 0;
        const bonds = parseFloat(document.getElementById('allocBonds').value) || 0;
        const realEstate = parseFloat(document.getElementById('allocRealEstate').value) || 0;
        const commodities = parseFloat(document.getElementById('allocCommodities').value) || 0;
        const cash = parseFloat(document.getElementById('allocCash').value) || 0;
        
        const total = stocks + bonds + realEstate + commodities + cash;
        const display = document.getElementById('totalAllocation');
        
        if (display) {
            display.textContent = total.toFixed(1) + '%';
            
            if (Math.abs(total - 100) > 0.1) {
                display.classList.add('error');
            } else {
                display.classList.remove('error');
            }
        }
    }
    
    // ========== ANALYSE ==========
    
    /**
     * Lance l'analyse de scénarios
     */
    function runAnalysis() {
        // Récupérer l'allocation du portefeuille
        const portfolio = {
            stocks: parseFloat(document.getElementById('allocStocks').value) || 0,
            bonds: parseFloat(document.getElementById('allocBonds').value) || 0,
            realEstate: parseFloat(document.getElementById('allocRealEstate').value) || 0,
            commodities: parseFloat(document.getElementById('allocCommodities').value) || 0,
            cash: parseFloat(document.getElementById('allocCash').value) || 0
        };
        
        // Valider que le total = 100%
        const total = portfolio.stocks + portfolio.bonds + portfolio.realEstate + 
                      portfolio.commodities + portfolio.cash;
        
        if (Math.abs(total - 100) > 0.1) {
            alert('Total allocation must equal 100%. Current total: ' + total.toFixed(1) + '%');
            return;
        }
        
        // Calculer les résultats pour chaque scénario
        const results = scenarios.map(scenario => {
            const returns = calculateScenarioReturn(portfolio, scenario.impacts);
            return {
                name: scenario.name,
                description: scenario.description,
                portfolioReturn: returns.total,
                breakdown: returns.breakdown
            };
        });
        
        displayResults(results, portfolio);
    }
    
    /**
     * Calcule le rendement du portefeuille pour un scénario
     */
    function calculateScenarioReturn(portfolio, impacts) {
        const breakdown = {
            stocks: (portfolio.stocks / 100) * impacts.stocks,
            bonds: (portfolio.bonds / 100) * impacts.bonds,
            realEstate: (portfolio.realEstate / 100) * impacts.realEstate,
            commodities: (portfolio.commodities / 100) * impacts.commodities,
            cash: (portfolio.cash / 100) * impacts.cash
        };
        
        const total = breakdown.stocks + breakdown.bonds + breakdown.realEstate + 
                      breakdown.commodities + breakdown.cash;
        
        return { total, breakdown };
    }
    
    // ========== AFFICHAGE DES RÉSULTATS ==========
    
    /**
     * Affiche les résultats de l'analyse
     */
    function displayResults(results, portfolio) {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Statistiques récapitulatives
        const returns = results.map(r => r.portfolioReturn);
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const maxReturn = Math.max(...returns);
        const minReturn = Math.min(...returns);
        const positiveScenarios = returns.filter(r => r > 0).length;
        const negativeScenarios = returns.filter(r => r < 0).length;
        
        displaySummaryStats(maxReturn, minReturn, avgReturn, positiveScenarios, negativeScenarios, results.length);
        createScenariosChart(results);
        createRiskReturnChart(results);
        createDetailedTable(results, portfolio);
        generateRecommendations(results, portfolio);
        
        window.FinanceDashboard.showNotification('Analysis completed successfully!', 'success');
    }
    
    /**
     * Affiche les statistiques récapitulatives
     */
    function displaySummaryStats(maxReturn, minReturn, avgReturn, positiveScenarios, negativeScenarios, totalScenarios) {
        const summaryStats = document.getElementById('summaryStats');
        if (!summaryStats) return;
        
        let html = '';
        
        html += '<div class="result-card positive">';
        html += '<h4>Best Case</h4>';
        html += '<div class="value">' + (maxReturn > 0 ? '+' : '') + maxReturn.toFixed(1) + '%</div>';
        html += '</div>';
        
        html += '<div class="result-card negative">';
        html += '<h4>Worst Case</h4>';
        html += '<div class="value">' + (minReturn > 0 ? '+' : '') + minReturn.toFixed(1) + '%</div>';
        html += '</div>';
        
        html += '<div class="result-card">';
        html += '<h4>Average Return</h4>';
        html += '<div class="value">' + (avgReturn > 0 ? '+' : '') + avgReturn.toFixed(1) + '%</div>';
        html += '</div>';
        
        html += '<div class="result-card positive">';
        html += '<h4>Positive Scenarios</h4>';
        html += '<div class="value">' + positiveScenarios + '/' + totalScenarios + '</div>';
        html += '</div>';
        
        html += '<div class="result-card negative">';
        html += '<h4>Negative Scenarios</h4>';
        html += '<div class="value">' + negativeScenarios + '/' + totalScenarios + '</div>';
        html += '</div>';
        
        summaryStats.innerHTML = html;
    }
    
    // ========== GRAPHIQUES ==========
    
    /**
     * Graphique de performance par scénario
     */
    function createScenariosChart(results) {
        const categories = results.map(r => r.name);
        const data = results.map(r => ({
            y: r.portfolioReturn,
            color: r.portfolioReturn >= 0 ? '#4A74F3' : '#9D5CE6'
        }));
        
        Highcharts.chart('chartScenarios', {
            chart: { type: 'column', backgroundColor: 'transparent' },
            title: { text: 'Portfolio Performance by Scenario', style: { color: '#2649B2', fontSize: '1.3em' } },
            xAxis: {
                categories: categories,
                labels: { rotation: -45, style: { color: '#5B2C6F', fontSize: '11px' } }
            },
            yAxis: {
                title: { text: 'Portfolio Return (%)', style: { color: '#2649B2' } },
                labels: { style: { color: '#6C3483' } },
                plotLines: [{ value: 0, color: '#2649B2', width: 2 }]
            },
            tooltip: { valueSuffix: '%', valueDecimals: 1 },
            series: [{ name: 'Portfolio Return', data: data, borderRadius: '25%' }],
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}%',
                        style: { fontSize: '11px', fontWeight: 'bold' }
                    }
                }
            },
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique risque/rendement
     */
    function createRiskReturnChart(results) {
        const data = results.map(r => ({
            name: r.name,
            x: Math.abs(r.portfolioReturn),
            y: r.portfolioReturn,
            color: r.portfolioReturn >= 0 ? '#4A74F3' : '#9D5CE6'
        }));
        
        Highcharts.chart('chartRiskReturn', {
            chart: { type: 'scatter', backgroundColor: 'transparent', zoomType: 'xy' },
            title: { text: 'Scenario Risk/Return Profile', style: { color: '#2649B2', fontSize: '1.3em' } },
            xAxis: {
                title: { text: 'Impact Magnitude (%)', style: { color: '#2649B2' } },
                labels: { style: { color: '#5B2C6F' } },
                crosshair: true
            },
            yAxis: {
                title: { text: 'Portfolio Return (%)', style: { color: '#2649B2' } },
                labels: { style: { color: '#6C3483' } },
                plotLines: [{ value: 0, color: '#2649B2', width: 2, dashStyle: 'Dash' }],
                crosshair: true
            },
            tooltip: { pointFormat: '<b>{point.name}</b><br/>Return: {point.y:.1f}%<br/>Magnitude: {point.x:.1f}%' },
            series: [{ name: 'Scenarios', data: data, marker: { radius: 8 } }],
            legend: { enabled: false },
            credits: { enabled: false }
        });
    }
    
    /**
     * Tableau détaillé
     */
    function createDetailedTable(results, portfolio) {
        let tableHTML = '<table class="detailed-table">';
        tableHTML += '<thead><tr>';
        tableHTML += '<th>Scenario</th>';
        tableHTML += '<th>Portfolio Return (%)</th>';
        tableHTML += '<th>Stocks Impact</th>';
        tableHTML += '<th>Bonds Impact</th>';
        tableHTML += '<th>Real Estate Impact</th>';
        tableHTML += '<th>Commodities Impact</th>';
        tableHTML += '<th>Cash Impact</th>';
        tableHTML += '</tr></thead>';
        tableHTML += '<tbody>';
        
        results.forEach(result => {
            const returnClass = result.portfolioReturn >= 0 ? 'return-positive' : 'return-negative';
            tableHTML += '<tr>';
            tableHTML += '<td class="scenario-name">' + result.name + '<br/><small style="color: #6C3483;">' + result.description + '</small></td>';
            tableHTML += '<td><span class="' + returnClass + '" style="font-size: 1.2em;">' + (result.portfolioReturn > 0 ? '+' : '') + result.portfolioReturn.toFixed(2) + '%</span></td>';
            tableHTML += '<td>' + result.breakdown.stocks.toFixed(2) + '%</td>';
            tableHTML += '<td>' + result.breakdown.bonds.toFixed(2) + '%</td>';
            tableHTML += '<td>' + result.breakdown.realEstate.toFixed(2) + '%</td>';
            tableHTML += '<td>' + result.breakdown.commodities.toFixed(2) + '%</td>';
            tableHTML += '<td>' + result.breakdown.cash.toFixed(2) + '%</td>';
            tableHTML += '</tr>';
        });
        
        tableHTML += '</tbody></table>';
        
        const detailedTable = document.getElementById('detailedTable');
        if (detailedTable) detailedTable.innerHTML = tableHTML;
    }
    
    /**
     * Génère les recommandations
     */
    function generateRecommendations(results, portfolio) {
        const returns = results.map(r => r.portfolioReturn);
        const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
        const worstCase = Math.min(...returns);
        const negativeCount = returns.filter(r => r < 0).length;
        
        let recommendations = '<h4>Key Insights</h4>';
        
        // Analyse de l'exposition
        if (portfolio.stocks > 70) {
            recommendations += '<p>⚠️ <strong>High Stock Exposure:</strong> Your portfolio is heavily weighted towards stocks (' + portfolio.stocks + '%). Consider diversifying to reduce volatility during market downturns.</p>';
        }
        
        if (portfolio.bonds < 10 && portfolio.cash < 5) {
            recommendations += '<p>⚠️ <strong>Low Defensive Assets:</strong> Consider increasing bonds or cash to provide stability during crises.</p>';
        }
        
        if (portfolio.commodities < 5 && portfolio.realEstate < 10) {
            recommendations += '<p>💡 <strong>Inflation Protection:</strong> Consider adding commodities or real estate as inflation hedges.</p>';
        }
        
        // Analyse de performance
        if (worstCase < -30) {
            recommendations += '<p>🚨 <strong>High Downside Risk:</strong> Your worst-case scenario shows a ' + worstCase.toFixed(1) + '% loss. Consider rebalancing to reduce risk.</p>';
        } else if (worstCase < -15) {
            recommendations += '<p>⚠️ <strong>Moderate Downside Risk:</strong> Your worst-case loss is ' + worstCase.toFixed(1) + '%. Ensure you can tolerate this volatility.</p>';
        } else {
            recommendations += '<p>✅ <strong>Resilient Portfolio:</strong> Your worst-case scenario is ' + worstCase.toFixed(1) + '%, showing good downside protection.</p>';
        }
        
        if (negativeCount >= 4) {
            recommendations += '<p>🚨 <strong>High Failure Rate:</strong> Your portfolio performs negatively in ' + negativeCount + ' out of ' + results.length + ' scenarios. Consider increasing diversification.</p>';
        } else if (negativeCount <= 2) {
            recommendations += '<p>✅ <strong>Strong Performance:</strong> Your portfolio is positive in most scenarios (' + (results.length - negativeCount) + '/' + results.length + ').</p>';
        }
        
        // Rendement moyen
        if (avgReturn > 5) {
            recommendations += '<p>📈 <strong>Solid Average Return:</strong> Your average return across scenarios is +' + avgReturn.toFixed(1) + '%.</p>';
        } else if (avgReturn > 0) {
            recommendations += '<p>💡 <strong>Positive but Modest:</strong> Average return is +' + avgReturn.toFixed(1) + '%. Consider adding growth-oriented assets.</p>';
        } else {
            recommendations += '<p>🚨 <strong>Negative Average:</strong> Your average return is ' + avgReturn.toFixed(1) + '%. Major rebalancing recommended.</p>';
        }
        
        // Recommandations spécifiques
        recommendations += '<h4 style="margin-top: 20px;">Suggested Adjustments</h4>';
        
        if (portfolio.stocks > 60 && worstCase < -25) {
            recommendations += '<p>📉 Reduce stocks to 50-60% and increase bonds to 20-30%</p>';
        }
        
        if (portfolio.commodities === 0) {
            recommendations += '<p>🥇 Add 5-10% commodities for inflation protection</p>';
        }
        
        if (portfolio.realEstate === 0) {
            recommendations += '<p>🏠 Consider 5-15% real estate for diversification</p>';
        }
        
        if (portfolio.cash < 2) {
            recommendations += '<p>💵 Maintain 2-5% cash for opportunities and emergencies</p>';
        }
        
        const recommendationsDiv = document.getElementById('recommendations');
        if (recommendationsDiv) recommendationsDiv.innerHTML = recommendations;
    }
    
    // ========== EXPORTS ==========
    return {
        init,
        updateTotalAllocation,
        runAnalysis
    };
})();

window.addEventListener('DOMContentLoaded', ScenarioAnalysis.init);

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