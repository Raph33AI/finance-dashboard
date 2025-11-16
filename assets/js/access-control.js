/* ═══════════════════════════════════════════════════════════════
   ACCESS CONTROL - Vérification des permissions par plan
   AlphaVault AI - VERSION SÉCURISÉE CORRIGÉE
   ═══════════════════════════════════════════════════════════════ */

console.log('🔐 Access Control System initialized');

// ═══════════════════════════════════════════════════════════════
// DÉFINITION DES NIVEAUX D'ACCÈS
// ═══════════════════════════════════════════════════════════════

const ACCESS_LEVELS = {
    basic: {
        maxAnalyses: 10,
        features: [
            'portfolio-tracking',
            'basic-data',
            'alphy-ai-limited'
        ],
        pages: [
            'index.html',
            'dashboard-financier.html',
            'investments-analytics.html'
        ]
    },
    pro: {
        maxAnalyses: Infinity,
        features: [
            'portfolio-tracking',
            'basic-data',
            'alphy-ai-unlimited',
            'ipo-screening',
            'portfolio-optimization',
            'monte-carlo',
            'real-time-data',
            'risk-parity',
            'scenario-analysis',
            'trend-prediction'
        ],
        pages: [
            'index.html',
            'dashboard-financier.html',
            'investments-analytics.html',
            'advanced-analysis.html',
            'monte-carlo.html',
            'risk-parity.html',
            'scenario-analysis.html',
            'portfolio-optimizer.html',
            'market-data.html',
            'trend-prediction.html',
            'market-intelligence.html'
        ]
    },
    // ✅ ACCÈS GRATUIT (équivalent PRO)
    active_free: {
        maxAnalyses: Infinity,
        features: [
            'portfolio-tracking',
            'basic-data',
            'alphy-ai-unlimited',
            'ipo-screening',
            'portfolio-optimization',
            'monte-carlo',
            'real-time-data',
            'risk-parity',
            'scenario-analysis',
            'trend-prediction'
        ],
        pages: [
            'index.html',
            'dashboard-financier.html',
            'investments-analytics.html',
            'advanced-analysis.html',
            'monte-carlo.html',
            'risk-parity.html',
            'scenario-analysis.html',
            'portfolio-optimizer.html',
            'market-data.html',
            'trend-prediction.html',
            'market-intelligence.html'
        ]
    },
    platinum: {
        maxAnalyses: Infinity,
        features: ['all'],
        pages: ['all'] // ✅ Accès à TOUTES les pages
    }
};

// ═══════════════════════════════════════════════════════════════
// ✅ NOUVEAU : DÉFINITION DES PAGES PUBLIQUES ET PROTÉGÉES
// ═══════════════════════════════════════════════════════════════

const PAGE_CATEGORIES = {
    // Pages accessibles sans connexion
    public: [
        'index.html',
        'login.html',
        'register.html',
        'forgot-password.html'
    ],
    
    // Pages accessibles par tous les utilisateurs connectés (Basic+)
    authenticated: [
        'dashboard-financier.html',
        'investments-analytics.html'
    ],
    
    // Pages PRO uniquement (Basic bloqué)
    pro: [
        'advanced-analysis.html',
        'monte-carlo.html',
        'risk-parity.html',
        'scenario-analysis.html',
        'portfolio-optimizer.html',
        'market-data.html',
        'trend-prediction.html',
        'market-intelligence.html'
    ],
    
    // ✅ NOUVEAU : Pages PLATINUM uniquement
    platinum: [
        'ma-screening.html',          // M&A Screening
        'api-access.html',            // API Access Dashboard
        'white-label.html',           // White-label Reports
        'priority-support.html',      // Support VIP
        'advanced-api.html'           // API avancée
    ]
};

// ═══════════════════════════════════════════════════════════════
// VÉRIFIER L'ACCÈS À UNE PAGE
// ═══════════════════════════════════════════════════════════════

async function checkPageAccess(pageName) {
    try {
        console.log(`🔍 Checking access for page: ${pageName}`);
        
        // ✅ Vérifier si c'est une page publique
        if (PAGE_CATEGORIES.public.includes(pageName)) {
            console.log('🌐 Public page - access granted');
            return true;
        }
        
        // Vérifier l'authentification
        const user = firebase.auth().currentUser;
        
        if (!user) {
            console.warn('⚠️ User not logged in');
            redirectToLogin();
            return false;
        }
        
        // Récupérer le plan de l'utilisateur depuis Firestore
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            console.error('❌ User document not found in Firestore');
            redirectToLogin();
            return false;
        }
        
        const userData = userDoc.data();
        const userPlan = userData?.plan || 'basic';
        const subscriptionStatus = userData?.subscriptionStatus || 'inactive';
        
        console.log(`👤 User: ${user.email}`);
        console.log(`📊 Current plan: ${userPlan}`);
        console.log(`📊 Subscription status: ${subscriptionStatus}`);
        
        // ✅ VÉRIFICATION DU STATUT D'ABONNEMENT
        const validStatuses = ['active', 'active_free', 'trialing'];
        
        if (!validStatuses.includes(subscriptionStatus)) {
            console.warn(`⚠️ Invalid subscription status: ${subscriptionStatus}`);
            showUpgradeModal(userPlan, 'expired');
            return false;
        }
        
        // ✅ DÉTERMINER LE NIVEAU D'ACCÈS
        let effectiveLevel;
        
        if (subscriptionStatus === 'active_free') {
            // Utilisateur avec code promo FREE
            effectiveLevel = userPlan; // ✅ Utiliser le plan réel (pro ou platinum)
        } else {
            effectiveLevel = userPlan;
        }
        
        console.log(`🔑 Effective access level: ${effectiveLevel}`);
        
        // ✅ NOUVELLE LOGIQUE DE VÉRIFICATION
        
        // 1️⃣ Pages PLATINUM ONLY
        if (PAGE_CATEGORIES.platinum.includes(pageName)) {
            if (effectiveLevel === 'platinum') {
                console.log('✅ Access granted (Platinum page)');
                return true;
            } else {
                console.warn('⛔ Access denied - Platinum plan required');
                showUpgradeModal(effectiveLevel, 'platinum_required');
                return false;
            }
        }
        
        // 2️⃣ Pages PRO (accessible par Pro et Platinum)
        if (PAGE_CATEGORIES.pro.includes(pageName)) {
            if (effectiveLevel === 'pro' || effectiveLevel === 'platinum') {
                console.log('✅ Access granted (Pro/Platinum page)');
                return true;
            } else {
                console.warn('⛔ Access denied - Pro plan required');
                showUpgradeModal(effectiveLevel, 'pro_required');
                return false;
            }
        }
        
        // 3️⃣ Pages AUTHENTICATED (accessible par tous les utilisateurs connectés)
        if (PAGE_CATEGORIES.authenticated.includes(pageName)) {
            console.log('✅ Access granted (Authenticated page)');
            return true;
        }
        
        // 4️⃣ Page non référencée = BLOQUER PAR DÉFAUT (sécurité)
        console.warn(`⚠️ Unknown page: ${pageName} - blocking access by default`);
        showUpgradeModal(effectiveLevel, 'unknown_page');
        return false;
        
    } catch (error) {
        console.error('❌ Error checking access:', error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// AFFICHER UNE MODALE D'UPGRADE (VERSION AMÉLIORÉE)
// ═══════════════════════════════════════════════════════════════

function showUpgradeModal(currentPlan, reason = 'insufficient') {
    console.log('🔔 Showing upgrade modal for plan:', currentPlan, '| Reason:', reason);
    
    // Supprimer le modal existant si présent
    const existingModal = document.getElementById('upgrade-modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    // ✅ Messages personnalisés selon la raison
    const messages = {
        pro_required: {
            title: '🔒 Pro Feature',
            description: 'This feature requires the <strong>Pro</strong> or <strong>Platinum</strong> plan.',
            icon: '👑'
        },
        platinum_required: {
            title: '💎 Platinum Exclusive',
            description: 'This feature is exclusively available in the <strong>Platinum</strong> plan.',
            icon: '💎'
        },
        expired: {
            title: '⏰ Subscription Expired',
            description: 'Your subscription has expired. Renew now to regain access to premium features.',
            icon: '⏰'
        },
        unknown_page: {
            title: '🔒 Premium Access',
            description: 'This page requires a premium subscription.',
            icon: '🔐'
        }
    };
    
    const msg = messages[reason] || messages.pro_required;
    
    // Créer une modale glassmorphism élégante avec CSS INLINE
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
                    Upgrade Now
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
    
    // Event listeners
    document.getElementById('btn-upgrade-now').addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
    
    document.getElementById('btn-cancel-modal').addEventListener('click', () => {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
        window.location.href = 'dashboard-financier.html';
    });
    
    // Effet hover sur les boutons
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
// REDIRIGER VERS LOGIN
// ═══════════════════════════════════════════════════════════════

function redirectToLogin() {
    console.log('🔄 Redirecting to login...');
    
    // Sauvegarder la page demandée pour redirection après login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    
    window.location.href = 'index.html#login';
}

// ═══════════════════════════════════════════════════════════════
// ✅ INITIALISATION AUTOMATIQUE AMÉLIORÉE
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    console.log(`📄 Current page: ${currentPage}`);
    
    // ✅ Vérifier l'accès pour TOUTES les pages (sauf publiques)
    if (!PAGE_CATEGORIES.public.includes(currentPage)) {
        console.log('🔒 Protected page detected - checking access...');
        
        // Attendre que Firebase soit prêt
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                const hasAccess = await checkPageAccess(currentPage);
                
                if (!hasAccess) {
                    console.warn('⛔ Access denied - redirecting in 3 seconds...');
                    
                    // Rediriger vers dashboard après 3 secondes
                    setTimeout(() => {
                        window.location.href = 'dashboard-financier.html';
                    }, 3000);
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
// FONCTION UTILITAIRE : VÉRIFIER SI UNE FEATURE EST DISPONIBLE
// ═══════════════════════════════════════════════════════════════

async function hasFeature(featureName) {
    const user = firebase.auth().currentUser;
    
    if (!user) return false;
    
    const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) return false;
    
    const userData = userDoc.data();
    const userPlan = userData?.plan || 'basic';
    const subscriptionStatus = userData?.subscriptionStatus || 'inactive';
    
    // ✅ Vérifier le statut d'abonnement
    const validStatuses = ['active', 'active_free', 'trialing'];
    if (!validStatuses.includes(subscriptionStatus)) {
        return false;
    }
    
    // ✅ Déterminer le niveau effectif
    const effectiveLevel = subscriptionStatus === 'active_free' ? userPlan : userPlan;
    
    const allowedFeatures = ACCESS_LEVELS[effectiveLevel]?.features || [];
    
    return allowedFeatures.includes('all') || allowedFeatures.includes(featureName);
}

// Exposer globalement pour utilisation dans d'autres scripts
window.hasFeature = hasFeature;
window.checkPageAccess = checkPageAccess;

console.log('✅ Access Control System ready');