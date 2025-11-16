/* ═══════════════════════════════════════════════════════════════
   CHECKOUT.JS - VERSION CLOUDFLARE WORKERS + CODES PROMO
   AlphaVault AI
   ═══════════════════════════════════════════════════════════════ */

// ⚙️ CONFIGURATION
const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_STRIPE_PUBLIC_KEY'; // ⚠️ À REMPLACER
const WORKER_URL = 'https://alphavault-stripe.YOUR_SUBDOMAIN.workers.dev'; // ⚠️ À REMPLACER

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

// État de l'application
let selectedPlan = {
    name: 'pro',
    price: 15
};

let appliedPromo = null;

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
            
            // Mettre à jour le bouton de soumission
            document.getElementById('submitButtonText').textContent = 'Start 14-Day Free Trial';
            
            // Afficher le groupe de carte de crédit
            document.getElementById('cardDetailsGroup').classList.remove('hidden');
            
        } else if (appliedPromo.type === 'free') {
            // Accès gratuit
            document.getElementById('discountRow').classList.add('hidden');
            document.getElementById('originalPriceStriked').textContent = `$${originalPrice.toFixed(2)}`;
            document.getElementById('originalPriceStriked').classList.remove('hidden');
            
            document.getElementById('summaryFinalPrice').textContent = 'FREE';
            
            document.getElementById('freeAccessBadge').classList.remove('hidden');
            
            // Mettre à jour le bouton de soumission
            document.getElementById('submitButtonText').textContent = 'Activate Free Lifetime Access';
            
            // Cacher le groupe de carte de crédit
            document.getElementById('cardDetailsGroup').classList.add('hidden');
        }
    } else {
        // Pas de code promo
        document.getElementById('discountRow').classList.add('hidden');
        document.getElementById('originalPriceStriked').classList.add('hidden');
        document.getElementById('summaryFinalPrice').textContent = `$${originalPrice.toFixed(2)}`;
        document.getElementById('freeAccessBadge').classList.add('hidden');
        
        // Réinitialiser le bouton
        document.getElementById('submitButtonText').textContent = 'Start 14-Day Free Trial';
        
        // Afficher le groupe de carte de crédit
        document.getElementById('cardDetailsGroup').classList.remove('hidden');
    }
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
        
        if (appliedPromo) {
            console.log('   🎁 Code promo appliqué:', appliedPromo.code);
            console.log('   🎁 Type:', appliedPromo.type);
            console.log('   🎁 Valeur:', appliedPromo.type === 'percentage' ? `${appliedPromo.value}%` : 'FREE');
        }
        
        // 3️⃣ CAS SPÉCIAL : Accès gratuit (pas de paiement Stripe)
        if (appliedPromo && appliedPromo.type === 'free') {
            console.log('3️⃣ Code promo FREE détecté - Activation directe...');
            
            // Mettre à jour directement Firebase
            await firebase.firestore().collection('users').doc(user.uid).set({
                plan: selectedPlan.name,
                subscriptionStatus: 'active_free',
                promoCode: appliedPromo.code,
                subscriptionStart: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                email: email,
                name: name
            }, { merge: true });
            
            console.log('✅ Accès gratuit activé dans Firebase!');
            
            // Redirection vers la page de succès
            window.location.href = `success.html?plan=${selectedPlan.name}&free=true`;
            return;
        }
        
        // 4️⃣ Appeler le Cloudflare Worker pour créer une session Stripe
        console.log('4️⃣ Appel du Cloudflare Worker...');
        console.log('   📡 URL:', `${WORKER_URL}/create-checkout-session`);
        
        const requestBody = {
            plan: selectedPlan.name,
            email: email,
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
        
        if (!data.sessionId) {
            throw new Error('Session ID manquant dans la réponse');
        }
        
        console.log('   ✅ Session Stripe créée:', data.sessionId);
        
        // 5️⃣ Rediriger vers Stripe Checkout
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
// PRÉ-REMPLIR L'EMAIL SI CONNECTÉ
// ═══════════════════════════════════════════════════════════════

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log('✅ Utilisateur Firebase détecté:', user.email);
        document.getElementById('email').value = user.email;
    } else {
        console.warn('⚠️ Aucun utilisateur connecté');
    }
});

console.log('✅ Checkout script loaded successfully');