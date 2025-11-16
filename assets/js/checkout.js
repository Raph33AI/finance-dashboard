/* ═══════════════════════════════════════════════════════════════
   CHECKOUT.JS - VERSION CLOUDFLARE WORKERS + CODES PROMO + STRIPE
   AlphaVault AI v2.1
   ✅ Détection du plan existant pour "Change Plan"
   ═══════════════════════════════════════════════════════════════ */

// ⚙️ CONFIGURATION
const STRIPE_PUBLIC_KEY = 'pk_live_51SU1qnDxR6DPBfOfX6yJYr9Qzh40aNGrn1TSZxI5q0Q0m9hsgXmMQFq2TErynzuUKOivH4T3DJ1FjKy683WsqQAR00tAMRJGtk';
const WORKER_URL = 'https://finance-hub-api.raphnardone.workers.dev';

console.log('🔧 Checkout configuration:');
console.log('   Stripe Public Key:', STRIPE_PUBLIC_KEY.substring(0, 20) + '...');
console.log('   Worker URL:', WORKER_URL);

// ═══════════════════════════════════════════════════════════════
// 🎁 CODES PROMO DISPONIBLES (côté client pour validation immédiate)
// ═══════════════════════════════════════════════════════════════

const PROMO_CODES = {
    'LAUNCH15': {
        type: 'percentage',
        value: 15,
        description: '15% off for early adopters'
    },
    'WELCOME15': {
        type: 'percentage',
        value: 15,
        description: '15% welcome discount'
    },
    'SAVE15': {
        type: 'percentage',
        value: 15,
        description: '15% savings'
    },
    'FREEPRO': {
        type: 'free',
        plans: ['pro'],
        description: 'Free lifetime access to Pro plan'
    },
    'FREEPLATINUM': {
        type: 'free',
        plans: ['platinum'],
        description: 'Free lifetime access to Platinum plan'
    },
    'VIPACCESS': {
        type: 'free',
        plans: ['pro', 'platinum'],
        description: 'VIP lifetime access'
    }
};

// ✅ NOUVEAU : État de l'application étendu
let selectedPlan = {
    name: 'pro',
    price: 15
};

let appliedPromo = null;

// ✅ NOUVEAU : Plan existant de l'utilisateur
let userExistingPlan = {
    hasPlan: false,
    currentPlan: 'basic',
    subscriptionStatus: 'inactive'
};

// Initialiser Stripe
const stripe = Stripe(STRIPE_PUBLIC_KEY);
const elements = stripe.elements();

// ═══════════════════════════════════════════════════════════════
// STYLE DES ÉLÉMENTS STRIPE
// ═══════════════════════════════════════════════════════════════

const cardStyle = {
    base: {
        color: '#1e293b',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        fontWeight: '500',
        '::placeholder': {
            color: '#94a3b8',
        },
        iconColor: '#3B82F6',
    },
    invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
    },
};

const cardElement = elements.create('card', { style: cardStyle });
cardElement.mount('#card-element');

console.log('✅ Stripe card element mounted');

// ═══════════════════════════════════════════════════════════════
// GESTION DES ERREURS DE CARTE
// ═══════════════════════════════════════════════════════════════

cardElement.on('change', function(event) {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
        displayError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${event.error.message}`;
        console.warn('⚠️ Card validation error:', event.error.message);
    } else {
        displayError.textContent = '';
    }
});

// ═══════════════════════════════════════════════════════════════
// ✅ NOUVEAU : VÉRIFIER LE PLAN EXISTANT DE L'UTILISATEUR
// ═══════════════════════════════════════════════════════════════

async function checkExistingPlan(user) {
    try {
        console.log('🔍 Checking existing plan for user:', user.uid);
        
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            const plan = userData?.plan || 'basic';
            const status = userData?.subscriptionStatus || 'inactive';
            
            console.log('📊 Current plan:', plan);
            console.log('📊 Subscription status:', status);
            
            // Déterminer si l'utilisateur a un plan actif
            const hasActivePlan = ['active', 'active_free', 'trialing'].includes(status) && plan !== 'basic';
            
            userExistingPlan = {
                hasPlan: hasActivePlan,
                currentPlan: plan,
                subscriptionStatus: status
            };
            
            // Afficher le badge du plan actuel si applicable
            if (hasActivePlan) {
                displayCurrentPlanBadge(plan);
            }
            
            // Adapter le header
            updateHeaderForExistingUser(hasActivePlan);
            
            // Mettre à jour le bouton
            updatePriceSummary();
            
            console.log('✅ Existing plan check complete:', userExistingPlan);
        } else {
            console.log('ℹ️ No existing user data found');
        }
    } catch (error) {
        console.error('❌ Error checking existing plan:', error);
    }
}

// ✅ NOUVEAU : Afficher le badge du plan actuel
function displayCurrentPlanBadge(plan) {
    const planName = plan === 'pro' ? 'Pro' : plan === 'platinum' ? 'Platinum' : 'Basic';
    const planColor = plan === 'platinum' ? '#8B5CF6' : '#3B82F6';
    
    const badge = document.createElement('div');
    badge.id = 'current-plan-badge';
    badge.style.cssText = `
        background: linear-gradient(135deg, ${planColor}, rgba(59, 130, 246, 0.8));
        color: white;
        padding: 12px 24px;
        border-radius: 20px;
        font-size: 0.95rem;
        font-weight: 700;
        text-align: center;
        margin-bottom: 20px;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    `;
    badge.innerHTML = `
        <i class="fas fa-crown"></i>
        <span>Current Plan: ${planName}</span>
    `;
    
    const header = document.querySelector('.checkout-header');
    const title = header.querySelector('.checkout-title');
    header.insertBefore(badge, title);
}

// ✅ NOUVEAU : Adapter le header pour utilisateur existant
function updateHeaderForExistingUser(hasActivePlan) {
    const title = document.querySelector('.checkout-title');
    const subtitle = document.querySelector('.checkout-subtitle');
    
    if (hasActivePlan) {
        title.textContent = 'Change Your Plan';
        subtitle.textContent = 'Upgrade or downgrade anytime • Cancel anytime • Secure payment';
    } else {
        title.textContent = 'Start Your Premium Journey';
        subtitle.textContent = '14-day free trial • Cancel anytime • Secure payment';
    }
}

// ═══════════════════════════════════════════════════════════════
// SÉLECTION DU PLAN
// ═══════════════════════════════════════════════════════════════

const planOptions = document.querySelectorAll('.plan-option');

planOptions.forEach(option => {
    option.addEventListener('click', function() {
        console.log('📦 Plan clicked:', this.dataset.plan);
        
        planOptions.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        
        selectedPlan = {
            name: this.dataset.plan,
            price: parseFloat(this.dataset.price)
        };
        
        console.log('✅ Plan sélectionné:', selectedPlan);
        
        // Mettre à jour le récapitulatif
        updatePriceSummary();
    });
});

// Sélectionner Pro par défaut
const defaultPlan = document.querySelector('[data-plan="pro"]');
if (defaultPlan) {
    defaultPlan.classList.add('selected');
    console.log('✅ Default plan selected: Pro');
}

// Détecter le plan depuis l'URL
const urlParams = new URLSearchParams(window.location.search);
const urlPlan = urlParams.get('plan');

if (urlPlan && (urlPlan === 'pro' || urlPlan === 'platinum')) {
    console.log('🔗 Plan détecté dans URL:', urlPlan);
    
    const targetPlan = document.querySelector(`[data-plan="${urlPlan}"]`);
    if (targetPlan) {
        planOptions.forEach(opt => opt.classList.remove('selected'));
        targetPlan.classList.add('selected');
        
        selectedPlan = {
            name: urlPlan,
            price: parseFloat(targetPlan.dataset.price)
        };
        
        console.log('✅ Plan auto-sélectionné depuis URL:', selectedPlan);
    }
}

// ═══════════════════════════════════════════════════════════════
// 🎁 GESTION DES CODES PROMO
// ═══════════════════════════════════════════════════════════════

const promoInput = document.getElementById('promoCode');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const promoMessage = document.getElementById('promoMessage');
const promoApplied = document.getElementById('promoApplied');
const removePromoBtn = document.getElementById('removePromoBtn');

// Appliquer le code promo
applyPromoBtn.addEventListener('click', function() {
    const code = promoInput.value.trim().toUpperCase();
    
    if (!code) {
        showPromoMessage('Please enter a promo code', 'error');
        return;
    }
    
    console.log('🎁 Tentative d\'application du code:', code);
    
    // Vérifier si le code existe
    const promo = PROMO_CODES[code];
    
    if (!promo) {
        showPromoMessage('Invalid promo code', 'error');
        console.warn('❌ Code invalide:', code);
        return;
    }
    
    // Vérifier si le code est applicable au plan sélectionné
    if (promo.type === 'free' && !promo.plans.includes(selectedPlan.name)) {
        showPromoMessage(`This code is only valid for ${promo.plans.join(' or ')} plan`, 'error');
        console.warn('❌ Code non applicable à ce plan');
        return;
    }
    
    // Appliquer le code
    appliedPromo = {
        code: code,
        ...promo
    };
    
    console.log('✅ Code promo appliqué:', appliedPromo);
    
    // Afficher le badge de succès
    document.getElementById('promoCodeName').textContent = code;
    promoApplied.classList.remove('hidden');
    promoInput.value = '';
    promoInput.disabled = true;
    applyPromoBtn.disabled = true;
    
    showPromoMessage(`${promo.description}`, 'success');
    
    // Mettre à jour le récapitulatif
    updatePriceSummary();
});

// Supprimer le code promo
removePromoBtn.addEventListener('click', function() {
    console.log('🗑️ Suppression du code promo');
    
    appliedPromo = null;
    promoApplied.classList.add('hidden');
    promoInput.disabled = false;
    applyPromoBtn.disabled = false;
    promoMessage.classList.add('hidden');
    
    updatePriceSummary();
});

// Fonction pour afficher les messages de validation
function showPromoMessage(message, type) {
    promoMessage.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    promoMessage.className = `promo-message ${type}`;
    promoMessage.classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════════
// MISE À JOUR DU RÉCAPITULATIF DES PRIX
// ═══════════════════════════════════════════════════════════════

function updatePriceSummary() {
    const planName = selectedPlan.name === 'pro' ? 'AlphaVault Pro' : 'AlphaVault Platinum';
    const originalPrice = selectedPlan.price;
    
    document.getElementById('summaryPlanName').textContent = planName;
    document.getElementById('summaryOriginalPrice').textContent = `$${originalPrice.toFixed(2)}`;
    
    // ✅ LOGIQUE DE TEXTE DU BOUTON
    let buttonText = '';
    
    // Si un code promo est appliqué
    if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
            // Réduction en pourcentage
            const discountAmount = (originalPrice * appliedPromo.value) / 100;
            const finalPrice = originalPrice - discountAmount;
            
            document.getElementById('discountPercent').textContent = appliedPromo.value;
            document.getElementById('discountAmount').textContent = `-$${discountAmount.toFixed(2)}`;
            document.getElementById('discountRow').classList.remove('hidden');
            
            document.getElementById('originalPriceStriked').textContent = `$${originalPrice.toFixed(2)}`;
            document.getElementById('originalPriceStriked').classList.remove('hidden');
            
            document.getElementById('summaryFinalPrice').textContent = `$${finalPrice.toFixed(2)}`;
            
            document.getElementById('freeAccessBadge').classList.add('hidden');
            
            // ✅ ADAPTATION DU TEXTE DU BOUTON
            if (userExistingPlan.hasPlan) {
                buttonText = 'Change Plan';
            } else {
                buttonText = 'Start 14-Day Free Trial';
            }
            
            // Afficher le groupe de carte de crédit
            document.getElementById('cardDetailsGroup').classList.remove('hidden');
            
        } else if (appliedPromo.type === 'free') {
            // Accès gratuit
            document.getElementById('discountRow').classList.add('hidden');
            document.getElementById('originalPriceStriked').textContent = `$${originalPrice.toFixed(2)}`;
            document.getElementById('originalPriceStriked').classList.remove('hidden');
            
            document.getElementById('summaryFinalPrice').textContent = 'FREE';
            
            document.getElementById('freeAccessBadge').classList.remove('hidden');
            
            // ✅ TEXTE SPÉCIFIQUE POUR ACCÈS GRATUIT
            buttonText = 'Activate Free Lifetime Access';
            
            // Cacher le groupe de carte de crédit
            document.getElementById('cardDetailsGroup').classList.add('hidden');
        }
    } else {
        // Pas de code promo
        document.getElementById('discountRow').classList.add('hidden');
        document.getElementById('originalPriceStriked').classList.add('hidden');
        document.getElementById('summaryFinalPrice').textContent = `$${originalPrice.toFixed(2)}`;
        document.getElementById('freeAccessBadge').classList.add('hidden');
        
        // ✅ ADAPTATION DU TEXTE SELON LE PLAN EXISTANT
        if (userExistingPlan.hasPlan) {
            buttonText = 'Change Plan';
        } else {
            buttonText = 'Start 14-Day Free Trial';
        }
        
        // Afficher le groupe de carte de crédit
        document.getElementById('cardDetailsGroup').classList.remove('hidden');
    }
    
    // ✅ METTRE À JOUR LE TEXTE DU BOUTON
    document.getElementById('submitButtonText').textContent = buttonText;
}

// Initialiser le récapitulatif
updatePriceSummary();

// ═══════════════════════════════════════════════════════════════
// SOUMISSION DU FORMULAIRE
// ═══════════════════════════════════════════════════════════════

const form = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-button');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 DÉBUT DU PROCESSUS DE PAIEMENT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    
    try {
        // 1️⃣ Vérifier l'authentification
        console.log('1️⃣ Vérification de l\'authentification...');
        
        const user = firebase.auth().currentUser;
        
        if (!user) {
            throw new Error('Vous devez être connecté pour procéder au paiement');
        }
        
        console.log('   ✅ Utilisateur authentifié:', user.email);
        console.log('   📧 User ID:', user.uid);
        
        // 2️⃣ Récupérer les données du formulaire
        console.log('2️⃣ Récupération des données...');
        
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        
        console.log('   ✅ Email:', email);
        console.log('   ✅ Nom:', name);
        console.log('   ✅ Plan sélectionné:', selectedPlan.name);
        console.log('   ✅ Prix original:', `$${selectedPlan.price}/mois`);
        console.log('   📊 Plan existant:', userExistingPlan.hasPlan ? userExistingPlan.currentPlan : 'Aucun');
        
        if (appliedPromo) {
            console.log('   🎁 Code promo appliqué:', appliedPromo.code);
            console.log('   🎁 Type:', appliedPromo.type);
            console.log('   🎁 Valeur:', appliedPromo.type === 'percentage' ? `${appliedPromo.value}%` : 'FREE');
        }
        
        // 3️⃣ Appeler le Cloudflare Worker (TOUJOURS, même pour les codes FREE)
        console.log('3️⃣ Appel du Cloudflare Worker...');
        console.log('   📡 URL:', `${WORKER_URL}/create-checkout-session`);
        
        const requestBody = {
            plan: selectedPlan.name,
            email: email,
            name: name,
            userId: user.uid,
            promoCode: appliedPromo ? appliedPromo.code : null
        };
        
        console.log('   📦 Body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(`${WORKER_URL}/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        
        console.log('   📥 Réponse reçue - Status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('   ❌ Erreur HTTP:', errorText);
            throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
        }
        
        const data = await response.json();
        console.log('   ✅ Données reçues:', data);
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // 4️⃣ Vérifier si c'est un accès gratuit
        if (data.free === true) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎉 ACCÈS GRATUIT ACTIVÉ');
            console.log('   👤 Client Stripe ID:', data.customerId || 'N/A');
            console.log('   💎 Plan:', selectedPlan.name);
            console.log('   🎁 Code promo:', appliedPromo.code);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            // ✅ Redirection vers la page de succès SANS confettis
            window.location.href = `success.html?plan=${selectedPlan.name}&free=true&noconfetti=true`;
            return;
        }
        
        // 5️⃣ Sinon, rediriger vers Stripe Checkout (paiement normal)
        if (!data.sessionId) {
            throw new Error('Session ID manquant dans la réponse');
        }
        
        console.log('   ✅ Session Stripe créée:', data.sessionId);
        console.log('5️⃣ Redirection vers Stripe Checkout...');
        
        const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId,
        });
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Redirection réussie vers Stripe!');
        
    } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('❌ ERREUR DE PAIEMENT');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('Type:', error.name);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        
        const errorDisplay = document.getElementById('card-errors');
        errorDisplay.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
        
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
    }
});

// ═══════════════════════════════════════════════════════════════
// ✅ PRÉ-REMPLIR L'EMAIL ET VÉRIFIER LE PLAN EXISTANT
// ═══════════════════════════════════════════════════════════════

firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        console.log('✅ Utilisateur Firebase détecté:', user.email);
        document.getElementById('email').value = user.email;
        
        // ✅ VÉRIFIER LE PLAN EXISTANT
        await checkExistingPlan(user);
    } else {
        console.warn('⚠️ Aucun utilisateur connecté');
    }
});

console.log('✅ Checkout script loaded successfully');