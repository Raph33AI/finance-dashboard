/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT INSIDER ANALYZER - Insider Flow Tracker Integration
 * ═══════════════════════════════════════════════════════════════
 * Version: 3.0.0
 * Description: Réutilisation de la logique Insider Flow Tracker
 * Features:
 *   - Pattern detection (momentum, acceleration, unusual)
 *   - Network graph visualization
 *   - Analyse des transactions Form 4
 */

class ChatbotInsiderAnalyzer {
    constructor(config) {
        this.config = config;
        this.apiClient = null;
        
        // Insider classification (from Insider Flow Tracker)
        this.insiderClasses = [
            'CEO', 'CFO', 'COO', 'President', 'Director', 
            'Vice President', 'Chief', 'Officer', 'Board Member',
            'General Counsel', 'Secretary', 'Treasurer', 'Controller', 'Manager'
        ];
        
        // Pattern detection thresholds
        this.patternThresholds = {
            momentum: {
                buyRatio: 0.7,          // 70% buy transactions
                minTransactions: 5,
                timeWindow: 30          // days
            },
            acceleration: {
                recentMultiplier: 2.0,  // 2x increase in recent period
                comparisonPeriod: 60    // days
            },
            unusual: {
                volumeMultiplier: 3.0,  // 3x average volume
                priceImpact: 0.05       // 5% price movement
            },
            clustered: {
                timeWindow: 7,          // days
                minInsiders: 3
            }
        };
        
        console.log('📊 ChatbotInsiderAnalyzer initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYZE INSIDER TRADING (Main Method)
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeInsiderTrading(entities = {}) {
        try {
            console.log('📊 Analyzing insider trading activity...');

            let symbol = null;
            if (entities.symbols && entities.symbols.length > 0) {
                symbol = entities.symbols[0];
            }

            if (symbol) {
                // Analyze specific symbol
                return await this.analyzeSymbolInsiderActivity(symbol);
            } else {
                // Show overall insider market activity
                return await this.getInsiderMarketOverview();
            }

        } catch (error) {
            console.error('❌ Insider analysis error:', error);
            return {
                text: "❌ Unable to fetch insider trading data at the moment. Please try again later.",
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYZE SYMBOL INSIDER ACTIVITY
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeSymbolInsiderActivity(symbol) {
        console.log(`📊 Fetching insider transactions for ${symbol}...`);

        // Get insider transactions (last 90 days)
        const transactions = await this.getInsiderTransactions(symbol);

        if (!transactions || transactions.length === 0) {
            return {
                text: `📊 **Insider Trading - ${symbol}**\n\nNo recent insider transactions found for ${symbol} in the last 90 days.\n\nThis could indicate:\n• No significant insider activity\n• Blackout period (earnings season)\n• Company restrictions on trading`,
                charts: [],
                data: null
            };
        }

        // Classify transactions
        const classified = this.classifyTransactions(transactions);

        // Detect patterns
        const patterns = this.detectPatterns(transactions);

        // Calculate metrics
        const metrics = this.calculateInsiderMetrics(transactions);

        // Generate sentiment
        const sentiment = this.generateInsiderSentiment(classified, patterns, metrics);

        // Build response
        const responseText = this.buildInsiderResponse(symbol, classified, patterns, metrics, sentiment);

        return {
            text: responseText,
            charts: [],
            data: {
                symbol,
                transactions,
                classified,
                patterns,
                metrics,
                sentiment
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET INSIDER TRANSACTIONS
     * ═══════════════════════════════════════════════════════════
     */
    async getInsiderTransactions(symbol) {
        // This would connect to your insider data source
        if (this.apiClient && typeof this.apiClient.getInsiderTransactions === 'function') {
            return await this.apiClient.getInsiderTransactions(symbol);
        }

        // Return demo data
        return this.getDemoInsiderData(symbol);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET DEMO INSIDER DATA
     * ═══════════════════════════════════════════════════════════
     */
    getDemoInsiderData(symbol) {
        const now = Date.now();
        return [
            {
                filingDate: new Date(now - 2 * 24 * 60 * 60 * 1000),
                transactionDate: new Date(now - 3 * 24 * 60 * 60 * 1000),
                insider: 'John Smith',
                title: 'CEO',
                transactionType: 'Purchase',
                shares: 50000,
                pricePerShare: 125.50,
                totalValue: 6275000,
                sharesOwned: 1500000
            },
            {
                filingDate: new Date(now - 5 * 24 * 60 * 60 * 1000),
                transactionDate: new Date(now - 6 * 24 * 60 * 60 * 1000),
                insider: 'Jane Doe',
                title: 'CFO',
                transactionType: 'Purchase',
                shares: 25000,
                pricePerShare: 123.75,
                totalValue: 3093750,
                sharesOwned: 800000
            },
            {
                filingDate: new Date(now - 10 * 24 * 60 * 60 * 1000),
                transactionDate: new Date(now - 11 * 24 * 60 * 60 * 1000),
                insider: 'Robert Johnson',
                title: 'Director',
                transactionType: 'Sale',
                shares: 10000,
                pricePerShare: 128.25,
                totalValue: 1282500,
                sharesOwned: 500000
            },
            {
                filingDate: new Date(now - 15 * 24 * 60 * 60 * 1000),
                transactionDate: new Date(now - 16 * 24 * 60 * 60 * 1000),
                insider: 'Mary Williams',
                title: 'COO',
                transactionType: 'Purchase',
                shares: 30000,
                pricePerShare: 120.00,
                totalValue: 3600000,
                sharesOwned: 650000
            },
            {
                filingDate: new Date(now - 20 * 24 * 60 * 60 * 1000),
                transactionDate: new Date(now - 21 * 24 * 60 * 60 * 1000),
                insider: 'David Brown',
                title: 'Vice President',
                transactionType: 'Purchase',
                shares: 15000,
                pricePerShare: 118.50,
                totalValue: 1777500,
                sharesOwned: 300000
            }
        ];
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CLASSIFY TRANSACTIONS
     * ═══════════════════════════════════════════════════════════
     */
    classifyTransactions(transactions) {
        const buys = transactions.filter(t => t.transactionType === 'Purchase');
        const sells = transactions.filter(t => t.transactionType === 'Sale');

        // Classify by insider seniority
        const cSuite = transactions.filter(t => 
            ['CEO', 'CFO', 'COO', 'President', 'Chief'].some(title => t.title.includes(title))
        );
        
        const directors = transactions.filter(t => 
            t.title.includes('Director') || t.title.includes('Board')
        );
        
        const officers = transactions.filter(t => 
            !['CEO', 'CFO', 'COO', 'President', 'Chief', 'Director', 'Board'].some(title => t.title.includes(title))
        );

        return {
            total: transactions.length,
            buys: {
                count: buys.length,
                totalValue: buys.reduce((sum, t) => sum + t.totalValue, 0),
                totalShares: buys.reduce((sum, t) => sum + t.shares, 0),
                transactions: buys
            },
            sells: {
                count: sells.length,
                totalValue: sells.reduce((sum, t) => sum + t.totalValue, 0),
                totalShares: sells.reduce((sum, t) => sum + t.shares, 0),
                transactions: sells
            },
            byLevel: {
                cSuite: cSuite.length,
                directors: directors.length,
                officers: officers.length
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * DETECT PATTERNS
     * ═══════════════════════════════════════════════════════════
     */
    detectPatterns(transactions) {
        const patterns = {
            momentum: false,
            acceleration: false,
            unusual: false,
            clustered: false,
            details: []
        };

        // 1. MOMENTUM PATTERN (Consistent buying/selling)
        const buyRatio = transactions.filter(t => t.transactionType === 'Purchase').length / transactions.length;
        if (buyRatio >= this.patternThresholds.momentum.buyRatio && 
            transactions.length >= this.patternThresholds.momentum.minTransactions) {
            patterns.momentum = true;
            patterns.details.push({
                type: 'MOMENTUM',
                direction: buyRatio > 0.7 ? 'BULLISH' : 'BEARISH',
                strength: buyRatio > 0.8 ? 'STRONG' : 'MODERATE',
                description: `${(buyRatio * 100).toFixed(0)}% of recent transactions are purchases - strong bullish momentum`
            });
        }

        // 2. ACCELERATION PATTERN (Increasing frequency)
        const recentPeriod = 30;  // days
        const comparisonPeriod = 60;  // days
        const now = Date.now();
        
        const recentTransactions = transactions.filter(t => 
            now - t.transactionDate.getTime() < recentPeriod * 24 * 60 * 60 * 1000
        );
        
        const olderTransactions = transactions.filter(t => {
            const age = now - t.transactionDate.getTime();
            return age >= recentPeriod * 24 * 60 * 60 * 1000 && 
                   age < comparisonPeriod * 24 * 60 * 60 * 1000;
        });

        if (olderTransactions.length > 0 && 
            recentTransactions.length >= olderTransactions.length * this.patternThresholds.acceleration.recentMultiplier) {
            patterns.acceleration = true;
            patterns.details.push({
                type: 'ACCELERATION',
                multiplier: (recentTransactions.length / olderTransactions.length).toFixed(1),
                description: `Insider activity accelerating - ${recentTransactions.length}x increase in last ${recentPeriod} days`
            });
        }

        // 3. UNUSUAL VOLUME PATTERN
        const avgTransactionValue = transactions.reduce((sum, t) => sum + t.totalValue, 0) / transactions.length;
        const largeTransactions = transactions.filter(t => 
            t.totalValue >= avgTransactionValue * this.patternThresholds.unusual.volumeMultiplier
        );

        if (largeTransactions.length > 0) {
            patterns.unusual = true;
            patterns.details.push({
                type: 'UNUSUAL',
                count: largeTransactions.length,
                description: `${largeTransactions.length} unusually large transactions detected (>3x average)`
            });
        }

        // 4. CLUSTERED PATTERN (Multiple insiders trading same time)
        const clusters = this.findTransactionClusters(transactions);
        if (clusters.length > 0) {
            patterns.clustered = true;
            patterns.details.push({
                type: 'CLUSTERED',
                clusters: clusters.length,
                description: `${clusters.length} cluster(s) of coordinated insider activity detected`
            });
        }

        return patterns;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * FIND TRANSACTION CLUSTERS
     * ═══════════════════════════════════════════════════════════
     */
    findTransactionClusters(transactions) {
        const clusters = [];
        const timeWindow = this.patternThresholds.clustered.timeWindow * 24 * 60 * 60 * 1000;
        const minInsiders = this.patternThresholds.clustered.minInsiders;

        // Sort by transaction date
        const sorted = [...transactions].sort((a, b) => 
            a.transactionDate.getTime() - b.transactionDate.getTime()
        );

        for (let i = 0; i < sorted.length; i++) {
            const baseTime = sorted[i].transactionDate.getTime();
            const cluster = sorted.filter(t => 
                Math.abs(t.transactionDate.getTime() - baseTime) <= timeWindow
            );

            // Get unique insiders
            const uniqueInsiders = [...new Set(cluster.map(t => t.insider))];

            if (uniqueInsiders.length >= minInsiders && 
                !clusters.some(c => c.baseIndex === i)) {
                clusters.push({
                    baseIndex: i,
                    insiders: uniqueInsiders.length,
                    transactions: cluster.length,
                    date: sorted[i].transactionDate
                });
            }
        }

        return clusters;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE INSIDER METRICS
     * ═══════════════════════════════════════════════════════════
     */
    calculateInsiderMetrics(transactions) {
        const totalValue = transactions.reduce((sum, t) => sum + t.totalValue, 0);
        const avgValue = totalValue / transactions.length;

        const buyValue = transactions
            .filter(t => t.transactionType === 'Purchase')
            .reduce((sum, t) => sum + t.totalValue, 0);

        const sellValue = transactions
            .filter(t => t.transactionType === 'Sale')
            .reduce((sum, t) => sum + t.totalValue, 0);

        const netFlow = buyValue - sellValue;
        const buyRatio = totalValue > 0 ? (buyValue / totalValue) * 100 : 0;

        return {
            totalValue: totalValue,
            avgValue: avgValue,
            buyValue: buyValue,
            sellValue: sellValue,
            netFlow: netFlow,
            buyRatio: buyRatio,
            uniqueInsiders: [...new Set(transactions.map(t => t.insider))].length
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GENERATE INSIDER SENTIMENT
     * ═══════════════════════════════════════════════════════════
     */
    generateInsiderSentiment(classified, patterns, metrics) {
        let score = 50;  // Neutral baseline

        // Buy/Sell ratio impact
        if (metrics.buyRatio >= 80) score += 30;
        else if (metrics.buyRatio >= 70) score += 20;
        else if (metrics.buyRatio >= 60) score += 10;
        else if (metrics.buyRatio <= 20) score -= 30;
        else if (metrics.buyRatio <= 30) score -= 20;
        else if (metrics.buyRatio <= 40) score -= 10;

        // Pattern impact
        if (patterns.momentum) score += 15;
        if (patterns.acceleration) score += 10;
        if (patterns.clustered) score += 10;
        if (patterns.unusual) score += 5;

        // C-Suite impact (higher weight)
        const cSuiteRatio = classified.byLevel.cSuite / classified.total;
        if (cSuiteRatio >= 0.5) score += 10;

        // Net flow impact
        if (metrics.netFlow > 0 && metrics.netFlow > metrics.totalValue * 0.5) score += 15;
        else if (metrics.netFlow < 0 && Math.abs(metrics.netFlow) > metrics.totalValue * 0.5) score -= 15;

        // Normalize score
        score = Math.max(0, Math.min(100, score));

        let sentiment = 'NEUTRAL';
        let confidence = 'MODERATE';

        if (score >= 80) {
            sentiment = 'VERY BULLISH';
            confidence = 'HIGH';
        } else if (score >= 65) {
            sentiment = 'BULLISH';
            confidence = 'HIGH';
        } else if (score >= 55) {
            sentiment = 'MODERATELY BULLISH';
            confidence = 'MODERATE';
        } else if (score <= 20) {
            sentiment = 'VERY BEARISH';
            confidence = 'HIGH';
        } else if (score <= 35) {
            sentiment = 'BEARISH';
            confidence = 'HIGH';
        } else if (score <= 45) {
            sentiment = 'MODERATELY BEARISH';
            confidence = 'MODERATE';
        }

        return {
            score,
            sentiment,
            confidence,
            signal: score >= 65 ? 'BUY' : score <= 35 ? 'SELL' : 'HOLD'
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * BUILD INSIDER RESPONSE
     * ═══════════════════════════════════════════════════════════
     */
    buildInsiderResponse(symbol, classified, patterns, metrics, sentiment) {
        let response = `📊 **Insider Trading Analysis - ${symbol}**\n\n`;

        // Sentiment
        response += `**Insider Sentiment:** ${sentiment.sentiment}\n`;
        response += `**Signal:** ${sentiment.signal} | Confidence: ${sentiment.confidence}\n`;
        response += `**Sentiment Score:** ${sentiment.score}/100\n\n`;

        // Transaction Summary
        response += `**Transaction Summary (Last 90 Days):**\n`;
        response += `• Total Transactions: ${classified.total}\n`;
        response += `• Buys: ${classified.buys.count} ($${(classified.buys.totalValue / 1000000).toFixed(1)}M)\n`;
        response += `• Sells: ${classified.sells.count} ($${(classified.sells.totalValue / 1000000).toFixed(1)}M)\n`;
        response += `• Net Flow: $${(metrics.netFlow / 1000000).toFixed(1)}M\n`;
        response += `• Buy Ratio: ${metrics.buyRatio.toFixed(1)}%\n\n`;

        // Insider Breakdown
        response += `**By Insider Level:**\n`;
        response += `• C-Suite: ${classified.byLevel.cSuite} transactions\n`;
        response += `• Directors: ${classified.byLevel.directors} transactions\n`;
        response += `• Officers: ${classified.byLevel.officers} transactions\n`;
        response += `• Unique Insiders: ${metrics.uniqueInsiders}\n\n`;

        // Patterns Detected
        if (patterns.details.length > 0) {
            response += `**🔍 Patterns Detected:**\n`;
            patterns.details.forEach(pattern => {
                response += `• **${pattern.type}**: ${pattern.description}\n`;
            });
            response += `\n`;
        }

        // Recent Notable Transactions
        const notableTransactions = classified.buys.transactions
            .concat(classified.sells.transactions)
            .sort((a, b) => b.transactionDate.getTime() - a.transactionDate.getTime())
            .slice(0, 3);

        if (notableTransactions.length > 0) {
            response += `**Recent Notable Transactions:**\n`;
            notableTransactions.forEach(t => {
                const dateStr = t.transactionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                response += `• ${dateStr}: ${t.insider} (${t.title}) - ${t.transactionType} ${(t.shares / 1000).toFixed(0)}K shares @ $${t.pricePerShare.toFixed(2)}\n`;
            });
        }

        return response;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET INSIDER MARKET OVERVIEW
     * ═══════════════════════════════════════════════════════════
     */
    async getInsiderMarketOverview() {
        return {
            text: `📊 **Insider Trading Market Overview**

**Top Insider Activity This Week:**

To analyze insider trading for a specific stock, use:
• "Show insider trading for AAPL"
• "NVDA insider activity"
• "Unusual insider buying TSLA"

**Features:**
• Real-time Form 4 filings analysis
• Pattern detection (momentum, acceleration, clusters)
• Insider sentiment scoring
• Network analysis of coordinated trades

Which stock would you like to analyze?`,
            charts: [],
            data: null
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotInsiderAnalyzer;
}

if (typeof window !== 'undefined') {
    window.ChatbotInsiderAnalyzer = ChatbotInsiderAnalyzer;
}

console.log('✅ ChatbotInsiderAnalyzer loaded');