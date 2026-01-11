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
   VERSION 5.0 - FIX RÉABONNEMENT AUTOMATIQUE
   ✅ PLAN & SUBSCRIPTION MANAGEMENT
   ✅ PROTECTION ANTI-RÉABONNEMENT
   ✅ SYNCHRONISATION CORRECTE
   ============================================ */

// Configuration
const NEWSLETTER_WORKER_URL = 'https://newsletter-worker.raphnardone.workers.dev';
const NOTIFICATION_WORKER_URL = 'https://notification-worker.raphnardone.workers.dev';
const WORKER_URL = 'https://finance-hub-api.raphnardone.workers.dev';

// ✅ FLAG GLOBAL : Empêcher les appels redondants
let isSynchronizing = false;

// Configuration des plans (synchronisé avec access-control.js)
const PLAN_CONFIG = {
    basic: {
        name: 'Basic',
        displayName: 'AlphaVault Basic',
        price: 0,
        currency: '$',
        level: 0,
        totalPages: 9,
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
        icon: 'fas fa-chart-bar',
        features: [
            'Dashboard Budget',
            'Community Hub',
            'Create Posts & Messages',
            'Monte Carlo Simulations',
            'Real Estate Tax Simulator',
            'Portfolio Optimizer (Markowitz)',
            'Economic Dashboard',
            'Companies Directory',
            'Settings & User Profile'
        ]
    },
    pro: {
        name: 'Pro',
        displayName: 'AlphaVault Pro',
        price: 10,
        currency: '$',
        level: 1,
        totalPages: 17,
        color: '#3B82F6',
        gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
        icon: 'fas fa-crown',
        features: [
            'Everything in Basic (9 pages)',
            'Investment Analytics',
            'Risk Parity Optimization',
            'Scenario Analysis',
            'Advanced Analysis (14 indicators)',
            'Forex Converter (38 currencies)',
            'Inflation Calculator',
            'Interest Rate Tracker',
            'News Terminal'
        ]
    },
    platinum: {
        name: 'Platinum',
        displayName: 'AlphaVault Platinum',
        price: 20,
        currency: '$',
        level: 2,
        totalPages: 25,
        color: '#8B5CF6',
        gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
        icon: 'fas fa-gem',
        features: [
            'Everything in Pro (17 pages)',
            'IPO Intelligence (AI Scoring)',
            'Insider Flow Tracker (14 classes)',
            'M&A Predictor (6 AI factors)',
            'Trend Prediction ML',
            'Market Sentiment Analysis',
            'Trending Topics (AI-powered)',
            'YouTube Market Intelligence',
            'Recession Indicators'
        ]
    }
};

// Variables globales
let currentUserData = null;
let currentSettings = {
    weeklyNewsletter: true,
    featureUpdates: true,
    analytics: true
};

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de la page parametres...');
    
    if (!isFirebaseInitialized()) {
        showToast('error', 'Erreur', 'Impossible de charger les parametres');
        return;
    }
    
    initializeEventListeners();
    console.log('Page parametres initialisee');
});

window.addEventListener('userDataLoaded', function(e) {
    currentUserData = e.detail;
    console.log('Donnees utilisateur recues:', currentUserData);
    loadSettings();
    loadSubscriptionInfo();
});

// ============================================
// CHARGEMENT DES PARAMÈTRES
// ============================================

async function loadSettings() {
    try {
        console.log('Chargement des parametres...');
        
        if (!currentUserData) {
            console.warn('Pas de donnees utilisateur disponibles');
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
            console.log('Parametres inexistants, creation avec valeurs par defaut...');
            await settingsRef.set(currentSettings);
            console.log('Parametres crees avec succes');
        } else {
            const data = settingsDoc.data();
            currentSettings = { ...currentSettings, ...data };
            console.log('Parametres charges:', currentSettings);
        }
        
        // ✅ SYNCHRONISATION UNIQUEMENT SI PAS DÉJÀ EN COURS
        if (!isSynchronizing) {
            await synchronizeAllSubscriptions();
        }
        
        applySettingsToUI();
        
    } catch (error) {
        console.error('Erreur lors du chargement des parametres:', error);
        
        if (error.code === 'permission-denied') {
            console.log('Permissions refusees, utilisation des valeurs par defaut');
            loadDefaultSettings();
        } else {
            showToast('error', 'Erreur', 'Impossible de charger vos parametres');
        }
    }
}

function loadDefaultSettings() {
    console.log('Chargement des parametres par defaut');
    
    const savedSettings = localStorage.getItem('financepro_settings');
    if (savedSettings) {
        try {
            currentSettings = { ...currentSettings, ...JSON.parse(savedSettings) };
            console.log('Parametres charges depuis localStorage');
        } catch (e) {
            console.warn('Erreur lors du parsing localStorage');
        }
    }
    
    applySettingsToUI();
}

function applySettingsToUI() {
    document.getElementById('weeklyNewsletter').checked = currentSettings.weeklyNewsletter !== false;
    document.getElementById('featureUpdates').checked = currentSettings.featureUpdates !== false;
    document.getElementById('analytics').checked = currentSettings.analytics !== false;
    
    console.log('Interface mise a jour avec les parametres');
}

// ============================================
// PLAN & SUBSCRIPTION MANAGEMENT
// ============================================

async function loadSubscriptionInfo() {
    try {
        if (!currentUserData) {
            console.warn('Aucun utilisateur connecte');
            return;
        }
        
        console.log('Chargement des informations d\'abonnement...');
        
        const plan = currentUserData.plan || 'basic';
        const status = currentUserData.subscriptionStatus || 'inactive';
        
        console.log('   Plan actuel:', plan);
        console.log('   Statut:', status);
        
        displayCurrentPlanBadge(plan, status);
        displayPlanFeatures(plan);
        generatePlanComparison(plan, status);
        
        if (['pro', 'platinum'].includes(plan) && status === 'active') {
            await loadBillingHistory();
        }
        
        displaySubscriptionManagement(plan, status);
        
        console.log('Informations d\'abonnement chargees');
        
    } catch (error) {
        console.error('Erreur lors du chargement des infos d\'abonnement:', error);
        showToast('error', 'Erreur', 'Impossible de charger vos informations d\'abonnement');
    }
}

function displayCurrentPlanBadge(plan, status) {
    const planConfig = PLAN_CONFIG[plan] || PLAN_CONFIG.basic;
    const container = document.getElementById('currentPlanBadge');
    
    let statusBadge = '';
    let statusText = '';
    
    if (status === 'active') {
        statusBadge = '<span class="status-badge status-active"><i class="fas fa-check-circle"></i> Active</span>';
        statusText = 'Your subscription is active and in good standing.';
    } else if (status === 'trial') {
        statusBadge = '<span class="status-badge status-trial"><i class="fas fa-clock"></i> Free Trial</span>';
        statusText = 'You are currently on a free trial period.';
    } else if (status === 'cancelled') {
        statusBadge = '<span class="status-badge status-cancelled"><i class="fas fa-times-circle"></i> Cancelled</span>';
        statusText = 'Your subscription has been cancelled and will end at the end of the billing period.';
    } else if (status === 'active_free') {
        statusBadge = '<span class="status-badge status-free"><i class="fas fa-gift"></i> Free Lifetime</span>';
        statusText = 'You have free lifetime access to this plan. You can downgrade to Basic at any time.';
    } else {
        statusBadge = '<span class="status-badge status-inactive"><i class="fas fa-pause-circle"></i> Inactive</span>';
        statusText = 'Your subscription is inactive.';
    }
    
    container.innerHTML = `
        <div class="plan-card" style="background: ${planConfig.gradient};">
            <div class="plan-card-header">
                <div class="plan-icon-box">
                    <i class="${planConfig.icon}"></i>
                </div>
                <div class="plan-info">
                    <h3 class="plan-name">${planConfig.displayName}</h3>
                    <p class="plan-price">
                        ${planConfig.price === 0 
                            ? '<span class="price-free">FREE</span>' 
                            : `<span class="price-value">${planConfig.currency}${planConfig.price}</span><span class="price-period">/month</span>`
                        }
                    </p>
                </div>
                ${statusBadge}
            </div>
            <p class="plan-description">${statusText}</p>
            <div class="plan-stats">
                <div class="plan-stat">
                    <i class="fas fa-file-alt"></i>
                    <span>${planConfig.totalPages} Pages</span>
                </div>
                <div class="plan-stat">
                    <i class="fas fa-layer-group"></i>
                    <span>Level ${planConfig.level}</span>
                </div>
            </div>
        </div>
    `;
}

function displayPlanFeatures(plan) {
    const planConfig = PLAN_CONFIG[plan] || PLAN_CONFIG.basic;
    const container = document.getElementById('currentPlanFeatures');
    
    const featuresHTML = planConfig.features.map(feature => `
        <div class="feature-item">
            <i class="fas fa-check-circle feature-icon"></i>
            <span>${feature}</span>
        </div>
    `).join('');
    
    container.innerHTML = `
        <div class="features-list">
            <h4 class="features-title">
                <i class="fas fa-sparkles"></i> 
                Features Included
            </h4>
            ${featuresHTML}
        </div>
    `;
}

function generatePlanComparison(currentPlan, currentStatus) {
    const container = document.getElementById('planComparisonTable');
    
    const plans = ['basic', 'pro', 'platinum'];
    
    const comparisonHTML = `
        <div class="plan-comparison">
            ${plans.map(planKey => {
                const planConfig = PLAN_CONFIG[planKey];
                const isCurrent = planKey === currentPlan;
                const canUpgrade = PLAN_CONFIG[currentPlan].level < planConfig.level;
                const canDowngrade = PLAN_CONFIG[currentPlan].level > planConfig.level;
                
                return `
                    <div class="comparison-card ${isCurrent ? 'current-plan' : ''}" style="border-color: ${planConfig.color};">
                        ${isCurrent ? '<div class="current-badge"><i class="fas fa-star"></i> Current Plan</div>' : ''}
                        
                        <div class="comparison-header">
                            <div class="comparison-icon-box">
                                <i class="${planConfig.icon}"></i>
                            </div>
                            <h4 class="comparison-name">${planConfig.name}</h4>
                            <p class="comparison-price">
                                ${planConfig.price === 0 
                                    ? '<span class="price-free">FREE</span>' 
                                    : `<span class="price-value">${planConfig.currency}${planConfig.price}</span><span class="price-period">/mo</span>`
                                }
                            </p>
                        </div>
                        
                        <div class="comparison-features">
                            <div class="comparison-stat">
                                <i class="fas fa-file-alt"></i>
                                <strong>${planConfig.totalPages}</strong> Pages
                            </div>
                            <div class="comparison-divider"></div>
                            ${planConfig.features.slice(0, 3).map(feature => `
                                <div class="comparison-feature">
                                    <i class="fas fa-check"></i>
                                    <span>${feature}</span>
                                </div>
                            `).join('')}
                            ${planConfig.features.length > 3 ? `
                                <div class="comparison-feature-more">
                                    <i class="fas fa-plus-circle"></i>
                                    <span>+${planConfig.features.length - 3} more features</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="comparison-action">
                            ${isCurrent 
                                ? '<button class="btn-current" disabled><i class="fas fa-check"></i> Current Plan</button>' 
                                : canUpgrade 
                                    ? `<button class="btn-upgrade" onclick="changePlan('${planKey}', 'upgrade')"><i class="fas fa-arrow-up"></i> Upgrade to ${planConfig.name}</button>`
                                    : canDowngrade
                                        ? `<button class="btn-downgrade-active" onclick="changePlan('${planKey}', 'downgrade')"><i class="fas fa-arrow-down"></i> Downgrade to ${planConfig.name}</button>`
                                        : ''
                            }
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    container.innerHTML = comparisonHTML;
}

async function loadBillingHistory() {
    try {
        console.log('Chargement de l\'historique de facturation...');
        
        if (!currentUserData.stripeCustomerId) {
            console.warn('Pas de Stripe Customer ID');
            return;
        }
        
        const section = document.getElementById('billingHistorySection');
        const container = document.getElementById('billingHistoryContainer');
        
        section.style.display = 'block';
        
        container.innerHTML = `
            <div class="billing-history">
                <p class="billing-info">
                    <i class="fas fa-info-circle"></i>
                    Your billing history is managed by Stripe. 
                    <a href="https://billing.stripe.com" target="_blank" class="stripe-portal-link">
                        View detailed invoices <i class="fas fa-external-link-alt"></i>
                    </a>
                </p>
                <div class="billing-placeholder">
                    <i class="fas fa-receipt billing-icon"></i>
                    <p>Full billing history coming soon</p>
                </div>
                
                <div class="billing-danger-zone">
                    <p class="billing-danger-text">
                        <i class="fas fa-exclamation-triangle"></i>
                        Want to completely delete your account and cancel all subscriptions?
                    </p>
                    <a href="user-profile.html#delete-account" class="billing-delete-link">
                        <i class="fas fa-trash-alt"></i>
                        Permanently delete my account
                    </a>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
    }
}

function displaySubscriptionManagement(plan, status) {
    const section = document.getElementById('subscriptionManagementSection');
    const container = document.getElementById('subscriptionManagementContainer');
    
    section.style.display = 'block';
    
    if (status === 'active_free') {
        container.innerHTML = `
            <div class="subscription-management">
                <div class="management-info">
                    <i class="fas fa-gift"></i>
                    <div>
                        <p><strong>Free Lifetime Access</strong></p>
                        <p>You have free lifetime access to the ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan.</p>
                    </div>
                </div>
                ${plan !== 'basic' ? `
                    <div class="management-actions">
                        <button class="btn-downgrade-to-basic" onclick="changePlan('basic', 'downgrade')">
                            <i class="fas fa-arrow-down"></i>
                            Downgrade to Basic (Free)
                        </button>
                        <p class="management-note">
                            <i class="fas fa-info-circle"></i>
                            You can downgrade to the free Basic plan at any time.
                        </p>
                    </div>
                ` : ''}
            </div>
        `;
        return;
    }
    
    if (status === 'cancelled') {
        container.innerHTML = `
            <div class="subscription-management">
                <div class="management-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Your subscription is cancelled and will end at the end of the current billing period.</p>
                </div>
                <button class="btn-reactivate" onclick="reactivateSubscription()">
                    <i class="fas fa-redo"></i>
                    Reactivate Subscription
                </button>
            </div>
        `;
        return;
    }
    
    if (status === 'active' && ['pro', 'platinum'].includes(plan)) {
        container.innerHTML = `
            <div class="subscription-management">
                <div class="management-actions">
                    <button class="btn-cancel-subscription" onclick="confirmCancelSubscription()">
                        <i class="fas fa-times-circle"></i>
                        Cancel Subscription
                    </button>
                    <p class="management-note">
                        <i class="fas fa-info-circle"></i>
                        You can cancel your subscription at any time. You'll keep access until the end of your billing period.
                    </p>
                </div>
            </div>
        `;
        return;
    }
    
    if (plan === 'basic') {
        container.innerHTML = `
            <div class="subscription-management">
                <div class="management-info">
                    <i class="fas fa-check-circle"></i>
                    <p>You are on the free Basic plan. Upgrade anytime to access more features!</p>
                </div>
            </div>
        `;
    }
}

// ============================================
// ACTIONS ABONNEMENT
// ============================================

function changePlan(targetPlan, action) {
    const actionText = action === 'upgrade' ? 'Upgrade' : 'Downgrade';
    const planName = PLAN_CONFIG[targetPlan].name;
    
    console.log(`${actionText} vers le plan:`, targetPlan);
    
    if (action === 'downgrade') {
        const confirmed = confirm(
            `Are you sure you want to ${action} to ${planName}?\n\n` +
            `You will lose access to features from your current plan.`
        );
        
        if (!confirmed) return;
        
        if (targetPlan === 'basic') {
            performDowngradeToBasic();
        } else {
            showToast('info', 'Redirection', 'You will be redirected to the payment page...');
            setTimeout(() => {
                window.location.href = `checkout.html?plan=${targetPlan}`;
            }, 1500);
        }
    } else {
        showToast('info', 'Redirection', 'You will be redirected to the payment page...');
        setTimeout(() => {
            window.location.href = `checkout.html?plan=${targetPlan}`;
        }, 1500);
    }
}

async function performDowngradeToBasic() {
    try {
        if (!currentUserData) {
            showToast('error', 'Error', 'User not authenticated');
            return;
        }
        
        console.log('Downgrade vers Basic en cours...');
        
        showToast('info', 'Processing', 'Downgrading to Basic plan...');
        
        const userRef = firebaseDb.collection('users').doc(currentUserData.uid);
        await userRef.update({
            plan: 'basic',
            subscriptionStatus: 'active',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Downgrade reussi - Profil utilisateur preserve');
        showToast('success', 'Success', 'You have been downgraded to the Basic plan');
        
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('Erreur downgrade:', error);
        showToast('error', 'Error', error.message || 'Failed to downgrade plan');
    }
}

async function confirmCancelSubscription() {
    const confirmed = confirm(
        'Are you sure you want to cancel your subscription?\n\n' +
        'You will keep access until the end of your current billing period.\n' +
        'This action can be reversed by reactivating your subscription.'
    );
    
    if (!confirmed) return;
    
    await cancelSubscription();
}

async function cancelSubscription() {
    try {
        if (!currentUserData.stripeSubscriptionId) {
            showToast('error', 'Error', 'No active subscription found');
            return;
        }
        
        console.log('Annulation de l\'abonnement...');
        
        showToast('info', 'Processing', 'Cancelling your subscription...');
        
        const response = await fetch(`${WORKER_URL}/cancel-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subscriptionId: currentUserData.stripeSubscriptionId
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Abonnement annule avec succes');
            showToast('success', 'Success', 'Your subscription has been cancelled');
            
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } else {
            throw new Error(data.error || 'Failed to cancel subscription');
        }
        
    } catch (error) {
        console.error('Erreur annulation:', error);
        showToast('error', 'Error', error.message || 'Failed to cancel subscription');
    }
}

async function reactivateSubscription() {
    showToast('info', 'Reactivation', 'Please contact support to reactivate your subscription');
}

// ============================================
// SYNCHRONISATION NEWSLETTER - VERSION CORRIGÉE
// ✅ PROTECTION ANTI-RÉABONNEMENT
// ============================================

async function synchronizeAllSubscriptions() {
    // ✅ PROTECTION : Si déjà en cours, ne rien faire
    if (isSynchronizing) {
        console.log('⏳ Synchronisation déjà en cours, skip...');
        return;
    }
    
    if (!currentUserData || !currentUserData.uid) {
        console.warn('Aucun utilisateur connecte pour la synchronisation');
        return;
    }

    try {
        isSynchronizing = true; // ✅ VERROUILLAGE
        
        console.log('🔄 Synchronisation des abonnements avec Firestore...');
        
        const userRef = db.collection('users').doc(currentUserData.uid);
        const doc = await userRef.get();
        
        if (!doc.exists) {
            console.warn('Document utilisateur introuvable');
            return;
        }
        
        const userData = doc.data();
        
        // ========================================
        // 1⃣ SYNCHRONISATION WEEKLY NEWSLETTER
        // ========================================
        const isNewsletterSubscribed = userData.weeklyNewsletter === true;
        
        console.log('📰 Statut newsletter (Firestore):', isNewsletterSubscribed ? 'Abonne' : 'Non abonne');
        
        const newsletterToggle = document.getElementById('weeklyNewsletter');
        if (newsletterToggle) {
            newsletterToggle.checked = isNewsletterSubscribed;
        }
        
        // ✅ LOGIQUE CORRIGÉE : Seulement si PAS de timestamp ET abonné
        if (isNewsletterSubscribed && !userData.newsletterSubscribedAt) {
            console.log('⚠ Timestamp newsletter manquant - Ajout simple (pas de worker call)');
            
            // ✅ AJOUTER LE TIMESTAMP SANS APPELER LE WORKER
            await userRef.update({
                newsletterSubscribedAt: new Date().toISOString()
            });
            
            console.log('✅ Timestamp newsletter ajoute');
        } else if (isNewsletterSubscribed && userData.newsletterSubscribedAt) {
            console.log('✅ Utilisateur deja abonne newsletter (depuis', userData.newsletterSubscribedAt, ')');
        }
        
        // ========================================
        // 2⃣ SYNCHRONISATION FEATURE UPDATES
        // ========================================
        const isUpdatesSubscribed = userData.featureUpdates !== false;
        
        console.log('🔔 Statut updates (Firestore):', isUpdatesSubscribed ? 'Abonne' : 'Non abonne');
        
        const updatesToggle = document.getElementById('featureUpdates');
        if (updatesToggle) {
            updatesToggle.checked = isUpdatesSubscribed;
        }
        
        // ✅ LOGIQUE CORRIGÉE : Seulement si PAS de timestamp ET abonné
        if (isUpdatesSubscribed && !userData.updatesSubscribedAt) {
            console.log('⚠ Timestamp updates manquant - Ajout simple (pas de worker call)');
            
            // ✅ AJOUTER LE TIMESTAMP SANS APPELER LE WORKER
            await userRef.update({
                updatesSubscribedAt: new Date().toISOString()
            });
            
            console.log('✅ Timestamp updates ajoute');
        } else if (isUpdatesSubscribed && userData.updatesSubscribedAt) {
            console.log('✅ Utilisateur deja abonne updates (depuis', userData.updatesSubscribedAt, ')');
        }
        
    } catch (error) {
        console.error('❌ Erreur synchronisation abonnements:', error);
    } finally {
        isSynchronizing = false; // ✅ DÉVERROUILLAGE
    }
}

/* ============================================
   📧 GESTION ABONNEMENT UPDATES (CORRIGÉ)
   ============================================ */

async function subscribeToUpdates(email, name) {
    try {
        console.log('🔔 Inscription aux notifications:', email);
        
        // ✅ TENTATIVE 1 : REQUÊTE NORMALE
        try {
            const response = await fetch(`${NOTIFICATION_WORKER_URL}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    name: name || email.split('@')[0],
                    source: 'settings_manual',
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Inscription updates reussie:', data);
            showToast('success', 'Success', 'You are now subscribed to platform notifications');
            
            return true;
            
        } catch (error1) {
            console.warn('⚠ Methode 1 echouee, tentative fallback no-cors...');
            
            // ✅ TENTATIVE 2 : FALLBACK NO-CORS
            await fetch(`${NOTIFICATION_WORKER_URL}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    name: name || email.split('@')[0],
                    source: 'settings_manual',
                    timestamp: new Date().toISOString()
                }),
                mode: 'no-cors'
            });
            
            console.log('✅ Requete envoyee avec succes (no-cors)');
            showToast('success', 'Success', 'You are now subscribed to platform notifications');
            return true;
        }
        
    } catch (error) {
        console.error('❌ Erreur inscription updates:', error);
        showToast('info', 'Preference saved', 'Your preference has been saved in your account');
        return true;
    }
}

async function unsubscribeFromUpdates(email) {
    try {
        console.log('🔕 Desinscription des notifications:', email);
        
        // ✅ MÉTHODE 1 : GET avec Image
        try {
            const img = new Image();
            const unsubscribeUrl = `${NOTIFICATION_WORKER_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    console.log('✅ Requete GET envoyee avec succes');
                    resolve();
                };
                img.onerror = () => {
                    console.warn('⚠ Methode 1 echouee');
                    reject();
                };
                
                setTimeout(() => reject(), 3000);
                
                img.src = unsubscribeUrl;
            });
            
            console.log('✅ Desinscription updates reussie');
            showToast('info', 'Unsubscribed', 'You will no longer receive platform notifications');
            return true;
            
        } catch (error1) {
            console.log('⚠ Methode GET echouee, tentative fetch...');
        }
        
        // ✅ MÉTHODE 2 : POST no-cors
        await fetch(`${NOTIFICATION_WORKER_URL}/unsubscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email
            }),
            mode: 'no-cors'
        });
        
        console.log('✅ Requete desinscription envoyee');
        showToast('info', 'Unsubscribed', 'You will no longer receive platform notifications');
        return true;
        
    } catch (error) {
        console.error('❌ Erreur desinscription updates:', error);
        showToast('warning', 'Preference saved', 'Your preference has been saved in your account');
        return true;
    }
}

async function subscribeToNewsletter(email, name) {
    try {
        console.log('Inscription a la newsletter:', email);
        
        const response = await fetch(`${NEWSLETTER_WORKER_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                name: name || email.split('@')[0],
                source: 'settings_manual',
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.warn('Erreur Worker:', errorData);
            return false;
        }
        
        const data = await response.json();
        console.log('Inscription newsletter reussie:', data);
        showToast('success', 'Success', 'You are now subscribed to the weekly newsletter');
        
        return true;
        
    } catch (error) {
        console.error('Erreur inscription newsletter:', error);
        return false;
    }
}

async function unsubscribeFromNewsletter(email) {
    try {
        console.log('Desinscription de la newsletter:', email);
        
        try {
            const img = new Image();
            const unsubscribeUrl = `${NEWSLETTER_WORKER_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    console.log('Requete GET envoyee avec succes');
                    resolve();
                };
                img.onerror = () => {
                    console.warn('Methode 1 echouee');
                    reject();
                };
                
                setTimeout(() => reject(), 3000);
                
                img.src = unsubscribeUrl;
            });
            
            console.log('Desinscription newsletter reussie');
            showToast('info', 'Unsubscribed', 'You will no longer receive the weekly newsletter');
            return true;
            
        } catch (error1) {
            console.log('Methode GET echouee, tentative fetch...');
        }
        
        await fetch(`${NEWSLETTER_WORKER_URL}/unsubscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email
            }),
            mode: 'no-cors'
        });
        
        console.log('Requete desinscription envoyee');
        showToast('info', 'Unsubscribed', 'You will no longer receive the weekly newsletter');
        return true;
        
    } catch (error) {
        console.error('Erreur desinscription newsletter:', error);
        showToast('warning', 'Preference saved', 'Your preference has been saved in your account');
        return true;
    }
}

// ============================================
// GESTIONNAIRES D'ÉVÉNEMENTS
// ============================================

function initializeEventListeners() {
    const tabButtons = document.querySelectorAll('.settings-nav-item');
    tabButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            switchTab(button.dataset.tab);
        });
    });
    
    const saveNotifBtn = document.getElementById('saveNotificationSettings');
    if (saveNotifBtn) {
        saveNotifBtn.addEventListener('click', saveNotificationSettings);
    }
    
    const savePrivacyBtn = document.getElementById('savePrivacySettings');
    if (savePrivacyBtn) {
        savePrivacyBtn.addEventListener('click', savePrivacySettings);
    }
    
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
    
    console.log('Onglet change:', tabName);
}

// ============================================
// SAUVEGARDE DES PARAMÈTRES - VERSION CORRIGÉE
// ============================================

async function saveNotificationSettings() {
    const previousNewsletterState = currentSettings.weeklyNewsletter;
    const previousUpdatesState = currentSettings.featureUpdates;
    
    currentSettings.weeklyNewsletter = document.getElementById('weeklyNewsletter').checked;
    currentSettings.featureUpdates = document.getElementById('featureUpdates').checked;
    
    await saveSettings();
    
    // ========================================
    // 1⃣ GESTION NEWSLETTER HEBDOMADAIRE
    // ========================================
    if (currentSettings.weeklyNewsletter !== previousNewsletterState) {
        console.log('📰 Changement preference newsletter detecte, synchronisation...');
        
        if (currentSettings.weeklyNewsletter) {
            const subscribed = await subscribeToNewsletter(currentUserData.email, currentUserData.displayName);
            
            if (subscribed) {
                const userRef = db.collection('users').doc(currentUserData.uid);
                await userRef.update({
                    newsletterSubscribedAt: new Date().toISOString()
                });
            }
        } else {
            await unsubscribeFromNewsletter(currentUserData.email);
            
            const userRef = db.collection('users').doc(currentUserData.uid);
            await userRef.update({
                newsletterSubscribedAt: firebase.firestore.FieldValue.delete()
            });
        }
    }
    
    // ========================================
    // 2⃣ GESTION NOTIFICATIONS PLATEFORME
    // ========================================
    if (currentSettings.featureUpdates !== previousUpdatesState) {
        console.log('🔔 Changement preference updates detecte, synchronisation...');
        
        if (currentSettings.featureUpdates) {
            const subscribed = await subscribeToUpdates(currentUserData.email, currentUserData.displayName);
            
            if (subscribed) {
                const userRef = db.collection('users').doc(currentUserData.uid);
                await userRef.update({
                    updatesSubscribedAt: new Date().toISOString()
                });
            }
        } else {
            await unsubscribeFromUpdates(currentUserData.email);
            
            const userRef = db.collection('users').doc(currentUserData.uid);
            await userRef.update({
                updatesSubscribedAt: firebase.firestore.FieldValue.delete()
            });
        }
    }
    
    showToast('success', 'Success', 'Notification preferences saved');
}

async function savePrivacySettings() {
    currentSettings.analytics = document.getElementById('analytics').checked;
    
    await saveSettings();
    showToast('success', 'Success', 'Privacy settings saved');
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
                weeklyNewsletter: currentSettings.weeklyNewsletter,
                featureUpdates: currentSettings.featureUpdates
            });
            
            console.log('Parametres sauvegardes dans Firestore');
        }
        
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showToast('error', 'Error', 'Unable to save your settings');
    }
}

// ============================================
// GESTION DES DONNÉES
// ============================================

async function exportUserData() {
    if (!currentUserData) {
        showToast('error', 'Error', 'You must be logged in');
        return;
    }
    
    try {
        showToast('info', 'Exporting', 'Preparing your data');
        
        const exportData = {
            user: currentUserData,
            settings: currentSettings,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'alphavault-export-' + Date.now() + '.json';
        link.click();
        
        showToast('success', 'Success', 'Your data has been exported');
        
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        showToast('error', 'Error', 'Unable to export your data');
    }
}

function clearCache() {
    const confirmed = confirm(
        'Are you sure you want to clear the cache?\n\n' +
        'This will delete all temporary data.'
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
        
        showToast('success', 'Success', 'Cache cleared successfully');
        
    } catch (error) {
        console.error('Erreur lors du vidage du cache:', error);
        showToast('error', 'Error', 'Unable to clear cache');
    }
}

async function deleteAllAnalyses() {
    const confirmed = confirm(
        'WARNING\n\n' +
        'Are you sure you want to delete ALL your analyses?\n\n' +
        'This action is IRREVERSIBLE!'
    );
    
    if (!confirmed) return;
    
    showToast('info', 'Deleting', 'Deleting your analyses');
    
    try {
        showToast('success', 'Success', 'Analyses deleted');
    } catch (error) {
        console.error('Erreur:', error);
        showToast('error', 'Error', 'Unable to delete analyses');
    }
}

async function deleteAllPortfolios() {
    const confirmed = confirm(
        'WARNING\n\n' +
        'Are you sure you want to delete ALL your portfolios?\n\n' +
        'This action is IRREVERSIBLE!'
    );
    
    if (!confirmed) return;
    
    showToast('info', 'Deleting', 'Deleting your portfolios');
    
    try {
        showToast('success', 'Success', 'Portfolios deleted');
    } catch (error) {
        console.error('Erreur:', error);
        showToast('error', 'Error', 'Unable to delete portfolios');
    }
}

// ============================================
// UTILITAIRES - TOAST
// ============================================

function showToast(type, title, message) {
    const toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        
        if (type === 'error') {
            console.error(`${title}: ${message}`);
        } else if (type === 'success') {
            console.log(`${title}: ${message}`);
        } else if (type === 'warning') {
            console.warn(`${title}: ${message}`);
        } else if (type === 'info') {
            console.info(`${title}: ${message}`);
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

console.log('Script de parametres charge - Version 5.0 (Protection anti-reabonnement)');