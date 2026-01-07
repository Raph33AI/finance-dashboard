/**
 * ═══════════════════════════════════════════════════════════════════
 * DOCUMENTATION RENDERER - Main Orchestrator
 * Generates all documentation content dynamically from data
 * ═══════════════════════════════════════════════════════════════════
 */

class DocumentationRenderer {
    constructor() {
        this.data = DocumentationData;
        this.currentSection = 'overview';
        this.init();
    }

    init() {
        this.renderHeader();
        this.renderNavigation();
        this.renderAllSections();
        this.setupEventListeners();
        this.updateFooter();
        console.log('📚 Documentation V2 loaded successfully!');
        console.log('💡 Keyboard shortcuts: Ctrl+P (Print), Arrow Left/Right (Navigate tabs)');
    }

    // ===== HEADER RENDERING =====
    renderHeader() {
        const header = document.getElementById('docHeader');
        if (!header) return;

        const metadata = this.data.metadata;
        header.innerHTML = `
            <div class="doc-header-content">
                <h1 class="doc-title">
                    <i class="fas fa-book"></i>
                    ${metadata.title}
                </h1>
                <p class="doc-subtitle">${metadata.subtitle}</p>
                
                <div class="doc-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span id="currentDate"></span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-code-branch"></i>
                        <span>Version ${metadata.version}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-server"></i>
                        <span>${metadata.environment}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-shield-alt"></i>
                        <span>${metadata.accessLevel}</span>
                    </div>
                </div>
            </div>
        `;

        // Set current date
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // ===== NAVIGATION RENDERING =====
    renderNavigation() {
        const nav = document.getElementById('docNav');
        if (!nav) return;

        const sections = [
            { id: 'overview', icon: 'fas fa-home', label: 'Overview' },
            { id: 'architecture', icon: 'fas fa-sitemap', label: 'Architecture' },
            { id: 'frontend', icon: 'fas fa-desktop', label: 'Frontend' },
            { id: 'backend', icon: 'fas fa-server', label: 'Backend' },
            { id: 'flows', icon: 'fas fa-stream', label: 'Data Flows' },
            { id: 'payments', icon: 'fas fa-credit-card', label: 'Payments' },
            { id: 'security', icon: 'fas fa-shield-alt', label: 'Security' },
            { id: 'apis', icon: 'fas fa-plug', label: 'APIs & Workers' },
            { id: 'calculations', icon: 'fas fa-calculator', label: 'Calculations' },
            { id: 'extractor', icon: 'fas fa-file-code', label: 'Code Extractor' }
        ];

        const tabsHTML = sections.map(section => `
            <button class="nav-tab ${section.id === 'overview' ? 'active' : ''}" data-section="${section.id}">
                <i class="${section.icon}"></i> ${section.label}
            </button>
        `).join('');

        nav.innerHTML = `<div class="nav-tabs">${tabsHTML}</div>`;
    }

    // ===== ALL SECTIONS RENDERING =====
    renderAllSections() {
        const content = document.getElementById('docContent');
        if (!content) return;

        content.innerHTML = `
            ${this.renderOverviewSection()}
            ${this.renderArchitectureSection()}
            ${this.renderFrontendSection()}
            ${this.renderBackendSection()}
            ${this.renderFlowsSection()}
            ${this.renderPaymentsSection()}
            ${this.renderSecuritySection()}
            ${this.renderAPIsSection()}
            ${this.renderCalculationsSection()}
            ${this.renderExtractorSection()}
        `;
    }

    // ===== SECTION 1: OVERVIEW =====
    renderOverviewSection() {
        const stats = this.data.statistics;
        const performance = this.data.performance;
        const features = this.data.coreFeatures;

        return `
            <section class="doc-section active" id="overview">
                <h2 class="section-title">
                    <i class="fas fa-home"></i>
                    Platform Overview
                </h2>

                <div class="info-card">
                    <h3><i class="fas fa-info-circle"></i> About AlphaVault AI</h3>
                    <p>
                        AlphaVault AI is a <strong>premium financial intelligence platform</strong> combining real-time market data analysis, 
                        advanced predictive models powered by machine learning, and artificial intelligence to provide 
                        professional-grade financial insights for investors, analysts, and financial professionals.
                    </p>
                </div>

                <h3 class="subsection-title">
                    <i class="fas fa-chart-line"></i> Platform Statistics
                </h3>
                <div id="platform-stats"></div>

                <h3 class="subsection-title">
                    <i class="fas fa-layer-group"></i> Technology Stack
                </h3>
                <div id="tech-stack"></div>

                <h3 class="subsection-title">
                    <i class="fas fa-puzzle-piece"></i> Core Features
                </h3>
                <div id="core-features-table"></div>

                <h3 class="subsection-title">
                    <i class="fas fa-rocket"></i> Performance Metrics
                </h3>
                <div id="performance-stats"></div>
            </section>
        `;
    }

    // ===== SECTION 2: ARCHITECTURE =====
    renderArchitectureSection() {
        return `
            <section class="doc-section" id="architecture">
                <h2 class="section-title">
                    <i class="fas fa-sitemap"></i>
                    Global Architecture
                </h2>

                <div class="info-card">
                    <h3><i class="fas fa-info-circle"></i> Distributed Serverless Architecture</h3>
                    <p>
                        AlphaVault AI uses a <strong>fully serverless architecture</strong> hosted on Cloudflare's global edge network, 
                        ensuring ultra-low latency (&lt;50ms) for users worldwide. The platform leverages Firebase for authentication 
                        and data storage, Stripe for payment processing, and 10+ Cloudflare Workers for backend logic.
                    </p>
                </div>

                <h3 class="subsection-title">
                    <i class="fas fa-network-wired"></i> System Architecture Diagram
                </h3>
                <div id="architecture-diagram"></div>

                <h3 class="subsection-title">
                    <i class="fas fa-database"></i> Data Storage Architecture
                </h3>
                <div id="storage-architecture"></div>
            </section>
        `;
    }

    // ===== SECTION 3: FRONTEND =====
    renderFrontendSection() {
        return `
            <section class="doc-section" id="frontend">
                <h2 class="section-title">
                    <i class="fas fa-desktop"></i>
                    Frontend - Structure & Organization
                </h2>

                <div class="info-card">
                    <h3><i class="fas fa-info-circle"></i> Modern Frontend Architecture</h3>
                    <p>
                        AlphaVault AI uses a <strong>vanilla JavaScript architecture</strong> (no frameworks) with a focus on 
                        performance, accessibility, and maintainability. All code is written in ES6+ with modular design patterns.
                    </p>
                </div>

                <h3 class="subsection-title">
                    <i class="fas fa-folder-tree"></i> Project Structure
                </h3>
                <div id="project-structure"></div>
            </section>
        `;
    }

    // ===== SECTION 4: BACKEND =====
    renderBackendSection() {
        return `
            <section class="doc-section" id="backend">
                <h2 class="section-title">
                    <i class="fas fa-server"></i>
                    Backend - Services & Infrastructure
                </h2>

                <div class="info-card">
                    <h3><i class="fas fa-info-circle"></i> Serverless Backend Architecture</h3>
                    <p>
                        AlphaVault AI's backend is <strong>100% serverless</strong>, leveraging Firebase for authentication and data storage, 
                        Cloudflare Workers for edge computing, Stripe for payment processing, and Resend for email delivery. 
                        This architecture ensures <strong>zero maintenance, infinite scalability, and global low latency</strong>.
                    </p>
                </div>

                <h3 class="subsection-title">
                    <i class="fas fa-cloud"></i> Cloudflare Workers (${this.data.cloudflareWorkers.length}+ Serverless APIs)
                </h3>
                <div id="cloudflare-workers"></div>
            </section>
        `;
    }

    // ===== SECTION 5: DATA FLOWS =====
    renderFlowsSection() {
        return `
            <section class="doc-section" id="flows">
                <h2 class="section-title">
                    <i class="fas fa-stream"></i>
                    Data Flows & Processes
                </h2>

                <div class="info-card">
                    <h3><i class="fas fa-info-circle"></i> About Data Flows</h3>
                    <p>
                        This section documents the three main data flows in AlphaVault AI: <strong>user registration</strong>, 
                        <strong>payment processing</strong>, and <strong>market data retrieval</strong>. Each flow shows the 
                        complete journey from user action to final result with detailed technical steps.
                    </p>
                </div>

                <h3 class="subsection-title">
                    <i class="fas fa-user-plus"></i> 1. User Registration Flow
                </h3>
                <div id="flow-user-registration"></div>

                <h3 class="subsection-title">
                    <i class="fas fa-credit-card"></i> 2. Stripe Payment Flow
                </h3>
                <div id="flow-stripe-payment"></div>

                <h3 class="subsection-title">
                    <i class="fas fa-chart-line"></i> 3. Market Data Retrieval Flow
                </h3>
                <div id="flow-market-data"></div>
            </section>
        `;
    }

    // ===== SECTION 6: PAYMENTS =====
    renderPaymentsSection() {
        return `
            <section class="doc-section" id="payments">
                <h2 class="section-title">
                    <i class="fas fa-credit-card"></i>
                    Payment System & Subscriptions
                </h2>

                <div class="info-card">
                    <h3><i class="fas fa-info-circle"></i> Complete Stripe Integration</h3>
                    <p>
                        AlphaVault AI uses <strong>Stripe</strong> for subscription management with a <strong>14-day free trial</strong>, 
                        custom promo codes (percentage discounts, free access, trial extensions), and automated email confirmations 
                        with professional HTML invoices sent via <strong>Resend API</strong>.
                    </p>
                </div>

                <h3 class="subsection-title">
                    <i class="fas fa-tags"></i> Pricing Plans & Features
                </h3>
                <div id="pricing-plans"></div>

                <h3 class="subsection-title">
                    <i class="fas fa-ticket-alt"></i> Promo Codes System
                </h3>
                <div id="promo-codes"></div>

                <h3 class="subsection-title">
                    <i class="fas fa-bell"></i> Stripe Webhook Events
                </h3>
                <div id="stripe-webhooks"></div>
            </section>
        `;
    }

    // ===== SECTION 7: SECURITY =====
    renderSecuritySection() {
        return `
            <section class="doc-section" id="security">
                <h2 class="section-title">
                    <i class="fas fa-shield-alt"></i>
                    Security & Access Control
                </h2>

                <div class="info-card">
                    <h3><i class="fas fa-info-circle"></i> Multi-Layer Security Architecture</h3>
                    <p>
                        AlphaVault AI implements a <strong>defense-in-depth security strategy</strong> with multiple layers: 
                        TLS 1.3 encryption, Firebase JWT authentication, Firestore security rules, plan-based access control, 
                        CORS protection, API key rotation, and real-time activity monitoring.
                    </p>
                </div>

                <h3 class="subsection-title">
                    <i class="fas fa-lock"></i> Authentication System
                </h3>
                <div id="authentication-system"></div>

                <h3 class="subsection-title">
                    <i class="fas fa-shield-virus"></i> Security Measures
                </h3>
                <div id="security-measures"></div>
            </section>
        `;
    }

    // ===== SECTION 8: APIs & WORKERS =====
    renderAPIsSection() {
        return `
            <section class="doc-section" id="apis">
                <h2 class="section-title">
                    <i class="fas fa-plug"></i>
                    APIs & Cloudflare Workers
                </h2>

                <div class="info-card">
                    <h3><i class="fas fa-info-circle"></i> Serverless Backend Infrastructure</h3>
                    <p>
                        AlphaVault AI's backend is powered by <strong>10+ Cloudflare Workers</strong> deployed on the edge network, 
                        providing ultra-low latency (&lt;50ms), infinite scalability, and zero server maintenance. 
                        Each worker is optimized for specific tasks (API proxying, payment processing, email delivery, analytics).
                    </p>
                </div>

                <h3 class="subsection-title">
                    <i class="fas fa-server"></i> Complete Workers List
                </h3>
                <div id="apis-workers-list"></div>
            </section>
        `;
    }

    // ===== SECTION 9: CALCULATIONS =====
    renderCalculationsSection() {
        return `
            <section class="doc-section" id="calculations">
                <h2 class="section-title">
                    <i class="fas fa-calculator"></i>
                    Calculations & Financial Algorithms
                </h2>

                <div class="info-card">
                    <h3><i class="fas fa-info-circle"></i> Advanced Financial Modeling</h3>
                    <p>
                        AlphaVault AI implements <strong>professional-grade financial algorithms</strong> including machine learning models, 
                        Monte Carlo simulations, portfolio optimization (Markowitz, Risk Parity), and 14 Wall Street technical indicators 
                        used by institutional investors.
                    </p>
                </div>

                <h3 class="subsection-title">
                    <i class="fas fa-brain"></i> Machine Learning Models
                </h3>
                <div id="ml-models"></div>

                <h3 class="subsection-title">
                    <i class="fas fa-signal"></i> Technical Indicators (14 Indicators)
                </h3>
                <div id="technical-indicators"></div>
            </section>
        `;
    }

    // ===== SECTION 10: CODE EXTRACTOR =====
    renderExtractorSection() {
        return `
            <section class="doc-section" id="extractor">
                <h2 class="section-title">
                    <i class="fas fa-file-code"></i>
                    Architecture Code Extractor
                </h2>

                <div class="info-card">
                    <h3><i class="fas fa-info-circle"></i> Extract Your Complete Codebase</h3>
                    <p>
                        This tool automatically scans your <strong>GitHub repository</strong> and generates a comprehensive report 
                        including all HTML, CSS, and JavaScript files with detailed analysis of functions, scripts, integrations, 
                        and component counts. Perfect for documentation, audits, and architecture reviews.
                    </p>
                </div>

                <div class="extractor-container">
                    <h3><i class="fas fa-cog"></i> Configuration</h3>

                    <div style="margin-bottom: 20px;">
                        <label><i class="fab fa-github"></i> GitHub Username:</label>
                        <input type="text" id="extractorUsername" placeholder="ex: raphnardone">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label><i class="fas fa-code-branch"></i> Repository Name:</label>
                        <input type="text" id="extractorRepo" placeholder="ex: alphavault-ai">
                    </div>

                    <div style="margin-bottom: 20px;">
                        <label><i class="fas fa-layer-group"></i> Analysis Level:</label>
                        <select id="extractorLevel">
                            <option value="basic">Basic (Structure + File sizes)</option>
                            <option value="deep">Deep (+ Content analysis)</option>
                            <option value="ultra" selected>Ultra Deep (+ Detailed functions & scripts)</option>
                        </select>
                    </div>

                    <button onclick="startExtraction()" id="extractorBtn">
                        <i class="fas fa-play"></i> Start Extraction
                    </button>
                    <button onclick="downloadExtraction()" id="extractorDownloadBtn" style="display: none; background: var(--gradient-success);">
                        <i class="fas fa-download"></i> Download Report
                    </button>

                    <div id="extractorLoading" style="display: none; text-align: center; padding: 20px;">
                        <div style="border: 3px solid #f3f4f6; border-top: 3px solid #667eea; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 10px;"></div>
                        <div style="color: #667eea;">Scanning repository...</div>
                    </div>

                    <div id="extractorStats" style="display: none;"></div>
                    <div id="extractorOutput" style="display: none; margin-top: 30px; padding: 20px; background: #1E293B; color: #E2E8F0; border-radius: 12px; border-left: 4px solid #667eea; white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 0.85rem; max-height: 600px; overflow-y: auto;"></div>
                </div>

                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </section>
        `;
    }

    // ===== POPULATE DYNAMIC CONTENT =====
    populateDynamicContent() {
        // Overview section
        this.populateElement('platform-stats', DocumentationComponents.generateStatsGrid(this.data.statistics));
        this.populateElement('tech-stack', DocumentationComponents.generateTechStackCards(this.data.techStack));
        this.populateElement('core-features-table', this.generateFeaturesTable());
        this.populateElement('performance-stats', DocumentationComponents.generateStatsGrid(this.data.performance));

        // Architecture section
        this.populateElement('architecture-diagram', this.generateArchitectureDiagram());
        this.populateElement('storage-architecture', this.generateStorageTable());

        // Frontend section
        this.populateElement('project-structure', this.generateProjectStructure());

        // Backend section
        this.populateElement('cloudflare-workers', DocumentationComponents.generateWorkersCards(this.data.cloudflareWorkers));

        // Payments section
        this.populateElement('pricing-plans', DocumentationComponents.generatePricingGrid(this.data.pricingPlans));
        this.populateElement('promo-codes', DocumentationComponents.generatePromoCodesTable(this.data.promoCodes));
        this.populateElement('stripe-webhooks', this.generateWebhooksTable());

        // Security section
        this.populateElement('authentication-system', this.generateAuthTable());
        this.populateElement('security-measures', this.generateSecurityCards());

        // APIs section
        this.populateElement('apis-workers-list', DocumentationComponents.generateWorkersCards(this.data.cloudflareWorkers));

        // Calculations section
        this.populateElement('ml-models', this.generateMLModelsCards());
        this.populateElement('technical-indicators', this.generateIndicatorsGrid());
    }

    populateElement(id, content) {
        const element = document.getElementById(id);
        if (element && content) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else {
                element.innerHTML = '';
                element.appendChild(content);
            }
        }
    }

    // ===== HELPER: FEATURES TABLE =====
    generateFeaturesTable() {
        const features = this.data.coreFeatures;
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 25%;">Feature</th>
                        <th style="width: 45%;">Description</th>
                        <th style="width: 15%;">Plan Required</th>
                        <th style="width: 15%;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${features.map(feature => `
                        <tr>
                            <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <i class="${feature.icon}" style="color: var(--primary); font-size: 1.2rem;"></i>
                                    <strong>${feature.name}</strong>
                                </div>
                            </td>
                            <td>${feature.description}</td>
                            <td>${this.getPlanBadge(feature.plan)}</td>
                            <td>${this.getStatusBadge(feature.status)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    getPlanBadge(plan) {
        const badges = {
            free: '<span class="badge">Free</span>',
            basic: '<span class="badge primary">Basic</span>',
            pro: '<span class="badge success">Pro</span>',
            platinum: '<span class="badge warning">Platinum</span>'
        };
        return badges[plan] || plan;
    }

    getStatusBadge(status) {
        return status === 'active' 
            ? '<span class="badge success">Active</span>' 
            : '<span class="badge">Inactive</span>';
    }

    // ===== HELPER: ARCHITECTURE DIAGRAM =====
    generateArchitectureDiagram() {
        return `
            <div style="background: white; border: 2px solid var(--border); border-radius: 20px; padding: 40px; margin: 32px 0;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="display: inline-block; background: var(--gradient-primary); color: white; padding: 16px 32px; border-radius: 16px; font-size: 1.3rem; font-weight: 800; box-shadow: var(--shadow-md);">
                        🌍 User Layer → 🌐 CDN → 💻 Frontend → ⚙ Backend → 🔌 External APIs
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px;">
                    ${this.createArchitectureBox('🌍', 'User Layer', 'Desktop, Mobile, Tablet', '#10b981')}
                    ${this.createArchitectureBox('🌐', 'CDN Layer', 'Cloudflare Pages', '#3b82f6')}
                    ${this.createArchitectureBox('💻', 'Frontend', '65 HTML + 112 JS', '#8b5cf6')}
                    ${this.createArchitectureBox('⚙', 'Backend', '10+ Workers', '#f59e0b')}
                    ${this.createArchitectureBox('🔌', 'APIs', 'Twelve Data, SEC, Gemini', '#ef4444')}
                </div>
            </div>
        `;
    }

    createArchitectureBox(icon, title, description, color) {
        return `
            <div style="background: linear-gradient(135deg, ${color}15, ${color}05); border: 2px solid ${color}; border-radius: 16px; padding: 24px; text-align: center; transition: var(--transition-smooth); cursor: pointer;" 
                onmouseenter="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 12px 40px ${color}30';" 
                onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                <div style="font-size: 3rem; margin-bottom: 12px;">${icon}</div>
                <div style="font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-bottom: 8px;">${title}</div>
                <div style="font-size: 0.85rem; color: #64748b;">${description}</div>
            </div>
        `;
    }

    // ===== HELPER: STORAGE TABLE =====
    generateStorageTable() {
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Storage Type</th>
                        <th>Service</th>
                        <th>Purpose</th>
                        <th>Data Examples</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>NoSQL Database</strong></td>
                        <td>Firebase Firestore</td>
                        <td>User profiles, posts, messages, analytics</td>
                        <td><code>/users</code>, <code>/posts</code>, <code>/conversations</code></td>
                    </tr>
                    <tr>
                        <td><strong>Key-Value Store</strong></td>
                        <td>Cloudflare KV</td>
                        <td>API response caching, quota tracking</td>
                        <td><code>CACHE</code>, <code>SIMULATIONS_KV</code>, <code>QUOTA_KV</code></td>
                    </tr>
                    <tr>
                        <td><strong>Object Storage</strong></td>
                        <td>Firebase Storage</td>
                        <td>User uploads (profile pictures, attachments)</td>
                        <td><code>/users/{uid}/profile.jpg</code></td>
                    </tr>
                    <tr>
                        <td><strong>Session Storage</strong></td>
                        <td>Browser LocalStorage</td>
                        <td>JWT tokens, user preferences, theme settings</td>
                        <td><code>firebaseAuthToken</code>, <code>darkMode</code></td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    // ===== HELPER: PROJECT STRUCTURE =====
    generateProjectStructure() {
        return `
            <div class="code-block">
                <div class="code-header">
                    <span class="code-lang">Folder Structure</span>
                </div>
                <pre>alphavault-ai/
├── assets/
│   ├── css/                          (49 files - 1.8 MB)
│   │   ├── common.css                (2,090 lines)
│   │   ├── landing.css               (5,886 lines)
│   │   ├── community.css             (6,890 lines)
│   │   └── ... (46 other files)
│   │
│   ├── js/                           (112 files - 8.5 MB)
│   │   ├── admin-analytics.js        (7,846 lines)
│   │   ├── investment-analytics.js   (4,869 lines)
│   │   ├── advanced-analysis.js      (4,292 lines)
│   │   └── ... (109 other files)
│   │
│   └── images/                       (Logos, favicons, illustrations)
│
├── index.html                        (Homepage - 1,951 lines)
├── dashboard-financier.html          (Budget dashboard)
├── advanced-analysis.html            (14 indicators + AI)
└── ... (62 other pages)</pre>
            </div>
        `;
    }

    // ===== HELPER: WEBHOOKS TABLE =====
    generateWebhooksTable() {
        const webhooks = this.data.stripeWebhooks;
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 30%;">Event Type</th>
                        <th style="width: 30%;">Handler Function</th>
                        <th style="width: 40%;">Actions Performed</th>
                    </tr>
                </thead>
                <tbody>
                    ${webhooks.map(webhook => `
                        <tr>
                            <td><code>${webhook.event}</code></td>
                            <td><code>${webhook.handler}</code></td>
                            <td>
                                <ul style="margin: 0; padding-left: 20px; font-size: 0.9rem;">
                                    ${webhook.actions.map(action => `<li>${action}</li>`).join('')}
                                </ul>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // ===== HELPER: AUTH TABLE =====
    generateAuthTable() {
        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 25%;">Component</th>
                        <th style="width: 35%;">Technology</th>
                        <th style="width: 40%;">Implementation Details</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Email/Password Auth</strong></td>
                        <td>Firebase Authentication</td>
                        <td>
                            • Bcrypt password hashing (cost factor: 10)<br>
                            • Min password length: 6 characters<br>
                            • Email verification required
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Google OAuth 2.0</strong></td>
                        <td>Firebase GoogleAuthProvider</td>
                        <td>
                            • One-click sign-in/sign-up<br>
                            • Automatic account linking<br>
                            • Profile data import (name, photo)
                        </td>
                    </tr>
                    <tr>
                        <td><strong>JWT Tokens</strong></td>
                        <td>Firebase Auth Tokens</td>
                        <td>
                            • RS256 signature algorithm<br>
                            • 1-hour expiration (auto-refresh)<br>
                            • Secure storage (localStorage)
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
    }

    // ===== HELPER: SECURITY CARDS =====
    generateSecurityCards() {
        const measures = [
            { icon: 'fas fa-lock', title: 'TLS 1.3 Encryption', desc: 'All communication encrypted with TLS 1.3, AES-256-GCM cipher', color: '#10b981' },
            { icon: 'fas fa-globe', title: 'CORS Protection', desc: 'Strict CORS policies on all Workers (alphavault-ai.com only)', color: '#3b82f6' },
            { icon: 'fas fa-tachometer-alt', title: 'Rate Limiting', desc: 'YouTube API: 60 req/min, Email: 100/hour', color: '#f59e0b' },
            { icon: 'fas fa-chart-line', title: 'Activity Monitoring', desc: 'Real-time tracking in /analytics_activity', color: '#8b5cf6' }
        ];

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 24px 0;">
                ${measures.map(measure => `
                    <div style="background: white; border: 2px solid ${measure.color}; border-radius: 16px; padding: 24px; transition: var(--transition-smooth); cursor: pointer;" 
                        onmouseenter="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 12px 40px ${measure.color}30';" 
                        onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                        <div style="width: 60px; height: 60px; background: ${measure.color}; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 8px 24px ${measure.color}40;">
                            <i class="${measure.icon}" style="font-size: 1.8rem; color: white;"></i>
                        </div>
                        <h4 style="margin: 0 0 8px; font-size: 1.2rem; color: #1e293b;">${measure.title}</h4>
                        <p style="margin: 0; color: #64748b; font-size: 0.9rem; line-height: 1.5;">${measure.desc}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ===== HELPER: ML MODELS CARDS =====
    generateMLModelsCards() {
        const models = this.data.mlModels;
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin: 24px 0;">
                ${models.map((model, index) => {
                    const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
                    const color = colors[index % colors.length];
                    return `
                        <div style="background: white; border: 2px solid ${color}; border-radius: 20px; padding: 28px; transition: var(--transition-smooth); cursor: pointer;" 
                            onmouseenter="this.style.transform='translateY(-6px)'; this.style.boxShadow='0 12px 40px ${color}30';" 
                            onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
                                <div style="width: 60px; height: 60px; background: ${color}; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px ${color}40;">
                                    <i class="${model.icon}" style="font-size: 1.8rem; color: white;"></i>
                                </div>
                                <div>
                                    <h4 style="margin: 0 0 4px; font-size: 1.3rem; color: #1e293b;">${model.name}</h4>
                                    <div style="font-size: 0.9rem; color: #64748b; font-weight: 600;">Accuracy: <span style="color: ${color}; font-weight: 800;">${model.accuracy}</span></div>
                                </div>
                            </div>
                            <div style="background: ${color}10; border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                                <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 4px; font-weight: 600;">Formula:</div>
                                <code style="font-size: 0.85rem; color: ${color}; display: block; word-wrap: break-word;">${model.formula}</code>
                            </div>
                            ${model.purpose ? `<div style="font-size: 0.9rem; color: #475569; margin-bottom: 8px;"><strong>Purpose:</strong> ${model.purpose}</div>` : ''}
                            ${model.bestFor ? `<div style="font-size: 0.9rem; color: #475569;"><strong>Best for:</strong> ${model.bestFor}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // ===== HELPER: TECHNICAL INDICATORS =====
    generateIndicatorsGrid() {
        const indicators = this.data.technicalIndicators;
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 24px; margin: 24px 0;">
                ${indicators.map((indicator, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];
                    const color = colors[index % colors.length];
                    return `
                        <div style="background: white; border: 2px solid ${color}; border-radius: 16px; padding: 24px; transition: var(--transition-smooth);" 
                            onmouseenter="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 32px ${color}30';" 
                            onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                                <div style="width: 50px; height: 50px; background: ${color}; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-chart-line" style="color: white; font-size: 1.4rem;"></i>
                                </div>
                                <h4 style="margin: 0; font-size: 1.2rem; color: #1e293b; font-weight: 800;">${indicator.name}</h4>
                            </div>
                            <div style="background: ${color}10; border-radius: 10px; padding: 12px; margin-bottom: 12px;">
                                <div style="font-size: 0.8rem; color: #64748b; margin-bottom: 4px; font-weight: 600;">Formula:</div>
                                <code style="font-size: 0.85rem; color: ${color}; display: block;">${indicator.formula}</code>
                            </div>
                            <div style="font-size: 0.9rem; color: #475569; margin-bottom: 12px;">${indicator.description}</div>
                            <div style="padding-top: 12px; border-top: 2px solid #f1f5f9;">
                                <div style="font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Category: ${indicator.category}</div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const sectionId = e.currentTarget.dataset.section;
                this.switchSection(sectionId);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
            }

            const tabs = Array.from(document.querySelectorAll('.nav-tab'));
            const activeIndex = tabs.findIndex(tab => tab.classList.contains('active'));

            if (e.key === 'ArrowRight' && activeIndex < tabs.length - 1) {
                tabs[activeIndex + 1].click();
            } else if (e.key === 'ArrowLeft' && activeIndex > 0) {
                tabs[activeIndex - 1].click();
            }
        });

        // Populate dynamic content after a short delay
        setTimeout(() => this.populateDynamicContent(), 100);
    }

    switchSection(sectionId) {
        // Update tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.section === sectionId);
        });

        // Update sections
        document.querySelectorAll('.doc-section').forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });

        // Scroll to top
        document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
        this.currentSection = sectionId;
    }

    updateFooter() {
        const versionEl = document.getElementById('footerVersion');
        const dateEl = document.getElementById('footerDate');

        if (versionEl) versionEl.textContent = this.data.metadata.version;
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }
}

// ===== AUTO-INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    if (typeof DocumentationData !== 'undefined') {
        window.docRenderer = new DocumentationRenderer();
    } else {
        console.error('❌ DocumentationData not loaded! Make sure documentation-data.js is included before this script.');
    }
});

// ===== GITHUB EXTRACTOR FUNCTIONS (Global scope for onclick) =====
let extractorData = '';

async function startExtraction() {
    const username = document.getElementById('extractorUsername').value.trim();
    const repo = document.getElementById('extractorRepo').value.trim();

    if (!username || !repo) {
        alert('⚠ Please enter both username and repository name');
        return;
    }

    document.getElementById('extractorBtn').disabled = true;
    document.getElementById('extractorLoading').style.display = 'block';
    document.getElementById('extractorOutput').style.display = 'none';

    try {
        const files = await scanGitHubRepo(username, repo);
        
        const htmlFiles = files.filter(f => f.name.endsWith('.html'));
        const cssFiles = files.filter(f => f.name.endsWith('.css'));
        const jsFiles = files.filter(f => f.name.endsWith('.js'));

        let report = `
╔════════════════════════════════════════════════════════════════════╗
║        ALPHAVAULT AI - COMPLETE ARCHITECTURE REPORT                ║
║        Generated: ${new Date().toLocaleString()}                   ║
╚════════════════════════════════════════════════════════════════════╝

📊 GLOBAL STATISTICS
════════════════════════════════════════════════════════════════════

• HTML Pages: ${htmlFiles.length}
• CSS Files: ${cssFiles.length}
• JavaScript Files: ${jsFiles.length}
• Total Files: ${files.length}

📄 HTML PAGES (${htmlFiles.length})
════════════════════════════════════════════════════════════════════

${htmlFiles.map((file, i) => `${i + 1}. ${file.path}`).join('\n')}

🎨 CSS FILES (${cssFiles.length})
════════════════════════════════════════════════════════════════════

${cssFiles.map((file, i) => `${i + 1}. ${file.path}`).join('\n')}

📜 JAVASCRIPT FILES (${jsFiles.length})
════════════════════════════════════════════════════════════════════

${jsFiles.map((file, i) => `${i + 1}. ${file.path}`).join('\n')}
`;

        extractorData = report;
        document.getElementById('extractorOutput').textContent = report;
        document.getElementById('extractorOutput').style.display = 'block';
        document.getElementById('extractorDownloadBtn').style.display = 'inline-block';

        const statsHtml = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-top: 20px;">
                <div style="background: var(--gradient-primary); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 800;">${htmlFiles.length}</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">HTML Pages</div>
                </div>
                <div style="background: var(--gradient-success); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 800;">${cssFiles.length}</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">CSS Files</div>
                </div>
                <div style="background: var(--gradient-warning); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 2rem; font-weight: 800;">${jsFiles.length}</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">JS Files</div>
                </div>
            </div>
        `;
        document.getElementById('extractorStats').innerHTML = statsHtml;
        document.getElementById('extractorStats').style.display = 'grid';

    } catch (error) {
        alert('❌ Error: ' + error.message);
    } finally {
        document.getElementById('extractorLoading').style.display = 'none';
        document.getElementById('extractorBtn').disabled = false;
    }
}

async function scanGitHubRepo(username, repo, path = '') {
    const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Repository not found or API rate limit exceeded');

    const items = await response.json();
    let allFiles = [];

    for (const item of items) {
        if (item.type === 'dir') {
            if (['node_modules', '.git', 'dist'].includes(item.name)) continue;
            const subFiles = await scanGitHubRepo(username, repo, item.path);
            allFiles = allFiles.concat(subFiles);
        } else {
            allFiles.push(item);
        }
    }

    return allFiles;
}

function downloadExtraction() {
    const blob = new Blob([extractorData], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alphavault-architecture-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}