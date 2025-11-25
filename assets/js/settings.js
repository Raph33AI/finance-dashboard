/* ============================================
   SETTINGS.JS - Gestion de la page paramètres
   ✨ VERSION CORRIGÉE - Syntaxe validée
   ============================================ */

// Variables globales
let currentUserData = null;
let currentSettings = {
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    weeklyNewsletter: true,
    priceAlerts: true,
    featureUpdates: true,
    publicProfile: false,
    publicAnalyses: false,
    analytics: true
};

const NEWSLETTER_WORKER_URL = 'https://newsletter-worker.raphnardone.workers.dev';

// ============================================
// INITIALISATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation de la page paramètres...');
    
    try {
        initializeEventListeners();
        console.log('✅ Event listeners initialisés');
        loadDefaultSettings();
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
        showToast('error', 'Erreur', 'Erreur lors de l\'initialisation');
    }
});

window.addEventListener('userDataLoaded', function(e) {
    console.log('👤 Event userDataLoaded reçu');
    try {
        currentUserData = e.detail;
        console.log('✅ Données utilisateur reçues:', currentUserData);
        loadSettings();
    } catch (error) {
        console.error('❌ Erreur traitement userDataLoaded:', error);
    }
});

// ============================================
// VÉRIFICATION FIREBASE
// ============================================

function isFirebaseInitialized() {
    if (typeof firebase === 'undefined') {
        console.warn('⚠ Firebase SDK non chargé');
        return false;
    }
    if (typeof firebaseDb === 'undefined') {
        console.warn('⚠ Firestore non initialisé');
        return false;
    }
    return true;
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
        
        if (!isFirebaseInitialized()) {
            console.warn('⚠ Firebase non disponible, utilisation localStorage');
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
            
            if (currentSettings.weeklyNewsletter) {
                syncNewsletterSubscription(true).catch(function(err) {
                    console.warn('⚠ Sync newsletter échouée:', err);
                });
            }
        } else {
            const data = settingsDoc.data();
            currentSettings = Object.assign({}, currentSettings, data);
            console.log('✅ Paramètres chargés:', currentSettings);
        }
        
        applySettingsToUI();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des paramètres:', error);
        
        if (error.code === 'permission-denied') {
            console.log('⚠ Permissions refusées, utilisation des valeurs par défaut');
            loadDefaultSettings();
        } else {
            showToast('error', 'Erreur', 'Impossible de charger vos paramètres');
            loadDefaultSettings();
        }
    }
}

function loadDefaultSettings() {
    console.log('📥 Chargement des paramètres par défaut');
    
    try {
        const savedSettings = localStorage.getItem('financepro_settings');
        if (savedSettings) {
            currentSettings = Object.assign({}, currentSettings, JSON.parse(savedSettings));
            console.log('✅ Paramètres chargés depuis localStorage');
        }
    } catch (e) {
        console.warn('⚠ Erreur lors du parsing localStorage:', e);
    }
    
    applySettingsToUI();
}

function applySettingsToUI() {
    console.log('🎨 Application des paramètres à l\'interface...');
    
    try {
        const langEl = document.getElementById('language');
        const tzEl = document.getElementById('timezone');
        const currEl = document.getElementById('currency');
        
        if (langEl) langEl.value = currentSettings.language || 'en';
        if (tzEl) tzEl.value = currentSettings.timezone || 'America/New_York';
        if (currEl) currEl.value = currentSettings.currency || 'USD';
        
        const newsEl = document.getElementById('weeklyNewsletter');
        const priceEl = document.getElementById('priceAlerts');
        const featEl = document.getElementById('featureUpdates');
        
        if (newsEl) newsEl.checked = currentSettings.weeklyNewsletter !== false;
        if (priceEl) priceEl.checked = currentSettings.priceAlerts !== false;
        if (featEl) featEl.checked = currentSettings.featureUpdates !== false;
        
        const profileEl = document.getElementById('publicProfile');
        const analysesEl = document.getElementById('publicAnalyses');
        const analyticsEl = document.getElementById('analytics');
        
        if (profileEl) profileEl.checked = currentSettings.publicProfile === true;
        if (analysesEl) analysesEl.checked = currentSettings.publicAnalyses === true;
        if (analyticsEl) analyticsEl.checked = currentSettings.analytics !== false;
        
        console.log('✅ Interface mise à jour avec les paramètres');
        
    } catch (error) {
        console.error('❌ Erreur application UI:', error);
    }
}

// ============================================
// GESTIONNAIRES D'ÉVÉNEMENTS
// ============================================

function initializeEventListeners() {
    console.log('🔧 Initialisation des event listeners...');
    
    try {
        const tabButtons = document.querySelectorAll('.settings-nav-item');
        console.log('📑 ' + tabButtons.length + ' onglets trouvés');
        
        tabButtons.forEach(function(button) {
            button.addEventListener('click', function() {
                const tabName = button.dataset.tab;
                console.log('🖱 Clic sur onglet:', tabName);
                switchTab(tabName);
            });
        });
        
        const saveGeneralBtn = document.getElementById('saveGeneralSettings');
        const saveNotifBtn = document.getElementById('saveNotificationSettings');
        const savePrivacyBtn = document.getElementById('savePrivacySettings');
        
        if (saveGeneralBtn) {
            saveGeneralBtn.addEventListener('click', saveGeneralSettings);
            console.log('✅ Bouton General Settings lié');
        }
        
        if (saveNotifBtn) {
            saveNotifBtn.addEventListener('click', saveNotificationSettings);
            console.log('✅ Bouton Notification Settings lié');
        }
        
        if (savePrivacyBtn) {
            savePrivacyBtn.addEventListener('click', savePrivacySettings);
            console.log('✅ Bouton Privacy Settings lié');
        }
        
        const exportBtn = document.getElementById('exportDataBtn');
        const clearCacheBtn = document.getElementById('clearCacheBtn');
        const deleteAnalysesBtn = document.getElementById('deleteAllAnalyses');
        const deletePortfoliosBtn = document.getElementById('deleteAllPortfolios');
        
        if (exportBtn) exportBtn.addEventListener('click', exportUserData);
        if (clearCacheBtn) clearCacheBtn.addEventListener('click', clearCache);
        if (deleteAnalysesBtn) deleteAnalysesBtn.addEventListener('click', deleteAllAnalyses);
        if (deletePortfoliosBtn) deletePortfoliosBtn.addEventListener('click', deleteAllPortfolios);
        
        console.log('✅ Tous les event listeners initialisés');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des listeners:', error);
    }
}

// ============================================
// NAVIGATION TABS
// ============================================

function switchTab(tabName) {
    try {
        console.log('📑 Changement vers onglet:', tabName);
        
        document.querySelectorAll('.settings-nav-item').forEach(function(btn) {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.settings-tab').forEach(function(tab) {
            tab.classList.remove('active');
        });
        
        const navItem = document.querySelector('[data-tab="' + tabName + '"]');
        const tabContent = document.getElementById('tab-' + tabName);
        
        if (navItem) {
            navItem.classList.add('active');
            console.log('✅ Nav item activé');
        } else {
            console.warn('⚠ Nav item non trouvé:', tabName);
        }
        
        if (tabContent) {
            tabContent.classList.add('active');
            console.log('✅ Tab content activé');
        } else {
            console.warn('⚠ Tab content non trouvé:', 'tab-' + tabName);
        }
        
    } catch (error) {
        console.error('❌ Erreur switchTab:', error);
    }
}

// ============================================
// SAUVEGARDE DES PARAMÈTRES
// ============================================

async function saveGeneralSettings() {
    try {
        const langEl = document.getElementById('language');
        const tzEl = document.getElementById('timezone');
        const currEl = document.getElementById('currency');
        
        if (langEl) currentSettings.language = langEl.value;
        if (tzEl) currentSettings.timezone = tzEl.value;
        if (currEl) currentSettings.currency = currEl.value;
        
        await saveSettings();
        showToast('success', 'Succès !', 'Paramètres généraux sauvegardés');
    } catch (error) {
        console.error('❌ Erreur saveGeneral:', error);
        showToast('error', 'Erreur', 'Impossible de sauvegarder');
    }
}

async function saveNotificationSettings() {
    try {
        const newsEl = document.getElementById('weeklyNewsletter');
        const priceEl = document.getElementById('priceAlerts');
        const featEl = document.getElementById('featureUpdates');
        
        const weeklyNewsletterChecked = newsEl ? newsEl.checked : false;
        const priceAlertsChecked = priceEl ? priceEl.checked : false;
        const featureUpdatesChecked = featEl ? featEl.checked : false;
        
        currentSettings.weeklyNewsletter = weeklyNewsletterChecked;
        currentSettings.priceAlerts = priceAlertsChecked;
        currentSettings.featureUpdates = featureUpdatesChecked;
        
        await saveSettings();
        
        console.log('📧 Tentative de synchronisation newsletter...');
        try {
            await syncNewsletterSubscription(weeklyNewsletterChecked);
        } catch (syncError) {
            console.warn('⚠ Synchronisation newsletter échouée:', syncError);
            showToast('warning', 'Attention', 'Paramètres sauvegardés, mais synchronisation newsletter échouée');
            return;
        }
        
        showToast('success', 'Succès !', 'Préférences de notifications sauvegardées');
        
    } catch (error) {
        console.error('❌ Erreur saveNotification:', error);
        showToast('error', 'Erreur', 'Impossible de sauvegarder');
    }
}

async function savePrivacySettings() {
    try {
        const profileEl = document.getElementById('publicProfile');
        const analysesEl = document.getElementById('publicAnalyses');
        const analyticsEl = document.getElementById('analytics');
        
        if (profileEl) currentSettings.publicProfile = profileEl.checked;
        if (analysesEl) currentSettings.publicAnalyses = analysesEl.checked;
        if (analyticsEl) currentSettings.analytics = analyticsEl.checked;
        
        await saveSettings();
        showToast('success', 'Succès !', 'Paramètres de confidentialité sauvegardés');
    } catch (error) {
        console.error('❌ Erreur savePrivacy:', error);
        showToast('error', 'Erreur', 'Impossible de sauvegarder');
    }
}

async function saveSettings() {
    try {
        localStorage.setItem('financepro_settings', JSON.stringify(currentSettings));
        console.log('✅ Sauvegarde localStorage OK');
        
        if (currentUserData &amp;&amp; isFirebaseInitialized()) {
            const settingsRef = firebaseDb
                .collection('users')
                .doc(currentUserData.uid)
                .collection('settings')
                .doc('preferences');
            
            await settingsRef.set(currentSettings, { merge: true });
            console.log('✅ Sauvegarde Firestore OK');
        } else {
            console.warn('⚠ Firebase non disponible, sauvegarde uniquement en local');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        throw error;
    }
}

// ============================================
// SYNCHRONISATION NEWSLETTER
// ============================================

async function syncNewsletterSubscription(isSubscribed) {
    if (!currentUserData || !currentUserData.email) {
        console.warn('⚠ Impossible de synchroniser : pas d\'email utilisateur');
        throw new Error('No user email available');
    }
    
    console.log('📧 Synchronisation newsletter: ' + (isSubscribed ? 'INSCRIPTION' : 'DÉSINSCRIPTION'));
    
    try {
        if (isSubscribed) {
            const response = await fetch(NEWSLETTER_WORKER_URL + '/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentUserData.email,
                    name: currentUserData.displayName || currentUserData.email.split('@')[0]
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                
                if (error.error === 'Already subscribed') {
                    console.log('✅ Déjà inscrit à la newsletter');
                    return;
                }
                
                throw new Error(error.error || 'Erreur lors de l\'inscription');
            }
            
            const result = await response.json();
            console.log('✅ Inscription newsletter réussie:', result);
            
        } else {
            const response = await fetch(NEWSLETTER_WORKER_URL + '/unsubscribe?email=' + encodeURIComponent(currentUserData.email), {
                method: 'GET'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la désinscription');
            }
            
            console.log('✅ Désinscription newsletter réussie');
        }
        
    } catch (error) {
        console.error('❌ Erreur synchronisation newsletter:', error);
        throw error;
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
    const confirmed = confirm('Êtes-vous sûr de vouloir vider le cache ?\n\nCette action supprimera toutes les données temporaires.');
    
    if (!confirmed) return;
    
    try {
        const essentialKeys = ['financepro_user', 'financepro_theme', 'financepro_settings'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(function(key) {
            if (essentialKeys.indexOf(key) === -1) {
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
    const confirmed = confirm('⚠ ATTENTION ⚠\n\nÊtes-vous sûr de vouloir supprimer TOUTES vos analyses ?\n\nCette action est IRRÉVERSIBLE !');
    
    if (!confirmed) return;
    
    showToast('info', 'Suppression...', 'Suppression de vos analyses en cours');
    
    try {
        if (!currentUserData || !isFirebaseInitialized()) {
            throw new Error('Firebase non disponible');
        }
        
        const analysesRef = firebaseDb
            .collection('users')
            .doc(currentUserData.uid)
            .collection('analyses');
        
        const snapshot = await analysesRef.get();
        
        const batch = firebaseDb.batch();
        snapshot.docs.forEach(function(doc) {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        
        showToast('success', 'Succès !', snapshot.size + ' analyses supprimées');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        showToast('error', 'Erreur', 'Impossible de supprimer les analyses');
    }
}

async function deleteAllPortfolios() {
    const confirmed = confirm('⚠ ATTENTION ⚠\n\nÊtes-vous sûr de vouloir supprimer TOUS vos portfolios ?\n\nCette action est IRRÉVERSIBLE !');
    
    if (!confirmed) return;
    
    showToast('info', 'Suppression...', 'Suppression de vos portfolios en cours');
    
    try {
        if (!currentUserData || !isFirebaseInitialized()) {
            throw new Error('Firebase non disponible');
        }
        
        const portfoliosRef = firebaseDb
            .collection('users')
            .doc(currentUserData.uid)
            .collection('portfolios');
        
        const snapshot = await portfoliosRef.get();
        
        const batch = firebaseDb.batch();
        snapshot.docs.forEach(function(doc) {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        
        showToast('success', 'Succès !', snapshot.size + ' portfolios supprimés');
        
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
        console.warn('⚠ Toast container not found');
        console.log('[' + type.toUpperCase() + '] ' + title + ': ' + message);
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
    
    toast.innerHTML = '<i></i>' +
        '' +
        '' + title + '' +
        '' + message + '' +
        '' +
        '<i></i>';
    
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

console.log('✅ Script de paramètres chargé (VERSION FINALE CORRIGÉE)');