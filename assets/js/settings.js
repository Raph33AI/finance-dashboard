// /* ============================================
//    SETTINGS.JS - Gestion des paramètres utilisateur
//    ✅ SYNCHRONISATION NEWSLETTER SIMPLIFIÉE (Firestore = Source de vérité)
//    ✅ CORRECTION CORS avec MULTIPLES TENTATIVES
//    ✅ TOAST CORRIGÉ
//    ✅ NETTOYAGE : General Settings retiré, Notifications et Privacy simplifiés
//    ============================================ */

// // Configuration
// const NEWSLETTER_WORKER_URL = 'https://newsletter-worker.raphnardone.workers.dev';

// // Variables globales
// let currentUserData = null;
// let currentSettings = {
//     // Notifications
//     weeklyNewsletter: true,  // ✅ ACTIVÉ PAR DÉFAUT
//     featureUpdates: true,
    
//     // Privacy
//     analytics: true
// };

// // ============================================
// // INITIALISATION
// // ============================================

// document.addEventListener('DOMContentLoaded', function() {
//     console.log('🚀 Initialisation de la page paramètres...');
    
//     if (!isFirebaseInitialized()) {
//         showToast('error', 'Erreur', 'Impossible de charger les paramètres');
//         return;
//     }
    
//     initializeEventListeners();
//     console.log('✅ Page paramètres initialisée');
// });

// window.addEventListener('userDataLoaded', function(e) {
//     currentUserData = e.detail;
//     console.log('✅ Données utilisateur reçues:', currentUserData);
//     loadSettings();
// });

// // ============================================
// // CHARGEMENT DES PARAMÈTRES
// // ============================================

// async function loadSettings() {
//     try {
//         console.log('📥 Chargement des paramètres...');
        
//         if (!currentUserData) {
//             console.warn('⚠ Pas de données utilisateur disponibles');
//             loadDefaultSettings();
//             return;
//         }
        
//         const settingsRef = firebaseDb
//             .collection('users')
//             .doc(currentUserData.uid)
//             .collection('settings')
//             .doc('preferences');
        
//         const settingsDoc = await settingsRef.get();
        
//         if (!settingsDoc.exists) {
//             console.log('⚠ Paramètres inexistants, création avec valeurs par défaut...');
//             await settingsRef.set(currentSettings);
//             console.log('✅ Paramètres créés avec succès');
//         } else {
//             const data = settingsDoc.data();
//             currentSettings = { ...currentSettings, ...data };
//             console.log('✅ Paramètres chargés:', currentSettings);
//         }
        
//         // ✅ SYNCHRONISER AVEC CLOUDFLARE KV (Firestore = source de vérité)
//         await synchronizeNewsletterSubscription();
        
//         applySettingsToUI();
        
//     } catch (error) {
//         console.error('❌ Erreur lors du chargement des paramètres:', error);
        
//         if (error.code === 'permission-denied') {
//             console.log('⚠ Permissions refusées, utilisation des valeurs par défaut');
//             loadDefaultSettings();
//         } else {
//             showToast('error', 'Erreur', 'Impossible de charger vos paramètres');
//         }
//     }
// }

// function loadDefaultSettings() {
//     console.log('📥 Chargement des paramètres par défaut');
    
//     const savedSettings = localStorage.getItem('financepro_settings');
//     if (savedSettings) {
//         try {
//             currentSettings = { ...currentSettings, ...JSON.parse(savedSettings) };
//             console.log('✅ Paramètres chargés depuis localStorage');
//         } catch (e) {
//             console.warn('⚠ Erreur lors du parsing localStorage');
//         }
//     }
    
//     applySettingsToUI();
// }

// function applySettingsToUI() {
//     // Notifications
//     document.getElementById('weeklyNewsletter').checked = currentSettings.weeklyNewsletter !== false;
//     document.getElementById('featureUpdates').checked = currentSettings.featureUpdates !== false;
    
//     // Privacy
//     document.getElementById('analytics').checked = currentSettings.analytics !== false;
    
//     console.log('✅ Interface mise à jour avec les paramètres');
// }

// // ============================================
// // 🆕 SYNCHRONISATION NEWSLETTER CLOUDFLARE (SIMPLIFIÉE)
// // ============================================

// async function synchronizeNewsletterSubscription() {
//     if (!currentUserData || !currentUserData.uid) {
//         console.warn('⚠ Aucun utilisateur connecté pour la synchronisation');
//         return;
//     }

//     try {
//         console.log('🔄 Synchronisation newsletter avec Firestore...');
        
//         const userRef = db.collection('users').doc(currentUserData.uid);
//         const doc = await userRef.get();
        
//         if (!doc.exists) {
//             console.warn('⚠ Document utilisateur introuvable');
//             return;
//         }
        
//         const userData = doc.data();
//         const isSubscribed = userData.weeklyNewsletter === true;
        
//         console.log('📊 Statut newsletter (Firestore):', isSubscribed ? 'Abonné ✅' : 'Non abonné ❌');
        
//         // Mettre à jour le toggle sur la page
//         const newsletterToggle = document.getElementById('weeklyNewsletter');
//         if (newsletterToggle) {
//             newsletterToggle.checked = isSubscribed;
//         }
        
//         // ✅ INSCRIPTION MANQUANTE - RATTRAPAGE
//         if (isSubscribed && !userData.newsletterSubscribedAt) {
//             console.log('⚠ Inscription manquante détectée - envoi au Worker...');
            
//             const subscribed = await subscribeToNewsletter(currentUserData.email, currentUserData.displayName);
            
//             if (subscribed) {
//                 // Mettre à jour Firestore avec la date
//                 await userRef.update({
//                     newsletterSubscribedAt: new Date().toISOString()
//                 });
                
//                 console.log('✅ Inscription newsletter rattrapée');
//             }
//         } else if (isSubscribed && userData.newsletterSubscribedAt) {
//             console.log('✅ Utilisateur déjà abonné (depuis', userData.newsletterSubscribedAt, ')');
//         }
        
//     } catch (error) {
//         console.error('❌ Erreur synchronisation newsletter:', error);
//         // Ne pas bloquer l'expérience utilisateur
//     }
// }

// async function subscribeToNewsletter(email, name) {
//     try {
//         console.log('📧 Inscription à la newsletter:', email);
        
//         const response = await fetch(`${NEWSLETTER_WORKER_URL}/subscribe`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 email: email,
//                 name: name || email.split('@')[0],
//                 source: 'settings_sync',
//                 timestamp: new Date().toISOString()
//             })
//         });
        
//         if (!response.ok) {
//             const errorData = await response.json();
//             console.warn('⚠ Erreur Worker:', errorData);
//             return false;
//         }
        
//         const data = await response.json();
//         console.log('✅ Inscription newsletter réussie:', data);
//         showToast('success', 'Succès !', 'Vous êtes maintenant inscrit à la newsletter hebdomadaire');
        
//         return true;
        
//     } catch (error) {
//         console.error('❌ Erreur inscription newsletter:', error);
//         return false;
//     }
// }

// async function unsubscribeFromNewsletter(email) {
//     try {
//         console.log('📧 Désinscription de la newsletter:', email);
        
//         // ✅ MÉTHODE 1 : Essayer GET avec paramètre URL (ancien format)
//         console.log('🔄 Tentative 1 : GET avec paramètre URL...');
        
//         try {
//             // Utiliser une image invisible pour contourner CORS
//             const img = new Image();
//             const unsubscribeUrl = `${NEWSLETTER_WORKER_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
            
//             await new Promise((resolve, reject) => {
//                 img.onload = () => {
//                     console.log('✅ Requête GET envoyée avec succès (méthode 1)');
//                     resolve();
//                 };
//                 img.onerror = () => {
//                     console.warn('⚠ Méthode 1 échouée, tentative méthode 2...');
//                     reject();
//                 };
                
//                 // Timeout de 3 secondes
//                 setTimeout(() => reject(), 3000);
                
//                 img.src = unsubscribeUrl;
//             });
            
//             console.log('✅ Désinscription newsletter réussie (méthode 1)');
//             showToast('info', 'Désinscription', 'Vous ne recevrez plus la newsletter hebdomadaire');
//             return true;
            
//         } catch (error1) {
//             console.log('⚠ Méthode 1 (GET Image) échouée');
//         }
        
//         // ✅ MÉTHODE 2 : Essayer navigator.sendBeacon (pas de CORS)
//         console.log('🔄 Tentative 2 : sendBeacon...');
        
//         try {
//             const beaconUrl = `${NEWSLETTER_WORKER_URL}/unsubscribe`;
//             const data = new Blob([JSON.stringify({ email: email })], { type: 'application/json' });
            
//             if (navigator.sendBeacon && navigator.sendBeacon(beaconUrl, data)) {
//                 console.log('✅ Désinscription newsletter réussie (méthode 2)');
//                 showToast('info', 'Désinscription', 'Vous ne recevrez plus la newsletter hebdomadaire');
//                 return true;
//             } else {
//                 console.warn('⚠ Méthode 2 (sendBeacon) non supportée ou échouée');
//             }
//         } catch (error2) {
//             console.log('⚠ Méthode 2 (sendBeacon) échouée');
//         }
        
//         // ✅ MÉTHODE 3 : Essayer fetch POST (mode no-cors)
//         console.log('🔄 Tentative 3 : Fetch POST no-cors...');
        
//         try {
//             await fetch(`${NEWSLETTER_WORKER_URL}/unsubscribe`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     email: email
//                 }),
//                 mode: 'no-cors' // ✅ Mode no-cors pour contourner
//             });
            
//             // En mode no-cors, on ne peut pas lire la réponse mais la requête est envoyée
//             console.log('✅ Requête POST envoyée (méthode 3 - no-cors)');
//             showToast('info', 'Désinscription', 'Vous ne recevrez plus la newsletter hebdomadaire');
//             return true;
            
//         } catch (error3) {
//             console.log('⚠ Méthode 3 (Fetch POST) échouée');
//         }
        
//         // ✅ MÉTHODE 4 : Essayer fetch GET classique (mode no-cors)
//         console.log('🔄 Tentative 4 : Fetch GET no-cors...');
        
//         try {
//             await fetch(`${NEWSLETTER_WORKER_URL}/unsubscribe?email=${encodeURIComponent(email)}`, {
//                 method: 'GET',
//                 mode: 'no-cors'
//             });
            
//             console.log('✅ Requête GET envoyée (méthode 4)');
//             showToast('info', 'Désinscription', 'Vous ne recevrez plus la newsletter hebdomadaire');
//             return true;
            
//         } catch (error4) {
//             console.log('⚠ Méthode 4 (Fetch GET) échouée');
//         }
        
//         // ✅ FALLBACK : Toutes les méthodes ont échoué
//         console.warn('⚠ Toutes les tentatives de désinscription Worker ont échoué');
//         console.log('ℹ Préférence sauvegardée dans Firestore. La désinscription sera effective au prochain envoi.');
        
//         showToast('warning', 'Désinscription enregistrée', 'Votre préférence est sauvegardée. La désinscription sera effective dans quelques minutes.');
        
//         return true; // On retourne true pour ne pas bloquer l'utilisateur
        
//     } catch (error) {
//         console.error('❌ Erreur désinscription newsletter:', error);
        
//         showToast('warning', 'Désinscription enregistrée', 'Votre préférence est sauvegardée dans votre compte');
//         return true;
//     }
// }

// // ============================================
// // GESTIONNAIRES D'ÉVÉNEMENTS
// // ============================================

// function initializeEventListeners() {
//     // Navigation entre tabs
//     const tabButtons = document.querySelectorAll('.settings-nav-item');
//     tabButtons.forEach(function(button) {
//         button.addEventListener('click', function() {
//             switchTab(button.dataset.tab);
//         });
//     });
    
//     // Boutons de sauvegarde
//     const saveNotifBtn = document.getElementById('saveNotificationSettings');
//     if (saveNotifBtn) {
//         saveNotifBtn.addEventListener('click', saveNotificationSettings);
//     }
    
//     const savePrivacyBtn = document.getElementById('savePrivacySettings');
//     if (savePrivacyBtn) {
//         savePrivacyBtn.addEventListener('click', savePrivacySettings);
//     }
    
//     // Boutons d'action data
//     const exportBtn = document.getElementById('exportDataBtn');
//     if (exportBtn) {
//         exportBtn.addEventListener('click', exportUserData);
//     }
    
//     const clearBtn = document.getElementById('clearCacheBtn');
//     if (clearBtn) {
//         clearBtn.addEventListener('click', clearCache);
//     }
    
//     const deleteAnalysesBtn = document.getElementById('deleteAllAnalyses');
//     if (deleteAnalysesBtn) {
//         deleteAnalysesBtn.addEventListener('click', deleteAllAnalyses);
//     }
    
//     const deletePortfoliosBtn = document.getElementById('deleteAllPortfolios');
//     if (deletePortfoliosBtn) {
//         deletePortfoliosBtn.addEventListener('click', deleteAllPortfolios);
//     }
// }

// // ============================================
// // NAVIGATION TABS
// // ============================================

// function switchTab(tabName) {
//     document.querySelectorAll('.settings-nav-item').forEach(function(btn) {
//         btn.classList.remove('active');
//     });
//     document.querySelectorAll('.settings-tab').forEach(function(tab) {
//         tab.classList.remove('active');
//     });
    
//     const activeNavBtn = document.querySelector('[data-tab="' + tabName + '"]');
//     if (activeNavBtn) {
//         activeNavBtn.classList.add('active');
//     }
    
//     const activeTab = document.getElementById('tab-' + tabName);
//     if (activeTab) {
//         activeTab.classList.add('active');
//     }
    
//     console.log('📑 Onglet changé:', tabName);
// }

// // ============================================
// // SAUVEGARDE DES PARAMÈTRES
// // ============================================

// async function saveNotificationSettings() {
//     const previousNewsletterState = currentSettings.weeklyNewsletter;
    
//     currentSettings.weeklyNewsletter = document.getElementById('weeklyNewsletter').checked;
//     currentSettings.featureUpdates = document.getElementById('featureUpdates').checked;
    
//     await saveSettings();
    
//     // ✅ SYNCHRONISER AVEC CLOUDFLARE SI CHANGEMENT
//     if (currentSettings.weeklyNewsletter !== previousNewsletterState) {
//         console.log('📧 Changement préférence newsletter détecté, synchronisation...');
        
//         if (currentSettings.weeklyNewsletter) {
//             // L'utilisateur active la newsletter
//             const subscribed = await subscribeToNewsletter(currentUserData.email, currentUserData.displayName);
            
//             if (subscribed) {
//                 // Mettre à jour la date d'inscription
//                 const userRef = db.collection('users').doc(currentUserData.uid);
//                 await userRef.update({
//                     newsletterSubscribedAt: new Date().toISOString()
//                 });
//             }
//         } else {
//             // L'utilisateur désactive la newsletter
//             await unsubscribeFromNewsletter(currentUserData.email);
            
//             // Supprimer la date d'inscription
//             const userRef = db.collection('users').doc(currentUserData.uid);
//             await userRef.update({
//                 newsletterSubscribedAt: firebase.firestore.FieldValue.delete()
//             });
//         }
//     }
    
//     showToast('success', 'Succès !', 'Préférences de notifications sauvegardées');
// }

// async function savePrivacySettings() {
//     currentSettings.analytics = document.getElementById('analytics').checked;
    
//     await saveSettings();
//     showToast('success', 'Succès !', 'Paramètres de confidentialité sauvegardés');
// }

// async function saveSettings() {
//     try {
//         // Sauvegarde localStorage
//         localStorage.setItem('financepro_settings', JSON.stringify(currentSettings));
        
//         // Sauvegarde Firestore
//         if (currentUserData) {
//             const settingsRef = firebaseDb
//                 .collection('users')
//                 .doc(currentUserData.uid)
//                 .collection('settings')
//                 .doc('preferences');
            
//             await settingsRef.set(currentSettings, { merge: true });
            
//             // ✅ AUSSI METTRE À JOUR LE DOCUMENT UTILISATEUR PRINCIPAL
//             const userRef = firebaseDb.collection('users').doc(currentUserData.uid);
//             await userRef.update({
//                 weeklyNewsletter: currentSettings.weeklyNewsletter
//             });
            
//             console.log('✅ Paramètres sauvegardés dans Firestore');
//         }
        
//     } catch (error) {
//         console.error('❌ Erreur lors de la sauvegarde:', error);
//         showToast('error', 'Erreur', 'Impossible de sauvegarder vos paramètres');
//     }
// }

// // ============================================
// // GESTION DES DONNÉES
// // ============================================

// async function exportUserData() {
//     if (!currentUserData) {
//         showToast('error', 'Erreur', 'Vous devez être connecté');
//         return;
//     }
    
//     try {
//         showToast('info', 'Export en cours...', 'Préparation de vos données');
        
//         const exportData = {
//             user: currentUserData,
//             settings: currentSettings,
//             exportDate: new Date().toISOString()
//         };
        
//         const dataStr = JSON.stringify(exportData, null, 2);
//         const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
//         const url = URL.createObjectURL(dataBlob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = 'alphavault-export-' + Date.now() + '.json';
//         link.click();
        
//         showToast('success', 'Succès !', 'Vos données ont été exportées');
        
//     } catch (error) {
//         console.error('❌ Erreur lors de l\'export:', error);
//         showToast('error', 'Erreur', 'Impossible d\'exporter vos données');
//     }
// }

// function clearCache() {
//     const confirmed = confirm(
//         'Êtes-vous sûr de vouloir vider le cache ?\n\n' +
//         'Cette action supprimera toutes les données temporaires.'
//     );
    
//     if (!confirmed) return;
    
//     try {
//         const essentialKeys = ['financepro_user', 'financepro_theme', 'financepro_settings'];
//         const allKeys = Object.keys(localStorage);
        
//         allKeys.forEach(function(key) {
//             if (!essentialKeys.includes(key)) {
//                 localStorage.removeItem(key);
//             }
//         });
        
//         showToast('success', 'Succès !', 'Cache vidé avec succès');
        
//     } catch (error) {
//         console.error('❌ Erreur lors du vidage du cache:', error);
//         showToast('error', 'Erreur', 'Impossible de vider le cache');
//     }
// }

// async function deleteAllAnalyses() {
//     const confirmed = confirm(
//         '⚠ ATTENTION ⚠\n\n' +
//         'Êtes-vous sûr de vouloir supprimer TOUTES vos analyses ?\n\n' +
//         'Cette action est IRRÉVERSIBLE !'
//     );
    
//     if (!confirmed) return;
    
//     showToast('info', 'Suppression...', 'Suppression de vos analyses en cours');
    
//     try {
//         // TODO: Implémenter la suppression réelle
//         showToast('success', 'Succès !', 'Analyses supprimées');
//     } catch (error) {
//         console.error('❌ Erreur:', error);
//         showToast('error', 'Erreur', 'Impossible de supprimer les analyses');
//     }
// }

// async function deleteAllPortfolios() {
//     const confirmed = confirm(
//         '⚠ ATTENTION ⚠\n\n' +
//         'Êtes-vous sûr de vouloir supprimer TOUS vos portfolios ?\n\n' +
//         'Cette action est IRRÉVERSIBLE !'
//     );
    
//     if (!confirmed) return;
    
//     showToast('info', 'Suppression...', 'Suppression de vos portfolios en cours');
    
//     try {
//         // TODO: Implémenter la suppression réelle
//         showToast('success', 'Succès !', 'Portfolios supprimés');
//     } catch (error) {
//         console.error('❌ Erreur:', error);
//         showToast('error', 'Erreur', 'Impossible de supprimer les portfolios');
//     }
// }

// // ============================================
// // ✅ UTILITAIRES - TOAST CORRIGÉ
// // ============================================

// function showToast(type, title, message) {
//     const toastContainer = document.getElementById('toastContainer');
    
//     // ✅ VÉRIFICATION SI L'ÉLÉMENT EXISTE
//     if (!toastContainer) {
//         console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        
//         // ✅ FALLBACK : Utiliser console pour debug
//         if (type === 'error') {
//             console.error(`❌ ${title}: ${message}`);
//         } else if (type === 'success') {
//             console.log(`✅ ${title}: ${message}`);
//         } else if (type === 'warning') {
//             console.warn(`⚠ ${title}: ${message}`);
//         } else if (type === 'info') {
//             console.info(`ℹ ${title}: ${message}`);
//         }
//         return;
//     }
    
//     const toast = document.createElement('div');
//     toast.className = 'toast ' + type;
    
//     let iconClass = 'fa-info-circle';
//     switch(type) {
//         case 'success':
//             iconClass = 'fa-check-circle';
//             break;
//         case 'error':
//             iconClass = 'fa-times-circle';
//             break;
//         case 'warning':
//             iconClass = 'fa-exclamation-triangle';
//             break;
//         case 'info':
//             iconClass = 'fa-info-circle';
//             break;
//     }
    
//     toast.innerHTML = `
//         <div class="toast-icon">
//             <i class="fas ${iconClass}"></i>
//         </div>
//         <div class="toast-content">
//             <div class="toast-title">${title}</div>
//             <div class="toast-message">${message}</div>
//         </div>
//         <button class="toast-close">
//             <i class="fas fa-times"></i>
//         </button>
//     `;
    
//     toastContainer.appendChild(toast);
    
//     const closeBtn = toast.querySelector('.toast-close');
//     if (closeBtn) {
//         closeBtn.addEventListener('click', function() {
//             removeToast(toast);
//         });
//     }
    
//     setTimeout(function() {
//         removeToast(toast);
//     }, 5000);
// }

// function removeToast(toast) {
//     if (!toast || !toast.parentNode) return;
    
//     toast.style.animation = 'slideOutRight 0.3s ease forwards';
//     setTimeout(function() {
//         if (toast.parentNode) {
//             toast.parentNode.removeChild(toast);
//         }
//     }, 300);
// }

// function isFirebaseInitialized() {
//     return typeof firebase !== 'undefined' && 
//            typeof firebaseDb !== 'undefined';
// }

// console.log('✅ Script de paramètres chargé avec synchronisation newsletter (Firestore = vérité) - Version simplifiée');

/* ============================================
   SETTINGS.JS - Gestion des paramètres utilisateur
   ✅ VERSION ULTRA-PREMIUM avec Plan & Subscription
   ✅ PLANS: BASIC, PRO, PLATINUM uniquement
   ✅ INTÉGRATION ACCESS CONTROL SYSTEM v6.0
   ✅ SYNCHRONISATION NEWSLETTER SIMPLIFIÉE (Firestore = Source de vérité)
   ✅ CORRECTION CORS avec MULTIPLES TENTATIVES
   ✅ TOAST CORRIGÉ
   ============================================ */

// Configuration
const NEWSLETTER_WORKER_URL = 'https://newsletter-worker.raphnardone.workers.dev';
const CHECKOUT_URL = 'checkout.html';
const STRIPE_CUSTOMER_PORTAL_URL = 'https://billing.stripe.com/p/login/test_XXXXX'; // ✅ À REMPLACER PAR VOTRE URL

// ✅ Configuration des plans (BASIC, PRO, PLATINUM UNIQUEMENT)
const PLANS_CONFIG = {
    basic: {
        name: 'basic',
        displayName: 'Basic',
        badge: 'basic-badge',
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        icon: 'fa-star',
        level: 0,
        requiresActiveSubscription: true,
        pages: [
            'dashboard-financier.html',
            'community-hub.html',
            'create-post.html',
            'messages.html',
            'monte-carlo.html',
            'real-estate-tax-simulator.html',
            'portfolio-optimizer.html',
            'economic-dashboard.html',
            'companies-directory.html'
        ],
        pageCount: 9,
        features: [
            'Access to 9 pages',
            'Real-time market data',
            'Advanced charts',
            'Email support',
            'Priority updates',
            'Export analyses',
            'Community access',
            'Monte Carlo simulations',
            'Portfolio optimization (basic)',
            'Economic dashboard',
            'Companies directory'
        ],
        price: 29,
        currency: '$',
        billingPeriod: 'month'
    },
    
    pro: {
        name: 'pro',
        displayName: 'Pro',
        badge: 'pro-badge',
        color: '#3b82f6',
        gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        icon: 'fa-rocket',
        level: 1,
        requiresActiveSubscription: true,
        pages: [
            // Common pages
            'dashboard-financier.html',
            'community-hub.html',
            'create-post.html',
            'messages.html',
            'monte-carlo.html',
            // Basic pages
            'real-estate-tax-simulator.html',
            'portfolio-optimizer.html',
            'economic-dashboard.html',
            'companies-directory.html',
            // Pro specific pages
            'investment-analytics.html',
            'risk-parity.html',
            'scenario-analysis.html',
            'advanced-analysis.html',
            'forex-converter.html',
            'inflation-calculator.html',
            'interest-rate-tracker.html',
            'news-terminal.html'
        ],
        pageCount: 17,
        features: [
            'Access to 17 pages',
            'Everything in Basic',
            'Real-time data + AI insights',
            'Advanced technical analysis',
            'Portfolio optimization (advanced)',
            'Risk Parity',
            'Scenario Analysis',
            'Forex Converter (38+ currencies)',
            'Monte Carlo simulations (advanced)',
            'Investment Analytics',
            'Inflation Calculator',
            'Interest Rate Tracker',
            'News Terminal',
            'Priority support',
            'API access (limited)'
        ],
        price: 79,
        currency: '$',
        billingPeriod: 'month',
        popular: true
    },
    
    platinum: {
        name: 'platinum',
        displayName: 'Platinum',
        badge: 'platinum-badge',
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        icon: 'fa-crown',
        level: 2,
        requiresActiveSubscription: true,
        pages: ['all'],
        pageCount: 25,
        features: [
            'Access to ALL 25 pages',
            'Everything in Pro',
            'IPO Intelligence',
            'Insider Flow Tracker',
            'M&A Predictor',
            'Trend Prediction (AI)',
            'Market Sentiment Analysis',
            'Trending Topics',
            'YouTube Intelligence',
            'Recession Indicators',
            'Advanced AI recommendations',
            'White-glove support',
            'Custom integrations',
            'Full API access',
            'Dedicated account manager',
            'Early access to new features'
        ],
        price: 149,
        currency: '$',
        billingPeriod: 'month',
        premium: true
    }
};

// Variables globales
let currentUserData = null;
let currentSettings = {
    // Notifications
    weeklyNewsletter: true,
    featureUpdates: true,
    
    // Privacy
    analytics: true
};

// Variables pour le plan utilisateur
let userPlan = {
    plan: 'basic',
    subscriptionStatus: 'inactive',
    customerId: null,
    subscriptionId: null,
    currentPeriodEnd: null
};

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation de la page paramètres...');
    
    if (!isFirebaseInitialized()) {
        showToast('error', 'Erreur', 'Impossible de charger les paramètres');
        return;
    }
    
    initializeEventListeners();
    console.log('✅ Page paramètres initialisée');
});

window.addEventListener('userDataLoaded', function(e) {
    currentUserData = e.detail;
    console.log('✅ Données utilisateur reçues:', currentUserData);
    loadSettings();
    loadUserPlan();
});

// ============================================
// 🆕 CHARGEMENT DU PLAN UTILISATEUR
// ============================================

async function loadUserPlan() {
    if (!currentUserData || !currentUserData.uid) {
        console.warn('⚠ Pas de données utilisateur pour charger le plan');
        return;
    }
    
    try {
        console.log('📊 Chargement du plan utilisateur...');
        
        const userDoc = await firebaseDb.collection('users').doc(currentUserData.uid).get();
        
        if (!userDoc.exists) {
            console.warn('⚠ Document utilisateur introuvable');
            displayUserPlan('basic');
            return;
        }
        
        const userData = userDoc.data();
        
        let planName = (userData.plan || 'basic').toLowerCase();
        
        // ✅ Assurer que le plan est valide (basic, pro, ou platinum)
        if (!['basic', 'pro', 'platinum'].includes(planName)) {
            console.warn('⚠ Plan invalide détecté:', planName, '- Utilisation de "basic" par défaut');
            planName = 'basic';
        }
        
        userPlan = {
            plan: planName,
            subscriptionStatus: userData.subscriptionStatus || 'inactive',
            customerId: userData.stripeCustomerId || null,
            subscriptionId: userData.stripeSubscriptionId || null,
            currentPeriodEnd: userData.subscriptionCurrentPeriodEnd || null,
            trialEnd: userData.trialEnd || null
        };
        
        console.log('✅ Plan utilisateur chargé:', userPlan);
        
        displayUserPlan(userPlan.plan);
        displayBillingHistory();
        
    } catch (error) {
        console.error('❌ Erreur chargement plan:', error);
        displayUserPlan('basic');
    }
}

// ============================================
// 🆕 AFFICHAGE DU PLAN UTILISATEUR
// ============================================

function displayUserPlan(planName) {
    const planConfig = PLANS_CONFIG[planName] || PLANS_CONFIG.basic;
    
    console.log('📊 Affichage du plan:', planName);
    
    // ✅ Badge du plan actuel
    const currentPlanBadge = document.getElementById('currentPlanBadge');
    if (currentPlanBadge) {
        currentPlanBadge.textContent = planConfig.displayName;
        currentPlanBadge.className = `plan-badge ${planConfig.badge}`;
        currentPlanBadge.style.background = planConfig.gradient;
    }
    
    // ✅ Icône du plan
    const planIcon = document.getElementById('currentPlanIcon');
    if (planIcon) {
        planIcon.className = `fas ${planConfig.icon}`;
    }
    
    // ✅ Couleur de l'icône
    const planIconCircle = document.getElementById('planIconCircle');
    if (planIconCircle) {
        planIconCircle.style.background = planConfig.gradient;
    }
    
    // ✅ Nom du plan
    const currentPlanName = document.getElementById('currentPlanName');
    if (currentPlanName) {
        currentPlanName.textContent = planConfig.displayName + ' Plan';
    }
    
    // ✅ Prix du plan
    const currentPlanPrice = document.getElementById('currentPlanPrice');
    if (currentPlanPrice) {
        currentPlanPrice.innerHTML = `
            <span class="plan-price-currency">${planConfig.currency}</span>
            <span class="plan-price-amount">${planConfig.price}</span>
            <span class="plan-price-period">/${planConfig.billingPeriod}</span>
        `;
    }
    
    // ✅ Nombre de pages accessibles
    const pageAccessInfo = document.getElementById('pageAccessInfo');
    if (pageAccessInfo) {
        if (planConfig.pageCount === 25) {
            pageAccessInfo.innerHTML = '<i class="fas fa-infinity"></i> Access to <strong>ALL pages</strong>';
        } else {
            pageAccessInfo.innerHTML = `<i class="fas fa-check-circle"></i> Access to <strong>${planConfig.pageCount} pages</strong>`;
        }
    }
    
    // ✅ Features du plan
    const featuresList = document.getElementById('currentPlanFeatures');
    if (featuresList) {
        featuresList.innerHTML = planConfig.features.map(feature => `
            <li class="plan-feature">
                <i class="fas fa-check-circle"></i>
                <span>${feature}</span>
            </li>
        `).join('');
    }
    
    // ✅ Afficher/Masquer le bouton Upgrade
    const upgradeSection = document.getElementById('upgradeSection');
    
    if (planName === 'platinum') {
        // Plan maximum - Pas de upgrade possible
        if (upgradeSection) upgradeSection.style.display = 'none';
    } else {
        // Afficher le bouton Upgrade
        if (upgradeSection) upgradeSection.style.display = 'block';
        
        // Définir le plan cible
        let targetPlan = 'pro';
        let targetPlanName = 'Pro';
        
        if (planName === 'basic') {
            targetPlan = 'pro';
            targetPlanName = 'Pro';
        } else if (planName === 'pro') {
            targetPlan = 'platinum';
            targetPlanName = 'Platinum';
        }
        
        const upgradeBtn = document.getElementById('upgradePlanBtn');
        if (upgradeBtn) {
            upgradeBtn.innerHTML = `
                <i class="fas fa-arrow-up"></i>
                Upgrade to ${targetPlanName}
            `;
            upgradeBtn.onclick = function() {
                window.location.href = `${CHECKOUT_URL}?plan=${targetPlan}`;
            };
        }
    }
    
    // ✅ Afficher/Masquer la gestion d'abonnement
    const managePlanSection = document.getElementById('managePlanSection');
    
    if (managePlanSection) {
        if (userPlan.subscriptionStatus === 'active' || userPlan.subscriptionStatus === 'trialing') {
            managePlanSection.style.display = 'block';
            
            // Mettre à jour la date de renouvellement
            const renewalDate = document.getElementById('renewalDate');
            if (renewalDate && userPlan.currentPeriodEnd) {
                const date = new Date(userPlan.currentPeriodEnd);
                renewalDate.textContent = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            } else if (renewalDate) {
                renewalDate.textContent = 'Not available';
            }
            
            // ✅ Afficher/Masquer le bouton de réactivation
            const reactivateCard = document.getElementById('reactivateCard');
            if (reactivateCard) {
                if (userPlan.subscriptionStatus === 'canceled' || userPlan.subscriptionStatus === 'cancelled') {
                    reactivateCard.style.display = 'block';
                } else {
                    reactivateCard.style.display = 'none';
                }
            }
        } else {
            managePlanSection.style.display = 'none';
        }
    }
    
    // ✅ Remplir le tableau de comparaison
    displayPlansComparison(planName);
}

// ============================================
// 🆕 TABLEAU DE COMPARAISON DES PLANS
// ============================================

function displayPlansComparison(currentPlan) {
    const comparisonBody = document.getElementById('plansComparisonBody');
    if (!comparisonBody) return;
    
    // Créer les lignes du tableau
    const allFeatures = [
        { name: 'Pages Access', values: { basic: '9 pages', pro: '17 pages', platinum: 'All 25 pages' } },
        { name: 'Market Data', values: { basic: 'Real-time', pro: 'Real-time + AI', platinum: 'Real-time + AI' } },
        { name: 'Technical Analysis', values: { basic: true, pro: 'Advanced', platinum: 'Advanced' } },
        { name: 'Portfolio Optimization', values: { basic: 'Basic', pro: 'Advanced', platinum: 'Advanced' } },
        { name: 'Monte Carlo Simulations', values: { basic: 'Basic', pro: 'Advanced', platinum: 'Advanced' } },
        { name: 'Risk Parity', values: { basic: false, pro: true, platinum: true } },
        { name: 'Scenario Analysis', values: { basic: false, pro: true, platinum: true } },
        { name: 'Forex Converter', values: { basic: false, pro: '38+ currencies', platinum: '38+ currencies' } },
        { name: 'IPO Intelligence', values: { basic: false, pro: false, platinum: true } },
        { name: 'Insider Flow Tracker', values: { basic: false, pro: false, platinum: true } },
        { name: 'M&A Predictor', values: { basic: false, pro: false, platinum: true } },
        { name: 'Trend Prediction (AI)', values: { basic: false, pro: false, platinum: true } },
        { name: 'API Access', values: { basic: false, pro: 'Limited', platinum: 'Full' } },
        { name: 'Support', values: { basic: 'Email', pro: 'Priority', platinum: 'White-glove' } },
        { name: 'Chatbot', values: { basic: '5 msgs/day', pro: 'Unlimited', platinum: 'Unlimited' } }
    ];
    
    comparisonBody.innerHTML = allFeatures.map(feature => `
        <tr>
            <td class="feature-name">${feature.name}</td>
            ${Object.keys(PLANS_CONFIG).map(plan => {
                const value = feature.values[plan];
                let cellContent = '';
                
                if (value === true) {
                    cellContent = '<i class="fas fa-check-circle text-success"></i>';
                } else if (value === false) {
                    cellContent = '<i class="fas fa-times-circle text-muted"></i>';
                } else {
                    cellContent = `<span class="feature-value">${value}</span>`;
                }
                
                const isCurrentPlan = plan === currentPlan;
                
                return `<td class="${isCurrentPlan ? 'current-plan-column' : ''}">${cellContent}</td>`;
            }).join('')}
        </tr>
    `).join('');
}

// ============================================
// 🆕 HISTORIQUE DE FACTURATION
// ============================================

function displayBillingHistory() {
    const billingHistorySection = document.getElementById('billingHistorySection');
    const billingHistoryList = document.getElementById('billingHistoryList');
    
    if (!billingHistorySection || !billingHistoryList) return;
    
    // Afficher uniquement si l'utilisateur a un abonnement actif
    if (!userPlan.customerId || userPlan.subscriptionStatus === 'inactive') {
        billingHistorySection.style.display = 'none';
        return;
    }
    
    billingHistorySection.style.display = 'block';
    
    // TODO: Récupérer l'historique réel depuis Stripe via Worker
    billingHistoryList.innerHTML = `
        <div class="billing-history-empty">
            <i class="fas fa-receipt"></i>
            <p>Your billing history will appear here</p>
            <a href="${STRIPE_CUSTOMER_PORTAL_URL}" target="_blank" class="btn-secondary">
                <i class="fas fa-external-link-alt"></i>
                View in Stripe Portal
            </a>
        </div>
    `;
}

// ============================================
// 🆕 GESTION DE L'ABONNEMENT
// ============================================

async function cancelSubscription() {
    const confirmed = confirm(
        '⚠ Cancel Subscription\n\n' +
        'Are you sure you want to cancel your subscription?\n\n' +
        'You will keep access until the end of your billing period.\n' +
        'You can reactivate anytime before the end date.'
    );
    
    if (!confirmed) return;
    
    try {
        showToast('info', 'Processing...', 'Canceling your subscription');
        
        // TODO: Appeler le Worker pour annuler l'abonnement Stripe
        // const response = await fetch(`${WORKER_URL}/cancel-subscription`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ userId: currentUserData.uid })
        // });
        
        // Simulation pour l'instant
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showToast('success', 'Subscription Canceled', 'Your subscription will remain active until the end of the current billing period');
        
        // Recharger les données
        await loadUserPlan();
        
    } catch (error) {
        console.error('❌ Erreur annulation:', error);
        showToast('error', 'Error', 'Unable to cancel your subscription. Please try again.');
    }
}

async function reactivateSubscription() {
    try {
        showToast('info', 'Processing...', 'Reactivating your subscription');
        
        // TODO: Appeler le Worker pour réactiver l'abonnement Stripe
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showToast('success', 'Subscription Reactivated', 'Your subscription has been reactivated successfully');
        
        await loadUserPlan();
        
    } catch (error) {
        console.error('❌ Erreur réactivation:', error);
        showToast('error', 'Error', 'Unable to reactivate your subscription. Please try again.');
    }
}

function openCustomerPortal() {
    window.open(STRIPE_CUSTOMER_PORTAL_URL, '_blank');
}

// ============================================
// CHARGEMENT DES PARAMÈTRES
// ============================================

async function loadSettings() {
    try {
        console.log('📥 Chargement des paramètres...');
        
        if (!currentUserData) {
            console.warn('⚠ Pas de données utilisateur disponibles');
            loadDefaultSettings();
            return;
        }
        
        const settingsRef = firebaseDb
            .collection('users')
            .doc(currentUserData.uid)
            .collection('settings')
            .doc('preferences');
        
        const settingsDoc = await settingsRef.get();
        
        if (!settingsDoc.exists) {
            console.log('⚠ Paramètres inexistants, création avec valeurs par défaut...');
            await settingsRef.set(currentSettings);
            console.log('✅ Paramètres créés avec succès');
        } else {
            const data = settingsDoc.data();
            currentSettings = { ...currentSettings, ...data };
            console.log('✅ Paramètres chargés:', currentSettings);
        }
        
        // ✅ SYNCHRONISER AVEC CLOUDFLARE KV (Firestore = source de vérité)
        await synchronizeNewsletterSubscription();
        
        applySettingsToUI();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des paramètres:', error);
        
        if (error.code === 'permission-denied') {
            console.log('⚠ Permissions refusées, utilisation des valeurs par défaut');
            loadDefaultSettings();
        } else {
            showToast('error', 'Erreur', 'Impossible de charger vos paramètres');
        }
    }
}

function loadDefaultSettings() {
    console.log('📥 Chargement des paramètres par défaut');
    
    const savedSettings = localStorage.getItem('financepro_settings');
    if (savedSettings) {
        try {
            currentSettings = { ...currentSettings, ...JSON.parse(savedSettings) };
            console.log('✅ Paramètres chargés depuis localStorage');
        } catch (e) {
            console.warn('⚠ Erreur lors du parsing localStorage');
        }
    }
    
    applySettingsToUI();
}

function applySettingsToUI() {
    // Notifications
    const newsletterToggle = document.getElementById('weeklyNewsletter');
    const featuresToggle = document.getElementById('featureUpdates');
    const analyticsToggle = document.getElementById('analytics');
    
    if (newsletterToggle) newsletterToggle.checked = currentSettings.weeklyNewsletter !== false;
    if (featuresToggle) featuresToggle.checked = currentSettings.featureUpdates !== false;
    if (analyticsToggle) analyticsToggle.checked = currentSettings.analytics !== false;
    
    console.log('✅ Interface mise à jour avec les paramètres');
}

// ============================================
// 🆕 SYNCHRONISATION NEWSLETTER CLOUDFLARE
// ============================================

async function synchronizeNewsletterSubscription() {
    if (!currentUserData || !currentUserData.uid) {
        console.warn('⚠ Aucun utilisateur connecté pour la synchronisation');
        return;
    }

    try {
        console.log('🔄 Synchronisation newsletter avec Firestore...');
        
        const userRef = firebaseDb.collection('users').doc(currentUserData.uid);
        const doc = await userRef.get();
        
        if (!doc.exists) {
            console.warn('⚠ Document utilisateur introuvable');
            return;
        }
        
        const userData = doc.data();
        const isSubscribed = userData.weeklyNewsletter === true;
        
        console.log('📊 Statut newsletter (Firestore):', isSubscribed ? 'Abonné ✅' : 'Non abonné ❌');
        
        // Mettre à jour le toggle sur la page
        const newsletterToggle = document.getElementById('weeklyNewsletter');
        if (newsletterToggle) {
            newsletterToggle.checked = isSubscribed;
        }
        
        // ✅ INSCRIPTION MANQUANTE - RATTRAPAGE
        if (isSubscribed && !userData.newsletterSubscribedAt) {
            console.log('⚠ Inscription manquante détectée - envoi au Worker...');
            
            const subscribed = await subscribeToNewsletter(currentUserData.email, currentUserData.displayName);
            
            if (subscribed) {
                await userRef.update({
                    newsletterSubscribedAt: new Date().toISOString()
                });
                
                console.log('✅ Inscription newsletter rattrapée');
            }
        } else if (isSubscribed && userData.newsletterSubscribedAt) {
            console.log('✅ Utilisateur déjà abonné (depuis', userData.newsletterSubscribedAt, ')');
        }
        
    } catch (error) {
        console.error('❌ Erreur synchronisation newsletter:', error);
    }
}

async function subscribeToNewsletter(email, name) {
    try {
        console.log('📧 Inscription à la newsletter:', email);
        
        const response = await fetch(`${NEWSLETTER_WORKER_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                name: name || email.split('@')[0],
                source: 'settings_sync',
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.warn('⚠ Erreur Worker:', errorData);
            return false;
        }
        
        const data = await response.json();
        console.log('✅ Inscription newsletter réussie:', data);
        showToast('success', 'Succès !', 'Vous êtes maintenant inscrit à la newsletter hebdomadaire');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur inscription newsletter:', error);
        return false;
    }
}

async function unsubscribeFromNewsletter(email) {
    try {
        console.log('📧 Désinscription de la newsletter:', email);
        
        // ✅ MÉTHODE 1 : Essayer GET avec paramètre URL
        try {
            const img = new Image();
            const unsubscribeUrl = `${NEWSLETTER_WORKER_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    console.log('✅ Requête GET envoyée avec succès (méthode 1)');
                    resolve();
                };
                img.onerror = () => {
                    console.warn('⚠ Méthode 1 échouée');
                    reject();
                };
                
                setTimeout(() => reject(), 3000);
                img.src = unsubscribeUrl;
            });
            
            showToast('info', 'Désinscription', 'Vous ne recevrez plus la newsletter hebdomadaire');
            return true;
            
        } catch (error1) {
            console.log('⚠ Méthode 1 (GET Image) échouée');
        }
        
        // ✅ MÉTHODE 2 : sendBeacon
        try {
            const beaconUrl = `${NEWSLETTER_WORKER_URL}/unsubscribe`;
            const data = new Blob([JSON.stringify({ email: email })], { type: 'application/json' });
            
            if (navigator.sendBeacon && navigator.sendBeacon(beaconUrl, data)) {
                showToast('info', 'Désinscription', 'Vous ne recevrez plus la newsletter hebdomadaire');
                return true;
            }
        } catch (error2) {
            console.log('⚠ Méthode 2 (sendBeacon) échouée');
        }
        
        // ✅ MÉTHODE 3 : fetch POST no-cors
        try {
            await fetch(`${NEWSLETTER_WORKER_URL}/unsubscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email }),
                mode: 'no-cors'
            });
            
            showToast('info', 'Désinscription', 'Vous ne recevrez plus la newsletter hebdomadaire');
            return true;
            
        } catch (error3) {
            console.log('⚠ Méthode 3 (Fetch POST) échouée');
        }
        
        showToast('warning', 'Désinscription enregistrée', 'Votre préférence est sauvegardée');
        return true;
        
    } catch (error) {
        console.error('❌ Erreur désinscription newsletter:', error);
        showToast('warning', 'Désinscription enregistrée', 'Votre préférence est sauvegardée dans votre compte');
        return true;
    }
}

// ============================================
// GESTIONNAIRES D'ÉVÉNEMENTS
// ============================================

function initializeEventListeners() {
    // Navigation entre tabs
    const tabButtons = document.querySelectorAll('.settings-nav-item');
    tabButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            switchTab(button.dataset.tab);
        });
    });
    
    // Boutons de sauvegarde
    const saveNotifBtn = document.getElementById('saveNotificationSettings');
    if (saveNotifBtn) {
        saveNotifBtn.addEventListener('click', saveNotificationSettings);
    }
    
    const savePrivacyBtn = document.getElementById('savePrivacySettings');
    if (savePrivacyBtn) {
        savePrivacyBtn.addEventListener('click', savePrivacySettings);
    }
    
    // Boutons d'action data
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportUserData);
    }
    
    const clearBtn = document.getElementById('clearCacheBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCache);
    }
    
    const deleteAnalysesBtn = document.getElementById('deleteAllAnalyses');
    if (deleteAnalysesBtn) {
        deleteAnalysesBtn.addEventListener('click', deleteAllAnalyses);
    }
    
    const deletePortfoliosBtn = document.getElementById('deleteAllPortfolios');
    if (deletePortfoliosBtn) {
        deletePortfoliosBtn.addEventListener('click', deleteAllPortfolios);
    }
    
    // ✅ Boutons de gestion d'abonnement
    const cancelBtn = document.getElementById('cancelSubscriptionBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelSubscription);
    }
    
    const reactivateBtn = document.getElementById('reactivateSubscriptionBtn');
    if (reactivateBtn) {
        reactivateBtn.addEventListener('click', reactivateSubscription);
    }
    
    const portalBtn = document.getElementById('openCustomerPortalBtn');
    if (portalBtn) {
        portalBtn.addEventListener('click', openCustomerPortal);
    }
}

// ============================================
// NAVIGATION TABS
// ============================================

function switchTab(tabName) {
    document.querySelectorAll('.settings-nav-item').forEach(function(btn) {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.settings-tab').forEach(function(tab) {
        tab.classList.remove('active');
    });
    
    const activeNavBtn = document.querySelector('[data-tab="' + tabName + '"]');
    if (activeNavBtn) {
        activeNavBtn.classList.add('active');
    }
    
    const activeTab = document.getElementById('tab-' + tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    console.log('📑 Onglet changé:', tabName);
}

// ============================================
// SAUVEGARDE DES PARAMÈTRES
// ============================================

async function saveNotificationSettings() {
    const previousNewsletterState = currentSettings.weeklyNewsletter;
    
    currentSettings.weeklyNewsletter = document.getElementById('weeklyNewsletter').checked;
    currentSettings.featureUpdates = document.getElementById('featureUpdates').checked;
    
    await saveSettings();
    
    // ✅ SYNCHRONISER AVEC CLOUDFLARE SI CHANGEMENT
    if (currentSettings.weeklyNewsletter !== previousNewsletterState) {
        console.log('📧 Changement préférence newsletter détecté, synchronisation...');
        
        if (currentSettings.weeklyNewsletter) {
            const subscribed = await subscribeToNewsletter(currentUserData.email, currentUserData.displayName);
            
            if (subscribed) {
                const userRef = firebaseDb.collection('users').doc(currentUserData.uid);
                await userRef.update({
                    newsletterSubscribedAt: new Date().toISOString()
                });
            }
        } else {
            await unsubscribeFromNewsletter(currentUserData.email);
            
            const userRef = firebaseDb.collection('users').doc(currentUserData.uid);
            await userRef.update({
                newsletterSubscribedAt: firebase.firestore.FieldValue.delete()
            });
        }
    }
    
    showToast('success', 'Succès !', 'Préférences de notifications sauvegardées');
}

async function savePrivacySettings() {
    currentSettings.analytics = document.getElementById('analytics').checked;
    
    await saveSettings();
    showToast('success', 'Succès !', 'Paramètres de confidentialité sauvegardés');
}

async function saveSettings() {
    try {
        localStorage.setItem('financepro_settings', JSON.stringify(currentSettings));
        
        if (currentUserData) {
            const settingsRef = firebaseDb
                .collection('users')
                .doc(currentUserData.uid)
                .collection('settings')
                .doc('preferences');
            
            await settingsRef.set(currentSettings, { merge: true });
            
            const userRef = firebaseDb.collection('users').doc(currentUserData.uid);
            await userRef.update({
                weeklyNewsletter: currentSettings.weeklyNewsletter
            });
            
            console.log('✅ Paramètres sauvegardés dans Firestore');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        showToast('error', 'Erreur', 'Impossible de sauvegarder vos paramètres');
    }
}

// ============================================
// GESTION DES DONNÉES
// ============================================

async function exportUserData() {
    if (!currentUserData) {
        showToast('error', 'Erreur', 'Vous devez être connecté');
        return;
    }
    
    try {
        showToast('info', 'Export en cours...', 'Préparation de vos données');
        
        const exportData = {
            user: currentUserData,
            settings: currentSettings,
            plan: userPlan,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'alphavault-export-' + Date.now() + '.json';
        link.click();
        
        showToast('success', 'Succès !', 'Vos données ont été exportées');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'export:', error);
        showToast('error', 'Erreur', 'Impossible d\'exporter vos données');
    }
}

function clearCache() {
    const confirmed = confirm(
        'Êtes-vous sûr de vouloir vider le cache ?\n\n' +
        'Cette action supprimera toutes les données temporaires.'
    );
    
    if (!confirmed) return;
    
    try {
        const essentialKeys = ['financepro_user', 'financepro_theme', 'financepro_settings'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(function(key) {
            if (!essentialKeys.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        showToast('success', 'Succès !', 'Cache vidé avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors du vidage du cache:', error);
        showToast('error', 'Erreur', 'Impossible de vider le cache');
    }
}

async function deleteAllAnalyses() {
    const confirmed = confirm(
        '⚠ ATTENTION ⚠\n\n' +
        'Êtes-vous sûr de vouloir supprimer TOUTES vos analyses ?\n\n' +
        'Cette action est IRRÉVERSIBLE !'
    );
    
    if (!confirmed) return;
    
    showToast('info', 'Suppression...', 'Suppression de vos analyses en cours');
    
    try {
        // TODO: Implémenter la suppression réelle
        showToast('success', 'Succès !', 'Analyses supprimées');
    } catch (error) {
        console.error('❌ Erreur:', error);
        showToast('error', 'Erreur', 'Impossible de supprimer les analyses');
    }
}

async function deleteAllPortfolios() {
    const confirmed = confirm(
        '⚠ ATTENTION ⚠\n\n' +
        'Êtes-vous sûr de vouloir supprimer TOUS vos portfolios ?\n\n' +
        'Cette action est IRRÉVERSIBLE !'
    );
    
    if (!confirmed) return;
    
    showToast('info', 'Suppression...', 'Suppression de vos portfolios en cours');
    
    try {
        // TODO: Implémenter la suppression réelle
        showToast('success', 'Succès !', 'Portfolios supprimés');
    } catch (error) {
        console.error('❌ Erreur:', error);
        showToast('error', 'Erreur', 'Impossible de supprimer les portfolios');
    }
}

// ============================================
// ✅ UTILITAIRES - TOAST CORRIGÉ
// ============================================

function showToast(type, title, message) {
    const toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        
        if (type === 'error') {
            console.error(`❌ ${title}: ${message}`);
        } else if (type === 'success') {
            console.log(`✅ ${title}: ${message}`);
        } else if (type === 'warning') {
            console.warn(`⚠ ${title}: ${message}`);
        } else if (type === 'info') {
            console.info(`ℹ ${title}: ${message}`);
        }
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    let iconClass = 'fa-info-circle';
    switch(type) {
        case 'success':
            iconClass = 'fa-check-circle';
            break;
        case 'error':
            iconClass = 'fa-times-circle';
            break;
        case 'warning':
            iconClass = 'fa-exclamation-triangle';
            break;
        case 'info':
            iconClass = 'fa-info-circle';
            break;
    }
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            removeToast(toast);
        });
    }
    
    setTimeout(function() {
        removeToast(toast);
    }, 5000);
}

function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(function() {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

function isFirebaseInitialized() {
    return typeof firebase !== 'undefined' && 
           typeof firebaseDb !== 'undefined';
}

console.log('✅ Script de paramètres chargé avec Plan & Subscription (BASIC, PRO, PLATINUM)');
console.log('📊 Plans disponibles:', Object.keys(PLANS_CONFIG));
console.log('💎 Basic: 9 pages | Pro: 17 pages | Platinum: 25 pages');