/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT INVESTMENT MANAGER - Ultra Cloud Integration
 * ═══════════════════════════════════════════════════════════════
 * Version: 5.0.0 PREMIUM
 * Description: Intégration complète Investment Analytics + AI Optimization
 * Features:
 *   - Cloud Sync (Firestore + SimulationManager)
 *   - Real-time data access from Investment Analytics
 *   - Advanced AI recommendations (Efficient Frontier, Strategies, Backtest)
 *   - Multi-allocation comparison
 *   - Risk profile analysis
 *   - Diversification scoring
 *   - Portfolio optimization
 *   - Asset recommendations
 *   - Strategy application
 *   - Correlation analysis
 *   - Performance projections
 */

class ChatbotInvestmentManager {
    constructor(config) {
        this.config = config;
        this.investmentAnalytics = null;
        this.cache = {
            data: null,
            timestamp: null,
            ttl: 30000 // 30 seconds cache
        };
        
        // Asset types configuration
        this.assetTypes = {
            equity: {
                name: 'Equity',
                icon: 'fa-chart-line',
                expectedReturn: 9.6,
                expectedVolatility: 18.0,
                description: 'Stocks and equity funds'
            },
            bonds: {
                name: 'Bonds',
                icon: 'fa-shield-alt',
                expectedReturn: 4.8,
                expectedVolatility: 8.0,
                description: 'Government and corporate bonds'
            },
            crypto: {
                name: 'Crypto',
                icon: 'fa-bitcoin',
                expectedReturn: 18.0,
                expectedVolatility: 60.0,
                description: 'Cryptocurrencies and digital assets'
            },
            commodities: {
                name: 'Commodities',
                icon: 'fa-gem',
                expectedReturn: 6.0,
                expectedVolatility: 24.0,
                description: 'Gold, oil, and other commodities'
            },
            'real-estate': {
                name: 'Real Estate',
                icon: 'fa-building',
                expectedReturn: 7.2,
                expectedVolatility: 12.0,
                description: 'REITs and real estate funds'
            },
            cash: {
                name: 'Cash',
                icon: 'fa-money-bill-wave',
                expectedReturn: 2.0,
                expectedVolatility: 1.0,
                description: 'Cash and equivalents'
            },
            other: {
                name: 'Other',
                icon: 'fa-question-circle',
                expectedReturn: 5.0,
                expectedVolatility: 15.0,
                description: 'Alternative investments'
            }
        };
        
        // Risk thresholds
        this.thresholds = {
            diversification: {
                excellent: 80,
                good: 60,
                fair: 40
            },
            concentration: {
                maxSingleAsset: 40,
                warning: 60
            },
            sharpe: {
                excellent: 2.0,
                veryGood: 1.5,
                good: 1.0,
                fair: 0.5
            },
            volatility: {
                low: 10,
                moderate: 20,
                high: 30
            }
        };
        
        console.log('📊 ChatbotInvestmentManager Ultra v5.0 initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * MAIN ENTRY POINT
     * ═══════════════════════════════════════════════════════════
     */
    async manageInvestments(entities = {}, userMessage = '') {
        try {
            console.log('📊 Managing investment request:', userMessage);

            // Detect investment intent with advanced NLP
            const intent = this.detectInvestmentIntent(userMessage, entities);
            console.log('🎯 Detected intent:', intent);

            // Route to appropriate handler
            switch (intent) {
                case 'PORTFOLIO_OVERVIEW':
                    return await this.getPortfolioOverview();
                
                case 'ANALYZE_ALLOCATION':
                    return await this.analyzeAllocation();
                
                case 'OPTIMIZE_PORTFOLIO':
                    return await this.optimizePortfolio();
                
                case 'COMPARE_ALLOCATIONS':
                    return await this.compareAllocations();
                
                case 'RISK_ANALYSIS':
                    return await this.analyzeRisk();
                
                case 'DIVERSIFICATION_CHECK':
                    return await this.checkDiversification();
                
                case 'BACKTEST_STRATEGY':
                    return await this.backtestStrategy(entities);
                
                case 'EFFICIENT_FRONTIER':
                    return await this.showEfficientFrontier();
                
                case 'ASSET_RECOMMENDATION':
                    return await this.recommendAssets();
                
                case 'REBALANCE':
                    return await this.rebalanceGuidance();
                
                case 'PROJECTION':
                    return await this.projectPortfolio(entities);
                
                case 'CORRELATION_ANALYSIS':
                    return await this.analyzeCorrelation();
                
                case 'STRATEGY_COMPARISON':
                    return await this.compareStrategies();
                
                case 'APPLY_STRATEGY':
                    return await this.applyStrategyGuidance(entities);
                
                case 'EXPORT_DATA':
                    return await this.exportDataGuidance();
                
                default:
                    return this.getInvestmentHelp();
            }

        } catch (error) {
            console.error('❌ Investment management error:', error);
            return {
                text: `❌ **Error Processing Request**\n\n${error.message}\n\nPlease try again or rephrase your question.`,
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * INTENT DETECTION (Advanced NLP)
     * ═══════════════════════════════════════════════════════════
     */
    detectInvestmentIntent(message, entities) {
        const lower = message.toLowerCase();

        // Portfolio Overview
        if (lower.match(/\b(show|display|view|get|my)\s+(portfolio|allocation|holdings|investments)\b/i)) {
            return 'PORTFOLIO_OVERVIEW';
        }

        // Allocation Analysis
        if (lower.match(/\b(analyze|analysis|examine|review|check)\s+(my\s+)?(allocation|portfolio|assets)\b/i)) {
            return 'ANALYZE_ALLOCATION';
        }

        // Optimization
        if (lower.match(/\b(optimize|improve|better|enhance|maximize)\s+(my\s+)?(portfolio|allocation|investments)\b/i)) {
            return 'OPTIMIZE_PORTFOLIO';
        }

        // Comparison
        if (lower.match(/\b(compare|comparison|vs|versus|difference)\s+(allocations?|portfolios?|strategies)\b/i)) {
            return 'COMPARE_ALLOCATIONS';
        }

        // Risk Analysis
        if (lower.match(/\b(risk|volatility|drawdown|sharpe|var|cvar)\s+(analysis|profile|level|assessment)\b/i)) {
            return 'RISK_ANALYSIS';
        }

        // Diversification
        if (lower.match(/\b(diversif|spread|balance|distribution)\b/i)) {
            return 'DIVERSIFICATION_CHECK';
        }

        // Backtest
        if (lower.match(/\b(backtest|historical|performance|how\s+would)\b/i)) {
            return 'BACKTEST_STRATEGY';
        }

        // Efficient Frontier
        if (lower.match(/\b(efficient\s+frontier|optimal\s+portfolio|risk\s+return|pareto)\b/i)) {
            return 'EFFICIENT_FRONTIER';
        }

        // Asset Recommendations
        if (lower.match(/\b(recommend|suggest|what\s+asset|which\s+asset|add\s+asset)\b/i)) {
            return 'ASSET_RECOMMENDATION';
        }

        // Rebalance
        if (lower.match(/\b(rebalance|adjust|reallocate|redistribute)\b/i)) {
            return 'REBALANCE';
        }

        // Projections
        if (lower.match(/\b(project|forecast|predict|future|in\s+\d+\s+(year|month)s?)\b/i)) {
            return 'PROJECTION';
        }

        // Correlation
        if (lower.match(/\b(correlation|correl|relationship|dependenc)\b/i)) {
            return 'CORRELATION_ANALYSIS';
        }

        // Strategy Comparison
        if (lower.match(/\b(conservative|balanced|aggressive|moderate)\s+(vs|versus|strategy|approach)\b/i)) {
            return 'STRATEGY_COMPARISON';
        }

        // Apply Strategy
        if (lower.match(/\b(apply|use|implement|adopt)\s+(strategy|allocation)\b/i)) {
            return 'APPLY_STRATEGY';
        }

        // Export
        if (lower.match(/\b(export|download|extract|report|pdf)\b/i)) {
            return 'EXPORT_DATA';
        }

        return 'HELP';
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * DATA ACCESS (Investment Analytics Integration)
     * ═══════════════════════════════════════════════════════════
     */
    async getInvestmentData(forceRefresh = false) {
        try {
            // Check cache first
            if (!forceRefresh && this.cache.data && this.cache.timestamp) {
                const age = Date.now() - this.cache.timestamp;
                if (age < this.cache.ttl) {
                    console.log('📦 Using cached investment data');
                    return this.cache.data;
                }
            }

            console.log('🔄 Fetching fresh investment data...');

            // Try to get data from InvestmentAnalytics if available
            if (window.InvestmentAnalytics) {
                const currentAllocation = window.InvestmentAnalytics.currentAllocation;
                const financialData = window.InvestmentAnalytics.financialData;
                const allocations = window.InvestmentAnalytics.allocations || [];
                
                if (currentAllocation && financialData) {
                    const investmentData = {
                        currentAllocation,
                        financialData,
                        allocations,
                        allocationMode: window.InvestmentAnalytics.allocationMode || 'percent'
                    };
                    
                    console.log('✅ Loaded from InvestmentAnalytics');
                    this.cache.data = investmentData;
                    this.cache.timestamp = Date.now();
                    return investmentData;
                }
            }

            // Fallback to localStorage/Firestore
            const saved = localStorage.getItem('savedAllocations');
            if (saved) {
                try {
                    const allocations = JSON.parse(saved);
                    const currentAllocation = allocations.length > 0 ? allocations[0] : this.getDefaultAllocation();
                    
                    const investmentData = {
                        currentAllocation,
                        financialData: [],
                        allocations,
                        allocationMode: 'percent'
                    };
                    
                    console.log('✅ Loaded from localStorage');
                    this.cache.data = investmentData;
                    this.cache.timestamp = Date.now();
                    return investmentData;
                } catch (e) {
                    console.error('❌ localStorage parse error:', e);
                }
            }

            // No data available
            console.warn('⚠ No investment data available');
            return null;

        } catch (error) {
            console.error('❌ Error fetching investment data:', error);
            return null;
        }
    }

    getDefaultAllocation() {
        return {
            id: 'default_' + Date.now(),
            name: 'Default',
            linkedSimulation: null,
            assets: [
                { id: Date.now(), name: 'S&P 500 Index', ticker: 'SPY', type: 'equity', allocation: 60, allocationCurrency: 0 },
                { id: Date.now() + 1, name: 'Bonds ETF', ticker: 'AGG', type: 'bonds', allocation: 30, allocationCurrency: 0 },
                { id: Date.now() + 2, name: 'Cash Reserve', ticker: '', type: 'cash', allocation: 10, allocationCurrency: 0 }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * PORTFOLIO OVERVIEW
     * ═══════════════════════════════════════════════════════════
     */
    async getPortfolioOverview() {
        const investmentData = await this.getInvestmentData();

        if (!investmentData || !investmentData.currentAllocation) {
            return {
                text: `📊 **No Portfolio Data Found**\n\nYou haven't created a portfolio allocation yet.\n\n**Get Started:**\n• Visit the **Investment Analytics** page\n• Create your first asset allocation\n• Return here for AI-powered insights\n\n**Or:**\nIf you have existing data, ensure:\n• Investment Analytics is loaded\n• At least one allocation is created\n• Data is saved to cloud\n\nNeed help? Ask: *"How do I create a portfolio?"*`,
                charts: [],
                data: null
            };
        }

        const allocation = investmentData.currentAllocation;
        const assets = allocation.assets || [];
        
        // Calculate summary metrics
        const totalAllocation = assets.reduce((sum, a) => sum + (a.allocation || 0), 0);
        const numberOfAssets = assets.length;
        const numberOfTypes = new Set(assets.map(a => a.type)).size;
        
        // Get historical metrics if available
        let metrics = null;
        if (window.InvestmentAnalytics && investmentData.financialData.length > 0) {
            metrics = window.InvestmentAnalytics.calculateMetrics(investmentData.financialData);
        }

        let response = `📊 **Your Investment Portfolio Overview**\n\n`;

        // Allocation Info
        response += `📋 **Allocation: "${allocation.name}"**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Total Allocated: **${totalAllocation.toFixed(1)}%**\n`;
        response += `• Number of Assets: **${numberOfAssets}**\n`;
        response += `• Asset Classes: **${numberOfTypes}**\n`;
        if (allocation.linkedSimulation) {
            response += `• Linked to Budget: **${allocation.linkedSimulation}**\n`;
        }
        response += `\n`;

        // Asset Breakdown
        response += `💼 **Asset Breakdown:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        
        // Group by type
        const grouped = {};
        assets.forEach(asset => {
            if (!grouped[asset.type]) grouped[asset.type] = [];
            grouped[asset.type].push(asset);
        });

        Object.entries(grouped).forEach(([type, typeAssets]) => {
            const typeTotal = typeAssets.reduce((sum, a) => sum + a.allocation, 0);
            const typeInfo = this.assetTypes[type] || this.assetTypes.other;
            
            response += `\n**${typeInfo.name}** (${typeTotal.toFixed(1)}%)\n`;
            typeAssets.forEach(asset => {
                response += `  • ${asset.name}`;
                if (asset.ticker) response += ` (${asset.ticker})`;
                response += `: ${asset.allocation.toFixed(1)}%\n`;
            });
        });
        response += `\n`;

        // Performance Metrics (if available)
        if (metrics) {
            response += `📈 **Performance Metrics:**\n`;
            response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            response += `• Annualized Return: **${metrics.annualizedReturn.toFixed(2)}%**\n`;
            response += `• Volatility: **${metrics.volatility.toFixed(2)}%**\n`;
            response += `• Sharpe Ratio: **${metrics.sharpeRatio.toFixed(2)}** (${this.interpretSharpe(metrics.sharpeRatio)})\n`;
            response += `• Max Drawdown: **-${metrics.maxDrawdown.toFixed(2)}%**\n`;
            response += `• Win Rate: **${metrics.winRate.toFixed(1)}%**\n`;
            response += `\n`;
        }

        // Quick insights
        const insights = this.generateQuickInsights(allocation, metrics);
        if (insights.length > 0) {
            response += `💡 **Quick Insights:**\n`;
            response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            insights.forEach(insight => {
                response += `• ${insight}\n`;
            });
            response += `\n`;
        }

        // Quick Actions
        response += `⚡ **What I Can Do:**\n`;
        response += `• *"Optimize my portfolio"* - Get AI optimization strategies\n`;
        response += `• *"Analyze risk"* - Detailed risk assessment\n`;
        response += `• *"Check diversification"* - Diversification score\n`;
        response += `• *"Compare strategies"* - Conservative vs Aggressive\n`;
        response += `• *"Backtest for 5 years"* - Historical simulation\n`;

        return {
            text: response,
            charts: [],
            data: {
                allocation,
                metrics,
                insights
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GENERATE QUICK INSIGHTS
     * ═══════════════════════════════════════════════════════════
     */
    generateQuickInsights(allocation, metrics) {
        const insights = [];
        const assets = allocation.assets || [];
        const totalAllocation = assets.reduce((sum, a) => sum + a.allocation, 0);

        // Allocation status
        if (totalAllocation === 100) {
            insights.push('✅ Portfolio is fully allocated');
        } else if (totalAllocation > 100) {
            insights.push(`⚠ Over-allocated by ${(totalAllocation - 100).toFixed(1)}%`);
        } else {
            insights.push(`💡 ${(100 - totalAllocation).toFixed(1)}% remaining to allocate`);
        }

        // Concentration check
        const maxAllocation = Math.max(...assets.map(a => a.allocation));
        if (maxAllocation > this.thresholds.concentration.warning) {
            insights.push(`⚠ High concentration: ${maxAllocation.toFixed(1)}% in single asset`);
        }

        // Diversification
        const numberOfTypes = new Set(assets.map(a => a.type)).size;
        if (numberOfTypes >= 4) {
            insights.push('✅ Well-diversified across asset classes');
        } else if (numberOfTypes <= 2) {
            insights.push('⚠ Limited asset class diversity');
        }

        // Performance insights (if metrics available)
        if (metrics) {
            if (metrics.sharpeRatio > this.thresholds.sharpe.veryGood) {
                insights.push(`🚀 Excellent risk-adjusted returns (Sharpe: ${metrics.sharpeRatio.toFixed(2)})`);
            }
            
            if (metrics.maxDrawdown < 10) {
                insights.push('✅ Low historical drawdown - stable portfolio');
            } else if (metrics.maxDrawdown > 25) {
                insights.push(`⚠ High drawdown risk (-${metrics.maxDrawdown.toFixed(1)}%)`);
            }
        }

        return insights;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYZE ALLOCATION
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeAllocation() {
        const investmentData = await this.getInvestmentData();

        if (!investmentData || !investmentData.currentAllocation) {
            return this.getDataRequiredMessage();
        }

        const allocation = investmentData.currentAllocation;
        const assets = allocation.assets || [];
        
        let response = `🔍 **In-Depth Allocation Analysis**\n\n`;

        // Basic Stats
        const totalAllocation = assets.reduce((sum, a) => sum + a.allocation, 0);
        const numberOfAssets = assets.length;
        const numberOfTypes = new Set(assets.map(a => a.type)).size;
        const maxAllocation = Math.max(...assets.map(a => a.allocation));
        const minAllocation = Math.min(...assets.map(a => a.allocation));

        response += `📊 **Portfolio Statistics:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Allocation Name: **${allocation.name}**\n`;
        response += `• Total Allocated: **${totalAllocation.toFixed(1)}%**\n`;
        response += `• Number of Assets: **${numberOfAssets}**\n`;
        response += `• Asset Classes: **${numberOfTypes}**\n`;
        response += `• Largest Position: **${maxAllocation.toFixed(1)}%**\n`;
        response += `• Smallest Position: **${minAllocation.toFixed(1)}%**\n`;
        response += `\n`;

        // Asset Class Distribution
        response += `📂 **Asset Class Distribution:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        
        const byType = {};
        assets.forEach(asset => {
            if (!byType[asset.type]) byType[asset.type] = 0;
            byType[asset.type] += asset.allocation;
        });

        Object.entries(byType).sort((a, b) => b[1] - a[1]).forEach(([type, percent]) => {
            const typeInfo = this.assetTypes[type] || this.assetTypes.other;
            response += `• **${typeInfo.name}**: ${percent.toFixed(1)}%\n`;
            response += `  Expected Return: ${typeInfo.expectedReturn}% | Volatility: ${typeInfo.expectedVolatility}%\n`;
        });
        response += `\n`;

        // Expected Portfolio Metrics
        let expectedReturn = 0;
        let expectedVolatility = 0;
        
        Object.entries(byType).forEach(([type, percent]) => {
            const typeInfo = this.assetTypes[type] || this.assetTypes.other;
            expectedReturn += (percent / 100) * typeInfo.expectedReturn;
            expectedVolatility += Math.pow((percent / 100) * typeInfo.expectedVolatility, 2);
        });
        expectedVolatility = Math.sqrt(expectedVolatility);

        response += `📈 **Expected Portfolio Metrics:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Expected Return: **${expectedReturn.toFixed(2)}%** per year\n`;
        response += `• Expected Volatility: **${expectedVolatility.toFixed(2)}%** per year\n`;
        response += `• Expected Sharpe (2% risk-free): **${((expectedReturn - 2) / expectedVolatility).toFixed(2)}**\n`;
        response += `\n`;

        // Issues & Recommendations
        const issues = [];
        const recommendations = [];

        if (totalAllocation !== 100) {
            if (totalAllocation > 100) {
                issues.push(`Portfolio is over-allocated by ${(totalAllocation - 100).toFixed(1)}%`);
                recommendations.push('Reduce allocations to reach exactly 100%');
            } else {
                issues.push(`Portfolio is under-allocated by ${(100 - totalAllocation).toFixed(1)}%`);
                recommendations.push('Add assets or increase existing allocations to 100%');
            }
        }

        if (maxAllocation > this.thresholds.concentration.warning) {
            issues.push(`Excessive concentration: ${maxAllocation.toFixed(1)}% in single asset`);
            recommendations.push(`Consider reducing max position to < ${this.thresholds.concentration.maxSingleAsset}%`);
        }

        if (numberOfTypes < 3) {
            issues.push('Limited diversification across asset classes');
            recommendations.push('Add at least 3 different asset classes for better diversification');
        }

        const tinyAllocations = assets.filter(a => a.allocation < 5);
        if (tinyAllocations.length > 0) {
            issues.push(`${tinyAllocations.length} asset(s) with < 5% allocation (may be negligible)`);
            recommendations.push('Consider consolidating small positions');
        }

        if (issues.length > 0) {
            response += `⚠ **Issues Detected:**\n`;
            response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            issues.forEach(issue => {
                response += `• ${issue}\n`;
            });
            response += `\n`;
        }

        if (recommendations.length > 0) {
            response += `💡 **Recommendations:**\n`;
            response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            recommendations.forEach(rec => {
                response += `• ${rec}\n`;
            });
            response += `\n`;
        }

        if (issues.length === 0) {
            response += `✅ **Portfolio Health: Good**\n\nNo major issues detected. Portfolio is well-structured.\n\n`;
        }

        response += `💬 Next steps: *"Optimize my portfolio"* or *"Check diversification"*`;

        return {
            text: response,
            charts: [],
            data: {
                allocation,
                expectedReturn,
                expectedVolatility,
                issues,
                recommendations
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * OPTIMIZE PORTFOLIO (AI Strategies)
     * ═══════════════════════════════════════════════════════════
     */
    async optimizePortfolio() {
        const investmentData = await this.getInvestmentData();

        if (!investmentData || !investmentData.currentAllocation) {
            return this.getDataRequiredMessage();
        }

        const allocation = investmentData.currentAllocation;
        const assets = allocation.assets || [];

        if (assets.length < 2) {
            return {
                text: `⚠ **Insufficient Assets for Optimization**\n\nNeed at least 2 assets in your portfolio for AI optimization.\n\nCurrent assets: ${assets.length}\n\nPlease add more assets and try again.`,
                charts: [],
                data: null
            };
        }

        let response = `🤖 **AI Portfolio Optimization**\n\n`;

        response += `📊 **Current Portfolio:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Allocation: **${allocation.name}**\n`;
        response += `• Assets: **${assets.length}**\n`;
        response += `• Asset Classes: **${new Set(assets.map(a => a.type)).size}**\n`;
        response += `\n`;

        // Generate 3 optimized strategies
        const strategies = this.generateOptimizedStrategies(assets);

        response += `🎯 **AI-Optimized Strategies:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        strategies.forEach((strategy, index) => {
            response += `**${index + 1}. ${strategy.name} Strategy** ${strategy.badge}\n`;
            response += `${strategy.description}\n\n`;
            
            response += `**Expected Metrics:**\n`;
            response += `• Return: **${strategy.expectedReturn.toFixed(2)}%** per year\n`;
            response += `• Volatility: **${strategy.expectedVolatility.toFixed(2)}%** per year\n`;
            response += `• Sharpe Ratio: **${strategy.sharpeRatio.toFixed(2)}**\n`;
            response += `• Risk Level: **${strategy.riskLevel}**\n\n`;

            response += `**Recommended Allocation:**\n`;
            strategy.allocation.forEach(item => {
                response += `  • ${item.name}: **${item.weight.toFixed(1)}%** (${item.change > 0 ? '+' : ''}${item.change.toFixed(1)}%)\n`;
            });
            response += `\n`;
        });

        response += `📈 **Implementation:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `To apply a strategy:\n`;
        response += `1. Go to **Investment Analytics** page\n`;
        response += `2. Click **"Advanced AI Optimization"**\n`;
        response += `3. Review strategies and click **"Apply"**\n\n`;

        response += `Or ask me: *"Compare conservative vs aggressive strategy"*`;

        return {
            text: response,
            charts: [],
            data: {
                currentAllocation: allocation,
                strategies
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GENERATE OPTIMIZED STRATEGIES
     * ═══════════════════════════════════════════════════════════
     */
    generateOptimizedStrategies(currentAssets) {
        const strategies = [];

        // Get asset types info
        const assetsByType = {};
        currentAssets.forEach(asset => {
            if (!assetsByType[asset.type]) assetsByType[asset.type] = [];
            assetsByType[asset.type].push(asset);
        });

        // 1. CONSERVATIVE STRATEGY
        const conservative = {
            name: 'Conservative',
            badge: '🛡',
            description: 'Low-risk approach emphasizing capital preservation with bonds and cash.',
            riskLevel: 'LOW',
            allocation: [],
            expectedReturn: 0,
            expectedVolatility: 0,
            sharpeRatio: 0
        };

        currentAssets.forEach(asset => {
            const typeInfo = this.assetTypes[asset.type] || this.assetTypes.other;
            let targetWeight = asset.allocation;

            // Reduce high-risk assets
            if (asset.type === 'equity' || asset.type === 'crypto') {
                targetWeight *= 0.5;
            }
            // Increase low-risk assets
            else if (asset.type === 'bonds' || asset.type === 'cash') {
                targetWeight *= 1.5;
            }

            conservative.allocation.push({
                name: asset.name,
                type: asset.type,
                weight: targetWeight,
                change: targetWeight - asset.allocation
            });
        });

        // Normalize to 100%
        const conservativeSum = conservative.allocation.reduce((sum, a) => sum + a.weight, 0);
        conservative.allocation = conservative.allocation.map(a => ({
            ...a,
            weight: (a.weight / conservativeSum) * 100,
            change: ((a.weight / conservativeSum) * 100) - currentAssets.find(ca => ca.name === a.name).allocation
        }));

        // Calculate expected metrics
        conservative.allocation.forEach(a => {
            const typeInfo = this.assetTypes[a.type] || this.assetTypes.other;
            conservative.expectedReturn += (a.weight / 100) * typeInfo.expectedReturn;
            conservative.expectedVolatility += Math.pow((a.weight / 100) * typeInfo.expectedVolatility, 2);
        });
        conservative.expectedVolatility = Math.sqrt(conservative.expectedVolatility);
        conservative.sharpeRatio = (conservative.expectedReturn - 2) / conservative.expectedVolatility;

        strategies.push(conservative);

        // 2. BALANCED STRATEGY (Max Sharpe)
        const balanced = {
            name: 'Balanced',
            badge: '⚖',
            description: 'Optimal risk-adjusted returns with balanced asset mix.',
            riskLevel: 'MEDIUM',
            allocation: [],
            expectedReturn: 0,
            expectedVolatility: 0,
            sharpeRatio: 0
        };

        currentAssets.forEach(asset => {
            const typeInfo = this.assetTypes[asset.type] || this.assetTypes.other;
            // Weight by Sharpe contribution
            const assetSharpe = (typeInfo.expectedReturn - 2) / typeInfo.expectedVolatility;
            const targetWeight = assetSharpe > 0 ? asset.allocation * (1 + assetSharpe * 0.2) : asset.allocation * 0.8;

            balanced.allocation.push({
                name: asset.name,
                type: asset.type,
                weight: targetWeight,
                change: targetWeight - asset.allocation
            });
        });

        // Normalize to 100%
        const balancedSum = balanced.allocation.reduce((sum, a) => sum + a.weight, 0);
        balanced.allocation = balanced.allocation.map(a => ({
            ...a,
            weight: (a.weight / balancedSum) * 100,
            change: ((a.weight / balancedSum) * 100) - currentAssets.find(ca => ca.name === a.name).allocation
        }));

        // Calculate metrics
        balanced.allocation.forEach(a => {
            const typeInfo = this.assetTypes[a.type] || this.assetTypes.other;
            balanced.expectedReturn += (a.weight / 100) * typeInfo.expectedReturn;
            balanced.expectedVolatility += Math.pow((a.weight / 100) * typeInfo.expectedVolatility, 2);
        });
        balanced.expectedVolatility = Math.sqrt(balanced.expectedVolatility);
        balanced.sharpeRatio = (balanced.expectedReturn - 2) / balanced.expectedVolatility;

        strategies.push(balanced);

        // 3. AGGRESSIVE STRATEGY
        const aggressive = {
            name: 'Aggressive',
            badge: '🚀',
            description: 'High-growth approach maximizing returns with higher risk tolerance.',
            riskLevel: 'HIGH',
            allocation: [],
            expectedReturn: 0,
            expectedVolatility: 0,
            sharpeRatio: 0
        };

        currentAssets.forEach(asset => {
            const typeInfo = this.assetTypes[asset.type] || this.assetTypes.other;
            let targetWeight = asset.allocation;

            // Increase high-return assets
            if (asset.type === 'equity' || asset.type === 'crypto') {
                targetWeight *= 1.5;
            }
            // Decrease conservative assets
            else if (asset.type === 'bonds' || asset.type === 'cash') {
                targetWeight *= 0.4;
            }

            aggressive.allocation.push({
                name: asset.name,
                type: asset.type,
                weight: targetWeight,
                change: targetWeight - asset.allocation
            });
        });

        // Normalize to 100%
        const aggressiveSum = aggressive.allocation.reduce((sum, a) => sum + a.weight, 0);
        aggressive.allocation = aggressive.allocation.map(a => ({
            ...a,
            weight: (a.weight / aggressiveSum) * 100,
            change: ((a.weight / aggressiveSum) * 100) - currentAssets.find(ca => ca.name === a.name).allocation
        }));

        // Calculate metrics
        aggressive.allocation.forEach(a => {
            const typeInfo = this.assetTypes[a.type] || this.assetTypes.other;
            aggressive.expectedReturn += (a.weight / 100) * typeInfo.expectedReturn;
            aggressive.expectedVolatility += Math.pow((a.weight / 100) * typeInfo.expectedVolatility, 2);
        });
        aggressive.expectedVolatility = Math.sqrt(aggressive.expectedVolatility);
        aggressive.sharpeRatio = (aggressive.expectedReturn - 2) / aggressive.expectedVolatility;

        strategies.push(aggressive);

        return strategies;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * RISK ANALYSIS
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeRisk() {
        const investmentData = await this.getInvestmentData();

        if (!investmentData || !investmentData.currentAllocation) {
            return this.getDataRequiredMessage();
        }

        const allocation = investmentData.currentAllocation;
        const assets = allocation.assets || [];

        // Calculate expected portfolio metrics
        let expectedReturn = 0;
        let expectedVolatility = 0;
        
        const byType = {};
        assets.forEach(asset => {
            if (!byType[asset.type]) byType[asset.type] = 0;
            byType[asset.type] += asset.allocation;
        });

        Object.entries(byType).forEach(([type, percent]) => {
            const typeInfo = this.assetTypes[type] || this.assetTypes.other;
            expectedReturn += (percent / 100) * typeInfo.expectedReturn;
            expectedVolatility += Math.pow((percent / 100) * typeInfo.expectedVolatility, 2);
        });
        expectedVolatility = Math.sqrt(expectedVolatility);

        const expectedSharpe = (expectedReturn - 2) / expectedVolatility;

        // Determine risk level
        let riskLevel, riskBadge, riskScore;
        if (expectedVolatility < this.thresholds.volatility.low) {
            riskLevel = 'Conservative';
            riskBadge = '🟢 LOW RISK';
            riskScore = 25;
        } else if (expectedVolatility < this.thresholds.volatility.moderate) {
            riskLevel = 'Moderate';
            riskBadge = '🟡 MEDIUM RISK';
            riskScore = 50;
        } else if (expectedVolatility < this.thresholds.volatility.high) {
            riskLevel = 'Aggressive';
            riskBadge = '🟠 HIGH RISK';
            riskScore = 75;
        } else {
            riskLevel = 'Very Aggressive';
            riskBadge = '🔴 VERY HIGH RISK';
            riskScore = 90;
        }

        let response = `⚠ **Portfolio Risk Analysis**\n\n`;

        response += `${riskBadge}\n`;
        response += `**Risk Level: ${riskLevel}** (Score: ${riskScore}/100)\n\n`;

        response += `📊 **Expected Risk Metrics:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• **Expected Return:** ${expectedReturn.toFixed(2)}% per year\n`;
        response += `• **Expected Volatility:** ${expectedVolatility.toFixed(2)}% per year\n`;
        response += `• **Expected Sharpe Ratio:** ${expectedSharpe.toFixed(2)} (${this.interpretSharpe(expectedSharpe)})\n\n`;

        // Get actual metrics if available
        let metrics = null;
        if (window.InvestmentAnalytics && investmentData.financialData.length > 0) {
            metrics = window.InvestmentAnalytics.calculateMetrics(investmentData.financialData);
            
            response += `📈 **Actual Historical Performance:**\n`;
            response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            response += `• **Annualized Return:** ${metrics.annualizedReturn.toFixed(2)}%\n`;
            response += `• **Volatility:** ${metrics.volatility.toFixed(2)}%\n`;
            response += `• **Sharpe Ratio:** ${metrics.sharpeRatio.toFixed(2)}\n`;
            response += `• **Sortino Ratio:** ${metrics.sortinoRatio.toFixed(2)}\n`;
            response += `• **Max Drawdown:** -${metrics.maxDrawdown.toFixed(2)}%\n`;
            response += `• **Calmar Ratio:** ${metrics.calmarRatio.toFixed(2)}\n`;
            response += `• **VaR 95%:** ${Math.abs(metrics.var95).toFixed(2)}%\n`;
            response += `• **CVaR 95%:** ${Math.abs(metrics.cvar95).toFixed(2)}%\n\n`;
        }

        // Risk Assessment
        response += `🔍 **Risk Assessment:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        if (expectedVolatility < this.thresholds.volatility.low) {
            response += `✅ **Low Volatility:** Your portfolio is expected to have stable, predictable returns with minimal fluctuations.\n\n`;
        } else if (expectedVolatility < this.thresholds.volatility.moderate) {
            response += `✓ **Moderate Volatility:** Your portfolio balances growth potential with acceptable risk levels.\n\n`;
        } else {
            response += `⚠ **High Volatility:** Your portfolio may experience significant short-term fluctuations. Ensure this aligns with your risk tolerance.\n\n`;
        }

        // Concentration risk
        const maxAllocation = Math.max(...assets.map(a => a.allocation));
        if (maxAllocation > this.thresholds.concentration.warning) {
            response += `⚠ **Concentration Risk:** ${maxAllocation.toFixed(1)}% in single asset increases portfolio-specific risk.\n\n`;
        }

        // Recommendations
        response += `💡 **Risk Management Recommendations:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        if (expectedVolatility > this.thresholds.volatility.moderate) {
            response += `• Consider increasing allocation to bonds or cash to reduce volatility\n`;
        }

        if (maxAllocation > this.thresholds.concentration.warning) {
            response += `• Reduce concentration by limiting max position to < ${this.thresholds.concentration.maxSingleAsset}%\n`;
        }

        if (expectedSharpe < this.thresholds.sharpe.good) {
            response += `• Optimize asset mix to improve risk-adjusted returns (target Sharpe > 1.0)\n`;
        }

        response += `• Regularly rebalance to maintain target allocations\n`;
        response += `• Monitor drawdowns and adjust if exceeding -20%\n\n`;

        response += `💬 Want to reduce risk? Ask: *"Optimize my portfolio"* or *"Apply conservative strategy"*`;

        return {
            text: response,
            charts: [],
            data: {
                riskLevel,
                riskScore,
                expectedReturn,
                expectedVolatility,
                expectedSharpe,
                metrics
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CHECK DIVERSIFICATION
     * ═══════════════════════════════════════════════════════════
     */
    async checkDiversification() {
        const investmentData = await this.getInvestmentData();

        if (!investmentData || !investmentData.currentAllocation) {
            return this.getDataRequiredMessage();
        }

        const allocation = investmentData.currentAllocation;
        const assets = allocation.assets || [];

        // Calculate diversification score
        let score = 0;
        const insights = [];

        // 1. Number of assets (0-30 points)
        const numAssets = assets.length;
        if (numAssets >= 10) {
            score += 30;
            insights.push('✅ Excellent number of assets (10+)');
        } else if (numAssets >= 5) {
            score += 20;
            insights.push('✓ Good number of assets (5-9)');
        } else if (numAssets >= 3) {
            score += 10;
            insights.push('⚠ Minimal diversification (3-4 assets)');
        } else {
            insights.push('❌ Insufficient diversification (< 3 assets)');
        }

        // 2. Asset class diversity (0-30 points)
        const types = new Set(assets.map(a => a.type));
        const numTypes = types.size;
        if (numTypes >= 5) {
            score += 30;
            insights.push('✅ Excellent asset class diversity (5+ types)');
        } else if (numTypes >= 3) {
            score += 20;
            insights.push('✓ Good asset class diversity (3-4 types)');
        } else if (numTypes >= 2) {
            score += 10;
            insights.push('⚠ Limited asset class diversity (2 types)');
        } else {
            insights.push('❌ No asset class diversity (1 type only)');
        }

        // 3. Balance (0-20 points)
        const maxAllocation = Math.max(...assets.map(a => a.allocation));
        if (maxAllocation <= 30) {
            score += 20;
            insights.push('✅ Well-balanced allocations (max 30%)');
        } else if (maxAllocation <= 50) {
            score += 15;
            insights.push('✓ Acceptable allocations (max 50%)');
        } else if (maxAllocation <= 70) {
            score += 5;
            insights.push('⚠ Concentrated allocation (max 70%)');
        } else {
            insights.push('❌ Over-concentrated (> 70% in one asset)');
        }

        // 4. No tiny allocations (0-10 points)
        const tinyAllocations = assets.filter(a => a.allocation < 5).length;
        if (tinyAllocations === 0) {
            score += 10;
            insights.push('✅ No insignificant allocations');
        } else {
            score += 5;
            insights.push(`⚠ ${tinyAllocations} asset(s) with < 5% allocation`);
        }

        // 5. Correlation (0-10 points - estimated)
        if (numTypes >= 3) {
            score += 10;
            insights.push('✅ Low estimated correlation (multiple asset types)');
        } else {
            score += 5;
            insights.push('⚠ Moderate estimated correlation');
        }

        // Determine rating
        let rating, badge;
        if (score >= 80) {
            rating = 'Excellent';
            badge = '🟢';
        } else if (score >= 60) {
            rating = 'Good';
            badge = '🟢';
        } else if (score >= 40) {
            rating = 'Acceptable';
            badge = '🟡';
        } else {
            rating = 'Needs Improvement';
            badge = '🔴';
        }

        let response = `📊 **Portfolio Diversification Analysis**\n\n`;

        response += `${badge} **Diversification Score: ${score}/100**\n`;
        response += `**Rating: ${rating}**\n\n`;

        response += `📋 **Portfolio Composition:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Total Assets: **${numAssets}**\n`;
        response += `• Asset Classes: **${numTypes}**\n`;
        response += `• Largest Position: **${maxAllocation.toFixed(1)}%**\n`;
        response += `• Positions < 5%: **${tinyAllocations}**\n\n`;

        response += `💡 **Diversification Insights:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        insights.forEach(insight => {
            response += `${insight}\n`;
        });
        response += `\n`;

        // Asset class breakdown
        const byType = {};
        assets.forEach(asset => {
            if (!byType[asset.type]) byType[asset.type] = { count: 0, allocation: 0 };
            byType[asset.type].count++;
            byType[asset.type].allocation += asset.allocation;
        });

        response += `📂 **Asset Class Breakdown:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        Object.entries(byType).sort((a, b) => b[1].allocation - a[1].allocation).forEach(([type, data]) => {
            const typeInfo = this.assetTypes[type] || this.assetTypes.other;
            response += `• **${typeInfo.name}**: ${data.allocation.toFixed(1)}% (${data.count} asset${data.count > 1 ? 's' : ''})\n`;
        });
        response += `\n`;

        // Recommendations
        if (score < this.thresholds.diversification.excellent) {
            response += `💡 **Recommendations to Improve Diversification:**\n`;
            response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

            if (numAssets < 5) {
                response += `• Add more assets to reach at least 5-7 holdings\n`;
            }

            if (numTypes < 3) {
                response += `• Include at least 3 different asset classes (e.g., equity, bonds, real estate)\n`;
            }

            if (maxAllocation > this.thresholds.concentration.maxSingleAsset) {
                response += `• Reduce largest position to < ${this.thresholds.concentration.maxSingleAsset}%\n`;
            }

            if (tinyAllocations > 2) {
                response += `• Consolidate small positions (< 5%) into larger holdings\n`;
            }

            response += `\n`;
        }

        response += `💬 Want help? Ask: *"Recommend assets to add"* or *"Optimize my portfolio"*`;

        return {
            text: response,
            charts: [],
            data: {
                score,
                rating,
                insights,
                breakdown: {
                    numAssets,
                    numTypes,
                    maxAllocation,
                    tinyAllocations
                },
                byType
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * COMPARE STRATEGIES
     * ═══════════════════════════════════════════════════════════
     */
    async compareStrategies() {
        const investmentData = await this.getInvestmentData();

        if (!investmentData || !investmentData.currentAllocation) {
            return this.getDataRequiredMessage();
        }

        const allocation = investmentData.currentAllocation;
        const assets = allocation.assets || [];

        if (assets.length < 2) {
            return {
                text: `⚠ Need at least 2 assets for strategy comparison.\n\nCurrent assets: ${assets.length}`,
                charts: [],
                data: null
            };
        }

        const strategies = this.generateOptimizedStrategies(assets);

        let response = `📊 **Investment Strategy Comparison**\n\n`;

        response += `We'll compare 3 AI-optimized strategies across key metrics:\n\n`;

        // Comparison table
        response += `| Metric | Conservative 🛡 | Balanced ⚖ | Aggressive 🚀 |\n`;
        response += `|--------|-----------------|-------------|----------------|\n`;
        response += `| **Expected Return** | ${strategies[0].expectedReturn.toFixed(2)}% | ${strategies[1].expectedReturn.toFixed(2)}% | ${strategies[2].expectedReturn.toFixed(2)}% |\n`;
        response += `| **Volatility** | ${strategies[0].expectedVolatility.toFixed(2)}% | ${strategies[1].expectedVolatility.toFixed(2)}% | ${strategies[2].expectedVolatility.toFixed(2)}% |\n`;
        response += `| **Sharpe Ratio** | ${strategies[0].sharpeRatio.toFixed(2)} | ${strategies[1].sharpeRatio.toFixed(2)} | ${strategies[2].sharpeRatio.toFixed(2)} |\n`;
        response += `| **Risk Level** | ${strategies[0].riskLevel} | ${strategies[1].riskLevel} | ${strategies[2].riskLevel} |\n\n`;

        // Key differences
        response += `🔍 **Key Differences:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `**🛡 Conservative:**\n`;
        response += `• Focus: Capital preservation\n`;
        response += `• Best for: Risk-averse investors, near retirement\n`;
        response += `• Volatility: Lowest (${strategies[0].expectedVolatility.toFixed(1)}%)\n`;
        response += `• Return: Modest (${strategies[0].expectedReturn.toFixed(1)}%)\n\n`;

        response += `**⚖ Balanced:**\n`;
        response += `• Focus: Optimal risk-adjusted returns\n`;
        response += `• Best for: Long-term investors, moderate risk tolerance\n`;
        response += `• Volatility: Moderate (${strategies[1].expectedVolatility.toFixed(1)}%)\n`;
        response += `• Return: Good (${strategies[1].expectedReturn.toFixed(1)}%)\n`;
        response += `• **Highest Sharpe Ratio** (${strategies[1].sharpeRatio.toFixed(2)})\n\n`;

        response += `**🚀 Aggressive:**\n`;
        response += `• Focus: Maximum growth\n`;
        response += `• Best for: Young investors, high risk tolerance\n`;
        response += `• Volatility: Highest (${strategies[2].expectedVolatility.toFixed(1)}%)\n`;
        response += `• Return: Highest (${strategies[2].expectedReturn.toFixed(1)}%)\n\n`;

        // 10-year projection
        response += `💰 **10-Year Projection** (€10,000 initial):\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        strategies.forEach(strategy => {
            const futureValue = 10000 * Math.pow(1 + strategy.expectedReturn / 100, 10);
            response += `• **${strategy.name}**: €${futureValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} (+${((futureValue - 10000) / 10000 * 100).toFixed(0)}%)\n`;
        });
        response += `\n`;

        // Recommendation
        const bestSharpe = strategies.reduce((best, s) => s.sharpeRatio > best.sharpeRatio ? s : best);
        response += `🎯 **AI Recommendation:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `Based on risk-adjusted returns, the **${bestSharpe.name}** strategy offers the best balance with a Sharpe Ratio of **${bestSharpe.sharpeRatio.toFixed(2)}**.\n\n`;

        response += `💬 To apply: *"Apply ${bestSharpe.name.toLowerCase()} strategy"* or visit Investment Analytics page`;

        return {
            text: response,
            charts: [],
            data: { strategies }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * BACKTEST STRATEGY
     * ═══════════════════════════════════════════════════════════
     */
    async backtestStrategy(entities) {
        const investmentData = await this.getInvestmentData();

        if (!investmentData || !investmentData.currentAllocation || !investmentData.financialData || investmentData.financialData.length < 12) {
            return {
                text: `⚠ **Insufficient Data for Backtesting**\n\nBacktesting requires:\n• At least 12 months of historical data\n• Linked budget simulation\n\nCurrent data: ${investmentData?.financialData?.length || 0} months\n\nPlease ensure your allocation is linked to a Budget Dashboard simulation with sufficient history.`,
                charts: [],
                data: null
            };
        }

        const years = entities.numbers && entities.numbers[0] ? Math.min(entities.numbers[0], 10) : 5;
        const allocation = investmentData.currentAllocation;
        const assets = allocation.assets || [];

        // Calculate expected metrics
        let expectedReturn = 0;
        let expectedVolatility = 0;
        
        assets.forEach(asset => {
            const typeInfo = this.assetTypes[asset.type] || this.assetTypes.other;
            expectedReturn += (asset.allocation / 100) * typeInfo.expectedReturn;
            expectedVolatility += Math.pow((asset.allocation / 100) * typeInfo.expectedVolatility, 2);
        });
        expectedVolatility = Math.sqrt(expectedVolatility);

        // Simulate backtest
        const months = years * 12;
        const initialValue = 10000;
        let currentValue = initialValue;
        const monthlyReturn = (expectedReturn / 100) / 12;
        const monthlyVol = (expectedVolatility / 100) / Math.sqrt(12);

        let totalGain = 0;
        let maxValue = initialValue;
        let maxDrawdown = 0;
        let positiveMonths = 0;

        for (let i = 0; i < months; i++) {
            // Random return with normal distribution
            const randomReturn = monthlyReturn + (Math.random() - 0.5) * 2 * monthlyVol;
            currentValue *= (1 + randomReturn);
            totalGain += currentValue * randomReturn;

            if (currentValue > maxValue) {
                maxValue = currentValue;
            }

            const drawdown = ((maxValue - currentValue) / maxValue) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }

            if (randomReturn > 0) {
                positiveMonths++;
            }
        }

        const totalReturn = ((currentValue - initialValue) / initialValue) * 100;
        const annualizedReturn = (Math.pow(currentValue / initialValue, 1 / years) - 1) * 100;
        const winRate = (positiveMonths / months) * 100;
        const sharpe = expectedVolatility > 0 ? (annualizedReturn - 2) / expectedVolatility : 0;

        let response = `📈 **Backtest Results** (${years}-Year Simulation)\n\n`;

        response += `📊 **Allocation: "${allocation.name}"**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Test Period: **${months} months** (${years} years)\n`;
        response += `• Initial Investment: **€${initialValue.toLocaleString()}**\n`;
        response += `• Strategy: ${assets.length} assets, ${new Set(assets.map(a => a.type)).size} asset classes\n\n`;

        response += `💰 **Performance Results:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• **Final Value:** €${Math.round(currentValue).toLocaleString()}\n`;
        response += `• **Total Return:** ${totalReturn.toFixed(2)}%\n`;
        response += `• **Annualized Return:** ${annualizedReturn.toFixed(2)}%\n`;
        response += `• **Expected Return:** ${expectedReturn.toFixed(2)}% (target)\n\n`;

        response += `📉 **Risk Metrics:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• **Volatility:** ${expectedVolatility.toFixed(2)}%\n`;
        response += `• **Max Drawdown:** -${maxDrawdown.toFixed(2)}%\n`;
        response += `• **Sharpe Ratio:** ${sharpe.toFixed(2)} (${this.interpretSharpe(sharpe)})\n`;
        response += `• **Win Rate:** ${winRate.toFixed(1)}% (${positiveMonths}/${months} months)\n\n`;

        response += `✅ **Key Insights:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        if (totalReturn > 50) {
            response += `• 🚀 Excellent performance: ${totalReturn.toFixed(0)}% gain over ${years} years\n`;
        } else if (totalReturn > 20) {
            response += `• ✅ Good performance: ${totalReturn.toFixed(0)}% gain over ${years} years\n`;
        } else if (totalReturn > 0) {
            response += `• ✓ Positive performance: ${totalReturn.toFixed(0)}% gain over ${years} years\n`;
        } else {
            response += `• ⚠ Negative performance: ${totalReturn.toFixed(0)}% loss over ${years} years\n`;
        }

        if (maxDrawdown < 15) {
            response += `• ✅ Low drawdown risk: Maximum decline was only ${maxDrawdown.toFixed(1)}%\n`;
        } else if (maxDrawdown < 30) {
            response += `• ⚠ Moderate drawdown risk: Maximum decline was ${maxDrawdown.toFixed(1)}%\n`;
        } else {
            response += `• 🔴 High drawdown risk: Maximum decline exceeded ${maxDrawdown.toFixed(1)}%\n`;
        }

        if (sharpe > 1.5) {
            response += `• ✅ Excellent risk-adjusted returns (Sharpe: ${sharpe.toFixed(2)})\n`;
        } else if (sharpe > 1.0) {
            response += `• ✓ Good risk-adjusted returns (Sharpe: ${sharpe.toFixed(2)})\n`;
        } else {
            response += `• ⚠ Modest risk-adjusted returns (Sharpe: ${sharpe.toFixed(2)})\n`;
        }

        response += `\n⚠ **Disclaimer:** This is a simulated backtest based on expected returns. Actual results may vary.`;

        return {
            text: response,
            charts: [],
            data: {
                years,
                initialValue,
                finalValue: currentValue,
                totalReturn,
                annualizedReturn,
                maxDrawdown,
                sharpe,
                winRate
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HELPER FUNCTIONS
     * ═══════════════════════════════════════════════════════════
     */
    interpretSharpe(sharpe) {
        if (sharpe > 3) return 'Excellent';
        if (sharpe > 2) return 'Very Good';
        if (sharpe > 1) return 'Good';
        if (sharpe > 0) return 'Acceptable';
        return 'Poor';
    }

    getDataRequiredMessage() {
        return {
            text: `📊 **Investment Data Required**\n\nI need access to your portfolio allocation to provide analysis.\n\n**Steps:**\n1. Visit the **Investment Analytics** page\n2. Create at least one asset allocation\n3. Link it to a Budget Dashboard simulation (optional but recommended)\n4. Return here for AI-powered insights\n\n**Or:**\nIf you have existing data, ensure:\n• Investment Analytics is loaded\n• At least one allocation exists\n• Data is saved to cloud\n\nNeed help? Ask: *"How do I create a portfolio allocation?"*`,
            charts: [],
            data: null
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ADDITIONAL FEATURES (Guidance Methods)
     * ═══════════════════════════════════════════════════════════
     */
    async showEfficientFrontier() {
        return {
            text: `📊 **Efficient Frontier Analysis**\n\nThe Efficient Frontier shows the optimal portfolio combinations that maximize returns for each level of risk.\n\n**To View:**\n1. Go to **Investment Analytics** page\n2. Scroll to **"Advanced AI Optimization"**\n3. Click **"Run Advanced AI Optimization"**\n4. View the **"Efficient Frontier"** chart\n\n**What You'll See:**\n• 🔵 Efficient portfolios (optimal risk/return combinations)\n• 🔴 Your current portfolio position\n• 🟢 Optimized strategies (Conservative, Balanced, Aggressive)\n\n**Key Insights:**\n• Portfolios on the frontier are optimal\n• Portfolios below the frontier are sub-optimal\n• Higher return = Higher risk (upward-right movement)\n\n💬 Or ask: *"Optimize my portfolio"* for AI recommendations`,
            charts: [],
            data: null
        };
    }

    async recommendAssets() {
        const investmentData = await this.getInvestmentData();

        if (!investmentData || !investmentData.currentAllocation) {
            return this.getDataRequiredMessage();
        }

        const allocation = investmentData.currentAllocation;
        const assets = allocation.assets || [];
        const existingTypes = new Set(assets.map(a => a.type));

        let response = `💡 **Asset Recommendations**\n\n`;

        response += `📊 **Current Portfolio:**\n`;
        response += `• ${assets.length} assets across ${existingTypes.size} asset classes\n\n`;

        response += `🎯 **Recommended Assets to Add:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Recommend missing asset classes
        const recommendations = [];

        if (!existingTypes.has('equity')) {
            recommendations.push({
                type: 'equity',
                examples: ['S&P 500 ETF (SPY)', 'Total Stock Market (VTI)', 'MSCI World Index'],
                reason: 'Core growth engine for long-term wealth building',
                targetAllocation: '40-70%'
            });
        }

        if (!existingTypes.has('bonds')) {
            recommendations.push({
                type: 'bonds',
                examples: ['Total Bond Market (AGG)', 'Treasury Bonds (TLT)', 'Corporate Bonds'],
                reason: 'Stability and income generation',
                targetAllocation: '20-40%'
            });
        }

        if (!existingTypes.has('real-estate')) {
            recommendations.push({
                type: 'real-estate',
                examples: ['Real Estate ETF (VNQ)', 'Global REIT Index', 'Property Funds'],
                reason: 'Diversification and inflation hedge',
                targetAllocation: '5-15%'
            });
        }

        if (!existingTypes.has('cash')) {
            recommendations.push({
                type: 'cash',
                examples: ['Money Market Funds', 'High-Yield Savings', 'Short-Term Treasury'],
                reason: 'Liquidity and emergency fund',
                targetAllocation: '5-10%'
            });
        }

        if (!existingTypes.has('commodities') && existingTypes.size >= 3) {
            recommendations.push({
                type: 'commodities',
                examples: ['Gold ETF (GLD)', 'Commodity Index', 'Energy Sector'],
                reason: 'Inflation protection and portfolio diversification',
                targetAllocation: '5-10%'
            });
        }

        if (recommendations.length === 0) {
            response += `✅ **Your portfolio already includes all major asset classes!**\n\n`;
            response += `Consider:\n`;
            response += `• Diversifying within asset classes (international vs domestic equity)\n`;
            response += `• Adding sector-specific funds (technology, healthcare, etc.)\n`;
            response += `• Including alternative investments (crypto, private equity)\n`;
        } else {
            recommendations.forEach((rec, index) => {
                const typeInfo = this.assetTypes[rec.type];
                response += `**${index + 1}. ${typeInfo.name}**\n`;
                response += `📌 **Why:** ${rec.reason}\n`;
                response += `📊 **Suggested Allocation:** ${rec.targetAllocation}\n`;
                response += `💼 **Examples:**\n`;
                rec.examples.forEach(ex => {
                    response += `   • ${ex}\n`;
                });
                response += `\n`;
            });
        }

        response += `💬 To add assets, visit **Investment Analytics** → **Current Allocation** → **Add Asset**`;

        return {
            text: response,
            charts: [],
            data: { recommendations }
        };
    }

    async rebalanceGuidance() {
        return {
            text: `⚖ **Portfolio Rebalancing Guide**\n\nRebalancing maintains your target allocation as markets fluctuate.\n\n**When to Rebalance:**\n• Quarterly or semi-annually\n• When allocation drifts >5% from target\n• After major market movements\n• Before/after major life events\n\n**How to Rebalance:**\n1. **Review Current Allocation**\n   Visit Investment Analytics to see current vs target\n\n2. **Identify Drifts**\n   Assets that grew >5% above target: SELL\n   Assets that fell >5% below target: BUY\n\n3. **Execute Trades**\n   • Sell overweight positions\n   • Buy underweight positions\n   • Consider tax implications\n\n4. **Use New Contributions**\n   Direct new money to underweight positions\n\n**Pro Tips:**\n• Rebalance in tax-advantaged accounts first\n• Use dividend reinvestment strategically\n• Combine with tax-loss harvesting\n• Avoid over-trading (costs matter)\n\n💬 Want specific guidance? Ask: *"Analyze my allocation"* or *"Optimize my portfolio"*`,
            charts: [],
            data: null
        };
    }

    async projectPortfolio(entities) {
        const investmentData = await this.getInvestmentData();

        if (!investmentData || !investmentData.currentAllocation) {
            return this.getDataRequiredMessage();
        }

        const years = entities.numbers && entities.numbers[0] ? entities.numbers[0] : 10;
        const allocation = investmentData.currentAllocation;
        const assets = allocation.assets || [];

        // Calculate expected return
        let expectedReturn = 0;
        assets.forEach(asset => {
            const typeInfo = this.assetTypes[asset.type] || this.assetTypes.other;
            expectedReturn += (asset.allocation / 100) * typeInfo.expectedReturn;
        });

        const initialValue = 10000;
        const monthlyContribution = 500;
        const months = years * 12;

        // Projection with contributions
        let portfolio = initialValue;
        for (let i = 0; i < months; i++) {
            portfolio = (portfolio + monthlyContribution) * (1 + expectedReturn / 100 / 12);
        }

        const totalContributed = initialValue + (monthlyContribution * months);
        const totalGains = portfolio - totalContributed;

        let response = `🔮 **${years}-Year Portfolio Projection**\n\n`;

        response += `📊 **Allocation: "${allocation.name}"**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Expected Return: **${expectedReturn.toFixed(2)}%** per year\n`;
        response += `• Time Horizon: **${years} years** (${months} months)\n\n`;

        response += `💰 **Projection Results:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Initial Investment: **€${initialValue.toLocaleString()}**\n`;
        response += `• Monthly Contribution: **€${monthlyContribution.toLocaleString()}**\n`;
        response += `• Total Contributed: **€${totalContributed.toLocaleString()}**\n`;
        response += `• **Final Portfolio Value: €${Math.round(portfolio).toLocaleString()}**\n`;
        response += `• **Total Gains: €${Math.round(totalGains).toLocaleString()}**\n`;
        response += `• **Total Return: ${((totalGains / totalContributed) * 100).toFixed(1)}%**\n\n`;

        response += `📈 **Milestones:**\n`;
        const milestones = [
            { name: '€25,000', value: 25000 },
            { name: '€50,000', value: 50000 },
            { name: '€100,000', value: 100000 },
            { name: '€250,000', value: 250000 }
        ];

        milestones.forEach(milestone => {
            if (portfolio >= milestone.value) {
                response += `• ✅ **${milestone.name}** achieved\n`;
            } else {
                const monthsNeeded = Math.log(milestone.value / portfolio) / Math.log(1 + expectedReturn / 100 / 12);
                if (monthsNeeded > 0 && monthsNeeded < 360) {
                    response += `• 🎯 **${milestone.name}** in ~${Math.ceil(monthsNeeded / 12)} more years\n`;
                }
            }
        });

        response += `\n⚠ **Disclaimer:** Projections based on expected returns. Actual results will vary with market conditions.`;

        return {
            text: response,
            charts: [],
            data: {
                years,
                expectedReturn,
                finalValue: portfolio,
                totalGains
            }
        };
    }

    async analyzeCorrelation() {
        return {
            text: `📊 **Asset Correlation Analysis**\n\nCorrelation measures how assets move together:\n• **+1.0** = Perfect positive correlation (move together)\n• **0.0** = No correlation (independent)\n• **-1.0** = Perfect negative correlation (move opposite)\n\n**To View Correlation Matrix:**\n1. Go to **Investment Analytics** page\n2. Scroll to **"Correlation Matrix"** chart\n3. See color-coded correlation heatmap\n\n**Interpretation:**\n• 🟢 **Green (0.7 to 1.0):** Strong positive correlation\n• 🟡 **Yellow (0.3 to 0.7):** Moderate correlation\n• 🟠 **Orange (0.0 to 0.3):** Weak correlation\n• 🔴 **Red (-1.0 to 0.0):** Negative correlation\n\n**Diversification Tips:**\n• Aim for correlations < 0.7 between assets\n• Mix asset classes with low correlation\n• Negative correlation provides best hedge\n\n💬 Example: Stocks & bonds typically have low/negative correlation, making them good diversifiers.`,
            charts: [],
            data: null
        };
    }

    async applyStrategyGuidance(entities) {
        return {
            text: `🎯 **Apply Investment Strategy**\n\nTo apply an AI-optimized strategy to your portfolio:\n\n**Steps:**\n1. Go to **Investment Analytics** page\n2. Click **"Advanced AI Optimization"** button\n3. Wait for analysis to complete (~10 seconds)\n4. Review the 4 generated strategies:\n   • Conservative 🛡\n   • Balanced ⚖\n   • Aggressive 🚀\n   • AI Custom 🤖\n\n5. Click **"Apply Strategy"** on your preferred option\n6. Confirm the changes\n7. Your allocation will be updated automatically\n\n**What Happens:**\n• Asset weights are adjusted to match strategy\n• Total allocation remains 100%\n• Previous allocation is preserved (you can revert)\n\n**Recommendations:**\n• Review backtest results before applying\n• Consider your risk tolerance and time horizon\n• Start with Balanced if unsure\n\n💬 Or ask me: *"Compare conservative vs aggressive strategy"*`,
            charts: [],
            data: null
        };
    }

    async compareAllocations() {
        const investmentData = await this.getInvestmentData();

        if (!investmentData || !investmentData.allocations || investmentData.allocations.length < 2) {
            return {
                text: `📊 **Allocation Comparison Unavailable**\n\nYou need at least 2 saved allocations to compare.\n\nCurrent saved allocations: ${investmentData?.allocations?.length || 0}\n\n**To Create More Allocations:**\n1. Go to **Investment Analytics** page\n2. Click **"Create New Allocation"**\n3. Define a different asset mix\n4. Save and return here\n\n💬 Or ask: *"How do I create multiple allocations?"*`,
                charts: [],
                data: null
            };
        }

        const allocations = investmentData.allocations;

        let response = `📊 **Portfolio Allocations Comparison**\n\n`;

        response += `You have **${allocations.length}** saved allocations. Here's a summary:\n\n`;

        allocations.slice(0, 4).forEach((alloc, index) => {
            const totalAlloc = alloc.assets.reduce((sum, a) => sum + a.allocation, 0);
            const numTypes = new Set(alloc.assets.map(a => a.type)).size;
            const isCurrent = alloc.id === investmentData.currentAllocation.id;

            response += `**${index + 1}. ${alloc.name}** ${isCurrent ? '✅ (Active)' : ''}\n`;
            response += `• Assets: ${alloc.assets.length} | Asset Classes: ${numTypes}\n`;
            response += `• Total Allocated: ${totalAlloc.toFixed(1)}%\n`;
            if (alloc.linkedSimulation) {
                response += `• Linked to: ${alloc.linkedSimulation}\n`;
            }
            response += `\n`;
        });

        response += `**To Compare Visually:**\n`;
        response += `1. Go to **Investment Analytics** page\n`;
        response += `2. Scroll to **"Saved Allocations"** section\n`;
        response += `3. Click **"Compare Allocations"**\n`;
        response += `4. Select allocations to compare\n`;
        response += `5. View side-by-side breakdown & chart\n\n`;

        response += `💬 Need help deciding? Ask: *"Which allocation is best?"*`;

        return {
            text: response,
            charts: [],
            data: { allocations }
        };
    }

    async exportDataGuidance() {
        return {
            text: `📄 **Export Investment Report**\n\nYou can export a comprehensive PDF report of your portfolio.\n\n**To Export:**\n1. Go to **Investment Analytics** page\n2. Scroll to bottom of page\n3. Click **"Export PDF Report"** button\n4. Report will download automatically\n\n**Report Includes:**\n• Portfolio summary\n• Asset allocation breakdown\n• Performance metrics (Sharpe, Sortino, etc.)\n• Risk analysis\n• Charts and visualizations\n• Diversification score\n\n**Alternative: JSON Export**\n• For data portability, you can also export raw JSON\n• Useful for importing into other tools\n• Contains all allocation details\n\n💬 The report is timestamped and can be saved for record-keeping.`,
            charts: [],
            data: null
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HELP MESSAGE
     * ═══════════════════════════════════════════════════════════
     */
    getInvestmentHelp() {
        return {
            text: `📊 **Investment Manager - Complete Guide**\n\n` +
                  `I'm your AI investment advisor with complete access to your portfolio data.\n\n` +
                  
                  `💼 **Portfolio Overview & Analysis:**\n` +
                  `• "Show my portfolio"\n` +
                  `• "Analyze my allocation"\n` +
                  `• "Portfolio health check"\n` +
                  `• "Compare my allocations"\n\n` +
                  
                  `🤖 **AI Optimization:**\n` +
                  `• "Optimize my portfolio"\n` +
                  `• "Show efficient frontier"\n` +
                  `• "Compare conservative vs aggressive"\n` +
                  `• "Apply balanced strategy"\n\n` +
                  
                  `⚠ **Risk & Diversification:**\n` +
                  `• "Analyze risk"\n` +
                  `• "Check diversification"\n` +
                  `• "What's my Sharpe ratio?"\n` +
                  `• "Show correlation matrix"\n\n` +
                  
                  `📈 **Projections & Backtest:**\n` +
                  `• "Project my portfolio for 10 years"\n` +
                  `• "Backtest for 5 years"\n` +
                  `• "What if I invest €500/month?"\n` +
                  `• "Show historical performance"\n\n` +
                  
                  `💡 **Recommendations:**\n` +
                  `• "Recommend assets to add"\n` +
                  `• "How do I rebalance?"\n` +
                  `• "Which strategy is best?"\n` +
                  `• "Reduce my risk"\n\n` +
                  
                  `⚡ **Quick Actions:**\n` +
                  `• Allocation analysis\n` +
                  `• Risk assessment\n` +
                  `• Strategy comparison\n` +
                  `• Performance projection\n\n` +
                  
                  `💬 Just ask naturally - I understand context!`,
            charts: [],
            data: null
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotInvestmentManager;
}

if (typeof window !== 'undefined') {
    window.ChatbotInvestmentManager = ChatbotInvestmentManager;
}

console.log('✅ ChatbotInvestmentManager Ultra v5.0 loaded - Full Investment Analytics integration active');