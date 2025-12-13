/**
 * ════════════════════════════════════════════════════════════════
 * FEAR & GREED INDEX CALCULATOR (CORRIGÉ - Timeline)
 * ════════════════════════════════════════════════════════════════
 */

class FearGreedCalculator {
    constructor() {
        // Mots anxiogènes (Fear)
        this.fearWords = [
            'crash', 'slump', 'plunge', 'tumble', 'collapse', 'fall', 'decline', 
            'drop', 'sink', 'plummet', 'crisis', 'recession', 'downturn', 'bear',
            'fear', 'panic', 'worry', 'concern', 'risk', 'threat', 'danger',
            'uncertainty', 'volatility', 'turmoil', 'chaos', 'loss', 'losses',
            'warn', 'warning', 'alert', 'caution', 'weak', 'weakness', 'struggle',
            'trouble', 'problem', 'issue', 'challenge', 'downgrade', 'cut', 'slash',
            'layoff', 'bankruptcy', 'default', 'debt', 'miss', 'disappoint'
        ];
        
        // Mots de confiance (Greed)
        this.greedWords = [
            'surge', 'rally', 'soar', 'jump', 'climb', 'rise', 'gain', 'boom',
            'growth', 'grow', 'expand', 'increase', 'bull', 'bullish', 'optimism',
            'optimistic', 'confident', 'confidence', 'strong', 'strength', 'robust',
            'solid', 'record', 'high', 'peak', 'best', 'top', 'outperform',
            'beat', 'exceed', 'upgrade', 'raise', 'boost', 'recovery', 'rebound',
            'momentum', 'positive', 'opportunity', 'breakthrough', 'innovation',
            'success', 'profit', 'earnings', 'revenue', 'winner'
        ];
        
        // Mots neutres à ignorer
        this.neutralWords = [
            'market', 'stock', 'share', 'company', 'industry', 'sector',
            'quarter', 'year', 'month', 'week', 'day', 'report', 'data',
            'news', 'update', 'announce', 'release', 'say', 'says', 'said'
        ];
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * CALCUL DU FEAR & GREED INDEX
     * ═══════════════════════════════════════════════════════════
     */
    
    calculate(articles) {
        console.log(`🎯 Calculating Fear & Greed Index for ${articles.length} articles...`);
        
        let fearScore = 0;
        let greedScore = 0;
        let fearCount = 0;
        let greedCount = 0;
        
        const dailyScores = new Map();
        
        articles.forEach(article => {
            const titleLower = article.title.toLowerCase();
            const words = titleLower.split(/\s+/);
            
            let articleFear = 0;
            let articleGreed = 0;
            
            words.forEach(word => {
                // Nettoyer le mot
                const cleanWord = word.replace(/[^\w]/g, '');
                
                if (this.fearWords.includes(cleanWord)) {
                    articleFear += 1;
                    fearCount += 1;
                }
                
                if (this.greedWords.includes(cleanWord)) {
                    articleGreed += 1;
                    greedCount += 1;
                }
            });
            
            // Score de l'article (-1 à +1)
            const articleScore = articleGreed - articleFear;
            
            fearScore += articleFear;
            greedScore += articleGreed;
            
            // Stocker par jour
            const date = new Date(article.timestamp).toLocaleDateString();
            if (!dailyScores.has(date)) {
                dailyScores.set(date, { fear: 0, greed: 0, count: 0 });
            }
            const dayData = dailyScores.get(date);
            dayData.fear += articleFear;
            dayData.greed += articleGreed;
            dayData.count += 1;
        });
        
        // Score global (-100 à +100)
        const totalWords = fearCount + greedCount;
        let globalIndex = 0;
        
        if (totalWords > 0) {
            const fearRatio = fearCount / totalWords;
            const greedRatio = greedCount / totalWords;
            
            // Normaliser entre -100 (Extreme Fear) et +100 (Extreme Greed)
            globalIndex = Math.round((greedRatio - fearRatio) * 100);
        }
        
        // Déterminer le label
        const label = this.getIndexLabel(globalIndex);
        
        // ✅ CORRECTION: Calculer les scores journaliers avec tri chronologique
        const timeline = Array.from(dailyScores.entries())
            .map(([date, data]) => {
                const dayTotal = data.fear + data.greed;
                const dayIndex = dayTotal > 0 
                    ? Math.round(((data.greed - data.fear) / dayTotal) * 100)
                    : 0;
                
                return {
                    date,
                    dateObj: new Date(date), // ✅ Objet Date pour tri correct
                    index: dayIndex,
                    fear: data.fear,
                    greed: data.greed,
                    articles: data.count
                };
            })
            .sort((a, b) => a.dateObj - b.dateObj) // ✅ Tri chronologique (ancien → récent)
            .map(({ dateObj, ...rest }) => rest); // ✅ Retirer dateObj après tri
        
        console.log(`✅ Fear & Greed Index calculated:`, {
            index: globalIndex,
            label,
            fearCount,
            greedCount,
            timelineLength: timeline.length
        });
        
        return {
            index: globalIndex,
            label,
            fearScore,
            greedScore,
            fearCount,
            greedCount,
            totalWords,
            timeline,
            distribution: {
                fear: totalWords > 0 ? Math.round((fearCount / totalWords) * 100) : 0,
                greed: totalWords > 0 ? Math.round((greedCount / totalWords) * 100) : 0
            }
        };
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * LABEL BASÉ SUR L'INDEX
     * ═══════════════════════════════════════════════════════════
     */
    
    getIndexLabel(index) {
        if (index >= 60) return 'Extreme Greed';
        if (index >= 30) return 'Greed';
        if (index >= 10) return 'Neutral-Bullish';
        if (index >= -10) return 'Neutral';
        if (index >= -30) return 'Neutral-Bearish';
        if (index >= -60) return 'Fear';
        return 'Extreme Fear';
    }

    /**
     * ═══════════════════════════════════════════════════════════
     * COULEUR POUR LE GAUGE
     * ═══════════════════════════════════════════════════════════
     */
    
    getIndexColor(index) {
        if (index >= 60) return ['#10b981', '#059669']; // Vert intense
        if (index >= 30) return ['#34d399', '#10b981']; // Vert
        if (index >= 10) return ['#6ee7b7', '#34d399']; // Vert clair
        if (index >= -10) return ['#6b7280', '#4b5563']; // Gris
        if (index >= -30) return ['#fbbf24', '#f59e0b']; // Orange
        if (index >= -60) return ['#fb923c', '#f97316']; // Orange foncé
        return ['#ef4444', '#dc2626']; // Rouge
    }
}

// Export global
window.FearGreedCalculator = FearGreedCalculator;