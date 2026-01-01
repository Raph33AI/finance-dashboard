/* ============================================
   ADMIN BUSINESS PLAN - INTERACTIVE SIMULATOR
   Version: 3.0
   ============================================ */

// ============================================
// GLOBAL VARIABLES
// ============================================

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

// ============================================
// DOM CONTENT LOADED
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Business Plan Simulator Initialized');
    
    initializeTabs();
    initializeCharts();
    initializeSimulator();
    initializeScenarios();
    initializeExportPDF();
    updateSimulationValues();
});

// ============================================
// TAB NAVIGATION
// ============================================

function initializeTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.bp-section');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            
            // Remove active class from all tabs and sections
            navTabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding section
            this.classList.add('active');
            const targetElement = document.getElementById(targetSection);
            if (targetElement) {
                targetElement.classList.add('active');
                
                // Smooth scroll to section
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ============================================
// CHARTS INITIALIZATION
// ============================================

function initializeCharts() {
    createMarketGrowthChart();
    createRevenueChart();
    createProfitabilityChart();
    createScenarioChart();
    createRiskMatrixChart();
}

// Market Growth Chart
function createMarketGrowthChart() {
    const ctx = document.getElementById('marketGrowthChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2024', '2025', '2026', '2027', '2028', '2029'],
            datasets: [
                {
                    label: 'TAM (Total Addressable Market)',
                    data: [12.5, 14.8, 17.5, 20.7, 24.5, 29.0],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                },
                {
                    label: 'SAM (Serviceable Available Market)',
                    data: [3.2, 3.8, 4.5, 5.3, 6.3, 7.5],
                    borderColor: '#f093fb',
                    backgroundColor: 'rgba(240, 147, 251, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                },
                {
                    label: 'SOM (Serviceable Obtainable Market)',
                    data: [0.08, 0.12, 0.22, 0.35, 0.50, 0.75],
                    borderColor: '#43e97b',
                    backgroundColor: 'rgba(67, 233, 123, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 12, weight: 'bold' },
                        padding: 16
                    }
                },
                title: {
                    display: true,
                    text: 'Market Size Projection ($B)',
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y + 'B';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Market Size (Billions USD)',
                        font: { size: 13, weight: 'bold' }
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value + 'B';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year',
                        font: { size: 13, weight: 'bold' }
                    }
                }
            }
        }
    });
}

// Revenue Chart
function createRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                {
                    label: 'Subscription Revenue',
                    data: [252, 756, 1760, 3280, 5040],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 2
                },
                {
                    label: 'Affiliate Revenue',
                    data: [25, 90, 220, 410, 630],
                    backgroundColor: 'rgba(240, 147, 251, 0.8)',
                    borderColor: '#f093fb',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 12, weight: 'bold' },
                        padding: 16
                    }
                },
                title: {
                    display: true,
                    text: '5-Year Revenue Projection ($K)',
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y + 'K';
                        }
                    }
                }
            },
            scales: {
                y: {
                    stacked: true,
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Revenue (Thousands USD)',
                        font: { size: 13, weight: 'bold' }
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value + 'K';
                        }
                    }
                },
                x: {
                    stacked: true
                }
            }
        }
    });
}

// Profitability Chart
function createProfitabilityChart() {
    const ctx = document.getElementById('profitabilityChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                {
                    label: 'Total Revenue',
                    data: [277, 846, 1980, 3690, 5670],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    yAxisID: 'y'
                },
                {
                    label: 'Total Expenses',
                    data: [185, 445, 880, 1490, 2370],
                    borderColor: '#f5576c',
                    backgroundColor: 'rgba(245, 87, 108, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    yAxisID: 'y'
                },
                {
                    label: 'EBITDA',
                    data: [92, 401, 1100, 2200, 3300],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    yAxisID: 'y'
                },
                {
                    label: 'EBITDA Margin (%)',
                    data: [33, 47, 56, 60, 58],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    borderDash: [5, 5],
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 12, weight: 'bold' },
                        padding: 16
                    }
                },
                title: {
                    display: true,
                    text: 'Revenue vs Expenses vs Profitability',
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label.includes('%')) {
                                return label + ': ' + context.parsed.y + '%';
                            } else {
                                return label + ': $' + context.parsed.y + 'K';
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
                    title: {
                        display: true,
                        text: 'Amount ($K)',
                        font: { size: 13, weight: 'bold' }
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value + 'K';
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Margin (%)',
                        font: { size: 13, weight: 'bold' }
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Scenario Comparison Chart (Dynamic)
let scenarioChartInstance = null;

function createScenarioChart() {
    const ctx = document.getElementById('scenarioChart');
    if (!ctx) return;
    
    scenarioChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                {
                    label: 'Base Case ARR',
                    data: [252, 756, 1760, 3280, 5040],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 12, weight: 'bold' },
                        padding: 16
                    }
                },
                title: {
                    display: true,
                    text: 'Scenario Comparison - ARR Projection ($K)',
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y + 'K';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'ARR (Thousands USD)',
                        font: { size: 13, weight: 'bold' }
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value + 'K';
                        }
                    }
                }
            }
        }
    });
}

// Risk Matrix Chart
function createRiskMatrixChart() {
    const ctx = document.getElementById('riskMatrixChart');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [
                {
                    label: 'Market Risk',
                    data: [{ x: 30, y: 80, r: 20 }],
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: '#ef4444',
                    borderWidth: 2
                },
                {
                    label: 'AI Model Accuracy',
                    data: [{ x: 40, y: 60, r: 15 }],
                    backgroundColor: 'rgba(245, 158, 11, 0.6)',
                    borderColor: '#f59e0b',
                    borderWidth: 2
                },
                {
                    label: 'Big Tech Competition',
                    data: [{ x: 20, y: 70, r: 18 }],
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                    borderColor: '#ef4444',
                    borderWidth: 2
                },
                {
                    label: 'Regulatory Risk',
                    data: [{ x: 10, y: 50, r: 12 }],
                    backgroundColor: 'rgba(245, 158, 11, 0.6)',
                    borderColor: '#f59e0b',
                    borderWidth: 2
                },
                {
                    label: 'Data Provider Dependency',
                    data: [{ x: 30, y: 45, r: 14 }],
                    backgroundColor: 'rgba(245, 158, 11, 0.6)',
                    borderColor: '#f59e0b',
                    borderWidth: 2
                },
                {
                    label: 'Key Person Dependency',
                    data: [{ x: 15, y: 30, r: 10 }],
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: '#10b981',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: { size: 11, weight: 'bold' },
                        padding: 12
                    }
                },
                title: {
                    display: true,
                    text: 'Risk Matrix: Probability vs Impact',
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return [
                                context.dataset.label,
                                'Probability: ' + context.parsed.x + '%',
                                'Impact: ' + context.parsed.y + '/100'
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Probability (%)',
                        font: { size: 13, weight: 'bold' }
                    },
                    min: 0,
                    max: 50
                },
                y: {
                    title: {
                        display: true,
                        text: 'Impact Score (0-100)',
                        font: { size: 13, weight: 'bold' }
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

// ============================================
// SIMULATOR FUNCTIONALITY
// ============================================

function initializeSimulator() {
    // Input listeners
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
    
    // Run simulation button
    const runBtn = document.getElementById('runSimulationBtn');
    if (runBtn) {
        runBtn.addEventListener('click', runSimulation);
    }
    
    // Reset button
    const resetBtn = document.getElementById('resetSimulationBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSimulation);
    }
}

function updateSimulationValues() {
    // Update displayed values
    document.getElementById('totalUsersValue').textContent = simulationParams.totalUsers.toLocaleString();
    document.getElementById('conversionRateValue').textContent = simulationParams.conversionRate;
    document.getElementById('proSplitValue').textContent = simulationParams.proSplit;
    document.getElementById('growthRateValue').textContent = simulationParams.growthRate;
    document.getElementById('cacValue').textContent = simulationParams.cac;
    document.getElementById('churnRateValue').textContent = simulationParams.churnRate;
}

function runSimulation() {
    console.log('🚀 Running simulation with params:', simulationParams);
    
    // Calculate Year 1 metrics
    const paidUsers = Math.round(simulationParams.totalUsers * (simulationParams.conversionRate / 100));
    const proUsers = Math.round(paidUsers * (simulationParams.proSplit / 100));
    const platinumUsers = paidUsers - proUsers;
    
    const y1MRR = (proUsers * 10) + (platinumUsers * 20);
    const y1ARR = y1MRR * 12;
    
    // Calculate Year 5 projections
    let totalUsers = simulationParams.totalUsers;
    let arr = y1ARR;
    
    for (let year = 2; year <= 5; year++) {
        totalUsers = Math.round(totalUsers * (1 + simulationParams.growthRate / 100));
        const yearlyPaidUsers = Math.round(totalUsers * (simulationParams.conversionRate / 100));
        const yearlyProUsers = Math.round(yearlyPaidUsers * (simulationParams.proSplit / 100));
        const yearlyPlatinumUsers = yearlyPaidUsers - yearlyProUsers;
        arr = ((yearlyProUsers * 10) + (yearlyPlatinumUsers * 20)) * 12;
    }
    
    const y5ARR = arr;
    
    // Calculate LTV & CAC
    const arpu = (simulationParams.proSplit / 100 * 10) + ((100 - simulationParams.proSplit) / 100 * 20);
    const customerLifespan = 1 / (simulationParams.churnRate / 100);
    const ltv = arpu * customerLifespan;
    const ltvCacRatio = ltv / simulationParams.cac;
    const paybackPeriod = simulationParams.cac / (arpu * 0.85); // 85% gross margin
    
    // Calculate EBITDA (simplified)
    const y5Revenue = y5ARR;
    const y5Expenses = y5Revenue * 0.42; // 42% expense ratio
    const y5EBITDA = y5Revenue - y5Expenses;
    
    // Update UI
    document.getElementById('simY1MRR').textContent = '$' + y1MRR.toLocaleString();
    document.getElementById('simY1ARR').textContent = '$' + y1ARR.toLocaleString();
    document.getElementById('simY5ARR').textContent = '$' + (y5ARR / 1000).toFixed(2) + 'M';
    document.getElementById('simLTVCAC').textContent = ltvCacRatio.toFixed(1) + ':1';
    document.getElementById('simPayback').textContent = paybackPeriod.toFixed(1) + ' months';
    document.getElementById('simY5EBITDA').textContent = '$' + (y5EBITDA / 1000).toFixed(2) + 'M';
    
    // Update chart
    updateScenarioChart();
    
    // Success animation
    const resultsSection = document.getElementById('simulationResults');
    if (resultsSection) {
        resultsSection.style.animation = 'none';
        setTimeout(() => {
            resultsSection.style.animation = 'fadeInUp 0.6s ease';
        }, 10);
    }
    
    console.log('✅ Simulation complete');
}

function resetSimulation() {
    simulationParams = { ...defaultParams };
    
    // Reset inputs
    document.getElementById('simTotalUsers').value = simulationParams.totalUsers;
    document.getElementById('simConversionRate').value = simulationParams.conversionRate;
    document.getElementById('simProSplit').value = simulationParams.proSplit;
    document.getElementById('simGrowthRate').value = simulationParams.growthRate;
    document.getElementById('simCAC').value = simulationParams.cac;
    document.getElementById('simChurnRate').value = simulationParams.churnRate;
    
    updateSimulationValues();
    runSimulation();
    
    console.log('🔄 Simulation reset to defaults');
}

function updateScenarioChart() {
    if (!scenarioChartInstance) return;
    
    // Calculate 5-year projection based on current params
    const projections = [];
    let totalUsers = simulationParams.totalUsers;
    
    for (let year = 1; year <= 5; year++) {
        const paidUsers = Math.round(totalUsers * (simulationParams.conversionRate / 100));
        const proUsers = Math.round(paidUsers * (simulationParams.proSplit / 100));
        const platinumUsers = paidUsers - proUsers;
        const arr = ((proUsers * 10) + (platinumUsers * 20)) * 12;
        projections.push(arr);
        
        totalUsers = Math.round(totalUsers * (1 + simulationParams.growthRate / 100));
    }
    
    scenarioChartInstance.data.datasets[0].data = projections;
    scenarioChartInstance.update();
}

// ============================================
// PRE-CONFIGURED SCENARIOS
// ============================================

function initializeScenarios() {
    const scenarioCards = document.querySelectorAll('.scenario-card');
    
    scenarioCards.forEach(card => {
        const applyBtn = card.querySelector('.apply-scenario-btn');
        if (applyBtn) {
            applyBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const scenario = card.dataset.scenario;
                applyScenario(scenario);
            });
        }
    });
}

function applyScenario(scenario) {
    const scenarios = {
        conservative: {
            totalUsers: 3000,
            conversionRate: 20,
            proSplit: 60,
            growthRate: 150,
            cac: 35,
            churnRate: 7
        },
        base: {
            totalUsers: 5000,
            conversionRate: 30,
            proSplit: 60,
            growthRate: 200,
            cac: 25,
            churnRate: 5
        },
        aggressive: {
            totalUsers: 10000,
            conversionRate: 40,
            proSplit: 50,
            growthRate: 300,
            cac: 20,
            churnRate: 4
        }
    };
    
    const params = scenarios[scenario];
    if (!params) return;
    
    // Update simulation params
    simulationParams = { ...params };
    
    // Update inputs
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

// ============================================
// EXPORT PDF FUNCTIONALITY
// ============================================

function initializeExportPDF() {
    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            console.log('📄 Export PDF functionality');
            alert('PDF Export: Cette fonctionnalité nécessite la librairie jsPDF. Souhaitez-vous que je l\'implémente ?');
            // TODO: Implement jsPDF export
        });
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatCurrency(value) {
    if (value >= 1000000) {
        return '$' + (value / 1000000).toFixed(2) + 'M';
    } else if (value >= 1000) {
        return '$' + (value / 1000).toFixed(0) + 'K';
    } else {
        return '$' + value.toLocaleString();
    }
}

function formatPercentage(value) {
    return value.toFixed(1) + '%';
}

// ============================================
// SMOOTH SCROLL FOR NAVIGATION
// ============================================

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

console.log('✅ Business Plan JS Loaded Successfully');