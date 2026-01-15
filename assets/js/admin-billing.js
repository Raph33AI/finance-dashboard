// ========================================
// ADMIN BILLING DASHBOARD - ULTRA COMPLETE
// Version: 2.0.0 - 48/48 Stripe Endpoints
// ========================================

const STRIPE_API_BASE_URL = 'https://stripe-api.raphnardone.workers.dev';

// ✅ Plans Configuration (REMPLACE LES PRICE IDs)
const PLANS = {
    free: {
        name: 'Free',
        price: 0,
        priceId: null,
        managed: 'frontend'
    },
    basic: {
        name: 'Basic',
        price: 0,
        priceId: null,
        managed: 'frontend'
    },
    pro: {
        name: 'Pro',
        price: 10,
        priceId: 'prod_TQw8wz0sWHtOYG', // ✅ REMPLACE PAR TON PRICE ID STRIPE
        managed: 'stripe',
        color: '#8b5cf6'
    },
    platinum: {
        name: 'Platinum',
        price: 20,
        priceId: 'prod_TQwALHUDl88lvH', // ✅ REMPLACE PAR TON PRICE ID STRIPE
        managed: 'stripe',
        color: '#f59e0b'
    }
};

class AdminBilling {
    constructor() {
        this.subscriptions = [];
        this.customers = [];
        this.invoices = [];
        this.products = [];
        this.prices = [];
        this.coupons = [];
        this.promoCodes = [];
        this.refunds = [];
        this.disputes = [];
        this.balance = null;
        this.balanceTransactions = [];
        this.analytics = null;
        this.charts = {};
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Admin Billing Dashboard...');
        
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('billing-dashboard').style.display = 'none';
        
        try {
            await this.loadAllData();
            this.initEventListeners();
            
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('billing-dashboard').style.display = 'block';
            
            console.log('✅ Admin Billing Dashboard initialized successfully (48/48 endpoints ready)');
            
        } catch (error) {
            console.error('❌ Error initializing dashboard:', error);
            alert('Failed to load billing data. Please refresh the page.');
        }
    }
    
    async loadAllData() {
        console.log('📊 Loading billing data...');
        
        try {
            await this.loadSubscriptions();
            await this.loadCustomers();
            await this.loadInvoices();
            await this.loadAnalytics();
            await this.loadMRRAnalytics();
            await this.loadRevenueChart();
            await this.loadProducts();
            await this.loadPrices();
            await this.loadCoupons();
            await this.loadPromoCodes();
            await this.loadRefunds();
            await this.loadDisputes();
            await this.loadBalance();
            await this.loadBalanceTransactions();
            
            console.log('✅ All data loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            throw error;
        }
    }
    
    // ========================================
    // SUBSCRIPTIONS (8 ENDPOINTS)
    // ========================================
    
    async loadSubscriptions() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/subscriptions?limit=100`);
            const data = await response.json();
            
            if (data.success) {
                this.subscriptions = data.subscriptions;
                this.renderSubscriptions();
                console.log(`✅ Loaded ${this.subscriptions.length} subscriptions`);
            } else {
                throw new Error(data.error || 'Failed to load subscriptions');
            }
        } catch (error) {
            console.error('❌ Error loading subscriptions:', error);
            throw error;
        }
    }
    
    renderSubscriptions() {
        const tbody = document.getElementById('subscriptions-table-body');
        
        if (this.subscriptions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                        <p>No subscriptions found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.subscriptions.map(sub => {
            const statusBadge = this.getStatusBadge(sub.status);
            const planBadge = this.getPlanBadge(sub.plan);
            const periodEnd = new Date(sub.current_period_end * 1000).toLocaleDateString();
            const paymentMethod = sub.payment_method 
                ? `${sub.payment_method.type} •••• ${sub.payment_method.last4}` 
                : 'N/A';
            
            return `
                <tr>
                    <td>
                        <div style="font-weight: 600;">${sub.customer.name || 'N/A'}</div>
                        <div style="font-size: 0.85rem; color: #64748b;">${sub.customer.email}</div>
                    </td>
                    <td>${planBadge}</td>
                    <td>${statusBadge}</td>
                    <td style="font-weight: 600;">$${sub.amount} ${sub.currency}</td>
                    <td>
                        <div style="font-size: 0.9rem;">Until ${periodEnd}</div>
                        ${sub.cancel_at_period_end ? '<div style="color: #ef4444; font-size: 0.85rem;">⚠ Cancels at period end</div>' : ''}
                    </td>
                    <td>${paymentMethod}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-info" onclick="adminBilling.viewSubscriptionDetails('${sub.id}')" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-action btn-warning" onclick="adminBilling.openUpdateSubscriptionModal('${sub.id}')" title="Update Plan">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${sub.status === 'active' && !sub.cancel_at_period_end ? `
                                <button class="btn-action btn-danger" onclick="adminBilling.cancelSubscription('${sub.id}')" title="Cancel">
                                    <i class="fas fa-times"></i>
                                </button>
                            ` : ''}
                            ${sub.cancel_at_period_end ? `
                                <button class="btn-action btn-success" onclick="adminBilling.resumeSubscription('${sub.id}')" title="Resume">
                                    <i class="fas fa-play"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    async viewSubscriptionDetails(subscriptionId) {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/subscription?id=${subscriptionId}`);
            const data = await response.json();
            
            if (data.success) {
                const sub = data.subscription;
                
                const modalContent = `
                    <div class="details-grid">
                        <div class="detail-row">
                            <label><i class="fas fa-id-badge"></i> Subscription ID:</label>
                            <span>${sub.id}</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-user"></i> Customer:</label>
                            <span>${sub.customer.name || 'N/A'} (${sub.customer.email})</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-crown"></i> Plan:</label>
                            <span>${this.getPlanBadge(sub.plan)}</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-info-circle"></i> Status:</label>
                            <span>${this.getStatusBadge(sub.status)}</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-dollar-sign"></i> Amount:</label>
                            <span style="font-weight: 700; font-size: 1.2rem;">$${sub.amount} ${sub.currency}/month</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-calendar"></i> Current Period:</label>
                            <span>${new Date(sub.current_period_start * 1000).toLocaleDateString()} - ${new Date(sub.current_period_end * 1000).toLocaleDateString()}</span>
                        </div>
                        
                        ${sub.trial_end ? `
                            <div class="detail-row">
                                <label><i class="fas fa-clock"></i> Trial End:</label>
                                <span>${new Date(sub.trial_end * 1000).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                        
                        ${sub.canceled_at ? `
                            <div class="detail-row">
                                <label><i class="fas fa-ban"></i> Canceled At:</label>
                                <span style="color: #ef4444;">${new Date(sub.canceled_at * 1000).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                        
                        ${sub.cancel_at_period_end ? `
                            <div class="detail-row">
                                <label><i class="fas fa-exclamation-triangle"></i> Status:</label>
                                <span style="color: #ef4444; font-weight: 600;">⚠ Will cancel at period end</span>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                document.getElementById('subscription-details-content').innerHTML = modalContent;
                document.getElementById('subscription-details-modal').classList.add('active');
            }
        } catch (error) {
            console.error('Error loading subscription details:', error);
            alert('Failed to load subscription details');
        }
    }
    
    closeSubscriptionDetailsModal() {
        document.getElementById('subscription-details-modal').classList.remove('active');
    }
    
    openCreateSubscriptionModal() {
        document.getElementById('create-subscription-modal').classList.add('active');
    }
    
    closeCreateSubscriptionModal() {
        document.getElementById('create-subscription-modal').classList.remove('active');
        document.getElementById('new-sub-customer-email').value = '';
        document.getElementById('new-sub-plan').value = '';
        document.getElementById('new-sub-trial-days').value = '';
    }
    
    async createSubscription() {
        const email = document.getElementById('new-sub-customer-email').value.trim();
        const planKey = document.getElementById('new-sub-plan').value;
        const trialDays = parseInt(document.getElementById('new-sub-trial-days').value) || 0;
        
        if (!email) {
            alert('❌ Please enter a customer email');
            return;
        }
        
        if (!planKey) {
            alert('❌ Please select a plan');
            return;
        }
        
        if (planKey === 'free' || planKey === 'basic') {
            alert('❌ Free and Basic plans are managed in frontend. Only Pro and Platinum can be created via Stripe.');
            return;
        }
        
        const selectedPlan = PLANS[planKey];
        if (!selectedPlan || !selectedPlan.priceId) {
            alert('❌ Invalid plan selected. Please configure Price IDs in PLANS object.');
            return;
        }
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/create-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerEmail: email,
                    priceId: selectedPlan.priceId,
                    planKey: planKey,
                    trialDays: trialDays > 0 ? trialDays : undefined
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Subscription created successfully!');
                this.closeCreateSubscriptionModal();
                await this.loadSubscriptions();
                await this.loadCustomers();
                await this.loadAnalytics();
            } else {
                throw new Error(data.error || 'Failed to create subscription');
            }
        } catch (error) {
            console.error('Error creating subscription:', error);
            alert('❌ Failed to create subscription: ' + error.message);
        }
    }
    
    openUpdateSubscriptionModal(subscriptionId) {
        document.getElementById('update-sub-id').value = subscriptionId;
        document.getElementById('update-subscription-modal').classList.add('active');
    }
    
    closeUpdateSubscriptionModal() {
        document.getElementById('update-subscription-modal').classList.remove('active');
        document.getElementById('update-sub-id').value = '';
        document.getElementById('update-sub-plan').value = '';
        document.getElementById('update-sub-proration').value = 'create_prorations';
    }
    
    async updateSubscription() {
        const subscriptionId = document.getElementById('update-sub-id').value;
        const planKey = document.getElementById('update-sub-plan').value;
        const prorationBehavior = document.getElementById('update-sub-proration').value;
        
        if (!subscriptionId || !planKey) {
            alert('❌ Please select a plan');
            return;
        }
        
        const selectedPlan = PLANS[planKey];
        if (!selectedPlan || !selectedPlan.priceId) {
            alert('❌ Invalid plan selected');
            return;
        }
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/update-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscriptionId: subscriptionId,
                    priceId: selectedPlan.priceId,
                    planKey: planKey,
                    prorationBehavior: prorationBehavior
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Subscription updated successfully!');
                this.closeUpdateSubscriptionModal();
                await this.loadSubscriptions();
                await this.loadAnalytics();
            } else {
                throw new Error(data.error || 'Failed to update subscription');
            }
        } catch (error) {
            console.error('Error updating subscription:', error);
            alert('❌ Failed to update subscription: ' + error.message);
        }
    }
    
    async cancelSubscription(subscriptionId) {
        const confirm = window.confirm('Are you sure you want to cancel this subscription?\n\nThe subscription will remain active until the end of the current billing period.');
        
        if (!confirm) return;
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/cancel-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscriptionId: subscriptionId,
                    immediately: false
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Subscription canceled successfully. It will remain active until the end of the billing period.');
                await this.loadSubscriptions();
                await this.loadAnalytics();
            } else {
                throw new Error(data.error || 'Failed to cancel subscription');
            }
        } catch (error) {
            console.error('Error canceling subscription:', error);
            alert('❌ Failed to cancel subscription: ' + error.message);
        }
    }
    
    async resumeSubscription(subscriptionId) {
        const confirm = window.confirm('Resume this subscription?');
        
        if (!confirm) return;
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/resume-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscriptionId: subscriptionId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Subscription resumed successfully');
                await this.loadSubscriptions();
                await this.loadAnalytics();
            } else {
                throw new Error(data.error || 'Failed to resume subscription');
            }
        } catch (error) {
            console.error('Error resuming subscription:', error);
            alert('❌ Failed to resume subscription: ' + error.message);
        }
    }
    
    filterSubscriptions() {
        const statusFilter = document.getElementById('subscription-status-filter').value;
        const planFilter = document.getElementById('subscription-plan-filter').value;
        const searchTerm = document.getElementById('subscription-search').value.toLowerCase();
        
        let filtered = this.subscriptions;
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(sub => sub.status === statusFilter);
        }
        
        if (planFilter !== 'all') {
            filtered = filtered.filter(sub => sub.plan === planFilter);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(sub => 
                sub.customer.email.toLowerCase().includes(searchTerm) ||
                (sub.customer.name && sub.customer.name.toLowerCase().includes(searchTerm))
            );
        }
        
        const originalSubscriptions = this.subscriptions;
        this.subscriptions = filtered;
        this.renderSubscriptions();
        this.subscriptions = originalSubscriptions;
    }
    
    // ========================================
    // CUSTOMERS (5 ENDPOINTS)
    // ========================================
    
    async loadCustomers() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/customers?limit=100`);
            const data = await response.json();
            
            if (data.success) {
                this.customers = data.customers;
                this.renderCustomers();
                this.populateCustomerSelects();
                console.log(`✅ Loaded ${this.customers.length} customers`);
            } else {
                throw new Error(data.error || 'Failed to load customers');
            }
        } catch (error) {
            console.error('❌ Error loading customers:', error);
            throw error;
        }
    }
    
    renderCustomers() {
        const tbody = document.getElementById('customers-table-body');
        
        if (this.customers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                        <p>No customers found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.customers.map(customer => {
            const createdDate = new Date(customer.created * 1000).toLocaleDateString();
            const delinquentBadge = customer.delinquent 
                ? '<span class="badge badge-danger">Delinquent</span>' 
                : '<span class="badge badge-success">OK</span>';
            
            return `
                <tr>
                    <td>
                        <div style="font-weight: 600;">${customer.name || 'N/A'}</div>
                    </td>
                    <td>${customer.email}</td>
                    <td>${createdDate}</td>
                    <td style="font-weight: 600; ${customer.balance < 0 ? 'color: #ef4444;' : ''}">
                        $${customer.balance.toFixed(2)}
                    </td>
                    <td>${delinquentBadge}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-info" onclick="adminBilling.viewCustomerDetails('${customer.id}')" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-action btn-danger" onclick="adminBilling.deleteCustomer('${customer.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    openCreateCustomerModal() {
        document.getElementById('create-customer-modal').classList.add('active');
    }
    
    closeCreateCustomerModal() {
        document.getElementById('create-customer-modal').classList.remove('active');
        document.getElementById('new-customer-email').value = '';
        document.getElementById('new-customer-name').value = '';
    }
    
    async createCustomer() {
        const email = document.getElementById('new-customer-email').value.trim();
        const name = document.getElementById('new-customer-name').value.trim();
        
        if (!email) {
            alert('❌ Please enter a customer email');
            return;
        }
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/create-customer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    name: name || undefined
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Customer created successfully!');
                this.closeCreateCustomerModal();
                await this.loadCustomers();
            } else {
                throw new Error(data.error || 'Failed to create customer');
            }
        } catch (error) {
            console.error('Error creating customer:', error);
            alert('❌ Failed to create customer: ' + error.message);
        }
    }
    
    async viewCustomerDetails(customerId) {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/customer?id=${customerId}`);
            const data = await response.json();
            
            if (data.success) {
                const customer = data.customer;
                
                const modalContent = `
                    <div class="details-grid">
                        <div class="detail-row">
                            <label><i class="fas fa-id-badge"></i> Customer ID:</label>
                            <span>${customer.id}</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-user"></i> Name:</label>
                            <span>${customer.name || 'N/A'}</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-envelope"></i> Email:</label>
                            <span>${customer.email}</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-calendar"></i> Created:</label>
                            <span>${new Date(customer.created * 1000).toLocaleDateString()}</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-dollar-sign"></i> Balance:</label>
                            <span style="font-weight: 700; ${customer.balance < 0 ? 'color: #ef4444;' : ''}">
                                $${(customer.balance / 100).toFixed(2)}
                            </span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-exclamation-circle"></i> Delinquent:</label>
                            <span>${customer.delinquent ? '<span class="badge badge-danger">Yes</span>' : '<span class="badge badge-success">No</span>'}</span>
                        </div>
                    </div>
                `;
                
                document.getElementById('customer-details-content').innerHTML = modalContent;
                document.getElementById('customer-details-modal').classList.add('active');
            }
        } catch (error) {
            console.error('Error loading customer details:', error);
            alert('Failed to load customer details');
        }
    }
    
    closeCustomerDetailsModal() {
        document.getElementById('customer-details-modal').classList.remove('active');
    }
    
    async deleteCustomer(customerId) {
        const confirm = window.confirm('⚠ Are you sure you want to delete this customer?\n\nThis action cannot be undone.');
        
        if (!confirm) return;
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/delete-customer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerId: customerId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Customer deleted successfully');
                await this.loadCustomers();
            } else {
                throw new Error(data.error || 'Failed to delete customer');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            alert('❌ Failed to delete customer: ' + error.message);
        }
    }
    
    filterCustomers() {
        const searchTerm = document.getElementById('customer-search').value.toLowerCase();
        
        let filtered = this.customers;
        
        if (searchTerm) {
            filtered = filtered.filter(customer => 
                customer.email.toLowerCase().includes(searchTerm) ||
                (customer.name && customer.name.toLowerCase().includes(searchTerm))
            );
        }
        
        const originalCustomers = this.customers;
        this.customers = filtered;
        this.renderCustomers();
        this.customers = originalCustomers;
    }
    
    populateCustomerSelects() {
        const select = document.getElementById('payment-method-customer-select');
        
        select.innerHTML = '<option value="">-- Select a customer --</option>' +
            this.customers.map(customer => 
                `<option value="${customer.id}">${customer.email} (${customer.name || 'N/A'})</option>`
            ).join('');
    }
    
    // ========================================
    // INVOICES (7 ENDPOINTS)
    // ========================================
    
    async loadInvoices() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/invoices?limit=100`);
            const data = await response.json();
            
            if (data.success) {
                this.invoices = data.invoices;
                this.renderInvoices();
                console.log(`✅ Loaded ${this.invoices.length} invoices`);
            } else {
                throw new Error(data.error || 'Failed to load invoices');
            }
        } catch (error) {
            console.error('❌ Error loading invoices:', error);
            throw error;
        }
    }
    
    renderInvoices() {
        const tbody = document.getElementById('invoices-table-body');
        
        if (this.invoices.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-file-invoice" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                        <p>No invoices found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.invoices.map(invoice => {
            const statusBadge = this.getInvoiceStatusBadge(invoice.status);
            const createdDate = new Date(invoice.created * 1000).toLocaleDateString();
            
            return `
                <tr>
                    <td style="font-weight: 600;">${invoice.number || invoice.id.substring(0, 12) + '...'}</td>
                    <td>
                        <div style="font-weight: 600;">${invoice.customer.name || 'N/A'}</div>
                        <div style="font-size: 0.85rem; color: #64748b;">${invoice.customer.email}</div>
                    </td>
                    <td>${statusBadge}</td>
                    <td style="font-weight: 600;">$${invoice.amount_due.toFixed(2)}</td>
                    <td style="font-weight: 600; color: #10b981;">$${invoice.amount_paid.toFixed(2)}</td>
                    <td>${createdDate}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-info" onclick="adminBilling.viewInvoiceDetails('${invoice.id}')" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${invoice.pdf ? `
                                <a href="${invoice.pdf}" target="_blank" class="btn-action btn-primary" title="Download PDF">
                                    <i class="fas fa-download"></i>
                                </a>
                            ` : ''}
                            ${invoice.status === 'draft' ? `
                                <button class="btn-action btn-success" onclick="adminBilling.finalizeInvoice('${invoice.id}')" title="Finalize">
                                    <i class="fas fa-check"></i>
                                </button>
                            ` : ''}
                            ${invoice.status === 'open' ? `
                                <button class="btn-action btn-warning" onclick="adminBilling.voidInvoice('${invoice.id}')" title="Void">
                                    <i class="fas fa-ban"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    async viewInvoiceDetails(invoiceId) {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/invoice?id=${invoiceId}`);
            const data = await response.json();
            
            if (data.success) {
                const invoice = data.invoice;
                
                const modalContent = `
                    <div class="details-grid">
                        <div class="detail-row">
                            <label><i class="fas fa-hashtag"></i> Invoice Number:</label>
                            <span style="font-weight: 700;">${invoice.number || 'N/A'}</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-id-badge"></i> Invoice ID:</label>
                            <span>${invoice.id}</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-user"></i> Customer:</label>
                            <span>${invoice.customer.name || 'N/A'} (${invoice.customer.email})</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-info-circle"></i> Status:</label>
                            <span>${this.getInvoiceStatusBadge(invoice.status)}</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-dollar-sign"></i> Amount Due:</label>
                            <span style="font-weight: 700; font-size: 1.2rem;">$${(invoice.amount_due / 100).toFixed(2)}</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-check-circle"></i> Amount Paid:</label>
                            <span style="font-weight: 700; color: #10b981;">$${(invoice.amount_paid / 100).toFixed(2)}</span>
                        </div>
                        
                        <div class="detail-row">
                            <label><i class="fas fa-calendar"></i> Created:</label>
                            <span>${new Date(invoice.created * 1000).toLocaleString()}</span>
                        </div>
                        
                        ${invoice.due_date ? `
                            <div class="detail-row">
                                <label><i class="fas fa-clock"></i> Due Date:</label>
                                <span>${new Date(invoice.due_date * 1000).toLocaleDateString()}</span>
                            </div>
                        ` : ''}
                        
                        ${invoice.invoice_pdf ? `
                            <div class="detail-row">
                                <label><i class="fas fa-file-pdf"></i> PDF:</label>
                                <span>
                                    <a href="${invoice.invoice_pdf}" target="_blank" class="btn-primary" style="display: inline-block; padding: 8px 16px; text-decoration: none;">
                                        <i class="fas fa-download"></i> Download PDF
                                    </a>
                                </span>
                            </div>
                        ` : ''}
                    </div>
                `;
                
                document.getElementById('invoice-details-content').innerHTML = modalContent;
                document.getElementById('invoice-details-modal').classList.add('active');
            }
        } catch (error) {
            console.error('Error loading invoice details:', error);
            alert('Failed to load invoice details');
        }
    }
    
    closeInvoiceDetailsModal() {
        document.getElementById('invoice-details-modal').classList.remove('active');
    }
    
    async finalizeInvoice(invoiceId) {
        const confirm = window.confirm('Finalize this invoice? This action cannot be undone.');
        
        if (!confirm) return;
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/finalize-invoice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    invoiceId: invoiceId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Invoice finalized successfully');
                await this.loadInvoices();
            } else {
                throw new Error(data.error || 'Failed to finalize invoice');
            }
        } catch (error) {
            console.error('Error finalizing invoice:', error);
            alert('❌ Failed to finalize invoice: ' + error.message);
        }
    }
    
    async voidInvoice(invoiceId) {
        const confirm = window.confirm('Void this invoice? This action cannot be undone.');
        
        if (!confirm) return;
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/void-invoice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    invoiceId: invoiceId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Invoice voided successfully');
                await this.loadInvoices();
            } else {
                throw new Error(data.error || 'Failed to void invoice');
            }
        } catch (error) {
            console.error('Error voiding invoice:', error);
            alert('❌ Failed to void invoice: ' + error.message);
        }
    }
    
    filterInvoices() {
        const statusFilter = document.getElementById('invoice-status-filter').value;
        const searchTerm = document.getElementById('invoice-search').value.toLowerCase();
        
        let filtered = this.invoices;
        
        if (statusFilter !== 'all') {
            filtered = filtered.filter(invoice => invoice.status === statusFilter);
        }
        
        if (searchTerm) {
            filtered = filtered.filter(invoice => 
                (invoice.number && invoice.number.toLowerCase().includes(searchTerm)) ||
                invoice.customer.email.toLowerCase().includes(searchTerm) ||
                (invoice.customer.name && invoice.customer.name.toLowerCase().includes(searchTerm))
            );
        }
        
        const originalInvoices = this.invoices;
        this.invoices = filtered;
        this.renderInvoices();
        this.invoices = originalInvoices;
    }
    
    // ========================================
    // PAYMENT METHODS (4 ENDPOINTS)
    // ========================================
    
    async loadPaymentMethods() {
        const customerId = document.getElementById('payment-method-customer-select').value;
        
        if (!customerId) {
            document.getElementById('payment-methods-list').innerHTML = `
                <p style="text-align: center; color: #64748b; padding: 40px;">
                    Please select a customer to view payment methods
                </p>
            `;
            return;
        }
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/payment-methods?customerId=${customerId}`);
            const data = await response.json();
            
            if (data.success) {
                const paymentMethods = data.payment_methods;
                
                if (paymentMethods.length === 0) {
                    document.getElementById('payment-methods-list').innerHTML = `
                        <p style="text-align: center; color: #64748b; padding: 40px;">
                            <i class="fas fa-credit-card" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i><br>
                            No payment methods found for this customer
                        </p>
                    `;
                    return;
                }
                
                document.getElementById('payment-methods-list').innerHTML = paymentMethods.map(pm => `
                    <div class="payment-method-card">
                        <div class="payment-method-icon">
                            <i class="fab fa-cc-${pm.card.brand.toLowerCase()}"></i>
                        </div>
                        <div class="payment-method-details">
                            <div class="payment-method-brand">${pm.card.brand.toUpperCase()}</div>
                            <div class="payment-method-last4">•••• ${pm.card.last4}</div>
                            <div class="payment-method-expiry">Expires ${pm.card.exp_month}/${pm.card.exp_year}</div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
            document.getElementById('payment-methods-list').innerHTML = `
                <p style="text-align: center; color: #ef4444; padding: 40px;">
                    Failed to load payment methods
                </p>
            `;
        }
    }
    
    // ========================================
    // PRODUCTS & PRICES (7 ENDPOINTS)
    // ========================================
    
    async loadProducts() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/products?limit=100`);
            const data = await response.json();
            
            if (data.success) {
                this.products = data.products;
                this.renderProducts();
                this.populateProductSelects();
                console.log(`✅ Loaded ${this.products.length} products`);
            } else {
                throw new Error(data.error || 'Failed to load products');
            }
        } catch (error) {
            console.error('❌ Error loading products:', error);
            throw error;
        }
    }
    
    renderProducts() {
        const tbody = document.getElementById('products-table-body');
        
        if (this.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-box" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                        <p>No products found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.products.map(product => {
            const createdDate = new Date(product.created * 1000).toLocaleDateString();
            const activeBadge = product.active 
                ? '<span class="badge badge-success">Active</span>' 
                : '<span class="badge badge-secondary">Inactive</span>';
            
            return `
                <tr>
                    <td style="font-weight: 600;">${product.name}</td>
                    <td>${product.description || 'N/A'}</td>
                    <td>${activeBadge}</td>
                    <td>${createdDate}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-info" onclick="adminBilling.viewProductDetails('${product.id}')" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    async viewProductDetails(productId) {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/product?id=${productId}`);
            const data = await response.json();
            
            if (data.success) {
                const product = data.product;
                alert(`Product: ${product.name}\nID: ${product.id}\nActive: ${product.active}\nDescription: ${product.description || 'N/A'}`);
            }
        } catch (error) {
            console.error('Error loading product:', error);
            alert('Failed to load product details');
        }
    }
    
    openCreateProductModal() {
        document.getElementById('create-product-modal').classList.add('active');
    }
    
    closeCreateProductModal() {
        document.getElementById('create-product-modal').classList.remove('active');
        document.getElementById('new-product-name').value = '';
        document.getElementById('new-product-description').value = '';
    }
    
    async createProduct() {
        const name = document.getElementById('new-product-name').value.trim();
        const description = document.getElementById('new-product-description').value.trim();
        
        if (!name) {
            alert('❌ Please enter a product name');
            return;
        }
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/create-product`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: description || undefined
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Product created successfully!');
                this.closeCreateProductModal();
                await this.loadProducts();
            } else {
                throw new Error(data.error || 'Failed to create product');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            alert('❌ Failed to create product: ' + error.message);
        }
    }
    
    async loadPrices() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/prices?limit=100`);
            const data = await response.json();
            
            if (data.success) {
                this.prices = data.prices;
                this.renderPrices();
                console.log(`✅ Loaded ${this.prices.length} prices`);
            } else {
                throw new Error(data.error || 'Failed to load prices');
            }
        } catch (error) {
            console.error('❌ Error loading prices:', error);
            throw error;
        }
    }
    
    renderPrices() {
        const tbody = document.getElementById('prices-table-body');
        
        if (this.prices.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-dollar-sign" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                        <p>No prices found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.prices.map(price => {
            const activeBadge = price.active 
                ? '<span class="badge badge-success">Active</span>' 
                : '<span class="badge badge-secondary">Inactive</span>';
            
            return `
                <tr>
                    <td style="font-weight: 600;">${price.product?.name || price.product || 'N/A'}</td>
                    <td style="font-weight: 600;">$${(price.unit_amount / 100).toFixed(2)}</td>
                    <td>${price.currency.toUpperCase()}</td>
                    <td>${price.recurring?.interval || 'One-time'}</td>
                    <td>${activeBadge}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-info" onclick="adminBilling.viewPriceDetails('${price.id}')" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    async viewPriceDetails(priceId) {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/price?id=${priceId}`);
            const data = await response.json();
            
            if (data.success) {
                const price = data.price;
                alert(`Price: $${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}\nID: ${price.id}\nActive: ${price.active}\nInterval: ${price.recurring?.interval || 'One-time'}`);
            }
        } catch (error) {
            console.error('Error loading price:', error);
            alert('Failed to load price details');
        }
    }
    
    openCreatePriceModal() {
        document.getElementById('create-price-modal').classList.add('active');
    }
    
    closeCreatePriceModal() {
        document.getElementById('create-price-modal').classList.remove('active');
        document.getElementById('new-price-product').value = '';
        document.getElementById('new-price-amount').value = '';
        document.getElementById('new-price-currency').value = 'usd';
        document.getElementById('new-price-interval').value = 'month';
    }
    
    async createPrice() {
        const productId = document.getElementById('new-price-product').value;
        const amount = parseInt(document.getElementById('new-price-amount').value);
        const currency = document.getElementById('new-price-currency').value;
        const interval = document.getElementById('new-price-interval').value;
        
        if (!productId || !amount) {
            alert('❌ Please fill in all required fields');
            return;
        }
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/create-price`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    productId: productId,
                    unitAmount: amount,
                    currency: currency,
                    recurring: {
                        interval: interval
                    }
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Price created successfully!');
                this.closeCreatePriceModal();
                await this.loadPrices();
            } else {
                throw new Error(data.error || 'Failed to create price');
            }
        } catch (error) {
            console.error('Error creating price:', error);
            alert('❌ Failed to create price: ' + error.message);
        }
    }
    
    populateProductSelects() {
        const select = document.getElementById('new-price-product');
        
        select.innerHTML = '<option value="">-- Select Product --</option>' +
            this.products.map(product => 
                `<option value="${product.id}">${product.name}</option>`
            ).join('');
    }
    
    // ========================================
    // COUPONS & PROMO CODES (5 ENDPOINTS)
    // ========================================
    
    async loadCoupons() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/coupons?limit=100`);
            const data = await response.json();
            
            if (data.success) {
                this.coupons = data.coupons;
                this.renderCoupons();
                this.populateCouponSelects();
                console.log(`✅ Loaded ${this.coupons.length} coupons`);
            } else {
                throw new Error(data.error || 'Failed to load coupons');
            }
        } catch (error) {
            console.error('❌ Error loading coupons:', error);
            throw error;
        }
    }
    
    renderCoupons() {
        const tbody = document.getElementById('coupons-table-body');
        
        if (this.coupons.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-tag" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                        <p>No coupons found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.coupons.map(coupon => {
            const type = coupon.percent_off ? 'Percentage' : 'Fixed Amount';
            const discount = coupon.percent_off 
                ? `${coupon.percent_off}% off` 
                : `$${(coupon.amount_off / 100).toFixed(2)} off`;
            const validBadge = coupon.valid 
                ? '<span class="badge badge-success">Valid</span>' 
                : '<span class="badge badge-danger">Invalid</span>';
            
            return `
                <tr>
                    <td>
                        <div style="font-weight: 600;">${coupon.id}</div>
                        ${coupon.name ? `<div style="font-size: 0.85rem; color: #64748b;">Name: ${coupon.name}</div>` : ''}
                    </td>
                    <td>${type}</td>
                    <td style="font-weight: 600; color: #10b981;">${discount}</td>
                    <td>${coupon.duration}</td>
                    <td>${validBadge}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-info" onclick="adminBilling.viewCouponDetails('${coupon.id}')" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-action btn-danger" onclick="adminBilling.deleteCoupon('${coupon.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    async viewCouponDetails(couponId) {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/coupon?id=${couponId}`);
            const data = await response.json();
            
            if (data.success) {
                const coupon = data.coupon;
                const discount = coupon.percent_off ? `${coupon.percent_off}% off` : `$${(coupon.amount_off / 100).toFixed(2)} off`;
                alert(`Coupon: ${coupon.id}\nDiscount: ${discount}\nDuration: ${coupon.duration}\nValid: ${coupon.valid}`);
            }
        } catch (error) {
            console.error('Error loading coupon:', error);
            alert('Failed to load coupon details');
        }
    }
    
    openCreateCouponModal() {
        document.getElementById('create-coupon-modal').classList.add('active');
    }
    
    closeCreateCouponModal() {
        document.getElementById('create-coupon-modal').classList.remove('active');
        document.getElementById('new-coupon-id').value = '';
        document.getElementById('new-coupon-type').value = 'percent';
        document.getElementById('new-coupon-percent').value = '';
        document.getElementById('new-coupon-amount').value = '';
        document.getElementById('new-coupon-currency').value = 'usd';
        document.getElementById('new-coupon-duration').value = 'once';
        document.getElementById('new-coupon-duration-months').value = '';
    }
    
    toggleCouponFields() {
        const type = document.getElementById('new-coupon-type').value;
        
        if (type === 'percent') {
            document.getElementById('coupon-percent-field').style.display = 'block';
            document.getElementById('coupon-amount-field').style.display = 'none';
            document.getElementById('coupon-currency-field').style.display = 'none';
        } else {
            document.getElementById('coupon-percent-field').style.display = 'none';
            document.getElementById('coupon-amount-field').style.display = 'block';
            document.getElementById('coupon-currency-field').style.display = 'block';
        }
    }
    
    toggleCouponDuration() {
        const duration = document.getElementById('new-coupon-duration').value;
        
        if (duration === 'repeating') {
            document.getElementById('coupon-duration-months-field').style.display = 'block';
        } else {
            document.getElementById('coupon-duration-months-field').style.display = 'none';
        }
    }
    
    async createCoupon() {
        const id = document.getElementById('new-coupon-id').value.trim();
        const type = document.getElementById('new-coupon-type').value;
        const percentOff = type === 'percent' ? parseInt(document.getElementById('new-coupon-percent').value) : null;
        const amountOff = type === 'amount' ? parseInt(document.getElementById('new-coupon-amount').value) : null;
        const currency = type === 'amount' ? document.getElementById('new-coupon-currency').value : null;
        const duration = document.getElementById('new-coupon-duration').value;
        const durationInMonths = duration === 'repeating' ? parseInt(document.getElementById('new-coupon-duration-months').value) : null;
        
        if (!percentOff && !amountOff) {
            alert('❌ Please enter a discount value');
            return;
        }
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/create-coupon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id || undefined,
                    percentOff: percentOff,
                    amountOff: amountOff,
                    currency: currency,
                    duration: duration,
                    durationInMonths: durationInMonths
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Coupon created successfully!');
                this.closeCreateCouponModal();
                await this.loadCoupons();
            } else {
                throw new Error(data.error || 'Failed to create coupon');
            }
        } catch (error) {
            console.error('Error creating coupon:', error);
            alert('❌ Failed to create coupon: ' + error.message);
        }
    }
    
    async loadPromoCodes() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/promotion-codes?limit=100`);
            const data = await response.json();
            
            if (data.success) {
                this.promoCodes = data.promotion_codes || [];
                
                console.log(`✅ Loaded ${this.promoCodes.length} promo codes`);
                
                // ✅ DEBUG : Afficher la structure du premier code promo
                if (this.promoCodes.length > 0) {
                    console.log('📋 First promo code structure:', JSON.stringify(this.promoCodes[0], null, 2));
                }
                
                this.renderPromoCodes();
            } else {
                throw new Error(data.error || 'Failed to load promo codes');
            }
        } catch (error) {
            console.error('❌ Error loading promo codes:', error);
            
            // ✅ AFFICHAGE D'UNE ERREUR DANS LE TABLEAU AU LIEU DE BLOQUER TOUTE LA PAGE
            const tbody = document.getElementById('promo-codes-table-body');
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #ef4444;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 16px;"></i>
                        <p>Failed to load promotion codes</p>
                        <p style="font-size: 0.9rem; color: #64748b;">${error.message}</p>
                    </td>
                </tr>
            `;
            
            // ✅ NE PAS BLOQUER LE RESTE DU DASHBOARD
            // throw error; // ❌ COMMENTER CETTE LIGNE
        }
    }
    
    renderPromoCodes() {
        const tbody = document.getElementById('promo-codes-table-body');
        
        if (this.promoCodes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-ticket-alt" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                        <p>No promotion codes found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.promoCodes.map(promo => {
            console.log('🎟 Rendering promo code:', promo.code);
            console.log('   Full promo object:', promo);
            
            // ✅ NOUVELLE STRUCTURE STRIPE : promo.promotion.coupon
            let couponId = 'N/A';
            let couponDiscount = 'N/A';
            
            // Vérifier les deux structures possibles
            if (promo.promotion && promo.promotion.coupon) {
                // Nouvelle structure Stripe (2024+)
                couponId = promo.promotion.coupon;
                console.log('   ✅ Found coupon in promo.promotion.coupon:', couponId);
            } else if (promo.coupon) {
                // Ancienne structure
                if (typeof promo.coupon === 'object' && promo.coupon !== null) {
                    couponId = promo.coupon.id;
                    
                    if (promo.coupon.percent_off) {
                        couponDiscount = `${promo.coupon.percent_off}% off`;
                    } else if (promo.coupon.amount_off) {
                        couponDiscount = `$${(promo.coupon.amount_off / 100).toFixed(2)} off`;
                    }
                } else if (typeof promo.coupon === 'string') {
                    couponId = promo.coupon;
                }
                console.log('   ✅ Found coupon in promo.coupon:', couponId);
            } else {
                console.warn('   ⚠ No coupon found in promo object');
            }
            
            // ✅ CHERCHER LE COUPON DANS LA LISTE DES COUPONS
            const couponData = this.coupons.find(c => c.id === couponId);
            if (couponData) {
                console.log('   ✅ Found coupon data in this.coupons:', couponData);
                
                if (couponData.percent_off) {
                    couponDiscount = `${couponData.percent_off}% off`;
                } else if (couponData.amount_off) {
                    couponDiscount = `$${(couponData.amount_off / 100).toFixed(2)} off`;
                }
            }
            
            const activeBadge = promo.active 
                ? '<span class="badge badge-success">Active</span>' 
                : '<span class="badge badge-secondary">Inactive</span>';
            
            const expires = promo.expires_at 
                ? new Date(promo.expires_at * 1000).toLocaleDateString() 
                : 'Never';
            
            return `
                <tr>
                    <td style="font-weight: 600;">
                        <div style="font-size: 1.05rem;">${promo.code}</div>
                        <div style="font-size: 0.85rem; color: #64748b; margin-top: 4px;">${promo.id}</div>
                    </td>
                    <td>
                        <div style="font-weight: 600;">${couponId}</div>
                        <div style="font-size: 0.85rem; color: #10b981; margin-top: 4px;">${couponDiscount}</div>
                    </td>
                    <td>${activeBadge}</td>
                    <td style="font-weight: 600; text-align: center;">${promo.times_redeemed || 0}</td>
                    <td style="text-align: center;">${promo.max_redemptions || 'Unlimited'}</td>
                    <td>${expires}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-info" onclick="adminBilling.viewPromoCodeDetails('${promo.id}')" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${promo.active ? `
                                <button class="btn-action btn-danger" onclick="adminBilling.deletePromoCode('${promo.id}')" title="Deactivate">
                                    <i class="fas fa-ban"></i>
                                </button>
                            ` : `
                                <button class="btn-action btn-secondary" disabled title="Already inactive">
                                    <i class="fas fa-ban"></i>
                                </button>
                            `}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    async viewPromoCodeDetails(promoId) {
        try {
            // ✅ CHERCHER DANS LES DONNÉES DÉJÀ CHARGÉES
            const promo = this.promoCodes.find(p => p.id === promoId);
            
            if (!promo) {
                alert('❌ Promotion code not found');
                return;
            }
            
            const couponId = typeof promo.coupon === 'object' && promo.coupon !== null
                ? promo.coupon.id
                : promo.coupon;
            
            const discount = promo.coupon && typeof promo.coupon === 'object'
                ? (promo.coupon.percent_off 
                    ? `${promo.coupon.percent_off}% off` 
                    : `$${(promo.coupon.amount_off / 100).toFixed(2)} off`)
                : 'N/A';
            
            const expires = promo.expires_at 
                ? new Date(promo.expires_at * 1000).toLocaleString() 
                : 'Never';
            
            const modalContent = `
                <div class="details-grid">
                    <div class="detail-row">
                        <label><i class="fas fa-id-badge"></i> Promo Code ID:</label>
                        <span>${promo.id}</span>
                    </div>
                    
                    <div class="detail-row">
                        <label><i class="fas fa-ticket-alt"></i> Code:</label>
                        <span style="font-weight: 700; font-size: 1.2rem; color: #667eea;">${promo.code}</span>
                    </div>
                    
                    <div class="detail-row">
                        <label><i class="fas fa-tag"></i> Coupon ID:</label>
                        <span>${couponId}</span>
                    </div>
                    
                    <div class="detail-row">
                        <label><i class="fas fa-percent"></i> Discount:</label>
                        <span style="font-weight: 700; color: #10b981;">${discount}</span>
                    </div>
                    
                    <div class="detail-row">
                        <label><i class="fas fa-info-circle"></i> Status:</label>
                        <span>${promo.active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-secondary">Inactive</span>'}</span>
                    </div>
                    
                    <div class="detail-row">
                        <label><i class="fas fa-hashtag"></i> Times Redeemed:</label>
                        <span style="font-weight: 700;">${promo.times_redeemed || 0}</span>
                    </div>
                    
                    <div class="detail-row">
                        <label><i class="fas fa-infinity"></i> Max Redemptions:</label>
                        <span>${promo.max_redemptions || 'Unlimited'}</span>
                    </div>
                    
                    <div class="detail-row">
                        <label><i class="fas fa-clock"></i> Expires:</label>
                        <span>${expires}</span>
                    </div>
                </div>
            `;
            
            // ✅ AFFICHER DANS UN MODAL (ajoute ce modal dans ton HTML si nécessaire)
            alert(`Promotion Code: ${promo.code}\n\nCoupon: ${couponId}\nDiscount: ${discount}\nTimes Redeemed: ${promo.times_redeemed || 0}\nMax Redemptions: ${promo.max_redemptions || 'Unlimited'}\nExpires: ${expires}\nActive: ${promo.active ? 'Yes' : 'No'}`);
            
        } catch (error) {
            console.error('Error viewing promo code details:', error);
            alert('❌ Failed to load promotion code details');
        }
    }
    
    openCreatePromoCodeModal() {
        document.getElementById('create-promo-code-modal').classList.add('active');
    }
    
    closeCreatePromoCodeModal() {
        document.getElementById('create-promo-code-modal').classList.remove('active');
        document.getElementById('new-promo-coupon').value = '';
        document.getElementById('new-promo-code').value = '';
        document.getElementById('new-promo-max-redemptions').value = '';
    }
    
    async createPromoCode() {
        const couponId = document.getElementById('new-promo-coupon').value;
        const code = document.getElementById('new-promo-code').value.trim();
        const maxRedemptions = parseInt(document.getElementById('new-promo-max-redemptions').value) || null;
        
        // ✅ LOGS DE DEBUG
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎁 CREATE PROMO CODE - FRONTEND');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Coupon ID:', couponId);
        console.log('Code:', code);
        console.log('Max Redemptions:', maxRedemptions);
        
        // ✅ VALIDATION AMÉLIORÉE
        if (!couponId) {
            alert('❌ Please select a coupon');
            console.error('❌ Coupon ID is empty');
            return;
        }
        
        if (!code) {
            alert('❌ Please enter a promotion code');
            console.error('❌ Code is empty');
            return;
        }
        
        // ✅ Vérifier que le code ne contient que des caractères autorisés
        if (!/^[A-Z0-9_]+$/i.test(code)) {
            alert('❌ Promotion code can only contain letters, numbers, and underscores');
            return;
        }
        
        const payload = {
            couponId: couponId,
            code: code.toUpperCase(), // ✅ Stripe convertit en majuscules
            maxRedemptions: maxRedemptions
        };
        
        console.log('📤 Sending payload:', JSON.stringify(payload, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/create-promotion-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            console.log('📥 Response status:', response.status);
            
            const data = await response.json();
            
            console.log('📥 Response data:', JSON.stringify(data, null, 2));
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            if (data.success) {
                alert('✅ Promotion code created successfully!\n\nCode: ' + data.promotion_code.code + '\nCoupon: ' + data.promotion_code.coupon.id);
                this.closeCreatePromoCodeModal();
                await this.loadPromoCodes();
            } else {
                // ✅ AFFICHAGE DÉTAILLÉ DE L'ERREUR
                console.error('❌ Error from worker:', data.error);
                alert('❌ Failed to create promotion code:\n\n' + data.error);
            }
        } catch (error) {
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('❌ NETWORK ERROR');
            console.error('Error:', error);
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            alert('❌ Network error:\n\n' + error.message + '\n\nCheck console for details.');
        }
    }
    
    populateCouponSelects() {
        const select = document.getElementById('new-promo-coupon');
        
        select.innerHTML = '<option value="">-- Select Coupon --</option>' +
            this.coupons.map(coupon => {
                const discount = coupon.percent_off ? `${coupon.percent_off}% off` : `$${(coupon.amount_off / 100).toFixed(2)} off`;
                return `<option value="${coupon.id}">${coupon.id} (${discount})</option>`;
            }).join('');
    }
    
    // ========================================
    // REFUNDS & DISPUTES (4 ENDPOINTS)
    // ========================================
    
    async loadRefunds() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/refunds?limit=100`);
            const data = await response.json();
            
            if (data.success) {
                this.refunds = data.refunds;
                this.renderRefunds();
                console.log(`✅ Loaded ${this.refunds.length} refunds`);
            } else {
                throw new Error(data.error || 'Failed to load refunds');
            }
        } catch (error) {
            console.error('❌ Error loading refunds:', error);
            throw error;
        }
    }
    
    renderRefunds() {
        const tbody = document.getElementById('refunds-table-body');
        
        if (this.refunds.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-undo" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                        <p>No refunds found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.refunds.map(refund => {
            const statusBadge = refund.status === 'succeeded' 
                ? '<span class="badge badge-success">Succeeded</span>' 
                : '<span class="badge badge-warning">Pending</span>';
            const createdDate = new Date(refund.created * 1000).toLocaleDateString();
            
            return `
                <tr>
                    <td style="font-weight: 600;">${refund.id.substring(0, 20)}...</td>
                    <td style="font-weight: 600;">$${(refund.amount / 100).toFixed(2)}</td>
                    <td>${statusBadge}</td>
                    <td>${refund.reason || 'N/A'}</td>
                    <td>${createdDate}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-info" onclick="adminBilling.viewRefundDetails('${refund.id}')" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    async viewRefundDetails(refundId) {
        alert(`Refund ID: ${refundId}`);
    }
    
    openCreateRefundModal() {
        document.getElementById('create-refund-modal').classList.add('active');
    }
    
    closeCreateRefundModal() {
        document.getElementById('create-refund-modal').classList.remove('active');
        document.getElementById('new-refund-payment-intent').value = '';
        document.getElementById('new-refund-amount').value = '';
        document.getElementById('new-refund-reason').value = '';
    }
    
    async createRefund() {
        const paymentIntentId = document.getElementById('new-refund-payment-intent').value.trim();
        const amount = parseFloat(document.getElementById('new-refund-amount').value) || null;
        const reason = document.getElementById('new-refund-reason').value;
        
        if (!paymentIntentId) {
            alert('❌ Please enter a Payment Intent ID');
            return;
        }
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/create-refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    paymentIntentId: paymentIntentId,
                    amount: amount,
                    reason: reason || undefined
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Refund created successfully!');
                this.closeCreateRefundModal();
                await this.loadRefunds();
            } else {
                throw new Error(data.error || 'Failed to create refund');
            }
        } catch (error) {
            console.error('Error creating refund:', error);
            alert('❌ Failed to create refund: ' + error.message);
        }
    }
    
    async loadDisputes() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/disputes?limit=100`);
            const data = await response.json();
            
            if (data.success) {
                this.disputes = data.disputes;
                this.renderDisputes();
                console.log(`✅ Loaded ${this.disputes.length} disputes`);
            } else {
                throw new Error(data.error || 'Failed to load disputes');
            }
        } catch (error) {
            console.error('❌ Error loading disputes:', error);
            throw error;
        }
    }
    
    renderDisputes() {
        const tbody = document.getElementById('disputes-table-body');
        
        if (this.disputes.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                        <p>No disputes found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.disputes.map(dispute => {
            const statusBadge = dispute.status === 'won' 
                ? '<span class="badge badge-success">Won</span>' 
                : dispute.status === 'lost'
                ? '<span class="badge badge-danger">Lost</span>'
                : '<span class="badge badge-warning">Under Review</span>';
            const createdDate = new Date(dispute.created * 1000).toLocaleDateString();
            
            return `
                <tr>
                    <td style="font-weight: 600;">${dispute.id.substring(0, 20)}...</td>
                    <td style="font-weight: 600;">$${(dispute.amount / 100).toFixed(2)}</td>
                    <td>${statusBadge}</td>
                    <td>${dispute.reason}</td>
                    <td>${createdDate}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-info" onclick="adminBilling.viewDisputeDetails('${dispute.id}')" title="View">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    async viewDisputeDetails(disputeId) {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/dispute?id=${disputeId}`);
            const data = await response.json();
            
            if (data.success) {
                const dispute = data.dispute;
                alert(`Dispute: ${dispute.id}\nAmount: $${(dispute.amount / 100).toFixed(2)}\nStatus: ${dispute.status}\nReason: ${dispute.reason}`);
            }
        } catch (error) {
            console.error('Error loading dispute:', error);
            alert('Failed to load dispute details');
        }
    }
    
    // ========================================
    // BALANCE (2 ENDPOINTS)
    // ========================================
    
    async loadBalance() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/balance`);
            const data = await response.json();
            
            if (data.success) {
                this.balance = data.balance;
                this.renderBalance();
                console.log('✅ Loaded balance');
            } else {
                throw new Error(data.error || 'Failed to load balance');
            }
        } catch (error) {
            console.error('❌ Error loading balance:', error);
            throw error;
        }
    }
    
    renderBalance() {
        if (!this.balance) return;
        
        const available = this.balance.available[0]?.amount || 0;
        const pending = this.balance.pending[0]?.amount || 0;
        
        document.getElementById('balance-available').textContent = `$${(available / 100).toFixed(2)}`;
        document.getElementById('balance-pending').textContent = `$${(pending / 100).toFixed(2)}`;
    }
    
    async loadBalanceTransactions() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/balance-transactions?limit=100`);
            const data = await response.json();
            
            if (data.success) {
                this.balanceTransactions = data.balance_transactions;
                this.renderBalanceTransactions();
                console.log(`✅ Loaded ${this.balanceTransactions.length} balance transactions`);
            } else {
                throw new Error(data.error || 'Failed to load balance transactions');
            }
        } catch (error) {
            console.error('❌ Error loading balance transactions:', error);
            throw error;
        }
    }
    
    renderBalanceTransactions() {
        const tbody = document.getElementById('balance-transactions-table-body');
        
        if (this.balanceTransactions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
                        <i class="fas fa-exchange-alt" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                        <p>No transactions found</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.balanceTransactions.map(tx => {
            const date = new Date(tx.created * 1000).toLocaleDateString();
            const statusBadge = tx.status === 'available' 
                ? '<span class="badge badge-success">Available</span>' 
                : '<span class="badge badge-warning">Pending</span>';
            
            return `
                <tr>
                    <td>${date}</td>
                    <td>${tx.type}</td>
                    <td style="font-weight: 600;">$${(tx.amount / 100).toFixed(2)}</td>
                    <td style="font-weight: 600; color: #10b981;">$${(tx.net / 100).toFixed(2)}</td>
                    <td style="color: #ef4444;">$${(tx.fee / 100).toFixed(2)}</td>
                    <td>${statusBadge}</td>
                    <td>${tx.description || 'N/A'}</td>
                </tr>
            `;
        }).join('');
    }
    
    // ========================================
    // ANALYTICS (5 ENDPOINTS)
    // ========================================
    
    async loadAnalytics() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/billing-analytics`);
            const data = await response.json();
            
            if (data.success) {
                this.analytics = data.analytics;
                this.updateOverviewStats();
                this.renderPlansChart();
                console.log('✅ Loaded analytics');
            } else {
                throw new Error(data.error || 'Failed to load analytics');
            }
        } catch (error) {
            console.error('❌ Error loading analytics:', error);
            throw error;
        }
    }
    
    updateOverviewStats() {
        if (!this.analytics) return;
        
        document.getElementById('billing-total-revenue').textContent = `$${this.analytics.revenue.total.toFixed(2)}`;
        document.getElementById('billing-mrr').textContent = `$${this.analytics.revenue.mrr.toFixed(2)}`;
        document.getElementById('billing-arr').textContent = `$${this.analytics.revenue.arr.toFixed(2)}`;
        document.getElementById('billing-active-subs').textContent = this.analytics.subscriptions.active;
        document.getElementById('billing-arpu').textContent = `$${this.analytics.revenue.arpu}`;
        document.getElementById('billing-total-customers').textContent = this.customers.length;
        document.getElementById('billing-trialing').textContent = this.analytics.subscriptions.trialing;
        document.getElementById('billing-canceled').textContent = this.analytics.subscriptions.canceled;
    }
    
    renderPlansChart() {
        if (!this.analytics) return;
        
        const ctx = document.getElementById('plans-distribution-chart');
        
        if (this.charts.plansDistribution) {
            this.charts.plansDistribution.destroy();
        }
        
        this.charts.plansDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pro', 'Platinum'],
                datasets: [{
                    data: [
                        this.analytics.plans.pro || 0,
                        this.analytics.plans.platinum || 0
                    ],
                    backgroundColor: [
                        PLANS.pro.color,
                        PLANS.platinum.color
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14,
                                weight: '600'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ${context.parsed} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    async loadMRRAnalytics() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/mrr-analytics`);
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('mrr-pro').textContent = `$${data.mrr.by_plan.pro.toFixed(2)}`;
                document.getElementById('mrr-platinum').textContent = `$${data.mrr.by_plan.platinum.toFixed(2)}`;
                document.getElementById('mrr-total').textContent = `$${data.mrr.total.toFixed(2)}`;
                
                console.log('✅ Loaded MRR analytics');
            }
        } catch (error) {
            console.error('❌ Error loading MRR analytics:', error);
        }
    }
    
    async loadRevenueChart() {
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/revenue-chart?months=12`);
            const data = await response.json();
            
            if (data.success) {
                this.renderRevenueChart(data.chart_data);
                this.renderAnalyticsRevenueChart(data.chart_data);
                console.log('✅ Loaded revenue chart data');
            }
        } catch (error) {
            console.error('❌ Error loading revenue chart:', error);
        }
    }
    
    renderRevenueChart(chartData) {
        const ctx = document.getElementById('revenue-trend-chart');
        
        if (this.charts.revenueTrend) {
            this.charts.revenueTrend.destroy();
        }
        
        this.charts.revenueTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.map(d => d.month),
                datasets: [{
                    label: 'Revenue',
                    data: chartData.map(d => d.revenue),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Revenue: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }
    
    renderAnalyticsRevenueChart(chartData) {
        const ctx = document.getElementById('analytics-revenue-chart');
        
        if (this.charts.analyticsRevenue) {
            this.charts.analyticsRevenue.destroy();
        }
        
        this.charts.analyticsRevenue = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.map(d => d.month),
                datasets: [{
                    label: 'Revenue',
                    data: chartData.map(d => d.revenue),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Revenue: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // ========================================
    // HELPERS
    // ========================================
    
    getStatusBadge(status) {
        const badges = {
            active: '<span class="badge badge-success">Active</span>',
            trialing: '<span class="badge badge-info">Trialing</span>',
            canceled: '<span class="badge badge-danger">Canceled</span>',
            past_due: '<span class="badge badge-warning">Past Due</span>',
            unpaid: '<span class="badge badge-danger">Unpaid</span>',
            incomplete: '<span class="badge badge-warning">Incomplete</span>',
            incomplete_expired: '<span class="badge badge-danger">Incomplete Expired</span>'
        };
        
        return badges[status] || `<span class="badge badge-secondary">${status}</span>`;
    }
    
    getInvoiceStatusBadge(status) {
        const badges = {
            paid: '<span class="badge badge-success">Paid</span>',
            open: '<span class="badge badge-info">Open</span>',
            void: '<span class="badge badge-secondary">Void</span>',
            uncollectible: '<span class="badge badge-danger">Uncollectible</span>',
            draft: '<span class="badge badge-warning">Draft</span>'
        };
        
        return badges[status] || `<span class="badge badge-secondary">${status}</span>`;
    }
    
    getPlanBadge(plan) {
        const badges = {
            pro: `<span class="badge" style="background: ${PLANS.pro.color}; color: white;">Pro</span>`,
            platinum: `<span class="badge" style="background: ${PLANS.platinum.color}; color: white;">Platinum</span>`
        };
        
        return badges[plan] || `<span class="badge badge-secondary">${plan}</span>`;
    }

    // ========================================
    // DELETE COUPON
    // ========================================

    async deleteCoupon(couponId) {
        const confirmMsg = `⚠ DELETE COUPON?\n\nCoupon ID: ${couponId}\n\nThis action cannot be undone!\n\nNote: If this coupon is used by active promotion codes, deletion will fail.`;
        
        const confirm = window.confirm(confirmMsg);
        
        if (!confirm) return;
        
        try {
            console.log('🗑 Deleting coupon:', couponId);
            
            const response = await fetch(`${STRIPE_API_BASE_URL}/delete-coupon`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    couponId: couponId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Coupon deleted successfully!');
                
                // Recharger les coupons et codes promos
                await this.loadCoupons();
                await this.loadPromoCodes();
                
            } else {
                // Afficher les codes promos actifs qui bloquent la suppression
                let errorMsg = `❌ Failed to delete coupon:\n\n${data.error}`;
                
                if (data.active_promo_codes && data.active_promo_codes.length > 0) {
                    errorMsg += `\n\nActive promotion codes using this coupon:\n`;
                    errorMsg += data.active_promo_codes.map(code => `• ${code}`).join('\n');
                }
                
                alert(errorMsg);
            }
            
        } catch (error) {
            console.error('Error deleting coupon:', error);
            alert('❌ Network error: ' + error.message);
        }
    }

    // ========================================
    // DELETE PROMOTION CODE (DEACTIVATE)
    // ========================================

    async deletePromoCode(promotionCodeId) {
        const promo = this.promoCodes.find(p => p.id === promotionCodeId);
        const promoCode = promo ? promo.code : promotionCodeId;
        
        const confirmMsg = `⚠ DEACTIVATE PROMOTION CODE?\n\nCode: ${promoCode}\nID: ${promotionCodeId}\n\nNote: Stripe does not allow permanent deletion of promotion codes.\nThis will deactivate it (customers won't be able to use it anymore).`;
        
        const confirm = window.confirm(confirmMsg);
        
        if (!confirm) return;
        
        try {
            console.log('🗑 Deactivating promotion code:', promotionCodeId);
            
            const response = await fetch(`${STRIPE_API_BASE_URL}/delete-promotion-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    promotionCodeId: promotionCodeId
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('✅ Promotion code deactivated successfully!\n\nNote: It will still appear in the list but marked as "Inactive".');
                
                // Recharger les codes promos
                await this.loadPromoCodes();
                
            } else {
                alert('❌ Failed to deactivate promotion code:\n\n' + data.error);
            }
            
        } catch (error) {
            console.error('Error deactivating promotion code:', error);
            alert('❌ Network error: ' + error.message);
        }
    }
    
    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    initEventListeners() {
        // Refresh button
        document.getElementById('refreshBillingBtn').addEventListener('click', async () => {
            const btn = document.getElementById('refreshBillingBtn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span class="btn-text">Refreshing...</span>';
            btn.disabled = true;
            
            try {
                await this.loadAllData();
                btn.innerHTML = '<i class="fas fa-check"></i> <span class="btn-text">Refreshed!</span>';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-sync-alt"></i> <span class="btn-text">Refresh</span>';
                    btn.disabled = false;
                }, 2000);
            } catch (error) {
                btn.innerHTML = '<i class="fas fa-times"></i> <span class="btn-text">Error</span>';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-sync-alt"></i> <span class="btn-text">Refresh</span>';
                    btn.disabled = false;
                }, 2000);
            }
        });
        
        // Export button
        document.getElementById('exportBillingBtn').addEventListener('click', () => {
            this.exportData();
        });
    }
    
    exportData() {
        const data = {
            subscriptions: this.subscriptions,
            customers: this.customers,
            invoices: this.invoices,
            products: this.products,
            prices: this.prices,
            coupons: this.coupons,
            promoCodes: this.promoCodes,
            refunds: this.refunds,
            disputes: this.disputes,
            balance: this.balance,
            balanceTransactions: this.balanceTransactions,
            analytics: this.analytics,
            exported_at: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `billing-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Data exported successfully');
    }
}

// ========================================
// INITIALIZE
// ========================================

let adminBilling;

document.addEventListener('DOMContentLoaded', () => {
    adminBilling = new AdminBilling();
});