/* ═══════════════════════════════════════════════════════════════
   ACCESS CONTROL SYSTEM - AlphaVault AI
   VERSION 4.3 - TRIAL RATE LIMITING CORRECTION
   Trial = Pro rate limits (6/min, 200/day)
   ═══════════════════════════════════════════════════════════════ */

console.log('🔐 Access Control System v4.3 initialized');

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION DES PLANS ET ACCÈS
// ═══════════════════════════════════════════════════════════════

const ACCESS_LEVELS = {
    // ✅ UTILISATEURS SANS ABONNEMENT
    none: {
        name: 'No Subscription',
        level: -1,
        requiresActiveSubscription: false,
        pages: [],
        features: [],
        message: 'Please choose a subscription plan to access our features.'
    },
    
    // ✅✅✅ PLAN GRATUIT (DOIT AVOIR STATUT ACTIF)
    free: {
        name: 'Free',
        level: 0,
        requiresActiveSubscription: true,
        requiresExplicitActivation: true,
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
    
    // PLAN BASIC (PAYANT)
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
    
    // CODE PROMO : FREEPRO
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
    
    // CODE PROMO : FREEPLATINUM
    freeplatinum: {
        name: 'Free Platinum',
        level: 2,
        requiresActiveSubscription: false,
        pages: ['all'],
        features: ['all']
    },
    
    // ✅✅✅ TRIAL (14 jours gratuits) - ACCÈS COMPLET MAIS RATE LIMITING PRO
    trial: {
        name: 'Trial',
        level: 2, // ✅ Niveau 2 pour accès à toutes les pages
        requiresActiveSubscription: false,
        requiresTrialValidation: true,
        pages: ['all'], // ✅ Accès à TOUTES les pages pendant le trial
        features: ['all'] // ✅ Accès à TOUTES les fonctionnalités
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
    
    authenticated_only: [
        'settings.html',
        'user-profile.html'
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
    ],
    
    demo: [
        'interactive-demo.html',
        'netlify.html',
        'chatbot-integration.html'
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
            sessionStorage.removeItem('accessDenied');
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
        let userPlan = (userData.plan || 'none').toLowerCase();
        let subscriptionStatus = (userData.subscriptionStatus || 'none').toLowerCase();
        const promoCode = (userData.promoCode || '').toUpperCase();
        const trialEndsAt = userData.trialEndsAt || null;
        
        console.log('👤 User: ' + user.email);
        console.log('📊 Original plan: ' + userPlan);
        console.log('📊 Subscription status: ' + subscriptionStatus);
        console.log('🎟 Promo code: ' + (promoCode || 'none'));
        console.log('⏰ Trial ends at: ' + (trialEndsAt || 'N/A'));
        
        // ✅✅✅ 4 - VÉRIFICATION STRICTE : PLAN FREE + INACTIVE = NONE
        if (userPlan === 'free' && (subscriptionStatus === 'inactive' || subscriptionStatus === 'none' || subscriptionStatus === 'cancelled')) {
            console.warn('⛔ Plan "free" with inactive status - treating as NO subscription');
            userPlan = 'none';
            subscriptionStatus = 'none';
        }
        
        // 5 - PAGES ACCESSIBLES UNIQUEMENT AUX UTILISATEURS AUTHENTIFIÉS
        if (PAGE_CATEGORIES.authenticated_only.includes(pageName)) {
            console.log('✅ Access granted (Authenticated-only page)');
            sessionStorage.removeItem('accessDenied');
            return true;
        }
        
        // 6 - PAGES DE DÉMO
        if (PAGE_CATEGORIES.demo.includes(pageName)) {
            console.log('✅ Access granted (Demo page)');
            sessionStorage.removeItem('accessDenied');
            return true;
        }
        
        // ✅✅✅ 7 - BLOCAGE STRICT : UTILISATEURS SANS ABONNEMENT VALIDE
        if (userPlan === 'none' || userPlan === '' || !userPlan) {
            console.warn('⛔ User has NO valid subscription plan');
            console.warn('   Plan: ' + userPlan);
            console.warn('   Status: ' + subscriptionStatus);
            showUpgradeModal('none', 'no_subscription');
            return false;
        }
        
        // ✅✅✅ 8 - GESTION DU TRIAL (PRIORITÉ ABSOLUE)
        if (subscriptionStatus === 'trial' && trialEndsAt) {
            const now = new Date();
            const expirationDate = new Date(trialEndsAt);
            
            console.log('📅 Trial check: Now = ' + now.toISOString() + ', Expires = ' + expirationDate.toISOString());
            
            if (now < expirationDate) {
                const daysLeft = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));
                console.log('✅ Trial still active (expires in ' + daysLeft + ' days)');
                console.log('🎁 TRIAL MODE ACTIVATED - Full page access with Pro rate limits');
                
                // ✅ Toujours niveau 2 pour accès complet
                userPlan = 'trial';
                ACCESS_LEVELS.trial.level = 2;
                
                console.log('🔑 Effective access level: TRIAL (level 2 - all pages, Pro rate limits)');
                
            } else {
                console.warn('⏰ Trial expired on ' + expirationDate.toLocaleDateString());
                showUpgradeModal(userPlan, 'trial_expired');
                return false;
            }
        }
        // 9 - Gestion des codes promo FREE
        else if (promoCode === 'FREEPRO') {
            userPlan = 'freepro';
            console.log('🎁 Promo code applied: FREEPRO - Plan upgraded to: freepro');
        } else if (promoCode === 'FREEPLATINUM') {
            userPlan = 'freeplatinum';
            console.log('🎁 Promo code applied: FREEPLATINUM - Plan upgraded to: freeplatinum');
        }
        
        // 10 - VÉRIFIER LE STATUT D'ABONNEMENT
        const planConfig = ACCESS_LEVELS[userPlan];
        
        if (!planConfig) {
            console.error('❌ Unknown plan: ' + userPlan);
            showUpgradeModal('none', 'no_subscription');
            return false;
        }
        
        // ✅✅✅ VÉRIFICATION STRICTE DU STATUT
        if (planConfig.requiresActiveSubscription) {
            const validStatuses = ['active', 'trialing', 'active_free'];
            
            if (!validStatuses.includes(subscriptionStatus)) {
                console.warn('⚠ Plan "' + userPlan + '" requires active subscription but status is: ' + subscriptionStatus);
                console.warn('   Valid statuses: ' + validStatuses.join(', '));
                showUpgradeModal(userPlan, 'expired');
                return false;
            }
            
            console.log('✅ Subscription status validated for plan: ' + userPlan);
        } else {
            console.log('✅ Plan "' + userPlan + '" does not require active subscription');
        }
        
        console.log('🔑 Effective access level: ' + userPlan + ' (level ' + planConfig.level + ')');
        
        // 11 - VÉRIFIER L'ACCÈS À LA PAGE
        
        // Vérifier si la page est dans la liste d'accès du plan
        const allowedPages = planConfig.pages || [];
        
        if (allowedPages.includes('all') || allowedPages.includes(pageName)) {
            console.log('✅ Access granted (Page in ' + userPlan + ' access list)');
            sessionStorage.removeItem('accessDenied');
            return true;
        }
        
        // LOGIQUE HIÉRARCHIQUE : Si niveau >= niveau requis
        const pageLevel = getPageRequiredLevel(pageName);
        
        if (planConfig.level >= pageLevel) {
            console.log('✅ Access granted (Level ' + planConfig.level + ' >= required ' + pageLevel + ')');
            sessionStorage.removeItem('accessDenied');
            return true;
        }
        
        // ACCÈS REFUSÉ
        console.warn('⛔ Access denied for ' + pageName + ' - User plan: ' + userPlan + ' (level ' + planConfig.level + ')');
        
        // Déterminer quel upgrade suggérer
        if (pageLevel === 2) {
            showUpgradeModal(userPlan, 'platinum_required');
        } else if (pageLevel === 1) {
            showUpgradeModal(userPlan, 'pro_required');
        } else if (pageLevel === 0) {
            showUpgradeModal(userPlan, 'basic_required');
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
    if (PAGE_CATEGORIES.public.includes(pageName) || PAGE_CATEGORIES.authenticated_only.includes(pageName) || PAGE_CATEGORIES.demo.includes(pageName)) {
        return -1;
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
// MODALE D'UPGRADE
// ═══════════════════════════════════════════════════════════════

function showUpgradeModal(currentPlan, reason) {
    reason = reason || 'insufficient';
    
    sessionStorage.setItem('accessDenied', 'true');
    
    console.log('🔔 Showing upgrade modal for plan: ' + currentPlan + ' | Reason: ' + reason);
    
    const existingModal = document.getElementById('upgrade-modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    hidePageContent();
    
    const messages = {
        no_subscription: {
            title: '🚀 Welcome to AlphaVault AI!',
            description: 'You need to choose a subscription plan to access our premium features. Start with a 14-day free trial!',
            icon: '🎯',
            suggestedPlan: 'Pro',
            ctaText: 'Choose Your Plan',
            ctaColor: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            urgent: true
        },
        basic_required: {
            title: '🔒 Basic Plan Required',
            description: 'This page requires at least a Basic subscription plan.',
            icon: '📊',
            suggestedPlan: 'Basic',
            ctaText: 'Upgrade to Basic',
            ctaColor: 'linear-gradient(135deg, #10b981, #059669)'
        },
        pro_required: {
            title: '🔒 Pro Feature',
            description: 'This page requires the Pro or Platinum plan.',
            icon: '👑',
            suggestedPlan: 'Pro',
            ctaText: 'Upgrade to Pro',
            ctaColor: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        },
        platinum_required: {
            title: '💎 Platinum Exclusive',
            description: 'This page is exclusively available with the Platinum plan.',
            icon: '💎',
            suggestedPlan: 'Platinum',
            ctaText: 'Upgrade to Platinum',
            ctaColor: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        },
        expired: {
            title: '⏰ Subscription Expired',
            description: 'Your subscription has expired. Renew now to regain access to premium features.',
            icon: '⏰',
            suggestedPlan: currentPlan,
            ctaText: 'Renew Subscription',
            ctaColor: 'linear-gradient(135deg, #f59e0b, #d97706)'
        },
        trial_expired: {
            title: '⏰ Trial Expired',
            description: 'Your 14-day free trial has ended. Upgrade now to continue enjoying premium features!',
            icon: '⏰',
            suggestedPlan: 'Pro',
            ctaText: 'Subscribe Now',
            ctaColor: 'linear-gradient(135deg, #ef4444, #dc2626)'
        },
        insufficient: {
            title: '🔒 Premium Access Required',
            description: 'Upgrade your plan to access this premium feature.',
            icon: '🔐',
            suggestedPlan: 'Pro',
            ctaText: 'View Plans',
            ctaColor: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
        }
    };
    
    const msg = messages[reason] || messages.insufficient;
    
    const currentPlanDisplay = (currentPlan === 'none' || currentPlan === 'free') 
        ? 'No Active Plan' 
        : '' + currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1) + '';
    
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
    
    setTimeout(function() {
        modal.style.opacity = '1';
        document.getElementById('upgrade-modal-content').style.transform = 'scale(1)';
    }, 10);
    
    document.getElementById('btn-upgrade-now').addEventListener('click', function() {
        console.log('🛒 Redirecting to checkout page...');
        window.location.href = 'checkout.html';
    });
    
    document.getElementById('btn-cancel-modal').addEventListener('click', function() {
        console.log('🔙 User cancelled - redirecting to public page...');
        modal.style.opacity = '0';
        setTimeout(function() {
            modal.remove();
            window.location.href = 'index.html';
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
    sessionStorage.setItem('accessDenied', 'true');
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
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: scale(1) translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: scale(1.02) translateX(-10px); }
        20%, 40%, 60%, 80% { transform: scale(1.02) translateX(10px); }
    }
    
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
`;
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
        let userPlan = (userData.plan || 'none').toLowerCase();
        let subscriptionStatus = (userData.subscriptionStatus || 'none').toLowerCase();
        const promoCode = (userData.promoCode || '').toUpperCase();
        const trialEndsAt = userData.trialEndsAt || null;
        
        if (userPlan === 'free' && (subscriptionStatus === 'inactive' || subscriptionStatus === 'none' || subscriptionStatus === 'cancelled')) {
            return false;
        }
        
        if (userPlan === 'none' || userPlan === '') {
            return false;
        }
        
        if (subscriptionStatus === 'trial' && trialEndsAt) {
            const now = new Date();
            const expirationDate = new Date(trialEndsAt);
            
            if (now < expirationDate) {
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
            const validStatuses = ['active', 'trialing', 'active_free'];
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

console.log('✅ Access Control System v4.3 ready');
console.log('📊 Available plans:', Object.keys(ACCESS_LEVELS));
console.log('⏰ Trial expiration check: enabled');
console.log('🛒 Upgrade redirects to: checkout.html');
console.log('🚫 Plan "free" with "inactive" status: BLOCKED');
console.log('✨ Dedicated modal for users without subscription: ENABLED');
console.log('🤖 Chatbot blocking on access denied: ENABLED');
console.log('🎁 Trial: Full page access + PRO rate limits (6/min, 200/day)');

// ═══════════════════════════════════════════════════════════════
//  RATE LIMITING SYSTEM - VERSION 1.1
//  ✅ TRIAL = PRO RATE LIMITS (6/min, 200/day)
// ═══════════════════════════════════════════════════════════════

console.log('⏱ Rate Limiting System v1.1 initialized');

const RATE_LIMITS = {
    none: {
        chatbot: { dailyLimit: 0, enabled: false },
        api: { enabled: false, perMinute: 0, dailyLimit: 0 }
    },
    
    free: {
        chatbot: { dailyLimit: 5, enabled: true },
        api: { enabled: false, perMinute: 0, dailyLimit: 0 }
    },
    
    basic: {
        chatbot: { dailyLimit: 5, enabled: true },
        api: { enabled: false, perMinute: 0, dailyLimit: 0 }
    },
    
    pro: {
        chatbot: { dailyLimit: -1, enabled: true },
        api: { enabled: true, perMinute: 6, dailyLimit: 200 }
    },
    
    freepro: {
        chatbot: { dailyLimit: -1, enabled: true },
        api: { enabled: true, perMinute: 6, dailyLimit: 200 }
    },
    
    platinum: {
        chatbot: { dailyLimit: -1, enabled: true },
        api: { enabled: true, perMinute: 8, dailyLimit: 400 }
    },
    
    freeplatinum: {
        chatbot: { dailyLimit: -1, enabled: true },
        api: { enabled: true, perMinute: 8, dailyLimit: 400 }
    },
    
    // ✅✅✅ CORRECTION : TRIAL = PRO RATE LIMITS
    trial: {
        chatbot: { dailyLimit: -1, enabled: true }, // Chatbot illimité
        api: { enabled: true, perMinute: 6, dailyLimit: 200 } // ✅ MÊME QUE PRO (pas Platinum)
    }
};

async function getEffectiveUserPlan() {
    const user = firebase.auth().currentUser;
    
    if (!user) {
        return { plan: 'none', limits: RATE_LIMITS.none };
    }
    
    try {
        const userDoc = await firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .get();
        
        if (!userDoc.exists) {
            return { plan: 'none', limits: RATE_LIMITS.none };
        }
        
        const userData = userDoc.data();
        let userPlan = (userData.plan || 'none').toLowerCase();
        let subscriptionStatus = (userData.subscriptionStatus || 'none').toLowerCase();
        const promoCode = (userData.promoCode || '').toUpperCase();
        const trialEndsAt = userData.trialEndsAt || null;
        
        if (userPlan === 'free' && (subscriptionStatus === 'inactive' || subscriptionStatus === 'none' || subscriptionStatus === 'cancelled')) {
            userPlan = 'none';
        }
        
        if (subscriptionStatus === 'trial' && trialEndsAt) {
            const now = new Date();
            const expirationDate = new Date(trialEndsAt);
            
            if (now < expirationDate) {
                userPlan = 'trial';
                console.log('🎁 Trial mode - Pro rate limits applied (6/min, 200/day)');
            } else {
                userPlan = 'none';
            }
        }
        else if (promoCode === 'FREEPRO') {
            userPlan = 'freepro';
        } else if (promoCode === 'FREEPLATINUM') {
            userPlan = 'freeplatinum';
        }
        
        const limits = RATE_LIMITS[userPlan] || RATE_LIMITS.none;
        
        return { plan: userPlan, limits: limits, userId: user.uid };
        
    } catch (error) {
        console.error('❌ Error getting user plan:', error);
        return { plan: 'none', limits: RATE_LIMITS.none };
    }
}

async function canUseChatbot() {
    const userInfo = await getEffectiveUserPlan();
    const { plan, limits, userId } = userInfo;
    
    console.log('🤖 Checking chatbot quota for plan: ' + plan);
    
    if (!limits.chatbot.enabled) {
        console.warn('⛔ Chatbot disabled for plan: ' + plan);
        return {
            allowed: false,
            reason: 'chatbot_disabled',
            message: 'Chatbot access requires a paid subscription plan.',
            upgradeRequired: 'basic'
        };
    }
    
    if (limits.chatbot.dailyLimit === -1) {
        console.log('✅ Unlimited chatbot access');
        return { allowed: true, remaining: -1 };
    }
    
    try {
        const today = new Date().toISOString().split('T')[0];
        const usageRef = firebase.firestore()
            .collection('usage')
            .doc(userId)
            .collection('chatbot')
            .doc(today);
        
        const usageDoc = await usageRef.get();
        
        let currentCount = 0;
        
        if (usageDoc.exists) {
            currentCount = usageDoc.data().count || 0;
        }
        
        console.log('📊 Chatbot usage today: ' + currentCount + '/' + limits.chatbot.dailyLimit);
        
        if (currentCount >= limits.chatbot.dailyLimit) {
            console.warn('⛔ Daily chatbot limit reached');
            return {
                allowed: false,
                reason: 'daily_limit_reached',
                message: 'You have reached your daily chatbot limit (' + limits.chatbot.dailyLimit + ' messages). Upgrade to Pro for unlimited access.',
                current: currentCount,
                limit: limits.chatbot.dailyLimit,
                upgradeRequired: 'pro'
            };
        }
        
        await usageRef.set({
            count: currentCount + 1,
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
            plan: plan
        }, { merge: true });
        
        const remaining = limits.chatbot.dailyLimit - (currentCount + 1);
        console.log('✅ Chatbot message allowed. Remaining: ' + remaining);
        
        return {
            allowed: true,
            remaining: remaining,
            current: currentCount + 1,
            limit: limits.chatbot.dailyLimit
        };
        
    } catch (error) {
        console.error('❌ Error checking chatbot quota:', error);
        return {
            allowed: false,
            reason: 'error',
            message: 'Error checking quota. Please try again.'
        };
    }
}

async function canUseAPI(apiName) {
    apiName = apiName || 'general';
    
    const userInfo = await getEffectiveUserPlan();
    const { plan, limits, userId } = userInfo;
    
    console.log('🔌 Checking API quota for plan: ' + plan + ' | API: ' + apiName);
    
    if (!limits.api.enabled) {
        console.warn('⛔ API access disabled for plan: ' + plan);
        return {
            allowed: false,
            reason: 'api_disabled',
            message: 'API access requires Pro or Platinum plan.',
            upgradeRequired: 'pro'
        };
    }
    
    try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentMinute = now.toISOString().substring(0, 16);
        
        const usageRef = firebase.firestore()
            .collection('usage')
            .doc(userId)
            .collection('api');
        
        const minuteDoc = await usageRef.doc('minute_' + currentMinute).get();
        let minuteCount = 0;
        
        if (minuteDoc.exists) {
            minuteCount = minuteDoc.data().count || 0;
        }
        
        if (minuteCount >= limits.api.perMinute) {
            console.warn('⛔ Per-minute API limit reached: ' + minuteCount + '/' + limits.api.perMinute);
            return {
                allowed: false,
                reason: 'rate_limit_exceeded',
                message: 'Rate limit exceeded (' + limits.api.perMinute + ' requests/minute). Please wait.',
                retryAfter: 60 - now.getSeconds()
            };
        }
        
        const dayDoc = await usageRef.doc('day_' + today).get();
        let dayCount = 0;
        
        if (dayDoc.exists) {
            dayCount = dayDoc.data().count || 0;
        }
        
        console.log('📊 API usage today: ' + dayCount + '/' + limits.api.dailyLimit);
        
        if (dayCount >= limits.api.dailyLimit) {
            console.warn('⛔ Daily API limit reached');
            return {
                allowed: false,
                reason: 'daily_limit_reached',
                message: 'You have reached your daily API limit (' + limits.api.dailyLimit + ' requests). Upgrade to Platinum for higher limits.',
                current: dayCount,
                limit: limits.api.dailyLimit,
                upgradeRequired: 'platinum'
            };
        }
        
        await usageRef.doc('minute_' + currentMinute).set({
            count: minuteCount + 1,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            plan: plan,
            apiName: apiName
        }, { merge: true });
        
        await usageRef.doc('day_' + today).set({
            count: dayCount + 1,
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp(),
            plan: plan
        }, { merge: true });
        
        const remainingDaily = limits.api.dailyLimit - (dayCount + 1);
        const remainingMinute = limits.api.perMinute - (minuteCount + 1);
        
        console.log('✅ API request allowed. Remaining: ' + remainingDaily + '/day, ' + remainingMinute + '/min');
        
        return {
            allowed: true,
            remainingDaily: remainingDaily,
            remainingMinute: remainingMinute,
            currentDaily: dayCount + 1,
            currentMinute: minuteCount + 1,
            limitDaily: limits.api.dailyLimit,
            limitMinute: limits.api.perMinute
        };
        
    } catch (error) {
        console.error('❌ Error checking API quota:', error);
        return {
            allowed: false,
            reason: 'error',
            message: 'Error checking quota. Please try again.'
        };
    }
}

async function getUsageStats() {
    const userInfo = await getEffectiveUserPlan();
    const { plan, limits, userId } = userInfo;
    
    if (!userId) {
        return null;
    }
    
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const chatbotDoc = await firebase.firestore()
            .collection('usage')
            .doc(userId)
            .collection('chatbot')
            .doc(today)
            .get();
        
        const chatbotCount = chatbotDoc.exists ? (chatbotDoc.data().count || 0) : 0;
        
        const apiDoc = await firebase.firestore()
            .collection('usage')
            .doc(userId)
            .collection('api')
            .doc('day_' + today)
            .get();
        
        const apiCount = apiDoc.exists ? (apiDoc.data().count || 0) : 0;
        
        return {
            plan: plan,
            chatbot: {
                used: chatbotCount,
                limit: limits.chatbot.dailyLimit,
                remaining: limits.chatbot.dailyLimit === -1 ? -1 : (limits.chatbot.dailyLimit - chatbotCount),
                unlimited: limits.chatbot.dailyLimit === -1
            },
            api: {
                used: apiCount,
                limitDaily: limits.api.dailyLimit,
                limitMinute: limits.api.perMinute,
                remainingDaily: limits.api.dailyLimit === 0 ? 0 : (limits.api.dailyLimit - apiCount),
                enabled: limits.api.enabled
            }
        };
        
    } catch (error) {
        console.error('❌ Error getting usage stats:', error);
        return null;
    }
}

function showQuotaModal(type, quotaInfo) {
    const messages = {
        chatbot: {
            title: '💬 Chatbot Limit Reached',
            description: 'You have used all your chatbot messages for today (' + quotaInfo.limit + ' messages).',
            icon: '🤖',
            upgradeText: 'Upgrade to Pro for unlimited chatbot access!',
            upgradeTarget: 'pro'
        },
        api: {
            title: '🔌 API Limit Reached',
            description: quotaInfo.reason === 'rate_limit_exceeded' 
                ? 'You have exceeded the rate limit. Please wait ' + quotaInfo.retryAfter + ' seconds.'
                : 'You have used all your API requests for today (' + quotaInfo.limit + ' requests).',
            icon: '⏱',
            upgradeText: quotaInfo.upgradeRequired === 'platinum' 
                ? 'Upgrade to Platinum for higher API limits!' 
                : 'Upgrade to Pro for API access!',
            upgradeTarget: quotaInfo.upgradeRequired || 'pro'
        },
        api_disabled: {
            title: '🔒 API Access Required',
            description: 'API access is only available for Pro and Platinum plans.',
            icon: '🚀',
            upgradeText: 'Upgrade to Pro to unlock API access!',
            upgradeTarget: 'pro'
        }
    };
    
    const msgType = quotaInfo.reason === 'api_disabled' ? 'api_disabled' : type;
    const msg = messages[msgType] || messages.chatbot;
    
    const existingModal = document.getElementById('quota-modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'quota-modal-overlay';
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
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            border-radius: 24px;
            padding: 48px;
            max-width: 520px;
            width: 90%;
            text-align: center;
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4);
            transform: scale(0.9);
            transition: transform 0.3s ease;
        " id="quota-modal-content">
            <div style="font-size: 72px; margin-bottom: 20px;">
                ${msg.icon}
            </div>
            <h2 style="
                color: white;
                font-size: 32px;
                margin-bottom: 16px;
                font-weight: 800;
            ">${msg.title}</h2>
            <p style="
                color: rgba(255, 255, 255, 0.95);
                font-size: 16px;
                margin-bottom: 24px;
                line-height: 1.6;
            ">${msg.description}</p>
            <p style="
                color: white;
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 32px;
            ">${msg.upgradeText}</p>
            <div style="
                display: flex;
                gap: 16px;
                justify-content: center;
                flex-wrap: wrap;
            ">
                <button id="btn-quota-upgrade" style="
                    background: white;
                    color: #f59e0b;
                    border: none;
                    border-radius: 14px;
                    padding: 16px 36px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
                ">
                    Upgrade Now
                </button>
                <button id="btn-quota-close" style="
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                    border: 2px solid rgba(255, 255, 255, 0.4);
                    border-radius: 14px;
                    padding: 16px 36px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.style.opacity = '1';
        document.getElementById('quota-modal-content').style.transform = 'scale(1)';
    }, 10);
    
    document.getElementById('btn-quota-upgrade').addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
    
    document.getElementById('btn-quota-close').addEventListener('click', () => {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    });
}

window.canUseChatbot = canUseChatbot;
window.canUseAPI = canUseAPI;
window.getUsageStats = getUsageStats;
window.showQuotaModal = showQuotaModal;
window.RATE_LIMITS = RATE_LIMITS;

console.log('✅ Rate Limiting System v1.1 ready');
console.log('📊 Chatbot limits: Free/Basic=5/day, Pro/Trial/Platinum=unlimited');
console.log('🔌 API limits: Free/Basic=disabled, Pro/Trial=6/min+200/day, Platinum=8/min+400/day');
console.log('🎁 Trial users get PRO rate limits (not Platinum)');