/* ========================================
   ANALYTICS FINANCIÈRES AVANCÉES
   REX, Bilans multi-années, Ratios, Cash Flow
   ======================================== */

class AdvancedFinancialAnalytics {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Récupère les résultats d'exploitation (REX) multi-années
     */
    async getOperatingResults(symbol, years = 5) {
        try {
            const cacheKey = `rex_${symbol}_${years}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            // Récupération des données financières
            const financials = await this.apiClient.getBasicFinancials(symbol, 'all');
            
            if (!financials || !financials.series || !financials.series.annual) {
                throw new Error('No financial data available');
            }

            const annual = financials.series.annual;
            
            // Extraction du REX sur N années
            const rexData = [];
            const currentYear = new Date().getFullYear();
            
            for (let i = 0; i < years; i++) {
                const year = currentYear - i;
                const yearData = {
                    year: year,
                    revenue: this.getMetricForYear(annual.revenue, year) || 0,
                    operatingExpenses: this.getMetricForYear(annual.operatingExpense, year) || 0,
                    operatingIncome: this.getMetricForYear(annual.operatingIncome, year) || 0,
                    ebitda: this.getMetricForYear(annual.ebitda, year) || 0,
                    netIncome: this.getMetricForYear(annual.netIncome, year) || 0
                };
                
                // Calcul de la marge opérationnelle
                yearData.operatingMargin = yearData.revenue > 0 ? 
                    (yearData.operatingIncome / yearData.revenue * 100) : 0;
                
                rexData.push(yearData);
            }

            rexData.reverse(); // Du plus ancien au plus récent

            const result = {
                symbol,
                years: rexData.length,
                data: rexData,
                analysis: this.analyzeOperatingTrend(rexData),
                chartData: this.formatREXChartData(rexData)
            };

            this.setCache(cacheKey, result);
            return result;

        } catch (error) {
            console.error('Operating Results Error:', error);
            throw error;
        }
    }

    /**
     * Récupère le bilan complet multi-années
     */
    async getBalanceSheet(symbol, years = 5) {
        try {
            const cacheKey = `balance_${symbol}_${years}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const financials = await this.apiClient.getBasicFinancials(symbol, 'all');
            
            if (!financials || !financials.series || !financials.series.annual) {
                throw new Error('No balance sheet data available');
            }

            const annual = financials.series.annual;
            const balanceData = [];
            const currentYear = new Date().getFullYear();
            
            for (let i = 0; i < years; i++) {
                const year = currentYear - i;
                balanceData.push({
                    year: year,
                    totalAssets: this.getMetricForYear(annual.totalAssets, year) || 0,
                    currentAssets: this.getMetricForYear(annual.currentAssets, year) || 0,
                    cash: this.getMetricForYear(annual.cashAndCashEquivalents, year) || 0,
                    inventory: this.getMetricForYear(annual.inventory, year) || 0,
                    receivables: this.getMetricForYear(annual.netReceivables, year) || 0,
                    totalLiabilities: this.getMetricForYear(annual.totalLiabilities, year) || 0,
                    currentLiabilities: this.getMetricForYear(annual.currentLiabilities, year) || 0,
                    longTermDebt: this.getMetricForYear(annual.longTermDebt, year) || 0,
                    shareholderEquity: this.getMetricForYear(annual.totalEquity, year) || 0,
                    retainedEarnings: this.getMetricForYear(annual.retainedEarnings, year) || 0
                });
            }

            balanceData.reverse();

            const result = {
                symbol,
                years: balanceData.length,
                data: balanceData,
                ratios: this.calculateBalanceRatios(balanceData),
                analysis: this.analyzeBalanceSheet(balanceData),
                chartData: this.formatBalanceChartData(balanceData)
            };

            this.setCache(cacheKey, result);
            return result;

        } catch (error) {
            console.error('Balance Sheet Error:', error);
            throw error;
        }
    }

    /**
     * Calcule les Cash Flows multi-années
     */
    async getCashFlows(symbol, years = 5) {
        try {
            const cacheKey = `cashflow_${symbol}_${years}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const financials = await this.apiClient.getBasicFinancials(symbol, 'all');
            
            if (!financials || !financials.series || !financials.series.annual) {
                throw new Error('No cash flow data available');
            }

            const annual = financials.series.annual;
            const cashFlowData = [];
            const currentYear = new Date().getFullYear();
            
            for (let i = 0; i < years; i++) {
                const year = currentYear - i;
                const opCF = this.getMetricForYear(annual.operatingCashFlow, year) || 0;
                const capEx = this.getMetricForYear(annual.capitalExpenditure, year) || 0;
                
                cashFlowData.push({
                    year: year,
                    operatingCashFlow: opCF,
                    investingCashFlow: this.getMetricForYear(annual.cashFlowFromInvestment, year) || 0,
                    financingCashFlow: this.getMetricForYear(annual.cashFlowFromFinancing, year) || 0,
                    freeCashFlow: opCF - Math.abs(capEx),
                    capitalExpenditure: capEx,
                    dividendsPaid: this.getMetricForYear(annual.dividendsPaid, year) || 0
                });
            }

            cashFlowData.reverse();

            const result = {
                symbol,
                years: cashFlowData.length,
                data: cashFlowData,
                analysis: this.analyzeCashFlows(cashFlowData),
                chartData: this.formatCashFlowChartData(cashFlowData)
            };

            this.setCache(cacheKey, result);
            return result;

        } catch (error) {
            console.error('Cash Flow Error:', error);
            throw error;
        }
    }

    /**
     * Récupère une métrique pour une année donnée
     */
    getMetricForYear(metricArray, year) {
        if (!metricArray || !Array.isArray(metricArray)) return null;
        
        const yearString = year.toString();
        const item = metricArray.find(m => m.period && m.period.startsWith(yearString));
        
        return item ? item.v : null;
    }

    /**
     * Calcule tous les ratios financiers
     */
    calculateComprehensiveRatios(balance, income, cashFlow) {
        const latest = {
            balance: balance[balance.length - 1],
            income: income[income.length - 1],
            cash: cashFlow[cashFlow.length - 1]
        };

        return {
            // Ratios de liquidité
            liquidityRatios: {
                currentRatio: this.safeDiv(latest.balance.currentAssets, latest.balance.currentLiabilities),
                quickRatio: this.safeDiv(
                    latest.balance.currentAssets - latest.balance.inventory,
                    latest.balance.currentLiabilities
                ),
                cashRatio: this.safeDiv(latest.balance.cash, latest.balance.currentLiabilities)
            },
            
            // Ratios de rentabilité
            profitabilityRatios: {
                grossMargin: latest.income.operatingMargin || 0,
                operatingMargin: latest.income.operatingMargin || 0,
                netMargin: this.safeDiv(latest.income.netIncome, latest.income.revenue) * 100,
                roe: this.safeDiv(latest.income.netIncome, latest.balance.shareholderEquity) * 100,
                roa: this.safeDiv(latest.income.netIncome, latest.balance.totalAssets) * 100,
                roic: this.safeDiv(
                    latest.income.netIncome,
                    latest.balance.shareholderEquity + latest.balance.longTermDebt
                ) * 100
            },
            
            // Ratios d'endettement
            leverageRatios: {
                debtToEquity: this.safeDiv(latest.balance.totalLiabilities, latest.balance.shareholderEquity),
                debtToAssets: this.safeDiv(latest.balance.totalLiabilities, latest.balance.totalAssets),
                equityMultiplier: this.safeDiv(latest.balance.totalAssets, latest.balance.shareholderEquity),
                interestCoverage: this.safeDiv(latest.income.ebitda, latest.income.operatingExpenses * 0.05) // Approximation
            },
            
            // Ratios d'efficacité
            efficiencyRatios: {
                assetTurnover: this.safeDiv(latest.income.revenue, latest.balance.totalAssets),
                inventoryTurnover: this.safeDiv(latest.income.revenue * 0.7, latest.balance.inventory), // Approximation COGS
                receivablesTurnover: this.safeDiv(latest.income.revenue, latest.balance.receivables)
            },
            
            // Ratios de cash flow
            cashFlowRatios: {
                ocfRatio: this.safeDiv(latest.cash.operatingCashFlow, latest.balance.currentLiabilities),
                fcfYield: this.safeDiv(latest.cash.freeCashFlow, latest.balance.totalAssets) * 100,
                cashFlowMargin: this.safeDiv(latest.cash.operatingCashFlow, latest.income.revenue) * 100
            }
        };
    }

    /**
     * Division sécurisée
     */
    safeDiv(a, b) {
        if (!b || b === 0) return 0;
        return a / b;
    }

    /**
     * Analyse la tendance des résultats d'exploitation
     */
    analyzeOperatingTrend(rexData) {
        if (rexData.length < 2) return { trend: 'insufficient_data' };

        const firstYear = rexData[0];
        const lastYear = rexData[rexData.length - 1];
        
        const revenueCagr = this.calculateCAGR(firstYear.revenue, lastYear.revenue, rexData.length - 1);
        const operatingIncomeCagr = this.calculateCAGR(firstYear.operatingIncome, lastYear.operatingIncome, rexData.length - 1);
        
        const avgMargin = rexData.reduce((sum, y) => sum + y.operatingMargin, 0) / rexData.length;
        const marginTrend = lastYear.operatingMargin > firstYear.operatingMargin ? 'improving' : 'declining';

        return {
            revenueCagr: revenueCagr.toFixed(2) + '%',
            operatingIncomeCagr: operatingIncomeCagr.toFixed(2) + '%',
            avgOperatingMargin: avgMargin.toFixed(2) + '%',
            marginTrend,
            assessment: this.assessPerformance(revenueCagr, operatingIncomeCagr, avgMargin)
        };
    }

    /**
     * Calcule le CAGR (Taux de croissance annuel composé)
     */
    calculateCAGR(startValue, endValue, years) {
        if (startValue <= 0 || endValue <= 0 || years <= 0) return 0;
        return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
    }

    /**
     * Évalue la performance
     */
    assessPerformance(revenueCagr, incomeCagr, margin) {
        let score = 0;
        
        if (revenueCagr > 20) score += 3;
        else if (revenueCagr > 10) score += 2;
        else if (revenueCagr > 5) score += 1;
        
        if (incomeCagr > 20) score += 3;
        else if (incomeCagr > 10) score += 2;
        else if (incomeCagr > 5) score += 1;
        
        if (margin > 25) score += 2;
        else if (margin > 15) score += 1;
        
        if (score >= 7) return 'Excellent';
        if (score >= 5) return 'Good';
        if (score >= 3) return 'Average';
        return 'Below Average';
    }

    /**
     * Analyse le bilan
     */
    analyzeBalanceSheet(balanceData) {
        if (balanceData.length < 2) return { assessment: 'insufficient_data' };
        
        const latest = balanceData[balanceData.length - 1];
        const first = balanceData[0];
        
        return {
            assetGrowth: this.calculateGrowth(balanceData.map(d => d.totalAssets)),
            debtLevel: this.safeDiv(latest.totalLiabilities, latest.totalAssets),
            capitalStructure: this.safeDiv(
                latest.shareholderEquity,
                latest.shareholderEquity + latest.longTermDebt
            ),
            liquidityPosition: this.safeDiv(latest.currentAssets, latest.currentLiabilities),
            assessment: this.assessFinancialHealth(latest)
        };
    }

    /**
     * Analyse les cash flows
     */
    analyzeCashFlows(cashFlowData) {
        if (cashFlowData.length === 0) return { assessment: 'no_data' };
        
        const totalOCF = cashFlowData.reduce((sum, y) => sum + y.operatingCashFlow, 0);
        const totalFCF = cashFlowData.reduce((sum, y) => sum + y.freeCashFlow, 0);
        
        return {
            avgOperatingCF: totalOCF / cashFlowData.length,
            avgFreeCF: totalFCF / cashFlowData.length,
            ocfTrend: this.calculateGrowth(cashFlowData.map(d => d.operatingCashFlow)),
            fcfTrend: this.calculateGrowth(cashFlowData.map(d => d.freeCashFlow)),
            cashGenerationQuality: totalFCF > 0 ? 'Strong' : 'Weak'
        };
    }

    /**
     * Calcule la croissance
     */
    calculateGrowth(values) {
        if (values.length < 2) return 0;
        const first = values[0];
        const last = values[values.length - 1];
        if (first === 0) return 0;
        return ((last - first) / Math.abs(first)) * 100;
    }

    /**
     * Évalue la santé financière
     */
    assessFinancialHealth(balance) {
        let score = 0;
        
        const currentRatio = this.safeDiv(balance.currentAssets, balance.currentLiabilities);
        if (currentRatio > 2) score += 2;
        else if (currentRatio > 1) score += 1;
        
        const debtRatio = this.safeDiv(balance.totalLiabilities, balance.totalAssets);
        if (debtRatio < 0.5) score += 2;
        else if (debtRatio < 0.7) score += 1;
        
        if (score >= 3) return 'Strong';
        if (score >= 2) return 'Adequate';
        return 'Weak';
    }

    /**
     * Formate les données REX pour graphique
     */
    formatREXChartData(rexData) {
        return {
            type: 'bar',
            title: 'Résultats d\'Exploitation (REX)',
            labels: rexData.map(d => d.year.toString()),
            datasets: [
                {
                    label: 'Revenue (M$)',
                    data: rexData.map(d => (d.revenue / 1000000).toFixed(0)),
                    color: '#3b82f6'
                },
                {
                    label: 'Operating Income (M$)',
                    data: rexData.map(d => (d.operatingIncome / 1000000).toFixed(0)),
                    color: '#10b981'
                }
            ],
            formatValue: 'M',
            insights: [
                `CAGR Revenue: ${this.calculateCAGR(rexData[0].revenue, rexData[rexData.length-1].revenue, rexData.length-1).toFixed(1)}%`,
                `Marge opérationnelle moyenne: ${(rexData.reduce((s, d) => s + d.operatingMargin, 0) / rexData.length).toFixed(1)}%`
            ]
        };
    }

    /**
     * Formate les données de bilan pour graphique
     */
    formatBalanceChartData(balanceData) {
        return {
            type: 'line',
            title: 'Évolution du Bilan',
            labels: balanceData.map(d => d.year.toString()),
            datasets: [
                {
                    label: 'Total Assets (M$)',
                    data: balanceData.map(d => (d.totalAssets / 1000000).toFixed(0)),
                    color: '#3b82f6'
                },
                {
                    label: 'Total Liabilities (M$)',
                    data: balanceData.map(d => (d.totalLiabilities / 1000000).toFixed(0)),
                    color: '#ef4444'
                },
                {
                    label: 'Shareholder Equity (M$)',
                    data: balanceData.map(d => (d.shareholderEquity / 1000000).toFixed(0)),
                    color: '#10b981'
                }
            ],
            formatValue: 'M'
        };
    }

    /**
     * Formate les données de cash flow pour graphique
     */
    formatCashFlowChartData(cashFlowData) {
        return {
            type: 'bar',
            title: 'Cash Flow Analysis',
            labels: cashFlowData.map(d => d.year.toString()),
            datasets: [
                {
                    label: 'Operating CF (M$)',
                    data: cashFlowData.map(d => (d.operatingCashFlow / 1000000).toFixed(0)),
                    color: '#10b981'
                },
                {
                    label: 'Free CF (M$)',
                    data: cashFlowData.map(d => (d.freeCashFlow / 1000000).toFixed(0)),
                    color: '#3b82f6'
                }
            ],
            formatValue: 'M'
        };
    }

    /**
     * Cache management
     */
    setCache(key, value) {
        this.cache.set(key, {
            data: value,
            timestamp: Date.now()
        });
    }

    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    clearCache() {
        this.cache.clear();
    }
}

// Export global
window.AdvancedFinancialAnalytics = AdvancedFinancialAnalytics;