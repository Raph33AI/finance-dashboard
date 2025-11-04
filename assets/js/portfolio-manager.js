// ═══════════════════════════════════════════════════════════════
// 📁 PORTFOLIO MANAGER - Multi-portfolios avec Cloud Sync
// ═══════════════════════════════════════════════════════════════

const PortfolioManager = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // 🔥 FIREBASE INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    let firebaseReady = false;
    let currentUser = null;
    const FIREBASE_TIMEOUT = 15000; // 15 secondes

    /**
     * Attendre l'initialisation de Firebase
     */
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
                    console.warn('⚠️ Firebase Auth timeout after 15s, continuing with local mode');
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

    // Initialiser au chargement
    (async function init() {
        console.log('🔄 Initializing Portfolio Manager...');
        await waitForFirebase();
        
        if (!firebaseReady) {
            console.warn('⚠️ Running in LOCAL MODE (Firebase not available)');
        } else {
            await ensureUserDocument();
        }
    })();

    // ═══════════════════════════════════════════════════════════════
    // 📊 GESTION DES PORTFOLIOS
    // ═══════════════════════════════════════════════════════════════

    let currentPortfolio = 'default';

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
                
                // Sauvegarder aussi localement
                localStorage.setItem(`portfolio_${portfolioName}`, JSON.stringify(data));
                
                return data;
            } else {
                console.log('⚠️ Portfolio not found in cloud, checking local...');
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
            console.warn('⚠️ Firebase not ready, saving locally only');
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
            
            return true;
            
        } catch (error) {
            console.error('❌ Error saving to cloud:', error);
            console.warn('💾 Falling back to local storage');
            
            localStorage.setItem(`portfolio_${portfolioName}`, JSON.stringify(data));
            
            return false;
        }
    }

    /**
     * 🗑️ Supprimer un portfolio
     */
    async function deletePortfolio(portfolioName) {
        if (portfolioName === 'default') {
            console.warn('⚠️ Cannot delete default portfolio');
            return false;
        }
        
        console.log(`🗑️ Deleting portfolio "${portfolioName}"...`);
        
        // Supprimer du cloud
        if (firebaseReady && currentUser) {
            try {
                const db = firebase.firestore();
                const userId = currentUser.uid;
                
                await db
                    .collection('users')
                    .doc(userId)
                    .collection('portfolios')
                    .doc(portfolioName)
                    .delete();
                
                console.log('✅ Portfolio deleted from cloud');
            } catch (error) {
                console.error('❌ Error deleting from cloud:', error);
            }
        }
        
        // Supprimer du local
        localStorage.removeItem(`portfolio_${portfolioName}`);
        
        // Si c'était le portfolio actuel, revenir à default
        if (currentPortfolio === portfolioName) {
            currentPortfolio = 'default';
            localStorage.setItem('currentPortfolio', 'default');
        }
        
        return true;
    }

    /**
     * 🔄 Changer de portfolio actif
     */
    async function switchPortfolio(portfolioName) {
        console.log(`🔄 Switching to portfolio "${portfolioName}"...`);
        
        currentPortfolio = portfolioName;
        localStorage.setItem('currentPortfolio', portfolioName);
        
        // Charger les données du portfolio
        const data = await loadFromCloud(portfolioName);
        
        // Mettre à jour l'affichage
        updateCurrentPortfolioDisplay(portfolioName);
        
        return data;
    }

    /**
     * ➕ Créer un nouveau portfolio
     */
    async function createNewPortfolio() {
        const name = prompt('Nom du nouveau portfolio:', '');
        
        if (!name || name.trim() === '') {
            return null;
        }
        
        const portfolioName = name.trim();
        
        // Vérifier si existe déjà
        const portfolios = await listPortfolios();
        if (portfolios.some(p => p.name === portfolioName)) {
            alert('Un portfolio avec ce nom existe déjà !');
            return null;
        }
        
        // Créer le portfolio
        const data = createDefaultPortfolioData(portfolioName);
        await saveToCloud(portfolioName, data);
        
        // Basculer vers ce portfolio
        await switchPortfolio(portfolioName);
        
        // Rafraîchir la liste
        if (typeof MarketData !== 'undefined' && MarketData.refreshPortfoliosList) {
            MarketData.refreshPortfoliosList();
        }
        
        return data;
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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * 🔄 Mettre à jour l'affichage du portfolio actuel
     */
    function updateCurrentPortfolioDisplay(portfolioName) {
        const display = document.getElementById('currentPortfolioName');
        if (display) {
            display.textContent = portfolioName;
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

    // ═══════════════════════════════════════════════════════════════
    // 🌐 API PUBLIQUE
    // ═══════════════════════════════════════════════════════════════

    return {
        listPortfolios,
        loadFromCloud,
        saveToCloud,
        deletePortfolio,
        switchPortfolio,
        createNewPortfolio,
        setDefaultPortfolio,
        getDefaultPortfolio,
        getCurrentPortfolio,
        
        // État Firebase
        isFirebaseReady: () => firebaseReady,
        getCurrentUser: () => currentUser
    };

})();

// Exposer globalement
window.PortfolioManager = PortfolioManager;