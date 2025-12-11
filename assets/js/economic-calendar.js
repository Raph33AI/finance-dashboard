/**
 * ====================================================================
 * ALPHAVAULT AI - ECONOMIC CALENDAR
 * ====================================================================
 * Calendrier des publications économiques avec dates de sortie FRED
 */

class EconomicCalendar {
    constructor() {
        this.allEvents = [];
        this.filteredEvents = [];
    }

    async init() {
        console.log('📅 Initializing Economic Calendar...');
        
        try {
            await this.loadEvents();
            await this.loadReleaseFrequencyChart();
            
            console.log('✅ Economic Calendar loaded');
            
        } catch (error) {
            console.error('❌ Economic Calendar error:', error);
        }
    }

    /**
     * ========================================
     * LOAD EVENTS
     * ========================================
     */
    async loadEvents() {
        const grid = document.getElementById('calendarGrid');
        grid.innerHTML = '<div class="eco-loading"><div class="eco-spinner"></div><p>Loading economic events...</p></div>';

        try {
            // Récupérer les dates de publication FRED
            const releaseDates = await economicDataClient.getReleasesDates({
                limit: 100,
                sort_order: 'asc'
            });

            console.log('📊 Release dates:', releaseDates);

            // Transformer en événements
            this.allEvents = releaseDates.data.release_dates.map(release => ({
                id: release.release_id,
                name: release.release_name || 'Economic Release',
                date: new Date(release.date),
                region: 'US', // FRED = US
                importance: this.determineImportance(release.release_name),
                category: this.determineCategory(release.release_name)
            }));

            // Ajouter des événements ECB simulés
            this.addECBEvents();

            // Trier par date
            this.allEvents.sort((a, b) => a.date - b.date);

            // Appliquer les filtres
            this.filterEvents();

        } catch (error) {
            console.error('❌ Error loading events:', error);
            grid.innerHTML = '<div class="eco-error">Error loading economic calendar</div>';
        }
    }

    /**
     * Ajouter des événements ECB (simulés)
     */
    addECBEvents() {
        const today = new Date();
        
        // ECB Meeting (généralement tous les 6 semaines)
        for (let i = 0; i < 6; i++) {
            const meetingDate = new Date(today);
            meetingDate.setDate(meetingDate.getDate() + (i * 42)); // ~6 semaines
            
            this.allEvents.push({
                id: `ecb-meeting-${i}`,
                name: 'ECB Monetary Policy Meeting',
                date: meetingDate,
                region: 'EU',
                importance: 'high',
                category: 'Monetary Policy'
            });
        }

        // Inflation Reports (mensuel)
        for (let i = 0; i < 3; i++) {
            const inflationDate = new Date(today);
            inflationDate.setMonth(inflationDate.getMonth() + i);
            inflationDate.setDate(15); // Mi-mois
            
            this.allEvents.push({
                id: `ecb-inflation-${i}`,
                name: 'Eurozone HICP Inflation',
                date: inflationDate,
                region: 'EU',
                importance: 'high',
                category: 'Inflation'
            });
        }
    }

    /**
     * Déterminer l'importance
     */
    determineImportance(name) {
        const highImpact = ['employment', 'gdp', 'cpi', 'fed', 'interest', 'inflation', 'payroll', 'unemployment'];
        const mediumImpact = ['retail', 'manufacturing', 'housing', 'consumer', 'sentiment'];
        
        const lowerName = (name || '').toLowerCase();
        
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
        const lowerName = (name || '').toLowerCase();
        
        if (lowerName.includes('employment') || lowerName.includes('payroll') || lowerName.includes('unemployment')) {
            return 'Employment';
        } else if (lowerName.includes('gdp') || lowerName.includes('growth')) {
            return 'GDP';
        } else if (lowerName.includes('cpi') || lowerName.includes('inflation') || lowerName.includes('price')) {
            return 'Inflation';
        } else if (lowerName.includes('fed') || lowerName.includes('interest') || lowerName.includes('rate')) {
            return 'Monetary Policy';
        } else if (lowerName.includes('retail') || lowerName.includes('sales')) {
            return 'Retail';
        } else if (lowerName.includes('manufacturing') || lowerName.includes('production')) {
            return 'Manufacturing';
        } else if (lowerName.includes('housing') || lowerName.includes('construction')) {
            return 'Housing';
        }
        return 'Other';
    }

    /**
     * Filtrer les événements
     */
    filterEvents() {
        const regionFilter = document.getElementById('regionFilter').value;
        const importanceFilter = document.getElementById('importanceFilter').value;

        this.filteredEvents = this.allEvents.filter(event => {
            if (regionFilter !== 'all' && event.region !== regionFilter) return false;
            if (importanceFilter !== 'all' && event.importance !== importanceFilter) return false;
            return true;
        });

        this.displayEvents();
    }

    /**
     * Afficher les événements
     */
    displayEvents() {
        const grid = document.getElementById('calendarGrid');

        if (this.filteredEvents.length === 0) {
            grid.innerHTML = '<div class="eco-no-data">No economic events found for the selected filters</div>';
            return;
        }

        const eventsHTML = this.filteredEvents.slice(0, 50).map(event => {
            const day = event.date.getDate();
            const month = event.date.toLocaleDateString('en-US', { month: 'short' });
            const time = event.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            
            return `
                <div class='calendar-event ${event.importance}-importance'>
                    <div class='calendar-date'>
                        <div class='calendar-day'>${day}</div>
                        <div class='calendar-month'>${month}</div>
                    </div>
                    
                    <div class='calendar-event-info'>
                        <h4>${event.name}</h4>
                        <div class='calendar-event-country'>${event.region === 'US' ? '🇺🇸 United States' : '🇪🇺 European Union'} • ${event.category}</div>
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
     * RELEASE FREQUENCY CHART
     * ========================================
     */
    async loadReleaseFrequencyChart() {
        try {
            // Compter les événements par catégorie
            const categoryCounts = {};
            
            this.allEvents.forEach(event => {
                categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
            });

            const categories = Object.keys(categoryCounts);
            const counts = Object.values(categoryCounts);

            Highcharts.chart('releaseFrequencyChart', {
                chart: { 
                    type: 'column', 
                    backgroundColor: 'transparent'
                },
                title: { 
                    text: 'Economic Releases by Category',
                    style: { color: 'var(--text-primary)', fontWeight: '800' }
                },
                xAxis: { 
                    categories: categories,
                    labels: { 
                        style: { color: 'var(--text-secondary)' },
                        rotation: -45
                    }
                },
                yAxis: { 
                    title: { text: 'Number of Releases', style: { color: 'var(--text-secondary)' } },
                    labels: { style: { color: 'var(--text-secondary)' } },
                    gridLineColor: 'var(--border-color)'
                },
                tooltip: {
                    valueDecimals: 0
                },
                plotOptions: {
                    column: {
                        colorByPoint: true,
                        dataLabels: {
                            enabled: true,
                            style: { fontWeight: 'bold' }
                        }
                    }
                },
                series: [{
                    name: 'Releases',
                    data: counts,
                    showInLegend: false
                }],
                credits: { enabled: false }
            });

        } catch (error) {
            console.error('❌ Error loading frequency chart:', error);
        }
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