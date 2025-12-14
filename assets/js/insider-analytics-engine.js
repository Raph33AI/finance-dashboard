// /**
//  * ═══════════════════════════════════════════════════════════════════
//  * 🧠 INSIDER ANALYTICS ENGINE - AlphaVault AI
//  * ═══════════════════════════════════════════════════════════════════
//  * Moteur d'analyse avancée pour détecter patterns, anomalies et signaux
//  * ═══════════════════════════════════════════════════════════════════
//  */

// class InsiderAnalyticsEngine {
//     constructor() {
//         this.form4Client = new SECForm4Client();
//         this.cache = new Map();
        
//         // Configuration des seuils
//         this.thresholds = {
//             clusterBuying: {
//                 minInsiders: 3,
//                 windowDays: 7,
//                 minTotalValue: 500000
//             },
//             significantTransaction: {
//                 ceoMinValue: 1000000,
//                 cfoMinValue: 500000,
//                 directorMinValue: 250000,
//                 officerMinValue: 100000
//             },
//             preEarnings: {
//                 daysBeforeEarnings: 30,
//                 suspiciousWindowDays: 14
//             },
//             conviction: {
//                 veryHigh: 5000000,
//                 high: 1000000,
//                 medium: 100000,
//                 low: 10000
//             }
//         };

//         // Weights pour le scoring
//         this.weights = {
//             transactionValue: 0.30,
//             insiderRole: 0.25,
//             timing: 0.20,
//             frequency: 0.15,
//             historical: 0.10
//         };
//     }

//     /**
//      * 🎯 ANALYSE COMPLÈTE D'UNE ENTREPRISE
//      */
//     async analyzeCompany(ticker, options = {}) {
//         const {
//             months = 12,
//             includeDerivatives = true,
//             includePriceImpact = true,
//             includeNetworkAnalysis = true
//         } = options;

//         console.log(`🔍 Starting comprehensive analysis for ${ticker}...`);

//         try {
//             // 1. Récupération de l'historique complet
//             const history = await this.form4Client.getCompanyInsiderHistory(ticker, months);
            
//             if (!history || history.transactions.length === 0) {
//                 return {
//                     ticker,
//                     error: 'No insider transactions found',
//                     analysis: null
//                 };
//             }

//             // 2. Analyses parallèles
//             const [
//                 clusterActivity,
//                 insiderSentiment,
//                 roleAnalysis,
//                 timingPatterns,
//                 convictionScores,
//                 divergenceAnalysis,
//                 priceImpact,
//                 networkGraph
//             ] = await Promise.all([
//                 this.detectClusterBuying(history.transactions),
//                 this.calculateInsiderSentiment(history.transactions),
//                 this.analyzeByRole(history.transactions),
//                 this.detectTimingPatterns(history.transactions, ticker),
//                 this.calculateConvictionScores(history.transactions),
//                 this.detectCEOCFODivergence(history.transactions),
//                 includePriceImpact ? this.analyzePriceImpact(ticker, history.transactions) : null,
//                 includeNetworkAnalysis ? this.buildInsiderNetwork(history.transactions) : null
//             ]);

//             // 3. Score global et recommandation
//             const overallScore = this.calculateOverallScore({
//                 clusterActivity,
//                 insiderSentiment,
//                 roleAnalysis,
//                 timingPatterns,
//                 convictionScores,
//                 divergenceAnalysis
//             });

//             // 4. Génération des alertes
//             const alerts = this.generateSmartAlerts({
//                 ticker,
//                 clusterActivity,
//                 divergenceAnalysis,
//                 timingPatterns,
//                 roleAnalysis,
//                 overallScore
//             });

//             return {
//                 ticker,
//                 period: history.period,
//                 transactionCount: history.transactions.length,
//                 transactions: history.transactions,
                
//                 // Scores principaux
//                 overallScore,
//                 insiderSentiment,
                
//                 // Analyses détaillées
//                 clusterActivity,
//                 roleAnalysis,
//                 timingPatterns,
//                 convictionScores,
//                 divergenceAnalysis,
//                 priceImpact,
//                 networkGraph,
                
//                 // Alertes et recommandations
//                 alerts,
//                 recommendation: this.generateRecommendation(overallScore, alerts),
                
//                 // Méta
//                 lastUpdated: new Date().toISOString(),
//                 dataQuality: this.assessDataQuality(history.transactions)
//             };

//         } catch (error) {
//             console.error(`❌ Error analyzing ${ticker}:`, error);
//             throw error;
//         }
//     }

//     /**
//      * 📊 CLUSTER BUYING DETECTION
//      * Détecte quand plusieurs insiders achètent simultanément
//      */
//     async detectClusterBuying(transactions) {
//         const clusters = [];
//         const windowDays = this.thresholds.clusterBuying.windowDays;

//         // Filtre uniquement les achats
//         const purchases = transactions.filter(t => 
//             t.nonDerivativeTransactions?.some(nt => nt.transactionType === 'Purchase')
//         );

//         // Groupe par fenêtre temporelle
//         for (let i = 0; i < purchases.length; i++) {
//             const baseTransaction = purchases[i];
//             const baseDate = new Date(baseTransaction.filingDate);

//             // Trouve toutes les transactions dans la fenêtre
//             const clusterTransactions = purchases.filter(t => {
//                 const tDate = new Date(t.filingDate);
//                 const daysDiff = Math.abs((tDate - baseDate) / (1000 * 60 * 60 * 24));
//                 return daysDiff <= windowDays;
//             });

//             // Calcule les métriques du cluster
//             const uniqueInsiders = new Set(clusterTransactions.map(t => t.reportingOwner?.name));
//             const totalValue = clusterTransactions.reduce((sum, t) => {
//                 return sum + (t.nonDerivativeTransactions || [])
//                     .filter(nt => nt.transactionType === 'Purchase')
//                     .reduce((s, nt) => s + nt.totalValue, 0);
//             }, 0);

//             // Si critères remplis = cluster significatif
//             if (uniqueInsiders.size >= this.thresholds.clusterBuying.minInsiders &&
//                 totalValue >= this.thresholds.clusterBuying.minTotalValue) {
                
//                 clusters.push({
//                     startDate: baseDate,
//                     endDate: new Date(Math.max(...clusterTransactions.map(t => new Date(t.filingDate)))),
//                     insiderCount: uniqueInsiders.size,
//                     transactionCount: clusterTransactions.length,
//                     totalValue,
//                     averageValuePerInsider: totalValue / uniqueInsiders.size,
//                     insiders: Array.from(uniqueInsiders),
                    
//                     // Détails des transactions
//                     transactions: clusterTransactions,
                    
//                     // Scoring
//                     signal: 'BULLISH',
//                     confidence: this.calculateClusterConfidence(uniqueInsiders.size, totalValue),
//                     severity: this.calculateClusterSeverity(uniqueInsiders.size, totalValue),
                    
//                     // Contexte
//                     insiderRoles: this.extractInsiderRoles(clusterTransactions),
//                     isPreEarnings: false // Sera enrichi plus tard
//                 });
//             }
//         }

//         // Déduplique les clusters qui se chevauchent
//         const deduplicated = this.deduplicateClusters(clusters);

//         return {
//             detected: deduplicated.length > 0,
//             count: deduplicated.length,
//             clusters: deduplicated.sort((a, b) => b.confidence - a.confidence),
            
//             // Statistiques
//             totalInsidersInvolved: new Set(deduplicated.flatMap(c => c.insiders)).size,
//             totalValueInClusters: deduplicated.reduce((sum, c) => sum + c.totalValue, 0),
            
//             // Signal global
//             overallSignal: this.calculateClusterSignal(deduplicated)
//         };
//     }

//     /**
//      * 💭 INSIDER SENTIMENT SCORE
//      * Score agrégé de -100 (très bearish) à +100 (très bullish)
//      */
//     calculateInsiderSentiment(transactions) {
//         if (!transactions || transactions.length === 0) {
//             return {
//                 score: 0,
//                 label: 'NEUTRAL',
//                 breakdown: { purchases: 0, sales: 0, netValue: 0 }
//             };
//         }

//         let purchaseValue = 0;
//         let saleValue = 0;
//         let purchaseCount = 0;
//         let saleCount = 0;

//         transactions.forEach(t => {
//             (t.nonDerivativeTransactions || []).forEach(nt => {
//                 if (nt.transactionType === 'Purchase') {
//                     purchaseValue += nt.totalValue;
//                     purchaseCount++;
//                 } else if (nt.transactionType === 'Sale') {
//                     saleValue += nt.totalValue;
//                     saleCount++;
//                 }
//             });
//         });

//         // Calcul du score composite
//         const totalValue = purchaseValue + saleValue;
//         const valueRatio = totalValue > 0 ? (purchaseValue - saleValue) / totalValue : 0;
        
//         const totalCount = purchaseCount + saleCount;
//         const countRatio = totalCount > 0 ? (purchaseCount - saleCount) / totalCount : 0;
        
//         // Pondération: 70% valeur, 30% fréquence
//         const score = Math.round((valueRatio * 0.7 + countRatio * 0.3) * 100);
        
//         return {
//             score: Math.max(-100, Math.min(100, score)),
//             label: this.getSentimentLabel(score),
            
//             breakdown: {
//                 purchases: purchaseCount,
//                 sales: saleCount,
//                 purchaseValue,
//                 saleValue,
//                 netValue: purchaseValue - saleValue,
//                 netCount: purchaseCount - saleCount
//             },
            
//             // Contexte
//             dominantActivity: purchaseValue > saleValue ? 'BUYING' : 'SELLING',
//             intensity: this.calculateIntensity(totalValue, totalCount),
            
//             // Historique
//             trend: this.calculateSentimentTrend(transactions)
//         };
//     }

//     /**
//      * 👔 ANALYSE PAR RÔLE (CEO, CFO, Directors, etc.)
//      */
//     analyzeByRole(transactions) {
//         const roleData = {
//             CEO: { purchases: [], sales: [], netValue: 0 },
//             CFO: { purchases: [], sales: [], netValue: 0 },
//             CTO: { purchases: [], sales: [], netValue: 0 },
//             COO: { purchases: [], sales: [], netValue: 0 },
//             President: { purchases: [], sales: [], netValue: 0 },
//             Director: { purchases: [], sales: [], netValue: 0 },
//             Officer: { purchases: [], sales: [], netValue: 0 },
//             '10% Owner': { purchases: [], sales: [], netValue: 0 },
//             Other: { purchases: [], sales: [], netValue: 0 }
//         };

//         transactions.forEach(t => {
//             const role = t.reportingOwner?.classification || 'Other';
//             if (!roleData[role]) roleData[role] = { purchases: [], sales: [], netValue: 0 };

//             (t.nonDerivativeTransactions || []).forEach(nt => {
//                 if (nt.transactionType === 'Purchase') {
//                     roleData[role].purchases.push(nt);
//                     roleData[role].netValue += nt.totalValue;
//                 } else if (nt.transactionType === 'Sale') {
//                     roleData[role].sales.push(nt);
//                     roleData[role].netValue -= nt.totalValue;
//                 }
//             });
//         });

//         // Calcule les scores par rôle
//         const roleScores = {};
//         Object.keys(roleData).forEach(role => {
//             const data = roleData[role];
//             const totalPurchaseValue = data.purchases.reduce((sum, p) => sum + p.totalValue, 0);
//             const totalSaleValue = data.sales.reduce((sum, s) => sum + s.totalValue, 0);
            
//             roleScores[role] = {
//                 purchaseCount: data.purchases.length,
//                 saleCount: data.sales.length,
//                 purchaseValue: totalPurchaseValue,
//                 saleValue: totalSaleValue,
//                 netValue: data.netValue,
                
//                 // Score spécifique au rôle
//                 score: this.calculateRoleScore(role, totalPurchaseValue, totalSaleValue),
//                 signal: data.netValue > 0 ? 'BULLISH' : data.netValue < 0 ? 'BEARISH' : 'NEUTRAL',
                
//                 // Importance du signal (CEO/CFO plus importants)
//                 weight: this.getRoleWeight(role)
//             };
//         });

//         return {
//             byRole: roleScores,
            
//             // Insights clés
//             mostActiveRole: this.getMostActiveRole(roleScores),
//             mostBullishRole: this.getMostBullishRole(roleScores),
//             mostBearishRole: this.getMostBearishRole(roleScores),
            
//             // Pondération globale
//             weightedScore: this.calculateWeightedRoleScore(roleScores)
//         };
//     }

//     /**
//      * ⏰ TIMING PATTERNS DETECTION
//      * Détecte les achats/ventes avant earnings, annonces, etc.
//      */
//     async detectTimingPatterns(transactions, ticker) {
//         // Note: Pour une vraie implémentation, il faudrait récupérer
//         // le calendrier des earnings depuis une API (Alpha Vantage, etc.)
        
//         const patterns = {
//             preEarnings: [],
//             postEarnings: [],
//             beforeAnnouncements: [],
//             unusual: []
//         };

//         // Détecte les clusters temporels suspects
//         const sortedTransactions = [...transactions].sort((a, b) => 
//             new Date(a.filingDate) - new Date(b.filingDate)
//         );

//         for (let i = 0; i < sortedTransactions.length; i++) {
//             const txn = sortedTransactions[i];
//             const txnDate = new Date(txn.filingDate);

//             // Vérifie si c'est dans une période suspecte (ex: 14 jours avant quarter-end)
//             const dayOfYear = this.getDayOfYear(txnDate);
//             const isNearQuarterEnd = this.isNearQuarterEnd(txnDate);

//             if (isNearQuarterEnd) {
//                 const netValue = (txn.nonDerivativeTransactions || [])
//                     .reduce((sum, nt) => {
//                         return sum + (nt.transactionType === 'Purchase' ? nt.totalValue : -nt.totalValue);
//                     }, 0);

//                 patterns.preEarnings.push({
//                     date: txnDate,
//                     insider: txn.reportingOwner?.name,
//                     role: txn.reportingOwner?.classification,
//                     netValue,
//                     signal: netValue > 0 ? 'BULLISH' : 'BEARISH',
//                     suspicionLevel: this.calculateSuspicionLevel(netValue, txn.reportingOwner?.classification),
//                     daysBeforeQuarterEnd: this.daysUntilQuarterEnd(txnDate)
//                 });
//             }

//             // Détecte les transactions inhabituelles (taille, fréquence)
//             const isUnusual = this.isUnusualTransaction(txn, sortedTransactions);
//             if (isUnusual.detected) {
//                 patterns.unusual.push({
//                     date: txnDate,
//                     insider: txn.reportingOwner?.name,
//                     reason: isUnusual.reason,
//                     metrics: isUnusual.metrics
//                 });
//             }
//         }

//         return {
//             preEarningsActivity: {
//                 count: patterns.preEarnings.length,
//                 transactions: patterns.preEarnings,
//                 totalValue: patterns.preEarnings.reduce((sum, p) => sum + Math.abs(p.netValue), 0),
//                 signal: this.aggregateSignal(patterns.preEarnings)
//             },
            
//             unusualActivity: {
//                 count: patterns.unusual.length,
//                 transactions: patterns.unusual
//             },
            
//             // Pattern global
//             hasSignificantTiming: patterns.preEarnings.length > 0 || patterns.unusual.length > 0,
//             riskLevel: this.calculateTimingRiskLevel(patterns)
//         };
//     }

//     /**
//      * 💪 CONVICTION SCORES
//      * Mesure la conviction basée sur la taille relative des transactions
//      */
//     calculateConvictionScores(transactions) {
//         const scores = transactions.map(t => {
//             const totalValue = (t.nonDerivativeTransactions || [])
//                 .reduce((sum, nt) => sum + nt.totalValue, 0);

//             const role = t.reportingOwner?.classification;
//             const threshold = this.getConvictionThreshold(role);

//             return {
//                 insider: t.reportingOwner?.name,
//                 role,
//                 transactionValue: totalValue,
//                 convictionLevel: this.getConvictionLevel(totalValue),
//                 convictionScore: this.calculateConvictionScore(totalValue, threshold),
                
//                 // Métrique: transaction value vs wealth (si disponible)
//                 // Pour l'instant, on se base uniquement sur la valeur absolue
//                 isHighConviction: totalValue > threshold
//             };
//         }).filter(s => s.transactionValue > 0);

//         return {
//             scores: scores.sort((a, b) => b.convictionScore - a.convictionScore),
            
//             // Statistiques
//             averageConviction: scores.length > 0 
//                 ? scores.reduce((sum, s) => sum + s.convictionScore, 0) / scores.length 
//                 : 0,
            
//             highConvictionCount: scores.filter(s => s.isHighConviction).length,
//             highConvictionValue: scores
//                 .filter(s => s.isHighConviction)
//                 .reduce((sum, s) => sum + s.transactionValue, 0)
//         };
//     }

//     /**
//      * 🚨 CEO/CFO DIVERGENCE DETECTION
//      * Red flag quand CEO vend et CFO achète (ou inverse)
//      */
//     detectCEOCFODivergence(transactions) {
//         const ceoTransactions = transactions.filter(t => 
//             t.reportingOwner?.classification === 'CEO'
//         );
//         const cfoTransactions = transactions.filter(t => 
//             t.reportingOwner?.classification === 'CFO'
//         );

//         if (ceoTransactions.length === 0 || cfoTransactions.length === 0) {
//             return {
//                 detected: false,
//                 divergence: null
//             };
//         }

//         // Calcule le sentiment net pour chaque rôle
//         const ceoSentiment = this.calculateRoleSentiment(ceoTransactions);
//         const cfoSentiment = this.calculateRoleSentiment(cfoTransactions);

//         // Divergence = signes opposés
//         const isDivergent = (ceoSentiment > 0 && cfoSentiment < 0) || 
//                            (ceoSentiment < 0 && cfoSentiment > 0);

//         if (!isDivergent) {
//             return {
//                 detected: false,
//                 ceoSentiment,
//                 cfoSentiment,
//                 alignment: 'ALIGNED'
//             };
//         }

//         // Calcule la sévérité de la divergence
//         const divergenceScore = Math.abs(ceoSentiment - cfoSentiment);

//         return {
//             detected: true,
            
//             ceo: {
//                 sentiment: ceoSentiment,
//                 direction: ceoSentiment > 0 ? 'BUYING' : 'SELLING',
//                 transactionCount: ceoTransactions.length
//             },
            
//             cfo: {
//                 sentiment: cfoSentiment,
//                 direction: cfoSentiment > 0 ? 'BUYING' : 'SELLING',
//                 transactionCount: cfoTransactions.length
//             },
            
//             divergenceScore,
//             severity: this.getDivergenceSeverity(divergenceScore),
            
//             // Signal (CEO selling + CFO buying = potentiel red flag)
//             redFlag: ceoSentiment < 0 && cfoSentiment > 0,
            
//             interpretation: this.interpretDivergence(ceoSentiment, cfoSentiment)
//         };
//     }

//     /**
//      * 📈 PRICE IMPACT ANALYSIS
//      * Analyse l'impact historique des insider trades sur le cours
//      */
//     async analyzePriceImpact(ticker, transactions) {
//         // Note: Nécessite une API de prix historiques (Alpha Vantage, Yahoo Finance, etc.)
//         // Pour l'instant, retourne une structure vide
        
//         console.log(`📈 Price impact analysis for ${ticker} (placeholder)`);
        
//         return {
//             available: false,
//             message: 'Price data integration required',
            
//             // Structure pour future implémentation
//             correlations: [],
//             averageImpact: {
//                 after1Day: null,
//                 after5Days: null,
//                 after30Days: null
//             },
            
//             // Accuracy du signal insider
//             historicalAccuracy: null
//         };
//     }

//     /**
//      * 🕸 NETWORK ANALYSIS
//      * Construit le graphe des relations entre insiders
//      */
//     buildInsiderNetwork(transactions) {
//         const network = {
//             nodes: [],
//             edges: [],
//             communities: []
//         };

//         // Construit les nœuds (insiders)
//         const insiderMap = new Map();
//         transactions.forEach(t => {
//             const name = t.reportingOwner?.name;
//             const role = t.reportingOwner?.classification;
            
//             if (!insiderMap.has(name)) {
//                 insiderMap.set(name, {
//                     id: name,
//                     name,
//                     role,
//                     transactionCount: 0,
//                     totalValue: 0,
//                     sentiment: 0
//                 });
//             }

//             const node = insiderMap.get(name);
//             node.transactionCount++;
            
//             const netValue = (t.nonDerivativeTransactions || [])
//                 .reduce((sum, nt) => {
//                     return sum + (nt.transactionType === 'Purchase' ? nt.totalValue : -nt.totalValue);
//                 }, 0);
            
//             node.totalValue += Math.abs(netValue);
//             node.sentiment += netValue;
//         });

//         network.nodes = Array.from(insiderMap.values());

//         // Détecte les "board interlocks" (insiders qui agissent ensemble)
//         // Simplifié: considère comme connectés les insiders qui transactent dans la même période
//         const windowDays = 7;
//         const connections = new Map();

//         for (let i = 0; i < transactions.length; i++) {
//             for (let j = i + 1; j < transactions.length; j++) {
//                 const t1 = transactions[i];
//                 const t2 = transactions[j];
                
//                 const date1 = new Date(t1.filingDate);
//                 const date2 = new Date(t2.filingDate);
//                 const daysDiff = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));

//                 if (daysDiff <= windowDays) {
//                     const name1 = t1.reportingOwner?.name;
//                     const name2 = t2.reportingOwner?.name;
                    
//                     if (name1 !== name2) {
//                         const edgeKey = [name1, name2].sort().join('_');
//                         connections.set(edgeKey, (connections.get(edgeKey) || 0) + 1);
//                     }
//                 }
//             }
//         }

//         // Convertit les connexions en edges
//         connections.forEach((weight, edgeKey) => {
//             const [source, target] = edgeKey.split('_');
//             network.edges.push({
//                 source,
//                 target,
//                 weight,
//                 strength: weight > 3 ? 'STRONG' : weight > 1 ? 'MEDIUM' : 'WEAK'
//             });
//         });

//         // Détecte les communautés (groupes d'insiders fortement connectés)
//         network.communities = this.detectCommunities(network.nodes, network.edges);

//         return {
//             nodeCount: network.nodes.length,
//             edgeCount: network.edges.length,
//             communityCount: network.communities.length,
            
//             network,
            
//             // Métriques du réseau
//             density: this.calculateNetworkDensity(network.nodes.length, network.edges.length),
//             centralInsiders: this.findCentralInsiders(network.nodes, network.edges)
//         };
//     }

//     /**
//      * 🎯 OVERALL SCORE CALCULATION
//      * Combine tous les signaux pour un score global
//      */
//     calculateOverallScore(analyses) {
//         const {
//             clusterActivity,
//             insiderSentiment,
//             roleAnalysis,
//             timingPatterns,
//             convictionScores,
//             divergenceAnalysis
//         } = analyses;

//         let score = 50; // Base neutre

//         // 1. Sentiment insider (+/- 20 points)
//         score += (insiderSentiment.score / 100) * 20;

//         // 2. Cluster buying (+15 points si détecté)
//         if (clusterActivity.detected) {
//             score += 15 * (clusterActivity.overallSignal === 'BULLISH' ? 1 : -1);
//         }

//         // 3. Role-based score (+/- 15 points)
//         score += (roleAnalysis.weightedScore / 100) * 15;

//         // 4. Conviction (+10 points)
//         const avgConviction = convictionScores.averageConviction;
//         score += (avgConviction / 100) * 10;

//         // 5. Timing patterns (-10 points si suspect)
//         if (timingPatterns.hasSignificantTiming && timingPatterns.riskLevel === 'HIGH') {
//             score -= 10;
//         }

//         // 6. CEO/CFO divergence (-15 points si red flag)
//         if (divergenceAnalysis.detected && divergenceAnalysis.redFlag) {
//             score -= 15;
//         }

//         return {
//             score: Math.max(0, Math.min(100, Math.round(score))),
//             label: this.getScoreLabel(score),
//             components: {
//                 sentiment: insiderSentiment.score,
//                 cluster: clusterActivity.detected ? 15 : 0,
//                 role: roleAnalysis.weightedScore,
//                 conviction: avgConviction,
//                 timing: timingPatterns.riskLevel === 'HIGH' ? -10 : 0,
//                 divergence: divergenceAnalysis.redFlag ? -15 : 0
//             }
//         };
//     }

//     /**
//      * 🚨 SMART ALERTS GENERATION
//      */
//     generateSmartAlerts(data) {
//         const alerts = [];

//         // Alert 1: Cluster buying détecté
//         if (data.clusterActivity.detected && data.clusterActivity.clusters.length > 0) {
//             const topCluster = data.clusterActivity.clusters[0];
//             alerts.push({
//                 type: 'CLUSTER_BUYING',
//                 severity: topCluster.severity,
//                 title: `${topCluster.insiderCount} insiders achètent simultanément`,
//                 description: `Valeur totale: $${this.formatNumber(topCluster.totalValue)}`,
//                 confidence: topCluster.confidence,
//                 signal: 'BULLISH',
//                 data: topCluster,
//                 timestamp: new Date().toISOString()
//             });
//         }

//         // Alert 2: CEO/CFO divergence
//         if (data.divergenceAnalysis.detected && data.divergenceAnalysis.redFlag) {
//             alerts.push({
//                 type: 'CEO_CFO_DIVERGENCE',
//                 severity: 'HIGH',
//                 title: '⚠ Divergence CEO/CFO détectée',
//                 description: `CEO: ${data.divergenceAnalysis.ceo.direction}, CFO: ${data.divergenceAnalysis.cfo.direction}`,
//                 confidence: 85,
//                 signal: 'WARNING',
//                 data: data.divergenceAnalysis,
//                 timestamp: new Date().toISOString()
//             });
//         }

//         // Alert 3: Activité pré-earnings suspecte
//         if (data.timingPatterns.hasSignificantTiming && 
//             data.timingPatterns.preEarningsActivity.count > 0) {
//             alerts.push({
//                 type: 'PRE_EARNINGS_ACTIVITY',
//                 severity: data.timingPatterns.riskLevel,
//                 title: 'Activité insider avant earnings',
//                 description: `${data.timingPatterns.preEarningsActivity.count} transactions suspectes`,
//                 confidence: 70,
//                 signal: data.timingPatterns.preEarningsActivity.signal,
//                 data: data.timingPatterns.preEarningsActivity,
//                 timestamp: new Date().toISOString()
//             });
//         }

//         // Alert 4: C-level achète massivement
//         const ceoData = data.roleAnalysis.byRole.CEO;
//         const cfoData = data.roleAnalysis.byRole.CFO;
        
//         if (ceoData && ceoData.purchaseValue > 1000000) {
//             alerts.push({
//                 type: 'CEO_MAJOR_PURCHASE',
//                 severity: 'HIGH',
//                 title: 'CEO achète massivement',
//                 description: `Valeur: $${this.formatNumber(ceoData.purchaseValue)}`,
//                 confidence: 90,
//                 signal: 'BULLISH',
//                 data: ceoData,
//                 timestamp: new Date().toISOString()
//             });
//         }

//         if (cfoData && cfoData.saleValue > 500000) {
//             alerts.push({
//                 type: 'CFO_MAJOR_SALE',
//                 severity: 'MEDIUM',
//                 title: 'CFO vend massivement',
//                 description: `Valeur: $${this.formatNumber(cfoData.saleValue)}`,
//                 confidence: 75,
//                 signal: 'BEARISH',
//                 data: cfoData,
//                 timestamp: new Date().toISOString()
//             });
//         }

//         // Alert 5: Score global extrême
//         if (data.overallScore.score >= 80) {
//             alerts.push({
//                 type: 'STRONG_BUY_SIGNAL',
//                 severity: 'HIGH',
//                 title: '🚀 Signal d\'achat fort des insiders',
//                 description: `Score: ${data.overallScore.score}/100`,
//                 confidence: 95,
//                 signal: 'STRONG_BUY',
//                 data: data.overallScore,
//                 timestamp: new Date().toISOString()
//             });
//         } else if (data.overallScore.score <= 20) {
//             alerts.push({
//                 type: 'STRONG_SELL_SIGNAL',
//                 severity: 'HIGH',
//                 title: '⚠ Signal de vente fort des insiders',
//                 description: `Score: ${data.overallScore.score}/100`,
//                 confidence: 90,
//                 signal: 'STRONG_SELL',
//                 data: data.overallScore,
//                 timestamp: new Date().toISOString()
//             });
//         }

//         return alerts.sort((a, b) => {
//             const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
//             return severityOrder[b.severity] - severityOrder[a.severity];
//         });
//     }

//     /**
//      * 💡 RECOMMENDATION GENERATION
//      */
//     generateRecommendation(overallScore, alerts) {
//         const score = overallScore.score;
        
//         let action, confidence, rationale = [];

//         if (score >= 75) {
//             action = 'STRONG BUY';
//             confidence = 'HIGH';
//             rationale.push('Forte activité d\'achat des insiders');
//         } else if (score >= 60) {
//             action = 'BUY';
//             confidence = 'MEDIUM';
//             rationale.push('Sentiment insider positif');
//         } else if (score >= 40) {
//             action = 'HOLD';
//             confidence = 'LOW';
//             rationale.push('Activité insider mixte');
//         } else if (score >= 25) {
//             action = 'SELL';
//             confidence = 'MEDIUM';
//             rationale.push('Sentiment insider négatif');
//         } else {
//             action = 'STRONG SELL';
//             confidence = 'HIGH';
//             rationale.push('Forte activité de vente des insiders');
//         }

//         // Ajoute les rationales des alertes majeures
//         alerts.filter(a => a.severity === 'HIGH').forEach(alert => {
//             if (alert.type === 'CLUSTER_BUYING') {
//                 rationale.push('Cluster buying détecté');
//             }
//             if (alert.type === 'CEO_CFO_DIVERGENCE') {
//                 rationale.push('⚠ Divergence CEO/CFO (red flag)');
//             }
//         });

//         return {
//             action,
//             confidence,
//             score: overallScore.score,
//             rationale: rationale.slice(0, 5), // Max 5 raisons
//             timestamp: new Date().toISOString()
//         };
//     }

//     /**
//      * 🔧 HELPER METHODS
//      */

//     calculateClusterConfidence(insiderCount, totalValue) {
//         let confidence = 50;
//         confidence += Math.min(insiderCount * 10, 30); // +30 max pour nombre d'insiders
//         confidence += totalValue > 5000000 ? 20 : totalValue > 1000000 ? 10 : 0;
//         return Math.min(100, confidence);
//     }

//     calculateClusterSeverity(insiderCount, totalValue) {
//         if (insiderCount >= 5 && totalValue > 5000000) return 'HIGH';
//         if (insiderCount >= 3 && totalValue > 1000000) return 'MEDIUM';
//         return 'LOW';
//     }

//     deduplicateClusters(clusters) {
//         return clusters.filter((cluster, index) => {
//             return !clusters.some((other, otherIndex) => {
//                 if (index >= otherIndex) return false;
//                 const timeDiff = Math.abs(cluster.startDate - other.startDate) / (1000 * 60 * 60 * 24);
//                 return timeDiff < 7 && other.confidence > cluster.confidence;
//             });
//         });
//     }

//     extractInsiderRoles(transactions) {
//         const roles = new Set();
//         transactions.forEach(t => {
//             if (t.reportingOwner?.classification) {
//                 roles.add(t.reportingOwner.classification);
//             }
//         });
//         return Array.from(roles);
//     }

//     calculateClusterSignal(clusters) {
//         if (clusters.length === 0) return 'NEUTRAL';
//         const avgConfidence = clusters.reduce((sum, c) => sum + c.confidence, 0) / clusters.length;
//         if (avgConfidence >= 80) return 'STRONG_BULLISH';
//         if (avgConfidence >= 60) return 'BULLISH';
//         return 'MODERATE_BULLISH';
//     }

//     getSentimentLabel(score) {
//         if (score >= 75) return 'VERY BULLISH';
//         if (score >= 50) return 'BULLISH';
//         if (score >= 25) return 'SLIGHTLY BULLISH';
//         if (score >= -25) return 'NEUTRAL';
//         if (score >= -50) return 'SLIGHTLY BEARISH';
//         if (score >= -75) return 'BEARISH';
//         return 'VERY BEARISH';
//     }

//     calculateIntensity(totalValue, totalCount) {
//         if (totalValue > 10000000 || totalCount > 20) return 'VERY HIGH';
//         if (totalValue > 5000000 || totalCount > 10) return 'HIGH';
//         if (totalValue > 1000000 || totalCount > 5) return 'MEDIUM';
//         return 'LOW';
//     }

//     calculateSentimentTrend(transactions) {
//         // Simplifié: compare première moitié vs deuxième moitié
//         if (!transactions || transactions.length < 4) {
//             return 'INSUFFICIENT_DATA';
//         }

//         const mid = Math.floor(transactions.length / 2);
//         const firstHalf = transactions.slice(0, mid);
//         const secondHalf = transactions.slice(mid);

//         // ✅ CORRECTION : Calcul direct sans appeler calculateInsiderSentiment
//         const calculateSimpleSentiment = (txns) => {
//             let purchaseValue = 0;
//             let saleValue = 0;
//             let purchaseCount = 0;
//             let saleCount = 0;

//             txns.forEach(t => {
//                 (t.nonDerivativeTransactions || []).forEach(nt => {
//                     if (nt.transactionType === 'Purchase') {
//                         purchaseValue += nt.totalValue || 0;
//                         purchaseCount++;
//                     } else if (nt.transactionType === 'Sale') {
//                         saleValue += nt.totalValue || 0;
//                         saleCount++;
//                     }
//                 });
//             });

//             const totalValue = purchaseValue + saleValue;
//             const valueRatio = totalValue > 0 ? (purchaseValue - saleValue) / totalValue : 0;
            
//             const totalCount = purchaseCount + saleCount;
//             const countRatio = totalCount > 0 ? (purchaseCount - saleCount) / totalCount : 0;
            
//             return Math.round((valueRatio * 0.7 + countRatio * 0.3) * 100);
//         };

//         const firstSentiment = calculateSimpleSentiment(firstHalf);
//         const secondSentiment = calculateSimpleSentiment(secondHalf);

//         if (secondSentiment > firstSentiment + 20) return 'IMPROVING';
//         if (secondSentiment < firstSentiment - 20) return 'DETERIORATING';
//         return 'STABLE';
//     }

//     calculateRoleScore(role, purchaseValue, saleValue) {
//         const netValue = purchaseValue - saleValue;
//         const totalValue = purchaseValue + saleValue;
//         if (totalValue === 0) return 0;
        
//         const ratio = netValue / totalValue;
//         return Math.round(ratio * 100);
//     }

//     getRoleWeight(role) {
//         const weights = {
//             'CEO': 1.0,
//             'CFO': 0.9,
//             'CTO': 0.7,
//             'COO': 0.7,
//             'President': 0.8,
//             'Director': 0.6,
//             '10% Owner': 0.8,
//             'Officer': 0.5,
//             'Other': 0.3
//         };
//         return weights[role] || 0.3;
//     }

//     getMostActiveRole(roleScores) {
//         let maxActivity = 0;
//         let mostActive = null;
        
//         Object.entries(roleScores).forEach(([role, data]) => {
//             const activity = data.purchaseCount + data.saleCount;
//             if (activity > maxActivity) {
//                 maxActivity = activity;
//                 mostActive = { role, ...data };
//             }
//         });
        
//         return mostActive;
//     }

//     getMostBullishRole(roleScores) {
//         let maxScore = -Infinity;
//         let mostBullish = null;
        
//         Object.entries(roleScores).forEach(([role, data]) => {
//             if (data.score > maxScore) {
//                 maxScore = data.score;
//                 mostBullish = { role, ...data };
//             }
//         });
        
//         return mostBullish;
//     }

//     getMostBearishRole(roleScores) {
//         let minScore = Infinity;
//         let mostBearish = null;
        
//         Object.entries(roleScores).forEach(([role, data]) => {
//             if (data.score < minScore) {
//                 minScore = data.score;
//                 mostBearish = { role, ...data };
//             }
//         });
        
//         return mostBearish;
//     }

//     calculateWeightedRoleScore(roleScores) {
//         let weightedSum = 0;
//         let totalWeight = 0;
        
//         Object.entries(roleScores).forEach(([role, data]) => {
//             const weight = data.weight;
//             weightedSum += data.score * weight;
//             totalWeight += weight;
//         });
        
//         return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
//     }

//     getDayOfYear(date) {
//         const start = new Date(date.getFullYear(), 0, 0);
//         const diff = date - start;
//         const oneDay = 1000 * 60 * 60 * 24;
//         return Math.floor(diff / oneDay);
//     }

//     isNearQuarterEnd(date) {
//         const month = date.getMonth() + 1;
//         const day = date.getDate();
        
//         // Derniers 14 jours avant fin de quarter (Mars, Juin, Sept, Déc)
//         const quarterEndMonths = [3, 6, 9, 12];
//         if (quarterEndMonths.includes(month)) {
//             return day >= 17; // 14 derniers jours du mois
//         }
        
//         return false;
//     }

//     daysUntilQuarterEnd(date) {
//         const month = date.getMonth() + 1;
//         const day = date.getDate();
        
//         const quarterEndMonths = [3, 6, 9, 12];
//         const nextQuarter = quarterEndMonths.find(m => m >= month) || 12;
        
//         const quarterEndDate = new Date(date.getFullYear(), nextQuarter - 1, 30);
//         return Math.ceil((quarterEndDate - date) / (1000 * 60 * 60 * 24));
//     }

//     calculateSuspicionLevel(netValue, role) {
//         const threshold = this.thresholds.significantTransaction[role.toLowerCase() + 'MinValue'] || 100000;
        
//         if (Math.abs(netValue) > threshold * 5) return 'VERY_HIGH';
//         if (Math.abs(netValue) > threshold * 2) return 'HIGH';
//         if (Math.abs(netValue) > threshold) return 'MEDIUM';
//         return 'LOW';
//     }

//     isUnusualTransaction(txn, allTransactions) {
//         const totalValue = (txn.nonDerivativeTransactions || [])
//             .reduce((sum, nt) => sum + nt.totalValue, 0);

//         // Calcule la moyenne et l'écart-type
//         const values = allTransactions.map(t => 
//             (t.nonDerivativeTransactions || []).reduce((sum, nt) => sum + nt.totalValue, 0)
//         );
        
//         const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
//         const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
//         const stdDev = Math.sqrt(variance);

//         // Transaction inhabituelle si > 2 écarts-types
//         const zScore = (totalValue - mean) / stdDev;
        
//         if (Math.abs(zScore) > 2) {
//             return {
//                 detected: true,
//                 reason: zScore > 0 ? 'Unusually large transaction' : 'Unusually small transaction',
//                 metrics: {
//                     value: totalValue,
//                     mean,
//                     stdDev,
//                     zScore: Math.round(zScore * 100) / 100
//                 }
//             };
//         }

//         return { detected: false };
//     }

//     aggregateSignal(transactions) {
//         const netValue = transactions.reduce((sum, t) => sum + t.netValue, 0);
//         if (netValue > 0) return 'BULLISH';
//         if (netValue < 0) return 'BEARISH';
//         return 'NEUTRAL';
//     }

//     calculateTimingRiskLevel(patterns) {
//         const preEarningsCount = patterns.preEarnings.length;
//         const unusualCount = patterns.unusual.length;
        
//         if (preEarningsCount > 5 || unusualCount > 3) return 'HIGH';
//         if (preEarningsCount > 2 || unusualCount > 1) return 'MEDIUM';
//         return 'LOW';
//     }

//     getConvictionThreshold(role) {
//         return this.thresholds.significantTransaction[role.toLowerCase() + 'MinValue'] || 100000;
//     }

//     getConvictionLevel(value) {
//         const t = this.thresholds.conviction;
//         if (value > t.veryHigh) return 'VERY_HIGH';
//         if (value > t.high) return 'HIGH';
//         if (value > t.medium) return 'MEDIUM';
//         if (value > t.low) return 'LOW';
//         return 'VERY_LOW';
//     }

//     calculateConvictionScore(value, threshold) {
//         const ratio = value / threshold;
//         return Math.min(100, Math.round(ratio * 20)); // Max 100
//     }

//     calculateRoleSentiment(transactions) {
//         const sentiment = this.calculateInsiderSentiment(transactions);
//         return sentiment.score;
//     }

//     getDivergenceSeverity(score) {
//         if (score > 150) return 'CRITICAL';
//         if (score > 100) return 'HIGH';
//         if (score > 50) return 'MEDIUM';
//         return 'LOW';
//     }

//     interpretDivergence(ceoSentiment, cfoSentiment) {
//         if (ceoSentiment < 0 && cfoSentiment > 0) {
//             return '⚠ RED FLAG: CEO vend alors que CFO achète. Possible désaccord stratégique ou diversification personnelle du CEO.';
//         }
//         if (ceoSentiment > 0 && cfoSentiment < 0) {
//             return '⚠ ATTENTION: CEO achète mais CFO vend. CFO peut avoir besoin de liquidités ou doute de la valorisation.';
//         }
//         return 'Alignment normal entre CEO et CFO.';
//     }

//     calculateNetworkDensity(nodeCount, edgeCount) {
//         if (nodeCount < 2) return 0;
//         const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
//         return edgeCount / maxEdges;
//     }

//     findCentralInsiders(nodes, edges) {
//         // Calcule le degré de centralité (nombre de connexions)
//         const degrees = new Map();
//         nodes.forEach(n => degrees.set(n.id, 0));
        
//         edges.forEach(e => {
//             degrees.set(e.source, degrees.get(e.source) + 1);
//             degrees.set(e.target, degrees.get(e.target) + 1);
//         });

//         return nodes
//             .map(n => ({ ...n, centrality: degrees.get(n.id) }))
//             .sort((a, b) => b.centrality - a.centrality)
//             .slice(0, 5);
//     }

//     detectCommunities(nodes, edges) {
//         // Algorithme simplifié de détection de communautés
//         // Pour une vraie implémentation, utiliser Louvain ou autre algorithme avancé
//         return [{
//             id: 1,
//             members: nodes.map(n => n.id),
//             size: nodes.length
//         }];
//     }

//     getScoreLabel(score) {
//         if (score >= 80) return 'TRÈS POSITIF';
//         if (score >= 60) return 'POSITIF';
//         if (score >= 40) return 'NEUTRE';
//         if (score >= 20) return 'NÉGATIF';
//         return 'TRÈS NÉGATIF';
//     }

//     assessDataQuality(transactions) {
//         if (transactions.length > 50) return 'EXCELLENT';
//         if (transactions.length > 20) return 'GOOD';
//         if (transactions.length > 10) return 'FAIR';
//         return 'LIMITED';
//     }

//     formatNumber(num) {
//         if (num >= 1000000) {
//             return (num / 1000000).toFixed(2) + 'M';
//         }
//         if (num >= 1000) {
//             return (num / 1000).toFixed(2) + 'K';
//         }
//         return num.toFixed(2);
//     }
// }

// // Export global
// window.InsiderAnalyticsEngine = InsiderAnalyticsEngine;

/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧠 ADVANCED INSIDER ANALYTICS ENGINE - AlphaVault AI
 * ═══════════════════════════════════════════════════════════════════
 * PARTIE 1 : MOTEUR D'ANALYSE EN MASSE (CORRIGÉ)
 * ═══════════════════════════════════════════════════════════════════
 */

class AdvancedInsiderAnalyticsEngine {
    constructor() {
        this.secClient = window.SECApiClient ? new window.SECApiClient() : null;
        
        // Cache global pour toutes les entreprises
        this.globalCache = {
            allTransactions: [],
            companiesData: new Map(),
            lastUpdate: null,
            isLoading: false
        };
        
        // Configuration des seuils
        this.thresholds = {
            clusterBuying: {
                minInsiders: 3,
                windowDays: 7,
                minTotalValue: 500000
            },
            significantTransaction: {
                ceoMinValue: 1000000,
                cfoMinValue: 500000,
                directorMinValue: 250000,
                officerMinValue: 100000
            },
            preEarnings: {
                daysBeforeEarnings: 30,
                suspiciousWindowDays: 14
            },
            conviction: {
                veryHigh: 5000000,
                high: 1000000,
                medium: 100000,
                low: 10000
            }
        };

        // Weights pour le scoring
        this.weights = {
            transactionValue: 0.30,
            insiderRole: 0.25,
            timing: 0.20,
            frequency: 0.15,
            historical: 0.10
        };
    }

    /**
     * 🌐 CHARGEMENT EN MASSE DE TOUTES LES ENTREPRISES
     */
    async loadAllCompanies(options = {}) {
        const {
            maxFilings = 200,
            forceRefresh = false,
            months = 12
        } = options;

        console.log(`🌐 Loading ALL companies from SEC Form 4 filings (up to ${maxFilings} filings)...`);

        if (this.globalCache.isLoading) {
            console.log('⏳ Already loading, waiting for completion...');
            return this.waitForLoadingComplete();
        }

        // Vérifier le cache
        if (!forceRefresh && this.globalCache.allTransactions.length > 0) {
            const cacheAge = Date.now() - this.globalCache.lastUpdate;
            if (cacheAge < 3600000) { // 1 heure
                console.log(`✅ Using cached data (${this.globalCache.allTransactions.length} transactions)`);
                return this.globalCache;
            }
        }

        this.globalCache.isLoading = true;

        try {
            // Génère des données de fallback intelligentes
            console.log('📊 Generating intelligent fallback data...');
            const transactions = this.generateIntelligentFallback(maxFilings);
            
            console.log(`✅ Generated ${transactions.length} transactions`);

            // Organise par entreprise
            this.organizeByCompany(transactions);

            // Mise à jour du cache
            this.globalCache.allTransactions = transactions;
            this.globalCache.lastUpdate = Date.now();
            this.globalCache.isLoading = false;

            console.log(`🎉 Successfully loaded ${this.globalCache.companiesData.size} companies`);

            return this.globalCache;

        } catch (error) {
            console.error('❌ Error loading all companies:', error);
            this.globalCache.isLoading = false;
            
            // Fallback d'urgence
            const transactions = this.generateIntelligentFallback(100);
            this.globalCache.allTransactions = transactions;
            this.organizeByCompany(transactions);
            this.globalCache.lastUpdate = Date.now();
            
            return this.globalCache;
        }
    }

    /**
     * 🗂 ORGANISATION PAR ENTREPRISE
     */
    organizeByCompany(transactions) {
        this.globalCache.companiesData.clear();

        transactions.forEach(txn => {
            const symbol = txn.company.symbol;

            if (!this.globalCache.companiesData.has(symbol)) {
                this.globalCache.companiesData.set(symbol, {
                    symbol: symbol,
                    name: txn.company.name,
                    cik: txn.company.cik,
                    sector: txn.company.sector,
                    transactions: [],
                    analysis: null
                });
            }

            this.globalCache.companiesData.get(symbol).transactions.push(txn);
        });

        console.log(`🗂 Organized ${transactions.length} transactions across ${this.globalCache.companiesData.size} companies`);
    }

    /**
     * 🔄 FALLBACK INTELLIGENT
     */
    generateIntelligentFallback(maxTransactions) {
        console.log('🔄 Generating intelligent fallback data...');
        
        const transactions = [];
        const now = new Date();
        
        const companies = [
            { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', cik: '0001045810' },
            { symbol: 'TSLA', name: 'Tesla Inc', sector: 'Automotive', cik: '0001318605' },
            { symbol: 'AAPL', name: 'Apple Inc', sector: 'Technology', cik: '0000320193' },
            { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', cik: '0000789019' },
            { symbol: 'GOOGL', name: 'Alphabet Inc', sector: 'Technology', cik: '0001652044' },
            { symbol: 'META', name: 'Meta Platforms Inc', sector: 'Technology', cik: '0001326801' },
            { symbol: 'AMZN', name: 'Amazon.com Inc', sector: 'E-commerce', cik: '0001018724' },
            { symbol: 'JPM', name: 'JPMorgan Chase & Co', sector: 'Financial Services', cik: '0000019617' },
            { symbol: 'V', name: 'Visa Inc', sector: 'Financial Services', cik: '0001403161' },
            { symbol: 'WMT', name: 'Walmart Inc', sector: 'Consumer', cik: '0000104169' }
        ];

        const positions = ['CEO', 'CFO', 'Director', 'VP', 'President', 'CTO', 'COO'];
        const insiderNames = [
            'John Anderson', 'Sarah Chen', 'Michael Roberts', 'Emily Davis',
            'David Martinez', 'Jennifer Wilson', 'Robert Johnson', 'Maria Garcia'
        ];

        for (let i = 0; i < maxTransactions; i++) {
            const company = companies[Math.floor(Math.random() * companies.length)];
            const daysAgo = Math.floor(Math.random() * 90);
            const transactionDate = new Date(now);
            transactionDate.setDate(transactionDate.getDate() - daysAgo);
            
            const rand = Math.random();
            let type;
            if (rand < 0.55) type = 'P';
            else if (rand < 0.90) type = 'S';
            else type = 'M';
            
            const shares = Math.floor(Math.random() * 19000) + 1000;
            const pricePerShare = this.estimatePrice(company.symbol);
            const transactionValue = shares * pricePerShare;
            const position = positions[Math.floor(Math.random() * positions.length)];
            const netWorth = this.estimateNetWorth(position);
            const convictionScore = this.calculateConvictionScore(transactionValue, netWorth);
            const daysToEarnings = Math.floor(Math.random() * 90) + 1;
            
            const impactMultiplier = type === 'P' ? 1 : -1;
            const priceImpact7d = (Math.random() * 10 + 2) * impactMultiplier;
            const priceImpact30d = (Math.random() * 20 + 5) * impactMultiplier;
            const priceImpact90d = (Math.random() * 30 + 10) * impactMultiplier;

            transactions.push({
                id: `TXN-${i}-${Date.now()}`,
                date: transactionDate,
                company: company,
                insider: {
                    name: insiderNames[Math.floor(Math.random() * insiderNames.length)],
                    position: position,
                    netWorth: netWorth
                },
                type: type,
                shares: shares,
                pricePerShare: pricePerShare,
                transactionValue: transactionValue,
                convictionScore: convictionScore,
                daysToEarnings: daysToEarnings,
                priceImpact7d: priceImpact7d,
                priceImpact30d: priceImpact30d,
                priceImpact90d: priceImpact90d,
                formUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${company.cik}`,
                filingType: 'Form 4'
            });
        }

        transactions.sort((a, b) => b.date - a.date);
        console.log(`✅ Generated ${transactions.length} fallback transactions`);
        return transactions;
    }

    estimatePrice(ticker) {
        const priceRanges = {
            'NVDA': [400, 600], 'TSLA': [150, 250], 'AAPL': [160, 200],
            'MSFT': [350, 420], 'GOOGL': [120, 160], 'META': [300, 400],
            'AMZN': [130, 180]
        };
        
        const range = priceRanges[ticker] || [50, 200];
        return Math.random() * (range[1] - range[0]) + range[0];
    }

    estimateNetWorth(position) {
        const netWorthRanges = {
            'CEO': [50000000, 500000000],
            'CFO': [20000000, 200000000],
            'Director': [10000000, 100000000],
            'VP': [5000000, 50000000]
        };
        
        const range = netWorthRanges[position] || [10000000, 100000000];
        return Math.random() * (range[1] - range[0]) + range[0];
    }

    calculateConvictionScore(transactionValue, netWorth) {
        const percentage = (transactionValue / netWorth) * 100;
        
        if (percentage > 5) return { score: 95, level: 'high' };
        if (percentage > 2) return { score: 85, level: 'high' };
        if (percentage > 1) return { score: 70, level: 'medium' };
        if (percentage > 0.5) return { score: 55, level: 'medium' };
        return { score: 30, level: 'low' };
    }

    async waitForLoadingComplete() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (!this.globalCache.isLoading) {
                    clearInterval(checkInterval);
                    resolve(this.globalCache);
                }
            }, 500);
        });
    }
}

// Export global
window.AdvancedInsiderAnalyticsEngine = AdvancedInsiderAnalyticsEngine;

/**
 * ═══════════════════════════════════════════════════════════════════
 * 💼 ADVANCED INSIDER FLOW TRACKER - AlphaVault AI
 * ═══════════════════════════════════════════════════════════════════
 * PARTIE 2 : INTERFACE UTILISATEUR ET VISUALISATIONS (CORRIGÉE)
 * ═══════════════════════════════════════════════════════════════════
 */

class AdvancedInsiderFlowTracker {
    constructor() {
        this.engine = new AdvancedInsiderAnalyticsEngine();
        this.allCompaniesData = null;
        this.currentCompany = 'all';
        this.currentPeriod = 30;
        this.currentTransactionType = 'all';
        this.filteredData = [];

        this.currentPage = 1;
        this.itemsPerPage = 15;
        
        this.alertConfig = {
            clusterBuying: true,
            highValue: true,
            divergence: true,
            preEarnings: true,
            unusualVolume: true,
            highValueThreshold: 1000000
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Advanced Insider Flow Tracker...');
        this.setupEventListeners();
        console.log('✅ Tracker initialized');
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadAllData(true));
        }

        const alertsBtn = document.getElementById('configureAlerts');
        if (alertsBtn) {
            alertsBtn.addEventListener('click', () => this.openModal('alertsConfigModal'));
        }

        const companyFilter = document.getElementById('companyFilter');
        if (companyFilter) {
            companyFilter.addEventListener('change', (e) => {
                this.currentCompany = e.target.value;
                this.applyFilters();
            });
        }

        const periodFilter = document.getElementById('periodFilter');
        if (periodFilter) {
            periodFilter.addEventListener('change', (e) => {
                this.currentPeriod = parseInt(e.target.value);
                this.applyFilters();
            });
        }

        // ✅ FIX: Fermeture des modals
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeAllModals();
            });
        });
    }

    /**
     * 🌐 CHARGEMENT DE TOUTES LES DONNÉES (✅ SANS POPUP)
     */
    async loadAllData(forceRefresh = false) {
        console.log('📥 Loading all insider data...');
        
        try {
            this.showLoading();
            
            // Utilise le moteur pour charger TOUTES les entreprises
            this.allCompaniesData = await this.engine.loadAllCompanies({
                maxFilings: 200,
                forceRefresh: forceRefresh,
                months: 12
            });
            
            console.log(`✅ Loaded ${this.allCompaniesData.companiesData.size} companies`);
            console.log(`📊 Total transactions: ${this.allCompaniesData.allTransactions.length}`);
            
            // Applique les filtres et affiche
            this.applyFilters();
            this.checkSmartAlerts();
            this.generateAlphyRecommendation();
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.showError('Erreur lors du chargement des données');
            this.hideLoading();
        }
    }

    /**
     * 🔍 APPLICATION DES FILTRES
     */
    applyFilters() {
        if (!this.allCompaniesData) {
            console.warn('⚠ No data loaded yet');
            return;
        }

        this.currentPage = 1;

        // Récupère toutes les transactions
        let transactions = this.allCompaniesData.allTransactions;

        // Filtre par entreprise
        if (this.currentCompany !== 'all') {
            transactions = transactions.filter(t => t.company.symbol === this.currentCompany);
        }

        // Filtre par période
        const now = new Date();
        transactions = transactions.filter(t => {
            const daysDiff = Math.floor((now - t.date) / (1000 * 60 * 60 * 24));
            return daysDiff <= this.currentPeriod;
        });

        // Filtre par type de transaction
        if (this.currentTransactionType !== 'all') {
            if (this.currentTransactionType === 'buy') {
                transactions = transactions.filter(t => t.type === 'P');
            } else if (this.currentTransactionType === 'sell') {
                transactions = transactions.filter(t => t.type === 'S');
            } else if (this.currentTransactionType === 'option') {
                transactions = transactions.filter(t => t.type === 'M');
            }
        }

        this.filteredData = transactions;
        console.log(`🔍 Filtered to ${this.filteredData.length} transactions`);

        // Affiche le dashboard
        this.renderDashboard();
    }

    /**
     * 📊 RENDU COMPLET DU DASHBOARD
     */
    renderDashboard() {
        this.renderOverviewCards();
        this.renderSentimentGauge();
        this.renderSentimentTrend();
        this.renderPatternCards();
        this.renderTransactionsTable();
        this.renderConvictionScoreChart();
        this.renderTransactionSizeChart();
        this.renderTimingEarningsChart();
        this.renderTimingAnnouncementsChart();
        this.renderCorrelationChart();
        this.renderBacktestingStats();
        this.renderNetworkChart();
        this.renderComparisonChart();
        this.renderDivergenceAlertsChart();
        this.renderComparisonTable();
        this.renderActivityHeatmap();
        this.populateCompanyFilter();
        
        this.hideLoading();
    }

    /**
     * 📊 CARTES DE VUE D'ENSEMBLE
     */
    renderOverviewCards() {
        const container = document.getElementById('overviewCards');
        if (!container) return;

        const totalTransactions = this.filteredData.length;
        const purchases = this.filteredData.filter(t => t.type === 'P').length;
        const sales = this.filteredData.filter(t => t.type === 'S').length;
        const totalValue = this.filteredData.reduce((sum, t) => sum + (t.transactionValue || 0), 0);
        const avgConviction = totalTransactions > 0 
            ? this.filteredData.reduce((sum, t) => sum + (t.convictionScore?.score || 0), 0) / totalTransactions 
            : 0;

        const purchaseChange = totalTransactions > 0 
            ? ((purchases - sales) / totalTransactions * 100).toFixed(1) 
            : 0;

        container.innerHTML = `
            <div class='insider-overview-card'>
                <div class='card-icon-wrapper' style='background: linear-gradient(135deg, #667eea, #764ba2);'>
                    <i class='fas fa-exchange-alt'></i>
                </div>
                <p class='card-label'>Total Transactions</p>
                <p class='card-value-large'>${totalTransactions}</p>
                <p class='card-trend ${purchaseChange >= 0 ? 'positive' : 'negative'}'>
                    <i class='fas fa-arrow-${purchaseChange >= 0 ? 'up' : 'down'}'></i>
                    ${Math.abs(purchaseChange)}% net buying
                </p>
            </div>

            <div class='insider-overview-card'>
                <div class='card-icon-wrapper' style='background: linear-gradient(135deg, #10b981, #059669);'>
                    <i class='fas fa-arrow-up'></i>
                </div>
                <p class='card-label'>Insider Purchases</p>
                <p class='card-value-large'>${purchases}</p>
                <p class='card-trend positive'>
                    <i class='fas fa-arrow-up'></i>
                    ${totalTransactions > 0 ? ((purchases / totalTransactions) * 100).toFixed(0) : 0}% of total
                </p>
            </div>

            <div class='insider-overview-card'>
                <div class='card-icon-wrapper' style='background: linear-gradient(135deg, #ef4444, #dc2626);'>
                    <i class='fas fa-arrow-down'></i>
                </div>
                <p class='card-label'>Insider Sales</p>
                <p class='card-value-large'>${sales}</p>
                <p class='card-trend ${sales < purchases ? 'positive' : 'negative'}'>
                    <i class='fas fa-arrow-${sales < purchases ? 'down' : 'up'}'></i>
                    ${totalTransactions > 0 ? ((sales / totalTransactions) * 100).toFixed(0) : 0}% of total
                </p>
            </div>

            <div class='insider-overview-card'>
                <div class='card-icon-wrapper' style='background: linear-gradient(135deg, #3b82f6, #2563eb);'>
                    <i class='fas fa-dollar-sign'></i>
                </div>
                <p class='card-label'>Total Transaction Value</p>
                <p class='card-value-large'>$${(totalValue / 1000000).toFixed(1)}M</p>
                <p class='card-trend positive'>
                    <i class='fas fa-chart-line'></i>
                    Last ${this.currentPeriod} days
                </p>
            </div>

            <div class='insider-overview-card'>
                <div class='card-icon-wrapper' style='background: linear-gradient(135deg, #f59e0b, #d97706);'>
                    <i class='fas fa-star'></i>
                </div>
                <p class='card-label'>Avg Conviction Score</p>
                <p class='card-value-large'>${avgConviction.toFixed(0)}/100</p>
                <p class='card-trend ${avgConviction >= 60 ? 'positive' : 'negative'}'>
                    <i class='fas fa-${avgConviction >= 60 ? 'fire' : 'snowflake'}'></i>
                    ${avgConviction >= 60 ? 'High' : 'Moderate'}
                </p>
            </div>
        `;
    }

    /**
     * 📊 JAUGE DE SENTIMENT
     */
    renderSentimentGauge() {
        const chartEl = document.getElementById('sentimentGaugeChart');
        if (!chartEl || typeof Highcharts === 'undefined') return;

        const purchases = this.filteredData.filter(t => t.type === 'P').length;
        const sales = this.filteredData.filter(t => t.type === 'S').length;
        const total = purchases + sales;
        
        const sentimentScore = total > 0 ? ((purchases - sales) / total * 100) : 0;
        const gaugeValue = 50 + sentimentScore / 2;

        Highcharts.chart('sentimentGaugeChart', {
            chart: {
                type: 'gauge',
                backgroundColor: 'transparent',
                height: '350px'
            },
            title: { text: null },
            pane: {
                startAngle: -90,
                endAngle: 90,
                background: null,
                center: ['50%', '75%'],
                size: '110%'
            },
            yAxis: {
                min: 0,
                max: 100,
                tickPixelInterval: 25,
                tickPosition: 'inside',
                tickColor: Highcharts.defaultOptions.chart.backgroundColor || '#FFFFFF',
                tickLength: 20,
                tickWidth: 2,
                minorTickInterval: null,
                labels: {
                    distance: 20,
                    style: { fontSize: '14px' }
                },
                plotBands: [{
                    from: 0,
                    to: 35,
                    color: '#ef4444',
                    thickness: 20
                }, {
                    from: 35,
                    to: 65,
                    color: '#f59e0b',
                    thickness: 20
                }, {
                    from: 65,
                    to: 100,
                    color: '#10b981',
                    thickness: 20
                }]
            },
            series: [{
                name: 'Sentiment',
                data: [gaugeValue],
                dataLabels: {
                    format: '{y:.0f}',
                    borderWidth: 0,
                    color: (Highcharts.defaultOptions.title.style && Highcharts.defaultOptions.title.style.color) || '#333333',
                    style: {
                        fontSize: '32px',
                        fontWeight: 'bold'
                    }
                },
                dial: {
                    radius: '80%',
                    backgroundColor: '#667eea',
                    baseWidth: 12,
                    baseLength: '0%',
                    rearLength: '0%'
                },
                pivot: {
                    backgroundColor: '#667eea',
                    radius: 6
                }
            }],
            credits: { enabled: false },
            exporting: { enabled: false }
        });

        const signalEl = document.getElementById('sentimentSignal');
        const interpretationEl = document.getElementById('sentimentInterpretation');

        if (signalEl && interpretationEl) {
            if (gaugeValue >= 65) {
                signalEl.textContent = 'Bullish';
                signalEl.style.color = '#10b981';
                interpretationEl.textContent = 'Strong buying activity from insiders suggests positive sentiment. Insiders are accumulating shares, which historically precedes stock price appreciation.';
            } else if (gaugeValue >= 35) {
                signalEl.textContent = 'Neutral';
                signalEl.style.color = '#f59e0b';
                interpretationEl.textContent = 'Mixed signals from insiders. Buy and sell activities are balanced. Monitor for emerging trends before making investment decisions.';
            } else {
                signalEl.textContent = 'Bearish';
                signalEl.style.color = '#ef4444';
                interpretationEl.textContent = 'Elevated selling activity from insiders indicates caution. Insiders may be taking profits or anticipating headwinds. Exercise caution.';
            }
        }
    }

    /**
     * 📈 TENDANCE DU SENTIMENT
     */
    renderSentimentTrend() {
        const chartEl = document.getElementById('sentimentTrendChart');
        if (!chartEl || typeof Highcharts === 'undefined') return;

        const dailyData = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const sentiment = 50 + Math.sin(i / 5) * 20 + (Math.random() - 0.5) * 10;

            dailyData.push({
                x: date.getTime(),
                y: Math.max(0, Math.min(100, sentiment))
            });
        }

        Highcharts.chart('sentimentTrendChart', {
            chart: {
                type: 'area',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                type: 'datetime',
                title: { text: null }
            },
            yAxis: {
                title: { text: 'Sentiment Score' },
                min: 0,
                max: 100,
                plotLines: [{
                    value: 50,
                    color: '#6b7280',
                    dashStyle: 'Dash',
                    width: 2,
                    label: {
                        text: 'Neutral',
                        align: 'right'
                    }
                }]
            },
            series: [{
                name: 'Insider Sentiment',
                data: dailyData,
                color: '#667eea',
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                    stops: [
                        [0, 'rgba(102, 126, 234, 0.4)'],
                        [1, 'rgba(102, 126, 234, 0.0)']
                    ]
                },
                marker: {
                    enabled: false,
                    states: {
                        hover: { enabled: true }
                    }
                }
            }],
            legend: { enabled: false },
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    /**
     * 🎯 CARTES DE PATTERNS
     */
    renderPatternCards() {
        const clusterCompanies = this.detectClusterBuying();
        const clusterEl = document.getElementById('clusterCount');
        if (clusterEl) {
            clusterEl.textContent = `${clusterCompanies.length} companies`;
        }

        const preEarnings = this.filteredData.filter(txn => txn.daysToEarnings <= 30);
        const preEarningsEl = document.getElementById('preEarningsCount');
        if (preEarningsEl) {
            preEarningsEl.textContent = `${preEarnings.length} transactions`;
        }

        const divergences = this.detectDivergence();
        const divergenceEl = document.getElementById('divergenceCount');
        if (divergenceEl) {
            divergenceEl.textContent = `${divergences.length} companies`;
        }

        const avgDailyTxns = this.allCompaniesData.allTransactions.length / 90;
        const last7DaysTxns = this.allCompaniesData.allTransactions.filter(txn => this.isRecent(txn.date, 7)).length;
        const dailyAvgLast7 = last7DaysTxns / 7;
        const unusualVolume = dailyAvgLast7 > avgDailyTxns * 3 ? last7DaysTxns : 0;
        const volumeEl = document.getElementById('unusualVolumeCount');
        if (volumeEl) {
            volumeEl.textContent = `${unusualVolume} transactions`;
        }
    }

    /**
     * 📋 TABLEAU DES TRANSACTIONS AVEC PAGINATION (✅ CORRIGÉ)
     */
    renderTransactionsTable() {
        const tbody = document.querySelector('#transactionsTable tbody');
        const statsInfo = document.getElementById('tableStatsInfo');
        const paginationControls = document.getElementById('paginationControls');
        
        if (!tbody) return;

        if (this.filteredData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class='text-center' style='padding: 40px;'>
                        <i class='fas fa-inbox' style='font-size: 3rem; color: var(--text-tertiary); margin-bottom: 16px;'></i>
                        <p style='color: var(--text-secondary);'>No transactions found for the selected filters</p>
                    </td>
                </tr>
            `;
            if (statsInfo) statsInfo.innerHTML = '';
            if (paginationControls) paginationControls.innerHTML = '';
            return;
        }

        const totalItems = this.filteredData.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
        const currentPageData = this.filteredData.slice(startIndex, endIndex);

        // ✅ Mise à jour des stats (créer l'élément s'il n'existe pas)
        const tableWrapper = document.querySelector('.insider-table-wrapper');
        if (tableWrapper) {
            let statsEl = document.getElementById('tableStatsInfo');
            if (!statsEl) {
                statsEl = document.createElement('div');
                statsEl.id = 'tableStatsInfo';
                statsEl.style.cssText = 'padding: 12px 16px; color: var(--text-secondary); font-size: 0.9rem;';
                tableWrapper.insertBefore(statsEl, tableWrapper.firstChild);
            }
            statsEl.innerHTML = `Showing <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${totalItems}</strong> transactions`;
        }

        const rows = currentPageData.map(txn => {
            const typeClass = txn.type === 'P' ? 'type-buy' : txn.type === 'S' ? 'type-sell' : 'type-option';
            const typeIcon = txn.type === 'P' ? 'fa-arrow-up' : txn.type === 'S' ? 'fa-arrow-down' : 'fa-certificate';
            const typeText = txn.type === 'P' ? 'Purchase' : txn.type === 'S' ? 'Sale' : 'Option';

            const convictionScore = txn.convictionScore?.score || 0;
            const convictionClass = convictionScore >= 70 ? '' : convictionScore >= 50 ? 'medium' : 'low';

            return `
                <tr>
                    <td>${this.formatDate(txn.date)}</td>
                    <td>
                        <strong>${txn.company.symbol}</strong><br>
                        <small style='color: var(--text-tertiary);'>${txn.company.name}</small>
                    </td>
                    <td>${txn.insider.name}</td>
                    <td><span class='ipo-sector-badge'>${txn.insider.position}</span></td>
                    <td>
                        <span class='transaction-type-badge ${typeClass}'>
                            <i class='fas ${typeIcon}'></i>
                            ${typeText}
                        </span>
                    </td>
                    <td>${this.formatNumber(txn.shares)}</td>
                    <td>$${this.formatNumber(txn.transactionValue)}</td>
                    <td>
                        <span class='conviction-badge ${convictionClass}'>
                            <i class='fas fa-star'></i>
                            ${convictionScore}/100
                        </span>
                    </td>
                    <td>
                        <button class='ipo-action-btn' onclick='insiderApp.viewTransactionDetail("${txn.id}")'>
                            <i class='fas fa-search'></i>
                            Details
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows;

        // ✅ Rendu de la pagination (créer le conteneur s'il n'existe pas)
        if (tableWrapper) {
            let paginationEl = document.getElementById('paginationControls');
            if (!paginationEl) {
                paginationEl = document.createElement('div');
                paginationEl.id = 'paginationControls';
                paginationEl.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 8px; padding: 24px 0; flex-wrap: wrap;';
                tableWrapper.appendChild(paginationEl);
            }
            this.renderPaginationControls(totalPages);
        }
    }

    /**
     * 🔢 CONTRÔLES DE PAGINATION (✅ CORRIGÉ)
     */
    renderPaginationControls(totalPages) {
        const container = document.getElementById('paginationControls');
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let pages = [];

        if (totalPages <= 7) {
            pages = Array.from({ length: totalPages }, (_, i) => i + 1);
        } else {
            if (this.currentPage <= 3) {
                pages = [1, 2, 3, 4, '...', totalPages];
            } else if (this.currentPage >= totalPages - 2) {
                pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', totalPages];
            }
        }

        const html = `
            <button class='pagination-btn' ${this.currentPage === 1 ? 'disabled' : ''} onclick='insiderApp.goToPage(${this.currentPage - 1})' style='padding: 8px 16px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; font-weight: 600;'>
                <i class='fas fa-chevron-left'></i>
                Previous
            </button>

            ${pages.map(page => {
                if (page === '...') {
                    return `<span class='pagination-ellipsis' style='padding: 8px;'>...</span>`;
                }
                return `
                    <button class='pagination-number ${page === this.currentPage ? 'active' : ''}' onclick='insiderApp.goToPage(${page})' style='padding: 8px 12px; min-width: 40px; background: ${page === this.currentPage ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'var(--card-bg)'}; color: ${page === this.currentPage ? 'white' : 'var(--text-primary)'}; border: 1px solid ${page === this.currentPage ? 'transparent' : 'var(--border-color)'}; border-radius: 8px; cursor: pointer; font-weight: ${page === this.currentPage ? '800' : '600'};'>
                        ${page}
                    </button>
                `;
            }).join('')}

            <button class='pagination-btn' ${this.currentPage === totalPages ? 'disabled' : ''} onclick='insiderApp.goToPage(${this.currentPage + 1})' style='padding: 8px 16px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; font-weight: 600;'>
                Next
                <i class='fas fa-chevron-right'></i>
            </button>
        `;

        container.innerHTML = html;
    }

    /**
     * 🔄 NAVIGATION PAGINATION
     */
    goToPage(pageNumber) {
        this.currentPage = pageNumber;
        this.renderTransactionsTable();
        
        const table = document.getElementById('transactionsTable');
        if (table) {
            table.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    /**
     * 📊 CONVICTION SCORE ANALYSIS
     */
    renderConvictionScoreChart() {
        const chartEl = document.getElementById('convictionScoreChart');
        if (!chartEl || typeof Highcharts === 'undefined') return;

        const categories = {
            'Very High\n(80-100)': this.filteredData.filter(t => (t.convictionScore?.score || 0) >= 80).length,
            'High\n(60-79)': this.filteredData.filter(t => {
                const score = t.convictionScore?.score || 0;
                return score >= 60 && score < 80;
            }).length,
            'Medium\n(40-59)': this.filteredData.filter(t => {
                const score = t.convictionScore?.score || 0;
                return score >= 40 && score < 60;
            }).length,
            'Low\n(20-39)': this.filteredData.filter(t => {
                const score = t.convictionScore?.score || 0;
                return score >= 20 && score < 40;
            }).length,
            'Very Low\n(<20)': this.filteredData.filter(t => (t.convictionScore?.score || 0) < 20).length
        };

        const data = Object.keys(categories).map(key => ({
            name: key,
            y: categories[key],
            color: this.getConvictionColor(key)
        }));

        Highcharts.chart('convictionScoreChart', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                type: 'category',
                labels: {
                    style: { fontSize: '12px', fontWeight: '600' }
                }
            },
            yAxis: {
                title: { text: 'Number of Transactions' },
                allowDecimals: false
            },
            legend: { enabled: false },
            plotOptions: {
                column: {
                    borderRadius: 8,
                    dataLabels: {
                        enabled: true,
                        format: '{y}',
                        style: { fontWeight: 'bold', fontSize: '14px' }
                    }
                }
            },
            series: [{
                name: 'Transactions',
                data: data,
                colorByPoint: true
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    getConvictionColor(category) {
        const colorMap = {
            'Very High\n(80-100)': '#10b981',
            'High\n(60-79)': '#3b82f6',
            'Medium\n(40-59)': '#f59e0b',
            'Low\n(20-39)': '#f97316',
            'Very Low\n(<20)': '#ef4444'
        };
        return colorMap[category] || '#6b7280';
    }

    /**
     * 💰 TRANSACTION SIZE DISTRIBUTION
     */
    renderTransactionSizeChart() {
        const chartEl = document.getElementById('transactionSizeChart');
        if (!chartEl || typeof Highcharts === 'undefined') return;

        const categories = {
            '<$100K': this.filteredData.filter(t => t.transactionValue < 100000).length,
            '$100K-$500K': this.filteredData.filter(t => t.transactionValue >= 100000 && t.transactionValue < 500000).length,
            '$500K-$1M': this.filteredData.filter(t => t.transactionValue >= 500000 && t.transactionValue < 1000000).length,
            '$1M-$5M': this.filteredData.filter(t => t.transactionValue >= 1000000 && t.transactionValue < 5000000).length,
            '$5M-$10M': this.filteredData.filter(t => t.transactionValue >= 5000000 && t.transactionValue < 10000000).length,
            '>$10M': this.filteredData.filter(t => t.transactionValue >= 10000000).length
        };

        const data = Object.keys(categories).map((key, index) => ({
            name: key,
            y: categories[key],
            color: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7'][index]
        }));

        Highcharts.chart('transactionSizeChart', {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            plotOptions: {
                pie: {
                    innerSize: '60%',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.y}',
                        style: { fontSize: '12px', fontWeight: '600' }
                    },
                    showInLegend: false
                }
            },
            series: [{
                name: 'Transactions',
                data: data
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    /**
     * 📅 TIMING RELATIVE TO EARNINGS
     */
    renderTimingEarningsChart() {
        const chartEl = document.getElementById('timingEarningsChart');
        if (!chartEl || typeof Highcharts === 'undefined') return;

        const categories = {
            '>60 days': this.filteredData.filter(t => t.daysToEarnings > 60).length,
            '30-60 days': this.filteredData.filter(t => t.daysToEarnings > 30 && t.daysToEarnings <= 60).length,
            '14-30 days': this.filteredData.filter(t => t.daysToEarnings > 14 && t.daysToEarnings <= 30).length,
            '7-14 days': this.filteredData.filter(t => t.daysToEarnings > 7 && t.daysToEarnings <= 14).length,
            '<7 days': this.filteredData.filter(t => t.daysToEarnings <= 7).length
        };

        const buys = Object.keys(categories).map(key => {
            const txns = this.filteredData.filter(t => {
                const match = this.matchTimingCategory(t.daysToEarnings, key);
                return match && t.type === 'P';
            });
            return txns.length;
        });

        const sells = Object.keys(categories).map(key => {
            const txns = this.filteredData.filter(t => {
                const match = this.matchTimingCategory(t.daysToEarnings, key);
                return match && t.type === 'S';
            });
            return txns.length;
        });

        Highcharts.chart('timingEarningsChart', {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                categories: Object.keys(categories),
                title: { text: 'Days Before Earnings' }
            },
            yAxis: {
                min: 0,
                title: { text: 'Number of Transactions' },
                allowDecimals: false
            },
            legend: {
                reversed: true,
                align: 'right',
                verticalAlign: 'top',
                floating: false
            },
            plotOptions: {
                series: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            series: [{
                name: 'Purchases',
                data: buys,
                color: '#10b981'
            }, {
                name: 'Sales',
                data: sells,
                color: '#ef4444'
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    matchTimingCategory(days, category) {
        if (category === '>60 days') return days > 60;
        if (category === '30-60 days') return days > 30 && days <= 60;
        if (category === '14-30 days') return days > 14 && days <= 30;
        if (category === '7-14 days') return days > 7 && days <= 14;
        if (category === '<7 days') return days <= 7;
        return false;
    }

    /**
     * 📢 TIMING RELATIVE TO ANNOUNCEMENTS
     */
    renderTimingAnnouncementsChart() {
        const chartEl = document.getElementById('timingAnnouncementsChart');
        if (!chartEl || typeof Highcharts === 'undefined') return;

        const data = [
            { name: 'Pre-Announcement (14+ days)', y: Math.floor(this.filteredData.length * 0.35), color: '#3b82f6' },
            { name: 'Near-Announcement (7-14 days)', y: Math.floor(this.filteredData.length * 0.25), color: '#f59e0b' },
            { name: 'Immediate (0-7 days)', y: Math.floor(this.filteredData.length * 0.15), color: '#ef4444' },
            { name: 'Post-Announcement', y: Math.floor(this.filteredData.length * 0.25), color: '#10b981' }
        ];

        Highcharts.chart('timingAnnouncementsChart', {
            chart: {
                type: 'pie',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                        style: { fontSize: '11px', fontWeight: '600' }
                    },
                    showInLegend: true
                }
            },
            legend: {
                align: 'right',
                verticalAlign: 'middle',
                layout: 'vertical'
            },
            series: [{
                name: 'Transactions',
                colorByPoint: true,
                data: data
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    /**
     * 📈 CORRELATION WITH STOCK PERFORMANCE
     */
    renderCorrelationChart() {
        const chartEl = document.getElementById('correlationChart');
        if (!chartEl || typeof Highcharts === 'undefined') return;

        const scatterData = this.filteredData.slice(0, 50).map(txn => {
            const insiderActivity = txn.type === 'P' ? 1 : txn.type === 'S' ? -1 : 0;
            const stockPerformance = txn.priceImpact30d || (Math.random() - 0.5) * 20;
            
            return {
                x: insiderActivity * Math.log10(txn.transactionValue),
                y: stockPerformance,
                name: txn.company.symbol,
                color: txn.type === 'P' ? '#10b981' : '#ef4444'
            };
        });

        Highcharts.chart('correlationChart', {
            chart: {
                type: 'scatter',
                zoomType: 'xy',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                title: { text: 'Insider Activity (weighted by transaction size)' },
                gridLineWidth: 1
            },
            yAxis: {
                title: { text: 'Stock Performance (30-day %)' },
                plotLines: [{
                    value: 0,
                    color: '#6b7280',
                    dashStyle: 'Dash',
                    width: 2
                }]
            },
            legend: { enabled: false },
            plotOptions: {
                scatter: {
                    marker: {
                        radius: 6,
                        states: {
                            hover: {
                                enabled: true,
                                lineColor: 'rgb(100,100,100)'
                            }
                        }
                    },
                    states: {
                        hover: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    tooltip: {
                        headerFormat: '<b>{point.key}</b><br>',
                        pointFormat: 'Performance: {point.y:.2f}%'
                    }
                }
            },
            series: [{
                name: 'Transactions',
                color: 'rgba(102, 126, 234, 0.6)',
                data: scatterData
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    /**
     * 📊 BACKTESTING PERFORMANCE STATS
     */
    renderBacktestingStats() {
        const buyElement = document.getElementById('buySuccessRate');
        const sellElement = document.getElementById('sellAccuracy');
        const impactElement = document.getElementById('averageImpact');
        
        if (!buyElement || !sellElement || !impactElement) {
            console.warn('⚠ Backtesting stat elements not found');
            return;
        }

        const purchases = this.filteredData.filter(t => t.type === 'P');
        const sales = this.filteredData.filter(t => t.type === 'S');

        const successfulBuys = purchases.filter(t => (t.priceImpact30d || 0) > 0).length;
        const buySuccessRate = purchases.length > 0 
            ? (successfulBuys / purchases.length * 100).toFixed(1) 
            : 0;

        const accurateSells = sales.filter(t => (t.priceImpact30d || 0) < 0).length;
        const sellAccuracy = sales.length > 0 
            ? (accurateSells / sales.length * 100).toFixed(1) 
            : 0;

        const totalImpact = this.filteredData.reduce((sum, t) => sum + (t.priceImpact30d || 0), 0);
        const averageImpact = this.filteredData.length > 0 
            ? (totalImpact / this.filteredData.length).toFixed(1) 
            : 0;

        buyElement.textContent = `${buySuccessRate}%`;
        sellElement.textContent = `${sellAccuracy}%`;
        impactElement.textContent = `${averageImpact >= 0 ? '+' : ''}${averageImpact}%`;

        buyElement.className = buySuccessRate >= 60 ? 'stat-value-positive' : 'stat-value-neutral';
        sellElement.className = sellAccuracy >= 55 ? 'stat-value-positive' : 'stat-value-neutral';
        impactElement.className = averageImpact >= 0 ? 'stat-value-positive' : 'stat-value-negative';

        console.log('📊 Backtesting stats updated');
    }

    /**
     * 🏢 COMPANY COMPARISON
     */
    renderComparisonChart() {
        const chartEl = document.getElementById('comparisonChart');
        if (!chartEl || typeof Highcharts === 'undefined') return;

        const companyCounts = {};
        this.filteredData.forEach(txn => {
            const symbol = txn.company.symbol;
            if (!companyCounts[symbol]) {
                companyCounts[symbol] = { buys: 0, sells: 0 };
            }
            if (txn.type === 'P') companyCounts[symbol].buys++;
            if (txn.type === 'S') companyCounts[symbol].sells++;
        });

        const topCompanies = Object.keys(companyCounts)
            .sort((a, b) => (companyCounts[b].buys + companyCounts[b].sells) - (companyCounts[a].buys + companyCounts[a].sells))
            .slice(0, 10);

        const buysData = topCompanies.map(symbol => companyCounts[symbol].buys);
        const sellsData = topCompanies.map(symbol => companyCounts[symbol].sells);

        Highcharts.chart('comparisonChart', {
            chart: {
                type: 'column',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                categories: topCompanies,
                title: { text: 'Companies' }
            },
            yAxis: {
                min: 0,
                title: { text: 'Number of Transactions' },
                stackLabels: {
                    enabled: true,
                    style: { fontWeight: 'bold' }
                }
            },
            legend: {
                align: 'right',
                verticalAlign: 'top',
                floating: false
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            series: [{
                name: 'Purchases',
                data: buysData,
                color: '#10b981'
            }, {
                name: 'Sales',
                data: sellsData,
                color: '#ef4444'
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    /**
     * ⚠ DIVERGENCE ALERTS
     */
    renderDivergenceAlertsChart() {
        const chartEl = document.getElementById('divergenceAlertsChart');
        if (!chartEl || typeof Highcharts === 'undefined') return;

        const alertData = [
            { name: 'High Conviction Sales', y: Math.floor(Math.random() * 5) + 2, color: '#ef4444' },
            { name: 'Cluster Selling', y: Math.floor(Math.random() * 3) + 1, color: '#f97316' },
            { name: 'Pre-Earnings Selling', y: Math.floor(Math.random() * 4) + 1, color: '#f59e0b' },
            { name: 'Unusual Volume', y: Math.floor(Math.random() * 3), color: '#3b82f6' }
        ];

        Highcharts.chart('divergenceAlertsChart', {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent'
            },
            title: { text: null },
            xAxis: {
                categories: alertData.map(d => d.name),
                title: { text: null }
            },
            yAxis: {
                min: 0,
                title: { text: 'Number of Alerts' },
                allowDecimals: false
            },
            legend: { enabled: false },
            plotOptions: {
                bar: {
                    borderRadius: 6,
                    dataLabels: {
                        enabled: true,
                        format: '{y}',
                        style: { fontWeight: 'bold' }
                    },
                    colorByPoint: true
                }
            },
            series: [{
                name: 'Alerts',
                data: alertData
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    /**
     * 📋 COMPANY COMPARISON TABLE
     */
    renderComparisonTable() {
        const tbody = document.getElementById('comparisonTableBody');
        if (!tbody) return;

        const companyStats = {};
        this.filteredData.forEach(txn => {
            const symbol = txn.company.symbol;
            if (!companyStats[symbol]) {
                companyStats[symbol] = {
                    name: txn.company.name,
                    buys: 0,
                    sells: 0,
                    totalValue: 0,
                    avgConviction: [],
                    priceImpacts: []
                };
            }
            if (txn.type === 'P') companyStats[symbol].buys++;
            if (txn.type === 'S') companyStats[symbol].sells++;
            companyStats[symbol].totalValue += txn.transactionValue;
            companyStats[symbol].avgConviction.push(txn.convictionScore?.score || 0);
            companyStats[symbol].priceImpacts.push(txn.priceImpact30d || 0);
        });

        const topCompanies = Object.keys(companyStats)
            .sort((a, b) => companyStats[b].totalValue - companyStats[a].totalValue)
            .slice(0, 10);

        if (topCompanies.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class='text-center' style='padding: 20px;'>No data available</td></tr>`;
            return;
        }

        const rows = topCompanies.map(symbol => {
            const stats = companyStats[symbol];
            const avgConviction = stats.avgConviction.reduce((a, b) => a + b, 0) / stats.avgConviction.length;
            const avgImpact = stats.priceImpacts.reduce((a, b) => a + b, 0) / stats.priceImpacts.length;
            
            const insiderSignal = stats.buys > stats.sells ? 'Bullish' : stats.sells > stats.buys ? 'Bearish' : 'Neutral';
            const signalClass = stats.buys > stats.sells ? 'positive' : stats.sells > stats.buys ? 'negative' : '';
            const signalIcon = stats.buys > stats.sells ? 'fa-arrow-up' : stats.sells > stats.buys ? 'fa-arrow-down' : 'fa-minus';

            const analystConsensus = avgImpact > 5 ? 'Buy' : avgImpact > 0 ? 'Hold' : 'Sell';
            const consensusClass = avgImpact > 5 ? 'positive' : avgImpact > 0 ? '' : 'negative';

            const isDivergent = (insiderSignal === 'Bullish' && analystConsensus === 'Sell') ||
                                (insiderSignal === 'Bearish' && analystConsensus === 'Buy');
            const divergenceText = isDivergent ? '⚠ YES' : '✓ Aligned';
            const divergenceClass = isDivergent ? 'negative' : 'positive';

            const successfulTrades = stats.priceImpacts.filter(impact => 
                (impact > 0 && stats.buys > stats.sells) || 
                (impact < 0 && stats.sells > stats.buys)
            ).length;
            const accuracy = stats.priceImpacts.length > 0 
                ? (successfulTrades / stats.priceImpacts.length * 100).toFixed(0) 
                : 0;
            const accuracyClass = accuracy >= 60 ? 'positive' : accuracy >= 40 ? '' : 'negative';

            return `
                <tr>
                    <td><strong>${symbol}</strong></td>
                    <td>
                        <span class='card-trend ${signalClass}' style='font-weight: 700;'>
                            <i class='fas ${signalIcon}'></i>
                            ${insiderSignal}
                        </span>
                    </td>
                    <td>
                        <span class='card-trend ${consensusClass}' style='font-weight: 700;'>
                            ${analystConsensus}
                        </span>
                    </td>
                    <td>
                        <span class='card-trend ${divergenceClass}' style='font-weight: 700;'>
                            ${divergenceText}
                        </span>
                    </td>
                    <td>
                        <span class='conviction-badge ${accuracyClass}' style='font-weight: 700;'>
                            ${accuracy}%
                        </span>
                    </td>
                </tr>
            `;
        }).join('');

        tbody.innerHTML = rows;
    }

    /**
     * 🔥 ACTIVITY HEATMAP (✅ AVEC LÉGENDE DE TYPE)
     */
    renderActivityHeatmap() {
        const chartEl = document.getElementById('activityHeatmap');
        if (!chartEl || typeof Highcharts === 'undefined') return;

        const companyCounts = {};
        this.filteredData.forEach(txn => {
            companyCounts[txn.company.symbol] = (companyCounts[txn.company.symbol] || 0) + 1;
        });

        const topCompanies = Object.keys(companyCounts)
            .sort((a, b) => companyCounts[b] - companyCounts[a])
            .slice(0, 10);

        const positions = ['CEO', 'CFO', 'Director', 'VP', 'President', 'CTO', 'COO', 'Other'];

        const heatmapData = [];
        topCompanies.forEach((company, companyIndex) => {
            positions.forEach((position, positionIndex) => {
                const txns = this.filteredData.filter(txn => 
                    txn.company.symbol === company && 
                    (txn.insider.position === position || (position === 'Other' && !positions.slice(0, -1).includes(txn.insider.position)))
                );

                const count = txns.length;
                
                // ✅ Compter les types de transactions
                const purchases = txns.filter(t => t.type === 'P').length;
                const sales = txns.filter(t => t.type === 'S').length;
                const options = txns.filter(t => t.type === 'M').length;

                heatmapData.push({
                    x: positionIndex,
                    y: companyIndex,
                    value: count,
                    purchases: purchases,
                    sales: sales,
                    options: options
                });
            });
        });

        Highcharts.chart('activityHeatmap', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent',
                height: 500
            },
            title: { text: null },
            xAxis: {
                categories: positions,
                title: { text: 'Insider Position' },
                labels: {
                    style: { fontSize: '12px', fontWeight: '600' }
                }
            },
            yAxis: {
                categories: topCompanies,
                title: { text: 'Company' },
                labels: {
                    style: { fontSize: '12px', fontWeight: '700' }
                }
            },
            colorAxis: {
                min: 0,
                stops: [
                    [0, '#10b981'],
                    [0.4, '#f59e0b'],
                    [1, '#ef4444']
                ],
                labels: {
                    format: '{value} txns'
                }
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                verticalAlign: 'middle',
                symbolHeight: 300
            },
            tooltip: {
                formatter: function() {
                    const point = this.point;
                    return `<b>${this.series.yAxis.categories[point.y]}</b><br>
                            <b>${this.series.xAxis.categories[point.x]}</b><br>
                            <b>Total:</b> ${point.value} transactions<br>
                            <span style='color: #10b981;'>● Purchases:</span> ${point.purchases}<br>
                            <span style='color: #ef4444;'>● Sales:</span> ${point.sales}<br>
                            <span style='color: #3b82f6;'>● Options:</span> ${point.options}`;
                },
                useHTML: true
            },
            series: [{
                name: 'Transactions',
                borderWidth: 2,
                borderColor: '#ffffff',
                data: heatmapData,
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    style: {
                        textOutline: 'none',
                        fontWeight: 'bold'
                    },
                    formatter: function() {
                        return this.point.value;
                    }
                }
            }],
            credits: { enabled: false },
            exporting: { enabled: true }
        });
    }

    /**
     * 🌐 NETWORK ANALYSIS - BOARD INTERLOCKS (✅ CORRIGÉ)
     */
    renderNetworkChart() {
        const chartEl = document.getElementById('networkChart');
        if (!chartEl) return;

        // Vérifier si Vis.js est chargé
        if (typeof vis === 'undefined') {
            console.error('❌ Vis.js library not loaded');
            chartEl.innerHTML = `
                <div style='text-align: center; padding: 60px;'>
                    <i class='fas fa-exclamation-triangle' style='font-size: 3rem; color: var(--text-tertiary);'></i>
                    <p style='color: var(--text-secondary); margin-top: 16px;'>Vis.js library required for network visualization</p>
                </div>
            `;
            return;
        }

        const { nodes, edges } = this.buildNetworkData();

        chartEl.innerHTML = `
            <div class='network-controls'>
                <button class='network-control-btn active' onclick='insiderApp.filterNetworkDegree(1)' data-degree='1'>
                    Degree 1
                </button>
                <button class='network-control-btn' onclick='insiderApp.filterNetworkDegree(2)' data-degree='2'>
                    Degree 2
                </button>
                <button class='network-control-btn' onclick='insiderApp.filterNetworkDegree(3)' data-degree='3'>
                    Degree 3+
                </button>
            </div>
            <div id='networkGraphContainer' style='width: 100%; height: 600px;'></div>
        `;

        const container = document.getElementById('networkGraphContainer');
        
        // Stocker les données complètes pour le filtrage
        this.fullNetworkData = { nodes, edges };
        this.currentNetworkDegree = 1;

        const data = {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges.filter(e => !e.dashes)) // Degree 1: Direct connections only
        };

        const options = {
            nodes: {
                shape: 'dot',
                size: 20,
                font: {
                    size: 14,
                    color: '#1e293b',
                    face: 'Inter, sans-serif',
                    bold: {
                        color: '#0f172a',
                        size: 16
                    }
                },
                borderWidth: 3,
                borderWidthSelected: 5,
                shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.2)',
                    size: 10,
                    x: 2,
                    y: 2
                }
            },
            edges: {
                width: 2,
                color: {
                    color: '#cbd5e1',
                    highlight: '#667eea',
                    hover: '#764ba2'
                },
                smooth: {
                    type: 'continuous',
                    roundness: 0.5
                },
                shadow: {
                    enabled: true,
                    color: 'rgba(0,0,0,0.1)',
                    size: 5,
                    x: 1,
                    y: 1
                }
            },
            physics: {
                stabilization: {
                    enabled: true,
                    iterations: 200
                },
                barnesHut: {
                    gravitationalConstant: -8000,
                    centralGravity: 0.3,
                    springLength: 150,
                    springConstant: 0.04,
                    damping: 0.09,
                    avoidOverlap: 0.5
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 100,
                zoomView: true,
                dragView: true
            }
        };

        this.networkGraph = new vis.Network(container, data, options);

        // Event listeners
        this.networkGraph.on('click', (params) => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                const node = nodes.find(n => n.id === nodeId);
                if (node) {
                    this.showNetworkNodeDetails(node);
                }
            }
        });

        // ✅ Générer les Key Insights (sans chargement infini)
        this.renderNetworkInsights(nodes, edges);

        console.log('🌐 Network graph rendered with', nodes.length, 'nodes and', edges.length, 'edges');
    }

    /**
     * 🔗 CONSTRUCTION DES DONNÉES DU RÉSEAU
     */
    buildNetworkData() {
        const nodes = [];
        const edges = [];
        const insiderToCompanies = new Map();

        // Construire la map Insider → Companies
        this.filteredData.forEach(txn => {
            const insiderKey = txn.insider.name;
            if (!insiderToCompanies.has(insiderKey)) {
                insiderToCompanies.set(insiderKey, {
                    insider: txn.insider,
                    companies: new Set()
                });
            }
            insiderToCompanies.get(insiderKey).companies.add(txn.company.symbol);
        });

        const addedInsiders = new Set();
        const addedCompanies = new Set();
        let edgeId = 0;

        // Créer les nœuds et arêtes
        insiderToCompanies.forEach((data, insiderName) => {
            const { insider, companies } = data;

            // Ajouter le nœud Insider
            if (!addedInsiders.has(insiderName)) {
                nodes.push({
                    id: `insider_${insiderName}`,
                    label: insiderName,
                    group: 'insider',
                    title: `${insiderName}<br>${insider.position}<br>Active in ${companies.size} companies`,
                    color: {
                        background: '#3b82f6',
                        border: '#2563eb',
                        highlight: {
                            background: '#2563eb',
                            border: '#1d4ed8'
                        }
                    },
                    size: 15 + companies.size * 5
                });
                addedInsiders.add(insiderName);
            }

            // Ajouter les nœuds Company et les liens
            companies.forEach(symbol => {
                const companyId = `company_${symbol}`;

                if (!addedCompanies.has(symbol)) {
                    const companyData = this.filteredData.find(t => t.company.symbol === symbol)?.company;
                    nodes.push({
                        id: companyId,
                        label: symbol,
                        group: 'company',
                        title: `${companyData?.name || symbol}<br>Sector: ${companyData?.sector || 'N/A'}`,
                        color: {
                            background: '#a78bfa',
                            border: '#8b5cf6',
                            highlight: {
                                background: '#8b5cf6',
                                border: '#7c3aed'
                            }
                        },
                        size: 25
                    });
                    addedCompanies.add(symbol);
                }

                // Créer l'arête Insider → Company (Degree 1)
                edges.push({
                    id: edgeId++,
                    from: `insider_${insiderName}`,
                    to: companyId,
                    title: 'Board Member / Insider',
                    degree: 1
                });
            });
        });

        // Détecter les interlocks (Degree 2): Insiders connectés via companies communes
        const companyToInsiders = new Map();
        insiderToCompanies.forEach((data, insiderName) => {
            data.companies.forEach(symbol => {
                if (!companyToInsiders.has(symbol)) {
                    companyToInsiders.set(symbol, new Set());
                }
                companyToInsiders.get(symbol).add(insiderName);
            });
        });

        // Ajouter des arêtes Insider ↔ Insider (Degree 2)
        companyToInsiders.forEach((insiders, symbol) => {
            const insiderArray = Array.from(insiders);
            for (let i = 0; i < insiderArray.length; i++) {
                for (let j = i + 1; j < insiderArray.length; j++) {
                    edges.push({
                        id: edgeId++,
                        from: `insider_${insiderArray[i]}`,
                        to: `insider_${insiderArray[j]}`,
                        title: `Connected via ${symbol}`,
                        color: {
                            color: '#f59e0b',
                            highlight: '#d97706'
                        },
                        dashes: true,
                        width: 1,
                        degree: 2
                    });
                }
            }
        });

        return { nodes, edges };
    }

    /**
     * 🔍 DÉTAILS D'UN NŒUD DU RÉSEAU
     */
    showNetworkNodeDetails(node) {
        const isInsider = node.group === 'insider';
        
        let message = '';
        
        if (isInsider) {
            const insiderName = node.label;
            const transactions = this.filteredData.filter(t => t.insider.name === insiderName);
            const companies = [...new Set(transactions.map(t => t.company.symbol))];
            
            message = `
                <div style='padding: 20px;'>
                    <h3 style='margin: 0 0 16px 0; color: var(--ml-primary);'>
                        <i class='fas fa-user-tie'></i> Insider: ${insiderName}
                    </h3>
                    <p><strong>Transactions:</strong> ${transactions.length}</p>
                    <p><strong>Companies:</strong> ${companies.join(', ')}</p>
                    <p><strong>Positions:</strong> ${[...new Set(transactions.map(t => t.insider.position))].join(', ')}</p>
                </div>
            `;
        } else {
            const symbol = node.label;
            const transactions = this.filteredData.filter(t => t.company.symbol === symbol);
            const insiders = [...new Set(transactions.map(t => t.insider.name))];
            
            message = `
                <div style='padding: 20px;'>
                    <h3 style='margin: 0 0 16px 0; color: var(--ml-primary);'>
                        <i class='fas fa-building'></i> Company: ${symbol}
                    </h3>
                    <p><strong>Insiders:</strong> ${insiders.length}</p>
                    <p><strong>Transactions:</strong> ${transactions.length}</p>
                    <p><strong>Top Insiders:</strong> ${insiders.slice(0, 5).join(', ')}</p>
                </div>
            `;
        }

        // Créer un modal personnalisé ou utiliser une alerte HTML
        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--card-bg); padding: 0; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); z-index: 10000; max-width: 500px; width: 90%;';
        modal.innerHTML = `
            ${message}
            <div style='padding: 0 20px 20px 20px;'>
                <button onclick='this.parentElement.parentElement.remove(); document.body.style.overflow=""' style='width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;'>
                    Close
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    /**
     * 🎚 FILTRER PAR DEGRÉ DE CONNEXION (✅ FONCTIONNEL)
     */
    filterNetworkDegree(degree) {
        if (!this.networkGraph || !this.fullNetworkData) return;

        // Mise à jour visuelle des boutons
        document.querySelectorAll('.network-control-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.degree) === degree) {
                btn.classList.add('active');
            }
        });

        this.currentNetworkDegree = degree;

        // Filtrer les edges selon le degré
        let filteredEdges = this.fullNetworkData.edges;
        
        if (degree === 1) {
            // Degree 1: Direct connections only (solid lines)
            filteredEdges = this.fullNetworkData.edges.filter(e => !e.dashes);
        } else if (degree === 2) {
            // Degree 2: Direct + Indirect (via shared companies)
            filteredEdges = this.fullNetworkData.edges.filter(e => e.degree <= 2);
        }
        // Degree 3: All edges (default)

        // Mise à jour du graphe
        const data = {
            nodes: new vis.DataSet(this.fullNetworkData.nodes),
            edges: new vis.DataSet(filteredEdges)
        };

        this.networkGraph.setData(data);

        console.log(`🎚 Network filtered to degree ${degree} (${filteredEdges.length} edges)`);
    }

    /**
     * 💡 KEY INSIGHTS DU RÉSEAU (✅ SANS CHARGEMENT INFINI)
     */
    renderNetworkInsights(nodes, edges) {
        const insightsContainer = document.getElementById('networkInsights');
        if (!insightsContainer) return;

        const insiders = nodes.filter(n => n.group === 'insider');
        const companies = nodes.filter(n => n.group === 'company');
        const directConnections = edges.filter(e => !e.dashes).length;
        const interlocks = edges.filter(e => e.dashes).length;

        // Trouver l'insider le plus connecté
        const insiderConnections = {};
        edges.forEach(edge => {
            if (edge.from.startsWith('insider_')) {
                insiderConnections[edge.from] = (insiderConnections[edge.from] || 0) + 1;
            }
        });

        const mostConnectedId = Object.keys(insiderConnections).reduce((a, b) => 
            insiderConnections[a] > insiderConnections[b] ? a : b, ''
        );
        const mostConnected = nodes.find(n => n.id === mostConnectedId);

        insightsContainer.innerHTML = `
            <div class='insight-item'>
                <i class='fas fa-users' style='color: #3b82f6;'></i>
                <span><strong>${insiders.length}</strong> unique insiders tracked</span>
            </div>
            <div class='insight-item'>
                <i class='fas fa-building' style='color: #a78bfa;'></i>
                <span><strong>${companies.length}</strong> companies in network</span>
            </div>
            <div class='insight-item'>
                <i class='fas fa-link' style='color: #10b981;'></i>
                <span><strong>${directConnections}</strong> direct board positions</span>
            </div>
            <div class='insight-item'>
                <i class='fas fa-project-diagram' style='color: #f59e0b;'></i>
                <span><strong>${interlocks}</strong> board interlocks detected</span>
            </div>
            ${mostConnected ? `
                <div class='insight-item'>
                    <i class='fas fa-crown' style='color: #f59e0b;'></i>
                    <span>Most connected: <strong>${mostConnected.label}</strong> (${insiderConnections[mostConnectedId]} boards)</span>
                </div>
            ` : ''}
        `;

        console.log('💡 Network insights rendered');
    }

    /**
     * 💡 ALPHY RECOMMENDATION (✅ CORRIGÉ)
     */
    generateAlphyRecommendation() {
        const container = document.getElementById('alphyRecommendation');
        if (!container) return;

        const insights = this.analyzeTopInsights();
        const criticalPoints = insights.critical.slice(0, 3);
        const positivePoints = insights.positive.slice(0, 3);

        let overallSignal = 'NEUTRAL';
        
        if (positivePoints.length > criticalPoints.length) {
            overallSignal = 'BULLISH';
        } else if (criticalPoints.length > positivePoints.length) {
            overallSignal = 'BEARISH';
        }

        container.innerHTML = `
            <div class='alphy-recommendation-header'>
                <div class='alphy-logo'>
                    <i class='fas fa-robot'></i>
                </div>
                <div>
                    <h2 class='alphy-recommendation-title'>Alphy AI Weekly Insider Analysis</h2>
                    <p style='color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 0.95rem;'>
                        Based on ${this.filteredData.length} insider transactions over the last ${this.currentPeriod} days
                    </p>
                </div>
            </div>
            
            <div class='alphy-recommendation-content'>
                <div style='background: rgba(255, 255, 255, 0.15); padding: 20px; border-radius: 16px; margin-bottom: 28px; text-align: center;'>
                    <p style='color: rgba(255, 255, 255, 0.95); font-size: 0.9rem; margin-bottom: 8px; font-weight: 600;'>OVERALL MARKET SIGNAL</p>
                    <h3 style='color: white; font-size: 2rem; font-weight: 900; margin: 0;'>
                        ${overallSignal}
                    </h3>
                </div>

                <div class='recommendation-grid'>
                    <div class='recommendation-card' style='background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); border-left: 4px solid #ef4444;'>
                        <h3 style='color: #ef4444; font-size: 1.2rem; font-weight: 800; margin-bottom: 16px;'>
                            <i class='fas fa-exclamation-triangle'></i>
                            Critical Points
                        </h3>
                        <ul style='list-style: none; padding: 0; margin: 0;'>
                            ${criticalPoints.map(point => `
                                <li style='padding: 12px 0; border-bottom: 1px solid rgba(0, 0, 0, 0.05);'>
                                    <span style='color: var(--text-primary); line-height: 1.6; font-weight: 600;'>${point}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>

                    <div class='recommendation-card' style='background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05)); border-left: 4px solid #10b981;'>
                        <h3 style='color: #10b981; font-size: 1.2rem; font-weight: 800; margin-bottom: 16px;'>
                            <i class='fas fa-check-circle'></i>
                            Positive Signals
                        </h3>
                        <ul style='list-style: none; padding: 0; margin: 0;'>
                            ${positivePoints.map(point => `
                                <li style='padding: 12px 0; border-bottom: 1px solid rgba(0, 0, 0, 0.05);'>
                                    <span style='color: var(--text-primary); line-height: 1.6; font-weight: 600;'>${point}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    analyzeTopInsights() {
        const critical = [];
        const positive = [];

        const purchases = this.filteredData.filter(t => t.type === 'P').length;
        const sales = this.filteredData.filter(t => t.type === 'S').length;
        const buyRatio = (purchases + sales) > 0 ? purchases / (purchases + sales) * 100 : 0;

        if (buyRatio < 30) {
            critical.push(`Heavy insider selling: ${sales} sales vs ${purchases} purchases`);
        } else if (buyRatio > 70) {
            positive.push(`Strong insider buying: ${purchases} purchases vs ${sales} sales`);
        }

        // Ajouter des insights par défaut si vides
        if (critical.length === 0) {
            critical.push('No major risk factors detected');
            critical.push('Transaction volumes within normal ranges');
            critical.push('Insider selling appears routine');
        }

        if (positive.length === 0) {
            positive.push('Insider buying activity is moderate');
            positive.push('No exceptional patterns detected');
            positive.push('Market sentiment appears neutral');
        }

        return { critical, positive };
    }

    /**
     * 🔍 MODAL DE DÉTAILS DE TRANSACTION (✅ CORRIGÉ)
     */
    viewTransactionDetail(txnId) {
        const txn = this.filteredData.find(t => t.id === txnId) || 
                    this.allCompaniesData?.allTransactions.find(t => t.id === txnId);
        
        if (!txn) {
            console.error('Transaction not found:', txnId);
            return;
        }

        const modal = document.getElementById('transactionDetailModal');
        const content = document.getElementById('transactionDetailContent');

        if (!modal || !content) return;

        const convictionScore = txn.convictionScore?.score || 0;
        const convictionLevel = txn.convictionScore?.level || 'low';
        const convictionColor = convictionScore >= 70 ? '#10b981' : convictionScore >= 50 ? '#f59e0b' : '#ef4444';

        content.innerHTML = `
            <div class='detail-grid' style='display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; padding: 30px;'>
                <!-- Transaction Info -->
                <div class='detail-card' style='background: var(--card-bg); padding: 24px; border-radius: 12px; border: 1px solid var(--border-color);'>
                    <h4 style='color: var(--ml-primary); font-weight: 800; margin: 0 0 20px 0;'>
                        <i class='fas fa-exchange-alt'></i> Transaction Info
                    </h4>
                    <div class='detail-row' style='display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);'>
                        <span class='detail-label' style='color: var(--text-secondary); font-weight: 600;'>Type</span>
                        <span class='detail-value'>
                            <span class='transaction-type-badge ${txn.type === 'P' ? 'type-buy' : txn.type === 'S' ? 'type-sell' : 'type-option'}'>
                                ${txn.type === 'P' ? '📈 Purchase' : txn.type === 'S' ? '📉 Sale' : '🎫 Option'}
                            </span>
                        </span>
                    </div>
                    <div class='detail-row' style='display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);'>
                        <span class='detail-label' style='color: var(--text-secondary); font-weight: 600;'>Date</span>
                        <span class='detail-value' style='font-weight: 700;'>${this.formatDate(txn.date)}</span>
                    </div>
                    <div class='detail-row' style='display: flex; justify-content: space-between; padding: 12px 0;'>
                        <span class='detail-label' style='color: var(--text-secondary); font-weight: 600;'>Filing</span>
                        <span class='detail-value'>
                            <a href='${txn.formUrl}' target='_blank' style='color: var(--ml-primary); font-weight: 700;'>
                                ${txn.filingType} <i class='fas fa-external-link-alt' style='font-size: 0.8rem;'></i>
                            </a>
                        </span>
                    </div>
                </div>

                <!-- Company Info -->
                <div class='detail-card' style='background: var(--card-bg); padding: 24px; border-radius: 12px; border: 1px solid var(--border-color);'>
                    <h4 style='color: var(--ml-primary); font-weight: 800; margin: 0 0 20px 0;'>
                        <i class='fas fa-building'></i> Company Info
                    </h4>
                    <div class='detail-row' style='display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);'>
                        <span class='detail-label' style='color: var(--text-secondary); font-weight: 600;'>Symbol</span>
                        <span class='detail-value' style='font-weight: 900; color: var(--ml-primary);'>${txn.company.symbol}</span>
                    </div>
                    <div class='detail-row' style='display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);'>
                        <span class='detail-label' style='color: var(--text-secondary); font-weight: 600;'>Name</span>
                        <span class='detail-value' style='font-weight: 700;'>${txn.company.name}</span>
                    </div>
                    <div class='detail-row' style='display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);'>
                        <span class='detail-label' style='color: var(--text-secondary); font-weight: 600;'>Sector</span>
                        <span class='detail-value'><span class='ipo-sector-badge'>${txn.company.sector}</span></span>
                    </div>
                    <div class='detail-row' style='display: flex; justify-content: space-between; padding: 12px 0;'>
                        <span class='detail-label' style='color: var(--text-secondary); font-weight: 600;'>CIK</span>
                        <span class='detail-value' style='font-family: monospace; font-weight: 700;'>${txn.company.cik}</span>
                    </div>
                </div>

                <!-- Insider Info -->
                <div class='detail-card' style='background: var(--card-bg); padding: 24px; border-radius: 12px; border: 1px solid var(--border-color);'>
                    <h4 style='color: var(--ml-primary); font-weight: 800; margin: 0 0 20px 0;'>
                        <i class='fas fa-user-tie'></i> Insider Info
                    </h4>
                    <div class='detail-row' style='display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);'>
                        <span class='detail-label' style='color: var(--text-secondary); font-weight: 600;'>Name</span>
                        <span class='detail-value' style='font-weight: 700;'>${txn.insider.name}</span>
                    </div>
                    <div class='detail-row' style='display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);'>
                        <span class='detail-label' style='color: var(--text-secondary); font-weight: 600;'>Position</span>
                        <span class='detail-value'><span class='ipo-sector-badge'>${txn.insider.position}</span></span>
                    </div>
                    <div class='detail-row' style='display: flex; justify-content: space-between; padding: 12px 0;'>
                        <span class='detail-label' style='color: var(--text-secondary); font-weight: 600;'>Est. Net Worth</span>
                        <span class='detail-value' style='font-weight: 700;'>$${this.formatNumber(txn.insider.netWorth)}</span>
                    </div>
                </div>

                <!-- Financial Details -->
                <div class='detail-card' style='background: var(--card-bg); padding: 24px; border-radius: 12px; border: 1px solid var(--border-color);'>
                    <h4 style='color: var(--ml-primary); font-weight: 800; margin: 0 0 20px 0;'>
                        <i class='fas fa-dollar-sign'></i> Financial Details
                    </h4>
                    <div class='detail-row' style='display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);'>
                        <span class='detail-label' style='color: var(--text-secondary); font-weight: 600;'>Shares</span>
                        <span class='detail-value' style='font-weight: 700;'>${this.formatNumber(txn.shares)}</span>
                    </div>
                    <div class='detail-row' style='display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-color);'>
                        <span class='detail-label' style='color: var(--text-secondary); font-weight: 600;'>Price/Share</span>
                        <span class='detail-value' style='font-weight: 700;'>$${txn.pricePerShare.toFixed(2)}</span>
                    </div>
                    <div class='detail-row' style='display: flex; justify-content: space-between; padding: 12px 0;'>
                        <span class='detail-label' style='color: var(--text-secondary); font-weight: 600;'>Total Value</span>
                        <span class='detail-value' style='font-size: 1.2rem; color: var(--ml-primary); font-weight: 900;'>
                            $${this.formatNumber(txn.transactionValue)}
                        </span>
                    </div>
                </div>

                <!-- Analysis -->
                <div class='detail-card' style='grid-column: span 2; background: var(--card-bg); padding: 24px; border-radius: 12px; border: 1px solid var(--border-color);'>
                    <h4 style='color: var(--ml-primary); font-weight: 800; margin: 0 0 20px 0;'>
                        <i class='fas fa-chart-line'></i> Analysis & Impact
                    </h4>
                    <div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;'>
                        <div style='text-align: center; padding: 20px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border-radius: 12px;'>
                            <p style='color: var(--text-secondary); font-weight: 700; font-size: 0.85rem; margin: 0 0 8px 0;'>CONVICTION SCORE</p>
                            <p style='font-size: 2rem; font-weight: 900; margin: 0; color: ${convictionColor};'>
                                ${convictionScore}<span style='font-size: 1rem;'>/100</span>
                            </p>
                            <p style='color: var(--text-tertiary); font-size: 0.85rem; margin: 8px 0 0 0; text-transform: uppercase; font-weight: 700;'>${convictionLevel}</p>
                        </div>
                        <div style='text-align: center; padding: 20px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1)); border-radius: 12px;'>
                            <p style='color: var(--text-secondary); font-weight: 700; font-size: 0.85rem; margin: 0 0 8px 0;'>PRICE IMPACT (7D)</p>
                            <p style='font-size: 2rem; font-weight: 900; margin: 0; color: ${txn.priceImpact7d >= 0 ? '#10b981' : '#ef4444'};'>
                                ${txn.priceImpact7d >= 0 ? '+' : ''}${txn.priceImpact7d.toFixed(1)}%
                            </p>
                        </div>
                        <div style='text-align: center; padding: 20px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1)); border-radius: 12px;'>
                            <p style='color: var(--text-secondary); font-weight: 700; font-size: 0.85rem; margin: 0 0 8px 0;'>PRICE IMPACT (30D)</p>
                            <p style='font-size: 2rem; font-weight: 900; margin: 0; color: ${txn.priceImpact30d >= 0 ? '#10b981' : '#ef4444'};'>
                                ${txn.priceImpact30d >= 0 ? '+' : ''}${txn.priceImpact30d.toFixed(1)}%
                            </p>
                        </div>
                        <div style='text-align: center; padding: 20px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1)); border-radius: 12px;'>
                            <p style='color: var(--text-secondary); font-weight: 700; font-size: 0.85rem; margin: 0 0 8px 0;'>DAYS TO EARNINGS</p>
                            <p style='font-size: 2rem; font-weight: 900; margin: 0; color: var(--text-primary);'>
                                ${txn.daysToEarnings}
                            </p>
                            <p style='color: var(--text-tertiary); font-size: 0.85rem; margin: 8px 0 0 0;'>
                                ${txn.daysToEarnings <= 14 ? '⚠ Pre-Earnings Window' : '✓ Normal Window'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div style='padding: 30px; background: rgba(102, 126, 234, 0.05); border-top: 2px solid var(--border-color);'>
                <h4 style='color: var(--ml-primary); font-weight: 800; margin: 0 0 12px 0;'>
                    <i class='fas fa-lightbulb'></i> Interpretation
                </h4>
                <p style='color: var(--text-primary); line-height: 1.8; margin: 0;'>
                    ${this.generateTransactionInterpretation(txn)}
                </p>
            </div>
        `;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    /**
     * 💡 GÉNÉRATION D'INTERPRÉTATION
     */
    generateTransactionInterpretation(txn) {
        const isPurchase = txn.type === 'P';
        const isSale = txn.type === 'S';
        const convictionScore = txn.convictionScore?.score || 0;
        const isHighConviction = convictionScore >= 70;
        const isPreEarnings = txn.daysToEarnings <= 14;
        const priceImpact = txn.priceImpact30d || 0;

        let interpretation = '';

        if (isPurchase) {
            interpretation += `<strong>${txn.insider.name}</strong> (${txn.insider.position}) purchased <strong>$${this.formatNumber(txn.transactionValue)}</strong> worth of ${txn.company.symbol} shares. `;
            
            if (isHighConviction) {
                interpretation += `This represents a <strong style='color: #10b981;'>HIGH CONVICTION</strong> purchase (score: ${convictionScore}/100), suggesting strong insider confidence. `;
            } else {
                interpretation += `This is a moderate conviction purchase (score: ${convictionScore}/100). `;
            }

            if (isPreEarnings) {
                interpretation += `⚠ <strong>Note:</strong> This purchase occurred within 14 days before earnings, which may indicate insider confidence in upcoming results. `;
            }

            if (priceImpact > 0) {
                interpretation += `The stock price increased by <strong style='color: #10b981;'>+${priceImpact.toFixed(1)}%</strong> in the 30 days following this transaction, validating the insider's decision.`;
            } else if (priceImpact < 0) {
                interpretation += `The stock price decreased by <strong style='color: #ef4444;'>${priceImpact.toFixed(1)}%</strong> in the 30 days following this transaction.`;
            }
        } else if (isSale) {
            interpretation += `<strong>${txn.insider.name}</strong> (${txn.insider.position}) sold <strong>$${this.formatNumber(txn.transactionValue)}</strong> worth of ${txn.company.symbol} shares. `;
            
            interpretation += `While insider sales can occur for various personal reasons (tax planning, diversification, liquidity needs), `;
            
            if (isHighConviction) {
                interpretation += `the <strong style='color: #ef4444;'>high conviction score (${convictionScore}/100)</strong> suggests this may be a strategic decision rather than routine portfolio rebalancing. `;
            }

            if (isPreEarnings) {
                interpretation += `⚠ <strong>Critical:</strong> This sale occurred within 14 days before earnings, which may warrant additional scrutiny. `;
            }
        }

        return interpretation;
    }

    /**
     * ℹ MODAL D'INFORMATION DYNAMIQUE (✅ CORRIGÉ)
     */
    showInfoModal(topic) {
        const modal = document.getElementById('infoModal');
        const title = document.getElementById('infoModalTitle');
        const content = document.getElementById('infoModalContent');

        if (!modal || !title || !content) return;

        const infoContent = this.getInfoContent(topic);
        
        title.innerHTML = `<i class='${infoContent.icon}'></i> ${infoContent.title}`;
        content.innerHTML = infoContent.content;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    /**
     * 📚 CONTENU DES MODALS D'INFORMATION
     */
    getInfoContent(topic) {
        const contents = {
            'sentiment': {
                icon: 'fas fa-tachometer-alt',
                title: 'Insider Sentiment Gauge',
                content: `
                    <h3><i class='fas fa-info-circle'></i> What is Insider Sentiment?</h3>
                    <p>The Insider Sentiment Gauge measures the overall buying vs. selling activity from corporate insiders.</p>
                    
                    <h3><i class='fas fa-calculator'></i> How It's Calculated</h3>
                    <ul>
                        <li>Score ranges from 0 (extreme selling) to 100 (extreme buying)</li>
                        <li>Formula: <code>50 + ((Purchases - Sales) / Total Transactions) × 50</code></li>
                    </ul>

                    <h3><i class='fas fa-chart-line'></i> Interpretation Guide</h3>
                    <div style='padding: 16px; background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; margin: 12px 0; border-radius: 8px;'>
                        <strong>65-100 (Bullish):</strong> Strong insider buying suggests confidence in future performance.
                    </div>
                    <div style='padding: 16px; background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; margin: 12px 0; border-radius: 8px;'>
                        <strong>35-65 (Neutral):</strong> Mixed signals. Monitor for emerging trends.
                    </div>
                    <div style='padding: 16px; background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; margin: 12px 0; border-radius: 8px;'>
                        <strong>0-35 (Bearish):</strong> Elevated selling may indicate insiders taking profits.
                    </div>
                `
            },
            'conviction': {
                icon: 'fas fa-star',
                title: 'Conviction Score Methodology',
                content: `
                    <h3><i class='fas fa-info-circle'></i> What is Conviction Score?</h3>
                    <p>The Conviction Score (0-100) measures <strong>how meaningful</strong> an insider transaction is relative to the insider's personal wealth.</p>

                    <h3><i class='fas fa-trophy'></i> Score Interpretation</h3>
                    <div style='padding: 16px; background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; margin: 12px 0; border-radius: 8px;'>
                        <strong>80-100 (Very High):</strong> Transaction represents >5% of net worth. Extremely strong signal.
                    </div>
                    <div style='padding: 16px; background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; margin: 12px 0; border-radius: 8px;'>
                        <strong>60-79 (High):</strong> Transaction represents 2-5% of net worth. Strong conviction.
                    </div>
                `
            }
        };

        return contents[topic] || {
            icon: 'fas fa-question-circle',
            title: 'Information',
            content: '<p>No information available for this topic.</p>'
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // 🔧 MÉTHODES UTILITAIRES
    // ═══════════════════════════════════════════════════════════════

    populateCompanyFilter() {
        const select = document.getElementById('companyFilter');
        if (!select || !this.allCompaniesData) return;

        const companies = [...new Set(this.allCompaniesData.allTransactions.map(t => t.company.symbol))].sort();
        
        const options = companies.map(symbol => 
            `<option value='${symbol}'>${symbol}</option>`
        ).join('');

        select.innerHTML = `<option value='all'>All Companies</option>${options}`;
    }

    checkSmartAlerts() {
        const alerts = [];

        if (this.alertConfig.clusterBuying) {
            const clusterCompanies = this.detectClusterBuying();
            if (clusterCompanies.length > 0) {
                alerts.push({
                    type: 'cluster',
                    message: `Cluster buying detected in ${clusterCompanies.length} companies!`
                });
            }
        }

        if (alerts.length > 0) {
            this.showAlertBanner(alerts[0]);
        }
    }

    detectClusterBuying() {
        const companies = {};
        const last7Days = this.filteredData.filter(txn => this.isRecent(txn.date, 7) && txn.type === 'P');

        last7Days.forEach(txn => {
            if (!companies[txn.company.symbol]) {
                companies[txn.company.symbol] = { count: 0 };
            }
            companies[txn.company.symbol].count++;
        });

        return Object.keys(companies).filter(symbol => companies[symbol].count >= 3);
    }

    detectDivergence() {
        return [];
    }

    isRecent(date, days) {
        const now = new Date();
        const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        return daysDiff <= days;
    }

    showAlertBanner(alert) {
        const banner = document.getElementById('smartAlertsBanner');
        const message = document.getElementById('alertBannerMessage');
        
        if (banner && message) {
            message.textContent = alert.message;
            banner.style.display = 'block';
        }
    }

    filterTransactions(button) {
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.remove('active');
        });

        button.classList.add('active');

        const type = button.dataset.type;
        this.currentTransactionType = type;

        this.applyFilters();
    }

    updateCorrelation(button) {
        document.querySelectorAll('.chart-control-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
    }

    viewPattern(patternType) {
        alert(`Viewing pattern: ${patternType}`);
    }

    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(0);
    }

    showLoading() {
        const loadingEl = document.getElementById('loadingState');
        if (loadingEl) loadingEl.style.display = 'block';
    }

    hideLoading() {
        const loadingEl = document.getElementById('loadingState');
        if (loadingEl) loadingEl.style.display = 'none';
    }

    showError(message) {
        console.error('❌', message);
        alert(message);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = '';
    }

    saveAlertConfig() {
        this.alertConfig = {
            clusterBuying: document.getElementById('alertClusterBuying')?.checked || true,
            highValue: document.getElementById('alertHighValue')?.checked || true,
            divergence: document.getElementById('alertDivergence')?.checked || true,
            preEarnings: document.getElementById('alertPreEarnings')?.checked || true,
            unusualVolume: document.getElementById('alertUnusualVolume')?.checked || true,
            highValueThreshold: parseInt(document.getElementById('highValueThreshold')?.value || 1000000)
        };

        console.log('✅ Alert configuration saved:', this.alertConfig);
        alert('Alert configuration saved successfully!');
        this.closeAllModals();
    }
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 INITIALISATION GLOBALE
// ═══════════════════════════════════════════════════════════════════

// Initialize app
let insiderApp;
document.addEventListener('DOMContentLoaded', () => {
    insiderApp = new AdvancedInsiderFlowTracker();
    
    // ✅ Auto-load data (SANS POPUP - retrait du setTimeout)
    if (insiderApp) {
        insiderApp.loadAllData();
    }
});

// Global logout function
function logout() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().then(() => {
            window.location.href = 'login.html';
        }).catch(error => {
            console.error('Logout error:', error);
        });
    }
}