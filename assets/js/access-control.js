/* ═══════════════════════════════════════════════════════════════
   ACCESS CONTROL - Vérification des permissions par plan
   AlphaVault AI
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
            'dashboard-financier.html'
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
            'advanced-analysis.html',
            'monte-carlo.html',
            'risk-parity.html',
            'scenario-analysis.html',
            'trend-prediction.html',
            'portfolio-optimizer.html'
        ]
    },
    platinum: {
        maxAnalyses: Infinity,
        features: ['all'],
        pages: ['all']
    }
};

// ═══════════════════════════════════════════════════════════════
// VÉRIFIER L'ACCÈS À UNE PAGE
// ═══════════════════════════════════════════════════════════════

async function checkPageAccess(pageName) {
    try {
        console.log(`🔍 Checking access for page: ${pageName}`);
        
        const user = firebase.auth().currentUser;
        
        if (!user) {
            console.warn('⚠️ User not logged in');
            redirectToLogin();
            return false;
        }
        
        // Récupérer le plan de l'utilisateur depuis Firestore
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        const userPlan = userData?.plan || 'basic';
        
        console.log(`👤 User: ${user.email}`);
        console.log(`📊 Current plan: ${userPlan}`);
        
        // Vérifier si l'utilisateur a accès
        const allowedPages = ACCESS_LEVELS[userPlan].pages;
        
        if (allowedPages.includes('all') || allowedPages.includes(pageName)) {
            console.log('✅ Access granted');
            return true;
        } else {
            console.warn('⛔ Access denied - Insufficient plan');
            showUpgradeModal(userPlan);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error checking access:', error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// AFFICHER UNE MODALE D'UPGRADE
// ═══════════════════════════════════════════════════════════════

function showUpgradeModal(currentPlan) {
    console.log('🔔 Showing upgrade modal for plan:', currentPlan);
    
    // Créer une modale glassmorphism élégante
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal-overlay';
    modal.innerHTML = `
        <div class="upgrade-modal">
            <div class="upgrade-icon">
                <i class="fas fa-crown"></i>
            </div>
            <h2>Upgrade Required</h2>
            <p>This feature is only available in <strong>Pro</strong> or <strong>Platinum</strong> plans.</p>
            <p style="margin-top: 16px; font-size: 0.95rem; color: #64748b;">
                Your current plan: <strong>${currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</strong>
            </p>
            <div class="upgrade-cta-buttons">
                <button class="btn-upgrade-primary" onclick="window.location.href='checkout.html'">
                    <i class="fas fa-rocket"></i>
                    Upgrade Now
                </button>
                <button class="btn-upgrade-secondary" onclick="this.closest('.upgrade-modal-overlay').remove()">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animation d'entrée
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
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
// INITIALISATION AUTOMATIQUE SUR CHAQUE PAGE
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    console.log(`📄 Current page: ${currentPage}`);
    
    // Liste des pages protégées (nécessitent Pro ou Platinum)
    const protectedPages = [
        'advanced-analysis.html',
        'monte-carlo.html',
        'risk-parity.html',
        'scenario-analysis.html',
        'trend-prediction.html',
        'portfolio-optimizer.html'
    ];
    
    if (protectedPages.includes(currentPage)) {
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
        console.log('🔓 Public page - no access check needed');
    }
});

// ═══════════════════════════════════════════════════════════════
// FONCTION UTILITAIRE : VÉRIFIER SI UNE FEATURE EST DISPONIBLE
// ═══════════════════════════════════════════════════════════════

async function hasFeature(featureName) {
    const user = firebase.auth().currentUser;
    
    if (!user) return false;
    
    const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const userPlan = userData?.plan || 'basic';
    
    const allowedFeatures = ACCESS_LEVELS[userPlan].features;
    
    return allowedFeatures.includes('all') || allowedFeatures.includes(featureName);
}

// Exposer globalement pour utilisation dans d'autres scripts
window.hasFeature = hasFeature;
window.checkPageAccess = checkPageAccess;

console.log('✅ Access Control System ready');