/* ==============================================
   TREND-PREDICTION.JS - Machine Learning Models
   ============================================== */

const TrendPrediction = {
    currentSymbol: 'AAPL',
    predictionHorizon: 7, // days
    trainingPeriod: '6M',
    stockData: null,
    
    // Model results
    models: {
        linear: null,
        polynomial: null,
        exponential: null,
        knn: null,
        neural: null,
        arima: null
    },
    
    // Proxy CORS
    CORS_PROXIES: [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ],
    
    // Colors
    colors: {
        primary: '#2649B2',
        secondary: '#4A74F3',
        tertiary: '#8E7DE3',
        purple: '#9D5CE6',
        lightBlue: '#6C8BE0',
        success: '#28a745',
        danger: '#dc3545',
        warning: '#ffc107'
    },
    
    // Initialize
    init() {
        this.updateLastUpdate();
        this.setupEventListeners();
        
        // Auto-load default symbol
        setTimeout(() => {
            this.loadSymbol(this.currentSymbol);
        }, 500);
    },
    
    // Setup Event Listeners
    setupEventListeners() {
        const input = document.getElementById('symbolInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.analyzeStock();
                }
            });
        }
    },
    
    // Analyze Stock
    analyzeStock() {
        const symbol = document.getElementById('symbolInput').value.trim().toUpperCase();
        if (symbol) {
            this.loadSymbol(symbol);
        }
    },
    
    // Load Symbol
    async loadSymbol(symbol) {
        this.currentSymbol = symbol;
        document.getElementById('symbolInput').value = symbol;
        
        this.showLoading(true, 'Fetching historical data...');
        this.hideResults();
        
        try {
            await this.fetchStockData(symbol);
            this.displayStockHeader();
            
            // Train all models
            await this.trainAllModels();
            
            // Display results
            this.displayResults();
            
            this.showLoading(false);
            
        } catch (error) {
            console.error('Error loading stock data:', error);
            console.log('Using demo data as fallback...');
            this.stockData = this.generateDemoData(symbol);
            this.displayStockHeader();
            
            await this.trainAllModels();
            this.displayResults();
            
            this.showLoading(false);
        }
    },
    
    // Fetch Stock Data
    async fetchStockData(symbol) {
        const period = this.getPeriodParams(this.trainingPeriod);
        const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${period.interval}&range=${period.range}`;
        
        for (let i = 0; i < this.CORS_PROXIES.length; i++) {
            try {
                const proxyUrl = this.CORS_PROXIES[i];
                const url = proxyUrl + encodeURIComponent(targetUrl);
                
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const data = await response.json();
                if (data.chart && data.chart.error) {
                    throw new Error(data.chart.error.description);
                }
                
                const result = data.chart.result[0];
                this.stockData = this.parseYahooData(result);
                await this.fetchQuoteData(symbol);
                
                console.log('✅ Data fetched successfully');
                return;
                
            } catch (error) {
                console.warn(`Proxy ${i + 1} failed:`, error.message);
                if (i === this.CORS_PROXIES.length - 1) {
                    throw new Error('All proxies failed');
                }
            }
        }
    },
    
    // Fetch Quote Data
    async fetchQuoteData(symbol) {
        try {
            const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
            const proxyUrl = this.CORS_PROXIES[0];
            const url = proxyUrl + encodeURIComponent(targetUrl);
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.quoteResponse && data.quoteResponse.result.length > 0) {
                const quote = data.quoteResponse.result[0];
                this.stockData.quote = {
                    name: quote.longName || quote.shortName || symbol,
                    symbol: quote.symbol,
                    price: quote.regularMarketPrice,
                    change: quote.regularMarketChange,
                    changePercent: quote.regularMarketChangePercent
                };
            } else {
                throw new Error('No quote data');
            }
        } catch (error) {
            console.warn('Quote fetch failed, using fallback');
            const lastPrice = this.stockData.prices[this.stockData.prices.length - 1];
            const prevPrice = this.stockData.prices[this.stockData.prices.length - 2] || lastPrice;
            
            this.stockData.quote = {
                name: symbol,
                symbol: symbol,
                price: lastPrice.close,
                change: lastPrice.close - prevPrice.close,
                changePercent: ((lastPrice.close - prevPrice.close) / prevPrice.close) * 100
            };
        }
    },
    
    // Parse Yahoo Data
    parseYahooData(result) {
        const timestamps = result.timestamp;
        const quotes = result.indicators.quote[0];
        
        const prices = timestamps.map((time, i) => ({
            timestamp: time * 1000,
            open: quotes.open[i],
            high: quotes.high[i],
            low: quotes.low[i],
            close: quotes.close[i],
            volume: quotes.volume[i]
        })).filter(p => p.close !== null);
        
        return {
            symbol: result.meta.symbol,
            prices: prices,
            currency: result.meta.currency,
            quote: {}
        };
    },
    
    // Get Period Parameters
    getPeriodParams(period) {
        const params = {
            '3M': { range: '3mo', interval: '1d' },
            '6M': { range: '6mo', interval: '1d' },
            '1Y': { range: '1y', interval: '1d' },
            '2Y': { range: '2y', interval: '1d' }
        };
        return params[period] || params['6M'];
    },
    
    // Change Horizon
    changeHorizon(days) {
        this.predictionHorizon = days;
        
        document.querySelectorAll('.horizon-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-days="${days}"]`)?.classList.add('active');
        
        if (this.currentSymbol && this.stockData) {
            this.trainAllModels();
        }
    },
    
    // Change Training Period
    changeTrainingPeriod(period) {
        this.trainingPeriod = period;
        
        if (this.currentSymbol) {
            this.loadSymbol(this.currentSymbol);
        }
    },
    
    // ============================================
    // TRAIN ALL MODELS
    // ============================================
    
    async trainAllModels() {
        console.log('🤖 Training all ML models...');
        
        const prices = this.stockData.prices.map(p => p.close);
        
        // Update badges to training
        ['linear', 'polynomial', 'exponential', 'knn', 'neural', 'arima'].forEach(model => {
            const badge = document.getElementById(`badge-${model}`);
            if (badge) {
                badge.className = 'model-badge training';
                badge.textContent = 'Training...';
            }
        });
        
        // Train each model with delay for UI feedback
        this.showLoading(true, 'Training Linear Regression...');
        this.models.linear = await this.trainLinearRegression(prices);
        this.updateModelCard('linear', this.models.linear);
        await this.sleep(300);
        
        this.showLoading(true, 'Training Polynomial Regression...');
        this.models.polynomial = await this.trainPolynomialRegression(prices);
        this.updateModelCard('polynomial', this.models.polynomial);
        await this.sleep(300);
        
        this.showLoading(true, 'Training Exponential Smoothing...');
        this.models.exponential = await this.trainExponentialSmoothing(prices);
        this.updateModelCard('exponential', this.models.exponential);
        await this.sleep(300);
        
        this.showLoading(true, 'Training K-Nearest Neighbors...');
        this.models.knn = await this.trainKNN(prices);
        this.updateModelCard('knn', this.models.knn);
        await this.sleep(300);
        
        this.showLoading(true, 'Training Neural Network...');
        this.models.neural = await this.trainNeuralNetwork(prices);
        this.updateModelCard('neural', this.models.neural);
        await this.sleep(300);
        
        this.showLoading(true, 'Training ARIMA...');
        this.models.arima = await this.trainARIMA(prices);
        this.updateModelCard('arima', this.models.arima);
        
        console.log('✅ All models trained');
    },
    
    // ============================================
    // LINEAR REGRESSION
    // ============================================
    
    async trainLinearRegression(prices) {
        const n = prices.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = prices;
        
        // Calculate slope and intercept
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Make predictions
        const fitted = x.map(xi => slope * xi + intercept);
        
        // Predict future
        const predictions = [];
        for (let i = 0; i < this.predictionHorizon; i++) {
            const futureX = n + i;
            predictions.push(slope * futureX + intercept);
        }
        
        // Calculate metrics
        const r2 = this.calculateR2(y, fitted);
        const rmse = this.calculateRMSE(y, fitted);
        
        return {
            name: 'Linear Regression',
            predictions: predictions,
            fitted: fitted,
            finalPrediction: predictions[predictions.length - 1],
            r2: r2,
            rmse: rmse,
            params: { slope, intercept }
        };
    },
    
    // ============================================
    // POLYNOMIAL REGRESSION
    // ============================================
    
    async trainPolynomialRegression(prices, degree = 3) {
        const n = prices.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = prices;
        
        // Build design matrix
        const X = x.map(xi => {
            const row = [];
            for (let d = 0; d <= degree; d++) {
                row.push(Math.pow(xi, d));
            }
            return row;
        });
        
        // Solve using normal equation: (X^T X)^-1 X^T y
        const coefficients = this.solveLinearSystem(X, y);
        
        // Make predictions
        const fitted = x.map(xi => {
            let sum = 0;
            for (let d = 0; d <= degree; d++) {
                sum += coefficients[d] * Math.pow(xi, d);
            }
            return sum;
        });
        
        // Predict future
        const predictions = [];
        for (let i = 0; i < this.predictionHorizon; i++) {
            const futureX = n + i;
            let sum = 0;
            for (let d = 0; d <= degree; d++) {
                sum += coefficients[d] * Math.pow(futureX, d);
            }
            predictions.push(sum);
        }
        
        // Calculate metrics
        const r2 = this.calculateR2(y, fitted);
        const rmse = this.calculateRMSE(y, fitted);
        
        return {
            name: 'Polynomial Regression',
            predictions: predictions,
            fitted: fitted,
            finalPrediction: predictions[predictions.length - 1],
            r2: r2,
            rmse: rmse,
            params: { coefficients, degree }
        };
    },
    
    // ============================================
    // EXPONENTIAL SMOOTHING (Holt's Method)
    // ============================================
    
    async trainExponentialSmoothing(prices, alpha = 0.3, beta = 0.1) {
        const n = prices.length;
        
        // Initialize
        let level = prices[0];
        let trend = prices[1] - prices[0];
        const fitted = [prices[0]];
        
        // Fit the model
        for (let i = 1; i < n; i++) {
            const prevLevel = level;
            const prevTrend = trend;
            
            level = alpha * prices[i] + (1 - alpha) * (prevLevel + prevTrend);
            trend = beta * (level - prevLevel) + (1 - beta) * prevTrend;
            
            fitted.push(prevLevel + prevTrend);
        }
        
        // Predict future
        const predictions = [];
        for (let i = 1; i <= this.predictionHorizon; i++) {
            predictions.push(level + i * trend);
        }
        
        // Calculate metrics
        const r2 = this.calculateR2(prices, fitted);
        const rmse = this.calculateRMSE(prices, fitted);
        
        return {
            name: 'Exponential Smoothing',
            predictions: predictions,
            fitted: fitted,
            finalPrediction: predictions[predictions.length - 1],
            r2: r2,
            rmse: rmse,
            params: { alpha, beta, level, trend }
        };
    },
    
    // ============================================
    // K-NEAREST NEIGHBORS
    // ============================================
    
    async trainKNN(prices, k = 5, lookback = 5) {
        const n = prices.length;
        const fitted = [];
        
        // Create training data
        const trainingData = [];
        for (let i = lookback; i < n - 1; i++) {
            const features = prices.slice(i - lookback, i);
            const target = prices[i];
            trainingData.push({ features, target });
        }
        
        // Fit (for each point, find k nearest neighbors)
        for (let i = lookback; i < n; i++) {
            const query = prices.slice(i - lookback, i);
            const prediction = this.knnPredict(query, trainingData, k);
            fitted.push(prediction);
        }
        
        // Pad fitted values
        for (let i = 0; i < lookback; i++) {
            fitted.unshift(prices[i]);
        }
        
        // Predict future
        const predictions = [];
        let currentWindow = prices.slice(-lookback);
        
        for (let i = 0; i < this.predictionHorizon; i++) {
            const prediction = this.knnPredict(currentWindow, trainingData, k);
            predictions.push(prediction);
            currentWindow = [...currentWindow.slice(1), prediction];
        }
        
        // Calculate metrics
        const r2 = this.calculateR2(prices, fitted);
        const rmse = this.calculateRMSE(prices, fitted);
        
        return {
            name: 'K-Nearest Neighbors',
            predictions: predictions,
            fitted: fitted,
            finalPrediction: predictions[predictions.length - 1],
            r2: r2,
            rmse: rmse,
            params: { k, lookback }
        };
    },
    
    knnPredict(query, trainingData, k) {
        // Calculate distances
        const distances = trainingData.map(item => ({
            distance: this.euclideanDistance(query, item.features),
            target: item.target
        }));
        
        // Sort by distance
        distances.sort((a, b) => a.distance - b.distance);
        
        // Take k nearest
        const nearest = distances.slice(0, k);
        
        // Average their targets
        const prediction = nearest.reduce((sum, item) => sum + item.target, 0) / k;
        
        return prediction;
    },
    
    euclideanDistance(a, b) {
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += Math.pow(a[i] - b[i], 2);
        }
        return Math.sqrt(sum);
    },
    
    // ============================================
    // NEURAL NETWORK (Simple Feedforward)
    // ============================================
    
    async trainNeuralNetwork(prices, lookback = 10) {
        const learningRate = 0.01;
        const epochs = 100;
        const hiddenSize = 10;
        
        // Normalize prices
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const normalized = prices.map(p => (p - minPrice) / (maxPrice - minPrice));
        
        // Create training data
        const trainingData = [];
        for (let i = lookback; i < normalized.length; i++) {
            const input = normalized.slice(i - lookback, i);
            const target = normalized[i];
            trainingData.push({ input, target });
        }
        
        // Initialize weights
        let weightsInputHidden = this.randomMatrix(lookback, hiddenSize);
        let weightsHiddenOutput = this.randomArray(hiddenSize);
        let biasHidden = this.randomArray(hiddenSize);
        let biasOutput = Math.random() - 0.5;
        
        // Train
        for (let epoch = 0; epoch < epochs; epoch++) {
            for (const { input, target } of trainingData) {
                // Forward pass
                const hidden = this.matrixVectorMultiply(weightsInputHidden, input).map((h, i) => 
                    this.relu(h + biasHidden[i])
                );
                
                const output = hidden.reduce((sum, h, i) => sum + h * weightsHiddenOutput[i], biasOutput);
                
                // Backward pass (simplified)
                const outputError = output - target;
                
                // Update weights
                for (let i = 0; i < hiddenSize; i++) {
                    weightsHiddenOutput[i] -= learningRate * outputError * hidden[i];
                }
                biasOutput -= learningRate * outputError;
            }
        }
        
        // Make fitted predictions
        const fitted = [];
        for (let i = 0; i < lookback; i++) {
            fitted.push(prices[i]);
        }
        
        for (let i = lookback; i < prices.length; i++) {
            const input = normalized.slice(i - lookback, i);
            const hidden = this.matrixVectorMultiply(weightsInputHidden, input).map((h, i) => 
                this.relu(h + biasHidden[i])
            );
            const output = hidden.reduce((sum, h, i) => sum + h * weightsHiddenOutput[i], biasOutput);
            const denormalized = output * (maxPrice - minPrice) + minPrice;
            fitted.push(denormalized);
        }
        
        // Predict future
        const predictions = [];
        let currentWindow = normalized.slice(-lookback);
        
        for (let i = 0; i < this.predictionHorizon; i++) {
            const hidden = this.matrixVectorMultiply(weightsInputHidden, currentWindow).map((h, i) => 
                this.relu(h + biasHidden[i])
            );
            const output = hidden.reduce((sum, h, i) => sum + h * weightsHiddenOutput[i], biasOutput);
            const denormalized = output * (maxPrice - minPrice) + minPrice;
            predictions.push(denormalized);
            
            currentWindow = [...currentWindow.slice(1), output];
        }
        
        // Calculate metrics
        const r2 = this.calculateR2(prices, fitted);
        const rmse = this.calculateRMSE(prices, fitted);
        
        return {
            name: 'Neural Network',
            predictions: predictions,
            fitted: fitted,
            finalPrediction: predictions[predictions.length - 1],
            r2: r2,
            rmse: rmse,
            params: { lookback, hiddenSize, epochs }
        };
    },
    
    relu(x) {
        return Math.max(0, x);
    },
    
    randomMatrix(rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push((Math.random() - 0.5) * 0.5);
            }
            matrix.push(row);
        }
        return matrix;
    },
    
    randomArray(size) {
        return Array.from({ length: size }, () => (Math.random() - 0.5) * 0.5);
    },
    
    matrixVectorMultiply(matrix, vector) {
        return matrix.map(row => 
            row.reduce((sum, val, i) => sum + val * vector[i], 0)
        );
    },
    
    // ============================================
    // ARIMA (Simplified)
    // ============================================
    
    async trainARIMA(prices, p = 5, d = 1, q = 2) {
        // Differencing
        let diffPrices = prices;
        for (let i = 0; i < d; i++) {
            const temp = [];
            for (let j = 1; j < diffPrices.length; j++) {
                temp.push(diffPrices[j] - diffPrices[j - 1]);
            }
            diffPrices = temp;
        }
        
        const n = diffPrices.length;
        
        // Simple AR model
        const arCoeffs = [];
        for (let lag = 1; lag <= p; lag++) {
            let sumXY = 0;
            let sumX2 = 0;
            for (let i = lag; i < n; i++) {
                sumXY += diffPrices[i] * diffPrices[i - lag];
                sumX2 += diffPrices[i - lag] * diffPrices[i - lag];
            }
            arCoeffs.push(sumX2 !== 0 ? sumXY / sumX2 : 0);
        }
        
        // Fitted values
        const fitted = [];
        for (let i = 0; i < p; i++) {
            fitted.push(prices[i]);
        }
        
        for (let i = p; i < prices.length; i++) {
            let prediction = 0;
            for (let lag = 1; lag <= p; lag++) {
                if (i - lag >= 0) {
                    prediction += arCoeffs[lag - 1] * (fitted[i - lag] - (i - lag > 0 ? fitted[i - lag - 1] : prices[0]));
                }
            }
            fitted.push(fitted[i - 1] + prediction);
        }
        
        // Predict future
        const predictions = [];
        let lastValue = prices[prices.length - 1];
        let recentDiffs = [];
        
        for (let i = 0; i < p; i++) {
            if (prices.length - 1 - i >= 0) {
                recentDiffs.unshift(prices[prices.length - 1 - i] - (prices.length - 2 - i >= 0 ? prices[prices.length - 2 - i] : prices[0]));
            }
        }
        
        for (let i = 0; i < this.predictionHorizon; i++) {
            let prediction = 0;
            for (let lag = 0; lag < Math.min(p, recentDiffs.length); lag++) {
                prediction += arCoeffs[lag] * recentDiffs[recentDiffs.length - 1 - lag];
            }
            
            lastValue = lastValue + prediction;
            predictions.push(lastValue);
            recentDiffs.push(prediction);
            if (recentDiffs.length > p) {
                recentDiffs.shift();
            }
        }
        
        // Calculate metrics
        const r2 = this.calculateR2(prices, fitted);
        const rmse = this.calculateRMSE(prices, fitted);
        
        return {
            name: 'ARIMA',
            predictions: predictions,
            fitted: fitted,
            finalPrediction: predictions[predictions.length - 1],
            r2: r2,
            rmse: rmse,
            params: { p, d, q, arCoeffs }
        };
    },
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    solveLinearSystem(X, y) {
        // Solve using normal equation: (X^T X)^-1 X^T y
        const XT = this.transpose(X);
        const XTX = this.matrixMultiply(XT, X);
        const XTy = this.matrixVectorMultiply2(XT, y);
        
        // Solve using Gaussian elimination
        const n = XTX.length;
        const augmented = XTX.map((row, i) => [...row, XTy[i]]);
        
        // Forward elimination
        for (let i = 0; i < n; i++) {
            // Partial pivoting
            let maxRow = i;
            for (let k = i + 1; k < n; k++) {
                if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
                    maxRow = k;
                }
            }
            [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
            
            // Eliminate column
            for (let k = i + 1; k < n; k++) {
                const factor = augmented[k][i] / augmented[i][i];
                for (let j = i; j <= n; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }
        
        // Back substitution
        const solution = new Array(n);
        for (let i = n - 1; i >= 0; i--) {
            solution[i] = augmented[i][n];
            for (let j = i + 1; j < n; j++) {
                solution[i] -= augmented[i][j] * solution[j];
            }
            solution[i] /= augmented[i][i];
        }
        
        return solution;
    },
    
    transpose(matrix) {
        return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
    },
    
    matrixMultiply(A, B) {
        const result = [];
        for (let i = 0; i < A.length; i++) {
            result[i] = [];
            for (let j = 0; j < B[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < A[0].length; k++) {
                    sum += A[i][k] * B[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    },
    
    matrixVectorMultiply2(matrix, vector) {
        return matrix.map(row => 
            row.reduce((sum, val, i) => sum + val * vector[i], 0)
        );
    },
    
    calculateR2(actual, predicted) {
        const meanActual = actual.reduce((a, b) => a + b, 0) / actual.length;
        
        let ssRes = 0;
        let ssTot = 0;
        
        for (let i = 0; i < actual.length; i++) {
            ssRes += Math.pow(actual[i] - predicted[i], 2);
            ssTot += Math.pow(actual[i] - meanActual, 2);
        }
        
        return 1 - (ssRes / ssTot);
    },
    
    calculateRMSE(actual, predicted) {
        let sum = 0;
        for (let i = 0; i < actual.length; i++) {
            sum += Math.pow(actual[i] - predicted[i], 2);
        }
        return Math.sqrt(sum / actual.length);
    },
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // ============================================
    // DISPLAY FUNCTIONS
    // ============================================
    
    displayStockHeader() {
        const quote = this.stockData.quote;
        
        document.getElementById('stockSymbol').textContent = quote.symbol || this.currentSymbol;
        document.getElementById('stockName').textContent = quote.name || this.currentSymbol;
        
        const price = quote.price || 0;
        const change = quote.change || 0;
        const changePercent = quote.changePercent || 0;
        
        document.getElementById('currentPrice').textContent = this.formatCurrency(price);
        
        const changeEl = document.getElementById('priceChange');
        const changeText = `${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
        changeEl.textContent = changeText;
        changeEl.className = change >= 0 ? 'change positive' : 'change negative';
        
        document.getElementById('stockHeader').classList.remove('hidden');
    },
    
    updateModelCard(modelName, modelResult) {
        // Update badge
        const badge = document.getElementById(`badge-${modelName}`);
        if (badge) {
            badge.className = 'model-badge completed';
            badge.textContent = 'Completed ✓';
        }
        
        // Update metrics
        const metricsContainer = document.getElementById(`metrics-${modelName}`);
        if (metricsContainer) {
            const metrics = metricsContainer.querySelectorAll('.metric strong');
            metrics[0].textContent = this.formatCurrency(modelResult.finalPrediction);
            metrics[1].textContent = (modelResult.r2 * 100).toFixed(1) + '%';
            metrics[2].textContent = modelResult.rmse.toFixed(2);
        }
        
        // Create mini chart
        this.createModelChart(modelName, modelResult);
    },
    
    createModelChart(modelName, modelResult) {
        const prices = this.stockData.prices;
        const historical = prices.map((p, i) => [p.timestamp, p.close]);
        
        // Create prediction points
        const lastTimestamp = prices[prices.length - 1].timestamp;
        const dayMs = 24 * 60 * 60 * 1000;
        
        const predictions = modelResult.predictions.map((pred, i) => [
            lastTimestamp + (i + 1) * dayMs,
            pred
        ]);
        
        Highcharts.chart(`chart-${modelName}`, {
            chart: {
                height: 250,
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                type: 'datetime',
                labels: { enabled: false },
                lineWidth: 0,
                tickWidth: 0
            },
            yAxis: {
                title: { text: null },
                gridLineWidth: 1,
                gridLineColor: '#f0f0f0'
            },
            legend: { enabled: false },
            tooltip: {
                shared: true,
                crosshairs: true,
                borderRadius: 10
            },
            plotOptions: {
                series: {
                    marker: { enabled: false }
                }
            },
            series: [{
                name: 'Historical',
                data: historical,
                color: '#6c757d',
                lineWidth: 2,
                zIndex: 1
            }, {
                name: 'Prediction',
                data: predictions,
                color: this.colors.primary,
                lineWidth: 3,
                dashStyle: 'Dash',
                zIndex: 2
            }],
            credits: { enabled: false }
        });
    },
    
    displayResults() {
        this.createComparisonChart();
        this.createPerformanceCharts();
        this.createPerformanceTable();
        this.displayEnsemblePrediction();
        this.displayRecommendation();
        
        document.getElementById('resultsPanel').classList.remove('hidden');
    },
    
    createComparisonChart() {
        const prices = this.stockData.prices;
        const historical = prices.map(p => [p.timestamp, p.close]);
        
        const lastTimestamp = prices[prices.length - 1].timestamp;
        const dayMs = 24 * 60 * 60 * 1000;
        
        const series = [{
            name: 'Historical Price',
            data: historical,
            color: '#6c757d',
            lineWidth: 3,
            zIndex: 10
        }];
        
        const modelColors = {
            linear: this.colors.primary,
            polynomial: this.colors.secondary,
            exponential: this.colors.tertiary,
            knn: this.colors.purple,
            neural: '#9D5CE6',
            arima: this.colors.lightBlue
        };
        
        Object.entries(this.models).forEach(([name, model]) => {
            if (model && model.predictions) {
                const predictions = model.predictions.map((pred, i) => [
                    lastTimestamp + (i + 1) * dayMs,
                    pred
                ]);
                
                series.push({
                    name: model.name,
                    data: predictions,
                    color: modelColors[name],
                    lineWidth: 2,
                    dashStyle: 'Dash'
                });
            }
        });
        
        Highcharts.stockChart('comparisonChart', {
            chart: {
                height: 600,
                borderRadius: 15
            },
            title: {
                text: `${this.currentSymbol} - ML Model Predictions Comparison`,
                style: { color: this.colors.primary, fontWeight: 'bold' }
            },
            rangeSelector: { enabled: false },
            navigator: { enabled: false },
            xAxis: {
                type: 'datetime',
                plotLines: [{
                    value: lastTimestamp,
                    color: '#dc3545',
                    dashStyle: 'Dash',
                    width: 2,
                    label: {
                        text: 'Prediction Start',
                        style: { color: '#dc3545', fontWeight: 'bold' }
                    }
                }]
            },
            yAxis: {
                title: { text: 'Price' }
            },
            tooltip: {
                shared: true,
                crosshairs: true,
                borderRadius: 10
            },
            legend: {
                enabled: true,
                align: 'center',
                verticalAlign: 'bottom'
            },
            series: series,
            credits: { enabled: false }
        });
    },
    
    createPerformanceCharts() {
        const models = Object.entries(this.models).filter(([_, m]) => m !== null);
        
        // Accuracy chart
        const accuracyData = models.map(([name, model]) => ({
            name: model.name,
            y: model.r2 * 100,
            color: this.getModelColor(name)
        }));
        
        Highcharts.chart('accuracyChart', {
            chart: {
                type: 'column',
                borderRadius: 15
            },
            title: {
                text: 'Model Accuracy (R² Score)',
                style: { color: this.colors.primary, fontWeight: 'bold' }
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: { text: 'R² Score (%)' },
                max: 100
            },
            legend: { enabled: false },
            tooltip: {
                pointFormat: '<b>{point.y:.1f}%</b>',
                borderRadius: 10
            },
            plotOptions: {
                column: {
                    borderRadius: '25%',
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}%'
                    }
                }
            },
            series: [{
                name: 'Accuracy',
                data: accuracyData
            }],
            credits: { enabled: false }
        });
        
        // Error chart
        const errorData = models.map(([name, model]) => ({
            name: model.name,
            y: model.rmse,
            color: this.getModelColor(name)
        }));
        
        Highcharts.chart('errorChart', {
            chart: {
                type: 'bar',
                borderRadius: 15
            },
            title: {
                text: 'Model Error (RMSE)',
                style: { color: this.colors.primary, fontWeight: 'bold' }
            },
            xAxis: {
                type: 'category'
            },
            yAxis: {
                title: { text: 'RMSE (Lower is Better)' }
            },
            legend: { enabled: false },
            tooltip: {
                pointFormat: '<b>{point.y:.2f}</b>',
                borderRadius: 10
            },
            plotOptions: {
                bar: {
                    borderRadius: '25%',
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.2f}'
                    }
                }
            },
            series: [{
                name: 'RMSE',
                data: errorData
            }],
            credits: { enabled: false }
        });
    },
    
    createPerformanceTable() {
        const models = Object.entries(this.models).filter(([_, m]) => m !== null);
        
        // Sort by R²
        models.sort((a, b) => b[1].r2 - a[1].r2);
        
        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Model</th>
                        <th>Prediction (${this.predictionHorizon}d)</th>
                        <th>R² Score</th>
                        <th>RMSE</th>
                        <th>Change vs Current</th>
                    </tr>
                </thead>
                <tbody>
                    ${models.map(([name, model], index) => {
                        const currentPrice = this.stockData.quote.price;
                        const change = ((model.finalPrediction - currentPrice) / currentPrice) * 100;
                        const rowClass = index === 0 ? 'best' : index === models.length - 1 ? 'worst' : '';
                        
                        return `
                            <tr class='${rowClass}'>
                                <td class='rank'>#${index + 1}</td>
                                <td><strong>${model.name}</strong></td>
                                <td>${this.formatCurrency(model.finalPrediction)}</td>
                                <td>${(model.r2 * 100).toFixed(2)}%</td>
                                <td>${model.rmse.toFixed(2)}</td>
                                <td style='color: ${change >= 0 ? this.colors.success : this.colors.danger}'>
                                    ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        document.getElementById('performanceTable').innerHTML = tableHTML;
    },
    
    displayEnsemblePrediction() {
        const models = Object.values(this.models).filter(m => m !== null);
        
        // Weighted average by R²
        let sumWeightedPrediction = 0;
        let sumWeights = 0;
        
        models.forEach(model => {
            const weight = Math.max(0, model.r2); // Negative R² = 0 weight
            sumWeightedPrediction += model.finalPrediction * weight;
            sumWeights += weight;
        });
        
        const ensemblePrediction = sumWeightedPrediction / sumWeights;
        
        // Calculate confidence range (95%)
        const predictions = models.map(m => m.finalPrediction);
        const mean = predictions.reduce((a, b) => a + b) / predictions.length;
        const variance = predictions.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / predictions.length;
        const stdDev = Math.sqrt(variance);
        
        const lower = ensemblePrediction - 1.96 * stdDev;
        const upper = ensemblePrediction + 1.96 * stdDev;
        
        // Average accuracy
        const avgAccuracy = models.reduce((sum, m) => sum + m.r2, 0) / models.length;
        
        // Update UI
        const currentPrice = this.stockData.quote.price;
        const change = ensemblePrediction - currentPrice;
        const changePercent = (change / currentPrice) * 100;
        
        document.getElementById('ensemblePrice').textContent = this.formatCurrency(ensemblePrediction);
        document.getElementById('ensembleChange').textContent = `${change >= 0 ? '+' : ''}${this.formatCurrency(change)} (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`;
        document.getElementById('ensembleChange').style.color = change >= 0 ? this.colors.success : this.colors.danger;
        
        document.getElementById('ensembleRange').textContent = `${this.formatCurrency(lower)} - ${this.formatCurrency(upper)}`;
        
        // Signal
        let signal = 'HOLD';
        let signalClass = 'neutral';
        let strength = 'Moderate';
        
        if (changePercent > 5) {
            signal = 'STRONG BUY';
            signalClass = 'bullish';
            strength = 'High Confidence';
        } else if (changePercent > 2) {
            signal = 'BUY';
            signalClass = 'bullish';
            strength = 'Good Confidence';
        } else if (changePercent < -5) {
            signal = 'STRONG SELL';
            signalClass = 'bearish';
            strength = 'High Confidence';
        } else if (changePercent < -2) {
            signal = 'SELL';
            signalClass = 'bearish';
            strength = 'Good Confidence';
        }
        
        document.getElementById('ensembleSignal').textContent = signal;
        document.getElementById('ensembleStrength').textContent = strength;
        
        const signalIcon = document.getElementById('signalIcon');
        signalIcon.className = `card-icon ${signalClass}`;
        
        document.getElementById('ensembleAccuracy').textContent = (avgAccuracy * 100).toFixed(1) + '%';
    },
    
    displayRecommendation() {
        const models = Object.values(this.models).filter(m => m !== null);
        
        // Calculate ensemble
        let sumWeightedPrediction = 0;
        let sumWeights = 0;
        
        models.forEach(model => {
            const weight = Math.max(0, model.r2);
            sumWeightedPrediction += model.finalPrediction * weight;
            sumWeights += weight;
        });
        
        const ensemblePrediction = sumWeightedPrediction / sumWeights;
        const currentPrice = this.stockData.quote.price;
        const change = ensemblePrediction - currentPrice;
        const changePercent = (change / currentPrice) * 100;
        
        // Determine recommendation
        let recommendation = 'HOLD';
        let iconClass = 'hold';
        let title = 'Hold Position';
        let subtitle = 'Market conditions suggest waiting';
        
        if (changePercent > 5) {
            recommendation = 'STRONG BUY';
            iconClass = 'strong-buy';
            title = 'Strong Buy Signal';
            subtitle = 'Multiple models predict significant upside';
        } else if (changePercent > 2) {
            recommendation = 'BUY';
            iconClass = 'buy';
            title = 'Buy Signal';
            subtitle = 'Models indicate positive momentum';
        } else if (changePercent < -5) {
            recommendation = 'STRONG SELL';
            iconClass = 'strong-sell';
            title = 'Strong Sell Signal';
            subtitle = 'Multiple models predict significant downside';
        } else if (changePercent < -2) {
            recommendation = 'SELL';
            iconClass = 'sell';
            title = 'Sell Signal';
            subtitle = 'Models indicate negative momentum';
        }
        
        // Update UI
        const icon = document.getElementById('recommendationIcon');
        icon.className = `recommendation-icon ${iconClass}`;
        
        document.getElementById('recommendationTitle').textContent = title;
        document.getElementById('recommendationSubtitle').textContent = subtitle;
        
        // Build recommendation body
        const bodyHTML = `
            <h4>Key Insights</h4>
            <ul>
                <li>
                    <i class='fas fa-chart-line'></i>
                    <strong>Ensemble Prediction:</strong> ${this.formatCurrency(ensemblePrediction)} 
                    (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}% in ${this.predictionHorizon} days)
                </li>
                <li>
                    <i class='fas fa-brain'></i>
                    <strong>Model Consensus:</strong> ${models.filter(m => m.finalPrediction > currentPrice).length}/${models.length} models predict price increase
                </li>
                <li>
                    <i class='fas fa-bullseye'></i>
                    <strong>Average Model Accuracy:</strong> ${(models.reduce((sum, m) => sum + m.r2, 0) / models.length * 100).toFixed(1)}%
                </li>
                <li>
                    <i class='fas fa-trophy'></i>
                    <strong>Best Performing Model:</strong> ${[...models].sort((a, b) => b.r2 - a.r2)[0].name}
                </li>
                <li>
                    <i class='fas fa-${changePercent > 0 ? 'arrow-up' : 'arrow-down'}'></i>
                    <strong>Expected Movement:</strong> ${Math.abs(change).toFixed(2)} USD (${Math.abs(changePercent).toFixed(2)}%)
                </li>
            </ul>
            
            <h4>Risk Assessment</h4>
            <ul>
                <li>
                    <i class='fas fa-chart-area'></i>
                    <strong>Prediction Spread:</strong> ${this.calculatePredictionSpread(models).toFixed(2)}% 
                    (${this.calculatePredictionSpread(models) < 5 ? 'Low variance - High consensus' : 'High variance - Mixed signals'})
                </li>
                <li>
                    <i class='fas fa-exclamation-triangle'></i>
                    <strong>Recommendation:</strong> ${this.getRiskRecommendation(changePercent, this.calculatePredictionSpread(models))}
                </li>
            </ul>
        `;
        
        document.getElementById('recommendationBody').innerHTML = bodyHTML;
    },
    
    calculatePredictionSpread(models) {
        const predictions = models.map(m => m.finalPrediction);
        const mean = predictions.reduce((a, b) => a + b) / predictions.length;
        const variance = predictions.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / predictions.length;
        const stdDev = Math.sqrt(variance);
        return (stdDev / mean) * 100;
    },
    
    getRiskRecommendation(changePercent, spread) {
        if (spread < 3) {
            if (Math.abs(changePercent) > 5) {
                return 'Strong consensus among models. Consider acting on this signal.';
            } else {
                return 'Low volatility expected. Safe to maintain current position.';
            }
        } else if (spread < 7) {
            return 'Moderate disagreement between models. Consider waiting for clearer signals.';
        } else {
            return 'High variance in predictions. Exercise caution and consider additional research.';
        }
    },
    
    getModelColor(modelName) {
        const colors = {
            linear: this.colors.primary,
            polynomial: this.colors.secondary,
            exponential: this.colors.tertiary,
            knn: this.colors.purple,
            neural: '#9D5CE6',
            arima: this.colors.lightBlue
        };
        return colors[modelName] || this.colors.primary;
    },
    
    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    generateDemoData(symbol) {
        console.log('📊 Generating demo data for', symbol);
        const days = 180;
        const prices = [];
        let price = 150;
        
        for (let i = 0; i < days; i++) {
            const change = (Math.random() - 0.48) * 3; // Slight upward bias
            price = price * (1 + change / 100);
            
            const timestamp = Date.now() - (days - i) * 24 * 60 * 60 * 1000;
            prices.push({
                timestamp: timestamp,
                open: price * (1 + (Math.random() - 0.5) * 0.01),
                high: price * (1 + Math.random() * 0.02),
                low: price * (1 - Math.random() * 0.02),
                close: price,
                volume: Math.floor(Math.random() * 10000000)
            });
        }
        
        return {
            symbol: symbol,
            prices: prices,
            currency: 'USD',
            quote: {
                name: symbol + ' Inc.',
                symbol: symbol,
                price: price,
                change: price - 150,
                changePercent: ((price - 150) / 150) * 100
            }
        };
    },
    
    formatCurrency(value) {
        if (!value && value !== 0) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.stockData?.currency || 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    },
    
    showLoading(show, text = 'Loading...') {
        const loader = document.getElementById('loadingIndicator');
        const loadingText = document.getElementById('loadingText');
        
        if (loader && loadingText) {
            if (show) {
                loader.classList.remove('hidden');
                loadingText.textContent = text;
            } else {
                loader.classList.add('hidden');
            }
        }
    },
    
    hideResults() {
        document.getElementById('stockHeader').classList.add('hidden');
        document.getElementById('resultsPanel').classList.add('hidden');
    },
    
    updateLastUpdate() {
        const now = new Date();
        const formatted = now.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const updateElement = document.getElementById('lastUpdate');
        if (updateElement) {
            updateElement.textContent = `Last update: ${formatted}`;
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🤖 ML Trend Prediction - Initializing...');
    TrendPrediction.init();
});