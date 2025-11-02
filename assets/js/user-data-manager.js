/* ═══════════════════════════════════════════════════════════════
   USER DATA MANAGER - Gestion centralisée des données utilisateur
   Sauvegarde/Chargement dans Firestore par utilisateur
   ═══════════════════════════════════════════════════════════════ */

class UserDataManager {
    constructor() {
        this.currentUserId = null;
        this.userDataCache = {};
        this.autoSaveEnabled = true;
        this.autoSaveDelay = 2000; // 2 secondes
        this.autoSaveTimeout = null;
        
        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        // Écouter les changements d'authentification
        if (typeof firebaseAuth !== 'undefined') {
            firebaseAuth.onAuthStateChanged((user) => {
                if (user) {
                    this.currentUserId = user.uid;
                    console.log('✅ User Data Manager initialized for:', user.email);
                    this.loadAllUserData();
                } else {
                    this.currentUserId = null;
                    this.userDataCache = {};
                    console.log('ℹ️ User logged out, data cleared');
                }
            });
        }
    }

    // ============================================
    // PORTFOLIOS
    // ============================================

    /**
     * Sauvegarder un portfolio
     */
    async savePortfolio(portfolioData, portfolioId = null) {
        if (!this.currentUserId) {
            throw new Error('User not authenticated');
        }

        try {
            const portfolioRef = portfolioId
                ? firebaseDb.collection('users').doc(this.currentUserId).collection('portfolios').doc(portfolioId)
                : firebaseDb.collection('users').doc(this.currentUserId).collection('portfolios').doc();

            const dataToSave = {
                ...portfolioData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                userId: this.currentUserId
            };

            if (!portfolioId) {
                dataToSave.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            }

            await portfolioRef.set(dataToSave, { merge: true });

            console.log('✅ Portfolio saved:', portfolioRef.id);
            
            // Log action
            await this.logUserAction('portfolio_saved', { portfolioId: portfolioRef.id });

            return portfolioRef.id;
        } catch (error) {
            console.error('❌ Error saving portfolio:', error);
            throw error;
        }
    }

    /**
     * Charger tous les portfolios de l'utilisateur
     */
    async loadPortfolios() {
        if (!this.currentUserId) {
            throw new Error('User not authenticated');
        }

        try {
            const snapshot = await firebaseDb
                .collection('users')
                .doc(this.currentUserId)
                .collection('portfolios')
                .orderBy('updatedAt', 'desc')
                .get();

            const portfolios = [];
            snapshot.forEach(doc => {
                portfolios.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`✅ Loaded ${portfolios.length} portfolios`);
            return portfolios;
        } catch (error) {
            console.error('❌ Error loading portfolios:', error);
            throw error;
        }
    }

    /**
     * Charger un portfolio spécifique
     */
    async loadPortfolio(portfolioId) {
        if (!this.currentUserId) {
            throw new Error('User not authenticated');
        }

        try {
            const doc = await firebaseDb
                .collection('users')
                .doc(this.currentUserId)
                .collection('portfolios')
                .doc(portfolioId)
                .get();

            if (doc.exists) {
                console.log('✅ Portfolio loaded:', portfolioId);
                return { id: doc.id, ...doc.data() };
            } else {
                throw new Error('Portfolio not found');
            }
        } catch (error) {
            console.error('❌ Error loading portfolio:', error);
            throw error;
        }
    }

    /**
     * Supprimer un portfolio
     */
    async deletePortfolio(portfolioId) {
        if (!this.currentUserId) {
            throw new Error('User not authenticated');
        }

        try {
            await firebaseDb
                .collection('users')
                .doc(this.currentUserId)
                .collection('portfolios')
                .doc(portfolioId)
                .delete();

            console.log('✅ Portfolio deleted:', portfolioId);
            
            // Log action
            await this.logUserAction('portfolio_deleted', { portfolioId });
        } catch (error) {
            console.error('❌ Error deleting portfolio:', error);
            throw error;
        }
    }

    // ============================================
    // SIMULATIONS
    // ============================================

    /**
     * Sauvegarder une simulation
     */
    async saveSimulation(simulationData, simulationId = null) {
        if (!this.currentUserId) {
            throw new Error('User not authenticated');
        }

        try {
            const simulationRef = simulationId
                ? firebaseDb.collection('users').doc(this.currentUserId).collection('simulations').doc(simulationId)
                : firebaseDb.collection('users').doc(this.currentUserId).collection('simulations').doc();

            const dataToSave = {
                ...simulationData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                userId: this.currentUserId
            };

            if (!simulationId) {
                dataToSave.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            }

            await simulationRef.set(dataToSave, { merge: true });

            console.log('✅ Simulation saved:', simulationRef.id);
            
            // Log action
            await this.logUserAction('simulation_saved', { 
                simulationId: simulationRef.id,
                type: simulationData.type 
            });

            return simulationRef.id;
        } catch (error) {
            console.error('❌ Error saving simulation:', error);
            throw error;
        }
    }

    /**
     * Charger toutes les simulations
     */
    async loadSimulations(type = null) {
        if (!this.currentUserId) {
            throw new Error('User not authenticated');
        }

        try {
            let query = firebaseDb
                .collection('users')
                .doc(this.currentUserId)
                .collection('simulations');

            if (type) {
                query = query.where('type', '==', type);
            }

            const snapshot = await query.orderBy('updatedAt', 'desc').get();

            const simulations = [];
            snapshot.forEach(doc => {
                simulations.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`✅ Loaded ${simulations.length} simulations`);
            return simulations;
        } catch (error) {
            console.error('❌ Error loading simulations:', error);
            throw error;
        }
    }

    /**
     * Charger une simulation spécifique
     */
    async loadSimulation(simulationId) {
        if (!this.currentUserId) {
            throw new Error('User not authenticated');
        }

        try {
            const doc = await firebaseDb
                .collection('users')
                .doc(this.currentUserId)
                .collection('simulations')
                .doc(simulationId)
                .get();

            if (doc.exists) {
                console.log('✅ Simulation loaded:', simulationId);
                return { id: doc.id, ...doc.data() };
            } else {
                throw new Error('Simulation not found');
            }
        } catch (error) {
            console.error('❌ Error loading simulation:', error);
            throw error;
        }
    }

    /**
     * Supprimer une simulation
     */
    async deleteSimulation(simulationId) {
        if (!this.currentUserId) {
            throw new Error('User not authenticated');
        }

        try {
            await firebaseDb
                .collection('users')
                .doc(this.currentUserId)
                .collection('simulations')
                .doc(simulationId)
                .delete();

            console.log('✅ Simulation deleted:', simulationId);
            
            // Log action
            await this.logUserAction('simulation_deleted', { simulationId });
        } catch (error) {
            console.error('❌ Error deleting simulation:', error);
            throw error;
        }
    }

    // ============================================
    // PREFERENCES
    // ============================================

    /**
     * Sauvegarder les préférences utilisateur
     */
    async savePreferences(preferences) {
        if (!this.currentUserId) {
            throw new Error('User not authenticated');
        }

        try {
            await firebaseDb
                .collection('users')
                .doc(this.currentUserId)
                .collection('preferences')
                .doc('settings')
                .set({
                    ...preferences,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

            console.log('✅ Preferences saved');
            
            // Mettre à jour le cache
            this.userDataCache.preferences = preferences;
        } catch (error) {
            console.error('❌ Error saving preferences:', error);
            throw error;
        }
    }

    /**
     * Charger les préférences utilisateur
     */
    async loadPreferences() {
        if (!this.currentUserId) {
            throw new Error('User not authenticated');
        }

        try {
            const doc = await firebaseDb
                .collection('users')
                .doc(this.currentUserId)
                .collection('preferences')
                .doc('settings')
                .get();

            if (doc.exists) {
                const preferences = doc.data();
                this.userDataCache.preferences = preferences;
                console.log('✅ Preferences loaded');
                return preferences;
            } else {
                // Retourner les préférences par défaut
                const defaultPreferences = {
                    theme: 'light',
                    currency: 'USD',
                    language: 'en',
                    notifications: {
                        email: true,
                        portfolio: true,
                        market: true
                    }
                };
                
                // Sauvegarder les préférences par défaut
                await this.savePreferences(defaultPreferences);
                return defaultPreferences;
            }
        } catch (error) {
            console.error('❌ Error loading preferences:', error);
            throw error;
        }
    }

    // ============================================
    // HISTORY / LOGS
    // ============================================

    /**
     * Logger une action utilisateur
     */
    async logUserAction(action, data = {}) {
        if (!this.currentUserId) {
            return; // Silently fail if not authenticated
        }

        try {
            await firebaseDb
                .collection('users')
                .doc(this.currentUserId)
                .collection('history')
                .add({
                    action,
                    data,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    userAgent: navigator.userAgent
                });

            console.log('📝 Action logged:', action);
        } catch (error) {
            console.error('❌ Error logging action:', error);
            // Don't throw - logging shouldn't break the app
        }
    }

    /**
     * Charger l'historique utilisateur
     */
    async loadHistory(limit = 50) {
        if (!this.currentUserId) {
            throw new Error('User not authenticated');
        }

        try {
            const snapshot = await firebaseDb
                .collection('users')
                .doc(this.currentUserId)
                .collection('history')
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .get();

            const history = [];
            snapshot.forEach(doc => {
                history.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`✅ Loaded ${history.length} history entries`);
            return history;
        } catch (error) {
            console.error('❌ Error loading history:', error);
            throw error;
        }
    }

    // ============================================
    // AUTO-SAVE
    // ============================================

    /**
     * Activer la sauvegarde automatique avec debounce
     */
    scheduleAutoSave(saveFunction, data) {
        if (!this.autoSaveEnabled) return;

        // Annuler le timeout précédent
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        // Planifier la nouvelle sauvegarde
        this.autoSaveTimeout = setTimeout(() => {
            console.log('💾 Auto-saving...');
            saveFunction(data);
        }, this.autoSaveDelay);
    }

    /**
     * Activer/Désactiver l'auto-save
     */
    setAutoSave(enabled) {
        this.autoSaveEnabled = enabled;
        console.log(`Auto-save ${enabled ? 'enabled' : 'disabled'}`);
    }

    // ============================================
    // UTILITY
    // ============================================

    /**
     * Charger toutes les données utilisateur
     */
    async loadAllUserData() {
        if (!this.currentUserId) {
            throw new Error('User not authenticated');
        }

        try {
            const [portfolios, simulations, preferences] = await Promise.all([
                this.loadPortfolios().catch(() => []),
                this.loadSimulations().catch(() => []),
                this.loadPreferences().catch(() => ({}))
            ]);

            this.userDataCache = {
                portfolios,
                simulations,
                preferences
            };

            console.log('✅ All user data loaded');
            
            // Émettre un événement global
            window.dispatchEvent(new CustomEvent('userDataLoaded', { 
                detail: this.userDataCache 
            }));

            return this.userDataCache;
        } catch (error) {
            console.error('❌ Error loading user data:', error);
            throw error;
        }
    }

    /**
     * Obtenir les données en cache
     */
    getCachedData() {
        return this.userDataCache;
    }

    /**
     * Vérifier si l'utilisateur est authentifié
     */
    isAuthenticated() {
        return this.currentUserId !== null;
    }

    /**
     * Obtenir l'ID de l'utilisateur actuel
     */
    getCurrentUserId() {
        return this.currentUserId;
    }
}

// ============================================
// INITIALISATION GLOBALE
// ============================================

let userDataManager;

// Initialiser quand Firebase est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof firebase !== 'undefined' && typeof firebaseAuth !== 'undefined') {
            userDataManager = new UserDataManager();
            window.userDataManager = userDataManager; // Exposer globalement
            console.log('✅ User Data Manager initialized');
        }
    });
} else {
    if (typeof firebase !== 'undefined' && typeof firebaseAuth !== 'undefined') {
        userDataManager = new UserDataManager();
        window.userDataManager = userDataManager;
        console.log('✅ User Data Manager initialized');
    }
}

// Export pour utilisation module (optionnel)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserDataManager;
}