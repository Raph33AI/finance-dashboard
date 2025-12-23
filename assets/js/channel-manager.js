/* ============================================
   ALPHAVAULT AI - CHANNEL MANAGER
   Gestion des Channels (Catégories)
   ============================================ */

class ChannelManager {
    constructor() {
        this.channels = [];
        this.activeChannel = 'all';
        this.channelsContainer = document.getElementById('channelsScroll');
    }

    async initialize() {
        try {
            console.log('🎨 Initializing Channel Manager...');
            
            // Initialize channels in Firebase
            this.channels = await window.communityService.initializeChannels();
            
            // Render channels
            this.renderChannels();
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('✅ Channel Manager initialized with', this.channels.length, 'channels');
        } catch (error) {
            console.error('❌ Error initializing channels:', error);
        }
    }

    renderChannels() {
        if (!this.channelsContainer) return;

        const allChannelHTML = `
            <div class="channel-chip active" data-channel="all" style="--channel-gradient: linear-gradient(135deg, #667eea, #764ba2);">
                <span class="channel-icon">🌐</span>
                <span>All Channels</span>
                <span class="channel-count">${this.getTotalPostCount()}</span>
            </div>
        `;

        const channelsHTML = this.channels.map(channel => `
            <div class="channel-chip" data-channel="${channel.id}" style="--channel-gradient: ${channel.gradient};">
                <span class="channel-icon">${channel.icon}</span>
                <span>${channel.name}</span>
                <span class="channel-count">${channel.postCount || 0}</span>
            </div>
        `).join('');

        this.channelsContainer.innerHTML = allChannelHTML + channelsHTML;
    }

    setupEventListeners() {
        if (!this.channelsContainer) return;

        this.channelsContainer.addEventListener('click', (e) => {
            const chip = e.target.closest('.channel-chip');
            if (!chip) return;

            const channelId = chip.dataset.channel;
            this.setActiveChannel(channelId);
        });
    }

    setActiveChannel(channelId) {
        this.activeChannel = channelId;

        // Update UI
        document.querySelectorAll('.channel-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.channel === channelId);
        });

        // Trigger posts reload
        if (window.communityHub) {
            window.communityHub.loadPosts(channelId);
        }

        console.log('📂 Active channel:', channelId);
    }

    getChannel(channelId) {
        return this.channels.find(ch => ch.id === channelId);
    }

    getChannelGradient(channelId) {
        const channel = this.getChannel(channelId);
        return channel ? channel.gradient : 'linear-gradient(135deg, #667eea, #764ba2)';
    }

    getChannelIcon(channelId) {
        const channel = this.getChannel(channelId);
        return channel ? channel.icon : '📄';
    }

    getChannelName(channelId) {
        const channel = this.getChannel(channelId);
        return channel ? channel.name : 'Unknown';
    }

    getTotalPostCount() {
        return this.channels.reduce((sum, ch) => sum + (ch.postCount || 0), 0);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.channelManager = new ChannelManager();
});