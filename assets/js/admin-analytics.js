// ========================================
// ADMIN ANALYTICS PRO - ULTRA POWERFUL DASHBOARD v4.0
// ✅ Section 1: Third-Party Analytics (Stripe, Cloudflare, Firebase)
// ✅ Section 2: Internal Analytics (analytics-tracker.js)
// ✅ Geographic Maps (Leaflet.js)
// ✅ Complete Data Exploitation
// ✅ Advanced Sales Optimization
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
        this.maps = {};
        
        // Third-Party Data
        this.stripeData = null;
        this.cloudflareData = null;
        this.cloudflareGeo = null;
        this.cloudflareDevices = null;
        this.cloudflarePages = null;
        this.cloudflareVisitors = null;
        
        // Internal Analytics Data
        this.allUsersData = [];
        this.allVisitsData = [];
        this.allPaymentsData = [];
        this.allActivityData = [];
        this.nonCustomerVisitors = [];
        this.potentialCustomers = [];
        
        // Advanced Metrics
        this.sessionData = [];
        this.conversionPaths = [];
        this.bounceRateData = {};
        this.heatmapData = {};
        
        // Alert thresholds
        this.alertThresholds = {
            mrrDropPercent: 10,
            churnRatePercent: 5,
            lowActiveUsers: 1,
            conversionDrop: 2
        };
        
        this.init();
    }

    async init() {
        console.log('🔐 Initializing Admin Analytics PRO v4.0...');
        
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
            
            // Load Leaflet.js for maps
            await this.loadLeafletLibrary();
            
            await this.loadAllData();
            this.initEventListeners();
            this.initSectionTabs();
            
            // Auto-refresh every 5 minutes
            setInterval(() => this.checkAlerts(), 5 * 60 * 1000);
        });
    }

    async loadLeafletLibrary() {
        return new Promise((resolve) => {
            if (typeof L !== 'undefined') {
                resolve();
                return;
            }
            
            // Load Leaflet CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
            
            // Load Leaflet JS
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
                console.log('✅ Leaflet.js loaded');
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    initEventListeners() {
        console.log('🎯 Initializing event listeners...');
        
        // Export buttons
        const exportButtons = {
            'exportDataBtn': () => this.exportAllData(),
            'exportUsersBtn': () => this.exportData('users'),
            'exportRevenueBtn': () => this.exportData('revenue'),
            'exportVisitorsBtn': () => this.exportData('non-customers'),
            'exportPotentialBtn': () => this.exportData('potential-customers'),
            'exportCloudflareBtn': () => this.exportData('cloudflare'),
            'exportStripeBtn': () => this.exportData('stripe'),
            'exportSessionsBtn': () => this.exportData('sessions'),
            'exportConversionPathsBtn': () => this.exportData('conversion-paths'),
            'exportActivityBtn': () => this.exportData('activity'),
            'exportVisitsBtn': () => this.exportData('visits'),
            'exportPaymentsBtn': () => this.exportData('payments')
        };
        
        Object.entries(exportButtons).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handler);
                console.log(`✅ Export button registered: ${id}`);
            }
        });
        
        // Refresh button
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
        
        console.log('✅ Event listeners initialized');
    }

    initSectionTabs() {
        const tabButtons = document.querySelectorAll('.section-tab');
        const sections = document.querySelectorAll('.analytics-section');
        
        if (tabButtons.length === 0) {
            console.warn('⚠ No section tabs found');
            return;
        }
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetSection = button.dataset.section;
                
                // Update active tab
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show target section
                sections.forEach(section => {
                    if (section.id === targetSection) {
                        section.classList.add('active');
                        section.style.display = 'block';
                    } else {
                        section.classList.remove('active');
                        section.style.display = 'none';
                    }
                });
                
                console.log(`🔄 Switched to section: ${targetSection}`);
            });
        });
        
        console.log('✅ Section tabs initialized');
    }

    async loadAllData() {
        console.log('📊 Loading ALL analytics data (complete history)...');
        
        const startTime = Date.now();
        
        try {
            await Promise.all([
                // ========================================
                // SECTION 1: THIRD-PARTY ANALYTICS
                // ========================================
                this.loadStripeMetrics(),
                this.loadCloudflareAnalytics(),
                this.loadCloudflareGeo(),
                this.loadCloudflareDevices(),
                this.loadCloudflarePages(),
                this.loadCloudflareVisitors(),
                
                // ========================================
                // SECTION 2: INTERNAL ANALYTICS
                // ========================================
                this.loadUsersStats(),
                this.loadVisitsStats(),
                this.loadRevenueStats(),
                this.loadEngagementStats(),
                this.loadSessionAnalytics(),
                this.loadBounceRateAnalytics(),
                this.loadConversionPaths(),
                this.loadHeatmapData(),
                
                // Charts
                this.loadRegistrationsChart(),
                this.loadPlansChart(),
                this.loadVisitsChart(),
                this.loadRevenueChart(),
                this.loadChurnChart(),
                this.loadCohortChart(),
                
                // Tables
                this.loadRecentUsers(),
                this.loadRecentActivity(),
                this.loadTopUsers(),
                this.loadUserSimulations(),
                
                // Advanced
                this.loadConversionFunnel(),
                this.loadLTVAnalysis(),
                this.loadMLPredictions(),
                
                // Non-customers
                this.loadNonCustomerVisitors(),
                this.loadPotentialCustomers()
            ]);
            
            const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ All data loaded successfully in ${loadTime}s`);
            
            await this.checkAlerts();
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            alert('⚠ Error loading analytics data. Check console for details.');
        }
    }

    // ========================================
    // SECTION 1: THIRD-PARTY ANALYTICS
    // ========================================
    
    // 💳 STRIPE METRICS
    async loadStripeMetrics() {
        try {
            console.log('💳 Loading Stripe metrics...');
            
            const response = await fetch(`${WORKER_URL}/stripe-analytics`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                console.warn('⚠ Stripe data unavailable, using Firebase fallback');
                return;
            }
            
            const stripeData = await response.json();
            this.stripeData = stripeData;
            
            console.log('✅ Stripe data loaded:', stripeData);
            
            // Update stats
            if (stripeData.customers) {
                this.updateStat('stripe-total-customers', stripeData.customers.total || 0);
                this.updateStat('stripe-customers-with-subs', stripeData.customers.withSubscription || 0);
            }
            
            if (stripeData.subscriptions) {
                this.updateStat('stripe-active-subs', stripeData.subscriptions.active || 0);
                this.updateStat('stripe-trial-subs', stripeData.subscriptions.trialing || 0);
                this.updateStat('stripe-canceled-subs', stripeData.subscriptions.canceled || 0);
                this.updateStat('stripe-past-due-subs', stripeData.subscriptions.past_due || 0);
                
                const totalSubs = stripeData.subscriptions.total || 0;
                const activeSubs = stripeData.subscriptions.active || 0;
                const retentionRate = totalSubs > 0 ? ((activeSubs / totalSubs) * 100).toFixed(1) : 0;
                this.updateStat('stripe-retention-rate', `${retentionRate}%`);
            }
            
            if (stripeData.revenue) {
                this.updateStat('stripe-mrr', `$${(stripeData.revenue.mrr / 100).toFixed(0)}`);
                this.updateStat('stripe-arr', `$${(stripeData.revenue.arr / 100).toFixed(0)}`);
                this.updateStat('stripe-total-revenue', `$${(stripeData.revenue.total / 100).toFixed(0)}`);
                
                // ARPU (Average Revenue Per User)
                const totalCustomers = stripeData.customers.total || 1;
                const arpu = (stripeData.revenue.mrr / 100) / totalCustomers;
                this.updateStat('stripe-arpu', `$${arpu.toFixed(2)}`);
            }
            
            // Charts
            if (stripeData.revenueByMonth) {
                this.createStripeRevenueChart(stripeData.revenueByMonth);
            }
            
            if (stripeData.revenueByPlan) {
                this.createStripePlanRevenueChart(stripeData.revenueByPlan);
            }
            
        } catch (error) {
            console.error('❌ Stripe error:', error);
        }
    }

    createStripeRevenueChart(revenueByMonth) {
        const labels = Object.keys(revenueByMonth).sort().map(key => {
            const [year, month] = key.split('-');
            return `${month}/${year.slice(2)}`;
        });
        
        const data = Object.values(revenueByMonth).map(val => val / 100);
        
        this.createChart('stripe-revenue-chart', 'line', {
            labels: labels,
            datasets: [{
                label: 'Monthly Revenue ($)',
                data: data,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3
            }]
        }, {
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
        });
    }

    createStripePlanRevenueChart(revenueByPlan) {
        const totalRevenue = revenueByPlan.basic + revenueByPlan.pro + revenueByPlan.platinum;
        
        this.createChart('stripe-plan-revenue-chart', 'doughnut', {
            labels: ['Basic', 'Pro', 'Platinum'],
            datasets: [{
                data: [
                    revenueByPlan.basic / 100,
                    revenueByPlan.pro / 100,
                    revenueByPlan.platinum / 100
                ],
                backgroundColor: [
                    'rgba(6, 182, 212, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        }, {
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const percentage = totalRevenue > 0 ? ((value / (totalRevenue / 100)) * 100).toFixed(1) : 0;
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        });
    }

    // ☁ CLOUDFLARE ANALYTICS
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
                console.warn('⚠ Cloudflare analytics unavailable');
                return;
            }
            
            const result = await response.json();
            
            if (!result.success) {
                console.warn('⚠ Cloudflare returned error:', result.error);
                return;
            }
            
            this.cloudflareData = result.data;
            
            console.log('✅ Cloudflare analytics loaded:', this.cloudflareData);
            
            if (this.cloudflareData.overview) {
                const overview = this.cloudflareData.overview;
                
                this.updateStat('cf-total-requests', overview.totalRequests?.toLocaleString() || '0');
                this.updateStat('cf-total-bytes', this.formatBytes(overview.totalBytes || 0));
                this.updateStat('cf-cached-requests', overview.totalCachedRequests?.toLocaleString() || '0');
                this.updateStat('cf-cache-hit-rate', `${overview.cacheHitRate || 0}%`);
                this.updateStat('cf-total-pageviews', overview.totalPageViews?.toLocaleString() || '0');
                this.updateStat('cf-total-uniques', overview.totalUniques?.toLocaleString() || '0');
                this.updateStat('cf-total-threats', overview.totalThreats?.toLocaleString() || '0');
                
                // Bandwidth saved by cache
                const totalBytes = overview.totalBytes || 0;
                const cachedBytes = overview.totalCachedBytes || 0;
                const bandwidthSaved = this.formatBytes(cachedBytes);
                this.updateStat('cf-bandwidth-saved', bandwidthSaved);
                
                // Requests by date chart
                if (overview.requestsByDate) {
                    this.createCloudflareRequestsChart(overview.requestsByDate);
                }
            }
            
        } catch (error) {
            console.error('❌ Cloudflare analytics error:', error);
        }
    }

    createCloudflareRequestsChart(requestsByDate) {
        const labels = Object.keys(requestsByDate).sort();
        const data = labels.map(date => requestsByDate[date]);
        
        this.createChart('cf-requests-chart', 'line', {
            labels: labels.map(date => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
            }),
            datasets: [{
                label: 'Daily Requests',
                data: data,
                borderColor: 'rgb(249, 115, 22)',
                backgroundColor: 'rgba(249, 115, 22, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3
            }]
        }, {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        });
    }

    // 🌍 CLOUDFLARE GEO (WITH MAP!)
    async loadCloudflareGeo() {
        try {
            console.log('🌍 Loading Cloudflare Geo...');
            
            const response = await fetch(`${WORKER_URL}/cloudflare-geo`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                console.warn('⚠ Cloudflare geo unavailable');
                return;
            }
            
            const result = await response.json();
            
            if (!result.success || !result.countries) {
                console.warn('⚠ No geo data');
                return;
            }
            
            this.cloudflareGeo = result.countries;
            
            console.log('✅ Geo data loaded:', this.cloudflareGeo.length, 'countries');
            
            // Stats
            const topCountry = this.cloudflareGeo.sort((a, b) => b.requests - a.requests)[0];
            this.updateStat('cf-top-country', topCountry?.country || 'N/A');
            this.updateStat('cf-top-country-requests', topCountry?.requests?.toLocaleString() || '0');
            
            // Create geo chart
            this.createCloudflareGeoChart(this.cloudflareGeo);
            
            // Create interactive map
            this.createGeoMap(this.cloudflareGeo);
            
        } catch (error) {
            console.error('❌ Cloudflare geo error:', error);
        }
    }

    createCloudflareGeoChart(countries) {
        const sortedCountries = countries
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 10);
        
        this.createChart('cf-geo-chart', 'bar', {
            labels: sortedCountries.map(c => c.country),
            datasets: [{
                label: 'Requests by Country',
                data: sortedCountries.map(c => c.requests),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                borderRadius: 8
            }]
        }, {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        });
    }

    createGeoMap(countries) {
        const mapContainer = document.getElementById('geo-map');
        if (!mapContainer || typeof L === 'undefined') {
            console.warn('⚠ Map container not found or Leaflet not loaded');
            return;
        }
        
        // Clear existing map
        if (this.maps.geoMap) {
            this.maps.geoMap.remove();
        }
        
        // Create map
        const map = L.map('geo-map').setView([20, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(map);
        
        // Country coordinates (comprehensive list)
        const countryCoords = {
            'United States': [37.09, -95.71],
            'France': [46.23, 2.21],
            'United Kingdom': [55.38, -3.44],
            'Germany': [51.17, 10.45],
            'Canada': [56.13, -106.35],
            'Spain': [40.46, -3.75],
            'Italy': [41.87, 12.57],
            'Japan': [36.20, 138.25],
            'Australia': [-25.27, 133.78],
            'Brazil': [-14.24, -51.93],
            'India': [20.59, 78.96],
            'China': [35.86, 104.20],
            'Mexico': [23.63, -102.55],
            'Netherlands': [52.13, 5.29],
            'Switzerland': [46.82, 8.23],
            'Belgium': [50.50, 4.47],
            'Sweden': [60.13, 18.64],
            'Norway': [60.47, 8.47],
            'Denmark': [56.26, 9.50],
            'Poland': [51.92, 19.15],
            'Austria': [47.52, 14.55],
            'Portugal': [39.40, -8.22],
            'Ireland': [53.41, -8.24],
            'Finland': [61.92, 25.75],
            'Russia': [61.52, 105.32],
            'South Korea': [35.91, 127.77],
            'Singapore': [1.35, 103.82],
            'Hong Kong': [22.40, 114.11],
            'Taiwan': [23.70, 120.96],
            'Thailand': [15.87, 100.99],
            'Vietnam': [14.06, 108.28],
            'Indonesia': [-0.79, 113.92],
            'Malaysia': [4.21, 101.98],
            'Philippines': [12.88, 121.77],
            'South Africa': [-30.56, 22.94],
            'Argentina': [-38.42, -63.62],
            'Chile': [-35.68, -71.54],
            'Colombia': [4.57, -74.30],
            'Peru': [-9.19, -75.02],
            'Turkey': [38.96, 35.24],
            'Saudi Arabia': [23.89, 45.08],
            'UAE': [23.42, 53.85],
            'Israel': [31.05, 34.85],
            'Egypt': [26.82, 30.80],
            'Nigeria': [9.08, 8.68],
            'Kenya': [-0.02, 37.91],
            'New Zealand': [-40.90, 174.89],
            'Greece': [39.07, 21.82],
            'Czech Republic': [49.82, 15.47],
            'Romania': [45.94, 24.97],
            'Hungary': [47.16, 19.50],
            'Ukraine': [48.38, 31.17],
            'Morocco': [31.79, -7.09],
            'Pakistan': [30.38, 69.35],
            'Bangladesh': [23.68, 90.36],
            'Unknown': [0, 0]
        };
        
        // Find max requests for scaling
        const maxRequests = Math.max(...countries.map(c => c.requests));
        
        // Add markers
        countries.forEach(country => {
            const coords = countryCoords[country.country];
            if (coords && coords[0] !== 0 && coords[1] !== 0) {
                // Scale radius based on requests
                const radius = Math.sqrt(country.requests / maxRequests) * 30 + 5;
                
                L.circleMarker(coords, {
                    radius: radius,
                    fillColor: '#10b981',
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.6
                })
                .bindPopup(`
                    <div style="text-align: center;">
                        <strong style="font-size: 14px;">${country.country}</strong><br>
                        <span style="color: #10b981;">Requests: ${country.requests.toLocaleString()}</span><br>
                        <span style="color: #6366f1;">Uniques: ${country.uniques?.toLocaleString() || 'N/A'}</span>
                    </div>
                `)
                .addTo(map);
            }
        });
        
        this.maps.geoMap = map;
        
        console.log('✅ Geo map created with', countries.length, 'countries');
    }

    // 📱 CLOUDFLARE DEVICES
    async loadCloudflareDevices() {
        try {
            console.log('📱 Loading Cloudflare Devices...');
            
            const response = await fetch(`${WORKER_URL}/cloudflare-devices`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                console.warn('⚠ Cloudflare devices unavailable');
                return;
            }
            
            const result = await response.json();
            
            if (!result.success || !result.devices) {
                console.warn('⚠ No device data');
                return;
            }
            
            this.cloudflareDevices = result.devices;
            
            console.log('✅ Device data loaded:', this.cloudflareDevices);
            
            // Update stats
            const totalRequests = this.cloudflareDevices.reduce((sum, d) => sum + d.requests, 0);
            const mobileRequests = this.cloudflareDevices.find(d => d.type === 'mobile')?.requests || 0;
            const desktopRequests = this.cloudflareDevices.find(d => d.type === 'desktop')?.requests || 0;
            const tabletRequests = this.cloudflareDevices.find(d => d.type === 'tablet')?.requests || 0;
            
            this.updateStat('cf-mobile-percent', `${((mobileRequests / totalRequests) * 100).toFixed(1)}%`);
            this.updateStat('cf-desktop-percent', `${((desktopRequests / totalRequests) * 100).toFixed(1)}%`);
            this.updateStat('cf-tablet-percent', `${((tabletRequests / totalRequests) * 100).toFixed(1)}%`);
            
            // Chart
            this.createChart('cf-devices-chart', 'doughnut', {
                labels: this.cloudflareDevices.map(d => d.type.charAt(0).toUpperCase() + d.type.slice(1)),
                datasets: [{
                    data: this.cloudflareDevices.map(d => d.requests),
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            }, {
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Cloudflare devices error:', error);
        }
    }

    // 📄 CLOUDFLARE PAGES
    async loadCloudflarePages() {
        try {
            console.log('📄 Loading Cloudflare Pages...');
            
            const response = await fetch(`${WORKER_URL}/cloudflare-pages`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                console.warn('⚠ Cloudflare pages unavailable');
                return;
            }
            
            const result = await response.json();
            
            if (!result.success || !result.pages) {
                console.warn('⚠ No page data');
                return;
            }
            
            this.cloudflarePages = result.pages;
            
            console.log('✅ Page data loaded:', this.cloudflarePages.length, 'pages');
            
            // Stats
            const topPage = this.cloudflarePages.sort((a, b) => b.requests - a.requests)[0];
            this.updateStat('cf-top-page', topPage?.path || '/');
            this.updateStat('cf-top-page-views', topPage?.requests?.toLocaleString() || '0');
            
            // Chart
            const sortedPages = this.cloudflarePages
                .sort((a, b) => b.requests - a.requests)
                .slice(0, 10);
            
            this.createChart('cf-pages-chart', 'bar', {
                labels: sortedPages.map(p => {
                    let name = p.path || '/';
                    if (name.includes('.html')) name = name.replace('.html', '');
                    if (name === '/') name = 'Home';
                    if (name.length > 20) name = name.substring(0, 20) + '...';
                    return name;
                }),
                datasets: [{
                    label: 'Page Views',
                    data: sortedPages.map(p => p.requests),
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderRadius: 8
                }]
            }, {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            });
            
            // Table
            this.displayPagesTable(this.cloudflarePages);
            
        } catch (error) {
            console.error('❌ Cloudflare pages error:', error);
        }
    }

    displayPagesTable(pages) {
        const tbody = document.getElementById('cf-pages-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const sortedPages = pages
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 20);
        
        sortedPages.forEach((page, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${page.path}</td>
                <td>${page.requests.toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });
        
        if (sortedPages.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No page data available</td></tr>';
        }
    }

    // 👥 CLOUDFLARE VISITORS
    async loadCloudflareVisitors() {
        try {
            console.log('👥 Loading Cloudflare Visitors...');
            
            const response = await fetch(`${WORKER_URL}/cloudflare-visitors?days=30`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                console.warn('⚠ Cloudflare visitors unavailable');
                return;
            }
            
            const result = await response.json();
            
            if (!result.success || !result.visitors) {
                console.warn('⚠ No visitor data');
                return;
            }
            
            this.cloudflareVisitors = result.visitors;
            
            console.log('✅ Visitor data loaded:', this.cloudflareVisitors.length, 'visitors');
            
            // Stats
            this.updateStat('cf-total-visitors', this.cloudflareVisitors.length);
            this.updateStat('cf-total-visitor-requests', result.stats?.totalRequests?.toLocaleString() || '0');
            
            const avgRequestsPerVisitor = this.cloudflareVisitors.length > 0
                ? (result.stats?.totalRequests / this.cloudflareVisitors.length).toFixed(1)
                : 0;
            this.updateStat('cf-avg-requests-per-visitor', avgRequestsPerVisitor);
            
            // Table
            this.displayCloudflareVisitorsTable(this.cloudflareVisitors);
            
        } catch (error) {
            console.error('❌ Cloudflare visitors error:', error);
        }
    }

    displayCloudflareVisitorsTable(visitors) {
        const tbody = document.getElementById('cf-visitors-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const topVisitors = visitors
            .sort((a, b) => b.requests - a.requests)
            .slice(0, 50);
        
        topVisitors.forEach((visitor, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${visitor.ip}</td>
                <td>${visitor.country}</td>
                <td>${visitor.requests}</td>
                <td>${visitor.city || 'Unknown'}</td>
            `;
            tbody.appendChild(row);
        });
        
        if (topVisitors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No visitor data available</td></tr>';
        }
    }

    // ========================================
    // SECTION 2: INTERNAL ANALYTICS (FIREBASE)
    // ========================================
    
    async loadUsersStats() {
        try {
            console.log('👥 Loading users stats...');
            
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
            let emailVerifiedUsers = 0;
            
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
                
                if (data.emailVerified) {
                    emailVerifiedUsers++;
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
            this.updateStat('email-verified-users', emailVerifiedUsers);
            
            const activeRate = totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;
            this.updateStat('active-rate', `${activeRate}%`);
            
            console.log('✅ Users stats loaded:', totalUsers, 'total users');
            
        } catch (error) {
            console.error('❌ Error loading users stats:', error);
        }
    }

    async loadVisitsStats() {
        try {
            console.log('📊 Loading visits stats...');
            
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
            let authenticatedVisits = 0;
            
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
                        authenticatedVisits++;
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
            this.updateStat('authenticated-visits', authenticatedVisits.toLocaleString());
            
            const avgVisitsPerDay = weekVisits / 7;
            this.updateStat('avg-visits-per-day', avgVisitsPerDay.toFixed(1));
            
            console.log('✅ Visits stats loaded:', totalVisits, 'total visits');
            
        } catch (error) {
            console.error('❌ Error loading visits stats:', error);
        }
    }

    async loadRevenueStats() {
        try {
            console.log('💰 Loading revenue stats...');
            
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
            
            // ARPU (Average Revenue Per User)
            const totalCustomers = this.allUsersData.length || 1;
            const arpu = totalRevenue / totalCustomers;
            this.updateStat('arpu', `$${arpu.toFixed(2)}`);
            
            this.currentMRR = mrr;
            
            console.log('✅ Revenue stats loaded: $', totalRevenue);
            
        } catch (error) {
            console.error('❌ Error loading revenue stats:', error);
        }
    }

    async loadEngagementStats() {
        try {
            console.log('⚡ Loading engagement stats...');
            
            const activitySnapshot = await this.db.collection('analytics_activity').get();
            
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            let weekActivity = 0;
            let userActions = {};
            const actionTypes = {};
            
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
                    
                    if (data.action) {
                        actionTypes[data.action] = (actionTypes[data.action] || 0) + 1;
                    }
                }
            });
            
            const avgActionsPerUser = Object.keys(userActions).length > 0
                ? (weekActivity / Object.keys(userActions).length).toFixed(1)
                : 0;
            
            this.updateStat('week-activity', weekActivity.toLocaleString());
            this.updateStat('avg-actions', avgActionsPerUser);
            this.updateStat('total-activity', this.allActivityData.length.toLocaleString());
            
            // Most popular action
            const topAction = Object.entries(actionTypes)
                .sort((a, b) => b[1] - a[1])[0];
            this.updateStat('top-action', topAction ? topAction[0] : 'N/A');
            
            console.log('✅ Engagement stats loaded:', weekActivity, 'activities this week');
            
        } catch (error) {
            console.error('❌ Error loading engagement stats:', error);
        }
    }

    // 🆕 SESSION ANALYTICS
    async loadSessionAnalytics() {
        try {
            console.log('📊 Loading session analytics...');
            
            // Group visits by session
            const sessions = {};
            
            this.allVisitsData.forEach(visit => {
                const sessionId = visit.sessionId || visit.userId || `anon-${visit.ip || Math.random()}`;
                
                if (!sessions[sessionId]) {
                    sessions[sessionId] = {
                        id: sessionId,
                        userId: visit.userId,
                        pages: [],
                        startTime: null,
                        endTime: null,
                        duration: 0,
                        deviceType: this.detectDevice(visit.userAgent),
                        country: visit.country
                    };
                }
                
                sessions[sessionId].pages.push({
                    page: visit.page,
                    timestamp: visit.timestamp ? visit.timestamp.toDate() : null
                });
                
                if (visit.timestamp) {
                    const time = visit.timestamp.toDate();
                    if (!sessions[sessionId].startTime || time < sessions[sessionId].startTime) {
                        sessions[sessionId].startTime = time;
                    }
                    if (!sessions[sessionId].endTime || time > sessions[sessionId].endTime) {
                        sessions[sessionId].endTime = time;
                    }
                }
            });
            
            // Calculate durations
            Object.values(sessions).forEach(session => {
                if (session.startTime && session.endTime) {
                    session.duration = (session.endTime - session.startTime) / 1000; // seconds
                }
            });
            
            this.sessionData = Object.values(sessions);
            
            // Stats
            const totalSessions = this.sessionData.length;
            const avgDuration = this.sessionData.reduce((sum, s) => sum + s.duration, 0) / totalSessions;
            const avgPagesPerSession = this.sessionData.reduce((sum, s) => sum + s.pages.length, 0) / totalSessions;
            
            // Filter valid sessions (duration > 0)
            const validSessions = this.sessionData.filter(s => s.duration > 0);
            const avgValidDuration = validSessions.length > 0
                ? validSessions.reduce((sum, s) => sum + s.duration, 0) / validSessions.length
                : 0;
            
            this.updateStat('total-sessions', totalSessions.toLocaleString());
            this.updateStat('avg-session-duration', `${(avgValidDuration / 60).toFixed(1)} min`);
            this.updateStat('avg-pages-per-session', avgPagesPerSession.toFixed(1));
            
            // Longest session
            const longestSession = this.sessionData.reduce((max, s) => s.duration > max.duration ? s : max, { duration: 0 });
            this.updateStat('longest-session', `${(longestSession.duration / 60).toFixed(1)} min`);
            
            console.log('✅ Session analytics loaded:', totalSessions, 'sessions');
            
        } catch (error) {
            console.error('❌ Session analytics error:', error);
        }
    }

    // 🆕 BOUNCE RATE ANALYTICS
    async loadBounceRateAnalytics() {
        try {
            console.log('📊 Loading bounce rate analytics...');
            
            const pageVisits = {};
            const pageBounces = {};
            
            this.sessionData.forEach(session => {
                const firstPage = session.pages[0]?.page;
                
                if (firstPage) {
                    pageVisits[firstPage] = (pageVisits[firstPage] || 0) + 1;
                    
                    if (session.pages.length === 1) {
                        pageBounces[firstPage] = (pageBounces[firstPage] || 0) + 1;
                    }
                }
            });
            
            this.bounceRateData = {};
            
            Object.keys(pageVisits).forEach(page => {
                const bounces = pageBounces[page] || 0;
                const visits = pageVisits[page];
                this.bounceRateData[page] = {
                    visits: visits,
                    bounces: bounces,
                    bounceRate: ((bounces / visits) * 100).toFixed(1)
                };
            });
            
            // Overall bounce rate
            const totalVisits = Object.values(pageVisits).reduce((a, b) => a + b, 0);
            const totalBounces = Object.values(pageBounces).reduce((a, b) => a + b, 0);
            const overallBounceRate = totalVisits > 0 ? ((totalBounces / totalVisits) * 100).toFixed(1) : 0;
            
            this.updateStat('overall-bounce-rate', `${overallBounceRate}%`);
            
            // Best and worst pages
            const sortedByBounce = Object.entries(this.bounceRateData)
                .sort((a, b) => parseFloat(a[1].bounceRate) - parseFloat(b[1].bounceRate));
            
            const bestPage = sortedByBounce[0];
            const worstPage = sortedByBounce[sortedByBounce.length - 1];
            
            this.updateStat('best-bounce-page', bestPage ? bestPage[0] : 'N/A');
            this.updateStat('best-bounce-rate', bestPage ? `${bestPage[1].bounceRate}%` : 'N/A');
            this.updateStat('worst-bounce-page', worstPage ? worstPage[0] : 'N/A');
            this.updateStat('worst-bounce-rate', worstPage ? `${worstPage[1].bounceRate}%` : 'N/A');
            
            // Chart
            const sortedPages = Object.entries(this.bounceRateData)
                .sort((a, b) => b[1].visits - a[1].visits)
                .slice(0, 10);
            
            this.createChart('bounce-rate-chart', 'bar', {
                labels: sortedPages.map(([page]) => {
                    let name = page;
                    if (name.includes('.html')) name = name.replace('.html', '');
                    if (name.length > 20) name = name.substring(0, 20) + '...';
                    return name;
                }),
                datasets: [{
                    label: 'Bounce Rate (%)',
                    data: sortedPages.map(([, data]) => parseFloat(data.bounceRate)),
                    backgroundColor: 'rgba(239, 68, 68, 0.8)',
                    borderRadius: 8
                }]
            }, {
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            });
            
            console.log('✅ Bounce rate analytics loaded');
            
        } catch (error) {
            console.error('❌ Bounce rate analytics error:', error);
        }
    }

    // 🆕 CONVERSION PATHS
    async loadConversionPaths() {
        try {
            console.log('📊 Loading conversion paths...');
            
            const paths = {};
            
            this.sessionData.forEach(session => {
                if (session.userId && session.pages.length > 0) {
                    const path = session.pages.map(p => p.page).join(' → ');
                    paths[path] = (paths[path] || 0) + 1;
                }
            });
            
            this.conversionPaths = Object.entries(paths)
                .map(([path, count]) => ({ path, count }))
                .sort((a, b) => b.count - a.count);
            
            // Stats
            const uniquePaths = this.conversionPaths.length;
            const mostCommonPath = this.conversionPaths[0];
            
            this.updateStat('unique-conversion-paths', uniquePaths);
            this.updateStat('most-common-path', mostCommonPath ? mostCommonPath.path : 'N/A');
            this.updateStat('most-common-path-count', mostCommonPath ? mostCommonPath.count : 0);
            
            // Display top paths
            this.displayConversionPaths(this.conversionPaths.slice(0, 10));
            
            console.log('✅ Conversion paths loaded:', this.conversionPaths.length, 'unique paths');
            
        } catch (error) {
            console.error('❌ Conversion paths error:', error);
        }
    }

    displayConversionPaths(paths) {
        const tbody = document.getElementById('conversion-paths-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        paths.forEach((path, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${path.path}</td>
                <td>${path.count}</td>
            `;
            tbody.appendChild(row);
        });
        
        if (paths.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No conversion paths available</td></tr>';
        }
    }

    // 🆕 HEATMAP DATA
    async loadHeatmapData() {
        try {
            console.log('🔥 Loading heatmap data...');
            
            const pageClicks = {};
            
            this.allActivityData.forEach(activity => {
                if (activity.action === 'click' && activity.page) {
                    const page = activity.page;
                    if (!pageClicks[page]) {
                        pageClicks[page] = 0;
                    }
                    pageClicks[page]++;
                }
            });
            
            this.heatmapData = pageClicks;
            
            // Most clicked page
            const sortedPages = Object.entries(pageClicks)
                .sort((a, b) => b[1] - a[1]);
            
            const mostClicked = sortedPages[0];
            
            this.updateStat('most-clicked-page', mostClicked ? mostClicked[0] : 'N/A');
            this.updateStat('most-clicked-count', mostClicked ? mostClicked[1] : 0);
            
            console.log('✅ Heatmap data loaded');
            
        } catch (error) {
            console.error('❌ Heatmap data error:', error);
        }
    }

    detectDevice(userAgent) {
        const ua = (userAgent || '').toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) return 'Mobile';
        if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
        return 'Desktop';
    }

    // ========================================
    // CHARTS
    // ========================================
    
    async loadRegistrationsChart() {
        try {
            console.log('📈 Loading registrations chart...');
            
            const daysCounts = {};
            const today = new Date();
            
            for (let i = 89; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const key = date.toISOString().split('T')[0];
                daysCounts[key] = 0;
            }
            
            this.allUsersData.forEach(user => {
                if (user.createdAt) {
                    const dateKey = user.createdAt.toDate().toISOString().split('T')[0];
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
                    label: 'Daily Registrations',
                    data: data,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3
                }]
            }, {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading registrations chart:', error);
        }
    }

    async loadPlansChart() {
        try {
            console.log('📈 Loading plans chart...');
            
            const planCounts = { basic: 0, pro: 0, platinum: 0 };
            
            this.allUsersData.forEach(user => {
                const plan = user.plan || 'basic';
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
            }, {
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading plans chart:', error);
        }
    }

    async loadVisitsChart() {
        try {
            console.log('📈 Loading visits chart...');
            
            const daysCounts = {};
            const today = new Date();
            
            for (let i = 89; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const key = date.toISOString().split('T')[0];
                daysCounts[key] = 0;
            }
            
            this.allVisitsData.forEach(visit => {
                if (visit.timestamp) {
                    const dateKey = visit.timestamp.toDate().toISOString().split('T')[0];
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
                    label: 'Daily Visits',
                    data: data,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderRadius: 8
                }]
            }, {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading visits chart:', error);
        }
    }

    async loadRevenueChart() {
        try {
            console.log('📈 Loading revenue chart...');
            
            const monthsRevenue = {};
            
            for (let i = 11; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthsRevenue[key] = 0;
            }
            
            this.allPaymentsData.forEach(payment => {
                if (payment.createdAt) {
                    const date = payment.createdAt.toDate();
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (monthsRevenue.hasOwnProperty(key)) {
                        monthsRevenue[key] += parseFloat(payment.amount) || 0;
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
                    label: 'Monthly Revenue ($)',
                    data: data,
                    backgroundColor: 'rgba(67, 233, 123, 0.8)',
                    borderRadius: 8
                }]
            }, {
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
            });
            
        } catch (error) {
            console.error('❌ Error loading revenue chart:', error);
        }
    }

    async loadChurnChart() {
        try {
            console.log('📈 Loading churn chart...');
            
            const monthlyData = {};
            
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthlyData[key] = { new: 0, churned: 0 };
            }
            
            this.allUsersData.forEach(user => {
                if (user.createdAt) {
                    const date = user.createdAt.toDate();
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (monthlyData[key]) monthlyData[key].new++;
                }
                
                if (user.canceledAt) {
                    const date = user.canceledAt.toDate();
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (monthlyData[key]) monthlyData[key].churned++;
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
                        label: 'New Users',
                        data: Object.values(monthlyData).map(d => d.new),
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 3
                    },
                    {
                        label: 'Churned Users',
                        data: Object.values(monthlyData).map(d => d.churned),
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true,
                        borderWidth: 3
                    }
                ]
            });
            
        } catch (error) {
            console.error('❌ Error loading churn chart:', error);
        }
    }

    async loadCohortChart() {
        try {
            console.log('📈 Loading cohort chart...');
            
            const cohorts = {};
            
            this.allUsersData.forEach(user => {
                if (user.createdAt) {
                    const cohortMonth = user.createdAt.toDate().toISOString().slice(0, 7);
                    
                    if (!cohorts[cohortMonth]) {
                        cohorts[cohortMonth] = { total: 0, active: 0, premium: 0 };
                    }
                    
                    cohorts[cohortMonth].total++;
                    
                    if (user.plan && user.plan !== 'basic' && user.plan !== 'free') {
                        cohorts[cohortMonth].premium++;
                    }
                    
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    
                    if (user.lastLogin && user.lastLogin.toDate() > weekAgo) {
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
                        label: 'Total Users',
                        data: sortedCohorts.map(key => cohorts[key].total),
                        backgroundColor: 'rgba(99, 102, 241, 0.6)'
                    },
                    {
                        label: 'Active Users',
                        data: sortedCohorts.map(key => cohorts[key].active),
                        backgroundColor: 'rgba(16, 185, 129, 0.6)'
                    },
                    {
                        label: 'Premium Users',
                        data: sortedCohorts.map(key => cohorts[key].premium),
                        backgroundColor: 'rgba(139, 92, 246, 0.6)'
                    }
                ]
            }, {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            });
            
        } catch (error) {
            console.error('❌ Error loading cohort chart:', error);
        }
    }

    // ========================================
    // TABLES
    // ========================================
    
    async loadRecentUsers() {
        try {
            console.log('📋 Loading recent users...');
            
            const tbody = document.getElementById('recent-users-body');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            const sortedUsers = this.allUsersData
                .filter(u => u.createdAt)
                .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate())
                .slice(0, 10);
            
            sortedUsers.forEach(user => {
                const row = document.createElement('tr');
                
                const createdAt = user.createdAt.toDate().toLocaleDateString('en-US');
                const plan = user.plan || 'basic';
                
                row.innerHTML = `
                    <td>${user.email || 'N/A'}</td>
                    <td><span class="plan-badge plan-${plan}">${plan}</span></td>
                    <td>${createdAt}</td>
                    <td>${user.subscriptionStatus || 'inactive'}</td>
                `;
                
                tbody.appendChild(row);
            });
            
            if (sortedUsers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No users available</td></tr>';
            }
            
        } catch (error) {
            console.error('❌ Error loading recent users:', error);
        }
    }

    async loadRecentActivity() {
        try {
            console.log('📋 Loading recent activity...');
            
            const tbody = document.getElementById('recent-activity-body');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            const activities = this.allActivityData
                .filter(a => a.timestamp)
                .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate())
                .slice(0, 20);
            
            if (activities.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No recent activity</td></tr>';
                return;
            }
            
            activities.forEach(activity => {
                const row = document.createElement('tr');
                
                const timestamp = activity.timestamp.toDate().toLocaleString('en-US');
                
                row.innerHTML = `
                    <td>${activity.userId ? activity.userId.substring(0, 8) + '...' : 'Anonymous'}</td>
                    <td>${activity.action || 'N/A'}</td>
                    <td>${activity.page || 'N/A'}</td>
                    <td>${timestamp}</td>
                `;
                
                tbody.appendChild(row);
            });
            
        } catch (error) {
            console.error('❌ Error loading recent activity:', error);
        }
    }

    async loadTopUsers() {
        try {
            console.log('📋 Loading top users...');
            
            const usersData = [];
            
            for (const user of this.allUsersData) {
                const simulationsSnapshot = await this.db
                    .collection('users')
                    .doc(user.id)
                    .collection('simulations')
                    .get();
                
                usersData.push({
                    email: user.email,
                    plan: user.plan || 'basic',
                    simulations: simulationsSnapshot.size
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
            
            if (usersData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No users available</td></tr>';
            }
            
        } catch (error) {
            console.error('❌ Error loading top users:', error);
        }
    }

    async loadUserSimulations() {
        try {
            console.log('📋 Loading user simulations...');
            
            let totalSimulations = 0;
            
            for (const user of this.allUsersData) {
                const simsSnapshot = await this.db
                    .collection('users')
                    .doc(user.id)
                    .collection('simulations')
                    .get();
                
                totalSimulations += simsSnapshot.size;
            }
            
            const avgSimulations = this.allUsersData.length > 0
                ? (totalSimulations / this.allUsersData.length).toFixed(1)
                : 0;
            
            this.updateStat('total-simulations', totalSimulations.toLocaleString());
            this.updateStat('avg-simulations', avgSimulations);
            
        } catch (error) {
            console.error('❌ Error loading simulations:', error);
        }
    }

    async loadConversionFunnel() {
        try {
            console.log('📋 Loading conversion funnel...');
            
            let registered = this.allUsersData.length;
            let emailVerified = 0;
            let firstLogin = 0;
            let trialStarted = 0;
            let converted = this.allPaymentsData.length;
            
            this.allUsersData.forEach(user => {
                if (user.emailVerified) emailVerified++;
                if (user.lastLogin) firstLogin++;
                if (user.trialEnds) trialStarted++;
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
                    <td>${registered > 0 ? ((emailVerified / registered) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                    <td>First Login</td>
                    <td>${firstLogin}</td>
                    <td>${registered > 0 ? ((firstLogin / registered) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr>
                    <td>Trial Started</td>
                    <td>${trialStarted}</td>
                    <td>${registered > 0 ? ((trialStarted / registered) * 100).toFixed(1) : 0}%</td>
                </tr>
                <tr class="conversion-row">
                    <td><strong>Paid Conversion</strong></td>
                    <td><strong>${converted}</strong></td>
                    <td><strong>${registered > 0 ? ((converted / registered) * 100).toFixed(1) : 0}%</strong></td>
                </tr>
            `;
            
        } catch (error) {
            console.error('❌ Error loading funnel:', error);
        }
    }

    async loadLTVAnalysis() {
        try {
            console.log('📋 Loading LTV analysis...');
            
            const userPayments = {};
            
            this.allPaymentsData.forEach(payment => {
                const userId = payment.userId || 'unknown';
                const amount = parseFloat(payment.amount) || 0;
                userPayments[userId] = (userPayments[userId] || 0) + amount;
            });
            
            const ltvValues = Object.values(userPayments);
            const avgLTV = ltvValues.length > 0
                ? (ltvValues.reduce((a, b) => a + b, 0) / ltvValues.length).toFixed(2)
                : 0;
            
            const maxLTV = ltvValues.length > 0 ? Math.max(...ltvValues).toFixed(2) : 0;
            const minLTV = ltvValues.length > 0 ? Math.min(...ltvValues).toFixed(2) : 0;
            
            this.updateStat('avg-ltv', `$${avgLTV}`);
            this.updateStat('max-ltv', `$${maxLTV}`);
            this.updateStat('min-ltv', `$${minLTV}`);
            
        } catch (error) {
            console.error('❌ Error loading LTV:', error);
        }
    }

    // ========================================
    // NON-CUSTOMER VISITORS
    // ========================================
    
    async loadNonCustomerVisitors() {
        try {
            console.log('👥 Loading non-customer visitors...');
            
            const customerIds = new Set();
            this.allUsersData.forEach(user => customerIds.add(user.id));
            
            const anonymousVisitors = {};
            let totalAnonymousVisits = 0;
            
            this.allVisitsData.forEach(visit => {
                const isNonCustomer = !visit.userId || !customerIds.has(visit.userId);
                
                if (isNonCustomer) {
                    totalAnonymousVisits++;
                    
                    const visitorId = visit.sessionId || visit.ip || `anon-${Math.random()}`;
                    
                    if (!anonymousVisitors[visitorId]) {
                        anonymousVisitors[visitorId] = {
                            id: visitorId,
                            ip: visit.ip || 'N/A',
                            country: visit.country || 'Unknown',
                            firstVisit: visit.timestamp ? visit.timestamp.toDate() : null,
                            lastVisit: visit.timestamp ? visit.timestamp.toDate() : null,
                            visits: 0,
                            pages: [],
                            devices: new Set(),
                            sources: new Set()
                        };
                    }
                    
                    const visitor = anonymousVisitors[visitorId];
                    visitor.visits++;
                    
                    if (visit.page) visitor.pages.push(visit.page);
                    if (visit.userAgent) visitor.devices.add(this.detectDevice(visit.userAgent));
                    if (visit.referrer) visitor.sources.add(visit.referrer);
                    
                    if (visit.timestamp) {
                        const visitDate = visit.timestamp.toDate();
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
            
            console.log(`✅ ${this.nonCustomerVisitors.length} non-customer visitors detected`);
            
            this.updateStat('total-non-customers', this.nonCustomerVisitors.length);
            this.updateStat('total-anonymous-visits', totalAnonymousVisits);
            
            // Conversion rate (non-customers who became customers)
            const conversionRate = this.allUsersData.length > 0
                ? ((this.allUsersData.length / (this.allUsersData.length + this.nonCustomerVisitors.length)) * 100).toFixed(1)
                : 0;
            this.updateStat('visitor-to-customer-rate', `${conversionRate}%`);
            
            this.displayNonCustomerVisitors();
            this.createNonCustomerCharts();
            
        } catch (error) {
            console.error('❌ Error loading non-customer visitors:', error);
        }
    }

    displayNonCustomerVisitors() {
        const tbody = document.getElementById('non-customer-visitors-body');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        const sortedVisitors = this.nonCustomerVisitors
            .sort((a, b) => b.visits - a.visits)
            .slice(0, 50);
        
        sortedVisitors.forEach((visitor, index) => {
            const row = document.createElement('tr');
            
            const lastVisit = visitor.lastVisit ? visitor.lastVisit.toLocaleDateString('en-US') : 'N/A';
            const pagesVisited = visitor.pages ? new Set(visitor.pages).size : 0;
            const devices = visitor.devices ? visitor.devices.join(', ') : 'N/A';
            
            row.innerHTML = `
                <td>${index + 1}</td>
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
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No non-customer visitors</td></tr>';
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
                label: 'Non-customer Visitors',
                data: sortedCountries.map(c => c[1]),
                backgroundColor: 'rgba(249, 115, 22, 0.8)',
                borderRadius: 8
            }]
        }, {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true
                }
            }
        });
    }

    // ========================================
    // POTENTIAL CUSTOMERS
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
                const deviceCount = visitor.devices ? visitor.devices.length : 0;
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
            
            const avgScore = this.potentialCustomers.length > 0
                ? (this.potentialCustomers.reduce((sum, c) => sum + c.score, 0) / this.potentialCustomers.length).toFixed(1)
                : 0;
            this.updateStat('avg-lead-score', avgScore);
            
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
                <td>${lead.strategicPages}</td>
                <td style="font-weight: bold; color: ${scoreColor};">${lead.score}</td>
                <td>${lead.category}</td>
                <td>${lastVisit}</td>
            `;
            
            tbody.appendChild(row);
        });
        
        if (topLeads.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No potential customers detected</td></tr>';
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
                label: 'Lead Score Distribution',
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
        }, {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        });
    }

    // ========================================
    // ML PREDICTIONS
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
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let inactiveUsers = 0;
        let totalPremiumUsers = 0;
        
        this.allUsersData.forEach(user => {
            if (user.plan && user.plan !== 'basic' && user.plan !== 'free') {
                totalPremiumUsers++;
                
                if (!user.lastLogin || user.lastLogin.toDate() < thirtyDaysAgo) {
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
        const userPayments = {};
        let totalRevenue = 0;
        let totalUsers = 0;
        
        this.allPaymentsData.forEach(payment => {
            const userId = payment.userId || 'unknown';
            const amount = parseFloat(payment.amount) || 0;
            
            if (!userPayments[userId]) {
                userPayments[userId] = 0;
                totalUsers++;
            }
            
            userPayments[userId] += amount;
            totalRevenue += amount;
        });
        
        const currentLTV = totalUsers > 0 ? totalRevenue / totalUsers : 0;
        const projectedLTV = currentLTV * 1.15; // 15% growth projection
        
        return projectedLTV;
    }

    async predictMRR() {
        const monthlyRevenue = {};
        
        this.allPaymentsData.forEach(payment => {
            if (payment.createdAt) {
                const monthKey = payment.createdAt.toDate().toISOString().slice(0, 7);
                monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (parseFloat(payment.amount) || 0);
            }
        });
        
        const months = Object.keys(monthlyRevenue).sort();
        const revenues = months.map(m => monthlyRevenue[m]);
        
        if (revenues.length < 2) {
            return this.currentMRR || 0;
        }
        
        // Linear regression
        const n = revenues.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = revenues.reduce((a, b) => a + b, 0);
        const sumXY = revenues.reduce((sum, y, x) => sum + x * y, 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        const futureMonth = n + 3; // 3 months ahead
        const predictedMRR = slope * futureMonth + intercept;
        
        return Math.max(predictedMRR, 0);
    }

    // ========================================
    // ALERTS
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
                console.log('✅ No alerts - all metrics are healthy');
            }
            
        } catch (error) {
            console.error('❌ Error checking alerts:', error);
        }
    }

    async checkMRRDrop() {
        if (!this.allPaymentsData || this.allPaymentsData.length === 0) return null;
        
        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
        const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
        
        let currentMRR = 0;
        let lastMonthMRR = 0;
        
        const planPrices = { basic: 0, pro: 29.99, platinum: 99.99 };
        
        this.allPaymentsData.forEach(payment => {
            const price = planPrices[payment.plan] || 0;
            
            if (payment.createdAt) {
                const month = payment.createdAt.toDate().toISOString().slice(0, 7);
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
                    message: `MRR dropped by ${dropPercent.toFixed(1)}% (from $${lastMonthMRR.toFixed(0)} to $${currentMRR.toFixed(0)})`,
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
                message: `High churn rate detected: ${churnPrediction.risk.toFixed(1)}% (${churnPrediction.value} inactive users)`,
                data: {
                    churnRate: churnPrediction.risk.toFixed(1),
                    affectedUsers: churnPrediction.value
                }
            };
        }
        
        return null;
    }

    async checkLowActiveUsers() {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        let activeUsers = 0;
        
        this.allUsersData.forEach(user => {
            if (user.lastLogin && user.lastLogin.toDate() > weekAgo) {
                activeUsers++;
            }
        });
        
        if (activeUsers < this.alertThresholds.lowActiveUsers) {
            return {
                type: 'LOW_ACTIVE_USERS',
                severity: 'medium',
                message: `Only ${activeUsers} active users this week (threshold: ${this.alertThresholds.lowActiveUsers})`,
                data: {
                    activeUsers: activeUsers,
                    threshold: this.alertThresholds.lowActiveUsers
                }
            };
        }
        
        return null;
    }

    async checkConversionDrop() {
        const totalUsers = this.allUsersData.length;
        const premiumUsers = this.allPaymentsData.length;
        
        const currentConversion = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;
        
        const lastConversion = parseFloat(localStorage.getItem('lastConversionRate') || currentConversion);
        
        const drop = lastConversion - currentConversion;
        
        localStorage.setItem('lastConversionRate', currentConversion.toString());
        
        if (drop > this.alertThresholds.conversionDrop) {
            return {
                type: 'CONVERSION_DROP',
                severity: 'high',
                message: `Conversion rate dropped by ${drop.toFixed(1)}% (from ${lastConversion.toFixed(1)}% to ${currentConversion.toFixed(1)}%)`,
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
    // CSV EXPORT
    // ========================================
    
    async exportAllData() {
        console.log('📥 Exporting all data to CSV...');
        
        await Promise.all([
            this.exportData('users'),
            this.exportData('visits'),
            this.exportData('payments'),
            this.exportData('activity'),
            this.exportData('non-customers'),
            this.exportData('potential-customers'),
            this.exportData('sessions'),
            this.exportData('conversion-paths')
        ]);
        
        alert('✅ All data has been exported to CSV files!');
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
                    headers = ['ID', 'Email', 'Plan', 'Subscription Status', 'Created At', 'Last Login', 'Email Verified'];
                    data = data.map(u => [
                        u.id,
                        u.email,
                        u.plan || 'basic',
                        u.subscriptionStatus || 'inactive',
                        u.createdAt ? u.createdAt.toDate().toISOString() : 'N/A',
                        u.lastLogin ? u.lastLogin.toDate().toISOString() : 'N/A',
                        u.emailVerified ? 'Yes' : 'No'
                    ]);
                    break;
                
                case 'visits':
                    data = this.allVisitsData;
                    filename = 'visits';
                    headers = ['ID', 'User ID', 'Page', 'URL', 'Timestamp', 'Country', 'Device', 'User Agent'];
                    data = data.map(v => [
                        v.id,
                        v.userId || 'Anonymous',
                        v.page || 'N/A',
                        v.url || 'N/A',
                        v.timestamp ? v.timestamp.toDate().toISOString() : 'N/A',
                        v.country || 'Unknown',
                        this.detectDevice(v.userAgent),
                        v.userAgent || 'N/A'
                    ]);
                    break;
                
                case 'payments':
                case 'revenue':
                    data = this.allPaymentsData;
                    filename = 'payments';
                    headers = ['ID', 'User ID', 'Plan', 'Amount', 'Status', 'Created At', 'Invoice Number'];
                    data = data.map(p => [
                        p.id,
                        p.userId || 'N/A',
                        p.plan || 'N/A',
                        p.amount || 0,
                        p.status || 'N/A',
                        p.createdAt ? p.createdAt.toDate().toISOString() : 'N/A',
                        p.invoiceNumber || 'N/A'
                    ]);
                    break;
                
                case 'activity':
                    data = this.allActivityData;
                    filename = 'activity';
                    headers = ['ID', 'User ID', 'Action', 'Page', 'Timestamp', 'Details'];
                    data = data.map(a => [
                        a.id,
                        a.userId || 'Anonymous',
                        a.action || 'N/A',
                        a.page || 'N/A',
                        a.timestamp ? a.timestamp.toDate().toISOString() : 'N/A',
                        a.details || 'N/A'
                    ]);
                    break;
                
                case 'non-customers':
                    data = this.nonCustomerVisitors;
                    filename = 'non_customer_visitors';
                    headers = ['ID', 'IP', 'Country', 'Visits', 'Unique Pages', 'Devices', 'First Visit', 'Last Visit'];
                    data = data.map(v => [
                        v.id,
                        v.ip,
                        v.country,
                        v.visits,
                        v.pages ? new Set(v.pages).size : 0,
                        v.devices ? v.devices.join('; ') : '',
                        v.firstVisit ? v.firstVisit.toISOString() : 'N/A',
                        v.lastVisit ? v.lastVisit.toISOString() : 'N/A'
                    ]);
                    break;
                
                case 'potential-customers':
                    data = this.potentialCustomers;
                    filename = 'potential_customers';
                    headers = ['IP', 'Country', 'Visits', 'Unique Pages', 'Strategic Pages', 'Score', 'Category', 'Last Visit'];
                    data = data.map(c => [
                        c.ip,
                        c.country,
                        c.visits,
                        c.uniquePages,
                        c.strategicPages,
                        c.score,
                        c.category,
                        c.lastVisit ? c.lastVisit.toISOString() : 'N/A'
                    ]);
                    break;
                
                case 'sessions':
                    data = this.sessionData;
                    filename = 'sessions';
                    headers = ['Session ID', 'User ID', 'Pages Count', 'Duration (seconds)', 'Device', 'Country', 'Start Time', 'End Time'];
                    data = data.map(s => [
                        s.id,
                        s.userId || 'Anonymous',
                        s.pages.length,
                        s.duration,
                        s.deviceType,
                        s.country,
                        s.startTime ? s.startTime.toISOString() : 'N/A',
                        s.endTime ? s.endTime.toISOString() : 'N/A'
                    ]);
                    break;
                
                case 'conversion-paths':
                    data = this.conversionPaths;
                    filename = 'conversion_paths';
                    headers = ['Path', 'Count'];
                    data = data.map(p => [
                        p.path,
                        p.count
                    ]);
                    break;
                
                case 'cloudflare':
                    if (!this.cloudflareData || !this.cloudflareData.overview) {
                        console.warn('No Cloudflare data to export');
                        return;
                    }
                    filename = 'cloudflare_analytics';
                    headers = ['Metric', 'Value'];
                    const overview = this.cloudflareData.overview;
                    data = [
                        ['Total Requests', overview.totalRequests],
                        ['Total Bytes', overview.totalBytes],
                        ['Cached Requests', overview.totalCachedRequests],
                        ['Cache Hit Rate', overview.cacheHitRate + '%'],
                        ['Total Pageviews', overview.totalPageViews],
                        ['Total Uniques', overview.totalUniques],
                        ['Total Threats', overview.totalThreats]
                    ];
                    break;
                
                case 'stripe':
                    if (!this.stripeData) {
                        console.warn('No Stripe data to export');
                        return;
                    }
                    filename = 'stripe_analytics';
                    headers = ['Metric', 'Value'];
                    data = [
                        ['Total Customers', this.stripeData.customers?.total || 0],
                        ['Customers with Subscription', this.stripeData.customers?.withSubscription || 0],
                        ['Active Subscriptions', this.stripeData.subscriptions?.active || 0],
                        ['Trialing Subscriptions', this.stripeData.subscriptions?.trialing || 0],
                        ['Canceled Subscriptions', this.stripeData.subscriptions?.canceled || 0],
                        ['MRR (cents)', this.stripeData.revenue?.mrr || 0],
                        ['ARR (cents)', this.stripeData.revenue?.arr || 0],
                        ['Total Revenue (cents)', this.stripeData.revenue?.total || 0]
                    ];
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
            
            console.log(`✅ Export ${type} successful (${data.length} rows)`);
            
        } catch (error) {
            console.error(`❌ Error exporting ${type}:`, error);
        }
    }

    arrayToCSV(data, headers) {
        let csv = headers.join(',') + '\n';
        
        data.forEach(row => {
            csv += row.map(cell => {
                const cellStr = String(cell || '');
                // Escape quotes and wrap in quotes if necessary
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
            // IE 10+
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
    // HELPER FUNCTIONS
    // ========================================
    
    updateStat(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        } else {
            console.warn(`⚠ Element not found: ${elementId}`);
        }
    }

    createChart(canvasId, type, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`⚠ Canvas not found: ${canvasId}`);
            return;
        }
        
        const ctx = canvas.getContext('2d');
        
        // Destroy existing chart
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }
        
        // Create new chart
        this.charts[canvasId] = new Chart(ctx, {
            type: type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: type === 'doughnut' || type === 'pie',
                        position: 'bottom'
                    },
                    tooltip: {
                        enabled: true
                    }
                },
                ...options
            }
        });
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Admin Analytics PRO v4.0...');
    console.log('📊 Initializing comprehensive analytics dashboard...');
    
    // Expose globally for export buttons and debugging
    window.adminAnalytics = new AdminAnalyticsPro();
    
    console.log('✅ Admin Analytics instance created and attached to window.adminAnalytics');
});

// ========================================
// GLOBAL EXPORT HELPER (for HTML buttons)
// ========================================

function exportAnalyticsData(type) {
    if (window.adminAnalytics) {
        window.adminAnalytics.exportData(type);
    } else {
        console.error('❌ Admin Analytics not initialized');
        alert('Analytics system not ready. Please wait...');
    }
}