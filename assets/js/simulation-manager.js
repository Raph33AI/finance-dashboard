// ═══════════════════════════════════════════════════════════════
// 🎲 SIMULATION MANAGER - Multi-simulations avec Cloud Sync
// ═══════════════════════════════════════════════════════════════

const SimulationManager = (function() {
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

    /**
     * 🔧 Assurer qu'au moins la simulation "default" existe
     */
    async function ensureDefaultSimulation() {
        if (!firebaseReady || !currentUser) {
            // Mode local : créer default si n'existe pas
            const localDefault = localStorage.getItem('simulation_default');
            if (!localDefault) {
                console.log('📝 Creating default simulation locally...');
                const defaultData = createDefaultSimulationData('default');
                localStorage.setItem('simulation_default', JSON.stringify(defaultData));
            }
            return false;
        }
        
        try {
            const db = firebase.firestore();
            const userId = currentUser.uid;
            
            // Vérifier si la simulation "default" existe
            const defaultDoc = await db
                .collection('users')
                .doc(userId)
                .collection('simulations')
                .doc('default')
                .get();
            
            if (!defaultDoc.exists) {
                console.log('📝 Creating default simulation in cloud...');
                
                const defaultData = createDefaultSimulationData('default');
                
                await db
                    .collection('users')
                    .doc(userId)
                    .collection('simulations')
                    .doc('default')
                    .set(defaultData);
                
                console.log('✅ Default simulation created');
            } else {
                console.log('✅ Default simulation already exists');
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Error ensuring default simulation:', error);
            
            // Fallback local
            const localDefault = localStorage.getItem('simulation_default');
            if (!localDefault) {
                const defaultData = createDefaultSimulationData('default');
                localStorage.setItem('simulation_default', JSON.stringify(defaultData));
            }
            
            return false;
        }
    }

    /**
     * 📋 Créer les données par défaut d'une simulation
     */
    function createDefaultSimulationData(name) {
        return {
            name: name,
            monthlyEstYield: 0,
            inflationRate: 0,
            data: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    // Initialiser au chargement
    (async function init() {
        console.log('🔄 Initializing Simulation Manager...');
        await waitForFirebase();
        
        if (!firebaseReady) {
            console.warn('⚠️ Running in LOCAL MODE (Firebase not available)');
        } else {
            await ensureUserDocument();
            
            // ✅ NOUVEAU : Assurer qu'au moins une simulation existe
            await ensureDefaultSimulation();
        }
    })();

    // ═══════════════════════════════════════════════════════════════
    // 🎲 GESTION DES SIMULATIONS
    // ═══════════════════════════════════════════════════════════════

    let currentSimulation = localStorage.getItem('currentSimulation') || 'default';

    /**
     * 📋 Lister toutes les simulations
     */
    async function listSimulations() {
        if (!firebaseReady || !currentUser) {
            return listLocalSimulations();
        }
        
        try {
            const db = firebase.firestore();
            const userId = currentUser.uid;
            
            const snapshot = await db
                .collection('users')
                .doc(userId)
                .collection('simulations')
                .get();
            
            const simulations = [];
            snapshot.forEach((doc) => {
                simulations.push({
                    name: doc.id,
                    ...doc.data()
                });
            });
            
            console.log('✅ Loaded simulations list:', simulations.length);
            
            // ✅ NOUVEAU : Si aucune simulation, créer default
            if (simulations.length === 0) {
                console.log('📝 No simulations found, creating default...');
                await ensureDefaultSimulation();
                
                // Recharger
                const snapshot2 = await db
                    .collection('users')
                    .doc(userId)
                    .collection('simulations')
                    .get();
                
                snapshot2.forEach((doc) => {
                    simulations.push({
                        name: doc.id,
                        ...doc.data()
                    });
                });
            }
            
            return simulations;
            
        } catch (error) {
            console.error('❌ Error listing simulations:', error);
            return listLocalSimulations();
        }
    }

    /**
     * 📋 Lister les simulations locales
     */
    function listLocalSimulations() {
        const simulations = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('simulation_')) {
                const name = key.replace('simulation_', '');
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    simulations.push({
                        name: name,
                        ...data
                    });
                } catch (e) {
                    console.error('Error parsing simulation:', name, e);
                }
            }
        }
        
        // ✅ NOUVEAU : Si aucune simulation locale, créer default
        if (simulations.length === 0) {
            console.log('📝 No local simulations found, creating default...');
            const defaultData = createDefaultSimulationData('default');
            localStorage.setItem('simulation_default', JSON.stringify(defaultData));
            simulations.push({
                name: 'default',
                ...defaultData
            });
        }
        
        console.log('✅ Loaded local simulations:', simulations.length);
        return simulations;
    }

    /**
     * 📥 Charger une simulation depuis le cloud
     */
    async function loadFromCloud(simulationName) {
        console.log(`📥 Loading simulation "${simulationName}" from cloud...`);
        
        if (!firebaseReady || !currentUser) {
            return loadFromLocal(simulationName);
        }
        
        try {
            const db = firebase.firestore();
            const userId = currentUser.uid;
            
            const doc = await db
                .collection('users')
                .doc(userId)
                .collection('simulations')
                .doc(simulationName)
                .get();
            
            if (doc.exists) {
                const data = doc.data();
                console.log('✅ Simulation loaded from cloud');
                
                localStorage.setItem(`simulation_${simulationName}`, JSON.stringify(data));
                
                return data;
            } else {
                console.log('⚠️ Simulation not found in cloud, checking local...');
                return loadFromLocal(simulationName);
            }
            
        } catch (error) {
            console.error('❌ Error loading from cloud:', error);
            return loadFromLocal(simulationName);
        }
    }

    /**
     * 📥 Charger une simulation depuis le stockage local
     */
    function loadFromLocal(simulationName) {
        const key = `simulation_${simulationName}`;
        const data = localStorage.getItem(key);
        
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                console.error('Error parsing local simulation:', e);
                return createDefaultSimulationData(simulationName);
            }
        }
        
        return createDefaultSimulationData(simulationName);
    }

    /**
     * 💾 Sauvegarder une simulation dans le cloud
     */
    async function saveToCloud(simulationName, data) {
        console.log(`💾 Saving simulation "${simulationName}" to cloud...`);
        
        if (!firebaseReady || !currentUser) {
            console.warn('⚠️ Firebase not ready, saving locally only');
            localStorage.setItem(`simulation_${simulationName}`, JSON.stringify(data));
            return false;
        }
        
        try {
            await ensureUserDocument();
            
            const db = firebase.firestore();
            const userId = currentUser.uid;
            
            const simulationData = {
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdAt: data.createdAt || firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const savePromise = db
                .collection('users')
                .doc(userId)
                .collection('simulations')
                .doc(simulationName)
                .set(simulationData, { merge: true });
            
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Save timeout')), 10000);
            });
            
            await Promise.race([savePromise, timeoutPromise]);
            
            console.log('✅ Simulation saved to cloud');
            
            localStorage.setItem(`simulation_${simulationName}`, JSON.stringify(data));
            
            showNotification(`Simulation "${simulationName}" saved successfully!`, 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error saving to cloud:', error);
            console.warn('💾 Falling back to local storage');
            
            localStorage.setItem(`simulation_${simulationName}`, JSON.stringify(data));
            
            showNotification(`Simulation saved locally (offline mode)`, 'warning');
            
            return false;
        }
    }

    /**
     * 🗑️ Supprimer une simulation
     */
    async function deleteSimulation(simulationName) {
        if (simulationName === 'default') {
            console.warn('⚠️ Cannot delete default simulation');
            showNotification('Cannot delete default simulation', 'error');
            return false;
        }
        
        if (!confirm(`Are you sure you want to delete simulation "${simulationName}"?`)) {
            return false;
        }
        
        console.log(`🗑️ Deleting simulation "${simulationName}"...`);
        
        if (firebaseReady && currentUser) {
            try {
                const db = firebase.firestore();
                const userId = currentUser.uid;
                
                await db
                    .collection('users')
                    .doc(userId)
                    .collection('simulations')
                    .doc(simulationName)
                    .delete();
                
                console.log('✅ Simulation deleted from cloud');
            } catch (error) {
                console.error('❌ Error deleting from cloud:', error);
            }
        }
        
        localStorage.removeItem(`simulation_${simulationName}`);
        
        if (currentSimulation === simulationName) {
            currentSimulation = 'default';
            localStorage.setItem('currentSimulation', 'default');
        }
        
        // Rafraîchir l'UI
        await fetchSimulationsList();
        
        showNotification(`Simulation "${simulationName}" deleted successfully!`, 'success');
        
        return true;
    }

    /**
     * 🔄 Changer de simulation active
     */
    async function switchSimulation(simulationName) {
        console.log(`🔄 Switching to simulation "${simulationName}"...`);
        
        currentSimulation = simulationName;
        localStorage.setItem('currentSimulation', simulationName);
        
        const data = await loadFromCloud(simulationName);
        
        updateCurrentSimulationDisplay(simulationName);
        
        // Appliquer les données au Dashboard
        if (window.Dashboard && window.Dashboard.loadSimulationData) {
            window.Dashboard.loadSimulationData(data);
        }
        
        showNotification(`Switched to simulation "${simulationName}"`, 'success');
        
        return data;
    }

    /**
     * ➕ Créer une nouvelle simulation
     */
    async function createNewSimulation() {
        const name = prompt('Nom de la nouvelle simulation:', '');
        
        if (!name || name.trim() === '') {
            return null;
        }
        
        const simulationName = name.trim();
        
        const simulations = await listSimulations();
        if (simulations.some(s => s.name === simulationName)) {
            alert('Une simulation avec ce nom existe déjà !');
            return null;
        }
        
        // Créer avec les données actuelles ou par défaut
        let data;
        if (window.Dashboard && window.Dashboard.getCurrentData) {
            data = window.Dashboard.getCurrentData();
            data.name = simulationName;
        } else {
            data = createDefaultSimulationData(simulationName);
        }
        
        await saveToCloud(simulationName, data);
        
        await switchSimulation(simulationName);
        
        // Rafraîchir la liste
        await fetchSimulationsList();
        
        return data;
    }

    /**
     * 🔄 Renommer une simulation
     */
    async function renameSimulation(oldName) {
        if (oldName === 'default') {
            showNotification('Cannot rename default simulation', 'error');
            return false;
        }
        
        const newName = prompt(`Renommer la simulation "${oldName}" en:`, oldName);
        
        if (!newName || newName === oldName) {
            return false;
        }
        
        const simulations = await listSimulations();
        if (simulations.some(s => s.name === newName)) {
            showNotification('Une simulation avec ce nom existe déjà', 'error');
            return false;
        }
        
        try {
            // Charger l'ancienne simulation
            const data = await loadFromCloud(oldName);
            
            if (!data) {
                showNotification('Error loading simulation', 'error');
                return false;
            }
            
            // Mettre à jour le nom
            data.name = newName;
            
            // Créer la nouvelle
            await saveToCloud(newName, data);
            
            // Supprimer l'ancienne (sans confirmation)
            if (firebaseReady && currentUser) {
                const db = firebase.firestore();
                const userId = currentUser.uid;
                
                await db
                    .collection('users')
                    .doc(userId)
                    .collection('simulations')
                    .doc(oldName)
                    .delete();
            }
            
            localStorage.removeItem(`simulation_${oldName}`);
            
            // Si c'était la simulation active
            if (currentSimulation === oldName) {
                currentSimulation = newName;
                localStorage.setItem('currentSimulation', newName);
                updateCurrentSimulationDisplay(newName);
            }
            
            // Rafraîchir la liste
            await fetchSimulationsList();
            
            showNotification(`Simulation renamed to "${newName}"`, 'success');
            
            return true;
            
        } catch (error) {
            console.error('❌ Error renaming simulation:', error);
            showNotification('Error renaming simulation', 'error');
            return false;
        }
    }

    /**
     * 🔄 Mettre à jour l'affichage de la simulation actuelle
     */
    function updateCurrentSimulationDisplay(simulationName) {
        const display = document.getElementById('currentSimulationName');
        if (display) {
            display.textContent = simulationName || currentSimulation;
        }
    }

    /**
     * 🔄 Récupérer et afficher la liste des simulations
     */
    async function fetchSimulationsList() {
        const simulations = await listSimulations();
        updateSimulationsListUI(simulations);
        return simulations;
    }

    /**
     * 🖼️ Mettre à jour l'affichage de la liste des simulations
     */
    function updateSimulationsListUI(simulations) {
        const container = document.getElementById('simulationsListContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!simulations || simulations.length === 0) {
            container.innerHTML = `
                <div class='no-simulations'>
                    <i class='fas fa-folder-open' style='font-size: 3em; margin-bottom: 15px; opacity: 0.3;'></i>
                    <p>No saved simulations yet.</p>
                    <p style='font-size: 0.9em; margin-top: 10px;'>Create your first simulation to get started!</p>
                </div>
            `;
            return;
        }
        
        simulations.forEach(sim => {
            const item = document.createElement('div');
            item.className = `simulation-item ${sim.name === currentSimulation ? 'active' : ''}`;
            
            const updatedDate = sim.updatedAt 
                ? (sim.updatedAt.toDate ? sim.updatedAt.toDate() : new Date(sim.updatedAt))
                : new Date(sim.createdAt);
            
            item.innerHTML = `
                <div class="simulation-info" onclick="loadAndCloseSimulation('${sim.name}')">
                    <span class="simulation-name">
                        <i class='fas fa-database'></i> ${sim.name}
                        ${sim.name === currentSimulation ? '<i class="fas fa-check-circle" style="color: #10b981; margin-left: 8px;"></i>' : ''}
                    </span>
                    <span class="simulation-date">
                        <i class='fas fa-clock'></i> ${formatDate(updatedDate)}
                    </span>
                </div>
                <div class="simulation-actions" onclick="event.stopPropagation()">
                    <button onclick="renameSimulationAndRefresh('${sim.name}')" 
                            class="btn-icon" title="Rename">
                        <i class='fas fa-edit'></i>
                    </button>
                    <button onclick="deleteSimulationAndRefresh('${sim.name}')" 
                            class="btn-icon btn-danger" title="Delete">
                        <i class='fas fa-trash'></i>
                    </button>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    /**
     * 🔄 Charge une simulation et ferme le modal
     */
    async function loadAndCloseSimulation(simulationName) {
        console.log(`🔄 Loading and switching to simulation "${simulationName}"...`);
        
        // Empêcher le double-clic pendant le chargement
        const container = document.getElementById('simulationsListContainer');
        if (container) {
            container.style.pointerEvents = 'none';
        }
        
        try {
            // Switch vers la simulation
            await switchSimulation(simulationName);
            
            // Fermer le modal
            if (typeof closeSimulationsModal === 'function') {
                closeSimulationsModal();
            } else {
                const modal = document.getElementById('simulationsModal');
                if (modal) {
                    modal.classList.remove('active');
                }
            }
            
            showNotification(`Simulation "${simulationName}" loaded successfully!`, 'success');
            
        } catch (error) {
            console.error('❌ Error loading simulation:', error);
            showNotification(`Error loading simulation "${simulationName}"`, 'error');
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
    async function renameSimulationAndRefresh(simulationName) {
        const success = await renameSimulation(simulationName);
        if (success) {
            // La liste est déjà rafraîchie dans renameSimulation()
            // Pas besoin de recharger
        }
    }

    /**
     * 🗑️ Supprime et rafraîchit la liste
     */
    async function deleteSimulationAndRefresh(simulationName) {
        const success = await deleteSimulation(simulationName);
        if (success) {
            // La liste est déjà rafraîchie dans deleteSimulation()
            // Pas besoin de recharger
        }
    }
    /**
     * 🔄 Définir une simulation par défaut
     */
    async function setDefaultSimulation(simulationName) {
        localStorage.setItem('defaultSimulation', simulationName);
        console.log(`✅ Default simulation set to: ${simulationName}`);
    }

    /**
     * 📖 Obtenir la simulation par défaut
     */
    function getDefaultSimulation() {
        return localStorage.getItem('defaultSimulation') || 'default';
    }

    /**
     * 📖 Obtenir la simulation actuelle
     */
    function getCurrentSimulation() {
        return currentSimulation;
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
        if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
            window.FinanceDashboard.showNotification(message, type);
        } else if (window.Dashboard && window.Dashboard.showNotification) {
            window.Dashboard.showNotification(message, type);
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
        listSimulations,
        loadFromCloud,
        saveToCloud,
        deleteSimulation,
        switchSimulation,
        createNewSimulation,
        renameSimulation,
        setDefaultSimulation,
        getDefaultSimulation,
        getCurrentSimulation,
        fetchSimulationsList,
        
        // ✅ NOUVEAU : Méthodes pour l'UI
        loadAndCloseSimulation,      // ⬅️ AJOUT
        renameSimulationAndRefresh,  // ⬅️ AJOUT
        deleteSimulationAndRefresh,  // ⬅️ AJOUT

        // ✅ ALIAS POUR COMPATIBILITÉ
        getCurrentSimulationName: getCurrentSimulation,
        loadSimulation: loadFromCloud,
        saveSimulation: saveToCloud,
        
        // État Firebase
        isFirebaseReady: () => firebaseReady,
        getCurrentUser: () => currentUser
    };

})();

// Exposer globalement
window.SimulationManager = SimulationManager;

console.log('✅ Simulation Manager loaded successfully');