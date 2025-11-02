/* ============================================
   THEME.JS - Gestion du thème (Light/Dark/Auto)
   ============================================ */

(function() {
    'use strict';
    
    // Thème par défaut
    let currentTheme = 'dark';
    
    /**
     * Appliquer un thème
     */
    function applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'auto') {
            // Détecter la préférence système
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            html.setAttribute('data-theme', theme);
        }
        
        currentTheme = theme;
        localStorage.setItem('financepro_theme', theme);
        
        console.log('🎨 Thème appliqué:', theme);
    }
    
    /**
     * Charger le thème au démarrage
     */
    function loadTheme() {
        // Priorité 1: localStorage
        const savedTheme = localStorage.getItem('financepro_theme');
        if (savedTheme) {
            applyTheme(savedTheme);
            console.log('🎨 Thème appliqué au chargement:', savedTheme);
            return;
        }
        
        // Priorité 2: Thème par défaut
        applyTheme('dark');
    }
    
    /**
     * Synchroniser avec Firestore (optionnel)
     */
    async function syncThemeWithFirestore() {
        try {
            const user = firebase.auth().currentUser;
            if (!user) return;
            
            const themeRef = firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .collection('settings')
                .doc('preferences');
            
            await themeRef.set({
                theme: currentTheme
            }, { merge: true });
            
            console.log('✅ Thème synchronisé avec Firestore');
            
        } catch (error) {
            // Ignorer silencieusement les erreurs de sync
            console.log('ℹ️ Sync Firestore ignorée:', error.code);
        }
    }
    
    /**
     * Changer le thème
     */
    window.setTheme = function(theme) {
        applyTheme(theme);
        syncThemeWithFirestore();
    };
    
    /**
     * Obtenir le thème actuel
     */
    window.getCurrentTheme = function() {
        return currentTheme;
    };
    
    // Charger le thème au démarrage
    loadTheme();
    
    // Synchroniser quand l'utilisateur se connecte
    window.addEventListener('userDataLoaded', () => {
        syncThemeWithFirestore();
    });
    
    // Écouter les changements de préférence système
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (currentTheme === 'auto') {
            applyTheme('auto');
        }
    });
    
    console.log('✅ Système de thème initialisé');
    
})();