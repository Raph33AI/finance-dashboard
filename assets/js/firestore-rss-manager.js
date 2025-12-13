/**
 * ════════════════════════════════════════════════════════════════
 * FIRESTORE RSS MANAGER
 * Gère la sauvegarde des données RSS dans Firestore
 * ════════════════════════════════════════════════════════════════
 */

class FirestoreRSSManager {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.currentUser = null;
        
        // Écouter les changements d'authentification
        this.auth.onAuthStateChanged(user => {
            this.currentUser = user;
            console.log('🔐 User status:', user ? user.email : 'Not logged in');
        });
    }

    // ════════════════════════════════════════════════════════════
    // WATCHLISTS
    // ════════════════════════════════════════════════════════════

    /**
     * Ajouter un ticker à la watchlist
     */
    async addToWatchlist(ticker, companyName) {
        if (!this.currentUser) {
            throw new Error('User not authenticated');
        }

        try {
            const watchlistRef = this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .collection('watchlist')
                .doc(ticker);

            await watchlistRef.set({
                ticker: ticker.toUpperCase(),
                companyName: companyName,
                addedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastViewed: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log(`✅ Added ${ticker} to watchlist`);
            return true;

        } catch (error) {
            console.error('❌ Error adding to watchlist:', error);
            throw error;
        }
    }

    /**
     * Retirer un ticker de la watchlist
     */
    async removeFromWatchlist(ticker) {
        if (!this.currentUser) return;

        try {
            await this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .collection('watchlist')
                .doc(ticker)
                .delete();

            console.log(`✅ Removed ${ticker} from watchlist`);
            return true;

        } catch (error) {
            console.error('❌ Error removing from watchlist:', error);
            throw error;
        }
    }

    /**
     * Obtenir la watchlist complète
     */
    async getWatchlist() {
        if (!this.currentUser) return [];

        try {
            const snapshot = await this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .collection('watchlist')
                .orderBy('addedAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                addedAt: doc.data().addedAt?.toDate()
            }));

        } catch (error) {
            console.error('❌ Error getting watchlist:', error);
            return [];
        }
    }

    /**
     * Vérifier si un ticker est dans la watchlist
     */
    async isInWatchlist(ticker) {
        if (!this.currentUser) return false;

        try {
            const doc = await this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .collection('watchlist')
                .doc(ticker)
                .get();

            return doc.exists;

        } catch (error) {
            console.error('❌ Error checking watchlist:', error);
            return false;
        }
    }

    // ════════════════════════════════════════════════════════════
    // HISTORIQUE DE NAVIGATION
    // ════════════════════════════════════════════════════════════

    /**
     * Enregistrer une visite d'article
     */
    async recordArticleView(article) {
        if (!this.currentUser) return;

        try {
            const historyRef = this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .collection('history');

            await historyRef.add({
                articleId: article.id,
                title: article.title,
                source: article.source,
                sourceName: article.sourceName,
                link: article.link,
                tickers: article.tickers || [],
                viewedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log(`📖 Recorded view: ${article.title}`);

        } catch (error) {
            console.error('❌ Error recording view:', error);
        }
    }

    /**
     * Obtenir l'historique de navigation
     */
    async getHistory(limit = 50) {
        if (!this.currentUser) return [];

        try {
            const snapshot = await this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .collection('history')
                .orderBy('viewedAt', 'desc')
                .limit(limit)
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                viewedAt: doc.data().viewedAt?.toDate()
            }));

        } catch (error) {
            console.error('❌ Error getting history:', error);
            return [];
        }
    }

    /**
     * Effacer l'historique
     */
    async clearHistory() {
        if (!this.currentUser) return;

        try {
            const snapshot = await this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .collection('history')
                .get();

            const batch = this.db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();

            console.log('✅ History cleared');

        } catch (error) {
            console.error('❌ Error clearing history:', error);
        }
    }

    // ════════════════════════════════════════════════════════════
    // ALERTES PERSONNALISÉES
    // ════════════════════════════════════════════════════════════

    /**
     * Créer une alerte
     */
    async createAlert(alertData) {
        if (!this.currentUser) {
            throw new Error('User not authenticated');
        }

        try {
            const alertRef = this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .collection('alerts');

            const newAlert = {
                ticker: alertData.ticker,
                companyName: alertData.companyName,
                type: alertData.type, // 'news', 'sentiment', 'keyword'
                keywords: alertData.keywords || [],
                sentimentThreshold: alertData.sentimentThreshold || null,
                enabled: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastTriggered: null,
                triggerCount: 0
            };

            const docRef = await alertRef.add(newAlert);
            console.log(`✅ Alert created: ${docRef.id}`);
            
            return { id: docRef.id, ...newAlert };

        } catch (error) {
            console.error('❌ Error creating alert:', error);
            throw error;
        }
    }

    /**
     * Obtenir toutes les alertes
     */
    async getAlerts() {
        if (!this.currentUser) return [];

        try {
            const snapshot = await this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .collection('alerts')
                .orderBy('createdAt', 'desc')
                .get();

            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                lastTriggered: doc.data().lastTriggered?.toDate()
            }));

        } catch (error) {
            console.error('❌ Error getting alerts:', error);
            return [];
        }
    }

    /**
     * Activer/Désactiver une alerte
     */
    async toggleAlert(alertId, enabled) {
        if (!this.currentUser) return;

        try {
            await this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .collection('alerts')
                .doc(alertId)
                .update({ enabled: enabled });

            console.log(`✅ Alert ${alertId} ${enabled ? 'enabled' : 'disabled'}`);

        } catch (error) {
            console.error('❌ Error toggling alert:', error);
        }
    }

    /**
     * Supprimer une alerte
     */
    async deleteAlert(alertId) {
        if (!this.currentUser) return;

        try {
            await this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .collection('alerts')
                .doc(alertId)
                .delete();

            console.log(`✅ Alert ${alertId} deleted`);

        } catch (error) {
            console.error('❌ Error deleting alert:', error);
        }
    }

    /**
     * Enregistrer le déclenchement d'une alerte
     */
    async recordAlertTrigger(alertId, article) {
        if (!this.currentUser) return;

        try {
            const alertRef = this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .collection('alerts')
                .doc(alertId);

            await alertRef.update({
                lastTriggered: firebase.firestore.FieldValue.serverTimestamp(),
                triggerCount: firebase.firestore.FieldValue.increment(1)
            });

            // Sauvegarder dans l'historique des déclenchements
            await this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .collection('alert_history')
                .add({
                    alertId: alertId,
                    articleId: article.id,
                    articleTitle: article.title,
                    articleLink: article.link,
                    triggeredAt: firebase.firestore.FieldValue.serverTimestamp()
                });

            console.log(`🔔 Alert ${alertId} triggered`);

        } catch (error) {
            console.error('❌ Error recording alert trigger:', error);
        }
    }

    // ════════════════════════════════════════════════════════════
    // ANALYSE DE SENTIMENT (CACHE)
    // ════════════════════════════════════════════════════════════

    /**
     * Sauvegarder l'analyse de sentiment d'un article
     */
    async saveSentimentAnalysis(articleId, sentimentData) {
        try {
            const sentimentRef = this.db
                .collection('sentiment_cache')
                .doc(articleId);

            await sentimentRef.set({
                ...sentimentData,
                analyzedAt: firebase.firestore.FieldValue.serverTimestamp(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
            });

            console.log(`✅ Sentiment saved for ${articleId}`);

        } catch (error) {
            console.error('❌ Error saving sentiment:', error);
        }
    }

    /**
     * Obtenir l'analyse de sentiment d'un article
     */
    async getSentimentAnalysis(articleId) {
        try {
            const doc = await this.db
                .collection('sentiment_cache')
                .doc(articleId)
                .get();

            if (!doc.exists) return null;

            const data = doc.data();
            
            // Vérifier l'expiration
            if (data.expiresAt.toDate() < new Date()) {
                await doc.ref.delete();
                return null;
            }

            return data;

        } catch (error) {
            console.error('❌ Error getting sentiment:', error);
            return null;
        }
    }

    /**
     * Obtenir le sentiment global par ticker
     */
    async getTickerSentiment(ticker, days = 7) {
        try {
            const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

            const snapshot = await this.db
                .collection('sentiment_cache')
                .where('tickers', 'array-contains', ticker)
                .where('analyzedAt', '>', cutoffDate)
                .get();

            if (snapshot.empty) return null;

            let totalScore = 0;
            let count = 0;
            const sentiments = { positive: 0, neutral: 0, negative: 0 };

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                totalScore += data.score;
                count++;
                sentiments[data.sentiment]++;
            });

            return {
                ticker: ticker,
                averageScore: totalScore / count,
                distribution: sentiments,
                totalArticles: count,
                period: `${days} days`
            };

        } catch (error) {
            console.error('❌ Error getting ticker sentiment:', error);
            return null;
        }
    }

    // ════════════════════════════════════════════════════════════
    // PRÉFÉRENCES UTILISATEUR
    // ════════════════════════════════════════════════════════════

    /**
     * Sauvegarder les préférences utilisateur
     */
    async savePreferences(preferences) {
        if (!this.currentUser) return;

        try {
            await this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .set({
                    preferences: preferences,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

            console.log('✅ Preferences saved');

        } catch (error) {
            console.error('❌ Error saving preferences:', error);
        }
    }

    /**
     * Obtenir les préférences utilisateur
     */
    async getPreferences() {
        if (!this.currentUser) return null;

        try {
            const doc = await this.db
                .collection('users')
                .doc(this.currentUser.uid)
                .get();

            return doc.exists ? doc.data().preferences : null;

        } catch (error) {
            console.error('❌ Error getting preferences:', error);
            return null;
        }
    }
}

// Export global
window.FirestoreRSSManager = FirestoreRSSManager;