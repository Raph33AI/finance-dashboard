/* ============================================
   SETTINGS.JS - Gestion de la page paramètres
   VERSION CORRIGÉE avec support du thème global
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
 * VERSION CORRIGÉE - Utilise le thème global
 */
function applySettingsToDOM() {
    // Général
    document.getElementById('language').value = currentUserSettings.language || 'fr';
    document.getElementById('timezone').value = currentUserSettings.timezone || 'Europe/Paris';
    document.getElementById('currency').value = currentUserSettings.currency || 'EUR';
    
    // Apparence - Utiliser le thème depuis localStorage/Firestore via la fonction globale
    const currentTheme = currentUserSettings.theme || (window.getCurrentTheme ? window.getCurrentTheme() : 'dark');
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === currentTheme) {
            option.classList.add('active');
        }
    });
    
    // Appliquer le thème immédiatement si la fonction globale existe
    if (window.setTheme) {
        window.setTheme(currentTheme);
    }
    
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
// SÉLECTEUR DE THÈME - VERSION CORRIGÉE
// ============================================

function initializeThemeSelector() {
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // Appliquer le thème actuel au chargement
    const currentTheme = window.getCurrentTheme ? window.getCurrentTheme() : 'dark';
    themeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === currentTheme) {
            option.classList.add('active');
        }
    });
    
    themeOptions.forEach(option => {
        option.addEventListener('click', async () => {
            const theme = option.dataset.theme;
            
            // Désactiver tous les thèmes
            themeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Activer le thème cliqué
            option.classList.add('active');
            
            // Mettre à jour les paramètres locaux
            currentUserSettings.theme = theme;
            
            // Appliquer le thème via la fonction globale
            if (window.setTheme) {
                window.setTheme(theme);
                console.log('🎨 Thème appliqué via setTheme():', theme);
            } else {
                console.error('❌ Fonction setTheme non disponible');
                // Fallback si theme.js n'est pas chargé
                applyThemeFallback(theme);
            }
            
            // Sauvegarder dans Firestore
            await saveThemeToFirestore(theme);
            
            // Afficher une notification
            showToast('success', 'Thème appliqué !', `Le thème ${getThemeLabel(theme)} est maintenant actif sur toutes les pages`);
        });
    });
}

/**
 * Sauvegarder le thème dans Firestore
 * VERSION CORRIGÉE - Fonction autonome
 */
async function saveThemeToFirestore(theme) {
    const user = getCurrentUser();
    if (!user) {
        console.log('👤 Utilisateur non connecté, thème sauvegardé en local uniquement');
        return;
    }
    
    try {
        await firebaseDb
            .collection('users')
            .doc(user.uid)
            .collection('settings')
            .doc('preferences')
            .set({
                theme: theme,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        
        console.log('✅ Thème sauvegardé dans Firestore:', theme);
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde du thème:', error);
    }
}

/**
 * Fallback pour appliquer le thème si theme.js n'est pas chargé
 */
function applyThemeFallback(theme) {
    const body = document.body;
    
    switch(theme) {
        case 'light':
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            break;
        case 'dark':
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            break;
        case 'auto':
            const prefersDark = window.matchMedia && 
                               window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                body.classList.add('dark-mode');
            } else {
                body.classList.remove('dark-mode');
            }
            localStorage.setItem('theme', 'auto');
            break;
    }
    
    console.log('⚠️ Thème appliqué en mode fallback:', theme);
}

/**
 * Obtenir le label du thème
 */
function getThemeLabel(theme) {
    switch(theme) {
        case 'light': return 'clair';
        case 'dark': return 'sombre';
        case 'auto': return 'automatique';
        default: return theme;
    }
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
        
        // Récupérer les paramètres
        const settingsDoc = await firebaseDb
            .collection('users')
            .doc(user.uid)
            .collection('settings')
            .doc('preferences')
            .get();
        const settingsData = settingsDoc.exists ? settingsDoc.data() : {};
        
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
            settings: settingsData,
            analyses: analyses,
            portfolios: portfolios,
            exportDate: new Date().toISOString(),
            version: '1.0'
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
        console.log('✅ Données exportées:', {
            user: !!userData,
            settings: !!settingsData,
            analysesCount: analyses.length,
            portfoliosCount: portfolios.length
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'export:', error);
        showToast('error', 'Erreur', 'Impossible d\'exporter les données');
    }
}

/**
 * Effacer le cache
 */
function clearCache() {
    if (!confirm('Êtes-vous sûr de vouloir effacer le cache ?\n\nCela supprimera les données temporaires mais pas vos paramètres importants.')) {
        return;
    }
    
    try {
        // Effacer localStorage (sauf les paramètres essentiels)
        const essentialKeys = ['theme', 'financepro_user'];
        const keysToRemove = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !essentialKeys.includes(key)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Effacer sessionStorage
        sessionStorage.clear();
        
        showToast('success', 'Cache effacé !', `${keysToRemove.length} éléments temporaires supprimés`);
        console.log('✅ Cache effacé:', keysToRemove);
        
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
        'Cette action est IRRÉVERSIBLE !\n\n' +
        'Tapez OUI pour confirmer'
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
        
        // Supprimer toutes les analyses par batch
        const batch = firebaseDb.batch();
        analysesSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        showToast('success', 'Analyses supprimées', `${analysesSnapshot.size} analyse(s) supprimée(s)`);
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
        'Cette action est IRRÉVERSIBLE !\n\n' +
        'Tapez OUI pour confirmer'
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
        
        // Supprimer tous les portfolios par batch
        const batch = firebaseDb.batch();
        portfoliosSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        
        showToast('success', 'Portfolios supprimés', `${portfoliosSnapshot.size} portfolio(s) supprimé(s)`);
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
    
    if (!toastContainer) {
        console.warn('⚠️ Toast container non trouvé');
        return;
    }
    
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
    
    // Auto-suppression après 5 secondes
    setTimeout(() => {
        removeToast(toast);
    }, 5000);
}

function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Animation de sortie pour les toasts
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

console.log('✅ Script de paramètres chargé (version corrigée avec support thème global)');