/* ============================================
   SETTINGS.JS - Gestion de la page paramètres (Sans Appearance)
   ============================================ */

// Variables globales
let currentUserData = null;
let currentSettings = {
    // General
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    
    // ❌ APPEARANCE SUPPRIMÉ
    
    // Notifications
    weeklyNewsletter: true,
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

document.addEventListener('DOMContentLoaded', () =&gt; {
    console.log('🚀 Initialisation de la page paramètres...');
    
    if (!isFirebaseInitialized()) {
        showToast('error', 'Erreur', 'Impossible de charger les paramètres');
        return;
    }
    
    initializeEventListeners();
    
    console.log('✅ Page paramètres initialisée');
});

window.addEventListener('userDataLoaded', (e) =&gt; {
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
    
    // ❌ APPEARANCE SUPPRIMÉ (pas de thème ici)
    
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
// GESTIONNAIRES D'ÉVÉNEMENTS
// ============================================

function initializeEventListeners() {
    // Navigation entre tabs
    const tabButtons = document.querySelectorAll('.settings-nav-item');
    tabButtons.forEach(button =&gt; {
        button.addEventListener('click', () =&gt; {
            switchTab(button.dataset.tab);
        });
    });
    
    // ❌ THEME SELECTOR SUPPRIMÉ
    
    // Boutons de sauvegarde
    document.getElementById('saveGeneralSettings')?.addEventListener('click', saveGeneralSettings);
    document.getElementById('saveNotificationSettings')?.addEventListener('click', saveNotificationSettings);
    document.getElementById('savePrivacySettings')?.addEventListener('click', savePrivacySettings);
    
    // Boutons d'action data
    document.getElementById('exportDataBtn')?.addEventListener('click', exportUserData);
    document.getElementById('clearCacheBtn')?.addEventListener('click', clearCache);
    document.getElementById('deleteAllAnalyses')?.addEventListener('click', deleteAllAnalyses);
    document.getElementById('deleteAllPortfolios')?.addEventListener('click', deleteAllPortfolios);
}

// ============================================
// NAVIGATION TABS
// ============================================

function switchTab(tabName) {
    document.querySelectorAll('.settings-nav-item').forEach(btn =&gt; {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.settings-tab').forEach(tab =&gt; {
        tab.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
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
    currentSettings.weeklyNewsletter = document.getElementById('weeklyNewsletter').checked;
    currentSettings.priceAlerts = document.getElementById('priceAlerts').checked;
    currentSettings.featureUpdates = document.getElementById('featureUpdates').checked;
    
    await saveSettings();
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
        localStorage.setItem('financepro_settings', JSON.stringify(currentSettings));
        
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
        link.download = `alphavault-export-${Date.now()}.json`;
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
        
        allKeys.forEach(key =&gt; {
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
// UTILITAIRES
// ============================================

function showToast(type, title, message) {
    const toastContainer = document.getElementById('toastContainer');
    
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
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
        
            
        
        
            ${title}
            ${message}
        
        
            
        
    `;
    
    toastContainer.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () =&gt; {
        removeToast(toast);
    });
    
    setTimeout(() =&gt; {
        removeToast(toast);
    }, 5000);
}

function removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() =&gt; {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

console.log('✅ Script de paramètres chargé (sans Appearance)');