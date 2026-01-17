// /* ═══════════════════════════════════════════════════════════════
//    CHECKOUT.JS - VERSION CLOUDFLARE WORKERS + APPLE PAY/GOOGLE PAY
//    AlphaVault AI v4.0 - CODES PROMO DYNAMIQUES
//    ✅ Support Apple Pay / Google Pay (Mobile + Desktop)
//    ✅ Codes promo chargés dynamiquement depuis Stripe
//    ✅ Support codes promo TRIAL (14 jours gratuits sans CB)
//    ✅ Support des 3 plans : BASIC (gratuit) + PRO + PLATINUM
//    ✅ Plan Basic : 100% gratuit sans carte bancaire
//    ═══════════════════════════════════════════════════════════════ */

// // ⚙ CONFIGURATION
// const STRIPE_PUBLIC_KEY = 'pk_live_51SU1qnDxR6DPBfOfX6yJYr9Qzh40aNGrn1TSZxI5q0Q0m9hsgXmMQFq2TErynzuUKOivH4T3DJ1FjKy683WsqQAR00tAMRJGtk';
// const WORKER_URL = 'https://finance-hub-api.raphnardone.workers.dev';

// console.log('🔧 Checkout configuration:');
// console.log('   Stripe Public Key:', STRIPE_PUBLIC_KEY.substring(0, 20) + '...');
// console.log('   Worker URL:', WORKER_URL);

// // ═══════════════════════════════════════════════════════════════
// // 🎁 CODES PROMO DYNAMIQUES (chargés depuis Stripe)
// // ═══════════════════════════════════════════════════════════════

// let PROMO_CODES = {};

// // Charger les codes promo actifs depuis le Worker
// // Charger les codes promo actifs depuis le Worker
// async function loadPromoCodes() {
//     try {
//         const response = await fetch(`${WORKER_URL}/active-promo-codes`);
        
//         if (!response.ok) {
//             throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//         }
        
//         const data = await response.json();
        
//         if (data.success) {
//             PROMO_CODES = data.promoCodes || {};
//             console.log(`✅ ${data.total} codes promo actifs chargés`);
//         } else {
//             console.warn('⚠ Erreur lors du chargement des codes promo');
//             PROMO_CODES = getFallbackPromoCodes();
//         }
//     } catch (error) {
//         console.error('❌ Erreur réseau lors du chargement des codes promo');
//         PROMO_CODES = getFallbackPromoCodes();
//     }
    
//     // ✅ AJOUTER LES CODES SPÉCIAUX (TRIAL/FREE) EN DUR
//     // Ces codes ne sont pas des coupons Stripe standards
//     PROMO_CODES['FREE14DAYS'] = {
//         type: 'trial',
//         duration: 14,
//         plans: ['pro', 'platinum'],
//         description: '14-day free trial - No credit card required'
//     };
    
//     PROMO_CODES['TRIAL14'] = {
//         type: 'trial',
//         duration: 14,
//         plans: ['pro', 'platinum'],
//         description: '14-day free access - No payment info needed'
//     };
    
//     PROMO_CODES['TRYITFREE'] = {
//         type: 'trial',
//         duration: 14,
//         plans: ['pro', 'platinum'],
//         description: 'Try AlphaVault free for 14 days'
//     };
    
//     console.log(`✅ Total: ${Object.keys(PROMO_CODES).length} codes promo disponibles`);
// }

// // Codes promo de secours (en cas d'erreur API)
// function getFallbackPromoCodes() {
//     console.log('🔄 Utilisation des codes promo de secours');
    
//     return {
//         'LAUNCH15': {
//             type: 'percentage',
//             value: 15,
//             description: '15% off for early adopters',
//             plans: ['pro', 'platinum']
//         },
//         'WELCOME15': {
//             type: 'percentage',
//             value: 15,
//             description: '15% welcome discount',
//             plans: ['pro', 'platinum']
//         }
//     };
// }

// // ✅ CHARGER LES CODES PROMO AU DÉMARRAGE
// loadPromoCodes();

// // ✅ État de l'application
// let selectedPlan = {
//     name: 'basic',
//     price: 0
// };

// let appliedPromo = null;

// let userExistingPlan = {
//     hasPlan: false,
//     currentPlan: 'basic',
//     subscriptionStatus: 'inactive'
// };

// // Initialiser Stripe
// const stripe = Stripe(STRIPE_PUBLIC_KEY);
// const elements = stripe.elements();

// // ═══════════════════════════════════════════════════════════════
// // 📱 APPLE PAY / GOOGLE PAY - PAYMENT REQUEST (OPTIMISÉ MOBILE)
// // ═══════════════════════════════════════════════════════════════

// let paymentRequest = null;
// let prButton = null;

// function createPaymentRequest() {
//     console.log('📱 Création du Payment Request...');
    
//     let initialAmount = calculateFinalAmount();
    
//     console.log('   💰 Montant initial:', initialAmount, 'centimes');
    
//     paymentRequest = stripe.paymentRequest({
//         country: 'US',
//         currency: 'usd',
//         total: {
//             label: `AlphaVault AI - ${selectedPlan.name.charAt(0).toUpperCase() + selectedPlan.name.slice(1)}`,
//             amount: initialAmount,
//         },
//         requestPayerName: true,
//         requestPayerEmail: true,
//         disableWallets: ['link', 'browserCard'],
//     });

//     const isMobile = window.innerWidth <= 768;
//     const isSmallMobile = window.innerWidth <= 480;
//     const buttonHeight = isMobile ? '48px' : '56px';
    
//     console.log(`📱 Device: ${isMobile ? 'Mobile' : 'Desktop'} - Button height: ${buttonHeight}`);

//     prButton = elements.create('paymentRequestButton', {
//         paymentRequest: paymentRequest,
//         style: {
//             paymentRequestButton: {
//                 type: 'default',
//                 theme: 'dark',
//                 height: buttonHeight,
//             },
//         },
//     });

//     paymentRequest.canMakePayment().then(function(result) {
//         console.log('📱 Résultat canMakePayment:', result);
        
//         if (result) {
//             const isAppleOrGooglePay = result.applePay || result.googlePay;
            
//             console.log('   Apple Pay:', result.applePay ? '✅' : '❌');
//             console.log('   Google Pay:', result.googlePay ? '✅' : '❌');
//             console.log('   Link:', result.link ? '✅ (désactivé)' : '❌');
            
//             if (isAppleOrGooglePay) {
//                 console.log('✅ Apple Pay / Google Pay disponible - Montage du bouton');
                
//                 prButton.mount('#payment-request-button');
                
//                 const container = document.getElementById('payment-request-container');
//                 if (container) {
//                     if (isSmallMobile) {
//                         container.style.maxWidth = '240px';
//                         container.style.margin = '0 auto';
//                         console.log('📱 Largeur appliquée (petit mobile): 240px');
//                     } else if (isMobile) {
//                         container.style.maxWidth = '280px';
//                         container.style.margin = '0 auto';
//                         console.log('📱 Largeur appliquée (mobile): 280px');
//                     } else {
//                         container.style.maxWidth = '100%';
//                         container.style.margin = '0';
//                         console.log('💻 Largeur appliquée (desktop): 100%');
//                     }
//                 }
                
//                 updatePaymentRequestVisibility();
//             } else {
//                 console.log('ℹ Seulement Link disponible - Bouton masqué');
//                 hidePaymentRequest();
//             }
//         } else {
//             console.log('ℹ Apple Pay / Google Pay non disponible sur cet appareil');
//             hidePaymentRequest();
//         }
//     }).catch(function(error) {
//         console.error('❌ Erreur canMakePayment:', error);
//         hidePaymentRequest();
//     });

//     paymentRequest.on('paymentmethod', async (ev) => {
//         console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//         console.log('🍎 PAIEMENT VIA APPLE PAY / GOOGLE PAY');
//         console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
//         try {
//             const user = firebase.auth().currentUser;
            
//             if (!user) {
//                 ev.complete('fail');
//                 throw new Error('Vous devez être connecté');
//             }
            
//             console.log('   ✅ Utilisateur:', user.email);
//             console.log('   💳 Payment Method:', ev.paymentMethod.id);
//             console.log('   📧 Email:', ev.payerEmail);
//             console.log('   👤 Nom:', ev.payerName);
//             console.log('   💎 Plan:', selectedPlan.name);
            
//             if (selectedPlan.name === 'basic') {
//                 await firebase.firestore().collection('users').doc(user.uid).set({
//                     plan: 'basic',
//                     subscriptionStatus: 'active',
//                     updatedAt: firebase.firestore.FieldValue.serverTimestamp()
//                 }, { merge: true });
                
//                 ev.complete('success');
//                 window.location.href = 'success.html?plan=basic&free=true&noconfetti=true';
//                 return;
//             }
            
//             const requestBody = {
//                 plan: selectedPlan.name,
//                 email: ev.payerEmail,
//                 name: ev.payerName,
//                 userId: user.uid,
//                 paymentMethodId: ev.paymentMethod.id,
//                 promoCode: appliedPromo ? appliedPromo.code : null,
//                 promoType: appliedPromo ? appliedPromo.type : null,
//                 promoDuration: appliedPromo?.duration || null,
//                 appleGooglePay: true
//             };
            
//             console.log('   📡 Appel Worker:', WORKER_URL);
            
//             const response = await fetch(`${WORKER_URL}/create-checkout-session`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(requestBody),
//             });
            
//             if (!response.ok) {
//                 throw new Error(`Erreur serveur (${response.status})`);
//             }
            
//             const data = await response.json();
            
//             if (data.error) {
//                 throw new Error(data.error);
//             }
            
//             ev.complete('success');
            
//             console.log('✅ Paiement réussi via Apple Pay / Google Pay');
            
//             if (data.free === true) {
//                 if (data.trial === true) {
//                     window.location.href = `success.html?plan=${selectedPlan.name}&trial=true&days=${appliedPromo.duration}&noconfetti=true`;
//                 } else {
//                     window.location.href = `success.html?plan=${selectedPlan.name}&free=true&noconfetti=true`;
//                 }
//             } else {
//                 window.location.href = `success.html?plan=${selectedPlan.name}`;
//             }
            
//         } catch (error) {
//             console.error('❌ Erreur Apple Pay:', error);
//             ev.complete('fail');
            
//             const errorDisplay = document.getElementById('card-errors');
//             if (errorDisplay) {
//                 errorDisplay.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
//             }
//         }
//     });
// }

// function calculateFinalAmount() {
//     let finalPrice = selectedPlan.price;
    
//     if (appliedPromo && appliedPromo.type === 'percentage') {
//         const discountAmount = (finalPrice * appliedPromo.value) / 100;
//         finalPrice = finalPrice - discountAmount;
//     }
    
//     return Math.round(finalPrice * 100);
// }

// function updatePaymentRequestAmount() {
//     if (!paymentRequest) return;
    
//     const amountInCents = calculateFinalAmount();
    
//     console.log('📱 Mise à jour montant Payment Request:', amountInCents, 'centimes');
    
//     paymentRequest.update({
//         total: {
//             label: `AlphaVault AI - ${selectedPlan.name.charAt(0).toUpperCase() + selectedPlan.name.slice(1)}`,
//             amount: amountInCents,
//         },
//     });
// }

// function updatePaymentRequestVisibility() {
//     const container = document.getElementById('payment-request-container');
//     const divider = document.getElementById('payment-divider');
    
//     if (!container || !divider) return;
    
//     const shouldHide = selectedPlan.name === 'basic' || 
//                        (appliedPromo && (appliedPromo.type === 'free' || appliedPromo.type === 'trial'));
    
//     if (shouldHide) {
//         container.style.display = 'none';
//         divider.style.display = 'none';
//         console.log('📱 Payment Request masqué (plan gratuit ou trial)');
//     } else {
//         container.style.display = 'block';
//         divider.style.display = 'flex';
//         console.log('📱 Payment Request affiché');
//     }
// }

// function hidePaymentRequest() {
//     const container = document.getElementById('payment-request-container');
//     const divider = document.getElementById('payment-divider');
    
//     if (container) container.style.display = 'none';
//     if (divider) divider.style.display = 'none';
// }

// // ═══════════════════════════════════════════════════════════════
// // STYLE DES ÉLÉMENTS STRIPE
// // ═══════════════════════════════════════════════════════════════

// const cardStyle = {
//     base: {
//         color: '#1e293b',
//         fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
//         fontSmoothing: 'antialiased',
//         fontSize: '16px',
//         fontWeight: '500',
//         '::placeholder': {
//             color: '#94a3b8',
//         },
//         iconColor: '#3B82F6',
//     },
//     invalid: {
//         color: '#ef4444',
//         iconColor: '#ef4444',
//     },
// };

// const cardElement = elements.create('card', { style: cardStyle });
// cardElement.mount('#card-element');

// console.log('✅ Stripe card element mounted');

// // ═══════════════════════════════════════════════════════════════
// // GESTION DES ERREURS DE CARTE
// // ═══════════════════════════════════════════════════════════════

// cardElement.on('change', function(event) {
//     const displayError = document.getElementById('card-errors');
//     if (event.error) {
//         displayError.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${event.error.message}`;
//         console.warn('⚠ Card validation error:', event.error.message);
//     } else {
//         displayError.textContent = '';
//     }
// });

// // ═══════════════════════════════════════════════════════════════
// // ✅ VÉRIFIER LE PLAN EXISTANT DE L'UTILISATEUR
// // ═══════════════════════════════════════════════════════════════

// async function checkExistingPlan(user) {
//     try {
//         console.log('🔍 Checking existing plan for user:', user.uid);
        
//         const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        
//         if (userDoc.exists) {
//             const userData = userDoc.data();
//             const plan = userData?.plan || 'basic';
//             const status = userData?.subscriptionStatus || 'inactive';
            
//             console.log('📊 Current plan:', plan);
//             console.log('📊 Subscription status:', status);
            
//             userExistingPlan = {
//                 hasPlan: true,
//                 currentPlan: plan,
//                 subscriptionStatus: status
//             };
            
//             displayCurrentPlanBadge(plan);
//             updateHeaderForExistingUser(true);
//             updatePriceSummary();
            
//             console.log('✅ Existing user detected - showing "Change Plan"');
//             console.log('   Current plan:', plan);
//             console.log('   Status:', status);
//         } else {
//             console.log('ℹ New user - showing "Start Your Premium Journey"');
            
//             userExistingPlan = {
//                 hasPlan: false,
//                 currentPlan: 'basic',
//                 subscriptionStatus: 'inactive'
//             };
//         }
//     } catch (error) {
//         console.error('❌ Error checking existing plan:', error);
//         userExistingPlan = {
//             hasPlan: false,
//             currentPlan: 'basic',
//             subscriptionStatus: 'inactive'
//         };
//     }
// }

// function displayCurrentPlanBadge(plan) {
//     let planName, planColor;
    
//     switch(plan) {
//         case 'basic':
//             planName = 'Basic';
//             planColor = '#06b6d4';
//             break;
//         case 'pro':
//             planName = 'Pro';
//             planColor = '#3B82F6';
//             break;
//         case 'platinum':
//             planName = 'Platinum';
//             planColor = '#8B5CF6';
//             break;
//         default:
//             planName = 'Basic';
//             planColor = '#06b6d4';
//     }
    
//     const badge = document.createElement('div');
//     badge.id = 'current-plan-badge';
//     badge.style.cssText = `
//         background: linear-gradient(135deg, ${planColor}, rgba(59, 130, 246, 0.8));
//         color: white;
//         padding: 12px 24px;
//         border-radius: 20px;
//         font-size: 0.95rem;
//         font-weight: 700;
//         text-align: center;
//         margin-bottom: 20px;
//         box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         gap: 10px;
//     `;
//     badge.innerHTML = `
//         <i class="fas fa-star"></i>
//         Current Plan: ${planName}
//     `;
    
//     const header = document.querySelector('.checkout-header');
//     const title = header.querySelector('.checkout-title');
//     header.insertBefore(badge, title);
// }

// function updateHeaderForExistingUser(hasActivePlan) {
//     const title = document.querySelector('.checkout-title');
//     const subtitle = document.querySelector('.checkout-subtitle');
    
//     if (hasActivePlan) {
//         title.textContent = 'Change Your Plan';
//         subtitle.textContent = 'Upgrade or downgrade anytime • Cancel anytime • Secure payment';
//     } else {
//         title.textContent = 'Start Your Premium Journey';
//         subtitle.textContent = 'Free Basic plan • Upgrade anytime • Secure payment';
//     }
// }

// // ═══════════════════════════════════════════════════════════════
// // SÉLECTION DU PLAN
// // ═══════════════════════════════════════════════════════════════

// const planOptions = document.querySelectorAll('.plan-option');

// planOptions.forEach(option => {
//     option.addEventListener('click', function() {
//         console.log('📦 Plan clicked:', this.dataset.plan);
        
//         planOptions.forEach(opt => opt.classList.remove('selected'));
//         this.classList.add('selected');
        
//         const planName = this.dataset.plan;
//         const planPrice = planName === 'basic' ? 0 : parseFloat(this.dataset.price);
        
//         selectedPlan = {
//             name: planName,
//             price: planPrice
//         };
        
//         console.log('✅ Plan sélectionné:', selectedPlan);
        
//         if (planName === 'basic' && appliedPromo) {
//             console.log('ℹ Plan Basic sélectionné - Retrait du code promo');
//             removePromoCode();
//         }
        
//         updatePriceSummary();
//         updatePaymentRequestAmount();
//         updatePaymentRequestVisibility();
//     });
// });

// const defaultPlan = document.querySelector('[data-plan="basic"]');
// if (defaultPlan) {
//     defaultPlan.classList.add('selected');
//     console.log('✅ Default plan selected: Basic (Free)');
// }

// const urlParams = new URLSearchParams(window.location.search);
// const urlPlan = urlParams.get('plan');

// if (urlPlan && ['basic', 'pro', 'platinum'].includes(urlPlan)) {
//     console.log('🔗 Plan détecté dans URL:', urlPlan);
    
//     const targetPlan = document.querySelector(`[data-plan="${urlPlan}"]`);
//     if (targetPlan) {
//         planOptions.forEach(opt => opt.classList.remove('selected'));
//         targetPlan.classList.add('selected');
        
//         const planPrice = urlPlan === 'basic' ? 0 : parseFloat(targetPlan.dataset.price);
        
//         selectedPlan = {
//             name: urlPlan,
//             price: planPrice
//         };
        
//         console.log('✅ Plan auto-sélectionné depuis URL:', selectedPlan);
//     }
// }

// // ═══════════════════════════════════════════════════════════════
// // 🎁 GESTION DES CODES PROMO (DYNAMIQUES)
// // ═══════════════════════════════════════════════════════════════

// const promoInput = document.getElementById('promoCode');
// const applyPromoBtn = document.getElementById('applyPromoBtn');
// const promoMessage = document.getElementById('promoMessage');
// const promoApplied = document.getElementById('promoApplied');
// const removePromoBtn = document.getElementById('removePromoBtn');

// if (applyPromoBtn) {
//     applyPromoBtn.addEventListener('click', function() {
//         const code = promoInput.value.trim().toUpperCase();
        
//         if (!code) {
//             showPromoMessage('Please enter a promo code', 'error');
//             return;
//         }
        
//         if (selectedPlan.name === 'basic') {
//             showPromoMessage('Promo codes are not applicable to the free Basic plan', 'error');
//             console.warn('❌ Code promo non applicable au plan Basic gratuit');
//             return;
//         }
        
//         console.log('🎁 Tentative d\'application du code:', code);
        
//         const promo = PROMO_CODES[code];
        
//         if (!promo) {
//             showPromoMessage('Invalid promo code', 'error');
//             console.warn('❌ Code invalide:', code);
//             return;
//         }
        
//         if (!promo.plans.includes(selectedPlan.name)) {
//             showPromoMessage(`This code is only valid for ${promo.plans.join(' or ')} plan`, 'error');
//             console.warn('❌ Code non applicable à ce plan');
//             return;
//         }
        
//         appliedPromo = {
//             code: code,
//             ...promo
//         };
        
//         console.log('✅ Code promo appliqué avec succès');
        
//         document.getElementById('promoCodeName').textContent = code;
//         promoApplied.classList.remove('hidden');
//         promoInput.value = '';
//         promoInput.disabled = true;
//         applyPromoBtn.disabled = true;
        
//         showPromoMessage(`${promo.description}`, 'success');
//         updatePriceSummary();
//         updatePaymentRequestAmount();
//         updatePaymentRequestVisibility();
//     });
// }

// if (removePromoBtn) {
//     removePromoBtn.addEventListener('click', function() {
//         removePromoCode();
//     });
// }

// function removePromoCode() {
//     console.log('🗑 Suppression du code promo');
    
//     appliedPromo = null;
//     promoApplied.classList.add('hidden');
//     promoInput.disabled = false;
//     applyPromoBtn.disabled = false;
//     promoMessage.classList.add('hidden');
    
//     updatePriceSummary();
//     updatePaymentRequestAmount();
//     updatePaymentRequestVisibility();
// }

// function showPromoMessage(message, type) {
//     promoMessage.innerHTML = `
//         <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
//         ${message}
//     `;
//     promoMessage.className = `promo-message ${type}`;
//     promoMessage.classList.remove('hidden');
// }

// // ═══════════════════════════════════════════════════════════════
// // ✅ MISE À JOUR DU RÉCAPITULATIF DES PRIX
// // ═══════════════════════════════════════════════════════════════

// function updatePriceSummary() {
//     let planName;
    
//     switch(selectedPlan.name) {
//         case 'basic':
//             planName = 'AlphaVault Basic';
//             break;
//         case 'pro':
//             planName = 'AlphaVault Pro';
//             break;
//         case 'platinum':
//             planName = 'AlphaVault Platinum';
//             break;
//         default:
//             planName = 'AlphaVault Basic';
//     }
    
//     const originalPrice = selectedPlan.price;
    
//     document.getElementById('summaryPlanName').textContent = planName;
//     document.getElementById('summaryOriginalPrice').textContent = originalPrice === 0 ? 'FREE' : `$${originalPrice.toFixed(2)}`;
    
//     let buttonText = '';
    
//     if (selectedPlan.name === 'basic') {
//         document.getElementById('discountRow').classList.add('hidden');
//         document.getElementById('originalPriceStriked').classList.add('hidden');
//         document.getElementById('summaryFinalPrice').textContent = 'FREE';
//         document.getElementById('freeAccessBadge').classList.remove('hidden');
//         document.getElementById('trialAccessBadge').classList.add('hidden');
        
//         document.getElementById('cardDetailsGroup').classList.add('hidden');
//         hidePaymentRequest();
        
//         const promoSection = document.querySelector('.promo-section');
//         if (promoSection) {
//             promoSection.style.display = 'none';
//         }
        
//         if (userExistingPlan.hasPlan && userExistingPlan.currentPlan !== 'basic') {
//             buttonText = 'Downgrade to Basic (Free)';
//         } else if (userExistingPlan.currentPlan === 'basic') {
//             buttonText = 'Already on Basic Plan';
//         } else {
//             buttonText = 'Activate Free Basic Plan';
//         }
        
//         document.getElementById('submitButtonText').textContent = buttonText;
//         return;
//     }
    
//     const promoSection = document.querySelector('.promo-section');
//     if (promoSection) {
//         promoSection.style.display = 'block';
//     }
    
//     if (appliedPromo) {
//         if (appliedPromo.type === 'percentage') {
//             const discountAmount = (originalPrice * appliedPromo.value) / 100;
//             const finalPrice = originalPrice - discountAmount;
            
//             document.getElementById('discountPercent').textContent = appliedPromo.value;
//             document.getElementById('discountAmount').textContent = `-$${discountAmount.toFixed(2)}`;
//             document.getElementById('discountRow').classList.remove('hidden');
            
//             document.getElementById('originalPriceStriked').textContent = `$${originalPrice.toFixed(2)}`;
//             document.getElementById('originalPriceStriked').classList.remove('hidden');
            
//             document.getElementById('summaryFinalPrice').textContent = `$${finalPrice.toFixed(2)}`;
            
//             document.getElementById('freeAccessBadge').classList.add('hidden');
//             document.getElementById('trialAccessBadge').classList.add('hidden');
            
//             if (userExistingPlan.hasPlan) {
//                 buttonText = 'Change Plan';
//             } else {
//                 buttonText = 'Start 14-Day Free Trial';
//             }
            
//             document.getElementById('cardDetailsGroup').classList.remove('hidden');
//             updatePaymentRequestVisibility();
            
//         } else if (appliedPromo.type === 'free') {
//             document.getElementById('discountRow').classList.add('hidden');
//             document.getElementById('originalPriceStriked').textContent = `$${originalPrice.toFixed(2)}`;
//             document.getElementById('originalPriceStriked').classList.remove('hidden');
            
//             document.getElementById('summaryFinalPrice').textContent = 'FREE';
            
//             document.getElementById('freeAccessBadge').classList.remove('hidden');
//             document.getElementById('trialAccessBadge').classList.add('hidden');
            
//             buttonText = 'Activate Free Lifetime Access';
            
//             document.getElementById('cardDetailsGroup').classList.add('hidden');
//             hidePaymentRequest();
            
//         } else if (appliedPromo.type === 'trial') {
//             document.getElementById('discountRow').classList.add('hidden');
//             document.getElementById('originalPriceStriked').textContent = `$${originalPrice.toFixed(2)}`;
//             document.getElementById('originalPriceStriked').classList.remove('hidden');
            
//             document.getElementById('summaryFinalPrice').textContent = 'FREE';
            
//             document.getElementById('freeAccessBadge').classList.add('hidden');
//             document.getElementById('trialAccessBadge').classList.remove('hidden');
            
//             const trialDays = appliedPromo.duration || 14;
//             document.getElementById('trialDays').textContent = trialDays;
            
//             buttonText = `Start ${trialDays}-Day Free Trial`;
            
//             document.getElementById('cardDetailsGroup').classList.add('hidden');
//             hidePaymentRequest();
//         }
//     } else {
//         document.getElementById('discountRow').classList.add('hidden');
//         document.getElementById('originalPriceStriked').classList.add('hidden');
//         document.getElementById('summaryFinalPrice').textContent = `$${originalPrice.toFixed(2)}`;
//         document.getElementById('freeAccessBadge').classList.add('hidden');
//         document.getElementById('trialAccessBadge').classList.add('hidden');
        
//         if (userExistingPlan.hasPlan) {
//             buttonText = 'Change Plan';
//         } else {
//             buttonText = 'Start 14-Day Free Trial';
//         }
        
//         document.getElementById('cardDetailsGroup').classList.remove('hidden');
//         updatePaymentRequestVisibility();
//     }
    
//     document.getElementById('submitButtonText').textContent = buttonText;
// }

// // ═══════════════════════════════════════════════════════════════
// // ✅ SOUMISSION DU FORMULAIRE
// // ═══════════════════════════════════════════════════════════════

// const form = document.getElementById('payment-form');
// const submitButton = document.getElementById('submit-button');

// if (form) {
//     form.addEventListener('submit', async (event) => {
//         event.preventDefault();
        
//         console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//         console.log('🚀 DÉBUT DU PROCESSUS DE PAIEMENT');
//         console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
//         submitButton.disabled = true;
//         submitButton.classList.add('loading');
//         submitButton.style.transform = 'none';
//         submitButton.style.animation = 'none';
        
//         try {
//             console.log('1⃣ Vérification de l\'authentification...');
            
//             const user = firebase.auth().currentUser;
            
//             if (!user) {
//                 throw new Error('Vous devez être connecté pour procéder au paiement');
//             }
            
//             console.log('   ✅ Utilisateur authentifié:', user.email);
//             console.log('   📧 User ID:', user.uid);
            
//             console.log('2⃣ Récupération des données...');
            
//             const email = document.getElementById('email').value;
//             const name = document.getElementById('name').value;
            
//             console.log('   ✅ Email:', email);
//             console.log('   ✅ Nom:', name);
//             console.log('   ✅ Plan sélectionné:', selectedPlan.name);
//             console.log('   ✅ Prix original:', selectedPlan.price === 0 ? 'FREE' : `$${selectedPlan.price}/mois`);
//             console.log('   📊 Plan existant:', userExistingPlan.hasPlan ? userExistingPlan.currentPlan : 'Aucun');
            
//             if (selectedPlan.name === 'basic') {
//                 console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//                 console.log('🎉 ACTIVATION DU PLAN BASIC GRATUIT');
//                 console.log('   👤 User ID:', user.uid);
//                 console.log('   💎 Plan: Basic (FREE)');
//                 console.log('   📧 Email:', email);
//                 console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                
//                 await firebase.firestore().collection('users').doc(user.uid).set({
//                     plan: 'basic',
//                     subscriptionStatus: 'active',
//                     updatedAt: firebase.firestore.FieldValue.serverTimestamp()
//                 }, { merge: true });
                
//                 console.log('✅ Plan Basic activé dans Firestore');
                
//                 window.location.href = 'success.html?plan=basic&free=true&noconfetti=true';
//                 return;
//             }
            
//             if (appliedPromo) {
//                 console.log('   🎁 Code promo appliqué:', appliedPromo.code);
//                 console.log('   🎁 Type:', appliedPromo.type);
//                 console.log('   🎁 Valeur:', appliedPromo.type === 'percentage' ? `${appliedPromo.value}%` : appliedPromo.type === 'trial' ? `${appliedPromo.duration} jours` : 'FREE');
//             }
            
//             console.log('3⃣ Appel du Cloudflare Worker...');
            
//             const requestBody = {
//                 plan: selectedPlan.name,
//                 email: email,
//                 name: name,
//                 userId: user.uid,
//                 promoCode: appliedPromo ? appliedPromo.code : null,
//                 promoType: appliedPromo ? appliedPromo.type : null,
//                 promoDuration: appliedPromo?.duration || null
//             };
            
//             console.log('   📦 Body:', JSON.stringify(requestBody, null, 2));
            
//             const response = await fetch(`${WORKER_URL}/create-checkout-session`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(requestBody),
//             });
            
//             console.log('   📥 Réponse reçue - Status:', response.status);
            
//             if (!response.ok) {
//                 const errorText = await response.text();
//                 console.error('   ❌ Erreur HTTP:', errorText);
//                 throw new Error(`Erreur serveur (${response.status}): ${errorText}`);
//             }
            
//             const data = await response.json();
//             console.log('   ✅ Données reçues:', data);
            
//             if (data.error) {
//                 throw new Error(data.error);
//             }
            
//             if (data.free === true) {
//                 console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                
//                 if (data.trial === true) {
//                     console.log('🎉 ACCÈS GRATUIT 14 JOURS ACTIVÉ (SANS CB)');
//                     console.log('   👤 User ID:', user.uid);
//                     console.log('   💎 Plan:', selectedPlan.name);
//                     console.log('   🎁 Code promo:', appliedPromo.code);
//                     console.log('   ⏱ Durée:', appliedPromo.duration, 'jours');
//                     console.log('   📅 Expire le:', data.expiresAt || 'N/A');
//                     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    
//                     window.location.href = `success.html?plan=${selectedPlan.name}&trial=true&days=${appliedPromo.duration}&noconfetti=true`;
//                 } else {
//                     console.log('🎉 ACCÈS GRATUIT À VIE ACTIVÉ');
//                     console.log('   👤 Client Stripe ID:', data.customerId || 'N/A');
//                     console.log('   💎 Plan:', selectedPlan.name);
//                     console.log('   🎁 Code promo:', appliedPromo.code);
//                     console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    
//                     window.location.href = `success.html?plan=${selectedPlan.name}&free=true&noconfetti=true`;
//                 }
                
//                 return;
//             }
            
//             if (!data.sessionId) {
//                 throw new Error('Session ID manquant dans la réponse');
//             }
            
//             console.log('   ✅ Session Stripe créée:', data.sessionId);
//             console.log('5⃣ Redirection vers Stripe Checkout...');
            
//             const { error } = await stripe.redirectToCheckout({
//                 sessionId: data.sessionId,
//             });
            
//             if (error) {
//                 throw error;
//             }
            
//             console.log('✅ Redirection réussie vers Stripe!');
            
//         } catch (error) {
//             console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//             console.error('❌ ERREUR DE PAIEMENT');
//             console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
//             console.error('Type:', error.name);
//             console.error('Message:', error.message);
//             console.error('Stack:', error.stack);
            
//             const errorDisplay = document.getElementById('card-errors');
//             if (errorDisplay) {
//                 errorDisplay.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
//             }
            
//             submitButton.disabled = false;
//             submitButton.classList.remove('loading');
//         }
//     });
// }

// // ═══════════════════════════════════════════════════════════════
// // ✅ PRÉ-REMPLIR L'EMAIL ET VÉRIFIER LE PLAN EXISTANT
// // ═══════════════════════════════════════════════════════════════

// firebase.auth().onAuthStateChanged(async (user) => {
//     if (user) {
//         console.log('✅ Utilisateur Firebase détecté:', user.email);
//         document.getElementById('email').value = user.email;
        
//         await checkExistingPlan(user);
        
//         createPaymentRequest();
        
//         updatePriceSummary();
//     } else {
//         console.warn('⚠ Aucun utilisateur connecté');
//     }
// });

// console.log('✅ Checkout script loaded successfully - Dynamic Promo Codes enabled');

/* ═══════════════════════════════════════════════════════════════
   CHECKOUT.JS - VERSION CLOUDFLARE WORKERS + APPLE PAY/GOOGLE PAY
   AlphaVault AI v4.1 - CODES PROMO DYNAMIQUES + DÉTECTION 100%
   ✅ Support Apple Pay / Google Pay (Mobile + Desktop)
   ✅ Codes promo chargés dynamiquement depuis Stripe
   ✅ Support codes promo TRIAL (14 jours gratuits sans CB)
   ✅ Support codes promo 100% (accès gratuit sans CB)
   ✅ Support des 3 plans : BASIC (gratuit) + PRO + PLATINUM
   ✅ Plan Basic : 100% gratuit sans carte bancaire
   ═══════════════════════════════════════════════════════════════ */

// ⚙ CONFIGURATION
const STRIPE_PUBLIC_KEY = 'pk_live_51SU1qnDxR6DPBfOfX6yJYr9Qzh40aNGrn1TSZxI5q0Q0m9hsgXmMQFq2TErynzuUKOivH4T3DJ1FjKy683WsqQAR00tAMRJGtk';
const WORKER_URL = 'https://finance-hub-api.raphnardone.workers.dev';

console.log('🔧 Checkout configuration:');
console.log('   Stripe Public Key:', STRIPE_PUBLIC_KEY.substring(0, 20) + '...');
console.log('   Worker URL:', WORKER_URL);

// ═══════════════════════════════════════════════════════════════
// 🎁 CODES PROMO DYNAMIQUES (chargés depuis Stripe)
// ═══════════════════════════════════════════════════════════════

let PROMO_CODES = {};

// Charger les codes promo actifs depuis le Worker
async function loadPromoCodes() {
    try {
        const response = await fetch(`${WORKER_URL}/active-promo-codes`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            PROMO_CODES = data.promoCodes || {};
            console.log(`✅ ${data.total} codes promo actifs chargés depuis Stripe`);
            
            // ✅ AFFICHER LES CODES À 100%
            const codes100 = Object.entries(PROMO_CODES)
                .filter(([code, promo]) => promo.type === 'percentage' && promo.value >= 100);
            
            if (codes100.length > 0) {
                console.log('🎁 Codes à 100% détectés:', codes100.map(([code]) => code).join(', '));
            }
        } else {
            console.warn('⚠ Erreur lors du chargement des codes promo');
            PROMO_CODES = getFallbackPromoCodes();
        }
    } catch (error) {
        console.error('❌ Erreur réseau lors du chargement des codes promo:', error.message);
        PROMO_CODES = getFallbackPromoCodes();
    }
    
    // ✅ AJOUTER LES CODES SPÉCIAUX (TRIAL/FREE) EN DUR
    // Ces codes ne sont pas des coupons Stripe standards
    PROMO_CODES['FREE14DAYS'] = {
        type: 'trial',
        duration: 14,
        plans: ['pro', 'platinum'],
        description: '14-day free trial - No credit card required'
    };
    
    PROMO_CODES['TRIAL14'] = {
        type: 'trial',
        duration: 14,
        plans: ['pro', 'platinum'],
        description: '14-day free access - No payment info needed'
    };
    
    PROMO_CODES['TRYITFREE'] = {
        type: 'trial',
        duration: 14,
        plans: ['pro', 'platinum'],
        description: 'Try AlphaVault free for 14 days'
    };
    
    console.log(`✅ Total: ${Object.keys(PROMO_CODES).length} codes promo disponibles`);
}

// Codes promo de secours (en cas d'erreur API)
function getFallbackPromoCodes() {
    console.log('🔄 Utilisation des codes promo de secours');
    
    return {
        'LAUNCH15': {
            type: 'percentage',
            value: 15,
            description: '15% off for early adopters',
            plans: ['pro', 'platinum']
        },
        'WELCOME15': {
            type: 'percentage',
            value: 15,
            description: '15% welcome discount',
            plans: ['pro', 'platinum']
        }
    };
}

// ✅ CHARGER LES CODES PROMO AU DÉMARRAGE
loadPromoCodes();

// ✅ État de l'application
let selectedPlan = {
    name: 'basic',
    price: 0
};

let appliedPromo = null;

let userExistingPlan = {
    hasPlan: false,
    currentPlan: 'basic',
    subscriptionStatus: 'inactive'
};

// Initialiser Stripe
const stripe = Stripe(STRIPE_PUBLIC_KEY);
const elements = stripe.elements();

// ═══════════════════════════════════════════════════════════════
// 📱 APPLE PAY / GOOGLE PAY - PAYMENT REQUEST (OPTIMISÉ MOBILE)
// ═══════════════════════════════════════════════════════════════

let paymentRequest = null;
let prButton = null;

function createPaymentRequest() {
    console.log('📱 Création du Payment Request...');
    
    let initialAmount = calculateFinalAmount();
    
    console.log('   💰 Montant initial:', initialAmount, 'centimes');
    
    paymentRequest = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
            label: `AlphaVault AI - ${selectedPlan.name.charAt(0).toUpperCase() + selectedPlan.name.slice(1)}`,
            amount: initialAmount,
        },
        requestPayerName: true,
        requestPayerEmail: true,
        disableWallets: ['link', 'browserCard'],
    });

    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    const buttonHeight = isMobile ? '48px' : '56px';
    
    console.log(`📱 Device: ${isMobile ? 'Mobile' : 'Desktop'} - Button height: ${buttonHeight}`);

    prButton = elements.create('paymentRequestButton', {
        paymentRequest: paymentRequest,
        style: {
            paymentRequestButton: {
                type: 'default',
                theme: 'dark',
                height: buttonHeight,
            },
        },
    });

    paymentRequest.canMakePayment().then(function(result) {
        console.log('📱 Résultat canMakePayment:', result);
        
        if (result) {
            const isAppleOrGooglePay = result.applePay || result.googlePay;
            
            console.log('   Apple Pay:', result.applePay ? '✅' : '❌');
            console.log('   Google Pay:', result.googlePay ? '✅' : '❌');
            console.log('   Link:', result.link ? '✅ (désactivé)' : '❌');
            
            if (isAppleOrGooglePay) {
                console.log('✅ Apple Pay / Google Pay disponible - Montage du bouton');
                
                prButton.mount('#payment-request-button');
                
                const container = document.getElementById('payment-request-container');
                if (container) {
                    if (isSmallMobile) {
                        container.style.maxWidth = '240px';
                        container.style.margin = '0 auto';
                        console.log('📱 Largeur appliquée (petit mobile): 240px');
                    } else if (isMobile) {
                        container.style.maxWidth = '280px';
                        container.style.margin = '0 auto';
                        console.log('📱 Largeur appliquée (mobile): 280px');
                    } else {
                        container.style.maxWidth = '100%';
                        container.style.margin = '0';
                        console.log('💻 Largeur appliquée (desktop): 100%');
                    }
                }
                
                updatePaymentRequestVisibility();
            } else {
                console.log('ℹ Seulement Link disponible - Bouton masqué');
                hidePaymentRequest();
            }
        } else {
            console.log('ℹ Apple Pay / Google Pay non disponible sur cet appareil');
            hidePaymentRequest();
        }
    }).catch(function(error) {
        console.error('❌ Erreur canMakePayment:', error);
        hidePaymentRequest();
    });

    paymentRequest.on('paymentmethod', async (ev) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🍎 PAIEMENT VIA APPLE PAY / GOOGLE PAY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        try {
            const user = firebase.auth().currentUser;
            
            if (!user) {
                ev.complete('fail');
                throw new Error('Vous devez être connecté');
            }
            
            console.log('   ✅ Utilisateur:', user.email);
            console.log('   💳 Payment Method:', ev.paymentMethod.id);
            console.log('   📧 Email:', ev.payerEmail);
            console.log('   👤 Nom:', ev.payerName);
            console.log('   💎 Plan:', selectedPlan.name);
            
            // ✅ PLAN BASIC (gratuit)
            if (selectedPlan.name === 'basic') {
                await firebase.firestore().collection('users').doc(user.uid).set({
                    plan: 'basic',
                    subscriptionStatus: 'active',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                
                ev.complete('success');
                window.location.href = 'success.html?plan=basic&free=true&noconfetti=true';
                return;
            }
            
            // ✅ CODES PROMO SPÉCIAUX (TRIAL/FREE)
            if (appliedPromo && (appliedPromo.type === 'trial' || appliedPromo.type === 'free')) {
                console.log('🎁 Code promo spécial détecté - Pas de paiement requis');
                
                const requestBody = {
                    plan: selectedPlan.name,
                    email: ev.payerEmail,
                    name: ev.payerName,
                    userId: user.uid,
                    promoCode: appliedPromo.code
                };
                
                const response = await fetch(`${WORKER_URL}/create-checkout-session`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });
                
                if (!response.ok) {
                    throw new Error(`Erreur serveur (${response.status})`);
                }
                
                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                ev.complete('success');
                
                if (data.trial) {
                    window.location.href = `success.html?plan=${selectedPlan.name}&trial=true&days=${appliedPromo.duration}`;
                } else {
                    window.location.href = `success.html?plan=${selectedPlan.name}&free=true`;
                }
                
                return;
            }
            
            // ✅ PAIEMENT NORMAL - CRÉATION DIRECTE DE SUBSCRIPTION
            console.log('💳 Création directe de la subscription...');
            
            const requestBody = {
                plan: selectedPlan.name,
                email: ev.payerEmail,
                name: ev.payerName,
                userId: user.uid,
                paymentMethodId: ev.paymentMethod.id,
                promoCode: appliedPromo ? appliedPromo.code : null
            };
            
            console.log('   📡 Appel Worker (create-direct-subscription):', WORKER_URL);
            
            const response = await fetch(`${WORKER_URL}/create-direct-subscription`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`Erreur serveur (${response.status})`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            ev.complete('success');
            
            console.log('✅ Subscription créée avec succès:', data.subscriptionId);
            console.log('   Status:', data.status);
            console.log('   Plan:', data.plan);
            
            if (data.updated) {
                window.location.href = `success.html?plan=${selectedPlan.name}&upgraded=true`;
            } else {
                window.location.href = `success.html?plan=${selectedPlan.name}`;
            }
            
        } catch (error) {
            console.error('❌ Erreur Apple Pay:', error);
            ev.complete('fail');
            
            const errorDisplay = document.getElementById('card-errors');
            if (errorDisplay) {
                errorDisplay.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
            }
        }
    });
}

function calculateFinalAmount() {
    let finalPrice = selectedPlan.price;
    
    if (appliedPromo && appliedPromo.type === 'percentage') {
        const discountAmount = (finalPrice * appliedPromo.value) / 100;
        finalPrice = finalPrice - discountAmount;
    }
    
    return Math.round(finalPrice * 100);
}

function updatePaymentRequestAmount() {
    if (!paymentRequest) return;
    
    const amountInCents = calculateFinalAmount();
    
    console.log('📱 Mise à jour montant Payment Request:', amountInCents, 'centimes');
    
    paymentRequest.update({
        total: {
            label: `AlphaVault AI - ${selectedPlan.name.charAt(0).toUpperCase() + selectedPlan.name.slice(1)}`,
            amount: amountInCents,
        },
    });
}

function updatePaymentRequestVisibility() {
    const container = document.getElementById('payment-request-container');
    const divider = document.getElementById('payment-divider');
    
    if (!container || !divider) return;
    
    // ✅ MASQUER APPLE PAY / GOOGLE PAY POUR :
    // - Plan Basic (gratuit)
    // - Codes TRIAL (gratuit temporaire)
    // - Codes FREE (gratuit à vie)
    // - Codes à 100% (gratuit à vie)
    const shouldHide = selectedPlan.name === 'basic' || 
                       (appliedPromo && (appliedPromo.type === 'free' || appliedPromo.type === 'trial'));
    
    if (shouldHide) {
        container.style.display = 'none';
        divider.style.display = 'none';
        console.log('📱 Payment Request masqué (plan gratuit, trial ou 100%)');
    } else {
        container.style.display = 'block';
        divider.style.display = 'flex';
        console.log('📱 Payment Request affiché');
    }
}

function hidePaymentRequest() {
    const container = document.getElementById('payment-request-container');
    const divider = document.getElementById('payment-divider');
    
    if (container) container.style.display = 'none';
    if (divider) divider.style.display = 'none';
}

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
    let planName, planColor;
    
    switch(plan) {
        case 'basic':
            planName = 'Basic';
            planColor = '#06b6d4';
            break;
        case 'pro':
            planName = 'Pro';
            planColor = '#3B82F6';
            break;
        case 'platinum':
            planName = 'Platinum';
            planColor = '#8B5CF6';
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
        <i class="fas fa-star"></i>
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
        
        planOptions.forEach(opt => opt.classList.remove('selected'));
        this.classList.add('selected');
        
        const planName = this.dataset.plan;
        const planPrice = planName === 'basic' ? 0 : parseFloat(this.dataset.price);
        
        selectedPlan = {
            name: planName,
            price: planPrice
        };
        
        console.log('✅ Plan sélectionné:', selectedPlan);
        
        if (planName === 'basic' && appliedPromo) {
            console.log('ℹ Plan Basic sélectionné - Retrait du code promo');
            removePromoCode();
        }
        
        updatePriceSummary();
        updatePaymentRequestAmount();
        updatePaymentRequestVisibility();
    });
});

const defaultPlan = document.querySelector('[data-plan="basic"]');
if (defaultPlan) {
    defaultPlan.classList.add('selected');
    console.log('✅ Default plan selected: Basic (Free)');
}

const urlParams = new URLSearchParams(window.location.search);
const urlPlan = urlParams.get('plan');

if (urlPlan && ['basic', 'pro', 'platinum'].includes(urlPlan)) {
    console.log('🔗 Plan détecté dans URL:', urlPlan);
    
    const targetPlan = document.querySelector(`[data-plan="${urlPlan}"]`);
    if (targetPlan) {
        planOptions.forEach(opt => opt.classList.remove('selected'));
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
// 🎁 GESTION DES CODES PROMO (DYNAMIQUES + DÉTECTION 100%)
// ═══════════════════════════════════════════════════════════════

const promoInput = document.getElementById('promoCode');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const promoMessage = document.getElementById('promoMessage');
const promoApplied = document.getElementById('promoApplied');
const removePromoBtn = document.getElementById('removePromoBtn');

if (applyPromoBtn) {
    applyPromoBtn.addEventListener('click', function() {
        const code = promoInput.value.trim().toUpperCase();
        
        if (!code) {
            showPromoMessage('Please enter a promo code', 'error');
            return;
        }
        
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
        
        if (!promo.plans || !promo.plans.includes(selectedPlan.name)) {
            showPromoMessage(`This code is only valid for ${promo.plans ? promo.plans.join(' or ') : 'certain'} plan`, 'error');
            console.warn('❌ Code non applicable à ce plan');
            return;
        }
        
        // ✅✅✅ DÉTECTER LES CODES À 100% ET LES TRAITER COMME "FREE"
        let effectivePromo = { ...promo };
        
        if (promo.type === 'percentage' && promo.value >= 100) {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎁 CODE PROMO 100% DÉTECTÉ CÔTÉ CLIENT');
            console.log('   Code:', code);
            console.log('   Réduction:', promo.value + '%');
            console.log('   ✅ Traitement comme accès gratuit (sans CB)');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            // ✅ Transformer en code "free" pour réutiliser la logique existante
            effectivePromo.type = 'free';
            effectivePromo.description = `${promo.value}% discount - Free lifetime access`;
        }
        
        appliedPromo = {
            code: code,
            ...effectivePromo
        };
        
        console.log('✅ Code promo appliqué avec succès');
        console.log('   Type effectif:', effectivePromo.type);
        
        document.getElementById('promoCodeName').textContent = code;
        promoApplied.classList.remove('hidden');
        promoInput.value = '';
        promoInput.disabled = true;
        applyPromoBtn.disabled = true;
        
        showPromoMessage(`${effectivePromo.description}`, 'success');
        updatePriceSummary();
        updatePaymentRequestAmount();
        updatePaymentRequestVisibility();
    });
}

if (removePromoBtn) {
    removePromoBtn.addEventListener('click', function() {
        removePromoCode();
    });
}

function removePromoCode() {
    console.log('🗑 Suppression du code promo');
    
    appliedPromo = null;
    promoApplied.classList.add('hidden');
    promoInput.disabled = false;
    applyPromoBtn.disabled = false;
    promoMessage.classList.add('hidden');
    
    updatePriceSummary();
    updatePaymentRequestAmount();
    updatePaymentRequestVisibility();
}

function showPromoMessage(message, type) {
    promoMessage.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        ${message}
    `;
    promoMessage.className = `promo-message ${type}`;
    promoMessage.classList.remove('hidden');
}

// ═══════════════════════════════════════════════════════════════
// ✅ MISE À JOUR DU RÉCAPITULATIF DES PRIX
// ═══════════════════════════════════════════════════════════════

function updatePriceSummary() {
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
    
    // ═══════════════════════════════════════════════════════════
    // 1⃣ PLAN BASIC (GRATUIT)
    // ═══════════════════════════════════════════════════════════
    
    if (selectedPlan.name === 'basic') {
        document.getElementById('discountRow').classList.add('hidden');
        document.getElementById('originalPriceStriked').classList.add('hidden');
        document.getElementById('summaryFinalPrice').textContent = 'FREE';
        document.getElementById('freeAccessBadge').classList.remove('hidden');
        document.getElementById('trialAccessBadge').classList.add('hidden');
        
        // ✅ MASQUER LES CHAMPS DE PAIEMENT
        document.getElementById('cardDetailsGroup').classList.add('hidden');
        hidePaymentRequest();
        
        const promoSection = document.querySelector('.promo-section');
        if (promoSection) {
            promoSection.style.display = 'none';
        }
        
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
    
    // ✅ AFFICHER LA SECTION PROMO (plans payants)
    const promoSection = document.querySelector('.promo-section');
    if (promoSection) {
        promoSection.style.display = 'block';
    }
    
    // ═══════════════════════════════════════════════════════════
    // 2⃣ CODE PROMO APPLIQUÉ
    // ═══════════════════════════════════════════════════════════
    
    if (appliedPromo) {
        
        // ✅ TYPE: PERCENTAGE (< 100%)
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
            
            // ✅ APRÈS
            if (userExistingPlan.hasPlan) {
                buttonText = 'Change Plan & Pay Now';
            } else {
                buttonText = 'Subscribe & Pay Now';  // ✅ Clair et honnête
            }
            
            // ✅ AFFICHER LES CHAMPS DE PAIEMENT
            document.getElementById('cardDetailsGroup').classList.remove('hidden');
            updatePaymentRequestVisibility();
        }
        
        // ✅ TYPE: FREE (accès gratuit à vie - INCLUT LES CODES À 100%)
        else if (appliedPromo.type === 'free') {
            document.getElementById('discountRow').classList.add('hidden');
            document.getElementById('originalPriceStriked').textContent = `$${originalPrice.toFixed(2)}`;
            document.getElementById('originalPriceStriked').classList.remove('hidden');
            
            document.getElementById('summaryFinalPrice').textContent = 'FREE';
            
            document.getElementById('freeAccessBadge').classList.remove('hidden');
            document.getElementById('trialAccessBadge').classList.add('hidden');
            
            buttonText = 'Activate Free Lifetime Access';
            
            // ✅ MASQUER LES CHAMPS DE PAIEMENT (PAS DE CB REQUISE)
            document.getElementById('cardDetailsGroup').classList.add('hidden');
            hidePaymentRequest();
        }
        
        // ✅ TYPE: TRIAL (accès gratuit temporaire)
        else if (appliedPromo.type === 'trial') {
            document.getElementById('discountRow').classList.add('hidden');
            document.getElementById('originalPriceStriked').textContent = `$${originalPrice.toFixed(2)}`;
            document.getElementById('originalPriceStriked').classList.remove('hidden');
            
            document.getElementById('summaryFinalPrice').textContent = 'FREE';
            
            document.getElementById('freeAccessBadge').classList.add('hidden');
            document.getElementById('trialAccessBadge').classList.remove('hidden');
            
            const trialDays = appliedPromo.duration || 14;
            document.getElementById('trialDays').textContent = trialDays;
            
            buttonText = `Start ${trialDays}-Day Free Trial`;
            
            // ✅ MASQUER LES CHAMPS DE PAIEMENT (PAS DE CB REQUISE)
            document.getElementById('cardDetailsGroup').classList.add('hidden');
            hidePaymentRequest();
        }
    } 
    
    // ═══════════════════════════════════════════════════════════
    // 3⃣ SANS CODE PROMO
    // ═══════════════════════════════════════════════════════════
    
    else {
        document.getElementById('discountRow').classList.add('hidden');
        document.getElementById('originalPriceStriked').classList.add('hidden');
        document.getElementById('summaryFinalPrice').textContent = `$${originalPrice.toFixed(2)}`;
        document.getElementById('freeAccessBadge').classList.add('hidden');
        document.getElementById('trialAccessBadge').classList.add('hidden');
        
        // ✅ APRÈS
        if (userExistingPlan.hasPlan) {
            buttonText = 'Change Plan & Pay Now';
        } else {
            buttonText = 'Subscribe & Pay Now';  // ✅ Clair et honnête
        }
        
        // ✅ AFFICHER LES CHAMPS DE PAIEMENT
        document.getElementById('cardDetailsGroup').classList.remove('hidden');
        updatePaymentRequestVisibility();
    }
    
    document.getElementById('submitButtonText').textContent = buttonText;
}

// ═══════════════════════════════════════════════════════════════
// ✅ SOUMISSION DU FORMULAIRE
// ═══════════════════════════════════════════════════════════════

const form = document.getElementById('payment-form');
const submitButton = document.getElementById('submit-button');

if (form) {
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
            
            // ✅ PLAN BASIC (GRATUIT)
            if (selectedPlan.name === 'basic') {
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🎉 ACTIVATION DU PLAN BASIC GRATUIT');
                console.log('   👤 User ID:', user.uid);
                console.log('   💎 Plan: Basic (FREE)');
                console.log('   📧 Email:', email);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                
                await firebase.firestore().collection('users').doc(user.uid).set({
                    plan: 'basic',
                    subscriptionStatus: 'active',
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                
                console.log('✅ Plan Basic activé dans Firestore');
                
                window.location.href = 'success.html?plan=basic&free=true&noconfetti=true';
                return;
            }
            
            if (appliedPromo) {
                console.log('   🎁 Code promo appliqué:', appliedPromo.code);
                console.log('   🎁 Type:', appliedPromo.type);
                console.log('   🎁 Valeur:', appliedPromo.type === 'percentage' ? `${appliedPromo.value}%` : appliedPromo.type === 'trial' ? `${appliedPromo.duration} jours` : 'FREE');
            }
            
            console.log('3⃣ Vérification du plan actuel...');

            // ✅ Vérifier si l'utilisateur a déjà un plan payant actif
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            const currentPlan = userDoc.exists ? userDoc.data()?.plan : 'basic';
            const hasActiveSubscription = userDoc.exists && userDoc.data()?.stripeSubscriptionId;

            console.log('   Plan actuel:', currentPlan);
            console.log('   Subscription active:', hasActiveSubscription ? 'Oui' : 'Non');

            console.log('4⃣ Appel du Cloudflare Worker...');

            const requestBody = {
                plan: selectedPlan.name,
                email: email,
                name: name,
                userId: user.uid,
                promoCode: appliedPromo ? appliedPromo.code : null,
                promoType: appliedPromo ? appliedPromo.type : null,
                promoDuration: appliedPromo?.duration || null,
                hasExistingSubscription: hasActiveSubscription
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
            
            // ✅ ACCÈS GRATUIT (TRIAL/FREE/100%)
            if (data.free === true) {
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                
                if (data.trial === true) {
                    console.log('🎉 ACCÈS GRATUIT TRIAL ACTIVÉ (SANS CB)');
                    console.log('   👤 User ID:', user.uid);
                    console.log('   💎 Plan:', selectedPlan.name);
                    console.log('   🎁 Code promo:', appliedPromo.code);
                    console.log('   ⏱ Durée:', data.trialDays || appliedPromo.duration, 'jours');
                    console.log('   📅 Expire le:', data.expiresAt || 'N/A');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    
                    window.location.href = `success.html?plan=${selectedPlan.name}&trial=true&days=${data.trialDays || appliedPromo.duration}&noconfetti=true`;
                } else {
                    console.log('🎉 ACCÈS GRATUIT À VIE ACTIVÉ (SANS CB)');
                    console.log('   👤 Client Stripe ID:', data.customerId || 'N/A');
                    console.log('   💎 Plan:', selectedPlan.name);
                    console.log('   🎁 Code promo:', appliedPromo ? appliedPromo.code : 'N/A');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    
                    window.location.href = `success.html?plan=${selectedPlan.name}&free=true&noconfetti=true`;
                }
                
                return;
            }
            
            // ✅ PAIEMENT NORMAL VIA STRIPE CHECKOUT
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
            if (errorDisplay) {
                errorDisplay.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message}`;
            }
            
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// ✅ PRÉ-REMPLIR L'EMAIL ET VÉRIFIER LE PLAN EXISTANT
// ═══════════════════════════════════════════════════════════════

firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
        console.log('✅ Utilisateur Firebase détecté:', user.email);
        document.getElementById('email').value = user.email;
        
        await checkExistingPlan(user);
        
        createPaymentRequest();
        
        updatePriceSummary();
    } else {
        console.warn('⚠ Aucun utilisateur connecté');
    }
});

console.log('✅ Checkout script loaded successfully - Dynamic Promo Codes + 100% Detection enabled');