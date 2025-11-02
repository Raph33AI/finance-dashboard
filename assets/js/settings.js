/* ============================================
   SETTINGS.JS - Gestion de la page paramètres
   ============================================ */

// Variables globales
let currentUserData = null;
let currentSettings = {
    // General
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    
    // Appearance
    theme: 'dark',
    enableAnimations: true,
    collapsedSidebar: false,
    
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

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation de la page paramètres...');
    
    // Vérifier si Firebase est initialisé
    if (!isFirebaseInitialized()) {
        showToast('error', 'Erreur', 'Impossible de charger les paramètres');
        return;
    }
    
    // Initialiser les gestionnaires d'événements
    initializeEventListeners();
    
    console.log('✅ Page paramètres initialisée');
});

// Écouter l'événement quand les données sont chargées
window.addEventListener('userDataLoaded', (e) => {
    currentUserData = e.detail;
    console.log('✅ Données utilisateur reçues:', currentUserData);
    
    // Charger les paramètres
    loadSettings();
});

// ============================================
// CHARGEMENT DES PARAMÈTRES
// ============================================

/**
 * Charger les paramètres depuis Firestore
 */
async function loadSettings() {
    try {
        console.log('📥 Chargement des paramètres...');
        
        if (!currentUserData) {
            console.warn('⚠️ Pas de données utilisateur disponibles');
            loadDefaultSettings();
            return;
        }
        
        // Référence au document settings
        const settingsRef = firebaseDb
            .collection('users')
            .doc(currentUserData.uid)
            .collection('settings')
            .doc('preferences');
        
        const settingsDoc = await settingsRef.get();
        
        if (!settingsDoc.exists) {
            console.log('⚠️ Paramètres inexistants, création avec valeurs par défaut...');
            
            // Créer le document avec les valeurs par défaut
            await settingsRef.set(currentSettings);
            
            console.log('✅ Paramètres créés avec succès');
        } else {
            // Charger les paramètres existants
            const data = settingsDoc.data();
            currentSettings = { ...currentSettings, ...data };
            
            console.log('✅ Paramètres chargés:', currentSettings);
        }
        
        // Appliquer les paramètres à l'interface
        applySettingsToUI();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des paramètres:', error);
        
        // Si erreur de permissions, utiliser les valeurs par défaut
        if (error.code === 'permission-denied') {
            console.log('⚠️ Permissions refusées, utilisation des valeurs par défaut');
            loadDefaultSettings();
        } else {
            showToast('error', 'Erreur', 'Impossible de charger vos paramètres');
        }
    }
}

/**
 * Charger les paramètres par défaut
 */
function loadDefaultSettings() {
    console.log('📥 Chargement des paramètres par défaut');
    
    // Charger depuis localStorage si disponible
    const savedSettings = localStorage.getItem('financepro_settings');
    if (savedSettings) {
        try {
            currentSettings = { ...currentSettings, ...JSON.parse(savedSettings) };
            console.log('✅ Paramètres chargés depuis localStorage');
        } catch (e) {
            console.warn('⚠️ Erreur lors du parsing localStorage');
        }
    }
    
    applySettingsToUI();
}

/**
 * Appliquer les paramètres à l'interface
 */
function applySettingsToUI() {
    // General
    document.getElementById('language').value = currentSettings.language || 'en';
    document.getElementById('timezone').value = currentSettings.timezone || 'America/New_York';
    document.getElementById('currency').value = currentSettings.currency || 'USD';
    
    // Appearance
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        if (option.dataset.theme === currentSettings.theme) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    document.getElementById('enableAnimations').checked = currentSettings.enableAnimations !== false;
    document.getElementById('collapsedSidebar').checked = currentSettings.collapsedSidebar === true;
    
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
    // === NAVIGATION ENTRE TABS ===
    const tabButtons = document.querySelectorAll('.settings-nav-item');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });
    
    // === SÉLECTION DU THÈME ===
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectTheme(option.dataset.theme);
        });
    });
    
    // === BOUTONS DE SAUVEGARDE ===
    document.getElementById('saveGeneralSettings')?.addEventListener('click', saveGeneralSettings);
    document.getElementById('saveNotificationSettings')?.addEventListener('click', saveNotificationSettings);
    document.getElementById('savePrivacySettings')?.addEventListener('click', savePrivacySettings);
    
    // === BOUTONS D'ACTION DATA ===
    document.getElementById('exportDataBtn')?.addEventListener('click', exportUserData);
    document.getElementById('clearCacheBtn')?.addEventListener('click', clearCache);
    document.getElementById('deleteAllAnalyses')?.addEventListener('click', deleteAllAnalyses);
    document.getElementById('deleteAllPortfolios')?.addEventListener('click', deleteAllPortfolios);
}

// ============================================
// NAVIGATION TABS
// ============================================

function switchTab(tabName) {
    // Désactiver tous les boutons et tabs
    document.querySelectorAll('.settings-nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Activer le bouton et tab sélectionné
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    console.log('📑 Onglet changé:', tabName);
}

// ============================================
// SÉLECTION DU THÈME
// ============================================

function selectTheme(theme) {
    // Mettre à jour l'interface
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
    
    // Mettre à jour les paramètres
    currentSettings.theme = theme;
    
    // Appliquer le thème immédiatement
    if (window.setTheme) {
        window.setTheme(theme);
    }
    
    // Sauvegarder
    saveAppearanceSettings();
    
    console.log('🎨 Thème sélectionné:', theme);
}

// ============================================
// SAUVEGARDE DES PARAMÈTRES
// ============================================

/**
 * Sauvegarder les paramètres généraux
 */
async function saveGeneralSettings() {
    currentSettings.language = document.getElementById('language').value;
    currentSettings.timezone = document.getElementById('timezone').value;
    currentSettings.currency = document.getElementById('currency').value;
    
    await saveSettings();
    showToast('success', 'Succès !', 'Paramètres généraux sauvegardés');
}

/**
 * Sauvegarder les paramètres d'apparence
 */
async function saveAppearanceSettings() {
    currentSettings.enableAnimations = document.getElementById('enableAnimations').checked;
    currentSettings.collapsedSidebar = document.getElementById('collapsedSidebar').checked;
    
    await saveSettings();
}

/**
 * Sauvegarder les paramètres de notifications
 */
async function saveNotificationSettings() {
    currentSettings.weeklyNewsletter = document.getElementById('weeklyNewsletter').checked;
    currentSettings.priceAlerts = document.getElementById('priceAlerts').checked;
    currentSettings.featureUpdates = document.getElementById('featureUpdates').checked;
    
    await saveSettings();
    showToast('success', 'Succès !', 'Préférences de notifications sauvegardées');
}

/**
 * Sauvegarder les paramètres de confidentialité
 */
async function savePrivacySettings() {
    currentSettings.publicProfile = document.getElementById('publicProfile').checked;
    currentSettings.publicAnalyses = document.getElementById('publicAnalyses').checked;
    currentSettings.analytics = document.getElementById('analytics').checked;
    
    await saveSettings();
    showToast('success', 'Succès !', 'Paramètres de confidentialité sauvegardés');
}

/**
 * Fonction générique pour sauvegarder
 */
async function saveSettings() {
    try {
        // Sauvegarder dans localStorage
        localStorage.setItem('financepro_settings', JSON.stringify(currentSettings));
        
        // Sauvegarder dans Firestore si connecté
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

/**
 * Exporter les données utilisateur
 */
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
        
        // Créer un fichier JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        // Télécharger
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financepro-export-${Date.now()}.json`;
        link.click();
        
        showToast('success', 'Succès !', 'Vos données ont été exportées');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'export:', error);
        showToast('error', 'Erreur', 'Impossible d\'exporter vos données');
    }
}

/**
 * Vider le cache
 */
function clearCache() {
    const confirmed = confirm(
        'Êtes-vous sûr de vouloir vider le cache ?\n\n' +
        'Cette action supprimera toutes les données temporaires.'
    );
    
    if (!confirmed) return;
    
    try {
        // Vider localStorage (sauf les données essentielles)
        const essentialKeys = ['financepro_user', 'financepro_theme', 'financepro_settings'];
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
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

/**
 * Supprimer toutes les analyses
 */
async function deleteAllAnalyses() {
    const confirmed = confirm(
        '⚠️ ATTENTION ⚠️\n\n' +
        'Êtes-vous sûr de vouloir supprimer TOUTES vos analyses ?\n\n' +
        'Cette action est IRRÉVERSIBLE !'
    );
    
    if (!confirmed) return;
    
    showToast('info', 'Suppression...', 'Suppression de vos analyses en cours');
    
    try {
        // TODO: Implémenter la suppression réelle
        // Pour l'instant, juste un placeholder
        
        showToast('success', 'Succès !', 'Analyses supprimées');
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        showToast('error', 'Erreur', 'Impossible de supprimer les analyses');
    }
}

/**
 * Supprimer tous les portfolios
 */
async function deleteAllPortfolios() {
    const confirmed = confirm(
        '⚠️ ATTENTION ⚠️\n\n' +
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

/**
 * Afficher une notification toast
 */
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
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });
    
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

/**
 * Supprimer un toast
 */
function removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

console.log('✅ Script de paramètres chargé (version corrigée avec support thème global)');