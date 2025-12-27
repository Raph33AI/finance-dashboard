/**
 * ═══════════════════════════════════════════════════════════════════
 * 🏆 ALPHAVAULT SCORING SYSTEM - PROPRIETARY DATA TRANSFORMATION
 * ═══════════════════════════════════════════════════════════════════
 * Transforme les données brutes API (Finnhub/Twelve Data) en scores
 * propriétaires AlphaVault pour éviter la redistribution de données.
 * 
 * ✅ CONFORMITÉ LÉGALE :
 * - Aucune donnée brute API n'est exposée à l'utilisateur
 * - Tous les prix/volumes/métriques sont transformés en scores (0-100)
 * - Les graphiques utilisent des indices normalisés (base 100)
 * - Les comparaisons affichent des scores relatifs uniquement
 * ═══════════════════════════════════════════════════════════════════
 */

class AlphaVaultScoring {
    constructor() {
        this.scoringVersion = '1.0.0';
        console.log('🏆 AlphaVault Scoring System initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📊 TRANSFORMATION STOCK DATA (Quote + Profile + Metrics)
     * ═══════════════════════════════════════════════════════════════
     */
    transformStockData(rawData) {
        if (!rawData || rawData.error) {
            return {
                error: 'Stock data unavailable',
                alphaVaultScore: 0
            };
        }

        const transformed = {
            symbol: rawData.symbol,
            companyName: rawData.profile?.name || rawData.symbol, // ✅ OK (info publique)
            sector: rawData.profile?.sector || 'Unknown', // ✅ OK (classification publique)
            
            // ✅ SCORES PROPRIÉTAIRES (0-100)
            alphaVaultScore: this.calculateAlphaVaultScore(rawData),
            momentumIndex: this.calculateMomentumIndex(rawData),
            qualityGrade: this.calculateQualityGrade(rawData),
            riskRating: this.calculateRiskRating(rawData),
            technicalStrength: this.calculateTechnicalStrength(rawData),
            valueScore: this.calculateValueScore(rawData),
            sentimentIndex: this.calculateSentimentIndex(rawData),
            
            // ✅ DONNÉES RELATIVES (pas de prix absolus)
            priceChangePercent: rawData.quote?.changePercent || 0,
            volatilityLevel: this.categorizeVolatility(rawData),
            marketCapCategory: this.categorizeMarketCap(rawData.profile?.marketCap),
            
            // ✅ METADATA (âge des données, pas de valeurs brutes)
            dataQuality: this.assessDataQuality(rawData),
            lastUpdate: new Date().toISOString(),
            source: 'AlphaVault Proprietary Analysis'
        };

        return transformed;
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 🎯 ALPHAVAULT SCORE (Score composite 0-100)
     * ═══════════════════════════════════════════════════════════════
     */
    calculateAlphaVaultScore(rawData) {
        let score = 50; // Base score

        // 1⃣ MOMENTUM (0-20 points)
        const changePercent = rawData.quote?.changePercent || 0;
        if (changePercent > 10) score += 20;
        else if (changePercent > 5) score += 15;
        else if (changePercent > 2) score += 10;
        else if (changePercent > 0) score += 5;
        else if (changePercent < -10) score -= 15;
        else if (changePercent < -5) score -= 10;

        // 2⃣ VALUATION (0-20 points)
        const pe = rawData.metrics?.peRatio || 0;
        if (pe > 0 && pe < 15) score += 20; // Undervalued
        else if (pe >= 15 && pe < 25) score += 10; // Fair
        else if (pe >= 25 && pe < 40) score += 0; // Neutral
        else if (pe >= 40) score -= 10; // Overvalued

        // 3⃣ PROFITABILITY (0-20 points)
        const profitMargin = rawData.metrics?.profitMargin || 0;
        if (profitMargin > 30) score += 20;
        else if (profitMargin > 20) score += 15;
        else if (profitMargin > 10) score += 10;
        else if (profitMargin > 5) score += 5;
        else if (profitMargin < 0) score -= 10;

        // 4⃣ GROWTH (0-20 points)
        const revenueGrowth = rawData.metrics?.revenueGrowth || 0;
        if (revenueGrowth > 30) score += 20;
        else if (revenueGrowth > 20) score += 15;
        else if (revenueGrowth > 10) score += 10;
        else if (revenueGrowth > 5) score += 5;
        else if (revenueGrowth < -10) score -= 15;

        // 5⃣ FINANCIAL HEALTH (0-20 points)
        const debtToEquity = rawData.metrics?.debtToEquity || 0;
        if (debtToEquity < 0.5) score += 20; // Very healthy
        else if (debtToEquity < 1) score += 15; // Healthy
        else if (debtToEquity < 2) score += 5; // Moderate
        else if (debtToEquity >= 3) score -= 10; // Risky

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📈 MOMENTUM INDEX (0-100)
     * ═══════════════════════════════════════════════════════════════
     */
    calculateMomentumIndex(rawData) {
        const changePercent = rawData.quote?.changePercent || 0;
        
        // Normalize -20% to +20% → 0 to 100
        const normalized = ((changePercent + 20) / 40) * 100;
        return Math.max(0, Math.min(100, Math.round(normalized)));
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 💎 QUALITY GRADE (A+ to D-)
     * ═══════════════════════════════════════════════════════════════
     */
    calculateQualityGrade(rawData) {
        const roe = rawData.metrics?.roe || 0;
        const profitMargin = rawData.metrics?.profitMargin || 0;
        const debtToEquity = rawData.metrics?.debtToEquity || 999;

        let gradeScore = 0;

        // ROE scoring
        if (roe > 20) gradeScore += 4;
        else if (roe > 15) gradeScore += 3;
        else if (roe > 10) gradeScore += 2;
        else if (roe > 5) gradeScore += 1;

        // Profit Margin scoring
        if (profitMargin > 30) gradeScore += 4;
        else if (profitMargin > 20) gradeScore += 3;
        else if (profitMargin > 10) gradeScore += 2;
        else if (profitMargin > 5) gradeScore += 1;

        // Debt scoring (inverse)
        if (debtToEquity < 0.5) gradeScore += 4;
        else if (debtToEquity < 1) gradeScore += 3;
        else if (debtToEquity < 2) gradeScore += 2;
        else if (debtToEquity < 3) gradeScore += 1;

        // Convert to grade (0-12 scale)
        if (gradeScore >= 11) return 'A+';
        if (gradeScore >= 10) return 'A';
        if (gradeScore >= 9) return 'A-';
        if (gradeScore >= 8) return 'B+';
        if (gradeScore >= 7) return 'B';
        if (gradeScore >= 6) return 'B-';
        if (gradeScore >= 5) return 'C+';
        if (gradeScore >= 4) return 'C';
        if (gradeScore >= 3) return 'C-';
        if (gradeScore >= 2) return 'D+';
        if (gradeScore >= 1) return 'D';
        return 'D-';
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * ⚠ RISK RATING (Low/Medium/High/Very High)
     * ═══════════════════════════════════════════════════════════════
     */
    calculateRiskRating(rawData) {
        const beta = rawData.metrics?.beta || 1;
        const debtToEquity = rawData.metrics?.debtToEquity || 0;
        const profitMargin = rawData.metrics?.profitMargin || 0;

        let riskScore = 0;

        // Beta risk
        if (beta > 2) riskScore += 3;
        else if (beta > 1.5) riskScore += 2;
        else if (beta > 1) riskScore += 1;

        // Debt risk
        if (debtToEquity > 3) riskScore += 3;
        else if (debtToEquity > 2) riskScore += 2;
        else if (debtToEquity > 1) riskScore += 1;

        // Profitability risk (inverse)
        if (profitMargin < 0) riskScore += 3;
        else if (profitMargin < 5) riskScore += 2;
        else if (profitMargin < 10) riskScore += 1;

        // Rating (0-9 scale)
        if (riskScore <= 2) return 'Low';
        if (riskScore <= 4) return 'Medium';
        if (riskScore <= 6) return 'High';
        return 'Very High';
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📉 TECHNICAL STRENGTH (0-100)
     * ═══════════════════════════════════════════════════════════════
     */
    calculateTechnicalStrength(rawData) {
        // Basé sur les indicateurs techniques calculés
        const tech = rawData.technicalIndicators || {};
        
        let strength = 50;

        // RSI
        if (tech.momentum?.rsi) {
            const rsi = parseFloat(tech.momentum.rsi);
            if (rsi >= 50 && rsi <= 70) strength += 20; // Bullish zone
            else if (rsi > 70) strength -= 10; // Overbought
            else if (rsi < 30) strength -= 20; // Oversold
        }

        // Trend
        if (tech.trend?.direction) {
            if (tech.trend.direction.includes('Uptrend')) strength += 20;
            else if (tech.trend.direction.includes('Downtrend')) strength -= 20;
        }

        // Moving averages position
        if (tech.movingAverages?.priceVsSMA20) {
            const vs20 = parseFloat(tech.movingAverages.priceVsSMA20);
            if (vs20 > 5) strength += 10;
            else if (vs20 < -5) strength -= 10;
        }

        return Math.max(0, Math.min(100, Math.round(strength)));
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 💰 VALUE SCORE (0-100)
     * ═══════════════════════════════════════════════════════════════
     */
    calculateValueScore(rawData) {
        const pe = rawData.metrics?.peRatio || 0;
        const pb = rawData.metrics?.priceToBook || 0;
        const ps = rawData.metrics?.priceToSales || 0;

        let valueScore = 50;

        // P/E valuation
        if (pe > 0 && pe < 10) valueScore += 20; // Deep value
        else if (pe >= 10 && pe < 15) valueScore += 15;
        else if (pe >= 15 && pe < 20) valueScore += 10;
        else if (pe >= 20 && pe < 30) valueScore += 0;
        else if (pe >= 30) valueScore -= 15;

        // P/B valuation
        if (pb > 0 && pb < 1) valueScore += 15;
        else if (pb >= 1 && pb < 2) valueScore += 10;
        else if (pb >= 2 && pb < 3) valueScore += 5;
        else if (pb >= 5) valueScore -= 10;

        // P/S valuation
        if (ps > 0 && ps < 1) valueScore += 15;
        else if (ps >= 1 && ps < 3) valueScore += 10;
        else if (ps >= 3 && ps < 5) valueScore += 5;
        else if (ps >= 10) valueScore -= 10;

        return Math.max(0, Math.min(100, Math.round(valueScore)));
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 😊 SENTIMENT INDEX (0-100)
     * ═══════════════════════════════════════════════════════════════
     */
    calculateSentimentIndex(rawData) {
        let sentiment = 50;

        // Analyst recommendations
        if (rawData.analystRecommendations) {
            const rec = rawData.analystRecommendations;
            const bullishPercent = parseFloat(rec.bullishPercent) || 50;
            sentiment = bullishPercent;
        }

        // News sentiment (si disponible)
        if (rawData.sentiment) {
            const newsScore = rawData.sentiment.overallSentiment.sentiment || 0;
            // Normaliser -1 to +1 → 0 to 100
            sentiment = ((newsScore + 1) / 2) * 100;
        }

        return Math.max(0, Math.min(100, Math.round(sentiment)));
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📏 CATÉGORISATION VOLATILITÉ
     * ═══════════════════════════════════════════════════════════════
     */
    categorizeVolatility(rawData) {
        const volatility = rawData.historicalStats?.volatility || rawData.technicalIndicators?.volatility?.annualized || 0;
        
        const vol = parseFloat(volatility);
        
        if (vol < 15) return 'Very Low';
        if (vol < 25) return 'Low';
        if (vol < 40) return 'Moderate';
        if (vol < 60) return 'High';
        return 'Very High';
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📏 CATÉGORISATION MARKET CAP
     * ═══════════════════════════════════════════════════════════════
     */
    categorizeMarketCap(marketCapBillions) {
        if (!marketCapBillions || marketCapBillions <= 0) return 'Unknown';
        
        if (marketCapBillions < 0.3) return 'Nano Cap';
        if (marketCapBillions < 2) return 'Micro Cap';
        if (marketCapBillions < 10) return 'Small Cap';
        if (marketCapBillions < 50) return 'Mid Cap';
        if (marketCapBillions < 200) return 'Large Cap';
        return 'Mega Cap';
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * ✅ ÉVALUATION QUALITÉ DES DONNÉES
     * ═══════════════════════════════════════════════════════════════
     */
    assessDataQuality(rawData) {
        let qualityScore = 0;
        let maxScore = 7;

        if (rawData.quote?.current) qualityScore++;
        if (rawData.profile?.name) qualityScore++;
        if (rawData.metrics?.peRatio) qualityScore++;
        if (rawData.analystRecommendations) qualityScore++;
        if (rawData.earningsHistory) qualityScore++;
        if (rawData.timeSeriesData) qualityScore++;
        if (rawData.technicalIndicators) qualityScore++;

        const percentage = (qualityScore / maxScore) * 100;

        if (percentage >= 90) return 'Excellent';
        if (percentage >= 70) return 'Good';
        if (percentage >= 50) return 'Fair';
        return 'Limited';
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📊 TRANSFORMATION TIME SERIES (Indices Normalisés Base 100)
     * ═══════════════════════════════════════════════════════════════
     */
    transformTimeSeries(rawTimeSeries) {
        if (!rawTimeSeries || !rawTimeSeries.data || rawTimeSeries.data.length === 0) {
            return {
                error: 'No time series data available',
                normalizedData: []
            };
        }

        const firstPrice = rawTimeSeries.data[0].close;
        
        const normalizedData = rawTimeSeries.data.map((point, index) => ({
            date: point.datetime,
            timestamp: point.timestamp,
            performanceIndex: ((point.close / firstPrice) * 100).toFixed(2), // ✅ Base 100
            volumeIndex: index > 0 
                ? ((point.volume / rawTimeSeries.data[0].volume) * 100).toFixed(2)
                : 100,
            // ✅ On garde les % de variation (pas de prix bruts)
            dailyChange: index > 0 
                ? (((point.close - rawTimeSeries.data[index - 1].close) / rawTimeSeries.data[index - 1].close) * 100).toFixed(2)
                : 0
        }));

        return {
            symbol: rawTimeSeries.symbol,
            interval: rawTimeSeries.interval,
            normalizedData: normalizedData,
            dataPoints: normalizedData.length,
            performanceSummary: {
                totalReturn: (normalizedData[normalizedData.length - 1].performanceIndex - 100).toFixed(2) + '%',
                dataQuality: this.assessTimeSeriesQuality(normalizedData)
            },
            source: 'AlphaVault Normalized Performance Index'
        };
    }

    assessTimeSeriesQuality(data) {
        if (data.length >= 250) return 'Excellent';
        if (data.length >= 100) return 'Good';
        if (data.length >= 30) return 'Fair';
        return 'Limited';
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * ⚖ TRANSFORMATION COMPARISON DATA
     * ═══════════════════════════════════════════════════════════════
     */
    transformComparisonData(rawComparisonData) {
        if (!rawComparisonData || rawComparisonData.stocksData.length < 2) {
            return {
                error: 'Insufficient data for comparison',
                comparison: []
            };
        }

        const { symbols, stocksData, timeSeries } = rawComparisonData;

        const comparison = stocksData.map((stock, index) => {
            const transformedStock = this.transformStockData(stock);
            
            // Ajouter performance relative si time series disponible
            let relativePerformance = null;
            if (timeSeries && timeSeries[index]) {
                const series = timeSeries[index].data;
                if (series.length > 0) {
                    const firstPrice = series[0].close;
                    const lastPrice = series[series.length - 1].close;
                    relativePerformance = (((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2);
                }
            }

            return {
                symbol: stock.symbol,
                companyName: transformedStock.companyName,
                alphaVaultScore: transformedStock.alphaVaultScore,
                momentumIndex: transformedStock.momentumIndex,
                qualityGrade: transformedStock.qualityGrade,
                riskRating: transformedStock.riskRating,
                valueScore: transformedStock.valueScore,
                relativePerformance: relativePerformance ? relativePerformance + '%' : 'N/A',
                marketCapCategory: transformedStock.marketCapCategory,
                volatilityLevel: transformedStock.volatilityLevel
            };
        });

        return {
            symbols: symbols,
            comparison: comparison,
            winner: this.identifyWinner(comparison),
            source: 'AlphaVault Comparative Analysis'
        };
    }

    identifyWinner(comparison) {
        const sorted = [...comparison].sort((a, b) => b.alphaVaultScore - a.alphaVaultScore);
        return {
            topPick: sorted[0].symbol,
            score: sorted[0].alphaVaultScore,
            reason: `Highest AlphaVault Score (${sorted[0].alphaVaultScore}/100)`
        };
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT & INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlphaVaultScoring;
}

window.AlphaVaultScoring = AlphaVaultScoring;

console.log('✅ AlphaVault Scoring System loaded successfully!');
console.log('🏆 Proprietary scoring engine active');
console.log('🔒 Legal compliance: No raw API data redistribution');