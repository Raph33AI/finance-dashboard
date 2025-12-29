/* ==============================================
   REAL-ESTATE-SIMULATOR.JS - VERSION PORTFOLIO MANAGER
   ✅ Sauvegarde MANUELLE uniquement (bouton "Save")
   ✅ Ajout manuel de propriétés au portfolio
   ✅ Graphiques Louer vs Acheter
   ✅ Dashboard professionnel de simulations
   ============================================== */

(function() {
    'use strict';
    
    const RealEstateSimulator = {
        // ========== STATE VARIABLES ==========
        currentSimulation: {
            id: null,
            name: '',
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
            purchaseDate: null,
            createdAt: null,
            updatedAt: null,
            results: null
        },
        
        savedSimulations: [],
        portfolio: [],
        isDarkMode: false,
        unsavedChanges: false, // ✨ NOUVEAU
        
        charts: {
            amortization: null,
            wealthEvolution: null,
            cashflow: null,
            comparison: null,
            portfolioDistribution: null,
            portfolioValue: null,
            rentVsBuy: null // ✨ NOUVEAU
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
                annualAppreciationRate: 0.03,
                averageRentYield: 0.04, // ✨ NOUVEAU
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
                annualAppreciationRate: 0.04,
                averageRentYield: 0.045,
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
                annualAppreciationRate: 0.045,
                averageRentYield: 0.05,
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
                annualAppreciationRate: 0.035,
                averageRentYield: 0.042,
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
                annualAppreciationRate: 0.05,
                averageRentYield: 0.048,
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
                annualAppreciationRate: 0.03,
                averageRentYield: 0.038,
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
                annualAppreciationRate: 0.025,
                averageRentYield: 0.035,
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
                annualAppreciationRate: 0.02,
                averageRentYield: 0.04,
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
                annualAppreciationRate: 0.03,
                averageRentYield: 0.043,
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
                annualAppreciationRate: 0.055,
                averageRentYield: 0.046,
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
            console.log('🏠 Real Estate Portfolio Manager - Initializing...');
            
            try {
                this.detectDarkMode();
                await this.waitForAuth();
                await this.loadSavedSimulations();
                await this.buildPortfolioFromSimulations();
                
                this.setupEventListeners();
                this.updateLastUpdate();
                this.setupDarkModeListener();
                this.renderSimulationsList(); // ✨ NOUVEAU NOM
                this.renderPortfolioDashboard();
                
                console.log('✅ Real Estate Portfolio Manager initialized successfully');
                console.log(`📊 Portfolio: ${this.portfolio.length} properties`);
                console.log(`📋 Simulations: ${this.savedSimulations.length} records`);
                
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
            const formatted = now.toLocaleDateString('en-US') + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            const elem = document.getElementById('lastUpdate');
            if (elem) {
                elem.textContent = formatted;
            }
        },
        
        // ========== EVENT LISTENERS ==========
        
        setupEventListeners: function() {
            console.log('🔧 Setting up event listeners...');
            
            const self = this;
            
            // Country & Property Type change
            const countrySelect = document.getElementById('selectCountry');
            const propertyTypeSelect = document.getElementById('selectPropertyType');
            
            if (countrySelect) {
                countrySelect.addEventListener('change', function() {
                    self.currentSimulation.country = this.value;
                    self.updateCurrentInfo();
                    self.unsavedChanges = true;
                    self.updateSaveButtonState();
                });
            }
            
            if (propertyTypeSelect) {
                propertyTypeSelect.addEventListener('change', function() {
                    self.currentSimulation.propertyType = this.value;
                    self.updateCurrentInfo();
                    self.toggleRentalSection(this.value === 'rental');
                    self.unsavedChanges = true;
                    self.updateSaveButtonState();
                });
            }
            
            // ✨ NOUVEAU : Calculate Button (PLUS d'auto-save)
            const btnCalculate = document.getElementById('btnCalculate');
            if (btnCalculate) {
                btnCalculate.addEventListener('click', function(e) {
                    e.preventDefault();
                    self.calculateResults();
                });
            }
            
            // ✨ NOUVEAU : Save Simulation Button
            const btnSave = document.getElementById('btnSaveSimulation');
            if (btnSave) {
                btnSave.addEventListener('click', function(e) {
                    e.preventDefault();
                    self.saveSimulation();
                });
            }
            
            // ✨ NOUVEAU : Add Property Manually
            const btnAddProperty = document.getElementById('btnAddProperty');
            if (btnAddProperty) {
                btnAddProperty.addEventListener('click', function(e) {
                    e.preventDefault();
                    self.openAddPropertyModal();
                });
            }
            
            // New Simulation
            const btnNew = document.getElementById('btnNewSimulation');
            if (btnNew) {
                btnNew.addEventListener('click', function(e) {
                    e.preventDefault();
                    self.newSimulation();
                });
            }
            
            // ✨ NOUVEAU : Rent vs Buy Comparison
            const btnRentVsBuy = document.getElementById('btnRentVsBuy');
            if (btnRentVsBuy) {
                btnRentVsBuy.addEventListener('click', function(e) {
                    e.preventDefault();
                    self.openRentVsBuyModal();
                });
            }
            
            // Run Comparison
            const btnComparison = document.getElementById('btnRunComparison');
            if (btnComparison) {
                btnComparison.addEventListener('click', function(e) {
                    e.preventDefault();
                    self.runMultiCountryComparison();
                });
            }
            
            // ✨ NOUVEAU : Compare Simulations
            const btnCompareSimulations = document.getElementById('btnCompareSimulations');
            if (btnCompareSimulations) {
                btnCompareSimulations.addEventListener('click', function(e) {
                    e.preventDefault();
                    self.openCompareSimulationsModal();
                });
            }
            
            // Refresh Simulations
            const btnRefresh = document.getElementById('btnRefreshSimulations');
            if (btnRefresh) {
                btnRefresh.addEventListener('click', function(e) {
                    e.preventDefault();
                    self.loadSavedSimulations();
                    self.buildPortfolioFromSimulations();
                    self.renderPortfolioDashboard();
                });
            }
            
            // Export
            const btnExport = document.getElementById('btnExport');
            if (btnExport) {
                btnExport.addEventListener('click', function(e) {
                    e.preventDefault();
                    self.exportToExcel();
                });
            }
            
            // Portfolio Filters
            const filterCountry = document.getElementById('filterCountry');
            const filterType = document.getElementById('filterPropertyType');
            const filterStatus = document.getElementById('filterStatus');
            
            if (filterCountry) {
                filterCountry.addEventListener('change', function() {
                    self.renderPortfolioProperties();
                });
            }
            
            if (filterType) {
                filterType.addEventListener('change', function() {
                    self.renderPortfolioProperties();
                });
            }
            
            if (filterStatus) {
                filterStatus.addEventListener('change', function() {
                    self.renderPortfolioProperties();
                });
            }
            
            console.log('✅ All event listeners setup complete!');
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
        
        // ✨ NOUVEAU : Update Save Button State
        updateSaveButtonState: function() {
            const btnSave = document.getElementById('btnSaveSimulation');
            if (!btnSave) return;
            
            if (this.unsavedChanges && this.currentSimulation.results) {
                btnSave.disabled = false;
                btnSave.innerHTML = '<i class="fas fa-save"></i> Save Simulation';
                btnSave.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            } else if (!this.currentSimulation.results) {
                btnSave.disabled = true;
                btnSave.innerHTML = '<i class="fas fa-save"></i> Calculate First';
                btnSave.style.background = '#6c757d';
            } else {
                btnSave.disabled = false;
                btnSave.innerHTML = '<i class="fas fa-check"></i> Saved';
                btnSave.style.background = '#6c757d';
            }
        },
        
        // ========== ✨ NOUVEAU : CALCULATE (SANS AUTO-SAVE) ==========
        
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
                alert('Please enter your monthly salary');
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
            
            // ✅ PLUS D'AUTO-SAVE ICI !
            this.unsavedChanges = true;
            this.updateSaveButtonState();
            
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
            
            this.showNotification('✅ Calculation completed! Click "Save" to store this simulation.', 'success');
            this.updateLastUpdate();
        },
        
        // ✨ NOUVEAU : SAVE SIMULATION (MANUEL)
        saveSimulation: async function() {
            if (!this.currentSimulation.results) {
                alert('Please calculate results first');
                return;
            }
            
            console.log('💾 Manually saving simulation...');
            
            const now = new Date();
            const rules = this.taxRules[this.currentSimulation.country];
            
            // Demander un nom personnalisé
            let customName = prompt('Enter a name for this simulation:', 
                `${rules.name} ${this.formatPropertyType(this.currentSimulation.propertyType)} - ${this.currentSimulation.city || 'Unknown'}`);
            
            if (!customName) {
                console.log('❌ Save cancelled by user');
                return;
            }
            
            this.currentSimulation.name = customName.trim();
            this.currentSimulation.purchaseDate = this.currentSimulation.purchaseDate || now.toISOString();
            this.currentSimulation.updatedAt = now.toISOString();
            
            if (!this.currentSimulation.createdAt) {
                this.currentSimulation.createdAt = now.toISOString();
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
            this.renderSimulationsList(); // ✨ NOUVEAU NOM
            
            // Rebuild portfolio
            await this.buildPortfolioFromSimulations();
            this.renderPortfolioDashboard();
            
            this.updateCurrentInfo();
            this.unsavedChanges = false;
            this.updateSaveButtonState();
            
            this.showNotification(`✅ Simulation "${customName}" saved successfully!`, 'success');
            console.log(`✅ Simulation saved: "${customName}"`);
        },
        
        // ✨ NOUVEAU : OPEN ADD PROPERTY MODAL
        openAddPropertyModal: function() {
            const modalHTML = `
                <div id='addPropertyModal' class='modal-overlay' onclick='if(event.target === this) RealEstateSimulator.closeAddPropertyModal()'>
                    <div class='modal-content' style='max-width: 600px;'>
                        <div class='modal-header'>
                            <h2><i class='fas fa-plus-circle'></i> Add Property Manually</h2>
                            <button class='btn-close' onclick='RealEstateSimulator.closeAddPropertyModal()'>
                                <i class='fas fa-times'></i>
                            </button>
                        </div>
                        
                        <div class='modal-body'>
                            <form id='addPropertyForm'>
                                <div class='form-group'>
                                    <label>Property Name *</label>
                                    <input type='text' id='propName' class='form-control' placeholder='e.g., Paris Apartment' required>
                                </div>
                                
                                <div class='form-row'>
                                    <div class='form-group'>
                                        <label>Country *</label>
                                        <select id='propCountry' class='form-control' required>
                                            <option value=''>Select...</option>
                                            <option value='france'>🇫🇷 France</option>
                                            <option value='uk'>🇬🇧 UK</option>
                                            <option value='usa'>🇺🇸 USA</option>
                                            <option value='spain'>🇪🇸 Spain</option>
                                            <option value='portugal'>🇵🇹 Portugal</option>
                                            <option value='germany'>🇩🇪 Germany</option>
                                            <option value='switzerland'>🇨🇭 Switzerland</option>
                                            <option value='italy'>🇮🇹 Italy</option>
                                            <option value='belgium'>🇧🇪 Belgium</option>
                                            <option value='netherlands'>🇳🇱 Netherlands</option>
                                        </select>
                                    </div>
                                    
                                    <div class='form-group'>
                                        <label>Property Type *</label>
                                        <select id='propType' class='form-control' required>
                                            <option value=''>Select...</option>
                                            <option value='primary'>🏠 Primary</option>
                                            <option value='secondary'>🏖 Secondary</option>
                                            <option value='rental'>💰 Rental</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div class='form-group'>
                                    <label>City</label>
                                    <input type='text' id='propCity' class='form-control' placeholder='e.g., Paris'>
                                </div>
                                
                                <div class='form-row'>
                                    <div class='form-group'>
                                        <label>Purchase Price *</label>
                                        <input type='number' id='propPrice' class='form-control' placeholder='300000' required>
                                    </div>
                                    
                                    <div class='form-group'>
                                        <label>Purchase Date *</label>
                                        <input type='date' id='propDate' class='form-control' required>
                                    </div>
                                </div>
                                
                                <div class='form-row'>
                                    <div class='form-group'>
                                        <label>Down Payment *</label>
                                        <input type='number' id='propDown' class='form-control' placeholder='60000' required>
                                    </div>
                                    
                                    <div class='form-group'>
                                        <label>Interest Rate (%) *</label>
                                        <input type='number' step='0.01' id='propRate' class='form-control' placeholder='3.5' required>
                                    </div>
                                </div>
                                
                                <div class='form-row'>
                                    <div class='form-group'>
                                        <label>Loan Duration (years) *</label>
                                        <input type='number' id='propDuration' class='form-control' placeholder='25' required>
                                    </div>
                                    
                                    <div class='form-group'>
                                        <label>Payments Made (months)</label>
                                        <input type='number' id='propPaymentsMade' class='form-control' placeholder='0' value='0'>
                                        <small class='form-help'>How many monthly payments already made?</small>
                                    </div>
                                </div>
                                
                                <div class='form-actions'>
                                    <button type='button' class='btn-secondary' onclick='RealEstateSimulator.closeAddPropertyModal()'>
                                        Cancel
                                    </button>
                                    <button type='submit' class='btn-primary'>
                                        <i class='fas fa-plus'></i> Add Property
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            const form = document.getElementById('addPropertyForm');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAddProperty();
            });
        },
        
        closeAddPropertyModal: function() {
            const modal = document.getElementById('addPropertyModal');
            if (modal) modal.remove();
        },
        
        submitAddProperty: async function() {
            const name = document.getElementById('propName').value.trim();
            const country = document.getElementById('propCountry').value;
            const propertyType = document.getElementById('propType').value;
            const city = document.getElementById('propCity').value.trim();
            const purchasePrice = parseFloat(document.getElementById('propPrice').value);
            const purchaseDate = document.getElementById('propDate').value;
            const downPayment = parseFloat(document.getElementById('propDown').value);
            const interestRate = parseFloat(document.getElementById('propRate').value);
            const loanDuration = parseInt(document.getElementById('propDuration').value);
            const paymentsMade = parseInt(document.getElementById('propPaymentsMade').value) || 0;
            
            if (!name || !country || !propertyType || !purchasePrice || !purchaseDate || !downPayment || !interestRate || !loanDuration) {
                alert('Please fill all required fields');
                return;
            }
            
            // Create a simulation object
            const simulation = {
                id: 'local_' + Date.now(),
                name: name,
                country: country,
                propertyType: propertyType,
                city: city,
                purchasePrice: purchasePrice,
                downPayment: downPayment,
                interestRate: interestRate,
                loanDuration: loanDuration,
                monthlySalary: 0, // Not needed for manual entry
                monthlyRent: 0,
                occupancyRate: 90,
                monthlyCharges: 0,
                vacancyProvision: 1,
                purchaseDate: new Date(purchaseDate).toISOString(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                paymentsMade: paymentsMade, // ✨ NOUVEAU
                results: null
            };
            
            // Calculate basic results
            const loanAmount = purchasePrice - downPayment;
            const monthlyRate = interestRate / 100 / 12;
            const totalMonths = loanDuration * 12;
            
            let monthlyPayment = 0;
            if (loanAmount > 0 && monthlyRate > 0) {
                monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
            }
            
            // Calculate remaining balance after X payments
            let remainingBalance = loanAmount;
            for (let i = 0; i < paymentsMade; i++) {
                const interestPayment = remainingBalance * monthlyRate;
                const principalPayment = monthlyPayment - interestPayment;
                remainingBalance = Math.max(0, remainingBalance - principalPayment);
            }
            
            simulation.results = {
                loanAmount: loanAmount,
                monthlyPayment: monthlyPayment,
                totalMonthlyPayment: monthlyPayment,
                remainingBalance: remainingBalance,
                paymentsMade: paymentsMade,
                paymentsRemaining: totalMonths - paymentsMade
            };
            
            // Save
            const savedId = await this.saveToFirestore(simulation);
            if (savedId) {
                simulation.id = savedId;
            }
            
            this.savedSimulations.push(simulation);
            this.saveToLocalStorage();
            this.renderSimulationsList();
            
            await this.buildPortfolioFromSimulations();
            this.renderPortfolioDashboard();
            
            this.closeAddPropertyModal();
            this.showNotification(`✅ Property "${name}" added successfully!`, 'success');
        },
        
        // ✨ NOUVEAU : RENT VS BUY MODAL
        openRentVsBuyModal: function() {
            if (!this.currentSimulation.results) {
                alert('Please calculate a simulation first');
                return;
            }
            
            const sim = this.currentSimulation;
            const rules = this.taxRules[sim.country];
            
            // ✅ Calcul du loyer estimé basé sur le prix d'achat
            const estimatedRent = sim.purchasePrice * (rules.averageRentYield || 0.04) / 12;
            
            const modalHTML = `
                <div id='rentVsBuyModal' class='modal-overlay' onclick='if(event.target === this) RealEstateSimulator.closeRentVsBuyModal()'>
                    <div class='modal-content' style='max-width: 1200px;'>
                        <div class='modal-header'>
                            <h2><i class='fas fa-balance-scale'></i> Rent vs Buy Analysis</h2>
                            <button class='btn-close' onclick='RealEstateSimulator.closeRentVsBuyModal()'>
                                <i class='fas fa-times'></i>
                            </button>
                        </div>
                        
                        <div class='modal-body'>
                            <div class='form-row'>
                                <div class='form-group'>
                                    <label>Monthly Rent (Estimated: ${this.formatCurrency(estimatedRent, rules.currencySymbol)})</label>
                                    <input type='number' id='rentAmount' class='form-control' value='${estimatedRent.toFixed(0)}' placeholder='Enter monthly rent' min='0' step='50'>
                                    <small class='hint'>Average market rent for similar property</small>
                                </div>
                                
                                <div class='form-group'>
                                    <label>Analysis Period (years)</label>
                                    <select id='analysisPeriod' class='form-control'>
                                        <option value='10'>10 years</option>
                                        <option value='15'>15 years</option>
                                        <option value='20'>20 years</option>
                                        <option value='25'>25 years</option>
                                        <option value='30' selected>30 years</option>
                                    </select>
                                    <small class='hint'>Comparison timeframe</small>
                                </div>
                            </div>
                            
                            <button class='btn btn-primary' onclick='RealEstateSimulator.calculateRentVsBuy()'>
                                <i class='fas fa-calculator'></i> Run Analysis
                            </button>
                            
                            <div id='rentVsBuyResults' style='margin-top: 24px;'></div>
                            <div id='rentVsBuyChart' style='margin-top: 24px; min-height: 400px;'></div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        },
        
        closeRentVsBuyModal: function() {
            const modal = document.getElementById('rentVsBuyModal');
            if (modal) modal.remove();
        },
        
        calculateRentVsBuy: function() {
            const rentAmount = parseFloat(document.getElementById('rentAmount').value);
            const period = parseInt(document.getElementById('analysisPeriod').value);
            
            if (!rentAmount || rentAmount <= 0 || !period || period < 5) {
                alert('Please enter valid rent amount and period');
                return;
            }
            
            const sim = this.currentSimulation;
            const rules = this.taxRules[sim.country];
            const results = sim.results;
            
            // ✅ VÉRIFICATIONS
            if (!results || !results.monthlyPayment) {
                alert('Missing simulation results. Please recalculate.');
                return;
            }
            
            console.log('🧮 Rent vs Buy Calculation Started');
            console.log('Monthly Rent:', rentAmount);
            console.log('Period:', period, 'years');
            console.log('Monthly Mortgage:', results.monthlyPayment);
            
            // Buy scenario
            const buyData = {
                years: [],
                totalCost: [],
                equity: [],
                netWealth: []
            };
            
            // Rent scenario
            const rentData = {
                years: [],
                totalCost: [],
                savings: [],
                netWealth: []
            };
            
            // Initial values
            const downPaymentInvested = sim.downPayment + (results.totalAcquisitionFees || 0);
            const investmentReturn = 0.07; // 7% annual return assumption
            
            let propertyValue = sim.purchasePrice;
            let loanBalance = results.loanAmount || 0;
            let buyTotalCost = downPaymentInvested;
            
            let rentTotalCost = 0;
            let rentSavings = downPaymentInvested; // Initial capital invested
            
            const appreciationRate = rules.annualAppreciationRate || 0.03;
            const rentInflation = 0.025; // 2.5% annual rent increase
            let currentRent = rentAmount;
            
            const monthlyMortgage = results.monthlyPayment || 0;
            const annualPropertyTax = results.annualPropertyTax || 0;
            const annualInsurance = results.annualInsurance || 0;
            const annualMaintenance = sim.purchasePrice * 0.01; // 1% maintenance
            
            console.log('📊 Initial Values:');
            console.log('Property Value:', propertyValue);
            console.log('Loan Balance:', loanBalance);
            console.log('Down Payment + Fees:', downPaymentInvested);
            console.log('Annual Costs:', annualPropertyTax + annualInsurance + annualMaintenance);
            
            // Year 0
            buyData.years.push(0);
            buyData.totalCost.push(buyTotalCost);
            buyData.equity.push(propertyValue - loanBalance);
            buyData.netWealth.push((propertyValue - loanBalance) - buyTotalCost);
            
            rentData.years.push(0);
            rentData.totalCost.push(0);
            rentData.savings.push(rentSavings);
            rentData.netWealth.push(rentSavings);
            
            // Yearly calculations
            for (let year = 1; year <= period; year++) {
                // ✅ BUY SCENARIO
                propertyValue *= (1 + appreciationRate);
                
                const annualMortgage = monthlyMortgage * 12;
                const totalAnnualCosts = annualMortgage + annualPropertyTax + annualInsurance + annualMaintenance;
                buyTotalCost += totalAnnualCosts;
                
                // Principal paid this year
                const interestRate = sim.interestRate / 100;
                const annualInterest = loanBalance * interestRate;
                const annualPrincipal = Math.min(annualMortgage - annualInterest, loanBalance);
                loanBalance = Math.max(0, loanBalance - annualPrincipal);
                
                const buyEquity = propertyValue - loanBalance;
                const buyNetWealth = buyEquity - buyTotalCost;
                
                // ✅ RENT SCENARIO
                currentRent *= (1 + rentInflation);
                const annualRent = currentRent * 12;
                rentTotalCost += annualRent;
                
                // Monthly savings (difference between mortgage and rent)
                const monthlySavings = monthlyMortgage - currentRent;
                if (monthlySavings > 0) {
                    rentSavings += monthlySavings * 12;
                }
                
                // Investment returns on savings
                rentSavings *= (1 + investmentReturn);
                
                const rentNetWealth = rentSavings - rentTotalCost;
                
                // Store data
                buyData.years.push(year);
                buyData.totalCost.push(buyTotalCost);
                buyData.equity.push(buyEquity);
                buyData.netWealth.push(buyNetWealth);
                
                rentData.years.push(year);
                rentData.totalCost.push(rentTotalCost);
                rentData.savings.push(rentSavings);
                rentData.netWealth.push(rentNetWealth);
            }
            
            console.log('✅ Calculation Complete');
            console.log('Final Buy Net Wealth:', buyData.netWealth[period]);
            console.log('Final Rent Net Wealth:', rentData.netWealth[period]);
            
            // Display results
            const breakEvenYear = buyData.netWealth.findIndex((val, i) => i > 0 && val > rentData.netWealth[i]);
            
            const resultsHTML = `
                <div class='rent-vs-buy-results'>
                    <div class='result-card'>
                        <h3>💰 Buy Scenario (${period} years)</h3>
                        <div class='result-metric'>
                            <label>Total Cost:</label>
                            <strong>${this.formatCurrency(buyData.totalCost[period], rules.currencySymbol)}</strong>
                        </div>
                        <div class='result-metric'>
                            <label>Property Value:</label>
                            <strong>${this.formatCurrency(propertyValue, rules.currencySymbol)}</strong>
                        </div>
                        <div class='result-metric'>
                            <label>Equity:</label>
                            <strong class='text-success'>${this.formatCurrency(buyData.equity[period], rules.currencySymbol)}</strong>
                        </div>
                        <div class='result-metric'>
                            <label>Net Wealth:</label>
                            <strong class='text-success'>${this.formatCurrency(buyData.netWealth[period], rules.currencySymbol)}</strong>
                        </div>
                    </div>
                    
                    <div class='result-card'>
                        <h3>🏠 Rent Scenario (${period} years)</h3>
                        <div class='result-metric'>
                            <label>Total Rent Paid:</label>
                            <strong>${this.formatCurrency(rentData.totalCost[period], rules.currencySymbol)}</strong>
                        </div>
                        <div class='result-metric'>
                            <label>Invested Savings:</label>
                            <strong>${this.formatCurrency(rentData.savings[period], rules.currencySymbol)}</strong>
                        </div>
                        <div class='result-metric'>
                            <label>Net Wealth:</label>
                            <strong class='${rentData.netWealth[period] > 0 ? 'text-success' : 'text-danger'}'>${this.formatCurrency(rentData.netWealth[period], rules.currencySymbol)}</strong>
                        </div>
                        <div class='result-metric'>
                            <label>Difference:</label>
                            <strong class='${buyData.netWealth[period] > rentData.netWealth[period] ? 'text-success' : 'text-danger'}'>
                                ${this.formatCurrency(Math.abs(buyData.netWealth[period] - rentData.netWealth[period]), rules.currencySymbol)}
                            </strong>
                        </div>
                    </div>
                    
                    <div class='result-card' style='grid-column: span 2;'>
                        <h3>📊 Recommendation</h3>
                        <div class='recommendation'>
                            ${buyData.netWealth[period] > rentData.netWealth[period] 
                                ? `<div class='recommendation-buy'><i class='fas fa-home'></i> <strong>BUYING IS BETTER</strong><br/>You'll be <strong>${this.formatCurrency(buyData.netWealth[period] - rentData.netWealth[period], rules.currencySymbol)}</strong> wealthier after ${period} years${breakEvenYear > 0 ? ` (break-even at year ${breakEvenYear})` : ''}</div>`
                                : `<div class='recommendation-rent'><i class='fas fa-key'></i> <strong>RENTING IS BETTER</strong><br/>You'll save <strong>${this.formatCurrency(rentData.netWealth[period] - buyData.netWealth[period], rules.currencySymbol)}</strong> after ${period} years by renting and investing</div>`
                            }
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('rentVsBuyResults').innerHTML = resultsHTML;
            
            // Create chart
            this.createRentVsBuyChart(buyData, rentData, rules);
        },
        
        createRentVsBuyChart: function(buyData, rentData, rules) {
            const container = document.getElementById('rentVsBuyChart');
            if (!container) return;
            
            const chartColors = this.getChartColors();
            
            if (this.charts.rentVsBuy) {
                this.charts.rentVsBuy.destroy();
            }
            
            this.charts.rentVsBuy = Highcharts.chart('rentVsBuyChart', {
                chart: {
                    type: 'line',
                    backgroundColor: 'transparent',
                    style: { fontFamily: 'Inter, sans-serif' }
                },
                title: {
                    text: 'Net Wealth Evolution: Buy vs Rent',
                    style: { 
                        color: chartColors.title,
                        fontSize: '1.25rem',
                        fontWeight: '800'
                    }
                },
                xAxis: {
                    categories: buyData.years.map(y => 'Year ' + y),
                    labels: { style: { color: chartColors.text } },
                    gridLineColor: chartColors.gridLine,
                    lineColor: chartColors.axisLine
                },
                yAxis: {
                    title: { text: 'Net Wealth', style: { color: chartColors.title } },
                    labels: { 
                        style: { color: chartColors.text },
                        formatter: function() {
                            return rules.currencySymbol + (this.value / 1000).toFixed(0) + 'k';
                        }
                    },
                    gridLineColor: chartColors.gridLine,
                    plotLines: [{
                        value: 0,
                        color: chartColors.gridLine,
                        width: 2,
                        zIndex: 2
                    }]
                },
                tooltip: {
                    shared: true,
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    style: { color: chartColors.text },
                    useHTML: true,
                    formatter: function() {
                        let html = '<div style="padding: 8px;"><strong>' + this.x + '</strong><br/>';
                        this.points.forEach(point => {
                            html += '<span style="color:' + point.color + '">●</span> ' + 
                                point.series.name + ': <strong>' + rules.currencySymbol + point.y.toLocaleString() + '</strong><br/>';
                        });
                        html += '</div>';
                        return html;
                    }
                },
                plotOptions: {
                    line: {
                        lineWidth: 3,
                        marker: { 
                            enabled: true,
                            radius: 4
                        }
                    }
                },
                series: [{
                    name: 'Buy Net Wealth',
                    data: buyData.netWealth,
                    color: '#10b981',
                    lineWidth: 4
                }, {
                    name: 'Rent Net Wealth',
                    data: rentData.netWealth,
                    color: '#3b82f6',
                    lineWidth: 4
                }, {
                    name: 'Buy Equity',
                    data: buyData.equity,
                    color: '#8b5cf6',
                    dashStyle: 'Dash',
                    lineWidth: 2
                }, {
                    name: 'Rent Savings',
                    data: rentData.savings,
                    color: '#f59e0b',
                    dashStyle: 'Dash',
                    lineWidth: 2
                }],
                credits: { enabled: false },
                legend: {
                    itemStyle: { color: chartColors.text },
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            });
        },
        
        // ✨ NOUVEAU : COMPARE SIMULATIONS MODAL
        openCompareSimulationsModal: function() {
            if (this.savedSimulations.length < 2) {
                alert('You need at least 2 saved simulations to compare');
                return;
            }
            
            const modalHTML = `
                <div id='compareSimulationsModal' class='modal-overlay' onclick='if(event.target === this) RealEstateSimulator.closeCompareSimulationsModal()'>
                    <div class='modal-content' style='max-width: 1400px;'>
                        <div class='modal-header'>
                            <h2><i class='fas fa-balance-scale'></i> Compare Simulations</h2>
                            <button class='btn-close' onclick='RealEstateSimulator.closeCompareSimulationsModal()'>
                                <i class='fas fa-times'></i>
                            </button>
                        </div>
                        
                        <div class='modal-body'>
                            <div class='form-row'>
                                <div class='form-group'>
                                    <label>Select Simulation 1</label>
                                    <select id='compareSim1' class='form-control'>
                                        <option value=''>Choose...</option>
                                        ${this.savedSimulations.map(s => `<option value='${s.id}'>${this.escapeHtml(s.name)}</option>`).join('')}
                                    </select>
                                </div>
                                
                                <div class='form-group'>
                                    <label>Select Simulation 2</label>
                                    <select id='compareSim2' class='form-control'>
                                        <option value=''>Choose...</option>
                                        ${this.savedSimulations.map(s => `<option value='${s.id}'>${this.escapeHtml(s.name)}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            
                            <button class='btn-primary' onclick='RealEstateSimulator.runSimulationComparison()'>
                                <i class='fas fa-chart-bar'></i> Compare
                            </button>
                            
                            <div id='comparisonResults' style='margin-top: 24px;'></div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        },
        
        closeCompareSimulationsModal: function() {
            const modal = document.getElementById('compareSimulationsModal');
            if (modal) modal.remove();
        },
        
        runSimulationComparison: function() {
            const sim1Id = document.getElementById('compareSim1').value;
            const sim2Id = document.getElementById('compareSim2').value;
            
            if (!sim1Id || !sim2Id) {
                alert('Please select 2 simulations');
                return;
            }
            
            if (sim1Id === sim2Id) {
                alert('Please select different simulations');
                return;
            }
            
            const sim1 = this.savedSimulations.find(s => s.id === sim1Id);
            const sim2 = this.savedSimulations.find(s => s.id === sim2Id);
            
            if (!sim1 || !sim2) {
                alert('Simulations not found');
                return;
            }
            
            const rules1 = this.taxRules[sim1.country];
            const rules2 = this.taxRules[sim2.country];
            
            const compareHTML = `
                <div class='comparison-grid'>
                    <div class='comparison-card'>
                        <h3>${rules1.flag} ${this.escapeHtml(sim1.name)}</h3>
                        <div class='comparison-metrics'>
                            <div class='metric'>
                                <label>Purchase Price</label>
                                <strong>${this.formatCurrency(sim1.purchasePrice, rules1.currencySymbol)}</strong>
                            </div>
                            <div class='metric'>
                                <label>Monthly Payment</label>
                                <strong>${this.formatCurrency(sim1.results?.totalMonthlyPayment || 0, rules1.currencySymbol)}</strong>
                            </div>
                            <div class='metric'>
                                <label>Total Cost</label>
                                <strong>${this.formatCurrency(sim1.results?.totalCost || 0, rules1.currencySymbol)}</strong>
                            </div>
                            <div class='metric'>
                                <label>Net Yield</label>
                                <strong>${(sim1.results?.netYield || 0).toFixed(2)}%</strong>
                            </div>
                            <div class='metric'>
                                <label>Debt Ratio</label>
                                <strong>${(sim1.results?.debtRatio || 0).toFixed(1)}%</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div class='comparison-card'>
                        <h3>${rules2.flag} ${this.escapeHtml(sim2.name)}</h3>
                        <div class='comparison-metrics'>
                            <div class='metric'>
                                <label>Purchase Price</label>
                                <strong>${this.formatCurrency(sim2.purchasePrice, rules2.currencySymbol)}</strong>
                            </div>
                            <div class='metric'>
                                <label>Monthly Payment</label>
                                <strong>${this.formatCurrency(sim2.results?.totalMonthlyPayment || 0, rules2.currencySymbol)}</strong>
                            </div>
                            <div class='metric'>
                                <label>Total Cost</label>
                                <strong>${this.formatCurrency(sim2.results?.totalCost || 0, rules2.currencySymbol)}</strong>
                            </div>
                            <div class='metric'>
                                <label>Net Yield</label>
                                <strong>${(sim2.results?.netYield || 0).toFixed(2)}%</strong>
                            </div>
                            <div class='metric'>
                                <label>Debt Ratio</label>
                                <strong>${(sim2.results?.debtRatio || 0).toFixed(1)}%</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('comparisonResults').innerHTML = compareHTML;
        },
        
        // ========== PORTFOLIO MANAGEMENT (unchanged) ==========
        
        buildPortfolioFromSimulations: async function() {
            console.log('🏠 Building portfolio from simulations...');
            
            this.portfolio = this.savedSimulations.map(sim => {
                const purchaseDate = new Date(sim.purchaseDate || sim.createdAt);
                const now = new Date();
                
                const monthsSincePurchase = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + (now.getMonth() - purchaseDate.getMonth());
                
                const rules = this.taxRules[sim.country];
                const appreciationRate = rules.annualAppreciationRate || 0.03;
                const yearsSincePurchase = monthsSincePurchase / 12;
                const currentValue = sim.purchasePrice * Math.pow(1 + appreciationRate, yearsSincePurchase);
                
                const loanAmount = sim.purchasePrice - sim.downPayment;
                const monthlyRate = sim.interestRate / 100 / 12;
                const totalMonths = sim.loanDuration * 12;
                
                let monthlyPayment = 0;
                if (loanAmount > 0 && monthlyRate > 0) {
                    monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
                }
                
                let remainingBalance = loanAmount;
                const effectivePayments = sim.paymentsMade || Math.min(monthsSincePurchase, totalMonths);
                
                for (let i = 0; i < effectivePayments; i++) {
                    const interestPayment = remainingBalance * monthlyRate;
                    const principalPayment = monthlyPayment - interestPayment;
                    remainingBalance = Math.max(0, remainingBalance - principalPayment);
                }
                
                const monthsRemaining = Math.max(0, totalMonths - effectivePayments);
                const equity = currentValue - remainingBalance;
                const status = remainingBalance <= 0 ? 'paid_off' : 'active';
                
                return {
                    id: sim.id,
                    name: sim.name,
                    country: sim.country,
                    propertyType: sim.propertyType,
                    city: sim.city,
                    purchasePrice: sim.purchasePrice,
                    purchaseDate: sim.purchaseDate || sim.createdAt,
                    loanDuration: sim.loanDuration,
                    currentValue: currentValue,
                    remainingBalance: remainingBalance,
                    equity: equity,
                    monthsRemaining: monthsRemaining,
                    monthlyPayment: monthlyPayment,
                    status: status,
                    results: sim.results
                };
            });
            
            console.log(`✅ Portfolio built: ${this.portfolio.length} properties`);
        },
        
        renderPortfolioDashboard: function() {
            console.log('📊 Rendering portfolio dashboard...');
            
            const totalValue = this.portfolio.reduce((sum, prop) => sum + prop.currentValue, 0);
            const totalEquity = this.portfolio.reduce((sum, prop) => sum + prop.equity, 0);
            const totalDebt = this.portfolio.reduce((sum, prop) => sum + prop.remainingBalance, 0);
            const totalMonthlyPayment = this.portfolio.reduce((sum, prop) => sum + (prop.status === 'active' ? prop.monthlyPayment : 0), 0);
            
            const activeProperties = this.portfolio.filter(p => p.status === 'active').length;
            const paidOffProperties = this.portfolio.filter(p => p.status === 'paid_off').length;
            
            const kpiTotalValue = document.getElementById('portfolioTotalValue');
            const kpiTotalEquity = document.getElementById('portfolioTotalEquity');
            const kpiTotalDebt = document.getElementById('portfolioTotalDebt');
            const kpiActiveProperties = document.getElementById('portfolioActiveProperties');
            const kpiMonthlyPayment = document.getElementById('portfolioMonthlyPayment');
            const kpiPaidOff = document.getElementById('portfolioPaidOff');
            
            if (kpiTotalValue) kpiTotalValue.textContent = this.formatCurrency(totalValue, '€');
            if (kpiTotalEquity) kpiTotalEquity.textContent = this.formatCurrency(totalEquity, '€');
            if (kpiTotalDebt) kpiTotalDebt.textContent = this.formatCurrency(totalDebt, '€');
            if (kpiActiveProperties) kpiActiveProperties.textContent = activeProperties;
            if (kpiMonthlyPayment) kpiMonthlyPayment.textContent = this.formatCurrency(totalMonthlyPayment, '€');
            if (kpiPaidOff) kpiPaidOff.textContent = paidOffProperties;
            
            this.renderPortfolioProperties();
            this.createPortfolioCharts();
        },
        
        renderPortfolioProperties: function() {
            const container = document.getElementById('portfolioPropertiesList');
            if (!container) return;
            
            const filterCountry = document.getElementById('filterCountry')?.value || 'all';
            const filterType = document.getElementById('filterPropertyType')?.value || 'all';
            const filterStatus = document.getElementById('filterStatus')?.value || 'all';
            
            let filtered = this.portfolio;
            
            if (filterCountry !== 'all') {
                filtered = filtered.filter(p => p.country === filterCountry);
            }
            
            if (filterType !== 'all') {
                filtered = filtered.filter(p => p.propertyType === filterType);
            }
            
            if (filterStatus !== 'all') {
                filtered = filtered.filter(p => p.status === filterStatus);
            }
            
            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class='portfolio-empty'>
                        <i class='fas fa-home'></i>
                        <p>No properties found</p>
                        <small>Create a simulation or add properties manually</small>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = filtered.map(prop => {
                const rules = this.taxRules[prop.country];
                const purchaseDate = new Date(prop.purchaseDate);
                const monthsSincePurchase = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
                const yearsSincePurchase = Math.floor(monthsSincePurchase / 12);
                const remainingYears = Math.floor(prop.monthsRemaining / 12);
                const remainingMonths = prop.monthsRemaining % 12;
                
                const appreciation = ((prop.currentValue - prop.purchasePrice) / prop.purchasePrice * 100).toFixed(1);
                const ltv = prop.remainingBalance > 0 ? (prop.remainingBalance / prop.currentValue * 100).toFixed(1) : 0;
                
                return `
                    <div class='property-card ${prop.status}'>
                        <div class='property-header'>
                            <div class='property-title'>
                                <h3>${this.escapeHtml(prop.name)}</h3>
                                <span class='property-country'>${rules.flag} ${rules.name}</span>
                            </div>
                            <div class='property-status ${prop.status}'>
                                ${prop.status === 'active' ? '<i class="fas fa-clock"></i> Active' : '<i class="fas fa-check-circle"></i> Paid Off'}
                            </div>
                        </div>
                        
                        <div class='property-body'>
                            <div class='property-main-stats'>
                                <div class='stat'>
                                    <label><i class='fas fa-tag'></i> Purchase Price</label>
                                    <strong>${this.formatCurrency(prop.purchasePrice, rules.currencySymbol)}</strong>
                                </div>
                                <div class='stat'>
                                    <label><i class='fas fa-chart-line'></i> Current Value</label>
                                    <strong>${this.formatCurrency(prop.currentValue, rules.currencySymbol)}</strong>
                                    <small class='appreciation'>+${appreciation}%</small>
                                </div>
                                <div class='stat'>
                                    <label><i class='fas fa-piggy-bank'></i> Equity</label>
                                    <strong class='text-success'>${this.formatCurrency(prop.equity, rules.currencySymbol)}</strong>
                                </div>
                            </div>
                            
                            <div class='property-timeline'>
                                <div class='timeline-item'>
                                    <i class='fas fa-calendar-check'></i>
                                    <div>
                                        <label>Purchased</label>
                                        <span>${purchaseDate.toLocaleDateString('en-US')}</span>
                                        <small>${yearsSincePurchase} years ago</small>
                                    </div>
                                </div>
                                
                                ${prop.status === 'active' ? `
                                <div class='timeline-item'>
                                    <i class='fas fa-hourglass-half'></i>
                                    <div>
                                        <label>Remaining</label>
                                        <span>${remainingYears}y ${remainingMonths}m</span>
                                        <small>Out of ${prop.loanDuration} years</small>
                                    </div>
                                </div>
                                
                                <div class='timeline-item'>
                                    <i class='fas fa-euro-sign'></i>
                                    <div>
                                        <label>Monthly Payment</label>
                                        <strong>${this.formatCurrency(prop.monthlyPayment, rules.currencySymbol)}</strong>
                                    </div>
                                </div>
                                ` : `
                                <div class='timeline-item text-success'>
                                    <i class='fas fa-check-circle'></i>
                                    <div>
                                        <label>Status</label>
                                        <span>Fully Paid</span>
                                    </div>
                                </div>
                                `}
                            </div>
                            
                            ${prop.status === 'active' ? `
                            <div class='property-progress'>
                                <div class='progress-header'>
                                    <span>Loan Repayment Progress</span>
                                    <span>${((prop.loanDuration * 12 - prop.monthsRemaining) / (prop.loanDuration * 12) * 100).toFixed(1)}%</span>
                                </div>
                                <div class='progress-bar'>
                                    <div class='progress-fill' style='width: ${((prop.loanDuration * 12 - prop.monthsRemaining) / (prop.loanDuration * 12) * 100)}%'></div>
                                </div>
                                <div class='progress-footer'>
                                    <small>Remaining: ${this.formatCurrency(prop.remainingBalance, rules.currencySymbol)}</small>
                                    <small>LTV: ${ltv}%</small>
                                </div>
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class='property-actions'>
                            <button class='btn-icon' onclick='RealEstateSimulator.loadSimulation("${prop.id}")' title='Load Simulation'>
                                <i class='fas fa-upload'></i> Load
                            </button>
                            <button class='btn-icon' onclick='RealEstateSimulator.viewPropertyDetails("${prop.id}")' title='View Details'>
                                <i class='fas fa-eye'></i> Details
                            </button>
                            <button class='btn-icon btn-danger' onclick='RealEstateSimulator.deleteSimulation("${prop.id}")' title='Delete'>
                                <i class='fas fa-trash'></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        },
        
        createPortfolioCharts: function() {
            this.createPortfolioDistributionChart();
            this.createPortfolioValueChart();
        },
        
        createPortfolioDistributionChart: function() {
            const container = document.getElementById('portfolioDistributionChart');
            if (!container || this.portfolio.length === 0) return;
            
            const byCountry = {};
            this.portfolio.forEach(prop => {
                if (!byCountry[prop.country]) {
                    byCountry[prop.country] = 0;
                }
                byCountry[prop.country] += prop.currentValue;
            });
            
            // ✅ Calcul du total pour les pourcentages
            const total = Object.values(byCountry).reduce((sum, val) => sum + val, 0);
            
            // ✅ DONNÉES TRIÉES PAR VALEUR
            const data = Object.keys(byCountry)
                .map(country => {
                    const rules = this.taxRules[country];
                    return {
                        name: `${rules.flag} ${rules.name}`,
                        y: byCountry[country],
                        country: country,
                        percentage: (byCountry[country] / total * 100).toFixed(1)
                    };
                })
                .sort((a, b) => b.y - a.y); // Tri décroissant
            
            const chartColors = this.getChartColors();
            
            if (this.charts.portfolioDistribution) {
                this.charts.portfolioDistribution.destroy();
            }
            
            // ✅ GRAPHIQUE EN BARRES HORIZONTALES (sans Maps)
            this.charts.portfolioDistribution = Highcharts.chart('portfolioDistributionChart', {
                chart: {
                    type: 'bar',
                    backgroundColor: 'transparent',
                    style: { fontFamily: 'Inter, sans-serif' },
                    height: Math.max(350, data.length * 80) // Hauteur dynamique
                },
                title: {
                    text: 'Portfolio Distribution by Country',
                    style: { 
                        color: chartColors.title,
                        fontSize: '1.25rem',
                        fontWeight: '800'
                    }
                },
                xAxis: {
                    categories: data.map(d => d.name),
                    labels: { 
                        style: { 
                            color: chartColors.text,
                            fontSize: '1rem',
                            fontWeight: '600'
                        } 
                    },
                    gridLineColor: chartColors.gridLine,
                    lineColor: chartColors.axisLine
                },
                yAxis: {
                    title: { 
                        text: 'Total Value (€)', 
                        style: { color: chartColors.title } 
                    },
                    labels: { 
                        style: { color: chartColors.text },
                        formatter: function() {
                            return '€' + (this.value / 1000).toFixed(0) + 'k';
                        }
                    },
                    gridLineColor: chartColors.gridLine
                },
                tooltip: {
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    style: { color: chartColors.text },
                    useHTML: true,
                    formatter: function() {
                        const pct = (this.y / total * 100).toFixed(1);
                        return `
                            <div style="padding: 8px;">
                                <strong>${this.x}</strong><br/>
                                <span style="font-size: 1.1rem; font-weight: 700;">€${this.y.toLocaleString()}</span><br/>
                                <span style="color: #10b981; font-weight: 600;">${pct}% of portfolio</span>
                            </div>
                        `;
                    }
                },
                plotOptions: {
                    bar: {
                        borderRadius: 8,
                        dataLabels: {
                            enabled: true,
                            align: 'right', // ✅ Alignement à droite
                            inside: false, // ✅ À l'extérieur de la barre
                            x: 5, // ✅ Décalage de 5px à droite
                            formatter: function() {
                                return '€' + (this.y / 1000).toFixed(0) + 'k (' + this.point.percentage + '%)';
                            },
                            style: { 
                                color: chartColors.text,
                                fontWeight: '700',
                                fontSize: '0.95rem',
                                textOutline: 'none'
                            }
                        },
                        colorByPoint: true,
                        colors: [
                            '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
                            '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6'
                        ]
                    }
                },
                series: [{
                    name: 'Portfolio Value',
                    data: data.map(d => ({
                        y: d.y,
                        percentage: d.percentage
                    }))
                }],
                credits: { enabled: false },
                legend: { enabled: false }
            });
        },
        
        createPortfolioValueChart: function() {
            const container = document.getElementById('portfolioValueChart');
            if (!container || this.portfolio.length === 0) return;
            
            const sorted = [...this.portfolio].sort((a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate));
            
            // ✅ Noms des propriétés au lieu des dates
            const categories = sorted.map(p => p.name || 'Unknown Property');
            
            const purchaseData = sorted.map(p => p.purchasePrice);
            const currentData = sorted.map(p => p.currentValue);
            const equityData = sorted.map(p => p.equity);
            
            const chartColors = this.getChartColors();
            
            if (this.charts.portfolioValue) {
                this.charts.portfolioValue.destroy();
            }
            
            this.charts.portfolioValue = Highcharts.chart('portfolioValueChart', {
                chart: {
                    type: 'column',
                    backgroundColor: 'transparent',
                    style: { fontFamily: 'Inter, sans-serif' }
                },
                title: {
                    text: 'Property Values Evolution',
                    style: { color: chartColors.title }
                },
                xAxis: {
                    categories: categories,
                    labels: { style: { color: chartColors.text } },
                    gridLineColor: chartColors.gridLine,
                    lineColor: chartColors.axisLine
                },
                yAxis: {
                    title: { text: 'Value (€)', style: { color: chartColors.title } },
                    labels: { style: { color: chartColors.text } },
                    gridLineColor: chartColors.gridLine
                },
                tooltip: {
                    shared: true,
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    style: { color: chartColors.text },
                    valuePrefix: '€'
                },
                plotOptions: {
                    column: {
                        borderRadius: 8
                    }
                },
                series: [{
                    name: 'Purchase Price',
                    data: purchaseData,
                    color: '#6c757d'
                }, {
                    name: 'Current Value',
                    data: currentData,
                    color: '#3b82f6'
                }, {
                    name: 'Equity',
                    data: equityData,
                    color: '#10b981'
                }],
                credits: { enabled: false },
                legend: {
                    itemStyle: { color: chartColors.text }
                }
            });
        },
        
        viewPropertyDetails: function(propId) {
            const prop = this.portfolio.find(p => p.id === propId);
            if (!prop) return;
            
            alert(`Property Details:\n\n${JSON.stringify(prop, null, 2)}`);
        },
        
        // ========== CALCULATIONS (unchanged from original) ==========
        
        performCalculations: function() {
            const sim = this.currentSimulation;
            const rules = this.taxRules[sim.country];
            const isPrimary = sim.propertyType === 'primary';
            const isRental = sim.propertyType === 'rental';
            
            const results = {};
            
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
            
            let annualPropertyTax = 0;
            if (sim.country === 'uk') {
                annualPropertyTax = rules.councilTax;
            } else if (rules.propertyTaxRate) {
                annualPropertyTax = sim.purchasePrice * rules.propertyTaxRate;
            }
            
            results.annualPropertyTax = annualPropertyTax;
            results.monthlyPropertyTax = annualPropertyTax / 12;
            
            results.annualInsurance = sim.purchasePrice * 0.003;
            results.monthlyInsurance = results.annualInsurance / 12;
            
            results.totalMonthlyPayment = monthlyPayment + results.monthlyPropertyTax + results.monthlyInsurance;
            
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
            results.debtRatio = sim.monthlySalary > 0 ? (results.totalMonthlyPayment / sim.monthlySalary) * 100 : 0;
            results.remainingBudget = sim.monthlySalary - results.totalMonthlyPayment;
            
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
            
            results.wealthEvolution = this.calculateWealthEvolution(sim, results);
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
            const appreciationRate = this.taxRules[sim.country].annualAppreciationRate || 0.03;
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
        
        // ========== UPDATE UI (unchanged from original) ==========
        
        updateKPIs: function(results) {
            const sim = this.currentSimulation;
            const rules = this.taxRules[sim.country];
            
            // ✅ VÉRIFICATIONS pour éviter les erreurs
            if (!results || !rules) {
                console.warn('⚠ Missing results or rules in updateKPIs');
                return;
            }
            
            // ✅ Valeurs par défaut pour éviter undefined
            const purchasePrice = sim.purchasePrice || 0;
            const downPayment = sim.downPayment || 0;
            const totalMonthlyPayment = results.totalMonthlyPayment || 0;
            const netYield = results.netYield || 0;
            const totalCost = results.totalCost || 0;
            const debtRatio = results.debtRatio || 0;
            
            // ✅ Mise à jour sécurisée
            const kpiPurchasePrice = document.getElementById('kpiPurchasePrice');
            const kpiDownPayment = document.getElementById('kpiDownPayment');
            const kpiMonthlyPayment = document.getElementById('kpiMonthlyPayment');
            const kpiNetYield = document.getElementById('kpiNetYield');
            const kpiTotalCost = document.getElementById('kpiTotalCost');
            const kpiDebtRatio = document.getElementById('kpiDebtRatio');
            
            if (kpiPurchasePrice) kpiPurchasePrice.textContent = this.formatCurrency(purchasePrice, rules.currencySymbol);
            if (kpiDownPayment) kpiDownPayment.textContent = this.formatCurrency(downPayment, rules.currencySymbol);
            if (kpiMonthlyPayment) kpiMonthlyPayment.textContent = this.formatCurrency(totalMonthlyPayment, rules.currencySymbol);
            if (kpiNetYield) kpiNetYield.textContent = netYield.toFixed(2) + '%';
            if (kpiTotalCost) kpiTotalCost.textContent = this.formatCurrency(totalCost, rules.currencySymbol);
            
            if (kpiDebtRatio) {
                kpiDebtRatio.textContent = debtRatio.toFixed(1) + '%';
                
                // Couleur conditionnelle
                if (debtRatio <= 33) {
                    kpiDebtRatio.style.color = '#10b981';
                } else if (debtRatio <= 40) {
                    kpiDebtRatio.style.color = '#f59e0b';
                } else {
                    kpiDebtRatio.style.color = '#ef4444';
                }
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
                yAxis: [{
                    // ✅ Axe Y primaire (gauche) - Paiements mensuels
                    title: { 
                        text: 'Monthly Payments', 
                        style: { color: chartColors.title } 
                    },
                    labels: { 
                        style: { color: chartColors.text },
                        formatter: function() {
                            return '€' + (this.value / 1000).toFixed(1) + 'k';
                        }
                    },
                    gridLineColor: chartColors.gridLine
                }, {
                    // ✅ Axe Y secondaire (droite) - Balance restante
                    title: { 
                        text: 'Remaining Balance', 
                        style: { color: '#3b82f6' } 
                    },
                    labels: { 
                        style: { color: '#3b82f6' },
                        formatter: function() {
                            return '€' + (this.value / 1000).toFixed(0) + 'k';
                        }
                    },
                    opposite: true,
                    gridLineColor: 'transparent'
                }],
                tooltip: {
                    shared: true,
                    backgroundColor: chartColors.tooltipBg,
                    borderColor: chartColors.tooltipBorder,
                    style: { color: chartColors.text },
                    useHTML: true,
                    formatter: function() {
                        const rules = RealEstateSimulator.taxRules[RealEstateSimulator.currentSimulation.country];
                        const symbol = rules.currencySymbol;
                        let html = '<div style="padding: 8px;"><strong>' + this.x + '</strong><br/>';
                        
                        this.points.forEach(point => {
                            html += '<span style="color:' + point.color + '">●</span> ' + 
                                point.series.name + ': <strong>' + symbol + point.y.toLocaleString() + '</strong><br/>';
                        });
                        
                        html += '</div>';
                        return html;
                    }
                },
                plotOptions: {
                    column: {
                        borderRadius: 4,
                        stacking: 'normal' // ✅ Empilement UNIQUEMENT pour les colonnes
                    },
                    line: {
                        lineWidth: 3,
                        marker: { 
                            enabled: true,
                            radius: 4,
                            symbol: 'circle'
                        }
                    }
                },
                series: [{
                    // ✅ Principal Payment - Colonne verte
                    name: 'Principal Payment',
                    type: 'column',
                    data: years.map(item => item.principal),
                    color: '#10b981',
                    yAxis: 0 // Axe gauche
                }, {
                    // ✅ Interest Payment - Colonne rouge
                    name: 'Interest Payment',
                    type: 'column',
                    data: years.map(item => item.interest),
                    color: '#ef4444',
                    yAxis: 0 // Axe gauche
                }, {
                    // ✅ Remaining Balance - Ligne bleue
                    name: 'Remaining Balance',
                    type: 'line',
                    data: years.map(item => item.balance),
                    color: '#3b82f6',
                    lineWidth: 4,
                    yAxis: 1, // ✅ Axe droit
                    marker: {
                        enabled: true,
                        radius: 5,
                        fillColor: '#3b82f6',
                        lineWidth: 2,
                        lineColor: '#ffffff'
                    },
                    dashStyle: 'Solid',
                    zIndex: 10 // ✅ Au-dessus des colonnes
                }],
                credits: { enabled: false },
                legend: {
                    itemStyle: { color: chartColors.text },
                    align: 'center',
                    verticalAlign: 'bottom',
                    layout: 'horizontal'
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
            this.createPortfolioCharts();
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
                    purchaseDate: simulation.purchaseDate,
                    paymentsMade: simulation.paymentsMade || 0, // ✨ NOUVEAU
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
                                purchaseDate: data.purchaseDate,
                                paymentsMade: data.paymentsMade || 0, // ✨ NOUVEAU
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
            
            this.renderSimulationsList(); // ✨ NOUVEAU NOM
        },
        
        // ✨ NOUVEAU : RENDER SIMULATIONS LIST (style amélioré)
        renderSimulationsList: function() {
            const container = document.getElementById('simulationsList'); // ✨ NOUVEAU ID
            if (!container) {
                // Fallback to old ID
                return this.renderSavedSimulations();
            }
            
            if (this.savedSimulations.length === 0) {
                container.innerHTML = `
                    <div class='simulations-empty'>
                        <i class='fas fa-inbox'></i>
                        <p>No saved simulations yet</p>
                        <button class='btn-sm btn-primary' onclick='RealEstateSimulator.newSimulation()'>
                            Create First Simulation
                        </button>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = this.savedSimulations.map(sim => {
                const rules = this.taxRules[sim.country];
                const date = new Date(sim.updatedAt || sim.createdAt);
                const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                
                return `
                    <div class='simulation-item' data-sim-id='${sim.id}'>
                        <div class='simulation-info'>
                            <div class='simulation-header'>
                                <h4>${this.escapeHtml(sim.name)}</h4>
                                <span class='simulation-badge'>${rules.flag} ${rules.name}</span>
                            </div>
                            <div class='simulation-details'>
                                <span><i class='fas fa-home'></i> ${this.formatPropertyType(sim.propertyType)}</span>
                                <span><i class='fas fa-tag'></i> ${this.formatCurrency(sim.purchasePrice, rules.currencySymbol)}</span>
                                <span><i class='fas fa-calendar'></i> ${dateStr}</span>
                            </div>
                            <div class='simulation-metrics'>
                                <div class='metric'>
                                    <small>Monthly</small>
                                    <strong>${this.formatCurrency(sim.results?.totalMonthlyPayment || 0, rules.currencySymbol)}</strong>
                                </div>
                                <div class='metric'>
                                    <small>Yield</small>
                                    <strong>${(sim.results?.netYield || 0).toFixed(2)}%</strong>
                                </div>
                                <div class='metric'>
                                    <small>Rate</small>
                                    <strong>${sim.interestRate}%</strong>
                                </div>
                            </div>
                        </div>
                        <div class='simulation-actions'>
                            <button class='btn-icon' onclick='RealEstateSimulator.loadSimulation("${sim.id}")' title='Load'>
                                <i class='fas fa-upload'></i>
                            </button>
                            <button class='btn-icon' onclick='RealEstateSimulator.duplicateSimulation("${sim.id}")' title='Duplicate'>
                                <i class='fas fa-copy'></i>
                            </button>
                            <button class='btn-icon btn-danger' onclick='RealEstateSimulator.deleteSimulation("${sim.id}")' title='Delete'>
                                <i class='fas fa-trash'></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        },
        
        // Ancien render (fallback)
        renderSavedSimulations: function() {
            const container = document.getElementById('savedSimulationsList');
            if (!container) return;
            
            this.renderSimulationsList();
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
            this.unsavedChanges = false;
            this.updateSaveButtonState();
            
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
            this.renderSimulationsList();
            this.buildPortfolioFromSimulations();
            this.renderPortfolioDashboard();
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
            this.renderSimulationsList();
            this.buildPortfolioFromSimulations();
            this.renderPortfolioDashboard();
            this.showNotification(`Simulation "${sim.name}" deleted`, 'success');
        },
        
        newSimulation: function() {
            if (this.unsavedChanges) {
                if (!confirm('You have unsaved changes. Create a new simulation anyway?')) {
                    return;
                }
            }
            
            this.currentSimulation = {
                id: null,
                name: '',
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
                purchaseDate: null,
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
            document.getElementById('inputMonthlySalary').value = '';
            document.getElementById('inputCity').value = '';
            document.getElementById('inputMonthlyRent').value = '';
            document.getElementById('inputOccupancyRate').value = '90';
            document.getElementById('inputMonthlyCharges').value = '';
            document.getElementById('inputVacancyProvision').value = '1';
            
            this.toggleRentalSection(false);
            this.updateCurrentInfo();
            this.unsavedChanges = false;
            this.updateSaveButtonState();
            
            document.getElementById('borrowingCapacitySection').style.display = 'none';
            document.getElementById('taxFeesSection').style.display = 'none';
            document.getElementById('financialResultsSection').style.display = 'none';
            document.getElementById('chartsSection').style.display = 'none';
            document.getElementById('comparisonSection').style.display = 'none';
            
            this.showNotification('✅ New simulation created', 'success');
        },
        
        // ========== EXPORT ==========
        
        exportToExcel: function() {
            if (this.portfolio.length === 0) {
                alert('No properties to export');
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
(function addNotificationStyles() {
    const style = document.createElement('style');
    style.id = 'real-estate-notification-styles';
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
        
        /* ✨ NOUVEAU : MODAL STYLES */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }
        
        .modal-content {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            max-height: 90vh;
            overflow-y: auto;
            animation: scaleIn 0.3s ease;
        }
        
        body.dark-mode .modal-content {
            background: #1e293b;
        }
        
        .modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px 32px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        body.dark-mode .modal-header {
            border-bottom-color: #334155;
        }
        
        .modal-header h2 {
            font-size: 1.5rem;
            font-weight: 800;
            margin: 0;
        }
        
        .modal-body {
            padding: 32px;
        }
        
        .btn-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6c757d;
            transition: color 0.2s;
        }
        
        .btn-close:hover {
            color: #ef4444;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            font-weight: 700;
            margin-bottom: 8px;
            color: #1f2937;
        }
        
        body.dark-mode .form-group label {
            color: #ffffff;
        }
        
        .form-control {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.2s;
        }
        
        .form-control:focus {
            outline: none;
            border-color: #3b82f6;
        }
        
        body.dark-mode .form-control {
            background: #0f172a;
            border-color: #334155;
            color: #ffffff;
        }
        
        .form-help {
            display: block;
            margin-top: 4px;
            font-size: 0.875rem;
            color: #6c757d;
        }
        
        .form-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            margin-top: 24px;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes scaleIn {
            from {
                transform: scale(0.95);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        /* ✨ NOUVEAU : SIMULATION ITEM STYLES */
        .simulation-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px;
            background: #ffffff;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            margin-bottom: 12px;
            transition: all 0.3s ease;
        }
        
        body.dark-mode .simulation-item {
            background: #1e293b;
            border-color: #334155;
        }
        
        .simulation-item:hover {
            border-color: #3b82f6;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
            transform: translateY(-2px);
        }
        
        .simulation-info {
            flex: 1;
        }
        
        .simulation-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }
        
        .simulation-header h4 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 700;
        }
        
        .simulation-badge {
            padding: 4px 12px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .simulation-details {
            display: flex;
            gap: 16px;
            margin-bottom: 12px;
            font-size: 0.875rem;
            color: #6c757d;
        }
        
        .simulation-details i {
            margin-right: 4px;
        }
        
        .simulation-metrics {
            display: flex;
            gap: 24px;
        }
        
        .simulation-metrics .metric {
            text-align: left;
        }
        
        .simulation-metrics .metric small {
            display: block;
            font-size: 0.75rem;
            color: #6c757d;
            margin-bottom: 4px;
        }
        
        .simulation-metrics .metric strong {
            display: block;
            font-size: 1rem;
            color: #10b981;
        }
        
        /* ✅ SIMULATION ACTIONS - DESKTOP */
        .simulation-actions {
            display: flex;
            gap: 8px;
        }
        
        /* ✨ NOUVEAU : RENT VS BUY RESULTS */
        .rent-vs-buy-results {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .result-card {
            background: #f8fafc;
            padding: 24px;
            border-radius: 12px;
            border: 2px solid #e5e7eb;
        }
        
        body.dark-mode .result-card {
            background: #0f172a;
            border-color: #334155;
        }
        
        .result-card h3 {
            margin-top: 0;
            margin-bottom: 16px;
            font-size: 1.25rem;
        }
        
        .result-metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        body.dark-mode .result-metric {
            border-bottom-color: #334155;
        }
        
        .result-metric:last-child {
            border-bottom: none;
        }
        
        .result-metric label {
            font-weight: 600;
            color: #6c757d;
        }
        
        .result-metric strong {
            font-size: 1.125rem;
        }
        
        .recommendation {
            padding: 20px;
            text-align: center;
            border-radius: 12px;
            font-size: 1.125rem;
        }
        
        .recommendation-buy {
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 24px;
            border-radius: 12px;
        }
        
        .recommendation-rent {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            padding: 24px;
            border-radius: 12px;
        }
        
        /* ✨ NOUVEAU : COMPARISON GRID */
        .comparison-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 24px;
        }
        
        .comparison-card {
            background: #ffffff;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 24px;
        }
        
        body.dark-mode .comparison-card {
            background: #1e293b;
            border-color: #334155;
        }
        
        .comparison-card h3 {
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 1.25rem;
        }
        
        .comparison-metrics {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .comparison-metrics .metric {
            display: flex;
            justify-content: space-between;
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        body.dark-mode .comparison-metrics .metric {
            background: #0f172a;
        }
        
        /* ========================================
           🔥 RESPONSIVE MOBILE - MEDIA QUERIES
           ======================================== */
        
        @media (max-width: 768px) {
            /* ✅ MODAL RESPONSIVE */
            .modal-content {
                width: 100%;
                max-width: 100%;
                min-height: 100vh;
                max-height: none;
                margin: 0;
                border-radius: 0;
            }
            
            .modal-header {
                padding: 16px 20px;
            }
            
            .modal-header h2 {
                font-size: 1.1rem;
            }
            
            .modal-body {
                padding: 16px;
            }
            
            /* ✅ FORM RESPONSIVE */
            .form-row {
                grid-template-columns: 1fr;
                gap: 12px;
            }
            
            .form-actions {
                flex-direction: column;
                gap: 10px;
            }
            
            .form-actions button {
                width: 100%;
            }
            
            /* ✅ SIMULATION ITEM RESPONSIVE */
            .simulation-item {
                flex-direction: column;
                align-items: stretch;
                gap: 16px;
            }
            
            .simulation-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 8px;
            }
            
            .simulation-details {
                flex-direction: column;
                gap: 8px;
            }
            
            .simulation-metrics {
                flex-direction: column;
                gap: 12px;
            }
            
            /* 🔥 SIMULATION ACTIONS - VERTICAL & COMPACT SUR MOBILE */
            .simulation-actions {
                display: flex !important;
                flex-direction: column !important;
                gap: 6px !important;
                width: 100% !important;
            }
            
            .simulation-actions button,
            .simulation-actions .btn-icon {
                width: 100% !important;
                padding: 10px 14px !important;
                font-size: 0.85rem !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 6px !important;
                border-radius: 10px !important;
            }
            
            .simulation-actions button i,
            .simulation-actions .btn-icon i {
                font-size: 0.9rem !important;
            }
            
            .simulation-actions button span,
            .simulation-actions .btn-icon span {
                font-size: 0.85rem !important;
            }
            
            /* ✅ RENT VS BUY RESPONSIVE */
            .rent-vs-buy-results {
                grid-template-columns: 1fr;
                gap: 16px;
            }
            
            /* ✅ COMPARISON GRID RESPONSIVE */
            .comparison-grid {
                grid-template-columns: 1fr;
                gap: 16px;
            }
        }
        
        @media (max-width: 480px) {
            .modal-header {
                padding: 12px 16px;
            }
            
            .modal-header h2 {
                font-size: 1rem;
            }
            
            .modal-body {
                padding: 12px;
            }
            
            .simulation-item {
                padding: 16px;
            }
            
            /* 🔥 SIMULATION ACTIONS - ENCORE PLUS COMPACT */
            .simulation-actions button,
            .simulation-actions .btn-icon {
                padding: 9px 12px !important;
                font-size: 0.8rem !important;
            }
            
            .simulation-actions button i,
            .simulation-actions .btn-icon i {
                font-size: 0.85rem !important;
            }
            
            .simulation-actions button span,
            .simulation-actions .btn-icon span {
                font-size: 0.8rem !important;
            }
        }
    `;
    
    if (!document.getElementById('real-estate-notification-styles')) {
        document.head.appendChild(style);
    }
})();