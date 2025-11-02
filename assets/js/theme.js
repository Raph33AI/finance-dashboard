/* ============================================
   THEME.JS - Gestion globale du thème
   ============================================ */

/**
 * Script de gestion du thème
 * DOIT être chargé en premier pour éviter le flash de thème incorrect
 */

(function() {
    'use strict';
    
    /**
     * Applique immédiatement le thème au chargement
     * Appelé de manière synchrone pour éviter le flash
     */
    function applyThemeImmediately() {
        // Récupérer le thème depuis localStorage
        const savedTheme = localStorage.getItem('theme') || 'dark';
        
        applyTheme(savedTheme);
        
        console.log('🎨 Thème appliqué au chargement:', savedTheme);
    }
    
    /**
     * Applique un thème spécifique
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
                const prefersDark = window.matchMedia && 
                                   window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                if (prefersDark) {
                    body.classList.add('dark-mode');
                } else {
                    body.classList.remove('dark-mode');
                }
                break;
            
            default:
                body.classList.add('dark-mode');
        }
    }
    
    /**
     * Écouter les changements de préférences système (pour mode auto)
     */
    function watchSystemTheme() {
        if (!window.matchMedia) return;
        
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
            const savedTheme = localStorage.getItem('theme');
            
            // Seulement si le mode auto est activé
            if (savedTheme === 'auto') {
                applyTheme('auto');
                console.log('🎨 Thème système changé:', e.matches ? 'dark' : 'light');
            }
        });
    }
    
    /**
     * Écouter les changements de thème dans d'autres onglets
     */
    function watchStorageChanges() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'theme' && e.newValue) {
                applyTheme(e.newValue);
                console.log('🎨 Thème synchronisé depuis un autre onglet:', e.newValue);
            }
        });
    }
    
    /**
     * Fonction publique pour changer le thème
     */
    window.setTheme = function(theme) {
        if (!['light', 'dark', 'auto'].includes(theme)) {
            console.error('❌ Thème invalide:', theme);
            return;
        }
        
        // Sauvegarder dans localStorage
        localStorage.setItem('theme', theme);
        
        // Appliquer le thème
        applyTheme(theme);
        
        // Sauvegarder dans Firestore si l'utilisateur est connecté
        saveThemeToFirestore(theme);
        
        console.log('🎨 Thème changé:', theme);
    };
    
    /**
     * Sauvegarder le thème dans Firestore
     */
    async function saveThemeToFirestore(theme) {
        // Attendre que Firebase soit initialisé
        if (typeof firebase === 'undefined' || !firebase.auth) {
            console.log('⏳ Firebase non encore chargé, thème sauvegardé en local uniquement');
            return;
        }
        
        const user = firebase.auth().currentUser;
        if (!user) {
            console.log('👤 Utilisateur non connecté, thème sauvegardé en local uniquement');
            return;
        }
        
        try {
            await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .collection('settings')
                .doc('preferences')
                .set({
                    theme: theme,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            
            console.log('✅ Thème sauvegardé dans Firestore');
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde du thème:', error);
        }
    }
    
    /**
     * Charger le thème depuis Firestore
     */
    window.loadThemeFromFirestore = async function() {
        if (typeof firebase === 'undefined' || !firebase.auth) {
            console.log('⏳ Firebase non encore chargé');
            return;
        }
        
        const user = firebase.auth().currentUser;
        if (!user) return;
        
        try {
            const doc = await firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .collection('settings')
                .doc('preferences')
                .get();
            
            if (doc.exists && doc.data().theme) {
                const theme = doc.data().theme;
                
                // Sauvegarder dans localStorage
                localStorage.setItem('theme', theme);
                
                // Appliquer le thème
                applyTheme(theme);
                
                console.log('✅ Thème chargé depuis Firestore:', theme);
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement du thème:', error);
        }
    };
    
    /**
     * Récupérer le thème actuel
     */
    window.getCurrentTheme = function() {
        return localStorage.getItem('theme') || 'dark';
    };
    
    // ============================================
    // INITIALISATION IMMÉDIATE
    // ============================================
    
    // Appliquer le thème IMMÉDIATEMENT (synchrone)
    applyThemeImmediately();
    
    // Après le chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            watchSystemTheme();
            watchStorageChanges();
        });
    } else {
        watchSystemTheme();
        watchStorageChanges();
    }
    
    // Charger depuis Firestore quand l'utilisateur est connecté
    window.addEventListener('userDataLoaded', () => {
        window.loadThemeFromFirestore();
    });
    
    console.log('✅ Système de thème initialisé');
    
})();