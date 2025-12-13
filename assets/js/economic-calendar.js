/**
 * ====================================================================
 * ALPHAVAULT AI - ECONOMIC CALENDAR (FRED ONLY)
 * ====================================================================
 * Calendrier des publications économiques - données FRED uniquement
 * Modals cliquables avec graphiques et analyses détaillées
 */

class EconomicCalendar {
    constructor() {
        this.allEvents = [];
        this.filteredEvents = [];
        this.currentPeriod = 'week';
        this.categories = new Set();
        this.seriesData = new Map(); // Cache pour les données de séries
    }

    async init() {
        console.log('📅 Initializing Economic Calendar (FRED)...');
        
        try {
            await this.loadEvents();
            this.updateStatistics();
            this.populateCategoryFilter();
            await this.loadCharts();
            
            console.log('✅ Economic Calendar loaded');
            
        } catch (error) {
            console.error('❌ Economic Calendar error:', error);
            this.showError('Failed to load economic calendar');
        }
    }

    /**
     * ========================================
     * LOAD EVENTS FROM FRED
     * ========================================
     */
    async loadEvents() {
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '<div class="eco-loading"><div class="eco-spinner"></div><p>Loading FRED economic releases...</p></div>';

        try {
            // Récupérer les dates de publication FRED
            const releaseDates = await economicDataClient.getReleasesDates({
                limit: 200,
                sort_order: 'asc'
            });

            console.log('📊 FRED Release dates:', releaseDates);
            console.log('📊 Type:', typeof releaseDates);
            console.log('📊 Is Array:', Array.isArray(releaseDates));

            // ✅ CORRECTION: Gérer différentes structures de réponse
            let releasesArray = [];
            
            if (Array.isArray(releaseDates)) {
                // Si c'est directement un tableau
                releasesArray = releaseDates;
            } else if (releaseDates && releaseDates.data && Array.isArray(releaseDates.data.release_dates)) {
                // Si c'est dans data.release_dates
                releasesArray = releaseDates.data.release_dates;
            } else if (releaseDates && Array.isArray(releaseDates.release_dates)) {
                // Si c'est dans release_dates directement
                releasesArray = releaseDates.release_dates;
            } else if (releaseDates && releaseDates.data && Array.isArray(releaseDates.data)) {
                // Si c'est dans data (tableau)
                releasesArray = releaseDates.data;
            }

            console.log('📊 Releases array length:', releasesArray.length);

            if (!releasesArray || releasesArray.length === 0) {
                throw new Error('No release dates found');
            }

            // Transformer en événements
            this.allEvents = releasesArray.map(release => {
                const category = this.determineCategory(release.release_name || release.name);
                this.categories.add(category);
                
                return {
                    id: release.release_id || release.id,
                    name: release.release_name || release.name || 'Economic Release',
                    date: new Date(release.date),
                    region: 'US',
                    importance: this.determineImportance(release.release_name || release.name),
                    category: category
                };
            });

            // Filtrer les dates invalides
            this.allEvents = this.allEvents.filter(event => !isNaN(event.date.getTime()));

            console.log('✅ Events loaded:', this.allEvents.length);

            // Trier par date
            this.allEvents.sort((a, b) => a.date - b.date);

            // Appliquer les filtres
            this.filterEvents();

        } catch (error) {
            console.error('❌ Error loading events:', error);
            grid.innerHTML = '<div class="eco-error"><i class="fas fa-exclamation-triangle"></i><p>Error loading economic calendar. Please check console for details.</p></div>';
        }
    }

    /**
     * Déterminer l'importance basée sur le nom
     */
    determineImportance(name) {
        if (!name) return 'low';
        
        const highImpact = [
            'employment', 'gdp', 'cpi', 'fed', 'interest', 'inflation', 
            'payroll', 'unemployment', 'fomc', 'federal funds', 'nonfarm'
        ];
        const mediumImpact = [
            'retail', 'manufacturing', 'housing', 'consumer', 'sentiment',
            'production', 'sales', 'pmi', 'construction', 'durable goods'
        ];
        
        const lowerName = name.toLowerCase();
        
        if (highImpact.some(keyword => lowerName.includes(keyword))) {
            return 'high';
        } else if (mediumImpact.some(keyword => lowerName.includes(keyword))) {
            return 'medium';
        }
        return 'low';
    }

    /**
     * Déterminer la catégorie
     */
    determineCategory(name) {
        if (!name) return 'Other';
        
        const lowerName = name.toLowerCase();
        
        const categories = {
            'Employment': ['employment', 'payroll', 'unemployment', 'jobs', 'labor', 'nonfarm'],
            'GDP': ['gdp', 'growth', 'output', 'productivity'],
            'Inflation': ['cpi', 'inflation', 'price', 'pce', 'deflator'],
            'Monetary Policy': ['fed', 'interest', 'rate', 'fomc', 'federal funds', 'monetary'],
            'Retail': ['retail', 'sales', 'consumer spending'],
            'Manufacturing': ['manufacturing', 'production', 'industrial', 'pmi', 'durable goods'],
            'Housing': ['housing', 'construction', 'building', 'home'],
            'Trade': ['trade', 'import', 'export', 'balance'],
            'Business': ['business', 'inventory', 'sentiment', 'confidence']
        };
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerName.includes(keyword))) {
                return category;
            }
        }
        return 'Other';
    }

    /**
     * ========================================
     * FILTERS
     * ========================================
     */
    filterEvents() {
        const importanceFilter = document.getElementById('importanceFilter').value;
        const categoryFilter = document.getElementById('categoryFilter').value;
        
        // Calculer la plage de dates basée sur la période
        const now = new Date();
        let endDate = new Date();
        
        switch (this.currentPeriod) {
            case 'week':
                endDate.setDate(now.getDate() + 7);
                break;
            case 'month':
                endDate.setMonth(now.getMonth() + 1);
                break;
            case 'quarter':
                endDate.setMonth(now.getMonth() + 3);
                break;
            case 'year':
                endDate.setFullYear(now.getFullYear() + 1);
                break;
        }

        this.filteredEvents = this.allEvents.filter(event => {
            // Filtrer par période
            if (event.date < now || event.date > endDate) return false;
            
            // Filtrer par importance
            if (importanceFilter !== 'all' && event.importance !== importanceFilter) return false;
            
            // Filtrer par catégorie
            if (categoryFilter !== 'all' && event.category !== categoryFilter) return false;
            
            return true;
        });

        this.displayEvents();
        this.updateStatistics();
    }

    resetFilters() {
        document.getElementById('importanceFilter').value = 'all';
        document.getElementById('categoryFilter').value = 'all';
        this.currentPeriod = 'week';
        
        // Reset time buttons
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.period === 'week') {
                btn.classList.add('active');
            }
        });
        
        this.filterEvents();
    }

    changePeriod(period) {
        this.currentPeriod = period;
        
        // Update active button
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });
        
        this.filterEvents();
    }

    populateCategoryFilter() {
        const select = document.getElementById('categoryFilter');
        const currentValue = select.value;
        
        // Clear existing options except "All"
        select.innerHTML = '<option value="all">All Categories</option>';
        
        // Add categories
        const sortedCategories = Array.from(this.categories).sort();
        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
        
        // Restore previous selection if valid
        if (currentValue && sortedCategories.includes(currentValue)) {
            select.value = currentValue;
        }
    }

    /**
     * ========================================
     * DISPLAY EVENTS
     * ========================================
     */
    displayEvents() {
        const grid = document.getElementById('calendarGrid');

        if (this.filteredEvents.length === 0) {
            grid.innerHTML = '<div class="eco-no-data"><i class="fas fa-calendar-times"></i><p>No economic events found for the selected filters</p></div>';
            return;
        }

        const eventsHTML = this.filteredEvents.map(event => {
            const day = event.date.getDate();
            const month = event.date.toLocaleDateString('en-US', { month: 'short' });
            const time = event.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            // Échapper les guillemets pour JSON
            const eventJSON = JSON.stringify(event).replace(/"/g, '&quot;');
            
            return `
                <div class='calendar-event ${event.importance}-importance' onclick='economicCalendar.showEventDetails(${eventJSON})'>
                    <div class='calendar-date'>
                        <div class='calendar-day'>${day}</div>
                        <div class='calendar-month'>${month}</div>
                    </div>
                    
                    <div class='calendar-event-info'>
                        <h4>${event.name}</h4>
                        <div class='calendar-event-country'>🇺🇸 United States • ${event.category}</div>
                    </div>
                    
                    <div class='calendar-impact ${event.importance}'>
                        ${event.importance.toUpperCase()}
                    </div>
                    
                    <div class='calendar-time'>
                        ${time}
                    </div>
                </div>
            `;
        }).join('');

        grid.innerHTML = eventsHTML;
    }

    /**
     * ========================================
     * STATISTICS
     * ========================================
     */
    updateStatistics() {
        // Total releases
        document.getElementById('totalReleasesValue').textContent = this.filteredEvents.length;
        
        // High impact
        const highImpact = this.filteredEvents.filter(e => e.importance === 'high').length;
        document.getElementById('highImpactValue').textContent = highImpact;
        
        // Categories
        const uniqueCategories = new Set(this.filteredEvents.map(e => e.category));
        document.getElementById('categoriesValue').textContent = uniqueCategories.size;
        
        // This week
        const now = new Date();
        const weekEnd = new Date();
        weekEnd.setDate(now.getDate() + 7);
        const thisWeek = this.allEvents.filter(e => e.date >= now && e.date <= weekEnd).length;
        document.getElementById('thisWeekValue').textContent = thisWeek;
    }

    /**
     * ========================================
     * CHARTS
     * ========================================
     */
    async loadCharts() {
        await this.loadTimelineChart();
        await this.loadCategoryChart();
        await this.loadImportanceChart();
        await this.loadHeatmapChart();
    }

    async loadTimelineChart() {
        try {
            const timelineData = this.filteredEvents.slice(0, 20).map(event => ({
                x: event.date.getTime(),
                name: event.name,
                label: event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                description: `${event.category} • ${event.importance.toUpperCase()} Impact`
            }));

            Highcharts.chart('timelineChart', {
                chart: { 
                    type: 'timeline',
                    backgroundColor: 'transparent'
                },
                title: { 
                    text: null
                },
                accessibility: {
                    enabled: false
                },
                xAxis: {
                    visible: false
                },
                yAxis: {
                    visible: false
                },
                tooltip: {
                    style: {
                        width: 300
                    }
                },
                series: [{
                    dataLabels: {
                        allowOverlap: false,
                        format: '<span style="color:{point.color}">● </span><span style="font-weight: bold;" > {point.x:%d %b}</span><br/>{point.label}'
                    },
                    marker: {
                        symbol: 'circle'
                    },
                    data: timelineData
                }],
                credits: { enabled: false }
            });

        } catch (error) {
            console.error('❌ Error loading timeline chart:', error);
        }
    }

    async loadCategoryChart() {
        try {
            const categoryCounts = {};
            
            this.filteredEvents.forEach(event => {
                categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
            });

            const chartData = Object.entries(categoryCounts).map(([name, y]) => ({
                name,
                y
            }));

            Highcharts.chart('categoryChart', {
                chart: { 
                    type: 'pie',
                    backgroundColor: 'transparent'
                },
                title: { text: null },
                accessibility: {
                    enabled: false
                },
                tooltip: {
                    pointFormat: '<b>{point.y}</b> releases ({point.percentage:.1f}%)'
                },
                plotOptions: {
                    pie: {
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                            style: {
                                color: 'var(--text-primary)'
                            }
                        },
                        showInLegend: false
                    }
                },
                series: [{
                    name: 'Releases',
                    colorByPoint: true,
                    data: chartData
                }],
                credits: { enabled: false }
            });

        } catch (error) {
            console.error('❌ Error loading category chart:', error);
        }
    }

    async loadImportanceChart() {
        try {
            const importanceCounts = {
                high: this.filteredEvents.filter(e => e.importance === 'high').length,
                medium: this.filteredEvents.filter(e => e.importance === 'medium').length,
                low: this.filteredEvents.filter(e => e.importance === 'low').length
            };

            Highcharts.chart('importanceChart', {
                chart: { 
                    type: 'column',
                    backgroundColor: 'transparent'
                },
                title: { text: null },
                accessibility: {
                    enabled: false
                },
                xAxis: { 
                    categories: ['High Impact', 'Medium Impact', 'Low Impact'],
                    labels: { 
                        style: { color: 'var(--text-secondary)', fontWeight: 'bold' }
                    }
                },
                yAxis: { 
                    title: { text: 'Number of Releases', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: {
                    valueSuffix: ' releases'
                },
                plotOptions: {
                    column: {
                        dataLabels: {
                            enabled: true,
                            style: { fontWeight: 'bold', color: 'var(--text-primary)' }
                        }
                    }
                },
                series: [{
                    name: 'Releases',
                    data: [
                        { y: importanceCounts.high, color: '#ef4444' },
                        { y: importanceCounts.medium, color: '#f59e0b' },
                        { y: importanceCounts.low, color: '#3b82f6' }
                    ],
                    showInLegend: false
                }],
                credits: { enabled: false }
            });

        } catch (error) {
            console.error('❌ Error loading importance chart:', error);
        }
    }

    async loadHeatmapChart() {
        try {
            // Group events by day and count
            const heatmapData = [];
            const dayCount = {};
            
            this.filteredEvents.forEach(event => {
                const dateStr = event.date.toISOString().split('T')[0];
                dayCount[dateStr] = (dayCount[dateStr] || 0) + 1;
            });

            // Convert to heatmap format
            Object.entries(dayCount).forEach(([date, count]) => {
                const d = new Date(date);
                heatmapData.push([d.getTime(), count]);
            });

            Highcharts.chart('heatmapChart', {
                chart: { 
                    type: 'scatter',
                    backgroundColor: 'transparent'
                },
                title: { text: null },
                accessibility: {
                    enabled: false
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: '{value:%b %d}',
                        style: { color: 'var(--text-secondary)' }
                    }
                },
                yAxis: {
                    title: { text: 'Number of Releases', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: {
                    headerFormat: '',
                    pointFormat: '<b>{point.y}</b> releases on {point.x:%b %d, %Y}'
                },
                plotOptions: {
                    scatter: {
                        marker: {
                            radius: 8,
                            symbol: 'circle'
                        }
                    }
                },
                series: [{
                    name: 'Releases',
                    data: heatmapData,
                    color: '#667eea',
                    showInLegend: false
                }],
                credits: { enabled: false }
            });

        } catch (error) {
            console.error('❌ Error loading heatmap chart:', error);
        }
    }

    /**
     * ========================================
     * MODALS
     * ========================================
     */
    async showEventDetails(event) {
        const modal = document.getElementById('eventModal');
        const title = document.getElementById('modalEventTitle');
        const body = document.getElementById('modalEventBody');
        
        title.textContent = event.name;
        
        // Show loading
        body.innerHTML = '<div class="eco-loading"><div class="eco-spinner"></div><p>Loading event details...</p></div>';
        modal.classList.add('active');
        
        try {
            // Fetch release details from FRED
            const releaseInfo = await economicDataClient.getRelease(event.id);
            
            // Display details
            body.innerHTML = `
                <div class="event-detail-grid">
                    <div class="event-detail-item">
                        <h4><i class="fas fa-calendar"></i> Release Date</h4>
                        <p>${event.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${event.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    
                    <div class="event-detail-item">
                        <h4><i class="fas fa-layer-group"></i> Category</h4>
                        <p>${event.category}</p>
                    </div>
                    
                    <div class="event-detail-item">
                        <h4><i class="fas fa-exclamation-circle"></i> Impact Level</h4>
                        <p><span class="calendar-impact ${event.importance}">${event.importance.toUpperCase()}</span></p>
                    </div>
                    
                    <div class="event-detail-item">
                        <h4><i class="fas fa-globe-americas"></i> Region</h4>
                        <p>🇺🇸 United States</p>
                    </div>
                    
                    <div class="event-detail-item">
                        <h4><i class="fas fa-link"></i> FRED Release ID</h4>
                        <p>#${event.id}</p>
                    </div>
                    
                    <div class="event-detail-item">
                        <h4><i class="fas fa-info-circle"></i> Description</h4>
                        <p>${releaseInfo.data?.releases?.[0]?.notes || releaseInfo.releases?.[0]?.notes || 'Economic data release from the Federal Reserve Economic Data (FRED) database.'}</p>
                    </div>
                </div>
                
                <div class="event-chart-container">
                    <h4 class="chart-title"><i class="fas fa-chart-area"></i> Historical Data Preview</h4>
                    <div id="eventDetailChart" class="chart" style="height: 300px;"></div>
                </div>
            `;
            
            // Load historical chart if series available
            await this.loadEventHistoricalChart(event.id);
            
        } catch (error) {
            console.error('❌ Error loading event details:', error);
            body.innerHTML = `
                <div class="event-detail-grid">
                    <div class="event-detail-item">
                        <h4><i class="fas fa-calendar"></i> Release Date</h4>
                        <p>${event.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${event.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    
                    <div class="event-detail-item">
                        <h4><i class="fas fa-layer-group"></i> Category</h4>
                        <p>${event.category}</p>
                    </div>
                    
                    <div class="event-detail-item">
                        <h4><i class="fas fa-exclamation-circle"></i> Impact Level</h4>
                        <p><span class="calendar-impact ${event.importance}">${event.importance.toUpperCase()}</span></p>
                    </div>
                    
                    <div class="event-detail-item">
                        <h4><i class="fas fa-info-circle"></i> Note</h4>
                        <p>Economic data release from the Federal Reserve Economic Data (FRED) database.</p>
                    </div>
                </div>
            `;
        }
    }

    async loadEventHistoricalChart(releaseId) {
        try {
            // Get series for this release
            const seriesResponse = await economicDataClient.getReleaseSeries(releaseId, { limit: 1 });
            
            if (!seriesResponse.data?.seriess || seriesResponse.data.seriess.length === 0) {
                document.getElementById('eventDetailChart').innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px;">No historical data available for this release.</p>';
                return;
            }
            
            const seriesId = seriesResponse.data.seriess[0].id;
            
            // Get observations
            const observations = await economicDataClient.getSeriesObservations(seriesId, {
                sort_order: 'desc',
                limit: 50
            });
            
            if (!observations.data?.observations || observations.data.observations.length === 0) {
                document.getElementById('eventDetailChart').innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px;">No observations available.</p>';
                return;
            }
            
            // Prepare chart data
            const chartData = observations.data.observations
                .reverse()
                .filter(obs => obs.value !== '.')
                .map(obs => [
                    new Date(obs.date).getTime(),
                    parseFloat(obs.value)
                ]);
            
            Highcharts.chart('eventDetailChart', {
                chart: { 
                    type: 'line',
                    backgroundColor: 'transparent'
                },
                title: { text: null },
                accessibility: {
                    enabled: false
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: '{value:%b %Y}',
                        style: { color: 'var(--text-secondary)' }
                    }
                },
                yAxis: {
                    title: { text: 'Value', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: {
                    xDateFormat: '%B %Y',
                    valueSuffix: ''
                },
                series: [{
                    name: seriesResponse.data.seriess[0].title,
                    data: chartData,
                    color: '#667eea',
                    lineWidth: 3
                }],
                legend: { enabled: false },
                credits: { enabled: false }
            });
            
        } catch (error) {
            console.error('❌ Error loading historical chart:', error);
            document.getElementById('eventDetailChart').innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px;">Unable to load historical data.</p>';
        }
    }

    showInfo(type) {
        const modal = document.getElementById('infoModal');
        const body = document.getElementById('infoModalBody');
        
        const infoContent = {
            category: `
                <h3 style="margin-bottom: 16px;">📊 Category Distribution</h3>
                <p style="line-height: 1.8; color: var(--text-secondary);">
                    This chart shows the distribution of economic releases across different categories. 
                    Categories are automatically assigned based on the release name and include:
                </p>
                <ul style="line-height: 2; color: var(--text-secondary); margin: 16px 0;">
                    <li><strong>Employment:</strong> Jobs, unemployment, payrolls</li>
                    <li><strong>GDP:</strong> Economic growth and output</li>
                    <li><strong>Inflation:</strong> Price indices (CPI, PCE)</li>
                    <li><strong>Monetary Policy:</strong> Federal Reserve decisions</li>
                    <li><strong>Retail:</strong> Consumer spending</li>
                    <li><strong>Manufacturing:</strong> Industrial production</li>
                    <li><strong>Housing:</strong> Real estate and construction</li>
                </ul>
            `,
            importance: `
                <h3 style="margin-bottom: 16px;">⚠ Importance Levels</h3>
                <p style="line-height: 1.8; color: var(--text-secondary); margin-bottom: 16px;">
                    Economic releases are classified into three impact levels:
                </p>
                <div style="background: rgba(239, 68, 68, 0.1); padding: 16px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #ef4444;">
                    <h4 style="color: #ef4444; margin-bottom: 8px;">🔴 HIGH IMPACT</h4>
                    <p style="color: var(--text-secondary);">Major economic indicators that significantly influence markets (GDP, Employment, CPI, Fed decisions)</p>
                </div>
                <div style="background: rgba(245, 158, 11, 0.1); padding: 16px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #f59e0b;">
                    <h4 style="color: #f59e0b; margin-bottom: 8px;">🟡 MEDIUM IMPACT</h4>
                    <p style="color: var(--text-secondary);">Important but less market-moving data (Retail sales, Manufacturing PMI, Housing starts)</p>
                </div>
                <div style="background: rgba(59, 130, 246, 0.1); padding: 16px; border-radius: 12px; border-left: 4px solid #3b82f6;">
                    <h4 style="color: #3b82f6; margin-bottom: 8px;">🔵 LOW IMPACT</h4>
                    <p style="color: var(--text-secondary);">Secondary indicators with minimal market impact</p>
                </div>
            `
        };
        
        body.innerHTML = infoContent[type] || '<p>Information not available.</p>';
        modal.classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    /**
     * ========================================
     * EXPORT
     * ========================================
     */
    exportData() {
        document.getElementById('exportModal').classList.add('active');
    }

    downloadJSON() {
        const data = {
            generated: new Date().toISOString(),
            period: this.currentPeriod,
            totalEvents: this.filteredEvents.length,
            events: this.filteredEvents.map(e => ({
                id: e.id,
                name: e.name,
                date: e.date.toISOString(),
                category: e.category,
                importance: e.importance
            }))
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `economic-calendar-${this.currentPeriod}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.closeModal('exportModal');
    }

    downloadCSV() {
        const headers = ['ID', 'Name', 'Date', 'Time', 'Category', 'Importance'];
        const rows = this.filteredEvents.map(e => [
            e.id,
            `"${e.name}"`,
            e.date.toLocaleDateString('en-US'),
            e.date.toLocaleTimeString('en-US'),
            e.category,
            e.importance.toUpperCase()
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `economic-calendar-${this.currentPeriod}-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.closeModal('exportModal');
    }

    downloadPDF() {
        alert('PDF export functionality requires a PDF library. Use JSON or CSV export for now.');
        this.closeModal('exportModal');
    }

    showError(message) {
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = `<div class="eco-error"><i class="fas fa-exclamation-triangle"></i><p>${message}</p></div>`;
    }
}

// ========================================
// INITIALISATION
// ========================================

let economicCalendar;

document.addEventListener('DOMContentLoaded', () => {
    economicCalendar = new EconomicCalendar();
    economicCalendar.init();
});

// Close modals on outside click
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});