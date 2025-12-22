/* ==============================================
   REAL-ESTATE-SIMULATOR.JS - VERSION CORRIGÉE
   ✅ Multi-Pays avec Fiscalité Complète
   ✅ Calcul Capacité d'Emprunt depuis Budget Dashboard
   ✅ Sauvegarde Firebase Cloud
   ✅ Comparaison Multi-Pays
   ✅ Charts Highcharts Premium
   🔧 CORRECTIONS : Event Listeners + Salary Loading
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
                notaryFees: 0.075,
                propertyTaxRate: 0.015,
                capitalGainsTax: 0.362,
                rentalIncomeTaxRate: 0.30,
                primaryResidenceExemption: true,
                wealthTaxThreshold: 1300000,
                wealthTaxRate: 0.005,
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: false,
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
                notaryFees: 0.015,
                stampDuty: function(price) {
                    if (price <= 250000) return 0;
                    if (price <= 925000) return (price - 250000) * 0.05;
                    if (price <= 1500000) return 33750 + (price - 925000) * 0.10;
                    return 91250 + (price - 1500000) * 0.12;
                },
                additionalPropertySurcharge: 0.03,
                councilTax: 2000,
                propertyTaxRate: 0,
                capitalGainsTax: 0.28,
                rentalIncomeTaxRate: 0.40,
                primaryResidenceExemption: true,
                mortgageInterestRelief: 0.20,
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: true,
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
                notaryFees: 0,
                closingCosts: 0.035,
                propertyTaxRate: 0.012,
                capitalGainsTax: 0.20,
                stateTaxRate: 0.05,
                rentalIncomeTaxRate: 0.24,
                primaryResidenceExemption: true,
                primaryResidenceExclusionSingle: 250000,
                primaryResidenceExclusionMarried: 500000,
                depreciation: {
                    enabled: true,
                    period: 27.5,
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
                exchange1031: true,
                notes: 'Property tax varies widely by state. Mortgage interest fully deductible for rentals.'
            },
            spain: {
                name: 'Spain',
                flag: '🇪🇸',
                currency: 'EUR',
                currencySymbol: '€',
                notaryFees: 0.015,
                transferTax: 0.08,
                registrationFees: 0.005,
                propertyTaxRate: 0.008,
                capitalGainsTax: 0.23,
                rentalIncomeTaxRate: 0.21,
                nonResidentTax: 0.24,
                rentalDeduction: 0.60,
                primaryResidenceExemption: true,
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: false,
                    propertyTax: true,
                    managementFees: true,
                    longTermRental: 0.60
                },
                notes: 'Transfer tax (ITP) varies by region: Catalonia 10%, Madrid 6%, Andalusia 8%'
            },
            portugal: {
                name: 'Portugal',
                flag: '🇵🇹',
                currency: 'EUR',
                currencySymbol: '€',
                notaryFees: 2000,
                transferTax: function(price, isPrimary) {
                    if (isPrimary && price <= 92407) return 0;
                    if (price <= 550000) return price * 0.06;
                    return price * 0.08;
                },
                stampDuty: 0.008,
                registrationFees: 500,
                propertyTaxRate: 0.005,
                capitalGainsTax: 0.24,
                rentalIncomeTaxFlat: 0.28,
                rentalIncomeTaxMarginal: 0.48,
                primaryResidenceExemption: false,
                nhrRegime: {
                    enabled: true,
                    duration: 10,
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
                notaryFees: 0.015,
                transferTax: 0.05,
                registrationFees: 0.005,
                propertyTaxRate: 0.003,
                capitalGainsTax: 0.45,
                solidaritySurcharge: 0.055,
                rentalIncomeTaxRate: 0.42,
                capitalGainsExemption: 10,
                depreciation: {
                    enabled: true,
                    period: 50,
                    rate: 0.02
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
                notaryFees: 0.01,
                transferTax: 0.02,
                registrationFees: 0.005,
                propertyTaxRate: 0.002,
                capitalGainsTax: 0.30,
                federalIncomeTax: 0.085,
                cantonalIncomeTax: 0.10,
                wealthTax: 0.005,
                imputedRentalValue: true,
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
                notaryFees: 0.02,
                registrationTax: function(isPrimary) {
                    return isPrimary ? 0.02 : 0.09;
                },
                minimumRegistrationTax: 1000,
                propertyTaxRate: 0.008,
                capitalGainsTax: 0.26,
                rentalIncomeTaxFlat: 0.21,
                rentalIncomeTaxMarginal: 0.35,
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
                notaryFees: 5000,
                registrationDuty: function(region, isPrimary) {
                    if (region === 'flanders' && isPrimary) return 0.03;
                    if (region === 'flanders') return 0.12;
                    return 0.125;
                },
                propertyTaxRate: 0.01,
                capitalGainsTax: 0,
                rentalIncomeTaxRate: 0.40,
                primaryResidenceExemption: true,
                mortgageInterestDeduction: 0.40,
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: true,
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
                notaryFees: 2000,
                transferTax: function(isPrimary, age) {
                    if (isPrimary && age < 35) return 0;
                    if (isPrimary) return 0.02;
                    return 0.104;
                },
                registrationFees: 500,
                propertyTaxRate: 0.002,
                capitalGainsTax: 0,
                box3WealthTax: 0.012,
                rentalIncomeTaxRate: 0.495,
                mortgageInterestDeduction: 0.495,
                primaryResidenceExemption: true,
                deductions: {
                    rentalCharges: true,
                    mortgageInterest: true,
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
        
        // ========== 🔧 CORRECTION : LOAD MONTHLY SALARY FROM BUDGET DASHBOARD ==========
        
        loadMonthlySalaryFromBudget: async function() {
            console.log('💰 Loading monthly salary from Budget Dashboard...');
            
            const salaryInput = document.getElementById('inputMonthlySalary');
            
            try {
                let avgMonthlyIncome = 0;
                let loadedFromCloud = false;
                
                // 🔧 MÉTHODE 1 : Essayer de charger depuis Firestore directement
                if (firebase && firebase.auth && firebase.auth().currentUser) {
                    const user = firebase.auth().currentUser;
                    const db = firebase.firestore();
                    
                    console.log('🔄 Attempting to load from Firestore...');
                    
                    try {
                        // Essayer de charger toutes les simulations budget
                        const snapshot = await db.collection('users')
                            .doc(user.uid)
                            .collection('budgetSimulations')
                            .orderBy('updatedAt', 'desc')
                            .limit(1)
                            .get();
                        
                        if (!snapshot.empty) {
                            const doc = snapshot.docs[0];
                            const data = doc.data();
                            
                            console.log('✅ Found budget simulation in Firestore:', doc.id);
                            
                            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                                // Calculer le revenu mensuel moyen
                                const totalIncome = data.data.reduce((sum, row) => {
                                    const salary = parseFloat(row.salary) || 0;
                                    const otherIncome = parseFloat(row.otherIncome) || 0;
                                    return sum + salary + otherIncome;
                                }, 0);
                                
                                avgMonthlyIncome = totalIncome / data.data.length;
                                loadedFromCloud = true;
                                
                                console.log(`✅ Calculated average monthly income from Firestore: €${avgMonthlyIncome.toFixed(2)}`);
                            }
                        } else {
                            console.warn('⚠ No budget simulations found in Firestore');
                        }
                    } catch (firestoreError) {
                        console.error('❌ Firestore query error:', firestoreError);
                    }
                }
                
                // 🔧 MÉTHODE 2 : Si pas trouvé dans Firestore, essayer SimulationManager
                if (!loadedFromCloud && window.SimulationManager) {
                    console.log('🔄 Trying SimulationManager...');
                    
                    try {
                        const currentSimName = window.SimulationManager.getCurrentSimulationName() || 'default';
                        console.log(`   Loading simulation "${currentSimName}"...`);
                        
                        const budgetData = await window.SimulationManager.loadSimulation(currentSimName);
                        
                        if (budgetData && budgetData.data && Array.isArray(budgetData.data) && budgetData.data.length > 0) {
                            const totalIncome = budgetData.data.reduce((sum, row) => {
                                const salary = parseFloat(row.salary) || 0;
                                const otherIncome = parseFloat(row.otherIncome) || 0;
                                return sum + salary + otherIncome;
                            }, 0);
                            
                            avgMonthlyIncome = totalIncome / budgetData.data.length;
                            loadedFromCloud = true;
                            
                            console.log(`✅ Loaded from SimulationManager: €${avgMonthlyIncome.toFixed(2)}`);
                        }
                    } catch (smError) {
                        console.error('❌ SimulationManager error:', smError);
                    }
                }
                
                // 🔧 MÉTHODE 3 : Fallback vers localStorage
                if (!loadedFromCloud) {
                    console.log('🔄 Trying localStorage...');
                    
                    const saved = localStorage.getItem('financialDataDynamic');
                    if (saved) {
                        try {
                            const data = JSON.parse(saved);
                            if (Array.isArray(data) && data.length > 0) {
                                const totalIncome = data.reduce((sum, row) => {
                                    const salary = parseFloat(row.salary) || 0;
                                    const otherIncome = parseFloat(row.otherIncome) || 0;
                                    return sum + salary + otherIncome;
                                }, 0);
                                
                                avgMonthlyIncome = totalIncome / data.length;
                                console.log(`✅ Loaded from localStorage: €${avgMonthlyIncome.toFixed(2)}`);
                            }
                        } catch (parseError) {
                            console.error('❌ Error parsing localStorage:', parseError);
                        }
                    }
                }
                
                // 🔧 Mettre à jour l'input
                if (avgMonthlyIncome > 0) {
                    this.currentSimulation.monthlySalary = avgMonthlyIncome;
                    
                    if (salaryInput) {
                        salaryInput.value = avgMonthlyIncome.toFixed(2);
                    }
                    
                    console.log(`✅ Final monthly salary set: €${avgMonthlyIncome.toFixed(2)}`);
                    this.showNotification(`✅ Monthly salary loaded: €${avgMonthlyIncome.toFixed(2)}`, 'success');
                } else {
                    console.warn('⚠ No budget data found. User must enter salary manually.');
                    this.showNotification('⚠ No salary data found. Please enter manually or fill Budget Dashboard first.', 'warning');
                }
                
            } catch (error) {
                console.error('❌ Error loading salary from budget:', error);
                this.showNotification('Error loading salary from budget', 'error');
            }
        },
        
        // ========== 🔧 CORRECTION : EVENT LISTENERS ==========
        
        setupEventListeners: function() {
            console.log('🔧 Setting up event listeners...');
            
            const self = this;
            
            // 🔧 Country & Property Type change
            const countrySelect = document.getElementById('selectCountry');
            const propertyTypeSelect = document.getElementById('selectPropertyType');
            
            if (countrySelect) {
                countrySelect.addEventListener('change', function() {
                    console.log('📍 Country changed to:', this.value);
                    self.currentSimulation.country = this.value;
                    self.updateCurrentInfo();
                });
            } else {
                console.error('❌ Element #selectCountry not found!');
            }
            
            if (propertyTypeSelect) {
                propertyTypeSelect.addEventListener('change', function() {
                    console.log('🏠 Property type changed to:', this.value);
                    self.currentSimulation.propertyType = this.value;
                    self.updateCurrentInfo();
                    self.toggleRentalSection(this.value === 'rental');
                });
            } else {
                console.error('❌ Element #selectPropertyType not found!');
            }
            
            // 🔧 Calculate Button
            const btnCalculate = document.getElementById('btnCalculate');
            if (btnCalculate) {
                btnCalculate.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('🧮 Calculate button clicked!');
                    self.calculateResults();
                });
                console.log('✅ Calculate button listener attached');
            } else {
                console.error('❌ Element #btnCalculate not found!');
            }
            
            // 🔧 Save Simulation Button (top header)
            const btnSave = document.getElementById('btnSaveSimulation');
            if (btnSave) {
                btnSave.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('💾 Save button clicked!');
                    self.openSaveModal();
                });
                console.log('✅ Save button listener attached');
            } else {
                console.warn('⚠ Element #btnSaveSimulation not found (may not exist on this page)');
            }
            
            // 🔧 Confirm Save (inside modal)
            const btnConfirmSave = document.getElementById('btnConfirmSave');
            if (btnConfirmSave) {
                btnConfirmSave.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('✅ Confirm save clicked!');
                    self.saveSimulation();
                });
                console.log('✅ Confirm save button listener attached');
            } else {
                console.warn('⚠ Element #btnConfirmSave not found');
            }
            
            // 🔧 New Simulation
            const btnNew = document.getElementById('btnNewSimulation');
            if (btnNew) {
                btnNew.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('📄 New simulation button clicked!');
                    self.newSimulation();
                });
                console.log('✅ New simulation button listener attached');
            } else {
                console.warn('⚠ Element #btnNewSimulation not found');
            }
            
            // 🔧 Rename Simulation
            const btnRename = document.getElementById('btnRenameSimulation');
            if (btnRename) {
                btnRename.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('✏ Rename button clicked!');
                    self.renameSimulation();
                });
                console.log('✅ Rename button listener attached');
            } else {
                console.warn('⚠ Element #btnRenameSimulation not found');
            }
            
            // 🔧 Reload Salary
            const btnLoadBudget = document.getElementById('btnLoadFromBudget');
            if (btnLoadBudget) {
                btnLoadBudget.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('🔄 Reload salary button clicked!');
                    self.loadMonthlySalaryFromBudget();
                });
                console.log('✅ Reload salary button listener attached');
            } else {
                console.warn('⚠ Element #btnLoadFromBudget not found');
            }
            
            // 🔧 Run Comparison
            const btnComparison = document.getElementById('btnRunComparison');
            if (btnComparison) {
                btnComparison.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('🌍 Run comparison button clicked!');
                    self.runMultiCountryComparison();
                });
                console.log('✅ Run comparison button listener attached');
            } else {
                console.warn('⚠ Element #btnRunComparison not found');
            }
            
            // 🔧 Refresh Simulations
            const btnRefresh = document.getElementById('btnRefreshSimulations');
            if (btnRefresh) {
                btnRefresh.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('🔄 Refresh simulations button clicked!');
                    self.loadSavedSimulations();
                });
                console.log('✅ Refresh simulations button listener attached');
            } else {
                console.warn('⚠ Element #btnRefreshSimulations not found');
            }
            
            // 🔧 Export
            const btnExport = document.getElementById('btnExport');
            if (btnExport) {
                btnExport.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('📤 Export button clicked!');
                    self.exportToExcel();
                });
                console.log('✅ Export button listener attached');
            } else {
                console.warn('⚠ Element #btnExport not found');
            }
            
            console.log('✅ All event listeners setup complete!');
        },
        
        toggleRentalSection: function(show) {
            const section = document.getElementById('rentalIncomeSection');
            if (section) {
                section.style.display = show ? 'block' : 'none';
                console.log(`🏘 Rental section ${show ? 'shown' : 'hidden'}`);
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
            
            console.log('📊 Input values:', {
                country, propertyType, purchasePrice, downPayment, interestRate, loanDuration, monthlySalary
            });
            
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
            
            console.log('✅ Calculations completed:', results);
            
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
            
            let monthlyPayment = 0;
            if (loanAmount > 0 && monthlyRate > 0) {
                monthlyPayment = loanAmount * 
                    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
            }
            
            results.loanAmount = loanAmount;
            results.monthlyPayment = monthlyPayment;
            results.numberOfPayments = numberOfPayments;
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
                    notaryFees = rules.notaryFees;
                    transferTax = rules.transferTax(sim.purchasePrice, isPrimary);
                    stampDuty = sim.purchasePrice * rules.stampDuty;
                    registrationFees = rules.registrationFees;
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
                    notaryFees = rules.notaryFees;
                    transferTax = sim.purchasePrice * rules.registrationDuty('flanders', isPrimary);
                    break;
                    
                case 'netherlands':
                    notaryFees = rules.notaryFees;
                    transferTax = sim.purchasePrice * rules.transferTax(isPrimary, 30);
                    registrationFees = rules.registrationFees;
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
            
            // Insurance
            results.annualInsurance = sim.purchasePrice * 0.003;
            results.monthlyInsurance = results.annualInsurance / 12;
            
            // Total monthly payment
            results.totalMonthlyPayment = monthlyPayment + results.monthlyPropertyTax + results.monthlyInsurance;
            
            // ========== BORROWING CAPACITY ==========
            const maxDebtRatio = 0.33;
            const maxMonthlyPayment = sim.monthlySalary * maxDebtRatio;
            
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
                
                let rentalTax = 0;
                if (sim.country === 'spain' && rules.rentalDeduction) {
                    rentalTax = results.netAnnualRent * (1 - rules.rentalDeduction) * rules.rentalIncomeTaxRate;
                } else if (sim.country === 'portugal') {
                    rentalTax = results.netAnnualRent * rules.rentalIncomeTaxFlat;
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
            const appreciationRate = 0.03;
            const isRental = sim.propertyType === 'rental';
            
            let propertyValue = sim.purchasePrice;
            let loanBalance = results.loanAmount;
            let cumulativeRent = 0;
            
            for (let year = 0; year <= 30; year++) {
                if (year > 0) {
                    propertyValue *= (1 + appreciationRate);
                    
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
            
            document.getElementById('grossYield').textContent = results.grossYield.toFixed(2) + '%';
            document.getElementById('netYield').textContent = results.netYield.toFixed(2) + '%';
            document.getElementById('totalInterest').textContent = this.formatCurrency(results.totalInterest, rules.currencySymbol);
            document.getElementById('totalAmountPaid').textContent = this.formatCurrency(results.totalAmountPaid, rules.currencySymbol);
            
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
            
            this.showNotification('✅ Multi-country comparison completed!', 'success');
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
            console.log('💾 Opening save modal...');
            
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
                console.log('✅ Save modal opened');
            } else {
                console.error('❌ Modal #modalSaveSimulation not found!');
            }
        },
        
        saveSimulation: async function() {
            console.log('💾 Saving simulation...');
            
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
            
            const savedId = await this.saveToFirestore(this.currentSimulation);
            
            if (savedId) {
                this.currentSimulation.id = savedId;
            }
            
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
            
            this.savedSimulations = this.savedSimulations.filter(s => s.id !== simId);
            
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
                
                document.getElementById('borrowingCapacitySection').style.display = 'none';
                document.getElementById('taxFeesSection').style.display = 'none';
                document.getElementById('financialResultsSection').style.display = 'none';
                document.getElementById('chartsSection').style.display = 'none';
                document.getElementById('comparisonSection').style.display = 'none';
                
                // Reload salary
                this.loadMonthlySalaryFromBudget();
                
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
                console.log(`✅ Modal ${modalId} closed`);
            }
        },
        
        openModal: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                console.log(`✅ Modal ${modalId} opened`);
            }
        },
        
        showNotification: function(message, type = 'info') {
            console.log(`[${type.toUpperCase()}] ${message}`);
            
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
                max-width: 400px;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    };

    // ========== FIN DU FICHIER ==========
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => RealEstateSimulator.init());
    } else {
        RealEstateSimulator.init();
    }
    
    // Expose globally
    window.RealEstateSimulator = RealEstateSimulator;
    
})();

// ========== 🔧 CORRECTION : Notification animations (variable unique) ==========
(function addNotificationStyles() {
    const notificationStyle = document.createElement('style');
    notificationStyle.id = 'real-estate-notification-styles';
    notificationStyle.textContent = `
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
    
    // Éviter les doublons
    if (!document.getElementById('real-estate-notification-styles')) {
        document.head.appendChild(notificationStyle);
    }
})();
    
