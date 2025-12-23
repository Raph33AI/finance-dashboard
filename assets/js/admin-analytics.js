// ========================================
// ADMIN ANALYTICS ENGINE
// ========================================

// 🔐 TON ADRESSE EMAIL ADMIN (À MODIFIER)
const ADMIN_EMAIL = 'raphnardone@gmail.com'; // ⚠ CHANGE ICI

class AdminAnalytics {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.charts = {};
        
        this.init();
    }

    async init() {
        console.log('🔐 Initialisation Admin Analytics...');
        
        // Vérifier l'authentification
        this.auth.onAuthStateChanged(async (user) => {
            if (!user) {
                console.log('❌ Non authentifié - redirection...');
                window.location.href = 'login.html';
                return;
            }

            // Vérifier si c'est l'admin
            if (user.email !== ADMIN_EMAIL) {
                console.log('⛔ Accès refusé - Pas autorisé');
                alert('⛔ Accès interdit - Cette page est réservée aux administrateurs.');
                window.location.href = 'index.html';
                return;
            }

            console.log('✅ Admin authentifié:', user.email);
            document.getElementById('admin-email').textContent = user.email;
            
            // Cacher l'écran de chargement
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('admin-dashboard').style.display = 'block';
            
            // Charger les données
            await this.loadAllData();
        });

        // Bouton déconnexion
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.auth.signOut();
        });
    }

    async loadAllData() {
        console.log('📊 Chargement des données...');
        
        try {
            await Promise.all([
                this.loadUsersStats(),
                this.loadVisitsStats(),
                this.loadRevenueStats(),
                this.loadRegistrationsChart(),
                this.loadPlansChart(),
                this.loadVisitsChart(),
                this.loadPagesChart(),
                this.loadRecentUsers(),
                this.loadRecentActivity()
            ]);
            
            console.log('✅ Toutes les données chargées');
        } catch (error) {
            console.error('❌ Erreur chargement:', error);
        }
    }

    // ========================================
    // STATS UTILISATEURS
    // ========================================
    async loadUsersStats() {
        try {
            const usersSnapshot = await this.db.collection('users').get();
            const totalUsers = usersSnapshot.size;
            
            // Utilisateurs de la semaine dernière
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            
            let weekUsers = 0;
            let premiumUsers = 0;
            
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                
                // Compter premium
                if (data.plan && data.plan !== 'free') {
                    premiumUsers++;
                }
                
                // Compter nouveaux cette semaine
                if (data.createdAt && data.createdAt.toDate() > weekAgo) {
                    weekUsers++;
                }
            });
            
            document.getElementById('total-users').textContent = totalUsers;
            document.getElementById('users-change').textContent = `+${weekUsers} cette semaine`;
            document.getElementById('premium-users').textContent = premiumUsers;
            
            const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0;
            document.getElementById('premium-change').textContent = `${conversionRate}% conversion`;
            
        } catch (error) {
            console.error('Erreur stats users:', error);
        }
    }

    // ========================================
    // STATS VISITES
    // ========================================
    async loadVisitsStats() {
        try {
            const visitsSnapshot = await this.db.collection('analytics_visits').get();
            const totalVisits = visitsSnapshot.size;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            let todayVisits = 0;
            
            visitsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.timestamp && data.timestamp.toDate() >= today) {
                    todayVisits++;
                }
            });
            
            document.getElementById('total-visits').textContent = totalVisits;
            document.getElementById('visits-change').textContent = `+${todayVisits} aujourd'hui`;
            
        } catch (error) {
            console.error('Erreur stats visits:', error);
            document.getElementById('total-visits').textContent = '0';
        }
    }

    // ========================================
    // STATS REVENUS
    // ========================================
    async loadRevenueStats() {
        try {
            const paymentsSnapshot = await this.db.collection('payments').get();
            
            let totalRevenue = 0;
            let monthRevenue = 0;
            
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            
            paymentsSnapshot.forEach(doc => {
                const data = doc.data();
                const amount = parseFloat(data.amount) || 0;
                
                totalRevenue += amount;
                
                if (data.createdAt && data.createdAt.toDate() > monthAgo) {
                    monthRevenue += amount;
                }
            });
            
            document.getElementById('total-revenue').textContent = `${totalRevenue.toFixed(0)}€`;
            document.getElementById('revenue-change').textContent = `+${monthRevenue.toFixed(0)}€ ce mois`;
            
        } catch (error) {
            console.error('Erreur stats revenue:', error);
            document.getElementById('total-revenue').textContent = '0€';
        }
    }

    // ========================================
    // GRAPHIQUE INSCRIPTIONS
    // ========================================
    async loadRegistrationsChart() {
        try {
            const usersSnapshot = await this.db.collection('users')
                .orderBy('createdAt', 'desc')
                .limit(1000)
                .get();
            
            // Grouper par jour (30 derniers jours)
            const daysCounts = {};
            const today = new Date();
            
            for (let i = 29; i >= 0; i--) {
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
            
            const ctx = document.getElementById('registrations-chart').getContext('2d');
            this.charts.registrations = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Inscriptions',
                        data: data,
                        borderColor: 'rgb(102, 126, 234)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
            
        } catch (error) {
            console.error('Erreur chart inscriptions:', error);
        }
    }

    // ========================================
    // GRAPHIQUE RÉPARTITION PLANS
    // ========================================
    async loadPlansChart() {
        try {
            const usersSnapshot = await this.db.collection('users').get();
            
            const plansCounts = {
                free: 0,
                basic: 0,
                pro: 0,
                platinum: 0
            };
            
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                const plan = data.plan || 'free';
                if (plansCounts.hasOwnProperty(plan)) {
                    plansCounts[plan]++;
                }
            });
            
            const ctx = document.getElementById('plans-chart').getContext('2d');
            this.charts.plans = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Free', 'Basic', 'Pro', 'Platinum'],
                    datasets: [{
                        data: [
                            plansCounts.free,
                            plansCounts.basic,
                            plansCounts.pro,
                            plansCounts.platinum
                        ],
                        backgroundColor: [
                            'rgba(100, 116, 139, 0.8)',
                            'rgba(59, 130, 246, 0.8)',
                            'rgba(139, 92, 246, 0.8)',
                            'rgba(251, 191, 36, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
            
        } catch (error) {
            console.error('Erreur chart plans:', error);
        }
    }

    // ========================================
    // GRAPHIQUE VISITES
    // ========================================
    async loadVisitsChart() {
        try {
            const visitsSnapshot = await this.db.collection('analytics_visits')
                .orderBy('timestamp', 'desc')
                .limit(1000)
                .get();
            
            // Grouper par jour (7 derniers jours)
            const daysCounts = {};
            const today = new Date();
            
            for (let i = 6; i >= 0; i--) {
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
            
            const ctx = document.getElementById('visits-chart').getContext('2d');
            this.charts.visits = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Visites',
                        data: data,
                        backgroundColor: 'rgba(79, 172, 254, 0.8)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
            
        } catch (error) {
            console.error('Erreur chart visits:', error);
        }
    }

    // ========================================
    // GRAPHIQUE PAGES
    // ========================================
    async loadPagesChart() {
        try {
            const visitsSnapshot = await this.db.collection('analytics_visits').get();
            
            const pagesCounts = {};
            
            visitsSnapshot.forEach(doc => {
                const data = doc.data();
                const page = data.page || 'unknown';
                pagesCounts[page] = (pagesCounts[page] || 0) + 1;
            });
            
            // Top 5 pages
            const sortedPages = Object.entries(pagesCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);
            
            const labels = sortedPages.map(p => p[0]);
            const data = sortedPages.map(p => p[1]);
            
            const ctx = document.getElementById('pages-chart').getContext('2d');
            this.charts.pages = new Chart(ctx, {
                type: 'horizontalBar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Vues',
                        data: data,
                        backgroundColor: 'rgba(67, 233, 123, 0.8)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
            
        } catch (error) {
            console.error('Erreur chart pages:', error);
        }
    }

    // ========================================
    // DERNIERS UTILISATEURS
    // ========================================
    async loadRecentUsers() {
        try {
            const usersSnapshot = await this.db.collection('users')
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            const tbody = document.getElementById('recent-users-body');
            tbody.innerHTML = '';
            
            usersSnapshot.forEach(doc => {
                const data = doc.data();
                const row = document.createElement('tr');
                
                const plan = data.plan || 'free';
                const planClass = `plan-${plan}`;
                const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);
                
                const status = data.trialEnds ? 'Trial' : 'Active';
                const statusClass = status === 'Trial' ? 'status-trial' : 'status-active';
                
                const date = data.createdAt ? data.createdAt.toDate().toLocaleDateString('fr-FR') : 'N/A';
                
                row.innerHTML = `
                    <td>${data.email || 'N/A'}</td>
                    <td><span class="plan-badge ${planClass}">${planLabel}</span></td>
                    <td>${date}</td>
                    <td><span class="status-badge ${statusClass}">${status}</span></td>
                `;
                
                tbody.appendChild(row);
            });
            
        } catch (error) {
            console.error('Erreur recent users:', error);
        }
    }

    // ========================================
    // ACTIVITÉ RÉCENTE
    // ========================================
    async loadRecentActivity() {
        try {
            const activitySnapshot = await this.db.collection('analytics_activity')
                .orderBy('timestamp', 'desc')
                .limit(20)
                .get();
            
            const tbody = document.getElementById('activity-body');
            tbody.innerHTML = '';
            
            if (activitySnapshot.empty) {
                tbody.innerHTML = '<tr><td colspan="4" class="loading">Aucune activité enregistrée</td></tr>';
                return;
            }
            
            activitySnapshot.forEach(doc => {
                const data = doc.data();
                const row = document.createElement('tr');
                
                const date = data.timestamp ? data.timestamp.toDate().toLocaleString('fr-FR') : 'N/A';
                
                row.innerHTML = `
                    <td>${data.type || 'N/A'}</td>
                    <td>${data.userEmail || 'Anonymous'}</td>
                    <td>${data.details || '-'}</td>
                    <td>${date}</td>
                `;
                
                tbody.appendChild(row);
            });
            
        } catch (error) {
            console.error('Erreur activity:', error);
            const tbody = document.getElementById('activity-body');
            tbody.innerHTML = '<tr><td colspan="4" class="loading">Aucune activité enregistrée</td></tr>';
        }
    }
}

// ========================================
// INITIALISATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    new AdminAnalytics();
});