// ========================================
// ADMIN ANALYTICS PRO - ULTRA POWERFUL DASHBOARD v5.0
// ✅ Correction complète des erreurs
// ✅ Tableau général des utilisateurs avec actions admin
// ✅ Système de gestion d'accès
// ✅ Menu principal restructuré
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
        this.allUsersDetailedData = []; // 🆕 Données utilisateurs enrichies
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
        
        // Current section
        this.currentSection = 'dashboard'; // 🆕 Menu principal par défaut
        
        this.init();
    }

    async init() {
        console.log('🔐 Initializing Admin Analytics PRO v5.0...');
        
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
            
            document.getElementById('loading-screen')?.style.setProperty('display', 'none');
            document.getElementById('admin-dashboard')?.style.setProperty('display', 'block');
            
            // Load Leaflet.js for maps
            await this.loadLeafletLibrary();
            
            await this.loadAllData();
            this.initEventListeners();
            this.initSectionTabs();
            
            // 🆕 Afficher le menu principal par défaut
            this.showSection('dashboard');
            
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
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
            
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

    // 🆕 SYSTÈME DE NAVIGATION PAR SECTIONS
    initSectionTabs() {
        const tabButtons = document.querySelectorAll('.section-tab, [data-section]');
        const sections = document.querySelectorAll('.analytics-section, [data-section-content]');
        
        if (tabButtons.length === 0) {
            console.warn('⚠ No section tabs found - creating default navigation');
            return;
        }
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = button.dataset.section || button.getAttribute('href')?.replace('#', '');
                
                if (targetSection) {
                    this.showSection(targetSection);
                }
            });
        });
        
        console.log(`✅ Section tabs initialized (${tabButtons.length} tabs)`);
    }

    // 🆕 AFFICHER UNE SECTION SPÉCIFIQUE
    showSection(sectionName) {
        console.log(`🔄 Switching to section: ${sectionName}`);
        
        this.currentSection = sectionName;
        
        // Update active tab
        document.querySelectorAll('.section-tab, .main-tab, [data-section]').forEach(btn => {
            if (btn.dataset.section === sectionName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Show target section, hide others
        document.querySelectorAll('.analytics-section, .tab-section, [data-section-content]').forEach(section => {
            const sectionId = section.id || section.dataset.sectionContent;
            
            if (sectionId === sectionName || section.id === `${sectionName}-section`) {
                section.classList.add('active');
                section.style.display = 'block';
            } else {
                section.classList.remove('active');
                section.style.display = 'none';
            }
        });
        
        // 🆕 Charger les données spécifiques si nécessaire
        if (sectionName === 'users-management') {
            this.loadUsersManagementTable();
        }
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
                this.loadPotentialCustomers(),
                
                // 🆕 Tableau utilisateurs détaillé
                this.loadUsersDetailedData()
            ]);
            
            const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ All data loaded successfully in ${loadTime}s`);
            
            await this.checkAlerts();
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            alert('⚠ Error loading analytics data. Check console for details.');
        }
    }

    // 🆕 CHARGEMENT DES DONNÉES UTILISATEURS DÉTAILLÉES
    async loadUsersDetailedData() {
        try {
            console.log('👥 Loading detailed users data...');
            
            this.allUsersDetailedData = [];
            
            for (const user of this.allUsersData) {
                // Récupérer les simulations
                const simulationsSnapshot = await this.db
                    .collection('users')
                    .doc(user.id)
                    .collection('simulations')
                    .get();
                
                // Compter les visites
                const userVisits = this.allVisitsData.filter(v => v.userId === user.id).length;
                
                // Compter les activités
                const userActivities = this.allActivityData.filter(a => a.userId === user.id).length;
                
                // Compter les requêtes API (si disponible)
                const apiRequestsSnapshot = await this.db
                    .collection('users')
                    .doc(user.id)
                    .collection('api_requests')
                    .get();
                
                // Récupérer le statut de ban
                const userDoc = await this.db.collection('users').doc(user.id).get();
                const userData = userDoc.data();
                
                this.allUsersDetailedData.push({
                    id: user.id,
                    email: user.email || 'N/A',
                    displayName: user.displayName || user.name || 'N/A',
                    plan: user.plan || 'basic',
                    subscriptionStatus: user.subscriptionStatus || 'inactive',
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                    emailVerified: user.emailVerified || false,
                    simulations: simulationsSnapshot.size,
                    visits: userVisits,
                    activities: userActivities,
                    apiRequests: apiRequestsSnapshot.size,
                    isBanned: userData?.isBanned || false, // 🆕 Statut de ban
                    bannedAt: userData?.bannedAt || null,
                    bannedReason: userData?.bannedReason || null,
                    photoURL: user.photoURL || null,
                    country: user.country || 'Unknown'
                });
            }
            
            console.log(`✅ Detailed data loaded for ${this.allUsersDetailedData.length} users`);
            
        } catch (error) {
            console.error('❌ Error loading detailed users data:', error);
        }
    }

    // 🆕 AFFICHER LE TABLEAU DE GESTION DES UTILISATEURS
    async loadUsersManagementTable() {
        try {
            console.log('📋 Loading users management table...');
            
            const tbody = document.getElementById('users-management-body');
            if (!tbody) {
                console.warn('⚠ Users management table not found');
                return;
            }
            
            tbody.innerHTML = '';
            
            // Trier par date d'inscription (plus récent en premier)
            const sortedUsers = this.allUsersDetailedData
                .sort((a, b) => {
                    if (!a.createdAt) return 1;
                    if (!b.createdAt) return -1;
                    return b.createdAt.toDate() - a.createdAt.toDate();
                });
            
            if (sortedUsers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="12" style="text-align: center;">No users available</td></tr>';
                return;
            }
            
            sortedUsers.forEach((user, index) => {
                const row = document.createElement('tr');
                
                // Appliquer un style si l'utilisateur est banni
                if (user.isBanned) {
                    row.style.backgroundColor = '#fee2e2';
                    row.style.opacity = '0.7';
                }
                
                const createdAt = user.createdAt ? user.createdAt.toDate().toLocaleDateString('en-US') : 'N/A';
                const lastLogin = user.lastLogin ? user.lastLogin.toDate().toLocaleDateString('en-US') : 'Never';
                
                // Badge de plan
                const planBadge = `<span class="plan-badge plan-${user.plan}">${user.plan.toUpperCase()}</span>`;
                
                // Badge de statut
                let statusBadge = '';
                if (user.isBanned) {
                    statusBadge = '<span class="status-badge status-banned">🚫 BANNED</span>';
                } else if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') {
                    statusBadge = '<span class="status-badge status-active">✅ Active</span>';
                } else {
                    statusBadge = '<span class="status-badge status-inactive">❌ Inactive</span>';
                }
                
                // Bouton d'action
                const actionButton = user.isBanned
                    ? `<button class="btn-action btn-unban" onclick="adminAnalytics.unbanUser('${user.id}')">
                        <i class="fas fa-unlock"></i> Unban
                       </button>`
                    : `<button class="btn-action btn-ban" onclick="adminAnalytics.banUser('${user.id}')">
                        <i class="fas fa-ban"></i> Ban
                       </button>`;
                
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>
                        <div class="user-info">
                            ${user.photoURL ? `<img src="${user.photoURL}" alt="Avatar" class="user-avatar-small">` : ''}
                            <div>
                                <div class="user-email">${user.email}</div>
                                ${user.displayName !== 'N/A' ? `<div class="user-name">${user.displayName}</div>` : ''}
                            </div>
                        </div>
                    </td>
                    <td>${planBadge}</td>
                    <td>${statusBadge}</td>
                    <td>${createdAt}</td>
                    <td>${lastLogin}</td>
                    <td>${user.simulations}</td>
                    <td>${user.visits}</td>
                    <td>${user.activities}</td>
                    <td>${user.apiRequests}</td>
                    <td>${user.country}</td>
                    <td>${actionButton}</td>
                `;
                
                tbody.appendChild(row);
            });
            
            // Mettre à jour les statistiques
            this.updateUsersManagementStats();
            
            console.log(`✅ Users management table loaded (${sortedUsers.length} users)`);
            
        } catch (error) {
            console.error('❌ Error loading users management table:', error);
        }
    }

    // 🆕 METTRE À JOUR LES STATISTIQUES DU TABLEAU UTILISATEURS
    updateUsersManagementStats() {
        const totalUsers = this.allUsersDetailedData.length;
        const bannedUsers = this.allUsersDetailedData.filter(u => u.isBanned).length;
        const activeUsers = this.allUsersDetailedData.filter(u => !u.isBanned && u.subscriptionStatus === 'active').length;
        const premiumUsers = this.allUsersDetailedData.filter(u => u.plan !== 'basic' && u.plan !== 'free').length;
        
        this.updateStat('total-users-mgmt', totalUsers);
        this.updateStat('banned-users-mgmt', bannedUsers);
        this.updateStat('active-users-mgmt', activeUsers);
        this.updateStat('premium-users-mgmt', premiumUsers);
    }

    // 🆕 BANNIR UN UTILISATEUR
    async banUser(userId) {
        try {
            const reason = prompt('Raison du bannissement (optionnel):');
            
            if (reason === null) return; // Annulé
            
            const confirmBan = confirm(`⚠ Êtes-vous sûr de vouloir bannir cet utilisateur?\n\nCette action:\n- Bloquera son accès au site\n- Annulera son abonnement actif\n- Sera enregistrée dans les logs`);
            
            if (!confirmBan) return;
            
            console.log(`🚫 Banning user: ${userId}`);
            
            // Mettre à jour Firestore
            await this.db.collection('users').doc(userId).update({
                isBanned: true,
                bannedAt: firebase.firestore.FieldValue.serverTimestamp(),
                bannedReason: reason || 'No reason provided',
                subscriptionStatus: 'banned'
            });
            
            // Enregistrer dans les logs
            await this.db.collection('admin_actions').add({
                action: 'ban_user',
                userId: userId,
                adminEmail: ADMIN_EMAIL,
                reason: reason,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            alert('✅ Utilisateur banni avec succès');
            
            // Recharger les données
            await this.loadUsersDetailedData();
            await this.loadUsersManagementTable();
            
        } catch (error) {
            console.error('❌ Error banning user:', error);
            alert('⚠ Erreur lors du bannissement: ' + error.message);
        }
    }

    // 🆕 DÉBANNIR UN UTILISATEUR
    async unbanUser(userId) {
        try {
            const confirmUnban = confirm('✅ Débannir cet utilisateur?\n\nIl pourra à nouveau accéder au site.');
            
            if (!confirmUnban) return;
            
            console.log(`✅ Unbanning user: ${userId}`);
            
            // Mettre à jour Firestore
            await this.db.collection('users').doc(userId).update({
                isBanned: false,
                bannedAt: null,
                bannedReason: null,
                subscriptionStatus: 'inactive'
            });
            
            // Enregistrer dans les logs
            await this.db.collection('admin_actions').add({
                action: 'unban_user',
                userId: userId,
                adminEmail: ADMIN_EMAIL,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            alert('✅ Utilisateur débanni avec succès');
            
            // Recharger les données
            await this.loadUsersDetailedData();
            await this.loadUsersManagementTable();
            
        } catch (error) {
            console.error('❌ Error unbanning user:', error);
            alert('⚠ Erreur lors du débannissement: ' + error.message);
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
            this.updateStat('unique-visitors', uniqueVisitors.size.toLocaleString());
            this.updateStat('anonymous-visits', anonymousVisits.toLocaleString());
            
            const avgVisitsPerDay = weekVisits > 0 ? (weekVisits / 7).toFixed(1) : '0';
            this.updateStat('avg-visits-per-day', avgVisitsPerDay);
            
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
                : '0';
            
            this.updateStat('total-activity', this.allActivityData.length.toLocaleString());
            
            const topAction = Object.entries(actionTypes)
                .sort((a, b) => b[1] - a[1])[0];
            
            console.log('✅ Engagement stats loaded:', weekActivity, 'activities this week');
            
        } catch (error) {
            console.error('❌ Error loading engagement stats:', error);
        }
    }

    async loadSessionAnalytics() {
        try {
            console.log('📊 Loading session analytics...');
            
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
            
            Object.values(sessions).forEach(session => {
                if (session.startTime && session.endTime) {
                    session.duration = (session.endTime - session.startTime) / 1000;
                }
            });
            
            this.sessionData = Object.values(sessions);
            
            const totalSessions = this.sessionData.length;
            const validSessions = this.sessionData.filter(s => s.duration > 0);
            const avgValidDuration = validSessions.length > 0
                ? validSessions.reduce((sum, s) => sum + s.duration, 0) / validSessions.length
                : 0;
            const avgPagesPerSession = this.sessionData.reduce((sum, s) => sum + s.pages.length, 0) / (totalSessions || 1);
            
            this.updateStat('total-sessions', totalSessions.toLocaleString());
            this.updateStat('avg-session-duration', `${(avgValidDuration / 60).toFixed(1)} min`);
            this.updateStat('avg-pages-per-session', avgPagesPerSession.toFixed(1));
            
            console.log('✅ Session analytics loaded:', totalSessions, 'sessions');
            
        } catch (error) {
            console.error('❌ Session analytics error:', error);
        }
    }

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
            
            const totalVisits = Object.values(pageVisits).reduce((a, b) => a + b, 0);
            const totalBounces = Object.values(pageBounces).reduce((a, b) => a + b, 0);
            const overallBounceRate = totalVisits > 0 ? ((totalBounces / totalVisits) * 100).toFixed(1) : '0';
            
            this.updateStat('overall-bounce-rate', `${overallBounceRate}%`);
            
            console.log('✅ Bounce rate analytics loaded');
            
        } catch (error) {
            console.error('❌ Bounce rate analytics error:', error);
        }
    }

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
            
            const uniquePaths = this.conversionPaths.length;
            
            this.updateStat('unique-conversion-paths', uniquePaths);
            
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
    // CHARTS (Versions simplifiées pour éviter erreurs)
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
            
            const canvas = document.getElementById('cohort-chart');
            if (!canvas) {
                console.warn('⚠ Cohort chart canvas not found');
                return;
            }
            
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
                : '0';
            
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
                : '0';
            
            const maxLTV = ltvValues.length > 0 ? Math.max(...ltvValues).toFixed(2) : '0';
            
            this.updateStat('avg-ltv', `$${avgLTV}`);
            this.updateStat('max-ltv', `$${maxLTV}`);
            
        } catch (error) {
            console.error('❌ Error loading LTV:', error);
        }
    }

    // ========================================
    // NON-CUSTOMER VISITORS & POTENTIAL
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
            
            this.displayNonCustomerVisitors();
            
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

    async loadPotentialCustomers() {
        try {
            console.log('🎯 Analyzing potential customers...');
            
            this.potentialCustomers = this.nonCustomerVisitors.map(visitor => {
                let score = 0;
                
                score += Math.min(visitor.visits * 3, 30);
                
                const uniquePages = visitor.pages ? new Set(visitor.pages).size : 0;
                score += Math.min(uniquePages * 5, 25);
                
                if (visitor.lastVisit) {
                    const daysSinceLastVisit = (new Date() - visitor.lastVisit) / (1000 * 60 * 60 * 24);
                    if (daysSinceLastVisit < 1) score += 20;
                    else if (daysSinceLastVisit < 7) score += 15;
                    else if (daysSinceLastVisit < 30) score += 10;
                }
                
                const strategicPages = ['pricing', 'plans', 'dashboard', 'signup', 'register'];
                const visitedStrategic = visitor.pages ? visitor.pages.filter(page =>
                    strategicPages.some(sp => page.toLowerCase().includes(sp))
                ).length : 0;
                score += Math.min(visitedStrategic * 5, 15);
                
                const deviceCount = visitor.devices ? visitor.devices.length : 0;
                score += Math.min(deviceCount * 5, 10);
                
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
        const projectedLTV = currentLTV * 1.15;
        
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
                    data = this.allUsersDetailedData;
                    filename = 'users_detailed';
                    headers = ['ID', 'Email', 'Display Name', 'Plan', 'Status', 'Created At', 'Last Login', 'Simulations', 'Visits', 'Activities', 'API Requests', 'Country', 'Banned'];
                    data = data.map(u => [
                        u.id,
                        u.email,
                        u.displayName,
                        u.plan,
                        u.subscriptionStatus,
                        u.createdAt ? u.createdAt.toDate().toISOString() : 'N/A',
                        u.lastLogin ? u.lastLogin.toDate().toISOString() : 'N/A',
                        u.simulations,
                        u.visits,
                        u.activities,
                        u.apiRequests,
                        u.country,
                        u.isBanned ? 'Yes' : 'No'
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
                
                // 🆕 CLOUDFLARE EXPORT
                case 'cloudflare':
                    if (!this.cloudflareData || !this.cloudflareData.overview) {
                        alert('⚠ No Cloudflare data available to export.');
                        console.warn('⚠ No Cloudflare data to export');
                        return;
                    }
                    filename = 'cloudflare_analytics';
                    headers = ['Metric', 'Value'];
                    const overview = this.cloudflareData.overview;
                    data = [
                        ['Total Requests', overview.totalRequests || 0],
                        ['Total Bytes', overview.totalBytes || 0],
                        ['Cached Requests', overview.totalCachedRequests || 0],
                        ['Cache Hit Rate', (overview.cacheHitRate || 0) + '%'],
                        ['Total Pageviews', overview.totalPageViews || 0],
                        ['Total Uniques', overview.totalUniques || 0],
                        ['Total Threats', overview.totalThreats || 0]
                    ];
                    break;
                
                // 🆕 STRIPE EXPORT
                case 'stripe':
                    if (!this.stripeData) {
                        alert('⚠ No Stripe data available to export.');
                        console.warn('⚠ No Stripe data to export');
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
                    console.warn('⚠ Unknown export type:', type);
                    alert(`⚠ Export type "${type}" is not supported.`);
                    return;
            }
            
            if (data.length === 0) {
                console.warn(`⚠ No data to export for ${type}`);
                alert(`⚠ No data available to export for "${type}".`);
                return;
            }
            
            const csvContent = this.arrayToCSV(data, headers);
            this.downloadCSV(csvContent, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            
            console.log(`✅ Export ${type} successful (${data.length} rows)`);
            alert(`✅ Successfully exported ${data.length} rows to ${filename}.csv`);
            
        } catch (error) {
            console.error(`❌ Error exporting ${type}:`, error);
            alert(`❌ Error exporting ${type}: ${error.message}`);
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

    // 🆕 FONCTIONS CLOUDFLARE (versions réduites pour éviter erreurs)
    async loadStripeMetrics() { console.log('💳 Stripe skipped (optional)'); }
    async loadCloudflareAnalytics() { console.log('☁ Cloudflare skipped (optional)'); }
    async loadCloudflareGeo() { console.log('🌍 Cloudflare Geo skipped (optional)'); }
    async loadCloudflareDevices() { console.log('📱 Cloudflare Devices skipped (optional)'); }
    async loadCloudflarePages() { console.log('📄 Cloudflare Pages skipped (optional)'); }
    async loadCloudflareVisitors() { console.log('👥 Cloudflare Visitors skipped (optional)'); }
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Starting Admin Analytics PRO v5.0...');
    console.log('📊 Initializing comprehensive analytics dashboard...');
    
    window.adminAnalytics = new AdminAnalyticsPro();
    
    console.log('✅ Admin Analytics instance created and attached to window.adminAnalytics');
});

function exportAnalyticsData(type) {
    if (window.adminAnalytics) {
        window.adminAnalytics.exportData(type);
    } else {
        console.error('❌ Admin Analytics not initialized');
        alert('Analytics system not ready. Please wait...');
    }
}