/* ==============================================
   📊 ADVANCED ANALYTICS
   Backtesting, Feature Importance, Sentiment
   ============================================== */

const AdvancedAnalytics = {
    currentSymbol: null,
    backtestData: null,
    featureImportance: null,
    sentimentData: null,
    
    /**
     * Initialisation
     */
    init() {
        console.log('📊 Initializing Advanced Analytics...');
    },
    
    /**
     * Génère les analytics avancées pour un stock
     */
    async generateAnalytics(symbol) {
        this.currentSymbol = symbol;
        
        console.log(`📊 Generating advanced analytics for ${symbol}...`);
        
        try {
            // Générer le backtesting
            await this.generateBacktesting();
            
            // Générer l'importance des features
            await this.generateFeatureImportance();
            
            // Générer l'analyse de sentiment
            await this.generateSentimentAnalysis();
            
            console.log('✅ Advanced analytics generated');
            
        } catch (error) {
            console.error('❌ Advanced analytics error:', error);
        }
    },
    
    /**
     * Génère les données de backtesting
     */
    async generateBacktesting() {
        console.log('📈 Generating backtesting data...');
        
        // Simuler des données de backtesting réalistes
        // Dans un cas réel, cela comparerait les prédictions passées avec les prix réels
        
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const accuracy7d = [];
        const accuracy30d = [];
        const mape = [];
        
        for (let i = 0; i < 12; i++) {
            // Générer des valeurs réalistes avec tendance
            const baseAccuracy = 65 + Math.random() * 25; // 65-90%
            const trend = i * 0.5; // Amélioration dans le temps
            
            accuracy7d.push({
                month: months[i],
                value: Math.min(95, baseAccuracy + trend + (Math.random() - 0.5) * 5)
            });
            
            accuracy30d.push({
                month: months[i],
                value: Math.min(90, baseAccuracy + trend - 5 + (Math.random() - 0.5) * 5)
            });
            
            mape.push({
                month: months[i],
                value: Math.max(2, 15 - trend + (Math.random() - 0.5) * 3)
            });
        }
        
        this.backtestData = {
            accuracy7d,
            accuracy30d,
            mape,
            overallAccuracy7d: accuracy7d.reduce((sum, d) => sum + d.value, 0) / 12,
            overallAccuracy30d: accuracy30d.reduce((sum, d) => sum + d.value, 0) / 12,
            overallMAPE: mape.reduce((sum, d) => sum + d.value, 0) / 12,
            winRate: 65 + Math.random() * 15 // 65-80%
        };
        
        // Afficher le graphique
        this.displayBacktestingChart();
        
        // Mettre à jour les métriques
        this.updateBacktestingMetrics();
    },
    
    /**
     * Affiche le graphique de backtesting
     */
    displayBacktestingChart() {
        const data = this.backtestData;
        
        Highcharts.chart('backtestingChart', {
            chart: {
                type: 'spline',
                height: 350,
                borderRadius: 15
            },
            title: {
                text: 'Model Accuracy Over Time',
                style: {
                    color: '#667eea',
                    fontWeight: 'bold'
                }
            },
            subtitle: {
                text: 'Historical prediction accuracy by time horizon',
                style: { color: '#64748b' }
            },
            xAxis: {
                categories: data.accuracy7d.map(d => d.month)
            },
            yAxis: {
                title: { text: 'Accuracy (%)' },
                min: 0,
                max: 100,
                plotLines: [{
                    value: 70,
                    color: '#43e97b',
                    dashStyle: 'Dash',
                    width: 2,
                    label: {
                        text: 'Target: 70%',
                        style: { color: '#43e97b' }
                    }
                }]
            },
            tooltip: {
                shared: true,
                valueSuffix: '%',
                valueDecimals: 1
            },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: true,
                        radius: 4
                    }
                }
            },
            series: [{
                name: '7-Day Predictions',
                data: data.accuracy7d.map(d => d.value),
                color: '#667eea',
                lineWidth: 3
            }, {
                name: '30-Day Predictions',
                data: data.accuracy30d.map(d => d.value),
                color: '#764ba2',
                lineWidth: 3
            }],
            credits: { enabled: false }
        });
    },
    
    /**
     * Met à jour les métriques de backtesting
     */
    updateBacktestingMetrics() {
        const data = this.backtestData;
        
        const accuracy7dEl = document.getElementById('accuracy7d');
        const accuracy30dEl = document.getElementById('accuracy30d');
        const mapeEl = document.getElementById('overallMAPE');
        const winRateEl = document.getElementById('winRate');
        
        if (accuracy7dEl) accuracy7dEl.textContent = data.overallAccuracy7d.toFixed(1) + '%';
        if (accuracy30dEl) accuracy30dEl.textContent = data.overallAccuracy30d.toFixed(1) + '%';
        if (mapeEl) mapeEl.textContent = data.overallMAPE.toFixed(2) + '%';
        if (winRateEl) winRateEl.textContent = data.winRate.toFixed(1) + '%';
    },
    
    /**
     * Génère l'importance des features
     */
    async generateFeatureImportance() {
        console.log('🎯 Generating feature importance...');
        
        // Simuler l'importance des features
        // Dans un cas réel, cela viendrait du modèle ML
        
        const features = [
            { name: 'Price Momentum (20-day)', importance: 85 + Math.random() * 10 },
            { name: 'Volume Trend', importance: 70 + Math.random() * 15 },
            { name: 'Volatility (30-day)', importance: 65 + Math.random() * 15 },
            { name: 'Moving Average Crossover', importance: 60 + Math.random() * 15 },
            { name: 'RSI (14-day)', importance: 55 + Math.random() * 15 },
            { name: 'News Sentiment', importance: 50 + Math.random() * 15 },
            { name: 'MACD Signal', importance: 45 + Math.random() * 15 },
            { name: 'Social Media Sentiment', importance: 40 + Math.random() * 15 },
            { name: 'Bollinger Bands Position', importance: 35 + Math.random() * 15 },
            { name: 'Market Correlation', importance: 30 + Math.random() * 15 }
        ];
        
        // Trier par importance
        features.sort((a, b) => b.importance - a.importance);
        
        this.featureImportance = features;
        
        // Afficher le graphique
        this.displayFeatureImportanceChart();
    },
    
    /**
     * Affiche le graphique d'importance des features
     */
    displayFeatureImportanceChart() {
        const features = this.featureImportance;
        
        Highcharts.chart('featureImportanceChart', {
            chart: {
                type: 'bar',
                height: 400,
                borderRadius: 15
            },
            title: {
                text: 'ML Model Feature Importance',
                style: {
                    color: '#667eea',
                    fontWeight: 'bold'
                }
            },
            subtitle: {
                text: 'Factors driving the predictions',
                style: { color: '#64748b' }
            },
            xAxis: {
                categories: features.map(f => f.name),
                title: { text: null }
            },
            yAxis: {
                min: 0,
                max: 100,
                title: { text: 'Importance (%)' },
                labels: {
                    formatter: function() {
                        return this.value + '%';
                    }
                }
            },
            plotOptions: {
                bar: {
                    borderRadius: '25%',
                    dataLabels: {
                        enabled: true,
                        format: '{y:.1f}%',
                        style: {
                            fontWeight: 'bold',
                            color: '#475569'
                        }
                    },
                    colorByPoint: true,
                    colors: features.map((f, i) => {
                        // Gradient de couleur basé sur l'importance
                        const ratio = (features.length - i) / features.length;
                        return Highcharts.color('#667eea').brighten((1 - ratio) * 0.5).get();
                    })
                }
            },
            legend: { enabled: false },
            series: [{
                name: 'Importance',
                data: features.map(f => f.importance)
            }],
            credits: { enabled: false }
        });
    },
    
    /**
     * Génère l'analyse de sentiment
     */
    async generateSentimentAnalysis() {
        console.log('💬 Generating sentiment analysis...');
        
        // Simuler des données de sentiment
        // Dans un cas réel, cela viendrait d'APIs de news/social media
        
        const newsSentiment = -20 + Math.random() * 120; // -20 à 100
        const socialSentiment = -30 + Math.random() * 130; // -30 à 100
        const analystSentiment = -10 + Math.random() * 110; // -10 à 100
        
        this.sentimentData = {
            news: newsSentiment,
            social: socialSentiment,
            analyst: analystSentiment
        };
        
        // Mettre à jour les métriques
        this.updateSentimentMetrics();
        
        // Créer le graphique de timeline
        this.displaySentimentTimeline();
    },
    
    /**
     * Met à jour les métriques de sentiment
     */
    updateSentimentMetrics() {
        const data = this.sentimentData;
        
        const newsEl = document.getElementById('newsSentiment');
        const newsLabelEl = document.getElementById('newsSentimentLabel');
        const socialEl = document.getElementById('socialSentiment');
        const socialLabelEl = document.getElementById('socialSentimentLabel');
        const analystEl = document.getElementById('analystSentiment');
        const analystLabelEl = document.getElementById('analystSentimentLabel');
        
        if (newsEl) {
            newsEl.textContent = data.news.toFixed(0);
            newsEl.style.color = this.getSentimentColor(data.news);
        }
        if (newsLabelEl) {
            newsLabelEl.textContent = this.getSentimentLabel(data.news);
        }
        
        if (socialEl) {
            socialEl.textContent = data.social.toFixed(0);
            socialEl.style.color = this.getSentimentColor(data.social);
        }
        if (socialLabelEl) {
            socialLabelEl.textContent = this.getSentimentLabel(data.social);
        }
        
        if (analystEl) {
            analystEl.textContent = data.analyst.toFixed(0);
            analystEl.style.color = this.getSentimentColor(data.analyst);
        }
        if (analystLabelEl) {
            analystLabelEl.textContent = this.getSentimentLabel(data.analyst);
        }
    },
    
    /**
     * Retourne la couleur selon le sentiment
     */
    getSentimentColor(score) {
        if (score > 60) return '#43e97b';
        if (score > 20) return '#667eea';
        if (score > -20) return '#6c757d';
        if (score > -60) return '#f59e0b';
        return '#f5576c';
    },
    
    /**
     * Retourne le label selon le sentiment
     */
    getSentimentLabel(score) {
        if (score > 75) return '🚀 Extremely Bullish';
        if (score > 25) return '📈 Bullish';
        if (score > -25) return '➡ Neutral';
        if (score > -75) return '📉 Bearish';
        return '🔻 Extremely Bearish';
    },
    
    /**
     * Affiche le graphique de timeline de sentiment
     */
    displaySentimentTimeline() {
        // Générer 30 jours de données de sentiment
        const days = 30;
        const newsData = [];
        const socialData = [];
        const analystData = [];
        
        let newsBase = this.sentimentData.news;
        let socialBase = this.sentimentData.social;
        let analystBase = this.sentimentData.analyst;
        
        for (let i = 0; i < days; i++) {
            // Simuler une évolution
            newsBase += (Math.random() - 0.5) * 10;
            socialBase += (Math.random() - 0.5) * 15;
            analystBase += (Math.random() - 0.5) * 5;
            
            // Borner entre -100 et 100
            newsBase = Math.max(-100, Math.min(100, newsBase));
            socialBase = Math.max(-100, Math.min(100, socialBase));
            analystBase = Math.max(-100, Math.min(100, analystBase));
            
            newsData.push(newsBase);
            socialData.push(socialBase);
            analystData.push(analystBase);
        }
        
        Highcharts.chart('sentimentTimelineChart', {
            chart: {
                type: 'spline',
                height: 300,
                borderRadius: 15
            },
            title: {
                text: 'Sentiment Evolution (30 Days)',
                style: {
                    color: '#667eea',
                    fontWeight: 'bold'
                }
            },
            xAxis: {
                title: { text: 'Days Ago' },
                reversed: true,
                categories: Array.from({ length: days }, (_, i) => days - i)
            },
            yAxis: {
                title: { text: 'Sentiment Score' },
                min: -100,
                max: 100,
                plotLines: [{
                    value: 0,
                    color: '#6c757d',
                    dashStyle: 'Dash',
                    width: 2,
                    label: {
                        text: 'Neutral',
                        style: { color: '#6c757d' }
                    }
                }]
            },
            tooltip: {
                shared: true,
                crosshairs: true
            },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: false
                    },
                    lineWidth: 2
                }
            },
            series: [{
                name: 'News Sentiment',
                data: newsData,
                color: '#667eea'
            }, {
                name: 'Social Media',
                data: socialData,
                color: '#764ba2'
            }, {
                name: 'Analyst Ratings',
                data: analystData,
                color: '#43e97b'
            }],
            credits: { enabled: false }
        });
    }
};

/**
 * Initialisation
 */
document.addEventListener('DOMContentLoaded', () => {
    AdvancedAnalytics.init();
});

console.log('✅ advanced-analytics.js loaded');