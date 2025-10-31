/* ==============================================
   DARK-MODE.JS - Gestion du mode sombre
   ============================================== */

(function() {
    'use strict';
    
    const STORAGE_KEY = 'dark-mode-preference';
    
    // Initialiser le mode sombre
    function initDarkMode() {
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (!darkModeToggle) {
            console.warn('Dark mode toggle button not found');
            return;
        }
        
        // Récupérer la préférence sauvegardée
        const savedPreference = localStorage.getItem(STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Appliquer le mode sombre si préférence ou système
        if (savedPreference === 'dark' || (!savedPreference && prefersDark)) {
            enableDarkMode();
        }
        
        // Event listener sur le bouton
        darkModeToggle.addEventListener('click', toggleDarkMode);
        
        // Écouter les changements de préférence système
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(STORAGE_KEY)) {
                if (e.matches) {
                    enableDarkMode();
                } else {
                    disableDarkMode();
                }
            }
        });
    }
    
    // Activer le mode sombre
    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        updateToggleIcon(true);
        localStorage.setItem(STORAGE_KEY, 'dark');
        
        // Mettre à jour les charts Highcharts si ils existent
        updateHighchartsTheme(true);
    }
    
    // Désactiver le mode sombre
    function disableDarkMode() {
        document.body.classList.remove('dark-mode');
        updateToggleIcon(false);
        localStorage.setItem(STORAGE_KEY, 'light');
        
        // Mettre à jour les charts Highcharts
        updateHighchartsTheme(false);
    }
    
    // Toggle entre dark et light
    function toggleDarkMode() {
        if (document.body.classList.contains('dark-mode')) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    }
    
    // Mettre à jour l'icône du bouton
    function updateToggleIcon(isDark) {
        const icon = document.querySelector('#darkModeToggle i');
        if (!icon) return;
        
        if (isDark) {
            icon.className = 'fas fa-sun';
        } else {
            icon.className = 'fas fa-moon';
        }
    }
    
    // Mettre à jour le thème Highcharts
    function updateHighchartsTheme(isDark) {
        if (typeof Highcharts === 'undefined') return;
        
        // Les charts se mettront à jour automatiquement grâce au CSS
        // On peut forcer un redraw si nécessaire
        if (window.MarketData && window.MarketData.charts) {
            Object.values(window.MarketData.charts).forEach(chart => {
                if (chart && chart.reflow) {
                    setTimeout(() => chart.reflow(), 100);
                }
            });
        }
    }
    
    // Initialiser au chargement du DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDarkMode);
    } else {
        initDarkMode();
    }
    
    // Export pour usage externe
    window.DarkMode = {
        enable: enableDarkMode,
        disable: disableDarkMode,
        toggle: toggleDarkMode,
        isEnabled: () => document.body.classList.contains('dark-mode')
    };
    
})();