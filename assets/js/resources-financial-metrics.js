/* ========================================
   FINANCIAL METRICS GLOSSARY - JAVASCRIPT
   AlphaVault AI - Interactive Charts & User Menu
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎓 Financial Metrics Glossary - Initialization');
    
    // ============================================
    // USER MENU FUNCTIONALITY
    // ============================================
    
    const sidebarUserTrigger = document.getElementById('sidebarUserTrigger');
    const sidebarUserDropdown = document.getElementById('sidebarUserDropdown');
    
    if (sidebarUserTrigger && sidebarUserDropdown) {
        sidebarUserTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebarUserTrigger.classList.toggle('active');
            sidebarUserDropdown.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!sidebarUserDropdown.contains(e.target) && 
                !sidebarUserTrigger.contains(e.target)) {
                sidebarUserTrigger.classList.remove('active');
                sidebarUserDropdown.classList.remove('active');
            }
        });
        
        sidebarUserDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // ============================================
    // CHART.JS INTERACTIVE VISUALIZATIONS
    // ============================================
    
    // GRAPHIQUE 1: P/E RATIO PAR SECTEUR
    if (document.getElementById('peRatioChart')) {
        new Chart(document.getElementById('peRatioChart'), {
            type: 'bar',
            data: {
                labels: ['Tech', 'Healthcare', 'Financials', 'Energy', 'Utilities', 'Consumer', 'Industrial', 'Real Estate'],
                datasets: [{
                    label: 'P/E Ratio',
                    data: [32, 22, 12, 10, 16, 20, 18, 25],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(52, 211, 153, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(251, 191, 36, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(52, 211, 153, 1)',
                        'rgba(251, 146, 60, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(251, 191, 36, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(236, 72, 153, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { 
                        callbacks: { 
                            label: ctx => 'P/E Ratio: ' + ctx.parsed.y + 'x' 
                        } 
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        title: { display: true, text: 'P/E Multiple (x)' }
                    }
                }
            }
        });
    }
    
    // GRAPHIQUE 2: P/B vs ROE SCATTER
    const companies = [
        {name: 'Microsoft', pb: 12, roe: 36, size: 25},
        {name: 'Apple', pb: 45, roe: 147, size: 30},
        {name: 'Google', pb: 6, roe: 29, size: 25},
        {name: 'Amazon', pb: 8, roe: 21, size: 25},
        {name: 'Tesla', pb: 14, roe: 23, size: 20},
        {name: 'JPMorgan', pb: 1.5, roe: 15, size: 20},
        {name: 'ExxonMobil', pb: 1.8, roe: 12, size: 18},
        {name: 'Walmart', pb: 4.5, roe: 16, size: 22},
        {name: 'Coca-Cola', pb: 10, roe: 40, size: 20},
        {name: 'Netflix', pb: 7, roe: 25, size: 18}
    ];
    
    if (document.getElementById('pbRoeChart')) {
        new Chart(document.getElementById('pbRoeChart'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Companies',
                    data: companies.map(c => ({x: c.roe, y: c.pb, r: c.size})),
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                const company = companies[ctx.dataIndex];
                                return [
                                    company.name,
                                    'ROE: ' + company.roe + '%',
                                    'P/B: ' + company.pb + 'x'
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        title: { display: true, text: 'ROE (%)' },
                        min: 0,
                        max: 50
                    },
                    y: { 
                        title: { display: true, text: 'P/B Ratio (x)' },
                        min: 0,
                        max: 50
                    }
                }
            }
        });
    }
    
    // GRAPHIQUE 3: EV/EBITDA PAR INDUSTRIE
    if (document.getElementById('evEbitdaChart')) {
        new Chart(document.getElementById('evEbitdaChart'), {
            type: 'bar',
            data: {
                labels: ['SaaS', 'Biotech', 'E-commerce', 'Semiconductors', 'Telecom', 'Retail', 'Manufacturing', 'Utilities'],
                datasets: [{
                    label: 'EV/EBITDA Multiple',
                    data: [22, 18, 14, 16, 8, 7, 9, 10],
                    backgroundColor: 'rgba(52, 211, 153, 0.7)',
                    borderColor: 'rgba(52, 211, 153, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: ctx => 'EV/EBITDA: ' + ctx.parsed.x + 'x' } }
                },
                scales: {
                    x: { 
                        beginAtZero: true,
                        title: { display: true, text: 'EV/EBITDA Multiple (x)' }
                    }
                }
            }
        });
    }
    
    // GRAPHIQUE 4: ROE COMPARAISON
    if (document.getElementById('roeChart')) {
        new Chart(document.getElementById('roeChart'), {
            type: 'bar',
            data: {
                labels: ['Apple', 'Microsoft', 'Coca-Cola', 'Visa', 'Walmart', 'Ford', 'AT&T', 'Industry Avg'],
                datasets: [{
                    label: 'Return on Equity (%)',
                    data: [147, 36, 40, 38, 16, 12, 8, 15],
                    backgroundColor: companies => {
                        return companies.dataIndex === 7 ? 'rgba(156, 163, 175, 0.7)' : 
                               companies.parsed.y > 20 ? 'rgba(34, 197, 94, 0.7)' : 
                               companies.parsed.y > 15 ? 'rgba(251, 191, 36, 0.7)' : 
                               'rgba(239, 68, 68, 0.7)';
                    },
                    borderColor: companies => {
                        return companies.dataIndex === 7 ? 'rgba(156, 163, 175, 1)' : 
                               companies.parsed.y > 20 ? 'rgba(34, 197, 94, 1)' : 
                               companies.parsed.y > 15 ? 'rgba(251, 191, 36, 1)' : 
                               'rgba(239, 68, 68, 1)';
                    },
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: ctx => 'ROE: ' + ctx.parsed.y + '%' } }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        title: { display: true, text: 'ROE (%)' },
                        ticks: { callback: value => value + '%' }
                    }
                }
            }
        });
    }
    
    // GRAPHIQUE 5: PROFIT MARGINS ÉVOLUTION
    const quarters = ['Q1 2022', 'Q2 2022', 'Q3 2022', 'Q4 2022', 'Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023'];
    const grossMargins = [42, 42.5, 43, 43.5, 44, 44.5, 45, 45.5];
    const opMargins = [28, 28.5, 29, 29.5, 30, 30.5, 31, 31.5];
    const netMargins = [23, 23.5, 24, 24.5, 25, 25.5, 26, 26.5];
    
    if (document.getElementById('profitMarginsChart')) {
        new Chart(document.getElementById('profitMarginsChart'), {
            type: 'line',
            data: {
                labels: quarters,
                datasets: [{
                    label: 'Gross Margin',
                    data: grossMargins,
                    borderColor: 'rgba(52, 211, 153, 1)',
                    backgroundColor: 'rgba(52, 211, 153, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Operating Margin',
                    data: opMargins,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Net Margin',
                    data: netMargins,
                    borderColor: 'rgba(139, 92, 246, 1)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        max: 50,
                        title: { display: true, text: 'Margin (%)' },
                        ticks: { callback: value => value + '%' }
                    }
                }
            }
        });
    }
    
    // GRAPHIQUE 6: LIQUIDITY RATIOS
    const companies2 = ['Apple', 'Tesla', 'Amazon', 'Walmart', 'Ford', 'Boeing'];
    const currentRatios = [1.1, 1.7, 1.0, 0.8, 1.2, 1.3];
    const quickRatios = [0.9, 1.4, 0.8, 0.3, 0.9, 0.6];
    
    if (document.getElementById('liquidityChart')) {
        new Chart(document.getElementById('liquidityChart'), {
            type: 'bar',
            data: {
                labels: companies2,
                datasets: [{
                    label: 'Current Ratio',
                    data: currentRatios,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2
                }, {
                    label: 'Quick Ratio',
                    data: quickRatios,
                    backgroundColor: 'rgba(251, 146, 60, 0.7)',
                    borderColor: 'rgba(251, 146, 60, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        max: 2.0,
                        title: { display: true, text: 'Ratio' }
                    }
                }
            }
        });
    }
    
    // GRAPHIQUE 7: LEVERAGE (TESLA CASE)
    const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];
    const deRatio = [2.4, 2.1, 1.5, 0.8, 0.3, 0.08, 0.05];
    const intCoverage = [0.5, 1.2, 3.5, 8.5, 15.0, 22.0, 30.0];
    
    if (document.getElementById('leverageChart')) {
        new Chart(document.getElementById('leverageChart'), {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'D/E Ratio',
                    data: deRatio,
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    yAxisID: 'y',
                    tension: 0.4
                }, {
                    label: 'Interest Coverage',
                    data: intCoverage,
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    yAxisID: 'y1',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: { 
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'D/E Ratio' },
                        min: 0,
                        max: 3
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Interest Coverage (x)' },
                        min: 0,
                        max: 35,
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }
    
    // GRAPHIQUE 8: INVENTORY TURNOVER
    if (document.getElementById('efficiencyChart')) {
        new Chart(document.getElementById('efficiencyChart'), {
            type: 'bar',
            data: {
                labels: ['Tesla', 'Amazon', 'Walmart', 'Target', 'Costco', 'Best Buy', 'Boeing', 'Ford'],
                datasets: [{
                    label: 'Inventory Turnover (x)',
                    data: [12, 8.5, 8.3, 6.2, 11.5, 5.8, 1.2, 4.5],
                    backgroundColor: [
                        'rgba(34, 197, 94, 0.7)',
                        'rgba(52, 211, 153, 0.7)',
                        'rgba(52, 211, 153, 0.7)',
                        'rgba(251, 191, 36, 0.7)',
                        'rgba(34, 197, 94, 0.7)',
                        'rgba(251, 191, 36, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(251, 146, 60, 0.7)'
                    ],
                    borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(52, 211, 153, 1)',
                        'rgba(52, 211, 153, 1)',
                        'rgba(251, 191, 36, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(251, 191, 36, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(251, 146, 60, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: ctx => 'Turnover: ' + ctx.parsed.y + 'x (' + Math.round(365/ctx.parsed.y) + ' days)' } }
                },
                scales: {
                    y: { 
                        beginAtZero: true,
                        title: { display: true, text: 'Inventory Turnover (x)' }
                    }
                }
            }
        });
    }
    
    // GRAPHIQUE 9: REVENUE GROWTH (CAGR)
    const years2 = ['2018', '2019', '2020', '2021', '2022', '2023'];
    const revenue = [15.8, 20.2, 25.0, 29.7, 31.6, 33.7].map(v => v * 1000);
    
    if (document.getElementById('growthChart')) {
        new Chart(document.getElementById('growthChart'), {
            type: 'line',
            data: {
                labels: years2,
                datasets: [{
                    label: 'Revenue ($M)',
                    data: revenue,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true },
                    tooltip: {
                        callbacks: {
                            label: ctx => 'Revenue: $' + (ctx.parsed.y / 1000).toFixed(1) + 'B'
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: false,
                        title: { display: true, text: 'Revenue ($M)' },
                        ticks: { callback: value => '$' + (value / 1000).toFixed(1) + 'B' }
                    }
                }
            }
        });
    }
    
    // GRAPHIQUE 10: DCF WATERFALL
    if (document.getElementById('dcfWaterfallChart')) {
        new Chart(document.getElementById('dcfWaterfallChart'), {
            type: 'bar',
            data: {
                labels: ['Year 1 FCF', 'Year 2 FCF', 'Year 3 FCF', 'Year 4 FCF', 'Year 5 FCF', 'Terminal Value', 'Enterprise Value', '- Debt', '+ Cash', 'Equity Value'],
                datasets: [{
                    label: 'Value ($M)',
                    data: [136, 149, 162, 177, 193, 2842, 3659, -500, 200, 3359],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(102, 126, 234, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(52, 211, 153, 0.7)',
                        'rgba(34, 197, 94, 0.7)'
                    ],
                    borderColor: [
                        'rgba(59, 130, 246, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(102, 126, 234, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(52, 211, 153, 1)',
                        'rgba(34, 197, 94, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: ctx => '$' + ctx.parsed.y.toFixed(0) + 'M' } }
                },
                scales: {
                    y: { 
                        title: { display: true, text: 'Value ($M)' },
                        ticks: { callback: value => '$' + (value / 1000).toFixed(1) + 'B' }
                    }
                }
            }
        });
    }
    
    // GRAPHIQUE 11: DCF SENSITIVITY
    if (document.getElementById('dcfSensitivityChart')) {
        new Chart(document.getElementById('dcfSensitivityChart'), {
            type: 'bar',
            data: {
                labels: [
                    'Base Case', 
                    'Terminal Growth +1%', 
                    'WACC -0.5%', 
                    'FCF Margin +5%', 
                    'Revenue Growth +10%'
                ],
                datasets: [{
                    label: 'Enterprise Value ($M)',
                    data: [3659, 4450, 4120, 3890, 3780],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.7)',
                        'rgba(34, 197, 94, 0.7)',
                        'rgba(52, 211, 153, 0.7)',
                        'rgba(251, 191, 36, 0.7)',
                        'rgba(59, 130, 246, 0.7)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(34, 197, 94, 1)',
                        'rgba(52, 211, 153, 1)',
                        'rgba(251, 191, 36, 1)',
                        'rgba(59, 130, 246, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => {
                                const baseValue = 3659;
                                const change = ((ctx.parsed.x - baseValue) / baseValue * 100).toFixed(1);
                                return [
                                    'EV: $' + ctx.parsed.x.toFixed(0) + 'M',
                                    'Change: ' + (change > 0 ? '+' : '') + change + '%'
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        beginAtZero: false,
                        min: 3500,
                        max: 4600,
                        title: { display: true, text: 'Enterprise Value ($M)' },
                        ticks: { callback: value => '$' + (value / 1000).toFixed(1) + 'B' }
                    }
                }
            }
        });
    }
    
    console.log('✅ All Chart.js visualizations initialized successfully');
});

// ============================================
// SMOOTH SCROLL FOR TABLE OF CONTENTS
// ============================================

document.querySelectorAll('.toc-list a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const yOffset = -100;
            const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
            
            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// ANALYTICS TRACKING (PAGE VIEW)
// ============================================

if (typeof gtag === 'function') {
    gtag('event', 'page_view', {
        page_title: 'Financial Metrics Glossary',
        page_location: window.location.href,
        page_path: '/resources-financial-metrics.html'
    });
}

console.log('📊 Financial Metrics Glossary - Ready!');