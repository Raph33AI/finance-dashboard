/**
 * ========================================
 * ACCESS CONTROL SYSTEM v2.1
 * Système de contrôle d'accès basé sur les plans
 * ========================================
 * 
 * CORRECTION MAJEURE v2.1:
 * - Plan gratuit accepte les statuts 'active' ET 'inactive'
 * - Plan gratuit a accès aux pages de base par défaut
 * - Plans payants nécessitent subscriptionStatus = 'active'
 */

// ========================================
// CONFIGURATION
// ========================================

const AccessControlConfig = {
    plans: {
        free: {
            name: 'Gratuit',
            displayName: 'Plan Gratuit',
            level: 0,
            color: '#6c757d',
            icon: '🆓',
            features: [
                'Tableau de bord financier',
                'Visualisation des données de base',
                'Graphiques simples',
                'Historique limité (30 jours)',
                'Support communautaire'
            ]
        },
        pro: {
            name: 'Pro',
            displayName: 'Plan Pro',
            level: 1,
            color: '#667eea',
            icon: '⭐',
            price: '29€/mois',
            features: [
                'Toutes les fonctionnalités Gratuit',
                'Analyses avancées',
                'Simulations Monte Carlo',
                'Machine Learning basique',
                'Historique illimité',
                'Support prioritaire',
                'Export des données'
            ]
        },
        platinum: {
            name: 'Platinum',
            displayName: 'Plan Platinum',
            level: 2,
            color: '#ffd700',
            icon: '💎',
            price: '99€/mois',
            features: [
                'Toutes les fonctionnalités Pro',
                'Risk Parity Advanced',
                'ML Prédictif avancé',
                'Optimisation de portefeuille',
                'API personnalisée',
                'Support dédié 24/7',
                'Analyses personnalisées'
            ]
        }
    },

    pages: {
        // ========================================
        // PAGES PUBLIQUES (aucune restriction)
        // ========================================
        'index.html': { requiredPlans: [], public: true },
        'landing.html': { requiredPlans: [], public: true },
        'login.html': { requiredPlans: [], public: true },
        'register.html': { requiredPlans: [], public: true },
        'pricing.html': { requiredPlans: [], public: true },

        // ========================================
        // PAGES PLAN GRATUIT (niveau 0+)
        // ========================================
        'dashboard-financier.html': {
            requiredPlans: ['free', 'pro', 'platinum'],
            minLevel: 0,
            description: 'Tableau de bord financier'
        },
        'analyst-coverage.html': {
            requiredPlans: ['free', 'pro', 'platinum'],
            minLevel: 0,
            description: 'Couverture des analystes'
        },
        'trend-prediction.html': {
            requiredPlans: ['free', 'pro', 'platinum'],
            minLevel: 0,
            description: 'Prédiction des tendances'
        },

        // ========================================
        // PAGES PLAN PRO (niveau 1+)
        // ========================================
        'advanced-analysis.html': {
            requiredPlans: ['pro', 'platinum'],
            minLevel: 1,
            description: 'Analyses avancées'
        },
        'monte-carlo.html': {
            requiredPlans: ['pro', 'platinum'],
            minLevel: 1,
            description: 'Simulations Monte Carlo'
        },
        'ml-prediction.html': {
            requiredPlans: ['pro', 'platinum'],
            minLevel: 1,
            description: 'Prédictions Machine Learning'
        },

        // ========================================
        // PAGES PLAN PLATINUM (niveau 2)
        // ========================================
        'risk-parity.html': {
            requiredPlans: ['platinum'],
            minLevel: 2,
            description: 'Risk Parity Advanced'
        },
        'portfolio-optimization.html': {
            requiredPlans: ['platinum'],
            minLevel: 2,
            description: 'Optimisation de portefeuille'
        },
        'custom-api.html': {
            requiredPlans: ['platinum'],
            minLevel: 2,
            description: 'API personnalisée'
        }
    },

    redirects: {
        unauthorized: 'login.html',
        insufficientPlan: 'pricing.html'
    }
};

// ========================================
// CLASSE PRINCIPALE
// ========================================

class AccessControl {
    constructor(config) {
        this.config = config;
        this.currentUser = null;
        this.currentPlan = null;
        this.isInitialized = false;
        
        console.log('🔐 Access Control System initialized');
        this.init();
    }

    /**
     * Initialisation du système
     */
    async init() {
        try {
            // Attendre que Firebase soit prêt
            await this.waitForFirebase();
            
            // Observer les changements d'authentification
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    await this.onUserAuthenticated(user);
                } else {
                    this.onUserLoggedOut();
                }
            });

            this.isInitialized = true;
            console.log('✅ Access Control System ready');

        } catch (error) {
            console.error('❌ Access Control initialization error:', error);
        }
    }

    /**
     * Attendre que Firebase soit initialisé
     */
    waitForFirebase() {
        return new Promise((resolve) => {
            if (typeof firebase !== 'undefined' && firebase.auth) {
                resolve();
            } else {
                const checkInterval = setInterval(() => {
                    if (typeof firebase !== 'undefined' && firebase.auth) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            }
        });
    }

    /**
     * Gestion de l'utilisateur authentifié
     */
    async onUserAuthenticated(user) {
        try {
            this.currentUser = user;
            
            // Charger les données utilisateur
            const userData = await this.loadUserData(user.uid);
            
            if (userData) {
                this.currentPlan = userData.plan || 'free';
                
                // Vérifier l'accès à la page actuelle
                await this.checkCurrentPageAccess();
            }

        } catch (error) {
            console.error('❌ Error handling authenticated user:', error);
        }
    }

    /**
     * Gestion de la déconnexion
     */
    onUserLoggedOut() {
        this.currentUser = null;
        this.currentPlan = null;

        // Rediriger vers login si on est sur une page protégée
        const currentPage = this.getCurrentPage();
        const pageConfig = this.config.pages[currentPage];

        if (pageConfig && !pageConfig.public) {
            this.redirectToLogin();
        }
    }

    /**
     * Charger les données utilisateur depuis Firestore
     */
    async loadUserData(uid) {
        try {
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(uid)
                .get();

            if (userDoc.exists) {
                return userDoc.data();
            }
            return null;

        } catch (error) {
            console.error('❌ Error loading user data:', error);
            return null;
        }
    }

    /**
     * Obtenir le nom de la page actuelle
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page;
    }

    /**
     * Vérifier l'accès à la page actuelle
     */
    async checkCurrentPageAccess() {
        const currentPage = this.getCurrentPage();
        console.log('📄 Current page:', currentPage);

        const pageConfig = this.config.pages[currentPage];

        if (!pageConfig) {
            console.log('✅ Page not protected - access granted');
            return true;
        }

        if (pageConfig.public) {
            console.log('✅ Public page - access granted');
            return true;
        }

        console.log('🔒 Protected page detected - checking access...');
        const hasAccess = await this.checkPageAccess(currentPage);

        if (!hasAccess) {
            console.log('⛔ Access denied - modal displayed');
        }

        return hasAccess;
    }

    /**
     * ✅ MÉTHODE CORRIGÉE : Vérifier l'accès à une page
     */
    async checkPageAccess(pageName) {
        try {
            console.log('🔍 Checking access for page:', pageName);

            // Vérifier si la page est protégée
            const pageConfig = this.config.pages[pageName];
            if (!pageConfig || pageConfig.public) {
                console.log('✅ Page not protected - access granted');
                return true;
            }

            // Vérifier l'authentification
            const user = firebase.auth().currentUser;
            if (!user) {
                console.warn('⚠️ No authenticated user');
                this.redirectToLogin();
                return false;
            }

            // Récupérer les données utilisateur
            const userDoc = await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .get();

            if (!userDoc.exists) {
                console.error('❌ User document not found');
                this.redirectToLogin();
                return false;
            }

            const userData = userDoc.data();
            const currentPlan = userData.plan || 'free';
            const subscriptionStatus = userData.subscriptionStatus || 'inactive';

            console.log('👤 User:', user.email);
            console.log('📊 Current plan:', currentPlan);
            console.log('📊 Subscription status:', subscriptionStatus);

            // ✅✅✅ CORRECTION MAJEURE : PLAN GRATUIT ✅✅✅
            if (currentPlan === 'free') {
                // Plan gratuit : vérifier uniquement si la page est accessible en gratuit
                const requiredPlans = pageConfig.requiredPlans || [];
                
                if (requiredPlans.length === 0 || requiredPlans.includes('free')) {
                    console.log('✅ Free plan - Access granted to free page');
                    return true;
                } else {
                    console.log('⛔ Page requires premium plan');
                    this.showUpgradeModal(currentPlan, 'feature_locked');
                    return false;
                }
            }

            // ✅✅✅ PLANS PAYANTS : VÉRIFIER LE STATUT ✅✅✅
            if (currentPlan === 'pro' || currentPlan === 'platinum') {
                // Pour les plans payants, vérifier le statut de souscription
                if (subscriptionStatus !== 'active') {
                    console.warn('⚠️ Invalid subscription status for paid plan:', subscriptionStatus);
                    this.showUpgradeModal(currentPlan, 'expired');
                    return false;
                }
            }

            // Vérifier si le plan permet l'accès
            const requiredPlans = pageConfig.requiredPlans || [];
            const hasAccess = this.hasRequiredPlan(currentPlan, requiredPlans);

            if (hasAccess) {
                console.log('✅ Access granted');
                return true;
            } else {
                console.log('⛔ Access denied - Insufficient plan');
                this.showUpgradeModal(currentPlan, 'feature_locked');
                return false;
            }

        } catch (error) {
            console.error('❌ Error checking page access:', error);
            return false;
        }
    }

    /**
     * Vérifier si le plan actuel permet l'accès
     */
    hasRequiredPlan(currentPlan, requiredPlans) {
        if (!requiredPlans || requiredPlans.length === 0) {
            return true;
        }

        // Vérifier si le plan actuel est dans la liste
        if (requiredPlans.includes(currentPlan)) {
            return true;
        }

        // Vérifier par niveau (un plan supérieur donne accès)
        const currentLevel = this.config.plans[currentPlan]?.level || 0;
        
        for (const plan of requiredPlans) {
            const requiredLevel = this.config.plans[plan]?.level || 0;
            if (currentLevel >= requiredLevel) {
                return true;
            }
        }

        return false;
    }

    /**
     * Afficher le modal de mise à niveau
     */
    showUpgradeModal(currentPlan, reason = 'feature_locked') {
        console.log('🔔 Showing upgrade modal for plan:', currentPlan, '| Reason:', reason);

        // Supprimer le modal existant
        const existingModal = document.getElementById('upgrade-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Déterminer le plan recommandé
        const recommendedPlan = this.getRecommendedUpgrade(currentPlan);
        const planConfig = this.config.plans[recommendedPlan];

        // Créer le modal
        const modal = this.createUpgradeModal(currentPlan, recommendedPlan, planConfig, reason);
        document.body.appendChild(modal);

        // Afficher avec animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Gérer les événements
        this.setupModalEvents(modal, currentPlan);
    }

    /**
     * Obtenir le plan recommandé pour la mise à niveau
     */
    getRecommendedUpgrade(currentPlan) {
        switch (currentPlan) {
            case 'free':
                return 'pro';
            case 'pro':
                return 'platinum';
            default:
                return 'pro';
        }
    }

    /**
     * Créer le HTML du modal
     */
    createUpgradeModal(currentPlan, recommendedPlan, planConfig, reason) {
        const modal = document.createElement('div');
        modal.id = 'upgrade-modal';
        modal.className = 'access-control-modal';

        const isDarkMode = document.body.classList.contains('dark-mode');

        const reasonMessages = {
            'feature_locked': {
                icon: '🔒',
                title: 'Fonctionnalité Premium',
                message: 'Cette page est réservée aux abonnés Premium.'
            },
            'expired': {
                icon: '⏰',
                title: 'Abonnement Expiré',
                message: 'Votre abonnement a expiré. Renouvelez pour continuer.'
            },
            'limit_reached': {
                icon: '📊',
                title: 'Limite Atteinte',
                message: 'Vous avez atteint la limite de votre plan gratuit.'
            }
        };

        const reasonData = reasonMessages[reason] || reasonMessages['feature_locked'];

        modal.innerHTML = `
            <div class="modal-backdrop" data-modal-close></div>
            <div class="modal-content ${isDarkMode ? 'dark-mode' : ''}">
                <!-- Header -->
                <div class="modal-header">
                    <div class="modal-icon">${reasonData.icon}</div>
                    <h2 class="modal-title">${reasonData.title}</h2>
                    <button class="modal-close" data-modal-close aria-label="Fermer">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <!-- Body -->
                <div class="modal-body">
                    <p class="modal-message">${reasonData.message}</p>

                    <!-- Plan actuel -->
                    <div class="current-plan-badge">
                        <span class="badge-icon">${this.config.plans[currentPlan]?.icon || '📦'}</span>
                        <span class="badge-text">Votre plan actuel : ${this.config.plans[currentPlan]?.displayName || 'Gratuit'}</span>
                    </div>

                    <!-- Plan recommandé -->
                    <div class="recommended-plan" style="border-color: ${planConfig.color}">
                        <div class="plan-header">
                            <span class="plan-icon">${planConfig.icon}</span>
                            <h3 class="plan-name">${planConfig.displayName}</h3>
                            ${planConfig.price ? `<div class="plan-price">${planConfig.price}</div>` : ''}
                        </div>

                        <ul class="plan-features">
                            ${planConfig.features.map(feature => `
                                <li>
                                    <i class="fas fa-check-circle" style="color: ${planConfig.color}"></i>
                                    <span>${feature}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>

                <!-- Footer -->
                <div class="modal-footer">
                    <button class="btn-secondary" data-modal-close>
                        <i class="fas fa-arrow-left"></i>
                        Retour
                    </button>
                    <button class="btn-primary" data-upgrade-action style="background: ${planConfig.color}">
                        <i class="fas fa-crown"></i>
                        Passer à ${planConfig.displayName}
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Configurer les événements du modal
     */
    setupModalEvents(modal, currentPlan) {
        // Boutons de fermeture
        const closeButtons = modal.querySelectorAll('[data-modal-close]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal(modal);
            });
        });

        // Bouton de mise à niveau
        const upgradeBtn = modal.querySelector('[data-upgrade-action]');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', () => {
                this.closeModal(modal);
                this.redirectToPricing();
            });
        }

        // Fermer avec Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeModal(modal);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Fermer le modal
     */
    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    /**
     * Rediriger vers la page de tarification
     */
    redirectToPricing() {
        console.log('📍 Redirecting to pricing page...');
        window.location.href = 'pricing.html';
    }

    /**
     * Rediriger vers la page de connexion
     */
    redirectToLogin() {
        console.log('📍 Redirecting to login page...');
        const currentPage = this.getCurrentPage();
        window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}`;
    }

    /**
     * Vérifier l'accès à une fonctionnalité spécifique
     */
    async checkFeatureAccess(featureName, requiredPlans = ['pro', 'platinum']) {
        if (!this.currentUser) {
            this.redirectToLogin();
            return false;
        }

        const hasAccess = this.hasRequiredPlan(this.currentPlan, requiredPlans);

        if (!hasAccess) {
            this.showUpgradeModal(this.currentPlan, 'feature_locked');
        }

        return hasAccess;
    }

    /**
     * Obtenir les informations du plan actuel
     */
    getCurrentPlanInfo() {
        if (!this.currentPlan) {
            return this.config.plans.free;
        }
        return this.config.plans[this.currentPlan] || this.config.plans.free;
    }

    /**
     * Méthode publique pour vérifier l'accès
     */
    async hasAccess(requiredPlans) {
        if (!this.currentUser) {
            return false;
        }

        return this.hasRequiredPlan(this.currentPlan, requiredPlans);
    }
}

// ========================================
// STYLES CSS
// ========================================

const accessControlStyles = `
<style>
/* Modal Backdrop */
.access-control-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.access-control-modal.show {
    opacity: 1;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
}

/* Modal Content */
.modal-content {
    position: relative;
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    transform: translateY(20px);
    transition: transform 0.3s ease;
}

.access-control-modal.show .modal-content {
    transform: translateY(0);
}

.modal-content.dark-mode {
    background: #1e293b;
    color: #e2e8f0;
}

/* Header */
.modal-header {
    padding: 32px 32px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    position: relative;
}

.modal-content.dark-mode .modal-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
}

.modal-icon {
    font-size: 3rem;
    text-align: center;
    margin-bottom: 16px;
}

.modal-title {
    font-size: 1.75rem;
    font-weight: 700;
    text-align: center;
    margin: 0;
    color: #1e293b;
}

.modal-content.dark-mode .modal-title {
    color: #e2e8f0;
}

.modal-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.05);
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    color: #64748b;
}

.modal-close:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: rotate(90deg);
}

.modal-content.dark-mode .modal-close {
    background: rgba(255, 255, 255, 0.05);
    color: #cbd5e1;
}

.modal-content.dark-mode .modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
}

/* Body */
.modal-body {
    padding: 32px;
}

.modal-message {
    font-size: 1.1rem;
    text-align: center;
    color: #64748b;
    margin: 0 0 24px;
    line-height: 1.6;
}

.modal-content.dark-mode .modal-message {
    color: #94a3b8;
}

.current-plan-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 24px;
    background: rgba(102, 126, 234, 0.1);
    border-radius: 12px;
    margin-bottom: 24px;
    font-weight: 600;
    color: #667eea;
}

.badge-icon {
    font-size: 1.25rem;
}

/* Plan Recommandé */
.recommended-plan {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    border: 2px solid #667eea;
    border-radius: 16px;
    padding: 24px;
    margin-top: 24px;
}

.plan-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.modal-content.dark-mode .plan-header {
    border-bottom-color: rgba(255, 255, 255, 0.1);
}

.plan-icon {
    font-size: 2rem;
}

.plan-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    flex: 1;
    color: #1e293b;
}

.modal-content.dark-mode .plan-name {
    color: #e2e8f0;
}

.plan-price {
    font-size: 1.25rem;
    font-weight: 700;
    color: #667eea;
}

.plan-features {
    list-style: none;
    padding: 0;
    margin: 0;
}

.plan-features li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 8px 0;
    color: #475569;
}

.modal-content.dark-mode .plan-features li {
    color: #cbd5e1;
}

.plan-features i {
    margin-top: 2px;
    font-size: 1.1rem;
}

/* Footer */
.modal-footer {
    padding: 24px 32px 32px;
    display: flex;
    gap: 12px;
    justify-content: center;
}

.btn-secondary,
.btn-primary {
    padding: 14px 28px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.btn-secondary {
    background: rgba(0, 0, 0, 0.05);
    color: #64748b;
}

.btn-secondary:hover {
    background: rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.modal-content.dark-mode .btn-secondary {
    background: rgba(255, 255, 255, 0.05);
    color: #cbd5e1;
}

.modal-content.dark-mode .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.1);
}

.btn-primary {
    background: #667eea;
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
    .modal-content {
        max-width: 95%;
        margin: 20px;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 20px;
    }

    .modal-title {
        font-size: 1.5rem;
    }

    .modal-footer {
        flex-direction: column;
    }

    .btn-secondary,
    .btn-primary {
        width: 100%;
        justify-content: center;
    }
}

/* Animations */
@keyframes slideInDown {
    from {
        opacity: 0;
        transform: translateY(-50px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.access-control-modal.show .modal-content {
    animation: slideInDown 0.3s ease;
}
</style>
`;

// Injecter les styles
if (!document.getElementById('access-control-styles')) {
    document.head.insertAdjacentHTML('beforeend', accessControlStyles);
    const styleTag = document.head.lastElementChild;
    styleTag.id = 'access-control-styles';
}

// ========================================
// INITIALISATION GLOBALE
// ========================================

// Instance globale
window.AccessControlSystem = new AccessControl(AccessControlConfig);

// Export pour utilisation dans d'autres scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AccessControl, AccessControlConfig };
}