/**
 * ════════════════════════════════════════════════════════════════
 * AUTO-NEWSLETTER SYSTEM - Weekly Community Posts
 * Automatically generates and publishes weekly news recap posts
 * ════════════════════════════════════════════════════════════════
 */

class AutoNewsletterSystem {
    constructor() {
        this.NEWSLETTER_INTERVAL_DAYS = 7; // Une semaine
        this.LAST_POST_KEY = 'lastAutoNewsletterPost';
        this.rssClient = null;
        this.communityService = null;
    }

    async initialize() {
        console.log('📰 Initializing Auto-Newsletter System...');

        // Attendre que les services soient disponibles
        await this.waitForServices();

        // Vérifier si un post doit être généré
        await this.checkAndGeneratePost();
    }

    async waitForServices() {
        return new Promise((resolve) => {
            const checkServices = setInterval(() => {
                if (window.RSSClient && window.communityService) {
                    this.rssClient = new RSSClient();
                    this.communityService = window.communityService;
                    clearInterval(checkServices);
                    resolve();
                }
            }, 100);

            // Timeout après 10 secondes
            setTimeout(() => {
                clearInterval(checkServices);
                resolve();
            }, 10000);
        });
    }

    async checkAndGeneratePost() {
        try {
            const lastPostDate = localStorage.getItem(this.LAST_POST_KEY);
            const now = Date.now();
            const daysSinceLastPost = lastPostDate 
                ? (now - parseInt(lastPostDate)) / (1000 * 60 * 60 * 24)
                : 999; // Force first run

            console.log(`📅 Days since last auto-post: ${daysSinceLastPost.toFixed(1)}`);

            if (daysSinceLastPost >= this.NEWSLETTER_INTERVAL_DAYS) {
                console.log('🚀 Time to generate weekly newsletter!');
                await this.generateAndPublishPost();
            } else {
                console.log(`⏳ Next auto-post in ${(this.NEWSLETTER_INTERVAL_DAYS - daysSinceLastPost).toFixed(1)} days`);
            }

        } catch (error) {
            console.error('❌ Error in auto-newsletter check:', error);
        }
    }

    async generateAndPublishPost(forceManual = false) {
        try {
            // 1. Vérifier l'authentification
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                console.error('❌ No user authenticated - cannot post');
                if (forceManual) {
                    this.showNotification('Please log in to generate newsletter', 'error');
                }
                return;
            }

            // 2. Afficher notification de chargement
            this.showNotification('📰 Generating weekly newsletter...', 'info');

            // 3. Charger les news de la semaine
            console.log('📡 Fetching news from last 7 days...');
            const newsData = await this.rssClient.getAllArticles({
                maxPerSource: 50
            });

            // 4. Filtrer les news de la semaine
            const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const weeklyNews = newsData.articles.filter(article => 
                article.timestamp >= weekAgo
            );

            console.log(`📊 Found ${weeklyNews.length} articles from last 7 days`);

            if (weeklyNews.length === 0) {
                console.warn('⚠ No news to publish');
                if (forceManual) {
                    this.showNotification('No news found for the week', 'warning');
                }
                return;
            }

            // 5. Sélectionner les top news (critères : importance, engagement)
            const topNews = this.selectTopNews(weeklyNews, 10);

            // 6. Générer le contenu du post
            const postContent = this.generatePostContent(topNews);

            // 7. Publier le post
            const postData = {
                title: `📰 Weekly Market Recap - ${this.getWeekRange()}`,
                content: postContent.markdown,
                channelId: '📰 News & Events', // Adapter selon vos channels
                tags: ['newsletter', 'weekly-recap', 'market-news', ...this.extractTopTags(topNews)],
                images: this.extractTopImages(topNews),
                authorId: currentUser.uid,
                authorName: currentUser.displayName || 'AlphaVault AI',
                authorPhoto: currentUser.photoURL || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                views: 0,
                likes: [],
                commentsCount: 0,
                isPinned: true, // ⭐ Épingler le post
                isAutoGenerated: true
            };

            console.log('📤 Publishing post to Firestore...');
            const docRef = await firebase.firestore().collection('posts').add(postData);
            
            console.log(`✅ Post published successfully! ID: ${docRef.id}`);

            // 8. Mettre à jour la date du dernier post
            localStorage.setItem(this.LAST_POST_KEY, Date.now().toString());

            // 9. Notification de succès
            this.showNotification(`✅ Weekly newsletter published! (${topNews.length} news)`, 'success');

            // 10. Recharger les posts si on est sur community-hub
            if (window.communityHub) {
                await window.communityHub.loadPosts();
            }

        } catch (error) {
            console.error('❌ Error generating newsletter:', error);
            this.showNotification('Failed to generate newsletter: ' + error.message, 'error');
        }
    }

    selectTopNews(articles, limit = 10) {
        // Trier par importance (combinaison de plusieurs critères)
        return articles
            .map(article => ({
                ...article,
                importance: this.calculateImportance(article)
            }))
            .sort((a, b) => b.importance - a.importance)
            .slice(0, limit);
    }

    calculateImportance(article) {
        let score = 0;

        // Sources premium
        if (article.source.includes('cnbc-earnings')) score += 15;
        if (article.source.includes('marketwatch-realtime')) score += 12;
        if (article.source.includes('wsj')) score += 10;
        if (article.source.includes('bloomberg')) score += 10;
        if (article.source.includes('financial-times')) score += 10;

        // Tickers mentionnés
        score += article.tickers.length * 8;

        // Image disponible
        if (article.image) score += 5;

        // Longueur du titre (ni trop court, ni trop long)
        const titleLength = article.title.length;
        if (titleLength >= 40 && titleLength <= 100) score += 5;

        // Mots-clés importants
        const text = (article.title + ' ' + article.description).toLowerCase();
        const keywords = ['earnings', 'ipo', 'merger', 'acquisition', 'breakthrough', 
                         'record', 'surge', 'plunge', 'federal reserve', 'fed', 'inflation'];
        keywords.forEach(keyword => {
            if (text.includes(keyword)) score += 7;
        });

        // Récence (bonus pour les news très récentes)
        const hoursOld = (Date.now() - article.timestamp) / (1000 * 60 * 60);
        if (hoursOld < 24) score += 5;

        return score;
    }

    generatePostContent(topNews) {
        const weekRange = this.getWeekRange();
        
        let markdown = `# 📊 Weekly Market Intelligence\n\n`;
        markdown += `**Period:** ${weekRange}\n\n`;
        markdown += `---\n\n`;
        markdown += `## 🔥 Top Stories of the Week\n\n`;

        topNews.forEach((news, index) => {
            markdown += `### ${index + 1}. ${news.title}\n\n`;
            
            if (news.description) {
                markdown += `${news.description}\n\n`;
            }

            // Tickers
            if (news.tickers.length > 0) {
                markdown += `**Tickers:** ${news.tickers.map(t => `\`${t}\``).join(', ')}\n\n`;
            }

            // Source et lien
            markdown += `📰 *Source: [${news.sourceName}](${news.link})*\n\n`;
            markdown += `---\n\n`;
        });

        // Statistiques de la semaine
        markdown += `## 📈 This Week in Numbers\n\n`;
        markdown += `- **Total News Analyzed:** ${topNews.length}\n`;
        markdown += `- **Companies Mentioned:** ${this.countUniqueTickers(topNews)}\n`;
        markdown += `- **Top Sectors:** ${this.getTopSectors(topNews).join(', ')}\n\n`;
        
        markdown += `---\n\n`;
        markdown += `*📌 This newsletter is auto-generated by AlphaVault AI based on market data analysis.*\n`;
        markdown += `*Stay informed, stay ahead! 🚀*`;

        return {
            markdown,
            html: this.markdownToHtml(markdown) // Optionnel
        };
    }

    getWeekRange() {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${weekAgo.toLocaleDateString('en-US', options)} - ${now.toLocaleDateString('en-US', options)}`;
    }

    countUniqueTickers(articles) {
        const tickers = new Set();
        articles.forEach(article => {
            article.tickers.forEach(ticker => tickers.add(ticker));
        });
        return tickers.size;
    }

    getTopSectors(articles) {
        const sectorCount = {};
        
        articles.forEach(article => {
            const sector = this.detectSector(article);
            sectorCount[sector] = (sectorCount[sector] || 0) + 1;
        });

        return Object.entries(sectorCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([sector]) => sector.charAt(0).toUpperCase() + sector.slice(1));
    }

    detectSector(article) {
        const text = (article.title + ' ' + article.description).toLowerCase();
        
        if (text.match(/\b(tech|software|ai|semiconductor)\b/i)) return 'technology';
        if (text.match(/\b(bank|finance|fed|interest)\b/i)) return 'finance';
        if (text.match(/\b(oil|energy|gas|renewable)\b/i)) return 'energy';
        if (text.match(/\b(healthcare|pharma|drug)\b/i)) return 'healthcare';
        if (text.match(/\b(consumer|retail)\b/i)) return 'consumer';
        
        return 'general';
    }

    extractTopTags(articles) {
        const tagCount = {};
        
        articles.forEach(article => {
            article.tickers.slice(0, 2).forEach(ticker => {
                tagCount[ticker.toLowerCase()] = (tagCount[ticker.toLowerCase()] || 0) + 1;
            });
        });

        return Object.entries(tagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag]) => tag);
    }

    extractTopImages(articles) {
        return articles
            .filter(a => a.image)
            .slice(0, 3)
            .map(a => a.image);
    }

    markdownToHtml(markdown) {
        // Conversion basique markdown -> HTML
        return markdown
            .replace(/### (.*)/g, '<h3>$1</h3>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^(.*)$/gm, '<p>$1</p>')
            .replace(/<p>---<\/p>/g, '<hr>');
    }

    showNotification(message, type = 'info') {
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #667eea, #764ba2)'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-weight: 600;
            max-width: 400px;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Méthode publique pour forcer la génération manuelle
    async forceGenerate() {
        console.log('🔧 Manual newsletter generation triggered');
        await this.generateAndPublishPost(true);
    }
}

// ════════════════════════════════════════════════════════════════
// INITIALISATION AUTOMATIQUE
// ════════════════════════════════════════════════════════════════

window.autoNewsletterSystem = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Attendre Firebase Auth
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log('✅ User authenticated - initializing auto-newsletter');
            window.autoNewsletterSystem = new AutoNewsletterSystem();
            await window.autoNewsletterSystem.initialize();
        }
    });
});

// Animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);