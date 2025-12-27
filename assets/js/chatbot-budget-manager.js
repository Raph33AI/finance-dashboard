/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT BUDGET MANAGER - Dashboard Budget Integration
 * ═══════════════════════════════════════════════════════════════
 * Version: 3.0.0
 * Description: Intégration Dashboard Budget
 * Features:
 *   - Gestion timeline (revenus, dépenses, investissements)
 *   - Calculs ROI + inflation-adjusted
 *   - Recommandations d'optimisation budget
 */

class ChatbotBudgetManager {
    constructor(config) {
        this.config = config;
        this.simulationManager = null;
        
        // Budget categories (from dashboard.js)
        this.incomeCategories = [
            'Salary', 'Bonus', 'Freelance', 'Investments', 'Rental Income', 'Other Income'
        ];
        
        this.expenseCategories = [
            'Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare', 
            'Entertainment', 'Education', 'Savings', 'Debt', 'Other'
        ];
        
        // Default ROI parameters
        this.defaultROI = {
            monthlyEstYield: 0.00643,  // 8% annualisé
            inflationRate: 0.03        // 3% par an
        };
        
        console.log('💰 ChatbotBudgetManager initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * MANAGE BUDGET (Main Method)
     * ═══════════════════════════════════════════════════════════
     */
    async manageBudget(entities = {}, userMessage = '') {
        try {
            console.log('💰 Managing budget...');

            // Detect budget intent
            const intent = this.detectBudgetIntent(userMessage);

            switch (intent) {
                case 'SHOW_OVERVIEW':
                    return await this.showBudgetOverview();
                
                case 'ADD_INCOME':
                    return this.addIncomeGuidance();
                
                case 'ADD_EXPENSE':
                    return this.addExpenseGuidance();
                
                case 'OPTIMIZE':
                    return await this.optimizeBudget();
                
                case 'CALCULATE_ROI':
                    return this.calculateROI(entities);
                
                case 'SAVINGS_PROJECTION':
                    return this.projectSavings(entities);
                
                default:
                    return this.getBudgetHelp();
            }

        } catch (error) {
            console.error('❌ Budget management error:', error);
            return {
                text: "❌ Unable to process budget request. Please try again.",
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * DETECT BUDGET INTENT
     * ═══════════════════════════════════════════════════════════
     */
    detectBudgetIntent(message) {
        const lower = message.toLowerCase();

        if (lower.match(/\b(show|display|view|my)\s+(budget|overview|summary)\b/)) {
            return 'SHOW_OVERVIEW';
        }
        if (lower.match(/\b(add|create|new)\s+(income|revenue|salary)\b/)) {
            return 'ADD_INCOME';
        }
        if (lower.match(/\b(add|create|new)\s+(expense|cost|spending)\b/)) {
            return 'ADD_EXPENSE';
        }
        if (lower.match(/\b(optimize|improve|better|reduce)\s+(budget|expenses|savings)\b/)) {
            return 'OPTIMIZE';
        }
        if (lower.match(/\b(roi|return|investment|yield)\b/)) {
            return 'CALCULATE_ROI';
        }
        if (lower.match(/\b(savings|projection|forecast|future)\b/)) {
            return 'SAVINGS_PROJECTION';
        }

        return 'HELP';
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SHOW BUDGET OVERVIEW
     * ═══════════════════════════════════════════════════════════
     */
    async showBudgetOverview() {
        // This would fetch user's budget data from SimulationManager
        const budgetData = await this.getBudgetData();

        if (!budgetData) {
            return {
                text: `💰 **Budget Dashboard**

You haven't created a budget yet!

**Get Started:**
• Visit the Budget Dashboard to create your first budget
• Track income, expenses, and investments
• Get AI-powered optimization recommendations

Would you like me to guide you through setting up your budget?`,
                charts: [],
                data: null
            };
        }

        const summary = this.calculateBudgetSummary(budgetData);

        let response = `💰 **Your Budget Overview**\n\n`;

        response += `**Monthly Summary:**\n`;
        response += `• Total Income: $${summary.totalIncome.toLocaleString()}\n`;
        response += `• Total Expenses: $${summary.totalExpenses.toLocaleString()}\n`;
        response += `• Net Savings: $${summary.netSavings.toLocaleString()}\n`;
        response += `• Savings Rate: ${summary.savingsRate.toFixed(1)}%\n\n`;

        response += `**Investment Portfolio:**\n`;
        response += `• Current Value: $${summary.portfolioValue.toLocaleString()}\n`;
        response += `• Total Invested: $${summary.totalInvested.toLocaleString()}\n`;
        response += `• ROI: ${summary.roi.toFixed(2)}%\n\n`;

        // Budget health indicator
        const health = this.assessBudgetHealth(summary);
        response += `**Budget Health: ${health.rating}**\n`;
        response += `${health.message}\n\n`;

        response += `**Quick Actions:**\n`;
        response += `• "Optimize my budget" - Get AI recommendations\n`;
        response += `• "Project my savings" - See future projections\n`;
        response += `• "Calculate ROI" - Investment returns analysis\n`;

        return {
            text: response,
            charts: [],
            data: budgetData
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET BUDGET DATA
     * ═══════════════════════════════════════════════════════════
     */
    async getBudgetData() {
        // This would integrate with SimulationManager
        // For now, returning demo data
        return this.getDemoBudgetData();
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET DEMO BUDGET DATA
     * ═══════════════════════════════════════════════════════════
     */
    getDemoBudgetData() {
        return {
            income: {
                salary: 5000,
                bonus: 500,
                freelance: 1000,
                total: 6500
            },
            expenses: {
                housing: 1500,
                transportation: 400,
                food: 600,
                utilities: 200,
                healthcare: 300,
                entertainment: 300,
                other: 200,
                total: 3500
            },
            investments: {
                monthly: 2000,
                total: 50000,
                currentValue: 54000
            },
            months: 12
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE BUDGET SUMMARY
     * ═══════════════════════════════════════════════════════════
     */
    calculateBudgetSummary(budgetData) {
        const totalIncome = budgetData.income.total;
        const totalExpenses = budgetData.expenses.total;
        const netSavings = totalIncome - totalExpenses;
        const savingsRate = (netSavings / totalIncome) * 100;

        const portfolioValue = budgetData.investments.currentValue;
        const totalInvested = budgetData.investments.total;
        const roi = ((portfolioValue - totalInvested) / totalInvested) * 100;

        return {
            totalIncome,
            totalExpenses,
            netSavings,
            savingsRate,
            portfolioValue,
            totalInvested,
            roi
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ASSESS BUDGET HEALTH
     * ═══════════════════════════════════════════════════════════
     */
    assessBudgetHealth(summary) {
        const savingsRate = summary.savingsRate;

        if (savingsRate >= 30) {
            return {
                rating: '🟢 EXCELLENT',
                message: 'You are saving over 30% of your income. Keep up the great work!'
            };
        } else if (savingsRate >= 20) {
            return {
                rating: '🟢 GOOD',
                message: 'You are saving 20-30% of your income. This is a healthy savings rate.'
            };
        } else if (savingsRate >= 10) {
            return {
                rating: '🟡 FAIR',
                message: 'You are saving 10-20%. Consider increasing your savings rate.'
            };
        } else if (savingsRate > 0) {
            return {
                rating: '🟠 NEEDS IMPROVEMENT',
                message: 'Your savings rate is below 10%. Let me help you optimize your budget.'
            };
        } else {
            return {
                rating: '🔴 CRITICAL',
                message: 'You are spending more than you earn. Immediate action required!'
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ADD INCOME GUIDANCE
     * ═══════════════════════════════════════════════════════════
     */
    addIncomeGuidance() {
        return {
            text: `💰 **Add Income to Your Budget**

To add income, visit the Budget Dashboard and:

1. Click "Add Month" or select an existing month
2. Under "Income" section, enter amounts for:
   • Salary
   • Bonus
   • Freelance income
   • Investment returns
   • Other income sources

**Pro Tip:** Track all income sources for accurate financial planning!

Would you like help with anything else?`,
            charts: [],
            data: null
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ADD EXPENSE GUIDANCE
     * ═══════════════════════════════════════════════════════════
     */
    addExpenseGuidance() {
        return {
            text: `💰 **Add Expenses to Your Budget**

To add expenses, visit the Budget Dashboard and:

1. Click "Add Month" or select an existing month
2. Under "Expenses" section, enter amounts for:
   • Housing (rent/mortgage)
   • Transportation
   • Food & groceries
   • Utilities
   • Healthcare
   • Entertainment
   • Other categories

**Pro Tip:** Follow the 50/30/20 rule - 50% needs, 30% wants, 20% savings!

Would you like budget optimization recommendations?`,
            charts: [],
            data: null
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * OPTIMIZE BUDGET
     * ═══════════════════════════════════════════════════════════
     */
    async optimizeBudget() {
        const budgetData = await this.getBudgetData();

        if (!budgetData) {
            return this.getBudgetHelp();
        }

        const summary = this.calculateBudgetSummary(budgetData);
        const recommendations = this.generateOptimizationRecommendations(budgetData, summary);

        let response = `💡 **Budget Optimization Recommendations**\n\n`;

        recommendations.forEach((rec, index) => {
            response += `**${index + 1}. ${rec.title}**\n`;
            response += `${rec.description}\n`;
            response += `💰 Potential Savings: $${rec.savings.toLocaleString()}/month\n\n`;
        });

        response += `**Total Potential Savings: $${recommendations.reduce((sum, r) => sum + r.savings, 0).toLocaleString()}/month**\n\n`;

        response += `Implementing these changes could increase your savings rate from ${summary.savingsRate.toFixed(1)}% to ${(summary.savingsRate + (recommendations.reduce((sum, r) => sum + r.savings, 0) / summary.totalIncome * 100)).toFixed(1)}%!`;

        return {
            text: response,
            charts: [],
            data: { recommendations, summary }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GENERATE OPTIMIZATION RECOMMENDATIONS
     * ═══════════════════════════════════════════════════════════
     */
    generateOptimizationRecommendations(budgetData, summary) {
        const recommendations = [];

        // Food optimization
        if (budgetData.expenses.food > 800) {
            recommendations.push({
                title: 'Reduce Food Expenses',
                description: 'Your food expenses are above average. Consider meal planning and cooking at home more often.',
                savings: Math.round((budgetData.expenses.food - 600) * 0.5),
                category: 'food'
            });
        }

        // Entertainment optimization
        if (budgetData.expenses.entertainment > 400) {
            recommendations.push({
                title: 'Optimize Entertainment Spending',
                description: 'Look for free or low-cost entertainment alternatives. Cancel unused subscriptions.',
                savings: Math.round((budgetData.expenses.entertainment - 250) * 0.6),
                category: 'entertainment'
            });
        }

        // Transportation optimization
        if (budgetData.expenses.transportation > 500) {
            recommendations.push({
                title: 'Reduce Transportation Costs',
                description: 'Consider carpooling, public transport, or optimizing your driving habits to save on fuel.',
                savings: Math.round((budgetData.expenses.transportation - 350) * 0.4),
                category: 'transportation'
            });
        }

        // Investment increase
        if (summary.savingsRate < 20) {
            recommendations.push({
                title: 'Increase Investment Contribution',
                description: 'Aim to invest at least 20% of your income for long-term wealth building.',
                savings: Math.round(summary.totalIncome * 0.2 - budgetData.investments.monthly),
                category: 'investment'
            });
        }

        return recommendations.slice(0, 4);  // Top 4 recommendations
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE ROI
     * ═══════════════════════════════════════════════════════════
     */
    calculateROI(entities) {
        const budgetData = this.getDemoBudgetData();
        const monthlyInvestment = budgetData.investments.monthly;
        const months = entities.numbers && entities.numbers[0] ? entities.numbers[0] : 12;

        const projections = this.projectInvestmentGrowth(monthlyInvestment, months);

        let response = `📈 **Investment ROI Projection**\n\n`;

        response += `**Parameters:**\n`;
        response += `• Monthly Investment: $${monthlyInvestment.toLocaleString()}\n`;
        response += `• Time Horizon: ${months} months (${(months / 12).toFixed(1)} years)\n`;
        response += `• Expected Annual Return: 8%\n\n`;

        response += `**Projections:**\n`;
        response += `• Total Invested: $${projections.totalInvested.toLocaleString()}\n`;
        response += `• Portfolio Value: $${projections.finalValue.toLocaleString()}\n`;
        response += `• Total Gains: $${projections.totalGains.toLocaleString()}\n`;
        response += `• ROI: ${projections.roi.toFixed(2)}%\n\n`;

        response += `**Inflation-Adjusted:**\n`;
        response += `• Real Value: $${projections.inflationAdjusted.toLocaleString()}\n`;
        response += `• Real ROI: ${projections.realROI.toFixed(2)}%\n`;

        return {
            text: response,
            charts: [],
            data: projections
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * PROJECT INVESTMENT GROWTH
     * ═══════════════════════════════════════════════════════════
     */
    projectInvestmentGrowth(monthlyInvestment, months) {
        const monthlyYield = this.defaultROI.monthlyEstYield;
        const inflationRate = this.defaultROI.inflationRate;

        let portfolioValue = 0;
        let totalInvested = 0;

        for (let i = 0; i < months; i++) {
            totalInvested += monthlyInvestment;
            portfolioValue = (portfolioValue + monthlyInvestment) * (1 + monthlyYield);
        }

        const totalGains = portfolioValue - totalInvested;
        const roi = (totalGains / totalInvested) * 100;

        const inflationAdjusted = portfolioValue / Math.pow(1 + inflationRate / 12, months);
        const realROI = ((inflationAdjusted - totalInvested) / totalInvested) * 100;

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
     * PROJECT SAVINGS
     * ═══════════════════════════════════════════════════════════
     */
    projectSavings(entities) {
        const budgetData = this.getDemoBudgetData();
        const summary = this.calculateBudgetSummary(budgetData);
        const months = entities.numbers && entities.numbers[0] ? entities.numbers[0] : 12;

        const monthlySavings = summary.netSavings;
        const totalSavings = monthlySavings * months;

        let response = `💰 **Savings Projection**\n\n`;

        response += `**Current Savings:**\n`;
        response += `• Monthly Savings: $${monthlySavings.toLocaleString()}\n`;
        response += `• Savings Rate: ${summary.savingsRate.toFixed(1)}%\n\n`;

        response += `**${months}-Month Projection:**\n`;
        response += `• Total Savings: $${totalSavings.toLocaleString()}\n`;
        response += `• With 8% Investment Return: $${this.projectInvestmentGrowth(monthlySavings, months).finalValue.toLocaleString()}\n\n`;

        response += `**Milestone Progress:**\n`;
        if (totalSavings >= 10000) {
            response += `✅ Emergency fund goal achieved!\n`;
        } else {
            response += `🎯 ${Math.round((totalSavings / 10000) * 100)}% towards $10K emergency fund\n`;
        }

        return {
            text: response,
            charts: [],
            data: { monthlySavings, totalSavings, months }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET BUDGET HELP
     * ═══════════════════════════════════════════════════════════
     */
    getBudgetHelp() {
        return {
            text: `💰 **Budget Management Help**

I can help you with:

**Budget Overview:**
• "Show my budget overview"
• "What's my savings rate?"
• "Budget health check"

**Budget Planning:**
• "Add income to budget"
• "Track my expenses"
• "Optimize my budget"

**Investment Planning:**
• "Calculate ROI for 24 months"
• "Project my savings"
• "Investment growth forecast"

**Quick Tips:**
• Follow the 50/30/20 rule
• Maintain 3-6 months emergency fund
• Invest at least 20% of income

What would you like to know?`,
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

console.log('✅ ChatbotBudgetManager loaded');