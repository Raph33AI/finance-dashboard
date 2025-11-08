/* ========================================
   INTÉGRATION GOOGLE GEMINI PRO
   IA Conversationnelle 100% GRATUITE
   ======================================== */

class GeminiAIIntegration {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = 'gemini-1.5-flash';
        this.conversationHistory = [];
        this.systemContext = this.buildSystemContext();
        this.maxHistoryLength = 10;
    }

    buildSystemContext() {
        return `Tu es un assistant financier IA expert nommé "FinanceGPT".

EXPERTISES: Analyse financière, IPOs, Trading, Valorisation, ML Finance

STYLE: Précis, chiffré, avec graphiques et 3 actions concrètes

FORMAT GRAPHIQUES:
GRAPHIQUE_DATA:
{
  "type": "line",
  "title": "Titre",
  "labels": ["2019", "2020"],
  "datasets": [{"label": "Revenue", "data": [100, 120], "color": "#3b82f6"}],
  "insights": ["Insight 1"],
  "formatValue": "$"
}

RÈGLES: Sources + Disclaimer + Objectivité

ACTIONS: Toujours terminer par "Actions suggérées:" + 3 points`;
    }

    async chat(userMessage, financialContext = null) {
        try {
            const fullMessage = this.buildFullMessage(userMessage, financialContext);
            
            this.conversationHistory.push({
                role: 'user',
                parts: [{ text: fullMessage }]
            });

            this.limitHistory();

            const contents = [
                { role: 'user', parts: [{ text: this.systemContext }] },
                { role: 'model', parts: [{ text: "Je suis FinanceGPT, prêt à vous aider !" }] },
                ...this.conversationHistory
            ];

            const response = await fetch(
                `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: contents,
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 2048
                        },
                        safetySettings: [
                            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                        ]
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Gemini API Error:', errorData);
                throw new Error(`Gemini API Error: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('No response from Gemini');
            }

            const assistantMessage = data.candidates[0].content.parts[0].text;

            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: assistantMessage }]
            });

            return this.parseResponse(assistantMessage);

        } catch (error) {
            console.error('Gemini Chat Error:', error);
            throw error;
        }
    }

    buildFullMessage(message, context) {
        if (!context) return message;

        let enriched = message + '\n\nDONNEES DISPONIBLES:\n';

        if (context.quote) {
            enriched += `Prix: $${context.quote.c.toFixed(2)} (${context.quote.dp.toFixed(2)}%)\n`;
        }

        if (context.profile) {
            enriched += `Entreprise: ${context.profile.name} - ${context.profile.finnhubIndustry}\n`;
        }

        if (context.rex) {
            enriched += `REX: ${context.rex.years} annees de donnees\n`;
        }

        return enriched;
    }

    parseResponse(response) {
        const result = {
            text: response,
            hasChart: false,
            chartData: [],
            insights: [],
            actions: [],
            tables: [],
            hasDisclaimer: response.includes('conseil') || response.includes('DYOR')
        };

        try {
            const chartMatch = response.match(/GRAPHIQUE_DATA:\s*(\{[\s\S]*?\})/);
            if (chartMatch) {
                const chartData = JSON.parse(chartMatch[1]);
                result.hasChart = true;
                result.chartData.push(chartData);
                if (chartData.insights) {
                    result.insights.push(...chartData.insights);
                }
            }
        } catch (e) {
            console.error('Chart parse error:', e);
        }

        const actionsMatch = response.match(/Actions?\s+sugg[ée]r[ée]es?\s*:?\s*\n((?:[-•]\s*.+\n?)+)/i);
        if (actionsMatch) {
            const items = actionsMatch[1].match(/[-•]\s*(.+)/g);
            if (items) {
                result.actions = items.map(i => i.replace(/^[-•]\s*/, '').trim());
            }
        }

        const lines = response.split('\n');
        let table = [];
        lines.forEach(line => {
            if (line.trim().startsWith('|')) {
                table.push(line);
            } else if (table.length > 0) {
                result.tables.push(table.join('\n'));
                table = [];
            }
        });
        if (table.length > 0) result.tables.push(table.join('\n'));

        return result;
    }

    async analyzeFinancials(symbol, data) {
        const prompt = `Analyse financiere complete de ${symbol}. Fournis: 1) Summary 2) Forces/Faiblesses 3) Recommandation 4) Actions suggerees`;
        return await this.chat(prompt, data);
    }

    async compareCompanies(symbols, dataArray) {
        const prompt = `Compare ${symbols.join(' vs ')}. Fournis: 1) Tableau 2) Classement 3) Recommandations 4) Actions suggerees`;
        return await this.chat(prompt, { comparison: dataArray });
    }

    async analyzeREX(symbol, rexData) {
        const prompt = `Analyse REX de ${symbol} sur ${rexData.years} ans. Fournis: 1) Evolution CA 2) Marges 3) Graphiques 4) Actions suggerees`;
        return await this.chat(prompt, { rex: rexData });
    }

    async predictTrends(symbol, historicalData, timeframe) {
        const prompt = `Analyse predictive ${symbol} sur ${timeframe}. Fournis: 1) Tendance 2) Niveaux cles 3) Risques 4) Actions suggerees`;
        return await this.chat(prompt, { timeSeries: historicalData });
    }

    async explainConcept(concept, level = 'intermediate') {
        const prompt = `Explique "${concept}" niveau ${level}. Fournis: 1) Definition 2) Exemple 3) Application 4) Actions suggerees`;
        return await this.chat(prompt);
    }

    resetConversation() {
        this.conversationHistory = [];
    }

    limitHistory() {
        const max = this.maxHistoryLength * 2;
        if (this.conversationHistory.length > max) {
            this.conversationHistory = this.conversationHistory.slice(-max);
        }
    }

    getHistory() {
        return this.conversationHistory;
    }

    exportHistory() {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            model: this.model,
            history: this.conversationHistory
        }, null, 2);
    }

    importHistory(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.conversationHistory = data.history || [];
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
}

window.GeminiAIIntegration = GeminiAIIntegration;
console.log('✅ GeminiAIIntegration chargé');