// /**
//  * ════════════════════════════════════════════════════════════════
//  * AUTO-NEWSLETTER SYSTEM - Weekly Community Posts
//  * Automatically generates and publishes weekly news recap posts
//  * ════════════════════════════════════════════════════════════════
//  */

// class AutoNewsletterSystem {
//     constructor() {
//         this.NEWSLETTER_INTERVAL_DAYS = 7; // Une semaine
//         this.LAST_POST_KEY = 'lastAutoNewsletterPost';
//         this.rssClient = null;
//         this.communityService = null;
//     }

//     async initialize() {
//         console.log('📰 Initializing Auto-Newsletter System...');

//         // Attendre que les services soient disponibles
//         await this.waitForServices();

//         // ✅ CORRECTION : Vérifier que rssClient est bien initialisé
//         if (!this.rssClient) {
//             console.error('❌ RSSClient not available - cannot generate newsletter');
//             return;
//         }

//         // Vérifier si un post doit être généré
//         await this.checkAndGeneratePost();
//     }

//     async waitForServices() {
//         return new Promise((resolve) => {
//             let attempts = 0;
//             const maxAttempts = 50; // 5 secondes max

//             const checkServices = setInterval(() => {
//                 attempts++;

//                 // ✅ OPTION 1 : Utiliser l'instance existante de newsTerminal
//                 if (window.newsTerminal && window.newsTerminal.rssClient) {
//                     console.log('✅ Using existing newsTerminal.rssClient');
//                     this.rssClient = window.newsTerminal.rssClient;
//                     this.communityService = window.communityService;
//                     clearInterval(checkServices);
//                     resolve();
//                     return;
//                 }

//                 // ✅ OPTION 2 : Créer notre propre instance si RSSClient existe
//                 if (window.RSSClient && window.communityService) {
//                     console.log('✅ Creating new RSSClient instance');
//                     this.rssClient = new RSSClient();
//                     this.communityService = window.communityService;
//                     clearInterval(checkServices);
//                     resolve();
//                     return;
//                 }

//                 // Timeout après maxAttempts
//                 if (attempts >= maxAttempts) {
//                     console.warn('⚠ Services not available after 5s - skipping auto-newsletter');
//                     clearInterval(checkServices);
//                     resolve();
//                 }
//             }, 100);
//         });
//     }

//     async checkAndGeneratePost() {
//         try {
//             const lastPostDate = localStorage.getItem(this.LAST_POST_KEY);
//             const now = Date.now();
//             const daysSinceLastPost = lastPostDate 
//                 ? (now - parseInt(lastPostDate)) / (1000 * 60 * 60 * 24)
//                 : 999; // Force first run

//             console.log(`📅 Days since last auto-post: ${daysSinceLastPost.toFixed(1)}`);

//             if (daysSinceLastPost >= this.NEWSLETTER_INTERVAL_DAYS) {
//                 console.log('🚀 Time to generate weekly newsletter!');
//                 await this.generateAndPublishPost();
//             } else {
//                 console.log(`⏳ Next auto-post in ${(this.NEWSLETTER_INTERVAL_DAYS - daysSinceLastPost).toFixed(1)} days`);
//             }

//         } catch (error) {
//             console.error('❌ Error in auto-newsletter check:', error);
//         }
//     }

//     async generateAndPublishPost(forceManual = false) {
//         try {
//             // 1. Vérifier l'authentification
//             const currentUser = firebase.auth().currentUser;
//             if (!currentUser) {
//                 console.error('❌ No user authenticated - cannot post');
//                 if (forceManual) {
//                     this.showNotification('Please log in to generate newsletter', 'error');
//                 }
//                 return;
//             }

//             // 2. Afficher notification de chargement
//             this.showNotification('📰 Generating weekly newsletter...', 'info');

//             // 3. Charger les news de la semaine
//             console.log('📡 Fetching news from last 7 days...');
//             const newsData = await this.rssClient.getAllArticles({
//                 maxPerSource: 50
//             });

//             // 4. Filtrer les news de la semaine
//             const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
//             const weeklyNews = newsData.articles.filter(article => 
//                 article.timestamp >= weekAgo
//             );

//             console.log(`📊 Found ${weeklyNews.length} articles from last 7 days`);

//             if (weeklyNews.length === 0) {
//                 console.warn('⚠ No news to publish');
//                 if (forceManual) {
//                     this.showNotification('No news found for the week', 'warning');
//                 }
//                 return;
//             }

//             // 5. Sélectionner les top news (critères : importance, engagement)
//             const topNews = this.selectTopNews(weeklyNews, 10);

//             // 6. Générer le contenu du post
//             const postContent = this.generatePostContent(topNews);

//             // 7. Publier le post
//             const postData = {
//                 title: `📰 Weekly Market Recap - ${this.getWeekRange()}`,
//                 content: postContent.markdown,
//                 channelId: '📰 News & Events', // Adapter selon vos channels
//                 tags: ['newsletter', 'weekly-recap', 'market-news', ...this.extractTopTags(topNews)],
//                 images: this.extractTopImages(topNews),
//                 authorId: currentUser.uid,
//                 authorName: currentUser.displayName || 'AlphaVault AI',
//                 authorPhoto: currentUser.photoURL || '',
//                 createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//                 views: 0,
//                 likes: [],
//                 commentsCount: 0,
//                 isPinned: true, // ⭐ Épingler le post
//                 isAutoGenerated: true
//             };

//             console.log('📤 Publishing post to Firestore...');
//             const docRef = await firebase.firestore().collection('posts').add(postData);
            
//             console.log(`✅ Post published successfully! ID: ${docRef.id}`);

//             // 8. Mettre à jour la date du dernier post
//             localStorage.setItem(this.LAST_POST_KEY, Date.now().toString());

//             // 9. Notification de succès
//             this.showNotification(`✅ Weekly newsletter published! (${topNews.length} news)`, 'success');

//             // 10. Recharger les posts si on est sur community-hub
//             if (window.communityHub) {
//                 await window.communityHub.loadPosts();
//             }

//         } catch (error) {
//             console.error('❌ Error generating newsletter:', error);
//             this.showNotification('Failed to generate newsletter: ' + error.message, 'error');
//         }
//     }

//     selectTopNews(articles, limit = 10) {
//         // Trier par importance (combinaison de plusieurs critères)
//         return articles
//             .map(article => ({
//                 ...article,
//                 importance: this.calculateImportance(article)
//             }))
//             .sort((a, b) => b.importance - a.importance)
//             .slice(0, limit);
//     }

//     calculateImportance(article) {
//         let score = 0;

//         // Sources premium
//         if (article.source.includes('cnbc-earnings')) score += 15;
//         if (article.source.includes('marketwatch-realtime')) score += 12;
//         if (article.source.includes('wsj')) score += 10;
//         if (article.source.includes('bloomberg')) score += 10;
//         if (article.source.includes('financial-times')) score += 10;

//         // Tickers mentionnés
//         score += article.tickers.length * 8;

//         // Image disponible
//         if (article.image) score += 5;

//         // Longueur du titre (ni trop court, ni trop long)
//         const titleLength = article.title.length;
//         if (titleLength >= 40 && titleLength <= 100) score += 5;

//         // Mots-clés importants
//         const text = (article.title + ' ' + article.description).toLowerCase();
//         const keywords = ['earnings', 'ipo', 'merger', 'acquisition', 'breakthrough', 
//                          'record', 'surge', 'plunge', 'federal reserve', 'fed', 'inflation'];
//         keywords.forEach(keyword => {
//             if (text.includes(keyword)) score += 7;
//         });

//         // Récence (bonus pour les news très récentes)
//         const hoursOld = (Date.now() - article.timestamp) / (1000 * 60 * 60);
//         if (hoursOld < 24) score += 5;

//         return score;
//     }

//     generatePostContent(topNews) {
//         const weekRange = this.getWeekRange();
        
//         let markdown = `# 📊 Weekly Market Intelligence\n\n`;
//         markdown += `**Period:** ${weekRange}\n\n`;
//         markdown += `---\n\n`;
//         markdown += `## 🔥 Top Stories of the Week\n\n`;

//         topNews.forEach((news, index) => {
//             markdown += `### ${index + 1}. ${news.title}\n\n`;
            
//             if (news.description) {
//                 markdown += `${news.description}\n\n`;
//             }

//             // Tickers
//             if (news.tickers.length > 0) {
//                 markdown += `**Tickers:** ${news.tickers.map(t => `\`${t}\``).join(', ')}\n\n`;
//             }

//             // Source et lien
//             markdown += `📰 *Source: [${news.sourceName}](${news.link})*\n\n`;
//             markdown += `---\n\n`;
//         });

//         // Statistiques de la semaine
//         markdown += `## 📈 This Week in Numbers\n\n`;
//         markdown += `- **Total News Analyzed:** ${topNews.length}\n`;
//         markdown += `- **Companies Mentioned:** ${this.countUniqueTickers(topNews)}\n`;
//         markdown += `- **Top Sectors:** ${this.getTopSectors(topNews).join(', ')}\n\n`;
        
//         markdown += `---\n\n`;
//         markdown += `*📌 This newsletter is auto-generated by AlphaVault AI based on market data analysis.*\n`;
//         markdown += `*Stay informed, stay ahead! 🚀*`;

//         return {
//             markdown,
//             html: this.markdownToHtml(markdown) // Optionnel
//         };
//     }

//     getWeekRange() {
//         const now = new Date();
//         const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
//         const options = { month: 'short', day: 'numeric', year: 'numeric' };
//         return `${weekAgo.toLocaleDateString('en-US', options)} - ${now.toLocaleDateString('en-US', options)}`;
//     }

//     countUniqueTickers(articles) {
//         const tickers = new Set();
//         articles.forEach(article => {
//             article.tickers.forEach(ticker => tickers.add(ticker));
//         });
//         return tickers.size;
//     }

//     getTopSectors(articles) {
//         const sectorCount = {};
        
//         articles.forEach(article => {
//             const sector = this.detectSector(article);
//             sectorCount[sector] = (sectorCount[sector] || 0) + 1;
//         });

//         return Object.entries(sectorCount)
//             .sort((a, b) => b[1] - a[1])
//             .slice(0, 3)
//             .map(([sector]) => sector.charAt(0).toUpperCase() + sector.slice(1));
//     }

//     detectSector(article) {
//         const text = (article.title + ' ' + article.description).toLowerCase();
        
//         if (text.match(/\b(tech|software|ai|semiconductor)\b/i)) return 'technology';
//         if (text.match(/\b(bank|finance|fed|interest)\b/i)) return 'finance';
//         if (text.match(/\b(oil|energy|gas|renewable)\b/i)) return 'energy';
//         if (text.match(/\b(healthcare|pharma|drug)\b/i)) return 'healthcare';
//         if (text.match(/\b(consumer|retail)\b/i)) return 'consumer';
        
//         return 'general';
//     }

//     extractTopTags(articles) {
//         const tagCount = {};
        
//         articles.forEach(article => {
//             article.tickers.slice(0, 2).forEach(ticker => {
//                 tagCount[ticker.toLowerCase()] = (tagCount[ticker.toLowerCase()] || 0) + 1;
//             });
//         });

//         return Object.entries(tagCount)
//             .sort((a, b) => b[1] - a[1])
//             .slice(0, 5)
//             .map(([tag]) => tag);
//     }

//     extractTopImages(articles) {
//         return articles
//             .filter(a => a.image)
//             .slice(0, 3)
//             .map(a => a.image);
//     }

//     markdownToHtml(markdown) {
//         // Conversion basique markdown -> HTML
//         return markdown
//             .replace(/### (.*)/g, '<h3>$1</h3>')
//             .replace(/## (.*)/g, '<h2>$1</h2>')
//             .replace(/# (.*)/g, '<h1>$1</h1>')
//             .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//             .replace(/\*(.*?)\*/g, '<em>$1</em>')
//             .replace(/`(.*?)`/g, '<code>$1</code>')
//             .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
//             .replace(/\n\n/g, '</p><p>')
//             .replace(/^(.*)$/gm, '<p>$1</p>')
//             .replace(/<p>---<\/p>/g, '<hr>');
//     }

//     showNotification(message, type = 'info') {
//         const colors = {
//             success: 'linear-gradient(135deg, #10b981, #059669)',
//             warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
//             error: 'linear-gradient(135deg, #ef4444, #dc2626)',
//             info: 'linear-gradient(135deg, #667eea, #764ba2)'
//         };
        
//         const notification = document.createElement('div');
//         notification.style.cssText = `
//             position: fixed;
//             top: 20px;
//             right: 20px;
//             background: ${colors[type] || colors.info};
//             color: white;
//             padding: 16px 24px;
//             border-radius: 12px;
//             box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
//             z-index: 10000;
//             font-weight: 600;
//             max-width: 400px;
//             animation: slideInRight 0.3s ease;
//         `;
//         notification.textContent = message;
        
//         document.body.appendChild(notification);
        
//         setTimeout(() => {
//             notification.style.animation = 'slideOutRight 0.3s ease';
//             setTimeout(() => notification.remove(), 300);
//         }, 5000);
//     }

//     // Méthode publique pour forcer la génération manuelle
//     async forceGenerate() {
//         console.log('🔧 Manual newsletter generation triggered');
//         await this.generateAndPublishPost(true);
//     }
// }

// // ════════════════════════════════════════════════════════════════
// // INITIALISATION MANUELLE UNIQUEMENT
// // ════════════════════════════════════════════════════════════════

// window.autoNewsletterSystem = null;

// // ✅ Fonction pour initialiser à la demande
// async function initAutoNewsletter() {
//     if (!window.autoNewsletterSystem) {
//         console.log('📰 Initializing Auto-Newsletter System (manual)...');
//         window.autoNewsletterSystem = new AutoNewsletterSystem();
        
//         // Initialiser les services manuellement
//         if (window.newsTerminal && window.newsTerminal.rssClient) {
//             window.autoNewsletterSystem.rssClient = window.newsTerminal.rssClient;
//         } else if (typeof window.RSSClient === 'function') {
//             window.autoNewsletterSystem.rssClient = new window.RSSClient();
//         }
        
//         window.autoNewsletterSystem.communityService = window.communityService;
//     }
    
//     return window.autoNewsletterSystem;
// }

// // ✅ Fonction pour forcer la génération (appelée par le bouton)
// async function generateWeeklyNewsletter() {
//     try {
//         const system = await initAutoNewsletter();
        
//         if (!system.rssClient) {
//             alert('⚠ RSS Client not available. Please make sure news-terminal.js is loaded.');
//             return;
//         }
        
//         if (!firebase.auth().currentUser) {
//             alert('⚠ Please log in to generate newsletter');
//             return;
//         }
        
//         await system.generateAndPublishPost(true);
        
//     } catch (error) {
//         console.error('❌ Error generating newsletter:', error);
//         alert('Failed to generate newsletter: ' + error.message);
//     }
// }

// // ✅ Exposition globale
// window.generateWeeklyNewsletter = generateWeeklyNewsletter;

// // ✅ Auto-check optionnel (commenté par défaut)
// /*
// document.addEventListener('DOMContentLoaded', async () => {
//     firebase.auth().onAuthStateChanged(async (user) => {
//         if (user) {
//             const system = await initAutoNewsletter();
//             if (system.rssClient) {
//                 await system.checkAndGeneratePost();
//             }
//         }
//     });
// });
// */

/**
 * ════════════════════════════════════════════════════════════════
 * AUTO-NEWSLETTER SYSTEM V2.0 - Ultra-Aesthetic Edition
 * Weekly Market Intelligence - Premium Design
 * ════════════════════════════════════════════════════════════════
 */

class AutoNewsletterSystem {
    constructor() {
        this.NEWSLETTER_INTERVAL_DAYS = 7;
        this.LAST_POST_KEY = 'lastAutoNewsletterPost';
        this.LAST_POST_WEEK_KEY = 'lastAutoNewsletterWeek'; // ✅ NOUVEAU
        this.TARGET_DAY = 5; // 0=Dimanche, 5=Vendredi
        this.TARGET_HOUR = 8; // 8h du matin
        this.rssClient = null;
        this.communityService = null;
    }

    async initialize() {
        console.log('📰 Initializing Auto-Newsletter System V2.0...');

        await this.waitForServices();

        if (!this.rssClient) {
            console.error('❌ RSSClient not available - cannot generate newsletter');
            return;
        }

        // ✅ Vérifier si on doit générer (vendredi uniquement)
        await this.checkFridaySchedule();
    }

    async waitForServices() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50;

            const checkServices = setInterval(() => {
                attempts++;

                if (window.newsTerminal && window.newsTerminal.rssClient) {
                    console.log('✅ Using existing newsTerminal.rssClient');
                    this.rssClient = window.newsTerminal.rssClient;
                    this.communityService = window.communityService;
                    clearInterval(checkServices);
                    resolve();
                    return;
                }

                if (window.RSSClient && window.communityService) {
                    console.log('✅ Creating new RSSClient instance');
                    this.rssClient = new RSSClient();
                    this.communityService = window.communityService;
                    clearInterval(checkServices);
                    resolve();
                    return;
                }

                if (attempts >= maxAttempts) {
                    console.warn('⚠ Services not available after 5s - skipping auto-newsletter');
                    clearInterval(checkServices);
                    resolve();
                }
            }, 100);
        });
    }

    // ✅ NOUVEAU : Logique de déclenchement automatique le vendredi
    async checkFridaySchedule() {
        try {
            const now = new Date();
            const currentDay = now.getDay(); // 0-6 (0=Dimanche, 5=Vendredi)
            const currentHour = now.getHours();
            const currentWeek = this.getWeekNumber(now);
            const lastWeek = localStorage.getItem(this.LAST_POST_WEEK_KEY);

            console.log(`📅 Current: ${this.getDayName(currentDay)} ${currentHour}h - Week ${currentWeek}`);
            console.log(`📅 Last post: Week ${lastWeek || 'never'}`);

            // Vérifier si on est vendredi ET qu'on n'a pas déjà posté cette semaine
            if (currentDay === this.TARGET_DAY && currentWeek !== lastWeek) {
                console.log(`🎯 It's Friday (Week ${currentWeek})!`);
                
                // Si on est vendredi et après 8h, générer
                if (currentHour >= this.TARGET_HOUR) {
                    console.log('🚀 Generating weekly newsletter (Friday auto-trigger)!');
                    await this.generateAndPublishPost();
                } else {
                    console.log(`⏰ Waiting for ${this.TARGET_HOUR}h (currently ${currentHour}h)`);
                }
            } else if (currentWeek === lastWeek) {
                console.log(`✅ Newsletter already posted this week (Week ${currentWeek})`);
            } else {
                const daysUntilFriday = (this.TARGET_DAY - currentDay + 7) % 7;
                console.log(`⏳ Next newsletter in ${daysUntilFriday} days (next Friday)`);
            }

        } catch (error) {
            console.error('❌ Error in Friday schedule check:', error);
        }
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    getDayName(day) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day];
    }

    async generateAndPublishPost(forceManual = false) {
        try {
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                console.error('❌ No user authenticated - cannot post');
                if (forceManual) {
                    this.showNotification('Please log in to generate newsletter', 'error');
                }
                return;
            }

            this.showNotification('📰 Generating premium newsletter...', 'info');

            console.log('📡 Fetching news from last 7 days...');
            const newsData = await this.rssClient.getAllArticles({
                maxPerSource: 100 // ✅ Plus de news pour meilleure sélection
            });

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

            // ✅ Sélectionner plus de news pour catégorisation
            const topNews = this.selectTopNews(weeklyNews, 15);
            const categorizedNews = this.categorizeNews(topNews);

            // ✅ Générer le contenu premium
            const postContent = this.generatePremiumContent(categorizedNews, topNews);

            // ✅ CORRECTION : Utiliser l'ID du channel (sans emoji)
            // Vérifiez dans Firestore > channels > documents pour trouver le bon ID
            const postData = {
                title: `🎯 Weekly Market Intelligence - ${this.getWeekRange()}`,
                content: postContent.markdown,
                channelId: 'news-events', // ✅ ID sans emoji (à vérifier dans votre Firestore)
                tags: ['newsletter', 'weekly-recap', 'market-intelligence', 'premium', ...this.extractTopTags(topNews)],
                images: this.extractTopImages(topNews),
                authorId: currentUser.uid,
                authorName: 'AlphaVault AI',
                authorPhoto: currentUser.photoURL || 'https://ui-avatars.com/api/?name=AlphaVault+AI&background=667eea&color=fff&bold=true',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                views: 0,
                likes: [],
                commentsCount: 0,
                isPinned: true,
                isAutoGenerated: true,
                newsletterWeek: this.getWeekNumber(new Date()) // ✅ Traçabilité
            };

            console.log('📤 Publishing premium post to Firestore...');
            const docRef = await firebase.firestore().collection('posts').add(postData);
            
            console.log(`✅ Post published successfully! ID: ${docRef.id}`);

            // ✅ Mettre à jour la semaine du dernier post
            const currentWeek = this.getWeekNumber(new Date());
            localStorage.setItem(this.LAST_POST_KEY, Date.now().toString());
            localStorage.setItem(this.LAST_POST_WEEK_KEY, currentWeek.toString());

            this.showNotification(`✅ Premium newsletter published! (${topNews.length} news)`, 'success');

            if (window.communityHub) {
                await window.communityHub.loadPosts();
            }

        } catch (error) {
            console.error('❌ Error generating newsletter:', error);
            this.showNotification('Failed to generate newsletter: ' + error.message, 'error');
        }
    }

    selectTopNews(articles, limit = 15) {
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

        score += article.tickers.length * 8;
        if (article.image) score += 5;

        const titleLength = article.title.length;
        if (titleLength >= 40 && titleLength <= 100) score += 5;

        const text = (article.title + ' ' + article.description).toLowerCase();
        const keywords = ['earnings', 'ipo', 'merger', 'acquisition', 'breakthrough', 
                         'record', 'surge', 'plunge', 'federal reserve', 'fed', 'inflation',
                         'ai', 'layoffs', 'partnership', 'ceo', 'revenue'];
        keywords.forEach(keyword => {
            if (text.includes(keyword)) score += 7;
        });

        const hoursOld = (Date.now() - article.timestamp) / (1000 * 60 * 60);
        if (hoursOld < 24) score += 5;

        return score;
    }

    // ✅ NOUVEAU : Catégorisation intelligente des news
    categorizeNews(news) {
        const categories = {
            breaking: [],    // 🔥 Breaking (< 48h)
            earnings: [],    // 📊 Earnings
            tech: [],        // 💻 Tech
            finance: [],     // 💰 Finance
            market: [],      // 📈 Market Moves
            other: []
        };

        news.forEach(article => {
            const text = (article.title + ' ' + article.description).toLowerCase();
            const hoursOld = (Date.now() - article.timestamp) / (1000 * 60 * 60);

            if (hoursOld < 48) {
                categories.breaking.push(article);
            } else if (text.match(/\b(earnings|eps|revenue|profit|quarterly)\b/i)) {
                categories.earnings.push(article);
            } else if (text.match(/\b(tech|ai|software|semiconductor|innovation)\b/i)) {
                categories.tech.push(article);
            } else if (text.match(/\b(bank|fed|interest|inflation|finance)\b/i)) {
                categories.finance.push(article);
            } else if (text.match(/\b(stock|market|index|trading|surge|plunge)\b/i)) {
                categories.market.push(article);
            } else {
                categories.other.push(article);
            }
        });

        return categories;
    }

    // ✅ NOUVEAU : Génération de contenu premium ultra-esthétique
    generatePremiumContent(categorizedNews, allNews) {
        const weekRange = this.getWeekRange();
        
        let md = '';

        // ═══════════════════════════════════════════════════════
        // 🎯 BANNIÈRE PREMIUM
        // ═══════════════════════════════════════════════════════
        md += `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 20px; text-align: center; color: white; margin-bottom: 30px; box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);">\n\n`;
        md += `# 🎯 WEEKLY MARKET INTELLIGENCE\n\n`;
        md += `### Premium Financial Digest\n\n`;
        md += `**${weekRange}**\n\n`;
        md += `*Curated by AlphaVault AI | ${allNews.length} Stories Analyzed*\n\n`;
        md += `</div>\n\n`;

        // ═══════════════════════════════════════════════════════
        // 📊 EXECUTIVE SUMMARY
        // ═══════════════════════════════════════════════════════
        md += `---\n\n`;
        md += `## 📊 Executive Summary\n\n`;
        md += `<div style="background: rgba(102, 126, 234, 0.1); padding: 24px; border-radius: 16px; border-left: 4px solid #667eea;">\n\n`;
        
        const sectors = this.getTopSectors(allNews);
        const topTickers = this.getTopTickers(allNews);
        
        md += `**🔥 Hot Sectors:** ${sectors.join(' • ')}\n\n`;
        md += `**📈 Most Mentioned:** ${topTickers.slice(0, 5).map(t => `\`${t.ticker}\``).join(', ')}\n\n`;
        md += `**📰 Total Coverage:** ${allNews.length} premium articles\n\n`;
        md += `**🌍 Global Reach:** ${this.countUniqueSources(allNews)} authoritative sources\n\n`;
        md += `</div>\n\n`;

        // ═══════════════════════════════════════════════════════
        // 🔥 BREAKING NEWS (< 48h)
        // ═══════════════════════════════════════════════════════
        if (categorizedNews.breaking.length > 0) {
            md += `---\n\n`;
            md += `## 🔥 Breaking Stories\n\n`;
            md += `<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05)); padding: 20px; border-radius: 16px; border-left: 4px solid #EF4444;">\n\n`;
            
            categorizedNews.breaking.slice(0, 3).forEach((news, i) => {
                md += `**${i + 1}. ${news.title}**\n\n`;
                if (news.description) md += `${news.description}\n\n`;
                if (news.tickers.length > 0) {
                    md += `🎯 ${news.tickers.map(t => `\`${t}\``).join(' ')} | `;
                }
                md += `⏰ ${this.getTimeAgo(news.timestamp)}\n\n`;
                md += `[Read More →](${news.link})\n\n`;
                md += `---\n\n`;
            });
            
            md += `</div>\n\n`;
        }

        // ═══════════════════════════════════════════════════════
        // 📊 EARNINGS HIGHLIGHTS
        // ═══════════════════════════════════════════════════════
        if (categorizedNews.earnings.length > 0) {
            md += `---\n\n`;
            md += `## 📊 Earnings Spotlight\n\n`;
            
            categorizedNews.earnings.slice(0, 4).forEach((news, i) => {
                const icon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '📌';
                md += `### ${icon} ${news.title}\n\n`;
                if (news.description) md += `> ${news.description}\n\n`;
                if (news.tickers.length > 0) {
                    md += `**Tickers:** ${news.tickers.map(t => `\`${t}\``).join(', ')}\n\n`;
                }
                md += `📰 *[${news.sourceName}](${news.link})*\n\n`;
            });
        }

        // ═══════════════════════════════════════════════════════
        // 💻 TECH & INNOVATION
        // ═══════════════════════════════════════════════════════
        if (categorizedNews.tech.length > 0) {
            md += `---\n\n`;
            md += `## 💻 Tech & Innovation\n\n`;
            
            categorizedNews.tech.slice(0, 3).forEach((news) => {
                md += `**⚡ ${news.title}**\n\n`;
                if (news.description) md += `${news.description}\n\n`;
                if (news.tickers.length > 0) {
                    md += `${news.tickers.map(t => `\`${t}\``).join(' • ')} | `;
                }
                md += `[Source](${news.link})\n\n`;
            });
        }

        // ═══════════════════════════════════════════════════════
        // 💰 FINANCE & MARKETS
        // ═══════════════════════════════════════════════════════
        if (categorizedNews.finance.length > 0 || categorizedNews.market.length > 0) {
            md += `---\n\n`;
            md += `## 💰 Finance & Markets\n\n`;
            
            const financeNews = [...categorizedNews.finance, ...categorizedNews.market].slice(0, 4);
            
            financeNews.forEach((news) => {
                md += `**📈 ${news.title}**\n\n`;
                if (news.description) md += `${news.description}\n\n`;
                md += `[Read Full Story →](${news.link})\n\n`;
            });
        }

        // ═══════════════════════════════════════════════════════
        // 📈 THIS WEEK IN NUMBERS
        // ═══════════════════════════════════════════════════════
        md += `---\n\n`;
        md += `## 📈 This Week in Numbers\n\n`;
        md += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 24px 0;">\n\n`;
        
        md += `<div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 12px; color: white; text-align: center;">\n\n`;
        md += `**${allNews.length}**\n\n`;
        md += `Stories Analyzed\n\n`;
        md += `</div>\n\n`;
        
        md += `<div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 20px; border-radius: 12px; color: white; text-align: center;">\n\n`;
        md += `**${this.countUniqueTickers(allNews)}**\n\n`;
        md += `Companies Mentioned\n\n`;
        md += `</div>\n\n`;
        
        md += `<div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 20px; border-radius: 12px; color: white; text-align: center;">\n\n`;
        md += `**${sectors.length}**\n\n`;
        md += `Active Sectors\n\n`;
        md += `</div>\n\n`;
        
        md += `</div>\n\n`;

        // ═══════════════════════════════════════════════════════
        // 🏆 TOP MOVERS (Most Mentioned Tickers)
        // ═══════════════════════════════════════════════════════
        md += `---\n\n`;
        md += `## 🏆 Top Movers - Most Mentioned\n\n`;
        md += `<div style="background: rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 16px;">\n\n`;
        
        topTickers.slice(0, 8).forEach((ticker, i) => {
            const medal = i < 3 ? ['🥇', '🥈', '🥉'][i] : '📊';
            md += `${medal} **\`${ticker.ticker}\`** - ${ticker.count} mentions\n\n`;
        });
        
        md += `</div>\n\n`;

        // ═══════════════════════════════════════════════════════
        // 💎 PREMIUM FOOTER
        // ═══════════════════════════════════════════════════════
        md += `---\n\n`;
        md += `<div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 30px; border-radius: 16px; text-align: center; color: white;">\n\n`;
        md += `### 💎 Stay Ahead of the Market\n\n`;
        md += `*This premium newsletter is automatically curated by **AlphaVault AI** using advanced algorithms and real-time market data analysis.*\n\n`;
        md += `📌 **Updated Weekly** | 🔐 **Exclusive Content** | 🚀 **Data-Driven Insights**\n\n`;
        md += `[Explore More Tools →](https://alphavault-ai.com) | [Join Premium →](https://alphavault-ai.com/pricing)\n\n`;
        md += `</div>\n\n`;

        return {
            markdown: md,
            html: this.markdownToHtml(md)
        };
    }

    getWeekRange() {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return `${weekAgo.toLocaleDateString('en-US', options)} - ${now.toLocaleDateString('en-US', options)}`;
    }

    getTimeAgo(timestamp) {
        const hours = (Date.now() - timestamp) / (1000 * 60 * 60);
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${Math.floor(hours)}h ago`;
        if (hours < 48) return 'Yesterday';
        return `${Math.floor(hours / 24)}d ago`;
    }

    countUniqueTickers(articles) {
        const tickers = new Set();
        articles.forEach(article => {
            article.tickers.forEach(ticker => tickers.add(ticker));
        });
        return tickers.size;
    }

    countUniqueSources(articles) {
        const sources = new Set();
        articles.forEach(article => sources.add(article.source));
        return sources.size;
    }

    getTopTickers(articles) {
        const tickerCount = {};
        articles.forEach(article => {
            article.tickers.forEach(ticker => {
                tickerCount[ticker] = (tickerCount[ticker] || 0) + 1;
            });
        });

        return Object.entries(tickerCount)
            .map(([ticker, count]) => ({ ticker, count }))
            .sort((a, b) => b.count - a.count);
    }

    getTopSectors(articles) {
        const sectorCount = {};
        
        articles.forEach(article => {
            const sector = this.detectSector(article);
            sectorCount[sector] = (sectorCount[sector] || 0) + 1;
        });

        return Object.entries(sectorCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([sector]) => sector.charAt(0).toUpperCase() + sector.slice(1));
    }

    detectSector(article) {
        const text = (article.title + ' ' + article.description).toLowerCase();
        
        if (text.match(/\b(tech|software|ai|semiconductor|cloud|data)\b/i)) return 'technology';
        if (text.match(/\b(bank|finance|fed|interest|trading)\b/i)) return 'finance';
        if (text.match(/\b(oil|energy|gas|renewable|solar)\b/i)) return 'energy';
        if (text.match(/\b(healthcare|pharma|drug|biotech)\b/i)) return 'healthcare';
        if (text.match(/\b(consumer|retail|ecommerce)\b/i)) return 'consumer';
        
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
            .slice(0, 6)
            .map(([tag]) => tag);
    }

    extractTopImages(articles) {
        return articles
            .filter(a => a.image)
            .slice(0, 4)
            .map(a => a.image);
    }

    markdownToHtml(markdown) {
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

    async forceGenerate() {
        console.log('🔧 Manual newsletter generation triggered');
        await this.generateAndPublishPost(true);
    }
}

// ════════════════════════════════════════════════════════════════
// INITIALISATION AUTOMATIQUE
// ════════════════════════════════════════════════════════════════

window.autoNewsletterSystem = null;

async function initAutoNewsletter() {
    if (!window.autoNewsletterSystem) {
        console.log('📰 Initializing Auto-Newsletter System...');
        window.autoNewsletterSystem = new AutoNewsletterSystem();
        
        if (window.newsTerminal && window.newsTerminal.rssClient) {
            window.autoNewsletterSystem.rssClient = window.newsTerminal.rssClient;
        } else if (typeof window.RSSClient === 'function') {
            window.autoNewsletterSystem.rssClient = new window.RSSClient();
        }
        
        window.autoNewsletterSystem.communityService = window.communityService;
    }
    
    return window.autoNewsletterSystem;
}

async function generateWeeklyNewsletter() {
    try {
        const system = await initAutoNewsletter();
        
        if (!system.rssClient) {
            alert('⚠ RSS Client not available. Please make sure news-terminal.js is loaded.');
            return;
        }
        
        if (!firebase.auth().currentUser) {
            alert('⚠ Please log in to generate newsletter');
            return;
        }
        
        await system.generateAndPublishPost(true);
        
    } catch (error) {
        console.error('❌ Error generating newsletter:', error);
        alert('Failed to generate newsletter: ' + error.message);
    }
}

window.generateWeeklyNewsletter = generateWeeklyNewsletter;

// ✅ AUTO-CHECK À CHAQUE CHARGEMENT (vendredi uniquement)
document.addEventListener('DOMContentLoaded', async () => {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            const system = await initAutoNewsletter();
            if (system.rssClient) {
                await system.checkFridaySchedule();
            }
        }
    });
});

// Animations CSS
(function() {
    const newsletterStyles = document.createElement('style');
    newsletterStyles.id = 'auto-newsletter-styles';
    newsletterStyles.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    
    if (!document.getElementById('auto-newsletter-styles')) {
        document.head.appendChild(newsletterStyles);
    }
})();