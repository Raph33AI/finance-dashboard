/* ═══════════════════════════════════════════════════════════════
   RESOURCES ML - MACHINE LEARNING VISUALIZATIONS
   Fichier: assets/js/resources-ml-visualizations.js
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 Machine Learning Visualizations - Initializing...');
    
    // ===================================================
    // USER MENU SIDEBAR FUNCTIONALITY
    // ===================================================
    
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
    
    // ===================================================
    // NEURAL NETWORK VISUALIZATIONS
    // ===================================================
    
    // 1. LSTM NETWORK VISUALIZATION
    const lstmCanvas = document.getElementById('lstmCanvas');
    if (lstmCanvas) {
        initLSTMVisualization(lstmCanvas);
    }
    
    // 2. RANDOM FOREST VISUALIZATION
    const rfCanvas = document.getElementById('randomForestCanvas');
    if (rfCanvas) {
        initRandomForestVisualization(rfCanvas);
    }
    
    // ===================================================
    // CHART.JS VISUALIZATIONS
    // ===================================================
    
    // 1. LSTM TRAINING PROGRESS CHART
    const lstmTrainingChart = document.getElementById('lstmTrainingChart');
    if (lstmTrainingChart && typeof Chart !== 'undefined') {
        initLSTMTrainingChart(lstmTrainingChart);
    }
    
    // 2. MODEL COMPARISON CHART
    const modelComparisonChart = document.getElementById('modelComparisonChart');
    if (modelComparisonChart && typeof Chart !== 'undefined') {
        initModelComparisonChart(modelComparisonChart);
    }
    
    // 3. ENSEMBLE PREDICTION CHART
    const ensemblePredictionChart = document.getElementById('ensemblePredictionChart');
    if (ensemblePredictionChart && typeof Chart !== 'undefined') {
        initEnsemblePredictionChart(ensemblePredictionChart);
    }
    
    // 4. BACKTEST PERFORMANCE CHART
    const backtestChart = document.getElementById('backtestPerformanceChart');
    if (backtestChart && typeof Chart !== 'undefined') {
        initBacktestChart(backtestChart);
    }
    
    console.log('✅ Machine Learning Visualizations - Initialized successfully');
});

/* ═══════════════════════════════════════════════════════════════
   LSTM NEURAL NETWORK VISUALIZATION
   ═══════════════════════════════════════════════════════════════ */

function initLSTMVisualization(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    let animationFrame = 0;
    
    function drawLSTMNetwork() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const layers = {
            input: { x: 100, y: canvas.height / 2, neurons: 5 },
            lstm1: { x: 300, y: canvas.height / 2, neurons: 8 },
            lstm2: { x: 500, y: canvas.height / 2, neurons: 6 },
            dense: { x: 700, y: canvas.height / 2, neurons: 4 },
            output: { x: 900, y: canvas.height / 2, neurons: 1 }
        };
        
        // Draw connections
        Object.keys(layers).forEach((key, index) => {
            if (index < Object.keys(layers).length - 1) {
                const currentLayer = layers[key];
                const nextLayer = layers[Object.keys(layers)[index + 1]];
                
                for (let i = 0; i < currentLayer.neurons; i++) {
                    for (let j = 0; j < nextLayer.neurons; j++) {
                        const startY = currentLayer.y - (currentLayer.neurons - 1) * 25 + i * 50;
                        const endY = nextLayer.y - (nextLayer.neurons - 1) * 25 + j * 50;
                        
                        const pulse = Math.sin(animationFrame * 0.05 + i + j) * 0.3 + 0.7;
                        
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * pulse})`;
                        ctx.lineWidth = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(currentLayer.x, startY);
                        ctx.lineTo(nextLayer.x, endY);
                        ctx.stroke();
                    }
                }
            }
        });
        
        // Draw neurons
        Object.entries(layers).forEach(([key, layer]) => {
            for (let i = 0; i < layer.neurons; i++) {
                const y = layer.y - (layer.neurons - 1) * 25 + i * 50;
                const pulse = Math.sin(animationFrame * 0.05 + i) * 5 + 20;
                
                // Neuron glow
                const gradient = ctx.createRadialGradient(layer.x, y, 0, layer.x, y, pulse + 15);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(layer.x, y, pulse + 15, 0, Math.PI * 2);
                ctx.fill();
                
                // Neuron core
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(layer.x, y, pulse, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        
        // Draw labels
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        
        ctx.fillText('Input Layer', layers.input.x, 30);
        ctx.fillText('(Price, Volume, RSI)', layers.input.x, 50);
        
        ctx.fillText('LSTM Layer 1', layers.lstm1.x, 30);
        ctx.fillText('(50 units)', layers.lstm1.x, 50);
        
        ctx.fillText('LSTM Layer 2', layers.lstm2.x, 30);
        ctx.fillText('(50 units)', layers.lstm2.x, 50);
        
        ctx.fillText('Dense Layer', layers.dense.x, 30);
        ctx.fillText('(25 units)', layers.dense.x, 50);
        
        ctx.fillText('Output', layers.output.x, 30);
        ctx.fillText('(Prediction)', layers.output.x, 50);
        
        animationFrame++;
        requestAnimationFrame(drawLSTMNetwork);
    }
    
    drawLSTMNetwork();
}

/* ═══════════════════════════════════════════════════════════════
   RANDOM FOREST VISUALIZATION
   ═══════════════════════════════════════════════════════════════ */

function initRandomForestVisualization(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    let animationFrame = 0;
    
    function drawRandomForest() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const numTrees = 7;
        const treeWidth = canvas.width / numTrees;
        
        for (let i = 0; i < numTrees; i++) {
            const x = treeWidth * i + treeWidth / 2;
            const y = canvas.height - 50;
            
            drawTree(ctx, x, y, 5, Math.PI / 2, 100, i, animationFrame);
        }
        
        // Draw title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Random Forest: 300 Decision Trees', canvas.width / 2, 40);
        
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText('Each tree votes on the final prediction (ensemble averaging)', canvas.width / 2, 65);
        
        animationFrame++;
        requestAnimationFrame(drawRandomForest);
    }
    
    function drawTree(ctx, x, y, depth, angle, length, treeIndex, frame) {
        if (depth === 0) return;
        
        const pulse = Math.sin(frame * 0.03 + treeIndex) * 0.2 + 0.8;
        
        const x2 = x + Math.cos(angle) * length * pulse;
        const y2 = y - Math.sin(angle) * length * pulse;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${depth / 5})`;
        ctx.lineWidth = depth * 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Draw branches
        drawTree(ctx, x2, y2, depth - 1, angle - Math.PI / 6, length * 0.7, treeIndex, frame);
        drawTree(ctx, x2, y2, depth - 1, angle + Math.PI / 6, length * 0.7, treeIndex, frame);
        
        // Draw leaf nodes (predictions)
        if (depth === 1) {
            const gradient = ctx.createRadialGradient(x2, y2, 0, x2, y2, 8);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 1)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.3)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x2, y2, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawRandomForest();
}

/* ═══════════════════════════════════════════════════════════════
   CHART.JS - LSTM TRAINING PROGRESS
   ═══════════════════════════════════════════════════════════════ */

function initLSTMTrainingChart(canvas) {
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: Array.from({ length: 50 }, (_, i) => i + 1),
            datasets: [{
                label: 'Training Loss',
                data: Array.from({ length: 50 }, (_, i) => 0.8 * Math.exp(-i / 15) + 0.05),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }, {
                label: 'Validation Loss',
                data: Array.from({ length: 50 }, (_, i) => 0.85 * Math.exp(-i / 18) + 0.08),
                borderColor: '#f093fb',
                backgroundColor: 'rgba(240, 147, 251, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    display: true, 
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: 600
                        }
                    }
                },
                title: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: 'Inter, sans-serif',
                        size: 14,
                        weight: 700
                    },
                    bodyFont: {
                        family: 'Inter, sans-serif',
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { 
                        display: true, 
                        text: 'Mean Squared Error (Loss)',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: 600
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: { 
                        display: true, 
                        text: 'Epoch',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: 600
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
}

/* ═══════════════════════════════════════════════════════════════
   CHART.JS - MODEL COMPARISON
   ═══════════════════════════════════════════════════════════════ */

function initModelComparisonChart(canvas) {
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ['LSTM', 'Random Forest', 'XGBoost', 'Ensemble'],
            datasets: [{
                label: 'Accuracy (%)',
                data: [68.5, 72.3, 74.8, 78.9],
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 87, 108, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderColor: [
                    '#667eea',
                    '#10b981',
                    '#f5576c',
                    '#8b5cf6'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                title: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: 'Inter, sans-serif',
                        size: 14,
                        weight: 700
                    },
                    bodyFont: {
                        family: 'Inter, sans-serif',
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return 'Accuracy: ' + context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: { 
                        display: true, 
                        text: 'Accuracy (%)',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: 600
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: 600
                        }
                    }
                }
            }
        }
    });
}

/* ═══════════════════════════════════════════════════════════════
   CHART.JS - ENSEMBLE PREDICTION
   ═══════════════════════════════════════════════════════════════ */

function initEnsemblePredictionChart(canvas) {
    const days = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    const actualPrices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i / 3) * 15 + Math.random() * 5);
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Actual Price',
                data: actualPrices,
                borderColor: '#1e293b',
                backgroundColor: 'rgba(30, 41, 59, 0.1)',
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: '#1e293b'
            }, {
                label: 'LSTM Prediction',
                data: actualPrices.map(p => p + (Math.random() - 0.5) * 8),
                borderColor: '#667eea',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 2,
                fill: false
            }, {
                label: 'Random Forest Prediction',
                data: actualPrices.map(p => p + (Math.random() - 0.5) * 6),
                borderColor: '#10b981',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 2,
                fill: false
            }, {
                label: 'XGBoost Prediction',
                data: actualPrices.map(p => p + (Math.random() - 0.5) * 7),
                borderColor: '#f5576c',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 2,
                fill: false
            }, {
                label: 'Ensemble Prediction',
                data: actualPrices.map(p => p + (Math.random() - 0.5) * 3),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                pointRadius: 3,
                pointBackgroundColor: '#8b5cf6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    display: true, 
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11,
                            weight: 600
                        },
                        boxWidth: 12,
                        padding: 10
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: 'Inter, sans-serif',
                        size: 14,
                        weight: 700
                    },
                    bodyFont: {
                        family: 'Inter, sans-serif',
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: { 
                        display: true, 
                        text: 'Stock Price ($)',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: 600
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0,
                        font: {
                            family: 'Inter, sans-serif',
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

/* ═══════════════════════════════════════════════════════════════
   CHART.JS - BACKTEST PERFORMANCE
   ═══════════════════════════════════════════════════════════════ */

function initBacktestChart(canvas) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let strategyReturn = 10000;
    let benchmarkReturn = 10000;
    const strategyData = [];
    const benchmarkData = [];
    
    for (let i = 0; i < 12; i++) {
        strategyReturn *= (1 + (Math.random() * 0.05 + 0.02));
        benchmarkReturn *= (1 + (Math.random() * 0.03 + 0.005));
        strategyData.push(strategyReturn);
        benchmarkData.push(benchmarkReturn);
    }
    
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'ML Strategy',
                data: strategyData,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }, {
                label: 'S&P 500 Benchmark',
                data: benchmarkData,
                borderColor: '#64748b',
                backgroundColor: 'rgba(100, 116, 139, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#64748b',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { 
                    display: true, 
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: 600
                        },
                        boxWidth: 15,
                        padding: 15
                    }
                },
                title: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: 'Inter, sans-serif',
                        size: 14,
                        weight: 700
                    },
                    bodyFont: {
                        family: 'Inter, sans-serif',
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.parsed.y.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: { 
                        display: true, 
                        text: 'Portfolio Value ($)',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: 600
                        }
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        },
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: { 
                        display: true, 
                        text: 'Month',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: 600
                        }
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE CANVAS RESIZE
   ═══════════════════════════════════════════════════════════════ */

window.addEventListener('resize', () => {
    const lstmCanvas = document.getElementById('lstmCanvas');
    const rfCanvas = document.getElementById('randomForestCanvas');
    
    if (lstmCanvas) {
        lstmCanvas.width = lstmCanvas.offsetWidth;
        lstmCanvas.height = lstmCanvas.offsetHeight;
    }
    
    if (rfCanvas) {
        rfCanvas.width = rfCanvas.offsetWidth;
        rfCanvas.height = rfCanvas.offsetHeight;
    }
});