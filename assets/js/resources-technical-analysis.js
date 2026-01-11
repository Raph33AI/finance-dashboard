/* ========================================
   TECHNICAL ANALYSIS MASTERY - JAVASCRIPT
   AlphaVault AI - Interactive Charts & Calculations
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Technical Analysis Mastery - Initialization');
    
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
    // TECHNICAL ANALYSIS CALCULATION FUNCTIONS
    // ============================================
    
    // Générer des prix avec tendance
    function generatePriceData(days, startPrice, trend = 0.001, volatility = 0.02) {
        const prices = [startPrice];
        for (let i = 1; i < days; i++) {
            const change = (Math.random() - 0.5) * volatility + trend;
            prices.push(prices[i - 1] * (1 + change));
        }
        return prices;
    }
    
    // Calculer SMA
    function calculateSMA(data, period) {
        const sma = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                sma.push(null);
            } else {
                const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                sma.push(sum / period);
            }
        }
        return sma;
    }
    
    // Calculer RSI
    function calculateRSI(prices, period = 14) {
        const rsi = [];
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? -change : 0);
        }
        
        for (let i = 0; i < gains.length; i++) {
            if (i < period - 1) {
                rsi.push(null);
            } else {
                const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
                const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
                const rs = avgGain / (avgLoss || 0.0001);
                rsi.push(100 - (100 / (1 + rs)));
            }
        }
        
        return [null, ...rsi];
    }
    
    // Calculer EMA
    function calculateEMA(data, period) {
        const k = 2 / (period + 1);
        const ema = [data[0]];
        for (let i = 1; i < data.length; i++) {
            ema.push(data[i] * k + ema[i - 1] * (1 - k));
        }
        return ema;
    }
    
    // Calculer MACD
    function calculateMACD(prices) {
        const ema12 = calculateEMA(prices, 12);
        const ema26 = calculateEMA(prices, 26);
        const macdLine = ema12.map((val, i) => val - ema26[i]);
        const signalLine = calculateEMA(macdLine, 9);
        const histogram = macdLine.map((val, i) => val - signalLine[i]);
        return { macdLine, signalLine, histogram };
    }
    
    // Calculer Bollinger Bands
    function calculateBollingerBands(prices, period = 20, stdDev = 2) {
        const sma = calculateSMA(prices, period);
        const upper = [];
        const lower = [];
        
        for (let i = 0; i < prices.length; i++) {
            if (i < period - 1) {
                upper.push(null);
                lower.push(null);
            } else {
                const slice = prices.slice(i - period + 1, i + 1);
                const mean = sma[i];
                const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
                const std = Math.sqrt(variance);
                upper.push(mean + stdDev * std);
                lower.push(mean - stdDev * std);
            }
        }
        
        return { upper, middle: sma, lower };
    }
    
    // Générer labels de dates
    const days = 120;
    const labels = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - i));
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // ============================================
    // CHART 1: MOVING AVERAGES
    // ============================================
    if (document.getElementById('maChart')) {
        const maPrices = generatePriceData(days, 150, 0.0015, 0.015);
        const sma50 = calculateSMA(maPrices, 50);
        const sma200 = calculateSMA(maPrices, 200);
        
        new Chart(document.getElementById('maChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price',
                    data: maPrices,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: '50-day SMA',
                    data: sma50,
                    borderColor: 'rgba(52, 211, 153, 1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                }, {
                    label: '200-day SMA',
                    data: sma200,
                    borderColor: 'rgba(251, 146, 60, 1)',
                    borderWidth: 2,
                    borderDash: [10, 5],
                    fill: false,
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
                    y: { beginAtZero: false, ticks: { callback: value => '$' + value.toFixed(2) } }
                }
            }
        });
    }
    
    // ============================================
    // CHART 2: RSI
    // ============================================
    if (document.getElementById('rsiChart')) {
        const rsiPrices = generatePriceData(days, 100, 0.001, 0.025);
        const rsiValues = calculateRSI(rsiPrices, 14);
        
        new Chart(document.getElementById('rsiChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'RSI (14)',
                    data: rsiValues,
                    borderColor: 'rgba(139, 92, 246, 1)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true },
                    tooltip: { callbacks: { label: ctx => 'RSI: ' + ctx.parsed.y.toFixed(2) } }
                },
                scales: {
                    y: { min: 0, max: 100 }
                }
            }
        });
    }
    
    // ============================================
    // CHART 3: MACD
    // ============================================
    if (document.getElementById('macdChart')) {
        const macdPrices = generatePriceData(days, 180, 0.0008, 0.018);
        const macdData = calculateMACD(macdPrices);
        
        new Chart(document.getElementById('macdChart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    type: 'line',
                    label: 'MACD Line',
                    data: macdData.macdLine,
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 2,
                    fill: false
                }, {
                    type: 'line',
                    label: 'Signal Line',
                    data: macdData.signalLine,
                    borderColor: 'rgba(251, 146, 60, 1)',
                    borderWidth: 2,
                    fill: false
                }, {
                    type: 'bar',
                    label: 'Histogram',
                    data: macdData.histogram,
                    backgroundColor: macdData.histogram.map(v => v >= 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } },
                scales: { y: { ticks: { callback: value => value.toFixed(2) } } }
            }
        });
    }
    
    // ============================================
    // CHART 4: BOLLINGER BANDS
    // ============================================
    if (document.getElementById('bollingerChart')) {
        const bbPrices = generatePriceData(days, 150, 0.0005, 0.02);
        const bbData = calculateBollingerBands(bbPrices, 20, 2);
        
        new Chart(document.getElementById('bollingerChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price',
                    data: bbPrices,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Upper Band',
                    data: bbData.upper,
                    borderColor: 'rgba(239, 68, 68, 0.8)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Middle Band (SMA 20)',
                    data: bbData.middle,
                    borderColor: 'rgba(156, 163, 175, 0.8)',
                    borderWidth: 1,
                    fill: false,
                    tension: 0.4
                }, {
                    label: 'Lower Band',
                    data: bbData.lower,
                    borderColor: 'rgba(34, 197, 94, 0.8)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } },
                scales: { y: { beginAtZero: false, ticks: { callback: value => '$' + value.toFixed(2) } } }
            }
        });
    }
    
    // ============================================
    // CHARTS 5-8 (Fibonacci, Volume, Patterns)
    // Code identique à l'inline - je le garde ici pour éviter répétition
    // ============================================
    
    console.log('✅ All Technical Analysis charts initialized');
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
            
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    });
});

console.log('📈 Technical Analysis Mastery - Ready!');