/* ═══════════════════════════════════════════════════════════════
   CHECKOUT.JS - VERSION CLOUDFLARE WORKERS + CODES PROMO + STRIPE
   AlphaVault AI v2.4
   ✅ Support des codes promo TRIAL (14 jours gratuits sans CB)
   ✅ Support des 3 plans : BASIC (gratuit) + PRO + PLATINUM
   ✅ Plan Basic : 100% gratuit sans carte bancaire
   ═══════════════════════════════════════════════════════════════ */

// ⚙ CONFIGURATION
const STRIPE_PUBLIC_KEY = 'pk_live_51SU1qnDxR6DPBfOfX6yJYr9Qzh40aNGrn1TSZxI5q0Q0m9hsgXmMQFq2TErynzuUKOivH4T3DJ1FjKy683WsqQAR00tAMRJGtk';

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
        description: '15% off for early adopters',
        plans: ['pro', 'platinum'] // ✅ Pas applicable au plan Basic gratuit
    },
    'WELCOME15': {
        type: 'percentage',
        value: 15,
        description: '15% welcome discount',
        plans: ['pro', 'platinum']
    },
    'SAVE15': {
        type: 'percentage',
        value: 15,
        description: '15% savings',
        plans: ['pro', 'platinum']
    },
    // ✅ CODES PROMO FREE (seulement Pro et Platinum)
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
    },
    // ✅ CODES PROMO TRIAL 14 JOURS (seulement Pro et Platinum)
    'FREE14DAYS': {
        type: 'trial',
        duration: 14,
        plans: ['pro', 'platinum'],
        description: '14-day free trial - No credit card required'
    },
    'TRIAL14': {
        type: 'trial',
        duration: 14,
        plans: ['pro', 'platinum'],
        description: '14-day free access - No payment info needed'
    },
    'TRYITFREE': {
        type: 'trial',
        duration: 14,
        plans: ['pro', 'platinum'],
        description: 'Try AlphaVault free for 14 days'
    }
};

// ✅ État de l'application étendu
let selectedPlan = {
    name: 'basic',
    price: 0 // ✅ Plan Basic gratuit
};

let appliedPromo = null;

// ✅ Plan existant de l'utilisateur
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
        displayError.innerHTML = `<i></i> ${event.error.message}`;
        console.warn('⚠ Card validation error:', event.error.message);
    } else {
        displayError.textContent = '';
    }
});

// ═══════════════════════════════════════════════════════════════
// ✅ VÉRIFIER LE PLAN EXISTANT DE L'UTILISATEUR
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
            
            userExistingPlan = {
                hasPlan: true,
                currentPlan: plan,
                subscriptionStatus: status
            };
            
            displayCurrentPlanBadge(plan);
            updateHeaderForExistingUser(true);
            updatePriceSummary();
            
            console.log('✅ Existing user detected - showing "Change Plan"');
            console.log('   Current plan:', plan);
            console.log('   Status:', status);
        } else {
            console.log('ℹ New user - showing "Start Your Premium Journey"');
            
            userExistingPlan = {
                hasPlan: false,
                currentPlan: 'basic',
                subscriptionStatus: 'inactive'
            };
        }
    } catch (error) {
        console.error('❌ Error checking existing plan:', error);
        userExistingPlan = {
            hasPlan: false,
            currentPlan: 'basic',
            subscriptionStatus: 'inactive'
        };
    }
}

function displayCurrentPlanBadge(plan) {
    // ✅ Gestion des 3 plans
    let planName, planColor;
    
    switch(plan) {
        case 'basic':
            planName = 'Basic';
            planColor = '#06b6d4'; // Cyan
            break;
        case 'pro':
            planName = 'Pro';
            planColor = '#3B82F6'; // Blue
            break;
        case 'platinum':
            planName = 'Platinum';
            planColor = '#8B5CF6'; // Purple
            break;
        default:
            planName = 'Basic';
            planColor = '#06b6d4';
    }
    
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
        <i></i>
        Current Plan: ${planName}
    `;
    
    const header = document.querySelector('.checkout-header');
    const title = header.querySelector('.checkout-title');
    header.insertBefore(badge, title);
}

function updateHeaderForExistingUser(hasActivePlan) {
    const title = document.querySelector('.checkout-title');
    const subtitle = document.querySelector('.checkout-subtitle');
    
    if (hasActivePlan) {
        title.textContent = 'Change Your Plan';
        subtitle.textContent = 'Upgrade or downgrade anytime • Cancel anytime • Secure payment';
    } else {
        title.textContent = 'Start Your Premium Journey';
        subtitle.textContent = 'Free Basic plan • Upgrade anytime • Secure payment';
    }
}

// ═══════════════════════════════════════════════════════════════
// SÉLECTION DU PLAN
// ═══════════════════════════════════════════════════════════════

const planOptions = document.querySelectorAll('.plan-option');

planOptions.forEach(option => {
    option.addEventListener('click', function() {
        console.log('📦 Plan clicked:', this.dataset.plan);
        
        // Retirer la sélection de tous les plans
        planOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Ajouter la sélection au plan cliqué
        this.classList.add('selected');
        
        // ✅ Plan Basic = prix 0
        const planName = this.dataset.plan;
        const planPrice = planName === 'basic' ? 0 : parseFloat(this.dataset.price);
        
        selectedPlan = {
            name: planName,
            price: planPrice
        };
        
        console.log('✅ Plan sélectionné:', selectedPlan);
        
        // ✅ Retirer le code promo si on passe au plan Basic
        if (planName === 'basic' && appliedPromo) {
            console.log('ℹ Plan Basic sélectionné - Retrait du code promo');
            removePromoCode();
        }
        
        updatePriceSummary();
    });
});

// ✅ Plan par défaut : BASIC
const defaultPlan = document.querySelector('[data-plan="basic"]');
if (defaultPlan) {
    defaultPlan.classList.add('selected');
    console.log('✅ Default plan selected: Basic (Free)');
}

// ✅ Vérifier si un plan est passé en paramètre URL
const urlParams = new URLSearchParams(window.location.search);
const urlPlan = urlParams.get('plan');

if (urlPlan && ['basic', 'pro', 'platinum'].includes(urlPlan)) {
    console.log('🔗 Plan détecté dans URL:', urlPlan);
    
    const targetPlan = document.querySelector(`[data-plan="${urlPlan}"]`);
    if (targetPlan) {
        // Retirer la sélection par défaut
        planOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Sélectionner le plan de l'URL
        targetPlan.classList.add('selected');
        
        const planPrice = urlPlan === 'basic' ? 0 : parseFloat(targetPlan.dataset.price);
        
        selectedPlan = {
            name: urlPlan,
            price: planPrice
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

applyPromoBtn.addEventListener('click', function() {
    const code = promoInput.value.trim().toUpperCase();
    
    if (!code) {
        showPromoMessage('Please enter a promo code', 'error');
        return;
    }
    
    // ✅ Bloquer les codes promo pour le plan Basic
    if (selectedPlan.name === 'basic') {
        showPromoMessage('Promo codes are not applicable to the free Basic plan', 'error');
        console.warn('❌ Code promo non applicable au plan Basic gratuit');
        return;
    }
    
    console.log('🎁 Tentative d\'application du code:', code);
    
    const promo = PROMO_CODES[code];
    
    if (!promo) {
        showPromoMessage('Invalid promo code', 'error');
        console.warn('❌ Code invalide:', code);
        return;
    }
    
    // Vérifier si le code est applicable au plan sélectionné
    if (!promo.plans.includes(selectedPlan.name)) {
        showPromoMessage(`This code is only valid for ${promo.plans.join(' or ')} plan`, 'error');
        console.warn('❌ Code non applicable à ce plan');
        return;
    }
    
    appliedPromo = {
        code: code,
        ...promo
    };
    
    console.log('✅ Code promo appliqué:', appliedPromo);
    
    document.getElementById('promoCodeName').textContent = code;
    promoApplied.classList.remove('hidden');
    promoInput.value = '';
    promoInput.disabled = true;
    applyPromoBtn.disabled = true;
    
    showPromoMessage(`${promo.description}`, 'success');
    updatePriceSummary();
});

removePromoBtn.addEventListener('click', function() {
    removePromoCode();
});

function removePromoCode() {
    console.log('🗑 Suppression du code promo');
    
    appliedPromo = null;
    promoApplied.classList.add('hidden');
    promoInput.disabled = false;
    applyPromoBtn.disabled = false;
    promoMessage.classList.add('hidden');
    
    updatePriceSummary();
}

function showPromoMessage(message, type) {
    promoMessage.innerHTML = `
        <i></i>
        ${message}
    `;
    promoMessage.className = `promo-message ${type}`;
    promoMessage.classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════════
// ✅ MISE À JOUR DU RÉCAPITULATIF DES PRIX
// ═══════════════════════════════════════════════════════════════

function updatePriceSummary() {
    // ✅ Gestion des 3 plans
    let planName;
    
    switch(selectedPlan.name) {
        case 'basic':
            planName = 'AlphaVault Basic';
            break;
        case 'pro':
            planName = 'AlphaVault Pro';
            break;
        case 'platinum':
            planName = 'AlphaVault Platinum';
            break;
        default:
            planName = 'AlphaVault Basic';
    }
    
    const originalPrice = selectedPlan.price;
    
    document.getElementById('summaryPlanName').textContent = planName;
    document.getElementById('summaryOriginalPrice').textContent = originalPrice === 0 ? 'FREE' : `$${originalPrice.toFixed(2)}`;
    
    let buttonText = '';
    
    // ═══════════════════════════════════════════════════════════════
    // ✅ CAS SPÉCIAL : PLAN BASIC (GRATUIT)
    // ═══════════════════════════════════════════════════════════════
    if (selectedPlan.name === 'basic') {
        document.getElementById('discountRow').classList.add('hidden');
        document.getElementById('originalPriceStriked').classList.add('hidden');
        document.getElementById('summaryFinalPrice').textContent = 'FREE';
        document.getElementById('freeAccessBadge').classList.remove('hidden');
        document.getElementById('trialAccessBadge').classList.add('hidden');
        
        // ✅ MASQUER LA SECTION CARTE BANCAIRE
        document.getElementById('cardDetailsGroup').classList.add('hidden');
        
        // ✅ Masquer la section code promo pour le plan Basic
        const promoSection = document.querySelector('.promo-section');
        if (promoSection) {
            promoSection.style.display = 'none';
        }
        
        // Texte du bouton
        if (userExistingPlan.hasPlan && userExistingPlan.currentPlan !== 'basic') {
            buttonText = 'Downgrade to Basic (Free)';
        } else if (userExistingPlan.currentPlan === 'basic') {
            buttonText = 'Already on Basic Plan';
        } else {
            buttonText = 'Activate Free Basic Plan';
        }
        
        document.getElementById('submitButtonText').textContent = buttonText;
        return;
    }
    
    // ═══════════════════════════════════════════════════════════════
    // PLANS PAYANTS (PRO ET PLATINUM)
    // ═══════════════════════════════════════════════════════════════
    
    // ✅ Afficher la section code promo
    const promoSection = document.querySelector('.promo-section');
    if (promoSection) {
        promoSection.style.display = 'block';
    }
    
    if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
            const discountAmount = (originalPrice * appliedPromo.value) / 100;
            const finalPrice = originalPrice - discountAmount;
            
            document.getElementById('discountPercent').textContent = appliedPromo.value;
            document.getElementById('discountAmount').textContent = `-$${discountAmount.toFixed(2)}`;
            document.getElementById('discountRow').classList.remove('hidden');
            
            document.getElementById('originalPriceStriked').textContent = `$${originalPrice.toFixed(2)}`;
            document.getElementById('originalPriceStriked').classList.remove('hidden');
            
            document.getElementById('summaryFinalPrice').textContent = `$${finalPrice.toFixed(2)}`;
            
            document.getElementById('freeAccessBadge').classList.add('hidden');
            document.getElementById('trialAccessBadge').classList.add('hidden');
            
            if (userExistingPlan.hasPlan) {
                buttonText = 'Change Plan';
            } else {
                buttonText = 'Start 14-Day Free Trial';
            }
            
            document.getElementById('cardDetailsGroup').classList.remove('hidden');
            
        } else if (appliedPromo.type === 'free') {
            document.getElementById('discountRow').classList.add('hidden');
            document.getElementById('originalPriceStriked').textContent = `$${originalPrice.toFixed(2)}`;
            document.getElementById('originalPriceStriked').classList.remove('hidden');
            
            document.getElementById('summaryFinalPrice').textContent = 'FREE';
            
            document.getElementById('freeAccessBadge').classList.remove('hidden');
            document.getElementById('trialAccessBadge').classList.add('hidden');
            
            buttonText = 'Activate Free Lifetime Access';
            
            // ✅ Masquer les détails de carte pour accès gratuit
            document.getElementById('cardDetailsGroup').classList.add('hidden');
            
        } else if (appliedPromo.type === 'trial') {
            document.getElementById('discountRow').classList.add('hidden');
            document.getElementById('originalPriceStriked').textContent = `$${originalPrice.toFixed(2)}`;
            document.getElementById('originalPriceStriked').classList.remove('hidden');
            
            document.getElementById('summaryFinalPrice').textContent = 'FREE';
            
            document.getElementById('freeAccessBadge').classList.add('hidden');
            document.getElementById('trialAccessBadge').classList.remove('hidden');
            
            const trialDays = appliedPromo.duration || 14;
            document.getElementById('trialDays').textContent = trialDays;
            
            buttonText = `Start ${trialDays}-Day Free Trial`;
            
            // ✅ Masquer les détails de carte pour trial sans CB
            document.getElementById('cardDetailsGroup').classList.add('hidden');
        }
    } else {
        // Aucun code promo appliqué
        document.getElementById('discountRow').classList.add('hidden');
        document.getElementById('originalPriceStriked').classList.add('hidden');
        document.getElementById('summaryFinalPrice').textContent = `$${originalPrice.toFixed(2)}`;
        document.getElementById('freeAccessBadge').classList.add('hidden');
        document.getElementById('trialAccessBadge').classList.add('hidden');
        
        if (userExistingPlan.hasPlan) {
            buttonText = 'Change Plan';
        } else {
            buttonText = 'Start 14-Day Free Trial';
        }
        
        // ✅ Afficher les détails de carte
        document.getElementById('cardDetailsGroup').classList.remove('hidden');
    }
    
    document.getElementById('submitButtonText').textContent = buttonText;
}

// Mise à jour initiale du récapitulatif
updatePriceSummary();

// ═══════════════════════════════════════════════════════════════
// ✅ SOUMISSION DU FORMULAIRE
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
    submitButton.style.transform = 'none';
    submitButton.style.animation = 'none';
    
    try {
        console.log('1⃣ Vérification de l\'authentification...');
        
        const user = firebase.auth().currentUser;
        
        if (!user) {
            throw new Error('Vous devez être connecté pour procéder au paiement');
        }
        
        console.log('   ✅ Utilisateur authentifié:', user.email);
        console.log('   📧 User ID:', user.uid);
        
        console.log('2⃣ Récupération des données...');
        
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        
        console.log('   ✅ Email:', email);
        console.log('   ✅ Nom:', name);
        console.log('   ✅ Plan sélectionné:', selectedPlan.name);
        console.log('   ✅ Prix original:', selectedPlan.price === 0 ? 'FREE' : `$${selectedPlan.price}/mois`);
        console.log('   📊 Plan existant:', userExistingPlan.hasPlan ? userExistingPlan.currentPlan : 'Aucun');
        
        // ═══════════════════════════════════════════════════════════════
        // ✅ CAS SPÉCIAL : PLAN BASIC GRATUIT
        // ═══════════════════════════════════════════════════════════════
        if (selectedPlan.name === 'basic') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎉 ACTIVATION DU PLAN BASIC GRATUIT');
            console.log('   👤 User ID:', user.uid);
            console.log('   💎 Plan: Basic (FREE)');
            console.log('   📧 Email:', email);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            // Mettre à jour Firestore directement
            await firebase.firestore().collection('users').doc(user.uid).set({
                plan: 'basic',
                subscriptionStatus: 'active',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('✅ Plan Basic activé dans Firestore');
            
            // Redirection vers la page de succès
            window.location.href = 'success.html?plan=basic&amp;free=true&amp;noconfetti=true';
            return;
        }
        
        // ═══════════════════════════════════════════════════════════════
        // PLANS PAYANTS (PRO ET PLATINUM)
        // ═══════════════════════════════════════════════════════════════
        
        if (appliedPromo) {
            console.log('   🎁 Code promo appliqué:', appliedPromo.code);
            console.log('   🎁 Type:', appliedPromo.type);
            console.log('   🎁 Valeur:', appliedPromo.type === 'percentage' ? `${appliedPromo.value}%` : appliedPromo.type === 'trial' ? `${appliedPromo.duration} jours` : 'FREE');
        }
        
        console.log('3⃣ Appel du Cloudflare Worker...');
        console.log('   📡 URL:', `${WORKER_URL}/create-checkout-session`);
        
        const requestBody = {
            plan: selectedPlan.name,
            email: email,
            name: name,
            userId: user.uid,
            promoCode: appliedPromo ? appliedPromo.code : null,
            promoType: appliedPromo ? appliedPromo.type : null,
            promoDuration: appliedPromo?.duration || null
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
        
        // ✅ Gestion de l'accès gratuit (FREE ou TRIAL)
        if (data.free === true) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            if (data.trial === true) {
                console.log('🎉 ACCÈS GRATUIT 14 JOURS ACTIVÉ (SANS CB)');
                console.log('   👤 User ID:', user.uid);
                console.log('   💎 Plan:', selectedPlan.name);
                console.log('   🎁 Code promo:', appliedPromo.code);
                console.log('   ⏱ Durée:', appliedPromo.duration, 'jours');
                console.log('   📅 Expire le:', data.expiresAt || 'N/A');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                
                window.location.href = `success.html?plan=${selectedPlan.name}&amp;trial=true&amp;days=${appliedPromo.duration}&amp;noconfetti=true`;
            } else {
                console.log('🎉 ACCÈS GRATUIT À VIE ACTIVÉ');
                console.log('   👤 Client Stripe ID:', data.customerId || 'N/A');
                console.log('   💎 Plan:', selectedPlan.name);
                console.log('   🎁 Code promo:', appliedPromo.code);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                
                window.location.href = `success.html?plan=${selectedPlan.name}&amp;free=true&amp;noconfetti=true`;
            }
            
            return;
        }
        
        if (!data.sessionId) {
            throw new Error('Session ID manquant dans la réponse');
        }
        
        console.log('   ✅ Session Stripe créée:', data.sessionId);
        console.log('5⃣ Redirection vers Stripe Checkout...');
        
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
        errorDisplay.innerHTML = `<i></i> ${error.message}`;
        
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
        
        await checkExistingPlan(user);
    } else {
        console.warn('⚠ Aucun utilisateur connecté');
    }
});

console.log('✅ Checkout script loaded successfully - Plan Basic GRATUIT + Pro + Platinum');