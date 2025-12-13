/**
 * ════════════════════════════════════════════════════════════════
 * SENTIMENT ANALYZER - Analyse NLP du sentiment financier
 * ════════════════════════════════════════════════════════════════
 */

class SentimentAnalyzer {
    constructor() {
        // Dictionnaire de mots-clés positifs
        this.positiveWords = [
            'gain', 'surge', 'rally', 'soar', 'jump', 'climb', 'rise', 'boost', 'upgrade',
            'beat', 'exceed', 'outperform', 'strong', 'robust', 'solid', 'growth', 'profit',
            'record', 'high', 'breakout', 'bullish', 'optimistic', 'positive', 'win', 'success',
            'innovation', 'breakthrough', 'expansion', 'recovery', 'upside', 'potential',
            'opportunity', 'confident', 'promising', 'impressive', 'excellent', 'outstanding'
        ];

        // Dictionnaire de mots-clés négatifs
        this.negativeWords = [
            'loss', 'fall', 'drop', 'plunge', 'decline', 'crash', 'slump', 'tumble', 'sink',
            'miss', 'underperform', 'weak', 'poor', 'disappointing', 'concern', 'risk', 'threat',
            'downturn', 'recession', 'bearish', 'pessimistic', 'negative', 'failure', 'bankrupt',
            'debt', 'lawsuit', 'scandal', 'warning', 'downgrade', 'cut', 'slash', 'layoff',
            'struggle', 'trouble', 'crisis', 'volatile', 'uncertainty', 'fear', 'panic'
        ];

        // Modificateurs d'intensité
        this.intensifiers = {
            'very': 1.5, 'extremely': 2.0, 'highly': 1.5, 'significantly': 1.8,
            'massively': 2.0, 'dramatically': 1.8, 'sharply': 1.6, 'substantially': 1.7,
            'slightly': 0.5, 'somewhat': 0.6, 'marginally': 0.4, 'barely': 0.3
        };

        // Négations
        this.negations = ['not', 'no', 'never', 'neither', 'nor', "n't", 'hardly', 'barely'];
    }

    /**
     * Analyse le sentiment d'un texte
     * @param {string} text - Texte à analyser
     * @returns {object} - { score: -100 à +100, sentiment: 'positive'/'neutral'/'negative', confidence: 0-1 }
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

        for (let i = 0; i < words.length; i++) {
            const word = words[i].replace(/[^\w]/g, '');
            
            // Vérifier si le mot précédent est une négation
            const previousWord = i > 0 ? words[i - 1].replace(/[^\w]/g, '') : '';
            const isNegated = this.negations.includes(previousWord);
            
            // Vérifier si le mot précédent est un intensifieur
            const intensifier = this.intensifiers[previousWord] || 1.0;

            // Analyser les mots positifs
            if (this.positiveWords.includes(word)) {
                const weight = intensifier;
                if (isNegated) {
                    negativeScore += weight; // Négation inverse le sentiment
                } else {
                    positiveScore += weight;
                }
                totalMatches++;
            }

            // Analyser les mots négatifs
            if (this.negativeWords.includes(word)) {
                const weight = intensifier;
                if (isNegated) {
                    positiveScore += weight; // "not bad" devient positif
                } else {
                    negativeScore += weight;
                }
                totalMatches++;
            }
        }

        // Calculer le score final (-100 à +100)
        const rawScore = positiveScore - negativeScore;
        const normalizedScore = Math.max(-100, Math.min(100, rawScore * 20));

        // Déterminer le sentiment
        let sentiment;
        if (normalizedScore > 15) sentiment = 'positive';
        else if (normalizedScore < -15) sentiment = 'negative';
        else sentiment = 'neutral';

        // Calculer la confiance (basée sur le nombre de mots trouvés)
        const confidence = Math.min(1, totalMatches / 5);

        return {
            score: Math.round(normalizedScore),
            sentiment: sentiment,
            confidence: confidence,
            matchCount: totalMatches
        };
    }

    /**
     * Analyse un article complet (titre + description)
     * @param {object} article - { title, description }
     * @returns {object} - Résultat d'analyse enrichi
     */
    analyzeArticle(article) {
        // Le titre a un poids plus important (2x)
        const titleAnalysis = this.analyze(article.title);
        const descAnalysis = this.analyze(article.description);

        const combinedScore = (titleAnalysis.score * 2 + descAnalysis.score) / 3;
        
        let sentiment;
        if (combinedScore > 15) sentiment = 'positive';
        else if (combinedScore < -15) sentiment = 'negative';
        else sentiment = 'neutral';

        return {
            score: Math.round(combinedScore),
            sentiment: sentiment,
            confidence: (titleAnalysis.confidence + descAnalysis.confidence) / 2,
            titleScore: titleAnalysis.score,
            descriptionScore: descAnalysis.score
        };
    }

    /**
     * Détecte le secteur d'un article (copié de news-terminal.js)
     */
    detectSector(article) {
        const text = (article.title + ' ' + article.description).toLowerCase();
        
        if (text.match(/\b(tech|software|ai|semiconductor|apple|microsoft|google|nvidia|meta|amazon)\b/i)) return 'tech';
        if (text.match(/\b(bank|finance|fed|interest|wall street|trading|goldman|jpmorgan)\b/i)) return 'finance';
        if (text.match(/\b(oil|energy|gas|renewable|electric|exxon|chevron|shell)\b/i)) return 'energy';
        if (text.match(/\b(healthcare|pharma|drug|vaccine|pfizer|moderna|johnson)\b/i)) return 'healthcare';
        if (text.match(/\b(consumer|retail|walmart|target|costco|starbucks)\b/i)) return 'consumer';
        
        return 'other';
    }

    /**
     * Analyse un lot d'articles et génère des statistiques
     * @param {Array} articles - Liste d'articles
     * @returns {object} - Statistiques complètes
     */
    analyzeBatch(articles) {
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

        // Calculer les statistiques globales
        const totalScore = results.reduce((sum, r) => sum + r.sentimentScore, 0);
        const avgScore = results.length > 0 ? totalScore / results.length : 0;

        const positiveCount = results.filter(r => r.sentiment === 'positive').length;
        const neutralCount = results.filter(r => r.sentiment === 'neutral').length;
        const negativeCount = results.filter(r => r.sentiment === 'negative').length;

        // Sentiment par secteur
        const sectorStats = this.calculateSectorStats(results);

        // Sentiment par ticker
        const tickerStats = this.calculateTickerStats(results);

        return {
            articles: results,
            globalScore: Math.round(avgScore),
            globalSentiment: avgScore > 15 ? 'positive' : avgScore < -15 ? 'negative' : 'neutral',
            positiveCount,
            neutralCount,
            negativeCount,
            totalAnalyzed: results.length,
            sectorStats,
            tickerStats
        };
    }

    /**
     * Calcule les stats par secteur
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
                sentiment: avgScore > 15 ? 'positive' : avgScore < -15 ? 'negative' : 'neutral',
                count: data.count
            };
        }

        return sectorStats;
    }

    /**
     * Calcule les stats par ticker
     */
    calculateTickerStats(articles) {
        const tickers = {};

        articles.forEach(article => {
            article.tickers.forEach(ticker => {
                if (!tickers[ticker]) {
                    tickers[ticker] = { scores: [], count: 0 };
                }
                tickers[ticker].scores.push(article.sentimentScore);
                tickers[ticker].count++;
            });
        });

        const tickerStats = {};
        for (const [ticker, data] of Object.entries(tickers)) {
            const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.count;
            tickerStats[ticker] = {
                score: Math.round(avgScore),
                sentiment: avgScore > 15 ? 'positive' : avgScore < -15 ? 'negative' : 'neutral',
                count: data.count
            };
        }

        return tickerStats;
    }
}

window.SentimentAnalyzer = SentimentAnalyzer;