/* ==============================================
   DASHBOARD.JS - Logique du dashboard financier
   Version Cloud avec Cloudflare Workers
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
    
    // ========== INITIALISATION ==========
    
    /**
     * Initialise le dashboard au chargement de la page
     */
    async function init() {
        console.log('🚀 Initializing Dashboard...');
        
        // Attendre que l'utilisateur soit authentifié
        const waitForAuth = new Promise((resolve) => {
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    console.log('✅ User authenticated, loading data...');
                    unsubscribe();
                    resolve();
                }
            });
        });
        
        await waitForAuth;
        
        // Charger les données
        await initData();
        renderTable();
        updateAllCharts();
        updateLastUpdateTime();
        
        console.log('✅ Dashboard initialized');
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
     * Initialise les données (depuis Cloudflare ou localStorage si hors ligne)
     */
    async function initData() {
        console.log('📥 Loading data...');
        
        // Essayer de charger depuis Cloudflare
        let loadedFromCloud = false;
        
        if (window.SimulationManager) {
            const currentSimName = window.SimulationManager.getCurrentSimulationName() || 'default';
            console.log(`🔄 Loading simulation "${currentSimName}" from cloud...`);
            
            const cloudData = await window.SimulationManager.loadSimulation(currentSimName);
            
            if (cloudData && cloudData.data && cloudData.data.length > 0) {
                // Charger depuis Cloudflare
                console.log('✅ Loaded from Cloudflare');
                monthlyEstYield = cloudData.monthlyEstYield || 8;
                inflationRate = cloudData.inflationRate || 2.5;
                allData = cloudData.data;
                loadedFromCloud = true;
            }
        }
        
        // Fallback sur localStorage si pas chargé depuis cloud
        if (!loadedFromCloud) {
            console.log('⚠ Loading from localStorage (fallback)');
            const saved = localStorage.getItem('financialDataDynamic');
            const savedYield = localStorage.getItem('monthlyEstYield');
            const savedInflation = localStorage.getItem('inflationRate');
            
            if (savedYield) {
                monthlyEstYield = parseFloat(savedYield);
            }
            
            if (savedInflation) {
                inflationRate = parseFloat(savedInflation);
            }
            
            if (saved) {
                try {
                    allData = JSON.parse(saved);
                    if (allData.length === 0) throw 'Empty data';
                } catch(e) {
                    createDefaultData();
                }
            } else {
                createDefaultData();
            }
        }
        
        // Mettre à jour l'UI
        document.getElementById('monthlyEstYield').value = monthlyEstYield;
        document.getElementById('inflationRate').value = inflationRate;
        updateEstYieldDisplay();
        
        calculateAll();
        currentMonthIndex = findCurrentMonthIndex();
        updateTotalMonthsDisplay();
    }
    
    /**
     * Crée les données par défaut
     */
    function createDefaultData() {
        console.log('📝 Creating default data...');
        const today = new Date();
        const startYear = today.getFullYear();
        const startMonth = today.getMonth() + 1;
        const months = generateMonths(startYear, startMonth, 12);
        
        allData = months.map(month => ({
            month: month,
            salary: 0, 
            misc: 0,
            rent: 0, 
            food: 0, 
            fixCosts: 0, 
            others: 0, 
            loan: 0,
            investment: 0,
            monthlyGain: 0,
            cumulatedGains: 0, 
            pee: 0
        }));
    }
    
    // ========== CALCULS ==========
    
    /**
     * ✅ CORRECTION FINALE : Calcule tous les indicateurs financiers
     */
    function calculateAll() {
        let cumulatedSavings = 0;
        let cumulatedInvestment = 0;
        let cumulatedPEE = 0;
        
        allData.forEach(row => {
            // Calcul des totaux
            row.totalIncome = (row.salary || 0) + (row.misc || 0);
            row.totalExpenses = (row.rent || 0) + (row.food || 0) + 
                                (row.fixCosts || 0) + (row.others || 0) + 
                                (row.loan || 0);
            
            // ✅ Épargne pure (sans investissements)
            row.savings = row.totalIncome - row.totalExpenses - (row.investment || 0) - (row.pee || 0);
            
            cumulatedSavings += row.savings;
            row.cumulatedSavings = cumulatedSavings;
            
            cumulatedInvestment += (row.investment || 0);
            row.cumulatedInvestment = cumulatedInvestment;
            
            cumulatedPEE += (row.pee || 0);
            row.cumulatedPEE = cumulatedPEE;
            
            // ✅ CORRECTION MAJEURE : Portfolio total inclut TOUT le patrimoine
            // Total Portfolio = Investissements + Gains + Épargne Pure + PEE
            row.totalPortfolio = cumulatedInvestment + 
                                (row.cumulatedGains || 0) + 
                                cumulatedSavings +
                                cumulatedPEE;
            
            row.roi = cumulatedInvestment > 0 ? 
                      ((row.cumulatedGains || 0) / cumulatedInvestment * 100) : 0;
        });
    }
    
    /**
     * Recalcule les gains d'investissement
     */
    function recalculateGains() {
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
        autoSave();
        updateAllCharts();
    }

    // ========== GESTION DES PARAMÈTRES ==========
    
    /**
     * Met à jour le rendement mensuel estimé
     */
    function updateEstYield() {
        monthlyEstYield = parseFloat(document.getElementById('monthlyEstYield').value) || 0;
        updateEstYieldDisplay();
        localStorage.setItem('monthlyEstYield', monthlyEstYield);
        recalculateGains();
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
    function updateInflationRate() {
        inflationRate = parseFloat(document.getElementById('inflationRate').value) || 2.5;
        localStorage.setItem('inflationRate', inflationRate);
        if (showInflation) updateAllCharts();
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
    function addMonthsBefore(count) {
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
            salary: 0, misc: 0,
            rent: 0, food: 0, fixCosts: 0, others: 0, loan: 0,
            investment: 0,
            monthlyGain: 0,
            cumulatedGains: 0, 
            pee: 0
        }));
        
        allData = newRows.concat(allData);
        recalculateGains();
        currentMonthIndex = findCurrentMonthIndex();
        updateTotalMonthsDisplay();
        updateAllCharts();
    }
    
    /**
     * Ajoute des mois après
     */
    function addMonthsAfter(count) {
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
            salary: 0, misc: 0,
            rent: 0, food: 0, fixCosts: 0, others: 0, loan: 0,
            investment: 0,
            monthlyGain: 0,
            cumulatedGains: 0, 
            pee: 0
        }));
        
        allData = allData.concat(newRows);
        recalculateGains();
        updateTotalMonthsDisplay();
        updateAllCharts();
    }
    
    /**
     * Supprime une ligne
     */
    function deleteRow(index) {
        if (allData.length <= 12) {
            alert('Cannot delete! Minimum 12 months required.');
            return;
        }
        
        if (confirm('Delete month ' + allData[index].month + '?')) {
            allData.splice(index, 1);
            recalculateGains();
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
    
    // ========== SAUVEGARDE/CHARGEMENT (VERSION CLOUD) ==========
    
    /**
     * Sauvegarde manuelle (vers Cloudflare)
     */
    async function saveData() {
        calculateAll();
        
        // Préparer les données
        const simulationData = {
            monthlyEstYield: monthlyEstYield,
            inflationRate: inflationRate,
            data: allData
        };
        
        // Obtenir le nom de la simulation actuelle
        const name = window.SimulationManager 
            ? window.SimulationManager.getCurrentSimulationName() 
            : 'default';
        
        // Sauvegarder sur Cloudflare
        if (window.SimulationManager) {
            const success = await window.SimulationManager.saveSimulation(name, simulationData);
            
            if (!success) {
                // Fallback sur localStorage en cas d'erreur
                localStorage.setItem('financialDataDynamic', JSON.stringify(allData));
                localStorage.setItem('monthlyEstYield', monthlyEstYield);
                localStorage.setItem('inflationRate', inflationRate);
                window.FinanceDashboard.showNotification('Saved locally (cloud save failed)', 'warning');
            }
        } else {
            // Pas de SimulationManager, utiliser localStorage
            localStorage.setItem('financialDataDynamic', JSON.stringify(allData));
            localStorage.setItem('monthlyEstYield', monthlyEstYield);
            localStorage.setItem('inflationRate', inflationRate);
            window.FinanceDashboard.showNotification('Data saved locally!', 'success');
        }
    }
    
    /**
     * Sauvegarde automatique (débounced)
     */
    let autoSaveTimeout;
    function autoSave() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(async () => {
            calculateAll();
            
            const simulationData = {
                monthlyEstYield: monthlyEstYield,
                inflationRate: inflationRate,
                data: allData
            };
            
            if (window.SimulationManager) {
                const name = window.SimulationManager.getCurrentSimulationName() || 'default';
                await window.SimulationManager.saveSimulation(name, simulationData);
            } else {
                // Fallback localStorage
                localStorage.setItem('financialDataDynamic', JSON.stringify(allData));
                localStorage.setItem('monthlyEstYield', monthlyEstYield);
                localStorage.setItem('inflationRate', inflationRate);
            }
        }, 2000); // Sauvegarde après 2 secondes d'inactivité
    }
    
    /**
     * Charge des données de simulation
     */
    function loadSimulationData(simulationData) {
        if (!simulationData) return;
        
        console.log('📥 Loading simulation data...');
        
        monthlyEstYield = simulationData.monthlyEstYield || 8;
        inflationRate = simulationData.inflationRate || 2.5;
        allData = simulationData.data || [];
        
        document.getElementById('monthlyEstYield').value = monthlyEstYield;
        document.getElementById('inflationRate').value = inflationRate;
        updateEstYieldDisplay();
        
        calculateAll();
        renderTable();
        updateAllCharts();
        currentMonthIndex = findCurrentMonthIndex();
        updateTotalMonthsDisplay();
        
        window.FinanceDashboard.showNotification('Simulation loaded successfully!', 'success');
    }
    
    /**
     * Récupère les données actuelles
     */
    function getCurrentData() {
        return {
            monthlyEstYield: monthlyEstYield,
            inflationRate: inflationRate,
            data: allData
        };
    }
    
    /**
     * Exporte en JSON
     */
    function exportToJSON() {
        const exportData = {
            monthlyEstYield: monthlyEstYield,
            inflationRate: inflationRate,
            data: allData
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
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = event => {
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
                    saveData();
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
    function resetToDefault() {
        if (confirm('Reset all data to default 12 months?')) {
            localStorage.removeItem('financialDataDynamic');
            localStorage.removeItem('monthlyEstYield');
            localStorage.removeItem('inflationRate');
            monthlyEstYield = 8;
            inflationRate = 2.5;
            document.getElementById('monthlyEstYield').value = 8;
            document.getElementById('inflationRate').value = 2.5;
            updateEstYieldDisplay();
            showInflation = false;
            createDefaultData();
            calculateAll();
            renderTable();
            updateAllCharts();
            window.FinanceDashboard.showNotification('Data reset to default!', 'info');
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
                ${row.month}
                
                
                ${row.totalIncome.toFixed(0)}
                
                
                
                
                
                ${row.totalExpenses.toFixed(0)}
                ${row.savings.toFixed(0)}
                
                ${row.monthlyGain.toFixed(2)}
                ${row.cumulatedGains.toFixed(0)}
                
                ${row.cumulatedInvestment.toFixed(0)}
                ${row.totalPortfolio.toFixed(0)}
                ${row.roi.toFixed(2)}%
                X
            `;
            tbody.appendChild(tr);
        });
    }
    
    /**
     * Met à jour une valeur du tableau
     */
    function updateValue(index, field, value) {
        allData[index][field] = parseFloat(value) || 0;
        
        if (field === 'investment' || field === 'pee') {
            recalculateGains();
        } else {
            calculateAll();
            renderTable();
            autoSave();
        }
    }
    
    // ========== ÉDITION EN MASSE ==========
    
    /**
     * Applique une modification en masse
     */
    function applyBulkEdit() {
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
            "Investment - Others": 'pee'
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
        
        if (field === 'investment' || field === 'pee') {
            recalculateGains();
        } else {
            calculateAll();
            renderTable();
            autoSave();
            updateAllCharts();
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
            
                <strong>Monthly Income (${monthName})</strong>
                ${currentRow.totalIncome.toLocaleString()} EUR
            
            
                <strong>Monthly Expenses (${monthName})</strong>
                ${currentRow.totalExpenses.toLocaleString()} EUR
            
            
                <strong>Total Savings (${monthName})</strong>
                ${currentRow.cumulatedSavings.toLocaleString()} EUR
            
            
                <strong>Total Portfolio (${monthName})</strong>
                ${currentRow.totalPortfolio.toLocaleString()} EUR
            
            
                <strong>ROI (${monthName})</strong>
                ${currentRow.roi.toFixed(1)}%
            
        `;
        
        const container = document.getElementById('statsContainer');
        if (container) container.innerHTML = html;
    }

    // ========== GRAPHIQUES (CHARTS) ==========
    
    /**
     * Initialise les filtres de mois pour les graphiques
     */
    function initMonthFilters() {
        const incomeFilter = document.getElementById('incomeMonthFilter');
        const expenseFilter = document.getElementById('expenseMonthFilter');
        const budgetFilter = document.getElementById('budgetMonthFilter');
        
        if (!incomeFilter || !expenseFilter || !budgetFilter) return;
        
        incomeFilter.innerHTML = '';
        expenseFilter.innerHTML = '';
        budgetFilter.innerHTML = '';
        
        allData.forEach((row, index) => {
            const opt1 = new Option(row.month, index);
            const opt2 = new Option(row.month, index);
            const opt3 = new Option(row.month, index);
            
            if (index === currentMonthIndex) {
                opt1.selected = true;
                opt2.selected = true;
                opt3.selected = true;
            }
            
            incomeFilter.add(opt1);
            expenseFilter.add(opt2);
            budgetFilter.add(opt3);
        });
    }
    
    /**
     * Graphique 1 : Évolution Revenus vs Dépenses
     */
    function createChart1() {
        const months = allData.map(d => d.month);
        const incomeValues = allData.map(d => d.totalIncome);
        const expenseValues = allData.map(d => d.totalExpenses);
        const savingsValues = allData.map(d => d.savings);
        
        if (chart1Instance) chart1Instance.destroy();
        
        chart1Instance = Highcharts.chart('chart1', {
            chart: { 
                type: 'line', 
                backgroundColor: 'transparent', 
                zoomType: 'x' 
            },
            title: { text: null },
            xAxis: { 
                categories: months, 
                crosshair: true, 
                labels: { 
                    rotation: -45, 
                    style: { fontSize: '10px' } 
                } 
            },
            yAxis: { 
                title: { 
                    text: 'Amount (EUR)', 
                    style: { color: '#2649B2' } 
                } 
            },
            tooltip: { 
                shared: true, 
                valueDecimals: 0, 
                valueSuffix: ' EUR' 
            },
            series: [
                { 
                    name: 'Income', 
                    data: incomeValues, 
                    color: '#4A74F3', 
                    lineWidth: 2 
                },
                { 
                    name: 'Expenses', 
                    data: expenseValues, 
                    color: '#8E44AD', 
                    lineWidth: 2 
                },
                { 
                    name: 'Monthly Savings (Net)', 
                    data: savingsValues, 
                    color: '#2649B2', 
                    type: 'area', 
                    fillColor: { 
                        linearGradient: [0, 0, 0, 12], 
                        stops: [
                            [0, 'rgba(38,73,178,0.3)'], 
                            [1, 'rgba(38,73,178,0.05)']
                        ] 
                    }, 
                    lineWidth: 2 
                }
            ],
            plotOptions: { 
                line: { marker: { enabled: false } }, 
                area: { marker: { enabled: false } } 
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique 2 : Répartition des Revenus
     */
    function updateChart2() {
        const monthIndex = parseInt(document.getElementById('incomeMonthFilter')?.value || 0);
        const row = allData[monthIndex];
        
        if (!row) return;
        
        Highcharts.chart('chart2', {
            chart: { 
                type: 'pie', 
                backgroundColor: 'transparent' 
            },
            title: { 
                text: row.month, 
                style: { 
                    color: '#2649B2', 
                    fontWeight: 'bold' 
                } 
            },
            tooltip: { 
                pointFormat: '{point.name}: <b>{point.y:,.0f} EUR</b> ({point.percentage:.1f}%)' 
            },
            series: [{
                name: 'Amount',
                data: [
                    { name: 'Salary', y: row.salary },
                    { name: 'Misc.', y: row.misc }
                ],
                colorByPoint: true
            }],
            colors: ['#2649B2', '#4A74F3'],
            plotOptions: {
                pie: {
                    innerSize: '50%',
                    dataLabels: {
                        format: '<b>{point.name}</b>: {point.y:,.0f} EUR',
                        style: { color: '#2649B2' }
                    },
                    borderWidth: 2,
                    borderColor: '#E8DAEF'
                }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * ✅ Graphique 3 : MONEY ALLOCATION (Dépenses + Investissements)
     */
    function updateChart3() {
        const monthIndex = parseInt(document.getElementById('expenseMonthFilter')?.value || 0);
        const row = allData[monthIndex];
        
        if (!row) return;
        
        Highcharts.chart('chart3', {
            chart: { 
                type: 'pie', 
                backgroundColor: 'transparent' 
            },
            title: { 
                text: row.month + ' - Money Allocation', 
                style: { 
                    color: '#6C3483', 
                    fontWeight: 'bold' 
                } 
            },
            tooltip: { 
                pointFormat: '{point.name}: <b>{point.y:,.0f} EUR</b> ({point.percentage:.1f}%)' 
            },
            series: [{
                name: 'Amount',
                data: [
                    { name: 'Rent', y: row.rent, color: '#5B2C6F' },
                    { name: 'Food', y: row.food, color: '#6C3483' },
                    { name: 'Fix Costs', y: row.fixCosts, color: '#8E44AD' },
                    { name: 'Others', y: row.others, color: '#9D5CE6' },
                    { name: 'Loan', y: row.loan, color: '#C39BD3' },
                    { name: 'Monthly Investment', y: row.investment, color: '#4A74F3' },
                    { name: 'Investment - Others', y: row.pee, color: '#6C8BE0' }
                ]
            }],
            plotOptions: {
                pie: {
                    dataLabels: {
                        format: '<b>{point.name}</b>: {point.y:,.0f} EUR',
                        style: { color: '#5B2C6F' }
                    },
                    borderWidth: 2,
                    borderColor: '#E8DAEF'
                }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique 4 : Évolution de l'Épargne Cumulée
     */
    function createChart4() {
        const months = allData.map(d => d.month);
        const savingsData = allData.map(d => d.cumulatedSavings);
        const savingsDataReal = showInflation ? 
            allData.map((d, i) => adjustForInflation(d.cumulatedSavings, i)) : [];
        
        const series = [{
            name: 'Nominal Savings',
            data: savingsData,
            color: '#2649B2',
            fillColor: {
                linearGradient: [0, 0, 0, 12],
                stops: [
                    [0, 'rgba(38,73,178,0.5)'],
                    [1, 'rgba(38,73,178,0.1)']
                ]
            },
            lineWidth: 2
        }];
        
        if (showInflation) {
            series.push({
                name: 'Real Savings (Inflation-Adjusted)',
                data: savingsDataReal,
                color: '#9D5CE6',
                dashStyle: 'Dash',
                fillColor: {
                    linearGradient: [0, 0, 0, 12],
                    stops: [
                        [0, 'rgba(157,92,230,0.3)'],
                        [1, 'rgba(157,92,230,0.05)']
                    ]
                },
                lineWidth: 2
            });
        }
        
        if (chart4Instance) chart4Instance.destroy();
        
        chart4Instance = Highcharts.chart('chart4', {
            chart: { 
                type: 'area', 
                backgroundColor: 'transparent' 
            },
            title: { 
                text: showInflation ? 
                    'Inflation Rate: ' + inflationRate + '% annual' : null,
                style: { 
                    color: '#9D5CE6', 
                    fontSize: '0.9em' 
                }
            },
            xAxis: {
                categories: months,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { fontSize: '10px' }
                }
            },
            yAxis: {
                title: {
                    text: 'Cumulated Savings (EUR)',
                    style: { color: '#2649B2' }
                }
            },
            tooltip: {
                shared: true,
                valueDecimals: 0,
                valueSuffix: ' EUR'
            },
            series: series,
            plotOptions: {
                area: { marker: { enabled: false } }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * ✅ Graphique 5 : Portefeuille TOTAL (Investissements + Gains + Épargne + PEE)
     */
    function createChart5() {
        const months = allData.map(d => d.month);
        const cumInv = allData.map(d => d.cumulatedInvestment);
        const gains = allData.map(d => d.cumulatedGains);
        const cumSavings = allData.map(d => d.cumulatedSavings);
        const cumPEE = allData.map(d => d.cumulatedPEE || 0);
        const portfolio = allData.map(d => d.totalPortfolio);
        
        const portfolioReal = showInflation ? 
            allData.map((d, i) => adjustForInflation(d.totalPortfolio, i)) : [];
        const cumInvReal = showInflation ? 
            allData.map((d, i) => adjustForInflation(d.cumulatedInvestment, i)) : [];
        
        const series = [
            {
                name: 'Cumulated Investment',
                data: cumInv,
                color: '#6C8BE0',
                lineWidth: 2
            },
            {
                name: 'Cumulated Gains',
                data: gains,
                color: '#8E7DE3',
                dashStyle: 'ShortDot',
                lineWidth: 2
            },
            {
                name: 'Cumulated Savings (Pure)',
                data: cumSavings,
                color: '#34C759',
                lineWidth: 2
            },
            {
                name: "Cumulated PEE",
                data: cumPEE,
                color: '#9D5CE6',
                lineWidth: 2
            },
            {
                name: 'Total Portfolio',
                data: portfolio,
                color: '#2649B2',
                lineWidth: 3
            }
        ];
        
        if (showInflation) {
            series.push({
                name: 'Portfolio (Real)',
                data: portfolioReal,
                color: '#B55CE6',
                dashStyle: 'Dash',
                lineWidth: 3
            });
            series.push({
                name: 'Investment (Real)',
                data: cumInvReal,
                color: '#D4D9F0',
                dashStyle: 'Dash',
                lineWidth: 2
            });
        }
        
        if (chart5Instance) chart5Instance.destroy();
        
        chart5Instance = Highcharts.chart('chart5', {
            chart: { 
                type: 'line', 
                backgroundColor: 'transparent' 
            },
            title: {
                text: showInflation ? 
                    'Inflation Rate: ' + inflationRate + '% annual' : null,
                style: {
                    color: '#9D5CE6',
                    fontSize: '0.9em'
                }
            },
            xAxis: {
                categories: months,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { fontSize: '10px' }
                }
            },
            yAxis: {
                title: {
                    text: 'Value (EUR)',
                    style: { color: '#2649B2' }
                }
            },
            tooltip: {
                shared: true,
                valueDecimals: 0,
                valueSuffix: ' EUR'
            },
            series: series,
            plotOptions: {
                line: { marker: { enabled: false } }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique 6 : Évolution du ROI
     */
    function createChart6() {
        const months = allData.map(d => d.month);
        const roi = allData.map(d => d.roi);
        
        if (chart6Instance) chart6Instance.destroy();
        
        chart6Instance = Highcharts.chart('chart6', {
            chart: { 
                type: 'area', 
                backgroundColor: 'transparent' 
            },
            title: { text: null },
            xAxis: {
                categories: months,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { fontSize: '10px' }
                }
            },
            yAxis: {
                title: {
                    text: 'ROI (%)',
                    style: { color: '#2649B2' }
                },
                plotLines: [{
                    value: 0,
                    color: '#8E44AD',
                    width: 2,
                    dashStyle: 'Dash'
                }]
            },
            tooltip: {
                valueDecimals: 2,
                valueSuffix: '%'
            },
            series: [{
                name: 'ROI',
                data: roi,
                color: '#4A74F3',
                fillColor: {
                    linearGradient: [0, 0, 0, 12],
                    stops: [
                        [0, 'rgba(74,116,243,0.4)'],
                        [1, 'rgba(74,116,243,0.05)']
                    ]
                },
                lineWidth: 2
            }],
            plotOptions: {
                area: { marker: { enabled: false } }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * ✅ Graphique 7 : BUDGET ALLOCATION (50/30/20 avec Savings = Épargne + Investissements)
     */
    function updateChart7() {
        const monthIndex = parseInt(document.getElementById('budgetMonthFilter')?.value || 0);
        const row = allData[monthIndex];
        
        if (!row) return;
        
        const needsAmount = row.rent + row.food + row.fixCosts + row.loan;
        const wantsAmount = row.others;
        
        // ✅ CORRECTION : Savings = Épargne pure + Investissements
        const savingsAmount = row.savings + (row.investment || 0) + (row.pee || 0);
        
        const total = row.totalIncome;
        
        const needsPercent = total > 0 ? (needsAmount / total * 100) : 0;
        const wantsPercent = total > 0 ? (wantsAmount / total * 100) : 0;
        const savingsPercent = total > 0 ? (savingsAmount / total * 100) : 0;
        
        Highcharts.chart('chart7', {
            chart: { 
                type: 'pie', 
                backgroundColor: 'transparent' 
            },
            title: {
                text: row.month + ' - 50/30/20 Rule - Total: ' + total.toLocaleString() + ' EUR',
                style: {
                    color: '#2649B2',
                    fontWeight: 'bold'
                }
            },
            tooltip: {
                useHTML: true,
                pointFormat: '<b>{point.name}</b><br>Amount: {point.amount:,.0f} EUR<br>Percentage: {point.percentage:.1f}%'
            },
            plotOptions: {
                pie: {
                    innerSize: '60%',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b><br>{point.percentage:.1f}%<br>{point.amount:,.0f} EUR',
                        style: { color: '#2649B2' }
                    },
                    borderWidth: 2,
                    borderColor: '#E8DAEF'
                }
            },
            series: [{
                name: 'Budget',
                data: [
                    {
                        name: 'Needs (50%)',
                        y: needsPercent,
                        amount: needsAmount,
                        color: '#6C3483'
                    },
                    {
                        name: 'Wants (30%)',
                        y: wantsPercent,
                        amount: wantsAmount,
                        color: '#9D5CE6'
                    },
                    {
                        name: 'Savings (20%)',
                        y: savingsPercent,
                        amount: savingsAmount,
                        color: '#2649B2'
                    }
                ]
            }],
            credits: { enabled: false }
        });
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
        updateChart7,
        
        // Gestion des simulations
        loadSimulationData,
        getCurrentData
    };
})();

// ========== EXPOSITION GLOBALE DU DASHBOARD ==========
window.Dashboard = Dashboard;

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

console.log('✅ Dashboard script loaded - Cloud version with complete patrimony tracking');