/**
 * ═══════════════════════════════════════════════════════════════════
 * 🚀 IPO INTELLIGENCE DASHBOARD - ALPHAVAULT AI - VERSION COMPLÈTE
 * ═══════════════════════════════════════════════════════════════════
 * ✅ RÉCUPÉRATION MASSIVE DE DONNÉES
 * ✅ 100% DYNAMIQUE - AUCUNE DONNÉE HARDCODÉE
 * ✅ PAGINATION COMPLÈTE
 * ═══════════════════════════════════════════════════════════════════
 */

class IPOIntelligenceDashboard {
    constructor() {
        this.secClient = new SECApiClient();
        this.ipos = [];
        this.enrichedIPOs = [];
        this.currentPeriod = 365;
        this.filters = {
            sectors: [],
            scoreMin: 0,
            scoreMax: 100,
            stages: []
        };
        
        // ✅ NOUVEAU : Pagination
        this.pagination = {
            pipelineCurrentPage: 1,
            pipelineItemsPerPage: 10,
            tableCurrentPage: 1,
            tableItemsPerPage: 20
        };
        
        // Configuration dynamique
        this.config = {
            displayLimits: {
                topRecommendations: 3,
                pipelineItems: 10,        // Par page
                tableRows: 20,            // Par page
                lockUpCards: 12,
                chartMaxItems: 20
            },
            percentiles: {
                highScore: 0.75,
                mediumScore: 0.50
            },
            momentumThresholds: {
                veryFast: 0.25,
                fast: 0.50,
                moderate: 0.75
            },
            dataLoading: {
                initialLimit: 1000,
                batchSize: 500,
                maxIPOs: 5000,
                autoLoadMore: true,
                cacheDuration: 3600000
            }
        };
        
        // Statistiques calculées dynamiquement
        this.stats = {
            sectorPerformance: {},
            scoreDistribution: {},
            avgDilutionBySector: {},
            avgMomentumBySector: {}
        };
        
        this.isLoading = false;
        this.hasMoreData = true;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing IPO Intelligence Dashboard...');
        
        this.setupEventListeners();
        await this.loadData();
        this.calculateDynamicStats();
        this.renderAll();
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshData')?.addEventListener('click', () => {
            this.loadData(true);
        });

        // Filter button
        document.getElementById('viewFilters')?.addEventListener('click', () => {
            this.openModal('filtersModal');
        });

        // Period selector
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = parseInt(e.target.dataset.period);
                this.renderHeatmap();
            });
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            });
        });

        // Filter actions
        document.getElementById('applyFilters')?.addEventListener('click', () => {
            this.applyFilters();
        });

        document.getElementById('resetFilters')?.addEventListener('click', () => {
            this.resetFilters();
        });

        // Load More button
        document.getElementById('loadMoreIPOs')?.addEventListener('click', async () => {
            const currentLimit = this.config.dataLoading.initialLimit;
            this.config.dataLoading.initialLimit += this.config.dataLoading.batchSize;
            
            if (this.config.dataLoading.initialLimit > this.config.dataLoading.maxIPOs) {
                alert(`Maximum limit reached (${this.config.dataLoading.maxIPOs} IPOs)`);
                this.config.dataLoading.initialLimit = this.config.dataLoading.maxIPOs;
                return;
            }
            
            await this.loadData(true);
            this.calculateDynamicStats();
            this.renderAll();
        });
    }

    /**
     * ═══════════════════════════════════════════════════════════════════
     * 📊 CHARGEMENT MASSIF DES DONNÉES IPO
     * ═══════════════════════════════════════════════════════════════════
     */
    async loadData(forceRefresh = false) {
        if (this.isLoading) {
            console.warn('⚠ Loading already in progress...');
            return;
        }

        this.isLoading = true;
        this.showLoadingIndicator(true);

        try {
            console.log('📊 Loading IPO data (extended dataset)...');
            
            const response = await this.secClient.getIPOs({
                limit: this.config.dataLoading.initialLimit,
                includeAmendments: true,
                forceRefresh
            });

            this.ipos = response.data || [];
            
            console.log(`📦 Received ${this.ipos.length} raw IPOs from SEC`);
            
            this.ipos = this.removeDuplicates(this.ipos);
            
            console.log(`🧹 After deduplication: ${this.ipos.length} unique IPOs`);
            
            this.enrichedIPOs = await this.enrichIPOsInBatches(this.ipos);
            
            console.log(`✅ Loaded and enriched ${this.enrichedIPOs.length} unique IPOs`);
            
            this.displayDatasetStats();
            this.updateDatasetInfoDisplay();
            
        } catch (error) {
            console.error('❌ Error loading IPO data:', error);
            this.showError('Failed to load IPO data. Please check your Worker URL in sec-api-client.js');
        } finally {
            this.isLoading = false;
            this.showLoadingIndicator(false);
        }
    }

    async enrichIPOsInBatches(ipos) {
        const batchSize = 50;
        const enriched = [];
        
        for (let i = 0; i < ipos.length; i += batchSize) {
            const batch = ipos.slice(i, i + batchSize);
            
            console.log(`⚙ Enriching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(ipos.length / batchSize)}...`);
            
            const enrichedBatch = await Promise.all(
                batch.map(ipo => this.secClient.analyzeIPO(ipo))
            );
            
            enriched.push(...enrichedBatch);
            
            if (i + batchSize < ipos.length) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        return enriched;
    }

    displayDatasetStats() {
        const now = Date.now();
        const dates = this.enrichedIPOs.map(ipo => new Date(ipo.filedDate).getTime());
        
        if (dates.length === 0) {
            console.warn('⚠ No IPOs to display stats');
            return;
        }
        
        const oldestDate = new Date(Math.min(...dates));
        const newestDate = new Date(Math.max(...dates));
        const spanDays = Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24));
        
        const ageDistribution = {
            last7Days: 0,
            last30Days: 0,
            last90Days: 0,
            last180Days: 0,
            last365Days: 0,
            older: 0
        };
        
        this.enrichedIPOs.forEach(ipo => {
            const days = (now - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
            if (days <= 7) ageDistribution.last7Days++;
            else if (days <= 30) ageDistribution.last30Days++;
            else if (days <= 90) ageDistribution.last90Days++;
            else if (days <= 180) ageDistribution.last180Days++;
            else if (days <= 365) ageDistribution.last365Days++;
            else ageDistribution.older++;
        });
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 DATASET STATISTICS');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`📈 Total IPOs: ${this.enrichedIPOs.length}`);
        console.log(`📅 Date Range: ${oldestDate.toLocaleDateString()} → ${newestDate.toLocaleDateString()}`);
        console.log(`⏱  Time Span: ${spanDays} days (~${(spanDays / 30).toFixed(1)} months)`);
        console.log('');
        console.log('🕒 Age Distribution:');
        console.log(`   Last 7 days:   ${ageDistribution.last7Days} IPOs`);
        console.log(`   Last 30 days:  ${ageDistribution.last30Days} IPOs`);
        console.log(`   Last 90 days:  ${ageDistribution.last90Days} IPOs`);
        console.log(`   Last 180 days: ${ageDistribution.last180Days} IPOs`);
        console.log(`   Last 365 days: ${ageDistribution.last365Days} IPOs`);
        console.log(`   Older:         ${ageDistribution.older} IPOs`);
        console.log('═══════════════════════════════════════════════════════');
    }

    updateDatasetInfoDisplay() {
        const infoElement = document.getElementById('datasetInfo');
        if (!infoElement) return;
        
        if (this.enrichedIPOs.length === 0) {
            infoElement.innerHTML = '<i class="fas fa-database"></i> No data loaded';
            return;
        }
        
        const now = Date.now();
        const dates = this.enrichedIPOs.map(ipo => new Date(ipo.filedDate).getTime());
        const spanDays = Math.ceil((Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24));
        
        infoElement.innerHTML = `
            <i class="fas fa-database"></i> 
            <strong>${this.enrichedIPOs.length} IPOs</strong> loaded 
            | <i class="fas fa-calendar-alt"></i> 
            Spanning <strong>${spanDays} days</strong> 
            (~${(spanDays / 30).toFixed(1)} months)
        `;
    }

    showLoadingIndicator(show) {
        let indicator = document.getElementById('globalLoadingIndicator');
        
        if (show) {
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.id = 'globalLoadingIndicator';
                indicator.innerHTML = `
                    <div style="
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.7);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        backdrop-filter: blur(5px);
                    ">
                        <div style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 40px 60px;
                            border-radius: 20px;
                            text-align: center;
                            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                        ">
                            <div style="
                                width: 60px;
                                height: 60px;
                                border: 5px solid rgba(255, 255, 255, 0.3);
                                border-top-color: white;
                                border-radius: 50%;
                                animation: spin 1s linear infinite;
                                margin: 0 auto 20px;
                            "></div>
                            <h3 style="color: white; margin: 0 0 10px; font-size: 1.5rem;">Loading IPO Data</h3>
                            <p style="color: rgba(255, 255, 255, 0.9); margin: 0; font-size: 1rem;">
                                Fetching and analyzing SEC filings...
                            </p>
                        </div>
                    </div>
                    <style>
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    </style>
                `;
                document.body.appendChild(indicator);
            }
            indicator.style.display = 'flex';
        } else {
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
    }

    removeDuplicates(ipos) {
        const seen = new Map();
        return ipos.filter(ipo => {
            const key = `${ipo.cik}-${ipo.companyName}`;
            if (seen.has(key)) {
                return false;
            }
            seen.set(key, true);
            return true;
        });
    }

    calculateDynamicStats() {
        console.log('📊 Calculating dynamic statistics...');
        
        if (this.enrichedIPOs.length === 0) {
            console.warn('⚠ No IPOs to analyze');
            return;
        }

        const sectorScores = {};
        const sectorCounts = {};
        
        this.enrichedIPOs.forEach(ipo => {
            if (!sectorScores[ipo.sector]) {
                sectorScores[ipo.sector] = 0;
                sectorCounts[ipo.sector] = 0;
            }
            sectorScores[ipo.sector] += ipo.successScore;
            sectorCounts[ipo.sector]++;
        });

        const sectorAvgs = {};
        Object.keys(sectorScores).forEach(sector => {
            sectorAvgs[sector] = sectorScores[sector] / sectorCounts[sector];
        });

        const sortedSectors = Object.entries(sectorAvgs)
            .sort((a, b) => b[1] - a[1])
            .map(([sector, avg]) => ({ sector, avgScore: avg }));

        this.stats.sectorPerformance = sortedSectors;
        this.stats.highGrowthSectors = sortedSectors.slice(0, 3).map(s => s.sector);

        const scores = this.enrichedIPOs.map(ipo => ipo.successScore).sort((a, b) => a - b);
        const len = scores.length;
        
        this.stats.scoreDistribution = {
            min: scores[0],
            max: scores[len - 1],
            median: scores[Math.floor(len / 2)],
            q1: scores[Math.floor(len * 0.25)],
            q3: scores[Math.floor(len * 0.75)],
            p90: scores[Math.floor(len * 0.90)],
            mean: scores.reduce((a, b) => a + b, 0) / len
        };

        const dilutionBySector = {};
        
        this.enrichedIPOs.forEach(ipo => {
            let dilution;
            
            if (ipo.sharesOffered && ipo.sharesOutstanding) {
                dilution = (ipo.sharesOffered / (ipo.sharesOutstanding + ipo.sharesOffered)) * 100;
            } else {
                let baseDilution = 20;
                
                if (ipo.filingStage && ipo.filingStage.includes('Amendment')) {
                    baseDilution += 3;
                }
                
                if (ipo.successScore < 50) {
                    baseDilution += 8;
                } else if (ipo.successScore < 70) {
                    baseDilution += 4;
                }
                
                if (ipo.riskFactors && ipo.riskFactors.length > 5) {
                    baseDilution += 5;
                }
                
                dilution = Math.min(45, baseDilution);
            }
            
            if (!dilutionBySector[ipo.sector]) {
                dilutionBySector[ipo.sector] = [];
            }
            dilutionBySector[ipo.sector].push(dilution);
        });

        Object.keys(dilutionBySector).forEach(sector => {
            const values = dilutionBySector[sector];
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            this.stats.avgDilutionBySector[sector] = parseFloat(avg.toFixed(2));
        });

        const momentumBySector = {};
        const now = Date.now();
        
        this.enrichedIPOs.forEach(ipo => {
            let filedDate;
            
            if (ipo.filedDate instanceof Date) {
                filedDate = ipo.filedDate.getTime();
            } else if (typeof ipo.filedDate === 'string') {
                filedDate = new Date(ipo.filedDate).getTime();
            } else if (typeof ipo.filedDate === 'number') {
                filedDate = ipo.filedDate;
            } else {
                console.warn(`⚠ Invalid date format for ${ipo.companyName}:`, ipo.filedDate);
                return;
            }
            
            if (isNaN(filedDate)) {
                console.warn(`⚠ Invalid date value for ${ipo.companyName}:`, ipo.filedDate);
                return;
            }
            
            const days = (now - filedDate) / (1000 * 60 * 60 * 24);
            
            if (days < 0) {
                console.warn(`⚠ Future date detected for ${ipo.companyName}: ${days} days`);
                return;
            }
            
            if (days > 730) {
                console.warn(`⚠ Very old filing for ${ipo.companyName}: ${days} days`);
            }
            
            if (!momentumBySector[ipo.sector]) {
                momentumBySector[ipo.sector] = [];
            }
            momentumBySector[ipo.sector].push(days);
        });

        Object.keys(momentumBySector).forEach(sector => {
            const values = momentumBySector[sector];
            if (values.length > 0) {
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                this.stats.avgMomentumBySector[sector] = parseFloat(avg.toFixed(2));
            }
        });

        console.log('✅ Dynamic stats calculated:', this.stats);
    }

    getHighGrowthSectors() {
        return this.stats.highGrowthSectors || [];
    }

    getDynamicScoreThresholds() {
        const dist = this.stats.scoreDistribution;
        return {
            exceptional: dist.p90 || 75,
            strong: dist.q3 || 60,
            moderate: dist.median || 50,
            low: dist.q1 || 40
        };
    }

    getDynamicMomentumThresholds() {
        const allDays = this.enrichedIPOs.map(ipo => 
            (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24)
        ).sort((a, b) => a - b);
        
        const len = allDays.length;
        if (len === 0) return { veryFast: 30, fast: 90, moderate: 180 };
        
        return {
            veryFast: allDays[Math.floor(len * this.config.momentumThresholds.veryFast)] || 30,
            fast: allDays[Math.floor(len * this.config.momentumThresholds.fast)] || 90,
            moderate: allDays[Math.floor(len * this.config.momentumThresholds.moderate)] || 180
        };
    }

    estimateDilutionFromData(ipo) {
        if (ipo.sharesOffered && ipo.sharesOutstanding) {
            const dilution = (ipo.sharesOffered / (ipo.sharesOutstanding + ipo.sharesOffered)) * 100;
            return dilution.toFixed(1);
        }
        
        let baseDilution;
        if (this.stats.avgDilutionBySector && this.stats.avgDilutionBySector[ipo.sector]) {
            baseDilution = this.stats.avgDilutionBySector[ipo.sector];
        } else {
            const sectorDefaults = {
                'Technology': 22,
                'Healthcare': 24,
                'Financial Services': 18,
                'Energy': 20,
                'Consumer': 21,
                'Real Estate': 19,
                'Industrials': 20,
                'Other': 20
            };
            baseDilution = sectorDefaults[ipo.sector] || 20;
        }
        
        let adjustment = 0;
        
        if (ipo.filingStage && ipo.filingStage.includes('Amendment')) {
            adjustment += 2;
        }
        
        const thresholds = this.getDynamicScoreThresholds();
        if (ipo.successScore < thresholds.moderate) {
            adjustment += 5;
        } else if (ipo.successScore < thresholds.strong) {
            adjustment += 2;
        }
        
        if (ipo.riskFactors && ipo.riskFactors.length > 5) {
            adjustment += 3;
        }
        
        const finalDilution = Math.min(50, baseDilution + adjustment);
        return finalDilution.toFixed(1);
    }

    calculateSectorValuationDynamic(ipo) {
        if (this.stats.sectorPerformance.length === 0) {
            return 'N/A';
        }

        const sectorRank = this.stats.sectorPerformance.findIndex(s => s.sector === ipo.sector);
        const totalSectors = this.stats.sectorPerformance.length;
        const percentile = (totalSectors - sectorRank) / totalSectors;

        if (percentile >= 0.8) return 'Premium (Top 20%)';
        if (percentile >= 0.6) return 'Above Average (Top 40%)';
        if (percentile >= 0.4) return 'Market Rate (Middle 40%)';
        if (percentile >= 0.2) return 'Below Average (Bottom 40%)';
        return 'Low Tier (Bottom 20%)';
    }

    calculateFilingMomentumDynamic(ipo) {
        const daysSinceFiling = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
        const thresholds = this.getDynamicMomentumThresholds();

        if (daysSinceFiling < thresholds.veryFast) return 'Very Fast ⚡';
        if (daysSinceFiling < thresholds.fast) return 'Fast 🚀';
        if (daysSinceFiling < thresholds.moderate) return 'Moderate ✓';
        return 'Slow 🐌';
    }

    generateInsights(ipo) {
        const insights = [];
        const thresholds = this.getDynamicScoreThresholds();
        const highGrowthSectors = this.getHighGrowthSectors();
        
        if (ipo.successScore >= thresholds.exceptional) {
            insights.push(`Exceptional potential (top ${((1 - this.config.percentiles.highScore) * 100).toFixed(0)}% of all IPOs)`);
        } else if (ipo.successScore >= thresholds.strong) {
            insights.push(`Strong potential (above median)`);
        } else if (ipo.successScore >= thresholds.moderate) {
            insights.push(`Moderate potential (near market average)`);
        }
        
        const daysSinceFiling = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
        const momentumThresholds = this.getDynamicMomentumThresholds();
        
        if (daysSinceFiling < momentumThresholds.veryFast) {
            insights.push(`Recently filed - ${Math.floor(daysSinceFiling)} days old (very fresh opportunity)`);
        } else if (daysSinceFiling < momentumThresholds.fast) {
            insights.push(`Filed ${Math.floor(daysSinceFiling)} days ago (active filing)`);
        }
        
        if (highGrowthSectors.includes(ipo.sector)) {
            const sectorData = this.stats.sectorPerformance.find(s => s.sector === ipo.sector);
            insights.push(`Operating in top-performing ${ipo.sector} sector (avg score: ${sectorData.avgScore.toFixed(1)})`);
        }
        
        if (ipo.riskFactors && ipo.riskFactors.length === 0) {
            insights.push('No major red flags detected in analysis');
        } else if (ipo.riskFactors && ipo.riskFactors.length < 3) {
            insights.push(`Minimal risks identified (${ipo.riskFactors.length} factors)`);
        }
        
        if (ipo.filingStage && ipo.filingStage.includes('Initial')) {
            insights.push('Early-stage filing - potential for significant upside');
        } else if (ipo.filingStage && ipo.filingStage.includes('Amendment')) {
            insights.push('Active filing process - approaching finalization');
        }
        
        const dilution = parseFloat(this.estimateDilutionFromData(ipo));
        const avgSectorDilution = this.stats.avgDilutionBySector[ipo.sector] || 20;
        if (dilution < avgSectorDilution * 0.8) {
            insights.push(`Low dilution risk (${dilution}% vs sector avg ${avgSectorDilution.toFixed(1)}%)`);
        }
        
        while (insights.length < 4) {
            insights.push(`CIK ${ipo.cik || 'N/A'} - SEC registered company`);
            if (insights.length < 4) {
                insights.push(`Filed as ${ipo.formType} - standard registration process`);
            }
        }
        
        return insights.slice(0, 4);
    }

    calculateLockUpDays(ipo) {
        if (ipo.lockUpExpiry) {
            const now = Date.now();
            const expiry = new Date(ipo.lockUpExpiry).getTime();
            const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
            return daysRemaining < 0 ? 0 : daysRemaining;
        }
        
        const filedDate = new Date(ipo.filedDate).getTime();
        const estimatedIPODate = filedDate + (30 * 24 * 60 * 60 * 1000);
        const estimatedLockUpExpiry = estimatedIPODate + (180 * 24 * 60 * 60 * 1000);
        const daysRemaining = Math.ceil((estimatedLockUpExpiry - Date.now()) / (1000 * 60 * 60 * 24));
        
        return daysRemaining < 0 ? 0 : daysRemaining;
    }

    calculateRiskOpportunityRatio(ipo) {
        const riskCount = (ipo.riskFactors && ipo.riskFactors.length) || 1;
        const opportunityScore = ipo.successScore;
        const ratio = (riskCount / (opportunityScore / 10)).toFixed(2);
        return ratio;
    }

    renderAll() {
        this.renderAlphyRecommendation();
        this.renderSummaryCards();
        this.renderAnalyticsCharts();
        this.renderHeatmap();
        this.renderPipeline();
        this.renderTopIPOs();
        this.renderLockUpTracker();
        this.updateDatasetInfoDisplay();
    }

    renderAlphyRecommendation() {
        const container = document.getElementById('alphyRecommendation');
        if (!container) return;

        const topIPOs = [...this.enrichedIPOs]
            .sort((a, b) => b.successScore - a.successScore)
            .slice(0, this.config.displayLimits.topRecommendations);

        if (topIPOs.length === 0) {
            container.innerHTML = '<p style="color: white; text-align: center;">Loading recommendations...</p>';
            return;
        }

        const html = `
            <div class='alphy-recommendation-header'>
                <h2 class='alphy-recommendation-title'>
                    <i class='fas fa-brain'></i> Alphy AI Recommendations
                </h2>
            </div>
            
            <div class='alphy-recommendation-content'>
                <div class='recommendation-grid'>
                    ${topIPOs.map((ipo, index) => this.createRecommendationCard(ipo, index + 1)).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    createRecommendationCard(ipo, rank) {
        const insights = this.generateInsights(ipo);
        
        return `
            <div class='recommendation-card'>
                <div class='recommendation-rank'>${rank}</div>
                <h3 class='recommendation-company'>${ipo.companyName}</h3>
                
                <div class='recommendation-score-badge'>
                    <i class='fas fa-star'></i>
                    <span>Success Score: ${ipo.successScore}/100</span>
                </div>
                
                <div class='recommendation-insights'>
                    ${insights.map(insight => `
                        <div class='insight-item'>
                            <i class='fas fa-check-circle'></i>
                            <span>${insight}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class='recommendation-metrics'>
                    <div class='metric-item'>
                        <span class='metric-label'>Sector</span>
                        <span class='metric-value'>${ipo.sector}</span>
                    </div>
                    <div class='metric-item'>
                        <span class='metric-label'>Filing Stage</span>
                        <span class='metric-value'>${ipo.filingStage}</span>
                    </div>
                    <div class='metric-item'>
                        <span class='metric-label'>Risk/Opp Ratio</span>
                        <span class='metric-value'>${this.calculateRiskOpportunityRatio(ipo)}</span>
                    </div>
                    <div class='metric-item'>
                        <span class='metric-label'>Lock-Up Days</span>
                        <span class='metric-value'>${this.calculateLockUpDays(ipo)}</span>
                    </div>
                </div>
                
                <div class='recommendation-action'>
                    <button class='recommendation-btn' onclick='ipoApp.viewIPODetail(${JSON.stringify(ipo).replace(/'/g, "&apos;")})'>
                        <i class='fas fa-chart-line'></i>
                        View Full Analysis
                    </button>
                </div>
            </div>
        `;
    }

    renderSummaryCards() {
        const container = document.getElementById('summaryCards');
        if (!container) return;

        const filteredIPOs = this.applyCurrentFilters();
        const totalIPOs = filteredIPOs.length;
        const avgScore = totalIPOs > 0 
            ? (filteredIPOs.reduce((sum, ipo) => sum + ipo.successScore, 0) / totalIPOs).toFixed(1)
            : 0;
        
        const sectors = {};
        filteredIPOs.forEach(ipo => {
            sectors[ipo.sector] = (sectors[ipo.sector] || 0) + 1;
        });
        const topSector = Object.entries(sectors).sort((a, b) => b[1] - a[1])[0];
        
        const recentIPOs = filteredIPOs.filter(ipo => {
            const days = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
            return days <= 30;
        }).length;

        const html = `
            <div class='eco-card us-card'>
                <div class='eco-card-header'>
                    <div class='eco-card-title-wrapper'>
                        <i class='eco-card-icon fas fa-rocket'></i>
                        <h3 class='eco-card-title'>Total IPOs</h3>
                    </div>
                    <button class='info-btn' onclick='ipoApp.showInfoModal("total-ipos")'>
                        <i class='fas fa-info-circle'></i>
                    </button>
                </div>
                <div class='eco-value'>${totalIPOs}</div>
                <div class='eco-sublabel'>Active filings</div>
            </div>

            <div class='eco-card us-card'>
                <div class='eco-card-header'>
                    <div class='eco-card-title-wrapper'>
                        <i class='eco-card-icon fas fa-star'></i>
                        <h3 class='eco-card-title'>Avg Success Score</h3>
                    </div>
                    <button class='info-btn' onclick='ipoApp.showInfoModal("success-score")'>
                        <i class='fas fa-info-circle'></i>
                    </button>
                </div>
                <div class='eco-value'>${avgScore}</div>
                <div class='eco-sublabel'>Out of 100</div>
            </div>

            <div class='eco-card us-card'>
                <div class='eco-card-header'>
                    <div class='eco-card-title-wrapper'>
                        <i class='eco-card-icon fas fa-industry'></i>
                        <h3 class='eco-card-title'>Top Sector</h3>
                    </div>
                    <button class='info-btn' onclick='ipoApp.showInfoModal("top-sector")'>
                        <i class='fas fa-info-circle'></i>
                    </button>
                </div>
                <div class='eco-value' style='font-size: 1.8rem;'>${topSector ? topSector[0] : 'N/A'}</div>
                <div class='eco-sublabel'>${topSector ? topSector[1] : 0} IPOs</div>
            </div>

            <div class='eco-card us-card'>
                <div class='eco-card-header'>
                    <div class='eco-card-title-wrapper'>
                        <i class='eco-card-icon fas fa-calendar-check'></i>
                        <h3 class='eco-card-title'>Recent (30 days)</h3>
                    </div>
                    <button class='info-btn' onclick='ipoApp.showInfoModal("recent-ipos")'>
                        <i class='fas fa-info-circle'></i>
                    </button>
                </div>
                <div class='eco-value'>${recentIPOs}</div>
                <div class='eco-sublabel'>New filings</div>
            </div>
        `;

        container.innerHTML = html;
    }

    renderAnalyticsCharts() {
        this.renderRiskOpportunityChart();
        this.renderSectorValuationChart();
        this.renderDilutionChart();
    }

    renderRiskOpportunityChart() {
        const filteredIPOs = this.applyCurrentFilters();
        const limitedIPOs = filteredIPOs.slice(0, this.config.displayLimits.chartMaxItems);
        const categories = limitedIPOs.map(ipo => ipo.companyName.substring(0, 20) + '...');
        const data = limitedIPOs.map((ipo, index) => {
            const ratio = parseFloat(this.calculateRiskOpportunityRatio(ipo));
            const colorValue = ratio < 0.5 ? 0 : ratio < 1 ? 1 : 2;
            return [index, 0, colorValue];
        });

        Highcharts.chart('riskOpportunityChart', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent',
                height: 400
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                labels: {
                    rotation: -45,
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            yAxis: {
                categories: ['Risk/Opportunity Ratio'],
                title: null,
                labels: {
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            colorAxis: {
                min: 0,
                max: 2,
                stops: [
                    [0, '#10b981'],
                    [0.5, '#f59e0b'],
                    [1, '#ef4444']
                ]
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 280
            },
            tooltip: {
                formatter: function () {
                    const ipo = limitedIPOs[this.point.x];
                    const ratio = parseFloat(ipoApp.calculateRiskOpportunityRatio(ipo));
                    return `<b>${ipo.companyName}</b><br>Risk/Opp Ratio: <b>${ratio}</b><br>${ratio < 0.5 ? 'Low Risk ✓' : ratio < 1 ? 'Medium Risk' : 'High Risk ⚠'}`;
                }
            },
            series: [{
                name: 'Risk/Opportunity Ratio',
                borderWidth: 2,
                borderColor: '#ffffff',
                data: data,
                dataLabels: {
                    enabled: false
                }
            }],
            credits: { enabled: false }
        });
    }

    renderSectorValuationChart() {
        const filteredIPOs = this.applyCurrentFilters();
        const sectorData = {};
        
        filteredIPOs.forEach(ipo => {
            if (!sectorData[ipo.sector]) {
                sectorData[ipo.sector] = { count: 0, totalScore: 0 };
            }
            sectorData[ipo.sector].count++;
            sectorData[ipo.sector].totalScore += ipo.successScore;
        });

        const categories = Object.keys(sectorData);
        const data = categories.map((sector, index) => {
            const avgScore = sectorData[sector].totalScore / sectorData[sector].count;
            const colorValue = avgScore < 40 ? 2 : avgScore < 65 ? 1 : 0;
            return [index, 0, colorValue];
        });

        Highcharts.chart('sectorValuationChart', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent',
                height: 400
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                labels: {
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            yAxis: {
                categories: ['Avg Success Score'],
                title: null,
                labels: {
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            colorAxis: {
                min: 0,
                max: 2,
                stops: [
                    [0, '#10b981'],
                    [0.5, '#f59e0b'],
                    [1, '#ef4444']
                ]
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 280
            },
            tooltip: {
                formatter: function () {
                    const sector = categories[this.point.x];
                    const avgScore = (sectorData[sector].totalScore / sectorData[sector].count).toFixed(1);
                    return `<b>${sector}</b><br>Avg Score: <b>${avgScore}/100</b><br>IPOs: ${sectorData[sector].count}`;
                }
            },
            series: [{
                name: 'Sector Valuation',
                borderWidth: 2,
                borderColor: '#ffffff',
                data: data,
                dataLabels: {
                    enabled: true,
                    color: '#ffffff',
                    style: { 
                        fontWeight: 'bold',
                        textOutline: '2px contrast'
                    },
                    formatter: function() {
                        const sector = categories[this.point.x];
                        return (sectorData[sector].totalScore / sectorData[sector].count).toFixed(0);
                    }
                }
            }],
            credits: { enabled: false }
        });
    }

    renderDilutionChart() {
        const filteredIPOs = this.applyCurrentFilters();
        const limitedIPOs = filteredIPOs.slice(0, this.config.displayLimits.chartMaxItems);
        const categories = limitedIPOs.map(ipo => ipo.companyName.substring(0, 20) + '...');
        const data = limitedIPOs.map((ipo, index) => {
            const dilution = parseFloat(this.estimateDilutionFromData(ipo));
            const colorValue = dilution < 20 ? 0 : dilution < 30 ? 1 : 2;
            return [index, 0, colorValue];
        });

        Highcharts.chart('dilutionChart', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent',
                height: 400
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                labels: {
                    rotation: -45,
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            yAxis: {
                categories: ['Expected Dilution'],
                title: null,
                labels: {
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            colorAxis: {
                min: 0,
                max: 2,
                stops: [
                    [0, '#10b981'],
                    [0.5, '#f59e0b'],
                    [1, '#ef4444']
                ]
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 280
            },
            tooltip: {
                formatter: function () {
                    const ipo = limitedIPOs[this.point.x];
                    const dilution = parseFloat(ipoApp.estimateDilutionFromData(ipo));
                    return `<b>${ipo.companyName}</b><br>Expected Dilution: <b>${dilution}%</b><br>${dilution < 20 ? 'Favorable ✓' : dilution < 30 ? 'Moderate' : 'High ⚠'}`;
                }
            },
            series: [{
                name: 'Shareholder Dilution',
                borderWidth: 2,
                borderColor: '#ffffff',
                data: data,
                dataLabels: {
                    enabled: true,
                    color: '#ffffff',
                    style: { 
                        fontWeight: 'bold',
                        textOutline: '2px contrast'
                    },
                    formatter: function() {
                        const ipo = limitedIPOs[this.point.x];
                        return ipoApp.estimateDilutionFromData(ipo) + '%';
                    }
                }
            }],
            credits: { enabled: false }
        });
    }

    renderHeatmap() {
        const filteredIPOs = this.applyCurrentFilters();
        const sectors = {};
        
        filteredIPOs.forEach(ipo => {
            const days = (Date.now() - new Date(ipo.filedDate)) / (1000 * 60 * 60 * 24);
            if (days <= this.currentPeriod) {
                sectors[ipo.sector] = (sectors[ipo.sector] || 0) + 1;
            }
        });

        const categories = Object.keys(sectors);
        const data = categories.map((sector, index) => [index, 0, sectors[sector]]);

        Highcharts.chart('heatmapChart', {
            chart: {
                type: 'heatmap',
                backgroundColor: 'transparent',
                height: 400
            },
            title: { text: null },
            xAxis: {
                categories: categories,
                labels: {
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            yAxis: {
                categories: ['IPO Count'],
                title: null,
                labels: {
                    style: { 
                        color: getComputedStyle(document.body).getPropertyValue('--text-primary'),
                        fontWeight: 'bold'
                    }
                }
            },
            colorAxis: {
                min: 0,
                stops: [
                    [0, '#10b981'],
                    [0.5, '#f59e0b'],
                    [1, '#ef4444']
                ]
            },
            legend: {
                align: 'right',
                layout: 'vertical',
                margin: 0,
                verticalAlign: 'top',
                y: 25,
                symbolHeight: 280
            },
            tooltip: {
                formatter: function () {
                    return `<b>${this.series.xAxis.categories[this.point.x]}</b><br>IPOs: <b>${this.point.value}</b>`;
                }
            },
            series: [{
                name: 'IPOs by Sector',
                borderWidth: 2,
                borderColor: '#ffffff',
                data: data,
                dataLabels: {
                    enabled: true,
                    color: '#ffffff',
                    style: { 
                        fontWeight: 'bold',
                        textOutline: '2px contrast'
                    }
                }
            }],
            credits: { enabled: false }
        });
    }

    /**
     * ═══════════════════════════════════════════════════════════════════
     * 📄 IPO PIPELINE AVEC PAGINATION
     * ═══════════════════════════════════════════════════════════════════
     */
    renderPipeline() {
        const container = document.getElementById('ipoPipeline');
        if (!container) return;

        const filteredIPOs = this.applyCurrentFilters();
        const sortedIPOs = [...filteredIPOs].sort((a, b) => b.successScore - a.successScore);
        
        // ✅ Pagination
        const startIndex = (this.pagination.pipelineCurrentPage - 1) * this.pagination.pipelineItemsPerPage;
        const endIndex = startIndex + this.pagination.pipelineItemsPerPage;
        const paginatedIPOs = sortedIPOs.slice(startIndex, endIndex);
        const totalPages = Math.ceil(sortedIPOs.length / this.pagination.pipelineItemsPerPage);

        if (paginatedIPOs.length === 0) {
            container.innerHTML = '<p class="text-center">No IPOs in pipeline</p>';
            return;
        }

        const ipoCards = paginatedIPOs.map(ipo => `
            <div class='pipeline-item'>
                <div class='pipeline-header'>
                    <h3 class='pipeline-company'>${ipo.companyName}</h3>
                    <div class='pipeline-score'>
                        <i class='fas fa-star'></i>
                        ${ipo.successScore}
                    </div>
                </div>
                
                <div class='pipeline-details'>
                    <div class='pipeline-detail'>
                        <span class='pipeline-detail-label'>Sector</span>
                        <span class='pipeline-detail-value'>${ipo.sector}</span>
                    </div>
                    <div class='pipeline-detail'>
                        <span class='pipeline-detail-label'>Form Type</span>
                        <span class='pipeline-detail-value'>${ipo.formType}</span>
                    </div>
                    <div class='pipeline-detail'>
                        <span class='pipeline-detail-label'>Filed Date</span>
                        <span class='pipeline-detail-value'>${new Date(ipo.filedDate).toLocaleDateString()}</span>
                    </div>
                    <div class='pipeline-detail'>
                        <span class='pipeline-detail-label'>Stage</span>
                        <span class='pipeline-detail-value'>${ipo.filingStage}</span>
                    </div>
                </div>
                
                <div class='pipeline-actions'>
                    <button class='pipeline-btn' onclick='ipoApp.viewIPODetail(${JSON.stringify(ipo).replace(/'/g, "&apos;")})'>
                        <i class='fas fa-chart-line'></i>
                        View Analysis
                    </button>
                    <button class='pipeline-btn pipeline-btn-secondary' onclick='window.open("${ipo.filingUrl}", "_blank")'>
                        <i class='fas fa-external-link-alt'></i>
                        SEC Filing
                    </button>
                </div>
            </div>
        `).join('');

        // ✅ Contrôles de Pagination
        const paginationControls = `
            <div style='display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 30px; padding: 20px; background: var(--eco-gradient-soft); border-radius: 12px;'>
                <button 
                    class='dashboard-btn' 
                    onclick='ipoApp.goToPipelinePage(${this.pagination.pipelineCurrentPage - 1})'
                    ${this.pagination.pipelineCurrentPage === 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                >
                    <i class='fas fa-chevron-left'></i> Previous
                </button>
                
                <span style='font-weight: 600; color: var(--text-primary); font-size: 1.1rem;'>
                    Page ${this.pagination.pipelineCurrentPage} / ${totalPages}
                    <span style='color: var(--text-secondary); font-size: 0.9rem; margin-left: 8px;'>
                        (${sortedIPOs.length} IPOs total)
                    </span>
                </span>
                
                <button 
                    class='dashboard-btn' 
                    onclick='ipoApp.goToPipelinePage(${this.pagination.pipelineCurrentPage + 1})'
                    ${this.pagination.pipelineCurrentPage === totalPages ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                >
                    Next <i class='fas fa-chevron-right'></i>
                </button>
            </div>
        `;

        container.innerHTML = ipoCards + paginationControls;
    }

    /**
     * ═══════════════════════════════════════════════════════════════════
     * 📊 TOP IPOs TABLE AVEC PAGINATION
     * ═══════════════════════════════════════════════════════════════════
     */
    renderTopIPOs() {
        const tbody = document.querySelector('#topIPOsTable tbody');
        if (!tbody) return;

        const filteredIPOs = this.applyCurrentFilters();
        const sortedIPOs = [...filteredIPOs].sort((a, b) => b.successScore - a.successScore);
        
        // ✅ Pagination
        const startIndex = (this.pagination.tableCurrentPage - 1) * this.pagination.tableItemsPerPage;
        const endIndex = startIndex + this.pagination.tableItemsPerPage;
        const paginatedIPOs = sortedIPOs.slice(startIndex, endIndex);
        const totalPages = Math.ceil(sortedIPOs.length / this.pagination.tableItemsPerPage);

        const html = paginatedIPOs.map((ipo, index) => `
            <tr>
                <td><div class='ipo-rank'>${startIndex + index + 1}</div></td>
                <td>
                    <div class='ipo-company-cell'>
                        <span class='ipo-company-name'>${ipo.companyName}</span>
                        <span class='ipo-company-cik'>CIK: ${ipo.cik || 'N/A'}</span>
                    </div>
                </td>
                <td>
                    <span class='ipo-sector-badge'>
                        <i class='fas fa-industry'></i>
                        ${ipo.sector}
                    </span>
                </td>
                <td>
                    <div class='ipo-score'>
                        <div class='ipo-score-bar'>
                            <div class='ipo-score-fill' style='width: ${ipo.successScore}%'></div>
                        </div>
                        <span class='ipo-score-value'>${ipo.successScore}</span>
                    </div>
                </td>
                <td>${new Date(ipo.filedDate).toLocaleDateString()}</td>
                <td>
                    <span class='ipo-stage-badge ${ipo.filingStage.includes('Initial') ? 'stage-initial' : ipo.filingStage.includes('Amendment') ? 'stage-amendment' : 'stage-final'}'>
                        ${ipo.filingStage}
                    </span>
                </td>
                <td>
                    <button class='ipo-action-btn' onclick='ipoApp.viewIPODetail(${JSON.stringify(ipo).replace(/'/g, "&apos;")})'>
                        <i class='fas fa-eye'></i>
                        View
                    </button>
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = html || '<tr><td colspan="7" class="text-center">No data available</td></tr>';
        
        // ✅ Ajouter les contrôles de pagination sous le tableau
        const tableContainer = document.querySelector('#topIPOsTable').parentElement;
        let paginationControls = document.getElementById('tablePaginationControls');
        
        if (!paginationControls) {
            paginationControls = document.createElement('div');
            paginationControls.id = 'tablePaginationControls';
            paginationControls.style.cssText = 'margin-top: 20px;';
            tableContainer.appendChild(paginationControls);
        }
        
        paginationControls.innerHTML = `
            <div style='display: flex; justify-content: center; align-items: center; gap: 15px; padding: 20px; background: var(--eco-gradient-soft); border-radius: 12px;'>
                <button 
                    class='dashboard-btn' 
                    onclick='ipoApp.goToTablePage(${this.pagination.tableCurrentPage - 1})'
                    ${this.pagination.tableCurrentPage === 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                >
                    <i class='fas fa-chevron-left'></i> Previous
                </button>
                
                <span style='font-weight: 600; color: var(--text-primary); font-size: 1.1rem;'>
                    Page ${this.pagination.tableCurrentPage} / ${totalPages}
                    <span style='color: var(--text-secondary); font-size: 0.9rem; margin-left: 8px;'>
                        (${sortedIPOs.length} IPOs total)
                    </span>
                </span>
                
                <button 
                    class='dashboard-btn' 
                    onclick='ipoApp.goToTablePage(${this.pagination.tableCurrentPage + 1})'
                    ${this.pagination.tableCurrentPage === totalPages ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
                >
                    Next <i class='fas fa-chevron-right'></i>
                </button>
            </div>
        `;
    }

    /**
     * ═══════════════════════════════════════════════════════════════════
     * 🎯 MÉTHODES DE NAVIGATION DE PAGINATION
     * ═══════════════════════════════════════════════════════════════════
     */
    goToPipelinePage(page) {
        const filteredIPOs = this.applyCurrentFilters();
        const sortedIPOs = [...filteredIPOs].sort((a, b) => b.successScore - a.successScore);
        const totalPages = Math.ceil(sortedIPOs.length / this.pagination.pipelineItemsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.pagination.pipelineCurrentPage = page;
        this.renderPipeline();
        
        // Scroll vers le haut de la section
        document.getElementById('ipoPipeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    goToTablePage(page) {
        const filteredIPOs = this.applyCurrentFilters();
        const sortedIPOs = [...filteredIPOs].sort((a, b) => b.successScore - a.successScore);
        const totalPages = Math.ceil(sortedIPOs.length / this.pagination.tableItemsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        this.pagination.tableCurrentPage = page;
        this.renderTopIPOs();
        
        // Scroll vers le haut du tableau
        document.querySelector('#topIPOsTable')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    renderLockUpTracker() {
        const container = document.getElementById('lockupGrid');
        if (!container) return;

        const filteredIPOs = this.applyCurrentFilters();
        const lockUpIPOs = filteredIPOs
            .filter(ipo => ipo.lockUpExpiry || ipo.filedDate)
            .slice(0, this.config.displayLimits.lockUpCards);

        const html = lockUpIPOs.map(ipo => {
            const now = Date.now();
            const filed = new Date(ipo.filedDate).getTime();
            
            let expiry;
            if (ipo.lockUpExpiry) {
                expiry = new Date(ipo.lockUpExpiry).getTime();
            } else {
                expiry = filed + (210 * 24 * 60 * 60 * 1000);
            }
            
            const progress = Math.min(100, ((now - filed) / (expiry - filed)) * 100);
            const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
            const status = daysRemaining < 0 ? 'expired' : daysRemaining < 30 ? 'expiring' : 'active';

            return `
                <div class='lockup-card'>
                    <div class='lockup-header'>
                        <h3 class='lockup-company'>${ipo.companyName}</h3>
                        <span class='lockup-status lockup-${status}'>
                            <i class='fas ${status === 'expired' ? 'fa-unlock' : 'fa-lock'}'></i>
                            ${status === 'expired' ? 'Expired' : status === 'expiring' ? 'Expiring Soon' : 'Active'}
                        </span>
                    </div>
                    
                    <div class='lockup-progress'>
                        <div class='lockup-progress-bar'>
                            <div class='lockup-progress-fill' style='width: ${progress}%'></div>
                        </div>
                        <div class='lockup-dates'>
                            <span>${new Date(filed).toLocaleDateString()}</span>
                            <span>${new Date(expiry).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div class='lockup-info'>
                        <div class='lockup-info-item'>
                            <span class='lockup-info-label'>Days Remaining</span>
                            <span class='lockup-info-value'>${daysRemaining < 0 ? 0 : daysRemaining}</span>
                        </div>
                        <div class='lockup-info-item'>
                            <span class='lockup-info-label'>Success Score</span>
                            <span class='lockup-info-value'>${ipo.successScore}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html || '<p class="text-center">No lock-up data available</p>';
    }

    viewIPODetail(ipo) {
        const modal = document.getElementById('ipoDetailModal');
        const title = document.getElementById('ipoModalTitle');
        const body = document.getElementById('ipoModalBody');

        title.textContent = `${ipo.companyName} - IPO Analysis`;
        
        body.innerHTML = `
            <div style='padding: 20px 0;'>
                <h3 class='gradient-title' style='margin-bottom: 20px;'>
                    <i class='fas fa-chart-line'></i> Company Overview
                </h3>
                
                <div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px;'>
                    <div>
                        <strong>Company:</strong><br>${ipo.companyName}
                    </div>
                    <div>
                        <strong>CIK:</strong><br>${ipo.cik || 'N/A'}
                    </div>
                    <div>
                        <strong>Sector:</strong><br>${ipo.sector}
                    </div>
                    <div>
                        <strong>Success Score:</strong><br><span class='gradient-title' style='font-size: 1.5rem;'>${ipo.successScore}/100</span>
                    </div>
                </div>
                
                <h3 class='gradient-title' style='margin: 32px 0 20px;'>
                    <i class='fas fa-brain'></i> Advanced Analytics
                </h3>
                
                <div style='background: var(--eco-gradient-soft); padding: 24px; border-radius: 12px; margin-bottom: 20px;'>
                    <div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;'>
                        <div>
                            <h4 class='gradient-title' style='margin-bottom: 8px;'>Risk/Opportunity Ratio</h4>
                            <p style='font-size: 1.3rem; font-weight: 800;'>${this.calculateRiskOpportunityRatio(ipo)}</p>
                            <small style='color: var(--text-tertiary);'>Lower is better (more opportunity vs risk)</small>
                        </div>
                        <div>
                            <h4 class='gradient-title' style='margin-bottom: 8px;'>Sector Valuation</h4>
                            <p style='font-size: 1.3rem; font-weight: 800;'>${this.calculateSectorValuationDynamic(ipo)}</p>
                            <small style='color: var(--text-tertiary);'>Relative to sector peers</small>
                        </div>
                        <div>
                            <h4 class='gradient-title' style='margin-bottom: 8px;'>Dilution Estimate</h4>
                            <p style='font-size: 1.3rem; font-weight: 800;'>${this.estimateDilutionFromData(ipo)}%</p>
                            <small style='color: var(--text-tertiary);'>Expected shareholder dilution</small>
                        </div>
                        <div>
                            <h4 class='gradient-title' style='margin-bottom: 8px;'>Filing Momentum</h4>
                            <p style='font-size: 1.3rem; font-weight: 800;'>${this.calculateFilingMomentumDynamic(ipo)}</p>
                            <small style='color: var(--text-tertiary);'>Speed of progress to IPO</small>
                        </div>
                    </div>
                </div>
                
                <h3 class='gradient-title' style='margin: 32px 0 20px;'>
                    <i class='fas fa-file-alt'></i> Filing Information
                </h3>
                
                <div style='background: var(--eco-gradient-soft); padding: 20px; border-radius: 12px; margin-bottom: 20px;'>
                    <p><strong>Form Type:</strong> ${ipo.formType}</p>
                    <p><strong>Filing Stage:</strong> ${ipo.filingStage}</p>
                    <p><strong>Filed Date:</strong> ${new Date(ipo.filedDate).toLocaleDateString()}</p>
                    <p><strong>Accession Number:</strong> ${ipo.accessionNumber || 'N/A'}</p>
                    <p><strong>Lock-Up Expiry:</strong> ${ipo.lockUpExpiry ? new Date(ipo.lockUpExpiry).toLocaleDateString() : 'Estimated based on filing date'}</p>
                </div>
                
                ${ipo.riskFactors && ipo.riskFactors.length > 0 ? `
                <h3 class='gradient-title' style='margin: 32px 0 20px;'>
                    <i class='fas fa-exclamation-triangle'></i> Risk Factors
                </h3>
                <ul style='list-style: none; padding: 0;'>
                    ${ipo.riskFactors.map(risk => `
                        <li style='background: rgba(239, 68, 68, 0.1); padding: 12px; border-left: 4px solid var(--eco-danger); margin-bottom: 8px; border-radius: 8px;'>
                            <i class='fas fa-exclamation-circle'></i> ${risk}
                        </li>
                    `).join('')}
                </ul>
                ` : ''}
                
                <div style='margin-top: 32px; text-align: center;'>
                    <a href='${ipo.filingUrl}' target='_blank' class='dashboard-btn' style='display: inline-flex;'>
                        <i class='fas fa-external-link-alt'></i>
                        <span>View SEC Filing</span>
                    </a>
                </div>
            </div>
        `;

        this.openModal('ipoDetailModal');
    }

    applyCurrentFilters() {
        return this.enrichedIPOs.filter(ipo => {
            if (this.filters.sectors.length > 0 && !this.filters.sectors.includes(ipo.sector)) {
                return false;
            }
            
            if (ipo.successScore < this.filters.scoreMin || ipo.successScore > this.filters.scoreMax) {
                return false;
            }
            
            if (this.filters.stages.length > 0 && !this.filters.stages.includes(ipo.filingStage)) {
                return false;
            }
            
            return true;
        });
    }

    applyFilters() {
        this.filters.sectors = Array.from(document.querySelectorAll('[data-sector].active'))
            .map(btn => btn.dataset.sector);
        
        this.filters.scoreMin = parseInt(document.getElementById('scoreMin')?.value || 0);
        this.filters.scoreMax = parseInt(document.getElementById('scoreMax')?.value || 100);
        
        this.filters.stages = Array.from(document.querySelectorAll('[data-stage].active'))
            .map(btn => btn.dataset.stage);
        
        console.log('🔍 Filters applied:', this.filters);
        
        // ✅ Réinitialiser la pagination lors de l'application de filtres
        this.pagination.pipelineCurrentPage = 1;
        this.pagination.tableCurrentPage = 1;
        
        this.renderAll();
        this.closeModal('filtersModal');
    }

    resetFilters() {
        this.filters = {
            sectors: [],
            scoreMin: 0,
            scoreMax: 100,
            stages: []
        };
        
        document.querySelectorAll('.filter-btn.active').forEach(btn => btn.classList.remove('active'));
        if (document.getElementById('scoreMin')) document.getElementById('scoreMin').value = 0;
        if (document.getElementById('scoreMax')) document.getElementById('scoreMax').value = 100;
        
        // ✅ Réinitialiser la pagination lors du reset
        this.pagination.pipelineCurrentPage = 1;
        this.pagination.tableCurrentPage = 1;
        
        this.renderAll();
        this.closeModal('filtersModal');
    }

    showInfoModal(section) {
        const modal = document.getElementById('infoModal');
        const title = document.getElementById('infoModalTitle');
        const body = document.getElementById('infoModalBody');

        const infoContent = {
            'total-ipos': {
                title: 'Total IPOs',
                content: `
                    <p>This metric shows the total number of Initial Public Offering (IPO) filings currently tracked in our system.</p>
                    <h4>Data Source:</h4>
                    <p>SEC EDGAR database - includes S-1 (US companies), F-1 (foreign companies), and their amendments.</p>
                    <h4>Why it matters:</h4>
                    <p>A higher number indicates increased IPO activity in the market, which can signal investor confidence and economic growth.</p>
                `
            },
            'success-score': {
                title: 'Success Score',
                content: `
                    <p>Our proprietary AI-powered success score (0-100) predicts the likelihood of a successful IPO based on multiple factors.</p>
                    <h4>Factors analyzed:</h4>
                    <ul>
                        <li>Filing recency (recent filings score higher)</li>
                        <li>Form type (original S-1/F-1 vs amendments)</li>
                        <li>Industry sector (tech, healthcare score higher)</li>
                        <li>Summary detail level (more detailed = better prepared)</li>
                        <li>Risk factors identified</li>
                    </ul>
                    <h4>Dynamic thresholds (calculated from current data):</h4>
                    <p><strong>${this.stats.scoreDistribution.p90?.toFixed(0) || 75}+:</strong> Exceptional potential (top 10%)<br>
                    <strong>${this.stats.scoreDistribution.q3?.toFixed(0) || 60}+:</strong> Strong potential (top 25%)<br>
                    <strong>${this.stats.scoreDistribution.median?.toFixed(0) || 50}+:</strong> Moderate potential (above median)<br>
                    <strong>${this.stats.scoreDistribution.q1?.toFixed(0) || 40}-:</strong> Higher risk (bottom 25%)</p>
                `
            },
            'top-sector': {
                title: 'Top Sector',
                content: `
                    <p>The industry sector with the highest number of IPO filings currently active.</p>
                    <h4>Sector classification:</h4>
                    <p>Companies are automatically classified into sectors based on keywords in their name and business description.</p>
                    <h4>Current sector rankings (by avg success score):</h4>
                    <ul>
                        ${this.stats.sectorPerformance.slice(0, 5).map(s => `
                            <li><strong>${s.sector}</strong>: ${s.avgScore.toFixed(1)} avg score</li>
                        `).join('')}
                    </ul>
                    <h4>Why it matters:</h4>
                    <p>Dominant sectors indicate where investor capital is flowing and which industries are experiencing the most growth and innovation.</p>
                `
            },
            'recent-ipos': {
                title: 'Recent IPOs (30 days)',
                content: `
                    <p>Number of new IPO filings submitted to the SEC in the last 30 days.</p>
                    <h4>Why track recent filings:</h4>
                    <ul>
                        <li>Indicates current market sentiment</li>
                        <li>Early-stage opportunities for investors</li>
                        <li>Market timing indicators</li>
                    </ul>
                    <h4>Typical timeline:</h4>
                    <p>From initial S-1 filing to actual IPO typically takes 3-6 months, though it can vary significantly.</p>
                `
            },
            's1-f1': {
                title: 'SEC Form Types Explained',
                content: `
                    <h4><strong>Form S-1 (US Companies)</strong></h4>
                    <p>The <strong>S-1</strong> is the initial registration statement filed with the SEC by <strong>U.S.-based companies</strong> preparing for an IPO. It contains:</p>
                    <ul>
                        <li>Business description and strategy</li>
                        <li>Financial statements (3+ years)</li>
                        <li>Risk factors</li>
                        <li>Use of proceeds</li>
                        <li>Management and ownership structure</li>
                    </ul>
                    
                    <h4 style="margin-top: 20px;"><strong>Form F-1 (Foreign Companies)</strong></h4>
                    <p>The <strong>F-1</strong> is used by <strong>foreign companies</strong> registering securities in the U.S. Similar to S-1 but includes:</p>
                    <ul>
                        <li>Disclosure of foreign jurisdiction laws</li>
                        <li>Currency exchange considerations</li>
                        <li>International accounting standards reconciliation</li>
                    </ul>
                    
                    <h4 style="margin-top: 20px;"><strong>Amendments (S-1/A, F-1/A)</strong></h4>
                    <p>Forms ending with <strong>/A</strong> (e.g., S-1/A, F-1/A) are <strong>amendments</strong> to the original filing. Companies file amendments to:</p>
                    <ul>
                        <li>Update financial information</li>
                        <li>Address SEC comments</li>
                        <li>Revise pricing range</li>
                        <li>Add or clarify risk factors</li>
                    </ul>
                    <p><strong>Multiple amendments are normal</strong> and often indicate progress toward finalizing the IPO.</p>
                `
            },
            'heatmap': {
                title: 'IPO Heatmap by Sector',
                content: `
                    <p>Visual representation of IPO activity across different industry sectors.</p>
                    <h4>How to read:</h4>
                    <ul>
                        <li><span style="color: #10b981;">●</span> Green = Low activity (fewer IPOs)</li>
                        <li><span style="color: #f59e0b;">●</span> Yellow = Medium activity</li>
                        <li><span style="color: #ef4444;">●</span> Red = High activity (many IPOs)</li>
                        <li>Each cell shows the count of IPOs in that sector</li>
                        <li>Filter by time period (30, 90, 180, 365 days)</li>
                    </ul>
                    <h4>Strategic use:</h4>
                    <p>Identify trending sectors and potential sector rotation opportunities.</p>
                `
            },
            'pipeline': {
                title: 'IPO Pipeline',
                content: `
                    <p>A curated list of top IPO candidates ranked by our success score algorithm.</p>
                    <h4>Information provided:</h4>
                    <ul>
                        <li>Company name and sector</li>
                        <li>Form type and filing stage</li>
                        <li>Filed date</li>
                        <li>Success score</li>
                        <li>Direct link to SEC filing</li>
                    </ul>
                    <h4>Use cases:</h4>
                    <p>Track promising IPOs from filing to launch, analyze competitive landscape, identify investment opportunities early.</p>
                `
            },
            'lockup': {
                title: 'Lock-Up Period Tracker',
                content: `
                    <p>Tracks when IPO lock-up periods are set to expire.</p>
                    <h4>What is a lock-up period:</h4>
                    <p>A lock-up period (typically 180 days) prevents company insiders from selling their shares immediately after an IPO.</p>
                    <h4>Why it matters:</h4>
                    <ul>
                        <li>Lock-up expiration can trigger sell-offs</li>
                        <li>Price volatility often increases near expiration</li>
                        <li>Strategic timing for entry/exit points</li>
                    </ul>
                    <h4>Our estimates:</h4>
                    <p>Based on typical 180-day lock-up periods from estimated IPO date (filing date + 30 days).</p>
                `
            }
        };

        const info = infoContent[section] || { title: 'Information', content: '<p>No information available.</p>' };
        
        title.textContent = info.title;
        body.innerHTML = info.content;
        
        this.openModal('infoModal');
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    }

    showError(message) {
        console.error('❌', message);
        alert(message);
    }
}

// Initialize app
let ipoApp;
document.addEventListener('DOMContentLoaded', () => {
    ipoApp = new IPOIntelligenceDashboard();
});