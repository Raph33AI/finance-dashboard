console.log('🔐 Access Control System v3.1 initialized');

const ACCESS_LEVELS = {
    free: {
        name: 'Free',
        level: 0,
        requiresActiveSubscription: false,
        pages: ['dashboard-financier.html', 'monte-carlo.html', 'portfolio-optimizer.html'],
        features: ['portfolio-tracking', 'basic-data', 'monte-carlo-basic', 'portfolio-optimization-basic']
    },
    basic: {
        name: 'Basic',
        level: 0,
        requiresActiveSubscription: false,
        pages: ['dashboard-financier.html', 'monte-carlo.html', 'portfolio-optimizer.html'],
        features: ['portfolio-tracking', 'basic-data', 'monte-carlo-basic', 'portfolio-optimization-basic']
    },
    pro: {
        name: 'Pro',
        level: 1,
        requiresActiveSubscription: true,
        pages: ['dashboard-financier.html', 'monte-carlo.html', 'portfolio-optimizer.html', 'investments-analytics.html', 'risk-parity.html', 'scenario-analysis.html', 'market-data.html', 'trend-prediction.html', 'market-intelligence.html'],
        features: ['all-basic', 'advanced-analytics', 'risk-parity', 'scenario-analysis', 'real-time-data', 'trend-prediction', 'market-intelligence']
    },
    freepro: {
        name: 'Free Pro',
        level: 1,
        requiresActiveSubscription: false,
        pages: ['dashboard-financier.html', 'monte-carlo.html', 'portfolio-optimizer.html', 'investments-analytics.html', 'risk-parity.html', 'scenario-analysis.html', 'market-data.html', 'trend-prediction.html', 'market-intelligence.html'],
        features: ['all-basic', 'advanced-analytics', 'risk-parity', 'scenario-analysis', 'real-time-data', 'trend-prediction', 'market-intelligence']
    },
    platinum: {
        name: 'Platinum',
        level: 2,
        requiresActiveSubscription: true,
        pages: ['all'],
        features: ['all']
    },
    freeplatinum: {
        name: 'Free Platinum',
        level: 2,
        requiresActiveSubscription: false,
        pages: ['all'],
        features: ['all']
    },
    trial: {
        name: 'Trial',
        level: 1,
        requiresActiveSubscription: false,
        requiresTrialValidation: true,
        pages: ['all'],
        features: ['all']
    }
};

const PAGE_CATEGORIES = {
    public: ['index.html', 'about.html', 'auth.html', 'checkout.html', 'contact.html', 'pricing.html', 'privacy.html', 'security.html', 'success.html', 'terms.html'],
    authenticated: ['settings.html', 'user-profile.html', 'interactive-demo.html', 'netlify.html', 'chatbot-integration.html'],
    basic: ['dashboard-financier.html', 'monte-carlo.html', 'portfolio-optimizer.html'],
    pro: ['investments-analytics.html', 'risk-parity.html', 'scenario-analysis.html', 'market-data.html', 'trend-prediction.html', 'market-intelligence.html'],
    platinum: ['advanced-analysis.html', 'analyst-coverage.html', 'chatbot-fullpage.html', 'company-insights.html', 'earnings-estimates.html']
};

async function checkPageAccess(pageName) {
    try {
        console.log('🔍 Checking access for page: ' + pageName);
        
        if (PAGE_CATEGORIES.public.includes(pageName)) {
            console.log('🌐 Public page - access granted');
            return true;
        }
        
        const user = firebase.auth().currentUser;
        
        if (!user) {
            console.warn('⚠ User not logged in');
            redirectToLogin();
            return false;
        }
        
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        
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

        if (subscriptionStatus === 'trial' &amp;&amp; trialEndsAt) {
            const now = new Date();
            const expirationDate = new Date(trialEndsAt);
            
            console.log('📅 Trial check: Now = ' + now.toISOString() + ', Expires = ' + expirationDate.toISOString());
            
            if (now &lt; expirationDate) {
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
                console.warn('⏰ Trial expired on ' + expirationDate.toLocaleDateString());
                showUpgradeModal(userPlan, 'trial_expired');
                return false;
            }
        }
        else if (promoCode === 'FREEPRO') {
            userPlan = 'freepro';
            console.log('🎁 Promo code applied: FREEPRO - Plan upgraded to: freepro');
        } else if (promoCode === 'FREEPLATINUM') {
            userPlan = 'freeplatinum';
            console.log('🎁 Promo code applied: FREEPLATINUM - Plan upgraded to: freeplatinum');
        }

        const planConfig = ACCESS_LEVELS[userPlan];
        
        if (!planConfig) {
            console.error('❌ Unknown plan: ' + userPlan);
            userPlan = 'free';
        }
        
        if (planConfig.requiresActiveSubscription) {
            const validStatuses = ['active', 'trialing'];
            
            if (!validStatuses.includes(subscriptionStatus)) {
                console.warn('⚠ Plan requires active subscription but status is: ' + subscriptionStatus);
                showUpgradeModal(userPlan, 'expired');
                return false;
            }
            
            console.log('✅ Subscription status validated for paid plan');
        } else {
            console.log('✅ Plan does not require active subscription');
        }
        
        console.log('🔑 Effective access level: ' + userPlan + ' (level ' + planConfig.level + ')');

        if (userPlan === 'platinum' || userPlan === 'freeplatinum' || (userPlan === 'trial' &amp;&amp; planConfig.level === 2)) {
            console.log('✅ Access granted (Full access)');
            return true;
        }
        
        if (userPlan === 'trial' &amp;&amp; planConfig.level === 1) {
            console.log('✅ Access granted (Trial - Pro level)');
            return true;
        }
        
        if (PAGE_CATEGORIES.authenticated.includes(pageName)) {
            console.log('✅ Access granted (Authenticated page)');
            return true;
        }
        
        const allowedPages = planConfig.pages || [];
        
        if (allowedPages.includes('all') || allowedPages.includes(pageName)) {
            console.log('✅ Access granted (Page in access list)');
            return true;
        }
        
        const pageLevel = getPageRequiredLevel(pageName);
        
        if (planConfig.level &gt;= pageLevel) {
            console.log('✅ Access granted (Level sufficient)');
            return true;
        }
        
        console.warn('⛔ Access denied for ' + pageName);
        
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
    
    const modalContent = document.createElement('div');
    modalContent.id = 'upgrade-modal-content';
    modalContent.style.cssText = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 24px; padding: 48px 40px; max-width: 520px; width: 90%; box-shadow: 0 24px 64px rgba(0, 0, 0, 0.4); text-align: center; transform: scale(0.9); transition: transform 0.3s ease;';
    
    const iconDiv = document.createElement('div');
    iconDiv.style.cssText = 'font-size: 72px; margin-bottom: 24px; filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));';
    iconDiv.textContent = msg.icon;
    
    const titleH2 = document.createElement('h2');
    titleH2.style.cssText = 'color: white; font-size: 32px; font-weight: 800; margin: 0 0 16px 0; text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);';
    titleH2.textContent = msg.title;
    
    const descP = document.createElement('p');
    descP.style.cssText = 'color: rgba(255, 255, 255, 0.95); font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;';
    descP.textContent = msg.description;
    
    const planDiv = document.createElement('div');
    planDiv.style.cssText = 'background: rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 16px; margin-bottom: 32px; backdrop-filter: blur(10px);';
    
    const planP = document.createElement('p');
    planP.style.cssText = 'color: white; font-size: 14px; margin: 0; font-weight: 600;';
    planP.innerHTML = 'Your current plan: ' + currentPlan + '';
    
    planDiv.appendChild(planP);
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = 'display: flex; gap: 16px; justify-content: center;';
    
    const upgradeBtn = document.createElement('button');
    upgradeBtn.id = 'btn-upgrade-now';
    upgradeBtn.style.cssText = 'flex: 1; background: white; color: #667eea; border: none; border-radius: 12px; padding: 16px 32px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);';
    upgradeBtn.textContent = 'Upgrade to ' + msg.suggestedPlan;
    
    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'btn-cancel-modal';
    cancelBtn.style.cssText = 'flex: 0.4; background: rgba(255, 255, 255, 0.2); color: white; border: 2px solid rgba(255, 255, 255, 0.4); border-radius: 12px; padding: 16px 24px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px);';
    cancelBtn.textContent = 'Go Back';
    
    buttonsDiv.appendChild(upgradeBtn);
    buttonsDiv.appendChild(cancelBtn);
    
    modalContent.appendChild(iconDiv);
    modalContent.appendChild(titleH2);
    modalContent.appendChild(descP);
    modalContent.appendChild(planDiv);
    modalContent.appendChild(buttonsDiv);
    
    modal.appendChild(modalContent);
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
    
    const upgradeBtnElement = document.getElementById('btn-upgrade-now');
    upgradeBtnElement.addEventListener('mouseenter', function() {
        upgradeBtnElement.style.transform = 'scale(1.05) translateY(-2px)';
        upgradeBtnElement.style.boxShadow = '0 8px 28px rgba(0, 0, 0, 0.3)';
    });
    upgradeBtnElement.addEventListener('mouseleave', function() {
        upgradeBtnElement.style.transform = 'scale(1) translateY(0)';
        upgradeBtnElement.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
    });
    
    const cancelBtnElement = document.getElementById('btn-cancel-modal');
    cancelBtnElement.addEventListener('mouseenter', function() {
        cancelBtnElement.style.background = 'rgba(255, 255, 255, 0.3)';
    });
    cancelBtnElement.addEventListener('mouseleave', function() {
        cancelBtnElement.style.background = 'rgba(255, 255, 255, 0.2)';
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
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) return false;
        
        const userData = userDoc.data();
        let userPlan = (userData.plan || 'free').toLowerCase();
        const subscriptionStatus = (userData.subscriptionStatus || 'inactive').toLowerCase();
        const promoCode = (userData.promoCode || '').toUpperCase();
        const trialEndsAt = userData.trialEndsAt || null;
        
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