/**
 * ═══════════════════════════════════════════════════════════════════
 * 🧠 INSIDER ANALYTICS ENGINE - AlphaVault AI
 * ═══════════════════════════════════════════════════════════════════
 * Moteur d'analyse avancée pour détecter patterns, anomalies et signaux
 * ═══════════════════════════════════════════════════════════════════
 */

class InsiderAnalyticsEngine {
    constructor() {
        this.form4Client = new SECForm4Client();
        this.cache = new Map();
        
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
     * 🎯 ANALYSE COMPLÈTE D'UNE ENTREPRISE
     */
    async analyzeCompany(ticker, options = {}) {
        const {
            months = 12,
            maxFilings = 100, // ✅ AJOUT : Récupère maxFilings
            includeDerivatives = true,
            includePriceImpact = true,
            includeNetworkAnalysis = true,
            onProgress = null // ✅ AJOUT : Callback pour progression
        } = options;

        console.log(`🔍 Starting comprehensive analysis for ${ticker}...`);

        try {
            // 1. Récupération de l'historique complet
            if (onProgress) onProgress(20, 'Fetching Form 4 filings...');
            
            const history = await this.form4Client.getCompanyInsiderHistory(ticker, months, {
                maxFilings: maxFilings, // ✅ CORRECTION : Passe maxFilings
                verbose: false
            });
            
            if (!history || history.transactions.length === 0) {
                return {
                    ticker,
                    error: 'No insider transactions found',
                    analysis: null
                };
            }

            if (onProgress) onProgress(50, 'Analyzing patterns...');

            // 2. Analyses parallèles
            const [
                clusterActivity,
                insiderSentiment,
                roleAnalysis,
                timingPatterns,
                convictionScores,
                divergenceAnalysis,
                priceImpact,
                networkGraph
            ] = await Promise.all([
                this.detectClusterBuying(history.transactions),
                this.calculateInsiderSentiment(history.transactions),
                this.analyzeByRole(history.transactions),
                this.detectTimingPatterns(history.transactions, ticker),
                this.calculateConvictionScores(history.transactions),
                this.detectCEOCFODivergence(history.transactions),
                includePriceImpact ? this.analyzePriceImpact(ticker, history.transactions) : null,
                includeNetworkAnalysis ? this.buildInsiderNetwork(history.transactions) : null
            ]);

            if (onProgress) onProgress(80, 'Calculating scores...');

            // 3. Score global et recommandation
            const overallScore = this.calculateOverallScore({
                clusterActivity,
                insiderSentiment,
                roleAnalysis,
                timingPatterns,
                convictionScores,
                divergenceAnalysis
            });

            // 4. Génération des alertes
            const alerts = this.generateSmartAlerts({
                ticker,
                clusterActivity,
                divergenceAnalysis,
                timingPatterns,
                roleAnalysis,
                overallScore
            });

            if (onProgress) onProgress(95, 'Finalizing analysis...');

            return {
                ticker,
                period: history.period,
                transactionCount: history.transactions.length,
                transactions: history.transactions,
                
                // Scores principaux
                overallScore,
                insiderSentiment,
                
                // Analyses détaillées
                clusterActivity,
                roleAnalysis,
                timingPatterns,
                convictionScores,
                divergenceAnalysis,
                priceImpact,
                networkGraph,
                
                // Alertes et recommandations
                alerts,
                recommendation: this.generateRecommendation(overallScore, alerts),
                
                // Méta
                lastUpdated: new Date().toISOString(),
                dataQuality: this.assessDataQuality(history.transactions)
            };

        } catch (error) {
            console.error(`❌ Error analyzing ${ticker}:`, error);
            throw error;
        }
    }

    /**
     * 📊 CLUSTER BUYING DETECTION
     * Détecte quand plusieurs insiders achètent simultanément
     */
    async detectClusterBuying(transactions) {
        const clusters = [];
        const windowDays = this.thresholds.clusterBuying.windowDays;

        // Filtre uniquement les achats
        const purchases = transactions.filter(t => 
            t.nonDerivativeTransactions?.some(nt => nt.transactionType === 'Purchase')
        );

        // Groupe par fenêtre temporelle
        for (let i = 0; i < purchases.length; i++) {
            const baseTransaction = purchases[i];
            const baseDate = new Date(baseTransaction.filingDate);

            // Trouve toutes les transactions dans la fenêtre
            const clusterTransactions = purchases.filter(t => {
                const tDate = new Date(t.filingDate);
                const daysDiff = Math.abs((tDate - baseDate) / (1000 * 60 * 60 * 24));
                return daysDiff <= windowDays;
            });

            // Calcule les métriques du cluster
            const uniqueInsiders = new Set(clusterTransactions.map(t => t.reportingOwner?.name));
            const totalValue = clusterTransactions.reduce((sum, t) => {
                return sum + (t.nonDerivativeTransactions || [])
                    .filter(nt => nt.transactionType === 'Purchase')
                    .reduce((s, nt) => s + nt.totalValue, 0);
            }, 0);

            // Si critères remplis = cluster significatif
            if (uniqueInsiders.size >= this.thresholds.clusterBuying.minInsiders &&
                totalValue >= this.thresholds.clusterBuying.minTotalValue) {
                
                clusters.push({
                    startDate: baseDate,
                    endDate: new Date(Math.max(...clusterTransactions.map(t => new Date(t.filingDate)))),
                    insiderCount: uniqueInsiders.size,
                    transactionCount: clusterTransactions.length,
                    totalValue,
                    averageValuePerInsider: totalValue / uniqueInsiders.size,
                    insiders: Array.from(uniqueInsiders),
                    
                    // Détails des transactions
                    transactions: clusterTransactions,
                    
                    // Scoring
                    signal: 'BULLISH',
                    confidence: this.calculateClusterConfidence(uniqueInsiders.size, totalValue),
                    severity: this.calculateClusterSeverity(uniqueInsiders.size, totalValue),
                    
                    // Contexte
                    insiderRoles: this.extractInsiderRoles(clusterTransactions),
                    isPreEarnings: false // Sera enrichi plus tard
                });
            }
        }

        // Déduplique les clusters qui se chevauchent
        const deduplicated = this.deduplicateClusters(clusters);

        return {
            detected: deduplicated.length > 0,
            count: deduplicated.length,
            clusters: deduplicated.sort((a, b) => b.confidence - a.confidence),
            
            // Statistiques
            totalInsidersInvolved: new Set(deduplicated.flatMap(c => c.insiders)).size,
            totalValueInClusters: deduplicated.reduce((sum, c) => sum + c.totalValue, 0),
            
            // Signal global
            overallSignal: this.calculateClusterSignal(deduplicated)
        };
    }

    /**
     * 💭 INSIDER SENTIMENT SCORE
     * Score agrégé de -100 (très bearish) à +100 (très bullish)
     */
    calculateInsiderSentiment(transactions, options = {}) {
        // ✅ CORRECTION : Option pour désactiver le calcul du trend (évite la récursion)
        const { includeTrend = true } = options;

        if (!transactions || transactions.length === 0) {
            return {
                score: 0,
                label: 'NEUTRAL',
                breakdown: { purchases: 0, sales: 0, netValue: 0 }
            };
        }

        let purchaseValue = 0;
        let saleValue = 0;
        let purchaseCount = 0;
        let saleCount = 0;

        transactions.forEach(t => {
            (t.nonDerivativeTransactions || []).forEach(nt => {
                if (nt.transactionType === 'Purchase') {
                    purchaseValue += nt.totalValue;
                    purchaseCount++;
                } else if (nt.transactionType === 'Sale') {
                    saleValue += nt.totalValue;
                    saleCount++;
                }
            });
        });

        // Calcul du score composite
        const totalValue = purchaseValue + saleValue;
        const valueRatio = totalValue > 0 ? (purchaseValue - saleValue) / totalValue : 0;
        
        const totalCount = purchaseCount + saleCount;
        const countRatio = totalCount > 0 ? (purchaseCount - saleCount) / totalCount : 0;
        
        // Pondération: 70% valeur, 30% fréquence
        const score = Math.round((valueRatio * 0.7 + countRatio * 0.3) * 100);
        
        return {
            score: Math.max(-100, Math.min(100, score)),
            label: this.getSentimentLabel(score),
            
            breakdown: {
                purchases: purchaseCount,
                sales: saleCount,
                purchaseValue,
                saleValue,
                netValue: purchaseValue - saleValue,
                netCount: purchaseCount - saleCount
            },
            
            // Contexte
            dominantActivity: purchaseValue > saleValue ? 'BUYING' : 'SELLING',
            intensity: this.calculateIntensity(totalValue, totalCount),
            
            // ✅ CORRECTION: Évite la récursion infinie
            trend: includeTrend ? this.calculateSentimentTrend(transactions) : null
        };
    }

    /**
     * 👔 ANALYSE PAR RÔLE (CEO, CFO, Directors, etc.)
     */
    analyzeByRole(transactions) {
        const roleData = {
            CEO: { purchases: [], sales: [], netValue: 0 },
            CFO: { purchases: [], sales: [], netValue: 0 },
            CTO: { purchases: [], sales: [], netValue: 0 },
            COO: { purchases: [], sales: [], netValue: 0 },
            President: { purchases: [], sales: [], netValue: 0 },
            Director: { purchases: [], sales: [], netValue: 0 },
            Officer: { purchases: [], sales: [], netValue: 0 },
            '10% Owner': { purchases: [], sales: [], netValue: 0 },
            Other: { purchases: [], sales: [], netValue: 0 }
        };

        transactions.forEach(t => {
            const role = t.reportingOwner?.classification || 'Other';
            if (!roleData[role]) roleData[role] = { purchases: [], sales: [], netValue: 0 };

            (t.nonDerivativeTransactions || []).forEach(nt => {
                if (nt.transactionType === 'Purchase') {
                    roleData[role].purchases.push(nt);
                    roleData[role].netValue += nt.totalValue;
                } else if (nt.transactionType === 'Sale') {
                    roleData[role].sales.push(nt);
                    roleData[role].netValue -= nt.totalValue;
                }
            });
        });

        // Calcule les scores par rôle
        const roleScores = {};
        Object.keys(roleData).forEach(role => {
            const data = roleData[role];
            const totalPurchaseValue = data.purchases.reduce((sum, p) => sum + p.totalValue, 0);
            const totalSaleValue = data.sales.reduce((sum, s) => sum + s.totalValue, 0);
            
            roleScores[role] = {
                purchaseCount: data.purchases.length,
                saleCount: data.sales.length,
                purchaseValue: totalPurchaseValue,
                saleValue: totalSaleValue,
                netValue: data.netValue,
                
                // Score spécifique au rôle
                score: this.calculateRoleScore(role, totalPurchaseValue, totalSaleValue),
                signal: data.netValue > 0 ? 'BULLISH' : data.netValue < 0 ? 'BEARISH' : 'NEUTRAL',
                
                // Importance du signal (CEO/CFO plus importants)
                weight: this.getRoleWeight(role)
            };
        });

        return {
            byRole: roleScores,
            
            // Insights clés
            mostActiveRole: this.getMostActiveRole(roleScores),
            mostBullishRole: this.getMostBullishRole(roleScores),
            mostBearishRole: this.getMostBearishRole(roleScores),
            
            // Pondération globale
            weightedScore: this.calculateWeightedRoleScore(roleScores)
        };
    }

    /**
     * ⏰ TIMING PATTERNS DETECTION
     * Détecte les achats/ventes avant earnings, annonces, etc.
     */
    async detectTimingPatterns(transactions, ticker) {
        // Note: Pour une vraie implémentation, il faudrait récupérer
        // le calendrier des earnings depuis une API (Alpha Vantage, etc.)
        
        const patterns = {
            preEarnings: [],
            postEarnings: [],
            beforeAnnouncements: [],
            unusual: []
        };

        // Détecte les clusters temporels suspects
        const sortedTransactions = [...transactions].sort((a, b) => 
            new Date(a.filingDate) - new Date(b.filingDate)
        );

        for (let i = 0; i < sortedTransactions.length; i++) {
            const txn = sortedTransactions[i];
            const txnDate = new Date(txn.filingDate);

            // Vérifie si c'est dans une période suspecte (ex: 14 jours avant quarter-end)
            const dayOfYear = this.getDayOfYear(txnDate);
            const isNearQuarterEnd = this.isNearQuarterEnd(txnDate);

            if (isNearQuarterEnd) {
                const netValue = (txn.nonDerivativeTransactions || [])
                    .reduce((sum, nt) => {
                        return sum + (nt.transactionType === 'Purchase' ? nt.totalValue : -nt.totalValue);
                    }, 0);

                patterns.preEarnings.push({
                    date: txnDate,
                    insider: txn.reportingOwner?.name,
                    role: txn.reportingOwner?.classification,
                    netValue,
                    signal: netValue > 0 ? 'BULLISH' : 'BEARISH',
                    suspicionLevel: this.calculateSuspicionLevel(netValue, txn.reportingOwner?.classification),
                    daysBeforeQuarterEnd: this.daysUntilQuarterEnd(txnDate)
                });
            }

            // Détecte les transactions inhabituelles (taille, fréquence)
            const isUnusual = this.isUnusualTransaction(txn, sortedTransactions);
            if (isUnusual.detected) {
                patterns.unusual.push({
                    date: txnDate,
                    insider: txn.reportingOwner?.name,
                    reason: isUnusual.reason,
                    metrics: isUnusual.metrics
                });
            }
        }

        return {
            preEarningsActivity: {
                count: patterns.preEarnings.length,
                transactions: patterns.preEarnings,
                totalValue: patterns.preEarnings.reduce((sum, p) => sum + Math.abs(p.netValue), 0),
                signal: this.aggregateSignal(patterns.preEarnings)
            },
            
            unusualActivity: {
                count: patterns.unusual.length,
                transactions: patterns.unusual
            },
            
            // Pattern global
            hasSignificantTiming: patterns.preEarnings.length > 0 || patterns.unusual.length > 0,
            riskLevel: this.calculateTimingRiskLevel(patterns)
        };
    }

    /**
     * 💪 CONVICTION SCORES
     * Mesure la conviction basée sur la taille relative des transactions
     */
    calculateConvictionScores(transactions) {
        const scores = transactions.map(t => {
            const totalValue = (t.nonDerivativeTransactions || [])
                .reduce((sum, nt) => sum + nt.totalValue, 0);

            const role = t.reportingOwner?.classification;
            const threshold = this.getConvictionThreshold(role);

            return {
                insider: t.reportingOwner?.name,
                role,
                transactionValue: totalValue,
                convictionLevel: this.getConvictionLevel(totalValue),
                convictionScore: this.calculateConvictionScore(totalValue, threshold),
                
                // Métrique: transaction value vs wealth (si disponible)
                // Pour l'instant, on se base uniquement sur la valeur absolue
                isHighConviction: totalValue > threshold
            };
        }).filter(s => s.transactionValue > 0);

        return {
            scores: scores.sort((a, b) => b.convictionScore - a.convictionScore),
            
            // Statistiques
            averageConviction: scores.length > 0 
                ? scores.reduce((sum, s) => sum + s.convictionScore, 0) / scores.length 
                : 0,
            
            highConvictionCount: scores.filter(s => s.isHighConviction).length,
            highConvictionValue: scores
                .filter(s => s.isHighConviction)
                .reduce((sum, s) => sum + s.transactionValue, 0)
        };
    }

    /**
     * 🚨 CEO/CFO DIVERGENCE DETECTION
     * Red flag quand CEO vend et CFO achète (ou inverse)
     */
    detectCEOCFODivergence(transactions) {
        const ceoTransactions = transactions.filter(t => 
            t.reportingOwner?.classification === 'CEO'
        );
        const cfoTransactions = transactions.filter(t => 
            t.reportingOwner?.classification === 'CFO'
        );

        if (ceoTransactions.length === 0 || cfoTransactions.length === 0) {
            return {
                detected: false,
                divergence: null
            };
        }

        // Calcule le sentiment net pour chaque rôle
        const ceoSentiment = this.calculateRoleSentiment(ceoTransactions);
        const cfoSentiment = this.calculateRoleSentiment(cfoTransactions);

        // Divergence = signes opposés
        const isDivergent = (ceoSentiment > 0 && cfoSentiment < 0) || 
                           (ceoSentiment < 0 && cfoSentiment > 0);

        if (!isDivergent) {
            return {
                detected: false,
                ceoSentiment,
                cfoSentiment,
                alignment: 'ALIGNED'
            };
        }

        // Calcule la sévérité de la divergence
        const divergenceScore = Math.abs(ceoSentiment - cfoSentiment);

        return {
            detected: true,
            
            ceo: {
                sentiment: ceoSentiment,
                direction: ceoSentiment > 0 ? 'BUYING' : 'SELLING',
                transactionCount: ceoTransactions.length
            },
            
            cfo: {
                sentiment: cfoSentiment,
                direction: cfoSentiment > 0 ? 'BUYING' : 'SELLING',
                transactionCount: cfoTransactions.length
            },
            
            divergenceScore,
            severity: this.getDivergenceSeverity(divergenceScore),
            
            // Signal (CEO selling + CFO buying = potentiel red flag)
            redFlag: ceoSentiment < 0 && cfoSentiment > 0,
            
            interpretation: this.interpretDivergence(ceoSentiment, cfoSentiment)
        };
    }

    /**
     * 📈 PRICE IMPACT ANALYSIS
     * Analyse l'impact historique des insider trades sur le cours
     */
    async analyzePriceImpact(ticker, transactions) {
        // Note: Nécessite une API de prix historiques (Alpha Vantage, Yahoo Finance, etc.)
        // Pour l'instant, retourne une structure vide
        
        console.log(`📈 Price impact analysis for ${ticker} (placeholder)`);
        
        return {
            available: false,
            message: 'Price data integration required',
            
            // Structure pour future implémentation
            correlations: [],
            averageImpact: {
                after1Day: null,
                after5Days: null,
                after30Days: null
            },
            
            // Accuracy du signal insider
            historicalAccuracy: null
        };
    }

    /**
     * 🕸 NETWORK ANALYSIS
     * Construit le graphe des relations entre insiders
     */
    buildInsiderNetwork(transactions) {
        const network = {
            nodes: [],
            edges: [],
            communities: []
        };

        // Construit les nœuds (insiders)
        const insiderMap = new Map();
        transactions.forEach(t => {
            const name = t.reportingOwner?.name;
            const role = t.reportingOwner?.classification;
            
            if (!insiderMap.has(name)) {
                insiderMap.set(name, {
                    id: name,
                    name,
                    role,
                    transactionCount: 0,
                    totalValue: 0,
                    sentiment: 0
                });
            }

            const node = insiderMap.get(name);
            node.transactionCount++;
            
            const netValue = (t.nonDerivativeTransactions || [])
                .reduce((sum, nt) => {
                    return sum + (nt.transactionType === 'Purchase' ? nt.totalValue : -nt.totalValue);
                }, 0);
            
            node.totalValue += Math.abs(netValue);
            node.sentiment += netValue;
        });

        network.nodes = Array.from(insiderMap.values());

        // Détecte les "board interlocks" (insiders qui agissent ensemble)
        // Simplifié: considère comme connectés les insiders qui transactent dans la même période
        const windowDays = 7;
        const connections = new Map();

        for (let i = 0; i < transactions.length; i++) {
            for (let j = i + 1; j < transactions.length; j++) {
                const t1 = transactions[i];
                const t2 = transactions[j];
                
                const date1 = new Date(t1.filingDate);
                const date2 = new Date(t2.filingDate);
                const daysDiff = Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));

                if (daysDiff <= windowDays) {
                    const name1 = t1.reportingOwner?.name;
                    const name2 = t2.reportingOwner?.name;
                    
                    if (name1 !== name2) {
                        const edgeKey = [name1, name2].sort().join('_');
                        connections.set(edgeKey, (connections.get(edgeKey) || 0) + 1);
                    }
                }
            }
        }

        // Convertit les connexions en edges
        connections.forEach((weight, edgeKey) => {
            const [source, target] = edgeKey.split('_');
            network.edges.push({
                source,
                target,
                weight,
                strength: weight > 3 ? 'STRONG' : weight > 1 ? 'MEDIUM' : 'WEAK'
            });
        });

        // Détecte les communautés (groupes d'insiders fortement connectés)
        network.communities = this.detectCommunities(network.nodes, network.edges);

        return {
            nodeCount: network.nodes.length,
            edgeCount: network.edges.length,
            communityCount: network.communities.length,
            
            network,
            
            // Métriques du réseau
            density: this.calculateNetworkDensity(network.nodes.length, network.edges.length),
            centralInsiders: this.findCentralInsiders(network.nodes, network.edges)
        };
    }

    /**
     * 🎯 OVERALL SCORE CALCULATION
     * Combine tous les signaux pour un score global
     */
    calculateOverallScore(analyses) {
        const {
            clusterActivity,
            insiderSentiment,
            roleAnalysis,
            timingPatterns,
            convictionScores,
            divergenceAnalysis
        } = analyses;

        let score = 50; // Base neutre

        // 1. Sentiment insider (+/- 20 points)
        score += (insiderSentiment.score / 100) * 20;

        // 2. Cluster buying (+15 points si détecté)
        if (clusterActivity.detected) {
            score += 15 * (clusterActivity.overallSignal === 'BULLISH' ? 1 : -1);
        }

        // 3. Role-based score (+/- 15 points)
        score += (roleAnalysis.weightedScore / 100) * 15;

        // 4. Conviction (+10 points)
        const avgConviction = convictionScores.averageConviction;
        score += (avgConviction / 100) * 10;

        // 5. Timing patterns (-10 points si suspect)
        if (timingPatterns.hasSignificantTiming && timingPatterns.riskLevel === 'HIGH') {
            score -= 10;
        }

        // 6. CEO/CFO divergence (-15 points si red flag)
        if (divergenceAnalysis.detected && divergenceAnalysis.redFlag) {
            score -= 15;
        }

        return {
            score: Math.max(0, Math.min(100, Math.round(score))),
            label: this.getScoreLabel(score),
            components: {
                sentiment: insiderSentiment.score,
                cluster: clusterActivity.detected ? 15 : 0,
                role: roleAnalysis.weightedScore,
                conviction: avgConviction,
                timing: timingPatterns.riskLevel === 'HIGH' ? -10 : 0,
                divergence: divergenceAnalysis.redFlag ? -15 : 0
            }
        };
    }

    /**
     * 🚨 SMART ALERTS GENERATION
     */
    generateSmartAlerts(data) {
        const alerts = [];

        // Alert 1: Cluster buying détecté
        if (data.clusterActivity.detected && data.clusterActivity.clusters.length > 0) {
            const topCluster = data.clusterActivity.clusters[0];
            alerts.push({
                type: 'CLUSTER_BUYING',
                severity: topCluster.severity,
                title: `${topCluster.insiderCount} insiders achètent simultanément`,
                description: `Valeur totale: $${this.formatNumber(topCluster.totalValue)}`,
                confidence: topCluster.confidence,
                signal: 'BULLISH',
                data: topCluster,
                timestamp: new Date().toISOString()
            });
        }

        // Alert 2: CEO/CFO divergence
        if (data.divergenceAnalysis.detected && data.divergenceAnalysis.redFlag) {
            alerts.push({
                type: 'CEO_CFO_DIVERGENCE',
                severity: 'HIGH',
                title: '⚠ Divergence CEO/CFO détectée',
                description: `CEO: ${data.divergenceAnalysis.ceo.direction}, CFO: ${data.divergenceAnalysis.cfo.direction}`,
                confidence: 85,
                signal: 'WARNING',
                data: data.divergenceAnalysis,
                timestamp: new Date().toISOString()
            });
        }

        // Alert 3: Activité pré-earnings suspecte
        if (data.timingPatterns.hasSignificantTiming && 
            data.timingPatterns.preEarningsActivity.count > 0) {
            alerts.push({
                type: 'PRE_EARNINGS_ACTIVITY',
                severity: data.timingPatterns.riskLevel,
                title: 'Activité insider avant earnings',
                description: `${data.timingPatterns.preEarningsActivity.count} transactions suspectes`,
                confidence: 70,
                signal: data.timingPatterns.preEarningsActivity.signal,
                data: data.timingPatterns.preEarningsActivity,
                timestamp: new Date().toISOString()
            });
        }

        // Alert 4: C-level achète massivement
        const ceoData = data.roleAnalysis.byRole.CEO;
        const cfoData = data.roleAnalysis.byRole.CFO;
        
        if (ceoData && ceoData.purchaseValue > 1000000) {
            alerts.push({
                type: 'CEO_MAJOR_PURCHASE',
                severity: 'HIGH',
                title: 'CEO achète massivement',
                description: `Valeur: $${this.formatNumber(ceoData.purchaseValue)}`,
                confidence: 90,
                signal: 'BULLISH',
                data: ceoData,
                timestamp: new Date().toISOString()
            });
        }

        if (cfoData && cfoData.saleValue > 500000) {
            alerts.push({
                type: 'CFO_MAJOR_SALE',
                severity: 'MEDIUM',
                title: 'CFO vend massivement',
                description: `Valeur: $${this.formatNumber(cfoData.saleValue)}`,
                confidence: 75,
                signal: 'BEARISH',
                data: cfoData,
                timestamp: new Date().toISOString()
            });
        }

        // Alert 5: Score global extrême
        if (data.overallScore.score >= 80) {
            alerts.push({
                type: 'STRONG_BUY_SIGNAL',
                severity: 'HIGH',
                title: '🚀 Signal d\'achat fort des insiders',
                description: `Score: ${data.overallScore.score}/100`,
                confidence: 95,
                signal: 'STRONG_BUY',
                data: data.overallScore,
                timestamp: new Date().toISOString()
            });
        } else if (data.overallScore.score <= 20) {
            alerts.push({
                type: 'STRONG_SELL_SIGNAL',
                severity: 'HIGH',
                title: '⚠ Signal de vente fort des insiders',
                description: `Score: ${data.overallScore.score}/100`,
                confidence: 90,
                signal: 'STRONG_SELL',
                data: data.overallScore,
                timestamp: new Date().toISOString()
            });
        }

        return alerts.sort((a, b) => {
            const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    }

    /**
     * 💡 RECOMMENDATION GENERATION
     */
    generateRecommendation(overallScore, alerts) {
        const score = overallScore.score;
        
        let action, confidence, rationale = [];

        if (score >= 75) {
            action = 'STRONG BUY';
            confidence = 'HIGH';
            rationale.push('Forte activité d\'achat des insiders');
        } else if (score >= 60) {
            action = 'BUY';
            confidence = 'MEDIUM';
            rationale.push('Sentiment insider positif');
        } else if (score >= 40) {
            action = 'HOLD';
            confidence = 'LOW';
            rationale.push('Activité insider mixte');
        } else if (score >= 25) {
            action = 'SELL';
            confidence = 'MEDIUM';
            rationale.push('Sentiment insider négatif');
        } else {
            action = 'STRONG SELL';
            confidence = 'HIGH';
            rationale.push('Forte activité de vente des insiders');
        }

        // Ajoute les rationales des alertes majeures
        alerts.filter(a => a.severity === 'HIGH').forEach(alert => {
            if (alert.type === 'CLUSTER_BUYING') {
                rationale.push('Cluster buying détecté');
            }
            if (alert.type === 'CEO_CFO_DIVERGENCE') {
                rationale.push('⚠ Divergence CEO/CFO (red flag)');
            }
        });

        return {
            action,
            confidence,
            score: overallScore.score,
            rationale: rationale.slice(0, 5), // Max 5 raisons
            timestamp: new Date().toISOString()
        };
    }

    /**
     * 🔧 HELPER METHODS
     */

    calculateClusterConfidence(insiderCount, totalValue) {
        let confidence = 50;
        confidence += Math.min(insiderCount * 10, 30); // +30 max pour nombre d'insiders
        confidence += totalValue > 5000000 ? 20 : totalValue > 1000000 ? 10 : 0;
        return Math.min(100, confidence);
    }

    calculateClusterSeverity(insiderCount, totalValue) {
        if (insiderCount >= 5 && totalValue > 5000000) return 'HIGH';
        if (insiderCount >= 3 && totalValue > 1000000) return 'MEDIUM';
        return 'LOW';
    }

    deduplicateClusters(clusters) {
        return clusters.filter((cluster, index) => {
            return !clusters.some((other, otherIndex) => {
                if (index >= otherIndex) return false;
                const timeDiff = Math.abs(cluster.startDate - other.startDate) / (1000 * 60 * 60 * 24);
                return timeDiff < 7 && other.confidence > cluster.confidence;
            });
        });
    }

    extractInsiderRoles(transactions) {
        const roles = new Set();
        transactions.forEach(t => {
            if (t.reportingOwner?.classification) {
                roles.add(t.reportingOwner.classification);
            }
        });
        return Array.from(roles);
    }

    calculateClusterSignal(clusters) {
        if (clusters.length === 0) return 'NEUTRAL';
        const avgConfidence = clusters.reduce((sum, c) => sum + c.confidence, 0) / clusters.length;
        if (avgConfidence >= 80) return 'STRONG_BULLISH';
        if (avgConfidence >= 60) return 'BULLISH';
        return 'MODERATE_BULLISH';
    }

    getSentimentLabel(score) {
        if (score >= 75) return 'VERY BULLISH';
        if (score >= 50) return 'BULLISH';
        if (score >= 25) return 'SLIGHTLY BULLISH';
        if (score >= -25) return 'NEUTRAL';
        if (score >= -50) return 'SLIGHTLY BEARISH';
        if (score >= -75) return 'BEARISH';
        return 'VERY BEARISH';
    }

    calculateIntensity(totalValue, totalCount) {
        if (totalValue > 10000000 || totalCount > 20) return 'VERY HIGH';
        if (totalValue > 5000000 || totalCount > 10) return 'HIGH';
        if (totalValue > 1000000 || totalCount > 5) return 'MEDIUM';
        return 'LOW';
    }

    calculateSentimentTrend(transactions) {
        // Simplifié: compare première moitié vs deuxième moitié
        const mid = Math.floor(transactions.length / 2);
        const firstHalf = transactions.slice(0, mid);
        const secondHalf = transactions.slice(mid);

        // ✅ CORRECTION: Appelle avec { includeTrend: false } pour éviter la récursion
        const firstSentiment = this.calculateInsiderSentiment(firstHalf, { includeTrend: false }).score;
        const secondSentiment = this.calculateInsiderSentiment(secondHalf, { includeTrend: false }).score;

        if (secondSentiment > firstSentiment + 20) return 'IMPROVING';
        if (secondSentiment < firstSentiment - 20) return 'DETERIORATING';
        return 'STABLE';
    }

    calculateRoleScore(role, purchaseValue, saleValue) {
        const netValue = purchaseValue - saleValue;
        const totalValue = purchaseValue + saleValue;
        if (totalValue === 0) return 0;
        
        const ratio = netValue / totalValue;
        return Math.round(ratio * 100);
    }

    getRoleWeight(role) {
        const weights = {
            'CEO': 1.0,
            'CFO': 0.9,
            'CTO': 0.7,
            'COO': 0.7,
            'President': 0.8,
            'Director': 0.6,
            '10% Owner': 0.8,
            'Officer': 0.5,
            'Other': 0.3
        };
        return weights[role] || 0.3;
    }

    getMostActiveRole(roleScores) {
        let maxActivity = 0;
        let mostActive = null;
        
        Object.entries(roleScores).forEach(([role, data]) => {
            const activity = data.purchaseCount + data.saleCount;
            if (activity > maxActivity) {
                maxActivity = activity;
                mostActive = { role, ...data };
            }
        });
        
        return mostActive;
    }

    getMostBullishRole(roleScores) {
        let maxScore = -Infinity;
        let mostBullish = null;
        
        Object.entries(roleScores).forEach(([role, data]) => {
            if (data.score > maxScore) {
                maxScore = data.score;
                mostBullish = { role, ...data };
            }
        });
        
        return mostBullish;
    }

    getMostBearishRole(roleScores) {
        let minScore = Infinity;
        let mostBearish = null;
        
        Object.entries(roleScores).forEach(([role, data]) => {
            if (data.score < minScore) {
                minScore = data.score;
                mostBearish = { role, ...data };
            }
        });
        
        return mostBearish;
    }

    calculateWeightedRoleScore(roleScores) {
        let weightedSum = 0;
        let totalWeight = 0;
        
        Object.entries(roleScores).forEach(([role, data]) => {
            const weight = data.weight;
            weightedSum += data.score * weight;
            totalWeight += weight;
        });
        
        return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    }

    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    isNearQuarterEnd(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        // Derniers 14 jours avant fin de quarter (Mars, Juin, Sept, Déc)
        const quarterEndMonths = [3, 6, 9, 12];
        if (quarterEndMonths.includes(month)) {
            return day >= 17; // 14 derniers jours du mois
        }
        
        return false;
    }

    daysUntilQuarterEnd(date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        const quarterEndMonths = [3, 6, 9, 12];
        const nextQuarter = quarterEndMonths.find(m => m >= month) || 12;
        
        const quarterEndDate = new Date(date.getFullYear(), nextQuarter - 1, 30);
        return Math.ceil((quarterEndDate - date) / (1000 * 60 * 60 * 24));
    }

    calculateSuspicionLevel(netValue, role) {
        const threshold = this.thresholds.significantTransaction[role.toLowerCase() + 'MinValue'] || 100000;
        
        if (Math.abs(netValue) > threshold * 5) return 'VERY_HIGH';
        if (Math.abs(netValue) > threshold * 2) return 'HIGH';
        if (Math.abs(netValue) > threshold) return 'MEDIUM';
        return 'LOW';
    }

    isUnusualTransaction(txn, allTransactions) {
        const totalValue = (txn.nonDerivativeTransactions || [])
            .reduce((sum, nt) => sum + nt.totalValue, 0);

        // Calcule la moyenne et l'écart-type
        const values = allTransactions.map(t => 
            (t.nonDerivativeTransactions || []).reduce((sum, nt) => sum + nt.totalValue, 0)
        );
        
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        // Transaction inhabituelle si > 2 écarts-types
        const zScore = (totalValue - mean) / stdDev;
        
        if (Math.abs(zScore) > 2) {
            return {
                detected: true,
                reason: zScore > 0 ? 'Unusually large transaction' : 'Unusually small transaction',
                metrics: {
                    value: totalValue,
                    mean,
                    stdDev,
                    zScore: Math.round(zScore * 100) / 100
                }
            };
        }

        return { detected: false };
    }

    aggregateSignal(transactions) {
        const netValue = transactions.reduce((sum, t) => sum + t.netValue, 0);
        if (netValue > 0) return 'BULLISH';
        if (netValue < 0) return 'BEARISH';
        return 'NEUTRAL';
    }

    calculateTimingRiskLevel(patterns) {
        const preEarningsCount = patterns.preEarnings.length;
        const unusualCount = patterns.unusual.length;
        
        if (preEarningsCount > 5 || unusualCount > 3) return 'HIGH';
        if (preEarningsCount > 2 || unusualCount > 1) return 'MEDIUM';
        return 'LOW';
    }

    getConvictionThreshold(role) {
        return this.thresholds.significantTransaction[role.toLowerCase() + 'MinValue'] || 100000;
    }

    getConvictionLevel(value) {
        const t = this.thresholds.conviction;
        if (value > t.veryHigh) return 'VERY_HIGH';
        if (value > t.high) return 'HIGH';
        if (value > t.medium) return 'MEDIUM';
        if (value > t.low) return 'LOW';
        return 'VERY_LOW';
    }

    calculateConvictionScore(value, threshold) {
        const ratio = value / threshold;
        return Math.min(100, Math.round(ratio * 20)); // Max 100
    }

    calculateRoleSentiment(transactions) {
        const sentiment = this.calculateInsiderSentiment(transactions, { includeTrend: false });
        return sentiment.score;
    }

    getDivergenceSeverity(score) {
        if (score > 150) return 'CRITICAL';
        if (score > 100) return 'HIGH';
        if (score > 50) return 'MEDIUM';
        return 'LOW';
    }

    interpretDivergence(ceoSentiment, cfoSentiment) {
        if (ceoSentiment < 0 && cfoSentiment > 0) {
            return '⚠ RED FLAG: CEO vend alors que CFO achète. Possible désaccord stratégique ou diversification personnelle du CEO.';
        }
        if (ceoSentiment > 0 && cfoSentiment < 0) {
            return '⚠ ATTENTION: CEO achète mais CFO vend. CFO peut avoir besoin de liquidités ou doute de la valorisation.';
        }
        return 'Alignment normal entre CEO et CFO.';
    }

    calculateNetworkDensity(nodeCount, edgeCount) {
        if (nodeCount < 2) return 0;
        const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
        return edgeCount / maxEdges;
    }

    findCentralInsiders(nodes, edges) {
        // Calcule le degré de centralité (nombre de connexions)
        const degrees = new Map();
        nodes.forEach(n => degrees.set(n.id, 0));
        
        edges.forEach(e => {
            degrees.set(e.source, degrees.get(e.source) + 1);
            degrees.set(e.target, degrees.get(e.target) + 1);
        });

        return nodes
            .map(n => ({ ...n, centrality: degrees.get(n.id) }))
            .sort((a, b) => b.centrality - a.centrality)
            .slice(0, 5);
    }

    detectCommunities(nodes, edges) {
        // Algorithme simplifié de détection de communautés
        // Pour une vraie implémentation, utiliser Louvain ou autre algorithme avancé
        return [{
            id: 1,
            members: nodes.map(n => n.id),
            size: nodes.length
        }];
    }

    getScoreLabel(score) {
        if (score >= 80) return 'TRÈS POSITIF';
        if (score >= 60) return 'POSITIF';
        if (score >= 40) return 'NEUTRE';
        if (score >= 20) return 'NÉGATIF';
        return 'TRÈS NÉGATIF';
    }

    assessDataQuality(transactions) {
        if (transactions.length > 50) return 'EXCELLENT';
        if (transactions.length > 20) return 'GOOD';
        if (transactions.length > 10) return 'FAIR';
        return 'LIMITED';
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    }
}

// Export global
window.InsiderAnalyticsEngine = InsiderAnalyticsEngine;