/* ========================================
   SYSTÈME DE SUGGESTIONS INTELLIGENTES
   Propose des requêtes contextuelles
   ======================================== */

class ChatbotSuggestions {
    constructor() {
        this.suggestionCategories = {
            welcome: this.getWelcomeSuggestions(),
            ipo: this.getIPOSuggestions(),
            financial: this.getFinancialSuggestions(),
            comparison: this.getComparisonSuggestions(),
            technical: this.getTechnicalSuggestions(),
            news: this.getNewsSuggestions(),
            advanced: this.getAdvancedSuggestions()
        };
        
        this.userHistory = [];
        this.currentContext = 'welcome';
    }

    /**
     * Suggestions de bienvenue
     */
    getWelcomeSuggestions() {
        return [
            {
                icon: '🎯',
                text: 'Top 5 IPOs prometteuses',
                query: 'Quelles sont les 5 meilleures IPOs à venir avec analyse complète et graphiques ?',
                category: 'ipo',
                color: '#3b82f6'
            },
            {
                icon: '📊',
                text: 'Analyser Apple (AAPL)',
                query: 'Analyse financière complète d\'Apple avec revenus, REX, cash flow et graphiques sur 5 ans',
                category: 'financial',
                color: '#10b981'
            },
            {
                icon: '⚖️',
                text: 'Comparer TSLA vs RIVN',
                query: 'Compare Tesla et Rivian : valorisation, croissance, marges et perspectives avec graphiques',
                category: 'comparison',
                color: '#f59e0b'
            },
            {
                icon: '📈',
                text: 'Performance S&P 500',
                query: 'Montre-moi la performance du S&P 500 sur 12 mois avec graphique et analyse',
                category: 'technical',
                color: '#8b5cf6'
            },
            {
                icon: '💰',
                text: 'Résultats Microsoft 2023',
                query: 'Affiche les résultats financiers de Microsoft pour 2023 : revenus, REX, marges avec évolution',
                category: 'financial',
                color: '#ec4899'
            },
            {
                icon: '🔮',
                text: 'Tendances Tech 2024',
                query: 'Analyse prédictive du secteur technologique pour 2024 avec opportunités',
                category: 'advanced',
                color: '#06b6d4'
            }
        ];
    }

    /**
     * Suggestions IPO
     */
    getIPOSuggestions() {
        return [
            {
                icon: '🚀',
                text: 'IPOs Tech 6 mois',
                query: 'Liste les IPOs tech prévues dans les 6 prochains mois avec scoring et recommandations',
                category: 'ipo'
            },
            {
                icon: '💎',
                text: 'IPOs sous-évaluées',
                query: 'Trouve les IPOs récentes (< 12 mois) potentiellement sous-évaluées avec analyses',
                category: 'ipo'
            },
            {
                icon: '📊',
                text: 'Performance post-IPO',
                query: 'Analyse les IPOs 2023 : lesquelles ont surperformé et pourquoi ?',
                category: 'ipo'
            },
            {
                icon: '🎯',
                text: 'IPOs Healthcare',
                query: 'IPOs secteur santé et biotech à venir avec potentiel',
                category: 'ipo'
            }
        ];
    }

    /**
     * Suggestions financières avancées
     */
    getFinancialSuggestions() {
        return [
            {
                icon: '💼',
                text: 'Bilan Google 2023',
                query: 'Affiche le bilan financier de Google (Alphabet) 2023 avec évolution sur 3 ans',
                category: 'financial'
            },
            {
                icon: '📈',
                text: 'REX Amazon 5 ans',
                query: 'Résultat d\'exploitation d\'Amazon sur 5 ans avec graphique d\'évolution et analyse CAGR',
                category: 'financial'
            },
            {
                icon: '💰',
                text: 'Cash Flow Netflix',
                query: 'Analyse le cash flow de Netflix : opérationnel, investissement et financement (2019-2023) avec graphiques',
                category: 'financial'
            },
            {
                icon: '📊',
                text: 'Ratios Tesla',
                query: 'Calcule tous les ratios financiers de Tesla : liquidité, rentabilité, endettement',
                category: 'financial'
            },
            {
                icon: '🎯',
                text: 'EPS trend NVIDIA',
                query: 'Évolution de l\'EPS de NVIDIA sur 3 ans avec prédictions et graphique',
                category: 'financial'
            },
            {
                icon: '💹',
                text: 'Marges Meta',
                query: 'Analyse les marges de Meta (Facebook) : brute, opérationnelle, nette sur 5 ans',
                category: 'financial'
            }
        ];
    }

    /**
     * Suggestions de comparaison
     */
    getComparisonSuggestions() {
        return [
            {
                icon: '⚔️',
                text: 'NVIDIA vs AMD',
                query: 'Compare NVIDIA et AMD : revenus, marges, croissance, position marché avec graphiques',
                category: 'comparison'
            },
            {
                icon: '🏦',
                text: 'GAFAM Showdown',
                query: 'Compare les GAFAM (Google, Apple, Facebook, Amazon, Microsoft) sur toutes métriques clés',
                category: 'comparison'
            },
            {
                icon: '🚗',
                text: 'EV Makers',
                query: 'Compare les constructeurs véhicules électriques : TSLA, RIVN, LCID, NIO avec tableaux',
                category: 'comparison'
            },
            {
                icon: '💳',
                text: 'PayPal vs Square',
                query: 'Compare PayPal et Square (Block) : croissance, rentabilité, valorisation',
                category: 'comparison'
            }
        ];
    }

    /**
     * Suggestions techniques
     */
    getTechnicalSuggestions() {
        return [
            {
                icon: '📉',
                text: 'Support/Résistance AAPL',
                query: 'Identifie les niveaux support et résistance pour Apple avec graphique technique',
                category: 'technical'
            },
            {
                icon: '📊',
                text: 'Moyennes mobiles SPY',
                query: 'Affiche les moyennes mobiles (20, 50, 200 jours) pour SPY avec graphique',
                category: 'technical'
            },
            {
                icon: '🎲',
                text: 'Volatilité secteurs',
                query: 'Analyse la volatilité : Tech vs Santé vs Finance sur 6 mois',
                category: 'technical'
            },
            {
                icon: '📈',
                text: 'RSI & MACD Tesla',
                query: 'Analyse technique Tesla : RSI, MACD et volumes avec graphiques',
                category: 'technical'
            }
        ];
    }

    /**
     * Suggestions actualités
     */
    getNewsSuggestions() {
        return [
            {
                icon: '📰',
                text: 'News Tech 48h',
                query: 'Résume les actualités tech majeures des dernières 48h',
                category: 'news'
            },
            {
                icon: '🌍',
                text: 'Impact Fed',
                query: 'Quel impact des dernières décisions de la Fed sur les marchés ?',
                category: 'news'
            },
            {
                icon: '💡',
                text: 'Earnings Surprises',
                query: 'Quelles entreprises ont surpris (+ ou -) lors des derniers earnings ?',
                category: 'news'
            },
            {
                icon: '🚀',
                text: 'M&A récents',
                query: 'Liste les fusions-acquisitions majeures du trimestre',
                category: 'news'
            }
        ];
    }

    /**
     * Suggestions avancées
     */
    getAdvancedSuggestions() {
        return [
            {
                icon: '🧮',
                text: 'DCF Microsoft',
                query: 'Calcule une valorisation DCF (Discounted Cash Flow) pour Microsoft avec hypothèses détaillées',
                category: 'advanced'
            },
            {
                icon: '🔮',
                text: 'Monte Carlo TSLA',
                query: 'Simule 1000 scénarios de prix pour Tesla sur 1 an (simulation Monte Carlo)',
                category: 'advanced'
            },
            {
                icon: '🤖',
                text: 'Pattern ML NVDA',
                query: 'Détecte les patterns machine learning dans l\'évolution de NVIDIA',
                category: 'advanced'
            },
            {
                icon: '📊',
                text: 'Corrélation Matrix',
                query: 'Matrice de corrélation entre les actions FAANG avec heatmap',
                category: 'advanced'
            },
            {
                icon: '📈',
                text: 'Backtesting Strategy',
                query: 'Backtest d\'une stratégie momentum sur le NASDAQ',
                category: 'advanced'
            }
        ];
    }

    /**
     * Obtient des suggestions contextuelles
     */
    getContextualSuggestions(context = null, userMessage = '') {
        let suggestions = [];
        
        // Détection du contexte basé sur le message
        if (userMessage) {
            const detectedContext = this.detectContext(userMessage);
            suggestions = this.suggestionCategories[detectedContext] || [];
        } else if (context) {
            suggestions = this.suggestionCategories[context] || this.suggestionCategories.welcome;
        } else {
            suggestions = this.suggestionCategories.welcome;
        }
        
        // Mélange et limite à 6 suggestions
        return this.shuffleArray(suggestions).slice(0, 6);
    }

    /**
     * Détecte le contexte depuis le message
     */
    detectContext(message) {
        const lowerMessage = message.toLowerCase();
        
        const patterns = {
            ipo: ['ipo', 'introduction', 'cotation'],
            comparison: ['compar', 'vs', 'versus', 'entre'],
            technical: ['graph', 'chart', 'prix', 'cours', 'technique', 'support', 'résistance'],
            news: ['news', 'actualité', 'nouvelle', 'info', 'annonce'],
            financial: ['bilan', 'rex', 'résultat', 'revenu', 'cash flow', 'marge', 'ratio'],
            advanced: ['dcf', 'monte carlo', 'ml', 'machine learning', 'corrélation', 'backtest']
        };
        
        for (const [context, keywords] of Object.entries(patterns)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return context;
            }
        }
        
        return 'welcome';
    }

    /**
     * Obtient des suggestions basées sur l'historique
     */
    getHistoryBasedSuggestions() {
        if (this.userHistory.length === 0) {
            return this.getWelcomeSuggestions().slice(0, 3);
        }
        
        // Analyse l'historique pour suggérer des requêtes pertinentes
        const lastQueries = this.userHistory.slice(-5);
        const contexts = lastQueries.map(q => this.detectContext(q));
        const mostFrequent = this.getMostFrequent(contexts);
        
        return this.suggestionCategories[mostFrequent] || this.getWelcomeSuggestions();
    }

    /**
     * Ajoute une requête à l'historique
     */
    addToHistory(query) {
        this.userHistory.push(query);
        if (this.userHistory.length > 50) {
            this.userHistory.shift();
        }
        
        // Sauvegarde dans localStorage
        try {
            localStorage.setItem('chatbot_history', JSON.stringify(this.userHistory));
        } catch (e) {
            console.error('Cannot save history:', e);
        }
    }

    /**
     * Charge l'historique depuis localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('chatbot_history');
            if (saved) {
                this.userHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Cannot load history:', e);
        }
    }

    /**
     * Mélange un tableau
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Trouve l'élément le plus fréquent
     */
    getMostFrequent(arr) {
        if (arr.length === 0) return 'welcome';
        
        const frequency = {};
        let maxCount = 0;
        let mostFrequent = arr[0];
        
        arr.forEach(item => {
            frequency[item] = (frequency[item] || 0) + 1;
            if (frequency[item] > maxCount) {
                maxCount = frequency[item];
                mostFrequent = item;
            }
        });
        
        return mostFrequent;
    }

    /**
     * Efface l'historique
     */
    clearHistory() {
        this.userHistory = [];
        try {
            localStorage.removeItem('chatbot_history');
        } catch (e) {
            console.error('Cannot clear history:', e);
        }
    }
}

// Export global
window.ChatbotSuggestions = ChatbotSuggestions;