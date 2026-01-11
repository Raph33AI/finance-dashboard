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
    
    // Calculer OBV (On-Balance Volume)
    function calculateOBV(prices, volumes) {
        const obv = [volumes[0]];
        for (let i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i - 1]) {
                obv.push(obv[i - 1] + volumes[i]);
            } else if (prices[i] < prices[i - 1]) {
                obv.push(obv[i - 1] - volumes[i]);
            } else {
                obv.push(obv[i - 1]);
            }
        }
        return obv;
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
                    tooltip: { callbacks: { label: ctx => 'RSI: ' + ctx.parsed.y.toFixed(2) } },
                    annotation: {
                        annotations: {
                            overbought: {
                                type: 'line',
                                yMin: 70,
                                yMax: 70,
                                borderColor: 'rgba(239, 68, 68, 0.8)',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    content: 'Overbought (70)',
                                    enabled: true,
                                    position: 'end'
                                }
                            },
                            oversold: {
                                type: 'line',
                                yMin: 30,
                                yMax: 30,
                                borderColor: 'rgba(34, 197, 94, 0.8)',
                                borderWidth: 2,
                                borderDash: [5, 5],
                                label: {
                                    content: 'Oversold (30)',
                                    enabled: true,
                                    position: 'end'
                                }
                            }
                        }
                    }
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
                    fill: false,
                    yAxisID: 'y'
                }, {
                    type: 'line',
                    label: 'Signal Line',
                    data: macdData.signalLine,
                    borderColor: 'rgba(251, 146, 60, 1)',
                    borderWidth: 2,
                    fill: false,
                    yAxisID: 'y'
                }, {
                    type: 'bar',
                    label: 'Histogram',
                    data: macdData.histogram,
                    backgroundColor: macdData.histogram.map(v => v >= 0 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'),
                    yAxisID: 'y'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } },
                scales: { 
                    y: { 
                        ticks: { callback: value => value.toFixed(2) }
                    } 
                }
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
    // CHART 5: FIBONACCI RETRACEMENTS
    // ============================================
    if (document.getElementById('fibonacciChart')) {
        // Generate rally then pullback
        const fibPrices = [];
        const startPrice = 100;
        const highPrice = 150;
        const rallyDays = 40;
        const pullbackDays = 80;
        
        // Rally phase
        for (let i = 0; i < rallyDays; i++) {
            fibPrices.push(startPrice + (highPrice - startPrice) * (i / rallyDays) + (Math.random() - 0.5) * 2);
        }
        
        // Pullback phase (retracement to 61.8%)
        const targetPrice = highPrice - (highPrice - startPrice) * 0.618;
        for (let i = 0; i < pullbackDays; i++) {
            fibPrices.push(highPrice - (highPrice - targetPrice) * (i / pullbackDays) + (Math.random() - 0.5) * 2);
        }
        
        // Fibonacci levels
        const fib236 = Array(days).fill(highPrice - (highPrice - startPrice) * 0.236);
        const fib382 = Array(days).fill(highPrice - (highPrice - startPrice) * 0.382);
        const fib50 = Array(days).fill(highPrice - (highPrice - startPrice) * 0.5);
        const fib618 = Array(days).fill(highPrice - (highPrice - startPrice) * 0.618);
        const fib786 = Array(days).fill(highPrice - (highPrice - startPrice) * 0.786);
        
        new Chart(document.getElementById('fibonacciChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price',
                    data: fibPrices,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    order: 1
                }, {
                    label: '23.6% Fib',
                    data: fib236,
                    borderColor: 'rgba(236, 72, 153, 0.6)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    order: 2
                }, {
                    label: '38.2% Fib',
                    data: fib382,
                    borderColor: 'rgba(59, 130, 246, 0.6)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    order: 2
                }, {
                    label: '50% Fib',
                    data: fib50,
                    borderColor: 'rgba(139, 92, 246, 0.7)',
                    borderWidth: 2,
                    borderDash: [3, 3],
                    fill: false,
                    pointRadius: 0,
                    order: 2
                }, {
                    label: '61.8% Fib (Golden)',
                    data: fib618,
                    borderColor: 'rgba(251, 146, 60, 0.9)',
                    borderWidth: 2,
                    borderDash: [8, 4],
                    fill: false,
                    pointRadius: 0,
                    order: 2
                }, {
                    label: '78.6% Fib',
                    data: fib786,
                    borderColor: 'rgba(239, 68, 68, 0.6)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    order: 2
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
                        beginAtZero: false, 
                        ticks: { callback: value => '$' + value.toFixed(2) } 
                    }
                }
            }
        });
    }
    
    // ============================================
    // CHART 6: VOLUME + OBV
    // ============================================
    if (document.getElementById('volumeChart')) {
        const volPrices = generatePriceData(days, 120, 0.0012, 0.018);
        const volumes = Array.from({ length: days }, () => Math.floor(Math.random() * 5000000) + 1000000);
        const obvValues = calculateOBV(volPrices, volumes);
        
        // Normalize OBV for display (scale to price range)
        const obvMin = Math.min(...obvValues);
        const obvMax = Math.max(...obvValues);
        const priceMin = Math.min(...volPrices);
        const priceMax = Math.max(...volPrices);
        const obvScaled = obvValues.map(v => 
            priceMin + ((v - obvMin) / (obvMax - obvMin)) * (priceMax - priceMin)
        );
        
        new Chart(document.getElementById('volumeChart'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    type: 'line',
                    label: 'Price',
                    data: volPrices,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    yAxisID: 'y-price',
                    order: 1
                }, {
                    type: 'line',
                    label: 'OBV (Scaled)',
                    data: obvScaled,
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 2,
                    fill: false,
                    yAxisID: 'y-price',
                    order: 2
                }, {
                    type: 'bar',
                    label: 'Volume',
                    data: volumes,
                    backgroundColor: volumes.map((v, i) => 
                        i > 0 && volPrices[i] >= volPrices[i - 1] 
                            ? 'rgba(34, 197, 94, 0.5)' 
                            : 'rgba(239, 68, 68, 0.5)'
                    ),
                    yAxisID: 'y-volume',
                    order: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: true },
                    tooltip: { 
                        mode: 'index', 
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label === 'Volume') {
                                    return label + ': ' + (context.parsed.y / 1000000).toFixed(2) + 'M';
                                } else if (label === 'Price') {
                                    return label + ': $' + context.parsed.y.toFixed(2);
                                } else {
                                    return label + ': ' + context.parsed.y.toFixed(2);
                                }
                            }
                        }
                    }
                },
                scales: {
                    'y-price': {
                        type: 'linear',
                        position: 'left',
                        ticks: { callback: value => '$' + value.toFixed(2) },
                        title: { display: true, text: 'Price' }
                    },
                    'y-volume': {
                        type: 'linear',
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        ticks: { callback: value => (value / 1000000).toFixed(1) + 'M' },
                        title: { display: true, text: 'Volume' }
                    }
                }
            }
        });
    }
    
    // ============================================
    // CHART 7: HEAD & SHOULDERS PATTERN
    // ============================================
    if (document.getElementById('headShouldersChart')) {
        const hsPrices = [];
        const basePrice = 100;
        
        // Left shoulder (rally to 130)
        for (let i = 0; i < 20; i++) {
            hsPrices.push(basePrice + 30 * (i / 20) + (Math.random() - 0.5) * 2);
        }
        // Pullback to neckline (110)
        for (let i = 0; i < 15; i++) {
            hsPrices.push(130 - 20 * (i / 15) + (Math.random() - 0.5) * 2);
        }
        // Head (rally to 145)
        for (let i = 0; i < 20; i++) {
            hsPrices.push(110 + 35 * (i / 20) + (Math.random() - 0.5) * 2);
        }
        // Pullback to neckline (110)
        for (let i = 0; i < 15; i++) {
            hsPrices.push(145 - 35 * (i / 15) + (Math.random() - 0.5) * 2);
        }
        // Right shoulder (rally to 128)
        for (let i = 0; i < 15; i++) {
            hsPrices.push(110 + 18 * (i / 15) + (Math.random() - 0.5) * 2);
        }
        // Breakdown (falls to 90)
        for (let i = 0; i < 35; i++) {
            hsPrices.push(128 - 38 * (i / 35) + (Math.random() - 0.5) * 2);
        }
        
        const neckline = Array(days).fill(110);
        
        new Chart(document.getElementById('headShouldersChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price',
                    data: hsPrices,
                    borderColor: 'rgba(102, 126, 234, 1)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0
                }, {
                    label: 'Neckline',
                    data: neckline,
                    borderColor: 'rgba(251, 146, 60, 0.9)',
                    borderWidth: 2,
                    borderDash: [10, 5],
                    fill: false,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true },
                    tooltip: { mode: 'index', intersect: false },
                    annotation: {
                        annotations: {
                            leftShoulder: {
                                type: 'label',
                                xValue: 10,
                                yValue: 135,
                                content: ['Left', 'Shoulder'],
                                font: { size: 12, weight: 'bold' },
                                color: 'rgba(102, 126, 234, 1)'
                            },
                            head: {
                                type: 'label',
                                xValue: 40,
                                yValue: 150,
                                content: ['Head'],
                                font: { size: 14, weight: 'bold' },
                                color: 'rgba(239, 68, 68, 1)'
                            },
                            rightShoulder: {
                                type: 'label',
                                xValue: 70,
                                yValue: 133,
                                content: ['Right', 'Shoulder'],
                                font: { size: 12, weight: 'bold' },
                                color: 'rgba(102, 126, 234, 1)'
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: false, 
                        ticks: { callback: value => '$' + value.toFixed(2) } 
                    }
                }
            }
        });
    }
    
    // ============================================
    // CHART 8: BULL FLAG PATTERN
    // ============================================
    if (document.getElementById('bullFlagChart')) {
        const bfPrices = [];
        const basePrice = 100;
        
        // Initial consolidation
        for (let i = 0; i < 20; i++) {
            bfPrices.push(basePrice + (Math.random() - 0.5) * 2);
        }
        // Flagpole (sharp rally from 100 to 140 in 10 days)
        for (let i = 0; i < 10; i++) {
            bfPrices.push(100 + 40 * (i / 10) + (Math.random() - 0.5) * 2);
        }
        // Flag (tight consolidation 140 to 130 over 25 days)
        for (let i = 0; i < 25; i++) {
            bfPrices.push(140 - 10 * (i / 25) + (Math.random() - 0.5) * 1.5);
        }
        // Breakout (rally to 165)
        for (let i = 0; i < 25; i++) {
            bfPrices.push(130 + 35 * (i / 25) + (Math.random() - 0.5) * 2);
        }
        // Continuation
        for (let i = 0; i < 40; i++) {
            bfPrices.push(165 + (Math.random() - 0.3) * 3);
        }
        
        // Flag trend lines
        const flagUpper = [];
        const flagLower = [];
        for (let i = 0; i < days; i++) {
            if (i >= 30 && i <= 55) {
                flagUpper.push(140 - 10 * ((i - 30) / 25));
                flagLower.push(135 - 10 * ((i - 30) / 25));
            } else {
                flagUpper.push(null);
                flagLower.push(null);
            }
        }
        
        new Chart(document.getElementById('bullFlagChart'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Price',
                    data: bfPrices,
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.2,
                    pointRadius: 0
                }, {
                    label: 'Flag Upper Bound',
                    data: flagUpper,
                    borderColor: 'rgba(251, 191, 36, 0.8)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    spanGaps: false
                }, {
                    label: 'Flag Lower Bound',
                    data: flagLower,
                    borderColor: 'rgba(251, 191, 36, 0.8)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    spanGaps: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true },
                    tooltip: { mode: 'index', intersect: false },
                    annotation: {
                        annotations: {
                            flagpole: {
                                type: 'label',
                                xValue: 25,
                                yValue: 120,
                                content: ['Flagpole', '(Sharp Rally)'],
                                font: { size: 12, weight: 'bold' },
                                color: 'rgba(34, 197, 94, 1)'
                            },
                            flag: {
                                type: 'label',
                                xValue: 42,
                                yValue: 145,
                                content: ['Flag', '(Consolidation)'],
                                font: { size: 12, weight: 'bold' },
                                color: 'rgba(251, 191, 36, 1)'
                            },
                            breakout: {
                                type: 'label',
                                xValue: 67,
                                yValue: 150,
                                content: ['Breakout'],
                                font: { size: 13, weight: 'bold' },
                                color: 'rgba(239, 68, 68, 1)'
                            }
                        }
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: false, 
                        ticks: { callback: value => '$' + value.toFixed(2) } 
                    }
                }
            }
        });
    }
    
    console.log('✅ All 8 Technical Analysis charts initialized successfully');
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