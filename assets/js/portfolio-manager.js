/* ==============================================
   PORTFOLIO-MANAGER.JS - Gestion Multi-Portefeuilles Market Data
   Version Cloud avec Cloudflare Workers
   ============================================== */

const PortfolioManager = (function() {
    'use strict';
    
    // ========== VARIABLES PRIVÉES ==========
    let currentPortfolioName = 'default';
    let availablePortfolios = [];
    let cloudflareWorkerURL = 'https://finance-dashboard-storage.raphael-nardone.workers.dev';
    
    // ========== INITIALISATION ==========
    
    /**
     * Initialise le gestionnaire de portefeuilles
     */
    async function init() {
        console.log('🚀 Initializing Portfolio Manager...');
        
        // Attendre que Firebase soit prêt
        await waitForFirebaseAuth();
        
        // Charger le portfolio courant depuis localStorage
        const savedPortfolio = localStorage.getItem('currentMarketPortfolio');
        if (savedPortfolio) {
            currentPortfolioName = savedPortfolio;
        }
        
        // Charger la liste des portefeuilles
        await loadPortfoliosList();
        
        // Mettre à jour l'affichage
        updateCurrentPortfolioDisplay();
        
        console.log('✅ Portfolio Manager initialized');
    }
    
    /**
     * Attend que Firebase Auth soit prêt
     */
    function waitForFirebaseAuth() {
        return new Promise((resolve) => {
            if (!firebase || !firebase.auth) {
                console.warn('⚠️ Firebase not available, Portfolio Manager will work in local mode');
                resolve();
                return;
            }
            
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ Firebase Auth ready for Portfolio Manager');
                    unsubscribe();
                    resolve();
                }
            });
        });
    }
    
    // ========== GESTION DES PORTEFEUILLES ==========
    
    /**
     * Charge la liste des portefeuilles depuis le cloud
     */
    async function loadPortfoliosList() {
        try {
            const user = firebase.auth().currentUser;
            if (!user) {
                console.warn('⚠️ No user authenticated');
                availablePortfolios = [{ name: 'default', createdAt: Date.now() }];
                return;
            }
            
            const idToken = await user.getIdToken();
            
            const response = await fetch(`${cloudflareWorkerURL}/portfolios/list`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            availablePortfolios = data.portfolios || [];
            
            // S'assurer que 'default' existe toujours
            if (!availablePortfolios.some(p => p.name === 'default')) {
                availablePortfolios.unshift({ name: 'default', createdAt: Date.now() });
            }
            
            console.log('✅ Loaded portfolios list:', availablePortfolios.length);
            
        } catch (error) {
            console.error('❌ Error loading portfolios list:', error);
            availablePortfolios = [{ name: 'default', createdAt: Date.now() }];
        }
    }
    
    /**
     * Charge un portefeuille depuis le cloud
     */
    async function loadPortfolio(name) {
        try {
            console.log(`📥 Loading portfolio "${name}" from cloud...`);
            
            const user = firebase.auth().currentUser;
            if (!user) {
                console.warn('⚠️ No user authenticated, loading from localStorage');
                return loadFromLocalStorage(name);
            }
            
            const idToken = await user.getIdToken();
            
            const response = await fetch(`${cloudflareWorkerURL}/portfolios/${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('ℹ️ Portfolio not found in cloud, creating new one');
                    return null;
                }
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ Portfolio loaded from cloud');
            
            return data;
            
        } catch (error) {
            console.error('❌ Error loading portfolio:', error);
            return loadFromLocalStorage(name);
        }
    }
    
    /**
     * Sauvegarde un portefeuille dans le cloud
     */
    async function savePortfolio(name, portfolioData) {
        try {
            console.log(`💾 Saving portfolio "${name}" to cloud...`);
            
            const user = firebase.auth().currentUser;
            if (!user) {
                console.warn('⚠️ No user authenticated, saving to localStorage');
                saveToLocalStorage(name, portfolioData);
                return false;
            }
            
            const idToken = await user.getIdToken();
            
            const payload = {
                name: name,
                data: portfolioData,
                timestamp: Date.now()
            };
            
            const response = await fetch(`${cloudflareWorkerURL}/portfolios/${encodeURIComponent(name)}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            console.log('✅ Portfolio saved to cloud');
            
            // Sauvegarder aussi en local (backup)
            saveToLocalStorage(name, portfolioData);
            
            // Mettre à jour la liste
            await loadPortfoliosList();
            
            if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
                window.FinanceDashboard.showNotification(`✅ Portfolio "${name}" saved to cloud`, 'success');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error saving portfolio:', error);
            saveToLocalStorage(name, portfolioData);
            
            if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
                window.FinanceDashboard.showNotification('⚠️ Saved locally (cloud sync failed)', 'warning');
            }
            
            return false;
        }
    }
    
    /**
     * Supprime un portefeuille du cloud
     */
    async function deletePortfolio(name) {
        if (name === 'default') {
            alert('Cannot delete the default portfolio');
            return false;
        }
        
        if (!confirm(`⚠️ Delete portfolio "${name}"?\n\nThis will permanently delete:\n- Watchlist\n- Alerts\n- Comparisons\n\nThis action cannot be undone!`)) {
            return false;
        }
        
        try {
            const user = firebase.auth().currentUser;
            if (!user) {
                console.warn('⚠️ No user authenticated');
                return false;
            }
            
            const idToken = await user.getIdToken();
            
            const response = await fetch(`${cloudflareWorkerURL}/portfolios/${encodeURIComponent(name)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            console.log('✅ Portfolio deleted from cloud');
            
            // Supprimer aussi du localStorage
            localStorage.removeItem(`market_portfolio_${name}`);
            
            // Si c'est le portfolio courant, revenir à 'default'
            if (currentPortfolioName === name) {
                await switchPortfolio('default');
            }
            
            // Recharger la liste
            await loadPortfoliosList();
            renderPortfoliosList();
            
            if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
                window.FinanceDashboard.showNotification(`Portfolio "${name}" deleted`, 'info');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error deleting portfolio:', error);
            
            if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
                window.FinanceDashboard.showNotification('Failed to delete portfolio', 'error');
            }
            
            return false;
        }
    }
    
    /**
     * Change de portefeuille actif
     */
    async function switchPortfolio(name) {
        console.log(`🔄 Switching to portfolio "${name}"...`);
        
        // Sauvegarder le portefeuille actuel avant de changer
        if (window.MarketData && window.MarketData.getCurrentPortfolioData) {
            const currentData = window.MarketData.getCurrentPortfolioData();
            await savePortfolio(currentPortfolioName, currentData);
        }
        
        // Changer le portefeuille courant
        currentPortfolioName = name;
        localStorage.setItem('currentMarketPortfolio', name);
        
        // Charger le nouveau portefeuille
        const portfolioData = await loadPortfolio(name);
        
        // Mettre à jour l'affichage
        updateCurrentPortfolioDisplay();
        
        // Charger les données dans MarketData
        if (window.MarketData && window.MarketData.loadPortfolioData) {
            window.MarketData.loadPortfolioData(portfolioData);
        }
        
        // Fermer le modal
        const modal = document.getElementById('portfoliosModal');
        if (modal) {
            modal.classList.remove('active');
        }
        
        if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
            window.FinanceDashboard.showNotification(`Switched to portfolio "${name}"`, 'success');
        }
    }
    
    /**
     * Crée un nouveau portefeuille
     */
    async function createNewPortfolio() {
        const name = prompt('📁 Enter portfolio name:\n\n(e.g., "Tech Stocks", "Crypto Watch", "Dividend Portfolio")');
        
        if (!name) return;
        
        const trimmedName = name.trim();
        
        if (trimmedName === '') {
            alert('Portfolio name cannot be empty');
            return;
        }
        
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
            alert('Portfolio name can only contain letters, numbers, spaces, hyphens and underscores');
            return;
        }
        
        if (availablePortfolios.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
            alert(`Portfolio "${trimmedName}" already exists`);
            return;
        }
        
        // Créer un portefeuille vide
        const emptyPortfolio = {
            watchlist: [],
            alerts: [],
            comparisonSymbols: [],
            createdAt: Date.now()
        };
        
        const success = await savePortfolio(trimmedName, emptyPortfolio);
        
        if (success) {
            await loadPortfoliosList();
            await switchPortfolio(trimmedName);
            renderPortfoliosList();
        }
    }
    
    /**
     * Duplique un portefeuille
     */
    async function duplicatePortfolio(name) {
        const newName = prompt(`📋 Duplicate "${name}" as:\n\n(New portfolio name)`);
        
        if (!newName) return;
        
        const trimmedName = newName.trim();
        
        if (trimmedName === '') {
            alert('Portfolio name cannot be empty');
            return;
        }
        
        if (availablePortfolios.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
            alert(`Portfolio "${trimmedName}" already exists`);
            return;
        }
        
        // Charger le portefeuille source
        const sourceData = await loadPortfolio(name);
        
        if (!sourceData) {
            alert('Failed to load source portfolio');
            return;
        }
        
        // Créer une copie
        const duplicatedData = {
            watchlist: [...(sourceData.watchlist || [])],
            alerts: [...(sourceData.alerts || [])].map(alert => ({
                ...alert,
                id: Date.now() + Math.random() // Nouveau ID
            })),
            comparisonSymbols: [...(sourceData.comparisonSymbols || [])],
            createdAt: Date.now()
        };
        
        const success = await savePortfolio(trimmedName, duplicatedData);
        
        if (success) {
            await loadPortfoliosList();
            renderPortfoliosList();
            
            if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
                window.FinanceDashboard.showNotification(`Portfolio duplicated as "${trimmedName}"`, 'success');
            }
        }
    }
    
    /**
     * Renomme un portefeuille
     */
    async function renamePortfolio(oldName) {
        if (oldName === 'default') {
            alert('Cannot rename the default portfolio');
            return;
        }
        
        const newName = prompt(`✏️ Rename "${oldName}" to:`, oldName);
        
        if (!newName || newName.trim() === oldName) return;
        
        const trimmedName = newName.trim();
        
        if (trimmedName === '') {
            alert('Portfolio name cannot be empty');
            return;
        }
        
        if (availablePortfolios.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
            alert(`Portfolio "${trimmedName}" already exists`);
            return;
        }
        
        try {
            // Charger les données
            const portfolioData = await loadPortfolio(oldName);
            
            if (!portfolioData) {
                alert('Failed to load portfolio');
                return;
            }
            
            // Sauvegarder avec le nouveau nom
            const success = await savePortfolio(trimmedName, portfolioData);
            
            if (success) {
                // Supprimer l'ancien
                await deletePortfolioSilent(oldName);
                
                // Si c'était le portefeuille courant, mettre à jour
                if (currentPortfolioName === oldName) {
                    currentPortfolioName = trimmedName;
                    localStorage.setItem('currentMarketPortfolio', trimmedName);
                    updateCurrentPortfolioDisplay();
                }
                
                await loadPortfoliosList();
                renderPortfoliosList();
                
                if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
                    window.FinanceDashboard.showNotification(`Portfolio renamed to "${trimmedName}"`, 'success');
                }
            }
            
        } catch (error) {
            console.error('Error renaming portfolio:', error);
            alert('Failed to rename portfolio');
        }
    }
    
    /**
     * Supprime un portefeuille sans confirmation (pour le renommage)
     */
    async function deletePortfolioSilent(name) {
        try {
            const user = firebase.auth().currentUser;
            if (!user) return;
            
            const idToken = await user.getIdToken();
            
            await fetch(`${cloudflareWorkerURL}/portfolios/${encodeURIComponent(name)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            localStorage.removeItem(`market_portfolio_${name}`);
            
        } catch (error) {
            console.error('Error deleting portfolio silently:', error);
        }
    }
    
    // ========== AFFICHAGE ==========
    
    /**
     * Met à jour l'affichage du portefeuille courant
     */
    function updateCurrentPortfolioDisplay() {
        const displayElement = document.getElementById('currentPortfolioName');
        if (displayElement) {
            displayElement.textContent = currentPortfolioName;
        }
    }
    
    /**
     * Affiche la liste des portefeuilles dans le modal
     */
    function renderPortfoliosList() {
        const container = document.getElementById('portfoliosListContainer');
        if (!container) return;
        
        if (availablePortfolios.length === 0) {
            container.innerHTML = `
                <div class='no-portfolios'>
                    <i class='fas fa-folder-open'></i>
                    <p>No portfolios found</p>
                    <button class='btn btn-primary' onclick='PortfolioManager.createNewPortfolio()'>
                        <i class='fas fa-plus'></i> Create First Portfolio
                    </button>
                </div>
            `;
            return;
        }
        
        const sortedPortfolios = [...availablePortfolios].sort((a, b) => {
            if (a.name === 'default') return -1;
            if (b.name === 'default') return 1;
            return b.createdAt - a.createdAt;
        });
        
        let html = '<div class="simulations-list">';
        
        sortedPortfolios.forEach(portfolio => {
            const isCurrent = portfolio.name === currentPortfolioName;
            const createdDate = new Date(portfolio.createdAt).toLocaleDateString('fr-FR');
            const isDefault = portfolio.name === 'default';
            
            html += `
                <div class='simulation-item ${isCurrent ? 'active' : ''}'>
                    <div class='simulation-info'>
                        <div class='simulation-name'>
                            <i class='fas fa-${isCurrent ? 'folder-open' : 'folder'}'></i>
                            ${escapeHtml(portfolio.name)}
                            ${isCurrent ? '<span class="badge-current">ACTIVE</span>' : ''}
                            ${isDefault ? '<span class="badge-default">DEFAULT</span>' : ''}
                        </div>
                        <div class='simulation-meta'>
                            <span><i class='fas fa-calendar'></i> Created: ${createdDate}</span>
                        </div>
                    </div>
                    
                    <div class='simulation-actions'>
                        ${!isCurrent ? `
                            <button class='btn btn-sm btn-primary' onclick='PortfolioManager.switchPortfolio("${escapeHtml(portfolio.name)}")' title='Load this portfolio'>
                                <i class='fas fa-folder-open'></i> Load
                            </button>
                        ` : `
                            <button class='btn btn-sm btn-success' disabled title='Currently active'>
                                <i class='fas fa-check'></i> Active
                            </button>
                        `}
                        
                        <button class='btn btn-sm btn-secondary' onclick='PortfolioManager.duplicatePortfolio("${escapeHtml(portfolio.name)}")' title='Duplicate'>
                            <i class='fas fa-copy'></i>
                        </button>
                        
                        ${!isDefault ? `
                            <button class='btn btn-sm btn-secondary' onclick='PortfolioManager.renamePortfolio("${escapeHtml(portfolio.name)}")' title='Rename'>
                                <i class='fas fa-edit'></i>
                            </button>
                            
                            <button class='btn btn-sm btn-danger' onclick='PortfolioManager.deletePortfolio("${escapeHtml(portfolio.name)}")' title='Delete'>
                                <i class='fas fa-trash'></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        container.innerHTML = html;
    }
    
    // ========== STORAGE LOCAL (FALLBACK) ==========
    
    /**
     * Charge depuis localStorage
     */
    function loadFromLocalStorage(name) {
        try {
            const saved = localStorage.getItem(`market_portfolio_${name}`);
            if (saved) {
                return JSON.parse(saved);
            }
            return null;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return null;
        }
    }
    
    /**
     * Sauvegarde dans localStorage
     */
    function saveToLocalStorage(name, data) {
        try {
            localStorage.setItem(`market_portfolio_${name}`, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }
    
    // ========== UTILITAIRES ==========
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Récupère le nom du portefeuille courant
     */
    function getCurrentPortfolioName() {
        return currentPortfolioName;
    }
    
    /**
     * Récupère la liste des portefeuilles
     */
    function getAvailablePortfolios() {
        return availablePortfolios;
    }
    
    // ========== EXPORTS PUBLICS ==========
    return {
        init,
        loadPortfolio,
        savePortfolio,
        deletePortfolio,
        switchPortfolio,
        createNewPortfolio,
        duplicatePortfolio,
        renamePortfolio,
        renderPortfoliosList,
        getCurrentPortfolioName,
        getAvailablePortfolios,
        updateCurrentPortfolioDisplay
    };
})();

// ========== EXPOSITION GLOBALE ==========
window.PortfolioManager = PortfolioManager;

// ========== INITIALISATION ==========
window.addEventListener('DOMContentLoaded', () => {
    // Attendre un peu pour que Firebase soit prêt
    setTimeout(() => {
        PortfolioManager.init();
    }, 500);
});

console.log('✅ Portfolio Manager loaded - Cloud version');