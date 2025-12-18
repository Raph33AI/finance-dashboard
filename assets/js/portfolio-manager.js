// ═══════════════════════════════════════════════════════════════
// 📁 PORTFOLIO MANAGER - Multi-portfolios avec Cloud Sync
// Version complète - Toutes fonctionnalités + Modals
// ═══════════════════════════════════════════════════════════════

const PortfolioManager = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // 🔥 FIREBASE INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    let firebaseReady = false;
    let currentUser = null;
    const FIREBASE_TIMEOUT = 15000;

    function waitForFirebase() {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const checkAuth = setInterval(() => {
                const elapsed = Date.now() - startTime;
                
                if (window.firebase && firebase.auth) {
                    const auth = firebase.auth();
                    
                    auth.onAuthStateChanged((user) => {
                        clearInterval(checkAuth);
                        firebaseReady = true;
                        currentUser = user;
                        
                        if (user) {
                            console.log('✅ Firebase Auth ready - User:', user.email);
                        } else {
                            console.log('✅ Firebase Auth ready - No user');
                        }
                        
                        resolve(true);
                    }, (error) => {
                        console.error('❌ Firebase Auth error:', error);
                        clearInterval(checkAuth);
                        resolve(false);
                    });
                }
                
                if (elapsed > FIREBASE_TIMEOUT) {
                    clearInterval(checkAuth);
                    console.warn('⚠ Firebase Auth timeout after 15s, continuing with local mode');
                    resolve(false);
                }
            }, 100);
        });
    }

    /**
     * 🔧 Assurer que le document utilisateur existe
     */
    async function ensureUserDocument() {
        if (!firebaseReady || !currentUser) {
            return false;
        }
        
        try {
            const db = firebase.firestore();
            const userId = currentUser.uid;
            const userRef = db.collection('users').doc(userId);
            
            const doc = await userRef.get();
            
            if (!doc.exists) {
                console.log('📝 Creating user document...');
                
                await userRef.set({
                    email: currentUser.email,
                    displayName: currentUser.displayName || 'User',
                    photoURL: currentUser.photoURL || null,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                console.log('✅ User document created');
            } else {
                await userRef.update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error ensuring user document:', error);
            return false;
        }
    }

    /**
     * 🔧 Assurer qu'au moins le portfolio "default" existe
     */
    async function ensureDefaultPortfolio() {
        if (!firebaseReady || !currentUser) {
            // Mode local : créer default si n'existe pas
            const localDefault = localStorage.getItem('portfolio_default');
            if (!localDefault) {
                console.log('📝 Creating default portfolio locally...');
                const defaultData = createDefaultPortfolioData('default');
                localStorage.setItem('portfolio_default', JSON.stringify(defaultData));
            }
            return false;
        }
        
        try {
            const db = firebase.firestore();
            const userId = currentUser.uid;
            
            // Vérifier si le portfolio "default" existe
            const defaultDoc = await db
                .collection('users')
                .doc(userId)
                .collection('portfolios')
                .doc('default')
                .get();
            
            if (!defaultDoc.exists) {
                console.log('📝 Creating default portfolio in cloud...');
                
                const defaultData = createDefaultPortfolioData('default');
                
                await db
                    .collection('users')
                    .doc(userId)
                    .collection('portfolios')
                    .doc('default')
                    .set(defaultData);
                
                console.log('✅ Default portfolio created');
            } else {
                console.log('✅ Default portfolio already exists');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error ensuring default portfolio:', error);
            
            // Fallback local
            const localDefault = localStorage.getItem('portfolio_default');
            if (!localDefault) {
                const defaultData = createDefaultPortfolioData('default');
                localStorage.setItem('portfolio_default', JSON.stringify(defaultData));
            }
            
            return false;
        }
    }

    /**
     * 📋 Créer les données par défaut d'un portfolio
     */
    function createDefaultPortfolioData(name) {
        return {
            name: name,
            watchlist: [],
            alerts: [],
            comparisons: [],
            comparisonSymbols: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    // Initialiser au chargement
    (async function init() {
        console.log('🔄 Initializing Portfolio Manager...');
        await waitForFirebase();
        
        if (!firebaseReady) {
            console.warn('⚠ Running in LOCAL MODE (Firebase not available)');
        } else {
            await ensureUserDocument();
            await ensureDefaultPortfolio();
        }
    })();

    // ═══════════════════════════════════════════════════════════════
    // 📊 GESTION DES PORTFOLIOS
    // ═══════════════════════════════════════════════════════════════

    let currentPortfolio = localStorage.getItem('currentPortfolio') || 'default';

    /**
     * 📋 Lister tous les portfolios
     */
    async function listPortfolios() {
        if (!firebaseReady || !currentUser) {
            return listLocalPortfolios();
        }
        
        try {
            const db = firebase.firestore();
            const userId = currentUser.uid;
            
            const snapshot = await db
                .collection('users')
                .doc(userId)
                .collection('portfolios')
                .get();
            
            const portfolios = [];
            snapshot.forEach((doc) => {
                portfolios.push({
                    name: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('✅ Loaded portfolios list:', portfolios.length);
            
            // Si aucun portfolio, créer default
            if (portfolios.length === 0) {
                console.log('📝 No portfolios found, creating default...');
                await ensureDefaultPortfolio();
                
                // Recharger
                const snapshot2 = await db
                    .collection('users')
                    .doc(userId)
                    .collection('portfolios')
                    .get();
                
                snapshot2.forEach((doc) => {
                    portfolios.push({
                        name: doc.id,
                        ...doc.data()
                    });
                });
            }
            
            return portfolios;
            
        } catch (error) {
            console.error('❌ Error listing portfolios:', error);
            return listLocalPortfolios();
        }
    }

    /**
     * 📋 Lister les portfolios locaux
     */
    function listLocalPortfolios() {
        const portfolios = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('portfolio_')) {
                const name = key.replace('portfolio_', '');
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    portfolios.push({
                        name: name,
                        ...data
                    });
                } catch (e) {
                    console.error('Error parsing portfolio:', name, e);
                }
            }
        }
        
        // Si aucun portfolio local, créer default
        if (portfolios.length === 0) {
            console.log('📝 No local portfolios found, creating default...');
            const defaultData = createDefaultPortfolioData('default');
            localStorage.setItem('portfolio_default', JSON.stringify(defaultData));
            portfolios.push({
                name: 'default',
                ...defaultData
            });
        }
        
        console.log('✅ Loaded local portfolios:', portfolios.length);
        return portfolios;
    }

    /**
     * 📥 Charger un portfolio depuis le cloud
     */
    async function loadFromCloud(portfolioName) {
        console.log(`📥 Loading portfolio "${portfolioName}" from cloud...`);
        
        if (!firebaseReady || !currentUser) {
            return loadFromLocal(portfolioName);
        }
        
        try {
            const db = firebase.firestore();
            const userId = currentUser.uid;
            
            const doc = await db
                .collection('users')
                .doc(userId)
                .collection('portfolios')
                .doc(portfolioName)
                .get();
            
            if (doc.exists) {
                const data = doc.data();
                console.log('✅ Portfolio loaded from cloud');
                
                localStorage.setItem(`portfolio_${portfolioName}`, JSON.stringify(data));
                
                return data;
            } else {
                console.log('⚠ Portfolio not found in cloud, checking local...');
                return loadFromLocal(portfolioName);
            }
            
        } catch (error) {
            console.error('❌ Error loading from cloud:', error);
            return loadFromLocal(portfolioName);
        }
    }

    /**
     * 📥 Charger un portfolio depuis le stockage local
     */
    function loadFromLocal(portfolioName) {
        const key = `portfolio_${portfolioName}`;
        const data = localStorage.getItem(key);
        
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Error parsing local portfolio:', e);
                return createDefaultPortfolioData(portfolioName);
            }
        }
        
        return createDefaultPortfolioData(portfolioName);
    }

    /**
     * 💾 Sauvegarder un portfolio dans le cloud
     */
    async function saveToCloud(portfolioName, data) {
        console.log(`💾 Saving portfolio "${portfolioName}" to cloud...`);
        
        if (!firebaseReady || !currentUser) {
            console.warn('⚠ Firebase not ready, saving locally only');
            localStorage.setItem(`portfolio_${portfolioName}`, JSON.stringify(data));
            return false;
        }
        
        try {
            await ensureUserDocument();
            
            const db = firebase.firestore();
            const userId = currentUser.uid;
            
            const portfolioData = {
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdAt: data.createdAt || firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const savePromise = db
                .collection('users')
                .doc(userId)
                .collection('portfolios')
                .doc(portfolioName)
                .set(portfolioData, { merge: true });
            
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Save timeout')), 10000);
            });
            
            await Promise.race([savePromise, timeoutPromise]);
            
            console.log('✅ Portfolio saved to cloud');
            
            localStorage.setItem(`portfolio_${portfolioName}`, JSON.stringify(data));
            
            showNotification(`Portfolio "${portfolioName}" saved successfully!`, 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error saving to cloud:', error);
            console.warn('💾 Falling back to local storage');
            
            localStorage.setItem(`portfolio_${portfolioName}`, JSON.stringify(data));
            
            showNotification(`Portfolio saved locally (offline mode)`, 'warning');
            
            return false;
        }
    }

    /**
     * 🗑 Supprimer un portfolio de Firebase
     */
    async function deleteFromCloud(portfolioName) {
        if (!firebaseReady || !currentUser) {
            console.warn('⚠ Firebase not ready, cannot delete from cloud');
            return false;
        }
        
        try {
            const db = firebase.firestore();
            const userId = currentUser.uid;
            
            await db
                .collection('users')
                .doc(userId)
                .collection('portfolios')
                .doc(portfolioName)
                .delete();
            
            console.log(`🗑 Portfolio "${portfolioName}" deleted from cloud`);
            return true;
            
        } catch (error) {
            console.error('❌ Error deleting from cloud:', error);
            throw error;
        }
    }

    /**
     * 🗑 Supprimer un portfolio
     */
    async function deletePortfolio(portfolioName) {
        if (portfolioName === 'default') {
            console.warn('⚠ Cannot delete default portfolio');
            showNotification('Cannot delete default portfolio', 'error');
            return false;
        }
        
        if (!confirm(`Are you sure you want to delete portfolio "${portfolioName}"?\n\nThis action cannot be undone.`)) {
            return false;
        }
        
        console.log(`🗑 Deleting portfolio "${portfolioName}"...`);
        
        try {
            // Supprimer du cloud
            if (firebaseReady && currentUser) {
                await deleteFromCloud(portfolioName);
            }
            
            // Supprimer du local storage
            localStorage.removeItem(`portfolio_${portfolioName}`);
            
            // Si c'était le portfolio actif, switcher vers default
            if (currentPortfolio === portfolioName) {
                currentPortfolio = 'default';
                localStorage.setItem('currentPortfolio', 'default');
                await switchPortfolio('default');
            }
            
            // Rafraîchir l'UI
            await loadPortfoliosList();
            
            showNotification(`Portfolio "${portfolioName}" deleted successfully!`, 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error deleting portfolio:', error);
            showNotification('Error deleting portfolio', 'error');
            return false;
        }
    }

    /**
     * 🔄 Changer de portfolio actif
     */
    async function switchPortfolio(portfolioName) {
        console.log(`🔄 Switching to portfolio "${portfolioName}"...`);
        
        currentPortfolio = portfolioName;
        localStorage.setItem('currentPortfolio', portfolioName);
        
        const data = await loadFromCloud(portfolioName);
        
        updateCurrentPortfolioDisplay(portfolioName);
        
        // Rafraîchir le dropdown
        await loadPortfoliosList();
        
        // Recharger la watchlist si disponible
        if (window.WatchlistManager && window.WatchlistManager.loadWatchlist) {
            await window.WatchlistManager.loadWatchlist();
        }
        
        // Appliquer les données au MarketData (si disponible)
        if (window.MarketData && window.MarketData.loadPortfolioData) {
            window.MarketData.loadPortfolioData(data);
        }
        
        showNotification(`Switched to portfolio "${portfolioName}"`, 'success');
        
        return data;
    }

    // ═══════════════════════════════════════════════════════════════
    // 🆕 MODAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    /**
     * 📂 Ouvrir la modal de création de portfolio
     */
    function openCreateModal() {
        console.log('📂 Opening create portfolio modal...');
        const modal = document.getElementById('modalCreatePortfolio');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Réinitialiser le champ input
            const input = document.getElementById('newPortfolioName');
            if (input) {
                input.value = '';
                setTimeout(() => input.focus(), 100);
            }
        } else {
            console.error('❌ Modal #modalCreatePortfolio not found');
        }
    }

    /**
     * ➕ Créer un nouveau portfolio depuis la modal
     */
    async function createPortfolio() {
        const input = document.getElementById('newPortfolioName');
        if (!input) {
            console.error('❌ Input #newPortfolioName not found');
            return;
        }
        
        const portfolioName = input.value.trim();
        
        if (!portfolioName) {
            alert('Please enter a portfolio name');
            return;
        }
        
        if (portfolioName.length < 3) {
            alert('Portfolio name must be at least 3 characters');
            return;
        }
        
        if (portfolioName.length > 50) {
            alert('Portfolio name must be less than 50 characters');
            return;
        }
        
        // Vérifier si le portfolio existe déjà
        const portfolios = await listPortfolios();
        const exists = portfolios.some(p => p.name.toLowerCase() === portfolioName.toLowerCase());
        
        if (exists) {
            alert(`Portfolio "${portfolioName}" already exists`);
            return;
        }
        
        // Créer le portfolio
        const newPortfolio = createDefaultPortfolioData(portfolioName);
        
        try {
            // Sauvegarder
            await saveToCloud(portfolioName, newPortfolio);
            
            console.log(`✅ Portfolio "${portfolioName}" created successfully`);
            
            // Fermer la modal
            closeModal('modalCreatePortfolio');
            
            // Switcher vers le nouveau portfolio
            await switchPortfolio(portfolioName);
            
            // Afficher un message de succès
            showNotification(`Portfolio "${portfolioName}" created successfully!`, 'success');
            
        } catch (error) {
            console.error('❌ Error creating portfolio:', error);
            showNotification('Error creating portfolio. Please try again.', 'error');
        }
    }

    /**
     * ⚙ Ouvrir la modal de gestion des portfolios
     */
    async function openManageModal() {
        console.log('⚙ Opening manage portfolios modal...');
        
        const modal = document.getElementById('modalManagePortfolios');
        if (!modal) {
            console.error('❌ Modal #modalManagePortfolios not found');
            return;
        }
        
        // Charger la liste des portfolios
        const portfolios = await listPortfolios();
        
        // Remplir la liste
        const container = document.getElementById('portfoliosListManage');
        if (!container) {
            console.error('❌ Container #portfoliosListManage not found');
            return;
        }
        
        if (portfolios.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="fas fa-folder-open" style="font-size: 3rem; opacity: 0.3; margin-bottom: 16px;"></i>
                    <p>No portfolios found</p>
                </div>
            `;
        } else {
            container.innerHTML = portfolios.map(portfolio => `
                <div class='portfolio-manage-item'>
                    <div class='portfolio-manage-name'>${escapeHtml(portfolio.name)}</div>
                    <div class='portfolio-manage-actions'>
                        <button class='btn-rename' onclick='PortfolioManager.renamePortfolioModal("${escapeHtml(portfolio.name)}")'>
                            <i class='fas fa-edit'></i> Rename
                        </button>
                        <button class='btn-delete-portfolio' onclick='PortfolioManager.deletePortfolioModal("${escapeHtml(portfolio.name)}")'>
                            <i class='fas fa-trash'></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }
        
        // Ouvrir la modal
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * ✏ Renommer un portfolio depuis la modal
     */
    async function renamePortfolioModal(oldName) {
        if (oldName === 'default') {
            showNotification('Cannot rename default portfolio', 'error');
            return;
        }
        
        const newName = prompt(`Rename portfolio "${oldName}" to:`, oldName);
        
        if (!newName || newName.trim() === '') {
            return;
        }
        
        const trimmedName = newName.trim();
        
        if (trimmedName === oldName) {
            return;
        }
        
        if (trimmedName.length < 3) {
            alert('Portfolio name must be at least 3 characters');
            return;
        }
        
        if (trimmedName.length > 50) {
            alert('Portfolio name must be less than 50 characters');
            return;
        }
        
        try {
            // Charger le portfolio existant
            const portfolioData = await loadFromCloud(oldName);
            
            // Mettre à jour le nom
            portfolioData.name = trimmedName;
            
            // Sauvegarder avec le nouveau nom
            await saveToCloud(trimmedName, portfolioData);
            
            // Supprimer l'ancien
            await deleteFromCloud(oldName);
            localStorage.removeItem(`portfolio_${oldName}`);
            
            console.log(`✅ Portfolio renamed from "${oldName}" to "${trimmedName}"`);
            
            // Si c'était le portfolio actif, switcher vers le nouveau nom
            if (currentPortfolio === oldName) {
                currentPortfolio = trimmedName;
                localStorage.setItem('currentPortfolio', trimmedName);
                updateCurrentPortfolioDisplay(trimmedName);
            }
            
            // Recharger la modal
            await openManageModal();
            
            // Recharger le dropdown
            await loadPortfoliosList();
            
            showNotification(`Portfolio renamed to "${trimmedName}" successfully!`, 'success');
            
        } catch (error) {
            console.error('❌ Error renaming portfolio:', error);
            showNotification('Error renaming portfolio. Please try again.', 'error');
        }
    }

    /**
     * 🗑 Supprimer un portfolio depuis la modal
     */
    async function deletePortfolioModal(portfolioName) {
        const success = await deletePortfolio(portfolioName);
        
        if (success) {
            // Recharger la modal
            await openManageModal();
        }
    }

    /**
     * 🔄 Charger la liste des portfolios dans le dropdown
     */
    async function loadPortfoliosList() {
        const dropdown = document.getElementById('portfolioSelect');
        if (!dropdown) {
            console.warn('⚠ Dropdown #portfolioSelect not found');
            return;
        }
        
        const portfolios = await listPortfolios();
        
        if (portfolios.length === 0) {
            dropdown.innerHTML = '<option value="">No portfolios</option>';
            return;
        }
        
        dropdown.innerHTML = portfolios.map(portfolio => 
            `<option value="${escapeHtml(portfolio.name)}">${escapeHtml(portfolio.name)}</option>`
        ).join('');
        
        // Sélectionner le portfolio actif
        if (currentPortfolio) {
            dropdown.value = currentPortfolio;
        }
        
        console.log(`✅ Portfolio dropdown populated with ${portfolios.length} portfolios`);
    }

    /**
     * ❌ Fermer une modal
     */
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            console.log(`✅ Modal "${modalId}" closed`);
        }
    }

    /**
     * 🔒 Échapper HTML (sécurité XSS)
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ═══════════════════════════════════════════════════════════════
    // 🖼 UI HELPERS
    // ═══════════════════════════════════════════════════════════════

    /**
     * ➕ Créer un nouveau portfolio (méthode existante - conservée pour compatibilité)
     */
    async function createNewPortfolio() {
        const name = prompt('Nom du nouveau portfolio:', '');
        
        if (!name || name.trim() === '') {
            return null;
        }
        
        const portfolioName = name.trim();
        
        const portfolios = await listPortfolios();
        if (portfolios.some(p => p.name === portfolioName)) {
            alert('Un portfolio avec ce nom existe déjà !');
            return null;
        }
        
        // Créer avec les données actuelles ou par défaut
        let data;
        if (window.MarketData && window.MarketData.getCurrentData) {
            data = window.MarketData.getCurrentData();
            data.name = portfolioName;
        } else {
            data = createDefaultPortfolioData(portfolioName);
        }
        
        await saveToCloud(portfolioName, data);
        
        await switchPortfolio(portfolioName);
        
        // Rafraîchir la liste
        await fetchPortfoliosList();
        
        return data;
    }

    /**
     * 🔄 Renommer un portfolio (méthode existante - conservée pour compatibilité)
     */
    async function renamePortfolio(oldName) {
        if (oldName === 'default') {
            showNotification('Cannot rename default portfolio', 'error');
            return false;
        }
        
        const newName = prompt(`Renommer le portfolio "${oldName}" en:`, oldName);
        
        if (!newName || newName === oldName) {
            return false;
        }
        
        const portfolios = await listPortfolios();
        if (portfolios.some(p => p.name === newName)) {
            showNotification('Un portfolio avec ce nom existe déjà', 'error');
            return false;
        }
        
        try {
            // Charger l'ancien portfolio
            const data = await loadFromCloud(oldName);
            
            if (!data) {
                showNotification('Error loading portfolio', 'error');
                return false;
            }
            
            // Mettre à jour le nom
            data.name = newName;
            
            // Créer le nouveau
            await saveToCloud(newName, data);
            
            // Supprimer l'ancien (sans confirmation)
            if (firebaseReady && currentUser) {
                await deleteFromCloud(oldName);
            }
            
            localStorage.removeItem(`portfolio_${oldName}`);
            
            // Si c'était le portfolio actif
            if (currentPortfolio === oldName) {
                currentPortfolio = newName;
                localStorage.setItem('currentPortfolio', newName);
                updateCurrentPortfolioDisplay(newName);
            }
            
            // Rafraîchir la liste
            await fetchPortfoliosList();
            
            showNotification(`Portfolio renamed to "${newName}"`, 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error renaming portfolio:', error);
            showNotification('Error renaming portfolio', 'error');
            return false;
        }
    }

    /**
     * 🔄 Mettre à jour l'affichage du portfolio actuel
     */
    function updateCurrentPortfolioDisplay(portfolioName) {
        const display = document.getElementById('currentPortfolioName');
        if (display) {
            display.textContent = portfolioName || currentPortfolio;
        }
    }

    /**
     * 🔄 Récupérer et afficher la liste des portfolios
     */
    async function fetchPortfoliosList() {
        const portfolios = await listPortfolios();
        updatePortfoliosListUI(portfolios);
        return portfolios;
    }

    /**
     * 🖼 Mettre à jour l'affichage de la liste des portfolios
     * ✅ VERSION SIMPLIFIÉE - NOM UNIQUEMENT
     */
    function updatePortfoliosListUI(portfolios) {
        const container = document.getElementById('portfoliosListContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!portfolios || portfolios.length === 0) {
            container.innerHTML = `
                <div class='no-portfolios'>
                    <i class='fas fa-folder-open' style='font-size: 3em; margin-bottom: 15px; opacity: 0.3;'></i>
                    <p>No saved portfolios yet.</p>
                    <p style='font-size: 0.9em; margin-top: 10px;'>Create your first portfolio to get started!</p>
                </div>
            `;
            return;
        }
        
        portfolios.forEach(portfolio => {
            const item = document.createElement('div');
            item.className = `simulation-item ${portfolio.name === currentPortfolio ? 'active' : ''}`;
            
            // ✅ AFFICHAGE SIMPLIFIÉ - NOM UNIQUEMENT
            item.innerHTML = `
                <div class="simulation-info" onclick="PortfolioManager.loadAndClosePortfolio('${escapeHtml(portfolio.name)}')" style="cursor: pointer; padding: 1rem; width: 100%;">
                    <span class="simulation-name" style="font-size: 1rem; font-weight: 600; color: var(--text-primary);">
                        ${escapeHtml(portfolio.name)}
                    </span>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    /**
     * 🔄 Charge un portfolio et ferme le modal
     */
    async function loadAndClosePortfolio(portfolioName) {
        console.log(`🔄 Loading and switching to portfolio "${portfolioName}"...`);
        
        // Empêcher le double-clic pendant le chargement
        const container = document.getElementById('portfoliosListContainer');
        if (container) {
            container.style.pointerEvents = 'none';
        }
        
        try {
            // Switch vers le portfolio
            await switchPortfolio(portfolioName);
            
            // Fermer le modal
            if (typeof closePortfoliosModal === 'function') {
                closePortfoliosModal();
            } else {
                const modal = document.getElementById('portfoliosModal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            }
            
            showNotification(`Portfolio "${portfolioName}" loaded successfully!`, 'success');
            
        } catch (error) {
            console.error('❌ Error loading portfolio:', error);
            showNotification(`Error loading portfolio "${portfolioName}"`, 'error');
        } finally {
            // Réactiver les clics
            if (container) {
                container.style.pointerEvents = 'auto';
            }
        }
    }

    /**
     * 🔄 Renomme et rafraîchit la liste
     */
    async function renamePortfolioAndRefresh(portfolioName) {
        const success = await renamePortfolio(portfolioName);
        if (success) {
            // La liste est déjà rafraîchie dans renamePortfolio()
        }
    }

    /**
     * 🗑 Supprime et rafraîchit la liste
     */
    async function deletePortfolioAndRefresh(portfolioName) {
        const success = await deletePortfolio(portfolioName);
        if (success) {
            // La liste est déjà rafraîchie dans deletePortfolio()
        }
    }

    /**
     * 🔄 Définir un portfolio par défaut
     */
    async function setDefaultPortfolio(portfolioName) {
        localStorage.setItem('defaultPortfolio', portfolioName);
        console.log(`✅ Default portfolio set to: ${portfolioName}`);
    }

    /**
     * 📖 Obtenir le portfolio par défaut
     */
    function getDefaultPortfolio() {
        return localStorage.getItem('defaultPortfolio') || 'default';
    }

    /**
     * 📖 Obtenir le portfolio actuel
     */
    function getCurrentPortfolio() {
        return currentPortfolio;
    }

    /**
     * 📅 Formate une date en format lisible
     */
    function formatDate(date) {
        if (!date) return 'N/A';
        
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 📢 Affiche une notification
     */
    function showNotification(message, type = 'info') {
        if (window.MarketData && window.MarketData.showNotification) {
            window.MarketData.showNotification(message, type);
        } else if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
            window.FinanceDashboard.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
            
            // Fallback : alert pour les erreurs
            if (type === 'error') {
                alert(message);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // 🌐 API PUBLIQUE
    // ═══════════════════════════════════════════════════════════════

    return {
        // Méthodes principales
        listPortfolios,
        loadFromCloud,
        saveToCloud,
        deletePortfolio,
        deleteFromCloud,
        switchPortfolio,
        createNewPortfolio,
        renamePortfolio,
        setDefaultPortfolio,
        getDefaultPortfolio,
        getCurrentPortfolio,
        fetchPortfoliosList,
        
        // ✅ Méthodes pour les MODALS
        openCreateModal,
        openManageModal,
        createPortfolio,
        renamePortfolioModal,
        deletePortfolioModal,
        loadPortfoliosList,
        closeModal,
        
        // ✅ Méthodes pour l'UI
        loadAndClosePortfolio,
        renamePortfolioAndRefresh,
        deletePortfolioAndRefresh,
        updateCurrentPortfolioDisplay,

        // ✅ ALIAS POUR COMPATIBILITÉ
        getCurrentPortfolioName: getCurrentPortfolio,
        loadPortfolio: loadFromCloud,
        savePortfolio: saveToCloud,
        
        // État Firebase
        isFirebaseReady: () => firebaseReady,
        getCurrentUser: () => currentUser
    };

})();

// ═══════════════════════════════════════════════════════════════
// 🎬 EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    // ✅ Enter key dans la modal de création
    const createInput = document.getElementById('newPortfolioName');
    if (createInput) {
        createInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                PortfolioManager.createPortfolio();
            }
        });
    }
    
    // ✅ Fermer les modals avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = ['modalCreatePortfolio', 'modalManagePortfolios'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal && modal.classList.contains('active')) {
                    PortfolioManager.closeModal(modalId);
                }
            });
        }
    });
    
    // ✅ Event listener pour le dropdown de sélection de portfolio
    const dropdown = document.getElementById('portfolioSelect');
    if (dropdown) {
        dropdown.addEventListener('change', async (e) => {
            const newPortfolio = e.target.value;
            if (newPortfolio) {
                console.log('🔄 Switching to portfolio:', newPortfolio);
                await PortfolioManager.switchPortfolio(newPortfolio);
            }
        });
        
        // ✅ Charger la liste au démarrage
        setTimeout(() => {
            PortfolioManager.loadPortfoliosList();
        }, 500);
    }
});

// Exposer globalement
window.PortfolioManager = PortfolioManager;

console.log('✅ Portfolio Manager loaded successfully (Complete Version with Modals)');