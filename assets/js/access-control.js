/* ═══════════════════════════════════════════════════════════════
   ACCESS CONTROL SYSTEM - AlphaVault AI
   VERSION 3.1 - SUPPORT DES CODES PROMO TRIAL
   Redirection automatique vers checkout.html
   ═══════════════════════════════════════════════════════════════ */

console.log('🔐 Access Control System v3.1 initialized');

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION DES PLANS ET ACCÈS
// ═══════════════════════════════════════════════════════════════

const ACCESS_LEVELS = {
    // PLAN GRATUIT / BASIC
    free: {
        name: 'Free',
        level: 0,
        requiresActiveSubscription: false,
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
        requiresActiveSubscription: false,
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
    
    // PLAN PRO
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
    
    // CODE PROMO : FREEPRO (équivalent PRO gratuit)
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
    
    // PLAN PLATINUM
    platinum: {
        name: 'Platinum',
        level: 2,
        requiresActiveSubscription: true,
        pages: ['all'],
        features: ['all']
    },
    
    // CODE PROMO : FREEPLATINUM (équivalent PLATINUM gratuit)
    freeplatinum: {
        name: 'Free Platinum',
        level: 2,
        requiresActiveSubscription: false,
        pages: ['all'],
        features: ['all']
    },
    
    // NOUVEAU : TRIAL (14 jours gratuits)
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
// CATÉGORISATION DES PAGES
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
        'interactive-demo.html',
        'netlify.html',
        'chatbot-integration.html'
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
// FONCTION PRINCIPALE : VÉRIFIER L'ACCÈS À UNE PAGE
// ═══════════════════════════════════════════════════════════════

async function checkPageAccess(pageName) {
    try {
        console.log('🔍 Checking access for page: ' + pageName);
        
        // 1 - VÉRIFIER SI PAGE PUBLIQUE
        if (PAGE_CATEGORIES.public.includes(pageName)) {
            console.log('🌐 Public page - access granted');
            return true;
        }
        
        // 2 - VÉRIFIER L'AUTHENTIFICATION
        const user = firebase.auth().currentUser;
        
        if (!user) {
            console.warn('⚠ User not logged in');
            redirectToLogin();
            return false;
        }
        
        // 3 - RÉCUPÉRER LES DONNÉES UTILISATEUR
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
        let userPlan = (userData.plan || 'free').toLowerCase();
        const subscriptionStatus = (userData.subscriptionStatus || 'inactive').toLowerCase();
        const promoCode = (userData.promoCode || '').toUpperCase();
        const trialEndsAt = userData.trialEndsAt || null;
        
        console.log('👤 User: ' + user.email);
        console.log('📊 Original plan: ' + userPlan);
        console.log('📊 Subscription status: ' + subscriptionStatus);
        console.log('🎟 Promo code: ' + (promoCode || 'none'));
        console.log('⏰ Trial ends at: ' + (trialEndsAt || 'N/A'));
        
        // 4 - GESTION DES CODES PROMO ET STATUT TRIAL
        
        // VÉRIFIER SI L'UTILISATEUR EST EN TRIAL
        if (subscriptionStatus === 'trial' &amp;&amp; trialEndsAt) {
            const now = new Date();
            const expirationDate = new Date(trialEndsAt);
            
            console.log('📅 Trial check: Now = ' + now.toISOString() + ', Expires = ' + expirationDate.toISOString());
            
            if (now &lt; expirationDate) {
                // TRIAL ENCORE VALIDE
                const daysLeft = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
                console.log('✅ Trial still active (expires in ' + daysLeft + ' days)');
                
                if (userPlan === 'platinum') {
                    userPlan = 'trial';
                    ACCESS_LEVELS.trial.level = 2;
                } else {
                    userPlan = 'trial';
                    ACCESS_LEVELS.trial.level = 1;
                }
                
                console.log('🎁 Trial mode activated: ' + userPlan + ' (level ' + ACCESS_LEVELS.trial.level + ')');
                
            } else {
                // TRIAL EXPIRÉ
                console.warn('⏰ Trial expired on ' + expirationDate.toLocaleDateString());
                showUpgradeModal(userPlan, 'trial_expired');
                return false;
            }
        }
        // Gestion des codes promo FREE
        else if (promoCode === 'FREEPRO') {
            userPlan = 'freepro';
            console.log('🎁 Promo code applied: FREEPRO - Plan upgraded to: freepro');
        } else if (promoCode === 'FREEPLATINUM') {
            userPlan = 'freeplatinum';
            console.log('🎁 Promo code applied: FREEPLATINUM - Plan upgraded to: freeplatinum');
        }
        
        // 5 - VÉRIFIER LE STATUT D'ABONNEMENT (selon le plan)
        const planConfig = ACCESS_LEVELS[userPlan];
        
        if (!planConfig) {
            console.error('❌ Unknown plan: ' + userPlan);
            userPlan = 'free';
        }
        
        // Vérifier si le plan nécessite un abonnement actif
        if (planConfig.requiresActiveSubscription) {
            const validStatuses = ['active', 'trialing'];
            
            if (!validStatuses.includes(subscriptionStatus)) {
                console.warn('⚠ Plan "' + userPlan + '" requires active subscription but status is: ' + subscriptionStatus);
                showUpgradeModal(userPlan, 'expired');
                return false;
            }
            
            console.log('✅ Subscription status validated for paid plan');
        } else {
            console.log('✅ Plan "' + userPlan + '" does not require active subscription');
        }
        
        console.log('🔑 Effective access level: ' + userPlan + ' (level ' + planConfig.level + ')');
        
        // 6 - VÉRIFIER L'ACCÈS À LA PAGE (LOGIQUE HIÉRARCHIQUE)
        
        // PLATINUM / FREEPLATINUM / TRIAL (niveau 2) = Accès à TOUTES les pages
        if (userPlan === 'platinum' || userPlan === 'freeplatinum' || (userPlan === 'trial' &amp;&amp; planConfig.level === 2)) {
            console.log('✅ Access granted (Full access)');
            return true;
        }
        
        // TRIAL (niveau 1) = Accès Pro
        if (userPlan === 'trial' &amp;&amp; planConfig.level === 1) {
            console.log('✅ Access granted (Trial - Pro level)');
            return true;
        }
        
        // Pages authentifiées (accessibles par TOUS les utilisateurs connectés)
        if (PAGE_CATEGORIES.authenticated.includes(pageName)) {
            console.log('✅ Access granted (Authenticated page)');
            return true;
        }
        
        // Vérifier si la page est dans la liste d'accès du plan
        const allowedPages = planConfig.pages || [];
        
        if (allowedPages.includes('all') || allowedPages.includes(pageName)) {
            console.log('✅ Access granted (Page in ' + userPlan + ' access list)');
            return true;
        }
        
        // LOGIQUE HIÉRARCHIQUE : Si niveau &gt;= niveau requis
        const pageLevel = getPageRequiredLevel(pageName);
        
        if (planConfig.level &gt;= pageLevel) {
            console.log('✅ Access granted (Level ' + planConfig.level + ' &gt;= required ' + pageLevel + ')');
            return true;
        }
        
        // ACCÈS REFUSÉ
        console.warn('⛔ Access denied for ' + pageName + ' - User plan: ' + userPlan + ' (level ' + planConfig.level + ')');
        
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
// DÉTERMINER LE NIVEAU REQUIS POUR UNE PAGE
// ═══════════════════════════════════════════════════════════════

function getPageRequiredLevel(pageName) {
    if (PAGE_CATEGORIES.public.includes(pageName) || PAGE_CATEGORIES.authenticated.includes(pageName)) {
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
// AFFICHER UNE MODALE D'UPGRADE (REDIRECTION VERS CHECKOUT)
// ═══════════════════════════════════════════════════════════════

function showUpgradeModal(currentPlan, reason) {
    reason = reason || 'insufficient';
    
    console.log('🔔 Showing upgrade modal for plan: ' + currentPlan + ' | Reason: ' + reason);
    
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
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 99999; opacity: 0; transition: opacity 0.3s ease;';
    
    modal.innerHTML = '' +
        '' + msg.icon + '' +
        '' + msg.title + '' +
        '' + msg.description + '' +
        '' +
        'Your current plan: ' + currentPlan + '' +
        '' +
        '' +
        '' +
        'Upgrade to ' + msg.suggestedPlan +
        '' +
        'Go Back' +
        '' +
        '';
    
    document.body.appendChild(modal);
    
    setTimeout(function() {
        modal.style.opacity = '1';
        document.getElementById('upgrade-modal-content').style.transform = 'scale(1)';
    }, 10);
    
    document.getElementById('btn-upgrade-now').addEventListener('click', function() {
        console.log('🛒 Redirecting to checkout page...');
        window.location.href = 'checkout.html';
    });
    
    document.getElementById('btn-cancel-modal').addEventListener('click', function() {
        console.log('🔙 User cancelled - redirecting to dashboard...');
        modal.style.opacity = '0';
        setTimeout(function() {
            modal.remove();
            window.location.href = 'dashboard-financier.html';
        }, 300);
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            const content = document.getElementById('upgrade-modal-content');
            content.style.animation = 'shake 0.5s';
            setTimeout(function() {
                content.style.animation = '';
            }, 500);
        }
    });
    
    const upgradeBtn = document.getElementById('btn-upgrade-now');
    upgradeBtn.addEventListener('mouseenter', function() {
        upgradeBtn.style.transform = 'scale(1.05) translateY(-2px)';
        upgradeBtn.style.boxShadow = '0 8px 28px rgba(0, 0, 0, 0.3)';
    });
    upgradeBtn.addEventListener('mouseleave', function() {
        upgradeBtn.style.transform = 'scale(1) translateY(0)';
        upgradeBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
    });
    
    const cancelBtn = document.getElementById('btn-cancel-modal');
    cancelBtn.addEventListener('mouseenter', function() {
        cancelBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    });
    cancelBtn.addEventListener('mouseleave', function() {
        cancelBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    });
}

function hidePageContent() {
    if (!document.getElementById('page-content-blocker')) {
        const blocker = document.createElement('div');
        blocker.id = 'page-content-blocker';
        blocker.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.95); z-index: 9998; pointer-events: all;';
        document.body.appendChild(blocker);
    }
    
    document.body.style.overflow = 'hidden';
}

function redirectToLogin() {
    console.log('🔄 Redirecting to login...');
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    window.location.href = 'index.html#login';
}

document.addEventListener('DOMContentLoaded', async function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    console.log('📄 Current page: ' + currentPage);
    
    if (!PAGE_CATEGORIES.public.includes(currentPage)) {
        console.log('🔒 Protected page detected - checking access...');
        
        firebase.auth().onAuthStateChanged(async function(user) {
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

const style = document.createElement('style');
style.textContent = '@keyframes shake { 0%, 100% { transform: scale(1) translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: scale(1.02) translateX(-10px); } 20%, 40%, 60%, 80% { transform: scale(1.02) translateX(10px); } }';
document.head.appendChild(style);

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
        let userPlan = (userData.plan || 'free').toLowerCase();
        const subscriptionStatus = (userData.subscriptionStatus || 'inactive').toLowerCase();
        const promoCode = (userData.promoCode || '').toUpperCase();
        const trialEndsAt = userData.trialEndsAt || null;
        
        // Vérifier si trial actif
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

window.hasFeature = hasFeature;
window.checkPageAccess = checkPageAccess;
window.ACCESS_LEVELS = ACCESS_LEVELS;
window.PAGE_CATEGORIES = PAGE_CATEGORIES;
window.getPageRequiredLevel = getPageRequiredLevel;

console.log('✅ Access Control System v3.1 ready');
console.log('📊 Available plans:', Object.keys(ACCESS_LEVELS));
console.log('🎟 Promo codes supported: FREEPRO, FREEPLATINUM, FREE14DAYS, TRIAL14, TRYITFREE');
console.log('⏰ Trial expiration check: enabled');
console.log('🛒 Upgrade redirects to: checkout.html');