/* =====================================================
   SIMULATION-MANAGER.JS
   Gestion des simulations multi-utilisateurs
   ===================================================== */

const SimulationManager = (function() {
    'use strict';
    
    // ✅ TON URL CLOUDFLARE WORKER
    const API_BASE_URL = 'https://finance-hub-api.raphnardone.workers.dev';
    
    let currentSimulationName = 'default';
    let simulationsList = [];
    
    /**
     * Obtient le token Firebase de l'utilisateur connecté
     */
    async function getAuthToken() {
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }
        return await user.getIdToken();
    }
    
    /**
     * Récupère la liste des simulations de l'utilisateur
     */
    async function fetchSimulationsList() {
        try {
            console.log('🔄 Fetching simulations list...');
            const token = await getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/simulations`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch simulations');
            }
            
            const data = await response.json();
            simulationsList = data.simulations || [];
            console.log(`✅ Loaded ${simulationsList.length} simulations`);
            updateSimulationsListUI();
            return simulationsList;
        } catch (error) {
            console.error('❌ Error fetching simulations:', error);
            showNotification('Error loading simulations list', 'error');
            return [];
        }
    }
    
    /**
     * Charge une simulation depuis Cloudflare
     */
    async function loadSimulation(name) {
        try {
            console.log(`📥 Loading simulation "${name}"...`);
            const token = await getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/simulations/${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to load simulation');
            }
            
            const result = await response.json();
            console.log(`✅ Simulation "${name}" loaded successfully`);
            return result.simulation.data;
        } catch (error) {
            console.error('❌ Error loading simulation:', error);
            showNotification(`Error loading simulation "${name}"`, 'error');
            return null;
        }
    }
    
    /**
     * Sauvegarde la simulation actuelle sur Cloudflare
     */
    async function saveSimulation(name, data) {
        try {
            console.log(`💾 Saving simulation "${name}"...`);
            const token = await getAuthToken();
            
            // Préparer les données
            const simulationData = {
                name: name,
                monthlyEstYield: data.monthlyEstYield,
                inflationRate: data.inflationRate,
                data: data.data
            };
            
            // Vérifier si la simulation existe déjà
            const exists = simulationsList.some(sim => sim.name === name);
            
            const method = exists ? 'PUT' : 'POST';
            const url = exists 
                ? `${API_BASE_URL}/api/simulations/${encodeURIComponent(name)}`
                : `${API_BASE_URL}/api/simulations`;
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(simulationData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save simulation');
            }
            
            const result = await response.json();
            currentSimulationName = name;
            
            console.log(`✅ Simulation "${name}" saved successfully`);
            
            // Rafraîchir la liste
            await fetchSimulationsList();
            
            showNotification(`Simulation "${name}" saved successfully!`, 'success');
            return true;
        } catch (error) {
            console.error('❌ Error saving simulation:', error);
            showNotification(`Error saving simulation "${name}"`, 'error');
            return false;
        }
    }
    
    /**
     * Supprime une simulation
     */
    async function deleteSimulation(name) {
        if (!confirm(`Are you sure you want to delete simulation "${name}"?`)) {
            return false;
        }
        
        try {
            console.log(`🗑️ Deleting simulation "${name}"...`);
            const token = await getAuthToken();
            const response = await fetch(`${API_BASE_URL}/api/simulations/${encodeURIComponent(name)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete simulation');
            }
            
            console.log(`✅ Simulation "${name}" deleted successfully`);
            
            // Rafraîchir la liste
            await fetchSimulationsList();
            
            // Si c'était la simulation active, charger une autre
            if (currentSimulationName === name) {
                if (simulationsList.length > 0) {
                    await switchSimulation(simulationsList[0].name);
                } else {
                    currentSimulationName = 'default';
                }
            }
            
            showNotification(`Simulation "${name}" deleted successfully!`, 'success');
            return true;
        } catch (error) {
            console.error('❌ Error deleting simulation:', error);
            showNotification(`Error deleting simulation "${name}"`, 'error');
            return false;
        }
    }
    
    /**
     * Change de simulation active
     */
    async function switchSimulation(name) {
        const data = await loadSimulation(name);
        
        if (data) {
            // Appliquer les données au Dashboard
            if (window.Dashboard && window.Dashboard.loadSimulationData) {
                window.Dashboard.loadSimulationData(data);
                currentSimulationName = name;
                updateCurrentSimulationDisplay();
                showNotification(`Switched to simulation "${name}"`, 'success');
            }
        }
    }
    
    /**
     * Crée une nouvelle simulation
     */
    async function createNewSimulation() {
        const name = prompt('Enter a name for the new simulation:');
        
        if (!name) return;
        
        // Vérifier si le nom existe déjà
        if (simulationsList.some(sim => sim.name === name)) {
            showNotification('A simulation with this name already exists', 'error');
            return;
        }
        
        // Créer avec les données actuelles
        const currentData = window.Dashboard.getCurrentData();
        await saveSimulation(name, currentData);
    }
    
    /**
     * Renomme une simulation
     */
    async function renameSimulation(oldName) {
        const newName = prompt(`Rename simulation "${oldName}" to:`, oldName);
        
        if (!newName || newName === oldName) return;
        
        // Vérifier si le nouveau nom existe déjà
        if (simulationsList.some(sim => sim.name === newName)) {
            showNotification('A simulation with this name already exists', 'error');
            return;
        }
        
        try {
            // Charger l'ancienne simulation
            const data = await loadSimulation(oldName);
            
            if (!data) return;
            
            // Créer la nouvelle
            await saveSimulation(newName, data);
            
            // Supprimer l'ancienne
            const token = await getAuthToken();
            await fetch(`${API_BASE_URL}/api/simulations/${encodeURIComponent(oldName)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // Si c'était la simulation active
            if (currentSimulationName === oldName) {
                currentSimulationName = newName;
                updateCurrentSimulationDisplay();
            }
            
            // Rafraîchir la liste
            await fetchSimulationsList();
            
            showNotification(`Simulation renamed to "${newName}"`, 'success');
        } catch (error) {
            console.error('❌ Error renaming simulation:', error);
            showNotification('Error renaming simulation', 'error');
        }
    }
    
    /**
     * Met à jour l'affichage de la liste des simulations
     */
    function updateSimulationsListUI() {
        const container = document.getElementById('simulationsListContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (simulationsList.length === 0) {
            container.innerHTML = `
                <div class="no-simulations">
                    <i class="fas fa-folder-open" style="font-size: 3em; margin-bottom: 15px; opacity: 0.3;"></i>
                    <p>No saved simulations yet.</p>
                    <p style="font-size: 0.9em; margin-top: 10px;">Create your first simulation to get started!</p>
                </div>
            `;
            return;
        }
        
        simulationsList.forEach(sim => {
            const item = document.createElement('div');
            item.className = `simulation-item ${sim.name === currentSimulationName ? 'active' : ''}`;
            item.innerHTML = `
                <div class="simulation-info">
                    <span class="simulation-name">
                        <i class="fas fa-database"></i> ${sim.name}
                    </span>
                    <span class="simulation-date">
                        <i class="fas fa-clock"></i> ${formatDate(sim.metadata.updatedAt)}
                    </span>
                </div>
                <div class="simulation-actions">
                    <button onclick="SimulationManager.switchSimulation('${sim.name}')" 
                            class="btn-icon" title="Load">
                        <i class="fas fa-folder-open"></i>
                    </button>
                    <button onclick="SimulationManager.renameSimulation('${sim.name}')" 
                            class="btn-icon" title="Rename">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="SimulationManager.deleteSimulation('${sim.name}')" 
                            class="btn-icon btn-danger" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            container.appendChild(item);
        });
    }
    
    /**
     * Met à jour l'affichage de la simulation actuelle
     */
    function updateCurrentSimulationDisplay() {
        const display = document.getElementById('currentSimulationName');
        if (display) {
            display.textContent = currentSimulationName;
        }
    }
    
    /**
     * Formate une date ISO en format lisible
     */
    function formatDate(isoString) {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * Affiche une notification
     */
    function showNotification(message, type = 'info') {
        if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
            window.FinanceDashboard.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}]`, message);
        }
    }
    
    /**
     * Initialisation au chargement
     */
    async function init() {
        console.log('🔄 Initializing Simulation Manager...');
        
        // Attendre que l'utilisateur soit authentifié
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                console.log('✅ User authenticated, loading simulations...');
                await fetchSimulationsList();
                updateCurrentSimulationDisplay();
            }
        });
    }
    
    // Export des fonctions publiques
    return {
        init,
        fetchSimulationsList,
        loadSimulation,
        saveSimulation,
        deleteSimulation,
        switchSimulation,
        createNewSimulation,
        renameSimulation,
        getCurrentSimulationName: () => currentSimulationName,
        getSimulationsList: () => simulationsList
    };
})();

// Initialiser au chargement de la page
window.addEventListener('DOMContentLoaded', SimulationManager.init);

console.log('✅ Simulation Manager loaded - API URL: https://finance-hub-api.raphnardone.workers.dev');