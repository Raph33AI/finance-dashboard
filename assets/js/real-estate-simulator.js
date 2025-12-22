/* ==============================================
   REAL-ESTATE-SIMULATOR.JS - VERSION ULTRA-AVANCÉE
   ✅ Multi-Pays avec Fiscalité Complète
   ✅ Calcul Capacité d'Emprunt depuis Budget Dashboard
   ✅ Sauvegarde Firebase Cloud
   ✅ Comparaison Multi-Pays
   ✅ Charts Highcharts Premium
   ✅ Support Résidence Principale/Secondaire/Investissement Locatif
   ============================================== */

(function() {
    'use strict';
    
    const RealEstateSimulator = {
        // ========== STATE VARIABLES ==========
        currentSimulation: {
            id: null,
            name: 'New Simulation',
            country: null,
            propertyType: null,
            purchasePrice: 0,
            downPayment: 0,
            interestRate: 0,
            loanDuration: 0,
            monthlySalary: 0,
            city: '',
            monthlyRent: 0,
            occupancyRate: 90,
            monthlyCharges: 0,
            vacancyProvision: 1,
            createdAt: null,
            updatedAt: null,
            results: null
        },
        
        savedSimulations: [],
        isDarkMode: false,
        
        charts: {
            amortization: null,
            wealthEvolution: null,
            cashflow: null,
            comparison: null
        },
        
        // ========== TAX RULES BY COUNTRY ==========
        taxRules: {
            france: {
                name: 'France',
                flag: '🇫🇷',
                currency: 'EUR',
                currencySymbol: '€',
                notaryFees: 0.075, // 7.5%
                propertyTaxRate: 0.015, // 1.5% of purchase price annually
                capitalGainsTax: 0.362, // 36.2% (19% + 17.2% social charges)
                rentalIncomeTaxRate: 0.30, // Average marginal rate
                primaryResidenceExemption: true,
                wealthTaxThreshold: 1300000,
                wealthTaxRate: 0.005,
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: false, // No longer deductible in France
                    propertyTax: true,
                    managementFees: true
                },
                notes: 'Notary fees include registration tax (5.8%) + notary (1.2%) + land registry (0.5%)'
            },
            uk: {
                name: 'United Kingdom',
                flag: '🇬🇧',
                currency: 'GBP',
                currencySymbol: '£',
                notaryFees: 0.015, // Solicitor fees ~1.5%
                stampDuty: function(price) {
                    // SDLT calculator
                    if (price <= 250000) return 0;
                    if (price <= 925000) return (price - 250000) * 0.05;
                    if (price <= 1500000) return 33750 + (price - 925000) * 0.10;
                    return 91250 + (price - 1500000) * 0.12;
                },
                additionalPropertySurcharge: 0.03, // +3% for buy-to-let/second homes
                councilTax: 2000, // Average annual (in GBP)
                propertyTaxRate: 0, // Council tax is fixed, not percentage
                capitalGainsTax: 0.28, // 28% for property (higher rate)
                rentalIncomeTaxRate: 0.40, // 40% higher rate band
                primaryResidenceExemption: true,
                mortgageInterestRelief: 0.20, // Limited to 20% tax credit
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: true, // But limited to 20% credit
                    propertyTax: true,
                    managementFees: true
                },
                notes: 'SDLT rates shown are for additional properties (+3% surcharge)'
            },
            usa: {
                name: 'United States',
                flag: '🇺🇸',
                currency: 'USD',
                currencySymbol: '$',
                notaryFees: 0, // No notary in USA
                closingCosts: 0.035, // 3.5% average (title insurance, attorney, etc.)
                propertyTaxRate: 0.012, // 1.2% average (varies by state: 0.3% HI to 2.5% NJ)
                capitalGainsTax: 0.20, // 20% federal long-term (plus state)
                stateTaxRate: 0.05, // Average state tax 5%
                rentalIncomeTaxRate: 0.24, // 24% federal bracket
                primaryResidenceExemption: true,
                primaryResidenceExclusionSingle: 250000,
                primaryResidenceExclusionMarried: 500000,
                depreciation: {
                    enabled: true,
                    period: 27.5, // years for residential property
                    rate: 1 / 27.5
                },
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: true,
                    propertyTax: true,
                    managementFees: true,
                    depreciation: true,
                    insurance: true,
                    repairs: true
                },
                exchange1031: true, // Can defer capital gains
                notes: 'Property tax varies widely by state. Mortgage interest fully deductible for rentals.'
            },
            spain: {
                name: 'Spain',
                flag: '🇪🇸',
                currency: 'EUR',
                currencySymbol: '€',
                notaryFees: 0.015, // 1.5%
                transferTax: 0.08, // ITP 8% average (6-10% depending on region)
                registrationFees: 0.005, // 0.5%
                propertyTaxRate: 0.008, // IBI 0.8% of cadastral value
                capitalGainsTax: 0.23, // 19-26% progressive (average 23%)
                rentalIncomeTaxRate: 0.21, // 19-26% progressive
                nonResidentTax: 0.24, // 24% for EU non-residents
                rentalDeduction: 0.60, // 60% deduction for long-term rentals
                primaryResidenceExemption: true,
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: false,
                    propertyTax: true,
                    managementFees: true,
                    longTermRental: 0.60 // 60% deduction
                },
                notes: 'Transfer tax (ITP) varies by region: Catalonia 10%, Madrid 6%, Andalusia 8%'
            },
            portugal: {
                name: 'Portugal',
                flag: '🇵🇹',
                currency: 'EUR',
                currencySymbol: '€',
                notaryFees: 2000, // Fixed ~€2000
                transferTax: function(price, isPrimary) {
                    // IMT calculator
                    if (isPrimary && price <= 92407) return 0;
                    if (price <= 550000) return price * 0.06;
                    return price * 0.08;
                },
                stampDuty: 0.008, // 0.8%
                registrationFees: 500, // Fixed ~€500
                propertyTaxRate: 0.005, // IMI 0.3-0.8% average 0.5%
                capitalGainsTax: 0.24, // 50% of gain taxed at 48% marginal = ~24% effective
                rentalIncomeTaxFlat: 0.28, // Option 1: 28% flat
                rentalIncomeTaxMarginal: 0.48, // Option 2: Up to 48%
                primaryResidenceExemption: false,
                nhrRegime: {
                    enabled: true,
                    duration: 10, // 10 years
                    exemptions: ['foreign income', 'pensions']
                },
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: false,
                    propertyTax: true,
                    managementFees: true
                },
                notes: 'NHR regime offers 10-year tax benefits for new residents. IMT exempt for primary residence <€92,407'
            },
            germany: {
                name: 'Germany',
                flag: '🇩🇪',
                currency: 'EUR',
                currencySymbol: '€',
                notaryFees: 0.015, // 1.5%
                transferTax: 0.05, // Grunderwerbsteuer 3.5-6.5% (average 5%)
                registrationFees: 0.005, // 0.5%
                propertyTaxRate: 0.003, // Grundsteuer ~0.3% (varies)
                capitalGainsTax: 0.45, // Marginal rate up to 45% + 5.5% solidarity
                solidaritySurcharge: 0.055, // 5.5% on income tax
                rentalIncomeTaxRate: 0.42, // 42% marginal rate
                capitalGainsExemption: 10, // Exempt if held >10 years
                depreciation: {
                    enabled: true,
                    period: 50, // years
                    rate: 0.02 // 2% per year
                },
                primaryResidenceExemption: false,
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: true,
                    propertyTax: true,
                    managementFees: true,
                    depreciation: true,
                    maintenance: true
                },
                notes: 'Capital gains exempt if held >10 years. Transfer tax varies by state (3.5% Bavaria to 6.5% NRW)'
            },
            switzerland: {
                name: 'Switzerland',
                flag: '🇨🇭',
                currency: 'CHF',
                currencySymbol: 'CHF',
                notaryFees: 0.01, // 1%
                transferTax: 0.02, // 1-3% depending on canton (average 2%)
                registrationFees: 0.005, // 0.5%
                propertyTaxRate: 0.002, // 0.1-0.3% average 0.2%
                capitalGainsTax: 0.30, // 10-50% depending on canton & holding (average 30%)
                federalIncomeTax: 0.085, // 0.77-11.5% progressive (average 8.5%)
                cantonalIncomeTax: 0.10, // Varies by canton (average 10%)
                wealthTax: 0.005, // 0.3-1% on net assets (average 0.5%)
                imputedRentalValue: true, // Taxed even if owner-occupied
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: true,
                    propertyTax: false,
                    managementFees: true,
                    maintenance: true
                },
                notes: 'Taxes vary significantly by canton. Imputed rental value applies to owner-occupied properties.'
            },
            italy: {
                name: 'Italy',
                flag: '🇮🇹',
                currency: 'EUR',
                currencySymbol: '€',
                notaryFees: 0.02, // 1-2.5% average 2%
                registrationTax: function(isPrimary) {
                    return isPrimary ? 0.02 : 0.09; // 2% primary, 9% secondary
                },
                minimumRegistrationTax: 1000, // Minimum €1000
                propertyTaxRate: 0.008, // IMU 0.4-1.06% (average 0.8%, exempt for primary)
                capitalGainsTax: 0.26, // 26% (exempt if primary held >5 years)
                rentalIncomeTaxFlat: 0.21, // Cedolare Secca 21%
                rentalIncomeTaxMarginal: 0.35, // Progressive 23-43% (average 35%)
                primaryResidenceExemption: true,
                primaryResidencePropertyTaxExempt: true,
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: false,
                    propertyTax: true,
                    managementFees: true
                },
                notes: 'Primary residence exempt from IMU and capital gains (if held >5 years). Cedolare Secca is flat 21% on rental income.'
            },
            belgium: {
                name: 'Belgium',
                flag: '🇧🇪',
                currency: 'EUR',
                currencySymbol: '€',
                notaryFees: 5000, // Fixed ~€5000
                registrationDuty: function(region, isPrimary) {
                    if (region === 'flanders' && isPrimary) return 0.03; // 3%
                    if (region === 'flanders') return 0.12; // 12%
                    return 0.125; // 12.5% Wallonia/Brussels
                },
                propertyTaxRate: 0.01, // Précompte immobilier ~1%
                capitalGainsTax: 0, // Exempt if not habitual seller
                rentalIncomeTaxRate: 0.40, // Marginal rate 25-50% (average 40%)
                primaryResidenceExemption: true,
                mortgageInterestDeduction: 0.40, // Deductible in Flanders (being phased out)
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: true, // Only in Flanders, limited
                    propertyTax: true,
                    managementFees: true
                },
                notes: 'Registration duty: 3% for primary in Flanders, 12% secondary. Capital gains generally exempt.'
            },
            netherlands: {
                name: 'Netherlands',
                flag: '🇳🇱',
                currency: 'EUR',
                currencySymbol: '€',
                notaryFees: 2000, // Fixed ~€2000
                transferTax: function(isPrimary, age) {
                    if (isPrimary && age < 35) return 0; // Exempt for first-time buyers <35
                    if (isPrimary) return 0.02; // 2%
                    return 0.104; // 10.4% for investment
                },
                registrationFees: 500, // Fixed ~€500
                propertyTaxRate: 0.002, // OZB 0.1-0.3% of WOZ value (average 0.2%)
                capitalGainsTax: 0, // Not applicable (Box 3 wealth tax instead)
                box3WealthTax: 0.012, // ~1.2% on net assets >€57,000
                rentalIncomeTaxRate: 0.495, // 49.5% marginal rate (Box 1)
                mortgageInterestDeduction: 0.495, // Fully deductible for primary residence
                primaryResidenceExemption: true,
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: true, // Only for primary residence
                    propertyTax: false,
                    managementFees: true
                },
                notes: 'Transfer tax 0% for first-time buyers <35, 2% primary, 10.4% investment. Mortgage interest deductible (max 30 years).'
            }
        },
        
        // ========== INITIALIZATION ==========
        
        init: async function() {
            console.log('🏠 Real Estate Simulator - Initializing...');
            
            try {
                this.detectDarkMode();
                await this.waitForAuth();
                await this.loadSavedSimulations();
                await this.loadMonthlySalaryFromBudget();
                
                this.setupEventListeners();
                this.updateLastUpdate();
                this.setupDarkModeListener();
                
                console.log('✅ Real Estate Simulator initialized successfully');
                console.log(`📊 Loaded ${this.savedSimulations.length} saved simulations`);
                
            } catch (error) {
                console.error('❌ Init error:', error);
                this.showNotification('Failed to initialize', 'error');
            }
        },
        
        waitForAuth: async function() {
            return new Promise((resolve) => {
                if (!firebase || !firebase.auth) {
                    console.warn('⚠ Firebase not available');
                    resolve();
                    return;
                }
                
                const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                    if (user) {
                        console.log('✅ User authenticated:', user.email);
                    } else {
                        console.log('⚠ No user authenticated');
                    }
                    unsubscribe();
                    resolve();
                });
            });
        },
        
        detectDarkMode: function() {
            this.isDarkMode = document.documentElement.classList.contains('dark-mode') || 
                             document.body.classList.contains('dark-mode');
            console.log('🎨 Mode:', this.isDarkMode ? 'DARK' : 'LIGHT');
        },
        
        setupDarkModeListener: function() {
            const observer = new MutationObserver(() => {
                const wasDark = this.isDarkMode;
                this.detectDarkMode();
                
                if (wasDark !== this.isDarkMode) {
                    console.log('🌓 Dark mode toggled, updating charts...');
                    this.updateAllCharts();
                }
            });
            
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['class']
            });
        },
        
        updateLastUpdate: function() {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            const formatted = `${month}/${day}/${year} ${hours}:${minutes}`;
            
            const elem = document.getElementById('lastUpdate');
            if (elem) {
                elem.textContent = formatted;
            }
        },
        
        // ========== LOAD MONTHLY SALARY FROM BUDGET DASHBOARD ==========
        
        loadMonthlySalaryFromBudget: async function() {
            console.log('💰 Loading monthly salary from Budget Dashboard...');
            
            try {
                // Try to load from SimulationManager (Budget Dashboard)
                if (window.SimulationManager) {
                    const currentSimName = window.SimulationManager.getCurrentSimulationName() || 'default';
                    console.log(`🔄 Loading simulation "${currentSimName}" from Budget Dashboard...`);
                    
                    const budgetData = await window.SimulationManager.loadSimulation(currentSimName);
                    
                    if (budgetData && budgetData.data && Array.isArray(budgetData.data) && budgetData.data.length > 0) {
                        // Calculate average monthly net income
                        const totalIncome = budgetData.data.reduce((sum, row) => {
                            const salary = parseFloat(row.salary) || 0;
                            const otherIncome = parseFloat(row.otherIncome) || 0;
                            return sum + salary + otherIncome;
                        }, 0);
                        
                        const avgMonthlyIncome = totalIncome / budgetData.data.length;
                        
                        this.currentSimulation.monthlySalary = avgMonthlyIncome;
                        
                        const salaryInput = document.getElementById('inputMonthlySalary');
                        if (salaryInput) {
                            salaryInput.value = avgMonthlyIncome.toFixed(2);
                        }
                        
                        console.log(`✅ Loaded average monthly income: €${avgMonthlyIncome.toFixed(2)}`);
                        return;
                    }
                }
                
                // Fallback to localStorage
                const saved = localStorage.getItem('financialDataDynamic');
                if (saved) {
                    const data = JSON.parse(saved);
                    if (Array.isArray(data) && data.length > 0) {
                        const totalIncome = data.reduce((sum, row) => {
                            const salary = parseFloat(row.salary) || 0;
                            const otherIncome = parseFloat(row.otherIncome) || 0;
                            return sum + salary + otherIncome;
                        }, 0);
                        
                        const avgMonthlyIncome = totalIncome / data.length;
                        this.currentSimulation.monthlySalary = avgMonthlyIncome;
                        
                        const salaryInput = document.getElementById('inputMonthlySalary');
                        if (salaryInput) {
                            salaryInput.value = avgMonthlyIncome.toFixed(2);
                        }
                        
                        console.log(`✅ Loaded from localStorage: €${avgMonthlyIncome.toFixed(2)}`);
                        return;
                    }
                }
                
                console.warn('⚠ No budget data found. User must enter salary manually.');
                
            } catch (error) {
                console.error('❌ Error loading salary from budget:', error);
            }
        },
        
        // ========== EVENT LISTENERS ==========
        
        setupEventListeners: function() {
            const self = this;
            
            // Country & Property Type change
            const countrySelect = document.getElementById('selectCountry');
            const propertyTypeSelect = document.getElementById('selectPropertyType');
            
            if (countrySelect) {
                countrySelect.addEventListener('change', function() {
                    self.currentSimulation.country = this.value;
                    self.updateCurrentInfo();
                });
            }
            
            if (propertyTypeSelect) {
                propertyTypeSelect.addEventListener('change', function() {
                    self.currentSimulation.propertyType = this.value;
                    self.updateCurrentInfo();
                    self.toggleRentalSection(this.value === 'rental');
                });
            }
            
            // Calculate Button
            const btnCalculate = document.getElementById('btnCalculate');
            if (btnCalculate) {
                btnCalculate.addEventListener('click', () => this.calculateResults());
            }
            
            // Save Simulation Button
            const btnSave = document.getElementById('btnSaveSimulation');
            if (btnSave) {
                btnSave.addEventListener('click', () => this.openSaveModal());
            }
            
            // Confirm Save
            const btnConfirmSave = document.getElementById('btnConfirmSave');
            if (btnConfirmSave) {
                btnConfirmSave.addEventListener('click', () => this.saveSimulation());
            }
            
            // New Simulation
            const btnNew = document.getElementById('btnNewSimulation');
            if (btnNew) {
                btnNew.addEventListener('click', () => this.newSimulation());
            }
            
            // Rename Simulation
            const btnRename = document.getElementById('btnRenameSimulation');
            if (btnRename) {
                btnRename.addEventListener('click', () => this.renameSimulation());
            }
            
            // Reload Salary
            const btnLoadBudget = document.getElementById('btnLoadFromBudget');
            if (btnLoadBudget) {
                btnLoadBudget.addEventListener('click', () => this.loadMonthlySalaryFromBudget());
            }
            
            // Run Comparison
            const btnComparison = document.getElementById('btnRunComparison');
            if (btnComparison) {
                btnComparison.addEventListener('click', () => this.runMultiCountryComparison());
            }
            
            // Refresh Simulations
            const btnRefresh = document.getElementById('btnRefreshSimulations');
            if (btnRefresh) {
                btnRefresh.addEventListener('click', () => this.loadSavedSimulations());
            }
            
            // Export
            const btnExport = document.getElementById('btnExport');
            if (btnExport) {
                btnExport.addEventListener('click', () => this.exportToExcel());
            }
        },
        
        toggleRentalSection: function(show) {
            const section = document.getElementById('rentalIncomeSection');
            if (section) {
                section.style.display = show ? 'block' : 'none';
            }
        },
        
        updateCurrentInfo: function() {
            const countryEl = document.getElementById('currentCountry');
            const typeEl = document.getElementById('currentPropertyType');
            
            if (countryEl) {
                const rules = this.taxRules[this.currentSimulation.country];
                countryEl.textContent = rules ? `${rules.flag} ${rules.name}` : '---';
            }
            
            if (typeEl) {
                const types = {
                    primary: '🏠 Primary Residence',
                    secondary: '🏖 Secondary Residence',
                    rental: '💰 Rental Investment'
                };
                typeEl.textContent = types[this.currentSimulation.propertyType] || '---';
            }
        },
        
        // ========== CALCULATE RESULTS ==========
        
        calculateResults: function() {
            console.log('🧮 Calculating results...');
            
            // Gather inputs
            const country = document.getElementById('selectCountry').value;
            const propertyType = document.getElementById('selectPropertyType').value;
            const purchasePrice = parseFloat(document.getElementById('inputPurchasePrice').value) || 0;
            const downPayment = parseFloat(document.getElementById('inputDownPayment').value) || 0;
            const interestRate = parseFloat(document.getElementById('inputInterestRate').value) || 0;
            const loanDuration = parseInt(document.getElementById('selectLoanDuration').value) || 0;
            const monthlySalary = parseFloat(document.getElementById('inputMonthlySalary').value) || 0;
            const city = document.getElementById('inputCity').value.trim();
            
            // Rental inputs
            const monthlyRent = parseFloat(document.getElementById('inputMonthlyRent')?.value) || 0;
            const occupancyRate = parseFloat(document.getElementById('inputOccupancyRate')?.value) || 90;
            const monthlyCharges = parseFloat(document.getElementById('inputMonthlyCharges')?.value) || 0;
            const vacancyProvision = parseFloat(document.getElementById('inputVacancyProvision')?.value) || 1;
            
            // Validation
            if (!country) {
                alert('Please select a country');
                return;
            }
            
            if (!propertyType) {
                alert('Please select a property type');
                return;
            }
            
            if (purchasePrice <= 0) {
                alert('Please enter a valid purchase price');
                return;
            }
            
            if (downPayment < 0 || downPayment > purchasePrice) {
                alert('Please enter a valid down payment');
                return;
            }
            
            if (interestRate < 0 || interestRate > 15) {
                alert('Please enter a valid interest rate (0-15%)');
                return;
            }
            
            if (loanDuration <= 0) {
                alert('Please select a loan duration');
                return;
            }
            
            if (monthlySalary <= 0) {
                alert('Please enter your monthly salary or load it from Budget Dashboard');
                return;
            }
            
            // Update current simulation
            this.currentSimulation.country = country;
            this.currentSimulation.propertyType = propertyType;
            this.currentSimulation.purchasePrice = purchasePrice;
            this.currentSimulation.downPayment = downPayment;
            this.currentSimulation.interestRate = interestRate;
            this.currentSimulation.loanDuration = loanDuration;
            this.currentSimulation.monthlySalary = monthlySalary;
            this.currentSimulation.city = city;
            this.currentSimulation.monthlyRent = monthlyRent;
            this.currentSimulation.occupancyRate = occupancyRate;
            this.currentSimulation.monthlyCharges = monthlyCharges;
            this.currentSimulation.vacancyProvision = vacancyProvision;
            
            // Perform calculations
            const results = this.performCalculations();
            this.currentSimulation.results = results;
            
            // Update UI
            this.updateKPIs(results);
            this.updateBorrowingCapacity(results);
            this.updateTaxBreakdown(results);
            this.updateFinancialResults(results);
            this.createCharts(results);
            
            // Show sections
            document.getElementById('borrowingCapacitySection').style.display = 'block';
            document.getElementById('taxFeesSection').style.display = 'block';
            document.getElementById('financialResultsSection').style.display = 'block';
            document.getElementById('chartsSection').style.display = 'block';
            document.getElementById('comparisonSection').style.display = 'block';
            
            this.showNotification('✅ Calculation completed successfully!', 'success');
            this.updateLastUpdate();
        },
        
        performCalculations: function() {
            const sim = this.currentSimulation;
            const rules = this.taxRules[sim.country];
            const isPrimary = sim.propertyType === 'primary';
            const isRental = sim.propertyType === 'rental';
            
            const results = {};
            
            // ========== LOAN CALCULATIONS ==========
            const loanAmount = sim.purchasePrice - sim.downPayment;
            const monthlyRate = sim.interestRate / 100 / 12;
            const numberOfPayments = sim.loanDuration * 12;
            
            // Monthly mortgage payment (principal + interest)
            let monthlyPayment = 0;
            if (loanAmount > 0 && monthlyRate > 0) {
                monthlyPayment = loanAmount * 
                    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
            }
            
            results.loanAmount = loanAmount;
            results.monthlyPayment = monthlyPayment;
            results.numberOfPayments = numberOfPayments;
            
            // Total interest and amount paid
            results.totalAmountPaid = monthlyPayment * numberOfPayments;
            results.totalInterest = results.totalAmountPaid - loanAmount;
            
            // ========== TAX & FEES CALCULATIONS ==========
            let notaryFees = 0;
            let transferTax = 0;
            let stampDuty = 0;
            let closingCosts = 0;
            let registrationFees = 0;
            
            switch (sim.country) {
                case 'france':
                    notaryFees = sim.purchasePrice * rules.notaryFees;
                    break;
                    
                case 'uk':
                    notaryFees = sim.purchasePrice * rules.notaryFees;
                    stampDuty = rules.stampDuty(sim.purchasePrice);
                    if (!isPrimary) {
                        stampDuty += sim.purchasePrice * rules.additionalPropertySurcharge;
                    }
                    break;
                    
                case 'usa':
                    closingCosts = sim.purchasePrice * rules.closingCosts;
                    break;
                    
                case 'spain':
                    notaryFees = sim.purchasePrice * rules.notaryFees;
                    transferTax = sim.purchasePrice * rules.transferTax;
                    registrationFees = sim.purchasePrice * rules.registrationFees;
                    break;
                    
                case 'portugal':
                    notaryFees = rules.notaryFees; // Fixed
                    transferTax = rules.transferTax(sim.purchasePrice, isPrimary);
                    stampDuty = sim.purchasePrice * rules.stampDuty;
                    registrationFees = rules.registrationFees; // Fixed
                    break;
                    
                case 'germany':
                    notaryFees = sim.purchasePrice * rules.notaryFees;
                    transferTax = sim.purchasePrice * rules.transferTax;
                    registrationFees = sim.purchasePrice * rules.registrationFees;
                    break;
                    
                case 'switzerland':
                    notaryFees = sim.purchasePrice * rules.notaryFees;
                    transferTax = sim.purchasePrice * rules.transferTax;
                    registrationFees = sim.purchasePrice * rules.registrationFees;
                    break;
                    
                case 'italy':
                    notaryFees = sim.purchasePrice * rules.notaryFees;
                    transferTax = sim.purchasePrice * rules.registrationTax(isPrimary);
                    transferTax = Math.max(transferTax, rules.minimumRegistrationTax);
                    break;
                    
                case 'belgium':
                    notaryFees = rules.notaryFees; // Fixed
                    transferTax = sim.purchasePrice * rules.registrationDuty('flanders', isPrimary);
                    break;
                    
                case 'netherlands':
                    notaryFees = rules.notaryFees; // Fixed
                    transferTax = sim.purchasePrice * rules.transferTax(isPrimary, 30); // Assume age 30
                    registrationFees = rules.registrationFees; // Fixed
                    break;
            }
            
            results.notaryFees = notaryFees;
            results.transferTax = transferTax;
            results.stampDuty = stampDuty;
            results.closingCosts = closingCosts;
            results.registrationFees = registrationFees;
            
            results.totalAcquisitionFees = notaryFees + transferTax + stampDuty + closingCosts + registrationFees;
            results.totalCost = sim.purchasePrice + results.totalAcquisitionFees;
            
            // Annual property tax
            let annualPropertyTax = 0;
            if (sim.country === 'uk') {
                annualPropertyTax = rules.councilTax;
            } else if (rules.propertyTaxRate) {
                annualPropertyTax = sim.purchasePrice * rules.propertyTaxRate;
            }
            
            results.annualPropertyTax = annualPropertyTax;
            results.monthlyPropertyTax = annualPropertyTax / 12;
            
            // Insurance (estimate 0.3% annually)
            results.annualInsurance = sim.purchasePrice * 0.003;
            results.monthlyInsurance = results.annualInsurance / 12;
            
            // Total monthly payment
            results.totalMonthlyPayment = monthlyPayment + results.monthlyPropertyTax + results.monthlyInsurance;
            
            // ========== BORROWING CAPACITY ==========
            const maxDebtRatio = 0.33; // 33% max
            const maxMonthlyPayment = sim.monthlySalary * maxDebtRatio;
            
            // Calculate max borrowing capacity
            let maxBorrowingCapacity = 0;
            if (monthlyRate > 0) {
                maxBorrowingCapacity = maxMonthlyPayment * 
                    (Math.pow(1 + monthlyRate, numberOfPayments) - 1) / 
                    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));
            }
            
            results.maxBorrowingCapacity = maxBorrowingCapacity;
            results.maxMonthlyPayment = maxMonthlyPayment;
            results.debtRatio = (results.totalMonthlyPayment / sim.monthlySalary) * 100;
            results.remainingBudget = sim.monthlySalary - results.totalMonthlyPayment;
            
            // ========== RENTAL INVESTMENT CALCULATIONS ==========
            if (isRental) {
                const grossAnnualRent = sim.monthlyRent * 12;
                const adjustedRent = grossAnnualRent * (sim.occupancyRate / 100);
                const annualCharges = sim.monthlyCharges * 12;
                const vacancyLoss = sim.monthlyRent * sim.vacancyProvision;
                
                results.grossAnnualRent = grossAnnualRent;
                results.adjustedRent = adjustedRent - annualCharges - vacancyLoss;
                results.netAnnualRent = results.adjustedRent;
                
                results.grossYield = (grossAnnualRent / sim.purchasePrice) * 100;
                
                // Net yield after taxes
                let rentalTax = 0;
                if (sim.country === 'spain' && rules.rentalDeduction) {
                    rentalTax = results.netAnnualRent * (1 - rules.rentalDeduction) * rules.rentalIncomeTaxRate;
                } else if (sim.country === 'portugal') {
                    rentalTax = results.netAnnualRent * rules.rentalIncomeTaxFlat; // Use flat rate
                } else {
                    rentalTax = results.netAnnualRent * (rules.rentalIncomeTaxRate || 0.30);
                }
                
                results.rentalTax = rentalTax;
                results.netRentAfterTax = results.netAnnualRent - rentalTax - annualPropertyTax;
                results.netYield = (results.netRentAfterTax / sim.purchasePrice) * 100;
                
                results.monthlyCashflow = (results.netRentAfterTax / 12) - monthlyPayment;
            } else {
                results.grossYield = 0;
                results.netYield = 0;
                results.monthlyCashflow = 0;
            }
            
            // ========== WEALTH EVOLUTION ==========
            results.wealthEvolution = this.calculateWealthEvolution(sim, results);
            
            // ========== AMORTIZATION SCHEDULE ==========
            results.amortizationSchedule = this.calculateAmortizationSchedule(loanAmount, monthlyRate, numberOfPayments, monthlyPayment);
            
            console.log('✅ Calculations completed:', results);
            return results;
        },
        
        calculateAmortizationSchedule: function(principal, monthlyRate, numberOfPayments, monthlyPayment) {
            const schedule = [];
            let remainingPrincipal = principal;
            
            for (let month = 1; month <= numberOfPayments; month++) {
                const interestPayment = remainingPrincipal * monthlyRate;
                const principalPayment = monthlyPayment - interestPayment;
                remainingPrincipal -= principalPayment;
                
                schedule.push({
                    month: month,
                    payment: monthlyPayment,
                    principal: principalPayment,
                    interest: interestPayment,
                    balance: Math.max(0, remainingPrincipal)
                });
            }
            
            return schedule;
        },
        
        calculateWealthEvolution: function(sim, results) {
            const evolution = [];
            const appreciationRate = 0.03; // 3% annual property appreciation
            const isRental = sim.propertyType === 'rental';
            
            let propertyValue = sim.purchasePrice;
            let loanBalance = results.loanAmount;
            let cumulativeRent = 0;
            
            for (let year = 0; year <= 30; year++) {
                if (year > 0) {
                    propertyValue *= (1 + appreciationRate);
                    
                    // Reduce loan balance
                    const annualPrincipal = results.monthlyPayment * 12 - (loanBalance * (sim.interestRate / 100));
                    loanBalance = Math.max(0, loanBalance - annualPrincipal);
                    
                    if (isRental) {
                        cumulativeRent += results.netRentAfterTax;
                    }
                }
                
                const equity = propertyValue - loanBalance;
                const netWealth = equity + cumulativeRent - sim.downPayment - results.totalAcquisitionFees;
                
                evolution.push({
                    year: year,
                    propertyValue: propertyValue,
                    loanBalance: loanBalance,
                    equity: equity,
                    cumulativeRent: cumulativeRent,
                    netWealth: netWealth
                });
            }
            
            return evolution;
        },
        
        // ========== UPDATE UI ==========
        
        updateKPIs: function(results) {
            const sim = this.currentSimulation;
            const rules = this.taxRules[sim.country];
            
            document.getElementById('kpiPurchasePrice').textContent = this.formatCurrency(sim.purchasePrice, rules.currencySymbol);
            document.getElementById('kpiDownPayment').textContent = this.formatCurrency(sim.downPayment, rules.currencySymbol);
            document.getElementById('kpiMonthlyPayment').textContent = this.formatCurrency(results.totalMonthlyPayment, rules.currencySymbol);
            document.getElementById('kpiNetYield').textContent = results.netYield.toFixed(2) + '%';
            document.getElementById('kpiTotalCost').textContent = this.formatCurrency(results.totalCost, rules.currencySymbol);
            
            const debtRatioEl = document.getElementById('kpiDebtRatio');
            debtRatioEl.textContent = results.debtRatio.toFixed(1) + '%';
            
            if (results.debtRatio <= 33) {
                debtRatioEl.style.color = '#10b981';
            } else if (results.debtRatio <= 40) {
                debtRatioEl.style.color = '#f59e0b';
            } else {
                debtRatioEl.style.color = '#ef4444';
            }
        },
        
        updateBorrowingCapacity: function(results) {
            const sim = this.currentSimulation;
            const rules = this.taxRules[sim.country];
            
            document.getElementById('maxBorrowingCapacity').textContent = this.formatCurrency(results.maxBorrowingCapacity, rules.currencySymbol);
            document.getElementById('yourDebtRatio').textContent = results.debtRatio.toFixed(1) + '%';
            document.getElementById('remainingBudget').textContent = this.formatCurrency(results.remainingBudget, rules.currencySymbol);
            
            const statusEl = document.getElementById('debtRatioStatus');
            if (results.debtRatio <= 33) {
                statusEl.textContent = '✅ Healthy';
                statusEl.style.color = '#10b981';
            } else if (results.debtRatio <= 40) {
                statusEl.textContent = '⚠ Warning';
                statusEl.style.color = '#f59e0b';
            } else {
                statusEl.textContent = '❌ Risky';
                statusEl.style.color = '#ef4444';
            }
            
            const fillEl = document.getElementById('debtRatioFill');
            fillEl.style.width = Math.min(results.debtRatio, 100) + '%';
            
            if (results.debtRatio <= 33) {
                fillEl.style.background = 'linear-gradient(90deg, #10b981, #059669)';
            } else if (results.debtRatio <= 40) {
                fillEl.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
            } else {
                fillEl.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
            }
        },
        
        updateTaxBreakdown: function(results) {
            const sim = this.currentSimulation;
            const rules = this.taxRules[sim.country];
            
            const countryBadge = document.getElementById('countryBadge');
            if (countryBadge) {
                countryBadge.textContent = `${rules.flag} ${rules.name}`;
            }
            
            const taxGrid = document.getElementById('taxGrid');
            if (!taxGrid) return;
            
            let html = '';
            
            if (results.notaryFees > 0) {
                html += this.createTaxCard('Notary Fees', results.notaryFees, rules.currencySymbol, 'fa-file-signature');
            }
            
            if (results.transferTax > 0) {
                const label = sim.country === 'spain' ? 'Transfer Tax (ITP)' :
                             sim.country === 'uk' ? 'Stamp Duty Land Tax' :
                             sim.country === 'germany' ? 'Property Transfer Tax' :
                             'Transfer Tax';
                html += this.createTaxCard(label, results.transferTax, rules.currencySymbol, 'fa-exchange-alt');
            }
            
            if (results.stampDuty > 0) {
                html += this.createTaxCard('Stamp Duty', results.stampDuty, rules.currencySymbol, 'fa-stamp');
            }
            
            if (results.closingCosts > 0) {
                html += this.createTaxCard('Closing Costs', results.closingCosts, rules.currencySymbol, 'fa-file-contract');
            }
            
            if (results.registrationFees > 0) {
                html += this.createTaxCard('Registration Fees', results.registrationFees, rules.currencySymbol, 'fa-registered');
            }
            
            if (results.annualPropertyTax > 0) {
                const label = sim.country === 'france' ? 'Property Tax (Taxe Foncière)' :
                             sim.country === 'uk' ? 'Council Tax' :
                             sim.country === 'spain' ? 'Property Tax (IBI)' :
                             'Property Tax';
                html += this.createTaxCard(label, results.annualPropertyTax, rules.currencySymbol, 'fa-home', true);
            }
            
            taxGrid.innerHTML = html;
            
            document.getElementById('totalAcquisitionFees').textContent = this.formatCurrency(results.totalAcquisitionFees, rules.currencySymbol);
            document.getElementById('annualTaxes').textContent = this.formatCurrency(results.annualPropertyTax, rules.currencySymbol);
            document.getElementById('totalCostWithFees').textContent = this.formatCurrency(results.totalCost, rules.currencySymbol);
        },
        
        createTaxCard: function(label, amount, currency, icon, isAnnual = false) {
            return `
                <div class='tax-card'>
                    <div class='tax-icon'>
                        <i class='fas ${icon}'></i>
                    </div>
                    <div class='tax-content'>
                        <h4>${label}</h4>
                        <div class='tax-amount'>${this.formatCurrency(amount, currency)}</div>
                        ${isAnnual ? '<small class="tax-frequency">Per Year</small>' : '<small class="tax-frequency">One-Time</small>'}
                    </div>
                </div>
            `;
        },
        
        updateFinancialResults: function(results) {
            const sim = this.currentSimulation;
            const rules = this.taxRules[sim.country];
            const isRental = sim.propertyType === 'rental';
            
            document.getElementById('monthlyPrincipalInterest').textContent = this.formatCurrency(results.monthlyPayment, rules.currencySymbol);
            document.getElementById('monthlyPropertyTax').textContent = this.formatCurrency(results.monthlyPropertyTax, rules.currencySymbol);
            document.getElementById('monthlyInsurance').textContent = this.formatCurrency(results.monthlyInsurance, rules.currencySymbol);
            document.getElementById('totalMonthlyPayment').textContent = this.formatCurrency(results.totalMonthlyPayment, rules.currencySymbol);
            
            // Rental section
            const rentalCard = document.getElementById('rentalResultCard');
            if (rentalCard) {
                rentalCard.style.display = isRental ? 'block' : 'none';
                
                if (isRental) {
                    const grossRent = sim.monthlyRent * (sim.occupancyRate / 100);
                    const charges = sim.monthlyCharges + (sim.monthlyRent * sim.vacancyProvision / 12);
                    const netRent = grossRent - charges;
                    
                    document.getElementById('grossMonthlyRent').textContent = this.formatCurrency(grossRent, rules.currencySymbol);
                    document.getElementById('rentalCharges').textContent = '-' + this.formatCurrency(charges, rules.currencySymbol);
                    document.getElementById('netRentalIncome').textContent = this.formatCurrency(netRent, rules.currencySymbol);
                    document.getElementById('monthlyCashflow').textContent = this.formatCurrency(results.monthlyCashflow, rules.currencySymbol);
                    
                    const cashflowEl = document.getElementById('monthlyCashflow');
                    cashflowEl.style.color = results.monthlyCashflow >= 0 ? '#10b981' : '#ef4444';
                }
            }
            
            // Investment metrics
            document.getElementById('grossYield').textContent = results.grossYield.toFixed(2) + '%';
            document.getElementById('netYield').textContent = results.netYield.toFixed(2) + '%';
            document.getElementById('totalInterest').textContent = this.formatCurrency(results.totalInterest, rules.currencySymbol);
            document.getElementById('totalAmountPaid').textContent = this.formatCurrency(results.totalAmountPaid, rules.currencySymbol);
            
            // Cashflow chart visibility
            const cashflowContainer = document.getElementById('cashflowChartContainer');
            if (cashflowContainer) {
                cashflowContainer.style.display = isRental ? 'block' : 'none';
            }
        },
        
        // ========== CHARTS ==========
        
        createCharts: function(results) {
            this.createAmortizationChart(results);
            this.createWealthEvolutionChart(results);
            
            if (this.currentSimulation.propertyType === 'rental') {
                this.createCashflowChart(results);
            }
        },
        
        createAmortizationChart: function(results) {
            const container = document.getElementById('amortizationChart');
            if (!container) return;
            
            const schedule = results.amortizationSchedule;
            const years = schedule.filter((_, i) => i % 12 === 0);
            
            const chartColors = this.getChartColors();
            
            if (this.charts.amortization) {
                this.charts.amortization.destroy();
            }
            
            this.charts.amortization = Highcharts.chart('amortizationChart', {
                chart: {
                    type: 'area',
                    backgroundColor: 'transparent',
                    style: { fontFamily: 'Inter, sans-serif' }
                },
                title: {
                    text: '',
                    style: { color: chartColors.title }
                },
                xAxis: {
                    categories: years.map(item => 'Year ' + Math.floor(item.month / 12)),
                    labels: { style: { color: chartColors.text } },
                    gridLineColor: chartColors.gridLine,
                    lineColor: chartColors.axisLine
                },
                yAxis: {
                    title: { text: 'Amount', style: { color: chartColors.title } },
                    labels: { style: { color: chartColors.text } },
                    gridLineColor: chartColors.gridLine
                },
                tooltip: {
                    shared: true,
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    style: { color: chartColors.text },
                    valuePrefix: this.taxRules[this.currentSimulation.country].currencySymbol
                },
                plotOptions: {
                    area: {
                        stacking: 'normal',
                        lineWidth: 2,
                        marker: { enabled: false }
                    }
                },
                series: [{
                    name: 'Principal Payment',
                    data: years.map(item => item.principal),
                    color: '#10b981'
                }, {
                    name: 'Interest Payment',
                    data: years.map(item => item.interest),
                    color: '#ef4444'
                }, {
                    name: 'Remaining Balance',
                    data: years.map(item => item.balance),
                    color: '#3b82f6',
                    type: 'line',
                    stacking: undefined
                }],
                credits: { enabled: false },
                legend: {
                    itemStyle: { color: chartColors.text }
                }
            });
        },
        
        createWealthEvolutionChart: function(results) {
            const container = document.getElementById('wealthEvolutionChart');
            if (!container) return;
            
            const evolution = results.wealthEvolution.filter((_, i) => i % 5 === 0 || i === 10 || i === 20 || i === 30);
            const chartColors = this.getChartColors();
            
            if (this.charts.wealthEvolution) {
                this.charts.wealthEvolution.destroy();
            }
            
            this.charts.wealthEvolution = Highcharts.chart('wealthEvolutionChart', {
                chart: {
                    type: 'line',
                    backgroundColor: 'transparent',
                    style: { fontFamily: 'Inter, sans-serif' }
                },
                title: {
                    text: '',
                    style: { color: chartColors.title }
                },
                xAxis: {
                    categories: evolution.map(item => 'Year ' + item.year),
                    labels: { style: { color: chartColors.text } },
                    gridLineColor: chartColors.gridLine,
                    lineColor: chartColors.axisLine
                },
                yAxis: {
                    title: { text: 'Value', style: { color: chartColors.title } },
                    labels: { style: { color: chartColors.text } },
                    gridLineColor: chartColors.gridLine
                },
                tooltip: {
                    shared: true,
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    style: { color: chartColors.text },
                    valuePrefix: this.taxRules[this.currentSimulation.country].currencySymbol
                },
                plotOptions: {
                    line: {
                        lineWidth: 3,
                        marker: { enabled: true, radius: 4 }
                    }
                },
                series: [{
                    name: 'Property Value',
                    data: evolution.map(item => item.propertyValue),
                    color: '#3b82f6'
                }, {
                    name: 'Loan Balance',
                    data: evolution.map(item => item.loanBalance),
                    color: '#ef4444'
                }, {
                    name: 'Equity',
                    data: evolution.map(item => item.equity),
                    color: '#10b981'
                }, {
                    name: 'Net Wealth',
                    data: evolution.map(item => item.netWealth),
                    color: '#8b5cf6',
                    dashStyle: 'Dash'
                }],
                credits: { enabled: false },
                legend: {
                    itemStyle: { color: chartColors.text }
                }
            });
        },
        
        createCashflowChart: function(results) {
            const container = document.getElementById('cashflowChart');
            if (!container) return;
            
            const years = [];
            const cashflows = [];
            
            for (let year = 1; year <= 10; year++) {
                years.push('Year ' + year);
                cashflows.push(results.monthlyCashflow * 12);
            }
            
            const chartColors = this.getChartColors();
            
            if (this.charts.cashflow) {
                this.charts.cashflow.destroy();
            }
            
            this.charts.cashflow = Highcharts.chart('cashflowChart', {
                chart: {
                    type: 'column',
                    backgroundColor: 'transparent',
                    style: { fontFamily: 'Inter, sans-serif' }
                },
                title: {
                    text: '',
                    style: { color: chartColors.title }
                },
                xAxis: {
                    categories: years,
                    labels: { style: { color: chartColors.text } },
                    gridLineColor: chartColors.gridLine,
                    lineColor: chartColors.axisLine
                },
                yAxis: {
                    title: { text: 'Annual Cashflow', style: { color: chartColors.title } },
                    labels: { style: { color: chartColors.text } },
                    gridLineColor: chartColors.gridLine
                },
                tooltip: {
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    style: { color: chartColors.text },
                    valuePrefix: this.taxRules[this.currentSimulation.country].currencySymbol
                },
                plotOptions: {
                    column: {
                        borderRadius: 8,
                        dataLabels: {
                            enabled: true,
                            style: { color: chartColors.text }
                        }
                    }
                },
                series: [{
                    name: 'Annual Cashflow',
                    data: cashflows,
                    color: cashflows[0] >= 0 ? '#10b981' : '#ef4444'
                }],
                credits: { enabled: false },
                legend: { enabled: false }
            });
        },
        
        updateAllCharts: function() {
            if (this.currentSimulation.results) {
                this.createCharts(this.currentSimulation.results);
            }
        },
        
        getChartColors: function() {
            if (this.isDarkMode) {
                return {
                    text: '#ffffff',
                    gridLine: 'rgba(255, 255, 255, 0.1)',
                    background: 'transparent',
                    title: '#ffffff',
                    subtitle: '#cccccc',
                    axisLine: 'rgba(255, 255, 255, 0.2)',
                    tooltipBg: 'rgba(30, 30, 30, 0.95)',
                    tooltipBorder: '#555'
                };
            } else {
                return {
                    text: '#1f2937',
                    gridLine: 'rgba(0, 0, 0, 0.08)',
                    background: 'transparent',
                    title: '#111827',
                    subtitle: '#6b7280',
                    axisLine: 'rgba(0, 0, 0, 0.1)',
                    tooltipBg: 'rgba(255, 255, 255, 0.97)',
                    tooltipBorder: '#e5e7eb'
                };
            }
        },
        
        // ========== MULTI-COUNTRY COMPARISON ==========
        
        runMultiCountryComparison: function() {
            console.log('🌍 Running multi-country comparison...');
            
            if (!this.currentSimulation.results) {
                alert('Please calculate results first');
                return;
            }
            
            const compareCountries = ['france', 'uk', 'usa', 'spain', 'portugal'];
            const comparisonData = {};
            
            const originalCountry = this.currentSimulation.country;
            
            compareCountries.forEach(country => {
                this.currentSimulation.country = country;
                const results = this.performCalculations();
                comparisonData[country] = results;
            });
            
            this.currentSimulation.country = originalCountry;
            
            this.displayComparison(comparisonData);
            this.createComparisonChart(comparisonData);
        },
        
        displayComparison: function(data) {
            const tbody = document.getElementById('comparisonTableBody');
            if (!tbody) return;
            
            const metrics = [
                { label: 'Total Acquisition Cost', key: 'totalCost' },
                { label: 'Monthly Mortgage Payment', key: 'totalMonthlyPayment' },
                { label: 'Annual Property Tax', key: 'annualPropertyTax' },
                { label: 'Net Rental Yield', key: 'netYield', suffix: '%' },
                { label: 'Debt Ratio', key: 'debtRatio', suffix: '%' }
            ];
            
            let html = '';
            
            metrics.forEach(metric => {
                html += '<tr>';
                html += `<td><strong>${metric.label}</strong></td>`;
                
                ['france', 'uk', 'usa', 'spain', 'portugal'].forEach(country => {
                    const rules = this.taxRules[country];
                    const value = data[country][metric.key];
                    
                    let formatted;
                    if (metric.suffix === '%') {
                        formatted = value.toFixed(2) + '%';
                    } else {
                        formatted = this.formatCurrency(value, rules.currencySymbol);
                    }
                    
                    html += `<td>${formatted}</td>`;
                });
                
                html += '</tr>';
            });
            
            tbody.innerHTML = html;
        },
        
        createComparisonChart: function(data) {
            const container = document.getElementById('comparisonChart');
            if (!container) return;
            
            const chartColors = this.getChartColors();
            
            const countries = ['france', 'uk', 'usa', 'spain', 'portugal'];
            const countryNames = countries.map(c => this.taxRules[c].name);
            
            if (this.charts.comparison) {
                this.charts.comparison.destroy();
            }
            
            this.charts.comparison = Highcharts.chart('comparisonChart', {
                chart: {
                    type: 'column',
                    backgroundColor: 'transparent',
                    style: { fontFamily: 'Inter, sans-serif' }
                },
                title: {
                    text: 'Total Cost Comparison by Country',
                    style: { color: chartColors.title }
                },
                xAxis: {
                    categories: countryNames,
                    labels: { style: { color: chartColors.text } },
                    gridLineColor: chartColors.gridLine,
                    lineColor: chartColors.axisLine
                },
                yAxis: {
                    title: { text: 'Total Cost', style: { color: chartColors.title } },
                    labels: { style: { color: chartColors.text } },
                    gridLineColor: chartColors.gridLine
                },
                tooltip: {
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    style: { color: chartColors.text }
                },
                plotOptions: {
                    column: {
                        borderRadius: 8,
                        dataLabels: {
                            enabled: true,
                            style: { color: chartColors.text }
                        }
                    }
                },
                series: [{
                    name: 'Total Cost',
                    data: countries.map(c => data[c].totalCost),
                    color: '#3b82f6'
                }],
                credits: { enabled: false },
                legend: { enabled: false }
            });
        },
        
        // ========== SAVE/LOAD SIMULATIONS ==========
        
        openSaveModal: function() {
            if (!this.currentSimulation.results) {
                alert('Please calculate results first');
                return;
            }
            
            const modal = document.getElementById('modalSaveSimulation');
            if (modal) {
                const nameInput = document.getElementById('simulationName');
                if (nameInput) {
                    nameInput.value = this.currentSimulation.name !== 'New Simulation' ? 
                                     this.currentSimulation.name : 
                                     `${this.taxRules[this.currentSimulation.country].name} ${this.currentSimulation.propertyType} ${new Date().toLocaleDateString()}`;
                }
                
                modal.classList.add('active');
            }
        },
        
        saveSimulation: async function() {
            const name = document.getElementById('simulationName').value.trim();
            const notes = document.getElementById('simulationNotes').value.trim();
            
            if (!name) {
                alert('Please enter a simulation name');
                return;
            }
            
            this.currentSimulation.name = name;
            this.currentSimulation.notes = notes;
            this.currentSimulation.updatedAt = new Date().toISOString();
            
            if (!this.currentSimulation.createdAt) {
                this.currentSimulation.createdAt = this.currentSimulation.updatedAt;
            }
            
            if (!this.currentSimulation.id) {
                this.currentSimulation.id = 'local_' + Date.now();
            }
            
            // Save to Firestore
            const savedId = await this.saveToFirestore(this.currentSimulation);
            
            if (savedId) {
                this.currentSimulation.id = savedId;
            }
            
            // Update local array
            const index = this.savedSimulations.findIndex(s => s.id === this.currentSimulation.id);
            if (index !== -1) {
                this.savedSimulations[index] = JSON.parse(JSON.stringify(this.currentSimulation));
            } else {
                this.savedSimulations.push(JSON.parse(JSON.stringify(this.currentSimulation)));
            }
            
            this.saveToLocalStorage();
            this.renderSavedSimulations();
            this.closeModal('modalSaveSimulation');
            this.showNotification(`✅ Simulation "${name}" saved successfully!`, 'success');
            this.updateCurrentInfo();
        },
        
        saveToFirestore: async function(simulation) {
            if (!firebase || !firebase.auth || !firebase.auth().currentUser) {
                console.warn('⚠ No user authenticated, saving to localStorage only');
                return null;
            }
            
            try {
                const user = firebase.auth().currentUser;
                const db = firebase.firestore();
                
                const isLocalId = !simulation.id || simulation.id.toString().startsWith('local_');
                
                const simData = {
                    name: simulation.name,
                    country: simulation.country,
                    propertyType: simulation.propertyType,
                    purchasePrice: simulation.purchasePrice,
                    downPayment: simulation.downPayment,
                    interestRate: simulation.interestRate,
                    loanDuration: simulation.loanDuration,
                    monthlySalary: simulation.monthlySalary,
                    city: simulation.city,
                    monthlyRent: simulation.monthlyRent,
                    occupancyRate: simulation.occupancyRate,
                    monthlyCharges: simulation.monthlyCharges,
                    vacancyProvision: simulation.vacancyProvision,
                    notes: simulation.notes || '',
                    results: simulation.results
                };
                
                let docId;
                
                if (isLocalId) {
                    simData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                    simData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                    
                    const docRef = await db.collection('users')
                        .doc(user.uid)
                        .collection('realEstateSimulations')
                        .add(simData);
                    
                    docId = docRef.id;
                    console.log(`✅ Simulation "${simulation.name}" CREATED in Firestore with ID: ${docId}`);
                } else {
                    simData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                    
                    await db.collection('users')
                        .doc(user.uid)
                        .collection('realEstateSimulations')
                        .doc(simulation.id)
                        .set(simData, { merge: true });
                    
                    docId = simulation.id;
                    console.log(`✅ Simulation "${simulation.name}" UPDATED in Firestore`);
                }
                
                return docId;
                
            } catch (error) {
                console.error('❌ Error saving to Firestore:', error);
                this.showNotification('Failed to save to cloud: ' + error.message, 'error');
                return null;
            }
        },
        
        saveToLocalStorage: function() {
            try {
                localStorage.setItem('realEstateSimulations', JSON.stringify(this.savedSimulations));
                console.log('💾 Simulations backed up to localStorage');
            } catch (error) {
                console.error('❌ Error saving to localStorage:', error);
            }
        },
        
        loadSavedSimulations: async function() {
            console.log('📥 Loading saved simulations...');
            
            let loadedFromCloud = false;
            
            if (firebase && firebase.auth && firebase.auth().currentUser) {
                try {
                    const user = firebase.auth().currentUser;
                    const db = firebase.firestore();
                    
                    const snapshot = await db.collection('users')
                        .doc(user.uid)
                        .collection('realEstateSimulations')
                        .orderBy('updatedAt', 'desc')
                        .get();
                    
                    if (!snapshot.empty) {
                        this.savedSimulations = snapshot.docs.map(doc => {
                            const data = doc.data();
                            return {
                                id: doc.id,
                                name: data.name,
                                country: data.country,
                                propertyType: data.propertyType,
                                purchasePrice: data.purchasePrice,
                                downPayment: data.downPayment,
                                interestRate: data.interestRate,
                                loanDuration: data.loanDuration,
                                monthlySalary: data.monthlySalary,
                                city: data.city,
                                monthlyRent: data.monthlyRent,
                                occupancyRate: data.occupancyRate,
                                monthlyCharges: data.monthlyCharges,
                                vacancyProvision: data.vacancyProvision,
                                notes: data.notes,
                                results: data.results,
                                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
                            };
                        });
                        
                        loadedFromCloud = true;
                        console.log(`✅ Loaded ${this.savedSimulations.length} simulations from Firestore`);
                        
                        this.saveToLocalStorage();
                    }
                } catch (error) {
                    console.error('❌ Error loading from Firestore:', error);
                }
            }
            
            if (!loadedFromCloud) {
                const saved = localStorage.getItem('realEstateSimulations');
                if (saved) {
                    try {
                        this.savedSimulations = JSON.parse(saved);
                        console.log(`✅ Loaded ${this.savedSimulations.length} simulations from localStorage`);
                    } catch (error) {
                        console.error('❌ Error parsing localStorage:', error);
                        this.savedSimulations = [];
                    }
                } else {
                    this.savedSimulations = [];
                }
            }
            
            this.renderSavedSimulations();
        },
        
        renderSavedSimulations: function() {
            const container = document.getElementById('savedSimulationsList');
            if (!container) return;
            
            if (this.savedSimulations.length === 0) {
                container.innerHTML = `
                    <div class='simulations-empty'>
                        <i class='fas fa-inbox'></i>
                        <p>No saved simulations yet</p>
                        <small>Fill the form above and click "Save Simulation"</small>
                    </div>
                `;
                return;
            }
            
            const self = this;
            container.innerHTML = this.savedSimulations.map(sim => {
                const rules = this.taxRules[sim.country];
                const date = new Date(sim.updatedAt || sim.createdAt);
                
                return `
                    <div class='simulation-card' data-sim-id='${sim.id}'>
                        <div class='sim-header'>
                            <h4>${this.escapeHtml(sim.name)}</h4>
                            <span class='sim-country'>${rules.flag} ${rules.name}</span>
                        </div>
                        <div class='sim-body'>
                            <div class='sim-info'>
                                <span><i class='fas fa-home'></i> ${this.formatPropertyType(sim.propertyType)}</span>
                                <span><i class='fas fa-tag'></i> ${this.formatCurrency(sim.purchasePrice, rules.currencySymbol)}</span>
                                <span><i class='fas fa-percent'></i> ${sim.interestRate}% / ${sim.loanDuration}y</span>
                            </div>
                            <div class='sim-metrics'>
                                <div class='sim-metric'>
                                    <small>Monthly Payment</small>
                                    <strong>${this.formatCurrency(sim.results?.totalMonthlyPayment || 0, rules.currencySymbol)}</strong>
                                </div>
                                <div class='sim-metric'>
                                    <small>Net Yield</small>
                                    <strong>${(sim.results?.netYield || 0).toFixed(2)}%</strong>
                                </div>
                            </div>
                        </div>
                        <div class='sim-footer'>
                            <small><i class='fas fa-clock'></i> ${date.toLocaleDateString()}</small>
                            <div class='sim-actions'>
                                <button class='btn-icon-sm' onclick='RealEstateSimulator.loadSimulation("${sim.id}")' title='Load'>
                                    <i class='fas fa-upload'></i>
                                </button>
                                <button class='btn-icon-sm' onclick='RealEstateSimulator.duplicateSimulation("${sim.id}")' title='Duplicate'>
                                    <i class='fas fa-copy'></i>
                                </button>
                                <button class='btn-icon-sm' onclick='RealEstateSimulator.deleteSimulation("${sim.id}")' title='Delete'>
                                    <i class='fas fa-trash'></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        },
        
        loadSimulation: function(simId) {
            const sim = this.savedSimulations.find(s => s.id === simId);
            if (!sim) {
                alert('Simulation not found');
                return;
            }
            
            this.currentSimulation = JSON.parse(JSON.stringify(sim));
            
            // Populate form
            document.getElementById('selectCountry').value = sim.country;
            document.getElementById('selectPropertyType').value = sim.propertyType;
            document.getElementById('inputPurchasePrice').value = sim.purchasePrice;
            document.getElementById('inputDownPayment').value = sim.downPayment;
            document.getElementById('inputInterestRate').value = sim.interestRate;
            document.getElementById('selectLoanDuration').value = sim.loanDuration;
            document.getElementById('inputMonthlySalary').value = sim.monthlySalary;
            document.getElementById('inputCity').value = sim.city;
            
            if (sim.propertyType === 'rental') {
                document.getElementById('inputMonthlyRent').value = sim.monthlyRent;
                document.getElementById('inputOccupancyRate').value = sim.occupancyRate;
                document.getElementById('inputMonthlyCharges').value = sim.monthlyCharges;
                document.getElementById('inputVacancyProvision').value = sim.vacancyProvision;
                this.toggleRentalSection(true);
            } else {
                this.toggleRentalSection(false);
            }
            
            this.updateCurrentInfo();
            
            if (sim.results) {
                this.updateKPIs(sim.results);
                this.updateBorrowingCapacity(sim.results);
                this.updateTaxBreakdown(sim.results);
                this.updateFinancialResults(sim.results);
                this.createCharts(sim.results);
                
                document.getElementById('borrowingCapacitySection').style.display = 'block';
                document.getElementById('taxFeesSection').style.display = 'block';
                document.getElementById('financialResultsSection').style.display = 'block';
                document.getElementById('chartsSection').style.display = 'block';
            }
            
            this.showNotification(`✅ Loaded simulation "${sim.name}"`, 'success');
        },
        
        duplicateSimulation: function(simId) {
            const sim = this.savedSimulations.find(s => s.id === simId);
            if (!sim) return;
            
            const duplicate = JSON.parse(JSON.stringify(sim));
            duplicate.id = 'local_' + Date.now();
            duplicate.name = sim.name + ' (Copy)';
            duplicate.createdAt = new Date().toISOString();
            duplicate.updatedAt = new Date().toISOString();
            
            this.savedSimulations.push(duplicate);
            this.saveToLocalStorage();
            this.renderSavedSimulations();
            this.showNotification(`✅ Simulation duplicated as "${duplicate.name}"`, 'success');
        },
        
        deleteSimulation: async function(simId) {
            const sim = this.savedSimulations.find(s => s.id === simId);
            if (!sim) return;
            
            if (!confirm(`Delete simulation "${sim.name}"?\n\nThis action cannot be undone.`)) {
                return;
            }
            
            // Remove from local array
            this.savedSimulations = this.savedSimulations.filter(s => s.id !== simId);
            
            // Delete from Firestore
            const isLocalId = simId.toString().startsWith('local_');
            if (!isLocalId && firebase && firebase.auth && firebase.auth().currentUser) {
                try {
                    const user = firebase.auth().currentUser;
                    const db = firebase.firestore();
                    
                    await db.collection('users')
                        .doc(user.uid)
                        .collection('realEstateSimulations')
                        .doc(simId)
                        .delete();
                    
                    console.log(`✅ Simulation "${sim.name}" deleted from Firestore`);
                } catch (error) {
                    console.error('❌ Error deleting from Firestore:', error);
                }
            }
            
            this.saveToLocalStorage();
            this.renderSavedSimulations();
            this.showNotification(`Simulation "${sim.name}" deleted`, 'success');
        },
        
        newSimulation: function() {
            if (confirm('Create a new simulation? Any unsaved changes will be lost.')) {
                this.currentSimulation = {
                    id: null,
                    name: 'New Simulation',
                    country: null,
                    propertyType: null,
                    purchasePrice: 0,
                    downPayment: 0,
                    interestRate: 0,
                    loanDuration: 0,
                    monthlySalary: 0,
                    city: '',
                    monthlyRent: 0,
                    occupancyRate: 90,
                    monthlyCharges: 0,
                    vacancyProvision: 1,
                    createdAt: null,
                    updatedAt: null,
                    results: null
                };
                
                // Reset form
                document.getElementById('selectCountry').value = '';
                document.getElementById('selectPropertyType').value = '';
                document.getElementById('inputPurchasePrice').value = '';
                document.getElementById('inputDownPayment').value = '';
                document.getElementById('inputInterestRate').value = '';
                document.getElementById('selectLoanDuration').value = '';
                document.getElementById('inputCity').value = '';
                document.getElementById('inputMonthlyRent').value = '';
                document.getElementById('inputOccupancyRate').value = '90';
                document.getElementById('inputMonthlyCharges').value = '';
                document.getElementById('inputVacancyProvision').value = '1';
                
                this.toggleRentalSection(false);
                this.updateCurrentInfo();
                
                // Hide result sections
                document.getElementById('borrowingCapacitySection').style.display = 'none';
                document.getElementById('taxFeesSection').style.display = 'none';
                document.getElementById('financialResultsSection').style.display = 'none';
                document.getElementById('chartsSection').style.display = 'none';
                document.getElementById('comparisonSection').style.display = 'none';
                
                this.showNotification('✅ New simulation created', 'success');
            }
        },
        
        renameSimulation: function() {
            const newName = prompt('Enter new name for this simulation:', this.currentSimulation.name);
            
            if (!newName || newName.trim() === '') {
                return;
            }
            
            this.currentSimulation.name = newName.trim();
            document.getElementById('currentSimulationName').textContent = newName.trim();
            this.showNotification('✅ Simulation renamed', 'success');
        },
        
        // ========== EXPORT ==========
        
        exportToExcel: function() {
            if (!this.currentSimulation.results) {
                alert('Please calculate results first');
                return;
            }
            
            this.showNotification('🚧 Export feature coming soon!', 'info');
        },
        
        // ========== UTILITIES ==========
        
        formatCurrency: function(value, symbol = '€') {
            return symbol + ' ' + value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        },
        
        formatPropertyType: function(type) {
            const types = {
                primary: '🏠 Primary',
                secondary: '🏖 Secondary',
                rental: '💰 Rental'
            };
            return types[type] || type;
        },
        
        escapeHtml: function(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        },
        
        closeModal: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
            }
        },
        
        openModal: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
            }
        },
        
        showNotification: function(message, type = 'info') {
            console.log(`[${type.toUpperCase()}] ${message}`);
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                font-weight: 600;
                animation: slideIn 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    };
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => RealEstateSimulator.init());
    } else {
        RealEstateSimulator.init();
    }
    
    // Expose globally
    window.RealEstateSimulator = RealEstateSimulator;
    
})();

// Notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);