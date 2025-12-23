// ========================================
// ADMIN ANALYTICS PRO - ULTRA POWERFUL DASHBOARD v3.2
// ✅ Stripe API Integration
// ✅ Cloudflare Analytics Integration (NEW!)
// ✅ IP Geolocation
// ✅ CSV Export
// ✅ Email Alerts
// ✅ ML Predictions
// ✅ Non-Customer Visitors Tracking (Cloudflare)
// ✅ Potential Customers Analysis
// ========================================

// 🔐 CONFIGURATION
const ADMIN_EMAIL = 'raphnardone@gmail.com';
const WORKER_URL = 'https://admin-analytics-api.raphnardone.workers.dev';
const STRIPE_PUBLIC_KEY = 'pk_live_51SU1qnDxR6DPBfOfX6yJYr9Qzh40aNGrn1TSZxI5q0Q0m9hsgXmMQFq2TErynzuUKOivH4T3DJ1FjKy683WsqQAR00tAMRJGtk';

class AdminAnalyticsPro {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.charts = {};
        this.stripeData = null;
        this.cloudflareData = null; // 🆕 Cloudflare analytics
        this.allUsersData = [];
        this.allVisitsData = [];
        this.allPaymentsData = [];
        this.allActivityData = [];
        this.nonCustomerVisitors = []; // 🆕 Non-customer visitors (Cloudflare)
        this.potentialCustomers = []; // 🆕 Potential customers
        
        // 🎯 Alert thresholds
        this.alertThresholds = {
            mrrDropPercent: 10,
            churnRatePercent: 5,
            lowActiveUsers: 1,
            conversionDrop: 2
        };
        
        this.init();
    }

    async init() {
        console.log('🔐 Initializing Admin Analytics PRO v3.2...');
        
        this.auth.onAuthStateChanged(async (user) => {
            if (!user) {
                console.log('❌ Not authenticated - redirecting...');
                alert('⛔ You must be logged in to access this page.');
                window.location.href = 'login.html';
                return;
            }

            if (user.email !== ADMIN_EMAIL) {
                console.log('⛔ Access denied for:', user.email);
                alert(`⛔ ACCESS DENIED\n\nThis page is reserved for administrators only.`);
                window.location.href = 'index.html';
                return;
            }

            console.log('✅ Admin authenticated:', user.email);
            
            const displays = document.querySelectorAll('[data-admin-email]');
            displays.forEach(el => el.textContent = user.email);
            
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('admin-dashboard').style.display = 'block';
            
            await this.loadAllData();
            this.initEventListeners();
            
            setInterval(() => this.checkAlerts(), 5 * 60 * 1000);
        });
    }

    initEventListeners() {
        const exportBtn = document.getElementById('exportDataBtn');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportAllData());
        
        const exportUsersBtn = document.getElementById('exportUsersBtn');
        if (exportUsersBtn) exportUsersBtn.addEventListener('click', () => this.exportData('users'));
        
        const exportRevenueBtn = document.getElementById('exportRevenueBtn');
        if (exportRevenueBtn) exportRevenueBtn.addEventListener('click', () => this.exportData('revenue'));
        
        const exportVisitorsBtn = document.getElementById('exportVisitorsBtn');
        if (exportVisitorsBtn) exportVisitorsBtn.addEventListener('click', () => this.exportData('non-customers'));
        
        const exportPotentialBtn = document.getElementById('exportPotentialBtn');
        if (exportPotentialBtn) exportPotentialBtn.addEventListener('click', () => this.exportData('potential-customers'));
        
        const refreshBtn = document.getElementById('refreshDataBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
                refreshBtn.disabled = true;
                await this.loadAllData();
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
                refreshBtn.disabled = false;
            });
        }
    }

    async loadAllData() {
        console.log('📊 Loading ALL analytics data (complete history)...');
        
        try {
            await Promise.all([
                // Main KPIs
                this.loadUsersStats(),
                this.loadVisitsStats(),
                this.loadRevenueStats(),
                this.loadEngagementStats(),
                
                // Stripe API
                this.loadStripeMetrics(),
                
                // 🆕 Cloudflare Analytics (NEW!)
                this.loadCloudflareAnalytics(),
                
                // Charts
                this.loadRegistrationsChart(),
                this.loadPlansChart(),
                this.loadVisitsChart(),
                this.loadPagesChart(), // 🆕 Will use Cloudflare data
                this.loadRevenueChart(),
                this.loadChurnChart(),
                this.loadCohortChart(),
                this.loadDeviceChart(), // 🆕 Will use Cloudflare data
                this.loadGeographyChart(), // 🆕 Will use Cloudflare data
                
                // Tables
                this.loadRecentUsers(),
                this.loadRecentActivity(),
                this.loadTopUsers(),
                this.loadUserSimulations(),
                
                // Advanced Analytics
                this.loadConversionFunnel(),
                this.loadLTVAnalysis(),
                
                // ML
                this.loadMLPredictions(),
                
                // 🆕 NON-CUSTOMER VISITORS (CLOUDFLARE)
                this.loadNonCustomerVisitors(),
                this.loadPotentialCustomers()
            ]);
            
            console.log('✅ All data loaded successfully');
            await this.checkAlerts();
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
        }
    }

    // ========================================
    // 📈 MAIN KPIs
    // ========================================
    
    async loadUsersStats() {
        try {
            // 🔥 COMPLETE HISTORY (no limit)
            const usersSnapshot = await this.db.collection('users').get();
            const totalUsers = usersSnapshot.size;
            
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            
            let weekUsers = 0;
            let monthUsers = 0;
            let premiumUsers = 0;
            let activeUsers = 0;
            
            this.allUsersData = [];
            
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                
                this.allUsersData.push({
                    id: doc.id,
                    ...data
                });
                
                if (data.plan && data.plan !== 'free' && data.plan !== 'basic') {
                    premiumUsers++;
                }
                
                if (data.createdAt) {
                    const createdDate = data.createdAt.toDate();
                    if (createdDate > weekAgo) weekUsers++;
                    if (createdDate > monthAgo) monthUsers++;
                }
                
                if (data.lastLogin && data.lastLogin.toDate() > weekAgo) {
                    activeUsers++;
                }
            });
            
            this.updateStat('total-users', totalUsers);
            this.updateStat('users-change', `+${weekUsers} this week`);
            this.updateStat('premium-users', premiumUsers);
            
            const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0;
            this.updateStat('premium-change', `${conversionRate}% conversion`);
            
            this.updateStat('active-users', activeUsers);
            this.updateStat('monthly-signups', monthUsers);
            
        } catch (error) {
            console.error('Error loading users stats:', error);
        }
    }

    async loadVisitsStats() {
        try {
            // 🔥 COMPLETE HISTORY
            const visitsSnapshot = await this.db.collection('analytics_visits').get();
            const totalVisits = visitsSnapshot.size;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            let todayVisits = 0;
            let weekVisits = 0;
            let uniqueVisitors = new Set();
            let anonymousVisits = 0;
            
            this.allVisitsData = [];
            
            visitsSnapshot.forEach(doc => {
                const data = doc.data();
                
                this.allVisitsData.push({
                    id: doc.id,
                    ...data
                });
                
                if (data.timestamp) {
                    const visitDate = data.timestamp.toDate();
                    
                    if (visitDate >= today) todayVisits++;
                    if (visitDate >= weekAgo) weekVisits++;
                    
                    if (data.userId) {
                        uniqueVisitors.add(data.userId);
                    } else {
                        anonymousVisits++;
                    }
                }
            });
            
            this.updateStat('total-visits', totalVisits.toLocaleString());
            this.updateStat('visits-change', `+${todayVisits} today`);
            this.updateStat('week-visits', weekVisits.toLocaleString());
            this.updateStat('unique-visitors', uniqueVisitors.size.toLocaleString());
            this.updateStat('anonymous-visits', anonymousVisits.toLocaleString());
            
        } catch (error) {
            console.error('Error loading visits stats:', error);
        }
    }

    async loadRevenueStats() {
        try {
            // 🔥 COMPLETE HISTORY
            const paymentsSnapshot = await this.db.collection('payments').get();
            
            let totalRevenue = 0;
            let monthRevenue = 0;
            let activeSubscriptions = 0;
            let mrr = 0;
            
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            
            const planPrices = {
                'basic': 0,
                'pro': 29.99,
                'platinum': 99.99
            };
            
            this.allPaymentsData = [];
            
            paymentsSnapshot.forEach(doc => {
                const data = doc.data();
                const amount = parseFloat(data.amount) || 0;
                
                this.allPaymentsData.push({
                    id: doc.id,
                    ...data
                });
                
                totalRevenue += amount;
                
                if (data.createdAt && data.createdAt.toDate() > monthAgo) {
                    monthRevenue += amount;
                }
                
                if (data.status === 'active' || data.status === 'trialing') {
                    activeSubscriptions++;
                    const planPrice = planPrices[data.plan] || 0;
                    mrr += planPrice;
                }
            });
            
            const arr = mrr * 12;
            
            this.updateStat('total-revenue', `$${totalRevenue.toFixed(0)}`);
            this.updateStat('revenue-change', `+$${monthRevenue.toFixed(0)} this month`);
            this.updateStat('mrr', `$${mrr.toFixed(0)}`);
            this.updateStat('arr', `$${arr.toFixed(0)}`);
            this.updateStat('active-subscriptions', activeSubscriptions);
            
            this.currentMRR = mrr;
            
        } catch (error) {
            console.error('Error loading revenue stats:', error);
        }
    }

    async loadEngagementStats() {
        try {
            // 🔥 COMPLETE HISTORY (no limit)
            const activitySnapshot = await this.db.collection('analytics_activity').get();
            
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            let weekActivity = 0;
            let userActions = {};
            
            this.allActivityData = [];
            
            activitySnapshot.forEach(doc => {
                const data = doc.data();
                
                this.allActivityData.push({
                    id: doc.id,
                    ...data
                });
                
                if (data.timestamp && data.timestamp.toDate() > weekAgo) {
                    weekActivity++;
                    
                    if (data.userId) {
                        userActions[data.userId] = (userActions[data.userId] || 0) + 1;
                    }
                }
            });
            
            const avgActionsPerUser = Object.keys(userActions).length > 0
                ? (weekActivity / Object.keys(userActions).length).toFixed(1)
                : 0;
            
            this.updateStat('week-activity', weekActivity.toLocaleString());
            this.updateStat('avg-actions', avgActionsPerUser);
            
        } catch (error) {
            console.error('Error loading engagement stats:', error);
        }
    }

    // ========================================
    // 🆕 STRIPE API INTEGRATION
    // ========================================
    
    async loadStripeMetrics() {
        try {
            console.log('💳 Loading Stripe metrics in real-time...');
            
            const response = await fetch(`${WORKER_URL}/stripe-analytics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                console.warn('⚠ Unable to load Stripe data, using Firebase data');
                return;
            }
            
            const stripeData = await response.json();
            this.stripeData = stripeData;
            
            console.log('✅ Stripe data loaded:', stripeData);
            
            if (stripeData.customers) {
                this.updateStat('stripe-customers', stripeData.customers.total || 0);
            }
            
            if (stripeData.subscriptions) {
                this.updateStat('stripe-active-subs', stripeData.subscriptions.active || 0);
                this.updateStat('stripe-trial-subs', stripeData.subscriptions.trialing || 0);
            }
            
            if (stripeData.revenue) {
                this.updateStat('stripe-mrr', `$${(stripeData.revenue.mrr / 100).toFixed(0)}`);
                this.updateStat('stripe-total-revenue', `$${(stripeData.revenue.total / 100).toFixed(0)}`);
            }
            
            if (stripeData.revenueByMonth) {
                this.createStripeRevenueChart(stripeData.revenueByMonth);
            }
            
        } catch (error) {
            console.error('❌ Error loading Stripe metrics:', error);
        }
    }

    createStripeRevenueChart(revenueByMonth) {
        const labels = Object.keys(revenueByMonth).map(key => {
            const [year, month] = key.split('-');
            return `${month}/${year.slice(2)}`;
        });
        
        const data = Object.values(revenueByMonth).map(val => val / 100);
        
        this.createChart('stripe-revenue-chart', 'line', {
            labels: labels,
            datasets: [{
                label: 'Real Stripe Revenue ($)',
                data: data,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        });
    }

    // ========================================
    // 🆕 CLOUDFLARE ANALYTICS INTEGRATION
    // ========================================
    
    async loadCloudflareAnalytics() {
        try {
            console.log('☁ Loading Cloudflare Analytics...');
            
            const response = await fetch(`${WORKER_URL}/cloudflare-analytics?days=30`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                console.warn('⚠ Unable to load Cloudflare analytics');
                return;
            }
            
            const result = await response.json();
            
            if (!result.success) {
                console.warn('⚠ Cloudflare analytics returned error:', result.error);
                return;
            }
            
            this.cloudflareData = result.data;
            
            console.log('✅ Cloudflare analytics loaded:', this.cloudflareData);
            
            // Update stats with Cloudflare data
            if (this.cloudflareData.overview) {
                const overview = this.cloudflareData.overview;
                console.log('📊 Cloudflare overview:', overview);
            }
            
        } catch (error) {
            console.error('❌ Error loading Cloudflare analytics:', error);
        }
    }

    // ========================================
    // 📊 ADVANCED CHARTS
    // ========================================
    
    async loadRegistrationsChart() {
        try {
            const usersSnapshot = await this.db.collection('users').get();
            
            const daysCounts = {};
            const today = new Date();
            
            for (let i = 89; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const key = date.toISOString().split('T')[0];
                daysCounts[key] = 0;
            }
            
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.createdAt) {
                    const dateKey = data.createdAt.toDate().toISOString().split('T')[0];
                    if (daysCounts.hasOwnProperty(dateKey)) {
                        daysCounts[dateKey]++;
                    }
                }
            });
            
            const labels = Object.keys(daysCounts).map(date => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
            });
            
            const data = Object.values(daysCounts);
            
            this.createChart('registrations-chart', 'line', {
                labels: labels,
                datasets: [{
                    label: 'Registrations (last 90 days)',
                    data: data,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            });
            
        } catch (error) {
            console.error('Error loading registrations chart:', error);
        }
    }

    async loadPlansChart() {
        try {
            const usersSnapshot = await this.db.collection('users').get();
            
            const planCounts = {
                basic: 0,
                pro: 0,
                platinum: 0
            };
            
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                const plan = data.plan || 'basic';
                
                if (planCounts.hasOwnProperty(plan)) {
                    planCounts[plan]++;
                }
            });
            
            this.createChart('plans-chart', 'doughnut', {
                labels: ['Basic (Free)', 'Pro', 'Platinum'],
                datasets: [{
                    data: [planCounts.basic, planCounts.pro, planCounts.platinum],
                    backgroundColor: [
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            });
            
        } catch (error) {
            console.error('Error loading plans chart:', error);
        }
    }

    async loadVisitsChart() {
        try {
            const visitsSnapshot = await this.db.collection('analytics_visits').get();
            
            const daysCounts = {};
            const today = new Date();
            
            for (let i = 89; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const key = date.toISOString().split('T')[0];
                daysCounts[key] = 0;
            }
            
            visitsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.timestamp) {
                    const dateKey = data.timestamp.toDate().toISOString().split('T')[0];
                    if (daysCounts.hasOwnProperty(dateKey)) {
                        daysCounts[dateKey]++;
                    }
                }
            });
            
            const labels = Object.keys(daysCounts).map(date => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
            });
            
            const data = Object.values(daysCounts);
            
            this.createChart('visits-chart', 'bar', {
                labels: labels,
                datasets: [{
                    label: 'Daily visits (last 90 days)',
                    data: data,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderRadius: 8
                }]
            });
            
        } catch (error) {
            console.error('Error loading visits chart:', error);
        }
    }

    async loadRevenueChart() {
        try {
            const paymentsSnapshot = await this.db.collection('payments').get();
            
            const monthsRevenue = {};
            
            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthsRevenue[key] = 0;
            }
            
            paymentsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.createdAt) {
                    const date = data.createdAt.toDate();
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (monthsRevenue.hasOwnProperty(key)) {
                        monthsRevenue[key] += parseFloat(data.amount) || 0;
                    }
                }
            });
            
            const labels = Object.keys(monthsRevenue).map(key => {
                const [year, month] = key.split('-');
                return `${month}/${year.slice(2)}`;
            });
            
            const data = Object.values(monthsRevenue);
            
            this.createChart('revenue-chart', 'bar', {
                labels: labels,
                datasets: [{
                    label: 'Revenue ($)',
                    data: data,
                    backgroundColor: 'rgba(67, 233, 123, 0.8)',
                    borderRadius: 8
                }]
            });
            
        } catch (error) {
            console.error('Error loading revenue chart:', error);
        }
    }

    async loadChurnChart() {
        try {
            const usersSnapshot = await this.db.collection('users').get();
            
            const monthlyData = {};
            
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthlyData[key] = {
                    new: 0,
                    churned: 0,
                    active: 0
                };
            }
            
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                
                if (data.createdAt) {
                    const date = data.createdAt.toDate();
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (monthlyData[key]) {
                        monthlyData[key].new++;
                    }
                }
                
                if (data.canceledAt) {
                    const date = data.canceledAt.toDate();
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (monthlyData[key]) {
                        monthlyData[key].churned++;
                    }
                }
            });
            
            const labels = Object.keys(monthlyData).map(key => {
                const [year, month] = key.split('-');
                return `${month}/${year.slice(2)}`;
            });
            
            this.createChart('churn-chart', 'line', {
                labels: labels,
                datasets: [
                    {
                        label: 'New',
                        data: Object.values(monthlyData).map(d => d.new),
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Churned',
                        data: Object.values(monthlyData).map(d => d.churned),
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            });
            
        } catch (error) {
            console.error('Error loading churn chart:', error);
        }
    }

    async loadCohortChart() {
        try {
            const usersSnapshot = await this.db.collection('users').get();
            
            const cohorts = {};
            
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.createdAt) {
                    const cohortMonth = data.createdAt.toDate().toISOString().slice(0, 7);
                    
                    if (!cohorts[cohortMonth]) {
                        cohorts[cohortMonth] = {
                            total: 0,
                            active: 0,
                            premium: 0
                        };
                    }
                    
                    cohorts[cohortMonth].total++;
                    
                    if (data.plan && data.plan !== 'basic' && data.plan !== 'free') {
                        cohorts[cohortMonth].premium++;
                    }
                    
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    
                    if (data.lastLogin && data.lastLogin.toDate() > weekAgo) {
                        cohorts[cohortMonth].active++;
                    }
                }
            });
            
            const sortedCohorts = Object.keys(cohorts).sort().slice(-12);
            
            const labels = sortedCohorts.map(key => {
                const [year, month] = key.split('-');
                return `${month}/${year.slice(2)}`;
            });
            
            this.createChart('cohort-chart', 'bar', {
                labels: labels,
                datasets: [
                    {
                        label: 'Total',
                        data: sortedCohorts.map(key => cohorts[key].total),
                        backgroundColor: 'rgba(99, 102, 241, 0.6)'
                    },
                    {
                        label: 'Active',
                        data: sortedCohorts.map(key => cohorts[key].active),
                        backgroundColor: 'rgba(16, 185, 129, 0.6)'
                    },
                    {
                        label: 'Premium',
                        data: sortedCohorts.map(key => cohorts[key].premium),
                        backgroundColor: 'rgba(139, 92, 246, 0.6)'
                    }
                ]
            }, {
                scales: {
                    x: { stacked: false },
                    y: { stacked: false }
                }
            });
            
        } catch (error) {
            console.error('Error loading cohort chart:', error);
        }
    }

    // 🆕 CLOUDFLARE-POWERED PAGES CHART
    async loadPagesChart() {
        try {
            console.log('📄 Loading pages from Cloudflare...');
            
            const response = await fetch(`${WORKER_URL}/cloudflare-pages`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                console.warn('⚠ Cloudflare pages endpoint error, falling back to Firebase');
                return this.loadPagesChartFirebase();
            }
            
            const result = await response.json();
            
            if (!result.success || !result.pages || result.pages.length === 0) {
                console.warn('⚠ No Cloudflare pages data, falling back to Firebase');
                return this.loadPagesChartFirebase();
            }
            
            const sortedPages = result.pages
                .sort((a, b) => b.requests - a.requests)
                .slice(0, 10);
            
            const labels = sortedPages.map(p => {
                let pageName = p.path || '/';
                if (pageName.includes('.html')) {
                    pageName = pageName.replace('.html', '');
                }
                if (pageName === '/') {
                    pageName = 'Home';
                }
                return pageName;
            });
            
            const data = sortedPages.map(p => p.requests);
            
            this.createChart('pages-chart', 'bar', {
                labels: labels,
                datasets: [{
                    label: 'Page Views (Cloudflare)',
                    data: data,
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderRadius: 8
                }]
            }, {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false
            });
            
            console.log('✅ Pages chart loaded from Cloudflare');
            
        } catch (error) {
            console.error('Error loading Cloudflare pages:', error);
            return this.loadPagesChartFirebase();
        }
    }

    // Fallback: Firebase pages chart
    async loadPagesChartFirebase() {
        try {
            const visitsSnapshot = await this.db.collection('analytics_visits').get();
            
            const pagesCounts = {};
            
            visitsSnapshot.forEach(doc => {
                const data = doc.data();
                const page = data.page || data.url || 'unknown';
                
                let pageName = page;
                if (page.includes('/')) {
                    pageName = page.split('/').pop() || page;
                }
                if (pageName.includes('.html')) {
                    pageName = pageName.replace('.html', '');
                }
                
                pagesCounts[pageName] = (pagesCounts[pageName] || 0) + 1;
            });
            
            const sortedPages = Object.entries(pagesCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            const labels = sortedPages.map(p => p[0]);
            const data = sortedPages.map(p => p[1]);
            
            this.createChart('pages-chart', 'bar', {
                labels: labels,
                datasets: [{
                    label: 'Page Views (Firebase)',
                    data: data,
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderRadius: 8
                }]
            }, {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false
            });
            
        } catch (error) {
            console.error('Error loading Firebase pages:', error);
        }
    }

    // 🆕 CLOUDFLARE-POWERED DEVICE CHART
    async loadDeviceChart() {
        try {
            console.log('📱 Loading devices from Cloudflare...');
            
            const response = await fetch(`${WORKER_URL}/cloudflare-devices`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                console.warn('⚠ Cloudflare devices endpoint error, falling back to Firebase');
                return this.loadDeviceChartFirebase();
            }
            
            const result = await response.json();
            
            if (!result.success || !result.devices || result.devices.length === 0) {
                console.warn('⚠ No Cloudflare devices data, falling back to Firebase');
                return this.loadDeviceChartFirebase();
            }
            
            const deviceMap = {
                mobile: 0,
                tablet: 0,
                desktop: 0
            };
            
            result.devices.forEach(device => {
                const type = (device.type || 'desktop').toLowerCase();
                if (deviceMap.hasOwnProperty(type)) {
                    deviceMap[type] += device.requests;
                } else {
                    deviceMap['desktop'] += device.requests;
                }
            });
            
            this.createChart('device-chart', 'doughnut', {
                labels: ['Mobile', 'Tablet', 'Desktop'],
                datasets: [{
                    data: [deviceMap.mobile, deviceMap.tablet, deviceMap.desktop],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ]
                }]
            });
            
            console.log('✅ Device chart loaded from Cloudflare');
            
        } catch (error) {
            console.error('Error loading Cloudflare devices:', error);
            return this.loadDeviceChartFirebase();
        }
    }

    // Fallback: Firebase device chart
    async loadDeviceChartFirebase() {
        try {
            const visitsSnapshot = await this.db.collection('analytics_visits').get();
            
            const devices = {
                mobile: 0,
                tablet: 0,
                desktop: 0
            };
            
            visitsSnapshot.forEach(doc => {
                const data = doc.data();
                const ua = (data.userAgent || '').toLowerCase();
                
                if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
                    devices.mobile++;
                } else if (ua.includes('tablet') || ua.includes('ipad')) {
                    devices.tablet++;
                } else {
                    devices.desktop++;
                }
            });
            
            this.createChart('device-chart', 'doughnut', {
                labels: ['Mobile', 'Tablet', 'Desktop'],
                datasets: [{
                    data: [devices.mobile, devices.tablet, devices.desktop],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ]
                }]
            });
            
        } catch (error) {
            console.error('Error loading Firebase devices:', error);
        }
    }

    // 🆕 CLOUDFLARE-POWERED GEOGRAPHY CHART
    async loadGeographyChart() {
        try {
            console.log('🌍 Loading geography from Cloudflare...');
            
            const response = await fetch(`${WORKER_URL}/cloudflare-geo`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                console.warn('⚠ Cloudflare geo endpoint error, falling back to Firebase');
                return this.loadGeographyChartFirebase();
            }
            
            const result = await response.json();
            
            if (!result.success || !result.countries || result.countries.length === 0) {
                console.warn('⚠ No Cloudflare geo data, falling back to Firebase');
                return this.loadGeographyChartFirebase();
            }
            
            const sortedCountries = result.countries
                .sort((a, b) => b.requests - a.requests)
                .slice(0, 10);
            
            const labels = sortedCountries.map(c => c.country || 'Unknown');
            const data = sortedCountries.map(c => c.requests);
            
            this.createChart('geography-chart', 'bar', {
                labels: labels,
                datasets: [{
                    label: 'Visits by Country (Cloudflare)',
                    data: data,
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderRadius: 8
                }]
            }, {
                indexAxis: 'y'
            });
            
            console.log('✅ Geography chart loaded from Cloudflare');
            
        } catch (error) {
            console.error('Error loading Cloudflare geo:', error);
            return this.loadGeographyChartFirebase();
        }
    }

    // Fallback: Firebase geography chart
    async loadGeographyChartFirebase() {
        try {
            const visitsSnapshot = await this.db.collection('analytics_visits').get();
            const countries = {};
            
            visitsSnapshot.forEach(doc => {
                const data = doc.data();
                const country = data.country || 'Unknown';
                countries[country] = (countries[country] || 0) + 1;
            });
            
            const sortedCountries = Object.entries(countries)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            const labels = sortedCountries.map(c => c[0]);
            const data = sortedCountries.map(c => c[1]);
            
            this.createChart('geography-chart', 'bar', {
                labels: labels,
                datasets: [{
                    label: 'Visits by Country (Firebase)',
                    data: data,
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderRadius: 8
                }]
            }, {
                indexAxis: 'y'
            });
            
        } catch (error) {
            console.error('Error loading Firebase geo:', error);
        }
    }

    // ========================================
    // 📋 ADVANCED TABLES
    // ========================================
    
    async loadRecentUsers() {
        try {
            const usersSnapshot = await this.db.collection('users')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            const tbody = document.getElementById('recent-users-body');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                const row = document.createElement('tr');
                
                const createdAt = data.createdAt ? data.createdAt.toDate().toLocaleDateString('en-US') : 'N/A';
                const plan = data.plan || 'basic';
                
                row.innerHTML = `
                    <td>${data.email || 'N/A'}</td>
                    <td><span class="plan-badge plan-${plan}">${plan}</span></td>
                    <td>${createdAt}</td>
                    <td>${data.subscriptionStatus || 'inactive'}</td>
                `;
                
                tbody.appendChild(row);
            });
            
        } catch (error) {
            console.error('Error loading recent users:', error);
        }
    }

    async loadRecentActivity() {
        try {
            const activitySnapshot = await this.db.collection('analytics_activity').get();
            
            const tbody = document.getElementById('recent-activity-body');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            const activities = [];
            
            activitySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.timestamp) {
                    activities.push({
                        id: doc.id,
                        ...data,
                        timestampDate: data.timestamp.toDate()
                    });
                }
            });
            
            activities.sort((a, b) => b.timestampDate - a.timestampDate);
            
            const recentActivities = activities.slice(0, 20);
            
            if (recentActivities.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No recent activity</td></tr>';
                return;
            }
            
            recentActivities.forEach(activity => {
                const row = document.createElement('tr');
                
                const timestamp = activity.timestampDate.toLocaleString('en-US');
                
                row.innerHTML = `
                    <td>${activity.userId ? activity.userId.substring(0, 8) + '...' : 'Anonymous'}</td>
                    <td>${activity.action || 'N/A'}</td>
                    <td>${activity.page || 'N/A'}</td>
                    <td>${timestamp}</td>
                `;
                
                tbody.appendChild(row);
            });
            
            console.log(`✅ ${recentActivities.length} activities displayed`);
            
        } catch (error) {
            console.error('Error loading recent activity:', error);
            const tbody = document.getElementById('recent-activity-body');
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Loading error</td></tr>';
            }
        }
    }

    async loadTopUsers() {
        try {
            const usersSnapshot = await this.db.collection('users').get();
            
            const usersData = [];
            
            for (const doc of usersSnapshot.docs) {
                const userData = doc.data();
                
                const simulationsSnapshot = await this.db
                    .collection('users')
                    .doc(doc.id)
                    .collection('simulations')
                    .get();
                
                usersData.push({
                    email: userData.email,
                    plan: userData.plan || 'basic',
                    simulations: simulationsSnapshot.size,
                    createdAt: userData.createdAt
                });
            }
            
            usersData.sort((a, b) => b.simulations - a.simulations);
            
            const tbody = document.getElementById('top-users-body');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            usersData.slice(0, 10).forEach((user, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${user.email}</td>
                    <td><span class="plan-badge plan-${user.plan}">${user.plan}</span></td>
                    <td>${user.simulations}</td>
                `;
                tbody.appendChild(row);
            });
            
        } catch (error) {
            console.error('Error loading top users:', error);
        }
    }

    async loadUserSimulations() {
        try {
            const usersSnapshot = await this.db.collection('users').get();
            
            let totalSimulations = 0;
            const simulationsByUser = {};
            
            for (const doc of usersSnapshot.docs) {
                const simsSnapshot = await this.db
                    .collection('users')
                    .doc(doc.id)
                    .collection('simulations')
                    .get();
                
                totalSimulations += simsSnapshot.size;
                simulationsByUser[doc.id] = simsSnapshot.size;
            }
            
            const avgSimulations = usersSnapshot.size > 0
                ? (totalSimulations / usersSnapshot.size).toFixed(1)
                : 0;
            
            this.updateStat('total-simulations', totalSimulations.toLocaleString());
            this.updateStat('avg-simulations', avgSimulations);
            
        } catch (error) {
            console.error('Error loading simulations:', error);
        }
    }

    async loadConversionFunnel() {
        try {
            const usersSnapshot = await this.db.collection('users').get();
            const paymentsSnapshot = await this.db.collection('payments').get();
            
            let registered = usersSnapshot.size;
            let emailVerified = 0;
            let firstLogin = 0;
            let trialStarted = 0;
            let converted = paymentsSnapshot.size;
            
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.emailVerified) emailVerified++;
                if (data.lastLogin) firstLogin++;
                if (data.trialEnds) trialStarted++;
            });
            
            const tbody = document.getElementById('funnel-body');
            if (!tbody) return;
            
            tbody.innerHTML = `
                <tr>
                    <td>Registrations</td>
                    <td>${registered}</td>
                    <td>100%</td>
                </tr>
                <tr>
                    <td>Email Verified</td>
                    <td>${emailVerified}</td>
                    <td>${((emailVerified / registered) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>First Login</td>
                    <td>${firstLogin}</td>
                    <td>${((firstLogin / registered) * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Trial Started</td>
                    <td>${trialStarted}</td>
                    <td>${((trialStarted / registered) * 100).toFixed(1)}%</td>
                </tr>
                <tr class="conversion-row">
                    <td><strong>Paid Conversion</strong></td>
                    <td><strong>${converted}</strong></td>
                    <td><strong>${((converted / registered) * 100).toFixed(1)}%</strong></td>
                </tr>
            `;
            
        } catch (error) {
            console.error('Error loading funnel:', error);
        }
    }

    async loadLTVAnalysis() {
        try {
            const paymentsSnapshot = await this.db.collection('payments').get();
            
            const userPayments = {};
            
            paymentsSnapshot.forEach(doc => {
                const data = doc.data();
                const userId = data.userId || 'unknown';
                const amount = parseFloat(data.amount) || 0;
                
                userPayments[userId] = (userPayments[userId] || 0) + amount;
            });
            
            const ltvValues = Object.values(userPayments);
            const avgLTV = ltvValues.length > 0
                ? (ltvValues.reduce((a, b) => a + b, 0) / ltvValues.length).toFixed(2)
                : 0;
            
            const maxLTV = ltvValues.length > 0 ? Math.max(...ltvValues).toFixed(2) : 0;
            
            this.updateStat('avg-ltv', `$${avgLTV}`);
            this.updateStat('max-ltv', `$${maxLTV}`);
            
        } catch (error) {
            console.error('Error loading LTV:', error);
        }
    }

    // ========================================
    // 🆕 NON-CUSTOMER VISITORS (CLOUDFLARE)
    // ========================================
    
    async loadNonCustomerVisitors() {
        try {
            console.log('👥 Loading non-customer visitors from Cloudflare...');
            
            const response = await fetch(`${WORKER_URL}/cloudflare-visitors?days=30`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                console.warn('⚠ Unable to load Cloudflare visitors, using Firebase fallback');
                return this.loadNonCustomerVisitorsFirebase();
            }
            
            const result = await response.json();
            
            if (!result.success || !result.visitors) {
                console.warn('⚠ No Cloudflare visitors data, using Firebase fallback');
                return this.loadNonCustomerVisitorsFirebase();
            }
            
            this.nonCustomerVisitors = result.visitors.map(visitor => ({
                id: visitor.ip,
                ip: visitor.ip,
                country: visitor.country || 'Unknown',
                visits: visitor.requests,
                pages: [],
                devices: [],
                firstVisit: null,
                lastVisit: null
            }));
            
            console.log(`✅ ${this.nonCustomerVisitors.length} non-customer visitors loaded from Cloudflare`);
            console.log(`📊 Total requests: ${result.stats?.totalRequests || 0}`);
            
            // Update UI stats
            this.updateStat('total-non-customers', this.nonCustomerVisitors.length);
            this.updateStat('total-anonymous-visits', result.stats?.totalRequests || 0);
            
            // Display table
            this.displayNonCustomerVisitors();
            
            // Create charts
            this.createNonCustomerCharts();
            
        } catch (error) {
            console.error('❌ Error loading Cloudflare visitors:', error);
            return this.loadNonCustomerVisitorsFirebase();
        }
    }

    // Fallback: Firebase non-customer visitors
    async loadNonCustomerVisitorsFirebase() {
        try {
            console.log('👥 Loading non-customer visitors from Firebase (fallback)...');
            
            const usersSnapshot = await this.db.collection('users').get();
            const customerIds = new Set();
            usersSnapshot.forEach(doc => customerIds.add(doc.id));
            
            const visitsSnapshot = await this.db.collection('analytics_visits').get();
            
            const anonymousVisitors = {};
            let totalAnonymousVisits = 0;
            
            visitsSnapshot.forEach(doc => {
                const data = doc.data();
                
                const isNonCustomer = !data.userId || !customerIds.has(data.userId);
                
                if (isNonCustomer) {
                    totalAnonymousVisits++;
                    
                    const visitorId = data.sessionId || data.ip || 'unknown';
                    
                    if (!anonymousVisitors[visitorId]) {
                        anonymousVisitors[visitorId] = {
                            id: visitorId,
                            ip: data.ip || 'N/A',
                            country: data.country || 'Unknown',
                            firstVisit: data.timestamp ? data.timestamp.toDate() : null,
                            lastVisit: data.timestamp ? data.timestamp.toDate() : null,
                            visits: 0,
                            pages: [],
                            devices: new Set(),
                            sources: new Set()
                        };
                    }
                    
                    const visitor = anonymousVisitors[visitorId];
                    visitor.visits++;
                    
                    if (data.page) visitor.pages.push(data.page);
                    if (data.userAgent) visitor.devices.add(this.detectDevice(data.userAgent));
                    if (data.referrer) visitor.sources.add(data.referrer);
                    
                    if (data.timestamp) {
                        const visitDate = data.timestamp.toDate();
                        if (!visitor.firstVisit || visitDate < visitor.firstVisit) {
                            visitor.firstVisit = visitDate;
                        }
                        if (!visitor.lastVisit || visitDate > visitor.lastVisit) {
                            visitor.lastVisit = visitDate;
                        }
                    }
                }
            });
            
            Object.values(anonymousVisitors).forEach(visitor => {
                visitor.devices = Array.from(visitor.devices);
                visitor.sources = Array.from(visitor.sources);
            });
            
            this.nonCustomerVisitors = Object.values(anonymousVisitors);
            
            console.log(`✅ ${this.nonCustomerVisitors.length} non-customer visitors detected (Firebase)`);
            console.log(`📊 Total: ${totalAnonymousVisits} anonymous visits`);
            
            this.updateStat('total-non-customers', this.nonCustomerVisitors.length);
            this.updateStat('total-anonymous-visits', totalAnonymousVisits);
            
            this.displayNonCustomerVisitors();
            this.createNonCustomerCharts();
            
        } catch (error) {
            console.error('❌ Error loading Firebase visitors:', error);
        }
    }

    detectDevice(userAgent) {
        const ua = (userAgent || '').toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile';
        if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
        return 'Desktop';
    }

    displayNonCustomerVisitors() {
        const tbody = document.getElementById('non-customer-visitors-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const sortedVisitors = this.nonCustomerVisitors
            .sort((a, b) => b.visits - a.visits)
            .slice(0, 50);
        
        sortedVisitors.forEach(visitor => {
            const row = document.createElement('tr');
            
            const lastVisit = visitor.lastVisit ? visitor.lastVisit.toLocaleDateString('en-US') : 'N/A';
            const pagesVisited = visitor.pages ? new Set(visitor.pages).size : 0;
            const devices = visitor.devices ? (Array.isArray(visitor.devices) ? visitor.devices.join(', ') : 'N/A') : 'N/A';
            
            row.innerHTML = `
                <td>${visitor.ip}</td>
                <td>${visitor.country}</td>
                <td>${visitor.visits}</td>
                <td>${pagesVisited}</td>
                <td>${devices}</td>
                <td>${lastVisit}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        if (sortedVisitors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No non-customer visitors</td></tr>';
        }
    }

    createNonCustomerCharts() {
        const countryCounts = {};
        this.nonCustomerVisitors.forEach(visitor => {
            const country = visitor.country || 'Unknown';
            countryCounts[country] = (countryCounts[country] || 0) + 1;
        });
        
        const sortedCountries = Object.entries(countryCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        
        this.createChart('non-customer-countries-chart', 'bar', {
            labels: sortedCountries.map(c => c[0]),
            datasets: [{
                label: 'Non-customer visitors by country',
                data: sortedCountries.map(c => c[1]),
                backgroundColor: 'rgba(249, 115, 22, 0.8)',
                borderRadius: 8
            }]
        }, {
            indexAxis: 'y'
        });
    }

    // ========================================
    // 🆕 POTENTIAL CUSTOMERS (NEW SECTION)
    // ========================================
    
    async loadPotentialCustomers() {
        try {
            console.log('🎯 Analyzing potential customers...');
            
            this.potentialCustomers = this.nonCustomerVisitors.map(visitor => {
                // 🎯 POTENTIAL SCORING (0-100)
                let score = 0;
                
                // Factor 1: Number of visits (max 30 points)
                score += Math.min(visitor.visits * 3, 30);
                
                // Factor 2: Number of unique pages (max 25 points)
                const uniquePages = visitor.pages ? new Set(visitor.pages).size : 0;
                score += Math.min(uniquePages * 5, 25);
                
                // Factor 3: Recency (max 20 points)
                if (visitor.lastVisit) {
                    const daysSinceLastVisit = (new Date() - visitor.lastVisit) / (1000 * 60 * 60 * 24);
                    if (daysSinceLastVisit < 1) score += 20;
                    else if (daysSinceLastVisit < 7) score += 15;
                    else if (daysSinceLastVisit < 30) score += 10;
                }
                
                // Factor 4: Strategic pages visited (max 15 points)
                const strategicPages = ['pricing', 'plans', 'dashboard', 'signup', 'register'];
                const visitedStrategic = visitor.pages ? visitor.pages.filter(page =>
                    strategicPages.some(sp => page.toLowerCase().includes(sp))
                ).length : 0;
                score += Math.min(visitedStrategic * 5, 15);
                
                // Factor 5: Multi-device = engagement (max 10 points)
                const deviceCount = visitor.devices ? (Array.isArray(visitor.devices) ? visitor.devices.length : 0) : 0;
                score += Math.min(deviceCount * 5, 10);
                
                // Potential category
                let category = 'Low';
                if (score >= 70) category = 'Hot Lead 🔥';
                else if (score >= 50) category = 'Warm Lead 🌡';
                else if (score >= 30) category = 'Cold Lead ❄';
                
                return {
                    ...visitor,
                    score: Math.min(score, 100),
                    category: category,
                    uniquePages: uniquePages,
                    strategicPages: visitedStrategic
                };
            });
            
            this.potentialCustomers.sort((a, b) => b.score - a.score);
            
            console.log(`✅ ${this.potentialCustomers.length} potential customers analyzed`);
            
            const hotLeads = this.potentialCustomers.filter(c => c.category.includes('Hot')).length;
            const warmLeads = this.potentialCustomers.filter(c => c.category.includes('Warm')).length;
            const coldLeads = this.potentialCustomers.filter(c => c.category.includes('Cold')).length;
            
            this.updateStat('hot-leads', hotLeads);
            this.updateStat('warm-leads', warmLeads);
            this.updateStat('cold-leads', coldLeads);
            
            this.displayPotentialCustomers();
            this.createPotentialCustomersChart();
            
        } catch (error) {
            console.error('❌ Error loading potential customers:', error);
        }
    }

    displayPotentialCustomers() {
        const tbody = document.getElementById('potential-customers-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const topLeads = this.potentialCustomers.slice(0, 50);
        
        topLeads.forEach((lead, index) => {
            const row = document.createElement('tr');
            
            const lastVisit = lead.lastVisit ? lead.lastVisit.toLocaleDateString('en-US') : 'N/A';
            
            let scoreColor = '#ef4444';
            if (lead.score >= 70) scoreColor = '#10b981';
            else if (lead.score >= 50) scoreColor = '#f59e0b';
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${lead.ip}</td>
                <td>${lead.country}</td>
                <td>${lead.visits}</td>
                <td>${lead.uniquePages}</td>
                <td style="font-weight: bold; color: ${scoreColor};">${lead.score}</td>
                <td>${lead.category}</td>
                <td>${lastVisit}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        if (topLeads.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No potential customers detected</td></tr>';
        }
    }

    createPotentialCustomersChart() {
        const scoreBuckets = {
            '0-20': 0,
            '21-40': 0,
            '41-60': 0,
            '61-80': 0,
            '81-100': 0
        };
        
        this.potentialCustomers.forEach(customer => {
            if (customer.score <= 20) scoreBuckets['0-20']++;
            else if (customer.score <= 40) scoreBuckets['21-40']++;
            else if (customer.score <= 60) scoreBuckets['41-60']++;
            else if (customer.score <= 80) scoreBuckets['61-80']++;
            else scoreBuckets['81-100']++;
        });
        
        this.createChart('potential-customers-chart', 'bar', {
            labels: Object.keys(scoreBuckets),
            datasets: [{
                label: 'Distribution of potential scores',
                data: Object.values(scoreBuckets),
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(132, 204, 22, 0.8)',
                    'rgba(16, 185, 129, 0.8)'
                ],
                borderRadius: 8
            }]
        });
    }

    // ========================================
    // 🆕 ML PREDICTIONS
    // ========================================
    
    async loadMLPredictions() {
        try {
            console.log('🤖 Generating ML predictions...');
            
            const churnPrediction = await this.predictChurn();
            const ltvPrediction = await this.predictLTV();
            const mrrPrediction = await this.predictMRR();
            
            const container = document.getElementById('ml-predictions');
            if (container) {
                container.innerHTML = `
                    <div class="prediction-card">
                        <div class="prediction-icon">📉</div>
                        <div class="prediction-content">
                            <h3>Predicted Churn (30 days)</h3>
                            <div class="prediction-value ${churnPrediction.risk > 5 ? 'danger' : 'success'}">
                                ${churnPrediction.value} users
                            </div>
                            <div class="prediction-detail">
                                Rate: ${churnPrediction.risk.toFixed(1)}%
                                ${churnPrediction.risk > 5 ? '⚠ High risk' : '✅ Normal'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="prediction-card">
                        <div class="prediction-icon">💰</div>
                        <div class="prediction-content">
                            <h3>Projected Avg LTV</h3>
                            <div class="prediction-value success">
                                $${ltvPrediction.toFixed(2)}
                            </div>
                            <div class="prediction-detail">
                                Per premium user
                            </div>
                        </div>
                    </div>
                    
                    <div class="prediction-card">
                        <div class="prediction-icon">📈</div>
                        <div class="prediction-content">
                            <h3>Predicted MRR (3 months)</h3>
                            <div class="prediction-value success">
                                $${mrrPrediction.toFixed(0)}
                            </div>
                            <div class="prediction-detail">
                                Trend: ${mrrPrediction > (this.currentMRR || 0) ? '↗ Growth' : '↘ Decline'}
                            </div>
                        </div>
                    </div>
                `;
            }
            
            console.log('✅ ML predictions generated');
            
        } catch (error) {
            console.error('❌ Error generating ML predictions:', error);
        }
    }

    async predictChurn() {
        const usersSnapshot = await this.db.collection('users').get();
        
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let inactiveUsers = 0;
        let totalPremiumUsers = 0;
        
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            
            if (data.plan && data.plan !== 'basic' && data.plan !== 'free') {
                totalPremiumUsers++;
                
                if (!data.lastLogin || data.lastLogin.toDate() < thirtyDaysAgo) {
                    inactiveUsers++;
                }
            }
        });
        
        const churnRate = totalPremiumUsers > 0 ? (inactiveUsers / totalPremiumUsers) * 100 : 0;
        
        return {
            value: inactiveUsers,
            risk: churnRate
        };
    }

    async predictLTV() {
        const paymentsSnapshot = await this.db.collection('payments').get();
        
        const userPayments = {};
        let totalRevenue = 0;
        let totalUsers = 0;
        
        paymentsSnapshot.forEach(doc => {
            const data = doc.data();
            const userId = data.userId || 'unknown';
            const amount = parseFloat(data.amount) || 0;
            
            if (!userPayments[userId]) {
                userPayments[userId] = 0;
                totalUsers++;
            }
            
            userPayments[userId] += amount;
            totalRevenue += amount;
        });
        
        const currentLTV = totalUsers > 0 ? totalRevenue / totalUsers : 0;
        const projectedLTV = currentLTV * 1.1;
        
        return projectedLTV;
    }

    async predictMRR() {
        const paymentsSnapshot = await this.db.collection('payments').get();
        
        const monthlyRevenue = {};
        
        paymentsSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.createdAt) {
                const monthKey = data.createdAt.toDate().toISOString().slice(0, 7);
                monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (parseFloat(data.amount) || 0);
            }
        });
        
        const months = Object.keys(monthlyRevenue).sort();
        const revenues = months.map(m => monthlyRevenue[m]);
        
        if (revenues.length < 2) {
            return this.currentMRR || 0;
        }
        
        const n = revenues.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = revenues.reduce((a, b) => a + b, 0);
        const sumXY = revenues.reduce((sum, y, x) => sum + x * y, 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const futureMonth = n + 3;
        const predictedMRR = slope * futureMonth + intercept;
        
        return Math.max(predictedMRR, 0);
    }

    // ========================================
    // 🔔 ALERTS
    // ========================================
    
    async checkAlerts() {
        try {
            console.log('🔔 Checking alerts...');
            
            const alerts = [];
            
            const mrrAlert = await this.checkMRRDrop();
            if (mrrAlert) alerts.push(mrrAlert);
            
            const churnAlert = await this.checkHighChurn();
            if (churnAlert) alerts.push(churnAlert);
            
            const activeUsersAlert = await this.checkLowActiveUsers();
            if (activeUsersAlert) alerts.push(activeUsersAlert);
            
            const conversionAlert = await this.checkConversionDrop();
            if (conversionAlert) alerts.push(conversionAlert);
            
            if (alerts.length > 0) {
                console.log(`⚠ ${alerts.length} alert(s) detected:`, alerts);
                await this.sendAlertEmail(alerts);
            } else {
                console.log('✅ No alerts - all good');
            }
            
        } catch (error) {
            console.error('❌ Error checking alerts:', error);
        }
    }

    async checkMRRDrop() {
        const paymentsSnapshot = await this.db.collection('payments')
            .where('status', 'in', ['active', 'trialing'])
            .get();
        
        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
        const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
        
        let currentMRR = 0;
        let lastMonthMRR = 0;
        
        const planPrices = { basic: 0, pro: 29.99, platinum: 99.99 };
        
        paymentsSnapshot.forEach(doc => {
            const data = doc.data();
            const price = planPrices[data.plan] || 0;
            
            if (data.createdAt) {
                const month = data.createdAt.toDate().toISOString().slice(0, 7);
                if (month === thisMonth) currentMRR += price;
                if (month === lastMonth) lastMonthMRR += price;
            }
        });
        
        if (lastMonthMRR > 0) {
            const dropPercent = ((lastMonthMRR - currentMRR) / lastMonthMRR) * 100;
            
            if (dropPercent > this.alertThresholds.mrrDropPercent) {
                return {
                    type: 'MRR_DROP',
                    severity: 'high',
                    message: `MRR dropped by ${dropPercent.toFixed(1)}%`,
                    data: {
                        currentMRR: currentMRR.toFixed(2),
                        lastMonthMRR: lastMonthMRR.toFixed(2),
                        dropPercent: dropPercent.toFixed(1)
                    }
                };
            }
        }
        
        return null;
    }

    async checkHighChurn() {
        const churnPrediction = await this.predictChurn();
        
        if (churnPrediction.risk > this.alertThresholds.churnRatePercent) {
            return {
                type: 'HIGH_CHURN',
                severity: 'medium',
                message: `High churn rate: ${churnPrediction.risk.toFixed(1)}%`,
                data: {
                    churnRate: churnPrediction.risk.toFixed(1),
                    affectedUsers: churnPrediction.value
                }
            };
        }
        
        return null;
    }

    async checkLowActiveUsers() {
        const usersSnapshot = await this.db.collection('users').get();
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        let activeUsers = 0;
        
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.lastLogin && data.lastLogin.toDate() > weekAgo) {
                activeUsers++;
            }
        });
        
        if (activeUsers < this.alertThresholds.lowActiveUsers) {
            return {
                type: 'LOW_ACTIVE_USERS',
                severity: 'medium',
                message: `Only ${activeUsers} active users this week`,
                data: {
                    activeUsers: activeUsers,
                    threshold: this.alertThresholds.lowActiveUsers
                }
            };
        }
        
        return null;
    }

    async checkConversionDrop() {
        const usersSnapshot = await this.db.collection('users').get();
        const paymentsSnapshot = await this.db.collection('payments').get();
        
        const totalUsers = usersSnapshot.size;
        const premiumUsers = paymentsSnapshot.size;
        
        const currentConversion = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;
        
        const lastConversion = parseFloat(localStorage.getItem('lastConversionRate') || currentConversion);
        
        const drop = lastConversion - currentConversion;
        
        localStorage.setItem('lastConversionRate', currentConversion.toString());
        
        if (drop > this.alertThresholds.conversionDrop) {
            return {
                type: 'CONVERSION_DROP',
                severity: 'high',
                message: `Conversion rate dropped by ${drop.toFixed(1)}%`,
                data: {
                    currentConversion: currentConversion.toFixed(1),
                    lastConversion: lastConversion.toFixed(1),
                    drop: drop.toFixed(1)
                }
            };
        }
        
        return null;
    }

    async sendAlertEmail(alerts) {
        try {
            console.log('📧 Sending alert email...');
            
            const response = await fetch(`${WORKER_URL}/send-alert-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: ADMIN_EMAIL,
                    alerts: alerts,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                console.log('✅ Alert email sent successfully');
            } else {
                console.warn('⚠ Error sending alert email');
            }
            
        } catch (error) {
            console.error('❌ Error sending alert email:', error);
        }
    }

    // ========================================
    // 📥 CSV EXPORT
    // ========================================
    
    async exportAllData() {
        console.log('📥 Exporting all data...');
        
        await Promise.all([
            this.exportData('users'),
            this.exportData('visits'),
            this.exportData('payments'),
            this.exportData('activity'),
            this.exportData('non-customers'),
            this.exportData('potential-customers')
        ]);
        
        alert('✅ All data has been exported to CSV!');
    }

    async exportData(type) {
        try {
            console.log(`📥 Exporting ${type} to CSV...`);
            
            let data = [];
            let filename = '';
            let headers = [];
            
            switch(type) {
                case 'users':
                    data = this.allUsersData;
                    filename = 'users';
                    headers = ['ID', 'Email', 'Plan', 'Subscription Status', 'Created At', 'Last Login'];
                    data = data.map(u => [
                        u.id,
                        u.email,
                        u.plan || 'basic',
                        u.subscriptionStatus || 'inactive',
                        u.createdAt ? u.createdAt.toDate().toISOString() : 'N/A',
                        u.lastLogin ? u.lastLogin.toDate().toISOString() : 'N/A'
                    ]);
                    break;
                
                case 'visits':
                    data = this.allVisitsData;
                    filename = 'visits';
                    headers = ['ID', 'User ID', 'Page', 'URL', 'Timestamp', 'Country', 'User Agent'];
                    data = data.map(v => [
                        v.id,
                        v.userId || 'Anonymous',
                        v.page || 'N/A',
                        v.url || 'N/A',
                        v.timestamp ? v.timestamp.toDate().toISOString() : 'N/A',
                        v.country || 'Unknown',
                        v.userAgent || 'N/A'
                    ]);
                    break;
                
                case 'payments':
                case 'revenue':
                    data = this.allPaymentsData;
                    filename = 'payments';
                    headers = ['ID', 'User ID', 'Plan', 'Amount', 'Status', 'Created At'];
                    data = data.map(p => [
                        p.id,
                        p.userId || 'N/A',
                        p.plan || 'N/A',
                        p.amount || 0,
                        p.status || 'N/A',
                        p.createdAt ? p.createdAt.toDate().toISOString() : 'N/A'
                    ]);
                    break;
                
                case 'activity':
                    data = this.allActivityData;
                    filename = 'activity';
                    headers = ['ID', 'User ID', 'Action', 'Page', 'Timestamp'];
                    data = data.map(a => [
                        a.id,
                        a.userId || 'Anonymous',
                        a.action || 'N/A',
                        a.page || 'N/A',
                        a.timestamp ? a.timestamp.toDate().toISOString() : 'N/A'
                    ]);
                    break;
                
                case 'non-customers':
                    data = this.nonCustomerVisitors;
                    filename = 'non_customer_visitors';
                    headers = ['ID', 'IP', 'Country', 'Visits', 'Pages', 'Devices', 'First Visit', 'Last Visit'];
                    data = data.map(v => [
                        v.id,
                        v.ip,
                        v.country,
                        v.visits,
                        v.pages ? new Set(v.pages).size : 0,
                        v.devices ? (Array.isArray(v.devices) ? v.devices.join('; ') : '') : '',
                        v.firstVisit ? v.firstVisit.toISOString() : 'N/A',
                        v.lastVisit ? v.lastVisit.toISOString() : 'N/A'
                    ]);
                    break;
                
                case 'potential-customers':
                    data = this.potentialCustomers;
                    filename = 'potential_customers';
                    headers = ['IP', 'Country', 'Visits', 'Unique Pages', 'Score', 'Category', 'Last Visit'];
                    data = data.map(c => [
                        c.ip,
                        c.country,
                        c.visits,
                        c.uniquePages,
                        c.score,
                        c.category,
                        c.lastVisit ? c.lastVisit.toISOString() : 'N/A'
                    ]);
                    break;
                
                default:
                    console.warn('Unknown export type:', type);
                    return;
            }
            
            if (data.length === 0) {
                console.warn(`No data to export for ${type}`);
                return;
            }
            
            const csvContent = this.arrayToCSV(data, headers);
            this.downloadCSV(csvContent, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            
            console.log(`✅ Export ${type} successful`);
            
        } catch (error) {
            console.error(`❌ Error exporting ${type}:`, error);
        }
    }

    arrayToCSV(data, headers) {
        let csv = headers.join(',') + '\n';
        
        data.forEach(row => {
            csv += row.map(cell => {
                const cellStr = String(cell || '');
                if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                    return `"${cellStr.replace(/"/g, '""')}"`;
                }
                return cellStr;
            }).join(',') + '\n';
        });
        
        return csv;
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, filename);
        } else {
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // ========================================
    // 🛠 HELPERS
    // ========================================
    
    updateStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    createChart(canvasId, type, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        this.charts[canvasId] = new Chart(ctx, {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: type !== 'bar' && type !== 'line'
                    }
                },
                ...options
            }
        });
    }
}

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Admin Analytics PRO v3.2...');
    window.adminAnalytics = new AdminAnalyticsPro(); // Expose globally for export buttons
});