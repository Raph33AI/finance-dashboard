/* ========================================
   GOOGLE GEMINI 2.5 FLASH INTEGRATION
   Version finale corrigée
   ======================================== */

class GeminiAIIntegration {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = 'gemini-2.5-flash';  // ✅ MODÈLE CORRECT
        this.conversationHistory = [];
        this.systemContext = this.buildSystemContext();
        this.maxHistoryLength = 10;
        
        console.log('✅ Gemini 2.5 Flash initialized');
    }

    buildSystemContext() {
        return `Tu es FinanceGPT, un expert financier IA.

MISSION: Fournir des analyses financières précises, chiffrées et actionnables.

EXPERTISES: Analyse financière, IPOs, REX, Valorisation, Trading

STYLE:
- Structuré avec sections claires
- Chiffres et données concrètes
- Emojis pour la clarté
- Toujours terminer par "Actions suggérées:" avec 3 points

FORMAT GRAPHIQUE (si pertinent):
GRAPHIQUE_DATA:
{
  "type": "line",
  "title": "Titre",
  "labels": ["2020", "2021", "2022"],
  "datasets": [{"label": "Revenue", "data": [100, 120, 150], "color": "#3b82f6"}],
  "insights": ["Croissance de 50%"],
  "formatValue": "$"
}

RÈGLES:
- Cite sources
- Ajoute disclaimer "Ceci n'est pas un conseil en investissement"
- Reste objectif`;
    }

    async chat(userMessage, financialContext = null) {
        try {
            const fullMessage = this.buildFullMessage(userMessage, financialContext);
            
            const contents = [{
                parts: [{
                    text: `${this.systemContext}\n\nQuestion: ${fullMessage}`
                }]
            }];

            const url = `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`;
            
            console.log('📡 Appel Gemini 2.5 Flash...');

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: contents,
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                        candidateCount: 1
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Gemini API Error:', errorText);
                throw new Error(`Gemini API Error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Réponse reçue de Gemini 2.5 Flash');

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error('Aucune réponse de Gemini');
            }

            const candidate = data.candidates[0];
            
            if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
                throw new Error('Réponse Gemini vide');
            }

            const assistantMessage = candidate.content.parts[0].text;

            this.conversationHistory.push({
                role: 'user',
                message: userMessage,
                timestamp: new Date()
            });
            
            this.conversationHistory.push({
                role: 'assistant',
                message: assistantMessage,
                timestamp: new Date()
            });
            
            this.limitHistory();

            return this.parseResponse(assistantMessage);

        } catch (error) {
            console.error('❌ Chat Error:', error);
            throw error;
        }
    }

    buildFullMessage(message, context) {
        if (!context) return message;

        let enriched = message + '\n\nDONNÉES DISPONIBLES:\n';

        if (context.quote) {
            enriched += `Prix: $${context.quote.c.toFixed(2)} (${context.quote.dp >= 0 ? '+' : ''}${context.quote.dp.toFixed(2)}%)\n`;
        }

        if (context.profile) {
            enriched += `Entreprise: ${context.profile.name}\n`;
            enriched += `Secteur: ${context.profile.finnhubIndustry || 'N/A'}\n`;
            enriched += `Pays: ${context.profile.country || 'N/A'}\n`;
        }

        if (context.financials && context.financials.metric) {
            const m = context.financials.metric;
            enriched += `P/E: ${m.peNormalizedAnnual || 'N/A'}, Beta: ${m.beta || 'N/A'}\n`;
        }

        if (context.rex) {
            enriched += `REX: ${context.rex.years} années de données disponibles\n`;
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
            hasDisclaimer: response.toLowerCase().includes('conseil') || response.includes('DYOR')
        };

        // Extraction graphique
        try {
            const chartMatch = response.match(/GRAPHIQUE_DATA:\s*\{[\s\S]*?\}/);
            if (chartMatch) {
                const chartData = JSON.parse(chartMatch[0].replace('GRAPHIQUE_DATA:', '').trim());
                result.hasChart = true;
                result.chartData.push(chartData);
                if (chartData.insights) {
                    result.insights.push(...chartData.insights);
                }
            }
        } catch (e) {
            console.log('Pas de graphique dans cette réponse');
        }

        // Extraction actions
        const actionsMatch = response.match(/Actions?\s+sugg[ée]r[ée]es?\s*:?\s*\n((?:[-•*]\s*.+\n?)+)/i);
        if (actionsMatch) {
            const items = actionsMatch[1].match(/[-•*]\s*(.+)/g);
            if (items) {
                result.actions = items.map(i => i.replace(/^[-•*]\s*/, '').trim());
            }
        }

        // Extraction tableaux
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
        if (table.length > 0) {
            result.tables.push(table.join('\n'));
        }

        return result;
    }

    async analyzeFinancials(symbol, data) {
        const prompt = `Analyse financière complète de ${symbol}. Fournis: 1) Summary 2) Forces/Faiblesses 3) Recommandation 4) Actions suggérées`;
        return await this.chat(prompt, data);
    }

    async compareCompanies(symbols, dataArray) {
        const prompt = `Compare ${symbols.join(' vs ')}. Fournis tableau comparatif, analyse et actions suggérées`;
        return await this.chat(prompt, { comparison: dataArray });
    }

    async analyzeREX(symbol, rexData) {
        const prompt = `Analyse REX de ${symbol} sur ${rexData.years} ans. Fournis évolution, tendances et actions suggérées`;
        return await this.chat(prompt, { rex: rexData });
    }

    async predictTrends(symbol, historicalData, timeframe) {
        const prompt = `Analyse prédictive ${symbol} sur ${timeframe}. Fournis tendances, niveaux clés et actions suggérées`;
        return await this.chat(prompt, { timeSeries: historicalData });
    }

    async explainConcept(concept, level = 'intermediate') {
        const prompt = `Explique "${concept}" niveau ${level}. Fournis définition, exemple pratique et actions suggérées`;
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
console.log('✅ GeminiAIIntegration chargé (Gemini 2.5 Flash)');