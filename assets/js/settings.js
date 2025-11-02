/* ============================================
   SETTINGS.JS - Gestion de la page paramètres
   ============================================ */

// Variables globales
let currentUserSettings = {
    language: 'fr',
    timezone: 'Europe/Paris',
    currency: 'EUR',
    theme: 'dark',
    enableAnimations: true,
    collapsedSidebar: false,
    weeklyNewsletter: true,
    priceAlerts: true,
    featureUpdates: true,
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
    initializeTabNavigation();
    initializeThemeSelector();
    initializeSettingsHandlers();
    
    console.log('✅ Page paramètres initialisée');
});

// ============================================
// CHARGEMENT DES PARAMÈTRES
// ============================================

// Écouter l'événement quand les données utilisateur sont chargées
window.addEventListener('userDataLoaded', (e) => {
    const userData = e.detail;
    console.log('✅ Données utilisateur reçues:', userData);
    
    // Charger les paramètres depuis Firestore
    loadUserSettings(userData.uid);
});

/**
 * Charger les paramètres utilisateur depuis Firestore
 */
async function loadUserSettings(userId) {
    try {
        const settingsDoc = await firebaseDb
            .collection('users')
            .doc(userId)
            .collection('settings')
            .doc('preferences')
            .get();
        
        if (settingsDoc.exists) {
            currentUserSettings = {
                ...currentUserSettings,
                ...settingsDoc.data()
            };
            console.log('✅ Paramètres chargés:', currentUserSettings);
        }
        
        // Appliquer les paramètres aux éléments du DOM
        applySettingsToDOM();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des paramètres:', error);
        showToast('warning', 'Attention', 'Impossible de charger vos paramètres');
    }
}

/**
 * Appliquer les paramètres aux éléments du DOM
 */
function applySettingsToDOM() {
    // Général
    document.getElementById('language').value = currentUserSettings.language || 'fr';
    document.getElementById('timezone').value = currentUserSettings.timezone || 'Europe/Paris';
    document.getElementById('currency').value = currentUserSettings.currency || 'EUR';
    
    // Apparence
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === currentUserSettings.theme) {
            option.classList.add('active');
        }
    });
    
    document.getElementById('enableAnimations').checked = currentUserSettings.enableAnimations !== false;
    document.getElementById('collapsedSidebar').checked = currentUserSettings.collapsedSidebar || false;
    
    // Notifications
    document.getElementById('weeklyNewsletter').checked = currentUserSettings.weeklyNewsletter !== false;
    document.getElementById('priceAlerts').checked = currentUserSettings.priceAlerts !== false;
    document.getElementById('featureUpdates').checked = currentUserSettings.featureUpdates !== false;
    
    // Confidentialité
    document.getElementById('publicProfile').checked = currentUserSettings.publicProfile || false;
    document.getElementById('publicAnalyses').checked = currentUserSettings.publicAnalyses || false;
    document.getElementById('analytics').checked = currentUserSettings.analytics !== false;
}

// ============================================
// NAVIGATION ENTRE TABS
// ============================================

function initializeTabNavigation() {
    const navItems = document.querySelectorAll('.settings-nav-item');
    const tabs = document.querySelectorAll('.settings-tab');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.dataset.tab;
            
            // Désactiver tous les items de navigation
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Activer l'item cliqué
            item.classList.add('active');
            
            // Cacher tous les tabs
            tabs.forEach(tab => tab.classList.remove('active'));
            
            // Afficher le tab correspondant
            const targetTab = document.getElementById(`tab-${tabId}`);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });
}

// ============================================
// SÉLECTEUR DE THÈME
// ============================================

function initializeThemeSelector() {
    const themeOptions = document.querySelectorAll('.theme-option');
    
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            
            // Désactiver tous les thèmes
            themeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Activer le thème cliqué
            option.classList.add('active');
            
            // Mettre à jour les paramètres
            currentUserSettings.theme = theme;
            
            // Appliquer le thème
            applyTheme(theme);
        });
    });
}

/**
 * Appliquer un thème
 */
function applyTheme(theme) {
    const body = document.body;
    
    switch(theme) {
        case 'light':
            body.classList.remove('dark-mode');
            break;
        case 'dark':
            body.classList.add('dark-mode');
            break;
        case 'auto':
            // Détecter les préférences système
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                body.classList.add('dark-mode');
            } else {
                body.classList.remove('dark-mode');
            }
            break;
    }
    
    // Sauvegarder dans localStorage pour persistance
    localStorage.setItem('theme', theme);
    
    console.log('🎨 Thème appliqué:', theme);
}

// ============================================
// GESTIONNAIRES DE SAUVEGARDE
// ============================================

function initializeSettingsHandlers() {
    // Sauvegarder les paramètres généraux
    const saveGeneralBtn = document.getElementById('saveGeneralSettings');
    if (saveGeneralBtn) {
        saveGeneralBtn.addEventListener('click', saveGeneralSettings);
    }
    
    // Sauvegarder les paramètres de notification
    const saveNotificationBtn = document.getElementById('saveNotificationSettings');
    if (saveNotificationBtn) {
        saveNotificationBtn.addEventListener('click', saveNotificationSettings);
    }
    
    // Sauvegarder les paramètres de confidentialité
    const savePrivacyBtn = document.getElementById('savePrivacySettings');
    if (savePrivacyBtn) {
        savePrivacyBtn.addEventListener('click', savePrivacySettings);
    }
    
    // Export des données
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportUserData);
    }
    
    // Effacer le cache
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', clearCache);
    }
    
    // Suppression des analyses
    const deleteAnalysesBtn = document.getElementById('deleteAllAnalyses');
    if (deleteAnalysesBtn) {
        deleteAnalysesBtn.addEventListener('click', deleteAllAnalyses);
    }
    
    // Suppression des portfolios
    const deletePortfoliosBtn = document.getElementById('deleteAllPortfolios');
    if (deletePortfoliosBtn) {
        deletePortfoliosBtn.addEventListener('click', deleteAllPortfolios);
    }
}

// ============================================
// SAUVEGARDER LES PARAMÈTRES
// ============================================

/**
 * Sauvegarder les paramètres généraux
 */
async function saveGeneralSettings() {
    const user = getCurrentUser();
    if (!user) {
        showToast('error', 'Erreur', 'Utilisateur non connecté');
        return;
    }
    
    try {
        const settings = {
            language: document.getElementById('language').value,
            timezone: document.getElementById('timezone').value,
            currency: document.getElementById('currency').value,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await firebaseDb
            .collection('users')
            .doc(user.uid)
            .collection('settings')
            .doc('preferences')
            .set(settings, { merge: true });
        
        // Mettre à jour les paramètres locaux
        Object.assign(currentUserSettings, settings);
        
        showToast('success', 'Succès !', 'Paramètres généraux sauvegardés');
        console.log('✅ Paramètres généraux sauvegardés');
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        showToast('error', 'Erreur', 'Impossible de sauvegarder les paramètres');
    }
}

/**
 * Sauvegarder les paramètres de notification
 */
async function saveNotificationSettings() {
    const user = getCurrentUser();
    if (!user) {
        showToast('error', 'Erreur', 'Utilisateur non connecté');
        return;
    }
    
    try {
        const settings = {
            weeklyNewsletter: document.getElementById('weeklyNewsletter').checked,
            priceAlerts: document.getElementById('priceAlerts').checked,
            featureUpdates: document.getElementById('featureUpdates').checked,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await firebaseDb
            .collection('users')
            .doc(user.uid)
            .collection('settings')
            .doc('preferences')
            .set(settings, { merge: true });
        
        Object.assign(currentUserSettings, settings);
        
        showToast('success', 'Succès !', 'Préférences de notification sauvegardées');
        console.log('✅ Paramètres de notification sauvegardés');
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        showToast('error', 'Erreur', 'Impossible de sauvegarder les préférences');
    }
}

/**
 * Sauvegarder les paramètres de confidentialité
 */
async function savePrivacySettings() {
    const user = getCurrentUser();
    if (!user) {
        showToast('error', 'Erreur', 'Utilisateur non connecté');
        return;
    }
    
    try {
        const settings = {
            publicProfile: document.getElementById('publicProfile').checked,
            publicAnalyses: document.getElementById('publicAnalyses').checked,
            analytics: document.getElementById('analytics').checked,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await firebaseDb
            .collection('users')
            .doc(user.uid)
            .collection('settings')
            .doc('preferences')
            .set(settings, { merge: true });
        
        Object.assign(currentUserSettings, settings);
        
        showToast('success', 'Succès !', 'Paramètres de confidentialité sauvegardés');
        console.log('✅ Paramètres de confidentialité sauvegardés');
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        showToast('error', 'Erreur', 'Impossible de sauvegarder les paramètres');
    }
}

// ============================================
// GESTION DES DONNÉES
// ============================================

/**
 * Exporter les données utilisateur
 */
async function exportUserData() {
    const user = getCurrentUser();
    if (!user) {
        showToast('error', 'Erreur', 'Utilisateur non connecté');
        return;
    }
    
    try {
        showToast('info', 'Export en cours...', 'Préparation de vos données');
        
        // Récupérer toutes les données utilisateur
        const userDoc = await firebaseDb.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        // Récupérer les analyses
        const analysesSnapshot = await firebaseDb
            .collection('users')
            .doc(user.uid)
            .collection('analyses')
            .get();
        const analyses = analysesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Récupérer les portfolios
        const portfoliosSnapshot = await firebaseDb
            .collection('users')
            .doc(user.uid)
            .collection('portfolios')
            .get();
        const portfolios = portfoliosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Créer l'objet d'export
        const exportData = {
            user: userData,
            analyses: analyses,
            portfolios: portfolios,
            exportDate: new Date().toISOString()
        };
        
        // Convertir en JSON et télécharger
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `financepro-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('success', 'Export réussi !', 'Vos données ont été téléchargées');
        console.log('✅ Données exportées');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'export:', error);
        showToast('error', 'Erreur', 'Impossible d\'exporter les données');
    }
}

/**
 * Effacer le cache
 */
function clearCache() {
    if (!confirm('Êtes-vous sûr de vouloir effacer le cache ?')) {
        return;
    }
    
    try {
        // Effacer localStorage (sauf les paramètres essentiels)
        const essentialKeys = ['theme', 'financepro_user'];
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!essentialKeys.includes(key)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Effacer sessionStorage
        sessionStorage.clear();
        
        showToast('success', 'Cache effacé !', 'Les données temporaires ont été supprimées');
        console.log('✅ Cache effacé');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'effacement du cache:', error);
        showToast('error', 'Erreur', 'Impossible d\'effacer le cache');
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
    
    const user = getCurrentUser();
    if (!user) {
        showToast('error', 'Erreur', 'Utilisateur non connecté');
        return;
    }
    
    try {
        showToast('info', 'Suppression en cours...', 'Veuillez patienter');
        
        // Récupérer toutes les analyses
        const analysesSnapshot = await firebaseDb
            .collection('users')
            .doc(user.uid)
            .collection('analyses')
            .get();
        
        // Supprimer toutes les analyses
        const batch = firebaseDb.batch();
        analysesSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        showToast('success', 'Analyses supprimées', `${analysesSnapshot.size} analyses ont été supprimées`);
        console.log(`✅ ${analysesSnapshot.size} analyses supprimées`);
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
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
    
    const user = getCurrentUser();
    if (!user) {
        showToast('error', 'Erreur', 'Utilisateur non connecté');
        return;
    }
    
    try {
        showToast('info', 'Suppression en cours...', 'Veuillez patienter');
        
        // Récupérer tous les portfolios
        const portfoliosSnapshot = await firebaseDb
            .collection('users')
            .doc(user.uid)
            .collection('portfolios')
            .get();
        
        // Supprimer tous les portfolios
        const batch = firebaseDb.batch();
        portfoliosSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        showToast('success', 'Portfolios supprimés', `${portfoliosSnapshot.size} portfolios ont été supprimés`);
        console.log(`✅ ${portfoliosSnapshot.size} portfolios supprimés`);
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        showToast('error', 'Erreur', 'Impossible de supprimer les portfolios');
    }
}

// ============================================
// UTILITAIRES (Toast notifications)
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

function removeToast(toast) {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Animation de sortie
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('✅ Script de paramètres chargé');