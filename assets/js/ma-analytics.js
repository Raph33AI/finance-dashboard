/**
 * ====================================================================
 * ALPHAVAULT AI - M&A PREDICTOR - ANALYTICS ENGINE
 * ====================================================================
 * Moteur d'analyse pour calculer les scores M&A et générer insights
 */

class MAAnalytics {
    constructor() {
        this.weights = {
            unusual8K: 30,
            insiderFreeze: 25,
            institutionalAccumulation: 20,
            optionsActivity: 15,
            boardChanges: 5,
            legalCounselChanges: 5
        };
    }

    /**
     * 📊 Calcule le M&A Probability Score local (fallback)
     */
    calculateMAProbability(signals) {
        let totalScore = 0;
        const breakdown = {};

        for (const [signal, value] of Object.entries(signals)) {
            const weight = this.weights[signal] || 0;
            const contribution = value > 0 ? weight : 0;
            totalScore += contribution;
            
            breakdown[signal] = {
                detected: value > 0,
                value: value,
                weight: weight,
                contribution: contribution
            };
        }

        const probability = Math.min(totalScore, 100);

        let recommendation = 'Low Probability';
        let color = 'neutral';
        
        if (probability >= 70) {
            recommendation = 'High Probability - Monitor Closely 🔥';
            color = 'danger';
        } else if (probability >= 40) {
            recommendation = 'Medium Probability - Watch for Updates ⚡';
            color = 'warning';
        }

        return {
            totalScore,
            probability,
            breakdown,
            recommendation,
            color
        };
    }

    /**
     * 💰 Estime la prime de rachat
     */
    calculateTakeoverPremium(currentPrice, sectorAvgPremium = 30) {
        const premiumDecimal = sectorAvgPremium / 100;
        
        return {
            currentPrice: currentPrice,
            sectorAvgPremium: `${sectorAvgPremium}%`,
            estimates: {
                low: (currentPrice * (1 + premiumDecimal * 0.7)).toFixed(2),
                mid: (currentPrice * (1 + premiumDecimal)).toFixed(2),
                high: (currentPrice * (1 + premiumDecimal * 1.3)).toFixed(2)
            },
            potentialGain: {
                low: ((premiumDecimal * 0.7) * 100).toFixed(1) + '%',
                mid: (premiumDecimal * 100).toFixed(1) + '%',
                high: ((premiumDecimal * 1.3) * 100).toFixed(1) + '%'
            }
        };
    }

    /**
     * ⏱ Estime la timeline réglementaire (FTC/DOJ/EU)
     */
    estimateRegulatoryTimeline(dealSize, sectors) {
        let baseMonths = 3;
        
        // Ajustements selon la taille
        if (dealSize > 10000000000) baseMonths += 6; // > $10B
        else if (dealSize > 1000000000) baseMonths += 3; // > $1B
        
        // Secteurs sensibles
        const sensitiveSectors = ['technology', 'healthcare', 'financial services', 'defense'];
        if (sectors.some(s => sensitiveSectors.includes(s.toLowerCase()))) {
            baseMonths += 3;
        }

        return {
            estimatedMonths: baseMonths,
            estimatedDate: new Date(Date.now() + baseMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            phases: [
                { phase: 'Initial Filing', duration: '1 month', status: 'pending' },
                { phase: 'FTC/DOJ Review', duration: `${Math.ceil(baseMonths / 2)} months`, status: 'pending' },
                { phase: 'Second Request (if any)', duration: `${Math.floor(baseMonths / 3)} months`, status: 'conditional' },
                { phase: 'Final Approval', duration: '1 month', status: 'pending' }
            ],
            risks: dealSize > 5000000000 ? 'High - Antitrust scrutiny likely' : 'Medium'
        };
    }

    /**
     * 🎯 Analyse le score de risque d'intégration
     */
    analyzeIntegrationRisk(dealData) {
        let riskScore = 0;
        const factors = {};

        // Culture clash risk (mock - nécessite NLP dans une vraie implémentation)
        const culturalRisk = Math.random() > 0.5 ? 'Medium' : 'Low';
        factors.culturalRisk = culturalRisk;
        riskScore += culturalRisk === 'High' ? 30 : (culturalRisk === 'Medium' ? 15 : 5);

        // Debt burden
        const debtRatio = dealData.debtRatio || 0.5;
        factors.debtBurden = debtRatio > 0.7 ? 'High' : (debtRatio > 0.4 ? 'Medium' : 'Low');
        riskScore += debtRatio > 0.7 ? 25 : (debtRatio > 0.4 ? 12 : 5);

        // Synergy potential
        const synergyPotential = dealData.synergyPotential || 'Medium';
        factors.synergyPotential = synergyPotential;
        riskScore += synergyPotential === 'Low' ? 20 : (synergyPotential === 'Medium' ? 10 : 0);

        // Regulatory risk
        const regulatoryRisk = dealData.regulatoryRisk || 'Low';
        factors.regulatoryRisk = regulatoryRisk;
        riskScore += regulatoryRisk === 'High' ? 25 : (regulatoryRisk === 'Medium' ? 12 : 5);

        const overallRisk = riskScore > 60 ? 'High' : (riskScore > 30 ? 'Medium' : 'Low');

        return {
            overallRisk,
            score: riskScore,
            factors,
            recommendation: riskScore > 60 
                ? 'High integration risk - Proceed with caution' 
                : (riskScore > 30 ? 'Moderate risk - Standard due diligence required' : 'Low risk - Favorable conditions')
        };
    }

    /**
     * 📈 Génère des insights M&A
     */
    generateInsights(dashboardData) {
        const insights = [];

        // Insight 1: Volume d'activité
        if (dashboardData.criticalAlerts > 10) {
            insights.push({
                type: 'high-activity',
                icon: '🔥',
                title: 'High M&A Activity Detected',
                description: `${dashboardData.criticalAlerts} critical 8-K alerts in the last 30 days. Market is active.`,
                severity: 'warning'
            });
        }

        // Insight 2: Secteurs chauds
        if (dashboardData.stats?.topSectors) {
            const topSector = dashboardData.stats.topSectors[0];
            insights.push({
                type: 'sector-trend',
                icon: '📊',
                title: `${topSector.sector} Leading M&A Activity`,
                description: `${topSector.deals} deals in ${topSector.sector} sector.`,
                severity: 'info'
            });
        }

        // Insight 3: Taille moyenne des deals
        insights.push({
            type: 'deal-size',
            icon: '💰',
            title: 'Average Deal Size',
            description: `Current average: ${dashboardData.stats?.avgDealSize || 'N/A'}`,
            severity: 'info'
        });

        return insights;
    }

    /**
     * 🔍 Filtre les alertes par priorité
     */
    filterAlertsByPriority(alerts, priority = 'all') {
        if (priority === 'all') return alerts;
        return alerts.filter(alert => alert.priority === priority);
    }

    /**
     * 📅 Trie les alertes par date
     */
    sortAlertsByDate(alerts, ascending = false) {
        return [...alerts].sort((a, b) => {
            const dateA = new Date(a.filedDate || a.updated);
            const dateB = new Date(b.filedDate || b.updated);
            return ascending ? dateA - dateB : dateB - dateA;
        });
    }
}

// Instance globale
const maAnalytics = new MAAnalytics();