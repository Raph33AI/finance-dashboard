/* ════════════════════════════════════════════════════════════════
   ADMIN BUSINESS PLAN - VERSION FIRESTORE V5.0
   AlphaVault AI - Fully Dynamic with Cloud Persistence
   ════════════════════════════════════════════════════════════════ */

// ════════════════════════════════════════════════════════════════
// FIREBASE CONFIGURATION & FIRESTORE INTEGRATION
// ════════════════════════════════════════════════════════════════

// ⚡ VÉRIFICATION FIREBASE
if (typeof firebase === 'undefined' || !firebase.auth || !firebase.firestore) {
    console.error('❌ Firebase not loaded! Please include Firebase SDK in HTML.');
} else {
    console.log('✅ Firebase SDK loaded successfully');
}

// ⚡ UTILISER LES VARIABLES FIREBASE DÉJÀ DÉCLARÉES DANS firebase-config.js
// ✅ NE PAS REDÉCLARER db, auth, app (ils existent déjà via window.firebaseDb, etc.)

// Variables spécifiques au Business Plan (nouvelles)
let currentUserId = null;
let businessPlanDocId = null;
let autoSaveTimeout = null;

const isMobile = window.innerWidth <= 768;
const isSmallMobile = window.innerWidth <= 480;

let activeScenarios = ['base'];
let savedScenarios = {};

let chartInstances = {
    marketGrowth: null,
    revenue: null,
    profitability: null,
    cashFlow: null,
    userGrowth: null,
    marketShare: null,
    riskMatrix: null,
    scenarioComparison: null,
    scenarioMetrics: null,
    scenarioProfitability: null,
    scenarioUsers: null,
    scenarioLTV: null,
    scenarioBreakdown: null
};

console.log('📱 Device Detection:', { width: window.innerWidth, isMobile, isSmallMobile });

// ⚡ INITIALISATION FIRESTORE
function initializeFirestore() {
    try {
        // ✅ Utiliser les références Firebase déjà initialisées
        const db = window.firebaseDb || firebase.firestore();
        const auth = window.firebaseAuth || firebase.auth();
        
        if (!db || !auth) {
            console.error('❌ Firebase DB or Auth not available');
            return;
        }
        
        console.log('✅ Using existing Firebase instances');
        
        // Écouter les changements d'authentification
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUserId = user.uid;
                console.log('✅ User authenticated:', user.email);
                
                // Charger les données du business plan
                loadBusinessPlanFromFirestore();
            } else {
                console.warn('⚠ No user authenticated - using default data');
                currentUserId = null;
                businessPlanDocId = null;
            }
        });
        
        console.log('✅ Firestore initialized for Business Plan');
    } catch (error) {
        console.error('❌ Firestore initialization error:', error);
    }
}

// ⚡ CHARGER LES DONNÉES DEPUIS FIRESTORE
async function loadBusinessPlanFromFirestore() {
    if (!currentUserId) {
        console.warn('⚠ Cannot load data: No user authenticated');
        return;
    }
    
    // ✅ Utiliser la référence Firestore existante
    const db = window.firebaseDb || firebase.firestore();
    
    if (!db) {
        console.error('❌ Firestore not available');
        return;
    }
    
    try {
        console.log('📥 Loading business plan from Firestore...');
        
        const docRef = db.collection('businessPlans').doc(currentUserId);
        const doc = await docRef.get();
        
        if (doc.exists) {
            const data = doc.data();
            businessPlanDocId = currentUserId;
            
            // Merger les données chargées avec FINANCIAL_DATA
            if (data.projections) {
                Object.assign(FINANCIAL_DATA.projections, data.projections);
            }
            if (data.market) {
                Object.assign(FINANCIAL_DATA.market, data.market);
            }
            if (data.cashFlow) {
                Object.assign(FINANCIAL_DATA.cashFlow, data.cashFlow);
            }
            if (data.marketShare) {
                Object.assign(FINANCIAL_DATA.marketShare, data.marketShare);
            }
            if (data.valuation) {
                Object.assign(FINANCIAL_DATA.valuation, data.valuation); // ✅ AJOUT
            }
            
            console.log('✅ Business plan loaded successfully');
            
            // Re-render tout
            renderFinancialProjectionsTable();
            renderMetricsTable();
            updateAllCharts();
            
        } else {
            console.log('📝 No existing business plan - creating new one');
            businessPlanDocId = currentUserId;
            
            // Sauvegarder les données par défaut
            await saveBusinessPlanToFirestore();
        }
        
    } catch (error) {
        console.error('❌ Error loading business plan:', error);
    }
}

// ⚡ SAUVEGARDER LES DONNÉES DANS FIRESTORE
async function saveBusinessPlanToFirestore() {
    if (!currentUserId) {
        console.warn('⚠ Cannot save: No user authenticated');
        return;
    }
    
    // ✅ Utiliser la référence Firestore existante
    const db = window.firebaseDb || firebase.firestore();
    
    if (!db) {
        console.error('❌ Firestore not available');
        return;
    }
    
    try {
        const docRef = db.collection('businessPlans').doc(currentUserId);
        
        const dataToSave = {
            projections: FINANCIAL_DATA.projections,
            market: FINANCIAL_DATA.market,
            cashFlow: FINANCIAL_DATA.cashFlow,
            marketShare: FINANCIAL_DATA.marketShare,
            valuation: FINANCIAL_DATA.valuation,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            userId: currentUserId
        };
        
        await docRef.set(dataToSave, { merge: true });
        
        console.log('💾 Business plan saved to Firestore');
        
        // Afficher une notification
        showSaveNotification();
        
    } catch (error) {
        console.error('❌ Error saving business plan:', error);
        showErrorNotification('Failed to save data: ' + error.message);
    }
}

// ⚡ AUTO-SAVE avec debounce (2 secondes)
function triggerAutoSave() {
    // Annuler le timeout précédent
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }
    
    // Lancer un nouveau timeout
    autoSaveTimeout = setTimeout(() => {
        saveBusinessPlanToFirestore();
    }, 2000);
    
    console.log('⏱ Auto-save scheduled in 2 seconds...');
}

// ⚡ NOTIFICATIONS VISUELLES
function showSaveNotification() {
    const notification = document.createElement('div');
    notification.className = 'save-notification success';
    notification.innerHTML = '<i class="fas fa-check-circle"></i> Saved to Cloud';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'save-notification error';
    notification.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ════════════════════════════════════════════════════════════════
// CONFIGURATION GLOBALE & DONNÉES PAR DÉFAUT
// ════════════════════════════════════════════════════════════════

// ⚡ STRUCTURE DE DONNÉES FINANCIÈRES (100% éditable + Firestore sync)
const FINANCIAL_DATA = {
    projections: {
        year1: {
            users: { total: 5000, paid: 1500, pro: 900, platinum: 600 },
            pricing: { pro: 10, platinum: 20 },
            revenue: { subscription: 252, affiliate: 25, total: 277 },
            expenses: { salaries: 120, marketing: 40, infrastructure: 15, operations: 10, total: 185 },
            metrics: { mrr: 21, arr: 252, arpu: 14, ltv: 280, cac: 25, churn: 5, ebitda: 92, ebitdaMargin: 33 }
        },
        year2: {
            users: { total: 15000, paid: 4500, pro: 2700, platinum: 1800 },
            pricing: { pro: 10, platinum: 20 },
            revenue: { subscription: 756, affiliate: 90, total: 846 },
            expenses: { salaries: 240, marketing: 120, infrastructure: 45, operations: 40, total: 445 },
            metrics: { mrr: 63, arr: 756, arpu: 14, ltv: 280, cac: 25, churn: 5, ebitda: 401, ebitdaMargin: 47 }
        },
        year3: {
            users: { total: 35000, paid: 10500, pro: 6300, platinum: 4200 },
            pricing: { pro: 10, platinum: 20 },
            revenue: { subscription: 1760, affiliate: 220, total: 1980 },
            expenses: { salaries: 400, marketing: 280, infrastructure: 100, operations: 100, total: 880 },
            metrics: { mrr: 147, arr: 1760, arpu: 14, ltv: 280, cac: 25, churn: 5, ebitda: 1100, ebitdaMargin: 56 }
        },
        year4: {
            users: { total: 65000, paid: 19500, pro: 11700, platinum: 7800 },
            pricing: { pro: 10, platinum: 20 },
            revenue: { subscription: 3280, affiliate: 410, total: 3690 },
            expenses: { salaries: 640, marketing: 520, infrastructure: 180, operations: 150, total: 1490 },
            metrics: { mrr: 273, arr: 3280, arpu: 14, ltv: 280, cac: 25, churn: 5, ebitda: 2200, ebitdaMargin: 60 }
        },
        year5: {
            users: { total: 100000, paid: 30000, pro: 18000, platinum: 12000 },
            pricing: { pro: 10, platinum: 20 },
            revenue: { subscription: 5040, affiliate: 630, total: 5670 },
            expenses: { salaries: 960, marketing: 800, infrastructure: 320, operations: 290, total: 2370 },
            metrics: { mrr: 420, arr: 5040, arpu: 14, ltv: 280, cac: 25, churn: 5, ebitda: 3300, ebitdaMargin: 58 }
        }
    },
    market: {
        tam: [12.5, 14.8, 17.5, 20.7, 24.5, 29.0],
        sam: [3.2, 3.8, 4.5, 5.3, 6.3, 7.5],
        som: [0.08, 0.12, 0.22, 0.35, 0.50, 0.75]
    },
    cashFlow: {
        operating: [75, 350, 980, 1950, 2950],
        free: [50, 300, 880, 1850, 2850]
    },
    marketShare: {
        alphavault: 5,
        bloomberg: 25,
        yahoo: 15,
        tradingview: 20,
        others: 35
    }
};

// ⚡ SCÉNARIOS DE SIMULATION
const SCENARIOS = {
    conservative: {
        name: 'Conservative',
        icon: 'fa-turtle',
        color: '#f59e0b',
        params: {
            totalUsers: 3000,
            conversionRate: 20,
            proSplit: 60,
            growthRate: 150,
            cac: 35,
            churnRate: 7,
            affiliateRevShare: 10,
            grossMargin: 85
        }
    },
    base: {
        name: 'Base Case',
        icon: 'fa-balance-scale',
        color: '#3b82f6',
        params: {
            totalUsers: 5000,
            conversionRate: 30,
            proSplit: 60,
            growthRate: 200,
            cac: 25,
            churnRate: 5,
            affiliateRevShare: 10,
            grossMargin: 85
        }
    },
    aggressive: {
        name: 'Aggressive Growth',
        icon: 'fa-rocket',
        color: '#10b981',
        params: {
            totalUsers: 10000,
            conversionRate: 40,
            proSplit: 50,
            growthRate: 300,
            cac: 20,
            churnRate: 4,
            affiliateRevShare: 12,
            grossMargin: 87
        }
    }
};

// ⚡ TERMES FINANCIERS
const financialTerms = {
    'ARR': {
        title: 'Annual Recurring Revenue (ARR)',
        icon: 'fa-sync-alt',
        description: 'ARR represents the predictable, recurring revenue a company expects to receive on an annual basis from its subscription-based products or services.',
        formula: 'ARR = MRR × 12',
        example: 'If your MRR is $21,000, then ARR = $21,000 × 12 = $252,000'
    },
    'MRR': {
        title: 'Monthly Recurring Revenue (MRR)',
        icon: 'fa-calendar-alt',
        description: 'MRR is the predictable monthly revenue generated from all active subscriptions.',
        formula: 'MRR = (Pro Users × $10) + (Platinum Users × $20)',
        example: 'With 900 Pro and 600 Platinum users: MRR = (900 × $10) + (600 × $20) = $21,000'
    },
    'LTV': {
        title: 'Customer Lifetime Value (LTV)',
        icon: 'fa-chart-line',
        description: 'LTV predicts the total revenue a business can expect from a single customer account.',
        formula: 'LTV = ARPU × Customer Lifespan',
        example: 'With $14 ARPU and 20-month lifespan: LTV = $14 × 20 = $280'
    },
    'CAC': {
        title: 'Customer Acquisition Cost (CAC)',
        icon: 'fa-funnel-dollar',
        description: 'CAC is the total cost of acquiring a new customer.',
        formula: 'CAC = Total Marketing & Sales Costs / Number of New Customers',
        example: 'If you spend $5,000 and acquire 200 customers: CAC = $5,000 / 200 = $25'
    },
    'EBITDA': {
        title: 'Earnings Before Interest, Taxes, Depreciation & Amortization',
        icon: 'fa-piggy-bank',
        description: 'EBITDA measures operating performance from core operations.',
        formula: 'EBITDA = Total Revenue - Operating Expenses',
        example: 'With $277K revenue and $185K expenses: EBITDA = $92K'
    },
    'CHURN': {
        title: 'Churn Rate',
        icon: 'fa-user-times',
        description: 'Churn rate measures the percentage of customers who cancel subscriptions.',
        formula: 'Churn Rate = (Customers Lost / Total Customers) × 100',
        example: 'If 50 out of 1,000 cancel: Churn = (50/1000) × 100 = 5%'
    },
    'ARPU': {
        title: 'Average Revenue Per User (ARPU)',
        icon: 'fa-user-tag',
        description: 'ARPU measures average revenue per user/subscriber.',
        formula: 'ARPU = Total Revenue / Total Users',
        example: 'With 60% Pro ($10) and 40% Platinum ($20): ARPU = $14'
    },
    'TAM': {
        title: 'Total Addressable Market (TAM)',
        icon: 'fa-globe',
        description: 'TAM represents total revenue opportunity at 100% market share.',
        formula: 'TAM = Potential Customers × Annual Revenue Per Customer',
        example: 'Global retail investment analytics market: $12.5B (2024)'
    },
    'SAM': {
        title: 'Serviceable Available Market (SAM)',
        icon: 'fa-crosshairs',
        description: 'SAM is the portion of TAM that your product can actually serve.',
        formula: 'SAM = TAM × Market Segment %',
        example: 'English-speaking retail investors: $12.5B × 25% = $3.2B'
    },
    'SOM': {
        title: 'Serviceable Obtainable Market (SOM)',
        icon: 'fa-bullseye',
        description: 'SOM is the realistic portion of SAM within 3-5 years.',
        formula: 'SOM = SAM × Realistic Market Share %',
        example: '5-year target (5% of SAM): $3.2B × 5% = $160M'
    },
    'PAYBACK': {
        title: 'Payback Period',
        icon: 'fa-hourglass-half',
        description: 'Time to recover CAC from customer revenue.',
        formula: 'Payback = CAC / (ARPU × Gross Margin)',
        example: 'With $25 CAC, $14 ARPU, 85% margin: Payback = 2.1 months'
    },
    'GROSS_MARGIN': {
        title: 'Gross Margin',
        icon: 'fa-percentage',
        description: 'Percentage of revenue after direct costs.',
        formula: 'Gross Margin = (Revenue - COGS) / Revenue × 100',
        example: 'SaaS companies: 70-90% gross margins'
    }
};

// ════════════════════════════════════════════════════════════════
// UTILITAIRES DE FORMATAGE
// ════════════════════════════════════════════════════════════════

function formatCurrency(value, decimals = 0) {
    const absValue = Math.abs(value);
    let formatted = '';
    
    if (absValue >= 1000000000) {
        formatted = '$' + (value / 1000000000).toFixed(decimals) + 'B';
    } else if (absValue >= 1000000) {
        formatted = '$' + (value / 1000000).toFixed(decimals) + 'M';
    } else if (absValue >= 1000) {
        formatted = '$' + (value / 1000).toFixed(decimals) + 'K';
    } else {
        formatted = '$' + value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    
    return formatted;
}

function formatNumber(value, decimals = 0) {
    const absValue = Math.abs(value);
    
    if (absValue >= 1000000000) {
        return (value / 1000000000).toFixed(decimals) + 'B';
    } else if (absValue >= 1000000) {
        return (value / 1000000).toFixed(decimals) + 'M';
    } else if (absValue >= 1000) {
        return (value / 1000).toFixed(decimals) + 'K';
    } else {
        return value.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
}

function formatPercentage(value, decimals = 1) {
    return value.toFixed(decimals) + '%';
}

function parseEditableValue(str) {
    if (typeof str === 'number') return str;
    
    str = str.toString().trim().replace(/[\$,\s%]/g, '');
    
    let multiplier = 1;
    const lastChar = str.slice(-1).toUpperCase();
    
    if (lastChar === 'B') {
        multiplier = 1000000000;
        str = str.slice(0, -1);
    } else if (lastChar === 'M') {
        multiplier = 1000000;
        str = str.slice(0, -1);
    } else if (lastChar === 'K') {
        multiplier = 1000;
        str = str.slice(0, -1);
    }
    
    const parsed = parseFloat(str) * multiplier;
    return isNaN(parsed) ? 0 : parsed;
}

console.log('✅ Configuration & Firebase Integration Loaded');

// ════════════════════════════════════════════════════════════════
// FINANCIAL PROJECTIONS - TABLEAUX ÉDITABLES
// ════════════════════════════════════════════════════════════════

function initializeFinancialProjections() {
    console.log('📊 Initializing editable financial projections...');
    
    renderFinancialProjectionsTable();
    renderRevenueBreakdownTable();
    renderExpensesBreakdownTable();
    renderMetricsTable();
    updateProjectionSummaryCards();
    renderUnitEconomics();
    
    console.log('✅ Financial projections initialized');
}

function renderFinancialProjectionsTable() {
    const container = document.getElementById('financialProjectionsTable');
    if (!container) return;
    
    const years = ['year1', 'year2', 'year3', 'year4', 'year5'];
    
    let html = `
        <div class="responsive-table-wrapper">
            <table class="financial-table editable-table">
                <thead>
                    <tr>
                        <th class="sticky-col">Metric</th>
                        <th>Year 1</th>
                        <th>Year 2</th>
                        <th>Year 3</th>
                        <th>Year 4</th>
                        <th>Year 5</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="section-header">
                        <td colspan="6"><i class="fas fa-users"></i> User Metrics</td>
                    </tr>
                    <tr>
                        <td class="sticky-col">Total Users</td>
                        ${years.map(y => `<td class="editable" contenteditable="true" data-year="${y}" data-field="users.total" data-type="number">${formatNumber(FINANCIAL_DATA.projections[y].users.total)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col">Paid Users</td>
                        ${years.map(y => `<td class="calculated">${formatNumber(FINANCIAL_DATA.projections[y].users.paid)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col">Pro Users</td>
                        ${years.map(y => `<td class="calculated">${formatNumber(FINANCIAL_DATA.projections[y].users.pro)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col">Platinum Users</td>
                        ${years.map(y => `<td class="calculated">${formatNumber(FINANCIAL_DATA.projections[y].users.platinum)}</td>`).join('')}
                    </tr>
                    
                    <tr class="section-header">
                        <td colspan="6"><i class="fas fa-dollar-sign"></i> Revenue ($K)</td>
                    </tr>
                    <tr>
                        <td class="sticky-col">Subscription Revenue</td>
                        ${years.map(y => `<td class="calculated highlight">${formatCurrency(FINANCIAL_DATA.projections[y].revenue.subscription * 1000)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col">Affiliate Revenue</td>
                        ${years.map(y => `<td class="calculated">${formatCurrency(FINANCIAL_DATA.projections[y].revenue.affiliate * 1000)}</td>`).join('')}
                    </tr>
                    <tr class="total-row">
                        <td class="sticky-col"><strong>Total Revenue</strong></td>
                        ${years.map(y => `<td class="calculated"><strong>${formatCurrency(FINANCIAL_DATA.projections[y].revenue.total * 1000)}</strong></td>`).join('')}
                    </tr>
                    
                    <tr class="section-header">
                        <td colspan="6"><i class="fas fa-receipt"></i> Expenses ($K)</td>
                    </tr>
                    <tr>
                        <td class="sticky-col">Salaries & Wages</td>
                        ${years.map(y => `<td class="editable" contenteditable="true" data-year="${y}" data-field="expenses.salaries" data-type="currency">${formatCurrency(FINANCIAL_DATA.projections[y].expenses.salaries * 1000)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col">Marketing & Sales</td>
                        ${years.map(y => `<td class="editable" contenteditable="true" data-year="${y}" data-field="expenses.marketing" data-type="currency">${formatCurrency(FINANCIAL_DATA.projections[y].expenses.marketing * 1000)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col">Infrastructure & Tech</td>
                        ${years.map(y => `<td class="editable" contenteditable="true" data-year="${y}" data-field="expenses.infrastructure" data-type="currency">${formatCurrency(FINANCIAL_DATA.projections[y].expenses.infrastructure * 1000)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col">Operations</td>
                        ${years.map(y => `<td class="editable" contenteditable="true" data-year="${y}" data-field="expenses.operations" data-type="currency">${formatCurrency(FINANCIAL_DATA.projections[y].expenses.operations * 1000)}</td>`).join('')}
                    </tr>
                    <tr class="total-row">
                        <td class="sticky-col"><strong>Total Expenses</strong></td>
                        ${years.map(y => `<td class="calculated"><strong>${formatCurrency(FINANCIAL_DATA.projections[y].expenses.total * 1000)}</strong></td>`).join('')}
                    </tr>
                    
                    <tr class="section-header">
                        <td colspan="6"><i class="fas fa-chart-line"></i> Profitability</td>
                    </tr>
                    <tr class="highlight-row">
                        <td class="sticky-col"><strong>EBITDA ($K)</strong></td>
                        ${years.map(y => `<td class="calculated highlight"><strong>${formatCurrency(FINANCIAL_DATA.projections[y].metrics.ebitda * 1000)}</strong></td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col">EBITDA Margin (%)</td>
                        ${years.map(y => `<td class="calculated">${formatPercentage(FINANCIAL_DATA.projections[y].metrics.ebitdaMargin)}</td>`).join('')}
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="table-actions">
            <button class="bp-btn bp-btn-secondary" onclick="resetFinancialData()">
                <i class="fas fa-undo"></i> Reset to Default
            </button>
            <button class="bp-btn bp-btn-primary" onclick="exportFinancialData()">
                <i class="fas fa-download"></i> Export Data (JSON)
            </button>
            <button class="bp-btn bp-btn-success" onclick="saveBusinessPlanToFirestore()">
                <i class="fas fa-cloud-upload-alt"></i> Save to Cloud
            </button>
        </div>
    `;
    
    container.innerHTML = html;
    attachEditableListeners();
}

function attachEditableListeners() {
    const editableCells = document.querySelectorAll('.editable[contenteditable="true"]');
    
    editableCells.forEach(cell => {
        cell.addEventListener('focus', function() {
            this.dataset.original = this.textContent;
            this.classList.add('editing');
            
            const range = document.createRange();
            range.selectNodeContents(this);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        });
        
        cell.addEventListener('blur', function() {
            this.classList.remove('editing');
            
            const newValueRaw = this.textContent.trim();
            const newValue = parseEditableValue(newValueRaw);
            
            const year = this.dataset.year;
            const field = this.dataset.field;
            const dataType = this.dataset.type;
            
            const originalValue = parseEditableValue(this.dataset.original);
            if (Math.abs(newValue - originalValue) < 0.01) {
                console.log('🔄 No change detected, skipping update');
                
                if (dataType === 'currency') {
                    this.textContent = formatCurrency(newValue);
                } else {
                    this.textContent = formatNumber(newValue);
                }
                return;
            }
            
            console.log(`✏ Updating ${year}.${field}: ${originalValue} → ${newValue}`);
            
            if (field.includes('expenses')) {
                updateFinancialDataField(year, field, newValue / 1000);
            } else {
                updateFinancialDataField(year, field, newValue);
            }
            
            if (dataType === 'currency') {
                this.textContent = formatCurrency(newValue);
            } else {
                this.textContent = formatNumber(newValue);
            }
            
            recalculateFinancialProjections();
            triggerAutoSave();
        });
        
        cell.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                this.textContent = this.dataset.original;
                this.blur();
            }
        });
        
        cell.addEventListener('paste', function(e) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    });
    
    console.log(`✅ Attached listeners to ${editableCells.length} editable cells`);
}

function updateFinancialDataField(year, field, value) {
    const keys = field.split('.');
    let ref = FINANCIAL_DATA.projections[year];
    
    for (let i = 0; i < keys.length - 1; i++) {
        ref = ref[keys[i]];
    }
    
    ref[keys[keys.length - 1]] = value;
    console.log(`✏ Updated ${year}.${field} = ${value}`);
}

function recalculateFinancialProjections() {
    console.log('🔄 Recalculating all financial projections...');
    
    const years = ['year1', 'year2', 'year3', 'year4', 'year5'];
    
    years.forEach(year => {
        const data = FINANCIAL_DATA.projections[year];
        
        data.users.paid = Math.round(data.users.total * 0.30);
        data.users.pro = Math.round(data.users.paid * 0.60);
        data.users.platinum = data.users.paid - data.users.pro;
        
        const mrr = (data.users.pro * data.pricing.pro) + (data.users.platinum * data.pricing.platinum);
        data.metrics.mrr = mrr / 1000;
        data.revenue.subscription = (mrr * 12) / 1000;
        data.revenue.affiliate = data.revenue.subscription * 0.10;
        data.revenue.total = data.revenue.subscription + data.revenue.affiliate;
        
        data.expenses.total = data.expenses.salaries + data.expenses.marketing + data.expenses.infrastructure + data.expenses.operations;
        
        data.metrics.ebitda = data.revenue.total - data.expenses.total;
        data.metrics.ebitdaMargin = data.revenue.total > 0 ? (data.metrics.ebitda / data.revenue.total) * 100 : 0;
        data.metrics.arr = data.revenue.subscription;
        data.metrics.arpu = data.users.paid > 0 ? (data.revenue.subscription * 1000) / data.users.paid / 12 : 0;
        
        const customerLifespan = 100 / data.metrics.churn;
        data.metrics.ltv = data.metrics.arpu * customerLifespan;
    });
    
    FINANCIAL_DATA.cashFlow.operating = years.map(y => Math.round(FINANCIAL_DATA.projections[y].metrics.ebitda * 0.8));
    FINANCIAL_DATA.cashFlow.free = years.map(y => Math.round(FINANCIAL_DATA.projections[y].metrics.ebitda * 0.65));
    
    renderFinancialProjectionsTable();
    renderMetricsTable();
    updateProjectionSummaryCards();
    renderUnitEconomics();
    updateAllCharts();

    if (typeof recalculateValuation === 'function') {
        recalculateValuation();
    }
    
    console.log('✅ Recalculation complete');
}

// ⚡ MISE À JOUR DES CARTES DE RÉSUMÉ FINANCIAL PROJECTIONS
function updateProjectionSummaryCards() {
    console.log('📊 Updating Financial Projections summary cards...');
    
    const year5 = FINANCIAL_DATA.projections.year5;
    
    // Sélectionner les cartes par leurs valeurs affichées
    const cards = document.querySelectorAll('.projection-card');
    
    if (cards.length >= 4) {
        // Carte 1: Year 5 ARR
        const arrCard = cards[0];
        const arrValue = arrCard.querySelector('.proj-value');
        if (arrValue) {
            arrValue.textContent = formatCurrency(year5.metrics.arr * 1000);
        }
        
        // Carte 2: Total Users (Year 5)
        const usersCard = cards[1];
        const usersValue = usersCard.querySelector('.proj-value');
        const usersGrowth = usersCard.querySelector('.proj-growth');
        if (usersValue) {
            usersValue.textContent = formatNumber(year5.users.total);
        }
        if (usersGrowth) {
            usersGrowth.textContent = formatNumber(year5.users.paid) + ' paid subscribers';
        }
        
        // Carte 3: Gross Margin (Year 5) - Cette valeur est fixe à 85%
        // Pas de changement nécessaire
        
        // Carte 4: EBITDA (Year 5)
        const ebitdaCard = cards[3];
        const ebitdaValue = ebitdaCard.querySelector('.proj-value');
        const ebitdaGrowth = ebitdaCard.querySelector('.proj-growth');
        if (ebitdaValue) {
            ebitdaValue.textContent = formatCurrency(year5.metrics.ebitda * 1000);
        }
        if (ebitdaGrowth) {
            ebitdaGrowth.textContent = formatPercentage(year5.metrics.ebitdaMargin) + ' margin';
        }
    }
    
    console.log('✅ Summary cards updated');
}

function resetFinancialData() {
    if (!confirm('⚠ Are you sure you want to reset all financial data to default values?')) return;
    
    location.reload();
}

function exportFinancialData() {
    const dataStr = JSON.stringify(FINANCIAL_DATA, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AlphaVault_Business_Plan_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('💾 Financial data exported');
}

function renderRevenueBreakdownTable() {
    const container = document.getElementById('revenueBreakdownTable');
    if (!container) return;
    container.innerHTML = '<p class="text-muted"><i class="fas fa-info-circle"></i> Revenue breakdown integrated in main table above.</p>';
}

function renderExpensesBreakdownTable() {
    const container = document.getElementById('expensesBreakdownTable');
    if (!container) return;
    container.innerHTML = '<p class="text-muted"><i class="fas fa-info-circle"></i> Expenses breakdown integrated in main table above.</p>';
}

function renderMetricsTable() {
    const container = document.getElementById('metricsTable');
    if (!container) return;
    
    const years = ['year1', 'year2', 'year3', 'year4', 'year5'];
    
    let html = `
        <div class="responsive-table-wrapper">
            <table class="financial-table">
                <thead>
                    <tr>
                        <th class="sticky-col">Key Metric</th>
                        <th>Year 1</th>
                        <th>Year 2</th>
                        <th>Year 3</th>
                        <th>Year 4</th>
                        <th>Year 5</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="sticky-col"><span class="tooltip-term" data-term="MRR"><i class="fas fa-info-circle"></i> MRR</span></td>
                        ${years.map(y => `<td>${formatCurrency(FINANCIAL_DATA.projections[y].metrics.mrr * 1000)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col"><span class="tooltip-term" data-term="ARR"><i class="fas fa-info-circle"></i> ARR</span></td>
                        ${years.map(y => `<td class="highlight">${formatCurrency(FINANCIAL_DATA.projections[y].metrics.arr * 1000)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col"><span class="tooltip-term" data-term="ARPU"><i class="fas fa-info-circle"></i> ARPU</span></td>
                        ${years.map(y => `<td>${formatCurrency(FINANCIAL_DATA.projections[y].metrics.arpu, 2)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col"><span class="tooltip-term" data-term="LTV"><i class="fas fa-info-circle"></i> LTV</span></td>
                        ${years.map(y => `<td>${formatCurrency(FINANCIAL_DATA.projections[y].metrics.ltv)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col"><span class="tooltip-term" data-term="CAC"><i class="fas fa-info-circle"></i> CAC</span></td>
                        ${years.map(y => `<td>${formatCurrency(FINANCIAL_DATA.projections[y].metrics.cac)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col">LTV:CAC Ratio</td>
                        ${years.map(y => {
                            const ratio = FINANCIAL_DATA.projections[y].metrics.ltv / FINANCIAL_DATA.projections[y].metrics.cac;
                            const ratioClass = ratio >= 3 ? 'highlight' : '';
                            return `<td class="${ratioClass}">${ratio.toFixed(1)}:1</td>`;
                        }).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col"><span class="tooltip-term" data-term="CHURN"><i class="fas fa-info-circle"></i> Churn Rate</span></td>
                        ${years.map(y => `<td>${formatPercentage(FINANCIAL_DATA.projections[y].metrics.churn)}</td>`).join('')}
                    </tr>
                    <tr>
                        <td class="sticky-col"><span class="tooltip-term" data-term="PAYBACK"><i class="fas fa-info-circle"></i> Payback Period</span></td>
                        ${years.map(y => {
                            const payback = FINANCIAL_DATA.projections[y].metrics.cac / (FINANCIAL_DATA.projections[y].metrics.arpu * 0.85);
                            return `<td>${payback.toFixed(1)} mo</td>`;
                        }).join('')}
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
    initializeTooltips();
}

// ════════════════════════════════════════════════════════════════
// UNIT ECONOMICS - RENDU DYNAMIQUE
// ════════════════════════════════════════════════════════════════

function renderUnitEconomics() {
    console.log('📊 Rendering dynamic Unit Economics section...');
    
    const container = document.getElementById('unitEconomicsContent');
    if (!container) {
        console.warn('⚠ Unit Economics container not found');
        return;
    }
    
    // Utiliser les données de Year 1 pour les calculs
    const y1 = FINANCIAL_DATA.projections.year1;
    
    // Calculs dérivés
    const arpu = y1.metrics.arpu;
    const ltv = y1.metrics.ltv;
    const cac = y1.metrics.cac;
    const churn = y1.metrics.churn;
    const grossMargin = 85; // Fixe (ou rendre éditable si besoin)
    
    const customerLifespan = 100 / churn; // en mois
    const ltvCacRatio = ltv / cac;
    const paybackPeriod = cac / (arpu * (grossMargin / 100));
    
    // Calcul CAC pondéré (channels marketing)
    const blendedCAC = cac; // Utiliser le CAC défini dans les projections
    
    // Net Revenue Retention (estimé)
    const nrr = 105; // Valeur par défaut (ou calculer dynamiquement si données disponibles)
    
    // Magic Number (estimé : (ARR growth Q over Q) / (Sales & Marketing spend previous Q))
    const magicNumber = 1.2; // Valeur par défaut
    
    // Benchmark LTV:CAC
    let ltvCacBenchmark = '';
    let ltvCacColor = '';
    if (ltvCacRatio < 1) {
        ltvCacBenchmark = 'Poor';
        ltvCacColor = 'var(--danger)';
    } else if (ltvCacRatio < 3) {
        ltvCacBenchmark = 'Fair';
        ltvCacColor = 'var(--warning)';
    } else if (ltvCacRatio < 5) {
        ltvCacBenchmark = 'Good';
        ltvCacColor = 'var(--success)';
    } else {
        ltvCacBenchmark = 'Excellent';
        ltvCacColor = 'gold';
    }
    
    const html = `
        <h3 class="subsection-title">
            <i class="fas fa-user-tag"></i> Customer Lifetime Value (<span class="tooltip-term" data-term="LTV">LTV</span>)
        </h3>

        <div class="ltv-calculation">
            <div class="calc-card">
                <h4><i class="fas fa-dollar-sign"></i> Average Revenue Per User (<span class="tooltip-term" data-term="ARPU">ARPU</span>)</h4>
                <div class="calc-formula">
                    ARPU = (Pro Users × $${y1.pricing.pro}) + (Platinum Users × $${y1.pricing.platinum}) / Total Paid Users
                </div>
                <div class="calc-result">
                    = (${Math.round((y1.users.pro / y1.users.paid) * 100)}% × $${y1.pricing.pro}) + (${Math.round((y1.users.platinum / y1.users.paid) * 100)}% × $${y1.pricing.platinum}) = <strong>${formatCurrency(arpu, 2)}/month</strong>
                </div>
            </div>

            <div class="calc-card">
                <h4><i class="fas fa-calendar-alt"></i> Average Customer Lifespan</h4>
                <div class="calc-formula">
                    Lifespan = 1 / Monthly Churn Rate
                </div>
                <div class="calc-result">
                    = 1 / ${formatPercentage(churn)} = <strong>${customerLifespan.toFixed(1)} months</strong>
                </div>
            </div>

            <div class="calc-card highlight">
                <h4><i class="fas fa-chart-line"></i> Lifetime Value (LTV)</h4>
                <div class="calc-formula">
                    LTV = ARPU × Customer Lifespan
                </div>
                <div class="calc-result">
                    = ${formatCurrency(arpu, 2)} × ${customerLifespan.toFixed(1)} months = <strong>${formatCurrency(ltv)}</strong>
                </div>
            </div>
        </div>

        <h3 class="subsection-title" style="margin-top: 40px;">
            <i class="fas fa-funnel-dollar"></i> Customer Acquisition Cost (<span class="tooltip-term" data-term="CAC">CAC</span>)
        </h3>

        <div class="cac-breakdown">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Channel</th>
                        <th>Cost Per Acquisition</th>
                        <th>% of Total Acquisitions</th>
                        <th>Weighted CAC</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>SEO & Content</td>
                        <td>$10</td>
                        <td>30%</td>
                        <td>$3.00</td>
                    </tr>
                    <tr>
                        <td>Paid Social</td>
                        <td>$35</td>
                        <td>25%</td>
                        <td>$8.75</td>
                    </tr>
                    <tr>
                        <td>Referral Program</td>
                        <td>$15</td>
                        <td>20%</td>
                        <td>$3.00</td>
                    </tr>
                    <tr>
                        <td>Influencer Partnerships</td>
                        <td>$25</td>
                        <td>15%</td>
                        <td>$3.75</td>
                    </tr>
                    <tr>
                        <td>Organic/Word of Mouth</td>
                        <td>$5</td>
                        <td>10%</td>
                        <td>$0.50</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>Blended CAC</strong></td>
                        <td colspan="2"></td>
                        <td><strong>${formatCurrency(blendedCAC, 2)}</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <h3 class="subsection-title" style="margin-top: 40px;">
            <i class="fas fa-balance-scale"></i> <span class="tooltip-term" data-term="LTV">LTV</span>:<span class="tooltip-term" data-term="CAC">CAC</span> Ratio Analysis
        </h3>

        <div class="ltv-cac-analysis">
            <div class="ratio-card excellent">
                <div class="ratio-header">
                    <i class="fas fa-trophy"></i>
                    <h4>AlphaVault AI LTV:CAC</h4>
                </div>
                <div class="ratio-value">${ltvCacRatio.toFixed(1)}:1</div>
                <div class="ratio-calc">${formatCurrency(ltv)} LTV / ${formatCurrency(cac)} CAC</div>
                <div class="ratio-verdict">
                    <i class="fas fa-check-circle"></i>
                    <strong>${ltvCacBenchmark}</strong> - ${ltvCacRatio >= 3 ? 'Well above' : ltvCacRatio >= 1 ? 'At' : 'Below'} 3:1 benchmark
                </div>
            </div>

            <div class="ratio-benchmarks">
                <h4><i class="fas fa-chart-bar"></i> Industry Benchmarks</h4>
                <div class="benchmark-item">
                    <div class="benchmark-label">
                        <i class="fas fa-times-circle" style="color: var(--danger);"></i>
                        Poor (< 1:1)
                    </div>
                    <div class="benchmark-desc">Unsustainable - losing money on each customer</div>
                </div>
                <div class="benchmark-item">
                    <div class="benchmark-label">
                        <i class="fas fa-exclamation-circle" style="color: var(--warning);"></i>
                        Fair (1:1 to 3:1)
                    </div>
                    <div class="benchmark-desc">Break-even to marginal profitability</div>
                </div>
                <div class="benchmark-item">
                    <div class="benchmark-label">
                        <i class="fas fa-check-circle" style="color: var(--success);"></i>
                        Good (3:1 to 5:1)
                    </div>
                    <div class="benchmark-desc">Healthy SaaS metrics</div>
                </div>
                <div class="benchmark-item highlight">
                    <div class="benchmark-label">
                        <i class="fas fa-star" style="color: gold;"></i>
                        Excellent (> 5:1)
                    </div>
                    <div class="benchmark-desc">Outstanding - highly scalable model (AlphaVault: ${ltvCacRatio.toFixed(1)}:1)</div>
                </div>
            </div>
        </div>

        <h3 class="subsection-title" style="margin-top: 40px;">
            <i class="fas fa-clock"></i> <span class="tooltip-term" data-term="PAYBACK">Payback Period</span>
        </h3>

        <div class="payback-calculation">
            <div class="payback-card">
                <h4><i class="fas fa-calculator"></i> Calculation</h4>
                <div class="calc-formula">
                    Payback Period = CAC / (ARPU × Gross Margin)
                </div>
                <div class="calc-steps">
                    <div class="step-item">CAC = ${formatCurrency(cac)}</div>
                    <div class="step-item">ARPU = ${formatCurrency(arpu, 2)}/month</div>
                    <div class="step-item">Gross Margin = ${grossMargin}%</div>
                </div>
                <div class="calc-result">
                    = ${formatCurrency(cac)} / (${formatCurrency(arpu, 2)} × ${grossMargin / 100}) = <strong>${paybackPeriod.toFixed(1)} months</strong>
                </div>
            </div>

            <div class="payback-benchmark">
                <h4><i class="fas fa-check-double"></i> Industry Standard</h4>
                <p>Best-in-class SaaS companies aim for a payback period under <strong>12 months</strong>.</p>
                <p style="margin-top: 12px;">
                    <i class="fas fa-trophy" style="color: gold; margin-right: 8px;"></i>
                    <strong>AlphaVault AI: ${paybackPeriod.toFixed(1)} months</strong> — ${paybackPeriod <= 12 ? 'Exceptional capital efficiency!' : 'Opportunity for optimization'}
                </p>
            </div>
        </div>

        <h3 class="subsection-title" style="margin-top: 40px;">
            <i class="fas fa-chart-pie"></i> Key Metrics Dashboard
        </h3>

        <div class="metrics-dashboard">
            <div class="metric-card">
                <div class="metric-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                    <i class="fas fa-percentage"></i>
                </div>
                <div class="metric-label"><span class="tooltip-term" data-term="GROSS_MARGIN">Gross Margin</span></div>
                <div class="metric-value">${grossMargin}%</div>
                <div class="metric-trend positive">
                    <i class="fas fa-arrow-up"></i> Industry avg: 70-80%
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
                    <i class="fas fa-user-times"></i>
                </div>
                <div class="metric-label">Monthly <span class="tooltip-term" data-term="CHURN">Churn</span></div>
                <div class="metric-value">${formatPercentage(churn)}</div>
                <div class="metric-trend ${churn <= 7 ? 'positive' : 'negative'}">
                    <i class="fas ${churn <= 7 ? 'fa-check' : 'fa-exclamation-triangle'}"></i> Target: < 7%
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">
                    <i class="fas fa-sync-alt"></i>
                </div>
                <div class="metric-label">Net Revenue Retention</div>
                <div class="metric-value">${nrr}%</div>
                <div class="metric-trend positive">
                    <i class="fas fa-arrow-up"></i> Upgrades offset churn
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-icon" style="background: linear-gradient(135deg, #43e97b, #38f9d7);">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="metric-label">Magic Number</div>
                <div class="metric-value">${magicNumber.toFixed(1)}</div>
                <div class="metric-trend ${magicNumber >= 0.75 ? 'positive' : 'negative'}">
                    <i class="fas fa-check"></i> > 0.75 is efficient
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Réattacher les tooltips
    initializeTooltips();
    
    console.log('✅ Unit Economics section updated');
}

console.log('✅ Financial Projections Module Loaded');

// ════════════════════════════════════════════════════════════════
// SCENARIO SIMULATOR - VERSION ULTRA AVANCÉE
// ════════════════════════════════════════════════════════════════

function initializeScenarioSimulator() {
    console.log('🎯 Initializing advanced scenario simulator...');
    
    renderSimulatorControls();
    renderScenarioComparisonSection();
    initializeSimulatorCharts();
    attachSimulatorListeners();
    calculateAndDisplayScenario('base');
    
    console.log('✅ Scenario simulator initialized');
}

function renderSimulatorControls() {
    const container = document.getElementById('simulatorControls');
    if (!container) return;
    
    const baseParams = SCENARIOS.base.params;
    
    const controls = [
        { id: 'totalUsers', label: 'Initial Total Users', min: 1000, max: 50000, step: 500, value: baseParams.totalUsers, unit: '' },
        { id: 'conversionRate', label: 'Conversion Rate', min: 10, max: 60, step: 1, value: baseParams.conversionRate, unit: '%' },
        { id: 'proSplit', label: 'Pro Plan Split', min: 30, max: 80, step: 5, value: baseParams.proSplit, unit: '%' },
        { id: 'growthRate', label: 'Annual Growth Rate', min: 50, max: 500, step: 10, value: baseParams.growthRate, unit: '%' },
        { id: 'cac', label: 'Customer Acquisition Cost', min: 10, max: 100, step: 5, value: baseParams.cac, unit: '$' },
        { id: 'churnRate', label: 'Monthly Churn Rate', min: 1, max: 15, step: 0.5, value: baseParams.churnRate, unit: '%' },
        { id: 'affiliateRevShare', label: 'Affiliate Revenue Share', min: 5, max: 20, step: 1, value: baseParams.affiliateRevShare, unit: '%' },
        { id: 'grossMargin', label: 'Gross Margin', min: 70, max: 95, step: 1, value: baseParams.grossMargin, unit: '%' }
    ];
    
    let html = '<div class="simulator-controls-grid">';
    
    controls.forEach(ctrl => {
        html += `
            <div class="simulator-control-item">
                <div class="control-header">
                    <label for="sim${ctrl.id}">${ctrl.label}</label>
                    <span class="control-value" id="sim${ctrl.id}Value">${ctrl.value}${ctrl.unit}</span>
                </div>
                <input 
                    type="range" 
                    id="sim${ctrl.id}" 
                    class="simulator-slider" 
                    min="${ctrl.min}" 
                    max="${ctrl.max}" 
                    step="${ctrl.step}" 
                    value="${ctrl.value}"
                    data-unit="${ctrl.unit}"
                >
                <div class="control-minmax">
                    <span>${ctrl.min}${ctrl.unit}</span>
                    <span>${ctrl.max}${ctrl.unit}</span>
                </div>
            </div>
        `;
    });
    
    html += `</div>
        <div class="simulator-actions">
            <button class="bp-btn bp-btn-primary bp-btn-lg" onclick="runCustomSimulation()">
                <i class="fas fa-calculator"></i> Calculate Projection
            </button>
            <button class="bp-btn bp-btn-secondary" onclick="resetSimulator()">
                <i class="fas fa-undo"></i> Reset
            </button>
            <button class="bp-btn bp-btn-success" onclick="saveCustomScenario()">
                <i class="fas fa-save"></i> Save Custom Scenario
            </button>
        </div>
    `;
    
    container.innerHTML = html;
}

function attachSimulatorListeners() {
    const sliders = document.querySelectorAll('.simulator-slider');
    
    sliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const valueDisplay = document.getElementById(this.id + 'Value');
            const unit = this.dataset.unit;
            valueDisplay.textContent = this.value + unit;
        });
    });
}

function runCustomSimulation() {
    console.log('🚀 Running custom simulation...');
    
    const params = {
        totalUsers: parseFloat(document.getElementById('simtotalUsers').value),
        conversionRate: parseFloat(document.getElementById('simconversionRate').value),
        proSplit: parseFloat(document.getElementById('simproSplit').value),
        growthRate: parseFloat(document.getElementById('simgrowthRate').value),
        cac: parseFloat(document.getElementById('simcac').value),
        churnRate: parseFloat(document.getElementById('simchurnRate').value),
        affiliateRevShare: parseFloat(document.getElementById('simaffiliateRevShare').value),
        grossMargin: parseFloat(document.getElementById('simgrossMargin').value)
    };
    
    const projections = calculateScenarioProjections(params);
    displaySimulationResults(projections, params);
    updateSimulatorCharts(projections, 'Custom');
    
    const resultsSection = document.getElementById('simulationResults');
    if (resultsSection) {
        resultsSection.style.opacity = '0';
        setTimeout(() => {
            resultsSection.style.transition = 'opacity 0.6s ease';
            resultsSection.style.opacity = '1';
        }, 50);
    }
    
    console.log('✅ Custom simulation complete');
}

function calculateScenarioProjections(params) {
    const projections = {
        years: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
        users: { total: [], paid: [], pro: [], platinum: [] },
        revenue: { subscription: [], affiliate: [], total: [] },
        expenses: { marketing: [], total: [] },
        metrics: { mrr: [], arr: [], ltv: [], ltvCac: [], payback: [], ebitda: [], ebitdaMargin: [] }
    };
    
    let currentUsers = params.totalUsers;
    
    for (let year = 0; year < 5; year++) {
        const totalUsers = Math.round(currentUsers);
        const paidUsers = Math.round(totalUsers * (params.conversionRate / 100));
        const proUsers = Math.round(paidUsers * (params.proSplit / 100));
        const platinumUsers = paidUsers - proUsers;
        
        projections.users.total.push(totalUsers);
        projections.users.paid.push(paidUsers);
        projections.users.pro.push(proUsers);
        projections.users.platinum.push(platinumUsers);
        
        const mrr = (proUsers * 10) + (platinumUsers * 20);
        const subscriptionRevenue = mrr * 12;
        const affiliateRevenue = subscriptionRevenue * (params.affiliateRevShare / 100);
        const totalRevenue = subscriptionRevenue + affiliateRevenue;
        
        projections.revenue.subscription.push(subscriptionRevenue);
        projections.revenue.affiliate.push(affiliateRevenue);
        projections.revenue.total.push(totalRevenue);
        
        const marketingExpenses = paidUsers * params.cac;
        const totalExpenses = totalRevenue * ((100 - params.grossMargin) / 100);
        
        projections.expenses.marketing.push(marketingExpenses);
        projections.expenses.total.push(totalExpenses);
        
        const arr = subscriptionRevenue;
        const arpu = paidUsers > 0 ? subscriptionRevenue / paidUsers / 12 : 0;
        const customerLifespan = 100 / params.churnRate;
        const ltv = arpu * customerLifespan;
        const ltvCac = params.cac > 0 ? ltv / params.cac : 0;
        const payback = (arpu * (params.grossMargin / 100)) > 0 ? params.cac / (arpu * (params.grossMargin / 100)) : 0;
        const ebitda = totalRevenue - totalExpenses;
        const ebitdaMargin = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0;
        
        projections.metrics.mrr.push(mrr);
        projections.metrics.arr.push(arr);
        projections.metrics.ltv.push(ltv);
        projections.metrics.ltvCac.push(ltvCac);
        projections.metrics.payback.push(payback);
        projections.metrics.ebitda.push(ebitda);
        projections.metrics.ebitdaMargin.push(ebitdaMargin);
        
        currentUsers = currentUsers * (1 + params.growthRate / 100);
    }
    
    return projections;
}

function displaySimulationResults(projections, params) {
    const container = document.getElementById('simulationResults');
    if (!container) return;
    
    const y1 = 0;
    const y5 = 4;
    
    const results = [
        { icon: 'fa-calendar-alt', label: 'Year 1 MRR', value: formatCurrency(projections.metrics.mrr[y1]), color: '#3b82f6' },
        { icon: 'fa-sync-alt', label: 'Year 1 ARR', value: formatCurrency(projections.metrics.arr[y1]), color: '#3b82f6' },
        { icon: 'fa-rocket', label: 'Year 5 ARR', value: formatCurrency(projections.metrics.arr[y5]), color: '#10b981' },
        { icon: 'fa-chart-line', label: 'LTV:CAC Ratio', value: projections.metrics.ltvCac[y1].toFixed(1) + ':1', color: projections.metrics.ltvCac[y1] >= 3 ? '#10b981' : '#f59e0b' },
        { icon: 'fa-hourglass-half', label: 'Payback Period', value: projections.metrics.payback[y1].toFixed(1) + ' mo', color: projections.metrics.payback[y1] <= 12 ? '#10b981' : '#f59e0b' },
        { icon: 'fa-piggy-bank', label: 'Year 5 EBITDA', value: formatCurrency(projections.metrics.ebitda[y5]), color: '#8b5cf6' },
        { icon: 'fa-percentage', label: 'Year 5 EBITDA Margin', value: projections.metrics.ebitdaMargin[y5].toFixed(1) + '%', color: '#8b5cf6' },
        { icon: 'fa-users', label: 'Year 5 Total Users', value: formatNumber(projections.users.total[y5]), color: '#3b82f6' }
    ];
    
    let html = '<div class="simulation-results-grid">';
    
    results.forEach(result => {
        html += `
            <div class="result-card">
                <div class="result-icon" style="background: linear-gradient(135deg, ${result.color}, ${result.color}dd);">
                    <i class="fas ${result.icon}"></i>
                </div>
                <div class="result-content">
                    <div class="result-label">${result.label}</div>
                    <div class="result-value" style="color: ${result.color};">${result.value}</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    html += renderDetailedProjectionsTable(projections);
    container.innerHTML = html;
}

function renderDetailedProjectionsTable(projections) {
    return `
        <div class="detailed-projections-section">
            <h4><i class="fas fa-table"></i> Detailed 5-Year Projections</h4>
            <div class="responsive-table-wrapper">
                <table class="financial-table compact-table">
                    <thead>
                        <tr>
                            <th class="sticky-col">Metric</th>
                            <th>Year 1</th>
                            <th>Year 2</th>
                            <th>Year 3</th>
                            <th>Year 4</th>
                            <th>Year 5</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="section-header">
                            <td colspan="6"><i class="fas fa-users"></i> User Metrics</td>
                        </tr>
                        <tr>
                            <td class="sticky-col">Total Users</td>
                            ${projections.users.total.map(v => `<td>${formatNumber(v)}</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="sticky-col">Paid Users</td>
                            ${projections.users.paid.map(v => `<td>${formatNumber(v)}</td>`).join('')}
                        </tr>
                        <tr class="section-header">
                            <td colspan="6"><i class="fas fa-dollar-sign"></i> Revenue</td>
                        </tr>
                        <tr>
                            <td class="sticky-col">Subscription Revenue</td>
                            ${projections.revenue.subscription.map(v => `<td class="highlight">${formatCurrency(v)}</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="sticky-col">Affiliate Revenue</td>
                            ${projections.revenue.affiliate.map(v => `<td>${formatCurrency(v)}</td>`).join('')}
                        </tr>
                        <tr class="total-row">
                            <td class="sticky-col"><strong>Total Revenue</strong></td>
                            ${projections.revenue.total.map(v => `<td><strong>${formatCurrency(v)}</strong></td>`).join('')}
                        </tr>
                        <tr class="section-header">
                            <td colspan="6"><i class="fas fa-chart-line"></i> Key Metrics</td>
                        </tr>
                        <tr>
                            <td class="sticky-col">ARR</td>
                            ${projections.metrics.arr.map(v => `<td class="highlight">${formatCurrency(v)}</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="sticky-col">LTV:CAC</td>
                            ${projections.metrics.ltvCac.map(v => `<td class="highlight">${v.toFixed(1)}:1</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="sticky-col">EBITDA</td>
                            ${projections.metrics.ebitda.map(v => `<td>${formatCurrency(v)}</td>`).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function resetSimulator() {
    const baseParams = SCENARIOS.base.params;
    
    document.getElementById('simtotalUsers').value = baseParams.totalUsers;
    document.getElementById('simconversionRate').value = baseParams.conversionRate;
    document.getElementById('simproSplit').value = baseParams.proSplit;
    document.getElementById('simgrowthRate').value = baseParams.growthRate;
    document.getElementById('simcac').value = baseParams.cac;
    document.getElementById('simchurnRate').value = baseParams.churnRate;
    document.getElementById('simaffiliateRevShare').value = baseParams.affiliateRevShare;
    document.getElementById('simgrossMargin').value = baseParams.grossMargin;
    
    document.querySelectorAll('.simulator-slider').forEach(slider => {
        const valueDisplay = document.getElementById(slider.id + 'Value');
        const unit = slider.dataset.unit;
        valueDisplay.textContent = slider.value + unit;
    });
    
    runCustomSimulation();
    console.log('🔄 Simulator reset to base scenario');
}

function saveCustomScenario() {
    const name = prompt('Enter a name for this custom scenario:');
    if (!name) return;
    
    const params = {
        totalUsers: parseFloat(document.getElementById('simtotalUsers').value),
        conversionRate: parseFloat(document.getElementById('simconversionRate').value),
        proSplit: parseFloat(document.getElementById('simproSplit').value),
        growthRate: parseFloat(document.getElementById('simgrowthRate').value),
        cac: parseFloat(document.getElementById('simcac').value),
        churnRate: parseFloat(document.getElementById('simchurnRate').value),
        affiliateRevShare: parseFloat(document.getElementById('simaffiliateRevShare').value),
        grossMargin: parseFloat(document.getElementById('simgrossMargin').value)
    };
    
    savedScenarios[name] = {
        name: name,
        icon: 'fa-star',
        color: '#f59e0b',
        params: params
    };
    
    activeScenarios.push(name);
    renderScenarioComparisonSection();
    alert(`✅ Scenario "${name}" saved successfully!`);
    console.log('💾 Custom scenario saved:', name);
}

function renderScenarioComparisonSection() {
    const container = document.getElementById('scenarioComparisonSection');
    if (!container) return;
    
    let html = `
        <div class="scenario-selector">
            <h4><i class="fas fa-layer-group"></i> Select Scenarios to Compare</h4>
            <div class="scenario-selector-grid">
    `;
    
    Object.keys(SCENARIOS).forEach(key => {
        const scenario = SCENARIOS[key];
        const isActive = activeScenarios.includes(key);
        
        html += `
            <div class="scenario-selector-card ${isActive ? 'active' : ''}" onclick="toggleScenario('${key}')">
                <div class="scenario-selector-icon" style="background: ${scenario.color};">
                    <i class="fas ${scenario.icon}"></i>
                </div>
                <div class="scenario-selector-name">${scenario.name}</div>
                ${isActive ? '<div class="scenario-selector-badge">✓</div>' : ''}
            </div>
        `;
    });
    
    Object.keys(savedScenarios).forEach(key => {
        const scenario = savedScenarios[key];
        const isActive = activeScenarios.includes(key);
        
        html += `
            <div class="scenario-selector-card ${isActive ? 'active' : ''}" onclick="toggleScenario('${key}')">
                <div class="scenario-selector-icon" style="background: ${scenario.color};">
                    <i class="fas ${scenario.icon}"></i>
                </div>
                <div class="scenario-selector-name">${scenario.name}</div>
                ${isActive ? '<div class="scenario-selector-badge">✓</div>' : ''}
            </div>
        `;
    });
    
    html += `
            </div>
            <button class="bp-btn bp-btn-primary" onclick="compareSelectedScenarios()">
                <i class="fas fa-chart-bar"></i> Compare Selected Scenarios
            </button>
        </div>
        <div id="scenarioComparisonResults" class="scenario-comparison-results"></div>
    `;
    
    container.innerHTML = html;
}

function toggleScenario(scenarioKey) {
    const index = activeScenarios.indexOf(scenarioKey);
    
    if (index > -1) {
        activeScenarios.splice(index, 1);
    } else {
        activeScenarios.push(scenarioKey);
    }
    
    if (activeScenarios.length > 5) {
        activeScenarios.shift();
        alert('⚠ Maximum 5 scenarios can be compared at once.');
    }
    
    renderScenarioComparisonSection();
    console.log('📊 Active scenarios:', activeScenarios);
}

function compareSelectedScenarios() {
    if (activeScenarios.length === 0) {
        alert('⚠ Please select at least one scenario to compare.');
        return;
    }
    
    const container = document.getElementById('scenarioComparisonResults');
    if (!container) return;
    
    const comparisons = [];
    
    activeScenarios.forEach(key => {
        const scenario = SCENARIOS[key] || savedScenarios[key];
        if (!scenario) return;
        
        const projections = calculateScenarioProjections(scenario.params);
        
        comparisons.push({
            name: scenario.name,
            color: scenario.color,
            icon: scenario.icon,
            projections: projections
        });
    });
    
    let html = `
        <div class="comparison-table-section">
            <h4><i class="fas fa-balance-scale"></i> Scenario Comparison Matrix</h4>
            <div class="responsive-table-wrapper">
                <table class="financial-table comparison-table">
                    <thead>
                        <tr>
                            <th class="sticky-col">Metric</th>
                            ${comparisons.map(c => `<th style="color: ${c.color};"><i class="fas ${c.icon}"></i> ${c.name}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="sticky-col">Year 1 ARR</td>
                            ${comparisons.map(c => `<td>${formatCurrency(c.projections.metrics.arr[0])}</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="sticky-col">Year 5 ARR</td>
                            ${comparisons.map(c => `<td class="highlight">${formatCurrency(c.projections.metrics.arr[4])}</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="sticky-col">Year 5 Total Users</td>
                            ${comparisons.map(c => `<td>${formatNumber(c.projections.users.total[4])}</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="sticky-col">Year 1 LTV:CAC</td>
                            ${comparisons.map(c => `<td>${c.projections.metrics.ltvCac[0].toFixed(1)}:1</td>`).join('')}
                        </tr>
                        <tr>
                            <td class="sticky-col">Year 5 EBITDA</td>
                            ${comparisons.map(c => `<td class="highlight">${formatCurrency(c.projections.metrics.ebitda[4])}</td>`).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    updateComparisonCharts(comparisons);
}

function calculateAndDisplayScenario(scenarioKey) {
    const scenario = SCENARIOS[scenarioKey];
    if (!scenario) return;
    
    const projections = calculateScenarioProjections(scenario.params);
    updateSimulatorCharts(projections, scenario.name);
}

console.log('✅ Scenario Simulator Module Loaded');

// ════════════════════════════════════════════════════════════════
// GRAPHIQUES - TOUS LES CHARTS
// ════════════════════════════════════════════════════════════════

function initializeCharts() {
    console.log('📊 Initializing all charts...');
    
    createMarketGrowthChart();
    createRevenueChart();
    createProfitabilityChart();
    createCashFlowChart();
    createUserGrowthChart();
    createMarketShareChart();
    createRiskMatrixChart();
    
    console.log('✅ All charts initialized');
}

function initializeSimulatorCharts() {
    console.log('📊 Initializing simulator charts...');
    
    createScenarioComparisonChart();
    createScenarioMetricsChart();
    createScenarioProfitabilityChart();
    createScenarioUsersChart();
    createScenarioLTVChart();
    createScenarioBreakdownChart();
    
    console.log('✅ Simulator charts initialized');
}

function getResponsiveChartConfig(title, yAxisLabel, prefix = '', suffix = '') {
    return {
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: isSmallMobile ? 1 : (isMobile ? 1.5 : 2),
        plugins: {
            legend: {
                position: isMobile ? 'bottom' : 'top',
                labels: {
                    font: { size: isSmallMobile ? 10 : (isMobile ? 11 : 13), weight: 'bold' },
                    padding: isSmallMobile ? 8 : (isMobile ? 10 : 18),
                    usePointStyle: true,
                    boxWidth: isSmallMobile ? 30 : 40
                }
            },
            title: {
                display: true,
                text: title,
                font: { size: isSmallMobile ? 13 : (isMobile ? 15 : 17), weight: 'bold' },
                padding: isSmallMobile ? 12 : (isMobile ? 15 : 20)
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                padding: isMobile ? 10 : 14,
                bodyFont: { size: isSmallMobile ? 11 : (isMobile ? 12 : 13) },
                callbacks: {
                    label: context => context.dataset.label + ': ' + prefix + (typeof context.parsed.y === 'number' ? context.parsed.y.toLocaleString() : context.parsed.y) + suffix
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: yAxisLabel,
                    font: { size: isSmallMobile ? 11 : (isMobile ? 12 : 14), weight: 'bold' }
                },
                ticks: {
                    font: { size: isSmallMobile ? 9 : (isMobile ? 10 : 12) },
                    callback: value => prefix + value.toLocaleString() + suffix
                },
                grid: { color: 'rgba(59, 130, 246, 0.1)' }
            },
            x: {
                ticks: {
                    font: { size: isSmallMobile ? 9 : (isMobile ? 10 : 12) },
                    maxRotation: isMobile ? 45 : 0,
                    minRotation: isMobile ? 45 : 0
                },
                grid: { display: false }
            }
        }
    };
}

function createScenarioComparisonChart() {
    const ctx = document.getElementById('scenarioComparisonChart');
    if (!ctx) return;
    
    chartInstances.scenarioComparison = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: []
        },
        options: getResponsiveChartConfig('ARR Comparison Across Scenarios', 'ARR ($)', '$', '')
    });
}

function createScenarioMetricsChart() {
    const ctx = document.getElementById('scenarioMetricsChart');
    if (!ctx) return;
    
    chartInstances.scenarioMetrics = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['LTV:CAC', 'Growth Rate', 'Conversion Rate', 'Gross Margin', 'Market Share'],
            datasets: []
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: isMobile ? 'bottom' : 'top' },
                title: { display: true, text: 'Key Metrics Radar' }
            },
            scales: {
                r: { beginAtZero: true, max: 100 }
            }
        }
    });
}

function createScenarioProfitabilityChart() {
    const ctx = document.getElementById('scenarioProfitabilityChart');
    if (!ctx) return;
    
    chartInstances.scenarioProfitability = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: []
        },
        options: getResponsiveChartConfig('EBITDA Evolution', 'EBITDA ($)', '$', '')
    });
}

function createScenarioUsersChart() {
    const ctx = document.getElementById('scenarioUsersChart');
    if (!ctx) return;
    
    chartInstances.scenarioUsers = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: []
        },
        options: getResponsiveChartConfig('Total Users Growth', 'Users', '', '')
    });
}

function createScenarioLTVChart() {
    const ctx = document.getElementById('scenarioLTVChart');
    if (!ctx) return;
    
    chartInstances.scenarioLTV = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: []
        },
        options: getResponsiveChartConfig('LTV:CAC Ratio Evolution', 'Ratio', '', ':1')
    });
}

function createScenarioBreakdownChart() {
    const ctx = document.getElementById('scenarioBreakdownChart');
    if (!ctx) return;
    
    chartInstances.scenarioBreakdown = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: []
        },
        options: {
            ...getResponsiveChartConfig('Revenue Breakdown', 'Revenue ($)', '$', ''),
            scales: {
                y: { stacked: true },
                x: { stacked: true }
            }
        }
    });
}

function updateSimulatorCharts(projections, scenarioName) {
    const color = '#3b82f6';
    
    if (chartInstances.scenarioComparison) {
        chartInstances.scenarioComparison.data.datasets = [{
            label: scenarioName + ' ARR',
            data: projections.metrics.arr,
            borderColor: color,
            backgroundColor: color + '33',
            tension: 0.4,
            fill: true
        }];
        chartInstances.scenarioComparison.update();
    }
    
    if (chartInstances.scenarioProfitability) {
        chartInstances.scenarioProfitability.data.datasets = [{
            label: scenarioName + ' EBITDA',
            data: projections.metrics.ebitda,
            backgroundColor: color + 'cc',
            borderColor: color
        }];
        chartInstances.scenarioProfitability.update();
    }
    
    if (chartInstances.scenarioUsers) {
        chartInstances.scenarioUsers.data.datasets = [{
            label: scenarioName + ' Total Users',
            data: projections.users.total,
            borderColor: color,
            backgroundColor: color + '22',
            tension: 0.4,
            fill: true
        }];
        chartInstances.scenarioUsers.update();
    }
    
    if (chartInstances.scenarioLTV) {
        chartInstances.scenarioLTV.data.datasets = [{
            label: scenarioName + ' LTV:CAC',
            data: projections.metrics.ltvCac,
            borderColor: '#10b981',
            backgroundColor: '#10b98133',
            tension: 0.4,
            fill: true
        }];
        chartInstances.scenarioLTV.update();
    }
    
    if (chartInstances.scenarioBreakdown) {
        chartInstances.scenarioBreakdown.data.datasets = [
            {
                label: 'Subscription Revenue',
                data: projections.revenue.subscription,
                backgroundColor: '#3b82f6cc'
            },
            {
                label: 'Affiliate Revenue',
                data: projections.revenue.affiliate,
                backgroundColor: '#8b5cf6cc'
            }
        ];
        chartInstances.scenarioBreakdown.update();
    }
}

function updateComparisonCharts(comparisons) {
    if (chartInstances.scenarioComparison) {
        chartInstances.scenarioComparison.data.datasets = comparisons.map(c => ({
            label: c.name + ' ARR',
            data: c.projections.metrics.arr,
            borderColor: c.color,
            backgroundColor: c.color + '33',
            tension: 0.4
        }));
        chartInstances.scenarioComparison.update();
    }
    
    if (chartInstances.scenarioProfitability) {
        chartInstances.scenarioProfitability.data.datasets = comparisons.map(c => ({
            label: c.name + ' EBITDA',
            data: c.projections.metrics.ebitda,
            backgroundColor: c.color + 'cc',
            borderColor: c.color
        }));
        chartInstances.scenarioProfitability.update();
    }
}

function updateAllCharts() {
    updateRevenueChart();
    updateProfitabilityChart();
    updateUserGrowthChart();
    updateCashFlowChart();
}

function updateRevenueChart() {
    if (!chartInstances.revenue) return;
    
    const years = ['year1', 'year2', 'year3', 'year4', 'year5'];
    chartInstances.revenue.data.datasets[0].data = years.map(y => FINANCIAL_DATA.projections[y].revenue.subscription);
    chartInstances.revenue.data.datasets[1].data = years.map(y => FINANCIAL_DATA.projections[y].revenue.affiliate);
    chartInstances.revenue.update();
}

function updateProfitabilityChart() {
    if (!chartInstances.profitability) return;
    
    const years = ['year1', 'year2', 'year3', 'year4', 'year5'];
    chartInstances.profitability.data.datasets[0].data = years.map(y => FINANCIAL_DATA.projections[y].revenue.total);
    chartInstances.profitability.data.datasets[1].data = years.map(y => FINANCIAL_DATA.projections[y].expenses.total);
    chartInstances.profitability.data.datasets[2].data = years.map(y => FINANCIAL_DATA.projections[y].metrics.ebitda);
    chartInstances.profitability.data.datasets[3].data = years.map(y => FINANCIAL_DATA.projections[y].metrics.ebitdaMargin);
    chartInstances.profitability.update();
}

function updateUserGrowthChart() {
    if (!chartInstances.userGrowth) return;
    
    const years = ['year1', 'year2', 'year3', 'year4', 'year5'];
    chartInstances.userGrowth.data.datasets[0].data = years.map(y => FINANCIAL_DATA.projections[y].users.total);
    chartInstances.userGrowth.data.datasets[1].data = years.map(y => FINANCIAL_DATA.projections[y].users.paid);
    chartInstances.userGrowth.update();
}

function updateCashFlowChart() {
    if (!chartInstances.cashFlow) return;
    
    chartInstances.cashFlow.data.datasets[0].data = FINANCIAL_DATA.cashFlow.operating;
    chartInstances.cashFlow.data.datasets[1].data = FINANCIAL_DATA.cashFlow.free;
    chartInstances.cashFlow.update();
}

function createMarketGrowthChart() {
    const ctx = document.getElementById('marketGrowthChart');
    if (!ctx) return;
    
    chartInstances.marketGrowth = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2024', '2025', '2026', '2027', '2028', '2029'],
            datasets: [
                { label: 'TAM', data: FINANCIAL_DATA.market.tam, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.4, fill: true },
                { label: 'SAM', data: FINANCIAL_DATA.market.sam, borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', tension: 0.4, fill: true },
                { label: 'SOM', data: FINANCIAL_DATA.market.som, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.4, fill: true }
            ]
        },
        options: getResponsiveChartConfig('Market Size Projection ($B)', 'Market Size (Billions)', '$', 'B')
    });
}

function createRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    const years = ['year1', 'year2', 'year3', 'year4', 'year5'];
    
    chartInstances.revenue = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                { label: 'Subscription Revenue', data: years.map(y => FINANCIAL_DATA.projections[y].revenue.subscription), backgroundColor: 'rgba(59, 130, 246, 0.8)' },
                { label: 'Affiliate Revenue', data: years.map(y => FINANCIAL_DATA.projections[y].revenue.affiliate), backgroundColor: 'rgba(139, 92, 246, 0.8)' }
            ]
        },
        options: {
            ...getResponsiveChartConfig('5-Year Revenue Projection ($K)', 'Revenue ($K)', '$', 'K'),
            scales: { y: { stacked: true }, x: { stacked: true } }
        }
    });
}

function createProfitabilityChart() {
    const ctx = document.getElementById('profitabilityChart');
    if (!ctx) return;
    
    const years = ['year1', 'year2', 'year3', 'year4', 'year5'];
    
    chartInstances.profitability = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                { label: 'Total Revenue', data: years.map(y => FINANCIAL_DATA.projections[y].revenue.total), borderColor: '#3b82f6', yAxisID: 'y', tension: 0.4 },
                { label: 'Total Expenses', data: years.map(y => FINANCIAL_DATA.projections[y].expenses.total), borderColor: '#ef4444', yAxisID: 'y', tension: 0.4 },
                { label: 'EBITDA', data: years.map(y => FINANCIAL_DATA.projections[y].metrics.ebitda), borderColor: '#10b981', yAxisID: 'y', tension: 0.4 },
                { label: 'EBITDA Margin (%)', data: years.map(y => FINANCIAL_DATA.projections[y].metrics.ebitdaMargin), borderColor: '#f59e0b', yAxisID: 'y1', borderDash: [5, 5], tension: 0.4 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: isMobile ? 'bottom' : 'top' },
                title: { display: true, text: 'Revenue vs Expenses vs Profitability' }
            },
            scales: {
                y: { type: 'linear', position: 'left', title: { display: true, text: 'Amount ($K)' } },
                y1: { type: 'linear', position: 'right', title: { display: true, text: 'Margin (%)' }, grid: { drawOnChartArea: false } }
            }
        }
    });
}

function createCashFlowChart() {
    const ctx = document.getElementById('cashFlowChart');
    if (!ctx) return;
    
    chartInstances.cashFlow = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                { label: 'Operating Cash Flow', data: FINANCIAL_DATA.cashFlow.operating, backgroundColor: 'rgba(16, 185, 129, 0.8)' },
                { label: 'Free Cash Flow', data: FINANCIAL_DATA.cashFlow.free, backgroundColor: 'rgba(59, 130, 246, 0.8)' }
            ]
        },
        options: getResponsiveChartConfig('Cash Flow Projection ($K)', 'Cash Flow ($K)', '$', 'K')
    });
}

function createUserGrowthChart() {
    const ctx = document.getElementById('userGrowthChart');
    if (!ctx) return;
    
    const years = ['year1', 'year2', 'year3', 'year4', 'year5'];
    
    chartInstances.userGrowth = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                { label: 'Total Users', data: years.map(y => FINANCIAL_DATA.projections[y].users.total), borderColor: '#3b82f6', tension: 0.4, fill: true },
                { label: 'Paid Users', data: years.map(y => FINANCIAL_DATA.projections[y].users.paid), borderColor: '#10b981', tension: 0.4, fill: true }
            ]
        },
        options: getResponsiveChartConfig('User Growth Projection', 'Number of Users', '', '')
    });
}

function createMarketShareChart() {
    const ctx = document.getElementById('marketShareChart');
    if (!ctx) return;
    
    const data = FINANCIAL_DATA.marketShare;
    
    chartInstances.marketShare = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['AlphaVault AI', 'Bloomberg Terminal', 'Yahoo Finance', 'TradingView', 'Others'],
            datasets: [{
                data: [data.alphavault, data.bloomberg, data.yahoo, data.tradingview, data.others],
                backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(139, 92, 246, 0.8)']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: isMobile ? 'bottom' : 'right' },
                title: { display: true, text: 'Target Market Share (Year 5)' }
            }
        }
    });
}

function createRiskMatrixChart() {
    const ctx = document.getElementById('riskMatrixChart');
    if (!ctx) return;
    
    chartInstances.riskMatrix = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: [
                { label: 'Market Risk', data: [{ x: 30, y: 80, r: 20 }], backgroundColor: 'rgba(239, 68, 68, 0.6)' },
                { label: 'AI Model Accuracy', data: [{ x: 40, y: 60, r: 17 }], backgroundColor: 'rgba(245, 158, 11, 0.6)' },
                { label: 'Big Tech Competition', data: [{ x: 20, y: 70, r: 20 }], backgroundColor: 'rgba(239, 68, 68, 0.6)' },
                { label: 'Regulatory Risk', data: [{ x: 10, y: 50, r: 14 }], backgroundColor: 'rgba(245, 158, 11, 0.6)' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: isMobile ? 'bottom' : 'right' },
                title: { display: true, text: 'Risk Matrix: Probability vs Impact' }
            },
            scales: {
                x: { title: { display: true, text: 'Probability (%)' }, min: 0, max: 50 },
                y: { title: { display: true, text: 'Impact Score' }, min: 0, max: 100 }
            }
        }
    });
}

// ════════════════════════════════════════════════════════════════
// TABS, MODALS & TOOLTIPS
// ════════════════════════════════════════════════════════════════

function initializeTabs() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.bp-section');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            
            navTabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            this.classList.add('active');
            const targetElement = document.getElementById(targetSection);
            
            if (targetElement) {
                targetElement.classList.add('active');
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        });
    });
    
    console.log('✅ Tabs initialized');
}

function initializeModals() {
    if (!document.getElementById('termModal')) {
        const modalHTML = `
            <div class="modal-overlay" id="termModal">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3 id="modalTitle"><i class="fas fa-info-circle"></i> Term Definition</h3>
                        <button class="modal-close" onclick="closeTermModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="modalBody"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    console.log('✅ Modals initialized');
}

function initializeTooltips() {
    document.querySelectorAll('.tooltip-term').forEach(term => {
        term.addEventListener('click', function() {
            const termKey = this.dataset.term;
            openTermModal(termKey);
        });
    });
    
    console.log('✅ Tooltips initialized');
}

function openTermModal(termKey) {
    const term = financialTerms[termKey];
    if (!term) return;
    
    const modal = document.getElementById('termModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.innerHTML = `<i class="fas ${term.icon}"></i> ${term.title}`;
    modalBody.innerHTML = `
        <p>${term.description}</p>
        <div class="modal-example">
            <h4><i class="fas fa-calculator"></i> Formula</h4>
            <p><code>${term.formula}</code></p>
        </div>
        <div class="modal-example">
            <h4><i class="fas fa-lightbulb"></i> Example</h4>
            <p>${term.example}</p>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeTermModal() {
    const modal = document.getElementById('termModal');
    modal.classList.remove('active');
}

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeTermModal();
    }
});

function initializeExportPDF() {
    const exportBtn = document.getElementById('exportPdfBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            window.print();
            console.log('📄 Initiating PDF export...');
        });
    }
}

// ════════════════════════════════════════════════════════════════
// DOM CONTENT LOADED - INITIALISATION PRINCIPALE
// ════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 Business Plan Dashboard v5.0 Firestore - Initializing...');
    
    initializeFirestore();
    initializeTabs();
    initializeCharts();
    initializeFinancialProjections();
    initializeScenarioSimulator();
    initializeValuationSection();
    initializeModals();
    initializeTooltips();
    initializeExportPDF();
    
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const currentDateEl = document.getElementById('currentDate');
    if (currentDateEl) currentDateEl.textContent = currentDate;
    
    const footerDateEl = document.getElementById('footerDate');
    if (footerDateEl) {
        footerDateEl.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    console.log('✅ All systems ready - Firestore-enabled Architecture');
});

window.addEventListener('load', function() {
    if (isMobile) {
        console.log('📱 Applying mobile chart corrections...');
        
        const allCanvas = document.querySelectorAll('.chart-container canvas');
        
        allCanvas.forEach(function(canvas) {
            const container = canvas.closest('.chart-container');
            
            if (container) {
                container.style.minHeight = isSmallMobile ? '400px' : '420px';
                container.style.padding = isSmallMobile ? '20px 12px' : '24px 16px';
                
                canvas.style.height = isSmallMobile ? '360px' : '380px';
                canvas.style.minHeight = isSmallMobile ? '360px' : '380px';
            }
        });
        
        console.log(`✅ Mobile corrections applied to ${allCanvas.length} charts`);
    }
});

// ════════════════════════════════════════════════════════════════
// VALUATION & FUNDING - EDITABLE WITH FIRESTORE SYNC (ARR EDITABLE)
// ════════════════════════════════════════════════════════════════

// ⚡ EXTEND FINANCIAL_DATA WITH VALUATION DATA
if (!FINANCIAL_DATA.valuation) {
    FINANCIAL_DATA.valuation = {
        preSeedValuation: 450000, // $450K (~€400K)
        arrMultiples: {
            year0: 0,
            year1: 5,
            year2: 6,
            year3: 8,
            year4: 10,
            year5: 12
        },
        rounds: {
            year0: { 
                name: 'Pre-Seed',
                amount: 0,          // No investment yet
                preMoney: 450000,   // Current valuation
                timing: 'Current Stage',
                raised: false
            },
            year1: { 
                name: 'Seed',
                amount: 55000,      // €50K = ~$55K
                timing: 'Year 1',
                raised: false
            },
            year2: { 
                name: '',
                amount: 0,
                timing: 'Year 2',
                raised: false
            },
            year3: { 
                name: '',
                amount: 0,
                timing: 'Year 3',
                raised: false
            },
            year4: { 
                name: '',
                amount: 0,
                timing: 'Year 4',
                raised: false
            },
            year5: { 
                name: '',
                amount: 0,
                timing: 'Year 5',
                raised: false
            }
        }
    };
}

// ⚡ INITIALIZE VALUATION SECTION
function initializeValuationSection() {
    console.log('💰 Initializing Valuation & Funding section...');
    
    renderCurrentValuation();
    renderValuationSummaryCards();
    renderValuationTable();
    renderMultipleSensitivityTable();
    renderFundingRoadmap();
    renderComparableCompanies();
    createValuationEvolutionChart();
    createDilutionChart();
    
    console.log('✅ Valuation section initialized');
}

// ⚡ CALCULATE DYNAMIC VALUATION
function calculateValuation(year) {
    const yearKey = `year${year}`;
    const roundData = FINANCIAL_DATA.valuation.rounds[yearKey];
    const yearData = year === 0 ? null : FINANCIAL_DATA.projections[yearKey];
    
    // Year 0 (Pre-Seed)
    if (year === 0) {
        return {
            year: 0,
            arr: 0,
            multiple: 0,
            preMoney: roundData.preMoney,
            postMoney: roundData.preMoney + roundData.amount,
            investmentAmount: roundData.amount,
            dilution: roundData.amount > 0 ? (roundData.amount / (roundData.preMoney + roundData.amount)) * 100 : 0,
            roundName: roundData.name,
            raised: roundData.raised
        };
    }
    
    if (!yearData) {
        console.error(`❌ No projection data for ${yearKey}`);
        return null;
    }
    
    // ARR = Subscription Revenue
    const arr = yearData.revenue.subscription * 1000;
    const multiple = FINANCIAL_DATA.valuation.arrMultiples[yearKey] || 5;
    const preMoney = arr * multiple;
    const investmentAmount = roundData.amount || 0;
    const postMoney = preMoney + investmentAmount;
    const dilution = investmentAmount > 0 ? (investmentAmount / postMoney) * 100 : 0;
    
    return {
        year,
        arr,
        multiple,
        preMoney,
        postMoney,
        investmentAmount,
        dilution,
        roundName: roundData.name || '',
        raised: roundData.raised
    };
}

// ⚡ RENDER CURRENT VALUATION
function renderCurrentValuation() {
    const container = document.getElementById('currentValuationSection');
    if (!container) return;
    
    const currentVal = FINANCIAL_DATA.valuation.preSeedValuation;
    const preSeed = FINANCIAL_DATA.valuation.rounds.year0;
    
    const html = `
        <div class="current-valuation-banner">
            <h3><i class="fas fa-seedling"></i> Current Stage: Pre-Seed (Pre-Revenue)</h3>
            <p>
                <strong>AlphaVault AI is currently in the pre-seed stage.</strong> 
                The platform is <strong>fully operational with 30+ features</strong>, deployed on production infrastructure, 
                but has <strong>not yet generated revenue</strong> and <strong>has not raised funding</strong>. 
                Current valuation: <strong>${formatCurrency(currentVal)} (~€400K)</strong>.
            </p>
            
            <div class="current-val-grid">
                <div class="current-val-card">
                    <h4>Current Valuation</h4>
                    <div class="val-amount">${formatCurrency(currentVal)}</div>
                    <div class="val-subtitle">~€400,000</div>
                </div>
                
                <div class="current-val-card">
                    <h4>Funding Raised</h4>
                    <div class="val-amount">$0</div>
                    <div class="val-subtitle">Bootstrap stage</div>
                </div>
                
                <div class="current-val-card">
                    <h4>Founder Ownership</h4>
                    <div class="val-amount">100%</div>
                    <div class="val-subtitle">No dilution yet</div>
                </div>
            </div>
            
            <p style="margin-top: 24px; font-size: 0.95rem; opacity: 0.9;">
                <i class="fas fa-lightbulb"></i> <strong>Next Steps:</strong> 
                Target <strong>€50K (~$55K) seed investment in Year 1</strong> to accelerate growth. 
                Edit ARR, investment amounts, and multiples in the table below to model different scenarios.
            </p>
        </div>
    `;
    
    container.innerHTML = html;
}

// ⚡ RENDER VALUATION SUMMARY CARDS
function renderValuationSummaryCards() {
    const container = document.getElementById('valuationSummaryCards');
    if (!container) return;
    
    const y0 = calculateValuation(0);
    const y1 = calculateValuation(1);
    const y5 = calculateValuation(5);
    
    const totalInvestment = [0, 1, 2, 3, 4, 5].reduce((sum, year) => {
        const val = calculateValuation(year);
        return sum + (val ? val.investmentAmount : 0);
    }, 0);
    
    const html = `
        <div class="valuation-summary-grid">
            <div class="val-summary-card">
                <div class="val-summary-header">
                    <div class="val-summary-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
                        <i class="fas fa-seedling"></i>
                    </div>
                    <div class="val-summary-label">Current Valuation</div>
                </div>
                <div class="val-summary-value">${formatCurrency(y0.preMoney)}</div>
                <div class="val-summary-subtitle">Pre-Seed (~€400K)</div>
            </div>
            
            <div class="val-summary-card">
                <div class="val-summary-header">
                    <div class="val-summary-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="val-summary-label">Year 5 Valuation</div>
                </div>
                <div class="val-summary-value">${formatCurrency(y5.preMoney)}</div>
                <div class="val-summary-subtitle">${y5.multiple}x ARR of ${formatCurrency(y5.arr)}</div>
            </div>
            
            <div class="val-summary-card">
                <div class="val-summary-header">
                    <div class="val-summary-icon" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                    <div class="val-summary-label">Total Investment</div>
                </div>
                <div class="val-summary-value">${formatCurrency(totalInvestment)}</div>
                <div class="val-summary-subtitle">Across all rounds (editable)</div>
            </div>
            
            <div class="val-summary-card">
                <div class="val-summary-header">
                    <div class="val-summary-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                        <i class="fas fa-chart-pie"></i>
                    </div>
                    <div class="val-summary-label">Final Ownership</div>
                </div>
                <div class="val-summary-value">${formatPercentage(100 - calculateTotalDilution(), 1)}</div>
                <div class="val-summary-subtitle">Founders after dilution</div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// ⚡ RENDER EDITABLE VALUATION TABLE
function renderValuationTable() {
    const container = document.getElementById('valuationTable');
    if (!container) return;
    
    const years = [0, 1, 2, 3, 4, 5];
    
    let html = `
        <div class="responsive-table-wrapper">
            <table class="financial-table editable-table">
                <thead>
                    <tr>
                        <th class="sticky-col">Metric</th>
                        <th>Pre-Seed</th>
                        <th>Year 1</th>
                        <th>Year 2</th>
                        <th>Year 3</th>
                        <th>Year 4</th>
                        <th>Year 5</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="section-header">
                        <td colspan="7"><i class="fas fa-sync-alt"></i> ARR Foundation (Editable)</td>
                    </tr>
                    <tr>
                        <td class="sticky-col">ARR (Subscription Revenue)</td>
    `;
    
    years.forEach(year => {
        const val = calculateValuation(year);
        if (year === 0) {
            html += `<td style="color: var(--text-light); font-style: italic;">Pre-revenue</td>`;
        } else {
            const yearKey = `year${year}`;
            html += `<td class="editable highlight" contenteditable="true" data-year="${yearKey}" data-field="projections.${yearKey}.revenue.subscription" data-type="arr">${formatCurrency(val.arr)}</td>`;
        }
    });
    
    html += `
                    </tr>
                    <tr>
                        <td class="sticky-col">ARR Multiple</td>
    `;
    
    years.forEach(year => {
        const yearKey = `year${year}`;
        const multiple = FINANCIAL_DATA.valuation.arrMultiples[yearKey];
        if (year === 0) {
            html += `<td>—</td>`;
        } else {
            html += `<td class="editable" contenteditable="true" data-year="${yearKey}" data-field="valuation.arrMultiples.${yearKey}" data-type="number">${multiple}x</td>`;
        }
    });
    
    html += `
                    </tr>
                    <tr class="section-header">
                        <td colspan="7"><i class="fas fa-dollar-sign"></i> Pre-Money Valuation (Calculated)</td>
                    </tr>
                    <tr class="highlight-row">
                        <td class="sticky-col"><strong>Pre-Money Valuation</strong></td>
    `;
    
    years.forEach(year => {
        const val = calculateValuation(year);
        html += `<td class="calculated highlight"><strong>${formatCurrency(val.preMoney)}</strong></td>`;
    });
    
    html += `
                    </tr>
                    <tr class="section-header">
                        <td colspan="7"><i class="fas fa-hand-holding-usd"></i> Investment (Editable)</td>
                    </tr>
                    <tr>
                        <td class="sticky-col">Round Name</td>
    `;
    
    years.forEach(year => {
        const yearKey = `year${year}`;
        const roundData = FINANCIAL_DATA.valuation.rounds[yearKey];
        html += `<td class="editable" contenteditable="true" data-year="${yearKey}" data-field="valuation.rounds.${yearKey}.name" data-type="text">${roundData.name || '—'}</td>`;
    });
    
    html += `
                    </tr>
                    <tr>
                        <td class="sticky-col">Investment Amount</td>
    `;
    
    years.forEach(year => {
        const yearKey = `year${year}`;
        const val = calculateValuation(year);
        html += `<td class="editable" contenteditable="true" data-year="${yearKey}" data-field="valuation.rounds.${yearKey}.amount" data-type="currency">${formatCurrency(val.investmentAmount)}</td>`;
    });
    
    html += `
                    </tr>
                    <tr class="highlight-row">
                        <td class="sticky-col"><strong>Post-Money Valuation</strong></td>
    `;
    
    years.forEach(year => {
        const val = calculateValuation(year);
        html += `<td class="calculated highlight"><strong>${formatCurrency(val.postMoney)}</strong></td>`;
    });
    
    html += `
                    </tr>
                    <tr>
                        <td class="sticky-col">Dilution (%)</td>
    `;
    
    years.forEach(year => {
        const val = calculateValuation(year);
        if (val.dilution > 0) {
            html += `<td class="calculated">${formatPercentage(val.dilution, 1)}</td>`;
        } else {
            html += `<td class="calculated">—</td>`;
        }
    });
    
    html += `
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="table-actions">
            <button class="bp-btn bp-btn-secondary" onclick="resetValuationData()">
                <i class="fas fa-undo"></i> Reset to Default
            </button>
            <button class="bp-btn bp-btn-success" onclick="saveBusinessPlanToFirestore()">
                <i class="fas fa-cloud-upload-alt"></i> Save to Cloud
            </button>
        </div>
        
        <div class="info-card" style="margin-top: 20px;">
            <p style="color: var(--text-light); line-height: 1.8;">
                <i class="fas fa-info-circle"></i> <strong>How to use:</strong> 
                Click on any cell in the "ARR", "ARR Multiple", "Round Name", or "Investment Amount" rows to edit values. 
                All calculations (pre-money, post-money, dilution) update automatically. 
                <strong>Editing ARR here will also update Financial Projections.</strong>
                Changes are auto-saved to the cloud after 2 seconds.
            </p>
        </div>
    `;
    
    container.innerHTML = html;
    attachValuationEditableListeners();
}

// ⚡ ATTACH EDITABLE LISTENERS TO VALUATION TABLE
function attachValuationEditableListeners() {
    const editableCells = document.querySelectorAll('#valuationTable .editable[contenteditable="true"]');
    
    editableCells.forEach(cell => {
        cell.addEventListener('focus', function() {
            this.dataset.original = this.textContent;
            this.classList.add('editing');
            
            const range = document.createRange();
            range.selectNodeContents(this);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        });
        
        cell.addEventListener('blur', function() {
            this.classList.remove('editing');
            
            const newValueRaw = this.textContent.trim();
            const field = this.dataset.field;
            const dataType = this.dataset.type;
            
            let newValue;
            
            if (dataType === 'text') {
                newValue = newValueRaw;
            } else if (dataType === 'currency' || dataType === 'arr') {
                newValue = parseEditableValue(newValueRaw);
            } else if (dataType === 'number') {
                newValue = parseFloat(newValueRaw.replace(/[^0-9.]/g, ''));
            }
            
            const originalValue = dataType === 'text' ? this.dataset.original : parseEditableValue(this.dataset.original);
            
            if (dataType === 'text' ? newValue === originalValue : Math.abs(newValue - originalValue) < 0.01) {
                console.log('🔄 No change detected');
                if (dataType === 'currency' || dataType === 'arr') {
                    this.textContent = formatCurrency(newValue);
                } else if (dataType === 'number') {
                    this.textContent = newValue + 'x';
                } else {
                    this.textContent = newValue || '—';
                }
                return;
            }
            
            console.log(`✏ Updating ${field}: ${originalValue} → ${newValue}`);
            
            // ✅ SPECIAL HANDLING FOR ARR CHANGES
            if (dataType === 'arr') {
                // Convert back to K (since stored as K in projections)
                const arrInK = newValue / 1000;
                updateFinancialDataField(field, arrInK);
                
                // Recalculate dependent financial data
                const yearKey = this.dataset.year;
                recalculateYearFinancials(yearKey);
            } else {
                updateValuationDataField(field, newValue);
            }
            
            if (dataType === 'currency' || dataType === 'arr') {
                this.textContent = formatCurrency(newValue);
            } else if (dataType === 'number') {
                this.textContent = newValue + 'x';
            } else {
                this.textContent = newValue || '—';
            }
            
            recalculateValuation();
            triggerAutoSave();
        });
        
        cell.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                this.textContent = this.dataset.original;
                this.blur();
            }
        });
        
        cell.addEventListener('paste', function(e) {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData).getData('text/plain');
            document.execCommand('insertText', false, text);
        });
    });
    
    console.log(`✅ Attached listeners to ${editableCells.length} valuation cells`);
}

// ⚡ UPDATE VALUATION DATA FIELD
function updateValuationDataField(field, value) {
    const keys = field.split('.');
    let ref = FINANCIAL_DATA;
    
    for (let i = 0; i < keys.length - 1; i++) {
        ref = ref[keys[i]];
    }
    
    ref[keys[keys.length - 1]] = value;
    console.log(`✏ Updated ${field} = ${value}`);
}

// ⚡ RECALCULATE YEAR FINANCIALS (when ARR is changed from Valuation section)
function recalculateYearFinancials(yearKey) {
    console.log(`🔄 Recalculating financials for ${yearKey} after ARR change...`);
    
    const data = FINANCIAL_DATA.projections[yearKey];
    
    // Recalculate affiliate revenue (10% of subscription)
    data.revenue.affiliate = data.revenue.subscription * 0.10;
    
    // Recalculate total revenue
    data.revenue.total = data.revenue.subscription + data.revenue.affiliate;
    
    // Recalculate EBITDA
    data.metrics.ebitda = data.revenue.total - data.expenses.total;
    data.metrics.ebitdaMargin = data.revenue.total > 0 ? (data.metrics.ebitda / data.revenue.total) * 100 : 0;
    
    // Recalculate MRR and ARR
    data.metrics.arr = data.revenue.subscription;
    data.metrics.mrr = data.revenue.subscription / 12;
    
    // Recalculate ARPU
    data.metrics.arpu = data.users.paid > 0 ? (data.revenue.subscription * 1000) / data.users.paid / 12 : 0;
    
    // Recalculate LTV
    const customerLifespan = 100 / data.metrics.churn;
    data.metrics.ltv = data.metrics.arpu * customerLifespan;
    
    console.log(`✅ ${yearKey} financials recalculated`);
    
    // Update Financial Projections table
    renderFinancialProjectionsTable();
    renderMetricsTable();
    updateProjectionSummaryCards();
    renderUnitEconomics();
    updateAllCharts();
}

// ⚡ RECALCULATE VALUATION
function recalculateValuation() {
    console.log('🔄 Recalculating valuation...');
    
    renderValuationSummaryCards();
    renderValuationTable();
    renderMultipleSensitivityTable();
    renderFundingRoadmap();
    renderComparableCompanies();
    
    if (chartInstances.valuationEvolution) {
        updateValuationEvolutionChart();
    }
    if (chartInstances.dilution) {
        updateDilutionChart();
    }
    
    console.log('✅ Valuation recalculated');
}

// ⚡ RESET VALUATION DATA
function resetValuationData() {
    if (!confirm('⚠ Reset valuation data to default values?')) return;
    
    FINANCIAL_DATA.valuation = {
        preSeedValuation: 450000,
        arrMultiples: {
            year0: 0,
            year1: 5,
            year2: 6,
            year3: 8,
            year4: 10,
            year5: 12
        },
        rounds: {
            year0: { name: 'Pre-Seed', amount: 0, preMoney: 450000, timing: 'Current Stage', raised: false },
            year1: { name: 'Seed', amount: 55000, timing: 'Year 1', raised: false },
            year2: { name: '', amount: 0, timing: 'Year 2', raised: false },
            year3: { name: '', amount: 0, timing: 'Year 3', raised: false },
            year4: { name: '', amount: 0, timing: 'Year 4', raised: false },
            year5: { name: '', amount: 0, timing: 'Year 5', raised: false }
        }
    };
    
    recalculateValuation();
    saveBusinessPlanToFirestore();
}

// ⚡ RENDER MULTIPLE SENSITIVITY
function renderMultipleSensitivityTable() {
    const container = document.getElementById('multipleSensitivityTable');
    if (!container) return;
    
    const year5ARR = FINANCIAL_DATA.projections.year5.revenue.subscription * 1000;
    
    let html = `
        <div class="responsive-table-wrapper">
            <table class="financial-table">
                <thead>
                    <tr>
                        <th>ARR Multiple</th>
                        <th>Year 5 Valuation</th>
                        <th>Benchmark</th>
                        <th>Typical Company Profile</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    const profiles = [
        { multiple: 5, benchmark: 'Low', profile: 'Early stage, low growth (<30% YoY)' },
        { multiple: 7, benchmark: 'Medium', profile: 'Growing SaaS, moderate margins (30-50% YoY)' },
        { multiple: 10, benchmark: 'High', profile: 'Strong growth, profitable (50-100% YoY)' },
        { multiple: 12, benchmark: 'Very High', profile: 'High-growth, market leader (>100% YoY)' },
        { multiple: 15, benchmark: 'Exceptional', profile: 'Hypergrowth unicorn trajectory' }
    ];
    
    profiles.forEach(p => {
        const valuation = year5ARR * p.multiple;
        const badgeClass = p.multiple <= 7 ? 'low' : (p.multiple <= 10 ? 'medium' : 'high');
        
        html += `
            <tr>
                <td><strong>${p.multiple}x</strong></td>
                <td class="highlight"><strong>${formatCurrency(valuation)}</strong></td>
                <td><span class="multiple-badge ${badgeClass}">${p.benchmark}</span></td>
                <td>${p.profile}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        
        <div class="info-card" style="margin-top: 20px;">
            <p style="color: var(--text-light); line-height: 1.8;">
                <i class="fas fa-chart-line"></i> <strong>Current Year 5 ARR:</strong> ${formatCurrency(year5ARR)} 
                (from Financial Projections, automatically synchronized).
            </p>
        </div>
    `;
    
    container.innerHTML = html;
}

// ⚡ RENDER FUNDING ROADMAP
function renderFundingRoadmap() {
    const container = document.getElementById('fundingRoadmap');
    if (!container) return;
    
    const years = [0, 1, 2, 3, 4, 5];
    const rounds = years.map(y => calculateValuation(y)).filter(v => v && (v.investmentAmount > 0 || v.year === 0));
    
    if (rounds.length === 0) {
        container.innerHTML = `
            <div class="info-card">
                <p style="color: var(--text-light);">
                    <i class="fas fa-info-circle"></i> No funding rounds configured. 
                    Edit investment amounts in the table above to model funding scenarios.
                </p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="funding-roadmap-timeline">';
    
    rounds.forEach(val => {
        const yearKey = `year${val.year}`;
        const roundData = FINANCIAL_DATA.valuation.rounds[yearKey];
        const color = val.year === 0 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                      val.year === 1 ? 'linear-gradient(135deg, #10b981, #059669)' :
                      val.year === 2 ? 'linear-gradient(135deg, #3b82f6, #2563eb)' :
                      'linear-gradient(135deg, #8b5cf6, #7c3aed)';
        const icon = val.year === 0 ? 'fa-seedling' : val.year === 1 ? 'fa-rocket' : 'fa-chart-line';
        
        html += `
            <div class="funding-round-item">
                <div class="round-marker" style="background: ${color};">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="round-content">
                    <h4>${val.roundName || 'Round'} — ${roundData.timing}</h4>
                    ${val.investmentAmount === 0 && val.year === 0 ? '<div style="display: inline-block; padding: 6px 16px; background: rgba(245, 158, 11, 0.1); border-radius: 20px; margin-bottom: 12px; font-size: 0.9rem; color: #f59e0b; font-weight: 700;">Bootstrap / No funding yet</div>' : ''}
                    
                    <div class="round-metrics">
                        ${val.arr > 0 ? `
                        <div class="round-metric">
                            <div class="round-metric-label">ARR</div>
                            <div class="round-metric-value">${formatCurrency(val.arr)}</div>
                        </div>
                        <div class="round-metric">
                            <div class="round-metric-label">ARR Multiple</div>
                            <div class="round-metric-value">${val.multiple}x</div>
                        </div>
                        ` : ''}
                        
                        <div class="round-metric">
                            <div class="round-metric-label">Investment</div>
                            <div class="round-metric-value">${formatCurrency(val.investmentAmount)}</div>
                        </div>
                        
                        <div class="round-metric">
                            <div class="round-metric-label">Pre-Money</div>
                            <div class="round-metric-value">${formatCurrency(val.preMoney)}</div>
                        </div>
                        
                        <div class="round-metric">
                            <div class="round-metric-label">Post-Money</div>
                            <div class="round-metric-value">${formatCurrency(val.postMoney)}</div>
                        </div>
                        
                        ${val.dilution > 0 ? `
                        <div class="round-metric">
                            <div class="round-metric-label">Dilution</div>
                            <div class="round-metric-value">${formatPercentage(val.dilution, 1)}</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    container.innerHTML = html;
}

// ⚡ RENDER COMPARABLE COMPANIES
function renderComparableCompanies() {
    const container = document.getElementById('comparableCompanies');
    if (!container) return;
    
    const year5ARR = FINANCIAL_DATA.projections.year5.revenue.subscription * 1000;
    const year5Multiple = FINANCIAL_DATA.valuation.arrMultiples.year5;
    
    const companies = [
        { name: 'TradingView', arr: 100000000, valuation: 1000000000, multiple: 10.0, stage: 'Series C' },
        { name: 'Robinhood', arr: 1500000000, valuation: 11700000000, multiple: 7.8, stage: 'Public' },
        { name: 'Webull', arr: 200000000, valuation: 1400000000, multiple: 7.0, stage: 'Series B' },
        { name: 'Morningstar Direct', arr: 500000000, valuation: 6000000000, multiple: 12.0, stage: 'Public' },
        { name: 'AlphaVault AI (Year 5)', arr: year5ARR, valuation: year5ARR * year5Multiple, multiple: year5Multiple, stage: 'Projected' }
    ];
    
    let html = `
        <div class="comparable-companies-table">
            <table>
                <thead>
                    <tr>
                        <th>Company</th>
                        <th>ARR</th>
                        <th>Valuation</th>
                        <th>ARR Multiple</th>
                        <th>Stage</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    companies.forEach((company) => {
        const multipleClass = company.multiple < 7 ? 'low' : (company.multiple < 10 ? 'medium' : 'high');
        const rowClass = company.name.includes('AlphaVault') ? 'highlight-row' : '';
        
        html += `
            <tr class="${rowClass}">
                <td><strong>${company.name}</strong></td>
                <td>${formatCurrency(company.arr)}</td>
                <td>${formatCurrency(company.valuation)}</td>
                <td><span class="multiple-badge ${multipleClass}">${company.multiple.toFixed(1)}x</span></td>
                <td>${company.stage}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        
        <div class="info-card" style="margin-top: 20px;">
            <p style="color: var(--text-light); line-height: 1.8;">
                <i class="fas fa-balance-scale"></i> <strong>Note:</strong> 
                AlphaVault AI's valuation is calculated dynamically based on your ARR projections and chosen multiple (both editable).
            </p>
        </div>
    `;
    
    container.innerHTML = html;
}

// ⚡ CREATE VALUATION EVOLUTION CHART
function createValuationEvolutionChart() {
    const ctx = document.getElementById('valuationEvolutionChart');
    if (!ctx) return;
    
    const years = [0, 1, 2, 3, 4, 5];
    const preMoneyData = years.map(y => calculateValuation(y).preMoney);
    const postMoneyData = years.map(y => calculateValuation(y).postMoney);
    
    chartInstances.valuationEvolution = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Pre-Seed', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
            datasets: [
                {
                    label: 'Pre-Money Valuation',
                    data: preMoneyData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                },
                {
                    label: 'Post-Money Valuation',
                    data: postMoneyData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            ...getResponsiveChartConfig('Valuation Evolution', 'Valuation ($)', '$', ''),
            plugins: {
                ...getResponsiveChartConfig('', '').plugins,
                title: {
                    display: true,
                    text: 'Company Valuation Growth (Pre-Money vs Post-Money)',
                    font: { size: isSmallMobile ? 13 : (isMobile ? 15 : 17), weight: 'bold' }
                }
            }
        }
    });
}

// ⚡ UPDATE VALUATION EVOLUTION CHART
function updateValuationEvolutionChart() {
    const years = [0, 1, 2, 3, 4, 5];
    const preMoneyData = years.map(y => calculateValuation(y).preMoney);
    const postMoneyData = years.map(y => calculateValuation(y).postMoney);
    
    chartInstances.valuationEvolution.data.datasets[0].data = preMoneyData;
    chartInstances.valuationEvolution.data.datasets[1].data = postMoneyData;
    chartInstances.valuationEvolution.update();
}

// ⚡ CREATE DILUTION CHART
function createDilutionChart() {
    const ctx = document.getElementById('dilutionChart');
    if (!ctx) return;
    
    const years = [0, 1, 2, 3, 4, 5];
    let founderOwnership = 100;
    const dilutionPerRound = [];
    const labels = [];
    
    years.forEach(year => {
        const val = calculateValuation(year);
        if (val && val.dilution > 0) {
            const prevOwnership = founderOwnership;
            founderOwnership = founderOwnership * (1 - val.dilution / 100);
            dilutionPerRound.push(prevOwnership - founderOwnership);
            labels.push(`${val.roundName || 'Round'} Y${year} (${(prevOwnership - founderOwnership).toFixed(1)}%)`);
        }
    });
    
    labels.unshift(`Founders (${founderOwnership.toFixed(1)}%)`);
    dilutionPerRound.unshift(founderOwnership);
    
    chartInstances.dilution = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dilutionPerRound,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: isMobile ? 'bottom' : 'right',
                    labels: {
                        font: { size: isSmallMobile ? 10 : (isMobile ? 11 : 13), weight: 'bold' },
                        padding: isSmallMobile ? 8 : (isMobile ? 10 : 18)
                    }
                },
                title: {
                    display: true,
                    text: `Ownership Structure (Founders: ${founderOwnership.toFixed(1)}%)`,
                    font: { size: isSmallMobile ? 13 : (isMobile ? 15 : 17), weight: 'bold' }
                }
            }
        }
    });
}

// ⚡ UPDATE DILUTION CHART
function updateDilutionChart() {
    const years = [0, 1, 2, 3, 4, 5];
    let founderOwnership = 100;
    const dilutionPerRound = [];
    const labels = [];
    
    years.forEach(year => {
        const val = calculateValuation(year);
        if (val && val.dilution > 0) {
            const prevOwnership = founderOwnership;
            founderOwnership = founderOwnership * (1 - val.dilution / 100);
            dilutionPerRound.push(prevOwnership - founderOwnership);
            labels.push(`${val.roundName || 'Round'} Y${year} (${(prevOwnership - founderOwnership).toFixed(1)}%)`);
        }
    });
    
    labels.unshift(`Founders (${founderOwnership.toFixed(1)}%)`);
    dilutionPerRound.unshift(founderOwnership);
    
    chartInstances.dilution.data.labels = labels;
    chartInstances.dilution.data.datasets[0].data = dilutionPerRound;
    chartInstances.dilution.options.plugins.title.text = `Ownership Structure (Founders: ${founderOwnership.toFixed(1)}%)`;
    chartInstances.dilution.update();
}

// ⚡ CALCULATE TOTAL DILUTION
function calculateTotalDilution() {
    const years = [0, 1, 2, 3, 4, 5];
    let founderOwnership = 100;
    
    years.forEach(year => {
        const val = calculateValuation(year);
        if (val && val.dilution > 0) {
            founderOwnership = founderOwnership * (1 - val.dilution / 100);
        }
    });
    
    return 100 - founderOwnership;
}

console.log('✅ Valuation & Funding Module Loaded (ARR Editable + Firestore Sync)');

console.log('🎉 Business Plan JavaScript v5.0 FIRESTORE ENABLED - Loaded Successfully');