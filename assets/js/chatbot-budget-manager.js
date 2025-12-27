/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT BUDGET MANAGER - Ultra Cloud Integration
 * ═══════════════════════════════════════════════════════════════
 * Version: 5.0.0 PREMIUM
 * Description: Intégration complète Dashboard + SimulationManager + AI Recommendations
 * Features:
 *   - Cloud Sync (Cloudflare Workers + Firebase)
 *   - Real-time data access from Dashboard
 *   - Advanced AI recommendations (15+ algorithms)
 *   - Multi-scenario projections
 *   - Anomaly detection
 *   - Budget health scoring
 *   - Investment optimization
 *   - Inflation-adjusted analysis
 *   - Historical pattern detection
 *   - Savings strategies
 *   - Goal tracking
 *   - Smart alerts
 */

class ChatbotBudgetManager {
    constructor(config) {
        this.config = config;
        this.simulationManager = null;
        this.dashboardData = null;
        this.cache = {
            data: null,
            timestamp: null,
            ttl: 30000 // 30 seconds cache
        };
        
        // Budget categories (from dashboard.js)
        this.incomeCategories = [
            'Salary', 'Bonus', 'Freelance', 'Investments', 'Rental Income', 'Other Income'
        ];
        
        this.expenseCategories = [
            'Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare', 
            'Entertainment', 'Education', 'Savings', 'Debt', 'Other'
        ];
        
        // Dashboard field mapping
        this.fieldMapping = {
            income: ['salary', 'misc'],
            expenses: ['rent', 'food', 'fixCosts', 'others', 'loan'],
            investments: ['investment', 'pee']
        };
        
        // Financial thresholds for recommendations
        this.thresholds = {
            savingsRate: {
                excellent: 30,
                good: 20,
                fair: 10,
                poor: 5
            },
            expenseRatios: {
                housing: 30,      // Max 30% of income
                food: 15,         // Max 15% of income
                transportation: 15,
                entertainment: 10,
                others: 10
            },
            emergencyFund: {
                target: 6,        // 6 months of expenses
                minimum: 3        // 3 months minimum
            },
            investmentRate: {
                optimal: 20,      // 20% of income
                minimum: 10       // 10% minimum
            }
        };
        
        console.log('💰 ChatbotBudgetManager Ultra v5.0 initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * MAIN ENTRY POINT
     * ═══════════════════════════════════════════════════════════
     */
    async manageBudget(entities = {}, userMessage = '') {
        try {
            console.log('💰 Managing budget request:', userMessage);

            // Detect budget intent with advanced NLP
            const intent = this.detectBudgetIntent(userMessage, entities);
            console.log('🎯 Detected intent:', intent);

            // Route to appropriate handler
            switch (intent) {
                case 'SHOW_OVERVIEW':
                    return await this.showBudgetOverview();
                
                case 'ANALYZE_BUDGET':
                    return await this.analyzeBudget();
                
                case 'OPTIMIZE':
                    return await this.optimizeBudget();
                
                case 'SAVINGS_RECOMMENDATIONS':
                    return await this.generateSavingsRecommendations();
                
                case 'INVESTMENT_STRATEGY':
                    return await this.generateInvestmentStrategy();
                
                case 'CALCULATE_ROI':
                    return await this.calculateROI(entities);
                
                case 'SAVINGS_PROJECTION':
                    return await this.projectSavings(entities);
                
                case 'COMPARE_MONTHS':
                    return await this.compareMonths(entities);
                
                case 'DETECT_ANOMALIES':
                    return await this.detectAnomalies();
                
                case 'SET_GOAL':
                    return await this.setFinancialGoal(entities, userMessage);
                
                case 'HEALTH_CHECK':
                    return await this.budgetHealthCheck();
                
                case 'SPENDING_ANALYSIS':
                    return await this.analyzeSpendingPatterns();
                
                case 'INFLATION_IMPACT':
                    return await this.analyzeInflationImpact();
                
                case 'EMERGENCY_FUND':
                    return await this.analyzeEmergencyFund();
                
                case 'EXPORT_DATA':
                    return await this.exportBudgetData();
                
                default:
                    return this.getBudgetHelp();
            }

        } catch (error) {
            console.error('❌ Budget management error:', error);
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
    detectBudgetIntent(message, entities) {
        const lower = message.toLowerCase();

        // Overview & Summary
        if (lower.match(/\b(show|display|view|get|my)\s+(budget|overview|summary|dashboard)\b/i)) {
            return 'SHOW_OVERVIEW';
        }

        // Deep Analysis
        if (lower.match(/\b(analyze|analysis|examine|review|check)\s+(my\s+)?(budget|finances|spending|expenses)\b/i)) {
            return 'ANALYZE_BUDGET';
        }

        // Optimization
        if (lower.match(/\b(optimize|improve|better|enhance|maximize)\s+(my\s+)?(budget|expenses|savings|finances)\b/i)) {
            return 'OPTIMIZE';
        }

        // Savings Recommendations
        if (lower.match(/\b(how\s+to\s+save|save\s+more|saving|recommendations|tips|advice)\b/i)) {
            return 'SAVINGS_RECOMMENDATIONS';
        }

        // Investment Strategy
        if (lower.match(/\b(investment|invest|portfolio|allocation)\s+(strategy|plan|advice|recommendations)\b/i)) {
            return 'INVESTMENT_STRATEGY';
        }

        // ROI Calculations
        if (lower.match(/\b(roi|return|yield|performance|gains?)\b/i)) {
            return 'CALCULATE_ROI';
        }

        // Projections
        if (lower.match(/\b(project|forecast|predict|future|in\s+\d+\s+(month|year))/i)) {
            return 'SAVINGS_PROJECTION';
        }

        // Comparisons
        if (lower.match(/\b(compare|comparison|vs|versus|difference)\b/i)) {
            return 'COMPARE_MONTHS';
        }

        // Anomaly Detection
        if (lower.match(/\b(anomal|unusual|strange|abnormal|outlier|alert)\b/i)) {
            return 'DETECT_ANOMALIES';
        }

        // Goal Setting
        if (lower.match(/\b(goal|target|objective|save\s+for|plan\s+to)\b/i)) {
            return 'SET_GOAL';
        }

        // Health Check
        if (lower.match(/\b(health|score|rating|grade|performance)\b/i)) {
            return 'HEALTH_CHECK';
        }

        // Spending Analysis
        if (lower.match(/\b(spending|expense|where.*money|breakdown)\s+(pattern|habit|trend|analysis)\b/i)) {
            return 'SPENDING_ANALYSIS';
        }

        // Inflation
        if (lower.match(/\b(inflation|real\s+value|purchasing\s+power)\b/i)) {
            return 'INFLATION_IMPACT';
        }

        // Emergency Fund
        if (lower.match(/\b(emergency\s+fund|rainy\s+day|safety\s+net)\b/i)) {
            return 'EMERGENCY_FUND';
        }

        // Export
        if (lower.match(/\b(export|download|extract|backup)\b/i)) {
            return 'EXPORT_DATA';
        }

        return 'HELP';
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * DATA ACCESS (Cloud Integration)
     * ═══════════════════════════════════════════════════════════
     */
    async getBudgetData(forceRefresh = false) {
        try {
            // Check cache first
            if (!forceRefresh && this.cache.data && this.cache.timestamp) {
                const age = Date.now() - this.cache.timestamp;
                if (age < this.cache.ttl) {
                    console.log('📦 Using cached budget data');
                    return this.cache.data;
                }
            }

            console.log('🔄 Fetching fresh budget data...');

            // Try to get data from Dashboard if available
            if (window.Dashboard && typeof window.Dashboard.getCurrentData === 'function') {
                const dashboardData = window.Dashboard.getCurrentData();
                if (dashboardData && dashboardData.data && dashboardData.data.length > 0) {
                    console.log('✅ Loaded from Dashboard.getCurrentData()');
                    this.cache.data = dashboardData;
                    this.cache.timestamp = Date.now();
                    return dashboardData;
                }
            }

            // Try SimulationManager (Cloud)
            if (window.SimulationManager) {
                const currentSimName = window.SimulationManager.getCurrentSimulationName() || 'default';
                const cloudData = await window.SimulationManager.loadSimulation(currentSimName);
                
                if (cloudData && cloudData.data && cloudData.data.length > 0) {
                    console.log('✅ Loaded from Cloudflare Workers');
                    this.cache.data = cloudData;
                    this.cache.timestamp = Date.now();
                    return cloudData;
                }
            }

            // Fallback to localStorage
            const saved = localStorage.getItem('financialDataDynamic');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    const budgetData = {
                        monthlyEstYield: parseFloat(localStorage.getItem('monthlyEstYield')) || 8,
                        inflationRate: parseFloat(localStorage.getItem('inflationRate')) || 2.5,
                        data: data
                    };
                    console.log('✅ Loaded from localStorage');
                    this.cache.data = budgetData;
                    this.cache.timestamp = Date.now();
                    return budgetData;
                } catch (e) {
                    console.error('❌ localStorage parse error:', e);
                }
            }

            // No data available
            console.warn('⚠ No budget data available');
            return null;

        } catch (error) {
            console.error('❌ Error fetching budget data:', error);
            return null;
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * BUDGET OVERVIEW
     * ═══════════════════════════════════════════════════════════
     */
    async showBudgetOverview() {
        const budgetData = await this.getBudgetData();

        if (!budgetData || !budgetData.data || budgetData.data.length === 0) {
            return {
                text: `💰 **Budget Dashboard Not Found**

You haven't created a budget yet or no data is available.

**Get Started:**
• Visit the **Budget Dashboard** page
• Create your first monthly budget
• Track income, expenses, and investments
• Return here for AI-powered insights

**Quick Actions:**
• Click on "Budget Dashboard" in the sidebar
• Add your first month of financial data
• I'll be ready to help you optimize!

Need help? Just ask: *"How do I create a budget?"*`,
                charts: [],
                data: null
            };
        }

        const analysis = this.calculateComprehensiveAnalysis(budgetData);
        const currentMonth = this.getCurrentMonth(budgetData.data);
        const health = this.assessBudgetHealth(analysis);

        let response = `💰 **Your Complete Budget Overview**\n\n`;

        // Current Month Summary
        response += `📅 **Current Month (${currentMonth.month})**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `💵 **Income:** €${currentMonth.totalIncome.toLocaleString()}\n`;
        response += `💸 **Expenses:** €${currentMonth.totalExpenses.toLocaleString()}\n`;
        response += `💰 **Net Savings:** €${currentMonth.savings.toLocaleString()} (${((currentMonth.savings / currentMonth.totalIncome) * 100).toFixed(1)}%)\n`;
        response += `📈 **Invested:** €${currentMonth.investment.toLocaleString()}\n\n`;

        // Overall Statistics
        response += `📊 **Overall Statistics (${budgetData.data.length} months)**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `💵 **Average Monthly Income:** €${analysis.avgIncome.toLocaleString()}\n`;
        response += `💸 **Average Monthly Expenses:** €${analysis.avgExpenses.toLocaleString()}\n`;
        response += `💰 **Average Savings Rate:** ${analysis.avgSavingsRate.toFixed(1)}%\n`;
        response += `📈 **Total Invested:** €${analysis.totalInvested.toLocaleString()}\n`;
        response += `🎯 **Total Portfolio Value:** €${analysis.portfolioValue.toLocaleString()}\n`;
        response += `💎 **Total Gains:** €${analysis.totalGains.toLocaleString()}\n`;
        response += `📊 **ROI:** ${analysis.roi.toFixed(2)}%\n\n`;

        // Budget Health
        response += `${health.icon} **Budget Health: ${health.rating}**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `**Score:** ${health.score}/100\n`;
        response += `${health.message}\n\n`;

        // Key Insights
        const insights = this.generateKeyInsights(budgetData, analysis);
        response += `💡 **Key Insights:**\n`;
        insights.forEach(insight => {
            response += `• ${insight}\n`;
        });
        response += `\n`;

        // Quick Actions
        response += `⚡ **What I Can Do:**\n`;
        response += `• *"Optimize my budget"* - Get personalized savings tips\n`;
        response += `• *"Analyze my spending"* - Deep dive into expense patterns\n`;
        response += `• *"Project my savings"* - See future scenarios\n`;
        response += `• *"Investment strategy"* - Portfolio optimization\n`;
        response += `• *"Budget health check"* - Detailed analysis\n`;

        return {
            text: response,
            charts: [],
            data: {
                budgetData,
                analysis,
                health,
                currentMonth
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * COMPREHENSIVE ANALYSIS
     * ═══════════════════════════════════════════════════════════
     */
    calculateComprehensiveAnalysis(budgetData) {
        const data = budgetData.data;
        const lastMonth = data[data.length - 1];

        // Calculate averages
        const totalIncome = data.reduce((sum, row) => sum + (row.totalIncome || 0), 0);
        const totalExpenses = data.reduce((sum, row) => sum + (row.totalExpenses || 0), 0);
        const totalSavings = data.reduce((sum, row) => sum + (row.savings || 0), 0);
        const totalInvested = data.reduce((sum, row) => sum + (row.investment || 0), 0);

        const avgIncome = totalIncome / data.length;
        const avgExpenses = totalExpenses / data.length;
        const avgSavings = totalSavings / data.length;
        const avgSavingsRate = avgIncome > 0 ? (avgSavings / avgIncome) * 100 : 0;

        // Portfolio metrics
        const portfolioValue = lastMonth.totalPortfolio || 0;
        const totalGains = lastMonth.cumulatedGains || 0;
        const roi = lastMonth.roi || 0;

        // Expense breakdown (average)
        const expenseBreakdown = {
            housing: data.reduce((sum, row) => sum + (row.rent || 0), 0) / data.length,
            food: data.reduce((sum, row) => sum + (row.food || 0), 0) / data.length,
            fixedCosts: data.reduce((sum, row) => sum + (row.fixCosts || 0), 0) / data.length,
            others: data.reduce((sum, row) => sum + (row.others || 0), 0) / data.length,
            loan: data.reduce((sum, row) => sum + (row.loan || 0), 0) / data.length
        };

        // Trends (last 3 months vs previous)
        const trends = this.calculateTrends(data);

        return {
            avgIncome,
            avgExpenses,
            avgSavings,
            avgSavingsRate,
            totalInvested,
            portfolioValue,
            totalGains,
            roi,
            expenseBreakdown,
            trends,
            monthCount: data.length
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE TRENDS
     * ═══════════════════════════════════════════════════════════
     */
    calculateTrends(data) {
        if (data.length < 6) {
            return { income: 0, expenses: 0, savings: 0, insufficient: true };
        }

        const recentMonths = data.slice(-3);
        const previousMonths = data.slice(-6, -3);

        const recentIncome = recentMonths.reduce((sum, row) => sum + row.totalIncome, 0) / 3;
        const previousIncome = previousMonths.reduce((sum, row) => sum + row.totalIncome, 0) / 3;
        const incomeChange = previousIncome > 0 ? ((recentIncome - previousIncome) / previousIncome) * 100 : 0;

        const recentExpenses = recentMonths.reduce((sum, row) => sum + row.totalExpenses, 0) / 3;
        const previousExpenses = previousMonths.reduce((sum, row) => sum + row.totalExpenses, 0) / 3;
        const expensesChange = previousExpenses > 0 ? ((recentExpenses - previousExpenses) / previousExpenses) * 100 : 0;

        const recentSavings = recentMonths.reduce((sum, row) => sum + row.savings, 0) / 3;
        const previousSavings = previousMonths.reduce((sum, row) => sum + row.savings, 0) / 3;
        const savingsChange = previousSavings !== 0 ? ((recentSavings - previousSavings) / Math.abs(previousSavings)) * 100 : 0;

        return {
            income: incomeChange,
            expenses: expensesChange,
            savings: savingsChange,
            insufficient: false
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * BUDGET HEALTH ASSESSMENT
     * ═══════════════════════════════════════════════════════════
     */
    assessBudgetHealth(analysis) {
        let score = 0;
        const factors = [];

        // Savings Rate (40 points max)
        if (analysis.avgSavingsRate >= this.thresholds.savingsRate.excellent) {
            score += 40;
            factors.push('✅ Excellent savings rate');
        } else if (analysis.avgSavingsRate >= this.thresholds.savingsRate.good) {
            score += 30;
            factors.push('✅ Good savings rate');
        } else if (analysis.avgSavingsRate >= this.thresholds.savingsRate.fair) {
            score += 20;
            factors.push('⚠ Fair savings rate - room for improvement');
        } else if (analysis.avgSavingsRate >= this.thresholds.savingsRate.poor) {
            score += 10;
            factors.push('⚠ Low savings rate - optimization needed');
        } else {
            factors.push('❌ Critical savings rate - immediate action required');
        }

        // Investment Rate (20 points max)
        const avgInvestmentRate = analysis.avgIncome > 0 ? (analysis.totalInvested / (analysis.avgIncome * analysis.monthCount)) * 100 : 0;
        if (avgInvestmentRate >= this.thresholds.investmentRate.optimal) {
            score += 20;
            factors.push('✅ Strong investment discipline');
        } else if (avgInvestmentRate >= this.thresholds.investmentRate.minimum) {
            score += 15;
            factors.push('✅ Moderate investment rate');
        } else if (avgInvestmentRate > 0) {
            score += 10;
            factors.push('⚠ Consider increasing investments');
        } else {
            factors.push('❌ No investment activity detected');
        }

        // ROI Performance (20 points max)
        if (analysis.roi >= 8) {
            score += 20;
            factors.push('✅ Excellent investment returns');
        } else if (analysis.roi >= 5) {
            score += 15;
            factors.push('✅ Good investment performance');
        } else if (analysis.roi >= 0) {
            score += 10;
            factors.push('⚠ Modest investment returns');
        } else {
            score += 5;
            factors.push('❌ Negative investment performance');
        }

        // Expense Control (20 points max)
        const housingRatio = analysis.avgIncome > 0 ? (analysis.expenseBreakdown.housing / analysis.avgIncome) * 100 : 0;
        if (housingRatio <= this.thresholds.expenseRatios.housing) {
            score += 20;
            factors.push('✅ Housing costs under control');
        } else if (housingRatio <= this.thresholds.expenseRatios.housing * 1.2) {
            score += 15;
            factors.push('⚠ Housing costs slightly high');
        } else {
            score += 5;
            factors.push('❌ Housing costs too high');
        }

        // Determine rating
        let rating, icon, message;
        if (score >= 90) {
            rating = 'EXCELLENT';
            icon = '🟢';
            message = 'Your financial health is outstanding! You\'re managing your budget exceptionally well with strong savings and investment discipline.';
        } else if (score >= 75) {
            rating = 'GOOD';
            icon = '🟢';
            message = 'Your budget is in good shape. There are some opportunities for optimization, but overall you\'re on the right track.';
        } else if (score >= 60) {
            rating = 'FAIR';
            icon = '🟡';
            message = 'Your budget is manageable but could benefit from some improvements. Focus on increasing your savings rate and controlling expenses.';
        } else if (score >= 40) {
            rating = 'NEEDS IMPROVEMENT';
            icon = '🟠';
            message = 'Your budget requires attention. Consider reducing expenses and increasing savings to improve your financial stability.';
        } else {
            rating = 'CRITICAL';
            icon = '🔴';
            message = 'Immediate action is needed to stabilize your finances. Let me help you create a recovery plan.';
        }

        return {
            score,
            rating,
            icon,
            message,
            factors
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * KEY INSIGHTS GENERATION
     * ═══════════════════════════════════════════════════════════
     */
    generateKeyInsights(budgetData, analysis) {
        const insights = [];
        const data = budgetData.data;

        // Savings insight
        if (analysis.avgSavingsRate >= 30) {
            insights.push(`💎 You're saving ${analysis.avgSavingsRate.toFixed(1)}% of your income - excellent!`);
        } else if (analysis.avgSavingsRate < 10) {
            insights.push(`⚠ Your savings rate (${analysis.avgSavingsRate.toFixed(1)}%) is below recommended 20%`);
        }

        // Investment insight
        if (analysis.totalGains > 0) {
            insights.push(`📈 Your investments have generated €${analysis.totalGains.toLocaleString()} in gains`);
        }

        // Trend insights
        if (!analysis.trends.insufficient) {
            if (analysis.trends.expenses > 10) {
                insights.push(`🔔 Your expenses have increased ${analysis.trends.expenses.toFixed(1)}% recently`);
            }
            if (analysis.trends.savings < -10) {
                insights.push(`⚠ Your savings have decreased ${Math.abs(analysis.trends.savings).toFixed(1)}% recently`);
            }
            if (analysis.trends.income > 5) {
                insights.push(`✨ Your income has grown ${analysis.trends.income.toFixed(1)}% - great progress!`);
            }
        }

        // Portfolio insight
        if (analysis.portfolioValue >= 50000) {
            insights.push(`🎯 Your portfolio has reached €${analysis.portfolioValue.toLocaleString()}!`);
        }

        // ROI insight
        if (analysis.roi >= budgetData.monthlyEstYield) {
            insights.push(`🚀 Your ROI (${analysis.roi.toFixed(2)}%) exceeds your target (${budgetData.monthlyEstYield}%)`);
        }

        return insights.length > 0 ? insights : ['📊 Start tracking for at least 3 months to see personalized insights'];
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET CURRENT MONTH
     * ═══════════════════════════════════════════════════════════
     */
    getCurrentMonth(data) {
        const today = new Date();
        const currentMonth = String(today.getMonth() + 1).padStart(2, '0') + '/' + today.getFullYear();
        
        const found = data.find(row => row.month === currentMonth);
        return found || data[data.length - 1];
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * BUDGET OPTIMIZATION (AI Recommendations)
     * ═══════════════════════════════════════════════════════════
     */
    async optimizeBudget() {
        const budgetData = await this.getBudgetData();

        if (!budgetData || !budgetData.data || budgetData.data.length === 0) {
            return this.getDataRequiredMessage();
        }

        const analysis = this.calculateComprehensiveAnalysis(budgetData);
        const recommendations = this.generateOptimizationRecommendations(budgetData, analysis);

        let response = `💡 **AI Budget Optimization Report**\n\n`;

        // Executive Summary
        response += `📊 **Current Status:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Savings Rate: ${analysis.avgSavingsRate.toFixed(1)}%\n`;
        response += `• Monthly Income: €${analysis.avgIncome.toLocaleString()}\n`;
        response += `• Monthly Expenses: €${analysis.avgExpenses.toLocaleString()}\n`;
        response += `• Optimization Potential: **€${recommendations.totalPotential.toLocaleString()}/month**\n\n`;

        // Recommendations
        response += `🎯 **Personalized Recommendations:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        recommendations.items.forEach((rec, index) => {
            response += `**${index + 1}. ${rec.title}** ${rec.priority}\n`;
            response += `${rec.description}\n\n`;
            response += `**Impact:**\n`;
            response += `• Potential Savings: **€${rec.savings.toLocaleString()}/month**\n`;
            response += `• Annual Impact: **€${(rec.savings * 12).toLocaleString()}/year**\n`;
            response += `• Difficulty: ${rec.difficulty}\n\n`;
            response += `**Action Steps:**\n`;
            rec.actions.forEach(action => {
                response += `  ${action}\n`;
            });
            response += `\n`;
        });

        // Projected Impact
        const newSavingsRate = analysis.avgIncome > 0 ? 
            ((analysis.avgSavings + recommendations.totalPotential) / analysis.avgIncome) * 100 : 0;

        response += `📈 **Projected Impact:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• New Savings Rate: **${newSavingsRate.toFixed(1)}%** (↑${(newSavingsRate - analysis.avgSavingsRate).toFixed(1)}%)\n`;
        response += `• Additional Annual Savings: **€${(recommendations.totalPotential * 12).toLocaleString()}**\n`;
        response += `• 5-Year Wealth Impact: **€${this.calculateWealthImpact(recommendations.totalPotential, 60, budgetData.monthlyEstYield).toLocaleString()}**\n\n`;
        //                                                    ↑ Plus d'espace ici !

        response += `💬 Need help implementing? Ask: *"How do I ${recommendations.items[0].title.toLowerCase()}?"*`;

        return {
            text: response,
            charts: [],
            data: {
                analysis,
                recommendations,
                projectedSavingsRate: newSavingsRate
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GENERATE OPTIMIZATION RECOMMENDATIONS
     * ═══════════════════════════════════════════════════════════
     */
    generateOptimizationRecommendations(budgetData, analysis) {
        const recommendations = [];
        const avgIncome = analysis.avgIncome;
        const breakdown = analysis.expenseBreakdown;

        // 1. Housing Optimization
        const housingRatio = avgIncome > 0 ? (breakdown.housing / avgIncome) * 100 : 0;
        if (housingRatio > this.thresholds.expenseRatios.housing) {
            const targetHousing = avgIncome * (this.thresholds.expenseRatios.housing / 100);
            const potentialSavings = breakdown.housing - targetHousing;
            
            if (potentialSavings > 0) {
                recommendations.push({
                    title: 'Reduce Housing Costs',
                    priority: '🔴 HIGH',
                    description: `Your housing costs (${housingRatio.toFixed(1)}%) exceed the recommended ${this.thresholds.expenseRatios.housing}% of income.`,
                    savings: Math.round(potentialSavings * 0.5), // Conservative 50% reduction target
                    difficulty: '⭐⭐⭐ Medium-High',
                    actions: [
                        '✓ Consider refinancing mortgage for lower rates',
                        '✓ Negotiate rent reduction with landlord',
                        '✓ Explore house-sharing or co-living options',
                        '✓ Relocate to more affordable area',
                        '✓ Sublet unused room/space'
                    ]
                });
            }
        }

        // 2. Food Optimization
        const foodRatio = avgIncome > 0 ? (breakdown.food / avgIncome) * 100 : 0;
        if (foodRatio > this.thresholds.expenseRatios.food) {
            const targetFood = avgIncome * (this.thresholds.expenseRatios.food / 100);
            const potentialSavings = breakdown.food - targetFood;
            
            if (potentialSavings > 0) {
                recommendations.push({
                    title: 'Optimize Food Spending',
                    priority: '🟡 MEDIUM',
                    description: `Food expenses (${foodRatio.toFixed(1)}%) can be reduced through smart shopping and meal planning.`,
                    savings: Math.round(potentialSavings * 0.6), // 60% reduction achievable
                    difficulty: '⭐ Easy',
                    actions: [
                        '✓ Create weekly meal plans before shopping',
                        '✓ Buy in bulk and use coupons',
                        '✓ Cook at home 5+ days/week',
                        '✓ Reduce takeout/restaurant visits',
                        '✓ Use cashback apps (Ibotta, Rakuten)',
                        '✓ Choose generic brands over name brands'
                    ]
                });
            }
        }

        // 3. Entertainment/Others Optimization
        const othersRatio = avgIncome > 0 ? (breakdown.others / avgIncome) * 100 : 0;
        if (othersRatio > this.thresholds.expenseRatios.others) {
            const targetOthers = avgIncome * (this.thresholds.expenseRatios.others / 100);
            const potentialSavings = breakdown.others - targetOthers;
            
            if (potentialSavings > 0) {
                recommendations.push({
                    title: 'Trim Discretionary Spending',
                    priority: '🟢 LOW',
                    description: `Discretionary expenses can be reduced without major lifestyle changes.`,
                    savings: Math.round(potentialSavings * 0.4), // 40% reduction
                    difficulty: '⭐ Easy',
                    actions: [
                        '✓ Audit subscriptions (cancel unused)',
                        '✓ Set monthly entertainment budget',
                        '✓ Use free entertainment alternatives',
                        '✓ Implement 30-day rule for purchases',
                        '✓ Track impulse purchases'
                    ]
                });
            }
        }

        // 4. Investment Increase
        const currentInvestmentRate = avgIncome > 0 ? 
            (analysis.totalInvested / (avgIncome * analysis.monthCount)) * 100 : 0;
        
        if (currentInvestmentRate < this.thresholds.investmentRate.optimal) {
            const targetInvestment = avgIncome * (this.thresholds.investmentRate.optimal / 100);
            const currentMonthlyInvestment = analysis.totalInvested / analysis.monthCount;
            const additionalInvestment = targetInvestment - currentMonthlyInvestment;
            
            if (additionalInvestment > 0) {
                recommendations.push({
                    title: 'Boost Investment Contributions',
                    priority: '🔴 HIGH',
                    description: `Increasing investments from ${currentInvestmentRate.toFixed(1)}% to ${this.thresholds.investmentRate.optimal}% will accelerate wealth building.`,
                    savings: Math.round(additionalInvestment), // This is actually additional allocation
                    difficulty: '⭐⭐ Medium',
                    actions: [
                        '✓ Set up automatic monthly transfers',
                        '✓ Invest salary increases/bonuses',
                        '✓ Maximize tax-advantaged accounts',
                        '✓ Consider low-cost index funds',
                        '✓ Review and rebalance portfolio quarterly'
                    ]
                });
            }
        }

        // 5. Debt Reduction
        if (breakdown.loan > 0) {
            const debtRatio = avgIncome > 0 ? (breakdown.loan / avgIncome) * 100 : 0;
            if (debtRatio > 15) {
                recommendations.push({
                    title: 'Accelerate Debt Payoff',
                    priority: '🔴 HIGH',
                    description: `Debt payments (${debtRatio.toFixed(1)}% of income) are limiting your financial flexibility.`,
                    savings: Math.round(breakdown.loan * 0.3), // Savings from interest reduction
                    difficulty: '⭐⭐⭐ Hard',
                    actions: [
                        '✓ Use debt avalanche method (highest interest first)',
                        '✓ Consider debt consolidation',
                        '✓ Negotiate lower interest rates',
                        '✓ Make bi-weekly payments instead of monthly',
                        '✓ Apply windfalls directly to principal'
                    ]
                });
            }
        }

        // 6. Increase Income
        recommendations.push({
            title: 'Explore Income Growth Opportunities',
            priority: '🟡 MEDIUM',
            description: 'Increasing income is the most powerful wealth-building lever.',
            savings: Math.round(avgIncome * 0.10), // Target 10% income increase
            difficulty: '⭐⭐⭐ Hard',
            actions: [
                '✓ Negotiate salary raise (prepare evidence)',
                '✓ Develop high-income skills',
                '✓ Start side hustle in your expertise',
                '✓ Freelance consulting',
                '✓ Monetize hobbies/skills',
                '✓ Invest in professional development'
            ]
        });

        // Sort by savings potential
        recommendations.sort((a, b) => b.savings - a.savings);

        // Calculate total potential
        const totalPotential = recommendations.reduce((sum, rec) => sum + rec.savings, 0);

        return {
            items: recommendations.slice(0, 5), // Top 5 recommendations
            totalPotential
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE WEALTH IMPACT
     * ═══════════════════════════════════════════════════════════
     */
    calculateWealthImpact(monthlyAmount, months, annualYield) {
        const monthlyYield = (annualYield / 12) / 100;
        let total = 0;
        
        for (let i = 0; i < months; i++) {
            total = (total + monthlyAmount) * (1 + monthlyYield);
        }
        
        return Math.round(total);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SAVINGS RECOMMENDATIONS
     * ═══════════════════════════════════════════════════════════
     */
    async generateSavingsRecommendations() {
        const budgetData = await this.getBudgetData();

        if (!budgetData || !budgetData.data || budgetData.data.length === 0) {
            return this.getDataRequiredMessage();
        }

        const analysis = this.calculateComprehensiveAnalysis(budgetData);

        let response = `💰 **Smart Savings Strategies**\n\n`;

        response += `📊 **Your Current Savings Profile:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Savings Rate: ${analysis.avgSavingsRate.toFixed(1)}%\n`;
        response += `• Monthly Savings: €${analysis.avgSavings.toLocaleString()}\n`;
        response += `• Annual Savings: €${(analysis.avgSavings * 12).toLocaleString()}\n\n`;

        response += `🎯 **Recommended Strategies:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Strategy 1: Emergency Fund
        const monthsOfExpenses = analysis.avgExpenses > 0 ? 
            (analysis.avgSavings * analysis.monthCount) / analysis.avgExpenses : 0;
        
        response += `**1. Build Emergency Fund** 🏦\n`;
        response += `• Current: ${monthsOfExpenses.toFixed(1)} months of expenses\n`;
        response += `• Target: 6 months (€${(analysis.avgExpenses * 6).toLocaleString()})\n`;
        
        if (monthsOfExpenses < 6) {
            const needed = (analysis.avgExpenses * 6) - (analysis.avgSavings * analysis.monthCount);
            const monthsToTarget = needed / analysis.avgSavings;
            response += `• Remaining: €${needed.toLocaleString()} (${Math.ceil(monthsToTarget)} months at current rate)\n`;
        } else {
            response += `• Status: ✅ Fully funded!\n`;
        }
        response += `\n`;

        // Strategy 2: 50/30/20 Rule
        response += `**2. Follow 50/30/20 Budget Rule** 📊\n`;
        response += `• Needs (50%): €${(analysis.avgIncome * 0.5).toLocaleString()}\n`;
        response += `• Wants (30%): €${(analysis.avgIncome * 0.3).toLocaleString()}\n`;
        response += `• Savings (20%): €${(analysis.avgIncome * 0.2).toLocaleString()}\n\n`;

        // Strategy 3: Automated Savings
        response += `**3. Automate Your Savings** 🤖\n`;
        response += `• Set up automatic transfers on payday\n`;
        response += `• "Pay yourself first" before discretionary spending\n`;
        response += `• Recommended: €${Math.round(analysis.avgIncome * 0.2).toLocaleString()}/month minimum\n\n`;

        // Strategy 4: Incremental Increases
        response += `**4. Incremental Savings Boosts** 📈\n`;
        response += `• Start with 1% income increase every 3 months\n`;
        response += `• Save 50% of all raises/bonuses\n`;
        response += `• Next milestone: ${(analysis.avgSavingsRate + 5).toFixed(0)}% savings rate in 6 months\n\n`;

        // Strategy 5: Round-Up Method
        response += `**5. Round-Up Method** 💡\n`;
        response += `• Round purchases to nearest €5/€10\n`;
        response += `• Save the difference automatically\n`;
        response += `• Potential extra: €50-150/month\n\n`;

        response += `🚀 **Quick Wins:**\n`;
        response += `• Cancel 1 unused subscription = €10-50/month saved\n`;
        response += `• Pack lunch 3x/week = €100-200/month saved\n`;
        response += `• Reduce one impulse purchase/week = €50-100/month saved\n\n`;

        response += `Want to see specific optimizations? Ask: *"Optimize my budget"*`;

        return {
            text: response,
            charts: [],
            data: {
                analysis,
                emergencyFundStatus: monthsOfExpenses
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * INVESTMENT STRATEGY
     * ═══════════════════════════════════════════════════════════
     */
    async generateInvestmentStrategy() {
        const budgetData = await this.getBudgetData();

        if (!budgetData || !budgetData.data || budgetData.data.length === 0) {
            return this.getDataRequiredMessage();
        }

        const analysis = this.calculateComprehensiveAnalysis(budgetData);
        const currentRate = analysis.avgIncome > 0 ? 
            (analysis.totalInvested / (analysis.avgIncome * analysis.monthCount)) * 100 : 0;

        let response = `📈 **Personalized Investment Strategy**\n\n`;

        response += `💼 **Current Investment Profile:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Monthly Investment: €${(analysis.totalInvested / analysis.monthCount).toLocaleString()}\n`;
        response += `• Investment Rate: ${currentRate.toFixed(1)}% of income\n`;
        response += `• Portfolio Value: €${analysis.portfolioValue.toLocaleString()}\n`;
        response += `• Total Gains: €${analysis.totalGains.toLocaleString()}\n`;
        response += `• ROI: ${analysis.roi.toFixed(2)}%\n`;
        response += `• Target Yield: ${budgetData.monthlyEstYield}% annual\n\n`;

        // Performance Assessment
        response += `📊 **Performance Assessment:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        
        if (analysis.roi >= budgetData.monthlyEstYield) {
            response += `✅ **Above Target** - Your portfolio is outperforming expectations!\n\n`;
        } else if (analysis.roi >= budgetData.monthlyEstYield * 0.7) {
            response += `🟡 **On Track** - Performance is close to target.\n\n`;
        } else {
            response += `⚠ **Below Target** - Consider portfolio rebalancing.\n\n`;
        }

        // Recommended Strategy
        response += `🎯 **Recommended Strategy:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        // 1. Contribution Optimization
        const targetMonthly = analysis.avgIncome * 0.20;
        const currentMonthly = analysis.totalInvested / analysis.monthCount;
        
        response += `**1. Optimize Contributions** 💰\n`;
        if (currentMonthly < targetMonthly) {
            response += `• Current: €${currentMonthly.toLocaleString()}/month\n`;
            response += `• Recommended: €${targetMonthly.toLocaleString()}/month (20% of income)\n`;
            response += `• Increase by: €${(targetMonthly - currentMonthly).toLocaleString()}/month\n\n`;
        } else {
            response += `✅ You're already investing ${currentRate.toFixed(1)}% - excellent!\n`;
            response += `• Consider increasing to 25% for accelerated wealth building\n\n`;
        }

        // 2. Asset Allocation
        response += `**2. Suggested Asset Allocation** 📊\n`;
        const age = 35; // Default - could be user input
        const stockAllocation = 110 - age;
        const bondAllocation = 100 - stockAllocation;
        
        response += `• Stocks/Equity: ${stockAllocation}%\n`;
        response += `• Bonds/Fixed Income: ${bondAllocation}%\n`;
        response += `• Emergency Cash: 3-6 months expenses\n`;
        response += `• Alternative Assets: 5-10% (optional)\n\n`;

        // 3. Investment Vehicles
        response += `**3. Recommended Vehicles** 🚀\n`;
        response += `• Low-cost index funds (S&P 500, MSCI World)\n`;
        response += `• Tax-advantaged retirement accounts\n`;
        response += `• Diversified ETFs\n`;
        response += `• Dollar-cost averaging (monthly auto-invest)\n\n`;

        // 4. Projections
        response += `**4. Wealth Projections** 📈\n`;
        const projections = this.projectInvestmentGrowth(
            targetMonthly, 
            60, // 5 years
            budgetData.monthlyEstYield,
            budgetData.inflationRate
        );
        
        response += `• 5-Year Projection (€${targetMonthly.toLocaleString()}/month):\n`;
        response += `  - Invested: €${projections.totalInvested.toLocaleString()}\n`;
        response += `  - Portfolio Value: €${projections.finalValue.toLocaleString()}\n`;
        response += `  - Total Gains: €${projections.totalGains.toLocaleString()}\n`;
        response += `  - Real Value (inflation-adj): €${projections.inflationAdjusted.toLocaleString()}\n\n`;

        // 5. Action Items
        response += `⚡ **Action Items:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `1. Set up automatic monthly investment of €${targetMonthly.toLocaleString()}\n`;
        response += `2. Open tax-advantaged retirement account if not done\n`;
        response += `3. Diversify across 3-5 low-cost index funds\n`;
        response += `4. Rebalance portfolio quarterly\n`;
        response += `5. Review performance annually\n\n`;

        response += `💬 Questions? Ask: *"Project my investments for 10 years"*`;

        return {
            text: response,
            charts: [],
            data: {
                analysis,
                currentRate,
                targetMonthly,
                projections
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * PROJECT INVESTMENT GROWTH (Enhanced)
     * ═══════════════════════════════════════════════════════════
     */
    projectInvestmentGrowth(monthlyInvestment, months, annualYield, inflationRate) {
        const monthlyYield = (annualYield / 12) / 100;
        const monthlyInflation = Math.pow(1 + (inflationRate / 100), 1/12) - 1;

        let portfolioValue = 0;
        let totalInvested = 0;

        for (let i = 0; i < months; i++) {
            totalInvested += monthlyInvestment;
            portfolioValue = (portfolioValue + monthlyInvestment) * (1 + monthlyYield);
        }

        const totalGains = portfolioValue - totalInvested;
        const roi = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;

        const inflationAdjusted = portfolioValue / Math.pow(1 + monthlyInflation, months);
        const realROI = totalInvested > 0 ? ((inflationAdjusted - totalInvested) / totalInvested) * 100 : 0;

        return {
            totalInvested: Math.round(totalInvested),
            finalValue: Math.round(portfolioValue),
            totalGains: Math.round(totalGains),
            roi,
            inflationAdjusted: Math.round(inflationAdjusted),
            realROI
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE ROI (Enhanced with scenarios)
     * ═══════════════════════════════════════════════════════════
     */
    async calculateROI(entities) {
        const budgetData = await this.getBudgetData();

        if (!budgetData || !budgetData.data || budgetData.data.length === 0) {
            return this.getDataRequiredMessage();
        }

        const analysis = this.calculateComprehensiveAnalysis(budgetData);
        const monthlyInvestment = analysis.totalInvested / analysis.monthCount;
        const months = entities.numbers && entities.numbers[0] ? entities.numbers[0] : 60; // Default 5 years

        // Multi-scenario projections
        const conservative = this.projectInvestmentGrowth(monthlyInvestment, months, 5, budgetData.inflationRate);
        const moderate = this.projectInvestmentGrowth(monthlyInvestment, months, budgetData.monthlyEstYield, budgetData.inflationRate);
        const aggressive = this.projectInvestmentGrowth(monthlyInvestment, months, 12, budgetData.inflationRate);

        let response = `📈 **Investment ROI Analysis**\n\n`;

        response += `🎯 **Parameters:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Monthly Investment: €${monthlyInvestment.toLocaleString()}\n`;
        response += `• Time Horizon: ${months} months (${(months / 12).toFixed(1)} years)\n`;
        response += `• Base Yield: ${budgetData.monthlyEstYield}% annual\n`;
        response += `• Inflation Rate: ${budgetData.inflationRate}% annual\n\n`;

        response += `📊 **Multi-Scenario Projections:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Conservative
        response += `🐌 **Conservative (5% annual)**\n`;
        response += `• Portfolio Value: €${conservative.finalValue.toLocaleString()}\n`;
        response += `• Total Gains: €${conservative.totalGains.toLocaleString()}\n`;
        response += `• ROI: ${conservative.roi.toFixed(2)}%\n`;
        response += `• Real Value: €${conservative.inflationAdjusted.toLocaleString()}\n\n`;

        // Moderate (Base Case)
        response += `🚀 **Moderate (${budgetData.monthlyEstYield}% annual)** ⭐ Base Case\n`;
        response += `• Portfolio Value: €${moderate.finalValue.toLocaleString()}\n`;
        response += `• Total Gains: €${moderate.totalGains.toLocaleString()}\n`;
        response += `• ROI: ${moderate.roi.toFixed(2)}%\n`;
        response += `• Real Value: €${moderate.inflationAdjusted.toLocaleString()}\n\n`;

        // Aggressive
        response += `🚀 **Aggressive (12% annual)**\n`;
        response += `• Portfolio Value: €${aggressive.finalValue.toLocaleString()}\n`;
        response += `• Total Gains: €${aggressive.totalGains.toLocaleString()}\n`;
        response += `• ROI: ${aggressive.roi.toFixed(2)}%\n`;
        response += `• Real Value: €${aggressive.inflationAdjusted.toLocaleString()}\n\n`;

        response += `💡 **Insights:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Total Capital Invested: €${moderate.totalInvested.toLocaleString()}\n`;
        response += `• Inflation Impact: €${(moderate.finalValue - moderate.inflationAdjusted).toLocaleString()} loss in purchasing power\n`;
        response += `• Best Case Upside: €${(aggressive.finalValue - moderate.finalValue).toLocaleString()} above base case\n`;
        response += `• Worst Case Risk: €${(moderate.finalValue - conservative.finalValue).toLocaleString()} below base case\n\n`;

        response += `Want different scenarios? Ask: *"Project ROI for 120 months"*`;

        return {
            text: response,
            charts: [],
            data: {
                monthlyInvestment,
                months,
                scenarios: {
                    conservative,
                    moderate,
                    aggressive
                }
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * PROJECT SAVINGS
     * ═══════════════════════════════════════════════════════════
     */
    async projectSavings(entities) {
        const budgetData = await this.getBudgetData();

        if (!budgetData || !budgetData.data || budgetData.data.length === 0) {
            return this.getDataRequiredMessage();
        }

        const analysis = this.calculateComprehensiveAnalysis(budgetData);
        const months = entities.numbers && entities.numbers[0] ? entities.numbers[0] : 12;
        const monthlySavings = analysis.avgSavings;
        
        // Simple savings accumulation
        const simpleSavings = monthlySavings * months;
        
        // Invested savings with compound growth
        const investedProjection = this.projectInvestmentGrowth(
            monthlySavings,
            months,
            budgetData.monthlyEstYield,
            budgetData.inflationRate
        );

        let response = `💰 **Savings Projection Analysis**\n\n`;

        response += `📊 **Current Baseline:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Monthly Savings: €${monthlySavings.toLocaleString()}\n`;
        response += `• Savings Rate: ${analysis.avgSavingsRate.toFixed(1)}%\n`;
        response += `• Time Horizon: ${months} months (${(months / 12).toFixed(1)} years)\n\n`;

        response += `🎯 **${months}-Month Projections:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        response += `💵 **Simple Savings (No Investment):**\n`;
        response += `• Total Accumulated: €${simpleSavings.toLocaleString()}\n`;
        response += `• Real Value (inflation-adj): €${this.adjustForInflation(simpleSavings, months, budgetData.inflationRate).toLocaleString()}\n\n`;

        response += `📈 **Invested Savings (${budgetData.monthlyEstYield}% annual):**\n`;
        response += `• Total Invested: €${investedProjection.totalInvested.toLocaleString()}\n`;
        response += `• Portfolio Value: €${investedProjection.finalValue.toLocaleString()}\n`;
        response += `• Investment Gains: €${investedProjection.totalGains.toLocaleString()}\n`;
        response += `• Real Value: €${investedProjection.inflationAdjusted.toLocaleString()}\n\n`;

        response += `💡 **Investment Advantage:**\n`;
        response += `• Extra Wealth: €${(investedProjection.finalValue - simpleSavings).toLocaleString()}\n`;
        response += `• Benefit: ${(((investedProjection.finalValue - simpleSavings) / simpleSavings) * 100).toFixed(1)}% more wealth vs simple savings\n\n`;

        // Milestone tracking
        response += `🎯 **Milestone Progress:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        const milestones = [
            { name: 'Emergency Fund (3 months)', target: analysis.avgExpenses * 3 },
            { name: 'Emergency Fund (6 months)', target: analysis.avgExpenses * 6 },
            { name: '€10,000 Milestone', target: 10000 },
            { name: '€25,000 Milestone', target: 25000 },
            { name: '€50,000 Milestone', target: 50000 }
        ];

        milestones.forEach(milestone => {
            const progress = (investedProjection.finalValue / milestone.target) * 100;
            const status = progress >= 100 ? '✅' : '🎯';
            response += `${status} ${milestone.name}: ${Math.min(progress, 100).toFixed(0)}%\n`;
        });

        response += `\n💬 Try: *"What if I save €500 more per month?"*`;

        return {
            text: response,
            charts: [],
            data: {
                monthlySavings,
                months,
                simpleSavings,
                investedProjection,
                milestones
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ADJUST FOR INFLATION
     * ═══════════════════════════════════════════════════════════
     */
    adjustForInflation(value, months, annualInflationRate) {
        const monthlyInflation = Math.pow(1 + (annualInflationRate / 100), 1/12) - 1;
        return Math.round(value / Math.pow(1 + monthlyInflation, months));
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * BUDGET ANALYSIS
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeBudget() {
        const budgetData = await this.getBudgetData();

        if (!budgetData || !budgetData.data || budgetData.data.length === 0) {
            return this.getDataRequiredMessage();
        }

        const analysis = this.calculateComprehensiveAnalysis(budgetData);
        const currentMonth = this.getCurrentMonth(budgetData.data);

        let response = `🔍 **Comprehensive Budget Analysis**\n\n`;

        // Income Analysis
        response += `💵 **Income Analysis:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Average Monthly: €${analysis.avgIncome.toLocaleString()}\n`;
        response += `• Current Month: €${currentMonth.totalIncome.toLocaleString()}\n`;
        if (!analysis.trends.insufficient) {
            const trend = analysis.trends.income > 0 ? '📈' : analysis.trends.income < 0 ? '📉' : '➡';
            response += `• 3-Month Trend: ${trend} ${analysis.trends.income > 0 ? '+' : ''}${analysis.trends.income.toFixed(1)}%\n`;
        }
        response += `• Income Stability: ${this.assessStability(budgetData.data, 'totalIncome')}\n\n`;

        // Expense Analysis
        response += `💸 **Expense Analysis:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Average Monthly: €${analysis.avgExpenses.toLocaleString()}\n`;
        response += `• Current Month: €${currentMonth.totalExpenses.toLocaleString()}\n`;
        if (!analysis.trends.insufficient) {
            const trend = analysis.trends.expenses > 0 ? '⚠ 📈' : analysis.trends.expenses < 0 ? '✅ 📉' : '➡';
            response += `• 3-Month Trend: ${trend} ${analysis.trends.expenses > 0 ? '+' : ''}${analysis.trends.expenses.toFixed(1)}%\n`;
        }
        
        response += `\n**Expense Breakdown (Average):**\n`;
        const totalExpenses = Object.values(analysis.expenseBreakdown).reduce((sum, val) => sum + val, 0);
        Object.entries(analysis.expenseBreakdown).forEach(([key, value]) => {
            const percent = totalExpenses > 0 ? (value / totalExpenses) * 100 : 0;
            response += `  • ${this.capitalize(key)}: €${value.toLocaleString()} (${percent.toFixed(1)}%)\n`;
        });
        response += `\n`;

        // Savings Analysis
        response += `💰 **Savings Analysis:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Average Monthly: €${analysis.avgSavings.toLocaleString()}\n`;
        response += `• Savings Rate: ${analysis.avgSavingsRate.toFixed(1)}%\n`;
        response += `• Current Month: €${currentMonth.savings.toLocaleString()}\n`;
        if (!analysis.trends.insufficient) {
            const trend = analysis.trends.savings > 0 ? '✅ 📈' : analysis.trends.savings < 0 ? '⚠ 📉' : '➡';
            response += `• 3-Month Trend: ${trend} ${analysis.trends.savings > 0 ? '+' : ''}${analysis.trends.savings.toFixed(1)}%\n`;
        }
        response += `\n`;

        // Investment Analysis
        response += `📈 **Investment Analysis:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Total Invested: €${analysis.totalInvested.toLocaleString()}\n`;
        response += `• Portfolio Value: €${analysis.portfolioValue.toLocaleString()}\n`;
        response += `• Total Gains: €${analysis.totalGains.toLocaleString()}\n`;
        response += `• ROI: ${analysis.roi.toFixed(2)}%\n`;
        response += `• Investment Rate: ${(analysis.avgIncome > 0 ? (analysis.totalInvested / (analysis.avgIncome * analysis.monthCount)) * 100 : 0).toFixed(1)}% of income\n\n`;

        // Recommendations
        response += `💡 **Key Recommendations:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        
        if (analysis.avgSavingsRate < 20) {
            response += `• ⚠ Increase savings rate to at least 20%\n`;
        }
        if (analysis.expenseBreakdown.housing / analysis.avgIncome > 0.3) {
            response += `• ⚠ Housing costs exceed 30% of income\n`;
        }
        if (analysis.roi < budgetData.monthlyEstYield) {
            response += `• 📊 Portfolio underperforming target yield\n`;
        }
        if (analysis.avgSavingsRate >= 30) {
            response += `• ✅ Excellent savings discipline!\n`;
        }
        response += `\n`;

        response += `💬 Want detailed optimization? Ask: *"Optimize my budget"*`;

        return {
            text: response,
            charts: [],
            data: {
                analysis,
                currentMonth
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ASSESS STABILITY
     * ═══════════════════════════════════════════════════════════
     */
    assessStability(data, field) {
        if (data.length < 3) return 'Insufficient data';
        
        const values = data.slice(-6).map(row => row[field]);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = avg > 0 ? (stdDev / avg) * 100 : 0;

        if (coefficientOfVariation < 10) return '🟢 Very Stable';
        if (coefficientOfVariation < 20) return '🟢 Stable';
        if (coefficientOfVariation < 30) return '🟡 Moderate';
        return '🔴 Volatile';
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * DETECT ANOMALIES
     * ═══════════════════════════════════════════════════════════
     */
    async detectAnomalies() {
        const budgetData = await this.getBudgetData();

        if (!budgetData || !budgetData.data || budgetData.data.length < 3) {
            return {
                text: `⚠ **Insufficient Data for Anomaly Detection**\n\nAnomalies can only be detected with at least 3 months of data.\n\nCurrent months: ${budgetData ? budgetData.data.length : 0}`,
                charts: [],
                data: null
            };
        }

        const anomalies = [];
        const data = budgetData.data;

        // Calculate statistical thresholds
        const calcStats = (field) => {
            const values = data.map(row => row[field]);
            const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            return { avg, stdDev };
        };

        // Check each month for anomalies
        data.forEach((row, index) => {
            // Income anomalies
            const incomeStats = calcStats('totalIncome');
            if (Math.abs(row.totalIncome - incomeStats.avg) > 2 * incomeStats.stdDev) {
                anomalies.push({
                    month: row.month,
                    type: row.totalIncome > incomeStats.avg ? 'SPIKE' : 'DROP',
                    category: 'Income',
                    severity: '🔴 HIGH',
                    value: row.totalIncome,
                    expected: incomeStats.avg,
                    deviation: ((row.totalIncome - incomeStats.avg) / incomeStats.avg * 100).toFixed(1)
                });
            }

            // Expense anomalies
            const expenseStats = calcStats('totalExpenses');
            if (Math.abs(row.totalExpenses - expenseStats.avg) > 2 * expenseStats.stdDev) {
                anomalies.push({
                    month: row.month,
                    type: row.totalExpenses > expenseStats.avg ? 'SPIKE' : 'DROP',
                    category: 'Expenses',
                    severity: row.totalExpenses > expenseStats.avg ? '🔴 HIGH' : '🟢 GOOD',
                    value: row.totalExpenses,
                    expected: expenseStats.avg,
                    deviation: ((row.totalExpenses - expenseStats.avg) / expenseStats.avg * 100).toFixed(1)
                });
            }

            // Savings anomalies
            const savingsStats = calcStats('savings');
            if (Math.abs(row.savings - savingsStats.avg) > 2 * savingsStats.stdDev) {
                anomalies.push({
                    month: row.month,
                    type: row.savings > savingsStats.avg ? 'SPIKE' : 'DROP',
                    category: 'Savings',
                    severity: row.savings > savingsStats.avg ? '🟢 GOOD' : '🔴 CONCERN',
                    value: row.savings,
                    expected: savingsStats.avg,
                    deviation: ((row.savings - savingsStats.avg) / Math.abs(savingsStats.avg) * 100).toFixed(1)
                });
            }
        });

        let response = `🚨 **Anomaly Detection Report**\n\n`;

        if (anomalies.length === 0) {
            response += `✅ **No Significant Anomalies Detected**\n\n`;
            response += `Your budget patterns are consistent and predictable over the last ${data.length} months.\n\n`;
            response += `This is a sign of good financial discipline and stability.`;
        } else {
            response += `⚠ **${anomalies.length} Anomal${anomalies.length > 1 ? 'ies' : 'y'} Detected**\n\n`;

            anomalies.forEach((anomaly, index) => {
                response += `**${index + 1}. ${anomaly.month} - ${anomaly.category} ${anomaly.type}** ${anomaly.severity}\n`;
                response += `• Actual: €${anomaly.value.toLocaleString()}\n`;
                response += `• Expected: €${anomaly.expected.toLocaleString()}\n`;
                response += `• Deviation: ${anomaly.deviation > 0 ? '+' : ''}${anomaly.deviation}%\n`;
                response += `• Impact: ${this.getAnomalyImpact(anomaly)}\n\n`;
            });

            response += `💡 **Recommendations:**\n`;
            response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            response += `• Review unusual months for one-time events\n`;
            response += `• Ensure data accuracy and completeness\n`;
            response += `• Set budget alerts for future deviations\n`;
            response += `• Investigate recurring anomalies\n`;
        }

        return {
            text: response,
            charts: [],
            data: {
                anomalies,
                totalMonths: data.length
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET ANOMALY IMPACT
     * ═══════════════════════════════════════════════════════════
     */
    getAnomalyImpact(anomaly) {
        const absDeviation = Math.abs(parseFloat(anomaly.deviation));
        
        if (anomaly.category === 'Savings') {
            if (anomaly.type === 'SPIKE') {
                return '✅ Positive - Extra savings accumulated';
            } else {
                return '⚠ Negative - Reduced savings that month';
            }
        } else if (anomaly.category === 'Expenses') {
            if (anomaly.type === 'SPIKE') {
                return '⚠ Negative - Unusual high expenses';
            } else {
                return '✅ Positive - Lower than normal expenses';
            }
        } else { // Income
            if (anomaly.type === 'SPIKE') {
                return '✅ Positive - Bonus or extra income';
            } else {
                return '⚠ Negative - Income drop requires investigation';
            }
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * BUDGET HEALTH CHECK
     * ═══════════════════════════════════════════════════════════
     */
    async budgetHealthCheck() {
        const budgetData = await this.getBudgetData();

        if (!budgetData || !budgetData.data || budgetData.data.length === 0) {
            return this.getDataRequiredMessage();
        }

        const analysis = this.calculateComprehensiveAnalysis(budgetData);
        const health = this.assessBudgetHealth(analysis);

        let response = `🏥 **Budget Health Check Report**\n\n`;

        response += `${health.icon} **Overall Score: ${health.score}/100**\n`;
        response += `**Rating: ${health.rating}**\n\n`;

        response += `📋 **Health Factors:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        health.factors.forEach(factor => {
            response += `${factor}\n`;
        });
        response += `\n`;

        response += `💬 **Assessment:**\n`;
        response += `${health.message}\n\n`;

        // Detailed metrics
        response += `📊 **Detailed Metrics:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        response += `• Savings Rate: ${analysis.avgSavingsRate.toFixed(1)}% (Target: 20%+)\n`;
        response += `• Investment Rate: ${(analysis.avgIncome > 0 ? (analysis.totalInvested / (analysis.avgIncome * analysis.monthCount)) * 100 : 0).toFixed(1)}% (Target: 15-20%)\n`;
        response += `• ROI: ${analysis.roi.toFixed(2)}% (Target: ${budgetData.monthlyEstYield}%)\n`;
        response += `• Housing Ratio: ${(analysis.avgIncome > 0 ? (analysis.expenseBreakdown.housing / analysis.avgIncome) * 100 : 0).toFixed(1)}% (Max: 30%)\n`;
        response += `• Food Ratio: ${(analysis.avgIncome > 0 ? (analysis.expenseBreakdown.food / analysis.avgIncome) * 100 : 0).toFixed(1)}% (Max: 15%)\n\n`;

        // Priority Actions
        response += `⚡ **Priority Actions:**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        if (health.score < 60) {
            response += `1. Focus on expense reduction\n`;
            response += `2. Build emergency fund (3 months minimum)\n`;
            response += `3. Increase savings rate by 5% immediately\n`;
        } else if (health.score < 80) {
            response += `1. Optimize expense categories\n`;
            response += `2. Increase investment contributions\n`;
            response += `3. Diversify income sources\n`;
        } else {
            response += `1. Maintain current discipline\n`;
            response += `2. Explore tax-advantaged investments\n`;
            response += `3. Consider advanced wealth strategies\n`;
        }

        response += `\n💬 Want specific help? Ask: *"Optimize my budget"*`;

        return {
            text: response,
            charts: [],
            data: {
                health,
                analysis
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HELPER FUNCTIONS
     * ═══════════════════════════════════════════════════════════
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getDataRequiredMessage() {
        return {
            text: `📊 **Budget Data Required**\n\nI need access to your budget data to provide analysis.\n\n**Steps:**\n1. Visit the **Budget Dashboard** page\n2. Create at least 1 month of financial data\n3. Return here for AI-powered insights\n\n**Or:**\nIf you have existing data, ensure:\n• Dashboard is loaded\n• SimulationManager is active\n• Data is saved to cloud\n\nNeed help? Ask: *"How do I create a budget?"*`,
            charts: [],
            data: null
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * HELP MESSAGE
     * ═══════════════════════════════════════════════════════════
     */
    getBudgetHelp() {
        return {
            text: `💰 **Budget Manager - Complete Guide**\n\n` +
                  `I'm your AI budget advisor with complete access to your Dashboard data.\n\n` +
                  
                  `📊 **Budget Overview & Analysis:**\n` +
                  `• "Show my budget overview"\n` +
                  `• "Analyze my budget"\n` +
                  `• "Budget health check"\n` +
                  `• "Check for anomalies"\n\n` +
                  
                  `💡 **Optimization & Recommendations:**\n` +
                  `• "Optimize my budget"\n` +
                  `• "Give me savings tips"\n` +
                  `• "How can I save more?"\n` +
                  `• "Investment strategy"\n\n` +
                  
                  `📈 **Projections & Calculations:**\n` +
                  `• "Project my savings for 24 months"\n` +
                  `• "Calculate ROI for 5 years"\n` +
                  `• "What if I save €500 more?"\n` +
                  `• "Inflation impact analysis"\n\n` +
                  
                  `🎯 **Specialized Analysis:**\n` +
                  `• "Analyze my spending patterns"\n` +
                  `• "Emergency fund status"\n` +
                  `• "Compare last 3 months"\n` +
                  `• "Set savings goal"\n\n` +
                  
                  `⚡ **Quick Stats:**\n` +
                  `• Savings Rate\n` +
                  `• Investment ROI\n` +
                  `• Portfolio Value\n` +
                  `• Budget Health Score\n\n` +
                  
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
    module.exports = ChatbotBudgetManager;
}

if (typeof window !== 'undefined') {
    window.ChatbotBudgetManager = ChatbotBudgetManager;
}

console.log('✅ ChatbotBudgetManager Ultra v5.0 loaded - Cloud integration active');