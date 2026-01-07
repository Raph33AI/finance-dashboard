/**
 * ═══════════════════════════════════════════════════════════════════
 * ALPHAVAULT AI - DOCUMENTATION DATA STRUCTURE
 * All data is centralized here for easy maintenance
 * ═══════════════════════════════════════════════════════════════════
 */

const DocumentationData = {
    // ===== METADATA =====
    metadata: {
        title: 'AlphaVault AI - Technical Documentation',
        subtitle: 'Complete Platform Architecture & Implementation Guide',
        version: '2.0.0',
        environment: 'Production',
        accessLevel: 'Admin Access Only',
        generated: new Date().toISOString()
    },

    // ===== PLATFORM STATISTICS =====
    statistics: {
        htmlPages: { value: 65, size: '10.53 MB' },
        cssFiles: { value: 49, size: '1.8 MB' },
        jsScripts: { value: 112, size: '8.5 MB' },
        backendServices: 4,
        cloudflareWorkers: 10,
        totalLines: 274011,
        totalSize: '10.53 MB',
        pricingPlans: 4
    },

    // ===== PERFORMANCE METRICS =====
    performance: {
        avgResponseTime: '~630ms',
        cacheHitRate: '70%',
        apiCostReduction: '85%',
        uptime: '99.9%',
        parallelCalls: '4-6'
    },

    // ===== TECHNOLOGY STACK =====
    techStack: [
        {
            name: 'Firebase',
            icon: 'fab fa-google',
            color: 'linear-gradient(135deg, #FFCA28, #FFA000)',
            description: 'User authentication (Email/Password + Google OAuth), Firestore NoSQL database, real-time session management, and cloud storage for user files.',
            features: ['Authentication', 'Firestore', 'Cloud Storage', 'Real-time Sync']
        },
        {
            name: 'Cloudflare',
            icon: 'fas fa-cloud',
            color: 'linear-gradient(135deg, #F38020, #F6821F)',
            description: 'Static hosting (Pages), global CDN distribution, serverless Workers for backend logic, KV storage for caching, and real-time analytics.',
            features: ['CDN', 'Workers', 'KV Storage', 'Analytics']
        },
        {
            name: 'Stripe',
            icon: 'fab fa-stripe',
            color: 'linear-gradient(135deg, #635BFF, #5551FF)',
            description: 'Secure payment processing, subscription management with 14-day trials, webhook event handling, automated invoicing, and promo code system.',
            features: ['Payments', 'Subscriptions', 'Webhooks', 'Invoices']
        },
        {
            name: 'Resend',
            icon: 'fas fa-envelope',
            color: 'linear-gradient(135deg, #000000, #333333)',
            description: 'Transactional email delivery with 99.9% uptime, payment confirmations with HTML invoices, welcome emails, and automated newsletter campaigns.',
            features: ['Email Delivery', 'Newsletters', 'Invoices', 'Templates']
        }
    ],

    // ===== PRICING PLANS =====
    pricingPlans: [
        {
            id: 'free',
            name: 'Free',
            price: { amount: 0, currency: 'USD', interval: 'month' },
            stripePriceId: null,
            pages: 9,
            color: '#9CA3AF',
            gradient: 'linear-gradient(135deg, #9CA3AF, #6B7280)',
            features: [
                'Dashboard Budget',
                'Community Hub',
                'Monte Carlo Simulations',
                'Real Estate Tax Simulator',
                'Portfolio Optimizer (Markowitz)',
                'Economic Dashboard',
                'Companies Directory',
                'Settings & User Profile',
                'Create Posts & Messages'
            ],
            badge: 'Free'
        },
        {
            id: 'basic',
            name: 'Basic',
            price: { amount: 5, currency: 'USD', interval: 'month' },
            stripePriceId: 'STRIPE_PRICE_BASIC',
            pages: 9,
            color: '#3B82F6',
            gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)',
            features: [
                'Everything in Free plan',
                'Entry-level subscription access'
            ],
            badge: 'Entry'
        },
        {
            id: 'pro',
            name: 'Pro',
            price: { amount: 10, currency: 'USD', interval: 'month' },
            stripePriceId: 'STRIPE_PRICE_PRO',
            pages: 17,
            color: '#8B5CF6',
            gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
            features: [
                'Everything in Basic',
                'Investment Analytics (Multi-allocation)',
                'Risk Parity Optimization',
                'Scenario Analysis (Bull/Base/Bear)',
                'Advanced Analysis (14 Wall Street indicators)',
                'Forex Converter (38 currencies)',
                'Inflation Calculator',
                'Interest Rate Tracker',
                'News Terminal (Real-time)'
            ],
            badge: 'Popular',
            popular: true
        },
        {
            id: 'platinum',
            name: 'Platinum',
            price: { amount: 20, currency: 'USD', interval: 'month' },
            stripePriceId: 'STRIPE_PRICE_PLATINUM',
            pages: 25,
            color: '#F59E0B',
            gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
            features: [
                'Everything in Pro',
                'IPO Intelligence (AI Scoring)',
                'Insider Flow Tracker (14 classes)',
                'M&A Predictor (6 AI factors)',
                'Trend Prediction ML (5 models)',
                'Market Sentiment Analysis',
                'Trending Topics Detection',
                'YouTube Intelligence',
                'Recession Indicators'
            ],
            badge: 'Premium',
            premium: true
        }
    ],

    // ===== PROMO CODES =====
    promoCodes: [
        { code: 'LAUNCH15', type: 'percentage', value: 15, duration: 'forever', description: 'Launch discount (all plans)' },
        { code: 'WELCOME15', type: 'percentage', value: 15, duration: 'forever', description: 'Welcome discount (all plans)' },
        { code: 'SAVE15', type: 'percentage', value: 15, duration: 'forever', description: 'General 15% discount' },
        { code: 'FREEPRO', type: 'free', value: 'pro', duration: 'lifetime', description: 'Free lifetime access to Pro plan' },
        { code: 'FREEPLATINUM', type: 'free', value: 'platinum', duration: 'lifetime', description: 'Free lifetime access to Platinum plan' },
        { code: 'VIPACCESS', type: 'free', value: 'vip', duration: 'lifetime', description: 'VIP access (Pro or Platinum)' },
        { code: 'FREE14DAYS', type: 'trial', value: 14, duration: 'one-time', description: '14-day free trial (no card)' },
        { code: 'TRIAL14', type: 'trial', value: 14, duration: 'one-time', description: '14-day trial period' },
        { code: 'TRYITFREE', type: 'trial', value: 14, duration: 'one-time', description: 'Try it free for 14 days' }
    ],

    // ===== CORE FEATURES =====
    coreFeatures: [
        {
            name: 'M&A Predictor',
            description: 'AI-powered SEC filings analysis (6 factors) to predict mergers & acquisitions probability',
            plan: 'platinum',
            status: 'active',
            icon: 'fas fa-handshake'
        },
        {
            name: 'Insider Flow Tracker',
            description: 'Form 4 insider trading transactions tracking with 14 transaction classes and pattern detection',
            plan: 'platinum',
            status: 'active',
            icon: 'fas fa-user-secret'
        },
        {
            name: 'Trend Prediction',
            description: 'ML predictive analysis with 5 models (Linear Regression, Ridge, Lasso, Random Forest, LSTM)',
            plan: 'platinum',
            status: 'active',
            icon: 'fas fa-chart-line'
        },
        {
            name: 'Advanced Analysis',
            description: '14 Wall Street technical indicators (RSI, MACD, Bollinger, Fibonacci, Ichimoku, Pivot Points, ADX, Stochastic)',
            plan: 'pro',
            status: 'active',
            icon: 'fas fa-brain'
        },
        {
            name: 'Monte Carlo Simulation',
            description: 'Probabilistic portfolio simulations with 6 models (Normal, Student-t, Log-Normal, Jump Diffusion, Regime Switching, GARCH)',
            plan: 'free',
            status: 'active',
            icon: 'fas fa-dice'
        },
        {
            name: 'Risk Parity',
            description: 'Portfolio optimization by risk parity allocation with advanced rebalancing algorithms',
            plan: 'pro',
            status: 'active',
            icon: 'fas fa-balance-scale'
        },
        {
            name: 'Investment Analytics',
            description: 'Multi-allocation portfolio analytics with backtesting, VaR, Sharpe ratio, and scenario analysis',
            plan: 'pro',
            status: 'active',
            icon: 'fas fa-chart-bar'
        },
        {
            name: 'Forex Converter',
            description: '38 currencies with 14 Wall Street indicators, AI recommendations, and historical correlation matrix',
            plan: 'pro',
            status: 'active',
            icon: 'fas fa-exchange-alt'
        },
        {
            name: 'IPO Intelligence',
            description: 'AI IPO scoring with S-1 SEC document parsing and multi-criteria evaluation',
            plan: 'platinum',
            status: 'active',
            icon: 'fas fa-rocket'
        },
        {
            name: 'Chatbot FinanceGPT',
            description: 'AI assistant powered by Gemini 2.5 Flash (8,192 tokens) with 3D robot interface',
            plan: 'free',
            status: 'active',
            icon: 'fas fa-robot'
        },
        {
            name: 'Community Hub',
            description: 'Social features (posts, comments, likes, messages) with real-time updates',
            plan: 'free',
            status: 'active',
            icon: 'fas fa-users'
        },
        {
            name: 'YouTube Intelligence',
            description: 'Market analysis videos with AI categorization and sentiment detection',
            plan: 'platinum',
            status: 'active',
            icon: 'fab fa-youtube'
        }
    ],

    // ===== CLOUDFLARE WORKERS =====
    cloudflareWorkers: [
        {
            name: 'finance-hub-api',
            lines: 2885,
            purpose: 'Main backend API (Twelve Data + FinnHub + Stripe + Resend)',
            endpoints: [
                { path: '/api/quote', method: 'GET', description: 'Real-time quotes' },
                { path: '/api/time-series', method: 'GET', description: 'Historical data' },
                { path: '/api/technical-indicators', method: 'GET', description: 'RSI, MACD, etc.' },
                { path: '/api/profile', method: 'GET', description: 'Company fundamentals' },
                { path: '/create-checkout-session', method: 'POST', description: 'Stripe checkout' },
                { path: '/webhook', method: 'POST', description: 'Stripe webhooks' },
                { path: '/verify-subscription', method: 'GET', description: 'Plan check' },
                { path: '/api/simulations', method: 'GET/POST/PUT/DELETE', description: 'CRUD simulations' },
                { path: '/api/portfolios', method: 'GET/POST/PUT/DELETE', description: 'CRUD portfolios' }
            ],
            bindings: ['CACHE', 'SIMULATIONS_KV', 'STRIPE_SECRET_KEY', 'RESEND_API_KEY']
        },
        {
            name: 'economic-data-worker',
            lines: 656,
            purpose: 'ECB Forex (XML) + FRED economic data proxy',
            endpoints: [
                { path: '/ecb/rates', method: 'GET', description: '30+ currencies (EUR base)' },
                { path: '/ecb/historical', method: 'GET', description: '6 months historical forex' },
                { path: '/series/observations', method: 'GET', description: 'FRED time series data' },
                { path: '/multiple', method: 'GET', description: 'Batch FRED requests' },
                { path: '/latest', method: 'GET', description: 'Latest economic values' }
            ],
            bindings: ['CACHE']
        },
        {
            name: 'gmail-api',
            lines: 2417,
            purpose: 'Hybrid email system (Gmail API + Resend API)',
            endpoints: [
                { path: '/gmail-inbox', method: 'GET', description: 'Inbox messages' },
                { path: '/gmail-sent', method: 'GET', description: 'Sent messages' },
                { path: '/gmail-thread', method: 'GET', description: 'Message threads' },
                { path: '/gmail-send', method: 'POST', description: 'Send emails' },
                { path: '/gmail-reply', method: 'POST', description: 'Reply with threading' },
                { path: '/gmail-forward', method: 'POST', description: 'Forward with attachments' },
                { path: '/gmail-action', method: 'POST', description: 'Mark read/archive/delete' },
                { path: '/gmail-labels', method: 'GET', description: 'Label management' }
            ],
            bindings: ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'RESEND_API_KEY']
        },
        {
            name: 'gemini-ai-proxy',
            lines: 175,
            purpose: 'Secure proxy for Gemini 2.5 Flash API',
            endpoints: [
                { path: '/api/gemini', method: 'POST', description: 'AI requests' },
                { path: '/health', method: 'GET', description: 'Health check' }
            ],
            config: {
                model: 'gemini-2.5-flash',
                maxTokens: 8192,
                temperature: 0.9,
                safety: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            bindings: ['GEMINI_API_KEY']
        },
        {
            name: 'google-apis-proxy',
            lines: 432,
            purpose: 'YouTube Data API v3 with quota management',
            endpoints: [
                { path: '/youtube/search', method: 'GET', description: 'Search videos (100 units)' },
                { path: '/youtube/video', method: 'GET', description: 'Video details (1 unit)' },
                { path: '/youtube/channel', method: 'GET', description: 'Channel info (1 unit)' },
                { path: '/quotas', method: 'GET', description: 'Quota status dashboard' }
            ],
            quotas: {
                dailyLimit: 10000,
                maxSearches: 80,
                maxRequestsPerMinute: 60,
                maxRequestsPerHour: 500
            },
            bindings: ['GOOGLE_API_KEY', 'QUOTA_KV']
        },
        {
            name: 'google-knowledge-api',
            lines: 710,
            purpose: 'Google Knowledge Graph + Wikidata enrichment',
            endpoints: [
                { path: '/company-info', method: 'GET', description: 'Enriched company data' },
                { path: '/batch-companies', method: 'POST', description: 'Batch lookup (max 50)' },
                { path: '/health', method: 'GET', description: 'Health check' }
            ],
            dataSources: ['Google Knowledge Graph', 'Wikidata (16 properties)'],
            bindings: ['GOOGLE_KG_API_KEY']
        }
    ],

    // ===== DATA FLOWS =====
    dataFlows: [
        {
            id: 'user-registration',
            name: 'User Registration Flow',
            icon: 'fas fa-user-plus',
            color: '#10B981',
            steps: [
                {
                    id: 1,
                    title: 'User Submits Form',
                    component: 'auth.html',
                    details: ['Email: user@example.com', 'Password: ************', 'Name: John Doe'],
                    icon: 'fas fa-keyboard',
                    duration: '10ms'
                },
                {
                    id: 2,
                    title: 'Firebase Authentication',
                    component: 'Firebase Auth SDK',
                    details: [
                        'createUserWithEmailAndPassword()',
                        'Generate UID: abc123xyz456',
                        'Create JWT Token (expires 1h)',
                        'Email verification sent'
                    ],
                    icon: 'fab fa-google',
                    duration: '250ms'
                },
                {
                    id: 3,
                    title: 'Firestore User Creation',
                    component: 'Firestore /users/{uid}',
                    details: [
                        'plan: "basic"',
                        'subscriptionStatus: "inactive"',
                        'emailVerified: false',
                        'preferences: { theme, language, notifications }'
                    ],
                    icon: 'fas fa-database',
                    duration: '180ms'
                },
                {
                    id: 4,
                    title: 'Welcome Email',
                    component: 'Resend API',
                    details: [
                        'HTML template with glassmorphism',
                        'SVG logo embedded',
                        'List of 9 accessible pages',
                        'Gradient CTA button'
                    ],
                    icon: 'fas fa-envelope',
                    duration: '320ms'
                },
                {
                    id: 5,
                    title: 'Analytics Tracking',
                    component: 'Firestore /analytics_activity',
                    details: [
                        'eventType: "user_registered"',
                        'source: "organic"',
                        'device: "desktop"',
                        'location: { country, city }'
                    ],
                    icon: 'fas fa-chart-line',
                    duration: '50ms'
                },
                {
                    id: 6,
                    title: 'Redirect to Dashboard',
                    component: 'dashboard-financier.html',
                    details: [
                        'Session: Active (JWT stored)',
                        'Plan: Basic (9 pages)',
                        '✅ Registration Complete'
                    ],
                    icon: 'fas fa-check-circle',
                    duration: '100ms'
                }
            ],
            totalDuration: '910ms'
        },
        {
            id: 'stripe-payment',
            name: 'Stripe Payment Flow',
            icon: 'fas fa-credit-card',
            color: '#635BFF',
            steps: [
                {
                    id: 1,
                    title: 'User Selects Plan',
                    component: 'checkout.html',
                    details: ['Plan: Pro ($10/month)', 'Promo: LAUNCH15 (15% off)', 'Click "Subscribe"'],
                    icon: 'fas fa-mouse-pointer',
                    duration: '5ms'
                },
                {
                    id: 2,
                    title: 'Worker Creates Session',
                    component: 'finance-hub-api',
                    details: [
                        'POST /create-checkout-session',
                        'Validate plan & promo code',
                        'Create Stripe Coupon (15%)',
                        'trial_period_days: 14'
                    ],
                    icon: 'fas fa-cog',
                    duration: '420ms'
                },
                {
                    id: 3,
                    title: 'Redirect to Stripe',
                    component: 'Stripe Checkout',
                    details: [
                        'URL: checkout.stripe.com/...',
                        'Card: 4242 4242 4242 4242',
                        'Expiry: 12/28, CVC: 123',
                        'Validate payment method'
                    ],
                    icon: 'fab fa-stripe',
                    duration: '3500ms'
                },
                {
                    id: 4,
                    title: 'Stripe Processes Payment',
                    component: 'Stripe API',
                    details: [
                        'Create Customer: cus_abc123',
                        'Create Subscription: sub_xyz789',
                        'Apply Discount: 15% off → $8.50/month',
                        'Start Trial: 14 days'
                    ],
                    icon: 'fas fa-credit-card',
                    duration: '850ms'
                },
                {
                    id: 5,
                    title: 'Webhook Update',
                    component: 'finance-hub-api /webhook',
                    details: [
                        'Event: checkout.session.completed',
                        'Update Firebase plan: "pro"',
                        'Store subscription IDs',
                        'Trigger confirmation email'
                    ],
                    icon: 'fas fa-bolt',
                    duration: '280ms'
                },
                {
                    id: 6,
                    title: 'Confirmation Email',
                    component: 'Resend API',
                    details: [
                        'HTML invoice attached',
                        'Transaction details table',
                        'List of 17 Pro pages',
                        'Trial countdown'
                    ],
                    icon: 'fas fa-envelope-open-text',
                    duration: '380ms'
                },
                {
                    id: 7,
                    title: 'Success Page',
                    component: 'success.html',
                    details: [
                        'Confirmation message',
                        'Email sent notification',
                        '✅ Payment Complete'
                    ],
                    icon: 'fas fa-check-double',
                    duration: '50ms'
                }
            ],
            totalDuration: '5485ms'
        },
        {
            id: 'market-data',
            name: 'Market Data Retrieval',
            icon: 'fas fa-chart-line',
            color: '#3B82F6',
            steps: [
                {
                    id: 1,
                    title: 'User Searches Symbol',
                    component: 'advanced-analysis.html',
                    details: ['Input: "AAPL"', 'Click "Analyze"', 'Function: analyzeSymbol()'],
                    icon: 'fas fa-search',
                    duration: '5ms'
                },
                {
                    id: 2,
                    title: 'API Client Requests',
                    component: 'api-client.js',
                    details: [
                        'getQuote("AAPL")',
                        'getTimeSeries("AAPL", "1day", 365)',
                        'getTechnicalIndicator("AAPL", "rsi")',
                        'getProfile("AAPL")'
                    ],
                    icon: 'fas fa-code',
                    duration: '10ms'
                },
                {
                    id: 3,
                    title: 'Worker Processes',
                    component: 'finance-hub-api',
                    details: [
                        'Check KV cache (2/4 hits)',
                        'Proxy to Twelve Data API',
                        'Store responses in KV',
                        'Return aggregated data'
                    ],
                    icon: 'fas fa-server',
                    duration: '145ms'
                },
                {
                    id: 4,
                    title: 'External API Call',
                    component: 'Twelve Data API',
                    details: [
                        'GET /quote?symbol=AAPL',
                        'Real-time quote data',
                        'Quota: 800/800 remaining',
                        'Response: 2.1 KB JSON'
                    ],
                    icon: 'fas fa-cloud',
                    duration: '120ms'
                },
                {
                    id: 5,
                    title: 'Data Processing',
                    component: 'advanced-analysis.js',
                    details: [
                        'Calculate 14 indicators locally',
                        'Generate AI recommendations',
                        'Calculate composite score (0-100)',
                        'Prepare Highcharts data'
                    ],
                    icon: 'fas fa-calculator',
                    duration: '95ms'
                },
                {
                    id: 6,
                    title: 'UI Rendering',
                    component: 'Highcharts',
                    details: [
                        'Render 14 interactive charts',
                        'Candlestick (365 points)',
                        'RSI, MACD, Bollinger, etc.',
                        'AI cards + Risk metrics'
                    ],
                    icon: 'fas fa-chart-area',
                    duration: '280ms'
                },
                {
                    id: 7,
                    title: 'Analysis Complete',
                    component: 'Browser Display',
                    details: [
                        'Total time: ~630ms',
                        'Cache efficiency: 50%',
                        '✅ Data Displayed'
                    ],
                    icon: 'fas fa-desktop',
                    duration: '5ms'
                }
            ],
            totalDuration: '660ms'
        }
    ],

    // ===== TECHNICAL INDICATORS =====
    technicalIndicators: [
        {
            id: 'rsi',
            name: 'RSI (Relative Strength Index)',
            period: 14,
            formula: 'RSI = 100 - (100 / (1 + RS))',
            description: 'Where: RS = Average Gain / Average Loss',
            signals: {
                overbought: 'RSI > 70: Sell signal',
                oversold: 'RSI < 30: Buy signal',
                neutral: 'RSI = 50: Neutral'
            },
            category: 'Momentum'
        },
        {
            id: 'macd',
            name: 'MACD (Moving Average Convergence Divergence)',
            parameters: { fast: 12, slow: 26, signal: 9 },
            formula: 'MACD = EMA(12) - EMA(26)',
            description: 'Signal Line: 9-period EMA of MACD',
            signals: {
                bullish: 'MACD crosses above Signal',
                bearish: 'MACD crosses below Signal'
            },
            category: 'Trend'
        },
        {
            id: 'bollinger',
            name: 'Bollinger Bands',
            parameters: { period: 20, stdDev: 2 },
            formula: 'Upper = SMA(20) + 2×σ, Lower = SMA(20) - 2×σ',
            description: 'Volatility bands around moving average',
            signals: {
                overbought: 'Price touches upper band',
                oversold: 'Price touches lower band',
                squeeze: 'Low volatility (breakout imminent)'
            },
            category: 'Volatility'
        },
        {
            id: 'fibonacci',
            name: 'Fibonacci Retracements',
            levels: [0, 23.6, 38.2, 50, 61.8, 78.6, 100],
            extensions: [161.8, 261.8],
            formula: 'Level = High - (High - Low) × Fib_Ratio',
            description: 'Support/resistance levels based on Fibonacci ratios',
            category: 'Support/Resistance'
        },
        {
            id: 'ichimoku',
            name: 'Ichimoku Cloud',
            components: {
                tenkan: '(High₉ + Low₉) / 2',
                kijun: '(High₂₆ + Low₂₆) / 2',
                senkouA: '(Tenkan + Kijun) / 2 (shifted 26)',
                senkouB: '(High₅₂ + Low₅₂) / 2 (shifted 26)',
                chikou: 'Close (shifted 26 back)'
            },
            signals: {
                bullish: 'Price above cloud',
                bearish: 'Price below cloud'
            },
            category: 'Trend'
        },
        {
            id: 'pivots',
            name: 'Pivot Points',
            types: ['Standard', 'Fibonacci', 'Camarilla'],
            formulas: {
                standard: 'P = (High + Low + Close) / 3',
                fibonacci: 'R1 = P + 0.382(High - Low)',
                camarilla: 'R4 = Close + (High - Low) × 1.1/2'
            },
            description: 'Key support and resistance levels',
            category: 'Support/Resistance'
        },
        {
            id: 'adx',
            name: 'ADX (Average Directional Index)',
            period: 14,
            formula: 'ADX = SMA(14) of DX',
            description: 'Measures trend strength (not direction)',
            signals: {
                strongTrend: 'ADX > 25',
                weakTrend: 'ADX < 20'
            },
            category: 'Trend Strength'
        },
        {
            id: 'stochastic',
            name: 'Stochastic Oscillator',
            parameters: { k: 14, d: 3, slow: 3 },
            formula: '%K = 100 × (Close - Low₁₄) / (High₁₄ - Low₁₄)',
            description: '%D = 3-period SMA of %K',
            signals: {
                overbought: '%K > 80',
                oversold: '%K < 20'
            },
            category: 'Momentum'
        }
    ],

    // ===== MACHINE LEARNING MODELS =====
    mlModels: [
        {
            id: 'linear-regression',
            name: 'Linear Regression',
            formula: 'y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ',
            features: ['Price', 'Volume', 'MA20', 'MA50', 'RSI', 'MACD'],
            training: 'Least squares optimization',
            horizon: '1-30 days',
            accuracy: '65-70%',
            icon: 'fas fa-chart-line'
        },
        {
            id: 'ridge',
            name: 'Ridge Regression (L2)',
            formula: 'y = β₀ + Σ(βᵢxᵢ) + λΣ(βᵢ²)',
            purpose: 'Prevent overfitting in volatile markets',
            lambda: 'Auto-tuned via cross-validation',
            accuracy: '68-73%',
            icon: 'fas fa-mountain'
        },
        {
            id: 'lasso',
            name: 'Lasso Regression (L1)',
            formula: 'y = β₀ + Σ(βᵢxᵢ) + λΣ|βᵢ|',
            purpose: 'Feature selection (automatic)',
            bestFor: 'Identifying key market drivers',
            accuracy: '66-71%',
            icon: 'fas fa-filter'
        },
        {
            id: 'random-forest',
            name: 'Random Forest',
            trees: 100,
            maxDepth: 10,
            features: 'Technical indicators + volume patterns',
            bootstrap: '80% of data per tree',
            accuracy: '72-78%',
            icon: 'fas fa-tree'
        },
        {
            id: 'lstm',
            name: 'LSTM (Long Short-Term Memory)',
            architecture: '3 layers (128, 64, 32 neurons)',
            sequenceLength: 60,
            activation: 'Tanh (hidden), Linear (output)',
            training: 'Adam optimizer, MSE loss',
            epochs: 100,
            accuracy: '75-82%',
            icon: 'fas fa-brain'
        }
    ],

    // ===== STRIPE WEBHOOK EVENTS =====
    stripeWebhooks: [
        {
            event: 'checkout.session.completed',
            handler: 'handleCheckoutSessionCompleted()',
            actions: [
                'Update Firebase user plan',
                'Store Stripe customer ID',
                'Store Stripe subscription ID',
                'Send confirmation email (Resend)',
                'Generate HTML invoice',
                'Log analytics event'
            ]
        },
        {
            event: 'customer.subscription.updated',
            handler: 'handleSubscriptionUpdated()',
            actions: [
                'Sync subscription status',
                'Update trial status',
                'Update billing period',
                'Log subscription change'
            ]
        },
        {
            event: 'customer.subscription.deleted',
            handler: 'handleSubscriptionDeleted()',
            actions: [
                'Downgrade to Basic plan',
                'Set status to cancelled',
                'Remove subscription ID',
                'Send cancellation notification',
                'Log cancellation event'
            ]
        },
        {
            event: 'invoice.payment_succeeded',
            handler: 'handlePaymentSucceeded()',
            actions: [
                'Update last payment date',
                'Send payment receipt',
                'Extend subscription period',
                'Log successful payment'
            ]
        },
        {
            event: 'invoice.payment_failed',
            handler: 'handlePaymentFailed()',
            actions: [
                'Set status to past_due',
                'Set 7-day grace period',
                'Send notification email',
                'Attempt Stripe auto-retry'
            ]
        }
    ]
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DocumentationData;
}