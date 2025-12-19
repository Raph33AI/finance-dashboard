/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧠 M&A ANALYTICS ENGINE
 * ═══════════════════════════════════════════════════════════════════
 * Moteur d'analyse pour calculer les M&A Probability Scores,
 * Deal Comps, Integration Risk, Takeover Premiums, etc.
 * ═══════════════════════════════════════════════════════════════════
 */

class MAAnalyticsEngine {
    constructor(secClient) {
        this.client = secClient;
        this.sectorMultiples = this.initializeSectorMultiples();
        this.serialAcquirers = this.initializeSerialAcquirers();
        
        console.log('🧠 M&A Analytics Engine initialized');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🎯 M&A PROBABILITY SCORE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Calculate M&A Probability Score (0-100)
     */
    async calculateMAProbability(ticker, options = {}) {
        console.log(`🎯 Calculating M&A Probability for ${ticker}...`);
        
        try {
            // Get CIK
            const cikData = await this.client.tickerToCIK(ticker);
            const cik = cikData.cik;
            const companyName = cikData.companyName;

            // Collect all signals in parallel
            const [
                eightKActivity,
                s4Activity,
                materialEvents
            ] = await Promise.all([
                this.client.get8KBulk({ days: 90, items: '1.01,2.01,5.02' }),
                this.client.getS4Feed({ cik, limit: 50 }),
                this.client.getMaterialEvents({ cik, days: 90 })
            ]);

            // Filter data for this company
            const companyEightK = eightKActivity.filings?.filter(f => f.cik === cik) || [];

            // Calculate individual signals
            const signals = {
                unusualEightKActivity: this.analyzeUnusual8KActivity(companyEightK),
                materialAgreements: this.analyzeMaterialAgreements(materialEvents),
                leadershipChanges: this.analyzeLeadershipChanges(companyEightK),
                boardMeetings: this.analyzeBoardActivity(companyEightK),
                legalCounselChanges: this.analyzeLegalCounselChanges(companyEightK),
                // Note: Insider/institutional data would need additional APIs
                insiderFreeze: 0, // Placeholder
                institutionalAccumulation: 0 // Placeholder
            };

            // Calculate weighted score
            const weights = {
                unusualEightKActivity: 25,
                materialAgreements: 20,
                leadershipChanges: 15,
                boardMeetings: 15,
                legalCounselChanges: 10,
                insiderFreeze: 10,
                institutionalAccumulation: 5
            };

            let totalScore = 0;
            let totalWeight = 0;

            for (const [signal, value] of Object.entries(signals)) {
                const weight = weights[signal] || 0;
                totalScore += value * weight;
                totalWeight += weight;
            }

            const probabilityScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

            // Determine risk level
            let riskLevel = 'LOW';
            let riskColor = '#10b981';
            
            if (probabilityScore >= 70) {
                riskLevel = 'VERY HIGH';
                riskColor = '#ef4444';
            } else if (probabilityScore >= 50) {
                riskLevel = 'HIGH';
                riskColor = '#f59e0b';
            } else if (probabilityScore >= 30) {
                riskLevel = 'MODERATE';
                riskColor = '#3b82f6';
            }

            return {
                ticker,
                companyName,
                cik,
                probabilityScore,
                riskLevel,
                riskColor,
                signals,
                weights,
                dataQuality: this.assessDataQuality(signals),
                timestamp: new Date().toISOString(),
                breakdown: this.generateScoreBreakdown(signals, weights)
            };

        } catch (error) {
            console.error(`❌ Failed to calculate M&A probability for ${ticker}:`, error);
            throw error;
        }
    }

    /**
     * Analyze unusual 8-K activity
     */
    analyzeUnusual8KActivity(filings) {
        if (!filings || filings.length === 0) return 0;

        // Count material events in last 90 days
        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

        const recentFilings = filings.filter(f => 
            new Date(f.filedDate).getTime() > thirtyDaysAgo
        ).length;

        const priorFilings = filings.filter(f => {
            const date = new Date(f.filedDate).getTime();
            return date > sixtyDaysAgo && date <= thirtyDaysAgo;
        }).length;

        // Unusual if recent activity > 2x prior activity
        const ratio = priorFilings > 0 ? recentFilings / priorFilings : 1;

        if (ratio >= 3) return 100;
        if (ratio >= 2) return 75;
        if (ratio >= 1.5) return 50;
        if (recentFilings >= 3) return 30;
        
        return 0;
    }

    /**
     * Analyze material agreements (Item 1.01)
     */
    analyzeMaterialAgreements(materialEvents) {
        if (!materialEvents?.categorized?.materialAgreements) return 0;

        const agreements = materialEvents.categorized.materialAgreements;
        const count = agreements.length;

        // High score if multiple material agreements in short period
        if (count >= 3) return 100;
        if (count === 2) return 70;
        if (count === 1) return 40;
        
        return 0;
    }

    /**
     * Analyze leadership changes (Item 5.02)
     */
    analyzeLeadershipChanges(filings) {
        const leadershipFilings = filings.filter(f => f.isLeadershipChange);
        
        if (leadershipFilings.length >= 3) return 90;
        if (leadershipFilings.length === 2) return 60;
        if (leadershipFilings.length === 1) return 30;
        
        return 0;
    }

    /**
     * Analyze board meeting frequency
     */
    analyzeBoardActivity(filings) {
        // Look for mentions of board meetings in summaries
        const boardMentions = filings.filter(f => 
            /board.*meeting|special.*committee/i.test(f.summary || '')
        );

        if (boardMentions.length >= 2) return 80;
        if (boardMentions.length === 1) return 40;
        
        return 0;
    }

    /**
     * Analyze legal counsel changes
     */
    analyzeLegalCounselChanges(filings) {
        // Look for M&A law firms in 8-K summaries
        const maLawFirms = [
            'Wachtell', 'Skadden', 'Cravath', 'Sullivan & Cromwell',
            'Davis Polk', 'Simpson Thacher', 'Kirkland & Ellis'
        ];

        const hasMALawFirm = filings.some(f => {
            const summary = (f.summary || '').toLowerCase();
            return maLawFirms.some(firm => summary.includes(firm.toLowerCase()));
        });

        return hasMALawFirm ? 70 : 0;
    }

    /**
     * Assess data quality
     */
    assessDataQuality(signals) {
        const signalsWithData = Object.values(signals).filter(v => v > 0).length;
        const totalSignals = Object.keys(signals).length;
        
        const quality = Math.round((signalsWithData / totalSignals) * 100);
        
        if (quality >= 70) return 'HIGH';
        if (quality >= 40) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * Generate detailed score breakdown
     */
    generateScoreBreakdown(signals, weights) {
        return Object.entries(signals).map(([signal, value]) => ({
            signal: this.humanizeSignalName(signal),
            value,
            weight: weights[signal] || 0,
            contribution: Math.round(value * (weights[signal] || 0) / 100),
            status: value >= 70 ? 'HIGH' : value >= 40 ? 'MEDIUM' : 'LOW'
        })).sort((a, b) => b.contribution - a.contribution);
    }

    humanizeSignalName(signal) {
        const names = {
            unusualEightKActivity: 'Unusual 8-K Activity',
            materialAgreements: 'Material Agreements',
            leadershipChanges: 'Leadership Changes',
            boardMeetings: 'Board Meeting Frequency',
            legalCounselChanges: 'M&A Legal Counsel',
            insiderFreeze: 'Insider Selling Freeze',
            institutionalAccumulation: 'Institutional Accumulation'
        };
        return names[signal] || signal;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💰 DEAL COMPS DATABASE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Get deal comps by sector
     */
    async getDealComps(sector, years = 2) {
        console.log(`💰 Loading deal comps for ${sector} (${years} years)...`);
        
        const days = years * 365;
        const s4Data = await this.client.getS4Bulk({ days, max: 500 });

        const deals = [];

        for (const filing of s4Data.filings || []) {
            try {
                const content = await this.client.getS4ContentParsed(filing.accessionNumber, filing.cik);
                const parsed = content.parsedEnhanced || content.parsed;

                if (parsed?.financialTerms?.dealValue) {
                    deals.push({
                        companyName: filing.companyName,
                        filedDate: filing.filedDate,
                        dealValue: parsed.financialTerms.dealValue,
                        dealType: parsed.dealStructure?.dealType,
                        exchangeRatio: parsed.financialTerms?.exchangeRatio,
                        premiumOffered: parsed.financialTerms?.premiumOffered,
                        synergies: parsed.synergies?.totalSynergies,
                        // TODO: Calculate multiples when we have financial data
                        evSales: null,
                        evEbitda: null
                    });
                }
            } catch (error) {
                console.warn(`Failed to parse deal ${filing.accessionNumber}`);
            }
        }

        // Calculate statistics
        const stats = this.calculateDealStats(deals);

        return {
            sector,
            period: `${years} years`,
            totalDeals: deals.length,
            deals: deals.sort((a, b) => new Date(b.filedDate) - new Date(a.filedDate)),
            stats
        };
    }

    /**
     * Calculate deal statistics
     */
    calculateDealStats(deals) {
        if (deals.length === 0) return null;

        const dealValues = deals.map(d => d.dealValue).filter(v => v);
        const premiums = deals.map(d => d.premiumOffered).filter(v => v);

        return {
            avgDealValue: this.average(dealValues),
            medianDealValue: this.median(dealValues),
            minDealValue: Math.min(...dealValues),
            maxDealValue: Math.max(...dealValues),
            avgPremium: this.average(premiums),
            medianPremium: this.median(premiums),
            totalDeals: deals.length
        };
    }

    /**
     * Initialize sector multiples (example data)
     */
    initializeSectorMultiples() {
        return {
            'Technology': { evSales: 8.5, evEbitda: 22.0 },
            'Healthcare': { evSales: 5.2, evEbitda: 18.5 },
            'Financial': { evSales: 3.8, evEbitda: 12.0 },
            'Consumer': { evSales: 2.5, evEbitda: 14.0 },
            'Industrial': { evSales: 1.8, evEbitda: 11.5 },
            'Energy': { evSales: 1.5, evEbitda: 9.0 },
            'Telecom': { evSales: 2.2, evEbitda: 10.5 },
            'Utilities': { evSales: 2.0, evEbitda: 9.5 }
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🏢 ACQUIRER PROFILE ANALYSIS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Get serial acquirers by sector
     */
    async getSerialAcquirers(sector, years = 5) {
        console.log(`🏢 Analyzing serial acquirers in ${sector}...`);
        
        const days = years * 365;
        const eightKData = await this.client.get8KBulk({ days, items: '2.01', max: 1000 });

        // Count acquisitions by company
        const acquisitionCounts = {};
        
        for (const filing of eightKData.filings || []) {
            if (filing.isAcquisition) {
                const company = filing.companyName;
                acquisitionCounts[company] = (acquisitionCounts[company] || 0) + 1;
            }
        }

        // Sort by acquisition count
        const serialAcquirers = Object.entries(acquisitionCounts)
            .map(([company, count]) => ({ company, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

        return {
            sector,
            period: `${years} years`,
            serialAcquirers,
            totalAcquisitions: eightKData.count
        };
    }

    /**
     * Initialize known serial acquirers
     */
    initializeSerialAcquirers() {
        return {
            'Technology': ['Microsoft', 'Oracle', 'Cisco', 'Salesforce', 'Adobe'],
            'Healthcare': ['UnitedHealth', 'CVS Health', 'Johnson & Johnson', 'Pfizer'],
            'Financial': ['JPMorgan Chase', 'Bank of America', 'Wells Fargo'],
            'Consumer': ['Procter & Gamble', 'Nestlé', 'Unilever'],
            'Industrial': ['General Electric', 'Honeywell', '3M']
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚠ INTEGRATION RISK SCORE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Calculate integration risk for a deal
     */
    calculateIntegrationRisk(dealData) {
        const risks = {
            culturalMismatch: this.assessCulturalRisk(dealData),
            debtLevel: this.assessDebtRisk(dealData),
            synergyRealization: this.assessSynergyRisk(dealData),
            regulatoryComplexity: this.assessRegulatoryRisk(dealData),
            integrationTimeline: this.assessTimelineRisk(dealData)
        };

        const weights = {
            culturalMismatch: 25,
            debtLevel: 20,
            synergyRealization: 25,
            regulatoryComplexity: 15,
            integrationTimeline: 15
        };

        let totalScore = 0;
        let totalWeight = 0;

        for (const [risk, value] of Object.entries(risks)) {
            totalScore += value * weights[risk];
            totalWeight += weights[risk];
        }

        const overallRisk = Math.round(totalScore / totalWeight);

        return {
            overallRisk,
            risks,
            weights,
            riskLevel: overallRisk >= 70 ? 'HIGH' : overallRisk >= 40 ? 'MEDIUM' : 'LOW'
        };
    }

    assessCulturalRisk(dealData) {
        // Placeholder: Would need company culture data
        return 50;
    }

    assessDebtRisk(dealData) {
        const dealValue = dealData?.financialTerms?.dealValue || 0;
        
        if (dealValue > 10000) return 70;
        if (dealValue > 5000) return 50;
        return 30;
    }

    assessSynergyRisk(dealData) {
        const synergies = dealData?.synergies?.totalSynergies;
        const dealValue = dealData?.financialTerms?.dealValue;
        
        if (synergies && dealValue) {
            const synergyRatio = synergies / dealValue;
            if (synergyRatio > 0.2) return 30;
            if (synergyRatio > 0.1) return 50;
            return 70;
        }
        return 60;
    }

    assessRegulatoryRisk(dealData) {
        const approvals = dealData?.regulatory?.approvalsRequired || [];
        
        if (approvals.some(a => a.authority === 'FTC') && approvals.some(a => a.authority === 'DOJ')) return 80;
        if (approvals.some(a => a.authority === 'FTC') || approvals.some(a => a.authority === 'DOJ')) return 60;
        if (approvals.length > 2) return 50;
        return 30;
    }

    assessTimelineRisk(dealData) {
        const closingDate = dealData?.dealStructure?.closingDate;
        
        if (closingDate) {
            if (/2025|2026/.test(closingDate)) return 70;
            if (/2024/.test(closingDate)) return 40;
        }
        return 50;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💵 TAKEOVER PREMIUM CALCULATOR
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Calculate expected takeover premium based on sector comps
     */
    calculateTakeoverPremium(currentPrice, sector, marketCap) {
        const multiples = this.sectorMultiples[sector] || this.sectorMultiples['Industrial'];
        
        // Typical takeover premiums by sector
        const sectorPremiums = {
            'Technology': 35,
            'Healthcare': 30,
            'Financial': 25,
            'Consumer': 28,
            'Industrial': 25,
            'Energy': 22,
            'Telecom': 24,
            'Utilities': 20
        };

        const basePremium = sectorPremiums[sector] || 25;
        
        // Adjust for company size
        let sizeAdjustment = 0;
        if (marketCap < 1000) sizeAdjustment = 5; // Small caps get higher premiums
        if (marketCap > 50000) sizeAdjustment = -5; // Large caps get lower premiums

        const estimatedPremium = basePremium + sizeAdjustment;
        const targetPrice = currentPrice * (1 + estimatedPremium / 100);

        return {
            currentPrice,
            estimatedPremium,
            targetPrice,
            sector,
            marketCap,
            confidenceLevel: this.calculateConfidence(marketCap)
        };
    }

    calculateConfidence(marketCap) {
        if (marketCap >= 5000 && marketCap <= 50000) return 'HIGH';
        if (marketCap >= 1000 && marketCap <= 100000) return 'MEDIUM';
        return 'LOW';
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📅 REGULATORY TIMELINE PREDICTION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Predict regulatory approval timeline
     */
    predictRegulatoryTimeline(dealData) {
        const approvals = dealData?.regulatory?.approvalsRequired || [];
        
        let totalMonths = 0;
        const timelines = {};

        // FTC/DOJ review
        if (approvals.some(a => a.authority === 'FTC') || approvals.some(a => a.authority === 'DOJ')) {
            const dealValue = dealData?.financialTerms?.dealValue || 0;
            const months = dealValue > 10000 ? 12 : 6;
            timelines['FTC/DOJ Review'] = months;
            totalMonths += months;
        }

        // SEC review
        if (approvals.some(a => a.authority === 'SEC')) {
            timelines['SEC Review'] = 3;
            totalMonths += 3;
        }

        // European Commission
        if (approvals.some(a => a.authority === 'EC')) {
            timelines['European Commission'] = 9;
            totalMonths += 9;
        }

        // CFIUS (foreign investment)
        if (approvals.some(a => a.authority === 'CFIUS')) {
            timelines['CFIUS Review'] = 6;
            totalMonths += 6;
        }

        // Shareholder vote
        if (approvals.some(a => a.authority === 'Shareholders')) {
            timelines['Shareholder Vote'] = 2;
            totalMonths += 2;
        }

        // Base timeline if no approvals specified
        if (totalMonths === 0) {
            totalMonths = 4;
            timelines['Standard Close'] = 4;
        }

        const estimatedCloseDate = new Date();
        estimatedCloseDate.setMonth(estimatedCloseDate.getMonth() + totalMonths);

        return {
            totalMonths,
            timelines,
            estimatedCloseDate: estimatedCloseDate.toISOString().split('T')[0],
            complexity: totalMonths > 12 ? 'HIGH' : totalMonths > 6 ? 'MEDIUM' : 'LOW'
        };
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 📊 BREAK-UP FEE ANALYSIS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Analyze break-up fee structure
     */
    analyzeBreakUpFee(dealData) {
        const dealValue = dealData?.financialTerms?.dealValue;
        const breakUpFee = dealData?.financialTerms?.breakUpFee;

        if (!breakUpFee || !dealValue) {
            return {
                hasBreakUpFee: false,
                message: 'No break-up fee information available'
            };
        }

        const feePercentage = (breakUpFee / dealValue) * 100;

        // Typical break-up fees are 2-4% of deal value
        let assessment = 'STANDARD';
        if (feePercentage > 5) assessment = 'HIGH';
        if (feePercentage < 2) assessment = 'LOW';

        return {
            hasBreakUpFee: true,
            breakUpFee,
            dealValue,
            feePercentage: feePercentage.toFixed(2),
            assessment,
            marketStandard: '2-4%',
            implications: this.getBreakUpFeeImplications(assessment)
        };
    }

    getBreakUpFeeImplications(assessment) {
        const implications = {
            'HIGH': 'High break-up fee suggests strong deal protection. Deal is likely to close.',
            'STANDARD': 'Standard break-up fee. Normal deal protection.',
            'LOW': 'Low break-up fee. Less deal protection, higher risk of termination.'
        };
        return implications[assessment] || '';
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛠 UTILITY FUNCTIONS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    average(arr) {
        if (!arr || arr.length === 0) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    median(arr) {
        if (!arr || arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.MAAnalyticsEngine = MAAnalyticsEngine;
}