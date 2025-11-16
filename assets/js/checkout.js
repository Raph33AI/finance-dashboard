/* ═══════════════════════════════════════════════════════════════
   CHECKOUT.JS - VERSION CLOUDFLARE WORKERS
   AlphaVault AI - Gestion des paiements Stripe
   ═══════════════════════════════════════════════════════════════ */

// ⚙️ CONFIGURATION
const STRIPE_PUBLIC_KEY = 'pk_test_YOUR_STRIPE_PUBLIC_KEY'; // ⚠️ À REMPLACER
const WORKER_URL = 'https://alphavault-stripe.YOUR_SUBDOMAIN.workers.dev'; // ⚠️ À REMPLACER

console.log('🔧 Checkout configuration:');
console.log('   Stripe Public Key:', STRIPE_PUBLIC_KEY.substring(0, 20) + '...');
console.log('   Worker URL:', WORKER_URL);

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

// Créer l'élément carte
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

let selectedPlan = {
    name: 'pro',
    price: 15
};

const planOptions = document.querySelectorAll('.plan-option');

planOptions.forEach(option => {
    option.addEventListener('click', function() {
        console.log('📦 Plan clicked:', this.dataset.plan);
        
        // Retirer la sélection précédente
        planOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Ajouter la sélection au plan cliqué
        this.classList.add('selected');
        
        // Mettre à jour le plan sélectionné
        selectedPlan = {
            name: this.dataset.plan,
            price: parseFloat(this.dataset.price)
        };
        
        console.log('✅ Plan sélectionné:', selectedPlan);
    });
});

// Sélectionner Pro par défaut
const defaultPlan = document.querySelector('[data-plan="pro"]');
if (defaultPlan) {
    defaultPlan.classList.add('selected');
    console.log('✅ Default plan selected: Pro');
}

// ═══════════════════════════════════════════════════════════════
// DÉTECTER LE PLAN DEPUIS L'URL (si redirigé depuis index.html)
// ═══════════════════════════════════════════════════════════════

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
// SOUMISSION DU FORMULAIRE
// ═══════════════════════════════════════════════════════════════

const form = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-button');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 DÉBUT DU PROCESSUS DE PAIEMENT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Désactiver le bouton et afficher le spinner
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    
    try {
        // 1️⃣ Vérifier que l'utilisateur est connecté
        console.log('1️⃣ Vérification de l\'authentification...');
        
        const user = firebase.auth().currentUser;
        
        if (!user) {
            throw new Error('Vous devez être connecté pour procéder au paiement. Veuillez vous connecter d\'abord.');
        }
        
        console.log('   ✅ Utilisateur authentifié:', user.email);
        console.log('   📧 User ID:', user.uid);
        
        // 2️⃣ Récupérer les données du formulaire
        console.log('2️⃣ Récupération des données du formulaire...');
        
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        
        console.log('   ✅ Email:', email);
        console.log('   ✅ Nom:', name);
        console.log('   ✅ Plan sélectionné:', selectedPlan.name);
        console.log('   ✅ Prix:', `$${selectedPlan.price}/mois`);
        
        // 3️⃣ Appeler le Cloudflare Worker
        console.log('3️⃣ Appel du Cloudflare Worker...');
        console.log('   📡 URL:', `${WORKER_URL}/create-checkout-session`);
        
        const requestBody = {
            plan: selectedPlan.name,
            email: email,
            userId: user.uid
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
        
        // 4️⃣ Rediriger vers Stripe Checkout
        console.log('4️⃣ Redirection vers Stripe Checkout...');
        
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
        
        // Afficher l'erreur à l'utilisateur
        const errorDisplay = document.getElementById('card-errors');
        errorDisplay.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
        
        // Réactiver le bouton
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
        console.warn('💡 L\'utilisateur devra se connecter avant de payer');
    }
});

console.log('✅ Checkout script loaded successfully');