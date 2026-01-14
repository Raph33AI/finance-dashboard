// ========================================
// ADMIN BILLING DASHBOARD - MAIN SCRIPT
// Version: 1.0.0 - Stripe Integration
// ========================================

const STRIPE_API_BASE_URL = 'https://stripe-api.raphnardone.workers.dev'; // ✅ REMPLACE PAR TON URL WORKER

// ✅ Plans Configuration (seuls Pro et Platinum sont dans Stripe)
const PLANS = {
    free: {
        name: 'Free',
        price: 0,
        managed: 'frontend'
    },
    basic: {
        name: 'Basic',
        price: 0,
        managed: 'frontend'
    },
    pro: {
        name: 'Pro',
        price: 49,
        managed: 'stripe',
        color: '#8b5cf6'
    },
    platinum: {
        name: 'Platinum',
        price: 99,
        managed: 'stripe',
        color: '#f59e0b'
    }
};

class AdminBilling {
    constructor() {
        this.subscriptions = [];
        this.customers = [];
        this.invoices = [];
        this.analytics = null;
        this.charts = {};
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initializing Admin Billing Dashboard...');
        
        // Show loading screen
        document.getElementById('loading-screen').style.display = 'flex';
        document.getElementById('billing-dashboard').style.display = 'none';
        
        try {
            // Load all data
            await this.loadAllData();
            
            // Initialize event listeners
            this.initEventListeners();
            
            // Hide loading screen
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('billing-dashboard').style.display = 'block';
            
            console.log('✅ Admin Billing Dashboard initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing dashboard:', error);
            alert('Failed to load billing data. Please refresh the page.');
        }
    }
    
    async loadAllData() {
        console.log('📊 Loading billing data...');
        
        try {
            // Load subscriptions
            await this.loadSubscriptions();
            
            // Load customers
            await this.loadCustomers();
            
            // Load invoices
            await this.loadInvoices();
            
            // Load analytics
            await this.loadAnalytics();
            
            // Load MRR analytics
            await this.loadMRRAnalytics();
            
            // Load revenue chart data
            await this.loadRevenueChart();
            
            console.log('✅ All data loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            throw error;
        }
    }
    
    // ========================================
    // SUBSCRIPTIONS
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
        
        tbody.innerHTML = this.subscriptions.map((sub, index) => {
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
                            ${sub.status === 'active' && !sub.cancel_at_period_end ? `
                                <button class="btn-action btn-warning" onclick="adminBilling.cancelSubscription('${sub.id}')" title="Cancel">
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
        
        try {
            const response = await fetch(`${STRIPE_API_BASE_URL}/create-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customerEmail: email,
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
        
        // Temporarily replace subscriptions for rendering
        const originalSubscriptions = this.subscriptions;
        this.subscriptions = filtered;
        this.renderSubscriptions();
        this.subscriptions = originalSubscriptions;
    }
    
    // ========================================
    // CUSTOMERS
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
        
        tbody.innerHTML = this.customers.map((customer, index) => {
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
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
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
    // INVOICES
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
        
        tbody.innerHTML = this.invoices.map((invoice, index) => {
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
    // PAYMENT METHODS
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
    // ANALYTICS
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
        
        // Total Revenue
        document.getElementById('billing-total-revenue').textContent = `$${this.analytics.revenue.total.toFixed(2)}`;
        
        // MRR
        document.getElementById('billing-mrr').textContent = `$${this.analytics.revenue.mrr.toFixed(2)}`;
        document.getElementById('billing-arr').textContent = `$${this.analytics.revenue.arr.toFixed(2)}`;
        
        // Active Subscriptions
        document.getElementById('billing-active-subs').textContent = this.analytics.subscriptions.active;
        document.getElementById('billing-arpu').textContent = `$${this.analytics.revenue.arpu}`;
        
        // Total Customers
        document.getElementById('billing-total-customers').textContent = this.customers.length;
        
        // Trialing
        document.getElementById('billing-trialing').textContent = this.analytics.subscriptions.trialing;
        
        // Canceled
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