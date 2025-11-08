/* ========================================
   MOTEUR PRINCIPAL IA DU CHATBOT
   Orchestration Gemini + Analytics + IPO
   ======================================== */

class FinancialChatbotEngine {
    constructor(apiKey, finnhubApiKey) {
        this.gemini = new GeminiAIIntegration(apiKey);
        this.apiClient = window.FinnhubClient ? new FinnhubClient(finnhubApiKey) : null;
        this.ipoAnalyzer = this.apiClient ? new IPOAnalyzer(this.apiClient) : null;
        this.analytics = this.apiClient ? new AdvancedFinancialAnalytics(this.apiClient) : null;
        this.conversationHistory = [];
        this.context = {};
        
        console.log('🤖 FinancialChatbotEngine initialized');
        console.log('  - Gemini:', this.gemini ? 'OK' : 'ERROR');
        console.log('  - Finnhub:', this.apiClient ? 'OK' : 'NO API');
        console.log('  - IPO Analyzer:', this.ipoAnalyzer ? 'OK' : 'DISABLED');
        console.log('  - Analytics:', this.analytics ? 'OK' : 'DISABLED');
    }

    /**
     * Traite un message utilisateur
     */
    async processMessage(userMessage) {
        try {
            this.addToHistory('user', userMessage);
            
            const intent = this.detectIntent(userMessage);
            
            const financialContext = await this.gatherFinancialContext(intent);
            
            let response;
            
            switch(intent.type) {
                case 'IPO_RECOMMENDATION':
                    response = await this.handleIPORecommendation(intent, financialContext);
                    break;
                
                case 'IPO_SEARCH':
                    response = await this.handleIPOSearch(intent, financialContext);
                    break;
                
                case 'REX_ANALYSIS':
                    response = await this.handleREXAnalysis(intent, financialContext);
                    break;
                
                case 'BALANCE_SHEET':
                    response = await this.handleBalanceSheet(intent, financialContext);
                    break;
                
                case 'CASH_FLOW':
                    response = await this.handleCashFlow(intent, financialContext);
                    break;
                
                case 'FINANCIAL_ANALYSIS':
                    response = await this.handleFinancialAnalysis(intent, financialContext);
                    break;
                
                case 'STOCK_COMPARISON':
                    response = await this.handleStockComparison(intent, financialContext);
                    break;
                
                case 'MARKET_DATA':
                    response = await this.handleMarketData(intent, financialContext);
                    break;
                
                case 'NEWS_REQUEST':
                    response = await this.handleNewsRequest(intent, financialContext);
                    break;
                
                case 'PREDICTION':
                    response = await this.handlePrediction(intent, financialContext);
                    break;
                
                case 'CONCEPT_EXPLANATION':
                    response = await this.handleConceptExplanation(intent, financialContext);
                    break;
                
                default:
                    response = await this.handleGeneralQuery(userMessage, financialContext);
            }
            
            this.addToHistory('assistant', response);
            
            return response;
            
        } catch (error) {
            console.error('Message processing error:', error);
            return this.getErrorResponse(error);
        }
    }

    /**
     * Détecte l'intention de l'utilisateur
     */
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        if (this.matchesPattern(lowerMessage, ['meilleur', 'top', 'ipo', 'recommand', 'pépite', 'opportunité ipo'])) {
            return {
                type: 'IPO_RECOMMENDATION',
                params: this.extractIPOParams(lowerMessage)
            };
        }
        
        if (this.matchesPattern(lowerMessage, ['rex', 'résultat d\'exploitation', 'résultat opération', 'operating income'])) {
            return {
                type: 'REX_ANALYSIS',
                params: this.extractSymbolAndYears(lowerMessage)
            };
        }
        
        if (this.matchesPattern(lowerMessage, ['bilan', 'balance sheet', 'actif', 'passif'])) {
            return {
                type: 'BALANCE_SHEET',
                params: this.extractSymbolAndYears(lowerMessage)
            };
        }
        
        if (this.matchesPattern(lowerMessage, ['cash flow', 'flux de trésorerie', 'free cash flow'])) {
            return {
                type: 'CASH_FLOW',
                params: this.extractSymbolAndYears(lowerMessage)
            };
        }
        
        if (this.matchesPattern(lowerMessage, ['analyse', 'analyser', 'étude financière', 'fondamentaux'])) {
            return {
                type: 'FINANCIAL_ANALYSIS',
                params: this.extractSymbol(lowerMessage)
            };
        }
        
        if (this.matchesPattern(lowerMessage, ['compar', 'vs', 'versus', 'entre'])) {
            return {
                type: 'STOCK_COMPARISON',
                params: this.extractComparisonSymbols(lowerMessage)
            };
        }
        
        if (this.matchesPattern(lowerMessage, ['prix', 'cours', 'cotation', 'quote', 'valeur'])) {
            return {
                type: 'MARKET_DATA',
                params: this.extractSymbol(lowerMessage)
            };
        }
        
        if (this.matchesPattern(lowerMessage, ['news', 'actualité', 'nouvelle', 'info'])) {
            return {
                type: 'NEWS_REQUEST',
                params: this.extractSymbol(lowerMessage)
            };
        }
        
        if (this.matchesPattern(lowerMessage, ['prédic', 'prévis', 'tendance', 'futur'])) {
            return {
                type: 'PREDICTION',
                params: this.extractSymbol(lowerMessage)
            };
        }
        
        if (this.matchesPattern(lowerMessage, ['qu\'est-ce', 'c\'est quoi', 'définition', 'expliqu'])) {
            return {
                type: 'CONCEPT_EXPLANATION',
                concept: message
            };
        }
        
        return { type: 'GENERAL', message };
    }

    /**
     * Rassemble le contexte financier nécessaire
     */
    async gatherFinancialContext(intent) {
        const context = {};
        
        try {
            if (!this.apiClient) return context;
            
            const symbol = intent.params?.symbol;
            
            if (symbol) {
                const [quote, profile, financials] = await Promise.all([
                    this.apiClient.getQuote(symbol).catch(() => null),
                    this.apiClient.getCompanyProfile(symbol).catch(() => null),
                    this.apiClient.getBasicFinancials(symbol).catch(() => null)
                ]);
                
                if (quote) context.quote = quote;
                if (profile) context.profile = profile;
                if (financials) context.financials = financials;
            }
            
        } catch (error) {
            console.error('Context gathering error:', error);
        }
        
        return context;
    }

    /**
     * Gère les recommandations d'IPO
     */
    async handleIPORecommendation(intent, context) {
        try {
            if (!this.ipoAnalyzer) {
                return await this.gemini.chat(
                    "L'utilisateur demande des recommandations d'IPO. Fournis une analyse générale des IPOs prometteuses actuelles.",
                    context
                );
            }
            
            const limit = intent.params.limit || 5;
            const topIPOs = await this.ipoAnalyzer.findTopUpcomingIPOs(limit);
            
            if (topIPOs.length === 0) {
                return {
                    text: "😔 Aucune IPO correspondant aux critères n'est disponible actuellement. Le marché des IPOs est peut-être calme en ce moment.",
                    type: 'text',
                    hasChart: false
                };
            }
            
            const prompt = `Analyse ces ${topIPOs.length} IPOs prometteuses et fournis une recommandation détaillée :

${JSON.stringify(topIPOs, null, 2)}

Fournis :
1. Un résumé exécutif
2. Le top 3 avec justifications
3. Un tableau comparatif
4. Des actions suggérées`;
            
            const response = await this.gemini.chat(prompt, { ipos: topIPOs });
            
            response.ipoData = topIPOs;
            response.type = 'ipo_recommendation';
            
            return response;
            
        } catch (error) {
            console.error('IPO Recommendation error:', error);
            return this.getErrorResponse(error);
        }
    }

    /**
     * Gère la recherche d'IPO
     */
    async handleIPOSearch(intent, context) {
        try {
            if (!this.ipoAnalyzer) {
                return await this.gemini.chat("L'utilisateur recherche des IPOs spécifiques.", context);
            }
            
            const results = await this.ipoAnalyzer.searchIPOs(intent.params);
            
            if (results.length === 0) {
                return {
                    text: "Aucune IPO trouvée correspondant à vos critères.",
                    type: 'text'
                };
            }
            
            const response = await this.gemini.chat(
                `Analyse ces IPOs trouvées selon les critères de recherche: ${JSON.stringify(results, null, 2)}`,
                { ipos: results }
            );
            
            response.ipoData = results;
            response.type = 'ipo_search';
            
            return response;
            
        } catch (error) {
            return this.getErrorResponse(error);
        }
    }

    /**
     * Gère l'analyse REX
     */
    async handleREXAnalysis(intent, context) {
        try {
            if (!this.analytics) {
                return await this.gemini.chat(
                    "L'utilisateur demande une analyse des résultats d'exploitation. Explique le concept de REX.",
                    context
                );
            }
            
            const symbol = intent.params.symbol;
            const years = intent.params.years || 5;
            
            if (!symbol) {
                return {
                    text: "Pour quelle entreprise souhaitez-vous analyser les résultats d'exploitation (REX) ?",
                    type: 'question'
                };
            }
            
            const rexData = await this.analytics.getOperatingResults(symbol, years);
            
            const response = await this.gemini.analyzeREX(symbol, rexData);
            response.rexData = rexData;
            response.type = 'rex_analysis';
            
            return response;
            
        } catch (error) {
            console.error('REX Analysis error:', error);
            return this.getErrorResponse(error);
        }
    }

    /**
     * Gère l'analyse du bilan
     */
    async handleBalanceSheet(intent, context) {
        try {
            const symbol = intent.params.symbol;
            const years = intent.params.years || 5;
            
            if (!symbol) {
                return {
                    text: "Pour quelle entreprise souhaitez-vous voir le bilan ?",
                    type: 'question'
                };
            }
            
            if (!this.analytics) {
                return await this.gemini.chat(`Analyse du bilan de ${symbol}`, context);
            }
            
            const balanceData = await this.analytics.getBalanceSheet(symbol, years);
            
            const prompt = `Analyse ce bilan sur ${years} ans pour ${symbol} :

${JSON.stringify(balanceData, null, 2)}

Fournis une analyse complète.`;
            
            const response = await this.gemini.chat(prompt, { balance: balanceData });
            response.balanceData = balanceData;
            response.type = 'balance_sheet';
            
            return response;
            
        } catch (error) {
            return this.getErrorResponse(error);
        }
    }

    /**
     * Gère l'analyse cash flow
     */
    async handleCashFlow(intent, context) {
        try {
            const symbol = intent.params.symbol;
            const years = intent.params.years || 5;
            
            if (!symbol) {
                return {
                    text: "Pour quelle entreprise souhaitez-vous analyser le cash flow ?",
                    type: 'question'
                };
            }
            
            if (!this.analytics) {
                return await this.gemini.chat(`Analyse du cash flow de ${symbol}`, context);
            }
            
            const cashFlowData = await this.analytics.getCashFlows(symbol, years);
            
            const prompt = `Analyse ce cash flow sur ${years} ans pour ${symbol} :

${JSON.stringify(cashFlowData, null, 2)}

Fournis une analyse détaillée.`;
            
            const response = await this.gemini.chat(prompt, { cashFlow: cashFlowData });
            response.cashFlowData = cashFlowData;
            response.type = 'cash_flow';
            
            return response;
            
        } catch (error) {
            return this.getErrorResponse(error);
        }
    }

    /**
     * Gère l'analyse financière complète
     */
    async handleFinancialAnalysis(intent, context) {
        try {
            const symbol = intent.params.symbol;
            
            if (!symbol) {
                return {
                    text: "Quelle action souhaitez-vous que j'analyse ?",
                    type: 'question'
                };
            }
            
            let fullContext = { ...context };
            
            if (this.analytics) {
                const [rex, balance, cashFlow] = await Promise.all([
                    this.analytics.getOperatingResults(symbol, 5).catch(() => null),
                    this.analytics.getBalanceSheet(symbol, 5).catch(() => null),
                    this.analytics.getCashFlows(symbol, 5).catch(() => null)
                ]);
                
                if (rex) fullContext.rex = rex;
                if (balance) fullContext.balance = balance;
                if (cashFlow) fullContext.cashFlow = cashFlow;
            }
            
            const response = await this.gemini.analyzeFinancials(symbol, fullContext);
            response.type = 'financial_analysis';
            
            return response;
            
        } catch (error) {
            return this.getErrorResponse(error);
        }
    }

    /**
     * Gère la comparaison d'actions
     */
    async handleStockComparison(intent, context) {
        try {
            const symbols = intent.params.symbols;
            
            if (!symbols || symbols.length < 2) {
                return {
                    text: "Quelles actions souhaitez-vous comparer ? (format: AAPL vs MSFT)",
                    type: 'question'
                };
            }
            
            if (!this.apiClient) {
                return await this.gemini.chat(`Compare ${symbols.join(' vs ')}`, context);
            }
            
            const dataPromises = symbols.map(async (symbol) => {
                const [quote, profile, financials] = await Promise.all([
                    this.apiClient.getQuote(symbol).catch(() => null),
                    this.apiClient.getCompanyProfile(symbol).catch(() => null),
                    this.apiClient.getBasicFinancials(symbol).catch(() => null)
                ]);
                
                return { symbol, quote, profile, financials };
            });
            
            const comparisonData = await Promise.all(dataPromises);
            
            const response = await this.gemini.compareCompanies(symbols, comparisonData);
            response.comparisonData = comparisonData;
            response.type = 'comparison';
            
            return response;
            
        } catch (error) {
            return this.getErrorResponse(error);
        }
    }

    /**
     * Gère les données de marché
     */
    async handleMarketData(intent, context) {
        try {
            const symbol = intent.params.symbol;
            
            if (!symbol) {
                return {
                    text: "Quel symbole boursier souhaitez-vous consulter ?",
                    type: 'question'
                };
            }
            
            const response = await this.gemini.chat(
                `Fournis les données de marché en temps réel pour ${symbol} de manière claire et structurée.`,
                context
            );
            
            response.type = 'market_data';
            return response;
            
        } catch (error) {
            return this.getErrorResponse(error);
        }
    }

    /**
     * Gère les requêtes d'actualités
     */
    async handleNewsRequest(intent, context) {
        try {
            const symbol = intent.params.symbol;
            let news = [];
            
            if (this.apiClient) {
                if (symbol) {
                    const today = new Date();
                    const from = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
                    const to = new Date().toISOString().split('T')[0];
                    news = await this.apiClient.getCompanyNews(symbol, from, to).catch(() => []);
                } else {
                    news = await this.apiClient.getMarketNews('general').catch(() => []);
                }
            }
            
            const prompt = news.length > 0 
                ? `Résume ces actualités financières : ${JSON.stringify(news.slice(0, 10), null, 2)}`
                : "L'utilisateur demande des actualités financières.";
            
            const response = await this.gemini.chat(prompt, { news });
            response.newsData = news;
            response.type = 'news';
            
            return response;
            
        } catch (error) {
            return this.getErrorResponse(error);
        }
    }

    /**
     * Gère les prédictions
     */
    async handlePrediction(intent, context) {
        try {
            const symbol = intent.params.symbol;
            
            if (!symbol) {
                return {
                    text: "Pour quelle action souhaitez-vous une analyse prédictive ?",
                    type: 'question'
                };
            }
            
            let timeSeries = [];
            if (this.apiClient) {
                const data = await this.apiClient.getTimeSeries(symbol, '1day', 365).catch(() => null);
                if (data && data.data) {
                    timeSeries = data.data;
                }
            }
            
            const response = await this.gemini.predictTrends(symbol, timeSeries, '6 mois');
            response.type = 'prediction';
            
            return response;
            
        } catch (error) {
            return this.getErrorResponse(error);
        }
    }

    /**
     * Gère l'explication de concepts
     */
    async handleConceptExplanation(intent, context) {
        const response = await this.gemini.explainConcept(intent.concept);
        response.type = 'educational';
        return response;
    }

    /**
     * Gère les requêtes générales
     */
    async handleGeneralQuery(message, context) {
        const response = await this.gemini.chat(message, context);
        response.type = 'general';
        return response;
    }

    /**
     * Utilitaires de détection
     */
    matchesPattern(message, patterns) {
        return patterns.some(pattern => message.includes(pattern));
    }

    extractSymbol(message) {
        const symbolMatch = message.match(/\b([A-Z]{1,5})\b/);
        return { symbol: symbolMatch ? symbolMatch[0] : null };
    }

    extractSymbolAndYears(message) {
        const symbol = this.extractSymbol(message).symbol;
        const yearsMatch = message.match(/(\d+)\s*(an|année|year)/i);
        const years = yearsMatch ? parseInt(yearsMatch[1]) : 5;
        return { symbol, years };
    }

    extractComparisonSymbols(message) {
        const symbols = message.match(/\b([A-Z]{1,5})\b/g);
        return { symbols: symbols || [] };
    }

    extractIPOParams(message) {
        const numberMatch = message.match(/(\d+)/);
        const limit = numberMatch ? parseInt(numberMatch[1]) : 5;
        return { limit };
    }

    /**
     * Gestion de l'historique
     */
    addToHistory(role, content) {
        this.conversationHistory.push({
            role,
            content: typeof content === 'string' ? content : content.text,
            timestamp: new Date()
        });
        
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
    }

    /**
     * Réponse d'erreur
     */
    getErrorResponse(error) {
        console.error('Error:', error);
        return {
            text: "😔 Désolé, une erreur s'est produite lors du traitement de votre demande. Pouvez-vous reformuler ou réessayer ?",
            type: 'error',
            hasChart: false,
            error: error.message
        };
    }

    /**
     * Réinitialise la conversation
     */
    resetConversation() {
        this.conversationHistory = [];
        this.gemini.resetConversation();
        this.context = {};
    }
}

window.FinancialChatbotEngine = FinancialChatbotEngine;