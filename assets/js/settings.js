/* ============================================
   SETTINGS.JS - Gestion de la page paramètres
   Version ultra-propre sans erreurs de syntaxe
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
            console.warn('⚠ Firebase non disponible');
            loadDefaultSettings();
            return;
        }
        
        const settingsRef = firebaseDb.collection('users').doc(currentUserData.uid).collection('settings').doc('preferences');
        const settingsDoc = await settingsRef.get();
        
        if (!settingsDoc.exists) {
            console.log('⚠ Création des paramètres par défaut...');
            await settingsRef.set(currentSettings);
            console.log('✅ Paramètres créés');
            
            if (currentSettings.weeklyNewsletter) {
                syncNewsletterSubscription(true).catch(function(err) {
                    console.warn('⚠ Sync newsletter échouée:', err);
                });
            }
        } else {
            const data = settingsDoc.data();
            currentSettings = {
                language: data.language || currentSettings.language,
                timezone: data.timezone || currentSettings.timezone,
                currency: data.currency || currentSettings.currency,
                weeklyNewsletter: data.weeklyNewsletter !== undefined ? data.weeklyNewsletter : currentSettings.weeklyNewsletter,
                priceAlerts: data.priceAlerts !== undefined ? data.priceAlerts : currentSettings.priceAlerts,
                featureUpdates: data.featureUpdates !== undefined ? data.featureUpdates : currentSettings.featureUpdates,
                publicProfile: data.publicProfile !== undefined ? data.publicProfile : currentSettings.publicProfile,
                publicAnalyses: data.publicAnalyses !== undefined ? data.publicAnalyses : currentSettings.publicAnalyses,
                analytics: data.analytics !== undefined ? data.analytics : currentSettings.analytics
            };
            console.log('✅ Paramètres chargés');
        }
        
        applySettingsToUI();
        
    } catch (error) {
        console.error('❌ Erreur chargement paramètres:', error);
        loadDefaultSettings();
    }
}

function loadDefaultSettings() {
    console.log('📥 Chargement des paramètres par défaut');
    
    try {
        const savedSettings = localStorage.getItem('financepro_settings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            currentSettings = {
                language: parsed.language || currentSettings.language,
                timezone: parsed.timezone || currentSettings.timezone,
                currency: parsed.currency || currentSettings.currency,
                weeklyNewsletter: parsed.weeklyNewsletter !== undefined ? parsed.weeklyNewsletter : currentSettings.weeklyNewsletter,
                priceAlerts: parsed.priceAlerts !== undefined ? parsed.priceAlerts : currentSettings.priceAlerts,
                featureUpdates: parsed.featureUpdates !== undefined ? parsed.featureUpdates : currentSettings.featureUpdates,
                publicProfile: parsed.publicProfile !== undefined ? parsed.publicProfile : currentSettings.publicProfile,
                publicAnalyses: parsed.publicAnalyses !== undefined ? parsed.publicAnalyses : currentSettings.publicAnalyses,
                analytics: parsed.analytics !== undefined ? parsed.analytics : currentSettings.analytics
            };
            console.log('✅ Paramètres chargés depuis localStorage');
        }
    } catch (e) {
        console.warn('⚠ Erreur parsing localStorage:', e);
    }
    
    applySettingsToUI();
}

function applySettingsToUI() {
    console.log('🎨 Application des paramètres...');
    
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
        
        console.log('✅ Interface mise à jour');
        
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
        console.log('📑 Onglets trouvés: ' + tabButtons.length);
        
        for (let i = 0; i &lt; tabButtons.length; i++) {
            tabButtons[i].addEventListener('click', function() {
                const tabName = this.dataset.tab;
                console.log('🖱 Clic onglet: ' + tabName);
                switchTab(tabName);
            });
        }
        
        const saveGeneralBtn = document.getElementById('saveGeneralSettings');
        const saveNotifBtn = document.getElementById('saveNotificationSettings');
        const savePrivacyBtn = document.getElementById('savePrivacySettings');
        
        if (saveGeneralBtn) {
            saveGeneralBtn.addEventListener('click', saveGeneralSettings);
            console.log('✅ Bouton General lié');
        }
        
        if (saveNotifBtn) {
            saveNotifBtn.addEventListener('click', saveNotificationSettings);
            console.log('✅ Bouton Notifications lié');
        }
        
        if (savePrivacyBtn) {
            savePrivacyBtn.addEventListener('click', savePrivacySettings);
            console.log('✅ Bouton Privacy lié');
        }
        
        const exportBtn = document.getElementById('exportDataBtn');
        const clearBtn = document.getElementById('clearCacheBtn');
        const delAnalysesBtn = document.getElementById('deleteAllAnalyses');
        const delPortfoliosBtn = document.getElementById('deleteAllPortfolios');
        
        if (exportBtn) exportBtn.addEventListener('click', exportUserData);
        if (clearBtn) clearBtn.addEventListener('click', clearCache);
        if (delAnalysesBtn) delAnalysesBtn.addEventListener('click', deleteAllAnalyses);
        if (delPortfoliosBtn) delPortfoliosBtn.addEventListener('click', deleteAllPortfolios);
        
        console.log('✅ Event listeners OK');
        
    } catch (error) {
        console.error('❌ Erreur init listeners:', error);
    }
}

// ============================================
// NAVIGATION TABS
// ============================================

function switchTab(tabName) {
    try {
        console.log('📑 Switch vers: ' + tabName);
        
        const allNavItems = document.querySelectorAll('.settings-nav-item');
        for (let i = 0; i &lt; allNavItems.length; i++) {
            allNavItems[i].classList.remove('active');
        }
        
        const allTabs = document.querySelectorAll('.settings-tab');
        for (let i = 0; i &lt; allTabs.length; i++) {
            allTabs[i].classList.remove('active');
        }
        
        const navItem = document.querySelector('[data-tab="' + tabName + '"]');
        const tabContent = document.getElementById('tab-' + tabName);
        
        if (navItem) {
            navItem.classList.add('active');
        }
        
        if (tabContent) {
            tabContent.classList.add('active');
        }
        
    } catch (error) {
        console.error('❌ Erreur switchTab:', error);
    }
}

// ============================================
// SAUVEGARDE
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
        showToast('success', 'Succès', 'Paramètres généraux sauvegardés');
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
        
        const newsChecked = newsEl ? newsEl.checked : false;
        const priceChecked = priceEl ? priceEl.checked : false;
        const featChecked = featEl ? featEl.checked : false;
        
        currentSettings.weeklyNewsletter = newsChecked;
        currentSettings.priceAlerts = priceChecked;
        currentSettings.featureUpdates = featChecked;
        
        await saveSettings();
        
        console.log('📧 Sync newsletter...');
        try {
            await syncNewsletterSubscription(newsChecked);
            showToast('success', 'Succès', 'Notifications sauvegardées');
        } catch (syncError) {
            console.warn('⚠ Sync échouée:', syncError);
            showToast('warning', 'Attention', 'Sauvegardé mais sync newsletter échouée');
        }
        
    } catch (error) {
        console.error('❌ Erreur saveNotif:', error);
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
        showToast('success', 'Succès', 'Paramètres de confidentialité sauvegardés');
    } catch (error) {
        console.error('❌ Erreur savePrivacy:', error);
        showToast('error', 'Erreur', 'Impossible de sauvegarder');
    }
}

async function saveSettings() {
    try {
        localStorage.setItem('financepro_settings', JSON.stringify(currentSettings));
        console.log('✅ localStorage OK');
        
        if (currentUserData &amp;&amp; isFirebaseInitialized()) {
            const ref = firebaseDb.collection('users').doc(currentUserData.uid).collection('settings').doc('preferences');
            await ref.set(currentSettings, { merge: true });
            console.log('✅ Firestore OK');
        }
    } catch (error) {
        console.error('❌ Erreur save:', error);
        throw error;
    }
}

// ============================================
// SYNCHRONISATION NEWSLETTER
// ============================================

async function syncNewsletterSubscription(isSubscribed) {
    if (!currentUserData || !currentUserData.email) {
        console.warn('⚠ Pas d\'email');
        throw new Error('No email');
    }
    
    console.log('📧 Sync: ' + (isSubscribed ? 'INSCRIPTION' : 'DÉSINSCRIPTION'));
    
    try {
        if (isSubscribed) {
            const res = await fetch(NEWSLETTER_WORKER_URL + '/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentUserData.email,
                    name: currentUserData.displayName || currentUserData.email.split('@')[0]
                })
            });
            
            if (!res.ok) {
                const err = await res.json();
                if (err.error === 'Already subscribed') {
                    console.log('✅ Déjà inscrit');
                    return;
                }
                throw new Error(err.error || 'Erreur inscription');
            }
            
            const result = await res.json();
            console.log('✅ Inscription OK:', result);
            
        } else {
            const res = await fetch(NEWSLETTER_WORKER_URL + '/unsubscribe?email=' + encodeURIComponent(currentUserData.email));
            
            if (!res.ok) {
                throw new Error('Erreur désinscription');
            }
            
            console.log('✅ Désinscription OK');
        }
        
    } catch (error) {
        console.error('❌ Erreur sync:', error);
        throw error;
    }
}

// ============================================
// GESTION DONNÉES
// ============================================

async function exportUserData() {
    if (!currentUserData) {
        showToast('error', 'Erreur', 'Vous devez être connecté');
        return;
    }
    
    try {
        const data = {
            user: currentUserData,
            settings: currentSettings,
            exportDate: new Date().toISOString()
        };
        
        const str = JSON.stringify(data, null, 2);
        const blob = new Blob([str], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'alphavault-export-' + Date.now() + '.json';
        link.click();
        
        showToast('success', 'Succès', 'Données exportées');
    } catch (error) {
        console.error('❌ Erreur export:', error);
        showToast('error', 'Erreur', 'Export impossible');
    }
}

function clearCache() {
    if (!confirm('Vider le cache ?\n\nCela supprimera les données temporaires.')) {
        return;
    }
    
    try {
        const keep = ['financepro_user', 'financepro_theme', 'financepro_settings'];
        const all = Object.keys(localStorage);
        
        for (let i = 0; i &lt; all.length; i++) {
            let shouldDelete = true;
            for (let j = 0; j &lt; keep.length; j++) {
                if (all[i] === keep[j]) {
                    shouldDelete = false;
                    break;
                }
            }
            if (shouldDelete) {
                localStorage.removeItem(all[i]);
            }
        }
        
        showToast('success', 'Succès', 'Cache vidé');
    } catch (error) {
        console.error('❌ Erreur clear:', error);
        showToast('error', 'Erreur', 'Impossible de vider le cache');
    }
}

async function deleteAllAnalyses() {
    if (!confirm('ATTENTION\n\nSupprimer TOUTES vos analyses ?\n\nCette action est IRRÉVERSIBLE !')) {
        return;
    }
    
    try {
        if (!currentUserData || !isFirebaseInitialized()) {
            throw new Error('Firebase non disponible');
        }
        
        const ref = firebaseDb.collection('users').doc(currentUserData.uid).collection('analyses');
        const snap = await ref.get();
        const batch = firebaseDb.batch();
        
        for (let i = 0; i &lt; snap.docs.length; i++) {
            batch.delete(snap.docs[i].ref);
        }
        
        await batch.commit();
        showToast('success', 'Succès', snap.size + ' analyses supprimées');
    } catch (error) {
        console.error('❌ Erreur:', error);
        showToast('error', 'Erreur', 'Suppression impossible');
    }
}

async function deleteAllPortfolios() {
    if (!confirm('ATTENTION\n\nSupprimer TOUS vos portfolios ?\n\nCette action est IRRÉVERSIBLE !')) {
        return;
    }
    
    try {
        if (!currentUserData || !isFirebaseInitialized()) {
            throw new Error('Firebase non disponible');
        }
        
        const ref = firebaseDb.collection('users').doc(currentUserData.uid).collection('portfolios');
        const snap = await ref.get();
        const batch = firebaseDb.batch();
        
        for (let i = 0; i &lt; snap.docs.length; i++) {
            batch.delete(snap.docs[i].ref);
        }
        
        await batch.commit();
        showToast('success', 'Succès', snap.size + ' portfolios supprimés');
    } catch (error) {
        console.error('❌ Erreur:', error);
        showToast('error', 'Erreur', 'Suppression impossible');
    }
}

// ============================================
// TOAST
// ============================================

function showToast(type, title, message) {
    const container = document.getElementById('toastContainer');
    
    if (!container) {
        console.log('[' + type + '] ' + title + ': ' + message);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-times-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    
    toast.innerHTML = '<i></i>' +
        '' + title + '' +
        '' + message + '' +
        '<i></i>';
    
    container.appendChild(toast);
    
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

console.log('✅ Settings.js chargé (VERSION PROPRE)');