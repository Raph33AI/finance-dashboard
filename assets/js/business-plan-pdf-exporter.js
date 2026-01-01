/**
 * ════════════════════════════════════════════════════════════════
 * BUSINESS PLAN PDF EXPORTER v10.0 (html2pdf.js)
 * Génère le PDF côté client avec pagination optimisée
 * Version sans emojis - Formatage professionnel
 * ════════════════════════════════════════════════════════════════
 */

class BusinessPlanPDFExporter {
    constructor() {
        this.workerUrl = 'https://business-plan-pdf-worker.raphnardone.workers.dev';
        this.init();
    }

    init() {
        const exportBtn = document.getElementById('exportPdfBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.openModal());
        }

        document.getElementById('closePdfModal')?.addEventListener('click', () => this.closeModal());
        document.getElementById('cancelPdfBtn')?.addEventListener('click', () => this.closeModal());
        document.getElementById('sendPdfBtn')?.addEventListener('click', () => this.sendPDF());
        document.querySelector('.pdf-modal-overlay')?.addEventListener('click', () => this.closeModal());
    }

    openModal() {
        const modal = document.getElementById('pdfEmailModal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('recipientEmails').focus();
        }
    }

    closeModal() {
        const modal = document.getElementById('pdfEmailModal');
        if (modal) modal.classList.remove('active');
    }

    /**
     * GÉNÉRER PDF AVEC html2pdf.js ET ENVOYER
     */
    async sendPDF() {
        try {
            console.log('Initiating PDF export...');
            
            const emails = this.getEmails();
            if (emails.length === 0) {
                this.showNotification('No recipients', 'Please enter at least one email address.', 'warning');
                return;
            }

            const subject = document.getElementById('emailSubject').value.trim();
            const message = document.getElementById('emailMessage').value.trim();
            const includeSimulator = document.getElementById('includeSimulator').checked;

            this.showProgress(0, 'Preparing document...');

            // CRÉER LE HTML
            const htmlContent = this.createBusinessPlanHTML(includeSimulator);
            console.log('HTML length:', htmlContent.length, 'characters');

            this.showProgress(20, 'Generating PDF with html2pdf.js...');

            // GÉNÉRER PDF
            const pdfBlob = await this.generatePDFWithHtml2Pdf(htmlContent);
            console.log('PDF Blob size:', pdfBlob.size, 'bytes');
            
            // VÉRIFIER SI LE PDF EST TROP PETIT
            if (pdfBlob.size < 5000) {
                console.warn('PDF size is suspiciously small! Might be blank.');
                
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'debug-blank-pdf.pdf';
                a.click();
                URL.revokeObjectURL(url);
                
                throw new Error('Generated PDF is too small (probably blank). Check console logs.');
            }

            this.showProgress(60, 'Converting to Base64...');

            // CONVERTIR EN BASE64
            const pdfBase64 = await this.blobToBase64(pdfBlob);
            console.log('Base64 length:', pdfBase64.length, 'characters');

            this.showProgress(70, 'Sending to server...');

            // ENVOYER AU WORKER
            const response = await fetch(this.workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    emails, 
                    subject, 
                    message, 
                    pdfBase64 
                })
            });

            this.showProgress(90, 'Processing...');

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Server error');
            }

            this.showProgress(100, 'PDF sent!');
            await this.wait(1000);

            this.closeModal();
            this.hideProgress();
            this.showNotification('PDF Sent!', `Sent to ${emails.length} recipient(s).`, 'success');

        } catch (error) {
            console.error('PDF Error:', error);
            this.hideProgress();
            this.showNotification('Error', error.message, 'error');
        }
    }

    /**
     * GÉNÉRER PDF AVEC html2pdf.js (VERSION OPTIMISÉE PAGINATION)
     */
    async generatePDFWithHtml2Pdf(htmlContent) {
        console.log('Creating temporary container...');
        
        // Créer un conteneur VISIBLE mais caché
        const container = document.createElement('div');
        container.id = 'pdf-temp-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 210mm;
            overflow: hidden;
            z-index: -9999;
            opacity: 0;
            pointer-events: none;
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        tempDiv.style.cssText = `
            width: 210mm;
            background: white;
            position: relative;
        `;
        
        container.appendChild(tempDiv);
        document.body.appendChild(container);

        try {
            console.log('Waiting for DOM to render...');
            
            // ATTENDRE que le navigateur rende le DOM
            await this.wait(500);

            console.log('Generating PDF with html2pdf.js...');

            // OPTIONS OPTIMISÉES POUR PAGINATION PARFAITE
            const options = {
                margin: [15, 15, 15, 15], // Marges augmentées pour éviter les coupures
                filename: `AlphaVault_BusinessPlan_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { 
                    type: 'jpeg', 
                    quality: 0.98 
                },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    letterRendering: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    windowWidth: 794, // A4 width en pixels à 96 DPI
                    windowHeight: 1123 // A4 height en pixels à 96 DPI
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true,
                    precision: 16
                },
                pagebreak: { 
                    mode: ['css', 'legacy'], // Mode CSS en priorité
                    before: ['.page-break-before', '.section'],
                    after: ['.page-break-after', '.cover-page'],
                    avoid: ['.avoid-break', 'table', '.highlight-card', '.pricing-card', '.value-prop-item', '.roadmap-item', '.risk-card']
                }
            };

            // Générer le PDF
            const pdfBlob = await html2pdf()
                .set(options)
                .from(tempDiv)
                .toPdf()
                .output('blob');

            console.log('PDF generated successfully:', pdfBlob.size, 'bytes');

            return pdfBlob;

        } catch (error) {
            console.error('PDF Generation Error:', error);
            throw new Error(`PDF generation failed: ${error.message}`);
        } finally {
            // Nettoyer après un délai
            setTimeout(() => {
                if (document.body.contains(container)) {
                    document.body.removeChild(container);
                    console.log('Temporary container removed');
                }
            }, 1000);
        }
    }

    /**
     * CONVERTIR BLOB EN BASE64
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * ════════════════════════════════════════════════════════════════
     * CRÉATION DU HTML COMPLET DU BUSINESS PLAN (SANS EMOJIS)
     * ════════════════════════════════════════════════════════════════
     */
    createBusinessPlanHTML(includeSimulator) {
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>AlphaVault AI - Business Plan</title>
        <style>${this.getBusinessPlanCSS()}</style>
    </head>
    <body>

        <!-- PAGE DE GARDE -->
        <div class="cover-page page-break-after">
            <div class="cover-logo">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width: 140px; height: 140px;">
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <path d="M 20 80 L 30 70 L 40 75 L 50 60 L 60 65 L 70 45 L 80 50 L 90 30" 
                        stroke="white" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="30" cy="70" r="6" fill="white"/>
                    <circle cx="50" cy="60" r="6" fill="white"/>
                    <circle cx="70" cy="45" r="6" fill="white"/>
                    <circle cx="90" cy="30" r="7" fill="white"/>
                </svg>
            </div>
            
            <h1 class="cover-title">AlphaVault AI</h1>
            <p class="cover-subtitle">AI-Powered Financial Intelligence Platform</p>
            
            <div class="cover-tagline">
                Empowering Individual Investors with<br>Institutional-Grade Analytics
            </div>
            
            <div class="cover-meta">
                <div class="meta-grid">
                    <div class="meta-item">
                        <div class="meta-label">Document</div>
                        <div class="meta-value">[DOC] Business Plan v3.0</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Date</div>
                        <div class="meta-value">[DATE] ${today}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Market</div>
                        <div class="meta-value">[GLOBE] Global - Cloud-Based</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Confidentiality</div>
                        <div class="meta-value">[LOCK] Confidential</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SECTION 1: EXECUTIVE SUMMARY -->
        <div class="section page-break-before">
            <h2 class="section-title">[BRIEFCASE] Executive Summary</h2>
            
            <div class="mission-statement avoid-break">
                <h3>[TARGET] Mission Statement</h3>
                <p class="mission-text">
                    To democratize institutional-grade financial intelligence by providing individual investors 
                    with AI-powered analytics, predictive models, and real-time market insights through an 
                    accessible, affordable, and user-friendly SaaS platform.
                </p>
            </div>

            <h3 class="subsection-title">[DART] Key Highlights</h3>
            
            <div class="highlights-grid">
                <div class="highlight-card avoid-break">
                    <div class="highlight-icon">[USERS]</div>
                    <div class="highlight-label">Target Market</div>
                    <div class="highlight-value">$12.5B+</div>
                    <div class="highlight-desc">Global retail investment analytics market (2024)</div>
                </div>
                
                <div class="highlight-card avoid-break">
                    <div class="highlight-icon">[CHART]</div>
                    <div class="highlight-label">Revenue Model</div>
                    <div class="highlight-value">Freemium SaaS</div>
                    <div class="highlight-desc">3 tiers: Basic (Free), Pro ($10/mo), Platinum ($20/mo)</div>
                </div>
                
                <div class="highlight-card avoid-break">
                    <div class="highlight-icon">[BRAIN]</div>
                    <div class="highlight-label">Core Technology</div>
                    <div class="highlight-value">AI + ML</div>
                    <div class="highlight-desc">Gemini AI, predictive algorithms, real-time analytics</div>
                </div>
                
                <div class="highlight-card avoid-break">
                    <div class="highlight-icon">[ROCKET]</div>
                    <div class="highlight-label">5-Year Goal</div>
                    <div class="highlight-value">100K Users</div>
                    <div class="highlight-desc">$12M ARR with 15% paid conversion rate</div>
                </div>
            </div>

            <h3 class="subsection-title">[LIST] Value Proposition</h3>
            
            <div class="value-props">
                <div class="value-prop-item avoid-break">
                    <div class="vp-number">1</div>
                    <div class="vp-content">
                        <h4>Institutional-Grade Tools for Individual Investors</h4>
                        <p>Advanced M&A prediction, insider flow tracking, ML-powered trend analysis, Monte Carlo simulations, and risk parity optimization—previously only available to hedge funds and professional traders.</p>
                    </div>
                </div>
                
                <div class="value-prop-item avoid-break">
                    <div class="vp-number">2</div>
                    <div class="vp-content">
                        <h4>AI-Powered Financial Chatbot</h4>
                        <p>FinanceGPT provides instant answers to complex financial questions, generates custom analyses, and offers personalized investment recommendations 24/7.</p>
                    </div>
                </div>
                
                <div class="value-prop-item avoid-break">
                    <div class="vp-number">3</div>
                    <div class="vp-content">
                        <h4>Affordable Freemium Pricing</h4>
                        <p>Free tier provides basic analytics. Pro plan ($10/mo) unlocks advanced features. Platinum ($20/mo) includes AI chatbot and premium tools—10x cheaper than Bloomberg Terminal.</p>
                    </div>
                </div>
                
                <div class="value-prop-item avoid-break">
                    <div class="vp-number">4</div>
                    <div class="vp-content">
                        <h4>Real-Time Data & Automation</h4>
                        <p>Live market data, automated newsletters, instant alerts, and seamless integrations with Stripe, Firebase, and Cloudflare infrastructure for 99.9% uptime.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- SECTION 2: MARKET ANALYSIS -->
        <div class="section page-break-before">
            <h2 class="section-title">[CHART-BAR] Market Analysis</h2>
            
            <h3 class="subsection-title">[GLOBE] Total Addressable Market (TAM)</h3>
            
            <div class="market-metrics">
                <div class="market-metric-card avoid-break">
                    <div class="metric-header">[WORLD] TAM</div>
                    <div class="metric-value">$12.5B</div>
                    <div class="metric-label">Global Retail Investment Analytics Market</div>
                    <div class="metric-growth">+18.5% CAGR (2024-2029)</div>
                </div>
                
                <div class="market-metric-card avoid-break">
                    <div class="metric-header">[TARGET] SAM</div>
                    <div class="metric-value">$3.2B</div>
                    <div class="metric-label">Serviceable Available Market (English-speaking retail investors)</div>
                    <div class="metric-growth">~25% of TAM</div>
                </div>
                
                <div class="market-metric-card avoid-break">
                    <div class="metric-header">[FOCUS] SOM</div>
                    <div class="metric-value">$160M</div>
                    <div class="metric-label">Serviceable Obtainable Market (5-year target: 5% of SAM)</div>
                    <div class="metric-growth">Conservative estimate</div>
                </div>
            </div>

            <h3 class="subsection-title page-break-before">[USERS] Target Customer Segments</h3>
            
            <div class="segments-grid">
                <div class="segment-card avoid-break">
                    <div class="segment-header">
                        <h4>[GRAD] Millennial/Gen Z Investors</h4>
                    </div>
                    <div class="segment-stats">
                        <div class="stat-row"><span>Age Range:</span> <strong>25-40 years</strong></div>
                        <div class="stat-row"><span>Portfolio Size:</span> <strong>$5K - $100K</strong></div>
                        <div class="stat-row"><span>Tech Savviness:</span> <strong>High</strong></div>
                        <div class="stat-row"><span>% of Market:</span> <strong>45%</strong></div>
                    </div>
                    <p>Digital natives seeking advanced tools to outperform traditional advisors. Comfortable with SaaS subscriptions, value AI/ML capabilities.</p>
                </div>
                
                <div class="segment-card avoid-break">
                    <div class="segment-header">
                        <h4>[TREND] Active Day Traders</h4>
                    </div>
                    <div class="segment-stats">
                        <div class="stat-row"><span>Age Range:</span> <strong>30-55 years</strong></div>
                        <div class="stat-row"><span>Trading Frequency:</span> <strong>Daily</strong></div>
                        <div class="stat-row"><span>Data Needs:</span> <strong>Real-time</strong></div>
                        <div class="stat-row"><span>% of Market:</span> <strong>30%</strong></div>
                    </div>
                    <p>Require technical indicators, insider flow data, M&A predictions. Willing to pay premium for edge in market movements.</p>
                </div>
                
                <div class="segment-card avoid-break">
                    <div class="segment-header">
                        <h4>[SAVINGS] Long-Term Investors</h4>
                    </div>
                    <div class="segment-stats">
                        <div class="stat-row"><span>Age Range:</span> <strong>35-65 years</strong></div>
                        <div class="stat-row"><span>Investment Horizon:</span> <strong>5-20 years</strong></div>
                        <div class="stat-row"><span>Focus:</span> <strong>Portfolio optimization</strong></div>
                        <div class="stat-row"><span>% of Market:</span> <strong>25%</strong></div>
                    </div>
                    <p>Value Monte Carlo simulations, risk parity tools, scenario analysis for retirement planning and wealth preservation.</p>
                </div>
            </div>
        </div>

        <!-- SECTION 3: BUSINESS MODEL -->
        <div class="section page-break-before">
            <h2 class="section-title">[PUZZLE] Business Model</h2>
            
            <h3 class="subsection-title">[TAG] Pricing Strategy</h3>
            
            <div class="pricing-tiers">
                <div class="pricing-card avoid-break">
                    <div class="pricing-header">
                        <div class="pricing-icon">[ROCKET]</div>
                        <h3>Basic</h3>
                        <div class="pricing-price">$0<span>/month</span></div>
                    </div>
                    <div class="pricing-features">
                        <div class="feature">[CHECK] Basic stock analysis</div>
                        <div class="feature">[CHECK] Real-time quotes (delayed 15 min)</div>
                        <div class="feature">[CHECK] Budget dashboard</div>
                        <div class="feature">[CHECK] News terminal (basic)</div>
                        <div class="feature disabled">[X] Advanced analytics</div>
                        <div class="feature disabled">[X] AI chatbot</div>
                    </div>
                    <div class="pricing-target">
                        <strong>Target:</strong> 70% of users remain free
                    </div>
                </div>
                
                <div class="pricing-card featured avoid-break">
                    <div class="pricing-badge">Most Popular</div>
                    <div class="pricing-header">
                        <div class="pricing-icon">[STAR]</div>
                        <h3>Pro</h3>
                        <div class="pricing-price">$10<span>/month</span></div>
                    </div>
                    <div class="pricing-features">
                        <div class="feature">[CHECK] Everything in Basic</div>
                        <div class="feature">[CHECK] Advanced technical analysis (14 indicators)</div>
                        <div class="feature">[CHECK] M&A predictor</div>
                        <div class="feature">[CHECK] Insider flow tracker</div>
                        <div class="feature">[CHECK] Monte Carlo simulation</div>
                        <div class="feature">[CHECK] Risk parity optimizer</div>
                        <div class="feature">[CHECK] Real-time alerts</div>
                    </div>
                    <div class="pricing-target">
                        <strong>Target:</strong> 20% of users upgrade to Pro
                    </div>
                </div>
                
                <div class="pricing-card premium avoid-break">
                    <div class="pricing-badge">Premium</div>
                    <div class="pricing-header">
                        <div class="pricing-icon">[CROWN]</div>
                        <h3>Platinum</h3>
                        <div class="pricing-price">$20<span>/month</span></div>
                    </div>
                    <div class="pricing-features">
                        <div class="feature">[CHECK] Everything in Pro</div>
                        <div class="feature">[CHECK] AI Chatbot (FinanceGPT) - Unlimited</div>
                        <div class="feature">[CHECK] Trend prediction (ML models)</div>
                        <div class="feature">[CHECK] Analyst coverage reports</div>
                        <div class="feature">[CHECK] Custom portfolio scenarios</div>
                        <div class="feature">[CHECK] Priority support</div>
                        <div class="feature">[CHECK] API access (coming soon)</div>
                    </div>
                    <div class="pricing-target">
                        <strong>Target:</strong> 10% of users upgrade to Platinum
                    </div>
                </div>
            </div>
        </div>

        <!-- SECTION 4: FINANCIAL PROJECTIONS -->
        <div class="section page-break-before">
            <h2 class="section-title">[MONEY] Financial Projections (5-Year)</h2>
            
            <div class="projection-summary">
                <div class="projection-card avoid-break">
                    <div class="proj-icon">[UP]</div>
                    <div class="proj-label">Year 5 ARR</div>
                    <div class="proj-value">$12.0M</div>
                    <div class="proj-growth">+285% CAGR</div>
                </div>
                
                <div class="projection-card avoid-break">
                    <div class="proj-icon">[GROUP]</div>
                    <div class="proj-label">Total Users (Year 5)</div>
                    <div class="proj-value">100,000</div>
                    <div class="proj-growth">15,000 paid subscribers</div>
                </div>
                
                <div class="projection-card avoid-break">
                    <div class="proj-icon">[BAR]</div>
                    <div class="proj-label">Gross Margin (Year 5)</div>
                    <div class="proj-value">82%</div>
                    <div class="proj-growth">SaaS economics</div>
                </div>
                
                <div class="projection-card avoid-break">
                    <div class="proj-icon">[BANK]</div>
                    <div class="proj-label">EBITDA (Year 5)</div>
                    <div class="proj-value">$2.8M</div>
                    <div class="proj-growth">23% margin</div>
                </div>
            </div>

            <h3 class="subsection-title page-break-before">[TABLE] 5-Year Revenue Projection</h3>
            
            <table class="financial-table avoid-break">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Year 1</th>
                        <th>Year 2</th>
                        <th>Year 3</th>
                        <th>Year 4</th>
                        <th>Year 5</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Total Users</strong></td>
                        <td>5,000</td>
                        <td>15,000</td>
                        <td>35,000</td>
                        <td>65,000</td>
                        <td>100,000</td>
                    </tr>
                    <tr>
                        <td><strong>Free Users</strong></td>
                        <td>3,500 (70%)</td>
                        <td>10,500 (70%)</td>
                        <td>24,500 (70%)</td>
                        <td>45,500 (70%)</td>
                        <td>70,000 (70%)</td>
                    </tr>
                    <tr>
                        <td><strong>Paid Users</strong></td>
                        <td>1,500 (30%)</td>
                        <td>4,500 (30%)</td>
                        <td>10,500 (30%)</td>
                        <td>19,500 (30%)</td>
                        <td>30,000 (30%)</td>
                    </tr>
                    <tr class="highlight">
                        <td><strong>MRR</strong></td>
                        <td><strong>$21,000</strong></td>
                        <td><strong>$63,000</strong></td>
                        <td><strong>$147,000</strong></td>
                        <td><strong>$273,000</strong></td>
                        <td><strong>$420,000</strong></td>
                    </tr>
                    <tr class="highlight">
                        <td><strong>ARR</strong></td>
                        <td><strong>$252K</strong></td>
                        <td><strong>$756K</strong></td>
                        <td><strong>$1.76M</strong></td>
                        <td><strong>$3.28M</strong></td>
                        <td><strong>$5.04M</strong></td>
                    </tr>
                    <tr>
                        <td><strong>Affiliate Revenue</strong></td>
                        <td>$25K</td>
                        <td>$90K</td>
                        <td>$220K</td>
                        <td>$410K</td>
                        <td>$630K</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>Total Revenue</strong></td>
                        <td><strong>$277K</strong></td>
                        <td><strong>$846K</strong></td>
                        <td><strong>$1.98M</strong></td>
                        <td><strong>$3.69M</strong></td>
                        <td><strong>$5.67M</strong></td>
                    </tr>
                </tbody>
            </table>

            <h3 class="subsection-title page-break-before">[LIST] Expense Breakdown & P&L</h3>
            
            <table class="financial-table avoid-break">
                <thead>
                    <tr>
                        <th>Expense Category</th>
                        <th>Year 1</th>
                        <th>Year 2</th>
                        <th>Year 3</th>
                        <th>Year 4</th>
                        <th>Year 5</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Infrastructure</strong></td>
                        <td>$12K</td>
                        <td>$30K</td>
                        <td>$60K</td>
                        <td>$100K</td>
                        <td>$150K</td>
                    </tr>
                    <tr>
                        <td><strong>API Costs</strong></td>
                        <td>$8K</td>
                        <td>$20K</td>
                        <td>$40K</td>
                        <td>$70K</td>
                        <td>$100K</td>
                    </tr>
                    <tr>
                        <td><strong>Marketing & Ads</strong></td>
                        <td>$60K</td>
                        <td>$150K</td>
                        <td>$300K</td>
                        <td>$500K</td>
                        <td>$750K</td>
                    </tr>
                    <tr>
                        <td><strong>Salaries (Team)</strong></td>
                        <td>$80K</td>
                        <td>$200K</td>
                        <td>$400K</td>
                        <td>$700K</td>
                        <td>$1.2M</td>
                    </tr>
                    <tr>
                        <td><strong>Support & Operations</strong></td>
                        <td>$10K</td>
                        <td>$25K</td>
                        <td>$50K</td>
                        <td>$80K</td>
                        <td>$120K</td>
                    </tr>
                    <tr>
                        <td><strong>Legal & Compliance</strong></td>
                        <td>$15K</td>
                        <td>$20K</td>
                        <td>$30K</td>
                        <td>$40K</td>
                        <td>$50K</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>Total Expenses</strong></td>
                        <td><strong>$185K</strong></td>
                        <td><strong>$445K</strong></td>
                        <td><strong>$880K</strong></td>
                        <td><strong>$1.49M</strong></td>
                        <td><strong>$2.37M</strong></td>
                    </tr>
                    <tr class="highlight">
                        <td><strong>EBITDA</strong></td>
                        <td><strong>$92K</strong></td>
                        <td><strong>$401K</strong></td>
                        <td><strong>$1.10M</strong></td>
                        <td><strong>$2.20M</strong></td>
                        <td><strong>$3.30M</strong></td>
                    </tr>
                    <tr class="highlight">
                        <td><strong>EBITDA Margin</strong></td>
                        <td><strong>33%</strong></td>
                        <td><strong>47%</strong></td>
                        <td><strong>56%</strong></td>
                        <td><strong>60%</strong></td>
                        <td><strong>58%</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>

        ${includeSimulator ? this.createSimulatorSection() : ''}

        <!-- SECTION: UNIT ECONOMICS -->
        <div class="section page-break-before">
            <h2 class="section-title">[CALC] Unit Economics & Key Metrics</h2>
            
            <h3 class="subsection-title">[BAR] Customer Lifetime Value (LTV)</h3>
            
            <div class="ltv-calculation">
                <div class="calc-card avoid-break">
                    <h4>[DOLLAR] Average Revenue Per User (ARPU)</h4>
                    <div class="calc-formula">ARPU = (60% × $10) + (40% × $20)</div>
                    <div class="calc-result"><strong>$14/month</strong></div>
                </div>
                
                <div class="calc-card avoid-break">
                    <h4>[CALENDAR] Average Customer Lifespan</h4>
                    <div class="calc-formula">Lifespan = 1 / 5% Monthly Churn</div>
                    <div class="calc-result"><strong>20 months</strong></div>
                </div>
                
                <div class="calc-card highlight avoid-break">
                    <h4>[UP-TREND] Lifetime Value (LTV)</h4>
                    <div class="calc-formula">LTV = $14 × 20 months</div>
                    <div class="calc-result"><strong>$280</strong></div>
                </div>
            </div>

            <h3 class="subsection-title page-break-before">[TARGET] Customer Acquisition Cost (CAC)</h3>
            
            <table class="financial-table avoid-break">
                <thead>
                    <tr>
                        <th>Channel</th>
                        <th>Cost Per Acquisition</th>
                        <th>% of Acquisitions</th>
                        <th>Weighted CAC</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>SEO & Content</td>
                        <td>$10</td>
                        <td>30%</td>
                        <td>$3.00</td>
                    </tr>
                    <tr>
                        <td>Paid Social</td>
                        <td>$35</td>
                        <td>25%</td>
                        <td>$8.75</td>
                    </tr>
                    <tr>
                        <td>Referral Program</td>
                        <td>$15</td>
                        <td>20%</td>
                        <td>$3.00</td>
                    </tr>
                    <tr>
                        <td>Influencer Partnerships</td>
                        <td>$25</td>
                        <td>15%</td>
                        <td>$3.75</td>
                    </tr>
                    <tr>
                        <td>Organic</td>
                        <td>$5</td>
                        <td>10%</td>
                        <td>$0.50</td>
                    </tr>
                    <tr class="total-row">
                        <td><strong>Blended CAC</strong></td>
                        <td colspan="2"></td>
                        <td><strong>$19.00</strong></td>
                    </tr>
                </tbody>
            </table>

            <h3 class="subsection-title page-break-before">[SCALE] LTV:CAC Ratio Analysis</h3>
            
            <div class="ratio-analysis">
                <div class="ratio-card avoid-break">
                    <div class="ratio-header">[TROPHY] AlphaVault AI LTV:CAC</div>
                    <div class="ratio-value">14.7:1</div>
                    <div class="ratio-calc">$280 LTV / $19 CAC</div>
                    <div class="ratio-verdict">[CHECK] <strong>Excellent</strong> - Well above 3:1 benchmark</div>
                </div>
                
                <div class="benchmarks avoid-break">
                    <h4>[CHART] Industry Benchmarks</h4>
                    <div class="benchmark-item">[X] Poor (&lt; 1:1) - Unsustainable</div>
                    <div class="benchmark-item">[WARNING] Fair (1:1 to 3:1) - Break-even to marginal</div>
                    <div class="benchmark-item">[CHECK] Good (3:1 to 5:1) - Healthy SaaS metrics</div>
                    <div class="benchmark-item highlight">[STAR] Excellent (&gt; 5:1) - Highly scalable (AlphaVault: 14.7:1)</div>
                </div>
            </div>

            <h3 class="subsection-title">[CLOCK] Payback Period</h3>
            
            <div class="payback-analysis">
                <div class="calc-card avoid-break">
                    <h4>[CALC] Calculation</h4>
                    <div class="calc-formula">Payback = $19 / ($14 × 0.85)</div>
                    <div class="calc-result"><strong>1.6 months</strong></div>
                </div>
                <div class="calc-card avoid-break">
                    <h4>[CHECK] Industry Standard</h4>
                    <p>Best-in-class SaaS: &lt; 12 months</p>
                    <p><strong>[TROPHY] AlphaVault AI: 1.6 months</strong> — Exceptional capital efficiency!</p>
                </div>
            </div>
        </div>

        <!-- SECTION: GROWTH STRATEGY -->
        <div class="section page-break-before">
            <h2 class="section-title">[ROCKET] Growth Strategy & Roadmap</h2>
            
            <h3 class="subsection-title">[MAP] 18-Month Product Roadmap</h3>
            
            <div class="roadmap">
                <div class="roadmap-item avoid-break">
                    <div class="roadmap-quarter">Q1</div>
                    <h4>Foundation & Launch</h4>
                    <ul>
                        <li>[CHECK] Core platform launch</li>
                        <li>[CHECK] Freemium model activation</li>
                        <li>[PROGRESS] SEO optimization (50+ blog posts)</li>
                        <li>[PROGRESS] Social media presence</li>
                        <li>[PROGRESS] First 500 users milestone</li>
                    </ul>
                </div>
                
                <div class="roadmap-item avoid-break">
                    <div class="roadmap-quarter">Q2</div>
                    <h4>User Growth & Engagement</h4>
                    <ul>
                        <li>[PROGRESS] Paid ads campaign ($5K/month)</li>
                        <li>[PROGRESS] Referral program</li>
                        <li>[PROGRESS] Mobile app development start</li>
                        <li>[PROGRESS] Community hub enhancements</li>
                        <li>[PROGRESS] Target: 2,000 users, 10% conversion</li>
                    </ul>
                </div>
                
                <div class="roadmap-item avoid-break">
                    <div class="roadmap-quarter">Q3</div>
                    <h4>Feature Expansion</h4>
                    <ul>
                        <li>[PROGRESS] Mobile app beta launch</li>
                        <li>[PROGRESS] Broker integrations</li>
                        <li>[PROGRESS] Advanced backtesting</li>
                        <li>[PROGRESS] Influencer partnerships</li>
                        <li>[PROGRESS] Target: 5,000 users, 15% conversion</li>
                    </ul>
                </div>
                
                <div class="roadmap-item avoid-break">
                    <div class="roadmap-quarter">Q4</div>
                    <h4>Scale & Optimize</h4>
                    <ul>
                        <li>[PROGRESS] API access tier launch</li>
                        <li>[PROGRESS] Enterprise features</li>
                        <li>[PROGRESS] International expansion</li>
                        <li>[PROGRESS] ML model improvements</li>
                        <li>[PROGRESS] Target: 10,000 users, 20% conversion</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- SECTION: COMPETITIVE ANALYSIS -->
        <div class="section page-break-before">
            <h2 class="section-title">[CHESS] Competitive Analysis</h2>
            
            <h3 class="subsection-title">[TABLE] Competitor Comparison</h3>
            
            <table class="competitive-table avoid-break">
                <thead>
                    <tr>
                        <th>Feature</th>
                        <th class="us">AlphaVault AI</th>
                        <th>Bloomberg</th>
                        <th>Yahoo Finance</th>
                        <th>TradingView</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Pricing</strong></td>
                        <td class="us"><strong>$0-$20/mo</strong></td>
                        <td>$2,000+/mo</td>
                        <td>Free</td>
                        <td>$15-$60/mo</td>
                    </tr>
                    <tr>
                        <td>AI Chatbot</td>
                        <td class="us">[CHECK]</td>
                        <td>[X]</td>
                        <td>[X]</td>
                        <td>[X]</td>
                    </tr>
                    <tr>
                        <td>M&A Prediction</td>
                        <td class="us">[CHECK]</td>
                        <td>[PARTIAL]</td>
                        <td>[X]</td>
                        <td>[X]</td>
                    </tr>
                    <tr>
                        <td>Insider Flow</td>
                        <td class="us">[CHECK]</td>
                        <td>[CHECK]</td>
                        <td>[PARTIAL]</td>
                        <td>[X]</td>
                    </tr>
                    <tr>
                        <td>Monte Carlo</td>
                        <td class="us">[CHECK]</td>
                        <td>[CHECK]</td>
                        <td>[X]</td>
                        <td>[X]</td>
                    </tr>
                    <tr>
                        <td>ML Prediction</td>
                        <td class="us">[CHECK]</td>
                        <td>[PARTIAL]</td>
                        <td>[X]</td>
                        <td>[PARTIAL]</td>
                    </tr>
                </tbody>
            </table>

            <h3 class="subsection-title page-break-before">[TROPHY] Competitive Advantages</h3>
            
            <div class="advantages">
                <div class="advantage-item avoid-break">
                    <div class="advantage-number">1</div>
                    <div class="advantage-content">
                        <h4>[DOLLAR] Price Disruption</h4>
                        <p>Bloomberg: $24,000/year | AlphaVault Platinum: $240/year (100x cheaper)</p>
                    </div>
                </div>
                
                <div class="advantage-item avoid-break">
                    <div class="advantage-number">2</div>
                    <div class="advantage-content">
                        <h4>[ROBOT] AI-First Approach</h4>
                        <p>Only platform with conversational AI for financial analysis + proprietary ML models</p>
                    </div>
                </div>
                
                <div class="advantage-item avoid-break">
                    <div class="advantage-number">3</div>
                    <div class="advantage-content">
                        <h4>[PUZZLE] All-in-One Platform</h4>
                        <p>Budgeting + Analysis + Predictions + Simulations + Chatbot + Community</p>
                    </div>
                </div>
                
                <div class="advantage-item avoid-break">
                    <div class="advantage-number">4</div>
                    <div class="advantage-content">
                        <h4>[NETWORK] Community-Driven</h4>
                        <p>Network effects: platform becomes more valuable as user base grows</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- SECTION: RISK ANALYSIS -->
        <div class="section page-break-before">
            <h2 class="section-title">[WARNING] Risk Analysis & Mitigation</h2>
            
            <div class="risks">
                <div class="risk-card avoid-break">
                    <div class="risk-severity high">High Impact</div>
                    <h4>[DOWN] Market Risk: Prolonged Bear Market</h4>
                    <p><strong>Scenario:</strong> Extended downturn reduces retail investor activity</p>
                    <div class="risk-mitigation">
                        <h5>[SHIELD] Mitigation:</h5>
                        <ul>
                            <li>Emphasize risk management tools (MORE valuable during volatility)</li>
                            <li>Add hedging strategies & recession-proof portfolios</li>
                            <li>Strong free tier keeps users engaged during downgrades</li>
                        </ul>
                    </div>
                    <div class="risk-prob">Probability: Medium (30%)</div>
                </div>
                
                <div class="risk-card avoid-break">
                    <div class="risk-severity medium">Medium Impact</div>
                    <h4>[ROBOT] Technology Risk: AI Model Accuracy</h4>
                    <p><strong>Scenario:</strong> ML predictions underperform, causing user churn</p>
                    <div class="risk-mitigation">
                        <h5>[SHIELD] Mitigation:</h5>
                        <ul>
                            <li>Transparent communication: predictions are probabilistic</li>
                            <li>Monthly model retraining with latest data</li>
                            <li>Diversified offering: predictions are 1 of 30+ features</li>
                        </ul>
                    </div>
                    <div class="risk-prob">Probability: Medium (40%)</div>
                </div>
                
                <div class="risk-card avoid-break">
                    <div class="risk-severity high">High Impact</div>
                    <h4>[CHESS] Competitive Risk: Big Tech Entry</h4>
                    <p><strong>Scenario:</strong> Google/Apple launch competing platforms</p>
                    <div class="risk-mitigation">
                        <h5>[SHIELD] Mitigation:</h5>
                        <ul>
                            <li>Focus on advanced users (niche specialization)</li>
                            <li>Build community moat with network effects</li>
                            <li>Speed advantage: ship features monthly vs quarterly</li>
                            <li>Acquisition opportunity if we reach 50K+ users</li>
                        </ul>
                    </div>
                    <div class="risk-prob">Probability: Low-Medium (20%)</div>
                </div>
                
                <div class="risk-card avoid-break">
                    <div class="risk-severity medium">Medium Impact</div>
                    <h4>[BALANCE] Regulatory Risk: Financial Advice Compliance</h4>
                    <p><strong>Scenario:</strong> SEC classifies AI recommendations as investment advice</p>
                    <div class="risk-mitigation">
                        <h5>[SHIELD] Mitigation:</h5>
                        <ul>
                            <li>Clear disclaimers: "Not financial advice. Educational purposes only."</li>
                            <li>Position as analytical tool, not advisory service</li>
                            <li>Work with fintech lawyers for compliance</li>
                            <li>Pivot option: B2B licensing to registered advisors</li>
                        </ul>
                    </div>
                    <div class="risk-prob">Probability: Low (10%)</div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-title">[CHART] AlphaVault AI Business Plan</div>
            <div class="footer-subtitle">Confidential - For Internal Use Only</div>
            <div class="footer-date">Generated: ${today}</div>
        </div>

    </body>
    </html>
        `;
    }

    /**
     * ════════════════════════════════════════════════════════════════
     * SECTION SCENARIO SIMULATOR (OPTIONNELLE)
     * ════════════════════════════════════════════════════════════════
     */
    createSimulatorSection() {
        return `
        <div class="section page-break-before">
            <h2 class="section-title">[SLIDERS] Interactive Scenario Simulator</h2>
            
            <div class="info-box avoid-break">
                <h3>[INFO] How to Use</h3>
                <p>This section showcases our interactive scenario modeling capabilities. The live simulator is available on the AlphaVault AI platform with real-time calculations.</p>
            </div>

            <h3 class="subsection-title">[SETTINGS] Key Parameters</h3>
            
            <div class="simulator-params">
                <div class="param-card avoid-break">
                    <div class="param-label">[USERS] Total Users (Year 1)</div>
                    <div class="param-value">5,000</div>
                    <div class="param-desc">Starting user base</div>
                </div>
                
                <div class="param-card avoid-break">
                    <div class="param-label">[BAR] Conversion Rate</div>
                    <div class="param-value">30%</div>
                    <div class="param-desc">Free → Paid conversion</div>
                </div>
                
                <div class="param-card avoid-break">
                    <div class="param-label">[STAR] Pro Plan %</div>
                    <div class="param-value">60%</div>
                    <div class="param-desc">Of paid users</div>
                </div>
                
                <div class="param-card avoid-break">
                    <div class="param-label">[UP] YoY Growth</div>
                    <div class="param-value">200%</div>
                    <div class="param-desc">Year-over-year</div>
                </div>
                
                <div class="param-card avoid-break">
                    <div class="param-label">[DOLLAR] CAC</div>
                    <div class="param-value">$25</div>
                    <div class="param-desc">Customer acquisition cost</div>
                </div>
                
                <div class="param-card avoid-break">
                    <div class="param-label">[DOWN] Churn Rate</div>
                    <div class="param-value">5%</div>
                    <div class="param-desc">Monthly churn</div>
                </div>
            </div>

            <h3 class="subsection-title page-break-before">[BAR] Simulation Results (Base Case)</h3>
            
            <div class="sim-results">
                <div class="sim-result-card avoid-break">
                    <div class="sim-icon">[MONEY]</div>
                    <div class="sim-label">Year 1 MRR</div>
                    <div class="sim-value">$21,000</div>
                </div>
                
                <div class="sim-result-card avoid-break">
                    <div class="sim-icon">[CALENDAR]</div>
                    <div class="sim-label">Year 1 ARR</div>
                    <div class="sim-value">$252,000</div>
                </div>
                
                <div class="sim-result-card avoid-break">
                    <div class="sim-icon">[TARGET]</div>
                    <div class="sim-label">Year 5 ARR</div>
                    <div class="sim-value">$5.67M</div>
                </div>
                
                <div class="sim-result-card avoid-break">
                    <div class="sim-icon">[CHART]</div>
                    <div class="sim-label">LTV:CAC Ratio</div>
                    <div class="sim-value">14.7:1</div>
                </div>
                
                <div class="sim-result-card avoid-break">
                    <div class="sim-icon">[CLOCK]</div>
                    <div class="sim-label">Payback Period</div>
                    <div class="sim-value">1.6 months</div>
                </div>
                
                <div class="sim-result-card avoid-break">
                    <div class="sim-icon">[BANK]</div>
                    <div class="sim-label">Year 5 EBITDA</div>
                    <div class="sim-value">$3.30M</div>
                </div>
            </div>

            <h3 class="subsection-title page-break-before">[LAB] Pre-Configured Scenarios</h3>
            
            <div class="scenarios">
                <div class="scenario-card conservative avoid-break">
                    <div class="scenario-header">
                        <div class="scenario-icon">[TURTLE]</div>
                        <h4>Conservative Growth</h4>
                    </div>
                    <div class="scenario-params">
                        <div>Total Users Y1: 3,000</div>
                        <div>Conversion: 20%</div>
                        <div>Growth: 150%</div>
                        <div>CAC: $35</div>
                    </div>
                    <div class="scenario-result">
                        <strong>Year 5 ARR:</strong> $2.8M
                    </div>
                </div>
                
                <div class="scenario-card base avoid-break">
                    <div class="scenario-header">
                        <div class="scenario-icon">[BALANCE]</div>
                        <h4>Base Case (Default)</h4>
                    </div>
                    <div class="scenario-params">
                        <div>Total Users Y1: 5,000</div>
                        <div>Conversion: 30%</div>
                        <div>Growth: 200%</div>
                        <div>CAC: $25</div>
                    </div>
                    <div class="scenario-result">
                        <strong>Year 5 ARR:</strong> $5.67M
                    </div>
                </div>
                
                <div class="scenario-card aggressive avoid-break">
                    <div class="scenario-header">
                        <div class="scenario-icon">[ROCKET]</div>
                        <h4>Aggressive Growth</h4>
                    </div>
                    <div class="scenario-params">
                        <div>Total Users Y1: 10,000</div>
                        <div>Conversion: 40%</div>
                        <div>Growth: 300%</div>
                        <div>CAC: $20</div>
                    </div>
                    <div class="scenario-result">
                        <strong>Year 5 ARR:</strong> $18.5M
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    /**
     * ════════════════════════════════════════════════════════════════
     * CSS COMPLET DU BUSINESS PLAN (OPTIMISÉ PAGINATION)
     * ════════════════════════════════════════════════════════════════
     */
    getBusinessPlanCSS() {
        return `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
                font-size: 14px;
                line-height: 1.6;
                color: #1e293b;
                background: white;
            }

            /* ════════════════════════════════════════════════════════════════
            CONTRÔLE DES SAUTS DE PAGE
            ════════════════════════════════════════════════════════════════ */
            .page-break-before {
                page-break-before: always;
                break-before: page;
            }

            .page-break-after {
                page-break-after: always;
                break-after: page;
            }

            .avoid-break {
                page-break-inside: avoid;
                break-inside: avoid;
            }

            /* ════════════════════════════════════════════════════════════════
            PAGE DE GARDE
            ════════════════════════════════════════════════════════════════ */
            .cover-page {
                min-height: 260mm;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 50px 40px;
            }

            .cover-logo {
                margin-bottom: 40px;
                filter: drop-shadow(0 8px 24px rgba(0,0,0,0.3));
            }

            .cover-title {
                font-size: 56px;
                font-weight: 900;
                margin: 0 0 20px 0;
                letter-spacing: -1px;
                line-height: 1.1;
                text-shadow: 0 4px 16px rgba(0,0,0,0.3);
            }

            .cover-subtitle {
                font-size: 28px;
                font-weight: 700;
                margin: 0 0 40px 0;
                opacity: 0.95;
                line-height: 1.3;
            }

            .cover-tagline {
                max-width: 600px;
                margin: 0 auto 50px;
                padding: 20px 28px;
                background: rgba(255,255,255,0.15);
                border-radius: 16px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
                font-size: 18px;
                line-height: 1.6;
                font-weight: 500;
            }

            .cover-meta {
                margin-top: 60px;
                padding-top: 30px;
                border-top: 2px solid rgba(255,255,255,0.3);
                width: 100%;
                max-width: 700px;
            }

            .meta-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                font-size: 15px;
                font-weight: 600;
            }

            .meta-item {
                text-align: left;
            }

            .meta-item:nth-child(even) {
                text-align: right;
            }

            .meta-label {
                opacity: 0.8;
                font-size: 13px;
                margin-bottom: 5px;
            }

            .meta-value {
                font-weight: 700;
            }

            /* ════════════════════════════════════════════════════════════════
            SECTIONS
            ════════════════════════════════════════════════════════════════ */
            .section {
                padding: 25px 35px 30px 35px;
                background: white;
                min-height: auto;
            }

            .section-title {
                font-size: 28px;
                font-weight: 800;
                color: #1e293b;
                margin-bottom: 25px;
                padding-bottom: 12px;
                border-bottom: 4px solid #667eea;
            }

            .subsection-title {
                font-size: 20px;
                font-weight: 700;
                color: #1e293b;
                margin: 25px 0 15px 0;
                padding-bottom: 8px;
                border-bottom: 2px solid #667eea;
            }

            h3, h4 {
                margin: 18px 0 10px 0;
                font-weight: 700;
                color: #1e293b;
            }

            h3 { font-size: 18px; }
            h4 { font-size: 16px; }

            p {
                margin-bottom: 12px;
                color: #1e293b;
                line-height: 1.7;
            }

            ul, ol {
                margin: 12px 0;
                padding-left: 24px;
            }

            li {
                margin-bottom: 8px;
                line-height: 1.6;
            }

            /* ════════════════════════════════════════════════════════════════
            CARDS & BOXES
            ════════════════════════════════════════════════════════════════ */
            .mission-statement,
            .info-box {
                background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.05));
                padding: 22px;
                border-radius: 14px;
                border-left: 5px solid #667eea;
                margin: 20px 0;
            }

            .mission-text {
                font-size: 15px;
                line-height: 1.8;
                color: #1e293b;
                margin: 0;
            }

            .highlights-grid,
            .segments-grid,
            .pricing-tiers,
            .advantages,
            .ltv-calculation,
            .sim-results {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 16px;
                margin: 20px 0;
            }

            .highlight-card,
            .segment-card,
            .projection-card,
            .market-metric-card,
            .calc-card,
            .sim-result-card {
                border: 2px solid #667eea;
                border-radius: 14px;
                padding: 18px;
                background: linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.05));
            }

            .highlight-icon,
            .proj-icon,
            .sim-icon {
                font-size: 28px;
                margin-bottom: 10px;
                font-weight: 700;
            }

            .highlight-label,
            .proj-label,
            .metric-label,
            .sim-label {
                font-size: 12px;
                font-weight: 700;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
            }

            .highlight-value,
            .proj-value,
            .metric-value,
            .sim-value {
                font-size: 24px;
                font-weight: 800;
                color: #667eea;
                margin: 6px 0;
                line-height: 1.2;
            }

            .highlight-desc,
            .proj-growth,
            .metric-growth {
                font-size: 13px;
                color: #64748b;
                margin-top: 6px;
            }

            /* ════════════════════════════════════════════════════════════════
            TABLES
            ════════════════════════════════════════════════════════════════ */
            table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                font-size: 13px;
                background: white;
            }

            thead th {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 12px 10px;
                font-weight: 700;
                text-align: left;
                border: 1px solid rgba(255,255,255,0.2);
                font-size: 13px;
            }

            tbody td {
                padding: 10px;
                border: 1px solid #e2e8f0;
                color: #1e293b;
                font-size: 13px;
            }

            tbody tr:nth-child(even) td {
                background: #f8fafc;
            }

            tr.highlight td,
            tr.total-row td {
                background: rgba(102,126,234,0.15) !important;
                font-weight: 700;
                color: #667eea;
            }

            .competitive-table th.us,
            .competitive-table td.us {
                background: rgba(16,185,129,0.15) !important;
                color: #10b981;
                font-weight: 700;
            }

            /* ════════════════════════════════════════════════════════════════
            PRICING CARDS
            ════════════════════════════════════════════════════════════════ */
            .pricing-card {
                border: 2px solid #e2e8f0;
                border-radius: 18px;
                padding: 22px;
                position: relative;
                background: white;
            }

            .pricing-card.featured {
                border-color: #667eea;
                box-shadow: 0 6px 20px rgba(102,126,234,0.2);
            }

            .pricing-card.premium {
                border-color: #764ba2;
                box-shadow: 0 6px 20px rgba(118,75,162,0.2);
            }

            .pricing-badge {
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 5px 18px;
                border-radius: 18px;
                font-size: 12px;
                font-weight: 700;
            }

            .pricing-header {
                text-align: center;
                margin-bottom: 18px;
            }

            .pricing-icon {
                font-size: 32px;
                margin-bottom: 10px;
                font-weight: 700;
            }

            .pricing-price {
                font-size: 40px;
                font-weight: 800;
                color: #667eea;
                margin: 12px 0;
            }

            .pricing-price span {
                font-size: 16px;
                color: #64748b;
            }

            .pricing-features {
                margin: 18px 0;
            }

            .pricing-features .feature {
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
                font-size: 13px;
            }

            .pricing-features .feature.disabled {
                color: #cbd5e1;
            }

            .pricing-target {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 2px solid #e2e8f0;
                font-size: 12px;
                color: #64748b;
            }

            /* ════════════════════════════════════════════════════════════════
            VALUE PROPS & ADVANTAGES
            ════════════════════════════════════════════════════════════════ */
            .value-props,
            .advantages {
                margin: 20px 0;
            }

            .value-prop-item,
            .advantage-item {
                display: flex;
                gap: 16px;
                margin-bottom: 18px;
                padding: 16px;
                background: rgba(102,126,234,0.05);
                border-radius: 14px;
                border-left: 4px solid #667eea;
            }

            .vp-number,
            .advantage-number {
                width: 42px;
                height: 42px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                font-weight: 800;
                flex-shrink: 0;
            }

            .vp-content h4,
            .advantage-content h4 {
                margin-top: 0;
                margin-bottom: 6px;
                color: #1e293b;
            }

            /* ════════════════════════════════════════════════════════════════
            ROADMAP
            ════════════════════════════════════════════════════════════════ */
            .roadmap {
                margin: 20px 0;
            }

            .roadmap-item {
                margin-bottom: 18px;
                padding: 16px;
                background: linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.05));
                border-radius: 14px;
                border-left: 5px solid #667eea;
            }

            .roadmap-quarter {
                display: inline-block;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 6px 16px;
                border-radius: 16px;
                font-weight: 800;
                font-size: 13px;
                margin-bottom: 10px;
            }

            .roadmap-item h4 {
                margin: 10px 0;
                font-size: 16px;
            }

            .roadmap-item ul {
                margin: 10px 0;
                padding-left: 20px;
            }

            .roadmap-item li {
                margin-bottom: 6px;
                font-size: 13px;
            }

            /* ════════════════════════════════════════════════════════════════
            SEGMENTS & STATS
            ════════════════════════════════════════════════════════════════ */
            .segment-header {
                margin-bottom: 12px;
            }

            .segment-stats {
                margin: 12px 0;
            }

            .stat-row {
                display: flex;
                justify-content: space-between;
                padding: 6px 0;
                border-bottom: 1px solid rgba(102,126,234,0.2);
                font-size: 13px;
            }

            /* ════════════════════════════════════════════════════════════════
            RATIO ANALYSIS
            ════════════════════════════════════════════════════════════════ */
            .ratio-analysis {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
            }

            .ratio-card {
                border: 3px solid #10b981;
                border-radius: 18px;
                padding: 22px;
                text-align: center;
                background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.05));
            }

            .ratio-header {
                font-size: 16px;
                font-weight: 700;
                color: #10b981;
                margin-bottom: 12px;
            }

            .ratio-value {
                font-size: 48px;
                font-weight: 900;
                color: #10b981;
                margin: 12px 0;
            }

            .ratio-calc {
                font-size: 13px;
                color: #64748b;
                margin-bottom: 12px;
            }

            .ratio-verdict {
                font-size: 14px;
                padding: 10px;
                background: rgba(16,185,129,0.15);
                border-radius: 10px;
            }

            .benchmarks {
                padding: 20px;
                background: #f8fafc;
                border-radius: 14px;
            }

            .benchmark-item {
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
                font-size: 13px;
            }

            .benchmark-item.highlight {
                background: rgba(255,215,0,0.15);
                padding: 10px;
                border-radius: 8px;
                border: none;
                font-weight: 700;
            }

            /* ════════════════════════════════════════════════════════════════
            PAYBACK ANALYSIS
            ════════════════════════════════════════════════════════════════ */
            .payback-analysis {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
            }

            /* ════════════════════════════════════════════════════════════════
            SIMULATOR PARAMS & SCENARIOS
            ════════════════════════════════════════════════════════════════ */
            .simulator-params {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
                margin: 20px 0;
            }

            .param-card {
                border: 2px solid #667eea;
                border-radius: 12px;
                padding: 16px;
                text-align: center;
                background: white;
            }

            .param-label {
                font-size: 12px;
                font-weight: 700;
                color: #64748b;
                margin-bottom: 6px;
            }

            .param-value {
                font-size: 28px;
                font-weight: 800;
                color: #667eea;
                margin: 6px 0;
            }

            .param-desc {
                font-size: 11px;
                color: #64748b;
            }

            .scenarios {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 16px;
                margin: 20px 0;
            }

            .scenario-card {
                border: 2px solid #e2e8f0;
                border-radius: 14px;
                padding: 18px;
                background: white;
            }

            .scenario-card.conservative {
                border-color: #f59e0b;
                background: rgba(245,158,11,0.05);
            }

            .scenario-card.base {
                border-color: #667eea;
                background: rgba(102,126,234,0.05);
            }

            .scenario-card.aggressive {
                border-color: #10b981;
                background: rgba(16,185,129,0.05);
            }

            .scenario-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 12px;
            }

            .scenario-icon {
                font-size: 28px;
                font-weight: 700;
            }

            .scenario-params {
                margin: 12px 0;
                font-size: 13px;
                color: #64748b;
            }

            .scenario-params div {
                padding: 5px 0;
                border-bottom: 1px solid #e2e8f0;
            }

            .scenario-result {
                margin-top: 12px;
                padding: 10px;
                background: rgba(102,126,234,0.1);
                border-radius: 8px;
                text-align: center;
                font-size: 14px;
            }

            /* ════════════════════════════════════════════════════════════════
            RISKS
            ════════════════════════════════════════════════════════════════ */
            .risks {
                margin: 20px 0;
            }

            .risk-card {
                margin-bottom: 18px;
                padding: 18px;
                border-radius: 14px;
                border-left: 5px solid #f59e0b;
                background: rgba(245,158,11,0.05);
            }

            .risk-severity {
                display: inline-block;
                padding: 5px 14px;
                border-radius: 16px;
                font-size: 11px;
                font-weight: 700;
                margin-bottom: 10px;
            }

            .risk-severity.high {
                background: #ef4444;
                color: white;
            }

            .risk-severity.medium {
                background: #f59e0b;
                color: white;
            }

            .risk-severity.low {
                background: #10b981;
                color: white;
            }

            .risk-mitigation {
                margin: 12px 0;
                padding: 12px;
                background: rgba(255,255,255,0.7);
                border-radius: 10px;
            }

            .risk-mitigation h5 {
                margin-bottom: 6px;
                font-size: 14px;
                color: #667eea;
            }

            .risk-mitigation ul {
                margin: 6px 0;
                padding-left: 18px;
            }

            .risk-prob {
                margin-top: 10px;
                font-size: 12px;
                font-weight: 600;
                color: #64748b;
            }

            /* ════════════════════════════════════════════════════════════════
            FOOTER
            ════════════════════════════════════════════════════════════════ */
            .footer {
                margin-top: 40px;
                padding: 24px;
                text-align: center;
                background: #f8fafc;
                border-radius: 14px;
                border-top: 4px solid #667eea;
            }

            .footer-title {
                font-size: 16px;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 6px;
            }

            .footer-subtitle {
                font-size: 13px;
                color: #64748b;
                margin-bottom: 6px;
            }

            .footer-date {
                font-size: 12px;
                color: #94a3b8;
            }

            /* ════════════════════════════════════════════════════════════════
            PRINT OPTIMIZATIONS
            ════════════════════════════════════════════════════════════════ */
            @media print {
                body {
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                }

                .section {
                    page-break-inside: avoid;
                }

                .highlight-card,
                .segment-card,
                .pricing-card,
                .value-prop-item,
                .advantage-item,
                .roadmap-item,
                .risk-card,
                table {
                    page-break-inside: avoid;
                }
            }
        `;
    }

    /**
     * ════════════════════════════════════════════════════════════════
     * MÉTHODES UTILITAIRES
     * ════════════════════════════════════════════════════════════════
     */
    getEmails() {
        const raw = document.getElementById('recipientEmails').value;
        const emails = raw.split(/[\n,;]+/).map(e => e.trim()).filter(e => this.isValidEmail(e));
        return [...new Set(emails)];
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showProgress(percent, text) {
        const progressDiv = document.getElementById('pdfProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (progressDiv) progressDiv.style.display = 'block';
        if (progressFill) progressFill.style.width = `${percent}%`;
        if (progressText) progressText.textContent = text;

        document.getElementById('sendPdfBtn').disabled = true;
        document.getElementById('cancelPdfBtn').disabled = true;
    }

    hideProgress() {
        const progressDiv = document.getElementById('pdfProgress');
        if (progressDiv) progressDiv.style.display = 'none';
        document.getElementById('sendPdfBtn').disabled = false;
        document.getElementById('cancelPdfBtn').disabled = false;
    }

    showNotification(title, message, type) {
        const bgColor = type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                        type === 'warning' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                        'linear-gradient(135deg, #ef4444, #dc2626)';
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 30px; right: 30px; z-index: 9999999;
            background: ${bgColor}; color: white; padding: 24px 32px;
            border-radius: 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.4);
            min-width: 380px; animation: slideIn 0.5s ease;
        `;
        
        const icon = type === 'success' ? '[CHECK]' : type === 'warning' ? '[WARNING]' : '[X]';
        
        notification.innerHTML = `
            <div style="display: flex; gap: 20px;">
                <div style="font-size: 32px;">${icon}</div>
                <div>
                    <div style="font-weight: 800; font-size: 18px; margin-bottom: 8px;">${title}</div>
                    <div style="font-size: 15px; opacity: 0.95;">${message}</div>
                </div>
            </div>
            <style>@keyframes slideIn { from { transform: translateX(500px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }</style>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s, transform 0.5s';
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(500px)';
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
}

// INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    window.pdfExporter = new BusinessPlanPDFExporter();
    console.log('Business Plan PDF Exporter v10.0 (No Emojis + Perfect Pagination) initialized');
});