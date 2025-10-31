/* ==============================================
   DASHBOARD.JS - Modern Financial Dashboard 2024
   Version optimisée avec palette Bleu/Violet
   ============================================== */

/**
 * Module Dashboard - Pattern IIFE pour encapsulation
 * Gestion complète d'un tableau de bord financier personnel
 */
const Dashboard = (function() {
    'use strict';
    
    // ========================================
    // PALETTE DE COULEURS BLEU/VIOLET
    // ========================================
    
    const COLORS = {
        // Bleus
        primaryBlue: '#4A74F3',
        darkBlue: '#2649B2',
        lightBlue: '#6C8BE0',
        veryLightBlue: '#D4D9F0',
        
        // Violets
        primaryViolet: '#8E44AD',
        darkViolet: '#6C3483',
        lightViolet: '#9D5CE6',
        veryLightViolet: '#C39BD3',
        mediumViolet: '#8E7DE3',
        
        // Spéciaux
        accent: '#B55CE6',
        neutral: '#94a3b8'
    };
    
    // ========================================
    // VARIABLES PRIVÉES
    // ========================================
    
    let allData = [];
    let chartInstances = {
        chart1: null,
        chart2: null,
        chart3: null,
        chart4: null,
        chart5: null,
        chart6: null,
        chart7: null
    };
    let currentMonthIndex = 0;
    let monthlyEstYield = 8; // % annuel
    let inflationRate = 2.5; // % annuel
    let showInflation = false;
    
    // Configuration par défaut
    const DEFAULT_CONFIG = {
        startMonthsCount: 300,
        defaultSalary: 3000,
        defaultMisc: 100,
        defaultRent: 800,
        defaultFood: 300,
        defaultFixCosts: 150,
        defaultOthers: 200,
        defaultLoan: 300,
        defaultInvestment: 500
    };
    
    // ========================================
    // INITIALISATION
    // ========================================
    
    /**
     * Initialise le dashboard au chargement de la page
     */
    function init() {
        console.log('🚀 Initialisation du Dashboard...');
        
        try {
            initData();
            renderTable();
            updateAllCharts();
            updateLastUpdateTime();
            initEventListeners();
            
            console.log('✅ Dashboard initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            showNotification('Erreur lors de l\'initialisation du dashboard', 'error');
        }
    }
    
    /**
     * Initialise les event listeners supplémentaires
     */
    function initEventListeners() {
        // Écoute du redimensionnement pour adapter les graphiques
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                updateAllCharts();
            }, 250);
        });
    }
    
    /**
     * Met à jour l'heure de dernière mise à jour
     */
    function updateLastUpdateTime() {
        const now = new Date();
        const formatted = now.toLocaleDateString('fr-FR', { 
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const elem = document.getElementById('lastUpdate');
        if (elem) elem.textContent = formatted;
    }
    
    // ========================================
    // GESTION DES DONNÉES
    // ========================================
    
    /**
     * Génère un tableau de mois
     * @param {number} startYear - Année de départ
     * @param {number} startMonth - Mois de départ (1-12)
     * @param {number} count - Nombre de mois à générer
     * @returns {Array<string>} Tableau de mois au format "MM/YYYY"
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
     * Trouve l'index du mois actuel dans les données
     * @returns {number} Index du mois actuel
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
     * Initialise les données depuis localStorage ou valeurs par défaut
     */
    function initData() {
        const saved = localStorage.getItem('financialDataDynamic');
        const savedYield = localStorage.getItem('monthlyEstYield');
        const savedInflation = localStorage.getItem('inflationRate');
        
        // Restauration des paramètres
        if (savedYield) {
            monthlyEstYield = parseFloat(savedYield);
            const yieldInput = document.getElementById('monthlyEstYield');
            if (yieldInput) yieldInput.value = monthlyEstYield;
            updateEstYieldDisplay();
        }
        
        if (savedInflation) {
            inflationRate = parseFloat(savedInflation);
            const inflationInput = document.getElementById('inflationRate');
            if (inflationInput) inflationInput.value = inflationRate;
        }
        
        // Restauration des données
        if (saved) {
            try {
                allData = JSON.parse(saved);
                if (!Array.isArray(allData) || allData.length === 0) {
                    throw new Error('Données invalides');
                }
            } catch(e) {
                console.warn('⚠️ Données sauvegardées invalides, création de nouvelles données');
                createDefaultData();
            }
        } else {
            createDefaultData();
        }
        
        calculateAll();
        currentMonthIndex = findCurrentMonthIndex();
        updateTotalMonthsDisplay();
    }
    
    /**
     * Crée les données par défaut
     */
    function createDefaultData() {
        const today = new Date();
        const startYear = today.getFullYear();
        const startMonth = today.getMonth() + 1;
        const months = generateMonths(startYear, startMonth, DEFAULT_CONFIG.startMonthsCount);
        
        allData = months.map(month => ({
            month: month,
            salary: DEFAULT_CONFIG.defaultSalary, 
            misc: DEFAULT_CONFIG.defaultMisc,
            rent: DEFAULT_CONFIG.defaultRent, 
            food: DEFAULT_CONFIG.defaultFood, 
            fixCosts: DEFAULT_CONFIG.defaultFixCosts, 
            others: DEFAULT_CONFIG.defaultOthers, 
            loan: DEFAULT_CONFIG.defaultLoan,
            investment: DEFAULT_CONFIG.defaultInvestment,
            monthlyGain: 0,
            cumulatedGains: 0, 
            peeLoreal: 0
        }));
    }
    
    // ========================================
    // CALCULS FINANCIERS
    // ========================================
    
    /**
     * Calcule tous les indicateurs financiers
     */
    function calculateAll() {
        let cumulatedSavings = 0;
        let cumulatedInvestment = 0;
        
        allData.forEach(row => {
            // Calcul des revenus totaux
            row.totalIncome = (row.salary || 0) + (row.misc || 0);
            
            // Calcul des dépenses totales
            row.totalExpenses = (row.rent || 0) + (row.food || 0) + 
                                (row.fixCosts || 0) + (row.others || 0) + 
                                (row.loan || 0);
            
            // Calcul de l'épargne mensuelle
            row.savings = row.totalIncome - row.totalExpenses;
            
            // Calcul de l'épargne cumulée
            cumulatedSavings += row.savings;
            row.cumulatedSavings = cumulatedSavings;
            
            // Calcul de l'investissement cumulé
            cumulatedInvestment += (row.investment || 0);
            row.cumulatedInvestment = cumulatedInvestment;
            
            // Calcul du portefeuille total
            row.totalPortfolio = cumulatedInvestment + 
                                (row.cumulatedGains || 0) + 
                                (row.peeLoreal || 0);
            
            // Calcul du ROI
            row.roi = cumulatedInvestment > 0 ? 
                      ((row.cumulatedGains || 0) / cumulatedInvestment * 100) : 0;
        });
    }
    
    /**
     * Recalcule les gains d'investissement avec intérêts composés
     */
    function recalculateGains() {
        const monthlyYieldRate = monthlyEstYield / 12 / 100;
        let cumulatedGains = 0;
        
        allData.forEach((row, index) => {
            const monthlyInvestment = row.investment || 0;
            let monthlyGain = 0;
            
            if (index === 0) {
                // Premier mois : gain sur la moitié de l'investissement
                monthlyGain = monthlyYieldRate * monthlyInvestment / 2;
            } else {
                // Mois suivants : gain sur le capital précédent + nouvel investissement
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
        
        showNotification('Gains recalculés avec succès', 'success');
    }
    
    // ========================================
    // GESTION DES PARAMÈTRES
    // ========================================
    
    /**
     * Met à jour le rendement mensuel estimé
     */
    function updateEstYield() {
        const input = document.getElementById('monthlyEstYield');
        if (!input) return;
        
        monthlyEstYield = parseFloat(input.value) || 0;
        updateEstYieldDisplay();
        localStorage.setItem('monthlyEstYield', monthlyEstYield);
        recalculateGains();
    }
    
    /**
     * Affiche le rendement mensuel calculé
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
        const input = document.getElementById('inflationRate');
        if (!input) return;
        
        inflationRate = parseFloat(input.value) || 2.5;
        localStorage.setItem('inflationRate', inflationRate);
        
        if (showInflation) {
            updateAllCharts();
        }
        
        showNotification('Taux d\'inflation mis à jour', 'info');
    }
    
    /**
     * Active/désactive les graphiques ajustés pour l'inflation
     */
    function toggleInflationCharts() {
        showInflation = !showInflation;
        const btn = document.getElementById('btnToggleInflation');
        const status = document.getElementById('inflationStatus');
        
        if (showInflation) {
            if (btn) {
                btn.textContent = 'Masquer l\'ajustement inflation';
                btn.classList.add('active');
            }
            if (status) {
                status.textContent = 'ACTIVÉ';
                status.style.color = COLORS.primaryViolet;
            }
        } else {
            if (btn) {
                btn.textContent = 'Afficher l\'ajustement inflation';
                btn.classList.remove('active');
            }
            if (status) {
                status.textContent = 'DÉSACTIVÉ';
                status.style.color = 'var(--text-tertiary)';
            }
        }
        
        updateAllCharts();
        showNotification(
            showInflation ? 'Ajustement inflation activé' : 'Ajustement inflation désactivé', 
            'info'
        );
    }
    
    /**
     * Ajuste une valeur pour l'inflation
     * @param {number} value - Valeur nominale
     * @param {number} monthIndex - Index du mois
     * @returns {number} Valeur réelle ajustée
     */
    function adjustForInflation(value, monthIndex) {
        const monthlyInflation = Math.pow(1 + inflationRate / 100, 1/12) - 1;
        return value / Math.pow(1 + monthlyInflation, monthIndex);
    }
    
    // ========================================
    // GESTION DE LA TIMELINE
    // ========================================
    
    /**
     * Ajoute des mois avant le premier mois
     * @param {number} count - Nombre de mois à ajouter
     */
    function addMonthsBefore(count) {
        if (allData.length === 0) {
            createDefaultData();
            return;
        }
        
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
            salary: DEFAULT_CONFIG.defaultSalary,
            misc: DEFAULT_CONFIG.defaultMisc,
            rent: DEFAULT_CONFIG.defaultRent,
            food: DEFAULT_CONFIG.defaultFood,
            fixCosts: DEFAULT_CONFIG.defaultFixCosts,
            others: DEFAULT_CONFIG.defaultOthers,
            loan: DEFAULT_CONFIG.defaultLoan,
            investment: DEFAULT_CONFIG.defaultInvestment,
            monthlyGain: 0,
            cumulatedGains: 0, 
            peeLoreal: 0
        }));
        
        allData = newRows.concat(allData);
        recalculateGains();
        currentMonthIndex = findCurrentMonthIndex();
        updateTotalMonthsDisplay();
        updateAllCharts();
        
        showNotification(`${count} mois ajoutés avant`, 'success');
    }
    
    /**
     * Ajoute des mois après le dernier mois
     * @param {number} count - Nombre de mois à ajouter
     */
    function addMonthsAfter(count) {
        if (allData.length === 0) {
            createDefaultData();
            return;
        }
        
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
            salary: DEFAULT_CONFIG.defaultSalary,
            misc: DEFAULT_CONFIG.defaultMisc,
            rent: DEFAULT_CONFIG.defaultRent,
            food: DEFAULT_CONFIG.defaultFood,
            fixCosts: DEFAULT_CONFIG.defaultFixCosts,
            others: DEFAULT_CONFIG.defaultOthers,
            loan: DEFAULT_CONFIG.defaultLoan,
            investment: DEFAULT_CONFIG.defaultInvestment,
            monthlyGain: 0,
            cumulatedGains: 0, 
            peeLoreal: 0
        }));
        
        allData = allData.concat(newRows);
        recalculateGains();
        updateTotalMonthsDisplay();
        updateAllCharts();
        
        showNotification(`${count} mois ajoutés après`, 'success');
    }
    
    /**
     * Supprime une ligne de données
     * @param {number} index - Index de la ligne à supprimer
     */
    function deleteRow(index) {
        if (allData.length <= 12) {
            showNotification('Impossible de supprimer ! Minimum 12 mois requis.', 'error');
            return;
        }
        
        if (confirm(`Supprimer le mois ${allData[index].month} ?`)) {
            allData.splice(index, 1);
            recalculateGains();
            currentMonthIndex = findCurrentMonthIndex();
            updateTotalMonthsDisplay();
            updateAllCharts();
            showNotification('Mois supprimé', 'success');
        }
    }
    
    /**
     * Met à jour l'affichage du nombre total de mois
     */
    function updateTotalMonthsDisplay() {
        const elem = document.getElementById('totalMonthsDisplay');
        if (elem) elem.textContent = allData.length;
    }
    
    // ========================================
    // SAUVEGARDE ET EXPORT
    // ========================================
    
    /**
     * Sauvegarde manuelle des données
     */
    function saveData() {
        try {
            calculateAll();
            localStorage.setItem('financialDataDynamic', JSON.stringify(allData));
            localStorage.setItem('monthlyEstYield', monthlyEstYield);
            localStorage.setItem('inflationRate', inflationRate);
            updateLastUpdateTime();
            showNotification('Données sauvegardées avec succès !', 'success');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            showNotification('Erreur lors de la sauvegarde', 'error');
        }
    }
    
    /**
     * Sauvegarde automatique (sans notification)
     */
    function autoSave() {
        try {
            calculateAll();
            localStorage.setItem('financialDataDynamic', JSON.stringify(allData));
            localStorage.setItem('monthlyEstYield', monthlyEstYield);
            localStorage.setItem('inflationRate', inflationRate);
            updateLastUpdateTime();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde automatique:', error);
        }
    }
    
    /**
     * Exporte les données en JSON
     */
    function exportToJSON() {
        try {
            const exportData = {
                version: '2.0',
                exportDate: new Date().toISOString(),
                monthlyEstYield: monthlyEstYield,
                inflationRate: inflationRate,
                data: allData
            };
            
            const json = JSON.stringify(exportData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `financial_dashboard_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            showNotification('Données exportées avec succès !', 'success');
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            showNotification('Erreur lors de l\'export', 'error');
        }
    }
    
    /**
     * Importe des données depuis un fichier JSON
     */
    function importFromJSON() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const imported = JSON.parse(event.target.result);
                    
                    // Validation des données
                    if (!imported.data || !Array.isArray(imported.data)) {
                        throw new Error('Format de données invalide');
                    }
                    
                    allData = imported.data;
                    
                    if (imported.monthlyEstYield) {
                        monthlyEstYield = imported.monthlyEstYield;
                        const yieldInput = document.getElementById('monthlyEstYield');
                        if (yieldInput) yieldInput.value = monthlyEstYield;
                        updateEstYieldDisplay();
                    }
                    
                    if (imported.inflationRate) {
                        inflationRate = imported.inflationRate;
                        const inflationInput = document.getElementById('inflationRate');
                        if (inflationInput) inflationInput.value = inflationRate;
                    }
                    
                    calculateAll();
                    currentMonthIndex = findCurrentMonthIndex();
                    renderTable();
                    saveData();
                    updateTotalMonthsDisplay();
                    updateAllCharts();
                    
                    showNotification('Données importées avec succès !', 'success');
                } catch (err) {
                    console.error('Erreur lors de l\'import:', err);
                    showNotification('Erreur lors de l\'import: ' + err.message, 'error');
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
        if (confirm('Réinitialiser toutes les données aux valeurs par défaut (300 mois) ?')) {
            localStorage.removeItem('financialDataDynamic');
            localStorage.removeItem('monthlyEstYield');
            localStorage.removeItem('inflationRate');
            
            monthlyEstYield = 8;
            inflationRate = 2.5;
            showInflation = false;
            
            const yieldInput = document.getElementById('monthlyEstYield');
            const inflationInput = document.getElementById('inflationRate');
            const inflationBtn = document.getElementById('btnToggleInflation');
            const inflationStatus = document.getElementById('inflationStatus');
            
            if (yieldInput) yieldInput.value = 8;
            if (inflationInput) inflationInput.value = 2.5;
            if (inflationBtn) {
                inflationBtn.textContent = 'Afficher l\'ajustement inflation';
                inflationBtn.classList.remove('active');
            }
            if (inflationStatus) {
                inflationStatus.textContent = 'DÉSACTIVÉ';
                inflationStatus.style.color = 'var(--text-tertiary)';
            }
            
            updateEstYieldDisplay();
            initData();
            renderTable();
            updateAllCharts();
            
            showNotification('Données réinitialisées !', 'info');
        }
    }
    
    // ========================================
    // AFFICHAGE DU TABLEAU
    // ========================================
    
    /**
     * Affiche le tableau de données
     */
    function renderTable() {
        const tbody = document.getElementById('dataTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        allData.forEach((row, index) => {
            const tr = document.createElement('tr');
            
            // Coloration de la ligne du mois actuel
            if (index === currentMonthIndex) {
                tr.classList.add('current-month');
                tr.style.background = 'rgba(74, 116, 243, 0.05)';
            }
            
            tr.innerHTML = `
                <td>${row.month}</td>
                <td><input type='number' step='0.01' value='${row.salary}' 
                    onchange='Dashboard.updateValue(${index}, "salary", this.value)'
                    aria-label='Salaire ${row.month}'></td>
                <td><input type='number' step='0.01' value='${row.misc}' 
                    onchange='Dashboard.updateValue(${index}, "misc", this.value)'
                    aria-label='Revenus divers ${row.month}'></td>
                <td class='calculated'>${formatCurrency(row.totalIncome)}</td>
                <td><input type='number' step='0.01' value='${row.rent}' 
                    onchange='Dashboard.updateValue(${index}, "rent", this.value)'
                    aria-label='Loyer ${row.month}'></td>
                <td><input type='number' step='0.01' value='${row.food}' 
                    onchange='Dashboard.updateValue(${index}, "food", this.value)'
                    aria-label='Alimentation ${row.month}'></td>
                <td><input type='number' step='0.01' value='${row.fixCosts}' 
                    onchange='Dashboard.updateValue(${index}, "fixCosts", this.value)'
                    aria-label='Coûts fixes ${row.month}'></td>
                <td><input type='number' step='0.01' value='${row.others}' 
                    onchange='Dashboard.updateValue(${index}, "others", this.value)'
                    aria-label='Autres dépenses ${row.month}'></td>
                <td><input type='number' step='0.01' value='${row.loan}' 
                    onchange='Dashboard.updateValue(${index}, "loan", this.value)'
                    aria-label='Prêts ${row.month}'></td>
                <td class='calculated'>${formatCurrency(row.totalExpenses)}</td>
                <td class='calculated' style='color: ${row.savings >= 0 ? COLORS.darkBlue : COLORS.primaryViolet};'>
                    ${formatCurrency(row.savings)}
                </td>
                <td><input type='number' step='0.01' value='${row.investment}' 
                    onchange='Dashboard.updateValue(${index}, "investment", this.value)'
                    aria-label='Investissement ${row.month}'></td>
                <td class='calculated' style='background: ${COLORS.veryLightBlue};'>
                    ${formatCurrency(row.monthlyGain, 2)}
                </td>
                <td class='calculated'>${formatCurrency(row.cumulatedGains)}</td>
                <td><input type='number' step='0.01' value='${row.peeLoreal}' 
                    onchange='Dashboard.updateValue(${index}, "peeLoreal", this.value)'
                    aria-label='PEE ${row.month}'></td>
                <td class='calculated'>${formatCurrency(row.cumulatedInvestment)}</td>
                <td class='calculated' style='font-weight: 700; color: ${COLORS.darkBlue};'>
                    ${formatCurrency(row.totalPortfolio)}
                </td>
                <td class='calculated' style='color: ${row.roi >= 0 ? COLORS.darkBlue : COLORS.primaryViolet};'>
                    ${row.roi.toFixed(2)}%
                </td>
                <td>
                    <button class='btn-delete' 
                        onclick='Dashboard.deleteRow(${index})'
                        aria-label='Supprimer ${row.month}'>
                        <i class='fas fa-trash'></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }
    
    /**
     * Formate un nombre en devise
     * @param {number} value - Valeur à formater
     * @param {number} decimals - Nombre de décimales
     * @returns {string} Valeur formatée
     */
    function formatCurrency(value, decimals = 0) {
        return value.toLocaleString('fr-FR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    
    /**
     * Met à jour une valeur du tableau
     * @param {number} index - Index de la ligne
     * @param {string} field - Nom du champ
     * @param {string|number} value - Nouvelle valeur
     */
    function updateValue(index, field, value) {
        allData[index][field] = parseFloat(value) || 0;
        
        if (field === 'investment') {
            recalculateGains();
        } else {
            calculateAll();
            renderTable();
            autoSave();
        }
    }
    
    // ========================================
    // ÉDITION EN MASSE
    // ========================================
    
    /**
     * Applique une modification en masse
     */
    function applyBulkEdit() {
        const category = document.getElementById('bulkCategory')?.value;
        const startMonth = document.getElementById('bulkStartMonth')?.value;
        const endMonth = document.getElementById('bulkEndMonth')?.value;
        const valueInput = document.getElementById('bulkValue')?.value;
        
        if (!category || !startMonth || !endMonth || !valueInput) {
            showNotification('Veuillez remplir tous les champs !', 'error');
            return;
        }
        
        const value = parseFloat(valueInput);
        if (isNaN(value)) {
            showNotification('Valeur invalide !', 'error');
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
        if (!field) {
            showNotification('Catégorie invalide !', 'error');
            return;
        }
        
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
            recalculateGains();
        } else {
            calculateAll();
            renderTable();
            autoSave();
        }
        
        showNotification(
            `${value} EUR appliqué à ${count} mois pour ${category}`, 
            'success'
        );
    }
    
    // ========================================
    // STATISTIQUES
    // ========================================
    
    /**
     * Met à jour les cartes de statistiques
     */
    function updateStats() {
        if (allData.length === 0) return;
        
        const currentRow = allData[currentMonthIndex];
        const monthName = currentRow.month;
        
        const html = `
            <div class='stat-card'>
                <h3><i class='fas fa-coins'></i> Revenus Mensuels</h3>
                <div class='value'>${formatCurrency(currentRow.totalIncome)} €</div>
                <div class='stat-subtitle'>${monthName}</div>
            </div>
            <div class='stat-card'>
                <h3><i class='fas fa-shopping-cart'></i> Dépenses Mensuelles</h3>
                <div class='value'>${formatCurrency(currentRow.totalExpenses)} €</div>
                <div class='stat-subtitle'>${monthName}</div>
            </div>
            <div class='stat-card ${currentRow.cumulatedSavings > 0 ? "positive" : "negative"}'>
                <h3><i class='fas fa-piggy-bank'></i> Épargne Totale</h3>
                <div class='value'>${formatCurrency(currentRow.cumulatedSavings)} €</div>
                <div class='stat-subtitle'>${monthName}</div>
            </div>
            <div class='stat-card positive'>
                <h3><i class='fas fa-chart-line'></i> Portefeuille Total</h3>
                <div class='value'>${formatCurrency(currentRow.totalPortfolio)} €</div>
                <div class='stat-subtitle'>${monthName}</div>
            </div>
            <div class='stat-card ${currentRow.roi > 0 ? 'positive' : currentRow.roi < 0 ? 'negative' : 'neutral'}'>
                <h3><i class='fas fa-percentage'></i> ROI</h3>
                <div class='value'>${currentRow.roi.toFixed(1)}%</div>
                <div class='stat-subtitle'>${monthName}</div>
            </div>
        `;
        
        const container = document.getElementById('statsContainer');
        if (container) container.innerHTML = html;
    }
    
    // ========================================
    // GRAPHIQUES - PALETTE BLEU/VIOLET
    // ========================================
    
    /**
     * Initialise les filtres de mois pour les graphiques
     */
    function initMonthFilters() {
        const filters = [
            'incomeMonthFilter',
            'expenseMonthFilter',
            'budgetMonthFilter'
        ];
        
        filters.forEach(filterId => {
            const select = document.getElementById(filterId);
            if (!select) return;
            
            select.innerHTML = '';
            
            allData.forEach((row, index) => {
                const option = new Option(row.month, index);
                if (index === currentMonthIndex) {
                    option.selected = true;
                }
                select.add(option);
            });
        });
    }
    
    /**
     * Détruit un graphique s'il existe
     * @param {string} chartKey - Clé du graphique
     */
    function destroyChart(chartKey) {
        if (chartInstances[chartKey]) {
            chartInstances[chartKey].destroy();
            chartInstances[chartKey] = null;
        }
    }
    
    /**
     * Graphique 1 : Évolution Revenus vs Dépenses
     */
    function createChart1() {
        const months = allData.map(d => d.month);
        const incomeValues = allData.map(d => d.totalIncome);
        const expenseValues = allData.map(d => d.totalExpenses);
        const savingsValues = allData.map(d => d.savings);
        
        destroyChart('chart1');
        
        chartInstances.chart1 = Highcharts.chart('chart1', {
            chart: { 
                type: 'line', 
                backgroundColor: 'transparent', 
                zoomType: 'x',
                height: 500
            },
            title: { text: null },
            xAxis: { 
                categories: months, 
                crosshair: true, 
                labels: { 
                    rotation: -45, 
                    style: { 
                        fontSize: '10px',
                        color: 'var(--text-secondary)'
                    } 
                } 
            },
            yAxis: { 
                title: { 
                    text: 'Montant (EUR)', 
                    style: { color: 'var(--text-primary)' } 
                },
                labels: {
                    style: { color: 'var(--text-secondary)' }
                },
                gridLineColor: 'var(--border-color)'
            },
            tooltip: { 
                shared: true, 
                valueDecimals: 0, 
                valueSuffix: ' €',
                backgroundColor: 'var(--background-primary)',
                borderColor: 'var(--border-color)',
                style: { color: 'var(--text-primary)' }
            },
            legend: {
                itemStyle: { color: 'var(--text-primary)' }
            },
            series: [
                { 
                    name: 'Revenus', 
                    data: incomeValues, 
                    color: COLORS.primaryBlue, 
                    lineWidth: 2 
                },
                { 
                    name: 'Dépenses', 
                    data: expenseValues, 
                    color: COLORS.primaryViolet, 
                    lineWidth: 2 
                },
                { 
                    name: 'Épargne Mensuelle', 
                    data: savingsValues, 
                    color: COLORS.darkBlue, 
                    type: 'area', 
                    fillColor: { 
                        linearGradient: [0, 0, 0, 300], 
                        stops: [
                            [0, 'rgba(38, 73, 178, 0.3)'], 
                            [1, 'rgba(38, 73, 178, 0.05)']
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
        
        destroyChart('chart2');
        
        chartInstances.chart2 = Highcharts.chart('chart2', {
            chart: { 
                type: 'pie', 
                backgroundColor: 'transparent',
                height: 400
            },
            title: { 
                text: `Revenus - ${row.month}`, 
                style: { 
                    color: 'var(--text-primary)', 
                    fontWeight: '600',
                    fontSize: '1rem'
                } 
            },
            tooltip: { 
                pointFormat: '<b>{point.name}</b>: {point.y:,.0f} € ({point.percentage:.1f}%)',
                backgroundColor: 'var(--background-primary)',
                borderColor: 'var(--border-color)',
                style: { color: 'var(--text-primary)' }
            },
            legend: {
                itemStyle: { color: 'var(--text-primary)' }
            },
            series: [{
                name: 'Montant',
                data: [
                    { name: 'Salaire', y: row.salary, color: COLORS.darkBlue },
                    { name: 'Divers', y: row.misc, color: COLORS.primaryBlue }
                ]
            }],
            plotOptions: {
                pie: {
                    innerSize: '50%',
                    dataLabels: {
                        format: '<b>{point.name}</b>: {point.y:,.0f} €',
                        style: { color: 'var(--text-primary)' }
                    },
                    borderWidth: 2,
                    borderColor: 'var(--border-color)'
                }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique 3 : Répartition des Dépenses
     */
    function updateChart3() {
        const monthIndex = parseInt(document.getElementById('expenseMonthFilter')?.value || 0);
        const row = allData[monthIndex];
        
        if (!row) return;
        
        destroyChart('chart3');
        
        chartInstances.chart3 = Highcharts.chart('chart3', {
            chart: { 
                type: 'pie', 
                backgroundColor: 'transparent',
                height: 400
            },
            title: { 
                text: `Dépenses - ${row.month}`, 
                style: { 
                    color: 'var(--text-primary)', 
                    fontWeight: '600',
                    fontSize: '1rem'
                } 
            },
            tooltip: { 
                pointFormat: '<b>{point.name}</b>: {point.y:,.0f} € ({point.percentage:.1f}%)',
                backgroundColor: 'var(--background-primary)',
                borderColor: 'var(--border-color)',
                style: { color: 'var(--text-primary)' }
            },
            legend: {
                itemStyle: { color: 'var(--text-primary)' }
            },
            series: [{
                name: 'Montant',
                data: [
                    { name: 'Loyer', y: row.rent, color: COLORS.darkViolet },
                    { name: 'Alimentation', y: row.food, color: COLORS.primaryViolet },
                    { name: 'Coûts Fixes', y: row.fixCosts, color: COLORS.lightViolet },
                    { name: 'Autres', y: row.others, color: COLORS.veryLightViolet },
                    { name: 'Prêts', y: row.loan, color: COLORS.mediumViolet }
                ]
            }],
            plotOptions: {
                pie: {
                    dataLabels: {
                        format: '<b>{point.name}</b>: {point.y:,.0f} €',
                        style: { color: 'var(--text-primary)' }
                    },
                    borderWidth: 2,
                    borderColor: 'var(--border-color)'
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
            name: 'Épargne Nominale',
            data: savingsData,
            color: COLORS.darkBlue,
            fillColor: {
                linearGradient: [0, 0, 0, 300],
                stops: [
                    [0, 'rgba(38, 73, 178, 0.5)'],
                    [1, 'rgba(38, 73, 178, 0.1)']
                ]
            },
            lineWidth: 2
        }];
        
        if (showInflation) {
            series.push({
                name: 'Épargne Réelle (Ajustée Inflation)',
                data: savingsDataReal,
                color: COLORS.lightViolet,
                dashStyle: 'Dash',
                fillColor: {
                    linearGradient: [0, 0, 0, 300],
                    stops: [
                        [0, 'rgba(157, 92, 230, 0.3)'],
                        [1, 'rgba(157, 92, 230, 0.05)']
                    ]
                },
                lineWidth: 2
            });
        }
        
        destroyChart('chart4');
        
        chartInstances.chart4 = Highcharts.chart('chart4', {
            chart: { 
                type: 'area', 
                backgroundColor: 'transparent',
                height: 500
            },
            title: { 
                text: showInflation ? 
                    `Taux d'inflation: ${inflationRate}% annuel` : null,
                style: { 
                    color: COLORS.lightViolet, 
                    fontSize: '0.9rem',
                    fontWeight: '500'
                }
            },
            xAxis: {
                categories: months,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { 
                        fontSize: '10px',
                        color: 'var(--text-secondary)'
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Épargne Cumulée (EUR)',
                    style: { color: 'var(--text-primary)' }
                },
                labels: {
                    style: { color: 'var(--text-secondary)' }
                },
                gridLineColor: 'var(--border-color)'
            },
            tooltip: {
                shared: true,
                valueDecimals: 0,
                valueSuffix: ' €',
                backgroundColor: 'var(--background-primary)',
                borderColor: 'var(--border-color)',
                style: { color: 'var(--text-primary)' }
            },
            legend: {
                itemStyle: { color: 'var(--text-primary)' }
            },
            series: series,
            plotOptions: {
                area: { marker: { enabled: false } }
            },
            credits: { enabled: false }
        });
    }
    
    /**
     * Graphique 5 : Portefeuille d'Investissement
     */
    function createChart5() {
        const months = allData.map(d => d.month);
        const cumInv = allData.map(d => d.cumulatedInvestment);
        const gains = allData.map(d => d.cumulatedGains);
        const pee = allData.map(d => d.peeLoreal);
        const portfolio = allData.map(d => d.totalPortfolio);
        
        const portfolioReal = showInflation ? 
            allData.map((d, i) => adjustForInflation(d.totalPortfolio, i)) : [];
        const cumInvReal = showInflation ? 
            allData.map((d, i) => adjustForInflation(d.cumulatedInvestment, i)) : [];
        
        const series = [
            {
                name: 'Investissement Cumulé',
                data: cumInv,
                color: COLORS.lightBlue,
                lineWidth: 2
            },
            {
                name: 'Gains Cumulés',
                data: gains,
                color: COLORS.mediumViolet,
                dashStyle: 'ShortDot',
                lineWidth: 2
            },
            {
                name: "PEE L'Oréal",
                data: pee,
                color: COLORS.lightViolet,
                lineWidth: 2
            },
            {
                name: 'Portefeuille Total',
                data: portfolio,
                color: COLORS.darkBlue,
                lineWidth: 3
            }
        ];
        
        if (showInflation) {
            series.push({
                name: 'Portefeuille (Réel)',
                data: portfolioReal,
                color: COLORS.accent,
                dashStyle: 'Dash',
                lineWidth: 3
            });
            series.push({
                name: 'Investissement (Réel)',
                data: cumInvReal,
                color: COLORS.veryLightBlue,
                dashStyle: 'Dash',
                lineWidth: 2
            });
        }
        
        destroyChart('chart5');
        
        chartInstances.chart5 = Highcharts.chart('chart5', {
            chart: { 
                type: 'line', 
                backgroundColor: 'transparent',
                height: 500
            },
            title: {
                text: showInflation ? 
                    `Taux d'inflation: ${inflationRate}% annuel` : null,
                style: {
                    color: COLORS.lightViolet,
                    fontSize: '0.9rem',
                    fontWeight: '500'
                }
            },
            xAxis: {
                categories: months,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { 
                        fontSize: '10px',
                        color: 'var(--text-secondary)'
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'Valeur (EUR)',
                    style: { color: 'var(--text-primary)' }
                },
                labels: {
                    style: { color: 'var(--text-secondary)' }
                },
                gridLineColor: 'var(--border-color)'
            },
            tooltip: {
                shared: true,
                valueDecimals: 0,
                valueSuffix: ' €',
                backgroundColor: 'var(--background-primary)',
                borderColor: 'var(--border-color)',
                style: { color: 'var(--text-primary)' }
            },
            legend: {
                itemStyle: { color: 'var(--text-primary)' }
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
        
        destroyChart('chart6');
        
        chartInstances.chart6 = Highcharts.chart('chart6', {
            chart: { 
                type: 'area', 
                backgroundColor: 'transparent',
                height: 500
            },
            title: { text: null },
            xAxis: {
                categories: months,
                crosshair: true,
                labels: {
                    rotation: -45,
                    style: { 
                        fontSize: '10px',
                        color: 'var(--text-secondary)'
                    }
                }
            },
            yAxis: {
                title: {
                    text: 'ROI (%)',
                    style: { color: 'var(--text-primary)' }
                },
                labels: {
                    style: { color: 'var(--text-secondary)' }
                },
                gridLineColor: 'var(--border-color)',
                plotLines: [{
                    value: 0,
                    color: COLORS.primaryViolet,
                    width: 2,
                    dashStyle: 'Dash'
                }]
            },
            tooltip: {
                valueDecimals: 2,
                valueSuffix: '%',
                backgroundColor: 'var(--background-primary)',
                borderColor: 'var(--border-color)',
                style: { color: 'var(--text-primary)' }
            },
            legend: {
                itemStyle: { color: 'var(--text-primary)' }
            },
            series: [{
                name: 'ROI',
                data: roi,
                color: COLORS.primaryBlue,
                fillColor: {
                    linearGradient: [0, 0, 0, 300],
                    stops: [
                        [0, 'rgba(74, 116, 243, 0.4)'],
                        [1, 'rgba(74, 116, 243, 0.05)']
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
     * Graphique 7 : Allocation Budgétaire (50/30/20)
     */
    function updateChart7() {
        const monthIndex = parseInt(document.getElementById('budgetMonthFilter')?.value || 0);
        const row = allData[monthIndex];
        
        if (!row) return;
        
        const needsAmount = row.rent + row.food + row.fixCosts + row.loan;
        const wantsAmount = row.others;
        const savingsAmount = row.investment + row.savings;
        const total = row.totalIncome;
        
        const needsPercent = total > 0 ? (needsAmount / total * 100) : 0;
        const wantsPercent = total > 0 ? (wantsAmount / total * 100) : 0;
        const savingsPercent = total > 0 ? (savingsAmount / total * 100) : 0;
        
        destroyChart('chart7');
        
        chartInstances.chart7 = Highcharts.chart('chart7', {
            chart: { 
                type: 'pie', 
                backgroundColor: 'transparent',
                height: 400
            },
            title: {
                text: `Allocation Budgétaire - ${row.month} - Total: ${formatCurrency(total)} €`,
                style: {
                    color: 'var(--text-primary)',
                    fontWeight: '600',
                    fontSize: '1rem'
                }
            },
            tooltip: {
                useHTML: true,
                pointFormat: '<b>{point.name}</b><br/>Montant: <b>{point.amount:,.0f} €</b><br/>Pourcentage: <b>{point.percentage:.1f}%</b>',
                backgroundColor: 'var(--background-primary)',
                borderColor: 'var(--border-color)',
                style: { color: 'var(--text-primary)' }
            },
            legend: {
                itemStyle: { color: 'var(--text-primary)' }
            },
            plotOptions: {
                pie: {
                    innerSize: '60%',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b><br/>{point.percentage:.1f}%<br/>{point.amount:,.0f} €',
                        style: { color: 'var(--text-primary)' }
                    },
                    borderWidth: 2,
                    borderColor: 'var(--border-color)'
                }
            },
            series: [{
                name: 'Budget',
                data: [
                    {
                        name: 'Besoins',
                        y: needsPercent,
                        amount: needsAmount,
                        color: COLORS.darkViolet
                    },
                    {
                        name: 'Envies',
                        y: wantsPercent,
                        amount: wantsAmount,
                        color: COLORS.lightViolet
                    },
                    {
                        name: 'Épargne',
                        y: savingsPercent,
                        amount: savingsAmount,
                        color: COLORS.darkBlue
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
        try {
            updateStats();
            initMonthFilters();
            createChart1();
            updateChart2();
            updateChart3();
            createChart4();
            createChart5();
            createChart6();
            updateChart7();
        } catch (error) {
            console.error('Erreur lors de la mise à jour des graphiques:', error);
        }
    }
    
    // ========================================
    // NOTIFICATIONS
    // ========================================
    
    /**
     * Affiche une notification
     * @param {string} message - Message à afficher
     * @param {string} type - Type de notification (success, error, info, warning)
     */
    function showNotification(message, type = 'info') {
        // Utilise le système de notification du common.js si disponible
        if (window.FinanceDashboard && window.FinanceDashboard.showNotification) {
            window.FinanceDashboard.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }
    
    // ========================================
    // API PUBLIQUE
    // ========================================
    
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

// ========================================
// INITIALISATION AU CHARGEMENT
// ========================================

window.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});

// Export pour utilisation dans d'autres modules si nécessaire
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Dashboard;
}