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
        this.LAST_POST_WEEK_KEY = 'lastAutoNewsletterWeek';
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

    async checkFridaySchedule() {
        try {
            const now = new Date();
            const currentDay = now.getDay();
            const currentHour = now.getHours();
            const currentWeek = this.getWeekNumber(now);
            const lastWeek = localStorage.getItem(this.LAST_POST_WEEK_KEY);

            console.log(`📅 Current: ${this.getDayName(currentDay)} ${currentHour}h - Week ${currentWeek}`);
            console.log(`📅 Last post: Week ${lastWeek || 'never'}`);

            if (currentDay === this.TARGET_DAY && currentWeek !== lastWeek) {
                console.log(`🎯 It's Friday (Week ${currentWeek})!`);
                
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
                maxPerSource: 100
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

            const topNews = this.selectTopNews(weeklyNews, 15);
            const categorizedNews = this.categorizeNews(topNews);

            const postContent = this.generatePremiumContent(categorizedNews, topNews, weeklyNews);

            const postData = {
                title: `Weekly Market Intelligence - ${this.getWeekRange()}`,
                content: postContent.markdown,
                channelId: 'news-events',
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
                newsletterWeek: this.getWeekNumber(new Date())
            };

            console.log('📤 Publishing premium post to Firestore...');
            const docRef = await firebase.firestore().collection('posts').add(postData);
            
            console.log(`✅ Post published successfully! ID: ${docRef.id}`);

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

    categorizeNews(news) {
        const categories = {
            breaking: [],
            earnings: [],
            tech: [],
            finance: [],
            market: [],
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

    generatePremiumContent(categorizedNews, topNews, allNews) {
        const weekRange = this.getWeekRange();
        
        let md = '';

        // ═══════════════════════════════════════════════════════
        // ✅ BANNIÈRE PREMIUM (TEXTE BLANC)
        // ═══════════════════════════════════════════════════════
        md += `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 40px; border-radius: 24px; text-align: center; margin-bottom: 40px; box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4);">\n\n`;
        md += `<h1 style="font-size: 2.8rem; font-weight: 900; margin: 0 0 16px 0; color: #ffffff; text-shadow: 0 4px 12px rgba(0,0,0,0.3);">WEEKLY MARKET INTELLIGENCE</h1>\n\n`;
        md += `<h3 style="font-size: 1.4rem; font-weight: 600; margin: 0 0 20px 0; color: #ffffff; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">Premium Financial Digest</h3>\n\n`;
        md += `<p style="font-size: 1.2rem; font-weight: 700; margin: 0 0 12px 0; color: #ffffff; text-shadow: 0 2px 6px rgba(0,0,0,0.2);">${weekRange}</p>\n\n`;
        md += `<p style="font-size: 1rem; margin: 0; color: #ffffff; text-shadow: 0 2px 6px rgba(0,0,0,0.2);">Curated by AlphaVault AI | ${allNews.length} Stories Analyzed</p>\n\n`;
        md += `</div>\n\n`;

        // ✅ SÉPARATEUR SIMPLE
        md += this.createSimpleSeparator();

        // ═══════════════════════════════════════════════════════
        // ✅ EXECUTIVE SUMMARY (SANS DOUBLONS)
        // ═══════════════════════════════════════════════════════
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #667eea;">Executive Summary</h2>\n\n`;
        md += `<div style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08)); padding: 32px; border-radius: 20px; border: 2px solid rgba(102, 126, 234, 0.2);">\n\n`;
        
        const sectors = this.getTopSectors(allNews);
        const topTickers = this.getTopTickers(allNews);
        
        md += `<p style="font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 12px 0;">Hot Sectors: <span style="color: #667eea;">${sectors.join(' • ')}</span></p>\n\n`;
        md += `<p style="font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 12px 0;">Most Mentioned: ${topTickers.slice(0, 5).map(t => `<code style="background: #667eea; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 700;">${t.ticker}</code>`).join(' ')}</p>\n\n`;
        md += `<p style="font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 12px 0;">Total Coverage: <span style="color: #10b981;">${allNews.length} premium articles</span></p>\n\n`;
        md += `<p style="font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0;">Global Reach: <span style="color: #3b82f6;">${this.countUniqueSources(allNews)} authoritative sources</span></p>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        md += this.createSimpleSeparator();

        // ═══════════════════════════════════════════════════════
        // BREAKING NEWS
        // ═══════════════════════════════════════════════════════
        if (categorizedNews.breaking.length > 0) {
            md += `<div style="margin: 40px 0;">\n\n`;
            md += `<h2 style="font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #ef4444;">Breaking Stories</h2>\n\n`;
            md += `<div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(220, 38, 38, 0.05)); padding: 32px; border-radius: 20px; border: 2px solid rgba(239, 68, 68, 0.2);">\n\n`;
            
            categorizedNews.breaking.slice(0, 3).forEach((news, i) => {
                md += `<div style="margin-bottom: ${i < 2 ? '28px' : '0'}; padding-bottom: ${i < 2 ? '28px' : '0'}; border-bottom: ${i < 2 ? '2px solid rgba(239, 68, 68, 0.15)' : 'none'};">\n\n`;
                md += `<h3 style="font-size: 1.3rem; font-weight: 800; color: #1e293b; margin: 0 0 12px 0;">${i + 1}. ${news.title}</h3>\n\n`;
                if (news.description) {
                    md += `<p style="font-size: 1rem; color: #475569; line-height: 1.7; margin: 0 0 12px 0;">${news.description}</p>\n\n`;
                }
                if (news.tickers.length > 0) {
                    md += `<p style="margin: 0 0 8px 0;">${news.tickers.map(t => `<code style="background: #ef4444; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.9rem;">${t}</code>`).join(' ')}</p>\n\n`;
                }
                md += `<p style="font-size: 0.95rem; color: #64748b; margin: 0;"><strong>Posted:</strong> ${this.getTimeAgo(news.timestamp)} | <a href="${news.link}" target="_blank" style="color: #667eea; font-weight: 700; text-decoration: none;">Read More →</a></p>\n\n`;
                md += `</div>\n\n`;
            });
            
            md += `</div>\n\n`;
            md += `</div>\n\n`;

            md += this.createSimpleSeparator();
        }

        // ═══════════════════════════════════════════════════════
        // EARNINGS HIGHLIGHTS
        // ═══════════════════════════════════════════════════════
        if (categorizedNews.earnings.length > 0) {
            md += `<div style="margin: 40px 0;">\n\n`;
            md += `<h2 style="font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #10b981;">Earnings Spotlight</h2>\n\n`;
            
            categorizedNews.earnings.slice(0, 4).forEach((news, i) => {
                const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32', '#667eea'];
                const rankLabels = ['Top Story', 'Runner-Up', 'Notable', 'Featured'];
                
                md += `<div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.03)); padding: 24px; border-radius: 16px; margin-bottom: ${i < 3 ? '20px' : '0'}; border-left: 5px solid ${rankColors[i]};">\n\n`;
                md += `<p style="font-size: 0.85rem; font-weight: 800; color: ${rankColors[i]}; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">${rankLabels[i]}</p>\n\n`;
                md += `<h3 style="font-size: 1.4rem; font-weight: 800; color: #1e293b; margin: 0 0 12px 0;">${news.title}</h3>\n\n`;
                if (news.description) {
                    md += `<blockquote style="border-left: 4px solid #10b981; padding-left: 16px; margin: 0 0 16px 0; color: #475569; font-style: italic; font-size: 1rem; line-height: 1.6;">${news.description}</blockquote>\n\n`;
                }
                if (news.tickers.length > 0) {
                    md += `<p style="margin: 0 0 12px 0;"><strong style="color: #1e293b;">Tickers:</strong> ${news.tickers.map(t => `<code style="background: #10b981; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.9rem;">${t}</code>`).join(' ')}</p>\n\n`;
                }
                md += `<p style="font-size: 0.95rem; color: #64748b; margin: 0;"><a href="${news.link}" target="_blank" style="color: #10b981; font-weight: 700; text-decoration: none;">${news.sourceName} →</a></p>\n\n`;
                md += `</div>\n\n`;
            });
            
            md += `</div>\n\n`;

            md += this.createSimpleSeparator();
        }

        // ═══════════════════════════════════════════════════════
        // TECH & INNOVATION
        // ═══════════════════════════════════════════════════════
        if (categorizedNews.tech.length > 0) {
            md += `<div style="margin: 40px 0;">\n\n`;
            md += `<h2 style="font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #8b5cf6;">Tech & Innovation</h2>\n\n`;
            md += `<div style="display: grid; gap: 20px;">\n\n`;
            
            categorizedNews.tech.slice(0, 3).forEach((news) => {
                md += `<div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(124, 58, 237, 0.05)); padding: 24px; border-radius: 16px; border: 2px solid rgba(139, 92, 246, 0.2);">\n\n`;
                md += `<h3 style="font-size: 1.3rem; font-weight: 800; color: #1e293b; margin: 0 0 12px 0;">${news.title}</h3>\n\n`;
                if (news.description) {
                    md += `<p style="font-size: 1rem; color: #475569; line-height: 1.7; margin: 0 0 12px 0;">${news.description}</p>\n\n`;
                }
                if (news.tickers.length > 0) {
                    md += `<p style="margin: 0 0 8px 0;">${news.tickers.map(t => `<code style="background: #8b5cf6; color: white; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.9rem;">${t}</code>`).join(' ')}</p>\n\n`;
                }
                md += `<p style="font-size: 0.95rem; margin: 0;"><a href="${news.link}" target="_blank" style="color: #8b5cf6; font-weight: 700; text-decoration: none;">Read Full Story →</a></p>\n\n`;
                md += `</div>\n\n`;
            });
            
            md += `</div>\n\n`;
            md += `</div>\n\n`;

            md += this.createSimpleSeparator();
        }

        // ═══════════════════════════════════════════════════════
        // FINANCE & MARKETS
        // ═══════════════════════════════════════════════════════
        if (categorizedNews.finance.length > 0 || categorizedNews.market.length > 0) {
            md += `<div style="margin: 40px 0;">\n\n`;
            md += `<h2 style="font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #f59e0b;">Finance & Markets</h2>\n\n`;
            
            const financeNews = [...categorizedNews.finance, ...categorizedNews.market].slice(0, 4);
            
            financeNews.forEach((news, i) => {
                md += `<div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(217, 119, 6, 0.05)); padding: 24px; border-radius: 16px; margin-bottom: ${i < financeNews.length - 1 ? '20px' : '0'}; border: 2px solid rgba(245, 158, 11, 0.2);">\n\n`;
                md += `<h3 style="font-size: 1.3rem; font-weight: 800; color: #1e293b; margin: 0 0 12px 0;">${news.title}</h3>\n\n`;
                if (news.description) {
                    md += `<p style="font-size: 1rem; color: #475569; line-height: 1.7; margin: 0 0 12px 0;">${news.description}</p>\n\n`;
                }
                md += `<p style="font-size: 0.95rem; margin: 0;"><a href="${news.link}" target="_blank" style="color: #f59e0b; font-weight: 700; text-decoration: none;">Continue Reading →</a></p>\n\n`;
                md += `</div>\n\n`;
            });
            
            md += `</div>\n\n`;

            md += this.createSimpleSeparator();
        }

        // ═══════════════════════════════════════════════════════
        // THIS WEEK IN NUMBERS
        // ═══════════════════════════════════════════════════════
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #3b82f6;">This Week in Numbers</h2>\n\n`;
        md += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin: 24px 0;">\n\n`;
        
        md += `<div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; border-radius: 16px; text-align: center; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);">\n\n`;
        md += `<p style="font-size: 3rem; font-weight: 900; color: white; margin: 0 0 8px 0; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">${allNews.length}</p>\n\n`;
        md += `<p style="font-size: 1.1rem; font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">Stories Analyzed</p>\n\n`;
        md += `</div>\n\n`;
        
        md += `<div style="background: linear-gradient(135deg, #3b82f6, #2563eb); padding: 32px; border-radius: 16px; text-align: center; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);">\n\n`;
        md += `<p style="font-size: 3rem; font-weight: 900; color: white; margin: 0 0 8px 0; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">${this.countUniqueTickers(allNews)}</p>\n\n`;
        md += `<p style="font-size: 1.1rem; font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">Companies</p>\n\n`;
        md += `</div>\n\n`;
        
        md += `<div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 32px; border-radius: 16px; text-align: center; box-shadow: 0 8px 24px rgba(139, 92, 246, 0.3);">\n\n`;
        md += `<p style="font-size: 3rem; font-weight: 900; color: white; margin: 0 0 8px 0; text-shadow: 0 2px 8px rgba(0,0,0,0.2);">${sectors.length}</p>\n\n`;
        md += `<p style="font-size: 1.1rem; font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">Active Sectors</p>\n\n`;
        md += `</div>\n\n`;
        
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        md += this.createSimpleSeparator();

        // ═══════════════════════════════════════════════════════
        // TOP MOVERS
        // ═══════════════════════════════════════════════════════
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #ec4899;">Top Movers - Most Mentioned</h2>\n\n`;
        md += `<div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(219, 39, 119, 0.05)); padding: 32px; border-radius: 20px; border: 2px solid rgba(236, 72, 153, 0.2);">\n\n`;
        
        topTickers.slice(0, 8).forEach((ticker, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            const medal = i < 3 ? medals[i] : `<span style="display: inline-block; width: 32px; text-align: center; font-weight: 900; color: #667eea;">${i + 1}</span>`;
            const barWidth = Math.max(20, (ticker.count / topTickers[0].count) * 100);
            
            md += `<div style="margin-bottom: ${i < 7 ? '16px' : '0'}; display: flex; align-items: center; gap: 16px;">\n\n`;
            md += `<span style="font-size: 1.5rem;">${medal}</span>\n\n`;
            md += `<div style="flex: 1;">\n\n`;
            md += `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">\n\n`;
            md += `<code style="background: #ec4899; color: white; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 1.1rem;">${ticker.ticker}</code>\n\n`;
            md += `<span style="font-weight: 800; color: #1e293b; font-size: 1.1rem;">${ticker.count} mentions</span>\n\n`;
            md += `</div>\n\n`;
            md += `<div style="background: rgba(236, 72, 153, 0.15); height: 10px; border-radius: 10px; overflow: hidden;">\n\n`;
            md += `<div style="background: linear-gradient(90deg, #ec4899, #db2777); height: 100%; width: ${barWidth}%; border-radius: 10px;"></div>\n\n`;
            md += `</div>\n\n`;
            md += `</div>\n\n`;
            md += `</div>\n\n`;
        });
        
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        md += this.createSimpleSeparator();

        // ═══════════════════════════════════════════════════════
        // ✅ SECTION COMPLÈTE : 10 ARTICLES COMPACTS
        // ═══════════════════════════════════════════════════════
        md += `<div style="margin: 40px 0;">\n\n`;
        md += `<h2 style="font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0 0 24px 0; padding-left: 20px; border-left: 6px solid #06b6d4;">Complete News Coverage</h2>\n\n`;
        md += `<p style="font-size: 1.1rem; color: #475569; margin: 0 0 32px 0; font-weight: 600;">Deep dive into the top 10 stories that shaped the market this week</p>\n\n`;
        
        const top10Articles = this.selectTopNews(allNews, 10);
        
        top10Articles.forEach((article, index) => {
            const cardColors = [
                'linear-gradient(135deg, #667eea, #764ba2)',
                'linear-gradient(135deg, #f093fb, #f5576c)',
                'linear-gradient(135deg, #4facfe, #00f2fe)',
                'linear-gradient(135deg, #43e97b, #38f9d7)',
                'linear-gradient(135deg, #fa709a, #fee140)',
                'linear-gradient(135deg, #30cfd0, #330867)',
                'linear-gradient(135deg, #a8edea, #fed6e3)',
                'linear-gradient(135deg, #ff9a9e, #fecfef)',
                'linear-gradient(135deg, #ffecd2, #fcb69f)',
                'linear-gradient(135deg, #ff6e7f, #bfe9ff)'
            ];
            
            // ✅ CARDS PLUS COMPACTES
            md += `<div style="background: white; border-radius: 16px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 6px 20px rgba(0,0,0,0.1); border: 2px solid rgba(102, 126, 234, 0.2);">\n\n`;
            
            // Header compact
            md += `<div style="background: ${cardColors[index]}; padding: 16px 24px; display: flex; align-items: center; gap: 12px;">\n\n`;
            md += `<div style="background: white; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 900; color: #667eea; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">${index + 1}</div>\n\n`;
            md += `<div style="flex: 1;">\n\n`;
            md += `<p style="margin: 0; font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.95); text-transform: uppercase; letter-spacing: 0.5px;">${article.sourceName}</p>\n\n`;
            md += `<p style="margin: 4px 0 0 0; font-size: 0.8rem; color: rgba(255,255,255,0.85);">${this.getTimeAgo(article.timestamp)}</p>\n\n`;
            md += `</div>\n\n`;
            md += `</div>\n\n`;
            
            // ✅ Image réduite (180px au lieu de 300px)
            if (article.image) {
                md += `<div style="width: 100%; height: 180px; overflow: hidden; background: #f1f5f9;">\n\n`;
                md += `<img src="${article.image}" alt="${this.escapeHtml(article.title)}" style="width: 100%; height: 100%; object-fit: cover;">\n\n`;
                md += `</div>\n\n`;
            }
            
            // ✅ Contenu plus compact
            md += `<div style="padding: 20px;">\n\n`;
            md += `<h3 style="font-size: 1.3rem; font-weight: 800; color: #1e293b; margin: 0 0 12px 0; line-height: 1.3;">${article.title}</h3>\n\n`;
            
            if (article.description) {
                // ✅ Description tronquée à 120 caractères
                const shortDesc = article.description.length > 120 ? article.description.substring(0, 120) + '...' : article.description;
                md += `<p style="font-size: 0.95rem; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">${shortDesc}</p>\n\n`;
            }
            
            // Tickers compacts
            if (article.tickers && article.tickers.length > 0) {
                md += `<div style="margin: 0 0 16px 0;">\n\n`;
                md += `<div style="display: flex; flex-wrap: wrap; gap: 6px;">\n\n`;
                article.tickers.slice(0, 4).forEach(ticker => {
                    md += `<code style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);">${ticker}</code>\n\n`;
                });
                md += `</div>\n\n`;
                md += `</div>\n\n`;
            }
            
            // Footer compact
            md += `<div style="padding-top: 16px; border-top: 2px solid #e2e8f0;">\n\n`;
            md += `<a href="${article.link}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 0.9rem; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">\n\n`;
            md += `Read Full Article\n\n`;
            md += `<span style="font-size: 1rem;">→</span>\n\n`;
            md += `</a>\n\n`;
            md += `</div>\n\n`;
            
            md += `</div>\n\n`;
            md += `</div>\n\n`;
        });
        
        md += `</div>\n\n`;

        md += this.createSimpleSeparator();

        // ═══════════════════════════════════════════════════════
        // PREMIUM FOOTER
        // ═══════════════════════════════════════════════════════
        md += `<div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">\n\n`;
        md += `<h3 style="font-size: 1.8rem; font-weight: 800; color: white; margin: 0 0 16px 0;">Stay Ahead of the Market</h3>\n\n`;
        md += `<p style="font-size: 1.05rem; color: rgba(255,255,255,0.9); line-height: 1.7; margin: 0 0 24px 0; max-width: 700px; margin-left: auto; margin-right: auto;">This premium newsletter is automatically curated by <strong style="color: #667eea;">AlphaVault AI</strong> using advanced algorithms and real-time market data analysis.</p>\n\n`;
        md += `<div style="display: flex; justify-content: center; gap: 32px; flex-wrap: wrap; margin: 24px 0;">\n\n`;
        md += `<div style="text-align: center;">\n\n`;
        md += `<p style="font-size: 2rem; margin: 0 0 8px 0;">📌</p>\n\n`;
        md += `<p style="font-size: 0.95rem; font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">Updated Weekly</p>\n\n`;
        md += `</div>\n\n`;
        md += `<div style="text-align: center;">\n\n`;
        md += `<p style="font-size: 2rem; margin: 0 0 8px 0;">🔐</p>\n\n`;
        md += `<p style="font-size: 0.95rem; font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">Exclusive Content</p>\n\n`;
        md += `</div>\n\n`;
        md += `<div style="text-align: center;">\n\n`;
        md += `<p style="font-size: 2rem; margin: 0 0 8px 0;">🚀</p>\n\n`;
        md += `<p style="font-size: 0.95rem; font-weight: 700; color: rgba(255,255,255,0.95); margin: 0;">Data-Driven Insights</p>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;
        md += `<div style="margin-top: 32px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">\n\n`;
        md += `<a href="https://alphavault-ai.com" target="_blank" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 1rem; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);">Explore More Tools</a>\n\n`;
        md += `<a href="https://alphavault-ai.com/pricing" target="_blank" style="background: white; color: #667eea; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 1rem; box-shadow: 0 6px 20px rgba(255,255,255,0.2);">Join Premium</a>\n\n`;
        md += `</div>\n\n`;
        md += `</div>\n\n`;

        return {
            markdown: md,
            html: this.markdownToHtml(md)
        };
    }

    // ✅ SÉPARATEUR SIMPLE (JUSTE UN TRAIT)
    createSimpleSeparator() {
        return `<div style="height: 40px; margin: 30px 0; position: relative; display: flex; align-items: center;">\n\n` +
               `<div style="flex: 1; height: 3px; background: linear-gradient(90deg, transparent 0%, #667eea 30%, #764ba2 50%, #667eea 70%, transparent 100%); border-radius: 2px;"></div>\n\n` +
               `</div>\n\n`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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

// AUTO-CHECK À CHAQUE CHARGEMENT (vendredi uniquement)
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