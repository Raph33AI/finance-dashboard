/* ========================================
   INTÉGRATION GOOGLE GEMINI PRO
   IA Conversationnelle 100% GRATUITE
   Version Corrigée - Sans erreurs Regex
   ======================================== */

class GeminiAIIntegration {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = 'gemini-pro';
        this.conversationHistory = [];
        this.systemContext = this.buildSystemContext();
        this.maxHistoryLength = 10;
    }

    buildSystemContext() {
        return `Tu es un assistant financier IA expert et ultra-compétent nommé "FinanceGPT" spécialisé dans :

**EXPERTISES :**
- Analyse financière approfondie (bilans, comptes de résultat, cash flow)
- IPOs et marchés primaires avec scoring intelligent
- Trading et analyse technique avancée
- Valorisation d'entreprises (DCF, multiples, comparables)
- Machine Learning appliqué à la finance
- Économie et macroéconomie mondiale
- Résultats d'exploitation (REX) multi-années

**CAPACITÉS :**
- Analyse de données financières en temps réel via Finnhub API
- Recommandations d'investissement basées sur des données objectives
- Comparaisons multi-entreprises détaillées
- Prédictions quantitatives avec analyse de risque
- Explications pédagogiques adaptées au niveau de l'utilisateur
- Génération de graphiques interactifs

**STYLE DE RÉPONSE :**
- Précis, factuel et chiffré avec sources
- Utilise des emojis pertinents pour la clarté
- Structure les réponses en sections claires (titres, listes, tableaux)
- Propose toujours 3 "Actions suggérées" concrètes
- Vulgarise les concepts complexes quand nécessaire
- Génère des graphiques quand c'est pertinent

**FORMAT GRAPHIQUES :**
Quand tu fournis des données visualisables, utilise ce format JSON :

GRAPHIQUE_DATA:
\`\`\`json
{
  "type": "line|bar|pie|multi-line",
  "title": "Titre descriptif",
  "labels": ["2019", "2020", "2021", "2022", "2023"],
  "datasets": [
    {
      "label": "Revenue (M$)",
      "data": [100, 120, 150, 180, 200],
      "color": "#3b82f6"
    }
  ],
  "insights": [
    "Insight 1",
    "Insight 2"
  ],
  "formatValue": "$"
}
\`\`\`

**RÈGLES IMPORTANTES :**
1. Cite TOUJOURS tes sources de données
2. Indique les limites et incertitudes de tes analyses
3. Ajoute le disclaimer : "Ceci n'est pas un conseil en investissement. DYOR."
4. Reste objectif, jamais promotionnel
5. Structure TOUJOURS avec des sections claires

**ACTIONS SUGGÉRÉES :**
Termine TOUJOURS par une section :
**Actions suggérées :**
- Action 1
- Action 2
- Action 3

Maintenant, aide l'utilisateur avec expertise et enthousiasme !`;
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
                {
                    role: 'user',
                    parts: [{ text: this.systemContext }]
                },
                {
                    role: 'model',
                    parts: [{ 
                        text: "Parfait ! Je suis FinanceGPT, votre expert financier IA. Je fournirai des analyses précises, des graphiques interactifs et des recommandations actionnables. Toutes mes réponses incluront des sources, des insights et des actions concrètes. Comment puis-je vous aider aujourd'hui ?" 
                    }]
                },
                ...this.conversationHistory
            ];

            const response = await fetch(
                `${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`,
                {
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
                            stopSequences: []
                        },
                        safetySettings: [
                            {
                                category: "HARM_CATEGORY_HARASSMENT",
                                threshold: "BLOCK_NONE"
                            },
                            {
                                category: "HARM_CATEGORY_HATE_SPEECH",
                                threshold: "BLOCK_NONE"
                            },
                            {
                                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                threshold: "BLOCK_NONE"
                            },
                            {
                                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                                threshold: "BLOCK_NONE"
                            }
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

        let enriched = message + '\n\n**DONNÉES FINANCIÈRES DISPONIBLES :**\n';

        if (context.quote) {
            enriched += `\n**Prix en temps réel :**\n`;
            enriched += `- Prix actuel : $${context.quote.c.toFixed(2)}\n`;
            enriched += `- Variation : ${context.quote.d >= 0 ? '+' : ''}${context.quote.d.toFixed(2)} (${context.quote.dp.toFixed(2)}%)\n`;
            enriched += `- High/Low jour : $${context.quote.h.toFixed(2)} / $${context.quote.l.toFixed(2)}\n`;
            enriched += `- Volume : ${context.quote.v ? context.quote.v.toLocaleString() : 'N/A'}\n`;
        }

        if (context.profile) {
            enriched += `\n**Profil entreprise :**\n`;
            enriched += `- Nom : ${context.profile.name}\n`;
            enriched += `- Ticker : ${context.profile.ticker}\n`;
            enriched += `- Secteur : ${context.profile.finnhubIndustry || 'N/A'}\n`;
            enriched += `- Pays : ${context.profile.country || 'N/A'}\n`;
            enriched += `- Market Cap : $${((context.profile.marketCapitalization || 0) / 1000).toFixed(2)}B\n`;
            enriched += `- IPO Date : ${context.profile.ipo || 'N/A'}\n`;
        }

        if (context.financials && context.financials.metric) {
            enriched += `\n**Métriques financières :**\n`;
            const m = context.financials.metric;
            enriched += `- P/E Ratio : ${m.peNormalizedAnnual || 'N/A'}\n`;
            enriched += `- EPS (TTM) : $${m.epsBasicExclExtraItemsTTM || 'N/A'}\n`;
            enriched += `- Beta : ${m.beta || 'N/A'}\n`;
            enriched += `- ROE : ${m.roeTTM || 'N/A'}%\n`;
            enriched += `- ROA : ${m.roaTTM || 'N/A'}%\n`;
            enriched += `- Dividend Yield : ${m.dividendYieldIndicatedAnnual || 'N/A'}%\n`;
        }

        if (context.rex) {
            enriched += `\n**Résultats d'Exploitation (${context.rex.years} années) :**\n`;
            context.rex.data.forEach(year => {
                enriched += `- ${year.year} : CA $${(year.revenue / 1e6).toFixed(0)}M, REX $${(year.operatingIncome / 1e6).toFixed(0)}M (marge ${year.operatingMargin.toFixed(1)}%)\n`;
            });
        }

        enriched += `\n**Note :** Utilise ces données pour générer une analyse complète avec graphiques au format spécifié.`;

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
            hasDisclaimer: response.includes('conseil en investissement') || response.includes('DYOR')
        };

        // Extraction des graphiques JSON
        const chartRegex = /GRAPHIQUE_DATA:\s*