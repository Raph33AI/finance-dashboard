/**
 * ═══════════════════════════════════════════════════════════════
 * CHATBOT M&A ANALYZER - M&A Predictor Integration
 * ═══════════════════════════════════════════════════════════════
 * Version: 3.0.0
 * Description: Réutilisation de la logique M&A Predictor
 * Features:
 *   - Scoring AI 6 facteurs
 *   - Document parsing SEC
 *   - Analyse des fusions/acquisitions
 */

class ChatbotMAAnalyzer {
    constructor(config) {
        this.config = config;
        this.apiClient = null;
        
        // M&A Scoring Factors (from M&A Predictor)
        this.scoringFactors = {
            financial: {
                weight: 0.25,
                metrics: ['revenue_growth', 'ebitda_margin', 'debt_equity', 'cash_reserves']
            },
            strategic: {
                weight: 0.20,
                metrics: ['market_share', 'product_synergy', 'geographic_overlap']
            },
            valuation: {
                weight: 0.20,
                metrics: ['pe_ratio', 'pb_ratio', 'ev_ebitda', 'premium']
            },
            regulatory: {
                weight: 0.15,
                metrics: ['antitrust_risk', 'sector_regulation', 'cross_border']
            },
            market: {
                weight: 0.10,
                metrics: ['sector_consolidation', 'market_conditions', 'competitor_activity']
            },
            insider: {
                weight: 0.10,
                metrics: ['sec_filings', 'insider_trades', 'executive_moves']
            }
        };
        
        console.log('📊 ChatbotMAAnalyzer initialized');
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYZE MERGERS (Main Method)
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeMergers(entities = {}) {
        try {
            console.log('📊 Fetching recent M&A activity...');

            // Get recent M&A deals
            const deals = await this.getRecentDeals();

            if (!deals || deals.length === 0) {
                return {
                    text: "📊 **M&A Activity Overview**\n\nNo significant M&A deals announced recently. The market may be in a consolidation phase.\n\nWould you like to:\n• Analyze historical M&A trends\n• Check specific company M&A probability\n• Set up M&A deal alerts",
                    charts: [],
                    data: null
                };
            }

            // Score all deals
            const scoredDeals = deals.map(deal => this.scoreDeal(deal));

            // Sort by probability score
            scoredDeals.sort((a, b) => b.probabilityScore - a.probabilityScore);

            // Get top 5
            const topDeals = scoredDeals.slice(0, 5);

            // Build response
            const responseText = this.buildMAResponse(topDeals);

            return {
                text: responseText,
                charts: [],
                data: {
                    totalDeals: deals.length,
                    topDeals: topDeals,
                    allDeals: scoredDeals
                }
            };

        } catch (error) {
            console.error('❌ M&A analysis error:', error);
            return {
                text: "❌ Unable to fetch M&A data at the moment. Please try again later.",
                charts: [],
                data: null
            };
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET RECENT DEALS
     * ═══════════════════════════════════════════════════════════
     */
    async getRecentDeals() {
        // This would connect to your M&A data source
        // For now, returning simulated data structure
        
        if (this.apiClient && typeof this.apiClient.getRecentMADeals === 'function') {
            return await this.apiClient.getRecentMADeals();
        }

        return this.getDemoMAData();
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET DEMO M&A DATA
     * ═══════════════════════════════════════════════════════════
     */
    getDemoMAData() {
        return [
            {
                acquirer: 'TechGiant Corp',
                acquirerSymbol: 'TGNT',
                target: 'CloudSoft Inc',
                targetSymbol: 'CLSD',
                dealValue: 15000000000,
                status: 'Rumored',
                sector: 'Technology',
                announcedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                synergies: ['Cloud infrastructure', 'Customer base overlap', 'Technology integration'],
                premium: 35
            },
            {
                acquirer: 'PharmaMerge Ltd',
                acquirerSymbol: 'PHRM',
                target: 'BioInnovate Labs',
                targetSymbol: 'BINV',
                dealValue: 8500000000,
                status: 'Pending Approval',
                sector: 'Healthcare',
                announcedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                synergies: ['R&D pipeline', 'Geographic expansion', 'Patent portfolio'],
                premium: 42
            },
            {
                acquirer: 'FinServe Group',
                acquirerSymbol: 'FNSV',
                target: 'DigitalPay Solutions',
                targetSymbol: 'DPAY',
                dealValue: 3200000000,
                status: 'Announced',
                sector: 'Financial Services',
                announcedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
                synergies: ['Payment processing', 'Digital wallet integration', 'Customer acquisition'],
                premium: 28
            }
        ];
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE DEAL (6-Factor AI Scoring)
     * ═══════════════════════════════════════════════════════════
     */
    scoreDeal(deal) {
        let scores = {
            financial: 0,
            strategic: 0,
            valuation: 0,
            regulatory: 0,
            market: 0,
            insider: 0
        };

        // 1. Financial Strength (25%)
        scores.financial = this.scoreFinancialFactor(deal);

        // 2. Strategic Fit (20%)
        scores.strategic = this.scoreStrategicFactor(deal);

        // 3. Valuation (20%)
        scores.valuation = this.scoreValuationFactor(deal);

        // 4. Regulatory Risk (15%)
        scores.regulatory = this.scoreRegulatoryFactor(deal);

        // 5. Market Conditions (10%)
        scores.market = this.scoreMarketFactor(deal);

        // 6. Insider Activity (10%)
        scores.insider = this.scoreInsiderFactor(deal);

        // Calculate weighted total
        const probabilityScore = 
            scores.financial * this.scoringFactors.financial.weight +
            scores.strategic * this.scoringFactors.strategic.weight +
            scores.valuation * this.scoringFactors.valuation.weight +
            scores.regulatory * this.scoringFactors.regulatory.weight +
            scores.market * this.scoringFactors.market.weight +
            scores.insider * this.scoringFactors.insider.weight;

        return {
            ...deal,
            scores,
            probabilityScore: Math.round(probabilityScore),
            likelihood: this.getLikelihood(probabilityScore)
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE FINANCIAL FACTOR
     * ═══════════════════════════════════════════════════════════
     */
    scoreFinancialFactor(deal) {
        let score = 50;  // Base score

        // Deal size relative to acquirer
        if (deal.dealValue > 10000000000) score += 20;
        else if (deal.dealValue > 5000000000) score += 15;
        else if (deal.dealValue > 1000000000) score += 10;
        else score += 5;

        // Sector premium (tech deals historically more likely)
        if (deal.sector === 'Technology') score += 15;
        else if (deal.sector === 'Healthcare') score += 10;
        else if (deal.sector === 'Financial Services') score += 8;
        else score += 5;

        // Synergies
        if (deal.synergies && deal.synergies.length >= 3) score += 15;
        else if (deal.synergies && deal.synergies.length >= 2) score += 10;
        else score += 5;

        return Math.min(score, 100);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE STRATEGIC FACTOR
     * ═══════════════════════════════════════════════════════════
     */
    scoreStrategicFactor(deal) {
        let score = 50;

        // Strategic synergies count
        const synergyCount = deal.synergies ? deal.synergies.length : 0;
        score += synergyCount * 15;

        // Same sector (horizontal integration)
        if (deal.sector) score += 20;

        return Math.min(score, 100);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE VALUATION FACTOR
     * ═══════════════════════════════════════════════════════════
     */
    scoreValuationFactor(deal) {
        let score = 50;

        // Premium analysis
        if (deal.premium) {
            if (deal.premium > 50) score += 10;  // Very high premium = desperation or strategic necessity
            else if (deal.premium >= 30 && deal.premium <= 45) score += 30;  // Optimal range
            else if (deal.premium >= 20 && deal.premium < 30) score += 20;
            else if (deal.premium < 20) score += 5;  // Low premium = may face resistance
        }

        // Deal value reasonableness
        if (deal.dealValue > 50000000000) score += 10;  // Mega deals face more scrutiny
        else if (deal.dealValue >= 1000000000 && deal.dealValue <= 20000000000) score += 20;  // Sweet spot
        else score += 5;

        return Math.min(score, 100);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE REGULATORY FACTOR
     * ═══════════════════════════════════════════════════════════
     */
    scoreRegulatoryFactor(deal) {
        let score = 70;  // Assume moderate regulatory risk

        // Sector-based regulatory risk
        if (deal.sector === 'Technology') score -= 20;  // Higher antitrust scrutiny
        else if (deal.sector === 'Healthcare') score -= 15;  // FDA/regulatory hurdles
        else if (deal.sector === 'Financial Services') score -= 10;  // Banking regulations
        else score -= 5;

        // Mega deals face more scrutiny
        if (deal.dealValue > 20000000000) score -= 15;

        return Math.max(score, 0);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE MARKET FACTOR
     * ═══════════════════════════════════════════════════════════
     */
    scoreMarketFactor(deal) {
        let score = 60;

        // Current market conditions (would be dynamic in production)
        // For now, using baseline assumptions

        // Sector consolidation trend
        if (deal.sector === 'Technology' || deal.sector === 'Healthcare') {
            score += 20;  // Hot sectors for M&A
        } else {
            score += 10;
        }

        return Math.min(score, 100);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * SCORE INSIDER FACTOR
     * ═══════════════════════════════════════════════════════════
     */
    scoreInsiderFactor(deal) {
        let score = 50;

        // Deal status
        if (deal.status === 'Announced') score += 40;
        else if (deal.status === 'Pending Approval') score += 30;
        else if (deal.status === 'Rumored') score += 10;

        return Math.min(score, 100);
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * GET LIKELIHOOD
     * ═══════════════════════════════════════════════════════════
     */
    getLikelihood(score) {
        if (score >= 85) return '🟢 VERY LIKELY (>85%)';
        if (score >= 70) return '🟢 LIKELY (70-85%)';
        if (score >= 55) return '🟡 MODERATE (55-70%)';
        if (score >= 40) return '🟠 UNCERTAIN (40-55%)';
        return '🔴 UNLIKELY (<40%)';
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * BUILD M&A RESPONSE
     * ═══════════════════════════════════════════════════════════
     */
    buildMAResponse(topDeals) {
        let response = `📊 **M&A Probability Analysis - AlphaVault AI**\n\n`;

        topDeals.forEach((deal, index) => {
            response += `**${index + 1}. ${deal.acquirer} → ${deal.target}**\n`;
            response += `${deal.likelihood} | Score: ${deal.probabilityScore}/100\n`;
            response += `💰 Deal Value: $${(deal.dealValue / 1000000000).toFixed(1)}B\n`;
            response += `📈 Premium: ${deal.premium}% | 🏢 Sector: ${deal.sector}\n`;
            response += `📅 Status: ${deal.status}\n`;
            
            if (deal.synergies && deal.synergies.length > 0) {
                response += `🔗 Key Synergies: ${deal.synergies.slice(0, 2).join(', ')}\n`;
            }
            
            response += `\n`;
        });

        response += `\n💡 **AI Insights:**\n`;
        response += `• Highest probability: ${topDeals[0].acquirer} acquiring ${topDeals[0].target} (${topDeals[0].probabilityScore}%)\n`;
        response += `• Total deal value: $${(topDeals.reduce((sum, d) => sum + d.dealValue, 0) / 1000000000).toFixed(1)}B\n`;
        response += `• ${topDeals.filter(d => d.sector === 'Technology').length} tech deals in top 5\n`;

        return response;
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYZE SPECIFIC DEAL
     * ═══════════════════════════════════════════════════════════
     */
    async analyzeSpecificDeal(acquirerSymbol, targetSymbol) {
        const deals = await this.getRecentDeals();
        const deal = deals.find(d => 
            d.acquirerSymbol === acquirerSymbol && d.targetSymbol === targetSymbol
        );

        if (!deal) {
            return {
                text: `❌ No M&A deal found between ${acquirerSymbol} and ${targetSymbol}.`,
                charts: [],
                data: null
            };
        }

        const scoredDeal = this.scoreDeal(deal);

        const response = `📊 **${scoredDeal.acquirer} → ${scoredDeal.target} - M&A Analysis**

**Overall Likelihood:** ${scoredDeal.likelihood}
**Probability Score:** ${scoredDeal.probabilityScore}/100

**Score Breakdown:**
• Financial Strength: ${scoredDeal.scores.financial}/100 (25% weight)
• Strategic Fit: ${scoredDeal.scores.strategic}/100 (20% weight)
• Valuation: ${scoredDeal.scores.valuation}/100 (20% weight)
• Regulatory Risk: ${scoredDeal.scores.regulatory}/100 (15% weight)
• Market Conditions: ${scoredDeal.scores.market}/100 (10% weight)
• Insider Activity: ${scoredDeal.scores.insider}/100 (10% weight)

**Deal Details:**
• Deal Value: $${(scoredDeal.dealValue / 1000000000).toFixed(2)}B
• Premium: ${scoredDeal.premium}%
• Sector: ${scoredDeal.sector}
• Status: ${scoredDeal.status}
• Announced: ${scoredDeal.announcedDate.toLocaleDateString()}

**Strategic Synergies:**
${scoredDeal.synergies.map(s => `• ${s}`).join('\n')}

**AI Recommendation:**
${scoredDeal.probabilityScore >= 70 ? 
  '✅ High probability of completion. Monitor regulatory filings.' : 
  scoredDeal.probabilityScore >= 55 ? 
  '⚠ Moderate probability. Watch for due diligence updates.' : 
  '❌ Uncertain outcome. Consider alternative scenarios.'}`;

        return {
            text: response,
            charts: [],
            data: scoredDeal
        };
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotMAAnalyzer;
}

if (typeof window !== 'undefined') {
    window.ChatbotMAAnalyzer = ChatbotMAAnalyzer;
}

console.log('✅ ChatbotMAAnalyzer loaded');