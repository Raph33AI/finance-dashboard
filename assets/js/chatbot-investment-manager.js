/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT INVESTMENT MANAGER - Portfolio Analytics Integration
 * ═══════════════════════════════════════════════════════════════
 * Version: 3.0.0
 * Description: Multi-allocation system + Portfolio optimization
 * Features:
 *   - Multi-allocation system
 *   - Portfolio optimization
 *   - Backtesting
 *   - Risk analysis
 */

class ChatbotInvestmentManager {
    constructor(config) {
        this.config = config;
        
        // Asset allocation strategies
        this.allocationStrategies = {
            conservative: {
                name: 'Conservative',
                stocks: 40,
                bonds: 50,
                cash: 10,
                riskLevel: 'LOW',
                expectedReturn: 5.5
            },
            moderate: {
                name: 'Moderate',
                stocks: 60,
                bonds: 30,
                cash: 10,
                riskLevel: 'MEDIUM',
                expectedReturn: 7.5
            },
            aggressive: {
                name: 'Aggressive',
                stocks: 80,
                bonds: 15,
                cash: 5,
                riskLevel: 'HIGH',
                expectedReturn: 9.5
            },
            veryAggressive: {
                name: 'Very Aggressive',
                stocks: 95,
                bonds: 0,
                cash: 5,
                riskLevel: 'VERY HIGH',
                expectedReturn: 11.0
            }
        };
        
        console.log('📊 ChatbotInvestmentManager initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * MANAGE INVESTMENTS (Main Method)
     * ═══════════════════════════════════════════════════════════
     */
    async manageInvestments(entities = {}, userMessage = '') {
        try {
            console.log('📊 Managing investments...');

            const intent = this.detectInvestmentIntent(userMessage);

            switch (intent) {
                case 'PORTFOLIO_OVERVIEW':
                    return await this.getPortfolioOverview();
                
                case 'OPTIMIZE':
                    return await this.optimizePortfolio();
                
                case 'REBALANCE':
                    return await this.rebalancePortfolio();
                
                case 'RISK_ANALYSIS':
                    return await this.analyzeRisk();
                
                case 'COMPARE_ALLOCATIONS':
                    return this.compareAllocations();
                
                case 'BACKTEST':
                    return this.backtestStrategy(entities);
                
                default:
                    return this.getInvestmentHelp();
            }

        } catch (error) {
            console.error('❌ Investment management error:', error);
            return {
                text: "❌ Unable to process investment request. Please try again.",
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * DETECT INVESTMENT INTENT
     * ═══════════════════════════════════════════════════════════
     */
    detectInvestmentIntent(message) {
        const lower = message.toLowerCase();

        if (lower.match(/\b(portfolio|holdings|my investments)\b/)) {
            return 'PORTFOLIO_OVERVIEW';
        }
        if (lower.match(/\b(optimize|improve|better allocation)\b/)) {
            return 'OPTIMIZE';
        }
        if (lower.match(/\b(rebalance|adjust|reallocate)\b/)) {
            return 'REBALANCE';
        }
        if (lower.match(/\b(risk|volatility|drawdown|sharpe)\b/)) {
            return 'RISK_ANALYSIS';
        }
        if (lower.match(/\b(compare|allocation|strategy)\b/)) {
            return 'COMPARE_ALLOCATIONS';
        }
        if (lower.match(/\b(backtest|historical|performance)\b/)) {
            return 'BACKTEST';
        }

        return 'HELP';
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET PORTFOLIO OVERVIEW
     * ═══════════════════════════════════════════════════════════
     */
    async getPortfolioOverview() {
        const portfolio = this.getDemoPortfolio();

        let response = `📊 **Your Investment Portfolio**\n\n`;

        response += `**Total Value:** $${portfolio.totalValue.toLocaleString()}\n`;
        response += `**Total Invested:** $${portfolio.totalInvested.toLocaleString()}\n`;
        response += `**Total Gains:** $${portfolio.totalGains.toLocaleString()} (${portfolio.returnPercent.toFixed(2)}%)\n\n`;

        response += `**Current Allocation:**\n`;
        portfolio.allocation.forEach(asset => {
            response += `• ${asset.name}: ${asset.percent.toFixed(1)}% ($${asset.value.toLocaleString()})\n`;
        });

        response += `\n**Risk Metrics:**\n`;
        response += `• Risk Level: ${portfolio.riskLevel}\n`;
        response += `• Volatility: ${portfolio.volatility.toFixed(2)}%\n`;
        response += `• Sharpe Ratio: ${portfolio.sharpeRatio.toFixed(2)}\n`;
        response += `• Max Drawdown: ${portfolio.maxDrawdown.toFixed(2)}%\n\n`;

        response += `**Quick Actions:**\n`;
        response += `• "Optimize portfolio" - Get AI recommendations\n`;
        response += `• "Rebalance portfolio" - Adjust allocations\n`;
        response += `• "Analyze risk" - Detailed risk analysis\n`;

        return {
            text: response,
            charts: [],
            data: portfolio
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET DEMO PORTFOLIO
     * ═══════════════════════════════════════════════════════════
     */
    getDemoPortfolio() {
        return {
            totalValue: 125000,
            totalInvested: 100000,
            totalGains: 25000,
            returnPercent: 25.0,
            allocation: [
                { name: 'Stocks (US Large Cap)', percent: 50, value: 62500 },
                { name: 'Stocks (International)', percent: 15, value: 18750 },
                { name: 'Bonds (Government)', percent: 20, value: 25000 },
                { name: 'Bonds (Corporate)', percent: 10, value: 12500 },
                { name: 'Cash & Equivalents', percent: 5, value: 6250 }
            ],
            riskLevel: 'MEDIUM',
            volatility: 12.5,
            sharpeRatio: 1.45,
            maxDrawdown: -8.3
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * OPTIMIZE PORTFOLIO
     * ═══════════════════════════════════════════════════════════
     */
    async optimizePortfolio() {
        const currentPortfolio = this.getDemoPortfolio();
        const optimizedAllocation = this.calculateOptimalAllocation(currentPortfolio);

        let response = `🎯 **Portfolio Optimization Recommendations**\n\n`;

        response += `**Current vs. Optimized Allocation:**\n\n`;

        optimizedAllocation.changes.forEach(change => {
            const direction = change.difference > 0 ? '↑' : '↓';
            response += `**${change.name}**\n`;
            response += `Current: ${change.current.toFixed(1)}% → Recommended: ${change.recommended.toFixed(1)}% ${direction}\n`;
            response += `Action: ${change.difference > 0 ? 'Increase' : 'Decrease'} by $${Math.abs(change.dollarChange).toLocaleString()}\n\n`;
        });

        response += `**Expected Impact:**\n`;
        response += `• Expected Return: ${currentPortfolio.returnPercent.toFixed(2)}% → ${optimizedAllocation.expectedReturn.toFixed(2)}%\n`;
        response += `• Risk (Volatility): ${currentPortfolio.volatility.toFixed(2)}% → ${optimizedAllocation.expectedVolatility.toFixed(2)}%\n`;
        response += `• Sharpe Ratio: ${currentPortfolio.sharpeRatio.toFixed(2)} → ${optimizedAllocation.expectedSharpe.toFixed(2)}\n\n`;

        response += `**Implementation:**\n`;
        response += `Would you like me to help you rebalance your portfolio?`;

        return {
            text: response,
            charts: [],
            data: optimizedAllocation
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE OPTIMAL ALLOCATION
     * ═══════════════════════════════════════════════════════════
     */
    calculateOptimalAllocation(currentPortfolio) {
        // Use moderate strategy as baseline
        const targetStrategy = this.allocationStrategies.moderate;

        const changes = [];

        // Stocks
        const currentStocks = currentPortfolio.allocation
            .filter(a => a.name.includes('Stocks'))
            .reduce((sum, a) => sum + a.percent, 0);
        
        if (Math.abs(currentStocks - targetStrategy.stocks) > 5) {
            changes.push({
                name: 'Stocks',
                current: currentStocks,
                recommended: targetStrategy.stocks,
                difference: targetStrategy.stocks - currentStocks,
                dollarChange: (targetStrategy.stocks - currentStocks) / 100 * currentPortfolio.totalValue
            });
        }

        // Bonds
        const currentBonds = currentPortfolio.allocation
            .filter(a => a.name.includes('Bonds'))
            .reduce((sum, a) => sum + a.percent, 0);
        
        if (Math.abs(currentBonds - targetStrategy.bonds) > 5) {
            changes.push({
                name: 'Bonds',
                current: currentBonds,
                recommended: targetStrategy.bonds,
                difference: targetStrategy.bonds - currentBonds,
                dollarChange: (targetStrategy.bonds - currentBonds) / 100 * currentPortfolio.totalValue
            });
        }

        // Cash
        const currentCash = currentPortfolio.allocation
            .filter(a => a.name.includes('Cash'))
            .reduce((sum, a) => sum + a.percent, 0);
        
        if (Math.abs(currentCash - targetStrategy.cash) > 3) {
            changes.push({
                name: 'Cash',
                current: currentCash,
                recommended: targetStrategy.cash,
                difference: targetStrategy.cash - currentCash,
                dollarChange: (targetStrategy.cash - currentCash) / 100 * currentPortfolio.totalValue
            });
        }

        return {
            changes,
            expectedReturn: targetStrategy.expectedReturn,
            expectedVolatility: 11.0,
            expectedSharpe: 1.65,
            strategy: targetStrategy.name
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * REBALANCE PORTFOLIO
     * ═══════════════════════════════════════════════════════════
     */
    async rebalancePortfolio() {
        return {
            text: `⚖ **Portfolio Rebalancing**

To rebalance your portfolio:

1. **Review Current Allocation**
   Visit your Investment Dashboard to see current holdings

2. **Choose Target Allocation**
   • Conservative (40/50/10)
   • Moderate (60/30/10)
   • Aggressive (80/15/5)

3. **Execute Trades**
   • Sell overweight positions
   • Buy underweight positions
   • Minimize transaction costs

4. **Schedule Regular Reviews**
   Rebalance quarterly or when allocation drifts >5%

**Pro Tip:** Use tax-loss harvesting opportunities when rebalancing!

Would you like to compare different allocation strategies?`,
            charts: [],
            data: null
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYZE RISK
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeRisk() {
        const portfolio = this.getDemoPortfolio();
        const riskMetrics = this.calculateDetailedRisk(portfolio);

        let response = `⚠ **Portfolio Risk Analysis**\n\n`;

        response += `**Risk Level: ${portfolio.riskLevel}**\n\n`;

        response += `**Volatility Metrics:**\n`;
        response += `• Annualized Volatility: ${portfolio.volatility.toFixed(2)}%\n`;
        response += `• Max Drawdown: ${portfolio.maxDrawdown.toFixed(2)}%\n`;
        response += `• Value at Risk (95%): $${riskMetrics.var95.toLocaleString()}\n\n`;

        response += `**Risk-Adjusted Returns:**\n`;
        response += `• Sharpe Ratio: ${portfolio.sharpeRatio.toFixed(2)} (${riskMetrics.sharpeRating})\n`;
        response += `• Sortino Ratio: ${riskMetrics.sortinoRatio.toFixed(2)}\n`;
        response += `• Calmar Ratio: ${riskMetrics.calmarRatio.toFixed(2)}\n\n`;

        response += `**Diversification:**\n`;
        response += `• Asset Classes: ${portfolio.allocation.length}\n`;
        response += `• Concentration Risk: ${riskMetrics.concentrationRisk}\n\n`;

        response += `**Risk Assessment:**\n`;
        response += riskMetrics.assessment;

        return {
            text: response,
            charts: [],
            data: riskMetrics
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCULATE DETAILED RISK
     * ═══════════════════════════════════════════════════════════
     */
    calculateDetailedRisk(portfolio) {
        const var95 = portfolio.totalValue * 0.15;  // Simplified VaR
        const sortinoRatio = portfolio.sharpeRatio * 1.3;
        const calmarRatio = portfolio.returnPercent / Math.abs(portfolio.maxDrawdown);

        let sharpeRating = 'Poor';
        if (portfolio.sharpeRatio > 2.0) sharpeRating = 'Excellent';
        else if (portfolio.sharpeRatio > 1.5) sharpeRating = 'Very Good';
        else if (portfolio.sharpeRatio > 1.0) sharpeRating = 'Good';
        else if (portfolio.sharpeRatio > 0.5) sharpeRating = 'Fair';

        const maxAllocation = Math.max(...portfolio.allocation.map(a => a.percent));
        let concentrationRisk = 'Low';
        if (maxAllocation > 60) concentrationRisk = 'High';
        else if (maxAllocation > 40) concentrationRisk = 'Medium';

        let assessment = '';
        if (portfolio.riskLevel === 'LOW' || portfolio.riskLevel === 'MEDIUM') {
            assessment = '✅ Your portfolio has a balanced risk profile suitable for long-term growth.';
        } else {
            assessment = '⚠ Your portfolio carries elevated risk. Ensure this aligns with your risk tolerance and time horizon.';
        }

        return {
            var95,
            sortinoRatio,
            calmarRatio,
            sharpeRating,
            concentrationRisk,
            assessment
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * COMPARE ALLOCATIONS
     * ═══════════════════════════════════════════════════════════
     */
    compareAllocations() {
        let response = `📊 **Asset Allocation Strategies Comparison**\n\n`;

        Object.values(this.allocationStrategies).forEach(strategy => {
            response += `**${strategy.name} (Risk: ${strategy.riskLevel})**\n`;
            response += `• Stocks: ${strategy.stocks}%\n`;
            response += `• Bonds: ${strategy.bonds}%\n`;
            response += `• Cash: ${strategy.cash}%\n`;
            response += `• Expected Return: ${strategy.expectedReturn.toFixed(1)}%\n\n`;
        });

        response += `**Recommendation:**\n`;
        response += `Choose your allocation based on:\n`;
        response += `• Age (younger = more aggressive)\n`;
        response += `• Risk tolerance\n`;
        response += `• Investment timeline\n`;
        response += `• Financial goals\n\n`;

        response += `Would you like me to recommend a strategy for your situation?`;

        return {
            text: response,
            charts: [],
            data: this.allocationStrategies
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * BACKTEST STRATEGY
     * ═══════════════════════════════════════════════════════════
     */
    backtestStrategy(entities) {
        const years = entities.numbers && entities.numbers[0] ? entities.numbers[0] : 10;
        const strategy = this.allocationStrategies.moderate;

        // Simulated backtest results
        const backtest = {
            years,
            strategy: strategy.name,
            initialInvestment: 100000,
            finalValue: 100000 * Math.pow(1 + strategy.expectedReturn / 100, years),
            totalReturn: 0,
            annualizedReturn: strategy.expectedReturn,
            maxDrawdown: -12.5,
            sharpeRatio: 1.45,
            worstYear: -5.2,
            bestYear: 18.3
        };

        backtest.totalReturn = ((backtest.finalValue - backtest.initialInvestment) / backtest.initialInvestment) * 100;

        let response = `📈 **Backtest Results - ${strategy.name} Strategy**\n\n`;

        response += `**Test Period:** ${years} years\n`;
        response += `**Initial Investment:** $${backtest.initialInvestment.toLocaleString()}\n\n`;

        response += `**Performance:**\n`;
        response += `• Final Value: $${Math.round(backtest.finalValue).toLocaleString()}\n`;
        response += `• Total Return: ${backtest.totalReturn.toFixed(2)}%\n`;
        response += `• Annualized Return: ${backtest.annualizedReturn.toFixed(2)}%\n`;
        response += `• Best Year: +${backtest.bestYear.toFixed(2)}%\n`;
        response += `• Worst Year: ${backtest.worstYear.toFixed(2)}%\n\n`;

        response += `**Risk Metrics:**\n`;
        response += `• Max Drawdown: ${backtest.maxDrawdown.toFixed(2)}%\n`;
        response += `• Sharpe Ratio: ${backtest.sharpeRatio.toFixed(2)}\n\n`;

        response += `**Key Insight:**\n`;
        response += `This ${strategy.name.toLowerCase()} approach would have turned $${backtest.initialInvestment.toLocaleString()} into $${Math.round(backtest.finalValue).toLocaleString()} over ${years} years.`;

        return {
            text: response,
            charts: [],
            data: backtest
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET INVESTMENT HELP
     * ═══════════════════════════════════════════════════════════
     */
    getInvestmentHelp() {
        return {
            text: `📊 **Investment Management Help**

I can help you with:

**Portfolio Management:**
• "Show my portfolio"
• "Portfolio overview"
• "What are my holdings?"

**Optimization:**
• "Optimize my portfolio"
• "Rebalance portfolio"
• "Best asset allocation"

**Risk Analysis:**
• "Analyze portfolio risk"
• "What's my Sharpe ratio?"
• "Portfolio volatility"

**Strategy Comparison:**
• "Compare allocation strategies"
• "Conservative vs aggressive"
• "Which strategy is best for me?"

**Backtesting:**
• "Backtest moderate strategy for 10 years"
• "Historical performance"

What would you like to explore?`,
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

console.log('✅ ChatbotInvestmentManager loaded');