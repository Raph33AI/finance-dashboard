/* ========================================
   ANALYSEUR IPO INTELLIGENT
   Système de scoring et recommandations
   ======================================== */

class IPOAnalyzer {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.scoringWeights = {
            marketCap: 0.20,
            growthRate: 0.25,
            industry: 0.15,
            timing: 0.15,
            financialHealth: 0.25
        };
    }

    /**
     * Analyse une IPO et génère un score de potentiel
     */
    async analyzeIPO(ipoData) {
        try {
            const scores = {
                marketCapScore: this.evaluateMarketCap(ipoData.marketCap || 0),
                growthScore: await this.evaluateGrowth(ipoData),
                industryScore: this.evaluateIndustry(ipoData.industry || ipoData.exchange),
                timingScore: this.evaluateTiming(ipoData.date),
                financialScore: this.evaluateFinancials(ipoData)
            };

            const totalScore = (
                scores.marketCapScore * this.scoringWeights.marketCap +
                scores.growthScore * this.scoringWeights.growthRate +
                scores.industryScore * this.scoringWeights.industry +
                scores.timingScore * this.scoringWeights.timing +
                scores.financialScore * this.scoringWeights.financialHealth
            );

            return {
                symbol: ipoData.symbol,
                name: ipoData.name,
                totalScore: Math.round(totalScore),
                rating: this.getRating(totalScore),
                scores: scores,
                recommendation: this.generateRecommendation(totalScore, scores),
                risks: this.identifyRisks(scores, ipoData),
                opportunities: this.identifyOpportunities(scores, ipoData),
                priceRange: ipoData.priceRange || 'TBD',
                shares: ipoData.shares || 'TBD',
                date: ipoData.date
            };

        } catch (error) {
            console.error('IPO Analysis Error:', error);
            return null;
        }
    }

    /**
     * Évalue la capitalisation boursière
     */
    evaluateMarketCap(marketCap) {
        if (!marketCap || marketCap === 0) return 50;
        
        const capInBillions = marketCap / 1000000000;
        
        if (capInBillions > 10) return 85; // Large cap - stable
        if (capInBillions > 2) return 75;  // Mid cap - bon équilibre
        if (capInBillions > 0.5) return 65; // Small cap - potentiel élevé
        return 50; // Micro cap - très risqué
    }

    /**
     * Évalue le potentiel de croissance
     */
    async evaluateGrowth(ipoData) {
        try {
            // Analyse des tendances du secteur
            const industryGrowth = await this.getIndustryGrowthRate(ipoData.industry || ipoData.exchange);
            
            // Analyse de la taille du marché adressable
            const marketSize = this.estimateMarketSize(ipoData.industry || ipoData.exchange);
            
            // Score basé sur les deux facteurs
            let score = 50;
            
            if (industryGrowth > 20) score += 30;
            else if (industryGrowth > 10) score += 20;
            else if (industryGrowth > 5) score += 10;
            
            if (marketSize === 'large') score += 20;
            else if (marketSize === 'medium') score += 10;
            
            return Math.min(score, 100);
            
        } catch (error) {
            return 60; // Score par défaut
        }
    }

    /**
     * Évalue le secteur d'activité
     */
    evaluateIndustry(industry) {
        if (!industry) return 65;
        
        const industryLower = industry.toLowerCase();
        
        const hotSectors = {
            'technology': 90,
            'tech': 90,
            'healthcare': 85,
            'health': 85,
            'fintech': 88,
            'financial technology': 88,
            'ai': 95,
            'artificial intelligence': 95,
            'machine learning': 95,
            'clean energy': 87,
            'renewable': 87,
            'biotechnology': 82,
            'biotech': 82,
            'cybersecurity': 91,
            'security': 88,
            'e-commerce': 80,
            'ecommerce': 80,
            'cloud': 93,
            'saas': 92,
            'software': 88,
            'semiconductors': 89,
            'chips': 89,
            'electric vehicle': 86,
            'ev': 86,
            'blockchain': 75,
            'crypto': 70
        };

        for (const [key, value] of Object.entries(hotSectors)) {
            if (industryLower.includes(key)) {
                return value;
            }
        }

        return 65; // Score par défaut
    }

    /**
     * Évalue le timing de l'IPO
     */
    evaluateTiming(ipoDate) {
        if (!ipoDate) return 70;
        
        const date = new Date(ipoDate);
        const now = new Date();
        const monthsDiff = (date - now) / (1000 * 60 * 60 * 24 * 30);
        
        // IPOs futures (0-6 mois) ont un bon timing
        if (monthsDiff > 0 && monthsDiff <= 6) return 85; // Future proche
        if (monthsDiff > 6 && monthsDiff <= 12) return 75; // Future
        if (monthsDiff < 0 && monthsDiff >= -3) return 80; // Très récente
        if (monthsDiff < -3 && monthsDiff >= -6) return 70; // Récente
        if (monthsDiff < -6 && monthsDiff >= -12) return 65; // Première année
        
        return 60; // Plus ancienne
    }

    /**
     * Évalue la santé financière
     */
    evaluateFinancials(ipoData) {
        let score = 50;
        
        // Revenu
        if (ipoData.revenue) {
            if (ipoData.revenue > 1000000000) score += 15; // > 1B
            else if (ipoData.revenue > 100000000) score += 10; // > 100M
            else if (ipoData.revenue > 10000000) score += 5; // > 10M
        }
        
        // Profitabilité
        if (ipoData.profitable === true) {
            score += 20;
        } else if (ipoData.pathToProfitability) {
            score += 10;
        }
        
        // Cash position
        if (ipoData.cashPosition === 'strong') score += 15;
        else if (ipoData.cashPosition === 'adequate') score += 10;
        else score += 5;
        
        return Math.min(score, 100);
    }

    /**
     * Obtient le taux de croissance du secteur
     */
    async getIndustryGrowthRate(industry) {
        if (!industry) return 8;
        
        const industryLower = industry.toLowerCase();
        
        const growthRates = {
            'technology': 15,
            'tech': 15,
            'healthcare': 12,
            'health': 12,
            'fintech': 18,
            'ai': 25,
            'artificial intelligence': 25,
            'clean energy': 20,
            'renewable': 20,
            'biotechnology': 14,
            'biotech': 14,
            'cybersecurity': 22,
            'e-commerce': 16,
            'ecommerce': 16,
            'cloud': 19,
            'saas': 18,
            'semiconductors': 17,
            'chips': 17,
            'electric vehicle': 23,
            'ev': 23
        };

        for (const [key, value] of Object.entries(growthRates)) {
            if (industryLower.includes(key)) {
                return value;
            }
        }

        return 8; // Croissance par défaut
    }

    /**
     * Estime la taille du marché
     */
    estimateMarketSize(industry) {
        if (!industry) return 'medium';
        
        const industryLower = industry.toLowerCase();
        
        const largeSectors = ['technology', 'tech', 'healthcare', 'health', 'e-commerce', 'cloud', 'software'];
        const mediumSectors = ['fintech', 'cybersecurity', 'clean energy', 'biotech', 'saas'];
        
        for (const sector of largeSectors) {
            if (industryLower.includes(sector)) return 'large';
        }
        
        for (const sector of mediumSectors) {
            if (industryLower.includes(sector)) return 'medium';
        }
        
        return 'small';
    }

    /**
     * Détermine la notation
     */
    getRating(score) {
        if (score >= 85) return 'Strong Buy 🚀';
        if (score >= 75) return 'Buy 👍';
        if (score >= 60) return 'Hold ⚖️';
        if (score >= 50) return 'Moderate Risk ⚠️';
        return 'High Risk 🔴';
    }

    /**
     * Génère une recommandation personnalisée
     */
    generateRecommendation(totalScore, scores) {
        let recommendation = '';
        
        if (totalScore >= 85) {
            recommendation = "🌟 Excellente opportunité ! Cette IPO présente des fondamentaux solides et un fort potentiel de croissance. Idéale pour un portefeuille de croissance. ";
        } else if (totalScore >= 75) {
            recommendation = "👍 Opportunité intéressante. Les indicateurs sont positifs, avec un bon équilibre risque/rendement. À considérer sérieusement. ";
        } else if (totalScore >= 60) {
            recommendation = "⚖️ Opportunité modérée. À considérer selon votre profil de risque et horizon d'investissement. Surveillance recommandée. ";
        } else {
            recommendation = "⚠️ Opportunité risquée. Nécessite une analyse approfondie et une forte tolérance au risque. Pour investisseurs avertis uniquement. ";
        }

        // Ajout de détails spécifiques
        if (scores.growthScore > 80) {
            recommendation += "Le secteur affiche une croissance exceptionnelle. ";
        }
        if (scores.financialScore > 80) {
            recommendation += "La santé financière est excellente. ";
        }
        if (scores.industryScore > 85) {
            recommendation += "Positionnée dans un secteur très dynamique. ";
        }

        return recommendation;
    }

    /**
     * Identifie les risques
     */
    identifyRisks(scores, ipoData) {
        const risks = [];
        
        if (scores.financialScore < 60) {
            risks.push("⚠️ Santé financière fragile - Besoin de financement potentiel");
        }
        if (scores.marketCapScore < 60) {
            risks.push("⚠️ Capitalisation limitée - Volatilité accrue attendue");
        }
        if (scores.industryScore < 70) {
            risks.push("⚠️ Secteur moins dynamique - Croissance limitée");
        }
        if (scores.timingScore < 65) {
            risks.push("⚠️ Timing de marché défavorable");
        }
        if (!ipoData.profitable && !ipoData.pathToProfitability) {
            risks.push("⚠️ Absence de profitabilité et de visibilité sur le chemin vers la rentabilité");
        }
        
        if (risks.length === 0) {
            risks.push("✅ Profil de risque modéré - Surveillance standard recommandée");
        }
        
        return risks;
    }

    /**
     * Identifie les opportunités
     */
    identifyOpportunities(scores, ipoData) {
        const opportunities = [];
        
        if (scores.growthScore > 80) {
            opportunities.push("🚀 Fort potentiel de croissance sectorielle à long terme");
        }
        if (scores.industryScore > 85) {
            opportunities.push("💡 Secteur innovant en forte expansion - Positionnement stratégique");
        }
        if (scores.timingScore > 80) {
            opportunities.push("⏰ Timing favorable pour l'entrée - Window d'opportunité");
        }
        if (scores.financialScore > 80) {
            opportunities.push("💰 Fondamentaux financiers solides - Base saine pour la croissance");
        }
        if (scores.marketCapScore >= 75 && scores.marketCapScore <= 85) {
            opportunities.push("📈 Taille idéale pour croissance significative - Sweet spot");
        }
        
        if (opportunities.length === 0) {
            opportunities.push("📊 Opportunité standard - Suivre les earnings et actualités");
        }
        
        return opportunities;
    }

    /**
     * Trouve les meilleures IPOs à venir
     */
    async findTopUpcomingIPOs(limit = 5) {
        try {
            // Récupération des IPOs via Finnhub
            const today = new Date();
            const from = today.toISOString().split('T')[0];
            const to = new Date(today.setMonth(today.getMonth() + 6)).toISOString().split('T')[0];
            
            const ipoCalendar = await this.apiClient.getIPOCalendar(from, to);
            
            if (!ipoCalendar || !ipoCalendar.ipoCalendar || ipoCalendar.ipoCalendar.length === 0) {
                console.log('No IPO data available');
                return [];
            }

            // Analyse de chaque IPO
            const analyzedIPOs = await Promise.all(
                ipoCalendar.ipoCalendar.map(ipo => this.analyzeIPO(ipo))
            );

            // Filtrage et tri par score
            return analyzedIPOs
                .filter(ipo => ipo !== null)
                .sort((a, b) => b.totalScore - a.totalScore)
                .slice(0, limit);

        } catch (error) {
            console.error('Error finding top IPOs:', error);
            return [];
        }
    }

    /**
     * Recherche d'IPOs par critères
     */
    async searchIPOs(criteria) {
        try {
            const { industry, minScore, maxRisk, dateRange } = criteria;
            
            const today = new Date();
            const from = dateRange?.from || today.toISOString().split('T')[0];
            const to = dateRange?.to || new Date(today.setMonth(today.getMonth() + 12)).toISOString().split('T')[0];
            
            const allIPOs = await this.apiClient.getIPOCalendar(from, to);
            
            if (!allIPOs || !allIPOs.ipoCalendar) {
                return [];
            }
            
            const analyzedIPOs = await Promise.all(
                allIPOs.ipoCalendar.map(ipo => this.analyzeIPO(ipo))
            );

            return analyzedIPOs.filter(ipo => {
                if (!ipo) return false;
                if (industry && !ipo.name.toLowerCase().includes(industry.toLowerCase())) return false;
                if (minScore && ipo.totalScore < minScore) return false;
                if (maxRisk === 'low' && ipo.totalScore < 75) return false;
                if (maxRisk === 'medium' && ipo.totalScore < 60) return false;
                return true;
            }).sort((a, b) => b.totalScore - a.totalScore);

        } catch (error) {
            console.error('IPO Search Error:', error);
            return [];
        }
    }

    /**
     * Génère un rapport IPO complet
     */
    generateIPOReport(analysis) {
        return {
            symbol: analysis.symbol,
            name: analysis.name,
            score: analysis.totalScore,
            rating: analysis.rating,
            summary: analysis.recommendation,
            strengths: analysis.opportunities,
            weaknesses: analysis.risks,
            metrics: {
                marketCapScore: analysis.scores.marketCapScore,
                growthScore: analysis.scores.growthScore,
                industryScore: analysis.scores.industryScore,
                timingScore: analysis.scores.timingScore,
                financialScore: analysis.scores.financialScore
            },
            priceRange: analysis.priceRange,
            shares: analysis.shares,
            date: analysis.date,
            generatedAt: new Date().toISOString()
        };
    }
}

// Export global
window.IPOAnalyzer = IPOAnalyzer;