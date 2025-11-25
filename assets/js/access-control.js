/* ═══════════════════════════════════════════════════════════════
   ACCESS CONTROL SYSTEM - AlphaVault AI
   VERSION 4.0 - SÉCURITÉ RENFORCÉE
   ✅ Blocage des utilisateurs avec subscriptionStatus: "inactive"
   ✅ Support trial avec validation de date
   ✅ Redirection automatique vers checkout.html
   ═══════════════════════════════════════════════════════════════ */

console.log('🔐 Access Control System v4.0 initialized');

// ═══════════════════════════════════════════════════════════════
// ✅ CONFIGURATION DES PLANS ET ACCÈS
// ═══════════════════════════════════════════════════════════════

const ACCESS_LEVELS = {
    // ✅ PLAN GRATUIT (BLOQUÉ si status inactive)
    free: {
        name: 'Free',
        level: 0,
        requiresActiveSubscription: true, // ✅ MODIFIÉ : même le plan free nécessite un statut actif
        pages: [],
        features: []
    },
    
    // ✅ PLAN BASIC (par défaut à la création de compte)
    basic: {
        name: 'Basic',
        level: 0,
        requiresActiveSubscription: true,
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
        requiresActiveSubscription: true,
        pages: [
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
    
    // ✅ CODE PROMO : FREEPRO (équivalent PRO gratuit)
    freepro: {
        name: 'Free Pro',
        level: 1,
        requiresActiveSubscription: false,
        pages: [
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
        requiresActiveSubscription: true,
        pages: ['all'],
        features: ['all']
    },
    
    // ✅ CODE PROMO : FREEPLATINUM (équivalent PLATINUM gratuit)
    freeplatinum: {
        name: 'Free Platinum',
        level: 2,
        requiresActiveSubscription: false,
        pages: ['all'],
        features: ['all']
    },
    
    // ✅ TRIAL (14 jours gratuits)
    trial: {
        name: 'Trial',
        level: 1,
        requiresActiveSubscription: false,
        requiresTrialValidation: true,
        pages: ['all'],
        features: ['all']
    }
};

// ═══════════════════════════════════════════════════════════════
// ✅ CATÉGORISATION DES PAGES
// ═══════════════════════════════════════════════════════════════

const PAGE_CATEGORIES = {
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
    
    authenticated: [
        'settings.html',
        'user-profile.html',
        'interactive-demo.html'
    ],
    
    basic: [
        'dashboard-financier.html',
        'monte-carlo.html',
        'portfolio-optimizer.html'
    ],
    
    pro: [
        'investments-analytics.html',
        'risk-parity.html',
        'scenario-analysis.html',
        'market-data.html',
        'trend-prediction.html',
        'market-intelligence.html'
    ],
    
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
        // 1⃣ VÉRIFIER SI PAGE PUBLIQUE
        // ═══════════════════════════════════════════════════════════
        if (PAGE_CATEGORIES.public.includes(pageName)) {
            console.log('🌐 Public page - access granted');
            return true;
        }
        
        // ═══════════════════════════════════════════════════════════
        // 2⃣ VÉRIFIER L'AUTHENTIFICATION
        // ═══════════════════════════════════════════════════════════
        const user = firebase.auth().currentUser;
        
        if (!user) {
            console.warn('⚠ User not logged in');
            redirectToLogin();
            return false;
        }
        
        // ═══════════════════════════════════════════════════════════
        // 3⃣ RÉCUPÉRER LES DONNÉES UTILISATEUR
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
        const trialEndsAt = userData?.trialEndsAt || null;
        
        console.log(`👤 User: ${user.email}`);
        console.log(`📊 Plan: ${userPlan}`);
        console.log(`🔔 Subscription status: ${subscriptionStatus}`);
        console.log(`🎟 Promo code: ${promoCode || 'none'}`);
        console.log(`⏰ Trial ends at: ${trialEndsAt || 'N/A'}`);
        
        // ═══════════════════════════════════════════════════════════
        // 4⃣ GESTION DES CODES PROMO ET STATUT TRIAL
        // ═══════════════════════════════════════════════════════════
        
        // ✅ Vérifier si l'utilisateur est en TRIAL
        if (subscriptionStatus === 'trial' &amp;&amp; trialEndsAt) {
            const now = new Date();
            const expirationDate = new Date(trialEndsAt);
            
            if (now &lt; expirationDate) {
                console.log(`✅ Trial active (expires: ${expirationDate.toLocaleDateString()})`);
                userPlan = 'trial';
                ACCESS_LEVELS.trial.level = userPlan === 'platinum' ? 2 : 1;
            } else {
                console.warn(`⏰ Trial expired on ${expirationDate.toLocaleDateString()}`);
                showUpgradeModal(userPlan, 'trial_expired');
                return false;
            }
        }
        // ✅ Gestion des codes promo
        else if (promoCode === 'FREEPRO') {
            userPlan = 'freepro';
            console.log('🎁 Promo code FREEPRO applied');
        } else if (promoCode === 'FREEPLATINUM') {
            userPlan = 'freeplatinum';
            console.log('🎁 Promo code FREEPLATINUM applied');
        }
        
        // ═══════════════════════════════════════════════════════════
        // 5⃣ ✅✅✅ VÉRIFICATION CRITIQUE : BLOCAGE STATUS INACTIVE
        // ═══════════════════════════════════════════════════════════
        
        const planConfig = ACCESS_LEVELS[userPlan];
        
        if (!planConfig) {
            console.error(`❌ Unknown plan: ${userPlan}`);
            userPlan = 'free';
        }
        
        // ✅ NOUVELLE LOGIQUE : Bloquer TOUT utilisateur avec status "inactive"
        if (planConfig.requiresActiveSubscription) {
            const validStatuses = ['active', 'trialing', 'trial'];
            
            if (!validStatuses.includes(subscriptionStatus)) {
                console.warn(`🚫 ACCESS DENIED - Subscription status is "${subscriptionStatus}"`);
                console.warn(`🔒 Required status: ${validStatuses.join(' OR ')}`);
                
                // Afficher une modale spécifique selon la situation
                if (userPlan === 'free' &amp;&amp; subscriptionStatus === 'inactive') {
                    showUpgradeModal(userPlan, 'inactive_account');
                } else {
                    showUpgradeModal(userPlan, 'expired');
                }
                
                return false;
            }
            
            console.log(`✅ Subscription status validated: ${subscriptionStatus}`);
        } else {
            console.log(`✅ Plan "${userPlan}" does not require active subscription`);
        }
        
        console.log(`🔑 Effective access level: ${userPlan} (level ${planConfig.level})`);
        
        // ═══════════════════════════════════════════════════════════
        // 6⃣ VÉRIFIER L'ACCÈS À LA PAGE (LOGIQUE HIÉRARCHIQUE)
        // ═══════════════════════════════════════════════════════════
        
        // ✅ Pages authentifiées (accessibles par TOUS les utilisateurs avec status actif)
        if (PAGE_CATEGORIES.authenticated.includes(pageName)) {
            console.log('✅ Access granted (Authenticated page)');
            return true;
        }
        
        // ✅ PLATINUM / FREEPLATINUM / TRIAL (niveau 2) = Accès à TOUTES les pages
        if (userPlan === 'platinum' || userPlan === 'freeplatinum' || 
            (userPlan === 'trial' &amp;&amp; planConfig.level === 2)) {
            console.log('✅ Access granted (Full access)');
            return true;
        }
        
        // ✅ TRIAL (niveau 1) = Accès Pro
        if (userPlan === 'trial' &amp;&amp; planConfig.level === 1) {
            console.log('✅ Access granted (Trial - Pro level)');
            return true;
        }
        
        // ✅ Vérifier si la page est dans la liste d'accès du plan
        const allowedPages = planConfig.pages || [];
        
        if (allowedPages.includes('all') || allowedPages.includes(pageName)) {
            console.log(`✅ Access granted (Page in ${userPlan} access list)`);
            return true;
        }
        
        // ✅ LOGIQUE HIÉRARCHIQUE : Si niveau &gt;= niveau requis
        const pageLevel = getPageRequiredLevel(pageName);
        
        if (planConfig.level &gt;= pageLevel) {
            console.log(`✅ Access granted (Level ${planConfig.level} &gt;= required ${pageLevel})`);
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
        return 0;
    }
    
    if (PAGE_CATEGORIES.pro.includes(pageName)) {
        return 1;
    }
    
    if (PAGE_CATEGORIES.platinum.includes(pageName)) {
        return 2;
    }
    
    return 0;
}

// ═══════════════════════════════════════════════════════════════
// ✅ AFFICHER UNE MODALE D'UPGRADE (REDIRECTION VERS CHECKOUT)
// ═══════════════════════════════════════════════════════════════

function showUpgradeModal(currentPlan, reason = 'insufficient') {
    console.log('🔔 Showing upgrade modal for plan:', currentPlan, '| Reason:', reason);
    
    const existingModal = document.getElementById('upgrade-modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    hidePageContent();
    
    const messages = {
        pro_required: {
            title: '🔒 Pro Feature',
            description: 'This page requires the Pro or Platinum plan.',
            icon: '👑',
            suggestedPlan: 'Pro'
        },
        platinum_required: {
            title: '💎 Platinum Exclusive',
            description: 'This page is exclusively available with the Platinum plan.',
            icon: '💎',
            suggestedPlan: 'Platinum'
        },
        expired: {
            title: '⏰ Subscription Expired',
            description: 'Your subscription has expired. Renew now to regain access to premium features.',
            icon: '⏰',
            suggestedPlan: currentPlan
        },
        trial_expired: {
            title: '⏰ Trial Expired',
            description: 'Your 14-day free trial has ended. Upgrade now to continue enjoying premium features!',
            icon: '⏰',
            suggestedPlan: 'Pro'
        },
        inactive_account: {
            title: '🔒 Account Inactive',
            description: 'Your account is currently inactive. Please upgrade to a paid plan to access premium features.',
            icon: '🚫',
            suggestedPlan: 'Basic'
        },
        insufficient: {
            title: '🔒 Premium Access Required',
            description: 'Upgrade your plan to access this premium feature.',
            icon: '🔐',
            suggestedPlan: 'Pro'
        }
    };
    
    const msg = messages[reason] || messages.insufficient;
    
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
        
            
                ${msg.icon}
            
            ${msg.title}
            <p>${msg.description}</p>
            
                Your current plan: <strong>${currentPlan}</strong>
            
            
                
                    <i></i>
                    Upgrade to ${msg.suggestedPlan}
                
                
                    Go Back
                
            
        
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() =&gt; {
        modal.style.opacity = '1';
        document.getElementById('upgrade-modal-content').style.transform = 'scale(1)';
    }, 10);
    
    document.getElementById('btn-upgrade-now').addEventListener('click', () =&gt; {
        console.log('🛒 Redirecting to checkout page...');
        window.location.href = 'checkout.html';
    });
    
    document.getElementById('btn-cancel-modal').addEventListener('click', () =&gt; {
        console.log('🔙 User cancelled - redirecting to dashboard...');
        modal.style.opacity = '0';
        setTimeout(() =&gt; {
            modal.remove();
            window.location.href = 'dashboard-financier.html';
        }, 300);
    });
}

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

function redirectToLogin() {
    console.log('🔄 Redirecting to login...');
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = 'auth.html';
}

// ═══════════════════════════════════════════════════════════════
// ✅ AUTO-EXÉCUTION AU CHARGEMENT DE LA PAGE
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    console.log(`📄 Current page: ${currentPage}`);
    
    if (!PAGE_CATEGORIES.public.includes(currentPage)) {
        console.log('🔒 Protected page detected - checking access...');
        
        firebase.auth().onAuthStateChanged(async (user) =&gt; {
            if (user) {
                const hasAccess = await checkPageAccess(currentPage);
                
                if (!hasAccess) {
                    console.warn('⛔ Access denied - upgrade modal displayed');
                } else {
                    console.log('✅ Access granted - page loaded successfully');
                }
            } else {
                console.warn('⚠ User not logged in - redirecting to login');
                redirectToLogin();
            }
        });
    } else {
        console.log('🌐 Public page - no access check needed');
    }
});

// ═══════════════════════════════════════════════════════════════
// ✅ FONCTION hasFeature (vérifier l'accès à une fonctionnalité)
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
        const trialEndsAt = userData?.trialEndsAt || null;
        
        // ✅ Vérifier si trial actif
        if (subscriptionStatus === 'trial' &amp;&amp; trialEndsAt) {
            const now = new Date();
            const expirationDate = new Date(trialEndsAt);
            
            if (now &lt; expirationDate) {
                userPlan = 'trial';
            } else {
                return false;
            }
        }
        else if (promoCode === 'FREEPRO') {
            userPlan = 'freepro';
        } else if (promoCode === 'FREEPLATINUM') {
            userPlan = 'freeplatinum';
        }
        
        const planConfig = ACCESS_LEVELS[userPlan];
        
        if (!planConfig) return false;
        
        // ✅ Vérifier le statut d'abonnement
        if (planConfig.requiresActiveSubscription) {
            const validStatuses = ['active', 'trialing', 'trial'];
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
// ✅ API PUBLIQUE (accessible globalement)
// ═══════════════════════════════════════════════════════════════

window.hasFeature = hasFeature;
window.checkPageAccess = checkPageAccess;
window.ACCESS_LEVELS = ACCESS_LEVELS;
window.PAGE_CATEGORIES = PAGE_CATEGORIES;
window.getPageRequiredLevel = getPageRequiredLevel;

console.log('✅ Access Control System v4.0 ready');
console.log('🔒 Security: Inactive subscriptions are now BLOCKED');
console.log('📊 Available plans:', Object.keys(ACCESS_LEVELS));
console.log('🎟 Promo codes supported: FREEPRO, FREEPLATINUM');
console.log('⏰ Trial expiration check: enabled');
console.log('🛒 Upgrade redirects to: checkout.html');