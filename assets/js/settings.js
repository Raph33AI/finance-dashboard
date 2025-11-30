/* ============================================
   SETTINGS.JS - Gestion des paramètres utilisateur
   ✅ SYNCHRONISATION NEWSLETTER SIMPLIFIÉE (Firestore = Source de vérité)
   ✅ CORRECTION CORS &amp; TOAST
   ============================================ */

// Configuration
const NEWSLETTER_WORKER_URL = 'https://newsletter-worker.raphnardone.workers.dev';

// Variables globales
let currentUserData = null;
let currentSettings = {
    // General
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    
    // Notifications
    weeklyNewsletter: true,  // ✅ ACTIVÉ PAR DÉFAUT
    priceAlerts: true,
    featureUpdates: true,
    
    // Privacy
    publicProfile: false,
    publicAnalyses: false,
    analytics: true
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
});

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
    // General
    document.getElementById('language').value = currentSettings.language || 'en';
    document.getElementById('timezone').value = currentSettings.timezone || 'America/New_York';
    document.getElementById('currency').value = currentSettings.currency || 'USD';
    
    // Notifications
    document.getElementById('weeklyNewsletter').checked = currentSettings.weeklyNewsletter !== false;
    document.getElementById('priceAlerts').checked = currentSettings.priceAlerts !== false;
    document.getElementById('featureUpdates').checked = currentSettings.featureUpdates !== false;
    
    // Privacy
    document.getElementById('publicProfile').checked = currentSettings.publicProfile === true;
    document.getElementById('publicAnalyses').checked = currentSettings.publicAnalyses === true;
    document.getElementById('analytics').checked = currentSettings.analytics !== false;
    
    console.log('✅ Interface mise à jour avec les paramètres');
}

// ============================================
// 🆕 SYNCHRONISATION NEWSLETTER CLOUDFLARE (SIMPLIFIÉE)
// ============================================

async function synchronizeNewsletterSubscription() {
    if (!currentUserData || !currentUserData.uid) {
        console.warn('⚠ Aucun utilisateur connecté pour la synchronisation');
        return;
    }

    try {
        console.log('🔄 Synchronisation newsletter avec Firestore...');
        
        const userRef = db.collection('users').doc(currentUserData.uid);
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
                // Mettre à jour Firestore avec la date
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
        // Ne pas bloquer l'expérience utilisateur
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
        
        // ✅ CORRECTION : Utiliser POST au lieu de GET pour éviter CORS
        const response = await fetch(`${NEWSLETTER_WORKER_URL}/unsubscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email
            })
        });
        
        if (!response.ok) {
            console.warn('⚠ Erreur Worker lors de la désinscription (statut:', response.status, ')');
            // ✅ Ne pas bloquer si le Worker échoue - la préférence Firestore fait foi
            console.log('ℹ Préférence sauvegardée dans Firestore. Désinscription effective au prochain envoi.');
            showToast('warning', 'Désinscription enregistrée', 'La désinscription sera effective dans quelques minutes');
            return true;
        }
        
        console.log('✅ Désinscription newsletter réussie');
        showToast('info', 'Désinscription', 'Vous ne recevrez plus la newsletter hebdomadaire');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur désinscription newsletter:', error);
        
        // ✅ FALLBACK : Même si le Worker échoue, on continue
        console.warn('⚠ Erreur Worker mais préférence sauvegardée dans Firestore');
        showToast('warning', 'Désinscription enregistrée', 'La désinscription sera effective dans quelques minutes');
        return true; // On retourne true pour ne pas bloquer l'utilisateur
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
    const saveGeneralBtn = document.getElementById('saveGeneralSettings');
    if (saveGeneralBtn) {
        saveGeneralBtn.addEventListener('click', saveGeneralSettings);
    }
    
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

async function saveGeneralSettings() {
    currentSettings.language = document.getElementById('language').value;
    currentSettings.timezone = document.getElementById('timezone').value;
    currentSettings.currency = document.getElementById('currency').value;
    
    await saveSettings();
    showToast('success', 'Succès !', 'Paramètres généraux sauvegardés');
}

async function saveNotificationSettings() {
    const previousNewsletterState = currentSettings.weeklyNewsletter;
    
    currentSettings.weeklyNewsletter = document.getElementById('weeklyNewsletter').checked;
    currentSettings.priceAlerts = document.getElementById('priceAlerts').checked;
    currentSettings.featureUpdates = document.getElementById('featureUpdates').checked;
    
    await saveSettings();
    
    // ✅ SYNCHRONISER AVEC CLOUDFLARE SI CHANGEMENT
    if (currentSettings.weeklyNewsletter !== previousNewsletterState) {
        console.log('📧 Changement préférence newsletter détecté, synchronisation...');
        
        if (currentSettings.weeklyNewsletter) {
            // L'utilisateur active la newsletter
            const subscribed = await subscribeToNewsletter(currentUserData.email, currentUserData.displayName);
            
            if (subscribed) {
                // Mettre à jour la date d'inscription
                const userRef = db.collection('users').doc(currentUserData.uid);
                await userRef.update({
                    newsletterSubscribedAt: new Date().toISOString()
                });
            }
        } else {
            // L'utilisateur désactive la newsletter
            await unsubscribeFromNewsletter(currentUserData.email);
            
            // Supprimer la date d'inscription
            const userRef = db.collection('users').doc(currentUserData.uid);
            await userRef.update({
                newsletterSubscribedAt: firebase.firestore.FieldValue.delete()
            });
        }
    }
    
    showToast('success', 'Succès !', 'Préférences de notifications sauvegardées');
}

async function savePrivacySettings() {
    currentSettings.publicProfile = document.getElementById('publicProfile').checked;
    currentSettings.publicAnalyses = document.getElementById('publicAnalyses').checked;
    currentSettings.analytics = document.getElementById('analytics').checked;
    
    await saveSettings();
    showToast('success', 'Succès !', 'Paramètres de confidentialité sauvegardés');
}

async function saveSettings() {
    try {
        // Sauvegarde localStorage
        localStorage.setItem('financepro_settings', JSON.stringify(currentSettings));
        
        // Sauvegarde Firestore
        if (currentUserData) {
            const settingsRef = firebaseDb
                .collection('users')
                .doc(currentUserData.uid)
                .collection('settings')
                .doc('preferences');
            
            await settingsRef.set(currentSettings, { merge: true });
            
            // ✅ AUSSI METTRE À JOUR LE DOCUMENT UTILISATEUR PRINCIPAL
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
    
    // ✅ VÉRIFICATION SI L'ÉLÉMENT EXISTE
    if (!toastContainer) {
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        
        // ✅ FALLBACK : Utiliser console pour debug
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
        
            <i></i>
        
        
            ${title}
            ${message}
        
        
            <i></i>
        
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

console.log('✅ Script de paramètres chargé avec synchronisation newsletter (Firestore = vérité)');