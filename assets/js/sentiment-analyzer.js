/**
 * ════════════════════════════════════════════════════════════════
 * SENTIMENT ANALYZER - Version Ultra-Améliorée
 * Analyse NLP avancée du sentiment financier
 * ════════════════════════════════════════════════════════════════
 */

class SentimentAnalyzer {
    constructor() {
        // ═══════════════════════════════════════════════════════
        // DICTIONNAIRES DE MOTS-CLÉS FINANCIERS
        // ═══════════════════════════════════════════════════════
        
        // Mots ultra-positifs (score x3)
        this.veryPositiveWords = [
            'skyrocket', 'soar', 'surge', 'explode', 'breakthrough', 'blockbuster',
            'game-changer', 'revolutionary', 'dominant', 'crushing', 'stellar',
            'exceptional', 'remarkable', 'extraordinary', 'phenomenal', 'spectacular'
        ];

        // Mots positifs (score x1.5)
        this.positiveWords = [
            'gain', 'rally', 'jump', 'climb', 'rise', 'boost', 'upgrade',
            'beat', 'exceed', 'outperform', 'strong', 'robust', 'solid', 'growth',
            'profit', 'record', 'high', 'breakout', 'bullish', 'optimistic',
            'positive', 'win', 'success', 'innovation', 'expansion', 'recovery',
            'upside', 'potential', 'opportunity', 'confident', 'promising',
            'impressive', 'excellent', 'outstanding', 'accelerate', 'momentum',
            'thrive', 'prosper', 'advance', 'improve', 'strengthen', 'deliver'
        ];

        // Mots ultra-négatifs (score x3)
        this.veryNegativeWords = [
            'collapse', 'catastrophic', 'disaster', 'plummet', 'hemorrhage',
            'devastating', 'crippling', 'toxic', 'implode', 'meltdown',
            'crisis', 'panic', 'crash', 'plunge', 'tumble'
        ];

        // Mots négatifs (score x1.5)
        this.negativeWords = [
            'loss', 'fall', 'drop', 'decline', 'slump', 'sink',
            'miss', 'underperform', 'weak', 'poor', 'disappointing',
            'concern', 'risk', 'threat', 'downturn', 'recession',
            'bearish', 'pessimistic', 'negative', 'failure', 'bankrupt',
            'debt', 'lawsuit', 'scandal', 'warning', 'downgrade',
            'cut', 'slash', 'layoff', 'struggle', 'trouble',
            'volatile', 'uncertainty', 'fear', 'decline', 'deteriorate',
            'weaken', 'suffer', 'drag', 'pressure', 'challenge'
        ];

        // ═══════════════════════════════════════════════════════
        // PATTERNS FINANCIERS SPÉCIFIQUES
        // ═══════════════════════════════════════════════════════
        
        this.positivePatterns = [
            /beat\s+(estimates|expectations|forecasts?)/i,
            /exceed\s+(estimates|expectations|forecasts?)/i,
            /record\s+(profit|revenue|earnings|sales)/i,
            /all[- ]?time\s+high/i,
            /strong\s+(growth|performance|results|earnings)/i,
            /better[- ]than[- ]expected/i,
            /outperform/i,
            /upgraded?\s+to/i,
            /raised?\s+(guidance|outlook|forecast)/i,
            /authorized?\s+buyback/i,
            /increased?\s+dividend/i,
            /positive\s+outlook/i,
            /won\s+(contract|deal)/i,
            /approved\s+by\s+fda/i,
            /strategic\s+acquisition/i
        ];

        this.negativePatterns = [
            /miss(ed)?\s+(estimates|expectations|forecasts?)/i,
            /below\s+(estimates|expectations|forecasts?)/i,
            /worse[- ]than[- ]expected/i,
            /downgraded?\s+to/i,
            /lowered?\s+(guidance|outlook|forecast)/i,
            /cut\s+(jobs|workforce|dividend)/i,
            /filed?\s+for\s+bankruptcy/i,
            /under\s+investigation/i,
            /recalled?\s+(product|drug)/i,
            /suspended?\s+trading/i,
            /negative\s+outlook/i,
            /profit\s+warning/i,
            /weak\s+(guidance|outlook|results)/i,
            /lost\s+(contract|deal)/i,
            /rejected\s+by\s+fda/i
        ];

        // ═══════════════════════════════════════════════════════
        // MODIFICATEURS D'INTENSITÉ
        // ═══════════════════════════════════════════════════════
        
        this.intensifiers = {
            'very': 1.5, 'extremely': 2.0, 'highly': 1.5, 'significantly': 1.8,
            'massively': 2.0, 'dramatically': 1.8, 'sharply': 1.6, 'substantially': 1.7,
            'considerably': 1.5, 'remarkably': 1.6, 'notably': 1.4, 'particularly': 1.3,
            'especially': 1.3, 'incredibly': 1.7, 'exceptionally': 1.8, 'extraordinarily': 2.0,
            'slightly': 0.5, 'somewhat': 0.6, 'marginally': 0.4, 'barely': 0.3,
            'moderately': 0.7, 'relatively': 0.6, 'fairly': 0.7
        };

        // ═══════════════════════════════════════════════════════
        // NÉGATIONS
        // ═══════════════════════════════════════════════════════
        
        this.negations = [
            'not', 'no', 'never', 'neither', 'nor', "n't", 'hardly',
            'barely', 'scarcely', 'without', 'lack', 'lacking', 'fails', 'failed'
        ];
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYSE PRINCIPALE DU SENTIMENT
     * ═══════════════════════════════════════════════════════════
     */
    
    analyze(text) {
        if (!text) {
            return { score: 0, sentiment: 'neutral', confidence: 0 };
        }

        const lowerText = text.toLowerCase();
        const words = lowerText.split(/\s+/);

        let positiveScore = 0;
        let negativeScore = 0;
        let totalMatches = 0;

        // ───────────────────────────────────────────────────────
        // 1. ANALYSE DES PATTERNS SPÉCIFIQUES (poids x4)
        // ───────────────────────────────────────────────────────
        
        this.positivePatterns.forEach(pattern => {
            if (pattern.test(text)) {
                positiveScore += 4;
                totalMatches += 2;
            }
        });

        this.negativePatterns.forEach(pattern => {
            if (pattern.test(text)) {
                negativeScore += 4;
                totalMatches += 2;
            }
        });

        // ───────────────────────────────────────────────────────
        // 2. ANALYSE DES POURCENTAGES ET NOMBRES
        // ───────────────────────────────────────────────────────
        
        const percentageMatches = text.match(/(\+|-)?\d+(\.\d+)?%/g);
        if (percentageMatches) {
            percentageMatches.forEach(match => {
                const value = parseFloat(match);
                if (match.startsWith('+') || value > 0) {
                    positiveScore += Math.min(value / 10, 2);
                    totalMatches++;
                } else if (match.startsWith('-') || value < 0) {
                    negativeScore += Math.min(Math.abs(value) / 10, 2);
                    totalMatches++;
                }
            });
        }

        // ───────────────────────────────────────────────────────
        // 3. ANALYSE MOT PAR MOT
        // ───────────────────────────────────────────────────────
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i].replace(/[^\w]/g, '');
            
            // Vérifier négation
            const previousWord = i > 0 ? words[i - 1].replace(/[^\w]/g, '') : '';
            const isNegated = this.negations.includes(previousWord);
            
            // Vérifier intensifieur
            const intensifier = this.intensifiers[previousWord] || 1.0;

            // Mots ultra-positifs (x3)
            if (this.veryPositiveWords.includes(word)) {
                const weight = intensifier * 3;
                if (isNegated) {
                    negativeScore += weight;
                } else {
                    positiveScore += weight;
                }
                totalMatches++;
            }

            // Mots positifs (x1.5)
            else if (this.positiveWords.includes(word)) {
                const weight = intensifier * 1.5;
                if (isNegated) {
                    negativeScore += weight;
                } else {
                    positiveScore += weight;
                }
                totalMatches++;
            }

            // Mots ultra-négatifs (x3)
            if (this.veryNegativeWords.includes(word)) {
                const weight = intensifier * 3;
                if (isNegated) {
                    positiveScore += weight;
                } else {
                    negativeScore += weight;
                }
                totalMatches++;
            }

            // Mots négatifs (x1.5)
            else if (this.negativeWords.includes(word)) {
                const weight = intensifier * 1.5;
                if (isNegated) {
                    positiveScore += weight;
                } else {
                    negativeScore += weight;
                }
                totalMatches++;
            }
        }

        // ───────────────────────────────────────────────────────
        // 4. CALCUL DU SCORE FINAL
        // ───────────────────────────────────────────────────────
        
        const rawScore = positiveScore - negativeScore;
        const normalizedScore = Math.max(-100, Math.min(100, rawScore * 15));

        // Déterminer le sentiment
        let sentiment;
        if (normalizedScore > 20) sentiment = 'positive';
        else if (normalizedScore < -20) sentiment = 'negative';
        else sentiment = 'neutral';

        // Calculer la confiance
        const confidence = Math.min(1, totalMatches / 3);

        return {
            score: Math.round(normalizedScore),
            sentiment: sentiment,
            confidence: confidence,
            matchCount: totalMatches,
            rawPositive: positiveScore,
            rawNegative: negativeScore
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYSE D'UN ARTICLE COMPLET
     * ═══════════════════════════════════════════════════════════
     */
    
    analyzeArticle(article) {
        // Le titre a un poids plus important (3x)
        const titleAnalysis = this.analyze(article.title);
        const descAnalysis = this.analyze(article.description);

        const combinedScore = (titleAnalysis.score * 3 + descAnalysis.score) / 4;
        
        let sentiment;
        if (combinedScore > 20) sentiment = 'positive';
        else if (combinedScore < -20) sentiment = 'negative';
        else sentiment = 'neutral';

        return {
            score: Math.round(combinedScore),
            sentiment: sentiment,
            confidence: (titleAnalysis.confidence + descAnalysis.confidence) / 2,
            titleScore: titleAnalysis.score,
            descriptionScore: descAnalysis.score,
            titleMatches: titleAnalysis.matchCount,
            descMatches: descAnalysis.matchCount
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * DÉTECTION DE SECTEUR
     * ═══════════════════════════════════════════════════════════
     */
    
    detectSector(article) {
        const text = (article.title + ' ' + article.description).toLowerCase();
        
        if (text.match(/\b(tech|technology|software|ai|artificial intelligence|semiconductor|chip|apple|microsoft|google|alphabet|nvidia|meta|amazon|tesla|cloud|cybersecurity|data|digital)\b/i)) {
            return 'tech';
        }
        
        if (text.match(/\b(bank|banking|finance|financial|fed|federal reserve|interest rate|wall street|trading|investment|goldman|jpmorgan|morgan stanley|credit|loan|mortgage)\b/i)) {
            return 'finance';
        }
        
        if (text.match(/\b(oil|energy|gas|petroleum|renewable|solar|wind|electric|exxon|chevron|shell|bp|power|utility|coal)\b/i)) {
            return 'energy';
        }
        
        if (text.match(/\b(healthcare|health|pharma|pharmaceutical|drug|medicine|vaccine|biotech|pfizer|moderna|johnson|medical|hospital|therapy|clinical)\b/i)) {
            return 'healthcare';
        }
        
        if (text.match(/\b(consumer|retail|shopping|walmart|target|costco|starbucks|nike|amazon retail|e-commerce|ecommerce|store|sales)\b/i)) {
            return 'consumer';
        }
        
        return 'other';
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * ANALYSE EN LOT (BATCH)
     * ═══════════════════════════════════════════════════════════
     */
    
    analyzeBatch(articles) {
        console.log(`🧠 Analyzing sentiment for ${articles.length} articles...`);
        
        const results = articles.map(article => {
            const analysis = this.analyzeArticle(article);
            return {
                ...article,
                sentimentScore: analysis.score,
                sentiment: analysis.sentiment,
                confidence: analysis.confidence,
                sector: this.detectSector(article)
            };
        });

        // Statistiques globales
        const totalScore = results.reduce((sum, r) => sum + r.sentimentScore, 0);
        const avgScore = results.length > 0 ? totalScore / results.length : 0;

        const positiveCount = results.filter(r => r.sentiment === 'positive').length;
        const neutralCount = results.filter(r => r.sentiment === 'neutral').length;
        const negativeCount = results.filter(r => r.sentiment === 'negative').length;

        // Sentiment par secteur
        const sectorStats = this.calculateSectorStats(results);

        console.log(`✅ Analysis complete - Global score: ${Math.round(avgScore)}`);
        console.log(`📊 Distribution: ${positiveCount} positive, ${neutralCount} neutral, ${negativeCount} negative`);

        return {
            articles: results,
            globalScore: Math.round(avgScore),
            globalSentiment: avgScore > 20 ? 'positive' : avgScore < -20 ? 'negative' : 'neutral',
            positiveCount,
            neutralCount,
            negativeCount,
            totalAnalyzed: results.length,
            sectorStats
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * STATS PAR SECTEUR
     * ═══════════════════════════════════════════════════════════
     */
    
    calculateSectorStats(articles) {
        const sectors = {};

        articles.forEach(article => {
            const sector = article.sector;
            if (!sectors[sector]) {
                sectors[sector] = { scores: [], count: 0 };
            }
            sectors[sector].scores.push(article.sentimentScore);
            sectors[sector].count++;
        });

        const sectorStats = {};
        for (const [sector, data] of Object.entries(sectors)) {
            const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.count;
            sectorStats[sector] = {
                score: Math.round(avgScore),
                sentiment: avgScore > 20 ? 'positive' : avgScore < -20 ? 'negative' : 'neutral',
                count: data.count
            };
        }

        return sectorStats;
    }
}

window.SentimentAnalyzer = SentimentAnalyzer;