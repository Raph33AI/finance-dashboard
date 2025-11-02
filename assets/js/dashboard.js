/* ==============================================
   DASHBOARD.JS - Logique du dashboard financier
   VERSION FIRESTORE - Sauvegarde par utilisateur
   ============================================== */

// Module Dashboard (pattern IIFE pour éviter la pollution du scope global)
const Dashboard = (function() {
    'use strict';
    
    // ========== VARIABLES PRIVÉES ==========
    let allData = [];
    let chart1Instance, chart4Instance, chart5Instance, chart6Instance;
    let currentMonthIndex = 0;
    let monthlyEstYield = 8; // % annual
    let inflationRate = 2.5; // % annual
    let showInflation = false;
    
    // ID du dashboard actuel (pour Firestore)
    let currentDashboardId = null;
    
    // ========== INITIALISATION ==========
    
    /**
     * Initialise le dashboard au chargement de la page
     */
    async function init() {
        console.log('🚀 Initializing Dashboard...');
        
        // Attendre que userDataManager soit prêt
        if (typeof userDataManager === 'undefined' || !userDataManager.isAuthenticated()) {
            console.warn('⚠️ User not authenticated, waiting...');
            
            // Écouter l'événement d'authentification
            window.addEventListener('userAuthenticated', async () => {
                console.log('✅ User authenticated, loading dashboard data...');
                await loadDashboardData();
                finalizeInit();
            });
            
            return;
        }
        
        // Si déjà authentifié, charger directement
        await loadDashboardData();
        finalizeInit();
    }
    
    /**
     * Finalise l'initialisation après chargement des données
     */
    function finalizeInit() {
        renderTable();
        updateAllCharts();
        updateLastUpdateTime();
        console.log('✅ Dashboard initialized successfully');
    }
    
    /**
     * Met à jour l'heure de dernière mise à jour
     */
    function updateLastUpdateTime() {
        const now = new Date();
        const formatted = now.toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const elem = document.getElementById('lastUpdate');
        if (elem) elem.textContent = 'Last update: ' + formatted;
    }
    
    // ========== GESTION DES DONNÉES ==========
    
    /**
     * Génère un tableau de mois
     */
    function generateMonths(startYear, startMonth, count) {
        const months = [];
        let year = startYear;
        let month = startMonth;
        
        for (let i = 0; i < count; i++) {
            months.push(String(month).padStart(2, '0') + '/' + year);
            month++;
            if (month > 12) { 
                month = 1; 
                year++; 
            }
        }
        return months;
    }
    
    /**
     * Trouve l'index du mois actuel
     */
    function findCurrentMonthIndex() {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const searchMonth = String(currentMonth).padStart(2, '0') + '/' + currentYear;
        
        for (let i = 0; i < allData.length; i++) {
            if (allData[i].month === searchMonth) {
                return i;
            }
        }
        return 0;
    }
    
    /**
     * Crée les données par défaut
     */
    function createDefaultData() {
        const today = new Date();
        const startYear = today.getFullYear();
        const startMonth = today.getMonth() + 1;
        const months = generateMonths(startYear, startMonth, 300);
        
        allData = months.map(month => ({
            month: month,
            salary: 3000, 
            misc: 100,
            rent: 800, 
            food: 300, 
            fixCosts: 150, 
            others: 200, 
            loan: 300,
            investment: 500,
            monthlyGain: 0,
            cumulatedGains: 0, 
            peeLoreal: 0
        }));
    }
    
    /**
     * Charge les données du dashboard depuis Firestore
     */
    async function loadDashboardData() {
        try {
            // Charger les simulations de type 'dashboard'
            const dashboards = await userDataManager.loadSimulations('dashboard');
            
            if (dashboards && dashboards.length > 0) {
                // Charger le dashboard le plus récent
                const latestDashboard = dashboards[0];
                currentDashboardId = latestDashboard.id;
                
                // Restaurer les données
                allData = latestDashboard.parameters.allData || [];
                monthlyEstYield = latestDashboard.parameters.monthlyEstYield || 8;
                inflationRate = latestDashboard.parameters.inflationRate || 2.5;
                
                // Mettre à jour l'UI
                document.getElementById('monthlyEstYield').value = monthlyEstYield;
                document.getElementById('inflationRate').value = inflationRate;
                updateEstYieldDisplay();
                
                console.log('✅ Dashboard data loaded from Firestore');
            } else {
                // Pas de dashboard existant, créer les données par défaut
                console.log('ℹ️ No existing dashboard, creating default data');
                createDefaultData();
                
                // Sauvegarder immédiatement dans Firestore
                await saveDashboardToFirestore();
            }
            
            calculateAll();
            currentMonthIndex = findCurrentMonthIndex();
            updateTotalMonthsDisplay();
            
        } catch (error) {
            console.error('❌ Error loading dashboard data:', error);
            
            // Fallback : créer les données par défaut
            createDefaultData();
            calculateAll();
            currentMonthIndex = findCurrentMonthIndex();
            updateTotalMonthsDisplay();
        }
    }
    
    /**
     * Sauvegarde le dashboard dans Firestore
     */
    async function saveDashboardToFirestore() {
        if (!userDataManager || !userDataManager.isAuthenticated()) {
            console.warn('⚠️ Cannot save: user not authenticated');
            return;
        }
        
        try {
            const dashboardData = {
                type: 'dashboard',
                name: 'Financial Dashboard',
                parameters: {
                    allData: allData,
                    monthlyEstYield: monthlyEstYield,
                    inflationRate: inflationRate
                },
                results: {
                    totalMonths: allData.length,
                    currentMonth: allData[currentMonthIndex]?.month,
                    totalPortfolio: allData[allData.length - 1]?.totalPortfolio || 0,
                    totalSavings: allData[allData.length - 1]?.cumulatedSavings || 0,
                    currentROI: allData[currentMonthIndex]?.roi || 0
                }
            };
            
            currentDashboardId = await userDataManager.saveSimulation(
                dashboardData, 
                currentDashboardId
            );
            
            console.log('✅ Dashboard saved to Firestore');
            
        } catch (error) {
            console.error('❌ Error saving dashboard:', error);
            throw error;
        }
    }
    
    // ========== CALCULS ==========
    
    /**
     * Calcule tous les indicateurs financiers
     */
    function calculateAll() {
        let cumulatedSavings = 0;
        let cumulatedInvestment = 0;
        
        allData.forEach(row => {
            row.totalIncome = (row.salary || 0) + (row.misc || 0);
            row.totalExpenses = (row.rent || 0) + (row.food || 0) + 
                                (row.fixCosts || 0) + (row.others || 0) + 
                                (row.loan || 0);
            row.savings = row.totalIncome - row.totalExpenses;
            
            cumulatedSavings += row.savings;
            row.cumulatedSavings = cumulatedSavings;
            
            cumulatedInvestment += (row.investment || 0);
            row.cumulatedInvestment = cumulatedInvestment;
            
            row.totalPortfolio = cumulatedInvestment + 
                                (row.cumulatedGains || 0) + 
                                (row.peeLoreal || 0);
            
            row.roi = cumulatedInvestment > 0 ? 
                      ((row.cumulatedGains || 0) / cumulatedInvestment * 100) : 0;
        });
    }
    
    /**
     * Recalcule les gains d'investissement
     */
    async function recalculateGains() {
        const monthlyYieldRate = monthlyEstYield / 12 / 100;
        let cumulatedGains = 0;
        
        allData.forEach((row, index) => {
            const monthlyInvestment = row.investment || 0;
            let monthlyGain = 0;
            
            if (index === 0) {
                monthlyGain = monthlyYieldRate * monthlyInvestment / 2;
            } else {
                const previousRow = allData[index - 1];
                const previousCapital = (previousRow.cumulatedInvestment || 0) + 
                                       (previousRow.cumulatedGains || 0);
                monthlyGain = monthlyYieldRate * (previousCapital + monthlyInvestment / 2);
            }
            
            row.monthlyGain = monthlyGain;
            cumulatedGains += monthlyGain;
            row.cumulatedGains = cumulatedGains;
        });
        
        calculateAll();
        renderTable();
        await autoSave();
        updateAllCharts();
    }
    
    // ========== GESTION DES PARAMÈTRES ==========
    
    /**
     * Met à jour le rendement mensuel estimé
     */
    async function updateEstYield() {
        monthlyEstYield = parseFloat(document.getElementById('monthlyEstYield').value) || 0;
        updateEstYieldDisplay();
        await recalculateGains();
    }
    
    /**
     * Affiche le rendement mensuel
     */
    function updateEstYieldDisplay() {
        const monthlyRate = (monthlyEstYield / 12).toFixed(2);
        const elem = document.getElementById('monthlyEstYieldDisplay');
        if (elem) elem.textContent = monthlyRate;
    }
    
    /**
     * Met à jour le taux d'inflation
     */
    async function updateInflationRate() {
        inflationRate = parseFloat(document.getElementById('inflationRate').value) || 2.5;
        if (showInflation) updateAllCharts();
        await autoSave();
    }
    
    /**
     * Active/désactive les graphiques ajustés pour l'inflation
     */
    function toggleInflationCharts() {
        showInflation = !showInflation;
        const btn = document.getElementById('btnToggleInflation');
        const status = document.getElementById('inflationStatus');
        
        if (showInflation) {
            btn.textContent = 'Hide Inflation-Adjusted Charts';
            btn.style.background = 'linear-gradient(135deg, #6C3483 0%, #9D5CE6 100%)';
            status.textContent = 'ON';
            status.style.color = '#4A74F3';
        } else {
            btn.textContent = 'Show Inflation-Adjusted Charts';
            btn.style.background = 'linear-gradient(135deg, #4A74F3 0%, #6C8BE0 100%)';
            status.textContent = 'OFF';
            status.style.color = '#9D5CE6';
        }
        
        updateAllCharts();
    }
    
    /**
     * Ajuste une valeur pour l'inflation
     */
    function adjustForInflation(value, monthIndex) {
        const monthlyInflation = Math.pow(1 + inflationRate / 100, 1/12) - 1;
        return value / Math.pow(1 + monthlyInflation, monthIndex);
    }
    
    // ========== GESTION DE LA TIMELINE ==========
    
    /**
     * Ajoute des mois avant
     */
    async function addMonthsBefore(count) {
        if (allData.length === 0) return;
        
        const firstMonth = allData[0].month;
        const [m, y] = firstMonth.split('/').map(Number);
        let year = y;
        let month = m - count;
        
        while (month <= 0) { 
            month += 12; 
            year--; 
        }
        
        const newMonths = generateMonths(year, month, count);
        const newRows = newMonths.map(month => ({
            month: month,
            salary: 3000, misc: 100,
            rent: 800, food: 300, fixCosts: 150, others: 200, loan: 300,
            investment: 500,
            monthlyGain: 0,
            cumulatedGains: 0, 
            peeLoreal: 0
        }));
        
        allData = newRows.concat(allData);
        await recalculateGains();
        currentMonthIndex = findCurrentMonthIndex();
        updateTotalMonthsDisplay();
        updateAllCharts();
    }
    
    /**
     * Ajoute des mois après
     */
    async function addMonthsAfter(count) {
        if (allData.length === 0) return;
        
        const lastMonth = allData[allData.length - 1].month;
        const [m, y] = lastMonth.split('/').map(Number);
        let year = y;
        let month = m + 1;
        
        if (month > 12) { 
            month = 1; 
            year++; 
        }
        
        const newMonths = generateMonths(year, month, count);
        const newRows = newMonths.map(month => ({
            month: month,
            salary: 3000, misc: 100,
            rent: 800, food: 300, fixCosts: 150, others: 200, loan: 300,
            investment: 500,
            monthlyGain: 0,
            cumulatedGains: 0, 
            peeLoreal: 0
        }));
        
        allData = allData.concat(newRows);
        await recalculateGains();
        updateTotalMonthsDisplay();
        updateAllCharts();
    }
    
    /**
     * Supprime une ligne
     */
    async function deleteRow(index) {
        if (allData.length <= 12) {
            alert('Cannot delete! Minimum 12 months required.');
            return;
        }
        
        if (confirm('Delete month ' + allData[index].month + '?')) {
            allData.splice(index, 1);
            await recalculateGains();
            currentMonthIndex = findCurrentMonthIndex();
            updateTotalMonthsDisplay();
            updateAllCharts();
        }
    }
    
    /**
     * Met à jour l'affichage du nombre total de mois
     */
    function updateTotalMonthsDisplay() {
        const elem = document.getElementById('totalMonthsDisplay');
        if (elem) elem.textContent = allData.length;
    }
    
    // ========== SAUVEGARDE/CHARGEMENT ==========
    
    /**
     * Sauvegarde manuelle
     */
    async function saveData() {
        try {
            calculateAll();
            await saveDashboardToFirestore();
            window.FinanceDashboard.showNotification('Data saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving data:', error);
            window.FinanceDashboard.showNotification('Error saving data!', 'error');
        }
    }
    
    /**
     * Sauvegarde automatique avec debounce
     */
    async function autoSave() {
        if (!userDataManager || !userDataManager.isAuthenticated()) {
            return;
        }
        
        calculateAll();
        
        // Utiliser le système d'auto-save de userDataManager
        userDataManager.scheduleAutoSave(
            async () => {
                try {
                    await saveDashboardToFirestore();
                    console.log('💾 Auto-saved to Firestore');
                } catch (error) {
                    console.error('Error auto-saving:', error);
                }
            },
            null
        );
    }
    
    /**
     * Exporte en JSON
     */
    function exportToJSON() {
        const exportData = {
            monthlyEstYield: monthlyEstYield,
            inflationRate: inflationRate,
            data: allData,
            exportDate: new Date().toISOString()
        };
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'financial_data_' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);
        window.FinanceDashboard.showNotification('Data exported successfully!', 'success');
    }
    
    /**
     * Importe depuis JSON
     */
    function importFromJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (imported.data) {
                        allData = imported.data;
                        if (imported.monthlyEstYield) {
                            monthlyEstYield = imported.monthlyEstYield;
                            document.getElementById('monthlyEstYield').value = monthlyEstYield;
                            updateEstYieldDisplay();
                        }
                        if (imported.inflationRate) {
                            inflationRate = imported.inflationRate;
                            document.getElementById('inflationRate').value = inflationRate;
                        }
                    } else {
                        allData = imported;
                    }
                    calculateAll();
                    currentMonthIndex = findCurrentMonthIndex();
                    renderTable();
                    await saveData();
                    updateTotalMonthsDisplay();
                    updateAllCharts();
                    window.FinanceDashboard.showNotification('Data imported successfully!', 'success');
                } catch (err) {
                    window.FinanceDashboard.showNotification('Import error: ' + err.message, 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
    
    /**
     * Réinitialise aux valeurs par défaut
     */
    async function resetToDefault() {
        if (confirm('Reset all data to default 300 months? This will delete your current dashboard from Firestore.')) {
            try {
                // Supprimer le dashboard actuel de Firestore si existe
                if (currentDashboardId && userDataManager) {
                    await userDataManager.deleteSimulation(currentDashboardId);
                }
                
                currentDashboardId = null;
                monthlyEstYield = 8;
                inflationRate = 2.5;
                document.getElementById('monthlyEstYield').value = 8;
                document.getElementById('inflationRate').value = 2.5;
                updateEstYieldDisplay();
                showInflation = false;
                
                createDefaultData();
                calculateAll();
                currentMonthIndex = findCurrentMonthIndex();
                
                // Sauvegarder le nouveau dashboard dans Firestore
                await saveDashboardToFirestore();
                
                renderTable();
                updateTotalMonthsDisplay();
                updateAllCharts();
                
                window.FinanceDashboard.showNotification('Data reset to default!', 'info');
            } catch (error) {
                console.error('Error resetting data:', error);
                window.FinanceDashboard.showNotification('Error resetting data!', 'error');
            }
        }
    }
    
    // ========== AFFICHAGE DU TABLEAU ==========
    
    /**
     * Affiche le tableau de données
     */
    function renderTable() {
        const tbody = document.getElementById('dataTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        allData.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.month}</td>
                <td><input type='number' step='0.01' value='${row.salary}' onchange='Dashboard.updateValue(${index}, "salary", this.value)'></td>
                <td><input type='number' step='0.01' value='${row.misc}' onchange='Dashboard.updateValue(${index}, "misc", this.value)'></td>
                <td class='calculated'>${row.totalIncome.toFixed(0)}</td>
                <td><input type='number' step='0.01' value='${row.rent}' onchange='Dashboard.updateValue(${index}, "rent", this.value)'></td>
                <td><input type='number' step='0.01' value='${row.food}' onchange='Dashboard.updateValue(${index}, "food", this.value)'></td>
                <td><input type='number' step='0.01' value='${row.fixCosts}' onchange='Dashboard.updateValue(${index}, "fixCosts", this.value)'></td>
                <td><input type='number' step='0.01' value='${row.others}' onchange='Dashboard.updateValue(${index}, "others", this.value)'></td>
                <td><input type='number' step='0.01' value='${row.loan}' onchange='Dashboard.updateValue(${index}, "loan", this.value)'></td>
                <td class='calculated'>${row.totalExpenses.toFixed(0)}</td>
                <td class='calculated' style='color: ${row.savings >= 0 ? "#2649B2" : "#C39BD3"};'>${row.savings.toFixed(0)}</td>
                <td><input type='number' step='0.01' value='${row.investment}' onchange='Dashboard.updateValue(${index}, "investment", this.value)'></td>
                <td class='calculated' style='background: #D4D9F0;'>${row.monthlyGain.toFixed(2)}</td>
                <td class='calculated'>${row.cumulatedGains.toFixed(0)}</td>
                <td><input type='number' step='0.01' value='${row.peeLoreal}' onchange='Dashboard.updateValue(${index}, "peeLoreal", this.value)'></td>
                <td class='calculated'>${row.cumulatedInvestment.toFixed(0)}</td>
                <td class='calculated'>${row.totalPortfolio.toFixed(0)}</td>
                <td class='calculated'>${row.roi.toFixed(2)}%</td>
                <td><button class='btn-delete' onclick='Dashboard.deleteRow(${index})'>X</button></td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    /**
     * Met à jour une valeur du tableau
     */
    async function updateValue(index, field, value) {
        allData[index][field] = parseFloat(value) || 0;
        
        if (field === 'investment') {
            await recalculateGains();
        } else {
            calculateAll();
            renderTable();
            await autoSave();
        }
    }
    
    // ========== ÉDITION EN MASSE ==========
    
    /**
     * Applique une modification en masse
     */
    async function applyBulkEdit() {
        const category = document.getElementById('bulkCategory').value;
        const startMonth = document.getElementById('bulkStartMonth').value;
        const endMonth = document.getElementById('bulkEndMonth').value;
        const value = parseFloat(document.getElementById('bulkValue').value);
        
        if (!startMonth || !endMonth || isNaN(value)) {
            alert('Please fill all fields!'); 
            return;
        }
        
        const fieldMap = {
            'Salary': 'salary', 
            'Misc.': 'misc', 
            'Rent': 'rent', 
            'Food': 'food',
            'Fix Costs': 'fixCosts', 
            'Others (Shopping; Restaurant)': 'others',
            'Investment': 'investment', 
            'Loan (Studies; rental investment)': 'loan',
            "PEE L'OREAL": 'peeLoreal'
        };
        
        const field = fieldMap[category];
        const [startY, startM] = startMonth.split('-').map(Number);
        const [endY, endM] = endMonth.split('-').map(Number);
        
        let count = 0;
        allData.forEach(row => {
            const [m, y] = row.month.split('/').map(Number);
            const rowDate = y * 12 + m;
            const start = startY * 12 + startM;
            const end = endY * 12 + endM;
            
            if (rowDate >= start && rowDate <= end) {
                row[field] = value;
                count++;
            }
        });
        
        if (field === 'investment') {
            await recalculateGains();
        } else {
            calculateAll();
            renderTable();
            await autoSave();
        }
        
        window.FinanceDashboard.showNotification(
            'Applied ' + value + ' EUR to ' + count + ' months for ' + category, 
            'success'
        );
    }
    
    // ========== STATISTIQUES ==========
    
    /**
     * Met à jour les statistiques
     */
    function updateStats() {
        const currentRow = allData[currentMonthIndex];
        const monthName = currentRow.month;
        
        const html = `
            <div class='stat-card'>
                <h3>Monthly Income (${monthName})</h3>
                <div class='value'>${currentRow.totalIncome.toLocaleString()} EUR</div>
            </div>
            <div class='stat-card'>
                <h3>Monthly Expenses (${monthName})</h3>
                <div class='value'>${currentRow.totalExpenses.toLocaleString()} EUR</div>
            </div>
            <div class='stat-card positive'>
                <h3>Total Savings (${monthName})</h3>
                <div class='value'>${currentRow.cumulatedSavings.toLocaleString()} EUR</div>
            </div>
            <div class='stat-card positive'>
                <h3>Total Portfolio (${monthName})</h3>
                <div class='value'>${currentRow.totalPortfolio.toLocaleString()} EUR</div>
            </div>
            <div class='stat-card ${currentRow.roi > 0 ? 'positive' : 'negative'}'>
                <h3>ROI (${monthName})</h3>
                <div class='value'>${currentRow.roi.toFixed(1)}%</div>
            </div>
        `;
        
        const container = document.getElementById('statsContainer');
        if (container) container.innerHTML = html;
    }

    // ========== GRAPHIQUES (CHARTS) ==========
    // [... Le reste du code des graphiques reste IDENTIQUE ...]
    // Je ne le répète pas ici pour gagner de la place, mais garde tout le code
    // des fonctions createChart1(), updateChart2(), etc.
    
    /**
     * Initialise les filtres de mois pour les graphiques
     */
    function initMonthFilters() {
        // ... code identique ...
    }
    
    function createChart1() {
        // ... code identique ...
    }
    
    function updateChart2() {
        // ... code identique ...
    }
    
    function updateChart3() {
        // ... code identique ...
    }
    
    function createChart4() {
        // ... code identique ...
    }
    
    function createChart5() {
        // ... code identique ...
    }
    
    function createChart6() {
        // ... code identique ...
    }
    
    function updateChart7() {
        // ... code identique ...
    }
    
    /**
     * Met à jour tous les graphiques
     */
    function updateAllCharts() {
        updateStats();
        initMonthFilters();
        createChart1();
        updateChart2();
        updateChart3();
        createChart4();
        createChart5();
        createChart6();
        updateChart7();
    }

    // ========== EXPORTS PUBLICS ==========
    return {
        // Initialisation
        init,
        
        // Paramètres
        updateEstYield,
        updateEstYieldDisplay,
        updateInflationRate,
        toggleInflationCharts,
        
        // Calculs
        recalculateGains,
        
        // Timeline
        addMonthsBefore,
        addMonthsAfter,
        deleteRow,
        
        // Sauvegarde
        saveData,
        exportToJSON,
        importFromJSON,
        resetToDefault,
        
        // Tableau
        updateValue,
        applyBulkEdit,
        
        // Graphiques
        updateAllCharts,
        updateChart2,
        updateChart3,
        updateChart7
    };
})();

// Initialisation au chargement de la page
window.addEventListener('DOMContentLoaded', Dashboard.init);

/* ============================================
   SIDEBAR USER MENU - Toggle
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    const sidebarUserTrigger = document.getElementById('sidebarUserTrigger');
    const sidebarUserDropdown = document.getElementById('sidebarUserDropdown');
    
    if (sidebarUserTrigger && sidebarUserDropdown) {
        // Toggle dropdown au clic
        sidebarUserTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Toggle classes
            sidebarUserTrigger.classList.toggle('active');
            sidebarUserDropdown.classList.toggle('active');
        });
        
        // Fermer le dropdown si on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!sidebarUserDropdown.contains(e.target) && 
                !sidebarUserTrigger.contains(e.target)) {
                sidebarUserTrigger.classList.remove('active');
                sidebarUserDropdown.classList.remove('active');
            }
        });
        
        // Empêcher la fermeture si on clique dans le dropdown
        sidebarUserDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
});

console.log('✅ Dashboard module loaded with Firestore support');