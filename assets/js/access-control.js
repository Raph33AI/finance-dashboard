/* ═══════════════════════════════════════════════════════════════
   ACCESS CONTROL SYSTEM - AlphaVault AI
   VERSION 3.0 - CONFIGURATION COMPLÈTE DES PLANS
   Redirection automatique vers checkout.html
   ═══════════════════════════════════════════════════════════════ */

console.log('🔐 Access Control System v3.0 initialized');

// ═══════════════════════════════════════════════════════════════
// ✅ CONFIGURATION DES PLANS ET ACCÈS
// ═══════════════════════════════════════════════════════════════

const ACCESS_LEVELS = {
    // ✅ PLAN GRATUIT / BASIC
    free: {
        name: 'Free',
        level: 0,
        requiresActiveSubscription: false, // ✅ Pas besoin de vérifier le statut
        pages: [
            'dashboard-financier.html',
            'monte-carlo.html',
            'portfolio-optimizer.html'
        ],
        features: [
            'portfolio-tracking',
            'basic-data',
            'monte-carlo-basic',
            'portfolio-optimization-basic'
        ]
    },
    
    basic: {
        name: 'Basic',
        level: 0,
        requiresActiveSubscription: false, // ✅ Pas besoin de vérifier le statut
        pages: [
            'dashboard-financier.html',
            'monte-carlo.html',
            'portfolio-optimizer.html'
        ],
        features: [
            'portfolio-tracking',
            'basic-data',
            'monte-carlo-basic',
            'portfolio-optimization-basic'
        ]
    },
    
    // ✅ PLAN PRO
    pro: {
        name: 'Pro',
        level: 1,
        requiresActiveSubscription: true, // ✅ Vérifier le statut pour les plans payants
        pages: [
            // Pages Basic
            'dashboard-financier.html',
            'monte-carlo.html',
            'portfolio-optimizer.html',
            // Pages Pro
            'investments-analytics.html',
            'risk-parity.html',
            'scenario-analysis.html',
            'market-data.html',
            'trend-prediction.html',
            'market-intelligence.html'
        ],
        features: [
            'all-basic',
            'advanced-analytics',
            'risk-parity',
            'scenario-analysis',
            'real-time-data',
            'trend-prediction',
            'market-intelligence'
        ]
    },
    
    // ✅ CODE PROMO : FREEPRO (équivalent PRO gratuit)
    freepro: {
        name: 'Free Pro',
        level: 1,
        requiresActiveSubscription: false, // ✅ Gratuit avec code promo
        pages: [
            // Mêmes pages que Pro
            'dashboard-financier.html',
            'monte-carlo.html',
            'portfolio-optimizer.html',
            'investments-analytics.html',
            'risk-parity.html',
            'scenario-analysis.html',
            'market-data.html',
            'trend-prediction.html',
            'market-intelligence.html'
        ],
        features: [
            'all-basic',
            'advanced-analytics',
            'risk-parity',
            'scenario-analysis',
            'real-time-data',
            'trend-prediction',
            'market-intelligence'
        ]
    },
    
    // ✅ PLAN PLATINUM
    platinum: {
        name: 'Platinum',
        level: 2,
        requiresActiveSubscription: true, // ✅ Vérifier le statut pour les plans payants
        pages: ['all'], // ✅ Accès à TOUTES les pages
        features: ['all']
    },
    
    // ✅ CODE PROMO : FREEPLATINUM (équivalent PLATINUM gratuit)
    freeplatinum: {
        name: 'Free Platinum',
        level: 2,
        requiresActiveSubscription: false, // ✅ Gratuit avec code promo
        pages: ['all'], // ✅ Accès à TOUTES les pages
        features: ['all']
    }
};

// ═══════════════════════════════════════════════════════════════
// ✅ CATÉGORISATION DES PAGES
// ═══════════════════════════════════════════════════════════════

const PAGE_CATEGORIES = {
    // Pages accessibles SANS connexion
    public: [
        'index.html',
        'about.html',
        'auth.html',
        'checkout.html',
        'contact.html',
        'pricing.html',
        'privacy.html',
        'security.html',
        'success.html',
        'terms.html'
    ],
    
    // Pages accessibles PAR TOUS les utilisateurs connectés (profil, paramètres)
    authenticated: [
        'settings.html',
        'user-profile.html',
        'interactive-demo.html',
        'netlify.html',
        'chatbot-integration.html'
    ],
    
    // Pages BASIC / FREE (niveau 0)
    basic: [
        'dashboard-financier.html',
        'monte-carlo.html',
        'portfolio-optimizer.html'
    ],
    
    // Pages PRO (niveau 1) - en PLUS de Basic
    pro: [
        'investments-analytics.html',
        'risk-parity.html',
        'scenario-analysis.html',
        'market-data.html',
        'trend-prediction.html',
        'market-intelligence.html'
    ],
    
    // Pages PLATINUM ONLY (niveau 2)
    platinum: [
        'advanced-analysis.html',
        'analyst-coverage.html',
        'chatbot-fullpage.html',
        'company-insights.html',
        'earnings-estimates.html'
    ]
};

// ═══════════════════════════════════════════════════════════════
// ✅ FONCTION PRINCIPALE : VÉRIFIER L'ACCÈS À UNE PAGE
// ═══════════════════════════════════════════════════════════════

async function checkPageAccess(pageName) {
    try {
        console.log(`🔍 Checking access for page: ${pageName}`);
        
        // ═══════════════════════════════════════════════════════════
        // 1️⃣ VÉRIFIER SI PAGE PUBLIQUE
        // ═══════════════════════════════════════════════════════════
        if (PAGE_CATEGORIES.public.includes(pageName)) {
            console.log('🌐 Public page - access granted');
            return true;
        }
        
        // ═══════════════════════════════════════════════════════════
        // 2️⃣ VÉRIFIER L'AUTHENTIFICATION
        // ═══════════════════════════════════════════════════════════
        const user = firebase.auth().currentUser;
        
        if (!user) {
            console.warn('⚠️ User not logged in');
            redirectToLogin();
            return false;
        }
        
        // ═══════════════════════════════════════════════════════════
        // 3️⃣ RÉCUPÉRER LES DONNÉES UTILISATEUR
        // ═══════════════════════════════════════════════════════════
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .get();
        
        if (!userDoc.exists) {
            console.error('❌ User document not found in Firestore');
            redirectToLogin();
            return false;
        }
        
        const userData = userDoc.data();
        let userPlan = (userData?.plan || 'free').toLowerCase();
        const subscriptionStatus = (userData?.subscriptionStatus || 'inactive').toLowerCase();
        const promoCode = (userData?.promoCode || '').toUpperCase();
        
        console.log(`👤 User: ${user.email}`);
        console.log(`📊 Original plan: ${userPlan}`);
        console.log(`📊 Subscription status: ${subscriptionStatus}`);
        console.log(`🎟️ Promo code: ${promoCode || 'none'}`);
        
        // ═══════════════════════════════════════════════════════════
        // 4️⃣ GESTION DES CODES PROMO
        // ═══════════════════════════════════════════════════════════
        if (promoCode === 'FREEPRO') {
            userPlan = 'freepro';
            console.log(`🎁 Promo code applied: FREEPRO → Plan upgraded to: freepro`);
        } else if (promoCode === 'FREEPLATINUM') {
            userPlan = 'freeplatinum';
            console.log(`🎁 Promo code applied: FREEPLATINUM → Plan upgraded to: freeplatinum`);
        }
        
        // ═══════════════════════════════════════════════════════════
        // 5️⃣ VÉRIFIER LE STATUT D'ABONNEMENT (selon le plan)
        // ═══════════════════════════════════════════════════════════
        const planConfig = ACCESS_LEVELS[userPlan];
        
        if (!planConfig) {
            console.error(`❌ Unknown plan: ${userPlan}`);
            userPlan = 'free'; // Fallback vers plan gratuit
        }
        
        // ✅ Vérifier si le plan nécessite un abonnement actif
        if (planConfig.requiresActiveSubscription) {
            const validStatuses = ['active', 'trialing'];
            
            if (!validStatuses.includes(subscriptionStatus)) {
                console.warn(`⚠️ Plan "${userPlan}" requires active subscription but status is: ${subscriptionStatus}`);
                showUpgradeModal(userPlan, 'expired');
                return false;
            }
            
            console.log(`✅ Subscription status validated for paid plan`);
        } else {
            console.log(`✅ Plan "${userPlan}" does not require active subscription`);
        }
        
        console.log(`🔑 Effective access level: ${userPlan} (level ${planConfig.level})`);
        
        // ═══════════════════════════════════════════════════════════
        // 6️⃣ VÉRIFIER L'ACCÈS À LA PAGE (LOGIQUE HIÉRARCHIQUE)
        // ═══════════════════════════════════════════════════════════
        
        // ✅ PLATINUM / FREEPLATINUM = Accès à TOUTES les pages
        if (userPlan === 'platinum' || userPlan === 'freeplatinum') {
            console.log('✅ Access granted (Platinum - full access)');
            return true;
        }
        
        // ✅ Pages authentifiées (accessibles par TOUS les utilisateurs connectés)
        if (PAGE_CATEGORIES.authenticated.includes(pageName)) {
            console.log('✅ Access granted (Authenticated page)');
            return true;
        }
        
        // ✅ Vérifier si la page est dans la liste d'accès du plan
        const allowedPages = planConfig.pages || [];
        
        if (allowedPages.includes('all') || allowedPages.includes(pageName)) {
            console.log(`✅ Access granted (Page in ${userPlan} access list)`);
            return true;
        }
        
        // ✅ LOGIQUE HIÉRARCHIQUE : Si niveau >= niveau requis
        const pageLevel = getPageRequiredLevel(pageName);
        
        if (planConfig.level >= pageLevel) {
            console.log(`✅ Access granted (Level ${planConfig.level} >= required ${pageLevel})`);
            return true;
        }
        
        // ❌ ACCÈS REFUSÉ
        console.warn(`⛔ Access denied for ${pageName} - User plan: ${userPlan} (level ${planConfig.level})`);
        
        // Déterminer quel upgrade suggérer
        if (pageLevel === 2) {
            showUpgradeModal(userPlan, 'platinum_required');
        } else if (pageLevel === 1) {
            showUpgradeModal(userPlan, 'pro_required');
        } else {
            showUpgradeModal(userPlan, 'insufficient');
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Error checking page access:', error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// ✅ DÉTERMINER LE NIVEAU REQUIS POUR UNE PAGE
// ═══════════════════════════════════════════════════════════════

function getPageRequiredLevel(pageName) {
    if (PAGE_CATEGORIES.public.includes(pageName) || 
        PAGE_CATEGORIES.authenticated.includes(pageName)) {
        return 0;
    }
    
    if (PAGE_CATEGORIES.basic.includes(pageName)) {
        return 0; // Basic = niveau 0
    }
    
    if (PAGE_CATEGORIES.pro.includes(pageName)) {
        return 1; // Pro = niveau 1
    }
    
    if (PAGE_CATEGORIES.platinum.includes(pageName)) {
        return 2; // Platinum = niveau 2
    }
    
    // Par défaut, considérer comme Basic
    return 0;
}

// ═══════════════════════════════════════════════════════════════
// ✅ AFFICHER UNE MODALE D'UPGRADE (REDIRECTION VERS CHECKOUT)
// ═══════════════════════════════════════════════════════════════

function showUpgradeModal(currentPlan, reason = 'insufficient') {
    console.log('🔔 Showing upgrade modal for plan:', currentPlan, '| Reason:', reason);
    
    // Supprimer le modal existant si présent
    const existingModal = document.getElementById('upgrade-modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // ✅ Masquer le contenu de la page
    hidePageContent();
    
    // ✅ Messages personnalisés selon la raison
    const messages = {
        pro_required: {
            title: '🔒 Pro Feature',
            description: 'This page requires the <strong>Pro</strong> or <strong>Platinum</strong> plan.',
            icon: '👑',
            suggestedPlan: 'Pro'
        },
        platinum_required: {
            title: '💎 Platinum Exclusive',
            description: 'This page is exclusively available with the <strong>Platinum</strong> plan.',
            icon: '💎',
            suggestedPlan: 'Platinum'
        },
        expired: {
            title: '⏰ Subscription Expired',
            description: 'Your subscription has expired. Renew now to regain access to premium features.',
            icon: '⏰',
            suggestedPlan: currentPlan
        },
        insufficient: {
            title: '🔒 Premium Access Required',
            description: 'Upgrade your plan to access this premium feature.',
            icon: '🔐',
            suggestedPlan: 'Pro'
        }
    };
    
    const msg = messages[reason] || messages.insufficient;
    
    // Créer une modale glassmorphism élégante
    const modal = document.createElement('div');
    modal.id = 'upgrade-modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 24px;
            padding: 48px;
            max-width: 520px;
            width: 90%;
            text-align: center;
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        " id="upgrade-modal-content">
            <div style="font-size: 72px; margin-bottom: 20px;">
                ${msg.icon}
            </div>
            <h2 style="
                color: white;
                font-size: 32px;
                margin-bottom: 16px;
                font-weight: 800;
                letter-spacing: -0.5px;
            ">${msg.title}</h2>
            <p style="
                color: rgba(255, 255, 255, 0.95);
                font-size: 16px;
                margin-bottom: 12px;
                line-height: 1.6;
            ">${msg.description}</p>
            <p style="
                margin-top: 20px;
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
                font-weight: 600;
            ">
                Your current plan: <span style="
                    background: rgba(255, 255, 255, 0.25);
                    padding: 4px 12px;
                    border-radius: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">${currentPlan}</span>
            </p>
            <div style="
                display: flex;
                gap: 16px;
                justify-content: center;
                margin-top: 32px;
                flex-wrap: wrap;
            ">
                <button id="btn-upgrade-now" style="
                    background: white;
                    color: #667eea;
                    border: none;
                    border-radius: 14px;
                    padding: 16px 36px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    Upgrade to ${msg.suggestedPlan}
                </button>
                <button id="btn-cancel-modal" style="
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.4);
                    border-radius: 14px;
                    padding: 16px 36px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                ">
                    Go Back
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animation d'entrée
    setTimeout(() => {
        modal.style.opacity = '1';
        document.getElementById('upgrade-modal-content').style.transform = 'scale(1)';
    }, 10);
    
    // ═══════════════════════════════════════════════════════════
    // ✅✅✅ REDIRECTION VERS CHECKOUT.HTML ✅✅✅
    // ═══════════════════════════════════════════════════════════
    
    document.getElementById('btn-upgrade-now').addEventListener('click', () => {
        console.log('🛒 Redirecting to checkout page...');
        window.location.href = 'checkout.html';
    });
    
    document.getElementById('btn-cancel-modal').addEventListener('click', () => {
        console.log('🔙 User cancelled - redirecting to dashboard...');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
            window.location.href = 'dashboard-financier.html';
        }, 300);
    });
    
    // ═══════════════════════════════════════════════════════════
    // Empêcher la fermeture en cliquant à l'extérieur (animation de secousse)
    // ═══════════════════════════════════════════════════════════
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            const content = document.getElementById('upgrade-modal-content');
            content.style.animation = 'shake 0.5s';
            setTimeout(() => {
                content.style.animation = '';
            }, 500);
        }
    });
    
    // ═══════════════════════════════════════════════════════════
    // Effet hover sur les boutons
    // ═══════════════════════════════════════════════════════════
    
    const upgradeBtn = document.getElementById('btn-upgrade-now');
    upgradeBtn.addEventListener('mouseenter', () => {
        upgradeBtn.style.transform = 'scale(1.05) translateY(-2px)';
        upgradeBtn.style.boxShadow = '0 8px 28px rgba(0, 0, 0, 0.3)';
    });
    upgradeBtn.addEventListener('mouseleave', () => {
        upgradeBtn.style.transform = 'scale(1) translateY(0)';
        upgradeBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
    });
    
    const cancelBtn = document.getElementById('btn-cancel-modal');
    cancelBtn.addEventListener('mouseenter', () => {
        cancelBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    });
    cancelBtn.addEventListener('mouseleave', () => {
        cancelBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    });
}

// ═══════════════════════════════════════════════════════════════
// MASQUER LE CONTENU DE LA PAGE
// ═══════════════════════════════════════════════════════════════

function hidePageContent() {
    if (!document.getElementById('page-content-blocker')) {
        const blocker = document.createElement('div');
        blocker.id = 'page-content-blocker';
        blocker.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 9998;
            pointer-events: all;
        `;
        document.body.appendChild(blocker);
    }
    
    document.body.style.overflow = 'hidden';
}

// ═══════════════════════════════════════════════════════════════
// REDIRIGER VERS LOGIN
// ═══════════════════════════════════════════════════════════════

function redirectToLogin() {
    console.log('🔄 Redirecting to login...');
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = 'index.html#login';
}

// ═══════════════════════════════════════════════════════════════
// INITIALISATION AUTOMATIQUE
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    console.log(`📄 Current page: ${currentPage}`);
    
    // Vérifier l'accès pour les pages protégées
    if (!PAGE_CATEGORIES.public.includes(currentPage)) {
        console.log('🔒 Protected page detected - checking access...');
        
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                const hasAccess = await checkPageAccess(currentPage);
                
                if (!hasAccess) {
                    console.warn('⛔ Access denied - upgrade modal displayed');
                } else {
                    console.log('✅ Access granted - page loaded successfully');
                }
            } else {
                console.warn('⚠️ User not logged in - redirecting to login');
                redirectToLogin();
            }
        });
    } else {
        console.log('🌐 Public page - no access check needed');
    }
});

// ═══════════════════════════════════════════════════════════════
// ANIMATION DE SECOUSSE (CSS)
// ═══════════════════════════════════════════════════════════════

const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: scale(1) translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: scale(1.02) translateX(-10px); }
        20%, 40%, 60%, 80% { transform: scale(1.02) translateX(10px); }
    }
`;
document.head.appendChild(style);

// ═══════════════════════════════════════════════════════════════
// FONCTION UTILITAIRE : VÉRIFIER SI UNE FEATURE EST DISPONIBLE
// ═══════════════════════════════════════════════════════════════

async function hasFeature(featureName) {
    const user = firebase.auth().currentUser;
    
    if (!user) return false;
    
    try {
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .get();
        
        if (!userDoc.exists) return false;
        
        const userData = userDoc.data();
        let userPlan = (userData?.plan || 'free').toLowerCase();
        const subscriptionStatus = (userData?.subscriptionStatus || 'inactive').toLowerCase();
        const promoCode = (userData?.promoCode || '').toUpperCase();
        
        // Appliquer les codes promo
        if (promoCode === 'FREEPRO') {
            userPlan = 'freepro';
        } else if (promoCode === 'FREEPLATINUM') {
            userPlan = 'freeplatinum';
        }
        
        const planConfig = ACCESS_LEVELS[userPlan];
        
        if (!planConfig) return false;
        
        // Vérifier le statut si nécessaire
        if (planConfig.requiresActiveSubscription) {
            const validStatuses = ['active', 'trialing'];
            if (!validStatuses.includes(subscriptionStatus)) {
                return false;
            }
        }
        
        const allowedFeatures = planConfig.features || [];
        
        return allowedFeatures.includes('all') || allowedFeatures.includes(featureName);
        
    } catch (error) {
        console.error('Error checking feature:', error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPOSER LES FONCTIONS GLOBALEMENT
// ═══════════════════════════════════════════════════════════════

window.hasFeature = hasFeature;
window.checkPageAccess = checkPageAccess;
window.ACCESS_LEVELS = ACCESS_LEVELS;
window.PAGE_CATEGORIES = PAGE_CATEGORIES;
window.getPageRequiredLevel = getPageRequiredLevel;

console.log('✅ Access Control System v3.0 ready');
console.log('📊 Available plans:', Object.keys(ACCESS_LEVELS));
console.log('🎟️ Promo codes supported: FREEPRO, FREEPLATINUM');
console.log('🛒 Upgrade redirects to: checkout.html');