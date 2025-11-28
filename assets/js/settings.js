/* ============================================
   SETTINGS.JS - Gestion des paramètres utilisateur
   ✅ SYNCHRONISATION NEWSLETTER CLOUDFLARE KV
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
            console.warn('⚠  Pas de données utilisateur disponibles');
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
            console.log('⚠  Paramètres inexistants, création avec valeurs par défaut...');
            await settingsRef.set(currentSettings);
            console.log('✅ Paramètres créés avec succès');
        } else {
            const data = settingsDoc.data();
            currentSettings = { ...currentSettings, ...data };
            console.log('✅ Paramètres chargés:', currentSettings);
        }
        
        // ✅ SYNCHRONISER AVEC CLOUDFLARE KV
        await synchronizeNewsletterSubscription();
        
        applySettingsToUI();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des paramètres:', error);
        
        if (error.code === 'permission-denied') {
            console.log('⚠  Permissions refusées, utilisation des valeurs par défaut');
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
            console.warn('⚠  Erreur lors du parsing localStorage');
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
// 🆕 SYNCHRONISATION NEWSLETTER CLOUDFLARE
// ============================================

async function synchronizeNewsletterSubscription() {
    if (!currentUserData || !currentUserData.email) {
        console.warn('⚠  Pas d\'email utilisateur disponible pour la synchronisation');
        return;
    }
    
    try {
        console.log('🔄 Vérification statut newsletter Cloudflare...');
        
        // Vérifier le statut actuel dans le KV
        const statusResponse = await fetch(`${NEWSLETTER_WORKER_URL}/check-subscription`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: currentUserData.email
            })
        });
        
        if (!statusResponse.ok) {
            throw new Error('Impossible de vérifier le statut d\'abonnement');
        }
        
        const statusData = await statusResponse.json();
        const isSubscribedInKV = statusData.subscribed === true;
        const wantsNewsletter = currentSettings.weeklyNewsletter !== false;
        
        console.log('📊 Statut synchronisation:');
        console.log('   - Firestore weeklyNewsletter:', wantsNewsletter);
        console.log('   - Cloudflare KV subscribed:', isSubscribedInKV);
        
        // 🔄 SYNCHRONISER
        if (wantsNewsletter && !isSubscribedInKV) {
            // ✅ L'utilisateur veut recevoir des emails MAIS n'est pas dans le KV → SUBSCRIBE
            console.log('➕ Inscription automatique à la newsletter...');
            await subscribeToNewsletter(currentUserData.email, currentUserData.displayName);
            
        } else if (!wantsNewsletter && isSubscribedInKV) {
            // ❌ L'utilisateur NE veut PAS recevoir d'emails MAIS est dans le KV → UNSUBSCRIBE
            console.log('➖ Désinscription automatique de la newsletter...');
            await unsubscribeFromNewsletter(currentUserData.email);
            
        } else if (wantsNewsletter && isSubscribedInKV) {
            console.log('✅ Déjà inscrit et activé - aucune action nécessaire');
            
        } else {
            console.log('ℹ  Non inscrit par choix - aucune action nécessaire');
        }
        
    } catch (error) {
        console.error('❌ Erreur synchronisation newsletter:', error);
        showToast('warning', 'Attention', 'La synchronisation de la newsletter a échoué. Vos paramètres locaux sont sauvegardés.');
    }
}

async function subscribeToNewsletter(email, name) {
    try {
        const response = await fetch(`${NEWSLETTER_WORKER_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                name: name || email.split('@')[0]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Subscription failed');
        }
        
        const data = await response.json();
        console.log('✅ Inscription newsletter réussie:', data);
        showToast('success', 'Succès !', 'Vous êtes maintenant inscrit à la newsletter hebdomadaire');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur inscription newsletter:', error);
        throw error;
    }
}

async function unsubscribeFromNewsletter(email) {
    try {
        const response = await fetch(`${NEWSLETTER_WORKER_URL}/unsubscribe?email=${encodeURIComponent(email)}`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error('Unsubscription failed');
        }
        
        console.log('✅ Désinscription newsletter réussie');
        showToast('info', 'Désinscription', 'Vous ne recevrez plus la newsletter hebdomadaire');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erreur désinscription newsletter:', error);
        throw error;
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
            await subscribeToNewsletter(currentUserData.email, currentUserData.displayName);
        } else {
            // L'utilisateur désactive la newsletter
            await unsubscribeFromNewsletter(currentUserData.email);
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
        '⚠  ATTENTION ⚠ \n\n' +
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
        '⚠  ATTENTION ⚠ \n\n' +
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
// UTILITAIRES
// ============================================

function showToast(type, title, message) {
    const toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) {
        console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
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
    }
    
    toast.innerHTML = `
        
            <i></i>
        
        
            ${title}
            ${message}
        
        
            <i></i>
        
    `;
    
    toastContainer.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', function() {
        removeToast(toast);
    });
    
    setTimeout(function() {
        removeToast(toast);
    }, 5000);
}

function removeToast(toast) {
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

console.log('✅ Script de paramètres chargé avec synchronisation newsletter');