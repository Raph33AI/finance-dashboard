// /**
//  * ═══════════════════════════════════════════════════════════════════
//  * 📊 INSIDER FLOW TRACKER - MAIN APPLICATION
//  * ═══════════════════════════════════════════════════════════════════
//  * AlphaVault AI - Insider Trading Analysis Dashboard
//  * ═══════════════════════════════════════════════════════════════════
//  */

// (function() {
//     'use strict';

//     // ═══════════════════════════════════════════════════════════════
//     // GLOBAL STATE
//     // ═══════════════════════════════════════════════════════════════
//     const analyticsEngine = new InsiderAnalyticsEngine();
//     let currentAnalysis = null;
//     let roleChartInstance = null;
//     let currentPage = 1;
//     let transactionsPerPage = 20;
//     let allTransactions = [];

//     // ═══════════════════════════════════════════════════════════════
//     // MAIN ANALYSIS FUNCTION
//     // ═══════════════════════════════════════════════════════════════
//     async function analyzeInsiderActivity() {
//         const ticker = document.getElementById('tickerInput').value.trim().toUpperCase();
        
//         if (!ticker) {
//             alert('⚠ Please enter a valid ticker');
//             return;
//         }

//         const months = parseFloat(document.getElementById('periodSelect').value);
//         const maxFilings = parseInt(document.getElementById('filingsSelect').value);

//         console.log(`🔍 Analyzing ${ticker} with ${maxFilings} filings over ${months} months...`);

//         // Show loading with progress
//         document.getElementById('loadingState').classList.remove('hidden');
//         document.getElementById('resultsContainer').classList.add('hidden');
//         updateProgress(0, 'Initializing analysis...');

//         try {
//             console.log(`🔍 Analyzing insider activity for ${ticker}...`);
            
//             updateProgress(10, 'Fetching CIK number...');
            
//             currentAnalysis = await analyticsEngine.analyzeCompany(ticker, {
//                 months: months,
//                 maxFilings: maxFilings,
//                 includeDerivatives: true,
//                 includePriceImpact: false,
//                 includeNetworkAnalysis: true,
//                 onProgress: (progress, message) => {
//                     updateProgress(progress, message);
//                 }
//             });

//             console.log('✅ Analysis complete:', currentAnalysis);

//             updateProgress(100, 'Analysis complete!');
            
//             await new Promise(resolve => setTimeout(resolve, 500));

//             displayResults(currentAnalysis);

//         } catch (error) {
//             console.error('❌ Analysis error:', error);
//             alert(`Error during analysis: ${error.message}`);
//         } finally {
//             document.getElementById('loadingState').classList.add('hidden');
//         }
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // UPDATE PROGRESS BAR
//     // ═══════════════════════════════════════════════════════════════
//     function updateProgress(percentage, message) {
//         const progressBar = document.getElementById('progressBar');
//         const progressText = document.getElementById('progressText');
//         const loadingMessage = document.getElementById('loadingMessage');

//         progressBar.style.width = `${percentage}%`;
//         progressText.textContent = `${Math.round(percentage)}%`;
//         if (message) {
//             loadingMessage.textContent = message;
//         }
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // DISPLAY RESULTS
//     // ═══════════════════════════════════════════════════════════════
//     function displayResults(analysis) {
//         if (!analysis || analysis.error) {
//             alert(analysis.error || 'No data available');
//             return;
//         }

//         document.getElementById('resultsContainer').classList.remove('hidden');

//         displayRecommendation(analysis.recommendation, analysis.overallScore);
//         displayScoreCards(analysis);
//         displayAlerts(analysis.alerts);

//         if (analysis.clusterActivity.detected) {
//             displayClusters(analysis.clusterActivity.clusters);
//             document.getElementById('clusterSection').classList.remove('hidden');
//         } else {
//             document.getElementById('clusterSection').classList.add('hidden');
//         }

//         displayRoleChart(analysis.roleAnalysis);
//         displayTransactionsTable(analysis);

//         document.getElementById('resultsContainer').scrollIntoView({ 
//             behavior: 'smooth', 
//             block: 'start' 
//         });
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // DISPLAY RECOMMENDATION
//     // ═══════════════════════════════════════════════════════════════
//     function displayRecommendation(recommendation, overallScore) {
//         const panel = document.getElementById('recommendationPanel');
        
//         const actionColors = {
//             'STRONG BUY': '#10b981',
//             'BUY': '#10b981',
//             'HOLD': '#f59e0b',
//             'SELL': '#ef4444',
//             'STRONG SELL': '#ef4444'
//         };

//         const actionIcons = {
//             'STRONG BUY': '🚀',
//             'BUY': '📈',
//             'HOLD': '⏸',
//             'SELL': '📉',
//             'STRONG SELL': '🔻'
//         };

//         panel.style.background = `linear-gradient(135deg, ${actionColors[recommendation.action]}, ${actionColors[recommendation.action]}dd)`;

//         panel.innerHTML = `
//             <div class="recommendation-action">
//                 ${actionIcons[recommendation.action]} ${recommendation.action}
//             </div>
//             <div class="recommendation-score">${overallScore.score}/100</div>
//             <div style="font-size: 1.1rem; font-weight: 600; opacity: 0.9; position: relative; z-index: 1; color: white;">
//                 Confidence: ${recommendation.confidence}
//             </div>
//             <div class="recommendation-rationale">
//                 <div style="font-weight: 700; margin-bottom: 12px; font-size: 1.1rem; color: white;">
//                     <i class="fas fa-lightbulb"></i> Rationale
//                 </div>
//                 ${recommendation.rationale.map(r => `
//                     <div class="rationale-item">
//                         <i class="fas fa-check-circle"></i>
//                         <span>${r}</span>
//                     </div>
//                 `).join('')}
//             </div>
//         `;
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // DISPLAY SCORE CARDS
//     // ═══════════════════════════════════════════════════════════════
//     function displayScoreCards(analysis) {
//         const container = document.getElementById('scoreContainer');
        
//         const cards = [
//             {
//                 label: 'Insider Sentiment',
//                 value: analysis.insiderSentiment.score,
//                 suffix: '/100',
//                 sublabel: analysis.insiderSentiment.label
//             },
//             {
//                 label: 'Transactions',
//                 value: analysis.transactionCount,
//                 suffix: '',
//                 sublabel: `Last ${Math.round((new Date() - new Date(analysis.period.start)) / (1000 * 60 * 60 * 24))} days`
//             },
//             {
//                 label: 'Cluster Activity',
//                 value: analysis.clusterActivity.count,
//                 suffix: '',
//                 sublabel: analysis.clusterActivity.detected ? 'Detected' : 'None'
//             },
//             {
//                 label: 'Data Quality',
//                 value: analysis.dataQuality,
//                 suffix: '',
//                 sublabel: 'Reliability score'
//             }
//         ];

//         container.innerHTML = cards.map(card => `
//             <div class="score-card">
//                 <div class="score-label">${card.label}</div>
//                 <div class="score-value">${card.value}${card.suffix}</div>
//                 <div class="score-sublabel">${card.sublabel}</div>
//             </div>
//         `).join('');
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // DISPLAY ALERTS
//     // ═══════════════════════════════════════════════════════════════
//     function displayAlerts(alerts) {
//         const container = document.getElementById('alertsContainer');
        
//         if (!alerts || alerts.length === 0) {
//             container.innerHTML = `
//                 <div style="text-align: center; padding: 40px; color: var(--text-tertiary);">
//                     <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
//                     <p>No critical alerts detected</p>
//                 </div>
//             `;
//             return;
//         }

//         const icons = {
//             'CLUSTER_BUYING': 'fa-users',
//             'CEO_CFO_DIVERGENCE': 'fa-exclamation-triangle',
//             'PRE_EARNINGS_ACTIVITY': 'fa-clock',
//             'CEO_MAJOR_PURCHASE': 'fa-shopping-cart',
//             'CFO_MAJOR_SALE': 'fa-hand-holding-usd',
//             'STRONG_BUY_SIGNAL': 'fa-rocket',
//             'STRONG_SELL_SIGNAL': 'fa-arrow-down'
//         };

//         container.innerHTML = alerts.map(alert => `
//             <div class="alert severity-${alert.severity}">
//                 <div class="alert-icon">
//                     <i class="fas ${icons[alert.type] || 'fa-info-circle'}"></i>
//                 </div>
//                 <div class="alert-content">
//                     <div class="alert-title">${alert.title}</div>
//                     <div class="alert-description">${alert.description}</div>
//                 </div>
//                 <span class="alert-badge">${alert.confidence}% confidence</span>
//             </div>
//         `).join('');
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // DISPLAY CLUSTERS
//     // ═══════════════════════════════════════════════════════════════
//     function displayClusters(clusters) {
//         const container = document.getElementById('clusterContainer');
        
//         container.innerHTML = clusters.map(cluster => `
//             <div class="cluster-card">
//                 <div class="cluster-header">
//                     <div class="cluster-date">
//                         ${new Date(cluster.startDate).toLocaleDateString('en-US')}
//                     </div>
//                     <div class="confidence-badge">
//                         ${cluster.confidence}% confidence
//                     </div>
//                 </div>
//                 <h3 style="margin-bottom: 16px;">
//                     ${cluster.insiderCount} insiders • ${cluster.transactionCount} transactions
//                 </h3>
//                 <div class="cluster-stats">
//                     <div class="cluster-stat">
//                         <div class="cluster-stat-label">Total Value</div>
//                         <div class="cluster-stat-value">
//                             $${formatNumber(cluster.totalValue)}
//                         </div>
//                     </div>
//                     <div class="cluster-stat">
//                         <div class="cluster-stat-label">Avg/Insider</div>
//                         <div class="cluster-stat-value">
//                             $${formatNumber(cluster.averageValuePerInsider)}
//                         </div>
//                     </div>
//                 </div>
//                 <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem; color: var(--text-secondary);">
//                     <strong>Roles:</strong> ${cluster.insiderRoles.join(', ')}
//                 </div>
//             </div>
//         `).join('');
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // DISPLAY ROLE CHART (✅ Amélioration design)
//     // ═══════════════════════════════════════════════════════════════
//     function displayRoleChart(roleAnalysis) {
//         const canvas = document.getElementById('roleChart');
//         const ctx = canvas.getContext('2d');
        
//         if (roleChartInstance !== null) {
//             console.log('🗑 Destroying previous chart...');
//             roleChartInstance.destroy();
//             roleChartInstance = null;
//         }
        
//         const roles = Object.keys(roleAnalysis.byRole);
//         const purchases = roles.map(r => roleAnalysis.byRole[r].purchaseValue);
//         const sales = roles.map(r => Math.abs(roleAnalysis.byRole[r].saleValue));

//         console.log('📊 Creating new chart...');
        
//         roleChartInstance = new Chart(ctx, {
//             type: 'bar',
//             data: {
//                 labels: roles,
//                 datasets: [
//                     {
//                         label: 'Purchases',
//                         data: purchases,
//                         backgroundColor: 'rgba(16, 185, 129, 0.8)',
//                         borderColor: 'rgba(16, 185, 129, 1)',
//                         borderWidth: 2,
//                         borderRadius: 8,
//                         borderSkipped: false
//                     },
//                     {
//                         label: 'Sales',
//                         data: sales,
//                         backgroundColor: 'rgba(239, 68, 68, 0.8)',
//                         borderColor: 'rgba(239, 68, 68, 1)',
//                         borderWidth: 2,
//                         borderRadius: 8,
//                         borderSkipped: false
//                     }
//                 ]
//             },
//             options: {
//                 responsive: true,
//                 maintainAspectRatio: true,
//                 plugins: {
//                     legend: {
//                         labels: {
//                             color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b',
//                             font: { size: 14, weight: 'bold' },
//                             padding: 20,
//                             usePointStyle: true,
//                             pointStyle: 'circle'
//                         }
//                     },
//                     tooltip: {
//                         backgroundColor: 'rgba(15, 23, 42, 0.95)',
//                         titleColor: '#ffffff',
//                         bodyColor: '#ffffff',
//                         borderColor: 'rgba(102, 126, 234, 0.5)',
//                         borderWidth: 1,
//                         padding: 12,
//                         displayColors: true,
//                         callbacks: {
//                             label: function(context) {
//                                 return context.dataset.label + ': $' + formatNumber(context.parsed.y);
//                             }
//                         }
//                     }
//                 },
//                 scales: {
//                     y: {
//                         beginAtZero: true,
//                         ticks: {
//                             color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#64748b',
//                             callback: function(value) {
//                                 return '$' + formatNumber(value);
//                             }
//                         },
//                         grid: {
//                             color: 'rgba(148, 163, 184, 0.1)',
//                             drawBorder: false
//                         }
//                     },
//                     x: {
//                         ticks: {
//                             color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#64748b',
//                             font: { weight: '600' }
//                         },
//                         grid: {
//                             display: false
//                         }
//                     }
//                 }
//             }
//         });

//         console.log('✅ New chart created successfully');
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // DISPLAY TRANSACTIONS TABLE (✅ FILTRE: Exclut transactions à 0$)
//     // ═══════════════════════════════════════════════════════════════
//     function displayTransactionsTable(analysis) {
//         const container = document.getElementById('transactionsTable');
        
//         // ✅ CORRECTION: Calcul du netValue et filtrage des transactions à 0$
//         allTransactions = (analysis.transactions || [])
//             .map(t => {
//                 const netValue = (t.nonDerivativeTransactions || [])
//                     .reduce((sum, nt) => {
//                         return sum + (nt.transactionType === 'Purchase' ? nt.totalValue : -nt.totalValue);
//                     }, 0);
                
//                 return { ...t, netValue }; // On ajoute netValue à l'objet transaction
//             })
//             .filter(t => Math.abs(t.netValue) > 0) // ✅ Exclut les transactions à 0$
//             .sort((a, b) => new Date(b.filingDate) - new Date(a.filingDate));

//         currentPage = 1;
        
//         console.log(`📋 Total transactions: ${allTransactions.length} (hors transactions à 0$)`);

//         if (allTransactions.length === 0) {
//             container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-tertiary);">No transactions to display</p>';
//             return;
//         }

//         renderTransactionsPage();
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // RENDER TRANSACTIONS PAGE (✅ Utilise netValue pré-calculé)
//     // ═══════════════════════════════════════════════════════════════
//     function renderTransactionsPage() {
//         const container = document.getElementById('transactionsTable');
//         const start = (currentPage - 1) * transactionsPerPage;
//         const end = start + transactionsPerPage;
//         const pageTransactions = allTransactions.slice(start, end);
//         const totalPages = Math.ceil(allTransactions.length / transactionsPerPage);

//         container.innerHTML = `
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Date</th>
//                         <th>Insider</th>
//                         <th>Role</th>
//                         <th>Type</th>
//                         <th>Value</th>
//                         <th>Signal</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     ${pageTransactions.map(t => {
//                         // ✅ netValue déjà calculé dans displayTransactionsTable
//                         const netValue = t.netValue;
                        
//                         const type = netValue > 0 ? 'Purchase' : 'Sale';
//                         const badgeClass = netValue > 0 ? 'badge-buy' : 'badge-sell';
                        
//                         return `
//                             <tr>
//                                 <td>${new Date(t.filingDate).toLocaleDateString('en-US')}</td>
//                                 <td>${t.reportingOwner?.name || 'N/A'}</td>
//                                 <td>${t.reportingOwner?.classification || 'N/A'}</td>
//                                 <td><span class="badge ${badgeClass}">${type}</span></td>
//                                 <td>$${formatNumber(Math.abs(netValue))}</td>
//                                 <td><span class="badge ${badgeClass}">${netValue > 0 ? 'BULLISH' : 'BEARISH'}</span></td>
//                             </tr>
//                         `;
//                     }).join('')}
//                 </tbody>
//             </table>
//             <div class="pagination">
//                 <button onclick="window.InsiderFlowTracker.goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>
//                     <i class="fas fa-angle-double-left"></i> First
//                 </button>
//                 <button onclick="window.InsiderFlowTracker.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
//                     <i class="fas fa-angle-left"></i> Previous
//                 </button>
//                 <span>Page ${currentPage} of ${totalPages} (${allTransactions.length} total)</span>
//                 <button onclick="window.InsiderFlowTracker.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
//                     Next <i class="fas fa-angle-right"></i>
//                 </button>
//                 <button onclick="window.InsiderFlowTracker.goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
//                     Last <i class="fas fa-angle-double-right"></i>
//                 </button>
//             </div>
//         `;
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // GO TO PAGE
//     // ═══════════════════════════════════════════════════════════════
//     function goToPage(page) {
//         const totalPages = Math.ceil(allTransactions.length / transactionsPerPage);
//         if (page < 1 || page > totalPages) return;
        
//         currentPage = page;
//         renderTransactionsPage();
        
//         document.getElementById('transactionsTable').scrollIntoView({ 
//             behavior: 'smooth', 
//             block: 'nearest' 
//         });
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // UTILITIES
//     // ═══════════════════════════════════════════════════════════════
//     function formatNumber(num) {
//         if (num >= 1000000) {
//             return (num / 1000000).toFixed(2) + 'M';
//         }
//         if (num >= 1000) {
//             return (num / 1000).toFixed(2) + 'K';
//         }
//         return num.toFixed(2);
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // EVENT LISTENERS
//     // ═══════════════════════════════════════════════════════════════
//     function initializeEventListeners() {
//         document.getElementById('tickerInput').addEventListener('keypress', (e) => {
//             if (e.key === 'Enter') {
//                 analyzeInsiderActivity();
//             }
//         });

//         document.getElementById('analyzeBtn').addEventListener('click', analyzeInsiderActivity);
        
//         document.getElementById('refreshBtn').addEventListener('click', () => {
//             if (document.getElementById('tickerInput').value.trim()) {
//                 analyzeInsiderActivity();
//             } else {
//                 alert('⚠ Please enter a ticker first');
//             }
//         });

//         window.addEventListener('load', () => {
//             document.getElementById('tickerInput').focus();
//         });
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // INITIALIZATION
//     // ═══════════════════════════════════════════════════════════════
//     if (document.readyState === 'loading') {
//         document.addEventListener('DOMContentLoaded', initializeEventListeners);
//     } else {
//         initializeEventListeners();
//     }

//     // ═══════════════════════════════════════════════════════════════
//     // GLOBAL EXPORT (pour pagination)
//     // ═══════════════════════════════════════════════════════════════
//     window.InsiderFlowTracker = {
//         goToPage: goToPage
//     };

// })();

/**
 * ═══════════════════════════════════════════════════════════════════
 * 📊 INSIDER FLOW TRACKER - ULTRA-POWERFUL INTEGRATED VERSION
 * ═══════════════════════════════════════════════════════════════════
 * AlphaVault AI - Advanced Insider Trading Analysis Dashboard
 * 
 * Features:
 * ✅ Alphy AI Recommendation (simplified, no robot logo)
 * ✅ Multi-company comparison (inline, no modal)
 * ✅ Network graph (inline, no modal)
 * ✅ Advanced pattern detection
 * ✅ Temporal heatmap
 * ✅ Anomaly detection
 * ✅ All-in-one monolithic file
 * ═══════════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // 🧩 CLASS 1: INSIDER PATTERN DETECTOR
    // ═══════════════════════════════════════════════════════════════
    class InsiderPatternDetector {
        constructor() {
            this.patterns = {
                momentum: null,
                acceleration: null,
                unusual: null,
                seasonality: null,
                roleConcentration: null
            };
        }

        /**
         * Detect all patterns in transactions
         */
        detectPatterns(transactions) {
            if (!transactions || transactions.length === 0) {
                return this.patterns;
            }

            this.patterns.momentum = this.detectMomentumPattern(transactions);
            this.patterns.acceleration = this.detectAccelerationPattern(transactions);
            this.patterns.unusual = this.detectUnusualActivity(transactions);
            this.patterns.seasonality = this.detectSeasonalityPattern(transactions);
            this.patterns.roleConcentration = this.detectRoleConcentration(transactions);

            return this.patterns;
        }

        /**
         * Detect momentum pattern (consistent buying/selling direction)
         */
        detectMomentumPattern(transactions) {
            const recentTx = transactions.slice(0, Math.min(20, transactions.length));
            
            let buyCount = 0;
            let sellCount = 0;

            recentTx.forEach(tx => {
                const netValue = (tx.nonDerivativeTransactions || []).reduce((sum, nt) => {
                    return sum + (nt.transactionType === 'Purchase' ? nt.totalValue : -nt.totalValue);
                }, 0);

                if (netValue > 0) buyCount++;
                else if (netValue < 0) sellCount++;
            });

            const total = buyCount + sellCount;
            const buyRatio = total > 0 ? buyCount / total : 0;
            const sellRatio = total > 0 ? sellCount / total : 0;

            let detected = false;
            let direction = 'Neutral';
            let strength = 0;

            if (buyRatio > 0.7) {
                detected = true;
                direction = 'Bullish';
                strength = Math.round(buyRatio * 100);
            } else if (sellRatio > 0.7) {
                detected = true;
                direction = 'Bearish';
                strength = Math.round(sellRatio * 100);
            }

            return {
                detected,
                direction,
                strength,
                buyCount,
                sellCount
            };
        }

        /**
         * Detect acceleration pattern (increasing transaction velocity)
         */
        detectAccelerationPattern(transactions) {
            if (transactions.length < 10) {
                return { detected: false };
            }

            // Split into two halves
            const midPoint = Math.floor(transactions.length / 2);
            const recentHalf = transactions.slice(0, midPoint);
            const olderHalf = transactions.slice(midPoint);

            const recentCount = recentHalf.length;
            const olderCount = olderHalf.length;

            const recentDays = this.getDaySpan(recentHalf);
            const olderDays = this.getDaySpan(olderHalf);

            const recentVelocity = recentDays > 0 ? recentCount / recentDays : 0;
            const olderVelocity = olderDays > 0 ? olderCount / olderDays : 0;

            const acceleration = olderVelocity > 0 ? (recentVelocity - olderVelocity) / olderVelocity : 0;

            let detected = false;
            let trend = 'Stable';

            if (acceleration > 0.3) {
                detected = true;
                trend = 'Accelerating';
            } else if (acceleration < -0.3) {
                detected = true;
                trend = 'Decelerating';
            }

            return {
                detected,
                trend,
                acceleration: Math.round(acceleration * 100),
                recentVelocity: recentVelocity.toFixed(2),
                olderVelocity: olderVelocity.toFixed(2)
            };
        }

        /**
         * Detect unusual activity (anomalies, outliers)
         */
        detectUnusualActivity(transactions) {
            const values = transactions.map(tx => {
                return Math.abs((tx.nonDerivativeTransactions || []).reduce((sum, nt) => {
                    return sum + nt.totalValue;
                }, 0));
            });

            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);

            const threshold = mean + (2 * stdDev); // 2 standard deviations
            const anomalies = values.filter(v => v > threshold).length;

            const detected = anomalies > 0;

            return {
                detected,
                anomalies,
                threshold: threshold.toFixed(2),
                mean: mean.toFixed(2),
                stdDev: stdDev.toFixed(2)
            };
        }

        /**
         * Detect seasonality pattern
         */
        detectSeasonalityPattern(transactions) {
            const monthlyCount = {};

            transactions.forEach(tx => {
                const month = new Date(tx.filingDate).getMonth();
                monthlyCount[month] = (monthlyCount[month] || 0) + 1;
            });

            const counts = Object.values(monthlyCount);
            if (counts.length === 0) {
                return { detected: false };
            }

            const maxCount = Math.max(...counts);
            const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;

            const peakMonth = parseInt(Object.keys(monthlyCount).find(m => monthlyCount[m] === maxCount));
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            const detected = maxCount > avgCount * 1.5;

            return {
                detected,
                peakMonth: monthNames[peakMonth],
                peakCount: maxCount,
                avgCount: avgCount.toFixed(1)
            };
        }

        /**
         * Detect role concentration (which roles are most active)
         */
        detectRoleConcentration(transactions) {
            const roleCounts = {};

            transactions.forEach(tx => {
                const role = tx.reportingOwner?.classification || 'Unknown';
                roleCounts[role] = (roleCounts[role] || 0) + 1;
            });

            const total = Object.values(roleCounts).reduce((a, b) => a + b, 0);
            
            if (total === 0 || Object.keys(roleCounts).length === 0) {
                return { detected: false };
            }

            const dominantRole = Object.keys(roleCounts).reduce((a, b) => 
                roleCounts[a] > roleCounts[b] ? a : b
            );

            const concentration = total > 0 ? (roleCounts[dominantRole] / total) * 100 : 0;
            const detected = concentration > 60;

            return {
                detected,
                dominantRole,
                concentration: concentration.toFixed(1),
                roleCounts
            };
        }

        /**
         * Helper: Get day span between first and last transaction
         */
        getDaySpan(transactions) {
            if (transactions.length === 0) return 0;

            const dates = transactions.map(tx => new Date(tx.filingDate).getTime());
            const earliest = Math.min(...dates);
            const latest = Math.max(...dates);

            return Math.ceil((latest - earliest) / (1000 * 60 * 60 * 24));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 🧩 CLASS 2: INSIDER COMPARISON ENGINE
    // ═══════════════════════════════════════════════════════════════
    class InsiderComparisonEngine {
        constructor() {
            this.analyticsEngine = new InsiderAnalyticsEngine();
            this.comparisonData = [];
        }

        /**
         * Compare multiple companies
         */
        async compareCompanies(tickers, options = {}) {
            console.log(`📊 Comparing ${tickers.length} companies:`, tickers);

            this.comparisonData = [];

            for (const ticker of tickers) {
                try {
                    console.log(`🔍 Analyzing ${ticker}...`);
                    const analysis = await this.analyticsEngine.analyzeCompany(ticker, {
                        months: options.months || 12,
                        maxFilings: options.maxFilings || 100,
                        includeDerivatives: true,
                        includePriceImpact: false,
                        includeNetworkAnalysis: false
                    });

                    if (!analysis.error) {
                        this.comparisonData.push({
                            ticker,
                            analysis
                        });
                    } else {
                        console.warn(`⚠ Failed to analyze ${ticker}:`, analysis.error);
                    }
                } catch (error) {
                    console.error(`❌ Error analyzing ${ticker}:`, error);
                }
            }

            return this.generateComparisonReport();
        }

        /**
         * Generate comparison report
         */
        generateComparisonReport() {
            if (this.comparisonData.length === 0) {
                return { error: 'No data available for comparison' };
            }

            const report = {
                tickers: this.comparisonData.map(d => d.ticker),
                summary: this.generateSummaryTable(),
                rankings: this.generateRankings(),
                visualizations: this.generateVisualizationData()
            };

            return report;
        }

        /**
         * Generate summary table
         */
        generateSummaryTable() {
            return this.comparisonData.map(item => ({
                ticker: item.ticker,
                sentiment: item.analysis.insiderSentiment.score,
                sentimentLabel: item.analysis.insiderSentiment.label,
                transactions: item.analysis.transactionCount,
                clusters: item.analysis.clusterActivity.count,
                recommendation: item.analysis.recommendation.action,
                overallScore: item.analysis.overallScore.score
            }));
        }

        /**
         * Generate rankings
         */
        generateRankings() {
            const sorted = [...this.comparisonData].sort((a, b) => 
                b.analysis.overallScore.score - a.analysis.overallScore.score
            );

            return {
                bySentiment: sorted.map((item, idx) => ({
                    rank: idx + 1,
                    ticker: item.ticker,
                    score: item.analysis.insiderSentiment.score
                })),
                byActivity: [...this.comparisonData]
                    .sort((a, b) => b.analysis.transactionCount - a.analysis.transactionCount)
                    .map((item, idx) => ({
                        rank: idx + 1,
                        ticker: item.ticker,
                        transactions: item.analysis.transactionCount
                    })),
                byClusters: [...this.comparisonData]
                    .sort((a, b) => b.analysis.clusterActivity.count - a.analysis.clusterActivity.count)
                    .map((item, idx) => ({
                        rank: idx + 1,
                        ticker: item.ticker,
                        clusters: item.analysis.clusterActivity.count
                    }))
            };
        }

        /**
         * Generate visualization data
         */
        generateVisualizationData() {
            return {
                sentimentChart: {
                    labels: this.comparisonData.map(d => d.ticker),
                    data: this.comparisonData.map(d => d.analysis.insiderSentiment.score)
                },
                transactionChart: {
                    labels: this.comparisonData.map(d => d.ticker),
                    data: this.comparisonData.map(d => d.analysis.transactionCount)
                },
                overallScoreChart: {
                    labels: this.comparisonData.map(d => d.ticker),
                    data: this.comparisonData.map(d => d.analysis.overallScore.score)
                }
            };
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 🧩 CLASS 3: INSIDER NETWORK GRAPH
    // ═══════════════════════════════════════════════════════════════
    class InsiderNetworkGraph {
        constructor() {
            this.network = null;
            this.nodes = [];
            this.edges = [];
        }

        /**
         * Render network graph from transactions
         */
        render(transactions) {
            if (!transactions || transactions.length === 0) {
                console.warn('⚠ No transactions available for network graph');
                const container = document.getElementById('networkGraph');
                if (container) {
                    container.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 400px; color: var(--text-secondary);">
                            <div style="text-align: center;">
                                <i class="fas fa-project-diagram" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                                <p>No transaction data available for network visualization</p>
                            </div>
                        </div>
                    `;
                }
                return;
            }

            console.log('🕸 Building network graph...');

            this.buildNetwork(transactions);
            this.displayNetwork();
        }

        /**
         * Build nodes and edges from transactions
         */
        buildNetwork(transactions) {
            const insiderMap = new Map();
            const companyNode = {
                id: 'company',
                label: 'Company',
                level: 0,
                color: '#667eea',
                size: 40,
                font: { size: 18, color: '#ffffff', bold: true }
            };

            this.nodes = [companyNode];
            this.edges = [];

            // 1st degree: Insiders directly connected to company
            transactions.forEach((tx, idx) => {
                const insiderName = tx.reportingOwner?.name || `Insider ${idx}`;
                const insiderRole = tx.reportingOwner?.classification || 'Unknown';

                if (!insiderMap.has(insiderName)) {
                    const netValue = (tx.nonDerivativeTransactions || []).reduce((sum, nt) => {
                        return sum + (nt.transactionType === 'Purchase' ? nt.totalValue : -nt.totalValue);
                    }, 0);

                    const isBuyer = netValue > 0;

                    insiderMap.set(insiderName, {
                        id: `insider_${insiderMap.size}`,
                        label: insiderName,
                        role: insiderRole,
                        level: 1,
                        color: isBuyer ? '#10b981' : '#ef4444',
                        size: 25,
                        font: { size: 12, color: '#ffffff' },
                        transactions: 1,
                        totalValue: Math.abs(netValue)
                    });

                    this.nodes.push(insiderMap.get(insiderName));

                    this.edges.push({
                        from: 'company',
                        to: `insider_${insiderMap.size - 1}`,
                        width: Math.min(Math.abs(netValue) / 100000, 10),
                        color: isBuyer ? '#10b981' : '#ef4444',
                        arrows: { to: { enabled: true, scaleFactor: 0.5 } }
                    });
                } else {
                    // Update existing insider
                    const insider = insiderMap.get(insiderName);
                    insider.transactions++;
                }
            });

            // 2nd degree: Connections between insiders (same role or overlapping transactions)
            const insiders = Array.from(insiderMap.values());
            for (let i = 0; i < insiders.length; i++) {
                for (let j = i + 1; j < insiders.length; j++) {
                    if (insiders[i].role === insiders[j].role) {
                        this.edges.push({
                            from: insiders[i].id,
                            to: insiders[j].id,
                            width: 1,
                            color: { color: 'rgba(148, 163, 184, 0.3)' },
                            dashes: true
                        });
                    }
                }
            }

            console.log(`✅ Network built: ${this.nodes.length} nodes, ${this.edges.length} edges`);
        }

        /**
         * Display network using vis.js
         */
        displayNetwork() {
            const container = document.getElementById('networkGraph');

            if (!container) {
                console.error('❌ Network container not found');
                return;
            }

            // Check if vis library is loaded
            if (typeof vis === 'undefined') {
                console.error('❌ vis.js library not loaded');
                container.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">
                        <div style="text-align: center;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                            <p>Network visualization library not loaded</p>
                        </div>
                    </div>
                `;
                return;
            }

            const data = {
                nodes: new vis.DataSet(this.nodes),
                edges: new vis.DataSet(this.edges)
            };

            const options = {
                nodes: {
                    shape: 'dot',
                    borderWidth: 2,
                    borderWidthSelected: 4,
                    shadow: {
                        enabled: true,
                        color: 'rgba(0, 0, 0, 0.3)',
                        size: 10,
                        x: 0,
                        y: 0
                    }
                },
                edges: {
                    smooth: {
                        type: 'continuous',
                        roundness: 0.5
                    },
                    shadow: true
                },
                physics: {
                    enabled: true,
                    barnesHut: {
                        gravitationalConstant: -3000,
                        centralGravity: 0.3,
                        springLength: 150,
                        springConstant: 0.04,
                        damping: 0.09
                    },
                    stabilization: {
                        iterations: 200,
                        updateInterval: 25
                    }
                },
                interaction: {
                    hover: true,
                    tooltipDelay: 200,
                    zoomView: true,
                    dragView: true
                },
                layout: {
                    hierarchical: {
                        enabled: false
                    }
                }
            };

            this.network = new vis.Network(container, data, options);

            // Display stats
            this.displayNetworkStats();

            console.log('✅ Network rendered successfully');
        }

        /**
         * Display network statistics
         */
        displayNetworkStats() {
            const statsContainer = document.getElementById('networkStats');
            if (!statsContainer) return;

            const insiderCount = this.nodes.length - 1; // Exclude company node
            const connectionCount = this.edges.length;

            const buyers = this.nodes.filter(n => n.color === '#10b981').length;
            const sellers = this.nodes.filter(n => n.color === '#ef4444').length;

            statsContainer.innerHTML = `
                <div class="network-stat-grid">
                    <div class="network-stat-card">
                        <i class="fas fa-users"></i>
                        <div>
                            <div class="stat-value">${insiderCount}</div>
                            <div class="stat-label">Insiders</div>
                        </div>
                    </div>
                    <div class="network-stat-card">
                        <i class="fas fa-link"></i>
                        <div>
                            <div class="stat-value">${connectionCount}</div>
                            <div class="stat-label">Connections</div>
                        </div>
                    </div>
                    <div class="network-stat-card">
                        <i class="fas fa-arrow-up" style="color: #10b981;"></i>
                        <div>
                            <div class="stat-value">${buyers}</div>
                            <div class="stat-label">Buyers</div>
                        </div>
                    </div>
                    <div class="network-stat-card">
                        <i class="fas fa-arrow-down" style="color: #ef4444;"></i>
                        <div>
                            <div class="stat-value">${sellers}</div>
                            <div class="stat-label">Sellers</div>
                        </div>
                    </div>
                </div>
            `;
        }

        /**
         * Filter network by degree
         */
        filterByDegree(degree) {
            if (!this.network) return;

            if (degree === 1) {
                // Show only 1st degree (company + direct insiders)
                const firstDegreeEdges = this.edges.filter(e => e.from === 'company' || e.to === 'company');

                this.network.setData({
                    nodes: new vis.DataSet(this.nodes.filter(n => n.level <= 1)),
                    edges: new vis.DataSet(firstDegreeEdges)
                });
            } else if (degree === 2) {
                // Show 1st and 2nd degree
                this.network.setData({
                    nodes: new vis.DataSet(this.nodes),
                    edges: new vis.DataSet(this.edges)
                });
            } else {
                // Show all
                this.network.setData({
                    nodes: new vis.DataSet(this.nodes),
                    edges: new vis.DataSet(this.edges)
                });
            }

            this.network.fit();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // GLOBAL STATE & INSTANCES
    // ═══════════════════════════════════════════════════════════════
    const analyticsEngine = new InsiderAnalyticsEngine();
    const patternDetector = new InsiderPatternDetector();
    const comparisonEngine = new InsiderComparisonEngine();
    const networkGraph = new InsiderNetworkGraph();
    
    let currentAnalysis = null;
    let roleChartInstance = null;
    let heatmapChartInstance = null;
    let comparisonChartInstance = null;
    let currentPage = 1;
    let transactionsPerPage = 20;
    let allTransactions = [];
    let comparisonTickers = [];

    // ═══════════════════════════════════════════════════════════════
    // MAIN ANALYSIS FUNCTION
    // ═══════════════════════════════════════════════════════════════
    async function analyzeInsiderActivity() {
        const ticker = document.getElementById('tickerInput').value.trim().toUpperCase();
        
        if (!ticker) {
            showNotification('⚠ Please enter a valid ticker', 'warning');
            return;
        }

        const months = parseFloat(document.getElementById('periodSelect').value);
        const maxFilings = parseInt(document.getElementById('filingsSelect').value);

        console.log(`🔍 Analyzing ${ticker} with ${maxFilings} filings over ${months} months...`);

        const loadingState = document.getElementById('loadingState');
        const resultsContainer = document.getElementById('resultsContainer');
        
        loadingState.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        updateProgress(0, 'Initializing analysis...');

        try {
            console.log(`🔍 Analyzing insider activity for ${ticker}...`);
            
            updateProgress(10, 'Fetching CIK number...');
            
            currentAnalysis = await analyticsEngine.analyzeCompany(ticker, {
                months: months,
                maxFilings: maxFilings,
                includeDerivatives: true,
                includePriceImpact: false,
                includeNetworkAnalysis: true,
                onProgress: (progress, message) => {
                    updateProgress(progress, message);
                }
            });

            console.log('✅ Analysis complete:', currentAnalysis);

            if (!currentAnalysis || currentAnalysis.error) {
                throw new Error(currentAnalysis?.error || 'Analysis failed - no data returned');
            }

            updateProgress(95, 'Detecting advanced patterns...');
            
            if (currentAnalysis.transactions && currentAnalysis.transactions.length > 0) {
                currentAnalysis.patterns = patternDetector.detectPatterns(currentAnalysis.transactions);
            }

            updateProgress(100, 'Analysis complete!');
            
            await new Promise(resolve => setTimeout(resolve, 500));

            displayResults(currentAnalysis);
            showNotification(`✅ Analysis complete for ${ticker}`, 'success');

        } catch (error) {
            console.error('❌ Analysis error:', error);
            showNotification(`Error: ${error.message}`, 'error');
            
            resultsContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--eco-danger); margin-bottom: 20px;"></i>
                    <h2>Analysis Failed</h2>
                    <p style="color: var(--text-secondary); margin-top: 12px;">${error.message}</p>
                    <button class="primary-btn" onclick="location.reload()" style="margin-top: 24px;">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
            resultsContainer.classList.remove('hidden');
            
        } finally {
            console.log('🛑 Hiding loading state...');
            loadingState.classList.add('hidden');
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // UPDATE PROGRESS BAR
    // ═══════════════════════════════════════════════════════════════
    function updateProgress(percentage, message) {
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const loadingMessage = document.getElementById('loadingMessage');

        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
        if (message && loadingMessage) {
            loadingMessage.textContent = message;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // DISPLAY RESULTS
    // ═══════════════════════════════════════════════════════════════
    function displayResults(analysis) {
        if (!analysis || analysis.error) {
            showNotification(analysis?.error || 'No data available', 'error');
            return;
        }

        document.getElementById('resultsContainer').classList.remove('hidden');

        displayAlphyRecommendation(analysis);
        displayScoreCards(analysis);
        displayAlerts(analysis.alerts);

        if (analysis.patterns) {
            displayPatterns(analysis.patterns);
        }

        if (analysis.clusterActivity.detected) {
            displayClusters(analysis.clusterActivity.clusters);
            document.getElementById('clusterSection').classList.remove('hidden');
        } else {
            document.getElementById('clusterSection').classList.add('hidden');
        }

        displayRoleChart(analysis.roleAnalysis);
        displayTemporalHeatmap(analysis.transactions);
        
        // Render network graph
        networkGraph.render(analysis.transactions);
        
        displayTransactionsTable(analysis);

        document.getElementById('resultsContainer').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 🤖 ALPHY AI RECOMMENDATION (SIMPLIFIED - NO ROBOT, NO BIG BADGE)
    // ═══════════════════════════════════════════════════════════════
    function displayAlphyRecommendation(analysis) {
        const panel = document.getElementById('alphyRecommendationPanel');
        const recommendation = analysis.recommendation;
        const overallScore = analysis.overallScore;

        const actionColors = {
            'STRONG BUY': { color: '#10b981', icon: '🚀' },
            'BUY': { color: '#10b981', icon: '📈' },
            'HOLD': { color: '#f59e0b', icon: '⏸' },
            'SELL': { color: '#ef4444', icon: '📉' },
            'STRONG SELL': { color: '#ef4444', icon: '🔻' }
        };

        const config = actionColors[recommendation.action] || actionColors['HOLD'];
        const aiAnalysis = generateAIAnalysis(analysis);

        panel.innerHTML = `
            <div class="alphy-simple-grid">
                <!-- Action Summary -->
                <div class="alphy-summary">
                    <div class="alphy-action-row">
                        <div class="alphy-action-icon-small">${config.icon}</div>
                        <div>
                            <div class="alphy-action-text" style="color: ${config.color};">${recommendation.action}</div>
                            <div class="alphy-score-text">Score: <strong>${overallScore.score}/100</strong> • Confidence: <strong>${recommendation.confidence}</strong></div>
                        </div>
                    </div>
                </div>

                <!-- Key Insights -->
                <div class="alphy-section">
                    <h3><i class="fas fa-lightbulb"></i> Key Insights</h3>
                    <div class="insight-list">
                        ${recommendation.rationale.map(r => `
                            <div class="insight-item">
                                <i class="fas fa-check-circle"></i>
                                <span>${r}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- AI Analysis -->
                <div class="alphy-section">
                    <h3><i class="fas fa-brain"></i> AI Analysis</h3>
                    <p class="ai-text">${aiAnalysis.summary}</p>
                </div>

                <!-- Metrics Grid -->
                <div class="alphy-metrics-grid">
                    <div class="alphy-metric-compact">
                        <div class="metric-icon-small" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-label">Insider Sentiment</div>
                            <div class="metric-value">${analysis.insiderSentiment.label}</div>
                        </div>
                    </div>

                    <div class="alphy-metric-compact">
                        <div class="metric-icon-small" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-label">Active Insiders</div>
                            <div class="metric-value">${analysis.uniqueInsiders || 'N/A'}</div>
                        </div>
                    </div>

                    <div class="alphy-metric-compact">
                        <div class="metric-icon-small" style="background: linear-gradient(135deg, #ec4899, #db2777);">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-label">Risk Level</div>
                            <div class="metric-value">${aiAnalysis.riskLevel}</div>
                        </div>
                    </div>

                    <div class="alphy-metric-compact">
                        <div class="metric-icon-small" style="background: linear-gradient(135deg, #10b981, #059669);">
                            <i class="fas fa-trophy"></i>
                        </div>
                        <div class="metric-content">
                            <div class="metric-label">Data Quality</div>
                            <div class="metric-value">${analysis.dataQuality}</div>
                        </div>
                    </div>
                </div>

                <!-- Risk Factors -->
                <div class="alphy-section">
                    <h3><i class="fas fa-exclamation-triangle"></i> Risk Factors</h3>
                    <div class="risk-list">
                        ${aiAnalysis.risks.map(risk => `
                            <div class="risk-item">
                                <i class="fas fa-exclamation-circle"></i>
                                <span>${risk}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Action Items -->
                <div class="alphy-section">
                    <h3><i class="fas fa-bullseye"></i> Action Items</h3>
                    <div class="action-list">
                        ${aiAnalysis.actions.map(action => `
                            <div class="action-item">
                                <i class="fas fa-arrow-right"></i>
                                <span>${action}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════
    // GENERATE AI ANALYSIS
    // ═══════════════════════════════════════════════════════════════
    function generateAIAnalysis(analysis) {
        const sentiment = analysis.insiderSentiment.score;
        const clusters = analysis.clusterActivity.count;
        const txCount = analysis.transactionCount;

        let summary = '';
        let riskLevel = 'Medium';
        let risks = [];
        let actions = [];

        if (sentiment > 70) {
            summary = `Strong bullish signals detected. Insiders are actively purchasing shares, indicating high confidence in future performance. ${clusters > 0 ? `${clusters} cluster buying events suggest coordinated insider optimism.` : ''} Transaction volume of ${txCount} filings demonstrates significant insider engagement.`;
            riskLevel = 'Low';
            risks = [
                'Potential overvaluation if insider purchases are momentum-driven',
                'Market conditions may change despite insider confidence',
                'Regulatory scrutiny if insider activity appears unusual'
            ];
            actions = [
                'Consider accumulating shares on dips',
                'Monitor upcoming earnings and guidance for confirmation',
                'Watch for additional insider purchases as validation',
                'Set alerts for any sudden reversal in insider sentiment'
            ];
        } else if (sentiment < 30) {
            summary = `Bearish insider activity detected. Significant insider selling may indicate concerns about future prospects or overvaluation. ${txCount} transactions with predominantly negative sentiment warrant caution. Exercise prudence and wait for stabilization signals before initiating new positions.`;
            riskLevel = 'High';
            risks = [
                'Insider selling may precede negative news or earnings miss',
                'Potential significant downside if selling accelerates',
                'Market sentiment may turn increasingly negative',
                'Fundamental deterioration possible based on insider knowledge'
            ];
            actions = [
                'Avoid new positions until insider activity stabilizes',
                'Consider reducing exposure if currently holding shares',
                'Monitor news and upcoming catalysts very closely',
                'Set stop-loss orders to protect against further downside'
            ];
        } else {
            summary = `Mixed insider signals with no clear directional bias. Insiders are both buying and selling in relatively balanced proportions, suggesting uncertainty or routine portfolio rebalancing. ${txCount} transactions show conflicting signals across different insider roles. Further fundamental analysis recommended before making investment decisions.`;
            riskLevel = 'Medium';
            risks = [
                'Lack of clear insider conviction creates uncertainty',
                'Market volatility may increase without directional catalyst',
                'Conflicting signals from different insider roles (CEO vs CFO)',
                'Potential information asymmetry between insider classes'
            ];
            actions = [
                'Wait for clearer signals before taking significant action',
                'Monitor for changes in insider sentiment trend direction',
                'Focus on fundamental analysis and earnings performance',
                'Compare with peer group insider activity for context'
            ];
        }

        return {
            summary,
            riskLevel,
            risks,
            actions
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // DISPLAY SCORE CARDS
    // ═══════════════════════════════════════════════════════════════
    function displayScoreCards(analysis) {
        const container = document.getElementById('scoreContainer');
        
        const cards = [
            {
                label: 'Insider Sentiment',
                value: analysis.insiderSentiment.score,
                suffix: '/100',
                sublabel: analysis.insiderSentiment.label,
                icon: 'fa-heart-pulse',
                gradient: 'linear-gradient(135deg, #ec4899, #db2777)'
            },
            {
                label: 'Transactions',
                value: analysis.transactionCount,
                suffix: '',
                sublabel: `Last ${Math.round((new Date() - new Date(analysis.period.start)) / (1000 * 60 * 60 * 24))} days`,
                icon: 'fa-receipt',
                gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)'
            },
            {
                label: 'Cluster Activity',
                value: analysis.clusterActivity.count,
                suffix: '',
                sublabel: analysis.clusterActivity.detected ? 'Detected' : 'None',
                icon: 'fa-users',
                gradient: 'linear-gradient(135deg, #10b981, #059669)'
            },
            {
                label: 'Data Quality',
                value: analysis.dataQuality,
                suffix: '',
                sublabel: 'Reliability score',
                icon: 'fa-shield-alt',
                gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
            }
        ];

        container.innerHTML = cards.map(card => `
            <div class="score-card">
                <div class="score-icon" style="background: ${card.gradient};">
                    <i class="fas ${card.icon}"></i>
                </div>
                <div class="score-content">
                    <div class="score-label">${card.label}</div>
                    <div class="score-value">${card.value}${card.suffix}</div>
                    <div class="score-sublabel">${card.sublabel}</div>
                </div>
            </div>
        `).join('');
    }

    // ═══════════════════════════════════════════════════════════════
    // DISPLAY ALERTS
    // ═══════════════════════════════════════════════════════════════
    function displayAlerts(alerts) {
        const container = document.getElementById('alertsContainer');
        
        if (!alerts || alerts.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-tertiary);">
                    <i class="fas fa-check-circle" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p>No critical alerts detected</p>
                </div>
            `;
            return;
        }

        const icons = {
            'CLUSTER_BUYING': 'fa-users',
            'CEO_CFO_DIVERGENCE': 'fa-exclamation-triangle',
            'PRE_EARNINGS_ACTIVITY': 'fa-clock',
            'CEO_MAJOR_PURCHASE': 'fa-shopping-cart',
            'CFO_MAJOR_SALE': 'fa-hand-holding-usd',
            'STRONG_BUY_SIGNAL': 'fa-rocket',
            'STRONG_SELL_SIGNAL': 'fa-arrow-down'
        };

        container.innerHTML = alerts.map(alert => `
            <div class="alert severity-${alert.severity}">
                <div class="alert-icon">
                    <i class="fas ${icons[alert.type] || 'fa-info-circle'}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-description">${alert.description}</div>
                </div>
                <span class="alert-badge">${alert.confidence}% confidence</span>
            </div>
        `).join('');
    }

    // ═══════════════════════════════════════════════════════════════
    // DISPLAY PATTERNS
    // ═══════════════════════════════════════════════════════════════
    function displayPatterns(patterns) {
        const container = document.getElementById('patternContainer');
        
        if (!patterns || Object.keys(patterns).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 20px;">No advanced patterns detected</p>';
            return;
        }

        const patternCards = [];

        if (patterns.momentum && patterns.momentum.detected) {
            patternCards.push({
                title: 'Momentum Pattern',
                icon: 'fa-rocket',
                description: `${patterns.momentum.direction} momentum detected with ${patterns.momentum.strength}% strength (${patterns.momentum.buyCount} buys, ${patterns.momentum.sellCount} sells)`,
                color: patterns.momentum.direction === 'Bullish' ? '#10b981' : '#ef4444'
            });
        }

        if (patterns.acceleration && patterns.acceleration.detected) {
            patternCards.push({
                title: 'Acceleration Pattern',
                icon: 'fa-tachometer-alt',
                description: `Transaction velocity is ${patterns.acceleration.trend} (${patterns.acceleration.acceleration}% change)`,
                color: '#3b82f6'
            });
        }

        if (patterns.unusual && patterns.unusual.detected) {
            patternCards.push({
                title: 'Unusual Activity',
                icon: 'fa-exclamation-triangle',
                description: `${patterns.unusual.anomalies} anomalies detected (threshold: $${formatNumber(parseFloat(patterns.unusual.threshold))})`,
                color: '#f59e0b'
            });
        }

        if (patterns.seasonality && patterns.seasonality.detected) {
            patternCards.push({
                title: 'Seasonality Pattern',
                icon: 'fa-calendar-alt',
                description: `Peak activity in ${patterns.seasonality.peakMonth} (${patterns.seasonality.peakCount} transactions vs ${patterns.seasonality.avgCount} avg)`,
                color: '#8b5cf6'
            });
        }

        if (patterns.roleConcentration && patterns.roleConcentration.detected) {
            patternCards.push({
                title: 'Role Concentration',
                icon: 'fa-user-tie',
                description: `${patterns.roleConcentration.concentration}% of activity from ${patterns.roleConcentration.dominantRole}`,
                color: '#ec4899'
            });
        }

        if (patternCards.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 20px;">No significant patterns detected</p>';
            return;
        }

        container.innerHTML = patternCards.map(pattern => `
            <div class="pattern-card" style="border-left: 4px solid ${pattern.color};">
                <div class="pattern-icon" style="color: ${pattern.color};">
                    <i class="fas ${pattern.icon}"></i>
                </div>
                <div class="pattern-content">
                    <h3>${pattern.title}</h3>
                    <p>${pattern.description}</p>
                </div>
            </div>
        `).join('');
    }

    // ═══════════════════════════════════════════════════════════════
    // DISPLAY CLUSTERS
    // ═══════════════════════════════════════════════════════════════
    function displayClusters(clusters) {
        const container = document.getElementById('clusterContainer');
        
        container.innerHTML = clusters.map(cluster => `
            <div class="cluster-card">
                <div class="cluster-header">
                    <div class="cluster-date">
                        ${new Date(cluster.startDate).toLocaleDateString('en-US')}
                    </div>
                    <div class="confidence-badge">
                        ${cluster.confidence}% confidence
                    </div>
                </div>
                <h3 style="margin-bottom: 16px;">
                    ${cluster.insiderCount} insiders • ${cluster.transactionCount} transactions
                </h3>
                <div class="cluster-stats">
                    <div class="cluster-stat">
                        <div class="cluster-stat-label">Total Value</div>
                        <div class="cluster-stat-value">
                            $${formatNumber(cluster.totalValue)}
                        </div>
                    </div>
                    <div class="cluster-stat">
                        <div class="cluster-stat-label">Avg/Insider</div>
                        <div class="cluster-stat-value">
                            $${formatNumber(cluster.averageValuePerInsider)}
                        </div>
                    </div>
                </div>
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem; color: var(--text-secondary);">
                    <strong>Roles:</strong> ${cluster.insiderRoles.join(', ')}
                </div>
            </div>
        `).join('');
    }

    // ═══════════════════════════════════════════════════════════════
    // DISPLAY ROLE CHART
    // ═══════════════════════════════════════════════════════════════
    function displayRoleChart(roleAnalysis) {
        const canvas = document.getElementById('roleChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (roleChartInstance !== null) {
            console.log('🗑 Destroying previous role chart...');
            roleChartInstance.destroy();
            roleChartInstance = null;
        }
        
        const roles = Object.keys(roleAnalysis.byRole);
        const purchases = roles.map(r => roleAnalysis.byRole[r].purchaseValue);
        const sales = roles.map(r => Math.abs(roleAnalysis.byRole[r].saleValue));

        console.log('📊 Creating role chart...');
        
        roleChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: roles,
                datasets: [
                    {
                        label: 'Purchases',
                        data: purchases,
                        backgroundColor: 'rgba(16, 185, 129, 0.8)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    },
                    {
                        label: 'Sales',
                        data: sales,
                        backgroundColor: 'rgba(239, 68, 68, 0.8)',
                        borderColor: 'rgba(239, 68, 68, 1)',
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#1e293b',
                            font: { size: 14, weight: 'bold' },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(102, 126, 234, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + formatNumber(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#64748b',
                            callback: function(value) {
                                return '$' + formatNumber(value);
                            }
                        },
                        grid: {
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#64748b',
                            font: { weight: '600' }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        console.log('✅ Role chart created successfully');
    }

    // ═══════════════════════════════════════════════════════════════
    // DISPLAY TEMPORAL HEATMAP
    // ═══════════════════════════════════════════════════════════════
    function displayTemporalHeatmap(transactions) {
        const canvas = document.getElementById('heatmapChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (heatmapChartInstance !== null) {
            console.log('🗑 Destroying previous heatmap chart...');
            heatmapChartInstance.destroy();
            heatmapChartInstance = null;
        }

        // Group transactions by week
        const weeklyData = {};
        transactions.forEach(tx => {
            const date = new Date(tx.filingDate);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = { purchases: 0, sales: 0 };
            }

            const netValue = (tx.nonDerivativeTransactions || []).reduce((sum, nt) => {
                return sum + (nt.transactionType === 'Purchase' ? nt.totalValue : -nt.totalValue);
            }, 0);

            if (netValue > 0) {
                weeklyData[weekKey].purchases += netValue;
            } else {
                weeklyData[weekKey].sales += Math.abs(netValue);
            }
        });

        const labels = Object.keys(weeklyData).sort().map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const purchaseData = Object.keys(weeklyData).sort().map(k => weeklyData[k].purchases);
        const saleData = Object.keys(weeklyData).sort().map(k => weeklyData[k].sales);

        console.log('📊 Creating temporal heatmap...');

        heatmapChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Purchases',
                        data: purchaseData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Sales',
                        data: saleData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: { size: 14, weight: 'bold' },
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(102, 126, 234, 0.5)',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + formatNumber(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                            callback: value => '$' + formatNumber(value)
                        },
                        grid: { 
                            color: 'rgba(148, 163, 184, 0.1)',
                            drawBorder: false
                        }
                    },
                    x: {
                        ticks: { 
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                            maxRotation: 45,
                            minRotation: 45
                        },
                        grid: { display: false }
                    }
                }
            }
        });

        console.log('✅ Temporal heatmap created successfully');
    }

    // ═══════════════════════════════════════════════════════════════
    // DISPLAY TRANSACTIONS TABLE
    // ═══════════════════════════════════════════════════════════════
    function displayTransactionsTable(analysis) {
        const container = document.getElementById('transactionsTable');
        if (!container) return;
        
        allTransactions = (analysis.transactions || [])
            .map(t => {
                const netValue = (t.nonDerivativeTransactions || [])
                    .reduce((sum, nt) => {
                        return sum + (nt.transactionType === 'Purchase' ? nt.totalValue : -nt.totalValue);
                    }, 0);
                
                return { ...t, netValue };
            })
            .filter(t => Math.abs(t.netValue) > 0)
            .sort((a, b) => new Date(b.filingDate) - new Date(a.filingDate));

        currentPage = 1;
        
        console.log(`📋 Total transactions: ${allTransactions.length} (excluding $0 transactions)`);

        if (allTransactions.length === 0) {
            container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-tertiary);">No transactions to display</p>';
            return;
        }

        renderTransactionsPage();
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDER TRANSACTIONS PAGE
    // ═══════════════════════════════════════════════════════════════
    function renderTransactionsPage() {
        const container = document.getElementById('transactionsTable');
        if (!container) return;
        
        const start = (currentPage - 1) * transactionsPerPage;
        const end = start + transactionsPerPage;
        const pageTransactions = allTransactions.slice(start, end);
        const totalPages = Math.ceil(allTransactions.length / transactionsPerPage);

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Insider</th>
                        <th>Role</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Signal</th>
                    </tr>
                </thead>
                <tbody>
                    ${pageTransactions.map(t => {
                        const netValue = t.netValue;
                        const type = netValue > 0 ? 'Purchase' : 'Sale';
                        const badgeClass = netValue > 0 ? 'badge-buy' : 'badge-sell';
                        
                        return `
                            <tr>
                                <td>${new Date(t.filingDate).toLocaleDateString('en-US')}</td>
                                <td>${t.reportingOwner?.name || 'N/A'}</td>
                                <td>${t.reportingOwner?.classification || 'N/A'}</td>
                                <td><span class="badge ${badgeClass}">${type}</span></td>
                                <td>$${formatNumber(Math.abs(netValue))}</td>
                                <td><span class="badge ${badgeClass}">${netValue > 0 ? 'BULLISH' : 'BEARISH'}</span></td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <div class="pagination">
                <button onclick="window.InsiderFlowTracker.goToPage(1)" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-double-left"></i> First
                </button>
                <button onclick="window.InsiderFlowTracker.goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                    <i class="fas fa-angle-left"></i> Previous
                </button>
                <span>Page ${currentPage} of ${totalPages} (${allTransactions.length} total)</span>
                <button onclick="window.InsiderFlowTracker.goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                    Next <i class="fas fa-angle-right"></i>
                </button>
                <button onclick="window.InsiderFlowTracker.goToPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
                    Last <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
        `;
    }

    // ═══════════════════════════════════════════════════════════════
    // GO TO PAGE
    // ═══════════════════════════════════════════════════════════════
    function goToPage(page) {
        const totalPages = Math.ceil(allTransactions.length / transactionsPerPage);
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        renderTransactionsPage();
        
        document.getElementById('transactionsTable')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // COMPARISON FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    function addComparisonTicker() {
        const input = document.getElementById('comparisonTickerInput');
        if (!input) return;
        
        const ticker = input.value.trim().toUpperCase();
        
        if (!ticker) {
            showNotification('⚠ Please enter a ticker', 'warning');
            return;
        }

        if (comparisonTickers.includes(ticker)) {
            showNotification(`⚠ ${ticker} is already added`, 'warning');
            return;
        }

        if (comparisonTickers.length >= 5) {
            showNotification('⚠ Maximum 5 tickers allowed', 'warning');
            return;
        }

        comparisonTickers.push(ticker);
        input.value = '';
        updateComparisonTags();
        showNotification(`✅ ${ticker} added`, 'success');
    }

    function removeComparisonTicker(ticker) {
        comparisonTickers = comparisonTickers.filter(t => t !== ticker);
        updateComparisonTags();
        showNotification(`✅ ${ticker} removed`, 'info');
    }

    function updateComparisonTags() {
        const container = document.getElementById('comparisonTags');
        if (!container) return;
        
        if (comparisonTickers.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 20px; width: 100%;">No tickers added yet</p>';
            return;
        }

        container.innerHTML = comparisonTickers.map(ticker => `
            <div class="comparison-tag">
                <span>${ticker}</span>
                <button onclick="window.InsiderFlowTracker.removeComparisonTicker('${ticker}')" class="tag-remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    async function runComparison() {
        if (comparisonTickers.length < 2) {
            showNotification('⚠ Please add at least 2 tickers', 'warning');
            return;
        }

        const resultsContainer = document.getElementById('comparisonResults');
        if (!resultsContainer) return;
        
        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div class="spinner"><i class="fas fa-circle-notch"></i></div>
                <p style="margin-top: 20px; color: var(--text-secondary);">Analyzing ${comparisonTickers.length} companies...</p>
            </div>
        `;
        resultsContainer.classList.remove('hidden');

        try {
            const report = await comparisonEngine.compareCompanies(comparisonTickers, {
                months: 12,
                maxFilings: 100
            });

            if (report.error) {
                throw new Error(report.error);
            }

            displayComparisonResults(report);
            showNotification('✅ Comparison complete', 'success');

        } catch (error) {
            console.error('❌ Comparison error:', error);
            resultsContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--eco-danger);"></i>
                    <h3>Comparison Failed</h3>
                    <p style="color: var(--text-secondary); margin-top: 12px;">${error.message}</p>
                </div>
            `;
            showNotification(`Error: ${error.message}`, 'error');
        }
    }

    function displayComparisonResults(report) {
        const container = document.getElementById('comparisonResults');
        if (!container) return;
        
        container.innerHTML = `
            <div class="comparison-results">
                <h3 style="margin-bottom: 24px;">
                    <i class="fas fa-chart-bar"></i> Comparison Results
                </h3>

                <!-- Summary Table -->
                <div class="table-container" style="margin-bottom: 32px;">
                    <table>
                        <thead>
                            <tr>
                                <th>Ticker</th>
                                <th>Sentiment</th>
                                <th>Score</th>
                                <th>Transactions</th>
                                <th>Clusters</th>
                                <th>Recommendation</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${report.summary.map(item => `
                                <tr>
                                    <td><strong>${item.ticker}</strong></td>
                                    <td>
                                        <span class="badge ${item.sentiment > 60 ? 'badge-buy' : item.sentiment < 40 ? 'badge-sell' : 'badge-neutral'}">
                                            ${item.sentimentLabel}
                                        </span>
                                    </td>
                                    <td>${item.sentiment}/100</td>
                                    <td>${item.transactions}</td>
                                    <td>${item.clusters}</td>
                                    <td>
                                        <span class="badge ${item.recommendation.includes('BUY') ? 'badge-buy' : item.recommendation.includes('SELL') ? 'badge-sell' : 'badge-neutral'}">
                                            ${item.recommendation}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Comparison Chart -->
                <div class="chart-wrapper">
                    <canvas id="comparisonChart" height="80"></canvas>
                </div>

                <!-- Rankings -->
                <div style="margin-top: 32px;">
                    <h4 style="margin-bottom: 16px;"><i class="fas fa-trophy"></i> Rankings</h4>
                    <div class="ranking-grid">
                        <div class="ranking-card">
                            <h5>By Sentiment</h5>
                            <ol>
                                ${report.rankings.bySentiment.map(item => `
                                    <li><strong>${item.ticker}</strong> - ${item.score}/100</li>
                                `).join('')}
                            </ol>
                        </div>
                        <div class="ranking-card">
                            <h5>By Activity</h5>
                            <ol>
                                ${report.rankings.byActivity.map(item => `
                                    <li><strong>${item.ticker}</strong> - ${item.transactions} txs</li>
                                `).join('')}
                            </ol>
                        </div>
                        <div class="ranking-card">
                            <h5>By Clusters</h5>
                            <ol>
                                ${report.rankings.byClusters.map(item => `
                                    <li><strong>${item.ticker}</strong> - ${item.clusters} clusters</li>
                                `).join('')}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render comparison chart
        renderComparisonChart(report.visualizations);
    }

    function renderComparisonChart(vizData) {
        const canvas = document.getElementById('comparisonChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (comparisonChartInstance !== null) {
            comparisonChartInstance.destroy();
            comparisonChartInstance = null;
        }

        comparisonChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: vizData.sentimentChart.labels,
                datasets: [
                    {
                        label: 'Insider Sentiment',
                        data: vizData.sentimentChart.data,
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 2,
                        borderRadius: 8
                    },
                    {
                        label: 'Overall Score',
                        data: vizData.overallScoreChart.data,
                        backgroundColor: 'rgba(139, 92, 246, 0.8)',
                        borderColor: 'rgba(139, 92, 246, 1)',
                        borderWidth: 2,
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: { size: 14, weight: 'bold' }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary'),
                            font: { weight: 'bold' }
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // NOTIFICATION SYSTEM
    // ═══════════════════════════════════════════════════════════════
    function showNotification(message, type = 'info') {
        const existing = document.querySelectorAll('.notification');
        existing.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        notification.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════
    function formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    }

    // ═══════════════════════════════════════════════════════════════
    // EVENT LISTENERS
    // ═══════════════════════════════════════════════════════════════
    function initializeEventListeners() {
        // Main analysis
        document.getElementById('tickerInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                analyzeInsiderActivity();
            }
        });

        document.getElementById('analyzeBtn')?.addEventListener('click', analyzeInsiderActivity);
        
        document.getElementById('refreshBtn')?.addEventListener('click', () => {
            if (document.getElementById('tickerInput').value.trim()) {
                analyzeInsiderActivity();
            } else {
                showNotification('⚠ Please enter a ticker first', 'warning');
            }
        });

        // Comparison
        document.getElementById('addComparisonBtn')?.addEventListener('click', addComparisonTicker);
        document.getElementById('runComparisonBtn')?.addEventListener('click', runComparison);
        
        document.getElementById('comparisonTickerInput')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addComparisonTicker();
            }
        });

        // Network filters
        document.getElementById('showFirstDegree')?.addEventListener('click', () => {
            networkGraph.filterByDegree(1);
        });
        
        document.getElementById('showSecondDegree')?.addEventListener('click', () => {
            networkGraph.filterByDegree(2);
        });
        
        document.getElementById('showAllNodes')?.addEventListener('click', () => {
            networkGraph.filterByDegree(0);
        });

        // Focus input on load
        window.addEventListener('load', () => {
            document.getElementById('tickerInput')?.focus();
        });

        console.log('✅ Event listeners initialized');
    }

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEventListeners);
    } else {
        initializeEventListeners();
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // ═══════════════════════════════════════════════════════════════
    // GLOBAL EXPORT
    // ═══════════════════════════════════════════════════════════════
    window.InsiderFlowTracker = {
        goToPage: goToPage,
        analyzeInsiderActivity: analyzeInsiderActivity,
        removeComparisonTicker: removeComparisonTicker
    };

    console.log('🎉 Insider Flow Tracker initialized successfully!');

})();

/**
 * ═══════════════════════════════════════════════════════════════════
 * END OF INSIDER FLOW TRACKER - ULTRA-POWERFUL INTEGRATED VERSION
 * ═══════════════════════════════════════════════════════════════════
 */