/**
 * ═══════════════════════════════════════════════════════════════════
 * 🏆 ALPHAVAULT SCORING SYSTEM v2.0 ULTRA PRO
 * ═══════════════════════════════════════════════════════════════════
 * Algorithme propriétaire de scoring financier
 * Transforme données API brutes en scores normalisés (0-100)
 * 
 * ✅ CONFORMITÉ LÉGALE : Aucune redistribution de données brutes
 * ═══════════════════════════════════════════════════════════════════
 */

class AlphaVaultScoring {
    constructor() {
        this.version = '2.0.0';
        console.log('🏆 AlphaVault Scoring System v2.0 ULTRA PRO initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 🎯 CALCULATE COMPREHENSIVE SCORE (Main Entry Point)
     * ═══════════════════════════════════════════════════════════════
     */
    calculateComprehensiveScore(data) {
        const { symbol, quote, profile } = data;

        if (!quote || quote.error) {
            return {
                error: 'Insufficient data for scoring',
                symbol: symbol
            };
        }

        console.log(`🏆 Calculating AlphaVault Score for ${symbol}...`);

        // Calculate individual scores
        const technicalScore = this.calculateTechnicalScore(quote);
        const momentumScore = this.calculateMomentumScore(quote);
        const qualityGrade = this.calculateQualityGrade(quote, profile);
        const riskRating = this.calculateRiskRating(quote, profile);
        const valueScore = this.calculateValueScore(quote, profile);
        const sentimentScore = 50; // Placeholder (needs news data)

        // Overall score (weighted average)
        const overallScore = Math.round(
            technicalScore * 0.25 +
            momentumScore * 0.20 +
            valueScore * 0.25 +
            sentimentScore * 0.15 +
            this.qualityGradeToScore(qualityGrade) * 0.15
        );

        // Rating
        const rating = this.getScoreRating(overallScore);

        // Trend analysis
        const trend = this.analyzeTrend(quote);

        // Volatility
        const volatility = this.categorizeVolatility(quote);

        // Market cap category
        const marketCapCategory = this.categorizeMarketCap(profile?.marketCapitalization);

        // Generate insights
        const insights = this.generateInsights(
            overallScore, 
            technicalScore, 
            momentumScore, 
            qualityGrade, 
            riskRating,
            trend
        );

        const result = {
            symbol: symbol,
            companyName: profile?.name || symbol,
            sector: profile?.finnhubIndustry || profile?.sector || 'Unknown',
            
            // Scores
            overall: overallScore,
            technical: technicalScore,
            momentum: momentumScore,
            quality: qualityGrade,
            value: valueScore,
            sentiment: sentimentScore,
            
            // Ratings
            rating: rating,
            risk: riskRating,
            
            // Metrics
            changePercent: (quote.percentChange || quote.change || 0).toFixed(2),
            trend: trend,
            volatility: volatility,
            marketCapCategory: marketCapCategory,
            
            // Insights
            insights: insights,
            
            // Metadata
            timestamp: new Date().toISOString(),
            dataQuality: this.assessDataQuality(quote, profile),
            source: 'AlphaVault Proprietary Analysis v2.0'
        };

        console.log(`✅ AlphaVault Score: ${result.overall}/100 (${result.rating})`);

        return result;
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📈 TECHNICAL SCORE (0-100)
     * ═══════════════════════════════════════════════════════════════
     */
    calculateTechnicalScore(quote) {
        let score = 50;

        // Price position in 52-week range
        const current = quote.price || quote.close || 0;
        const high = quote.high || current;
        const low = quote.low || current;

        if (high > low) {
            const position = (current - low) / (high - low);
            if (position > 0.8) score += 20;
            else if (position > 0.6) score += 15;
            else if (position > 0.4) score += 10;
            else if (position < 0.2) score -= 15;
        }

        // Volume analysis
        const volume = quote.volume || 0;
        if (volume > 10000000) score += 15;
        else if (volume > 5000000) score += 10;
        else if (volume > 1000000) score += 5;

        // Change momentum
        const change = quote.percentChange || quote.change || 0;
        if (change > 5) score += 15;
        else if (change > 2) score += 10;
        else if (change > 0) score += 5;
        else if (change < -5) score -= 15;
        else if (change < -2) score -= 10;

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 🚀 MOMENTUM SCORE (0-100)
     * ═══════════════════════════════════════════════════════════════
     */
    calculateMomentumScore(quote) {
        const changePercent = quote.percentChange || quote.change || 0;
        
        // Normalize -20% to +20% → 0 to 100
        const normalized = ((parseFloat(changePercent) + 20) / 40) * 100;
        return Math.max(0, Math.min(100, Math.round(normalized)));
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 💎 QUALITY GRADE (A+ to D-)
     * ═══════════════════════════════════════════════════════════════
     */
    calculateQualityGrade(quote, profile) {
        let gradeScore = 0;

        // Market cap (larger = higher quality typically)
        const marketCap = profile?.marketCapitalization || 0;
        if (marketCap > 1000000) gradeScore += 4; // > $1T
        else if (marketCap > 100000) gradeScore += 3; // > $100B
        else if (marketCap > 10000) gradeScore += 2; // > $10B
        else if (marketCap > 1000) gradeScore += 1; // > $1B

        // Volume (liquidity indicator)
        const volume = quote.volume || 0;
        if (volume > 50000000) gradeScore += 4;
        else if (volume > 20000000) gradeScore += 3;
        else if (volume > 5000000) gradeScore += 2;
        else if (volume > 1000000) gradeScore += 1;

        // Consistency (low volatility = quality)
        const change = Math.abs(quote.percentChange || quote.change || 0);
        if (change < 1) gradeScore += 4;
        else if (change < 2) gradeScore += 3;
        else if (change < 5) gradeScore += 2;

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

    qualityGradeToScore(grade) {
        const gradeMap = {
            'A+': 100, 'A': 95, 'A-': 90,
            'B+': 85, 'B': 80, 'B-': 75,
            'C+': 70, 'C': 65, 'C-': 60,
            'D+': 55, 'D': 50, 'D-': 45
        };
        return gradeMap[grade] || 50;
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * ⚠ RISK RATING (Low/Medium/High/Very High)
     * ═══════════════════════════════════════════════════════════════
     */
    calculateRiskRating(quote, profile) {
        let riskScore = 0;

        // Volatility risk
        const changeAbs = Math.abs(quote.percentChange || quote.change || 0);
        if (changeAbs > 10) riskScore += 3;
        else if (changeAbs > 5) riskScore += 2;
        else if (changeAbs > 2) riskScore += 1;

        // Market cap risk (smaller = riskier)
        const marketCap = profile?.marketCapitalization || 0;
        if (marketCap < 1000) riskScore += 3; // < $1B
        else if (marketCap < 10000) riskScore += 2; // < $10B
        else if (marketCap < 100000) riskScore += 1; // < $100B

        // Volume risk (low volume = risky)
        const volume = quote.volume || 0;
        if (volume < 500000) riskScore += 3;
        else if (volume < 2000000) riskScore += 2;
        else if (volume < 5000000) riskScore += 1;

        // Rating (0-9 scale)
        if (riskScore <= 2) return 'Low';
        if (riskScore <= 4) return 'Medium';
        if (riskScore <= 6) return 'High';
        return 'Very High';
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 💰 VALUE SCORE (0-100)
     * ═══════════════════════════════════════════════════════════════
     */
    calculateValueScore(quote, profile) {
        let valueScore = 50;

        // Market cap valuation (relative)
        const marketCap = profile?.marketCapitalization || 0;
        const volume = quote.volume || 0;

        // Volume-to-MarketCap ratio (liquidity indicator)
        if (marketCap > 0) {
            const liquidityRatio = (volume * quote.price) / (marketCap * 1000000);
            if (liquidityRatio > 0.01) valueScore += 20;
            else if (liquidityRatio > 0.005) valueScore += 15;
            else if (liquidityRatio > 0.001) valueScore += 10;
        }

        // Price momentum (contrarian indicator)
        const change = quote.percentChange || quote.change || 0;
        if (change < -10) valueScore += 20; // Deep value
        else if (change < -5) valueScore += 15;
        else if (change < -2) valueScore += 10;
        else if (change > 20) valueScore -= 15; // Potentially overvalued

        return Math.max(0, Math.min(100, Math.round(valueScore)));
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📊 TREND ANALYSIS
     * ═══════════════════════════════════════════════════════════════
     */
    analyzeTrend(quote) {
        const change = quote.percentChange || quote.change || 0;

        if (change > 5) return 'Strong Uptrend 🚀';
        if (change > 2) return 'Uptrend 📈';
        if (change > 0) return 'Slight Uptrend ↗';
        if (change > -2) return 'Slight Downtrend ↘';
        if (change > -5) return 'Downtrend 📉';
        return 'Strong Downtrend 🔻';
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 🌊 VOLATILITY CATEGORIZATION
     * ═══════════════════════════════════════════════════════════════
     */
    categorizeVolatility(quote) {
        const changeAbs = Math.abs(quote.percentChange || quote.change || 0);

        if (changeAbs < 1) return 'Very Low';
        if (changeAbs < 2) return 'Low';
        if (changeAbs < 5) return 'Moderate';
        if (changeAbs < 10) return 'High';
        return 'Very High';
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📏 MARKET CAP CATEGORIZATION
     * ═══════════════════════════════════════════════════════════════
     */
    categorizeMarketCap(marketCapMillions) {
        if (!marketCapMillions || marketCapMillions <= 0) return 'Unknown';

        const billions = marketCapMillions / 1000;

        if (billions < 0.3) return 'Nano Cap';
        if (billions < 2) return 'Micro Cap';
        if (billions < 10) return 'Small Cap';
        if (billions < 50) return 'Mid Cap';
        if (billions < 200) return 'Large Cap';
        return 'Mega Cap';
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * ⭐ SCORE RATING
     * ═══════════════════════════════════════════════════════════════
     */
    getScoreRating(score) {
        if (score >= 85) return 'Strong Buy';
        if (score >= 70) return 'Buy';
        if (score >= 50) return 'Hold';
        if (score >= 35) return 'Sell';
        return 'Strong Sell';
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 💡 GENERATE INSIGHTS
     * ═══════════════════════════════════════════════════════════════
     */
    generateInsights(overall, technical, momentum, quality, risk, trend) {
        const insights = [];

        // Overall assessment
        if (overall >= 85) {
            insights.push('Exceptional investment opportunity with strong fundamentals');
        } else if (overall >= 70) {
            insights.push('Solid investment candidate with positive outlook');
        } else if (overall >= 50) {
            insights.push('Neutral outlook - monitor for entry opportunities');
        } else {
            insights.push('Caution advised - significant risks present');
        }

        // Technical
        if (technical >= 75) {
            insights.push('Strong technical momentum with bullish indicators');
        } else if (technical < 40) {
            insights.push('Weak technical position - bearish pressure detected');
        }

        // Momentum
        if (momentum >= 70) {
            insights.push('Positive price momentum indicates buying pressure');
        } else if (momentum < 40) {
            insights.push('Negative momentum suggests selling pressure');
        }

        // Quality
        if (quality.startsWith('A')) {
            insights.push('Premium quality stock with excellent fundamentals');
        } else if (quality.startsWith('D')) {
            insights.push('Quality concerns - enhanced due diligence recommended');
        }

        // Risk
        if (risk === 'Low') {
            insights.push('Low risk profile suitable for conservative investors');
        } else if (risk === 'Very High') {
            insights.push('Very high risk - suitable for aggressive investors only');
        }

        // Trend
        if (trend.includes('Strong Uptrend')) {
            insights.push('Sustained upward trajectory with strong momentum');
        } else if (trend.includes('Strong Downtrend')) {
            insights.push('Significant downward pressure - caution advised');
        }

        return insights;
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * ✅ DATA QUALITY ASSESSMENT
     * ═══════════════════════════════════════════════════════════════
     */
    assessDataQuality(quote, profile) {
        let qualityScore = 0;
        let maxScore = 5;

        if (quote && quote.price) qualityScore++;
        if (quote && quote.volume) qualityScore++;
        if (quote && (quote.high || quote.low)) qualityScore++;
        if (profile && profile.name) qualityScore++;
        if (profile && profile.marketCapitalization) qualityScore++;

        const percentage = (qualityScore / maxScore) * 100;

        if (percentage >= 90) return 'Excellent';
        if (percentage >= 70) return 'Good';
        if (percentage >= 50) return 'Fair';
        return 'Limited';
    }

    /**
     * ═══════════════════════════════════════════════════════════════
     * 📊 TRANSFORM TECHNICAL INDICATORS TO ALPHAVAULT SCORES
     * ═══════════════════════════════════════════════════════════════
     */
    transformTechnicalIndicators(indicators, prices) {
        console.log('🏆 Transforming technical indicators to AlphaVault Scores...');

        const scores = {
            overall: 50,
            momentum: {},
            trend: {},
            volume: {},
            volatility: {},
            overbought: 0,
            oversold: 0
        };

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📈 RSI SCORE
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (indicators.rsi && indicators.rsi.length > 0) {
            const lastRSI = indicators.rsi[indicators.rsi.length - 1][1];
            
            let rsiScore = 50;
            
            if (lastRSI < 20) {
                rsiScore = 85; // Extreme oversold = buy opportunity
                scores.oversold += 25;
            } else if (lastRSI < 30) {
                rsiScore = 75;
                scores.oversold += 15;
            } else if (lastRSI < 40) {
                rsiScore = 60;
            } else if (lastRSI > 80) {
                rsiScore = 15; // Extreme overbought = sell signal
                scores.overbought += 25;
            } else if (lastRSI > 70) {
                rsiScore = 25;
                scores.overbought += 15;
            } else if (lastRSI > 60) {
                rsiScore = 40;
            }
            
            scores.momentum.rsi = {
                score: rsiScore,
                value: lastRSI.toFixed(1),
                signal: lastRSI < 30 ? 'Oversold - Buy Signal' :
                        lastRSI > 70 ? 'Overbought - Sell Signal' :
                        'Neutral Zone'
            };
            
            scores.overall += (rsiScore - 50) * 0.15;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📊 MACD SCORE
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (indicators.macd && indicators.macd.histogram && indicators.macd.histogram.length > 0) {
            const lastHist = indicators.macd.histogram[indicators.macd.histogram.length - 1][1];
            const prevHist = indicators.macd.histogram[indicators.macd.histogram.length - 2]?.[1] || 0;
            
            let macdScore = 50;
            
            if (lastHist > 0 && prevHist <= 0) {
                macdScore = 90; // Bullish crossover
            } else if (lastHist < 0 && prevHist >= 0) {
                macdScore = 10; // Bearish crossover
            } else if (lastHist > 0) {
                macdScore = 70;
            } else if (lastHist < 0) {
                macdScore = 30;
            }
            
            scores.trend.macd = {
                score: macdScore,
                value: lastHist.toFixed(4),
                signal: lastHist > 0 && prevHist <= 0 ? 'Bullish Crossover - Strong Buy' :
                        lastHist < 0 && prevHist >= 0 ? 'Bearish Crossover - Strong Sell' :
                        lastHist > 0 ? 'Positive Momentum' : 'Negative Momentum'
            };
            
            scores.overall += (macdScore - 50) * 0.18;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📉 STOCHASTIC SCORE
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (indicators.stochastic && indicators.stochastic.k && indicators.stochastic.k.length > 0) {
            const lastK = indicators.stochastic.k[indicators.stochastic.k.length - 1][1];
            
            let stochScore = 50;
            
            if (lastK < 15) {
                stochScore = 85;
                scores.oversold += 20;
            } else if (lastK < 20) {
                stochScore = 75;
                scores.oversold += 10;
            } else if (lastK > 85) {
                stochScore = 15;
                scores.overbought += 20;
            } else if (lastK > 80) {
                stochScore = 25;
                scores.overbought += 10;
            }
            
            scores.momentum.stochastic = {
                score: stochScore,
                value: lastK.toFixed(1),
                signal: lastK < 20 ? 'Oversold Zone' :
                        lastK > 80 ? 'Overbought Zone' :
                        'Neutral'
            };
            
            scores.overall += (stochScore - 50) * 0.12;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📊 ADX SCORE (Trend Strength)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (indicators.adx && indicators.adx.adx && indicators.adx.adx.length > 0) {
            const lastADX = indicators.adx.adx[indicators.adx.adx.length - 1][1];
            const lastPlusDI = indicators.adx.plusDI[indicators.adx.plusDI.length - 1][1];
            const lastMinusDI = indicators.adx.minusDI[indicators.adx.minusDI.length - 1][1];
            
            let adxScore = 50;
            
            if (lastADX > 50 && lastPlusDI > lastMinusDI) {
                adxScore = 90; // Very strong uptrend
            } else if (lastADX > 40 && lastPlusDI > lastMinusDI) {
                adxScore = 80;
            } else if (lastADX > 25 && lastPlusDI > lastMinusDI) {
                adxScore = 70;
            } else if (lastADX > 50 && lastMinusDI > lastPlusDI) {
                adxScore = 10; // Very strong downtrend
            } else if (lastADX > 40 && lastMinusDI > lastPlusDI) {
                adxScore = 20;
            } else if (lastADX > 25 && lastMinusDI > lastPlusDI) {
                adxScore = 30;
            } else {
                adxScore = 50; // Weak trend
            }
            
            scores.trend.adx = {
                score: adxScore,
                value: lastADX.toFixed(1),
                signal: lastADX > 40 ? (lastPlusDI > lastMinusDI ? 'Very Strong Uptrend' : 'Very Strong Downtrend') :
                        lastADX > 25 ? (lastPlusDI > lastMinusDI ? 'Strong Uptrend' : 'Strong Downtrend') :
                        'Weak/No Trend'
            };
            
            scores.overall += (adxScore - 50) * 0.16;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📊 OBV SCORE (Volume Trend)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (indicators.obv && indicators.obv.length >= 30) {
            const recentOBV = indicators.obv.slice(-30);
            const obvChange = recentOBV[recentOBV.length - 1][1] - recentOBV[0][1];
            const obvPctChange = (obvChange / Math.abs(recentOBV[0][1])) * 100;
            
            let obvScore = 50;
            
            if (obvPctChange > 20) obvScore = 85;
            else if (obvPctChange > 10) obvScore = 75;
            else if (obvPctChange > 5) obvScore = 65;
            else if (obvPctChange > 0) obvScore = 55;
            else if (obvPctChange < -20) obvScore = 15;
            else if (obvPctChange < -10) obvScore = 25;
            else if (obvPctChange < -5) obvScore = 35;
            else if (obvPctChange < 0) obvScore = 45;
            
            scores.volume.obv = {
                score: obvScore,
                value: obvPctChange.toFixed(1) + '%',
                signal: obvPctChange > 10 ? 'Strong Accumulation' :
                        obvPctChange < -10 ? 'Strong Distribution' :
                        obvPctChange > 0 ? 'Accumulation' : 'Distribution'
            };
            
            scores.overall += (obvScore - 50) * 0.14;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📊 ATR SCORE (Volatility)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (indicators.atr && indicators.atr.length > 0) {
            const lastATR = indicators.atr[indicators.atr.length - 1][1];
            const avgATR = indicators.atr.slice(-30).reduce((sum, val) => sum + val[1], 0) / Math.min(30, indicators.atr.length);
            const atrRatio = lastATR / avgATR;
            
            let volatilityScore = 50;
            
            if (atrRatio > 1.5) volatilityScore = 30; // High volatility = risk
            else if (atrRatio > 1.3) volatilityScore = 40;
            else if (atrRatio < 0.7) volatilityScore = 70; // Low volatility = stability
            else if (atrRatio < 0.85) volatilityScore = 60;
            
            scores.volatility.atr = {
                score: volatilityScore,
                value: atrRatio.toFixed(2),
                signal: atrRatio > 1.4 ? 'High Volatility - Risk Elevated' :
                        atrRatio < 0.8 ? 'Low Volatility - Stable' :
                        'Normal Volatility'
            };
            
            scores.overall += (volatilityScore - 50) * 0.08;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // 📊 MFI SCORE (Money Flow)
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        if (indicators.mfi && indicators.mfi.length > 0) {
            const lastMFI = indicators.mfi[indicators.mfi.length - 1][1];
            
            let mfiScore = 50;
            
            if (lastMFI < 15) {
                mfiScore = 85;
                scores.oversold += 15;
            } else if (lastMFI < 20) {
                mfiScore = 75;
                scores.oversold += 10;
            } else if (lastMFI > 85) {
                mfiScore = 15;
                scores.overbought += 15;
            } else if (lastMFI > 80) {
                mfiScore = 25;
                scores.overbought += 10;
            } else if (lastMFI > 50) {
                mfiScore = 60;
            } else {
                mfiScore = 40;
            }
            
            scores.momentum.mfi = {
                score: mfiScore,
                value: lastMFI.toFixed(1),
                signal: lastMFI < 20 ? 'Strong Buying Pressure' :
                        lastMFI > 80 ? 'Strong Selling Pressure' :
                        lastMFI > 50 ? 'Positive Money Flow' : 'Negative Money Flow'
            };
            
            scores.overall += (mfiScore - 50) * 0.12;
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // FINALIZE OVERALL SCORE
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        scores.overall = Math.max(0, Math.min(100, Math.round(scores.overall)));

        // Determine overall signal
        if (scores.overall >= 75) {
            scores.overallSignal = 'Strong Buy';
        } else if (scores.overall >= 60) {
            scores.overallSignal = 'Buy';
        } else if (scores.overall >= 45) {
            scores.overallSignal = 'Hold';
        } else if (scores.overall >= 30) {
            scores.overallSignal = 'Sell';
        } else {
            scores.overallSignal = 'Strong Sell';
        }

        console.log(`✅ AlphaVault Technical Score: ${scores.overall}/100 (${scores.overallSignal})`);

        return scores;
    }
}

// ═══════════════════════════════════════════════════════════════════
// EXPORT & INITIALIZATION
// ═══════════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlphaVaultScoring;
}

window.AlphaVaultScoring = AlphaVaultScoring;

console.log('✅ AlphaVault Scoring System v2.0 ULTRA PRO loaded!');
console.log('🏆 Advanced proprietary scoring algorithms active');
console.log('🔒 Legal compliance: Full data transformation enabled');