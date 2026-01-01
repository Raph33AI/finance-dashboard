/* ════════════════════════════════════════════════════════════════
   ADMIN BUSINESS PLAN - VERSION PREMIUM COMPLÈTE
   AlphaVault AI - Interactive Business Plan Dashboard
   Version 3.0 - Full Featured
   ════════════════════════════════════════════════════════════════ */

// ════════════════════════════════════════════════════════════════
// GLOBAL VARIABLES & CONFIGURATION
// ════════════════════════════════════════════════════════════════

let currentScenario = 'base';
let simulationParams = {
    totalUsers: 5000,
    conversionRate: 30,
    proSplit: 60,
    growthRate: 200,
    cac: 25,
    churnRate: 5
};

const defaultParams = { ...simulationParams };

// Chart instances for updates
let chartInstances = {
    marketGrowth: null,
    revenue: null,
    profitability: null,
    scenario: null,
    riskMatrix: null,
    cashFlow: null,
    userGrowth: null,
    marketShare: null
};

// Financial terms definitions for modals
const financialTerms = {
    'ARR': {
        title: 'Annual Recurring Revenue (ARR)',
        icon: 'fa-sync-alt',
        description: 'ARR represents the predictable, recurring revenue a company expects to receive on an annual basis from its subscription-based products or services.',
        formula: 'ARR = MRR × 12',
        example: 'If your MRR is $21,000, then ARR = $21,000 × 12 = $252,000'
    },
    'MRR': {
        title: 'Monthly Recurring Revenue (MRR)',
        icon: 'fa-calendar-alt',
        description: 'MRR is the predictable monthly revenue generated from all active subscriptions. It\'s a key metric for SaaS businesses to track growth.',
        formula: 'MRR = (Pro Users × $10) + (Platinum Users × $20)',
        example: 'With 900 Pro and 600 Platinum users: MRR = (900 × $10) + (600 × $20) = $21,000'
    },
    'LTV': {
        title: 'Customer Lifetime Value (LTV)',
        icon: 'fa-chart-line',
        description: 'LTV predicts the total revenue a business can expect from a single customer account throughout their relationship.',
        formula: 'LTV = ARPU × Customer Lifespan',
        example: 'With $14 ARPU and 20-month lifespan: LTV = $14 × 20 = $280'
    },
    'CAC': {
        title: 'Customer Acquisition Cost (CAC)',
        icon: 'fa-funnel-dollar',
        description: 'CAC is the total cost of acquiring a new customer, including marketing, sales, and advertising expenses.',
        formula: 'CAC = Total Marketing & Sales Costs / Number of New Customers',
        example: 'If you spend $5,000 and acquire 200 customers: CAC = $5,000 / 200 = $25'
    },
    'EBITDA': {
        title: 'Earnings Before Interest, Taxes, Depreciation & Amortization',
        icon: 'fa-piggy-bank',
        description: 'EBITDA measures a company\'s operating performance by focusing on earnings from core operations, excluding financial and accounting decisions.',
        formula: 'EBITDA = Total Revenue - Operating Expenses',
        example: 'With $277K revenue and $185K expenses: EBITDA = $277K - $185K = $92K'
    },
    'CHURN': {
        title: 'Churn Rate',
        icon: 'fa-user-times',
        description: 'Churn rate measures the percentage of customers who cancel their subscriptions within a given time period.',
        formula: 'Churn Rate = (Customers Lost / Total Customers at Start) × 100',
        example: 'If 50 out of 1,000 customers cancel in a month: Churn = (50/1000) × 100 = 5%'
    },
    'ARPU': {
        title: 'Average Revenue Per User (ARPU)',
        icon: 'fa-user-tag',
        description: 'ARPU measures the average revenue generated per user/subscriber, helping to understand pricing effectiveness.',
        formula: 'ARPU = Total Revenue / Total Number of Users',
        example: 'With 60% Pro ($10) and 40% Platinum ($20): ARPU = (0.6 × $10) + (0.4 × $20) = $14'
    },
    'TAM': {
        title: 'Total Addressable Market (TAM)',
        icon: 'fa-globe',
        description: 'TAM represents the total revenue opportunity available if a product or service achieved 100% market share.',
        formula: 'TAM = Number of Potential Customers × Annual Revenue Per Customer',
        example: 'Global retail investment analytics market: $12.5B (2024)'
    },
    'SAM': {
        title: 'Serviceable Available Market (SAM)',
        icon: 'fa-crosshairs',
        description: 'SAM is the portion of TAM that your product can actually serve based on geography, regulations, and capabilities.',
        formula: 'SAM = TAM × Market Segment %',
        example: 'English-speaking retail investors: $12.5B × 25% = $3.2B'
    },
    'SOM': {
        title: 'Serviceable Obtainable Market (SOM)',
        icon: 'fa-bullseye',
        description: 'SOM is the realistic portion of SAM that you can capture within a specific timeframe (usually 3-5 years).',
        formula: 'SOM = SAM × Realistic Market Share %',
        example: '5-year target (5% of SAM): $3.2B × 5% = $160M'
    },
    'PAYBACK': {
        title: 'Payback Period',
        icon: 'fa-hourglass-half',
        description: 'The time it takes to recover the customer acquisition cost from the revenue generated by that customer.',
        formula: 'Payback Period = CAC / (ARPU × Gross Margin)',
        example: 'With $25 CAC, $14 ARPU, 85% margin: Payback = $25 / ($14 × 0.85) = 2.1 months'
    },
    'GROSS_MARGIN': {
        title: 'Gross Margin',
        icon: 'fa-percentage',
        description: 'Gross margin represents the percentage of revenue remaining after deducting the direct costs of delivering the service.',
        formula: 'Gross Margin = (Revenue - COGS) / Revenue × 100',
        example: 'SaaS companies typically have 70-90% gross margins due to low variable costs'
    }
};

// ════════════════════════════════════════════════════════════════
// DOM CONTENT LOADED - INITIALIZATION
// ════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Business Plan Dashboard Initialized');
    
    initializeTabs();
    initializeCharts();
    initializeSimulator();
    initializeScenarios();
    initializeModals();
    initializeTooltips();
    initializeExportPDF();
    initializeScenarioComparison();
    updateSimulationValues();
    
    console.log('✅ All systems ready');
});

// ════════════════════════════════════════════════════════════════
// TAB NAVIGATION SYSTEM
// ════════════════════════════════════════════════════════════════

function initializeTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.bp-section');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            
            // Remove active class from all
            navTabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class
            this.classList.add('active');
            const targetElement = document.getElementById(targetSection);
            
            if (targetElement) {
                targetElement.classList.add('active');
                
                // Smooth scroll
                setTimeout(() => {
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }, 100);
            }
        });
    });
    
    console.log('✅ Tabs initialized');
}

// ════════════════════════════════════════════════════════════════
// CHARTS INITIALIZATION - ALL CHARTS
// ════════════════════════════════════════════════════════════════

function initializeCharts() {
    createMarketGrowthChart();
    createRevenueChart();
    createProfitabilityChart();
    createScenarioChart();
    createRiskMatrixChart();
    createCashFlowChart();
    createUserGrowthChart();
    createMarketShareChart();
    
    console.log('✅ All charts initialized');
}

// Chart 1: Market Growth
function createMarketGrowthChart() {
    const ctx = document.getElementById('marketGrowthChart');
    if (!ctx) return;
    
    chartInstances.marketGrowth = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2024', '2025', '2026', '2027', '2028', '2029'],
            datasets: [
                {
                    label: 'TAM (Total Addressable Market)',
                    data: [12.5, 14.8, 17.5, 20.7, 24.5, 29.0],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'SAM (Serviceable Available Market)',
                    data: [3.2, 3.8, 4.5, 5.3, 6.3, 7.5],
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: 'SOM (Serviceable Obtainable Market)',
                    data: [0.08, 0.12, 0.22, 0.35, 0.50, 0.75],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: getChartOptions('Market Size Projection ($B)', 'Market Size (Billions USD)', '$', 'B')
    });
}

// Chart 2: Revenue Projection
function createRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    chartInstances.revenue = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                {
                    label: 'Subscription Revenue',
                    data: [252, 756, 1760, 3280, 5040],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: '#3b82f6',
                    borderWidth: 2
                },
                {
                    label: 'Affiliate Revenue',
                    data: [25, 90, 220, 410, 630],
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderColor: '#8b5cf6',
                    borderWidth: 2
                }
            ]
        },
        options: {
            ...getChartOptions('5-Year Revenue Projection ($K)', 'Revenue (Thousands USD)', '$', 'K'),
            scales: {
                ...getChartOptions('', '', '$', 'K').scales,
                y: {
                    ...getChartOptions('', '', '$', 'K').scales.y,
                    stacked: true
                },
                x: {
                    stacked: true,
                    grid: { display: false }
                }
            }
        }
    });
}

// Chart 3: Profitability Analysis
function createProfitabilityChart() {
    const ctx = document.getElementById('profitabilityChart');
    if (!ctx) return;
    
    chartInstances.profitability = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                {
                    label: 'Total Revenue',
                    data: [277, 846, 1980, 3690, 5670],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    yAxisID: 'y',
                    pointRadius: 5
                },
                {
                    label: 'Total Expenses',
                    data: [185, 445, 880, 1490, 2370],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    yAxisID: 'y',
                    pointRadius: 5
                },
                {
                    label: 'EBITDA',
                    data: [92, 401, 1100, 2200, 3300],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    yAxisID: 'y',
                    pointRadius: 5
                },
                {
                    label: 'EBITDA Margin (%)',
                    data: [33, 47, 56, 60, 58],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    borderDash: [5, 5],
                    yAxisID: 'y1',
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 13, weight: 'bold' }, padding: 18, usePointStyle: true }
                },
                title: {
                    display: true,
                    text: 'Revenue vs Expenses vs Profitability',
                    font: { size: 17, weight: 'bold' },
                    padding: 20
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    padding: 14,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label.includes('%')) {
                                return label + ': ' + context.parsed.y + '%';
                            } else {
                                return label + ': $' + context.parsed.y.toLocaleString() + 'K';
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Amount ($K)', font: { size: 14, weight: 'bold' } },
                    ticks: { callback: value => '$' + value.toLocaleString() + 'K' },
                    grid: { color: 'rgba(59, 130, 246, 0.1)' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Margin (%)', font: { size: 14, weight: 'bold' } },
                    ticks: { callback: value => value + '%' },
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

// Chart 4: Scenario Comparison
function createScenarioChart() {
    const ctx = document.getElementById('scenarioChart');
    if (!ctx) return;
    
    chartInstances.scenario = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [{
                label: 'Current Scenario ARR',
                data: [252, 756, 1760, 3280, 5040],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 5
            }]
        },
        options: getChartOptions('Scenario ARR Projection ($K)', 'ARR (Thousands USD)', '$', 'K')
    });
}

// Chart 5: Risk Matrix
function createRiskMatrixChart() {
    const ctx = document.getElementById('riskMatrixChart');
    if (!ctx) return;
    
    chartInstances.riskMatrix = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [
                { label: 'Market Risk', data: [{ x: 30, y: 80, r: 22 }], backgroundColor: 'rgba(239, 68, 68, 0.6)', borderColor: '#ef4444', borderWidth: 2 },
                { label: 'AI Model Accuracy', data: [{ x: 40, y: 60, r: 17 }], backgroundColor: 'rgba(245, 158, 11, 0.6)', borderColor: '#f59e0b', borderWidth: 2 },
                { label: 'Big Tech Competition', data: [{ x: 20, y: 70, r: 20 }], backgroundColor: 'rgba(239, 68, 68, 0.6)', borderColor: '#ef4444', borderWidth: 2 },
                { label: 'Regulatory Risk', data: [{ x: 10, y: 50, r: 14 }], backgroundColor: 'rgba(245, 158, 11, 0.6)', borderColor: '#f59e0b', borderWidth: 2 },
                { label: 'Data Provider Dependency', data: [{ x: 30, y: 45, r: 16 }], backgroundColor: 'rgba(245, 158, 11, 0.6)', borderColor: '#f59e0b', borderWidth: 2 },
                { label: 'Key Person Dependency', data: [{ x: 15, y: 30, r: 12 }], backgroundColor: 'rgba(16, 185, 129, 0.6)', borderColor: '#10b981', borderWidth: 2 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'right', labels: { font: { size: 12, weight: 'bold' }, padding: 14, usePointStyle: true } },
                title: { display: true, text: 'Risk Matrix: Probability vs Impact', font: { size: 17, weight: 'bold' }, padding: 20 },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    padding: 14,
                    callbacks: {
                        label: context => [context.dataset.label, 'Probability: ' + context.parsed.x + '%', 'Impact: ' + context.parsed.y + '/100']
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Probability (%)', font: { size: 14, weight: 'bold' } }, min: 0, max: 50, grid: { color: 'rgba(59, 130, 246, 0.1)' } },
                y: { title: { display: true, text: 'Impact Score (0-100)', font: { size: 14, weight: 'bold' } }, min: 0, max: 100, grid: { color: 'rgba(59, 130, 246, 0.1)' } }
            }
        }
    });
}

// Chart 6: Cash Flow
function createCashFlowChart() {
    const ctx = document.getElementById('cashFlowChart');
    if (!ctx) return;
    
    chartInstances.cashFlow = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                { label: 'Operating Cash Flow', data: [75, 350, 980, 1950, 2950], backgroundColor: 'rgba(16, 185, 129, 0.8)', borderColor: '#10b981', borderWidth: 2 },
                { label: 'Free Cash Flow', data: [50, 300, 880, 1850, 2850], backgroundColor: 'rgba(59, 130, 246, 0.8)', borderColor: '#3b82f6', borderWidth: 2 }
            ]
        },
        options: getChartOptions('Cash Flow Projection ($K)', 'Cash Flow ($K)', '$', 'K')
    });
}

// Chart 7: User Growth
function createUserGrowthChart() {
    const ctx = document.getElementById('userGrowthChart');
    if (!ctx) return;
    
    chartInstances.userGrowth = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                { label: 'Total Users', data: [5000, 15000, 35000, 65000, 100000], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.4, fill: true, borderWidth: 3, pointRadius: 5 },
                { label: 'Paid Users', data: [1500, 4500, 10500, 19500, 30000], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.4, fill: true, borderWidth: 3, pointRadius: 5 }
            ]
        },
        options: {
            ...getChartOptions('User Growth Projection', 'Number of Users', '', ''),
            plugins: {
                ...getChartOptions('', '', '', '').plugins,
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    padding: 14,
                    callbacks: { label: context => context.dataset.label + ': ' + context.parsed.y.toLocaleString() }
                }
            }
        }
    });
}

// Chart 8: Market Share
function createMarketShareChart() {
    const ctx = document.getElementById('marketShareChart');
    if (!ctx) return;
    
    chartInstances.marketShare = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['AlphaVault AI', 'Bloomberg Terminal', 'Yahoo Finance', 'TradingView', 'Others'],
            datasets: [{
                data: [5, 25, 15, 20, 35],
                backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(139, 92, 246, 0.8)'],
                borderColor: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'right', labels: { font: { size: 13, weight: 'bold' }, padding: 14, usePointStyle: true } },
                title: { display: true, text: 'Target Market Share (Year 5)', font: { size: 17, weight: 'bold' }, padding: 20 },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    padding: 14,
                    callbacks: { label: context => context.label + ': ' + context.parsed + '%' }
                }
            }
        }
    });
}

// Chart Options Helper
function getChartOptions(title, yAxisLabel, prefix, suffix) {
    return {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'top', labels: { font: { size: 13, weight: 'bold' }, padding: 18, usePointStyle: true } },
            title: { display: true, text: title, font: { size: 17, weight: 'bold' }, padding: 20 },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                padding: 14,
                callbacks: {
                    label: context => context.dataset.label + ': ' + prefix + context.parsed.y.toLocaleString() + suffix
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: yAxisLabel, font: { size: 14, weight: 'bold' } },
                ticks: { callback: value => prefix + value.toLocaleString() + suffix },
                grid: { color: 'rgba(59, 130, 246, 0.1)' }
            },
            x: { grid: { display: false } }
        }
    };
}

// ════════════════════════════════════════════════════════════════
// SIMULATOR FUNCTIONALITY
// ════════════════════════════════════════════════════════════════

function initializeSimulator() {
    const inputs = {
        totalUsers: document.getElementById('simTotalUsers'),
        conversionRate: document.getElementById('simConversionRate'),
        proSplit: document.getElementById('simProSplit'),
        growthRate: document.getElementById('simGrowthRate'),
        cac: document.getElementById('simCAC'),
        churnRate: document.getElementById('simChurnRate')
    };
    
    // Add input listeners
    Object.keys(inputs).forEach(key => {
        if (inputs[key]) {
            inputs[key].addEventListener('input', function() {
                simulationParams[key] = parseFloat(this.value);
                updateSimulationValues();
            });
        }
    });
    
    // Buttons
    const runBtn = document.getElementById('runSimulationBtn');
    if (runBtn) runBtn.addEventListener('click', runSimulation);
    
    const resetBtn = document.getElementById('resetSimulationBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetSimulation);
    
    console.log('✅ Simulator initialized');
}

function updateSimulationValues() {
    document.getElementById('totalUsersValue').textContent = simulationParams.totalUsers.toLocaleString();
    document.getElementById('conversionRateValue').textContent = simulationParams.conversionRate;
    document.getElementById('proSplitValue').textContent = simulationParams.proSplit;
    document.getElementById('growthRateValue').textContent = simulationParams.growthRate;
    document.getElementById('cacValue').textContent = simulationParams.cac;
    document.getElementById('churnRateValue').textContent = simulationParams.churnRate;
}

function runSimulation() {
    console.log('🚀 Running simulation...', simulationParams);
    
    // Calculate Year 1
    const paidUsers = Math.round(simulationParams.totalUsers * (simulationParams.conversionRate / 100));
    const proUsers = Math.round(paidUsers * (simulationParams.proSplit / 100));
    const platinumUsers = paidUsers - proUsers;
    const y1MRR = (proUsers * 10) + (platinumUsers * 20);
    const y1ARR = y1MRR * 12;
    
    // Calculate Year 5
    let totalUsers = simulationParams.totalUsers;
    let arr = y1ARR;
    const projections = [y1ARR];
    
    for (let year = 2; year <= 5; year++) {
        totalUsers = Math.round(totalUsers * (1 + simulationParams.growthRate / 100));
        const yearlyPaidUsers = Math.round(totalUsers * (simulationParams.conversionRate / 100));
        const yearlyProUsers = Math.round(yearlyPaidUsers * (simulationParams.proSplit / 100));
        const yearlyPlatinumUsers = yearlyPaidUsers - yearlyProUsers;
        arr = ((yearlyProUsers * 10) + (yearlyPlatinumUsers * 20)) * 12;
        projections.push(arr);
    }
    
    const y5ARR = arr;
    
    // Calculate metrics
    const arpu = (simulationParams.proSplit / 100 * 10) + ((100 - simulationParams.proSplit) / 100 * 20);
    const customerLifespan = 1 / (simulationParams.churnRate / 100);
    const ltv = arpu * customerLifespan;
    const ltvCacRatio = ltv / simulationParams.cac;
    const paybackPeriod = simulationParams.cac / (arpu * 0.85);
    const y5Revenue = y5ARR;
    const y5Expenses = y5Revenue * 0.42;
    const y5EBITDA = y5Revenue - y5Expenses;
    
    // Update UI
    document.getElementById('simY1MRR').textContent = '$' + y1MRR.toLocaleString();
    document.getElementById('simY1ARR').textContent = '$' + y1ARR.toLocaleString();
    document.getElementById('simY5ARR').textContent = '$' + (y5ARR / 1000).toFixed(2) + 'M';
    document.getElementById('simLTVCAC').textContent = ltvCacRatio.toFixed(1) + ':1';
    document.getElementById('simPayback').textContent = paybackPeriod.toFixed(1) + ' months';
    document.getElementById('simY5EBITDA').textContent = '$' + (y5EBITDA / 1000).toFixed(2) + 'M';
    
    // Update chart
    if (chartInstances.scenario) {
        chartInstances.scenario.data.datasets[0].data = projections;
        chartInstances.scenario.update();
    }
    
    // Animation
    const resultsSection = document.getElementById('simulationResults');
    if (resultsSection) {
        resultsSection.style.animation = 'none';
        setTimeout(() => { resultsSection.style.animation = 'fadeInUp 0.6s ease'; }, 10);
    }
    
    console.log('✅ Simulation complete');
}

function resetSimulation() {
    simulationParams = { ...defaultParams };
    
    document.getElementById('simTotalUsers').value = simulationParams.totalUsers;
    document.getElementById('simConversionRate').value = simulationParams.conversionRate;
    document.getElementById('simProSplit').value = simulationParams.proSplit;
    document.getElementById('simGrowthRate').value = simulationParams.growthRate;
    document.getElementById('simCAC').value = simulationParams.cac;
    document.getElementById('simChurnRate').value = simulationParams.churnRate;
    
    updateSimulationValues();
    runSimulation();
    
    console.log('🔄 Simulation reset');
}

// ════════════════════════════════════════════════════════════════
// PRE-CONFIGURED SCENARIOS
// ════════════════════════════════════════════════════════════════

function initializeScenarios() {
    const applyBtns = document.querySelectorAll('.apply-scenario-btn');
    
    applyBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.scenario-card');
            const scenario = card.dataset.scenario;
            applyScenario(scenario);
        });
    });
    
    console.log('✅ Scenarios initialized');
}

function applyScenario(scenario) {
    const scenarios = {
        conservative: { totalUsers: 3000, conversionRate: 20, proSplit: 60, growthRate: 150, cac: 35, churnRate: 7 },
        base: { totalUsers: 5000, conversionRate: 30, proSplit: 60, growthRate: 200, cac: 25, churnRate: 5 },
        aggressive: { totalUsers: 10000, conversionRate: 40, proSplit: 50, growthRate: 300, cac: 20, churnRate: 4 }
    };
    
    const params = scenarios[scenario];
    if (!params) return;
    
    simulationParams = { ...params };
    
    document.getElementById('simTotalUsers').value = params.totalUsers;
    document.getElementById('simConversionRate').value = params.conversionRate;
    document.getElementById('simProSplit').value = params.proSplit;
    document.getElementById('simGrowthRate').value = params.growthRate;
    document.getElementById('simCAC').value = params.cac;
    document.getElementById('simChurnRate').value = params.churnRate;
    
    updateSimulationValues();
    runSimulation();
    
    console.log(`📊 Applied ${scenario} scenario`);
}

// ════════════════════════════════════════════════════════════════
// SCENARIO COMPARISON (MULTI-SCENARIOS SIDE-BY-SIDE)
// ════════════════════════════════════════════════════════════════

function initializeScenarioComparison() {
    const comparisonContainer = document.getElementById('scenarioComparisonGrid');
    if (!comparisonContainer) return;
    
    const scenarios = {
        conservative: { name: 'Conservative', icon: 'fa-turtle', totalUsers: 3000, conversionRate: 20, growthRate: 150, cac: 35 },
        base: { name: 'Base Case', icon: 'fa-balance-scale', totalUsers: 5000, conversionRate: 30, growthRate: 200, cac: 25 },
        aggressive: { name: 'Aggressive', icon: 'fa-rocket', totalUsers: 10000, conversionRate: 40, growthRate: 300, cac: 20 }
    };
    
    Object.keys(scenarios).forEach(key => {
        const s = scenarios[key];
        const metrics = calculateScenarioMetrics(s);
        
        const card = document.createElement('div');
        card.className = `scenario-comparison-card ${key}`;
        card.innerHTML = `
            <div class="scenario-comparison-header">
                <div class="scenario-comparison-icon">
                    <i class="fas ${s.icon}"></i>
                </div>
                <h4 class="scenario-comparison-title">${s.name}</h4>
            </div>
            <div class="scenario-comparison-metrics">
                <div class="scenario-metric-item">
                    <span class="scenario-metric-label">Year 1 ARR</span>
                    <span class="scenario-metric-value">$${metrics.y1ARR.toLocaleString()}</span>
                </div>
                <div class="scenario-metric-item">
                    <span class="scenario-metric-label">Year 5 ARR</span>
                    <span class="scenario-metric-value">$${(metrics.y5ARR / 1000).toFixed(2)}M</span>
                </div>
                <div class="scenario-metric-item">
                    <span class="scenario-metric-label">LTV:CAC</span>
                    <span class="scenario-metric-value">${metrics.ltvCac.toFixed(1)}:1</span>
                </div>
                <div class="scenario-metric-item">
                    <span class="scenario-metric-label">Payback Period</span>
                    <span class="scenario-metric-value">${metrics.payback.toFixed(1)} mo</span>
                </div>
                <div class="scenario-metric-item">
                    <span class="scenario-metric-label">Year 5 Users</span>
                    <span class="scenario-metric-value">${metrics.y5Users.toLocaleString()}</span>
                </div>
            </div>
        `;
        comparisonContainer.appendChild(card);
    });
    
    console.log('✅ Scenario comparison initialized');
}

function calculateScenarioMetrics(params) {
    const paidUsers = Math.round(params.totalUsers * (params.conversionRate / 100));
    const proUsers = Math.round(paidUsers * 0.6);
    const platinumUsers = paidUsers - proUsers;
    const y1MRR = (proUsers * 10) + (platinumUsers * 20);
    const y1ARR = y1MRR * 12;
    
    let totalUsers = params.totalUsers;
    let arr = y1ARR;
    
    for (let year = 2; year <= 5; year++) {
        totalUsers = Math.round(totalUsers * (1 + params.growthRate / 100));
        const yearlyPaidUsers = Math.round(totalUsers * (params.conversionRate / 100));
        const yearlyProUsers = Math.round(yearlyPaidUsers * 0.6);
        const yearlyPlatinumUsers = yearlyPaidUsers - yearlyProUsers;
        arr = ((yearlyProUsers * 10) + (yearlyPlatinumUsers * 20)) * 12;
    }
    
    const arpu = 14;
    const ltv = arpu * 20;
    const ltvCac = ltv / params.cac;
    const payback = params.cac / (arpu * 0.85);
    
    return {
        y1ARR: y1ARR,
        y5ARR: arr,
        ltvCac: ltvCac,
        payback: payback,
        y5Users: totalUsers
    };
}

// ════════════════════════════════════════════════════════════════
// MODALS FOR FINANCIAL TERMS
// ════════════════════════════════════════════════════════════════

function initializeModals() {
    // Create modal overlay if not exists
    if (!document.getElementById('termModal')) {
        const modalHTML = `
            <div class="modal-overlay" id="termModal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 id="modalTitle"><i class="fas fa-info-circle"></i> Term Definition</h3>
                        <button class="modal-close" onclick="closeTermModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="modalBody"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    console.log('✅ Modals initialized');
}

function initializeTooltips() {
    // Add click handlers to all tooltip terms
    document.querySelectorAll('.tooltip-term').forEach(term => {
        term.addEventListener('click', function() {
            const termKey = this.dataset.term;
            openTermModal(termKey);
        });
    });
    
    console.log('✅ Tooltips initialized');
}

function openTermModal(termKey) {
    const term = financialTerms[termKey];
    if (!term) return;
    
    const modal = document.getElementById('termModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.innerHTML = `<i class="fas ${term.icon}"></i> ${term.title}`;
    modalBody.innerHTML = `
        <p>${term.description}</p>
        <div class="modal-example">
            <h4><i class="fas fa-calculator"></i> Formula</h4>
            <p><code>${term.formula}</code></p>
        </div>
        <div class="modal-example">
            <h4><i class="fas fa-lightbulb"></i> Example</h4>
            <p>${term.example}</p>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeTermModal() {
    const modal = document.getElementById('termModal');
    modal.classList.remove('active');
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeTermModal();
    }
});

// ════════════════════════════════════════════════════════════════
// EXPORT PDF FUNCTIONALITY
// ════════════════════════════════════════════════════════════════

function initializeExportPDF() {
    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            // Simple print for now (can be upgraded to jsPDF)
            window.print();
            console.log('📄 Initiating PDF export...');
        });
    }
}

// ════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════

function formatCurrency(value) {
    if (value >= 1000000) return '$' + (value / 1000000).toFixed(2) + 'M';
    if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'K';
    return '$' + value.toLocaleString();
}

function formatPercentage(value) {
    return value.toFixed(1) + '%';
}

// Smooth scroll for anchors
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').slice(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});

// Set current date in footer and header
const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

const currentDateEl = document.getElementById('currentDate');
if (currentDateEl) currentDateEl.textContent = currentDate;

const footerDateEl = document.getElementById('footerDate');
if (footerDateEl) {
    footerDateEl.textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

console.log('✅ Business Plan JavaScript Loaded Successfully');